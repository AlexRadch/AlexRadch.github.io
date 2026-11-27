// Добавляем список подстраниц в оглавление на странице и в плавающее меню.
(function () {
    "use strict";

    if (window.__NOJS__) return;

    var source = document.getElementById('floating_pages_source');
    if (!source) return;
    var links = source.querySelectorAll('li a[href]');
    if (!links.length) return;

    var messages = window.libdocMessages || {};
    var label = messages.pages || 'Pages';

    function appendPages(list) {
        if (!list) return;
        // Копируем ссылку из соответствующего списка: классы у глав и здесь,
        // и в плавающем меню разные.
        var templateLink = list.querySelector('a');
        if (!templateLink) return;

        var divider = document.createElement('li');
        divider.className = 'pages-divider';
        var span = document.createElement('span');
        span.textContent = label;
        divider.appendChild(span);
        list.appendChild(divider);

        links.forEach(function (sourceLink) {
            var li = document.createElement('li');
            var link = templateLink.cloneNode(false);
            link.href = sourceLink.getAttribute('href');
            link.textContent = sourceLink.textContent.trim();
            li.appendChild(link);
            list.appendChild(li);
        });
    }

    appendPages(document.querySelector('#toc_main > ol'));
    appendPages(document.getElementById('floating_toc__list'));
})();
