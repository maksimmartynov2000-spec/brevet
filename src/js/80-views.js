/* ===================== SCREENS ===================== */

/* ---------- sign in: who studies + PIN ---------- */
let PINTRY = { n: 0, until: 0 };
function viewLogin() {
  chrome({ title: 'Brevet', tab: -1 }); document.documentElement.classList.add('nologin');
  const ps = profiles().sort((a, b) => b.at - a.at);
  if (isIOS() && !isStandalone() && !ps.length && !SS.get('safari')) return viewInstall(true);
  let h = '<section class="card login"><div class="logo">' + LOGO + '</div><h2>Brevet · математика</h2><p class="muted">Подготовка к бревету 2027: ' + esc(APP.examLabel) + '.</p></section>';
  if (ps.length) {
    h += '<section class="card"><h3>Кто занимается?</h3><div class="lst">' + ps.map(p => '<button class="lrow" data-prof="' + p.id + '"><span class="lic">' + esc((p.name || '?')[0].toUpperCase()) + '</span><span class="lt"><b>' + esc(p.name) + '</b><span class="muted">' + (p.pin ? 'вход по PIN' : 'без PIN') + '</span></span>' + (p.pin ? ico('lock') : '') + '</button>').join('') + '</div></section>';
    h += '<div class="row"><button class="btn" id="bNew">' + ico('plus') + 'Новый ученик</button><button class="btn ghost" id="bMove">' + ico('load') + 'Вставить код</button></div>';
  } else h += newProfileForm();
  shell(h);
  $$('[data-prof]').forEach(b => b.onclick = () => enterProfile(b.dataset.prof));
  if ($('#bNew')) $('#bNew').onclick = () => { shell(newProfileForm() + '<button class="btn ghost" onclick="route()">Назад</button>'); wireNewProfile(); };
  if ($('#bMove')) $('#bMove').onclick = moveInSheet;
  wireNewProfile();
}
function newProfileForm() {
  return '<section class="card" id="npf"><h3>Как тебя зовут?</h3><input class="inp plain" id="npName" maxlength="30" autocomplete="given-name" placeholder="Имя" inputmode="text" enterkeyhint="next">' +
    '<h3 class="mt">PIN из 4 цифр</h3><p class="muted">Чтобы никто другой не зашёл под твоим именем. Можно без PIN — поставить его позже в настройках.</p>' +
    '<input class="inp plain pin" id="npPin" maxlength="4" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="••••" enterkeyhint="done">' +
    '<div class="row"><button class="btn primary big wide" id="npGo">Начать</button></div><button class="btn ghost" id="npMove">Уже занимался на другом устройстве? Вставить код</button></section>';
}
function wireNewProfile() {
  const go1 = $('#npGo'); if (!go1) return;
  const name = $('#npName'), pin = $('#npPin');
  pin.addEventListener('input', () => { pin.value = pin.value.replace(/\D/g, '').slice(0, 4); });
  go1.onclick = async () => {
    const nm = normName(name.value); if (!nm) { name.focus(); return toast('Напиши имя'); }
    if (pin.value && pin.value.length !== 4) { pin.focus(); return toast('PIN — ровно 4 цифры (или оставь пустым)'); }
    if (profiles().some(p => p.name.toLowerCase() === nm.toLowerCase())) return toast('Такое имя уже есть на этом устройстве');
    await createProfile(nm, pin.value || null);
    document.documentElement.classList.remove('nologin'); go('#/');
  };
  if ($('#npMove')) $('#npMove').onclick = moveInSheet;
}
function enterProfile(id) {
  const p = profOf(id); if (!p) return;
  if (!p.pin) { openProfile(id); document.documentElement.classList.remove('nologin'); return go('#/'); }
  pinSheet(p.name, async pin => {
    if (Date.now() < PINTRY.until) { toast('Подожди немного и попробуй снова'); return false; }
    if (await pinOk(p, pin)) { PINTRY.n = 0; closeSheet(); openProfile(id); document.documentElement.classList.remove('nologin'); go('#/'); return true; }
    PINTRY.n++; if (PINTRY.n >= 5) { PINTRY.until = Date.now() + 30000; PINTRY.n = 0; toast('5 неверных попыток — подожди 30 секунд'); }
    return false;
  }, () => forgotPin(p));
}
/* PIN pad: four dots and big digits; cb(pin) returns true when the PIN fits */
function pinSheet(title, cb, onForgot) {
  const sh = openSheet('<div class="pinbox"><h3>' + esc(title) + '</h3><p class="muted">Введи PIN</p><div class="pindots" id="pdots"><i></i><i></i><i></i><i></i></div><div class="pinpad">' +
    [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : '<button type="button" class="pk" data-pk="' + k + '">' + k + '</button>').join('') +
    '</div>' + (onForgot ? '<button class="btn ghost" id="pForgot">Забыл PIN</button>' : '') + '</div>');
  let v = '';
  const draw = () => $$('#pdots i').forEach((d, i) => d.classList.toggle('on', i < v.length));
  const press = async k => {
    if (k === '⌫') v = v.slice(0, -1); else if (v.length < 4) v += k;
    draw(); vib(6);
    if (v.length === 4) { const ok = await cb(v); if (!ok) { const d = $('#pdots'); if (d) { d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); } vib([40, 60, 40]); v = ''; setTimeout(draw, 250); } }
  };
  $$('[data-pk]', sh).forEach(b => b.onclick = () => press(String(b.dataset.pk)));
  const onKey = e => { if (!$('#sheet')) return document.removeEventListener('keydown', onKey); if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('⌫'); };
  document.addEventListener('keydown', onKey);
  if (onForgot) $('#pForgot', sh).onclick = onForgot;
}
function forgotPin(p) {
  const sh = openSheet('<h3>Сбросить PIN</h3><p class="muted">Прогресс сохранится, удалится только PIN. Чтобы подтвердить, напиши имя профиля полностью: <b>' + esc(p.name) + '</b>.</p><input class="inp plain" id="fpName" autocomplete="off"><div class="row"><button class="btn primary" id="fpGo">Сбросить PIN</button><button class="btn ghost" onclick="closeSheet()">Отмена</button></div>');
  $('#fpGo', sh).onclick = () => {
    if (normName($('#fpName').value).toLowerCase() !== p.name.toLowerCase()) return toast('Имя не совпадает');
    const ps = profiles(); const x = ps.find(q => q.id === p.id); x.pin = null; x.pinReset = Date.now(); saveProfiles(ps);
    closeSheet(); openProfile(p.id); document.documentElement.classList.remove('nologin'); toast('PIN сброшен. Поставь новый в настройках.'); go('#/settings');
  };
}

