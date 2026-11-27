// Раскрытие бокового меню: состояние и кнопки +/− печатаются в HTML при
// сборке. Скрипт nav-collapsible.js только переключает готовые классы, поэтому
// меню не «дёргается» из точки и полного дерева в свёрнутое после загрузки.
// Логика отделена от .eleventy.js, чтобы не править файлы стартера.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const userConfig = require("../settings.json");
const messages = require("../_data/libdocMessages.json");

export function navCollapseSettings() {
    const raw = Number(userConfig.navExpandedDepth);
    return { expandedDepth: Number.isFinite(raw) && raw > 0 ? raw : 2 };
}

// Правила из front matter: navChildrenExpanded перекрывает глубину для узла.
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

// Меню от Eleventy — машинная разметка: <ol><li><a>…</a><ol>…</ol></li></ol>.
// Разбираем её собственнымsmall токенизатором, чтобы не тащить DOM-парсер
// только ради нескольких классов и кнопок.
function parseMenu(html) {
    const root = { type: "root", children: [] };
    const stack = [root];
    const token = /<(\/?)(ol|li|a)\b([^>]*)>/gi;
    let pos = 0;
    let match;
    while ((match = token.exec(html))) {
        if (match.index > pos) {
            stack[stack.length - 1].children.push({ type: "text", text: html.slice(pos, match.index) });
        }
        const close = match[1] === "/";
        const type = match[2].toLowerCase();
        if (close) {
            let i = stack.length - 1;
            while (i > 0 && stack[i].type !== type) i--;
            if (i > 0) {
                stack[i].close = `</${type}>`;
                stack.length = i;
            }
        } else {
            const node = { type, attrs: match[3] || "", children: [], close: null };
            stack[stack.length - 1].children.push(node);
            if (type === "a") {
                const end = html.toLowerCase().indexOf("</a>", token.lastIndex);
                if (end !== -1) {
                    node.text = html.slice(token.lastIndex, end);
                    node.close = "</a>";
                    token.lastIndex = end + 4;
                }
            } else {
                stack.push(node);
            }
        }
        pos = token.lastIndex;
    }
    if (pos < html.length) root.children.push({ type: "text", text: html.slice(pos) });
    return root;
}

function addClass(node, name) {
    const match = /\sclass="([^"]*)"/.exec(node.attrs);
    if (!match) {
        node.attrs += ` class="${name}"`;
        return;
    }
    node.attrs = node.attrs.replace(match[0], ` class="${(match[1] + " " + name).trim()}"`);
}

function addAttr(node, name, value) {
    node.attrs += ` ${name}="${String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;")}"`;
}

function attribute(node, name) {
    const match = new RegExp(`\\s${name}="([^"]*)"`).exec(node.attrs);
    return match ? match[1] : "";
}

function textOf(node) {
    if (node.type === "text") return node.text;
    return (node.children || []).map(textOf).join("");
}

function labelText(text) {
    return String(text || "")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function currentHrefOf(root) {
    let found = "";
    const walk = (node) => {
        if (node.type === "a" && attribute(node, "aria-current") === "page") {
            found = attribute(node, "href");
        }
        (node.children || []).forEach(walk);
    };
    walk(root);
    return found;
}

function containsHref(node, href) {
    if (!href) return false;
    if (node.type === "a" && attribute(node, "href") === href) return true;
    return (node.children || []).some((child) => containsHref(child, href));
}

function renderNode(node) {
    if (node.type === "text") return node.text;
    if (node.type === "button") return node.html;
    const open = `<${node.type}${node.attrs}>`;
    return open + (node.type === "a" ? (node.text || "") : (node.children || []).map(renderNode).join("")) + (node.close || `</${node.type}>`);
}

export function navCollapseMarkup(menuHtml, rules, lang) {
    const tree = parseMenu(String(menuHtml || ""));
    const current = currentHrefOf(tree);
    const messagesForLang = (name) => {
        const entry = messages[name] || {};
        return entry[lang] || entry.en || name;
    };
    const expandText = messagesForLang("navExpandChildren");
    const collapseText = messagesForLang("navCollapseChildren");
    let counter = 0;

    const walk = (node, level) => {
        for (const child of node.children || []) {
            if (child.type !== "li") continue;
            const anchor = (child.children || []).find((item) => item.type === "a");
            const list = (child.children || []).find((item) => item.type === "ol");
            if (!anchor || !list) continue;
            const href = attribute(anchor, "href");
            let expanded = level <= rules.expandedDepth;
            if (Object.prototype.hasOwnProperty.call(rules.overrides, href)) {
                expanded = !!rules.overrides[href];
            }
            if (containsHref(list, current)) expanded = true;

            const name = labelText(textOf(anchor)) || "подменю";
            if (!list.id) {
                list.attrs += ` id="nav-group-${counter++}"`;
            }
            addClass(child, "nav-collapsible");
            addClass(child, `nav-collapsible--level-${level}`);
            if (!expanded) addClass(child, "nav-collapsible--closed");

            const id = attribute(list, "id");
            const buttonLabel = `${expanded ? collapseText : expandText}: ${name}`;
            const button = {
                type: "button",
                html: `<button type="button" class="nav-collapsible__toggle" aria-controls="${id}"` +
                    ` aria-expanded="${expanded ? "true" : "false"}" aria-label="${buttonLabel.replaceAll('"', "&quot;")}"` +
                    ` title="${buttonLabel.replaceAll('"', "&quot;")}"` +
                    ` data-nav-name="${name.replaceAll('"', "&quot;")}"` +
                    ` data-nav-expand="${expandText.replaceAll('"', "&quot;")}"` +
                    ` data-nav-collapse="${collapseText.replaceAll('"', "&quot;")}">` +
                    `<span class="nav-collapsible__icon icon-minus-circle" aria-hidden="true"></span>` +
                    `<span class="nav-collapsible__icon icon-plus-circle" aria-hidden="true"></span></button>`,
            };
            const at = child.children.indexOf(list);
            child.children.splice(at, 0, button);
            walk(list, level + 1);
        }
    };
    const rootList = (tree.children || []).find((node) => node.type === "ol");
    walk(rootList || tree, 1);
    return tree.children.map(renderNode).join("");
}

export default function (eleventyConfig) {
    eleventyConfig.addPairedShortcode(
        "navCollapseMenu",
        function (content, pageLang) {
            const all = this.ctx.getAll();
            const collections = (all.collections && all.collections.all) || [];
            const rules = navCollapseRules(collections);
            return navCollapseMarkup(content, rules, pageLang || (all.lang || "en"));
        }
    );
}
