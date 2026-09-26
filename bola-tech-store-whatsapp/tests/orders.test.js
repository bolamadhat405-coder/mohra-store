import test from 'node:test';
import assert from 'node:assert/strict';
import { placeOrder, setOrderStatus } from '../server/lib/orders.js';

// A tiny fake pg client: routes each SQL statement to a handler by pattern and records what was executed.
function fakeClient(handlers) {
  const log = [];
  return {
    log,
    async query(sql, params = []) {
      const s = sql.replace(/\s+/g, ' ').trim();
      log.push({ s, params });
      for (const [re, fn] of handlers) if (re.test(s)) return fn(params, s);
      throw new Error('unexpected SQL: ' + s.slice(0, 90));
    }
  };
}
const rows = (r = []) => ({ rows: r, rowCount: r.length });
const user = { id: 7 };

const baseHandlers = (cart, products, { stock = {}, coupon = null, uses = 0 } = {}) => [
  [/SELECT coupon_code FROM carts/, () => rows(coupon ? [{ coupon_code: coupon.code }] : [])],
  [/FROM coupons WHERE code = \$1 FOR UPDATE/, () => rows(coupon ? [coupon] : [])],
  [/FROM coupon_redemptions WHERE coupon_id/, () => rows([{ n: uses }])],
  [/UPDATE coupons SET used_count = used_count \+ 1/, () => ({ rows: [], rowCount: coupon && coupon.max_uses != null && coupon.used_count >= coupon.max_uses ? 0 : 1 })],
  [/INSERT INTO coupon_redemptions/, () => rows()],
  [/UPDATE carts SET coupon_code = NULL/, () => rows()],
  [/FROM carts c JOIN cart_items/, () => rows(cart)],
  [/FROM products WHERE id = ANY\(\$1::bigint\[\]\).*FOR UPDATE/, () => rows(products)],
  [/FROM services WHERE id = ANY/, () => rows([])],
  [/FROM addresses WHERE id/, (p) => rows(p[0] === 5 ? [{ full_name: 'Ali', phone: '0100', city: 'Cairo', area: '', street: 'Nile', building: '', notes: '' }] : [])],
  [/INSERT INTO orders/, (p) => rows([{ id: 100, subtotal: p[1], shipping: p[2], total: p[3], payment_method: p[6], discount: p[7], coupon_code: p[8], payment_ref: p[9] }])],
  [/INSERT INTO order_items/, () => rows([{}])],
  [/UPDATE products SET stock = stock/, (p) => ({ rows: [], rowCount: (stock[p[1]] ?? 999) >= p[0] ? 1 : 0 })],
  [/DELETE FROM cart_items/, () => rows()]
];

test('places an order: server-side prices, shipping rule, stock decrement, cart cleared', async () => {
  const c = fakeClient(baseHandlers(
    [{ product_id: 1, service_id: null, quantity: 2 }],
    [{ id: 1, name_ar: 'منتج', name_en: 'Item', price: 500, stock: 5, active: true }]
  ));
  const o = await placeOrder(c, user, { address_id: 5 });
  assert.equal(o.subtotal, 1000);
  assert.equal(o.shipping, 80);
  assert.equal(o.total, 1080);
  assert.ok(c.log.some((x) => /UPDATE products SET stock/.test(x.s)));
  assert.ok(c.log.some((x) => /DELETE FROM cart_items/.test(x.s)));
});

test('free shipping above the threshold', async () => {
  const c = fakeClient(baseHandlers(
    [{ product_id: 1, service_id: null, quantity: 1 }],
    [{ id: 1, name_ar: 'منتج', name_en: 'Item', price: 5000, stock: 5, active: true }]
  ));
  const o = await placeOrder(c, user, { address_id: 5 });
  assert.equal(o.shipping, 0);
  assert.equal(o.total, 5000);
});

test('rejects: empty cart, missing address, insufficient stock and inactive item', async () => {
  await assert.rejects(placeOrder(fakeClient(baseHandlers([], [])), user, {}), (e) => e.code === 'EMPTY_CART');

  const line = [{ product_id: 1, service_id: null, quantity: 3 }];
  const okProduct = [{ id: 1, name_ar: 'م', name_en: 'I', price: 10, stock: 9, active: true }];
  await assert.rejects(placeOrder(fakeClient(baseHandlers(line, okProduct)), user, {}), (e) => e.code === 'ADDRESS_REQUIRED');
  await assert.rejects(placeOrder(fakeClient(baseHandlers(line, okProduct)), user, { address_id: 999 }), (e) => e.code === 'ADDRESS_REQUIRED');

  const low = [{ id: 1, name_ar: 'م', name_en: 'I', price: 10, stock: 2, active: true }];
  await assert.rejects(placeOrder(fakeClient(baseHandlers(line, low)), user, { address_id: 5 }), (e) => e.status === 409 && e.code === 'OUT_OF_STOCK' && e.data.available === 2);

  const off = [{ id: 1, name_ar: 'م', name_en: 'I', price: 10, stock: 9, active: false }];
  await assert.rejects(placeOrder(fakeClient(baseHandlers(line, off)), user, { address_id: 5 }), (e) => e.code === 'ITEM_UNAVAILABLE');

});

