/* ===================== LEARNING MODEL: mastery, day goal, streak, plan, readiness ===================== */
const TP = id => TOPICS.find(t => t.id === id);
const PB = id => PROBLEMS.find(p => p.id === id);
const CH = id => CHAPTERS.find(c => c.id === id);
const chNum = id => CHAPTERS.findIndex(c => c.id === id) + 1;
const MAIN = () => TOPICS.filter(t => t.lvl <= 2);            /* lvl 3 «сверх» never holds back the plan or the readiness */
const skOf = id => DB.sk[id] || { a: 0, c: 0, s: 0, m: 0, t: 0, r: '' };
const isM = id => !!(DB.sk[id] && DB.sk[id].m);
const isWeak = id => { const s = DB.sk[id]; return !!s && /0/.test((s.r || '').slice(-3)) && !/11$/.test(s.r || ''); };
const totalTasks = () => Object.values(DB.days).reduce((a, b) => a + b, 0);
const todayKey = () => ymd(new Date());
const todayN = () => DB.days[todayKey()] || 0;

/* one answer at the first try: 3 right in a row → the topic is mastered; a mistake resets the run, not the mastery */
function record(id, ok, kind) {
  const s = DB.sk[id] = Object.assign({ a: 0, c: 0, s: 0, m: 0, t: 0, r: '' }, DB.sk[id]);
  s.a++; if (ok) { s.c++; s.s++; } else s.s = 0; s.t = Date.now(); s.r = ((s.r || '') + (ok ? '1' : '0')).slice(-8);
  let newly = false; if (!s.m && s.s >= 3) { s.m = 1; newly = true; }
  const k = todayKey(); DB.days[k] = (DB.days[k] || 0) + 1;
  const lg = DB.log[k] = DB.log[k] || { n: 0, ok: 0 }; lg.n++; if (ok) lg.ok++;
  trimOld();
  save();
  if (DB.days[k] === GOAL()) celebrate({ ic: 'flame', title: 'Цель дня выполнена!', text: 'Серия: ' + dn(streak()) + ' подряд. Так держать!' });
  if (newly) { const t = TP(id); celebrate({ ic: 'check', title: 'Тема освоена', text: (t ? t.ru : '') + ' — три верных ответа подряд.' }); }
  checkBadges();
  return newly;
}
function trimOld() { ['days', 'log', 'goalH'].forEach(f => { const ks = Object.keys(DB[f]).sort(); ks.slice(0, Math.max(0, ks.length - 400)).forEach(k => delete DB[f][k]); }); }

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
  ks.forEach(k => { const ok = DB.days[k] >= goalFor(k); if (ok && prev && (parseYmd(k) - parseYmd(prev)) / 864e5 === 1 && cur) cur++; else cur = ok ? 1 : 0; if (!ok) cur = 0; best = Math.max(best, cur); prev = k; });
  return best;
}

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
/* today's topics: fixed for the day once chosen; weak topics come back first */
function todayPlan() {
  const k = todayKey();
  if (!DB.plan || DB.plan.day !== k) {
    const per = Math.max(2, Math.round(GOAL() / 6));
    const weak = MAIN().filter(t => isM(t.id) && isWeak(t.id)).map(t => t.id).slice(0, 1);
    DB.plan = { day: k, ids: weak.concat(planOrder()).slice(0, per) };
    if (!DB.plan.ids.length) DB.plan.ids = TOPICS.filter(t => t.lvl === 3 && !isM(t.id)).slice(0, per).map(t => t.id);
    save();
  }
  return DB.plan.ids;
}
const doneToday = id => { const s = DB.sk[id]; return !!s && ((s.m && s.t >= today0().getTime()) || (s.t >= today0().getTime() && (s.r || '').length >= 6 && /111$/.test(s.r))); };
function planNext() { const ids = todayPlan(); return ids.find(id => !isM(id) && TP(id)) || ids.find(id => !doneToday(id) && TP(id)) || null; }
function planDone() { return todayPlan().filter(id => isM(id) || doneToday(id)).length; }

/* ---------- readiness for the brevet ---------- */
function ready() {
  const main = MAIN(), m = main.filter(t => isM(t.id)).length;
  const pbs = PROBLEMS.length ? PROBLEMS.reduce((s, p) => s + ((DB.pb[p.id] || {}).best || 0), 0) / PROBLEMS.length : 0;
  const last = DB.exams.filter(e => e.mode === 'blanc' || e.mode === 'p1' || e.mode === 'p2').slice(-1)[0];
  const ex = last ? last.note / last.max : 0;
  return { p: Math.round(100 * (0.5 * (main.length ? m / main.length : 0) + 0.25 * pbs + 0.25 * ex)), m, n: main.length, pb: Math.round(100 * pbs), ex: last ? Math.round(100 * ex) : null };
}
function chProgress(ch) { const ts = MAIN().filter(t => t.ch === ch); return [ts.filter(t => isM(t.id)).length, ts.length]; }

