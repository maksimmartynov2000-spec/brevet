/* ===================== PARTIE 2 · problèmes D : session 2026 (Antilles-Guyane, Centres étrangers, Asie, Amérique du Nord, Polynésie) =====================
   Each problem follows a real DNB exercise (src): the same story and the same chain of reasoning, new numbers on every run.
   Top-level names of this file start with pd. Sets of numbers that would make an answer ambiguous are left out when the lists
   are built: a value too close to a rounding boundary, a rounded key that ends with a zero, an answer that changes when the
   previous (rounded) answer is used instead of the exact value, two answers of one problem that are the same number. */

/* ---------- numbers ---------- */
const pdRd = (v, k = 0) => { const p = Math.pow(10, k); return Math.round(v * p + (v >= 0 ? 1e-7 : -1e-7)) / p; };   /* round half up (2.45 → 2.5) */
const pdK = (v, k) => pdRd(v, k).toFixed(k);                       /* key of a rounded answer: '8.7' */
const pdS = (v, k) => nf(pdRd(v, k), k);                           /* the same number for a text: '8,7' */
const pdNR = (v, k, unit) => N(pdK(v, k), unit ? { dp: k, unit } : { dp: k });
const pdNE = (v, unit) => N(fx(v), unit ? { unit } : {});
const pdIsD = (v, k) => { const x = v * Math.pow(10, k); return Math.abs(x - Math.round(x)) < 1e-6; };   /* v has at most k decimals */
/* v is too close to a rounding boundary (…5) at k decimals: a slightly different way of calculating could give another answer */
const pdTie = (v, k, eps = 0.06) => { const x = Math.abs(v) * Math.pow(10, k); return Math.abs(x - Math.floor(x) - 0.5) < eps; };
const pdZero = (v, k) => k > 0 && pdK(v, k).endsWith('0');         /* the rounded key would end with a zero: «26,0» */
const pdBad = (v, k) => pdTie(v, k) || pdZero(v, k);
/* Russian noun after a number: pdRu(22, 'месяц', 'месяца', 'месяцев') → 'месяца' */
const pdRu = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many);
/* pieces of TeX for $$…$$ */
const pdT = v => { const [i, d] = fx(v).split('.'); return (i.replace('-', '').length > 4 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : i) + (d ? '{,}' + d : ''); };   /* a number: 4{,}5 */
const pdTk = (v, k) => pdK(v, k).replace('.', '{,}');             /* a rounded number with k decimals: 8{,}7 */
const pdDf = (a, b) => '\\dfrac{' + a + '}{' + b + '}';
const pdAng = s => '$$\\widehat{' + s + '}$$';                    /* the angle ABC */
const pdAngEq = (s, v) => '$$\\widehat{' + s + '}=' + v + '$$';   /* «ABC = …» in one formula (no line break inside) */
const pdDg = v => String(v).replace('.', '{,}') + '^{\\circ}';
/* several equalities on one line (the line may wrap between them): '2+4=6;6*3=18' → '$2+4=6$ ; $6*3=18$' */
const pdEqs = s => String(s).split(';').map(e => '$' + e + '$').join(' ; ');
const pdEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/* ---------- French typography in plain text (not inside $…$): no line break before « ? ! : ; » and between a number and its unit ---------- */
const PD_UNITS = 'g/cm³|cm³|cm²|cm|mm|m³|m²|m|km|kg|g|€|%|°|min|h|s|pas|mois|г/см³|см³|см²|см|мм|м³|м²|м|км|кг|г|мин|ч|с';
const PD_TYU = new RegExp('(\\d) (?=(?:' + PD_UNITS + ')(?![A-Za-zÀ-ÿА-Яа-яЁё0-9²³/]))', 'g');
function pdTy(s) {
  return String(s).split(/(\$\$[^$]*\$\$|\$[^$]*\$)/).map((p, i) => i % 2 ? p : p.replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« ').replace(PD_TYU, '$1 ').replace(/(\d) (?=\d{3}(?!\d))/g, '$1 ')).join('');
}
const pdTyT = o => (o && typeof o === 'object' && 'fr' in o ? { fr: pdTy(o.fr), ru: pdTy(o.ru) } : typeof o === 'string' ? pdTy(o) : o);
function pdTyA(a) { if (!a) return a; if (a.k === 'mcq') a.opts = a.opts.map(pdTyT); if (a.k === 'order') a.items = a.items.map(pdTyT); if (a.k === 'multi') a.parts.forEach(p => { if (p.lab) p.lab = pdTyT(p.lab); pdTyA(p.spec); }); return a; }
function pdTyS(s) { if (typeof s === 'string') return pdTy(s); if (Array.isArray(s)) return [pdTy(s[0] || '')].concat(s.slice(1)); if (s && s.t != null) return Object.assign({}, s, { t: pdTy(s.t) }); return s; }
/* probleme() with the typography applied to every text the generator returns */
function pdProb(def) {
  const g = def.gen;
  def.gen = function (r) { const p = g.call(this, r); if (p.ctx) p.ctx = pdTyT(p.ctx); p.qs.forEach(q => { q.q = pdTyT(q.q); pdTyA(q.ans); q.sol = (q.sol || []).map(pdTyS); if (q.redac) q.redac = [].concat(q.redac).map(pdTy); }); return p; };
  return probleme(def);
}

/* ---------- drawing ---------- */
const pdC = v => +(+v).toFixed(1);
const pdXY = p => pdC(p[0]) + ',' + pdC(p[1]);
function pdLn(a, b, c) { return '<line x1="' + pdC(a[0]) + '" y1="' + pdC(a[1]) + '" x2="' + pdC(b[0]) + '" y2="' + pdC(b[1]) + '" class="' + (c || 'fl') + '"/>'; }
function pdPl(ps, c, closed) { return '<' + (closed ? 'polygon' : 'polyline') + ' points="' + ps.map(pdXY).join(' ') + '" class="' + (c || 'fl') + '"' + (/ffill|fc\d|fbar/.test(c || '') ? '' : ' fill="none"') + '/>'; }
function pdTx(p, s, c, a) { return '<text x="' + pdC(p[0]) + '" y="' + pdC(p[1]) + '" class="' + (c || 'ftx') + '" text-anchor="' + (a || 'middle') + '">' + s + '</text>'; }
function pdDot(p) { return '<circle cx="' + pdC(p[0]) + '" cy="' + pdC(p[1]) + '" r="2.6" class="fpt"/>'; }
const pdUnit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1; return [dx / n, dy / n]; };
const pdAdd = (p, u, s) => [p[0] + u[0] * s, p[1] + u[1] * s];
const pdMid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const pdDir = (x, y) => { const n = Math.hypot(x, y) || 1; return { dir: [x / n, y / n] }; };
/* label of a point, pushed away from the point ctr (or in the direction ctr.dir) */
function pdLab(p, s, ctr, d) { const u = ctr.dir ? ctr.dir : pdUnit(ctr, p); return pdTx([p[0] + u[0] * (d || 14), p[1] + u[1] * (d || 14) + 5], s); }
/* right-angle mark at p between the directions to a and b */
function pdRA(p, a, b, s) { s = s || 9; const u = pdUnit(p, a), v = pdUnit(p, b), p1 = pdAdd(p, u, s), p3 = pdAdd(p, v, s), p2 = pdAdd(p1, v, s); return '<polyline points="' + [p1, p2, p3].map(pdXY).join(' ') + '" class="fang" fill="none"/>'; }
/* arc marking the angle at p between the directions to a and b */
function pdArc(p, a, b, r) { const u = pdUnit(p, a), v = pdUnit(p, b), s = pdAdd(p, u, r), e = pdAdd(p, v, r), cr = u[0] * v[1] - u[1] * v[0]; return '<path d="M' + pdXY(s) + ' A' + r + ',' + r + ' 0 0 ' + (cr > 0 ? 1 : 0) + ' ' + pdXY(e) + '" class="fang" fill="none"/>'; }
/* n ticks (equal lengths) across the middle of [ab] */
function pdTick(a, b, n) { n = n || 1; const m = pdMid(a, b), u = pdUnit(a, b), v = [-u[1], u[0]]; let o = ''; for (let i = 0; i < n; i++) { const c = pdAdd(m, u, (i - (n - 1) / 2) * 4); o += pdLn(pdAdd(c, v, -5), pdAdd(c, v, 5)); } return o; }
/* a text written next to the middle of [ab], on the side away from ctr */
function pdLen(a, b, s, ctr, d) { const m = pdMid(a, b), u = pdUnit(a, b); let v = [-u[1], u[0]]; if ((m[0] - ctr[0]) * v[0] + (m[1] - ctr[1]) * v[1] < 0) v = [-v[0], -v[1]]; return pdTx([m[0] + v[0] * (d || 14), m[1] + v[1] * (d || 14) + 5], s); }
/* maps maths coordinates (y up) into a w × h box with a margin: returns p → [x, y] in svg coordinates */
function pdFit(pts, w, h, pad, x0) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), xa = Math.min(...xs), xb = Math.max(...xs), ya = Math.min(...ys), yb = Math.max(...ys);
  const k = Math.min((w - 2 * pad) / ((xb - xa) || 1), (h - 2 * pad) / ((yb - ya) || 1)), ox = (x0 || 0) + (w - k * (xb - xa)) / 2, oy = (h - k * (yb - ya)) / 2;
  return p => [ox + (p[0] - xa) * k, h - oy - (p[1] - ya) * k];
}
function pdArrow(x1, y1, x2, y2) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 8, p = t => pdC(x2 - h * Math.cos(a + t)) + ',' + pdC(y2 - h * Math.sin(a + t));
  return '<line class="fl" x1="' + pdC(x1) + '" y1="' + pdC(y1) + '" x2="' + pdC(x2 - 6 * Math.cos(a)) + '" y2="' + pdC(y2 - 6 * Math.sin(a)) + '"/><polygon class="fpt" points="' + pdC(x2) + ',' + pdC(y2) + ' ' + p(0.42) + ' ' + p(-0.42) + '"/>';
}
/* a spreadsheet: rows of cells; the column letters and the row numbers are added (cells of the first column are headers too) */
function pdSheet(rows) {
  const cols = Math.max(...rows.map(r => r.length));
  return '<table class="pblk tx side"><tr><th></th>' + 'ABCDEFGHIJ'.slice(0, cols).split('').map(c => '<th>' + c + '</th>').join('') + '</tr>' +
    rows.map((row, i) => '<tr><th>' + (i + 1) + '</th>' + row.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</table>';
}
/* Scratch 3 blocks with French labels (the only figures with their own colours)
   a line: { k: 'hat' | 'c' | 'else' | 'end' | (stack block), d: depth, c: category, n: line number, p: parts }
   parts: 'text' · {flag:1} · {n:'100'} white input · {bl:'A'} blank to fill · {dd:'prix'} dropdown · {v:'prix'} variable · {sv:'réponse'} sensing reporter · {op:[…]} operator · {bo:[…]} condition
   cap: a caption written above the script («Bloc 1») */
const PD_SC = { ev: ['#FFBF00', '#CC9900'], ctl: ['#FFAB19', '#CF8B17'], sns: ['#5CB1D6', '#2E8EB8'], op: ['#59C059', '#389438'], vr: ['#FF8C1A', '#DB6E00'], lk: ['#9966FF', '#774DCB'], mv: ['#4C97FF', '#3373CC'], pen: ['#0FBD8C', '#0B8E69'], my: ['#FF6680', '#E64D69'] };
function pdScratch(lines, label, cap) {
  const FS = 13, CW = 7.35, IND = 16, LN = lines.some(l => l.n) ? 24 : 4;
  const tw = t => String(t).length * CW;
  const st = (f, s, x) => ' style="fill:' + f + ';stroke:' + (s || 'none') + ';stroke-width:1' + (x || '') + '"';
  const tx = (x, y, t, col, mid, wt) => '<text x="' + pdC(x) + '" y="' + pdC(y + 4.6) + '"' + (mid ? ' text-anchor="middle"' : '') + ' style="fill:' + col + ';stroke:none;font-size:' + FS + 'px;font-family:Helvetica,Arial,sans-serif;font-weight:' + (wt || 500) + '">' + pdEsc(t) + '</text>';
  const pill = (x, cy, w, f, s, rx, x2) => '<rect x="' + pdC(x) + '" y="' + pdC(cy - 11) + '" width="' + pdC(w) + '" height="22" rx="' + (rx == null ? 11 : rx) + '"' + st(f, s, x2) + '/>';
  const meas = p => {
    if (typeof p === 'string') return { w: tw(p), h: 16 };
    if (p.flag) return { w: 20, h: 18 };
    if (p.n != null) return { w: Math.max(26, tw(p.n) + 16), h: 22 };
    if (p.bl) return { w: Math.max(30, tw(p.bl) + 16), h: 22 };
    if (p.dd) return { w: tw(p.dd) + 26, h: 22 };
    if (p.v != null || p.sv != null) return { w: tw(p.v != null ? p.v : p.sv) + 18, h: 22 };
    const ps = (p.op || p.bo).map(meas);
    return { w: ps.reduce((s, q) => s + q.w, 0) + 5 * (ps.length - 1) + (p.bo ? 26 : 16), h: Math.max(...ps.map(q => q.h)) + 6 };
  };
  const draw = (p, x, cy, cat) => {
    const m = meas(p);
    if (typeof p === 'string') return tx(x, cy, p, '#FFFFFF');
    if (p.flag) return '<path d="M' + pdC(x + 4) + ' ' + pdC(cy + 8) + 'V' + pdC(cy - 8) + '"' + st('none', '#45993D', ';stroke-width:2') + '/><path d="M' + pdC(x + 4) + ' ' + pdC(cy - 8) + 'q4 -3 8 0t8 0v8q-4 -3 -8 0t-8 0z"' + st('#4CBF56', '#45993D') + '/>';
    if (p.n != null) return pill(x, cy, m.w, '#FFFFFF', '#C8CCD6') + tx(x + m.w / 2, cy, p.n, '#575E75', true, 500);
    if (p.bl) return pill(x, cy, m.w, '#FFFFFF', '#575E75', 11, ';stroke-dasharray:3 2') + tx(x + m.w / 2, cy, p.bl, '#C0392B', true, 700);
    if (p.dd) return pill(x, cy, m.w, PD_SC[cat][1], PD_SC[cat][1], 4) + tx(x + 8, cy, p.dd + ' ▾', '#FFFFFF');
    if (p.v != null || p.sv != null) { const c = p.v != null ? PD_SC.vr : PD_SC.sns; return pill(x, cy, m.w, c[0], c[1]) + tx(x + m.w / 2, cy, p.v != null ? p.v : p.sv, '#FFFFFF', true); }
    const c = PD_SC.op, h = m.h;
    let s = p.bo ? '<polygon points="' + [[x, cy], [x + h / 2, cy - h / 2], [x + m.w - h / 2, cy - h / 2], [x + m.w, cy], [x + m.w - h / 2, cy + h / 2], [x + h / 2, cy + h / 2]].map(q => pdC(q[0]) + ',' + pdC(q[1])).join(' ') + '"' + st(c[0], c[1]) + '/>'
      : '<rect x="' + pdC(x) + '" y="' + pdC(cy - h / 2) + '" width="' + pdC(m.w) + '" height="' + h + '" rx="' + (h / 2) + '"' + st(c[0], c[1]) + '/>';
    let xx = x + (p.bo ? 13 : 8);
    (p.op || p.bo).forEach(q => { s += draw(q, xx, cy, 'op'); xx += meas(q).w + 5; });
    return s;
  };
  const rows = lines.map(l => {
    const ps = (l.p || []).map(meas), cw = ps.reduce((s, q) => s + q.w, 0) + 6 * Math.max(0, ps.length - 1) + 18;
    return { l, w: l.k === 'end' ? 64 : Math.max(l.k === 'c' || l.k === 'else' ? 80 : 40, cw), h: l.k === 'end' ? 14 : Math.max(l.k === 'hat' ? 34 : 30, Math.max(16, ...ps.map(q => q.h)) + 10) };
  });
  let y = cap ? 26 : 4, arms = '', blocks = cap ? '<text class="ftx" x="2" y="16">' + pdEsc(cap) + '</text>' : '';
  rows.forEach(rw => { rw.x = LN + rw.l.d * IND; rw.y = y; y += rw.h; });
  rows.forEach((rw, i) => {
    const col = PD_SC[rw.l.c], cy = rw.y + rw.h / 2;
    if (rw.l.k === 'c') { const e = rows.find((q, j) => j > i && q.l.k === 'end' && q.l.d === rw.l.d); arms += '<rect x="' + rw.x + '" y="' + rw.y + '" width="' + (IND + 2) + '" height="' + (e.y + e.h - rw.y) + '" rx="4"' + st(col[0], col[1]) + '/>'; }
    blocks += '<rect x="' + rw.x + '" y="' + rw.y + '" width="' + pdC(rw.w) + '" height="' + rw.h + '" rx="' + (rw.l.k === 'hat' ? 12 : 4) + '"' + st(col[0], col[1]) + '/>';
    let xx = rw.x + 9;
    (rw.l.p || []).forEach(p => { blocks += draw(p, xx, cy, rw.l.c); xx += meas(p).w + 6; });
    if (rw.l.n) blocks += '<text x="' + (LN - 7) + '" y="' + pdC(cy + 4.5) + '" text-anchor="end" style="fill:#8A8F99;stroke:none;font-size:12px;font-family:Helvetica,Arial,sans-serif">' + rw.l.n + '</text>';
  });
  return svgFig(Math.ceil(Math.max(336, ...rows.map(rw => rw.x + rw.w)) + 4), Math.ceil(y + 4), arms + blocks, label);   /* at least 340 wide: every program is drawn at the same scale */
}

/* =====================================================================================================
   p2.prog-triple : programme de calcul, expression littérale, équation, programme Scratch, « pour tout nombre »
   ===================================================================================================== */
/* programme A : (x − a) × m + k·x = Px − Q ; programme B (Scratch) : (x × p − q) × s, with sp = P and sq = Q */
const PD_MULT = { 2: ['le double', 'удвоенное'], 3: ['le triple', 'утроенное'] };
const PD_PT = (() => {
  const out = [];
  for (let m = 2; m <= 9; m++) for (let a = 1; a <= 6; a++) for (const k of [2, 3]) {
    const P = m + k, Q = m * a;
    if (m === 5 && a === 2 && k === 3) continue;                 /* the numbers of the original exercise */
    if (!pdIsD(Q / P, 2)) continue;                              /* the number that gives 0 has at most two decimals */
    for (const s of [2, 3, 4, 5]) if (P % s === 0 && Q % s === 0 && P / s >= 2) out.push({ m, a, k, P, Q, s, p: P / s, q: Q / s, root: Q / P });
  }
  return out;
})();
pdProb({ id: 'p2.prog-triple', ch: 'cl', lvl: 2, pts: 4,
  ru: 'Две программы — один результат', fr: 'Deux programmes, un même résultat',
  src: 'Antilles-Guyane 2026 · exercice 2',
  gen(r) {
    const { m, a, k, P, Q, s, p, q, root } = r.pick(PD_PT), A = x => P * x - Q;
    let x0, x1; do { x0 = r.pick([1, 2, 3, -1, -2]); x1 = r.pick([2, 3, 4, 5, 6, -1, -3]); } while (new Set([x0, x1, root, A(x0), A(x1), 0]).size < 6);
    const mult = PD_MULT[k], exA = lin(P, -Q), inB = lin(p, -q), exB = s + '(' + inB + ')';
    const v1 = x0 - a, v2 = v1 * m, w1 = x1 * p, w2 = w1 - q;
    const fig = tbl([['Programme A'], ['Choisir un nombre'], ['Soustraire ' + a], ['Multiplier par ' + m], ['Ajouter ' + mult[0] + ' du nombre de départ']]);
    const prog = pdScratch([
      { k: 'hat', d: 0, c: 'ev', n: 1, p: ['quand', { flag: 1 }, 'est cliqué'] },
      { d: 0, c: 'sns', n: 2, p: ['demander', { n: 'Choisir un nombre' }, 'et attendre'] },
      { d: 0, c: 'vr', n: 3, p: ['mettre', { dd: 'résultat' }, 'à', { op: [{ sv: 'réponse' }, '*', { n: String(p) }] }] },
      { d: 0, c: 'vr', n: 4, p: ['mettre', { dd: 'résultat' }, 'à', { op: [{ v: 'résultat' }, '-', { n: String(q) }] }] },
      { d: 0, c: 'vr', n: 5, p: ['mettre', { dd: 'résultat' }, 'à', { op: [{ v: 'résultat' }, '*', { n: String(s) }] }] },
      { d: 0, c: 'lk', n: 6, p: ['dire', { v: 'résultat' }] }], 'Programme B écrit avec Scratch');
    const ctx = L('On considère le programme de calcul A ci-dessous.',
      'Дана программа вычислений A: выбрать число; вычесть ' + a + '; умножить на ' + m + '; прибавить ' + mult[1] + ' исходное число.');
    return { ctx, fig, qs: [
      { q: L('On choisit ' + nf(x0) + ' comme nombre de départ. Quel résultat obtient-on avec le programme A ?', 'В качестве исходного числа взяли ' + nf(x0) + '. Какой результат даёт программа A?'), ans: N(A(x0)), sol: [
          ['Вычитаем ' + a + ' из выбранного числа:', x0 + '-' + a + '=' + v1],
          ['Умножаем то, что получилось, на ' + m + ':', np(v1) + '*' + m + '=' + v2],
          ['Прибавляем ' + mult[1] + ' исходное число. Исходное — это ' + nf(x0) + ', а не промежуточный результат:', v2 + '+' + k + '*' + np(x0) + '=' + A(x0)]],
        redac: [pdEqs(x0 + '-' + a + '=' + v1 + ';' + np(v1) + '*' + m + '=' + v2 + ';' + v2 + '+' + k + '*' + np(x0) + '=' + A(x0)) + '.',
          'En choisissant ' + nf(x0) + ' comme nombre de départ, on obtient ' + nf(A(x0)) + ' avec le programme A.'] },
      { q: L('On note $x$ le nombre choisi au départ. Remettre dans l\'ordre les étapes qui montrent que le résultat du programme A est $' + exA + '$.', 'Обозначим исходное число $x$. Расставь по порядку шаги, которые показывают, что результат программы A равен $' + exA + '$.'), red: true,
        ans: ORD(r, [
          L('On soustrait ' + a + ' au nombre $x$ : on obtient $x-' + a + '$.', 'Вычитаем ' + a + ' из числа $x$: получаем $x-' + a + '$.'),
          L('On multiplie ce résultat par ' + m + ' : on obtient $' + m + '(x-' + a + ')$.', 'Умножаем этот результат на ' + m + ': получаем $' + m + '(x-' + a + ')$.'),
          L('On ajoute ' + mult[0] + ' du nombre de départ : on obtient $' + m + '(x-' + a + ')+' + k + 'x$.', 'Прибавляем ' + mult[1] + ' исходное число: получаем $' + m + '(x-' + a + ')+' + k + 'x$.'),
          L('On développe, puis on réduit : $' + m + 'x-' + Q + '+' + k + 'x=' + exA + '$.', 'Раскрываем скобки и приводим подобные: $' + m + 'x-' + Q + '+' + k + 'x=' + exA + '$.')]),
        sol: ['Идём по шагам программы, но вместо конкретного числа пишем букву $x$: тогда вычисление верно сразу для любого исходного числа.',
          'Скобки в записи $' + m + '(x-' + a + ')$ обязательны: на ' + m + ' умножается весь результат вычитания, а не только $x$.',
          'В конце раскрываем скобки ($' + m + '*x$ и $' + m + '*' + a + '=' + Q + '$) и складываем слагаемые с $x$: $' + m + 'x+' + k + 'x=' + P + 'x$.'] },
      { q: L('Quel nombre de départ faut-il choisir pour que le résultat du programme A soit égal à 0 ?', 'Какое исходное число нужно выбрать, чтобы результат программы A был равен 0?'), ans: N(fx(root)), sol: [
          'Результат программы для числа $x$ равен $' + exA + '$. Он должен быть равен 0 — получаем уравнение.',
          ['Прибавляем ' + Q + ' к обеим частям — равенство от этого не нарушается:', exA + '=0;' + P + 'x=' + Q],
          ['Делим обе части на ' + P + ':', 'x=' + Q + '/' + P + '=' + fx(root)],
          'Проверка: ' + P + ' × ' + nf(root) + ' − ' + Q + ' = 0.'],
        redac: ['On cherche le nombre $x$ tel que $' + exA + '=0$.',
          '$' + P + 'x=' + Q + '$, donc $x=' + Q + '/' + P + '=' + fx(root) + '$.',
          'Il faut choisir ' + nf(root) + ' comme nombre de départ.'] },
      { q: L('On considère le programme B ci-dessous, écrit avec le logiciel Scratch. Quel nombre ce programme affiche-t-il si l\'on saisit le nombre ' + nf(x1) + ' ?',
          'Ниже — программа B, написанная в Scratch: спросить число («demander … et attendre»); записать в переменную «résultat» ответ, умноженный на ' + p + ' («mettre … à …» — присвоить); вычесть ' + q + '; умножить на ' + s + '; показать «résultat» («dire»). Какое число покажет программа, если ввести ' + nf(x1) + '?'),
        fig: prog, ans: N(A(x1)), sol: [
          ['Строка 3: введённое число («réponse») умножается на ' + p + ':', x1 + '*' + p + '=' + w1],
          ['Строка 4: из значения переменной вычитается ' + q + ':', w1 + '-' + q + '=' + w2],
          ['Строка 5: новое значение умножается на ' + s + ':', np(w2) + '*' + s + '=' + A(x1)],
          'Строка 6 показывает последнее значение переменной «résultat»: ' + nf(A(x1)) + '.'],
        redac: [pdEqs(x1 + '*' + p + '=' + w1 + ';' + w1 + '-' + q + '=' + w2 + ';' + np(w2) + '*' + s + '=' + A(x1)) + '.',
          'Si l\'on saisit le nombre ' + nf(x1) + ', le programme B affiche ' + nf(A(x1)) + '.'] },
      { q: L('Les programmes A et B donnent-ils le même résultat quel que soit le nombre choisi au départ ? Choisir la réponse correctement justifiée.', 'Дают ли программы A и B один и тот же результат при любом исходном числе? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          L('Oui : pour un nombre $x$, le programme B donne $' + exB + '$. En développant, $' + exB + '=' + exA + '$ : c\'est le résultat du programme A.', 'Да: для числа $x$ программа B даёт $' + exB + '$. Раскрываем скобки: $' + exB + '=' + exA + '$ — это результат программы A.'),
          L('Oui, car avec le nombre ' + nf(x1) + ' les deux programmes donnent ' + nf(A(x1)) + '.', 'Да, потому что для числа ' + nf(x1) + ' обе программы дают ' + nf(A(x1)) + '.'),
          L('Non, car les deux programmes n\'effectuent pas les mêmes opérations.', 'Нет, потому что программы выполняют разные действия.'),
          L('Non : pour un nombre $x$, le programme B donne $' + exB + '=' + lin(P, -q) + '$, qui n\'est pas égal à $' + exA + '$.', 'Нет: для числа $x$ программа B даёт $' + exB + '=' + lin(P, -q) + '$, а это не равно $' + exA + '$.')], 0),
        sol: ['«При любом числе» нельзя доказать примерами: чисел бесконечно много. Нужно буквенное вычисление — оно заменяет сразу все проверки.',
          ['Программа B для числа $x$: умножить на ' + p + ', вычесть ' + q + ', умножить на ' + s + '. Раскрываем скобки — на ' + s + ' умножается каждое слагаемое:', exB + '=' + s + '*' + p + 'x-' + s + '*' + q + '=' + exA],
          'Получилось то же выражение, что и у программы A (вопрос 2), значит, результаты совпадают всегда.',
          'Один пример (число ' + nf(x1) + ') ничего не доказывает: две программы могут совпасть для одного числа и различаться для других. Разные действия тоже могут давать один результат. А запись $' + exB + '=' + lin(P, -q) + '$ — ошибка: на ' + s + ' умножили только первое слагаемое.'] }] };
  } });

