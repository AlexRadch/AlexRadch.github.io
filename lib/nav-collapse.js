// Правила раскрытия бокового меню. Логика отделена от .eleventy.js, чтобы
// шаблоны LibDoc и его данные остались нетронутыми при обновлении стартера.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const userConfig = require("../settings.json");

export function navCollapseSettings() {
    const raw = Number(userConfig.navExpandedDepth);
    return { expandedDepth: Number.isFinite(raw) && raw > 0 ? raw : 2 };
}

export function navCollapseRules(collections) {
    const overrides = {};
    for (const item of collections || []) {
        const data = item.data || {};
        if (typeof data.navChildrenExpanded === "boolean" && item.url) {
            overrides[item.url] = data.navChildrenExpanded;
        }
    }
    return { ...navCollapseSettings(), overrides };
}

export function navCollapseDataScript(rules) {
    const json = JSON.stringify(rules).replaceAll("<", "\\u003c");
    return `<script type="application/json" id="nav-collapse-config">${json}</script>`;
}

export default function(eleventyConfig) {
    eleventyConfig.addShortcode("navCollapseConfig", function () {
        const all = this.ctx.getAll();
        const collections = (all.collections && all.collections.all) || [];
        return navCollapseDataScript(navCollapseRules(collections));
    });
}
