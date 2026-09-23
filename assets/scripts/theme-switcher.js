// Переключатель темы: одна кнопка, клик перебирает по кругу
//   системная → светлая → тёмная → системная …
// Иконка показывает текущий режим (sun-moon / sun / moon).
//
// ИКОНКИ НЕ ЗАШИТЫ ЗДЕСЬ. Они лежат отдельными SVG-файлами:
//   assets/icons/sun.svg, moon.svg, sun-moon.svg
// Внутри файлов задан stroke="currentColor" — иконка сама следует
// за цветом темы. Заменить иконку = перезаписать файл, код не трогать.
//
// Выбор хранится в localStorage и применяется на любой странице сайта.
(function () {
  'use strict';

  const KEY = 'theme';
  const ORDER = ['auto', 'light', 'dark'];

  const LABELS = {
    auto: 'Системная тема',
    light: 'Светлая тема',
    dark: 'Тёмная тема'
  };

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

    // Иконку НЕ трогаем — её показывает CSS по data-theme (custom.css).
    // Здесь только переключаем режим и обновляем подсказку.
    const btn = document.getElementById('theme-cycle');
    if (!btn) return;

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

    apply(stored());

    btn.addEventListener('click', function () {
      const nxt = nextOf(stored());
      localStorage.setItem(KEY, nxt);
      apply(nxt);
    });

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
