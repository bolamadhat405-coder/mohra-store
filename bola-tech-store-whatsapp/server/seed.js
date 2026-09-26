import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { pool, q } from './db.js';
import { migrate } from './migrate.js';
import * as v from './lib/validate.js';
import { passwordIssue } from './lib/password.js';

const rawEmail = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const configuredAdminId = String(process.env.ADMIN_ID || '').trim();
if (!rawEmail || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first');
if (password.startsWith('CHANGE_ME')) throw new Error('Choose a real ADMIN_PASSWORD in .env (not the placeholder).');
if (password.length < 10 || passwordIssue(password, { email: rawEmail })) throw new Error('ADMIN_PASSWORD is too weak: use 10+ characters mixing letters and numbers, not a common password.');

await migrate();

const email = v.email(rawEmail);
const hash = await bcrypt.hash(password, 12);
let adminId = configuredAdminId || ('BOLA-ADMIN-' + crypto.randomBytes(4).toString('hex').toUpperCase());
if (!/^BOLA-ADMIN-[A-Z0-9]{8,32}$/.test(adminId)) throw new Error('ADMIN_ID must look like BOLA-ADMIN-XXXXXXXX');
const existing = (await q('SELECT admin_id FROM users WHERE email=$1',[email])).rows[0];
if (existing?.admin_id) adminId = existing.admin_id;
await q(
  `INSERT INTO users(name,email,admin_id,password_hash,role) VALUES($1,$2,$3,$4,'admin')
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, admin_id = COALESCE(users.admin_id, EXCLUDED.admin_id), role = 'admin', is_active = true, failed_logins = 0, locked_until = NULL`,
  ['Admin', email, adminId, hash]
);
console.log(`Admin ID: ${adminId}`);
await q(`INSERT INTO settings(key,value) VALUES('site',$1) ON CONFLICT (key) DO NOTHING`, [JSON.stringify({ name: 'BOLA TECH', tagline: 'كل اللي محتاجه في مكان واحد', phone: '', whatsapp: '', email: '', address: '', announcement: '', brand_color: '#0f6b5c' })]);

/* ───────── departments + their custom fields ───────── */
const S = (...pairs) => pairs.map(([ar, en]) => ({ ar, en: en || ar }));
const F = (key, type, label_ar, label_en, extra = {}) => ({ key, type, label_ar, label_en, options: [], unit: '', required: false, filterable: false, show_on_card: false, active: true, ...extra });
const departments = [
  { slug: 'electronics', name_ar: 'إلكترونيات', name_en: 'Electronics', icon: 'cpu', mode: 'cart', order: 1, desc_ar: 'أجهزة وشاشات وإكسسوارات', desc_en: 'Devices, displays and accessories',
    fields: [
      F('brand', 'select', 'الماركة', 'Brand', { options: S(['BOLA'], ['Vision'], ['أخرى', 'Other']), filterable: true, show_on_card: true }),
      F('warranty', 'select', 'الضمان', 'Warranty', { options: S(['بدون ضمان', 'No warranty'], ['سنة', '1 year'], ['سنتان', '2 years']), filterable: true }),
      F('color', 'text', 'اللون', 'Color')
    ] },
  { slug: 'cars', name_ar: 'سيارات', name_en: 'Cars', icon: 'car', mode: 'inquiry', order: 2, desc_ar: 'سيارات جديدة ومستعملة — تواصل معنا للمعاينة', desc_en: 'New and used cars — contact us to view',
    fields: [
      F('brand', 'select', 'الماركة', 'Brand', { options: S(['تويوتا', 'Toyota'], ['هيونداي', 'Hyundai'], ['كيا', 'Kia'], ['نيسان', 'Nissan'], ['شيفروليه', 'Chevrolet'], ['أخرى', 'Other']), filterable: true, required: true }),
      F('model', 'text', 'الموديل', 'Model', { required: true }),
      F('year', 'number', 'سنة الصنع', 'Year', { required: true, show_on_card: true }),
      F('mileage', 'number', 'الكيلومترات', 'Mileage', { unit: 'كم', show_on_card: true }),
      F('fuel', 'select', 'الوقود', 'Fuel', { options: S(['بنزين', 'Petrol'], ['ديزل', 'Diesel'], ['كهرباء', 'Electric'], ['هجين', 'Hybrid']), filterable: true, show_on_card: true }),
      F('transmission', 'select', 'ناقل الحركة', 'Transmission', { options: S(['أوتوماتيك', 'Automatic'], ['يدوي', 'Manual']), filterable: true }),
      F('condition', 'select', 'الحالة', 'Condition', { options: S(['جديدة', 'New'], ['مستعملة', 'Used']), filterable: true, show_on_card: true }),
      F('color', 'text', 'اللون', 'Color'),
      F('features', 'textarea', 'المميزات', 'Features')
    ] },
  { slug: 'games', name_ar: 'ألعاب', name_en: 'Games & Toys', icon: 'gamepad', mode: 'cart', order: 3, desc_ar: 'ألعاب أطفال وألعاب فيديو ولوحية', desc_en: 'Toys, video games and board games',
    fields: [
      F('type', 'select', 'النوع', 'Type', { options: S(['ألعاب أطفال', 'Toys'], ['ألعاب فيديو', 'Video games'], ['ألعاب لوحية', 'Board games']), filterable: true, show_on_card: true, required: true }),
      F('age', 'select', 'السن المناسب', 'Age', { options: S(['3+'], ['6+'], ['12+'], ['16+']), filterable: true, show_on_card: true }),
      F('platform', 'select', 'المنصة', 'Platform', { options: S(['PlayStation'], ['Xbox'], ['PC'], ['Nintendo'], ['غير ذلك', 'N/A']), filterable: true }),
      F('brand', 'text', 'الماركة', 'Brand')
    ] },
  { slug: 'school', name_ar: 'مستلزمات مدرسية', name_en: 'School supplies', icon: 'book', mode: 'cart', order: 4, desc_ar: 'شنط وكراسات وأدوات لكل المراحل', desc_en: 'Bags, notebooks and tools for every grade',
    fields: [
      F('grade', 'select', 'المرحلة', 'Grade', { options: S(['رياض أطفال', 'Kindergarten'], ['ابتدائي', 'Primary'], ['إعدادي', 'Preparatory'], ['ثانوي', 'Secondary'], ['جامعي', 'University'], ['كل المراحل', 'All grades']), filterable: true, show_on_card: true }),
      F('brand', 'text', 'الماركة', 'Brand', { show_on_card: true }),
      F('pack', 'text', 'محتوى العبوة', 'Pack contents')
    ] }
];
const deptId = {};
for (const d of departments) {
  const row = (
    await q(
      `INSERT INTO departments(slug,name_ar,name_en,description_ar,description_en,icon,purchase_mode,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug RETURNING id`,
      [d.slug, d.name_ar, d.name_en, d.desc_ar, d.desc_en, d.icon, d.mode, d.order]
    )
  ).rows[0];
  deptId[d.slug] = row.id;
  for (const [i, f] of d.fields.entries()) {
    await q(
      `INSERT INTO department_fields(department_id,key,label_ar,label_en,type,options,unit,required,filterable,show_on_card,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (department_id,key) DO NOTHING`,
      [row.id, f.key, f.label_ar, f.label_en, f.type, JSON.stringify(f.options), f.unit, f.required, f.filterable, f.show_on_card, i]
    );
  }
}

/* ───────── sample products (images optional — a neutral placeholder is drawn when empty) ───────── */
const P = (dept, name_ar, name_en, slug, desc_ar, desc_en, category, price, old_price, stock, image, featured, attributes) =>
  ({ dept, name_ar, name_en, slug, desc_ar, desc_en, category, price, old_price, stock, image, featured, attributes });
const products = [
  P('electronics', 'BOLA TECH X1', 'BOLA TECH X1', 'bola-tech-x1', 'لابتوب بأداء قوي وتجربة تقنية متكاملة', 'A laptop with powerful performance and a complete tech experience', 'أجهزة', 18999, 21999, 12, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900', true, { brand: 'BOLA', warranty: 'سنتان' }),
  P('electronics', 'BOLA CORE PRO', 'BOLA CORE PRO', 'bola-core-pro', 'إكسسوار احترافي للاستخدام اليومي', 'A professional everyday accessory', 'إكسسوارات', 2499, 2999, 28, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=900', true, { brand: 'BOLA', warranty: 'سنة' }),
  P('electronics', 'VISION DISPLAY', 'VISION DISPLAY', 'vision-display', 'شاشة حديثة للمكتب وصناعة المحتوى', 'A modern display for work and content creation', 'شاشات', 7999, 8999, 16, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=900', true, { brand: 'Vision', warranty: 'سنتان' }),
  P('electronics', 'BOLA SOUND ONE', 'BOLA SOUND ONE', 'bola-sound-one', 'سماعة لاسلكية بعزل ضوضاء وصوت نقي', 'Wireless headphones with noise isolation', 'صوتيات', 3299, 3799, 20, '', true, { brand: 'BOLA', warranty: 'سنة' }),
  P('electronics', 'BOLA KEY 75', 'BOLA KEY 75', 'bola-key-75', 'كيبورد ميكانيكي بإضاءة وتصميم مدمج', 'A compact mechanical keyboard with backlight', 'إكسسوارات', 1499, null, 35, '', false, { brand: 'BOLA' }),
  P('electronics', 'BOLA MOUSE AIR', 'BOLA MOUSE AIR', 'bola-mouse-air', 'ماوس لاسلكي خفيف ودقيق', 'A light, precise wireless mouse', 'إكسسوارات', 799, 999, 60, '', false, { brand: 'BOLA' }),
  P('electronics', 'VISION 4K 27', 'VISION 4K 27', 'vision-4k-27', 'شاشة 4K مقاس 27 بوصة بألوان دقيقة', 'A 27-inch 4K display', 'شاشات', 11499, null, 9, '', false, { brand: 'Vision' }),
  P('electronics', 'BOLA PHONE S', 'BOLA PHONE S', 'bola-phone-s', 'موبايل بكاميرا ممتازة وبطارية تدوم يوم كامل', 'A phone with an excellent camera', 'موبايلات', 14999, 16499, 3, '', true, { brand: 'BOLA', warranty: 'سنة' }),
  P('cars', 'تويوتا كورولا 2020', 'Toyota Corolla 2020', 'toyota-corolla-2020', 'كورولا فابريكا بالكامل، صيانة توكيل، رخصة سارية.', 'Fully factory-paint Corolla, dealer maintained, valid license.', 'سيدان', 780000, null, 1, '', true, { brand: 'تويوتا', model: 'كورولا', year: 2020, mileage: 62000, fuel: 'بنزين', transmission: 'أوتوماتيك', condition: 'مستعملة', color: 'أبيض', features: 'كاميرا خلفية\nتكييف أوتوماتيك\nحساسات ركن' }),
  P('cars', 'هيونداي إلنترا 2023', 'Hyundai Elantra 2023', 'hyundai-elantra-2023', 'زيرو بضمان الوكيل، فتحة سقف وجلد.', 'Brand new with dealer warranty, sunroof and leather.', 'سيدان', 1150000, null, 2, '', true, { brand: 'هيونداي', model: 'إلنترا', year: 2023, mileage: 0, fuel: 'بنزين', transmission: 'أوتوماتيك', condition: 'جديدة', color: 'رمادي' }),
  P('cars', 'كيا سبورتاج 2019', 'Kia Sportage 2019', 'kia-sportage-2019', 'حالة ممتازة، صيانة دورية، بدون حوادث.', 'Excellent condition, regular maintenance, no accidents.', 'SUV', 890000, null, 1, '', false, { brand: 'كيا', model: 'سبورتاج', year: 2019, mileage: 88000, fuel: 'بنزين', transmission: 'أوتوماتيك', condition: 'مستعملة', color: 'أسود' }),
  P('cars', 'نيسان صني 2021', 'Nissan Sunny 2021', 'nissan-sunny-2021', 'اقتصادية في الوقود، مناسبة للاستخدام اليومي.', 'Fuel-efficient, ideal for daily use.', 'سيدان', 520000, null, 1, '', false, { brand: 'نيسان', model: 'صني', year: 2021, mileage: 41000, fuel: 'بنزين', transmission: 'يدوي', condition: 'مستعملة', color: 'فضي' }),
  P('games', 'ليجو سيتي — مركز الشرطة', 'LEGO City Police Station', 'lego-city-police', 'مجموعة بناء 400 قطعة مع 4 شخصيات.', 'A 400-piece building set with 4 minifigures.', 'ألعاب أطفال', 1350, 1550, 14, '', true, { type: 'ألعاب أطفال', age: '6+', brand: 'LEGO' }),
  P('games', 'لعبة FC 25 للبلايستيشن 5', 'FC 25 for PlayStation 5', 'fc-25-ps5', 'أحدث إصدار من لعبة كرة القدم الأشهر.', 'The latest release of the popular football game.', 'ألعاب فيديو', 2100, null, 10, '', false, { type: 'ألعاب فيديو', age: '12+', platform: 'PlayStation' }),
  P('games', 'لعبة الطاولة الاستراتيجية', 'Strategy Board Game', 'strategy-board-game', 'لعبة عائلية لـ 2–5 لاعبين، مدة اللعبة 45 دقيقة.', 'A family game for 2–5 players, 45 minutes.', 'ألعاب لوحية', 650, null, 22, '', false, { type: 'ألعاب لوحية', age: '12+' }),
  P('games', 'سيارة ريموت كنترول', 'Remote-control car', 'rc-car', 'سيارة سريعة بريموت وبطارية قابلة للشحن.', 'A fast RC car with a rechargeable battery.', 'ألعاب أطفال', 480, 590, 30, '', false, { type: 'ألعاب أطفال', age: '6+' }),
  P('school', 'شنطة مدرسية — ابتدائي', 'Primary school backpack', 'primary-backpack', 'شنطة خفيفة بحزام مبطن وجيوب متعددة.', 'A light backpack with padded straps and many pockets.', 'شنط', 550, 650, 40, '', true, { grade: 'ابتدائي', brand: 'SmartKid', pack: 'شنطة واحدة' }),
  P('school', 'كشاكيل — عبوة 6', 'Notebooks — pack of 6', 'notebooks-6', 'كشاكيل 80 ورقة، غلاف مقوى.', '80-page notebooks with hard covers.', 'كراسات', 120, null, 120, '', false, { grade: 'كل المراحل', brand: 'Alfa', pack: '6 كشاكيل × 80 ورقة' }),
  P('school', 'طقم أدوات هندسية', 'Geometry set', 'geometry-set', 'مسطرة ومنقلة وفرجار وزاويتان في علبة.', 'Ruler, protractor, compass and set squares in a case.', 'أدوات', 85, null, 70, '', false, { grade: 'إعدادي', brand: 'Alfa' }),
  P('school', 'آلة حاسبة علمية', 'Scientific calculator', 'scientific-calculator', '240 دالة، مناسبة للثانوية والجامعة.', '240 functions, for secondary school and university.', 'أدوات', 420, 480, 25, '', false, { grade: 'ثانوي', brand: 'Casio' })
];
for (const p of products) {
  await q(
    `INSERT INTO products(name_ar,name_en,slug,description_ar,description_en,category,price,old_price,stock,image_url,images,featured,department_id,attributes)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (slug) DO NOTHING`,
    [p.name_ar, p.name_en, p.slug, p.desc_ar, p.desc_en, p.category, p.price, p.old_price, p.stock, p.image, JSON.stringify(p.image ? [p.image] : []), p.featured, deptId[p.dept], JSON.stringify(p.attributes)]
  );
}

const services = [
  ['تصميم موقع احترافي', 'Professional Website Design', 'website-design', 'تصميم وتطوير موقع سريع ومتجاوب', 'Design and development of a fast, responsive website', 'تطوير مواقع', 3500, '7-14 days', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900', true],
  ['هوية بصرية رقمية', 'Digital Brand Identity', 'brand-identity', 'هوية بصرية وشعار وألوان متناسقة', 'Logo, colors and a cohesive visual identity', 'تصميم', 2200, '3-7 days', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900', true],
  ['استشارة تقنية', 'Technical Consultation', 'consulting', 'جلسة تحليل وخطة تنفيذ لمشروعك', 'Project analysis and an implementation plan', 'استشارات', 500, '60 minutes', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900', true],
  ['متجر إلكتروني متكامل', 'Full E-commerce Store', 'ecommerce-store', 'متجر جاهز للبيع مع لوحة تحكم وإدارة مخزون', 'A ready-to-sell store with dashboard and inventory management', 'تطوير مواقع', 9500, '3-5 weeks', '', false],
  ['دعم فني شهري', 'Monthly Tech Support', 'monthly-support', 'صيانة ومتابعة ودعم فني لموقعك كل شهر', 'Monthly maintenance, monitoring and support for your site', 'استشارات', 1200, 'Monthly', '', false]
];
for (const s of services) {
  await q(
    `INSERT INTO services(name_ar,name_en,slug,description_ar,description_en,category,price,duration,image_url,featured)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (slug) DO NOTHING`,
    s
  );
}

console.log(`V15 database ready. Admin: ${email}`);
await pool.end();
