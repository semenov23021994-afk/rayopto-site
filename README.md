# RayOpto site v3

Статический сайт для Cloudflare Pages.

## Маршруты
- `/`
- `/catalog/`
- `/brands/`
- `/contacts/`
- `/product/?id=...`
- `/admin/`

## Каталог
Товаров: 155. Источник данных — `data/products.json`.

Сайт показывает только позиции со `status: "Опубликован"` (фильтр в `assets/js/common.js`,
функция `isPublished`). Позиции со `status: "Черновик"` не попадают ни в каталог, ни в поиск,
ни в карточку товара — при выгрузке от поставщиков это штатный способ скрыть непроверенные записи.

Поля `description`, `specifications`, `compatibility`, `image`, `pdf` сейчас пустые у всех позиций,
но уже поддержаны шаблонами: как только они заполнятся, на карточке появятся фото, описание,
характеристики и кнопка скачивания PDF.

### Файлы-справочники
`data/brands.json`, `data/categories.json`, `data/groups.json` кодом **не используются** —
все списки выводятся из `products.json`. Оставлены как справочные; при расхождении
источником истины считается `products.json`.

## Размещение
Загрузите содержимое архива в корень GitHub-репозитория.
Build command: пусто
Build output directory: /
Root directory: пусто

## После деплоя — обязательно
1. **Закрыть `/admin/`** через Cloudflare Access. Сейчас раздел доступен по прямой ссылке всем
   (в `robots.txt` и заголовках он помечен `noindex`, но это не защита).
2. **Проверить домен** в `sitemap.xml`, `robots.txt` и `canonical`-ссылках — везде зашит
   `https://rayopto.ru`. При смене домена обновить.
3. **Форма обратной связи** сейчас открывает почтовый клиент через `mailto:` — заявки не теряются,
   но и не попадают в CRM. Для нормальной отправки нужна Pages Function с SMTP или форм-сервис.

## Сопровождение

### CSP
В `_headers` включён строгий `Content-Security-Policy`. В `script-src` прописан SHA-256 хеш
инлайнового блока `application/ld+json` из `index.html`. **При любом изменении этого блока
хеш нужно пересчитать**, иначе структурированные данные перестанут применяться:

```
node -e "const fs=require('fs'),c=require('crypto');const m=fs.readFileSync('index.html','utf8').match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/);console.log('sha256-'+c.createHash('sha256').update(m[1],'utf8').digest('base64'))"
```

### Sitemap
`sitemap.xml` содержит 4 статические страницы и по одному URL на каждую опубликованную позицию.
После правки каталога перегенерировать:

```
node -e "const fs=require('fs');const p=require('./data/products.json');const pages=['/','/catalog/','/brands/','/contacts/'];const urls=[...pages.map(u=>({loc:'https://rayopto.ru'+u,pri:u==='/'?'1.0':'0.8'})),...p.filter(x=>x.status==='Опубликован').map(x=>({loc:'https://rayopto.ru/product/?id='+encodeURIComponent(x.id),pri:'0.6'}))];fs.writeFileSync('sitemap.xml','<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n'+urls.map(u=>'  <url>\n    <loc>'+u.loc+'</loc>\n    <priority>'+u.pri+'</priority>\n  </url>').join('\n')+'\n</urlset>\n')"
```

### Иконки брендов
Лежат в `assets/brands/<slug>.svg`, по одному файлу на бренд. Подставляются автоматически
на главной, в каталоге, на странице производителей и в карточке товара
(`brandIconHtml()` в `assets/js/common.js`). Slug — имя бренда в нижнем регистре,
все не-латинские символы заменены дефисом: `PZ Medical` → `pz-medical.svg`, `iRay` → `iray.svg`.

Сейчас это **сгенерированные монограммы, а не настоящие логотипы**: официальные лого
производителей — товарные знаки, и использовать их можно только с разрешения правообладателя
или поставщика. Когда такие файлы появятся, просто **замените SVG с тем же именем** —
код и вёрстка менять не нужно. Изображение вписывается в квадрат через `object-fit: contain`,
поэтому широкие горизонтальные логотипы не растянутся.

Если файла для бренда нет, `installBrandIcons()` подставляет монограмму из инициалов —
поэтому новый поставщик в выгрузке не приведёт к «битой» картинке.

Пересобрать монограммы после добавления брендов в `data/brands.json`:

```
node tools/gen-brand-icons.js .
```

### Экранирование
Все данные из `products.json` выводятся через `escapeHtml()` (`assets/js/common.js`).
При добавлении новых шаблонов с `innerHTML` использовать только его — иначе поле,
пришедшее от поставщика, станет вектором XSS.
