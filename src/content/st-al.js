/* ===================== STATISTIQUES ET PROBABILITÉS (st) · ALGORITHMIQUE ET TABLEUR (al) =====================
   Trainers of the two chapters, fiches and dictionary. Every top-level name of this file starts with sta.
   Charts, trees and wheels use the SVG classes of 20-api.js (no colours); Scratch scripts are drawn in the
   real Scratch 3 colours with the French labels of the blocks; spreadsheet extracts have column letters and row numbers. */

/* ---------- text helpers ---------- */
/* no-break spaces: before : ; ? ! » % € °C, after «, after the labels «a.» «b.», and in 2 200 (formulas $…$ are left as they are) */
function staNb(s) {
  return String(s).split(/(\$[^$]*\$)/).map((p, i) => (i % 2 ? p : p.replace(/ (?=[:;?!»%€]|°C)/g, '\u00a0').replace(/« /g, '«\u00a0').replace(/(^| )([a-d])\. /g, '$1$2.\u00a0').replace(/(\d) (?=\d{3}(?!\d))/g, '$1\u00a0'))).join('');
}
const staL = (fr, ru) => L(staNb(fr), staNb(ru));
const staSum = a => a.reduce((s, x) => s + x, 0);
const staSort = a => a.slice().sort((x, y) => x - y);
/* a series in a text: «8 ; 12 ; 6» in French, «8; 12; 6» in Russian */
const staSF = (a, u) => a.map(v => nf(v) + (u ? ' ' + u : '')).join(' ; ');
const staSR = (a, u) => a.map(v => nf(v) + (u ? ' ' + u : '')).join('; ');
/* a sum in input syntax: 8+(-1)+3 */
const staPlus = a => a.map((v, i) => (i && v < 0 ? '(' + fx(v) + ')' : fx(v))).join('+');
const staFt = (n, d) => '$' + n + '/' + d + '$';
/* a fraction and its simplification, input syntax: 4/20=1/5 */
const staFq = (n, d) => { const f = F(n, d); return n + '/' + d + (f.d !== d ? '=' + Fr.str(f) : ''); };
const staWho = r => (r() < 0.5 ? { n: r.pick(PRENOMS_F), f: true } : { n: r.pick(PRENOMS_M), f: false });
const staDe = n => (/^[AEIOUÉÈH]/.test(n) ? "d'" : 'de ') + n;                 /* «de Léa», «d'Alice», «d'Hugo» */
const staUR = u => ({ min: 'мин', cm: 'см' }[u] || u);                          /* units in a Russian sentence */
const staEt = a => (a.length > 1 ? a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1] : String(a[0]));   /* «9, 6 et 8» */
const staI = a => (a.length > 1 ? a.slice(0, -1).join(', ') + ' и ' + a[a.length - 1] : String(a[0]));
/* a number with a noun: nominative («21 ученик», «24 ученика») and genitive («из 21 ученика», «из 25 учеников») */
const staNum = (n, one, few, many) => n + ' ' + staPl(n, one, few, many);
const staGen = (n, one, many) => n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? one : many);
const staG = (w, m, f) => (w.f ? f : m);
function staPl(n, one, few, many) { const a = Math.abs(n) % 100, b = a % 10; return a > 10 && a < 20 ? many : b === 1 ? one : b >= 2 && b <= 4 ? few : many; }
/* k distractors {v, ru}: values different from the right one and from each other */
function staDist(right, cands, k) {
  const out = [];
  for (const c of cands) {
    if (!c || c.v == null || !isFinite(c.v) || close(c.v, right, 1e-9) || out.some(o => close(o.v, c.v, 1e-9))) continue;
    out.push(c); if (out.length >= (k || 3)) break;
  }
  return out;
}
const staWhy = ds => 'Почему не другие варианты: ' + ds.map(d => d.t + ' — ' + d.ru).join('; ') + '.';
/* k random whole numbers ≥ min with a given sum */
function staSplit(r, total, k, min) { const a = new Array(k).fill(min || 0); for (let i = total - k * (min || 0); i > 0; i--) a[r.ri(0, k - 1)]++; return a; }
const STA_NUM_FR = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
const STA_NUM_RU = ['ноль', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять'];
const STA_VILLES = [['Strasbourg', 'Страсбурге'], ['Lille', 'Лилле'], ['Grenoble', 'Гренобле'], ['Reims', 'Реймсе'], ['Metz', 'Меце'], ['Besançon', 'Безансоне'], ['Nancy', 'Нанси'], ['Limoges', 'Лиможе']];
/* statistics table: rows of cells, the first cell of each row is its name */
function staTab(rows) { return '<table class="pblk tx nohead">' + rows.map(row => '<tr>' + row.map((c, j) => (j === 0 ? '<th>' + c + '</th>' : '<td>' + (typeof c === 'number' ? nf(c) : c) + '</td>')).join('') + '</tr>').join('') + '</table>'; }
/* spreadsheet extract: rows of cells (row 1 first), column letters and row numbers; {q: '…'} — the cell in question */
function staSheet(rows) {
  const n = Math.max(...rows.map(x => x.length));
  return '<table class="pblk tx side"><tr><th></th>' + 'ABCDEFGH'.slice(0, n).split('').map(c => '<th>' + c + '</th>').join('') + '</tr>' +
    rows.map((row, i) => '<tr><th>' + (i + 1) + '</th>' + row.map(c => (c && typeof c === 'object' ? '<td class="tdq">' + c.q + '</td>' : '<td>' + (typeof c === 'number' ? nf(c) : c) + '</td>')).join('') + '</tr>').join('') + '</table>';
}

/* ---------- figures: classes of 20-api.js ---------- */
const staTx = (x, y, s, cls, anc) => '<text x="' + fx(x, 1) + '" y="' + fx(y, 1) + '" class="' + (cls || 'ftx') + '"' + (anc ? ' text-anchor="' + anc + '"' : '') + '>' + s + '</text>';
const staLn = (x1, y1, x2, y2, cls) => '<line x1="' + fx(x1, 1) + '" y1="' + fx(y1, 1) + '" x2="' + fx(x2, 1) + '" y2="' + fx(y2, 1) + '" class="' + (cls || 'fl') + '"/>';
const staRc = (x, y, w, h, cls) => '<rect x="' + fx(x, 1) + '" y="' + fx(y, 1) + '" width="' + fx(w, 1) + '" height="' + fx(h, 1) + '" class="' + cls + '"/>';
/* bar chart on an exact grid of 1; o.bounds — histogram (bars side by side, the labels are the bounds of the classes) */
function staBars(labs, vals, o) {
  o = o || {};
  const W = 340, x0 = 40, x1 = 332, yt = 30, yb = 196, H = o.xt ? 242 : 222;
  const max = Math.max(...vals), lab = max <= 10 ? 1 : 2, top = Math.ceil((max + 1) / lab) * lab, u = (yb - yt) / top;
  let s = '';
  for (let k = 1; k <= top; k++) s += staLn(x0, yb - k * u, x1, yb - k * u, 'fgrid');
  for (let k = 0; k <= top; k += lab) s += staTx(x0 - 8, yb - k * u + 4.5, k, 'ftm', 'end') + staLn(x0 - 4, yb - k * u, x0, yb - k * u, 'fax');
  const n = vals.length, slot = (x1 - x0) / n, bw = o.bounds ? slot : Math.min(slot * 0.56, 32);
  vals.forEach((v, i) => { if (v > 0) s += staRc(x0 + slot * (i + 0.5) - bw / 2, yb - v * u, bw, v * u, 'fbar') + (o.bounds ? staRc(x0 + slot * i, yb - v * u, slot, v * u, 'fl2') : ''); });
  if (o.bounds) o.bounds.forEach((b, i) => { s += staTx(x0 + slot * i, yb + 19, b, 'ftm', 'middle'); });
  else labs.forEach((l, i) => { s += staTx(x0 + slot * (i + 0.5), yb + 20, l, 'ftx', 'middle'); });
  s += staLn(x0, yb, x1 + 4, yb, 'fax') + staLn(x0, yb, x0, yt - 8, 'fax') + staTx(4, 14, o.yt || 'Effectif', 'ftx', 'start');
  if (o.xt) s += staTx((x0 + x1) / 2, H - 6, o.xt, 'ftx', 'middle');
  return svgFig(W, H, s, o.label || 'diagramme en barres');
}
/* sector of a disc, angles in degrees clockwise from 12 o'clock */
function staArc(cx, cy, R, a1, a2) {
  const P = a => [cx + R * Math.sin(a * Math.PI / 180), cy - R * Math.cos(a * Math.PI / 180)], p = P(a1), q = P(a2);
  return 'M' + fx(cx, 1) + ',' + fx(cy, 1) + 'L' + fx(p[0], 2) + ',' + fx(p[1], 2) + 'A' + R + ',' + R + ' 0 ' + (a2 - a1 > 180 ? 1 : 0) + ' 1 ' + fx(q[0], 2) + ',' + fx(q[1], 2) + 'Z';
}
/* pie: parts [{lab, deg, cls}]; labels (if any) outside the disc, so that they stay readable in both themes */
function staPieIn(cx, cy, R, parts, labels) {
  let s = '', a = 0;
  parts.forEach(p => { s += '<path d="' + staArc(cx, cy, R, a, a + p.deg) + '" class="' + p.cls + '"/>'; a += p.deg; });
  a = 0; parts.forEach(p => { s += '<path d="' + staArc(cx, cy, R, a, a + p.deg) + '" class="fl2"/>'; a += p.deg; });
  if (labels) {
    a = 0;
    parts.forEach(p => {
      const m = (a + p.deg / 2) * Math.PI / 180, sx = Math.sin(m), cy2 = Math.cos(m);
      s += staTx(cx + (R + 12) * sx, cy - (R + 12) * cy2 + 5 + (cy2 < -0.6 ? 8 : 0) - (cy2 > 0.6 ? 3 : 0), p.lab, 'ftx', sx > 0.3 ? 'start' : sx < -0.3 ? 'end' : 'middle');
      a += p.deg;
    });
  }
  return s;
}
const staPie = (parts, label) => svgFig(340, 246, staPieIn(170, 122, 86, parts, true), label || 'diagramme circulaire');
/* lottery wheel: equal sectors with their labels, a pointer at the top */
function staWheel(labs) {
  const n = labs.length, cx = 170, cy = 128, R = 98, d = 360 / n; let s = '';
  labs.forEach((l, i) => {
    const a = i * d - d / 2, m = i * d * Math.PI / 180;
    s += '<path d="' + staArc(cx, cy, R, a, a + d) + '" class="' + (i % 2 ? 'fl' : 'ffill') + '"/>' + (i % 2 ? '' : '<path d="' + staArc(cx, cy, R, a, a + d) + '" class="fl"/>');
    s += staTx(cx + R * 0.68 * Math.sin(m), cy - R * 0.68 * Math.cos(m) + 5, l, 'ftx', 'middle');
  });
  s += '<polygon points="' + (cx - 9) + ',' + (cy - R - 18) + ' ' + (cx + 9) + ',' + (cy - R - 18) + ' ' + cx + ',' + (cy - R + 4) + '" class="fpt"/>';
  return svgFig(340, 236, s, 'roue de loterie');
}
/* probability tree: A = [[lab, p], [lab, p]], B = [[[lab, p], [lab, p]], [[lab, p], [lab, p]]] */
function staTree(A, B) {
  const x0 = 12, x1 = 150, x2 = 300, ym = 108, y1 = [56, 160], y2 = [[22, 90], [126, 194]];
  const br = (xa, ya, xb, yb, p, up) => staLn(xa, ya, xb, yb, 'fl') + staTx((xa + xb) / 2, (ya + yb) / 2 + (up ? -10 : 20), p, 'ftx', 'middle');
  let s = '';
  A.forEach((a, i) => {
    s += br(x0, ym, x1 - 14, y1[i], a[1], i === 0) + staTx(x1, y1[i] + 5, a[0], 'ftx', 'middle');
    B[i].forEach((b, j) => { s += br(x1 + 14, y1[i], x2 - 14, y2[i][j], b[1], j === 0) + staTx(x2, y2[i][j] + 5, b[0], 'ftx', 'middle'); });
  });
  return svgFig(340, 214, s, 'arbre de probabilités');
}
/* path of the sprite: n segments of length 1, turning clockwise by t° after each one (screen: y downwards) */
function staTurtle(n, t) { const pts = []; let x = 0, y = 0, a = 0; for (let i = 0; i < n; i++) { pts.push([x, y]); x += Math.cos(a * Math.PI / 180); y += Math.sin(a * Math.PI / 180); a += t; } return pts; }
/* the drawn figure in the box (x, y, w, h) */
function staShape(pts, bx, by, bw, bh) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), k = Math.min(bw / (Math.max(...xs) - x0), bh / (Math.max(...ys) - y0));
  const ox = bx + (bw - k * (Math.max(...xs) - x0)) / 2, oy = by + (bh - k * (Math.max(...ys) - y0)) / 2, P = p => [ox + k * (p[0] - x0), oy + k * (p[1] - y0)];
  const q = pts.map(P);
  return '<polygon points="' + q.map(p => fx(p[0], 1) + ',' + fx(p[1], 1)).join(' ') + '" class="fl"/><circle cx="' + fx(q[0][0], 1) + '" cy="' + fx(q[0][1], 1) + '" r="4" class="fpt"/>';
}

/* ---------- Scratch 3 scripts ---------- */
const STA_SC = { motion: ['#4C97FF', '#3373CC'], looks: ['#9966FF', '#774DCB'], events: ['#FFBF00', '#CC9900'], control: ['#FFAB19', '#CF8B17'],
  sensing: ['#5CB1D6', '#2E8EB8'], operators: ['#59C059', '#389438'], variables: ['#FF8C1A', '#DB6E00'], pen: ['#0FBD8C', '#0B8E69'] };
const STA_FONT = "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px";
const STA_CW = {};
[[' iljI.,:;\'!|’', 250], ['ftr()[]-', 330], ['cksvxyz?', 500], ['îïíì', 280], ['mw', 800], ['MW', 900], ['+=<>−×', 584], ['*', 389], ['/', 280], ['↻↺…', 1000], ['▾', 600], ['%', 889], ['°', 400]]
  .forEach(([cs, w]) => { for (const c of cs) STA_CW[c] = w; });
/* width of a label at 14 px: Helvetica metrics + 8 % (Inter, Roboto and SF are a little wider) */
function staTW(s) { let w = 0; for (const c of String(s)) w += STA_CW[c] || (/[A-ZÀ-Ý]/.test(c) ? 680 : 570); return w * 14 * 1.08 / 1000; }
const staEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* inline style: the theme's rule «.fig text» must not repaint the labels of the blocks */
const staST = (x, y, s, fill, anc) => '<text x="' + fx(x, 1) + '" y="' + fx(y, 1) + '"' + (anc ? ' text-anchor="' + anc + '"' : '') + ' style="fill:' + fill + ';' + STA_FONT + '">' + staEsc(s) + '</text>';
const staSR2 = (x, y, w, h, rx, fill, stroke) => '<rect x="' + fx(x, 1) + '" y="' + fx(y, 1) + '" width="' + fx(w, 1) + '" height="' + fx(h, 1) + '" rx="' + fx(rx, 1) + '" style="fill:' + fill + ';stroke:' + stroke + '"/>';
/* tokens of a block line: label strings and inputs */
const staIn = v => ({ k: 'in', t: String(v) });                       /* white input: number or text */
const staTk = x => (x && typeof x === 'object' ? x : staIn(x));
const staVr = n => ({ k: 'rep', c: 'variables', t: n });              /* variable reporter */
const STA_REP = { k: 'rep', c: 'sensing', t: 'réponse' };
const staOp = (a, o, b) => ({ k: 'op', ch: [staTk(a), o, staTk(b)] });   /* (a o b) */
const staCmp = (a, o, b) => ({ k: 'bool', ch: [staTk(a), o, staTk(b)] }); /* <a o b> */
const staDd = n => ({ k: 'dd', t: n });                                /* variable menu in «mettre» / «ajouter» */
function staSz(tk) {
  if (typeof tk === 'string') return { w: staTW(tk), h: 16 };
  if (tk.k === 'flag') return { w: 24, h: 22 };
  if (tk.k === 'in') return { w: Math.max(staTW(tk.t) + 18, 30), h: 24 };
  if (tk.k === 'dd') return { w: staTW(tk.t) + 30, h: 24 };
  if (tk.k === 'rep') return { w: Math.max(staTW(tk.t) + 22, 32), h: 26 };
  const cs = tk.ch.map(staSz), h = Math.max(28, Math.max(...cs.map(c => c.h)) + 6), pad = tk.k === 'bool' ? h / 2 + 2 : 8;
  return { w: 2 * pad + staSum(cs.map(c => c.w)) + 5 * (cs.length - 1), h, pad };
}
/* blocks (French Scratch 3) */
const STA_B = {
  flag: () => ({ c: 'events', hat: true, t: ['quand', { k: 'flag' }, 'est cliqué'] }),
  set: (v, x) => ({ c: 'variables', t: ['mettre', staDd(v), 'à', staTk(x)] }),
  add: (x, v) => ({ c: 'variables', t: ['ajouter', staTk(x), 'à', staDd(v)] }),
  ask: q => ({ c: 'sensing', t: ['demander', staIn(q), 'et attendre'] }),
  say: (x, sec) => ({ c: 'looks', t: sec ? ['dire', staTk(x), 'pendant', staIn(sec), 'secondes'] : ['dire', staTk(x)] }),
  fwd: n => ({ c: 'motion', t: ['avancer de', staTk(n), 'pas'] }),
  rt: a => ({ c: 'motion', t: ['tourner ↻ de', staTk(a), 'degrés'] }),
  lt: a => ({ c: 'motion', t: ['tourner ↺ de', staTk(a), 'degrés'] }),
  dir: a => ({ c: 'motion', t: ["s'orienter à", staTk(a)] }),
  go: (x, y) => ({ c: 'motion', t: ['aller à x:', staTk(x), 'y:', staTk(y)] }),
  pen: () => ({ c: 'pen', t: ["stylo en position d'écriture"] }),
  clear: () => ({ c: 'pen', t: ['effacer tout'] }),
  rep: (n, body) => ({ c: 'control', t: ['répéter', staTk(n), 'fois'], body }),
  si: (cond, body, els) => ({ c: 'control', t: ['si', cond, 'alors'], body, els })
};
function staFlag(x, y) {
  return '<path d="M' + fx(x + 1, 1) + ',' + fx(y + 1, 1) + 'v19" style="fill:none;stroke:#45993D;stroke-width:2.4;stroke-linecap:round"/>' +
    '<path d="M' + fx(x + 2, 1) + ',' + fx(y + 1.5, 1) + 'c4.5,-2.5 9,2.5 14,0v10c-5,2.5 -9.5,-2.5 -14,0z" style="fill:#4CBF56;stroke:#45993D;stroke-width:1.2;stroke-linejoin:round"/>';
}
function staTkSvg(tk, x, cy, dark) {
  if (typeof tk === 'string') return staST(x, cy + 5, tk, '#FFFFFF');
  const z = staSz(tk), y = cy - z.h / 2;
  if (tk.k === 'flag') return staFlag(x + 3, cy - 11);
  if (tk.k === 'in') return staSR2(x, y, z.w, z.h, z.h / 2, '#FFFFFF', dark) + staST(x + z.w / 2, cy + 5, tk.t, '#575E75', 'middle');
  if (tk.k === 'dd') return staSR2(x, y, z.w, z.h, 6, dark, dark) + staST(x + 9, cy + 5, tk.t, '#FFFFFF') + staST(x + z.w - 8, cy + 5, '▾', '#FFFFFF', 'end');
  if (tk.k === 'rep') { const c = STA_SC[tk.c]; return staSR2(x, y, z.w, z.h, z.h / 2, c[0], c[1]) + staST(x + z.w / 2, cy + 5, tk.t, '#FFFFFF', 'middle'); }
  const c = STA_SC.operators;
  let s = tk.k === 'op' ? staSR2(x, y, z.w, z.h, z.h / 2, c[0], c[1])
    : '<path d="M' + fx(x, 1) + ',' + fx(cy, 1) + 'l' + fx(z.h / 2, 1) + ',' + fx(-z.h / 2, 1) + 'H' + fx(x + z.w - z.h / 2, 1) + 'l' + fx(z.h / 2, 1) + ',' + fx(z.h / 2, 1) + 'l' + fx(-z.h / 2, 1) + ',' + fx(z.h / 2, 1) + 'H' + fx(x + z.h / 2, 1) + 'Z" style="fill:' + c[0] + ';stroke:' + c[1] + '"/>';
  let cx = x + z.pad;
  tk.ch.forEach(ch => { s += staTkSvg(ch, cx, cy, c[1]); cx += staSz(ch).w + 5; });
  return s;
}
/* sizes of blocks */
const STA_ARM = 16;
const staLH = b => Math.max(38, Math.max(...b.t.map(t => staSz(t).h)) + 12);
const staLW = b => 20 + staSum(b.t.map(t => staSz(t).w)) + 6 * (b.t.length - 1);
const staSH = bs => staSum(bs.map(staBH));
function staBH(b) { if (!b.body) return staLH(b); return staLH(b) + Math.max(staSH(b.body), 24) + (b.els ? 32 + Math.max(staSH(b.els), 24) : 0) + 24; }
/* outlines: top edge with the notch, bottom edge with the tab */
const staTop = (x, y, w) => 'M' + fx(x, 1) + ',' + fx(y + 4, 1) + 'a4,4 0 0 1 4,-4H' + fx(x + 12, 1) + 'l4,4h12l4,-4H' + fx(x + w - 4, 1) + 'a4,4 0 0 1 4,4';
const staBot = (x, y2, w) => 'V' + fx(y2 - 4, 1) + 'a4,4 0 0 1 -4,4H' + fx(x + 32, 1) + 'l-4,4h-12l-4,-4H' + fx(x + 4, 1) + 'a4,4 0 0 1 -4,-4Z';
const staArm = (x, y, w, A) => 'a4,4 0 0 1 -4,4H' + fx(x + A + 32, 1) + 'l-4,4h-12l-4,-4H' + fx(x + A + 4, 1) + 'a4,4 0 0 0 -4,4';
const staArmEnd = (x, yy, w, A) => 'V' + fx(yy - 4, 1) + 'a4,4 0 0 0 4,4H' + fx(x + A + 12, 1) + 'l4,4h12l4,-4H' + fx(x + w - 4, 1) + 'a4,4 0 0 1 4,4';
function staCPath(x, y, w, h1, i1, hm, i2) {
  let d = staTop(x, y, w) + 'V' + fx(y + h1 - 4, 1) + staArm(x, y + h1, w, STA_ARM), yy = y + h1 + i1;
  d += staArmEnd(x, yy, w, STA_ARM);
  if (hm) { d += 'V' + fx(yy + hm - 4, 1) + staArm(x, yy + hm, w, STA_ARM); yy += hm + i2; d += staArmEnd(x, yy, w, STA_ARM); }
  return d + staBot(x, yy + 24, w);
}
const staPathS = (d, c) => '<path d="' + d + '" style="fill:' + c[0] + ';stroke:' + c[1] + '"/>';
function staLine(b, x, y, h, c, st) { let cx = x + 10; b.t.forEach(tk => { st.s += staTkSvg(tk, cx, y + h / 2, c[1]); cx += staSz(tk).w + 6; }); }
function staDraw(bs, x, y, st) {
  for (const b of bs) {
    const c = STA_SC[b.c], h = staLH(b), w = Math.max(staLW(b), b.hat ? 104 : b.body ? 96 : 56);
    if (st.num) { st.n++; st.s += staTx(4, y + h / 2 + 5, st.n, 'ftm', 'start'); }
    if (b.body) {
      const i1 = Math.max(staSH(b.body), 24), hm = b.els ? 32 : 0, i2 = b.els ? Math.max(staSH(b.els), 24) : 0;
      st.s += staPathS(staCPath(x, y, w, h, i1, hm, i2), c);
      staLine(b, x, y, h, c, st);
      staDraw(b.body, x + STA_ARM, y + h, st);
      if (b.els) { st.s += staST(x + 10, y + h + i1 + hm / 2 + 5, 'sinon', '#FFFFFF'); staDraw(b.els, x + STA_ARM, y + h + i1 + hm, st); }
    } else {
      st.s += staPathS(b.hat ? 'M' + fx(x, 1) + ',' + fx(y, 1) + 'c22,-18 58,-18 80,0H' + fx(x + w - 4, 1) + 'a4,4 0 0 1 4,4' + staBot(x, y + h, w) : staTop(x, y, w) + staBot(x, y + h, w), c);
      staLine(b, x, y, h, c, st);
    }
    st.maxX = Math.max(st.maxX, x + w);
    y += staBH(b);
  }
  return y;
}
/* a script: {s: svg inside, w, h}; o.num — line numbers, o.y — vertical offset */
function staScr(bs, o) {
  o = o || {};
  const st = { s: '', n: 0, num: !!o.num, maxX: 0 }, y = staDraw(bs, o.num ? 26 : 2, (o.y || 0) + (bs[0] && bs[0].hat ? 20 : 2), st);
  return { s: st.s, w: st.maxX, h: y + 6 };
}
function staScratch(bs, o) { const z = staScr(bs, o); return svgFig(Math.max(340, Math.ceil(z.w + 4)), Math.ceil(z.h), z.s, 'script Scratch'); }
/* a part of a disc, in twelfths, in words */
const STA_PART = { 2: 'шестая часть круга (60°)', 3: 'четверть круга (прямой угол, 90°)', 4: 'треть круга (120°)', 5: '5/12 круга (150°), чуть меньше половины', 6: 'половина круга (180°)', 7: '7/12 круга (210°), чуть больше половины', 8: 'две трети круга (240°)' };
const STA_POLY = { 3: ['un triangle équilatéral', 'равносторонний треугольник'], 4: ['un carré', 'квадрат'], 5: ['un pentagone régulier', 'правильный пятиугольник'],
  6: ['un hexagone régulier', 'правильный шестиугольник'], 8: ['un octogone régulier', 'правильный восьмиугольник'], 10: ['un décagone régulier', 'правильный десятиугольник'] };

