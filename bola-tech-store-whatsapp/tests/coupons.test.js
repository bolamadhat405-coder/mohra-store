import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCoupon, parseCoupon, normalizeCode } from '../server/lib/coupons.js';

const base = { active: true, type: 'percent', value: 10, min_total: 0, max_discount: null, used_count: 0, max_uses: null, per_user: 1 };
test('percent / fixed / cap / never above the subtotal', () => {
  assert.equal(evaluateCoupon(base, { subtotal: 1000 }), 100);
  assert.equal(evaluateCoupon({ ...base, max_discount: 50 }, { subtotal: 1000 }), 50);
  assert.equal(evaluateCoupon({ ...base, type: 'fixed', value: 300 }, { subtotal: 1000 }), 300);
  assert.equal(evaluateCoupon({ ...base, type: 'fixed', value: 300 }, { subtotal: 120 }), 120);
});
test('rules: dates, minimum, total uses, per-customer uses', () => {
  const now = new Date('2026-06-01');
  assert.throws(() => evaluateCoupon({ ...base, starts_at: '2026-07-01' }, { subtotal: 10, now }), (e) => e.code === 'COUPON_NOT_STARTED');
  assert.throws(() => evaluateCoupon({ ...base, expires_at: '2026-05-01' }, { subtotal: 10, now }), (e) => e.code === 'COUPON_EXPIRED');
  assert.throws(() => evaluateCoupon({ ...base, min_total: 500 }, { subtotal: 100 }), (e) => e.code === 'COUPON_MIN_TOTAL');
  assert.throws(() => evaluateCoupon({ ...base, max_uses: 2, used_count: 2 }, { subtotal: 100 }), (e) => e.code === 'COUPON_EXHAUSTED');
  assert.throws(() => evaluateCoupon(base, { subtotal: 100, userUses: 1 }), (e) => e.code === 'COUPON_USED');
  assert.equal(evaluateCoupon({ ...base, per_user: 3 }, { subtotal: 100, userUses: 2 }), 10);
  assert.throws(() => evaluateCoupon(undefined, { subtotal: 1 }), (e) => e.code === 'COUPON_INVALID');
});
test('admin input: codes are upper-cased, values validated, percent capped at 100', () => {
  assert.equal(normalizeCode(' save 10 '), 'SAVE10');
  const c = parseCoupon({ code: 'eid-2026', type: 'percent', value: '15', min_total: '300', max_discount: '100', expires_at: '2026-12-31', max_uses: '50' });
  assert.equal(c.code, 'EID-2026'); assert.equal(c.value, 15); assert.equal(c.max_uses, 50); assert.equal(c.per_user, 1);
  assert.throws(() => parseCoupon({ code: 'x', value: 5 }), (e) => e.data.field === 'code');
  assert.throws(() => parseCoupon({ code: 'ABC', type: 'percent', value: 150 }), (e) => e.data.field === 'value');
  assert.throws(() => parseCoupon({ code: 'ABC', value: 0 }), (e) => e.data.field === 'value');
  assert.throws(() => parseCoupon({ code: 'ABC', value: 5, expires_at: 'not a date' }), (e) => e.data.field === 'expires_at');
  assert.equal(parseCoupon({ code: 'ABC', type: 'fixed', value: 50, max_discount: 10 }).max_discount, null);
});
