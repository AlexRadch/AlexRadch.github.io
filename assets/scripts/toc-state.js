// Persist the local table-of-contents state for the whole site.
// Loaded only with JavaScript on; storage is shared with LibDoc preferences.
(function () {
    "use strict";

    var storageKey = "eleventyLibdoc";
    var prefKey = "tocMainExpanded";
    var root = document.documentElement;
    var details = document.getElementById("toc_main");

    function read() {
        try {
            var data = JSON.parse(localStorage.getItem(storageKey)) || {};
            return typeof data[prefKey] === "boolean" ? data[prefKey] : null;
        } catch (e) {
            return null;
        }
    }

    function save(value) {
        try {
            var data = JSON.parse(localStorage.getItem(storageKey)) || {};
            data[prefKey] = value;
            localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (e) {}
    }

    // The inline head script hid the list while a closed state was pending.
    delete root.dataset.tocMain;
    if (!details) return;

    var saved = read();
    if (saved !== null) details.open = saved;

    var summary = details.querySelector("summary");
    if (summary) {
        // Listen to the click, not to "toggle": LibDoc closes #toc_main itself
        // on small screens, and that programmatic change must not save a choice.
        summary.addEventListener("click", function () {
            setTimeout(function () { save(details.open); }, 0);
        });
    }
})();
