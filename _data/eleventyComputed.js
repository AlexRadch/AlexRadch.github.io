// Сортировка навигации без ручного order на каждой странице.
// LibDoc/eleventy-navigation сортирует по order; если его нет, order
// выводится из даты: новые страницы выше. Явно заданный order главнее.
export default {
    eleventyNavigation: function(data) {
        const nav = data.eleventyNavigation;
        if (!nav) {
            return undefined;
        }
        if (nav.order !== undefined) {
            return nav;
        }
        const date = data.date instanceof Date ? data.date : new Date(data.date);
        const time = date.getTime();
        if (!Number.isFinite(time)) {
            return nav;
        }
        return Object.assign({}, nav, { order: -time });
    }
};