/* ---------- the progress code: the student sends it to the tutor, the tutor sends it back ----------
   Progress lives only on the device. The code carries all of it: the tutor pastes it on his device,
   continues with the student at the lesson, then sends his code back — the student pastes it and goes on.
   A code always finds «its» student by the id (or the name) and only adds to the progress, never wipes it. */
async function codeSheet() {
  if (!DB) return;
  const code = await progressCode();
  const text = 'Brevet · ' + DB.name + ' · ' + new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + '\n' + code;
  const sh = openSheet('<h3>Код прогресса</h3><p class="muted">В коде весь твой прогресс. Отправь его ' + esc(APP.tutorTo) + ' в Telegram или WhatsApp: так прогресс сохранится у него, и на уроке он продолжит его вместе с тобой. Потом он пришлёт код обратно — вставь его здесь же, «Я → Вставить код».</p>' +
    '<textarea class="inp plain code" rows="4" readonly aria-label="код прогресса">' + esc(text) + '</textarea><div class="row">' +
    (navigator.share ? '<button class="btn primary" id="cShare">' + ico('share') + 'Отправить</button>' : '') + '<button class="btn' + (navigator.share ? '' : ' primary') + '" id="cCopy">Скопировать</button></div>');
  const done = () => { DB.bk = { at: Date.now(), n: totalTasks() }; save(); };
  $('#cCopy', sh).onclick = () => { copyText(text); done(); };
  if ($('#cShare', sh)) $('#cShare', sh).onclick = () => navigator.share({ text }).then(() => { done(); closeSheet(); toast('Код отправлен'); route(); }).catch(() => { /* closed the share sheet */ });
}
function pasteSheet() {
  const sh = openSheet('<h3>Вставить код</h3><p class="muted">Скопируй сообщение с кодом целиком (код начинается с BRV) и вставь сюда. Прогресс ученика из кода добавится к тому, что уже есть, — ничего не сотрётся.</p>' +
    '<textarea class="inp plain" id="mvCode" rows="4" placeholder="BRV2.…" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>' +
    '<div class="row"><button class="btn primary" id="mvGo">Загрузить</button><label class="btn" for="mvFile">' + ico('load') + 'Файл копии</label><input type="file" id="mvFile" accept=".json,application/json" hidden></div>');
  $('#mvGo', sh).onclick = async () => { try { takeProgress(await readCode($('#mvCode').value)); } catch (e) { toast(e.message || 'Код не читается'); } };
  $('#mvFile', sh).onchange = e => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { takeProgress(readBackup(JSON.parse(rd.result))); } catch (er) { toast(er.message || 'Это не файл прогресса'); } }; rd.readAsText(f); };
}
const moveInSheet = pasteSheet;
function enterApp() { document.documentElement.classList.remove('nologin'); }
/* which student the progress belongs to: this one, another one on this device, or a new one */
function takeProgress(inc) {
  closeSheet();
  const ps = profiles();
  const target = (inc.src && ps.find(p => p.id === inc.src)) || ps.find(p => p.name.toLowerCase() === String(inc.name).toLowerCase());
  if (!target) {
    return confirmSheet('Новый ученик: ' + inc.name, 'На этом устройстве ещё нет ученика «' + esc(inc.name) + '». Добавить его вместе с прогрессом из кода?' + (DB ? ' Профиль «' + esc(DB.name) + '» останется как был.' : ''), 'Добавить', async () => {
      if (DB) save(); await createProfile(inc.name, null, inc.src); applyIncoming(inc, 'прогресс из кода'); enterApp(); toast('Добавлен ученик «' + inc.name + '»'); go('#/');
    });
  }
  if (DB && target.id === DB.id) return previewRestore(inc);
  const open = () => { if (DB) save(); openProfile(target.id); enterApp(); previewRestore(inc); };
  if (target.pin) return pinSheet(target.name, async pin => { if (await pinOk(target, pin)) { closeSheet(); open(); return true; } return false; });
  confirmSheet('Код ученика «' + target.name + '»', 'Это прогресс ученика «' + esc(target.name) + '». Открыть его профиль и добавить прогресс из кода?', 'Открыть', open);
}
/* before anything is changed: what is here now and what the copy holds */
function previewRestore(inc) {
  const a = dbSummary(DB), b = dbSummary(inc);
  const row = (t, x, y) => '<tr><td>' + t + '</td><td>' + x + '</td><td>' + y + '</td></tr>';
  const sh = openSheet('<h3>' + esc(DB.name) + ': добавить прогресс?</h3><table class="tbl"><tr><th></th><th>Сейчас</th><th>В коде</th></tr>' + row('Заданий решено', a.tasks, b.tasks) + row('Тем освоено', a.topics, b.topics) + row('Пробников', a.exams, b.exams) + '</table>' +
    '<p class="muted">Ничего не сотрётся: по каждой теме останется лучший результат, а нынешнее состояние сохранится копией в «Я → Данные и копии».</p><div class="row"><button class="btn primary" id="rsGo">Объединить</button><button class="btn ghost" id="rsNo">Отмена</button></div>');
  $('#rsGo', sh).onclick = () => { applyIncoming(inc, 'перед загрузкой кода'); closeSheet(); toast('Готово: прогресс объединён'); go('#/'); route(); };
  $('#rsNo', sh).onclick = () => { closeSheet(); route(); };
}

