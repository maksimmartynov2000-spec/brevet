/* ===================== PARTIE 2 · problèmes A : nombres (nc), proportionnalité (pp), calcul littéral (cl), fonctions (fn), algorithmique et tableur (al) =====================
   Each problem follows a real DNB exercise (src): the same story and the same chain of reasoning, new numbers on every run.
   Top-level names of this file start with pa. Graphs and Scratch programs are recomputed from the generated numbers. */

/* ---------- numbers ---------- */
const paR = (v, k) => { const p = Math.pow(10, k || 0); return Math.round(v * p + (v >= 0 ? 1e-7 : -1e-7)) / p; };   /* round half up (2.45 → 2.5) */
const paK = (v, k) => paR(v, k).toFixed(k);                       /* key of a rounded answer: '0.85' */
const paF = (v, k) => nf(paR(v, k), k);                           /* rounded number in a text: '0,85' */
const paExact = (v, k) => { const x = v * Math.pow(10, k); return Math.abs(x - Math.round(x)) < 1e-6; };   /* v has at most k decimals */
const paEq = (v, k) => (paExact(v, k) ? '=' : '≈');                /* sign before a rounded result */
const paFz = (v, k) => (paExact(v, k) ? nf(+fx(v)) : paF(v, k));     /* rounded number for a text, without useless zeros */
const paKz = (v, k) => (paExact(v, k) ? fx(v) : paK(v, k));          /* the same in input syntax */
/* answer «rounded to k decimals»; an exact value needs no rounding instruction and may be written in any way */
function paNum(v, k, unit, frR, ruR) {
  const o = unit ? { unit } : {};
  if (paExact(v, k)) return { ans: N(fx(v), o), fr: '', ru: '', eq: '=' };
  return { ans: N(paK(v, k), Object.assign({ dp: k }, o)), fr: ' ' + frR, ru: ' ' + ruR, eq: '≈' };
}
/* Russian plural: paPl(5, ['пакетик', 'пакетика', 'пакетиков']) → 'пакетиков' */
const paPl = (n, f) => { const a = Math.abs(n) % 100, b = a % 10; return a > 10 && a < 20 ? f[2] : b === 1 ? f[0] : b > 1 && b < 5 ? f[1] : f[2]; };
const paEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const paDec = n => pfStr(pfac(n));                                /* 140 → '2^2*5*7' */
/* the divisions that give the prime factors: '140=2*70;70=2*35;35=5*7' */
function paChain(n) { const out = []; let m = n, p = 2; while (m > 1) { if (m % p === 0) { if (m / p > 1) out.push(m + '=' + p + '*' + (m / p)); m /= p; } else p++; } return out.join(';'); }
/* prime factors common to all numbers with the smallest exponent (gcd), or all primes with the largest one (lcm) */
function paPf(ns, big) {
  const fs = ns.map(pfac), ps = [...new Set([].concat(...fs).map(f => f[0]))].sort((x, y) => x - y), out = [];
  ps.forEach(p => { const es = fs.map(f => (f.find(q => q[0] === p) || [p, 0])[1]); const e = big ? Math.max(...es) : Math.min(...es); if (e > 0) out.push([p, e]); });
  return out;
}
const paSec = s => { const m = Math.floor(s / 60), r = s % 60; return { fr: (m ? m + ' min' : '') + (m && r ? ' ' : '') + (r || !m ? r + ' s' : ''), ru: (m ? m + ' мин' : '') + (m && r ? ' ' : '') + (r || !m ? r + ' с' : '') }; };
const paHM = mn => { const h = Math.floor(mn / 60), m = mn % 60; return { fr: (h ? h + ' h' : '') + (h && m ? ' ' : '') + (m || !h ? m + ' min' : ''), ru: (h ? h + ' ч' : '') + (h && m ? ' ' : '') + (m || !h ? m + ' мин' : '') }; };

/* ---------- redac: «как записать на экзамене» ---------- */
/* several equalities on one line (the line may wrap between them): '2+4=6;6*3=18' → '$2+4=6$ ; $6*3=18$' */
const paEqs = s => String(s).split(';').map(e => '$' + e + '$').join(' ; ');
/* a prime factorisation written out: '$140=2*70$ ; $70=2*35$ ; $35=5*7$, donc $140=2^2*5*7$.' */
function paDecFr(n) { const ch = paChain(n), d = n + '=' + paDec(n); return ch === d ? '$' + d + '$.' : paEqs(ch) + ', donc $' + d + '$.'; }
/* an intermediate result written before it is rounded to the unit: '≈212.9', '=254.5' — with as many decimals as needed
   for the written value to round to the same whole number (175.4545 is written 175.45, not 175.5) */
function paMid(v) { let k = 1; while (k < 4 && !paExact(v, k) && paR(+paK(v, k), 0) !== paR(v, 0)) k++; return paEq(v, k) + paKz(v, k); }
/* a number with a regular French noun: paS(1, 'aubergine') → '1 aubergine', paS(3, 'aubergine') → '3 aubergines' */
const paS = (n, w) => n + ' ' + w + (n > 1 ? 's' : '');

/* ---------- French typography in plain text (not inside $…$): no line break before « ? ! : ; », between a number and its unit ---------- */
const PA_UNITS = 'm³/h|m³|m²|m/s|km/h|km|kWh|GWh|Wh|kW|kg|cm|mm|m|g|€|%|°C|h|min|s|м³/ч|м³|м²|м/с|км/ч|км|кВт·ч|ГВт·ч|Вт·ч|кВт|кг|см|м|г|ч|мин|с';
const PA_TYU = new RegExp('(\\d) (?=(?:' + PA_UNITS + ')(?![A-Za-zÀ-ÿА-Яа-яЁё0-9²³/·]))', 'g');
function paTy(s) {
  return String(s).split(/(\$\$[^$]*\$\$|\$[^$]*\$)/).map((p, i) => i % 2 ? p : p.replace(/ ([?!:;])/g, ' $1').replace(PA_TYU, '$1 ').replace(/(\d) (?=\d{3}(?!\d))/g, '$1 ')).join('');
}
/* in a write-up (redac) a short formula is never cut at the end of a line: «39 = 3 × 13» stays whole and the line breaks between
   formulas. The formula is turned into TeX inside a group {…}, where KaTeX does not break; a fraction is one piece already.
   The unit written right after the formula («$…$ €», with a no-break space) and a full stop or a comma go into the group too,
   so that they never start the next line alone. On a line of pure calculation (no sentence) fractions are written in full size,
   as on paper; in a sentence they stay small. 360000 becomes 360 000. */
const paTex = f => mi(f, true).replace(/\d{5,}/g, d => d.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,'));
function paNb(s) {
  const calc = String(s).replace(/\$\$[^$]*\$\$|\$[^$]*\$/g, '').replace(/[^A-Za-zÀ-ÿ]/g, '').length < 4;
  return String(s).replace(/\$\$[^$]*\$\$|\$([^$]*)\$(\u00a0[^\s.,;:!?$]+)?([.,]?)/g, (m, f, u, pt) => {
    if (f == null) return m;
    const big = calc && f.includes('/'); if (f.length > 22 && !big) return m;
    const t = big ? paTex(f) : paTex(f).replace(/\\dfrac/g, '\\frac');
    if (f.length > 22) return '$$' + t + '$$' + (u || '') + (pt || '');   /* a long line of fractions may still break at «=» */
    /* the formula is a group of its own, so no extra space appears between «)» and the unit or the full stop */
    return '$${{' + t + '}' + (u ? '\\text{ ' + u.slice(1).replace(/%/g, '\\%').replace(/²/g, '}^2\\text{').replace(/³/g, '}^3\\text{') + '}' : '') + (pt ? '\\text{' + pt + '}' : '') + '}$$';
  });
}
const paTyT = o => (o && typeof o === 'object' && 'fr' in o ? { fr: paTy(o.fr), ru: paTy(o.ru) } : typeof o === 'string' ? paTy(o) : o);
function paTyA(a) { if (!a) return a; if (a.k === 'mcq') a.opts = a.opts.map(paTyT); if (a.k === 'order') a.items = a.items.map(paTyT); if (a.k === 'multi') a.parts.forEach(p => { if (p.lab) p.lab = paTyT(p.lab); paTyA(p.spec); }); return a; }
function paTyS(s) { if (typeof s === 'string') return paTy(s); if (Array.isArray(s)) return [paTy(s[0] || '')].concat(s.slice(1)); return s; }
const paTbl = (rows, cls) => tbl(rows.map(r => r.map(c => paTy(c))), cls);
/* probleme() with the typography applied to every text the generator returns */
function paProb(def) {
  const g = def.gen;
  def.gen = function (r) { const p = g.call(this, r); if (p.ctx) p.ctx = paTyT(p.ctx); p.qs.forEach(q => { q.q = paTyT(q.q); paTyA(q.ans); q.sol = (q.sol || []).map(paTyS); if (q.redac) q.redac = [].concat(q.redac).map(l => paNb(paTy(l))); }); return p; };
  return probleme(def);
}

/* ---------- drawing ---------- */
const paC = v => (+v).toFixed(1);
function paArrow(x1, y1, x2, y2) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 8, p = t => paC(x2 - h * Math.cos(a + t)) + ',' + paC(y2 - h * Math.sin(a + t));
  return '<line class="fl" x1="' + paC(x1) + '" y1="' + paC(y1) + '" x2="' + paC(x2 - 6 * Math.cos(a)) + '" y2="' + paC(y2 - 6 * Math.sin(a)) + '"/><polygon class="fpt" points="' + paC(x2) + ',' + paC(y2) + ' ' + p(0.42) + ' ' + p(-0.42) + '"/>';
}
/* a programme de calcul drawn as boxes: top → two columns (left, right) → merged steps */
function paFlow(top, left, right, merge, label) {
  const CW = 7.7, BH = 28, GAP = 18, cx = 170, cl = 86, cr = 254;
  const box = (x, y, t) => { const w = Math.min(334, t.length * CW + 22), x0 = paC(x - w / 2); return '<rect class="ffill" x="' + x0 + '" y="' + y + '" width="' + paC(w) + '" height="' + BH + '" rx="6"/><rect class="fl" x="' + x0 + '" y="' + y + '" width="' + paC(w) + '" height="' + BH + '" rx="6"/><text class="ftx" x="' + x + '" y="' + (y + 19) + '" text-anchor="middle">' + paEsc(t) + '</text>'; };
  const y0 = 2 + BH + GAP;
  const col = (c, items) => { let y = y0, o = ''; items.forEach((t, i) => { o += (i ? paArrow(c, y - GAP, c, y) : paArrow(cx, 2 + BH, c, y)) + box(c, y, t); y += BH + GAP; }); return { o, end: y - GAP }; };
  const A = col(cl, left), B = col(cr, right);
  let y = Math.max(A.end, B.end) + GAP, s = box(cx, 2, top) + A.o + B.o + paArrow(cl, A.end, cx - 14, y) + paArrow(cr, B.end, cx + 14, y);
  merge.forEach((t, i) => { if (i) s += paArrow(cx, y - GAP, cx, y); s += box(cx, y, t); y += BH + GAP; });
  return svgFig(340, y - GAP + 3, s, label);
}
/* a polyline cut where it leaves the top of the frame (the curves here never go down) */
function paClip(pts, ymax) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; if (y1 <= ymax + 1e-9) { out.push(pts[i]); continue; } out.push([x0 + (ymax - y0) / (y1 - y0) * (x1 - x0), ymax]); break; }
  return out;
}
/* a graph with a grid: o = { xmax, ymax, xg, yg (grid), xt, yt (numbers), xn, yn (axis names), curves: [{ pts, cls, dash, lab }], label } */
function paPlot(o) {
  const L0 = 42, T0 = 26, PW = 262, PH = 210, H = T0 + PH + 44;
  const X = x => L0 + x / o.xmax * PW, Y = y => T0 + PH - y / o.ymax * PH;
  let s = '';
  for (let x = o.xg; x < o.xmax + 1e-9; x += o.xg) s += '<line class="fgrid" x1="' + paC(X(x)) + '" y1="' + T0 + '" x2="' + paC(X(x)) + '" y2="' + (T0 + PH) + '"/>';
  for (let y = o.yg; y < o.ymax + 1e-9; y += o.yg) s += '<line class="fgrid" x1="' + L0 + '" y1="' + paC(Y(y)) + '" x2="' + (L0 + PW) + '" y2="' + paC(Y(y)) + '"/>';
  s += '<line class="fax" x1="' + L0 + '" y1="' + (T0 + PH) + '" x2="' + (L0 + PW + 6) + '" y2="' + (T0 + PH) + '"/><line class="fax" x1="' + L0 + '" y1="' + (T0 + PH) + '" x2="' + L0 + '" y2="' + (T0 - 6) + '"/>';
  for (let x = 0; x < o.xmax + 1e-9; x += o.xt) s += '<text class="ftm" x="' + paC(X(x)) + '" y="' + (T0 + PH + 17) + '" text-anchor="middle">' + x + '</text>';
  for (let y = 0; y < o.ymax + 1e-9; y += o.yt) s += '<text class="ftm" x="' + (L0 - 5) + '" y="' + paC(Y(y) + 4.5) + '" text-anchor="end">' + y + '</text>';
  s += '<text class="ftx" x="' + (L0 + PW) + '" y="' + (H - 4) + '" text-anchor="end">' + o.xn + '</text><text class="ftx" x="2" y="15">' + o.yn + '</text>';
  o.curves.forEach(c => {
    const pts = paClip(c.pts, o.ymax), e = pts[pts.length - 1], top = e[1] >= o.ymax - 1e-9;
    s += '<polyline class="' + c.cls + '"' + (c.dash ? ' style="stroke-dasharray:8 5"' : '') + ' points="' + pts.map(([x, y]) => paC(X(x)) + ',' + paC(Y(y))).join(' ') + '"/>';
    s += '<text class="ftx" x="' + paC(top ? X(e[0]) : L0 + PW + 5) + '" y="' + paC(top ? T0 - 9 : Y(e[1]) + 5) + '"' + (top ? ' text-anchor="middle"' : '') + '>' + c.lab + '</text>';
  });
  return svgFig(340, H, s, o.label);
}
/* Scratch 3 blocks with French labels (the only figures with their own colours)
   a line: { k: 'hat' | 'c' | 'else' | 'end' | (stack block), d: depth, c: category, n: line number, p: parts }
   parts: 'text' · {flag:1} · {n:'100'} white input · {bl:'A'} blank to fill · {dd:'prix'} dropdown · {v:'prix'} variable · {sv:'réponse'} sensing reporter · {op:[…]} operator · {bo:[…]} condition */
const PA_SC = { ev: ['#FFBF00', '#CC9900'], ctl: ['#FFAB19', '#CF8B17'], sns: ['#5CB1D6', '#2E8EB8'], op: ['#59C059', '#389438'], vr: ['#FF8C1A', '#DB6E00'], lk: ['#9966FF', '#774DCB'] };
function paScratch(lines, label) {
  const FS = 13, CW = 7.35, IND = 16, LN = lines.some(l => l.n) ? 24 : 4;
  const tw = t => String(t).length * CW;
  const st = (f, s, x) => ' style="fill:' + f + ';stroke:' + (s || 'none') + ';stroke-width:1' + (x || '') + '"';
  const tx = (x, y, t, col, mid, wt) => '<text x="' + paC(x) + '" y="' + paC(y + 4.6) + '"' + (mid ? ' text-anchor="middle"' : '') + ' style="fill:' + col + ';stroke:none;font-size:' + FS + 'px;font-family:Helvetica,Arial,sans-serif;font-weight:' + (wt || 500) + '">' + paEsc(t) + '</text>';
  const pill = (x, cy, w, f, s, rx, x2) => '<rect x="' + paC(x) + '" y="' + paC(cy - 11) + '" width="' + paC(w) + '" height="22" rx="' + (rx == null ? 11 : rx) + '"' + st(f, s, x2) + '/>';
  const meas = p => {
    if (typeof p === 'string') return { w: tw(p), h: 16 };
    if (p.flag) return { w: 20, h: 18 };
    if (p.n != null) return { w: Math.max(26, tw(p.n) + 16), h: 22 };
    if (p.bl) return { w: 30, h: 22 };
    if (p.dd) return { w: tw(p.dd) + 26, h: 22 };
    if (p.v != null || p.sv != null) return { w: tw(p.v != null ? p.v : p.sv) + 18, h: 22 };
    const ps = (p.op || p.bo).map(meas);
    return { w: ps.reduce((s, q) => s + q.w, 0) + 5 * (ps.length - 1) + (p.bo ? 26 : 16), h: Math.max(...ps.map(q => q.h)) + 6 };
  };
  const draw = (p, x, cy, cat) => {
    const m = meas(p);
    if (typeof p === 'string') return tx(x, cy, p, '#FFFFFF');
    if (p.flag) return '<path d="M' + paC(x + 4) + ' ' + paC(cy + 8) + 'V' + paC(cy - 8) + '"' + st('none', '#45993D', ';stroke-width:2') + '/><path d="M' + paC(x + 4) + ' ' + paC(cy - 8) + 'q4 -3 8 0t8 0v8q-4 -3 -8 0t-8 0z"' + st('#4CBF56', '#45993D') + '/>';
    if (p.n != null) return pill(x, cy, m.w, '#FFFFFF', '#C8CCD6') + tx(x + m.w / 2, cy, p.n, '#575E75', true, 500);
    if (p.bl) return pill(x, cy, m.w, '#FFFFFF', '#575E75', 11, ';stroke-dasharray:3 2') + tx(x + m.w / 2, cy, p.bl, '#C0392B', true, 700);
    if (p.dd) return pill(x, cy, m.w, PA_SC[cat][1], PA_SC[cat][1], 4) + tx(x + 8, cy, p.dd + ' ▾', '#FFFFFF');
    if (p.v != null || p.sv != null) { const c = p.v != null ? PA_SC.vr : PA_SC.sns; return pill(x, cy, m.w, c[0], c[1]) + tx(x + m.w / 2, cy, p.v != null ? p.v : p.sv, '#FFFFFF', true); }
    const c = PA_SC.op, h = m.h;
    let s = p.bo ? '<polygon points="' + [[x, cy], [x + h / 2, cy - h / 2], [x + m.w - h / 2, cy - h / 2], [x + m.w, cy], [x + m.w - h / 2, cy + h / 2], [x + h / 2, cy + h / 2]].map(q => paC(q[0]) + ',' + paC(q[1])).join(' ') + '"' + st(c[0], c[1]) + '/>'
      : '<rect x="' + paC(x) + '" y="' + paC(cy - h / 2) + '" width="' + paC(m.w) + '" height="' + h + '" rx="' + (h / 2) + '"' + st(c[0], c[1]) + '/>';
    let xx = x + (p.bo ? 13 : 8);
    (p.op || p.bo).forEach(q => { s += draw(q, xx, cy, 'op'); xx += meas(q).w + 5; });
    return s;
  };
  const rows = lines.map(l => {
    const ps = (l.p || []).map(meas), cw = ps.reduce((s, q) => s + q.w, 0) + 6 * Math.max(0, ps.length - 1) + 18;
    return { l, w: l.k === 'end' ? 64 : Math.max(l.k === 'c' || l.k === 'else' ? 80 : 40, cw), h: l.k === 'end' ? 14 : Math.max(l.k === 'hat' ? 34 : 30, Math.max(16, ...ps.map(q => q.h)) + 10) };
  });
  let y = 4, arms = '', blocks = '';
  rows.forEach(rw => { rw.x = LN + rw.l.d * IND; rw.y = y; y += rw.h; });
  rows.forEach((rw, i) => {
    const col = PA_SC[rw.l.c], cy = rw.y + rw.h / 2;
    if (rw.l.k === 'c') { const e = rows.find((q, j) => j > i && q.l.k === 'end' && q.l.d === rw.l.d); arms += '<rect x="' + rw.x + '" y="' + rw.y + '" width="' + (IND + 2) + '" height="' + (e.y + e.h - rw.y) + '" rx="4"' + st(col[0], col[1]) + '/>'; }
    blocks += '<rect x="' + rw.x + '" y="' + rw.y + '" width="' + paC(rw.w) + '" height="' + rw.h + '" rx="' + (rw.l.k === 'hat' ? 12 : 4) + '"' + st(col[0], col[1]) + '/>';
    let xx = rw.x + 9;
    (rw.l.p || []).forEach(p => { blocks += draw(p, xx, cy, rw.l.c); xx += meas(p).w + 6; });
    if (rw.l.n) blocks += '<text x="' + (LN - 7) + '" y="' + paC(cy + 4.5) + '" text-anchor="end" style="fill:#8A8F99;stroke:none;font-size:12px;font-family:Helvetica,Arial,sans-serif">' + rw.l.n + '</text>';
  });
  return svgFig(Math.ceil(Math.max(336, ...rows.map(rw => rw.x + rw.w)) + 4), Math.ceil(y + 4), arms + blocks, label);   /* at least 340 wide: every program is drawn at the same scale */
}

