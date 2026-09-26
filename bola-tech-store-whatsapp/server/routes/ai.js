import { Router } from 'express';
import { q } from '../db.js';
import { CONFIG } from '../lib/config.js';
import { HttpError } from '../lib/errors.js';
import { buildReply, askModel } from '../lib/ai.js';
import { buildSystem, MODES } from '../lib/assistant.js';
import { getSite } from '../lib/site.js';

const r = Router();

// The catalog is read at most once every 15 seconds no matter how many people chat.
let cache = { at: 0, data: null };
async function getCatalog() {
  if (cache.data && Date.now() - cache.at < 15000) return cache.data;
  const [p, s, site] = await Promise.all([
    q(`SELECT p.id,p.name_ar,p.name_en,p.description_ar,p.description_en,p.category,p.price,p.old_price,p.stock,p.image_url,p.featured,p.attributes,
              d.name_ar AS dept_ar, d.name_en AS dept_en, d.purchase_mode
         FROM products p LEFT JOIN departments d ON d.id = p.department_id
        WHERE p.active AND COALESCE(d.active, true) ORDER BY p.featured DESC, p.created_at DESC LIMIT 120`),
    q(`SELECT id,name_ar,name_en,description_ar,description_en,category,price,duration,image_url,featured FROM services WHERE active ORDER BY featured DESC, created_at DESC LIMIT 60`),
    getSite()
  ]);
  const products = p.rows.map((x) => ({
    ...x,
    dept_text: `${x.dept_ar || ''} ${x.dept_en || ''}`,
    attrs_text: Object.values(x.attributes || {}).join(' ')
  }));
  cache = { at: Date.now(), data: { products, services: s.rows, site: site.site } };
  return cache.data;
}

r.post('/chat', async (req, res) => {
  const b = req.body || {};
  const message = String(b.message || '').trim().slice(0, 500);
  if (!message) throw new HttpError(400, 'EMPTY_MESSAGE');
  const history = Array.isArray(b.history) ? b.history.slice(-10) : [];
  const mode = Object.hasOwn(MODES, b.mode) ? b.mode : 'store';
  const lang = /[\u0600-\u06FF]/.test(message) ? 'ar' : 'en';
  const { products, services, site } = await getCatalog();
  const policy = { threshold: CONFIG.freeShippingThreshold, fee: CONFIG.shippingFee, currency: CONFIG.currency };

  const local = buildReply({ message, lang, products, services, policy, storeName: site.name });
  const compact = {
    products: products.slice(0, 60).map(({ id, name_ar, name_en, dept_ar, category, price, old_price, stock, attributes, purchase_mode }) => ({ id, name_ar, name_en, dept: dept_ar, category, price, old_price, stock, attributes, purchase_mode })),
    services: services.slice(0, 30).map(({ id, name_ar, name_en, price, duration }) => ({ id, name_ar, name_en, price, duration }))
  };
  const answer = await askModel({ message, history, system: buildSystem({ mode, site, policy, catalog: compact, now: new Date() }) });
  res.json({ answer: answer || local.answer, source: answer ? 'model' : 'catalog', items: mode === 'store' || !answer ? local.items : [] });
});

export default r;
