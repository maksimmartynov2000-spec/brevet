/* ===================== FOR THE TUTOR: all students at a glance, a summary for the parents, lesson mode =====================
   Nothing here needs a server: the tutor's device knows a student from the progress codes the student sends.
   «Ученики» appears on the sign-in screen when the device holds two profiles or more. */

/* run fn with db in the place of the signed-in student (read only: nothing is saved meanwhile) */
function withDb(db, fn) {
  const cur = DB, ro = READONLY; DB = db; READONLY = true;
  try { return fn(); } finally { DB = cur; READONLY = ro; }
}
const peekDb = id => { const raw = LS.get('db:' + id, null); return raw ? migrate(JSON.parse(JSON.stringify(raw))) : null; };
const dShort = t => new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
const lastAns = s => [...(s.r || '').slice(-5)].map(x => (x === '1' ? '✓' : '✗')).join('');

/* everything the tutor wants to know about the signed-in student, in numbers */
function studentStats() {
  const r = ready(), d7 = lastDays(7), d30 = lastDays(30);
  const lastK = Object.keys(DB.days).filter(k => DB.days[k]).sort().pop() || null;
  const sk = id => DB.sk[id] || {};
  const inWork = TOPICS.filter(t => sk(t.id).a && !sk(t.id).m);
  /* hard: many answers and still not mastered, or mistakes among the last answers */
  const hardScore = t => { const s = sk(t.id); return (s.m ? 0 : Math.min(10, s.a || 0)) + 3 * [...(s.r || '').slice(-5)].filter(x => x === '0').length; };
  const hard = TOPICS.filter(t => { const s = sk(t.id); return (s.a >= 6 && !s.m) || isWeak(t.id); }).sort((a, b) => hardScore(b) - hardScore(a)).slice(0, 5);
  const slow = TOPICS.filter(t => !t.calc && sk(t.id).tm > SLOW).sort((a, b) => sk(b.id).tm - sk(a.id).tm).slice(0, 4);
  const since = n => { const lim = plusDays(Date.now(), -n); return TOPICS.filter(t => { const s = sk(t.id); return s.m && !s.d && s.md >= lim; }); };
  /* pace: topics mastered over the last 30 days (or since the start, if it was less than 30 days ago) */
  const win = Math.min(30, Math.max(7, Math.round((Date.now() - (DB.created || Date.now())) / 864e5))), mWin = since(win).length;
  const left = r.n - r.m, room = Math.max(0, daysTo(APP.exam) - 14);
  let pace;
  if (!left) pace = { ok: true, text: 'все темы освоены — остаются задачи Partie 2 и пробники' };
  else if (!mWin) pace = { ok: false, text: 'за последние ' + dn(win) + ' новых тем не освоено; осталось ' + left };
  else {
    const need = Math.ceil(left / (mWin / win));
    pace = need <= room ? { ok: true, text: 'в таком темпе (' + mWin + ' ' + plural(mWin, 'тема', 'темы', 'тем') + ' за ' + dn(win) + ') все темы будут освоены к ' + dShort(plusDays(Date.now(), need)) + ' — до экзамена останется время на пробники' }
      : { ok: false, text: 'в таком темпе (' + mWin + ' ' + plural(mWin, 'тема', 'темы', 'тем') + ' за ' + dn(win) + ') к середине июня останутся неосвоенными примерно ' + Math.max(1, left - Math.floor(room * mWin / win)) + ' из ' + r.n + ' тем' };
  }
  return { r, dl: readyDelta(7), d7, d30, lastK, inWork, hard, slow, due: TOPICS.filter(t => isDue(t.id)).length, m7: since(7), m30: since(30), left, pace,
    exams: DB.exams.filter(e => e.mode !== 'diag').slice(-3).reverse(), hw: DB.hw, imp: DB.imp || 0, words: Object.keys(DB.vc || {}).length, tasks: totalTasks(), streak: streak() };
}
const acc = d => (d.n ? Math.round(100 * d.ok / d.n) + ' %' : '—');
const agoText = k => { if (!k) return 'занятий ещё не было'; const n = -daysTo(k); return n <= 0 ? 'сегодня' : n === 1 ? 'вчера' : dateRu(k) + ' (' + dn(n) + ' назад)'; };
function hwLine(hw) {
  if (!hw || !hw.items.length) return 'не задано';
  const t = hwTotals(hw);
  return 'от ' + dShort(hw.id) + ': сделано ' + t.done + ' из ' + t.n + ', верно ' + t.ok + (hw.doneAt ? ' · выполнено ' + dShort(hw.doneAt) : hw.due ? ' · ' + hwDueText(hw) : ' · без срока');
}
/* the card of one student: for the overview and for the tutor's page */
function statsHtml(st) {
  const topicList = (ts, extra) => ts.map(t => '<li><b>' + esc(t.ru) + '</b> <span class="muted">' + extra(t) + '</span></li>').join('');
  let h = '<div class="pstats"><div><b>' + st.r.p + '%</b><span>готовность' + (st.dl ? ' · ' + (st.dl > 0 ? '+' : '−') + Math.abs(st.dl) + ' за неделю' : '') + '</span></div><div><b>' + st.r.m + '</b><span>тем освоено из ' + st.r.n + '</span></div><div><b>' + st.d7.days + '</b><span>' + plural(st.d7.days, 'день', 'дня', 'дней') + ' из 7 с занятиями</span></div></div>';
  const rows = [
    ['Занятие', agoText(st.lastK) + (st.imp ? ' · код получен ' + dShort(st.imp) : '')],
    ['7 дней', st.d7.n ? st.d7.n + ' ' + plural(st.d7.n, 'задание', 'задания', 'заданий') + ', с первой попытки верно ' + acc(st.d7) + ', новых тем освоено: ' + st.m7.length : 'заданий не было'],
    ['30 дней', st.d30.n ? dn(st.d30.days) + ' с занятиями, ' + st.d30.n + ' ' + plural(st.d30.n, 'задание', 'задания', 'заданий') + ', верно ' + acc(st.d30) + ', тем освоено: ' + st.m30.length : 'заданий не было'],
    ['Темы', 'в работе ' + st.inWork.length + ' · ждут повторения ' + st.due + ' · не начато ' + Math.max(0, st.left - st.inWork.length)],
    ['Темп', st.pace.text],
    ['Перевод', st.d30.n ? 'всё условие по-русски — в ' + Math.round(100 * Math.min(st.d30.tr, st.d30.n) / st.d30.n) + ' % заданий за 30 дней; переводов слов: ' + st.d30.w + ' (в «Моих словах» ' + st.words + ')' : 'пока нет данных'],
    ['Пробники', st.exams.length ? st.exams.map(e => (MODES[e.mode] ? MODES[e.mode].ru : e.mode) + ' — ' + n20(e.note) + ' из ' + e.max + ' (' + dShort(e.t0) + ')').join('; ') : 'ещё не было'],
    ['Домашнее', hwLine(st.hw)]
  ];
  h += '<table class="tbl kv">' + rows.map(([k, v]) => '<tr><th>' + k + '</th><td>' + esc(v) + '</td></tr>').join('') + '</table>';
  if (st.hard.length) h += '<div class="chl">Трудно даётся</div><ul class="tlist">' + topicList(st.hard, t => { const s = DB.sk[t.id] || {}; return (s.m ? 'освоена, но ' : s.a + ' ' + plural(s.a, 'ответ', 'ответа', 'ответов') + ', ') + 'последние ' + lastAns(s); }) + '</ul>';
  if (st.slow.length) h += '<div class="chl">Медленно: дольше 2 минут на задание без калькулятора</div><ul class="tlist">' + topicList(st.slow, t => 'обычно ' + mmss((DB.sk[t.id] || {}).tm || 0)) + '</ul>';
  return h;
}

