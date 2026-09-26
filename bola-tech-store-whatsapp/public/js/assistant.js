(() => {
  const B = window.Bola;
  const { t, $, esc, icon, money } = B;
  B.extend({
    ar: { 'as.title': 'المساعد', 'as.sub': 'اسأل عن أي منتج أو سعر أو قسم، أو اكتب ميزانيتك وهيرشحلك.', 'as.ph': 'اكتب سؤالك...', 'as.new': 'محادثة جديدة', 'as.hello': 'أهلاً! أنا مساعد {name} 👋 اسألني عن أي منتج أو أي سؤال عام.', 'as.note': 'مساعد آلي — راجع التفاصيل المهمة مع المتجر.', 'as.fail': 'حصلت مشكلة في الاتصال. جرّب تاني بعد لحظة.',
      'as.m.store': 'مساعد المتجر', 'as.m.general': 'عام', 'as.m.writer': 'كتابة', 'as.m.translator': 'ترجمة', 'as.m.coder': 'برمجة', 'as.m.teacher': 'شرح', 'as.m.summarizer': 'تلخيص', 'as.copy': 'نسخ' },
    en: { 'as.title': 'Assistant', 'as.sub': 'Ask about any product, price or department, or type your budget for recommendations.', 'as.ph': 'Type your question...', 'as.new': 'New chat', 'as.hello': 'Hi! I am the {name} assistant. Ask me about products, prices and departments.', 'as.note': 'Automated assistant — confirm important details with the store.', 'as.fail': 'Connection problem. Please try again in a moment.',
      'as.m.store': 'Store helper', 'as.m.general': 'General', 'as.m.writer': 'Writing', 'as.m.translator': 'Translate', 'as.m.coder': 'Code', 'as.m.teacher': 'Explain', 'as.m.summarizer': 'Summarize', 'as.copy': 'Copy' }
  });
  const KEY = 'bola_assistant_v1';
  const state = { mode: 'store', msgs: [] };
  try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d) { state.mode = d.mode || 'store'; state.msgs = (d.msgs || []).slice(-40); } } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

  const md = B.md;

  $('#main').innerHTML = `<div class="container"><div class="page-head row"><div><h1>${t('as.title')}</h1><p class="muted">${t('as.sub')}</p></div><button class="btn" data-action="as-new">${icon('plus', 16)} ${t('as.new')}</button></div>
    <div class="as-wrap"><div class="chips" id="asModes"></div><div class="as-thread" id="asThread" aria-live="polite"></div>
      <form class="chat-form as-form" data-form="as-send"><input id="asInput" class="input" maxlength="500" autocomplete="off" placeholder="${t('as.ph')}" aria-label="${t('as.ph')}"><button class="btn btn-primary icon-only" aria-label="send">${icon('send', 18)}</button></form>
      <p class="form-note" style="margin-top:8px">${t('as.note')}</p></div></div>`;

  const thread = $('#asThread');
  function drawModes() {
    const enabled = B.state.config.chat_advanced;
    const modes = enabled ? ['store', 'general', 'writer', 'translator', 'coder', 'teacher', 'summarizer'] : [];
    $('#asModes').innerHTML = modes.map((m) => `<button type="button" class="chip ${state.mode === m ? 'active' : ''}" data-action="as-mode" data-mode="${m}" aria-pressed="${state.mode === m}">${t('as.m.' + m)}</button>`).join('');
  }
  function draw() {
    const site = B.state.config.site || {};
    const hello = { role: 'assistant', content: t('as.hello', { name: site.name || '' }) };
    thread.innerHTML = [hello, ...state.msgs].map((m) => {
      if (m.role === 'user') return `<div class="msg me" dir="auto">${esc(m.content)}</div>`;
      const items = (m.items || []).map((x) => `<button type="button" class="res-item" data-action="res-item" data-kind="${esc(x.kind)}" data-id="${x.id}"><span><b>${esc(B.nameOf(x))}</b><small class="muted">${esc(x.category || '')}</small></span><span class="res-meta"><b>${money(x.price)}</b></span></button>`).join('');
      return `<div class="msg bot as-md" dir="auto">${md(m.content)}</div>${items ? `<div class="res-list">${items}</div>` : ''}`;
    }).join('');
    thread.scrollTop = thread.scrollHeight;
  }
  B.actions['as-mode'] = (el) => { state.mode = el.dataset.mode; save(); drawModes(); };
  B.actions['as-new'] = () => { state.msgs = []; save(); draw(); };
  B.forms['as-send'] = async () => {
    const input = $('#asInput'), text = input.value.trim(); if (!text) return;
    input.value = ''; state.msgs.push({ role: 'user', content: text }); draw();
    const typing = document.createElement('div'); typing.className = 'msg bot typing'; typing.textContent = '…'; thread.appendChild(typing); thread.scrollTop = thread.scrollHeight;
    const history = state.msgs.slice(0, -1).slice(-10).map((m) => ({ role: m.role, content: m.content }));
    try {
      const r = await B.api('/api/assistant/chat', { method: 'POST', body: { message: text, history, mode: state.mode } });
      state.msgs.push({ role: 'assistant', content: r.answer, items: r.items || [] });
    } catch (e) { state.msgs.push({ role: 'assistant', content: e.code === 'RATE_LIMITED' ? B.errMsg(e) : t('as.fail') }); }
    state.msgs = state.msgs.slice(-40); save(); draw();
  };
  B.ready.then(() => { drawModes(); draw(); });
})();