/* =====================================================================================================
   NOMBRES ET CALCULS
   ===================================================================================================== */

/* ---------- p2.sachets : diviseurs communs, décomposition en facteurs premiers, nombre maximal de sachets ---------- */
const PA_GOUTS = [['à la fraise', 'с клубникой'], ['au caramel', 'с карамелью'], ['à la menthe', 'с мятой'], ['au citron', 'с лимоном'], ['à l\'orange', 'с апельсином']];
paProb({ id: 'p2.sachets', ch: 'nc', lvl: 2, pts: 4,
  ru: 'Пакетики с конфетами', fr: 'Des sachets de bonbons',
  src: 'Métropole 2026 · exercice 4',
  gen(r) {
    const [G1, G2] = r.sh(PA_GOUTS);
    let g, a, b, A, B;
    do { g = r.pick([12, 14, 18, 20, 21, 24, 28, 30, 36]); a = r.ri(2, 9); b = r.ri(2, 9); A = g * a; B = g * b; }
    while (a === b || gcd(a, b) !== 1 || Math.min(A, B) < 60 || Math.max(A, B) > 400);
    const yesK = factorsOf(g).filter(d => d > 2 && d < g), noK = factorsOf(A).filter(d => d >= 4 && d <= 60 && d < A && B % d);   /* d < A: «un sachet par bonbon» is not a question */
    const yes = !noK.length || r() < 0.45, k = r.pick(yes ? yesK : noK), q = Math.floor(B / k), rest = B % k;
    const nS = n => n + ' ' + paPl(n, ['пакетик', 'пакетика', 'пакетиков']);
    const com = paPf([A, B]);
    const ctx = L('Une confiserie prépare des sachets avec ' + A + ' bonbons ' + G1[0] + ' et ' + B + ' bonbons ' + G2[0] + '. Tous les sachets doivent avoir la même composition : le même nombre de bonbons ' + G1[0] + ' et le même nombre de bonbons ' + G2[0] + '. Aucun bonbon ne doit rester.',
      'Кондитерская раскладывает по пакетикам конфеты: ' + G1[1] + ' — ' + A + ' шт., ' + G2[1] + ' — ' + B + ' шт. Все пакетики должны быть одинаковыми: в каждом одно и то же число конфет ' + G1[1] + ' и одно и то же число конфет ' + G2[1] + '. Ни одной конфеты не должно остаться.');
    const opts = yes ? [
      L('Oui, car ' + k + ' divise ' + A + ' et ' + B + ' : ' + A + ' = ' + k + ' × ' + (A / k) + ' et ' + B + ' = ' + k + ' × ' + (B / k) + '.', 'Да, потому что и ' + A + ', и ' + B + ' делятся на ' + k + ': ' + A + ' = ' + k + ' × ' + (A / k) + ' и ' + B + ' = ' + k + ' × ' + (B / k) + '.'),
      L('Oui, car ' + k + ' divise le nombre total de bonbons, ' + (A + B) + '.', 'Да, потому что ' + k + ' делит общее число конфет — ' + (A + B) + '.'),
      L('Non, car ' + k + ' n\'est pas le plus grand diviseur commun de ' + A + ' et ' + B + '.', 'Нет, потому что ' + k + ' — не наибольший общий делитель чисел ' + A + ' и ' + B + '.'),
      L('Non, car chaque sachet devrait contenir autant de bonbons ' + G1[0] + ' que de bonbons ' + G2[0] + '.', 'Нет, потому что в каждом пакетике должно быть поровну конфет ' + G1[1] + ' и ' + G2[1] + '.')]
      : [
      L('Non, car ' + B + ' n\'est pas divisible par ' + k + ' : ' + B + ' = ' + k + ' × ' + q + ' + ' + rest + ', il resterait ' + rest + ' bonbon' + (rest > 1 ? 's ' : ' ') + G2[0] + '.', 'Нет, потому что ' + B + ' не делится на ' + k + ': ' + B + ' = ' + k + ' × ' + q + ' + ' + rest + ' — конфеты ' + G2[1] + ' не разложить поровну.'),
      L('Oui, car ' + k + ' divise ' + A + ' : ' + A + ' = ' + k + ' × ' + (A / k) + '.', 'Да, потому что ' + A + ' делится на ' + k + ': ' + A + ' = ' + k + ' × ' + (A / k) + '.'),
      L('Oui, car ' + k + ' est plus petit que ' + A + ' et que ' + B + '.', 'Да, потому что ' + k + ' меньше и ' + A + ', и ' + B + '.'),
      L('Non, car ' + A + ' et ' + B + ' ne sont pas multiples l\'un de l\'autre.', 'Нет, потому что ни одно из чисел ' + A + ' и ' + B + ' не делится на другое.')];
    return { ctx, qs: [
      { q: L('Peut-on constituer ' + k + ' sachets ? Choisir la réponse correctement justifiée.', 'Можно ли сделать ' + nS(k) + '? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, opts, 0), sol: [
          'Конфеты каждого вида раскладываем поровну по ' + k + ' пакетикам, и ни одной не должно остаться. Значит, на ' + k + ' должно делиться без остатка каждое из чисел ' + A + ' и ' + B + ' — каждое отдельно.',
          ['Проверяем оба числа:', A + '÷' + k + '=' + (A / k) + ';' + (yes ? B + '÷' + k + '=' + (B / k) : B + '=' + k + '*' + q + '+' + rest)],
          yes ? 'Оба деления без остатка — значит, ' + nS(k) + ' сделать можно; в каждом пакетике: ' + G1[1] + ' — ' + (A / k) + ', ' + G2[1] + ' — ' + (B / k) + '.' : 'Второе деление даёт остаток ' + rest + ' — значит, ' + nS(k) + ' сделать нельзя.',
          yes ? 'Почему другие ответы неверны: делимость общего числа конфет ничего не гарантирует — каждый вид делят отдельно; наибольший общий делитель нужен только для вопроса о максимуме, делитель поменьше тоже годится; а поровну конфет двух видов в пакетике быть не обязано.'
            : 'Почему другие ответы неверны: проверить одно число мало — делиться должны оба; то, что ' + k + ' меньше обоих чисел, ничего не говорит о делимости; а то, что ' + A + ' и ' + B + ' не кратны друг другу, к вопросу не относится.'],
        redac: ['Tous les bonbons doivent être utilisés : le nombre de sachets doit diviser à la fois ' + A + ' et ' + B + '.',
          yes ? '$' + A + '=' + k + '*' + (A / k) + '$ et $' + B + '=' + k + '*' + (B / k) + '$, donc ' + k + ' divise ' + A + ' et ' + B + '.'
            : '$' + B + '=' + k + '*' + q + '+' + rest + '$ : le reste de la division euclidienne de ' + B + ' par ' + k + ' n\'est pas nul, donc ' + k + ' ne divise pas ' + B + '.',
          yes ? 'Oui, on peut constituer ' + k + ' sachets : chacun contiendra ' + (A / k) + ' bonbons ' + G1[0] + ' et ' + (B / k) + ' bonbons ' + G2[0] + '.'
            : 'Non, on ne peut pas constituer ' + k + ' sachets : il resterait ' + paS(rest, 'bonbon') + ' ' + G2[0] + '.'] },
      { q: L('La décomposition en produit de facteurs premiers de ' + A + ' est $' + paDec(A) + '$. Donner la décomposition en produit de facteurs premiers de ' + B + '.', 'Разложение числа ' + A + ' на простые множители: $' + paDec(A) + '$. Разложи на простые множители число ' + B + '.'),
        ans: XP(paDec(B), { forms: ['primeFact'] }), sol: [
          'Делим ' + B + ' на простые числа по порядку (2, 3, 5, 7, …), пока частное само не станет простым:',
          ['', paChain(B)],
          ['Собираем все множители; одинаковые записываем степенью:', B + '=' + paDec(B)],
          'Проверка: перемножь множители — должно снова получиться ' + B + '.'],
        redac: [paEqs(paChain(B)), 'La décomposition de ' + B + ' en produit de facteurs premiers est $' + paDec(B) + '$.'] },
      { q: L('Quel nombre maximal de sachets pourra-t-on constituer ?', 'Какое наибольшее число пакетиков можно сделать?'), ans: N(g), sol: [
          'Из вопроса 1: число пакетиков должно делить и ' + A + ', и ' + B + '. Самое большое такое число — наибольший общий делитель («PGCD»).',
          ['Разложения на простые множители:', A + '=' + paDec(A) + ';' + B + '=' + paDec(B)],
          ['Берём общие простые множители в наименьшей из двух степеней (на большую степень одно из чисел уже не делится):', pfStr(com) + '=' + g],
          'Значит, наибольшее число пакетиков — ' + g + '.'],
        redac: ['Le nombre de sachets doit diviser à la fois ' + A + ' et ' + B + ' : le plus grand nombre possible est le plus grand diviseur commun de ' + A + ' et ' + B + '.',
          '$' + A + '=' + paDec(A) + '$ et $' + B + '=' + paDec(B) + '$.',
          'Le plus grand diviseur commun est le produit des facteurs premiers communs : $' + pfStr(com) + '=' + g + '$.',
          'On pourra constituer au maximum ' + g + ' sachets.'] },
      { q: L('Quelle sera alors la composition de chaque sachet ?', 'Сколько конфет каждого вида будет тогда в одном пакетике?'),
        ans: multi([L('bonbons ' + G1[0] + ' :', 'конфет ' + G1[1] + ':'), N(a)], [L('bonbons ' + G2[0] + ' :', 'конфет ' + G2[1] + ':'), N(b)]), sol: [
          ['Каждое количество делим на число пакетиков, ' + g + ':', A + '÷' + g + '=' + a + ';' + B + '÷' + g + '=' + b],
          'Проверка: ' + g + ' × ' + a + ' = ' + A + ' и ' + g + ' × ' + b + ' = ' + B + ' — все конфеты использованы.'],
        redac: ['$' + A + '÷' + g + '=' + a + '$ et $' + B + '÷' + g + '=' + b + '$.',
          'Chaque sachet contiendra ' + a + ' bonbons ' + G1[0] + ' et ' + b + ' bonbons ' + G2[0] + '.'] },
      { q: L('Remettre dans l\'ordre les étapes de la recherche du nombre maximal de sachets.', 'Расставь по порядку шаги поиска наибольшего числа пакетиков.'), red: true,
        ans: ORD(r, [
          L('Tous les sachets ont la même composition et aucun bonbon ne reste : le nombre de sachets est un diviseur commun de ' + A + ' et de ' + B + '.', 'Все пакетики одинаковые, и ни одной конфеты не остаётся: число пакетиков — общий делитель чисел ' + A + ' и ' + B + '.'),
          L('On décompose ' + A + ' et ' + B + ' en produits de facteurs premiers : $' + A + '=' + paDec(A) + '$ et $' + B + '=' + paDec(B) + '$.', 'Раскладываем ' + A + ' и ' + B + ' на простые множители: $' + A + '=' + paDec(A) + '$ и $' + B + '=' + paDec(B) + '$.'),
          L('Le produit des facteurs premiers communs donne le plus grand diviseur commun : $' + pfStr(com) + '=' + g + '$.', 'Произведение общих простых множителей даёт наибольший общий делитель: $' + pfStr(com) + '=' + g + '$.'),
          L('On peut donc constituer au maximum ' + g + ' sachets, contenant chacun ' + a + ' bonbons ' + G1[0] + ' et ' + b + ' bonbons ' + G2[0] + '.', 'Значит, можно сделать самое большее ' + g + ' ' + paPl(g, ['пакетик', 'пакетика', 'пакетиков']) + '; в каждом: ' + G1[1] + ' — ' + a + ', ' + G2[1] + ' — ' + b + '.')]),
        sol: ['Сначала — условие задачи (почему число пакетиков — общий делитель), потом инструмент (разложение на множители), потом вывод (НОД) и ответ на вопрос.'] }] };
  } });

/* ---------- p2.paniers : PGCD de trois nombres, reste d'une division, multiple dans un intervalle ---------- */
paProb({ id: 'p2.paniers', ch: 'nc', lvl: 2, pts: 4,
  ru: 'Корзины с овощами', fr: 'Des paniers de légumes',
  src: 'Nouvelle-Calédonie 2023 · exercice 2',
  gen(r) {
    const nm = r.pick(PRENOMS_M);
    let g, m, s1, c1, v, S, C, V;
    do { g = r.pick([2, 3, 4, 5, 6]); m = r.pick([7, 11, 13]); s1 = r.ri(1, 3); c1 = r.ri(2, 5); v = r.ri(5, 31); S = g * m * s1; C = g * m * c1; V = g * v; }
    while (s1 === c1 || gcd(v, m) !== 1 || gcd(gcd(s1, c1), v) !== 1 || V < 30 || V > 160 || C > 300 || gcd(gcd(S, C), V) !== g);
    const qv = Math.floor(V / m), rr = V % m;
    const T = m * r.ri(Math.ceil(95 / m), Math.floor(145 / m)), hi = T + r.ri(1, m - 2), lo = hi - r.pick([12, 15]);
    const mult = []; for (let t = Math.ceil(lo / m) * m; t <= hi; t += m) mult.push(t);
    const nK = n => n + ' ' + paPl(n, ['корзину', 'корзины', 'корзин']);
    const ctx = L('Un maraîcher, ' + nm + ', compose des paniers de légumes avec sa récolte : ' + S + ' salades, ' + C + ' carottes et ' + V + ' aubergines. Tous les paniers doivent être identiques, et tous les légumes doivent être utilisés.',
      'Фермер ' + nm + ' собирает из урожая корзины с овощами: салат — ' + S + ' шт., морковь — ' + C + ' шт., баклажаны — ' + V + ' шт. Все корзины должны быть одинаковыми, и использовать нужно все овощи.');
    const pg = paPf([S, C, V]);
    return { ctx, qs: [
      { q: L('La décomposition de ' + S + ' en produit de facteurs premiers est $' + paDec(S) + '$. Décomposer ' + C + ' et ' + V + ' en produits de facteurs premiers.', 'Разложение ' + S + ' на простые множители: $' + paDec(S) + '$. Разложи на простые множители ' + C + ' и ' + V + '.'),
        ans: multi([C + ' =', XP(paDec(C), { forms: ['primeFact'] })], [V + ' =', XP(paDec(V), { forms: ['primeFact'] })]), sol: [
          'Делим на простые числа по порядку (2, 3, 5, 7, 11, 13, …), пока частное не станет простым:',
          ['', paChain(C)], ['', C + '=' + paDec(C)],
          ['', paChain(V)], ['', V + '=' + paDec(V)]],
        redac: [paDecFr(C), paDecFr(V)] },
      { q: L('En déduire le nombre maximal de paniers que ' + nm + ' peut préparer.', 'Выведи отсюда наибольшее число корзин, которое может собрать ' + nm + '.'), ans: N(g), sol: [
          'Корзины одинаковые и все овощи использованы — значит, число корзин делит каждое из трёх чисел. Наибольшее такое число — наибольший общий делитель трёх чисел («PGCD»).',
          ['Разложения:', S + '=' + paDec(S) + ';' + C + '=' + paDec(C) + ';' + V + '=' + paDec(V)],
          isPrimeN(g) ? 'Во всех трёх разложениях есть только один общий простой множитель — ' + g + ' (остальные встречаются не везде). Значит, наибольшее число корзин — ' + g + '.'
            : ['Множители, которые есть во всех трёх разложениях, в наименьшей степени:', pfStr(pg) + '=' + g]],
        redac: ['Tous les paniers sont identiques et tous les légumes sont utilisés : le nombre de paniers est un diviseur commun de ' + S + ', ' + C + ' et ' + V + '.',
          '$' + S + '=' + paDec(S) + '$ ; $' + C + '=' + paDec(C) + '$ ; $' + V + '=' + paDec(V) + '$.',
          isPrimeN(g) ? 'Le seul facteur premier commun aux trois décompositions est ' + g + ' : le plus grand diviseur commun de ces trois nombres est ' + g + '.'
            : 'Le plus grand diviseur commun de ces trois nombres est le produit des facteurs premiers communs : $' + pfStr(pg) + '=' + g + '$.',
          nm + ' peut préparer au maximum ' + g + ' paniers.'] },
      { q: L('Combien de salades, de carottes et d\'aubergines y aurait-il alors dans chaque panier ?', 'Сколько салата, моркови и баклажанов было бы тогда в каждой корзине?'),
        ans: multi([L('salades :', 'салат:'), N(S / g)], [L('carottes :', 'морковь:'), N(C / g)], [L('aubergines :', 'баклажаны:'), N(V / g)]), sol: [
          ['Делим каждое количество на ' + g + ':', S + '÷' + g + '=' + (S / g) + ';' + C + '÷' + g + '=' + (C / g) + ';' + V + '÷' + g + '=' + (V / g)]],
        redac: [paEqs(S + '÷' + g + '=' + (S / g) + ';' + C + '÷' + g + '=' + (C / g) + ';' + V + '÷' + g + '=' + (V / g)),
          'Il y aurait ' + (S / g) + ' salades, ' + (C / g) + ' carottes et ' + (V / g) + ' aubergines dans chaque panier.'] },
      { q: L('Finalement, ' + nm + ' décide de préparer ' + m + ' paniers. Combien d\'aubergines ne seront pas utilisées ? Combien doit-il en cueillir au minimum en plus pour pouvoir toutes les utiliser ?',
          'В итоге ' + nm + ' решает собрать ' + nK(m) + '. Сколько баклажанов останется неиспользованными? Сколько баклажанов ему нужно собрать дополнительно (как минимум), чтобы использовать все?'),
        ans: multi([L('non utilisées :', 'не используются:'), N(rr)], [L('à cueillir en plus :', 'собрать ещё:'), N(m - rr)]), sol: [
          'Салат (' + S + ') и морковь (' + C + ') делятся на ' + m + ' — с ними всё в порядке. Баклажаны — нет:',
          ['Деление с остатком:', V + '=' + m + '*' + qv + '+' + rr],
          'В каждую корзину кладём по ' + qv + ', остаток ' + rr + ' — эти баклажаны не используются.',
          ['Чтобы использовать все, их число должно делиться на ' + m + '. Ближайшее кратное ' + m + ', большее ' + V + ':', m + '*' + (qv + 1) + '=' + (m * (qv + 1))],
          ['Не хватает:', (m * (qv + 1)) + '-' + V + '=' + (m - rr)]],
        redac: ['On effectue la division euclidienne de ' + V + ' par ' + m + ' : $' + V + '=' + m + '*' + qv + '+' + rr + '$.',
          'Avec ' + qv + ' aubergines par panier, ' + (rr > 1 ? rr + ' aubergines ne seront pas utilisées.' : 'une aubergine ne sera pas utilisée.'),
          'Le multiple de ' + m + ' qui suit ' + V + ' est $' + m + '*' + (qv + 1) + '=' + (m * (qv + 1)) + '$, et $' + (m * (qv + 1)) + '-' + V + '=' + (m - rr) + '$.',
          'Il doit cueillir au minimum ' + paS(m - rr, 'aubergine') + ' en plus.'] },
      { q: L(nm + ' veut aussi mettre des tomates dans ses ' + m + ' paniers. Il estime qu\'il en a entre ' + lo + ' et ' + hi + ' prêtes à être récoltées. Pourquoi le nombre de tomates cueillies doit-il être un multiple de ' + m + ' ? Choisir la bonne justification.',
          nm + ' хочет положить в ' + m + ' корзин ещё и помидоры. По его оценке, созревших помидоров от ' + lo + ' до ' + hi + '. Почему число собранных помидоров должно быть кратно ' + m + '? Выбери верное обоснование.'), red: true,
        ans: MQ(r, [
          L('Chacun des ' + m + ' paniers doit contenir le même nombre de tomates, et aucune tomate cueillie ne doit être perdue.', 'В каждой из ' + m + ' корзин должно быть одинаковое число помидоров, и ни один собранный помидор не должен пропасть.'),
          L('Parce que ' + m + ' est un nombre premier.', 'Потому что ' + m + ' — простое число.'),
          L('Parce que le nombre de tomates doit être un diviseur de ' + m + '.', 'Потому что число помидоров должно быть делителем ' + m + '.'),
          L('Parce que le nombre de tomates doit être un multiple de ' + g + ', le nombre maximal de paniers trouvé à la question 2.', 'Потому что число помидоров должно быть кратно ' + g + ' — наибольшему числу корзин из вопроса 2.')], 0), sol: [
          'Если в каждой из ' + m + ' корзин по t помидоров, то всего их ' + m + ' × t — это и есть кратное ' + m + '. И наоборот: кратное ' + m + ' делится на ' + m + ' корзин поровну без остатка.',
          'Делитель ' + m + ' — это, наоборот, число, на которое делится ' + m + ' (их всего два: 1 и ' + m + '). Простота числа ' + m + ' здесь ни при чём. А наибольшее число корзин (' + g + ') относилось к другой раскладке — теперь корзин ' + m + '.'],
        redac: ['Les ' + m + ' paniers doivent contenir le même nombre de tomates et aucune tomate cueillie ne doit rester.',
          'Le nombre de tomates cueillies est donc égal à ' + m + ' fois le nombre de tomates par panier : c\'est un multiple de ' + m + '.'] },
      { q: L('Combien de tomates doit-il cueillir au maximum pour éviter les pertes et pour que chaque panier ait toujours la même composition ?', 'Какое наибольшее число помидоров ему нужно собрать, чтобы ничего не пропало и все корзины остались одинаковыми?'), ans: N(T), sol: [
          'Ищем кратные ' + m + ' между ' + lo + ' и ' + hi + ' (вопрос 5): ' + mult.join(', ') + '.',
          'Нужно «как можно больше» — берём наибольшее: ' + T + '. Тогда в каждой корзине будет по ' + (T / m) + ' помидоров.',
          'Следующее кратное, ' + (T + m) + ', уже больше ' + hi + ' — столько помидоров нет.'],
        redac: ['Le nombre de tomates doit être un multiple de ' + m + ' compris entre ' + lo + ' et ' + hi + '.',
          '$' + m + '*' + (T / m) + '=' + T + '$ et $' + m + '*' + (T / m + 1) + '=' + (T + m) + '$ ; or $' + (T + m) + '>' + hi + '$.',
          'Il doit cueillir au maximum ' + T + ' tomates, soit ' + (T / m) + ' tomates par panier.'] }] };
  } });