/* =====================================================================================================
   STATISTIQUES
   ===================================================================================================== */
topic({ id: 'st.moyenne', ch: 'st', lvl: 1, calc: false, variants: 4,
  ru: 'Среднее значение ряда', fr: 'Calculer une moyenne',
  hints: [
    'Среднее («moyenne») — это сколько пришлось бы на каждое значение, если бы общую сумму разделили поровну. Поэтому сначала находим сумму всех значений.',
    'Потом делим сумму на количество значений. Одинаковые значения считаются столько раз, сколько они встречаются в ряду.',
    'Проверь себя: среднее всегда лежит между самым маленьким и самым большим значением ряда.'],
  gen(r, vi) {
    if (vi === 3) {   /* QCM: the usual mistakes */
      const w = staWho(r); let a, S;
      do { a = []; for (let i = 0; i < 5; i++) a.push(r.ri(6, 18)); S = staSum(a); } while (S % 5 || new Set(a).size < 4);
      const m = S / 5, s = staSort(a);
      const ds = staDist(m, r.sh([
        { v: S, ru: 'это сумма оценок: её забыли разделить на количество оценок' },
        { v: S / 4, ru: 'сумму разделили на 4, а оценок 5' },
        { v: (s[0] + s[4]) / 2, ru: 'это середина между самой низкой и самой высокой оценкой: остальные оценки не учтены' },
        { v: s[2], ru: 'это медиана (оценка в середине упорядоченного ряда), а не среднее' }]).concat([{ v: m + 1, ru: 'ошибка в сложении' }, { v: m - 1, ru: 'ошибка в сложении' }]));
      ds.forEach(d => { d.t = nf(d.v); });
      return { q: staL(`Les notes ${staDe(w.n)} au premier trimestre sont : ${staSF(a)}. Quelle est la moyenne de ces notes ?`, `Оценки ${w.n} за первый триместр: ${staSR(a)}. Чему равно среднее этих оценок?`),
        ans: MQ(r, [nf(m)].concat(ds.map(d => d.t)), 0),
        sol: [
          'Среднее = сумма всех оценок ÷ их количество (здесь оценок 5).',
          ['Сумма:', staPlus(a) + '=' + S],
          ['Среднее:', S + '/5=' + fx(m)],
          staWhy(ds)] };
    }
    const ctx = vi === 2 ? 'temp' : r.pick(['notes', 'serie', 'buts', 'livres']);
    const n = vi === 1 ? r.pick([4, 5]) : ctx === 'temp' ? r.pick([5, 7]) : r.pick([4, 5, 6]);
    const R = { notes: [5, 19], serie: [2, 40], buts: [0, 6], livres: [0, 9], temp: [-7, 8] }[ctx];
    let a = [], S = 0;
    for (let g = 0; g < 400; g++) {
      a = []; for (let i = 0; i < n; i++) a.push(r.ri(R[0], R[1]));
      S = staSum(a);
      if ((vi === 1 ? S % n !== 0 : S % n === 0) && new Set(a).size >= 3 && (ctx !== 'temp' || (a.filter(v => v < 0).length >= 2 && a.some(v => v > 0)))) break;
    }
    const m = S / n, u = ctx === 'temp' ? '°C' : '', w = staWho(r), V = r.pick(STA_VILLES);
    const Q = {
      notes: [`Voici les notes de mathématiques ${staDe(w.n)} ce trimestre : ${staSF(a)}. Calculer la moyenne de ces notes.`, `Вот оценки ${w.n} по математике за этот триместр: ${staSR(a)}. Вычисли среднее этих оценок.`],
      serie: [`On donne la série suivante : ${staSF(a)}. Calculer la moyenne de cette série.`, `Дан ряд: ${staSR(a)}. Вычисли среднее этого ряда.`],
      buts: [`Voici le nombre de buts marqués par une équipe de football lors de ses ${n} derniers matchs : ${staSF(a)}. Calculer le nombre moyen de buts par match.`, `Вот сколько голов забила футбольная команда в ${n} последних матчах: ${staSR(a)}. Вычисли среднее число голов за матч.`],
      livres: [`On a demandé à ${n} élèves combien de livres ils ont lus pendant les vacances. Voici leurs réponses : ${staSF(a)}. Calculer le nombre moyen de livres lus par élève.`, `${staNum(n, 'ученика', 'учеников', 'учеников')} спросили, сколько книг они прочитали за каникулы. Их ответы: ${staSR(a)}. Вычисли среднее число книг на одного ученика.`],
      temp: [`Voici les températures relevées à 7 h du matin à ${V[0]} pendant ${n === 7 ? 'une semaine' : 'cinq jours'} : ${staSF(a, '°C')}. Calculer la température moyenne.`, `Вот температура в 7 утра в ${V[1]} в течение ${n === 7 ? 'недели' : 'пяти дней'}: ${staSR(a, '°C')}. Вычисли среднюю температуру.`]
    }[ctx];
    return { q: staL(Q[0], Q[1]), ans: N(fx(m), u ? { unit: u } : {}), sol: [
      'Среднее («moyenne») = сумма всех значений ÷ количество значений. Значений здесь ' + n + '.',
      [ctx === 'temp' ? 'Складываем все значения. Прибавить отрицательное число — значит вычесть: $5+(-3)=2$.' : 'Складываем все значения:', staPlus(a) + '=' + S],
      ['Делим сумму на количество значений:', S + '/' + n + '=' + fx(m), u],
      'Проверка: ' + nf(m) + (u ? ' ' + u : '') + ' лежит между наименьшим значением (' + nf(Math.min(...a)) + ') и наибольшим (' + nf(Math.max(...a)) + ') — так и должно быть у среднего.'] };
  } });

topic({ id: 'st.moyenne-ponderee', ch: 'st', lvl: 2, calc: false, variants: 4,
  ru: 'Среднее по таблице и с коэффициентами', fr: 'Calculer une moyenne pondérée',
  hints: [
    'Если значение встречается несколько раз, в сумму оно входит столько же раз. Поэтому вместо длинной суммы умножаем каждое значение на его количество («effectif») или коэффициент.',
    'Сумма всех значений = сумма произведений «значение × количество». Делим её на общее количество («effectif total») — сумму всех количеств, а не на число столбцов таблицы.',
    'Коэффициент («coefficient») работает так же: оценка с коэффициентом 2 считается как две одинаковые оценки. Поэтому делим на сумму коэффициентов.'],
  gen(r, vi) {
    if (vi <= 1) {   /* frequency table: exact (vi 0) or rounded with a calculator (vi 1) */
      const C = vi === 0 ? r.pick(['freres', 'buts', 'notes']) : r.pick(['pointures', 'trajet']);
      let vals;
      if (C === 'freres') vals = [0, 1, 2, 3, 4];
      else if (C === 'buts') vals = [0, 1, 2, 3, 4, 5];
      else if (C === 'notes') { const b = r.ri(6, 9), d = r.pick([2, 3]); vals = [0, 1, 2, 3, 4].map(i => b + d * i); }
      else if (C === 'pointures') { const b = r.ri(35, 37); vals = [0, 1, 2, 3, 4, 5].map(i => b + i); }
      else vals = [5, 10, 15, 20, 25, 30];
      let N0 = 20, e = [], S = 0;
      for (let g = 0; g < 200; g++) {
        N0 = vi === 0 ? r.pick([10, 20, 20, 25]) : r.ri(23, 31);
        e = staSplit(r, N0, vals.length, 1); S = staSum(vals.map((v, i) => v * e[i]));
        if (vi === 0 || Math.abs(S * 10 / N0 - Math.round(S * 10 / N0)) > 1e-9) break;
      }
      const m = S / N0, u = C === 'trajet' ? 'min' : '';
      const T = { freres: ['Nombre de frères et sœurs', 'Effectif'], buts: ['Nombre de buts', 'Nombre de matchs'], notes: ['Note', 'Effectif'], pointures: ['Pointure', 'Effectif'], trajet: ['Temps (min)', 'Effectif'] }[C];
      const Q = {
        freres: [`Le tableau ci-dessous donne le nombre de frères et sœurs des ${N0} élèves d'une classe. Calculer le nombre moyen de frères et sœurs par élève.`, `В таблице — сколько братьев и сестёр у каждого из ${staGen(N0, 'ученика', 'учеников')} класса. Вычисли среднее число братьев и сестёр на одного ученика.`],
        buts: [`Le tableau ci-dessous donne le nombre de buts marqués par une équipe de football lors des ${N0} matchs de sa saison. Calculer le nombre moyen de buts par match.`, `В таблице — сколько голов забивала футбольная команда в ${N0} матчах сезона. Вычисли среднее число голов за матч.`],
        notes: [`Le tableau ci-dessous donne les notes obtenues par les ${N0} élèves d'une classe à un contrôle. Calculer la note moyenne de la classe.`, `В таблице — оценки ${staGen(N0, 'ученика', 'учеников')} класса за контрольную. Вычисли средний балл класса.`],
        pointures: [`Le tableau ci-dessous donne la pointure des ${N0} élèves d'une classe de 3e. Calculer la pointure moyenne de ces élèves. Arrondir au dixième.`, `В таблице — размер обуви ${staGen(N0, 'ученика', 'учеников')} класса 3e. Вычисли средний размер обуви. Округли до десятых.`],
        trajet: [`On a demandé aux ${N0} élèves d'une classe combien de minutes ils mettent pour venir au collège. Les réponses sont données dans le tableau ci-dessous. Calculer le temps de trajet moyen. Arrondir au dixième.`, `Ученикам класса (всего их ${N0}) задали вопрос: сколько минут они добираются до колледжа? Ответы — в таблице. Вычисли среднее время в пути. Округли до десятых.`]
      }[C];
      const steps = [
        ['Каждое значение встречается столько раз, сколько указано во второй строке, и столько же раз входит в сумму. Поэтому сумма всех ' + N0 + ' значений — это сумма произведений «значение × количество»:', vals.map((v, i) => v + '*' + e[i]).join('+') + '=' + S],
        ['Количество значений — сумма второй строки («effectif total»):', e.join('+') + '=' + N0]];
      const fig = staTab([[T[0]].concat(vals), [T[1]].concat(e)]);
      if (vi === 0) {
        steps.push(['Среднее:', S + '/' + N0 + '=' + fx(m)]);
        steps.push('Частая ошибка — делить на число столбцов (' + vals.length + ') или сложить только первую строку: тогда каждое значение посчитано один раз, а не столько, сколько раз оно встречается.');
        return { q: staL(Q[0], Q[1]), fig, ans: N(fx(m)), sol: steps };
      }
      const key = (Math.round(S * 10 / N0) / 10).toFixed(1), h = Math.floor(S * 100 / N0 + 1e-9) % 10;
      steps.push(['Делим (калькулятор разрешён):', S + '/' + N0 + '≈' + fx(m, 4), u]);
      steps.push('Округляем до десятых: смотрим на следующую цифру (сотые) — это ' + h + (h >= 5 ? '; 5 или больше — десятые увеличиваем на 1.' : '; меньше 5 — десятые не меняются.'));
      steps.push(['Ответ:', '≈' + key, u]);
      return { q: staL(Q[0], Q[1]), fig, calc: true, ans: N(key, u ? { dp: 1, unit: u } : { dp: 1 }), sol: steps };
    }
    if (vi === 2) {   /* two classes: the mean of the means is a trap */
      let nA = 18, nB = 12, mA = 12, mB = 9.5, M = 11;
      for (let g = 0; g < 600; g++) {
        const a = r.ri(12, 28), b = r.ri(12, 28), x = r.ri(16, 30) / 2, y = r.ri(16, 30) / 2, z = (a * x + b * y) / (a + b);
        if (a !== b && Math.abs(x - y) >= 1.5 && Math.abs(z * 10 - Math.round(z * 10)) < 1e-9) { nA = a; nB = b; mA = x; mB = y; M = z; break; }
      }
      const sw = (nB * mA + nA * mB) / (nA + nB);
      const ds = staDist(M, [
        { v: (mA + mB) / 2, ru: 'это среднее двух средних. Так можно, только если в классах поровну учеников; здесь в одном классе учеников больше, и его оценки весят больше' },
        Math.abs(sw * 100 - Math.round(sw * 100)) < 1e-9 ? { v: sw, ru: 'численности классов перепутаны: среднее ' + nf(mA) + ' относится к ' + nA + ' ученикам, а не к ' + nB } : null,
        { v: nA > nB ? mA : mB, ru: 'это среднее только большего класса — меньший класс тоже влияет на общее среднее' },
        { v: mA + mB, ru: 'это сумма двух средних — среднее не может быть больше всех оценок' },
        { v: M + 0.5, ru: 'арифметическая ошибка' }]);
      ds.forEach(d => { d.t = nf(d.v); });
      return { q: staL(`Au dernier contrôle de mathématiques, les ${nA} élèves de 3e A ont obtenu une moyenne de ${nf(mA)} et les ${nB} élèves de 3e B une moyenne de ${nf(mB)}. Quelle est la moyenne de l'ensemble des ${nA + nB} élèves ?`,
        `В 3e A ${staNum(nA, 'ученик', 'ученика', 'учеников')}, их средняя оценка за последнюю контрольную по математике — ${nf(mA)}; в 3e B ${staNum(nB, 'ученик', 'ученика', 'учеников')}, их средняя оценка — ${nf(mB)}. Чему равна средняя оценка всех ${staGen(nA + nB, 'ученика', 'учеников')}?`),
        ans: MQ(r, [nf(M)].concat(ds.map(d => d.t)), 0), sol: [
          ['Сумма оценок класса = среднее × число учеников (ведь среднее = сумма ÷ количество). Для 3e A:', nA + '*' + fx(mA) + '=' + fx(nA * mA)],
          ['Для 3e B:', nB + '*' + fx(mB) + '=' + fx(nB * mB)],
          ['Общее среднее = общая сумма ÷ общее число учеников:', '(' + fx(nA * mA) + '+' + fx(nB * mB) + ')/' + (nA + nB) + '=' + fx(M)],
          staWhy(ds)] };
    }
    /* coefficients */
    const w = staWho(r), co = r.pick([[2, 2, 1], [2, 1, 1], [3, 1, 1], [2, 1, 2], [1, 2, 1], [1, 1, 2], [1, 1, 3]]);   /* sum 4 or 5: the mean has at most 2 decimals */
    const ev = r.sh([['à un contrôle', 'за контрольную'], ['à un devoir maison', 'за домашнюю работу'], ['à une interrogation écrite', 'за самостоятельную работу'], ['à un exposé', 'за доклад']]).slice(0, 3);
    const nt = [r.ri(6, 19), r.ri(6, 19), r.ri(6, 19)], S = staSum(nt.map((x, i) => x * co[i])), C = staSum(co), m = S / C;
    return { q: staL(`En mathématiques, ${w.n} a obtenu ${nt[0]} ${ev[0][0]} (coefficient ${co[0]}), ${nt[1]} ${ev[1][0]} (coefficient ${co[1]}) et ${nt[2]} ${ev[2][0]} (coefficient ${co[2]}). Calculer sa moyenne.`,
      `По математике ${w.n} ${staG(w, 'получил', 'получила')} ${nt[0]} ${ev[0][1]} (коэффициент ${co[0]}), ${nt[1]} ${ev[1][1]} (коэффициент ${co[1]}) и ${nt[2]} ${ev[2][1]} (коэффициент ${co[2]}). Вычисли средний балл.`),
      ans: N(fx(m)), sol: [
        ['Коэффициент («coefficient») — это вес оценки: оценка с коэффициентом 2 считается так, будто её получили два раза. Сумма оценок с учётом коэффициентов:', nt.map((x, i) => x + '*' + co[i]).join('+') + '=' + S],
        ['Делим на сумму коэффициентов — столько «оценок» получилось:', co.join('+') + '=' + C],
        ['Среднее:', S + '/' + C + '=' + fx(m)],
        'Ошибка — делить на 3 (число оценок без коэффициентов): тогда коэффициенты учтены в сумме, но не учтены в количестве.'] };
  } });

topic({ id: 'st.mediane', ch: 'st', lvl: 1, calc: false, variants: 3,
  ru: 'Медиана ряда', fr: 'Déterminer une médiane',
  hints: [
    'Медиана («médiane») делит ряд пополам: не меньше половины значений не больше её, и не меньше половины — не меньше её. Поэтому сначала расставь значения по возрастанию — иначе «середина» ничего не значит.',
    'Если значений нечётное число $n$, медиана — значение номер $(n+1)/2$ в упорядоченном ряду: слева и справа от него поровну значений.',
    'Если значений чётное число, посередине стоят два значения; медиана — число ровно между ними (их полусумма).'],
  gen(r, vi) {
    const ctx = vi === 1 ? r.pick(['temps', 'notes', 'serie']) : vi === 0 ? r.pick(['notes', 'temp', 'serie']) : r.pick(['notes', 'serie']);
    const n = vi === 1 ? r.pick([6, 8, 10]) : ctx === 'serie' ? r.pick([7, 9]) : r.pick([5, 7]);
    const R = { notes: [3, 20], temp: [-6, 9], serie: [1, 30], temps: [5, 45] }[ctx];
    let a = [];
    for (let g = 0; g < 300; g++) {
      a = []; for (let i = 0; i < n; i++) a.push(r.ri(R[0], R[1]));
      const s = staSort(a);
      if (a.every((v, i) => v === s[i]) || new Set(a).size < n - 2 || (ctx === 'temp' && !a.some(v => v < 0))) continue;
      if (n % 2 && a[(n - 1) / 2] === s[(n - 1) / 2]) continue;   /* the middle of the raw list must not be the median */
      break;
    }
    const s = staSort(a), u = ctx === 'temp' ? '°C' : ctx === 'temps' ? 'min' : '', w = staWho(r), V = r.pick(STA_VILLES);
    const mat = r.pick([['mathématiques', 'математике'], ['français', 'французскому'], ['anglais', 'английскому'], ['histoire-géographie', 'истории и географии']]);
    const mois = r.pick([['janvier', 'января'], ['février', 'февраля'], ['décembre', 'декабря']]);
    let st, med;
    if (n % 2) {
      const k = (n + 1) / 2; med = s[k - 1];
      st = [
        'Медиана делит упорядоченный ряд пополам, поэтому сначала расставляем значения по возрастанию («dans l\'ordre croissant»): ' + staSR(s, staUR(u)) + '.',
        ['Значений ' + n + ' — нечётное число. Серединное значение стоит на месте номер', '(' + n + '+1)/2=' + k],
        'Слева от него ' + (k - 1) + ' ' + staPl(k - 1, 'значение', 'значения', 'значений') + ' и справа столько же. ' + k + '-е значение упорядоченного ряда — ' + nf(med) + (u ? ' ' + staUR(u) : '') + '. Это медиана.'];
      if (new Set(a).size < n) st.push('Одинаковые значения записываем столько раз, сколько они встречаются, — иначе места сдвинутся.');
    } else {
      const k = n / 2, a1 = s[k - 1], a2 = s[k]; med = (a1 + a2) / 2;
      st = [
        'Сначала расставляем значения по возрастанию: ' + staSR(s, staUR(u)) + '.',
        'Значений ' + n + ' — чётное число, поэтому посередине стоят два значения: ' + k + '-е и ' + (k + 1) + '-е, то есть ' + nf(a1) + ' и ' + nf(a2) + '.',
        a1 === a2 ? 'Оба равны ' + nf(a1) + ', значит, медиана равна ' + nf(a1) + (u ? ' ' + staUR(u) : '') + '.' : ['Любое число между ними делит ряд на две равные половины; договорились брать середину между ними:', '(' + fx(a1) + '+' + fx(a2) + ')/2=' + fx(med), u]];
    }
    const QN = {
      notes: n % 2 ? [`Voici les notes ${staDe(w.n)} en ${mat[0]} ce trimestre : ${staSF(a)}. Déterminer la médiane de ces notes.`, `Вот оценки ${w.n} по ${mat[1]} за этот триместр: ${staSR(a)}. Найди медиану этих оценок.`]
        : [`Voici les notes obtenues par ${n} élèves à un contrôle : ${staSF(a)}. Déterminer la note médiane.`, `Вот оценки ${n} учеников за контрольную: ${staSR(a)}. Найди медианную оценку.`],
      temp: [`On a relevé la température minimale à ${V[0]} pendant les ${STA_NUM_FR[n]} premiers jours de ${mois[0]} : ${staSF(a, '°C')}. Déterminer la médiane de cette série.`, `Минимальная температура в ${V[1]} в первые ${STA_NUM_RU[n]} дней ${mois[1]}: ${staSR(a, '°C')}. Найди медиану этого ряда.`],
      serie: n % 2 ? [`Déterminer la médiane de la série : ${staSF(a)}.`, `Найди медиану ряда: ${staSR(a)}.`] : [`On considère la série : ${staSF(a)}. Déterminer sa médiane.`, `Дан ряд: ${staSR(a)}. Найди его медиану.`],
      temps: [`Voici le temps de trajet, en minutes, de ${n} élèves pour venir au collège : ${staSF(a)}. Déterminer la médiane de cette série.`, `Вот сколько минут ${n} учеников добираются до колледжа: ${staSR(a)}. Найди медиану этого ряда.`]
    }[ctx];
    if (vi < 2) return { q: staL(QN[0], QN[1]), ans: N(fx(med), u ? { unit: u } : {}), sol: st };
    /* QCM: the classic mistakes */
    const k = (n + 1) / 2, mean = staSum(a) / n;
    const ds = staDist(med, [
      { v: a[k - 1], ru: 'это значение стоит в середине записи, но ряд не упорядочен — сначала нужно расставить значения по возрастанию' },
      Number.isInteger(mean) ? { v: mean, ru: 'это среднее (сумма ÷ количество), а не медиана' } : null,
      { v: k, ru: 'это номер серединного места, а не само значение' },
      { v: s[k], ru: 'это ' + (k + 1) + '-е значение: место медианы посчитано неверно' },
      { v: s[k - 2], ru: 'это ' + (k - 1) + '-е значение: место медианы посчитано неверно' }]);
    ds.forEach(d => { d.t = nf(d.v); });
    const Q = ctx === 'notes' ? [`Voici les notes ${staDe(w.n)} en ${mat[0]} : ${staSF(a)}. Quelle est la médiane de ces notes ?`, `Вот оценки ${w.n} по ${mat[1]}: ${staSR(a)}. Чему равна медиана этих оценок?`]
      : [`On considère la série : ${staSF(a)}. Quelle est la médiane de cette série ?`, `Дан ряд: ${staSR(a)}. Чему равна медиана этого ряда?`];
    return { q: staL(Q[0], Q[1]), ans: MQ(r, [nf(med)].concat(ds.map(d => d.t)), 0), sol: st.concat([staWhy(ds)]) };
  } });

