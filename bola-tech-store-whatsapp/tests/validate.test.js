import test from 'node:test';
import assert from 'node:assert/strict';
import * as v from '../server/lib/validate.js';

const throwsInvalid = (fn) => assert.throws(fn, (e) => e.status === 400 && e.code === 'INVALID_INPUT');

test('email is trimmed, lowercased and validated', () => {
  assert.equal(v.email('  Ali@Example.COM '), 'ali@example.com');
  throwsInvalid(() => v.email('not-an-email'));
  throwsInvalid(() => v.email('a@b'));
});

test('password: 8..72 bytes', () => {
  assert.equal(v.password('12345678'), '12345678');
  throwsInvalid(() => v.password('short'));
  throwsInvalid(() => v.password('x'.repeat(73)));
});

test('int / money / id reject garbage', () => {
  assert.equal(v.int('5', { min: 1, max: 9 }), 5);
  throwsInvalid(() => v.int('5.5', { min: 1, max: 9 }));
  throwsInvalid(() => v.int('0', { min: 1, max: 9 }));
  assert.equal(v.int(undefined, { def: 3 }), 3);
  assert.equal(v.money('10.456'), 10.46);
  throwsInvalid(() => v.money('-1'));
  throwsInvalid(() => v.money('abc'));
  assert.equal(v.money('', { optional: true }), null);
  assert.equal(v.id('42'), 42);
  throwsInvalid(() => v.id('4x'));
  throwsInvalid(() => v.id("1; DROP TABLE users"));
});

test('url only allows http(s) and site-relative paths', () => {
  assert.equal(v.url('https://a.com/x.png'), 'https://a.com/x.png');
  assert.equal(v.url('/img/x.png'), '/img/x.png');
  assert.equal(v.url(''), '');
  throwsInvalid(() => v.url('javascript:alert(1)'));
  throwsInvalid(() => v.url('//evil.com/x'));
  throwsInvalid(() => v.url('data:text/html,<script>'));
});

test('phone accepts Arabic-Indic digits and separators', () => {
  assert.equal(v.phone('٠١٠ ١٢٣٤-٥٦٧٨'), '01012345678');
  assert.equal(v.phone('+20 100 123 4567'), '+201001234567');
  throwsInvalid(() => v.phone('12'));
});

test('parseProduct: discount must be a real discount, defaults applied', () => {
  const p = v.parseProduct({ name_ar: 'منتج', name_en: 'Item', price: '100', old_price: '100', stock: '3' });
  assert.equal(p.old_price, null);
  assert.equal(p.active, true);
  assert.equal(p.category, 'General');
  const q = v.parseProduct({ name_ar: 'منتج', name_en: 'Item', price: 100, old_price: 150 });
  assert.equal(q.old_price, 150);
  throwsInvalid(() => v.parseProduct({ name_ar: 'م', name_en: 'Item', price: 1 }));
  throwsInvalid(() => v.parseProduct({ name_ar: 'منتج', name_en: 'Item', price: -5 }));
  throwsInvalid(() => v.parseProduct({ name_ar: 'منتج', name_en: 'Item', price: 5, image_url: 'javascript:1' }));
});

test('slugify', () => {
  assert.equal(v.slugify('  BOLA Tech X1!! '), 'bola-tech-x1');
  assert.equal(v.slugify('***'), '');
});

test('parseAddress requires the essentials', () => {
  const a = v.parseAddress({ full_name: 'Ali Hassan', phone: '01001234567', city: 'Cairo', street: '12 Nile St' });
  assert.equal(a.is_default, false);
  throwsInvalid(() => v.parseAddress({ full_name: 'Ali', phone: '01001234567', city: 'Cairo' }));
});

test('parseSettings keeps general WhatsApp separate from order WhatsApp', () => {
  const s = v.parseSettings({ name: 'BOLA TECH', whatsapp: '201011111111', order_whatsapp: '201022222222' });
  assert.equal(s.whatsapp, '201011111111');
  assert.equal(s.order_whatsapp, '201022222222');
  const fallback = v.parseSettings({ name: 'BOLA TECH', whatsapp: '201011111111' });
  assert.equal(fallback.order_whatsapp, '201011111111');
  throwsInvalid(() => v.parseSettings({ name: 'BOLA TECH', order_whatsapp: '123' }));
});
