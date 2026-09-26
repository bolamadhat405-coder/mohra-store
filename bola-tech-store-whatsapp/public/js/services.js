(() => {
  const B = window.Bola;
  const { t, $, esc, icon, norm } = B;
  B.extend({
    ar: { 'svc.title': 'متجر الخدمات', 'svc.sub': 'خدمات تصميم وتطوير واستشارات — بنفس الحساب والسلة.', 'svc.search': 'ابحث عن خدمة...', 'svc.none': 'مفيش خدمات مطابقة.' },
    en: { 'svc.title': 'Services store', 'svc.sub': 'Design, development and consulting — same account, same cart.', 'svc.search': 'Search services...', 'svc.none': 'No matching services.' }
  });
  let all = [], cat = '', q = '';
  $('#main').innerHTML = `<div class="container"><div class="page-head"><span class="eyebrow">SERVICE STORE</span><h1>${t('svc.title')}</h1><p class="muted">${t('svc.sub')}</p></div>
    <div class="toolbar"><label class="search">${icon('search', 18)}<input id="q" class="input" type="search" placeholder="${t('svc.search')}" aria-label="${t('svc.search')}"></label></div>
    <div class="chips" id="chips"></div><div class="grid" id="grid">${Array.from({ length: 3 }, () => '<div class="skeleton card-sk"></div>').join('')}</div></div>`;
  function render() {
    const cats = [...new Set(all.map((s) => s.category).filter(Boolean))];
    $('#chips').innerHTML = [['', t('all')], ...cats.map((c) => [c, c])].map(([v, l]) => `<button type="button" class="chip ${cat === v ? 'active' : ''}" data-action="chip" data-cat="${esc(v)}" aria-pressed="${cat === v}">${esc(l)}</button>`).join('');
    const nq = norm(q);
    const a = all.filter((s) => (!cat || s.category === cat) && (!nq || norm(`${s.name_ar} ${s.name_en} ${s.category} ${s.description_ar} ${s.description_en}`).includes(nq)));
    $('#grid').innerHTML = a.length ? a.map(B.serviceCard).join('') : `<div class="empty" style="grid-column:1/-1"><h3>${t('svc.none')}</h3></div>`;
  }
  B.actions.chip = (el) => { cat = el.dataset.cat; render(); };
  $('#q').addEventListener('input', B.debounce((e) => { q = e.target.value; render(); }, 180));
  B.ready.then(async () => {
    try { all = (await B.api('/api/catalog')).services; render(); }
    catch (e) { $('#grid').innerHTML = `<div class="empty" style="grid-column:1/-1"><p>${esc(B.errMsg(e))}</p><a class="btn" href="">${t('retry')}</a></div>`; }
  });
})();