/* the k-th value (from 1) of a series given by a frequency table */
function staKth(vals, e, k) { let c = 0; for (let i = 0; i < vals.length; i++) { c += e[i]; if (k <= c) return vals[i]; } return vals[vals.length - 1]; }
/* «8 — места с 1-го по 3-е; 10 — места с 4-го по 8-е…» up to the place k */
function staPlaces(vals, e, k, u) {
  const out = []; let c = 0;
  for (let i = 0; i < vals.length && c < k; i++) { if (!e[i]) continue; const a = c + 1; c += e[i]; out.push(nf(vals[i]) + (u ? ' ' + u : '') + ' — ' + (a === c ? 'место ' + a : 'места с ' + a + '-го по ' + c + '-е')); }
  return out.join('; ');
}
/* the median of a frequency table, with the steps */
function staMedSteps(vals, e, u) {
  const N0 = staSum(e), odd = N0 % 2 === 1, k = odd ? (N0 + 1) / 2 : N0 / 2;
  const v1 = staKth(vals, e, k), v2 = odd ? v1 : staKth(vals, e, k + 1), med = (v1 + v2) / 2;
  const st = [
    odd ? ['Значений ' + N0 + ' — нечётное число, медиана — значение номер', '(' + N0 + '+1)/2=' + k] : 'Значений ' + N0 + ' — чётное число, медиана — середина между ' + k + '-м и ' + (k + 1) + '-м значениями.',
    'Значения уже идут по возрастанию. Накапливаем количества («effectifs cumulés»): ' + staPlaces(vals, e, odd ? k : k + 1, u) + '.',
    odd ? k + '-е значение — ' + nf(v1) + (u ? ' ' + u : '') + '. Это медиана.'
      : v1 === v2 ? k + '-е и ' + (k + 1) + '-е значения оба равны ' + nf(v1) + ', поэтому медиана — ' + nf(v1) + (u ? ' ' + u : '') + '.'
        : [k + '-е значение — ' + nf(v1) + ', ' + (k + 1) + '-е — ' + nf(v2) + '. Медиана — середина между ними:', '(' + fx(v1) + '+' + fx(v2) + ')/2=' + fx(med), u]];
  return { med, st };
}

topic({ id: 'st.mediane-tableau', ch: 'st', lvl: 2, calc: false, variants: 4,
  ru: 'Медиана по таблице и диаграмме, смысл медианы', fr: 'Médiane : tableau, diagramme, interprétation',
  hints: [
    'В таблице или на диаграмме каждое значение повторяется столько раз, сколько указано в строке «Effectif» (или какова высота столбика). Сначала найди общее количество значений — сложи все количества.',
    'Номер серединного места: при нечётном $N$ это $(N+1)/2$; при чётном медиана — середина между значениями номер $N/2$ и $N/2+1$.',
    'Иди слева направо и накапливай количества («effectifs cumulés»), пока не дойдёшь до нужного номера. Смысл медианы: не меньше половины значений не больше её, и не меньше половины — не меньше.'],
  gen(r, vi) {
    if (vi === 0) {   /* frequency table */
      const C = r.pick(['notes', 'livres', 'pointures']);
      let vals;
      if (C === 'notes') { const b = r.ri(6, 8); vals = [0, 1, 2, 3, 4, 5].map(i => b + 2 * i); }
      else if (C === 'livres') vals = [0, 1, 2, 3, 4, 5];
      else { const b = r.ri(35, 37); vals = [0, 1, 2, 3, 4, 5].map(i => b + i); }
      const N0 = r.ri(15, 31), e = staSplit(r, N0, 6, 1), M = staMedSteps(vals, e);
      const Q = {
        notes: [`Le tableau ci-dessous donne les notes obtenues par les ${N0} élèves d'une classe à un contrôle. Déterminer la note médiane.`, `В таблице — оценки ${staGen(N0, 'ученика', 'учеников')} класса за контрольную. Найди медианную оценку.`, 'Note'],
        livres: [`Le tableau ci-dessous donne le nombre de livres lus pendant l'été par chacun des ${N0} élèves d'une classe. Déterminer la médiane de cette série.`, `В таблице — сколько книг прочитал за лето каждый из ${staGen(N0, 'ученика', 'учеников')} класса. Найди медиану этого ряда.`, 'Nombre de livres'],
        pointures: [`Le tableau ci-dessous donne la pointure des ${N0} joueurs d'un club de handball. Déterminer la pointure médiane.`, `В таблице — размер обуви ${staGen(N0, 'игрока', 'игроков')} гандбольного клуба. Найди медианный размер обуви.`, 'Pointure']
      }[C];
      return { q: staL(Q[0], Q[1]), fig: staTab([[Q[2]].concat(vals), ['Effectif'].concat(e)]), ans: N(fx(M.med)),
        sol: [['Всего значений («effectif total») — сумма второй строки:', e.join('+') + '=' + N0]].concat(M.st) };
    }
    if (vi === 1) {   /* bar chart: total and median */
      const lo = r.ri(5, 8), cnt = r.pick([9, 10, 11]), vals = []; for (let i = 0; i < cnt; i++) vals.push(lo + i);
      let e = [];
      for (let g = 0; g < 100; g++) { e = vals.map((_, i) => r.ri(i === 0 || i === cnt - 1 ? 0 : 1, 6)); if (staSum(e) >= 18 && Math.max(...e) >= 4) break; }
      const N0 = staSum(e), M = staMedSteps(vals, e), cl = r.pick(['3e A', '3e B', '3e C', '3e D']);
      const mat = r.pick([['mathématiques', 'математике'], ['physique-chimie', 'физике и химии'], ['SVT', 'биологии'], ['technologie', 'технологии']]);
      return { q: staL(`Le diagramme en barres ci-dessous donne les notes des élèves de la ${cl} au dernier contrôle de ${mat[0]}. a. Combien d'élèves ont participé à ce contrôle ? b. Quelle est la note médiane ?`,
        `На столбчатой диаграмме — оценки учеников ${cl} за последнюю контрольную по ${mat[1]}. a. Сколько учеников писали контрольную? b. Чему равна медианная оценка?`),
        fig: staBars(vals, e, { xt: 'Notes' }),
        ans: multi([staL('a. Nombre d\'élèves :', 'a. Число учеников:'), N(N0)], [staL('b. Note médiane :', 'b. Медианная оценка:'), N(fx(M.med))]),
        sol: [['a. Высота каждого столбика — число учеников с этой оценкой. Складываем высоты:', e.filter(x => x).join('+') + '=' + N0], 'b. Ищем медиану этих ' + N0 + ' оценок.'].concat(M.st) };
    }
    if (vi === 2) {   /* what a median means */
      const C = r.pick([
        { fr: "les salaires mensuels des employés d'une entreprise", ru: 'месячных зарплат сотрудников компании', v: r.ri(18, 26) * 100, u: '€', who: ['des employés', 'сотрудников'], verb: ['gagnent', 'получают'],
          moy: ['Le salaire moyen est égal à', 'Средняя зарплата равна'], ext: ["L'écart entre le salaire le plus élevé et le salaire le plus bas est de", 'Разница между самой высокой и самой низкой зарплатой равна'] },
        { fr: "les temps de trajet des élèves d'un collège", ru: 'времени в пути учеников колледжа', v: r.ri(15, 35), u: 'min', uR: 'мин', who: ['des élèves', 'учеников'], verb: ['mettent', 'тратят на дорогу'],
          moy: ['Le temps de trajet moyen est égal à', 'Среднее время в пути равно'], ext: ["L'écart entre le trajet le plus long et le trajet le plus court est de", 'Разница между самой долгой и самой короткой дорогой равна'] },
        { fr: "les tailles des joueurs d'un club de basket", ru: 'роста игроков баскетбольного клуба', v: r.ri(176, 194), u: 'cm', uR: 'см', who: ['des joueurs', 'игроков'], verb: ['mesurent', 'имеют рост'],
          moy: ['La taille moyenne est égale à', 'Средний рост равен'], ext: ["L'écart entre le joueur le plus grand et le joueur le plus petit est de", 'Разница в росте между самым высоким и самым низким игроком равна'] }]);
      const V = C.u === '€' ? eur(C.v) : nf(C.v) + ' ' + C.u, VR = C.u === '€' ? V : nf(C.v) + ' ' + C.uR;
      return { q: staL(`La médiane de la série des ${C.fr.replace(/^les /, '')} est ${V}. Parmi les affirmations suivantes, laquelle est forcément vraie ?`, `Медиана ${C.ru} равна ${VR}. Какое из утверждений обязательно верно?`),
        ans: MQ(r, [
          staL(`Au moins la moitié ${C.who[0]} ${C.verb[0]} ${V} ou moins.`, `Не меньше половины ${C.who[1]} ${C.verb[1]} ${VR} или меньше.`),
          staL(`La moitié ${C.who[0]} ${C.verb[0]} exactement ${V}.`, `Половина ${C.who[1]} ${C.verb[1]} ровно ${VR}.`),
          staL(`${C.moy[0]} ${V}.`, `${C.moy[1]} ${VR}.`),
          staL(`${C.ext[0]} ${V}.`, `${C.ext[1]} ${VR}.`)], 0),
        sol: [
          'Медиана делит упорядоченный ряд пополам: не меньше половины значений не больше медианы, и не меньше половины — не меньше её. Отсюда верное утверждение: не меньше половины ' + C.who[1] + ' — ' + VR + ' или меньше.',
          '«Ровно ' + VR + ' у половины» — неверно: медиана может вообще не совпадать ни с одним значением ряда.',
          'Среднее — другая характеристика: одно очень большое значение заметно поднимает среднее, а медиану почти не меняет.',
          'Разница между наибольшим и наименьшим значением — это размах («étendue»), с медианой он не связан.'] };
    }
    /* how many values are above the median */
    const C = r.pick(['course', 'serie', 'salaires']), N0 = r.ri(15, 41), odd = N0 % 2 === 1, ans = odd ? (N0 - 1) / 2 : N0 / 2;
    const V = C === 'course' ? r.ri(35, 55) : C === 'serie' ? r.ri(10, 60) : r.ri(18, 26) * 100;
    const Q = {
      course: [`${N0} coureurs ont participé à une course. Leurs temps sont tous différents et le temps médian est ${V} min. Combien de coureurs ont mis plus de ${V} min ?`, `Число участников забега — ${N0}, все их времена разные, медианное время — ${V} мин. Сколько участников бежали дольше ${V} мин?`],
      serie: [`Une série de ${N0} nombres, tous différents, a pour médiane ${V}. Combien de nombres de cette série sont strictement supérieurs à ${V} ?`, `Количество чисел в ряду — ${N0}, все они различны, медиана равна ${V}. Сколько чисел ряда строго больше ${V}?`],
      salaires: [`Les ${N0} salariés d'une entreprise ont des salaires tous différents. Le salaire médian est ${eur(V)}. Combien de salariés gagnent plus de ${eur(V)} ?`, `Число сотрудников компании — ${N0}, их зарплаты все разные. Медианная зарплата — ${eur(V)}. Сколько сотрудников получают больше ${eur(V)}?`]
    }[C];
    const k = (N0 + 1) / 2;
    return { q: staL(Q[0], Q[1]), ans: N(ans), sol: odd ? [
      ['Значений ' + N0 + ' — нечётное число. Медиана — само значение номер', '(' + N0 + '+1)/2=' + k],
      'Все значения разные, поэтому до неё стоят ' + (k - 1) + ' меньших значений, а после — столько же больших.',
      ['Больше медианы:', N0 + '-' + k + '=' + ans]] : [
      'Значений ' + N0 + ' — чётное число. Медиана — середина между ' + N0 / 2 + '-м и ' + (N0 / 2 + 1) + '-м значениями упорядоченного ряда.',
      'Все значения разные, поэтому медиана лежит строго между ними: ' + N0 / 2 + ' значений меньше её и ' + N0 / 2 + ' — больше.'] };
  } });

topic({ id: 'st.etendue', ch: 'st', lvl: 1, calc: false, variants: 4,
  ru: 'Размах ряда', fr: "Calculer une étendue",
  hints: [
    'Размах («étendue») показывает, насколько разбросаны значения: это разница между наибольшим и наименьшим значением.',
    'Найди в ряду самое большое и самое маленькое значение (порядок записи не важен) и вычти: наибольшее − наименьшее.',
    'С отрицательными числами аккуратно: $7-(-3)=10$ — это расстояние от −3 до 7 на числовой прямой.'],
  gen(r, vi) {
    const V = r.pick(STA_VILLES);
    if (vi === 1) {   /* the other extreme from the range */
      const C = r.pick(['notes', 'salaires', 'temp']);
      if (C === 'notes') {
        const lo = r.ri(2, 9), e = r.ri(6, 20 - lo);
        return { q: staL(`Au dernier contrôle de mathématiques d'une classe, la note la plus basse est ${lo} et l'étendue des notes est ${e}. Quelle est la note la plus haute ?`, `На последней контрольной по математике самая низкая оценка в классе — ${lo}, а размах оценок равен ${e}. Какая самая высокая оценка?`),
          ans: N(lo + e), sol: ['Размах = наибольшее значение − наименьшее. Значит, наибольшее = наименьшее + размах.', ['', lo + '+' + e + '=' + (lo + e)]] };
      }
      if (C === 'salaires') {
        const hi = r.ri(30, 50) * 100, e = r.ri(12, 28) * 100;
        return { q: staL(`Dans une entreprise, le salaire le plus élevé est ${eur(hi)} et l'étendue des salaires est ${eur(e)}. Quel est le salaire le plus bas ?`, `В компании самая высокая зарплата — ${eur(hi)}, а размах зарплат — ${eur(e)}. Какая самая низкая зарплата?`),
          ans: N(hi - e, { unit: '€' }), sol: ['Размах = наибольшее значение − наименьшее. Значит, наименьшее = наибольшее − размах.', ['', hi + '-' + e + '=' + (hi - e), '€']] };
      }
      const lo = r.ri(-9, -1), e = r.ri(6, 16);
      return { q: staL(`Pendant une semaine d'hiver à ${V[0]}, la température la plus basse a été ${nf(lo)} °C et l'étendue des températures est ${e} °C. Quelle a été la température la plus haute ?`, `За зимнюю неделю в ${V[1]} самая низкая температура была ${nf(lo)} °C, а размах температур — ${e} °C. Какой была самая высокая температура?`),
        ans: N(lo + e, { unit: '°C' }), sol: ['Размах = наибольшее значение − наименьшее. Значит, наибольшее = наименьшее + размах.', ['', lo + '+' + e + '=' + (lo + e), '°C'], 'Проверка: от ' + nf(lo) + ' до ' + nf(lo + e) + ' на числовой прямой как раз ' + e + ' единиц.'] };
    }
    const C = vi === 2 ? 'temp' : vi === 3 ? r.pick(['serie', 'notes']) : r.pick(['temp', 'notes', 'taille', 'serie']);
    const n = vi === 3 ? r.ri(5, 6) : r.ri(5, 8), R = { temp: [-8, 12], notes: [2, 20], taille: [160, 198], serie: [1, 60] }[C];
    let a = [];
    for (let g = 0; g < 300; g++) {
      a = []; for (let i = 0; i < n; i++) a.push(r.ri(R[0], R[1]));
      const lo = Math.min(...a), hi = Math.max(...a);
      if (new Set(a).size < n - 1 || hi - lo < 5) continue;
      if (C === 'temp' && !(lo < 0 && hi > 0 && hi + lo !== 0)) continue;
      if (vi === 2 && (a[0] === lo || a[0] === hi || a[n - 1] === lo || a[n - 1] === hi)) continue;   /* the extremes are not at the ends */
      break;
    }
    const lo = Math.min(...a), hi = Math.max(...a), e = hi - lo, u = C === 'temp' ? '°C' : C === 'taille' ? 'cm' : '';
    const Q = {
      temp: [`Voici les températures relevées à midi à ${V[0]} pendant ${n} jours : ${staSF(a, '°C')}. ${vi === 2 ? "Quelle est l'étendue de cette série ?" : "Calculer l'étendue de cette série."}`, `Вот температура в полдень в ${V[1]} за ${n} дней: ${staSR(a, '°C')}. ${vi === 2 ? 'Чему равен размах этого ряда?' : 'Найди размах этого ряда.'}`],
      notes: [`Voici les notes d'un élève en anglais : ${staSF(a)}. Calculer l'étendue de ces notes.`, `Оценки ученика по английскому: ${staSR(a)}. Найди размах этих оценок.`],
      taille: [`Voici les tailles, en cm, des ${n} joueurs d'une équipe de volley : ${staSF(a)}. Calculer l'étendue de cette série.`, `Рост ${n} игроков волейбольной команды в сантиметрах: ${staSR(a)}. Найди размах этого ряда.`],
      serie: [`Calculer l'étendue de la série : ${staSF(a)}.`, `Найди размах ряда: ${staSR(a)}.`]
    }[C];
    const base = [
      'Размах = наибольшее значение − наименьшее. Упорядочивать весь ряд не нужно — достаточно найти два крайних значения.',
      'Наибольшее значение — ' + nf(hi) + ', наименьшее — ' + nf(lo) + '.',
      ['Размах:', hi + '-' + (lo < 0 ? '(' + lo + ')' : lo) + '=' + e, u]];
    if (lo < 0) base.push('Вычесть отрицательное число — значит прибавить противоположное: от ' + nf(lo) + ' до ' + nf(hi) + ' на числовой прямой ' + e + ' единиц.');
    if (vi === 0) return { q: staL(Q[0], Q[1]), ans: N(e, u ? { unit: u } : {}), sol: base };
    if (vi === 2) {   /* QCM with the usual mistakes */
      const ds = staDist(e, [
        hi + lo > 0 ? { v: hi + lo, ru: 'знак потерян: из ' + nf(hi) + ' вычли ' + nf(-lo) + ' вместо ' + nf(lo) + '; вычитать отрицательное — значит прибавлять' } : null,
        { v: hi, ru: 'это только наибольшее значение, а размах — разница наибольшего и наименьшего' },
        { v: Math.abs(a[n - 1] - a[0]), ru: 'из последнего значения вычли первое, но ряд не упорядочен — крайние значения стоят не на концах' },
        { v: e - 1, ru: 'неверно посчитано расстояние между ' + nf(lo) + ' и ' + nf(hi) },
        { v: e + 1, ru: 'неверно посчитано расстояние между ' + nf(lo) + ' и ' + nf(hi) }]);
      ds.forEach(d => { d.t = nf(d.v) + ' °C'; });
      return { q: staL(Q[0], Q[1]), ans: MQ(r, [staNb(nf(e) + ' °C')].concat(ds.map(d => staNb(d.t))), 0), sol: base.concat([staWhy(ds)]) };
    }
    /* vi 3: a value is added (inside the range or not) */
    let x = hi + 3;
    for (let g = 0; g < 60; g++) {
      const t = r();
      x = t < 0.4 ? r.ri(lo + 1, hi - 1) : t < 0.7 ? hi + r.ri(2, 9) : lo - r.ri(2, 9);
      if (C === 'notes' && (x < 0 || x > 20)) continue;
      if (!a.includes(x)) break;
    }
    const lo3 = Math.min(lo, x), hi3 = Math.max(hi, x), e3 = hi3 - lo3, w = staWho(r);
    const Q3 = C === 'notes' ? [`Les notes ${staDe(w.n)} en sciences sont : ${staSF(a)}. ${w.f ? 'Elle' : 'Il'} obtient ensuite la note ${x}. Quelle est l'étendue de la nouvelle série de notes ?`, `Оценки ${w.n} по естественным наукам: ${staSR(a)}. Потом ${staG(w, 'он получил', 'она получила')} оценку ${x}. Найди размах нового ряда оценок.`]
      : [`On considère la série : ${staSF(a)}. On ajoute la valeur ${nf(x)} à cette série. Quelle est l'étendue de la nouvelle série ?`, `Дан ряд: ${staSR(a)}. К нему добавили значение ${nf(x)}. Найди размах нового ряда.`];
    return { q: staL(Q3[0], Q3[1]), ans: N(e3), sol: [
      'Размах зависит только от двух крайних значений. Сейчас наименьшее — ' + nf(lo) + ', наибольшее — ' + nf(hi) + ', размах ' + e + '.',
      x > lo && x < hi ? 'Новое значение ' + nf(x) + ' лежит между ними, поэтому крайние значения не меняются и размах остаётся прежним.'
        : x > hi ? 'Новое значение ' + nf(x) + ' больше прежнего наибольшего — теперь наибольшее значение ' + nf(x) + '.' : 'Новое значение ' + nf(x) + ' меньше прежнего наименьшего — теперь наименьшее значение ' + nf(x) + '.',
      ['Размах нового ряда:', hi3 + '-' + (lo3 < 0 ? '(' + lo3 + ')' : lo3) + '=' + e3]] };
  } });

topic({ id: 'st.effectifs-frequences', ch: 'st', lvl: 1, calc: false, variants: 4,
  ru: 'Количество и частота', fr: 'Effectifs et fréquences',
  hints: [
    'Количество («effectif») значения — сколько раз оно встречается; общее количество («effectif total») — сколько всего данных, то есть сумма всех количеств.',
    'Частота («fréquence») = effectif ÷ effectif total. Это доля от всех данных — число от 0 до 1.',
    'Частоту можно записать дробью, десятичной дробью или в процентах: $6/24=1/4=0.25$, то есть 25 %.'],
  gen(r, vi) {
    if (vi === 0) {   /* coin: frequency, QCM */
      let n = 10, k = 4;
      for (let g = 0; g < 100; g++) {
        const nn = r.pick([8, 10, 12]), kk = r.ri(2, nn - 2);
        const vs = [kk / nn, (nn - kk) / nn, kk / (nn - kk), 1 / 2];
        if (vs.every((v, i) => vs.every((w2, j) => i === j || Math.abs(v - w2) > 1e-9))) { n = nn; k = kk; break; }
      }
      const face = r.pick(['pile', 'face']), other = face === 'pile' ? 'face' : 'pile';
      const res = r.sh(new Array(k).fill(face).concat(new Array(n - k).fill(other)));
      const ds = [{ t: staFt(n - k, n), ru: 'это частота «' + other + '»' }, { t: staFt(k, n - k), ru: 'число «' + face + '» поделили на число «' + other + '», а делить нужно на общее число бросков' }, { t: staFt(1, 2), ru: 'это вероятность для честной монеты, а частота — то, что получилось в этом опыте' }];
      const w = staWho(r);
      return { q: staL(`${w.n} lance une pièce de monnaie ${n} fois de suite et note chaque résultat : ${res.join(', ')}. Quelle est la fréquence d'apparition de « ${face} » ?`, `${w.n} ${staG(w, 'подбросил', 'подбросила')} монету ${n} раз подряд и ${staG(w, 'записал', 'записала')} результаты: ${res.join(', ')}. Какова частота выпадения «${face}»?`),
        ans: MQ(r, [staFt(k, n)].concat(ds.map(d => d.t)), 0), sol: [
          'Частота («fréquence») = сколько раз выпал «' + face + '» ÷ сколько всего было бросков.',
          'Считаем «' + face + '»: ' + k + ' ' + staPl(k, 'раз', 'раза', 'раз') + ' из ' + n + '.',
          ['Частота:', staFq(k, n)],
          staWhy(ds)] };
    }
    if (vi === 1) {   /* frequency in percent from a table */
      const T = r.pick([20, 25, 50]), e = staSplit(r, T, 4, 2), j = r.ri(0, 3), p = e[j] * 100 / T;
      const cat = [['à pied', 'пешком', 'À pied'], ['à vélo', 'на велосипеде', 'Vélo'], ['en bus', 'на автобусе', 'Bus'], ['en voiture', 'на машине', 'Voiture']];
      const grp = T === 50 ? ['aux 50 élèves de deux classes de 3e', 'Ученикам двух классов 3e (всего их 50)'] : [`aux ${T} élèves d'une classe`, `Ученикам класса (всего их ${T})`];
      return { q: staL(`On a demandé ${grp[0]} comment ils viennent au collège. Les résultats sont donnés dans le tableau ci-dessous. Quelle est la fréquence, en pourcentage, des élèves qui viennent ${cat[j][0]} ?`,
        `${grp[1]} задали вопрос, как они добираются до колледжа. Результаты — в таблице. Какова частота (в процентах) учеников, которые добираются ${cat[j][1]}?`),
        fig: staTab([['Moyen de transport'].concat(cat.map(c => c[2])), ['Effectif'].concat(e)]), ans: N(fx(p), { unit: '%' }), sol: [
          ['Частота = количество ÷ общее количество. Всего учеников:', e.join('+') + '=' + T],
          ['Частота:', e[j] + '/' + T + '=' + fx(e[j] / T)],
          ['В процентах — умножаем на 100 (процент — это сотая доля):', fx(e[j] / T) + '*100=' + fx(p), '%']] };
    }
    if (vi === 2) {   /* a count from a frequency */
      const neg = r() < 0.35, form = r.pick(['pct', 'frac', 'dec']);
      const fr0 = form === 'frac' ? r.pick([[1, 4], [3, 4], [1, 3], [2, 3], [2, 5], [3, 5]]) : r.pick([[1, 4], [3, 4], [1, 2], [1, 5], [2, 5], [3, 10], [1, 10], [7, 10]]);
      const T = form === 'pct' && r() < 0.4 ? r.pick([200, 300, 400, 500]) : fr0[1] * r.ri(Math.ceil(18 / fr0[1]), Math.floor((form === 'frac' ? 32 : 40) / fr0[1]));   /* a class has at most 32 pupils */
      const part = T * fr0[0] / fr0[1], f = fr0[0] / fr0[1], ans = neg ? T - part : part;
      let Q, M;
      if (form === 'pct') {
        Q = T >= 100 ? [`Dans un collège de ${T} élèves, ${nf(100 * f)} % des élèves participent à un concours de mathématiques. Combien d'élèves ${neg ? 'ne participent pas' : 'participent'} à ce concours ?`, `В колледже ${staNum(T, 'ученик', 'ученика', 'учеников')}, ${nf(100 * f)} % из них участвуют в математическом конкурсе. Сколько учеников ${neg ? 'не участвуют' : 'участвуют'} в конкурсе?`]
          : [`Parmi les ${T} élèves de 3e d'un collège, ${nf(100 * f)} % participent à un concours de mathématiques. Combien d'élèves de 3e ${neg ? 'ne participent pas' : 'participent'} à ce concours ?`, `Среди ${staGen(T, 'ученика', 'учеников')} 3e колледжа ${nf(100 * f)} % участвуют в математическом конкурсе. Сколько учеников 3e ${neg ? 'не участвуют' : 'участвуют'} в конкурсе?`];
        M = T + '*' + fx(100 * f) + '/100=' + part;
      } else if (form === 'frac') {
        Q = [`Dans une classe de ${T} élèves, les ${staFt(fr0[0], fr0[1])} des élèves déjeunent à la cantine. Combien d'élèves ${neg ? 'ne déjeunent pas' : 'déjeunent'} à la cantine ?`, `В классе ${staNum(T, 'ученик', 'ученика', 'учеников')}, ${staFt(fr0[0], fr0[1])} из них обедают в столовой. Сколько учеников ${neg ? 'не обедают' : 'обедают'} в столовой?`];
        M = fr0[0] + '/' + fr0[1] + '*' + T + '=' + part;
      } else {
        Q = [`Dans un club de sport de ${T} adhérents, la fréquence des adhérents qui ont moins de 15 ans est ${nf(f)}. Combien d'adhérents ${neg ? 'ont 15 ans ou plus' : 'ont moins de 15 ans'} ?`, `В спортивном клубе ${staNum(T, 'член', 'члена', 'членов')}; частота тех, кому меньше 15 лет, равна ${nf(f)}. Сколько членов клуба ${neg ? '15 лет или старше' : 'младше 15 лет'}?`];
        M = fx(f) + '*' + T + '=' + part;
      }
      const st = [['Количество = частота × общее количество (ведь частота = количество ÷ общее количество):', M]];
      if (neg) st.push(['Нас спрашивают про остальных:', T + '-' + part + '=' + ans]);
      return { q: staL(Q[0], Q[1]), ans: N(ans), sol: st };
    }
    /* total and frequency as a fraction */
    const sp = r.sh([['le football', 'футбол', 'Football'], ['le basket', 'баскетбол', 'Basket'], ['la natation', 'плавание', 'Natation'], ['la danse', 'танцы', 'Danse'], ['le tennis', 'теннис', 'Tennis']]).slice(0, 4);
    let e = [], T = 0, j = 0;
    for (let g = 0; g < 100; g++) { T = r.ri(20, 32); e = staSplit(r, T, 4, 2); j = r.ri(0, 3); if (gcd(e[j], T) > 1) break; }
    const cl = r.pick(['3e A', '3e B', '3e C', '4e A', '4e B']);
    return { q: staL(`Le tableau ci-dessous donne le sport préféré des élèves de la ${cl}. a. Quel est l'effectif total de la classe ? b. Quelle est la fréquence des élèves qui préfèrent ${sp[j][0]} ? Donner le résultat sous forme de fraction irréductible.`,
      `В таблице — любимый вид спорта учеников ${cl}. a. Сколько всего учеников в классе? b. Какова частота учеников, которые предпочитают ${sp[j][1]}? Запиши ответ несократимой дробью.`),
      fig: staTab([['Sport préféré'].concat(sp.map(s => s[2])), ['Effectif'].concat(e)]),
      ans: multi([staL('a. Effectif total :', 'a. Всего учеников:'), N(T)], [staL('b. Fréquence :', 'b. Частота:'), FRA(F(e[j], T))]), sol: [
        ['a. Общее количество — сумма всех количеств:', e.join('+') + '=' + T],
        ['b. Частота = количество ÷ общее количество:', staFq(e[j], T)],
        F(e[j], T).d !== T ? 'Дробь сокращаем: числитель и знаменатель делятся на ' + gcd(e[j], T) + ' — значение частоты при этом не меняется.' : 'Дробь уже несократимая.'] };
  } });

