/* ===================== HOMEWORK: set by the tutor, travels in the progress code =====================
   DB.hw = { id, due, doneAt, items: [{ k, id, n, done, ok }] }
     k: 't' — n tasks of a topic, 'p' — a Partie 2 problem, 'x' — a mock exam (id = its mode)
     id of the homework = the minute it was set (so that both devices see the same number after a code)
   The tutor sets it in the student's profile on his own device and sends the code; the student's app shows it first on «Сегодня».
   When everything is done the app offers to send the code back. */
const hwItemN = it => (it.k === 't' ? it.n : 1);
const hwItemDone = it => (it.done || 0) >= hwItemN(it);
const hwItemAlive = it => (it.k === 't' ? !!TP(it.id) : it.k === 'p' ? !!PB(it.id) : !!MODES[it.id]);
const hwOpen = () => !!(DB.hw && !DB.hw.doneAt && DB.hw.items.some(it => hwItemAlive(it) && !hwItemDone(it)));
const hwNextTopic = () => (hwOpen() ? DB.hw.items.find(it => it.k === 't' && TP(it.id) && !hwItemDone(it)) : null);
const inHwDone = id => !!DB.hw && DB.hw.items.some(it => it.id === id && hwItemDone(it));
/* where the next unfinished part is: the topics first, then the problems, then the mock exams */
function hwNextStep() {
  if (!hwOpen()) return null;
  if (hwNextTopic()) return '#/t/hw';
  const p = DB.hw.items.find(it => it.k === 'p' && PB(it.id) && !hwItemDone(it)); if (p) return '#/pb/' + p.id;
  return '#/hw';
}
/* an answer, a finished problem or a finished mock exam counts for the homework wherever it was done */
function hwNote(k, id, ok) {
  const h = DB.hw; if (!h || h.doneAt) return;
  const it = h.items.find(x => x.k === k && x.id === id && !hwItemDone(x)); if (!it) return;
  it.done = (it.done || 0) + 1; if (ok) it.ok = (it.ok || 0) + 1;
  if (h.items.every(x => hwItemDone(x) || !hwItemAlive(x))) {
    h.doneAt = Math.floor(Date.now() / 60000) * 60000; pushHwh(DB, h);
    celebrate({ ic: 'book', title: 'Домашнее задание выполнено!', text: 'Отправь код ' + APP.tutorTo + ' — он увидит, что всё сделано.' });
  }
}
/* how long a homework takes, in minutes: the student's own pace where it is known */
function hwItemMin(it) {
  if (it.k === 't') { const t = TP(it.id), s = DB.sk[it.id] || {}; return it.n * (s.tm || (t && t.calc ? 90 : 60)) / 60; }
  if (it.k === 'p') { const p = PB(it.id); return p ? p.pts * 2.5 : 8; }
  return { p1: 20, p2: 100, blanc: 120, quick: 10 }[it.id] || 20;
}
const hwMinutes = items => Math.max(1, Math.round(items.reduce((s, it) => s + hwItemMin(it), 0)));
function hwItemTitle(it) {
  if (it.k === 't') { const t = TP(it.id); return t ? t.ru : 'тема'; }
  if (it.k === 'p') { const p = PB(it.id); return p ? p.ru : 'задача'; }
  return MODES[it.id] ? MODES[it.id].ru : 'пробник';
}
/* a new homework replaces the current one, which goes to the history as it is */
function hwSet(items, due) {
  let id = Math.floor(Date.now() / 60000) * 60000;
  if (DB.hw) { if (DB.hw.id >= id) id = DB.hw.id + 60000; pushHwh(DB, DB.hw); }
  DB.hw = { id, due: due || null, doneAt: 0, items: items.map(it => ({ k: it.k, id: it.id, n: it.k === 't' ? it.n : 1, done: 0, ok: 0 })) };
  save();
}
/* «до пятницы, 4 декабря» and how soon that is */
function hwDueText(h) {
  if (!h.due) return '';
  const left = daysTo(h.due), d = parseYmd(h.due);
  return 'до ' + WDAY_DO[d.getDay()] + ', ' + dateRu(h.due) + (h.doneAt ? '' : left < 0 ? ' · срок прошёл' : left === 0 ? ' · сегодня' : left === 1 ? ' · завтра' : ' · ещё ' + dn(left));
}

