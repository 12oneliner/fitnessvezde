/* ============================================
   Фитнес везде — app.js
   ============================================ */

/* ----- Конфиг отправки заявок -----
   Раскомментируйте один из вариантов и подставьте секрет.
   1) Telegram: создайте бота через @BotFather, узнайте chat_id
   2) Formspree: зарегистрируйтесь на formspree.io, возьмите form ID

   Если ничего не настроено — заявки сохраняются в localStorage
   (демо-режим, видно в консоли).
----------------------------------- */
const LEAD_CONFIG = {
  // БЕЗОПАСНО: токен хранится в переменных окружения Vercel (BOT_TOKEN, CHAT_ID),
  // браузер общается только с нашей функцией-прокси.
  webhook: 'https://fitness-telegram-bot-three.vercel.app/api/telegram',

  // Альтернатива, если понадобится вместо Telegram: возьмите form ID на formspree.io
  // formspree: 'https://formspree.io/f/xxxxxx',

  // ❌ НЕ ИСПОЛЬЗУЙТЕ напрямую — токен виден всем:
  // telegram: { botToken: 'XXX', chatId: 'XXX' }
};

async function sendLead(payload) {
  // payload: { name, phone, source, quiz? }

  // Формируем квиз-строку если есть
  var quizStr = '';
  if (payload.quiz) quizStr = payload.quiz;

  // Отправляем через Vercel-функцию (токен спрятан в переменных окружения сервера)
  if (LEAD_CONFIG.webhook) {
    const res = await fetch(LEAD_CONFIG.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        phone: payload.phone,
        source: payload.source || 'cta',
        quiz: quizStr || undefined
      }),
    });
    if (!res.ok) throw new Error('Worker error ' + res.status);
    return;
  }

  // Formspree (альтернатива)
  if (LEAD_CONFIG.formspree) {
    const text = `Заявка с сайта\nИмя: ${payload.name || '—'}\nТелефон: ${payload.phone}\nИсточник: ${payload.source || 'cta'}${quizStr ? '\nКвиз: ' + quizStr : ''}`;
    const res = await fetch(LEAD_CONFIG.formspree, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name: payload.name, phone: payload.phone, message: text }),
    });
    if (!res.ok) throw new Error('Formspree error ' + res.status);
    return;
  }

  // Демо-режим (без настроенного webhook/formspree)
  try {
    const leads = JSON.parse(localStorage.getItem('leads') || '[]');
    leads.push({ ...payload, at: new Date().toISOString() });
    localStorage.setItem('leads', JSON.stringify(leads));
  } catch (e) {}
  console.info('[демо] Заявка сохранена в localStorage:', payload);
}

/* reveal + counters */
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }
  var nums = document.querySelectorAll('.value[data-count]');
  if (nums.length) {
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io2.unobserve(el);
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var dur = 1400, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = Math.round(target * eased);
          el.innerHTML = val.toLocaleString('ru-RU') + (p === 1 ? '<span>' + suffix + '</span>' : '');
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (e) { io2.observe(e); });
  }
})();

/* burger */
(function () {
  var btn = document.getElementById('burger'), menu = document.getElementById('mobileMenu');
  function toggle(open) {
    var isOpen = open != null ? open : !menu.classList.contains('open');
    menu.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
    menu.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  btn.addEventListener('click', function () { toggle(); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
})();

/* smooth scroll offset for fixed nav + demo bar */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var id = a.getAttribute('href'); if (id === '#') return;
    var t = document.querySelector(id); if (!t) return;
    e.preventDefault();
    var navH = document.getElementById('nav').offsetHeight + 16;
    var top = t.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });
});

