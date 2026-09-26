import { Router } from 'express';
import { q } from '../db.js';
import { optionalAuth } from '../auth.js';
import { CONFIG } from '../lib/config.js';
import { HttpError } from '../lib/errors.js';
import { getSite } from '../lib/site.js';
import { askModel } from '../lib/ai.js';
import { supportReply } from '../lib/support.js';
import { buildSupportSystem } from '../lib/assistant.js';
import * as v from '../lib/validate.js';

const r = Router();
r.use(optionalAuth);

// Customer-service chat. The customer's own orders (and only theirs) are given to the bot when they are logged in.
r.post('/chat', async (req, res) => {
  const b = req.body || {};
  const message = String(b.message || '').trim().slice(0, 500);
  if (!message) throw new HttpError(400, 'EMPTY_MESSAGE');
  const lang = /[\u0600-\u06FF]/.test(message) ? 'ar' : 'en';
  const { site } = await getSite();
  const policy = { threshold: CONFIG.freeShippingThreshold, fee: CONFIG.shippingFee, currency: CONFIG.currency };
  let orders = [];
  if (req.user) {
    orders = (
      await q(
        `SELECT o.id, o.status, o.total, o.created_at, o.payment_status,
                (SELECT string_agg(oi.title || ' x' || oi.quantity, ', ') FROM order_items oi WHERE oi.order_id = o.id) AS items
           FROM orders o WHERE o.user_id = $1 ORDER BY o.id DESC LIMIT 5`,
        [req.user.id]
      )
    ).rows;
  }
  const local = supportReply({ message, lang, site, orders, loggedIn: !!req.user, policy });
  const history = Array.isArray(b.history) ? b.history.slice(-10) : [];
  const fromModel = await askModel({ message, history, system: buildSupportSystem({ site, policy, orders, loggedIn: !!req.user, now: new Date() }) });
  res.json({ answer: fromModel || local.answer, source: fromModel ? 'model' : 'rules', actions: local.actions });
});

// "Talk to a person": stored with the inquiries (kind = support) and shown in the control center.
r.post('/tickets', async (req, res) => {
  const b = req.body || {};
  if (b.website) throw new HttpError(400, 'INVALID_INPUT'); // honeypot
  const t = v.parseInquiry(b);
  if (t.message.length < 3) throw new HttpError(400, 'INVALID_INPUT', { field: 'message' });
  await q(`INSERT INTO inquiries(product_id,user_id,name,phone,message,kind) VALUES(NULL,$1,$2,$3,$4,'support')`, [req.user?.id || null, t.name, t.phone, t.message]);
  res.status(201).json({ ok: true });
});

export default r;
