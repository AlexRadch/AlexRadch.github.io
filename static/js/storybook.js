/* Storybook: pages are rendered by the Hugo template (layouts/storybook.html)
   at build time. This script only turns them, counts them, deep-links #pN. */
(function () {
  'use strict';

  var uiEl = document.getElementById('storybook-ui');
  var bookEl = document.getElementById('storybook');
  var prevBtn = document.getElementById('storybook-prev');
  var nextBtn = document.getElementById('storybook-next');
  var counterEl = document.getElementById('storybook-counter');
  if (!uiEl || !bookEl) return;

  var UI = {};
  try { UI = JSON.parse(uiEl.textContent); } catch (e) { UI = {}; }

  /* Хуго складывает все ключи в нижний регистр (whereOfTotal→whereoftotal),
     поэтому читаем оба варианта. */
  function tu(key, vars) {
    var v = UI[key] || UI[key.toLowerCase()] || key;
    return String(v).replace(/\{(\w+)\}/g, function (m, name) {
      return vars && name in vars ? vars[name] : m;
    });
  }
  function t(key, vars) {
    return tu(key, vars);
  }

  // Apply interface words to the nav buttons (aria-label + title).
  [['previous', prevBtn], ['next', nextBtn]].forEach(function (item) {
    var msg = t(item[0]);
    item[1].setAttribute('aria-label', msg);
    item[1].title = msg;
  });

  // Pages are already in the HTML (Hugo rendered them). Just hand them over.
  function linkedPage() {
    var m = location.hash.match(/^#p(\d+)$/);
    return m ? (+m[1]) : 0;
  }

  /* Книга живая: размер меряет движок от родителя (stretch).
     width/height не задаём — движок считает сам.
     Метку ставим ДО создания движка: он меряет родителя при загрузке,
     зажим колонки должен стоять уже тогда.
     Минимумы — личные с книги (#storybook-size из шаблона:
     общие из конфига, поверх личные из шапки). 2/3 нет —
     ширину берём прямо из личных, аспект не нужен.
     Максимумы — размер родителя, но не меньше минимумов. */
  var sizeEl = document.getElementById('storybook-size');
  var sizeConf = {};
  try { sizeConf = JSON.parse(sizeEl.textContent); } catch (e) { sizeConf = {}; }
  var minH = sizeConf.minHeight > 0 ? sizeConf.minHeight : 300;
  var minW = sizeConf.minWidth > 0 ? sizeConf.minWidth : 200;
  bookEl.classList.add('storybook-live');
  var navEl = document.querySelector('.storybook-nav');
  if (navEl) navEl.classList.add('storybook-nav-live');
  var parent = bookEl.parentElement;
  var maxH = parent && parent.clientHeight > minH ? parent.clientHeight : minH;
  var maxW = parent && parent.clientWidth > minW ? parent.clientWidth : minW;
  var flip = new St.PageFlip(bookEl, {
    size: 'stretch',
    minWidth: minW,
    minHeight: minH,
    maxWidth: maxW,
    maxHeight: maxH,
    drawShadow: true,
    flippingTime: 800,
    usePortrait: true,
    showCover: true,
    showPageCorners: false
  });
  /* Метка уже стоит (выше). Без скриптов метки нет —
     лента растёт вниз сколько надо. */

  var nodes = Array.prototype.slice.call(bookEl.querySelectorAll(':scope > .storybook-page'));
  flip.loadFromHTML(nodes);

  function total() { return flip.getPageCount(); }
  function current() { return flip.getCurrentPageIndex(); }

  function updateChrome() {
    var cur = current(), n = total();
    counterEl.textContent = n > 0 ? t('whereOfTotal', { where: t('page', { n: cur + 1 }), total: n }) : '';
    prevBtn.disabled = cur <= 0;
    nextBtn.disabled = cur >= n - 1;
  }

  flip.on('flip', updateChrome);
  prevBtn.addEventListener('click', function () { flip.flipPrev(); });
  nextBtn.addEventListener('click', function () { flip.flipNext(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') flip.flipPrev();
    else if (e.key === 'ArrowRight') flip.flipNext();
  });
  window.addEventListener('hashchange', function () {
    var p = linkedPage();
    if (p > 0 && p <= total()) flip.turnToPage(p - 1);
  });

  updateChrome();
  var start = linkedPage();
  if (start > 0 && start <= total()) flip.turnToPage(start - 1);
})();
