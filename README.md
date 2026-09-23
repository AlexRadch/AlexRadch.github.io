# AlexRadch.github.io

Личный сайт-витрина: небольшие исследования, обзоры сайтов и сервисов,
инструкции. Русский язык.

Собрано на [Hugo](https://gohugo.io) + тема
[hugo-book v0.15.0](https://github.com/alex-shpak/hugo-book)
(субмодуль `themes/hugo-book`, исходники темы не трогаем — только
переопределения в `layouts/` и дополнения в `assets/`).

Публикация: GitHub Actions (`.github/workflows/hugo.yml`) →
https://alexradch.github.io/

## Структура

- `content/_index.md` — главная (список разделов через `section-tree`)
- `content/gists/` — «Фрагменты»: одиночные статьи (`layout: gist`,
  без бокового меню) и многостраничные «книги» со своим меню
- `layouts/` — наши переопределения темы:
  - `baseof.html` — каркас (топбар, крошки, подвал)
  - `landing.html` — главная (подвал включён, теминый его гасит)
  - `gist.html` — одиночный фрагмент без меню
  - `_partials/docs/menu-filetree.html` — левое меню: один каталог
    со своим деревом (рекурсия, глубина `bookSectionDepth`,
    лимит `bookSectionLimit`)
  - `_partials/docs/menu-section.html` — какой каталог рисовать
    (`bookSection` из front matter)
  - `_partials/docs/breadcrumbs.html` — хлебные крошки (логика как
    у темы в main-ветке, корень — `bookBreadcrumbRoot: true`)
  - `_partials/docs/links/edit.html` — «Edit this page» (починена
    под Windows через `path.Clean`)
  - `_partials/docs/prev-next.html`, `opengraph.html` — мелкие правки
  - `shortcodes/section-tree.html` — список страниц раздела
    (`depth`, `summary`, лимит `bookListLimit`)
- `assets/icons/` — свои иконки (в т.ч. `scroll-text` для «Фрагментов»,
  `chevron-right` для крошек — их нет в v0.15.0)
- `assets/styles/custom.css`, `assets/scripts/` — стили и скрипты
- `hugo.toml` — конфиг (язык `ru`, локаль `ru-ru`, параметры `book*`)

## Параметры разделов (front matter `_index.md`)

| Параметр | Чей | Что делает |
|---|---|---|
| `bookSection` | наш | какое меню рисовать (`.` = текущий каталог) |
| `bookBreadcrumbRoot` | наш | корень хлебных крошек |
| `bookSectionDepth` | наш | глубина меню (нет = бесконечно) |
| `bookSectionLimit` | наш | пунктов в меню (нет = без лимита) |
| `bookListLimit` | наш | пунктов в списке `section-tree` |
| `bookFlatSection` | тема | жирный заголовок + дети вровень |
| `bookIcon` | тема | иконка раздела из `assets/icons/` |
| `bookCollapseSection` | тема | книга-аккордеон (CSS, без JS) |

## Локальная сборка

```sh
hugo server --bind 0.0.0.0 --port 1313 --disableFastRender --navigateToChanged
```

Открыть http://localhost:1313/ (обновлять через Ctrl+F5 — сервер
на грязной сборке иногда отдаёт старое).

## Лицензии

Код сайта — [MIT](LICENSE), тексты статей — CC BY 4.0
(ссылка в подвале сайта).

История изменений — [CHANGELOG.md](CHANGELOG.md).
