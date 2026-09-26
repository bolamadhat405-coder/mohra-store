/* Shared frontend core: i18n, API, session, header/footer, cart, checkout, product modal, assistant widget. */
(() => {
  'use strict';
  const d = document;
  const $ = (s, r = d) => r.querySelector(s);
  const $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const esc = (x) => String(x ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
    sget: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
    sset: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} }
  };
  const lang = store.get('bola_lang') === 'en' ? 'en' : 'ar';

  /* ───────── i18n ───────── */
  const I18N = {
    ar: {
      cur: 'ج.م', close: 'إغلاق', loading: 'جاري التحميل...', retry: 'إعادة المحاولة', cancel: 'إلغاء', save: 'حفظ', delete: 'حذف', edit: 'تعديل', back: 'رجوع', yes: 'نعم', no: 'لا', search: 'بحث', all: 'الكل',
      'nav.home': 'الرئيسية', 'nav.store': 'المنتجات', 'nav.services': 'الخدمات', 'nav.assistant': 'المساعد', 'nav.account': 'حسابي', 'nav.admin': 'لوحة التحكم', 'nav.login': 'دخول', 'nav.menu': 'القائمة', 'nav.cart': 'السلة', 'nav.wishlist': 'المفضلة', 'nav.theme': 'تغيير المظهر', 'nav.lang': 'English',
      'foot.tag': 'منتجات تقنية وخدمات رقمية في مكان واحد.', 'foot.shop': 'التسوق', 'foot.account': 'حسابي', 'foot.orders': 'طلباتي', 'foot.rights': 'جميع الحقوق محفوظة',
      'card.add': 'أضف للسلة', 'card.out': 'غير متاح', 'card.left': 'متبقي {n} فقط', 'card.inStock': 'متاح', 'card.reviews': '{n} تقييم', 'card.details': 'التفاصيل', 'card.wish': 'أضف للمفضلة', 'card.unwish': 'إزالة من المفضلة', 'card.off': 'خصم {p}%', 'card.free': 'مجاني',
      'toast.added': 'تمت الإضافة للسلة', 'toast.viewCart': 'عرض السلة', 'toast.loginFirst': 'سجّل الدخول أولاً', 'toast.login': 'دخول', 'toast.wishAdded': 'أُضيف للمفضلة', 'toast.wishRemoved': 'أُزيل من المفضلة',
      'cart.title': 'سلة التسوق', 'cart.empty': 'السلة فاضية', 'cart.emptyHint': 'ضيف منتجات أو خدمات وهتظهر هنا.', 'cart.loginHint': 'سجّل الدخول علشان تشوف سلتك وتكمّل الطلب.', 'cart.subtotal': 'المجموع الفرعي', 'cart.shipping': 'الشحن', 'cart.total': 'الإجمالي', 'cart.checkout': 'إتمام الطلب', 'cart.remove': 'حذف', 'cart.freeShip': 'الشحن مجاني 🎉', 'cart.moreFree': 'أضف {n} للحصول على شحن مجاني', 'cart.noShipping': 'بدون شحن', 'cart.unavail': 'غير متاح حالياً أو الكمية أكبر من المخزون — عدّل الكمية أو احذفه.', 'cart.browse': 'تصفح المنتجات', 'cart.each': 'للوحدة',
      'co.title': 'إتمام الطلب', 'co.address': 'عنوان التوصيل', 'co.newAddress': 'إضافة عنوان جديد', 'co.useSaved': 'استخدم عنوان محفوظ', 'co.notes': 'ملاحظات للطلب (اختياري)', 'co.payment': 'تأكيد الطلب عبر واتساب', 'co.whatsapp': 'إرسال الطلب على واتساب', 'co.whatsappHint': 'بعد إنشاء الطلب هيفتح واتساب برسالة جاهزة بكل تفاصيل طلبك لإرسالها للمتجر.', 'co.place': 'تأكيد وإرسال الطلب', 'co.summary': 'ملخص الطلب', 'co.noShipService': 'طلبك خدمات فقط — مفيش عنوان مطلوب، هنتواصل معاك على رقمك.', 'co.doneTitle': 'تم استلام طلبك 🎉', 'co.doneText': 'رقم الطلب #{id} — الإجمالي {total}. هتقدر تتابع حالته من صفحة طلباتي.', 'co.myOrders': 'طلباتي', 'co.continue': 'مواصلة التسوق',
      'addr.label': 'اسم العنوان (البيت، الشغل...)', 'addr.full_name': 'اسم المستلم', 'addr.phone': 'رقم الموبايل', 'addr.city': 'المحافظة', 'addr.area': 'المنطقة / الحي', 'addr.street': 'الشارع', 'addr.building': 'رقم المبنى / الشقة', 'addr.notes': 'علامة مميزة (اختياري)', 'addr.default': 'اجعله العنوان الافتراضي', 'addr.defaultTag': 'افتراضي',
      'pm.reviews': 'التقييمات', 'pm.noReviews': 'لا توجد تقييمات بعد.', 'pm.writeReview': 'قيّم المنتج', 'pm.yourRating': 'تقييمك', 'pm.comment': 'اكتب رأيك (اختياري)', 'pm.submit': 'إرسال التقييم', 'pm.needBuy': 'التقييم متاح بعد شراء المنتج.', 'pm.thanks': 'شكراً على تقييمك!', 'pm.qty': 'الكمية', 'pm.duration': 'المدة', 'pm.category': 'القسم', 'pm.notFound': 'المنتج غير موجود أو غير متاح.',
      'sup.title': 'خدمة العملاء', 'sup.status': 'متاحين لمساعدتك', 'sup.hello': 'أهلاً بيك في خدمة عملاء {name} 🤝 أقدر أساعدك في تتبع الطلب، الشحن والدفع، الاسترجاع، أو أحوّلك لموظف.', 'sup.q1': 'تتبع طلبي', 'sup.q1t': 'فين طلبي؟', 'sup.q2': 'الشحن والدفع', 'sup.q2t': 'الشحن والدفع بيتم إزاي؟', 'sup.q3': 'الإرجاع', 'sup.q3t': 'عايز أرجّع أو أستبدل منتج', 'sup.q4': 'كلّم موظف', 'sup.q4t': 'عايز أكلم موظف', 'sup.open': 'خدمة العملاء',
      'sup.ticketT': 'اترك رسالتك وهنتواصل معاك', 'sup.name': 'الاسم', 'sup.phone': 'رقم الموبايل', 'sup.msg': 'اكتب مشكلتك أو طلبك', 'sup.send': 'إرسال', 'sup.sent': 'وصلتنا رسالتك ✓ هنتواصل معاك قريب.', 'sup.login': 'تسجيل الدخول', 'sup.orders': 'طلباتي', 'sup.wa': 'واتساب',
      'hs.ph': 'ابحث عن منتجات، ماركات، أقسام...', 'hs.all': 'عرض كل نتائج «{q}»', 'hs.inDept': 'في قسم {d}',
      'pm.delivery': 'التوصيل المتوقع: {d}', 'pm.freeShip': 'شحن مجاني لهذا المنتج', 'pm.buyNow': 'اشتري الآن', 'pm.similar': 'منتجات مشابهة', 'pm.recent': 'شاهدت مؤخرًا',
      'cp.ph': 'عندك كود خصم؟', 'cp.apply': 'تطبيق', 'cp.applied': 'تم تطبيق الكود {code}', 'cp.remove': 'إزالة', 'cart.discount': 'خصم الكوبون', 'cp.dropped': 'اتشال كود الخصم: {why}',
      'err.COUPON_INVALID': 'كود الخصم غير صحيح.', 'err.COUPON_EXPIRED': 'كود الخصم منتهي.', 'err.COUPON_NOT_STARTED': 'كود الخصم لسه ما بدأش.', 'err.COUPON_EXHAUSTED': 'كود الخصم خلص عدد مرات استخدامه.', 'err.COUPON_USED': 'استخدمت الكود ده قبل كده.', 'err.COUPON_MIN_TOTAL': 'الكود ده بيشتغل على طلبات من {min} فأكتر.',
      'co.wallet': 'تحويل محفظة / InstaPay', 'co.walletHint': 'تحويل عبر واتساب', 'co.ref': 'رقم العملية', 'pay.wallet': 'تحويل محفظة / InstaPay', 'field.payment_ref': 'رقم عملية التحويل', 'field.code': 'الكود',
      'nt.title': 'الإشعارات', 'nt.none': 'مفيش إشعارات جديدة.', 'nt.aria': 'الإشعارات',
      'chat.title': 'مساعد {name}', 'chat.status': 'متصل بالكتالوج', 'chat.hello': 'أهلاً! أنا مساعد {name} 👋 اسألني عن أي منتج أو سعر أو مقارنة، أو حتى أي سؤال عام — وقولّي ميزانيتك وأنا أرشحلك.', 'chat.helloBasic': 'أهلاً! أنا مساعد {name} 👋 اسألني عن المنتجات والأسعار والأقسام، أو قولّي ميزانيتك وأنا أرشحلك.', 'chat.ph': 'اكتب سؤالك...', 'chat.send': 'إرسال', 'chat.q1': 'الأقسام', 'chat.q2': 'عروض', 'chat.q3': 'تحت 5000', 'chat.q4': 'أفضل قيمة', 'chat.q1t': 'إيه الأقسام الموجودة؟', 'chat.q2t': 'في عروض دلوقتي؟', 'chat.q3t': 'رشحلي حاجة تحت 5000', 'chat.q4t': 'إيه أفضل حاجة قيمة مقابل سعر؟', 'chat.fail': 'حصلت مشكلة في الاتصال. جرّب تاني بعد لحظة.', 'chat.open': 'افتح المساعد',
      'st.pending': 'قيد المراجعة', 'st.confirmed': 'تم التأكيد', 'st.processing': 'جاري التجهيز', 'st.shipped': 'تم الشحن', 'st.delivered': 'تم التسليم', 'st.cancelled': 'ملغي',
      'pay.unpaid': 'في انتظار التأكيد', 'pay.paid': 'مدفوع', 'pay.cod': 'واتساب', 'pay.whatsapp': 'طلب عبر واتساب',
      'field.email': 'البريد الإلكتروني', 'field.password': 'كلمة المرور', 'field.name': 'الاسم', 'field.phone': 'رقم الموبايل', 'field.city': 'المحافظة', 'field.street': 'الشارع', 'field.full_name': 'اسم المستلم', 'field.price': 'السعر', 'field.old_price': 'السعر قبل الخصم', 'field.stock': 'المخزون', 'field.name_ar': 'الاسم بالعربي', 'field.name_en': 'الاسم بالإنجليزي', 'field.image_url': 'رابط الصورة', 'field.rating': 'التقييم', 'field.next': 'كلمة المرور الجديدة', 'field.category': 'التصنيف الفرعي', 'field.duration': 'المدة',
      'err.GENERIC': 'حصلت مشكلة غير متوقعة. جرّب تاني.', 'err.NETWORK': 'مفيش اتصال بالسيرفر. اتأكد من الإنترنت وجرّب تاني.', 'err.AUTH_REQUIRED': 'سجّل الدخول أولاً.', 'err.INVALID_CREDENTIALS': 'البريد أو كلمة المرور غير صحيحة.', 'err.EMAIL_EXISTS': 'البريد ده مسجّل قبل كده. جرّب تسجيل الدخول.', 'err.INVALID_FIELD': 'قيمة غير صالحة في الحقل: {field}', 'err.OUT_OF_STOCK': 'المنتج غير متاح حالياً.', 'err.OUT_OF_STOCK_ITEM': '«{item}» المتاح منه {n} فقط.', 'err.ITEM_UNAVAILABLE': 'أحد العناصر لم يعد متاحاً. راجع السلة.', 'err.EMPTY_CART': 'السلة فاضية.', 'err.ADDRESS_REQUIRED': 'اختار عنوان توصيل.', 'err.RATE_LIMITED': 'محاولات كتير. استنى شوية وجرّب تاني.', 'err.NOT_FOUND': 'العنصر غير موجود.', 'err.PURCHASE_REQUIRED': 'التقييم متاح بعد الشراء فقط.', 'err.CANNOT_CANCEL': 'لا يمكن إلغاء الطلب بعد تأكيده.', 'err.ORDER_CANCELLED': 'الطلب ملغي.', 'err.TOO_MANY_ADDRESSES': 'وصلت للحد الأقصى من العناوين (10).', 'err.ADMIN_ONLY': 'الصفحة دي للإدارة فقط.', 'err.BAD_ORIGIN': 'طلب مرفوض لأسباب أمنية. أعد تحميل الصفحة.', 'err.INVALID_ITEM': 'عنصر غير صالح.',
      'err.WHATSAPP_NOT_CONFIGURED': 'رقم واتساب المتجر غير مضبوط. من لوحة التحكم ← إعدادات المتجر، أضف رقم واتساب بكود الدولة.', 'err.WEAK_PASSWORD': 'كلمة المرور ضعيفة: استخدم 8 أحرف على الأقل تجمع حروفًا وأرقامًا، وتجنّب الكلمات الشائعة أو اسمك أو بريدك.', 'err.ACCOUNT_LOCKED': 'تم إيقاف الدخول مؤقتًا بعد محاولات كتيرة. جرّب بعد {min} دقيقة.', 'err.ACCOUNT_DISABLED': 'الحساب ده موقوف. تواصل مع إدارة المتجر.', 'err.TOTP_REQUIRED': 'اكتب كود التحقق من تطبيق المصادقة.', 'err.INVALID_CODE': 'الكود غير صحيح أو منتهي.', 'err.INQUIRY_ONLY': 'المنتج ده بيتم الاستفسار عنه — مش بيتباع من السلة.', 'err.TWO_FACTOR_REQUIRED': 'لازم تفعّل التحقق بخطوتين لحسابك أولاً (من صفحة حسابي ← الأمان).', 'err.INVALID_IMAGE': 'الصورة غير مدعومة. استخدم JPG أو PNG أو WebP.', 'err.IMAGE_TOO_LARGE': 'الصورة كبيرة جدًا.', 'err.DEPARTMENT_NOT_EMPTY': 'القسم فيه منتجات ({products}). أوقفه بدل ما تحذفه.', 'err.CANNOT_EDIT_SELF': 'مينفعش تعدّل حسابك من هنا.', 'err.TWO_FACTOR_ALREADY': 'التحقق بخطوتين مفعّل بالفعل.',
      'dept.all': 'كل الأقسام', 'dept.ask': 'للاستفسار', 'card.ask': 'اسأل عن هذا العنصر', 'card.view': 'عرض التفاصيل', 'spec.title': 'المواصفات', 'spec.yes': 'نعم', 'spec.no': 'لا',
      'inq.title': 'اسأل عن هذا العنصر', 'inq.name': 'اسمك', 'inq.phone': 'رقم الموبايل', 'inq.message': 'رسالتك (اختياري)', 'inq.send': 'إرسال الاستفسار', 'inq.sent': 'وصلنا استفسارك ✓ هنتواصل معاك قريب.', 'inq.wa': 'واتساب', 'inq.call': 'اتصل', 'inq.waText': 'مرحبًا، عايز أستفسر عن: {name}',
      'foot.contact': 'تواصل معنا', 'foot.depts': 'الأقسام'
    },
    en: {
      cur: 'EGP', close: 'Close', loading: 'Loading...', retry: 'Retry', cancel: 'Cancel', save: 'Save', delete: 'Delete', edit: 'Edit', back: 'Back', yes: 'Yes', no: 'No', search: 'Search', all: 'All',
      'nav.home': 'Home', 'nav.store': 'Products', 'nav.services': 'Services', 'nav.assistant': 'Assistant', 'nav.account': 'My account', 'nav.admin': 'Control Center', 'nav.login': 'Login', 'nav.menu': 'Menu', 'nav.cart': 'Cart', 'nav.wishlist': 'Wishlist', 'nav.theme': 'Toggle theme', 'nav.lang': 'عربي',
      'foot.tag': 'Tech products and digital services in one place.', 'foot.shop': 'Shop', 'foot.account': 'Account', 'foot.orders': 'My orders', 'foot.rights': 'All rights reserved',
      'card.add': 'Add to cart', 'card.out': 'Out of stock', 'card.left': 'Only {n} left', 'card.inStock': 'In stock', 'card.reviews': '{n} reviews', 'card.details': 'Details', 'card.wish': 'Add to wishlist', 'card.unwish': 'Remove from wishlist', 'card.off': '{p}% off', 'card.free': 'Free',
      'toast.added': 'Added to cart', 'toast.viewCart': 'View cart', 'toast.loginFirst': 'Please log in first', 'toast.login': 'Log in', 'toast.wishAdded': 'Added to wishlist', 'toast.wishRemoved': 'Removed from wishlist',
      'cart.title': 'Shopping cart', 'cart.empty': 'Your cart is empty', 'cart.emptyHint': 'Add products or services and they will show up here.', 'cart.loginHint': 'Log in to see your cart and place an order.', 'cart.subtotal': 'Subtotal', 'cart.shipping': 'Shipping', 'cart.total': 'Total', 'cart.checkout': 'Checkout', 'cart.remove': 'Remove', 'cart.freeShip': 'Free shipping 🎉', 'cart.moreFree': 'Add {n} more for free shipping', 'cart.noShipping': 'No shipping', 'cart.unavail': 'Unavailable or quantity exceeds stock — adjust or remove it.', 'cart.browse': 'Browse products', 'cart.each': 'each',
      'co.title': 'Checkout', 'co.address': 'Delivery address', 'co.newAddress': 'Add a new address', 'co.useSaved': 'Use a saved address', 'co.notes': 'Order notes (optional)', 'co.payment': 'Confirm via WhatsApp', 'co.whatsapp': 'Send order to WhatsApp', 'co.whatsappHint': 'After the order is created, WhatsApp opens with all order details ready to send to the store.', 'co.place': 'Confirm & send order', 'co.summary': 'Order summary', 'co.noShipService': 'Your order is services only — no address needed, we will contact you on your phone.', 'co.doneTitle': 'Order received 🎉', 'co.doneText': 'Order #{id} — total {total}. You can follow its status in My orders.', 'co.myOrders': 'My orders', 'co.continue': 'Continue shopping',
      'addr.label': 'Label (Home, Work...)', 'addr.full_name': 'Recipient name', 'addr.phone': 'Mobile number', 'addr.city': 'Governorate', 'addr.area': 'Area / District', 'addr.street': 'Street', 'addr.building': 'Building / Apartment', 'addr.notes': 'Landmark (optional)', 'addr.default': 'Make this my default address', 'addr.defaultTag': 'Default',
      'pm.reviews': 'Reviews', 'pm.noReviews': 'No reviews yet.', 'pm.writeReview': 'Rate this product', 'pm.yourRating': 'Your rating', 'pm.comment': 'Write your review (optional)', 'pm.submit': 'Submit review', 'pm.needBuy': 'You can review a product after buying it.', 'pm.thanks': 'Thanks for your review!', 'pm.qty': 'Quantity', 'pm.duration': 'Duration', 'pm.category': 'Category', 'pm.notFound': 'This product does not exist or is unavailable.',
      'sup.title': 'Customer service', 'sup.status': 'Here to help', 'sup.hello': 'Welcome to {name} customer service 🤝 I can help with order tracking, shipping and payment, returns, or connect you to a team member.', 'sup.q1': 'Track my order', 'sup.q1t': 'Where is my order?', 'sup.q2': 'Shipping & payment', 'sup.q2t': 'How do shipping and payment work?', 'sup.q3': 'Returns', 'sup.q3t': 'I want to return or exchange a product', 'sup.q4': 'Talk to a person', 'sup.q4t': 'I want to talk to a person', 'sup.open': 'Customer service',
      'sup.ticketT': 'Leave a message and we will contact you', 'sup.name': 'Name', 'sup.phone': 'Mobile number', 'sup.msg': 'Describe your problem or request', 'sup.send': 'Send', 'sup.sent': 'We received your message ✓ We will contact you soon.', 'sup.login': 'Log in', 'sup.orders': 'My orders', 'sup.wa': 'WhatsApp',
      'hs.ph': 'Search products, brands, departments...', 'hs.all': 'See all results for “{q}”', 'hs.inDept': 'in {d}',
      'pm.delivery': 'Estimated delivery: {d}', 'pm.freeShip': 'Free shipping on this product', 'pm.buyNow': 'Buy now', 'pm.similar': 'Similar products', 'pm.recent': 'Recently viewed',
      'cp.ph': 'Have a coupon code?', 'cp.apply': 'Apply', 'cp.applied': 'Code {code} applied', 'cp.remove': 'Remove', 'cart.discount': 'Coupon discount', 'cp.dropped': 'Coupon removed: {why}',
      'err.COUPON_INVALID': 'This coupon code is not valid.', 'err.COUPON_EXPIRED': 'This coupon has expired.', 'err.COUPON_NOT_STARTED': 'This coupon is not active yet.', 'err.COUPON_EXHAUSTED': 'This coupon has been fully redeemed.', 'err.COUPON_USED': 'You already used this coupon.', 'err.COUPON_MIN_TOTAL': 'This coupon needs an order of {min} or more.',
      'co.wallet': 'Wallet / InstaPay transfer', 'co.walletHint': 'Transfer the amount using these details, then enter the transfer reference.', 'co.ref': 'Transfer reference number', 'pay.wallet': 'Wallet / InstaPay transfer', 'field.payment_ref': 'Transfer reference', 'field.code': 'Code',
      'nt.title': 'Notifications', 'nt.none': 'No new notifications.', 'nt.aria': 'Notifications',
      'chat.title': '{name} assistant', 'chat.status': 'Connected to the catalog', 'chat.hello': 'Hi! I am the {name} assistant 👋 Ask me about any product, price or comparison — or even a general question — and tell me your budget for suggestions.', 'chat.helloBasic': 'Hi! I am the {name} assistant 👋 Ask me about products, prices and departments, or give me your budget.', 'chat.ph': 'Type your question...', 'chat.send': 'Send', 'chat.q1': 'Categories', 'chat.q2': 'Deals', 'chat.q3': 'Under 5000', 'chat.q4': 'Best value', 'chat.q1t': 'What categories do you have?', 'chat.q2t': 'Any deals right now?', 'chat.q3t': 'Recommend something under 5000', 'chat.q4t': 'What is the best value for money?', 'chat.fail': 'Connection problem. Please try again in a moment.', 'chat.open': 'Open assistant',
      'st.pending': 'Pending', 'st.confirmed': 'Confirmed', 'st.processing': 'Processing', 'st.shipped': 'Shipped', 'st.delivered': 'Delivered', 'st.cancelled': 'Cancelled',
      'pay.unpaid': 'Awaiting confirmation', 'pay.paid': 'Paid', 'pay.cod': 'WhatsApp', 'pay.whatsapp': 'WhatsApp order',
      'field.email': 'Email', 'field.password': 'Password', 'field.name': 'Name', 'field.phone': 'Mobile number', 'field.city': 'Governorate', 'field.street': 'Street', 'field.full_name': 'Recipient name', 'field.price': 'Price', 'field.old_price': 'Old price', 'field.stock': 'Stock', 'field.name_ar': 'Arabic name', 'field.name_en': 'English name', 'field.image_url': 'Image URL', 'field.rating': 'Rating', 'field.next': 'New password', 'field.category': 'Sub-category', 'field.duration': 'Duration',
      'err.GENERIC': 'Something went wrong. Please try again.', 'err.NETWORK': 'Cannot reach the server. Check your connection and try again.', 'err.AUTH_REQUIRED': 'Please log in first.', 'err.INVALID_CREDENTIALS': 'Wrong email or password.', 'err.EMAIL_EXISTS': 'This email is already registered. Try logging in.', 'err.INVALID_FIELD': 'Invalid value in: {field}', 'err.OUT_OF_STOCK': 'This product is out of stock.', 'err.OUT_OF_STOCK_ITEM': '“{item}”: only {n} available.', 'err.ITEM_UNAVAILABLE': 'An item is no longer available. Please review your cart.', 'err.EMPTY_CART': 'Your cart is empty.', 'err.ADDRESS_REQUIRED': 'Please choose a delivery address.', 'err.RATE_LIMITED': 'Too many attempts. Please wait a bit.', 'err.NOT_FOUND': 'Not found.', 'err.PURCHASE_REQUIRED': 'Only buyers can review this product.', 'err.CANNOT_CANCEL': 'This order can no longer be cancelled.', 'err.ORDER_CANCELLED': 'This order is cancelled.', 'err.TOO_MANY_ADDRESSES': 'You reached the limit of 10 addresses.', 'err.ADMIN_ONLY': 'This page is for administrators only.', 'err.BAD_ORIGIN': 'Request rejected for security reasons. Reload the page.', 'err.INVALID_ITEM': 'Invalid item.',
      'err.WHATSAPP_NOT_CONFIGURED': 'The store WhatsApp number is not configured. Add it from Admin → Store settings using the country code.', 'err.WEAK_PASSWORD': 'Password too weak: use 8+ characters mixing letters and numbers, and avoid common passwords, your name or your email.', 'err.ACCOUNT_LOCKED': 'Sign-in is temporarily blocked after too many attempts. Try again in {min} minutes.', 'err.ACCOUNT_DISABLED': 'This account is disabled. Please contact the store.', 'err.TOTP_REQUIRED': 'Enter the code from your authenticator app.', 'err.INVALID_CODE': 'The code is wrong or expired.', 'err.INQUIRY_ONLY': 'This item is by inquiry only — it cannot be bought from the cart.', 'err.TWO_FACTOR_REQUIRED': 'You must enable two-step verification first (My account → Security).', 'err.INVALID_IMAGE': 'Unsupported image. Use JPG, PNG or WebP.', 'err.IMAGE_TOO_LARGE': 'The image is too large.', 'err.DEPARTMENT_NOT_EMPTY': 'This department has products ({products}). Disable it instead of deleting it.', 'err.CANNOT_EDIT_SELF': 'You cannot edit your own account here.', 'err.TWO_FACTOR_ALREADY': 'Two-step verification is already on.',
      'dept.all': 'All departments', 'dept.ask': 'By inquiry', 'card.ask': 'Ask about this item', 'card.view': 'View details', 'spec.title': 'Specifications', 'spec.yes': 'Yes', 'spec.no': 'No',
      'inq.title': 'Ask about this item', 'inq.name': 'Your name', 'inq.phone': 'Mobile number', 'inq.message': 'Your message (optional)', 'inq.send': 'Send inquiry', 'inq.sent': 'We received your inquiry ✓ We will contact you soon.', 'inq.wa': 'WhatsApp', 'inq.call': 'Call', 'inq.waText': 'Hello, I would like to ask about: {name}',
      'foot.contact': 'Contact us', 'foot.depts': 'Departments'
    }
  };
  const extend = (pack) => { for (const l of ['ar', 'en']) Object.assign(I18N[l], pack[l] || {}); };
  const t = (key, vars) => {
    let s = I18N[lang][key] ?? I18N.ar[key] ?? key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
    return s;
  };
  const has = (key) => I18N[lang][key] !== undefined;

  /* ───────── helpers ───────── */
  const fmt = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
  const money = (n) => `${fmt(n)} ${t('cur')}`;
  const dateFmt = (x, withTime = false) =>
    new Date(x).toLocaleString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
  const nameOf = (o) => (lang === 'ar' ? o.name_ar || o.name_en : o.name_en || o.name_ar) || '';
  const descOf = (o) => (lang === 'ar' ? o.description_ar || o.description_en : o.description_en || o.description_ar) || '';
  const titleOf = (o) => (lang === 'ar' ? o.title : o.title_en || o.title) || '';
  const norm = (s) => String(s ?? '').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim();
  const discountPct = (p) => (p.old_price && p.old_price > p.price ? Math.round((1 - p.price / p.old_price) * 100) : 0);
  const debounce = (fn, ms = 200) => { let h; return (...a) => { clearTimeout(h); h = setTimeout(() => fn(...a), ms); }; };

  const ICONS = {
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/>',
    star: '<polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/>',
    truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.3 7 12 12 20.7 7"/><line x1="12" y1="22" x2="12" y2="12"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.7" y2="16.7"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
    car: '<path d="M5 17h14v-5l-2-5H7l-2 5z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><line x1="5" y1="12" x2="19" y2="12"/>',
    gamepad: '<rect x="2" y="6" width="20" height="12" rx="4"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="11" r=".8"/><circle cx="17.5" cy="13" r=".8"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    shirt: '<path d="M20.4 4.5 16 3a4 4 0 0 1-8 0L3.6 4.5 2 9l4 1.5V21h12V10.5L22 9z"/>',
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8z"/>',
    ball: '<circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20M2 12h20"/>',
    headset: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><line x1="7" y1="7" x2="7.01" y2="7"/>'
  };
  const icon = (n, size = 20) => `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  // Neutral artwork (department icon on a soft tint) used when an item has no image or its URL is broken.
  function placeholder(label, iconName) {
    let h = 0;
    for (const c of String(label)) h = (h * 31 + c.charCodeAt(0)) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250"><rect width="400" height="250" fill="hsl(${h} 16% 90%)"/><g transform="translate(162 87) scale(3.1)" fill="none" stroke="hsl(${h} 20% 42%)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".85">${ICONS[iconName] || ICONS.box}</g></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  const deptOf = (o) => (state.config.departments || []).find((d) => d.id === o.department_id);
  const imgTag = (o, kind, cls = '') => {
    const alt = nameOf(o);
    const fb = placeholder(o.name_en || alt, kind === 'service' ? 'tool' : deptOf(o)?.icon || 'box');
    const src = o.image_url || (o.images && o.images[0]) || fb;
    return `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" data-fb="${esc(fb)}">`;
  };
  // <img onerror> is blocked by our CSP, so image errors are handled once, in the capture phase.
  d.addEventListener('error', (e) => {
    const img = e.target;
    if (img && img.tagName === 'IMG' && img.dataset.fb && img.src !== img.dataset.fb) img.src = img.dataset.fb;
  }, true);

  const deptName = (d) => (lang === 'ar' ? d.name_ar : d.name_en) || d.name_ar;
  const fieldLabel = (f) => (lang === 'ar' ? f.label_ar : f.label_en) || f.label_ar;
  const optLabel = (f, v) => { const o = (f.options || []).find((x) => x.ar === v); return o ? (lang === 'ar' ? o.ar : o.en || o.ar) : v; };
  function attrValue(f, v) {
    if (v === undefined || v === null || v === '') return '';
    if (f.type === 'boolean') return t(v ? 'spec.yes' : 'spec.no');
    if (f.type === 'number') return (Math.abs(Number(v)) >= 10000 ? fmt(v) : String(v)) + (f.unit ? ' ' + f.unit : ''); // 2020 (a year) must not become 2,020
    if (f.type === 'select') return optLabel(f, v);
    return String(v);
  }
  const isInquiry = (p) => deptOf(p)?.purchase_mode === 'inquiry';
  const cardAttrs = (p) => {
    const d = deptOf(p);
    if (!d) return '';
    const parts = d.fields.filter((f) => f.show_on_card && p.attributes?.[f.key] !== undefined && p.attributes[f.key] !== '').slice(0, 3).map((f) => `<span>${esc(attrValue(f, p.attributes[f.key]))}</span>`);
    return parts.length ? `<div class="attr-line">${parts.join('')}</div>` : '';
  };
  const stars = (r) => `<span class="stars" style="--r:${Number(r || 0)}" role="img" aria-label="${Number(r || 0).toFixed(1)} / 5">★★★★★</span>`;

  /* ───────── API ───────── */
  class ApiError extends Error {
    constructor(status, code, data) { super(code); this.status = status; this.code = code; this.data = data || {}; }
  }
  async function api(url, { method = 'GET', body } = {}) {
    let res;
    try {
      res = await fetch(url, { method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
    } catch { throw new ApiError(0, 'NETWORK'); }
    let data = {};
    try { data = await res.json(); } catch {}
    if (!res.ok) throw new ApiError(res.status, data.error || 'REQUEST_FAILED', data);
    return data;
  }
  function errMsg(e) {
    const c = e?.code || 'GENERIC';
    if (c === 'INVALID_INPUT') {
      const d = e.data || {};
      const label = (lang === 'ar' ? d.label_ar : d.label_en) || (has('field.' + d.field) ? t('field.' + d.field) : d.field);
      return label ? t('err.INVALID_FIELD', { field: label }) : t('err.GENERIC');
    }
    if (c === 'OUT_OF_STOCK' && e.data?.item) return t('err.OUT_OF_STOCK_ITEM', { item: lang === 'ar' ? e.data.item : e.data.item_en || e.data.item, n: e.data.available ?? 0 });
    if (c === 'ACCOUNT_LOCKED') return t('err.ACCOUNT_LOCKED', { min: Math.max(1, Math.ceil((e.data?.retry_after || 900) / 60)) });
    if (c === 'COUPON_MIN_TOTAL') return t('err.COUPON_MIN_TOTAL', { min: money(e.data?.min || 0) });
    if (c === 'DEPARTMENT_NOT_EMPTY') return t('err.DEPARTMENT_NOT_EMPTY', { products: e.data?.products ?? '' });
    return has('err.' + c) ? t('err.' + c) : t('err.GENERIC');
  }

  /* ───────── state ───────── */
  const state = { unread: 0, lang, config: { free_shipping_threshold: 3000, shipping_fee: 80, max_qty: 20, low_stock: 5, payment_methods: ['cod'], site: { name: 'BOLA TECH', brand_color: '#0f6b5c' }, departments: [] }, user: null, cartCount: 0, wishlist: new Set(), cart: null };
  const actions = {};
  const forms = {};

  /* ───────── toast ───────── */
  function toast(msg, opts = {}) {
    let box = $('#toasts');
    if (!box) { box = d.createElement('div'); box.id = 'toasts'; box.className = 'toasts'; box.setAttribute('aria-live', 'polite'); d.body.appendChild(box); }
    const el = d.createElement('div');
    el.className = 'toast' + (opts.type ? ' ' + opts.type : '');
    const span = d.createElement('span'); span.textContent = msg; el.appendChild(span);
    if (opts.action) {
      const b = d.createElement('button'); b.type = 'button'; b.className = 'toast-action'; b.textContent = opts.action.label;
      b.addEventListener('click', () => { opts.action.fn(); el.remove(); });
      el.appendChild(b);
    }
    box.appendChild(el);
    setTimeout(() => el.remove(), opts.action ? 6000 : 3200);
  }

  /* ───────── modal ───────── */
  const lockScroll = () => d.body.classList.toggle('no-scroll', !!$('.modal.open, .drawer.open'));
  function openModal({ title = '', html = '', wide = false, className = '', onClose } = {}) {
    const wrap = d.createElement('div');
    wrap.className = 'modal open';
    wrap.innerHTML = `<div class="modal-backdrop" data-close></div><div class="panel ${wide ? 'wide' : ''} ${className}" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1"><button type="button" class="icon-btn modal-x" data-close aria-label="${t('close')}">${icon('x')}</button>${title ? `<h2 class="modal-title">${esc(title)}</h2>` : ''}<div class="modal-body">${html}</div></div>`;
    d.body.appendChild(wrap);
    const prev = d.activeElement;
    const close = () => { if (!wrap.isConnected) return; wrap.remove(); lockScroll(); prev?.focus?.(); onClose?.(); };
    wrap.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
    wrap._close = close;
    lockScroll();
    ($('input:not([type=hidden]), select, textarea', wrap) || $('.panel', wrap)).focus?.({ preventScroll: true });
    return { el: wrap, body: $('.modal-body', wrap), close };
  }
  d.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const modals = $$('.modal.open');
    if (modals.length) return modals.at(-1)._close?.();
    if ($('#cartDrawer.open')) closeCart();
    $$('.chatbox.open').forEach((b) => b.classList.remove('open'));
    $('#mainNav.open')?.classList.remove('open');
  });

  /* ───────── delegation ───────── */
  d.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (!fn) return;
    if (el.tagName === 'A' && (e.ctrlKey || e.metaKey || e.shiftKey || e.button)) return; // let "open in new tab" work
    fn(el, e);
  });
  d.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-form]');
    if (!f) return;
    e.preventDefault();
    forms[f.dataset.form]?.(f, e);
  });
  const busy = async (btn, fn) => {
    if (btn) { btn.disabled = true; btn.classList.add('loading'); }
    try { return await fn(); } finally { if (btn) { btn.disabled = false; btn.classList.remove('loading'); } }
  };

  /* ───────── chrome: header / footer ───────── */
  const here = location.pathname;
  const isActive = (href) => (href === '/' ? here === '/' || here === '/index.html' : here.startsWith(href.replace('.html', '')));
  function headerHTML() {
    const links = [['/store.html', 'nav.store'], ['/services.html', 'nav.services']];
    return `<div id="announce"></div><header class="topbar"><div class="container nav">
      <a class="brand" href="/" id="brandLink"></a>
      <form class="hsearch" action="/store.html" method="get" role="search" autocomplete="off"><input type="search" name="q" id="hq" placeholder="${t('hs.ph')}" aria-label="${t('search')}" maxlength="80"><button type="submit" aria-label="${t('search')}">${icon('search', 18)}</button><div class="sugg hidden" id="sugg"></div></form>
      <nav class="links" id="mainNav" aria-label="Main">
        ${links.map(([h, k]) => `<a href="${h}" ${isActive(h) ? 'aria-current="page"' : ''}>${t(k)}</a>`).join('')}
        <a href="/admin/" id="adminLink" class="hidden">${t('nav.admin')}</a>
      </nav>
      <div class="nav-actions">
        <button type="button" class="icon-btn" data-action="theme" aria-label="${t('nav.theme')}"><span class="theme-ic"></span></button>
        <button type="button" class="icon-btn lang-btn" data-action="lang" aria-label="Language">${t('nav.lang')}</button>
        <a class="icon-btn" href="/account.html#wishlist" aria-label="${t('nav.wishlist')}">${icon('heart')}<span class="badge hidden" id="wishBadge">0</span></a>
        <span class="notif-wrap hidden" id="notifWrap"><button type="button" class="icon-btn" data-action="notif-toggle" aria-label="${t('nt.aria')}" aria-expanded="false">${icon('bell')}<span class="badge hidden" id="notifBadge">0</span></button><div class="notif-box hidden" id="notifBox" role="menu"></div></span>
        <button type="button" class="icon-btn" data-action="open-cart" aria-label="${t('nav.cart')}">${icon('cart')}<span class="badge hidden" id="cartBadge">0</span></button>
        <a class="btn btn-primary btn-sm hide-sm" id="accountBtn" href="/account.html">${icon('user', 16)}<span>${t('nav.login')}</span></a>
        <button type="button" class="icon-btn burger" data-action="menu" aria-label="${t('nav.menu')}" aria-expanded="false">${icon('menu')}</button>
      </div></div></header><nav class="deptbar hidden" id="deptbar" aria-label="${t('foot.depts')}"><div class="container"></div></nav>`;
  }
  function footerHTML() {
    return `<footer class="footer"><div class="container foot-grid">
      <div><a class="brand" href="/" id="footBrand"></a><p class="muted" id="footTag"></p></div>
      <div><b>${t('foot.depts')}</b><span id="footDepts"></span><a href="/services.html">${t('nav.services')}</a></div>
      <div><b>${t('foot.contact')}</b><span id="footContact"></span><a href="/account.html#orders">${t('foot.orders')}</a></div>
      </div><div class="container foot-bottom"><span id="footCopy"></span></div></footer>`;
  }
  const brandHTML = (name) => {
    const logo = state.config.site?.logo_url;
    if (logo) return `<img src="${esc(logo)}" alt="${esc(name)}" height="34">`;
    const w = String(name || '').trim().split(/\s+/);
    return w.length > 1 ? `${esc(w.slice(0, -1).join(' '))} <span>${esc(w.at(-1))}</span>` : esc(name);
  };
  // Applies store settings (name, colour, announcement, contact) and the department bar once the config is loaded.
  function paintSite() {
    const site = state.config.site || {};
    const depts = state.config.departments || [];
    d.documentElement.style.setProperty('--brand-user', /^#[0-9a-fA-F]{6}$/.test(site.brand_color) ? site.brand_color : '#0f6b5c');
    const bl = $('#brandLink'); if (bl) { bl.innerHTML = brandHTML(site.name); bl.setAttribute('aria-label', site.name); }
    const fb = $('#footBrand'); if (fb) fb.innerHTML = brandHTML(site.name);
    if (d.title.includes('BOLA TECH') && site.name) d.title = d.title.replace('BOLA TECH', site.name);
    const an = $('#announce'); if (an) an.innerHTML = site.announcement ? `<div class="announce">${esc(site.announcement)}</div>` : '';
    const bar = $('#deptbar');
    if (bar) {
      const cur = new URLSearchParams(location.search).get('dept');
      bar.classList.toggle('hidden', !depts.length);
      $('.container', bar).innerHTML = `<a href="/store.html" ${location.pathname.startsWith('/store') && !cur ? 'aria-current="true"' : ''}>${t('dept.all')}</a>` +
        depts.map((x) => `<a href="/store.html?dept=${esc(x.slug)}" ${cur === x.slug ? 'aria-current="true"' : ''}>${icon(x.icon, 16)}${esc(deptName(x))}</a>`).join('');
    }
    const ft = $('#footTag'); if (ft) ft.textContent = site.tagline || '';
    const fd = $('#footDepts'); if (fd) fd.innerHTML = depts.map((x) => `<a href="/store.html?dept=${esc(x.slug)}">${esc(deptName(x))}</a>`).join('');
    const fc = $('#footContact');
    if (fc) fc.innerHTML = [site.phone && `<a href="tel:${esc(site.phone)}" dir="ltr" style="text-align:start">${esc(site.phone)}</a>`, site.whatsapp && `<a href="https://wa.me/${esc(site.whatsapp)}" target="_blank" rel="noopener">${t('inq.wa')}</a>`, site.email && `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`, site.address && `<span class="muted">${esc(site.address)}</span>`].filter(Boolean).join('');
    const fcopy = $('#footCopy'); if (fcopy) fcopy.textContent = `© ${new Date().getFullYear()} ${site.name || ''} — ${t('foot.rights')}`;
    
  }
  function paintHeaderState() {
    const cb = $('#cartBadge'), wb = $('#wishBadge'), ab = $('#accountBtn'), ad = $('#adminLink');
    if (cb) { cb.textContent = state.cartCount > 99 ? '99+' : state.cartCount; cb.classList.toggle('hidden', !state.cartCount); }
    if (wb) { wb.textContent = state.wishlist.size; wb.classList.toggle('hidden', !state.wishlist.size); }
    if (ab) $('span', ab).textContent = state.user ? state.user.name.split(' ')[0] : t('nav.login');
    if (ad) ad.classList.toggle('hidden', state.user?.role !== 'admin');
    const nw = $('#notifWrap'), nb = $('#notifBadge');
    if (nw) nw.classList.toggle('hidden', !state.user);
    if (nb) { nb.textContent = state.unread > 99 ? '99+' : state.unread; nb.classList.toggle('hidden', !state.unread); }
    const bc = $('#bnCart'); if (bc) { bc.textContent = state.cartCount > 99 ? '99+' : state.cartCount; bc.classList.toggle('hidden', !state.cartCount); }
    const th = $('.theme-ic'); if (th) th.innerHTML = icon(d.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon');
  }
  actions.menu = (el) => { const open = $('#mainNav').classList.toggle('open'); el.setAttribute('aria-expanded', open); };
  actions.lang = () => { store.set('bola_lang', lang === 'ar' ? 'en' : 'ar'); location.reload(); };
  actions.theme = () => {
    const next = d.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    d.documentElement.dataset.theme = next; store.set('bola_theme', next); paintHeaderState();
  };
  actions.logout = async (el) => { await busy(el, () => api('/api/auth/logout', { method: 'POST' }).catch(() => {})); location.href = '/'; };

  const goLogin = () => { location.href = '/account.html?next=' + encodeURIComponent(location.pathname + location.search); };
  const requireLogin = () => {
    if (state.user) return true;
    toast(t('toast.loginFirst'), { action: { label: t('toast.login'), fn: goLogin } });
    return false;
  };

  /* ───────── shared catalog cache, search suggestions, recently viewed ───────── */
  let catPromise;
  const catalogOnce = () => (catPromise ||= api('/api/catalog').catch(() => { catPromise = null; return { products: [], services: [] }; }));
  const recentIds = () => { try { return JSON.parse(store.get('bola_recent') || '[]'); } catch { return []; } };
  const pushRecent = (id) => store.set('bola_recent', JSON.stringify([id, ...recentIds().filter((x) => x !== id)].slice(0, 12)));
  function initSearch() {
    const input = $('#hq'), box = $('#sugg');
    if (!input) return;
    const hide = () => box.classList.add('hidden');
    input.addEventListener('input', debounce(async () => {
      const v = norm(input.value);
      if (v.length < 2) return hide();
      const { products } = await catalogOnce();
      const hits = products.filter((p) => norm(`${p.name_ar} ${p.name_en} ${p.category}`).includes(v)).slice(0, 6);
      const ds = (state.config.departments || []).filter((x) => norm(deptName(x)).includes(v)).slice(0, 2);
      box.innerHTML = ds.map((x) => `<a class="sg-row" href="/store.html?dept=${esc(x.slug)}">${icon(x.icon, 18)}<span>${esc(deptName(x))}</span></a>`).join('') +
        hits.map((p) => `<a class="sg-row" href="/store.html?p=${p.id}" data-action="quick" data-id="${p.id}">${imgTag(p, 'product', 'sg-img')}<span>${esc(nameOf(p))}</span><b>${money(p.price)}</b></a>`).join('') +
        `<a class="sg-row all" href="/store.html?q=${encodeURIComponent(input.value.trim())}">${icon('search', 16)}<span>${t('hs.all', { q: esc(input.value.trim()) })}</span></a>`;
      box.classList.remove('hidden');
    }, 160));
    d.addEventListener('click', (e) => { if (!e.target.closest('.hsearch')) hide(); else if (e.target.closest('.sg-row')) hide(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  }

  /* ───────── cards ───────── */
  function productCard(p) {
    const off = discountPct(p);
    const out = p.stock < 1;
    const inquiry = isInquiry(p);
    const wished = state.wishlist.has(p.id);
    return `<article class="pcard ${out ? 'is-out' : ''}">
      <div class="pmedia">
        <a href="/store.html?p=${p.id}" data-action="quick" data-id="${p.id}" tabindex="-1" aria-hidden="true">${imgTag(p, 'product', 'pimg')}</a>
        ${off ? `<span class="ribbon sale">${t('card.off', { p: off })}</span>` : ''}${out ? `<span class="ribbon out">${t('card.out')}</span>` : ''}
        <button type="button" class="wish-btn ${wished ? 'on' : ''}" data-action="wish" data-id="${p.id}" aria-pressed="${wished}" aria-label="${t(wished ? 'card.unwish' : 'card.wish')}">${icon('heart', 18)}</button>
      </div>
      <div class="pbody">
        <div class="pmeta"><span class="tag">${esc(p.category || (deptOf(p) ? deptName(deptOf(p)) : ''))}</span>${!inquiry && !out && p.stock <= state.config.low_stock ? `<span class="low">${t('card.left', { n: p.stock })}</span>` : ''}</div>
        <h3 class="ptitle"><a href="/store.html?p=${p.id}" data-action="quick" data-id="${p.id}">${esc(nameOf(p))}</a></h3>
        ${cardAttrs(p)}
        ${p.review_count ? `<div class="rating">${stars(p.rating)}<span class="muted">(${p.review_count})</span></div>` : ''}
        <div class="price-row"><span class="price">${money(p.price)}</span>${off ? `<del class="old">${fmt(p.old_price)}</del>` : ''}</div>
        ${inquiry
          ? `<a class="btn ghost-cta btn-block" href="/store.html?p=${p.id}" data-action="quick" data-id="${p.id}"><span>${t('card.view')}</span></a>`
          : `<button type="button" class="btn btn-primary btn-block" data-action="add-cart" data-kind="product" data-id="${p.id}" ${out ? 'disabled' : ''}>${icon('cart', 18)}<span>${out ? t('card.out') : t('card.add')}</span></button>`}
      </div></article>`;
  }
  function serviceCard(s) {
    return `<article class="pcard service">
      <div class="pmedia"><a href="/services.html?s=${s.id}" data-action="quick-service" data-id="${s.id}" tabindex="-1" aria-hidden="true">${imgTag(s, 'service', 'pimg')}</a></div>
      <div class="pbody">
        <div class="pmeta"><span class="tag">${esc(s.category)}</span>${s.duration ? `<span class="muted">⏱ ${esc(s.duration)}</span>` : ''}</div>
        <h3 class="ptitle"><a href="/services.html?s=${s.id}" data-action="quick-service" data-id="${s.id}">${esc(nameOf(s))}</a></h3>
        <p class="muted clamp2">${esc(descOf(s))}</p>
        <div class="price-row"><span class="price">${money(s.price)}</span></div>
        <button type="button" class="btn btn-primary btn-block" data-action="add-cart" data-kind="service" data-id="${s.id}">${icon('cart', 18)}<span>${t('card.add')}</span></button>
      </div></article>`;
  }

  /* ───────── cart ───────── */
  function setCart(c) {
    state.cart = c; state.cartCount = c.count ?? c.items.reduce((n, i) => n + i.quantity, 0); paintHeaderState();
  }
  actions['add-cart'] = (el) => addToCart(el.dataset.kind, Number(el.dataset.id), 1, el);
  async function addToCart(kind, id, qty = 1, btn) {
    if (!requireLogin()) return false;
    try {
      const c = await busy(btn, () => api('/api/cart/items', { method: 'POST', body: { [kind === 'service' ? 'service_id' : 'product_id']: id, quantity: qty } }));
      setCart(c);
      toast(t('toast.added'), { type: 'ok', action: { label: t('toast.viewCart'), fn: openCart } });
      if ($('#cartDrawer.open')) renderCart();
      return true;
    } catch (e) { toast(errMsg(e), { type: 'err' }); return false; }
  }
  actions.wish = async (el) => {
    if (!requireLogin()) return;
    const id = Number(el.dataset.id), on = state.wishlist.has(id);
    try {
      const r = await busy(el, () => api('/api/wishlist/' + id, { method: on ? 'DELETE' : 'POST' }));
      state.wishlist = new Set(r.wishlist);
      $$(`.wish-btn[data-id="${id}"]`).forEach((b) => { const w = state.wishlist.has(id); b.classList.toggle('on', w); b.setAttribute('aria-pressed', w); b.setAttribute('aria-label', t(w ? 'card.unwish' : 'card.wish')); });
      paintHeaderState();
      toast(t(on ? 'toast.wishRemoved' : 'toast.wishAdded'));
      d.dispatchEvent(new CustomEvent('bola:wishlist', { detail: { id, on: !on } }));
    } catch (e) { toast(errMsg(e), { type: 'err' }); }
  };

  function drawerHTML() {
    return `<div class="drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-label="${t('cart.title')}">
      <div class="drawer-backdrop" data-action="close-cart"></div>
      <aside class="drawer-panel"><div class="drawer-head"><h2>${t('cart.title')}</h2><button type="button" class="icon-btn" data-action="close-cart" aria-label="${t('close')}">${icon('x')}</button></div>
      <div class="drawer-body" id="cartBody"></div><div class="drawer-foot" id="cartFoot"></div></aside></div>`;
  }
  function openCart() { $$('.toast').forEach((x) => x.remove()); $('#cartDrawer').classList.add('open'); lockScroll(); renderCart(); }
  function closeCart() { $('#cartDrawer').classList.remove('open'); lockScroll(); }
  actions['open-cart'] = openCart;
  actions['close-cart'] = closeCart;

  async function renderCart() {
    const body = $('#cartBody'), foot = $('#cartFoot');
    if (!state.user) {
      body.innerHTML = `<div class="empty">${icon('cart', 44)}<h3>${t('cart.empty')}</h3><p class="muted">${t('cart.loginHint')}</p><button type="button" class="btn btn-primary" data-action="go-login">${t('toast.login')}</button></div>`;
      foot.innerHTML = ''; return;
    }
    if (!state.cart) body.innerHTML = `<div class="skeleton-list"><div class="skeleton"></div><div class="skeleton"></div></div>`;
    try { setCart(await api('/api/cart')); } catch (e) { body.innerHTML = `<div class="empty"><p>${esc(errMsg(e))}</p><button type="button" class="btn" data-action="open-cart">${t('retry')}</button></div>`; return; }
    const c = state.cart;
    if (c.coupon_removed) { toast(t('cp.dropped', { why: t('err.' + c.coupon_removed) }), { type: 'err' }); c.coupon_removed = null; }
    if (!c.items.length) {
      body.innerHTML = `<div class="empty">${icon('cart', 44)}<h3>${t('cart.empty')}</h3><p class="muted">${t('cart.emptyHint')}</p><a class="btn btn-primary" href="/store.html">${t('cart.browse')}</a></div>`;
      foot.innerHTML = ''; return;
    }
    body.innerHTML = c.items.map((i) => `<div class="cart-item ${i.available ? '' : 'unavail'}">
        ${imgTag(i, i.kind, 'ci-img')}
        <div class="ci-main"><div class="ci-name">${esc(nameOf(i))}</div><div class="muted small">${money(i.price)} ${t('cart.each')}</div>
          ${i.available ? '' : `<div class="warn small">${t('cart.unavail')}</div>`}
          <div class="qty"><button type="button" data-action="cart-qty" data-id="${i.id}" data-q="${i.quantity - 1}" aria-label="−" ${i.quantity <= 1 ? 'disabled' : ''}>${icon('minus', 14)}</button><span>${i.quantity}</span><button type="button" data-action="cart-qty" data-id="${i.id}" data-q="${i.quantity + 1}" aria-label="+" ${i.quantity >= Math.min(state.config.max_qty, i.stock ?? state.config.max_qty) ? 'disabled' : ''}>${icon('plus', 14)}</button></div></div>
        <div class="ci-side"><b>${money(i.line_total)}</b><button type="button" class="link-danger" data-action="cart-remove" data-id="${i.id}" aria-label="${t('cart.remove')}">${icon('trash', 16)}</button></div></div>`).join('');
    const thr = state.config.free_shipping_threshold;
    let ship = '';
    if (c.has_physical) {
      const pct = Math.min(100, Math.round(((thr - c.free_shipping_remaining) / thr) * 100));
      ship = c.free_shipping_remaining > 0
        ? `<div class="ship-progress"><div class="small">${icon('truck', 16)} ${t('cart.moreFree', { n: money(c.free_shipping_remaining) })}</div><div class="bar"><i style="width:${pct}%"></i></div></div>`
        : `<div class="ship-progress ok small">${icon('truck', 16)} ${t('cart.freeShip')}</div>`;
    }
    const coupon = c.coupon
      ? `<div class="coupon-on"><span>${icon('tag', 16)} ${t('cp.applied', { code: esc(c.coupon.code) })}</span><button type="button" class="link-danger" data-action="coupon-remove">${t('cp.remove')}</button></div>`
      : `<form class="coupon-form" data-form="coupon"><input class="input" name="code" placeholder="${t('cp.ph')}" maxlength="30" autocomplete="off" dir="ltr" aria-label="${t('cp.ph')}"><button class="btn btn-sm" type="submit">${t('cp.apply')}</button></form>`;
    foot.innerHTML = `${ship}${coupon}<p class="form-error hidden" id="cpErr" role="alert"></p><dl class="totals"><div><dt>${t('cart.subtotal')}</dt><dd>${money(c.subtotal)}</dd></div>${c.discount ? `<div class="disc"><dt>${t('cart.discount')}</dt><dd>− ${money(c.discount)}</dd></div>` : ''}
      <div><dt>${t('cart.shipping')}</dt><dd>${c.has_physical ? (c.shipping ? money(c.shipping) : t('card.free')) : t('cart.noShipping')}</dd></div>
      <div class="grand"><dt>${t('cart.total')}</dt><dd>${money(c.total)}</dd></div></dl>
      <button type="button" class="btn btn-primary btn-block btn-lg" data-action="checkout" ${c.has_issues ? 'disabled' : ''}>${t('cart.checkout')}</button>`;
  }
  actions['go-login'] = goLogin;
  actions['cart-qty'] = async (el) => {
    try { setCart(await busy(el, () => api('/api/cart/items/' + el.dataset.id, { method: 'PATCH', body: { quantity: Number(el.dataset.q) } }))); renderCart(); }
    catch (e) { toast(errMsg(e), { type: 'err' }); }
  };
  actions['cart-remove'] = async (el) => {
    try { setCart(await busy(el, () => api('/api/cart/items/' + el.dataset.id, { method: 'DELETE' }))); renderCart(); }
    catch (e) { toast(errMsg(e), { type: 'err' }); }
  };

  forms.coupon = async (f) => {
    const err = $('#cpErr'), code = readForm(f).code.trim(); if (!code) return;
    err.classList.add('hidden');
    try { setCart(await busy($('button', f), () => api('/api/cart/coupon', { method: 'POST', body: { code } }))); renderCart(); }
    catch (e) { err.textContent = errMsg(e); err.classList.remove('hidden'); }
  };
  actions['coupon-remove'] = async (el) => { try { setCart(await busy(el, () => api('/api/cart/coupon', { method: 'DELETE' }))); renderCart(); } catch (e) { toast(errMsg(e), { type: 'err' }); } };

  /* ───────── checkout ───────── */
  const GOVS = ['القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الشرقية', 'الدقهلية', 'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء'];
  const addressFields = (v = {}) => `
    <div class="grid-2">
      <label class="field"><span>${t('addr.full_name')}</span><input class="input" name="full_name" required minlength="2" maxlength="80" value="${esc(v.full_name || state.user?.name || '')}" autocomplete="name"></label>
      <label class="field"><span>${t('addr.phone')}</span><input class="input" name="phone" required inputmode="tel" maxlength="20" value="${esc(v.phone || state.user?.phone || '')}" autocomplete="tel" dir="ltr"></label>
      <label class="field"><span>${t('addr.city')}</span><input class="input" name="city" required list="govs" maxlength="60" value="${esc(v.city || '')}" autocomplete="address-level1"></label>
      <label class="field"><span>${t('addr.area')}</span><input class="input" name="area" maxlength="60" value="${esc(v.area || '')}"></label>
    </div>
    <label class="field"><span>${t('addr.street')}</span><input class="input" name="street" required minlength="3" maxlength="160" value="${esc(v.street || '')}" autocomplete="street-address"></label>
    <div class="grid-2">
      <label class="field"><span>${t('addr.building')}</span><input class="input" name="building" maxlength="60" value="${esc(v.building || '')}"></label>
      <label class="field"><span>${t('addr.label')}</span><input class="input" name="label" maxlength="40" value="${esc(v.label || '')}"></label>
    </div>
    <label class="field"><span>${t('addr.notes')}</span><input class="input" name="notes" maxlength="300" value="${esc(v.notes || '')}"></label>
    <label class="check"><input type="checkbox" name="is_default" ${v.is_default ? 'checked' : ''}> <span>${t('addr.default')}</span></label>
    <datalist id="govs">${GOVS.map((g) => `<option value="${g}">`).join('')}</datalist>`;
  const readForm = (f) => {
    const o = {};
    for (const el of f.elements) {
      if (!el.name || el.disabled) continue;
      if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; } // only the selected radio of a group
      else o[el.name] = el.type === 'checkbox' ? el.checked : el.value;
    }
    return o;
  };

  actions.checkout = async () => {
    if (!state.user) return goLogin();
    $$('.toast').forEach((x) => x.remove());
    closeCart();
    const [c, a] = await Promise.all([api('/api/cart'), api('/api/account/addresses')]).catch((e) => { toast(errMsg(e), { type: 'err' }); return []; });
    if (!c) return;
    setCart(c);
    if (!c.items.length) return openCart();
    const addresses = a.addresses;
    const needAddr = c.has_physical;
    const m = openModal({ title: t('co.title'), wide: true, html: `<form data-form="place-order" class="checkout">
      <div class="co-main">
        ${needAddr ? `<section><h3>${icon('pin', 18)} ${t('co.address')}</h3>
          <div id="addrList" class="addr-list">${addresses.map((x, i) => `<label class="addr-opt"><input type="radio" name="address_id" value="${x.id}" ${i === 0 ? 'checked' : ''}><span><b>${esc(x.full_name)}</b> ${x.is_default ? `<span class="tag">${t('addr.defaultTag')}</span>` : ''}<br><span class="muted">${esc([x.street, x.building, x.area, x.city].filter(Boolean).join('، '))}<br><span dir="ltr">${esc(x.phone)}</span></span></span></label>`).join('')}
          <label class="addr-opt"><input type="radio" name="address_id" value="new" ${addresses.length ? '' : 'checked'}><span><b>${icon('plus', 14)} ${t('co.newAddress')}</b></span></label></div>
          <fieldset id="newAddr" class="new-addr ${addresses.length ? 'hidden' : ''}" ${addresses.length ? 'disabled' : ''}>${addressFields({ is_default: !addresses.length })}</fieldset></section>`
        : `<div class="notice">${t('co.noShipService')}</div>`}
        <section><label class="field"><span>${t('co.notes')}</span><textarea class="textarea" name="notes" maxlength="500" rows="2"></textarea></label></section>
        <section><h3>${icon('send', 18)} ${t('co.payment')}</h3>
          <div class="notice"><b>${t('co.whatsapp')}</b><br><span class="muted">${t('co.whatsappHint')}</span></div>
          <input type="hidden" name="payment_method" value="whatsapp"></section>
      </div>
      <aside class="co-side"><h3>${t('co.summary')}</h3>
        ${c.items.map((i) => `<div class="co-line"><span>${esc(nameOf(i))} × ${i.quantity}</span><b>${money(i.line_total)}</b></div>`).join('')}
        <dl class="totals"><div><dt>${t('cart.subtotal')}</dt><dd>${money(c.subtotal)}</dd></div>${c.discount ? `<div class="disc"><dt>${t('cart.discount')} (${esc(c.coupon?.code || '')})</dt><dd>− ${money(c.discount)}</dd></div>` : ''}<div><dt>${t('cart.shipping')}</dt><dd>${c.has_physical ? (c.shipping ? money(c.shipping) : t('card.free')) : t('cart.noShipping')}</dd></div><div class="grand"><dt>${t('cart.total')}</dt><dd>${money(c.total)}</dd></div></dl>
        <p class="form-error hidden" id="coErr" role="alert"></p>
        <button class="btn btn-primary btn-block btn-lg" type="submit">${t('co.place')}</button></aside></form>` });
    // Hidden required fields would silently block the browser's form submit, so the new-address block is disabled while hidden.
    m.el.addEventListener('change', (e) => {
      if (e.target.name !== 'address_id') return;
      const box = $('#newAddr', m.el); if (!box) return;
      const isNew = e.target.value === 'new';
      box.classList.toggle('hidden', !isNew); box.disabled = !isNew;
    });
  };
  forms['place-order'] = async (f) => {
    const err = $('#coErr', f), btn = $('button[type=submit]', f);
    err.classList.add('hidden');
    try {
      const v = readForm(f);
      let addressId = v.address_id;
      if (state.cart.has_physical) {
        if (addressId === 'new') {
          if (!f.reportValidity()) return;
          const r = await busy(btn, () => api('/api/account/addresses', { method: 'POST', body: v }));
          addressId = r.address.id;
        }
      }
      const { order, whatsapp_url } = await busy(btn, () => api('/api/orders', { method: 'POST', body: { address_id: addressId && addressId !== 'new' ? Number(addressId) : undefined, notes: v.notes, payment_method: 'whatsapp' } }));
      state.cartCount = 0; state.cart = null; paintHeaderState();
      $('.modal-body', f.closest('.modal')).innerHTML = `<div class="success">${icon('check', 40)}<h2>${t('co.doneTitle')}</h2><p>${t('co.doneText', { id: order.id, total: money(order.total) })}</p><div class="actions"><a class="btn btn-primary" href="${esc(whatsapp_url)}" target="_blank" rel="noopener">${t('co.whatsapp')}</a><a class="btn" href="/account.html#orders">${t('co.myOrders')}</a><button type="button" class="btn" data-close>${t('co.continue')}</button></div></div>`;
      window.open(whatsapp_url, '_blank', 'noopener');
    } catch (e) {
      err.textContent = errMsg(e); err.classList.remove('hidden');
      if (['OUT_OF_STOCK', 'ITEM_UNAVAILABLE'].includes(e.code)) state.cart = null;
    }
  };

  /* ───────── product / service modals ───────── */
  const closeProductUrl = () => { const u = new URL(location.href); if (u.searchParams.has('p') || u.searchParams.has('s')) { u.searchParams.delete('p'); u.searchParams.delete('s'); history.replaceState(null, '', u.pathname + (u.search || '') + u.hash); } };
  actions.quick = (el, e) => { e.preventDefault(); $$('.modal.open').forEach((m) => m._close?.()); showProduct(el.dataset.id); };
  actions['quick-service'] = (el, e) => { e.preventDefault(); showService(el.dataset.id); };

  async function showProduct(key) {
    let p;
    try { p = (await api('/api/products/' + encodeURIComponent(key))).product; }
    catch { toast(t('pm.notFound'), { type: 'err' }); closeProductUrl(); return; }
    const url = new URL(location.href); url.searchParams.set('p', p.id); history.replaceState(null, '', url.pathname + url.search + url.hash);
    const dept = deptOf(p), inquiry = isInquiry(p), site = state.config.site || {};
    const off = discountPct(p), out = p.stock < 1, wished = state.wishlist.has(p.id);
    const imgs = p.images && p.images.length ? p.images : p.image_url ? [p.image_url] : [];
    const specs = dept ? dept.fields.filter((f) => p.attributes?.[f.key] !== undefined && p.attributes[f.key] !== '')
      .map((f) => `<dt>${esc(fieldLabel(f))}</dt><dd>${f.type === 'textarea' ? esc(String(p.attributes[f.key])).replace(/\n/g, '<br>') : esc(attrValue(f, p.attributes[f.key]))}</dd>`).join('') : '';
    const wa = site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t('inq.waText', { name: nameOf(p) }))}` : '';
    const buy = inquiry
      ? `<form class="inq-box" data-form="inquiry" data-pid="${p.id}"><h4>${t('inq.title')}</h4>
          <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <label class="field"><span>${t('inq.name')}</span><input class="input" name="name" required minlength="2" maxlength="80" value="${esc(state.user?.name || '')}" autocomplete="name"></label>
          <label class="field"><span>${t('inq.phone')}</span><input class="input" name="phone" required inputmode="tel" maxlength="20" dir="ltr" value="${esc(state.user?.phone || '')}" autocomplete="tel"></label>
          <label class="field"><span>${t('inq.message')}</span><textarea class="textarea" name="message" rows="2" maxlength="1000"></textarea></label>
          <p class="form-error hidden" role="alert"></p>
          <div class="row"><button class="btn btn-primary grow" type="submit">${t('inq.send')}</button>${wa ? `<a class="btn wa-btn" target="_blank" rel="noopener" href="${esc(wa)}">${t('inq.wa')}</a>` : ''}${site.phone ? `<a class="btn" href="tel:${esc(site.phone)}">${t('inq.call')}</a>` : ''}</div></form>`
      : `<div class="pm-actions"><div class="qty lg"><button type="button" data-q="-1" aria-label="−">${icon('minus', 14)}</button><span id="pmQty">1</span><button type="button" data-q="1" aria-label="+">${icon('plus', 14)}</button></div>
          <button type="button" class="btn btn-primary btn-lg grow" id="pmAdd" ${out ? 'disabled' : ''}>${icon('cart', 18)}<span>${out ? t('card.out') : t('card.add')}</span></button>
          <button type="button" class="btn btn-lg" id="pmBuy" ${out ? 'disabled' : ''}>${t('pm.buyNow')}</button>
          <button type="button" class="wish-btn static ${wished ? 'on' : ''}" data-action="wish" data-id="${p.id}" aria-pressed="${wished}" aria-label="${t(wished ? 'card.unwish' : 'card.wish')}">${icon('heart', 20)}</button></div>`;
    const m = openModal({ wide: true, className: 'pm', onClose: closeProductUrl, title: '', html: `
      <div class="pm-grid"><div class="gallery"><div class="pm-media">${imgTag({ ...p, image_url: imgs[0] || '' }, 'product', 'pm-img')}${off ? `<span class="ribbon sale">${t('card.off', { p: off })}</span>` : ''}</div>
        ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((u, i) => `<button type="button" class="${i === 0 ? 'on' : ''}" data-src="${esc(u)}" aria-label="${i + 1}"><img src="${esc(u)}" alt=""></button>`).join('')}</div>` : ''}</div>
      <div class="pm-info"><span class="tag">${esc(p.category || (dept ? deptName(dept) : ''))}</span><h2>${esc(nameOf(p))}</h2>
        <div class="rating">${p.review_count ? `${stars(p.rating)} <span class="muted">${Number(p.rating).toFixed(1)} · ${t('card.reviews', { n: p.review_count })}</span>` : ''}</div>
        <div class="price-row big"><span class="price">${money(p.price)}</span>${off ? `<del class="old">${fmt(p.old_price)}</del>` : ''}</div>
        <p class="pm-desc">${esc(descOf(p))}</p>
        ${specs ? `<dl class="specs" aria-label="${t('spec.title')}">${specs}</dl>` : ''}
        ${inquiry ? '' : `<p class="stock-line ${out ? 'bad' : p.stock <= state.config.low_stock ? 'warn' : 'good'}">${out ? t('card.out') : p.stock <= state.config.low_stock ? t('card.left', { n: p.stock }) : t('card.inStock')}</p>
          ${!out && site.delivery_estimate ? `<p class="deliv">${icon('truck', 16)} ${t('pm.delivery', { d: esc(site.delivery_estimate) })}</p>` : ''}
          ${!out && p.price >= state.config.free_shipping_threshold ? `<p class="deliv good">${icon('check', 16)} ${t('pm.freeShip')}</p>` : ''}`}
        ${buy}</div></div>
      ${inquiry ? '' : `<section class="reviews"><h3>${t('pm.reviews')}</h3><div id="pmReviews"><div class="skeleton"></div></div></section>`}
      <section class="similar-sec hidden" id="similarSec"><h3>${t('pm.similar')}</h3><div class="similar" id="similarBox"></div></section>` });
    pushRecent(p.id);
    catalogOnce().then(({ products }) => {
      const sim = products.filter((x) => x.id !== p.id && x.department_id === p.department_id).sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price)).slice(0, 4);
      if (!sim.length || !m.el.isConnected) return;
      $('#similarBox', m.el).innerHTML = sim.map((x) => `<a class="mini" href="/store.html?p=${x.id}" data-action="quick" data-id="${x.id}">${imgTag(x, 'product', 'mini-img')}<span class="mini-name">${esc(nameOf(x))}</span><b>${money(x.price)}</b></a>`).join('');
      $('#similarSec', m.el).classList.remove('hidden');
    });
    m.el.addEventListener('click', (e) => {
      const th = e.target.closest('.thumbs button');
      if (th) { $('.pm-img', m.el).src = th.dataset.src; $$('.thumbs button', m.el).forEach((b) => b.classList.toggle('on', b === th)); }
    });
    if (!inquiry) {
      let qty = 1;
      const max = Math.max(1, Math.min(state.config.max_qty, p.stock));
      m.el.addEventListener('click', (e) => {
        const b = e.target.closest('.qty button'); if (!b) return;
        qty = Math.min(max, Math.max(1, qty + Number(b.dataset.q))); $('#pmQty', m.el).textContent = qty;
      });
      $('#pmAdd', m.el).addEventListener('click', (e) => addToCart('product', p.id, qty, e.currentTarget));
      $('#pmBuy', m.el).addEventListener('click', async (e) => { if (await addToCart('product', p.id, qty, e.currentTarget)) { m.close(); actions.checkout(); } });
      loadReviews(p.id, m.el);
    }
  }
  forms.inquiry = async (f) => {
    const err = $('.form-error', f); err.classList.add('hidden');
    try {
      await busy($('button[type=submit]', f), () => api('/api/inquiries', { method: 'POST', body: { ...readForm(f), product_id: Number(f.dataset.pid) } }));
      f.innerHTML = `<div class="notice ok">${t('inq.sent')}</div>`;
    } catch (e) { err.textContent = errMsg(e); err.classList.remove('hidden'); }
  };
  async function loadReviews(pid, root) {
    const box = $('#pmReviews', root);
    try {
      const r = await api(`/api/products/${pid}/reviews`);
      const list = r.reviews.length ? r.reviews.map((x) => `<div class="review"><div class="row">${stars(x.rating)}<b>${esc(x.author)}</b><span class="muted small">${dateFmt(x.created_at)}</span></div>${x.body ? `<p>${esc(x.body)}</p>` : ''}</div>`).join('') : `<p class="muted">${t('pm.noReviews')}</p>`;
      const form = r.can_review
        ? `<form data-form="review" data-pid="${pid}" class="review-form"><h4>${t('pm.writeReview')}</h4><fieldset class="star-input" aria-label="${t('pm.yourRating')}">${[5, 4, 3, 2, 1].map((n) => `<input type="radio" name="rating" id="rt${n}" value="${n}" ${r.mine?.rating === n ? 'checked' : ''} required><label for="rt${n}" title="${n}">★</label>`).join('')}</fieldset>
           <textarea class="textarea" name="body" rows="2" maxlength="1000" placeholder="${t('pm.comment')}">${esc(r.mine?.body || '')}</textarea><button class="btn btn-primary" type="submit">${t('pm.submit')}</button></form>`
        : state.user ? `<p class="muted small">${t('pm.needBuy')}</p>` : '';
      box.innerHTML = list + form;
    } catch (e) { box.innerHTML = `<p class="muted">${esc(errMsg(e))}</p>`; }
  }
  forms.review = async (f) => {
    try {
      await busy($('button', f), () => api('/api/reviews/' + f.dataset.pid, { method: 'POST', body: { rating: Number(readForm(f).rating), body: readForm(f).body } }));
      toast(t('pm.thanks'), { type: 'ok' });
      loadReviews(f.dataset.pid, f.closest('.modal'));
    } catch (e) { toast(errMsg(e), { type: 'err' }); }
  };

  async function showService(key) {
    let s;
    try { s = (await api('/api/services/' + encodeURIComponent(key))).service; }
    catch { toast(t('pm.notFound'), { type: 'err' }); closeProductUrl(); return; }
    const url = new URL(location.href); url.searchParams.set('s', s.id); history.replaceState(null, '', url.pathname + url.search + url.hash);
    const m = openModal({ wide: true, className: 'pm', onClose: closeProductUrl, html: `<div class="pm-grid"><div class="pm-media">${imgTag(s, 'service', 'pm-img')}</div>
      <div class="pm-info"><span class="tag">${esc(s.category)}</span><h2>${esc(nameOf(s))}</h2><div class="price-row big"><span class="price">${money(s.price)}</span></div>
      <p class="pm-desc">${esc(descOf(s))}</p>${s.duration ? `<p class="muted">⏱ ${t('pm.duration')}: <b>${esc(s.duration)}</b></p>` : ''}
      <div class="pm-actions"><button type="button" class="btn btn-primary btn-lg grow" id="svAdd">${icon('cart', 18)}<span>${t('card.add')}</span></button></div></div></div>` });
    $('#svAdd', m.el).addEventListener('click', (e) => addToCart('service', s.id, 1, e.currentTarget));
  }
  actions['res-item'] = (el) => { if (el.dataset.kind === 'service') showService(el.dataset.id); else showProduct(el.dataset.id); };

  /* ───────── safe markdown-lite (everything is escaped first, only then formatted) ───────── */
  const mdInline = (x) => x.replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  function md(src) {
    const lines = String(src).replace(/\r/g, '').split('\n');
    const out = []; let i = 0, list = null, para = [];
    const flush = () => { if (para.length) { out.push('<p>' + mdInline(esc(para.join('\n'))).replace(/\n/g, '<br>') + '</p>'); para = []; } };
    const close = () => { if (list) { out.push('</' + list + '>'); list = null; } };
    while (i < lines.length) {
      const ln = lines[i];
      if (/^\s*```/.test(ln)) { flush(); close(); const code = []; i++; while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]); i++; out.push('<pre class="as-code" dir="ltr"><code>' + esc(code.join('\n')) + '</code></pre>'); continue; }
      const h = ln.match(/^#{1,4}\s+(.*)/);
      if (h) { flush(); close(); out.push('<p><strong>' + mdInline(esc(h[1])) + '</strong></p>'); i++; continue; }
      const ul = ln.match(/^\s*[-*•]\s+(.*)/), ol = ln.match(/^\s*\d+[.)]\s+(.*)/);
      if (ul || ol) { flush(); const tag = ul ? 'ul' : 'ol'; if (list !== tag) { close(); out.push('<' + tag + '>'); list = tag; } out.push('<li>' + mdInline(esc((ul || ol)[1])) + '</li>'); i++; continue; }
      if (!ln.trim()) { flush(); close(); i++; continue; }
      close(); para.push(ln); i++;
    }
    flush(); close(); return out.join('');
  }

  /* ───────── two chat bots: shopping assistant + customer service ───────── */
  const BOTS = {
    shop: { icon: 'spark', endpoint: '/api/assistant/chat', extra: { mode: 'store' }, chips: [1, 2, 3, 4], pre: 'chat' },
    support: { icon: 'headset', endpoint: '/api/support/chat', extra: {}, chips: [1, 2, 3, 4], pre: 'sup' }
  };
  const siteName = () => state.config.site?.name || '';
  const botTitle = (k) => (k === 'shop' ? t('chat.title', { name: siteName() }) : t('sup.title'));
  const botHello = (k) => (k === 'shop' ? t(state.config.chat_advanced ? 'chat.hello' : 'chat.helloBasic', { name: siteName() }) : t('sup.hello', { name: siteName() }));
  const histKey = (k) => 'bola_chat_' + k;
  const chatHist = (k) => { try { return JSON.parse(store.sget(histKey(k)) || '[]'); } catch { return []; } };
  function chatHTML() {
    const box = (k) => `<div class="chatbox" id="chat-${k}" data-bot="${k}" role="dialog" aria-label="${esc(botTitle(k))}">
      <div class="chat-head"><div><b id="title-${k}">${esc(botTitle(k))}</b><div class="chat-status">● ${t(k === 'shop' ? 'chat.status' : 'sup.status')}</div></div><button type="button" class="icon-btn sm" data-action="chat-toggle" data-bot="${k}" aria-label="${t('close')}">${icon('x', 16)}</button></div>
      <div class="messages" id="msgs-${k}" aria-live="polite"></div>
      <div class="quick-prompts">${BOTS[k].chips.map((n) => `<button type="button" data-action="chat-quick" data-bot="${k}" data-text="${esc(t(BOTS[k].pre + '.q' + n + 't'))}">${t(BOTS[k].pre + '.q' + n)}</button>`).join('')}</div>
      <form class="chat-form" data-form="chat" data-bot="${k}"><input id="in-${k}" class="input" autocomplete="off" maxlength="500" placeholder="${t('chat.ph')}" aria-label="${t('chat.ph')}"><button class="btn btn-primary icon-only" aria-label="${t('chat.send')}">${icon('send', 18)}</button></form></div>`;
    return `<div class="chat">${box('shop')}${box('support')}
      <div class="fabs"><button type="button" class="chat-fab support" data-action="chat-toggle" data-bot="support" aria-label="${t('sup.open')}" title="${t('sup.open')}">${icon('headset', 24)}</button>
      <button type="button" class="chat-fab" data-action="chat-toggle" data-bot="shop" aria-label="${t('chat.open')}" title="${t('chat.open')}">${icon('spark', 24)}</button></div></div>`;
  }
  function addMsg(bot, role, text, extra = {}) {
    const box = $('#msgs-' + bot); if (!box) return null;
    const m = d.createElement('div'); m.className = 'msg ' + (role === 'user' ? 'me' : 'bot'); m.setAttribute('dir', 'auto');
    if (role === 'user') m.textContent = text; else m.innerHTML = md(text);
    box.appendChild(m);
    if (extra.items?.length) {
      const list = d.createElement('div'); list.className = 'res-list';
      list.innerHTML = extra.items.slice(0, 5).map((x) => `<button type="button" class="res-item" data-action="res-item" data-kind="${esc(x.kind)}" data-id="${x.id}"><span><b>${esc(nameOf(x))}</b><small class="muted">${esc(x.category || '')}</small></span><span class="res-meta"><b>${money(x.price)}</b>${x.stock == null ? (x.duration ? `<small>${esc(x.duration)}</small>` : '') : `<small class="${x.stock > 0 ? 'good' : 'bad'}">${x.stock > 0 ? t('card.inStock') + ' (' + x.stock + ')' : t('card.out')}</small>`}</span></button>`).join('');
      box.appendChild(list);
    }
    if (extra.actions?.length) {
      const row = d.createElement('div'); row.className = 'bot-actions';
      row.innerHTML = extra.actions.map((a) => a.type === 'ticket' ? `<button type="button" class="btn btn-sm" data-action="open-ticket" data-bot="${bot}">${icon('edit', 14)} ${t('sup.ticketT')}</button>`
        : a.type === 'whatsapp' ? `<a class="btn btn-sm wa-btn" target="_blank" rel="noopener" href="${esc(a.url)}">${t('sup.wa')}</a>`
        : a.type === 'login' ? `<button type="button" class="btn btn-sm btn-primary" data-action="go-login">${t('sup.login')}</button>`
        : a.type === 'orders' ? `<a class="btn btn-sm" href="/account.html#orders">${t('sup.orders')}</a>` : '').join('');
      box.appendChild(row);
    }
    box.scrollTop = box.scrollHeight; return m;
  }
  actions['chat-toggle'] = (el) => {
    const k = el.dataset.bot, box = $('#chat-' + k), open = !box.classList.contains('open');
    $$('.chatbox').forEach((b) => b.classList.remove('open'));
    box.classList.toggle('open', open);
    if (open) $('#in-' + k).focus();
  };
  actions['chat-quick'] = (el) => { const k = el.dataset.bot; $('#in-' + k).value = el.dataset.text; $(`#chat-${k} .chat-form`).requestSubmit(); };
  actions['res-item'] = (el) => { if (el.dataset.kind === 'service') showService(el.dataset.id); else showProduct(el.dataset.id); };
  actions['open-ticket'] = (el) => {
    const k = el.dataset.bot, box = $('#msgs-' + k); if ($('.ticket', box)) return;
    const f = d.createElement('form'); f.className = 'ticket'; f.dataset.form = 'ticket'; f.dataset.bot = k;
    f.innerHTML = `<b>${t('sup.ticketT')}</b><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <input class="input" name="name" required minlength="2" maxlength="80" placeholder="${t('sup.name')}" value="${esc(state.user?.name || '')}">
      <input class="input" name="phone" required inputmode="tel" maxlength="20" dir="ltr" placeholder="${t('sup.phone')}" value="${esc(state.user?.phone || '')}">
      <textarea class="textarea" name="message" required minlength="3" maxlength="1000" rows="2" placeholder="${t('sup.msg')}"></textarea>
      <p class="form-error hidden" role="alert"></p><button class="btn btn-primary btn-sm" type="submit">${t('sup.send')}</button>`;
    box.appendChild(f); box.scrollTop = box.scrollHeight; $('input[name=name]', f).focus();
  };
  forms.ticket = async (f) => {
    const err = $('.form-error', f); err.classList.add('hidden');
    try { await busy($('button[type=submit]', f), () => api('/api/support/tickets', { method: 'POST', body: readForm(f) })); f.remove(); addMsg(f.dataset.bot, 'assistant', t('sup.sent')); }
    catch (e) { err.textContent = errMsg(e); err.classList.remove('hidden'); }
  };
  forms.chat = async (f) => {
    const k = f.dataset.bot, input = $('#in-' + k), text = input.value.trim(); if (!text) return;
    input.value = ''; addMsg(k, 'user', text);
    const hist = chatHist(k); const typing = addMsg(k, 'assistant', '…'); typing.classList.add('typing');
    try {
      const r = await api(BOTS[k].endpoint, { method: 'POST', body: { message: text, history: hist, ...BOTS[k].extra } });
      typing.remove(); addMsg(k, 'assistant', r.answer, { items: r.items, actions: r.actions });
      hist.push({ role: 'user', content: text }, { role: 'assistant', content: r.answer }); store.sset(histKey(k), JSON.stringify(hist.slice(-12)));
    } catch (e) { typing.remove(); addMsg(k, 'assistant', e.code === 'RATE_LIMITED' ? errMsg(e) : t('chat.fail')); }
  };

  /* ───────── notifications (bell) ───────── */
  async function loadNotifs() {
    const box = $('#notifBox');
    try {
      const r = await api('/api/notifications');
      box.innerHTML = r.items.length ? r.items.map((n) => `<a class="nt-row ${n.is_read ? '' : 'new'}" href="${esc(n.link || '#')}"><b>${esc(lang === 'ar' ? n.title_ar : n.title_en || n.title_ar)}</b>${(lang === 'ar' ? n.body_ar : n.body_en) ? `<span class="muted small">${esc(lang === 'ar' ? n.body_ar : n.body_en)}</span>` : ''}<span class="muted small">${dateFmt(n.created_at, true)}</span></a>`).join('') : `<p class="muted center" style="padding:16px">${t('nt.none')}</p>`;
      if (r.unread) { await api('/api/notifications/read', { method: 'POST' }); state.unread = 0; paintHeaderState(); }
    } catch (e) { box.textContent = errMsg(e); }
  }
  actions['notif-toggle'] = (el) => {
    const box = $('#notifBox'), open = box.classList.contains('hidden');
    box.classList.toggle('hidden', !open); el.setAttribute('aria-expanded', open);
    if (open) loadNotifs();
  };
  d.addEventListener('click', (e) => { if (!e.target.closest('#notifWrap')) $('#notifBox')?.classList.add('hidden'); });
  // light polling so the badge updates without reloading (once a minute, only while the tab is visible)
  setInterval(async () => {
    if (!state.user || d.hidden) return;
    try { const s = await api('/api/session'); state.unread = s.unread || 0; state.cartCount = s.cart_count; paintHeaderState(); } catch {}
  }, 60000);

  /* ───────── home banner slider ───────── */
  function slider(banners) {
    if (!banners?.length) return '';
    const one = (b, i) => {
      const title = lang === 'ar' ? b.title_ar : b.title_en || b.title_ar, sub = lang === 'ar' ? b.subtitle_ar : b.subtitle_en || b.subtitle_ar, btn = lang === 'ar' ? b.button_ar : b.button_en || b.button_ar;
      const tag = b.link_url ? 'a' : 'div';
      return `<${tag} class="slide ${i === 0 ? 'on' : ''}" ${b.link_url ? `href="${esc(b.link_url)}"` : ''} ${i ? 'aria-hidden="true"' : ''} style="${b.image_url ? `background-image:url('${esc(b.image_url)}')` : ''}"><div class="slide-txt">${title ? `<h2>${esc(title)}</h2>` : ''}${sub ? `<p>${esc(sub)}</p>` : ''}${btn ? `<span class="btn btn-primary">${esc(btn)}</span>` : ''}</div></${tag}>`;
    };
    return `<div class="slider" id="slider" role="region" aria-roledescription="carousel"><div class="slides">${banners.map(one).join('')}</div>${banners.length > 1 ? `<button type="button" class="sl-nav prev" data-action="sl-prev" aria-label="prev">‹</button><button type="button" class="sl-nav next" data-action="sl-next" aria-label="next">›</button><div class="sl-dots">${banners.map((_, i) => `<button type="button" class="${i === 0 ? 'on' : ''}" data-action="sl-go" data-i="${i}" aria-label="${i + 1}"></button>`).join('')}</div>` : ''}</div>`;
  }
  let slideTimer;
  function slideTo(i) {
    const sl = $('#slider'); if (!sl) return;
    const slides = $$('.slide', sl), n = slides.length; i = (i + n) % n;
    slides.forEach((x, k) => { x.classList.toggle('on', k === i); x.setAttribute('aria-hidden', k !== i); });
    $$('.sl-dots button', sl).forEach((x, k) => x.classList.toggle('on', k === i)); sl.dataset.i = i;
  }
  const slideNow = () => Number($('#slider')?.dataset.i || 0);
  actions['sl-next'] = () => { slideTo(slideNow() + 1); startSlides(); };
  actions['sl-prev'] = () => { slideTo(slideNow() - 1); startSlides(); };
  actions['sl-go'] = (el) => { slideTo(Number(el.dataset.i)); startSlides(); };
  function startSlides() {
    clearInterval(slideTimer);
    const sl = $('#slider'); if (!sl || $$('.slide', sl).length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    slideTimer = setInterval(() => { if (!d.hidden && !sl.matches(':hover')) slideTo(slideNow() + 1); }, 5500);
    let x0 = null;
    sl.ontouchstart = (e) => { x0 = e.touches[0].clientX; };
    sl.ontouchend = (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) slideTo(slideNow() + (dx < 0 === (d.documentElement.dir === 'rtl') ? -1 : 1)); x0 = null; startSlides(); };
  }

  /* ───────── init ───────── */
  let _resolve; const ready = new Promise((r) => (_resolve = r));
  async function init() {
    const h = $('#app-header'), f = $('#app-footer');
    if (h) h.innerHTML = headerHTML();
    if (f) f.innerHTML = footerHTML();
    if (!d.body.hasAttribute('data-bare')) d.body.insertAdjacentHTML('beforeend', drawerHTML() + chatHTML() + `<nav class="bottom-nav" aria-label="Main"><a href="/" ${isActive('/') ? 'aria-current="page"' : ''}>${icon('home', 22)}<span>${t('nav.home')}</span></a><a href="/store.html" ${isActive('/store.html') ? 'aria-current="page"' : ''}>${icon('search', 22)}<span>${t('nav.store')}</span></a><button type="button" data-action="open-cart">${icon('cart', 22)}<span>${t('nav.cart')}</span><i class="badge hidden" id="bnCart">0</i></button><a href="/account.html" ${isActive('/account.html') ? 'aria-current="page"' : ''}>${icon('user', 22)}<span>${t('nav.account')}</span></a></nav>`);
    paintHeaderState(); paintSite(); initSearch();
    const [cfg, s] = await Promise.all([api('/api/config').catch(() => null), api('/api/session').catch(() => ({ user: null, cart_count: 0, wishlist: [] }))]);
    if (cfg) state.config = { ...state.config, ...cfg };
    state.user = s.user; state.cartCount = s.cart_count; state.wishlist = new Set(s.wishlist); state.unread = s.unread || 0;
    paintHeaderState(); paintSite();
    for (const k of ['shop', 'support']) { const tt = $('#title-' + k); if (tt) tt.textContent = botTitle(k); if ($('#msgs-' + k)) addMsg(k, 'assistant', botHello(k)); }
    _resolve(state);
    const q = new URLSearchParams(location.search);
    if (d.body.hasAttribute('data-bare')) return;
    if (q.get('p') && !$('.modal.open')) showProduct(q.get('p'));
    if (q.get('s') && !$('.modal.open')) showService(q.get('s'));
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();

  window.Bola = { slider, startSlides, md, catalogOnce, recentIds, deptOf, deptName, fieldLabel, attrValue, optLabel, isInquiry, paintSite, $, $$, esc, t, extend, has, lang, api, ApiError, errMsg, state, actions, forms, ready, toast, openModal, busy, icon, stars, fmt, money, dateFmt, nameOf, descOf, titleOf, norm, discountPct, debounce, imgTag, placeholder, productCard, serviceCard, addToCart, showProduct, showService, openCart, requireLogin, goLogin, readForm, addressFields, paintHeaderState, setCart, GOVS, store };
})();