/* ---------- «Ученики»: everybody on this device ---------- */
const UNLOCKED = new Set();
function viewEleves() {
  if (DB) signOut();
  chrome({ title: 'Ученики', back: '#/login', tab: -1 }); document.documentElement.classList.add('nologin');
  const ps = profiles().sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  let h = '<section class="card"><p class="muted" style="margin:0">Сводка по каждому ученику на этом устройстве. Она знает то, что было в последнем коде ученика, — попросите прислать свежий код перед уроком. Последние 5 недель видны по дням, более раннее — одной суммой.</p></section>';
  ps.forEach(p => {
    const head = '<div class="cont"><span class="lic big">' + esc((p.name || '?')[0].toUpperCase()) + '</span><span class="lt"><b class="h2">' + esc(p.name) + '</b></span></div>';
    if (p.pin && !UNLOCKED.has(p.id)) { h += '<section class="card stud">' + head + '<p class="muted">Профиль закрыт PIN-кодом.</p><div class="row"><button class="btn" data-unlock="' + p.id + '">' + ico('lock') + 'Ввести PIN</button></div></section>'; return; }
    const db = peekDb(p.id);
    if (!db) { h += '<section class="card stud">' + head + '<p class="muted">Прогресса пока нет.</p></section>'; return; }
    const empty = !dbTasks(db) && !db.hw;
    h += '<section class="card stud">' + head + (empty ? '<p class="muted" style="margin:0">Занятий ещё не было. Вставьте код ученика на экране входа или откройте профиль.</p>' : withDb(db, () => statsHtml(studentStats()))) + '<div class="row"><button class="btn primary" data-open="' + p.id + '" data-to="#/">Открыть профиль</button><button class="btn" data-open="' + p.id + '" data-to="#/hw/new">' + ico('book') + 'Задать ДЗ</button><button class="btn" data-sum="' + p.id + '">Сводка родителям</button></div></section>';
  });
  shell(h);
  const open = (id, to) => { openProfile(id); enterApp(); HWB = null; go(to); };
  $$('[data-open]').forEach(b => b.onclick = () => open(b.dataset.open, b.dataset.to));
  $$('[data-unlock]').forEach(b => b.onclick = () => { const p = profOf(b.dataset.unlock); pinSheet(p.name, async pin => { if (await pinOk(p, pin)) { UNLOCKED.add(p.id); closeSheet(); viewEleves(); return true; } return false; }); });
  $$('[data-sum]').forEach(b => b.onclick = () => { const db = peekDb(b.dataset.sum); if (db) parentSheet(db); });
}

