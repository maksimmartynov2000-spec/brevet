/* ===================== MOCK EXAMS and the START TEST =====================
   p1     Partie 1 — Automatismes: 9 short questions, 20 min, no calculator, 6 points
   p2     Partie 2 — 4 problems, 1 h 40, calculator, 12 points checked by the app (+2 for the write-up, marked by a teacher)
   blanc  both parts like on the day: Partie 1 is handed in after 20 minutes, then Partie 2
   quick  6 short questions, 10 minutes — for a busy day
   diag   start test: 2 questions per chapter, no timer; a right answer marks the topic as known, so the plan skips it
   A test is stored as seeds, so after closing the app it comes back with exactly the same questions. */
const MODES = {
  p1: { ru: 'Partie 1 · автоматизмы', fr: 'Automatismes', sub: '9 вопросов · 20 минут · без калькулятора', ic: 'nocalc' },
  p2: { ru: 'Partie 2 · задачи', fr: 'Raisonnement et résolution de problèmes', sub: '4 задачи · 1 ч 40 · с калькулятором', ic: 'calc' },
  blanc: { ru: 'Brevet blanc', fr: 'Épreuve complète', sub: 'обе части · 2 часа, как на экзамене', ic: 'exam' },
  quick: { ru: 'Экспресс', fr: 'Entraînement rapide', sub: '6 вопросов · 10 минут', ic: 'timer' },
  diag: { ru: 'Стартовая проверка', fr: 'Test de positionnement', sub: '2 вопроса по каждой главе · без таймера', ic: 'list' }
};
const P1_PLAN = ['nc', 'nc', 'pp', 'cl', 'fn', 'st', 'gm', 'ge', 'ge|cl|st|al'];
const rnd = () => Math.floor(Math.random() * 1e9);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function pickShort(n, plan, filter) {
  const used = new Set(), out = [];
  const pool = TOPICS.filter(filter);
  const take = chs => { const c = shuffle(pool.filter(t => chs.includes(t.ch) && !used.has(t.id))); return c.find(t => !isM(t.id)) || c[0]; };
  (plan || []).slice(0, n).forEach(slot => { const t = take(slot.split('|')); if (t) { used.add(t.id); out.push(t); } });
  while (out.length < n) { const t = shuffle(pool.filter(x => !used.has(x.id)))[0]; if (!t) break; used.add(t.id); out.push(t); }
  return out.map(t => ({ tid: t.id, vi: Math.floor(Math.random() * t.variants), seed: rnd() }));
}
function pickProblems(n) {
  const byCh = {}; shuffle(PROBLEMS).forEach(p => { (byCh[p.ch] = byCh[p.ch] || []).push(p); });
  const order = shuffle(Object.keys(byCh)); const out = [];
  for (let round = 0; out.length < n && round < 10; round++) order.forEach(ch => { if (out.length >= n) return; const l = byCh[ch].sort((a, b) => ((DB.pb[a.id] || {}).n || 0) - ((DB.pb[b.id] || {}).n || 0)); if (l[round]) out.push(l[round]); });
  return out.map(p => ({ pid: p.id, seed: rnd() }));
}
function newExam(mode) {
  const now = Date.now(), parts = [];
  const short = t => t.lvl <= 2 && !t.calc;
  if (mode === 'p1' || mode === 'blanc') parts.push({ kind: 'short', title: 'Partie 1 — Automatismes', pts: 6, dur: 20 * 60, items: pickShort(9, P1_PLAN, short) });
  if (mode === 'quick') parts.push({ kind: 'short', title: 'Экспресс', pts: 6, dur: 10 * 60, items: pickShort(6, shuffle(P1_PLAN).slice(0, 6), short) });
  if (mode === 'diag') {
    const items = []; CHAPTERS.forEach(c => { [1, 2].forEach(l => { const ts = shuffle(TOPICS.filter(t => t.ch === c.id && t.lvl === l)); if (ts[0]) items.push({ tid: ts[0].id, vi: Math.floor(Math.random() * ts[0].variants), seed: rnd() }); }); });
    parts.push({ kind: 'short', title: 'Стартовая проверка', pts: 0, dur: 0, items });
  }
  if (mode === 'p2' || mode === 'blanc') parts.push({ kind: 'prob', title: 'Partie 2 — Raisonnement et résolution de problèmes', pts: 12, dur: 100 * 60, probs: pickProblems(4) });
  DB.cur = { mode, t0: now, part: 0, parts, vals: {} };
  startPart(); save();
}
function startPart() { const pt = DB.cur.parts[DB.cur.part]; pt.start = Date.now(); if (pt.dur) pt.end = pt.start + pt.dur * 1000; }