/* FAQ — с aria-expanded / aria-controls */
(function () {
  var items = document.querySelectorAll('.faq-item');
  items.forEach(function (item, idx) {
    var btn = item.querySelector('.faq-q');
    var panel = item.querySelector('.faq-a');
    var panelId = 'faq-panel-' + idx;
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', panelId);
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      items.forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = '0px';
        o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* phone mask + validation helpers */
function attachMask(input) {
  function format(v) {
    var d = v.replace(/\D/g, ''); if (d.startsWith('8')) d = '7' + d.slice(1); if (d.startsWith('7')) d = d.slice(1);
    d = d.slice(0, 10);
    var r = '+7'; if (d.length > 0) r += ' (' + d.slice(0, 3); if (d.length >= 3) r += ') '; else if (d.length > 0) r += '';
    if (d.length > 3) r += d.slice(3, 6); if (d.length > 6) r += '-' + d.slice(6, 8); if (d.length > 8) r += '-' + d.slice(8, 10);
    return r;
  }
  input.addEventListener('input', function () { input.value = format(input.value); });
  input.addEventListener('focus', function () { if (!input.value) input.value = '+7 ('; });
}
document.querySelectorAll('input[type="tel"]').forEach(attachMask);
function isPhoneValid(v) { return v.replace(/\D/g, '').length === 11; }
function setFieldError(input, msg) {
  var field = input.closest('.field'); var small = field ? field.querySelector('small') : null;
  input.classList.toggle('input-error', !!msg); if (small) small.textContent = msg || '';
}
function showToast(msg) {
  var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 3200);
}

/* modals — фокус-трап + возврат фокуса */
var lastFocus = null;
function openModal(id) {
  lastFocus = document.activeElement;
  var m = document.getElementById(id);
  m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
  // фокус на первый интерактивный элемент
  var focusable = m.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length) focusable[0].focus();
  // ловушка Tab
  m._trapHandler = function (e) {
    if (e.key !== 'Tab') return;
    var nodes = Array.from(m.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(function (el) { return el.offsetParent !== null; });
    if (!nodes.length) return;
    var first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  m.addEventListener('keydown', m._trapHandler);
}
function closeModal(id) {
  var m = document.getElementById(id);
  if (m._trapHandler) m.removeEventListener('keydown', m._trapHandler);
  m.classList.remove('open'); m.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal.open') && !document.querySelector('.lightbox.open')) document.body.style.overflow = '';
  if (lastFocus) { try { lastFocus.focus(); } catch (e) {} }
}
document.querySelectorAll('[data-close]').forEach(function (el) {
  el.addEventListener('click', function () { closeModal(el.getAttribute('data-close')); });
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.open').forEach(function (m) { closeModal(m.id); });
    var lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('open')) closeLightbox();
  }
});
document.querySelectorAll('[data-open="privacy"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); openModal('privacyModal'); }); });
document.querySelectorAll('[data-open="offer"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); openModal('offerModal'); }); });

/* lightbox для галереи */
var lightbox = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightboxImg');
function openLightbox(src, alt) {
  lightboxImg.src = src; lightboxImg.alt = alt || '';
  lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('.lightbox-close').focus();
}
function closeLightbox() {
  lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal.open')) document.body.style.overflow = '';
  lightboxImg.src = '';
}
if (lightbox) {
  lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
}
document.querySelectorAll('.gallery a').forEach(function (a) {
  a.addEventListener('click', function (e) {
    e.preventDefault();
    var img = a.querySelector('img');
    var fullSrc = a.getAttribute('href');
    openLightbox(fullSrc, img ? img.alt : '');
  });
});

/* forms */
async function handleSubmit(form, nameInput, source) {
  var phone = form.querySelector('input[name="phone"]');
  var name = nameInput ? nameInput.value.trim() : '';
  var ok = true;
  if (nameInput) {
    if (name.length < 2) { setFieldError(nameInput, 'Введите имя'); ok = false; } else setFieldError(nameInput, '');
  }
  if (!isPhoneValid(phone.value)) { setFieldError(phone, 'Введите номер полностью'); ok = false; } else setFieldError(phone, '');
  if (!ok) return false;

  var btn = form.querySelector('button[type="submit"]');
  var origText = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }

  var quizStr = '';
  if (window.quizAnswers && quizAnswers.goal) {
    quizStr = [quizAnswers.goal, quizAnswers.level, quizAnswers.format].filter(Boolean).join(' / ');
  }

  try {
    await sendLead({ name: name, phone: phone.value, source: source || 'cta', quiz: quizStr || undefined });
    document.getElementById('successName').textContent = name ? name : 'мы на связи';
    closeModal('quizModal'); closeModal('exitModal');
    openModal('successModal');
    form.reset(); form.querySelectorAll('input').forEach(function (i) { setFieldError(i, ''); });
    showToast('Заявка отправлена — перезвоним за 7 минут');
  } catch (err) {
    console.error(err);
    showToast('Не удалось отправить — попробуйте ещё раз или позвоните');
  } finally {
    if (btn) { btn.disabled = false; btn.style.opacity = ''; btn.innerHTML = origText; }
  }
  return false;
}
document.getElementById('ctaForm').addEventListener('submit', function (e) { e.preventDefault(); handleSubmit(e.target, e.target.querySelector('input[name="name"]'), 'cta'); });
document.getElementById('quizForm').addEventListener('submit', function (e) { e.preventDefault(); handleSubmit(e.target, null, 'quiz'); });
document.getElementById('exitForm').addEventListener('submit', function (e) { e.preventDefault(); handleSubmit(e.target, null, 'exit-intent'); });
document.getElementById('successQuiz').addEventListener('click', function () { closeModal('successModal'); openQuiz(); });
document.querySelectorAll('.field input').forEach(function (inp) { inp.addEventListener('input', function () { setFieldError(inp, ''); }); });

/* quiz */
var quizAnswers = {}; window.quizAnswers = quizAnswers;
function openQuiz() {
  quizAnswers = {}; window.quizAnswers = quizAnswers;
  document.querySelectorAll('.quiz-step').forEach(function (s) { s.classList.remove('active'); });
  document.querySelector('[data-step="1"]').classList.add('active');
  document.getElementById('quizBar').style.width = '33%';
  document.getElementById('quizTitle').textContent = 'Подберём программу под вашу цель';
  document.querySelectorAll('.quiz-opts button').forEach(function (b) { b.classList.remove('selected'); });
  openModal('quizModal');
}
document.getElementById('openQuiz').addEventListener('click', openQuiz);
document.getElementById('openQuiz2').addEventListener('click', openQuiz);
var mQuiz = document.getElementById('openQuizMobile');
if (mQuiz) mQuiz.addEventListener('click', function (e) { e.preventDefault(); document.getElementById('mobileMenu').classList.remove('open'); document.body.style.overflow = ''; openQuiz(); });
document.querySelectorAll('.quiz-step .quiz-opts button').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var step = btn.closest('.quiz-step'); var n = parseInt(step.getAttribute('data-step'), 10);
    step.querySelectorAll('button').forEach(function (b) { b.classList.remove('selected'); }); btn.classList.add('selected');
    if (n === 1) { quizAnswers.goal = btn.getAttribute('data-value'); window.quizAnswers = quizAnswers; }
    if (n === 2) { quizAnswers.level = btn.getAttribute('data-value'); window.quizAnswers = quizAnswers; }
    if (n === 3) { quizAnswers.format = btn.getAttribute('data-value'); window.quizAnswers = quizAnswers; }
    setTimeout(function () {
      step.classList.remove('active');
      if (n < 3) {
        var next = document.querySelector('[data-step="' + (n + 1) + '"]'); next.classList.add('active');
        document.getElementById('quizBar').style.width = (n === 1 ? '66%' : '88%');
      } else {
        document.querySelector('[data-step="4"]').classList.add('active');
        document.getElementById('quizBar').style.width = '100%';
        var rec = 'Рекомендуем: ';
        if (quizAnswers.goal === 'Похудение') rec += 'кардио + силовые 3×/нед и йога 1×/нед';
        else if (quizAnswers.goal === 'Набор массы') rec += 'сплит 4×/нед + персональный план питания';
        else if (quizAnswers.goal === 'Здоровье') rec += 'пилатес на реформерах + стретчинг 2–3×/нед';
        else rec += 'кроссфит и бокс в мини-группах + функциональные тренировки';
        rec += ' · формат: ' + quizAnswers.format + ' · уровень: ' + quizAnswers.level + '. Стартуем с бесплатной диагностики и первой тренировки.';
        document.getElementById('quizResult').textContent = rec;
      }
    }, 180);
  });
});

