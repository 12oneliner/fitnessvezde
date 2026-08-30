// Cloudflare Worker — прокси для Telegram бота
// Деплой: wrangler deploy telegram-worker.js

export default {
  async fetch(request, env) {
    // CORS для фронтенда
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { name, phone, source, quiz } = await request.json();

      // Формируем текст заявки
      const text = `Заявка с сайта\nИмя: ${name || '—'}\nТелефон: ${phone}\nИсточник: ${source || 'cta'}${quiz ? '\nКвиз: ' + quiz : ''}`;

      // Отправляем в Telegram (токен берётся из переменных окружения)
      const telegramUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
      const res = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.CHAT_ID,
          text: text,
        }),
      });

      if (!res.ok) {
        throw new Error('Telegram API error');
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
