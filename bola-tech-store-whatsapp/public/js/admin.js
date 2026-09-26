(() => {
  const B = window.Bola;
  const { t, $, $$, esc, icon, money, fmt, dateFmt, nameOf, titleOf } = B;
  B.extend({
    ar: {
      'ad.title': 'مركز التحكم', 'ad.loginSub': 'دخول الإدارة بحساب المدير.', 'ad.forbiddenT': 'الصفحة دي للإدارة فقط', 'ad.forbiddenP': 'حسابك الحالي ({email}) ليس له صلاحية المدير.', 'ad.home': 'الرئيسية', 'ad.switch': 'الدخول بحساب آخر',
      'ad.overview': 'نظرة عامة', 'ad.products': 'المنتجات', 'ad.departments': 'الأقسام والخانات', 'ad.services': 'الخدمات', 'ad.orders': 'الطلبات', 'ad.inquiries': 'الاستفسارات', 'ad.users': 'المستخدمون', 'ad.settings': 'إعدادات المتجر', 'ad.audit': 'سجل النشاط', 'ad.logout': 'خروج', 'ad.site': 'زيارة الموقع', 'ad.mySecurity': 'أمان حسابي',
      'ad.s.users': 'المستخدمون', 'ad.s.products': 'المنتجات النشطة', 'ad.s.stock': 'إجمالي المخزون', 'ad.s.services': 'الخدمات النشطة', 'ad.s.orders': 'الطلبات', 'ad.s.pending': 'قيد المراجعة', 'ad.s.revenue': 'الإيرادات', 'ad.s.reviews': 'التقييمات', 'ad.s.inquiries': 'استفسارات جديدة',
      'ad.sales7': 'مبيعات آخر 7 أيام', 'ad.recent': 'أحدث الطلبات', 'ad.lowStock': 'مخزون منخفض', 'ad.allGood': 'كل المنتجات مخزونها كافٍ 👌',
      'ad.add': 'إضافة', 'ad.search': 'بحث...', 'ad.archive': 'أرشفة', 'ad.restore': 'استرجاع', 'ad.archiveAsk': 'أرشفة العنصر؟ سيختفي من المتجر وتبقى الطلبات القديمة كما هي.', 'ad.saved': 'تم الحفظ', 'ad.archived': 'تمت الأرشفة',
      'ad.col.name': 'الاسم', 'ad.col.category': 'التصنيف', 'ad.col.price': 'السعر', 'ad.col.stock': 'المخزون', 'ad.col.status': 'الحالة', 'ad.col.actions': 'إجراءات', 'ad.col.customer': 'العميل', 'ad.col.total': 'الإجمالي', 'ad.col.date': 'التاريخ', 'ad.col.role': 'الدور', 'ad.col.orders': 'الطلبات', 'ad.col.email': 'البريد', 'ad.col.action': 'الفعل', 'ad.col.entity': 'الكيان', 'ad.col.duration': 'المدة', 'ad.col.dept': 'القسم', 'ad.col.phone': 'الهاتف', 'ad.col.message': 'الرسالة', 'ad.col.product': 'العنصر', 'ad.col.ip': 'IP', 'ad.col.security': 'الأمان',
      'ad.active': 'نشط', 'ad.archivedTag': 'مؤرشف', 'ad.featured': 'مميّز (يظهر في الرئيسية)', 'ad.activeChk': 'ظاهر في المتجر',
      'ad.newProduct': 'منتج جديد', 'ad.editProduct': 'تعديل المنتج', 'ad.newService': 'خدمة جديدة', 'ad.editService': 'تعديل الخدمة', 'ad.slugHint': 'الرابط (يُولّد تلقائياً لو تُرك فارغاً)', 'ad.descAr': 'الوصف بالعربي', 'ad.descEn': 'الوصف بالإنجليزي',
      'ad.filterAll': 'كل الحالات', 'ad.order': 'طلب #{id}', 'ad.customer': 'العميل', 'ad.update': 'تحديث الحالة', 'ad.updated': 'تم تحديث الحالة', 'ad.none': 'لا توجد بيانات.', 'ad.stockBack': 'إلغاء الطلب يرجّع المخزون تلقائياً ولا يمكن إعادة فتح الطلب الملغي.', 'ad.coupons': 'كوبونات الخصم', 'ad.banners': 'بنرات الرئيسية', 'ck.title': 'خطوات إعداد المتجر', 'ck.contact': 'أضف بيانات التواصل (هاتف / واتساب)', 'ck.logo': 'ارفع شعار متجرك', 'ck.policy': 'اكتب سياسة الاسترجاع', 'ck.banner': 'أضف بانر للصفحة الرئيسية', 'ck.products': 'أضف 8 منتجات على الأقل', 'ck.two_factor': 'فعّل التحقق بخطوتين لحسابك', 'ck.hide': 'إخفاء', 'ck.go': 'ابدأ',
      'ad.export': 'تصدير Excel', 'ad.import': 'استيراد من Excel', 'ad.dup': 'نسخ', 'ad.duped': 'تم النسخ — النسخة مخفية لحد ما تراجعها', 'ad.quickSaved': 'تم الحفظ', 'ad.imp.title': 'استيراد منتجات', 'ad.imp.help': 'جهّز ملف Excel واحفظه كـ CSV (UTF-8). العمود الأول «department» = اسم القسم أو رابطه، وباقي الأعمدة: name_ar, name_en, price, stock, category, وأي خانة من خانات القسم باسمها (مثال: سنة الصنع).', 'ad.imp.tpl': 'تحميل نموذج جاهز', 'ad.imp.pick': 'اختر ملف CSV', 'ad.imp.rows': '{n} صف جاهز للاستيراد', 'ad.imp.go': 'استيراد الآن', 'ad.imp.done': 'تم إنشاء {n} منتج', 'ad.imp.err': 'صفوف فيها مشاكل:', 'ad.imp.row': 'صف {r}: {f}',
      'cpn.code': 'الكود (حروف إنجليزي وأرقام)', 'cpn.type': 'النوع', 'cpn.percent': 'نسبة %', 'cpn.fixed': 'مبلغ ثابت', 'cpn.value': 'القيمة', 'cpn.min': 'أقل قيمة للطلب', 'cpn.max': 'أقصى خصم (للنسبة)', 'cpn.starts': 'يبدأ في', 'cpn.expires': 'ينتهي في', 'cpn.uses': 'أقصى عدد استخدامات (فارغ = بلا حد)', 'cpn.perUser': 'مرات الاستخدام لكل عميل', 'cpn.new': 'كوبون جديد', 'cpn.edit': 'تعديل الكوبون', 'cpn.used': 'استُخدم', 'cpn.deleteAsk': 'حذف الكوبون؟',
      'bn.new': 'بانر جديد', 'bn.edit': 'تعديل البانر', 'bn.titleAr': 'العنوان (عربي)', 'bn.titleEn': 'العنوان (إنجليزي)', 'bn.subAr': 'سطر فرعي (عربي)', 'bn.subEn': 'سطر فرعي (إنجليزي)', 'bn.link': 'الرابط (مثال: /store.html?deals=1)', 'bn.btnAr': 'نص الزر (عربي)', 'bn.btnEn': 'نص الزر (إنجليزي)', 'bn.image': 'صورة البانر (يفضّل عريضة 1600×500)', 'bn.deleteAsk': 'حذف البانر؟',
      'pay.method': 'طريقة الدفع', 'pay.ref': 'رقم العملية', 'pay.confirm': 'تأكيد استلام الدفع', 'pay.unconfirm': 'إلغاء التأكيد', 'pay.done': 'تم تحديث الدفع', 'ord.discount': 'خصم الكوبون',
      'se.pay': 'الدفع بالتحويل (محفظة / InstaPay)', 'se.walletOn': 'تفعيل الدفع بالتحويل في صفحة إتمام الطلب', 'se.walletNote': 'بيانات التحويل اللي هتظهر للعميل (رقم المحفظة / حساب InstaPay)', 'se.logo': 'شعار المتجر (يظهر بدل الاسم في الهيدر)',
      'ad.loadFail': 'تعذر تحميل القسم', 'ad.need2fa': 'لازم تفعّل التحقق بخطوتين لحسابك قبل استخدام لوحة التحكم.', 'ad.enable2fa': 'تفعيل التحقق بخطوتين',
      'ad.dept': 'القسم', 'ad.pickDept': 'اختار القسم', 'ad.deptFields': 'خانات {dept}', 'ad.images': 'الصور', 'ad.upload': 'رفع صورة', 'ad.uploadHint': 'اسحب الصور هنا أو اضغط للرفع. أول صورة هي الغلاف.', 'ad.imgUrl': 'أو ألصق رابط صورة', 'ad.addUrl': 'إضافة', 'ad.makeCover': 'غلاف', 'ad.uploading': 'جاري الرفع...',
      'dp.new': 'قسم جديد', 'dp.edit': 'تعديل القسم', 'dp.add': 'قسم جديد', 'dp.nameAr': 'اسم القسم بالعربي', 'dp.nameEn': 'اسم القسم بالإنجليزي', 'dp.descAr': 'وصف مختصر (عربي)', 'dp.descEn': 'وصف مختصر (إنجليزي)', 'dp.icon': 'الأيقونة', 'dp.mode': 'طريقة البيع', 'dp.modeCart': 'سلة وشراء مباشر (دفع عند الاستلام)', 'dp.modeInq': 'استفسار فقط (زي السيارات) — العميل يسيب بياناته', 'dp.order': 'الترتيب', 'dp.fields': 'الخانات (الحقول) الخاصة بالقسم', 'dp.fieldsHint': 'كل منتج في القسم هيظهر له الحقول دي. مثال للسيارات: الماركة، سنة الصنع، الكيلومترات، ناقل الحركة...', 'dp.addField': 'إضافة خانة', 'dp.label': 'اسم الخانة (عربي)', 'dp.labelEn': 'English name', 'dp.unit': 'الوحدة (اختياري)', 'dp.type': 'النوع', 'dp.options': 'الاختيارات — سطر لكل اختيار، وممكن «عربي | English»', 'dp.required': 'إجباري', 'dp.filterable': 'فلتر في المتجر', 'dp.onCard': 'يظهر على الكارت', 'dp.hidden': 'مخفية', 'dp.products': '{n} منتج', 'dp.fieldsN': '{n} خانة', 'dp.deleteAsk': 'حذف القسم نهائيًا؟', 'dp.cart': 'سلة', 'dp.inquiry': 'استفسار',
      'ft.text': 'نص قصير', 'ft.number': 'رقم', 'ft.select': 'اختيار من قائمة', 'ft.boolean': 'نعم / لا', 'ft.textarea': 'نص طويل',
      'iq.support': 'خدمة العملاء', 'se.delivery': 'التوصيل المتوقع (مثال: 2–4 أيام عمل)', 'se.hours': 'مواعيد العمل', 'se.returns': 'سياسة الاسترجاع والاستبدال', 'se.shipping': 'تفاصيل إضافية عن الشحن', 'se.supportH': 'خدمة العملاء وسياسات المتجر', 'iq.new': 'جديد', 'iq.contacted': 'تم التواصل', 'iq.closed': 'مغلق', 'iq.call': 'اتصال',
      'us.makeAdmin': 'ترقية لمدير', 'us.makeCustomer': 'تحويل لعميل', 'us.disable': 'إيقاف', 'us.enable': 'تفعيل', 'us.logout': 'إنهاء الجلسات', 'us.disabledTag': 'موقوف', 'us.2fa': '2FA ✓', 'us.done': 'تم', 'us.askDisable': 'إيقاف الحساب وتسجيل خروجه فورًا؟',
      'se.name': 'اسم المتجر', 'se.tagline': 'الشعار النصي (يظهر في الرئيسية)', 'se.phone': 'هاتف المتجر', 'se.whatsapp': 'واتساب التواصل العام', 'se.orderWhatsapp': 'رقم واتساب استقبال الطلبات (بكود الدولة)', 'se.email': 'بريد التواصل', 'se.address': 'العنوان', 'se.announcement': 'شريط إعلان أعلى الموقع', 'se.color': 'لون الموقع', 'se.hint': 'التغييرات تظهر للزوار خلال نصف دقيقة.',
      'field.brand_color': 'اللون', 'field.whatsapp': 'واتساب', 'field.field_key': 'مفتاح الخانة', 'field.options': 'الاختيارات (اكتب اختيارين على الأقل)', 'field.department_id': 'القسم', 'field.images': 'الصور', 'field.label_ar': 'اسم الخانة', 'field.unit': 'الوحدة', 'field.tagline': 'الشعار', 'field.announcement': 'الإعلان', 'field.address': 'العنوان'
    },
    en: {
      'ad.title': 'Control Center', 'ad.loginSub': 'Sign in with an admin account.', 'ad.forbiddenT': 'Administrators only', 'ad.forbiddenP': 'Your current account ({email}) does not have admin permission.', 'ad.home': 'Home', 'ad.switch': 'Sign in with another account',
      'ad.overview': 'Overview', 'ad.products': 'Products', 'ad.departments': 'Departments & fields', 'ad.services': 'Services', 'ad.orders': 'Orders', 'ad.inquiries': 'Inquiries', 'ad.users': 'Users', 'ad.settings': 'Store settings', 'ad.audit': 'Audit log', 'ad.logout': 'Log out', 'ad.site': 'View site', 'ad.mySecurity': 'My account security',
      'ad.s.users': 'Users', 'ad.s.products': 'Active products', 'ad.s.stock': 'Total stock', 'ad.s.services': 'Active services', 'ad.s.orders': 'Orders', 'ad.s.pending': 'Pending', 'ad.s.revenue': 'Revenue', 'ad.s.reviews': 'Reviews', 'ad.s.inquiries': 'New inquiries',
      'ad.sales7': 'Sales — last 7 days', 'ad.recent': 'Recent orders', 'ad.lowStock': 'Low stock', 'ad.allGood': 'All products are well stocked 👌',
      'ad.add': 'Add', 'ad.search': 'Search...', 'ad.archive': 'Archive', 'ad.restore': 'Restore', 'ad.archiveAsk': 'Archive this item? It disappears from the store; past orders are untouched.', 'ad.saved': 'Saved', 'ad.archived': 'Archived',
      'ad.col.name': 'Name', 'ad.col.category': 'Category', 'ad.col.price': 'Price', 'ad.col.stock': 'Stock', 'ad.col.status': 'Status', 'ad.col.actions': 'Actions', 'ad.col.customer': 'Customer', 'ad.col.total': 'Total', 'ad.col.date': 'Date', 'ad.col.role': 'Role', 'ad.col.orders': 'Orders', 'ad.col.email': 'Email', 'ad.col.action': 'Action', 'ad.col.entity': 'Entity', 'ad.col.duration': 'Duration', 'ad.col.dept': 'Department', 'ad.col.phone': 'Phone', 'ad.col.message': 'Message', 'ad.col.product': 'Item', 'ad.col.ip': 'IP', 'ad.col.security': 'Security',
      'ad.active': 'Active', 'ad.archivedTag': 'Archived', 'ad.featured': 'Featured (shown on the home page)', 'ad.activeChk': 'Visible in the store',
      'ad.newProduct': 'New product', 'ad.editProduct': 'Edit product', 'ad.newService': 'New service', 'ad.editService': 'Edit service', 'ad.slugHint': 'URL slug (auto-generated if left empty)', 'ad.descAr': 'Arabic description', 'ad.descEn': 'English description',
      'ad.filterAll': 'All statuses', 'ad.order': 'Order #{id}', 'ad.customer': 'Customer', 'ad.update': 'Update status', 'ad.updated': 'Status updated', 'ad.none': 'No data.', 'ad.stockBack': 'Cancelling an order restores its stock automatically, and a cancelled order cannot be re-opened.', 'ad.coupons': 'Coupons', 'ad.banners': 'Home banners', 'ck.title': 'Store setup checklist', 'ck.contact': 'Add contact details (phone / WhatsApp)', 'ck.logo': 'Upload your logo', 'ck.policy': 'Write your return policy', 'ck.banner': 'Add a home page banner', 'ck.products': 'Add at least 8 products', 'ck.two_factor': 'Enable two-step verification', 'ck.hide': 'Hide', 'ck.go': 'Start',
      'ad.export': 'Export to Excel', 'ad.import': 'Import from Excel', 'ad.dup': 'Duplicate', 'ad.duped': 'Duplicated — the copy is hidden until you review it', 'ad.quickSaved': 'Saved', 'ad.imp.title': 'Import products', 'ad.imp.help': 'Prepare an Excel file and save it as CSV (UTF-8). First column “department” = department name or slug; other columns: name_ar, name_en, price, stock, category, and any department field by its name (e.g. Year).', 'ad.imp.tpl': 'Download a ready template', 'ad.imp.pick': 'Choose a CSV file', 'ad.imp.rows': '{n} rows ready to import', 'ad.imp.go': 'Import now', 'ad.imp.done': '{n} products created', 'ad.imp.err': 'Rows with problems:', 'ad.imp.row': 'Row {r}: {f}',
      'cpn.code': 'Code (letters and numbers)', 'cpn.type': 'Type', 'cpn.percent': 'Percent %', 'cpn.fixed': 'Fixed amount', 'cpn.value': 'Value', 'cpn.min': 'Minimum order', 'cpn.max': 'Max discount (percent only)', 'cpn.starts': 'Starts on', 'cpn.expires': 'Expires on', 'cpn.uses': 'Max total uses (empty = unlimited)', 'cpn.perUser': 'Uses per customer', 'cpn.new': 'New coupon', 'cpn.edit': 'Edit coupon', 'cpn.used': 'Used', 'cpn.deleteAsk': 'Delete this coupon?',
      'bn.new': 'New banner', 'bn.edit': 'Edit banner', 'bn.titleAr': 'Title (Arabic)', 'bn.titleEn': 'Title (English)', 'bn.subAr': 'Subtitle (Arabic)', 'bn.subEn': 'Subtitle (English)', 'bn.link': 'Link (e.g. /store.html?deals=1)', 'bn.btnAr': 'Button text (Arabic)', 'bn.btnEn': 'Button text (English)', 'bn.image': 'Banner image (wide 1600×500 works best)', 'bn.deleteAsk': 'Delete this banner?',
      'pay.method': 'Payment method', 'pay.ref': 'Reference', 'pay.confirm': 'Confirm payment received', 'pay.unconfirm': 'Undo confirmation', 'pay.done': 'Payment updated', 'ord.discount': 'Coupon discount',
      'se.pay': 'Payment by transfer (wallet / InstaPay)', 'se.walletOn': 'Offer payment by transfer at checkout', 'se.walletNote': 'Transfer details shown to the customer (wallet number / InstaPay account)', 'se.logo': 'Store logo (replaces the name in the header)',
      'ad.loadFail': 'Could not load this section', 'ad.need2fa': 'You must enable two-step verification on your account before using the control center.', 'ad.enable2fa': 'Enable two-step verification',
      'ad.dept': 'Department', 'ad.pickDept': 'Choose a department', 'ad.deptFields': '{dept} fields', 'ad.images': 'Images', 'ad.upload': 'Upload image', 'ad.uploadHint': 'Drag images here or click to upload. The first image is the cover.', 'ad.imgUrl': 'or paste an image URL', 'ad.addUrl': 'Add', 'ad.makeCover': 'Cover', 'ad.uploading': 'Uploading...',
      'dp.new': 'New department', 'dp.edit': 'Edit department', 'dp.add': 'New department', 'dp.nameAr': 'Department name (Arabic)', 'dp.nameEn': 'Department name (English)', 'dp.descAr': 'Short description (Arabic)', 'dp.descEn': 'Short description (English)', 'dp.icon': 'Icon', 'dp.mode': 'Selling mode', 'dp.modeCart': 'Cart & direct purchase (cash on delivery)', 'dp.modeInq': 'Inquiry only (like cars) — the customer leaves their details', 'dp.order': 'Order', 'dp.fields': 'Custom fields for this department', 'dp.fieldsHint': 'Every product in the department gets these fields. Example for cars: brand, year, mileage, transmission...', 'dp.addField': 'Add field', 'dp.label': 'Field name (Arabic)', 'dp.labelEn': 'English name', 'dp.unit': 'Unit (optional)', 'dp.type': 'Type', 'dp.options': 'Options — one per line, optionally “Arabic | English”', 'dp.required': 'Required', 'dp.filterable': 'Filter in store', 'dp.onCard': 'Show on card', 'dp.hidden': 'Hidden', 'dp.products': '{n} products', 'dp.fieldsN': '{n} fields', 'dp.deleteAsk': 'Delete this department permanently?', 'dp.cart': 'Cart', 'dp.inquiry': 'Inquiry',
      'ft.text': 'Short text', 'ft.number': 'Number', 'ft.select': 'Choose from a list', 'ft.boolean': 'Yes / No', 'ft.textarea': 'Long text',
      'iq.support': 'Support', 'se.delivery': 'Estimated delivery (e.g. 2–4 business days)', 'se.hours': 'Working hours', 'se.returns': 'Return & exchange policy', 'se.shipping': 'Extra shipping details', 'se.supportH': 'Customer service & store policies', 'iq.new': 'New', 'iq.contacted': 'Contacted', 'iq.closed': 'Closed', 'iq.call': 'Call',
      'us.makeAdmin': 'Make admin', 'us.makeCustomer': 'Make customer', 'us.disable': 'Disable', 'us.enable': 'Enable', 'us.logout': 'End sessions', 'us.disabledTag': 'Disabled', 'us.2fa': '2FA ✓', 'us.done': 'Done', 'us.askDisable': 'Disable this account and sign it out immediately?',
      'se.name': 'Store name', 'se.tagline': 'Tagline (shown on the home page)', 'se.phone': 'Store phone', 'se.whatsapp': 'General WhatsApp', 'se.orderWhatsapp': 'Order WhatsApp number (with country code)', 'se.email': 'Contact email', 'se.address': 'Address', 'se.announcement': 'Announcement bar (top of the site)', 'se.color': 'Site colour', 'se.hint': 'Changes reach visitors within 30 seconds.',
      'field.brand_color': 'Colour', 'field.whatsapp': 'WhatsApp', 'field.field_key': 'Field key', 'field.options': 'Options (at least two)', 'field.department_id': 'Department', 'field.images': 'Images', 'field.label_ar': 'Field name', 'field.unit': 'Unit', 'field.tagline': 'Tagline', 'field.announcement': 'Announcement', 'field.address': 'Address'
    }
  });
  const root = $('#root');
  const SECTIONS = ['overview', 'products', 'departments', 'coupons', 'banners', 'services', 'orders', 'inquiries', 'users', 'settings', 'audit'];
  let section = SECTIONS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview';
  let cache = { products: [], services: [], orders: [] };
  let filter = { q: '', status: '' };

  /* ───────── gate ───────── */
  function loginView() {
    root.innerHTML = `<div class="container"><div class="auth-wrap"><div class="auth-card"><span class="eyebrow">CONTROL CENTER</span><h1>${t('ad.title')}</h1><p class="muted">${t('ad.loginSub')}</p>
      <form class="form" data-form="admin-login"><label class="field"><span>Admin ID / Email</span><input class="input" type="text" name="email" required autocomplete="username" dir="ltr" placeholder="BOLA-ADMIN-XXXXXXXX أو البريد"></label>
      <label class="field"><span>${t('acc.password')}</span><input class="input" type="password" name="password" required autocomplete="current-password"></label>
      <p class="form-error hidden" role="alert"></p><button class="btn btn-primary btn-lg" type="submit">${t('acc.login')}</button></form><div style="display:grid;gap:10px;margin-top:14px"><button id="passkeyLogin" class="btn btn-lg" type="button">🔐 الدخول بالبصمة / Face ID</button><small class="muted">سيستخدم النظام بصمة الإصبع أو Face ID أو Windows Hello حسب جهازك.</small></div></div></div></div>`;
  }
  const b64uToBuf = (x) => { x=x.replace(/-/g,'+').replace(/_/g,'/'); while(x.length%4)x+='='; const b=atob(x); return Uint8Array.from(b,c=>c.charCodeAt(0)); };
  const bufToB64u = (buf) => { const b=String.fromCharCode(...new Uint8Array(buf)); return btoa(b).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); };
  function publicKeyFromJSON(o){ const p={...o}; if(p.challenge)p.challenge=b64uToBuf(p.challenge); if(p.user?.id)p.user={...p.user,id:b64uToBuf(p.user.id)}; if(p.allowCredentials)p.allowCredentials=p.allowCredentials.map(c=>({...c,id:b64uToBuf(c.id)})); if(p.excludeCredentials)p.excludeCredentials=p.excludeCredentials.map(c=>({...c,id:b64uToBuf(c.id)})); return p; }
  function credentialJSON(c){const r={id:c.id,rawId:bufToB64u(c.rawId),type:c.type,response:{}};const x=c.response;r.response.clientDataJSON=bufToB64u(x.clientDataJSON);if(x.attestationObject)r.response.attestationObject=bufToB64u(x.attestationObject);if(x.authenticatorData)r.response.authenticatorData=bufToB64u(x.authenticatorData);if(x.signature)r.response.signature=bufToB64u(x.signature);if(x.userHandle)r.response.userHandle=bufToB64u(x.userHandle);return r;}
  async function passkeyLogin(){const identifier=$('input[name=email]')?.value.trim();if(!identifier)throw Error('اكتب Admin ID أو البريد أولاً');const d=await B.api('/api/passkeys/auth/options',{method:'POST',body:{identifier}});const c=await navigator.credentials.get({publicKey:publicKeyFromJSON(d.options)});await B.api('/api/passkeys/auth/verify',{method:'POST',body:{userId:d.userId,response:credentialJSON(c)}});location.reload();}
  document.addEventListener('click',async e=>{if(e.target.id!=='passkeyLogin')return;try{e.target.disabled=true;await passkeyLogin()}catch(err){alert(err.message||'تعذر استخدام البصمة / Face ID')}finally{e.target.disabled=false}});
  B.forms['admin-login'] = async (f) => {
    const err = $('.form-error', f); err.classList.add('hidden');
    try { await B.busy($('button[type=submit]', f), () => B.api('/api/auth/login', { method: 'POST', body: B.readForm(f) })); location.reload(); }
    catch (e) { err.textContent = B.errMsg(e); err.classList.remove('hidden'); }
  };
  function forbiddenView(u) {
    root.innerHTML = `<div class="container"><div class="auth-wrap"><div class="auth-card center"><h1>${t('ad.forbiddenT')}</h1><p class="muted">${t('ad.forbiddenP', { email: esc(u.email) })}</p>
      <div class="actions"><a class="btn btn-primary" href="/">${t('ad.home')}</a><button class="btn" data-action="logout">${t('ad.switch')}</button></div></div></div></div>`;
  }

  /* ───────── shell ───────── */
  function shell() {
    root.innerHTML = `<div class="admin-shell"><aside class="sidebar"><a class="brand" href="/" style="margin-bottom:14px">${esc(B.state.config.site?.name || 'Store')}</a>
      ${SECTIONS.map((s) => `<button class="side-btn ${s === section ? 'active' : ''}" data-action="go" data-s="${s}">${t('ad.' + s)}<span class="cnt hidden" id="cnt-${s}"></span></button>`).join('')}
      <div class="side-spacer"></div>
      <a class="side-btn" href="/">${t('ad.site')}</a>
      <a class="side-btn" href="/account.html#security">${t('ad.mySecurity')}</a>
      <div class="admin-id-card"><small>Admin ID</small><b>${esc((B.state?.user?.admin_id)||'—')}</b></div><button class="side-btn" id="registerPasskey" type="button">🔐 تسجيل بصمة / Face ID</button><button class="side-btn" data-action="lang">${t('nav.lang')}</button><button class="side-btn" data-action="theme">${t('nav.theme')}</button>
      <button class="side-btn" data-action="logout">${icon('logout', 18)} ${t('ad.logout')}</button></aside>
      <main class="admin-main"><h1 id="secTitle"></h1><div id="content"></div></main></div>`;
    load(); pollAlerts(); setInterval(pollAlerts, 60000);
  }
  async function pollAlerts() {
    try {
      const a = await B.api('/api/admin/alerts');
      const set = (k, n) => { const el = $('#cnt-' + k); if (el) { el.textContent = n; el.classList.toggle('hidden', !n); } };
      set('orders', a.pending_orders); set('inquiries', a.new_inquiries); set('products', a.low_stock);
      document.title = (a.pending_orders + a.new_inquiries ? `(${a.pending_orders + a.new_inquiries}) ` : '') + t('ad.title');
    } catch {}
  }
  async function registerAdminPasskey(){const d=await B.api('/api/passkeys/register/options',{method:'POST',body:{}});const c=await navigator.credentials.create({publicKey:publicKeyFromJSON(d)});await B.api('/api/passkeys/register/verify',{method:'POST',body:{...credentialJSON(c),deviceName:navigator.userAgent.includes('Windows')?'Windows Hello':navigator.platform}});B.toast('تم تسجيل هذا الجهاز للدخول بالبصمة / Face ID',{type:'ok'});}
  document.addEventListener('click',async e=>{if(e.target.id!=='registerPasskey')return;try{e.target.disabled=true;await registerAdminPasskey()}catch(err){alert(err.message||'تعذر تسجيل الجهاز')}finally{e.target.disabled=false}});
  B.actions.go = (el) => { section = el.dataset.s; filter = { q: '', status: '' }; history.replaceState(null, '', '#' + section); $$('.side-btn[data-s]').forEach((b) => b.classList.toggle('active', b.dataset.s === section)); load(); };

  const table = (heads, rows) => rows.length
    ? `<div class="table-wrap"><table class="table"><thead><tr>${heads.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`
    : `<div class="empty">${t('ad.none')}</div>`;

  async function load() {
    $('#secTitle').textContent = t('ad.' + section);
    const c = $('#content');
    c.innerHTML = '<div class="skeleton"></div>';
    try { await ({ overview, products: () => catalogView('products'), departments, services: () => catalogView('services'), orders, inquiries, users, settings, audit, coupons, banners })[section](c); }
    catch (e) {
      c.innerHTML = e.code === 'TWO_FACTOR_REQUIRED'
        ? `<div class="notice err">${t('ad.need2fa')}</div><p><a class="btn btn-primary" href="/account.html#security">${t('ad.enable2fa')}</a></p>`
        : `<div class="notice err">${t('ad.loadFail')}: ${esc(B.errMsg(e))}</div>`;
    }
  }

  /* ───────── overview ───────── */
  async function overview(c) {
    const [o, setup] = await Promise.all([B.api('/api/admin/overview'), B.api('/api/admin/setup').catch(() => ({ steps: [] }))]);
    const days = [];
    for (let i = 6; i >= 0; i--) { const dt = new Date(Date.now() - i * 864e5); days.push(dt.toLocaleDateString('en-CA')); }
    const byDay = Object.fromEntries(o.sales_7d.map((x) => [x.day, x.total]));
    const vals = days.map((k) => byDay[k] || 0), max = Math.max(...vals, 1);
    const S = [['users', o.users], ['products', o.products], ['stock', fmt(o.stock)], ['services', o.services], ['orders', o.orders], ['pending', o.pending], ['inquiries', o.new_inquiries], ['revenue', money(o.revenue)]];
    const steps = setup.steps || [], doneN = steps.filter((x) => x.done).length;
    let hideCk = false; try { hideCk = localStorage.getItem('bola_ck_off') === '1'; } catch {}
    const GO = { contact: 'settings', logo: 'settings', policy: 'settings', banner: 'banners', products: 'products' };
    const checklist = steps.length && doneN < steps.length && !hideCk
      ? `<div class="checklist"><div class="row"><h3 style="margin:0">${t('ck.title')} · ${doneN}/${steps.length}</h3><button class="btn btn-sm" data-action="ck-hide">${t('ck.hide')}</button></div><div class="bar"><i style="width:${Math.round((doneN / steps.length) * 100)}%"></i></div>
          ${steps.map((x) => `<div class="ck-row ${x.done ? 'done' : ''}"><span class="ck-dot">${x.done ? icon('check', 14) : ''}</span><span class="t">${t('ck.' + x.key)}</span>${x.done ? '' : (x.key === 'two_factor' ? `<a class="btn btn-sm" style="margin-inline-start:auto" href="/account.html#security">${t('ck.go')}</a>` : `<button class="btn btn-sm" style="margin-inline-start:auto" data-action="go" data-s="${GO[x.key]}">${t('ck.go')}</button>`)}</div>`).join('')}</div>` : '';
    c.innerHTML = `${checklist}<div class="stats">${S.map(([k, v]) => `<div class="stat"><span class="muted">${t('ad.s.' + k)}</span><b>${v}</b></div>`).join('')}</div>
      <div class="two-col" style="margin-top:18px"><div class="card"><h3>${t('ad.sales7')}</h3><div class="chart">${vals.map((v, i) => `<div class="col" title="${money(v)}"><div class="bar-area"><i style="height:${Math.max(3, (v / max) * 100)}%"></i></div><small>${days[i].slice(5)}</small></div>`).join('')}</div></div>
        <div class="card"><h3>${t('ad.lowStock')}</h3>${o.low_stock.length ? `<div class="low-list">${o.low_stock.map((p) => `<div><span>${esc(nameOf(p))}</span><b>${p.stock}</b></div>`).join('')}</div>` : `<p class="muted">${t('ad.allGood')}</p>`}</div></div>
      <h3 style="margin:22px 0 10px">${t('ad.recent')}</h3>${table(['#', t('ad.col.customer'), t('ad.col.total'), t('ad.col.status'), t('ad.col.date')], o.recent_orders.map((r) => `<tr><td>${r.id}</td><td>${esc(r.name || '—')}</td><td>${money(r.total)}</td><td><span class="pill ${r.status}">${t('st.' + r.status)}</span></td><td>${dateFmt(r.created_at, true)}</td></tr>`))}`;
  }

  B.actions['ck-hide'] = () => { try { localStorage.setItem('bola_ck_off', '1'); } catch {} load(); };

  /* ───────── products / services ───────── */
  let depts = [];
  let ed = { kind: 'products', imgs: [], max: 8 };
  const activeFields = (d) => (d ? d.fields.filter((f) => f.active !== false) : []);

  async function catalogView(kind) {
    if (kind === 'products') depts = (await B.api('/api/admin/departments')).items;
    cache[kind] = (await B.api('/api/admin/' + kind)).items;
    drawCatalog(kind);
  }
  function drawCatalog(kind) {
    const isP = kind === 'products', c = $('#content');
    const q = B.norm(filter.q);
    const items = cache[kind].filter((x) => (!q || B.norm(`${x.name_ar} ${x.name_en} ${x.category}`).includes(q)) && (!isP || !filter.dept || String(x.department_id) === filter.dept));
    const heads = ['', t('ad.col.name'), ...(isP ? [t('ad.col.dept')] : []), t('ad.col.category'), t('ad.col.price'), isP ? t('ad.col.stock') : t('ad.col.duration'), t('ad.col.status'), t('ad.col.actions')];
    const rows = items.map((x) => `<tr class="${x.active ? '' : 'dim'}"><td>${B.imgTag(x, isP ? 'product' : 'service', 'thumb')}</td>
      <td><b>${esc(nameOf(x))}</b>${x.featured ? ' <span title="featured" style="color:var(--gold)">★</span>' : ''}<div class="muted small">${esc(x.slug)}</div></td>
      ${isP ? `<td>${esc((depts.find((d) => d.id === x.department_id) && nameOf(depts.find((d) => d.id === x.department_id))) || '—')}</td>` : ''}<td>${esc(x.category)}</td>
      <td>${isP ? `<input class="inl" type="number" step="0.01" min="0" value="${x.price}" data-quick="price" data-id="${x.id}" aria-label="${t('ad.col.price')}">` : money(x.price)}${x.old_price ? ` <del class="muted small">${fmt(x.old_price)}</del>` : ''}</td>
      <td>${isP ? `<input class="inl" type="number" step="1" min="0" value="${x.stock}" data-quick="stock" data-id="${x.id}" aria-label="${t('ad.col.stock')}" style="width:76px">` : esc(x.duration || '')}</td>
      <td><span class="pill ${x.active ? 'delivered' : 'cancelled'}">${t(x.active ? 'ad.active' : 'ad.archivedTag')}</span></td>
      <td><div class="row-actions"><button class="icon-btn sm" data-action="ad-edit" data-kind="${kind}" data-id="${x.id}" aria-label="${t('edit')}">${icon('edit', 16)}</button>
        ${isP ? `<button class="btn btn-sm" data-action="ad-dup" data-id="${x.id}">${t('ad.dup')}</button>` : ''}<button class="btn btn-sm" data-action="ad-toggle" data-kind="${kind}" data-id="${x.id}">${t(x.active ? 'ad.archive' : 'ad.restore')}</button></div></td></tr>`);
    c.innerHTML = `<div class="toolbar" style="margin-top:0"><label class="search">${icon('search', 18)}<input id="adq" class="input" type="search" placeholder="${t('ad.search')}" value="${esc(filter.q)}"></label>
      ${isP ? `<select id="adDept" class="select"><option value="">${t('dept.all')}</option>${depts.map((d) => `<option value="${d.id}" ${filter.dept === String(d.id) ? 'selected' : ''}>${esc(nameOf(d))}</option>`).join('')}</select>` : ''}
      ${isP ? `<button class="btn" data-action="csv-export">${t('ad.export')}</button><button class="btn" data-action="csv-import">${t('ad.import')}</button>` : ''}
      <button class="btn btn-primary" data-action="ad-edit" data-kind="${kind}">${icon('plus', 16)} ${t('ad.add')}</button></div>${table(heads, rows)}`;
    $('#adq').addEventListener('input', B.debounce((e) => { filter.q = e.target.value; drawCatalog(kind); const v = $('#adq'); v.focus(); v.setSelectionRange(v.value.length, v.value.length); }, 200));
    $('#adDept')?.addEventListener('change', (e) => { filter.dept = e.target.value; drawCatalog(kind); });
  }

  /* --- image uploader: photos are shrunk in the browser, then stored in the database --- */
  async function shrink(file) {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(bmp.width * k)); cv.height = Math.max(1, Math.round(bmp.height * k));
    const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(bmp, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/jpeg', 0.85);
  }
  function upHTML() {
    return `<div class="uploader" id="up">${ed.imgs.map((u, i) => `<div class="up-thumb ${i === 0 ? 'cover' : ''}"><img src="${esc(u)}" alt=""><div class="tools">${i === 0 ? '<span style="color:#fff;font-size:12px;padding:2px 6px">★</span>' : `<button type="button" data-action="img-cover" data-i="${i}">${t('ad.makeCover')}</button>`}<button type="button" data-action="img-del" data-i="${i}" aria-label="${t('delete')}">✕</button></div></div>`).join('')}
      ${ed.imgs.length < ed.max ? `<label class="up-add">+ ${t('ad.upload')}<input type="file" accept="image/*" ${ed.max > 1 ? 'multiple' : ''} hidden id="upFile"></label>` : ''}</div>
      <p class="form-note">${t('ad.uploadHint')}</p><div class="row" style="justify-content:flex-start"><input class="input" id="upUrl" placeholder="${t('ad.imgUrl')}" style="max-width:340px"><button type="button" class="btn btn-sm" data-action="img-url">${t('ad.addUrl')}</button></div>`;
  }
  const drawUp = () => { const b = $('#upBox'); if (b) b.innerHTML = upHTML(); };
  async function handleFiles(files) {
    for (const file of [...files]) {
      if (ed.imgs.length >= ed.max) break;
      if (!file.type.startsWith('image/') || file.size > 25 * 1024 * 1024) { B.toast(t('err.INVALID_IMAGE'), { type: 'err' }); continue; }
      B.toast(t('ad.uploading'));
      try {
        const r = await B.api('/api/admin/media', { method: 'POST', body: { data: await shrink(file) } });
        ed.imgs.push(r.url); drawUp();
      } catch (e) { B.toast(B.errMsg(e), { type: 'err' }); }
    }
  }
  document.addEventListener('change', (e) => { if (e.target.id === 'upFile') handleFiles(e.target.files); });
  document.addEventListener('dragover', (e) => { const z = e.target.closest('#up'); if (z) { e.preventDefault(); z.classList.add('drag'); } });
  document.addEventListener('dragleave', (e) => e.target.closest?.('#up')?.classList.remove('drag'));
  document.addEventListener('drop', (e) => { const z = e.target.closest('#up'); if (z) { e.preventDefault(); z.classList.remove('drag'); handleFiles(e.dataTransfer.files); } });
  B.actions['img-del'] = (el) => { ed.imgs.splice(Number(el.dataset.i), 1); drawUp(); };
  B.actions['img-cover'] = (el) => { const [u] = ed.imgs.splice(Number(el.dataset.i), 1); ed.imgs.unshift(u); drawUp(); };
  B.actions['img-url'] = () => { const v = $('#upUrl').value.trim(); if (v && ed.imgs.length < ed.max) { ed.imgs.push(v); $('#upUrl').value = ''; drawUp(); } };

  /* --- product / service editor (custom fields come from the chosen department) --- */
  const attrInput = (f, v) => {
    const name = `attr__${f.key}`, label = `${esc(B.fieldLabel(f))}${f.unit ? ` (${esc(f.unit)})` : ''}${f.required ? ' *' : ''}`;
    if (f.type === 'boolean') return `<label class="check"><input type="checkbox" name="${name}" ${v === true ? 'checked' : ''}> <span>${label}</span></label>`;
    if (f.type === 'select') return `<label class="field"><span>${label}</span><select class="select" name="${name}" ${f.required ? 'required' : ''}><option value="">—</option>${(f.options || []).map((o) => `<option value="${esc(o.ar)}" ${v === o.ar ? 'selected' : ''}>${esc(B.lang === 'ar' ? o.ar : o.en || o.ar)}</option>`).join('')}</select></label>`;
    if (f.type === 'textarea') return `<label class="field" style="grid-column:1/-1"><span>${label}</span><textarea class="textarea" name="${name}" maxlength="2000">${esc(v ?? '')}</textarea></label>`;
    return `<label class="field"><span>${label}</span><input class="input" name="${name}" type="${f.type === 'number' ? 'number' : 'text'}" ${f.type === 'number' ? 'step="any"' : 'maxlength="200"'} ${f.required ? 'required' : ''} value="${esc(v ?? '')}"></label>`;
  };
  const collectAttrs = (form) => {
    const out = {};
    for (const el of form.elements) if (el.name?.startsWith('attr__')) out[el.name.slice(6)] = el.type === 'checkbox' ? el.checked : el.value;
    return out;
  };
  function drawAttrs(form, attrs) {
    const d = depts.find((x) => x.id === Number(form.elements.department_id?.value));
    $('#attrBox').innerHTML = d ? `<h4 class="sub-h">${t('ad.deptFields', { dept: esc(nameOf(d)) })}</h4><div class="grid-2">${activeFields(d).map((f) => attrInput(f, attrs[f.key])).join('')}</div>` : '';
  }
  B.actions['ad-edit'] = (el) => {
    const kind = el.dataset.kind, isP = kind === 'products';
    const x = el.dataset.id ? cache[kind].find((i) => i.id === Number(el.dataset.id)) : { active: true, category: isP ? '' : 'Services', department_id: isP ? depts.find((d) => d.active)?.id : undefined, attributes: {} };
    ed = { kind, max: isP ? 8 : 1, imgs: x.images && x.images.length ? [...x.images] : x.image_url ? [x.image_url] : [] };
    if (!isP) ed.imgs = ed.imgs.slice(0, 1);
    const base = isP
      ? [['name_ar', 'field.name_ar', 'text', 1], ['name_en', 'field.name_en', 'text', 1], ['category', 'field.category', 'text'], ['price', 'field.price', 'number', 1], ['old_price', 'field.old_price', 'number'], ['stock', 'field.stock', 'number', 1], ['slug', 'ad.slugHint', 'text']]
      : [['name_ar', 'field.name_ar', 'text', 1], ['name_en', 'field.name_en', 'text', 1], ['category', 'field.category', 'text'], ['price', 'field.price', 'number', 1], ['duration', 'field.duration', 'text'], ['slug', 'ad.slugHint', 'text']];
    const cats = [...new Set(cache[kind].map((i) => i.category).filter(Boolean))];
    const m = B.openModal({ wide: true, title: t(x.id ? (isP ? 'ad.editProduct' : 'ad.editService') : (isP ? 'ad.newProduct' : 'ad.newService')), html: `<form class="form" data-form="ad-save" data-kind="${kind}" data-id="${x.id || ''}">
      ${isP ? `<label class="field"><span>${t('ad.dept')} *</span><select class="select" name="department_id" required><option value="">${t('ad.pickDept')}</option>${depts.filter((d) => d.active || d.id === x.department_id).map((d) => `<option value="${d.id}" ${d.id === x.department_id ? 'selected' : ''}>${esc(nameOf(d))}</option>`).join('')}</select></label>` : ''}
      <div class="grid-2">${base.map(([n, l, type, req]) => `<label class="field"><span>${t(l)}${req ? ' *' : ''}</span><input class="input" name="${n}" type="${type}" ${type === 'number' ? 'step="0.01" min="0"' : ''} ${n === 'category' ? 'list="catList"' : ''} ${req ? 'required' : ''} value="${esc(x[n] ?? '')}"></label>`).join('')}</div>
      <datalist id="catList">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
      <div id="attrBox"></div>
      <h4 class="sub-h">${t('ad.images')}</h4><div id="upBox">${upHTML()}</div>
      <label class="field"><span>${t('ad.descAr')}</span><textarea class="textarea" name="description_ar" maxlength="2000">${esc(x.description_ar || '')}</textarea></label>
      <label class="field"><span>${t('ad.descEn')}</span><textarea class="textarea" name="description_en" maxlength="2000">${esc(x.description_en || '')}</textarea></label>
      <label class="check"><input type="checkbox" name="featured" ${x.featured ? 'checked' : ''}> <span>${t('ad.featured')}</span></label>
      <label class="check"><input type="checkbox" name="active" ${x.active !== false ? 'checked' : ''}> <span>${t('ad.activeChk')}</span></label>
      <p class="form-error hidden" role="alert"></p><button class="btn btn-primary btn-lg" type="submit">${t('save')}</button></form>` });
    const form = $('form', m.el);
    if (isP) {
      drawAttrs(form, x.attributes || {});
      form.elements.department_id.addEventListener('change', () => drawAttrs(form, collectAttrs(form)));
    }
  };
  B.forms['ad-save'] = async (f) => {
    const err = $('.form-error', f); err.classList.add('hidden');
    const { kind, id } = f.dataset, v = B.readForm(f);
    const body = Object.fromEntries(Object.entries(v).filter(([k]) => !k.startsWith('attr__')));
    if (kind === 'products') { body.attributes = collectAttrs(f); body.images = ed.imgs; body.department_id = Number(v.department_id) || undefined; }
    else body.image_url = ed.imgs[0] || '';
    try {
      await B.busy($('button[type=submit]', f), () => B.api('/api/admin/' + kind + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body }));
      f.closest('.modal')._close(); B.toast(t('ad.saved'), { type: 'ok' }); load();
    } catch (e) { err.textContent = B.errMsg(e); err.classList.remove('hidden'); }
  };
  B.actions['ad-toggle'] = async (el) => {
    const { kind, id } = el.dataset, x = cache[kind].find((i) => i.id === Number(id));
    try {
      if (x.active) { if (!confirm(t('ad.archiveAsk'))) return; await B.busy(el, () => B.api(`/api/admin/${kind}/${id}`, { method: 'DELETE' })); B.toast(t('ad.archived'), { type: 'ok' }); }
      else { await B.busy(el, () => B.api(`/api/admin/${kind}/${id}`, { method: 'PUT', body: { ...x, active: true } })); B.toast(t('ad.saved'), { type: 'ok' }); }
      load();
    } catch (e) { B.toast(B.errMsg(e), { type: 'err' }); }
  };

  // prices and stock are edited right in the table — change the number and leave the box (or press Enter)
  document.addEventListener('change', async (e) => {
    const inp = e.target.closest('input[data-quick]');
    if (!inp) return;
    const item = cache.products.find((x) => x.id === Number(inp.dataset.id)), key = inp.dataset.quick;
    try {
      const r = await B.api(`/api/admin/products/${inp.dataset.id}/quick`, { method: 'PATCH', body: { [key]: inp.value } });
      Object.assign(item, r.item); inp.classList.add('saved'); B.toast(t('ad.quickSaved'), { type: 'ok' }); setTimeout(() => inp.classList.remove('saved'), 1200);
    } catch (er) { inp.value = item[key]; B.toast(B.errMsg(er), { type: 'err' }); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches?.('input[data-quick]')) e.target.blur(); });
  B.actions['ad-dup'] = async (el) => {
    try { await B.busy(el, () => B.api(`/api/admin/products/${el.dataset.id}/duplicate`, { method: 'POST' })); B.toast(t('ad.duped'), { type: 'ok' }); load(); } catch (e) { B.toast(B.errMsg(e), { type: 'err' }); }
  };

  /* --- Excel (CSV) export / import --- */
  const csvCell = (v) => { const x = String(v ?? ''); return /[",\n\r;]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x; };
  const csvBase = ['department', 'name_ar', 'name_en', 'category', 'price', 'old_price', 'stock', 'description_ar', 'description_en', 'image_url', 'featured', 'active'];
  const csvLabels = () => [...new Set(depts.flatMap((d) => d.fields.map((f) => f.label_ar)))];
  function download(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  B.actions['csv-export'] = () => {
    const labels = csvLabels(), lines = [[...csvBase, ...labels].map(csvCell).join(',')];
    for (const p of cache.products) {
      const d = depts.find((x) => x.id === p.department_id);
      const attrs = labels.map((l) => { const f = d?.fields.find((x) => x.label_ar === l); const v = f ? p.attributes?.[f.key] : ''; return v === undefined ? '' : v === true ? 'نعم' : v === false ? 'لا' : v; });
      lines.push([d?.slug || '', p.name_ar, p.name_en, p.category, p.price, p.old_price ?? '', p.stock, p.description_ar, p.description_en, p.image_url, p.featured ? 'نعم' : 'لا', p.active ? 'نعم' : 'لا', ...attrs].map(csvCell).join(','));
    }
    download('products.csv', lines.join('\r\n'));
  };
  function parseCsv(text) {
    text = text.replace(/^\uFEFF/, '');
    const first = text.split(/\r?\n/, 1)[0] || '', delim = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
      else if (ch === '"') q = true;
      else if (ch === delim) { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); cell = ''; if (row.some((x) => x.trim() !== '')) rows.push(row); row = []; }
      else cell += ch;
    }
    row.push(cell); if (row.some((x) => x.trim() !== '')) rows.push(row);
    return rows;
  }
  let importRows = [];
  B.actions['csv-import'] = () => {
    importRows = [];
    B.openModal({ wide: true, title: t('ad.imp.title'), html: `<p class="muted">${t('ad.imp.help')}</p><p><button class="btn btn-sm" data-action="csv-template">${t('ad.imp.tpl')}</button></p>
      <label class="csv-box"><input type="file" accept=".csv,text/csv" id="csvFile" hidden>${t('ad.imp.pick')}</label><div id="impInfo" style="margin-top:12px"></div>` });
  };
  B.actions['csv-template'] = () => {
    const d = depts.find((x) => x.active) || depts[0], labels = (d?.fields || []).map((f) => f.label_ar);
    download('template.csv', [[...csvBase.slice(0, 7), ...labels].join(','), [d?.slug || 'electronics', 'اسم المنتج', 'Product name', 'تصنيف', '100', '', '10', ...labels.map(() => '')].join(',')].join('\r\n'));
  };
  document.addEventListener('change', async (e) => {
    if (e.target.id !== 'csvFile') return;
    const file = e.target.files[0]; if (!file) return;
    const grid = parseCsv(await file.text()), head = grid[0]?.map((x) => x.trim()) || [];
    importRows = grid.slice(1).map((r) => {
      const o = { attributes: {} };
      head.forEach((h, i) => { const v = (r[i] ?? '').trim(); if (!h) return; if (csvBase.includes(h) || h === 'slug') o[h] = v; else if (v !== '') o.attributes[h] = v; });
      o.featured = /^(نعم|yes|true|1)$/i.test(o.featured || ''); o.active = !/^(لا|no|false|0)$/i.test(o.active || 'yes');
      return o;
    }).filter((o) => o.name_ar || o.name_en);
    $('#impInfo').innerHTML = importRows.length ? `<p><b>${t('ad.imp.rows', { n: importRows.length })}</b></p><button class="btn btn-primary" data-action="csv-go">${t('ad.imp.go')}</button>` : `<p class="bad">0</p>`;
  });
  B.actions['csv-go'] = async (el) => {
    let created = 0; const errors = [];
    try {
      await B.busy(el, async () => {
        for (let i = 0; i < importRows.length; i += 100) {
          const chunk = importRows.slice(i, i + 100);
          const r = await B.api('/api/admin/import', { method: 'POST', body: { rows: chunk } });
          created += r.created; r.errors.forEach((x) => errors.push({ ...x, row: x.row + i }));
        }
      });
      $('#impInfo').innerHTML = `<div class="notice ok">${t('ad.imp.done', { n: created })}</div>${errors.length ? `<p class="bad">${t('ad.imp.err')}</p><div class="imp-errors">${errors.map((x) => `<div>${t('ad.imp.row', { r: x.row + 1, f: esc((B.lang === 'ar' ? x.label_ar : x.label_en) || x.field) })}</div>`).join('')}</div>` : ''}`;
      load();
    } catch (e) { B.toast(B.errMsg(e), { type: 'err' }); }
  };

  /* ───────── departments & custom fields ───────── */
  let dp = { fields: [] };
  const optsText = (f) => (typeof f._opts === 'string' ? f._opts : (f.options || []).map((o) => (o.en && o.en !== o.ar ? `${o.ar} | ${o.en}` : o.ar)).join('\n'));
  async function departments(c) {
    depts = (await B.api('/api/admin/departments')).items;
    c.innerHTML = `<div class="toolbar" style="margin-top:0"><button class="btn btn-primary" data-action="dp-edit">${icon('plus', 16)} ${t('dp.add')}</button></div><p class="form-note" style="margin-bottom:12px">${t('dp.fieldsHint')}</p>
      <div class="dept-admin">${depts.map((d) => `<div class="card"><div class="row" style="justify-content:flex-start;gap:14px"><span class="dept-ic">${icon(d.icon, 22)}</span><div><b>${esc(nameOf(d))}</b> <span class="pill ${d.active ? 'delivered' : 'cancelled'}">${t(d.active ? 'ad.active' : 'ad.archivedTag')}</span> <span class="tag">${t(d.purchase_mode === 'inquiry' ? 'dp.inquiry' : 'dp.cart')}</span><div class="muted small">${t('dp.products', { n: d.products_count })} · ${t('dp.fieldsN', { n: d.fields.length })}</div></div></div>
        <div class="row-actions"><button class="btn btn-sm" data-action="dp-edit" data-id="${d.id}">${t('edit')}</button><button class="icon-btn sm" data-action="dp-del" data-id="${d.id}" aria-label="${t('delete')}">${icon('trash', 16)}</button></div></div>`).join('')}</div>`;
  }
  function fieldRow(f, i, n) {
    const k = (name) => `data-k="${name}"`;
    return `<div class="fb-row" data-i="${i}">
      <input class="input" ${k('label_ar')} placeholder="${t('dp.label')}" value="${esc(f.label_ar || '')}" maxlength="60">
      <input class="input" ${k('label_en')} placeholder="${t('dp.labelEn')}" value="${esc(f.label_en || '')}" maxlength="60" dir="ltr">
      <select class="select" ${k('type')}>${['text', 'number', 'select', 'boolean', 'textarea'].map((x) => `<option value="${x}" ${f.type === x ? 'selected' : ''}>${t('ft.' + x)}</option>`).join('')}</select>
      <div class="fb-ctrl"><button type="button" class="icon-btn sm" data-action="fb-up" data-i="${i}" ${i === 0 ? 'disabled' : ''} aria-label="up">↑</button><button type="button" class="icon-btn sm" data-action="fb-down" data-i="${i}" ${i === n - 1 ? 'disabled' : ''} aria-label="down">↓</button><button type="button" class="icon-btn sm" data-action="fb-del" data-i="${i}" aria-label="${t('delete')}">${icon('trash', 14)}</button></div>
      ${['text', 'number'].includes(f.type) ? `<input class="input" ${k('unit')} placeholder="${t('dp.unit')}" value="${esc(f.unit || '')}" maxlength="20">` : ''}
      ${f.type === 'select' ? `<textarea class="textarea" ${k('_opts')} rows="3" placeholder="${t('dp.options')}">${esc(optsText(f))}</textarea>` : ''}
      <div class="flags">${f.type !== 'boolean' ? `<label class="check"><input type="checkbox" ${k('required')} ${f.required ? 'checked' : ''}> <span>${t('dp.required')}</span></label>` : ''}
        ${['select', 'boolean'].includes(f.type) ? `<label class="check"><input type="checkbox" ${k('filterable')} ${f.filterable ? 'checked' : ''}> <span>${t('dp.filterable')}</span></label>` : ''}
        <label class="check"><input type="checkbox" ${k('show_on_card')} ${f.show_on_card ? 'checked' : ''}> <span>${t('dp.onCard')}</span></label>
        <label class="check"><input type="checkbox" ${k('hidden')} ${f.active === false ? 'checked' : ''}> <span>${t('dp.hidden')}</span></label></div></div>`;
  }
  const drawFields = () => { const b = $('#fbList'); if (b) b.innerHTML = dp.fields.map((f, i) => fieldRow(f, i, dp.fields.length)).join(''); };
  B.actions['dp-edit'] = (el) => {
    const d = el.dataset.id ? depts.find((x) => x.id === Number(el.dataset.id)) : { active: true, icon: 'box', purchase_mode: 'cart', sort_order: depts.length + 1, fields: [] };
    dp = { fields: d.fields.map((f) => ({ ...f })) };
    B.openModal({ wide: true, title: t(d.id ? 'dp.edit' : 'dp.new'), html: `<form class="form" data-form="dp-save" data-id="${d.id || ''}">
      <div class="grid-2"><label class="field"><span>${t('dp.nameAr')} *</span><input class="input" name="name_ar" required maxlength="60" value="${esc(d.name_ar || '')}"></label><label class="field"><span>${t('dp.nameEn')} *</span><input class="input" name="name_en" required maxlength="60" dir="ltr" value="${esc(d.name_en || '')}"></label>
        <label class="field"><span>${t('dp.descAr')}</span><input class="input" name="description_ar" maxlength="300" value="${esc(d.description_ar || '')}"></label><label class="field"><span>${t('dp.descEn')}</span><input class="input" name="description_en" maxlength="300" dir="ltr" value="${esc(d.description_en || '')}"></label>
        <label class="field"><span>${t('dp.mode')}</span><select class="select" name="purchase_mode"><option value="cart" ${d.purchase_mode !== 'inquiry' ? 'selected' : ''}>${t('dp.modeCart')}</option><option value="inquiry" ${d.purchase_mode === 'inquiry' ? 'selected' : ''}>${t('dp.modeInq')}</option></select></label>
        <label class="field"><span>${t('dp.order')}</span><input class="input" name="sort_order" type="number" value="${d.sort_order ?? 0}"></label></div>
      <div><span class="form-note">${t('dp.icon')}</span><div class="chips" style="margin-top:6px">${['box', 'cpu', 'car', 'gamepad', 'book', 'shirt', 'home', 'gift', 'tool', 'ball', 'tag', 'heart'].map((n) => `<label class="chip"><input type="radio" name="icon" value="${n}" ${d.icon === n ? 'checked' : ''}>${icon(n, 20)}</label>`).join('')}</div></div>
      <label class="check"><input type="checkbox" name="active" ${d.active !== false ? 'checked' : ''}> <span>${t('ad.activeChk')}</span></label>
      <h4 class="sub-h">${t('dp.fields')}</h4><p class="form-note">${t('dp.fieldsHint')}</p><div id="fbList"></div>
      <button type="button" class="btn" data-action="fb-add">${icon('plus', 16)} ${t('dp.addField')}</button>
      <p class="form-error hidden" role="alert"></p><button class="btn btn-primary btn-lg" type="submit">${t('save')}</button></form>` });
    drawFields();
  };
  B.actions['fb-add'] = () => { dp.fields.push({ key: 'f_' + Math.random().toString(36).slice(2, 8), type: 'text', label_ar: '', label_en: '', options: [], active: true }); drawFields(); const rows = $$('#fbList .fb-row'); rows.at(-1)?.querySelector('input')?.focus(); };
  B.actions['fb-del'] = (el) => { dp.fields.splice(Number(el.dataset.i), 1); drawFields(); };
  B.actions['fb-up'] = (el) => { const i = Number(el.dataset.i); [dp.fields[i - 1], dp.fields[i]] = [dp.fields[i], dp.fields[i - 1]]; drawFields(); };
  B.actions['fb-down'] = (el) => { const i = Number(el.dataset.i); [dp.fields[i + 1], dp.fields[i]] = [dp.fields[i], dp.fields[i + 1]]; drawFields(); };
  const fbUpdate = (e) => {
    const el = e.target.closest('[data-k]'), row = e.target.closest('.fb-row');
    if (!el || !row) return;
    const f = dp.fields[Number(row.dataset.i)], k = el.dataset.k;
    if (el.type === 'checkbox') { if (k === 'hidden') f.active = !el.checked; else f[k] = el.checked; } else f[k] = el.value;
    if (k === 'type' && e.type === 'change') drawFields();
  };
  document.addEventListener('input', fbUpdate);
  document.addEventListener('change', fbUpdate);
  B.forms['dp-save'] = async (f) => {
    const err = $('.form-error', f); err.classList.add('hidden');
    const id = f.dataset.id, v = B.readForm(f);
    const body = { ...v, fields: dp.fields.map((x) => ({ key: x.key, type: x.type, label_ar: x.label_ar, label_en: x.label_en, unit: x.unit || '', options: x.type === 'select' ? optsText(x) : [], required: !!x.required, filterable: !!x.filterable, show_on_card: !!x.show_on_card, active: x.active !== false })) };
    try { await B.busy($('button[type=submit]', f), () => B.api('/api/admin/departments' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body })); f.closest('.modal')._close(); B.toast(t('ad.saved'), { type: 'ok' }); B.api('/api/config').then((c) => { B.state.config = { ...B.state.config, ...c }; }); load(); }
    catch (e) { err.textContent = B.errMsg(e); err.classList.remove('hidden'); }
  };
  B.actions['dp-del'] = async (el) => {
    if (!confirm(t('dp.deleteAsk'))) return;
    try { await B.busy(el, () => B.api('/api/admin/departments/' + el.dataset.id, { method: 'DELETE' })); load(); } catch (e) { B.toast(B.errMsg(e), { type: 'err' }); }
  };

  /* ───────── orders ───────── */
  async function orders(c) {
    cache.orders = (await B.api('/api/admin/orders' + (filter.status ? '?status=' + filter.status : ''))).items;
    c.innerHTML = `<div class="toolbar" style="margin-top:0"><select id="ost" class="select" aria-label="status"><option value="">${t('ad.filterAll')}</option>${['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => `<option value="${s}" ${filter.status === s ? 'selected' : ''}>${t('st.' + s)}</option>`).join('')}</select></div>` +
      table(['#', t('ad.col.customer'), t('ad.col.total'), t('pay.cod'), t('ad.col.status'), t('ad.col.date'), ''], cache.orders.map((o) => `<tr><td>${o.id}</td><td>${esc(o.name || '—')}<div class="muted small">${esc(o.email || '')}</div></td><td>${money(o.total)}</td><td><span class="pill ${o.payment_status}">${t('pay.' + o.payment_status)}</span></td><td><span class="pill ${o.status}">${t('st.' + o.status)}</span></td><td>${dateFmt(o.created_at, true)}</td><td><button class="btn btn-sm" data-action="ad-order" data-id="${o.id}">${t('ord.details')}</button></td></tr>`));
    $('#ost').addEventListener('change', (e) => { filter.status = e.target.value; load(); });
  }
  B.actions['ad-order'] = async (el) => {
    try {
      const { order: o, items } = await B.busy(el, () => B.api('/api/admin/orders/' + el.dataset.id));
      const a = o.address_json || {};
      const m = B.openModal({ title: t('ad.order', { id: o.id }), wide: true, html: `<div class="two-col"><div><b>${t('ad.customer')}</b><div class="muted">${esc(o.name || '—')}<br><span dir="ltr">${esc(o.email || '')}</span></div></div>
        <div><b>${t('ord.address')}</b><div class="muted">${[a.full_name, [a.street, a.building, a.area, a.city].filter(Boolean).join('، '), a.phone].filter(Boolean).map(esc).join('<br>') || '—'}</div></div></div>
        <div style="margin:14px 0">${items.map((i) => `<div class="oi"><div class="left">${B.imgTag({ image_url: i.image_url, name_ar: i.title, name_en: i.title_en, category: '' }, i.service_id ? 'service' : 'product')}<div><b>${esc(titleOf(i))}</b><div class="muted small">${i.quantity} × ${money(i.unit_price)}</div></div></div><b>${money(i.quantity * i.unit_price)}</b></div>`).join('')}</div>
        <dl class="totals"><div><dt>${t('cart.subtotal')}</dt><dd>${money(o.subtotal)}</dd></div>${Number(o.discount) ? `<div class="disc"><dt>${t('ord.discount')}${o.coupon_code ? ` (${esc(o.coupon_code)})` : ''}</dt><dd>− ${money(o.discount)}</dd></div>` : ''}<div><dt>${t('cart.shipping')}</dt><dd>${money(o.shipping)}</dd></div><div class="grand"><dt>${t('cart.total')}</dt><dd>${money(o.total)}</dd></div></dl>
        <div class="card" style="margin:12px 0;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><b>${t('pay.method')}:</b> ${t('pay.' + o.payment_method)}${o.payment_ref ? ` · ${t('pay.ref')}: <b dir="ltr">${esc(o.payment_ref)}</b>` : ''} · <span class="pill ${o.payment_status}">${t('pay.' + o.payment_status)}</span></div>
          ${o.status === 'cancelled' ? '' : `<button class="btn btn-sm ${o.payment_status === 'paid' ? '' : 'btn-primary'}" data-action="ad-pay" data-id="${o.id}" data-to="${o.payment_status === 'paid' ? 'unpaid' : 'paid'}">${t(o.payment_status === 'paid' ? 'pay.unconfirm' : 'pay.confirm')}</button>`}</div>
        ${o.notes ? `<p><b>${t('ord.notes')}:</b> <span class="muted">${esc(o.notes)}</span></p>` : ''}
        <form class="row" data-form="ad-status" data-id="${o.id}" style="margin-top:16px"><select class="select" name="status" style="max-width:240px" ${o.status === 'cancelled' ? 'disabled' : ''}>${['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${t('st.' + s)}</option>`).join('')}</select>
        <button class="btn btn-primary" type="submit" ${o.status === 'cancelled' ? 'disabled' : ''}>${t('ad.update')}</button></form><p class="muted small">${t('ad.stockBack')}</p>` });
      void m;
    } catch (e) { B.toast(B.errMsg(e), { type: 'err' }); }
  };
  B.actions['ad-pay'] = async (el) => {
    try { await B.busy(el, () => B.api(`/api/admin/orders/${el.dataset.id}/payment`, { method: 'PATCH', body: { status: el.dataset.to } })); B.toast(t('pay.done'), { type: 'ok' }); el.closest('.modal')._close(); load(); }
    catch (e) { B.toast(B.errMsg(e), { type: 'err' }); }
  };
  B.forms['ad-status'] = async (f) => {
    try { await B.busy($('button', f), () => B.api('/api/admin/orders/' + f.dataset.id, { method: 'PATCH', body: { status: B.readForm(f).status } })); B.toast(t('ad.updated'), { type: 'ok' }); f.closest('.modal')._close(); load(); }
    catch (e) { B.toast(B.errMsg(e), { type: 'err' }); }
  };

  /* ───────── coupons ───────── */
  let couponsCache = [];
  async function coupons(c) {
    couponsCache = (await B.api('/api/admin/coupons')).items;
    c.innerHTML = `<div class="toolbar" style="margin-top:0"><button class="btn btn-primary" data-action="cpn-edit">${icon('plus', 16)} ${t('cpn.new')}</button></div>` +
      table([t('cpn.code'), t('cpn.value'), t('cpn.min'), t('cpn.used'), t('cpn.expires'), t('ad.col.status'), t('ad.col.actions')], couponsCache.map((x) => `<tr class="${x.active ? '' : 'dim'}"><td dir="ltr" style="text-align:start"><b>${esc(x.code)}</b></td><td>${x.type === 'percent' ? `${Number(x.value)}%${x.max_discount ? ` (≤ ${money(x.max_discount)})` : ''}` : money(x.value)}</td><td>${money(x.min_total)}</td><td>${x.used_count}${x.max_uses ? ` / ${x.max_uses}` : ''}</td><td>${x.expires_at ? dateFmt(x.expires_at) : '—'}</td>
        <td><span class="pill ${x.active ? 'delivered' : 'cancelled'}">${t(x.active ? 'ad.active' : 'ad.archivedTag')}</span></td>
        <td><div class="row-actions"><button class="icon-btn sm" data-action="cpn-edit" data-id="${x.id}" aria-label="${t('edit')}">${icon('edit', 16)}</button><button class="icon-btn sm" data-action="cpn-del" data-id="${x.id}" aria-label="${t('delete')}">${icon('trash', 16)}</button></div></td></tr>`));
  }
  const dateVal = (v) => (v ? new Date(v).toLocaleDateString('en-CA') : '');
  B.actions['cpn-edit'] = (el) => {
    const x = el.dataset.id ? couponsCache.find((i) => i.id === Number(el.dataset.id)) : { type: 'percent', per_user: 1, active: true, min_total: 0 };
    B.openModal({ title: t(x.id ? 'cpn.edit' : 'cpn.new'), html: `<form class="form" data-form="cpn-save" data-id="${x.id || ''}"><div class="grid-2">
      <label class="field"><span>${t('cpn.code')} *</span><input class="input" name="code" required maxlength="30" dir="ltr" value="${esc(x.code || '')}" style="text-transform:uppercase"></label>
      <label class="field"><span>${t('cpn.type')}</span><select class="select" name="type"><option value="percent" ${x.type !== 'fixed' ? 'selected' : ''}>${t('cpn.percent')}</option><option value="fixed" ${x.type === 'fixed' ? 'selected' : ''}>${t('cpn.fixed')}</option></select></label>
      <label class="field"><span>${t('cpn.value')} *</span><input class="input" name="value" type="number" step="0.01" min="0.01" required value="${x.value ?? ''}"></label>
      <label class="field"><span>${t('cpn.max')}</span><input class="input" name="max_discount" type="number" step="0.01" min="0" value="${x.max_discount ?? ''}"></label>
      <label class="field"><span>${t('cpn.min')}</span><input class="input" name="min_total" type="number" step="0.01" min="0" value="${x.min_total ?? 0}"></label>
      <label class="field"><span>${t('cpn.perUser')}</span><input class="input" name="per_user" type="number" min="1" value="${x.per_user ?? 1}"></label>
      <label class="field"><span>${t('cpn.starts')}</span><input class="input" name="starts_at" type="date" value="${dateVal(x.starts_at)}"></label>
      <label class="field"><span>${t('cpn.expires')}</span><input class="input" name="expires_at" type="date" value="${dateVal(x.expires_at)}"></label></div>
      <label class="field"><span>${t('cpn.uses')}</span><input class="input" name="max_uses" type="number" min="1" value="${x.max_uses ?? ''}"></label>
      <label class="check"><input type="checkbox" name="active" ${x.active !== false ? 'checked' : ''}> <span>${t('ad.activeChk')}</span></label>
      <p class="form-error hidden" role="alert"></p><button class="btn btn-primary btn-lg" type="submit">${t('save')}</button></form>` });
  };
  B.forms['cpn-save'] = async (f) => {
    const err = $('.form-error', f); err.classList.add('hidden');
    const id = f.dataset.id, v = B.readForm(f);
    if (v.expires_at) v.expires_at = v.expires_at + 'T23:59:59'; // the coupon works through the end of its last day
    try { await B.busy($('button[type=submit]', f), () => B.api('/api/admin/coupons' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: v })); f.closest('.modal')._close(); B.toast(t('ad.saved'), { type: 'ok' }); load(); }
    catch (e) { err.textContent = B.errMsg(e); err.classList.remove('hidden'); }
  };
  B.actions['cpn-del'] = async (el) => { if (!confirm(t('cpn.deleteAsk'))) return; try { await B.busy(el, () => B.api('/api/admin/coupons/' + el.dataset.id, { method: 'DELETE' })); load(); } catch (e) { B.toast(B.errMsg(e), { type: 'err' }); } };

  /* ───────── banners ───────── */
  let bannersCache = [];
  async function banners(c) {
    bannersCache = (await B.api('/api/admin/banners')).items;
    c.innerHTML = `<div class="toolbar" style="margin-top:0"><button class="btn btn-primary" data-action="bn-edit">${icon('plus', 16)} ${t('bn.new')}</button></div>` +
      table(['', t('ad.col.name'), t('bn.link'), t('dp.order'), t('ad.col.status'), t('ad.col.actions')], bannersCache.map((x) => `<tr class="${x.active ? '' : 'dim'}"><td>${x.image_url ? `<img class="thumb" style="width:90px" src="${esc(x.image_url)}" alt="">` : ''}</td><td><b>${esc(B.lang === 'ar' ? x.title_ar : x.title_en || x.title_ar)}</b><div class="muted small">${esc(B.lang === 'ar' ? x.subtitle_ar : x.subtitle_en || x.subtitle_ar)}</div></td><td dir="ltr" style="text-align:start">${esc(x.link_url)}</td><td>${x.sort_order}</td>
        <td><span class="pill ${x.active ? 'delivered' : 'cancelled'}">${t(x.active ? 'ad.active' : 'ad.archivedTag')}</span></td>
        <td><div class="row-actions"><button class="icon-btn sm" data-action="bn-edit" data-id="${x.id}" aria-label="${t('edit')}">${icon('edit', 16)}</button><button class="icon-btn sm" data-action="bn-del" data-id="${x.id}" aria-label="${t('delete')}">${icon('trash', 16)}</button></div></td></tr>`));
  }
  B.actions['bn-edit'] = (el) => {
    const x = el.dataset.id ? bannersCache.find((i) => i.id === Number(el.dataset.id)) : { active: true, sort_order: bannersCache.length + 1 };
    ed = { kind: 'banner', max: 1, imgs: x.image_url ? [x.image_url] : [] };
    const F = (n, l, extra = '') => `<label class="field"><span>${t(l)}</span><input class="input" name="${n}" ${extra} value="${esc(x[n] ?? '')}"></label>`;
    B.openModal({ wide: true, title: t(x.id ? 'bn.edit' : 'bn.new'), html: `<form class="form" data-form="bn-save" data-id="${x.id || ''}"><div class="grid-2">${F('title_ar', 'bn.titleAr', 'maxlength="120"')}${F('title_en', 'bn.titleEn', 'maxlength="120" dir="ltr"')}${F('subtitle_ar', 'bn.subAr', 'maxlength="200"')}${F('subtitle_en', 'bn.subEn', 'maxlength="200" dir="ltr"')}${F('button_ar', 'bn.btnAr', 'maxlength="40"')}${F('button_en', 'bn.btnEn', 'maxlength="40" dir="ltr"')}${F('link_url', 'bn.link', 'dir="ltr"')}${F('sort_order', 'dp.order', 'type="number" min="0"')}</div>
      <h4 class="sub-h">${t('bn.image')}</h4><div id="upBox">${upHTML()}</div>
      <label class="check"><input type="checkbox" name="active" ${x.active !== false ? 'checked' : ''}> <span>${t('ad.activeChk')}</span></label>
      <p class="form-error hidden" role="alert"></p><button class="btn btn-primary btn-lg" type="submit">${t('save')}</button></form>` });
  };
  B.forms['bn-save'] = async (f) => {
    const err = $('.form-error', f); err.classList.add('hidden');
    const id = f.dataset.id, body = { ...B.readForm(f), image_url: ed.imgs[0] || '' };
    try { await B.busy($('button[type=submit]', f), () => B.api('/api/admin/banners' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body })); f.closest('.modal')._close(); B.toast(t('ad.saved'), { type: 'ok' }); load(); }
    catch (e) { err.textContent = B.errMsg(e); err.classList.remove('hidden'); }
  };
  B.actions['bn-del'] = async (el) => { if (!confirm(t('bn.deleteAsk'))) return; try { await B.busy(el, () => B.api('/api/admin/banners/' + el.dataset.id, { method: 'DELETE' })); load(); } catch (e) { B.toast(B.errMsg(e), { type: 'err' }); } };

  /* ───────── inquiries ───────── */
  async function inquiries(c) {
    const { items } = await B.api('/api/admin/inquiries');
    c.innerHTML = table([t('ad.col.date'), t('ad.col.product'), t('ad.col.customer'), t('ad.col.phone'), t('ad.col.message'), t('ad.col.status')], items.map((i) => `<tr><td>${dateFmt(i.created_at, true)}</td><td>${i.kind === 'support' ? `<span class="tag">${t('iq.support')}</span>` : esc((B.lang === 'ar' ? i.product_ar : i.product_en) || '—')}</td><td>${esc(i.name)}</td><td dir="ltr" style="text-align:start"><a href="tel:${esc(i.phone)}">${esc(i.phone)}</a></td><td style="white-space:normal;min-width:180px">${esc(i.message || '')}</td>
      <td><select class="select" data-iq="${i.id}">${['new', 'contacted', 'closed'].map((s) => `<option value="${s}" ${i.status === s ? 'selected' : ''}>${t('iq.' + s)}</option>`).join('')}</select></td></tr>`));
  }
  document.addEventListener('change', async (e) => {
    const sel = e.target.closest('select[data-iq]');
    if (!sel) return;
    try { await B.api('/api/admin/inquiries/' + sel.dataset.iq, { method: 'PATCH', body: { status: sel.value } }); B.toast(t('ad.saved'), { type: 'ok' }); } catch (er) { B.toast(B.errMsg(er), { type: 'err' }); }
  });

  /* ───────── users ───────── */
  async function users(c) {
    const { items } = await B.api('/api/admin/users');
    const me = B.state.user.id;
    c.innerHTML = table(['#', t('ad.col.name'), t('ad.col.email'), t('ad.col.role'), t('ad.col.orders'), t('ad.col.security'), t('ad.col.status'), t('ad.col.date'), t('ad.col.actions')], items.map((u) => `<tr class="${u.is_active ? '' : 'dim'}"><td>${u.id}</td><td>${esc(u.name)}</td><td dir="ltr" style="text-align:start">${esc(u.email)}</td><td><span class="pill ${u.role === 'admin' ? 'shipped' : ''}">${esc(u.role)}</span></td><td>${u.orders_count}</td>
      <td>${u.totp_enabled ? `<span class="pill delivered">${t('us.2fa')}</span>` : '—'}</td><td>${u.is_active ? '' : `<span class="pill cancelled">${t('us.disabledTag')}</span>`}</td><td>${dateFmt(u.created_at)}</td>
      <td>${u.id === me ? '' : `<div class="row-actions"><button class="btn btn-sm" data-action="us-role" data-id="${u.id}" data-role="${u.role === 'admin' ? 'customer' : 'admin'}">${t(u.role === 'admin' ? 'us.makeCustomer' : 'us.makeAdmin')}</button>
        <button class="btn btn-sm" data-action="us-active" data-id="${u.id}" data-active="${u.is_active ? '0' : '1'}">${t(u.is_active ? 'us.disable' : 'us.enable')}</button><button class="btn btn-sm" data-action="us-logout" data-id="${u.id}">${t('us.logout')}</button></div>`}</td></tr>`));
  }
  const userCall = async (el, fn) => { try { await B.busy(el, fn); B.toast(t('us.done'), { type: 'ok' }); load(); } catch (e) { B.toast(B.errMsg(e), { type: 'err' }); } };
  B.actions['us-role'] = (el) => userCall(el, () => B.api('/api/admin/users/' + el.dataset.id, { method: 'PATCH', body: { role: el.dataset.role } }));
  B.actions['us-active'] = (el) => { if (el.dataset.active === '0' && !confirm(t('us.askDisable'))) return; return userCall(el, () => B.api('/api/admin/users/' + el.dataset.id, { method: 'PATCH', body: { is_active: el.dataset.active === '1' } })); };
  B.actions['us-logout'] = (el) => userCall(el, () => B.api(`/api/admin/users/${el.dataset.id}/logout`, { method: 'POST' }));

  /* ───────── store settings ───────── */
  async function settings(c) {
    const { settings: s } = await B.api('/api/admin/settings');
    ed = { kind: 'logo', max: 1, imgs: s.logo_url ? [s.logo_url] : [] };
    const F = (n, label, type = 'text', extra = '') => `<label class="field"><span>${t(label)}</span><input class="input" name="${n}" type="${type}" ${extra} value="${esc(s[n] ?? '')}"></label>`;
    c.innerHTML = `<form class="form card" data-form="se-save" style="max-width:720px"><div class="grid-2">${F('name', 'se.name', 'text', 'required maxlength="40"')}${F('tagline', 'se.tagline', 'text', 'maxlength="120"')}${F('phone', 'se.phone', 'text', 'dir="ltr"')}${F('whatsapp', 'se.whatsapp', 'text', 'dir="ltr" placeholder="2010xxxxxxxx"')}${F('order_whatsapp', 'se.orderWhatsapp', 'text', 'dir="ltr" placeholder="2010xxxxxxxx" required')}${F('email', 'se.email', 'email', 'dir="ltr"')}${F('address', 'se.address', 'text', 'maxlength="200"')}</div>
      ${F('announcement', 'se.announcement', 'text', 'maxlength="160"')}
      <h4 class="sub-h">${t('se.supportH')}</h4>
      <div class="grid-2">${F('delivery_estimate', 'se.delivery', 'text', 'maxlength="80"')}${F('support_hours', 'se.hours', 'text', 'maxlength="120"')}</div>
      <label class="field"><span>${t('se.returns')}</span><textarea class="textarea" name="return_policy" maxlength="800" rows="3">${esc(s.return_policy || '')}</textarea></label>
      <label class="field"><span>${t('se.shipping')}</span><textarea class="textarea" name="shipping_policy" maxlength="800" rows="2">${esc(s.shipping_policy || '')}</textarea></label>
      <label class="field"><span>${t('se.color')}</span><input type="color" name="brand_color" value="${esc(s.brand_color || '#0f6b5c')}" style="height:46px;width:100px;padding:2px;border-radius:10px;border:1px solid var(--line)"></label>
      <h4 class="sub-h">${t('se.logo')}</h4><div id="upBox">${upHTML()}</div>
      <h4 class="sub-h">${t('se.pay')}</h4>
      <label class="check"><input type="checkbox" name="wallet_enabled" ${s.wallet_enabled ? 'checked' : ''}> <span>${t('se.walletOn')}</span></label>
      <label class="field"><span>${t('se.walletNote')}</span><textarea class="textarea" name="wallet_note" maxlength="400" rows="2">${esc(s.wallet_note || '')}</textarea></label>
      <p class="form-note">${t('se.hint')}</p><p class="form-error hidden" role="alert"></p><button class="btn btn-primary" type="submit">${t('save')}</button></form>`;
  }
  B.forms['se-save'] = async (f) => {
    const err = $('.form-error', f); err.classList.add('hidden');
    try { await B.busy($('button[type=submit]', f), () => B.api('/api/admin/settings', { method: 'PUT', body: { ...B.readForm(f), logo_url: ed.imgs[0] || '' } })); B.toast(t('ad.saved'), { type: 'ok' }); B.api('/api/config').then((c) => { B.state.config = { ...B.state.config, ...c }; B.paintSite(); }); }
    catch (e) { err.textContent = B.errMsg(e); err.classList.remove('hidden'); }
  };

  async function audit(c) {
    const { items } = await B.api('/api/admin/audit');
    c.innerHTML = table([t('ad.col.date'), t('ad.col.email'), t('ad.col.action'), t('ad.col.entity'), 'ID', t('ad.col.ip')], items.map((a) => `<tr class="${/FAILED|LOCK|DISABLED/.test(a.action) ? '' : ''}"><td>${dateFmt(a.created_at, true)}</td><td dir="ltr" style="text-align:start">${esc(a.email || '—')}</td><td>${/FAILED/.test(a.action) ? `<b class="bad">${esc(a.action)}</b>` : esc(a.action)}</td><td>${esc(a.entity || '')}</td><td>${esc(a.entity_id || '')}</td><td dir="ltr" style="text-align:start">${esc((a.meta && a.meta.ip) || '')}</td></tr>`));
  }

  B.ready.then(async (state) => {
    if (!state.user) return loginView();
    if (state.user.role !== 'admin') return forbiddenView(state.user);
    try {
      const security = await B.api('/api/passkeys/status');
      if (security.required && state.user.auth_method !== 'passkey') {
        root.innerHTML = `<div class="container"><div class="auth-wrap"><div class="auth-card center"><span class="eyebrow">SECURE ADMIN ACCESS</span><h1>تأكيد هوية الأدمن</h1><p class="muted">لوحة التحكم محمية ببصمة الجهاز. استخدم Fingerprint أو Face ID أو Windows Hello للدخول.</p><button id="passkeyLogin" class="btn btn-primary btn-lg" type="button">🔐 الدخول بالبصمة / Face ID</button><p class="muted small" style="margin-top:12px">Admin ID: <b dir="ltr">${esc(state.user.admin_id || '—')}</b></p></div></div></div>`;
        return;
      }
    } catch {}
    shell();
  });
})();
