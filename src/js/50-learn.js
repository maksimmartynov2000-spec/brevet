/* ===================== LEARNING MODEL: mastery, reviews, day goal, streak, warm-up, plan, readiness ===================== */
const TP = id => TOPICS.find(t => t.id === id);
const PB = id => PROBLEMS.find(p => p.id === id);
const CH = id => CHAPTERS.find(c => c.id === id);
const chNum = id => CHAPTERS.findIndex(c => c.id === id) + 1;
const MAIN = () => TOPICS;                                    /* every topic counts for the plan and the readiness */
const skOf = id => DB.sk[id] || { a: 0, c: 0, s: 0, m: 0, t: 0, r: '' };
const isM = id => !!(DB.sk[id] && DB.sk[id].m);
const isWeak = id => { const s = DB.sk[id]; return !!s && /0/.test((s.r || '').slice(-3)) && !/11$/.test(s.r || ''); };
const isDue = id => { const s = DB.sk[id]; return !!s && !!s.m && !!s.due && Date.now() >= s.due; };
const totalTasks = () => dbTasks(DB);
const todayKey = () => ymd(new Date());
const todayN = () => DB.days[todayKey()] || 0;
const dayLog = () => { const k = todayKey(); return DB.log[k] = Object.assign({ n: 0, ok: 0, tr: 0, w: 0 }, DB.log[k]); };

/* A mastered topic comes back with one task after 3, 10 and 30 days (then every 30).
   Right — the next date; wrong — the topic returns to work and needs three right answers in a row again. */
const REV = [3, 10, 30];
/* one answer at the first try. → 'new' (just mastered) | 'kept' (review passed) | 'lost' (review failed) | null.
   o.sec — seconds spent on the task */
function record(id, ok, o) {
  const now = Date.now();
  const s = DB.sk[id] = Object.assign({ a: 0, c: 0, s: 0, m: 0, t: 0, r: '' }, DB.sk[id]);
  const due = !!s.m && !!s.due && now >= s.due;
  s.a++; if (ok) { s.c++; s.s++; } else s.s = 0; s.t = now; s.r = ((s.r || '') + (ok ? '1' : '0')).slice(-8);
  let ev = null;
  if (s.m) {
    if (due && ok) { s.rv = Math.min(7, (s.rv || 0) + 1); s.due = plusDays(now, REV[Math.min(s.rv, REV.length - 1)]); ev = 'kept'; }
    else if (due) { s.m = 0; s.s = 0; s.rv = 0; s.due = 0; ev = 'lost'; }
    else if (!ok) slip(s);
  } else if (s.s >= 3) { s.m = 1; s.md = now; s.rv = 0; s.due = plusDays(now, REV[0]); ev = 'new'; }
  if (o && o.sec > 0) s.tm = Math.max(1, Math.min(510, Math.round(s.tm ? 0.7 * s.tm + 0.3 * o.sec : o.sec)));
  hwNote('t', id, ok);
  dayNote(ok);
  if (ev === 'new') { const t = TP(id); celebrate({ ic: 'check', title: 'Тема освоена', text: (t ? t.ru : '') + ' — три верных ответа подряд. Через 3 дня она вернётся одним заданием на повторение.' }); }
  checkBadges();
  return ev;
}
/* a mistake in a mastered topic outside a review (a mixed set, a mock exam): the topic is asked again in the next warm-up */
function slip(s) { s.rv = Math.max(0, (s.rv || 0) - 1); s.due = Date.now(); }
/* every checked answer of the day: the counters, the readiness of the day, the day goal */
function dayNote(ok) {
  const k = todayKey(); DB.days[k] = (DB.days[k] || 0) + 1;
  const lg = dayLog(); lg.n++; if (ok) lg.ok++;
  DB.rd[k] = ready().p; DB.bs = Math.max(DB.bs || 0, streak());
  trimOld();
  save();
  if (DB.days[k] === GOAL()) celebrate({ ic: 'flame', title: 'Цель дня выполнена!', text: 'Серия: ' + dn(streak()) + ' подряд. Так держать!' });
}
/* more than 400 days of history: the oldest days are kept as one total */
function trimOld() {
  const ks = Object.keys(DB.days).sort(); if (ks.length <= 400) return;
  const cut = ks[ks.length - 400], o = DB.old || { upto: cut, n: 0, days: 0 };
  ks.slice(0, ks.length - 400).forEach(k => { o.n += DB.days[k] || 0; if (DB.days[k]) o.days++; delete DB.days[k]; delete DB.log[k]; delete DB.goalH[k]; });
  if (o.upto < cut) o.upto = cut; DB.old = o;
  const rk = Object.keys(DB.rd).sort(); rk.slice(0, Math.max(0, rk.length - 200)).forEach(k => delete DB.rd[k]);
}

