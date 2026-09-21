// Компенсатор верхней панели для фиксированных боковых меню темы.
//
// Тема крепит .book-menu-content / .book-toc-content к верху экрана
// (position: fixed; top: 0). Наша верхняя панель при этом перекрывается,
// поэтому в CSS они отодвинуты вниз на её высоту.
//
// Этот скрипт делает поведение плавным:
//   - панель видна на экране  → менюшки прижаты вплотную под ней
//   - панель уехала вверх при прокрутке → отступ снимается, менюшки
//     поднимаются к краю страницы (а не висят с дырой под пустым верхом)
// Высота панели замеряется на лету, ничего не зашито намертво.
(function () {
  'use strict';

  const SELECTOR = '.book-menu .book-menu-content, .book-toc .book-toc-content';

  function sync() {
    const topbar = document.querySelector('.topbar');
    const panels = document.querySelectorAll(SELECTOR);

    // Нет панели (например, на главной без неё) — менюшки к верху страницы
    if (!topbar) {
      panels.forEach(function (p) { p.classList.add('pinned-top'); });
      return;
    }

    // Нижний край панели относительно верха окна:
    // уехал за экран (отрицательный) — панель не видна.
    const bottom = topbar.getBoundingClientRect().bottom;
    panels.forEach(function (p) {
      p.classList.toggle('pinned-top', bottom < 0);
    });
  }

  function init() {
    if (!document.querySelector(SELECTOR)) return;

    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