/* ---------- graphs ---------- */
/* the pieces of a polyline that lie inside y0 ≤ y ≤ y1 */
function pdClip(pts, y0, y1) {
  const out = [], ins = p => p[1] >= y0 - 1e-9 && p[1] <= y1 + 1e-9; let cur = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[i - 1];
    if (i && ins(q) !== ins(p)) {
      const o = ins(q) ? p : q, y = o[1] > y1 ? y1 : y0, c = [q[0] + (y - q[1]) / (p[1] - q[1]) * (p[0] - q[0]), y];
      if (ins(q)) { cur.push(c); out.push(cur); cur = []; } else cur = [c];
    }
    if (ins(p)) cur.push(p);
  }
  if (cur.length > 1) out.push(cur);
  return out;
}
/* a graph with a grid: o = { x0, x1, y0, y1, xg, yg (grid), xt, yt (numbers), xn, yn (axis names), curves: [{ pts, cls, dash, lab, at }], dots, label }
   the numbers are written along the bottom and the left edge of the frame; the axes (through 0) are drawn darker */
function pdPlot(o) {
  const L0 = 42, T0 = 26, PW = 262, PH = 208, H = T0 + PH + 44;
  const X = x => L0 + (x - o.x0) / (o.x1 - o.x0) * PW, Y = y => T0 + PH - (y - o.y0) / (o.y1 - o.y0) * PH;
  let s = '';
  for (let x = Math.ceil(o.x0 / o.xg - 1e-9) * o.xg; x < o.x1 + 1e-9; x += o.xg) s += '<line class="fgrid" x1="' + pdC(X(x)) + '" y1="' + T0 + '" x2="' + pdC(X(x)) + '" y2="' + (T0 + PH) + '"/>';
  for (let y = Math.ceil(o.y0 / o.yg - 1e-9) * o.yg; y < o.y1 + 1e-9; y += o.yg) s += '<line class="fgrid" x1="' + L0 + '" y1="' + pdC(Y(y)) + '" x2="' + (L0 + PW) + '" y2="' + pdC(Y(y)) + '"/>';
  const ax = pdC(Y(Math.max(0, o.y0))), ay = pdC(X(Math.max(0, o.x0)));
  s += '<line class="fax" x1="' + L0 + '" y1="' + ax + '" x2="' + (L0 + PW + 6) + '" y2="' + ax + '"/><line class="fax" x1="' + ay + '" y1="' + (T0 + PH) + '" x2="' + ay + '" y2="' + (T0 - 6) + '"/>';
  for (let x = Math.ceil(o.x0 / o.xt - 1e-9) * o.xt; x < o.x1 + 1e-9; x += o.xt) s += '<text class="ftm" x="' + pdC(X(x)) + '" y="' + (T0 + PH + 17) + '" text-anchor="middle">' + nf(x) + '</text>';
  for (let y = Math.ceil(o.y0 / o.yt - 1e-9) * o.yt; y < o.y1 + 1e-9; y += o.yt) s += '<text class="ftm" x="' + (L0 - 5) + '" y="' + pdC(Y(y) + 4.5) + '" text-anchor="end">' + nf(y) + '</text>';
  s += '<text class="ftx" x="' + (L0 + PW) + '" y="' + (H - 4) + '" text-anchor="end">' + o.xn + '</text><text class="ftx" x="2" y="15">' + o.yn + '</text>';
  o.curves.forEach(c => {
    const ps = pdClip(c.pts, o.y0, o.y1);
    ps.forEach(pts => { s += '<polyline class="' + c.cls + '"' + (c.dash ? ' style="stroke-dasharray:8 5"' : '') + ' fill="none" points="' + pts.map(p => pdC(X(p[0])) + ',' + pdC(Y(p[1]))).join(' ') + '"/>'; });
    const lp = ps[ps.length - 1], e = lp[lp.length - 1], top = e[1] >= o.y1 - 1e-9;
    if (c.at) s += '<text class="ftx" x="' + pdC(X(c.at[0])) + '" y="' + pdC(Y(c.at[1]) + 5) + '" text-anchor="middle">' + c.lab + '</text>';
    else s += '<text class="ftx" x="' + pdC(top ? X(e[0]) : L0 + PW + 4) + '" y="' + pdC(top ? T0 - 9 : Y(e[1]) + 5) + '"' + (top ? ' text-anchor="middle"' : '') + '>' + c.lab + '</text>';
  });
  (o.dots || []).forEach(p => { s += pdDot([X(p[0]), Y(p[1])]); });
  return svgFig(340, H, s, o.label);
}

/* =====================================================================================================
   p2.tarifs-loisirs : trois tarifs, fonctions linéaire / affine / constante, lecture graphique, tableur
   ===================================================================================================== */
/* tarif A : pA par séance ; tarif B : aB + pB par séance ; tarif C : forfait pC.
   A et B se croisent entre deux nombres entiers (lecture graphique), B atteint exactement pC pour n séances (lecture du tableau) */
const PD_TL = (() => {
  const out = [];
  for (const d of [4, 6]) for (const pB of [2.5, 3, 3.5, 4]) for (const aB of (d === 4 ? [14, 18, 22, 26] : [15, 21, 27, 33])) for (let n = 10; n <= 13; n++) {
    const pA = pB + d, pC = aB + pB * n, xh = 80 / pA, xf = (80 - aB) / pB;
    if (!Number.isInteger(pC) || pC > 76 || pA * aB / d > 72) continue;
    if (xf < 16 && xf - xh < 2.4) continue;                       /* the names of the two lines that leave the frame at the top must not touch */
    out.push({ pA, pB, aB, pC, n, xAB: aB / d });
  }
  return out;
})();
const PD_TLV = [
  { fr: 'Une salle d\'escalade propose trois tarifs à ses clients.', ru: 'Скалодром предлагает посетителям три тарифа.', u: 'séance', ru1: 'за каждое занятие', rn: ['занятие', 'занятия', 'занятий'] },
  { fr: 'Une piscine municipale propose trois tarifs à ses clients.', ru: 'Городской бассейн предлагает посетителям три тарифа.', u: 'entrée', ru1: 'за каждое посещение', rn: ['посещение', 'посещения', 'посещений'] },
  { fr: 'Un centre de loisirs organise des activités pendant les vacances. Il propose trois tarifs aux familles.', ru: 'Центр досуга проводит занятия во время каникул и предлагает семьям три тарифа. Платят за «demi-journée» — смену в полдня.', u: 'demi-journée', ru1: 'за каждую смену', rn: ['смена', 'смены', 'смен'] }];
pdProb({ id: 'p2.tarifs-loisirs', ch: 'fn', lvl: 2, pts: 4,
  ru: 'Три тарифа: функции, график и таблица', fr: 'Trois tarifs : fonctions, graphique et tableur',
  src: 'Antilles-Guyane 2026 · exercice 3',
  gen(r) {
    const { pA, pB, aB, pC, n, xAB } = r.pick(PD_TL), v = r.pick(PD_TLV), us = v.u + 's', de = /^[aeé]/.test(v.u) ? 'd\'' : 'de ';
    const A = x => pA * x, B = x => aB + pB * x, xb = Math.ceil(xAB), rn = k => k + ' ' + pdRu(k, v.rn[0], v.rn[1], v.rn[2]);
    let x1; do x1 = r.ri(5, n - 3); while (x1 === xb || x1 === xb - 1);
    const fn = r.sh(['f', 'g', 'h']), ex = {}; ex[fn[0]] = cf(pA, 'x'); ex[fn[1]] = aB + '+' + cf(pB, 'x'); ex[fn[2]] = String(pC);
    const ord = r.sh([0, 1, 2]), DN = ['(d₁)', '(d₂)', '(d₃)'], dOf = t => DN[ord.indexOf(t)];
    const PTS = [[[0, 0], [16, A(16)]], [[0, aB], [16, B(16)]], [[0, pC], [16, pC]]], STY = [{ cls: 'fcurve' }, { cls: 'fhl' }, { cls: 'fl', dash: true }];
    const graph = pdPlot({ x0: 0, x1: 16, y0: 0, y1: 80, xg: 1, yg: 5, xt: 2, yt: 10, xn: 'Nombre ' + de + us, yn: 'Prix (€)', label: 'Prix à payer selon le nombre ' + de + us + ' pour les trois tarifs',
      curves: ord.map((t, i) => Object.assign({ pts: PTS[t], lab: DN[i] }, STY[i])) });
    const xs = [n - 2, n - 1, n, n + 1, n + 2], sheet = pdSheet([['Nombre ' + de + us].concat(xs.map(String)), ['Prix avec le tarif B (en €)'].concat(xs.map(x => nf(B(x))))]);
    const F0 = '=' + aB + '+' + nf(pB) + '*B1';
    const opt = (a, b, c) => L('Tarif A : $' + a[0] + '$ et ' + a[1] + ' ; tarif B : $' + b[0] + '$ et ' + b[1] + ' ; tarif C : $' + c[0] + '$ et ' + c[1] + '.', 'Тариф A: $' + a[0] + '$ и ' + a[1] + '; тариф B: $' + b[0] + '$ и ' + b[1] + '; тариф C: $' + c[0] + '$ и ' + c[1] + '.');
    const askA = r() < 0.5, dq = dOf(askA ? 0 : 1);
    const ctx = L(v.fr + ' Tarif A : on paie ' + eur(pA) + ' par ' + v.u + '. Tarif B : on paie un abonnement annuel de ' + eur(aB) + ', puis ' + eur(pB) + ' par ' + v.u + '. Tarif C : on paie un forfait annuel de ' + eur(pC) + ', qui donne droit à autant ' + de + us + ' que l\'on veut.',
      v.ru + ' Тариф A: ' + eur(pA) + ' ' + v.ru1 + '. Тариф B: годовой абонемент за ' + eur(aB) + ' и ещё ' + eur(pB) + ' ' + v.ru1 + '. Тариф C: годовая плата ' + eur(pC) + ' — и сколько угодно ' + v.rn[2] + '.');
    return { ctx, qs: [
      { q: L('Quel est le prix à payer pour ' + x1 + ' ' + us + ' avec le tarif B ?', 'Сколько нужно заплатить за ' + rn(x1) + ' по тарифу B?'), ans: N(fx(B(x1)), { unit: '€' }), sol: [
          'По тарифу B абонемент ' + eur(aB) + ' платят один раз за год, а потом — по ' + eur(pB) + ' ' + v.ru1 + '.',
          ['', aB + '+' + x1 + '*' + fx(pB) + '=' + aB + '+' + fx(x1 * pB) + '=' + fx(B(x1)), '€'],
          'Ошибка — умножить на ' + x1 + ' всю сумму ' + nf(aB + pB) + ': абонемент платят только один раз.'],
        redac: ['Avec le tarif B, on paie l\'abonnement de ' + eur(aB) + ', puis ' + x1 + ' fois ' + eur(pB) + '.',
          '$' + aB + '+' + x1 + '*' + fx(pB) + '=' + fx(B(x1)) + '$',
          'Avec le tarif B, le prix à payer pour ' + x1 + ' ' + us + ' est de ' + eur(B(x1)) + '.'] },
      { q: L('On désigne par $x$ le nombre ' + de + us + '. On considère les fonctions $f$, $g$ et $h$ définies par $f(x)=' + ex.f + '$, $g(x)=' + ex.g + '$ et $h(x)=' + ex.h + '$. Dans le repère ci-dessous, les droites (d₁), (d₂) et (d₃) représentent ces trois fonctions. Associer chaque tarif à la fonction et à la droite qui lui correspondent.',
          'Обозначим через $x$ число ' + v.rn[2] + '. Даны функции $f$, $g$ и $h$: $f(x)=' + ex.f + '$, $g(x)=' + ex.g + '$ и $h(x)=' + ex.h + '$. На графике ниже прямые (d₁), (d₂) и (d₃) изображают эти три функции (по горизонтали — число ' + v.rn[2] + ', по вертикали — цена в евро). Сопоставь каждому тарифу его функцию и его прямую.'),
        fig: graph, ans: MQ(r, [opt([fn[0], dOf(0)], [fn[1], dOf(1)], [fn[2], dOf(2)]), opt([fn[1], dOf(0)], [fn[0], dOf(1)], [fn[2], dOf(2)]), opt([fn[0], dOf(1)], [fn[1], dOf(0)], [fn[2], dOf(2)]), opt([fn[0], dOf(0)], [fn[2], dOf(2)], [fn[1], dOf(1)])], 0), sol: [
          'Тариф A: цена пропорциональна числу ' + v.rn[2] + ' — это $' + ex[fn[0]] + '$, функция $' + fn[0] + '$ («fonction linéaire»). Её график — прямая через начало координат: ' + dOf(0) + '.',
          'Тариф B: ' + aB + ' € плюс ' + nf(pB) + ' € ' + v.ru1 + ' — это $' + ex[fn[1]] + '$, функция $' + fn[1] + '$ («fonction affine»). При $x=0$ она равна ' + aB + ', поэтому её прямая начинается в точке (0 ; ' + aB + '): ' + dOf(1) + '.',
          'Тариф C: цена всегда ' + pC + ' € и от $x$ не зависит — функция $' + fn[2] + '$ постоянная («fonction constante»). Её график — горизонтальная прямая на высоте ' + pC + ': ' + dOf(2) + '.',
          'Осторожно со словами: по-французски «fonction linéaire» — только $ax$ (прямая пропорциональность), а $ax+b$ — это «fonction affine».'],
        redac: ['Tarif A : le prix est proportionnel au nombre ' + de + us + ', c\'est la fonction $' + fn[0] + '$ ; une fonction linéaire est représentée par une droite qui passe par l\'origine du repère : c\'est ' + dOf(0) + '.',
          'Tarif B : on paie ' + eur(aB) + ', puis ' + eur(pB) + ' par ' + v.u + ', c\'est la fonction $' + fn[1] + '$ ; sa droite passe par le point de coordonnées (0 ; ' + aB + ') : c\'est ' + dOf(1) + '.',
          'Tarif C : le prix est toujours de ' + eur(pC) + ', c\'est la fonction $' + fn[2] + '$ ; cette fonction constante est représentée par une droite parallèle à l\'axe des abscisses : c\'est ' + dOf(2) + '.'] },
      { q: L('La droite ' + dq + ' représente-t-elle une situation de proportionnalité ? Choisir la réponse correctement justifiée.', 'Изображает ли прямая ' + dq + ' прямую пропорциональность? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          L('Oui, car c\'est une droite qui passe par l\'origine du repère.', 'Да, потому что это прямая, проходящая через начало координат.'),
          L('Non, car cette droite ne passe pas par l\'origine du repère.', 'Нет, потому что эта прямая не проходит через начало координат.'),
          L('Oui, car toute droite représente une situation de proportionnalité.', 'Да, потому что любая прямая изображает прямую пропорциональность.'),
          L('Non, car le prix augmente quand le nombre ' + de + us + ' augmente.', 'Нет, потому что цена растёт, когда растёт число ' + v.rn[2] + '.')], askA ? 0 : 1),
        sol: ['Пропорциональность («situation de proportionnalité») на графике узнают по двум признакам сразу: точки лежат на прямой, и эта прямая проходит через начало координат.',
          askA ? 'Прямая ' + dq + ' проходит через точку (0 ; 0) — это тариф A: за 0 ' + v.rn[2] + ' платят 0 €, а за вдвое большее число ' + v.rn[2] + ' — вдвое больше.'
            : 'Прямая ' + dq + ' пересекает ось ординат в точке (0 ; ' + aB + '), а не в начале координат. Это тариф B: за ' + rn(2) + ' платят ' + eur(B(2)) + ', а за ' + rn(4) + ' — ' + eur(B(4)) + ', это не вдвое больше.',
          'Одной «прямоты» мало: прямая, которая не проходит через начало координат, пропорциональность не изображает. А рост цены ни о чём не говорит: при пропорциональности цена тоже растёт.'] },
      { q: L('Lire graphiquement le nombre ' + de + us + ' à partir duquel le tarif B devient plus avantageux que le tarif A.', 'Найди по графику, начиная с какого числа ' + v.rn[2] + ' тариф B становится выгоднее тарифа A.'), ans: N(xb), sol: [
          'Тариф выгоднее там, где его прямая ниже. Прямые ' + dOf(0) + ' (тариф A) и ' + dOf(1) + ' (тариф B) пересекаются между ' + (xb - 1) + ' и ' + xb + '. Левее точки пересечения ниже идёт прямая тарифа A, правее — прямая тарифа B.',
          'Число ' + v.rn[2] + ' — целое, поэтому тариф B выгоднее начиная с ' + xb + '.',
          'Проверка расчётом: за ' + rn(xb - 1) + ' тариф A стоит ' + eur(A(xb - 1)) + ', тариф B — ' + eur(B(xb - 1)) + '; за ' + rn(xb) + ' тариф A стоит ' + eur(A(xb)) + ', тариф B — ' + eur(B(xb)) + '.'],
        redac: ['Graphiquement, la droite ' + dOf(1) + ' (tarif B) passe en dessous de la droite ' + dOf(0) + ' (tarif A) entre ' + (xb - 1) + ' et ' + xb + ' ' + us + '.',
          'Vérification : pour ' + (xb - 1) + ' ' + us + ', le tarif A coûte ' + eur(A(xb - 1)) + ' et le tarif B ' + eur(B(xb - 1)) + ' ; pour ' + xb + ' ' + us + ', le tarif A coûte ' + eur(A(xb)) + ' et le tarif B ' + eur(B(xb)) + '.',
          'Le tarif B devient plus avantageux que le tarif A à partir de ' + xb + ' ' + us + '.'] },
      { q: L('Dans un tableur, on a calculé le prix à payer avec le tarif B pour quelques nombres ' + de + us + ' (tableau ci-dessous). Parmi les formules suivantes, laquelle a été saisie dans la cellule B2, puis étirée vers la droite ?',
          'В электронной таблице посчитали цену по тарифу B для нескольких чисел ' + v.rn[2] + ' (таблица ниже: в строке 1 — число ' + v.rn[2] + ', в строке 2 — цена по тарифу B в евро). Какая из формул была введена в ячейку B2 и протянута вправо?'),
        fig: sheet, ans: MQ(r, [F0, '=' + aB + '+' + nf(pB) + '*x', '=' + aB + '+' + nf(pB) + '*' + (n - 2), '=' + aB + '+' + nf(pB) + '*A1'], 0), sol: [
          'Формула должна брать число ' + v.rn[2] + ' из ячейки над ней — B1. Тогда при протягивании вправо ссылка сама меняется на C1, D1, … и в каждом столбце считается своя цена.',
          'Буквы $x$ таблица не знает. Формула с числом ' + (n - 2) + ' даёт верный результат в B2, но при протягивании не меняется: во всех ячейках было бы ' + nf(B(n - 2)) + '. А в ячейке A1 записан текст, а не число.'],
        redac: ['Le nombre ' + de + us + ' se trouve dans la cellule B1.',
          'La formule saisie dans la cellule B2 est : ' + F0] },
      { q: L('En utilisant le tableau de valeurs, déterminer le nombre ' + de + us + ' à partir duquel le tarif C devient plus avantageux que le tarif B.', 'По таблице найди, начиная с какого числа ' + v.rn[2] + ' тариф C становится выгоднее тарифа B.'), ans: N(n + 1), sol: [
          'Тариф C всегда стоит ' + eur(pC) + '. В строке 2 ищем, когда цена тарифа B станет больше этой суммы.',
          'За ' + rn(n) + ' тариф B стоит ровно ' + eur(pC) + ' — тарифы равны, «выгоднее» ещё нет.',
          'За ' + rn(n + 1) + ' тариф B стоит уже ' + eur(B(n + 1)) + ' — больше, чем ' + eur(pC) + '. Значит, тариф C выгоднее начиная с ' + (n + 1) + '.'],
        redac: ['Le tarif C coûte toujours ' + eur(pC) + '.',
          'D\'après le tableau, pour ' + n + ' ' + us + ', le tarif B coûte aussi ' + eur(pC) + ' : les deux tarifs reviennent au même prix.',
          'Pour ' + (n + 1) + ' ' + us + ', le tarif B coûte ' + eur(B(n + 1)) + ', ce qui est plus que ' + eur(pC) + '.',
          'Le tarif C devient plus avantageux que le tarif B à partir de ' + (n + 1) + ' ' + us + '.'] }] };
  } });