/* ---------- the homework on screen ---------- */
function hwRow(it) {
  const done = hwItemDone(it), alive = hwItemAlive(it);
  const href = it.k === 't' ? '#/t/' + it.id : it.k === 'p' ? '#/pb/' + it.id : '';
  const sub = !alive ? 'этого задания больше нет в приложении' : it.k === 't' ? 'тема · ' + it.n + ' ' + plural(it.n, 'задание', 'задания', 'заданий') + (it.done ? ' · сделано ' + Math.min(it.n, it.done) + ', верно с первой попытки ' + (it.ok || 0) : '')
    : it.k === 'p' ? 'задача Partie 2' + (done ? ' · ' + (it.ok ? 'решена' : 'решена меньше чем на 60 %') : '') : 'пробник · ' + MODES[it.id].sub + (done ? ' · сдан' : '');
  const inner = '<span class="lic">' + ico(done ? 'check' : it.k === 't' ? 'target' : it.k === 'p' ? 'pen' : 'exam') + '</span><span class="lt"><b>' + esc(hwItemTitle(it)) + '</b><span class="muted">' + esc(sub) + '</span></span>' + (it.k === 't' && !done ? '<span class="pill b">' + (it.done || 0) + '/' + it.n + '</span>' : '');
  if (!alive) return '<div class="lrow">' + inner + '</div>';
  return it.k === 'x' ? '<button type="button" class="lrow' + (done ? ' done' : '') + '" data-hwx="' + it.id + '">' + inner + '</button>' : '<a class="lrow' + (done ? ' done' : '') + '" href="' + href + '">' + inner + '</a>';
}
function viewHw() {
  chrome({ title: 'Домашнее задание', back: '#/', tab: 0 });
  const hw = DB.hw; let h = '';
  if (!hw || !hw.items.length) h += '<section class="card"><b>Домашних заданий пока нет</b><p class="muted">Домашнее задание задаёт ' + esc(APP.tutorBy) + ': оно приходит вместе с кодом прогресса. Вставь код («Я → Вставить код») — и задание появится здесь и на экране «Сегодня».</p><a class="btn" href="#/">На главную</a></section>';
  else {
    const tot = hwTotals(hw), left = hw.items.filter(it => hwItemAlive(it) && !hwItemDone(it));
    h += '<section class="card hero"><div class="htx"><span class="chnum">задано ' + dateRu(ymd(new Date(hw.id))) + '</span><b class="h2">' + (hw.doneAt ? 'Выполнено' : 'Домашнее задание') + '</b><span class="muted">' + (hw.doneAt ? 'сделано ' + dateRu(ymd(new Date(hw.doneAt))) + ' · ' : '') + (hwDueText(hw) || 'без срока') + (hw.doneAt ? '' : ' · осталось примерно ' + hwMinutes(left) + ' мин') + '</span></div><div class="bar"><i style="width:' + pct(tot.done, tot.n) + '%"></i></div>' +
      (hw.doneAt ? '<p class="muted">Сделано ' + tot.done + ' из ' + tot.n + ', верно с первой попытки ' + tot.ok + '. ' + ((DB.bk.at || 0) >= hw.doneAt ? 'Код после этого уже отправлялся.' : 'Отправь код ' + esc(APP.tutorTo) + ' — он увидит результат.') + '</p><div class="row"><button class="btn primary" id="hwCode">' + ico('share') + 'Отправить код</button></div>'
        : '<div class="row"><a class="btn primary" href="' + hwNextStep() + '">' + ico('play') + (tot.done ? 'Продолжить' : 'Начать') + '</a></div>') + '</section>';
    h += '<div class="lst">' + hw.items.map(hwRow).join('') + '</div>';
  }
  const hist = (DB.hwh || []).filter(x => !hw || x.id !== hw.id).slice().reverse();
  if (hist.length) h += '<div class="sechead">Прошлые задания</div><div class="lst">' + hist.map(x => '<div class="lrow"><span class="lic">' + ico(x.doneAt ? 'check' : 'x') + '</span><span class="lt"><b>от ' + dateRu(ymd(new Date(x.id))) + '</b><span class="muted">сделано ' + x.done + ' из ' + x.n + ' · верно ' + x.ok + (x.doneAt ? ' · выполнено ' + dateRu(ymd(new Date(x.doneAt))) : ' · не закончено') + '</span></span></div>').join('') + '</div>';
  shell(h);
  if ($('#hwCode')) $('#hwCode').onclick = () => codeSheet();
  $$('[data-hwx]').forEach(b => b.onclick = () => {
    const k = b.dataset.hwx, md = MODES[k];
    if (DB.cur) return DB.cur.mode === k ? go('#/exam/run') : confirmSheet('Начать пробник из домашнего задания?', 'Незаконченный пробник «' + esc(MODES[DB.cur.mode].ru) + '» будет закрыт без оценки.', 'Начать', () => { newExam(k); go('#/exam/run'); }, true);
    confirmSheet(md.ru, md.sub + '. Таймер запустится сразу; перевода в пробнике нет.', 'Начать', () => { newExam(k); go('#/exam/run'); });
  });
}

