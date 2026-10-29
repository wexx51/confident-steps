'use strict';
/*
 * New practice lessons (simulated, nothing real is opened or sent):
 *  egov, WhatsApp, Telegram, phone basics, safe internet.
 * Each lesson has 4 steps. A step has: title/text/hint/ok as [English, Russian],
 * bar (title of the app bar), and view(H) which returns the screen HTML.
 * Correct tap = data-sim="correct"; wrong tap = data-sim="lw" with the explanation in data-en/data-ru.
 */
window.CSLessonsFactory = H => {
  const {t, PH, esc, options} = H;
  const wrongAttr = w => `data-sim="lw" data-en="${esc(w[0])}" data-ru="${esc(w[1])}"`;
  const o = (en, ru, wrong) => wrong ? [t(en, ru), 'lw', wrongAttr(wrong).replace('data-sim="lw" ', '')] : [t(en, ru), 'correct', 'data-testid="lesson-ok"'];
  const svg = (d, c = '#fff', s = 28) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><path fill="${c}" d="${d}"/></svg>`;
  const plane = svg('M21.5 3.5 2.6 10.8c-.9.4-.9 1 .1 1.3l4.8 1.5 1.8 5.6c.2.6.4.8.9.8s.7-.2 1-.5l2.3-2.3 4.7 3.5c.9.5 1.5.2 1.7-.8l3-14.2c.3-1.3-.5-1.9-1.4-1.5Z');
  const eg = '<b style="font:700 30px Georgia,serif;color:#fff">e</b>';
  const wa = PH.ic('chat', 28, 'android');

  /* app tile: kind is an icon from the shared set, or a custom glyph */
  const tile = (bg, inner, en, ru, wrong) => `<button type="button" class="app-ico" ${wrong ? wrongAttr(wrong) : 'data-sim="correct" data-testid="lesson-ok"'} aria-label="${t(en, ru)}"><span class="app-tile" style="background:${bg}">${inner}</span><span class="app-label">${t(en, ru)}</span></button>`;
  const known = (kind, en, ru, wrong) => `<button type="button" class="app-ico" ${wrong ? wrongAttr(wrong) : 'data-sim="correct"'} aria-label="${t(en, ru)}"><span class="app-tile k-${kind}"><img src="${H.iconSrc(kind)}" alt=""></span><span class="app-label">${t(en, ru)}</span></button>`;
  const grid = items => `<div class="home-top"></div><div class="app-grid lesson-apps">${items.join('')}</div>`;
  const notThis = [`This is a different app. Check the name under the icon.`, `Это другое приложение. Сверьте название под значком.`];

  const row = (letter, name, sub, wrong, color = '#8e9aaf') => `<button type="button" class="pick-row" ${wrong ? wrongAttr(wrong) : 'data-sim="correct" data-testid="lesson-ok"'}><span class="pick-th avatar" style="background:${color}">${letter}</span><span class="pick-t"><strong>${name}</strong><small>${sub}</small></span></button>`;
  const bubble = (txt, out) => `<div class="bubble ${out ? 'out' : 'in'}">${txt}<span class="bt">12:41${out ? ' <b>✓✓</b>' : ''}</span></div>`;
  const tog = (label, on, wrong, glyph) => `<button type="button" class="qs-tile${on ? ' on' : ''}" ${wrong ? wrongAttr(wrong) : 'data-sim="correct" data-testid="lesson-ok"'}><span>${glyph}</span><em>${label}</em></button>`;
  const card = (cls, inner) => `<div class="${cls}">${inner}</div>`;
  const note = s => `<p class="mock-note">${s}</p>`;
  /* ---------- realistic WhatsApp / Telegram screens (2026 layouts; logos supplied by the project author) ---------- */
  const IC = {
    back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    chev: 'M15.4 4.6 14 3.2 5.2 12l8.8 8.8 1.4-1.4L8 12z',
    phone: 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z',
    video: 'M17 10.5V7c0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1v10c0 .6.4 1 1 1h12c.6 0 1-.4 1-1v-3.5l4 4v-11l-4 4z',
    camera: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z',
    search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    more: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    mic: 'M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z',
    send: 'M2.01 21 23 12 2.01 3 2 10l15 2-15 2z',
    clip: 'M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z',
    emoji: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-3.5-9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 17.5c2.3 0 4.3-1.4 5.1-3.5H6.9c.8 2.1 2.8 3.5 5.1 3.5z',
    bell: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z',
    menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
    pencil: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    chat: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z',
    people: 'M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    person: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    gear: 'M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
    status: 'M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8V2zm0 5a5 5 0 1 0 5 5 5 5 0 0 0-5-5z',
    eye: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    wifi: 'M12 21 0 8.5C3.3 5.4 7.5 3.5 12 3.5s8.7 1.9 12 5L12 21z',
    lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z',
    plane: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
    data: 'M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3 5 6.99h3V14h2V6.99h3L9 3z',
    bt: 'M17.71 7.71 12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z',
    moon: 'M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-3.14-9.8A8.7 8.7 0 0 0 12 3z',
    sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM2 13h2a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm18 0h2a1 1 0 0 0 0-2h-2a1 1 0 0 0 0 2zM11 2v2a1 1 0 0 0 2 0V2a1 1 0 0 0-2 0zm0 18v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-2 0z',
    vol: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
    flash: 'M6 2v11h3v9l7-12h-4l4-8H6z',
    star: 'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
    clock: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
    dial: 'M12 19c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-6 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    warn: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
    tune: 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
    reload: 'M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
    block: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM4 12a8 8 0 0 1 12.9-6.32L5.68 16.9A7.9 7.9 0 0 1 4 12zm8 8a7.9 7.9 0 0 1-4.9-1.68L18.32 7.1A8 8 0 0 1 12 20z'
  };
  const g = (k, c = 'currentColor', s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><path fill="${c}" d="${IC[k]}"/></svg>`;
  const tick = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="#fff" d="M9.6 16.2 5.4 12l-1.4 1.4 5.6 5.6 12-12-1.4-1.4z"/></svg>';
  const verified = `<span class="mx-ver" title="${t('Verified', 'Подтверждён')}">${tick}</span>`;
  const isIos = () => PH.os === 'ios';
  const logo = k => 'data:image/webp;base64,' + ((window.CSIconData || {})['x_' + k] || '');
  const appT = (k, name, wrong) => `<button type="button" class="app-ico" ${wrong ? wrongAttr(wrong) : 'data-sim="correct" data-testid="lesson-ok"'} aria-label="${name}"><span class="app-tile k-${k}"><img src="${logo(k)}" alt=""></span><span class="app-label">${name}</span></button>`;
  const ava = (l, c, s = 48) => `<span class="mx-ava" style="background:${c};width:${s}px;height:${s}px;font-size:${Math.round(s * .4)}px">${l}</span>`;
  const act = (inner, wrong, cls = '') => `<button type="button" class="${cls}" ${wrong ? wrongAttr(wrong) : 'data-sim="correct" data-testid="lesson-ok"'}>${inner}</button>`;
  /* chat header: app = wa|tg */
  const chatHead = (app, name, sub, a, right) => {
    const ios = isIos();
    /* Telegram on iPhone: “‹ Chats” on the left, the name in the middle, the picture on the right */
    if (ios && app === 'tg') return `<div class="mx-head mx-tg-head ios"><span class="mx-hb mx-back-label">${g('chev', 'currentColor', 24)}<em>${t('Chats', 'Чаты')}</em></span><span class="mx-ht"><strong>${name}</strong><small>${sub}</small></span>${a}</div>`;
    return `<div class="mx-head mx-${app}-head${ios ? ' ios' : ''}">${ios ? `<span class="mx-hb">${g('chev', 'currentColor', 24)}</span>` : `<span class="mx-hb">${g('back')}</span>`}${a}<span class="mx-ht"><strong>${name}</strong><small>${sub}</small></span><span class="mx-hi">${right}</span></div>`;
  };
  const msg = (txt, out, time, app, extra = '') => `<div class="mx-b ${out ? 'out' : 'in'}">${txt}<span class="mx-bt">${extra}${time}${out ? ` <i class="mx-ticks">✓✓</i>` : ''}</span></div>`;
  const day = s => `<div class="mx-day"><span>${s}</span></div>`;
  const shell = (app, inner) => `<div class="mx mx-${app}${isIos() ? ' ios' : ' and'}">${inner}</div>`;
  const waTabs = () => {
    const tabs = isIos()
      ? [['status', t('Updates', 'Обновления')], ['phone', t('Calls', 'Звонки')], ['people', t('Communities', 'Сообщества')], ['chat', t('Chats', 'Чаты'), 1], ['gear', t('Settings', 'Настройки')]]
      : [['chat', t('Chats', 'Чаты'), 1], ['status', t('Updates', 'Обновления')], ['people', t('Communities', 'Сообщества')], ['phone', t('Calls', 'Звонки')]];
    return `<div class="mx-tabs" aria-hidden="true">${tabs.map(([k, l, on]) => `<span class="${on ? 'on' : ''}"><b>${g(k, 'currentColor', 22)}</b>${l}</span>`).join('')}</div>`;
  };
  const tgTabs = () => isIos() ? `<div class="mx-tabs tg" aria-hidden="true">${[['person', t('Contacts', 'Контакты')], ['phone', t('Calls', 'Звонки')], ['chat', t('Chats', 'Чаты'), 1], ['gear', t('Settings', 'Настройки')]].map(([k, l, on]) => `<span class="${on ? 'on' : ''}"><b>${g(k, 'currentColor', 22)}</b>${l}</span>`).join('')}</div>` : '';
  /* phone call screens: incoming call and the call in progress */
  const hang = (c = '#fff', z = 30) => `<span class="cl-down">${g('phone', c, z)}</span>`;
  const callIn = again => {
    const ios = isIos();
    const accept = [`You can decline unknown calls too. In this exercise we learn to spot a trick, so answer this time.`, `Незнакомые звонки можно и отклонять. Но в этом упражнении мы учимся распознавать обман, поэтому ответьте.`];
    const answerAgain = [`Do not answer: it is the same number pressing you. Decline the call.`, `Не отвечайте: это тот же номер, который на вас давит. Отклоните вызов.`];
    const banner = again ? `<div class="cl-banner"><span class="cl-banner-ic">${g('chat', '#fff', 16)}</span><span><b>${t('Bank', 'Банк')}</b><small>${t('Confirmation code: 4821. Do not tell it to anyone.', 'Код подтверждения: 4821. Никому не сообщайте его.')}</small></span></div>` : '';
    const decline = act(`<i class="cl-round red">${hang()}</i><span>${t('Decline', 'Отклонить')}</span>`, again ? null : accept, 'cl-btn');
    const answer = act(`<i class="cl-round green">${g('phone', '#fff', 30)}</i><span>${ios ? t('Accept', 'Принять') : t('Answer', 'Ответить')}</span>`, again ? answerAgain : null, 'cl-btn');
    return `<div class="cl-in ${ios ? 'ios' : 'and'}">${banner}${ios ? '' : `<small class="cl-label">${t('Incoming call', 'Входящий вызов')}</small>${ava(g('person', '#fff', 40), '#7b8794', 76)}`}<strong class="cl-num">+7 727 ••• •• 00</strong><small class="cl-sub">${t('Kazakhstan', 'Казахстан')}</small><div class="cl-btns">${decline}${answer}</div></div>`;
  };
  const callOn = () => {
    const ios = isIos();
    const keep = [`That will not help: the caller keeps pressing you. End the call with the red button.`, `Это не поможет: собеседник продолжит давить. Завершите звонок красной кнопкой.`];
    const keys = [`Do not type the code on the keypad: scammers can hear the tones. End the call.`, `Не набирайте код на клавиатуре: мошенники слышат сигналы кнопок. Завершите звонок.`];
    const b = (k, label, wrong) => act(`<i class="cl-round glass">${g(k, '#fff', 26)}</i><span>${label}</span>`, wrong, 'cl-btn small');
    const grid = ios
      ? [b('vol', t('Speaker', 'Динамик'), keep), b('video', 'FaceTime', keep), b('mic', t('Mute', 'Выкл. звук'), keep), b('plus', t('Add', 'Добавить'), keep), b('dial', t('Keypad', 'Клавиши'), keys)]
      : [b('dial', t('Keypad', 'Клавиатура'), keys), b('mic', t('Mute', 'Выкл. звук'), keep), b('vol', t('Speaker', 'Динамик'), keep), b('plus', t('Add call', 'Добавить'), keep), b('clock', t('Hold', 'Удерж.'), keep), b('video', t('Video', 'Видео'), keep)];
    return `<div class="cl-on ${ios ? 'ios' : 'and'}"><strong class="cl-num">+7 727 ••• •• 00</strong><small class="cl-sub">00:47</small><div class="cl-say"><b>${t('Caller:', 'Собеседник:')}</b> ${t('“…tell me the code from SMS right now, or the loan will be approved!”', '«…назовите код из SMS прямо сейчас, иначе кредит одобрят!»')}</div><div class="cl-grid">${grid.join('')}</div>${act(`<i class="cl-round red">${hang()}</i><span>${t('End', 'Отбой')}</span>`, null, 'cl-btn end')}</div>`;
  };
  /* browser: Chrome on Android, Safari on iPhone; on a computer the window already has an address bar */
  const br = (url, body, o = {}) => {
    if (H.device && H.device() === 'computer') return shell('br', `<div class="br-body">${body.replace(/<div class="br-kb"[\s\S]*?<\/div>$/, '')}</div>`);
    const ios = isIos();
    const site = o.warn ? `<span class="br-nsec">${g('warn', '#c5221f', 15)}${t('Not secure', 'Не защищено')}</span>` : o.lock ? g('tune', '#5f6368', 17) : '';
    if (ios) {
      const pill = o.focus ? `<span class="sf-pill focus">${g('search', '#8e8e93', 15)}<span>${t('Search or enter website', 'Поиск или имя сайта')}</span></span>` : `<span class="sf-pill"><span class="sf-aa">${o.warn ? g('warn', '#c5221f', 15) : 'aA'}</span><span class="sf-u">${o.warn ? `<em>${t('Not secure', 'Не защищено')}</em> ` : ''}${url}</span>${g('reload', '#3c3c43', 16)}</span>`;
      return shell('br', `<div class="br-body">${body}</div><div class="sf-bar">${g('chev', '#007aff', 22)}${pill}<span class="sf-more">•••</span></div>`);
    }
    const pill = o.focus ? `<div class="cr-bar focus">${g('back', '#444746', 22)}<span class="cr-pill f"><span>${t('Search or type URL', 'Введите запрос или URL')}</span></span></div>` : `<div class="cr-bar">${g('home', '#444746', 22)}<span class="cr-pill">${site}<span class="cr-u">${url}</span></span><span class="cr-tabs">1</span>${g('more', '#444746', 22)}</div>`;
    return shell('br', `${pill}<div class="br-body">${body}</div>`);
  };
  /* egov.kz website (computer version) */
  const egSite = (inner, active) => `<div class="egw"><div class="egw-top"><span class="egw-logo"><img src="${logo('egov')}" alt="">egov.kz</span><nav>${[t('Home', 'Главная'), t('Services', 'Услуги'), t('Messages', 'Сообщения'), t('My profile', 'Мой профиль'), t('News', 'Новости')].map((n, i) => `<span class="${i === active ? 'on' : ''}">${n}</span>`).join('')}</nav><span class="egw-lang">РУС ▾</span><span class="egw-user">${g('person', '#fff', 16)}</span></div>${inner}<div class="egw-foot">© ${t('Electronic government of Kazakhstan · practice copy', 'Электронное правительство РК · учебная копия')}</div></div>`;
  const egTabs = on => `<div class="mx-tabs eg" aria-hidden="true">${[['home', t('Home', 'Главная')], ['people', t('Services', 'Сервисы')], ['bell', t('Messages', 'Сообщения')], ['person', t('Profile', 'Профиль')]].map(([k, l], i) => `<span class="${i === on ? 'on' : ''}"><b>${g(k, 'currentColor', 22)}</b>${l}</span>`).join('')}</div>`;
  const chatRow = (a, name, last, time, unread, wrong, cls = '') => act(`${a}<span class="mx-rt"><span class="mx-r1"><strong>${name}</strong><time class="${unread ? 'u' : ''}">${time}</time></span><span class="mx-r2"><small>${last}</small>${unread ? `<em>${unread}</em>` : ''}</span></span>`, wrong, 'mx-row ' + cls);

  return {
    /* shared screen parts, used by the scam trainer (trainer.js) */
    kit: {g, ava, chatHead, msg, day, shell, isIos, logo, verified},
    egov: {
      icon: 'eG', title: t('Get a certificate in eGov', 'Получить справку в eGov'),
      description: t('Open the official app, log in safely and find a service.', 'Открыть официальное приложение, безопасно войти и найти услугу.'),
      takeaway: t('Install only official apps, never give an SMS code or password to anyone, and find documents only inside the app.', 'Ставьте только официальные приложения, не называйте никому код из SMS и пароль, документы ищите только внутри приложения.'),
      steps: [
        {title: ['Open the official eGov app', 'Откройте официальное приложение eGov'], text: ['Find “eGov mobile” on the screen and open it.', 'Найдите на экране «eGov mobile» и откройте его.'],
          hint: ['The official app is a blue square with the white word “egov” and “mobile” under it. Download government apps only from the official store and check the publisher.', 'Официальное приложение: синий квадрат с белой надписью «egov» и словом «mobile». Приложения госуслуг скачивают только из официального магазина, проверяя издателя.'],
          ok: [H.device() === 'computer' ? 'This is the official site egov.kz. Let us log in.' : 'This is the official app. Let us log in.', H.device() === 'computer' ? 'Это официальный сайт egov.kz. Теперь войдём.' : 'Это нужное приложение. Теперь войдём.'], bar: null, home: true, pcUrl: t('egov kazakhstan', 'егов казахстан'),
          ...(H.device() === 'computer' ? {title: ['Open the official eGov site', 'Откройте официальный сайт eGov'], text: ['You searched for eGov. Open the official site egov.kz.', 'Вы ввели в поиск «егов». Откройте официальный сайт egov.kz.'], hint: ['The official address is exactly egov.kz. Ads are marked “Sponsored”, and copies have similar but different addresses.', 'Официальный адрес ровно egov.kz. Реклама помечена «Реклама», а у копий адрес похожий, но другой.']} : {}),
          pc: () => {
            const res = (ad, fav, c, site, url, title, snip, w) => act(`${ad ? `<b class="br-ad">${t('Sponsored', 'Реклама')}</b>` : ''}<span class="br-site"><span class="br-fav" style="background:${c}">${fav}</span><span><strong>${site}</strong><small>${url}</small></span></span><span class="br-title">${title}</span><span class="br-snip">${snip}</span>`, w, 'br-res');
            return shell('br', `<div class="br-body"><div class="egw-note">${t('On a computer eGov is a website. Choose the official one.', 'На компьютере eGov это сайт. Выберите официальный.')}</div>${res(true, 'e', '#c0392b', 'eGov Fast', 'egov-fast.top', t('All certificates without login — fast!', 'Все справки без входа — быстро!'), t('Enter your IIN and card number and get any document.', 'Введите ИИН и номер карты и получите любой документ.'), [`An ad with a strange address (.top). Government services are only on egov.kz.`, `Реклама с подозрительным адресом (.top). Госуслуги есть только на egov.kz.`])}${res(false, `<img src="${logo('egov')}" alt="">`, '#2f6fe4', 'eGov.kz', 'egov.kz', t('Electronic government of Kazakhstan', 'Электронное правительство Республики Казахстан'), t('Public services online: certificates, registration, payments.', 'Государственные услуги онлайн: справки, регистрация, оплата.'))}${res(false, 'e', '#7b5ea7', 'egov-kz.net', 'egov-kz.net', t('eGov login — enter your password here', 'Вход в eGov — введите пароль здесь'), t('Copy of the portal', 'Портал госуслуг'), [`The address is not egov.kz, it only looks similar. This is a fake.`, `Адрес не egov.kz, он только похож. Это подделка.`])}</div>`);
          },
          view: () => grid([known('photos', 'Photos', 'Фото', notThis), appT('egov', 'eGov mobile'), tile('#c94f4f', svg('M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V9h2v4Z'), 'eGov Fast', 'eGov Быстро', [`This name looks similar but is not “eGov mobile”. Copies like this can steal data.`, `Название похоже, но это не «eGov mobile». Такие копии могут красть данные.`]), known('mail', 'Mail', 'Почта', notThis)])},
        {title: ['Log in safely', 'Войдите безопасно'], text: ['eGov asks for your quick access code. Log in the safe way.', 'eGov просит код быстрого доступа. Войдите безопасным способом.'],
          hint: ['You log in yourself, inside the app: with your own code or fingerprint / Face ID. Nobody, not even an “employee”, needs your SMS code.', 'Входят только сами и только в приложении: своим кодом или отпечатком / Face ID. Код из SMS не нужен никому, даже «сотруднику».'],
          ok: ['Right: you log in yourself, inside the app.', 'Верно: вы входите сами и только внутри приложения.'], bar: ['Login', 'Вход'], skin: 'eg', pcUrl: 'idp.egov.kz',
          pc: () => egSite(`<div class="egw-login"><div class="egw-card"><h3>${t('Log in to egov.kz', 'Вход на egov.kz')}</h3><div class="egw-tabs"><span class="on">eGov QR</span><span>${t('Digital signature', 'ЭЦП')}</span><span>${t('Login and password', 'Логин и пароль')}</span></div><div class="egw-qr"><div class="egw-qrbox">${'<i></i>'.repeat(49)}</div><p>${t('Open eGov mobile on your phone, tap “eGov QR” and scan this code.', 'Откройте eGov mobile на телефоне, нажмите «eGov QR» и отсканируйте этот код.')}</p></div>${act(`${g('camera', '#fff', 18)} ${t('I scanned the code in my own eGov mobile', 'Я отсканировал код в своём eGov mobile')}`, null, 'egw-btn')}</div><div class="egw-chat"><b>${t('Online support', 'Онлайн-поддержка')} ●</b><p>${t('Hello! To log in faster, send me the code from your SMS and your password.', 'Здравствуйте! Чтобы войти быстрее, пришлите мне код из SMS и пароль.')}</p>${act(t('Send the code', 'Отправить код'), [`Never. A real employee never asks for an SMS code or password. Log in yourself with eGov QR.`, `Нельзя. Настоящий сотрудник никогда не просит код из SMS и пароль. Войдите сами через eGov QR.`], 'egw-chatbtn')}</div></div>`, -1),
          view: () => {
            const ios = isIos();
            const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(k => `<span class="eg-key${k ? '' : ' e'}">${k}</span>`).join('');
            const banner = act(`<span class="eg-ban-i">${g('chat', '#fff', 16)}</span><span><b>+7 776 ••• •• 31</b><small>${t('eGov employee: tell me the SMS code, I will log in for you', 'Сотрудник eGov: продиктуйте код из SMS, я войду за вас')}</small></span>`, [`This is a scammer. A real employee never asks for an SMS code. Log in yourself with your fingerprint or Face ID.`, `Это мошенник. Настоящий сотрудник никогда не просит код из SMS. Войдите сами по отпечатку или Face ID.`], 'eg-ban');
            return shell('eg', `${banner}<div class="eg-login"><img class="eg-logo" src="${logo('egov')}" alt="eGov mobile"><h3>${t('Enter quick access code', 'Введите код быстрого доступа')}</h3><div class="eg-dots"><i></i><i></i><i></i><i></i></div><div class="eg-keys">${keys}</div>${act(`${ios ? '◉' : g('person', 'currentColor', 18)} ${ios ? t('Log in with Face ID', 'Войти по Face ID') : t('Log in with fingerprint', 'Войти по отпечатку пальца')}`, null, 'eg-bio')}<span class="eg-forgot">${t('Forgot the code?', 'Забыли код?')}</span></div>`);
          }},
        {title: ['Find the service', 'Найдите услугу'], text: ['You need a (practice) “Family composition certificate”. Find it on the main screen.', 'Нужна учебная «Справка о составе семьи». Найдите её на главном экране.'],
          hint: ['Popular services are shown as icons on the main screen. You can also type the name in the search at the top.', 'Популярные услуги показаны значками на главном экране. Можно и набрать название в поиске сверху.'],
          ok: ['You found the service. The request is sent.', 'Нужная услуга найдена, заявка отправлена.'], bar: ['Services', 'Услуги'], skin: 'eg', pcUrl: 'egov.kz/cms/ru',
          pc: () => {
            const svc = (icon, en, ru, wrong) => act(`<span class="eg-si">${g(icon, '#2f6fe4', 22)}</span><span>${t(en, ru)}</span>`, wrong, 'eg-svc');
            return egSite(`<div class="egw-hero"><h2>${t('Public services for citizens', 'Государственные услуги для граждан')}</h2><div class="egw-search">${g('search', '#8a94a6', 20)}<span>${t('Search services', 'Поиск услуг')}</span><b>${t('Find', 'Найти')}</b></div><div class="egw-cats"><span class="on">${t('For citizens', 'Гражданам')}</span><span>${t('For business', 'Бизнесу')}</span></div></div><div class="egw-body"><h4>${t('Popular services', 'Популярные услуги')}</h4><div class="egw-grid">${svc('people', 'Family composition certificate', 'Справка о составе семьи')}${svc('phone', 'Doctor appointment', 'Запись на приём к врачу', [`That is a different service. Look for the certificate.`, `Это другая услуга. Ищите справку.`])}${svc('block', 'Fines', 'Штрафы', [`That is for fines, not a certificate.`, `Это штрафы, а не справка.`])}${svc('person', 'Address certificate', 'Адресная справка', [`Close, but you need the family composition certificate.`, `Похоже, но нужна справка о составе семьи.`])}</div></div>`, 1);
          },
          view: () => {
            const svc = (icon, en, ru, wrong) => act(`<span class="eg-si">${g(icon, '#2f6fe4', 22)}</span><span>${t(en, ru)}</span>`, wrong, 'eg-svc');
            return shell('eg', `<div class="eg-top"><span class="mx-ava eg-me">${g('person', '#fff', 20)}</span><span class="eg-hi"><small>${t('Good afternoon', 'Добрый день')}</small><strong>${t('Gulnara', 'Гульнара')}</strong></span>${g('bell', '#fff', 22)}</div><div class="eg-sr"><span class="mx-search">${g('search', '#8a94a6', 20)}<span>${t('Search services', 'Поиск услуг')}</span></span><span class="eg-ai">AI</span></div><div class="eg-body"><div class="eg-docs"><div class="eg-doc"><small>${t('Digital documents', 'Цифровые документы')}</small><strong>${t('ID card', 'Удостоверение личности')}</strong><span>${t('Show QR', 'Показать QR')}</span></div><div class="eg-doc b"><small>${t('Digital documents', 'Цифровые документы')}</small><strong>${t('Passport', 'Паспорт')}</strong></div></div><h4>${t('Popular services', 'Популярные услуги')}</h4><div class="eg-grid">${svc('people', 'Family composition certificate', 'Справка о составе семьи')}${svc('phone', 'Doctor appointment', 'Запись к врачу', [`That is a different service. Look for the certificate.`, `Это другая услуга. Ищите справку.`])}${svc('block', 'Fines', 'Штрафы', [`That is for fines, not a certificate.`, `Это штрафы, а не справка.`])}${svc('person', 'Address certificate', 'Адресная справка', [`Close, but you need the family composition certificate.`, `Похоже, но нужна справка о составе семьи.`])}</div></div>${egTabs(0)}`);
          }},
        {title: ['Where is the finished document?', 'Где готовый документ?'], text: ['The certificate is ready. Open it where eGov really sends it.', 'Справка готова. Откройте её там, куда eGov присылает её на самом деле.'],
          hint: ['Ready documents come to “Messages” inside the app and are kept in your profile. Not in SMS with links from unknown numbers.', 'Готовые документы приходят в «Сообщения» внутри приложения и хранятся в вашем профиле. Не в SMS со ссылкой от незнакомого номера.'],
          ok: ['Yes: in “Messages” inside the app.', 'Да: в «Сообщениях» внутри приложения.'], bar: ['Request', 'Заявка'], skin: 'eg', pcUrl: 'egov.kz/services/history',
          pc: () => egSite(`<div class="egw-mail">${g('chat', '#fff', 16)}<span><b>${t('New email', 'Новое письмо')}: egov-support@mail-kz.top</b><small>${t('Your certificate is ready! Download the file: certificate.exe', 'Ваша справка готова! Скачайте файл: spravka.exe')}</small></span>${act(t('Download', 'Скачать'), [`This is a fake email with a program file (.exe). Do not download it. Documents are in your account on egov.kz.`, `Это поддельное письмо с файлом-программой (.exe). Скачивать нельзя. Документы лежат в личном кабинете на egov.kz.`], 'egw-mailbtn')}</div><div class="egw-body"><h3>${t('My requests', 'История заявок')}</h3><div class="egw-table"><div class="egw-tr h"><span>${t('Service', 'Услуга')}</span><span>${t('Date', 'Дата')}</span><span>${t('Status', 'Статус')}</span><span></span></div><div class="egw-tr"><span>${t('Family composition certificate', 'Справка о составе семьи')}</span><span>27.10.2026</span><span><i class="eg-st">${t('Completed', 'Исполнена')}</i></span><span>${act(t('Open document', 'Открыть документ'), null, 'egw-open')}</span></div><div class="egw-tr"><span>${t('Attachment to a clinic', 'Прикрепление к поликлинике')}</span><span>26.10.2026</span><span><i class="eg-st grey">${t('In progress', 'В работе')}</i></span><span></span></div></div></div>`, 2),
          view: () => shell('eg', `${act(`<span class="eg-ban-i">${g('chat', '#fff', 16)}</span><span><b>+7 701 ••• •• 77</b><small>${t('Your certificate is ready! Download: egov-kz.top/doc', 'Ваша справка готова! Скачайте: egov-kz.top/doc')}</small></span>`, [`This SMS is from an unknown number with a fake address (not egov.kz). Do not open it.`, `Это SMS от незнакомого номера с поддельным адресом (не egov.kz). Открывать нельзя.`], 'eg-ban')}<div class="eg-head"><strong>${t('Messages', 'Сообщения')}</strong></div><div class="eg-chips"><span class="on">${t('Services', 'Услуги')}</span><span>${t('News', 'Новости')}</span><span>${t('Surveys', 'Опросы')}</span></div><div class="eg-body">${act(`<span class="eg-st">${t('Completed', 'Исполнена')}</span><strong>${t('Family composition certificate', 'Справка о составе семьи')}</strong><small>${t('Request № 0000 (practice) · today, 14:20', 'Заявка № 0000 (учебная) · сегодня, 14:20')}</small><span class="eg-open">${t('Open document', 'Открыть документ')}</span>`, null, 'eg-msg')}<div class="eg-msg old"><span class="eg-st grey">${t('In progress', 'В работе')}</span><strong>${t('Attachment to a clinic', 'Прикрепление к поликлинике')}</strong><small>${t('yesterday', 'вчера')}</small></div></div>${egTabs(2)}`)}
      ]
    },

    whatsapp: {
      icon: '✆', title: t('Message a relative in WhatsApp', 'Написать близким в WhatsApp'),
      description: t('Open a chat, send a message and refuse a code request.', 'Открыть чат, отправить сообщение и отказать в просьбе назвать код.'),
      takeaway: t('Never tell anyone the code from an SMS, even if the message looks official. Check unknown numbers before replying.', 'Код из SMS никому не называют, даже если сообщение выглядит официально. Незнакомые номера проверяйте, прежде чем отвечать.'),
      steps: [
        {title: ['Open WhatsApp', 'Откройте WhatsApp'], text: ['Find the green WhatsApp icon and open it.', 'Найдите зелёный значок WhatsApp и откройте его.'],
          hint: ['WhatsApp is a green icon with a white speech bubble and a phone handset. The name is written under it.', 'WhatsApp: зелёный значок с белым облачком и трубкой. Название написано под ним.'],
          ok: ['WhatsApp is open.', 'WhatsApp открыт.'], bar: null, home: true,
          view: () => grid([known('photos', 'Photos', 'Фото', notThis), appT('whatsapp', 'WhatsApp'), known('clock', 'Clock', 'Часы', notThis), known('camera', 'Camera', 'Камера', notThis), appT('telegram', 'Telegram', [`This is Telegram, another messenger. You need the green WhatsApp icon.`, `Это Telegram, другой мессенджер. Нужен зелёный значок WhatsApp.`])])},
        {title: ['Open the right chat', 'Откройте нужный чат'], text: ['Open the chat with your granddaughter Aigerim.', 'Откройте чат с внучкой Айгерим.'],
          hint: ['Chats are shown with a name, the last message and the time. Choose the one with the name from the task.', 'В списке чатов видно имя, последнее сообщение и время. Выберите чат с именем из задания.'],
          ok: ['Chat with Aigerim is open.', 'Чат с Айгерим открыт.'], bar: ['Chats', 'Чаты'], skin: 'wa',
          view: () => {
            const ios = isIos();
            const top = ios
              ? `<div class="mx-ios-top"><span class="mx-dots">${g('more', '#000', 20)}</span><span class="mx-hi">${g('camera', '#000', 22)}<span class="mx-plus">${g('plus', '#fff', 18)}</span></span></div><h3 class="mx-large">${t('Chats', 'Чаты')}</h3>`
              : `<div class="mx-wa-bar"><strong>WhatsApp</strong><span class="mx-hi">${g('camera', '#1d1f1f')}${g('more', '#1d1f1f')}</span></div>`;
            const chips = `<div class="mx-chips"><span class="on">${t('All', 'Все')}</span><span>${t('Unread', 'Непрочитанные')} 1</span><span>${t('Favourites', 'Избранное')}</span><span>${t('Groups', 'Группы')}</span></div>`;
            const rows = chatRow(ava(g('person', '#fff', 30), '#c9d0d4'), '+7 707 ••• •• 58', t('You won a prize! Follow the link 🎁', 'Вы выиграли приз! Перейдите по ссылке 🎁'), '12:52', 1, [`This is an unknown number with a suspicious message. Do not open it.`, `Это незнакомый номер с подозрительным сообщением. Открывать его не нужно.`])
              + chatRow(ava('А', '#e17f9b'), t('Aigerim (granddaughter)', 'Айгерим (внучка)'), t('Grandma, are you coming on Sunday?', 'Бабушка, ты придёшь в воскресенье?'), '12:38', 0, null)
              + chatRow(ava('Д', '#7a8b3a'), t('Neighbour Dosym', 'Сосед Досым'), `<i class="mx-ticks blue">✓✓</i> ${t('Thank you!', 'Спасибо!')}`, t('Yesterday', 'Вчера'), 0, [`This is your neighbour. The task asks for Aigerim.`, `Это сосед. В задании нужна Айгерим.`]);
            return shell('wa', `${top}<div class="mx-search">${g('search', '#8696a0', 20)}<span>${t('Search', 'Поиск')}</span></div>${chips}<div class="mx-list">${rows}</div>${ios ? '' : `<span class="mx-fab" aria-hidden="true">${g('plus', '#fff', 24)}</span>`}${waTabs()}`);
          }},
        {title: ['Send a message', 'Отправьте сообщение'], text: ['The answer is typed. Press the send button.', 'Ответ уже набран. Нажмите кнопку отправки.'],
          hint: ['The green round button with an arrow sends the text. The paperclip adds a file, the camera takes a photo.', 'Зелёная круглая кнопка со стрелкой отправляет текст. Скрепка прикрепляет файл, камера делает снимок.'],
          ok: ['Sent! The check marks show it was delivered, and they turn blue when Aigerim reads it.', 'Отправлено! Галочки показывают, что сообщение доставлено. Когда Айгерим прочитает его, они станут синими.'], bar: ['Aigerim', 'Айгерим'], skin: 'wa',
          view: () => {
            const ios = isIos();
            const clip = act(g(ios ? 'plus' : 'clip', '#54656f', 24), [`The ${ios ? 'plus' : 'paperclip'} adds a file or photo. To send text, press the green arrow button.`, `${ios ? 'Плюс' : 'Скрепка'} прикрепляет файл или фото. Чтобы отправить текст, нажмите зелёную кнопку со стрелкой.`], 'mx-ib');
            const cam = act(g('camera', '#54656f', 22), [`The camera takes a photo. To send text, press the green arrow button.`, `Камера делает снимок. Чтобы отправить текст, нажмите зелёную кнопку со стрелкой.`], 'mx-ib');
            const input = ios
              ? `<div class="mx-compose">${clip}<span class="mx-input"><span>${t('Yes, I will come! 🙂', 'Да, приду! 🙂')}</span></span>${cam}${act(g('send', '#fff', 20), null, 'mx-send')}</div>`
              : `<div class="mx-compose"><span class="mx-input">${g('emoji', '#54656f', 24)}<span>${t('Yes, I will come! 🙂', 'Да, приду! 🙂')}</span>${clip}${cam}</span>${act(g('send', '#fff', 20), null, 'mx-send')}</div>`;
            return shell('wa', `${chatHead('wa', t('Aigerim', 'Айгерим'), t('online', 'в сети'), ava('А', '#e17f9b', 36), g('video', 'currentColor') + g('phone', 'currentColor', 20) + (ios ? '' : g('more', 'currentColor')))}<div class="mx-wall">${day(t('Today', 'Сегодня'))}${msg(t('Hi Grandma! 😊', 'Привет, бабушка! 😊'), false, '12:37')}${msg(t('Are you coming on Sunday?', 'Ты придёшь в воскресенье?'), false, '12:38')}</div>${input}`);
          }},
        {title: ['A code request', 'Просьба назвать код'], text: ['A stranger asks for your SMS code. Protect yourself.', 'Незнакомец просит код из SMS. Защитите себя.'],
          hint: ['The code from an SMS lets another person take over your account. No real support asks for it. Unknown numbers can be blocked at once.', 'Код из SMS позволяет чужому человеку забрать ваш аккаунт. Настоящая поддержка его не просит. Незнакомый номер можно сразу заблокировать.'],
          ok: ['Correct: never share the code, block the number. WhatsApp will also offer to report it.', 'Верно: код не называть, номер заблокировать. WhatsApp сразу предложит и пожаловаться.'], bar: ['Unknown', 'Незнакомец'], skin: 'wa',
          view: () => {
            const ios = isIos();
            return shell('wa', `${chatHead('wa', '+7 771 ••• •• 04', t('not in your contacts', 'нет в ваших контактах'), ava(g('person', '#fff', 22), '#c9d0d4', 36), g('video', 'currentColor') + g('phone', 'currentColor', 20) + (ios ? '' : g('more', 'currentColor')))}<div class="mx-wall">${day(t('Today', 'Сегодня'))}<div class="mx-sys">${t('This number is not in your contacts', 'Этого номера нет в ваших контактах')}<div class="mx-sys-b">${act(`${g('block', '#ea0038', 18)} ${t('Block', 'Заблокировать')}`, null, 'mx-sysbtn red')}${act(`${g('person', '#008069', 18)} ${t('Add', 'Добавить')}`, [`Do not add a stranger to your contacts. Block the number instead.`, `Незнакомца не нужно добавлять в контакты. Лучше заблокировать номер.`], 'mx-sysbtn')}</div></div>${msg(t('Hello, this is WhatsApp support. Tell us the 6-digit code from your SMS or your account will be blocked today.', 'Здравствуйте, это поддержка WhatsApp. Назовите 6-значный код из SMS, иначе аккаунт сегодня заблокируют.'), false, '13:05')}</div><div class="mx-compose"><span class="mx-input"><span>${t('My code is 4 8 …', 'Мой код: 4 8 …')}</span></span>${act(g('send', '#fff', 20), [`Never send the code. With it a stranger takes over your WhatsApp.`, `Код отправлять нельзя. С ним чужой человек заберёт ваш WhatsApp.`], 'mx-send')}</div>`);
          }}
      ]
    },

    telegram: {
      icon: '➤', title: t('Join a channel in Telegram', 'Подписаться на канал в Telegram'),
      description: t('Find a real channel, subscribe and mute notifications.', 'Найти настоящий канал, подписаться и отключить уведомления.'),
      takeaway: t('Check that a channel is the real one (look at the name and the check mark) and do not follow “prize” or “easy money” links.', 'Проверяйте, что канал настоящий (название и галочка), и не переходите по ссылкам про «призы» и «лёгкие деньги».'),
      steps: [
        {title: ['Open Telegram', 'Откройте Telegram'], text: ['Find the blue Telegram icon with a paper plane and open it.', 'Найдите синий значок Telegram с бумажным самолётиком и откройте его.'],
          hint: ['Telegram is a blue icon with a white paper plane. The name is under the icon.', 'Telegram: синий значок с белым бумажным самолётиком. Название подписано под значком.'],
          ok: ['Telegram is open.', 'Telegram открыт.'], bar: null, home: true,
          view: () => grid([known('mail', 'Mail', 'Почта', notThis), appT('whatsapp', 'WhatsApp', [`This is WhatsApp, another messenger. You need the blue Telegram icon.`, `Это WhatsApp, другой мессенджер. Нужен синий значок Telegram.`]), known('globe', 'Browser', 'Браузер', notThis), appT('telegram', 'Telegram'), known('camera', 'Camera', 'Камера', notThis)])},
        {title: ['Find the real channel', 'Найдите настоящий канал'], text: ['You searched for “Confident Steps”. Choose the real (verified) channel.', 'Вы ввели в поиск «Уверенный шаг». Выберите настоящий (подтверждённый) канал.'],
          hint: ['The real channel has a blue check mark next to its name and many subscribers. Copies often add words like “prize” or “bonus”.', 'У настоящего канала рядом с названием синяя галочка и много подписчиков. У копий часто добавлены слова вроде «призы» или «бонус».'],
          ok: ['This is the verified channel.', 'Это подтверждённый канал.'], bar: ['Search', 'Поиск'], skin: 'tg',
          view: () => {
            const ios = isIos();
            const q = t('Confident Steps', 'Уверенный шаг');
            const top = ios
              ? `<div class="mx-tg-search ios"><span class="mx-search">${g('search', '#8e8e93', 18)}<span>${q}</span></span><span class="mx-cancel">${t('Cancel', 'Отмена')}</span></div>`
              : `<div class="mx-head mx-tg-head">${g('back')}<span class="mx-ht"><strong>${q}</strong></span><span class="mx-hi">${g('more', 'currentColor')}</span></div>`;
            const rows = chatRow(ava('У', '#2aabee'), `${q} ${verified}`, t('channel · 1 245 subscribers', 'канал · 1 245 подписчиков'), '', 0, null, 'tg')
              + chatRow(ava('У', '#e8a33d'), t('Confident Steps | Prizes 🎁', 'Уверенный шаг | Призы 🎁'), t('channel · 38 subscribers', 'канал · 38 подписчиков'), '', 0, [`No check mark, few subscribers and “prizes” in the name: this is a copy. Choose the channel with the check mark.`, `Нет галочки, мало подписчиков и «призы» в названии: это копия. Выберите канал с галочкой.`], 'tg')
              + chatRow(ava('B', '#8e6bd8'), 'uverenny_shag_bonus_bot', t('bot · “easy money”', 'бот · «лёгкий заработок»'), '', 0, [`This is a bot promising easy money. It is not the channel you need.`, `Это бот, который обещает лёгкие деньги. Нужный канал не он.`], 'tg');
            return shell('tg', `${top}<div class="mx-tg-filters"><span class="on">${t('Chats', 'Чаты')}</span><span>${t('Channels', 'Каналы')}</span><span>${t('Apps', 'Приложения')}</span><span>${t('Media', 'Медиа')}</span></div><div class="mx-sec">${t('Global search', 'Глобальный поиск')}</div><div class="mx-list">${rows}</div>${tgTabs()}`);
          }},
        {title: ['Subscribe', 'Подпишитесь'], text: ['This is the real channel. Press “Join” at the bottom to subscribe.', 'Это настоящий канал. Нажмите «Подписаться» внизу.'],
          hint: ['The wide button at the very bottom of a channel subscribes you. Do not open links in forwarded posts from unknown channels.', 'Широкая кнопка в самом низу канала оформляет подписку. Ссылки в пересланных сообщениях из незнакомых каналов открывать не нужно.'],
          ok: ['You subscribed. New posts will appear in your chat list.', 'Вы подписались. Новые записи будут появляться в списке чатов.'], bar: ['Confident Steps', 'Уверенный шаг'], skin: 'tg',
          view: () => {
            const ios = isIos();
            const views = `${g('eye', 'currentColor', 13)} 1,1 ${t('K', 'тыс.')} · `;
            const fwd = `<div class="mx-b in"><span class="mx-fwd">${t('Forwarded from “Bonus Club”', 'Переслано из «Бонус-клуб»')}</span>${t('🎁 Everyone gets a gift today!', '🎁 Сегодня всем подарок!')}${act(t('Get your gift →', 'Получить подарок →'), [`This is a forwarded advert with a link. Do not open it. Subscribe with the button at the bottom.`, `Это пересланная реклама со ссылкой. Открывать её не нужно. Подпишитесь кнопкой внизу.`], 'mx-link')}<span class="mx-bt">${views}11:20</span></div>`;
            return shell('tg', `${chatHead('tg', `${t('Confident Steps', 'Уверенный шаг')} ${verified}`, t('1 245 subscribers', '1 245 подписчиков'), ava('У', '#2aabee', 36), ios ? '' : g('search', 'currentColor') + g('more', 'currentColor'))}<div class="mx-wall">${day(t('Monday', 'Понедельник'))}${msg(t('Welcome! Every Monday: one short tip for your phone.', 'Добро пожаловать! Каждый понедельник один короткий совет для телефона.'), false, '10:02', 'tg', views)}${fwd}</div>${act(ios ? `<span>${t('Join', 'Подписаться')}</span>` : t('JOIN', 'ПОДПИСАТЬСЯ'), null, 'mx-join' + (ios ? ' ios' : ''))}`);
          }},
        {title: ['Mute notifications', 'Отключите уведомления'], text: ['The channel sends too many notifications. Turn the sound off.', 'Канал присылает слишком много уведомлений. Выключите звук.'],
          hint: ['On the channel page, the “Mute” button with a bell turns notifications off. You stay subscribed.', 'На странице канала кнопка «Звук» с колокольчиком отключает уведомления. Подписка при этом остаётся.'],
          ok: ['Notifications are off. You can read the channel any time.', 'Уведомления отключены. Канал можно читать в любое время.'], bar: ['Settings', 'Настройки'], skin: 'tg',
          view: () => {
            const ios = isIos();
            return shell('tg', `<div class="mx-prof${ios ? ' ios' : ''}"><div class="mx-prof-top">${g(ios ? 'chev' : 'back', 'currentColor', 24)}<span>${ios ? t('Edit', 'Изм.') : g('more', 'currentColor')}</span></div>${ava('У', '#2aabee', 84)}<h3>${t('Confident Steps', 'Уверенный шаг')} ${verified}</h3><small>${t('1 245 subscribers', '1 245 подписчиков')}</small></div><div class="mx-acts">${act(`${g('bell', 'currentColor')}<span>${t('Mute', 'Звук')}</span>`, null, 'mx-act')}<span class="mx-act" aria-hidden="true">${g('search', 'currentColor')}<span>${t('Search', 'Поиск')}</span></span><span class="mx-act" aria-hidden="true">${g('more', 'currentColor')}<span>${t('More', 'Ещё')}</span></span></div><div class="mx-card"><small>${t('description', 'описание')}</small><p>${t('One short phone tip every Monday. Practice channel.', 'Один короткий совет про телефон каждый понедельник. Учебный канал.')}</p></div><div class="mx-card">${act(t('Report', 'Пожаловаться'), [`Reporting is for dangerous channels. This one is fine; just turn the sound off.`, `Жалоба нужна для опасных каналов. Этот безопасен, достаточно выключить звук.`], 'mx-li')}${act(t('Leave channel', 'Покинуть канал'), [`That unsubscribes you. You only need to turn notifications off.`, `Так вы отпишетесь. Нужно только выключить уведомления.`], 'mx-li red')}</div>`);
          }}
      ]
    },

    phone: {
      icon: '☎', title: t('Phone basics: Wi‑Fi, data, a call and sound', 'Основы телефона: Wi‑Fi, интернет, звонок и звук'),
      description: t('Connect to a safe network, turn on mobile data, call a relative and make the ringtone louder.', 'Подключиться к безопасной сети, включить мобильный интернет, позвонить родным и сделать звонок громче.'),
      takeaway: t('Prefer secured home Wi‑Fi, use mobile data away from home, call 112 only in an emergency, and use the side buttons for volume.', 'Выбирайте защищённый домашний Wi‑Fi, вне дома пользуйтесь мобильным интернетом, на 112 звоните только в опасности, а громкость меняйте боковыми кнопками.'),
      steps: [
        {title: ['Choose a safe Wi‑Fi', 'Выберите безопасный Wi‑Fi'], text: ['Connect to your home network “Home_Almaty” (with a lock).', 'Подключитесь к домашней сети «Home_Almaty» (со значком замка).'],
          hint: ['A lock means the network needs a password. Open networks without a lock are not safe for banks and government services.', 'Замок означает, что нужен пароль. Открытые сети без замка небезопасны для банка и госуслуг.'],
          ok: ['Connected to the home network.', 'Подключено к домашней сети.'], bar: ['Wi‑Fi', 'Wi‑Fi'], skin: 'set',
          view: () => {
            const ios = isIos();
            const nets = [
              ['Home_Almaty', true, 4, t('Secured', 'Защищена'), null],
              ['Free_WiFi_Cafe', false, 3, t('Open', 'Открытая'), [`Open networks are risky: others can see what you do. Use your home network.`, `Открытые сети рискованны: другие могут видеть, что вы делаете. Подключайтесь к домашней.`]],
              ['TP-Link_Guest', true, 2, t('Secured', 'Защищена'), [`This is a neighbour's network. You do not know its password. Choose your home network.`, `Это сеть соседа, пароля от неё вы не знаете. Выберите домашнюю.`]],
              ['MegaFree_5G', false, 1, t('Open', 'Открытая'), [`An open network without a password. Not safe.`, `Открытая сеть без пароля. Это небезопасно.`]]
            ];
            const wifiI = n => `<span class="st-wifi s${n}">${g('wifi', 'currentColor', 20)}</span>`;
            const lockI = g('lock', 'currentColor', 15);
            const rowsHtml = nets.map(([n, lock, s, sub, w]) => act(ios
              ? `<span class="st-n">${n}</span><span class="st-r">${lock ? lockI : ''}${wifiI(s)}<span class="st-info">i</span></span>`
              : `${wifiI(s)}<span class="st-t"><strong>${n}</strong><small>${lock ? sub : t('Open · not secure', 'Открытая · не защищена')}</small></span>${lock ? lockI : ''}`, w, 'st-row')).join('');
            return shell('set', ios
              ? `<div class="st-nav"><span>${g('chev', 'currentColor', 22)} ${t('Settings', 'Настройки')}</span></div><h3 class="mx-large">Wi‑Fi</h3><div class="st-group"><div class="st-row static"><span class="st-n"><b>Wi‑Fi</b></span><span class="sw on"></span></div></div><div class="st-cap">${t('NETWORKS', 'СЕТИ')}</div><div class="st-group">${rowsHtml}</div>`
              : `<div class="st-nav and">${g('back', 'currentColor', 24)}<strong>${t('Internet', 'Интернет')}</strong></div><div class="st-pill"><b>Wi‑Fi</b><span class="sw on"></span></div><div class="st-cap and">${t('Available networks', 'Доступные сети')}</div><div class="st-list">${rowsHtml}</div>`);
          }},
        {title: ['Turn on mobile data', 'Включите мобильный интернет'], text: ['You are away from home. Turn on mobile data in the quick panel.', 'Вы не дома. Включите мобильный интернет в быстрой панели.'],
          hint: [isIos() ? 'Swipe down from the top right corner to open Control Centre. Mobile data is the green button with an antenna. The plane turns everything off.' : 'Swipe down from the top of the screen to open the quick panel. “Mobile data” has two arrows. Airplane mode turns everything off.', isIos() ? 'Пункт управления открывают свайпом вниз от правого верхнего угла. Сотовые данные: зелёная кнопка с антенной. Самолёт отключает всё.' : 'Быстрая панель открывается свайпом вниз от верха экрана. «Мобильный интернет» отмечен двумя стрелками. Режим полёта отключает всё.'],
          ok: ['Mobile data is on.', 'Мобильный интернет включён.'], bar: ['Quick panel', 'Быстрая панель'], skin: 'cc',
          view: () => {
            const ios = isIos();
            const airplane = [`Airplane mode turns off calls and internet. Leave it off.`, `Режим полёта отключает звонки и интернет. Оставьте его выключенным.`];
            const wifiW = [`Wi‑Fi works at home. Away from home you need mobile data.`, `Wi‑Fi работает дома. Вне дома нужен мобильный интернет.`];
            const btW = [`Bluetooth connects headphones, not the internet.`, `Bluetooth подключает наушники, а не интернет.`];
            const flash = [`The flashlight does not give internet.`, `Фонарик не даёт интернет.`];
            if (ios) {
              const c = (k, cls, w, lbl) => act(g(k, '#fff', 22), w, 'cc-c ' + cls, lbl);
              return shell('cc', `<div class="cc-top"><span>${t('Carrier', 'Оператор')}</span></div><div class="cc-grid"><div class="cc-conn">${act(g('plane', '#fff', 22), airplane, 'cc-c')}${act(g('data', '#fff', 22), null, 'cc-c')}${act(g('wifi', '#fff', 22), wifiW, 'cc-c on-b')}${act(g('bt', '#fff', 22), btW, 'cc-c')}</div><div class="cc-media"><small>${t('Not playing', 'Не исполняется')}</small><span>⏮ ▶ ⏭</span></div><div class="cc-tile">${g('lock', '#fff', 22)}</div><div class="cc-tile">${g('moon', '#fff', 22)}</div><div class="cc-slider"><i style="height:60%"></i>${g('sun', '#333', 18)}</div><div class="cc-slider"><i style="height:30%"></i>${g('vol', '#333', 18)}</div>${act(g('flash', '#fff', 22), flash, 'cc-tile')}<div class="cc-tile">${g('camera', '#fff', 22)}</div></div><p class="cc-lbl">${t('Mobile data — the antenna button (second)', 'Сотовые данные: кнопка с антенной (вторая)')}</p>`);
            }
            const tile = (k, l, sub, w, on) => act(`<span class="qs-i">${g(k, 'currentColor', 20)}</span><span class="qs-t"><b>${l}</b><small>${sub}</small></span>`, w, 'qs-a' + (on ? ' on' : ''));
            return shell('cc', `<div class="qs-head"><span class="qs-time">9:41</span><small>${t('Tue, 27 Oct', 'Вт, 27 окт.')}</small><span class="mx-hi">${g('gear', '#e3e3e8', 20)}</span></div><div class="qs-bright"><i></i>${g('sun', '#1b1b1f', 18)}</div><div class="qs-tiles">${tile('wifi', 'Wi‑Fi', t('Off', 'Выкл.'), wifiW)}${tile('data', t('Mobile data', 'Мобильный интернет'), t('Off', 'Выкл.'), null)}${tile('bt', 'Bluetooth', t('Off', 'Выкл.'), btW)}${tile('flash', t('Flashlight', 'Фонарик'), '', flash)}${tile('plane', t('Airplane mode', 'Режим полёта'), '', airplane)}${tile('moon', t('Do not disturb', 'Не беспокоить'), '', [`This silences notifications, it does not give internet.`, `Это выключает уведомления, а не включает интернет.`])}</div><div class="qs-handle"></div>`);
          }},
        {title: ['Call a relative', 'Позвоните родным'], text: ['Open Contacts and call your granddaughter Aigerim.', 'В контактах найдите внучку Айгерим и позвоните ей.'],
          hint: ['Contacts are sorted by letter. Tap the name of the person. 112 is only for emergencies: fire, police, ambulance.', 'Контакты идут по алфавиту. Нажмите на имя человека. 112 набирают только в опасных ситуациях: пожар, полиция, скорая.'],
          ok: ['Calling Aigerim…', 'Звоним Айгерим…'], bar: ['Contacts', 'Контакты'], skin: 'set',
          view: () => {
            const ios = isIos();
            const people = [
              ['А', t('Aigerim (granddaughter)', 'Айгерим (внучка)'), '#e17f9b', null],
              ['Д', t('Doctor Serik', 'Доктор Серик'), '#7a8b3a', [`That is a different contact. Look for Aigerim.`, `Это другой контакт. Ищите Айгерим.`]],
              ['Е', t('Emergency 112', 'Экстренная служба 112'), '#d93025', [`112 is for emergencies only. Choose your granddaughter.`, `112 только для экстренных случаев. Выберите внучку.`]],
              ['С', t('Neighbour Saule', 'Соседка Сауле'), '#5b7fd6', [`That is a neighbour. Look for Aigerim.`, `Это соседка. Ищите Айгерим.`]]
            ];
            const rows = people.map(([l, n, c, w], i) => `${i === 0 || people[i - 1][0] !== l ? `<div class="ct-letter">${l}</div>` : ''}${act(`${ios ? '' : ava(l, c, 40)}<span class="ct-n">${n}</span>`, w, 'ct-row' + (ios ? ' ios' : ''))}`).join('');
            const tabs = ios
              ? [['star', t('Favourites', 'Избранное')], ['clock', t('Recents', 'Недавние')], ['person', t('Contacts', 'Контакты'), 1], ['dial', t('Keypad', 'Клавиши')]]
              : [['star', t('Favourites', 'Избранное')], ['clock', t('Recents', 'Недавние')], ['person', t('Contacts', 'Контакты'), 1], ['dial', t('Keypad', 'Клавиатура')]];
            return shell('set', `${ios ? `<h3 class="mx-large">${t('Contacts', 'Контакты')}</h3>` : `<div class="st-nav and"><strong>${t('Phone', 'Телефон')}</strong><span class="mx-hi">${g('more', 'currentColor')}</span></div>`}<div class="mx-search">${g('search', '#8e8e93', 18)}<span>${t('Search contacts', 'Поиск контактов')}</span></div><div class="ct-me">${ava(g('person', '#fff', ios ? 24 : 22), '#a0a7b4', 44)}<span><strong>${t('My card', 'Моя карточка')}</strong><small>Гульнара</small></span></div><div class="ct-list">${rows}</div><div class="mx-tabs ph${ios ? ' ios' : ''}" aria-hidden="true">${tabs.map(([k, l, on]) => `<span class="${on ? 'on' : ''}"><b>${g(k, 'currentColor', 22)}</b>${l}</span>`).join('')}</div>`);
          }},
        {title: ['Make the sound louder', 'Сделайте звук громче'], text: ['Aigerim is calling, but the ringtone is too quiet. Look at the side of the phone and press the button that makes it louder.', 'Звонит Айгерим, но звонок слишком тихий. Посмотрите на бок телефона и нажмите кнопку, которая делает громче.'],
          hint: [isIos() ? 'On an iPhone the volume buttons are on the left side: the upper one is louder, the lower one is quieter. The small top button is silent mode.' : 'On most Android phones the volume buttons are on the right side: the upper one is louder, the lower one is quieter. The separate button below is power.', isIos() ? 'У iPhone кнопки громкости на левом боку: верхняя громче, нижняя тише. Маленькая кнопка сверху включает беззвучный режим.' : 'У большинства Android кнопки громкости на правом боку: верхняя громче, нижняя тише. Отдельная кнопка ниже: питание.'],
          ok: ['Louder. Now you will hear the call.', 'Стало громче. Теперь вы услышите звонок.'], bar: ['Sound', 'Звук'], scene: true,
          view: () => {
            const ios = isIos();
            const screenHtml = `<div class="vc-call"><small>${t('incoming call', 'входящий вызов')}</small>${ava('А', '#e17f9b', 78)}<strong>${t('Aigerim', 'Айгерим')}</strong><span>${t('mobile', 'мобильный')}</span><div class="vc-btns"><span class="vc-no">${g('phone', '#fff', 26)}</span><span class="vc-yes">${g('phone', '#fff', 26)}</span></div></div><div class="vol-hud${ios ? ' ios' : ''}"><i></i>${g('vol', 'currentColor', 16)}</div>`;
            const sb = (cls, label, w, testid) => `<button type="button" class="sb ${cls}" ${w ? wrongAttr(w) : 'data-sim="correct" data-testid="lesson-ok"'}><span class="sb-k"></span><span class="sb-l">${label}</span></button>`;
            const side = ios
              ? sb('act', t('Silent mode (Action button)', 'Беззвучный режим (кнопка действия)'), [`This button turns silent mode on: you would hear nothing at all. You need louder.`, `Эта кнопка включает беззвучный режим: звонка не будет слышно совсем. Нужно громче.`]) + sb('up', t('Volume up +', 'Громче +')) + sb('down', t('Volume down −', 'Тише −'), [`This makes it quieter. You need louder: the upper button.`, `Так станет тише. Нужно громче: верхняя кнопка.`])
              : sb('up', t('Volume up +', 'Громче +')) + sb('down', t('Volume down −', 'Тише −'), [`This makes it quieter. You need louder: the upper button.`, `Так станет тише. Нужно громче: верхняя кнопка.`]) + sb('pwr', t('Power (screen off)', 'Питание (выкл. экран)'), [`The power button turns the screen off and can silence the call. You need the upper volume button.`, `Кнопка питания выключает экран и может заглушить звонок. Нужна верхняя кнопка громкости.`]);
            return `<div class="turn go ${ios ? 'ios' : 'and'}"><div class="turn-phone">${PH.frame(PH.os, `<div class="mx mx-call">${screenHtml}</div>`)}</div><div class="turn-side"><div class="turn-edge">${side}</div><p class="turn-cap">${t('Side of the phone', 'Бок телефона')}</p></div><button type="button" class="turn-again" data-action="turn-again">${t('↻ Show again', '↻ Показать ещё раз')}</button></div>`;
          }}
      ]
    },

    internet: {
      icon: '⌕', title: t('Safe search on the internet', 'Безопасный поиск в интернете'),
      description: t('Search, tell an ad from a real site, close pop-ups and check a page.', 'Искать, отличать рекламу от настоящего сайта, закрывать всплывающие окна и проверять страницу.'),
      takeaway: t('Look at the address and the word “Sponsored”, close pop-ups with prizes, and never enter documents or card data on a page marked “Not secure”.', 'Смотрите на адрес и пометку «Реклама», закрывайте окна с призами и не вводите документы и данные карты на странице с пометкой «Не защищено».'),
      steps: [
        {title: ['Write a good search', 'Составьте запрос'], text: ['You want the opening hours of the city clinic. Choose the best search suggestion.', 'Вам нужен график работы городской поликлиники. Выберите удачную подсказку поиска.'],
          hint: ['Short and exact words work best: what you need and where. Words like “free” or “download” often lead to ads.', 'Лучше всего работают короткие точные слова: что нужно и где. Слова «бесплатно» и «скачать» часто ведут на рекламу.'],
          ok: ['A clear search. Now look at the results.', 'Хороший запрос. Теперь посмотрим результаты.'], bar: ['Search', 'Поиск'], skin: 'br', url: '',
          view: () => {
            const sug = (q, w) => act(`${g('search', '#5f6368', 18)}<span>${q}</span><i>↖</i>`, w, 'br-sug');
            return br('', `<div class="br-omni"><span class="br-q">${t('clinic opening', 'график работы поли')}<i class="br-caret"></i></span></div><div class="br-sugs">${sug(t('clinic opening hours Astana', 'график работы поликлиники Астана'))}${sug(t('free download clinic', 'бесплатно скачать поликлиника'), [`“Free download” usually brings ads and unknown files. Be exact.`, `«Бесплатно скачать» обычно приводит к рекламе и незнакомым файлам. Пишите точнее.`])}${sug(t('how to get money fast', 'как быстро получить деньги'), [`This has nothing to do with the clinic.`, `Это не связано с поликлиникой.`])}</div><div class="br-kb" aria-hidden="true">${'йцукенгшщзх'.split('').map(c => `<span>${c}</span>`).join('')}</div>`, {focus: true});
          }},
        {title: ['Choose the real site', 'Выберите настоящий сайт'], text: ['Which result is the real clinic site and not an ad?', 'Какой результат настоящий сайт поликлиники, а не реклама?'],
          hint: ['Ads are marked “Sponsored”. Check the address: the official site has a short, clear address.', 'Реклама помечена словом «Реклама» или «Спонсор». Проверяйте адрес: у официального сайта он короткий и понятный.'],
          ok: ['You picked the official site (practice address).', 'Вы выбрали официальный сайт (учебный адрес).'], bar: ['Results', 'Результаты'], skin: 'br', url: t('clinic opening hours Astana', 'график работы поликлиники Астана'),
          view: () => {
            const res = (ad, fav, c, site, url, title, snip, w) => act(`${ad ? `<b class="br-ad">${t('Sponsored', 'Реклама')}</b>` : ''}<span class="br-site"><span class="br-fav" style="background:${c}">${fav}</span><span><strong>${site}</strong><small>${url}</small></span><span class="br-dots">⋮</span></span><span class="br-title">${title}</span><span class="br-snip">${snip}</span>`, w, 'br-res');
            return br(t('clinic opening hours Astana', 'график работы поликлиники Астана'), `<div class="br-chips"><span class="on">${t('All', 'Все')}</span><span>${t('Maps', 'Карты')}</span><span>${t('News', 'Новости')}</span><span>${t('Images', 'Картинки')}</span></div>${res(true, 'C', '#e8710a', 'Clinic Fast Help', 'clinic-fast-help.top', t('Certificates in 5 minutes! Pay now', 'Справки за 5 минут! Оплатите сейчас'), t('No queues, no visit. Enter your ID and card.', 'Без очередей и визита. Введите ИИН и карту.'), [`This is an ad with a strange address. Avoid it.`, `Это реклама с подозрительным адресом. Лучше её обойти.`])}${res(false, 'П', '#1a73e8', t('City clinic No. 1', 'Городская поликлиника № 1'), 'polyclinic.example.kz', t('Opening hours and doctors', 'График работы и врачи'), t('Mon–Fri 8:00–20:00, Sat 9:00–14:00. Registry phone…', 'Пн–Пт 8:00–20:00, Сб 9:00–14:00. Телефон регистратуры…'))}${res(false, 'F', '#7b5ea7', t('City forum', 'Городской форум'), 'forum-chat.example', t('“They said the clinic is closed…”', '«Говорят, поликлиника закрыта…»'), t('42 replies · opinions of residents', '42 ответа · мнения жителей'), [`A forum is just opinions. Official hours are on the official site.`, `Форум это мнения людей. Режим работы указан на официальном сайте.`])}`);
          }},
        {title: ['Close the pop-up', 'Закройте всплывающее окно'], text: ['A window says you won a prize. Close it.', 'Всплыло окно: «Вы выиграли приз». Закройте его.'],
          hint: ['Prize windows are a trick. Close them with the cross (×) in the corner and do not press the big button.', 'Окна с призами это уловка. Закройте их крестиком (×) в углу и не нажимайте большую кнопку.'],
          ok: ['Closed. Good habit!', 'Закрыто. Хорошая привычка!'], bar: ['Pop-up', 'Окно'], skin: 'br', url: 'polyclinic.example.kz',
          view: () => br('polyclinic.example.kz', `<div class="br-page"><div class="br-ph"><b>${t('City clinic No. 1', 'Городская поликлиника № 1')}</b><span>☰</span></div><h4>${t('Opening hours', 'График работы')}</h4><p>${t('Mon–Fri 8:00–20:00<br>Sat 9:00–14:00<br>Sun closed', 'Пн–Пт 8:00–20:00<br>Сб 9:00–14:00<br>Вс выходной')}</p></div><div class="br-dim"><div class="br-pop">${act('×', null, 'br-x')}<div class="br-gift">🎁</div><h3>${t('Congratulations! You won a phone!', 'Поздравляем! Вы выиграли телефон!')}</h3><p>${t('Only 2 minutes left to claim it', 'Осталось 2 минуты, чтобы забрать')}</p>${act(t('Get the prize', 'Получить приз'), [`Never press “Get the prize”. It leads to data theft.`, `Кнопку «Получить приз» нажимать нельзя: так воруют данные.`], 'br-cta')}</div></div>`, {lock: true})},
        {title: ['Check before typing', 'Проверьте, прежде чем вводить'], text: ['A page asks for your ID number and card. You tapped “Not secure” in the address bar. What do you do?', 'Страница просит ИИН и данные карты. Вы нажали на «Не защищено» в адресной строке. Что сделаете?'],
          hint: ['“Not secure”, a strange address and urgency mean: close the tab and enter nothing.', '«Не защищено», странный адрес и спешка значат одно: закрыть вкладку и ничего не вводить.'],
          ok: ['Correct: the tab is closed, nothing was entered.', 'Верно: вкладка закрыта, ничего не введено.'], bar: ['Page', 'Страница'], skin: 'br', url: '!clinic-fast-help.top',
          view: () => br('clinic-fast-help.top', `<div class="br-info"><strong>⚠ ${t('Connection is not secure', 'Подключение не защищено')}</strong><p>${t('Do not enter passwords, ID numbers or card details on this site.', 'Не вводите на этом сайте пароли, ИИН и данные карты.')}</p>${act(t('Close tab', 'Закрыть вкладку'), null, 'br-close')}</div><div class="br-page"><h4>${t('Certificate in 5 minutes! ⏰ 04:59', 'Справка за 5 минут! ⏰ 04:59')}</h4>${act(`<small>${t('ID number (IIN)', 'ИИН')}</small><span>____________</span>`, [`The ID number is also personal data. Do not give it to unknown pages.`, `ИИН тоже личные данные. Незнакомым страницам их не дают.`], 'br-field')}<div class="br-field dis"><small>${t('Card number', 'Номер карты')}</small><span>•••• •••• •••• ••••</span></div>${act(t('Get the certificate', 'Получить справку'), [`Never. The address is strange and the page rushes you.`, `Нельзя. Адрес странный, а страница торопит.`], 'br-cta')}</div>`, {warn: true})}
      ]
    },

    bankcall: {
      icon: '☏', title: t('A call “from the bank”', 'Звонок «из банка»'),
      description: t('Recognise a fake bank call, hang up and call the bank yourself.', 'Распознать поддельный звонок из банка, положить трубку и самим позвонить в банк.'),
      takeaway: t('A real bank never asks for a code from SMS, a PIN or the card number by phone. Hang up and call the bank yourself on the number on your card or in the official app.', 'Настоящий банк никогда не спрашивает по телефону код из SMS, PIN-код или номер карты. Положите трубку и сами позвоните в банк по номеру с карты или из официального приложения.'),
      steps: [
        {title: ['Answer the call', 'Ответьте на звонок'], text: ['An unknown number is calling. Answer to hear what they want.', 'Звонит незнакомый номер. Ответьте, чтобы узнать, что хотят.'],
          hint: ['The green button answers, the red one declines. Answering is not dangerous; what matters is what you say.', 'Зелёная кнопка отвечает, красная отклоняет. Ответить не опасно, важно то, что вы скажете.'],
          ok: ['You answered. Listen carefully.', 'Вы ответили. Слушайте внимательно.'], bar: null, home: true,
          view: () => callIn(false)},
        {title: ['They ask for a code', 'У вас просят код'], text: ['The caller says: “Bank security service. Someone is taking a loan in your name. Tell me the code from SMS to cancel it.” What do you do?', 'Собеседник говорит: «Служба безопасности банка. На вас оформляют кредит. Назовите код из SMS, чтобы его отменить». Что вы сделаете?'],
          hint: ['A bank never asks for an SMS code. The safest thing is to end the call at once with the red button.', 'Банк никогда не спрашивает код из SMS. Самое надёжное: сразу завершить звонок красной кнопкой.'],
          ok: ['Right: you hung up. You don’t have to be polite to scammers.', 'Верно: вы положили трубку. С мошенниками не нужно быть вежливыми.'], bar: null, home: true,
          view: () => callOn()},
        {title: ['They call again', 'Звонят снова'], text: ['The same number calls again, and an SMS with a code has arrived. Do not answer.', 'Тот же номер звонит снова, а ещё пришло SMS с кодом. Не отвечайте.'],
          hint: ['Scammers often call back and press you. Decline the call with the red button. The code in the SMS is for you only.', 'Мошенники часто перезванивают и давят. Отклоните вызов красной кнопкой. Код из SMS только для вас.'],
          ok: ['Declined. Your money and code are safe.', 'Отклонено. Ваши деньги и код в безопасности.'], bar: null, home: true,
          view: () => callIn(true)},
        {title: ['Call the bank yourself', 'Позвоните в банк сами'], text: ['To check your card, call the bank on a number you trust. Choose the right contact.', 'Чтобы проверить карту, позвоните в банк по номеру, которому доверяете. Выберите нужный контакт.'],
          hint: ['The right number is written on the back of your card and in the official bank app. Do not call back the number that called you.', 'Правильный номер написан на обратной стороне карты и в официальном приложении банка. Не перезванивайте на номер, который звонил вам.'],
          ok: ['Correct. The bank will tell you if anything really happened.', 'Верно. В банке скажут, было ли что-то на самом деле.'], bar: ['Phone', 'Телефон'], skin: 'recents',
          view: () => {
            const ios = isIos();
            const row = (a, name, sub, wrong, red) => act(`${a}<span class="cl-rt"><strong class="${red ? 'red' : ''}">${name}</strong><small>${sub}</small></span>${ios ? `<span class="cl-i">ⓘ</span>` : g('phone', '#0b57d0', 22)}`, wrong, 'cl-row');
            const list = row(ava(g('person', '#fff', 22), '#a5abb6', 40), '+7 727 ••• •• 00', t('2 missed · today', '2 пропущенных · сегодня'), [`This is the number that called you. Never call it back.`, `Это номер, который вам звонил. Перезванивать на него нельзя.`], true)
              + row(ava('Б', '#2f7d6d', 40), t('My bank', 'Мой банк'), t('number from the back of the card', 'номер с обратной стороны карты'))
              + row(ava('А', '#e17f9b', 40), t('Aigerim (granddaughter)', 'Айгерим (внучка)'), t('yesterday', 'вчера'), [`This is your granddaughter. To check the card, you need the bank.`, `Это внучка. Чтобы проверить карту, нужен банк.`])
              + row(ava(g('person', '#fff', 22), '#a5abb6', 40), '+7 700 ••• •• 19', t('“Bank” · from SMS', '«Банк» · из SMS'), [`A number from an SMS may belong to scammers. Take the number from your card or the official app.`, `Номер из SMS может принадлежать мошенникам. Берите номер с карты или из официального приложения.`]);
            const tabs = ios ? [['star', t('Favourites', 'Избранное')], ['clock', t('Recents', 'Недавние'), 1], ['person', t('Contacts', 'Контакты')], ['dial', t('Keypad', 'Клавиши')]] : [['star', t('Favourites', 'Избранное')], ['clock', t('Recents', 'Недавние'), 1], ['person', t('Contacts', 'Контакты')]];
            return shell('recents', `<div class="cl-top">${ios ? `<h3 class="mx-large">${t('Recents', 'Недавние')}</h3>` : `<div class="cl-search">${g('search', '#444746', 20)}<span>${t('Search contacts', 'Поиск контактов')}</span>${g('more', '#444746', 20)}</div>`}</div><div class="cl-list">${list}</div><div class="mx-tabs ph${ios ? ' ios' : ''}" aria-hidden="true">${tabs.map(([k, l, on]) => `<span class="${on ? 'on' : ''}"><b>${g(k, 'currentColor', 22)}</b>${l}</span>`).join('')}</div>`);
          }}
      ]
    },

    tgscam: {
      icon: '⚑', title: t('A “vote for me” trick in Telegram', 'Обман «проголосуй» в Telegram'),
      description: t('Do not open a suspicious link from a friend, check by calling, turn on a cloud password.', 'Не открывать подозрительную ссылку от знакомого, проверить звонком, включить облачный пароль.'),
      takeaway: t('Even a message from a friend can come from scammers if their account was stolen. Do not log in through links, check by voice call, and turn on the cloud password in Telegram.', 'Даже сообщение от знакомого может прийти от мошенников, если его аккаунт украли. Не входите через ссылки, проверяйте голосовым звонком и включите облачный пароль в Telegram.'),
      steps: [
        {title: ['Open the message', 'Откройте сообщение'], text: ['Your friend Saule has written to you. Open the chat with her.', 'Вам написала знакомая Сауле. Откройте чат с ней.'],
          hint: ['The chat with new messages has a number on the right. Tap the line with the name Saule.', 'У чата с новыми сообщениями справа есть число. Нажмите на строку с именем Сауле.'],
          ok: ['The chat is open.', 'Чат открыт.'], bar: ['Chats', 'Чаты'], skin: 'tg',
          view: () => {
            const ios = isIos();
            const top = ios
              ? `<div class="mx-ios-top tg"><span>${t('Edit', 'Изм.')}</span><strong>${t('Chats', 'Чаты')}</strong><span class="mx-hi">${g('pencil', '#007aff', 22)}</span></div><div class="mx-search tg-ios-search">${g('search', '#8e8e93', 18)}<span>${t('Search', 'Поиск')}</span></div>`
              : `<div class="mx-head mx-tg-head">${g('menu')}<span class="mx-ht"><strong>Telegram</strong></span><span class="mx-hi">${g('search', 'currentColor')}</span></div>`;
            const rows = chatRow(ava('С', '#5fb3a1'), t('Saule', 'Сауле'), t('You need to log in with Telegram there…', 'Там надо войти через Telegram…'), '16:44', 2, null, 'tg')
              + chatRow(ava('А', '#e17f9b'), t('Aigerim (granddaughter)', 'Айгерим (внучка)'), t('See you on Sunday!', 'Увидимся в воскресенье!'), '12:38', 0, [`This is your granddaughter. The new message is from Saule.`, `Это внучка. Новое сообщение от Сауле.`], 'tg')
              + chatRow(ava('У', '#2aabee'), `${t('Confident Steps', 'Уверенный шаг')} ${verified}`, t('One short tip every Monday', 'Один короткий совет каждый понедельник'), t('Mon', 'пн'), 0, [`This is a channel. The new message is from Saule.`, `Это канал. Новое сообщение от Сауле.`], 'tg');
            return shell('tg', `${top}<div class="mx-list">${rows}</div>${tgTabs()}${ios ? '' : `<span class="mx-fab tg" aria-hidden="true">${g('pencil', '#fff', 22)}</span>`}`);
          }},
        {title: ['Don’t open the link', 'Не открывайте ссылку'], text: ['Saule asks you to vote by a link and “log in with Telegram”. Do not open it. Tap her name at the top to open her profile.', 'Сауле просит проголосовать по ссылке и «войти через Telegram». Не открывайте её. Нажмите на имя вверху, чтобы открыть профиль.'],
          hint: ['Such “vote” pages ask for your Telegram code and steal the account. The name at the top of the chat opens the profile, where you can call.', 'Такие страницы «голосования» просят код от Telegram и крадут аккаунт. Имя вверху чата открывает профиль, оттуда можно позвонить.'],
          ok: ['The profile is open. Now check by calling.', 'Профиль открыт. Теперь проверим звонком.'], bar: ['Saule', 'Сауле'], skin: 'tg',
          view: () => {
            const ios = isIos();
            const head = chatHead('tg', t('Saule', 'Сауле'), t('online', 'в сети'), ava('С', '#5fb3a1', 36), ios ? '' : g('phone', 'currentColor', 20) + g('more', 'currentColor'))
              .replace('<div class="mx-head', '<button type="button" data-sim="correct" data-testid="lesson-ok" class="mx-head mx-head-btn').replace(/<\/div>$/, '</button>');
            const lnk = act('t-vote-konkurs.top', [`Do not open this link. Such pages ask for your Telegram code and take your account.`, `Эту ссылку открывать нельзя. Такие страницы просят код от Telegram и забирают аккаунт.`], 'tr-link mx-inline-link');
            return shell('tg', `${head}<div class="mx-wall">${day(t('Today', 'Сегодня'))}${msg(`${t('Hi! Please vote for my niece in the drawing contest 🙏', 'Привет! Проголосуй, пожалуйста, за мою племянницу в конкурсе рисунков 🙏')} ${lnk}`, false, '16:44', 'tg')}${msg(t('You need to log in with Telegram there, it is quick', 'Там надо войти через Telegram, это быстро'), false, '16:44', 'tg')}</div>${ios ? `<div class="mx-compose tr-compose tg ios">${g('clip', '#8e8e93', 24)}<span class="tr-tg-field">${t('Message', 'Сообщение')}</span>${g('mic', '#8e8e93', 24)}</div>` : `<div class="mx-compose tr-compose tg"><span class="tr-tg-input">${g('emoji', '#8a979f', 24)}<span>${t('Message', 'Сообщение')}</span>${g('clip', '#8a979f', 22)}</span>${g('mic', '#8a979f', 24)}</div>`}`);
          }},
        {title: ['Check by calling', 'Проверьте звонком'], text: ['Call Saule by voice and ask if she really wrote to you.', 'Позвоните Сауле голосом и спросите, она ли писала.'],
          hint: ['The “Call” button is under the photo. A voice call shows whether you are talking to the real person.', 'Кнопка «Звонок» под фотографией. Голосовой звонок покажет, говорите ли вы с настоящим человеком.'],
          ok: ['Saule says she wrote nothing: her account was hacked. Good that you checked!', 'Сауле говорит, что ничего не писала: её аккаунт взломали. Хорошо, что вы проверили!'], bar: ['Profile', 'Профиль'], skin: 'tg',
          view: () => {
            const ios = isIos();
            const no = w => [w[0], w[1]];
            return shell('tg', `<div class="mx-prof${ios ? ' ios' : ''}"><div class="mx-prof-top">${g(ios ? 'chev' : 'back', 'currentColor', 24)}<span>${ios ? t('Edit', 'Изм.') : g('more', 'currentColor')}</span></div>${ava('С', '#5fb3a1', 84)}<h3>${t('Saule', 'Сауле')}</h3><small>${t('online', 'в сети')}</small></div><div class="mx-acts">${act(`${g('phone', 'currentColor')}<span>${t('Call', 'Звонок')}</span>`, null, 'mx-act')}${act(`${g('video', 'currentColor')}<span>${t('Video', 'Видео')}</span>`, no([`A video call works too, but a plain voice call is simpler. Press “Call”.`, `Видеозвонок тоже подойдёт, но обычный звонок проще. Нажмите «Звонок».`]), 'mx-act')}${act(`${g('bell', 'currentColor')}<span>${t('Mute', 'Звук')}</span>`, no([`This only turns off notifications. You need to call Saule.`, `Так только выключаются уведомления. Нужно позвонить Сауле.`]), 'mx-act')}<span class="mx-act" aria-hidden="true">${g('more', 'currentColor')}<span>${t('More', 'Ещё')}</span></span></div><div class="mx-card"><small>${t('mobile', 'мобильный')}</small><p>+7 707 ••• •• 32</p></div><div class="mx-card"><small>${t('username', 'имя пользователя')}</small><p>@saule_k</p></div>`);
          }},
        {title: ['Protect your account', 'Защитите свой аккаунт'], text: ['In Telegram settings, open Privacy and Security and turn on the cloud password.', 'В настройках Telegram откройте «Конфиденциальность» и включите облачный пароль.'],
          hint: ['A cloud password is a second password. Even if someone learns the SMS code, they cannot log in without it.', 'Облачный пароль — это второй пароль. Даже если кто-то узнает код из SMS, без него войти не получится.'],
          ok: ['Next, Telegram will ask you to come up with a password and a hint. Write the password down and keep it at home.', 'Дальше Telegram попросит придумать пароль и подсказку. Запишите пароль и храните его дома.'], bar: ['Privacy', 'Конфиденциальность'], skin: 'tg',
          view: () => {
            const ios = isIos();
            const li = (label, value, wrong) => act(`<span>${label}</span><em>${value}</em>${ios ? '<i>›</i>' : ''}`, wrong, 'tg-set');
            const other = [`This setting is about who sees your data. To protect the account you need “Cloud password”.`, `Этот пункт о том, кто видит ваши данные. Для защиты аккаунта нужен «Облачный пароль».`];
            return shell('tg', `<div class="mx-head mx-tg-head${ios ? ' ios' : ''}">${ios ? `<span class="mx-hb mx-back-label">${g('chev', 'currentColor', 24)}<em>${t('Back', 'Назад')}</em></span>` : `<span class="mx-hb">${g('back')}</span>`}<span class="mx-ht"><strong>${t('Privacy and Security', 'Конфиденциальность')}</strong></span>${ios ? '<span class="mx-hb"></span>' : ''}</div><div class="tg-sets"><p class="tg-sec">${t('Security', 'Безопасность')}</p>${li(t('Cloud password', 'Облачный пароль'), t('Off', 'Выкл.'))}${li(t('Passcode', 'Код-пароль'), t('Off', 'Выкл.'), [`A passcode locks Telegram on this phone. To protect the account from other devices you need the “Cloud password”.`, `Код-пароль закрывает Telegram только на этом телефоне. От входа с чужих устройств защищает «Облачный пароль».`])}${li(t('Devices', 'Устройства'), '1', [`Here you can see where you are logged in. Useful, but first turn on the “Cloud password”.`, `Здесь видно, где выполнен вход. Полезно, но сначала включите «Облачный пароль».`])}<p class="tg-sec">${t('Privacy', 'Конфиденциальность')}</p>${li(t('Phone number', 'Номер телефона'), t('My contacts', 'Мои контакты'), other)}${li(t('Last seen', 'Время захода'), t('Everybody', 'Все'), other)}${li(t('Profile photo', 'Фотография профиля'), t('Everybody', 'Все'), other)}</div>`);
          }}
      ]
    }
  };
};
