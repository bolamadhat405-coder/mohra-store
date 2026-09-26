import { HttpError } from './errors.js';
import { str } from './validate.js';

// Custom fields ("خانات") that an admin defines per department: text, number, select, boolean, textarea.
export const FIELD_TYPES = ['text', 'number', 'select', 'boolean', 'textarea'];
export const ICONS = ['box', 'cpu', 'car', 'gamepad', 'book', 'shirt', 'home', 'gift', 'tool', 'ball', 'tag', 'heart'];

const bad = (field, extra = {}) => new HttpError(400, 'INVALID_INPUT', { field, ...extra });

// One option per line: "عربي | English"  ->  [{ar, en}]
export function parseOptions(raw) {
  const list = Array.isArray(raw) ? raw : String(raw || '').split('\n');
  const out = [];
  const seen = new Set();
  for (const item of list) {
    let ar, en;
    if (item && typeof item === 'object') { ar = String(item.ar || '').trim(); en = String(item.en || '').trim(); }
    else { const [a, b] = String(item).split('|'); ar = (a || '').trim(); en = (b || '').trim(); }
    if (!ar || ar.length > 60 || seen.has(ar)) continue;
    seen.add(ar);
    out.push({ ar, en: en || ar });
    if (out.length >= 50) break;
  }
  return out;
}

export function parseFieldDef(f = {}, sortOrder = 0) {
  const key = String(f.key || '').trim();
  if (!/^[a-z][a-z0-9_]{0,39}$/.test(key)) throw bad('field_key');
  const type = FIELD_TYPES.includes(f.type) ? f.type : 'text';
  const label_ar = str(f.label_ar, { field: 'label_ar', min: 1, max: 60 });
  const options = type === 'select' ? parseOptions(f.options) : [];
  if (type === 'select' && options.length < 2) throw bad('options');
  return {
    key, type, label_ar,
    label_en: str(f.label_en, { field: 'label_en', max: 60 }) || label_ar,
    options,
    unit: str(f.unit, { field: 'unit', max: 20 }),
    required: type !== 'boolean' && !!f.required,
    filterable: ['select', 'boolean'].includes(type) && !!f.filterable,
    show_on_card: !!f.show_on_card,
    sort_order: sortOrder,
    active: f.active !== false
  };
}

export function parseDepartment(b = {}) {
  return {
    name_ar: str(b.name_ar, { field: 'name_ar', min: 2, max: 60 }),
    name_en: str(b.name_en, { field: 'name_en', min: 2, max: 60 }),
    slug: String(b.slug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40),
    description_ar: str(b.description_ar, { field: 'description_ar', max: 300 }),
    description_en: str(b.description_en, { field: 'description_en', max: 300 }),
    icon: ICONS.includes(b.icon) ? b.icon : 'box',
    purchase_mode: b.purchase_mode === 'inquiry' ? 'inquiry' : 'cart',
    sort_order: Number.isInteger(Number(b.sort_order)) ? Number(b.sort_order) : 0,
    active: b.active !== false
  };
}

// Validates the attribute values sent with a product against its department's fields.
// Unknown keys are dropped, select values must be one of the defined options.
export function cleanAttributes(fields, input) {
  const src = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const out = {};
  for (const f of fields) {
    if (f.active === false) continue;
    const err = () => bad(f.key, { label_ar: f.label_ar, label_en: f.label_en });
    const raw = src[f.key];
    if (f.type === 'boolean') {
      if (raw === true || raw === 'true') out[f.key] = true;
      else if (raw === false || raw === 'false') out[f.key] = false;
      continue;
    }
    if (raw === undefined || raw === null || String(raw).trim() === '') { if (f.required) throw err(); continue; }
    if (f.type === 'number') {
      const n = Number(raw);
      if (!Number.isFinite(n) || Math.abs(n) > 1e12) throw err();
      out[f.key] = n;
    } else if (f.type === 'select') {
      const val = String(raw);
      if (!f.options.some((o) => o.ar === val)) throw err();
      out[f.key] = val;
    } else {
      const val = String(raw).trim();
      if (val.length > (f.type === 'textarea' ? 2000 : 200)) throw err();
      out[f.key] = val;
    }
  }
  return out;
}

const YES = new Set(['true', '1', 'yes', 'y', 'نعم', 'ايوه', 'أيوه', 'اه', 'آه']);
const NO = new Set(['false', '0', 'no', 'n', 'لا', 'لأ']);
const lc = (x) => String(x ?? '').trim().toLowerCase();

// Spreadsheet columns -> attribute values keyed by the field key. Accepts the key, the Arabic label or the English label as the column name.
export function mapAttributes(fields, raw = {}) {
  const out = {};
  for (const [name, val] of Object.entries(raw || {})) {
    const f = fields.find((x) => lc(x.key) === lc(name) || lc(x.label_ar) === lc(name) || lc(x.label_en) === lc(name));
    if (!f) continue;
    if (f.type === 'select') {
      const o = (f.options || []).find((x) => lc(x.ar) === lc(val) || lc(x.en) === lc(val));
      out[f.key] = o ? o.ar : val;
    } else if (f.type === 'boolean') {
      if (YES.has(lc(val))) out[f.key] = true; else if (NO.has(lc(val))) out[f.key] = false;
    } else out[f.key] = val;
  }
  return out;
}