topic({ id: 'st.diagrammes', ch: 'st', lvl: 1, calc: false, variants: 4,
  ru: 'Чтение диаграмм', fr: 'Lire un diagramme',
  hints: [
    'В столбчатой диаграмме («diagramme en barres») высота столбика — это количество («effectif»). Веди взгляд от верха столбика горизонтально к оси и читай число по сетке.',
    'В круговой диаграмме («diagramme circulaire») весь круг — это все данные, 360°. Доля сектора = его угол ÷ 360; количество = доля × общее количество.',
    'В гистограмме («histogramme») каждый столбик отвечает за промежуток («classe»), например от 150 до 160 см: 150 входит, 160 — уже в следующий столбик.'],
  gen(r, vi) {
    if (vi <= 1) {   /* bar chart */
      const C = r.pick(['freres', 'sport']);
      if (C === 'freres') {
        const vals = [0, 1, 2, 3, 4, 5], e = vals.map((_, i) => r.ri(i < 3 ? 2 : 0, i < 3 ? 10 : 5)), T = staSum(e);
        const fig = staBars(vals, e, { xt: 'Nombre de frères et sœurs' }), cl = r.pick(['3e A', '3e B', '4e C', '5e A']);
        const intro = [`Le diagramme en barres ci-dessous donne le nombre de frères et sœurs des élèves de la ${cl}.`, `На столбчатой диаграмме — число братьев и сестёр у учеников ${cl}.`];
        if (vi === 1) return { q: staL(intro[0] + ' Combien y a-t-il d\'élèves dans cette classe ?', intro[1] + ' Сколько учеников в этом классе?'), fig, ans: N(T), sol: [
          'Каждый ученик учтён ровно в одном столбике, поэтому все ученики — это сумма высот всех столбиков.',
          ['Читаем высоты по сетке и складываем:', e.join('+') + '=' + T]] };
        if (r() < 0.5) {
          const k = r.pick(vals.filter(i => e[i] > 0));   /* a bar that is there */
          const Q = k === 0 ? ['Combien d\'élèves n\'ont ni frère ni sœur ?', 'У скольких учеников нет ни братьев, ни сестёр?'] : k === 1 ? ['Combien d\'élèves ont exactement un frère ou une sœur ?', 'У скольких учеников ровно один брат или одна сестра?'] : [`Combien d'élèves ont exactement ${k} frères et sœurs ?`, `У скольких учеников число братьев и сестёр равно ${k}?`];
          return { q: staL(intro[0] + ' ' + Q[0], intro[1] + ' ' + Q[1]), fig, ans: N(e[k]), sol: ['Находим столбик над числом ' + k + ' и ведём взгляд от его верха горизонтально к вертикальной оси.', 'Верх столбика — на уровне ' + e[k] + '. Значит, таких учеников ' + e[k] + '.'] };
        }
        let k = r.ri(2, 4); while (staSum(e.slice(k)) === 0) k--;
        const sel = e.slice(k), s = staSum(sel);
        return { q: staL(intro[0] + ` Combien d'élèves ont au moins ${k} frères et sœurs ?`, intro[1] + ` У скольких учеников не меньше ${k} братьев и сестёр?`), fig, ans: N(s), sol: [
          '«Au moins ' + k + '» — это ' + k + ' или больше: подходят столбики над числами ' + vals.slice(k).join(', ') + '.',
          ['Складываем их высоты:', sel.join('+') + '=' + s]] };
      }
      const sp = [['Foot', 'le foot', 'футболом'], ['Basket', 'le basket', 'баскетболом'], ['Judo', 'le judo', 'дзюдо'], ['Tennis', 'le tennis', 'теннисом'], ['Danse', 'la danse', 'танцами']];
      let e = [];
      do { e = sp.map(() => r.ri(2, 11)); } while (new Set(e).size < 4);
      const T = staSum(e), fig = staBars(sp.map(s => s[0]), e, { xt: 'Sport pratiqué' });
      const intro = ['Le diagramme en barres ci-dessous donne le sport pratiqué par les élèves inscrits à l\'association sportive d\'un collège (un seul sport par élève).', 'На столбчатой диаграмме — каким спортом занимаются ученики спортивной секции колледжа (каждый — одним видом).'];
      if (vi === 0) {
        const j = r.ri(0, 4);
        return { q: staL(intro[0] + ` Combien d'élèves pratiquent ${sp[j][1]} ?`, intro[1] + ` Сколько учеников занимаются ${sp[j][2]}?`), fig, ans: N(e[j]), sol: ['Находим столбик «' + sp[j][0] + '» и ведём взгляд от его верха горизонтально к вертикальной оси.', 'Верх столбика — на уровне ' + e[j] + '.'] };
      }
      if (r() < 0.5) return { q: staL(intro[0] + ' Combien d\'élèves sont inscrits à l\'association sportive ?', intro[1] + ' Сколько всего учеников в секции?'), fig, ans: N(T), sol: ['Каждый ученик занимается ровно одним видом спорта, поэтому все ученики — это сумма высот столбиков.', ['', e.join('+') + '=' + T]] };
      let i = r.ri(0, 4), j = r.ri(0, 4); while (e[i] === e[j]) j = (j + 1) % 5;
      if (e[i] < e[j]) [i, j] = [j, i];
      return { q: staL(intro[0] + ` Combien d'élèves de plus pratiquent ${sp[i][1]} plutôt que ${sp[j][1]} ?`, intro[1] + ` На сколько больше учеников занимаются ${sp[i][2]}, чем ${sp[j][2]}?`), fig, ans: N(e[i] - e[j]), sol: [
        'Читаем высоты двух столбиков: «' + sp[i][0] + '» — ' + e[i] + ', «' + sp[j][0] + '» — ' + e[j] + '.', ['«На сколько больше» — это разность:', e[i] + '-' + e[j] + '=' + (e[i] - e[j])]] };
    }
    if (vi === 2) {   /* pie chart with the angles (as in Métropole 2026) */
      const T = r.pick([24, 24, 36, 30, 40, 60, 72]), u = 360 / T, mn = Math.ceil(45 / u);
      let c = [];
      do { c = staSplit(r, T, 4, mn); } while (new Set(c).size < 3 || c.some(x => x * u > 180));
      const parts = c.map((x, i) => ({ lab: 'ABCD'[i] + ' : ' + x * u + '°', deg: x * u, cls: 'fc' + (i + 1) })), j = r.ri(0, 3), L0 = 'ABCD'[j], dg = c[j] * u;
      return { q: staL(`Les ${T} élèves d'un club ont répondu à une question à choix multiple (réponses A, B, C ou D). Le diagramme circulaire ci-dessous montre comment se répartissent leurs réponses. Combien d'élèves ont choisi la réponse ${L0} ?`,
        `Ученики клуба (всего их ${T}) ответили на вопрос с выбором ответа (варианты A, B, C или D). Круговая диаграмма показывает, как распределились их ответы. Сколько учеников выбрали ответ ${L0}?`),
        fig: staPie(parts), ans: N(c[j]), sol: [
          'Весь круг (360°) — это все ученики (их ' + T + '). Сектор ' + L0 + ' занимает ' + dg + '°, то есть долю ' + staFt(dg, 360) + ' круга.',
          ['Учеников:', T + '*' + dg + '/360=' + c[j]],
          'Удобнее так: на одного ученика приходится 360° ÷ ' + T + ' = ' + nf(u) + '°, а ' + dg + ' ÷ ' + nf(u) + ' = ' + c[j] + '.'] };
    }
    /* histogram */
    const C = r.pick(['taille', 'trajet']);
    const b = C === 'taille' ? [140, 150, 160, 170, 180, 190] : [0, 10, 20, 30, 40, 50], u = C === 'taille' ? 'см' : 'мин';
    let e = [];
    do { e = [r.ri(1, 6), r.ri(3, 11), r.ri(3, 12), r.ri(2, 10), r.ri(1, 6)]; } while (new Set(e).size < 4);
    const fig = staBars(null, e, { bounds: b, xt: C === 'taille' ? 'Taille (cm)' : 'Temps de trajet (min)', label: 'histogramme' });
    const intro = C === 'taille' ? ['L\'histogramme ci-dessous donne la répartition des tailles des élèves de 3e d\'un collège.', 'Гистограмма показывает распределение роста учеников 3e колледжа.']
      : ['L\'histogramme ci-dessous donne la répartition des temps de trajet entre le domicile et le collège des élèves d\'une classe.', 'Гистограмма показывает, сколько времени ученики класса тратят на дорогу от дома до колледжа.'];
    const t = r.pick(['in', 'in', 'up', 'down']), k = r.ri(1, 3);
    let Q, ans, st;
    if (t === 'in') {
      Q = C === 'taille' ? [`Combien d'élèves mesurent au moins ${b[k]} cm et moins de ${b[k + 1]} cm ?`, `У скольких учеников рост не меньше ${b[k]} см, но меньше ${b[k + 1]} см?`] : [`Combien d'élèves mettent au moins ${b[k]} min et moins de ${b[k + 1]} min ?`, `Сколько учеников тратят на дорогу не меньше ${b[k]} мин, но меньше ${b[k + 1]} мин?`];
      ans = e[k]; st = ['Промежуток от ' + b[k] + ' до ' + b[k + 1] + ' ' + u + ' — это ровно один столбик гистограммы.', 'Его высота по сетке — ' + e[k] + '.'];
    } else if (t === 'up') {
      Q = C === 'taille' ? [`Combien d'élèves mesurent ${b[k]} cm ou plus ?`, `У скольких учеников рост ${b[k]} см или больше?`] : [`Combien d'élèves mettent ${b[k]} min ou plus ?`, `Сколько учеников тратят на дорогу ${b[k]} мин или больше?`];
      ans = staSum(e.slice(k)); st = ['«' + b[k] + ' ' + u + ' или больше» — это все столбики правее отметки ' + b[k] + ' (значение ' + b[k] + ' входит в столбик, который с него начинается).', ['Складываем их высоты:', e.slice(k).join('+') + '=' + ans]];
    } else {
      Q = C === 'taille' ? [`Combien d'élèves mesurent moins de ${b[k + 1]} cm ?`, `У скольких учеников рост меньше ${b[k + 1]} см?`] : [`Combien d'élèves mettent moins de ${b[k + 1]} min ?`, `Сколько учеников тратят на дорогу меньше ${b[k + 1]} мин?`];
      ans = staSum(e.slice(0, k + 1)); st = ['«Меньше ' + b[k + 1] + ' ' + u + '» — это все столбики левее отметки ' + b[k + 1] + '.', ['Складываем их высоты:', e.slice(0, k + 1).join('+') + '=' + ans]];
    }
    return { q: staL(intro[0] + ' ' + Q[0], intro[1] + ' ' + Q[1]), fig, ans: N(ans), sol: st };
  } });

topic({ id: 'st.diagramme-circulaire', ch: 'st', lvl: 2, calc: false, variants: 4,
  ru: 'Круговая диаграмма: углы и доли', fr: 'Diagramme circulaire : angles et proportions',
  hints: [
    'Весь круг — 360°, и он соответствует всем данным (100 %). Угол сектора пропорционален количеству: какую долю данных составляет категория, такую же долю круга занимает её сектор.',
    'Угол сектора = доля × 360°. Например, 9 учеников из 36 — это $9/36=1/4$, значит, угол $1/4*360=90$ градусов.',
    'Обратно: доля = угол ÷ 360°. Сектор 72° — это $72/360=1/5$ круга, то есть 20 %.'],
  gen(r, vi) {
    const acts = [['Sport', 'спорт'], ['Musique', 'музыка'], ['Lecture', 'чтение'], ['Jeux vidéo', 'видеоигры']];
    const tr = [['vélo', 'à vélo', 'на велосипеде'], ['bus', 'en bus', 'на автобусе'], ['voiture', 'en voiture', 'на машине'], ['à pied', 'à pied', 'пешком']];
    if (vi === 0) {   /* the angle of a sector */
      const T = r.pick([18, 20, 24, 30, 36, 40, 45, 60, 72, 90]), e = staSplit(r, T, 4, Math.max(1, Math.ceil(T / 12))), j = r.ri(0, 3), dg = e[j] * 360 / T, f = F(e[j], T);
      return { q: staL(`${T} élèves ont indiqué leur activité préférée le mercredi après-midi (voir le tableau). On veut représenter ces résultats par un diagramme circulaire. Quelle est la mesure, en degrés, de l'angle du secteur « ${acts[j][0]} » ?`,
        `Ученики (всего их ${T}) назвали любимое занятие в среду после обеда (см. таблицу). Результаты хотят изобразить круговой диаграммой. Какой угол (в градусах) у сектора «${acts[j][0]}»?`),
        fig: staTab([['Activité'].concat(acts.map(a => a[0])), ['Effectif'].concat(e)]), ans: N(dg, { unit: '°' }), sol: [
          'Весь круг 360° соответствует всем ' + T + ' ученикам, а угол сектора пропорционален количеству.',
          ['Доля учеников, выбравших «' + acts[j][0] + '»:', staFq(e[j], T)],
          ['Угол сектора:', Fr.str(f) + '*360=' + dg, '°'],
          'Или так: на одного ученика приходится 360° ÷ ' + T + ' = ' + 360 / T + '°, и ' + e[j] + ' × ' + 360 / T + ' = ' + dg + '°.'] };
    }
    if (vi === 1) {   /* angle ↔ percentage */
      const p = r.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 65, 70]), dg = 3.6 * p, j = r.ri(0, 3);
      if (r() < 0.5) return { q: staL(`Sur un diagramme circulaire représentant les moyens de transport des élèves d'un collège, le secteur « ${tr[j][0]} » mesure ${fx(dg)}°. Quel pourcentage des élèves vient ${tr[j][1]} ?`,
        `На круговой диаграмме, показывающей, как ученики колледжа добираются до него, сектор «${tr[j][0]}» имеет угол ${fx(dg)}°. Какой процент учеников добирается ${tr[j][2]}?`),
        ans: N(p, { unit: '%' }), sol: [
          'Весь круг (360°) — это 100 % учеников. Доля сектора = его угол ÷ 360°.',
          ['Доля:', fx(dg) + '/360=' + fx(p / 100)],
          ['В процентах:', fx(p / 100) + '*100=' + p, '%'],
          'Удобный способ: 1 % — это 360° ÷ 100 = 3,6°, и ' + nf(dg) + ' ÷ 3,6 = ' + p + '.'] };
      return { q: staL(`Dans un collège, ${p} % des élèves viennent ${tr[j][1]}. On représente la répartition des moyens de transport par un diagramme circulaire. Quelle est la mesure, en degrés, de l'angle du secteur « ${tr[j][0]} » ?`,
        `В колледже ${p} % учеников добираются ${tr[j][2]}. Распределение способов изображают круговой диаграммой. Какой угол (в градусах) у сектора «${tr[j][0]}»?`),
        ans: N(fx(dg), { unit: '°' }), sol: [
          '100 % учеников — это весь круг, 360°. Сектор занимает такую же долю круга, какую долю составляют эти ученики.',
          ['Угол:', p + '/100*360=' + fx(dg), '°'],
          'Удобный способ: 1 % — это 3,6°, а ' + p + ' × 3,6 = ' + nf(dg) + '.'] };
    }
    if (vi === 2) {   /* from one sector to the total */
      let dg = 90, e = 6, T = 24;
      for (let g = 0; g < 100; g++) { const d = r.pick([30, 40, 45, 60, 72, 90, 120, 144]), k = r.ri(2, 15), t = k * 360 / d; if (Number.isInteger(t) && t <= 80 && t >= 10) { dg = d; e = k; T = t; break; } }
      const j = r.ri(0, 3), f = F(dg, 360);
      return { q: staL(`Sur un diagramme circulaire, le secteur « ${acts[j][0]} » mesure ${dg}° et représente ${e} élèves. Combien d'élèves ont été interrogés au total ?`,
        `На круговой диаграмме сектор «${acts[j][0]}» имеет угол ${dg}° и соответствует ${e} ученикам. Сколько всего учеников опросили?`),
        ans: N(T), sol: [
          ['Сектор ' + dg + '° — это доля круга', dg + '/360=' + Fr.str(f)],
          'Значит, ' + e + ' ' + staPl(e, 'ученик', 'ученика', 'учеников') + ' — это ' + staFt(f.n, f.d) + ' всех учеников' + (f.n === 1 ? ', и всех учеников в ' + f.d + ' ' + staPl(f.d, 'раз', 'раза', 'раз') + ' больше.' : '.'),
          ['Всего учеников:', e + '*360/' + dg + '=' + T],
          'Проверка: ' + staFt(e, T) + ' × 360° = ' + dg + '°.'] };
    }
    /* which pie chart fits the table */
    const niv = r.pick(['5e', '4e', '3e']);
    const CX = r.pick([
      { lg: [['Anglais', 'английский'], ['Espagnol', 'испанский'], ['Allemand', 'немецкий']], h: 'Langue étudiée', fr: 'quelle langue vivante ils étudient', ru: 'какой иностранный язык они изучают' },
      { lg: [['À pied', 'пешком'], ['Vélo', 'велосипед'], ['Bus', 'автобус']], h: 'Moyen de transport', fr: 'comment ils viennent au collège', ru: 'как они добираются до колледжа' },
      { lg: [['Football', 'футбол'], ['Basket', 'баскетбол'], ['Natation', 'плавание']], h: 'Sport préféré', fr: 'quel est leur sport préféré', ru: 'какой у них любимый вид спорта' }]);
    const lg = CX.lg;
    const TR = [[6, 3, 3], [3, 6, 3], [3, 3, 6], [6, 4, 2], [6, 2, 4], [4, 6, 2], [2, 6, 4], [4, 2, 6], [2, 4, 6], [8, 2, 2], [2, 8, 2], [2, 2, 8], [4, 4, 4], [5, 4, 3], [3, 4, 5], [7, 3, 2]];
    const sh = r.pick(TR.filter(t => !(t[0] === 4 && t[1] === 4))), T = r.pick([24, 36, 48, 60]), e = sh.map(x => x * T / 12);
    const same = TR.filter(t => t.join() !== sh.join() && staSort(t).join() === staSort(sh).join()), other = TR.filter(t => staSort(t).join() !== staSort(sh).join());
    const wrong = r.sh(same).slice(0, 2); while (wrong.length < 3) wrong.push(r.pick(other.filter(t => !wrong.some(w2 => w2.join() === t.join()))));
    const pies = r.sh([sh].concat(wrong)), c = pies.indexOf(sh), pos = [[88, 74], [252, 74], [88, 210], [252, 210]];
    let s = '';
    pies.forEach((t, i) => { s += staPieIn(pos[i][0], pos[i][1], 54, t.map((x, k) => ({ deg: x * 30, cls: 'fc' + (k + 1) })), false) + staTx(pos[i][0] - 70, pos[i][1] - 44, 'ABCD'[i], 'ftx', 'middle'); });
    lg.forEach((l, k) => { s += staRc(22 + k * 108, 290, 14, 14, 'fc' + (k + 1)) + staTx(42 + k * 108, 302, l[0], 'ftx', 'start'); });
    const fig = staTab([[CX.h].concat(lg.map(l => l[0])), ['Effectif'].concat(e)]) + svgFig(340, 312, s, 'quatre diagrammes circulaires');
    return { q: staL(`On a demandé à ${T} élèves de ${niv} ${CX.fr}. Les résultats sont donnés dans le tableau. Quel diagramme circulaire représente ces résultats ?`,
      `Ученикам ${niv} (всего их ${T}) задали вопрос, ${CX.ru}. Результаты — в таблице. Какая круговая диаграмма изображает эти результаты?`),
      fig, ans: MQF([staL('Diagramme A', 'Диаграмма A'), staL('Diagramme B', 'Диаграмма B'), staL('Diagramme C', 'Диаграмма C'), staL('Diagramme D', 'Диаграмма D')], c),
      sol: [
        'Находим долю каждой категории и угол её сектора (доля × 360°): ' + lg.map((l, k) => l[0] + ' — ' + staFt(e[k], T) + ' = ' + staFt(sh[k], 12) + ', угол ' + sh[k] * 30 + '°').join('; ') + '.',
        'Ищем диаграмму, где у каждого цвета из легенды сектор нужного размера: ' + lg.map((l, k) => '«' + l[0] + '» — ' + STA_PART[sh[k]]).join(', ') + '. Это диаграмма ' + 'ABCD'[c] + '.',
        'В остальных диаграммах ' + (same.length ? 'либо доли те же, но перепутаны категории (цвета) — сверяйся с легендой, либо ' : '') + 'доли другие.'] };
  } });

