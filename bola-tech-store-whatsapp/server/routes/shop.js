import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { q, tx, pool } from '../db.js';
import { optionalAuth, requireAuth, audit, destroyOtherSessions, clientIp } from '../auth.js';
import { getSite, invalidateCatalog, catalogCache } from '../lib/site.js';
import { publicUser } from '../lib/user.js';
import { passwordIssue } from '../lib/password.js';
import { CONFIG, publicConfig, paymentMethods } from '../lib/config.js';
import { couponDiscount, normalizeCode } from '../lib/coupons.js';
import { notify } from '../lib/notify.js';
import { HttpError } from '../lib/errors.js';
import { computeTotals } from '../lib/pricing.js';
import { placeOrder, setOrderStatus } from '../lib/orders.js';
import * as v from '../lib/validate.js';

const r = Router();
const body = (req) => req.body || {};
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;


const RATING_JOIN = `LEFT JOIN (SELECT product_id, AVG(rating) AS avg, COUNT(*) AS cnt FROM reviews GROUP BY product_id) rv ON rv.product_id = p.id`;
const PRODUCT_COLS = `p.*, COALESCE(rv.avg,0)::float8 AS rating, COALESCE(rv.cnt,0)::int AS review_count`;

/* ───────────── config & session ───────────── */
r.get('/config', async (_req, res) => {
  const { site, departments, banners } = await getSite();
  res.json({ ...publicConfig(), payment_methods: paymentMethods(site), site, departments, banners, chat_advanced: !!process.env.AI_API_KEY });
});

r.get('/session', optionalAuth, async (req, res) => {
  if (!req.user) return res.json({ user: null, cart_count: 0, wishlist: [], unread: 0 });
  const [c, w, u] = await Promise.all([
    q('SELECT COALESCE(SUM(ci.quantity),0)::int AS n FROM carts c JOIN cart_items ci ON ci.cart_id = c.id WHERE c.user_id = $1', [req.user.id]),
    q('SELECT product_id FROM wishlists WHERE user_id = $1', [req.user.id]),
    q('SELECT COUNT(*)::int AS n FROM user_notifications WHERE user_id = $1 AND NOT is_read', [req.user.id])
  ]);
  res.json({ user: publicUser(req.user), cart_count: c.rows[0].n, wishlist: w.rows.map((x) => x.product_id), unread: u.rows[0].n });
});

/* ───────────── catalog ───────────── */
r.get('/catalog', async (_req, res) => {
  if (catalogCache.data && Date.now() - catalogCache.at < 5000) return res.json(catalogCache.data);
  const [p, s] = await Promise.all([
    q(`SELECT ${PRODUCT_COLS}, COALESCE(sl.sold,0)::int AS sold FROM products p ${RATING_JOIN}
         LEFT JOIN (SELECT oi.product_id, SUM(oi.quantity) AS sold FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status <> 'cancelled' AND oi.product_id IS NOT NULL GROUP BY oi.product_id) sl ON sl.product_id = p.id
         LEFT JOIN departments d ON d.id = p.department_id WHERE p.active AND COALESCE(d.active, true) ORDER BY p.featured DESC, p.created_at DESC, p.id DESC`),
    q('SELECT * FROM services WHERE active ORDER BY featured DESC, created_at DESC, id DESC')
  ]);
  catalogCache.data = { products: p.rows, services: s.rows };
  catalogCache.at = Date.now();
  res.json(catalogCache.data);
});

// :key is a numeric id or a slug
r.get('/products/:key', async (req, res) => {
  const key = req.params.key;
  const byId = /^\d{1,15}$/.test(key);
  const row = (await q(`SELECT ${PRODUCT_COLS} FROM products p ${RATING_JOIN} LEFT JOIN departments d ON d.id = p.department_id WHERE p.active AND COALESCE(d.active, true) AND ${byId ? 'p.id = $1' : 'p.slug = $1'}`, [byId ? Number(key) : key])).rows[0];
  if (!row) throw new HttpError(404, 'NOT_FOUND');
  res.json({ product: row });
});

