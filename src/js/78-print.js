/* ===================== PRINT AND PDF: sheets of tasks and, separately, their answers =====================
   A sheet is a list of tasks with their numbers (topic, type, seed), written into the address:
     #/pr/<kind>:<item>;<item>…     item = topicId,type,seed  or  problemId,seed  (seed in base 36)
     kind: f — a sheet (one topic or mixed), a — a Partie 1 set, p — a Partie 2 problem, b — a Brevet blanc
   So the same sheet can be opened again, on another device too, and the answers always match the tasks.
   The tasks are printed in French only, as on the exam; the answers are a second document for the tutor.
   Printing is the browser's own («Печать» → «Сохранить как PDF»): the print styles hide everything but the chosen document. */
const PR_KIND = { f: 'Entraînement', a: 'Partie 1 — Automatismes', p: 'Partie 2 — Exercice', b: 'Brevet blanc' };
const s36 = n => Math.floor(n).toString(36);
function prSpec(kind, items) { return kind + ':' + items.map(x => (x.pid ? x.pid + ',' + s36(x.seed) : x.tid + ',' + x.vi + ',' + s36(x.seed))).join(';'); }
function prParse(spec) {
  const m = /^([fapb]):(.+)$/.exec(spec || ''); if (!m) return null;
  const items = m[2].split(';').map(x => {
    const a = x.split(',');
    if (a.length === 2 && PB(a[0])) return { pid: a[0], seed: parseInt(a[1], 36) };
    if (a.length === 3 && TP(a[0])) return { tid: a[0], vi: +a[1] || 0, seed: parseInt(a[2], 36) };
    return null;
  }).filter(x => x && isFinite(x.seed));
  return items.length ? { kind: m[1], items } : null;
}
/* a short mark printed on both documents, so that a key is never mixed up with another sheet */
const prMark = spec => ('000' + (fnv32(spec) % 46656).toString(36)).slice(-3).toUpperCase();
/* n tasks of a topic: its types in turn, new numbers each */
const prTopicItems = (t, n) => Array.from({ length: n }, (_, i) => ({ tid: t.id, vi: i % t.variants, seed: rnd() }));