/* =====================================================================================================
   p2.triangles-emboites : construction, Pythagore, deux perpendiculaires à une même droite, Thalès, périmètres
   ===================================================================================================== */
const PD_TRI = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
/* ABC rectangle en B, AMN rectangle en M, B ∈ [AM], C ∈ [AN] : AM = k·AB, MN = k·BC, AN = k·AC ; every length has one decimal at most,
   all lengths are different ; P1 = périmètre de ABC, P2 = périmètre de BMNC, Pa and Pb = the two wrong sums of the last question */
const PD_EMB = (() => {
  const out = [];
  PD_TRI.forEach(([a, b, c]) => { for (let s10 = 1; s10 <= 40; s10++) [[a, b], [b, a]].forEach(([l1, l2]) => {
    const s = s10 / 10, AB = l1 * s, BC = l2 * s, AC = c * s;
    if (AB < 3 || BC < 2.5 || AC > 13) return;
    [1.2, 1.25, 4 / 3, 1.4, 1.5, 1.6, 5 / 3, 1.75, 1.8, 2, 2.5].forEach(k => {
      const BM = AB * (k - 1), AM = AB * k, MN = BC * k, AN = AC * k, NC = AC * (k - 1);
      if (![BM, AM, MN, AN, NC].every(x => pdIsD(x, 1)) || AN > 20 || BM < 1.5) return;
      const v = [AB, BC, AC, BM, AM, MN, AN, NC].map(x => +x.toFixed(1));
      if (new Set(v).size < 8 || (v[0] === 6.4 && v[2] === 8)) return;          /* (6,4 ; 8) : the numbers of the original exercise */
      const P1 = +(v[0] + v[1] + v[2]).toFixed(1), P2 = +(v[3] + v[5] + v[7] + v[1]).toFixed(1), Pa = +(v[3] + v[5] + v[6] + v[1]).toFixed(1), Pb = +(v[3] + v[5] + v[7]).toFixed(1);
      if (Pa === P1 || Pb === P1) return;
      out.push({ AB: v[0], BC: v[1], AC: v[2], BM: v[3], AM: v[4], MN: v[5], AN: v[6], NC: v[7], P1, P2, Pa, Pb, eq: P1 === P2 });
    });
  }); });
  return out;
})();
const PD_EMB_EQ = PD_EMB.filter(d => d.eq), PD_EMB_NE = PD_EMB.filter(d => !d.eq);
function pdEmbFig(d) {
  const T = pdFit([[0, 0], [d.AM, 0], [d.AM, d.MN]], 340, 200, 28);
  const A = T([0, 0]), B = T([d.AB, 0]), M = T([d.AM, 0]), C = T([d.AB, d.BC]), N = T([d.AM, d.MN]);
  return svgFig(340, 200, pdLn(A, M) + pdLn(A, N) + pdLn(B, C) + pdLn(M, N) + pdRA(B, A, C) + pdRA(M, A, N) + [A, B, M, C, N].map(pdDot).join('') +
    pdLab(A, 'A', pdDir(-1, 0.4)) + pdLab(B, 'B', pdDir(0, 1)) + pdLab(M, 'M', pdDir(0.5, 1)) + pdLab(C, 'C', pdDir(-0.5, -1)) + pdLab(N, 'N', pdDir(0.3, -1)), 'Triangles ABC et AMN, rectangles en B et en M');
}
pdProb({ id: 'p2.triangles-emboites', ch: 'ge', lvl: 2, pts: 4,
  ru: 'Вложенные треугольники: Пифагор, Фалес и периметры', fr: 'Triangles emboîtés et périmètres',
  src: 'Centres étrangers 2026 · exercice 1',
  gen(r) {
    const d = r() < 0.45 && PD_EMB_EQ.length ? r.pick(PD_EMB_EQ) : r.pick(PD_EMB_NE), { AB, BC, AC, BM, AM, MN, AN, NC, P1, P2, Pa, Pb } = d;
    const ac2 = fx(AC * AC), ab2 = fx(AB * AB), bc2 = fx(BC * BC), sum = a => a.map(x => nf(x)).join(' + ');
    const data = 'AB = ' + nf(AB) + ' cm, BM = ' + nf(BM) + ' cm et AC = ' + nf(AC) + ' cm';
    const ctx = L('Sur la figure ci-dessous, qui n\'est pas en vraie grandeur, les points A, B et M sont alignés, ainsi que les points A, C et N. Le triangle ABC est rectangle en B et le triangle AMN est rectangle en M. On donne : ' + data + '.',
      'На рисунке (масштаб не соблюдён) точки A, B и M лежат на одной прямой, точки A, C и N — тоже. Треугольник ABC прямоугольный с прямым углом B, треугольник AMN — с прямым углом M. Известно: ' + data.replace(/cm/g, 'см').replace(' et ', ' и ') + '.');
    const thales = '$$' + pdDf('AB', 'AM') + '=' + pdDf('AC', 'AN') + '=' + pdDf('BC', 'MN') + '$$';
    const pABC = 'AB + BC + CA = ' + sum([AB, BC, AC]) + ' = ' + nf(P1) + ' cm', pRu = s => s.replace(/cm/g, 'см');
    const good = d.eq
      ? L('Oui : NC = AN − AC = ' + nf(AN) + ' − ' + nf(AC) + ' = ' + nf(NC) + ' cm, donc le périmètre de BMNC est BM + MN + NC + CB = ' + sum([BM, MN, NC, BC]) + ' = ' + nf(P2) + ' cm ; celui de ABC est ' + pABC + '.',
        'Да: NC = AN − AC = ' + nf(AN) + ' − ' + nf(AC) + ' = ' + nf(NC) + ' см, значит, периметр BMNC равен BM + MN + NC + CB = ' + sum([BM, MN, NC, BC]) + ' = ' + nf(P2) + ' см; периметр ABC равен ' + pRu(pABC) + '.')
      : L('Non : NC = AN − AC = ' + nf(AN) + ' − ' + nf(AC) + ' = ' + nf(NC) + ' cm, donc le périmètre de BMNC est BM + MN + NC + CB = ' + sum([BM, MN, NC, BC]) + ' = ' + nf(P2) + ' cm, alors que celui de ABC est ' + pABC + '.',
        'Нет: NC = AN − AC = ' + nf(AN) + ' − ' + nf(AC) + ' = ' + nf(NC) + ' см, значит, периметр BMNC равен BM + MN + NC + CB = ' + sum([BM, MN, NC, BC]) + ' = ' + nf(P2) + ' см, а периметр ABC равен ' + pRu(pABC) + '.');
    return { ctx, fig: pdEmbFig(d), qs: [
      { q: L('On veut tracer le triangle ABC en vraie grandeur. Remettre dans l\'ordre les étapes de la construction.', 'Нужно построить треугольник ABC в натуральную величину. Расставь шаги построения по порядку.'),
        ans: ORD(r, [
          L('Tracer un segment [AB] de longueur ' + nf(AB) + ' cm.', 'Начертить отрезок [AB] длиной ' + nf(AB) + ' см.'),
          L('Tracer la droite perpendiculaire à (AB) passant par B.', 'Провести через точку B прямую, перпендикулярную прямой (AB).'),
          L('Tracer un arc de cercle de centre A et de rayon ' + nf(AC) + ' cm : il coupe cette perpendiculaire au point C.', 'Провести дугу окружности с центром A и радиусом ' + nf(AC) + ' см: она пересекает этот перпендикуляр в точке C.'),
          L('Tracer le segment [AC].', 'Начертить отрезок [AC].')]),
        sol: ['Про треугольник ABC известны сторона AB, прямой угол B и сторона AC. Начинаем с того, что можно начертить сразу, — с отрезка [AB].',
          'Прямой угол B означает, что точка C лежит на перпендикуляре к (AB), проведённом через B. Кроме того, C удалена от A на ' + nf(AC) + ' см, то есть лежит на окружности с центром A и радиусом ' + nf(AC) + ' см.',
          'Точка C — пересечение перпендикуляра и дуги. Остаётся соединить A и C. Длину BC для построения знать не нужно: она получается сама.'] },
      { q: L('Calculer la longueur BC.', 'Вычисли длину BC.'), ans: pdNE(BC, 'cm'), sol: [
          'Треугольник ABC прямоугольный, прямой угол — B. Значит, гипотенуза — сторона напротив прямого угла, [AC], и по теореме Пифагора («théorème de Pythagore») $AC^2=AB^2+BC^2$.',
          ['Неизвестен катет, поэтому из квадрата гипотенузы вычитаем квадрат известного катета:', 'BC^2=' + fx(AC) + '^2-' + fx(AB) + '^2=' + ac2 + '-' + ab2 + '=' + bc2],
          ['Длина — положительное число, квадрат которого равен ' + nf(+bc2) + ':', 'BC=√' + bc2 + '=' + fx(BC), 'см'],
          'Ошибка — сложить квадраты: складывают, когда ищут гипотенузу, а здесь гипотенуза AC уже известна.'],
        redac: ['Le triangle ABC est rectangle en B. D\'après le théorème de Pythagore : $AC^2=AB^2+BC^2$.',
          '$BC^2=AC^2-AB^2=' + fx(AC) + '^2-' + fx(AB) + '^2=' + ac2 + '-' + ab2 + '=' + bc2 + '$',
          '$BC=√' + bc2 + '=' + fx(BC) + '$',
          'La longueur BC est de ' + nf(BC) + ' cm.'] },
      { q: L('On veut démontrer que les droites (BC) et (MN) sont parallèles. Remettre dans l\'ordre les étapes de la démonstration.', 'Нужно доказать, что прямые (BC) и (MN) параллельны. Расставь шаги доказательства по порядку.'), red: true,
        ans: ORD(r, [
          L('Le triangle ABC est rectangle en B, donc la droite (BC) est perpendiculaire à la droite (AB).', 'Треугольник ABC прямоугольный с прямым углом B, значит, прямая (BC) перпендикулярна прямой (AB).'),
          L('De même, le triangle AMN est rectangle en M, donc la droite (MN) est perpendiculaire à la droite (AM).', 'Точно так же треугольник AMN прямоугольный с прямым углом M, значит, прямая (MN) перпендикулярна прямой (AM).'),
          L('Les points A, B et M sont alignés : les droites (BC) et (MN) sont donc toutes les deux perpendiculaires à la droite (AM).', 'Точки A, B и M лежат на одной прямой: значит, прямые (BC) и (MN) обе перпендикулярны прямой (AM).'),
          L('Or, si deux droites sont perpendiculaires à une même droite, alors elles sont parallèles entre elles.', 'А если две прямые перпендикулярны одной и той же прямой, то они параллельны между собой.'),
          L('Donc les droites (BC) et (MN) sont parallèles.', 'Значит, прямые (BC) и (MN) параллельны.')]),
        sol: ['Доказательство строится по схеме «дано — свойство — вывод». Сначала данные: два прямых угла дают две перпендикулярности.',
          'Затем замечаем, что (AB) и (AM) — одна и та же прямая, потому что точки A, B, M лежат на одной прямой. Выходит, обе прямые перпендикулярны одной и той же прямой.',
          'После слова «Or» идёт свойство, на которое опираемся, а после «Donc» — вывод. Теорему Фалеса здесь применять нельзя: она сама требует параллельности, которую мы только доказываем.'] },
      { q: L('Calculer la longueur MN.', 'Вычисли длину MN.'), ans: pdNE(MN, 'cm'), sol: [
          'Точки A, B, M лежат на одной прямой, точки A, C, N — тоже, а (BC) и (MN) параллельны (вопрос 3). Это «вложенные треугольники» теоремы Фалеса («théorème de Thalès»): треугольник AMN — увеличенная копия треугольника ABC.',
          ['В отношениях участвует вся сторона AM, поэтому сначала находим её:', 'AM=AB+BM=' + fx(AB) + '+' + fx(BM) + '=' + fx(AM)],
          ['Отношения соответственных сторон равны:', 'AB/AM=AC/AN=BC/MN'],
          ['Из первого и третьего отношений:', 'MN=(' + fx(BC) + '*' + fx(AM) + ')/' + fx(AB) + '=' + fx(MN), 'см'],
          'Ошибка — подставить BM вместо AM: BM не является стороной ни одного из двух треугольников.'],
        redac: ['Les points A, B, M sont alignés, les points A, C, N sont alignés et les droites (BC) et (MN) sont parallèles.',
          'D\'après le théorème de Thalès : ' + thales,
          'Or $AM=AB+BM$, soit $AM=' + fx(AB) + '+' + fx(BM) + '=' + fx(AM) + '$. Donc $$' + pdDf(pdT(AB), pdT(AM)) + '=' + pdDf(pdT(AC), 'AN') + '=' + pdDf(pdT(BC), 'MN') + '$$.',
          'Donc $$MN=' + pdDf(pdT(BC) + '\\times ' + pdT(AM), pdT(AB)) + '=' + pdT(MN) + '$$.',
          'La longueur MN est de ' + nf(MN) + ' cm.'] },
      { q: L('Calculer la longueur AN.', 'Вычисли длину AN.'), ans: pdNE(AN, 'cm'), sol: [
          'Берём те же равные отношения теоремы Фалеса, теперь первое и второе.',
          ['', fx(AB) + '/' + fx(AM) + '=' + fx(AC) + '/AN'],
          ['Отсюда', 'AN=(' + fx(AC) + '*' + fx(AM) + ')/' + fx(AB) + '=' + fx(AN), 'см'],
          'Проверка смыслом: треугольник AMN больше треугольника ABC, поэтому AN должна быть больше AC = ' + nf(AC) + ' см.'],
        redac: ['D\'après le théorème de Thalès (question précédente) : $$' + pdDf('AB', 'AM') + '=' + pdDf('AC', 'AN') + '$$, soit $$' + pdDf(pdT(AB), pdT(AM)) + '=' + pdDf(pdT(AC), 'AN') + '$$.',
          'Donc $$AN=' + pdDf(pdT(AC) + '\\times ' + pdT(AM), pdT(AB)) + '=' + pdT(AN) + '$$.',
          'La longueur AN est de ' + nf(AN) + ' cm.'] },
      { q: L('Le périmètre du triangle ABC et le périmètre du quadrilatère BMNC sont-ils égaux ? Choisir la réponse correctement justifiée.', 'Равны ли периметр треугольника ABC и периметр четырёхугольника BMNC? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [good,
          L('Non : le périmètre de BMNC est BM + MN + AN + CB = ' + sum([BM, MN, AN, BC]) + ' = ' + nf(Pa) + ' cm, alors que celui de ABC est ' + pABC + '.', 'Нет: периметр BMNC равен BM + MN + AN + CB = ' + sum([BM, MN, AN, BC]) + ' = ' + nf(Pa) + ' см, а периметр ABC равен ' + pRu(pABC) + '.'),
          L('Non : le périmètre de BMNC est BM + MN + NC = ' + sum([BM, MN, NC]) + ' = ' + nf(Pb) + ' cm, alors que celui de ABC est ' + pABC + '.', 'Нет: периметр BMNC равен BM + MN + NC = ' + sum([BM, MN, NC]) + ' = ' + nf(Pb) + ' см, а периметр ABC равен ' + pRu(pABC) + '.'),
          L('Oui : les droites (BC) et (MN) sont parallèles, donc le triangle ABC et le quadrilatère BMNC ont le même périmètre.', 'Да: прямые (BC) и (MN) параллельны, поэтому у треугольника ABC и четырёхугольника BMNC одинаковый периметр.')], 0),
        sol: ['Периметр — сумма длин всех сторон фигуры. У четырёхугольника BMNC четыре стороны: [BM], [MN], [NC] и [CB].',
          ['Сторона NC — часть отрезка [AN]: точка C лежит между A и N.', 'NC=AN-AC=' + fx(AN) + '-' + fx(AC) + '=' + fx(NC)],
          ['Периметр BMNC:', fx(BM) + '+' + fx(MN) + '+' + fx(NC) + '+' + fx(BC) + '=' + fx(P2), 'см'],
          ['Периметр ABC:', fx(AB) + '+' + fx(BC) + '+' + fx(AC) + '=' + fx(P1), 'см'],
          d.eq ? 'Оба периметра равны ' + nf(P1) + ' см.' : 'Периметры разные: ' + nf(P2) + ' см и ' + nf(P1) + ' см.',
          'В неверных вариантах вместо стороны NC взят весь отрезок AN (он не является стороной четырёхугольника) или забыта сторона [CB]. А параллельность прямых ничего не говорит о равенстве периметров — их нужно вычислить.'] }] };
  } });

/* =====================================================================================================
   p2.triangles-opposes : réciproque de Pythagore, aire, deux perpendiculaires à une même droite, Thalès « papillon », angles alternes-internes
   ===================================================================================================== */