/* ---------- day goal and streak ---------- */
function autoGoal() {
  const left = MAIN().filter(t => !isM(t.id)).length, days = Math.max(7, daysTo(APP.exam) - 14);
  return Math.max(10, Math.min(30, Math.round(left * 6 / days / 5) * 5 || 10));
}
function GOAL() { if (DB.goal) return DB.goal; const k = todayKey(); if (!DB.goalH[k]) DB.goalH[k] = autoGoal(); return DB.goalH[k]; }
const goalFor = k => k === todayKey() ? GOAL() : (DB.goalH[k] || DB.goal || 15);
function streak() {
  let s = 0; const d = today0();
  if ((DB.days[ymd(d)] || 0) < goalFor(ymd(d))) d.setDate(d.getDate() - 1);
  while ((DB.days[ymd(d)] || 0) >= goalFor(ymd(d)) && (DB.days[ymd(d)] || 0) > 0) { s++; d.setDate(d.getDate() - 1); }
  return s;
}
function bestStreak() {
  const ks = Object.keys(DB.days).sort(); let best = 0, cur = 0, prev = null;
  ks.forEach(k => { const ok = DB.days[k] >= goalFor(k); if (ok && prev && addDaysKey(prev, 1) === k && cur) cur++; else cur = ok ? 1 : 0; best = Math.max(best, cur); prev = k; });
  return Math.max(best, DB.bs || 0);
}
/* the last n days: days with work, answers, right at the first try, translations opened, words looked up */
function lastDays(n) {
  const out = { days: 0, n: 0, ok: 0, tr: 0, w: 0 }; const d = today0();
  for (let i = 0; i < n; i++) { const k = ymd(d), c = DB.days[k] || 0, lg = DB.log[k] || {}; if (c) { out.days++; out.n += c; out.ok += Math.min(c, lg.ok || 0); out.tr += lg.tr || 0; out.w += lg.w || 0; } d.setDate(d.getDate() - 1); }
  return out;
}

/* ---------- a task of a topic that needs no calculator (Partie 1, the warm-up) ---------- */
const rnd = () => Math.floor(Math.random() * 1e9);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function noCalcItem(t) {
  for (let k = 0; k < 24; k++) {
    const vi = Math.floor(Math.random() * t.variants), seed = rnd();
    try { if (!t.gen(mkRng(seed), vi).calc) return { tid: t.id, vi, seed }; } catch (e) { /* try other numbers */ }
  }
  return null;
}
const isShort = t => !t.calc && t.ch !== 'lg';              /* can be asked in Partie 1: no calculator, and it is maths, not the language trainer */

/* ---------- the warm-up: five short questions without a calculator, like Partie 1 ----------
   First the topics whose review is due, then the ones with recent mistakes, then the mastered ones not seen for the longest time.
   Only topics the student has already worked on: a warm-up repeats, it does not teach. */
const WU_N = 5;
function warmupPool() {
  const seen = TOPICS.filter(t => isShort(t) && DB.sk[t.id] && (DB.sk[t.id].a || DB.sk[t.id].m));
  const due = seen.filter(t => isDue(t.id)).sort((a, b) => DB.sk[a.id].due - DB.sk[b.id].due);
  const weak = shuffle(seen.filter(t => !isDue(t.id) && isWeak(t.id)));
  const rest = seen.filter(t => !isDue(t.id) && !isWeak(t.id)).sort((a, b) => (DB.sk[a.id].t || 0) - (DB.sk[b.id].t || 0));
  return due.concat(weak, rest);
}
function warmup() {
  const k = todayKey();
  if (DB.wu && DB.wu.day === k) return DB.wu;
  const items = warmupPool().slice(0, WU_N + 3).map(noCalcItem).filter(Boolean).slice(0, WU_N);
  DB.wu = { day: k, items: items.length >= 3 ? items : [], i: 0, ok: 0 };
  return DB.wu;
}
const wuLeft = () => { const w = warmup(); return Math.max(0, w.items.length - w.i); };

/* ---------- plan: topics in order (base first), spread over the days left ---------- */
function planOrder() {
  const rest = MAIN().filter(t => !isM(t.id));
  const out = [];
  [1, 2].forEach(l => {
    const byCh = CHAPTERS.map(c => rest.filter(t => t.lvl === l && t.ch === c.id));
    for (let i = 0; byCh.some(a => a.length > i); i++) byCh.forEach(a => { if (a[i]) out.push(a[i].id); });
  });
  return out;
}
/* today's topics: fixed for the day once chosen. First the reviews the warm-up cannot hold (topics with a calculator),
   then a topic with recent mistakes, then the new ones in order. */
function todayPlan() {
  const k = todayKey();
  if (!DB.plan || DB.plan.day !== k) {
    const per = Math.max(2, Math.round(GOAL() / 6));
    const inWu = new Set(warmup().items.map(x => x.tid));
    const due = MAIN().filter(t => isDue(t.id) && !inWu.has(t.id)).sort((a, b) => DB.sk[a.id].due - DB.sk[b.id].due).map(t => t.id).slice(0, 2);
    const weak = MAIN().filter(t => isM(t.id) && isWeak(t.id) && !due.includes(t.id) && !inWu.has(t.id)).map(t => t.id).slice(0, 1);
    const ids = []; due.concat(weak, planOrder()).forEach(id => { if (!ids.includes(id) && ids.length < per + due.length) ids.push(id); });
    DB.plan = { day: k, ids, rev: due };
    save();
  }
  return DB.plan.ids;
}
const sinceToday = s => !!s && s.t >= today0().getTime();
/* a plan item is done: a review — answered today; a topic — mastered, or three right in a row today */
const doneToday = id => { const s = DB.sk[id]; if (!s) return false; if (DB.plan && (DB.plan.rev || []).includes(id)) return sinceToday(s) && !isDue(id) && (!!s.m || /111$/.test(s.r || '')); return !!s.m || (sinceToday(s) && /111$/.test(s.r || '')); };
function planNext() { const ids = todayPlan(); return ids.find(id => TP(id) && !doneToday(id)) || null; }
function planDone() { return todayPlan().filter(id => doneToday(id)).length; }

