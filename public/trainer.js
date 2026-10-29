'use strict';
/*
 * Scam trainer: 10 made-up messages a person in Kazakhstan may receive.
 * Each one is shown as it looks on the phone (SMS, WhatsApp, Telegram, a notification on the lock screen);
 * the learner decides whether it is a scam. All names, numbers and addresses are fictional and nothing is clickable.
 * Item: scam, situation (optional), view(), why, signs — texts are [English, Russian].
 */
window.CSTrainerFactory = H => {
  const {t, PH, kit} = H;
  const {g, ava, chatHead, msg, day, shell, isIos, logo, verified} = kit;
  const link = s => `<span class="tr-link">${s}</span>`;
  const person = (s = 22) => g('person', '#fff', s);
  const now = () => t('Today', 'Сегодня');

  /* SMS: Messages on iPhone, Google Messages on Android */
  const sms = (from, text, time, o = {}) => {
    if (isIos()) {
      return `<div class="sm sm-ios"><div class="sm-head"><span class="sm-back">${g('chev', '#007aff', 24)}</span><span class="sm-who">${o.letter ? ava(o.letter, o.color || '#a5abb6', 40) : ava(person(24), '#a5abb6', 40)}<small>${from} ›</small></span><span></span></div><div class="sm-body"><p class="sm-day">${o.sender ? t('Text message', 'SMS-сообщение') + '<br>' : ''}${now()} ${time}</p><div class="sm-b">${text}</div></div><div class="sm-input"><span class="sm-plus">${g('plus', '#8e8e93', 20)}</span><span class="sm-field">${t('Text message', 'Текстовое сообщение')}</span></div></div>`;
    }
    return `<div class="sm sm-and"><div class="sm-head">${g('back', '#1f1f1f', 24)}${o.letter ? ava(o.letter, o.color || '#5e97f6', 34) : ava(person(20), '#5e97f6', 34)}<strong>${from}</strong><span class="sm-icons">${g('phone', '#444746', 22)}${g('more', '#444746', 22)}</span></div><div class="sm-body"><p class="sm-day">${now()} · ${time}</p><div class="sm-b">${text}</div>${o.sender ? `<p class="sm-note">${t('You can’t reply to this sender', 'Ответить этому отправителю нельзя')}</p>` : ''}</div><div class="sm-input"><span class="sm-plus">${g('plus', '#1f1f1f', 22)}</span><span class="sm-field">${t('Text message', 'SMS-сообщение')}${g('emoji', '#444746', 20)}</span><span class="sm-mic">${g('mic', '#1f1f1f', 22)}</span></div></div>`;
  };
  /* WhatsApp chat, optionally from a number that is not in contacts */
  const wa = (name, sub, a, texts, o = {}) => shell('wa', `${chatHead('wa', name, sub, a, g('video', 'currentColor') + g('phone', 'currentColor', 20) + (isIos() ? '' : g('more', 'currentColor')))}<div class="mx-wall">${day(now())}${o.unknown ? `<div class="mx-sys">${t('This number is not in your contacts', 'Этого номера нет в ваших контактах')}<div class="mx-sys-b"><span class="mx-sysbtn red">${g('block', '#ea0038', 18)} ${t('Block', 'Заблокировать')}</span><span class="mx-sysbtn">${g('person', '#008069', 18)} ${t('Add', 'Добавить')}</span></div></div>` : ''}${texts.map(([m, time]) => msg(m, false, time)).join('')}</div>${isIos() ? `<div class="mx-compose tr-compose wa-ios">${g('plus', '#007aff', 26)}<span class="mx-input"><span></span></span>${g('camera', '#007aff', 24)}${g('mic', '#007aff', 24)}</div>` : `<div class="mx-compose tr-compose"><span class="mx-input">${g('emoji', '#54656f', 24)}<span>${t('Message', 'Сообщение')}</span>${g('clip', '#54656f', 22)}${g('camera', '#54656f', 22)}</span><span class="mx-send">${g('mic', '#fff', 22)}</span></div>`}`);
  /* Telegram chat */
  const tg = (name, sub, a, texts) => shell('tg', `${chatHead('tg', name, sub, a, isIos() ? '' : g('phone', 'currentColor', 20) + g('more', 'currentColor'))}<div class="mx-wall">${day(now())}${texts.map(([m, time]) => msg(m, false, time, 'tg')).join('')}</div>${isIos() ? `<div class="mx-compose tr-compose tg ios">${g('clip', '#8e8e93', 24)}<span class="tr-tg-field">${t('Message', 'Сообщение')}</span>${g('mic', '#8e8e93', 24)}</div>` : `<div class="mx-compose tr-compose tg"><span class="tr-tg-input">${g('emoji', '#8a979f', 24)}<span>${t('Message', 'Сообщение')}</span>${g('clip', '#8a979f', 22)}</span>${g('mic', '#8a979f', 24)}</div>`}`);
  /* a notification on the lock screen */
  const lock = (app, icon, title, text) => {
    const date = isIos() ? t('Thursday 29 October', 'Четверг, 29 октября') : t('Thu, 29 Oct', 'Чт, 29 окт.');
    return `<div class="tr-lock ${isIos() ? 'ios' : 'and'}"><p class="tr-date">${date}</p><p class="tr-clock">9:41</p><div class="tr-note"><span class="tr-note-ic">${icon}</span><div>${isIos() ? `<p class="tr-note-top"><strong class="tr-note-t">${title}</strong><span>${t('now', 'сейчас')}</span></p>` : `<p class="tr-note-top"><strong>${app}</strong><span>${t('now', 'сейчас')}</span></p><strong class="tr-note-t">${title}</strong>`}<p>${text}</p></div></div></div>`;
  };
  const appIcon = k => `<img src="${logo(k)}" alt="">`;
  const frame = (inner, o = {}) => PH.frame(PH.os, inner, o);

  return [
    {scam: true, kind: 'SMS',
      view: () => frame(sms('+7&nbsp;708 ••• •• 13', t(`Hello! You have been granted a social payment of 42,500&nbsp;₸. Collect it before 18:00 today: ${link('egov-vyplata.top')}`, `Здравствуйте! Вам начислена социальная выплата 42&nbsp;500&nbsp;₸. Получите до 18:00 сегодня: ${link('egov-vyplata.top')}`), '11:02')),
      why: ['A scam. The state does not announce payments by SMS from an ordinary number, and egov-vyplata.top is not egov.kz. The deadline “before 18:00” is there to rush you.', 'Мошенники. Государство не сообщает о выплатах в SMS с обычного номера, а egov-vyplata.top — это не egov.kz. Срок «до 18:00» нужен, чтобы вас поторопить.'],
      signs: [['money you did not expect', 'неожиданные деньги'], ['an unknown website', 'незнакомый сайт'], ['a deadline', 'срок «до вечера»']]},
    {scam: false, kind: 'SMS', situation: ['A minute ago you started signing in to eGov on your phone yourself.', 'Минуту назад вы сами начали вход в eGov на своём телефоне.'],
      view: () => frame(sms('eGov', t('Your eGov sign-in code: 482913. Do not share it with anyone.', 'Ваш код для входа в eGov: 482913. Никому не сообщайте его.'), '11:15', {sender: true})),
      why: ['Safe. You asked for this code yourself, it comes from the short number and contains no link. Type it only into the eGov app, never tell it to anyone.', 'Безопасно. Вы сами запросили этот код, он пришёл с короткого номера и без ссылок. Вводите его только в приложение eGov и никому не называйте.'],
      signs: [['you asked for it', 'вы сами запросили'], ['no link', 'нет ссылки'], ['no one asks you for the code', 'никто не просит код']]},
    {scam: true, kind: 'WhatsApp',
      view: () => frame(wa('+7&nbsp;776 ••• •• 41', t('not in your contacts', 'нет в ваших контактах'), ava(person(), '#c9d0d4', 36), [[t('Mum, it’s me, I lost my phone, writing from a new number', 'Мама, это я, телефон сломался, пишу с нового номера'), '12:20'], [t('Please send me 50,000&nbsp;₸ urgently to this card, I will explain later. Don’t call, I can’t talk now', 'Срочно переведи 50&nbsp;000&nbsp;₸ на эту карту, потом всё объясню. Не звони, сейчас не могу говорить'), '12:21']], {unknown: true})),
      why: ['A scam. “A relative with a new number” who needs money urgently and asks you not to call is a common trick. Call your relative on the old number before doing anything.', 'Мошенники. «Родственник с нового номера», которому срочно нужны деньги и который просит не звонить, — частая уловка. Сначала позвоните близкому на старый номер.'],
      signs: [['a new number', 'новый номер'], ['urgent money', 'срочно нужны деньги'], ['“don’t call”', '«не звони»']]},
    {scam: false, kind: t('Notification', 'Уведомление'), situation: ['You have just paid for groceries at Magnum with Kaspi.', 'Вы только что оплатили продукты в Magnum через Kaspi.'],
      view: () => frame(lock('Kaspi.kz', appIcon('kaspi'), t('Purchase 3,450&nbsp;₸', 'Покупка 3&nbsp;450&nbsp;₸'), t('Magnum. Available: 121,550&nbsp;₸', 'Magnum. Доступно: 121&nbsp;550&nbsp;₸')), {home: true}),
      why: ['Safe. This is the usual notification about a payment you have just made. It asks for nothing and has no link.', 'Безопасно. Это обычное уведомление о покупке, которую вы только что сделали. Оно ничего не просит и без ссылок.'],
      signs: [['matches what you did', 'совпадает с вашей покупкой'], ['asks for nothing', 'ничего не просит']]},
    {scam: true, kind: 'Telegram',
      view: () => frame(tg(t('Kaspi Support', 'Kaspi Поддержка'), t('last seen recently', 'был(а) недавно'), ava('K', '#e53935', 36), [[t(`Your card has been blocked because of a suspicious payment. To unblock it, follow the link and enter your card details within 30 minutes: ${link('kaspi-unblock.online')}`, `Ваша карта заблокирована из-за подозрительной операции. Для разблокировки перейдите по ссылке и введите данные карты в течение 30 минут: ${link('kaspi-unblock.online')}`), '13:40']])),
      why: ['A scam. Banks do not write to customers in Telegram and never ask for card details by link. The real bank speaks to you only inside its own app.', 'Мошенники. Банки не пишут клиентам в Telegram и никогда не просят данные карты по ссылке. Настоящий банк общается с вами только в своём приложении.'],
      signs: [['a bank in a messenger', 'банк в мессенджере'], ['card details by link', 'данные карты по ссылке'], ['30 minutes', '«30 минут»']]},
    {scam: true, kind: 'SMS',
      view: () => frame(sms('KAZPOST', t(`Your parcel is held at the depot. Pay 350&nbsp;₸ for delivery: ${link('kazpost-dostavka.online')}`, `Ваша посылка задержана на складе. Оплатите доставку 350&nbsp;₸: ${link('kazpost-dostavka.online')}`), '14:05', {sender: true, letter: 'K', color: '#1b5fa8'})),
      why: ['A scam. A small payment is bait: on the fake site they will ask for all your card details. Check parcels only in the official Kazpost app or on the official site.', 'Мошенники. Маленькая сумма — приманка: на поддельном сайте попросят все данные карты. Посылки проверяйте только в официальном приложении или на сайте Казпочты.'],
      signs: [['a small payment', 'маленькая оплата'], ['an unknown website', 'незнакомый сайт']]},
    {scam: false, kind: 'WhatsApp',
      view: () => frame(wa(t('Aigerim (granddaughter)', 'Айгерим (внучка)'), t('online', 'в сети'), ava('А', '#e17f9b', 36), [[t('Grandma, I got home, all good 😊', 'Бабушка, я доехала домой, всё хорошо 😊'), '19:12'], [t('See you on Sunday!', 'Увидимся в воскресенье!'), '19:12']])),
      why: ['Safe. A message from a saved contact, in her usual manner, with no requests, money or links.', 'Безопасно. Сообщение от сохранённого контакта, в привычной манере, без просьб, денег и ссылок.'],
      signs: [['a saved contact', 'контакт из вашей книжки'], ['no requests', 'никаких просьб']]},
    {scam: true, kind: 'Telegram', situation: ['You are selling a sofa on OLX.', 'Вы продаёте диван на OLX.'],
      view: () => frame(tg(t('Oleg', 'Олег'), t('last seen recently', 'был(а) недавно'), ava('О', '#7e8bd8', 36), [[t('Hello, I am buying your sofa. I have already sent the money through safe delivery', 'Здравствуйте, покупаю ваш диван. Деньги уже отправил через безопасную доставку'), '15:30'], [t(`To receive it, open ${link('olx-safe-pay.site')} and enter your card number and the code from SMS`, `Чтобы получить их, откройте ${link('olx-safe-pay.site')} и введите номер карты и код из SMS`), '15:31']])),
      why: ['A scam. To receive money you never need to enter a card code. The “buyer” moved the talk to Telegram and sent a fake payment page.', 'Мошенники. Чтобы получить деньги, никогда не нужно вводить код из SMS. «Покупатель» увёл разговор в Telegram и прислал поддельную страницу оплаты.'],
      signs: [['a code to receive money', 'код, чтобы «получить» деньги'], ['an unknown website', 'незнакомый сайт']]},
    {scam: true, kind: 'Telegram',
      view: () => frame(tg(t('Saule', 'Сауле'), t('online', 'в сети'), ava('С', '#5fb3a1', 36), [[t(`Hi! Please vote for my niece in the drawing contest 🙏 ${link('t-vote-konkurs.top')}`, `Привет! Проголосуй, пожалуйста, за мою племянницу в конкурсе рисунков 🙏 ${link('t-vote-konkurs.top')}`), '16:44'], [t('You need to log in with Telegram there, it is quick', 'Там надо войти через Telegram, это быстро'), '16:44']])),
      why: ['A scam, even from a friend: her account was probably stolen. The “vote” page asks for your Telegram code and takes your account too. Call your friend and ask.', 'Мошенники, даже если пишет знакомая: скорее всего, её аккаунт уже украли. Страница «голосования» просит код от Telegram и забирает и ваш аккаунт. Позвоните знакомой и спросите.'],
      signs: [['“vote” link', 'ссылка на «голосование»'], ['log in on a website', 'вход через сайт']]},
    {scam: false, kind: 'SMS',
      view: () => frame(sms('Damumed', t('Reminder: appointment with the therapist on 30.10 at 10:20, room 214. You can cancel it in the Damumed app.', 'Напоминаем: приём у терапевта 30.10 в 10:20, каб. 214. Отменить запись можно в приложении Damumed.'), '17:00', {sender: true, letter: 'D', color: '#2f9e8f'})),
      why: ['Safe. An ordinary reminder from the clinic: no link, no payment, no code. If in doubt, open the app yourself and check your appointments.', 'Безопасно. Обычное напоминание от поликлиники: без ссылки, оплаты и кода. Если сомневаетесь, откройте приложение сами и проверьте запись.'],
      signs: [['no link', 'нет ссылки'], ['asks for nothing', 'ничего не просит']]}
  ];
};
