// BOLA AI — catalog-aware assistant.
//  1) buildReply(): works with NO external API. Understands Arabic (Egyptian + MSA) and English:
//     price / stock / compare / cheapest / deals / budget ("تحت 5000") / categories / shipping / payment.
//  2) askModel(): optional OpenAI-compatible model, grounded on the live catalog.

import { normalize } from './text.js';
import { smalltalk } from './smalltalk.js';
export { normalize };

const STOP = new Set(
  ('في من عن علي الي هل ما ماذا ايه اي ده دي دا هو هي انا انت عايز عاوز عايزه محتاج محتاجه ممكن لو يا مع او و ب ل ك كل ' +
    'اللي الي فيه فيها عندكم عندك عندي بس كده كدا شوية طيب ازاي رشحلي رشح اقتراح ' +
    'the a an is are do you have i me my want need looking for to of in on with what which any some show tell about please can could ' +
    'and or for it this that these those your our there').split(/\s+/)
);

// Small synonym groups so "لابتوب" finds "Laptop", "شاشة" finds "Display", etc.
const SYNONYMS = [
  ['laptop', 'notebook', 'لابتوب', 'لاب', 'حاسوب', 'كمبيوتر'],
  ['screen', 'monitor', 'display', 'شاشه', 'شاشات', 'مونيتور'],
  ['headphone', 'headphones', 'headset', 'earbuds', 'سماعه', 'سماعات', 'هيدفون'],
  ['keyboard', 'كيبورد', 'كيبوردات'],
  ['mouse', 'ماوس'],
  ['phone', 'mobile', 'smartphone', 'موبايل', 'هاتف', 'تليفون', 'جوال'],
  ['watch', 'ساعه', 'ساعات'],
  ['speaker', 'سبيكر', 'مكبر'],
  ['accessory', 'accessories', 'اكسسوار', 'اكسسوارات'],
  ['website', 'web', 'site', 'موقع', 'مواقع'],
  ['design', 'تصميم', 'logo', 'لوجو', 'هويه', 'brand', 'identity'],
  ['consult', 'consultation', 'استشاره', 'استشارات', 'مستشار'],
  ['car', 'cars', 'vehicle', 'auto', 'سياره', 'سيارات', 'عربيه', 'عربيات', 'عربية'],
  ['game', 'games', 'toy', 'toys', 'لعبه', 'العاب', 'العب', 'بلايستيشن', 'playstation'],
  ['school', 'stationery', 'مدرسه', 'مدرسي', 'مدارس', 'ادوات', 'شنطه', 'شنطة', 'كراسه', 'كشكول']
];

function variants(word) {
  const out = new Set([word]);
  if (word.startsWith('ال') && word.length > 4) out.add(word.slice(2));
  if (word.endsWith('ات') && word.length > 4) out.add(word.slice(0, -2));
  for (const group of SYNONYMS) {
    if ([...out].some((v) => group.includes(v))) group.forEach((g) => out.add(g));
  }
  return [...out];
}

export function tokens(text) {
  return normalize(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w));
}