/* ---------- readiness for the brevet ---------- */
function ready() {
  const main = MAIN(), m = main.filter(t => isM(t.id)).length;
  const pbs = PROBLEMS.length ? PROBLEMS.reduce((s, p) => s + ((DB.pb[p.id] || {}).best || 0), 0) / PROBLEMS.length : 0;
  const last = DB.exams.filter(e => e.mode === 'blanc' || e.mode === 'p1' || e.mode === 'p2').slice(-1)[0];
  const ex = last && last.max ? last.note / last.max : 0;
  return { p: Math.round(100 * (0.5 * (main.length ? m / main.length : 0) + 0.25 * pbs + 0.25 * ex)), m, n: main.length, pb: Math.round(100 * pbs), ex: last ? Math.round(100 * ex) : null };
}
/* how the readiness changed over n days: null when there is nothing to compare with */
function readyDelta(n) {
  const now = ready().p, lim = addDaysKey(todayKey(), -n);
  const k = Object.keys(DB.rd || {}).filter(x => x <= lim).sort().pop();
  return k == null ? null : now - DB.rd[k];
}
function chProgress(ch) { const ts = MAIN().filter(t => t.ch === ch); return [ts.filter(t => isM(t.id)).length, ts.length]; }

/* ---------- badges (the ids and their order are fixed in BADGE_IDS, 32-code.js) ---------- */
function badgeList() {
  const tt = totalTasks(), bs = Math.max(bestStreak(), streak());
  const blancs = DB.exams.filter(e => e.mode === 'blanc'), best = Math.max(0, ...blancs.map(e => e.note));
  const pbDone = Object.values(DB.pb).filter(x => x.best >= 0.6).length;
  const chDone = CHAPTERS.filter(c => { const [a, b] = chProgress(c.id); return b && a === b; }).length;
  const mainLeft = MAIN().filter(t => !isM(t.id)).length;
  const hwDone = (DB.hwh || []).filter(h => h.doneAt).length + (DB.hw && DB.hw.doneAt && !(DB.hwh || []).some(h => h.id === DB.hw.id) ? 1 : 0);
  const words = Object.values(DB.vc || {}).filter(v => v.s >= 3).length;
  const revs = Object.values(DB.sk).reduce((s, x) => s + (x.rv || 0), 0);
  return [
    { id: 'first', ic: 'check', t: 'Первый шаг', d: 'Первый ответ', v: Math.min(tt, 1), n: 1 },
    { id: 't100', ic: 'target', t: 'Сотня', d: '100 заданий', v: tt, n: 100 },
    { id: 't500', ic: 'target', t: 'Пятьсот', d: '500 заданий', v: tt, n: 500 },
    { id: 't1500', ic: 'target', t: 'Марафон', d: '1500 заданий', v: tt, n: 1500 },
    { id: 's3', ic: 'flame', t: 'Три дня', d: 'Цель дня 3 дня подряд', v: bs, n: 3 },
    { id: 's7', ic: 'flame', t: 'Неделя', d: 'Цель дня 7 дней подряд', v: bs, n: 7 },
    { id: 's30', ic: 'flame', t: 'Месяц', d: 'Цель дня 30 дней подряд', v: bs, n: 30 },
    { id: 'diag', ic: 'list', t: 'Старт', d: 'Стартовая проверка', v: DB.diag ? 1 : 0, n: 1 },
    { id: 'ch', ic: 'books', t: 'Глава', d: 'Освоена целая глава', v: chDone, n: 1 },
    { id: 'pb10', ic: 'pen', t: 'Решатель', d: '10 задач Partie 2', v: pbDone, n: 10 },
    { id: 'blanc', ic: 'exam', t: 'Brevet blanc', d: 'Первый полный пробник', v: blancs.length, n: 1 },
    { id: 'b14', ic: 'trophy', t: 'Уверенно', d: 'Brevet blanc на 14+', v: best >= 14 ? 1 : 0, n: 1 },
    { id: 'b17', ic: 'trophy', t: 'Très bien', d: 'Brevet blanc на 17+', v: best >= 17 ? 1 : 0, n: 1 },
    { id: 'all', ic: 'star', t: 'Всё освоено', d: 'Все темы бревета', v: mainLeft === 0 && MAIN().length ? 1 : 0, n: 1 },
    { id: 'hw5', ic: 'book', t: 'Домашние', d: '5 домашних заданий', v: hwDone, n: 5 },
    { id: 'w20', ic: 'dico', t: 'Слова', d: '20 слов выучено', v: words, n: 20 },
    { id: 'rev30', ic: 'redo', t: 'Память', d: '30 повторений без ошибок', v: revs, n: 30 }
  ];
}
function checkBadges() {
  let got = false;
  badgeList().forEach(b => { if (b.v >= b.n && !DB.badges[b.id]) { DB.badges[b.id] = Date.now(); got = true; if (b.id !== 'first') celebrate({ ic: b.ic, title: 'Новый значок: ' + b.t, text: b.d }); } });
  if (got) save();
}

/* ===================== PRACTICE: one topic, endless questions =====================
   mode: a topic id — that topic; 'plan' — the plan of the day; 'wu' — the warm-up (a fixed set of questions);
         'hw' — the topics of the homework; 'err' — topics with recent mistakes; 'mix:<chapter>' — a chapter mixed */
