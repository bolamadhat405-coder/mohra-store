import { HttpError } from './errors.js';

const bad = (field) => new HttpError(400, 'INVALID_INPUT', field ? { field } : {});

export const latinDigits = (s) =>
  String(s ?? '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

export function str(value, { field, min = 0, max = 500 } = {}) {
  const s = String(value ?? '').trim();
  if (s.length < min || s.length > max) throw bad(field);
  return s;
}

export function email(value) {
  const s = String(value ?? '').trim().toLowerCase();
  if (s.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) throw bad('email');
  return s;
}

// bcrypt only looks at the first 72 bytes, so longer passwords are rejected instead of silently truncated.
export function password(value, field = 'password') {
  const s = String(value ?? '');
  if (s.length < 8 || Buffer.byteLength(s) > 72) throw bad(field);
  return s;
}

export function id(value, field = 'id') {
  const s = String(value ?? '');
  if (!/^\d{1,15}$/.test(s)) throw bad(field);
  return Number(s);
}

export function int(value, { field, min = 0, max = 1_000_000, def } = {}) {
  if ((value === undefined || value === null || value === '') && def !== undefined) return def;
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) throw bad(field);
  return n;
}

export function money(value, { field, min = 0, max = 100_000_000, optional = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (optional) return null;
    throw bad(field);
  }
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw bad(field);
  return Math.round(n * 100) / 100;
}

// Only absolute http(s) URLs or site-relative paths. Blocks javascript:, data:, etc.
export function url(value, { field } = {}) {
  const s = String(value ?? '').trim();
  if (!s) return '';
  if (s.startsWith('/') && !s.startsWith('//')) return s.slice(0, 500);
  try {
    const u = new URL(s);
    if (!['http:', 'https:'].includes(u.protocol)) throw new Error('protocol');
    return s.slice(0, 1000);
  } catch {
    throw bad(field);
  }
}

export function phone(value, { field = 'phone', optional = false } = {}) {
  const s = latinDigits(value).replace(/[\s\-()]/g, '');
  if (!s && optional) return '';
  if (!/^\+?\d{8,15}$/.test(s)) throw bad(field);
  return s;
}

export function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function parseProduct(b = {}) {
  const price = money(b.price, { field: 'price', max: 10_000_000 });
  let oldPrice = money(b.old_price, { field: 'old_price', optional: true, max: 10_000_000 });
  if (oldPrice !== null && oldPrice <= price) oldPrice = null; // a "discount" must actually be a discount
  const images = (Array.isArray(b.images) ? b.images : []).slice(0, 8).map((u) => url(u, { field: 'images' })).filter(Boolean);
  return {
    name_ar: str(b.name_ar, { field: 'name_ar', min: 2, max: 120 }),
    name_en: str(b.name_en, { field: 'name_en', min: 2, max: 120 }),
    slug: slugify(b.slug),
    description_ar: str(b.description_ar, { field: 'description_ar', max: 2000 }),
    description_en: str(b.description_en, { field: 'description_en', max: 2000 }),
    category: str(b.category, { field: 'category', max: 60 }) || 'General',
    price,
    old_price: oldPrice,
    stock: int(b.stock, { field: 'stock', min: 0, max: 1_000_000, def: 0 }),
    images,
    image_url: images[0] || url(b.image_url, { field: 'image_url' }),
    active: b.active !== false,
    featured: !!b.featured
  };
}

export function parseService(b = {}) {
  return {
    name_ar: str(b.name_ar, { field: 'name_ar', min: 2, max: 120 }),
    name_en: str(b.name_en, { field: 'name_en', min: 2, max: 120 }),
    slug: slugify(b.slug),
    description_ar: str(b.description_ar, { field: 'description_ar', max: 2000 }),
    description_en: str(b.description_en, { field: 'description_en', max: 2000 }),
    category: str(b.category, { field: 'category', max: 60 }) || 'Services',
    price: money(b.price, { field: 'price', max: 10_000_000 }),
    duration: str(b.duration, { field: 'duration', max: 60 }),
    image_url: url(b.image_url, { field: 'image_url' }),
    active: b.active !== false,
    featured: !!b.featured
  };
}

export function parseAddress(b = {}) {
  return {
    label: str(b.label, { field: 'label', max: 40 }),
    full_name: str(b.full_name, { field: 'full_name', min: 2, max: 80 }),
    phone: phone(b.phone),
    city: str(b.city, { field: 'city', min: 2, max: 60 }),
    area: str(b.area, { field: 'area', max: 60 }),
    street: str(b.street, { field: 'street', min: 3, max: 160 }),
    building: str(b.building, { field: 'building', max: 60 }),
    notes: str(b.notes, { field: 'notes', max: 300 }),
    is_default: !!b.is_default
  };
}

export function parseSettings(b = {}) {
  const color = String(b.brand_color || '').trim();
  const wa = latinDigits(b.whatsapp).replace(/\D/g, '');
  const mail = String(b.email || '').trim();
  if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) throw bad('brand_color');
  if (wa && (wa.length < 8 || wa.length > 15)) throw bad('whatsapp');
  return {
    name: str(b.name, { field: 'name', min: 2, max: 40 }),
    tagline: str(b.tagline, { field: 'tagline', max: 120 }),
    phone: phone(b.phone, { field: 'phone', optional: true }),
    whatsapp: wa,
    order_whatsapp: (() => {
      const value = latinDigits(b.order_whatsapp ?? b.whatsapp).replace(/\D/g, '');
      if (value && (value.length < 8 || value.length > 15)) throw bad('order_whatsapp');
      return value;
    })(),
    email: mail ? email(mail) : '',
    address: str(b.address, { field: 'address', max: 200 }),
    announcement: str(b.announcement, { field: 'announcement', max: 160 }),
    brand_color: color || '#0f6b5c',
    delivery_estimate: str(b.delivery_estimate, { field: 'delivery_estimate', max: 80 }),
    support_hours: str(b.support_hours, { field: 'support_hours', max: 120 }),
    return_policy: str(b.return_policy, { field: 'return_policy', max: 800 }),
    shipping_policy: str(b.shipping_policy, { field: 'shipping_policy', max: 800 }),
    logo_url: url(b.logo_url, { field: 'logo_url' }),
    wallet_enabled: b.wallet_enabled === true || b.wallet_enabled === 'true',
    wallet_note: str(b.wallet_note, { field: 'wallet_note', max: 400 })
  };
}

export function parseInquiry(b = {}) {
  return {
    name: str(b.name, { field: 'name', min: 2, max: 80 }),
    phone: phone(b.phone),
    message: str(b.message, { field: 'message', max: 1000 })
  };
}

export function parseBanner(b = {}) {
  const link = String(b.link_url || '').trim();
  if (link && !/^(\/|https?:\/\/)/i.test(link)) throw bad('link_url');
  const title = str(b.title_ar, { field: 'title_ar', max: 120 });
  const image = url(b.image_url, { field: 'image_url' });
  if (!title && !image) throw bad('title_ar');
  return {
    title_ar: title, title_en: str(b.title_en, { field: 'title_en', max: 120 }),
    subtitle_ar: str(b.subtitle_ar, { field: 'subtitle_ar', max: 200 }), subtitle_en: str(b.subtitle_en, { field: 'subtitle_en', max: 200 }),
    image_url: image, link_url: link.slice(0, 500),
    button_ar: str(b.button_ar, { field: 'button_ar', max: 40 }), button_en: str(b.button_en, { field: 'button_en', max: 40 }),
    sort_order: int(b.sort_order, { field: 'sort_order', min: 0, max: 1000, def: 0 }), active: b.active !== false
  };
}
