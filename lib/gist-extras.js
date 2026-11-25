// Расширения только для наших страниц. Функции экспортируются, поэтому их
// можно вызвать и как shortcode в Markdown, и напрямую из другого кода.
import silversand from "../_data/silversand.js";

export function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
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
        .sort(function(a, b) {
            const orderA = (a.data.eleventyNavigation && a.data.eleventyNavigation.order) || 0;
            const orderB = (b.data.eleventyNavigation && b.data.eleventyNavigation.order) || 0;
            if (orderA !== orderB) return orderA - orderB;
            const aTime = a.date instanceof Date ? a.date.getTime() : 0;
            const bTime = b.date instanceof Date ? b.date.getTime() : 0;
            return bTime - aTime;
        });
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

export default function(eleventyConfig) {
    // Тонкие обёртки: логика живёт в экспортируемых функциях выше.
    eleventyConfig.addShortcode("pageList", function(parentKey, limit) {
        return pageList(shortcodeCollections(this.ctx), parentKey, limit);
    });
    eleventyConfig.addShortcode("silversandGallery", silversandGallery);
    eleventyConfig.addTransform("cleanEleventyIgnore", cleanEleventyIgnore);
}
