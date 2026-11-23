(function () {
  var roots = Array.prototype.slice.call(document.querySelectorAll('.page-silversand-taste [data-gallery]'));
  if (!roots.length) return;

  var galleries = roots.map(function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.ss-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.ss-dot'));
    var counter = root.querySelector('.ss-counter');
    var warmed = {};
    var current = 0;
    var suppressClickUntil = 0;

    /* Кадры соседей подогреваются заранее: перелистывание не ждёт сети,
       а место под картинку занято aspect-ratio ещё до загрузки. */
    function preload(i) {
      [i - 1, i, i + 1].forEach(function (n) {
        var slide = slides[(n + slides.length) % slides.length];
        var source = slide && slide.querySelector('source');
        var url = source && source.getAttribute('srcset');
        if (!url || warmed[url]) return;
        warmed[url] = new Image();
        warmed[url].src = url;
      });
    }

    function show(i) {
      current = (i + slides.length) % slides.length;
      preload(current);
      slides.forEach(function (slide, n) {
        slide.classList.toggle('is-active', n === current);
      });
      dots.forEach(function (dot, n) {
        dot.classList.toggle('is-active', n === current);
        if (n === current) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (counter) counter.textContent = (current + 1) + ' / ' + slides.length;
    }

    root.classList.add('is-ready');
    show(0);

    var x0 = null, y0 = null;
    root.addEventListener('touchstart', function (event) {
      x0 = event.touches[0].clientX;
      y0 = event.touches[0].clientY;
    }, { passive: true });
    root.addEventListener('touchend', function (event) {
      if (x0 === null) return;
      var dx = event.changedTouches[0].clientX - x0;
      var dy = event.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        suppressClickUntil = Date.now() + 500;
        show(current + (dx < 0 ? 1 : -1));
      }
      x0 = null;
      y0 = null;
    }, { passive: true });

    return {
      root: root,
      show: show,
      step: function (d) { show(current + d); },
      go: function (n) { show(n - 1); },
      at: function (n) { return show(n); },
      suppress: function () { return suppressClickUntil; }
    };
  });

  function owner(node) {
    return node && node.closest ? node.closest('[data-gallery]') : null;
  }

  function byRoot(root) {
    for (var i = 0; i < galleries.length; i++) {
      if (galleries[i].root === root) return galleries[i];
    }
    return null;
  }

  document.addEventListener('click', function (event) {
    var root = owner(event.target);
    var gallery = root && byRoot(root);
    if (!gallery || Date.now() < gallery.suppress()) return;
    var dot = event.target.closest('.ss-dot');
    if (dot) gallery.go(Number(dot.getAttribute('data-go')));
    else if (event.target.closest('.ss-stage')) {
      /* Клик по краю кадра: левые 45% — назад, правые 45% — вперёд. */
      var stage = gallery.root.querySelector('.ss-stage');
      var box = stage.getBoundingClientRect();
      var x = (event.clientX - box.left) / box.width;
      if (x < 0.45) gallery.step(-1);
      else if (x > 0.55) gallery.step(1);
    }
  });

  /* Стрелки работают только с каруселью, которая в поле зрения (или в фокусе):
     иначе одна клавиша листала бы сразу все карусели страницы. */
  document.addEventListener('keydown', function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    var tag = event.target && event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
        (event.target && event.target.isContentEditable)) return;
    var gallery = null;
    var focused = owner(document.activeElement);
    if (focused) gallery = byRoot(focused);
    if (!gallery) {
      for (var i = 0; i < galleries.length; i++) {
        var box = galleries[i].root.getBoundingClientRect();
        if (box.bottom > 0 && box.top < window.innerHeight) {
          gallery = galleries[i];
          break;
        }
      }
    }
    if (!gallery) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); gallery.step(1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); gallery.step(-1); }
    else if (event.key === 'Home') { event.preventDefault(); gallery.at(0); }
    else if (event.key === 'End') { event.preventDefault(); gallery.at(-1); }
  });
})();