/* ---------- p2.ia-energie : conversions d'unités, écriture scientifique, quotient de puissances de 10 ---------- */
paProb({ id: 'p2.ia-energie', ch: 'nc', lvl: 2, pts: 4,
  ru: 'Электричество для искусственного интеллекта', fr: 'L\'électricité de l\'intelligence artificielle',
  src: 'Amérique du Nord 2026 · exercice 3',
  gen(r) {
    let X, Y, NFc, nC, yrs;
    do { X = r.pick([64000, 72000, 82000, 90000, 96000]); Y = r.pick([160000, 200000, 250000]); NFc = r.pick([6900, 7000, 7100, 7200]); nC = Math.round(X * 1e6 / Y); yrs = nC / NFc; }
    while (Math.abs(yrs - Math.floor(yrs) - 0.5) < 0.05);   /* never «62,5 ans» to round to the unit */
    const ia = X * 1e9, co = Y * 1e3, yr = Math.round(yrs);
    const sa = stdParts(ia), sc = stdParts(co), sx = stdParts(X), sy = stdParts(Y);
    const ctx = L('Une entreprise développe une intelligence artificielle (IA) qui consomme beaucoup d\'électricité. L\'énergie consommée s\'exprime en wattheures (Wh). On estime que la consommation annuelle de cette IA est de ' + nf(X) + ' gigawattheures (GWh). En comparaison, un collège consomme en moyenne ' + nf(Y) + ' kilowattheures (kWh) par an. Rappels : 1 kWh = $10^3$ Wh ; 1 GWh = $10^9$ Wh.',
      'Компания разрабатывает искусственный интеллект (ИИ), который потребляет много электричества. Энергию измеряют в ватт-часах (Вт·ч). По оценкам, этот ИИ потребляет за год ' + nf(X) + ' гигаватт-часов (ГВт·ч). Для сравнения: один коллеж потребляет в среднем ' + nf(Y) + ' киловатт-часов (кВт·ч) в год. Напоминание: 1 кВт·ч = $10^3$ Вт·ч; 1 ГВт·ч = $10^9$ Вт·ч.');
    return { ctx, qs: [
      { q: L('Convertir la consommation annuelle de l\'IA en wattheures. Donner le résultat en écriture scientifique.', 'Переведи годовое потребление ИИ в ватт-часы. Запиши результат в стандартном виде.'),
        ans: N(stdStr(ia), { forms: ['std'], unit: 'Wh' }), sol: [
          '1 ГВт·ч = $10^9$ Вт·ч, поэтому число гигаватт-часов умножаем на $10^9$.',
          ['Сначала записываем ' + nf(X) + ' в стандартном виде, потом перемножаем степени десятки (показатели складываются):', X + '*10^9=' + sx.a + '*10^' + sx.e + '*10^9=' + stdStr(ia)],
          'Стандартный вид («écriture scientifique») — это $a*10^n$, где $1≤a<10$; здесь $a=' + sa.a + '$.'],
        redac: ['On sait que 1 GWh = $10^9$ Wh.',
          nf(X) + ' GWh = ' + nf(X) + ' × $10^9$ Wh = $' + sx.a + '*10^' + sx.e + '*10^9$ Wh = $' + stdStr(ia) + '$ Wh.',
          'La consommation annuelle de l\'IA est de $' + stdStr(ia) + '$ Wh.'] },
      { q: L('Convertir la consommation annuelle d\'un collège en wattheures, en écriture scientifique.', 'Переведи годовое потребление одного коллежа в ватт-часы, в стандартном виде.'),
        ans: N(stdStr(co), { forms: ['std'], unit: 'Wh' }), sol: [
          '1 кВт·ч = $10^3$ Вт·ч, поэтому умножаем на $10^3$.',
          ['', Y + '*10^3=' + sy.a + '*10^' + sy.e + '*10^3=' + stdStr(co)]],
        redac: ['On sait que 1 kWh = $10^3$ Wh.',
          nf(Y) + ' kWh = ' + nf(Y) + ' × $10^3$ Wh = $' + sy.a + '*10^' + sy.e + '*10^3$ Wh = $' + stdStr(co) + '$ Wh.',
          'La consommation annuelle d\'un collège est de $' + stdStr(co) + '$ Wh.'] },
      { q: L('Pour savoir combien de collèges on pourrait alimenter pendant un an avec la consommation de l\'IA, quel calcul faut-il faire ? Choisir la proposition correctement justifiée.', 'Чтобы узнать, сколько коллежей можно целый год снабжать электричеством за счёт потребления ИИ, какое вычисление нужно сделать? Выбери вариант с верным обоснованием.'), red: true,
        ans: MQ(r, [
          L('Diviser la consommation de l\'IA par celle d\'un collège, toutes les deux en Wh : $' + stdStr(ia) + '÷(' + stdStr(co) + ')$.', 'Разделить потребление ИИ на потребление одного коллежа, оба в Вт·ч: $' + stdStr(ia) + '÷(' + stdStr(co) + ')$.'),
          L('Diviser ' + nf(X) + ' par ' + nf(Y) + ', car ce sont les deux consommations données dans l\'énoncé.', 'Разделить ' + nf(X) + ' на ' + nf(Y) + ', потому что это два потребления из условия.'),
          L('Multiplier la consommation de l\'IA par celle d\'un collège.', 'Умножить потребление ИИ на потребление коллежа.'),
          L('Diviser la consommation d\'un collège par celle de l\'IA.', 'Разделить потребление коллежа на потребление ИИ.')], 0), sol: [
          'Вопрос «сколько раз потребление одного коллежа помещается в потреблении ИИ» решается делением: потребление ИИ ÷ потребление коллежа.',
          'Но делить можно только величины в одних и тех же единицах: ' + nf(X) + ' — это ГВт·ч, а ' + nf(Y) + ' — кВт·ч, единица в миллион раз меньше. Поэтому сначала оба числа переводят в Вт·ч (вопросы 1 и 2).',
          'Произведение двух потреблений не имеет смысла, а деление в обратном порядке даёт крошечную долю одного коллежа, а не число коллежей.'],
        redac: ['On cherche combien de fois la consommation d\'un collège est contenue dans celle de l\'IA : on divise la consommation de l\'IA par celle d\'un collège.',
          'Les deux consommations doivent être exprimées dans la même unité, le wattheure : $' + stdStr(ia) + '÷(' + stdStr(co) + ')$.'] },
      { q: L('Combien de collèges pourrait-on alimenter pendant un an avec la consommation électrique annuelle de l\'IA ?', 'Сколько коллежей можно было бы снабжать электричеством в течение года за счёт годового потребления ИИ?'), ans: N(nC), sol: [
          ['Делим (оба числа в Вт·ч):', stdStr(ia) + '÷(' + stdStr(co) + ')'],
          ['Делим отдельно числа и отдельно степени десятки (показатели вычитаются):', '(' + sa.a + '÷' + sc.a + ')*10^(' + sa.e + '-' + sc.e + ')=' + fx(sa.a / sc.a) + '*10^' + (sa.e - sc.e) + '=' + nC],
          'Энергии ИИ хватило бы на год для ' + nf(nC) + ' коллежей.'],
        redac: ['$(' + stdStr(ia) + ')/(' + stdStr(co) + ')=' + sa.a + '/' + sc.a + '*10^(' + sa.e + '-' + sc.e + ')$',
          '$=' + fx(sa.a / sc.a) + '*10^' + (sa.e - sc.e) + '=' + nC + '$',
          'On pourrait alimenter ' + nf(nC) + ' collèges pendant un an.'] },
      { q: L('En France, il y a environ ' + NFc + ' collèges, qui consomment chacun en moyenne ' + nf(Y) + ' kWh par an. Pendant combien d\'années pourrait-on alimenter tous les collèges français avec la consommation annuelle de cette IA ? Arrondir à l\'unité.',
          'Во Франции около ' + NFc + ' коллежей, и каждый потребляет в среднем ' + nf(Y) + ' кВт·ч в год. Сколько лет можно было бы снабжать электричеством все коллежи Франции за счёт годового потребления этого ИИ? Округли до целых.'),
        ans: N(yr, { dp: 0 }), sol: [
          'Годовой энергии ИИ хватает на год для ' + nf(nC) + ' коллежей (вопрос 4). Во Франции их ' + NFc + ', и каждый потребляет столько же. Чем больше коллежей, тем на меньшее число лет хватит той же энергии: делим ' + nf(nC) + ' на ' + NFc + '.',
          ['', nC + '÷' + NFc + (paExact(yrs, 2) ? '=' + fx(yrs) : '≈' + paK(yrs, 2))],
          (Number.isInteger(yrs) ? 'Получается ровно ' : 'Округляем до целых: примерно ') + yr + ' ' + paPl(yr, ['год', 'года', 'лет']) + '.'],
        redac: ['Avec la consommation annuelle de l\'IA, on peut alimenter ' + nf(nC) + ' collèges pendant un an (question précédente).',
          'Pour ' + NFc + ' collèges : $' + nC + '÷' + NFc + paMid(yrs) + '$.',
          'On pourrait alimenter tous les collèges français pendant ' + (paExact(yrs, 0) ? '' : 'environ ') + yr + ' ans.'] }] };
  } });

/* =====================================================================================================
   PROPORTIONNALITÉ ET POURCENTAGES
   ===================================================================================================== */

/* ---------- p2.funiculaire : tarifs, pourcentage de réduction, vitesse moyenne, pente ---------- */
function paProfile(p, noPente) {   /* noPente: the same profile without the «pente p %» label */
  const yA = 118, yB = Math.round(yA - 164 * p / 100), D = [16, 160], A = [154, yA], B = [318, yB], C = [318, yA];
  return svgFig(340, 176, '<polyline class="fl" points="' + [D, A, B].map(q => q.join(',')).join(' ') + '"/>' +
    '<line class="fdash" x1="154" y1="' + yA + '" x2="318" y2="' + yA + '"/><line class="fdash" x1="318" y1="' + yA + '" x2="318" y2="' + yB + '"/>' +
    '<polyline class="fang" points="306,' + yA + ' 306,' + (yA - 12) + ' 318,' + (yA - 12) + '"/>' + [D, A, B, C].map(q => '<circle class="fpt" cx="' + q[0] + '" cy="' + q[1] + '" r="3"/>').join('') +
    '<text class="ftx" x="10" y="150">D</text><text class="ftx" x="148" y="110" text-anchor="end">A</text><text class="ftx" x="326" y="' + (yB + 6) + '">B</text><text class="ftx" x="326" y="' + (yA + 14) + '">C</text>' +
    (noPente ? '' : '<text class="ftm" x="236" y="' + Math.round((yA + yB) / 2 - 12) + '" text-anchor="end">pente ' + p + ' %</text>'), 'Profil du trajet du funiculaire');
}
paProb({ id: 'p2.funiculaire', ch: 'pp', lvl: 2, pts: 5,
  ru: 'Фуникулёр', fr: 'Le funiculaire',
  src: 'Amérique du Sud 2023 · exercice 4',
  gen(r) {
    const ia = r.pick([10, 11, 12]), ie = r.pick([7, 7.5, 8]), ga = ia - r.pick([1.5, 2]), ge = ie - r.pick([1, 1.5]);
    let nA, nE; do { nA = r.ri(10, 16); nE = r.ri(6, 12); } while (nA + nE < 20);
    const T1 = nA * ia + nE * ie, T2 = nA * ga + nE * ge, pct = (T1 - T2) / T1 * 100;
    let d, mm, ss, tt, v;
    do { d = r.pick([420, 448.5, 465, 480, 512, 540]); mm = r.ri(7, 10); ss = r.pick([5, 15, 20, 35, 45, 50]); tt = mm * 60 + ss; v = d / tt; } while (paExact(v, 2));
    const p = r.pick([20, 25, 40]), h = r.pick([40, 48, 50, 60, 64, 72, 80]), Lh = h * 100 / p;
    const pn = paNum(pct, 1, '%', 'Arrondir au dixième.', 'Округли до десятых.');
    const fig = paTbl([['', 'Tarif individuel', 'Tarif de groupe (dès 20 personnes)'], ['Aller simple adulte', eur(ia - 2), eur(ga - 1.5)], ['Aller-retour adulte', eur(ia), eur(ga)], ['Aller simple enfant', eur(ie - 1.5), eur(ge - 1.5)], ['Aller-retour enfant', eur(ie), eur(ge)]], 'side');
    const ctx = L('Un funiculaire est un moyen de transport sur rails, tiré par un câble, utilisé sur des lignes à forte pente. Le tableau donne ses tarifs : le tarif enfant est accordé aux enfants de 5 à 11 ans ; le tarif de groupe s\'applique à partir de 20 personnes (adultes et enfants).',
      'Фуникулёр — транспорт на рельсах, который тянет трос; его используют на крутых склонах. В таблице — тарифы: «Tarif individuel» — индивидуальный, «Tarif de groupe» — групповой (от 20 человек, взрослые и дети вместе), «aller simple» — в одну сторону, «aller-retour» — туда и обратно, «adulte» — взрослый, «enfant» — ребёнок (детский тариф — от 5 до 11 лет).');
    const dT = fx(T1 - T2);
    /* the calculation offered in an option, with a full-size fraction: an economy (T1 − T2) or a price over a price, × 100 */
    const fr3 = (n, dn) => '$$' + mi((n === T1 - T2 ? '(' + fx(T1) + '-' + fx(T2) + ')' : fx(n)) + '/' + fx(dn) + '*100', true) + '$$';
    return { ctx, fig, qs: [
      { q: L('Un groupe de ' + nA + ' adultes et ' + nE + ' enfants (âgés de 6 à 10 ans) fait un aller-retour en funiculaire. Quel est le prix à payer par le groupe avec le tarif individuel ?', 'Группа из ' + nA + ' взрослых и ' + nE + ' детей (от 6 до 10 лет) едет на фуникулёре туда и обратно. Сколько заплатит группа по индивидуальному тарифу?'),
        ans: N(fx(T1), { unit: '€' }), sol: [
          'Нужен столбец «Tarif individuel» и строки «aller-retour» (туда и обратно), а не «aller simple». Детям от 6 до 10 лет положен детский тариф: он действует для детей от 5 до 11 лет.',
          ['Взрослые по ' + eur(ia) + ', дети по ' + eur(ie) + ':', nA + '*' + fx(ia) + '+' + nE + '*' + fx(ie) + '=' + fx(T1), '€']],
        redac: ['Les enfants ont entre 6 et 10 ans : ils paient le tarif enfant.',
          '$' + nA + '*' + fx(ia) + '+' + nE + '*' + fx(ie) + '=' + fx(T1) + '$',
          'Avec le tarif individuel, le groupe paie ' + eur(T1) + '.'] },
      { q: L('Quel est le prix à payer par le groupe avec le tarif de groupe ?', 'Сколько заплатит группа по групповому тарифу?'), ans: N(fx(T2), { unit: '€' }), sol: [
          'В группе ' + (nA + nE) + ' человек — не меньше 20, значит, групповой тариф применим.',
          ['Взрослые по ' + eur(ga) + ', дети по ' + eur(ge) + ':', nA + '*' + fx(ga) + '+' + nE + '*' + fx(ge) + '=' + fx(T2), '€']],
        redac: ['Le groupe compte $' + nA + '+' + nE + '=' + (nA + nE) + '$ personnes : il y a au moins 20 personnes, donc le tarif de groupe s\'applique.',
          '$' + nA + '*' + fx(ga) + '+' + nE + '*' + fx(ge) + '=' + fx(T2) + '$',
          'Avec le tarif de groupe, le groupe paie ' + eur(T2) + '.'] },
      { q: L('Quel calcul donne le pourcentage de réduction obtenu avec le tarif de groupe par rapport au tarif individuel ? Choisir la bonne justification.', 'Какое вычисление даёт процент скидки группового тарифа по сравнению с индивидуальным? Выбери верное обоснование.'), red: true,
        ans: MQ(r, [
          L('On divise l\'économie réalisée par le prix au tarif individuel, puis on multiplie par 100 : ' + fr3(T1 - T2, T1), 'Делим экономию на цену по индивидуальному тарифу и умножаем на 100: ' + fr3(T1 - T2, T1)),
          L('On divise l\'économie réalisée par le prix au tarif de groupe, puis on multiplie par 100 : ' + fr3(T1 - T2, T2), 'Делим экономию на цену по групповому тарифу и умножаем на 100: ' + fr3(T1 - T2, T2)),
          L('On divise le prix au tarif de groupe par le prix au tarif individuel, puis on multiplie par 100 : ' + fr3(T2, T1), 'Делим цену по групповому тарифу на цену по индивидуальному и умножаем на 100: ' + fr3(T2, T1)),
          L('On calcule la différence entre les deux prix : $' + fx(T1) + '-' + fx(T2) + '$', 'Считаем разность двух цен: $' + fx(T1) + '-' + fx(T2) + '$')], 0), sol: [
          'Процент скидки показывает, какую часть исходной цены составляет экономия. Исходная цена — та, с которой сравнивают: здесь это индивидуальный тариф. Поэтому экономию делим именно на него.',
          'Деление на групповую цену — частая ошибка: тогда сравнивают с новой ценой, а не с исходной. Частное ' + fx(T2).replace('.', ',') + ' ÷ ' + fx(T1).replace('.', ',') + ' × 100 — это процент, который группа всё-таки платит, а не скидка. А разность цен — это экономия в евро, а не в процентах.'],
        redac: ['La réduction se calcule par rapport au prix de départ, c\'est-à-dire le prix au tarif individuel.',
          'On divise l\'économie réalisée par ce prix, puis on multiplie par 100 :',
          '$(' + fx(T1) + '-' + fx(T2) + ')/' + fx(T1) + '*100$'] },
      { q: L('Calculer ce pourcentage de réduction.' + pn.fr, 'Вычисли этот процент скидки.' + pn.ru), ans: pn.ans, sol: [
          ['Экономия группы:', fx(T1) + '-' + fx(T2) + '=' + dT, '€'],
          ['Её доля от индивидуальной цены, в процентах:', dT + '/' + fx(T1) + '*100' + pn.eq + (pn.eq === '=' ? fx(pct) : paK(pct, 1)), '%'],
          'Групповой тариф дешевле ' + (pn.eq === '=' ? 'на ' + nf(pct) : 'примерно на ' + paF(pct, 1)) + ' %.'],
        redac: ['Économie réalisée : $' + fx(T1) + '-' + fx(T2) + '=' + dT + '$ €.',
          '$' + dT + '/' + fx(T1) + '*100' + pn.eq + (pn.eq === '=' ? fx(pct) : paK(pct, 1)) + '$',
          'Le pourcentage de réduction est ' + (pn.eq === '=' ? 'de ' + nf(pct) : 'd\'environ ' + paF(pct, 1)) + ' %.'] },
      { q: L('Sur la première partie du trajet, [DA], le funiculaire parcourt ' + nf(d) + ' m en ' + mm + ' min ' + ss + ' s. Quelle est sa vitesse moyenne en mètres par seconde ? Arrondir au centième.', 'На первом участке пути, [DA], фуникулёр проезжает ' + nf(d) + ' м за ' + mm + ' мин ' + ss + ' с. Какова его средняя скорость в метрах в секунду? Округли до сотых.'),
        fig: paProfile(p, true), ans: N(paK(v, 2), { dp: 2, unit: 'm/s' }), sol: [
          ['Скорость нужна в м/с, поэтому время переводим в секунды (в минуте 60 с):', mm + '*60+' + ss + '=' + tt, 'с'],
          ['Средняя скорость = расстояние ÷ время:', fx(d) + '÷' + tt + '≈' + paK(v, 2), 'м/с'],
          'Осторожно: ' + mm + ' мин ' + ss + ' с — это не ' + nf(mm + ss / 100, 2) + ' мин. В минуте 60 секунд, а не 100, поэтому время целиком переводим в секунды.'],
        redac: [mm + ' min ' + ss + ' s = $' + mm + '*60+' + ss + '$ s = ' + tt + ' s.',
          '$v=d/t=' + fx(d) + '/' + tt + '≈' + paK(v, 2) + '$',
          'La vitesse moyenne du funiculaire est d\'environ ' + paF(v, 2) + ' m/s.'] },
      { q: L('Sur la dernière partie du trajet, [AB], la pente est de ' + p + ' % et le dénivelé BC est de ' + h + ' m. Calculer la longueur horizontale AC. On rappelle : pente = dénivelé ÷ longueur horizontale.', 'На последнем участке пути, [AB], уклон равен ' + p + ' %, а перепад высот BC — ' + h + ' м. Найди горизонтальную длину AC. Напоминание: уклон = перепад высот ÷ горизонтальная длина.'),
        fig: paProfile(p), ans: N(Lh, { unit: 'm' }), sol: [
          'Уклон ' + p + ' % означает: на каждые 100 м по горизонтали дорога поднимается на ' + p + ' м. Перепад ÷ горизонталь = ' + p + '/100 = ' + nf(p / 100) + '.',
          ['Значит, горизонтальная длина = перепад высот ÷ уклон:', h + '÷' + fx(p / 100) + '=' + Lh, 'м'],
          ['Проверка:', h + '÷' + Lh + '=' + fx(p / 100)],
          'Типичная ошибка — умножить ' + h + ' на ' + nf(p / 100) + ': получится ' + nf(h * p / 100) + ' м, меньше перепада высот, а при уклоне меньше 100 % горизонтальная длина всегда больше перепада.'],
        redac: ['On sait que pente = dénivelé ÷ longueur horizontale, donc :',
          '$' + p + '/100=' + h + '/AC$',
          '$AC=' + h + '*100÷' + p + '=' + Lh + '$',
          'La longueur horizontale AC est de ' + Lh + ' m.'] }] };
  } });

