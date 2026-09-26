import { HttpError } from './errors.js';
import { CONFIG } from './config.js';
import { computeTotals } from './pricing.js';
import { couponDiscount } from './coupons.js';

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// Turns the user's cart into an order. MUST run inside tx(): stock rows are locked until COMMIT.
export async function placeOrder(client, user, body = {}, { allowedMethods = CONFIG.paymentMethods } = {}) {
  const paymentMethod = 'whatsapp';
  if (!allowedMethods.includes(paymentMethod)) {
    throw new HttpError(400, 'INVALID_INPUT', { field: 'payment_method' });
  }
  const paymentRef = null;

  const cart = await client.query(
    `SELECT ci.product_id, ci.service_id, ci.quantity
       FROM carts c JOIN cart_items ci ON ci.cart_id = c.id
      WHERE c.user_id = $1
      ORDER BY ci.id`,
    [user.id]
  );
  const lines = cart.rows;
  if (!lines.length) throw new HttpError(400, 'EMPTY_CART');

  const productIds = lines.filter((l) => l.product_id).map((l) => l.product_id).sort((a, b) => a - b);
  const serviceIds = lines.filter((l) => l.service_id).map((l) => l.service_id);

  // FOR UPDATE on the product rows themselves (ordered by id to avoid deadlocks):
  // two customers can no longer buy the same last unit at the same time.
  const products = productIds.length
    ? (
        await client.query(
          'SELECT id,name_ar,name_en,price,stock,active FROM products WHERE id = ANY($1::bigint[]) ORDER BY id FOR UPDATE',
          [productIds]
        )
      ).rows
    : [];
  const services = serviceIds.length
    ? (
        await client.query('SELECT id,name_ar,name_en,price,active FROM services WHERE id = ANY($1::bigint[])', [
          serviceIds
        ])
      ).rows
    : [];
  const productById = new Map(products.map((p) => [p.id, p]));
  const serviceById = new Map(services.map((s) => [s.id, s]));

  const items = [];
  for (const l of lines) {
    if (l.product_id) {
      const p = productById.get(l.product_id);
      if (!p || !p.active) throw new HttpError(409, 'ITEM_UNAVAILABLE', { item: p?.name_ar || '', item_en: p?.name_en || '' });
      if (p.stock < l.quantity) {
        throw new HttpError(409, 'OUT_OF_STOCK', { item: p.name_ar, item_en: p.name_en, available: p.stock });
      }
      items.push({ product_id: p.id, service_id: null, title: p.name_ar, title_en: p.name_en, price: p.price, quantity: l.quantity, physical: true });
    } else {
      const s = serviceById.get(l.service_id);
      if (!s || !s.active) throw new HttpError(409, 'ITEM_UNAVAILABLE', { item: s?.name_ar || '', item_en: s?.name_en || '' });
      items.push({ product_id: null, service_id: s.id, title: s.name_ar, title_en: s.name_en, price: s.price, quantity: l.quantity, physical: false });
    }
  }

  const base = computeTotals(items);

  // Coupon: re-checked under a row lock, so two customers cannot both use the last redemption.
  let discount = 0;
  let coupon = null;
  const cr = (await client.query('SELECT coupon_code FROM carts WHERE user_id = $1', [user.id])).rows[0];
  if (cr?.coupon_code) {
    const r = await couponDiscount(client, user.id, cr.coupon_code, base.subtotal, { lock: true });
    discount = r.discount;
    coupon = r.coupon;
  }
  const totals = computeTotals(items, discount);

  // Delivery address is only required when there is something to ship.
  let address = {};
  if (totals.has_physical) {
    if (!body.address_id) throw new HttpError(400, 'ADDRESS_REQUIRED');
    const a = (await client.query('SELECT * FROM addresses WHERE id=$1 AND user_id=$2', [Number(body.address_id), user.id])).rows[0];
    if (!a) throw new HttpError(400, 'ADDRESS_REQUIRED');
    address = { full_name: a.full_name, phone: a.phone, city: a.city, area: a.area, street: a.street, building: a.building, notes: a.notes };
  }

  const notes = String(body.notes || '').trim().slice(0, 500);
  const order = (
    await client.query(
      `INSERT INTO orders(user_id,subtotal,shipping,total,address_json,notes,payment_method,discount,coupon_code,payment_ref)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [user.id, totals.subtotal, totals.shipping, totals.total, JSON.stringify(address), notes, paymentMethod, totals.discount, coupon ? coupon.code : null, null]
    )
  ).rows[0];

  for (const it of items) {
    await client.query(
      `INSERT INTO order_items(order_id,product_id,service_id,title,title_en,quantity,unit_price)
       VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [order.id, it.product_id, it.service_id, it.title, it.title_en, it.quantity, it.price]
    );
    if (it.product_id) {
      // Belt and braces: the WHERE clause guarantees stock can never go negative.
      const u = await client.query('UPDATE products SET stock = stock - $1::int, updated_at = now() WHERE id = $2 AND stock >= $1::int', [
        it.quantity,
        it.product_id
      ]);
      if (u.rowCount !== 1) throw new HttpError(409, 'OUT_OF_STOCK', { item: it.title, item_en: it.title_en });
    }
  }

  if (coupon) {
    const used = await client.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = $1 AND (max_uses IS NULL OR used_count < max_uses)', [coupon.id]);
    if (used.rowCount !== 1) throw new HttpError(400, 'COUPON_EXHAUSTED');
    await client.query('INSERT INTO coupon_redemptions(coupon_id,user_id,order_id) VALUES($1,$2,$3)', [coupon.id, user.id, order.id]);
  }
  await client.query('DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)', [user.id]);
  await client.query('UPDATE carts SET coupon_code = NULL WHERE user_id = $1', [user.id]);
  return order;
}