r.get('/services/:key', async (req, res) => {
  const key = req.params.key;
  const byId = /^\d{1,15}$/.test(key);
  const row = (await q(`SELECT * FROM services WHERE active AND ${byId ? 'id = $1' : 'slug = $1'}`, [byId ? Number(key) : key])).rows[0];
  if (!row) throw new HttpError(404, 'NOT_FOUND');
  res.json({ service: row });
});

/* ───────────── reviews ───────────── */
r.get('/products/:id/reviews', optionalAuth, async (req, res) => {
  const pid = v.id(req.params.id);
  const reviews = (
    await q(
      `SELECT r.id, r.rating, r.body, r.created_at, split_part(u.name, ' ', 1) AS author
         FROM reviews r JOIN users u ON u.id = r.user_id
        WHERE r.product_id = $1 ORDER BY r.created_at DESC LIMIT 50`,
      [pid]
    )
  ).rows;
  let canReview = false;
  let mine = null;
  if (req.user) {
    const [bought, own] = await Promise.all([
      q(`SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status <> 'cancelled' LIMIT 1`, [req.user.id, pid]),
      q('SELECT rating, body FROM reviews WHERE user_id = $1 AND product_id = $2', [req.user.id, pid])
    ]);
    canReview = !!bought.rows[0];
    mine = own.rows[0] || null;
  }
  res.json({ reviews, can_review: canReview, mine });
});

r.post('/reviews/:productId', requireAuth, async (req, res) => {
  const pid = v.id(req.params.productId, 'productId');
  const b = body(req);
  const rating = v.int(b.rating, { field: 'rating', min: 1, max: 5 });
  const text = v.str(b.body, { field: 'body', max: 1000 });
  const bought = await q(`SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status <> 'cancelled' LIMIT 1`, [req.user.id, pid]);
  if (!bought.rows[0]) throw new HttpError(403, 'PURCHASE_REQUIRED');
  await q(
    `INSERT INTO reviews(user_id,product_id,rating,body) VALUES($1,$2,$3,$4)
     ON CONFLICT (user_id,product_id) DO UPDATE SET rating = EXCLUDED.rating, body = EXCLUDED.body`,
    [req.user.id, pid, rating, text]
  );
  res.json({ ok: true });
});

/* ───────────── cart ───────────── */
async function cartSummary(userId, { ignoreCoupon = false } = {}) {
  const rows = (
    await q(
      `SELECT ci.id, ci.quantity, ci.product_id, ci.service_id,
              p.name_ar AS p_name_ar, p.name_en AS p_name_en, p.price AS p_price, p.stock AS p_stock, p.image_url AS p_image, p.active AS p_active, p.category AS p_cat,
              s.name_ar AS s_name_ar, s.name_en AS s_name_en, s.price AS s_price, s.image_url AS s_image, s.active AS s_active, s.category AS s_cat, s.duration AS s_duration
         FROM carts c
         JOIN cart_items ci ON ci.cart_id = c.id
         LEFT JOIN products p ON p.id = ci.product_id
         LEFT JOIN services s ON s.id = ci.service_id
        WHERE c.user_id = $1
        ORDER BY ci.id DESC`,
      [userId]
    )
  ).rows;

  const items = rows.map((x) =>
    x.product_id
      ? {
          id: x.id, kind: 'product', ref_id: x.product_id, name_ar: x.p_name_ar, name_en: x.p_name_en,
          category: x.p_cat, price: x.p_price, image_url: x.p_image, quantity: x.quantity, stock: x.p_stock,
          available: !!x.p_active && x.p_stock >= x.quantity, line_total: round2(x.p_price * x.quantity)
        }
      : {
          id: x.id, kind: 'service', ref_id: x.service_id, name_ar: x.s_name_ar, name_en: x.s_name_en,
          category: x.s_cat, price: x.s_price, image_url: x.s_image, quantity: x.quantity, stock: null,
          duration: x.s_duration, available: !!x.s_active, line_total: round2(x.s_price * x.quantity)
        }
  );
  const lines = items.filter((i) => i.available).map((i) => ({ price: i.price, quantity: i.quantity, physical: i.kind === 'product' }));
  let coupon = null;
  let couponRemoved = null;
  let discount = 0;
  if (!ignoreCoupon) {
    const cr = (await q('SELECT coupon_code FROM carts WHERE user_id = $1', [userId])).rows[0];
    if (cr?.coupon_code) {
      try {
        const r = await couponDiscount(pool, userId, cr.coupon_code, computeTotals(lines).subtotal);
        discount = r.discount;
        coupon = { code: r.coupon.code, type: r.coupon.type, value: r.coupon.value, discount };
      } catch (e) {
        if (!(e instanceof HttpError)) throw e;
        couponRemoved = e.code; // no longer valid (expired, cart shrank below the minimum...) — dropped, the customer is told
        await q('UPDATE carts SET coupon_code = NULL WHERE user_id = $1', [userId]);
      }
    }
  }
  return { items, ...computeTotals(lines, discount), coupon, coupon_removed: couponRemoved, has_issues: items.some((i) => !i.available) };
}