/* ---------- p2.karting : vitesse moyenne, conversion m/s → km/h, PPCM de deux durées ---------- */
paProb({ id: 'p2.karting', ch: 'pp', lvl: 2, pts: 4,
  ru: 'Картинг', fr: 'Une séance de karting',
  src: 'Polynésie 2023 · exercice 5',
  gen(r) {
    const PAIRS = [[60, 72], [48, 60], [54, 72], [60, 75], [56, 70], [64, 80], [50, 60], [45, 60], [72, 84], [70, 84], [63, 84]];
    let Lk, T1, T2, v1, v2, kmh;
    do { Lk = r.pick([945, 1045, 1120, 1210, 1280]); [T1, T2] = r.pick(PAIRS); v1 = Lk / T1; v2 = Lk / T2; kmh = v2 * 3.6; } while (Math.abs(kmh - 60) < 2 || paExact(v1, 2));
    const ok = kmh < 60, lcm = T1 / gcd(T1, T2) * T2, sp = paSec(lcm);
    const ctx = L('Sur un circuit de karting long de ' + nf(Lk) + ' m, un pilote professionnel boucle un tour en ' + T1 + ' secondes et un pilote amateur en ' + T2 + ' secondes.',
      'На картинговой трассе длиной ' + nf(Lk) + ' м профессиональный гонщик проходит круг за ' + T1 + ' с, а любитель — за ' + T2 + ' с.');
    const tKm = paFz(kmh, 1), tMs = paFz(v2, 2);
    return { ctx, qs: [
      { q: L('Calculer la vitesse moyenne du professionnel en m/s. Arrondir au centième.', 'Вычисли среднюю скорость профессионала в м/с. Округли до сотых.'), ans: N(paK(v1, 2), { dp: 2, unit: 'm/s' }), sol: [
          ['Средняя скорость = пройденное расстояние ÷ затраченное время. За один круг:', Lk + '÷' + T1 + '≈' + paK(v1, 2), 'м/с']],
        redac: ['Le professionnel parcourt ' + nf(Lk) + ' m en ' + T1 + ' s.',
          '$v=d/t=' + Lk + '/' + T1 + '≈' + paK(v1, 2) + '$',
          'La vitesse moyenne du professionnel est d\'environ ' + paF(v1, 2) + ' m/s.'] },
      { q: L('Pour des raisons de sécurité, les amateurs ne doivent pas dépasser 60 km/h de moyenne sur ce circuit. Cet amateur respecte-t-il cette règle ? Choisir la réponse correctement justifiée.', 'Из соображений безопасности любители не должны превышать на этой трассе 60 км/ч в среднем. Соблюдает ли этот любитель правило? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          ok ? L('Oui : sa vitesse moyenne est d\'environ ' + tMs + ' m/s, soit environ ' + tKm + ' km/h, ce qui ne dépasse pas 60 km/h.', 'Да: его средняя скорость около ' + tMs + ' м/с, то есть около ' + tKm + ' км/ч — не больше 60 км/ч.')
            : L('Non : sa vitesse moyenne est d\'environ ' + tMs + ' m/s, soit environ ' + tKm + ' km/h, ce qui dépasse 60 km/h.', 'Нет: его средняя скорость около ' + tMs + ' м/с, то есть около ' + tKm + ' км/ч — больше 60 км/ч.'),
          L('Oui : sa vitesse moyenne est d\'environ ' + tMs + ' m/s, et ' + tMs + ' est plus petit que 60.', 'Да: его средняя скорость около ' + tMs + ' м/с, а ' + tMs + ' меньше 60.'),
          L('Oui : il est plus lent que le professionnel, donc il ne dépasse pas 60 km/h.', 'Да: он медленнее профессионала, значит, не превышает 60 км/ч.'),
          L('On ne peut pas savoir, car sa vitesse change pendant le tour.', 'Нельзя узнать, потому что его скорость меняется в течение круга.')], 0), sol: [
          ['Средняя скорость любителя:', Lk + '÷' + T2 + paEq(v2, 2) + paKz(v2, 2), 'м/с'],
          ['Переводим в км/ч. За час (3600 с) он проехал бы в 3600 раз больше метров, а в километре 1000 м — значит, умножаем на 3600 и делим на 1000, то есть умножаем на 3,6:', Lk + '÷' + T2 + '*3.6' + paEq(kmh, 1) + paKz(kmh, 1), 'км/ч'],
          (ok ? tKm + ' < 60 — правило соблюдено.' : tKm + ' > 60 — правило нарушено.'),
          'Сравнивать ' + tMs + ' м/с с 60 км/ч нельзя — это разные единицы. «Медленнее профессионала» не значит «медленнее 60 км/ч». А средняя скорость как раз и учитывает, что скорость на круге меняется.'],
        redac: ['Vitesse moyenne de l\'amateur : $' + Lk + '÷' + T2 + paEq(v2, 2) + paKz(v2, 2) + '$ m/s.',
          'Or 1 m/s = 3,6 km/h, donc sa vitesse moyenne en km/h est : $' + Lk + '÷' + T2 + '*3.6' + paEq(kmh, 1) + paKz(kmh, 1) + '$.',
          'Comme $' + paKz(kmh, 1) + (ok ? '<' : '>') + '60$, l\'amateur ' + (ok ? 'respecte' : 'ne respecte pas') + ' la règle de sécurité.'] },
      { q: L('Décomposer ' + T1 + ' et ' + T2 + ' en produits de facteurs premiers.', 'Разложи ' + T1 + ' и ' + T2 + ' на простые множители.'),
        ans: multi([T1 + ' =', XP(paDec(T1), { forms: ['primeFact'] })], [T2 + ' =', XP(paDec(T2), { forms: ['primeFact'] })]), sol: [
          'Делим на простые числа по порядку, пока частное не станет простым:',
          ['', paChain(T1)], ['', T1 + '=' + paDec(T1)], ['', paChain(T2)], ['', T2 + '=' + paDec(T2)]],
        redac: [paDecFr(T1), paDecFr(T2)] },
      { q: L('Les deux pilotes partent en même temps de la ligne de départ et font plusieurs tours. Au bout de combien de secondes se retrouveront-ils pour la première fois ensemble sur la ligne de départ ?', 'Оба гонщика стартуют одновременно с линии старта и проходят несколько кругов. Через сколько секунд они впервые снова окажутся вместе на линии старта?'),
        ans: N(lcm, { unit: 's' }), sol: [
          'Профессионал проезжает линию старта через ' + T1 + ', ' + (2 * T1) + ', ' + (3 * T1) + ', … секунд — через кратные ' + T1 + '. Любитель — через кратные ' + T2 + '.',
          'Вместе они на линии старта в моменты, кратные и ' + T1 + ', и ' + T2 + '. Впервые — через наименьшее общее кратное («PPCM»).',
          ['Берём все простые множители в наибольшей степени из двух разложений:', pfStr(paPf([T1, T2], true)) + '=' + lcm, 'с'],
          'Это ' + sp.ru + '.'],
        redac: ['Le professionnel repasse sur la ligne de départ toutes les ' + T1 + ' secondes et l\'amateur toutes les ' + T2 + ' secondes.',
          'Ils s\'y retrouvent ensemble à chaque multiple commun de ' + T1 + ' et de ' + T2 + ' ; la première fois correspond au plus petit multiple commun.',
          '$' + T1 + '=' + paDec(T1) + '$ et $' + T2 + '=' + paDec(T2) + '$, donc le plus petit multiple commun est $' + pfStr(paPf([T1, T2], true)) + '=' + lcm + '$.',
          'Ils se retrouveront ensemble sur la ligne de départ au bout de ' + lcm + ' secondes, soit ' + sp.fr + '.'] },
      { q: L('Combien de tours chacun des deux pilotes aura-t-il alors effectués ?', 'Сколько кругов к этому моменту проедет каждый из гонщиков?'),
        ans: multi([L('le professionnel :', 'профессионал:'), N(lcm / T1)], [L('l\'amateur :', 'любитель:'), N(lcm / T2)]), sol: [
          ['Делим общее время на время одного круга:', lcm + '÷' + T1 + '=' + (lcm / T1) + ';' + lcm + '÷' + T2 + '=' + (lcm / T2)],
          'Профессионал как раз проехал на один круг больше — он быстрее.'],
        redac: ['$' + lcm + '÷' + T1 + '=' + (lcm / T1) + '$ et $' + lcm + '÷' + T2 + '=' + (lcm / T2) + '$.',
          'Le professionnel aura effectué ' + (lcm / T1) + ' tours et l\'amateur ' + (lcm / T2) + ' tours.'] }] };
  } });

/* ---------- p2.promo-bonbons : comparer deux offres, réduction en pourcentage, augmentation ---------- */
paProb({ id: 'p2.promo-bonbons', ch: 'pp', lvl: 1, pts: 3,
  ru: 'Какой пакет выгоднее', fr: 'Deux formats de bonbons',
  src: 'Centres étrangers 2026 · exercice 2',
  gen(r) {
    const nm = r.pick(PRENOMS_F);
    const OF = r.pick([[4, 0.5, 'pour 3 sachets achetés, le quatrième est à moitié prix', 'при покупке 3 пакетов четвёртый — за полцены'], [4, 0, 'pour 3 sachets achetés, le quatrième est offert', 'при покупке 3 пакетов четвёртый — в подарок'], [3, 0.5, 'pour 2 sachets achetés, le troisième est à moitié prix', 'при покупке 2 пакетов третий — за полцены']]);
    let pA, pB, M, nA, nB, nRed, TA, TB;
    do { pA = r.ri(75, 84) / 10; pB = r.ri(40, 49) / 10; M = r.pick([1, 1, 2]); nA = 2 * M; nB = 4 * M; nRed = Math.floor(nB / OF[0]); TA = nA * pA; TB = (nB - nRed) * pB + nRed * pB * OF[1]; } while (Math.abs(TA - TB) < 0.2);
    const t = r.pick([4, 5, 6, 8, 10]), newA = pA * (1 + t / 100), mn = paNum(newA, 2, '€', 'Arrondir au centime.', 'Округли до цента.');
    const pct = (1 - OF[1]) / OF[0] * 100, pn = paNum(pct, 1, '%', 'Arrondir au dixième.', 'Округли до десятых.');
    const best = TA < TB ? 'A' : 'B', TX = Math.min(TA, TB), TY = Math.max(TA, TB);
    const fig = paTbl([['Format A', 'Format B'], ['Sachet de 500 g', 'Sachet de 250 g'], [eur(pA) + ' le sachet', eur(pB) + ' le sachet'], ['—', 'Offre : ' + OF[2] + '.']]);
    const ctx = L('Dans un magasin, les bonbons sont vendus en deux formats (voir le tableau). ' + nm + ' veut acheter ' + M + ' kg de bonbons.',
      'В магазине конфеты продают в двух видах упаковки: формат A — пакет 500 г за ' + eur(pA) + '; формат B — пакет 250 г за ' + eur(pB) + ', акция: ' + OF[3] + '. ' + nm + ' хочет купить ' + M + ' кг конфет.');
    const nP = n => n + ' ' + paPl(n, ['пакет', 'пакета', 'пакетов']);
    const payB = OF[1] ? (nB - nRed) + '*' + fx(pB) + '+' + nRed + '*' + fx(pB * OF[1]) + '=' + fx(TB) : (nB - nRed) + '*' + fx(pB) + '=' + fx(TB);
    return { ctx, fig, qs: [
      { q: L('Combien ' + nm + ' paiera-t-elle avec le format A ?', 'Сколько заплатит ' + nm + ', если возьмёт формат A?'), ans: N(fx(TA), { unit: '€' }), sol: [
          M + ' кг = ' + (1000 * M) + ' г — это ' + nP(nA) + ' по 500 г.',
          ['', nA + '*' + fx(pA) + '=' + fx(TA), '€']],
        redac: [M + ' kg = ' + (1000 * M) + ' g et $' + (1000 * M) + '÷500=' + nA + '$ : il faut ' + nA + ' sachets du format A.',
          '$' + nA + '*' + fx(pA) + '=' + fx(TA) + '$',
          'Avec le format A, ' + nm + ' paiera ' + eur(TA) + '.'] },
      { q: L('Combien paiera-t-elle avec le format B, en profitant de l\'offre ?', 'Сколько она заплатит за формат B с учётом акции?'), ans: N(fx(TB), { unit: '€' }), sol: [
          (1000 * M) + ' г — это ' + nP(nB) + ' по 250 г.',
          'Акция: в каждой группе из ' + OF[0] + ' пакетов один ' + (OF[1] ? 'стоит половину цены (' + eur(pB * OF[1]) + ')' : 'бесплатный') + '. В ' + nB + ' пакетах ' + (nRed === 1 ? 'такая группа одна' : 'таких групп ' + nRed) + (nB % OF[0] ? ', и ещё ' + nP(nB % OF[0]) + ' — по полной цене.' : '.'),
          ['Платим:', payB, '€']],
        redac: ['$' + (1000 * M) + '÷250=' + nB + '$ : il faut ' + nB + ' sachets du format B.',
          'Avec l\'offre, ' + (nB - nRed) + ' sachets sont payés au prix normal et ' + (nRed > 1 ? nRed + ' sachets sont ' + (OF[1] ? 'à moitié prix' : 'offerts') : 'un sachet est ' + (OF[1] ? 'à moitié prix' : 'offert')) + '.',
          '$' + payB + '$',
          'Avec le format B, elle paiera ' + eur(TB) + '.'] },
      { q: L('Quel format doit-elle choisir pour payer le moins cher possible ? Choisir la réponse correctement justifiée.', 'Какой формат ей выбрать, чтобы заплатить как можно меньше? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          L('Le format ' + best + ', car pour ' + M + ' kg on paie ' + eur(TX) + ' au lieu de ' + eur(TY) + '.', 'Формат ' + best + ', потому что за ' + M + ' кг платим ' + eur(TX) + ' вместо ' + eur(TY) + '.'),
          L('Le format B, car un sachet B coûte moins cher qu\'un sachet A : ' + eur(pB) + ' < ' + eur(pA) + '.', 'Формат B, потому что пакет B дешевле пакета A: ' + eur(pB) + ' < ' + eur(pA) + '.'),
          /* the offer is forgotten; when format B is cheaper even without the offer, that reasoning would not be wrong — another typical error instead */
          TA < nB * pB ? L('Le format A, car ' + nA + ' sachets A coûtent ' + eur(TA) + ' et ' + nB + ' sachets B coûtent ' + eur(nB * pB) + '.', 'Формат A, потому что ' + nP(nA) + ' A стоят ' + eur(TA) + ', а ' + nP(nB) + ' B — ' + eur(nB * pB) + '.')
            : L('Le format A, car il faut acheter moins de sachets : ' + nA + ' au lieu de ' + nB + '.', 'Формат A, потому что пакетов нужно меньше: ' + nA + ' вместо ' + nB + '.'),
          L('Le format B, car avec l\'offre tous les sachets B sont moins chers.', 'Формат B, потому что по акции все пакеты B дешевле.')], 0), sol: [
          'Сравнивать нужно цену одного и того же количества конфет — ' + M + ' кг — с учётом акции: ' + eur(TA) + ' (формат A) и ' + eur(TB) + ' (формат B).',
          'Цены пакетов сравнивать нельзя: в пакете B вдвое меньше конфет. ' + (TA < nB * pB ? 'Без учёта акции цена формата B (' + eur(nB * pB) + ') неверна. ' : 'Меньше пакетов — не значит дешевле: сравнивают сумму, которую платят за ' + M + ' кг. ') + 'А акция снижает цену только части пакетов, а не всех.'],
        redac: ['Pour ' + M + ' kg de bonbons, on paie ' + eur(TA) + ' avec le format A et ' + eur(TB) + ' avec le format B, en profitant de l\'offre.',
          'Comme $' + fx(TX) + '<' + fx(TY) + '$, ' + nm + ' doit choisir le format ' + best + ' pour payer le moins cher possible.'] },
      { q: L('Pour un lot de ' + OF[0] + ' sachets B, quel pourcentage de réduction cette offre représente-t-elle ?' + pn.fr, 'Какую скидку в процентах даёт акция на ' + nP(OF[0]) + ' B?' + pn.ru),
        ans: pn.ans, sol: [
          'Процент скидки — это доля экономии от цены без акции. Пусть один пакет стоит $p$ евро. Тогда без акции за ' + nP(OF[0]) + ' платят $' + OF[0] + 'p$ евро, а акция экономит ' + (OF[1] ? 'половину цены одного пакета: $0.5p$ евро' : 'цену одного пакета: $p$ евро') + '. При делении буква $p$ сокращается, поэтому ответ не зависит от цены пакета.',
          ['Доля экономии в процентах:', (OF[1] ? '0.5' : '1') + '/' + OF[0] + '*100' + pn.eq + (pn.eq === '=' ? fx(pct) : paK(pct, 1)), '%'],
          'Частая ошибка — ответить «' + (OF[1] ? '50' : '100') + ' %»: скидка касается только одного пакета из ' + OF[0] + ', а не всей покупки.'],
        redac: ['Sans l\'offre, ' + OF[0] + ' sachets B coûtent $' + OF[0] + '*' + fx(pB) + '=' + fx(OF[0] * pB) + '$ €.',
          'Avec l\'offre, on économise ' + (OF[1] ? 'la moitié du prix d\'un sachet' : 'le prix d\'un sachet') + ', soit ' + eur(pB * (1 - OF[1])) + '.',
          '$' + fx(pB * (1 - OF[1])) + '/' + fx(OF[0] * pB) + '*100' + pn.eq + (pn.eq === '=' ? fx(pct) : paK(pct, 1)) + '$',
          'Cette offre représente une réduction ' + (pn.eq === '=' ? 'de ' + nf(pct) : 'd\'environ ' + paF(pct, 1)) + ' %.'] },
      { q: L('Le magasin augmente de ' + t + ' % le prix du sachet A. Quel est le nouveau prix d\'un sachet A ?' + mn.fr, 'Магазин повышает цену пакета A на ' + t + ' %. Какова новая цена пакета A?' + mn.ru),
        ans: mn.ans, sol: [
          'Увеличить на ' + t + ' % — значит к 100 % цены добавить ещё ' + t + ' %: получится ' + (100 + t) + ' % старой цены, то есть умножить на ' + nf(1 + t / 100) + '.',
          ['', fx(pA) + '*' + fx(1 + t / 100) + mn.eq + (mn.eq === '=' ? fx(newA) : paK(newA, 2)), '€']],
        redac: ['Augmenter un prix de ' + t + ' %, c\'est le multiplier par $1+' + t + '/100=' + fx(1 + t / 100) + '$.',
          '$' + fx(pA) + '*' + fx(1 + t / 100) + mn.eq + (mn.eq === '=' ? fx(newA) : paK(newA, 2)) + '$',
          'Le nouveau prix d\'un sachet A est ' + (mn.eq === '=' ? 'de ' : 'd\'environ ') + eur(paR(newA, 2)) + '.'] }] };
  } });

