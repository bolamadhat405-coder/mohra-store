import { normalize } from './text.js';
import { smalltalk } from './smalltalk.js';

// Customer-service bot: rule-based answers that always work (no external service), used on their own when there is no model key
// and as the source of "actions" (login / open my orders / WhatsApp / leave a message for a person) in both modes.
const ST = {
  ar: { pending: 'قيد المراجعة', confirmed: 'تم التأكيد', processing: 'جاري التجهيز', shipped: 'تم الشحن (في الطريق)', delivered: 'تم التسليم', cancelled: 'ملغي' },
  en: { pending: 'pending review', confirmed: 'confirmed', processing: 'being prepared', shipped: 'shipped (on its way)', delivered: 'delivered', cancelled: 'cancelled' }
};
const HINT = {
  ar: { pending: 'لسه ما اتأكدش — تقدر تلغيه من صفحة «حسابي ← طلباتي».', confirmed: 'اتأكد وبيتجهز.', processing: 'بنجهّزه للشحن.', shipped: 'خرج للتوصيل.', delivered: 'اتسلّم. لو في مشكلة قولّي.', cancelled: 'الطلب ده ملغي.' },
  en: { pending: 'Not confirmed yet — you can cancel it from My account → Orders.', confirmed: 'Confirmed and being prepared.', processing: 'We are preparing it for shipping.', shipped: 'It is out for delivery.', delivered: 'It was delivered. Tell me if something is wrong.', cancelled: 'This order is cancelled.' }
};
const RX = {
  human: /(موظف|شخص حقيقي|حد يكلمني|اكلم حد|كلم حد|ممثل|شكوي|شكاوي|human|agent|representative|complaint|speak to|talk to (a )?(person|human))/,
  order: /(طلبي|طلب رقم|اوردر|الاوردر|فين طلب|فين الطلب|تتبع|حاله الطلب|شحنتي|track|order status|where is my order|my order)/,
  returns: /(ارجاع|استرجاع|ارجع|استبدال|استبدل|رجوع|استرداد|return|refund|exchange)/,
  cancel: /(الغاء|الغي|cancel)/,
  shipping: /(شحن|توصيل|ميعاد|تكلفه التوصيل|delivery|shipping)/,
  payment: /(دفع|كاش|فيزا|تقسيط|payment|cash|installment)/,
  contact: /(رقم (التليفون|الموبايل|المتجر|الشركه)|تليفون|واتساب|واتس|عنوان|فرع|ساعات العمل|مواعيد|contact|phone|whatsapp|address|opening|hours)/
};

const money = (n, ar) => `${Number(n).toLocaleString('en-US')} ${ar ? 'ج.م' : 'EGP'}`;
const day = (d, ar) => new Intl.DateTimeFormat(ar ? 'ar-EG-u-nu-latn' : 'en-GB', { dateStyle: 'medium', timeZone: 'Africa/Cairo' }).format(new Date(d));

/**
 * @returns {{intent:string, answer:string, actions:{type:string,url?:string}[]}}
 */
