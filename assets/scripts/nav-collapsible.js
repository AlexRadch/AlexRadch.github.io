// Collapsible submenus in the left navigation. Loaded only with JavaScript on.
(function () {
    "use strict";

    var nav = document.getElementById("nav_primary");
    if (!nav) return;

    var config = { expandedDepth: 2, overrides: {} };
    var configNode = document.getElementById("nav-collapse-config");
    if (configNode) {
        try {
            var parsed = JSON.parse(configNode.textContent);
            if (parsed && typeof parsed === "object") config = parsed;
        } catch (e) {}
    }
    var overrides = config.overrides || {};
    var depth = Number(config.expandedDepth);
    if (!Number.isFinite(depth) || depth < 1) depth = 2;

    var groups = [];

    // root <li> = level 1; its children live in the <ol> it owns.
    function levelOf(li) {
        var level = 0;
        for (var parent = li.parentElement; parent; parent = parent.parentElement) {
            if (parent.tagName === "OL") level++;
        }
        return level;
    }

    function nameOf(anchor) {
        return ((anchor && anchor.textContent) || "подменю").trim();
    }

    function idFor(anchor, index) {
        var href = (anchor && anchor.getAttribute("href")) || "";
        var slug = href.toLowerCase().replace(/[^a-z0-9а-яё_-]+/gi, "-")
            .replace(/^-+|-+$/g, "");
        return "nav-group-" + (slug || index);
    }

    function setExpanded(group, expanded) {
        group.list.classList.toggle("nav-collapsible__children--collapsed", !expanded);
        group.button.setAttribute("aria-expanded", expanded ? "true" : "false");
        var label = (expanded ? "Свернуть подменю: " : "Развернуть подменю: ") + nameOf(group.anchor);
        group.button.setAttribute("aria-label", label);
        group.button.title = label;
    }

    Array.prototype.forEach.call(nav.querySelectorAll("li"), function (li, index) {
        var list = Array.prototype.find.call(li.children, function (child) {
            return child.tagName === "OL";
        });
        if (!list) return;

        var anchor = li.querySelector(":scope > a.nav_primary__anchor");
        var button = document.createElement("button");
        var icon = document.createElement("span");
        button.type = "button";
        button.className = "nav-collapsible__toggle";
        icon.className = "icon-caret-down";
        button.appendChild(icon);

        var id = idFor(anchor, index);
        list.id = id;
        button.setAttribute("aria-controls", id);

        var group = { list: list, anchor: anchor, button: button };
        button.addEventListener("click", function () {
            setExpanded(group, button.getAttribute("aria-expanded") !== "true");
        });

        li.classList.add("nav-collapsible");
        li.insertBefore(button, list);
        groups.push(group);

        var expanded = levelOf(li) + 1 <= depth;
        var href = anchor && anchor.getAttribute("href");
        if (href && Object.prototype.hasOwnProperty.call(overrides, href)) {
            expanded = !!overrides[href];
        }
        setExpanded(group, expanded);
    });

    // Keep the branch containing the current page visible.
    var current = nav.querySelector('a[aria-current="page"]');
    if (current) {
        groups.forEach(function (group) {
            if (group.list.contains(current)) setExpanded(group, true);
        });
    }
})();
