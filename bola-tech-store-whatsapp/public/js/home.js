(() => {
  const B = window.Bola;
  const { t, $, icon, money, esc } = B;
  B.extend({
    ar: {
      'home.h1': 'كل اللي محتاجه في مكان واحد', 'home.sub': 'إلكترونيات وسيارات وألعاب ومستلزمات مدرسية وأكتر — أسعار واضحة، وطلب سهل، والدفع عند الاستلام.',
      'home.search': 'ابحث عن أي منتج...', 'home.go': 'بحث', 'home.ship': 'شحن مجاني للمنتجات فوق {n}', 'home.cod': 'الدفع عند الاستلام', 'home.secure': 'حساب محمي بتحقق إضافي',
      'home.deals': 'عروض وخصومات', 'home.dealsSub': 'أعلى الخصومات دلوقتي.', 'home.best': 'الأكثر مبيعًا', 'home.bestSub': 'اللي الناس بتشتريه أكتر.', 'home.recent': 'شاهدت مؤخرًا', 'home.featured': 'منتجات مختارة', 'home.featuredSub': 'من كل الأقسام.', 'home.all': 'عرض الكل', 'home.inDept': 'أحدث في {dept}',
      'home.services': 'خدماتنا', 'home.servicesSub': 'تصميم وتطوير واستشارات.', 'home.tiles': 'تسوّق حسب القسم', 'home.items': '{n} عنصر',
      'home.w1t': 'سلة واحدة', 'home.w1': 'اطلب منتجات وخدمات معًا في طلب واحد.', 'home.w2t': 'تابع طلبك', 'home.w2': 'شوف حالة كل طلب خطوة بخطوة من حسابك، وألغِه قبل التأكيد.', 'home.w3t': 'اسأل المساعد', 'home.w3': 'اكتب ميزانيتك أو اللي بتدور عليه وهيرشحلك من الكتالوج.',
      'home.ctaT': 'جاهز تبدأ؟', 'home.ctaP': 'أنشئ حسابك مجانًا وتابع طلباتك ومفضلتك من أي جهاز.', 'home.ctaB': 'إنشاء حساب', 'home.empty': 'لا توجد منتجات حالياً.'
    },
    en: {
      'home.h1': 'Everything you need, in one place', 'home.sub': 'Electronics, cars, games, school supplies and more — clear prices, easy ordering, cash on delivery.',
      'home.search': 'Search any product...', 'home.go': 'Search', 'home.ship': 'Free shipping on products over {n}', 'home.cod': 'Cash on delivery', 'home.secure': 'Accounts protected with extra verification',
      'home.deals': 'Deals & discounts', 'home.dealsSub': 'The biggest discounts right now.', 'home.best': 'Best sellers', 'home.bestSub': 'What people buy the most.', 'home.recent': 'Recently viewed', 'home.featured': 'Featured products', 'home.featuredSub': 'From every department.', 'home.all': 'View all', 'home.inDept': 'New in {dept}',
      'home.services': 'Our services', 'home.servicesSub': 'Design, development and consulting.', 'home.tiles': 'Shop by department', 'home.items': '{n} items',
      'home.w1t': 'One cart', 'home.w1': 'Order products and services together, in one order.', 'home.w2t': 'Track your order', 'home.w2': 'Follow each order step by step from your account, and cancel before it is confirmed.', 'home.w3t': 'Ask the assistant', 'home.w3': 'Type your budget or what you are looking for and it recommends from the catalog.',
      'home.ctaT': 'Ready to start?', 'home.ctaP': 'Create a free account and follow your orders and wishlist from any device.', 'home.ctaB': 'Create account', 'home.empty': 'No products yet.'
    }
  });

  const main = $('#main');
  const sk = (n) => Array.from({ length: n }, () => '<div class="skeleton card-sk"></div>').join('');
  main.innerHTML = `<div class="container">
    <div id="sliderBox"></div>
    <section class="hero"><div><span class="eyebrow" id="heroEyebrow"></span><h1 id="heroTitle">${t('home.h1')}</h1><p>${t('home.sub')}</p>
      <form class="hero-search" action="/store.html" method="get" role="search"><input class="input" type="search" name="q" placeholder="${t('home.search')}" aria-label="${t('home.search')}"><button class="btn btn-primary" type="submit">${icon('search', 18)}<span>${t('home.go')}</span></button></form></div>
      <div class="dept-tiles" id="tiles" aria-label="${t('home.tiles')}"></div></section>
    <section class="section" style="padding-top:8px"><div class="trust">
      <div>${icon('truck')}<div><b id="heroShip"></b></div></div><div>${icon('cash')}<div><b>${t('home.cod')}</b></div></div><div>${icon('shield')}<div><b>${t('home.secure')}</b></div></div></div></section>
    <section class="section hidden" id="dealsSec"><div class="section-head"><div><h2>${t('home.deals')}</h2><p class="muted">${t('home.dealsSub')}</p></div><a class="btn" href="/store.html?deals=1&sort=discount">${t('home.all')}</a></div><div class="grid" id="deals"></div></section>
    <section class="section hidden" id="bestSec"><div class="section-head"><div><h2>${t('home.best')}</h2><p class="muted">${t('home.bestSub')}</p></div><a class="btn" href="/store.html?sort=sold">${t('home.all')}</a></div><div class="grid" id="best"></div></section>
    <section class="section"><div class="section-head"><div><h2>${t('home.featured')}</h2><p class="muted">${t('home.featuredSub')}</p></div><a class="btn" href="/store.html">${t('home.all')}</a></div><div class="grid" id="featured">${sk(4)}</div></section>
    <section class="section hidden" id="recentSec"><div class="section-head"><h2>${t('home.recent')}</h2></div><div class="grid" id="recent"></div></section>
    <div id="deptRows"></div>
    <section class="section" id="svcSec"><div class="section-head"><div><h2>${t('home.services')}</h2><p class="muted">${t('home.servicesSub')}</p></div><a class="btn" href="/services.html">${t('home.all')}</a></div><div class="grid" id="svc">${sk(3)}</div></section>
    <section class="section"><div class="why">
      <div class="card">${icon('cart', 30)}<h3>${t('home.w1t')}</h3><p class="muted">${t('home.w1')}</p></div>
      <div class="card">${icon('box', 30)}<h3>${t('home.w2t')}</h3><p class="muted">${t('home.w2')}</p></div>
      <div class="card">${icon('spark', 30)}<h3>${t('home.w3t')}</h3><p class="muted">${t('home.w3')}</p></div></div></section>
    <section class="cta" id="cta"><h2>${t('home.ctaT')}</h2><p>${t('home.ctaP')}</p><a class="btn btn-lg" href="/account.html">${t('home.ctaB')}</a></section></div>`;

  B.ready.then(async (state) => {
    const site = state.config.site || {};
    $('#sliderBox').innerHTML = B.slider(state.config.banners); B.startSlides();
    $('#heroShip').textContent = t('home.ship', { n: money(state.config.free_shipping_threshold) });
    $('#heroEyebrow').textContent = site.name || '';
    if (site.tagline) $('#heroTitle').textContent = site.tagline;
    if (state.user) $('#cta').classList.add('hidden');
    const depts = state.config.departments || [];
    try {
      const { products, services } = await B.api('/api/catalog');
      const count = (id) => products.filter((p) => p.department_id === id).length;
      $('#tiles').innerHTML = depts.map((d) => `<a class="dept-tile" href="/store.html?dept=${esc(d.slug)}"><span class="dept-ic">${icon(d.icon, 24)}</span><b>${esc(B.deptName(d))}</b><span class="d">${t('home.items', { n: count(d.id) })}${d.purchase_mode === 'inquiry' ? ` · <span class="mode">${t('dept.ask')}</span>` : ''}</span></a>`).join('');
      const deals = products.filter((p) => B.discountPct(p) > 0 && p.stock > 0).sort((a, b) => B.discountPct(b) - B.discountPct(a)).slice(0, 4);
      if (deals.length) { $('#deals').innerHTML = deals.map(B.productCard).join(''); $('#dealsSec').classList.remove('hidden'); }
      const best = products.filter((p) => (p.sold || 0) > 0).sort((a, b) => b.sold - a.sold).slice(0, 4);
      if (best.length) { $('#best').innerHTML = best.map(B.productCard).join(''); $('#bestSec').classList.remove('hidden'); }
      const rec = B.recentIds().map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 4);
      if (rec.length) { $('#recent').innerHTML = rec.map(B.productCard).join(''); $('#recentSec').classList.remove('hidden'); }
      const feat = products.filter((p) => p.featured);
      const list = (feat.length >= 4 ? feat : products).slice(0, 4);
      $('#featured').innerHTML = list.length ? list.map(B.productCard).join('') : `<div class="empty">${t('home.empty')}</div>`;
      $('#deptRows').innerHTML = depts.slice(0, 4).map((d) => {
        const rows = products.filter((p) => p.department_id === d.id).slice(0, 4);
        return rows.length ? `<section class="section"><div class="section-head"><h2>${t('home.inDept', { dept: esc(B.deptName(d)) })}</h2><a class="btn" href="/store.html?dept=${esc(d.slug)}">${t('home.all')}</a></div><div class="grid">${rows.map(B.productCard).join('')}</div></section>` : '';
      }).join('');
      if (!services.length) $('#svcSec').classList.add('hidden');
      else $('#svc').innerHTML = (services.filter((s) => s.featured).length >= 3 ? services.filter((s) => s.featured) : services).slice(0, 3).map(B.serviceCard).join('');
    } catch (e) {
      $('#featured').innerHTML = `<div class="empty"><p>${esc(B.errMsg(e))}</p><a class="btn" href="">${t('retry')}</a></div>`;
    }
  });
})();