/* ---------- Today ---------- */
function greet() { const h = new Date().getHours(); return h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер'; }
function viewToday() {
  chrome({ title: 'Сегодня', tab: 0 });
  const n = todayN(), G = GOAL(), stk = streak(), ids = todayPlan(), pd = planDone(), nx = planNext();
  const d = new Date();
  let h = '<div class="hello"><div class="hi">' + greet() + ', ' + esc(DB.name) + '!</div><div class="muted">' + WDAY[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()] + '</div></div>';
  h += warnHtml();
  if (isIOS() && !isStandalone()) h += '<a class="card rcard late" href="#/install"><span class="lic">' + ico('phone') + '</span><span class="lt"><b>Добавь Brevet на экран «Домой»</b><span class="muted">В Safari прогресс может стереться, если неделю не открывать сайт. С экрана «Домой» — надёжнее.</span></span></a>';
  if (DB.cur) { const md = MODES[DB.cur.mode]; h += '<a class="card rcard late" href="#/exam/run"><span class="lic">' + ico('timer') + '</span><span class="lt"><b>Продолжить: ' + esc(md.ru) + '</b><span class="muted">' + (DB.cur.parts[DB.cur.part].end ? 'Время идёт: осталось ' + mmss((DB.cur.parts[DB.cur.part].end - Date.now()) / 1000) : 'Без таймера') + '</span></span></a>'; }
  h += '<section class="card focus"><div class="frow">' + ring(n, G, 76, n) + '<div class="gtx"><b>Цель дня: ' + G + ' ' + plural(G, 'задание', 'задания', 'заданий') + '</b><span class="muted">' + (n >= G ? 'Цель выполнена — можно ещё, если хочется.' : n ? 'Осталось ' + (G - n) + '.' : 'Начни — и день пойдёт в серию.') + '</span></div><div class="streak' + (stk ? ' on' : '') + '">' + ico('flame') + '<b>' + stk + '</b><span>' + plural(stk, 'день', 'дня', 'дней') + '<br>подряд</span></div></div>' +
    '<a class="btn big wide" href="#/t/plan">' + ico('play') + (n ? 'Продолжить' : 'Заниматься') + '</a>' +
    '<a class="fplan" href="#/plan"><span>План на сегодня: ' + pd + ' из ' + ids.length + ' ' + plural(ids.length, 'темы', 'тем', 'тем') + (nx && TP(nx) ? ' · сейчас: ' + esc(TP(nx).ru) : '') + '</span><span class="pdots">' + ids.map(id => '<i class="' + (isM(id) || doneToday(id) ? 'on' : '') + '"></i>').join('') + '</span></a></section>';
  if (!DB.diag) h += '<section class="card guide"><div class="cont"><span class="lic">' + ico('list') + '</span><span class="lt"><b>Стартовая проверка</b><span class="muted">16 вопросов, 15–20 минут. Что знаешь — засчитается, и план не будет тратить на это время.</span></span></div><button class="btn primary" id="bDiag">Пройти</button></section>';
  const days = daysTo(APP.exam), r = ready();
  h += '<a class="card count" href="#/me"><span class="cbig"><span class="num">' + Math.max(0, days) + '</span><span class="lab">' + plural(days, 'день', 'дня', 'дней') + ' до бревета</span></span><span class="ctx"><b>Математика · DNB</b><span class="muted">' + esc(APP.examLabel) + '</span><span class="bar"><i style="width:' + r.p + '%"></i></span><span class="muted">готовность ' + r.p + '%</span></span></a>';
  const weak = TOPICS.filter(t => isWeak(t.id)).length;
  if (weak) h += '<a class="card rcard" href="#/t/err"><span class="lic">' + ico('redo') + '</span><span class="lt"><b>Работа над ошибками</b><span class="muted">' + weak + ' ' + plural(weak, 'тема', 'темы', 'тем') + ' с недавними ошибками</span></span></a>';
  if (backupDue()) h += '<section class="card guide"><div class="cont"><span class="lic">' + ico('shield') + '</span><span class="lt"><b>' + (DB.bk.at ? 'Пора отправить код прогресса' : 'Прогресс хранится только на этом телефоне') + '</b><span class="muted">' +
    (DB.bk.at ? 'Последний раз — ' + new Date(DB.bk.at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + ', с тех пор решено ' + (totalTasks() - (DB.bk.n || 0)) + '. ' : 'Если телефон потеряется или приложение удалится, всё решённое пропадёт. ') +
    'Отправь код ' + esc(APP.tutorTo) + ' — это 10 секунд, и прогресс сохранится у него.</span></span></div><button class="btn primary" id="bCode">' + ico('share') + 'Отправить код</button></section>';
  h += '<div class="exrow"><a class="exchip" href="#/exam">' + ico('nocalc') + '<span><b>Partie 1</b><small>20 минут</small></span></a><a class="exchip" href="#/prog">' + ico('pen') + '<span><b>Задачи</b><small>Partie 2</small></span></a><a class="exchip" href="#/dico">' + ico('dico') + '<span><b>Словарик</b><small>FR → RU</small></span></a></div>';
  shell(h);
  if ($('#bDiag')) $('#bDiag').onclick = () => { newExam('diag'); go('#/exam/run'); };
  if ($('#bCode')) $('#bCode').onclick = codeSheet;
}
/* the reminder: first after 10 answers, then once a week if 30 more answers were added */
function backupDue() { const n = totalTasks(); return DB.bk.at ? n - (DB.bk.n || 0) >= 30 && Date.now() - DB.bk.at > 7 * 864e5 : n >= 10; }
function warnHtml() { return SAVE_FAIL ? '<section class="card warnc"><b>Не получается сохранить прогресс</b><p class="muted">Память браузера переполнена. Сохрани копию файлом («Я → Данные и копии») и освободи место на устройстве.</p></section>' : ''; }
function syncWarn() { const a = $('#app'); if (a && SAVE_FAIL && !$('.warnc')) a.insertAdjacentHTML('afterbegin', warnHtml()); }

/* ---------- Programme: chapters ---------- */
function viewProg() {
  chrome({ title: 'Программа', tab: 1 });
  const r = ready();
  let h = '<section class="card hero"><div class="hrow"><span class="stile big">' + ico('books') + '</span><div class="htx"><b class="h2">Математика · бревет</b><span class="muted">Освоено тем: ' + r.m + ' из ' + r.n + ' · задачи Partie 2: ' + PROBLEMS.filter(p => (DB.pb[p.id] || {}).best >= 0.6).length + ' из ' + PROBLEMS.length + '</span></div></div><div class="bar"><i style="width:' + pct(r.m, r.n) + '%"></i></div></section>';
  h += '<div class="lst2">' + CHAPTERS.map((c, i) => {
    const [m, n] = chProgress(c.id); const np = PROBLEMS.filter(p => p.ch === c.id).length;
    return '<a class="card chcard" href="#/ch/' + c.id + '"><span class="chtop"><span class="chnum">Глава ' + (i + 1) + '</span><span class="chtitle">' + esc(c.ru) + '</span><span class="chru" lang="fr">' + esc(c.fr) + '</span></span><span class="bar"><i style="width:' + pct(m, n) + '%"></i></span><span class="meta">тем освоено ' + m + ' из ' + n + (np ? ' · задач: ' + np : '') + '</span></a>';
  }).join('') + '</div>';
  h += '<a class="card rcard" href="#/dico"><span class="lic">' + ico('dico') + '</span><span class="lt"><b>Словарик FR → RU</b><span class="muted">' + GLOSS.length + ' ' + plural(GLOSS.length, 'слово', 'слова', 'слов') + ' из заданий бревета</span></span></a>';
  h += '<a class="card rcard" href="' + APP.tableur + '" target="_blank" rel="noopener"><span class="lic">' + ico('grid') + '</span><span class="lt"><b>Tableur Brevet</b><span class="muted">Отдельный тренажёр по таблицам (tableur): формулы, растягивание, функции</span></span>' + ico('link') + '</a>';
  shell(h);
}
function viewChapter(id) {
  const c = CH(id); if (!c) return go('#/prog');
  chrome({ title: c.ru, back: '#/prog', tab: 1 });
  const [m, n] = chProgress(id);
  let h = '<section class="card hero"><div class="htx"><span class="chnum">Глава ' + chNum(id) + '</span><b class="h2">' + esc(c.ru) + '</b><span class="frn" lang="fr">' + esc(c.fr) + '</span></div><div class="bar"><i style="width:' + pct(m, n) + '%"></i></div>' +
    '<div class="row"><a class="btn primary" href="#/t/mix:' + id + '">' + ico('play') + 'Вперемешку</a>' + (FICHES.some(f => f.ch === id) ? '<a class="btn" href="#/fiche/' + id + '">' + ico('book') + 'Шпаргалка</a>' : '') + '</div></section>';
  [[1, 'База', 'то, на чём держится всё остальное'], [2, 'Уровень бревета', 'как в Partie 1'], [3, 'Сверх', 'сложнее экзамена — для тех, кто хочет больше']].forEach(([l, nm, sub]) => {
    const ts = TOPICS.filter(t => t.ch === id && t.lvl === l); if (!ts.length) return;
    h += '<div class="sechead">' + nm + '<span class="secsub">' + sub + '</span></div><div class="skills">' + ts.map(t => { const s = skOf(t.id); return '<a class="skill' + (l === 3 ? ' ext' : '') + '" href="#/t/' + t.id + '"><span class="nm"><b>' + esc(t.ru) + '</b><span class="frn" lang="fr">' + esc(t.fr) + '</span></span>' + (t.calc ? '' : '<span class="nc" title="без калькулятора">' + ico('nocalc') + '</span>') + dotsHtml(s) + '</a>'; }).join('') + '</div>';
  });
  const pbs = PROBLEMS.filter(p => p.ch === id);
  if (pbs.length) h += '<div class="sechead">Задачи Partie 2<span class="secsub">с контекстом и обоснованиями</span></div><div class="skills">' + pbs.map(p => { const s = DB.pb[p.id]; return '<a class="skill" href="#/pb/' + p.id + '"><span class="nm"><b>' + esc(p.ru) + '</b><span class="frn">' + esc(p.src) + '</span></span>' + (s ? '<span class="pill ' + (s.best >= 0.8 ? 'g' : s.best >= 0.5 ? 'y' : 'r') + '">' + Math.round(100 * s.best) + '%</span>' : '<span class="pill b">' + p.pts + ' б.</span>') + '</a>'; }).join('') + '</div>';
  shell(h);
}

/* ---------- mock exams ---------- */
function viewExam() {
  chrome({ title: 'Пробники', tab: 2 });
  let h = '';
  if (DB.cur) { const md = MODES[DB.cur.mode]; h += '<a class="card rcard late" href="#/exam/run"><span class="lic">' + ico('timer') + '</span><span class="lt"><b>Продолжить: ' + esc(md.ru) + '</b><span class="muted">Ответы сохранены. ' + (DB.cur.parts[DB.cur.part].end ? 'Осталось ' + mmss((DB.cur.parts[DB.cur.part].end - Date.now()) / 1000) : '') + '</span></span></a>'; }
  h += '<section class="card"><p class="muted" style="margin:0">Бревет 2027: Partie 1 — 6 баллов за 20 минут без калькулятора, Partie 2 — 14 баллов за 1 ч 40. Пробник — как на экзамене: с таймером, без подсказок и без перевода. Разбор и решения — после.</p></section>';
  h += '<div class="lst">' + ['p1', 'p2', 'blanc', 'quick', 'diag'].map(k => { const md = MODES[k]; return '<button class="lrow" data-mode="' + k + '"><span class="lic big">' + ico(md.ic) + '</span><span class="lt"><b>' + md.ru + '</b><span class="frn" lang="fr">' + md.fr + '</span><span class="muted">' + md.sub + '</span></span>' + ico('play') + '</button>'; }).join('') + '</div>';
  const hist = DB.exams.slice().reverse();
  if (hist.length) h += '<div class="sechead">История</div><div class="lst">' + hist.slice(0, 15).map((e, i) => '<' + (i === 0 && DB.last ? 'a href="#/exam/res"' : 'div') + ' class="lrow"><span class="lic num">' + (e.mode === 'diag' ? e.ok + '/' + e.n : n20(e.note)) + '</span><span class="lt"><b>' + esc(MODES[e.mode] ? MODES[e.mode].ru : e.mode) + '</b><span class="muted">' + new Date(e.t0).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + (e.mode === 'diag' ? '' : ' · ' + n20(e.note) + ' из ' + e.max) + '</span></span>' + (i === 0 && DB.last ? ico('eye') : '') + '</' + (i === 0 && DB.last ? 'a' : 'div') + '>').join('') + '</div>';
  shell(h);
  $$('[data-mode]').forEach(b => b.onclick = () => {
    const k = b.dataset.mode, md = MODES[k];
    const start = () => { newExam(k); go('#/exam/run'); };
    if (DB.cur) return confirmSheet('Начать новый пробник?', 'Незаконченный пробник «' + esc(MODES[DB.cur.mode].ru) + '» будет закрыт без оценки.', 'Начать новый', start, true);
    confirmSheet(md.ru, md.sub + '. ' + (k === 'diag' ? 'Подсказок нет; что знаешь — засчитается.' : 'Таймер запустится сразу; перевода в пробнике нет. Если закрыть приложение, время продолжит идти.'), 'Начать', start);
  });
}

/* ---------- Me ---------- */
function viewMe() {
  chrome({ title: 'Я', tab: 3 });
  const r = ready(), stk = streak(), tt = totalTasks();
  let h = '<section class="card mehero"><span class="lic big">' + esc((DB.name || '?')[0].toUpperCase()) + '</span><span class="lt"><span class="mename">' + esc(DB.name) + '</span><span class="muted">Серия ' + dn(stk) + ' · лучшая ' + dn(Math.max(stk, bestStreak())) + '</span></span></section>';
  h += '<section class="card"><div class="pstats"><div><b>' + tt + '</b><span>заданий решено</span></div><div><b>' + r.m + '</b><span>тем освоено из ' + r.n + '</span></div><div><b>' + r.p + '%</b><span>готовность</span></div></div>' + weekChart() + '<p class="meta" style="margin:6px 0 0">Готовность = 50 % темы + 25 % задачи Partie 2 + 25 % последний пробник (' + (r.ex == null ? 'ещё не было' : r.ex + '%') + ').</p></section>';
  h += '<section class="card"><h3>Код прогресса</h3><p class="muted">Прогресс хранится только на этом устройстве. Отправляй код ' + esc(APP.tutorTo) + ' хотя бы раз в неделю — так он не пропадёт, а на уроке его можно продолжить на другом устройстве. ' + (DB.bk.at ? 'Последний раз: ' + new Date(DB.bk.at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + '.' : 'Ещё ни разу не отправлялся.') + '</p><div class="row"><button class="btn primary" id="bCode">' + ico('share') + 'Отправить код</button><button class="btn" id="bPaste">' + ico('load') + 'Вставить код</button></div></section>';
  h += '<div class="lst">' + [['#/plan', 'cal', 'План до бревета', 'что и когда'], ['#/badges', 'trophy', 'Значки', Object.keys(DB.badges).length + ' из ' + badgeList().length], ['#/data', 'shield', 'Данные и копии', 'копии на устройстве, файл'], ['#/settings', 'gear', 'Настройки', 'имя, PIN, цель дня, тема'], ['#/dico', 'dico', 'Словарик', 'FR → RU']].map(([href, ic, t, s]) => '<a class="lrow" href="' + href + '"><span class="lic">' + ico(ic) + '</span><span class="lt"><b>' + t + '</b><span class="muted">' + esc(s) + '</span></span></a>').join('') + '</div>';
  h += '<div class="row"><button class="btn" id="bSwitch">' + ico('swap') + 'Сменить ученика</button></div>';
  shell(h);
  $('#bSwitch').onclick = () => { signOut(); go('#/login'); };
  $('#bCode').onclick = codeSheet; $('#bPaste').onclick = pasteSheet;
}
function weekChart() {
  const days = []; const d = today0(); d.setDate(d.getDate() - 13);
  for (let i = 0; i < 14; i++) { days.push(ymd(d)); d.setDate(d.getDate() + 1); }
  const mx = Math.max(GOAL(), ...days.map(k => DB.days[k] || 0));
  return '<div class="bplot">' + days.map(k => '<div class="bcol' + ((DB.days[k] || 0) >= goalFor(k) ? ' ok' : '') + '"><i style="height:' + Math.round(100 * (DB.days[k] || 0) / mx) + '%"></i></div>').join('') + '<div class="gline" style="bottom:' + Math.round(100 * GOAL() / mx) + '%"></div></div><div class="blab">' + days.map((k, i) => '<span' + (i === 13 ? ' class="now"' : '') + '>' + (i % 2 === 1 ? '' : +k.slice(8)) + '</span>').join('') + '</div>';
}
function viewPlan() {
  chrome({ title: 'План', back: '#/', tab: 0 });
  const ids = todayPlan(), order = planOrder().filter(id => !ids.includes(id)), days = Math.max(1, daysTo(APP.exam));
  const per = Math.max(2, Math.round(GOAL() / 6)), left = MAIN().filter(t => !isM(t.id)).length;
  const weeks = Math.ceil(left / (per * 5));
  let h = '<section class="card"><h3>Сегодня</h3><div class="lst">' + ids.map(id => { const t = TP(id); if (!t) return ''; const ok = isM(id) || doneToday(id); return '<a class="lrow' + (ok ? ' done' : '') + '" href="#/t/' + id + '"><span class="lic">' + ico(ok ? 'check' : 'target') + '</span><span class="lt"><b>' + esc(t.ru) + '</b><span class="muted">' + esc(CH(t.ch).ru) + ' · ' + ['', 'база', 'бревет', 'сверх'][t.lvl] + '</span></span>' + dotsHtml(skOf(id)) + '</a>'; }).join('') + '</div></section>';
  h += '<section class="card"><h3>Дальше</h3><p class="muted">Осталось тем: ' + left + '. В таком темпе (' + per + ' ' + plural(per, 'тема', 'темы', 'тем') + ' в день, 5 дней в неделю) все темы будут пройдены примерно за ' + weeks + ' ' + plural(weeks, 'неделю', 'недели', 'недель') + ' — до бревета ' + dn(days) + '. Оставшееся время — задачи Partie 2 и пробники.</p>' +
    (order.length ? '<div class="lst">' + order.slice(0, 12).map(id => { const t = TP(id); return '<a class="lrow" href="#/t/' + id + '"><span class="lic">' + ico('target') + '</span><span class="lt"><b>' + esc(t.ru) + '</b><span class="muted">' + esc(CH(t.ch).ru) + '</span></span></a>'; }).join('') + '</div>' : '') + '</section>';
  h += '<section class="card"><h3>Пробники</h3><ul class="gsteps"><li>Раз в две недели — <b>Partie 1</b> (20 минут).</li><li>Раз в месяц — <b>Partie 2</b>, а с апреля — раз в неделю.</li><li>С мая — <b>Brevet blanc</b> раз в неделю, в то же время, что экзамен: с 10:00 до 12:00.</li></ul><a class="btn" href="#/exam">К пробникам</a></section>';
  shell(h);
}
function viewBadges() {
  chrome({ title: 'Значки', back: '#/me', tab: 3 });
  shell('<div class="badges">' + badgeList().map(b => { const got = !!DB.badges[b.id]; return '<div class="badge' + (got ? ' got' : '') + '"><span class="bm">' + ico(b.ic) + '</span><b>' + b.t + '</b><small>' + b.d + '</small>' + (got ? '' : '<span class="bar"><i style="width:' + pct(Math.min(b.v, b.n), b.n) + '%"></i></span>') + '</div>'; }).join('') + '</div>');
}

/* ---------- settings ---------- */
function viewSettings() {
  chrome({ title: 'Настройки', back: '#/me', tab: 3 });
  const opt = (on, lab, act) => '<button class="btn small' + (on ? ' primary' : '') + '" data-act="' + act + '">' + lab + '</button>';
  const p = profOf(DB.id) || {};
  let h = '<section class="card"><div class="ansbox"><label for="stName"><b>Имя</b></label><div class="row nowrap"><input class="inp plain" id="stName" value="' + esc(DB.name || '') + '" maxlength="30" autocomplete="given-name"><button class="btn primary" id="stSave">Сохранить</button></div></div></section>';
  h += '<section class="card setl"><div class="setr"><b>PIN</b><div class="row">' + (p.pin ? '<button class="btn small" id="stPin">Сменить PIN</button><button class="btn small danger" id="stPinOff">Убрать PIN</button>' : '<button class="btn small primary" id="stPin">Поставить PIN</button>') + '</div>' + (p.pin ? '<div class="row">' + opt(DB.pinAsk !== false, 'Спрашивать при каждом запуске', 'pinAsk:1') + opt(DB.pinAsk === false, 'Только при смене ученика', 'pinAsk:0') + '</div>' : '') + '<span class="meta">PIN защищает от случайного входа под чужим именем на этом устройстве.</span></div>';
  h += '<div class="setr"><b>Цель дня</b><div class="row">' + opt(!DB.goal, 'Авто · ' + autoGoal(), 'goal:0') + [10, 15, 20, 30].map(n => opt(DB.goal === n, n, 'goal:' + n)).join('') + '</div><span class="meta">«Авто» считает, сколько заданий в день нужно, чтобы пройти все темы до бревета.</span></div>';
  h += '<div class="setr"><b>Клавиатура для ответов</b><div class="row">' + opt(!DB.kbd, 'Математическая', 'kbd:0') + opt(!!DB.kbd, 'Обычная', 'kbd:1') + '</div></div>';
  h += '<div class="setr"><b>Вибрация</b><div class="row">' + opt(DB.vib !== false, 'Включена', 'vib:1') + opt(DB.vib === false, 'Выключена', 'vib:0') + '</div></div>';
  h += '<div class="setr"><b>Тема оформления</b><div class="row">' + THEMES.map(t => opt(LS.get('theme', 'auto') === t, THEME_RU[t][0].toUpperCase() + THEME_RU[t].slice(1), 'theme:' + t)).join('') + '</div></div></section>';
  h += '<section class="card"><b>Версия</b><p class="meta" style="margin:4px 0 8px">' + esc(BUILD || 'dev') + ' · ' + (navigator.serviceWorker && navigator.serviceWorker.controller ? 'работает без интернета' : 'нужен интернет при первом запуске') + '</p><button class="btn small" id="stUpd">Проверить обновление</button></section>';
  shell(h);
  $('#stSave').onclick = () => { renameProfile($('#stName').value); toast('Сохранено'); viewSettings(); };
  $$('[data-act]').forEach(b => b.onclick = () => {
    const [k, v] = b.dataset.act.split(':');
    if (k === 'goal') { DB.goal = +v; DB.plan = null; delete DB.goalH[todayKey()]; }
    if (k === 'kbd') DB.kbd = v === '1';
    if (k === 'vib') { DB.vib = v === '1'; vib(20); }
    if (k === 'pinAsk') DB.pinAsk = v === '1';
    if (k === 'theme') setTheme(v);
    save(); viewSettings();
  });
  $('#stPin').onclick = () => pinSheet('Новый PIN', async pin => { await setPin(pin); closeSheet(); toast('PIN сохранён'); viewSettings(); return true; });
  if ($('#stPinOff')) $('#stPinOff').onclick = () => confirmSheet('Убрать PIN?', 'Войти в профиль на этом устройстве сможет любой.', 'Убрать', async () => { await setPin(null); viewSettings(); }, true);
  $('#stUpd').onclick = async () => { if (!UPD_ON) return toast('Проверка работает только на сайте'); toast('Проверяю…', 1200); const f = await updCheck(true); if (!f) toast('Это последняя версия'); };
}

/* ---------- data and copies ---------- */
function viewData() {
  chrome({ title: 'Данные и копии', back: '#/me', tab: 3 });
  const per = LS.get('persist', null), sn = snaps(DB.id);
  let h = '<section class="card"><h3>Где хранится прогресс</h3><p class="muted">Только на этом устройстве, в памяти браузера. Он сохраняется после каждого ответа, а раз в день приложение само делает копию здесь же. Но если телефон потеряется или приложение удалят с экрана «Домой», спасёт только код, отправленный ' + esc(APP.tutorTo) + ', или файл копии.</p>' +
    '<div class="lst"><div class="lrow"><span class="lic">' + ico(per ? 'shield' : 'help') + '</span><span class="lt"><b>' + (per ? 'Браузер не будет очищать память приложения' : per === false ? 'Браузер может очистить память при нехватке места' : 'Защита памяти: проверяется') + '</b><span class="muted">' + (isStandalone() ? 'Открыто с экрана «Домой» — хорошо.' : isIOS() ? 'Открыто в Safari: лучше добавить на экран «Домой».' : 'Открыто в браузере.') + '</span></span></div>' +
    '<div class="lrow"><span class="lic">' + ico('save') + '</span><span class="lt"><b>Последний код или копия</b><span class="muted">' + (DB.bk.at ? new Date(DB.bk.at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : 'ещё не было') + '</span></span></div></div></section>';
  h += '<section class="card"><h3>Код прогресса</h3><p class="muted">Короткий текст, в котором весь прогресс. Отправь его ' + esc(APP.tutorTo) + ' — он вставит код у себя и продолжит с тобой на уроке, а потом пришлёт свой код обратно. Раз в неделю приложение напомнит.</p><div class="row"><button class="btn primary" id="dCode">' + ico('share') + 'Отправить код</button><button class="btn" id="dPaste">' + ico('load') + 'Вставить код</button></div></section>';
  h += '<section class="card"><h3>Копия файлом</h3><p class="muted">Запасной способ: файл можно положить в «Файлы» (iCloud Drive). Загрузка копии сначала покажет, что изменится; текущий прогресс не потеряется — он объединится с копией.</p><div class="row"><button class="btn" id="dSave">' + ico('save') + 'Сохранить файл</button><label class="btn" for="dFile">' + ico('load') + 'Загрузить файл</label><input type="file" id="dFile" accept=".json,application/json" hidden></div></section>';
  if (sn.length) h += '<section class="card"><h3>Копии на этом устройстве</h3><p class="muted">Делаются сами: одна в день и перед каждой загрузкой. Можно вернуть прогресс к такому состоянию — текущий тоже сохранится копией.</p><div class="lst">' + sn.map((s, i) => '<button class="lrow" data-snap="' + i + '"><span class="lic">' + ico('redo') + '</span><span class="lt"><b>' + new Date(s.at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) + '</b><span class="muted">' + esc(s.why || '') + ' · заданий: ' + dbSummary(s.db).tasks + '</span></span></button>').join('') + '</div></section>';
  shell(h);
  $('#dSave').onclick = exportFile;
  $('#dCode').onclick = codeSheet;
  $('#dPaste').onclick = pasteSheet;
  $('#dFile').onchange = e => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { takeProgress(readBackup(JSON.parse(rd.result))); } catch (er) { toast(er.message || 'Это не файл прогресса'); } }; rd.readAsText(f); };
  $$('[data-snap]').forEach(b => b.onclick = () => {
    const s = sn[+b.dataset.snap];
    confirmSheet('Вернуть это состояние?', 'Прогресс станет таким, каким был ' + new Date(s.at).toLocaleString('ru-RU') + '. Текущее состояние сохранится копией — его тоже можно будет вернуть.', 'Вернуть', () => {
      snapshot('перед возвратом'); const keep = { id: DB.id, name: DB.name, snapDay: DB.snapDay }; DB = Object.assign(migrate(JSON.parse(JSON.stringify(s.db))), keep); save(); toast('Готово'); go('#/');
    });
  });
}
function copyText(t) {
  const done = () => toast('Скопировано');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => fallbackCopy(t, done)); else fallbackCopy(t, done);
}
function fallbackCopy(t, cb) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); cb(); } catch (e) { /* not supported */ } a.remove(); }