/* ---------- a summary for the parents: plain text, facts only ---------- */
function parentText(n) {
  const d = lastDays(n), r = ready(), dl = readyDelta(n), lim = plusDays(Date.now(), -n);
  const got = TOPICS.filter(t => { const s = DB.sk[t.id]; return s && s.m && !s.d && s.md >= lim; });
  const from = new Date(plusDays(Date.now(), -(n - 1))), to = new Date();
  const span = from.getMonth() === to.getMonth() ? from.getDate() + '–' + to.getDate() + ' ' + MON[to.getMonth()] : from.getDate() + ' ' + MON[from.getMonth()] + ' – ' + to.getDate() + ' ' + MON[to.getMonth()];
  const L = ['Brevet · математика — ' + DB.name, (n <= 7 ? 'Неделя' : 'Месяц') + ': ' + span, ''];
  L.push(d.n ? 'Дней с занятиями: ' + d.days + ' из ' + n + '. Решено заданий: ' + d.n + ', с первой попытки верно ' + acc(d) + '.' : 'Занятий в приложении за это время не было.');
  if (got.length) L.push('Освоено новых тем: ' + got.length + ' — ' + got.slice(0, 6).map(t => t.ru.toLowerCase()).join('; ') + (got.length > 6 ? ' и другие' : '') + '.');
  L.push('Всего освоено тем: ' + r.m + ' из ' + r.n + '. Готовность к экзамену: ' + r.p + ' %' + (dl ? ' (' + (dl > 0 ? '+' : '−') + Math.abs(dl) + ' за ' + (n <= 7 ? 'неделю' : 'месяц') + ')' : '') + '.');
  const ex = DB.exams.filter(e => e.mode !== 'diag' && e.t0 >= lim);
  if (ex.length) L.push('Пробники: ' + ex.map(e => (MODES[e.mode] ? MODES[e.mode].ru : e.mode) + ' — ' + n20(e.note) + ' из ' + e.max).join('; ') + '.');
  const hws = (DB.hwh || []).filter(h => h.id >= lim && (!DB.hw || h.id !== DB.hw.id)).map(h => ({ n: h.n, done: h.done, doneAt: h.doneAt })).concat(DB.hw && DB.hw.id >= lim ? [Object.assign({ doneAt: DB.hw.doneAt }, hwTotals(DB.hw))] : []);
  if (hws.length) L.push('Домашние задания: ' + hws.length + ', выполнено полностью: ' + hws.filter(h => h.doneAt).length + ' (сделано ' + hws.reduce((s, h) => s + h.done, 0) + ' из ' + hws.reduce((s, h) => s + h.n, 0) + ' пунктов).');
  const hard = TOPICS.filter(t => { const s = DB.sk[t.id]; return s && ((s.a >= 6 && !s.m) || isWeak(t.id)); }).slice(0, 4);
  if (hard.length) L.push('Над чем работаем: ' + hard.map(t => t.ru.toLowerCase()).join('; ') + '.');
  L.push('До экзамена (' + APP.examLabel + ') — ' + dn(Math.max(0, daysTo(APP.exam))) + '.');
  return L.join('\n');
}
function parentSheet(db) {
  const make = n => (db ? withDb(db, () => parentText(n)) : parentText(n));
  let n = 7;
  const sh = openSheet('<h3>Сводка для родителей</h3><div class="row"><button class="btn small primary" data-n="7">За неделю</button><button class="btn small" data-n="30">За месяц</button></div><textarea class="inp plain" id="psText" rows="11" aria-label="текст сводки"></textarea><p class="meta">Текст можно поправить перед отправкой. Здесь только то, что посчитало приложение.</p><div class="row">' + (navigator.share ? '<button class="btn primary" id="psShare">' + ico('share') + 'Отправить</button>' : '') + '<button class="btn' + (navigator.share ? '' : ' primary') + '" id="psCopy">Скопировать</button></div>');
  const fill = () => { $('#psText', sh).value = make(n); $$('[data-n]', sh).forEach(b => b.classList.toggle('primary', +b.dataset.n === n)); };
  $$('[data-n]', sh).forEach(b => b.onclick = () => { n = +b.dataset.n; fill(); });
  $('#psCopy', sh).onclick = () => copyText($('#psText', sh).value);
  if ($('#psShare', sh)) $('#psShare', sh).onclick = () => navigator.share({ text: $('#psText', sh).value }).catch(() => { /* closed */ });
  fill();
}

