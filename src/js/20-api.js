/* ===================== CONTENT API · Brevet =====================
   Everything the app teaches is declared with the functions in this file:
     chapter({...})      — a domain of the programme (Nombres et calculs, Géométrie…)
     topic({...})        — a trainer: one skill, endless generated questions (Partie 1 style)
     probleme({...})     — a Partie 2 exercise: a context and several questions «по мотивам» a real sujet
     fiche({...})        — a cheat sheet for a chapter (Russian, with the exact French wording to write on the exam)
     gloss(fr, ru)       — an entry of the French–Russian maths dictionary (terms, with a note)
     lex / lexf / lexn   — the word lexicon behind «нажми на слово — увидишь перевод» (src/content/lex.js)
     automatisme({...})  — an item of the ministry's list of automatismes, linked to the topics that train it

   Languages
     L(fr, ru) — a text of the question: French as on the exam, Russian for «Перевод».
     Hints, solution steps and fiches are Russian (the interface language); French terms go in «…».
     redac — how to write the answer on the exam, in French (Partie 2 questions).
   Formulas inside texts
     $…$   — formula in input syntax: $3/4$, $x^2+1$, $√2$, $2*10^3$, $3.5$ (shown as 3,5), $a=b$.
     $$…$$ — raw TeX for the rare cases input syntax cannot express.
   Numbers in plain text: nf(3.5) → «3,5», nf(45000) → «45 000», eur(12.5) → «12,50 €».
*/
const CHAPTERS = [], TOPICS = [], PROBLEMS = [], FICHES = [], GLOSS = [], LEXI = [], AUTOS = [];
const L = (fr, ru) => ({ fr, ru });
/* a text that is the same in both languages (a formula, a number) */
const bi = t => (t && typeof t === 'object' ? t : { fr: String(t), ru: String(t) });

/* chapter({ id: 'nc', ru: 'Числа и вычисления', fr: 'Nombres et calculs' }) */
function chapter(def) { CHAPTERS.push(def); return def; }

/* --- normalising what generators return --- */
function fixStep(s) {
  if (typeof s === 'string') return { ru: s };
  if (Array.isArray(s)) { const o = { ru: s[0] || '', m: s[1] }; if (s[2]) o.u = s[2]; return o; }
  if (s && s.t != null) { const o = { ru: s.t }; if (s.tex) o.tex = s.tex; if (s.svg) o.svg = s.svg; if (s.m) o.m = s.m; return o; }
  return s;
}
function fixSpec(sp) {
  if (!sp) return sp;
  if (sp.k === 'mcq') sp.opts = sp.opts.map(bi);
  if (sp.k === 'order') sp.items = sp.items.map(bi);
  if (sp.k === 'multi') sp.parts.forEach(p => { p.lab = p.lab == null ? null : bi(p.lab); fixSpec(p.spec); });
  return sp;
}
function fixQ(it) { it.q = bi(it.q); it.sol = (it.sol || []).map(fixStep); fixSpec(it.ans); return it; }
/* redac: the model write-up in French — a string or an array of lines. For «put the steps in order» and
   «choose the justification» questions it is the right order / the right option, so authors need not repeat it. */
function fixRedac(q) {
  if (typeof q.redac === 'string') q.redac = [q.redac];
  if (!Array.isArray(q.redac) || !q.redac.length) {
    if (q.ans.k === 'order') q.redac = q.ans.items.map(o => o.fr);
    else if (q.ans.k === 'mcq' && q.red) q.redac = [q.ans.opts[q.ans.c].fr];
    else q.redac = [];
  }
  return q;
}

/* topic({ id: 'nc.frac-add', ch: 'nc', ru: 'Сложение дробей', fr: 'Additionner des fractions',
           lvl: 1 | 2,           — 1 база (пробелы 5e–4e), 2 уровень бревета. Сложнее экзамена в приложении ничего нет.
           calc: false,          — false: без калькулятора (Partie 1), true: с калькулятором
           variants: 3,          — сколько типов заданий, gen получает vi = 0 … variants−1
           hints: ['…', '…'],    — 1–3 подсказки по-русски, от идеи к почти решению
           gen(r, vi) { return { q: L(fr, ru), m | tex | fig, ans, sol: [...] }; } }) */
function topic(def) {
  def.kind = 'topic'; def.hints = def.hints || []; def.lvl = def.lvl || 2; def.calc = !!def.calc;
  const g = def.gen;
  def.gen = function (r, vi) { const it = fixQ(g.call(def, r, vi)); if (it.calc == null) it.calc = def.calc; return it; };
  TOPICS.push(def); return def;
}