/* ---------- the tutor sets a homework: a ready set for 10–15 minutes, or anything by hand ---------- */
let HWB = null;          /* { items: { key: { k, id, n } }, due } */
const hwKey = (k, id) => k + ':' + id;
/* the ready set: the topics in work with mistakes, then the next ones of the plan, then a review — until about 12 minutes */
function hwPreset() {
  const out = [], add = (id, n) => { if (!out.some(x => x.id === id)) out.push({ k: 't', id, n }); };
  const inWork = TOPICS.filter(t => { const s = DB.sk[t.id]; return s && s.a && !s.m; }).sort((a, b) => (isWeak(b.id) ? 1 : 0) - (isWeak(a.id) ? 1 : 0));
  const pool = inWork.map(t => t.id).concat(planOrder(), TOPICS.filter(t => isDue(t.id)).map(t => t.id));
  for (const id of pool) { if (hwMinutes(out) >= 10 || out.length >= 4) break; add(id, 4); }
  while (out.length && hwMinutes(out) > 15 && out[out.length - 1].n > 2) out[out.length - 1].n--;
  return out;
}
function viewHwNew() {
  chrome({ title: 'Новое домашнее задание', back: '#/tutor', tab: 3 });
  if (!HWB) HWB = { items: {}, due: '' };
  const B = HWB, N = [0, 3, 5, 8, 10];
  const nOf = id => (B.items[hwKey('t', id)] || {}).n || 0, has = (k, id) => !!B.items[hwKey(k, id)];
  let h = '<section class="card"><b>Для ученика: ' + esc(DB.name) + '</b><p class="muted">Задание уедет к ученику вместе с кодом прогресса и встанет первым на его экране «Сегодня». Когда он всё сделает, приложение предложит ему отправить код обратно.' + (hwOpen() ? ' <b>Сейчас у ученика есть незаконченное задание — новое его заменит.</b>' : '') + '</p>' +
    '<div class="row"><button class="btn primary" id="hbPre">' + ico('timer') + 'Подобрать на 10–15 минут</button><button class="btn ghost" id="hbClr">Очистить</button></div></section>';
  h += '<section class="card"><b>Срок</b><div class="row" style="margin-top:8px"><input class="inp plain" type="date" id="hbDue" value="' + esc(B.due) + '" min="' + ymd(new Date()) + '" style="max-width:190px" aria-label="срок">' + [['', 'без срока'], [addDaysKey(ymd(new Date()), 3), 'через 3 дня'], [addDaysKey(ymd(new Date()), 7), 'через неделю']].map(([v, t]) => '<button class="btn small' + (B.due === v ? ' primary' : '') + '" data-due="' + v + '">' + t + '</button>').join('') + '</div></section>';
  h += '<section class="card"><b>Пробники</b><div class="row" style="margin-top:8px">' + ['quick', 'p1', 'p2', 'blanc'].map(k => '<button class="btn small' + (has('x', k) ? ' primary' : '') + '" data-x="' + k + '">' + MODES[k].ru + '</button>').join('') + '</div></section>';
  h += '<section class="card theory hwb">' + CHAPTERS.map(c => {
    const ts = TOPICS.filter(t => t.ch === c.id), ps = PROBLEMS.filter(p => p.ch === c.id); if (!ts.length && !ps.length) return '';
    const cnt = ts.filter(t => nOf(t.id)).length + ps.filter(p => has('p', p.id)).length;
    return '<details' + (B.open === c.id ? ' open' : '') + ' data-ch="' + c.id + '"><summary>' + esc(c.ru) + (cnt ? ' <span class="pill b">' + cnt + '</span>' : '') + '</summary>' +
      ts.map(t => { const s = DB.sk[t.id] || {}, n = nOf(t.id); return '<div class="hbrow"><span class="nm"><b>' + esc(t.ru) + '</b><span class="muted">' + (s.m ? (isDue(t.id) ? 'освоена · пора повторить' : 'освоена') : s.a ? 'в работе: ' + s.a + ' ' + plural(s.a, 'ответ', 'ответа', 'ответов') + ', последние ' + [...(s.r || '').slice(-5)].map(x => (x === '1' ? '✓' : '✗')).join('') : 'ещё не начата') + '</span></span><span class="nsel">' + N.map(v => '<button type="button" class="' + (n === v && v ? 'on' : '') + '" data-t="' + t.id + '" data-n="' + v + '"' + (v ? '' : ' aria-label="не задавать"') + '>' + (v || '—') + '</button>').join('') + '</span></div>'; }).join('') +
      (ps.length ? '<div class="chl" style="margin-top:10px">Задачи Partie 2</div>' + ps.map(p => { const s = DB.pb[p.id]; return '<button type="button" class="hbrow pb' + (has('p', p.id) ? ' on' : '') + '" data-p="' + p.id + '"><span class="nm"><b>' + esc(p.ru) + '</b><span class="muted">' + esc(p.src) + (s ? ' · уже решалась: лучший результат ' + Math.round(100 * s.best) + '%' : '') + '</span></span><span class="chk">' + ico('check') + '</span></button>'; }).join('') : '') + '</details>';
  }).join('') + '</section>';
  const items = Object.values(B.items);
  h += '<div class="sticky exfoot"><span class="meta">' + (items.length ? items.length + ' ' + plural(items.length, 'пункт', 'пункта', 'пунктов') + ' · примерно ' + hwMinutes(items) + ' мин' : 'ничего не выбрано') + '</span><button class="btn primary" id="hbGo"' + (items.length ? '' : ' disabled') + '>Задать</button></div>';
  const y = window.scrollY; shell(h); window.scrollTo(0, B.keepY ? y : 0); B.keepY = true;
  const again = () => viewHwNew();
  $$('details[data-ch]').forEach(d => d.addEventListener('toggle', () => { if (d.open) B.open = d.dataset.ch; else if (B.open === d.dataset.ch) B.open = null; }));
  $$('[data-t]').forEach(b => b.onclick = () => { const k = hwKey('t', b.dataset.t), n = +b.dataset.n; if (n) B.items[k] = { k: 't', id: b.dataset.t, n }; else delete B.items[k]; again(); });
  $$('[data-p]').forEach(b => b.onclick = () => { const k = hwKey('p', b.dataset.p); if (B.items[k]) delete B.items[k]; else B.items[k] = { k: 'p', id: b.dataset.p, n: 1 }; again(); });
  $$('[data-x]').forEach(b => b.onclick = () => { const k = hwKey('x', b.dataset.x); if (B.items[k]) delete B.items[k]; else B.items[k] = { k: 'x', id: b.dataset.x, n: 1 }; again(); });
  $$('[data-due]').forEach(b => b.onclick = () => { B.due = b.dataset.due; again(); });
  $('#hbDue').onchange = e => { B.due = e.target.value; again(); };
  $('#hbPre').onclick = () => { B.items = {}; hwPreset().forEach(it => { B.items[hwKey(it.k, it.id)] = it; }); if (!Object.keys(B.items).length) toast('Пока не из чего подбирать — выберите темы вручную'); again(); };
  $('#hbClr').onclick = () => { B.items = {}; again(); };
  $('#hbGo').onclick = () => {
    const list = Object.values(B.items); if (!list.length) return;
    if (list.length > 20) return toast('Не больше 20 пунктов в одном задании');
    const set = () => { hwSet(list, B.due || null); HWB = null; go('#/hw'); setTimeout(() => codeSheet(true), 350); };
    if (hwOpen()) confirmSheet('Заменить текущее задание?', 'У ученика есть незаконченное домашнее задание. Оно уйдёт в историю как есть, новое встанет на его место.', 'Заменить', set, true); else set();
  };
}
ROUTES.push([/^#\/hw$/, () => viewHw()], [/^#\/hw\/new$/, () => viewHwNew()]);