/* ---------- the tutor's page inside a student's profile ---------- */
function viewTutor() {
  chrome({ title: 'Репетитору', back: '#/me', tab: 3 });
  const many = profiles().length > 1;
  let h = '<section class="card stud"><div class="cont"><span class="lic big">' + esc((DB.name || '?')[0].toUpperCase()) + '</span><span class="lt"><b class="h2">' + esc(DB.name) + '</b><span class="muted">всего решено заданий: ' + totalTasks() + '</span></span></div>' + statsHtml(studentStats()) + '</section>';
  h += '<div class="lst">' +
    '<a class="lrow" href="#/hw/new"><span class="lic">' + ico('book') + '</span><span class="lt"><b>Задать домашнее задание</b><span class="muted">темы, задачи Partie 2, пробники; срок по желанию. Сейчас: ' + esc(hwLine(DB.hw)) + '</span></span></a>' +
    '<button type="button" class="lrow" id="tCode"><span class="lic">' + ico('share') + '</span><span class="lt"><b>Отправить код ученику</b><span class="muted">после урока: прогресс и домашнее задание уедут на его устройство</span></span></button>' +
    '<button type="button" class="lrow" id="tPaste"><span class="lic">' + ico('load') + '</span><span class="lt"><b>Вставить код ученика</b><span class="muted">перед уроком: свежий прогресс с его устройства</span></span></button>' +
    '<button type="button" class="lrow' + (LESSON ? ' done' : '') + '" id="tLesson"><span class="lic">' + ico(LESSON ? 'check' : 'eye') + '</span><span class="lt"><b>Режим урока: ' + (LESSON ? 'включён' : 'выключен') + '</b><span class="muted">для показа экрана в Zoom: условие по-французски и по-русски рядом, крупнее, решение открывается по шагам</span></span></button>' +
    '<a class="lrow" href="#/pr"><span class="lic">' + ico('save') + '</span><span class="lt"><b>Печать и PDF</b><span class="muted">лист по теме, смешанный лист, вариант Partie 1, задача Partie 2, Brevet blanc — задания и ответы отдельно</span></span></a>' +
    '<button type="button" class="lrow" id="tSum"><span class="lic">' + ico('user') + '</span><span class="lt"><b>Сводка для родителей</b><span class="muted">текст за неделю или за месяц</span></span></button>' +
    (many ? '<a class="lrow" href="#/eleves"><span class="lic">' + ico('list') + '</span><span class="lt"><b>Все ученики</b><span class="muted">обзор по каждому профилю на этом устройстве</span></span></a>' : '') + '</div>';
  shell(h);
  $('#tCode').onclick = () => codeSheet(true);
  $('#tPaste').onclick = pasteSheet;
  $('#tLesson').onclick = () => { setLesson(!LESSON); toast(LESSON ? 'Режим урока включён' : 'Режим урока выключен'); viewTutor(); };
  $('#tSum').onclick = () => parentSheet(null);
}
ROUTES.push([/^#\/eleves$/, () => viewEleves()], [/^#\/tutor$/, () => { HWB = null; viewTutor(); }]);