/* probleme({ id: 'p2.salaires', ch: 'st', ru: 'Зарплаты в компании', fr: 'Salaires dans une entreprise',
              src: 'Sujet de référence 2027 n°1 · exercice 1', pts: 4, lvl: 2,
              gen(r) { return { ctx: L(fr, ru), fig?, qs: [ { q: L(fr, ru), m?, tex?, fig?, ans, sol, redac, pts?, red? }, … ] }; } })
   sol   — the explanation in Russian: why each step is right.
   redac — «как записать на экзамене»: the model answer in French, as a pupil would write it on the copie
           (a string or an array of lines, formulas in $…$): the property used, the calculation, the conclusion sentence.
           Not needed for ORD questions and for MQ questions with red: true — there it is taken from the answer.
   red: true marks a «rédaction» question (choose the justification / put the steps in order). */
function probleme(def) {
  def.kind = 'prob'; def.lvl = def.lvl || 2; def.calc = def.calc !== false;
  const g = def.gen;
  def.gen = function (r) {
    const p = g.call(def, r); p.ctx = p.ctx == null ? null : bi(p.ctx);
    p.qs = p.qs.map(q => { fixQ(q); fixRedac(q); if (q.calc == null) q.calc = def.calc; if (!q.pts) q.pts = 1; return q; });
    return p;
  };
  PROBLEMS.push(def); return def;
}

/* fiche({ ch: 'nc', id: 'nc.fractions', ru: 'Дроби', fr: 'Les fractions',
            body: ['абзац с $3/4$', …],            — объяснение по-русски
            ex?: [['пример', 'формула'], …],
            frs?: ['Si un triangle est rectangle, alors …', …] })   — точные французские формулировки: определения, теоремы,
                                                                      фразы, которые нужно уметь написать на экзамене */
function fiche(def) { FICHES.push(def); return def; }
/* gloss('la médiane', 'медиана', 'значение посередине упорядоченного ряда') */
function gloss(fr, ru, note) { GLOSS.push({ fr, ru, note: note || '' }); }

/* ---------- the word lexicon: every French word of every statement has an entry (tests/words.js checks it) ----------
   lex('calculer|calcule|calculez|calculé', 'вычислить')   — forms as they occur in the texts, the first is the dictionary form
   lex('en déduire', 'вывести из предыдущего результата')  — an expression of several words wins over its words
   lexf('le|la|les|l\'', 'артикль')                         — function words and units: translated on tap, never saved to «Мои слова»
   lexn('Paris|Lyon|Marseille')                             — proper nouns (first names from PRENOMS_* are known already) */
function lex(forms, ru) { LEXI.push({ f: forms, ru, k: 0 }); }
function lexf(forms, ru) { LEXI.push({ f: forms, ru, k: 1 }); }
function lexn(forms) { LEXI.push({ f: forms, ru: '', k: 2 }); }

/* automatisme({ n: 1, dom: 'nc', fr: 'short quote of the official wording', ru: 'по-русски', topics: ['nc.frac-ecritures', …] })
   — the ministry's «liste indicative d'automatismes» (octobre 2025), item by item */
function automatisme(def) { AUTOS.push(def); return def; }

/* ===================== answers ===================== */
const N = (key, o) => Object.assign({ k: 'num', key: String(key) }, o || {});                                   /* a number; o: { unit: 'cm²', forms: ['frac'], dec: true } */
const FRA = (f, o) => N(Fr.str(f), Object.assign({ forms: ['frac'], show: tF(f) }, o || {}));                      /* a fraction in lowest terms */
const MIX = (f, o) => N(mixStr(f), Object.assign({ forms: f.d === 1 || Math.abs(f.n) < f.d ? [] : ['mixed'], show: tFm(f) }, o || {}));
const XP = (key, o) => Object.assign({ k: 'expr', key: String(key) }, o || {});                                   /* an expression; o: { forms: ['expanded'] | ['factorised'] } */
const POW = (base, n) => ({ k: 'expr', key: base + '^(' + n + ')', forms: ['powOf'], base, show: base + '^{' + n + '}', help: GM('', 'Одна степень числа ' + base + ', например <code>' + base + '^5</code> или <code>' + base + '^-2</code>') });
const SOL = (key, o) => Object.assign({ k: 'sol', key: String(key), v: 'x', eqn: true }, o || {});               /* solutions of an equation: '3' or '-2, 5' */
const LIST = key => ({ k: 'list', key: String(key) });                                                           /* numbers in any order: '1,2,4' */
const RATIO = (key, o) => Object.assign({ k: 'ratio', key: String(key) }, o || {});
const MQ = (r, opts, c = 0) => mcqSh(r, opts, c);                                                                /* multiple choice, options shuffled; c = index of the right one in opts */
const MQF = (opts, c) => ({ k: 'mcq', opts, c });                                                                /* multiple choice, fixed order (A, B, C, D as printed) */
const TF = isTrue => ({ k: 'mcq', opts: [L('Vrai', 'Верно'), L('Faux', 'Неверно')], c: isTrue ? 0 : 1 });       /* vrai / faux */
const multi = (...ps) => ({ k: 'multi', parts: ps.map(p => ({ lab: p[0], spec: p[1] })) });                      /* several fields: multi(['$a$ =', N(3)], ['$b$ =', N(5)]) */
/* steps of a solution (in the right order) that the student puts in order; shown shuffled */
function ORD(r, steps) { let perm; do perm = r.sh(steps.map((_, i) => i)); while (steps.length > 1 && perm.every((v, i) => v === i)); return { k: 'order', items: steps, perm }; }