/* ---------- what goes on paper ---------- */
const frOnly = o => (o == null ? '' : typeof o === 'object' ? rt(frTypo(o.fr)) : rt(o));
const ruOnly = o => (o == null ? '' : typeof o === 'object' ? rt(o.ru) : '');
const prBlank = (h, lined) => '<div class="blank' + (lined ? ' lined' : '') + '" style="height:' + h + 'mm"></div>';
/* the place for the answer: boxes to tick, steps to number, or a line with the unit */
function prAnswer(spec, room) {
  if (spec.k === 'multi') return spec.parts.map(p => '<div class="prpart">' + (p.lab ? '<span class="prlab">' + frOnly(p.lab) + '</span>' : '') + prAnswer(p.spec, 0) + '</div>').join('') + (room ? prBlank(room) : '');
  if (spec.k === 'mcq') return '<div class="propts">' + spec.opts.map((o, k) => '<div class="propt"><span class="box"></span><b>' + 'ABCDEFGH'[k] + '.</b> <span>' + frOnly(o) + '</span></div>').join('') + '</div>';
  if (spec.k === 'order') return '<p class="prnote">Numéroter les étapes dans l’ordre.</p><div class="propts">' + spec.perm.map(k => '<div class="propt"><span class="box num"></span><span>' + frOnly(spec.items[k]) + '</span></div>').join('') + '</div>';
  return (room ? prBlank(room) : '') + '<div class="prline"><span>Réponse :</span>' + (spec.pre ? '<span>' + esc(spec.pre) + '</span>' : '') + '<i></i>' + (spec.unit ? '<span>' + esc(spec.unit) + '</span>' : '') + '</div>';
}
function prStatement(it, num) {
  let h = '<div class="prq"><span class="prnum">' + num + '</span><div class="prtx">' + frOnly(it.q) + '</div></div>';
  if (it.m) h += '<div class="prompt">' + K(mi(it.m), true) + '</div>'; else if (it.tex) h += '<div class="prompt">' + K(it.tex, true) + '</div>';
  if (it.fig) h += '<div class="figw">' + it.fig + '</div>';
  return h;
}
/* everything a sheet holds, generated from the numbers */
function prBuild(sp) {
  return sp.items.map(x => {
    try {
      if (x.pid) { const pb = PB(x.pid); return { pb, p: pb.gen(mkRng(x.seed)) }; }
      const t = TP(x.tid); return { t, it: t.gen(mkRng(x.seed), x.vi % t.variants) };
    } catch (e) { console.error(e); return null; }
  }).filter(Boolean);
}
function prTitle(sp, list) {
  if (sp.kind === 'f') { const ts = [...new Set(list.filter(x => x.t).map(x => x.t.fr))]; return ts.length === 1 ? ts[0] : 'Entraînement — ' + ts.length + ' thèmes'; }
  if (sp.kind === 'p') return list[0] && list[0].pb ? list[0].pb.fr : PR_KIND.p;
  return PR_KIND[sp.kind];
}
function prTasksHtml(sp, list, mark) {
  const shorts = list.filter(x => x.t), probs = list.filter(x => x.pb), blanc = sp.kind === 'b', p1 = sp.kind === 'a' || blanc;
  let h = '<div class="prhead"><div><b>' + (blanc ? 'Diplôme national du brevet — Mathématiques' : 'Brevet · Mathématiques') + '</b><span>' + esc(blanc ? 'Sujet d’entraînement' : prTitle(sp, list)) + '</span></div><div class="prname"><span>Nom : <i></i></span><span>Date : <i></i></span></div></div>';
  if (shorts.length) {
    if (p1) h += '<div class="prpart-t"><b>Partie 1 — Automatismes</b><span>6 points · 20 minutes · sans calculatrice</span></div>';
    else if (shorts.some(x => x.it.calc)) h += '<p class="prnote">La calculatrice est autorisée pour les questions marquées ' + ico('calc') + '.</p>';
    h += shorts.map((x, i) => '<div class="pritem">' + prStatement(x.it, (i + 1) + '.' + (!p1 && x.it.calc ? ' ' + ico('calc') : '')) + prAnswer(x.it.ans, p1 ? 14 : 20) + '</div>').join('');
  }
  if (probs.length) {
    if (blanc) h += '<div class="prbreak"></div><div class="prpart-t"><b>Partie 2 — Raisonnement et résolution de problèmes</b><span>14 points, dont 2 pour la rédaction · 1 h 40 · calculatrice autorisée</span></div>';
    h += probs.map((x, k) => '<div class="prex"><div class="prex-t"><b>Exercice ' + (probs.length > 1 ? k + 1 : '') + '</b><span>' + x.pb.pts + ' points</span></div>' + (x.p.ctx ? '<div class="prctx">' + frOnly(x.p.ctx) + '</div>' : '') + (x.p.fig ? '<div class="figw">' + x.p.fig + '</div>' : '') +
      x.p.qs.map((q, qi) => '<div class="pritem">' + prStatement(q, (qi + 1) + '.') + prAnswer(q.ans, q.red ? 44 : 30) + '</div>').join('') + '</div>').join('');
  }
  return h + '<div class="prfoot"><span>Brevet · entraînement</span><span>feuille ' + mark + '</span></div>';
}
/* the key: answers, or answers with the solutions; the Russian translation of the statements on request */
function prKeyHtml(sp, list, mark, o) {
  const one = (it, num) => '<div class="pritem key"><div class="prq"><span class="prnum">' + num + '</span><div class="prtx">' + (o.ru && ruOnly(it.q) ? '<div class="prru">' + ruOnly(it.q) + '</div>' : '') + '<div class="prans"><b>Ответ:</b> ' + answerHtml(it.ans) + '</div></div></div>' + (o.sol ? '<div class="prsol">' + solHtml(it) + '</div>' : '') + '</div>';
  const shorts = list.filter(x => x.t), probs = list.filter(x => x.pb);
  let h = '<div class="prhead"><div><b>Ответы' + (o.sol ? ' и решения' : '') + '</b><span>' + esc(prTitle(sp, list)) + '</span></div><div class="prname"><span>лист ' + mark + '</span></div></div>';
  if (shorts.length) h += (probs.length ? '<div class="prpart-t"><b>Partie 1</b></div>' : '') + shorts.map((x, i) => one(x.it, (i + 1) + '.')).join('');
  if (probs.length) h += (shorts.length ? '<div class="prpart-t"><b>Partie 2</b></div>' : '') + probs.map((x, k) => '<div class="prex"><div class="prex-t"><b>Exercice ' + (probs.length > 1 ? k + 1 : '') + ' · ' + esc(x.pb.ru) + '</b><span>по мотивам: ' + esc(x.pb.src) + '</span></div>' + (o.ru && x.p.ctx && ruOnly(x.p.ctx) ? '<div class="prru">' + ruOnly(x.p.ctx) + '</div>' : '') + x.p.qs.map((q, qi) => one(q, (qi + 1) + '.')).join('') + '</div>').join('');
  return h + '<div class="prfoot"><span>Brevet · ключ для преподавателя</span><span>лист ' + mark + '</span></div>';
}