/* AED rectangle en E (à démontrer), ABC rectangle en B, A commun : AB = k·AE, BC = k·ED ; ang = mesure commune des angles ADE et ACB */
const PD_OPP = (() => {
  const out = [];
  PD_TRI.forEach(([a, b, c]) => { for (let s10 = 1; s10 <= 40; s10++) [[a, b], [b, a]].forEach(([l1, l2]) => {
    const s = s10 / 10, AE = +(l1 * s).toFixed(1), ED = +(l2 * s).toFixed(1), AD = +(c * s).toFixed(1);
    if (AE < 2.5 || ED < 2.5 || AD > 12) return;
    [0.6, 0.75, 0.8, 1.2, 1.25, 1.5, 1.6, 2].forEach(k => {
      const BC = ED * k, AB = AE * k, area = AE * ED / 2, ang = Math.atan(AE / ED) * 180 / Math.PI;
      if (!pdIsD(BC, 1) || !pdIsD(AB, 2) || !pdIsD(area, 2) || BC < 2 || BC > 12 || AB > 14) return;
      if (pdTie(ang, 0, 0.12) || Math.abs(ang - 45) < 4) return;
      const v = [AE, ED, AD, +BC.toFixed(1), +AB.toFixed(2), +area.toFixed(2)];
      if (new Set(v).size < 6 || (AE === 5.5 && ED === 4.8)) return;            /* (5,5 ; 4,8) : the numbers of the original exercise */
      out.push({ AE, ED, AD, BC: v[3], AB: v[4], area: v[5], ang: Math.round(ang) });
    });
  }); });
  return out;
})();
function pdOppFig(d) {
  const T = pdFit([[-d.AB, d.BC], [d.AE, -d.ED]], 340, 220, 28);
  const A = T([0, 0]), B = T([-d.AB, 0]), C = T([-d.AB, d.BC]), E = T([d.AE, 0]), D = T([d.AE, -d.ED]);
  return svgFig(340, 220, pdLn(B, E) + pdLn(C, D) + pdLn(B, C) + pdLn(E, D) + pdRA(B, A, C) + [A, B, C, D, E].map(pdDot).join('') +
    pdLab(A, 'A', pdDir(0.35, -1)) + pdLab(B, 'B', pdDir(-0.6, 1)) + pdLab(C, 'C', pdDir(-0.4, -1)) + pdLab(E, 'E', pdDir(0.6, -1)) + pdLab(D, 'D', pdDir(0.4, 1)), 'Triangles ABC et AED de sommet commun A');
}
pdProb({ id: 'p2.triangles-opposes', ch: 'ge', lvl: 2, pts: 3,
  ru: 'Два треугольника с общей вершиной', fr: 'Deux triangles opposés par le sommet',
  src: 'Amérique du Nord 2026 · exercice 1',
  gen(r) {
    const d = r.pick(PD_OPP), { AE, ED, AD, BC, AB, area, ang } = d;
    const ad2 = fx(AD * AD), ae2 = fx(AE * AE), ed2 = fx(ED * ED);
    const data = 'DE = ' + nf(ED) + ' cm, AD = ' + nf(AD) + ' cm, AE = ' + nf(AE) + ' cm et BC = ' + nf(BC) + ' cm';
    const ctx = L('Sur la figure ci-dessous, qui n\'est pas en vraie grandeur, les points B, A et E sont alignés, ainsi que les points C, A et D. Le triangle ABC est rectangle en B. On donne : ' + data + '.',
      'На рисунке (масштаб не соблюдён) точки B, A и E лежат на одной прямой, точки C, A и D — тоже. Треугольник ABC прямоугольный с прямым углом B. Известно: ' + data.replace(/cm/g, 'см').replace(' et ', ' и ') + '.');
    const aACB = pdAng('ACB'), aADE = pdAng('ADE');
    return { ctx, fig: pdOppFig(d), qs: [
      { q: L('On veut démontrer que le triangle AED est rectangle en E. Remettre dans l\'ordre les étapes de la démonstration.', 'Нужно доказать, что треугольник AED прямоугольный с прямым углом E. Расставь шаги доказательства по порядку.'), red: true,
        ans: ORD(r, [
          L('Dans le triangle AED, le plus long côté est [AD].', 'В треугольнике AED самая длинная сторона — [AD].'),
          L('D\'une part : $AD^2=' + fx(AD) + '^2=' + ad2 + '$.', 'С одной стороны: $AD^2=' + fx(AD) + '^2=' + ad2 + '$.'),
          L('D\'autre part : $AE^2+ED^2=' + fx(AE) + '^2+' + fx(ED) + '^2$, c\'est-à-dire $' + ae2 + '+' + ed2 + '=' + ad2 + '$.', 'С другой стороны: $AE^2+ED^2=' + fx(AE) + '^2+' + fx(ED) + '^2$, то есть $' + ae2 + '+' + ed2 + '=' + ad2 + '$.'),
          L('On constate que $AD^2=AE^2+ED^2$.', 'Замечаем, что $AD^2=AE^2+ED^2$.'),
          L('Donc, d\'après la réciproque du théorème de Pythagore, le triangle AED est rectangle en E.', 'Значит, по обратной теореме Пифагора треугольник AED прямоугольный с прямым углом E.')]),
        sol: ['Про треугольник AED известны три стороны, а доказать нужно, что он прямоугольный. Для этого служит обратная теорема Пифагора («réciproque du théorème de Pythagore»).',
          'Сначала называем самую длинную сторону: только она может быть гипотенузой. Затем отдельно считаем её квадрат и отдельно — сумму квадратов двух других сторон («D\'une part…», «D\'autre part…»).',
          'Писать сразу $AD^2=AE^2+ED^2$ нельзя: это равенство ещё не доказано. Его можно «заметить» только после двух вычислений, и лишь потом сделать вывод. Прямой угол лежит напротив самой длинной стороны [AD] — это угол E.'] },
      { q: L('Calculer l\'aire du triangle AED.', 'Вычисли площадь треугольника AED.'), ans: pdNE(area, 'cm²'), sol: [
          'Треугольник AED прямоугольный с прямым углом E (вопрос 1), поэтому стороны [AE] и [ED] перпендикулярны: одну можно взять за основание, другую — за высоту.',
          ['Площадь треугольника — половина произведения основания на высоту:', '(' + fx(AE) + '*' + fx(ED) + ')/2=' + fx(area), 'см²'],
          'Гипотенуза AD в этом вычислении не участвует. И не забудь разделить на 2: произведение ' + nf(AE) + ' × ' + nf(ED) + ' — это площадь целого прямоугольника.'],
        redac: ['Le triangle AED est rectangle en E : les côtés [AE] et [ED] sont perpendiculaires.',
          '$$\\mathcal{A}=' + pdDf('AE\\times ED', 2) + '=' + pdDf(pdT(AE) + '\\times ' + pdT(ED), 2) + '=' + pdT(area) + '$$',
          'L\'aire du triangle AED est de ' + nf(area) + ' cm².'] },
      { q: L('Pourquoi peut-on affirmer que les droites (BC) et (ED) sont parallèles ? Choisir la justification correcte.', 'Почему можно утверждать, что прямые (BC) и (ED) параллельны? Выбери верное обоснование.'), red: true,
        ans: MQ(r, [
          L('Les droites (BC) et (ED) sont toutes les deux perpendiculaires à la droite (BE). Or, si deux droites sont perpendiculaires à une même droite, alors elles sont parallèles entre elles.', 'Прямые (BC) и (ED) обе перпендикулярны прямой (BE). А если две прямые перпендикулярны одной и той же прямой, то они параллельны между собой.'),
          L('Les droites (BC) et (ED) sont parallèles, donc toute droite perpendiculaire à l\'une est perpendiculaire à l\'autre : c\'est le cas de la droite (BE).', 'Прямые (BC) и (ED) параллельны, значит, всякая прямая, перпендикулярная одной из них, перпендикулярна и другой: такова прямая (BE).'),
          L('Les points B, A, E sont alignés et les points C, A, D aussi. Donc, d\'après le théorème de Thalès, les droites (BC) et (ED) sont parallèles.', 'Точки B, A, E лежат на одной прямой, точки C, A, D — тоже. Значит, по теореме Фалеса прямые (BC) и (ED) параллельны.'),
          L('Sur la figure, les droites (BC) et (ED) ne se coupent pas : elles sont donc parallèles.', 'На рисунке прямые (BC) и (ED) не пересекаются, значит, они параллельны.')], 0),
        sol: ['Треугольник ABC прямоугольный с прямым углом B, значит, (BC) перпендикулярна (AB). Треугольник AED прямоугольный с прямым углом E (вопрос 1), значит, (ED) перпендикулярна (AE). Точки B, A, E лежат на одной прямой, поэтому (AB) и (AE) — это одна прямая (BE).',
          'Две прямые, перпендикулярные одной и той же прямой, параллельны — это и есть нужное свойство.',
          'Вариант, который начинается со слов «(BC) и (ED) параллельны», берёт как данное то, что нужно доказать. Теорема Фалеса сама требует параллельности — из одного того, что точки лежат на прямых, она не следует. А рисунок не в масштабе и ничего не доказывает.'] },
      { q: L('Calculer la valeur exacte de la longueur AB.', 'Вычисли точное значение длины AB.'), ans: pdNE(AB, 'cm'), sol: [
          'Прямые (BE) и (CD) пересекаются в точке A, а (BC) и (ED) параллельны (вопрос 3). Это конфигурация «бабочка» теоремы Фалеса («théorème de Thalès»): треугольник ABC — увеличенная или уменьшенная копия треугольника AED.',
          ['Отношения соответственных сторон равны (сторона AB соответствует AE, сторона BC — стороне ED):', 'AB/AE=AC/AD=BC/ED'],
          ['Берём первое и третье отношения — в них неизвестна только AB:', 'AB/' + fx(AE) + '=' + fx(BC) + '/' + fx(ED)],
          ['Отсюда', 'AB=(' + fx(AE) + '*' + fx(BC) + ')/' + fx(ED) + '=' + fx(AB), 'см'],
          'Десятичная дробь ' + nf(AB) + ' здесь конечная — это и есть точное значение, округлять ничего не нужно.'],
        redac: ['Les droites (BE) et (CD) sont sécantes en A et les droites (BC) et (ED) sont parallèles.',
          'D\'après le théorème de Thalès : $$' + pdDf('AB', 'AE') + '=' + pdDf('AC', 'AD') + '=' + pdDf('BC', 'ED') + '$$',
          'soit $$' + pdDf('AB', pdT(AE)) + '=' + pdDf(pdT(BC), pdT(ED)) + '$$.',
          'Donc $$AB=' + pdDf(pdT(AE) + '\\times ' + pdT(BC), pdT(ED)) + '=' + pdT(AB) + '$$.',
          'La longueur AB est de ' + nf(AB) + ' cm.'] },
      { q: L('On admet que l\'angle ' + aACB + ' mesure environ ' + ang + '°. En déduire la mesure de l\'angle ' + aADE + '. Choisir la réponse correctement justifiée.', 'Примем, что угол ' + aACB + ' равен примерно ' + ang + '°. Найди отсюда величину угла ' + aADE + '. Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          L('Environ ' + ang + '° : les angles ' + aACB + ' et ' + aADE + ' sont alternes-internes et les droites (BC) et (ED) sont parallèles, donc ils ont la même mesure.', 'Примерно ' + ang + '°: углы ' + aACB + ' и ' + aADE + ' — накрест лежащие, а прямые (BC) и (ED) параллельны, поэтому эти углы равны.'),
          L('Environ ' + (90 - ang) + '° : dans le triangle AED rectangle en E, les angles ' + aACB + ' et ' + aADE + ' sont complémentaires.', 'Примерно ' + (90 - ang) + '°: в прямоугольном треугольнике AED углы ' + aACB + ' и ' + aADE + ' дополняют друг друга до 90°.'),
          L('Environ ' + ang + '° : les angles ' + aACB + ' et ' + aADE + ' sont opposés par le sommet, donc ils ont la même mesure.', 'Примерно ' + ang + '°: углы ' + aACB + ' и ' + aADE + ' вертикальные, поэтому они равны.'),
          L('Environ ' + (180 - ang) + '° : les angles ' + aACB + ' et ' + aADE + ' sont supplémentaires.', 'Примерно ' + (180 - ang) + '°: углы ' + aACB + ' и ' + aADE + ' в сумме дают 180°.')], 0),
        sol: ['Прямые (BC) и (ED) параллельны (вопрос 3), а прямая (CD) пересекает их обе. Углы ACB и ADE лежат между параллельными прямыми по разные стороны от секущей (CD) — это накрест лежащие углы («angles alternes-internes»).',
          'У параллельных прямых накрест лежащие углы равны, поэтому угол ADE тоже равен примерно ' + ang + '°.',
          'Вертикальные углы («opposés par le sommet») — это углы BAC и EAD с общей вершиной A, а не ACB и ADE: у этих двух вершины разные. До 90° угол ADE дополняет угол EAD (в треугольнике AED), а не угол ACB. И в сумме 180° эти углы не дают: оба острые.'] }] };
  } });

/* a programme de calcul drawn as boxes: caption, top → two columns (left, right) → merged steps */
function pdFlow(cap, top, left, right, merge, label) {
  const CW = 7.7, BH = 28, GAP = 18, cx = 170, cl = 86, cr = 254, Y0 = 24;
  const box = (x, y, t) => { const w = Math.min(334, t.length * CW + 22), x0 = pdC(x - w / 2); return '<rect class="ffill" x="' + x0 + '" y="' + y + '" width="' + pdC(w) + '" height="' + BH + '" rx="6"/><rect class="fl" x="' + x0 + '" y="' + y + '" width="' + pdC(w) + '" height="' + BH + '" rx="6"/><text class="ftx" x="' + x + '" y="' + (y + 19) + '" text-anchor="middle">' + pdEsc(t) + '</text>'; };
  const y0 = Y0 + BH + GAP;
  const col = (c, items) => { let y = y0, o = ''; items.forEach((t, i) => { o += (i ? pdArrow(c, y - GAP, c, y) : pdArrow(cx, Y0 + BH, c, y)) + box(c, y, t); y += BH + GAP; }); return { o, end: y - GAP }; };
  const A = col(cl, left), B = col(cr, right);
  let y = Math.max(A.end, B.end) + GAP, s = '<text class="ftx" x="' + cx + '" y="15" text-anchor="middle" font-weight="600">' + pdEsc(cap) + '</text>' + box(cx, Y0, top) + A.o + B.o + pdArrow(cl, A.end, cx - 14, y) + pdArrow(cr, B.end, cx + 14, y);
  merge.forEach((t, i) => { if (i) s += pdArrow(cx, y - GAP, cx, y); s += box(cx, y, t); y += BH + GAP; });
  return svgFig(340, y - GAP + 3, s, label);
}

/* =====================================================================================================
   p2.prog-equation : deux programmes de calcul, carré, programme Scratch à compléter, double distributivité, équation
   ===================================================================================================== */
pdProb({ id: 'p2.prog-equation', ch: 'cl', lvl: 2, pts: 5,
  ru: 'Две программы и уравнение', fr: 'Deux programmes de calcul et une équation',
  src: 'Centres étrangers 2026 · exercice 3',
  gen(r) {
    /* A : (x + a)(x − b) = x² + (a − b)x − ab ; B : x² − c ; B donne T pour n et −n ; A = B pour xs */
    let a, b, c, n, x0, x1, xs, T, A0, B1;
    do {
      a = r.ri(2, 9); do b = r.ri(2, 9); while (b === a); c = r.ri(1, 15); n = r.ri(4, 12); x0 = r.pick([1, 2, 3]); x1 = r.ri(6, 12);
      xs = (a * b - c) / (a - b); T = n * n - c; A0 = (x0 + a) * (x0 - b); B1 = x1 * x1 - c;
    } while ((a === 6 && b === 4) || !pdIsD(xs, 1) || xs === 0 || Math.abs(xs) > 30 || A0 === 0 || new Set([A0, B1, n, -n, xs, x0, x1, T]).size < 8);
    const m = a - b, P = a * b, exP = '(x+' + a + ')(x-' + b + ')', dev = 'x^2-' + b + 'x+' + a + 'x-' + P, red = quad(1, m, -P), val = +(xs * xs - c).toFixed(2);
    const figA = pdFlow('Programme A', 'Choisir un nombre', ['Ajouter ' + a], ['Soustraire ' + b], ['Multiplier les deux nombres obtenus'], 'Programme A');
    const figB = tbl([['Programme B'], ['Choisir un nombre'], ['Calculer le carré de ce nombre'], ['Soustraire ' + c]]);
    const prog = pdScratch([
      { k: 'hat', d: 0, c: 'ev', n: 1, p: ['quand', { flag: 1 }, 'est cliqué'] },
      { d: 0, c: 'sns', n: 2, p: ['demander', { n: 'Choisir un nombre' }, 'et attendre'] },
      { d: 0, c: 'vr', n: 3, p: ['mettre', { dd: 'premier' }, 'à', { bl: '?' }] },
      { d: 0, c: 'vr', n: 4, p: ['mettre', { dd: 'second' }, 'à', { bl: '?' }] },
      { d: 0, c: 'lk', n: 5, p: ['dire', { bl: '?' }] }], 'Programme Scratch à compléter');
    const ln = (l3, l4, l5) => L('Ligne 3 : ' + l3 + ' ; ligne 4 : ' + l4 + ' ; ligne 5 : ' + l5 + '.', 'Строка 3: ' + l3 + '; строка 4: ' + l4 + '; строка 5: ' + l5 + '.');
    const ctx = L('Voici deux programmes de calcul.',
      'Даны две программы вычислений. Программа A: выбрать число; с одной стороны прибавить к нему ' + a + ', с другой — вычесть из него ' + b + '; перемножить два полученных числа. Программа B: выбрать число; возвести его в квадрат; вычесть ' + c + '.');
    return { ctx, fig: figA + figB, qs: [
      { q: L('On choisit ' + x0 + ' comme nombre de départ. Quel résultat obtient-on avec le programme A ?', 'В качестве исходного числа взяли ' + x0 + '. Какой результат даёт программа A?'), ans: N(A0), sol: [
          ['Обе ветки начинаются с исходного числа ' + x0 + '. Левая ветка:', x0 + '+' + a + '=' + (x0 + a)],
          ['Правая ветка:', x0 + '-' + b + '=' + (x0 - b)],
          ['Перемножаем два полученных числа' + (A0 < 0 ? ' (положительное на отрицательное — результат отрицательный)' : '') + ':', (x0 + a) + '*' + np(x0 - b) + '=' + A0]],
        redac: [pdEqs(x0 + '+' + a + '=' + (x0 + a) + ';' + x0 + '-' + b + '=' + (x0 - b) + ';' + (x0 + a) + '*' + np(x0 - b) + '=' + A0) + '.',
          'En choisissant ' + x0 + ' comme nombre de départ, on obtient ' + nf(A0) + ' avec le programme A.'] },
      { q: L('On choisit ' + x1 + ' comme nombre de départ. Calculer le résultat obtenu avec le programme B.', 'В качестве исходного числа взяли ' + x1 + '. Вычисли результат программы B.'), ans: N(B1), sol: [
          ['Квадрат числа — это число, умноженное само на себя (а не на 2):', x1 + '^2=' + x1 + '*' + x1 + '=' + x1 * x1],
          ['Вычитаем ' + c + ':', x1 * x1 + '-' + c + '=' + B1]],
        redac: [pdEqs(x1 + '^2=' + x1 * x1 + ';' + x1 * x1 + '-' + c + '=' + B1) + '.',
          'En choisissant ' + x1 + ' comme nombre de départ, on obtient ' + B1 + ' avec le programme B.'] },
      { q: L('Donner tous les nombres de départ qui permettent d\'obtenir ' + T + ' avec le programme B.', 'Запиши все исходные числа, для которых программа B даёт ' + T + '.'), ans: LIST(n + ',' + (-n)), sol: [
          ['Идём по программе B в обратную сторону. Перед вычитанием ' + c + ' было число на ' + c + ' больше — это квадрат исходного числа:', 'x^2=' + T + '+' + c + '=' + n * n],
          'Квадрат равен ' + n * n + ' у двух чисел: у ' + n + ' и у ' + nf(-n) + ', потому что $(-' + n + ')^2=' + n * n + '$ (минус на минус даёт плюс).',
          'Ответ: ' + n + ' и ' + nf(-n) + '. Назвать только ' + n + ' — самая частая ошибка: в вопросе сказано «tous les nombres».'],
        redac: ['On cherche les nombres $x$ tels que $x^2-' + c + '=' + T + '$, c\'est-à-dire $x^2=' + n * n + '$.',
          'Or $' + n + '^2=' + n * n + '$ et $(-' + n + ')^2=' + n * n + '$.',
          'Les nombres de départ possibles sont ' + n + ' et ' + nf(-n) + '.'] },
      { q: L('Le programme Scratch ci-dessous doit afficher le résultat du programme A pour le nombre saisi. Comment faut-il compléter les lignes 3, 4 et 5 ?',
          'Программа Scratch ниже должна показывать результат программы A для введённого числа: «réponse» — введённое число, «mettre … à …» — присвоить переменной значение, «dire» — показать. Чем нужно дополнить строки 3, 4 и 5?'),
        fig: prog, ans: MQ(r, [
          ln('réponse + ' + a, 'réponse − ' + b, 'premier * second'),
          ln('réponse + ' + a, 'premier − ' + b, 'premier * second'),
          ln('réponse + ' + a, 'réponse − ' + b, 'premier + second'),
          ln('réponse + ' + a, 'réponse − ' + b, 'réponse * réponse')], 0), sol: [
          'В программе A обе ветки начинаются с исходного числа. Поэтому и в строке 3, и в строке 4 стоит «réponse» — число, которое ввели: «réponse + ' + a + '» и «réponse − ' + b + '».',
          'Последний шаг программы A — перемножить два полученных числа: «premier * second».',
          'Если в строке 4 написать «premier − ' + b + '», то ' + b + ' вычтется из уже увеличенного числа — получится другая программа. Знак «+» в строке 5 складывает вместо умножения, а «réponse * réponse» — это квадрат исходного числа, два полученных числа тут вообще не используются.'],
        redac: ['Ligne 3 : mettre premier à réponse + ' + a + '.',
          'Ligne 4 : mettre second à réponse − ' + b + '.',
          'Ligne 5 : dire premier * second.'] },
      { q: L('On choisit $x$ comme nombre de départ. Remettre dans l\'ordre les étapes qui montrent que le résultat du programme A est $' + red + '$.', 'В качестве исходного числа взяли $x$. Расставь по порядку шаги, которые показывают, что результат программы A равен $' + red + '$.'), red: true,
        ans: ORD(r, [
          L('Avec le nombre $x$, « Ajouter ' + a + ' » donne $x+' + a + '$ et « Soustraire ' + b + ' » donne $x-' + b + '$.', 'Для числа $x$ шаг «Ajouter ' + a + '» даёт $x+' + a + '$, а шаг «Soustraire ' + b + '» даёт $x-' + b + '$.'),
          L('Le résultat du programme A est donc le produit $' + exP + '$.', 'Значит, результат программы A — произведение $' + exP + '$.'),
          L('On développe : $' + exP + '=' + dev + '$.', 'Раскрываем скобки: $' + exP + '=' + dev + '$.'),
          L('On réduit : $' + dev + '=' + red + '$.', 'Приводим подобные: $' + dev + '=' + red + '$.')]),
        sol: ['Сначала записываем, что дают две ветки для числа $x$, потом — что программа их перемножает.',
          'Раскрывая скобки, каждое слагаемое первой скобки умножаем на каждое слагаемое второй — получается четыре произведения: $x*x$, $x*(-' + b + ')$, $' + a + '*x$ и $' + a + '*(-' + b + ')$.',
          'В конце складываем слагаемые с $x$: $-' + b + 'x+' + a + 'x=' + cf(m, 'x') + '$.'] },
      { q: L('Quel nombre de départ faut-il choisir pour que les programmes A et B donnent le même résultat ?', 'Какое исходное число нужно выбрать, чтобы программы A и B дали один и тот же результат?'), ans: N(fx(xs)), sol: [
          'Для числа $x$ программа A даёт $' + red + '$ (вопрос 5), а программа B — $x^2-' + c + '$. Результаты должны совпасть — получаем уравнение.',
          ['', red + '=x^2-' + c],
          ['В обеих частях есть $x^2$. Вычитаем его из обеих частей — равенство сохраняется, а уравнение становится простым:', lin(m, -P) + '=' + (-c)],
          ['Прибавляем ' + P + ' к обеим частям:', cf(m, 'x') + '=' + (P - c)],
          m === 1 ? 'Это и есть искомое число.' : [(m === -1 ? 'Меняем знак обеих частей:' : 'Делим обе части на ' + nf(m) + ':'), 'x=' + fx(xs)],
          'Проверка: для числа ' + nf(xs) + ' обе программы дают ' + nf(val) + '.'],
        redac: ['On cherche le nombre $x$ tel que $' + red + '=x^2-' + c + '$.',
          'On soustrait $x^2$ à chaque membre : $' + lin(m, -P) + '=' + (-c) + '$.',
          m === 1 ? 'Donc $x=' + fx(xs) + '$.' : 'Donc $' + cf(m, 'x') + '=' + (P - c) + '$, soit $x=' + fx(xs) + '$.',
          'Les deux programmes donnent le même résultat lorsque le nombre de départ est ' + nf(xs) + '.'] }] };
  } });