test('a concurrent buyer taking the last unit makes the guarded UPDATE fail -> whole order aborts', async () => {
  const c = fakeClient(baseHandlers(
    [{ product_id: 1, service_id: null, quantity: 2 }],
    [{ id: 1, name_ar: 'م', name_en: 'I', price: 10, stock: 5, active: true }],
    { stock: { 1: 1 } }
  ));
  await assert.rejects(placeOrder(c, user, { address_id: 5 }), (e) => e.code === 'OUT_OF_STOCK');
});

test('cancel: restores stock once, only for pending orders of the owner', async () => {
  let status = 'pending';
  const mk = () => fakeClient([
    [/SELECT \* FROM orders WHERE id = \$1 FOR UPDATE/, () => rows([{ id: 3, user_id: 7, status, payment_method: 'whatsapp' }])],
    [/UPDATE products p SET stock/, () => rows([{}])],
    [/WITH d AS \(DELETE FROM coupon_redemptions/, () => rows()],
    [/UPDATE orders/, (p) => rows([{ id: 3, status: p[0] }])]
  ]);
  const c = mk();
  const o = await setOrderStatus(c, 3, 'cancelled', { userId: 7, onlyPending: true });
  assert.equal(o.status, 'cancelled');
  assert.equal(c.log.filter((x) => /UPDATE products p SET stock/.test(x.s)).length, 1);

  await assert.rejects(setOrderStatus(mk(), 3, 'cancelled', { userId: 8 }), (e) => e.status === 404); // someone else's order
  status = 'shipped';
  await assert.rejects(setOrderStatus(mk(), 3, 'cancelled', { userId: 7, onlyPending: true }), (e) => e.code === 'CANNOT_CANCEL');
  status = 'cancelled';
  await assert.rejects(setOrderStatus(mk(), 3, 'shipped'), (e) => e.code === 'ORDER_CANCELLED');
  await assert.rejects(setOrderStatus(mk(), 3, 'teleported'), (e) => e.code === 'BAD_STATUS');
});

const COUPON = { id: 5, code: 'SAVE10', type: 'percent', value: 10, min_total: 500, max_discount: 200, active: true, used_count: 0, max_uses: 100, per_user: 1 };
const oneItem = [{ product_id: 1, service_id: null, quantity: 2 }];
const prod = (price) => [{ id: 1, name_ar: 'م', name_en: 'I', price, stock: 9, active: true }];

test('coupon: percent discount (capped), applied before shipping, redemption recorded, cart coupon cleared', async () => {
  const c = fakeClient(baseHandlers(oneItem, prod(1000), { coupon: COUPON }));
  const o = await placeOrder(c, user, { address_id: 5 });
  assert.equal(o.discount, 200, '10% of 2000 = 200 (also the cap)');
  assert.equal(o.total, 2000 - 200 + 80); // shipping is still charged: 2000 < free-shipping threshold (measured before the coupon)
  assert.equal(o.coupon_code, 'SAVE10');
  assert.ok(c.log.some((x) => /INSERT INTO coupon_redemptions/.test(x.s)));
  assert.ok(c.log.some((x) => /UPDATE carts SET coupon_code = NULL/.test(x.s)));
});
test('coupon: rejected when expired / already used / below minimum / used up — the whole order aborts with the reason', async () => {
  const run = (coupon, uses = 0, price = 1000) => placeOrder(fakeClient(baseHandlers(oneItem, prod(price), { coupon, uses })), user, { address_id: 5 });
  await assert.rejects(run({ ...COUPON, expires_at: '2020-01-01' }), (e) => e.code === 'COUPON_EXPIRED');
  await assert.rejects(run(COUPON, 1), (e) => e.code === 'COUPON_USED');
  await assert.rejects(run({ ...COUPON, min_total: 5000 }), (e) => e.code === 'COUPON_MIN_TOTAL' && e.data.min === 5000);
  await assert.rejects(run({ ...COUPON, max_uses: 3, used_count: 3 }), (e) => e.code === 'COUPON_EXHAUSTED');
  await assert.rejects(run({ ...COUPON, active: false }), (e) => e.code === 'COUPON_INVALID');
});
test('WhatsApp is the only checkout channel', async () => {
  const c = fakeClient(baseHandlers(oneItem, prod(1000)));
  const o = await placeOrder(c, user, { address_id: 5, payment_method: 'bitcoin', payment_ref: 'ignored' }, { allowedMethods: ['whatsapp'] });
  assert.equal(o.payment_method, 'whatsapp');
  assert.equal(o.payment_ref, null);
});
test('cancelling an order gives the coupon use back', async () => {
  const c = fakeClient([
    [/SELECT \* FROM orders WHERE id = \$1 FOR UPDATE/, () => rows([{ id: 3, user_id: 7, status: 'pending', payment_method: 'whatsapp' }])],
    [/UPDATE products p SET stock/, () => rows()], [/WITH d AS \(DELETE FROM coupon_redemptions/, () => rows()], [/UPDATE orders/, (p) => rows([{ id: 3, status: p[0] }])]
  ]);
  await setOrderStatus(c, 3, 'cancelled', { userId: 7, onlyPending: true });
  assert.ok(c.log.some((x) => /DELETE FROM coupon_redemptions/.test(x.s)));
});
