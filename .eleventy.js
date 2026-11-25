// START 11TY imports
import eleventyNavigationPlugin             from "@11ty/eleventy-navigation";
import { InputPathToUrlTransformPlugin }    from "@11ty/eleventy";
import { eleventyImageTransformPlugin }     from "@11ty/eleventy-img";
import { EleventyHtmlBasePlugin }           from "@11ty/eleventy";
import pluginRss                            from "@11ty/eleventy-plugin-rss";
// END 11TY imports

// START LibDoc imports
import libdocConfig                         from "./_data/libdocConfig.js";
import libdocFunctions                      from "./_data/libdocFunctions.js";
// END LibDoc imports

// START gists imports
import silversand                           from "./_data/silversand.js";
// END gists imports

export default function(eleventyConfig) {
    // START PLUGINS
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    eleventyConfig.addPlugin(eleventyImageTransformPlugin, libdocFunctions.pluginsParameters.eleventyImageTransform());
    eleventyConfig.addPlugin(pluginRss);
    // END PLUGINS

    // START FILTERS
    eleventyConfig.addAsyncFilter("autoids", libdocFunctions.filters.autoids);
    eleventyConfig.addAsyncFilter("embed", libdocFunctions.filters.embed);
    eleventyConfig.addAsyncFilter("cleanup", libdocFunctions.filters.cleanup);
    eleventyConfig.addAsyncFilter("dateString", libdocFunctions.filters.dateString);
    eleventyConfig.addAsyncFilter("datePrefixText", libdocFunctions.filters.datePrefixText);
    eleventyConfig.addAsyncFilter("toc", libdocFunctions.filters.toc);
    eleventyConfig.addAsyncFilter("sanitizeJSON", libdocFunctions.filters.sanitizeJson);
    eleventyConfig.addAsyncFilter("gitLastModifiedDate", libdocFunctions.filters.gitLastModifiedDate);
    // END FILTERS

    // START COLLECTIONS
    eleventyConfig.addCollection("myTags", libdocFunctions.collections.myTags);
    eleventyConfig.addCollection("postsByDateDescending", libdocFunctions.collections.postsByDateDescending);
    // END COLLECTIONS

    // START SHORTCODES
    eleventyConfig.addShortcode("alert", libdocFunctions.shortcodes.alert);
    eleventyConfig.addPairedShortcode("alertAlt", libdocFunctions.shortcodes.alert);
    eleventyConfig.addShortcode("embed", libdocFunctions.shortcodes.embed);
    eleventyConfig.addShortcode("icons", libdocFunctions.shortcodes.icons);
    eleventyConfig.addShortcode("icon", libdocFunctions.shortcodes.icon);
    eleventyConfig.addShortcode("iconCard", libdocFunctions.shortcodes.iconCard);
    eleventyConfig.addPairedShortcode("sandbox", libdocFunctions.shortcodes.sandbox);
    eleventyConfig.addPairedShortcode("sandboxFile", libdocFunctions.shortcodes.sandboxFile);
    // END SHORTCODES

    // START gists shortcodes
    // Карусель Silver Sand: кадры уже ресайзнуты заранее, поэтому eleventy:ignore
    // удерживает image transform от повторной оптимизации готовых JPG/WebP.
    eleventyConfig.addShortcode("silversandGallery", function(key, label) {
        const slides = silversand[key];
        if (!slides) {
            throw new Error(`Silver Sand: нет галереи ${key}`);
        }
        const escape = value => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
        const frames = slides.map((slide, index) => `
          <figure class="ss-slide${index === 0 ? " is-active" : ""}" data-index="${index + 1}">
            <div class="ss-media">
              <picture>
                <source srcset="${slide.webp}" type="image/webp">
                <img eleventy:ignore src="${slide.jpg}" alt="${escape(slide.alt)}" width="${slide.width}" height="${slide.height}" loading="lazy" decoding="async">
              </picture>
            </div>
          </figure>`).join("");
        return `
<div class="wrap">
  <div class="silversand-carousel ss-gallery" data-gallery aria-label="Фотографии: ${escape(label)}">
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
    });
    // END gists shortcodes

    // START TRANSFORMS
    // eleventy:ignore гасит оптимизацию уже готовых кадров, но в разметке
    // внутри <picture> атрибут остаётся — убираем его из итогового HTML.
    eleventyConfig.addTransform("cleanEleventyIgnore", function(content, outputPath) {
        return outputPath && outputPath.endsWith(".html")
            ? content.replaceAll(' eleventy:ignore=""', '')
            : content;
    });
    // END TRANSFORMS

    // START FILE COPY
	eleventyConfig.addPassthroughCopy("sandboxes");
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("core/assets");
    eleventyConfig.addPassthroughCopy("favicon.png");
    // END FILE COPY
    
    return {
        pathPrefix: libdocConfig.htmlBasePathPrefix
    }
};