r.get('/cart', requireAuth, async (req, res) => res.json(await cartSummary(req.user.id)));

r.post('/cart/coupon', requireAuth, async (req, res) => {
  const code = normalizeCode(body(req).code);
  if (!code) throw new HttpError(400, 'INVALID_INPUT', { field: 'code' });
  const base = await cartSummary(req.user.id, { ignoreCoupon: true });
  if (!base.items.length) throw new HttpError(400, 'EMPTY_CART');
  await couponDiscount(pool, req.user.id, code, base.subtotal); // throws COUPON_* with the reason
  await q('UPDATE carts SET coupon_code = $1 WHERE user_id = $2', [code, req.user.id]);
  res.json(await cartSummary(req.user.id));
});
r.delete('/cart/coupon', requireAuth, async (req, res) => {
  await q('UPDATE carts SET coupon_code = NULL WHERE user_id = $1', [req.user.id]);
  res.json(await cartSummary(req.user.id));
});

r.post('/cart/items', requireAuth, async (req, res) => {
  const b = body(req);
  const productId = b.product_id ? v.id(b.product_id, 'product_id') : null;
  const serviceId = b.service_id ? v.id(b.service_id, 'service_id') : null;
  if (!!productId === !!serviceId) throw new HttpError(400, 'INVALID_ITEM');
  const qty = v.int(b.quantity, { field: 'quantity', min: 1, max: CONFIG.maxQty, def: 1 });

  await tx(async (c) => {
    const cart = (await c.query('INSERT INTO carts(user_id) VALUES($1) ON CONFLICT (user_id) DO UPDATE SET updated_at = now() RETURNING id', [req.user.id])).rows[0];
    if (productId) {
      const p = (
        await c.query('SELECT p.stock, d.purchase_mode FROM products p LEFT JOIN departments d ON d.id = p.department_id WHERE p.id = $1 AND p.active', [productId])
      ).rows[0];
      if (!p) throw new HttpError(404, 'NOT_FOUND');
      if (p.purchase_mode === 'inquiry') throw new HttpError(400, 'INQUIRY_ONLY'); // e.g. cars: the customer asks, the shop answers
      if (p.stock < 1) throw new HttpError(409, 'OUT_OF_STOCK');
      const cap = Math.min(CONFIG.maxQty, p.stock);
      // Adding the same product twice increases the quantity (never above stock).
      await c.query(
        `INSERT INTO cart_items(cart_id,product_id,quantity) VALUES($1,$2,LEAST($3::int,$4::int))
         ON CONFLICT (cart_id,product_id) WHERE product_id IS NOT NULL
         DO UPDATE SET quantity = LEAST(cart_items.quantity + $3::int, $4::int)`,
        [cart.id, productId, qty, cap]
      );
    } else {
      const s = (await c.query('SELECT 1 FROM services WHERE id = $1 AND active', [serviceId])).rows[0];
      if (!s) throw new HttpError(404, 'NOT_FOUND');
      await c.query(
        `INSERT INTO cart_items(cart_id,service_id,quantity) VALUES($1,$2,LEAST($3::int,$4::int))
         ON CONFLICT (cart_id,service_id) WHERE service_id IS NOT NULL
         DO UPDATE SET quantity = LEAST(cart_items.quantity + $3::int, $4::int)`,
        [cart.id, serviceId, qty, CONFIG.maxQty]
      );
    }
  });
  res.json(await cartSummary(req.user.id));
});

