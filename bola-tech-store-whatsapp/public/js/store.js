(() => {
  const B = window.Bola;
  const { t, $, esc, icon, norm } = B;
  B.extend({
    ar: { 'store.title': 'المتجر', 'store.sub': 'كل المنتجات بأسعار ومخزون لحظي.', 'store.search': 'ابحث في النتائج...', 'store.sort.featured': 'الأنسب', 'store.sort.new': 'الأحدث', 'store.sort.low': 'السعر: الأقل', 'store.sort.high': 'السعر: الأعلى', 'store.sort.discount': 'أعلى خصم', 'store.sort.rating': 'الأعلى تقييمًا', 'store.sort.sold': 'الأكثر مبيعًا', 'store.inStock': 'المتاح فقط', 'store.count': '{n} منتج', 'store.none': 'مفيش نتائج مطابقة.', 'store.clear': 'مسح الفلاتر', 'store.more': 'عرض المزيد', 'store.any': 'الكل',
      'sf.filter': 'تصفية النتائج', 'sf.depts': 'الأقسام', 'sf.price': 'السعر', 'sf.min': 'من', 'sf.max': 'إلى', 'sf.rating': 'التقييم', 'sf.rAny': 'أي تقييم', 'sf.r4': '4 نجوم فأكثر', 'sf.r3': '3 نجوم فأكثر', 'sf.deals': 'عروض وخصومات فقط', 'sf.avail': 'التوفر', 'sf.apply': 'تطبيق' },
    en: { 'store.title': 'Store', 'store.sub': 'All products with live prices and stock.', 'store.search': 'Search within results...', 'store.sort.featured': 'Featured', 'store.sort.new': 'Newest', 'store.sort.low': 'Price: low to high', 'store.sort.high': 'Price: high to low', 'store.sort.discount': 'Biggest discount', 'store.sort.rating': 'Top rated', 'store.sort.sold': 'Best sellers', 'store.inStock': 'In stock only', 'store.count': '{n} products', 'store.none': 'No matching products.', 'store.clear': 'Clear filters', 'store.more': 'Show more', 'store.any': 'All',
      'sf.filter': 'Filter results', 'sf.depts': 'Departments', 'sf.price': 'Price', 'sf.min': 'From', 'sf.max': 'To', 'sf.rating': 'Rating', 'sf.rAny': 'Any rating', 'sf.r4': '4 stars & up', 'sf.r3': '3 stars & up', 'sf.deals': 'Deals & discounts only', 'sf.avail': 'Availability', 'sf.apply': 'Apply' }
  });
  const PAGE = 12;
  let all = [], shown = PAGE;
  const url = new URL(location.href), sp = url.searchParams;
  const f = { q: sp.get('q') || '', cat: sp.get('cat') || '', dept: sp.get('dept') || '', sort: sp.get('sort') || 'featured', stock: sp.get('stock') === '1', deals: sp.get('deals') === '1', min: sp.get('min') || '', max: sp.get('max') || '', rating: sp.get('rating') || '', attrs: {} };
  for (const [k, v] of sp) if (k.startsWith('a_') && v) f.attrs[k.slice(2)] = v;
  const depts = () => B.state.config.departments || [];
  const curDept = () => depts().find((d) => d.slug === f.dept);

  $('#main').innerHTML = `<div class="container"><div class="page-head"><h1 id="pgTitle">${t('store.title')}</h1><p class="muted" id="pgSub">${t('store.sub')}</p></div>
    <div class="store-layout"><details class="side" id="side" open><summary>${icon('search', 16)} ${t('sf.filter')}</summary><div id="sideBody"></div></details>
    <div><div class="toolbar" style="margin-top:0"><label class="search">${icon('search', 18)}<input id="q" class="input" type="search" placeholder="${t('store.search')}" aria-label="${t('store.search')}" value="${esc(f.q)}"></label>
      <select id="sort" class="select" aria-label="Sort">${['featured', 'new', 'low', 'high', 'discount', 'rating', 'sold'].map((k) => `<option value="${k}" ${f.sort === k ? 'selected' : ''}>${t('store.sort.' + k)}</option>`).join('')}</select></div>
    <div class="chips" id="chips" role="group"></div><p class="result-count" id="count"></p>
    <div class="grid" id="grid">${Array.from({ length: 8 }, () => '<div class="skeleton card-sk"></div>').join('')}</div>
    <div class="more"><button class="btn hidden" id="more" data-action="more">${t('store.more')}</button></div></div></div></div>`;
  if (matchMedia('(max-width:960px)').matches) $('#side').removeAttribute('open');

  function sync() {
    const u = new URL(location.href);
    const set = (k, v) => (v ? u.searchParams.set(k, v) : u.searchParams.delete(k));
    set('q', f.q); set('cat', f.cat); set('dept', f.dept); set('sort', f.sort === 'featured' ? '' : f.sort); set('stock', f.stock ? '1' : ''); set('deals', f.deals ? '1' : ''); set('min', f.min); set('max', f.max); set('rating', f.rating);
    for (const k of [...u.searchParams.keys()]) if (k.startsWith('a_')) u.searchParams.delete(k);
    for (const [k, v] of Object.entries(f.attrs)) if (v) u.searchParams.set('a_' + k, v);
    history.replaceState(null, '', u.pathname + u.search + u.hash);
  }
  const inDept = () => { const d = curDept(); return d ? all.filter((p) => p.department_id === d.id) : all; };
  function head() {
    const d = curDept();
    $('#pgTitle').textContent = d ? B.deptName(d) : f.q ? `“${f.q}”` : t('store.title');
    $('#pgSub').textContent = d ? (B.lang === 'ar' ? d.description_ar : d.description_en) || '' : t('store.sub');
  }
  function chips() {
    const cats = [...new Set(inDept().map((p) => p.category).filter(Boolean))];
    $('#chips').innerHTML = cats.length > 1 ? [['', t('all')], ...cats.map((c) => [c, c])].map(([v, l]) => `<button type="button" class="chip ${f.cat === v ? 'active' : ''}" data-action="chip" data-cat="${esc(v)}" aria-pressed="${f.cat === v}">${esc(l)}</button>`).join('') : '';
  }
  // Amazon/Noon-style side filters. Department fields marked "filterable" become extra filters automatically.
  function side() {
    const d = curDept();
    const fields = d ? d.fields.filter((x) => x.filterable) : [];
    const count = (id) => all.filter((p) => p.department_id === id).length;
    $('#sideBody').innerHTML = `
      <div class="side-group side-list"><h4>${t('sf.depts')}</h4><a href="/store.html" ${!d ? 'aria-current="true"' : ''}><span>${t('dept.all')}</span><span class="muted">${all.length}</span></a>${depts().map((x) => `<a href="/store.html?dept=${esc(x.slug)}" ${d?.id === x.id ? 'aria-current="true"' : ''}><span>${esc(B.deptName(x))}</span><span class="muted">${count(x.id)}</span></a>`).join('')}</div>
      <div class="side-group"><h4>${t('sf.price')}</h4><div class="price-in"><input type="number" min="0" inputmode="numeric" id="pmin" placeholder="${t('sf.min')}" value="${esc(f.min)}" aria-label="${t('sf.min')}"><span>–</span><input type="number" min="0" inputmode="numeric" id="pmax" placeholder="${t('sf.max')}" value="${esc(f.max)}" aria-label="${t('sf.max')}"></div><button type="button" class="btn btn-sm" style="margin-top:8px" data-action="price-apply">${t('sf.apply')}</button></div>
      <div class="side-group"><h4>${t('sf.rating')}</h4><select class="select" id="rating"><option value="">${t('sf.rAny')}</option><option value="4" ${f.rating === '4' ? 'selected' : ''}>${t('sf.r4')}</option><option value="3" ${f.rating === '3' ? 'selected' : ''}>${t('sf.r3')}</option></select></div>
      <div class="side-group"><h4>${t('sf.avail')}</h4><label class="check"><input type="checkbox" id="stock" ${f.stock ? 'checked' : ''}> <span>${t('store.inStock')}</span></label><label class="check"><input type="checkbox" id="deals" ${f.deals ? 'checked' : ''}> <span>${t('sf.deals')}</span></label></div>
      ${fields.map((x) => { const opts = x.type === 'boolean' ? [['true', t('spec.yes')], ['false', t('spec.no')]] : (x.options || []).map((o) => [o.ar, B.optLabel(x, o.ar)]);
        return `<div class="side-group"><h4>${esc(B.fieldLabel(x))}</h4><select class="select" data-attr="${esc(x.key)}"><option value="">${t('store.any')}</option>${opts.map(([v, l]) => `<option value="${esc(v)}" ${String(f.attrs[x.key]) === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`; }).join('')}
      <div class="side-group"><button type="button" class="btn btn-sm btn-block" data-action="clear">${t('store.clear')}</button></div>`;
  }
  function filtered() {
    const q = norm(f.q), d = curDept(), min = Number(f.min) || 0, max = Number(f.max) || Infinity, rt = Number(f.rating) || 0;
    let a = all.filter((p) => (!d || p.department_id === d.id) && (!f.cat || p.category === f.cat) && (!f.stock || p.stock > 0) && (!f.deals || B.discountPct(p) > 0) &&
      p.price >= min && p.price <= max && (!rt || p.rating >= rt) &&
      Object.entries(f.attrs).every(([k, v]) => !v || String(p.attributes?.[k]) === v) &&
      (!q || norm(`${p.name_ar} ${p.name_en} ${p.category} ${p.description_ar} ${p.description_en} ${Object.values(p.attributes || {}).join(' ')}`).includes(q)));
    const by = { low: (x, y) => x.price - y.price, high: (x, y) => y.price - x.price, discount: (x, y) => B.discountPct(y) - B.discountPct(x), rating: (x, y) => y.rating - x.rating || y.review_count - x.review_count, new: (x, y) => y.id - x.id, sold: (x, y) => (y.sold || 0) - (x.sold || 0) }[f.sort];
    if (by) a = [...a].sort(by);
    return a;
  }
  function render() {
    const a = filtered();
    $('#count').textContent = t('store.count', { n: a.length });
    $('#grid').innerHTML = a.length ? a.slice(0, shown).map(B.productCard).join('') : `<div class="empty" style="grid-column:1/-1">${icon('search', 40)}<h3>${t('store.none')}</h3><button class="btn" data-action="clear">${t('store.clear')}</button></div>`;
    $('#more').classList.toggle('hidden', a.length <= shown);
    head(); chips(); sync();
  }
  B.actions.chip = (el) => { f.cat = el.dataset.cat; shown = PAGE; render(); };
  B.actions.more = () => { shown += PAGE; render(); };
  B.actions.clear = () => { Object.assign(f, { q: '', cat: '', stock: false, deals: false, min: '', max: '', rating: '', sort: 'featured', attrs: {} }); $('#q').value = ''; $('#sort').value = 'featured'; shown = PAGE; side(); render(); };
  B.actions['price-apply'] = () => { f.min = $('#pmin').value; f.max = $('#pmax').value; shown = PAGE; render(); };
  $('#q').addEventListener('input', B.debounce((e) => { f.q = e.target.value; shown = PAGE; render(); }, 180));
  $('#sort').addEventListener('change', (e) => { f.sort = e.target.value; render(); });
  $('#side').addEventListener('change', (e) => {
    const el = e.target;
    if (el.id === 'stock') f.stock = el.checked; else if (el.id === 'deals') f.deals = el.checked; else if (el.id === 'rating') f.rating = el.value; else if (el.dataset.attr) f.attrs[el.dataset.attr] = el.value; else return;
    shown = PAGE; render();
  });
  $('#side').addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id?.startsWith('p')) B.actions['price-apply'](); });

  B.ready.then(async () => {
    try { all = (await B.api('/api/catalog')).products; side(); render(); }
    catch (e) { $('#grid').innerHTML = `<div class="empty" style="grid-column:1/-1"><p>${esc(B.errMsg(e))}</p><a class="btn" href="">${t('retry')}</a></div>`; }
  });
})();