/* =====================================================================================================
   p2.offres-smartphone : deux offres, fonction affine et fonction linéaire, équation, période d'engagement
   ===================================================================================================== */
pdProb({ id: 'p2.offres-smartphone', ch: 'fn', lvl: 2, pts: 3,
  ru: 'Два предложения на смартфон', fr: 'Deux offres pour un smartphone',
  src: 'Asie 2026 · exercice 1',
  gen(r) {
    /* offre A : P0 à l'achat puis mA par mois ; offre B : mB par mois ; même prix au bout de xs mois (xs ≠ E, la durée d'engagement) */
    const nm = r.pick(PRENOMS_F);
    let E, mA, d, xs, P0;
    do { E = r.pick([12, 24]); mA = r.ri(12, 25); d = r.ri(5, 10); xs = E + r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]); P0 = d * xs; } while (P0 % 5 !== 0 || (P0 === 175 && mA === 16));
    const mB = mA + d, cA = P0 + mA * E, cB = mB * E, best = cA < cB ? 'A' : 'B', other = best === 'A' ? 'B' : 'A', lo = Math.min(cA, cB), hi = Math.max(cA, cB), inside = xs < E;
    const fn = r.sh(['f', 'g']), ex = {}; ex[fn[0]] = P0 + '+' + mA + 'x'; ex[fn[1]] = mB + 'x';
    const mo = k => k + ' ' + pdRu(k, 'месяц', 'месяца', 'месяцев');
    const fig = tbl([['Offre A', 'Offre B'], ['Le client paie ' + eur(P0) + ' à l\'achat, puis un abonnement de ' + eur(mA) + ' par mois.', 'Le client ne paie rien à l\'achat, puis un abonnement de ' + eur(mB) + ' par mois.']]);
    const ctx = L(nm + ' souhaite acheter un smartphone. Elle compare les deux offres ci-dessous. Chacune impose un engagement de ' + E + ' mois au minimum.',
      nm + ' хочет купить смартфон и сравнивает два предложения. Предложение A: ' + eur(P0) + ' при покупке, затем абонемент ' + eur(mA) + ' в месяц. Предложение B: при покупке ничего не платят, затем абонемент ' + eur(mB) + ' в месяц. В обоих случаях договор заключают минимум на ' + mo(E) + ' («engagement»).');
    const nat = (o1, n1, o2, n2) => L('$' + fn[0] + '$ : offre ' + o1 + ', fonction ' + n1[0] + ' ; $' + fn[1] + '$ : offre ' + o2 + ', fonction ' + n2[0] + '.', '$' + fn[0] + '$: предложение ' + o1 + ', «fonction ' + n1[0] + '» (' + n1[1] + '); $' + fn[1] + '$: предложение ' + o2 + ', «fonction ' + n2[0] + '» (' + n2[1] + ').');
    const AF = ['affine', 'вида ax + b'], LI = ['linéaire', 'вида ax'];
    return { ctx, fig, qs: [
      { q: L('Calculer le prix total payé au bout de ' + E + ' mois avec chacune des deux offres.', 'Вычисли, сколько всего заплатят за ' + mo(E) + ' по каждому из предложений.'),
        ans: multi([L('Offre A :', 'Предложение A:'), N(cA, { unit: '€' })], [L('Offre B :', 'Предложение B:'), N(cB, { unit: '€' })]), sol: [
          ['Предложение A: ' + eur(P0) + ' платят один раз при покупке, а абонемент ' + eur(mA) + ' — каждый месяц, ' + E + ' раз:', P0 + '+' + E + '*' + mA + '=' + P0 + '+' + mA * E + '=' + cA, '€'],
          ['Предложение B: только абонемент, ' + E + ' раз по ' + eur(mB) + ':', E + '*' + mB + '=' + cB, '€']],
        redac: ['Offre A : $' + P0 + '+' + E + '*' + mA + '=' + cA + '$. Au bout de ' + E + ' mois, on a payé ' + eur(cA) + '.',
          'Offre B : $' + E + '*' + mB + '=' + cB + '$. Au bout de ' + E + ' mois, on a payé ' + eur(cB) + '.'] },
      { q: L('Au bout de ' + E + ' mois, laquelle des deux offres est la plus intéressante ? Choisir la réponse correctement justifiée.', 'Какое из двух предложений выгоднее через ' + mo(E) + '? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          L('L\'offre ' + best + ', car au bout de ' + E + ' mois on a payé ' + eur(lo) + ' avec l\'offre ' + best + ', contre ' + eur(hi) + ' avec l\'offre ' + other + '.', 'Предложение ' + best + ': за ' + mo(E) + ' по нему заплатят ' + eur(lo) + ', а по предложению ' + other + ' — ' + eur(hi) + '.'),
          L('L\'offre ' + other + ', car au bout de ' + E + ' mois on a payé ' + eur(hi) + ' avec l\'offre ' + other + ', ce qui est plus que ' + eur(lo) + '.', 'Предложение ' + other + ': за ' + mo(E) + ' по нему заплатят ' + eur(hi) + ', а это больше, чем ' + eur(lo) + '.'),
          L('L\'offre A, car son abonnement est le moins cher : ' + eur(mA) + ' par mois contre ' + eur(mB) + '.', 'Предложение A, потому что его абонемент дешевле: ' + eur(mA) + ' в месяц против ' + eur(mB) + '.'),
          L('L\'offre B, car le client ne paie rien à l\'achat.', 'Предложение B, потому что при покупке ничего не платят.')], 0),
        sol: ['«La plus intéressante» — та, по которой за ' + mo(E) + ' в сумме заплатят меньше. Сравниваем итоги из вопроса 1: ' + eur(cA) + ' (A) и ' + eur(cB) + ' (B).',
          'Меньше — ' + eur(lo) + ', это предложение ' + best + '.',
          'Смотреть только на абонемент или только на первый взнос нельзя: в сумме участвует и то и другое. Такой довод может случайно привести к верному предложению, но ничего не доказывает. А выбрать бо́льшую сумму — значит перепутать «выгоднее» и «дороже».'] },
      { q: L('On note $x$ le nombre de mois. On considère les fonctions $f$ et $g$ définies par $f(x)=' + ex.f + '$ et $g(x)=' + ex.g + '$ : elles donnent le prix payé, en euros, au bout de $x$ mois. Associer chaque fonction à son offre et préciser sa nature.',
          'Обозначим через $x$ число месяцев. Функции $f$ и $g$ заданы формулами $f(x)=' + ex.f + '$ и $g(x)=' + ex.g + '$: они дают сумму в евро, уплаченную за $x$ месяцев. Сопоставь каждой функции её предложение и назови вид функции.'),
        ans: MQ(r, [nat('A', AF, 'B', LI), nat('A', LI, 'B', AF), nat('B', AF, 'A', LI), nat('B', LI, 'A', AF)], 0), sol: [
          'По предложению A за $x$ месяцев платят ' + P0 + ' € и ещё $x$ раз по ' + mA + ' €: это $' + ex[fn[0]] + '$, функция $' + fn[0] + '$. По предложению B — только $x$ раз по ' + mB + ' €: это $' + ex[fn[1]] + '$, функция $' + fn[1] + '$.',
          'Функция вида $ax+b$ по-французски называется «fonction affine», а вида $ax$ (прямая пропорциональность) — «fonction linéaire». У $' + fn[0] + '$ есть слагаемое ' + P0 + ', значит, она «affine»; у $' + fn[1] + '$ его нет — она «linéaire».',
          'Осторожно: по-русски «линейной» называют и функцию $ax+b$, а по-французски «linéaire» — только $ax$.'],
        redac: ['Avec l\'offre A, on paie ' + eur(P0) + ', puis ' + eur(mA) + ' par mois : le prix est $' + ex[fn[0]] + '$. C\'est la fonction $' + fn[0] + '$, qui est une fonction affine.',
          'Avec l\'offre B, on paie ' + eur(mB) + ' par mois : le prix est $' + ex[fn[1]] + '$. C\'est la fonction $' + fn[1] + '$, qui est une fonction linéaire.'] },
      { q: L('Au bout de combien de mois a-t-on payé le même prix avec les deux offres ?', 'Через сколько месяцев по обоим предложениям будет уплачена одна и та же сумма?'), ans: N(xs, { unit: 'mois' }), sol: [
          'Суммы равны, когда $' + fn[0] + '(x)=' + fn[1] + '(x)$ — получаем уравнение.',
          ['', ex[fn[0]] + '=' + ex[fn[1]]],
          ['Вычитаем $' + mA + 'x$ из обеих частей, чтобы $x$ остался только справа:', P0 + '=' + mB + 'x-' + mA + 'x;' + P0 + '=' + d + 'x'],
          ['Делим обе части на ' + d + ':', 'x=' + P0 + '/' + d + '=' + xs],
          'По смыслу: каждый месяц предложение B обходится на ' + d + ' € дороже, и первый взнос ' + P0 + ' € «съедается» за ' + P0 + ' ÷ ' + d + ' = ' + mo(xs) + '.'],
        redac: ['On cherche le nombre $x$ tel que $' + ex[fn[0]] + '=' + ex[fn[1]] + '$.',
          '$' + P0 + '=' + mB + 'x-' + mA + 'x$, soit $' + P0 + '=' + d + 'x$.',
          '$x=' + P0 + '/' + d + '=' + xs + '$',
          'On a payé le même prix avec les deux offres au bout de ' + xs + ' mois.'] },
      { q: L('À ce moment-là, est-on encore dans la période d\'engagement ? Choisir la réponse correctement justifiée.', 'В этот момент срок обязательного договора («période d\'engagement») ещё идёт? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          inside ? L('Oui, car ' + xs + ' mois, c\'est moins que les ' + E + ' mois d\'engagement.', 'Да, потому что ' + mo(xs) + ' — это меньше, чем ' + mo(E) + ' договора.')
            : L('Non, car ' + xs + ' mois, c\'est plus que les ' + E + ' mois d\'engagement : cette période est terminée.', 'Нет, потому что ' + mo(xs) + ' — это больше, чем ' + mo(E) + ' договора: этот срок уже закончился.'),
          inside ? L('Non, car ' + xs + ' mois, c\'est moins que les ' + E + ' mois d\'engagement.', 'Нет, потому что ' + mo(xs) + ' — это меньше, чем ' + mo(E) + ' договора.')
            : L('Oui, car ' + xs + ' mois, c\'est plus que les ' + E + ' mois d\'engagement.', 'Да, потому что ' + mo(xs) + ' — это больше, чем ' + mo(E) + ' договора.'),
          L('Oui, car l\'engagement est le même pour les deux offres.', 'Да, потому что срок договора одинаков для обоих предложений.'),
          L('Non, car l\'engagement ne concerne que l\'offre A, pour laquelle on paie ' + eur(P0) + ' à l\'achat.', 'Нет, потому что договор касается только предложения A, по которому при покупке платят ' + eur(P0) + '.')], 0),
        sol: ['«Engagement de ' + E + ' mois» — срок, в течение которого от абонемента нельзя отказаться: первые ' + mo(E) + '.',
          'Суммы сравниваются через ' + mo(xs) + ' (вопрос 4). Сравниваем: ' + xs + (inside ? ' < ' : ' > ') + E + ', значит, срок договора ' + (inside ? 'ещё не закончился.' : 'уже закончился.'),
          'Из верного сравнения нужно сделать верный вывод: ' + (inside ? '«меньше ' + E + '» означает «внутри срока»' : '«больше ' + E + '» означает «после срока»') + '. Одинаковый срок у двух предложений на вопрос не отвечает, а в условии сказано, что он есть у обоих предложений.'] }] };
  } });

/* =====================================================================================================
   p2.parabole-droite : image, antécédent, tableur, équation f(x) = g(x) par le tableau, par le graphique et par le calcul
   ===================================================================================================== */
/* f(x) = (x − a)(x + b) = x² + mx − ab, g(x) = mx + c with c = n² − ab : f(x) = g(x) ⇔ x² = n² */
const PD_PAR = (() => {
  const out = [];
  for (let a = 1; a <= 5; a++) for (let b = 1; b <= 5; b++) for (const n of [2, 3]) {
    const m = b - a, c = n * n - a * b;
    if (m === 0 || Math.abs(m) > 3 || c === 0 || Math.abs(c) > 9 || (a === 1 && b === 3 && n === 2)) continue;   /* (1 ; 3 ; 2) : the original exercise */
    const y0 = Math.floor(Math.min(-a * b - m * m / 4, m * n + c, -m * n + c)) - 1, y1 = Math.max(m * n + c, -m * n + c) + 2;
    if (y1 - y0 <= 22) out.push({ a, b, m, c, n, y0, y1 });
  }
  return out;
})();
const pdSub = (c, s) => c + '<tspan dy="4" font-size="11">' + s + '</tspan>';          /* a name with an index on a figure: C_f */
pdProb({ id: 'p2.parabole-droite', ch: 'fn', lvl: 2, pts: 4,
  ru: 'Две функции: таблица, график и уравнение', fr: 'Deux fonctions : tableur, graphique et équation',
  src: 'Amérique du Nord 2026 · exercice 2',
  gen(r) {
    const { a, b, m, c, n, y0, y1 } = r.pick(PD_PAR), nm = r.pick(PRENOMS_F), P = a * b, n2 = n * n;
    const f = x => (x - a) * (x + b), g = x => m * x + c, fexp = quad(1, m, -P), gexp = lin(m, c), fdef = '(x-' + a + ')(x+' + b + ')';
    let x0, u; do { x0 = r.pick([-5, -4, -3, -2]); u = Math.abs(m) === 2 ? r.pick([0.5, 1.5, 2.5, -0.5, -1.5]) : r.pick([6, 7, 8, -1, -4]); } while (x0 === -n || x0 === -b || new Set([f(x0), u, n, -n]).size < 4);
    const t = m * u + c, f0 = f(x0), cs = c > 0 ? '+' + c : String(c), X0 = -(n + 2), X1 = n + 2;
    const pf = [], pg = []; for (let i = 0; i <= (X1 - X0) * 10; i++) { const x = X0 + i / 10; pf.push([x, f(x)]); pg.push([x, g(x)]); }
    const sd = m > 0 ? -1 : 1, xe = (-m + sd * Math.sqrt(m * m + 4 * (P + y1))) / 2;
    const graph = pdPlot({ x0: X0, x1: X1, y0, y1, xg: 1, yg: 1, xt: 1, yt: 2, xn: '', yn: '', label: 'Courbes représentatives des fonctions f et g',
      curves: [{ pts: pf, cls: 'fcurve', lab: pdSub('C', 'f'), at: [Math.max(X0 + 0.45, Math.min(X1 - 0.45, xe + sd * 0.6)), y1 - 0.9] },
        { pts: pg, cls: 'fhl', lab: pdSub('C', 'g'), at: [-sd * (n + 1.45), g(-sd * (n + 1.2)) - 1] }] });
    const xs = [0, 1, 2, 3, 4, 5], sheet = pdSheet([['<i>x</i>'].concat(xs.map(String)), ['<i>f</i>(<i>x</i>)'].concat(xs.map(x => nf(f(x)))), ['<i>g</i>(<i>x</i>)'].concat(xs.map(x => nf(g(x))))]);
    const F0 = '=' + m + '*B1' + cs;
    const ctx = L('On considère les fonctions $f$ et $g$ définies par $f(x)=' + fdef + '$ et $g(x)=' + gexp + '$.', 'Даны функции $f$ и $g$: $f(x)=' + fdef + '$ и $g(x)=' + gexp + '$.');
    return { ctx, qs: [
      { q: L('Calculer $f(' + x0 + ')$.', 'Вычисли $f(' + x0 + ')$.'), ans: N(f0), sol: [
          ['Подставляем ' + nf(x0) + ' вместо $x$ в каждую скобку:', 'f(' + x0 + ')=(' + x0 + '-' + a + ')(' + x0 + '+' + b + ')=' + np(x0 - a) + '*' + np(x0 + b) + '=' + f0],
          x0 + b < 0 ? 'Оба множителя отрицательные, поэтому произведение положительное.' : 'Один множитель отрицательный, другой положительный, поэтому произведение отрицательное.',
          'Сначала считаем каждую скобку, и только потом перемножаем: так меньше риск ошибиться в знаках.'],
        redac: ['$f(' + x0 + ')=(' + x0 + '-' + a + ')(' + x0 + '+' + b + ')$',
          '$f(' + x0 + ')=' + np(x0 - a) + '*' + np(x0 + b) + '=' + f0 + '$',
          'L\'image de ' + nf(x0) + ' par la fonction $f$ est ' + nf(f0) + '.'] },
      { q: L('Déterminer l\'antécédent de ' + nf(t) + ' par la fonction $g$.', 'Найди прообраз числа ' + nf(t) + ' при функции $g$.'), ans: N(fx(u)), sol: [
          'Прообраз («antécédent») числа ' + nf(t) + ' — это такое $x$, для которого $g(x)=' + t + '$. Получаем уравнение.',
          ['', gexp + '=' + t],
          [(c > 0 ? 'Вычитаем ' + c + ' из обеих частей' : 'Прибавляем ' + (-c) + ' к обеим частям') + ' — равенство сохраняется:', cf(m, 'x') + '=' + (t - c)],
          m === 1 ? 'Это и есть ответ.' : [(m === -1 ? 'Меняем знак обеих частей:' : 'Делим обе части на ' + nf(m) + ':'), 'x=' + fx(u)],
          'Ошибка — вычислить $g(' + t + ')$: это образ числа ' + nf(t) + ', а спрашивают, из какого числа оно получается.'],
        redac: ['On cherche le nombre $x$ tel que $g(x)=' + t + '$.',
          m === 1 ? '$' + gexp + '=' + t + '$, donc $x=' + fx(u) + '$.' : '$' + gexp + '=' + t + '$, donc $' + cf(m, 'x') + '=' + (t - c) + '$ et $x=' + fx(u) + '$.',
          'L\'antécédent de ' + nf(t) + ' par la fonction $g$ est ' + nf(u) + '.'] },
      { q: L('Avec un tableur, on a calculé les images des nombres entiers de 0 à 5 par les fonctions $f$ et $g$ (tableau ci-dessous). Parmi les formules suivantes, laquelle a été saisie dans la cellule B3, puis étirée vers la droite, pour compléter la ligne 3 ?',
          'В электронной таблице посчитали образы целых чисел от 0 до 5 при функциях $f$ и $g$ (таблица ниже). Какая из формул была введена в ячейку B3 и протянута вправо, чтобы заполнить строку 3?'),
        fig: sheet, ans: MQ(r, [F0, '=' + m + '*x' + cs, '=' + m + '*B2' + cs, '=' + m + '*0' + cs], 0), sol: [
          'В строке 3 стоят значения $g(x)=' + gexp + '$, а само число $x$ записано в строке 1 того же столбца. Для столбца B это ячейка B1.',
          'При протягивании вправо ссылка B1 сама превращается в C1, D1, … — в каждом столбце формула берёт своё значение $x$.',
          'Буквы $x$ таблица не знает. В ячейке B2 стоит $f(0)$, а не $x$. Формула с числом 0 при протягивании не меняется: во всей строке было бы ' + nf(g(0)) + '.'],
        redac: ['La ligne 3 contient les images par la fonction $g$ ; le nombre $x$ se trouve dans la cellule B1.',
          'La formule saisie dans la cellule B3 est : ' + F0] },
      { q: L('Par lecture du tableau, donner une solution de l\'équation $f(x)=g(x)$.', 'По таблице найди одно решение уравнения $f(x)=g(x)$.'), ans: N(n), sol: [
          'Решение уравнения $f(x)=g(x)$ — число $x$, для которого значения в строках 2 и 3 совпадают.',
          'Такой столбец один: при $x=' + n + '$ обе функции равны ' + nf(g(n)) + '. Значит, ' + n + ' — решение.',
          'Ответ — число из строки 1 (значение $x$), а не общее значение ' + nf(g(n)) + '.'],
        redac: ['Dans le tableau, pour $x=' + n + '$, on lit $f(' + n + ')=' + g(n) + '$ et $g(' + n + ')=' + g(n) + '$.',
          'Le nombre ' + n + ' est donc une solution de l\'équation $f(x)=g(x)$.'] },
      { q: L('Les fonctions $f$ et $g$ sont représentées ci-dessous. L\'équation $f(x)=g(x)$ a une autre solution : la déterminer par lecture graphique.', 'Ниже изображены графики функций $f$ и $g$. У уравнения $f(x)=g(x)$ есть ещё одно решение — найди его по графику.'),
        fig: graph, ans: N(-n), sol: [
          'Равенство $f(x)=g(x)$ выполняется там, где графики пересекаются: решения — это абсциссы точек пересечения.',
          'Точек пересечения две: (' + n + ' ; ' + nf(g(n)) + ') — её мы уже нашли по таблице — и (' + nf(-n) + ' ; ' + nf(g(-n)) + '). Второе решение — ' + nf(-n) + '.',
          'В таблице его нет: там только числа от 0 до 5. И ответ — абсцисса точки (её читают на горизонтальной оси), а не ордината.'],
        redac: ['Les solutions de l\'équation $f(x)=g(x)$ sont les abscisses des points d\'intersection des deux courbes.',
          'Les courbes se coupent en deux points, d\'abscisses ' + nf(-n) + ' et ' + n + '.',
          'L\'autre solution de l\'équation est ' + nf(-n) + '.'] },
      { q: L(nm + ' affirme que les solutions de l\'équation $f(x)=g(x)$ sont les mêmes que celles de l\'équation $x^2-' + n2 + '=0$. A-t-elle raison ? Choisir la réponse correctement justifiée.', nm + ' утверждает, что у уравнения $f(x)=g(x)$ те же решения, что и у уравнения $x^2-' + n2 + '=0$. Права ли она? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          L('Oui : $' + fdef + '=' + fexp + '$, donc l\'équation $f(x)=g(x)$ s\'écrit $' + fexp + '=' + gexp + '$, c\'est-à-dire $x^2-' + n2 + '=0$.', 'Да: $' + fdef + '=' + fexp + '$, поэтому уравнение $f(x)=g(x)$ записывается как $' + fexp + '=' + gexp + '$, то есть $x^2-' + n2 + '=0$.'),
          L('Non : $' + fdef + '=x^2-' + P + '$, donc l\'équation $f(x)=g(x)$ s\'écrit $x^2-' + P + '=' + gexp + '$, ce qui n\'est pas la même équation.', 'Нет: $' + fdef + '=x^2-' + P + '$, поэтому уравнение $f(x)=g(x)$ записывается как $x^2-' + P + '=' + gexp + '$, а это другое уравнение.'),
          L('Oui, car le nombre ' + n + ' est une solution des deux équations.', 'Да, потому что число ' + n + ' — решение обоих уравнений.'),
          L('Non : l\'équation $f(x)=g(x)$ a deux solutions, alors que l\'équation $x^2-' + n2 + '=0$ n\'en a qu\'une, le nombre ' + n + '.', 'Нет: у уравнения $f(x)=g(x)$ два решения, а у уравнения $x^2-' + n2 + '=0$ только одно — число ' + n + '.')], 0),
        sol: [['Раскрываем скобки в $f(x)$ — каждое слагаемое первой скобки умножаем на каждое слагаемое второй:', fdef + '=x^2+' + b + 'x-' + a + 'x-' + P + '=' + fexp],
          ['Уравнение $f(x)=g(x)$:', fexp + '=' + gexp],
          ['Вычитаем из обеих частей $' + cf(m, 'x') + '$, а затем ' + (c > 0 ? 'вычитаем ' + c : 'прибавляем ' + (-c)) + ' — решения при этом не меняются:', 'x^2-' + P + '=' + c + ';x^2-' + n2 + '=0'],
          'Получилось в точности уравнение $x^2-' + n2 + '=0$, значит, решения те же: ' + n + ' и ' + nf(-n) + ' — их мы и нашли по таблице и по графику.',
          'Запись $' + fdef + '=x^2-' + P + '$ — ошибка: потеряны слагаемые $' + b + 'x$ и $-' + a + 'x$. Одного общего решения мало, чтобы утверждать, что совпадают все решения. А у уравнения $x^2-' + n2 + '=0$ решений два: ' + n + ' и ' + nf(-n) + '.'] }] };
  } });

