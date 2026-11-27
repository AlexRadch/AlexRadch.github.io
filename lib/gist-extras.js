// Расширения только для наших страниц. Функции экспортируются, поэтому их
// можно вызвать и как shortcode в Markdown, и напрямую из другого кода.
import silversand from "../_data/silversand.js";
import navigationCore from "@11ty/eleventy-navigation/eleventy-navigation.js";

export function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

// Правила сортировки собраны в одном месте: чтобы добавить поле или условие,
// правятся sortValues и comparePages, все списки и меню подхватят их сразу.
function timeOf(value) {
    if (value === undefined || value === null || value === "") return 0;
    const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
    return Number.isFinite(time) ? time : 0;
}

export function sortValues(item) {
    const data = item && item.data;
    const nav = (data && data.eleventyNavigation) || item || {};
    const rawDate = item && item.date !== undefined ? item.date : data && data.date;
    return {
        order: Number(nav.order) || 0,
        time: timeOf(rawDate)
    };
}

export function comparePages(a, b) {
    const left = sortValues(a);
    const right = sortValues(b);
    if (left.order !== right.order) return left.order - right.order;
    if (left.time !== right.time) return right.time - left.time;
    return 0;
}

// Универсальный список страниц. Возвращает только <ul>...</ul>.
// items — массив из collections.all; parentKey — ключ родителя в навигации
// (без него берём корневые страницы); limit — необязательное число.
export function pageList(items, parentKey, limit) {
    const pages = (items || [])
        .filter(function(item) {
            const nav = item.data && item.data.eleventyNavigation;
            return nav && (parentKey ? nav.parent === parentKey : !nav.parent);
        })
        .sort(comparePages);
    const chosen = limit ? pages.slice(0, Number(limit)) : pages;
    const rows = chosen.map(function(item) {
        const nav = item.data.eleventyNavigation;
        const title = nav.key || item.data.title || item.page.fileSlug;
        const description = String(item.data.description || '').replace(/\s+/g, ' ').trim();
        const short = description.length > 110 ? description.slice(0, 107) + '...' : description;
        const suffix = short ? ' — ' + escapeHtml(short) : '';
        return `<li><a href="${item.url}">${escapeHtml(title)}</a>${suffix}</li>`;
    }).join('\n');
    return `<ul>\n${rows}\n</ul>`;
}

// Плагин eleventy-navigation сортирует только по order. Пересортировываем
// каждый уровень дерева тем же правилом, что и pageList.
export function navigatedPages(items) {
    const times = new Map();
    for (const item of items || []) {
        const nav = item.data && item.data.eleventyNavigation;
        if (nav && nav.key) times.set(nav.key, timeOf(item.date));
    }
    const sortLevel = function(entries) {
        entries.forEach(function(entry) {
            // У записей меню своей даты нет — берём её со страницы.
            entry.date = times.get(entry.key) || 0;
            if (entry.children) sortLevel(entry.children);
        });
        return entries.sort(comparePages);
    };
    return sortLevel(navigationCore.findNavigationEntries(items || []));
}

// Карусель Silver Sand: кадры уже ресайзнуты заранее, поэтому eleventy:ignore
// удерживает image transform от повторной оптимизации готовых JPG/WebP.
export function silversandGallery(key, label) {
    const slides = silversand[key];
    if (!slides) {
        throw new Error(`Silver Sand: нет галереи ${key}`);
    }
    const frames = slides.map((slide, index) => `
          <figure class="ss-slide${index === 0 ? " is-active" : ""}" data-index="${index + 1}">
            <div class="ss-media">
              <picture>
                <source srcset="${slide.webp}" type="image/webp">
                <img eleventy:ignore src="${slide.jpg}" alt="${escapeHtml(slide.alt)}" width="${slide.width}" height="${slide.height}" loading="lazy" decoding="async">
              </picture>
            </div>
          </figure>`).join("");
    return `
<div class="wrap">
  <div class="silversand-carousel ss-gallery" data-gallery aria-label="Фотографии: ${escapeHtml(label)}">
    <div class="silversand-frame">
      <div class="ss-stage">${frames}
      </div>
    </div>
    <div class="silversand-gallery-foot">
      <span class="ss-counter" aria-live="polite">1 / ${slides.length}</span>
      <div class="ss-dots" role="group" aria-label="Выбрать фотографию">
        ${slides.map((slide, index) => `<button type="button" class="ss-dot${index === 0 ? " is-active" : ""}" data-go="${index + 1}" aria-label="Фотография ${index + 1}"${index === 0 ? ' aria-current="true"' : ''}></button>`).join("\n        ")}
      </div>
    </div>
  </div>
</div>`;
}

// eleventy:ignore гасит оптимизацию уже готовых кадров, но в разметке
// внутри <picture> атрибут остаётся — убираем его из итогового HTML.
export function cleanEleventyIgnore(content, outputPath) {
    return outputPath && outputPath.endsWith(".html")
        ? content.replaceAll(' eleventy:ignore=""', '')
        : content;
}

function shortcodeCollections(ctx) {
    const all = ctx && typeof ctx.getAll === "function" ? ctx.getAll() : {};
    return (all.collections && all.collections.all) || [];
}

// Подстраницы для плавающего оглавления: только ссылки, без блока на странице.
export function floatingPages(items, url) {
    const all = items || [];
    const current = all.find(function(item) { return item.url === url; });
    const nav = current && current.data && current.data.eleventyNavigation;
    if (!nav || !nav.key || (current.data && current.data.tocPages === false)) return '';
    const children = all
        .filter(function(item) {
            const childNav = item.data && item.data.eleventyNavigation;
            return childNav && childNav.parent === nav.key;
        })
        .sort(comparePages);
    return children.map(function(item) {
        const childNav = item.data.eleventyNavigation;
        const title = childNav.key || item.data.title || item.page.fileSlug;
        return `<li><a href="${item.url}">${escapeHtml(title)}</a></li>`;
    }).join('\n');
}

export default function(eleventyConfig) {
    // Тонкие обёртки: логика живёт в экспортируемых функциях выше.
    eleventyConfig.addFilter("eleventyNavigation", navigatedPages);
    eleventyConfig.addShortcode("pageList", function(parentKey, limit) {
        return pageList(shortcodeCollections(this.ctx), parentKey, limit);
    });
    eleventyConfig.addShortcode("floatingPages", function(url) {
        return floatingPages(shortcodeCollections(this.ctx), url);
    });
    eleventyConfig.addShortcode("silversandGallery", silversandGallery);
    eleventyConfig.addTransform("cleanEleventyIgnore", cleanEleventyIgnore);
}