/* =====================================================================================================
   PROBABILITÉS
   ===================================================================================================== */
const STA_COUL = [['rouges', 'rouge', 'красных', 'красный'], ['bleues', 'bleue', 'синих', 'синий'], ['vertes', 'verte', 'зелёных', 'зелёный'], ['jaunes', 'jaune', 'жёлтых', 'жёлтый'], ['noires', 'noire', 'чёрных', 'чёрный'], ['blanches', 'blanche', 'белых', 'белый']];
const STA_NONA = '$$P(\\overline{A})=1-P(A)$$';

topic({ id: 'st.proba-simple', ch: 'st', lvl: 1, calc: false, variants: 5,
  ru: 'Вероятность в простых опытах', fr: 'Calculer une probabilité simple',
  hints: [
    'Если все исходы («issues») равновозможны («équiprobables»), вероятность события = число благоприятных исходов ÷ число всех исходов.',
    'Сначала посчитай все исходы: сколько всего шаров в мешке, граней у кости, карт в колоде, секторов на колесе. Потом — сколько из них подходят.',
    'Вероятность — число от 0 до 1. Дробь сокращаем: $4/20=1/5$.'],
  gen(r, vi) {
    const irr = ['Donner le résultat sous forme de fraction irréductible.', 'Запиши ответ несократимой дробью.'];
    if (vi === 0) {   /* bag, QCM with the classic mistakes */
      const cs = r.sh(STA_COUL.slice(0, 5)).slice(0, 3);
      let n = [], T = 0, j = 0, ds = [];
      for (let g = 0; g < 200; g++) {
        n = [r.ri(2, 12), r.ri(2, 12), r.ri(2, 12)]; T = staSum(n); j = r.ri(0, 2);
        const b = n[j], o = n[(j + 1) % 3];
        ds = staDist(b / T, [
          { v: b / (T - b), t: staFt(b, T - b), ru: 'это сравнение с остальными шарами, а делить надо на все шары' },
          { v: 1 / 3, t: staFt(1, 3), ru: 'цветов три, но они не равновозможны: шаров разных цветов разное количество' },
          { v: b / o, t: staFt(b, o), ru: 'разделили на число шаров только одного другого цвета' },
          { v: (T - b) / T, t: staFt(T - b, T), ru: 'это вероятность вынуть шар другого цвета' },
          { v: 1 / T, t: staFt(1, T), ru: 'это вероятность вынуть один определённый шар, а подходящих шаров ' + b }].filter(c => c.v < 1));
        if (ds.length === 3 && new Set(n).size === 3) break;
      }
      const b = n[j], right = r() < 0.5 ? staFt(b, T) : '$' + Fr.str(F(b, T)) + '$';
      return { q: staL(`Un sac contient ${n[0]} boules ${cs[0][0]}, ${n[1]} boules ${cs[1][0]} et ${n[2]} boules ${cs[2][0]}. On tire une boule au hasard ; toutes les boules ont la même probabilité d'être tirées. Quelle est la probabilité de tirer une boule ${cs[j][1]} ?`,
        `В мешке шары: ${cs[0][2]} — ${n[0]}, ${cs[1][2]} — ${n[1]}, ${cs[2][2]} — ${n[2]}. Наугад вынимают один шар; все шары могут быть вынуты с одинаковой вероятностью. Какова вероятность вынуть ${cs[j][3]} шар?`),
        ans: MQ(r, [right].concat(ds.map(d => d.t)), 0), sol: [
          'Все шары равновозможны, поэтому вероятность = число благоприятных исходов ÷ число всех исходов.',
          ['Всего шаров:', n.join('+') + '=' + T],
          [cs[j][2].charAt(0).toUpperCase() + cs[j][2].slice(1) + ' шаров ' + b + ', значит:', 'P=' + staFq(b, T)],
          'Почему не другие варианты: ' + ds.map(d => d.t + ' — ' + d.ru).join('; ') + '.'] };
    }
    if (vi === 1) {   /* a die */
      const f = r.pick([6, 6, 8, 10, 12]), prime = x => x > 1 && isPrimeN(x), nums = []; for (let i = 1; i <= f; i++) nums.push(i);
      const k = r.ri(2, f - 2);
      const E = r.pick([
        ['un nombre pair', 'чётное число', x => x % 2 === 0],
        ['un nombre impair', 'нечётное число', x => x % 2 === 1],
        ['un multiple de 3', 'число, кратное 3', x => x % 3 === 0],
        [`un nombre strictement supérieur à ${k}`, `число больше ${k}`, x => x > k],
        [`un nombre inférieur ou égal à ${k}`, `число, не больше ${k}`, x => x <= k],
        ['un nombre premier', 'простое число', prime],
        ['un diviseur de 12', 'делитель числа 12', x => 12 % x === 0]]);
      const ok = nums.filter(E[2]), F0 = F(ok.length, f);
      const st = ['Кость честная («équilibré»): все ' + f + ' граней выпадают с одинаковой вероятностью — ' + f + ' равновозможных исходов.', 'Благоприятные исходы: ' + ok.join(', ') + ' — их ' + ok.length + '.'];
      if (E[0] === 'un nombre premier') st.push('Напоминание: 1 — не простое число (у него только один делитель).');
      st.push(['', 'P=' + staFq(ok.length, f)]);
      return { q: staL(`On lance un dé équilibré à ${f} faces numérotées de 1 à ${f}. Quelle est la probabilité d'obtenir ${E[0]} ? ${irr[0]}`, `Бросают честную игральную кость с ${f} гранями, пронумерованными от 1 до ${f}. Какова вероятность получить ${E[1]}? ${irr[1]}`),
        ans: FRA(F0), sol: st };
    }
    if (vi === 2) {   /* a pack of cards */
      const n = r.pick([32, 52]), per = n / 4;
      const desc = n === 32 ? ['Ce jeu comporte quatre couleurs (pique, cœur, carreau, trèfle) et, dans chaque couleur, huit cartes : 7, 8, 9, 10, valet, dame, roi, as.', 'В колоде четыре масти (пики, червы, бубны, трефы), в каждой — восемь карт: 7, 8, 9, 10, валет, дама, король, туз.']
        : ['Ce jeu comporte quatre couleurs (pique, cœur, carreau, trèfle) et, dans chaque couleur, treize cartes : de 2 à 10, valet, dame, roi, as.', 'В колоде четыре масти (пики, червы, бубны, трефы), в каждой — тринадцать карт: от 2 до 10, валет, дама, король, туз.'];
      const E = r.pick([
        ['un roi', 'короля', 4, 'Королей по одному в каждой из 4 мастей — 4 карты.'],
        ['un cœur', 'карту масти червы', per, 'В каждой масти ' + per + ' карт, значит, червей ' + per + '.'],
        ['une carte rouge', 'красную карту', 2 * per, 'Красные масти — червы и бубны: 2 × ' + per + ' = ' + 2 * per + ' карт.'],
        ['une figure (valet, dame ou roi)', 'фигуру (валета, даму или короля)', 12, 'В каждой масти 3 фигуры: 4 × 3 = 12 карт.'],
        ['un as noir', 'чёрного туза', 2, 'Чёрные масти — пики и трефы, в каждой один туз: 2 карты.'],
        ['la dame de pique', 'даму пик', 1, 'Дама пик в колоде одна.'],
        ['un trèfle ou un as', 'трефу или туза', per + 3, 'Треф ' + per + ', тузов 4, но туз треф попал в оба списка — считаем его один раз: ' + per + ' + 4 − 1 = ' + (per + 3) + '.']]);
      return { q: staL(`On tire au hasard une carte dans un jeu de ${n} cartes bien mélangé. ${desc[0]} Les cœurs et les carreaux sont rouges, les piques et les trèfles sont noirs. Quelle est la probabilité de tirer ${E[0]} ? ${irr[0]}`,
        `Из хорошо перемешанной колоды в ${n} карты наугад берут одну карту. ${desc[1]} Червы и бубны — красные, пики и трефы — чёрные. Какова вероятность вытянуть ${E[1]}? ${irr[1]}`),
        ans: FRA(F(E[2], n)), sol: ['Любая из ' + n + ' карт может быть вытянута с одинаковой вероятностью: ' + n + ' равновозможных ' + staPl(n, 'исход', 'исхода', 'исходов') + '.', E[3], ['', 'P=' + staFq(E[2], n)]] };
    }
    if (vi === 3) {   /* a box of sweets */
      const C = r.pick(['beignets', 'bonbons', 'jetons']);
      const fl = C === 'beignets' ? [['à l\'abricot', 'с абрикосом', 'с абрикосом'], ['à la pomme', 'с яблоком', 'с яблоком'], ['à la framboise', 'с малиной', 'с малиной'], ['au chocolat', 'с шоколадом', 'с шоколадом']]
        : C === 'bonbons' ? [['à la fraise', 'клубничных', 'клубничную'], ['à la menthe', 'мятных', 'мятную'], ['au citron', 'лимонных', 'лимонную'], ['à l\'orange', 'апельсиновых', 'апельсиновую']]
          : [['rouges', 'красных', 'красный'], ['verts', 'зелёных', 'зелёный'], ['jaunes', 'жёлтых', 'жёлтый'], ['bleus', 'синих', 'синий']];
      const k = r.pick([2, 3, 3]), n = []; for (let i = 0; i < k; i++) n.push(r.ri(2, 12));
      const T = staSum(n), j = r.ri(0, k - 1), lst = n.map((x, i) => x + ' ' + fl[i][0]), lstR = n.map((x, i) => fl[i][1] + ' — ' + x);
      const Q = C === 'beignets' ? [`Une boîte opaque contient des beignets tous identiques d'aspect : ${staEt(lst.map(x => x.replace(/^(\d+)/, '$1 beignets')))}. On pioche un beignet au hasard. Quelle est la probabilité qu'il soit ${fl[j][0]} ? ${irr[0]}`,
        `В непрозрачной коробке пончики, на вид одинаковые; начинка: ${lstR.join(', ')}. Наугад достают один пончик. Какова вероятность, что он ${fl[j][1]}? ${irr[1]}`]
        : C === 'bonbons' ? [`Un sachet contient ${staEt(lst.map(x => x.replace(/^(\d+)/, '$1 bonbons')))}. On prend un bonbon au hasard dans le sachet. Quelle est la probabilité de prendre un bonbon ${fl[j][0]} ? ${irr[0]}`,
          `В пакете конфеты: ${lstR.join(', ')}. Наугад берут одну конфету. Какова вероятность взять ${fl[j][2]} конфету? ${irr[1]}`]
          : [`Une urne contient ${staEt(lst.map(x => x.replace(/^(\d+)/, '$1 jetons')))}, indiscernables au toucher. On tire un jeton au hasard. Quelle est la probabilité de tirer un jeton ${fl[j][0].replace(/s$/, '')} ? ${irr[0]}`,
            `В урне жетоны, на ощупь не различимые: ${lstR.join(', ')}. Наугад вынимают один жетон. Какова вероятность вынуть ${fl[j][2]} жетон? ${irr[1]}`];
      return { q: staL(Q[0], Q[1]), ans: FRA(F(n[j], T)), sol: [
        'Все предметы одинаковы на вид и на ощупь, выбор наугад — исходы равновозможны.',
        ['Всего:', n.join('+') + '=' + T],
        ['Благоприятных исходов ' + n[j] + ', поэтому:', 'P=' + staFq(n[j], T)]] };
    }
    /* lottery wheel */
    const nS = r.pick([8, 10, 12]); let cnt = [];
    do { cnt = staSplit(r, nS, 4, 1); } while (cnt[3] > 3);
    const val = ['0', '10', '20', '50'], labs = r.sh(cnt.flatMap((c, i) => new Array(c).fill(val[i])));
    const E = r.pick([
      ['de gagner 50 points', 'выиграть 50 очков', x => x === '50'],
      ['de gagner 20 points', 'выиграть 20 очков', x => x === '20'],
      ['de ne rien gagner (0 point)', 'ничего не выиграть (0 очков)', x => x === '0'],
      ['de gagner au moins 20 points', 'выиграть не меньше 20 очков', x => +x >= 20],
      ['de gagner au plus 10 points', 'выиграть не больше 10 очков', x => +x <= 10]]);
    const ok = labs.filter(E[2]).length;
    return { q: staL(`Une roue de loterie est partagée en ${nS} secteurs de même taille (voir la figure). On fait tourner la roue ; quand elle s'arrête, la flèche indique un secteur au hasard. Quelle est la probabilité ${E[0]} ? ${irr[0]}`,
      `Колесо лотереи разделено на ${nS} одинаковых секторов (см. рисунок). Колесо раскручивают; когда оно останавливается, стрелка указывает на случайный сектор. Какова вероятность ${E[1]}? ${irr[1]}`),
      fig: staWheel(labs), ans: FRA(F(ok, nS)), sol: [
        'Секторы одинакового размера, поэтому все ' + nS + ' исходов равновозможны.',
        'Считаем подходящие секторы на рисунке: их ' + ok + '.',
        ['', 'P=' + staFq(ok, nS)]] };
  } });

topic({ id: 'st.proba-contraire', ch: 'st', lvl: 2, calc: false, variants: 4,
  ru: 'Противоположное событие, сумма вероятностей', fr: 'Événement contraire',
  hints: [
    'Противоположное событие («événement contraire») к $A$ происходит ровно тогда, когда $A$ не происходит. Вместе $A$ и «не $A$» покрывают все исходы и не пересекаются.',
    'Поэтому их вероятности в сумме дают 1: ' + STA_NONA + '.',
    'Сумма вероятностей всех исходов опыта тоже равна 1 — так находят недостающую вероятность в таблице.'],
  gen(r, vi) {
    const w = staWho(r), V = r.pick(STA_VILLES);
    if (vi === 0) {   /* P(not A) = 1 − P(A) */
      const dec = r() < 0.6, fr0 = r.pick([[1, 4], [3, 8], [2, 5], [5, 12], [7, 10], [3, 7], [4, 9], [2, 3]]), pd = r.ri(5, 95) / 100;
      const pt = dec ? nf(pd) : staFt(fr0[0], fr0[1]);
      const C = r.pick([
        [`La probabilité qu'il pleuve demain à ${V[0]} est ${pt}. Quelle est la probabilité qu'il ne pleuve pas demain ?`, `Вероятность того, что завтра в ${V[1]} пойдёт дождь, равна ${pt}. Какова вероятность, что дождя завтра не будет?`, 'пойдёт дождь', 'дождя не будет'],
        [`La probabilité que le bus ${staDe(w.n)} soit en retard un jour donné est ${pt}. Quelle est la probabilité qu'il ne soit pas en retard ?`, `Вероятность того, что автобус ${w.n} в какой-то день опоздает, равна ${pt}. Какова вероятность, что он не опоздает?`, 'автобус опоздает', 'автобус не опоздает'],
        [`À une tombola, la probabilité qu'un ticket soit gagnant est ${pt}. Quelle est la probabilité qu'un ticket ne soit pas gagnant ?`, `В лотерее вероятность того, что билет выигрышный, равна ${pt}. Какова вероятность, что билет не выигрышный?`, 'билет выигрышный', 'билет не выигрышный'],
        [`La probabilité que l'équipe ${staDe(w.n)} gagne son prochain match est ${pt}. Quelle est la probabilité qu'elle ne le gagne pas ?`, `Вероятность того, что команда ${w.n} выиграет следующий матч, равна ${pt}. Какова вероятность, что она его не выиграет?`, 'команда выиграет', 'команда не выиграет']]);
      const ans = dec ? N(fx(1 - pd)) : FRA(F(fr0[1] - fr0[0], fr0[1]));
      return { q: staL(C[0], C[1]), ans, sol: [
        'События «' + C[2] + '» и «' + C[3] + '» противоположны: ровно одно из них обязательно произойдёт.',
        'Поэтому сумма их вероятностей равна 1: ' + STA_NONA + '.',
        ['', dec ? '1-' + fx(pd) + '=' + fx(1 - pd) : '1-' + fr0[0] + '/' + fr0[1] + '=' + fr0[1] + '/' + fr0[1] + '-' + fr0[0] + '/' + fr0[1] + '=' + Fr.str(F(fr0[1] - fr0[0], fr0[1]))]] };
    }
    if (vi === 1) {   /* the third colour */
      const P = [[1, 4], [1, 3], [1, 6], [1, 5], [2, 5], [1, 2], [1, 8], [3, 8], [1, 10], [3, 10], [1, 12], [5, 12], [2, 3]];
      let a = F(1, 4), b = F(1, 3), c = F(5, 12);
      for (let g = 0; g < 200; g++) {
        const x = r.pick(P), y = r.pick(P), fa = F(x[0], x[1]), fb = F(y[0], y[1]), fc = Fr.sub(Fr.sub(F(1), fa), fb);
        if (x[1] !== y[1] && fc.n > 0 && lcm2(x[1], y[1]) <= 24) { a = fa; b = fb; c = fc; break; }
      }
      const D = lcm2(a.d, b.d);
      return { q: staL(`Un sac contient des boules rouges, bleues et vertes. On tire une boule au hasard. La probabilité de tirer une boule rouge est $${Fr.str(a)}$ et celle de tirer une boule bleue est $${Fr.str(b)}$. Quelle est la probabilité de tirer une boule verte ? Donner le résultat sous forme de fraction irréductible.`,
        `В мешке красные, синие и зелёные шары. Наугад вынимают один шар. Вероятность вынуть красный — $${Fr.str(a)}$, синий — $${Fr.str(b)}$. Какова вероятность вынуть зелёный? Запиши ответ несократимой дробью.`),
        ans: FRA(c), sol: [
          'Шар обязательно окажется одного из трёх цветов, а двух цветов сразу не бывает. Поэтому сумма вероятностей трёх цветов равна 1.',
          ['Вероятность зелёного:', '1-' + Fr.str(a) + '-' + Fr.str(b)],
          ['Приводим к общему знаменателю ' + D + ':', D + '/' + D + '-' + (a.n * D / a.d) + '/' + D + '-' + (b.n * D / b.d) + '/' + D + '=' + staFq(c.n * D / c.d, D)]] };
    }
    if (vi === 2) {   /* loaded die */
      let p = [];
      do { p = [0, 0, 0, 0, 0].map(() => r.ri(1, 6) * 5); } while (staSum(p) >= 95 || staSum(p) < 55);
      const k = r.ri(0, 5), probs = p.slice(); probs.splice(k, 0, 100 - staSum(p));
      if (r() < 0.6) {
        const row = probs.map((x, i) => (i === k ? '?' : nf(x / 100)));
        return { q: staL(`Un dé à six faces est truqué : ses faces ne sont pas équiprobables. Le tableau ci-dessous donne la probabilité d'obtenir chaque face. Quelle est la probabilité d'obtenir ${k + 1} ?`,
          `Игральная кость подделана: грани выпадают с разной вероятностью. В таблице — вероятность каждой грани. Какова вероятность выпадения ${k + 1}?`),
          fig: staTab([['Face', '1', '2', '3', '4', '5', '6'], ['Probabilité'].concat(row)]), ans: N(fx(probs[k] / 100)), sol: [
            'При одном броске обязательно выпадает ровно одна из шести граней, поэтому сумма вероятностей всех шести граней равна 1.',
            ['Сумма известных вероятностей:', p.map(x => fx(x / 100)).join('+') + '=' + fx(staSum(p) / 100)],
            ['Недостающая вероятность:', '1-' + fx(staSum(p) / 100) + '=' + fx(probs[k] / 100)]] };
      }
      return { q: staL(`Un dé à six faces est truqué. Le tableau ci-dessous donne la probabilité d'obtenir chaque face. Quelle est la probabilité de ne pas obtenir ${k + 1} ?`,
        `Игральная кость подделана. В таблице — вероятность каждой грани. Какова вероятность, что не выпадет ${k + 1}?`),
        fig: staTab([['Face', '1', '2', '3', '4', '5', '6'], ['Probabilité'].concat(probs.map(x => nf(x / 100)))]), ans: N(fx(1 - probs[k] / 100)), sol: [
          '«Не выпадет ' + (k + 1) + '» — событие, противоположное событию «выпадет ' + (k + 1) + '».',
          ['Поэтому:', '1-' + fx(probs[k] / 100) + '=' + fx(1 - probs[k] / 100)],
          'Можно и сложить вероятности остальных пяти граней — получится то же самое, но дольше.'] };
    }
    /* QCM: the contrary of an event */
    const D = r.pick([
      { c: ['On lance un dé équilibré à six faces numérotées de 1 à 6.', 'Бросают честную игральную кость с гранями от 1 до 6.'], e: ['obtenir un nombre pair', 'выпадет чётное число'], A: '2, 4, 6', nA: '1, 3, 5',
        ok: ['obtenir un nombre impair', 'выпадет нечётное число'], no: [['obtenir un nombre premier', 'выпадет простое число', 'простые числа 2, 3, 5: число 2 входит и в A'], ['obtenir 1', 'выпадет 1', 'не хватает исходов 3 и 5'], ['obtenir 2, 4 ou 6', 'выпадет 2, 4 или 6', 'это само событие A']] },
      { c: ['On lance un dé équilibré à six faces numérotées de 1 à 6.', 'Бросают честную игральную кость с гранями от 1 до 6.'], e: ['obtenir au moins 5', 'выпадет не меньше 5'], A: '5, 6', nA: '1, 2, 3, 4',
        ok: ['obtenir au plus 4', 'выпадет не больше 4'], no: [['obtenir au plus 5', 'выпадет не больше 5', 'исход 5 входит и в A'], ['obtenir moins de 4', 'выпадет меньше 4', 'не хватает исхода 4'], ['obtenir 6', 'выпадет 6', '6 входит в A']] },
      { c: ['On lance un dé équilibré à six faces numérotées de 1 à 6.', 'Бросают честную игральную кость с гранями от 1 до 6.'], e: ['obtenir un nombre supérieur ou égal à 3', 'выпадет число, не меньшее 3'], A: '3, 4, 5, 6', nA: '1, 2',
        ok: ['obtenir 1 ou 2', 'выпадет 1 или 2'], no: [['obtenir 1, 2 ou 3', 'выпадет 1, 2 или 3', 'исход 3 входит и в A'], ['obtenir 3', 'выпадет 3', '3 входит в A'], ['obtenir 1', 'выпадет 1', 'не хватает исхода 2']] },
      { c: ['On lance deux fois de suite une pièce de monnaie.', 'Монету подбрасывают два раза подряд.'], e: ['obtenir au moins une fois « pile »', 'хотя бы раз выпадет «pile»'], A: '(pile ; pile), (pile ; face), (face ; pile)', nA: '(face ; face)',
        ok: ['obtenir deux fois « face »', 'оба раза выпадет «face»'], no: [['obtenir au moins une fois « face »', 'хотя бы раз выпадет «face»', 'исходы (pile ; face) и (face ; pile) входят и в A'], ['obtenir exactement une fois « pile »', 'ровно один раз выпадет «pile»', 'это часть самого события A'], ['obtenir deux fois « pile »', 'оба раза выпадет «pile»', 'этот исход входит в A']] },
      { c: ['On tire une boule au hasard dans un sac qui contient des boules rouges, bleues et vertes.', 'Из мешка с красными, синими и зелёными шарами наугад вынимают шар.'], e: ['tirer une boule rouge', 'вынут красный шар'], A: 'красный', nA: 'синий или зелёный',
        ok: ['tirer une boule bleue ou verte', 'вынут синий или зелёный шар'], no: [['tirer une boule bleue', 'вынут синий шар', 'забыт зелёный цвет'], ['tirer une boule verte', 'вынут зелёный шар', 'забыт синий цвет'], ['tirer une boule rouge ou bleue', 'вынут красный или синий шар', 'красный входит и в A']] }]);
    return { q: staL(`${D.c[0]} On considère l'événement A : « ${D.e[0]} ». Quel est l'événement contraire de A ?`, `${D.c[1]} Рассмотрим событие A: «${D.e[1]}». Какое событие противоположно A?`),
      ans: MQ(r, [staL(D.ok[0].charAt(0).toUpperCase() + D.ok[0].slice(1), D.ok[1])].concat(D.no.map(x => staL(x[0].charAt(0).toUpperCase() + x[0].slice(1), x[1]))), 0), sol: [
        'Противоположное событие состоит ровно из тех исходов, которые не входят в A.',
        'Исходы A: ' + D.A + '. Все остальные исходы: ' + D.nA + ' — это и есть «' + D.ok[1] + '».',
        'Остальные варианты не подходят: ' + D.no.map(x => '«' + x[1] + '» — ' + x[2]).join('; ') + '.'] };
  } });

