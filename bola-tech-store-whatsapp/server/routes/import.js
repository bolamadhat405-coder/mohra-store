import { Router } from 'express';
import { q } from '../db.js';
import { requireAdmin, audit } from '../auth.js';
import { HttpError } from '../lib/errors.js';
import { invalidateCatalog } from '../lib/site.js';
import { cleanAttributes, mapAttributes } from '../lib/attributes.js';
import * as v from '../lib/validate.js';

// Bulk product import (the admin page parses the Excel/CSV file in the browser and sends rows as JSON).
export const importRoutes = Router();
importRoutes.use(requireAdmin);
const same = (a, b) => String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();

async function freeSlug(wanted, name) {
  const base = wanted || v.slugify(name) || `item-${Date.now().toString(36)}`;
  for (let i = 1; i <= 30; i++) {
    const c = i === 1 ? base : `${base}-${i}`;
    if (!(await q('SELECT 1 FROM products WHERE slug = $1', [c])).rows[0]) return c;
  }
  return `${base}-${Date.now().toString(36)}`;
}

importRoutes.post('/', async (req, res) => {
  const rows = req.body?.rows;
  if (!Array.isArray(rows) || !rows.length || rows.length > 300) throw new HttpError(400, 'INVALID_INPUT', { field: 'rows' });
  const depts = (await q('SELECT id, slug, name_ar, name_en FROM departments')).rows;
  const fields = (await q('SELECT * FROM department_fields WHERE active')).rows;
  let created = 0;
  const errors = [];
  for (const [i, row] of rows.entries()) {
    try {
      const d = depts.find((x) => [x.slug, x.name_ar, x.name_en].some((n) => same(n, row.department)));
      if (!d) throw new HttpError(400, 'INVALID_INPUT', { field: 'department' });
      const p = v.parseProduct(row);
      const fs = fields.filter((f) => f.department_id === d.id);
      const attributes = cleanAttributes(fs, mapAttributes(fs, row.attributes));
      const slug = await freeSlug(p.slug, p.name_en);
      await q(
        `INSERT INTO products(name_ar,name_en,slug,description_ar,description_en,category,price,old_price,stock,image_url,images,active,featured,department_id,attributes)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [p.name_ar, p.name_en, slug, p.description_ar, p.description_en, p.category, p.price, p.old_price, p.stock, p.image_url, JSON.stringify(p.images), p.active, p.featured, d.id, JSON.stringify(attributes)]
      );
      created++;
    } catch (e) {
      if (!(e instanceof HttpError)) throw e;
      errors.push({ row: i + 1, field: e.data?.field || e.code, label_ar: e.data?.label_ar || '', label_en: e.data?.label_en || '' });
    }
  }
  invalidateCatalog();
  audit(req.user, 'IMPORT', 'product', '', { created, failed: errors.length });
  res.json({ created, errors });
});
