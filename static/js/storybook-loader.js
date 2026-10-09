/* Загрузчик движка читалки. Обычная страница — грузит движок и читалку.
   ?nojs — не грузит, книга стоит лентой (для отладки CSS без JS).
   Глобальный флаг window.__NOJS__ ставит head на всех страницах. */
(function () {
  'use strict';
  if (window.__NOJS__) return;
  var base = document.currentScript.src.replace(/storybook-loader\.js.*$/, '');
  var flip = document.createElement('script');
  flip.src = base + 'page-flip.browser.js';
  flip.onload = function () {
    var app = document.createElement('script');
    app.src = base + 'storybook.js';
    document.body.appendChild(app);
  };
  document.body.appendChild(flip);
})();