let P = null;                /* { mode, id, it, vi, seed, vals, tries, hint, sol, done, ok, fb, n, tr, due, t0, away, sec } */
const VROT = {};
function pickVi(t) { const k = VROT[t.id] = ((VROT[t.id] == null ? Math.floor(Math.random() * t.variants) : VROT[t.id] + 1)) % t.variants; return k; }
function makeItem(t) {
  const vi = pickVi(t), seed = rnd();
  let it; try { it = t.gen(mkRng(seed), vi); } catch (e) { console.error(t.id, e); it = null; }
  return { it, vi, seed };
}
const SETS = ['plan', 'err', 'hw', 'wu'];
const isSet = mode => SETS.includes(mode) || mode.startsWith('mix:');
/* which topic a practice mode serves next (null — the set is finished) */
function nextTopicFor(mode, cur) {
  if (mode === 'plan') return planNext();
  if (mode === 'hw') { const it = hwNextTopic(); return it ? it.id : null; }
  if (mode.startsWith('mix:')) {
    const ch = mode.slice(4); const ts = TOPICS.filter(t => t.ch === ch);
    const pool = ts.filter(t => !isM(t.id)); const src = pool.length && Math.random() < 0.7 ? pool : ts;
    return (src[Math.floor(Math.random() * src.length)] || {}).id;
  }
  if (mode === 'err') { const ws = TOPICS.filter(t => isWeak(t.id)); return ws.length ? ws[Math.floor(Math.random() * ws.length)].id : null; }
  return cur;
}
function viewPractice(mode) {
  if (mode === 'wu') { const w = warmup(); if (w.i >= w.items.length) return viewWarmupDone(); P = { mode, id: w.items[w.i].tid, n: 0 }; return newQuestion(); }
  const id = isSet(mode) ? nextTopicFor(mode, null) : mode;
  const t = TP(id);
  if (!t) {
    if (mode === 'err') return shell('<section class="card"><h3>Ошибок нет</h3><p class="muted">Сейчас нет тем, где последние ответы были с ошибками. Отличная работа!</p><a class="btn primary" href="#/">На главную</a></section>'), chrome({ title: 'Работа над ошибками', back: '#/' });
    if (mode === 'plan') return viewSetDone('plan');
    if (mode === 'hw') return go('#/hw');
    return go('#/prog');
  }
  P = { mode, id, n: 0 }; newQuestion();
}
function newQuestion(keepTopic) {
  let fixed = null;
  if (P.mode === 'wu') { const w = warmup(); if (w.i >= w.items.length) return viewWarmupDone(); fixed = w.items[w.i]; P.id = fixed.tid; }
  else if (!keepTopic && P.mode !== P.id) {
    const nx = nextTopicFor(P.mode, P.id);
    if (!nx) return viewSetDone(P.mode);
    if (nx !== P.id) { P.switched = TP(P.id) && P.n ? P.id : null; P.id = nx; }
  }
  const t = TP(P.id); let it, vi, seed;
  if (fixed) { vi = fixed.vi % t.variants; seed = fixed.seed; try { it = t.gen(mkRng(seed), vi); } catch (e) { console.error(t.id, e); it = null; } }
  else ({ it, vi, seed } = makeItem(t));
  startItem(it, vi, seed);
}
/* a task on screen, from zero: nothing typed, no hints, French text, the stopwatch at 0:00 */
function startItem(it, vi, seed) {
  Object.assign(P, { it, vi, seed, vals: {}, tries: 0, hint: 0, sol: false, step: 1, done: false, ok: null, fb: null, rec: false, tr: false, trc: false, tip: null, due: isDue(P.id), t0: Date.now(), away: 0, hid: 0, sec: 0, marks: [] });
  renderPractice(true);
}
/* a set of questions is over: the plan of the day or the homework topics */
function viewSetDone(mode) {
  P = null; swStop();
  if (mode === 'hw') return go('#/hw');
  if (mode !== 'plan') return go('#/');
  chrome({ title: 'План на сегодня', back: '#/', tab: 0 });
  const n = todayN(), G = GOAL(), more = planOrder().filter(id => !todayPlan().includes(id)).length;
  shell('<section class="nextbox hot"><b class="t">' + ico('check') + ' План на сегодня выполнен</b><span class="muted">' + (n >= G ? 'И цель дня тоже: ' + n + ' из ' + G + '.' : 'До цели дня осталось ' + (G - n) + ' — можно добрать задачей Partie 2 или следующей темой.') + '</span><div class="row">' +
    (more ? '<button class="btn primary" id="bMore">' + ico('play') + 'Ещё тема по плану</button>' : '') + '<a class="btn' + (more ? '' : ' primary') + '" href="#/prog">Задачи Partie 2</a><a class="btn ghost" href="#/">На главную</a></div></section>');
  if ($('#bMore')) $('#bMore').onclick = () => { const add = planOrder().filter(id => !DB.plan.ids.includes(id)).slice(0, 2); DB.plan.ids.push(...add); save(); go('#/t/plan'); route(); };
}
function viewWarmupDone() {
  P = null; swStop();
  const w = warmup(); chrome({ title: 'Разминка', back: '#/', tab: 0 });
  if (!w.items.length) return go('#/');
  const next = hwOpen() && hwNextStep() ? ['Домашнее задание', hwNextStep()] : planNext() ? ['Дальше по плану', '#/t/plan'] : null;
  const due = vcDue().length;
  shell('<section class="nextbox hot"><b class="t">' + ico('check') + ' Разминка: ' + w.ok + ' из ' + w.items.length + '</b><span class="muted">' + (w.ok === w.items.length ? 'Всё верно с первой попытки. Так и будет в Partie 1: коротко и без калькулятора.' : 'Темы с ошибками вернутся в следующих разминках — так они не забудутся к экзамену.') + '</span><div class="row">' +
    (next ? '<a class="btn primary" href="' + next[1] + '">' + ico('play') + next[0] + '</a>' : '') + (due ? '<a class="btn" href="#/mots/rev">' + ico('dico') + 'Слова на повторение: ' + due + '</a>' : '') + '<a class="btn ghost" href="#/">На главную</a></div></section>');
}
const SET_TITLE = { plan: 'План на сегодня', err: 'Работа над ошибками', wu: 'Разминка', hw: 'Домашнее задание' };
function practiceTitle() { return SET_TITLE[P.mode] || (P.mode.startsWith('mix:') ? 'Вперемешку' : 'Тренировка'); }
const practiceBack = t => (P.mode === 'hw' ? '#/hw' : SETS.includes(P.mode) ? '#/' : '#/ch/' + t.ch);