topic({ id: 'st.proba-2epreuves', ch: 'st', lvl: 2, calc: true, variants: 5,
  ru: 'Опыт из двух испытаний: дерево и таблица', fr: 'Expérience à deux épreuves',
  hints: [
    'Опыт из двух испытаний удобно изобразить деревом («arbre») или таблицей с двумя входами: каждый путь (клетка) — один исход вида (первый результат ; второй результат).',
    'С возвращением («avec remise») состав мешка не меняется, вероятности во втором испытании те же. Без возвращения («sans remise») во втором испытании на один шар меньше.',
    'Вероятность пути по дереву = произведение вероятностей на его ветках. Если событию подходят несколько путей — их вероятности складываются.'],
  gen(r, vi) {
    const irr = ['Donner le résultat sous forme de fraction irréductible.', 'Запиши ответ несократимой дробью.'];
    if (vi === 0) {   /* two dice: table of the sums */
      const f = r.pick([6, 6, 4]), w = staWho(r);
      const sums = []; for (let i = 1; i <= f; i++) for (let j = 1; j <= f; j++) sums.push([i, j, i + j]);
      const t = r.pick(['eq', 'eq', 'double', 'ge']), k = t === 'ge' ? r.ri(f + 2, 2 * f - 1) : r.ri(3, 2 * f - 1);
      const ok = sums.filter(x => (t === 'eq' ? x[2] === k : t === 'double' ? x[0] === x[1] : x[2] >= k));
      const E = t === 'eq' ? [`une somme égale à ${k}`, `сумму, равную ${k}`] : t === 'double' ? ['un double (deux fois le même nombre)', 'дубль (два одинаковых числа)'] : [`une somme supérieure ou égale à ${k}`, `сумму не меньше ${k}`];
      const tb = [['+'].concat(sums.slice(0, f).map(x => String(x[1])))];
      for (let i = 1; i <= f; i++) tb.push([String(i)].concat(sums.filter(x => x[0] === i).map(x => (ok.includes(x) ? '<b>' + x[2] + '</b>' : String(x[2])))));
      const Q = f === 6 ? [`On lance deux dés équilibrés à six faces, numérotées de 1 à 6, et on additionne les deux nombres obtenus. Quelle est la probabilité d'obtenir ${E[0]} ? ${irr[0]}`, `Бросают две честные игральные кости с гранями от 1 до 6 и складывают выпавшие числа. Какова вероятность получить ${E[1]}? ${irr[1]}`]
        : [`${w.n} lance deux fois de suite un dé équilibré à quatre faces numérotées de 1 à 4 et additionne les deux nombres obtenus. Quelle est la probabilité d'obtenir ${E[0]} ? ${irr[0]}`, `${w.n} два раза подряд бросает честную кость с четырьмя гранями (от 1 до 4) и складывает выпавшие числа. Какова вероятность получить ${E[1]}? ${irr[1]}`];
      return { q: staL(Q[0], Q[1]), ans: FRA(F(ok.length, f * f)), sol: [
        'Исход — пара (первое число ; второе число). Пар ' + f + ' × ' + f + ' = ' + f * f + ', и все они равновозможны.',
        { t: 'Таблица сумм (строка — первая кость, столбец — вторая), подходящие клетки выделены:', svg: tbl(tb, 'side') },
        'Подходят исходы: ' + ok.map(x => '(' + x[0] + ' ; ' + x[1] + ')').join(', ') + ' — их ' + ok.length + '.',
        ['', 'P=' + staFq(ok.length, f * f)],
        'Ловушка — считать равновозможными сами суммы. Сумма 2 получается одним способом (1 ; 1), а сумма ' + (f + 1) + ' — ' + f + ' способами, поэтому считаем пары, а не суммы.'] };
    }
    if (vi <= 2) {   /* two draws, with or without replacement */
      const rem = vi === 1, a = r.ri(2, 6), b = r.ri(2, 6), T = a + b, t = r.pick(['RR', 'NN', 'same', 'diff']);
      const p2 = rem ? [[a, T], [b, T], [a, T], [b, T]] : [[a - 1, T - 1], [b, T - 1], [a, T - 1], [b - 1, T - 1]];
      const path = { RR: [[a * p2[0][0], T * p2[0][1]]], NN: [[b * p2[3][0], T * p2[3][1]]], same: [[a * p2[0][0], T * p2[0][1]], [b * p2[3][0], T * p2[3][1]]], diff: [[a * p2[1][0], T * p2[1][1]], [b * p2[2][0], T * p2[2][1]]] }[t];
      const den = path[0][1], num = staSum(path.map(x => x[0]));
      const E = { RR: ['deux boules rouges', 'два красных шара'], NN: ['deux boules noires', 'два чёрных шара'], same: ['deux boules de la même couleur', 'два шара одного цвета'], diff: ['deux boules de couleurs différentes', 'два шара разных цветов'] }[t];
      const tree = staTree([['R', a + '/' + T], ['N', b + '/' + T]], [[['R', p2[0].join('/')], ['N', p2[1].join('/')]], [['R', p2[2].join('/')], ['N', p2[3].join('/')]]]);
      const names = { RR: '(R ; R)', NN: '(N ; N)', same: '(R ; R) и (N ; N)', diff: '(R ; N) и (N ; R)' }[t];
      const pf = { RR: [[a + '/' + T, p2[0].join('/')]], NN: [[b + '/' + T, p2[3].join('/')]], same: [[a + '/' + T, p2[0].join('/')], [b + '/' + T, p2[3].join('/')]], diff: [[a + '/' + T, p2[1].join('/')], [b + '/' + T, p2[2].join('/')]] }[t];
      const st = [
        rem ? 'Шар возвращают в мешок, поэтому во втором испытании состав мешка тот же: вероятности на втором уровне дерева такие же, как на первом.'
          : 'Первый шар не возвращают: во втором испытании в мешке ' + (T - 1) + ' ' + staPl(T - 1, 'шар', 'шара', 'шаров') + ', и шаров того цвета, что вынули первым, на один меньше.',
        { t: 'Дерево опыта (R — красный, N — чёрный):', svg: tree },
        (path.length > 1 ? 'Событию подходят два пути: ' : 'Событию подходит путь ') + names + '. Вероятность пути — произведение вероятностей на его ветках' + (path.length > 1 ? ', а вероятности путей складываем:' : ':'),
        ['', pf.map(x => x[0] + '*' + x[1]).join('+') + '=' + path.map(x => x[0] + '/' + den).join('+') + (path.length > 1 ? '=' + num + '/' + den : '') + (F(num, den).d !== den ? '=' + Fr.str(F(num, den)) : '')]];
      return { q: staL(`Un sac contient ${a} boules rouges et ${b} boules noires, indiscernables au toucher. On tire une boule au hasard et on note sa couleur${rem ? ', puis on la remet dans le sac' : ' ; on ne la remet pas dans le sac'}. On tire ensuite une deuxième boule. Quelle est la probabilité d'obtenir ${E[0]} ? ${irr[0]}`,
        `В мешке шары, на ощупь не различимые: красных — ${a}, чёрных — ${b}. Наугад вынимают шар и смотрят на цвет${rem ? ', потом кладут его обратно' : '; обратно его не кладут'}. Затем вынимают второй шар. Какова вероятность получить ${E[1]}? ${irr[1]}`),
        ans: FRA(F(num, den)), sol: st };
    }
    if (vi === 3) {   /* reading a tree with decimals */
      const pA = r.pick([2, 3, 4, 6, 7, 8]), g1 = r.ri(1, 9), g2 = r.ri(1, 9), t = r.pick(['path', 'path', 'G']);
      const tree = staTree([['A', nf(pA / 10)], ['B', nf(1 - pA / 10)]], [[['G', nf(g1 / 10)], ['P', nf(1 - g1 / 10)]], [['G', nf(g2 / 10)], ['P', nf(1 - g2 / 10)]]]);
      if (t === 'path') {
        const second = r() < 0.5, num = second ? (10 - pA) * (10 - g2) : pA * g1;
        const lab = second ? '(B ; P)' : '(A ; G)';
        return { q: staL(`L'arbre ci-dessous décrit une expérience aléatoire à deux épreuves. Quelle est la probabilité de l'issue ${lab} ?`, `Дерево ниже описывает случайный опыт из двух испытаний. Какова вероятность исхода ${lab}?`),
          fig: tree, ans: N(fx(num / 100)), sol: [
            'Исход ' + lab + ' — это один путь по дереву: сначала ' + lab[1] + ', потом ' + lab[5] + '.',
            ['Вероятность пути — произведение вероятностей на его ветках:', second ? fx(1 - pA / 10) + '*' + fx(1 - g2 / 10) + '=' + fx(num / 100) : fx(pA / 10) + '*' + fx(g1 / 10) + '=' + fx(num / 100)],
            'Почему умножаем: событие ' + lab[1] + ' происходит в ' + nf(second ? 10 - pA : pA) + ' десятых случаев, а из них ещё в ' + nf(second ? 10 - g2 : g1) + ' десятых случаев — ' + lab[5] + '.'] };
      }
      const n1 = pA * g1, n2 = (10 - pA) * g2;
      return { q: staL(`L'arbre ci-dessous décrit une expérience aléatoire à deux épreuves. Quelle est la probabilité d'obtenir G à la deuxième épreuve ?`, `Дерево ниже описывает случайный опыт из двух испытаний. Какова вероятность получить G во втором испытании?`),
        fig: tree, ans: N(fx((n1 + n2) / 100)), sol: [
          'К G во втором испытании ведут два пути: (A ; G) и (B ; G).',
          ['Путь (A ; G):', fx(pA / 10) + '*' + fx(g1 / 10) + '=' + fx(n1 / 100)],
          ['Путь (B ; G):', fx(1 - pA / 10) + '*' + fx(g2 / 10) + '=' + fx(n2 / 100)],
          ['Пути не пересекаются, поэтому их вероятности складываем:', fx(n1 / 100) + '+' + fx(n2 / 100) + '=' + fx((n1 + n2) / 100)]] };
    }
    /* «at least one» through the contrary event */
    if (r() < 0.6) {
      const f = r.pick([4, 6, 6, 8, 10]), k = r.ri(1, f), q = (f - 1) * (f - 1), tot = f * f;
      return { q: staL(`On lance deux fois de suite un dé équilibré à ${f} faces numérotées de 1 à ${f}. Quelle est la probabilité d'obtenir au moins une fois le ${k} ? ${irr[0]}`,
        `Два раза подряд бросают честную кость с ${f} гранями (от 1 до ${f}). Какова вероятность, что ${k} выпадет хотя бы один раз? ${irr[1]}`),
        ans: FRA(F(tot - q, tot)), sol: [
          'Удобнее через противоположное событие: «хотя бы один раз ' + k + '» противоположно событию «ни разу не ' + k + '».',
          ['«Ни разу» — в каждом броске выпало не ' + k + ' (вероятность ' + (f - 1) + '/' + f + '), путь по дереву:', (f - 1) + '/' + f + '*' + (f - 1) + '/' + f + '=' + q + '/' + tot],
          ['Значит:', '1-' + q + '/' + tot + '=' + staFq(tot - q, tot)],
          'Ловушка — сложить $1/' + f + '+1/' + f + '$: так исход (' + k + ' ; ' + k + ') посчитан дважды.'] };
    }
    const a = r.ri(1, 5), b = r.ri(2, 7), T = a + b, q = b * b, tot = T * T;
    return { q: staL(`Un sac contient ${a} boule${a > 1 ? 's' : ''} rouge${a > 1 ? 's' : ''} et ${b} boules blanches. On tire une boule, on note sa couleur et on la remet dans le sac, puis on tire une deuxième boule. Quelle est la probabilité d'obtenir au moins une boule rouge ? ${irr[0]}`,
      `В мешке шары: красных — ${a}, белых — ${b}. Вынимают шар, смотрят цвет и кладут обратно, затем вынимают второй шар. Какова вероятность, что хотя бы один шар будет красным? ${irr[1]}`),
      ans: FRA(F(tot - q, tot)), sol: [
        'Противоположное событие к «хотя бы один красный» — «оба шара белые».',
        ['Оба белые (шар возвращают, вероятности не меняются):', b + '/' + T + '*' + b + '/' + T + '=' + q + '/' + tot],
        ['Значит:', '1-' + q + '/' + tot + '=' + staFq(tot - q, tot)]] };
  } });

topic({ id: 'st.proba-frequence', ch: 'st', lvl: 2, calc: false, variants: 4,
  ru: 'Частота и вероятность', fr: 'Fréquence et probabilité',
  hints: [
    'Частота («fréquence») — то, что получилось в опыте: число появлений ÷ число испытаний. Вероятность — то, чего ожидаем теоретически.',
    'Чем больше испытаний, тем ближе частота обычно подходит к вероятности (закон больших чисел). Но при малом числе испытаний частота может заметно отличаться, а точного совпадения никто не обещает.',
    'У монеты и кости нет памяти: прошлые результаты не меняют вероятность следующего броска.'],
  gen(r, vi) {
    const w = staWho(r);
    if (vi === 0) {   /* a frequency, as a decimal */
      const C = r.pick(['punaise', 'basket', 'de']);
      const n = C === 'basket' ? r.pick([20, 25, 40, 50]) : r.pick([50, 200, 250, 400, 500]), k = C === 'de' ? Math.round(n * r.ri(12, 21) / 100) : r.ri(Math.round(n * 0.15), Math.round(n * 0.8));   /* a fair die: about 1/6 */
      const Q = {
        punaise: [`${w.n} lance ${n} fois une punaise. Elle retombe ${k} fois « pointe en haut ». Quelle est la fréquence de l'issue « pointe en haut » ? Donner le résultat sous forme décimale.`, `${w.n} подбрасывает канцелярскую кнопку ${n} раз; ${staNum(k, 'раз', 'раза', 'раз')} она падает остриём вверх. Какова частота исхода «остриём вверх»? Запиши ответ десятичной дробью.`],
        basket: [`Lors d'un entraînement de basket, ${w.n} a tenté ${n} lancers francs et en a réussi ${k}. Quelle est la fréquence de réussite ? Donner le résultat sous forme décimale.`, `На тренировке по баскетболу ${w.n} ${staG(w, 'сделал', 'сделала')} ${n} штрафных бросков и ${k} из них ${staG(w, 'забросил', 'забросила')}. Какова частота попаданий? Запиши ответ десятичной дробью.`],
        de: [`On a lancé ${n} fois un dé et obtenu ${k} fois le 6. Quelle est la fréquence d'apparition du 6 ? Donner le résultat sous forme décimale.`, `Игральную кость бросили ${n} раз, шестёрка выпала ${staNum(k, 'раз', 'раза', 'раз')}. Какова частота выпадения шестёрки? Запиши ответ десятичной дробью.`]
      }[C];
      return { q: staL(Q[0], Q[1]), ans: N(fx(k / n), { dec: true }), sol: [
        ['Частота = число появлений ÷ число испытаний:', k + '/' + n + '=' + fx(k / n)],
        'В процентах это ' + nf(100 * k / n) + ' %.'] };
    }
    if (vi === 1) {   /* law of large numbers, QCM */
      const C = r.pick(['piece', 'de', 'sac']), a = r.ri(2, 7); let b = r.ri(3, 9); if (b === a || b === 2 * a) b = b === 9 ? 3 : b + 1;   /* a/(a+b) ≠ 1/2 and a/b ≠ 1/2 */
      const D = {
        piece: [['On lance une pièce équilibrée.', 'Подбрасывают честную монету.'], ['de « pile »', '«pile»'], '1/2', [['$1/2$', 'devient exactement égale à', 'станет в точности равна', 'частота «гуляет» около вероятности; например, при нечётном числе бросков она вообще не может быть ровно $1/2$'], ['1', 'se rapproche de', 'приближается к', '1 значило бы, что «pile» выпадает почти всегда'], ['$1/2$', 'reste toujours égale à', 'всё время остаётся равной', 'после первого броска частота равна 0 или 1, а не $1/2$']]],
        de: [['On lance un dé équilibré à six faces.', 'Бросают честную игральную кость.'], ['du 6', 'шестёрки'], '1/6', [['$1/6$', 'devient exactement égale à', 'станет в точности равна', 'частота «гуляет» около вероятности и не обязана совпасть с ней точно'], ['$1/2$', 'se rapproche de', 'приближается к', 'у шестёрки один шанс из шести, а не один из двух'], ['$1/6$', 'reste toujours égale à', 'всё время остаётся равной', 'после первого броска частота равна 0 или 1']]],
        sac: [[`Un sac contient ${a} boules rouges et ${b} boules vertes. On tire une boule au hasard, on note sa couleur et on la remet dans le sac.`, `В мешке ${a} красных и ${b} зелёных шаров (красных — ${a}, зелёных — ${b}). Вынимают шар, смотрят цвет и кладут обратно.`], ['des boules rouges', 'красных шаров'], a + '/' + (a + b), [['$' + a + '/' + (a + b) + '$', 'devient exactement égale à', 'станет в точности равна', 'частота «гуляет» около вероятности и не обязана совпасть с ней точно'], ['$1/2$', 'se rapproche de', 'приближается к', 'цветов два, но шаров разных цветов разное количество'], ['$' + a + '/' + b + '$', 'se rapproche de', 'приближается к', 'это отношение красных к зелёным, а вероятность — красные ÷ все шары']]]
      }[C];
      if (C === 'sac') D[0][1] = `В мешке шары: красных — ${a}, зелёных — ${b}. Вынимают шар, смотрят цвет и кладут обратно.`;
      const right = staL(`La fréquence se rapproche de $${D[2]}$.`, `Частота приближается к $${D[2]}$.`);
      const wrongs = D[3].map(x => staL(`La fréquence ${x[1]} ${x[0]}.`, `Частота ${x[2]} ${x[0]}.`));
      return { q: staL(`${D[0][0]} On répète cette expérience un très grand nombre de fois. Que peut-on dire de la fréquence d'apparition ${D[1][0]} ?`, `${D[0][1]} Опыт повторяют очень много раз. Что можно сказать о частоте ${D[1][1]}?`),
        ans: MQ(r, [right].concat(wrongs), 0), sol: [
          'Вероятность здесь равна $' + D[2] + '$. Закон больших чисел: при очень большом числе испытаний частота становится близкой к вероятности.',
          '«Близкой» не значит «равной»: частота колеблется около вероятности.',
          'Неверные варианты: ' + D[3].map(x => '«' + x[2] + ' ' + x[0] + '» — ' + x[3]).join('; ') + '.'] };
    }
    if (vi === 2) {   /* estimating the composition of a bag */
      const T = r.pick([10, 20, 25, 40, 50]), R = r.ri(Math.ceil(T * 0.15), Math.floor(T * 0.7)), n = r.pick([500, 1000, 2000]);
      let k = Math.round(n * R / T + (r() - 0.5) * n / T * 0.6);
      if (Math.round(k / n * T) !== R) k = Math.round(n * R / T);
      return { q: staL(`Un sac contient ${T} boules, rouges ou blanches. On effectue ${nf(n)} tirages d'une boule, en remettant à chaque fois la boule dans le sac. On obtient ${k} fois une boule rouge. Combien de boules rouges le sac contient-il probablement ?`,
        `В мешке ${T} шаров, красных и белых. Шар вынимают ${nf(n)} раз, каждый раз возвращая его обратно. Красный выпал ${staNum(k, 'раз', 'раза', 'раз')}. Сколько красных шаров, вероятно, в мешке?`),
        ans: N(R), sol: [
          ['Частота красного:', k + '/' + n + '=' + fx(k / n)],
          'Испытаний много, поэтому частота близка к вероятности. А вероятность вынуть красный = число красных ÷ ' + T + '.',
          ['Значит, красных примерно', fx(k / n) + '*' + T + '=' + fx(k / n * T)],
          'Число шаров целое — ближайшее целое: ' + R + '. Это оценка, а не точный ответ: частота лишь близка к вероятности.'] };
    }
    /* the coin has no memory */
    const m = r.ri(4, 8);
    if (r() < 0.5) {
      return { q: staL(`${w.n} a lancé ${m} fois de suite une pièce équilibrée et a obtenu « face » à chaque fois. Quelle est la probabilité d'obtenir « pile » au lancer suivant ?`, `${w.n} ${staG(w, 'подбросил', 'подбросила')} честную монету ${staNum(m, 'раз', 'раза', 'раз')} подряд, и каждый раз выпадал «face». Какова вероятность, что при следующем броске выпадет «pile»?`),
        ans: MQ(r, [staL('$1/2$', '$1/2$'), staL('Plus de $1/2$, car « pile » doit bientôt sortir.', 'Больше $1/2$: «pile» должен вот-вот выпасть.'), staL('Moins de $1/2$, car la pièce semble favoriser « face ».', 'Меньше $1/2$: монета, похоже, «любит» «face».'), staL('On ne peut pas la calculer.', 'Её нельзя вычислить.')], 0), sol: [
          'Монета не помнит прошлых бросков: каждый бросок проходит в тех же условиях, и у честной монеты две равновозможные стороны. Вероятность «pile» — $1/2$, как и раньше.',
          'Серия из ' + m + ' одинаковых результатов — просто случайность. Закон больших чисел говорит о частоте на очень большом числе бросков, а не о том, что результаты «выравниваются» в ближайших бросках.'] };
    }
    return { q: staL(`${w.n} a lancé ${m} fois de suite un dé équilibré à six faces et n'a jamais obtenu de 6. Quelle est la probabilité d'obtenir 6 au lancer suivant ?`, `${w.n} ${staG(w, 'бросил', 'бросила')} честную игральную кость ${staNum(m, 'раз', 'раза', 'раз')} подряд, и шестёрка ни разу не выпала. Какова вероятность, что при следующем броске выпадет 6?`),
      ans: MQ(r, [staL('$1/6$', '$1/6$'), staL('Plus de $1/6$, car le 6 doit bientôt sortir.', 'Больше $1/6$: шестёрка должна вот-вот выпасть.'), staL('Moins de $1/6$, car ce dé semble défavoriser le 6.', 'Меньше $1/6$: эта кость, похоже, «не любит» шестёрку.'), staL('On ne peut pas la calculer.', 'Её нельзя вычислить.')], 0), sol: [
        'Кость не помнит прошлых бросков: шесть граней по-прежнему равновозможны, вероятность шестёрки — $1/6$.',
        'Серия без шестёрок — случайность; закон больших чисел говорит о частоте на очень большом числе бросков, а не о «долгах» в следующих бросках.'] };
  } });

/* =====================================================================================================
   ALGORITHMIQUE : SCRATCH
   ===================================================================================================== */
/* a calculation script: x = réponse, then the steps [op, k] in order */
function staCalcBlocks(steps, v) {
  return steps.map(([o, k]) => (o === '+' ? STA_B.add(k, v) : STA_B.set(v, staOp(staVr(v), o, k))));
}
const staApply = (x, steps) => steps.reduce((y, [o, k]) => (o === '+' ? y + k : o === '-' ? y - k : y * k), x);
const staStepRu = ([o, k], v) => (o === '+' ? '«ajouter ' + k + ' à ' + v + '» прибавляет ' + k : o === '-' ? '«mettre ' + v + ' à ' + v + ' - ' + k + '» вычитает ' + k : '«mettre ' + v + ' à ' + v + ' * ' + k + '» умножает на ' + k);

