import { normalize } from './text.js';

// Everyday chat that needs no catalog: how are you, what time is it, what day is it, who are you, simple arithmetic.
// Honest by design: when someone asks whether they are talking to a person or a bot, it says it is an automated assistant.
const TZ = 'Africa/Cairo';

function calc(expr) {
  // tiny recursive-descent parser (+ - * / and parentheses) — no eval()
  const src = expr.replace(/\s+/g, '');
  let i = 0;
  const num = () => {
    if (src[i] === '(') { i++; const v = add(); if (src[i] !== ')') throw new Error('paren'); i++; return v; }
    if (src[i] === '-') { i++; return -num(); }
    const m = /^\d+(\.\d+)?/.exec(src.slice(i));
    if (!m) throw new Error('num');
    i += m[0].length;
    return Number(m[0]);
  };
  const mul = () => { let v = num(); while (src[i] === '*' || src[i] === '/') { const o = src[i++]; const r = num(); v = o === '*' ? v * r : v / r; } return v; };
  const add = () => { let v = mul(); while (src[i] === '+' || src[i] === '-') { const o = src[i++]; const r = mul(); v = o === '+' ? v + r : v - r; } return v; };
  const out = add();
  if (i !== src.length || !Number.isFinite(out)) throw new Error('bad');
  return out;
}

/** @returns {{kind:string, answer:string}|null} */
export function smalltalk(message, { now = new Date(), lang = 'ar', storeName = '' } = {}) {
  const ar = lang === 'ar';
  const t = normalize(message).replace(/[؟?!.،,]+/g, ' ').replace(/\s+/g, ' ').trim();
  const name = storeName || (ar ? 'المتجر' : 'the store');
  const fmt = (o) => new Intl.DateTimeFormat(ar ? 'ar-EG-u-nu-latn' : 'en-GB', { timeZone: TZ, ...o }).format(now);

  if (/(كام الساعه|الساعه كام|الساعه كم|الساعه الان|الساعه دلوقتي|الوقت الان|الوقت دلوقتي|كم الساعه|what time|current time|time is it|time now)/.test(t) && !/(توصيل|شحن|تسليم|delivery)/.test(t))
    return { kind: 'time', answer: ar ? `الساعة دلوقتي ${fmt({ hour: 'numeric', minute: '2-digit', hour12: true })} بتوقيت القاهرة.` : `It is ${fmt({ hour: 'numeric', minute: '2-digit', hour12: true })} in Cairo right now.` };

  if (/((النهارده|اليوم) (ايه|اي|كام)|تاريخ (النهارده|اليوم)|ايه تاريخ|what day is|today'?s date|what is the date|what'?s the date)/.test(t))
    return { kind: 'date', answer: ar ? `النهاردة ${fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.` : `Today is ${fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.` };

  if (/(انت (انسان|بني ادم|شخص|حقيقي|روبوت|بوت|ذكاء)|هل انت|انتي (انسانه|بوت|روبوت)|are you (a )?(human|real|person|robot|bot|ai)|is this (a )?(bot|ai|human))/.test(t))
    return { kind: 'identity', answer: ar ? 'أنا مساعد آلي (برنامج محادثة) بتاع المتجر، مش شخص حقيقي. بحاول أساعدك بأفضل ما أقدر، ولو محتاج موظف بشري كلّم خدمة العملاء.' : 'I am the store\'s automated assistant (a chat program), not a real person. I will do my best to help, and if you need a human, please contact customer service.' };

  if (/(الموقع|المتجر|الموقع ده|site|website|store).*(معمول|مصنوع|اتعمل|اتبنى|مبني|بنوه|made|built|created)|(who|مين).*(made|built|عمل|بنى|صمم)/.test(t))
    return { kind: 'builder', answer: ar ? 'أنا المساعد الآلي للمتجر ومعنديش تفاصيل عن طريقة بناء الموقع أو مين اشتغل عليه. لو عايز تعرف، اسأل إدارة المتجر مباشرة.' : 'I am the store\'s automated assistant and I do not have details about how or by whom the website was built. Please ask the store team directly.' };

  if (/(انت مين|انتي مين|مين انت|اسمك ايه|اسمك اي|who are you|your name|what are you)/.test(t))
    return { kind: 'who', answer: ar ? `أنا المساعد الافتراضي بتاع ${name}. أقدر أساعدك تلاقي منتجات وتقارن الأسعار، وأجاوب على أسئلة كتير.` : `I am the virtual assistant of ${name}. I can help you find products, compare prices and answer many questions.` };

  if (/(عامل ايه|عامله ايه|عامل اي|ازيك|ازايك|اخبارك|اخبار ايه|شلونك|كيف حالك|كيفك|how are you|how'?s it going|how do you do|whats up|what'?s up)/.test(t))
    return { kind: 'howareyou', answer: ar ? 'الحمد لله تمام، شكرًا على سؤالك 😊 وإنت عامل إيه؟ أقدر أساعدك في إيه النهاردة؟' : 'I am doing well, thank you 😊 How are you? What can I help you with today?' };

  // arithmetic: "5 + 3", "كام 12*4", "احسب (100-20)/4"
  const mathText = t.replace(/[×x]/g, '*').replace(/÷/g, '/').replace(/(كام|احسب|ناتج|يساوي|يساوى|equals|calculate|what is|what'?s|=)/g, ' ').trim();
  if (/^[\d\s.+\-*/()]+$/.test(mathText) && /\d\s*[+\-*/]\s*[\d(]/.test(mathText) && (mathText.match(/\d+/g) || []).length >= 2) {
    try { const v = calc(mathText); return { kind: 'math', answer: `${mathText.replace(/\s+/g, ' ')} = ${Number(v.toFixed(6)).toLocaleString('en-US')}` }; } catch { /* not a sum */ }
  }
  return null;
}
