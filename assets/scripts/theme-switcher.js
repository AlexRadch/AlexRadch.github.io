// Переключатель темы: одна кнопка, клик перебирает по кругу
//   системная → светлая → тёмная → системная …
// Иконка показывает текущий режим (Lucide: sun-moon / sun / moon),
// рисуется currentColor и автоматически следует за цветом темы.
// Выбор хранится в localStorage и применяется на любой странице сайта.
(function () {
  'use strict';

  const KEY = 'theme';
  const ORDER = ['auto', 'light', 'dark'];

  // Контурные иконки Lucide v1.47.0 (lucide.dev, ISC)
  const SUN = '<circle cx="12" cy="12" r="4"/>' +
    '<path d="M12 2v2"/><path d="M12 20v2"/>' +
    '<path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>' +
    '<path d="M2 12h2"/><path d="M20 12h2"/>' +
    '<path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';

  const MOON = '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803' +
    'a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>';

  const SUN_MOON = '<path d="M12 2v2"/>' +
    '<path d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248' +
    'a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"/>' +
    '<path d="M16 12a4 4 0 0 0-4-4"/>' +
    '<path d="m19 5-1.256 1.256"/>' +
    '<path d="M20 12h2"/>';

  const ICONS = { auto: SUN_MOON, light: SUN, dark: MOON };
  const LABELS = {
    auto: 'Системная тема',
    light: 'Светлая тема',
    dark: 'Тёмная тема'
  };

  function svg(inner) {
    return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round">' + inner + '</svg>';
  }

  function systemPrefersDark() {
    return !!(window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  // Что фактически применится прямо сейчас (с учётом системного режима)
  function effective(mode) {
    return mode === 'auto'
      ? (systemPrefersDark() ? 'dark' : 'light')
      : mode;
  }

  function stored() {
    const t = localStorage.getItem(KEY);
    return ORDER.indexOf(t) >= 0 ? t : 'auto';
  }

  function nextOf(mode) {
    return ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  }

  function apply(mode) {
    document.documentElement.setAttribute('data-theme', mode);

    const btn = document.getElementById('theme-cycle');
    if (!btn) return;

    btn.hidden = false;
    btn.innerHTML = svg(ICONS[mode]);

    // Подсказка: текущий режим (+ что по факту у «авто») и что будет по клику
    const eff = effective(mode);
    btn.title = LABELS[mode] +
      (mode === 'auto' ? ' (сейчас: ' + (eff === 'dark' ? 'тёмная' : 'светлая') + ')' : '') +
      ' — клик: ' + LABELS[nextOf(mode)];
    btn.setAttribute('aria-label', LABELS[mode]);
  }

  function init() {
    const btn = document.getElementById('theme-cycle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      const nxt = nextOf(stored());
      localStorage.setItem(KEY, nxt);
      apply(nxt);
    });

    apply(stored());

    // Системная тема сменилась в процессе просмотра (перевели тёмный режим
    // в Windows) — перекрашиваемся, если стоим на «авто».
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (mq && typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', function () {
        if (stored() === 'auto') apply('auto');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