topic({ id: 'al.scratch-lire', ch: 'al', lvl: 1, calc: false, variants: 4,
  ru: 'Scratch: прочитать скрипт', fr: 'Lire un script Scratch',
  hints: [
    'Скрипт выполняется сверху вниз, по одному блоку. Заведи табличку: в ней храни текущее значение каждой переменной и обновляй его после каждого блока.',
    '«mettre x à …» заменяет значение переменной новым (старое теряется), а «ajouter … à x» прибавляет число к тому, что уже было.',
    '«réponse» — число, которое ввёл пользователь после блока «demander … et attendre». В конце посмотри, что именно говорит спрайт в блоке «dire».'],
  gen(r, vi) {
    if (vi === 0) {   /* variables, no input */
      const T = r.pick([0, 1, 2]), A = r.ri(2, 9), B = r.ri(2, 9), C = r.ri(2, 4), D = r.ri(1, 9);
      let bs, res, st;
      if (T === 0) {
        bs = [STA_B.flag(), STA_B.set('a', A), STA_B.set('b', B), STA_B.set('a', staOp(staVr('a'), '+', staVr('b'))), STA_B.set('b', staOp(staVr('a'), '*', C)), STA_B.say(staVr('b'), 2)];
        res = (A + B) * C;
        st = ['Сначала a = ' + A + ', b = ' + B + '.', ['«mettre a à a + b»: в a записываем сумму текущих значений:', 'a=' + A + '+' + B + '=' + (A + B)], ['«mettre b à a * ' + C + '» берёт уже новое значение a:', 'b=' + (A + B) + '*' + C + '=' + res], 'Спрайт говорит значение b: ' + res + '.'];
      } else if (T === 1) {
        bs = [STA_B.flag(), STA_B.set('x', A), STA_B.add(B, 'x'), STA_B.set('x', staOp(staVr('x'), '*', C)), STA_B.add(-D, 'x'), STA_B.say(staVr('x'), 2)];
        res = (A + B) * C - D;
        st = ['Сначала x = ' + A + '.', ['«ajouter ' + B + ' à x» прибавляет ' + B + ' к текущему значению:', 'x=' + A + '+' + B + '=' + (A + B)], ['«mettre x à x * ' + C + '»:', 'x=' + (A + B) + '*' + C + '=' + (A + B) * C], ['«ajouter −' + D + ' à x» — прибавить отрицательное число, то есть вычесть ' + D + ':', 'x=' + (A + B) * C + '-' + D + '=' + res], 'Спрайт говорит ' + res + '.'];
      } else {
        bs = [STA_B.flag(), STA_B.set('a', A), STA_B.set('b', B === A ? B + 1 : B), STA_B.set('a', staVr('b')), STA_B.set('b', staVr('a')), STA_B.say(staOp(staVr('a'), '+', staVr('b')), 2)];
        const b0 = B === A ? B + 1 : B; res = 2 * b0;
        st = ['Сначала a = ' + A + ', b = ' + b0 + '.', '«mettre a à b»: в a записываем значение b, то есть ' + b0 + '. Старое значение ' + A + ' потеряно!', '«mettre b à a»: в b записываем текущее значение a — а это уже ' + b0 + '. Значения не поменялись местами: теперь a = b = ' + b0 + '.', ['Спрайт говорит a + b:', b0 + '+' + b0 + '=' + res]];
      }
      return { q: staL('On exécute le script ci-dessous. Quel nombre le lutin dit-il à la fin ?', 'Запускают скрипт ниже. Какое число скажет спрайт в конце?'), fig: staScratch(bs), ans: N(res), sol: st };
    }
    /* programs with an input */
    const T = r.pick([0, 1, 2, 3]);
    const steps = [[[r.pick(['*', '+']), 0], ['-', 0]], [['+', 0], ['*', 0]], [['*', 0], ['+', 0], ['*', 0]], [['-', 0], ['*', 0], ['+', 0]]][T].map(([o]) => [o, o === '*' ? r.ri(2, 5) : r.ri(2, 9)]);
    if (steps[0][0] === '+' && steps[1][0] === '-' && steps[0][1] === steps[1][1]) steps[1][1] = steps[0][1] === 9 ? 2 : steps[0][1] + 1;   /* +3 then −3 would give the input back */
    if (vi === 2) {   /* which expression: QCM */
      const b = r.ri(2, 5), K = r.pick([0, 1, 2, 3]); let a = r.ri(2, 9); if (a === b) a = b + r.ri(1, 4);   /* a ≠ b: otherwise two options coincide */
      let bs, right, wrong, st;
      if (K === 0) {
        bs = [STA_B.set('y', staOp(STA_REP, '+', a)), STA_B.set('y', staOp(staVr('y'), '*', b))];
        right = `(x+${a})*${b}`; wrong = [`x+${a}*${b}`, `x*${b}+${a}`, `(x+${b})*${a}`];
        st = ['После первого блока y = x + ' + a + '.', 'Второй блок умножает на ' + b + ' всё значение y, то есть всю сумму: y = (x + ' + a + ') × ' + b + '. Скобки обязательны: без них на ' + b + ' умножилось бы только ' + a + '.'];
      } else if (K === 1) {
        bs = [STA_B.set('y', staOp(STA_REP, '*', b)), STA_B.set('y', staOp(staVr('y'), '-', a))];
        right = `${b}x-${a}`; wrong = [`${b}*(x-${a})`, `x-${a * b}`, `${a}x-${b}`];
        st = ['После первого блока y = ' + b + 'x.', 'Второй блок вычитает ' + a + ' из y: y = ' + b + 'x − ' + a + '. Вычитание идёт после умножения, поэтому скобок нет.'];
      } else if (K === 2) {
        bs = [STA_B.set('y', staOp(STA_REP, '*', STA_REP)), STA_B.add(a, 'y')];
        right = `x^2+${a}`; wrong = [`2x+${a}`, `(x+${a})^2`, `${a}x^2`];
        st = ['«réponse * réponse» — это x × x = x².', '«ajouter ' + a + ' à y» прибавляет ' + a + ': y = x² + ' + a + '. Ловушка: x × x — это x², а не 2x.'];
      } else {
        bs = [STA_B.set('y', staOp(STA_REP, '-', a)), STA_B.set('y', staOp(staVr('y'), '*', staVr('y')))];
        right = `(x-${a})^2`; wrong = [`x^2-${a}`, `x^2-${a * a}`, `2*(x-${a})`];
        st = ['После первого блока y = x − ' + a + '.', '«mettre y à y * y» умножает всё значение y на само себя: y = (x − ' + a + ')². Это не x² − ' + a * a + ': квадрат разности так не раскрывается.'];
      }
      const blocks = [STA_B.flag(), STA_B.ask('Choisis un nombre.')].concat(bs).concat([STA_B.say(staVr('y'), 2)]);
      return { q: staL('On exécute le script ci-dessous et on saisit un nombre $x$. Quelle expression donne le nombre dit par le lutin ?', 'Запускают скрипт и вводят число $x$. Какое выражение задаёт число, которое скажет спрайт?'),
        fig: staScratch(blocks), ans: MQ(r, ['$' + right + '$'].concat(wrong.map(e => '$' + e + '$')), 0), sol: ['Число, которое ввели, хранится в «réponse», то есть réponse = x.'].concat(st) };
    }
    let x0 = r.ri(-3, 12); if ((vi === 1 && r() < 0.75) || x0 === 0) x0 = r.ri(1, 12);
    const res = staApply(x0, steps);
    const blocks = [STA_B.flag(), STA_B.ask('Choisis un nombre.'), STA_B.set('x', STA_REP)].concat(staCalcBlocks(steps, 'x')).concat([STA_B.say(staVr('x'), 2)]);
    let y = x0; const trace = steps.map(s => { const y2 = staApply(y, [s]); const t = [staStepRu(s, 'x') + ':', (s[0] === '+' ? np(y) + '+' + s[1] : s[0] === '-' ? np(y) + '-' + s[1] : np(y) + '*' + s[1]) + '=' + y2]; y = y2; return t; });
    if (vi === 1) return { q: staL(`On exécute le script ci-dessous et on saisit le nombre ${nf(x0)}. Quel nombre le lutin dit-il ?`, `Запускают скрипт и вводят число ${nf(x0)}. Какое число скажет спрайт?`),
      fig: staScratch(blocks), ans: N(res), sol: ['«réponse» = ' + nf(x0) + ', поэтому сначала x = ' + nf(x0) + '.'].concat(trace).concat(['Спрайт говорит значение x: ' + nf(res) + '.']) };
    /* vi 3: backwards */
    const inv = steps.slice().reverse();
    let z = res; const back = inv.map(s => { const z2 = s[0] === '+' ? z - s[1] : s[0] === '-' ? z + s[1] : z / s[1]; const t = ['Отменяем ' + (s[0] === '+' ? 'прибавление ' + s[1] + ' — вычитаем:' : s[0] === '-' ? 'вычитание ' + s[1] + ' — прибавляем:' : 'умножение на ' + s[1] + ' — делим:'), (s[0] === '+' ? np(z) + '-' + s[1] : s[0] === '-' ? np(z) + '+' + s[1] : np(z) + '/' + s[1]) + '=' + z2]; z = z2; return t; });
    return { q: staL(`On exécute le script ci-dessous. Le lutin dit ${nf(res)}. Quel nombre a-t-on saisi ?`, `Запустили скрипт ниже, и спрайт сказал ${nf(res)}. Какое число ввели?`),
      fig: staScratch(blocks), ans: N(x0), sol: ['Идём от конца к началу и выполняем обратные действия в обратном порядке: вместо умножения — деление, вместо прибавления — вычитание.'].concat(back).concat(['Проверка: если ввести ' + nf(x0) + ', спрайт скажет ' + nf(res) + '.']) };
  } });

topic({ id: 'al.scratch-boucle', ch: 'al', lvl: 2, calc: false, variants: 4,
  ru: 'Scratch: циклы и фигуры', fr: 'Scratch : boucles et figures',
  hints: [
    '«répéter n fois» повторяет блоки внутри него n раз подряд. Чтобы нарисовать правильный многоугольник, спрайт n раз проходит сторону и поворачивает.',
    'Обойдя всю фигуру, спрайт снова смотрит в исходном направлении — значит, всего он повернулся на 360°. Поэтому при каждом повороте угол равен $360/n$.',
    'Поворот спрайта — это внешний угол фигуры, а не угол внутри неё: для равностороннего треугольника поворачиваем на 120°, а не на 60°.'],
  gen(r, vi) {
    const w = staWho(r);
    if (vi === 0) {   /* which figure: QCM */
      const n = r.pick([3, 4, 5, 6, 8, 10]), t = 360 / n, L0 = r.pick([40, 50, 60, 80, 100]);
      const trap = { 60: 3, 120: 6 }[t];
      const cands = [trap, n + 1, n - 1, n + 2, n === 8 ? 6 : 8, 4, 3].filter(k => k && k !== n && STA_POLY[k]);
      const ds = []; cands.forEach(k => { if (ds.length < 3 && !ds.includes(k)) ds.push(k); });
      const bs = [STA_B.flag(), STA_B.clear(), STA_B.pen(), STA_B.rep(n, [STA_B.fwd(L0), STA_B.rt(t)])];
      const st = ['Блок «répéter ' + n + ' fois» повторяет «avancer» и «tourner» ' + staNum(n, 'раз', 'раза', 'раз') + ': получится ' + n + ' ' + (n < 5 ? 'одинаковые стороны' : 'одинаковых сторон') + ' по ' + L0 + ' шагов.',
        'После каждой стороны спрайт поворачивает на ' + t + '°, всего ' + n + ' × ' + t + '° = 360° — ровно один оборот, поэтому фигура замыкается и все углы у неё равны. Это ' + STA_POLY[n][1] + '.'];
      if (trap) st.push('Ловушка: ' + t + '° — это угол внутри фигуры «' + STA_POLY[trap][1] + '», но спрайт поворачивает на внешний угол. Для ' + (trap === 3 ? 'треугольника нужен поворот 120°' : 'шестиугольника нужен поворот 60°') + '.');
      return { q: staL('Le lutin exécute le script ci-dessous. Quelle figure dessine-t-il ?', 'Спрайт выполняет скрипт ниже. Какую фигуру он нарисует?'), fig: staScratch(bs),
        ans: MQ(r, [staL(STA_POLY[n][0].replace(/^un /, 'Un '), STA_POLY[n][1])].concat(ds.map(k => staL(STA_POLY[k][0].replace(/^un /, 'Un '), STA_POLY[k][1]))), 0), sol: st };
    }
    if (vi === 1) {   /* complete lines 3 and 5 */
      const n = r.pick([3, 4, 5, 6, 8]), L0 = r.pick([50, 60, 80, 100]);
      const bs = [STA_B.flag(), STA_B.pen(), STA_B.rep('…', [STA_B.fwd(L0), STA_B.rt('…')])];
      return { q: staL(`${w.n} veut dessiner ${STA_POLY[n][0]} avec le script ci-dessous. Par quelles valeurs doit-on compléter les lignes 3 et 5 ?`, `${w.n} хочет нарисовать ${STA_POLY[n][1]} с помощью скрипта ниже. Какими числами нужно заполнить строки 3 и 5?`),
        fig: staScratch(bs, { num: true }), ans: multi([staL('ligne 3 :', 'строка 3:'), N(n)], [staL('ligne 5 :', 'строка 5:'), N(360 / n, { unit: '°' })]), sol: [
          'У фигуры «' + STA_POLY[n][1] + '» ' + n + ' ' + (n < 5 ? 'равные стороны' : 'равных сторон') + ', поэтому «avancer» и «tourner» повторяем ' + staNum(n, 'раз', 'раза', 'раз') + ': в строке 3 — ' + n + '.',
          ['Обойдя фигуру, спрайт поворачивается в сумме на полный оборот 360°, и все повороты одинаковые:', '360/' + n + '=' + 360 / n, '°'],
          'Ловушка: поворачивать надо на внешний угол, а не на угол внутри фигуры' + (n === 4 ? ' (у квадрата они случайно совпадают — оба по 90°).' : ' (у этой фигуры внутренний угол ' + (180 - 360 / n) + '°).')] };
    }
    if (vi === 2) {   /* the figure is given, find the missing value */
      const star = r() < 0.17, n = star ? 5 : r.pick([3, 4, 5, 6, 8]), t = star ? 144 : 360 / n, L0 = r.pick([60, 80, 100]), askN = !star && r() < 0.3;
      const bs = [STA_B.flag(), STA_B.pen(), STA_B.rep(askN ? '…' : n, [STA_B.fwd(L0), STA_B.rt(askN ? t : '…')])];
      const z = staScr(bs), top = z.h + 26;
      const s = z.s + staTx(4, top - 6, 'Figure à obtenir :', 'ftx', 'start') + staShape(staTurtle(n, t), 100, top + 6, 140, 130);
      const fig = svgFig(340, Math.ceil(top + 146), s, 'script Scratch et figure');
      const st = star ? [
        'На рисунке пятиконечная звезда: 5 одинаковых отрезков.',
        'Рисуя звезду, спрайт обходит центр два раза, то есть поворачивается в сумме на 2 × 360° = 720°.',
        ['Все 5 поворотов одинаковые:', '720/5=144', '°'],
        'Проверка: при повороте на 72° (360 ÷ 5) получился бы правильный пятиугольник, а не звезда.']
        : askN ? ['На рисунке ' + STA_POLY[n][1] + ': ' + n + ' равных сторон.', 'Каждое повторение рисует одну сторону и поворачивает на ' + t + '°, поэтому повторений нужно ' + n + ' — и ' + n + ' × ' + t + '° = 360°, полный оборот.']
          : ['На рисунке ' + STA_POLY[n][1] + ': ' + n + ' равных сторон, ' + n + ' одинаковых поворотов.', ['За весь обход спрайт поворачивается на 360°, поэтому каждый поворот:', '360/' + n + '=' + t, '°'], 'Ловушка: угол внутри фигуры равен ' + (180 - t) + '°, но спрайт поворачивает на внешний угол — тот, на который меняется направление движения.'];
      return { q: staL('Quel nombre faut-il écrire à la place des pointillés pour que le script trace la figure dessinée en dessous ?', 'Какое число нужно написать вместо многоточия, чтобы скрипт нарисовал фигуру под ним?'),
        fig, ans: askN ? N(n) : N(t, { unit: '°' }), sol: st };
    }
    /* coordinates of the sprite: QCM */
    const a = r.ri(2, 10) * 10, b = r.ri(2, 8) * 10, c = r.ri(1, 6) * 10, three = r() < 0.5, t1 = r.pick(['lt', 'rt']), t2 = r.pick(['lt', 'rt']);
    const bs = [STA_B.flag(), STA_B.go(0, 0), STA_B.dir(90), STA_B.fwd(a), STA_B[t1](90), STA_B.fwd(b)].concat(three ? [STA_B[t2](90), STA_B.fwd(c)] : []);
    let x = 0, y = 0, h = 90; const trace = [];
    const mv = d => { x += Math.round(d * Math.sin(h * Math.PI / 180)); y += Math.round(d * Math.cos(h * Math.PI / 180)); trace.push('«avancer de ' + d + '» → (' + nf(x) + ' ; ' + nf(y) + ')'); };
    const tn = k => { h += k === 'rt' ? 90 : -90; const dir = ((h % 360) + 360) % 360; trace.push('«tourner ' + (k === 'rt' ? '↻' : '↺') + ' de 90» — поворот ' + (k === 'rt' ? 'по часовой стрелке' : 'против часовой стрелки') + ': теперь спрайт смотрит ' + { 0: 'вверх', 90: 'вправо', 180: 'вниз', 270: 'влево' }[dir]); };
    mv(a); tn(t1); mv(b); if (three) { tn(t2); mv(c); }
    const P = (u, v) => '(' + nf(u) + ' ; ' + nf(v) + ')';
    const cand = [P(y, x), P(x, -y), P(-x, y), P(a, b), P(a + b, 0), P(-x, -y)];
    const opts = [P(x, y)]; cand.forEach(o => { if (opts.length < 4 && !opts.includes(o)) opts.push(o); });
    return { q: staL("Au départ, l'instruction « s'orienter à 90 » oriente le lutin vers la droite. Quelles sont les coordonnées du lutin à la fin du script ?", 'Блок «s\'orienter à 90» поворачивает спрайт вправо. Какие координаты будут у спрайта в конце скрипта?'),
      fig: staScratch(bs), ans: MQ(r, opts.map(o => staNb(o)), 0), sol: [
        'Спрайт начинает в точке (0 ; 0) и смотрит вправо, то есть в сторону возрастания x. Вверх — возрастание y.',
        trace.join('; ') + '.',
        'Ловушки: ↺ — против часовой стрелки (из «вправо» — «вверх»), ↻ — по часовой (из «вправо» — «вниз»); первая координата — x (по горизонтали), вторая — y.'] };
  } });

topic({ id: 'al.scratch-conditions', ch: 'al', lvl: 2, calc: false, variants: 4,
  ru: 'Scratch: условия «si … alors … sinon»', fr: 'Scratch : instructions conditionnelles',
  hints: [
    'Блок «si … alors … sinon» проверяет условие в шестиугольнике. Если условие верно — выполняются блоки после «alors», иначе — блоки после «sinon». Выполняется только одна из двух частей.',
    'Аккуратно со строгими неравенствами: при условии «réponse > 10» число 10 условию не удовлетворяет.',
    '«a modulo b» — остаток от деления a на b. Например, 17 modulo 5 = 2, потому что $17=3*5+2$. Остаток 0 значит «делится без остатка».'],
  gen(r, vi) {
    if (vi === 0 || vi === 2) {
      const money = vi === 2, t = money ? r.pick([5, 8, 10, 12, 20]) : r.ri(5, 15), cmp = money ? '>' : r.pick(['<', '>']);
      const k1 = money ? r.pick([6, 7, 8, 9]) : r.ri(2, 5), k2 = money ? k1 + r.pick([1, 2, 3]) : r.ri(2, 9), o2 = money ? '*' : r.pick(['-', '+']);
      const roll = r(), v = roll < 0.2 ? t : money ? t + r.pick([-3, -2, -1, 1, 2, 3, 4]) : roll < 0.6 ? t - r.ri(1, 4) : t + r.ri(1, 4);
      const ok = cmp === '>' ? v > t : v < t;
      let bs, res;
      if (!money) {
        bs = [STA_B.flag(), STA_B.ask('Choisis un nombre.'), STA_B.si(staCmp(STA_REP, cmp, t), [STA_B.say(staOp(STA_REP, '*', k1))], [STA_B.say(staOp(STA_REP, o2, k2))])];
        res = ok ? v * k1 : o2 === '-' ? v - k2 : v + k2;
      } else {
        bs = [STA_B.flag(), STA_B.ask('Nombre de places ?'), STA_B.si(staCmp(STA_REP, '>', t), [STA_B.set('prix', staOp(STA_REP, '*', k1))], [STA_B.set('prix', staOp(STA_REP, '*', k2))]), STA_B.say(staVr('prix'), 2)];
        res = v * (ok ? k1 : k2);
      }
      const st = ['Проверяем условие: ' + v + ' ' + cmp + ' ' + t + ' — ' + (ok ? 'верно.' : 'неверно.') + (v === t ? ' Неравенство строгое, а ' + v + ' равно ' + t + ', а не ' + (cmp === '>' ? 'больше' : 'меньше') + '.' : ''),
        'Значит, выполняется часть «' + (ok ? 'alors' : 'sinon') + '», а другая часть пропускается.',
        ['', money ? v + '*' + (ok ? k1 : k2) + '=' + res : ok ? v + '*' + k1 + '=' + res : v + o2 + k2 + '=' + res, money ? '€' : '']];
      if (money) return { q: staL(`Un cinéma utilise le script ci-dessous pour calculer le prix à payer, en euros, par un groupe. Quel prix le lutin affiche-t-il pour un groupe de ${v} personnes ?`, `Кинотеатр считает стоимость билетов для группы (в евро) с помощью скрипта ниже. Какую цену покажет спрайт для группы из ${staGen(v, 'человека', 'человек')}?`),
        fig: staScratch(bs), ans: N(res, { unit: '€' }), sol: st.concat(['Смысл скрипта: больше ' + t + ' мест — скидка, место стоит ' + k1 + ' € вместо ' + k2 + ' €.']) };
      return { q: staL(`On exécute le script ci-dessous et on saisit le nombre ${v}. Quel nombre le lutin dit-il ?`, `Запускают скрипт и вводят число ${v}. Какое число скажет спрайт?`), fig: staScratch(bs), ans: N(res), sol: st };
    }
    if (vi === 1) {   /* modulo: which number makes the sprite say «Gagné !» */
      const k = r.pick([2, 3, 4, 5]), right = k * r.ri(4, 15);
      const pool = []; for (let x = 11; x <= 75; x++) if (x % k) pool.push(x);
      const trap = pool.filter(x => (k === 3 ? x % 10 === 3 || Math.floor(x / 10) === 3 : k === 4 ? x % 2 === 0 : k === 5 ? String(x).includes('5') : x % 10 === 1 || x % 10 === 3));
      const wr = r.sh(trap).slice(0, 2); r.sh(pool).forEach(x => { if (wr.length < 3 && !wr.includes(x)) wr.push(x); });
      const bs = [STA_B.flag(), STA_B.ask('Donne un entier.'), STA_B.set('n', STA_REP), STA_B.si(staCmp(staOp(staVr('n'), 'modulo', k), '=', 0), [STA_B.say('Gagné !')], [STA_B.say('Perdu !')])];
      return { q: staL('On exécute le script ci-dessous. Pour lequel des nombres suivants le lutin dit-il « Gagné ! » ?', 'Запускают скрипт ниже. При каком из этих чисел спрайт скажет «Gagné !»?'), fig: staScratch(bs),
        ans: MQ(r, [String(right)].concat(wr.map(String)), 0), sol: [
          'В n записано введённое число. «n modulo ' + k + '» — остаток от деления n на ' + k + '. Условие «остаток = 0» верно, когда число делится на ' + k + ' без остатка.',
          ['Подходит ' + right + ':', right + '=' + k + '*' + right / k + '+0'],
          'Остальные дают остаток: ' + wr.map(x => x + ' = ' + k + ' × ' + Math.floor(x / k) + ' + ' + x % k).join('; ') + '.' + (k === 3 ? ' Цифра 3 в записи числа не делает его кратным 3.' : k === 4 ? ' Чётное число не обязательно делится на 4.' : '')] };
    }
    /* loop with a condition */
    const R = r.ri(5, 8), C = r.pick(['pair', 'mult3', 'sup']), s = r.ri(2, R - 2);
    const cond = C === 'pair' ? staCmp(staOp(staVr('n'), 'modulo', 2), '=', 0) : C === 'mult3' ? staCmp(staOp(staVr('n'), 'modulo', 3), '=', 0) : staCmp(staVr('n'), '>', s);
    const test = x => (C === 'pair' ? x % 2 === 0 : C === 'mult3' ? x % 3 === 0 : x > s);
    const bs = [STA_B.flag(), STA_B.set('n', 0), STA_B.set('total', 0), STA_B.rep(R, [STA_B.add(1, 'n'), STA_B.si(cond, [STA_B.add(staVr('n'), 'total')])]), STA_B.say(staVr('total'), 2)];
    const ok = []; for (let x = 1; x <= R; x++) if (test(x)) ok.push(x);
    const res = staSum(ok);
    return { q: staL('On exécute le script ci-dessous. Quel nombre le lutin dit-il à la fin ?', 'Запускают скрипт ниже. Какое число скажет спрайт в конце?'), fig: staScratch(bs), ans: N(res), sol: [
      'Цикл выполняется ' + R + ' раз. В начале каждого повторения n увеличивается на 1, поэтому n по очереди принимает значения 1, 2, …, ' + R + '.',
      'Условие ' + (C === 'pair' ? '«n modulo 2 = 0» (n чётное)' : C === 'mult3' ? '«n modulo 3 = 0» (n делится на 3)' : '«n > ' + s + '»') + ' верно при n = ' + ok.join(', ') + ' — только эти значения прибавляются к total.',
      ['', 'total=' + ok.join('+') + '=' + res]] };
  } });

/* =====================================================================================================
   TABLEUR
   ===================================================================================================== */
const staF1 = (a, b, cell) => '=' + a + '*' + cell + (b < 0 ? '-' : '+') + Math.abs(b);

