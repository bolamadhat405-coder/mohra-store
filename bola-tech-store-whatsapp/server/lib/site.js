import { q } from '../db.js';

// Public store settings + departments (with their custom fields). Cached for 30 s; admin writes call invalidateSite().
export const SITE_DEFAULTS = { name: 'BOLA TECH', tagline: '', phone: '', whatsapp: '', order_whatsapp: '', email: '', address: '', announcement: '', brand_color: '#0f6b5c', delivery_estimate: '', support_hours: '', return_policy: '', shipping_policy: '', logo_url: '', wallet_enabled: false, wallet_note: '' };
let cache = { at: 0, data: null };
export const catalogCache = { at: 0, data: null };
export const invalidateCatalog = () => { catalogCache.at = 0; };
export const invalidateSite = () => { cache = { at: 0, data: null }; invalidateCatalog(); };

export async function getSite() {
  if (cache.data && Date.now() - cache.at < 30000) return cache.data;
  const [s, d, f, bn] = await Promise.all([
    q(`SELECT value FROM settings WHERE key = 'site'`),
    q('SELECT * FROM departments WHERE active ORDER BY sort_order, id'),
    q('SELECT * FROM department_fields WHERE active ORDER BY sort_order, id'),
    q('SELECT * FROM banners WHERE active ORDER BY sort_order, id')
  ]);
  const byDept = new Map();
  for (const x of f.rows) (byDept.get(x.department_id) || byDept.set(x.department_id, []).get(x.department_id)).push(x);
  const data = {
    site: { ...SITE_DEFAULTS, ...(s.rows[0]?.value || {}) },
    departments: d.rows.map((x) => ({ ...x, fields: byDept.get(x.id) || [] })),
    banners: bn.rows
  };
  cache = { at: Date.now(), data };
  return data;
}