/* =====================================================================================================
   p2.perimetres-egaux : expression littérale, programme Scratch (test d'égalité), tableur, encadrement d'une solution, équation
   ===================================================================================================== */
/* rectangle : AB = a1·x + b1, BC = x − b2 → périmètre Ax + B ; triangle isocèle : IJ = IK = c1·x + d1, JK = c2·x + d2 → périmètre Cx + D ;
   the two perimeters are equal for xs, a number with one decimal between two rows n and n + 1 of the spreadsheet */
const PD_PER = (() => {
  const out = [];
  for (const a1 of [2, 3]) for (let b1 = 1; b1 <= 6; b1++) for (let b2 = 1; b2 <= 5; b2++) for (const c1 of [1, 2]) for (let d1 = 1; d1 <= 6; d1++) for (const c2 of [1, 2, 3]) for (let d2 = 0; d2 <= 5; d2++) {
    const A = 2 * (a1 + 1), B = 2 * (b1 - b2), C = 2 * c1 + c2, D = 2 * d1 + d2, xmin = b2 + 1, xs = (D - B) / (A - C), n = Math.floor(xs);
    if (A <= C || B === 0 || !pdIsD(xs, 1) || Number.isInteger(xs) || n < xmin || n > xmin + 4) continue;
    if ((c1 === c2 && d1 === d2) || 2 * (c1 * xmin + d1) <= c2 * xmin + d2 || 2 * (c1 * 20 + d1) <= c2 * 20 + d2) continue;   /* a real triangle, not equilateral */
    if (A === 8 && B === -2 && C === 6 && D === 9) continue;                                                              /* the original exercise */
    if ((d1 + d2 + b1) % 3) continue;                                                                                    /* keeps one set out of three: the list stays short */
    out.push({ a1, b1, b2, c1, d1, c2, d2, A, B, C, D, xmin, xs, n });
  }
  return out;
})();
const pdLinTx = (a, b) => (a === 1 ? '' : a) + '<tspan font-style="italic">x</tspan>' + (b > 0 ? ' + ' + b : b < 0 ? ' − ' + (-b) : '');   /* 3x + 4 on a figure */
function pdPerFig(d) {
  const A = [22, 44], B = [134, 44], C = [134, 106], D = [22, 106], I = [281, 36], J = [238, 114], K = [324, 114];
  return svgFig(340, 140, pdPl([A, B, C, D], 'fl', true) + pdPl([I, J, K], 'fl', true) + pdTick(I, J, 2) + pdTick(I, K, 2) +
    pdTx([14, 40], 'A') + pdTx([142, 40], 'B') + pdTx([142, 120], 'C') + pdTx([14, 120], 'D') + pdTx([281, 28], 'I') + pdTx([230, 128], 'J') + pdTx([332, 128], 'K') +
    pdTx([78, 36], pdLinTx(d.a1, d.b1)) + pdTx([140, 80], pdLinTx(1, -d.b2), 'ftx', 'start') + pdTx([252, 74], pdLinTx(d.c1, d.d1), 'ftx', 'end') + pdTx([281, 132], pdLinTx(d.c2, d.d2)),
    'Rectangle ABCD et triangle isocèle IJK');
}
pdProb({ id: 'p2.perimetres-egaux', ch: 'cl', lvl: 2, pts: 4,
  ru: 'Равные периметры: программа, таблица, уравнение', fr: 'Périmètres égaux : programme, tableur, équation',
  src: 'Polynésie 2026 · exercice 1',
  gen(r) {
    const d = r.pick(PD_PER), { a1, b1, b2, A, B, C, D, xmin, xs, n } = d, nm = r.pick(PRENOMS_F);
    const R = x => A * x + B, T = x => C * x + D, sg = v => (v > 0 ? '+' + v : String(v)), eR = lin(A, B), eT = lin(C, D);
    let xa, xt; do { xa = r.pick([10, 12, 15, 20]); xt = xmin + r.ri(6, 12); } while (xa <= xmin + 5 || xt === xa || A * (xt + B) === C * (xt + D));
    const ABv = a1 * xa + b1, BCv = xa - b2, Pv = R(xa);
    const prog = pdScratch([
      { k: 'hat', d: 0, c: 'ev', n: 1, p: ['quand', { flag: 1 }, 'est cliqué'] },
      { d: 0, c: 'sns', n: 2, p: ['demander', { n: 'Valeur de x ?' }, 'et attendre'] },
      { d: 0, c: 'vr', n: 3, p: ['mettre', { dd: 'rect' }, 'à', { op: [{ op: [{ n: String(A) }, '*', { sv: 'réponse' }] }, B > 0 ? '+' : '-', { n: String(Math.abs(B)) }] }] },
      { d: 0, c: 'vr', n: 4, p: ['mettre', { dd: 'tri' }, 'à', { op: [{ op: [{ n: String(C) }, '*', { sv: 'réponse' }] }, '+', { n: String(D) }] }] },
      { k: 'c', d: 0, c: 'ctl', n: 5, p: ['si', { bo: [{ v: 'rect' }, '=', { v: 'tri' }] }, 'alors'] },
      { d: 1, c: 'lk', n: 6, p: ['dire', { n: 'Périmètres égaux' }] },
      { k: 'else', d: 0, c: 'ctl', n: 7, p: ['sinon'] },
      { d: 1, c: 'lk', n: 8, p: ['dire', { n: 'Périmètres différents' }] },
      { k: 'end', d: 0, c: 'ctl' }], 'Programme Scratch qui compare les deux périmètres');
    const rows = [['<i>x</i>', 'Périmètre du rectangle', 'Périmètre du triangle']]; for (let x = xmin; x <= xmin + 5; x++) rows.push([String(x), String(R(x)), String(T(x))]);
    const F0 = '=' + A + '*A2' + sg(B);
    const ctx = L('Dans cet exercice, $x$ désigne un nombre supérieur ou égal à ' + xmin + '. On considère le rectangle ABCD et le triangle isocèle IJK représentés ci-dessous ; les longueurs sont exprimées en fonction de $x$.',
      'В этой задаче $x$ — число, не меньшее ' + xmin + '. Даны прямоугольник ABCD и равнобедренный треугольник IJK (рисунок ниже); длины сторон выражены через $x$: AB = $' + lin(a1, b1) + '$, BC = $' + lin(1, -b2) + '$, IJ = IK = $' + lin(d.c1, d.d1) + '$, JK = $' + lin(d.c2, d.d2) + '$.');
    return { ctx, fig: pdPerFig(d), qs: [
      { q: L('Calculer la longueur AB, puis le périmètre du rectangle ABCD, pour $x=' + xa + '$.', 'Вычисли длину AB, а затем периметр прямоугольника ABCD при $x=' + xa + '$.'),
        ans: multi(['AB =', N(ABv)], [L('Périmètre =', 'Периметр ='), N(Pv)]), sol: [
          ['Подставляем ' + xa + ' вместо $x$ в выражение для AB (сначала умножение, потом сложение):', 'AB=' + a1 + '*' + xa + '+' + b1 + '=' + ABv],
          ['Так же находим ширину:', 'BC=' + xa + '-' + b2 + '=' + BCv],
          ['У прямоугольника две стороны длиной AB и две длиной BC, поэтому периметр — удвоенная сумма длины и ширины:', '2*(' + ABv + '+' + BCv + ')=2*' + (ABv + BCv) + '=' + Pv]],
        redac: ['Pour $x=' + xa + '$ : $AB=' + a1 + '*' + xa + '+' + b1 + '=' + ABv + '$ et $BC=' + xa + '-' + b2 + '=' + BCv + '$.',
          'Périmètre du rectangle : $2*(' + ABv + '+' + BCv + ')=2*' + (ABv + BCv) + '=' + Pv + '$.',
          'Pour $x=' + xa + '$, la longueur AB est ' + ABv + ' et le périmètre du rectangle ABCD est ' + Pv + '.'] },
      { q: L('Exprimer le périmètre du rectangle ABCD en fonction de $x$. Donner une expression développée et réduite.', 'Вырази периметр прямоугольника ABCD через $x$. Запиши выражение с раскрытыми скобками и приведёнными подобными.'), ans: XP(eR, { forms: ['expanded'] }), sol: [
          ['Периметр — удвоенная сумма длины и ширины. Сначала складываем длину и ширину, приводя подобные:', lin(a1, b1) + '+x-' + b2 + '=' + lin(a1 + 1, b1 - b2)],
          ['Умножаем на 2 каждое слагаемое в скобках:', '2(' + lin(a1 + 1, b1 - b2) + ')=' + eR],
          'Проверка: при $x=' + xa + '$ получаем ' + A + ' × ' + xa + ' ' + (B > 0 ? '+ ' + B : '− ' + (-B)) + ' = ' + Pv + ' — столько же, сколько в вопросе 1.'],
        redac: ['Le périmètre du rectangle ABCD est $2*(AB+BC)$.',
          '$2(' + lin(a1, b1) + '+x-' + b2 + ')=2(' + lin(a1 + 1, b1 - b2) + ')=' + eR + '$',
          'Le périmètre du rectangle ABCD est $' + eR + '$.'] },
      { q: L('On admet que le périmètre du triangle IJK est $' + eT + '$. ' + nm + ' cherche une valeur de $x$ pour laquelle les deux périmètres sont égaux : elle écrit le programme Scratch ci-dessous. Que dit le programme si l\'on saisit le nombre ' + xt + ' ? Choisir la réponse correctement justifiée.',
          'Примем, что периметр треугольника IJK равен $' + eT + '$. ' + nm + ' ищет значение $x$, при котором периметры равны, и пишет программу Scratch (ниже): «réponse» — введённое число, «mettre … à …» — присвоить, «si … alors … sinon …» — если … то … иначе …, «dire» — показать. Что покажет программа, если ввести число ' + xt + '? Выбери ответ с верным обоснованием.'),
        fig: prog, red: true, ans: MQ(r, [
          L('« Périmètres différents », car $' + A + '*' + xt + sg(B) + '=' + R(xt) + '$ et $' + C + '*' + xt + '+' + D + '=' + T(xt) + '$ : les deux nombres ne sont pas égaux.', '«Périmètres différents» (периметры разные): $' + A + '*' + xt + sg(B) + '=' + R(xt) + '$ и $' + C + '*' + xt + '+' + D + '=' + T(xt) + '$ — эти числа не равны.'),
          L('« Périmètres différents », car $' + A + '*(' + xt + sg(B) + ')=' + A * (xt + B) + '$ et $' + C + '*(' + xt + '+' + D + ')=' + C * (xt + D) + '$ : les deux nombres ne sont pas égaux.', '«Périmètres différents» (периметры разные): $' + A + '*(' + xt + sg(B) + ')=' + A * (xt + B) + '$ и $' + C + '*(' + xt + '+' + D + ')=' + C * (xt + D) + '$ — эти числа не равны.'),
          L('« Périmètres égaux », car le programme calcule les deux périmètres avec la même valeur de $x$.', '«Périmètres égaux» (периметры равны): программа считает оба периметра при одном и том же значении $x$.'),
          L('Les nombres ' + R(xt) + ' et ' + T(xt) + ' : le programme affiche les deux périmètres.', 'Числа ' + R(xt) + ' и ' + T(xt) + ': программа показывает оба периметра.')], 0),
        sol: ['Строки 3 и 4 считают два периметра для введённого числа. В выражении «' + A + ' * réponse ' + (B > 0 ? '+ ' + B : '− ' + (-B)) + '» сначала выполняется умножение (внутренний блок), потом ' + (B > 0 ? 'сложение' : 'вычитание') + '.',
          ['Для числа ' + xt + ':', A + '*' + xt + sg(B) + '=' + R(xt) + ';' + C + '*' + xt + '+' + D + '=' + T(xt)],
          'Строка 5 проверяет, равны ли эти числа. ' + R(xt) + ' ≠ ' + T(xt) + ', поэтому выполняется ветка «sinon» (иначе): программа показывает «Périmètres différents».',
          'Сами числа программа не показывает — только одну из двух фраз. Вариант со скобками вокруг суммы нарушает порядок действий. А одинаковое значение $x$ не означает одинаковых периметров.'] },
      { q: L(nm + ' utilise ensuite un tableur pour calculer les deux périmètres pour plusieurs valeurs de $x$ (tableau ci-dessous). Parmi les formules suivantes, laquelle a-t-elle saisie dans la cellule B2 avant de l\'étirer vers le bas ?',
          'Затем ' + nm + ' считает оба периметра в электронной таблице для нескольких значений $x$ (таблица ниже: столбец B — периметр прямоугольника, столбец C — периметр треугольника). Какую из формул она ввела в ячейку B2, прежде чем протянуть её вниз?'),
        fig: pdSheet(rows), ans: MQ(r, [F0, '=' + A + '*' + xmin + sg(B), '=' + A + '*B2' + sg(B), '=' + A + '*A1' + sg(B)], 0), sol: [
          'В столбце B — периметр прямоугольника $' + eR + '$, а значение $x$ стоит в той же строке в столбце A. Для строки 2 это ячейка A2.',
          'При протягивании вниз ссылка A2 сама меняется на A3, A4, … — в каждой строке берётся своё значение $x$.',
          'Формула с числом ' + xmin + ' даёт верный результат в B2, но при протягивании не меняется. Ссылка на B2 — это ссылка ячейки на саму себя. А в A1 записан заголовок, а не число.'],
        redac: ['La valeur de $x$ se trouve dans la cellule A2.',
          'La formule saisie dans la cellule B2 est : ' + F0] },
      { q: L('En observant le tableau, ' + nm + ' affirme : « S\'il existe une valeur de $x$ pour laquelle les deux périmètres sont égaux, elle est comprise entre ' + n + ' et ' + (n + 1) + '. » Quelle explication justifie cette affirmation ?',
          'Глядя на таблицу, ' + nm + ' утверждает: «Если существует значение $x$, при котором периметры равны, то оно лежит между ' + n + ' и ' + (n + 1) + '». Какое объяснение обосновывает это утверждение?'), red: true,
        ans: MQ(r, [
          L('Pour $x=' + n + '$, le périmètre du rectangle (' + R(n) + ') est inférieur à celui du triangle (' + T(n) + ') ; pour $x=' + (n + 1) + '$, il est supérieur (' + R(n + 1) + ' contre ' + T(n + 1) + '). Les deux périmètres sont donc égaux pour une valeur de $x$ comprise entre ' + n + ' et ' + (n + 1) + '.',
            'При $x=' + n + '$ периметр прямоугольника (' + R(n) + ') меньше периметра треугольника (' + T(n) + '); при $x=' + (n + 1) + '$ он больше (' + R(n + 1) + ' против ' + T(n + 1) + '). Значит, периметры равны при каком-то значении $x$ между ' + n + ' и ' + (n + 1) + '.'),
          L('Pour $x=' + n + '$ et pour $x=' + (n + 1) + '$, les deux périmètres sont égaux.', 'При $x=' + n + '$ и при $x=' + (n + 1) + '$ периметры равны.'),
          L('Entre ' + n + ' et ' + (n + 1) + ', les deux périmètres augmentent plus vite que dans le reste du tableau.', 'Между ' + n + ' и ' + (n + 1) + ' оба периметра растут быстрее, чем в остальной таблице.'),
          L('C\'est pour ces deux valeurs de $x$ que les deux périmètres sont les plus grands.', 'Именно при этих двух значениях $x$ оба периметра самые большие.')], 0),
        sol: ['Сравниваем столбцы B и C строка за строкой. До $x=' + n + '$ включительно периметр прямоугольника меньше: ' + R(n) + ' < ' + T(n) + '. Начиная с $x=' + (n + 1) + '$ он больше: ' + R(n + 1) + ' > ' + T(n + 1) + '.',
          'Периметр прямоугольника растёт быстрее (на ' + A + ' за каждую единицу, а у треугольника — на ' + C + '), поэтому он «обгоняет» периметр треугольника. Обгон происходит где-то между ' + n + ' и ' + (n + 1) + ' — там периметры и равны.',
          'Остальные объяснения противоречат таблице: равных значений в ней нет, оба периметра растут равномерно, а самые большие значения — в последней строке.'] },
      { q: L('Résoudre l\'équation $' + eR + '=' + eT + '$ pour trouver la valeur exacte de $x$ pour laquelle les deux périmètres sont égaux.', 'Реши уравнение $' + eR + '=' + eT + '$, чтобы найти точное значение $x$, при котором периметры равны.'), ans: N(fx(xs)), sol: [
          ['Собираем слагаемые с $x$ слева: вычитаем $' + C + 'x$ из обеих частей.', lin(A - C, B) + '=' + D],
          [(B > 0 ? 'Вычитаем ' + B + ' из обеих частей:' : 'Прибавляем ' + (-B) + ' к обеим частям:'), (A - C) + 'x=' + (D - B)],
          ['Делим обе части на ' + (A - C) + ':', 'x=' + (D - B) + '/' + (A - C) + '=' + fx(xs)],
          'Проверка: при $x=' + fx(xs) + '$ оба периметра равны ' + nf(+(A * xs + B).toFixed(2)) + '. И число ' + nf(xs) + ' действительно лежит между ' + n + ' и ' + (n + 1) + '.'],
        redac: ['$' + eR + '=' + eT + '$',
          '$' + A + 'x-' + C + 'x=' + D + sg(-B) + '$',
          '$' + (A - C) + 'x=' + (D - B) + '$, donc $x=' + (D - B) + '/' + (A - C) + '=' + fx(xs) + '$.',
          'Les deux périmètres sont égaux pour $x=' + fx(xs) + '$.'] }] };
  } });