/* =====================================================================================================
   CALCUL LITTÉRAL ET ÉQUATIONS
   ===================================================================================================== */

/* ---------- p2.prog-ab : deux programmes de calcul, fonctions associées, antécédent, même résultat ---------- */
paProb({ id: 'p2.prog-ab', ch: 'cl', lvl: 2, pts: 4,
  ru: 'Две программы вычислений', fr: 'Deux programmes de calcul',
  src: 'Nouvelle-Calédonie 2025 · exercice 3',
  gen(r) {
    const nm = r.pick(PRENOMS_M);
    let a, b, c, d, k;
    do { a = r.ri(2, 7); b = r.ri(2, 5); k = r.pick([2, 3]); c = b + 1 + k; d = r.ri(2, 9); } while ((a * b + d) % k !== 0 || c > 9);
    const xs = (a * b + d) / k, b2 = c - 1;
    let x0; do x0 = r.ri(1, 6); while (x0 === xs);   /* the number tested in question 1 must not be the answer of the last question */
    const fA = b * (x0 + a), fB = c * x0 - d - x0;
    let x1; do x1 = r.ri(2, 9); while (x1 === x0 || x1 === xs);
    const y0 = b * x1 + a * b, fx_ = lin(b, a * b), gx = lin(b2, -d);
    const fig = paTbl([['Programme A', 'Programme B'], ['Choisir un nombre', 'Choisir un nombre'], ['Ajouter ' + a, 'Multiplier par ' + c], ['Multiplier par ' + b, 'Soustraire ' + d], ['', 'Soustraire le nombre de départ']]);
    const ctx = L('On considère les deux programmes de calcul ci-dessous.',
      'Даны две программы вычислений. Программа A: выбрать число; прибавить ' + a + '; умножить на ' + b + '. Программа B: выбрать число; умножить на ' + c + '; вычесть ' + d + '; вычесть исходное число.');
    return { ctx, fig, qs: [
      { q: L('On choisit ' + x0 + ' comme nombre de départ. Calculer le résultat obtenu avec chacun des deux programmes.', 'Исходное число — ' + x0 + '. Найди результат каждой из двух программ.'),
        ans: multi([L('Programme A :', 'Программа A:'), N(fA)], [L('Programme B :', 'Программа B:'), N(fB)]), sol: [
          ['Программа A:', x0 + '+' + a + '=' + (x0 + a) + ';' + (x0 + a) + '*' + b + '=' + fA],
          ['Программа B (в конце вычитаем исходное число ' + x0 + '):', x0 + '*' + c + '=' + (c * x0) + ';' + (c * x0) + '-' + d + '=' + (c * x0 - d) + ';' + (c * x0 - d) + '-' + x0 + '=' + fB]],
        redac: ['Programme A : ' + paEqs(x0 + '+' + a + '=' + (x0 + a) + ';' + (x0 + a) + '*' + b + '=' + fA) + '.',
          'Programme B : ' + paEqs(x0 + '*' + c + '=' + (c * x0) + ';' + (c * x0) + '-' + d + '=' + (c * x0 - d) + ';' + (c * x0 - d) + '-' + x0 + '=' + fB) + '.',
          'Avec le nombre ' + x0 + ', on obtient ' + nf(fA) + ' avec le programme A et ' + nf(fB) + ' avec le programme B.'] },
      { q: L('Soit $f$ la fonction associée au programme A : au nombre choisi $x$, elle fait correspondre le résultat $f(x)$. Exprimer $f(x)$ en fonction de $x$, sous forme développée et réduite.', 'Пусть $f$ — функция программы A: выбранному числу $x$ она сопоставляет результат $f(x)$. Запиши $f(x)$ через $x$ в раскрытом и упрощённом виде.'),
        ans: XP(fx_, { forms: ['expanded'] }), sol: [
          ['Повторяем шаги программы с буквой $x$: прибавить ' + a + ', затем умножить на ' + b + ' — весь результат, поэтому скобки:', 'f(x)=' + b + '(x+' + a + ')'],
          ['Раскрываем скобки: умножаем ' + b + ' и на $x$, и на ' + a + ' (распределительный закон):', 'f(x)=' + fx_],
          'Проверка с числом ' + x0 + ': ' + b + ' × ' + x0 + ' + ' + (a * b) + ' = ' + fA + ' — как в вопросе 1.'],
        redac: ['On choisit $x$ ; on ajoute ' + a + ' : $x+' + a + '$ ; on multiplie le résultat par ' + b + ' : $' + b + '(x+' + a + ')$.',
          'Donc $f(x)=' + b + '(x+' + a + ')$, soit $f(x)=' + b + '*x+' + b + '*' + a + '=' + fx_ + '$.'] },
      { q: L('Calculer l\'antécédent de ' + y0 + ' par la fonction $f$.', 'Найди прообраз числа ' + y0 + ' при функции $f$.'), ans: N(x1), sol: [
          'Прообраз («antécédent») числа ' + y0 + ' — это число $x$, для которого $f(x)=' + y0 + '$. Решаем уравнение:',
          ['', fx_ + '=' + y0],
          ['Вычитаем ' + (a * b) + ' из обеих частей, затем делим обе части на ' + b + ':', b + 'x=' + (y0 - a * b) + ';x=' + x1],
          'Проверка: ' + b + ' × ' + x1 + ' + ' + (a * b) + ' = ' + y0 + '.'],
        redac: ['On cherche le nombre $x$ tel que $f(x)=' + y0 + '$.',
          '$' + fx_ + '=' + y0 + '$, donc $' + b + 'x=' + (y0 - a * b) + '$ et $x=' + x1 + '$.',
          'L\'antécédent de ' + y0 + ' par la fonction $f$ est ' + x1 + '.'] },
      { q: L('Soit $g$ la fonction associée au programme B. Exprimer $g(x)$ en fonction de $x$, sous forme développée et réduite.', 'Пусть $g$ — функция программы B. Запиши $g(x)$ через $x$ в раскрытом и упрощённом виде.'),
        ans: XP(gx, { forms: ['expanded'] }), sol: [
          ['Шаги программы B с буквой $x$: умножить на ' + c + ', вычесть ' + d + ', вычесть исходное число $x$:', 'g(x)=' + c + 'x-' + d + '-x'],
          ['Приводим подобные: ' + c + 'x − x = ' + b2 + 'x (было ' + c + ' «иксов», один убрали):', 'g(x)=' + gx]],
        redac: ['On choisit $x$ ; on multiplie par ' + c + ' : $' + c + 'x$ ; on soustrait ' + d + ' : $' + c + 'x-' + d + '$ ; on soustrait le nombre de départ : $' + c + 'x-' + d + '-x$.',
          'Donc $g(x)=' + c + 'x-' + d + '-x$, soit $g(x)=' + gx + '$.'] },
      { q: L(nm + ' a choisi un nombre. Il l\'a testé avec les deux programmes et a trouvé le même résultat. Remettre dans l\'ordre les étapes qui permettent de trouver ce nombre.', nm + ' выбрал число, проверил его в обеих программах и получил одинаковый результат. Расставь по порядку шаги, которые позволяют найти это число.'), red: true,
        ans: ORD(r, [
          L('On cherche $x$ tel que $f(x)=g(x)$, c\'est-à-dire $' + fx_ + '=' + gx + '$.', 'Ищем $x$, при котором $f(x)=g(x)$, то есть $' + fx_ + '=' + gx + '$.'),
          L('On soustrait $' + b + 'x$ aux deux membres : $' + (a * b) + '=' + lin(k, -d) + '$.', 'Вычитаем $' + b + 'x$ из обеих частей: $' + (a * b) + '=' + lin(k, -d) + '$.'),
          L('On ajoute ' + d + ' aux deux membres : $' + (a * b + d) + '=' + k + 'x$.', 'Прибавляем ' + d + ' к обеим частям: $' + (a * b + d) + '=' + k + 'x$.'),
          L('On divise les deux membres par ' + k + ' : $x=' + xs + '$.', 'Делим обе части на ' + k + ': $x=' + xs + '$.')]),
        sol: ['Сначала записываем уравнение, которое переводит условие «одинаковый результат». Потом собираем $x$ в одной части (вычитаем $' + b + 'x$ из обеих частей — от этого равенство не нарушается), переносим числа в другую часть тем же приёмом и в конце делим на коэффициент при $x$.'] },
      { q: L('Quel nombre ' + nm + ' a-t-il choisi ?', 'Какое число выбрал ' + nm + '?'), ans: N(xs), sol: [
          ['Решение уравнения из вопроса 5:', fx_ + '=' + gx + ';x=' + xs],
          ['Проверка — обе программы дают одно и то же:', 'f(' + xs + ')=' + (b * xs + a * b) + ';g(' + xs + ')=' + (b2 * xs - d)]],
        redac: ['Les deux programmes donnent le même résultat lorsque $f(x)=g(x)$, c\'est-à-dire $' + fx_ + '=' + gx + '$ : on trouve $x=' + xs + '$.',
          'Vérification : $f(' + xs + ')=' + b + '*' + xs + '+' + (a * b) + '=' + (b * xs + a * b) + '$ et $g(' + xs + ')=' + b2 + '*' + xs + '-' + d + '=' + (b2 * xs - d) + '$.',
          nm + ' a choisi le nombre ' + xs + '.'] }] };
  } });

/* ---------- p2.prog-identite : programme (x+a)(x−a)+b, contre-exemple, identité, équation x² = k ---------- */
paProb({ id: 'p2.prog-identite', ch: 'cl', lvl: 2, pts: 4,
  ru: 'Программа и её секрет', fr: 'Un programme de calcul surprenant',
  src: 'Métropole 2020 · exercice 2',
  gen(r) {
    const a = r.ri(3, 9), c = r.ri(1, 6), b = a * a + c;
    let k; do k = r.ri(3, 10); while (k === a);   /* with −a one factor would be 0 and the result would be the number added at the end */
    let s; do s = r.ri(3, 9); while (s === k);   /* not 2 and not k: the last answer must not be a number already tested in questions 1 and 2 */
    const R = s * s + c;
    const fig = paTbl([['Programme de calcul'], ['Choisir un nombre.'], ['Ajouter ' + a + ' à ce nombre.'], ['Soustraire ' + a + ' au nombre choisi au départ.'], ['Multiplier les deux résultats précédents.'], ['Ajouter ' + b + '.']]);
    const ctx = L('On considère le programme de calcul suivant.',
      'Дана программа вычислений: выбрать число; прибавить к нему ' + a + '; вычесть ' + a + ' из исходного числа; перемножить два полученных результата; прибавить ' + b + '.');
    const run = x => [x + '+' + a + '=' + (x + a), x + '-' + a + '=' + (x - a), np(x + a) + '*' + np(x - a) + '=' + ((x + a) * (x - a)), ((x + a) * (x - a)) + '+' + b + '=' + ((x + a) * (x - a) + b)].join(';');
    return { ctx, fig, qs: [
      { q: L('Quel résultat obtient-on si le nombre choisi au départ est 2 ?', 'Какой результат получится, если выбрать число 2?'), ans: N(4 + c), sol: [
          'Две ветки программы считаем отдельно: «прибавить ' + a + '» и «вычесть ' + a + '» применяются к исходному числу 2, потом результаты перемножаем.',
          ['', run(2)]],
        redac: [paEqs(run(2)) + '.', 'Si le nombre choisi au départ est 2, on obtient ' + (4 + c) + '.'] },
      { q: L('Quel résultat obtient-on si le nombre choisi au départ est $-' + k + '$ ?', 'Какой результат получится, если выбрать число $-' + k + '$?'), ans: N(k * k + c), sol: [
          ['', run(-k)],
          k > a ? 'Оба множителя отрицательны, а произведение двух отрицательных чисел положительно.' : 'Множители разных знаков, поэтому их произведение отрицательно.'],
        redac: [paEqs(run(-k)) + '.', 'Si le nombre choisi au départ est $-' + k + '$, on obtient ' + (k * k + c) + '.'] },
      { q: L('Un élève remarque qu\'en calculant le double de 2 et en ajoutant ' + c + ', il obtient ' + (4 + c) + ', le même résultat qu\'à la question 1. Il pense que le programme revient à calculer le double du nombre de départ, puis à ajouter ' + c + '. A-t-il raison ? Choisir la réponse correctement justifiée.',
          'Ученик заметил: если удвоить 2 и прибавить ' + c + ', получится ' + (4 + c) + ' — как в вопросе 1. Он думает, что программа сводится к тому, чтобы удвоить исходное число и прибавить ' + c + '. Прав ли он? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          L('Non : avec $-' + k + '$, le programme donne ' + (k * k + c) + ', alors que le double de $-' + k + '$ plus ' + c + ' donne ' + nf(c - 2 * k) + '.', 'Нет: для $-' + k + '$ программа даёт ' + (k * k + c) + ', а удвоенное $-' + k + '$ плюс ' + c + ' даёт ' + nf(c - 2 * k) + '.'),
          L('Oui, car cela fonctionne avec le nombre 2.', 'Да, потому что для числа 2 это работает.'),
          L('Oui, car cela fonctionne aussi avec 0 : les deux calculs donnent ' + c + '.', 'Да, потому что и для 0 совпадает: оба вычисления дают ' + c + '.'),
          L('On ne peut pas savoir sans essayer tous les nombres.', 'Нельзя узнать, не перепробовав все числа.')], 0), sol: [
          'Чтобы доказать «всегда», мало примеров: совпадение для 2 (и даже для 0) может быть случайным.',
          'Чтобы опровергнуть, достаточно одного контрпримера: для $-' + k + '$ программа даёт ' + (k * k + c) + ' (вопрос 2), а правило ученика — ' + nf(c - 2 * k) + '. Значит, он неправ.',
          'Перебирать все числа не нужно: одного контрпримера хватает, чтобы сказать «нет».'],
        redac: ['Avec $-' + k + '$, le programme donne ' + (k * k + c) + ' (question 2).',
          'Or le double de $-' + k + '$ augmenté de ' + c + ' vaut $2*(-' + k + ')+' + c + '=' + (c - 2 * k) + '$, et $' + (c - 2 * k) + '≠' + (k * k + c) + '$.',
          'L\'élève a tort : ce contre-exemple montre que le programme ne revient pas à calculer le double du nombre de départ, puis à ajouter ' + c + '.'] },
      { q: L('On note $x$ le nombre choisi au départ. Exprimer le résultat du programme en fonction de $x$, sous forme développée et réduite.', 'Обозначим исходное число $x$. Запиши результат программы через $x$ в раскрытом и упрощённом виде.'),
        ans: XP('x^2+' + c, { forms: ['expanded'] }), sol: [
          ['Записываем шаги программы:', '(x+' + a + ')(x-' + a + ')+' + b],
          ['Раскрываем скобки: каждое слагаемое первой скобки умножаем на каждое слагаемое второй:', 'x^2-' + a + 'x+' + a + 'x-' + (a * a) + '+' + b],
          ['$-' + a + 'x$ и $+' + a + 'x$ взаимно уничтожаются (это формула $(x+a)(x-a)=x^2-a^2$):', 'x^2-' + (a * a) + '+' + b + '=x^2+' + c],
          'Так видно, почему ученик ошибся: программа даёт квадрат числа плюс ' + c + ', а не удвоенное число плюс ' + c + '. Они совпадают только при $x=0$ и $x=2$.'],
        redac: ['Le programme donne $(x+' + a + ')(x-' + a + ')+' + b + '$. On développe le produit :',
          '$(x+' + a + ')(x-' + a + ')=x^2-' + a + 'x+' + a + 'x-' + (a * a) + '$',
          '$=x^2-' + (a * a) + '$',
          'Le résultat du programme est donc $x^2-' + (a * a) + '+' + b + '$, soit $x^2+' + c + '$.'] },
      { q: L('Quel(s) nombre(s) doit-on choisir au départ pour obtenir ' + R + ' comme résultat ?', 'Какое число (или какие числа) нужно выбрать, чтобы получить результат ' + R + '?'),
        ans: SOL(s + ', ' + (-s)), sol: [
          ['Результат равен $x^2+' + c + '$, решаем уравнение:', 'x^2+' + c + '=' + R],
          ['Вычитаем ' + c + ':', 'x^2=' + (s * s)],
          'Квадрат равен ' + (s * s) + ' у двух чисел: ' + s + ' и $-' + s + '$ (квадрат отрицательного числа тоже положителен). Ответ: ' + s + ' и $-' + s + '$.'],
        redac: ['On cherche $x$ tel que $x^2+' + c + '=' + R + '$, c\'est-à-dire $x^2=' + (s * s) + '$.',
          'Cette équation a deux solutions : $x=' + s + '$ ou $x=-' + s + '$.',
          'On peut choisir ' + s + ' ou $-' + s + '$ comme nombre de départ.'] }] };
  } });

