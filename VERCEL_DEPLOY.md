# Деплой на Vercel за 2 минуты

## 1. Установка
```bash
npm i -g vercel
```

## 2. Деплой
```bash
vercel
```

При первом деплое ответьте:
- Set up and deploy? **Y**
- Which scope? Ваш аккаунт
- Link to existing project? **N**
- Project name? **fitness-telegram-bot**
- In which directory? **./** (текущая)
- Override settings? **N**

## 3. Добавьте секреты
```bash
vercel env add BOT_TOKEN
# Вставьте токен бота (который получили от @BotFather)

vercel env add CHAT_ID
# Вставьте ID чата
```

Выберите для каждой переменной:
- Production: **Yes**
- Preview: **Yes** 
- Development: **Yes**

## 4. Передеплой с секретами
```bash
vercel --prod
```

## 5. Получите URL
Vercel выдаст URL вида: `https://fitness-telegram-bot.vercel.app`

Ваш endpoint: `https://fitness-telegram-bot.vercel.app/api/telegram`

## 6. Обновите app.js
В файле `app.js` замените строку:
```javascript
const response = await fetch('ВАШ_CLOUDFLARE_WORKER_URL', {
```

На:
```javascript
const response = await fetch('https://fitness-telegram-bot.vercel.app/api/telegram', {
```

Готово! Сайт отправляет лиды в Telegram через Vercel без Cloudflare.
