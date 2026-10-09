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

  var flip = new St.PageFlip(bookEl, {
    width: 400,
    height: 600,
    size: 'fixed',
    drawShadow: true,
    flippingTime: 800,
    usePortrait: true,
    showCover: true,
    showPageCorners: false
  });
  /* Движок ожил — ставим метку: CSS даёт рамку-остаток на высоту экрана.
     Без скриптов метки нет — лента растёт вниз сколько надо.
     Навигацию показываем только здесь: листалка жива, есть что листать. */
  bookEl.classList.add('storybook-live');
  var navEl = document.querySelector('.storybook-nav');
  if (navEl) navEl.classList.add('storybook-nav-live');

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
