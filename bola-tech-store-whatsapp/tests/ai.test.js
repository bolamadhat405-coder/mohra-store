import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, parseBudget, buildReply } from '../server/lib/ai.js';

const products = [
  { id: 1, name_ar: 'BOLA TECH X1', name_en: 'BOLA TECH X1', category: 'أجهزة', description_ar: 'لابتوب بأداء قوي', description_en: 'A laptop with powerful performance', price: 18999, old_price: 21999, stock: 12, featured: true },
  { id: 2, name_ar: 'VISION DISPLAY', name_en: 'VISION DISPLAY', category: 'شاشات', description_ar: 'شاشة حديثة للمكتب', description_en: 'Modern display', price: 7999, old_price: 8999, stock: 16, featured: true },
  { id: 3, name_ar: 'BOLA MOUSE AIR', name_en: 'BOLA MOUSE AIR', category: 'إكسسوارات', description_ar: 'ماوس لاسلكي', description_en: 'Wireless mouse', price: 799, old_price: null, stock: 60, featured: false },
  { id: 4, name_ar: 'BOLA PHONE S', name_en: 'BOLA PHONE S', category: 'موبايلات', description_ar: 'موبايل بكاميرا ممتازة', description_en: 'A phone', price: 14999, old_price: null, stock: 0, featured: false }
];
const services = [{ id: 9, name_ar: 'تصميم موقع احترافي', name_en: 'Professional Website Design', category: 'تطوير مواقع', description_ar: 'تصميم موقع سريع', description_en: 'Fast website', price: 3500, duration: '7-14 days', featured: true }];
const policy = { threshold: 3000, fee: 80, currency: 'EGP' };
const ask = (message) => buildReply({ message, lang: /[\u0600-\u06FF]/.test(message) ? 'ar' : 'en', products, services, policy });

test('normalize unifies Arabic letter variants and digits', () => {
  assert.equal(normalize('أجهزة'), normalize('اجهزه'));
  assert.equal(normalize('شاشة'), 'شاشه');
  assert.equal(normalize('٥٠٠٠'), '5000');
});

test('parseBudget understands Arabic and English phrasing', () => {
  assert.equal(parseBudget('لابتوب تحت 20000'), 20000);
  assert.equal(parseBudget('عايز حاجة تحت ٥٠٠٠ جنيه'), 5000);
  assert.equal(parseBudget('under 5k'), 5000);
  assert.equal(parseBudget('ميزانيتي 3 الاف'), 3000);
  assert.equal(parseBudget('what is your cheapest laptop'), null);
});

test('budget: only affordable, in-stock products', () => {
  const r = ask('عايز حاجة تحت 10000');
  assert.equal(r.intent, 'budget');
  assert.deepEqual(r.items.map((i) => i.id).sort(), [2, 3]);
  const none = ask('anything under 100');
  assert.equal(none.intent, 'budget-none');
});

test('synonyms: "لابتوب" finds the laptop via its description', () => {
  const r = ask('عندكم لابتوب؟');
  assert.equal(r.items[0].id, 1);
});

test('English + Arabic category words match', () => {
  assert.equal(ask('do you have a display').items[0].id, 2);
  assert.equal(ask('شاشات').items[0].id, 2);
});

test('services intent', () => {
  const r = ask('عايز تصميم موقع');
  assert.equal(r.intent, 'services');
  assert.equal(r.items[0].kind, 'service');
});

test('cheapest / deals / categories / shipping / greeting', () => {
  assert.equal(ask('ايه ارخص منتج').items[0].id, 3);
  const deals = ask('في عروض؟');
  assert.equal(deals.intent, 'deals');
  assert.deepEqual(deals.items.map((i) => i.id), [1, 2]);
  assert.match(ask('ايه الاقسام الموجودة').answer, /شاشات/);
  assert.match(ask('الشحن بكام؟').answer, /3,000/);
  assert.equal(ask('اهلا').intent, 'greet');
  assert.equal(ask('hello').intent, 'greet');
});

test('unknown query gives a helpful fallback, not a crash', () => {
  const r = ask('xyzzy');
  assert.equal(r.intent, 'none');
  assert.equal(r.items.length, 0);
});

test('items never leak internal fields', () => {
  const r = ask('laptop');
  assert.ok(r.items.every((i) => !('_score' in i) && !('description_ar' in i)));
});