/* ---------- cheat sheets and the dictionary ---------- */
function viewFiche(ch) {
  const c = CH(ch); if (!c) return go('#/prog');
  chrome({ title: 'Шпаргалка', back: '#/ch/' + ch, tab: 1, words: true });
  const fs = FICHES.filter(f => f.ch === ch);
  shell('<section class="card theory"><span class="chnum">' + esc(c.ru) + '</span>' + fs.map((f, i) => '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(f.ru) + ' <span class="frn" lang="fr">' + esc(f.fr) + '</span></summary>' +
    (f.body || []).map(p => '<p>' + rt(p) + '</p>').join('') +
    (f.ex && f.ex.length ? '<div class="ex">' + f.ex.map(e => '<div><span class="muted">' + rt(e[0]) + '</span>' + (e[1] ? '<div class="mth">' + K(mi(e[1])) + '</div>' : '') + '</div>').join('') + '</div>' : '') +
    (f.frs && f.frs.length ? '<div class="redac"><div class="chl">По-французски — как писать на экзамене</div><div class="redtx frtx" lang="fr">' + f.frs.map(t => '<p>' + rt(frTypo(t)) + '</p>').join('') + '</div></div>' : '') +
    '</details>').join('') + '</section>');
}
const glossKey = s => s.toLowerCase().replace(/^(le |la |les |l'|l’|un |une |des )/, '').normalize('NFD').replace(/[̀-ͯ]/g, '');
function viewDico() {
  chrome({ title: 'Словарик', back: '#/prog', tab: 1 });
  const list = GLOSS.slice().sort((a, b) => glossKey(a.fr).localeCompare(glossKey(b.fr)));
  shell('<section class="card"><input class="inp plain" id="dq" type="search" placeholder="Поиск: médiane, медиана…" autocomplete="off" inputmode="search"></section><div class="card dico" id="dl"></div>');
  const draw = q => { q = (q || '').trim().toLowerCase(); const k = glossKey(q); const xs = list.filter(g => !q || glossKey(g.fr).includes(k) || g.ru.toLowerCase().includes(q)); $('#dl').innerHTML = xs.length ? xs.map(g => '<div class="dw"><b lang="fr">' + esc(g.fr) + '</b><span>' + esc(g.ru) + '</span>' + (g.note ? '<small class="muted">' + rt(g.note) + '</small>' : '') + '</div>').join('') : '<p class="muted">Ничего не нашлось</p>'; };
  draw(''); $('#dq').addEventListener('input', e => draw(e.target.value));
}

/* ---------- how to add the app to the home screen ---------- */
function viewInstall(first) {
  chrome({ title: 'Установка', back: first ? null : '#/me', tab: -1 });
  let h = '<section class="card login"><div class="logo">' + LOGO + '</div><h2>Сначала — на экран «Домой»</h2><p class="muted">На iPhone приложение с экрана «Домой» хранит прогресс отдельно от Safari и надёжнее: Safari стирает данные сайтов, которые не открывали неделю. Поэтому лучше сразу установить и заниматься только через иконку.</p></section>';
  h += '<section class="card"><h3>iPhone и iPad (Safari)</h3><ol class="gsteps"><li>Нажми кнопку «Поделиться» ' + ico('share') + ' внизу (на iPad — вверху).</li><li>Выбери «На экран „Домой“». Если не видно — прокрути список вниз.</li><li>Нажми «Добавить» и открой Brevet с новой иконки.</li></ol></section>';
  h += '<section class="card"><h3>Android (Chrome)</h3><ol class="gsteps"><li>Меню ⋮ справа вверху.</li><li>«Добавить на главный экран» → «Установить».</li></ol></section>';
  if (first) h += '<button class="btn ghost" id="bSafari">Продолжить в браузере</button>';
  shell(h);
  if ($('#bSafari')) $('#bSafari').onclick = () => { SS.set('safari', '1'); viewLogin(); };
}

/* ---------- routes ---------- */
ROUTES.push(
  [/^#\/?$/, () => viewToday()],
  [/^#\/login/, () => { if (DB) signOut(); viewLogin(); }],
  [/^#\/install/, () => viewInstall(!DB)],
  [/^#\/prog$/, () => viewProg()],
  [/^#\/ch\/([\w.-]+)$/, m => viewChapter(m[1])],
  [/^#\/t\/([\w.:-]+)$/, m => viewPractice(m[1])],
  [/^#\/pb\/([\w.-]+)$/, m => viewProblem(m[1])],
  [/^#\/exam$/, () => viewExam()],
  [/^#\/exam\/run$/, () => viewExamRun()],
  [/^#\/exam\/res$/, () => viewExamResult()],
  [/^#\/me$/, () => viewMe()],
  [/^#\/plan$/, () => viewPlan()],
  [/^#\/badges$/, () => viewBadges()],
  [/^#\/settings$/, () => viewSettings()],
  [/^#\/data$/, () => viewData()],
  [/^#\/fiche\/([\w.-]+)$/, m => viewFiche(m[1])],
  [/^#\/dico$/, () => viewDico()]
);
const LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#1F3558"/><text x="32" y="45" text-anchor="middle" font-family="Lora B, Georgia, serif" font-weight="600" font-size="38" fill="#FBFAF7">B</text><circle cx="49" cy="46" r="4.5" fill="#E3A94B"/></svg>';