topic({ id: 'al.tableur-formule', ch: 'al', lvl: 1, calc: false, variants: 4,
  ru: 'Электронная таблица: формулы', fr: 'Tableur : formules',
  hints: [
    'Формула в ячейке начинается со знака «=». Вместо чисел в ней пишут адреса ячеек: A2 — столбец A, строка 2. Таблица сама подставит число из этой ячейки.',
    '«=SOMME(B2:B6)» складывает все ячейки от B2 до B6, «=MOYENNE(B2:B6)» находит их среднее. Двоеточие означает «от … до …».',
    'Чтобы найти, что покажет ячейка, подставь в формулу числа из указанных ячеек и считай в обычном порядке действий: сначала умножение, потом сложение.'],
  gen(r, vi) {
    if (vi === 0) {   /* which formula was typed in B2 */
      const a = r.ri(2, 9), b = r.nz(-9, 9), x0 = r.pick([0, 1, 2, -2]), xs = [0, 1, 2, 3, 4].map(i => x0 + i);
      const f = staF1(a, b, 'A2'), bs = (b < 0 ? '-' : '+') + Math.abs(b);
      const W = r.sh([[staF1(a, b, 'A1'), 'A1 — это заголовок «Nombre de départ», а не число: формула должна брать число из той же строки, что и она сама'], [staF1(a, b, 'B2'), 'в B2 формула ссылалась бы сама на себя'], ['=' + a + '*' + np(xs[0]) + bs, 'с числом вместо адреса после растягивания во всех строках получился бы один и тот же результат'], ['=' + a + '*x' + bs, 'буква x таблице ничего не говорит — нужно указать ячейку']]).slice(0, 3);
      return { q: staL('On utilise un tableur pour calculer les résultats d\'un programme de calcul pour plusieurs nombres de départ, placés dans la colonne A. Quelle formule a-t-on saisie dans la cellule B2, avant de l\'étirer vers le bas ?',
        'С помощью электронной таблицы считают результаты программы вычислений для нескольких исходных чисел из столбца A. Какую формулу ввели в ячейку B2, прежде чем растянуть её вниз?'),
        fig: staSheet([['Nombre de départ', 'Résultat']].concat(xs.map(x => [nf(x), nf(a * x + b)]))), ans: MQ(r, [f].concat(W.map(x => x[0])), 0), sol: [
          'Формула в B2 должна брать исходное число из той же строки — из ячейки A2 (столбец A, строка 2). При растягивании вниз A2 сама превратится в A3, A4 и т. д.',
          ['Проверяем по строке 2: A2 = ' + nf(xs[0]) + ',', a + '*' + np(xs[0]) + bs + '=' + (a * xs[0] + b)],
          'Совпадает с числом в B2. ' + 'Почему не другие варианты: ' + W.map(x => x[0] + ' — ' + x[1]).join('; ') + '.'] };
    }
    if (vi === 1) {   /* the value shown by a formula */
      const K = r.pick([0, 1, 2, 3]);
      let rows, f, cell, res, st;
      if (K === 0) {
        const a = r.ri(2, 9), b = r.nz(-9, 9), v = r.ri(-5, 12); f = staF1(a, b, 'A2'); cell = 'B2'; res = a * v + b;
        rows = [['x', 'y'], [nf(v), { q: '?' }]]; st = [['A2 = ' + nf(v) + ', подставляем:', a + '*' + np(v) + (b < 0 ? '-' : '+') + Math.abs(b) + '=' + res]];
      } else if (K === 1) {
        const b = r.nz(-9, 9), v = r.ri(-6, 9); f = '=A2*A2' + (b < 0 ? '-' : '+') + Math.abs(b); cell = 'B2'; res = v * v + b;
        rows = [['x', 'y'], [nf(v), { q: '?' }]]; st = [['A2 = ' + nf(v) + ', подставляем:', np(v) + '*' + np(v) + (b < 0 ? '-' : '+') + Math.abs(b) + '=' + res]];
        if (v < 0) st.push('Минус на минус даёт плюс: ' + np(v) + ' × ' + np(v) + ' = ' + v * v + '.');
      } else if (K === 2) {
        const p = r.ri(2, 15), qn = r.ri(2, 12), d = r.pick([0, 5, 8]); f = '=A2*B2' + (d ? '+' + d : ''); cell = 'C2'; res = p * qn + d;
        rows = [['Prix unitaire (€)', 'Quantité', 'Total (€)'], [p, qn, { q: '?' }]];
        st = [['A2 = ' + p + ', B2 = ' + qn + ', подставляем:', p + '*' + qn + (d ? '+' + d : '') + '=' + res]];
        if (d) st.push('Сначала умножение, потом сложение — обычный порядок действий.');
      } else {
        const p = r.ri(4, 19), qn = r.ri(4, 19); f = '=(A2+B2)/2'; cell = 'C2'; res = (p + qn) / 2;
        rows = [['Note 1', 'Note 2', 'Moyenne'], [p, qn, { q: '?' }]]; st = [['A2 = ' + p + ', B2 = ' + qn + ', подставляем:', '(' + p + '+' + qn + ')/2=' + fx(res)], 'Скобки нужны: делим на 2 всю сумму — это среднее двух оценок.'];
      }
      return { q: staL(`Dans la feuille de calcul ci-dessous, la cellule ${cell} contient la formule ${f}. Quel nombre s'affiche dans la cellule ${cell} ?`, `В ячейке ${cell} таблицы ниже записана формула ${f}. Какое число покажет ячейка ${cell}?`),
        fig: staSheet(rows), ans: N(fx(res)), sol: ['Формула берёт числа из ячеек, адреса которых в ней записаны.'].concat(st) };
    }
    /* SOMME and MOYENNE (vi 2: which formula, vi 3: which value) */
    const k = r.ri(4, 6), days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'].slice(0, k);
    const C = r.pick([['crêpes vendues', 'проданных блинов', 'Crêpes vendues', 'le nombre de crêpes vendues chaque jour par le foyer du collège', 'сколько блинов продавал каждый день буфет колледжа'],
      ['visiteurs', 'посетителей', 'Visiteurs', 'le nombre de visiteurs du CDI du collège chaque jour', 'сколько человек приходило каждый день в библиотеку колледжа'],
      ['pas (en milliers)', 'шагов (в тысячах)', 'Pas (milliers)', 'le nombre de pas, en milliers, faits chaque jour par un élève', 'сколько тысяч шагов проходил каждый день ученик']]);
    let vals = [], S = 0;
    for (let g = 0; g < 100; g++) { vals = days.map(() => r.ri(C[0] === 'pas (en milliers)' ? 4 : 12, C[0] === 'pas (en milliers)' ? 15 : 60)); S = staSum(vals); if (vi === 2 || (2 * S) % k === 0) break; }
    const last = 'B' + (k + 1), cellT = 'B' + (k + 2), rng = 'B2:' + last;
    if (vi === 2) {
      const tot = r() < 0.6;
      const rows = [['Jour', C[2]]].concat(days.map((d, i) => [d, vals[i]])).concat([[tot ? 'Total' : 'Moyenne', { q: '?' }]]);
      const right = (tot ? '=SOMME(' : '=MOYENNE(') + rng + ')';
      const W = [[(tot ? '=MOYENNE(' : '=SOMME(') + rng + ')', tot ? 'это среднее, а нужна сумма' : 'это сумма, а нужно среднее'], [(tot ? '=SOMME(' : '=MOYENNE(') + 'A2:A' + (k + 1) + ')', 'в столбце A названия дней, а числа — в столбце B'], [tot ? '=B2+' + last : '=(B2+' + last + ')/2', 'здесь учтены только первый и последний дни']];
      return { q: staL(`La feuille de calcul ci-dessous donne ${C[3]}. Quelle formule faut-il saisir dans la cellule ${cellT} pour calculer ${tot ? 'le total de la semaine' : 'la moyenne par jour'} ?`, `В таблице — ${C[4]}. Какую формулу нужно ввести в ячейку ${cellT}, чтобы посчитать ${tot ? 'итог за неделю' : 'среднее за день'}?`),
        fig: staSheet(rows), ans: MQ(r, [right].concat(W.map(x => x[0])), 0), sol: [
          '«' + rng + '» — это все ячейки столбца B со 2-й по ' + (k + 1) + '-ю строку, то есть числа за все ' + k + ' дней.',
          (tot ? '«SOMME» складывает их' : '«MOYENNE» находит их среднее (сумма ÷ количество)') + ', поэтому нужна формула ' + right + '.',
          'Почему не другие варианты: ' + W.map(x => x[0] + ' — ' + x[1]).join('; ') + '.'] };
    }
    const tot = r() < 0.4, f = (tot ? '=SOMME(' : '=MOYENNE(') + rng + ')', res = tot ? S : S / k;
    const rows = [['Jour', C[2]]].concat(days.map((d, i) => [d, vals[i]])).concat([[tot ? 'Total' : 'Moyenne', { q: '?' }]]);
    return { q: staL(`Dans la feuille de calcul ci-dessous, on a saisi dans la cellule ${cellT} la formule ${f}. Quel nombre s'affiche dans cette cellule ?`, `В ячейку ${cellT} таблицы ниже ввели формулу ${f}. Какое число она покажет?`),
      fig: staSheet(rows), ans: N(fx(res)), sol: [
        '«' + rng + '» — ячейки столбца B со 2-й по ' + (k + 1) + '-ю строку: ' + vals.join(', ') + '.',
        ['«SOMME» — сумма:', vals.join('+') + '=' + S]].concat(tot ? [] : [['«MOYENNE» — среднее: сумма ÷ количество (' + staNum(k, 'число', 'числа', 'чисел') + '):', S + '/' + k + '=' + fx(res)]]) };
  } });

topic({ id: 'al.tableur-recopie', ch: 'al', lvl: 2, calc: false, variants: 4,
  ru: 'Электронная таблица: копирование формул', fr: 'Tableur : recopier une formule',
  hints: [
    'Когда формулу растягивают вниз («étirer», «recopier vers le bas»), номера строк в адресах увеличиваются на столько же, на сколько сдвинулась ячейка. Буквы столбцов не меняются.',
    'Когда растягивают вправо, меняются буквы столбцов (B → C → D…), а номера строк остаются.',
    'Так и задумано: «=3*A2+5» в ячейке B2 означает «утроить число слева в той же строке и прибавить 5». Скопированная на строку ниже, формула делает то же самое со своим соседом слева — A3.'],
  gen(r, vi) {
    const a = r.ri(2, 9), b = r.nz(-9, 9), bs = (b < 0 ? '-' : '+') + Math.abs(b), K = r.pick([0, 0, 1]);
    const fD = (row, col) => (K === 0 ? '=' + a + '*' + (col || 'A') + row + bs : '=' + (col || 'A') + row + '*' + (col || 'A') + row + bs);
    const val = x => (K === 0 ? a * x + b : x * x + b);
    if (vi === 0) {   /* copied down: which formula */
      const k = r.ri(4, 9);
      const W = [[fD(2), 'формула не осталась прежней: номера строк сдвинулись вместе с ячейкой'], [fD(k, 'B'), 'при копировании вниз буква столбца не меняется'], [fD(k - 1), 'сдвиг посчитан неверно: из строки 2 в строку ' + k + ' — это ' + (k - 2) + ' ' + staPl(k - 2, 'строка', 'строки', 'строк') + ' вниз']];
      return { q: staL(`Dans une feuille de calcul, on a saisi dans la cellule B2 la formule ${fD(2)}, puis on l'a recopiée vers le bas jusqu'à la cellule B10. Quelle formule contient la cellule B${k} ?`, `В ячейку B2 ввели формулу ${fD(2)} и скопировали её вниз до ячейки B10. Какая формула окажется в ячейке B${k}?`),
        ans: MQ(r, [fD(k)].concat(W.map(x => x[0])), 0), sol: [
          'Из B2 в B' + k + ' ячейка сдвинулась на ' + (k - 2) + ' ' + staPl(k - 2, 'строку', 'строки', 'строк') + ' вниз, поэтому все номера строк в формуле тоже увеличиваются на ' + (k - 2) + ': A2 становится A' + k + '. Буква столбца не меняется.',
          'Смысл: формула в B2 работает с числом слева в той же строке; в B' + k + ' она так же берёт число слева — из A' + k + '. Получается ' + fD(k) + '.',
          'Почему не другие варианты: ' + W.map(x => x[0] + ' — ' + x[1]).join('; ') + '.'] };
    }
    if (vi === 1) {   /* copied to the right: which formula */
      const T = r.pick([0, 1, 2]), cols = 'BCDEFG', j = r.ri(2, 5), C0 = cols[j];
      const fR = c => (T === 0 ? '=' + c + '1*' + c + '1' : T === 1 ? '=2*' + c + '1+1' : '=' + c + '1*' + a);
      const vR = x => (T === 0 ? x * x : T === 1 ? 2 * x + 1 : x * a);
      const x0 = r.ri(1, 4), xs = [0, 1, 2, 3, 4, 5].map(i => x0 + i);
      const W = [[fR('B'), 'формула не осталась прежней: буквы столбцов сдвинулись вместе с ячейкой'], [T === 0 ? '=' + C0 + '2*' + C0 + '2' : T === 1 ? '=2*' + C0 + '2+1' : '=' + C0 + '2*' + a, 'при копировании вправо номер строки не меняется: число берётся из строки 1'], [fR(cols[j - 1]), 'сдвиг посчитан неверно: из B в ' + C0 + ' — это ' + j + ' ' + staPl(j, 'столбец', 'столбца', 'столбцов') + ' вправо']];
      return { q: staL(`Dans une feuille de calcul, on a saisi dans la cellule B2 la formule ${fR('B')}, puis on l'a recopiée vers la droite jusqu'à la cellule G2. Quelle formule contient la cellule ${C0}2 ?`, `В ячейку B2 ввели формулу ${fR('B')} и скопировали её вправо до ячейки G2. Какая формула окажется в ячейке ${C0}2?`),
        fig: staSheet([['x'].concat(xs), ['Résultat'].concat(xs.map(vR))]), ans: MQ(r, [fR(C0)].concat(W.map(x => x[0])), 0), sol: [
          'Из B2 в ' + C0 + '2 ячейка сдвинулась на ' + j + ' ' + staPl(j, 'столбец', 'столбца', 'столбцов') + ' вправо, поэтому буквы в формуле сдвигаются так же: B становится ' + C0 + '. Номера строк не меняются.',
          'Смысл: формула берёт число из строки 1 того же столбца. Проверка: в ' + C0 + '1 стоит ' + xs[j] + ', и формула ' + fR(C0) + ' даёт ' + vR(xs[j]) + ' — как в таблице.',
          'Почему не другие варианты: ' + W.map(x => x[0] + ' — ' + x[1]).join('; ') + '.'] };
    }
    if (vi === 2) {   /* copied down: which value */
      const xs = [0, 1, 2, 3, 4].map(() => r.ri(-5, 12)), k = r.ri(3, 6), x = xs[k - 2];
      const rows = [['x', 'Résultat']].concat(xs.map((v, i) => [nf(v), i === k - 2 ? { q: '?' } : '']));
      return { q: staL(`On a saisi dans la cellule B2 la formule ${fD(2)}, puis on l'a recopiée vers le bas. Quel nombre s'affiche dans la cellule B${k} ?`, `В ячейку B2 ввели формулу ${fD(2)} и растянули её вниз. Какое число появится в ячейке B${k}?`),
        fig: staSheet(rows), ans: N(val(x)), sol: [
          'После копирования в B' + k + ' записана формула ' + fD(k) + ': номер строки сдвинулся вместе с ячейкой.',
          ['Она берёт число из A' + k + ' = ' + nf(x) + ':', (K === 0 ? a + '*' + np(x) : np(x) + '*' + np(x)) + bs + '=' + val(x)]] };
    }
    /* each cell uses the cell above */
    const s0 = r.ri(1, 9), T = r.pick([0, 0, 1, 2]), d = r.ri(2, 9), k = r.ri(5, 8);
    const f3 = T === 0 ? '=A2+' + d : T === 1 ? '=A2*2' : '=2*A2-1';
    const nx = x => (T === 0 ? x + d : T === 1 ? 2 * x : 2 * x - 1);
    const seq = [s0]; for (let i = 3; i <= k; i++) seq.push(nx(seq[seq.length - 1]));
    const rows = [['Nombre']].concat(seq.map((v, i) => [i === 0 ? v : i === seq.length - 1 ? { q: '?' } : '']));
    return { q: staL(`Dans la cellule A2, on a saisi le nombre ${s0}. Dans la cellule A3, on a saisi la formule ${f3}, puis on l'a recopiée vers le bas. Quel nombre s'affiche dans la cellule A${k} ?`, `В ячейку A2 ввели число ${s0}. В ячейку A3 ввели формулу ${f3} и скопировали её вниз. Какое число будет в ячейке A${k}?`),
      fig: staSheet(rows), ans: N(seq[seq.length - 1]), sol: [
        'После копирования в A4 стоит ' + f3.replace('A2', 'A3') + ', в A5 — ' + f3.replace('A2', 'A4') + ' и так далее: каждая ячейка берёт число из ячейки над собой.',
        'Считаем по очереди: ' + seq.map((v, i) => 'A' + (i + 2) + ' = ' + v).join(', ') + '.',
        'В A' + k + ' получается ' + seq[seq.length - 1] + '.'] };
  } });

/* =====================================================================================================
   FICHES AND DICTIONARY
   ===================================================================================================== */
fiche({ ch: 'st', id: 'st.indicateurs', ru: 'Среднее, медиана, размах', fr: 'Moyenne, médiane, étendue', body: [
  'Среднее («moyenne») = сумма значений ÷ их количество. Если данные даны таблицей, каждое значение умножаем на его количество («effectif») — это взвешенное среднее («moyenne pondérée»). Полезно и обратное: сумма = среднее × количество.',
  'Медиана («médiane») — значение посередине упорядоченного ряда: не меньше половины значений не больше её, и не меньше половины — не меньше. Сначала обязательно упорядочить! При нечётном $n$ медиана — значение номер $(n+1)/2$, при чётном — полусумма двух средних значений.',
  'Размах («étendue») = наибольшее значение − наименьшее. Показывает, насколько разбросаны данные.',
  'Среднее чувствительно к выбросам (одна огромная зарплата сильно его поднимает), медиана — почти нет.'],
  ex: [['Среднее', '(8+12+6+19+15)/5=12'], ['Медиана, 5 значений', '6;8;12;15;19→12'], ['Медиана, 6 значений', '(10+14)/2=12'], ['Размах', '19-6=13']] });
fiche({ ch: 'st', id: 'st.donnees', ru: 'Количества, частоты, диаграммы', fr: 'Effectifs, fréquences, diagrammes', body: [
  'Количество («effectif») — сколько раз встречается значение; общее количество («effectif total») — сумма всех количеств.',
  'Частота («fréquence») = effectif ÷ effectif total. Пишется дробью, десятичной дробью или в процентах; сумма всех частот равна 1, то есть 100 %.',
  'Столбчатая диаграмма («diagramme en barres»): высота столбика = количество. Гистограмма («histogramme»): столбики стоят вплотную, каждый отвечает за промежуток («classe»), например от 150 см (включительно) до 160 см (не включая).',
  'Круговая диаграмма («diagramme circulaire»): весь круг — 360°, угол сектора пропорционален количеству: угол = частота × 360°. 1 % — это 3,6°.'],
  ex: [['Частота', '6/24=1/4=0.25'], ['Угол сектора', '1/4*360=90'], ['Количество по углу', '24*120/360=8']] });
fiche({ ch: 'st', id: 'st.probas', ru: 'Вероятности', fr: 'Probabilités', body: [
  'Опыт случайный («expérience aléatoire»), если его результат заранее неизвестен. Возможные результаты — исходы («issues»); событие («événement») — набор исходов.',
  'Если все исходы равновозможны («équiprobables»): вероятность = число благоприятных исходов ÷ число всех исходов. Вероятность — число от 0 (невозможное событие) до 1 (достоверное).',
  'Противоположное событие («événement contraire») «не A»: ' + STA_NONA + '. Сумма вероятностей всех исходов равна 1.',
  'Два испытания подряд — дерево («arbre») или таблица. Вероятность пути = произведение вероятностей на ветках; если подходят несколько путей — складываем. Без возвращения («sans remise») во втором испытании на один предмет меньше.',
  'Частота в опыте при большом числе испытаний обычно близка к вероятности, но не обязана быть ей равна. Монета и кость не помнят прошлых бросков.'],
  ex: [['4 синих шара из 20', 'P=4/20=1/5'], ['Противоположное', '1-1/5=4/5'], ['Два броска: два раза «pile»', '1/2*1/2=1/4']] });
fiche({ ch: 'al', id: 'al.scratch', ru: 'Scratch', fr: 'Programmer avec Scratch', body: [
  'Скрипт выполняется сверху вниз. Переменная («variable») — ячейка памяти с именем: «mettre x à 5» записывает в неё 5 (старое значение теряется), «ajouter 2 à x» прибавляет 2 к тому, что там было.',
  '«demander … et attendre» ждёт, пока пользователь введёт ответ; введённое значение хранится в «réponse». «dire …» — спрайт («lutin») говорит значение.',
  'Цикл («boucle») «répéter n fois» повторяет вложенные блоки n раз. Правильный многоугольник с n сторонами: n раз «avancer» и «tourner de 360/n degrés» — за весь обход спрайт поворачивается на 360°.',
  'Условие «si … alors … sinon»: если условие верно — выполняется первая часть, иначе — вторая. «a modulo b» — остаток от деления a на b.',
  '«s\'orienter à 90» — смотреть вправо; 0 — вверх, 180 — вниз, −90 — влево. «aller à x: … y: …» ставит спрайт в точку с этими координатами. ↻ — поворот по часовой стрелке, ↺ — против.'],
  ex: [['Квадрат', '360/4=90'], ['Равносторонний треугольник', '360/3=120'], ['Правильный шестиугольник', '360/6=60']] });
fiche({ ch: 'al', id: 'al.tableur', ru: 'Электронная таблица', fr: 'Le tableur', body: [
  'Ячейка («cellule») называется буквой столбца и номером строки: B3 — столбец B, строка 3.',
  'Формула начинается со знака «=»: «=3*A2+5» берёт число из A2, умножает на 3 и прибавляет 5. Умножение — «*», деление — «/».',
  '«=SOMME(B2:B8)» — сумма ячеек от B2 до B8; «=MOYENNE(B2:B8)» — их среднее.',
  'Растянули формулу вниз («étirer», «recopier vers le bas») — номера строк в ней растут: в B3 окажется «=3*A3+5». Вправо — меняются буквы: «=B1*2» в C2 станет «=C1*2».'],
  ex: [['B2 содержит =3*A2+5, в A2 число 4', '3*4+5=17'], ['=MOYENNE(B2:B5) для 10, 12, 15, 11', '(10+12+15+11)/4=12']] });

gloss('une série statistique', 'статистический ряд', 'список полученных значений');
gloss('l\'effectif', 'количество (абсолютная частота)', 'сколько раз встречается значение');
gloss('l\'effectif total', 'общее количество', 'сумма всех количеств — сколько всего данных');
gloss('la fréquence', 'частота (доля)', 'effectif ÷ effectif total; дробью, десятичной дробью или в %');
gloss('la moyenne pondérée', 'взвешенное среднее', 'каждое значение умножают на его количество или коэффициент');
gloss('un diagramme en barres', 'столбчатая диаграмма', 'высота столбика — количество');
gloss('un diagramme circulaire', 'круговая диаграмма', 'угол сектора пропорционален количеству; весь круг — 360°');
gloss('un histogramme', 'гистограмма', 'столбики вплотную, каждый — для промежутка значений');
gloss('une expérience aléatoire', 'случайный опыт', 'результат заранее неизвестен');
gloss('une issue', 'исход', 'один из возможных результатов опыта');
gloss('un événement', 'событие', 'набор исходов');
gloss('l\'événement contraire', 'противоположное событие', 'происходит, когда событие не происходит; P(не A) = 1 − P(A)');
gloss('équiprobable', 'равновозможный', 'все исходы имеют одинаковую вероятность');
gloss('la probabilité', 'вероятность', 'число от 0 до 1');
gloss('au hasard', 'наугад, случайно');
gloss('avec remise', 'с возвращением', 'вынутый предмет кладут обратно');
gloss('sans remise', 'без возвращения', 'вынутый предмет обратно не кладут');
gloss('un arbre de probabilités', 'дерево вероятностей');
gloss('un dé équilibré', 'честная игральная кость', 'все грани выпадают с одинаковой вероятностью');
gloss('un lutin', 'спрайт', 'персонаж Scratch, который выполняет скрипт');
gloss('une boucle', 'цикл', 'повторение блоков, например «répéter 4 fois»');
gloss('une variable', 'переменная', 'ячейка памяти программы с именем');
gloss('une instruction conditionnelle', 'условие (ветвление)', '«si … alors … sinon»');
gloss('une cellule', 'ячейка таблицы', 'B3 — столбец B, строка 3');
gloss('un tableur', 'электронная таблица', 'например LibreOffice Calc или Excel');
