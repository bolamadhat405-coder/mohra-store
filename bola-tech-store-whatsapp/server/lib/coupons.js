import { HttpError } from './errors.js';
import { str, money, int } from './validate.js';

export const normalizeCode = (c) => String(c || '').trim().toUpperCase().replace(/\s+/g, '');

/** Pure rules: throws HttpError(COUPON_*) or returns the discount amount (never more than the subtotal). */
export function evaluateCoupon(c, { subtotal, userUses = 0, now = new Date() }) {
  if (!c || !c.active) throw new HttpError(400, 'COUPON_INVALID');
  if (c.starts_at && new Date(c.starts_at) > now) throw new HttpError(400, 'COUPON_NOT_STARTED');
  if (c.expires_at && new Date(c.expires_at) < now) throw new HttpError(400, 'COUPON_EXPIRED');
  if (c.max_uses != null && c.used_count >= c.max_uses) throw new HttpError(400, 'COUPON_EXHAUSTED');
  if (userUses >= (c.per_user ?? 1)) throw new HttpError(400, 'COUPON_USED');
  if (subtotal < Number(c.min_total || 0)) throw new HttpError(400, 'COUPON_MIN_TOTAL', { min: Number(c.min_total) });
  let d = c.type === 'fixed' ? Number(c.value) : (subtotal * Number(c.value)) / 100;
  if (c.type !== 'fixed' && c.max_discount != null) d = Math.min(d, Number(c.max_discount));
  return Math.round(Math.min(d, subtotal) * 100) / 100;
}

// db = anything with .query (pool or transaction client). lock=true inside a transaction to stop two orders racing on the last use.
export async function couponDiscount(db, userId, code, subtotal, { lock = false } = {}) {
  const c = (await db.query(`SELECT * FROM coupons WHERE code = $1${lock ? ' FOR UPDATE' : ''}`, [normalizeCode(code)])).rows[0];
  const uses = c ? (await db.query('SELECT COUNT(*)::int AS n FROM coupon_redemptions WHERE coupon_id = $1 AND user_id = $2', [c.id, userId])).rows[0].n : 0;
  return { coupon: c, discount: evaluateCoupon(c, { subtotal, userUses: uses }) };
}

const dateOrNull = (v, field) => {
  if (v === undefined || v === null || v === '') return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new HttpError(400, 'INVALID_INPUT', { field });
  return d.toISOString();
};

export function parseCoupon(b = {}) {
  const code = normalizeCode(b.code);
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) throw new HttpError(400, 'INVALID_INPUT', { field: 'code' });
  const type = b.type === 'fixed' ? 'fixed' : 'percent';
  const value = money(b.value, { field: 'value', min: 0.01, max: type === 'percent' ? 100 : 10_000_000 });
  return {
    code, type, value,
    min_total: money(b.min_total ?? 0, { field: 'min_total', min: 0 }),
    max_discount: type === 'percent' ? money(b.max_discount, { field: 'max_discount', optional: true, min: 0.01 }) : null,
    starts_at: dateOrNull(b.starts_at, 'starts_at'),
    expires_at: dateOrNull(b.expires_at, 'expires_at'),
    max_uses: b.max_uses === '' || b.max_uses == null ? null : int(b.max_uses, { field: 'max_uses', min: 1, max: 10_000_000 }),
    per_user: int(b.per_user ?? 1, { field: 'per_user', min: 1, max: 1000, def: 1 }),
    active: b.active !== false
  };
}
void str;
