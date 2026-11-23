(function () {
  var root = document.getElementById('silversand-gallery');
  if (!root) return;
  var slides = Array.prototype.slice.call(root.querySelectorAll('.ss-slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.ss-dot'));
  var counter = root.querySelector('.ss-counter');
  if (!slides.length) return;
  var current = 0;

  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach(function (slide, n) {
      slide.classList.toggle('is-active', n === current);
    });
    dots.forEach(function (dot, n) {
      dot.classList.toggle('is-active', n === current);
      if (n === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    counter.textContent = (current + 1) + ' / ' + slides.length;
  }

  root.classList.add('is-ready');
  show(0);

  root.addEventListener('click', function (event) {
    var prev = event.target.closest('.ss-prev');
    var next = event.target.closest('.ss-next');
    var dot = event.target.closest('.ss-dot');
    if (prev) show(current - 1);
    else if (next) show(current + 1);
    else if (dot) show(Number(dot.dataset.go) - 1);
  });

  document.addEventListener('keydown', function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    var tag = event.target && event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
        (event.target && event.target.isContentEditable)) return;
    var box = root.getBoundingClientRect();
    if (box.bottom < 0 || box.top > window.innerHeight) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    else if (event.key === 'Home') { event.preventDefault(); show(0); }
    else if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
  });

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
      show(current + (dx < 0 ? 1 : -1));
    }
    x0 = null;
    y0 = null;
  }, { passive: true });
})();
