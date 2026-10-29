'use strict';
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const t = (en, ru) => window.CSLocale.t(en, ru);
  const PH = window.CSPhone;
  const AS = window.CSAssistant;
  const esc = v => String(v).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const plain = v => String(v).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const key = 'uverenny-shag-v1';
  /* display preference, kept apart from progress so it works without the save switch */
  const contrastKey = 'uverenny-shag-contrast';
  const lessonIds = ['egov', 'whatsapp', 'telegram', 'phone', 'internet'];
  const taskIds = ['text', 'address', 'file', 'message', ...lessonIds];
  /* phone basics is only for the phone version */
  const ids = () => state.device === 'computer' ? taskIds.filter(x => x !== 'phone' && x !== 'message' && x !== 'file') : taskIds;
  const lessons = () => window.CSLessonsFactory({t, PH, esc, options, device: () => state.device, iconSrc: k => appIconSource(k, state.device === 'phone' ? state.os : (state.dos === 'mac' ? 'ios' : 'android'))});

  function getTask(id) {
    if (lessonIds.includes(id)) return lessons()[id];
    const tasks = {
      text: {icon: t('Aa', 'Aа'), title: t('Make text larger', 'Сделать текст крупнее'), description: t('Adjust the screen to make reading more comfortable.', 'Настроить экран так, чтобы читать было удобнее.'), takeaway: t('If text is too small, you can make it larger. On a phone, look for display and text size settings. On a computer, look for zoom in the browser menu. The names may vary by device.', 'Если текст мелкий, его можно увеличить. На телефоне ищите настройки экрана и размера текста. На компьютере — масштаб в меню браузера. Названия пунктов зависят от устройства.')},
      address: {icon: '⌕', title: t('Find an official website', 'Найти официальный сайт'), description: t('Check the address and find the information you need.', 'Проверить адрес и найти нужную информацию.'), takeaway: t('Check the address carefully: the official domain in this exercise is egov.kz. A similar spelling does not make another website official. A padlock icon alone does not guarantee that a website is trustworthy.', 'Проверяйте адрес внимательно: официальный домен в этом упражнении — egov.kz. Похожее написание не делает другой сайт официальным. Значок замка сам по себе не гарантирует надёжность сайта.')},
      file: {icon: '↥', title: t('Attach a photo to a message', 'Прикрепить фото к обращению'), description: t('Choose a sample photo, check it and practise sending it.', 'Выбрать файл, проверить и подтвердить отправку.'), takeaway: t('Before sending, check the message, the recipient and the attached file name. A paperclip button usually means “attach”. If you are unsure, go back and check again.', 'Перед отправкой проверьте текст, получателя и имя прикреплённого файла. Кнопка со скрепкой обычно означает «прикрепить». Если сомневаетесь, вернитесь и проверьте ещё раз.')},
      message: {icon: '◇', title: t('Spot a suspicious message', 'Распознать опасное сообщение'), description: t('Notice pressure and choose a safe next step.', 'Заметить давление и выбрать безопасное действие.'), takeaway: t('Urgency and a request to share a code are reasons to pause. Do not share the code with the sender. To check a message, find the organisation’s official contact yourself or ask someone you trust for help.', 'Спешка и просьба передать код — повод остановиться. Не сообщайте код собеседнику. Если нужно проверить сообщение, самостоятельно найдите официальный контакт организации или попросите помощи у человека, которому доверяете.')}
    };
    return tasks[id];
  }
  function getLabels() {
    return [t('Not at all confident', 'Очень неуверенно'), t('Not very confident', 'Скорее неуверенно'), t('Sometimes need help', 'Иногда нужна помощь'), t('Fairly confident', 'Скорее уверенно'), t('Confident on my own', 'Уверенно самостоятельно')];
  }
  const emptyProgress = () => ({phone: [], computer: []});
  const emptyRatings = () => ({phone: {before: null, after: null}, computer: {before: null, after: null}});
  let state = {device: 'phone', os: 'android', dos: 'windows', progress: emptyProgress(), ratings: emptyRatings(), save: false};
  let active = null;
  let confidenceContext = null;
  let scenario = null;
  const scenarioStats = {n: 0, ok: 0};
  let currentView = 'home';
  let announcementTimer;
  const localizedStatuses = new Map();
  function setLocalizedStatus(id, message) {
    localizedStatuses.set(id, message);
    const element = document.getElementById(id);
    if (element) element.textContent = message();
  }
  function refreshStatuses() {
    localizedStatuses.forEach((message, id) => {
      const element = document.getElementById(id);
      if (element) element.textContent = message();
    });
  }
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && saved.save === true) {
      state.save = true;
      state.device = saved.device === 'computer' ? 'computer' : 'phone';
      state.os = saved.os === 'ios' ? 'ios' : 'android';
      state.dos = saved.dos === 'mac' ? 'mac' : 'windows';
      ['phone', 'computer'].forEach(device => {
        state.progress[device] = [...new Set((Array.isArray(saved.progress?.[device]) ? saved.progress[device] : []).filter(id => taskIds.includes(id)))];
        ['before', 'after'].forEach(phase => {
          const rating = saved.ratings?.[device]?.[phase];
          state.ratings[device][phase] = Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
        });
      });
    }
  } catch (_) { /* Browser storage is optional; practice remains available. */ }
  function announce(message) {
    const region = $('#global-status');
    clearTimeout(announcementTimer);
    region.textContent = '';
    announcementTimer = setTimeout(() => { region.textContent = message; }, 30);
  }
  function persist() {
    if (!state.save) return true;
    try { localStorage.setItem(key, JSON.stringify(state)); return true; }
    catch (_) { setLocalizedStatus('storage-status', () => t('The browser did not allow saving. You can keep practising on this page.', 'Браузер не разрешил сохранение. Можно продолжать практику на этой странице.')); return false; }
  }
  function deviceName() { return state.device === 'phone' ? t('Phone', 'Телефон') : t('Computer', 'Компьютер'); }
  function deviceLabel() { return state.device === 'phone' ? (state.os === 'ios' ? 'iPhone' : 'Android') : (state.dos === 'mac' ? 'Mac' : 'Windows'); }
  const curOs = () => state.device === 'phone' ? state.os : state.dos;
  function focusTitle(selector) { requestAnimationFrame(() => { $(selector)?.focus({preventScroll: true}); }); }
  function showView(view, scroll = true) {
    if (view !== currentView) stopSpeaking();
    currentView = view;
    ['home', 'training', 'confidence', 'survey', 'chat', 'cheatsheet'].forEach(name => { $('#' + name + '-view').hidden = name !== view; });
    if (scroll) window.scrollTo({top: 0, behavior: 'instant'});
  }
  function home(section) {
    showView('home', !section);
    renderCards();
    if (section) requestAnimationFrame(() => {
      const target = $('#' + section);
      target?.scrollIntoView({block: 'start', behavior: 'instant'});
      focusTitle(section === 'practices' ? '#practices-title' : '#about-title');
    });
    else focusTitle('#main');
  }
  function renderCards() {
    $$('#home-view [data-device]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.device === state.device)));
    $('#os-line').innerHTML = `<span class="os-q">${state.device === 'phone' ? t('Which phone do you have?', 'Какой у вас телефон?') : t('Which computer do you have?', 'Какой у вас компьютер?')}</span><div class="os-switch" role="group" aria-label="${state.device === 'phone' ? t('Phone model', 'Модель телефона') : t('Computer type', 'Тип компьютера')}">${osButtons()}</div><span class="os-hint">${state.device === 'phone' ? t('The practice screens will look like your phone.', 'Учебные экраны будут выглядеть как на вашем телефоне.') : t('The practice screens will look like your computer.', 'Учебные экраны будут выглядеть как на вашем компьютере.')}</span>`;
    $('#os-line').hidden = false;
    $('#save-progress').checked = state.save;
    $('#progress-summary').textContent = t(`Completed ${state.progress[state.device].filter(x => ids().includes(x)).length} of ${ids().length} exercises · ${deviceLabel()}`, `Пройдено ${state.progress[state.device].filter(x => ids().includes(x)).length} из ${ids().length} практик · ${deviceLabel()}`);
    $('#task-grid').innerHTML = ids().map((id, index) => {
      const task = getTask(id), completed = state.progress[state.device].includes(id);
      return `<article class="task-card${completed ? ' completed' : ''}"><div class="task-card-top"><span class="task-icon" aria-hidden="true">${task.icon}</span><span class="task-number">0${index + 1}</span></div><h3>${task.title}${completed ? `<small class="completed-tag">${t('✓ Completed', '✓ Пройдено')}</small>` : ''}</h3><p>${task.description}</p><button type="button" data-task="${id}" data-testid="task-${id}" aria-label="${completed ? t('Repeat exercise', 'Повторить практику') : t('Start exercise', 'Начать практику')}: ${task.title}">${completed ? t('Repeat exercise', 'Повторить практику') : t('Start exercise', 'Начать практику')} <span aria-hidden="true">↗</span></button><button class="cs-link" data-action="cheatsheet" data-id="${id}" data-testid="cheatsheet-${id}">${t('Cheat sheet to print', 'Шпаргалка для печати')}</button></article>`;
    }).join('');
  }


  /* ---------- free AI chat with screenshots ---------- */
  const chatState = {messages: [], image: null, busy: false, started: false};
  function chatGreeting() {
    return t('Hello! Ask me about your phone, WhatsApp, Telegram, eGov or the internet. You can attach a screenshot and I will tell you what to tap next.', 'Здравствуйте! Спросите меня про телефон, WhatsApp, Telegram, eGov или интернет. Можно приложить скриншот, и я подскажу, что нажимать дальше.');
  }
  function chatLogHTML() {
    const msgs = [{role: 'bot', text: chatGreeting(), greeting: true}, ...chatState.messages];
    return msgs.map(m => `<div class="as-msg ${m.role}">${m.thumb ? `<img class="chat-thumb" src="${m.thumb}" alt="${t('Your screenshot', 'Ваш скриншот')}">` : ''}${m.text ? `<p>${esc(m.text)}</p>` : ''}${m.role === 'bot' && m.ai === false ? `<small>${t('Ready-made reply', 'Заготовленный ответ')}</small>` : ''}</div>`).join('') + (chatState.busy ? `<div class="as-msg bot"><p class="as-typing">${t('Looking…', 'Смотрю…')}</p></div>` : '');
  }
  function renderChat(focus = false) {
    const chips = [[t('What is on my screen?', 'Что у меня на экране?'), t('What is on my screen? What should I tap next?', 'Что у меня на экране? Что мне нажать дальше?')], [t('Is this a scam?', 'Это мошенники?'), t('Is this message or page a scam? What should I do?', 'Это сообщение или страница от мошенников? Что мне делать?')], [t('Explain simply', 'Объясни проще'), t('Please explain it again in simpler words.', 'Объясните, пожалуйста, ещё раз проще.')]];
    $('#chat-view').innerHTML = `<button class="text-button back-link" data-action="practices">${t('← All exercises', '← Все практики')}</button><div class="chat-wrap"><p class="eyebrow">${t('AI HELPER', 'ИИ-ПОМОЩНИК')}</p><h1 id="chat-title" tabindex="-1">${t('Ask about your phone', 'Спросите про телефон')}</h1><div class="notice chat-privacy"><strong>${t('Before you attach a screenshot:', 'Перед тем как приложить скриншот:')}</strong> ${t('hide phone numbers, ID numbers, card numbers, codes and passwords. The picture is sent only to get an answer and is not saved on this site.', 'закройте номера телефонов, ИИН, номера карт, коды и пароли. Картинка отправляется только чтобы получить ответ и на сайте не сохраняется.')}</div><div class="assist-panel chat-panel"><div class="as-log chat-log" id="chat-log" aria-live="polite">${chatLogHTML()}</div><div class="as-chips">${chips.map(c => `<button type="button" class="as-chip" data-action="chat-chip" data-q="${esc(c[1])}">${c[0]}</button>`).join('')}</div><div id="chat-attach">${chatAttachHTML()}</div><form class="chat-form" id="chat-form"><label class="button secondary chat-file" tabindex="0"><span aria-hidden="true">📎</span> ${t('Screenshot', 'Скриншот')}<input type="file" accept="image/*" id="chat-file" data-testid="chat-file"></label><textarea id="chat-q" rows="2" maxlength="600" placeholder="${t('Type your question', 'Напишите вопрос')}" aria-label="${t('Your question', 'Ваш вопрос')}"></textarea><button class="button primary" type="submit" id="chat-send">${t('Send', 'Отправить')}</button></form></div></div>`;
    if (focus) { window.scrollTo({top: 0, behavior: 'instant'}); focusTitle('#chat-title'); }
  }
  function chatAttachHTML() {
    return chatState.image ? `<div class="chat-attached"><img src="${chatState.image.dataUrl}" alt=""><span>${t('Screenshot attached', 'Скриншот приложен')}</span><button type="button" class="text-button" data-action="chat-remove">${t('Remove', 'Убрать')}</button></div>` : '';
  }
  function refreshChat() {
    const log = $('#chat-log'); if (!log) return;
    log.innerHTML = chatLogHTML(); log.scrollTop = log.scrollHeight;
    $('#chat-attach').innerHTML = chatAttachHTML();
    $$('#chat-view .as-chip, #chat-send').forEach(b => { b.disabled = chatState.busy; });
  }
  function showChat() { showView('chat'); renderChat(true); }
  async function readImage(file) {
    if (!file || !/^image\//.test(file.type)) return null;
    try {
      const bmp = await createImageBitmap(file);
      const k = Math.min(1, 1100 / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.8));
      const dataUrl = c.toDataURL('image/jpeg', 0.8);
      return {blob, dataUrl, mime: 'image/jpeg', base64: dataUrl.split(',')[1]};
    } catch (_) { announce(t('This picture could not be opened. Try another one.', 'Не удалось открыть картинку. Попробуйте другую.')); return null; }
  }
  async function pickImage(file) { const img = await readImage(file); if (img) { chatState.image = img; refreshChat(); } }
  async function sendChat(text) {
    text = (text || '').trim();
    if (chatState.busy || (!text && !chatState.image)) return;
    const img = chatState.image;
    chatState.messages.push({role: 'user', text, thumb: img ? img.dataUrl : ''});
    chatState.image = null; chatState.busy = true; refreshChat();
    const history = chatState.messages.slice(0, -1).map(m => ({role: m.role === 'user' ? 'user' : 'bot', text: m.text}));
    let r;
    try { r = await AS.chat({lang: window.CSLocale.lang, text, history, image: img}); } catch (_) { r = {text: t('Something went wrong. Please try again.', 'Что-то пошло не так. Попробуйте ещё раз.'), ai: false}; }
    chatState.busy = false; chatState.messages.push({role: 'bot', text: r.text, ai: r.ai});
    refreshChat();
  }

  /* ---------- practice helper (AI or ready-made hints) ---------- */
  function assistHTML() {
    const a = active && active.assist;
    if (!a || !a.open) return '';
    const msgs = a.messages.map(m => `<div class="as-msg ${m.role}">${m.thumb ? `<img class="chat-thumb" src="${m.thumb}" alt="">` : ''}<p>${esc(m.text)}</p>${m.role === 'bot' && m.ai === false ? `<small>${t('Ready-made hint', 'Заготовленная подсказка')}</small>` : ''}</div>`).join('');
    const chips = [['again', t('Explain it differently', 'Объясни иначе')], ['icon', t('What does this icon mean?', 'Что значит этот значок?')], ['different', t('My screen looks different', 'У меня экран другой')]]
      .map(([k, label]) => `<button type="button" class="as-chip" data-action="assist-chip" data-kind="${k}"${a.busy ? ' disabled' : ''}>${label}</button>`).join('');
    return `<div class="assist-panel" role="region" aria-label="${t('Helper', 'Помощник')}"><div class="as-head"><span class="as-dot" aria-hidden="true">✦</span><strong>${t('Helper', 'Помощник')}</strong><button type="button" class="as-close" data-action="assist" aria-label="${t('Close the helper', 'Закрыть помощника')}">×</button></div><div class="as-log" aria-live="polite">${msgs || `<p class="as-empty">${t('Ask about this step. I only explain; the exercise checks your answer itself.', 'Спросите про этот шаг. Я только объясняю, а правильность ответа проверяет само упражнение.')}</p>`}${a.busy ? `<div class="as-msg bot"><p class="as-typing">${t('Thinking…', 'Думаю…')}</p></div>` : ''}</div><div class="as-chips">${chips}<label class="as-chip as-file"><span aria-hidden="true">📎</span> ${t('Send a screenshot', 'Отправить скриншот')}<input type="file" accept="image/*" id="assist-file" data-testid="assist-file"></label></div>${a.image ? `<div class="chat-attached"><img src="${a.image.dataUrl}" alt=""><span>${t('Screenshot attached. Hide numbers, codes and passwords.', 'Скриншот приложен. Закройте номера, коды и пароли.')}</span><button type="button" class="text-button" data-action="assist-remove-img">${t('Remove', 'Убрать')}</button></div>` : ''}<form class="as-form" id="assist-form"><input id="assist-q" type="text" maxlength="200" autocomplete="off" placeholder="${t('Type a question', 'Напишите вопрос')}" aria-label="${t('Your question', 'Ваш вопрос')}"><button class="button primary" type="submit"${a.busy ? ' disabled' : ''}>${t('Ask', 'Спросить')}</button></form><p class="as-note">${t('Do not type real passwords, codes or card numbers here. A screenshot is used only for the answer and is not saved.', 'Не вводите здесь настоящие пароли, коды и номера карт. Скриншот нужен только для ответа и не сохраняется.')}</p></div>`;
  }
  function refreshAssist() {
    const slot = $('#assistant-slot'); if (!slot) return;
    const keep = $('#assist-q') ? $('#assist-q').value : '';
    slot.innerHTML = assistHTML();
    const q = $('#assist-q'); if (q && keep) q.value = keep;
    const log = $('.as-log', slot); if (log) log.scrollTop = log.scrollHeight;
    const btn = $('[data-action="assist"].assist-open'); if (btn) btn.setAttribute('aria-expanded', String(active.assist.open));
  }
  async function askHelper(kind, question = '', mistake = '') {
    if (!active || active.completed || active.assist.busy) return;
    const a = active.assist, token = active.id + ':' + active.step;
    const meta = stepMeta();
    const image = a.image; a.image = null;
    if (kind === 'question') a.messages.push({role: 'user', text: question || t('Please look at my screenshot.', 'Посмотрите, пожалуйста, мой скриншот.'), thumb: image ? image.dataUrl : ''});
    else if (kind !== 'correction') a.messages.push({role: 'user', text: {again: t('Explain it differently', 'Объясни иначе'), icon: t('What does this icon mean?', 'Что значит этот значок?'), different: t('My screen looks different', 'У меня экран другой')}[kind]});
    a.open = true; a.busy = true; refreshAssist();
    const history = a.messages.slice(-6).map(m => ({role: m.role === 'user' ? 'user' : 'bot', text: m.text}));
    let r;
    try {
      r = await AS.explain({lang: window.CSLocale.lang, taskTitle: plain(getTask(active.id).title), deviceLabel: deviceLabel(), step: active.step, stepTitle: plain(meta.title), instruction: plain(meta.text), hint: plain(meta.hint), mistake: mistake ? plain(mistake) : '', attempts: (active.wrong[active.step] || 0), history, kind, question, image});
    } catch (_) { r = {text: plain(meta.hint), ai: false}; }
    if (!active || active.id + ':' + active.step !== token) return;
    a.busy = false; a.messages.push({role: 'bot', text: r.text, ai: r.ai}); a.ai = r.ai;
    refreshAssist();
  }
  function noteWrong(action, extra = '') {
    const st = active.step;
    active.wrong[st] = (active.wrong[st] || 0) + 1;
    active.lastWrong = action;
    if (active.wrong[st] >= 2 && !active.autoAsked[st]) {
      active.autoAsked[st] = true;
      askHelper('correction', '', extra || retryMessages()[action] || '');
    }
  }

  /* ---------- new situation from the assistant (scam SMS) ---------- */
  async function loadScenario() {
    const suspicious = Math.random() < 0.5;
    scenario = {loading: true, answered: null, data: null};
    renderScenario();
    const data = await AS.scenario(window.CSLocale.lang, suspicious);
    scenario = {loading: false, answered: null, data};
    renderScenario(true);
  }
  function renderScenario(focus = false) {
    if (!scenario) return;
    const ios = state.os === 'ios', phoneMode = state.device === 'phone';
    PH.os = state.os;
    const d = scenario.data;
    let sms = '';
    if (scenario.loading) sms = `<p class="sc-loading">${t('The helper is writing a new message…', 'Помощник придумывает новое сообщение…')}</p>`;
    else {
      const bubble = `<div class="sc-sms"><small>${esc(d.sender)}</small><p>${esc(d.text)}</p></div>`;
      const inner = (phoneMode ? PH.appBar(state.os, t('Message', 'Сообщение'), {back: false}) : '') + `<div class="sc-body">${bubble}</div>`;
      sms = phoneMode ? PH.frame(state.os, inner) : desk(`<div class="mock-content">${bubble}</div>`, 'mail.practice.kz');
    }
    let result = '';
    if (scenario.answered !== null) {
      const right = scenario.answered === d.suspicious;
      result = `<div class="feedback ${right ? 'success' : 'retry'}" role="status"><strong>${right ? t('Correct.', 'Верно.') : t('Not quite, and that is fine.', 'Не совсем, и это нормально.')}</strong> ${d.suspicious ? t('This message is suspicious.', 'Это сообщение подозрительное.') : t('This message is safe.', 'Это сообщение безопасное.')} ${esc(d.why)}</div><ul class="sc-signs">${d.signs.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="sc-next"><strong>${t('What to do:', 'Что делать:')}</strong> ${esc(d.next)}</p>`;
    }
    const buttons = !scenario.loading && scenario.answered === null ? `<div class="sc-actions"><button class="button primary" data-action="sc-answer" data-v="danger">${t('Suspicious', 'Опасно')}</button><button class="button secondary" data-action="sc-answer" data-v="safe">${t('Safe', 'Безопасно')}</button></div>` : '';
    const more = scenario.answered !== null ? `<div class="finish-actions"><button class="button primary" data-action="sc-new">${t('Another situation', 'Ещё ситуация')} →</button><button class="text-button" data-action="sc-exit">${t('Back to results', 'К результатам')}</button></div><p class="mock-note">${t(`Answered correctly: ${scenarioStats.ok} of ${scenarioStats.n}.`, `Верных ответов: ${scenarioStats.ok} из ${scenarioStats.n}.`)}</p>` : '';
    const label = scenario.loading || !d ? '' : (d.ai ? t('Written by the AI helper just now. All names are made up.', 'Сообщение только что написал ИИ-помощник. Все названия выдуманы.') : t('Ready-made example. All names are made up.', 'Готовый пример. Все названия выдуманы.'));
    $('#training-view').innerHTML = `<button class="text-button back-link" data-action="sc-exit">${t('← Back', '← Назад')}</button><div class="scenario"><p class="eyebrow">${t('NEW SITUATION', 'НОВАЯ СИТУАЦИЯ')}</p><h1 id="training-title" tabindex="-1">${t('Is this message safe?', 'Это сообщение безопасно?')}</h1><p>${t('Read the message. Decide: suspicious or safe? Nothing here is real.', 'Прочитайте сообщение и решите: опасное оно или безопасное. Всё здесь учебное.')}</p><div class="sc-phone">${sms}</div>${label ? `<p class="mock-note">${label}</p>` : ''}${buttons}${result}${more}</div>`;
    if (focus) focusTitle('#training-title');
  }
  function newAssist(ai = null) { return {open: false, messages: [], busy: false, ai}; }
  function resetAssist() { active.assist = newAssist(active.assist ? active.assist.ai : null); }
  function beginTask(id, bypassConfidence = false) {
    if (!ids().includes(id)) return;
    if (!bypassConfidence && !state.ratings[state.device].before) { showConfidence('before', id); return; }
    active = {id, step: 0, valid: [false, false, false, false], zoom: 100, hint: false, feedback: null, tone: '', attachment: false, completed: false, wrong: {}, autoAsked: {}, lastWrong: '', assist: newAssist()};
    scenario = null;
    showView('training');
    renderTraining(true);
  }

  /* ---------- building blocks for practice screens ---------- */
  function choice(text, action, extra = '') { return `<button type="button" class="answer-button" data-sim="${action}" ${extra}>${text}</button>`; }
  function mockButton(text, action, symbol = '', extra = '', icon = '') {
    const phone = state.device === 'phone';
    const mark = phone ? (icon ? PH.ic(icon, 22) : '') : symbol;
    return `<button type="button" class="mock-icon-button" data-sim="${action}" ${extra}>${mark ? `<span class="symbol" aria-hidden="true">${mark}</span>` : ''}<span>${text}</span></button>`;
  }
  function options(items) { return `<div class="answer-list">${items.map((item, i) => choice(`<span class="choice-letter" aria-hidden="true">${i + 1}</span><span>${item[0]}</span>`, item[1], item[2] || '')).join('')}</div>`; }
  function mountain(w = 90, h = 65) {
    return `<svg viewBox="0 0 90 65" width="${w}" height="${h}" role="img" aria-label="${t('Practice photo of mountains', 'Учебная фотография гор')}"><rect width="90" height="65" rx="5" fill="#dce9e3"/><circle cx="66" cy="17" r="7" fill="#d4ae65"/><path d="M0 65 29 24 53 53 67 38 90 65" fill="#537c6c"/><path d="m20 37 9-13 11 14-12-4" fill="#fcfbf6"/></svg>`;
  }
  function filePreview() { return `<div class="sample-file">${mountain()}<span><strong>Practice_photo.jpg</strong><small>${t('Sample file · no personal data', 'Вымышленный файл · личных данных нет')}</small></span></div>`; }

  function appIcon(kind, label, action, testid, withLabel = true) {
    const source = appIconSource(kind, state.device === 'phone' ? state.os : state.dos);
    return `<button type="button" class="app-ico" data-sim="${action}" ${testid ? `data-testid="${testid}"` : ''} aria-label="${label}"><span class="app-tile k-${kind}"><img src="${source}" alt="" loading="lazy"></span>${withLabel ? `<span class="app-label">${label}</span>` : ''}</button>`;
  }
  const embedded = key => (window.CSIconData && window.CSIconData[key]) ? 'data:image/webp;base64,' + window.CSIconData[key] : '';
  function appIconSource(kind, platform) {
    const own = platform === 'android' ? embedded('a_' + kind) : platform === 'ios' ? embedded('i_' + kind) : '';
    if (own) return own;
    const iosBase = 'https://raw.githubusercontent.com/SysAdminDoc/iOSIconPack/master/app/src/main/res/drawable-xxxhdpi/ios18_';
    const iosNames = {photos: 'photos', clock: 'clock', sun: 'weather', doc: 'notes', mail: 'mail', gear: 'settings', phone: 'phone', chat: 'messages', globe: 'safari', camera: 'camera'};
    const android = {
      photos: 'https://play-lh.googleusercontent.com/kErBTF4VcGwhtKbCr80Bs2R1lNZiYkHbKcf1i3ZF6dg_5LqDAlCI4wU-nzwvo7PAbxeBXM_tv1hc11gr4aIIW-Q%3Dw240-h480',
      clock: 'https://play-lh.googleusercontent.com/bMXVYcZZKB873HmUFhaqOOakT5ZETbOpzv1-YvZ6Qs-hPEXeYw3zzkPm38GAz6E3D7JpUFpiQy7RR4nkktSnf0E%3Dw240-h480',
      sun: 'https://play-lh.googleusercontent.com/GofPlba0pw2dK3-Ikm5ROeXwK3MnC8CelJRt_azT_75uQ8-9dvoDAS2zLrtdk_Z_D2jyZ8hXIfzVj1Rnhnioo2Y%3Dw240-h480',
      doc: 'https://play-lh.googleusercontent.com/0AM0MfDO-MWUAKwg8vpbftm7GqvEW1JfLGHCgwsgIemF6hMW61XOVnnNDHCGeRMiYZtVaxV2M-AYoP_zMoJt6w%3Dw240-h480',
      mail: 'https://play-lh.googleusercontent.com/c6KD_8-GvnGRJA4lRQ4y5YnUa3-LOeYAS7ubw1jWyB9bmr6Kj6zzRvh2A5WBB-Vd3e6zhElmhDv07fCJx2Fc%3Dw240-h480',
      gear: 'https://raw.githubusercontent.com/aosp-mirror/platform_packages_apps_settings/main/res/mipmap-xxxhdpi/ic_launcher_settings.png',
      phone: 'https://play-lh.googleusercontent.com/b0ipxfvtgDE5kT8PscD8hggLVWrP5Zodu2EwIPN0ub-3UBJ7CosIHCP0V9pSjV-hPdXQjd7u7JP2gGMrfSMZmA%3Dw240-h480',
      chat: 'https://play-lh.googleusercontent.com/Mgukz1fq2stUYX_lQf79gmMeDzNvRCu5eobmiJwNkXl4riNY6HZ3VB-HRW5QciwEuLnFyk_ZmHumvn8RJ5Um%3Dw240-h480',
      globe: 'https://play-lh.googleusercontent.com/gbkzfC3R1fXcGR4Uag1uRSN_123Tpo_KxhVZFLFCatmthFuO1bzPczUomFtxI42YYEQMJeAaZuIFVrTF58gZYg%3Dw240-h480',
      camera: 'https://play-lh.googleusercontent.com/boOY2KNmAAJVT_Rmiu-mg85qCyORmXDAng1pPZuAOnOpqqvBM3lBsVvpWOvrk0zjmkSUn9kpRutkcmSkv61E%3Dw240-h480'
    };
    if (platform === 'android') return android[kind] || android.globe;
    if (platform === 'windows') {
      const windows = {globe: 'microsoftedge', doc: 'microsoftword', mail: 'microsoftoutlook', gear: 'windows11'};
      return `https://cdn.simpleicons.org/${windows[kind] || 'windows11'}`;
    }
    if (kind === 'gear') return 'https://developer.apple.com/assets/elements/icons/settings-ios/settings-ios-256x256_2x.png';
    return `${iosBase}${iosNames[kind] || 'safari'}.png`;
  }
  function dockIcon(name) {
    if (state.dos === 'mac') {
      const macDock = {
        finder: embedded('m_finder') || 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Finder_Icon_macOS_Tahoe.png',
        globe: embedded('i_globe') || 'https://cdn.simpleicons.org/safari',
        gear: embedded('i_gear') || 'https://developer.apple.com/assets/elements/icons/settings-ios/settings-ios-256x256_2x.png'
      };
      return `<img src="${macDock[name] || appIconSource(name, 'ios')}" alt="" loading="lazy">`;
    }
    return `<img src="${appIconSource(name, state.dos)}" alt="" loading="lazy">`;
  }
  function taskbarIcon(name) {
    const icons = {
      explorer: embedded('w_explorer') || 'https://img.icons8.com/fluent/1200/windows-explorer.jpg',
      chrome: embedded('a_globe') || 'https://play-lh.googleusercontent.com/gbkzfC3R1fXcGR4Uag1uRSN_123Tpo_KxhVZFLFCatmthFuO1bzPczUomFtxI42YYEQMJeAaZuIFVrTF58gZYg%3Dw240-h480'
    };
    return `<img src="${icons[name]}" alt="" loading="lazy">`;
  }
  function setRow(icon, color, title, sub, action, testid) {
    const ios = state.os === 'ios';
    return `<button type="button" class="set-row" data-sim="${action}" ${testid ? `data-testid="${testid}"` : ''}><span class="set-ic" style="--c:${color}">${PH.ic(icon, ios ? 18 : 22)}</span><span class="set-t"><strong>${title}</strong>${!ios && sub ? `<small>${sub}</small>` : ''}</span>${ios ? `<span class="set-chev">${PH.ic('chev', 16)}</span>` : ''}</button>`;
  }
  function browserShell(url, body, lock) {
    const ios = state.os === 'ios';
    const bar = ios
      ? `<div class="ios-url"><span class="u-aa" aria-hidden="true">aA</span><span class="u-text">${lock ? PH.ic('lock', 13) : ''}${url}</span><span class="u-r" aria-hidden="true">${PH.ic('reload', 17)}</span></div>`
      : `<div class="cr-bar" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="#444746" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg><span class="cr-pill">${lock ? '<svg viewBox="0 0 24 24" width="17" height="17"><path fill="#5f6368" d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>' : PH.ic('search', 17)}<span class="cr-u">${url}</span></span><span class="cr-tabs">1</span><svg viewBox="0 0 24 24" width="22" height="22"><path fill="#444746" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></div>`;
    return `<div class="browser ${ios ? 'b-ios' : 'b-and'}">${ios ? `<div class="b-body">${body}</div>${bar}` : `${bar}<div class="b-body">${body}</div>`}</div>`;
  }
  function pickRow(kind, name, sub, action, testid) {
    const thumb = kind === 'photo' ? mountain(56, 42) : PH.ic('doc', 34);
    return `<button type="button" class="pick-row" data-sim="${action}" data-testid="${testid || ''}"><span class="pick-th ${kind}">${thumb}</span><span class="pick-t"><strong>${name}</strong><small>${sub}</small></span></button>`;
  }

  /* ---------- step text ---------- */
  /* text of one step; defaults to the step on screen, the cheat sheet asks for any lesson and step */
  function stepMeta(id = active.id, s = active.step) {
    if (lessonIds.includes(id)) { const st = lessons()[id].steps[s]; return {title: t(...st.title), text: t(...st.text), hint: t(...st.hint)}; }
    const phone = state.device === 'phone', ios = state.os === 'ios';
    const m = {
      text: [
        {title: phone ? t('Open settings', 'Откройте настройки') : state.dos === 'mac' ? t('Open Safari’s View menu', 'Откройте меню «Вид» в Safari') : t('Open the Chrome menu', 'Откройте меню Chrome'),
          text: phone ? t('Find the gear icon “Settings” on the home screen and tap it.', 'Найдите на главном экране значок шестерёнки «Настройки» и нажмите на него.') : state.dos === 'mac' ? t('Choose “View” in the Safari menu bar at the top of the screen.', 'В верхней строке меню Safari выберите «Вид».') : t('Select the three-dot menu at the top right of Chrome.', 'Нажмите на меню с тремя точками в правом верхнем углу Chrome.'),
          hint: phone ? t('A gear icon ⚙ means settings. The other icons open other apps. If you tap one by mistake, nothing will break.', 'Шестерёнка ⚙ означает настройки. Остальные значки открывают другие приложения. Если нажать не туда, ничего не сломается.') : state.dos === 'mac' ? t('Safari’s menus are in the macOS menu bar, above the browser window.', 'Меню Safari находятся в строке меню macOS над окном браузера.') : t('Three dots ⋮ open Chrome’s menu with more options.', 'Три точки ⋮ открывают меню Chrome с дополнительными действиями.')},
        {title: phone ? t('Find text size', 'Найдите размер текста') : t('Find zoom', 'Найдите масштаб'),
          text: phone ? (ios ? t('In settings, tap “Display & Brightness”.', 'В настройках нажмите «Экран и яркость».') : t('In settings, tap “Display”.', 'В настройках нажмите «Дисплей».')) : t('In the open menu, select “Page zoom”.', 'В открытом меню выберите «Масштаб страницы».'),
          hint: phone ? (ios ? t('On an iPhone, text size is inside “Display & Brightness”. On other phones the name may be different.', 'На iPhone размер текста находится в разделе «Экран и яркость». На других телефонах название может отличаться.') : t('On Android, look for “Display”. On some phones it is called “Screen” or “Accessibility”. Names differ between makers.', 'На Android ищите раздел «Дисплей». На некоторых телефонах он называется «Экран» или «Специальные возможности». У разных производителей названия отличаются.')) : t('Zoom makes everything on the page larger. In many real browsers, you can also use Ctrl and +, or Command and + on a Mac.', 'Масштаб увеличивает всё содержимое страницы. В реальном браузере также часто работают клавиши Ctrl и +, а на Mac — Command и +.')},
        {title: t('Increase text size to 120%', 'Увеличьте текст до 120%'), text: t('Select plus twice. Watch the text below the buttons change.', 'Нажмите плюс два раза. Посмотрите, как меняется текст.'), hint: t('Plus + makes it larger; minus − makes it smaller. You can try both. It is safe to make mistakes here.', 'Плюс + увеличивает, минус − уменьшает. Вы можете попробовать оба направления; ошибиться здесь безопасно.')},
        {title: t('Check the result', 'Проверьте результат'), text: t('The text is larger. Confirm that you noticed the change.', 'Текст стал крупнее. Подтвердите, что вы заметили изменение.'), hint: t('On your own device, choose the size that feels comfortable for you. The 120% size in this exercise is just an example.', 'В реальной жизни выбирайте размер, который удобен именно вам. 120% в этом упражнении — только пример.')}
      ],
      address: [
        {title: t('Choose the exact official address', 'Выберите точный официальный адрес'),
          text: t(`Imagine you have ${phone ? 'opened a browser on your phone' : 'opened a browser on your computer'}. For this exercise, find egov.kz with no extra words or changed letters.`, `Представьте, что вы ${phone ? 'открыли браузер на телефоне' : 'открыли браузер на компьютере'}. Для этого задания найдите адрес egov.kz без добавлений и замен букв.`),
          hint: t('Read the whole address. The number 0 looks like the letter o. Extra words or a different ending can lead to another website. The addresses below are only text choices within this exercise.', 'Читайте адрес целиком. Цифра 0 похожа на букву o. Добавленные слова и другой конец адреса могут вести на другой сайт. Адреса ниже — только текстовые варианты внутри упражнения.')},
        {title: t('Open the service information', 'Откройте информацию об услуге'), text: t('You have checked the address. Now find “Centre information”. We use fictional information so you can practise without pressure.', 'Адрес проверен. Теперь найдите раздел «Информация о работе центра». Мы используем вымышленные сведения, чтобы спокойно потренироваться.'),
          hint: phone ? t('On a phone, a section often appears as a large row or tile. Tap the section name.', 'На телефоне нужный раздел часто выглядит как крупная строка или плитка. Нажмите на название раздела.') : t('On a computer, you usually open a section by clicking its name or a button. Use the text to choose here.', 'На компьютере раздел обычно открывается щелчком по названию или кнопке. Сейчас выбирайте по тексту.')},
        {title: t('Find opening hours', 'Найдите часы работы'), text: t('Select “Opening hours”. Before contacting a real service, it helps to read its requirements and schedule.', 'Откройте пункт «Часы работы». В реальном обращении полезно сначала прочитать условия и расписание.'), hint: t('Look for words related to your question. You do not need to open every section.', 'Ищите конкретные слова, связанные с вашим вопросом. Не обязательно открывать каждый раздел подряд.')},
        {title: t('Read and choose an answer', 'Прочитайте и выберите ответ'), text: t('According to this practice schedule, when is the centre open?', 'Согласно учебному расписанию, когда открыт центр?'), hint: t('Check your answer against the information on the screen. This is not a memory test: the schedule stays in view.', 'Сверьте ответ с информацией на экране. Здесь нет проверки памяти: расписание остаётся перед вами.')}
      ],
      file: [
        {title: t('Find the attach button', 'Найдите кнопку прикрепления'), text: t(`In the practice message, tap “Attach file”. ${phone ? 'On a phone, this is often a paperclip or plus icon.' : 'On a computer, the button is usually near the message box.'}`, `В учебном обращении нажмите «Прикрепить файл». ${phone ? 'На телефоне это часто значок скрепки или плюса.' : 'На компьютере кнопка обычно находится рядом с полем сообщения.'}`),
          hint: t('The paperclip or plus icon can look different across apps. Look for the label “Attach” too. No files on your device will be opened.', 'Значок скрепки или плюса в разных приложениях выглядит по-разному. Ориентируйтесь также на подпись «Прикрепить». Никакие файлы с вашего устройства не открываются.')},
        {title: t('Choose the practice photo', 'Выберите учебную фотографию'), text: t('The file you need is “Practice_photo.jpg”. Select it from the practice list.', 'Нужный файл называется «Practice_photo.jpg». Выберите его из готового учебного списка.'), hint: t('The file name helps you identify the file you need. Photos often have a .jpg ending. All files shown here are fictional.', 'Имя файла помогает отличить нужный документ от других. Окончание .jpg часто используется у фотографий. Здесь представлены только вымышленные файлы.')},
        {title: t('Check the message and file', 'Проверьте обращение и файл'), text: t('Check that “Practice_photo.jpg” is attached and the message says what you want. Then select “All checked”.', 'Убедитесь, что прикреплена «Practice_photo.jpg» и текст обращения подходит. Затем нажмите «Всё проверено».'), hint: t('Before sending, check the recipient, message and attachment. You can return to the previous step with “Back”.', 'Полезная привычка перед отправкой: проверить получателя, текст и вложение. На предыдущий шаг можно вернуться кнопкой «Назад».')},
        {title: t('Confirm the practice send', 'Подтвердите учебную отправку'), text: t('You have checked the file and message. Select “Send practice message” to finish the exercise.', 'Файл и текст проверены. Нажмите «Отправить учебно», чтобы закончить упражнение.'), hint: t('In a real app, this button may send a message to the recipient. Here, it only finishes the exercise: there is no network request, recipient or real send.', 'В настоящем приложении эта кнопка может отправить сообщение получателю. Здесь она только завершает упражнение: сети, получателя и реальной отправки нет.')}
      ],
      message: [
        {title: t('Can you spot the warning sign?', 'Заметите, что настораживает?'), text: t(`${phone ? 'A message has arrived on the phone' : 'A message is open on the computer'}. Read this practice example and choose the warning sign.`, `${phone ? 'На телефон пришло сообщение' : 'На компьютере открыто сообщение'}. Прочитайте учебный пример и выберите тревожный признак.`), hint: t('Scammers may pressure you to act quickly and pretend to be a familiar organisation. A request to share a text message code with another person is a warning sign.', 'Мошенники могут торопить человека и представляться знакомой организацией. Просьба передать код из SMS другому человеку — опасный сигнал.')},
        {title: t('Choose a safe next step', 'Выберите безопасный следующий шаг'), text: t('When a message pressures you to act quickly and asks for a code, you can pause. What will you do?', 'Когда сообщение торопит и просит код, можно остановиться. Что вы сделаете?'), hint: t('Do not share the text message code with the sender. Take time before replying, even if the message looks convincing.', 'Код из SMS не нужно пересылать собеседнику. Не отвечайте в спешке, даже если сообщение выглядит убедительно.')},
        {title: t('Check with a trusted contact', 'Проверьте через надёжный контакт'), text: t('If you are worried about your application, how should you find help?', 'Если переживаете за заявку, как лучше найти помощь?'), hint: t('Find the official website yourself and check the address carefully. Use the contact details listed there. You can ask someone you trust to help you check, without sharing the code.', 'Найдите официальный сайт самостоятельно, внимательно проверив адрес. Связаться можно по контакту, найденному там. Можно попросить близкого человека помочь с проверкой, не передавая ему код.')},
        {title: t('Close the suspicious message', 'Закройте подозрительное сообщение'), text: t('You noticed the pressure, kept the code private and chose a reliable way to check. Close the practice message.', 'Вы заметили давление, не передали код и выбрали надёжный способ проверки. Закройте учебное сообщение.'), hint: t('If you have already shared information, contact the organisation using official details you find yourself. Here, we practise the first safe step: pause and check.', 'Если уже передали данные, обратитесь в соответствующую организацию по самостоятельно найденному официальному контакту. Здесь мы тренируем первый безопасный шаг: остановиться и проверить.')}
      ]
    };
    return m[id][s];
  }


  /* ---------- computer frame (Windows / Mac) ---------- */
  function deskUrl() {
    if (lessonIds.includes(active.id)) { const st = lessons()[active.id].steps[active.step]; if (st.url !== undefined) return st.url; }
    if (active.id === 'address') return active.step === 0 ? '' : 'egov.kz';
    return {text: 'practice.kz/reading', file: 'learning-centre.kz', message: 'mail.practice.kz'}[active.id];
  }
  function desk(inner, url, app) {
    const mac = state.dos === 'mac';
    const I = (n, z) => PH.ic(n, z, 'android');
    const browserName = mac ? 'Safari' : 'Google Chrome';
    const browserMark = mac
      ? `<img class="w-brand" src="${embedded('i_globe')}" alt="">`
      : `<img class="w-brand" src="${embedded('a_globe')}" alt="">`;
    const urlPill = `<div class="w-url" aria-hidden="true"><span>${url && url.startsWith('!') ? '<b style="color:#c5221f;font-weight:500;font-size:12px">⚠ ' + t('Not secure', 'Не защищено') + '</b>' : url ? I('lock', 13) : I('search', 15)}</span><span class="w-url-t">${(url || '').replace(/^!/, '') || t('Search or enter address', 'Поиск или адрес')}</span></div>`;
    const nav = `<span class="w-nav" aria-hidden="true"><i>${I('back', 18)}</i><i class="fwd">${I('back', 18)}</i><i>${I('reload', 17)}</i></span>`;
    const tab = `<span class="w-tab">${browserMark}<em>${t('Practice', 'Практика')}</em><b>×</b></span>`;
    const win = `<div class="win ${mac ? 'browser-safari' : 'browser-chrome'}">${mac
      ? `<div class="w-title"><span class="lights"><i class="r"></i><i class="y"></i><i class="g"></i></span>${tab}<span class="w-plus">+</span></div><div class="w-tool"><span class="browser-tool" aria-hidden="true">☷</span>${nav}${urlPill}<span class="browser-tool" aria-hidden="true">↥</span></div>`
      : `<div class="w-title">${tab}<span class="w-plus">+</span><span class="w-ctl"><i>—</i><i>▢</i><i>✕</i></span></div><div class="w-tool">${nav}${urlPill}<span class="browser-tool" aria-hidden="true">☆</span><span class="w-dots">⋮</span></div>`}<div class="w-body">${inner}</div></div>`;
    let wv = win;
    if (app && app.desktop) wv = `<div class="desk-icons">${inner}</div>`;
    else if (app) wv = `<div class="win app-win">${mac
      ? `<div class="w-title app"><span class="lights"><i class="r"></i><i class="y"></i><i class="g"></i></span><span class="aw-t"><img src="${app.icon}" alt="">${app.name}</span></div>`
      : `<div class="w-title app"><span class="aw-t"><img src="${app.icon}" alt="">${app.name}</span><span class="w-ctl"><i>—</i><i>▢</i><i>✕</i></span></div>`}<div class="w-body">${inner}</div></div>`;
    const appTask = app && !app.desktop ? `<i class="task-app on"><img src="${app.icon}" alt=""></i>` : '';
    if (mac) return `<div class="desk os-mac" data-testid="desk-frame"><div class="mac-menu" aria-hidden="true"><strong>${app && !app.desktop ? app.name : app ? 'Finder' : 'Safari'}</strong><span>${t('File', 'Файл')}</span><span>${t('Edit', 'Правка')}</span><span>${t('View', 'Вид')}</span><span>${t('History', 'История')}</span><span>${t('Bookmarks', 'Закладки')}</span><span>${t('Window', 'Окно')}</span><span>${t('Help', 'Помощь')}</span><span class="sp"></span><span>Tue 9:41</span></div><div class="wall">${wv}</div><div class="dock-bar" aria-hidden="true"><i>${dockIcon('finder')}</i><i>${dockIcon('globe')}</i>${appTask}<i>${dockIcon('chat')}</i><i>${dockIcon('photos')}</i><i>${dockIcon('mail')}</i><i class="dock-settings">${dockIcon('gear')}</i></div></div>`;
    return `<div class="desk os-win" data-testid="desk-frame"><div class="wall">${wv}</div><div class="taskbar" aria-hidden="true"><span class="tb-logo"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#0078d4" d="M1 4.7 10.7 3.3v8.1H1zm11.1-1.6L23 1.5v9.9H12.1zM1 12.8h9.7v8.1L1 19.5zm11.1 0H23v9.9l-10.9-1.6z"/></svg></span><span class="tb-s">${I('search', 15)}</span><i class="task-app">${taskbarIcon('explorer')}</i><i class="task-app task-chrome">${taskbarIcon('chrome')}</i>${appTask}<span class="tb-clock">9:41<br>27.10.2026</span></div></div>`;
  }

  /* ---------- practice screens (phone: iPhone/Android skins, computer: browser window) ---------- */
  function screen() {
    PH.os = state.os;
    const phone = state.device === 'phone', ios = state.os === 'ios', id = active.id, s = active.step;
    const wrap = (h, o) => phone ? PH.frame(state.os, h, o) : desk(h, deskUrl());
    const bar = (title, o = {}) => phone ? PH.appBar(state.os, title, o) : `<div class="mock-bar"><span>${title}</span><span aria-hidden="true">${o.right || ''}</span></div>`;
    const back = label => ({back: ios && label && label.length <= 7 ? label : ''});
    if (lessonIds.includes(id)) {
      const st = lessons()[id].steps[s], body = st.view();
      const deskApp = ['whatsapp', 'telegram'].includes(id) ? {name: id === 'whatsapp' ? 'WhatsApp' : 'Telegram', icon: embedded('x_' + id)} : null;
      if (!phone && st.pc) return desk(st.pc(), st.pcUrl || '');
      if (st.home) return phone ? wrap(body, {home: true, dark: true}) : deskApp ? desk(body, '', {desktop: true}) : wrap(`<div class="pc-apps">${body}</div>`);
      if (!phone && deskApp) return desk(body, '', deskApp);
      if (st.scene) return body;
      if (st.skin) return wrap(body);
      return wrap(bar(t(...st.bar), back(t('Back', 'Назад'))) + body);
    }

    if (id === 'text') {
      if (s === 0) {
        if (!phone) return wrap(`<div class="mock-bar"><span>${state.dos === 'mac' ? 'Safari' : 'Google Chrome'}</span><button class="hint-button" aria-label="${state.dos === 'mac' ? t('Open View menu', 'Открыть меню «Вид»') : t('Open Chrome menu', 'Открыть меню Chrome')}" data-sim="correct" data-testid="sim-settings">${state.dos === 'mac' ? t('View', 'Вид') : '⋮'}</button></div><div class="mock-content"><h3>${t('A page to read', 'Страница для чтения')}</h3><p>${t('Text on a page can sometimes be too small. You can make it larger.', 'Бывает, что текст на странице слишком мелкий. Его можно увеличить.')}</p><p class="mock-note">${t('Let us try it in the practice browser.', 'Потренируемся в учебном браузере.')}</p></div>`);
        const grid = [['photos', t('Photos', 'Фото'), 'wrong-app'], ['clock', t('Clock', 'Часы'), 'wrong-app'], ['sun', t('Weather', 'Погода'), 'wrong-app'], ['doc', t('Notes', 'Заметки'), 'wrong-app'], ['mail', t('Mail', 'Почта'), 'wrong-app'], ['gear', t('Settings', 'Настройки'), 'correct', 'sim-settings']];
        const dock = [['phone', t('Phone', 'Телефон')], ['chat', t('Messages', 'Сообщения')], ['globe', t('Browser', 'Браузер')], ['camera', t('Camera', 'Камера')]];
        return wrap(`<div class="home-top">${ios ? '' : `<div class="home-date"><strong>${t('Tue, Oct 27', 'Вт, 27 окт')}</strong><span>18°</span></div>`}</div><div class="app-grid">${grid.map(g => appIcon(g[0], g[1], g[2], g[3])).join('')}</div><div class="home-bottom">${ios ? '' : `<div class="g-search" aria-hidden="true">${PH.ic('search', 18)}<span>${t('Search', 'Поиск')}</span></div>`}<div class="dock">${dock.map(d => appIcon(d[0], d[1], 'wrong-app', '', false)).join('')}</div></div>`, {home: true, dark: true});
      }
      if (s === 1) {
        if (!phone) return wrap(`<div class="mock-bar"><span>${state.dos === 'mac' ? t('Safari · View', 'Safari · Вид') : t('Google Chrome menu', 'Меню Google Chrome')}</span><span aria-hidden="true">${state.dos === 'mac' ? '⌘' : '⋮'}</span></div><div class="mock-menu"><button data-sim="retry-settings">${state.dos === 'mac' ? t('Show Sidebar', 'Показать боковую панель') : t('History', 'История')} <span aria-hidden="true">›</span></button><button data-sim="correct" data-testid="sim-text-menu">${state.dos === 'mac' ? t('Zoom In', 'Увеличить') : t('Page zoom', 'Масштаб страницы')} <span aria-hidden="true">›</span></button><button data-sim="retry-settings">${state.dos === 'mac' ? t('Actual Size', 'Фактический размер') : t('Downloads', 'Загрузки')} <span aria-hidden="true">›</span></button></div>`);
        if (ios) return wrap(`<div class="set-title">${t('Settings', 'Настройки')}</div><div class="set-search" aria-hidden="true">${PH.ic('search', 16)}<span>${t('Search', 'Поиск')}</span></div><div class="set-group">${setRow('wifi', '#007aff', 'Wi‑Fi', '', 'retry-settings')}${setRow('bell', '#ff3b30', t('Notifications', 'Уведомления'), '', 'retry-settings')}${setRow('sound', '#ff2d55', t('Sounds & Haptics', 'Звуки, тактильные сигналы'), '', 'retry-settings')}</div><div class="set-group">${setRow('sun', '#007aff', t('Display & Brightness', 'Экран и яркость'), '', 'correct', 'sim-text-menu')}${setRow('battery', '#34c759', t('Battery', 'Аккумулятор'), '', 'retry-settings')}</div>`);
        return wrap(`<div class="set-title">${t('Settings', 'Настройки')}</div><div class="set-search" aria-hidden="true">${PH.ic('search', 18)}<span>${t('Search settings', 'Поиск по настройкам')}</span></div><div class="set-group">${setRow('wifi', '#0b57d0', t('Network & internet', 'Сеть и интернет'), t('Wi‑Fi, mobile network', 'Wi‑Fi, мобильная сеть'), 'retry-settings')}${setRow('bell', '#b3261e', t('Notifications', 'Уведомления'), t('Notification history', 'История уведомлений'), 'retry-settings')}${setRow('sound', '#7d5260', t('Sound & vibration', 'Звук и вибрация'), t('Volume, haptics', 'Громкость, вибрация'), 'retry-settings')}${setRow('sun', '#146c2e', t('Display', 'Дисплей'), t('Dark theme, font size', 'Тёмная тема, размер шрифта'), 'correct', 'sim-text-menu')}${setRow('battery', '#6750a4', t('Battery', 'Батарея'), '82%', 'retry-settings')}</div>`);
      }
      if (s === 2) {
        const pct = (active.zoom - 80) / 70 * 100;
        const slider = phone ? `<div class="size-slider" aria-hidden="true"><span class="sm">A</span><span class="trk"><i id="size-thumb" style="left:${pct}%"></i></span><span class="lg">A</span></div>` : '';
        const body = `<div class="mock-content"><h3>${t('A comfortable size', 'Удобный размер')}</h3><div class="zoom-controls"><button aria-label="${t('Make text smaller', 'Уменьшить текст')}" data-sim="zoom-minus" data-testid="zoom-minus">−</button><output id="zoom-value" aria-live="polite">${active.zoom}%</output><button aria-label="${t('Make text larger', 'Увеличить текст')}" data-sim="zoom-plus" data-testid="zoom-plus">+</button></div>${slider}<div class="sample-reading" id="reading-sample" style="font-size:${active.zoom}%"><strong>${t('It starts with one step.', 'Всё начинается с шага.')}</strong>${t('You can make this text easier to read.', 'Этот текст можно сделать удобнее для чтения.')}</div></div>`;
        return wrap(bar(phone ? (ios ? t('Text Size', 'Размер текста') : t('Font size', 'Размер шрифта')) : t('Page zoom', 'Масштаб страницы'), {...back(t('Display', 'Экран')), right: 'Aa'}) + body);
      }
      return wrap(bar(phone ? t('Result', 'Результат') : t('Checking the result', 'Проверка результата'), {...back(t('Back', 'Назад')), right: active.zoom + '%'}) + `<div class="mock-content"><div class="sample-reading" style="font-size:${active.zoom}%"><strong>${t('This feels comfortable.', 'Теперь мне удобно.')}</strong>${t('I can change the text size and return to settings.', 'Я могу изменить размер текста и вернуться к настройкам.')}</div><div style="margin-top:23px">${mockButton(t('Yes, the text is larger', 'Да, текст стал крупнее'), 'correct', '✓', 'data-testid="sim-verify-text"', 'check')}</div><p class="mock-note">${t('Your own device may use a different way to change the size.', 'На настоящем устройстве размер может меняться другим способом.')}</p></div>`);
    }

    if (id === 'address') {
      const domainOpts = options([['<span class="domain-choice">egov-kz.help</span>', 'wrong-domain'], ['<span class="domain-choice">egov.kz</span>', 'correct', 'data-testid="official-address"'], ['<span class="domain-choice">eg0v.kz</span>', 'wrong-domain']]);
      const page = (url, body) => phone ? wrap(browserShell(url, body, true)) : wrap(body);
      if (s === 0) {
        const body = `<div class="mock-content"><h3>${t('Which address should you choose?', 'Куда перейти?')}</h3>${domainOpts}<p class="mock-note">${t('None of these choices opens an external website.', 'Ни один вариант не откроет внешний сайт.')}</p></div>`;
        return phone ? wrap(browserShell('egov', body, false)) : wrap(bar(t('Computer browser', 'Браузер компьютера'), {right: '⌕'}) + body);
      }
      const stamp = `<div class="training-stamp">${t('Practice screen · not an official service', 'Учебный макет · не официальный сервис')}</div>`;
      if (s === 1) return page('egov.kz', `${stamp}<div class="mock-content"><h3>${t('Information you need', 'Нужная информация')}</h3>${mockButton(t('Centre information', 'Информация о работе центра'), 'correct', '▤', 'data-testid="service-info"', 'doc')}${mockButton(t('Practice portal news', 'Новости учебного портала'), 'wrong-service', '☷', '', 'doc')}<p class="mock-note">${t('The information on this screen is fictional.', 'Содержимое экрана вымышлено.')}</p></div>`);
      if (s === 2) return page('egov.kz', `<div class="mock-content"><div class="service-card"><small>${t('Fictional learning centre', 'Вымышленный учебный центр')}</small><h3>${t('Centre information', 'Информация о работе центра')}</h3></div>${mockButton(t('Opening hours', 'Часы работы'), 'correct', '◷', 'data-testid="opening-hours"', 'clock')}${mockButton(t('Centre history', 'История центра'), 'wrong-service', '☷', '', 'doc')}</div>`);
      return page('egov.kz', `<div class="mock-content"><div class="service-card"><small>${t('Fictional information for this exercise', 'Вымышленные данные для упражнения')}</small><h3>${t('Monday–Friday', 'Понедельник — пятница')}</h3><p>09:00–18:00<br>${t('Saturday and Sunday — closed', 'Суббота и воскресенье — выходные')}</p></div>${options([[t('Every day, including weekends', 'Каждый день без выходных'), 'wrong-hours'], [t('Weekdays, 09:00–18:00', 'По будням, с 09:00 до 18:00'), 'correct', 'data-testid="hours-answer"']])}</div>`);
    }

    if (id === 'file') {
      const msg = t('Hello! I would like to know when the class starts. I have attached a practice photo.', 'Здравствуйте! Хочу узнать, когда начнётся учебное занятие. Прикладываю учебную фотографию.');
      const SV = (d, c = 'currentColor', z = 22) => `<svg viewBox="0 0 24 24" width="${z}" height="${z}" aria-hidden="true"><path fill="${c}" d="${d}"/></svg>`;
      const P = {
        clip: 'M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z',
        send: 'M2.01 21 23 12 2.01 3 2 10l15 2-15 2z', back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
        more: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
        photo: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
        cam: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z',
        doc: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
        up: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z'
      };
      const atBtn = (inner, cls = '') => `<button type="button" class="ml-ic ${cls}" data-sim="correct" data-testid="attach-button" aria-label="${t('Attach file', 'Прикрепить файл')}">${inner}</button>`;
      const sendBtn = inner => `<button type="button" class="ml-send" data-sim="correct" data-testid="send-training" aria-label="${t('Send', 'Отправить')}">${inner}</button>`;
      const head = (sendable, attachHere) => ios
        ? `<div class="ml-head ios"><span class="ml-cancel">${t('Cancel', 'Отменить')}</span><strong>${t('New Message', 'Новое сообщение')}</strong>${sendable ? sendBtn(SV(P.up, '#fff', 20)) : `<span class="ml-send off">${SV(P.up, '#fff', 20)}</span>`}</div>`
        : `<div class="ml-head and">${SV(P.back, '#1f1f1f', 24)}<strong>${t('Compose', 'Написать')}</strong>${attachHere ? atBtn(SV(P.clip, '#1f1f1f', 24)) : `<span class="ml-ic">${SV(P.clip, '#1f1f1f', 24)}</span>`}${sendable ? sendBtn(SV(P.send, '#0b57d0', 24)) : `<span class="ml-ic">${SV(P.send, '#1f1f1f', 24)}</span>`}${SV(P.more, '#1f1f1f', 24)}</div>`;
      const fields = `<div class="ml-f"><span>${t('To:', 'Кому:')}</span><b class="ml-chip">${t('Learning centre', 'Учебный центр')}</b></div>${ios ? `<div class="ml-f"><span>${t('Cc/Bcc, From:', 'Копия/Скрытая, От:')}</span><em>gulnara@practice.kz</em></div>` : `<div class="ml-f"><span>${t('From', 'От')}</span><em>gulnara@practice.kz</em></div>`}<div class="ml-f"><span>${ios ? t('Subject:', 'Тема:') : ''}</span><em class="dark">${t('A question about a class', 'Вопрос о занятии')}</em></div>`;
      const attached = ios
        ? `<div class="ml-inline">${mountain(150, 108)}</div>`
        : `<div class="ml-att">${mountain(44, 32)}<span><b>Practice_photo.jpg</b><small>1,2 ${t('MB', 'МБ')}</small></span><i>×</i></div>`;
      const mail = inner => PH.frame(state.os, `<div class="mx mx-mail ${ios ? 'ios' : 'and'}">${inner}</div>`);
      const note = `<p class="ml-note">${t('Practice message: nothing will be sent.', 'Учебное письмо: ничего не отправится.')}</p>`;
      if (s === 0) {
        const toolbar = ios ? `<div class="ml-tools"><span class="ml-ic">Aa</span>${atBtn(SV(P.photo, '#007aff', 24), 'hi')}<span class="ml-ic">${SV(P.cam, '#007aff', 24)}</span><span class="ml-ic">${SV(P.doc, '#007aff', 24)}</span></div>` : '';
        return mail(`${head(false, true)}${fields}<div class="ml-body">${msg}</div>${note}${toolbar}<div class="ml-kb" aria-hidden="true">${'йцукенгшщзх'.split('').map(c => `<span>${c}</span>`).join('')}</div>`);
      }
      if (s === 1) {
        const thumb = (inner, act, testid, label) => `<button type="button" class="ml-th" data-sim="${act}" ${testid ? `data-testid="${testid}"` : ''} aria-label="${label}">${inner}</button>`;
        const textThumb = `<span class="ml-txt"><b>${t('Notes', 'Памятка')}</b>${'<i></i>'.repeat(6)}<small>Notes.txt</small></span>`;
        const grid = `<div class="ml-grid">${thumb(mountain(110, 110), 'correct', 'choose-photo', 'Practice_photo.jpg')}${thumb(textThumb, 'wrong-file', '', t('Notes.txt', 'Памятка.txt'))}${'<span class="ml-th blank"></span>'.repeat(4)}</div>`;
        return mail(`${head(false, false)}${fields}<div class="ml-sheet ${ios ? 'ios' : 'and'}">${ios
          ? `<div class="ml-sh-top"><span>${t('Cancel', 'Отменить')}</span><div class="ml-seg"><b>${t('Photos', 'Фото')}</b><span>${t('Albums', 'Альбомы')}</span></div><span class="dim">${t('Add', 'Добавить')}</span></div>`
          : `<div class="ml-sh-top and"><span>✕</span><strong>${t('Select photo', 'Выберите фото')}</strong><span></span></div><div class="ml-seg and"><b>${t('Photos', 'Фото')}</b><span>${t('Albums', 'Альбомы')}</span></div>`}<small class="ml-cap">${t('Recent · practice files', 'Недавние · учебные файлы')}</small>${grid}<p class="ml-hint">Practice_photo.jpg · Notes.txt</p></div>`);
      }
      if (s === 2) return mail(`${head(false, false)}${fields}<div class="ml-body">${msg}${ios ? attached : ''}</div>${ios ? '' : attached}<div class="ml-check"><span>${t('Recipient, text and photo — all correct?', 'Получатель, текст и фото — всё верно?')}</span><button type="button" class="ml-ok" data-sim="correct" data-testid="review-file">✓ ${t('All checked', 'Всё проверено')}</button></div>`);
      return mail(`${head(true, false)}${fields}<div class="ml-body">${msg}${ios ? attached : ''}</div>${ios ? '' : attached}<p class="ml-note">${ios ? t('Tap the blue arrow at the top right to send. Practice: nothing is sent.', 'Нажмите синюю стрелку справа вверху, чтобы отправить. Учебно: ничего не уйдёт.') : t('Tap the paper plane at the top to send. Practice: nothing is sent.', 'Нажмите самолётик вверху, чтобы отправить. Учебно: ничего не уйдёт.')}</p>`);
    }

    /* message: native Messages (iPhone) / Google Messages (Android) */
    const SV = (d, c = 'currentColor', z = 22) => `<svg viewBox="0 0 24 24" width="${z}" height="${z}" aria-hidden="true"><path fill="${c}" d="${d}"/></svg>`;
    const P_BACK = ios ? 'M15.4 4.6 14 3.2 5.2 12l8.8 8.8 1.4-1.4L8 12z' : 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z';
    const P_PERSON = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z';
    const P_MORE = 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z';
    const P_PHONE = 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z';
    const num = '+7 700 ••• 15 23';
    const head = ios
      ? `<div class="sm-head ios"><span class="sm-back">${SV(P_BACK, '#007aff', 24)}<b>12</b></span><span class="sm-who"><span class="sm-ava">${SV(P_PERSON, '#fff', 26)}</span><small>${num} ›</small></span><span></span></div>`
      : `<div class="sm-head and">${SV(P_BACK, '#1f1f1f', 24)}<span class="sm-ava">${SV(P_PERSON, '#fff', 22)}</span><span class="sm-t"><strong>${num}</strong></span>${SV(P_PHONE, '#1f1f1f', 22)}${SV(P_MORE, '#1f1f1f', 22)}</div>`;
    const text = t('“Your application will be cancelled in 10 minutes! Send us the code from your text message now to keep it active.”', '«Ваша заявка будет отменена через 10 минут! Срочно отправьте нам код из SMS, чтобы её сохранить».').replace(/[«»“”]/g, '');
    const thread = (extra = '') => `<div class="sm-thread"><div class="sm-meta">${ios ? `${t('Text Message · SMS', 'Сообщение SMS')}<br>${t('Today', 'Сегодня')} 12:04` : `${t('Today', 'Сегодня')} · 12:04`}</div><div class="sm-b">${text}</div>${extra}</div>`;
    const spam = ios
      ? `<div class="sm-spam">${t('The sender is not in your contact list.', 'Отправителя нет в вашем списке контактов.')}<br><span>${t('Report Junk', 'Сообщить о спаме')}</span></div>`
      : `<div class="sm-spam and"><b>⚠ ${t('Possible spam', 'Возможно, это спам')}</b><span>${t('Report spam', 'Сообщить о спаме')}</span></div>`;
    const compose = ios
      ? `<div class="sm-comp ios"><span class="sm-plus">+</span><span class="sm-in">${t('Text Message · SMS', 'Сообщение SMS')}</span></div>`
      : `<div class="sm-comp and"><span class="sm-plus">⊕</span><span class="sm-in">${t('Text message', 'SMS-сообщение')}</span></div>`;
    const sheetBtn = (label, act, extra = '') => `<button type="button" class="sm-opt" data-sim="${act}" ${extra}>${label}</button>`;
    const sheet = (title, items, cancel = true) => `<div class="sm-sheet ${ios ? 'ios' : 'and'}"><div class="sm-group">${title ? `<div class="sm-st">${title}</div>` : ''}${items.join('')}</div>${ios && cancel ? `<div class="sm-cancel">${t('Cancel', 'Отменить')}</div>` : ''}</div>`;
    const sms = inner => phone ? PH.frame(state.os, `<div class="mx mx-sms ${ios ? 'ios' : 'and'}">${inner}</div>`) : wrap(`<div class="mock-content">${inner}</div>`);
    if (s === 0) return sms(`${head}${thread()}${spam}${sheet(t('What is the warning sign here?', 'Что здесь настораживает?'), [sheetBtn(t('Urgency and a request to share a code', 'Спешка и просьба передать код'), 'correct', 'data-testid="suspicious-sign"'), sheetBtn(t('The message being short', 'Короткое сообщение само по себе'), 'wrong-sign')], false)}`);
    if (s === 1) return sms(`${head}${thread(`<div class="sm-b out draft">${t('My code: 48 29…', 'Мой код: 48 29…')}<small>${t('Not sent', 'Не отправлено')}</small></div>`)}${sheet(t('You have time to pause. What will you do?', 'Есть время остановиться. Что сделаете?'), [sheetBtn(t('Send the code before time runs out', 'Отправить код, чтобы успеть'), 'unsafe-code'), sheetBtn(t('Delete the draft, keep the code private. Pause', 'Стереть черновик, код не отправлять. Сделать паузу'), 'correct', 'data-testid="safe-pause"'), sheetBtn(t('Forward the message with the code', 'Переслать сообщение вместе с кодом'), 'unsafe-code')])}`);
    if (s === 2) return sms(`${head}${thread(`<div class="sm-b">${t('Questions? Call us: ', 'Вопросы? Звоните: ')}<u>+7 777 000 11 22</u></div>`)}${sheet(t('How should you check your application?', 'Как проверить заявку?'), [sheetBtn(`${SV(P_PHONE, ios ? '#007aff' : '#0b57d0', 18)} ${t('Call +7 777 000 11 22 from the message', 'Позвонить +7 777 000 11 22 из сообщения')}`, 'unsafe-contact'), sheetBtn(t('Find the official contact yourself or ask someone you trust', 'Самому найти официальный контакт или попросить близкого помочь'), 'correct', 'data-testid="trusted-help"')])}`);
    return sms(`${head}${thread()}<div class="sm-done"><b>${t('You can take your time', 'Вы можете не спешить')}</b><span>${t('✓ The code has not been shared<br>✓ No decision made under pressure<br>✓ A trusted contact chosen for checking', '✓ Код никому не передан<br>✓ Решение не принято под давлением<br>✓ Для проверки выбран надёжный контакт')}</span></div>${sheet('', [sheetBtn(t('Report spam and close', 'Сообщить о спаме и закрыть'), 'correct', 'data-testid="close-message"')], false)}`);
  }

  function osButtons(suffix = '') {
    const list = state.device === 'phone' ? [['ios', 'iPhone'], ['android', 'Android']] : [['windows', 'Windows'], ['mac', 'Mac']];
    const marks = {
      ios: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.7 12.8c0-2 1.6-3 1.7-3.1a3.7 3.7 0 0 0-2.9-1.6c-1.2-.1-2.3.7-2.9.7-.6 0-1.5-.7-2.5-.7a3.9 3.9 0 0 0-3.3 2c-1.4 2.4-.4 6 1 8 .7 1 1.5 2 2.5 2s1.4-.6 2.6-.6 1.6.6 2.6.6 1.7-1 2.4-2c.5-.7.9-1.5 1.2-2.3a3.5 3.5 0 0 1-2.4-3Zm-1.9-6a3.6 3.6 0 0 0 .8-2.6 3.7 3.7 0 0 0-2.4 1.2 3.4 3.4 0 0 0-.9 2.5 3 3 0 0 0 2.5-1.1Z"/></svg>',
      android: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 9.1a6.8 6.8 0 0 1 13.6 0v7.2a1.7 1.7 0 0 1-1.7 1.7h-.7v2.2a1.4 1.4 0 0 1-2.8 0V18h-3.4v2.2a1.4 1.4 0 0 1-2.8 0V18h-.7a1.7 1.7 0 0 1-1.7-1.7V9.1Zm-2.8-.4a1.4 1.4 0 0 1 1.4 1.4v5a1.4 1.4 0 0 1-2.8 0v-5a1.4 1.4 0 0 1 1.4-1.4Zm19.2 0A1.4 1.4 0 0 1 23 10.1v5a1.4 1.4 0 0 1-2.8 0v-5a1.4 1.4 0 0 1 1.4-1.4ZM8 2.7l1.3 2.2-.8.5-1.3-2.2.8-.5Zm8 0 .8.5-1.3 2.2-.8-.5 1.3-2.2ZM9 8.2a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6Zm6 0a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6Z"/></svg>',
      windows: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 5.2 10.8 4v7.6H2V5.2Zm10.1-1.4L22 2.4v9.2h-9.9V3.8ZM2 12.8h8.8v7.6L2 19.2v-6.4Zm10.1 0H22v9.2l-9.9-1.4v-7.8Z"/></svg>',
      mac: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.7 12.8c0-2 1.6-3 1.7-3.1a3.7 3.7 0 0 0-2.9-1.6c-1.2-.1-2.3.7-2.9.7-.6 0-1.5-.7-2.5-.7a3.9 3.9 0 0 0-3.3 2c-1.4 2.4-.4 6 1 8 .7 1 1.5 2 2.5 2s1.4-.6 2.6-.6 1.6.6 2.6.6 1.7-1 2.4-2c.5-.7.9-1.5 1.2-2.3a3.5 3.5 0 0 1-2.4-3Zm-1.9-6a3.6 3.6 0 0 0 .8-2.6 3.7 3.7 0 0 0-2.4 1.2 3.4 3.4 0 0 0-.9 2.5 3 3 0 0 0 2.5-1.1Z"/></svg>'
    };
    return list.map(([v, l]) => `<button type="button" data-os="${v}" aria-pressed="${curOs() === v}" data-testid="os-${v}${suffix}">${l}</button>`).join('');
  }
  function osSwitch() {
    return `<div class="os-switch" role="group" aria-label="${state.device === 'phone' ? t('Phone model', 'Модель телефона') : t('Computer type', 'Тип компьютера')}">${osButtons('-train')}</div>`;
  }
  /* ---------- read the step aloud (Web Speech API, works in the browser, nothing is sent) ---------- */
  const speechOK = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let speaking = false;
  function refreshSpeakButton() {
    const button = $('[data-action="speak"]');
    if (!button) return;
    button.setAttribute('aria-pressed', String(speaking));
    button.querySelector('.speak-label').textContent = speaking ? t('Stop reading', 'Остановить чтение') : t('Read aloud', 'Прочитать вслух');
  }
  function stopSpeaking() {
    if (!speechOK) return;
    speaking = false;
    window.speechSynthesis.cancel();
    refreshSpeakButton();
  }
  function speakStep() {
    if (!speechOK || !active) return;
    if (speaking) { stopSpeaking(); return; }
    const meta = stepMeta(), lang = window.CSLocale.lang === 'ru' ? 'ru-RU' : 'en-US';
    const text = [meta.title, meta.text, active.hint ? meta.hint : ''].map(plain).filter(Boolean).join('. ');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.replace('_', '-').startsWith(lang.slice(0, 2)));
    if (voice) utterance.voice = voice;
    utterance.onend = utterance.onerror = () => { speaking = false; refreshSpeakButton(); };
    window.speechSynthesis.cancel();
    speaking = true;
    window.speechSynthesis.speak(utterance);
    refreshSpeakButton();
  }
  function renderTraining(focus = false) {
    if (!active) return;
    stopSpeaking();
    const phone = state.device === 'phone';
    const task = getTask(active.id), meta = stepMeta(), ready = active.valid[active.step];
    $('#training-view').innerHTML = `<button class="text-button back-link" data-action="practices">${t('← All exercises', '← Все практики')}</button><div class="training-header"><div><p class="eyebrow">${t('EXERCISE', 'ПРАКТИКА')} ${String(ids().indexOf(active.id) + 1).padStart(2, '0')} / ${String(ids().length).padStart(2, '0')}</p><h1 id="training-title" tabindex="-1">${task.title}</h1></div><span class="device-name">${deviceLabel()}</span></div><div class="training-layout"><div class="instruction-panel"><p class="step-count">${t(`STEP ${active.step + 1} OF 4`, `ШАГ ${active.step + 1} ИЗ 4`)}</p><div class="step-progress" role="progressbar" aria-label="${t('Completed steps', 'Пройденные шаги')}" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${active.step}">${[0, 1, 2, 3].map(i => `<span${i < active.step ? ' class="done"' : ''}></span>`).join('')}</div><h2 id="step-title" tabindex="-1">${meta.title}</h2><p class="instruction-text">${meta.text}</p><button class="hint-button" data-action="hint" aria-expanded="${active.hint}" aria-controls="step-hint" data-testid="show-hint">? ${t('Hint', 'Подсказка')}</button>${speechOK ? ` <button class="hint-button speak-button" data-action="speak" aria-pressed="false" data-testid="read-aloud"><span aria-hidden="true">🔊</span> <span class="speak-label">${t('Read aloud', 'Прочитать вслух')}</span></button>` : ''} <button class="hint-button assist-open" data-action="assist" aria-expanded="${active.assist.open}" data-testid="ask-helper">${t('Stuck? Ask the helper', 'Не получается? Спросить помощника')}</button><div id="step-hint" class="hint-box"${active.hint ? '' : ' hidden'}>${meta.hint}</div><div id="assistant-slot">${assistHTML()}</div><div class="feedback ${active.tone}" id="step-feedback" role="status">${active.feedback ? active.feedback() : ''}</div><div class="training-nav"><button class="button secondary" data-action="previous" data-testid="previous-step">← ${t('Back', 'Назад')}</button><button class="button primary" data-action="next" data-testid="next-step"${ready ? '' : ' disabled'}>${active.step === 3 ? t('Finish', 'Завершить') : t('Next', 'Дальше')} <span aria-hidden="true">→</span></button><button class="text-button" data-action="restart" data-testid="restart-task">${t('Start again', 'Начать заново')}</button></div><p class="safe-note"><span aria-hidden="true">◇</span>${t('These are practice screens. You are not changing your device or sending real information.', 'Это учебные экраны. Вы не меняете устройство и не отправляете настоящие данные.')}</p></div><div class="simulator ${state.device}" data-testid="simulator"><div class="simulator-label"><span>${t('PRACTICE SCREEN', 'УЧЕБНЫЙ ЭКРАН')}</span>${osSwitch()}</div>${screen()}</div></div>`;
    if (ready && !(active.id === 'text' && active.step === 2)) {
      $('#training-view [data-sim="correct"]')?.classList.add('correct');
    }
    if (focus) focusTitle('#step-title');
  }
  function feedback(message, tone = 'retry') {
    active.feedback = message; active.tone = tone;
    const target = $('#step-feedback');
    target.className = 'feedback ' + tone; target.textContent = message();
    announce(message());
  }
  function correctMessage() {
    if (lessonIds.includes(active.id)) return t(...lessons()[active.id].steps[active.step].ok);
    const messages = {
      text: [t('Settings are open. You can move to the next step.', 'Настройки открыты. Можно переходить дальше.'), t('You found the right section. Let us change the text size.', 'Нужный раздел найден. Перейдём к размеру текста.'), t('The text is larger. You can now check the result.', 'Текст увеличен. Можно проверить результат.'), t('You noticed the change. You can finish the exercise.', 'Вы заметили результат. Практику можно завершить.')],
      address: [t('Yes, the exact address is egov.kz. You can move to the practice page.', 'Да, точный адрес — egov.kz. Можно перейти к учебной странице.'), t('You found the section with the information you need.', 'Раздел с нужной информацией найден.'), t('The schedule is open. Let us read it.', 'Расписание открыто. Теперь прочитаем его.'), t('Correct: this practice schedule says the centre is open on weekdays, 09:00–18:00.', 'Верно: по учебному расписанию центр работает по будням с 09:00 до 18:00.')],
      file: [t('You found the attach button. Let us open the practice list.', 'Кнопка прикрепления найдена. Откроем учебный список.'), t('You selected the practice photo. Now check the message.', 'Учебная фотография выбрана. Теперь важно проверить обращение.'), t('You checked the message and the correct attachment.', 'Текст и нужное вложение проверены.'), t('You confirmed the practice send. Nothing was sent anywhere.', 'Учебная отправка подтверждена. Ничего никуда не отправлено.')],
      message: [t('Correct. Time pressure and a request to share a code are warning signs.', 'Верно. Давление временем и просьба передать код настораживают.'), t('A safe choice: pause and keep the code private.', 'Безопасное решение: сделать паузу и не передавать код.'), t('Yes. Find the official contact yourself or ask someone you trust for help.', 'Да. Официальный контакт ищем самостоятельно или просим проверенного человека помочь.'), t('The practice message is closed. You completed all the safe steps.', 'Учебное сообщение закрыто. Вы прошли все безопасные шаги.')]
    };
    return messages[active.id][active.step];
  }
  function correct() {
    active.valid[active.step] = true;
    $('#training-view [data-action="next"]').disabled = false;
    feedback(correctMessage, 'success');
  }
  function retryMessages() {
    return {
      'wrong-app': t('That is a different app. Look for the gear icon named “Settings”.', 'Это другое приложение. Ищите значок шестерёнки «Настройки».'),
      'retry-settings': t('That option does something else. Try again: look for text size or zoom.', 'Этот пункт отвечает за другое действие. Попробуйте ещё раз: нужный пункт связан с текстом или масштабом.'),
      'wrong-domain': t('That address is spelled differently. Check each letter: you need egov.kz. You can try again.', 'У этого адреса другое написание. Сверьте каждую букву: нужно egov.kz. Можно попробовать ещё раз.'),
      'wrong-service': t('That section does not answer our question. Look for the option named in the instructions. The hint is still available.', 'Этот раздел не отвечает на наш вопрос. Найдите пункт из задания; подсказка остаётся рядом.'),
      'wrong-hours': t('Look at the schedule again: Saturday and Sunday are marked as closed.', 'Посмотрите на расписание ещё раз: суббота и воскресенье отмечены как выходные.'),
      'wrong-file': t('That is a text file. This exercise asks for the photo named “Practice_photo.jpg”. Try selecting it.', 'Это текстовая памятка. В задании нужна фотография с именем «Practice_photo.jpg». Попробуйте выбрать её.'),
      'wrong-sign': t('A short message is not necessarily unsafe. Notice the request to share a code and the time pressure.', 'Длина сообщения сама по себе не доказывает опасность. Обратите внимание на просьбу передать код и давление временем.'),
      'unsafe-code': t('Keep the code private. Nothing has been sent. Choose an action that gives you time to pause and check.', 'Код собеседнику передавать не нужно. Ничего не отправлено. Выберите действие, которое даёт время остановиться и проверить.'),
      'unsafe-contact': t('Contact details in a suspicious message may belong to its sender. Find the official contact yourself.', 'Контакт в подозрительном сообщении может принадлежать его отправителю. Лучше самостоятельно найти официальный контакт.')
    };
  }
  function simAction(action, button) {
    if (!active) return;
    if (action === 'correct') { correct(); button.classList.add('correct'); return; }
    if (action === 'zoom-plus' || action === 'zoom-minus') {
      active.zoom = Math.min(150, Math.max(80, active.zoom + (action === 'zoom-plus' ? 10 : -10)));
      $('#zoom-value').textContent = active.zoom + '%';
      $('#reading-sample').style.fontSize = active.zoom + '%';
      const thumb = $('#size-thumb');
      if (thumb) thumb.style.left = ((active.zoom - 80) / 70 * 100) + '%';
      active.valid[2] = active.zoom >= 120;
      $('#training-view [data-action="next"]').disabled = !active.valid[2];
      feedback(() => active.valid[2] ? t(`Text size is now ${active.zoom}%. You can move to the next step.`, `Текст увеличен до ${active.zoom}%. Можно переходить дальше.`) : t(`The size is ${active.zoom}%. Select plus to reach 120% or more.`, `Сейчас ${active.zoom}%. Нажмите плюс, чтобы получить 120% или больше.`), active.valid[2] ? 'success' : '');
      return;
    }
    if (action === 'lw') {
      const en = button.dataset.en, ru = button.dataset.ru;
      feedback(() => t(en, ru));
      noteWrong(action, t(en, ru));
      return;
    }
    feedback(() => retryMessages()[action] || t('You can try again. The hint can help you find the next step.', 'Можно попробовать ещё раз. Подсказка поможет найти следующий шаг.'));
    noteWrong(action);
  }
  /* ---------- printable cheat sheet for one lesson ---------- */
  let cheatsheetId = null;
  function renderCheatsheet(focus = false) {
    const id = cheatsheetId, task = getTask(id);
    $('#cheatsheet-view').innerHTML = `<div class="no-print cs-tools"><button class="text-button back-link" data-action="practices">${t('← All exercises', '← Все практики')}</button><div class="cs-actions"><button class="button primary" data-action="print" data-testid="print-cheatsheet">${t('Print', 'Распечатать')}</button><button class="button secondary" data-task="${id}">${t('Start this exercise', 'Начать эту практику')}</button></div><p class="small">${t(`The steps are for ${deviceLabel()}. To get them for another device, choose it on the home page.`, `Шаги написаны для устройства ${deviceLabel()}. Для другого устройства выберите его на главной странице.`)}</p></div><article class="cheatsheet"><p class="eyebrow">${t('CHEAT SHEET', 'ШПАРГАЛКА')} · ${deviceLabel().toUpperCase()}</p><h1 id="cheatsheet-title" tabindex="-1">${task.title}</h1><p class="cs-lead">${task.description}</p><ol class="cs-steps">${[0, 1, 2, 3].map(s => { const m = stepMeta(id, s); return `<li class="cs-step"><span class="cs-num" aria-hidden="true">${s + 1}</span><div><h2>${m.title}</h2><p>${m.text}</p><p class="cs-hint"><strong>${t('Hint:', 'Подсказка:')}</strong> ${m.hint}</p></div></li>`; }).join('')}</ol><div class="takeaway"><strong>${t('Remember', 'Запомните')}</strong><br>${task.takeaway}</div><p class="cs-foot">${t('Confident Steps · practice at your own pace. A learning aid, not an official instruction. Screens on your device may look a little different.', 'Уверенный шаг · практика без спешки. Учебная памятка, не официальная инструкция. На вашем устройстве экраны могут выглядеть немного иначе.')}</p></article>`;
    if (focus) focusTitle('#cheatsheet-title');
  }
  function showCheatsheet(id) {
    if (!ids().includes(id)) { home('practices'); return; }
    cheatsheetId = id;
    showView('cheatsheet');
    renderCheatsheet(true);
  }
  function completeTask() {
    const id = active.id;
    if (!state.progress[state.device].includes(id)) state.progress[state.device].push(id);
    persist();
    active.completed = true;
    renderCompletion(true);
    announce(t('Exercise complete. You can repeat it, choose the next one or rate your confidence.', 'Практика завершена. Можно повторить, выбрать следующую или отметить уверенность.'));
  }
  function renderCompletion(focus = false) {
    stopSpeaking();
    const id = active.id;
    const next = ids().find(task => !state.progress[state.device].includes(task));
    $('#training-view').innerHTML = `<button class="text-button back-link" data-action="practices">${t('← All exercises', '← Все практики')}</button><div class="finish-panel"><div class="finish-check" aria-hidden="true">✓</div><p class="eyebrow">${t('EXERCISE COMPLETE', 'ПРАКТИКА ЗАВЕРШЕНА')} · ${deviceLabel().toUpperCase()}</p><h1 id="training-title" tabindex="-1">${t('You have taken another step.', 'У вас получился ещё один шаг.')}</h1><p>${t(`You completed “${getTask(id).title.toLowerCase()}”. You can repeat it as often as you like.`, `Вы прошли практику «${getTask(id).title.toLowerCase()}». Её можно повторить столько раз, сколько вам удобно.`)}</p><div class="takeaway">${getTask(id).takeaway}</div><div class="finish-actions">${next ? `<button class="button primary" data-task="${next}" data-testid="next-practice">${t('Next exercise', 'Следующая практика')} <span aria-hidden="true">→</span></button>` : `<button class="button primary" data-action="practices">${t('All exercises', 'Все практики')} <span aria-hidden="true">→</span></button>`}<button class="button secondary" data-action="confidence-after" data-testid="confidence-after">${t('Rate your confidence', 'Отметить уверенность')}</button><button class="text-button" data-task="${id}">${t('Repeat this exercise', 'Повторить эту практику')}</button><button class="text-button" data-action="cheatsheet" data-id="${id}">${t('Cheat sheet to print', 'Шпаргалка для печати')}</button></div>${id === 'message' ? `<div class="sc-offer"><strong>${t('Want more practice?', 'Хотите потренироваться ещё?')}</strong><p>${t('The helper can write a new made-up message for you to check.', 'Помощник придумает для вас новое учебное сообщение, а вы проверите его.')}</p><button class="button secondary" data-action="sc-new" data-testid="new-situation">${t('New situation from the helper', 'Новая ситуация от помощника')}</button></div>` : ''}<p class="mock-note">${t(`Completed ${state.progress[state.device].length} of ${ids().length} exercises for the ${state.device === 'phone' ? 'phone' : 'computer'}. This records completion; it does not measure your ability.`, `Пройдено ${state.progress[state.device].length} из ${ids().length} практик для ${state.device === 'phone' ? 'телефона' : 'компьютера'}. Это отметка прохождения, а не оценка способностей.`)}</p></div>`;
    if (focus) { window.scrollTo({top: 0, behavior: 'instant'}); focusTitle('#training-title'); }
  }
  function scale(phase, title) {
    return `<fieldset class="confidence-group"><legend>${title}</legend><div class="confidence-scale">${getLabels().map((label, index) => `<label><input type="radio" name="${phase}" value="${index + 1}"${state.ratings[state.device][phase] === index + 1 ? ' checked' : ''} data-testid="confidence-${phase}-${index + 1}"><span class="scale-number">${index + 1}</span><span>${label}</span></label>`).join('')}</div></fieldset>`;
  }
  function showConfidence(mode = 'both', task = null, redraw = false) {
    const pending = redraw ? $$('#confidence-form input:checked').map(input => [input.name, input.value]) : [];
    if (!redraw) localizedStatuses.delete('confidence-status');
    confidenceContext = {mode, task};
    const hasCompleted = state.progress[state.device].length > 0;
    const title = mode === 'before' ? t('How do you feel before practising?', 'Как вы чувствуете себя перед практикой?') : mode === 'after' ? t('How do you feel now?', 'Как вы чувствуете себя сейчас?') : t('Your confidence, in your own words.', 'Ваша уверенность — ваш ориентир.');
    const groups = mode === 'before' ? scale('before', t('Before practice', 'Перед практикой')) : mode === 'after' ? scale('after', t('After practice', 'После практики')) : scale('before', t('Before practice', 'Перед практикой')) + (hasCompleted ? scale('after', t('After practice', 'После практики')) : `<p class="small">${t('After completing your first exercise, you can rate your confidence again.', 'После первой завершённой практики можно будет отметить уверенность ещё раз.')}</p>`);
    $('#confidence-view').innerHTML = `<button class="text-button back-link" data-action="practices">${t('← All exercises', '← Все практики')}</button><p class="eyebrow">${deviceName().toUpperCase()} · ${t('SELF-RATING FROM 1 TO 5', 'САМООЦЕНКА ОТ 1 ДО 5')}</p><h1 id="confidence-title" tabindex="-1">${title}</h1><p class="intro">${t(`How confident do you feel doing familiar tasks on a ${state.device === 'phone' ? 'phone' : 'computer'} on your own? There is no right answer. This personal rating is optional.`, `Насколько уверенно вы сейчас выполняете знакомые действия на ${state.device === 'phone' ? 'телефоне' : 'компьютере'} самостоятельно? Здесь нет правильного ответа. Это добровольная личная отметка.`)}</p><form id="confidence-form">${groups}<div class="confidence-actions"><button class="button primary" type="submit" data-testid="save-confidence">${task ? t('Save and start', 'Сохранить и начать') : t('Save rating', 'Сохранить отметку')} <span aria-hidden="true">→</span></button><button class="text-button" type="button" data-action="skip-confidence" data-testid="skip-confidence">${task ? t('Start without a rating', 'Начать без отметки') : t('Skip', 'Пропустить')}</button></div><p id="confidence-status" role="status" class="small"></p></form><p class="confidence-explainer">${t('Your rating may go up or down. It does not prove a research outcome. Ratings stay on this page, or in this browser if you turn on progress saving. You can delete them on the home page.', 'Самооценка может измениться в любую сторону. Она не доказывает результат исследования. Отметки хранятся только на этой странице, а при включённом сохранении прогресса — в этом браузере. Вы можете удалить их на главной.')}</p>`;
    if (redraw) {
      pending.forEach(([name, value]) => {
        const input = $(`#confidence-form input[name="${name}"][value="${value}"]`);
        if (input) input.checked = true;
      });
    } else { showView('confidence'); focusTitle('#confidence-title'); }
  }
  function showSurvey() { showView('survey'); focusTitle('#survey-title'); }
  function setOs(value) {
    if (!['ios', 'android', 'windows', 'mac'].includes(value) || value === curOs()) return;
    if (value === 'windows' || value === 'mac') state.dos = value; else state.os = value;
    persist();
    renderCards();
    if (currentView === 'training' && active && !active.completed) {
      renderTraining();
      requestAnimationFrame(() => $(`#training-view [data-os="${value}"]`)?.focus({preventScroll: true}));
    }
    announce(t(`Practice screens now look like ${deviceLabel()}.`, `Учебные экраны теперь выглядят как ${deviceLabel()}.`));
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action],[data-task],[data-device],[data-sim],[data-os]');
    if (!button) return;
    if (button.tagName === 'A') event.preventDefault();
    if (button.dataset.task) { beginTask(button.dataset.task); return; }
    if (button.dataset.os && !button.dataset.sim) { setOs(button.dataset.os); return; }
    if (button.dataset.device) { state.device = button.dataset.device; persist(); renderCards(); announce(t(`Selected: ${deviceName().toLowerCase()}. Progress is separate for each device.`, `Выбран ${deviceName().toLowerCase()}. Прогресс для каждого устройства отдельный.`)); return; }
    if (button.dataset.sim) { simAction(button.dataset.sim, button); return; }
    switch (button.dataset.action) {
      case 'home': home(); break;
      case 'practices': home('practices'); break;
      case 'about': home('about'); break;
      case 'survey': showSurvey(); break;
      case 'chat': showChat(); break;
      case 'chat-chip': sendChat(button.dataset.q); break;
      case 'chat-remove': chatState.image = null; refreshChat(); break;
      case 'font': {
        const enabled = document.body.classList.toggle('large-text');
        document.documentElement.classList.toggle('large-text', enabled);
        button.setAttribute('aria-pressed', String(enabled));
        button.setAttribute('aria-label', enabled ? t('Restore normal text size', 'Вернуть обычный размер текста') : t('Make website text larger', 'Увеличить текст на сайте'));
        announce(enabled ? t('Large text is on.', 'Крупный текст включён.') : t('Normal text size is on.', 'Обычный размер текста включён.')); break;
      }
      case 'contrast': {
        const enabled = document.documentElement.classList.toggle('high-contrast');
        try { localStorage.setItem(contrastKey, enabled ? '1' : '0'); } catch (_) { /* The mode still works until the page is reloaded. */ }
        refreshContrastLabel();
        announce(enabled ? t('High contrast is on.', 'Высокий контраст включён.') : t('Normal colours are on.', 'Обычные цвета включены.')); break;
      }
      case 'speak': speakStep(); break;
      case 'cheatsheet': showCheatsheet(button.dataset.id); break;
      case 'print': window.print(); break;
      case 'hint': active.hint = !active.hint; $('#step-hint').hidden = !active.hint; button.setAttribute('aria-expanded', String(active.hint)); break;
      case 'previous': if (active.step > 0) { active.step--; active.feedback = null; active.tone = ''; active.hint = false; resetAssist(); renderTraining(true); } else home('practices'); break;
      case 'next': if (!active.valid[active.step]) return; if (active.step === 3) completeTask(); else { active.step++; active.feedback = null; active.tone = ''; active.hint = false; resetAssist(); renderTraining(true); } break;
      case 'restart': beginTask(active.id, true); announce(t('The exercise has restarted. You can practise at your own pace.', 'Практика начата заново. Можно пробовать в своём темпе.')); break;
      case 'assist': active.assist.open = !active.assist.open; refreshAssist(); if (active.assist.open) requestAnimationFrame(() => $('#assist-q')?.focus({preventScroll: true})); break;
      case 'assist-chip': askHelper(button.dataset.kind); break;
      case 'turn-again': { const el = button.closest('.turn'); if (el) { el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); } break; }
      case 'assist-remove-img': active.assist.image = null; refreshAssist(); break;
      case 'sc-new': loadScenario(); break;
      case 'sc-exit': scenario = null; if (active && active.completed) renderCompletion(true); else home('practices'); break;
      case 'sc-answer': { const said = button.dataset.v === 'danger'; scenario.answered = said; scenarioStats.n++; if (said === scenario.data.suspicious) scenarioStats.ok++; renderScenario(true); break; }
      case 'confidence': showConfidence(); break;
      case 'confidence-after': showConfidence('after'); break;
      case 'skip-confidence': { const task = confidenceContext?.task; if (task) beginTask(task, true); else home('practices'); break; }
      case 'erase': {
        state.progress = emptyProgress(); state.ratings = emptyRatings(); state.save = false;
        let removed = true; try { localStorage.removeItem(key); } catch (_) { removed = false; }
        renderCards(); setLocalizedStatus('storage-status', () => removed ? t('Saved progress and confidence ratings have been deleted. You can start with any exercise.', 'Сохранённый прогресс и отметки уверенности удалены. Можно начать с любого шага.') : t('Ratings on this page have been deleted. The browser did not allow its storage to be cleared. If needed, clear the site data in your browser settings.', 'Отметки на странице удалены. Браузер не разрешил очистить хранилище; при необходимости очистите данные сайта в настройках браузера.')); announce($('#storage-status').textContent); break;
      }
      case 'clear-survey': $('#survey-form').reset(); refreshAgeNote(); setLocalizedStatus('survey-status', () => t('The survey has been cleared. Answers have not been saved.', 'Анкета очищена. Ответы не сохранены.')); break;
    }
  });
  $('#save-progress').addEventListener('change', event => {
    state.save = event.target.checked;
    if (state.save) { if (persist()) setLocalizedStatus('storage-status', () => t('Progress and confidence ratings will be saved in this browser. Survey answers are not saved.', 'Прогресс и отметки уверенности будут сохранены в этом браузере. Анкета не сохраняется.')); }
    else { try { localStorage.removeItem(key); setLocalizedStatus('storage-status', () => t('Saving is off. Your progress is available until you reload the page.', 'Сохранение выключено. Прогресс доступен до обновления страницы.')); } catch (_) { setLocalizedStatus('storage-status', () => t('Saving is off. The browser did not allow its storage to be cleared. You can clear it in your browser settings.', 'Сохранение выключено. Браузер не разрешил очистить хранилище; его можно очистить в настройках браузера.')); } }
    announce($('#storage-status').textContent);
  });
  document.addEventListener('change', event => {
    if (event.target.id === 'chat-file') { pickImage(event.target.files[0]); event.target.value = ''; }
    if (event.target.id === 'assist-file' && active) {
      readImage(event.target.files[0]).then(img => { if (img && active) { active.assist.image = img; active.assist.open = true; refreshAssist(); } });
      event.target.value = '';
    }
  });
  document.addEventListener('keydown', event => {
    const el = event.target;
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing || !el || (el.id !== 'chat-q' && el.id !== 'assist-q')) return;
    event.preventDefault();
    if (el.id === 'chat-q' && chatState.busy) return;
    if (el.form && el.form.requestSubmit) el.form.requestSubmit(); else if (el.form) el.form.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}));
  });
  document.addEventListener('submit', event => {
    if (event.target.id === 'chat-form') {
      event.preventDefault();
      const q = $('#chat-q'), text = q.value; q.value = '';
      sendChat(text);
      return;
    }
    if (event.target.id === 'assist-form') {
      event.preventDefault();
      const q = $('#assist-q'), text = q.value.trim();
      if (!text && !(active && active.assist.image)) return;
      q.value = '';
      askHelper('question', text);
      return;
    }
    if (event.target.id !== 'confidence-form') return;
    event.preventDefault(); const form = event.target;
    const selected = $$('input:checked', form);
    if (!selected.length) { setLocalizedStatus('confidence-status', () => t('Choose a rating or select “Skip”.', 'Выберите отметку или нажмите «Пропустить».')); return; }
    selected.forEach(input => { state.ratings[state.device][input.name] = Number(input.value); }); persist();
    const task = confidenceContext?.task;
    if (task) beginTask(task, true); else { home('practices'); announce(t('Your confidence rating has been saved.', 'Ваша отметка уверенности сохранена.')); }
  });
  function refreshAgeNote() {
    const age = $('#survey-form input[name="age"]:checked')?.value;
    if (!age) {
      setLocalizedStatus('age-note', () => t('This study focuses on people aged 55 and over. You can download answers without selecting an age, but those responses will not be included in the main 55+ group.', 'Исследование посвящено людям от 55 лет. Можно скачать ответы, не указывая возраст, но они не войдут в основную группу 55+.'));
      return;
    }
    setLocalizedStatus('age-note', () => age === 'under55' ? t('This survey is for adults aged 55 and over. Answers from anyone under 55 are excluded and cannot be exported. The exercises are open to everyone.', 'Эта анкета рассчитана на людей от 55 лет. Ответы участника младше 55 лет не включаются и не экспортируются. Практики доступны всем.') : age === 'prefer_not' ? t('You can choose not to share your age and still download your answers. They will not be included in the main 55+ group.', 'Вы можете не указывать возраст и скачать ответы. Они не включаются в основную группу 55+.') : t('Thank you. Your age group is part of the study’s target audience.', 'Спасибо. Ваша возрастная группа входит в целевую аудиторию исследования.'));
  }
  $('#survey-form').addEventListener('change', event => {
    if (event.target.name === 'age') refreshAgeNote();
  });
  $('#survey-form').addEventListener('submit', event => {
    event.preventDefault(); const form = event.target, status = $('#survey-status');
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    if (fd.get('age') === 'under55') { setLocalizedStatus(status.id, () => t('This survey is for participants aged 55 and over. No file was created. You can use all the exercises freely.', 'Анкета предназначена для участников от 55 лет. Файл не создан. Вы можете свободно пользоваться всеми практиками.')); status.className = 'inline-error'; return; }
    const devices = fd.getAll('devices'), barriers = fd.getAll('barriers');
    if ((devices.includes('none') && devices.length > 1) || (barriers.includes('none') && barriers.length > 1)) { setLocalizedStatus(status.id, () => t('Check your answers: select “I do not use any yet” or “None of these” on its own, without other answers to the same question.', 'Проверьте ответы: вариант «Пока не пользуюсь» или «Ничего из перечисленного» выбирается отдельно от остальных в своём вопросе.')); status.className = 'inline-error'; return; }
    const data = {study: t('Confident Steps — needs of adults aged 55+', 'Уверенный шаг — потребности взрослых 55+'), questionnaire_version: '1.1', language: window.CSLocale.lang, consent: true, age_band: fd.get('age') || null, included_in_target_55plus_group: ['55-64', '65-74', '75+'].includes(fd.get('age')), devices: fd.getAll('devices'), task_frequency: {read: fd.get('frequency_read') || null, official_information: fd.get('frequency_official') || null, attachment: fd.get('frequency_attachment') || null, message_safety: fd.get('frequency_safety') || null}, self_reported_confidence: {phone: fd.get('confidence_phone') || null, computer: fd.get('confidence_computer') || null}, barriers: fd.getAll('barriers'), preferred_support: fd.getAll('support'), handling: t('Created locally at the participant’s request. The website did not send these answers to the researcher.', 'Создано локально по инициативе участника. Сайт не передавал ответы исследователю.')};
    let url;
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json;charset=utf-8'}); url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = 'confident-steps-survey.json'; document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.className = ''; setLocalizedStatus(status.id, () => t('Your answer file is ready to download. The website has not sent it to the researcher. You decide whether to share it. If the download is blocked, allow it in your browser and try again.', 'Файл с ответами подготовлен для скачивания. Сайт не передал его исследователю. Вы сами решаете, делиться ли им. Если скачивание заблокировано, разрешите его в браузере и повторите.'));
    } catch (_) { if (url) URL.revokeObjectURL(url); status.className = 'inline-error'; setLocalizedStatus(status.id, () => t('The browser could not create the file. Your answers remain on this page. You can try another browser.', 'Браузер не смог создать файл. Ответы остаются на странице; можно попробовать другой браузер.')); }
  });
  function refreshFontLabel() {
    const enabled = document.body.classList.contains('large-text');
    const button = $('[data-action="font"]');
    button?.setAttribute('aria-pressed', String(enabled));
    button?.setAttribute('aria-label', enabled ? t('Restore normal text size', 'Вернуть обычный размер текста') : t('Make website text larger', 'Увеличить текст на сайте'));
  }
  function refreshContrastLabel() {
    const enabled = document.documentElement.classList.contains('high-contrast');
    const button = $('[data-action="contrast"]');
    button?.setAttribute('aria-pressed', String(enabled));
    button?.setAttribute('aria-label', enabled ? t('Turn off high contrast', 'Выключить высокий контраст') : t('Turn on high contrast', 'Включить высокий контраст'));
  }
  document.addEventListener('cslanguagechange', () => {
    clearTimeout(announcementTimer);
    $('#global-status').textContent = '';
    renderCards();
    if (currentView === 'training' && active) {
      if (scenario) renderScenario();
      else if (active.completed) renderCompletion();
      else renderTraining();
    } else if (currentView === 'chat') {
      const keep = $('#chat-q') ? $('#chat-q').value : ''; renderChat(); if ($('#chat-q')) $('#chat-q').value = keep;
    } else if (currentView === 'cheatsheet') {
      renderCheatsheet();
    } else if (currentView === 'confidence' && confidenceContext) {
      showConfidence(confidenceContext.mode, confidenceContext.task, true);
    }
    refreshAgeNote();
    refreshStatuses();
    refreshFontLabel();
    refreshContrastLabel();
  });
  renderCards();
  refreshFontLabel();
  refreshContrastLabel();
  /* direct links: #survey, #practices, #about, #cheatsheet/<lesson> */
  function route() {
    const hash = location.hash;
    if (hash === '#survey') showSurvey(); else if (hash === '#practices') home('practices'); else if (hash === '#about') home('about');
    else if (hash.startsWith('#cheatsheet/')) showCheatsheet(hash.slice(12));
  }
  route();
  window.addEventListener('hashchange', route);

  /* If an icon cannot load, fall back to the built-in open-licence glyph. */
  document.addEventListener('error', event => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement)) return;
    const tile = img.closest('.app-tile');
    const kind = tile && (tile.className.match(/k-([a-z]+)/) || [])[1];
    if (kind) tile.innerHTML = PH.ic(kind, 30); else img.style.visibility = 'hidden';
  }, true);
})();