r.patch('/cart/items/:id', requireAuth, async (req, res) => {
  const itemId = v.id(req.params.id);
  const qty = v.int(body(req).quantity, { field: 'quantity', min: 1, max: CONFIG.maxQty });
  const u = await q(
    `UPDATE cart_items ci
        SET quantity = GREATEST(1, LEAST($1::int, COALESCE((SELECT stock FROM products WHERE id = ci.product_id), $2::int)))
       FROM carts c
      WHERE ci.id = $3 AND ci.cart_id = c.id AND c.user_id = $4`,
    [qty, CONFIG.maxQty, itemId, req.user.id]
  );
  if (!u.rowCount) throw new HttpError(404, 'NOT_FOUND');
  res.json(await cartSummary(req.user.id));
});

r.delete('/cart/items/:id', requireAuth, async (req, res) => {
  await q('DELETE FROM cart_items ci USING carts c WHERE ci.id = $1 AND ci.cart_id = c.id AND c.user_id = $2', [v.id(req.params.id), req.user.id]);
  res.json(await cartSummary(req.user.id));
});

/* ───────────── wishlist ───────────── */
const wishlistIds = async (uid) => (await q('SELECT product_id FROM wishlists WHERE user_id = $1', [uid])).rows.map((x) => x.product_id);

r.get('/wishlist', requireAuth, async (req, res) => {
  const items = (
    await q(`SELECT ${PRODUCT_COLS} FROM wishlists w JOIN products p ON p.id = w.product_id ${RATING_JOIN} WHERE w.user_id = $1 AND p.active ORDER BY w.id DESC`, [req.user.id])
  ).rows;
  res.json({ items });
});