/* niche switch — с кроссфейдом */
var nicheData = {
  fitness: { title: 'Начни <em>прямо сейчас</em> — остальное приложится', lead: 'Фитнес везде — это залы без лишнего пафоса и с продуманной программой. Тренер, план и поддержка с первого дня. Ваше первое занятие — бесплатно.', c1h: 'Тренажёрный зал', c1p: '220 единиц оборудования, зоны свободных весов и кардиотерраса. Дежурный тренер всегда рядом — поможет с техникой и составит план.', c2h: 'Йога и стретчинг', c2p: 'Утренние и вечерние практики в тихом зале с панорамными окнами. Подходит новичкам без опыта.', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=900&auto=format&fit=crop' },
  yoga: { title: 'Тело <em>в балансе</em> — ум в покое', lead: 'Студия йоги и пилатеса внутри клуба Фитнес везде. Панорамные окна, тишина, опытные наставники. Первое занятие — бесплатно.', c1h: 'Йога-зал', c1p: 'Хатха, виньяса и йога-нидра в светлом зале 180 м². Коврики, блоки и пледы уже на месте.', c2h: 'Пилатес на реформерах', c2p: 'Мягкая работа с осанкой и глубоким кором. Индивидуально и в мини-группах до 6 человек.', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=900&auto=format&fit=crop' },
  fight: { title: 'Сила <em>в технике</em> — уверенность в каждом движении', lead: 'Бокс и единоборства в клубе Фитнес везде. Ринг, мешки, лапы и спарринги под контролем мастеров спорта. Первая тренировка — бесплатно.', c1h: 'Бокс и кикбоксинг', c1p: 'Постановка удара с нуля за 8 занятий. Группы и персоналки, экипировка на месте.', c2h: 'ММА и функционалка', c2p: 'Связки, борьба и кроссфит для выносливости. Прогресс без травм — техника важнее силы.', img: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=900&auto=format&fit=crop' }
};
function setNiche(key) {
  var d = nicheData[key]; if (!d) return;
  var heroImg = document.getElementById('heroImg');
  // кроссфейд
  heroImg.classList.add('fading');
  var preload = new Image(); preload.src = d.img;
  preload.onload = function () {
    setTimeout(function () {
      heroImg.src = d.img;
      heroImg.classList.remove('fading');
    }, 180);
  };
  // фолбэк если картинка уже в кэше
  if (preload.complete) { heroImg.src = d.img; heroImg.classList.remove('fading'); }
  document.getElementById('heroTitle').innerHTML = d.title;
  document.getElementById('heroLead').textContent = d.lead;
  document.getElementById('c1h').textContent = d.c1h;
  document.getElementById('c1p').textContent = d.c1p;
  document.getElementById('c2h').textContent = d.c2h;
  document.getElementById('c2p').textContent = d.c2p;
  document.querySelectorAll('.niche-switch').forEach(function (sw) {
    sw.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-niche') === key); });
  });
}
document.querySelectorAll('.niche-switch button').forEach(function (b) {
  b.addEventListener('click', function () { setNiche(b.getAttribute('data-niche')); showToast('Ниша: ' + b.textContent + ' — контент обновлён'); });
});

/* ============================================
   Демо-панель заявок («Как приходят заявки»)
   Данные вымышленные, телефоны обезличены.
   ============================================ */
(function () {
  var openBtn = document.getElementById('openAdmin');
  var modal = document.getElementById('adminModal');
  if (!openBtn || !modal) return;

  var listEl = document.getElementById('admLeads');
  var chartEl = document.getElementById('admChart');
  var tgEl = document.getElementById('admTgText');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // заявки: имя, хвост телефона, источник, ответ квиза, минут назад
  var SEED = [
    { name: 'Анна', tail: '912', src: 'quiz', quiz: 'Похудение / Новичок / Группы', min: 3 },
    { name: 'Дмитрий', tail: '926', src: 'cta', quiz: '', min: 27 },
    { name: 'Ольга', tail: '903', src: 'quiz', quiz: 'Здоровье спины / Новичок / Персонально', min: 68 },
    { name: 'Ирина', tail: '985', src: 'exit', quiz: '', min: 145 },
    { name: 'Максим', tail: '916', src: 'quiz', quiz: 'Набор массы / Продвинутый / Свободный зал', min: 212 }
  ];
  var POOL = [
    { name: 'Светлана', tail: '905', src: 'quiz', quiz: 'Выносливость / Продолжающий / Группы' },
    { name: 'Артём', tail: '999', src: 'cta', quiz: '' },
    { name: 'Юлия', tail: '962', src: 'quiz', quiz: 'Похудение / Продолжающий / Персонально' },
    { name: 'Егор', tail: '936', src: 'exit', quiz: '' },
    { name: 'Марина', tail: '977', src: 'cta', quiz: '' }
  ];
  var SRC_LABEL = { cta: 'форма', quiz: 'квиз', exit: 'exit-popup' };

  function phone(tail) { return '+7 (' + tail + ') ' + (100 + (tail.charCodeAt(2) % 9) * 10) + '-••-••'; }
  function ago(min) {
    if (min < 1) return 'только что';
    if (min < 60) return min + ' мин назад';
    var h = Math.round(min / 60);
    if (h < 24) return h + ' ч назад';
    return Math.round(h / 24) + ' дн назад';
  }

  function leadNode(l) {
    var li = document.createElement('li');
    li.className = 'adm-lead';
    var meta = l.quiz ? l.quiz : 'Источник: ' + SRC_LABEL[l.src] + ' · перезвонить в течение часа';
    li.innerHTML =
      '<span class="adm-lead-av">' + l.name.charAt(0) + '</span>' +
      '<div class="adm-lead-main">' +
        '<div class="adm-lead-top"><b></b><span class="adm-lead-phone"></span></div>' +
        '<div class="adm-lead-meta"></div>' +
      '</div>' +
      '<div class="adm-lead-side">' +
        '<div class="adm-lead-time"></div>' +
        '<span class="adm-src ' + l.src + '">' + SRC_LABEL[l.src] + '</span>' +
      '</div>';
    li.querySelector('b').textContent = l.name;
    li.querySelector('.adm-lead-phone').textContent = phone(l.tail);
    li.querySelector('.adm-lead-meta').textContent = meta;
    li.querySelector('.adm-lead-time').textContent = ago(l.min);
    if (reduce) li.style.animation = 'none', li.style.opacity = '1', li.style.transform = 'none';
    return li;
  }

  function renderLeads(items) {
    listEl.innerHTML = '';
    items.forEach(function (l, i) {
      var node = leadNode(l);
      if (!reduce) node.style.animationDelay = (i * 70) + 'ms';
      listEl.appendChild(node);
    });
  }

  // заявки по дням за 2 недели — виден рост после запуска сайта
  var DAYS = [4, 5, 3, 6, 7, 5, 8, 7, 9, 8, 11, 10, 9, 12];
  function renderChart() {
    var max = Math.max.apply(null, DAYS);
    chartEl.innerHTML = '';
    DAYS.forEach(function (v, i) {
      var b = document.createElement('span');
      b.title = v + ' заявок';
      chartEl.appendChild(b);
      var h = Math.round((v / max) * 100) + '%';
      if (reduce) b.style.height = h;
      else setTimeout(function () { b.style.height = h; }, 60 + i * 45);
    });
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-adm-count'), 10);
    var suffix = el.getAttribute('data-adm-suffix') || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var dur = 900, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var leads = SEED.slice();
  var poolIdx = 0;
  var liveTimer = null;

  function tgText(l) {
    return 'Заявка с сайта\nИмя: ' + l.name + '\nТелефон: ' + phone(l.tail) +
      '\nИсточник: ' + l.src + (l.quiz ? '\nКвиз: ' + l.quiz : '');
  }

  // одна «новая» заявка, пока панель открыта — показывает живой поток
  function pushLive() {
    var next = POOL[poolIdx % POOL.length];
    poolIdx++;
    var l = { name: next.name, tail: next.tail, src: next.src, quiz: next.quiz, min: 0 };
    leads.unshift(l);
    leads = leads.slice(0, 5);
    renderLeads(leads);
    tgEl.textContent = tgText(l);
    showToast('Новая заявка: ' + l.name + ' · ' + SRC_LABEL[l.src]);
  }

  function startLive() {
    if (reduce || liveTimer) return;
    liveTimer = setInterval(pushLive, 9000);
  }
  function stopLive() {
    if (liveTimer) { clearInterval(liveTimer); liveTimer = null; }
  }

  openBtn.addEventListener('click', function () {
    leads = SEED.slice();
    poolIdx = 0;
    renderLeads(leads);
    renderChart();
    tgEl.textContent = tgText(SEED[0]);
    modal.querySelectorAll('[data-adm-count]').forEach(countUp);
    openModal('adminModal');
    startLive();
  });

  // таймер живёт только пока панель открыта
  modal.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', stopLive);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') stopLive();
  });
})();

/* exit intent — desktop (mouseleave) + mobile (быстрый скролл вверх) */
(function () {
  if (sessionStorage.getItem('exitShown')) return;
  var shown = false;
  function show() { if (shown) return; shown = true; sessionStorage.setItem('exitShown', '1'); openModal('exitModal'); }
  document.addEventListener('mouseleave', function (e) { if (e.clientY < 8) show(); });
  // мобильный триггер: быстрый скролл вверх
  var lastY = window.scrollY, lastT = Date.now();
  window.addEventListener('scroll', function () {
    var y = window.scrollY, now = Date.now();
    var dy = lastY - y, dt = now - lastT;
    // резкий скролл вверх (>300px за <400мс) и уже проскроллили вниз
    if (y > 400 && dy > 300 && dt < 400) show();
    lastY = y; lastT = now;
  }, { passive: true });
})();
