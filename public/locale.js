/* Static page translations. Updates text nodes and attributes in place to keep form answers. */
(function () {
  'use strict';
  /* key: [English, Russian] */
  const strings = {
    s001: ['Confident Steps — practice at your own pace', 'Уверенный шаг — практика без спешки'],
    s002: ['Skip to content', 'К содержанию'],
    s003: ['Confident Steps — home', 'Уверенный шаг — главная'],
    s004: ['C', 'у'],
    s005: ['Confident Steps', 'уверенный шаг'],
    s006: ['Practice at your own pace', 'практика без спешки'],
    s007: ['Main navigation', 'Основная навигация'],
    s008: ['Practice', 'Практика'],
    s009: ['How it works', 'Как это работает'],
    s010: ['Survey', 'Анкета'],
    s011: ['Make website text larger', 'Увеличить текст на сайте'],
    s012: ['A', 'А'],
    s013: ['A', 'А'],
    s014: [' For adults 55+', ' Для взрослых 55+'],
    s015: ['Feel at home', 'С техникой можно'],
    s016: ['with technology.', 'подружиться.'],
    s017: ['One step at a time.', 'Шаг за шагом.'],
    s018: ['Practise useful tasks on your phone and computer, with clear guidance and time to go at your own pace.', 'Потренируйтесь делать полезные вещи на телефоне и компьютере. С понятными подсказками и в своём темпе.'],
    s019: ['Start practising ', 'Попробовать спокойно '],
    s020: ['No sign-up needed. ', 'Без регистрации. '],
    s021: ['You can start again.', 'Можно начать заново.'],
    s022: ['Practice screen: enlarge text, check a web address, attach a file, and spot a suspicious message', 'Учебный экран: увеличить текст, проверить адрес, прикрепить файл, распознать подозрительное сообщение'],
    s023: ['A safe place to practice', 'Здесь можно пробовать'],
    s024: ['ONE CLEAR STEP', 'ОДИН ПОНЯТНЫЙ ШАГ'],
    s025: ['Now I can', 'Теперь'],
    s026: ['read it easily.', 'мне удобно.'],
    s027: ['The text is larger', 'Текст стал крупнее'],
    s028: ['You set the pace', 'Вы сами управляете темпом'],
    s029: [' Every mistake is a chance to try again.', ' Ошибка — это повод попробовать ещё раз.'],
    s030: ['Go back', 'Можно вернуться'],
    s031: ['and repeat any step', 'и повторить любой шаг'],
    s032: ['Practice safely', 'Всё учебное'],
    s033: ['with sample data', 'без настоящих данных'],
    s034: ['Help is close by', 'Подсказки рядом'],
    s035: ['in plain language', 'простыми словами'],
    s036: ['SMALL STEPS. USEFUL SKILLS.', 'МАЛЕНЬКАЯ ПРАКТИКА — ПОЛЕЗНЫЙ НАВЫК'],
    s037: ['Where shall we start?', 'С чего начнём?'],
    s038: ['Choose the device you use.', 'Выберите устройство, которым пользуетесь.'],
    s039: ['You can switch at any time.', 'К другой версии можно перейти в любой момент.'],
    s040: ['Device for practice', 'Устройство для практики'],
    s041: [' Phone', ' Телефон'],
    s042: [' Computer', ' Компьютер'],
    s043: ['0 of 9 exercises completed', 'Пройдено 0 из 9 практик'],
    s044: [' Choose any practice. Start with what you need today.', ' Не нужно проходить по порядку. Выберите то, что пригодится сегодня.'],
    s045: ['My confidence ', 'Моя уверенность '],
    s046: ['NO RUSH. NO GRADES.', 'БЕЗ СПЕШКИ И ОЦЕНОК'],
    s047: ['You are free', 'Здесь вы'],
    s048: ['to try things here.', 'ничего не испортите.'],
    s049: ['This is a practice tool. The screens may look familiar, and every action stays within the exercise.', 'Это тренажёр. Экраны похожи на привычные, но все действия происходят внутри упражнения.'],
    s050: ['One step at a time', 'Один шаг за раз'],
    s051: ['A short task with a clear result. If an icon is unfamiliar, a hint explains what it means.', 'Короткое задание и видимый результат. Если значок незнаком, подсказка объяснит его.'],
    s052: ['Room to try again', 'Свобода попробовать снова'],
    s053: ['You can always go back or repeat a step. There is no timer and no score for speed.', 'Кнопка «Назад» и повтор доступны всегда. Здесь нет таймера и баллов за скорость.'],
    s054: ['Sample data only', 'Только учебные данные'],
    s055: ['You do not need passwords, text message codes, documents, or personal photos. Nothing is sent anywhere.', 'Не нужны пароли, коды из SMS, документы и личные фотографии. Ничего никуда не отправляется.'],
    s056: ['Pick up another day', 'Продолжить в другой день'],
    s057: ['This browser remembers completed practices and confidence ratings, so you can continue another day. They stay on this device only. Survey answers are not saved. You can switch this off.', 'Этот браузер запоминает пройденные практики и отметки уверенности, чтобы можно было продолжить в другой день. Они остаются только на этом устройстве. Ответы анкеты не сохраняются. Сохранение можно выключить.'],
    s058: ['Remember my progress', 'Запоминать мой прогресс'],
    s059: ['Delete saved progress', 'Удалить сохранённый прогресс'],
    s060: ['← Back to home', '← На главную'],
    s061: ['HELP US UNDERSTAND YOUR NEEDS', 'ПОМОГИТЕ ПОНЯТЬ ВАШИ ПОТРЕБНОСТИ'],
    s062: ['What would help you most?', 'Какие шаги важны вам?'],
    s063: ['This voluntary survey explores the needs of adults 55+. It has six short sections. You may skip any question except the consent checkbox.', 'Добровольная анкета для исследования потребностей взрослых 55+. Это короткая анкета потребностей из шести блоков. Можно пропустить любой вопрос, кроме согласия.'],
    s064: ['Your answers stay on this page and disappear when you refresh it. The button below creates a file on your device. The website does not send your answers to the researcher. You can share the file yourself through a separately agreed channel.', 'Ответы остаются на этой странице и исчезнут после её обновления. Кнопка внизу создаст файл на вашем устройстве. Сайт не передаёт ответы исследователю: поделиться файлом можно самостоятельно по отдельному договорённому каналу.'],
    s065: ['I understand the purpose of this survey. I freely agree to take part and understand that I can close the page without submitting my answers.', 'Мне понятна цель анкеты. Я добровольно соглашаюсь заполнить её и понимаю, что могу закрыть страницу без отправки ответов.'],
    s066: ['Please do not enter your name, phone number, address, medical details, passwords, or other personal information.', 'Не указывайте имя, телефон, адрес, диагнозы, пароли или другую личную информацию.'],
    s067: ['1. Your age group ', '1. Ваша возрастная группа '],
    s068: ['optional', 'можно пропустить'],
    s069: [' Under 55', ' До 55 лет'],
    s070: [' 55–64', ' 55–64 года'],
    s071: [' 65–74', ' 65–74 года'],
    s072: [' 75 or older', ' 75 лет и старше'],
    s073: [' Prefer not to say', ' Предпочитаю не отвечать'],
    s074: ['This study focuses on people aged 55 and over. You can download answers without selecting an age, but those responses will not be included in the main 55+ group.', 'Исследование посвящено потребностям людей от 55 лет. Если возраст не указан, ответы можно выгрузить, но они не включаются в основную группу 55+.'],
    s075: ['2. Which devices do you use?', '2. Чем вы пользуетесь?'],
    s076: [' Smartphone', ' Смартфон'],
    s077: [' Computer or laptop', ' Компьютер или ноутбук'],
    s078: [' Tablet', ' Планшет'],
    s079: [' I do not use any yet', ' Пока не пользуюсь'],
    s080: ['3. How often do you need to do these tasks?', '3. Как часто вам нужно делать эти действия?'],
    s081: ['Include tasks you need help with at the moment.', 'Отметьте потребность, даже если пока просите помощи.'],
    s082: ['Read text on a screen', 'Читать текст на экране'],
    s083: ['Skip this question', 'Можно пропустить'],
    s084: ['Every day', 'Каждый день'],
    s085: ['Several times a week', 'Несколько раз в неделю'],
    s086: ['Several times a month', 'Несколько раз в месяц'],
    s087: ['Less often', 'Реже'],
    s088: ['I do not need to', 'Не нужно'],
    s089: ['Find information on an official website', 'Находить информацию на официальном сайте'],
    s090: ['Skip this question', 'Можно пропустить'],
    s091: ['Every day', 'Каждый день'],
    s092: ['Several times a week', 'Несколько раз в неделю'],
    s093: ['Several times a month', 'Несколько раз в месяц'],
    s094: ['Less often', 'Реже'],
    s095: ['I do not need to', 'Не нужно'],
    s096: ['Attach a photo or file to a request', 'Прикреплять фото или файл к обращению'],
    s097: ['Skip this question', 'Можно пропустить'],
    s098: ['Every day', 'Каждый день'],
    s099: ['Several times a week', 'Несколько раз в неделю'],
    s100: ['Several times a month', 'Несколько раз в месяц'],
    s101: ['Less often', 'Реже'],
    s102: ['I do not need to', 'Не нужно'],
    s103: ['Decide whether a message is safe', 'Разбираться, безопасно ли сообщение'],
    s104: ['Skip this question', 'Можно пропустить'],
    s105: ['Every day', 'Каждый день'],
    s106: ['Several times a week', 'Несколько раз в неделю'],
    s107: ['Several times a month', 'Несколько раз в месяц'],
    s108: ['Less often', 'Реже'],
    s109: ['I do not need to', 'Не нужно'],
    s110: ['4. How confident are you doing these tasks on your own?', '4. Насколько уверенно вы выполняете эти действия самостоятельно?'],
    s111: ['On a phone', 'На телефоне'],
    s112: ['Skip this question', 'Можно пропустить'],
    s113: ['1 — not at all confident', '1 — очень неуверенно'],
    s114: ['2 — not very confident', '2 — скорее неуверенно'],
    s115: ['3 — I sometimes need help', '3 — иногда нужна помощь'],
    s116: ['4 — fairly confident', '4 — скорее уверенно'],
    s117: ['5 — confident on my own', '5 — уверенно самостоятельно'],
    s118: ['I do not use a phone', 'Не пользуюсь телефоном'],
    s119: ['On a computer', 'На компьютере'],
    s120: ['Skip this question', 'Можно пропустить'],
    s121: ['1 — not at all confident', '1 — очень неуверенно'],
    s122: ['2 — not very confident', '2 — скорее неуверенно'],
    s123: ['3 — I sometimes need help', '3 — иногда нужна помощь'],
    s124: ['4 — fairly confident', '4 — скорее уверенно'],
    s125: ['5 — confident on my own', '5 — уверенно самостоятельно'],
    s126: ['I do not use a computer', 'Не пользуюсь компьютером'],
    s127: ['5. What tends to get in the way? ', '5. Что чаще мешает? '],
    s128: ['choose all that apply', 'можно несколько'],
    s129: [' I worry about pressing the wrong thing and causing a problem', ' Боюсь нажать не туда и что-нибудь испортить'],
    s130: [' The text or buttons are too small', ' Текст или кнопки слишком мелкие'],
    s131: [' I do not understand icons or button labels', ' Не понимаю значки или названия кнопок'],
    s132: [' I do not know the steps, or I lose track of them', ' Не знаю последовательность шагов или теряюсь в ней'],
    s133: [' I worry about scams and sharing my information', ' Боюсь мошенников и передачи данных'],
    s134: [' I do not have a suitable device or internet access', ' Нет подходящего устройства или интернета'],
    s135: [' None of these', ' Ничего из перечисленного'],
    s136: ['6. What kind of help works best for you? ', '6. Какая помощь вам удобнее? '],
    s137: ['choose all that apply', 'можно несколько'],
    s138: [' Repeating steps in a safe practice tool', ' Повторять шаги в безопасном тренажёре'],
    s139: [' Short instructions in large text', ' Короткая инструкция крупным текстом'],
    s140: [' A calm explanation from someone beside me', ' Спокойное объяснение человека рядом'],
    s141: [' A short video I can pause', ' Короткое видео с возможностью остановить'],
    s142: [' Working things out on my own', ' Разбираться самостоятельно'],
    s143: ['Download my answers ', 'Скачать мои ответы '],
    s144: ['Clear survey', 'Очистить анкету'],
    s145: ['Confident Steps ', 'уверенный шаг '],
    s146: ['New skills begin with small steps.', 'Новые навыки начинаются с небольших шагов.'],
    s147: ['Learning prototype · 2026', 'Учебный прототип · 2026'],
    s148: ['All screens and files in the practices are examples.', 'Все экраны и файлы внутри практик — учебные.'],
    s149: ['This is not an official government service.', 'Это не официальный государственный сервис.'],
    s150: ['Open the research survey ↗', 'Открыть анкету исследования ↗'],
    s151: ['Practice at your own pace for adults 55+: clear steps on your phone and computer, safe practice screens, and room to try again.', 'Спокойная практика для взрослых 55+: понятные шаги на телефоне и компьютере, безопасные учебные экраны и возможность попробовать снова.'],
    s152: ['Website language', 'Язык сайта'],
    s200: ['AI helper', 'ИИ-помощник'],
    s201: ['Turn on high contrast', 'Включить высокий контраст'],
    s202: ['High contrast', 'Высокий контраст'],
    s203: ['About the project', 'О проекте'],
    s204: ['About the project ↗', 'О проекте ↗'],
    s205: ['Before and after ', 'До и после '],
    s206: ['NEW · SCAM TRAINER', 'НОВОЕ · ТРЕНАЖЁР'],
    s207: ['Spot the scammer: 10 messages', 'Распознай мошенника: 10 сообщений'],
    s208: ['SMS, WhatsApp, Telegram and notifications, as they look on a phone. Decide for each one: safe or a scam.', 'SMS, WhatsApp, Telegram и уведомления — как на телефоне. Про каждое решите: безопасно или мошенники.'],
    s209: ['Start the trainer', 'Начать тренажёр'],
    s210: ['Text size and contrast', 'Размер текста и контраст'],
    s211: ['Make text smaller', 'Уменьшить текст'],
    s212: ['Make text larger', 'Увеличить текст'],
    s153: ['Which phone do you have?', 'Какой у вас телефон?'],
    s154: ['Phone model', 'Модель телефона'],
    s155: ['The practice screens will look like your phone.', 'Учебные экраны будут выглядеть как на вашем телефоне.']
  };
  const STORAGE_KEY = 'confident-steps-language';
  let language = 'en';
  function valid(value) { return value === 'en' || value === 'ru' || value === 'kk'; }
  /* Kazakh comes from kk.js, keyed by the Russian text. Texts with inserted values are matched by pattern,
     and the inserted pieces are translated too; text glued from several sentences is translated sentence by sentence.
     Anything not found stays Russian. */
  const kkCache = new Map();
  let kkPatterns = null;
  function kazakhPatterns() {
    if (!kkPatterns) {
      const esc = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      kkPatterns = ((window.CSKazakh || {}).patterns || []).map(function (pair) {
        return [new RegExp('^' + pair[0].split(/\{\d\}/).map(esc).join('([\\s\\S]*?)') + '$'), (pair[0].match(/\{\d\}/g) || []).map(function (m) { return Number(m[1]); }), pair[1]];
      });
    }
    return kkPatterns;
  }
  function kazakhPiece(text) {
    const core = text.trim();
    if (!core) return text;
    const found = kazakh(core);
    return found === core ? text : text.replace(core, found);
  }
  function kazakh(russian) {
    const dict = (window.CSKazakh || {}).strings;
    if (!dict) return russian;
    if (Object.prototype.hasOwnProperty.call(dict, russian)) return dict[russian];
    if (kkCache.has(russian)) return kkCache.get(russian);
    let result = russian;
    for (const [re, order, kk] of kazakhPatterns()) {
      const m = russian.match(re);
      if (!m) continue;
      const values = {};
      order.forEach(function (n, i) { values[n] = kazakhPiece(m[i + 1]); });
      result = kk.replace(/\{(\d)\}/g, function (_, n) { return values[n]; });
      break;
    }
    if (result === russian) {
      /* sentences end with . ! ? … (or a closing quote after them) followed by a space; “Kaspi.kz” stays whole */
      const parts = russian.split(/(?<=[.!?…]»?)(\s+)/);
      if (parts.length > 1) {
        const done = parts.map(function (p) { return /^\s*$/.test(p) ? p : dict[p]; });
        if (done.every(function (p) { return p !== undefined; })) result = done.join('');
      }
    }
    if (result === russian && /[а-яё]/i.test(russian)) (window.CSKazakhMissing = window.CSKazakhMissing || new Set()).add(russian); /* for checking the translation */
    kkCache.set(russian, result);
    return result;
  }
  function pick(english, russian) { return language === 'ru' ? russian : language === 'kk' ? kazakh(russian) : english; }
  function translate(key) {
    const entry = strings[key];
    return entry ? pick(entry[0], entry[1]) : key;
  }
  function applyStaticTranslations() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-i18n]').forEach(function (element) {
      element.textContent = translate(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-texts]').forEach(function (element) {
      const entries = JSON.parse(element.dataset.i18nTexts);
      Object.keys(entries).forEach(function (index) {
        const node = element.childNodes[Number(index)];
        if (node && node.nodeType === Node.TEXT_NODE) node.nodeValue = translate(entries[index]);
      });
    });
    ['aria-label', 'content', 'title'].forEach(function (attribute) {
      document.querySelectorAll('[data-i18n-' + attribute + ']').forEach(function (element) {
        element.setAttribute(attribute, translate(element.getAttribute('data-i18n-' + attribute)));
      });
    });
    document.querySelectorAll('[data-language]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
  }
  function setLanguage(value) {
    if (!valid(value)) return;
    language = value;
    try { localStorage.setItem(STORAGE_KEY, language); } catch (_) { /* Storage can be unavailable. */ }
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('lang')) {
        url.searchParams.set('lang', language);
        window.history.replaceState(window.history.state, '', url);
      }
    } catch (_) { /* The in-page language still changes if URL updates are unavailable. */ }
    applyStaticTranslations();
    document.dispatchEvent(new CustomEvent('cslanguagechange', { detail: { language: language } }));
  }
  window.CSLocale = {
    get lang() { return language; },
    t: pick,
    setLanguage: setLanguage
  };
  let requested;
  try { requested = new URL(window.location.href).searchParams.get('lang'); } catch (_) {}
  let stored;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (_) {}
  language = valid(requested) ? requested : valid(stored) ? stored : 'en';
  applyStaticTranslations();
  document.querySelectorAll('[data-language]').forEach(function (button) {
    button.addEventListener('click', function () { setLanguage(button.dataset.language); });
  });
})();
