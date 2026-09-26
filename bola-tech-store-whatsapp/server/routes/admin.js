import { Router } from 'express';
import { q, tx } from '../db.js';
import { requireAdmin, audit, destroyAllSessions, clientIp } from '../auth.js';
import { invalidateSite, invalidateCatalog, getSite, SITE_DEFAULTS } from '../lib/site.js';
import { parseCoupon } from '../lib/coupons.js';
import { notify, STATUS_TEXT } from '../lib/notify.js';
import { cleanAttributes, parseDepartment, parseFieldDef } from '../lib/attributes.js';
import { CONFIG } from '../lib/config.js';
import { HttpError } from '../lib/errors.js';
import { setOrderStatus, ORDER_STATUSES } from '../lib/orders.js';
import * as v from '../lib/validate.js';

const r = Router();
r.use(requireAdmin);
// any write may change what the storefront shows (stock, prices, visibility): drop the short-lived catalog cache afterwards
r.use((req, res, next) => { if (req.method !== 'GET' && res.on) res.on('finish', invalidateCatalog); next(); });
const body = (req) => req.body || {};

// Picks a free slug: "my-item", "my-item-2", "my-item-3" ...
async function uniqueSlug(table, wanted, fallbackName) {
  const base = wanted || v.slugify(fallbackName) || `item-${Date.now().toString(36)}`;
  for (let i = 1; i <= 30; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    const hit = await q(`SELECT 1 FROM ${table} WHERE slug = $1`, [candidate]);
    if (!hit.rows[0]) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/* ───────────── overview ───────────── */
r.get('/overview', async (_req, res) => {
  const [users, products, services, orders, reviews, recent, low, sales, inq] = await Promise.all([
    q(`SELECT COUNT(*)::int AS n FROM users`),
    q(`SELECT COUNT(*)::int AS n, COALESCE(SUM(stock),0)::int AS stock FROM products WHERE active`),
    q(`SELECT COUNT(*)::int AS n FROM services WHERE active`),
    q(`SELECT COUNT(*)::int AS n,
              COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'),0) AS revenue,
              COUNT(*) FILTER (WHERE status = 'pending')::int AS pending
         FROM orders`),
    q(`SELECT COUNT(*)::int AS n FROM reviews`),
    q(`SELECT o.id, o.status, o.total, o.created_at, u.name FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.id DESC LIMIT 6`),
    q(`SELECT id, name_ar, name_en, stock FROM products WHERE active AND stock <= $1 ORDER BY stock ASC, id DESC LIMIT 8`, [CONFIG.lowStock]),
    q(`SELECT to_char(created_at, 'YYYY-MM-DD') AS day, SUM(total) AS total
         FROM orders WHERE status <> 'cancelled' AND created_at > now() - interval '7 days'
        GROUP BY 1 ORDER BY 1`),
    q(`SELECT COUNT(*)::int AS n FROM inquiries WHERE status = 'new'`)
  ]);
  res.json({
    users: users.rows[0].n,
    products: products.rows[0].n,
    stock: products.rows[0].stock,
    services: services.rows[0].n,
    orders: orders.rows[0].n,
    revenue: orders.rows[0].revenue,
    pending: orders.rows[0].pending,
    reviews: reviews.rows[0].n,
    recent_orders: recent.rows,
    low_stock: low.rows,
    sales_7d: sales.rows,
    new_inquiries: inq.rows[0].n
  });
});

/* ───────────── products ───────────── */
r.get('/products', async (_req, res) => res.json({ items: (await q('SELECT * FROM products ORDER BY id DESC')).rows }));

async function departmentWithFields(id) {
  const d = (await q('SELECT * FROM departments WHERE id = $1', [id])).rows[0];
  if (!d) throw new HttpError(400, 'INVALID_INPUT', { field: 'department_id' });
  const fields = (await q('SELECT * FROM department_fields WHERE department_id = $1 AND active ORDER BY sort_order, id', [id])).rows;
  return { d, fields };
}
// Product body -> validated row values (department, its custom fields, gallery).
async function productFromBody(b) {
  const p = v.parseProduct(b);
  const { fields } = await departmentWithFields(v.id(b.department_id, 'department_id'));
  return { ...p, department_id: Number(b.department_id), attributes: cleanAttributes(fields, b.attributes) };
}

r.post('/products', async (req, res) => {
  const p = await productFromBody(body(req));
  const slug = await uniqueSlug('products', p.slug, p.name_en);
  const item = (
    await q(
      `INSERT INTO products(name_ar,name_en,slug,description_ar,description_en,category,price,old_price,stock,image_url,images,active,featured,department_id,attributes)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [p.name_ar, p.name_en, slug, p.description_ar, p.description_en, p.category, p.price, p.old_price, p.stock, p.image_url, JSON.stringify(p.images), p.active, p.featured, p.department_id, JSON.stringify(p.attributes)]
    )
  ).rows[0];
  audit(req.user, 'CREATE', 'product', item.id);
  res.status(201).json({ item });
});

r.put('/products/:id', async (req, res) => {
  const pid = v.id(req.params.id);
  const p = await productFromBody(body(req));
  const current = (await q('SELECT slug FROM products WHERE id = $1', [pid])).rows[0];
  if (!current) throw new HttpError(404, 'NOT_FOUND');
  const slug = p.slug || current.slug; // never silently change an existing URL
  const item = (
    await q(
      `UPDATE products SET name_ar=$1, name_en=$2, slug=$3, description_ar=$4, description_en=$5, category=$6,
              price=$7, old_price=$8, stock=$9, image_url=$10, images=$11, active=$12, featured=$13, department_id=$14, attributes=$15, updated_at=now()
        WHERE id=$16 RETURNING *`,
      [p.name_ar, p.name_en, slug, p.description_ar, p.description_en, p.category, p.price, p.old_price, p.stock, p.image_url, JSON.stringify(p.images), p.active, p.featured, p.department_id, JSON.stringify(p.attributes), pid]
    )
  ).rows[0];
  audit(req.user, 'UPDATE', 'product', pid);
  res.json({ item });
});

// "Delete" = archive, so old orders keep working.
r.delete('/products/:id', async (req, res) => {
  const pid = v.id(req.params.id);
  await q('UPDATE products SET active = false, updated_at = now() WHERE id = $1', [pid]);
  audit(req.user, 'ARCHIVE', 'product', pid);
  res.json({ ok: true });
});

/* ───────────── services ───────────── */
r.get('/services', async (_req, res) => res.json({ items: (await q('SELECT * FROM services ORDER BY id DESC')).rows }));

r.post('/services', async (req, res) => {
  const s = v.parseService(body(req));
  const slug = await uniqueSlug('services', s.slug, s.name_en);
  const item = (
    await q(
      `INSERT INTO services(name_ar,name_en,slug,description_ar,description_en,category,price,duration,image_url,active,featured)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [s.name_ar, s.name_en, slug, s.description_ar, s.description_en, s.category, s.price, s.duration, s.image_url, s.active, s.featured]
    )
  ).rows[0];
  audit(req.user, 'CREATE', 'service', item.id);
  res.status(201).json({ item });
});

r.put('/services/:id', async (req, res) => {
  const sid = v.id(req.params.id);
  const s = v.parseService(body(req));
  const current = (await q('SELECT slug FROM services WHERE id = $1', [sid])).rows[0];
  if (!current) throw new HttpError(404, 'NOT_FOUND');
  const item = (
    await q(
      `UPDATE services SET name_ar=$1, name_en=$2, slug=$3, description_ar=$4, description_en=$5, category=$6,
              price=$7, duration=$8, image_url=$9, active=$10, featured=$11, updated_at=now()
        WHERE id=$12 RETURNING *`,
      [s.name_ar, s.name_en, s.slug || current.slug, s.description_ar, s.description_en, s.category, s.price, s.duration, s.image_url, s.active, s.featured, sid]
    )
  ).rows[0];
  audit(req.user, 'UPDATE', 'service', sid);
  res.json({ item });
});

r.delete('/services/:id', async (req, res) => {
  const sid = v.id(req.params.id);
  await q('UPDATE services SET active = false, updated_at = now() WHERE id = $1', [sid]);
  audit(req.user, 'ARCHIVE', 'service', sid);
  res.json({ ok: true });
});

/* ───────────── orders ───────────── */
r.get('/orders', async (req, res) => {
  const status = ORDER_STATUSES.includes(req.query.status) ? req.query.status : null;
  const rows = (
    await q(
      `SELECT o.*, u.name, u.email, (SELECT COUNT(*)::int FROM order_items WHERE order_id = o.id) AS items_count
         FROM orders o LEFT JOIN users u ON u.id = o.user_id
        WHERE ($1::text IS NULL OR o.status = $1::text)
        ORDER BY o.id DESC LIMIT 500`,
      [status]
    )
  ).rows;
  res.json({ items: rows });
});

r.get('/orders/:id', async (req, res) => {
  const oid = v.id(req.params.id);
  const order = (await q('SELECT o.*, u.name, u.email, u.phone AS user_phone FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE o.id = $1', [oid])).rows[0];
  if (!order) throw new HttpError(404, 'NOT_FOUND');
  const items = (await q('SELECT oi.*, p.image_url FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id = $1 ORDER BY oi.id', [oid])).rows;
  res.json({ order, items });
});

r.patch('/orders/:id', async (req, res) => {
  const oid = v.id(req.params.id);
  const status = String(body(req).status || '');
  const order = await tx((c) => setOrderStatus(c, oid, status));
  audit(req.user, 'STATUS_CHANGE', 'order', oid, { status });
  if (STATUS_TEXT[status]) await notify({ query: q }, order.user_id, { kind: 'order', title_ar: `${STATUS_TEXT[status][0]} #${oid}`, title_en: `${STATUS_TEXT[status][1]} #${oid}`, link: '/account.html#orders' });
  res.json({ order });
});

/* ───────────── users & audit ───────────── */
r.get('/users', async (_req, res) => {
  const items = (
    await q(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at, u.is_active, u.totp_enabled,
              (SELECT COUNT(*)::int FROM orders WHERE user_id = u.id) AS orders_count
         FROM users u ORDER BY u.id DESC LIMIT 500`
    )
  ).rows;
  res.json({ items });
});

r.get('/audit', async (_req, res) => {
  const items = (await q(`SELECT a.*, u.email FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT 300`)).rows;
  res.json({ items });
});

/* ───────────── departments & custom fields ───────────── */
r.get('/departments', async (_req, res) => {
  const [d, f] = await Promise.all([
    q('SELECT d.*, (SELECT COUNT(*)::int FROM products WHERE department_id = d.id) AS products_count FROM departments d ORDER BY d.sort_order, d.id'),
    q('SELECT * FROM department_fields ORDER BY sort_order, id')
  ]);
  res.json({ items: d.rows.map((x) => ({ ...x, fields: f.rows.filter((y) => y.department_id === x.id) })) });
});

// One save = the department + its complete list of fields (added / edited / removed / re-ordered).
async function saveDepartment(req, res, id) {
  const b = body(req);
  const d = parseDepartment(b);
  const rawFields = Array.isArray(b.fields) ? b.fields.slice(0, 40) : [];
  const fields = rawFields.map((f, i) => parseFieldDef(f, i));
  if (new Set(fields.map((f) => f.key)).size !== fields.length) throw new HttpError(400, 'INVALID_INPUT', { field: 'field_key' });
  const saved = await tx(async (c) => {
    let row;
    if (id) {
      const slug = d.slug || (await c.query('SELECT slug FROM departments WHERE id = $1', [id])).rows[0]?.slug;
      row = (
        await c.query(
          `UPDATE departments SET name_ar=$1,name_en=$2,slug=$3,description_ar=$4,description_en=$5,icon=$6,purchase_mode=$7,sort_order=$8,active=$9 WHERE id=$10 RETURNING *`,
          [d.name_ar, d.name_en, slug, d.description_ar, d.description_en, d.icon, d.purchase_mode, d.sort_order, d.active, id]
        )
      ).rows[0];
      if (!row) throw new HttpError(404, 'NOT_FOUND');
    } else {
      let slug = d.slug || v.slugify(d.name_en) || `dept-${Date.now().toString(36)}`;
      const taken = await c.query('SELECT 1 FROM departments WHERE slug = $1', [slug]);
      if (taken.rows[0]) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      row = (
        await c.query(
          `INSERT INTO departments(name_ar,name_en,slug,description_ar,description_en,icon,purchase_mode,sort_order,active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
          [d.name_ar, d.name_en, slug, d.description_ar, d.description_en, d.icon, d.purchase_mode, d.sort_order, d.active]
        )
      ).rows[0];
    }
    await c.query('DELETE FROM department_fields WHERE department_id = $1 AND NOT (key = ANY($2::text[]))', [row.id, fields.map((f) => f.key)]);
    for (const f of fields) {
      await c.query(
        `INSERT INTO department_fields(department_id,key,label_ar,label_en,type,options,unit,required,filterable,show_on_card,sort_order,active)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (department_id,key) DO UPDATE SET label_ar=EXCLUDED.label_ar,label_en=EXCLUDED.label_en,type=EXCLUDED.type,options=EXCLUDED.options,
           unit=EXCLUDED.unit,required=EXCLUDED.required,filterable=EXCLUDED.filterable,show_on_card=EXCLUDED.show_on_card,sort_order=EXCLUDED.sort_order,active=EXCLUDED.active`,
        [row.id, f.key, f.label_ar, f.label_en, f.type, JSON.stringify(f.options), f.unit, f.required, f.filterable, f.show_on_card, f.sort_order, f.active]
      );
    }
    return row;
  });
  invalidateSite();
  audit(req.user, id ? 'UPDATE' : 'CREATE', 'department', saved.id);
  return saved;
}
r.post('/departments', async (req, res) => res.status(201).json({ item: await saveDepartment(req, res, null) }));
r.put('/departments/:id', async (req, res) => res.json({ item: await saveDepartment(req, res, v.id(req.params.id)) }));
r.delete('/departments/:id', async (req, res) => {
  const did = v.id(req.params.id);
  const n = (await q('SELECT COUNT(*)::int AS n FROM products WHERE department_id = $1', [did])).rows[0].n;
  if (n > 0) throw new HttpError(409, 'DEPARTMENT_NOT_EMPTY', { products: n }); // hide it instead (active = off) — products stay safe
  await q('DELETE FROM departments WHERE id = $1', [did]);
  invalidateSite();
  audit(req.user, 'DELETE', 'department', did);
  res.json({ ok: true });
});

/* ───────────── inquiries ───────────── */
r.get('/inquiries', async (_req, res) => {
  const items = (
    await q(
      `SELECT i.*, p.name_ar AS product_ar, p.name_en AS product_en FROM inquiries i LEFT JOIN products p ON p.id = i.product_id ORDER BY (i.status = 'new') DESC, i.id DESC LIMIT 300`
    )
  ).rows;
  res.json({ items });
});
r.patch('/inquiries/:id', async (req, res) => {
  const status = String(body(req).status || '');
  if (!['new', 'contacted', 'closed'].includes(status)) throw new HttpError(400, 'BAD_STATUS');
  const u = await q('UPDATE inquiries SET status = $1 WHERE id = $2', [status, v.id(req.params.id)]);
  if (!u.rowCount) throw new HttpError(404, 'NOT_FOUND');
  res.json({ ok: true });
});

/* ───────────── store settings ───────────── */
r.get('/settings', async (_req, res) => {
  const row = (await q(`SELECT value FROM settings WHERE key = 'site'`)).rows[0];
  res.json({ settings: { ...SITE_DEFAULTS, ...(row?.value || {}) } });
});
r.put('/settings', async (req, res) => {
  const s = v.parseSettings(body(req));
  await q(`INSERT INTO settings(key,value) VALUES('site',$1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [JSON.stringify(s)]);
  invalidateSite();
  audit(req.user, 'SETTINGS_UPDATE', 'settings', 'site');
  res.json({ settings: s });
});

/* ───────────── users: roles, disable, force logout ───────────── */
r.patch('/users/:id', async (req, res) => {
  const uid = v.id(req.params.id);
  const b = body(req);
  if (uid === req.user.id) throw new HttpError(400, 'CANNOT_EDIT_SELF'); // nobody can lock themselves out by accident
  const target = (await q('SELECT id, role, is_active FROM users WHERE id = $1', [uid])).rows[0];
  if (!target) throw new HttpError(404, 'NOT_FOUND');
  const role = b.role === undefined ? target.role : ['customer', 'admin'].includes(b.role) ? b.role : null;
  if (role === null) throw new HttpError(400, 'INVALID_INPUT', { field: 'role' });
  const active = b.is_active === undefined ? target.is_active : !!b.is_active;
  await q('UPDATE users SET role = $1, is_active = $2 WHERE id = $3', [role, active, uid]);
  if (!active || role !== target.role) await destroyAllSessions(uid); // permission changes apply immediately
  audit(req.user, 'USER_UPDATE', 'user', uid, { role, is_active: active, ip: clientIp(req) });
  res.json({ ok: true });
});
r.post('/users/:id/logout', async (req, res) => {
  const uid = v.id(req.params.id);
  await destroyAllSessions(uid);
  audit(req.user, 'USER_FORCE_LOGOUT', 'user', uid);
  res.json({ ok: true });
});

/* ───────────── payment confirmation (wallet / InstaPay transfers) ───────────── */
r.patch('/orders/:id/payment', async (req, res) => {
  const oid = v.id(req.params.id);
  const status = body(req).status === 'paid' ? 'paid' : 'unpaid';
  const order = (await q('UPDATE orders SET payment_status = $1, updated_at = now() WHERE id = $2 RETURNING *', [status, oid])).rows[0];
  if (!order) throw new HttpError(404, 'NOT_FOUND');
  audit(req.user, 'PAYMENT_' + status.toUpperCase(), 'order', oid);
  if (status === 'paid') await notify({ query: q }, order.user_id, { kind: 'order', title_ar: `تم تأكيد دفع طلبك #${oid}`, title_en: `Payment confirmed for order #${oid}`, link: '/account.html#orders' });
  res.json({ order });
});

/* ───────────── quick edit / duplicate / alerts / setup checklist ───────────── */
r.patch('/products/:id/quick', async (req, res) => {
  const pid = v.id(req.params.id);
  const b = body(req);
  const price = b.price !== undefined ? v.money(b.price, { field: 'price', max: 10_000_000 }) : null;
  const stock = b.stock !== undefined ? v.int(b.stock, { field: 'stock', min: 0, max: 1_000_000 }) : null;
  const active = b.active !== undefined ? !!b.active : null;
  const featured = b.featured !== undefined ? !!b.featured : null;
  const item = (await q('UPDATE products SET price = COALESCE($1,price), stock = COALESCE($2,stock), active = COALESCE($3,active), featured = COALESCE($4,featured), updated_at = now() WHERE id = $5 RETURNING *', [price, stock, active, featured, pid])).rows[0];
  if (!item) throw new HttpError(404, 'NOT_FOUND');
  audit(req.user, 'QUICK_EDIT', 'product', pid);
  res.json({ item });
});

r.post('/products/:id/duplicate', async (req, res) => {
  const pid = v.id(req.params.id);
  const src = (await q('SELECT * FROM products WHERE id = $1', [pid])).rows[0];
  if (!src) throw new HttpError(404, 'NOT_FOUND');
  const slug = await uniqueSlug('products', '', `${src.name_en}-copy`);
  const item = (
    await q(
      `INSERT INTO products(name_ar,name_en,slug,description_ar,description_en,category,price,old_price,stock,image_url,images,active,featured,department_id,attributes)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,false,false,$12,$13) RETURNING *`,
      [`${src.name_ar} (نسخة)`, `${src.name_en} (copy)`, slug, src.description_ar, src.description_en, src.category, src.price, src.old_price, src.stock, src.image_url, JSON.stringify(src.images || []), src.department_id, JSON.stringify(src.attributes || {})]
    )
  ).rows[0];
  audit(req.user, 'DUPLICATE', 'product', item.id, { from: pid });
  res.status(201).json({ item });
});

r.get('/alerts', async (_req, res) => {
  const [o, i, l] = await Promise.all([
    q(`SELECT COUNT(*)::int AS n FROM orders WHERE status = 'pending'`),
    q(`SELECT COUNT(*)::int AS n FROM inquiries WHERE status = 'new'`),
    q('SELECT COUNT(*)::int AS n FROM products WHERE active AND stock <= $1', [CONFIG.lowStock])
  ]);
  res.json({ pending_orders: o.rows[0].n, new_inquiries: i.rows[0].n, low_stock: l.rows[0].n });
});

r.get('/setup', async (req, res) => {
  const { site } = await getSite();
  const [b, p] = await Promise.all([q('SELECT COUNT(*)::int AS n FROM banners WHERE active'), q('SELECT COUNT(*)::int AS n FROM products WHERE active')]);
  const steps = [
    ['contact', !!(site.phone || site.whatsapp)], ['logo', !!site.logo_url], ['policy', !!site.return_policy],
    ['banner', b.rows[0].n > 0], ['products', p.rows[0].n >= 8], ['two_factor', !!req.user.totp_enabled]
  ].map(([key, done]) => ({ key, done }));
  res.json({ steps });
});

/* ───────────── coupons ───────────── */
r.get('/coupons', async (_req, res) => res.json({ items: (await q('SELECT * FROM coupons ORDER BY id DESC')).rows }));
r.post('/coupons', async (req, res) => {
  const c = parseCoupon(body(req));
  const item = (await q(`INSERT INTO coupons(code,type,value,min_total,max_discount,starts_at,expires_at,max_uses,per_user,active) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, [c.code, c.type, c.value, c.min_total, c.max_discount, c.starts_at, c.expires_at, c.max_uses, c.per_user, c.active])).rows[0];
  audit(req.user, 'CREATE', 'coupon', item.id);
  res.status(201).json({ item });
});
r.put('/coupons/:id', async (req, res) => {
  const cid = v.id(req.params.id);
  const c = parseCoupon(body(req));
  const item = (await q(`UPDATE coupons SET code=$1,type=$2,value=$3,min_total=$4,max_discount=$5,starts_at=$6,expires_at=$7,max_uses=$8,per_user=$9,active=$10 WHERE id=$11 RETURNING *`, [c.code, c.type, c.value, c.min_total, c.max_discount, c.starts_at, c.expires_at, c.max_uses, c.per_user, c.active, cid])).rows[0];
  if (!item) throw new HttpError(404, 'NOT_FOUND');
  audit(req.user, 'UPDATE', 'coupon', cid);
  res.json({ item });
});
r.delete('/coupons/:id', async (req, res) => {
  await q('DELETE FROM coupons WHERE id = $1', [v.id(req.params.id)]);
  audit(req.user, 'DELETE', 'coupon', req.params.id);
  res.json({ ok: true });
});

/* ───────────── home banners ───────────── */
r.get('/banners', async (_req, res) => res.json({ items: (await q('SELECT * FROM banners ORDER BY sort_order, id')).rows }));
const bannerCols = 'title_ar,title_en,subtitle_ar,subtitle_en,image_url,link_url,button_ar,button_en,sort_order,active';
const bannerVals = (b) => [b.title_ar, b.title_en, b.subtitle_ar, b.subtitle_en, b.image_url, b.link_url, b.button_ar, b.button_en, b.sort_order, b.active];
r.post('/banners', async (req, res) => {
  const b = v.parseBanner(body(req));
  const item = (await q(`INSERT INTO banners(${bannerCols}) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, bannerVals(b))).rows[0];
  invalidateSite();
  audit(req.user, 'CREATE', 'banner', item.id);
  res.status(201).json({ item });
});
r.put('/banners/:id', async (req, res) => {
  const bid = v.id(req.params.id);
  const b = v.parseBanner(body(req));
  const item = (await q(`UPDATE banners SET title_ar=$1,title_en=$2,subtitle_ar=$3,subtitle_en=$4,image_url=$5,link_url=$6,button_ar=$7,button_en=$8,sort_order=$9,active=$10 WHERE id=$11 RETURNING *`, [...bannerVals(b), bid])).rows[0];
  if (!item) throw new HttpError(404, 'NOT_FOUND');
  invalidateSite();
  res.json({ item });
});
r.delete('/banners/:id', async (req, res) => {
  await q('DELETE FROM banners WHERE id = $1', [v.id(req.params.id)]);
  invalidateSite();
  res.json({ ok: true });
});

export default r;