/* questions of a part, rebuilt from the seeds */
const EXC = new Map();
function partItems(pi, cur) {
  cur = cur || DB.cur; const key = cur.t0 + ':' + pi; if (EXC.has(key)) return EXC.get(key);
  const pt = cur.parts[pi]; let out = [];
  if (pt.kind === 'short') out = pt.items.map(x => { const t = TP(x.tid); if (!t) return null; try { return { t, it: t.gen(mkRng(x.seed), x.vi % t.variants) }; } catch (e) { return null; } }).filter(Boolean);
  else out = pt.probs.map(x => { const p = PB(x.pid); if (!p) return null; try { return { pb: p, p: p.gen(mkRng(x.seed)) }; } catch (e) { return null; } }).filter(Boolean);
  EXC.clear(); EXC.set(key, out); return out;
}
const fid = (pi, qi, i, k) => 'x' + pi + '_' + qi + '_' + (k == null ? '' : k + '_') + i;

/* ---------- timer ---------- */
let TIMER = 0;
function stopTimer() { clearInterval(TIMER); TIMER = 0; }
function tick() {
  const cur = DB.cur; if (!cur) return stopTimer();
  const pt = cur.parts[cur.part]; const el = $('#tmr'); if (!pt.end) return;
  const left = (pt.end - Date.now()) / 1000;
  if (el) { el.textContent = mmss(left); el.classList.toggle('low', left < 120); }
  if (left <= 0) { stopTimer(); toast('Время вышло — работа собрана'); handIn(true); }
}