/* ---------- the sheet on screen, with the print buttons ---------- */
let PRO = { sol: false, ru: false };
function viewSheet(spec) {
  const sp = prParse(decodeURIComponent(spec)); if (!sp) { toast('Этот лист не открывается: ссылка неполная'); return go('#/pr'); }
  chrome({ title: 'Лист для печати', back: '#/pr', tab: 3 });
  const list = prBuild(sp), norm = prSpec(sp.kind, sp.items), mark = prMark(norm), title = prTitle(sp, list);
  const tool = '<section class="card prtool"><b>' + esc(title) + '</b><span class="muted">лист ' + mark + ' · ' + list.length + ' ' + (sp.kind === 'p' ? 'задача' : plural(list.length, 'пункт', 'пункта', 'пунктов')) + '. Задания и ответы печатаются отдельно — в окне печати выберите «Сохранить как PDF».</span>' +
    '<div class="row"><button class="btn primary" id="prT">' + ico('save') + 'Задания: печать / PDF</button><button class="btn" id="prK">' + ico('save') + 'Ответы: печать / PDF</button></div>' +
    '<div class="row"><button class="btn small' + (PRO.sol ? '' : ' primary') + '" data-o="sol:0">Только ответы</button><button class="btn small' + (PRO.sol ? ' primary' : '') + '" data-o="sol:1">Ответы с решениями</button><button class="btn small' + (PRO.ru ? ' primary' : '') + '" data-o="ru">Перевод условий в ответах</button></div>' +
    '<div class="row"><button class="btn small" id="prNew">' + ico('redo') + 'Другие числа</button><button class="btn small" id="prLink">' + ico('link') + 'Ссылка на этот лист</button></div>' +
    '<p class="meta">На iPhone и iPad: «Печать» → разведите двумя пальцами превью страницы → «Поделиться» → «Сохранить в Файлы». Если с экрана «Домой» окно печати не открывается — скопируйте ссылку и откройте её в Safari.</p></section>';
  shell(tool + '<div class="paper tasks" lang="fr">' + prTasksHtml(sp, list, mark) + '</div><div class="paper key">' + prKeyHtml(sp, list, mark, PRO) + '</div>', 'prview');
  const print = which => {
    const cls = which === 'k' ? 'pr-key' : 'pr-tasks', old = document.title;
    document.body.classList.remove('pr-key', 'pr-tasks'); document.body.classList.add(cls);
    document.title = 'Brevet ' + mark + ' — ' + title + (which === 'k' ? ' — ответы' : ' — задания');
    const done = () => { document.title = old; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    try { window.print(); } catch (e) { toast('Печать недоступна в этом окне — скопируйте ссылку и откройте в браузере', 4000); done(); }
  };
  $('#prT').onclick = () => print('t'); $('#prK').onclick = () => print('k');
  $$('[data-o]').forEach(b => b.onclick = () => { const [k, v] = b.dataset.o.split(':'); if (k === 'ru') PRO.ru = !PRO.ru; else PRO.sol = v === '1'; const y = window.scrollY; viewSheet(spec); window.scrollTo(0, y); });
  $('#prNew').onclick = () => go('#/pr/' + prSpec(sp.kind, sp.items.map(x => Object.assign({}, x, { seed: rnd() }))));
  $('#prLink').onclick = () => copyText(location.origin + location.pathname + '#/pr/' + norm);
}

/* ---------- choosing what to print ---------- */
let PRB = { tab: 'f', topic: '', n: 8, mix: {}, per: 3, pb: '' };
function viewPrint() {
  chrome({ title: 'Печать и PDF', back: DB ? '#/tutor' : '#/login', tab: 3 });
  const B = PRB, tabs = [['f', 'Тема'], ['m', 'Смешанный'], ['a', 'Partie 1'], ['p', 'Задача'], ['b', 'Brevet blanc']];
  const chOpts = fn => CHAPTERS.map(c => { const xs = fn(c); return xs.length ? '<optgroup label="' + esc(c.ru) + '">' + xs.join('') + '</optgroup>' : ''; }).join('');
  let h = '<section class="card"><p class="muted" style="margin:0">Лист для ученика — только по-французски, как на экзамене, с местом для решения. Ответы — отдельным документом, для вас. Каждый лист можно открыть снова по ссылке: числа в нём останутся те же.</p><div class="segs" role="tablist">' + tabs.map(([k, t]) => '<button type="button" role="tab" class="seg' + (B.tab === k ? ' on' : '') + '" data-tab="' + k + '">' + t + '</button>').join('') + '</div></section>';
  if (B.tab === 'f') {
    h += '<section class="card"><b>Лист по одной теме</b><select class="inp plain" id="prTopic" aria-label="тема"><option value="">Выберите тему…</option>' + chOpts(c => TOPICS.filter(t => t.ch === c.id && t.ch !== 'lg').map(t => '<option value="' + t.id + '"' + (B.topic === t.id ? ' selected' : '') + '>' + esc(t.ru) + '</option>')) + '</select>' +
      '<div class="row" style="margin-top:10px"><span class="meta">Заданий:</span>' + [6, 8, 10, 12].map(n => '<button class="btn small' + (B.n === n ? ' primary' : '') + '" data-n="' + n + '">' + n + '</button>').join('') + '</div><div class="row" style="margin-top:12px"><button class="btn primary" id="prGo"' + (B.topic ? '' : ' disabled') + '>Составить лист</button></div></section>';
  } else if (B.tab === 'm') {
    const cnt = Object.keys(B.mix).length;
    h += '<section class="card"><b>Смешанный лист</b><p class="muted">Отметьте темы — из каждой возьмётся по несколько заданий, вперемешку.</p><div class="row"><span class="meta">Из каждой темы:</span>' + [2, 3, 4].map(n => '<button class="btn small' + (B.per === n ? ' primary' : '') + '" data-per="' + n + '">' + n + '</button>').join('') + '<button class="btn small ghost" id="prWeak">Отметить темы с ошибками</button></div></section>';
    h += '<section class="card theory hwb">' + CHAPTERS.map(c => { const ts = TOPICS.filter(t => t.ch === c.id && t.ch !== 'lg'); if (!ts.length) return ''; const k = ts.filter(t => B.mix[t.id]).length; return '<details' + (B.open === c.id ? ' open' : '') + ' data-ch="' + c.id + '"><summary>' + esc(c.ru) + (k ? ' <span class="pill b">' + k + '</span>' : '') + '</summary>' + ts.map(t => '<button type="button" class="hbrow pb' + (B.mix[t.id] ? ' on' : '') + '" data-mix="' + t.id + '"><span class="nm"><b>' + esc(t.ru) + '</b><span class="muted" lang="fr">' + esc(t.fr) + '</span></span><span class="chk">' + ico('check') + '</span></button>').join('') + '</details>'; }).join('') + '</section>';
    h += '<div class="sticky exfoot"><span class="meta">' + (cnt ? cnt + ' ' + plural(cnt, 'тема', 'темы', 'тем') + ' · ' + cnt * B.per + ' ' + plural(cnt * B.per, 'задание', 'задания', 'заданий') : 'темы не выбраны') + '</span><button class="btn primary" id="prGo"' + (cnt ? '' : ' disabled') + '>Составить лист</button></div>';
  } else if (B.tab === 'a') {
    h += '<section class="card"><b>Вариант Partie 1 — автоматизмы</b><p class="muted">9 коротких вопросов без калькулятора по разным главам, как на экзамене: 20 минут, 6 баллов.' + (DB ? ' Темы, которые ученик ещё не освоил, берутся в первую очередь.' : '') + '</p><div class="row"><button class="btn primary" id="prGo">Составить вариант</button></div></section>';
  } else if (B.tab === 'p') {
    h += '<section class="card"><b>Задача Partie 2</b><select class="inp plain" id="prPb" aria-label="задача"><option value="">Выберите задачу…</option>' + chOpts(c => PROBLEMS.filter(p => p.ch === c.id).map(p => '<option value="' + p.id + '"' + (B.pb === p.id ? ' selected' : '') + '>' + esc(p.ru) + ' · ' + p.pts + ' б.</option>')) + '</select><div class="row" style="margin-top:12px"><button class="btn primary" id="prGo"' + (B.pb ? '' : ' disabled') + '>Составить лист</button></div></section>';
  } else {
    h += '<section class="card"><b>Brevet blanc целиком</b><p class="muted">Partie 1 (9 вопросов, 20 минут, без калькулятора) и Partie 2 (4 задачи, 1 ч 40). На бумаге — как настоящий вариант; 2 балла за оформление ставите вы.</p><div class="row"><button class="btn primary" id="prGo">Составить вариант</button></div></section>';
  }
  const y = window.scrollY; shell(h); if (B.keepY) window.scrollTo(0, y); B.keepY = false;
  const again = () => { B.keepY = true; viewPrint(); };
  $$('[data-tab]').forEach(b => b.onclick = () => { B.tab = b.dataset.tab; viewPrint(); });
  $$('[data-n]').forEach(b => b.onclick = () => { B.n = +b.dataset.n; again(); });
  $$('[data-per]').forEach(b => b.onclick = () => { B.per = +b.dataset.per; again(); });
  $$('[data-mix]').forEach(b => b.onclick = () => { const id = b.dataset.mix; if (B.mix[id]) delete B.mix[id]; else B.mix[id] = 1; again(); });
  $$('details[data-ch]').forEach(d => d.addEventListener('toggle', () => { if (d.open) B.open = d.dataset.ch; else if (B.open === d.dataset.ch) B.open = null; }));
  if ($('#prTopic')) $('#prTopic').onchange = e => { B.topic = e.target.value; again(); };
  if ($('#prPb')) $('#prPb').onchange = e => { B.pb = e.target.value; again(); };
  if ($('#prWeak')) $('#prWeak').onclick = () => { const ws = DB ? TOPICS.filter(t => isWeak(t.id) || (DB.sk[t.id] && DB.sk[t.id].a && !DB.sk[t.id].m)) : []; if (!ws.length) return toast('Тем с ошибками сейчас нет'); B.mix = {}; ws.slice(0, 8).forEach(t => { B.mix[t.id] = 1; }); again(); };
  $('#prGo').onclick = () => {
    let kind = B.tab === 'm' ? 'f' : B.tab, items = [];
    if (B.tab === 'f') { const t = TP(B.topic); if (!t) return; items = prTopicItems(t, B.n); }
    else if (B.tab === 'm') { items = shuffle(Object.keys(B.mix).map(TP).filter(Boolean).flatMap(t => prTopicItems(t, B.per))); }
    else if (B.tab === 'a') items = pickShort(9, P1_PLAN, isShort);
    else if (B.tab === 'p') { if (!PB(B.pb)) return; items = [{ pid: B.pb, seed: rnd() }]; }
    else items = pickShort(9, P1_PLAN, isShort).concat(pickProblems(4));
    if (!items.length) return toast('Не из чего составить лист');
    go('#/pr/' + prSpec(kind, items));
  };
}
ROUTES.push([/^#\/pr$/, () => viewPrint()], [/^#\/pr\/(.+)$/, m => viewSheet(m[1])]);