/* ---------- p2.prime-course : mise en équation d'un partage, résolution, vérification ---------- */
paProb({ id: 'p2.prime-course', ch: 'cl', lvl: 1, pts: 3,
  ru: 'Призы велогонки', fr: 'Les primes d\'une course cycliste',
  src: 'Sujet zéro 2018 · exercice 3',
  gen(r) {
    let x, d1, d3; do { x = r.pick([80, 90, 100, 110, 120, 130, 140, 150]); d1 = r.pick([40, 50, 60, 70, 80]); d3 = r.pick([30, 40, 50, 60, 70, 80]); } while (d3 === d1 || d3 > x - 40);
    const P = 3 * x + d1 - d3, e = d1 - d3, t = x + r.pick([-20, -10, 10, 20]), Pt = 3 * t + e;
    const ctx = L('Lors de la fête d\'un village, une course cycliste est organisée. Les trois premiers coureurs se partagent une prime totale de ' + P + ' euros : le premier reçoit ' + d1 + ' euros de plus que le deuxième, et le troisième reçoit ' + d3 + ' euros de moins que le deuxième.',
      'На деревенском празднике устроили велогонку. Три первых гонщика делят призовой фонд ' + P + ' евро: первый получает на ' + d1 + ' евро больше второго, а третий — на ' + d3 + ' евро меньше второго.');
    const eq = 'x+(x+' + d1 + ')+(x-' + d3 + ')=' + P, red1 = '3x' + (e > 0 ? '+' : '') + e + '=' + P;
    return { ctx, qs: [
      { q: L('Si le deuxième recevait ' + t + ' euros, quelle serait la somme des trois primes ?', 'Если бы второй получил ' + t + ' евро, какой была бы сумма трёх призов?'), ans: N(Pt, { unit: '€' }), sol: [
          ['Первый получил бы ' + t + ' + ' + d1 + ', третий ' + t + ' − ' + d3 + ':', t + '+' + (t + d1) + '+' + (t - d3) + '=' + Pt, '€'],
          'Это ' + (Pt < P ? 'меньше' : 'больше') + ', чем ' + P + ' €, — значит, второй получает не ' + t + ' €, а ' + (Pt < P ? 'больше' : 'меньше') + '. Подбирать дальше долго, поэтому составим уравнение.'],
        redac: ['Le premier recevrait $' + t + '+' + d1 + '=' + (t + d1) + '$ euros et le troisième $' + t + '-' + d3 + '=' + (t - d3) + '$ euros.',
          '$' + (t + d1) + '+' + t + '+' + (t - d3) + '=' + Pt + '$',
          'La somme des trois primes serait de ' + Pt + ' euros.'] },
      { q: L('On note $x$ la prime du deuxième coureur, en euros. Quelle équation traduit le problème ?', 'Обозначим приз второго гонщика $x$ (в евро). Какое уравнение описывает задачу?'), red: true,
        ans: MQ(r, ['$' + eq + '$', '$x+(x-' + d1 + ')+(x+' + d3 + ')=' + P + '$', '$(x+' + d1 + ')+(x-' + d3 + ')=' + P + '$', '$3x=' + P + '$'], 0), sol: [
          'Первый получает на ' + d1 + ' больше второго: $x+' + d1 + '$. Третий — на ' + d3 + ' меньше: $x-' + d3 + '$. Сумма всех трёх призов (включая приз самого второго, $x$) равна ' + P + '.',
          'Ошибки в других вариантах: перепутаны «больше» и «меньше»; забыт приз самого второго гонщика; фонд разделён поровну — уравнение $3x=' + P + '$ годилось бы только для трёх одинаковых призов.'],
        redac: ['Le premier reçoit ' + d1 + ' euros de plus que le deuxième, soit $x+' + d1 + '$ ; le troisième reçoit ' + d3 + ' euros de moins que le deuxième, soit $x-' + d3 + '$.',
          'La somme des trois primes est égale à ' + P + ' euros : $' + eq + '$.'] },
      { q: L('Résoudre cette équation. Quelle est la prime du deuxième coureur ?', 'Реши это уравнение. Какой приз у второго гонщика?'), ans: N(x, { unit: '€' }), sol: [
          ['Раскрываем скобки и приводим подобные (три «икса» и числа):', eq + ';' + red1],
          [(e > 0 ? 'Вычитаем ' + e + ' из обеих частей' : 'Прибавляем ' + (-e) + ' к обеим частям') + ', затем делим на 3:', '3x=' + (P - e) + ';x=' + x]],
        redac: ['$' + eq + '$', '$' + red1 + '$', '$3x=' + (P - e) + '$, donc $x=' + (P - e) + '÷3=' + x + '$.', 'La prime du deuxième coureur est de ' + x + ' euros.'] },
      { q: L('Quelles sont les primes du premier et du troisième coureur ?', 'Какие призы у первого и у третьего гонщика?'),
        ans: multi([L('premier :', 'первый:'), N(x + d1, { unit: '€' })], [L('troisième :', 'третий:'), N(x - d3, { unit: '€' })]), sol: [
          ['', x + '+' + d1 + '=' + (x + d1) + ';' + x + '-' + d3 + '=' + (x - d3)],
          ['Проверка — сумма равна фонду:', (x + d1) + '+' + x + '+' + (x - d3) + '=' + P]],
        redac: ['$' + x + '+' + d1 + '=' + (x + d1) + '$ et $' + x + '-' + d3 + '=' + (x - d3) + '$.',
          'Le premier coureur reçoit ' + (x + d1) + ' euros et le troisième ' + (x - d3) + ' euros.',
          'Vérification : $' + (x + d1) + '+' + x + '+' + (x - d3) + '=' + P + '$.'] },
      { q: L('Remettre dans l\'ordre les étapes de la résolution de l\'équation.', 'Расставь по порядку шаги решения уравнения.'), red: true,
        ans: ORD(r, [
          L('On réduit le membre de gauche : $' + red1 + '$.', 'Упрощаем левую часть: $' + red1 + '$.'),
          L((e > 0 ? 'On soustrait ' + e + ' aux deux membres' : 'On ajoute ' + (-e) + ' aux deux membres') + ' : $3x=' + (P - e) + '$.', (e > 0 ? 'Вычитаем ' + e + ' из обеих частей' : 'Прибавляем ' + (-e) + ' к обеим частям') + ': $3x=' + (P - e) + '$.'),
          L('On divise les deux membres par 3 : $x=' + x + '$.', 'Делим обе части на 3: $x=' + x + '$.'),
          L('On vérifie : ' + (x + d1) + ' + ' + x + ' + ' + (x - d3) + ' = ' + P + '.', 'Проверяем: ' + (x + d1) + ' + ' + x + ' + ' + (x - d3) + ' = ' + P + '.')]),
        sol: ['Сначала упрощаем, потом «освобождаем» $3x$ от числа рядом с ним (одно и то же действие с обеими частями сохраняет равенство), потом делим на 3. Проверка — в самом конце, когда ответ уже найден.'] }] };
  } });

/* =====================================================================================================
   FONCTIONS
   ===================================================================================================== */

/* ---------- p2.tarifs-bateau : trois tarifs, fonction affine, image, antécédent, lecture graphique ---------- */
const PA_ORD = { 6: ['sixième', 'шестой'], 7: ['septième', 'седьмой'], 8: ['huitième', 'восьмой'] };
const PA_SUB = ['C₁', 'C₂', 'C₃'];
paProb({ id: 'p2.tarifs-bateau', ch: 'fn', lvl: 2, pts: 4,
  ru: 'Три тарифа на паром', fr: 'Trois tarifs pour traverser',
  src: 'Sujet de référence 2027 n°1 · exercice 2',
  gen(r) {
    let pM, pP, k, pN, cN, Pm, xM, xN, xP;
    do {
      pM = r.pick([20, 25]); pP = pM + r.pick([5, 10]); k = r.pick([6, 7, 8]); pN = r.pick([8, 10, 12]); cN = r.pick([40, 50, 60, 80]);
      Pm = pP * k; xM = Math.floor(Pm / pM) + 1; xN = Math.floor((Pm - cN) / pN) + 1; xP = Math.max(xM, xN);
    } while (Pm > 280 || cN + 20 * pN > 290 || Math.abs(cN + 20 * pN - Pm) < 25 || xP > 19);
    const order = r.sh(['M', 'N', 'P']), nameOf = t => PA_SUB[order.indexOf(t)];
    const PTS = { M: [[0, 0], [20, 20 * pM]], N: [[0, cN], [20, cN + 20 * pN]], P: [[0, 0], [k, Pm], [20, Pm]] };
    const STY = [{ cls: 'fcurve' }, { cls: 'fhl' }, { cls: 'fl', dash: true }];
    const fig = paPlot({ xmax: 20, ymax: 300, xg: 1, yg: 20, xt: 2, yt: 40, xn: 'Nombre de voyages', yn: 'Prix (€)', label: 'Prix à payer selon le nombre de voyages pour trois tarifs',
      curves: order.map((t, i) => Object.assign({ pts: PTS[t], lab: PA_SUB[i] }, STY[i])) });
    const x1 = r.ri(4, 16); let x2; do x2 = r.ri(5, 18); while (x2 === x1);
    const y2 = cN + pN * x2, gx = pN + 'x+' + cN;
    const ctx = L('Pour aller en bateau d\'une île à la côte, une compagnie propose trois tarifs. Tarif M : chaque voyage coûte ' + pM + ' euros. Tarif N : une carte annuelle à ' + cN + ' euros, puis ' + pN + ' euros par voyage. Tarif P : ' + pP + ' euros par voyage jusqu\'au ' + PA_ORD[k][0] + ' voyage de l\'année ; ensuite, les voyages sont gratuits jusqu\'à la fin de l\'année. Le graphique donne le prix à payer, en euros, en fonction du nombre de voyages, pour ces trois tarifs (courbes C₁, C₂ et C₃).',
      'Чтобы добраться на пароме с острова на берег, компания предлагает три тарифа. Тариф M: каждая поездка стоит ' + pM + ' евро. Тариф N: годовая карта за ' + cN + ' евро и ещё ' + pN + ' евро за каждую поездку. Тариф P: ' + pP + ' евро за поездку до ' + PA_ORD[k][1] + ' поездки за год включительно, а дальше до конца года поездки бесплатны. На графике — цена в евро в зависимости от числа поездок для трёх тарифов (кривые C₁, C₂ и C₃).');
    const perms = [['M', 'N', 'P'], ['M', 'P', 'N'], ['N', 'M', 'P'], ['N', 'P', 'M'], ['P', 'M', 'N'], ['P', 'N', 'M']].filter(q => q.join('') !== order.join(''));
    const mapTxt = o => L(o.map((t, i) => PA_SUB[i] + ' : tarif ' + t).join(' ; '), o.map((t, i) => PA_SUB[i] + ' — тариф ' + t).join('; '));
    return { ctx, fig, qs: [
      { q: L('La fonction $g$ définie par $g(x)=' + gx + '$ est représentée par l\'une des courbes. Laquelle ? Choisir la réponse correctement justifiée.', 'Функция $g$, заданная формулой $g(x)=' + gx + '$, изображена одной из кривых. Какой? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          L('La courbe ' + nameOf('N') + ', car c\'est une droite qui coupe l\'axe des ordonnées au point de coordonnées (0 ; ' + cN + ') : $g(0)=' + cN + '$.', 'Кривая ' + nameOf('N') + ', потому что это прямая, которая пересекает ось ординат в точке (0; ' + cN + '): $g(0)=' + cN + '$.'),
          L('La courbe ' + nameOf('M') + ', car une fonction affine est représentée par une droite qui passe par l\'origine.', 'Кривая ' + nameOf('M') + ', потому что график «fonction affine» — прямая, проходящая через начало координат.'),
          L('La courbe ' + nameOf('P') + ', car elle part de l\'origine et monte.', 'Кривая ' + nameOf('P') + ', потому что она выходит из начала координат и идёт вверх.'),
          L('La courbe ' + nameOf('M') + ', car c\'est la droite qui monte le plus vite.', 'Кривая ' + nameOf('M') + ', потому что эта прямая растёт быстрее всех.')], 0), sol: [
          'У функции вида $g(x)=ax+b$ (по-французски «fonction affine») график — прямая, которая пересекает ось ординат в точке (0 ; b), ведь $g(0)=b$. Здесь $g(0)=' + cN + '$.',
          'Из трёх линий прямая с началом в точке (0; ' + cN + ') одна — ' + nameOf('N') + '. Через начало координат проходят только графики прямой пропорциональности $ax$ — «fonctions linéaires» (осторожно: по-русски «линейной» называют и $ax+b$, а по-французски это «fonction affine»). У $g$ есть слагаемое ' + cN + ', поэтому её график через начало координат не проходит. ' + nameOf('P') + ' — вообще не прямая (ломаная). А коэффициент ' + pN + ' у $g$ меньше, чем ' + pM + ' у прямой ' + nameOf('M') + ', так что график $g$ — не «самая крутая» прямая.'],
        redac: ['$g$ est une fonction affine : sa représentation graphique est une droite.',
          '$g(0)=' + pN + '*0+' + cN + '=' + cN + '$, donc cette droite passe par le point de coordonnées (0 ; ' + cN + ').',
          'La seule courbe qui passe par ce point est ' + nameOf('N') + ' : c\'est elle qui représente la fonction $g$.'] },
      { q: L('Calculer l\'image de ' + x1 + ' par la fonction $g$.', 'Вычисли образ числа ' + x1 + ' при функции $g$.'), ans: N(cN + pN * x1), sol: [
          ['Образ («image») числа ' + x1 + ' — это $g(' + x1 + ')$: подставляем ' + x1 + ' вместо $x$:', 'g(' + x1 + ')=' + pN + '*' + x1 + '+' + cN + '=' + (cN + pN * x1)],
          'По смыслу: ' + x1 + ' ' + paPl(x1, ['поездка', 'поездки', 'поездок']) + ' по тарифу N ' + paPl(x1, ['стоит', 'стоят', 'стоят']) + ' ' + (cN + pN * x1) + ' €. Это видно и на графике — точка кривой ' + nameOf('N') + ' над отметкой ' + x1 + '.'],
        redac: ['$g(' + x1 + ')=' + pN + '*' + x1 + '+' + cN + '=' + (cN + pN * x1) + '$',
          'L\'image de ' + x1 + ' par la fonction $g$ est ' + (cN + pN * x1) + '.'] },
      { q: L('Quel est l\'antécédent de ' + y2 + ' par la fonction $g$ ?', 'Каков прообраз числа ' + y2 + ' при функции $g$?'), ans: N(x2), sol: [
          'Прообраз («antécédent») числа ' + y2 + ' — это $x$, для которого $g(x)=' + y2 + '$.',
          ['Решаем уравнение:', gx + '=' + y2 + ';' + pN + 'x=' + (y2 - cN) + ';x=' + x2],
          'По смыслу: за ' + y2 + ' € по тарифу N можно совершить ' + x2 + ' ' + paPl(x2, ['поездку', 'поездки', 'поездок']) + '.'],
        redac: ['On cherche le nombre $x$ tel que $g(x)=' + y2 + '$.',
          '$' + gx + '=' + y2 + '$, donc $' + pN + 'x=' + (y2 - cN) + '$ et $x=' + x2 + '$.',
          'L\'antécédent de ' + y2 + ' par la fonction $g$ est ' + x2 + '.'] },
      { q: L('Associer chaque courbe au tarif qu\'elle représente.', 'Сопоставь каждой кривой её тариф.'),
        ans: MQ(r, [mapTxt(order)].concat(r.sh(perms).slice(0, 3).map(mapTxt)), 0), sol: [
          'Тариф N — прямая, начинающаяся в точке (0; ' + cN + '): ' + nameOf('N') + '.',
          'Тариф M — пропорциональность ($' + pM + 'x$): прямая через начало координат, ' + nameOf('M') + '.',
          'Тариф P растёт до ' + k + '-й поездки (до ' + Pm + ' €), а потом не меняется — горизонтальный участок: ' + nameOf('P') + '.'],
        redac: ['Tarif M : le prix est proportionnel au nombre de voyages, il est donc représenté par une droite qui passe par l\'origine du repère : c\'est ' + nameOf('M') + '.',
          'Tarif N : pour $x$ voyages, on paie $' + gx + '$ euros, c\'est-à-dire $g(x)$ : c\'est ' + nameOf('N') + '.',
          'Tarif P : après le ' + PA_ORD[k][0] + ' voyage, le prix n\'augmente plus et la courbe devient horizontale : c\'est ' + nameOf('P') + '.'] },
      { q: L('À partir de quel nombre de voyages dans l\'année le tarif P devient-il plus avantageux que les deux autres ?', 'Начиная с какого числа поездок за год тариф P становится выгоднее двух других?'), ans: N(xP), sol: [
          'После ' + k + '-й поездки тариф P стоит всегда ' + pP + ' × ' + k + ' = ' + Pm + ' € — на графике это горизонтальный участок ' + nameOf('P') + '. Он должен оказаться ниже обеих других линий.',
          ['Тариф M дороже, когда $' + pM + 'x>' + Pm + '$:', 'x>' + Pm + '÷' + pM + paEq(Pm / pM, 1) + paKz(Pm / pM, 1)],
          ['Тариф N дороже, когда $' + gx + '>' + Pm + '$:', 'x>' + (Pm - cN) + '÷' + pN + paEq((Pm - cN) / pN, 1) + paKz((Pm - cN) / pN, 1)],
          'Наименьшее целое число поездок, при котором выполняются оба условия, — ' + xP + '. Начиная с ' + xP + '-й поездки тариф P самый выгодный' + (xP === xN && (Pm - cN) % pN === 0 ? ' (при ' + (xP - 1) + ' поездках P и N стоят одинаково — «выгоднее» ещё нет)' : xP === xM && Pm % pM === 0 ? ' (при ' + (xP - 1) + ' поездках P и M стоят одинаково — «выгоднее» ещё нет)' : '') + '.'],
        redac: ['Graphiquement, la courbe ' + nameOf('P') + ' (tarif P) passe en dessous des deux autres à partir de ' + xP + ' voyages.',
          'Vérification pour ' + (xP - 1) + ' voyages : le tarif M coûte ' + eur(pM * (xP - 1)) + ', le tarif N ' + eur(cN + pN * (xP - 1)) + ' et le tarif P ' + eur(Pm) + '.',
          'Pour ' + xP + ' voyages : le tarif M coûte ' + eur(pM * xP) + ', le tarif N ' + eur(cN + pN * xP) + ' et le tarif P ' + eur(Pm) + '.',
          'Le tarif P devient plus avantageux que les deux autres à partir de ' + xP + ' voyages dans l\'année.'] }] };
  } });