/* ---------- the test on screen ---------- */
function viewExamRun() {
  const cur = DB.cur; if (!cur) return go('#/exam');
  const pi = cur.part, pt = cur.parts[pi], md = MODES[cur.mode];
  if (pt.end && Date.now() >= pt.end) return handIn(true);
  chrome({ title: md.ru, back: '#/exam', tr: true, kb: true });
  const items = partItems(pi);
  let h = '<section class="card exhead"><div class="exrowtop"><div class="qname"><b>' + esc(pt.title) + '</b><span class="frn">' + (pt.kind === 'short' ? (cur.mode === 'diag' ? 'без подсказок, без таймера' : 'sans calculatrice') : 'calculatrice autorisée') + '</span></div>' +
    (pt.end ? '<div class="tmr" id="tmr" aria-live="off">' + mmss((pt.end - Date.now()) / 1000) + '</div>' : '') + '</div>' +
    '<p class="muted">' + (pt.kind === 'short' ? 'Ответы проверяются в конце. ' + (cur.mode === 'blanc' ? 'После сдачи Partie 1 к ней не вернуться — как на экзамене.' : 'Подсказок нет.') : 'Обоснования пишут на черновике: приложение проверяет ответы и выбор обоснования. Ещё 2 балла на экзамене ставят за ясность изложения.') + '</p></section>';
  if (pt.kind === 'short') {
    items.forEach((x, qi) => {
      const fs = fieldsOf(x.it.ans); fs.forEach((f, i) => { FIELD_VARS[fid(pi, qi, i)] = varsFor(x.it); });
      h += '<section class="card q exq">' + qHtml(x.it, qi + 1) + '<div class="ansbox' + (fs.length > 1 ? ' multi' : '') + '">' + fs.map((f, i) => '<div class="part">' + fieldHtml(f, fid(pi, qi, i), cur.vals[fid(pi, qi, i)], null) + '</div>').join('') + '</div></section>';
    });
  } else {
    items.forEach((x, k) => {
      h += '<section class="card pbhead"><div class="qname"><b>Exercice ' + (k + 1) + ' · ' + x.pb.pts + ' ' + plural(x.pb.pts, 'балл', 'балла', 'баллов') + '</b><span class="frn">' + esc(x.pb.fr) + '</span></div>' + (x.p.ctx ? '<div class="pctx instr">' + bt(x.p.ctx) + '</div>' : '') + (x.p.fig ? '<div class="figw">' + x.p.fig + '</div>' : '') + '</section>';
      x.p.qs.forEach((q, qi) => {
        const fs = fieldsOf(q.ans); fs.forEach((f, i) => { FIELD_VARS[fid(pi, qi, i, k)] = varsFor(q); });
        h += '<section class="card q exq pq">' + qHtml(q, (k + 1) + '.' + (qi + 1)) + '<div class="ansbox' + (fs.length > 1 ? ' multi' : '') + '">' + fs.map((f, i) => '<div class="part">' + fieldHtml(f, fid(pi, qi, i, k), cur.vals[fid(pi, qi, i, k)], null) + '</div>').join('') + '</div></section>';
      });
    });
  }
  const last = pi === cur.parts.length - 1;
  h += '<div class="sticky exfoot"><span class="meta" id="exProg">' + progressText() + '</span><button class="btn primary" id="bHand">' + (last ? 'Завершить' : 'Сдать Partie 1') + '</button></div>';
  shell(h);
  ON_INPUT = () => { saveSoon(); const p = $('#exProg'); if (p) p.textContent = progressText(); };
  ON_ENTER = () => { const all = $$('input.inp:not([readonly])'); const i = all.indexOf(ACTIVE); if (i >= 0 && i < all.length - 1) all[i + 1].focus(); else hideKb(); };
  window.KB_GO = 'Дальше';
  wireFields($('#app'), cur.vals, false);
  $('#bHand').onclick = () => {
    const pr = answeredCount(); const left = pr[1] - pr[0];
    confirmSheet(last ? 'Завершить пробник?' : 'Сдать Partie 1?', (left ? 'Без ответа: ' + left + '. ' : 'Ответы есть на все вопросы. ') + (last ? 'После этого появятся результаты и разбор.' : 'Вернуться к Partie 1 будет нельзя — как на экзамене.'), last ? 'Завершить' : 'Сдать', () => handIn(false));
  };
  if (pt.end) { stopTimer(); TIMER = setInterval(tick, 1000); }
}
function answeredCount() {
  const cur = DB.cur, pi = cur.part, pt = cur.parts[pi]; let n = 0, a = 0;
  partItems(pi).forEach((x, k) => {
    const qs = pt.kind === 'short' ? [x.it] : x.p.qs;
    qs.forEach((q, qi) => { n++; const fs = fieldsOf(q.ans); if (fs.every((f, i) => { const v = cur.vals[pt.kind === 'short' ? fid(pi, k, i) : fid(pi, qi, i, k)]; return v != null && v !== ''; })) a++; });
  });
  return [a, n];
}
const progressText = () => { const [a, n] = answeredCount(); return 'Отвечено ' + a + ' из ' + n; };
window.appBusy = () => !!(DB && DB.cur && /^#\/exam\/run/.test(location.hash));

/* ---------- hand in a part; after the last part — the result ---------- */
function handIn(timeUp) {
  const cur = DB.cur; if (!cur) return;
  stopTimer();
  const pt = cur.parts[cur.part]; pt.done = Date.now(); pt.timeUp = !!timeUp;
  if (cur.part < cur.parts.length - 1) { cur.part++; startPart(); save(); EXC.clear(); hideKb(); route(); window.scrollTo(0, 0); return; }
  finishExam();
}
function scoreExam(cur, apply) {
  const res = { parts: [], weak: new Set(), n: 0, ok: 0 };
  cur.parts.forEach((pt, pi) => {
    const items = partItems(pi, cur); const R = { kind: pt.kind, title: pt.title, pts: pt.pts, qs: [] };
    if (pt.kind === 'short') {
      items.forEach((x, qi) => { const ok = fieldsOf(x.it.ans).every((f, i) => gradeField(f.spec, cur.vals[fid(pi, qi, i)]).ok); R.qs.push({ ok, tid: x.t.id }); res.n++; if (ok) res.ok++; else res.weak.add(x.t.id); });
      R.score = items.length ? pt.pts * R.qs.filter(q => q.ok).length / items.length : 0;
    } else {
      let got = 0, tot = 0;
      items.forEach((x, k) => {
        const wsum = x.p.qs.reduce((s, q) => s + (q.pts || 1), 0); let g = 0;
        x.p.qs.forEach((q, qi) => { const ok = fieldsOf(q.ans).every((f, i) => gradeField(f.spec, cur.vals[fid(pi, qi, i, k)]).ok); R.qs.push({ ok, pid: x.pb.id }); res.n++; if (ok) { res.ok++; g += q.pts || 1; } });
        got += x.pb.pts * g / wsum; tot += x.pb.pts;
        const f = g / wsum;
        if (apply) { const st = DB.pb[x.pb.id] = Object.assign({ n: 0, best: 0, last: 0, t: 0 }, DB.pb[x.pb.id]); st.n++; st.best = Math.max(st.best, f); st.last = f; st.t = Date.now(); }
        if (f < 0.6) res.weak.add(x.pb.id);
      });
      R.score = tot ? pt.pts * got / tot : 0;
    }
    res.parts.push(R);
  });
  return res;
}
function finishExam() {
  const cur = DB.cur; const res = scoreExam(cur, true);
  const p1 = res.parts.filter(p => p.kind === 'short').reduce((s, p) => s + p.score, 0), p2 = res.parts.filter(p => p.kind === 'prob').reduce((s, p) => s + p.score, 0);
  if (cur.mode === 'diag') {
    partItems(0, cur).forEach((x, qi) => {
      const ok = res.parts[0].qs[qi].ok; const s = DB.sk[x.t.id] = Object.assign({ a: 0, c: 0, s: 0, m: 0, t: 0, r: '' }, DB.sk[x.t.id]);
      s.a++; s.t = Date.now(); s.r = ((s.r || '') + (ok ? '1' : '0')).slice(-8);
      if (ok) { s.c++; s.m = 1; s.d = 1; if (x.t.lvl === 2) TOPICS.filter(t => t.ch === x.t.ch && t.lvl === 1 && !DB.sk[t.id]).forEach(t => { DB.sk[t.id] = { a: 0, c: 0, s: 0, m: 1, t: Date.now(), r: '', d: 1 }; }); }
      const k = todayKey(); DB.days[k] = (DB.days[k] || 0) + 1; const lg = DB.log[k] = DB.log[k] || { n: 0, ok: 0 }; lg.n++; if (ok) lg.ok++;
    });
    DB.diag = { at: Date.now(), n: res.n, ok: res.ok }; DB.plan = null;
  }
  const max = cur.mode === 'blanc' ? 18 : cur.mode === 'p2' ? 12 : 6;
  const rec = { mode: cur.mode, t0: cur.t0, t1: Date.now(), p1: Math.round(p1 * 10) / 10, p2: Math.round(p2 * 10) / 10, note: Math.round((p1 + p2) * 10) / 10, max, n: res.n, ok: res.ok, weak: [...res.weak].slice(0, 12) };
  DB.last = { rec, cur };            /* the last test with the answers — for the review screen */
  DB.exams.push(rec); DB.exams = DB.exams.slice(-30); DB.cur = null; save(); EXC.clear(); checkBadges();
  go('#/exam/res');
}

/* ---------- result and review ---------- */
function viewExamResult() {
  const L0 = DB.last; if (!L0) return go('#/exam');
  const { rec, cur } = L0; const md = MODES[rec.mode];
  chrome({ title: md.ru, back: '#/exam', tr: true });
  EXC.clear();
  let h = '<section class="card exres"><div class="scorebig">' + (rec.mode === 'diag' ? rec.ok + '<small> из ' + rec.n + '</small>' : n20(rec.note) + '<small> / ' + rec.max + '</small>') + '</div>';
  if (rec.mode === 'blanc') h += '<p class="muted">Partie 1: ' + n20(rec.p1) + ' / 6 · Partie 2: ' + n20(rec.p2) + ' / 12. На экзамене ещё 2 балла дают за ясность и оформление решений — их приложение не проверяет.</p>';
  else if (rec.mode === 'diag') h += '<p class="muted">Темы с верными ответами засчитаны как знакомые — план их пропустит. Темы с ошибками план поставит первыми.</p>';
  else h += '<p class="muted">Верных ответов: ' + rec.ok + ' из ' + rec.n + (rec.mode === 'p2' ? '. Ещё 2 балла на экзамене — за оформление.' : '') + '</p>';
  const weak = rec.weak.map(id => TP(id) || PB(id)).filter(Boolean);
  if (weak.length) h += '<h3>Что повторить</h3><div class="lst">' + weak.slice(0, 8).map(x => '<a class="lrow" href="' + (x.kind === 'prob' ? '#/pb/' + x.id : '#/t/' + x.id) + '"><span class="lic">' + ico(x.kind === 'prob' ? 'pen' : 'target') + '</span><span class="lt"><b>' + esc(x.ru) + '</b><span class="muted">' + esc(CH(x.ch).ru) + '</span></span></a>').join('') + '</div>';
  h += '<div class="row"><a class="btn primary" href="#/exam">К пробникам</a>' + (rec.mode === 'diag' ? '<a class="btn" href="#/">К плану</a>' : '') + '</div></section>';
  h += '<h3 class="sechead">Разбор</h3>';
  cur.parts.forEach((pt, pi) => {
    const items = partItems(pi, cur);
    if (cur.parts.length > 1) h += '<div class="chhead">' + esc(pt.title) + '</div>';
    if (pt.kind === 'short') items.forEach((x, qi) => { h += reviewQ(x.it, qi + 1, fieldsOf(x.it.ans).map((f, i) => cur.vals[fid(pi, qi, i)])); });
    else items.forEach((x, k) => {
      h += '<section class="card pbhead"><div class="qname"><b>Exercice ' + (k + 1) + '</b><span class="frn">' + esc(x.pb.fr) + '</span></div>' + (x.p.ctx ? '<div class="pctx instr">' + bt(x.p.ctx) + '</div>' : '') + (x.p.fig ? '<div class="figw">' + x.p.fig + '</div>' : '') + '</section>';
      x.p.qs.forEach((q, qi) => { h += reviewQ(q, (k + 1) + '.' + (qi + 1), fieldsOf(q.ans).map((f, i) => cur.vals[fid(pi, qi, i, k)])); });
    });
  });
  shell(h);
}
function reviewQ(it, num, vals) {
  const fs = fieldsOf(it.ans); const marks = fs.map((f, i) => gradeField(f.spec, vals[i]).ok);
  const ok = marks.every(Boolean);
  let h = '<section class="card q exq rvq ' + (ok ? 'okq' : 'badq') + '">' + qHtml(it, num);
  h += '<div class="ansbox' + (fs.length > 1 ? ' multi' : '') + '">' + fs.map((f, i) => '<div class="part ' + (marks[i] ? 'ok' : 'bad') + '">' + fieldHtml(f, 'rv' + String(num).replace('.', '_') + '_' + i, vals[i], { mark: marks[i] ? 'ok' : 'bad', reveal: true, lock: true }) + '</div>').join('') + '</div>';
  h += '<div class="fb ' + (ok ? 'ok' : 'bad') + '"><b class="t">' + (ok ? 'Верно' : vals.every(v => v == null || v === '') ? 'Нет ответа' : 'Неверно') + '</b>' + (ok ? '' : '<span>Ответ: ' + answerHtml(it.ans) + '</span>') + '</div>';
  h += '<details class="rv"><summary>Решение</summary>' + solHtml(it) + '</details></section>';
  return h;
}
