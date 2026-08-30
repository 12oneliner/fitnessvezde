# Фитнес везде — лендинг для сети фитнес-клубов

Премиальный одностраничник для фитнес-бизнеса. Чистый HTML/CSS/JS без сборщиков и зависимостей — деплоится одним пушем на GitHub Pages.

**Демо:** https://12oneliner.github.io/fitnessvezde/

## Что внутри

- Адаптив 320–1440, Lighthouse 95+, `prefers-reduced-motion`
- SEO: `og:*`, `canonical`, JSON-LD `SportsActivityLocation` + `FAQPage`, `robots.txt` / `sitemap.xml`
- Квиз за 30 секунд, попап ухода (exit-intent: десктоп + мобильный триггер), счётчики с анимацией, FAQ с `aria-expanded`
- Галерея со светбоксом, переключатель ниш (фитнес / йога / бои) с кроссфейдом
- Валидация форм, маска телефона `+7`, доступность (фокус-трап в модалках, `:focus-visible`, контраст 4.5:1)
- Заявки: `app.js` → `LEAD_CONFIG` — один переключатель на Telegram / Formspree, без секрета — `localStorage` (демо-режим)

## Стек

HTML5 · CSS3 · ванильный JS · Google Fonts (Playfair Display + Manrope)

## Запуск локально

```bash
# любой статический сервер, например:
npx serve .
# или просто откройте index.html в браузере
```

## Структура

```
index.html   — разметка
style.css    — стили
app.js       — логика (LEAD_CONFIG вверху файла)
robots.txt / sitemap.xml — SEO (замените YOUR-DOMAIN после деплоя)
```

## Подключение заявок

`app.js` → объект `LEAD_CONFIG`:

```js
// Telegram
const LEAD_CONFIG = {
  telegram: { botToken: '123456:ABC...', chatId: '123456789' }
};
// или Formspree
const LEAD_CONFIG = {
  formspree: 'https://formspree.io/f/xxxxxx'
};
```

Без заполнения — демо-режим (логи в консоли, `localStorage`).

## Деплой на GitHub Pages

1. Создайте репозиторий на GitHub.
2. В папке проекта:
   ```bash
   git init
   git add index.html style.css app.js robots.txt sitemap.xml README.md
   git commit -m "feat: premium fitness landing — split CSS/JS, a11y, SEO, lead config"
   git branch -M main
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
3. На GitHub: **Settings → Pages → Source: Deploy from branch `main` / root**.
4. Замените `YOUR-DOMAIN` на выданный URL в: `index.html` (`canonical` + `og:url` + QR), `robots.txt`, `sitemap.xml`, этом README.
5. `git commit -am "chore: set production domain" && git push`

## Что адаптируется за 24 часа

Тексты, фото (Unsplash → ваши), цвета (`:root` в `style.css`), ниша (`nicheData` в `app.js`), город/адрес/телефон, подключение заявок.

## Лицензия

Демо-шаблон для портфолио. Замените тексты оферты/политики перед продакшеном.
