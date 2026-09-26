import test from 'node:test';
import assert from 'node:assert/strict';
import { smalltalk } from '../server/lib/smalltalk.js';
import { supportReply } from '../server/lib/support.js';
import { buildReply } from '../server/lib/ai.js';
import { buildSystem, buildSupportSystem } from '../server/lib/assistant.js';

const NOW = new Date('2026-09-20T13:42:00Z'); // 16:42 in Cairo (EEST, UTC+3)
test('small talk: how are you, time, date, math — no catalog needed', () => {
  assert.equal(smalltalk('عامل ايه؟').kind, 'howareyou');
  assert.equal(smalltalk('ازيك يا باشا').kind, 'howareyou');
  assert.equal(smalltalk('how are you').kind, 'howareyou');
  const t = smalltalk('الساعة كام دلوقتي؟', { now: NOW });
  assert.equal(t.kind, 'time'); assert.match(t.answer, /4:42|٤:٤٢|16:42/);
  assert.match(smalltalk('what time is it', { now: NOW, lang: 'en' }).answer, /4:42/);
  assert.match(smalltalk('النهارده ايه', { now: NOW }).answer, /الأحد|20|سبتمبر/);
  assert.equal(smalltalk('كام 12*4').answer, '12*4 = 48');
  assert.match(smalltalk('(100-20)/4 =').answer, /= 20$/);
  assert.equal(smalltalk('عايز لابتوب'), null);
  assert.equal(smalltalk('مواعيد التوصيل ايه'), null, 'delivery time is NOT the clock');
});
test('identity questions get an honest answer — the bot never claims to be human or "handmade"', () => {
  for (const q of ['انت انسان؟', 'هل انت بوت', 'are you a bot?', 'is this AI?']) {
    const r = smalltalk(q, { lang: /[a-z]/i.test(q) ? 'en' : 'ar' });
    assert.equal(r.kind, 'identity'); assert.match(r.answer, /آلي|automated/); assert.ok(!/معمول يدوي|handmade|human being|أنا إنسان/.test(r.answer));
  }
  const b = smalltalk('الموقع ده معمول بالذكاء الاصطناعي؟');
  assert.equal(b.kind, 'builder'); assert.ok(!/لا،|no,/i.test(b.answer.slice(0, 4)));
});
test('shopping assistant: small talk first, "best value" ranks by rating/price/discount, off-topic gets a graceful fallback', () => {
  const P = [
    { id: 1, name_ar: 'لابتوب برو', name_en: 'Laptop Pro', category: 'أجهزة', description_ar: 'لابتوب', description_en: 'laptop', price: 30000, old_price: null, stock: 5, rating: 4.9 },
    { id: 2, name_ar: 'لابتوب سمارت', name_en: 'Laptop Smart', category: 'أجهزة', description_ar: 'لابتوب', description_en: 'laptop', price: 15000, old_price: 18000, stock: 5, rating: 4.6 },
    { id: 3, name_ar: 'لابتوب قديم', name_en: 'Old laptop', category: 'أجهزة', description_ar: 'لابتوب', description_en: 'laptop', price: 14000, old_price: null, stock: 0, rating: 5 }
  ];
  const ask = (m) => buildReply({ message: m, lang: 'ar', products: P, services: [], policy: { threshold: 3000, fee: 80, currency: 'EGP' }, storeName: 'سوق' });
  assert.equal(ask('عامل ايه').intent, 'howareyou');
  const v = ask('ايه افضل لابتوب قيمة مقابل سعر');
  assert.equal(v.intent, 'value'); assert.equal(v.items[0].id, 2, 'in-stock, good rating, discounted, cheaper than the pro'); assert.ok(!v.items.some((i) => i.id === 3), 'out-of-stock excluded');
  const off = ask('ايه افضل مسحوق غسيل');
  assert.equal(off.intent, 'none'); assert.match(off.answer, /خدمة العملاء/);
});
test('support bot: orders (login required), returns/shipping/payment/contact, human hand-over', () => {
  const site = { name: 'سوق', phone: '0100', whatsapp: '2010', support_hours: '10ص-10م', return_policy: 'استرجاع خلال 14 يوم', delivery_estimate: '2-4 أيام' };
  const orders = [{ id: 12, status: 'shipped', total: 1500, created_at: '2026-09-18T10:00:00Z' }, { id: 9, status: 'pending', total: 300, created_at: '2026-09-10T10:00:00Z' }];
  const ask = (m, o = {}) => supportReply({ message: m, lang: 'ar', site, orders, loggedIn: true, ...o });
  assert.deepEqual(ask('فين طلبي', { loggedIn: false }).actions, [{ type: 'login' }]);
  assert.match(ask('فين طلبي').answer, /#12.*تم الشحن/);
  assert.match(ask('حالة طلب رقم 9').answer, /#9.*قيد المراجعة/);
  assert.equal(ask('فين طلبي', { orders: [] }).intent, 'order-none');
  assert.match(ask('عايز ارجع المنتج').answer, /14 يوم/);
  assert.match(ask('الشحن بكام').answer, /3,000.*2-4 أيام/);
  assert.match(ask('طرق الدفع ايه').answer, /عند الاستلام/);
  assert.match(ask('رقم التليفون').answer, /0100/);
  const h = ask('عايز اكلم موظف'); assert.equal(h.intent, 'human'); assert.deepEqual(h.actions.map((a) => a.type), ['ticket', 'whatsapp']);
  assert.equal(ask('عامل ايه').intent, 'howareyou');
  assert.equal(supportReply({ message: 'رجّع فلوسي', lang: 'ar', site: {}, orders: [], loggedIn: false }).actions.at(0).type, 'ticket');
});
test('system prompts: live Cairo time, general questions allowed, honesty clause, no invented policy', () => {
  const site = { name: 'سوق النيل', return_policy: '' };
  const pol = { currency: 'EGP', threshold: 3000, fee: 80 };
  const s = buildSystem({ site, policy: pol, catalog: {}, now: NOW });
  assert.match(s, /توقيت القاهرة/); assert.match(s, /مسحوق غسيل/); assert.match(s, /لا تدّعِ أبد.{1,2} أنك بشر أو أن الرد مكتوب يدويً/);
  const c = buildSupportSystem({ site, policy: pol, orders: [{ id: 1 }], loggedIn: true, now: NOW });
  assert.match(c, /"id":1/); assert.match(c, /غير محددة — حوّل العميل لموظف/); assert.match(c, /لا تدّعِ أبد/);
  assert.ok(!/claude|anthropic|openai|gpt/i.test(s + c));
});