// "تحت 5000" / "under 5k" / "ميزانيتي 3 الاف"  ->  5000 / 5000 / 3000
export function parseBudget(text) {
  const t = normalize(text);
  const m = t.match(
    /(?:تحت|اقل من|اقل|لحد|في حدود|حدود|ميزانيتي|ميزانيه|under|below|less than|up to|within|max|budget(?: is| of)?|around)\s*(?:ب|of)?\s*(\d[\d,.]*)\s*(k|الف|الاف)?/
  );
  if (!m) return null;
  let n = Number(m[1].replace(/,/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  if (m[2]) n *= 1000;
  return n;
}

// NOTE: patterns are written in normalised form (ة→ه, ى→ي, أ→ا ...)
const RX = {
  greet: /^(اهلا|اهلا وسهلا|هلا|هاي|مرحبا|سلام|السلام عليكم|صباح الخير|مساء الخير|hello|hi|hey)[\s!.؟?]*$/,
  thanks: /(شكرا|تسلم|متشكر|thanks|thank you)/,
  price: /(سعر|بكام|كام|تكلف|price|cost|how much)/,
  stock: /(متاح|موجود|مخزون|كميه|stock|available|availability)/,
  compare: /(قارن|مقارنه|الفرق|افضل|ايهم|ولا|vs|versus|compare|difference|better|which)/,
  service: /(خدمه|خدمات|service|تصميم|موقع|برمجه|هويه|استشار)/,
  category: /(قسم|اقسام|فئه|فئات|كاتيجوري|category|categories)/,
  cheap: /(ارخص|اوفر|اقل سعر|cheapest|cheap|lowest price)/,
  expensive: /(اغلي|افخم|اعلي سعر|most expensive|premium)/,
  deals: /(عروض|عرض|خصم|تخفيض|offer|deal|discount|sale)/,
  value: /(قيمه مقابل|قيمه.*سعر|احسن.*سعر|افضل.*(قيمه|سعر)|best value|value for money|worth (it|the)|best.*(price|deal))/,
  shipping: /(شحن|توصيل|delivery|shipping)/,
  payment: /(دفع|كاش|فيزا|payment|cash on|pay )/
};

const fmt = (n) => Number(n).toLocaleString('en-US');
const discount = (i) => (i.old_price && i.old_price > i.price ? (i.old_price - i.price) / i.old_price : 0);

function scoreItem(item, words) {
  const name = normalize(`${item.name_ar} ${item.name_en}`);
  const cat = normalize(item.category);
  const desc = normalize(`${item.description_ar} ${item.description_en}`);
  const dept = normalize(item.dept_text || '');
  const attrs = normalize(item.attrs_text || '');
  let s = 0;
  for (const w of words) {
    const forms = variants(w);
    if (forms.some((f) => name.includes(f))) s += 6;
    else if (forms.some((f) => cat.includes(f) || dept.includes(f))) s += 4;
    else if (forms.some((f) => attrs.includes(f))) s += 3;
    else if (forms.some((f) => desc.includes(f))) s += 2;
  }
  return s;
}

const publicItem = ({ id, kind, name_ar, name_en, category, price, old_price, stock, duration, image_url }) => ({
  id, kind, name_ar, name_en, category, price, old_price: old_price ?? null, stock: stock ?? null, duration: duration ?? null, image_url
});

/**
 * @param {{message:string, lang:'ar'|'en', products:object[], services:object[], policy:{threshold:number,fee:number,currency:string}}} input
 * @returns {{answer:string, items:object[], intent:string}}
 */
export function buildReply({ message, lang, products, services, policy, storeName = '' }) {
  const ar = lang === 'ar';
  const cur = ar ? 'ج.م' : 'EGP';
  const t = normalize(message);
  const P = products.map((p) => ({ ...p, kind: 'product' }));
  const S = services.map((s) => ({ ...s, kind: 'service' }));
  const words = tokens(message);
  const rank = (list) =>
    list
      .map((x) => ({ x, s: scoreItem(x, words) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || Number(b.x.featured) - Number(a.x.featured))
      .map((r) => r.x);
  const matchedP = rank(P);
  const matchedS = rank(S);
  const done = (intent, answer, items = []) => ({ intent, answer, items: items.slice(0, 5).map(publicItem) });

  const chat = smalltalk(message, { lang, storeName });
  if (chat) return done(chat.kind, chat.answer);

  if (RX.greet.test(t))
    return done('greet', ar
      ? 'أهلاً بيك 👋 أنا BOLA AI. أقدر أساعدك تلاقي منتج، تقارن بين منتجات، تعرف السعر والمخزون، أو تفهم خدماتنا. جرّب تكتب: «لابتوب تحت 20000».'
      : 'Hi 👋 I’m BOLA AI. I can help you find products, compare them, check prices and stock, or explain our services. Try: “laptop under 20000”.');

  if (RX.thanks.test(t))
    return done('thanks', ar ? 'العفو! لو محتاج أي حاجة تانية أنا موجود 🙌' : 'You’re welcome! Ask me anything else about the store 🙌');

  if (RX.shipping.test(t) || RX.payment.test(t))
    return done('policy', ar
      ? `الشحن مجاني للمنتجات اللي تتخطى ${fmt(policy.threshold)} ${cur}، وأقل من كده رسوم الشحن ${fmt(policy.fee)} ${cur}. الخدمات مالهاش شحن. طريقة الدفع المتاحة حالياً: الدفع عند الاستلام.`
      : `Shipping is free on products over ${fmt(policy.threshold)} ${cur}; below that it is ${fmt(policy.fee)} ${cur}. Services have no shipping. Currently available payment method: cash on delivery.`);

  if (RX.category.test(t)) {
    const counts = new Map();
    for (const i of [...P, ...S]) {
      const label = (ar ? i.dept_ar : i.dept_en) || i.category;
      if (label) counts.set(label, (counts.get(label) || 0) + 1);
    }
    const list = [...counts].map(([c, n]) => `${c} (${n})`).join(ar ? '، ' : ', ');
    return done('categories', list ? (ar ? `الأقسام الموجودة حالياً: ${list}.` : `Current categories: ${list}.`) : ar ? 'لا توجد أقسام حالياً.' : 'No categories yet.');
  }

  const budget = parseBudget(message);
  if (budget) {
    const pool = matchedP.length ? matchedP : P;
    const within = pool.filter((p) => p.price <= budget && (p.stock ?? 1) > 0).sort((a, b) => b.price - a.price);
    if (within.length)
      return done('budget', ar
        ? `${within.length === 1 ? 'لقيت اختيار واحد' : `لقيت ${within.length} اختيارات`} في حدود ${fmt(budget)} ${cur}${within.length === 1 ? ':' : '، مرتبة من الأعلى سعراً داخل ميزانيتك:'}`
        : `I found ${within.length === 1 ? '1 option' : `${within.length} options`} within ${fmt(budget)} ${cur}${within.length === 1 ? ':' : ', best value for your budget first:'}`, within);
    const cheapest = [...P].sort((a, b) => a.price - b.price)[0];
    return done('budget-none', ar
      ? `مفيش منتجات في حدود ${fmt(budget)} ${cur} حالياً.${cheapest ? ` أرخص منتج عندنا ${fmt(cheapest.price)} ${cur}.` : ''}`
      : `Nothing fits ${fmt(budget)} ${cur} right now.${cheapest ? ` Our cheapest product is ${fmt(cheapest.price)} ${cur}.` : ''}`, cheapest ? [cheapest] : []);
  }

  if (RX.value.test(t) && matchedP.length) {
    // "best value" = rating + low price within the matching products + discount (honest: this is NOT a technical spec comparison)
    const pool = matchedP.filter((p) => (p.stock ?? 1) > 0);
    const list = pool.length ? pool : matchedP;
    const prices = list.map((p) => p.price), lo = Math.min(...prices), hi = Math.max(...prices);
    const score = (p) => 0.5 * ((p.rating || 3.5) / 5) + 0.3 * (hi === lo ? 1 : 1 - (p.price - lo) / (hi - lo)) + 0.2 * Math.min(discount(p), 0.5) / 0.5;
    const ranked = [...list].sort((a, b) => score(b) - score(a));
    return done('value', ar
      ? 'أفضل قيمة مقابل السعر عندنا (بحسب التقييم والسعر والخصم — مش مقارنة مواصفات فنية):'
      : 'Best value for money in our store (based on rating, price and discount — not a technical spec comparison):', ranked);
  }

  if (RX.cheap.test(t) || RX.expensive.test(t)) {
    const base = matchedP.length ? matchedP : P;
    const sorted = [...base].sort((a, b) => (RX.cheap.test(t) ? a.price - b.price : b.price - a.price));
    return done('sort', ar
      ? RX.cheap.test(t) ? 'دي أرخص الاختيارات المتاحة:' : 'دي أعلى الاختيارات سعراً:'
      : RX.cheap.test(t) ? 'Here are the cheapest options:' : 'Here are the premium options:', sorted);
  }

  if (RX.deals.test(t)) {
    const deals = P.filter((p) => discount(p) > 0).sort((a, b) => discount(b) - discount(a));
    return done('deals', deals.length
      ? ar ? 'دي المنتجات اللي عليها خصم دلوقتي:' : 'These products are discounted right now:'
      : ar ? 'مفيش عروض مفعّلة حالياً، بس تابعنا قريب.' : 'No active discounts right now — check back soon.', deals);
  }

  if (RX.compare.test(t) && matchedP.length >= 2)
    return done('compare', ar
      ? `لقيت ${matchedP.length} اختيارات مرتبطة بسؤالك. قارن بينهم من ناحية السعر والمخزون:`
      : `I found ${matchedP.length} relevant options. Compare their price and stock below:`, matchedP.slice(0, 4));

  if (RX.service.test(t) && matchedS.length)
    return done('services', ar ? 'دي الخدمات المطابقة لسؤالك مع السعر والمدة:' : 'These services match your request, with price and duration:', matchedS);

  if (matchedP.length) {
    const intro = RX.stock.test(t)
      ? ar ? 'دي حالة المخزون الحالية:' : 'Current stock status:'
      : RX.price.test(t)
        ? ar ? 'دي الأسعار الحالية من الكتالوج:' : 'Current prices from the catalog:'
        : ar ? 'لقيت الآتي مرتبط بسؤالك. لو قلتلي ميزانيتك أضيّق الاختيار أكتر:' : 'Here is what I found. Tell me your budget and I can narrow it down:';
    return done('products', intro, matchedP);
  }

  if (matchedS.length)
    return done('services', ar ? 'لقيت خدمات مرتبطة بسؤالك:' : 'I found services related to your request:', matchedS);

  const cats = [...new Set(P.map((p) => (ar ? p.dept_ar : p.dept_en) || p.category).filter(Boolean))].slice(0, 4).join(ar ? '، ' : ', ');
  return done('none', ar
    ? `مقدرش أجاوب على ده دلوقتي، بس أقدر أساعدك في منتجاتنا وأسعارها${cats ? ` (زي: ${cats})` : ''}، أو اكتب ميزانيتك مثلاً «تحت 5000». ولأي استفسار تاني كلّم خدمة العملاء.`
    : `I cannot answer that right now, but I can help with our products and prices${cats ? ` (e.g. ${cats})` : ''}, or give a budget like “under 5000”. For anything else, please contact customer service.`);
}

// ---------- optional generative model ----------
// Works with any OpenAI-compatible endpoint (AI_PROVIDER=openai, the default) or Anthropic's Messages API (AI_PROVIDER=anthropic).
export function providerOf(env = process.env) {
  if (env.AI_PROVIDER) return env.AI_PROVIDER === 'anthropic' ? 'anthropic' : 'openai';
  return /anthropic/i.test(env.AI_BASE_URL || '') ? 'anthropic' : 'openai';
}

export async function askModel({ message, history = [], system, env = process.env, fetchImpl = fetch }) {
  if (!env.AI_API_KEY) return null;
  const provider = providerOf(env);
  const safeHistory = history
    .filter((m) => m && ['user', 'assistant'].includes(m.role) && String(m.content || '').trim())
    .slice(-10)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 1500) }));
  const messages = [...safeHistory, { role: 'user', content: message }];
  try {
    let res;
    if (provider === 'anthropic') {
      const base = (env.AI_BASE_URL || 'https://api.anthropic.com').replace(/\/v1\/?$/, '').replace(/\/$/, '');
      res = await fetchImpl(`${base}/v1/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': env.AI_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: env.AI_MODEL || 'claude-haiku-4-5-20251001', max_tokens: 700, system, messages }),
        signal: AbortSignal.timeout(30000)
      });
      const data = await res.json();
      const text = (data?.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
      return res.ok && text ? text : null;
    }
    const base = (env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    res = await fetchImpl(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.AI_API_KEY}` },
      body: JSON.stringify({ model: env.AI_MODEL || 'gpt-4o-mini', temperature: 0.3, max_tokens: 700, messages: [{ role: 'system', content: system }, ...messages] }),
      signal: AbortSignal.timeout(30000)
    });
    const data = await res.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    return res.ok && answer ? answer : null;
  } catch (e) {
    console.warn('AI provider unavailable, using catalog assistant:', e.message);
    return null;
  }
}
