// Runs before the page paints: applies language direction and theme so there is no flash.
(function () {
  try {
    var d = document.documentElement;
    var l = localStorage.getItem('bola_lang') === 'en' ? 'en' : 'ar';
    var t = localStorage.getItem('bola_theme');
    d.lang = l;
    d.dir = l === 'ar' ? 'rtl' : 'ltr';
    if (!t && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) t = 'dark';
    if (t) d.setAttribute('data-theme', t);
  } catch (e) {}
})();
