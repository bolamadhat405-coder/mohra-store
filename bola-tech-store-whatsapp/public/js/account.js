(() => {
  const B = window.Bola;
  const { t, $, $$, esc, icon, money, dateFmt, nameOf, titleOf } = B;
  B.extend({
    ar: {
      'acc.title': 'مركز الحساب', 'acc.login': 'تسجيل الدخول', 'acc.register': 'حساب جديد', 'acc.loginSub': 'ادخل لحسابك لمتابعة طلباتك وسلتك.', 'acc.registerSub': 'أنشئ حساب مجاني في أقل من دقيقة.',
      'acc.name': 'الاسم', 'acc.email': 'البريد الإلكتروني', 'acc.password': 'كلمة المرور', 'acc.passHint': '8 أحرف على الأقل', 'acc.show': 'إظهار', 'acc.hide': 'إخفاء', 'acc.continue': 'متابعة', 'acc.hello': 'أهلاً {name}', 'acc.logout': 'تسجيل الخروج',
      'tab.orders': 'طلباتي', 'tab.addresses': 'عناويني', 'tab.wishlist': 'المفضلة', 'tab.profile': 'الملف الشخصي',
      'ord.none': 'لسه معملتش أي طلب.', 'ord.no': 'طلب #{id}', 'ord.items': '{n} عنصر', 'ord.details': 'التفاصيل', 'ord.hide': 'إخفاء', 'ord.cancel': 'إلغاء الطلب', 'ord.cancelAsk': 'متأكد إنك عايز تلغي الطلب؟', 'ord.cancelled': 'تم إلغاء الطلب', 'ord.address': 'عنوان التوصيل', 'ord.notes': 'ملاحظاتك', 'ord.payment': 'الدفع', 'ord.shop': 'ابدأ التسوق',
      'addr.none': 'مفيش عناوين محفوظة.', 'addr.add': 'إضافة عنوان', 'addr.editT': 'تعديل العنوان', 'addr.addT': 'عنوان جديد', 'addr.deleteAsk': 'حذف العنوان ده؟', 'addr.saved': 'تم حفظ العنوان',
      'wish.none': 'قائمة المفضلة فاضية. اضغط على القلب في أي منتج لحفظه.',
      'tab.security': 'الأمان', 'acc.code': 'كود التحقق (6 أرقام) أو كود استرداد', 'acc.codeHint': 'حسابك محمي بالتحقق بخطوتين. افتح تطبيق المصادقة واكتب الكود.',
      'pw.s1': 'ضعيفة جدًا', 'pw.s2': 'متوسطة', 'pw.s3': 'جيدة', 'pw.s4': 'قوية',
      'sec.adminWarn': 'أنت مدير — فعّل التحقق بخطوتين لحماية المتجر بالكامل.', 'sec.2fa': 'التحقق بخطوتين', 'sec.2faOff': 'غير مفعّل. بيحمي حسابك حتى لو حد عرف كلمة المرور.', 'sec.2faOn': 'مفعّل ✓', 'sec.enable': 'تفعيل', 'sec.disable': 'إيقاف', 'sec.step1': '١) افتح تطبيق مصادقة (Google Authenticator / Microsoft Authenticator / Authy) واختار «إدخال مفتاح يدوي»، وأدخل المفتاح ده:', 'sec.openApp': 'فتح في تطبيق المصادقة', 'sec.step2': '٢) اكتب الكود المكوّن من 6 أرقام اللي بيظهر في التطبيق:', 'sec.confirm': 'تأكيد التفعيل', 'sec.recoveryT': 'أكواد الاسترداد', 'sec.recoveryP': 'احتفظ بيها في مكان آمن. كل كود يُستخدم مرة واحدة لو فقدت هاتفك. مش هتظهر تاني.', 'sec.copyAll': 'نسخ الأكواد', 'sec.done': 'تم الحفظ', 'sec.disableP': 'أدخل كلمة المرور وكود التحقق لإيقافه.', 'sec.sessions': 'الأجهزة المتصلة', 'sec.current': 'هذا الجهاز', 'sec.revoke': 'إنهاء', 'sec.revokeOthers': 'تسجيل الخروج من كل الأجهزة الأخرى', 'sec.revoked': 'تم تسجيل الخروج من الأجهزة الأخرى', 'sec.lastSeen': 'آخر نشاط',
      'prof.info': 'بياناتي', 'prof.saved': 'تم حفظ البيانات', 'prof.security': 'تغيير كلمة المرور', 'prof.current': 'كلمة المرور الحالية', 'prof.new': 'كلمة المرور الجديدة', 'prof.changed': 'تم تغيير كلمة المرور', 'prof.optional': 'اختياري'
    },
    en: {
      'acc.title': 'Account Center', 'acc.login': 'Log in', 'acc.register': 'Sign up', 'acc.loginSub': 'Log in to follow your orders and cart.', 'acc.registerSub': 'Create a free account in under a minute.',
      'acc.name': 'Name', 'acc.email': 'Email', 'acc.password': 'Password', 'acc.passHint': 'At least 8 characters', 'acc.show': 'Show', 'acc.hide': 'Hide', 'acc.continue': 'Continue', 'acc.hello': 'Hello {name}', 'acc.logout': 'Log out',
      'tab.orders': 'My orders', 'tab.addresses': 'Addresses', 'tab.wishlist': 'Wishlist', 'tab.profile': 'Profile',
      'ord.none': 'You have not placed any orders yet.', 'ord.no': 'Order #{id}', 'ord.items': '{n} items', 'ord.details': 'Details', 'ord.hide': 'Hide', 'ord.cancel': 'Cancel order', 'ord.cancelAsk': 'Are you sure you want to cancel this order?', 'ord.cancelled': 'Order cancelled', 'ord.address': 'Delivery address', 'ord.notes': 'Your notes', 'ord.payment': 'Payment', 'ord.shop': 'Start shopping',
      'addr.none': 'No saved addresses.', 'addr.add': 'Add address', 'addr.editT': 'Edit address', 'addr.addT': 'New address', 'addr.deleteAsk': 'Delete this address?', 'addr.saved': 'Address saved',
      'wish.none': 'Your wishlist is empty. Tap the heart on any product to save it.',
      'tab.security': 'Security', 'acc.code': 'Verification code (6 digits) or recovery code', 'acc.codeHint': 'Your account is protected with two-step verification. Open your authenticator app and enter the code.',
      'pw.s1': 'Very weak', 'pw.s2': 'Fair', 'pw.s3': 'Good', 'pw.s4': 'Strong',
      'sec.adminWarn': 'You are an administrator — enable two-step verification to protect the whole store.', 'sec.2fa': 'Two-step verification', 'sec.2faOff': 'Off. It protects your account even if someone learns your password.', 'sec.2faOn': 'On ✓', 'sec.enable': 'Enable', 'sec.disable': 'Turn off', 'sec.step1': '1) Open an authenticator app (Google Authenticator / Microsoft Authenticator / Authy), choose “Enter a setup key”, and type this key:', 'sec.openApp': 'Open in authenticator app', 'sec.step2': '2) Enter the 6-digit code shown in the app:', 'sec.confirm': 'Confirm', 'sec.recoveryT': 'Recovery codes', 'sec.recoveryP': 'Keep them somewhere safe. Each code works once if you lose your phone. They will not be shown again.', 'sec.copyAll': 'Copy codes', 'sec.done': 'I saved them', 'sec.disableP': 'Enter your password and a verification code to turn it off.', 'sec.sessions': 'Signed-in devices', 'sec.current': 'This device', 'sec.revoke': 'End', 'sec.revokeOthers': 'Sign out of all other devices', 'sec.revoked': 'Signed out of other devices', 'sec.lastSeen': 'Last active',
      'prof.info': 'My details', 'prof.saved': 'Details saved', 'prof.security': 'Change password', 'prof.current': 'Current password', 'prof.new': 'New password', 'prof.changed': 'Password changed', 'prof.optional': 'optional'
    }
  });
  const root = $('#main');
  const safeNext = () => { const n = new URLSearchParams(location.search).get('next'); return n && n.startsWith('/') && !n.startsWith('//') ? n : ''; };
  const pwField = (name, label, auto, meter = false) => `<label class="field"><span>${label}</span><span class="pw"><input class="input" type="password" name="${name}" required minlength="8" maxlength="72" autocomplete="${auto}"${meter ? ' data-meter="1"' : ''}><button type="button" data-action="pw-toggle">${t('acc.show')}</button></span>${meter ? '<span class="strength" aria-live="polite"><i></i></span><span class="form-note" data-strength-label></span>' : ''}</label>`;
  const strengthOf = (pw) => {
    if (!pw) return 0;
    const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9\u0600-\u06FF]/, /[\u0600-\u06FF]/].filter((r) => r.test(pw)).length;
    let sc = (pw.length >= 8 ? 1 : 0) + (pw.length >= 12 ? 1 : 0) + (classes >= 2 ? 1 : 0) + (classes >= 3 ? 1 : 0);
    if (pw.length < 8 || classes < 2) sc = Math.min(sc, 1);
    return Math.max(1, Math.min(4, sc));
  };
  document.addEventListener('input', (e) => {
    const inp = e.target.closest('input[data-meter]');
    if (!inp) return;
    const box = inp.closest('.field'), n = strengthOf(inp.value);
    $('.strength', box).className = 'strength' + (n ? ' s' + n : '');
    $('[data-strength-label]', box).textContent = n ? t('pw.s' + n) : '';
  });

  /* ───────── logged out ───────── */
  let mode = 'login';
  function renderAuth() {
    const reg = mode === 'register';
    root.innerHTML = `<div class="container"><div class="auth-wrap"><div class="auth-card">
      <h1>${t('acc.title')}</h1><p class="muted">${t(reg ? 'acc.registerSub' : 'acc.loginSub')}</p>
      <div class="tabs" role="tablist"><button type="button" role="tab" class="${reg ? '' : 'active'}" data-action="auth-mode" data-mode="login">${t('acc.login')}</button><button type="button" role="tab" class="${reg ? 'active' : ''}" data-action="auth-mode" data-mode="register">${t('acc.register')}</button></div>
      <form class="form" data-form="auth" novalidate>
        ${reg ? `<label class="field"><span>${t('acc.name')}</span><input class="input" name="name" required minlength="2" maxlength="80" autocomplete="name"></label><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">` : ''}
        <label class="field"><span>${t('acc.email')}</span><input class="input" type="email" name="email" required autocomplete="email" dir="ltr"></label>
        ${pwField('password', t('acc.password') + (reg ? ` (${t('acc.passHint')})` : ''), reg ? 'new-password' : 'current-password', reg)}
        ${reg ? '' : `<label class="field hidden" id="codeField"><span>${t('acc.code')}</span><input class="input" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="24" dir="ltr"></label>`}
        <p class="form-error hidden" id="authErr" role="alert"></p>
        <button class="btn btn-primary btn-lg" type="submit">${t('acc.continue')}</button></form></div></div></div>`;
  }
  B.actions['auth-mode'] = (el) => { mode = el.dataset.mode; renderAuth(); };
  B.actions['pw-toggle'] = (el) => { const i = el.previousElementSibling; const show = i.type === 'password'; i.type = show ? 'text' : 'password'; el.textContent = t(show ? 'acc.hide' : 'acc.show'); };
  B.forms.auth = async (f) => {
    const err = $('#authErr', f); err.classList.add('hidden');
    const v = B.readForm(f);
    if (!v.email || !v.password || (mode === 'register' && !v.name)) { err.textContent = t('err.GENERIC'); err.classList.remove('hidden'); return; }
    try {
      await B.busy($('button[type=submit]', f), () => B.api('/api/auth/' + mode, { method: 'POST', body: { ...v, locale: B.lang } }));
      location.href = safeNext() || '/account.html';
    } catch (e) {
      if (e.code === 'TOTP_REQUIRED') { const cf = $('#codeField', f); cf.classList.remove('hidden'); $('input', cf).focus(); err.textContent = t('acc.codeHint'); err.classList.remove('hidden'); return; }
      err.textContent = B.errMsg(e); err.classList.remove('hidden');
    }
  };

  /* ───────── logged in ───────── */
  let data, tab = ['orders', 'addresses', 'wishlist', 'profile', 'security'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'orders';
  const opened = new Map();

  function renderShell() {
    root.innerHTML = `<div class="container"><div class="page-head row"><div><span class="eyebrow">ACCOUNT CENTER</span><h1>${t('acc.hello', { name: esc(data.user.name.split(' ')[0]) })}</h1></div>
      <button class="btn" data-action="logout">${icon('logout', 18)} ${t('acc.logout')}</button></div>
      <div class="tabs" role="tablist">${['orders', 'addresses', 'wishlist', 'profile', 'security'].map((k) => `<button type="button" role="tab" class="${tab === k ? 'active' : ''}" data-action="tab" data-tab="${k}">${t('tab.' + k)}${k === 'wishlist' && data.wishlist.length ? ` (${data.wishlist.length})` : ''}</button>`).join('')}</div>
      <div id="tabBody"></div></div>`;
    renderTab();
  }
  B.actions.tab = (el) => { tab = el.dataset.tab; history.replaceState(null, '', '#' + tab); $$('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab)); renderTab(); };
  function renderTab() { ({ orders: renderOrders, addresses: renderAddresses, wishlist: renderWishlist, profile: renderProfile, security: renderSecurity })[tab](); }

  /* orders */
  const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  function renderOrders() {
    const body = $('#tabBody');
    if (!data.orders.length) { body.innerHTML = `<div class="empty">${icon('box', 44)}<h3>${t('ord.none')}</h3><a class="btn btn-primary" href="/store.html">${t('ord.shop')}</a></div>`; return; }
    body.innerHTML = data.orders.map((o) => {
      const idx = STEPS.indexOf(o.status);
      return `<div class="order" data-order="${o.id}"><div class="order-head"><div><b>${t('ord.no', { id: o.id })}</b> <span class="muted small">· ${dateFmt(o.created_at, true)} · ${t('ord.items', { n: o.items_count })}</span></div>
        <div class="row"><span class="pill ${o.status}">${t('st.' + o.status)}</span><b>${money(o.total)}</b><button class="btn btn-sm" data-action="order-toggle" data-id="${o.id}">${t('ord.details')}</button></div></div>
        ${o.status === 'cancelled' ? '' : `<div class="steps" aria-hidden="true">${STEPS.map((s, i) => `<span class="${i <= idx ? 'done' : ''}">${t('st.' + s)}</span>`).join('')}</div>`}
        <div class="order-detail hidden" id="od${o.id}"></div></div>`;
    }).join('');
    for (const id of opened.keys()) { const el = $('#od' + id); if (el) fillDetail(id, opened.get(id)); }
  }
  function fillDetail(id, d) {
    const el = $('#od' + id); if (!el) return;
    const o = d.order, a = o.address_json || {};
    const addr = [a.full_name, [a.street, a.building, a.area, a.city].filter(Boolean).join('، '), a.phone].filter(Boolean);
    el.classList.remove('hidden');
    el.innerHTML = `${d.items.map((i) => `<div class="oi"><div class="left">${B.imgTag({ image_url: i.image_url, name_ar: i.title, name_en: i.title_en, category: '' }, i.service_id ? 'service' : 'product')}<div><b>${esc(titleOf(i))}</b><div class="muted small">${i.quantity} × ${money(i.unit_price)}</div></div></div><b>${money(i.quantity * i.unit_price)}</b></div>`).join('')}
      <dl class="totals"><div><dt>${t('cart.subtotal')}</dt><dd>${money(o.subtotal)}</dd></div>${Number(o.discount) ? `<div class="disc"><dt>${t('cart.discount')}${o.coupon_code ? ` (${esc(o.coupon_code)})` : ''}</dt><dd>− ${money(o.discount)}</dd></div>` : ''}<div><dt>${t('cart.shipping')}</dt><dd>${o.shipping ? money(o.shipping) : t('card.free')}</dd></div><div class="grand"><dt>${t('cart.total')}</dt><dd>${money(o.total)}</dd></div></dl>
      <div class="two-col"><div><b>${t('ord.payment')}</b><div class="muted">${t('pay.' + o.payment_method)}${o.payment_ref ? ` · <span dir="ltr">${esc(o.payment_ref)}</span>` : ''} · <span class="pill ${o.payment_status}">${t('pay.' + o.payment_status)}</span></div></div>
      ${addr.length ? `<div><b>${t('ord.address')}</b><div class="muted">${addr.map(esc).join('<br>')}</div></div>` : ''}</div>
      ${o.notes ? `<div><b>${t('ord.notes')}</b><div class="muted">${esc(o.notes)}</div></div>` : ''}
      ${o.status === 'pending' ? `<div><button class="btn btn-danger btn-sm" data-action="order-cancel" data-id="${o.id}">${t('ord.cancel')}</button></div>` : ''}`;
  }
  B.actions['order-toggle'] = async (el) => {
    const id = el.dataset.id, box = $('#od' + id);
    if (!box.classList.contains('hidden')) { box.classList.add('hidden'); opened.delete(id); el.textContent = t('ord.details'); return; }
    try { const d = await B.busy(el, () => B.api('/api/orders/' + id)); opened.set(id, d); fillDetail(id, d); el.textContent = t('ord.hide'); }
    catch (e) { B.toast(B.errMsg(e), { type: 'err' }); }
  };
  B.actions['order-cancel'] = async (el) => {
    if (!confirm(t('ord.cancelAsk'))) return;
    try { await B.busy(el, () => B.api(`/api/orders/${el.dataset.id}/cancel`, { method: 'POST' })); B.toast(t('ord.cancelled'), { type: 'ok' }); opened.delete(el.dataset.id); await reload(); }
    catch (e) { B.toast(B.errMsg(e), { type: 'err' }); }
  };

  /* addresses */
  function renderAddresses() {
    $('#tabBody').innerHTML = `<div class="row" style="margin-bottom:14px"><span></span><button class="btn btn-primary" data-action="addr-add">${icon('plus', 16)} ${t('addr.add')}</button></div>` +
      (data.addresses.length ? `<div class="grid">${data.addresses.map((a) => `<div class="card addr-card"><div><b>${esc(a.full_name)}</b> ${a.is_default ? `<span class="tag">${t('addr.defaultTag')}</span>` : ''}${a.label ? `<div class="muted small">${esc(a.label)}</div>` : ''}<div class="muted">${esc([a.street, a.building, a.area, a.city].filter(Boolean).join('، '))}</div><div class="muted" dir="ltr" style="text-align:start">${esc(a.phone)}</div></div>
        <div class="row-actions"><button class="icon-btn sm" data-action="addr-edit" data-id="${a.id}" aria-label="${t('edit')}">${icon('edit', 16)}</button><button class="icon-btn sm" data-action="addr-delete" data-id="${a.id}" aria-label="${t('delete')}">${icon('trash', 16)}</button></div></div>`).join('')}</div>` : `<div class="empty">${icon('pin', 44)}<h3>${t('addr.none')}</h3></div>`);
  }
  function addrModal(a) {
    const m = B.openModal({ title: t(a ? 'addr.editT' : 'addr.addT'), html: `<form class="form" data-form="address" data-id="${a ? a.id : ''}">${B.addressFields(a || { is_default: !data.addresses.length })}<p class="form-error hidden" role="alert"></p><button class="btn btn-primary btn-lg" type="submit">${t('save')}</button></form>` });
    return m;
  }
  B.actions['addr-add'] = () => addrModal();
  B.actions['addr-edit'] = (el) => addrModal(data.addresses.find((x) => x.id === Number(el.dataset.id)));
  B.actions['addr-delete'] = async (el) => {
    if (!confirm(t('addr.deleteAsk'))) return;
    try { data.addresses = (await B.busy(el, () => B.api('/api/account/addresses/' + el.dataset.id, { method: 'DELETE' }))).addresses; renderAddresses(); }
    catch (e) { B.toast(B.errMsg(e), { type: 'err' }); }
  };
  B.forms.address = async (f) => {
    const err = $('.form-error', f); err.classList.add('hidden');
    const id = f.dataset.id;
    try {
      const r = await B.busy($('button[type=submit]', f), () => B.api('/api/account/addresses' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: B.readForm(f) }));
      data.addresses = r.addresses; f.closest('.modal')._close(); B.toast(t('addr.saved'), { type: 'ok' }); renderAddresses();
    } catch (e) { err.textContent = B.errMsg(e); err.classList.remove('hidden'); }
  };

  /* wishlist */
  function renderWishlist() {
    $('#tabBody').innerHTML = data.wishlist.length ? `<div class="grid">${data.wishlist.map(B.productCard).join('')}</div>` : `<div class="empty">${icon('heart', 44)}<h3>${t('tab.wishlist')}</h3><p>${t('wish.none')}</p><a class="btn btn-primary" href="/store.html">${t('ord.shop')}</a></div>`;
  }
  document.addEventListener('bola:wishlist', (e) => {
    if (e.detail.on) return;
    data.wishlist = data.wishlist.filter((p) => p.id !== e.detail.id);
    if (tab === 'wishlist') renderShell();
  });

  /* profile */
  function renderProfile() {
    const u = data.user;
    $('#tabBody').innerHTML = `<div class="two-col"><div class="card"><h3>${t('prof.info')}</h3><form class="form" data-form="profile">
        <label class="field"><span>${t('acc.email')}</span><input class="input" value="${esc(u.email)}" disabled dir="ltr"></label>
        <label class="field"><span>${t('acc.name')}</span><input class="input" name="name" required minlength="2" maxlength="80" value="${esc(u.name)}"></label>
        <label class="field"><span>${t('addr.phone')} (${t('prof.optional')})</span><input class="input" name="phone" inputmode="tel" maxlength="20" value="${esc(u.phone || '')}" dir="ltr"></label>
        <p class="form-error hidden" role="alert"></p><button class="btn btn-primary" type="submit">${t('save')}</button></form></div>
      <div class="card"><h3>${t('prof.security')}</h3><form class="form" data-form="password">
        ${pwField('current', t('prof.current'), 'current-password')}${pwField('next', t('prof.new') + ` (${t('acc.passHint')})`, 'new-password', true)}
        <p class="form-error hidden" role="alert"></p><button class="btn btn-primary" type="submit">${t('save')}</button></form></div></div>`;
  }
  B.forms.profile = async (f) => {
    const err = $('.form-error', f); err.classList.add('hidden');
    try { const r = await B.busy($('button[type=submit]', f), () => B.api('/api/account/profile', { method: 'PATCH', body: B.readForm(f) })); data.user = r.user; B.state.user = r.user; B.paintHeaderState(); B.toast(t('prof.saved'), { type: 'ok' }); }
    catch (e) { err.textContent = B.errMsg(e); err.classList.remove('hidden'); }
  };
  B.forms.password = async (f) => {
    const err = $('.form-error', f); err.classList.add('hidden');
    try { await B.busy($('button[type=submit]', f), () => B.api('/api/account/password', { method: 'POST', body: B.readForm(f) })); f.reset(); B.toast(t('prof.changed'), { type: 'ok' }); }
    catch (e) { err.textContent = B.errMsg(e); err.classList.remove('hidden'); }
  };

  // Footer / header links like /account.html#wishlist must also work while already on this page.
  window.addEventListener('hashchange', () => {
    const h = location.hash.slice(1);
    if (data && ['orders', 'addresses', 'wishlist', 'profile', 'security'].includes(h) && h !== tab) { tab = h; renderShell(); }
  });
  /* security: two-step verification + signed-in devices */
  const uaShort = (ua) => { ua = String(ua || ''); const b = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser'; const o = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : ''; return `${b}${o ? ' · ' + o : ''}`; };
  async function renderSecurity() {
    const body = $('#tabBody'), u = data.user;
    body.innerHTML = `${u.role === 'admin' && !u.totp_enabled ? `<div class="notice err" style="margin-bottom:14px">${t('sec.adminWarn')}</div>` : ''}
      <div class="sec-card" id="tfaCard"></div><div class="sec-card"><h3>${t('sec.sessions')}</h3><div id="sessList"><div class="skeleton"></div></div></div>`;
    drawTfa();
    try { const { items } = await B.api('/api/account/sessions'); drawSessions(items); } catch (e) { $('#sessList').textContent = B.errMsg(e); }
  }
  function drawTfa(extra = '') {
    const u = data.user, box = $('#tfaCard'); if (!box) return;
    box.innerHTML = `<div class="row"><h3 style="margin:0">${t('sec.2fa')}</h3><span class="pill ${u.totp_enabled ? 'delivered' : ''}">${u.totp_enabled ? t('sec.2faOn') : ''}</span></div>` + (extra || (u.totp_enabled
      ? `<p class="muted">${t('sec.disableP')}</p><form class="form" data-form="tfa-disable">${pwField('password', t('acc.password'), 'current-password')}<label class="field"><span>${t('acc.code')}</span><input class="input" name="code" inputmode="numeric" required maxlength="8" dir="ltr"></label><p class="form-error hidden" role="alert"></p><button class="btn btn-danger" type="submit">${t('sec.disable')}</button></form>`
      : `<p class="muted">${t('sec.2faOff')}</p><button class="btn btn-primary" data-action="tfa-setup">${t('sec.enable')}</button>`));
  }
  B.actions['tfa-setup'] = async (el) => {
    try {
      const r = await B.busy(el, () => B.api('/api/account/2fa/setup', { method: 'POST' }));
      drawTfa(`<p>${t('sec.step1')}</p><div class="secret-box">${esc(r.secret.match(/.{1,4}/g).join(' '))}</div><p><a class="btn btn-sm" href="${esc(r.uri)}">${t('sec.openApp')}</a></p>
        <p>${t('sec.step2')}</p><form class="form" data-form="tfa-enable"><input class="input" name="code" inputmode="numeric" required maxlength="6" minlength="6" dir="ltr" autocomplete="one-time-code"><p class="form-error hidden" role="alert"></p><button class="btn btn-primary" type="submit">${t('sec.confirm')}</button></form>`);
    } catch (e) { B.toast(B.errMsg(e), { type: 'err' }); }
  };
  B.forms['tfa-enable'] = async (f) => {
    const err = $('.form-error', f); err.classList.add('hidden');
    try {
      const r = await B.busy($('button', f), () => B.api('/api/account/2fa/enable', { method: 'POST', body: B.readForm(f) }));
      data.user.totp_enabled = true; B.state.user.totp_enabled = true;
      drawTfa(`<h4>${t('sec.recoveryT')}</h4><p class="muted">${t('sec.recoveryP')}</p><div class="codes-grid">${r.recovery_codes.map((c) => `<code>${esc(c)}</code>`).join('')}</div>
        <div class="row" style="margin-top:12px"><button class="btn" data-action="copy-codes" data-codes="${esc(r.recovery_codes.join('\n'))}">${t('sec.copyAll')}</button><button class="btn btn-primary" data-action="tfa-done">${t('sec.done')}</button></div>`);
    } catch (e) { err.textContent = B.errMsg(e); err.classList.remove('hidden'); }
  };
  B.actions['copy-codes'] = async (el) => { try { await navigator.clipboard.writeText(el.dataset.codes); B.toast(t('sec.copyAll') + ' ✓', { type: 'ok' }); } catch {} };
  B.actions['tfa-done'] = () => renderSecurity();
  B.forms['tfa-disable'] = async (f) => {
    const err = $('.form-error', f); err.classList.add('hidden');
    try { await B.busy($('button', f), () => B.api('/api/account/2fa/disable', { method: 'POST', body: B.readForm(f) })); data.user.totp_enabled = false; B.state.user.totp_enabled = false; renderSecurity(); }
    catch (e) { err.textContent = B.errMsg(e); err.classList.remove('hidden'); }
  };
  function drawSessions(items) {
    $('#sessList').innerHTML = items.map((x) => `<div class="session-row"><div><b>${esc(uaShort(x.user_agent))}</b> ${x.current ? `<span class="tag">${t('sec.current')}</span>` : ''}<div class="muted small" dir="ltr" style="text-align:start">${esc(x.ip || '')} · ${t('sec.lastSeen')} ${B.dateFmt(x.last_seen, true)}</div></div>${x.current ? '' : `<button class="btn btn-sm" data-action="sess-end" data-id="${esc(x.id)}">${t('sec.revoke')}</button>`}</div>`).join('') +
      (items.length > 1 ? `<div style="margin-top:12px"><button class="btn btn-danger btn-sm" data-action="sess-others">${t('sec.revokeOthers')}</button></div>` : '');
  }
  B.actions['sess-end'] = async (el) => { try { await B.busy(el, () => B.api('/api/account/sessions/' + el.dataset.id, { method: 'DELETE' })); renderSecurity(); } catch (e) { B.toast(B.errMsg(e), { type: 'err' }); } };
  B.actions['sess-others'] = async (el) => { try { await B.busy(el, () => B.api('/api/account/sessions/revoke-others', { method: 'POST' })); B.toast(t('sec.revoked'), { type: 'ok' }); renderSecurity(); } catch (e) { B.toast(B.errMsg(e), { type: 'err' }); } };

  async function reload() { data = await B.api('/api/account'); renderShell(); }
  B.ready.then(async (state) => {
    if (!state.user) return renderAuth();
    root.innerHTML = `<div class="container section"><div class="skeleton"></div></div>`;
    try { await reload(); } catch (e) { root.innerHTML = `<div class="container"><div class="empty"><p>${esc(B.errMsg(e))}</p><a class="btn" href="">${t('retry')}</a></div></div>`; }
  });
})();