/* =====================================================================================================
   p2.medaille-surf : coordonnées géographiques, durées, volume d'un cylindre, masse volumique
   ===================================================================================================== */
/* médaille : cylindre de diamètre d et de hauteur h (cm) ; V arrondi au dixième, masse arrondie au gramme (the same with V exact or rounded) */
const PD_MED = (() => {
  const out = [];
  for (const d of [6, 6.5, 7, 7.5, 8, 9, 9.5]) for (const h of [0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.2]) {
    const R = d / 2, V = Math.PI * R * R * h, W = [Math.PI * d * d * h, 2 * Math.PI * R * h, Math.PI * R * h * h], m1 = V * 10.5, m2 = pdRd(V, 1) * 10.5;
    if (pdBad(V, 1) || W.some(w => pdTie(w, 1)) || new Set([V].concat(W).map(w => pdK(w, 1))).size < 4) continue;
    if (pdTie(m1, 0, 0.08) || pdTie(m2, 0, 0.08) || pdK(m1, 0) !== pdK(m2, 0)) continue;
    out.push({ d, h, R, V, W, m: m1 });
  }
  return out;
})();
const pdHM = (mn, ru) => { const h = Math.floor(mn / 60), m = mn % 60; return h + (ru ? ' ч' : ' h') + (m ? ' ' + m + (ru ? ' мин' : ' min') : ''); };
/* a map with meridians and parallels every 10° (numbers every 20°): the town A and the island T */
function pdMap(lonA, latA, lonT, latT) {
  const L0 = 48, T0 = 24, CW = 30, CH = 23, X = lon => L0 + (180 - lon) / 10 * CW, Y = lat => T0 + (50 - lat) / 10 * CH;
  let s = '';
  for (let lon = 180; lon >= 90; lon -= 10) s += '<line class="' + (lon % 20 ? 'fgrid' : 'fl2') + '" x1="' + X(lon) + '" y1="' + T0 + '" x2="' + X(lon) + '" y2="' + Y(-40) + '"/>' + (lon % 20 || lon === 180 ? '' : pdTx([X(lon), T0 - 7], lon + '°O', 'ftm'));
  for (let lat = 50; lat >= -40; lat -= 10) s += '<line class="' + (lat === 0 ? 'fax' : lat % 20 ? 'fgrid' : 'fl2') + '" x1="' + L0 + '" y1="' + Y(lat) + '" x2="' + X(90) + '" y2="' + Y(lat) + '"/>' + (lat % 20 ? '' : pdTx([L0 - 5, Y(lat) + 4.5], Math.abs(lat) + '°' + (lat > 0 ? 'N' : lat < 0 ? 'S' : ''), 'ftm', 'end'));
  s += pdTx([X(90) - 4, Y(0) - 5], 'équateur', 'ftm', 'end');
  s += pdDot([X(lonA), Y(latA)]) + pdTx([X(lonA) + 7, Y(latA) - 6], 'A', 'ftx', 'start') + pdDot([X(lonT), Y(latT)]) + pdTx([X(lonT) + 7, Y(latT) - 6], 'T', 'ftx', 'start');
  return svgFig(340, T0 + 9 * CH + 10, s, 'Carte avec méridiens et parallèles : ville A et île T');
}
pdProb({ id: 'p2.medaille-surf', ch: 'gm', lvl: 2, pts: 4,
  ru: 'Поездка на соревнования и медаль', fr: 'Un voyage et une médaille',
  src: 'Polynésie 2026 · exercice 3',
  gen(r) {
    const nm = r.pick(PRENOMS_F.concat(PRENOMS_M)), md = r.pick(PD_MED), { d, h, R, V, W } = md, mass = md.m;
    const lonA = r.pick([100, 110, 120, 130]), latA = r.pick([30, 40]), lonT = r.pick([140, 150, 160]), latT = r.pick([10, 20, 30]);   /* not 170: the next meridian, 180°, is neither east nor west */
    let tot, wt, fl; do { wt = r.ri(1, 3) * 60 + r.pick([20, 25, 35, 40, 45, 50]); tot = r.ri(18, 27) * 60 + r.pick([5, 10, 15, 20, 30]); fl = tot - wt; } while (tot % 60 >= wt % 60 || fl % 60 === wt % 60 || (tot === 1330 && wt === 140) || Math.floor(fl / 60) === fl % 60);
    const co = (lo, e, la, s) => '(' + lo + ' °' + e + ' ; ' + la + ' °' + s + ')', mer = lonT % 20 ? 'au milieu entre les méridiens ' + (lonT + 10) + ' °O et ' + (lonT - 10) + ' °O' : 'sur le méridien ' + lonT + ' °O', par = latT % 20 ? 'au milieu entre l\'équateur et le parallèle 20 °S' : 'sur le parallèle ' + latT + ' °S';
    const parT = latT === 30 ? 'au milieu entre les parallèles 20 °S et 40 °S' : par;
    const vT = (f, v) => '$$V=' + f + '\\approx ' + pdTk(v, 1) + '$$', rT = pdT(R), dT = pdT(d), hT = pdT(h);
    const ray = 'Le rayon est $' + fx(d) + '÷2=' + fx(R) + '$ cm, donc ', rayRu = 'Радиус равен $' + fx(d) + '÷2=' + fx(R) + '$ см, поэтому ';
    const ctx = L(nm + ' part assister à une compétition de surf organisée sur une île de l\'océan Pacifique. Le voyage se fait en avion, avec une escale dans une ville notée A sur la carte ci-dessous ; l\'île est notée T.',
      nm + ' летит на соревнования по сёрфингу, которые проходят на одном из островов Тихого океана. Летят с пересадкой («escale») в городе, обозначенном на карте буквой A; остров обозначен буквой T. На карте: «équateur» — экватор, N — север, S — юг, O — запад («ouest»).');
    return { ctx, fig: pdMap(lonA, latA, lonT, -latT), qs: [
      { q: L('Les coordonnées géographiques approximatives de la ville A sont ' + co(lonA, 'O', latA, 'N') + '. Écrites de la même façon, quelles sont les coordonnées géographiques approximatives de l\'île T ?', 'Приблизительные географические координаты города A — ' + co(lonA, 'O', latA, 'N') + '. Каковы записанные таким же образом приблизительные географические координаты острова T?'),
        ans: MQ(r, [co(lonT, 'O', latT, 'S'), co(lonT, 'O', latT, 'N'), co(lonT, 'E', latT, 'S'), co(latT, 'O', lonT, 'S')], 0), sol: [
          'Первое число — долгота («longitude»): её читают по вертикальным линиям, меридианам, подписанным вверху. Остров T лежит ' + (lonT % 20 ? 'на линии посередине между ' + (lonT + 10) + '° и ' + (lonT - 10) + '°' : 'на линии ' + lonT + '°') + ' — это ' + lonT + ' °O. Все меридианы этой карты — западные («ouest», O), как и у города A.',
          'Второе число — широта («latitude»): её читают по горизонтальным линиям, параллелям, подписанным слева. Остров лежит ниже экватора ' + (latT % 20 ? 'посередине между двумя подписанными параллелями' : 'на линии ' + latT + '°') + ' — это ' + latT + ' °S. Ниже экватора широта южная («sud», S), выше — северная («nord», N).',
          'Проверка по городу A: он на ' + lonA + ' °O и выше экватора, на ' + latA + ' °N — как и сказано в условии. Широта не бывает больше 90°, поэтому запись с ' + lonT + ' °S невозможна.'],
        redac: ['L\'île T se trouve ' + mer + ' et, au sud de l\'équateur, ' + parT + '.',
          'Les coordonnées géographiques approximatives de l\'île T sont ' + co(lonT, 'O', latT, 'S') + '.'] },
      { q: L('Le trajet comprend deux vols, séparés par une attente de ' + pdHM(wt) + ' dans la ville A. En comptant cette attente, la totalité du trajet a duré ' + pdHM(tot) + '. Calculer la durée totale des deux vols, en heures et minutes.',
          'Путь состоит из двух перелётов, между которыми — ожидание ' + pdHM(wt, 1) + ' в городе A. Вместе с ожиданием весь путь занял ' + pdHM(tot, 1) + '. Вычисли общую продолжительность двух перелётов в часах и минутах.'),
        ans: multi([null, N(Math.floor(fl / 60), { unit: 'h' })], [null, N(fl % 60, { unit: 'min' })]), sol: [
          'Время в полёте — это весь путь без ожидания: нужно вычесть ' + pdHM(wt, 1) + ' из ' + pdHM(tot, 1) + '.',
          'Минут не хватает: ' + (tot % 60) + ' меньше, чем ' + (wt % 60) + '. Поэтому «занимаем» один час и превращаем его в 60 минут: ' + pdHM(tot, 1) + ' = ' + (Math.floor(tot / 60) - 1) + ' ч ' + (tot % 60 + 60) + ' мин.',
          'Теперь вычитаем отдельно часы и отдельно минуты: ' + (Math.floor(tot / 60) - 1) + ' − ' + Math.floor(wt / 60) + ' = ' + Math.floor(fl / 60) + ' ч и ' + (tot % 60 + 60) + ' − ' + (wt % 60) + ' = ' + (fl % 60) + ' мин.',
          'Ошибка — считать как с десятичными числами: в часе 60 минут, а не 100.'],
        redac: [pdHM(tot) + ' = ' + (Math.floor(tot / 60) - 1) + ' h ' + (tot % 60 + 60) + ' min, car 1 h = 60 min.',
          (Math.floor(tot / 60) - 1) + ' h ' + (tot % 60 + 60) + ' min − ' + pdHM(wt) + ' = ' + pdHM(fl) + '.',
          'Les deux vols ont duré ' + pdHM(fl) + ' au total.'] },
      { q: L('Les médailles de la compétition sont en argent. Une médaille a la forme d\'un cylindre de diamètre ' + nf(d) + ' cm et de hauteur ' + nf(h) + ' cm. On rappelle que le volume d\'un cylindre de rayon $R$ et de hauteur $h$ est $$V=\\pi\\times R^2\\times h$$. Calculer le volume d\'une médaille, en cm³, arrondi au dixième. Choisir la réponse correctement justifiée.',
          'Медали соревнований сделаны из серебра. Медаль имеет форму цилиндра диаметром ' + nf(d) + ' см и высотой ' + nf(h) + ' см. Напомним: объём цилиндра радиуса $R$ и высоты $h$ равен $$V=\\pi\\times R^2\\times h$$. Вычисли объём медали в см³ с округлением до десятых. Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          L(ray + vT('\\pi\\times ' + rT + '^2\\times ' + hT, V) + ' cm³.', rayRu + vT('\\pi\\times ' + rT + '^2\\times ' + hT, V) + ' см³.'),
          L(vT('\\pi\\times ' + dT + '^2\\times ' + hT, W[0]) + ' cm³.', vT('\\pi\\times ' + dT + '^2\\times ' + hT, W[0]) + ' см³.'),
          L(ray + vT('2\\times\\pi\\times ' + rT + '\\times ' + hT, W[1]) + ' cm³.', rayRu + vT('2\\times\\pi\\times ' + rT + '\\times ' + hT, W[1]) + ' см³.'),
          L(ray + vT('\\pi\\times ' + rT + '\\times ' + hT + '^2', W[2]) + ' cm³.', rayRu + vT('\\pi\\times ' + rT + '\\times ' + hT + '^2', W[2]) + ' см³.')], 0),
        sol: ['В формуле стоит радиус, а в условии дан диаметр. Радиус — половина диаметра: ' + nf(d) + ' ÷ 2 = ' + nf(R) + ' см.',
          { t: 'В квадрат возводится только радиус:', tex: 'V=\\pi\\times ' + rT + '^2\\times ' + hT + '\\approx ' + pdTk(V, 1) },
          'Если подставить диаметр вместо радиуса, объём получится в 4 раза больше. Выражение 2 × π × R × h — это площадь боковой поверхности, а не объём. А возводить в квадрат высоту вместо радиуса — значит перепутать, к чему относится показатель степени.'] },
      { q: L('L\'argent a une masse volumique de 10,5 g/cm³. Calculer la masse d\'une médaille, en grammes. Arrondir à l\'unité.', 'Плотность серебра («masse volumique») равна 10,5 г/см³. Вычисли массу медали в граммах. Округли до целых.'), ans: pdNR(mass, 0, 'g'), sol: [
          'Плотность 10,5 г/см³ означает: каждый кубический сантиметр серебра весит 10,5 г. Объём медали — примерно ' + pdS(V, 1) + ' см³ (вопрос 3), значит, масса в ' + pdS(V, 1) + ' раза больше, чем 10,5 г.',
          { t: 'Умножаем объём на плотность:', tex: pdTk(V, 1) + '\\times 10{,}5\\approx ' + pdK(mass, 0) },
          'Делить объём на 10,5 (или 10,5 на объём) — ошибка: проверь по единицам, г/см³ × см³ = г.'],
        redac: ['Une masse volumique de 10,5 g/cm³ signifie que 1 cm³ d\'argent a une masse de 10,5 g.',
          '$$' + pdTk(V, 1) + '\\times 10{,}5\\approx ' + pdK(mass, 0) + '$$',
          'La masse d\'une médaille est d\'environ ' + pdK(mass, 0) + ' g.'] }] };
  } });

/* ---------- the path of the Scratch sprite ---------- */
/* ops: ['F', n] avancer · ['L', a] tourner à gauche · ['R', a] tourner à droite · ['U'] relever le stylo · ['D'] stylo en position d'écriture · ['REP', k, ops]
   returns the segments drawn (y up); the sprite starts at (0 ; 0) and looks to the right */
function pdTurtle(ops) {
  const st = { x: 0, y: 0, th: 0, pen: true, segs: [] };
  const run = list => list.forEach(o => {
    if (o[0] === 'F') { const nx = st.x + o[1] * Math.cos(st.th * Math.PI / 180), ny = st.y + o[1] * Math.sin(st.th * Math.PI / 180); if (st.pen) st.segs.push([[st.x, st.y], [nx, ny]]); st.x = nx; st.y = ny; }
    else if (o[0] === 'L') st.th += o[1]; else if (o[0] === 'R') st.th -= o[1];
    else if (o[0] === 'U') st.pen = false; else if (o[0] === 'D') st.pen = true;
    else if (o[0] === 'REP') for (let i = 0; i < o[1]; i++) run(o[2]);
  });
  run(ops); return st.segs;
}
const pdPoly = (k, s, a) => ['REP', k, [['F', s], ['L', a]]];          /* a regular polygon traced by turning left */
/* several drawings of the sprite at the same scale, perRow in a row: cells = [{ segs, cap }]; the dot is the starting point */
function pdDrawings(cells, perRow, cw, ch, label) {
  const bb = cells.map(c => { const xs = [0], ys = [0]; c.segs.forEach(sg => sg.forEach(p => { xs.push(p[0]); ys.push(p[1]); })); return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; });
  const k = Math.min(...bb.map(b => Math.min((cw - 24) / ((b.x1 - b.x0) || 1), (ch - 36) / ((b.y1 - b.y0) || 1))));
  let s = '';
  cells.forEach((c, i) => {
    const b = bb[i], cx = (i % perRow) * cw, cy = Math.floor(i / perRow) * ch, ox = cx + (cw - k * (b.x1 - b.x0)) / 2, oy = cy + 24 + (ch - 30 - k * (b.y1 - b.y0)) / 2;
    const P = p => [ox + (p[0] - b.x0) * k, oy + (b.y1 - p[1]) * k], o = P([0, 0]);
    s += pdTx([cx + cw / 2, cy + 15], c.cap) + c.segs.map(sg => pdLn(P(sg[0]), P(sg[1]))).join('') + '<circle cx="' + pdC(o[0]) + '" cy="' + pdC(o[1]) + '" r="3.4" class="fpt"/>';
  });
  return svgFig(Math.round(perRow * cw), Math.ceil(cells.length / perRow) * ch, s, label);
}

/* =====================================================================================================
   p2.scratch-carre-triangle : angles d'un carré et d'un triangle équilatéral, blocs Scratch, échelle, figure obtenue
   ===================================================================================================== */