export function supportReply({ message, lang = 'ar', site = {}, orders = [], loggedIn = false, policy = { threshold: 3000, fee: 80 } }) {
  const ar = lang === 'ar';
  const t = normalize(message);
  const wa = site.whatsapp ? { type: 'whatsapp', url: `https://wa.me/${site.whatsapp}` } : null;
  const ticket = { type: 'ticket' };
  const out = (intent, answer, actions = []) => ({ intent, answer, actions });

  if (RX.human.test(t)) return out('human', ar ? 'أكيد — اترك اسمك ورقمك وموظف من فريقنا هيتواصل معاك في أقرب وقت. ممكن كمان تكلمنا واتساب لو متاح.' : 'Of course — leave your name and number and a team member will contact you soon. You can also message us on WhatsApp if available.', [ticket, ...(wa ? [wa] : [])]);

  if (RX.order.test(t)) {
    if (!loggedIn) return out('order-login', ar ? 'علشان أشوفلك حالة طلبك سجّل دخولك الأول، وبعدها اسألني تاني.' : 'Please log in first so I can check your order, then ask me again.', [{ type: 'login' }]);
    if (!orders.length) return out('order-none', ar ? 'مفيش طلبات على حسابك لحد دلوقتي.' : 'There are no orders on your account yet.', []);
    const n = (t.match(/\d{1,9}/) || [])[0];
    const o = (n && orders.find((x) => String(x.id) === n)) || orders[0];
    return out('order', ar
      ? `طلبك رقم #${o.id} (${day(o.created_at, true)}) حالته: ${ST.ar[o.status] || o.status} — الإجمالي ${money(o.total, true)}. ${HINT.ar[o.status] || ''}`
      : `Your order #${o.id} (${day(o.created_at, false)}) is ${ST.en[o.status] || o.status} — total ${money(o.total, false)}. ${HINT.en[o.status] || ''}`, [{ type: 'orders' }]);
  }

  if (RX.returns.test(t)) return out('returns', site.return_policy || (ar ? 'سياسة الاسترجاع والاستبدال بتحددها إدارة المتجر حسب نوع المنتج. اترك طلبك وموظف هيتواصل معاك بالتفاصيل.' : 'Returns and exchanges depend on the product and are decided by the store. Leave your request and a team member will explain the details.'), [ticket, ...(wa ? [wa] : [])]);
  if (RX.cancel.test(t)) return out('cancel', ar ? 'تقدر تلغي الطلب بنفسك من «حسابي ← طلباتي» طالما لسه «قيد المراجعة». لو اتأكد أو اتشحن كلّم موظف.' : 'You can cancel an order yourself from My account → Orders while it is still pending. If it is confirmed or shipped, please talk to a team member.', [{ type: 'orders' }, ticket]);
  if (RX.shipping.test(t)) return out('shipping', (ar ? `الشحن مجاني للمنتجات فوق ${money(policy.threshold, true)}، وأقل من كده ${money(policy.fee, true)}. الخدمات مالهاش شحن.` : `Shipping is free on products over ${money(policy.threshold, false)}; below that it is ${money(policy.fee, false)}. Services have no shipping.`) + (site.delivery_estimate ? (ar ? ` التوصيل المتوقع: ${site.delivery_estimate}.` : ` Estimated delivery: ${site.delivery_estimate}.`) : '') + (site.shipping_policy ? ` ${site.shipping_policy}` : ''));
  if (RX.payment.test(t)) return out('payment', ar ? 'طريقة الدفع المتاحة حاليًا: الدفع عند الاستلام كاش للمندوب.' : 'Currently available: cash on delivery.');
  if (RX.contact.test(t)) {
    const lines = [site.phone && (ar ? `الهاتف: ${site.phone}` : `Phone: ${site.phone}`), site.email && (ar ? `البريد: ${site.email}` : `Email: ${site.email}`), site.address && (ar ? `العنوان: ${site.address}` : `Address: ${site.address}`), site.support_hours && (ar ? `مواعيد العمل: ${site.support_hours}` : `Hours: ${site.support_hours}`)].filter(Boolean);
    return lines.length || wa
      ? out('contact', lines.join('\n') || (ar ? 'تقدر تكلمنا على واتساب.' : 'You can reach us on WhatsApp.'), wa ? [wa] : [])
      : out('contact-none', ar ? 'بيانات التواصل لسه مش مضافة. اترك رسالتك وهنرد عليك.' : 'Contact details are not listed yet. Leave a message and we will get back to you.', [ticket]);
  }
  const chat = smalltalk(message, { lang, storeName: site.name });
  if (chat && chat.kind !== 'math') return out(chat.kind, chat.answer);
  return out('default', ar ? 'أقدر أساعدك في: تتبع طلبك، الشحن والدفع، الاسترجاع، أو أحوّلك لموظف. اكتب سؤالك أو اختار من الأزرار.' : 'I can help with: order tracking, shipping and payment, returns, or connect you to a team member. Type your question or pick a button.', [ticket]);
}
