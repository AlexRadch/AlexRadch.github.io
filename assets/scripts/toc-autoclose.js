// Автозакрытие правого оглавления на узком экране.
//
// Левое меню — ссылки на другие страницы: клик перезагружает страницу,
// чекбокс menu-control сбрасывается сам, меню «закрывается».
// Правое оглавление — якоря (#подраздел) на ТОЙ ЖЕ странице:
// перезагрузки нет, чекбокс toc-control остаётся включённым,
// меню висит открытым, пока не закроешь руками.
//
// Этот скрипт делает правое как левое: клик по ссылке в раскрытом
// оглавлении снимает галочку toc-control — меню закрывается само.
(function () {
  'use strict';

  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest
      ? e.target.closest('.book-header aside a')
      : null;
    if (!link) return;
    var toggle = document.getElementById('toc-control');
    if (toggle) toggle.checked = false;
  });
})();