function pdCtFig(s) {
  const q = Math.sqrt(3) / 2, T = pdFit([[0.5, q], [-0.42, -0.727], [1, -1], [0, -1]], 340, 236, 30);
  const A = T([0, 0]), B = T([1, 0]), C = T([1, -1]), D = T([0, -1]), F = T([0.5, q]), E = T([-0.42, -0.727]), G = [(A[0] + B[0] + F[0]) / 3, (A[1] + B[1] + F[1]) / 3];
  return svgFig(340, 236, pdPl([A, B, C, D], 'fl', true) + pdLn(B, F) + pdLn(F, E) + pdArc(A, E, D, 24) + [A, B, C, D, E, F].map(pdDot).join('') + pdLen(A, F, nf(s) + ' cm', G, 22) +
    pdLab(A, 'A', pdDir(-1, -0.25), 15) + pdLab(B, 'B', pdDir(1, -0.2)) + pdLab(C, 'C', pdDir(0.7, 1)) + pdLab(D, 'D', pdDir(-0.2, 1), 15) + pdLab(F, 'F', pdDir(0, -1)) + pdLab(E, 'E', pdDir(-0.9, 0.6)), 'Carré ABCD, triangle équilatéral ABF et point E aligné avec F et A');
}
pdProb({ id: 'p2.scratch-carre-triangle', ch: 'al', lvl: 2, pts: 3,
  ru: 'Квадрат и треугольник в Scratch', fr: 'Un carré et un triangle avec Scratch',
  src: 'Asie 2026 · exercice 4',
  gen(r) {
    const [s, pas] = r.pick([[3, 10], [5, 10], [6, 10], [7, 10], [8, 10], [3, 20], [4, 20], [5, 20], [7, 20]]), J = s * pas, v = r.ri(0, 3);
    const aEq = (n, d) => '$$\\widehat{' + n + '}=' + d + '^{\\circ}$$';
    const blk = (nm, l1, l2) => [{ k: 'hat', d: 0, c: 'my', p: ['définir ' + nm] }, { k: 'c', d: 0, c: 'ctl', p: ['répéter', l1, 'fois'] }, { d: 1, c: 'mv', p: ['avancer de', { bl: 'J' }, 'pas'] }, { d: 1, c: 'mv', p: ['tourner ↺ de', { bl: l2 }, 'degrés'] }, { k: 'end', d: 0, c: 'ctl' }];
    const blocs = pdScratch(blk('Triangle', { n: '3' }, 'K'), 'Le bloc Triangle', 'Le bloc Triangle') + pdScratch(blk('Carré', { bl: 'M' }, 'N'), 'Le bloc Carré', 'Le bloc Carré');
    const extra = [null, { d: 0, c: 'mv', n: 7, p: ['tourner ↻ de', { n: '90' }, 'degrés'] }, { d: 0, c: 'mv', n: 7, p: ['avancer de', { n: String(J) }, 'pas'] }, { d: 0, c: 'mv', n: 7, p: ['tourner ↺ de', { n: '60' }, 'degrés'] }][v];
    const main = pdScratch([
      { k: 'hat', d: 0, c: 'ev', n: 1, p: ['quand', { flag: 1 }, 'est cliqué'] },
      { d: 0, c: 'pen', n: 2, p: ['effacer tout'] },
      { d: 0, c: 'mv', n: 3, p: ['aller à x:', { n: '0' }, 'y:', { n: '0' }] },
      { d: 0, c: 'mv', n: 4, p: ['s\'orienter à', { n: '90' }] },
      { d: 0, c: 'pen', n: 5, p: ['stylo en position d\'écriture'] },
      { d: 0, c: 'my', n: 6, p: ['Triangle'] }].concat(extra ? [extra] : [], [{ d: 0, c: 'my', n: extra ? 8 : 7, p: ['Carré'] }]), 'Programme principal', 'Programme principal');
    const tri = pdPoly(3, J, 120), sq = pdPoly(4, J, 90), kinds = [[tri, sq], [tri, ['R', 90], sq], [tri, ['F', J], sq], [tri, ['L', 60], sq]];
    const perm = r.sh([0, 1, 2, 3]), good = perm.indexOf(v) + 1;
    const figs = pdDrawings(perm.map((t, i) => ({ segs: pdTurtle(kinds[t]), cap: 'Figure ' + (i + 1) })), 2, 170, 136, 'Quatre figures possibles');
    const step = [
      ['Le lutin est revenu à son point de départ, orienté vers la droite : le carré est tracé à partir du même côté que le triangle, et le triangle se trouve à l\'intérieur du carré.', 'Спрайт вернулся в начальную точку и смотрит вправо: квадрат строится на той же стороне, что и треугольник, и по ту же сторону от неё — треугольник оказывается внутри квадрата.'],
      ['Le lutin tourne ensuite de 90° vers la droite : il est orienté vers le bas et trace le carré en dessous du triangle.', 'Затем спрайт поворачивается на 90° вправо: теперь он смотрит вниз и рисует квадрат под треугольником.'],
      ['Le lutin avance ensuite de ' + J + ' pas vers la droite : il trace le carré à partir de l\'autre extrémité du côté du triangle, à droite du triangle.', 'Затем спрайт проходит ' + J + ' шагов вправо и рисует квадрат от другого конца стороны треугольника — справа от треугольника.'],
      ['Le lutin tourne ensuite de 60° vers la gauche : il est orienté le long du côté gauche du triangle et trace le carré sur ce côté, à l\'extérieur du triangle.', 'Затем спрайт поворачивается на 60° влево: теперь он смотрит вдоль левой стороны треугольника и рисует квадрат на этой стороне, снаружи треугольника.']][v];
    const ctx = L('Sur la figure ci-dessous, qui n\'est pas en vraie grandeur, ABCD est un carré et ABF est un triangle équilatéral tel que AF = ' + nf(s) + ' cm. Les points F, A et E sont alignés.',
      'На рисунке (масштаб не соблюдён) ABCD — квадрат, ABF — равносторонний треугольник, AF = ' + nf(s) + ' см. Точки F, A и E лежат на одной прямой.');
    return { ctx, fig: pdCtFig(s), qs: [
      { q: L('Justifier que l\'angle ' + pdAng('EAD') + ' mesure 30°. Choisir la justification correcte.', 'Обоснуй, что угол ' + pdAng('EAD') + ' равен 30°. Выбери верное обоснование.'), red: true,
        ans: MQ(r, [
          L(aEq('FAB', 60) + ' car le triangle ABF est équilatéral, ' + aEq('BAD', 90) + ' car ABCD est un carré et ' + aEq('FAE', 180) + ' car les points F, A et E sont alignés. Donc $$\\widehat{EAD}=180^{\\circ}-60^{\\circ}-90^{\\circ}=30^{\\circ}$$.',
            aEq('FAB', 60) + ', так как треугольник ABF равносторонний, ' + aEq('BAD', 90) + ', так как ABCD — квадрат, и ' + aEq('FAE', 180) + ', так как точки F, A и E лежат на одной прямой. Значит, $$\\widehat{EAD}=180^{\\circ}-60^{\\circ}-90^{\\circ}=30^{\\circ}$$.'),
          L('Le triangle ABF est équilatéral, donc ' + aEq('FAB', 60) + '. La droite (AE) partage cet angle en deux angles égaux, donc $$\\widehat{EAD}=60^{\\circ}\\div 2=30^{\\circ}$$.',
            'Треугольник ABF равносторонний, значит, ' + aEq('FAB', 60) + '. Прямая (AE) делит этот угол на два равных, поэтому $$\\widehat{EAD}=60^{\\circ}\\div 2=30^{\\circ}$$.'),
          L('ABCD est un carré, donc ' + aEq('BAD', 90) + '. La droite (AE) partage cet angle en trois angles égaux, donc $$\\widehat{EAD}=90^{\\circ}\\div 3=30^{\\circ}$$.',
            'ABCD — квадрат, значит, ' + aEq('BAD', 90) + '. Прямая (AE) делит этот угол на три равных, поэтому $$\\widehat{EAD}=90^{\\circ}\\div 3=30^{\\circ}$$.'),
          L('On mesure l\'angle ' + pdAng('EAD') + ' sur la figure avec un rapporteur : on trouve 30°.', 'Измеряем угол ' + pdAng('EAD') + ' на рисунке транспортиром: получается 30°.')], 0),
        sol: ['Точки F, A и E лежат на одной прямой, поэтому угол FAE развёрнутый («angle plat»): 180°. Он складывается из трёх углов с вершиной A: FAB, BAD и DAE.',
          'Угол FAB — угол равностороннего треугольника: 60°. Угол BAD — угол квадрата: 90°. На третий угол остаётся 180° − 60° − 90° = 30°.',
          'Прямая (AE) проходит вне угла FAB и вне угла BAD — она продолжает сторону [FA] за точку A, поэтому ничего «пополам» или «на три части» не делит. А измерять по рисунку нельзя: он не в масштабе, да и измерение — не доказательство.'] },
      { q: L('On veut tracer la figure avec Scratch. On utilise l\'échelle suivante : ' + pas + ' pas représentent 1 cm. Les blocs « Triangle » et « Carré » ci-dessous doivent tracer un triangle équilatéral et un carré de ' + nf(s) + ' cm de côté. Donner les valeurs de J, K, M et N.',
          'Фигуру хотят нарисовать в Scratch в масштабе: ' + pas + ' шагов («pas») соответствуют 1 см. Блоки «Triangle» и «Carré» (ниже) должны рисовать равносторонний треугольник и квадрат со стороной ' + nf(s) + ' см. В блоках: «définir» — задать блок, «répéter … fois» — повторить … раз, «avancer de … pas» — пройти … шагов, «tourner ↺ de … degrés» — повернуть влево на … градусов. Найди значения J, K, M и N.'),
        fig: blocs, ans: multi(['J =', N(J)], ['K =', N(120)], ['M =', N(4)], ['N =', N(90)]), sol: [
          ['J — длина стороны в шагах. В 1 см — ' + pas + ' шагов, значит, в ' + nf(s) + ' см:', s + '*' + pas + '=' + J],
          'K — угол поворота в вершине треугольника. Спрайт идёт вдоль стороны и, чтобы пойти вдоль следующей, поворачивает не на внутренний угол 60°, а на внешний: 180° − 60° = 120°. Проверка: за три поворота он должен сделать полный оборот, 3 × 120° = 360°.',
          'M — число сторон квадрата: 4. N — поворот в вершине квадрата: 180° − 90° = 90° (и 4 × 90° = 360°).',
          'Самая частая ошибка — написать K = 60: с таким поворотом спрайт нарисует не треугольник, а половину шестиугольника.'],
        redac: ['J = ' + J + ' : ' + nf(s) + ' cm sont représentés par $' + s + '*' + pas + '=' + J + '$ pas.',
          'K = 120 : à chaque sommet du triangle équilatéral, le lutin tourne de $180-60=120$ degrés.',
          'M = 4 et N = 90 : un carré a quatre côtés et, à chaque sommet, le lutin tourne de $180-90=90$ degrés.'] },
      { q: L('Le programme principal ci-dessous utilise les blocs « Triangle » et « Carré ». L\'instruction « s\'orienter à 90 » signifie que le lutin s\'oriente vers la droite. Sur chaque figure, le point indique la position de départ du lutin. Quelle figure obtient-on avec ce programme ?',
          'Основная программа (ниже) использует блоки «Triangle» и «Carré». Команда «s\'orienter à 90» означает, что спрайт поворачивается вправо; «effacer tout» — стереть всё, «aller à x: 0 y: 0» — перейти в точку (0 ; 0), «stylo en position d\'écriture» — опустить перо, «tourner ↻» — повернуть вправо, «tourner ↺» — повернуть влево. На каждом рисунке точкой отмечено начальное положение спрайта. Какой рисунок получится?'),
        fig: main + figs, ans: MQF([1, 2, 3, 4].map(i => L('Figure ' + i, 'Рисунок ' + i)), good - 1), sol: [
          'Сначала блок «Triangle»: спрайт идёт вправо, а поворачивает каждый раз влево (↺), поэтому треугольник оказывается над первой стороной. После трёх поворотов по 120° спрайт снова в начальной точке и снова смотрит вправо.',
          step[1],
          'Блок «Carré» тоже поворачивает влево, поэтому квадрат всегда лежит слева от направления, в котором спрайт начинает движение. Получается рисунок ' + good + '.'],
        redac: ['Le lutin trace d\'abord le triangle, au-dessus de son premier côté, puis il revient à son point de départ, orienté vers la droite.',
          step[0],
          'On obtient la figure ' + good + '.'] }] };
  } });

/* =====================================================================================================
   p2.scratch-blocs : déplacement et coordonnées, blocs « carré » et « triangle », angle extérieur, programme ↔ figure
   ===================================================================================================== */
pdProb({ id: 'p2.scratch-blocs', ch: 'al', lvl: 2, pts: 3,
  ru: 'Scratch: три блока и три рисунка', fr: 'Trois blocs et trois figures avec Scratch',
  src: 'Amérique du Nord 2026 · exercice 4',
  gen(r) {
    const c = r.pick([30, 40, 50]), d = c + r.pick([10, 20]), e = r.pick([20, 30]), sqFirst = r() < 0.5;
    let x0, y0, xf, yf, g = 0; do { x0 = -r.pick([100, 120, 150, 180, 200]); y0 = -r.pick([40, 50, 60, 80]); xf = x0 + d; yf = y0 + e; } while (g++ < 60 && (xf === yf || [x0, y0, d, e, c].some(w => Math.abs(w) === Math.abs(xf) || Math.abs(w) === Math.abs(yf))));
    const saut = [{ k: 'hat', d: 0, c: 'my', p: ['définir Saut'] }, { d: 0, c: 'pen', p: ['relever le stylo'] }, { d: 0, c: 'mv', p: ['avancer de', { n: String(d) }, 'pas'] }, { d: 0, c: 'mv', p: ['tourner ↺ de', { n: '90' }, 'degrés'] },
      { d: 0, c: 'mv', p: ['avancer de', { n: String(e) }, 'pas'] }, { d: 0, c: 'mv', p: ['tourner ↻ de', { n: '90' }, 'degrés'] }, { d: 0, c: 'pen', p: ['stylo en position d\'écriture'] }];
    const blk = (nm, l1, l2) => [{ k: 'hat', d: 0, c: 'my', p: ['définir ' + nm] }, { k: 'c', d: 0, c: 'ctl', p: ['répéter', { bl: l1 }, 'fois'] }, { d: 1, c: 'mv', p: ['avancer de', { n: String(c) }, 'pas'] }, { d: 1, c: 'mv', p: ['tourner ↺ de', { bl: l2 }, 'degrés'] }, { k: 'end', d: 0, c: 'ctl' }];
    const n2 = sqFirst ? 'Carré' : 'Triangle', n3 = sqFirst ? 'Triangle' : 'Carré';
    const blocs = pdScratch(saut, 'Bloc 1', 'Bloc 1') + pdScratch(blk(n2, 'A', 'B'), 'Bloc 2', 'Bloc 2') + pdScratch(blk(n3, 'C', 'D'), 'Bloc 3', 'Bloc 3');
    const lt = sqFirst ? [['A', 4], ['B', 90], ['C', 3]] : [['A', 3], ['C', 4], ['D', 90]], la = sqFirst ? 'D' : 'B';          /* la : the letter of the triangle's angle */
    const f2 = sqFirst ? ['un carré', 'квадрат'] : ['un triangle équilatéral', 'равносторонний треугольник'], f3 = sqFirst ? ['un triangle équilatéral', 'равносторонний треугольник'] : ['un carré', 'квадрат'];
    const sqOp = pdPoly(4, c, 90), trOp = pdPoly(3, c, 120), jump = [['U'], ['F', d], ['L', 90], ['F', e], ['R', 90], ['D']];
    const kinds = [
      { ops: [['REP', 3, [sqOp].concat(jump)]], n: 3, b: 'Carré', fr: 'le lutin trace trois carrés ; après chaque carré, le bloc « Saut » le déplace vers la droite et vers le haut sans tracer', ru: 'три квадрата; после каждого блок «Saut» сдвигает спрайт вправо и вверх, не рисуя, — получается «лесенка» из квадратов' },
      { ops: [['REP', 3, [trOp].concat(jump)]], n: 3, b: 'Triangle', fr: 'le lutin trace trois triangles ; après chaque triangle, le bloc « Saut » le déplace vers la droite et vers le haut sans tracer', ru: 'три треугольника; после каждого блок «Saut» сдвигает спрайт вправо и вверх, не рисуя, — получается «лесенка» из треугольников' },
      { ops: [['REP', 4, [sqOp, ['L', 90]]]], n: 4, b: 'Carré', t: 90, fr: 'le lutin trace quatre carrés en tournant de 90° après chacun ; les quatre carrés ont un sommet commun et forment un grand carré', ru: 'четыре квадрата, после каждого — поворот на 90° на месте; у квадратов общая вершина, 4 × 90° = 360°, и вместе они образуют большой квадрат' },
      { ops: [['REP', 6, [trOp, ['L', 60]]]], n: 6, b: 'Triangle', t: 60, fr: 'le lutin trace six triangles en tournant de 60° après chacun ; les six triangles ont un sommet commun et forment un hexagone', ru: 'шесть треугольников, после каждого — поворот на 60° на месте; у треугольников общая вершина, 6 × 60° = 360°, и вместе они образуют шестиугольник' },
      { ops: [['REP', 3, [trOp, ['L', 120]]]], n: 3, b: 'Triangle', t: 120, fr: 'le lutin trace trois triangles en tournant de 120° après chacun ; les trois triangles ont un seul sommet commun et ne se touchent pas ailleurs', ru: 'три треугольника, после каждого — поворот на 120° на месте; у треугольников одна общая вершина, а между ними остаются промежутки' }];
    const pk = r.sh([0, 1, 2, 3, 4]).slice(0, 3).map(i => kinds[i]), fo = r.sh([0, 1, 2]), XYZ = ['X', 'Y', 'Z'], figOf = i => XYZ[fo.indexOf(i)];
    const progs = pk.map((K, i) => pdScratch([{ k: 'c', d: 0, c: 'ctl', p: ['répéter', { n: String(K.n) }, 'fois'] }, { d: 1, c: 'my', p: [K.b] }, K.t ? { d: 1, c: 'mv', p: ['tourner ↺ de', { n: String(K.t) }, 'degrés'] } : { d: 1, c: 'my', p: ['Saut'] }, { k: 'end', d: 0, c: 'ctl' }], 'Programme ' + (i + 1), 'Programme ' + (i + 1))).join('');
    const figs = pdDrawings(fo.map((pi, j) => ({ segs: pdTurtle(pk[pi].ops), cap: 'Figure ' + XYZ[j] })), 2, 170, 138, 'Trois figures tracées par le lutin');
    const map = p => L(p.map((x, i) => (i ? 'programme ' : 'Programme ') + (i + 1) + ' : figure ' + x).join(' ; ') + '.', p.map((x, i) => (i ? 'программа ' : 'Программа ') + (i + 1) + ' — рисунок ' + x).join('; ') + '.');
    const right = [0, 1, 2].map(figOf), others = [['X', 'Y', 'Z'], ['X', 'Z', 'Y'], ['Y', 'X', 'Z'], ['Y', 'Z', 'X'], ['Z', 'X', 'Y'], ['Z', 'Y', 'X']].filter(p => p.join('') !== right.join(''));
    const ctx = L('Un élève veut tracer des figures formées de carrés et de triangles équilatéraux avec le logiciel Scratch. Pour cela, il crée les trois blocs ci-dessous. Dans les blocs 2 et 3, certaines valeurs ont été remplacées par les lettres A, B, C et D.',
      'Ученик хочет рисовать в Scratch фигуры из квадратов и равносторонних треугольников. Для этого он создал три блока (ниже). В блоках 2 и 3 некоторые числа заменены буквами A, B, C и D. Слова в блоках: «définir» — задать блок; «relever le stylo» — поднять перо (не рисовать); «stylo en position d\'écriture» — опустить перо (рисовать); «avancer de … pas» — пройти … шагов; «tourner ↺ de … degrés» — повернуть влево, «tourner ↻» — вправо; «répéter … fois» — повторить … раз.');
    return { ctx, fig: blocs, qs: [
      { q: L('Le lutin est au point de coordonnées (' + nf(x0) + ' ; ' + nf(y0) + ') et il est orienté vers la droite. Quelles sont ses coordonnées après l\'exécution du bloc 1 ?', 'Спрайт находится в точке с координатами (' + nf(x0) + ' ; ' + nf(y0) + ') и смотрит вправо. Каковы его координаты после выполнения блока 1?'),
        ans: multi(['$x$ =', N(xf)], ['$y$ =', N(yf)]), sol: [
          ['Спрайт смотрит вправо и проходит ' + d + ' шагов: абсцисса увеличивается на ' + d + ', ордината не меняется.', 'x=' + x0 + '+' + d + '=' + xf],
          ['Затем он поворачивается на 90° влево (↺) — теперь смотрит вверх — и проходит ' + e + ' шагов: увеличивается ордината.', 'y=' + y0 + '+' + e + '=' + yf],
          'Последний поворот на 90° вправо (↻) возвращает прежнее направление — вправо; положение спрайта при повороте не меняется. Перо поднято, поэтому этот путь не рисуется.'],
        redac: ['Le lutin, orienté vers la droite, avance de ' + d + ' pas : son abscisse devient $' + x0 + '+' + d + '=' + xf + '$.',
          'Il tourne de 90° vers la gauche : il est orienté vers le haut. Il avance de ' + e + ' pas : son ordonnée devient $' + y0 + '+' + e + '=' + yf + '$.',
          'Après l\'exécution du bloc 1, le lutin est au point de coordonnées (' + nf(xf) + ' ; ' + nf(yf) + ').'] },
      { q: L('Le bloc 2 doit tracer ' + f2[0] + ' et le bloc 3 ' + f3[0] + '. Donner les valeurs de ' + lt[0][0] + ', ' + lt[1][0] + ' et ' + lt[2][0] + '.', 'Блок 2 должен рисовать ' + f2[1] + ', а блок 3 — ' + f3[1] + '. Найди значения ' + lt[0][0] + ', ' + lt[1][0] + ' и ' + lt[2][0] + '.'),
        ans: multi.apply(null, lt.map(p => [p[0] + ' =', N(p[1])])), sol: [
          'В блоке «répéter … fois» спрайт рисует одну сторону и поворачивает к следующей. Значит, число повторений равно числу сторон: у квадрата 4, у треугольника 3.',
          'В вершине квадрата спрайт поворачивает на 90°: за четыре поворота получается полный оборот, 4 × 90° = 360°, и спрайт возвращается в исходное положение.',
          'Ответ: ' + lt.map(p => p[0] + ' = ' + p[1]).join(', ') + '.'],
        redac: ['Un carré a 4 côtés et un triangle a 3 côtés : le lutin répète 4 fois les instructions pour le carré et 3 fois pour le triangle.',
          'À chaque sommet du carré, le lutin tourne de 90 degrés.',
          lt.map(p => p[0] + ' = ' + p[1]).join(' ; ') + '.'] },
      { q: L('Quelle est la valeur de ' + la + ' ? Choisir la réponse correctement justifiée.', 'Чему равно ' + la + '? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          L('120 : à chaque sommet, le lutin tourne de l\'angle extérieur du triangle équilatéral, soit 180° − 60° = 120°.', '120: в каждой вершине спрайт поворачивает на внешний угол равностороннего треугольника, то есть на 180° − 60° = 120°.'),
          L('60 : les angles d\'un triangle équilatéral mesurent 60°.', '60: углы равностороннего треугольника равны 60°.'),
          L('90 : le lutin tourne toujours d\'un angle droit, comme pour le carré.', '90: спрайт всегда поворачивает на прямой угол, как в квадрате.'),
          L('180 : la somme des angles d\'un triangle est égale à 180°.', '180: сумма углов треугольника равна 180°.')], 0),
        sol: ['Спрайт идёт вдоль стороны и в вершине должен повернуть так, чтобы пойти вдоль следующей стороны. Если бы он не повернул, то пошёл бы прямо — это направление составляет с новой стороной угол 180° − 60° = 120°. Это внешний угол треугольника.',
          'Проверка: чтобы вернуться в исходное положение, за три поворота спрайт должен сделать полный оборот: 3 × 120° = 360°.',
          'С поворотом на 60° получилась бы половина шестиугольника, а не треугольник: 60° — это внутренний угол, угол между сторонами. С поворотом на 90° получился бы квадрат без одной стороны, а на 180° спрайт просто пошёл бы назад по той же линии.'] },
      { q: L('L\'élève écrit ensuite les trois programmes ci-dessous et obtient les figures X, Y et Z. Sur chaque figure, le point indique la position de départ du lutin, qui est orienté vers la droite. Associer chaque programme à sa figure.',
          'Затем ученик пишет три программы (ниже) и получает рисунки X, Y и Z. На каждом рисунке точкой отмечено начальное положение спрайта; в начале он смотрит вправо. Сопоставь каждой программе её рисунок.'),
        fig: progs + figs, ans: MQ(r, [map(right)].concat(r.sh(others).slice(0, 3).map(map)), 0),
        sol: pk.map((K, i) => 'Программа ' + (i + 1) + ': ' + K.ru + ' — рисунок ' + figOf(i) + '.').concat(['Сначала смотри, какой блок повторяется (квадрат или треугольник), потом — что происходит между повторениями: сдвиг блоком «Saut» или поворот на месте.']),
        redac: pk.map((K, i) => 'Programme ' + (i + 1) + ' : ' + K.fr + ' : c\'est la figure ' + figOf(i) + '.') }] };
  } });