/* ---------- p2.filtration : programme → fonction affine, proportionnalité, équation, coût de l'électricité ---------- */
paProb({ id: 'p2.filtration', ch: 'fn', lvl: 2, pts: 5,
  ru: 'Фильтр для бассейна', fr: 'La filtration d\'une piscine',
  src: 'Métropole septembre 2025 · exercice 4',
  gen(r) {
    const nm = r.pick(PRENOMS_M), a = r.pick([2, 4, 6]), kf = r.pick([0.5, 0.5, 0.4]), T0 = r.pick([22, 24, 26, 28]), x1 = r.pick([10, 12, 14, 16, 18]), xs = r.pick([28, 30, 32].filter(v => v !== T0));   /* not the temperature of question 1: its answer would give this one away */
    const t0 = kf * (T0 + a), b0 = kf * a, y1 = kf * (xs + a), fxs = fx(kf) + 'x+' + fx(b0);
    const PER = r.pick([['du 1er juillet au 31 août inclus', 'с 1 июля по 31 августа включительно', 62], ['du 1er juin au 31 août inclus', 'с 1 июня по 31 августа включительно', 92], ['du 15 juin au 15 septembre inclus', 'с 15 июня по 15 сентября включительно', 93]]);
    const H = r.pick([12, 14, 15, 16]), Pw = r.pick([0.6, 0.75, 0.8, 1.1]), pr = r.pick([0.2, 0.21, 0.23, 0.25]);
    const kwh = Pw * H * PER[2], cost = kwh * pr, cn = paNum(cost, 2, '€', 'Arrondir au centime.', 'Округли до цента.');
    const fig = paTbl([['Méthode de calcul'], ['Prendre la température de l\'eau (en °C).'], ['Lui ajouter ' + a + '.'], ['Multiplier le résultat par ' + nf(kf) + '.'], ['Le résultat est le temps de filtration (en heures).']]);
    const ctx = L(nm + ' a une piscine. En été, pour que l\'eau reste propre, sa pompe de filtration doit tourner chaque jour. La durée de filtration conseillée (en heures) se calcule à partir de la température de l\'eau (en °C), avec la méthode ci-dessous.',
      'У ' + nm + ' есть бассейн. Летом, чтобы вода оставалась чистой, насос-фильтр должен работать каждый день. Рекомендуемое время фильтрации (в часах) считают по температуре воды (в °C): взять температуру воды, прибавить ' + a + ', умножить результат на ' + nf(kf) + '.');
    return { ctx, fig, qs: [
      { q: L('Calculer le temps de filtration pour une eau à ' + T0 + ' °C.', 'Найди время фильтрации для воды температурой ' + T0 + ' °C.'), ans: N(fx(t0), { unit: 'h' }), sol: [
          ['Следуем методу по шагам:', T0 + '+' + a + '=' + (T0 + a) + ';' + (T0 + a) + '*' + fx(kf) + '=' + fx(t0), 'ч']],
        redac: [paEqs(T0 + '+' + a + '=' + (T0 + a) + ';' + (T0 + a) + '*' + fx(kf) + '=' + fx(t0)) + '.',
          'Pour une eau à ' + T0 + ' °C, le temps de filtration est de ' + nf(t0) + ' h.'] },
      { q: L('On note $x$ la température de l\'eau, en °C, et $f(x)$ le temps de filtration, en heures. Exprimer $f(x)$ en fonction de $x$, sous forme développée et réduite.', 'Обозначим температуру воды $x$ (в °C), а время фильтрации $f(x)$ (в часах). Запиши $f(x)$ через $x$ в раскрытом и упрощённом виде.'),
        ans: XP(fxs, { forms: ['expanded'] }), sol: [
          ['Шаги метода с буквой $x$: прибавить ' + a + ' и умножить весь результат на ' + nf(kf) + ':', 'f(x)=' + fx(kf) + '(x+' + a + ')'],
          ['Раскрываем скобки:', 'f(x)=' + fx(kf) + '*x+' + fx(kf) + '*' + a + '=' + fxs]],
        redac: ['On ajoute ' + a + ' à $x$ : $x+' + a + '$ ; on multiplie le résultat par ' + nf(kf) + ' : $' + fx(kf) + '(x+' + a + ')$.',
          'Donc $f(x)=' + fx(kf) + '(x+' + a + ')$, soit $f(x)=' + fx(kf) + '*x+' + fx(kf) + '*' + a + '=' + fxs + '$.'] },
      { q: L('Le temps de filtration est-il proportionnel à la température de l\'eau ? Choisir la réponse correctement justifiée.', 'Пропорционально ли время фильтрации температуре воды? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          L('Non : $f$ est une fonction affine qui n\'est pas linéaire ; par exemple $f(0)=' + fx(b0) + '$, alors qu\'une situation de proportionnalité donnerait 0.', 'Нет: $f$ — «fonction affine», но не «fonction linéaire» (не прямая пропорциональность); например, $f(0)=' + fx(b0) + '$, а при пропорциональности было бы 0.'),
          L('Oui, car la représentation graphique de $f$ est une droite.', 'Да, потому что график $f$ — прямая.'),
          L('Oui, car plus l\'eau est chaude, plus le temps de filtration est long.', 'Да, потому что чем теплее вода, тем дольше фильтрация.'),
          L('Non, car le coefficient ' + nf(kf) + ' est plus petit que 1.', 'Нет, потому что коэффициент ' + nf(kf) + ' меньше 1.')], 0), sol: [
          'Пропорциональность — это $f(x)=ax$ (по-французски «fonction linéaire»): график — прямая через начало координат, и при $x=0$ получается 0.',
          'Здесь $f(x)=' + fxs + '$ — есть слагаемое ' + nf(b0) + ', поэтому $f(0)=' + fx(b0) + '≠0$: пропорциональности нет. Такая функция по-французски — «fonction affine», но не «linéaire» (осторожно: по-русски «линейной» называют и её). Другая проверка: удвоим температуру — время не удвоится.',
          'График — прямая, но не через начало координат, поэтому «прямая» ещё не значит «пропорциональность». «Обе величины растут вместе» — тоже не признак пропорциональности. А величина коэффициента здесь ни при чём.'],
        redac: ['Une situation de proportionnalité est représentée par une fonction linéaire.',
          'Or $f(x)=' + fxs + '$ : $f$ est une fonction affine qui n\'est pas linéaire, car $f(0)=' + fx(b0) + '$ et non 0.',
          'Le temps de filtration n\'est donc pas proportionnel à la température de l\'eau.'] },
      { q: L('Calculer l\'image de ' + x1 + ' par la fonction $f$.', 'Вычисли образ числа ' + x1 + ' при функции $f$.'), ans: N(fx(kf * x1 + b0)), sol: [
          ['Подставляем ' + x1 + ' вместо $x$:', 'f(' + x1 + ')=' + fx(kf) + '*' + x1 + '+' + fx(b0) + '=' + fx(kf * x1 + b0)],
          'По смыслу: при воде ' + x1 + ' °C фильтр должен работать ' + nf(kf * x1 + b0) + ' ч в сутки.'],
        redac: ['$f(' + x1 + ')=' + fx(kf) + '*' + x1 + '+' + fx(b0) + '=' + fx(kf * x1 + b0) + '$',
          'L\'image de ' + x1 + ' par la fonction $f$ est ' + nf(kf * x1 + b0) + '.'] },
      { q: L('Résoudre l\'équation $f(x)=' + fx(y1) + '$, puis interpréter la solution dans le contexte de l\'exercice.', 'Реши уравнение $f(x)=' + fx(y1) + '$ и объясни, что означает решение в этой задаче.'), ans: N(xs, { unit: '°C' }), sol: [
          ['', fxs + '=' + fx(y1) + ';' + fx(kf) + 'x=' + fx(y1 - b0) + ';x=' + fx(y1 - b0) + '÷' + fx(kf) + '=' + xs],
          'Смысл: $x$ — температура воды, а $f(x)$ — время фильтрации. Значит, время фильтрации ' + nf(y1) + ' ч соответствует температуре воды ' + xs + ' °C.'],
        redac: ['$' + fxs + '=' + fx(y1) + '$',
          '$' + fx(kf) + 'x=' + fx(y1 - b0) + '$, donc $x=' + fx(y1 - b0) + '÷' + fx(kf) + '=' + xs + '$.',
          'La solution est ' + xs + ' : le temps de filtration est de ' + nf(y1) + ' h lorsque la température de l\'eau est de ' + xs + ' °C.'] },
      { q: L(nm + ' décide de filtrer sa piscine ' + H + ' h par jour, tous les jours ' + PER[0] + '. La pompe a une puissance de ' + nf(Pw) + ' kW et le prix d\'un kWh est de ' + eur(pr) + '. La consommation de la pompe (en kWh) est égale à : puissance (en kW) × nombre d\'heures d\'utilisation par jour × nombre de jours. Calculer la dépense liée à la filtration sur cette période.' + cn.fr,
          nm + ' решил включать фильтр на ' + H + ' ч в день каждый день ' + PER[1] + '. Мощность насоса ' + nf(Pw) + ' кВт, 1 кВт·ч стоит ' + eur(pr) + '. Потребление насоса (в кВт·ч) = мощность (кВт) × число часов работы в день × число дней. Найди расходы на фильтрацию за этот период.' + cn.ru),
        ans: cn.ans, sol: [
          'Считаем дни: ' + (PER[2] === 62 ? 'июль — 31 день, август — 31 день: 62 дня.' : PER[2] === 92 ? 'июнь — 30 дней, июль и август — по 31: 92 дня.' : 'с 15 по 30 июня — 16 дней, июль и август — по 31, с 1 по 15 сентября — 15: 93 дня.'),
          ['Потребление:', fx(Pw) + '*' + H + '*' + PER[2] + '=' + fx(kwh), 'кВт·ч'],
          ['Расходы: потребление × цена одного кВт·ч:', fx(kwh) + '*' + fx(pr) + cn.eq + (cn.eq === '=' ? fx(cost) : paK(cost, 2)), '€']],
        redac: ['Nombre de jours ' + PER[0] + ' : $' + (PER[2] === 62 ? '31+31' : PER[2] === 92 ? '30+31+31' : '16+31+31+15') + '=' + PER[2] + '$.',
          'Consommation de la pompe : $' + fx(Pw) + '*' + H + '*' + PER[2] + '=' + fx(kwh) + '$ kWh.',
          'Dépense : $' + fx(kwh) + '*' + fx(pr) + cn.eq + (cn.eq === '=' ? fx(cost) : paK(cost, 2)) + '$ €.',
          'La dépense liée à la filtration sur cette période est ' + (cn.eq === '=' ? 'de ' : 'd\'environ ') + eur(paR(cost, 2)) + '.'] }] };
  } });

/* ---------- p2.vidange : volume d'un cylindre, débit, fonction affine décroissante ---------- */
function paCyl(rl, hl) {
  return svgFig(340, 200, '<ellipse class="ffill" cx="150" cy="40" rx="105" ry="26"/><ellipse class="fl" cx="150" cy="40" rx="105" ry="26"/>' +
    '<line class="fl" x1="45" y1="40" x2="45" y2="164"/><line class="fl" x1="255" y1="40" x2="255" y2="164"/>' +
    '<path class="fl" d="M45 164 A105 26 0 0 0 255 164"/><path class="fdash" d="M45 164 A105 26 0 0 1 255 164"/>' +
    '<line class="fhl" x1="150" y1="40" x2="255" y2="40"/><circle class="fpt" cx="150" cy="40" r="3"/>' +
    '<text class="ftx" x="203" y="33" text-anchor="middle">' + rl + '</text>' +
    '<line class="fl2" x1="282" y1="46" x2="282" y2="158"/><polygon class="fpt" points="282,40 278,49 286,49"/><polygon class="fpt" points="282,164 278,155 286,155"/>' +
    '<text class="ftx" x="290" y="107">' + hl + '</text>', 'Bassin cylindrique');
}
paProb({ id: 'p2.vidange', ch: 'fn', lvl: 2, pts: 4,
  ru: 'Слив бассейна', fr: 'La vidange d\'un bassin',
  src: 'Polynésie septembre 2024 · exercice 5',
  gen(r) {
    let R, H, Q, V0, q, W;
    do { R = r.pick([3, 3.2, 3.5, 3.6, 3.8, 4]); H = r.pick([1.2, 1.4, 1.5]); Q = r.pick([12, 12.6, 13.2, 13.8, 14.1, 14.4, 15]); V0 = paR(Math.PI * R * R * H, 1); q = +(Q / 60).toFixed(4); W = r.pick([10, 15, 20, 25, 30]); }
    while (V0 - 2 * Q < 5 || W > V0 - 8 || Math.round(V0 * 10) % 10 === 0 || paR(3.14 * R * R * H, 1) !== V0);   /* the last condition: the answer is the same with the π key and with 3,14 */
    const tW = (V0 - W) / q, tE = V0 / q, rW = paR(tW, 0), rE = paR(tE, 0), hE = paHM(rE);
    const vt = '$$V : t \\mapsto ' + texNum(fx(V0)) + '-' + texNum(fx(q)) + 't$$';   /* the French notation t ↦ … */
    const ctx = L('La piscine d\'un camping possède un bassin en forme de cylindre de rayon ' + nf(R) + ' m et de hauteur ' + nf(H) + ' m. En fin de saison, on vide ce bassin avec une pompe dont le débit est de ' + nf(Q) + ' m³ par heure. Rappel : volume d\'un cylindre = π × rayon² × hauteur.',
      'В кемпинге есть бассейн в форме цилиндра радиусом ' + nf(R) + ' м и высотой ' + nf(H) + ' м. В конце сезона его сливают насосом, который откачивает ' + nf(Q) + ' м³ в час. Напоминание: объём цилиндра = π × радиус² × высота.');
    const fig = paCyl(nf(R) + ' m', nf(H) + ' m');
    return { ctx, fig, qs: [
      { q: L('Calculer le volume du bassin, en m³. Arrondir au dixième.', 'Вычисли объём бассейна в м³. Округли до десятых.'), ans: N(paK(V0, 1), { dp: 1, unit: 'm³' }), sol: [
          { t: 'Объём цилиндра = π × радиус² × высота (в м³):', tex: '\\pi\\times ' + texNum(fx(R)) + '^{2}\\times ' + texNum(fx(H)) + '\\approx ' + texNum(paK(V0, 1)) },
          'Сначала возводим в квадрат только радиус, потом умножаем на π и на высоту. На экзамене бери π клавишей калькулятора, а не 3,14: с 3,14 последняя цифра округлённого ответа иногда получается другой.'],
        redac: ['$V=π*' + fx(R) + '^2*' + fx(H) + '≈' + paK(V0, 1) + '$',
          'Le volume du bassin est d\'environ ' + nf(V0) + ' m³.'] },
      { q: L('Le bassin est plein et on met la pompe en route. Au bout de 2 heures, quel volume d\'eau reste-t-il à vider ? On utilisera la valeur arrondie du volume du bassin.', 'Бассейн полон, насос включили. Какой объём воды останется откачать через 2 часа? Возьми округлённое значение объёма бассейна.'),
        ans: N(fx(V0 - 2 * Q), { unit: 'm³' }), sol: [
          ['За 2 часа насос откачивает:', '2*' + fx(Q) + '=' + fx(2 * Q), 'м³'],
          ['Остаётся:', fx(V0) + '-' + fx(2 * Q) + '=' + fx(V0 - 2 * Q), 'м³']],
        redac: ['En 2 heures, la pompe vide $2*' + fx(Q) + '=' + fx(2 * Q) + '$ m³.',
          '$' + fx(V0) + '-' + fx(2 * Q) + '=' + fx(V0 - 2 * Q) + '$',
          'Au bout de 2 heures, il reste ' + nf(V0 - 2 * Q) + ' m³ d\'eau à vider.'] },
      { q: L('On considère la fonction ' + vt + ', où $t$ est la durée de fonctionnement de la pompe, en minutes. Pourquoi $V(t)$ donne-t-il le volume d\'eau, en m³, qui reste à vider ? Choisir la bonne justification.', 'Рассмотрим функцию ' + vt + ', где $t$ — время работы насоса в минутах. Почему $V(t)$ — это объём воды (в м³), который осталось откачать? Выбери верное обоснование.'), red: true,
        ans: MQ(r, [
          L('Chaque minute, la pompe vide ' + nf(Q) + ' ÷ 60 = ' + nf(q) + ' m³ ; en $t$ minutes, elle vide $' + fx(q) + 't$ m³, qu\'on retire aux ' + nf(V0) + ' m³ du départ.', 'Каждую минуту насос откачивает ' + nf(Q) + ' ÷ 60 = ' + nf(q) + ' м³; за $t$ минут — $' + fx(q) + 't$ м³, их вычитаем из ' + nf(V0) + ' м³ в начале.'),
          L('Car ' + nf(q) + ' m³ est le volume vidé par la pompe en une heure.', 'Потому что ' + nf(q) + ' м³ — объём, который насос откачивает за час.'),
          L('Car le volume d\'eau diminue de ' + nf(q) + ' % chaque minute.', 'Потому что объём воды уменьшается на ' + nf(q) + ' % каждую минуту.'),
          L('Car le volume d\'eau qui reste est proportionnel à la durée $t$.', 'Потому что оставшийся объём пропорционален времени $t$.')], 0), sol: [
          'Расход ' + nf(Q) + ' м³ в час — это ' + nf(Q) + ' м³ за 60 минут, значит, за минуту ' + nf(Q) + ' ÷ 60 = ' + nf(q) + ' м³. За $t$ минут откачано ' + nf(q) + ' × t м³, и это вычитают из начального объёма.',
          nf(q) + ' м³ — это за минуту, а не за час. Это не проценты: каждую минуту уходит один и тот же объём, а не одна и та же доля. И остаток не пропорционален времени: при $t=0$ он равен ' + nf(V0) + ', а не 0 (это убывающая функция вида $at+b$, по-французски «fonction affine»).'],
        redac: ['La pompe vide ' + nf(Q) + ' m³ en 60 minutes, soit $' + fx(Q) + '÷60=' + fx(q) + '$ m³ par minute.',
          'En $t$ minutes, elle vide donc $' + fx(q) + 't$ m³.',
          'Le bassin contient ' + nf(V0) + ' m³ au départ : il reste $' + fx(V0) + '-' + fx(q) + 't$ m³ à vider, c\'est-à-dire $V(t)$.'] },
      { q: L('Calculer le temps nécessaire, en minutes, pour qu\'il ne reste plus que ' + W + ' m³ d\'eau à vider. Arrondir à la minute.', 'Найди время (в минутах), через которое останется откачать только ' + W + ' м³ воды. Округли до минуты.'),
        ans: N(paK(tW, 0), { dp: 0, unit: 'min' }), sol: [
          ['Решаем уравнение $V(t)=' + W + '$:', fx(V0) + '-' + fx(q) + 't=' + W],
          ['Переносим: ' + fx(q).replace('.', ',') + 't = ' + fx(V0).replace('.', ',') + ' − ' + W + ', затем делим на ' + fx(q).replace('.', ',') + ':', fx(q) + 't=' + fx(V0 - W) + ';t=' + fx(V0 - W) + '÷' + fx(q) + paMid(tW)],
          paExact(tW, 0) ? 'Ровно ' + rW + ' мин.' : 'Округляем до минуты: примерно ' + rW + ' мин.'],
        redac: ['On cherche $t$ tel que $V(t)=' + W + '$, c\'est-à-dire $' + fx(V0) + '-' + fx(q) + 't=' + W + '$.',
          '$' + fx(q) + 't=' + fx(V0 - W) + '$, donc $t=' + fx(V0 - W) + '÷' + fx(q) + paMid(tW) + '$.',
          'Il faut ' + (paExact(tW, 0) ? '' : 'environ ') + rW + ' minutes pour qu\'il ne reste plus que ' + W + ' m³ d\'eau à vider.'] },
      { q: L('Combien de temps faut-il pour vider complètement le bassin ? Donner la réponse en minutes, arrondie à la minute.', 'Сколько времени нужно, чтобы полностью слить бассейн? Ответ дай в минутах, округлив до минуты.'),
        ans: N(paK(tE, 0), { dp: 0, unit: 'min' }), sol: [
          ['Бассейн пуст, когда $V(t)=0$:', fx(V0) + '-' + fx(q) + 't=0;t=' + fx(V0) + '÷' + fx(q) + paMid(tE)],
          (paExact(tE, 0) ? 'Ровно ' : 'Примерно ') + rE + ' мин, то есть ' + hE.ru + '.',
          'Можно и без функции: ' + nf(V0) + ' м³ ÷ ' + nf(Q) + ' м³/ч ' + paEq(V0 / Q, 2) + ' ' + paFz(V0 / Q, 2) + ' ч — то же время.'],
        redac: ['Le bassin est vide lorsque $V(t)=0$, c\'est-à-dire $' + fx(V0) + '-' + fx(q) + 't=0$.',
          '$' + fx(q) + 't=' + fx(V0) + '$, donc $t=' + fx(V0) + '÷' + fx(q) + paMid(tE) + '$.',
          'Il faut ' + (paExact(tE, 0) ? '' : 'environ ') + rE + ' minutes, soit ' + hE.fr + ', pour vider complètement le bassin.'] }] };
  } });

/* =====================================================================================================
   ALGORITHMIQUE ET TABLEUR
   ===================================================================================================== */

