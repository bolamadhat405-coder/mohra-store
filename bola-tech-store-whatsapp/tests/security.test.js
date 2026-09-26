import test from 'node:test';
import assert from 'node:assert/strict';
import { hotp, totp, verifyTotp, generateSecret, base32, base32Decode, newRecoveryCodes, hashCode } from '../server/lib/totp.js';
import { passwordIssue } from '../server/lib/password.js';
import { cleanAttributes, parseFieldDef, parseOptions } from '../server/lib/attributes.js';

test('TOTP matches the RFC 6238 / RFC 4226 reference vectors', () => {
  const key = Buffer.from('12345678901234567890');
  assert.equal(hotp(key, 1, 6), '287082'); // RFC 4226 counter=1
  assert.equal(hotp(key, 1, 8), '94287082'); // RFC 6238 T=59s
  assert.equal(base32(key), 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
  assert.deepEqual(base32Decode('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'), key);
});
test('verifyTotp accepts current/adjacent window, rejects others', () => {
  const s = generateSecret();
  const now = 1_700_000_000_000;
  assert.equal(verifyTotp(s, totp(s, now), { time: now }), true);
  assert.equal(verifyTotp(s, totp(s, now - 30000), { time: now }), true);
  assert.equal(verifyTotp(s, totp(s, now - 120000), { time: now }), false);
  assert.equal(verifyTotp(s, '12345', { time: now }), false);
  assert.equal(verifyTotp(s, 'abcdef', { time: now }), false);
});
test('recovery codes: unique, formatted, hash is case/space-insensitive', () => {
  const c = newRecoveryCodes(8);
  assert.equal(new Set(c).size, 8);
  assert.match(c[0], /^[0-9a-f]{5}-[0-9a-f]{5}$/);
  assert.equal(hashCode(c[0].toUpperCase()), hashCode(' ' + c[0] + ' '));
});
test('password policy', () => {
  assert.equal(passwordIssue('short1'), 'short');
  assert.equal(passwordIssue('password123'), 'common');
  assert.equal(passwordIssue('aaaaaaaaaa'), 'repeated');
  assert.equal(passwordIssue('onlylowercase'), 'simple');
  assert.equal(passwordIssue('ali.hassan2024', { email: 'ali.hassan@x.com' }), 'contains_email');
  assert.equal(passwordIssue('Nile-River-77'), null);
  assert.equal(passwordIssue('مصر٢٠٢٤ok'), null);
});

const FIELDS = [
  { key: 'year', type: 'number', label_ar: 'السنة', label_en: 'Year', required: true, active: true },
  { key: 'fuel', type: 'select', label_ar: 'الوقود', label_en: 'Fuel', options: [{ ar: 'بنزين', en: 'Petrol' }, { ar: 'ديزل', en: 'Diesel' }], active: true },
  { key: 'abs', type: 'boolean', label_ar: 'ABS', label_en: 'ABS', active: true },
  { key: 'note', type: 'text', label_ar: 'ملاحظة', label_en: 'Note', active: true },
  { key: 'old', type: 'text', label_ar: 'قديم', label_en: 'Old', active: false }
];
test('cleanAttributes validates, coerces and drops unknown keys', () => {
  const a = cleanAttributes(FIELDS, { year: '2021', fuel: 'بنزين', abs: 'true', note: '  نضيفة ', evil: '<script>', old: 'x' });
  assert.deepEqual(a, { year: 2021, fuel: 'بنزين', abs: true, note: 'نضيفة' });
});
test('cleanAttributes: required, select membership, NaN', () => {
  assert.throws(() => cleanAttributes(FIELDS, {}), (e) => e.data.field === 'year' && e.data.label_ar === 'السنة');
  assert.throws(() => cleanAttributes(FIELDS, { year: 2020, fuel: 'غاز' }), (e) => e.data.field === 'fuel');
  assert.throws(() => cleanAttributes(FIELDS, { year: 'abc' }), (e) => e.data.field === 'year');
  assert.deepEqual(cleanAttributes(FIELDS, { year: 2020 }), { year: 2020 });
});
test('field definitions: key format, select needs 2+ options, filterable only for select/boolean', () => {
  assert.throws(() => parseFieldDef({ key: 'Bad Key', label_ar: 'x' }), (e) => e.data.field === 'field_key');
  assert.throws(() => parseFieldDef({ key: 'k1', type: 'select', label_ar: 'ن', options: 'واحد' }), (e) => e.data.field === 'options');
  const f = parseFieldDef({ key: 'k1', type: 'select', label_ar: 'نوع', options: 'أ|A\nب\nأ', filterable: true, required: true }, 3);
  assert.deepEqual(f.options, [{ ar: 'أ', en: 'A' }, { ar: 'ب', en: 'ب' }]);
  assert.equal(f.filterable, true); assert.equal(f.sort_order, 3);
  assert.equal(parseFieldDef({ key: 'n', type: 'number', label_ar: 'ع', filterable: true }).filterable, false);
  assert.deepEqual(parseOptions([{ ar: 'س', en: 'S' }, 'ص']), [{ ar: 'س', en: 'S' }, { ar: 'ص', en: 'ص' }]);
});