/* ===================== numbers and TeX ===================== */
const tfr = (n, d) => (n < 0 ? '-' : '') + '\\dfrac{' + Math.abs(n) + '}{' + d + '}';
const tmx = (w, n, d) => (w < 0 ? '-' : '') + Math.abs(w) + '\\tfrac{' + n + '}{' + d + '}';
const tF = f => f.d === 1 ? String(f.n) : tfr(f.n, f.d);
function tFm(f) { if (f.d === 1) return String(f.n); const a = Math.abs(f.n), w = Math.floor(a / f.d); return w ? tmx(f.n < 0 ? -w : w, a % f.d, f.d) : tfr(f.n, f.d); }
const mixStr = f => { if (f.d === 1) return String(f.n); const a = Math.abs(f.n), w = Math.floor(a / f.d); return (f.n < 0 ? '-' : '') + (w ? w + ' ' + (a % f.d) + '/' + f.d : a + '/' + f.d); };
const mixF = (w, n, d) => F(w * d + n, d);
const fx = (v, k = 6) => String(+(+v).toFixed(k));                         /* 0.30000000000000004 → '0.3' (input syntax, dot) */
const r2 = v => +(+v).toFixed(2);
/* number for plain text: decimal comma, groups of three from 10 000 on, real minus sign */
function nf(v, k) {
  const x = k == null ? +(+v).toFixed(10) : (+v).toFixed(k);
  const t = String(x); const neg = t[0] === '-'; const [i, d] = t.replace('-', '').split('.');
  const ii = i.length < 5 ? i : i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (neg ? '−' : '') + ii + (d ? ',' + d : '');
}
const sg = v => nf(v);
const eur = v => nf(v, Number.isInteger(+v) ? 0 : 2) + ' €';               /* 12,50 € */
const big = v => nf(v);
const dec = (n, k) => { const neg = n < 0; let s = String(Math.abs(n)).padStart(k + 1, '0'); if (k > 0) s = s.slice(0, -k) + '.' + s.slice(-k); return (neg ? '-' : '') + s; };
const decT = (n, k) => { let s = dec(n, k); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; };
const lcm2 = (a, b) => a / gcd(a, b) * b;
const isPrimeN = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const factorsOf = n => { const o = []; for (let i = 1; i <= n; i++) if (n % i === 0) o.push(i); return o; };
const pfac = n => { const out = []; let p = 2; while (n > 1) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) out.push([p, e]); p++; } return out; };
const pfStr = fs => fs.map(([p, e]) => e === 1 ? String(p) : p + '^' + e).join('*');
const pfTex = fs => fs.map(([p, e]) => e === 1 ? String(p) : p + '^{' + e + '}').join(' \\times ');

/* --- people in word problems --- */
const PRENOMS_F = ['Léa', 'Inès', 'Chloé', 'Emma', 'Jade', 'Manon', 'Camille', 'Zoé', 'Lina', 'Sarah', 'Louise', 'Alice'];
const PRENOMS_M = ['Hugo', 'Lucas', 'Nathan', 'Tom', 'Adam', 'Louis', 'Noah', 'Paul', 'Enzo', 'Théo', 'Malik', 'Yanis'];

/* ===================== small pictures =====================
   Figures are inline SVG with class="fig". Use these classes, they follow the light and dark themes:
     fl — main line · fl2 — thin grey line · fdash — dashed line · fhl — highlighted line (accent)
     ffill — light fill · fpt — point (filled dot) · ftx — label text · ftm — small grey text
     fang — angle mark · fgrid — grid · fax — axes · fcurve — graph of a function · fbar — bar of a chart
     fc1 … fc6 — six fill colours for pie charts and legends
   Keep viewBox about 340 wide; text 14–16 units high so it stays readable on a phone. */
function svgFig(w, h, inner, label) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="fig" role="img" aria-label="' + (label || 'figure') + '">' + inner + '</svg>'; }
/* html table: rows of cells; the first row is a header (cls 'nohead' — no header, 'side' — first column is a header too) */
function tbl(rows, cls) { return '<table class="pblk tx' + (cls ? ' ' + cls : '') + '">' + rows.map((row, i) => '<tr>' + row.map((c, j) => (i === 0 && cls !== 'nohead') || (j === 0 && cls === 'side') ? '<th>' + c + '</th>' : '<td>' + c + '</td>').join('') + '</tr>').join('') + '</table>'; }