/* ---------- p2.photos : tarif par tranches, programme Scratch à compléter, soldes ---------- */
paProb({ id: 'p2.photos', ch: 'al', lvl: 2, pts: 5,
  ru: 'Печать фотографий', fr: 'Des tirages photo en ligne',
  src: 'Asie 2022 · exercice 4',
  gen(r) {
    let u1c, u2c, n1, n2, Bg, rd, S, P2;
    do { u1c = r.ri(15, 20); u2c = u1c - r.ri(3, 5); n1 = r.ri(20, 95); n2 = r.ri(110, 260); Bg = r.pick([8, 10, 12]); rd = r.pick([20, 25, 30, 40]); S = r.pick([20, 25]); P2 = 100 * u1c + (n2 - 100) * u2c; }
    while (P2 <= S * 100 + 100 || Bg * 100 % u1c === 0);
    const u1 = u1c / 100, u2 = u2c / 100, F = u1c, P1 = n1 * u1c / 100, Pv = P2 / 100, nMax = Math.floor(Bg * 100 / u1c);
    const coef = 1 - rd / 100, Ps = Pv * coef, sn = paNum(Ps, 2, '€', 'Arrondir au centime.', 'Округли до цента.');
    const fig = paTbl([['Nombre de photos commandées', 'Prix à payer'], ['De 1 à 100 photos', eur(u1) + ' par photo'], ['Plus de 100 photos', eur(F) + ' pour les 100 premières photos, puis ' + eur(u2) + ' par photo supplémentaire']]);
    const ctx = L('Une boutique en ligne vend des tirages de photos et affiche les tarifs ci-dessous.',
      'Интернет-магазин печатает фотографии. Тарифы: от 1 до 100 фото — ' + eur(u1) + ' за фото; больше 100 фото — ' + eur(F) + ' за первые 100 фото и ' + eur(u2) + ' за каждое следующее.');
    const prog = paScratch([
      { k: 'hat', d: 0, c: 'ev', n: 1, p: ['quand', { flag: 1 }, 'est cliqué'] },
      { d: 0, c: 'sns', n: 2, p: ['demander', { n: 'Nombre de photos ?' }, 'et attendre'] },
      { d: 0, c: 'vr', n: 3, p: ['mettre', { dd: 'n' }, 'à', { sv: 'réponse' }] },
      { k: 'c', d: 0, c: 'ctl', n: 4, p: ['si', { bo: [{ v: 'n' }, '>', { n: '100' }] }, 'alors'] },
      { d: 1, c: 'vr', n: 5, p: ['mettre', { dd: 's' }, 'à', { op: [{ v: 'n' }, '-', { bl: 'A' }] }] },
      { d: 1, c: 'vr', n: 6, p: ['mettre', { dd: 'prix' }, 'à', { op: [{ bl: 'B' }, '+', { op: [{ v: 's' }, '*', { n: String(u2) }] }] }] },
      { k: 'else', d: 0, c: 'ctl', n: 7, p: ['sinon'] },
      { d: 1, c: 'vr', n: 8, p: ['mettre', { dd: 'prix' }, 'à', { op: [{ v: 'n' }, '*', { bl: 'C' }] }] },
      { k: 'end', d: 0, c: 'ctl' },
      { d: 0, c: 'lk', n: 9, p: ['dire', { v: 'prix' }] }], 'Programme Scratch qui calcule le prix à payer');
    const soldes = paScratch([
      { k: 'c', d: 0, c: 'ctl', p: ['si', { bo: [{ v: 'prix' }, '>', { n: String(S) }] }, 'alors'] },
      { d: 1, c: 'vr', p: ['mettre', { dd: 'prix' }, 'à', { op: [{ v: 'prix' }, '*', { bl: '?' }] }] },
      { k: 'end', d: 0, c: 'ctl' }], 'Bloc ajouté pour les soldes');
    return { ctx, fig, qs: [
      { q: L('Quel est le prix à payer pour ' + n1 + ' photos ?', 'Сколько стоят ' + n1 + ' фото?'), ans: N(fx(P1), { unit: '€' }), sol: [
          n1 + ' фото — не больше 100, значит, каждое по ' + eur(u1) + '.',
          ['', n1 + '*' + fx(u1) + '=' + fx(P1), '€']],
        redac: [n1 + ' photos, c\'est moins de 100 photos : chaque photo coûte ' + eur(u1) + '.',
          '$' + n1 + '*' + fx(u1) + '=' + fx(P1) + '$',
          'Le prix à payer pour ' + n1 + ' photos est de ' + eur(P1) + '.'] },
      { q: L('Quel est le prix à payer pour ' + n2 + ' photos ?', 'Сколько стоят ' + n2 + ' фото?'), ans: N(fx(Pv), { unit: '€' }), sol: [
          'Больше 100 фото: первые 100 стоят вместе ' + eur(F) + ', а остальные ' + n2 + ' − 100 = ' + (n2 - 100) + ' — по ' + eur(u2) + '.',
          ['', F + '+' + (n2 - 100) + '*' + fx(u2) + '=' + fx(Pv), '€'],
          'Ошибка — умножить все ' + n2 + ' фото на ' + eur(u2) + ': дешёвая цена действует только для фото после сотой.'],
        redac: ['Les 100 premières photos coûtent ' + eur(F) + ' ; il reste $' + n2 + '-100=' + (n2 - 100) + '$ photos à ' + eur(u2) + ' chacune.',
          '$' + F + '+' + (n2 - 100) + '*' + fx(u2) + '=' + fx(Pv) + '$',
          'Le prix à payer pour ' + n2 + ' photos est de ' + eur(Pv) + '.'] },
      { q: L('On dispose d\'un budget de ' + Bg + ' €. Combien de photos peut-on commander au maximum ?', 'Бюджет — ' + Bg + ' €. Какое наибольшее число фото можно заказать?'), ans: N(nMax), sol: [
          Bg + ' € меньше, чем ' + eur(F) + ' за 100 фото, значит, заказ меньше 100 фото и каждое стоит ' + eur(u1) + '.',
          ['Сколько раз ' + eur(u1) + ' помещается в ' + Bg + ' €:', Bg + '÷' + fx(u1) + paEq(Bg / u1, 2) + paKz(Bg / u1, 2)],
          'Число фото — целое, и превышать бюджет нельзя, поэтому округляем вниз: ' + nMax + ' фото (' + nMax + ' × ' + nf(u1) + ' = ' + eur(nMax * u1c / 100) + ', а ' + (nMax + 1) + ' фото стоили бы ' + eur((nMax + 1) * u1c / 100) + ').'],
        redac: ['100 photos coûtent ' + eur(F) + ', ce qui dépasse le budget : on commande donc moins de 100 photos, à ' + eur(u1) + ' la photo.',
          '$' + Bg + '÷' + fx(u1) + paEq(Bg / u1, 2) + paKz(Bg / u1, 2) + '$',
          '$' + nMax + '*' + fx(u1) + '=' + fx(nMax * u1c / 100) + '$ et $' + (nMax + 1) + '*' + fx(u1) + '=' + fx((nMax + 1) * u1c / 100) + '$, ce qui dépasse ' + Bg + ' €.',
          'On peut commander au maximum ' + nMax + ' photos.'] },
      { q: L('On a écrit le programme ci-dessous pour calculer le prix à payer. Il utilise trois variables : n (nombre de photos commandées), s (nombre de photos commandées au-delà des 100 premières) et prix (prix à payer, en euros). Par quels nombres faut-il remplacer A, B et C ?',
          'Ниже — программа, которая считает цену заказа. В ней три переменные: n (число заказанных фото), s (число фото сверх первых 100) и prix (цена в евро). Какими числами нужно заменить A, B и C? Блоки программы: «quand … est cliqué» — когда нажат флажок; «demander … et attendre» — спросить и ждать ответа («réponse» — этот ответ); «mettre … à …» — присвоить переменной значение; «si … alors … sinon …» — если … то … иначе …; «dire» — сказать (показать).'),
        fig: prog, ans: multi(['A =', N(100)], ['B =', N(F)], ['C =', N(fx(u1))]), sol: [
          'Строка 5: s — число фото сверх первых 100, поэтому s = n − 100: A = 100.',
          'Строка 6: цена = ' + eur(F) + ' за первые 100 фото плюс по ' + eur(u2) + ' за каждое из s остальных: B = ' + F + '.',
          'Строка 8 (ветка «sinon», то есть не больше 100 фото): цена = n × ' + nf(u1) + ': C = ' + nf(u1) + '. В Scratch десятичную дробь пишут с точкой: ' + u1 + '.'],
        redac: ['A = 100 : s est le nombre de photos commandées au-delà des 100 premières, donc s = n − 100.',
          'B = ' + F + ' : les 100 premières photos coûtent ' + eur(F) + '.',
          'C = ' + nf(u1) + ' : jusqu\'à 100 photos, chaque photo coûte ' + eur(u1) + '.'] },
      { q: L('En période de soldes, le site offre une réduction de ' + rd + ' % sur le prix à payer, pour toute commande de plus de ' + S + ' €. Calculer le prix à payer pour ' + n2 + ' photos pendant les soldes.' + sn.fr,
          'Во время распродажи сайт даёт скидку ' + rd + ' % на заказы дороже ' + S + ' €. Сколько будут стоить ' + n2 + ' фото во время распродажи?' + sn.ru),
        ans: sn.ans, sol: [
          'Без скидки заказ стоит ' + eur(Pv) + ' (вопрос 2) — больше ' + S + ' €, значит, скидка действует.',
          ['Скидка ' + rd + ' % — платим ' + (100 - rd) + ' % цены, то есть умножаем на ' + nf(coef) + ':', fx(Pv) + '*' + fx(coef) + sn.eq + (sn.eq === '=' ? fx(Ps) : paK(Ps, 2)), '€']],
        redac: ['Sans réduction, le prix à payer est de ' + eur(Pv) + '. Comme $' + fx(Pv) + '>' + S + '$, la réduction s\'applique.',
          'Diminuer un prix de ' + rd + ' %, c\'est le multiplier par $1-' + rd + '/100=' + fx(coef) + '$.',
          '$' + fx(Pv) + '*' + fx(coef) + sn.eq + (sn.eq === '=' ? fx(Ps) : paK(Ps, 2)) + '$',
          'Pendant les soldes, le prix à payer pour ' + n2 + ' photos est ' + (sn.eq === '=' ? 'de ' : 'd\'environ ') + eur(paR(Ps, 2)) + '.'] },
      { q: L('Pour que le programme donne le prix pendant les soldes, on insère le bloc ci-dessous entre les lignes 8 et 9. Quel nombre faut-il écrire dans la case vide ? Choisir la réponse correctement justifiée.', 'Чтобы программа считала цену во время распродажи, между строками 8 и 9 вставляют блок ниже («если prix > ' + S + ', то заменить prix на prix × …»). Какое число нужно написать в пустую ячейку? Выбери ответ с верным обоснованием.'),
        fig: soldes, red: true, ans: MQ(r, [
          L(nf(coef) + ' : baisser un prix de ' + rd + ' %, c\'est garder ' + (100 - rd) + ' % du prix, donc le multiplier par 1 − ' + nf(rd / 100) + ' = ' + nf(coef) + '.', nf(coef) + ': снизить цену на ' + rd + ' % — значит оставить ' + (100 - rd) + ' % цены, то есть умножить на 1 − ' + nf(rd / 100) + ' = ' + nf(coef) + '.'),
          L(nf(rd / 100) + ' : pour enlever ' + rd + ' % d\'un prix, on le multiplie par ' + rd + '/100.', nf(rd / 100) + ': чтобы убрать ' + rd + ' % цены, умножаем её на ' + rd + '/100.'),
          L(rd + ' : une réduction de ' + rd + ' % se traduit par le nombre ' + rd + '.', rd + ': скидка ' + rd + ' % записывается числом ' + rd + '.'),
          L(nf(coef) + ' : c\'est la réduction, en euros, accordée sur chaque photo.', nf(coef) + ': это скидка в евро на каждое фото.')], 0), sol: [
          'Блок заменяет prix на prix × (число). После скидки ' + rd + ' % остаётся ' + (100 - rd) + ' % цены, а взять ' + (100 - rd) + ' % — значит умножить на ' + nf(coef) + '.',
          'Умножение на ' + nf(rd / 100) + ' даёт размер скидки, а не новую цену. Число ' + rd + ' увеличило бы цену в ' + rd + ' раз. А ' + nf(coef) + ' — не скидка в евро, а доля цены, которая остаётся. В самом блоке Scratch число пишут с точкой: ' + fx(coef) + '.'],
        redac: ['Diminuer un prix de ' + rd + ' %, c\'est le multiplier par $1-' + rd + '/100=' + fx(coef) + '$.',
          'Il faut donc écrire ' + nf(coef) + ' dans la case vide : le prix est multiplié par ' + nf(coef) + '.'] }] };
  } });

/* ---------- p2.tableur-prog : programme à deux branches, formule de tableur, forme factorisée, équation produit ---------- */
paProb({ id: 'p2.tableur-prog', ch: 'al', lvl: 2, pts: 4,
  ru: 'Программа и электронная таблица', fr: 'Un programme et un tableur',
  src: 'Asie 2026 · exercice 3',
  gen(r) {
    const nm = r.pick(PRENOMS_M);
    let p, q, s, b; do { p = r.pick([2, 3]); q = r.pick([1, 2, 3, 4, 5, 7]); s = r.ri(1, 5); b = p * s - q; } while (q % p === 0 || b < 2 || b > 9 || 35 * p === 10 * b + 2 * q * s);   /* the last condition: the wrong formula «…*A2*2-…» must not give the right number in B2 */
    const c = q * s, A = x => p * x * x + b * x - c, x0 = r.ri(4, 6), ex = quad(p, b, -c), root = Fr.str(F(q, p));
    const figA = paFlow('Choisir un nombre', ['Calculer son carré', 'Multiplier par ' + p], ['Multiplier par ' + b], ['Additionner les deux nombres', 'Soustraire ' + c], 'Programme A');
    const figB = paFlow('Choisir un nombre', ['Multiplier par ' + p, 'Soustraire ' + q], ['Ajouter ' + s], ['Multiplier les deux nombres'], 'Programme B');
    const rows = [['', 'A', 'B'], ['1', 'Nombre choisi', 'Résultat']]; for (let x = -5; x <= 3; x++) rows.push([String(x + 7), nf(x), nf(A(x))]);
    const tab = paTbl(rows, 'side');
    const F0 = '=' + p + '*A2*A2+' + b + '*A2-' + c;
    const ctx = L('On considère le programme A ci-dessous.',
      'Дана программа A: выбрать число; с одной стороны — возвести его в квадрат и умножить на ' + p + '; с другой — умножить число на ' + b + '; сложить два результата; вычесть ' + c + '.');
    return { ctx, fig: figA, qs: [
      { q: L('Appliquer le programme A au nombre ' + x0 + '.', 'Примени программу A к числу ' + x0 + '.'), ans: N(A(x0)), sol: [
          ['Левая ветка: квадрат, потом умножить на ' + p + ':', x0 + '^2=' + (x0 * x0) + ';' + (x0 * x0) + '*' + p + '=' + (p * x0 * x0)],
          ['Правая ветка:', x0 + '*' + b + '=' + (b * x0)],
          ['Складываем и вычитаем ' + c + ':', (p * x0 * x0) + '+' + (b * x0) + '-' + c + '=' + A(x0)]],
        redac: [paEqs(x0 + '^2=' + (x0 * x0) + ';' + (x0 * x0) + '*' + p + '=' + (p * x0 * x0) + ';' + x0 + '*' + b + '=' + (b * x0)) + '.',
          paEqs((p * x0 * x0) + '+' + (b * x0) + '=' + (p * x0 * x0 + b * x0) + ';' + (p * x0 * x0 + b * x0) + '-' + c + '=' + A(x0)) + '.',
          'Avec le nombre ' + x0 + ', le programme A donne ' + nf(A(x0)) + '.'] },
      { q: L('On utilise un tableur pour obtenir les résultats du programme A pour quelques nombres (voir ci-dessous). Parmi les formules suivantes, laquelle a été saisie dans la cellule B2, puis étirée vers le bas ?', 'В электронной таблице посчитали результаты программы A для нескольких чисел (см. ниже: в столбце A — выбранное число, «Nombre choisi», в столбце B — результат, «Résultat»). Какая из формул была введена в ячейку B2 и протянута вниз?'),
        fig: tab, ans: MQ(r, [F0, '=' + p + '*A2*2+' + b + '*A2-' + c, '=' + p + '*(-5)*(-5)+' + b + '*(-5)-' + c, '=' + p + '*A2*2-' + b + '*A2+' + c], 0), sol: [
          'Нужная формула должна ссылаться на ячейку A2 (где стоит выбранное число), чтобы при протягивании вниз ссылка менялась на A3, A4, … Формула с числом −5 всегда давала бы один и тот же результат.',
          'Квадрат числа — это A2*A2, а не A2*2 (это удвоение). Затем + ' + b + ' × A2 и − ' + c + ' — в том же порядке, что в программе. Подходит «' + F0 + '».'],
        redac: ['Le nombre choisi se trouve dans la cellule A2 ; son carré s\'écrit A2*A2.',
          'La formule saisie dans la cellule B2 est : ' + F0] },
      { q: L('À l\'aide du tableau, donner un nombre pour lequel le programme A donne 0.', 'По таблице найди число, для которого программа A даёт 0.'), ans: N(-s), sol: [
          'В столбце B ищем 0: он стоит в строке ' + (7 - s) + ', где в столбце A число ' + nf(-s) + '.',
          ['Проверка:', p + '*' + np(-s) + '^2+' + b + '*' + np(-s) + '-' + c + '=' + A(-s)]],
        redac: ['Dans le tableau, le résultat 0 se trouve sur la ligne ' + (7 - s) + ', en face du nombre $' + (-s) + '$.',
          'Le programme A donne 0 pour le nombre $' + (-s) + '$.'] },
      { q: L('On note $x$ le nombre de départ. Donner une expression du résultat du programme A en fonction de $x$.', 'Обозначим исходное число $x$. Запиши результат программы A через $x$.'), ans: XP(ex), sol: [
          ['Левая ветка даёт $' + p + 'x^2$, правая — $' + b + 'x$; складываем и вычитаем ' + c + ':', ex]],
        redac: ['Le carré de $x$ multiplié par ' + p + ' donne $' + p + 'x^2$ ; $x$ multiplié par ' + b + ' donne $' + b + 'x$.',
          'On additionne ces deux nombres, puis on soustrait ' + c + ' : le résultat du programme A est $' + ex + '$.'] },
      { q: L('On considère maintenant le programme B ci-dessous. ' + nm + ' affirme que, quel que soit le nombre choisi au départ, les programmes A et B donnent le même résultat. A-t-il raison ? Choisir la réponse correctement justifiée.', 'Теперь рассмотрим программу B (ниже): выбрать число; с одной стороны — умножить его на ' + p + ' и вычесть ' + q + '; с другой — прибавить к числу ' + s + '; перемножить два результата. ' + nm + ' утверждает, что при любом исходном числе программы A и B дают одинаковый результат. Прав ли он? Выбери ответ с верным обоснованием.'),
        fig: figB, red: true, ans: MQ(r, [
          L('Oui : le programme B donne $(' + lin(p, -q) + ')(x+' + s + ')$ et, en développant, on obtient $' + ex + '$, l\'expression du programme A.', 'Да: программа B даёт $(' + lin(p, -q) + ')(x+' + s + ')$, а после раскрытия скобок получается $' + ex + '$ — выражение программы A.'),
          L('Oui, car les deux programmes donnent ' + A(x0) + ' pour le nombre ' + x0 + '.', 'Да, потому что обе программы дают ' + A(x0) + ' для числа ' + x0 + '.'),
          L('Non, car les deux programmes n\'ont pas les mêmes étapes.', 'Нет, потому что у программ разные шаги.'),
          L('Non, car on ne peut pas tester tous les nombres.', 'Нет, потому что все числа проверить невозможно.')], 0), sol: [
          ['Программа B с буквой $x$: левая ветка $' + lin(p, -q) + '$, правая $x+' + s + '$, их произведение. Раскрываем скобки:', '(' + lin(p, -q) + ')(x+' + s + ')=' + S(cf(p, 'x^2'), cf(p * s, 'x'), cf(-q, 'x'), String(-c)) + '=' + ex],
          'Получилось то же выражение, что у программы A, — значит, результаты совпадают при любом числе. Это доказательство «для всех чисел сразу».',
          'Один пример (' + x0 + ') ничего не доказывает. Разные шаги могут давать одинаковый результат. А перебирать все числа и не нужно — хватает буквенного вычисления.'],
        redac: ['Avec le programme B, on obtient $(' + lin(p, -q) + ')(x+' + s + ')$.',
          'On développe : $(' + lin(p, -q) + ')(x+' + s + ')=' + S(cf(p, 'x^2'), cf(p * s, 'x'), cf(-q, 'x'), String(-c)) + '$, soit $' + ex + '$.',
          'C\'est l\'expression obtenue avec le programme A : les deux programmes donnent donc le même résultat quel que soit le nombre choisi. ' + nm + ' a raison.'] },
      { q: L('Résoudre l\'équation $(' + lin(p, -q) + ')(x+' + s + ')=0$. En déduire les nombres pour lesquels les programmes A et B donnent 0.', 'Реши уравнение $(' + lin(p, -q) + ')(x+' + s + ')=0$. Найди числа, для которых программы A и B дают 0.'),
        ans: SOL(root + ', ' + (-s)), sol: [
          'Произведение равно 0, когда хотя бы один множитель равен 0 (уравнение-произведение, «équation produit»).',
          ['Первый множитель:', lin(p, -q) + '=0;' + p + 'x=' + q + ';x=' + root],
          ['Второй множитель:', 'x+' + s + '=0;x=' + (-s)],
          'Ответ: ' + (q % p ? '$' + root + '$' : root) + ' и ' + nf(-s) + '. Число ' + nf(-s) + ' мы уже видели в таблице, а ' + (q % p ? '$' + root + '$' : root) + ' там не было: таблица показывает только целые числа.'],
        redac: ['Un produit de facteurs est nul si, et seulement si, l\'un au moins de ses facteurs est nul.',
          '$' + lin(p, -q) + '=0$ ou $x+' + s + '=0$',
          '$' + p + 'x=' + q + '$ ou $x=' + (-s) + '$',
          '$x=' + root + '$ ou $x=' + (-s) + '$',
          'Les solutions sont $' + root + '$ et $' + (-s) + '$ : ce sont les nombres pour lesquels les programmes A et B donnent 0.'] }] };
  } });

/* ===================== DICTIONARY ===================== */
gloss('le débit', 'расход (производительность насоса)', 'объём, проходящий за единицу времени, например м³ в час');
gloss('un forfait', 'фиксированная плата', 'одна сумма за всё, независимо от количества');
gloss('un abonnement', 'абонемент, подписка');
gloss('une remise', 'скидка');
gloss('le dénivelé', 'перепад высот');
gloss('la pente', 'уклон', 'перепад высот ÷ горизонтальная длина, часто в %');
gloss('un aller-retour', 'поездка туда и обратно');
gloss('étirer une formule', 'протянуть формулу (в таблице)', 'скопировать формулу в соседние ячейки; ссылки вроде A2 сдвигаются на A3, A4…');