/* ---------- the stopwatch of a task: quiet, counts only while the page is on screen ---------- */
let SW = 0;
function swStop() { clearInterval(SW); SW = 0; }
const swSec = () => (P ? Math.max(0, Math.round((Date.now() - P.t0 - P.away) / 1000)) : 0);
const SLOW = 120;            /* Partie 1 gives 20 minutes for 9 questions: about two minutes each */
function swChip() {
  const sec = P.done || P.rec ? P.sec : swSec(), slow = !P.it.calc && sec > SLOW;
  return '<span class="chip tmc' + (slow ? ' slow' : '') + '" id="swc">' + ico('timer') + '<span>' + mmss(sec) + (slow ? ' · дольше 2 минут' : '') + '</span></span>';
}
function swStart() {
  swStop();
  SW = setInterval(() => { const el = $('#swc'); if (!P || !el || P.done || P.rec) return swStop(); if (document.visibilityState === 'visible') el.outerHTML = swChip(); }, 1000);
}
document.addEventListener('visibilitychange', () => { if (!P || P.done) return; if (document.visibilityState === 'hidden') P.hid = Date.now(); else if (P.hid) { P.away += Date.now() - P.hid; P.hid = 0; } });

function renderPractice(fresh) {
  const t = TP(P.id), it = P.it, s = skOf(P.id);
  chrome({ title: practiceTitle(), back: practiceBack(t), tab: -1, tr: true, trOn: P.tr, words: true, kb: true, onTr: on => { P.tr = on; if (on && !P.trc) { P.trc = true; dayLog().tr++; tipOff('tr'); saveSoon(); } } });
  if (!it) { shell('<section class="card"><p>Не получилось составить задание. Попробуй ещё раз.</p><button class="btn primary" onclick="newQuestion(true)">Новое задание</button></section>'); return; }
  const fs = fieldsOf(it.ans);
  fs.forEach((f, i) => { FIELD_VARS['f' + i] = varsFor(it); });
  let h = '<section class="card q" id="qcard">';
  h += '<div class="qtop"><div class="qname"><b>' + esc(t.ru) + '</b><span class="frn" lang="fr">' + esc(t.fr) + '</span></div>' + dotsHtml(s) + '</div>';
  h += '<div class="chips">' + (it.calc ? '<span class="chip">' + ico('calc') + 'с калькулятором</span>' : '<span class="chip warn">' + ico('nocalc') + 'без калькулятора</span>') + lvlChip(t.lvl) +
    (P.mode === 'wu' ? '<span class="chip">вопрос ' + Math.min(DB.wu.items.length, DB.wu.i + (P.done ? 0 : 1)) + ' из ' + DB.wu.items.length + '</span>' : '') +
    (P.due ? '<span class="chip ok">' + ico('redo') + 'повторение</span>' : '') + (P.switched ? '<span class="chip ok">' + ico('check') + 'следующая тема</span>' : '') + swChip() + '</div>';
  /* the hint about tapping words — only where the statement is French (in «Язык бревета» the question itself may be in Russian) */
  if (it.q && typeof it.q === 'object' && it.q.fr !== it.q.ru) h += tipHtml('tr', 'Условие по-французски, как на экзамене. Незнакомое слово — нажми на него, появится перевод. Весь текст по-русски — кнопка «Перевод» вверху.');
  h += qHtml(it);
  h += '<div class="ansbox' + (fs.length > 1 ? ' multi' : '') + '">' + fs.map((f, i) => '<div class="part' + partCls(i) + '">' + fieldHtml(f, 'f' + i, P.vals['f' + i], fieldState(i)) + '</div>').join('') + '</div>';
  h += '<div id="fb">' + fbHtml() + '</div>';
  h += '<div class="row qbtns">' + practiceButtons(t) + '</div>';
  if (P.hint) h += '<div class="hints">' + t.hints.slice(0, P.hint).map((x, i) => '<div class="hint"><b>Подсказка ' + (i + 1) + '.</b> ' + rt(x) + '</div>').join('') + '</div>';
  if (P.sol) h += '<div class="solbox"><h3>Решение</h3><div class="ansline">Ответ: ' + answerHtml(it.ans) + '</div>' + solHtml(it, LESSON ? P.step : null) + '</div>';
  if (P.done || P.tries) h += '<button type="button" class="linkbtn" id="bReport">Нашёл ошибку в задании? Сообщить</button>';
  h += '</section>';
  h += nextBox(t);
  if (fresh) shell(h); else { const y = window.scrollY; $('#app').innerHTML = h; window.scrollTo(0, y); }
  if (!$('#app .bi')) $('#tTr').hidden = true;            /* nothing to translate on this screen */
  ON_INPUT = () => { if (P.fb && !P.done) { P.fb = null; $('#fb').innerHTML = ''; } };
  ON_ENTER = () => { if (!P.done) checkPractice(); else newQuestion(); };
  window.KB_GO = 'Проверить';
  wireFields($('#app'), P.vals, P.done);
  if (P.done) hideKb(); else if (fresh) { swStart(); focusFirst(); }
  const b = id => $('#' + id);
  if (b('bCheck')) b('bCheck').onclick = checkPractice;
  if (b('bHint')) b('bHint').onclick = () => { P.hint++; renderPractice(); };
  if (b('bSol')) b('bSol').onclick = showSolution;
  if (b('bNext')) b('bNext').onclick = () => newQuestion();
  if (b('bSame')) b('bSame').onclick = () => newQuestion(true);
  if (b('bStep')) b('bStep').onclick = () => { P.step++; renderPractice(); };
  if (b('bReport')) b('bReport').onclick = () => reportIssue('Тема ' + t.id + ' («' + t.ru + '»), тип ' + P.vi + ', номер ' + P.seed, it, Object.keys(P.vals).sort().map(k => P.vals[k]));
  P.switched = null;
}
const lvlChip = l => (l === 1 || l === 2 ? '<span class="chip lvl' + l + '">' + ['', 'база', 'бревет'][l] + '</span>' : '');
function dotsHtml(s) { const r = (s.r || '').slice(-3).padStart(3, '-'); return '<div class="dots" title="три верных подряд — тема освоена">' + [...r].map(c => '<i class="' + (c === '1' ? 'on' : c === '0' ? 'x' : '') + '"></i>').join('') + (s.m ? '<b>' + ico('check') + '</b>' : '') + '</div>'; }
const partCls = i => P.marks && P.marks[i] ? ' ' + P.marks[i] : '';
const fieldState = i => ({ mark: P.marks && P.marks[i], reveal: P.done && P.ok === false, lock: P.done });
function fbHtml() {
  if (!P.fb) return '';
  const f = P.fb; return '<div class="fb pop ' + f.cls + '" role="status"><b class="t">' + f.t + '</b>' + (f.m ? '<span>' + f.m + '</span>' : '') + '</div>';
}
function practiceButtons(t) {
  if (P.done) return '<button class="btn primary big" id="bNext">' + ico('play') + 'Дальше</button>' + (P.sol ? '' : '<button class="btn" id="bSol">' + ico('eye') + 'Решение</button>');
  return '<button class="btn primary big" id="bCheck">' + ico('check') + 'Проверить</button>' +
    (P.hint < t.hints.length ? '<button class="btn" id="bHint">' + ico('bulb') + 'Подсказка ' + (P.hint + 1) + '/' + t.hints.length + '</button>' : '') +
    '<button class="btn ghost" id="bSol">Решение</button>';
}
/* the first answer to a task is the one that counts: for the topic, for the day, for the warm-up and the homework */
function recordFirst(ok) {
  if (P.rec) return; P.rec = true; P.n++; P.sec = swSec(); swStop();
  const answered = ok != null;                       /* null — the solution was opened without an answer: no time is kept */
  P.ev = record(P.id, !!ok, answered ? { sec: P.sec } : null);
  if (P.mode === 'wu') { const w = warmup(); w.i++; if (ok) w.ok++; save(); }
}
const revText = id => { const s = skOf(id); return s.due ? 'следующее — через ' + dn(Math.max(1, Math.round((s.due - today0().getTime()) / 864e5))) : ''; };
function checkPractice() {
  if (!P || P.done) return;
  const fs = fieldsOf(P.it.ans); let allOk = true, empty = false, msg = null, near = false, syntax = false;
  P.marks = [];
  fs.forEach((f, i) => {
    const g = gradeField(f.spec, P.vals['f' + i]);
    if (g.empty) { empty = g.msg && g.msg.ru && f.spec.k === 'order' ? g.msg.ru : empty || true; return; }
    if (g.syntax) syntax = true;
    if (!g.ok) { allOk = false; if (g.near) near = true; if (!msg && g.msg) msg = g.msg.ru; }
    P.marks[i] = g.ok ? 'ok' : 'bad';
  });
  if (empty) { P.fb = { cls: 'info', t: typeof empty === 'string' ? empty : fs.length > 1 ? 'Заполни все поля' : 'Сначала ответь', m: '' }; P.marks = []; renderPractice(); return; }
  if (syntax && !allOk) { P.fb = { cls: 'near', t: 'Не получается прочитать ответ', m: msg || '' }; renderPractice(); return; }   /* a typo is not an attempt */
  P.tries++;
  const first = P.tries === 1;
  if (first) recordFirst(allOk);
  if (allOk) {
    P.done = true; P.ok = true; vib(25);
    P.fb = { cls: 'ok', t: first ? 'Верно!' : 'Теперь верно', m: first ? (P.ev === 'kept' ? 'Повторение пройдено: ' + revText(P.id) + '.' : '') : 'Засчитывается как ошибка с первой попытки — но разобраться важнее.' };
  } else {
    vib([40, 60, 40]);
    P.fb = { cls: near ? 'near' : 'bad', t: near ? 'Почти' : 'Пока неверно', m: (msg || '') + (P.tries >= 2 ? ' Посмотри подсказку или решение — и попробуй следующее задание.' : ' Исправь ответ и проверь ещё раз.') + (first && P.ev === 'lost' ? ' Тема возвращается в работу: нужны снова три верных ответа подряд.' : '') };
  }
  renderPractice();
  if (!allOk) { const c = $('#qcard'); if (c) { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); } }
}
function showSolution() {
  if (!P.done) recordFirst(null);
  P.sol = true; if (!P.done) { P.done = true; P.ok = false; P.fb = { cls: 'info', t: 'Разбор', m: 'Прочитай решение, а потом реши похожее задание сам — так тема запомнится.' }; }
  renderPractice();
  const sb = $('.solbox'); if (sb) sb.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function nextBox(t) {
  const s = skOf(t.id);
  if (!P.done) return '';
  if (s.m && P.mode === t.id) {
    const nx = planNext(); const nt = nx && nx !== t.id ? TP(nx) : null;
    return '<section class="nextbox hot"><b class="t">' + ico('check') + ' Тема освоена</b><span class="muted">Можно закрепить ещё парой заданий или идти дальше. ' + (s.due ? 'Повторение: ' + revText(t.id) + '.' : '') + '</span><div class="row">' + (nt ? '<a class="btn primary" href="#/t/plan">Дальше по плану: ' + esc(nt.ru) + '</a>' : '<a class="btn primary" href="#/ch/' + t.ch + '">К главе</a>') + '</div></section>';
  }
  return '';
}
/* one-time hints: shown until the student has used the thing they describe (or has seen the hint on five tasks).
   On the task where it appeared a hint stays to the end, so nothing jumps when the student presses «Перевод» or «Проверить». */
function tipHtml(k, text) {
  if (DB.tips[k] && !(P && P.tip === k)) return '';
  if (P && P.tip !== k) { P.tip = k; DB.tips[k + 'N'] = (DB.tips[k + 'N'] || 0) + 1; if (DB.tips[k + 'N'] >= 5) DB.tips[k] = 1; }
  return '<div class="newtip" data-tip="' + k + '">' + ico('bulb') + '<span>' + text + '</span></div>';
}
function tipOff(k) { if (!DB || DB.tips[k]) return; DB.tips[k] = 1; saveSoon(); }
/* on a computer the cursor goes straight into the answer field */
function focusFirst() { if (window.matchMedia && matchMedia('(pointer: coarse)').matches) return; const i = $('#app input.inp:not([readonly])'); if (i) i.focus({ preventScroll: true }); }

/* ===================== PROBLEM (Partie 2): a context and several questions ===================== */
let Q2 = null;               /* { id, seed, p, tr, st: [{ vals, tries, done, ok, fb, sol, step, rec }] } */
function viewProblem(id, seed) {
  const pb = PB(id); if (!pb) return go('#/prog');
  seed = seed || Math.floor(Math.random() * 1e9);
  let p; try { p = pb.gen(mkRng(seed)); } catch (e) { console.error(id, e); return shell('<section class="card"><p>Не получилось составить задачу.</p></section>'); }
  P = null; swStop();
  Q2 = { id, seed, p, tr: false, trc: false, st: p.qs.map(() => ({ vals: {}, tries: 0, done: false, ok: null, fb: null, sol: false, step: 1, rec: false })) };
  renderProblem(true);
}
function renderProblem(fresh) {
  const pb = PB(Q2.id), p = Q2.p;
  const inHw = hwOpen() && DB.hw.items.some(it => it.k === 'p' && it.id === Q2.id);
  chrome({ title: 'Задача Partie 2', back: inHw ? '#/hw' : '#/ch/' + pb.ch, tr: true, trOn: Q2.tr, words: true, kb: true, onTr: on => { Q2.tr = on; if (on && !Q2.trc) { Q2.trc = true; dayLog().tr++; tipOff('tr'); saveSoon(); } } });
  let h = '<section class="card pbhead"><div class="qname"><b>' + esc(pb.ru) + '</b><span class="frn" lang="fr">' + esc(pb.fr) + '</span></div><div class="chips"><span class="chip">' + ico('calc') + 'с калькулятором</span><span class="chip">' + pb.pts + ' ' + plural(pb.pts, 'балл', 'балла', 'баллов') + '</span><span class="chip src">по мотивам: ' + esc(pb.src) + '</span></div>';
  if (p.ctx) h += '<div class="pctx instr">' + bt(p.ctx) + '</div>';
  if (p.fig) h += '<div class="figw">' + p.fig + '</div>';
  h += '</section>';
  p.qs.forEach((q, qi) => {
    const S = Q2.st[qi]; const fs = fieldsOf(q.ans);
    fs.forEach((f, i) => { FIELD_VARS['q' + qi + 'f' + i] = varsFor(q); });
    h += '<section class="card q pq" id="pq' + qi + '">' + (q.red ? '<div class="chips"><span class="chip red">' + ico('pen') + 'рассуждение</span></div>' : '') + qHtml(q, qi + 1);
    h += '<div class="ansbox' + (fs.length > 1 ? ' multi' : '') + '">' + fs.map((f, i) => '<div class="part' + (S.marks && S.marks[i] ? ' ' + S.marks[i] : '') + '">' + fieldHtml(f, 'q' + qi + 'f' + i, S.vals['q' + qi + 'f' + i], { mark: S.marks && S.marks[i], reveal: S.done && S.ok === false, lock: S.done }) + '</div>').join('') + '</div>';
    if (S.fb) h += '<div class="fb pop ' + S.fb.cls + '"><b class="t">' + S.fb.t + '</b>' + (S.fb.m ? '<span>' + S.fb.m + '</span>' : '') + '</div>';
    h += '<div class="row">' + (S.done ? '' : '<button class="btn primary" data-chk="' + qi + '">' + ico('check') + 'Проверить</button>') + (S.sol ? '' : '<button class="btn ghost" data-sol="' + qi + '">Решение</button>') + '</div>';
    if (S.sol) h += '<div class="solbox"><div class="ansline">Ответ: ' + answerHtml(q.ans) + '</div>' + solHtml(q, LESSON ? S.step : null, qi) + '</div>';
    if (S.done || S.tries) h += '<button type="button" class="linkbtn" data-rep="' + qi + '">Нашёл ошибку в задании? Сообщить</button>';
    h += '</section>';
  });
  const done = Q2.st.filter(s => s.done).length;
  if (done === p.qs.length) {
    const ok = Q2.st.filter(s => s.first).length;
    const nxt = hwOpen() ? hwNextStep() : null;
    h += '<section class="nextbox hot"><b class="t">Задача решена: ' + ok + ' из ' + p.qs.length + ' с первой попытки</b><div class="row">' + (nxt || (DB.hw && DB.hw.doneAt && inHwDone(Q2.id)) ? '<a class="btn primary" href="' + (nxt || '#/hw') + '">' + ico('play') + 'Домашнее задание</a>' : '') + '<button class="btn' + (nxt ? '' : ' primary') + '" id="bAgain">' + ico('redo') + 'Тот же сюжет, другие числа</button><a class="btn" href="#/ch/' + pb.ch + '">К главе</a></div></section>';
  }
  if (fresh) shell(h); else { const y = window.scrollY; $('#app').innerHTML = h; window.scrollTo(0, y); }
  if (fresh) focusFirst();
  const all = {}; Q2.st.forEach(S => Object.assign(all, S.vals));
  ON_INPUT = id => { const qi = +/^q(\d+)/.exec(id)[1]; const S = Q2.st[qi]; S.vals[id] = all[id]; if (S.fb && !S.done) { S.fb = null; const c = $('#pq' + qi + ' .fb'); if (c) c.remove(); } };
  ON_ENTER = () => { const qi = ACTIVE ? +/^q(\d+)/.exec(ACTIVE.dataset.field)[1] : -1; if (qi >= 0) checkProblemQ(qi); };
  window.KB_GO = 'Проверить';
  wireFields($('#app'), all, false);
  $$('[data-chk]').forEach(b => b.onclick = () => checkProblemQ(+b.dataset.chk));
  $$('[data-sol]').forEach(b => b.onclick = () => { const S = Q2.st[+b.dataset.sol]; S.sol = true; if (!S.done) { S.done = true; S.ok = false; S.first = false; } finishProblemIfDone(); renderProblem(); });
  if ($('#bAgain')) $('#bAgain').onclick = () => viewProblem(Q2.id);
  $$('[data-stepq]').forEach(b => b.onclick = () => { Q2.st[+b.dataset.stepq].step++; renderProblem(); });
  $$('[data-rep]').forEach(b => b.onclick = () => { const qi = +b.dataset.rep, S = Q2.st[qi]; reportIssue('Задача ' + Q2.id + ' («' + pb.ru + '»), номер ' + Q2.seed + ', вопрос ' + (qi + 1), p.qs[qi], Object.keys(S.vals).sort().map(k => S.vals[k])); });
}
/* «Нашёл ошибку в задании?» — everything needed to find exactly this question again (topic, type, number) */
function reportIssue(where, it, vals) {
  const plain = x => String(x == null ? '' : x).replace(/\$\$?([^$]*)\$\$?/g, '$1');
  const key = fieldsOf(it.ans).map(f => f.spec.k === 'mcq' ? plain(f.spec.opts[f.spec.c].fr) : f.spec.k === 'order' ? 'порядок шагов' : keyInput(f.spec)).join(' | ');
  const text = 'Brevet · ошибка в задании\n' + where + '\nУсловие: ' + plain(it.q.fr) + (it.m ? ' ' + it.m : '') + '\nОтвет ученика: ' + (vals.filter(v => v !== '' && v != null).join(' | ') || '—') + '\nОтвет приложения: ' + key + '\nВерсия ' + (BUILD || 'dev');
  const sh = openSheet('<h3>Сообщить об ошибке</h3><p class="muted">Отправь это ' + esc(APP.tutorTo) + ' и коротко напиши, что не так. По номеру задание найдётся и исправится.</p><textarea class="inp plain code" rows="5" readonly aria-label="описание задания">' + esc(text) + '</textarea><div class="row">' + (navigator.share ? '<button class="btn primary" id="rpShare">' + ico('share') + 'Отправить</button>' : '') + '<button class="btn' + (navigator.share ? '' : ' primary') + '" id="rpCopy">Скопировать</button></div>');
  $('#rpCopy', sh).onclick = () => { copyText(text); closeSheet(); };
  if ($('#rpShare', sh)) $('#rpShare', sh).onclick = () => navigator.share({ text }).then(closeSheet).catch(() => { /* closed */ });
}
function checkProblemQ(qi) {
  const S = Q2.st[qi], q = Q2.p.qs[qi]; if (S.done) return;
  const fs = fieldsOf(q.ans); let allOk = true, empty = false, msg = null, near = false, syntax = false; S.marks = [];
  fs.forEach((f, i) => { const g = gradeField(f.spec, S.vals['q' + qi + 'f' + i]); if (g.empty) { empty = f.spec.k === 'order' && g.msg ? g.msg.ru : empty || true; return; } if (g.syntax) syntax = true; if (!g.ok) { allOk = false; if (g.near) near = true; if (!msg && g.msg) msg = g.msg.ru; } S.marks[i] = g.ok ? 'ok' : 'bad'; });
  if (empty) { S.fb = { cls: 'info', t: typeof empty === 'string' ? empty : 'Сначала ответь', m: '' }; S.marks = []; return renderProblem(); }
  if (syntax && !allOk) { S.fb = { cls: 'near', t: 'Не получается прочитать ответ', m: msg || '' }; return renderProblem(); }
  S.tries++;
  if (allOk) { S.done = true; S.ok = true; S.first = S.tries === 1; S.fb = { cls: 'ok', t: S.tries === 1 ? 'Верно!' : 'Теперь верно', m: '' }; vib(25); }
  else { vib([40, 60, 40]); S.fb = { cls: near ? 'near' : 'bad', t: near ? 'Почти' : 'Пока неверно', m: (msg || '') + (S.tries >= 2 ? ' Открой решение этого вопроса.' : ' Исправь и проверь ещё раз.') }; }
  if (S.tries === 1 && !S.rec) { S.rec = true; dayNote(allOk); }
  finishProblemIfDone();
  renderProblem();
}
function finishProblemIfDone() {
  if (!Q2.st.every(s => s.done) || Q2.saved) return;
  Q2.saved = true; const f = Q2.st.filter(s => s.first).length / Q2.st.length;
  const x = DB.pb[Q2.id] = Object.assign({ n: 0, best: 0, last: 0, t: 0 }, DB.pb[Q2.id]); x.n++; x.best = Math.max(x.best, f); x.last = f; x.t = Date.now();
  hwNote('p', Q2.id, f >= 0.6);
  DB.rd[todayKey()] = ready().p; save(); checkBadges();
}
