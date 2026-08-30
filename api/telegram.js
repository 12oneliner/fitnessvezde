// Vercel Serverless Function для отправки лидов в Telegram
// Деплой: vercel --prod

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, source, quiz } = req.body;

    // Формируем текст заявки
    const text = `Заявка с сайта\nИмя: ${name || '—'}\nТелефон: ${phone}\nИсточник: ${source || 'cta'}${quiz ? '\nКвиз: ' + quiz : ''}`;

    // Отправляем в Telegram (токен берётся из переменных окружения)
    const telegramUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: text,
      }),
    });

    if (!response.ok) {
      throw new Error('Telegram API error');
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