r.post('/wishlist/:productId', requireAuth, async (req, res) => {
  const pid = v.id(req.params.productId, 'productId');
  const exists = await q('SELECT 1 FROM products WHERE id = $1 AND active', [pid]);
  if (!exists.rows[0]) throw new HttpError(404, 'NOT_FOUND');
  await q('INSERT INTO wishlists(user_id,product_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [req.user.id, pid]);
  res.json({ ok: true, wishlist: await wishlistIds(req.user.id) });
});

r.delete('/wishlist/:productId', requireAuth, async (req, res) => {
  await q('DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2', [req.user.id, v.id(req.params.productId, 'productId')]);
  res.json({ ok: true, wishlist: await wishlistIds(req.user.id) });
});

/* ───────────── account ───────────── */
const addressList = async (uid) => (await q('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id DESC', [uid])).rows;

r.get('/account', requireAuth, async (req, res) => {
  const [orders, wishlist, addresses] = await Promise.all([
    q(`SELECT o.*, (SELECT COUNT(*)::int FROM order_items WHERE order_id = o.id) AS items_count FROM orders o WHERE o.user_id = $1 ORDER BY o.created_at DESC, o.id DESC`, [req.user.id]),
    q(`SELECT ${PRODUCT_COLS} FROM wishlists w JOIN products p ON p.id = w.product_id ${RATING_JOIN} WHERE w.user_id = $1 AND p.active ORDER BY w.id DESC`, [req.user.id]),
    addressList(req.user.id)
  ]);
  res.json({ user: publicUser(req.user), orders: orders.rows, wishlist: wishlist.rows, addresses });
});

r.patch('/account/profile', requireAuth, async (req, res) => {
  const b = body(req);
  const name = b.name !== undefined ? v.str(b.name, { field: 'name', min: 2, max: 80 }) : null;
  const phone = b.phone !== undefined ? v.phone(b.phone, { optional: true }) : null;
  const avatar = b.avatar_url !== undefined ? v.url(b.avatar_url, { field: 'avatar_url' }) : null;
  const locale = b.locale === 'ar' || b.locale === 'en' ? b.locale : null;
  const u = (await q('UPDATE users SET name = COALESCE($1,name), phone = COALESCE($2,phone), avatar_url = COALESCE($3,avatar_url), locale = COALESCE($4,locale) WHERE id = $5 RETURNING *', [name, phone, avatar, locale, req.user.id])).rows[0];
  audit(req.user, 'PROFILE_UPDATE', 'user', req.user.id);
  res.json({ user: publicUser(u) });
});

r.post('/account/password', requireAuth, async (req, res) => {
  const b = body(req);
  const next = String(b.next ?? '');
  const issue = passwordIssue(next, { email: req.user.email, name: req.user.name });
  if (issue) throw new HttpError(400, 'WEAK_PASSWORD', { reason: issue });
  const u = (await q('SELECT password_hash FROM users WHERE id = $1', [req.user.id])).rows[0];
  if (!(await bcrypt.compare(String(b.current || '').slice(0, 200), u.password_hash))) throw new HttpError(401, 'INVALID_CREDENTIALS');
  await q('UPDATE users SET password_hash = $1 WHERE id = $2', [await bcrypt.hash(next, 12), req.user.id]);
  await destroyOtherSessions(req.user.id, req.user.sid); // a stolen session dies the moment the password changes
  audit(req.user, 'PASSWORD_CHANGE', 'user', req.user.id, { ip: clientIp(req) });
  res.json({ ok: true });
});

r.get('/account/addresses', requireAuth, async (req, res) => res.json({ addresses: await addressList(req.user.id) }));

r.post('/account/addresses', requireAuth, async (req, res) => {
  const a = v.parseAddress(body(req));
  const count = (await q('SELECT COUNT(*)::int AS n FROM addresses WHERE user_id = $1', [req.user.id])).rows[0].n;
  if (count >= 10) throw new HttpError(400, 'TOO_MANY_ADDRESSES');
  const makeDefault = a.is_default || count === 0;
  const created = await tx(async (c) => {
    if (makeDefault) await c.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    return (
      await c.query(
        `INSERT INTO addresses(user_id,label,full_name,phone,city,area,street,building,notes,is_default) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [req.user.id, a.label, a.full_name, a.phone, a.city, a.area, a.street, a.building, a.notes, makeDefault]
      )
    ).rows[0];
  });
  res.status(201).json({ address: created, addresses: await addressList(req.user.id) });
});

r.put('/account/addresses/:id', requireAuth, async (req, res) => {
  const aid = v.id(req.params.id);
  const a = v.parseAddress(body(req));
  await tx(async (c) => {
    if (a.is_default) await c.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    const u = await c.query(
      `UPDATE addresses SET label=$1, full_name=$2, phone=$3, city=$4, area=$5, street=$6, building=$7, notes=$8, is_default = $9 OR is_default
        WHERE id = $10 AND user_id = $11`,
      [a.label, a.full_name, a.phone, a.city, a.area, a.street, a.building, a.notes, a.is_default, aid, req.user.id]
    );
    if (!u.rowCount) throw new HttpError(404, 'NOT_FOUND');
  });
  res.json({ addresses: await addressList(req.user.id) });
});

r.delete('/account/addresses/:id', requireAuth, async (req, res) => {
  await q('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [v.id(req.params.id), req.user.id]);
  // keep exactly one default if any address remains
  await q(`UPDATE addresses SET is_default = true WHERE id = (SELECT id FROM addresses WHERE user_id = $1 ORDER BY id DESC LIMIT 1) AND NOT EXISTS (SELECT 1 FROM addresses WHERE user_id = $1 AND is_default)`, [req.user.id]);
  res.json({ addresses: await addressList(req.user.id) });
});

/* ───────────── orders ───────────── */
r.get('/orders/:id', requireAuth, async (req, res) => {
  const oid = v.id(req.params.id);
  const order = (await q('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [oid, req.user.id])).rows[0];
  if (!order) throw new HttpError(404, 'NOT_FOUND');
  const items = (await q('SELECT oi.*, p.image_url FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id = $1 ORDER BY oi.id', [oid])).rows;
  res.json({ order, items });
});

r.post('/orders', requireAuth, async (req, res) => {
  const { site } = await getSite();
  const orderWhatsapp = String(site.order_whatsapp || site.whatsapp || '').replace(/\D/g, '');
  if (!orderWhatsapp) throw new HttpError(503, 'WHATSAPP_NOT_CONFIGURED');
  const order = await tx((c) => placeOrder(c, req.user, { ...body(req), payment_method: 'whatsapp' }, { allowedMethods: paymentMethods(site) }));
  const items = (await q(`SELECT title, title_en, quantity, unit_price FROM order_items WHERE order_id = $1 ORDER BY id`, [order.id])).rows;
  const lines = items.map((i) => `• ${i.title} × ${i.quantity} = ${Number(i.unit_price) * Number(i.quantity)} ج.م`);
  const address = order.address_json || {};
  const addressLine = [address.city, address.area, address.street, address.building].filter(Boolean).join('، ');
  const message = [
    `طلب جديد من BOLA TECH`,
    `رقم الطلب: #${order.id}`,
    address.full_name ? `الاسم: ${address.full_name}` : '',
    '',
    ...lines,
    '',
    `الإجمالي: ${order.total} ج.م`,
    addressLine ? `العنوان: ${addressLine}` : 'الخدمة/الطلب بدون عنوان شحن',
    address.phone ? `الهاتف: ${address.phone}` : '',
    order.notes ? `ملاحظات: ${order.notes}` : ''
  ].filter(Boolean).join('\n');
  const whatsapp = `https://wa.me/${orderWhatsapp}?text=${encodeURIComponent(message)}`;
  invalidateCatalog();
  audit(req.user, 'ORDER_CREATED', 'order', order.id, { total: order.total, channel: 'whatsapp' });
  await notify(pool, req.user.id, { kind: 'order', title_ar: `تم تجهيز طلبك #${order.id}`, title_en: `Your order #${order.id} is ready`, body_ar: 'اضغط واتساب لإرسال تفاصيل الطلب للمتجر.', body_en: 'Open WhatsApp to send the order details to the store.', link: '/account.html#orders' });
  res.status(201).json({ order, whatsapp_url: whatsapp, whatsapp_message: message });
});

r.post('/orders/:id/cancel', requireAuth, async (req, res) => {
  const oid = v.id(req.params.id);
  const order = await tx((c) => setOrderStatus(c, oid, 'cancelled', { userId: req.user.id, onlyPending: true }));
  invalidateCatalog();
  audit(req.user, 'ORDER_CANCELLED_BY_USER', 'order', oid);
  res.json({ order });
});

/* ───────────── notifications (the bell) ───────────── */
r.get('/notifications', requireAuth, async (req, res) => {
  const [items, unread] = await Promise.all([
    q('SELECT id, kind, title_ar, title_en, body_ar, body_en, link, is_read, created_at FROM user_notifications WHERE user_id = $1 ORDER BY id DESC LIMIT 20', [req.user.id]),
    q('SELECT COUNT(*)::int AS n FROM user_notifications WHERE user_id = $1 AND NOT is_read', [req.user.id])
  ]);
  res.json({ items: items.rows, unread: unread.rows[0].n });
});
r.post('/notifications/read', requireAuth, async (req, res) => {
  await q('UPDATE user_notifications SET is_read = true WHERE user_id = $1 AND NOT is_read', [req.user.id]);
  res.json({ ok: true, unread: 0 });
});

/* ───────────── inquiries (cars, real-estate style items: "ask about this") ───────────── */
r.post('/inquiries', optionalAuth, async (req, res) => {
  const b = body(req);
  if (b.website) throw new HttpError(400, 'INVALID_INPUT'); // honeypot
  const i = v.parseInquiry(b);
  const pid = v.id(b.product_id, 'product_id');
  const p = (await q('SELECT id FROM products WHERE id = $1 AND active', [pid])).rows[0];
  if (!p) throw new HttpError(404, 'NOT_FOUND');
  await q('INSERT INTO inquiries(product_id,user_id,name,phone,message) VALUES($1,$2,$3,$4,$5)', [pid, req.user?.id || null, i.name, i.phone, i.message]);
  res.status(201).json({ ok: true });
});

export default r;
