// Кнопки +/− и состояние уже нарисованы в HTML при сборке — скрипт только
// переключает классы по клику. Клик по названию страницы остаётся переходом.
function navCollapseBind() {
    var nav = document.getElementById("nav_primary");
    if (!nav || nav.dataset.navCollapseBound === "1") return;
    nav.dataset.navCollapseBound = "1";
    nav.addEventListener("click", function (event) {
        var button = event.target.closest(".nav-collapsible__toggle");
        if (!button || !nav.contains(button)) return;
        var li = button.closest("li.nav-collapsible");
        if (!li) return;
        event.preventDefault();
        var closed = li.classList.toggle("nav-collapsible--closed");
        button.setAttribute("aria-expanded", closed ? "false" : "true");
        var name = button.getAttribute("data-nav-name") || "подменю";
        var text = (closed ? button.getAttribute("data-nav-expand") : button.getAttribute("data-nav-collapse")) + ": " + name;
        button.setAttribute("aria-label", text);
        button.title = text;
    });
}

navCollapseBind();
document.addEventListener("DOMContentLoaded", navCollapseBind);
