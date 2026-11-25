// Checks every topic, problem, fiche and dictionary entry of the content.
// node tests/content.js                 — all content files
// node tests/content.js geo stats       — only files whose name contains one of the words
// node tests/content.js --seeds=200     — more random numbers per question type (default 40)
// node tests/content.js --show=nc.frac  — print a few generated questions of one topic or problem (for reading them)
const load = require('./load');

const args = process.argv.slice(2);
const SEEDS = +((args.find((a) => a.startsWith('--seeds=')) || '').split('=')[1] || 40);
const SHOW = (args.find((a) => a.startsWith('--show=')) || '').split('=')[1];
const only = args.filter((a) => !a.startsWith('--'));
const A = load(only);

const errs = [];
const err = (where, msg) => { errs.push(where + ': ' + msg); };
const BAD = /\b(undefined|NaN|Infinity)\b|\[object |\bnull\b/;
const CYR = /[А-Яа-яЁё]/;
const KINDS = new Set(['num', 'expr', 'sol', 'mcq', 'multi', 'list', 'ratio', 'dur', 'time', 'order', 'subj']);

function katexOk(where, t) {
  try { A.katex.renderToString(t, { throwOnError: true, strict: false }); } catch (e) { err(where, 'KaTeX: ' + e.message.slice(0, 140) + ' in «' + t.slice(0, 80) + '»'); }
}
function textOk(where, s, lang) {
  if (typeof s !== 'string' || !s.trim()) { err(where, 'empty text'); return; }
  if (BAD.test(s.replace(/<svg[\s\S]*?<\/svg>/g, ''))) err(where, 'bad word in «' + s.slice(0, 90) + '»');
  if ((s.split('$').length - 1) % 2) err(where, 'odd number of $ in «' + s.slice(0, 90) + '»');
  let tx = [];
  try { tx = A.texOfText(s); } catch (e) { err(where, e.message); }
  tx.forEach((t) => katexOk(where, t));
  if (lang === 'fr' && CYR.test(s.replace(/\$[^$]*\$/g, ''))) err(where, 'Cyrillic letters in the French text «' + s.slice(0, 90) + '»');
  if (lang === 'ru' && !CYR.test(s) && /[a-zA-Z]{4,}/.test(s.replace(/\$[^$]*\$/g, '').replace(/«[^»]*»/g, ''))) err(where, 'the Russian text looks untranslated «' + s.slice(0, 90) + '»');
}
function biOk(where, o, needRu) {
  if (!o || typeof o !== 'object') { err(where, 'not a text object'); return; }
  textOk(where + '.fr', o.fr, needRu ? 'fr' : null);
  textOk(where + '.ru', o.ru, needRu ? 'ru' : null);
}
function formulaOk(where, m) {
  try { katexOk(where, A.mi(m, true)); } catch (e) { err(where, e.message); }
}
function figOk(where, f) {
  if (typeof f !== 'string' || f[0] !== '<') { err(where, 'figure must be an html/svg string'); return; }
  if (/<script|on\w+=/i.test(f)) err(where, 'no scripts or handlers in figures');
  const o = (f.match(/<svg\b/g) || []).length, c = (f.match(/<\/svg>/g) || []).length;
  if (o !== c) err(where, 'unbalanced <svg>');
  if (BAD.test(f.replace(/<[^>]+>/g, ' '))) err(where, 'bad word in the figure');
  if (/<svg\b/.test(f) && !/viewBox=/.test(f)) err(where, 'svg without viewBox');
}
function specOk(where, sp) {
  if (!sp || !KINDS.has(sp.k)) { err(where, 'unknown answer kind ' + (sp && sp.k)); return; }
  if (sp.k === 'multi') { sp.parts.forEach((p, i) => { if (p.lab) biOk(where + '.lab' + i, p.lab, false); specOk(where + '.part' + i, p.spec); }); return; }
  if (sp.k === 'mcq') {
    if (!Array.isArray(sp.opts) || sp.opts.length < 2) err(where, 'mcq needs ≥ 2 options');
    if (!(sp.c >= 0 && sp.c < sp.opts.length)) err(where, 'mcq: bad index of the right option');
    const seen = new Set(); sp.opts.forEach((o, i) => { biOk(where + '.opt' + i, o, false); const k = o.fr.replace(/\s+/g, ''); if (seen.has(k)) err(where, 'two equal options «' + o.fr + '»'); seen.add(k); });
  }
  if (sp.k === 'order') { if (!Array.isArray(sp.items) || sp.items.length < 3) err(where, 'order needs ≥ 3 steps'); sp.items.forEach((o, i) => biOk(where + '.step' + i, o, true)); }
  if (sp.k !== 'mcq' && sp.k !== 'order') {
    if (sp.key == null || BAD.test(String(sp.key))) err(where, 'bad key ' + sp.key);
  }
  let g;
  try { g = A.grade(sp, A.keyInput(sp)); } catch (e) { err(where, 'checker crashed on the key: ' + e.message); return; }
  if (!g.ok) err(where, 'the key is not accepted: ' + A.keyInput(sp) + ' → ' + JSON.stringify(g.msg));
  if (sp.help && !sp.help.ru) err(where, 'help must be GM(\'\', \'…\') or {ru}');
  if (sp.unit && typeof sp.unit !== 'string') err(where, 'unit must be a string');
}
function itemOk(where, it, needSol = true) {
  biOk(where + '.q', it.q, true);
  if (it.m != null) formulaOk(where + '.m', it.m);
  if (it.tex != null) katexOk(where + '.tex', it.tex);
  if (it.fig != null) figOk(where + '.fig', it.fig);
  specOk(where + '.ans', it.ans);
  if (needSol && (!Array.isArray(it.sol) || !it.sol.length)) err(where, 'no solution steps');
  (it.sol || []).forEach((s, i) => {
    if (s.ru != null && s.ru !== '') textOk(where + '.sol' + i, s.ru, null); else if (!s.m && !s.tex && !s.svg) err(where + '.sol' + i, 'empty step');
    if (s.ru && /[a-zA-Z]{5,}/.test(s.ru.replace(/\$[^$]*\$/g, '').replace(/«[^»]*»/g, '')) && !CYR.test(s.ru)) err(where + '.sol' + i, 'steps are written in Russian');
    if (s.m) formulaOk(where + '.sol' + i + '.m', s.m);
    if (s.tex) katexOk(where + '.sol' + i + '.tex', s.tex);
    if (s.svg) figOk(where + '.sol' + i + '.svg', s.svg);
  });
}
const sig = (it) => JSON.stringify([it.q && it.q.fr, it.m, it.tex, it.ans && (it.ans.key || it.ans.opts && it.ans.opts.map((o) => o.fr))]);

const ids = new Set();
const t0 = Date.now();
let nItems = 0;
A.CHAPTERS.forEach((c, i) => { if (!c.id || !c.ru || !c.fr) err('chapter ' + c.id, 'needs id, ru, fr'); if (A.CHAPTERS.findIndex((x) => x.id === c.id) !== i) err('chapter ' + c.id, 'declared twice (chapters live in 00-base.js only)'); });
const chIds = new Set(A.CHAPTERS.map((c) => c.id));
for (const tp of A.TOPICS) {
  const W = 'topic ' + tp.id;
  if (ids.has(tp.id)) err(W, 'duplicate id'); ids.add(tp.id);
  if (!chIds.has(tp.ch)) err(W, 'unknown chapter ' + tp.ch);
  if (!tp.ru || !tp.fr) err(W, 'needs ru and fr names');
  if (![1, 2, 3].includes(tp.lvl)) err(W, 'lvl must be 1, 2 or 3');
  if (!(tp.variants >= 1)) err(W, 'variants ≥ 1');
  if (!tp.hints.length || tp.hints.length > 3) err(W, '1–3 hints');
  tp.hints.forEach((h, i) => textOk(W + '.hint' + i, h, 'ru'));
  for (let vi = 0; vi < tp.variants; vi++) {
    const seen = new Set(); let slow = 0;
    for (let s = 1; s <= SEEDS; s++) {
      let it; const tt = Date.now();
      try { it = tp.gen(A.mkRng(s * 7919 + vi), vi); } catch (e) { err(W + ' v' + vi + ' seed ' + s, 'generator crashed: ' + e.message); break; }
      slow = Math.max(slow, Date.now() - tt);
      itemOk(W + ' v' + vi + ' s' + s, it); seen.add(sig(it)); nItems++;
    }
    if (SEEDS >= 20 && seen.size < Math.min(6, SEEDS / 4)) err(W + ' v' + vi, 'too few different questions: ' + seen.size);
    if (slow > 50) err(W + ' v' + vi, 'generator is slow: ' + slow + ' ms');
  }
}
for (const pb of A.PROBLEMS) {
  const W = 'probleme ' + pb.id;
  if (ids.has(pb.id)) err(W, 'duplicate id'); ids.add(pb.id);
  if (!chIds.has(pb.ch)) err(W, 'unknown chapter ' + pb.ch);
  if (!pb.ru || !pb.fr || !pb.src) err(W, 'needs ru, fr and src');
  const seen = new Set();
  for (let s = 1; s <= Math.max(10, SEEDS / 2); s++) {
    let p;
    try { p = pb.gen(A.mkRng(s * 104729)); } catch (e) { err(W + ' seed ' + s, 'generator crashed: ' + e.message); break; }
    if (p.ctx) biOk(W + '.ctx', p.ctx, true);
    if (p.fig != null) figOk(W + '.fig', p.fig);
    if (!Array.isArray(p.qs) || p.qs.length < 2) err(W, 'a problem needs ≥ 2 questions');
    p.qs.forEach((q, i) => { itemOk(W + ' s' + s + ' q' + (i + 1), q); nItems++; });
    seen.add(JSON.stringify(p.qs.map(sig)));
  }
  if (seen.size < 3) err(W, 'numbers do not change between variants');
}
A.FICHES.forEach((f, i) => {
  const W = 'fiche ' + (f.id || i);
  if (!chIds.has(f.ch)) err(W, 'unknown chapter ' + f.ch);
  if (!f.ru || !f.fr) err(W, 'needs ru and fr titles');
  (f.body || []).forEach((b, j) => textOk(W + '.body' + j, b, null));
  (f.ex || []).forEach((e, j) => { textOk(W + '.ex' + j, e[0], null); if (e[1]) formulaOk(W + '.ex' + j + '.m', e[1]); });
});
const gl = new Set();
A.GLOSS.forEach((g) => { if (!g.fr || !g.ru) err('gloss', 'empty entry'); if (gl.has(g.fr.toLowerCase())) err('gloss', 'duplicate «' + g.fr + '»'); gl.add(g.fr.toLowerCase()); if (CYR.test(g.fr)) err('gloss «' + g.fr + '»', 'French part has Cyrillic'); });

if (SHOW) {
  const tp = A.TOPICS.find((t) => t.id === SHOW), pb = A.PROBLEMS.find((t) => t.id === SHOW);
  const strip = (o) => JSON.stringify(o, (k, v) => (typeof v === 'string' && v.startsWith('<svg') ? '<svg…>' : v), 1);
  if (tp) for (let vi = 0; vi < tp.variants; vi++) console.log('--- v' + vi + '\n' + strip(tp.gen(A.mkRng(vi + 3), vi)));
  if (pb) console.log(strip(pb.gen(A.mkRng(5))));
}

const byCh = {};
A.TOPICS.forEach((t) => { byCh[t.ch] = byCh[t.ch] || [0, 0]; byCh[t.ch][0]++; });
A.PROBLEMS.forEach((t) => { byCh[t.ch] = byCh[t.ch] || [0, 0]; byCh[t.ch][1]++; });
console.log('Файлы: ' + A.files.join(', '));
console.log('Тем: ' + A.TOPICS.length + ', типов заданий: ' + A.TOPICS.reduce((s, t) => s + t.variants, 0) + ', задач Partie 2: ' + A.PROBLEMS.length + ', шпаргалок: ' + A.FICHES.length + ', слов в словаре: ' + A.GLOSS.length);
console.log('По главам (темы/задачи): ' + Object.entries(byCh).map(([k, v]) => k + ' ' + v[0] + '/' + v[1]).join(' · '));
console.log('Проверено вопросов: ' + nItems + ' за ' + ((Date.now() - t0) / 1000).toFixed(1) + ' с');
if (errs.length) {
  const uniq = [...new Set(errs)];
  console.log('\nОШИБКИ (' + uniq.length + '):'); uniq.slice(0, 60).forEach((e) => console.log('  ✗ ' + e));
  if (uniq.length > 60) console.log('  … и ещё ' + (uniq.length - 60));
  process.exit(1);
}
console.log('Ошибок нет ✓');