async function restoreStock(client, orderId) {
  await client.query(
    `UPDATE products p SET stock = p.stock + s.qty, updated_at = now()
       FROM (SELECT product_id, SUM(quantity)::int AS qty
               FROM order_items
              WHERE order_id = $1 AND product_id IS NOT NULL
              GROUP BY product_id) s
      WHERE p.id = s.product_id`,
    [orderId]
  );
}

// Changes an order's status. MUST run inside tx().
//  - cancelling gives the stock back (once — the order row is locked while we work)
//  - a cancelled order can never be re-opened
//  - WhatsApp orders remain unpaid until the store confirms payment/delivery
export async function setOrderStatus(client, orderId, status, { userId = null, onlyPending = false } = {}) {
  if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, 'BAD_STATUS');
  const o = (await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId])).rows[0];
  if (!o || (userId !== null && o.user_id !== userId)) throw new HttpError(404, 'NOT_FOUND');
  if (onlyPending && o.status !== 'pending') throw new HttpError(409, 'CANNOT_CANCEL');
  if (o.status === status) return o;
  if (o.status === 'cancelled') throw new HttpError(409, 'ORDER_CANCELLED');
  if (status === 'cancelled') {
    await restoreStock(client, orderId);
    // give the coupon use back, so a cancelled order does not burn the customer's (or the shop's) redemption
    await client.query(
      `WITH d AS (DELETE FROM coupon_redemptions WHERE order_id = $1 RETURNING coupon_id)
       UPDATE coupons c SET used_count = GREATEST(0, c.used_count - 1) FROM d WHERE c.id = d.coupon_id`,
      [orderId]
    );
  }
  const r = await client.query(
    `UPDATE orders
        SET status = $1::text,
            payment_status = CASE WHEN $1::text = 'delivered' AND payment_method = 'whatsapp' THEN 'paid' ELSE payment_status END,
            updated_at = now()
      WHERE id = $2 RETURNING *`,
    [status, orderId]
  );
  return r.rows[0];
}