/* ---------- badges ---------- */
function badgeList() {
  const tt = totalTasks(), bs = Math.max(bestStreak(), streak());
  const blancs = DB.exams.filter(e => e.mode === 'blanc'), best = Math.max(0, ...blancs.map(e => e.note));
  const pbDone = Object.values(DB.pb).filter(x => x.best >= 0.6).length;
  const chDone = CHAPTERS.filter(c => { const [a, b] = chProgress(c.id); return b && a === b; }).length;
  const mainLeft = MAIN().filter(t => !isM(t.id)).length;
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
    { id: 'all', ic: 'star', t: 'Всё освоено', d: 'Все темы бревета', v: mainLeft === 0 && MAIN().length ? 1 : 0, n: 1 }
  ];
}
function checkBadges() {
  badgeList().forEach(b => { if (b.v >= b.n && !DB.badges[b.id]) { DB.badges[b.id] = Date.now(); save(); if (b.id !== 'first') celebrate({ ic: b.ic, title: 'Новый значок: ' + b.t, text: b.d }); } });
}

/* ===================== PRACTICE: one topic, endless questions ===================== */
let P = null;                /* { mode, id, it, vi, vals, tries, hint, sol, done, ok, fb, n } */
const VROT = {};
function pickVi(t) { const k = VROT[t.id] = ((VROT[t.id] == null ? Math.floor(Math.random() * t.variants) : VROT[t.id] + 1)) % t.variants; return k; }
function makeItem(t) {
  const vi = pickVi(t), seed = Math.floor(Math.random() * 1e9);
  let it; try { it = t.gen(mkRng(seed), vi); } catch (e) { console.error(t.id, e); it = null; }
  return { it, vi, seed };
}
/* which topic a practice mode serves next */
function nextTopicFor(mode, cur) {
  if (mode === 'plan') return planNext() || cur;
  if (mode.startsWith('mix:')) {
    const ch = mode.slice(4); const ts = TOPICS.filter(t => t.ch === ch && t.lvl <= 2);
    const pool = ts.filter(t => !isM(t.id)); const src = pool.length && Math.random() < 0.7 ? pool : ts;
    return (src[Math.floor(Math.random() * src.length)] || {}).id;
  }
  if (mode === 'err') { const ws = TOPICS.filter(t => isWeak(t.id)); return ws.length ? ws[Math.floor(Math.random() * ws.length)].id : null; }
  return cur;
}
function viewPractice(mode) {
  const id = mode === 'plan' || mode === 'err' || mode.startsWith('mix:') ? nextTopicFor(mode, null) : mode;
  const t = TP(id);
  if (!t) {
    if (mode === 'err') return shell('<section class="card"><h3>Ошибок нет</h3><p class="muted">Сейчас нет тем, где последние ответы были с ошибками. Отличная работа!</p><a class="btn primary" href="#/">На главную</a></section>'), chrome({ title: 'Работа над ошибками', back: '#/' });
    if (mode === 'plan') return go('#/plan');
    return go('#/prog');
  }
  P = { mode, id, n: 0 }; newQuestion();
}
function newQuestion(keepTopic) {
  if (!keepTopic && P.mode !== P.id) { const nx = nextTopicFor(P.mode, P.id); if (nx && nx !== P.id) { P.switched = TP(P.id) && P.n ? P.id : null; P.id = nx; } }
  const t = TP(P.id); const { it, vi, seed } = makeItem(t);
  Object.assign(P, { it, vi, seed, vals: {}, tries: 0, hint: 0, sol: false, done: false, ok: null, fb: null, rec: false });
  renderPractice(true);
}
function practiceTitle() { return P.mode === 'plan' ? 'План на сегодня' : P.mode === 'err' ? 'Работа над ошибками' : P.mode.startsWith('mix:') ? 'Вперемешку' : 'Тренировка'; }
function renderPractice(fresh) {
  const t = TP(P.id), it = P.it, s = skOf(P.id);
  chrome({ title: practiceTitle(), back: P.mode === 'plan' || P.mode === 'err' ? '#/' : '#/ch/' + t.ch, tab: -1, tr: true, kb: true });
  if (!it) { shell('<section class="card"><p>Не получилось составить задание. Попробуй ещё раз.</p><button class="btn primary" onclick="newQuestion(true)">Новое задание</button></section>'); return; }
  const fs = fieldsOf(it.ans);
  fs.forEach((f, i) => { FIELD_VARS['f' + i] = varsFor(it); });
  let h = '<section class="card q" id="qcard">';
  h += '<div class="qtop"><div class="qname"><b>' + esc(t.ru) + '</b><span class="frn" lang="fr">' + esc(t.fr) + '</span></div>' + dotsHtml(s) + '</div>';
  h += '<div class="chips">' + (it.calc ? '<span class="chip">' + ico('calc') + 'с калькулятором</span>' : '<span class="chip warn">' + ico('nocalc') + 'без калькулятора</span>') + lvlChip(t.lvl) + (P.switched ? '<span class="chip ok">' + ico('check') + 'новая тема по плану</span>' : '') + '</div>';
  if (!DB.tipTr) h += '<div class="newtip">' + ico('bulb') + '<span>Условие по-французски, как на экзамене. Непонятно — нажми «Перевод» вверху: русский текст встанет на место французского.</span></div>';
  h += qHtml(it);
  h += '<div class="ansbox' + (fs.length > 1 ? ' multi' : '') + '">' + fs.map((f, i) => '<div class="part' + partCls(i) + '">' + fieldHtml(f, 'f' + i, P.vals['f' + i], fieldState(i)) + '</div>').join('') + '</div>';
  h += '<div id="fb">' + fbHtml() + '</div>';
  h += '<div class="row qbtns">' + practiceButtons(t) + '</div>';
  if (P.hint) h += '<div class="hints">' + t.hints.slice(0, P.hint).map((x, i) => '<div class="hint"><b>Подсказка ' + (i + 1) + '.</b> ' + rt(x) + '</div>').join('') + '</div>';
  if (P.sol) h += '<div class="solbox"><h3>Решение</h3><div class="ansline">Ответ: ' + answerHtml(it.ans) + '</div>' + solHtml(it) + '</div>';
  if (P.done || P.tries) h += '<button type="button" class="linkbtn" id="bReport">Нашёл ошибку в задании? Сообщить</button>';
  h += '</section>';
  h += nextBox(t);
  if (fresh) shell(h); else { const y = window.scrollY; $('#app').innerHTML = h; window.scrollTo(0, y); }
  ON_INPUT = () => { if (P.fb && !P.done) { P.fb = null; $('#fb').innerHTML = ''; } };
  ON_ENTER = () => { if (!P.done) checkPractice(); else newQuestion(); };
  window.KB_GO = 'Проверить';
  wireFields($('#app'), P.vals, P.done);
  if (P.done) hideKb();
  const b = id => $('#' + id);
  if (b('bCheck')) b('bCheck').onclick = checkPractice;
  if (b('bHint')) b('bHint').onclick = () => { P.hint++; renderPractice(); };
  if (b('bSol')) b('bSol').onclick = showSolution;
  if (b('bNext')) b('bNext').onclick = () => newQuestion();
  if (b('bSame')) b('bSame').onclick = () => newQuestion(true);
  if (b('bReport')) b('bReport').onclick = () => reportIssue('Тема ' + t.id + ' («' + t.ru + '»), тип ' + P.vi + ', номер ' + P.seed, it, Object.keys(P.vals).sort().map(k => P.vals[k]));
  P.switched = null;
}
const lvlChip = l => '<span class="chip lvl' + l + '">' + ['', 'база', 'бревет', 'сверх'][l] + '</span>';
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
  if (allOk) {
    P.done = true; P.ok = true; vib(25);
    P.fb = { cls: 'ok', t: first ? 'Верно!' : 'Теперь верно', m: first ? '' : 'Засчитывается как ошибка с первой попытки — но разобраться важнее.' };
    if (first && !P.rec) { P.rec = true; P.n++; record(P.id, true); } else if (!P.rec) { P.rec = true; P.n++; record(P.id, false); }
  } else {
    vib([40, 60, 40]);
    if (first && !P.rec) { P.rec = true; P.n++; record(P.id, false); }
    P.fb = { cls: near ? 'near' : 'bad', t: near ? 'Почти' : 'Пока неверно', m: (msg || '') + (P.tries >= 2 ? ' Посмотри подсказку или решение — и попробуй следующее задание.' : ' Исправь ответ и проверь ещё раз.') };
  }
  renderPractice();
  if (!allOk) { const c = $('#qcard'); if (c) { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); } }
}
function showSolution() {
  if (!P.done && !P.rec) { P.rec = true; P.n++; record(P.id, false); }
  P.sol = true; if (!P.done) { P.done = true; P.ok = false; P.fb = { cls: 'info', t: 'Разбор', m: 'Прочитай решение, а потом реши похожее задание сам — так тема запомнится.' }; }
  renderPractice();
  const sb = $('.solbox'); if (sb) sb.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function nextBox(t) {
  const s = skOf(t.id);
  if (!P.done) return '';
  if (s.m && P.mode === t.id) {
    const nx = planNext(); const nt = nx && nx !== t.id ? TP(nx) : null;
    return '<section class="nextbox hot"><b class="t">' + ico('check') + ' Тема освоена</b><span class="muted">Можно закрепить ещё парой заданий или идти дальше.</span><div class="row">' + (nt ? '<a class="btn primary" href="#/t/plan">Дальше по плану: ' + esc(nt.ru) + '</a>' : '<a class="btn primary" href="#/ch/' + t.ch + '">К главе</a>') + '</div></section>';
  }
  return '';
}

/* ===================== PROBLEM (Partie 2): a context and several questions ===================== */
let Q2 = null;               /* { id, seed, p, st: [{ vals, tries, done, ok, fb, sol, rec }] } */
function viewProblem(id, seed) {
  const pb = PB(id); if (!pb) return go('#/prog');
  seed = seed || Math.floor(Math.random() * 1e9);
  let p; try { p = pb.gen(mkRng(seed)); } catch (e) { console.error(id, e); return shell('<section class="card"><p>Не получилось составить задачу.</p></section>'); }
  Q2 = { id, seed, p, st: p.qs.map(() => ({ vals: {}, tries: 0, done: false, ok: null, fb: null, sol: false, rec: false })) };
  renderProblem(true);
}
function renderProblem(fresh) {
  const pb = PB(Q2.id), p = Q2.p;
  chrome({ title: 'Задача Partie 2', back: '#/ch/' + pb.ch, tr: true, kb: true });
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
    if (S.sol) h += '<div class="solbox"><div class="ansline">Ответ: ' + answerHtml(q.ans) + '</div>' + solHtml(q) + '</div>';
    if (S.done || S.tries) h += '<button type="button" class="linkbtn" data-rep="' + qi + '">Нашёл ошибку в задании? Сообщить</button>';
    h += '</section>';
  });
  const done = Q2.st.filter(s => s.done).length;
  if (done === p.qs.length) {
    const ok = Q2.st.filter(s => s.first).length;
    h += '<section class="nextbox hot"><b class="t">Задача решена: ' + ok + ' из ' + p.qs.length + ' с первой попытки</b><div class="row"><button class="btn primary" id="bAgain">' + ico('redo') + 'Тот же сюжет, другие числа</button><a class="btn" href="#/ch/' + pb.ch + '">К главе</a></div></section>';
  }
  if (fresh) shell(h); else { const y = window.scrollY; $('#app').innerHTML = h; window.scrollTo(0, y); }
  const all = {}; Q2.st.forEach(S => Object.assign(all, S.vals));
  ON_INPUT = id => { const qi = +/^q(\d+)/.exec(id)[1]; const S = Q2.st[qi]; S.vals[id] = all[id]; if (S.fb && !S.done) { S.fb = null; const c = $('#pq' + qi + ' .fb'); if (c) c.remove(); } };
  ON_ENTER = () => { const qi = ACTIVE ? +/^q(\d+)/.exec(ACTIVE.dataset.field)[1] : -1; if (qi >= 0) checkProblemQ(qi); };
  window.KB_GO = 'Проверить';
  wireFields($('#app'), all, false);
  $$('[data-chk]').forEach(b => b.onclick = () => checkProblemQ(+b.dataset.chk));
  $$('[data-sol]').forEach(b => b.onclick = () => { const S = Q2.st[+b.dataset.sol]; S.sol = true; if (!S.done) { S.done = true; S.ok = false; S.first = false; } finishProblemIfDone(); renderProblem(); });
  if ($('#bAgain')) $('#bAgain').onclick = () => viewProblem(Q2.id);
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
  if (S.tries === 1 && !S.rec) { S.rec = true; const k = todayKey(); DB.days[k] = (DB.days[k] || 0) + 1; const lg = DB.log[k] = DB.log[k] || { n: 0, ok: 0 }; lg.n++; if (allOk) lg.ok++; save(); if (DB.days[k] === GOAL()) celebrate({ ic: 'flame', title: 'Цель дня выполнена!', text: 'Серия: ' + dn(streak()) + ' подряд.' }); }
  finishProblemIfDone();
  renderProblem();
}
function finishProblemIfDone() {
  if (!Q2.st.every(s => s.done) || Q2.saved) return;
  Q2.saved = true; const f = Q2.st.filter(s => s.first).length / Q2.st.length;
  const x = DB.pb[Q2.id] = Object.assign({ n: 0, best: 0, last: 0, t: 0 }, DB.pb[Q2.id]); x.n++; x.best = Math.max(x.best, f); x.last = f; x.t = Date.now();
  save(); checkBadges();
}
