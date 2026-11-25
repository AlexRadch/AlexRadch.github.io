// Внешние картинки остаются внешними: не скачиваем, не кэшируем, не переписываем src.
// Плагин помечает их до eleventy-img (у того priority -1, у нас 0), и image transform их пропускает.
const REMOTE_SRC = /^(?:https?:)?\/\//i;

export default function externalImagesPlugin() {
    return function(tree) {
        tree.match({ tag: "img" }, function(node) {
            const src = node.attrs && node.attrs.src;

            if (typeof src === "string" && REMOTE_SRC.test(src.trim())) {
                node.attrs = node.attrs || {};
                node.attrs["eleventy:ignore"] = "";

                // sizes без srcset заставляет браузер считать картинку 300×150 —
                // обложка книжки теряет пропорции. Внешние картинки остаются как есть.
                if (!node.attrs.srcset) {
                    delete node.attrs.sizes;
                }
            }

            return node;
        });

        return tree;
    };
}
