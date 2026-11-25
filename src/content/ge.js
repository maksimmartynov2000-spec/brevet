/* ===================== Espace et géométrie (chapter ge) =====================
   All top-level names of this file start with geo (the content files share one scope).
   1. A small drawing kit: a scene that computes its own viewBox, labels that keep clear of the lines,
      triangles with their marks, grids, axes, solids in cavalier perspective, nets, a globe.
   2. Topics: angles, Pythagore (+ réciproque), Thalès (+ réciproque), trigonométrie, transformations,
      homothétie, repérage, solides et sections, inégalité triangulaire, quadrilatères.
   3. Fiches and dictionary. */

/* ---------- vectors (screen coordinates: y goes down) ---------- */
const geoV = (x, y) => ({ x, y });
const geoAdd = (a, b) => geoV(a.x + b.x, a.y + b.y);
const geoSub = (a, b) => geoV(a.x - b.x, a.y - b.y);
const geoMul = (a, k) => geoV(a.x * k, a.y * k);
const geoLen = a => Math.hypot(a.x, a.y);
const geoDist = (a, b) => geoLen(geoSub(a, b));
const geoUnit = a => { const l = geoLen(a) || 1; return geoV(a.x / l, a.y / l); };
const geoPerp = a => geoV(-a.y, a.x);
const geoMid = (a, b) => geoV((a.x + b.x) / 2, (a.y + b.y) / 2);
const geoLerp = (a, b, t) => geoV(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
const geoDp = (a, b) => a.x * b.x + a.y * b.y;
const geoCross = (a, b) => a.x * b.y - a.y * b.x;
const geoRot = (a, deg) => { const t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t); return geoV(a.x * c - a.y * s, a.x * s + a.y * c); };
const geoPol = (r, deg) => geoV(r * Math.cos(deg * Math.PI / 180), r * Math.sin(deg * Math.PI / 180));
const geoCen = ps => geoV(ps.reduce((s, p) => s + p.x, 0) / ps.length, ps.reduce((s, p) => s + p.y, 0) / ps.length);
const geoRad = d => d * Math.PI / 180, geoDeg = t => t * 180 / Math.PI;
const geoC = v => String(Math.round(v * 10) / 10);
const geoEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const GEO_FS = 15;

/* width of a label in svg units (system sans-serif) */
function geoTW(s, fs) {
  let w = 0;
  for (const ch of String(s)) w += /\d/.test(ch) ? 0.57 : /[A-Z]/.test(ch) ? 0.7 : /[a-z]/.test(ch) ? 0.53 : /[ ,.;:'′]/.test(ch) ? 0.3 : ch === '°' ? 0.42 : /[()]/.test(ch) ? 0.36 : 0.62;
  return w * (fs || GEO_FS);
}

/* fit points given in maths coordinates (y up) into a W×H box: returns the map to screen coordinates */
function geoFit(ps, W, H) {
  const xs = ps.map(p => p.x), ys = ps.map(p => p.y);
  const mx = Math.min(...xs), Mx = Math.max(...xs), my = Math.min(...ys), My = Math.max(...ys);
  const k = Math.min(W / ((Mx - mx) || 1e-9), H / ((My - my) || 1e-9));
  const ox = (W - (Mx - mx) * k) / 2, oy = (H - (My - my) * k) / 2;
  const f = p => geoV(ox + (p.x - mx) * k, oy + (My - p.y) * k); f.k = k; return f;
}

/* ---------- scene: collects svg elements and their bounding box ---------- */
const geoD = (ps, closed) => ps.map((p, i) => (i ? 'L' : 'M') + geoC(p.x) + ' ' + geoC(p.y)).join('') + (closed ? 'Z' : '');
/* does segment [ab] cross the box (Liang–Barsky) */
function geoHit(a, b, x0, y0, x1, y1) {
  let t0 = 0, t1 = 1; const dx = b.x - a.x, dy = b.y - a.y, p = [-dx, dx, -dy, dy], q = [a.x - x0, x1 - a.x, a.y - y0, y1 - a.y];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return false; continue; }
    const t = q[i] / p[i];
    if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return true;
}
const GEO_SOLID = /^(fl|fl2|fhl|fdash|fang|fax|fcurve)$/;   /* lines that labels must not cross */
function geoScene() {
  const S = { el: [], x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity, lines: [], boxes: [] };
  S.box = (x0, y0, x1, y1) => { S.x0 = Math.min(S.x0, x0, x1); S.y0 = Math.min(S.y0, y0, y1); S.x1 = Math.max(S.x1, x0, x1); S.y1 = Math.max(S.y1, y0, y1); };
  S.pts = ps => ps.forEach(p => S.box(p.x, p.y, p.x, p.y));
  S.raw = s => S.el.push(s);
  S.line = (ps, closed) => { for (let i = 0; i + 1 < ps.length; i++) S.lines.push([ps[i], ps[i + 1]]); if (closed && ps.length > 2) S.lines.push([ps[ps.length - 1], ps[0]]); };
  /* is a label box centred at c (half sizes hw, hh) clear of the lines and of the other labels */
  S.free = (c, hw, hh) => {
    const x0 = c.x - hw - 1.5, x1 = c.x + hw + 1.5, y0 = c.y - hh - 1.5, y1 = c.y + hh + 1.5;
    if (S.boxes.some(b => !(x1 + 3 < b[0] || x0 - 3 > b[2] || y1 + 2 < b[1] || y0 - 2 > b[3]))) return false;
    return !S.lines.some(([a, b]) => geoHit(a, b, x0, y0, x1, y1));
  };
  S.seg = (a, b, cls) => { cls = cls || 'fl'; S.pts([a, b]); if (GEO_SOLID.test(cls)) S.line([a, b]); S.el.push('<line x1="' + geoC(a.x) + '" y1="' + geoC(a.y) + '" x2="' + geoC(b.x) + '" y2="' + geoC(b.y) + '" class="' + cls + '"/>'); };
  /* polygon or polyline; filled only with the fill classes */
  S.poly = (ps, cls, open) => { cls = cls || 'fl'; S.pts(ps); if (GEO_SOLID.test(cls)) S.line(ps, !open); S.el.push('<path d="' + geoD(ps, !open) + '" class="' + cls + '"' + (/^(ffill|fc\d|fbar)$/.test(cls) ? '' : ' fill="none"') + '/>'); };
  S.path = (d, cls, ps) => { if (ps) S.pts(ps); S.el.push('<path d="' + d + '" class="' + cls + '"' + (/^(ffill|fc\d|fbar)$/.test(cls) ? '' : ' fill="none"') + '/>'); };
  S.circle = (c, r, cls) => { S.box(c.x - r, c.y - r, c.x + r, c.y + r); S.el.push('<circle cx="' + geoC(c.x) + '" cy="' + geoC(c.y) + '" r="' + geoC(r) + '" class="' + (cls || 'fl') + '"' + (/^(ffill|fc\d)$/.test(cls) ? '' : ' fill="none"') + '/>'); if (GEO_SOLID.test(cls || 'fl')) { const ps = []; for (let i = 0; i <= 24; i++) ps.push(geoAdd(c, geoPol(r, i * 15))); S.line(ps); } };
  S.ellipse = (c, rx, ry, cls) => { S.box(c.x - rx, c.y - ry, c.x + rx, c.y + ry); S.el.push('<ellipse cx="' + geoC(c.x) + '" cy="' + geoC(c.y) + '" rx="' + geoC(rx) + '" ry="' + geoC(ry) + '" class="' + (cls || 'fl') + '"' + (/^(ffill|fc\d)$/.test(cls) ? '' : ' fill="none"') + '/>'); if (GEO_SOLID.test(cls || 'fl')) { const ps = []; for (let i = 0; i <= 24; i++) ps.push(geoV(c.x + rx * Math.cos(i * Math.PI / 12), c.y + ry * Math.sin(i * Math.PI / 12))); S.line(ps); } };
  S.dot = (p, r) => { S.pts([p]); S.el.push('<circle cx="' + geoC(p.x) + '" cy="' + geoC(p.y) + '" r="' + (r || 3) + '" class="fpt"/>'); };
  /* text centred on point c */
  S.text = (c, s, o) => {
    o = o || {}; const fs = o.fs || GEO_FS, w = geoTW(s, fs);
    const anc = o.anchor || 'middle', x0 = anc === 'start' ? c.x : anc === 'end' ? c.x - w : c.x - w / 2;
    S.box(x0, c.y - fs * 0.5, x0 + w, c.y + fs * 0.5); S.boxes.push([x0, c.y - fs * 0.42, x0 + w, c.y + fs * 0.42]);
    S.el.push('<text x="' + geoC(c.x) + '" y="' + geoC(c.y + fs * 0.36) + '" class="' + (o.cls || 'ftx') + '" font-size="' + fs + '" text-anchor="' + anc + '"' + (o.it ? ' font-style="italic"' : '') + '>' + geoEsc(s) + '</text>');
  };
  /* final svg: at least minW wide, the drawing centred */
  S.svg = (label, minW) => {
    const m = 5; let x0 = S.x0 - m, w = S.x1 - S.x0 + 2 * m; const y0 = S.y0 - m, h = S.y1 - S.y0 + 2 * m;
    const W = minW || 340; if (w < W) { x0 -= (W - w) / 2; w = W; }
    return svgFig(geoC(w), geoC(h), '<g transform="translate(' + geoC(-x0) + ' ' + geoC(-y0) + ')">' + S.el.join('') + '</g>', label);
  };
  return S;
}

/* ---------- labels that keep clear of the lines ---------- */
/* label of segment [ab], on the side away from point `away` (or flipped); slides along the segment to stay clear */
function geoSegLab(S, a, b, txt, away, o) {
  o = o || {};
  const fs = o.fs || GEO_FS, hw = geoTW(txt, fs) / 2 + 1, hh = fs * 0.42;
  let n = geoUnit(geoPerp(geoSub(b, a)));
  if (away && geoDp(n, geoSub(away, geoLerp(a, b, 0.5))) > 0) n = geoMul(n, -1);
  if (o.flip) n = geoMul(n, -1);
  const d = Math.abs(n.x) * hw + Math.abs(n.y) * hh + (o.gap == null ? 5 : o.gap), t0 = o.t == null ? 0.5 : o.t;
  const ts = [t0, t0 + 0.12, t0 - 0.12, t0 + 0.24, t0 - 0.24, t0 + 0.34, t0 - 0.34].filter(t => t > 0.08 && t < 0.92);
  const cands = ts.map(t => geoAdd(geoLerp(a, b, t), geoMul(n, d)));
  if (o.canFlip) ts.forEach(t => cands.push(geoAdd(geoLerp(a, b, t), geoMul(n, -d))));
  for (let extra = 0; extra <= 12; extra += 6) { const c = cands.map(p => geoAdd(p, geoMul(n, extra))).find(p => S.free(p, hw, hh)); if (c) { S.text(c, txt, o); return; } }
  S.text(cands[0], txt, o);
}
/* label of point p, pushed in direction dir (turns around p if that place is taken) */
function geoPtLab(S, p, dir, txt, o) {
  o = o || {};
  const fs = o.fs || GEO_FS, hw = geoTW(txt, fs) / 2, hh = fs * 0.42, u0 = geoUnit(dir), gap = o.gap == null ? 4 : o.gap;
  const at = (u, e) => { const d = Math.abs(u.x) * hw + Math.abs(u.y) * hh + gap + e; return geoAdd(p, geoMul(u, d)); };
  for (const e of [0, 5, 10, 16]) for (const ang of [0, 22, -22, 45, -45, 70, -70, 100, -100, 135, -135, 180]) { const c = at(geoRot(u0, ang), e); if (S.free(c, hw, hh)) { S.text(c, txt, o); return; } }
  S.text(at(u0, 0), txt, o);
}
/* outward direction at vertex v of a convex polygon (neighbours a and b) */
const geoOut = (v, a, b) => { const d = geoAdd(geoUnit(geoSub(v, a)), geoUnit(geoSub(v, b))); return geoLen(d) < 1e-6 ? geoPerp(geoSub(b, a)) : d; };
/* angle mark at v between rays to a and b: arc (or double arc) and an optional label inside the angle */
function geoArc(S, v, a, b, o) {
  o = o || {};
  let r = o.r || 22; const u1 = geoUnit(geoSub(a, v)), u2 = geoUnit(geoSub(b, v)), sw = geoCross(u1, u2) > 0 ? 1 : 0, u = geoUnit(geoAdd(u1, u2));
  let lab = null;
  if (o.txt) {
    const fs = o.fs || GEO_FS, hw = geoTW(o.txt, fs) / 2 + 1, hh = fs * 0.42, eu = Math.abs(u.x) * hw + Math.abs(u.y) * hh;
    const half = Math.acos(Math.max(-1, Math.min(1, geoDp(u1, u2)))) / 2;
    const ext = e => { const n = geoPerp(e); return Math.abs(n.x) * hw + Math.abs(n.y) * hh + 3; };
    let t = Math.max(ext(u1), ext(u2)) / Math.max(Math.sin(half), 0.2);
    if (t - eu - 4 > r) r = Math.min(t - eu - 4, o.rmax || 40);      /* narrow angle: a wider arc, so the label stays next to it */
    t = Math.max(t, r + (o.double ? 6 : 3) + eu);
    lab = geoAdd(v, geoMul(u, t));
  }
  const arc = rr => { const p1 = geoAdd(v, geoMul(u1, rr)), p2 = geoAdd(v, geoMul(u2, rr)); return 'M' + geoC(p1.x) + ' ' + geoC(p1.y) + 'A' + rr + ' ' + rr + ' 0 0 ' + sw + ' ' + geoC(p2.x) + ' ' + geoC(p2.y); };
  r = Math.round(r);
  S.path(arc(r), o.cls || 'fang', [geoAdd(v, geoMul(u1, r)), geoAdd(v, geoMul(u2, r)), geoAdd(v, geoMul(u, r))]);
  if (o.double) S.path(arc(r + 4), o.cls || 'fang');
  { const a1 = Math.atan2(u1.y, u1.x); let da = Math.atan2(u2.y, u2.x) - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
    const ps = []; for (let i = 0; i <= 6; i++) ps.push(geoAdd(v, geoMul(geoV(Math.cos(a1 + da * i / 6), Math.sin(a1 + da * i / 6)), r + (o.double ? 4 : 0)))); S.line(ps); }
  if (lab) S.text(lab, o.txt, { fs: o.fs });
}
function geoRightMark(S, v, a, b, s) {
  s = s || 10; const u1 = geoUnit(geoSub(a, v)), u2 = geoUnit(geoSub(b, v));
  S.poly([geoAdd(v, geoMul(u1, s)), geoAdd(geoAdd(v, geoMul(u1, s)), geoMul(u2, s)), geoAdd(v, geoMul(u2, s))], 'fang', true);
}
/* n small strokes across the middle of [ab] (equal lengths) */
function geoTicks(S, a, b, n, t) {
  const m = geoLerp(a, b, t == null ? 0.5 : t), u = geoUnit(geoSub(b, a)), p = geoPerp(u);
  for (let i = 0; i < n; i++) { const c = geoAdd(m, geoMul(u, (i - (n - 1) / 2) * 5)); S.seg(geoAdd(c, geoMul(geoAdd(p, geoMul(u, 0.35)), 6)), geoAdd(c, geoMul(geoAdd(p, geoMul(u, 0.35)), -6)), 'fl'); }
}

/* ---------- triangle with names, lengths, angles and marks ----------
   P: three points (maths coordinates), nm: their names ['A','B','C'];
   o: { side: { AB: '5 cm', BC: '?' }, hl: ['BC'], right: 'A', ang: { B: '35°', C: '?' }, angHl: ['C'], tick: { AB: 1 }, W, H, dot } */
function geoTri(P, nm, o) {
  o = o || {};
  const f = geoFit(P, o.W || 230, o.H || 150), Q = P.map(f), S = geoScene(), G = geoCen(Q);
  const get = (obj, i, j) => obj ? (obj[nm[i] + nm[j]] != null ? obj[nm[i] + nm[j]] : obj[nm[j] + nm[i]]) : null;
  const sides = [[0, 1], [1, 2], [2, 0]];
  S.poly(Q, 'fl');
  sides.forEach(([i, j]) => { if (o.hl && (o.hl.includes(nm[i] + nm[j]) || o.hl.includes(nm[j] + nm[i]))) S.seg(Q[i], Q[j], 'fhl'); });
  sides.forEach(([i, j]) => { const n = get(o.tick, i, j); if (n) geoTicks(S, Q[i], Q[j], n); });
  Q.forEach((v, i) => {
    const a = Q[(i + 1) % 3], b = Q[(i + 2) % 3];
    if (o.right === nm[i]) geoRightMark(S, v, a, b);
    if (o.ang && o.ang[nm[i]] != null) geoArc(S, v, a, b, { txt: o.ang[nm[i]], cls: o.angHl && o.angHl.includes(nm[i]) ? 'fhl' : 'fang', r: o.r || 20, rmax: Math.max(20, 0.42 * Math.min(geoDist(v, a), geoDist(v, b))) });
  });
  Q.forEach((v, i) => { if (o.dot) S.dot(v); geoPtLab(S, v, geoOut(v, Q[(i + 1) % 3], Q[(i + 2) % 3]), nm[i], { gap: 5 }); });
  sides.forEach(([i, j]) => { const t = get(o.side, i, j); if (t) geoSegLab(S, Q[i], Q[j], t, G); });
  return S.svg(o.label || 'triangle ' + nm.join(''));
}
/* a triangle from its three side lengths: BC = a, CA = b, AB = c; A at the origin, B on the x-axis, C above */
function geoTriSSS(a, b, c) {
  const x = (b * b + c * c - a * a) / (2 * c), y = Math.sqrt(Math.max(0, b * b - x * x));
  return [geoV(0, 0), geoV(c, 0), geoV(x, y)];
}
/* a triangle from the base and two base angles (degrees) */
function geoTriASA(c, A, B) {
  const C = 180 - A - B, b = c * Math.sin(geoRad(B)) / Math.sin(geoRad(C));
  return [geoV(0, 0), geoV(c, 0), geoPol(b, A)];
}
/* rotate / mirror a list of maths points around their centre */
function geoTurn(ps, deg, mirror) {
  const c = geoCen(ps);
  return ps.map(p => { let q = geoSub(p, c); if (mirror) q = geoV(-q.x, q.y); return geoRot(q, deg); });
}

/* ---------- text helpers (TeX and French numbers) ---------- */
const geoHat = s => '$$\\widehat{' + s + '}$$';                 /* angle name in a text */
const geoT = v => String(+(+v).toFixed(6)).replace('.', '{,}');   /* number for TeX: 3{,}5 */
const geoDg = v => geoT(v) + '^\\circ';                            /* 35^\circ */
const geoNm = v => nf(v);                                          /* number for a text: 3,5 */
const geoList = (a, ru) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + (ru ? ' и ' : ' et ') + a[a.length - 1];   /* «a, b et c» */
const geoRound = (v, k) => { const p = Math.pow(10, k); return Math.round(v * p + 1e-9) / p; };
/* true if v is far enough from a rounding boundary at k decimals (the answer is not ambiguous) */
const geoSafe = (v, k) => { const x = v * Math.pow(10, k); return Math.abs(x - Math.floor(x) - 0.5) > 0.06; };
/* letters of a triangle: a few usual sets */
const GEO_TRI = [['A', 'B', 'C'], ['D', 'E', 'F'], ['E', 'F', 'G'], ['R', 'S', 'T'], ['M', 'N', 'P'], ['I', 'J', 'K'], ['K', 'L', 'M'], ['U', 'V', 'W'], ['H', 'I', 'J'], ['P', 'Q', 'R']];

/* name of the angle at vertex i of triangle nm: B A C → 'BAC' */
const geoA3 = (nm, i) => { const o = [0, 1, 2].filter(k => k !== i); return nm[o[0]] + nm[i] + nm[o[1]]; };
const geoAngVals = [20, 22, 25, 28, 30, 32, 35, 36, 38, 40, 42, 48, 50, 52, 55, 58, 60, 62, 65, 68, 70];

/* ===================== ANGLES ===================== */
/* two parallel lines (d), (d') and a secant; alpha = angle between the lines and the secant (degrees);
   marks: [{ at: 0 (on (d)) | 1 (on (d')), sec: 0…3, txt, hl }] — sector k is between directions k and k+1 of (→, secant up, ←, secant down) */
function geoParFig(alpha, marks) {
  const S = geoScene(), gap = 92, s = geoV(Math.cos(geoRad(alpha)), -Math.sin(geoRad(alpha)));
  const mid = geoV(170, gap / 2), t = gap / 2 / Math.sin(geoRad(alpha));
  const X = [geoAdd(mid, geoMul(s, t)), geoSub(mid, geoMul(s, t))];
  S.seg(geoV(12, 0), geoV(328, 0)); S.seg(geoV(12, gap), geoV(328, gap));
  S.seg(geoSub(X[1], geoMul(s, 62)), geoAdd(X[0], geoMul(s, 62)));
  S.text(geoV(312, -12), '(d)'); S.text(geoV(312, gap - 12), "(d')");
  const dirs = [geoV(1, 0), s, geoV(-1, 0), geoMul(s, -1)];
  marks.forEach(m => { const P = X[m.at]; geoArc(S, P, geoAdd(P, dirs[m.sec]), geoAdd(P, dirs[(m.sec + 1) % 4]), { r: 17, txt: m.txt, cls: m.hl ? 'fhl' : 'fang', double: m.dbl }); });
  X.forEach(P => S.dot(P, 2.5));
  return S.svg('deux droites parallèles et une sécante');
}
/* which relation links sector a (point pa) and sector b (point pb) */
function geoParRel(pa, a, pb, b) {
  if (pa === pb) return (a + 2) % 4 === b ? 'opp' : 'adj';
  if (a === b) return 'corr';
  const P = pa === 0 ? a : b, Q = pa === 0 ? b : a;      /* sector on (d), sector on (d') */
  if ((P === 2 && Q === 0) || (P === 3 && Q === 1)) return 'alt';
  if ((P === 2 && Q === 1) || (P === 3 && Q === 0)) return 'coint';
  return null;
}
const GEO_PAR_RU = {
  corr: 'Это соответственные углы («angles correspondants»): они расположены одинаково — по одну сторону от секущей и с одной и той же стороны от «своей» прямой. Сдвиг вдоль секущей переносит прямую (d) на (d\') и один угол точно на другой, поэтому при параллельных прямых соответственные углы равны.',
  alt: 'Это накрест лежащие углы («angles alternes-internes»): оба лежат между прямыми (d) и (d\'), по разные стороны от секущей. Поворот на 180° вокруг середины отрезка между двумя точками пересечения меняет прямые местами и переводит один угол в другой, поэтому при параллельных прямых они равны.',
  opp: 'Это вертикальные углы («angles opposés par le sommet»): общая вершина, а стороны одного — продолжения сторон другого. Они всегда равны: каждый из них вместе с одним и тем же соседним углом составляет развёрнутый угол 180°.',
  adj: 'Эти углы смежные («angles adjacents supplémentaires»): общая вершина и общая сторона, а две другие стороны образуют одну прямую. Вместе они составляют развёрнутый угол, поэтому их сумма 180°.',
  coint: 'Оба угла лежат между параллельными прямыми и по одну сторону от секущей. Угол, накрест лежащий с углом «?», равен ему и стоит рядом с данным углом: вместе они образуют прямую, то есть 180°.'
};
function geoAngPar(r, naming) {
  let pa, a, pb, b, rel;
  const want = naming ? r.pick(['corr', 'alt', 'opp', 'adj']) : r.pick(['corr', 'alt', 'opp', 'adj', 'coint']);
  do { pa = r.ri(0, 1); a = r.ri(0, 3); pb = r.ri(0, 1); b = r.ri(0, 3); rel = (pa === pb && a === b) ? null : geoParRel(pa, a, pb, b); } while (rel !== want);
  const g = r.pick([40, 42, 45, 48, 50, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 100, 105, 110, 112, 115, 118, 120, 125, 128, 130, 135, 140]);
  const alpha = a % 2 === 0 ? g : 180 - g;
  const x = b % 2 === 0 ? alpha : 180 - alpha;
  if (naming) {
    const fig = geoParFig(alpha, [{ at: pa, sec: a, hl: true }, { at: pb, sec: b, hl: true }]);
    const opts = [L('Des angles alternes-internes', 'Накрест лежащие углы'), L('Des angles correspondants', 'Соответственные углы'), L('Des angles opposés par le sommet', 'Вертикальные углы'), L('Des angles adjacents supplémentaires', 'Смежные углы (в сумме 180°)')];
    const c = ['alt', 'corr', 'opp', 'adj'].indexOf(rel);
    return { q: L('Les droites (d) et (d\') sont parallèles. Comment appelle-t-on les deux angles marqués sur la figure ?', 'Прямые (d) и (d\') параллельны. Как называются два угла, отмеченные на рисунке?'), fig, ans: MQ(r, opts, c),
      sol: [GEO_PAR_RU[rel], rel === 'adj' ? 'Смежные углы бывают при любых прямых; параллельность здесь не нужна.' : rel === 'opp' ? 'Вертикальные углы равны при любых прямых, параллельность здесь не нужна.' : 'Значит, эти два угла равны — именно поэтому их полезно узнавать на рисунке.'] };
  }
  const fig = geoParFig(alpha, [{ at: pa, sec: a, txt: g + '°' }, { at: pb, sec: b, txt: '?', hl: true }]);
  const eq = x === g;
  return { q: L('Les droites (d) et (d\') sont parallèles. Quelle est la mesure de l’angle marqué « ? » ?', 'Прямые (d) и (d\') параллельны. Чему равен угол, отмеченный «?»?'), fig, ans: N(x, { unit: '°' }),
    sol: [GEO_PAR_RU[rel], eq ? { t: 'Поэтому угол «?» равен данному:', tex: '?=' + geoDg(g) } : { t: 'Поэтому:', tex: '?=180^\\circ-' + geoDg(g) + '=' + geoDg(x) }] };
}
function geoAngSum(r) {
  const nm = r.pick(GEO_TRI), short = r() < 0.4;
  const an = i => short ? nm[i] : geoA3(nm, i);
  const rot = r.pick([0, 0, 15, -15, 30, 180, 195, 90, -90]), mir = r() < 0.5;
  if (r() < 0.5) {   /* right triangle: sujet zéro 2026, question 5 */
    const ri = r.ri(0, 2), gi = (ri + r.ri(1, 2)) % 3, ai = 3 - ri - gi;
    const g = r.pick(geoAngVals.filter(v => v !== 45)), x = 90 - g;
    const ang = []; ang[ri] = 90; ang[gi] = g; ang[ai] = x;
    const P = geoTurn(geoTriASA(1, ang[0], ang[1]), rot, mir);
    const fig = geoTri(P, nm, { right: nm[ri], ang: { [nm[gi]]: g + '°', [nm[ai]]: '?' }, angHl: [nm[ai]] });
    return { q: L('Dans le triangle ' + nm.join('') + ' rectangle en ' + nm[ri] + ', on sait que ' + geoHat(an(gi)) + ' = ' + g + '°. Calculer ' + geoHat(an(ai)) + '.',
      'В треугольнике ' + nm.join('') + ' угол при вершине ' + nm[ri] + ' прямой и ' + geoHat(an(gi)) + ' = ' + g + '°. Найди ' + geoHat(an(ai)) + '.'), fig, ans: N(x, { unit: '°' }),
      sol: ['Сумма углов любого треугольника равна 180°. Угол при вершине ' + nm[ri] + ' прямой, то есть 90°, поэтому на два других угла вместе остаётся 180° − 90° = 90°.',
        { t: 'Значит, острые углы прямоугольного треугольника в сумме дают 90°:', tex: '\\widehat{' + an(ai) + '}=90^\\circ-' + geoDg(g) + '=' + geoDg(x) }] };
  }
  let a, b, c;
  do { a = r.ri(25, 95); b = r.ri(25, 95); c = 180 - a - b; } while (c < 25 || c > 110 || a === b);
  const ang = [a, b, c], ai = r.ri(0, 2), gi = [0, 1, 2].filter(k => k !== ai);
  const P = geoTurn(geoTriASA(1, ang[0], ang[1]), rot, mir);
  const fig = geoTri(P, nm, { ang: { [nm[gi[0]]]: ang[gi[0]] + '°', [nm[gi[1]]]: ang[gi[1]] + '°', [nm[ai]]: '?' }, angHl: [nm[ai]] });
  return { q: L('Dans le triangle ' + nm.join('') + ', ' + geoHat(an(gi[0])) + ' = ' + ang[gi[0]] + '° et ' + geoHat(an(gi[1])) + ' = ' + ang[gi[1]] + '°. Calculer ' + geoHat(an(ai)) + '.',
    'В треугольнике ' + nm.join('') + ' ' + geoHat(an(gi[0])) + ' = ' + ang[gi[0]] + '° и ' + geoHat(an(gi[1])) + ' = ' + ang[gi[1]] + '°. Найди ' + geoHat(an(ai)) + '.'), fig, ans: N(ang[ai], { unit: '°' }),
    sol: ['Сумма углов треугольника всегда равна 180°: если через вершину провести прямую, параллельную противоположной стороне, три угла сложатся в развёрнутый угол.',
      { t: 'Вычитаем из 180° два известных угла:', tex: '\\widehat{' + an(ai) + '}=180^\\circ-' + geoDg(ang[gi[0]]) + '-' + geoDg(ang[gi[1]]) + '=' + geoDg(ang[ai]) }] };
}
function geoAngIso(r) {
  const nm = r.pick(GEO_TRI), [A, B, C] = nm, kind = r.pick(['apex', 'apex', 'base', 'base', 'equi', 'isorect']);
  const rot = r.pick([0, 0, 0, 10, -10, 180]);
  const tri = base => geoTurn([geoV(0, Math.tan(geoRad(base))), geoV(-1, 0), geoV(1, 0)], rot);   /* apex first */
  const A3 = geoA3(nm, 0), B3 = geoA3(nm, 1), C3 = geoA3(nm, 2);
  if (kind === 'equi') {
    const fig = geoTri(tri(60), nm, { tick: { [A + B]: 1, [A + C]: 1, [B + C]: 1 }, ang: { [B]: '?' }, angHl: [B] });
    return { q: L('Le triangle ' + A + B + C + ' est équilatéral. Quelle est la mesure de l’angle ' + geoHat(B3) + ' ?', 'Треугольник ' + A + B + C + ' равносторонний. Чему равен угол ' + geoHat(B3) + '?'), fig, ans: N(60, { unit: '°' }),
      sol: ['Все стороны равны, значит, треугольник равнобедренный при каждой вершине — и все три угла равны между собой.', { t: 'Сумма 180° делится поровну на три угла:', tex: '180^\\circ\\div 3=60^\\circ' }] };
  }
  if (kind === 'isorect') {
    const fig = geoTri(tri(45), nm, { tick: { [A + B]: 1, [A + C]: 1 }, right: A, ang: { [B]: '?' }, angHl: [B] });
    return { q: L('Le triangle ' + A + B + C + ' est rectangle et isocèle en ' + A + '. Quelle est la mesure de l’angle ' + geoHat(B3) + ' ?', 'Треугольник ' + A + B + C + ' прямоугольный и равнобедренный, прямой угол при вершине ' + A + ' (' + A + B + ' = ' + A + C + '). Чему равен угол ' + geoHat(B3) + '?'), fig, ans: N(45, { unit: '°' }),
      sol: ['Угол ' + A + ' прямой, поэтому два других угла вместе дают 180° − 90° = 90°.', 'Треугольник равнобедренный, а в равнобедренном треугольнике углы при основании равны (ось симметрии через вершину ' + A + ' меняет их местами).', { t: 'Каждому достаётся половина:', tex: '90^\\circ\\div 2=45^\\circ' }] };
  }
  if (kind === 'apex') {
    let ap; do ap = 2 * r.ri(10, 70); while (ap === 60); const bs = 90 - ap / 2;
    const fig = geoTri(tri(bs), nm, { tick: { [A + B]: 1, [A + C]: 1 }, ang: { [A]: ap + '°', [B]: '?' }, angHl: [B] });
    return { q: L('Le triangle ' + A + B + C + ' est isocèle en ' + A + ' et ' + geoHat(A3) + ' = ' + ap + '°. Calculer ' + geoHat(B3) + '.', 'Треугольник ' + A + B + C + ' равнобедренный: ' + A + B + ' = ' + A + C + ', и ' + geoHat(A3) + ' = ' + ap + '°. Найди ' + geoHat(B3) + '.'), fig, ans: N(bs, { unit: '°' }),
      sol: ['В равнобедренном треугольнике углы при основании равны: треугольник симметричен относительно оси, проходящей через вершину ' + A + ', и эта симметрия меняет местами углы ' + B + ' и ' + C + '.',
        { t: 'На два равных угла остаётся 180° − ' + ap + '° = ' + (180 - ap) + '°, каждому — половина:', tex: '\\widehat{' + B3 + '}=(180^\\circ-' + geoDg(ap) + ')\\div 2=' + geoDg(bs) }] };
  }
  let bs; do bs = r.ri(25, 85); while (bs === 60); const ap = 180 - 2 * bs;
  const fig = geoTri(tri(bs), nm, { tick: { [A + B]: 1, [A + C]: 1 }, ang: { [B]: bs + '°', [A]: '?' }, angHl: [A] });
  return { q: L('Le triangle ' + A + B + C + ' est isocèle en ' + A + ' et ' + geoHat(B3) + ' = ' + bs + '°. Calculer ' + geoHat(A3) + '.', 'Треугольник ' + A + B + C + ' равнобедренный: ' + A + B + ' = ' + A + C + ', и ' + geoHat(B3) + ' = ' + bs + '°. Найди ' + geoHat(A3) + '.'), fig, ans: N(ap, { unit: '°' }),
    sol: ['Углы при основании равнобедренного треугольника равны (симметрия относительно оси через вершину ' + A + '), значит, ' + geoHat(C3) + ' = ' + bs + '° тоже.',
      { t: 'Третий угол — то, что осталось от 180°:', tex: '\\widehat{' + A3 + '}=180^\\circ-2\\times ' + geoDg(bs) + '=' + geoDg(ap) }] };
}
topic({ id: 'ge.angles', ch: 'ge', lvl: 1, calc: false, variants: 4,
  ru: 'Углы треугольника и углы при параллельных', fr: 'Angles d’un triangle et droites parallèles',
  hints: [
    'Сумма углов любого треугольника равна 180°. Почему: если через вершину провести прямую, параллельную противоположной стороне, три угла треугольника сложатся в развёрнутый угол.',
    'В прямоугольном треугольнике один угол уже 90°, поэтому два острых вместе дают 90°. В равнобедренном («isocèle») углы при основании равны, в равностороннем («équilatéral») все углы по 60°.',
    'Две параллельные прямые и секущая: накрест лежащие («alternes-internes») и соответственные («correspondants») углы равны, вертикальные («opposés par le sommet») равны всегда, а смежные дают в сумме 180°.'],
  gen(r, vi) {
    if (vi === 0) return geoAngSum(r);
    if (vi === 1) return geoAngIso(r);
    return geoAngPar(r, vi === 3);
  } });

/* ===================== TRIANGLE INEQUALITY ===================== */
const GEO_U = { cm: 'см', m: 'м', mm: 'мм', km: 'км', dm: 'дм' };
const geoLen2 = (v, u) => [nf(v) + ' ' + u, nf(v) + ' ' + GEO_U[u]];          /* «3,5 cm», «3,5 см» */
/* compass construction: base [LR] = c, circle (L, a) and circle (R, b) — upper halves */
function geoCompassFig(nL, nR, nT, c, a, b, u) {
  const f = geoFit([geoV(-a, 0), geoV(c + b, 0), geoV(0, a), geoV(c, b), geoV(c - b, 0), geoV(a, 0)], 290, 150), k = f.k;
  const S = geoScene(), L = f(geoV(0, 0)), R = f(geoV(c, 0));
  S.path('M' + geoC(L.x - a * k) + ' ' + geoC(L.y) + 'A' + geoC(a * k) + ' ' + geoC(a * k) + ' 0 0 1 ' + geoC(L.x + a * k) + ' ' + geoC(L.y), 'fdash', [geoV(L.x - a * k, L.y - a * k), geoV(L.x + a * k, L.y)]);
  S.path('M' + geoC(R.x - b * k) + ' ' + geoC(R.y) + 'A' + geoC(b * k) + ' ' + geoC(b * k) + ' 0 0 1 ' + geoC(R.x + b * k) + ' ' + geoC(R.y), 'fdash', [geoV(R.x - b * k, R.y - b * k), geoV(R.x + b * k, R.y)]);
  S.seg(L, R);
  S.text(geoV(L.x, L.y - a * k - 11), nf(a) + ' ' + u, { cls: 'ftm', fs: 13 }); S.text(geoV(R.x, R.y - b * k - 11), nf(b) + ' ' + u, { cls: 'ftm', fs: 13 });
  if (a + b > c) {
    const x = (a * a - b * b + c * c) / (2 * c), T = f(geoV(x, Math.sqrt(a * a - x * x)));
    S.seg(L, T); S.seg(T, R); S.dot(T); geoPtLab(S, T, geoV(0, -1), nT);
  } else if (a + b === c) { const T = f(geoV(a, 0)); S.dot(T); geoPtLab(S, T, geoV(0, -1), nT); }
  else S.seg(f(geoV(a, 0)), f(geoV(c - b, 0)), 'fhl');
  S.dot(L); S.dot(R); geoPtLab(S, L, geoV(0, 1), nL); geoPtLab(S, R, geoV(0, 1), nR);
  geoSegLab(S, L, R, nf(c) + ' ' + u, null, { flip: false, gap: 18 });
  return S.svg('construction au compas');
}
topic({ id: 'ge.triangle-construire', ch: 'ge', lvl: 1, calc: false, variants: 4,
  ru: 'Можно ли построить треугольник', fr: 'Construire un triangle : inégalité triangulaire',
  hints: [
    'Неравенство треугольника («inégalité triangulaire»): каждая сторона короче суммы двух других. Причина: путь напрямую из A в C короче, чем путь с заездом в B.',
    'Достаточно проверить самую длинную сторону: если она короче суммы двух других, треугольник построить можно. Если ровно равна — три точки на одной прямой, треугольник «сплющенный» («aplati»).',
    'Про углы: сумма углов треугольника всегда 180°. Если данные углы в сумме дают другое число, такого треугольника не бывает.'],
  gen(r, vi) {
    const nm = r.pick(GEO_TRI), u = r.pick(['cm', 'cm', 'm']);
    const sides = [nm[0] + nm[1], nm[1] + nm[2], nm[0] + nm[2]];
    if (vi === 0) {
      const kind = r.pick(['ok', 'no', 'flat']);
      let a = r.ri(2, 9), b = r.ri(2, 9); if (a === b) b++;
      const c = kind === 'flat' ? a + b : kind === 'no' ? a + b + r.ri(1, 3) : Math.max(a, b) + r.ri(1, Math.min(a, b) - 1 || 1);
      if (kind === 'ok' && c >= a + b) return this.gen(r, vi);
      const perm = r.sh([0, 1, 2]), len = []; len[perm[0]] = a; len[perm[1]] = b; len[perm[2]] = c;   /* side perm[2] is the longest */
      const txt = i => sides[i] + ' = ' + nf(len[i]) + ' ' + u, txtR = i => sides[i] + ' = ' + nf(len[i]) + ' ' + GEO_U[u];
      const opts = [L('Oui', 'Да'), L('Non', 'Нет'), L('Oui, mais il est aplati : les points ' + nm[0] + ', ' + nm[1] + ' et ' + nm[2] + ' sont alignés', 'Да, но он «сплющенный»: точки ' + nm[0] + ', ' + nm[1] + ' и ' + nm[2] + ' лежат на одной прямой'), L('On ne peut pas savoir sans faire la figure', 'Нельзя узнать, не начертив')];
      const big = sides[perm[2]], s1 = sides[perm[0]], s2 = sides[perm[1]];
      const ends = big.split(''), mid = nm.find(x => !ends.includes(x));
      /* the circle around ends[0] has the radius of the side from ends[0] to mid */
      const rad = e => len[sides.findIndex(s => s.includes(e) && s.includes(mid))];
      const svg = geoCompassFig(ends[0], ends[1], mid, c, rad(ends[0]), rad(ends[1]), u);
      const sol = ['Проверяем самую длинную сторону — [' + big + ']: она должна быть короче суммы двух других. Причина: путь напрямую из ' + ends[0] + ' в ' + ends[1] + ' короче, чем путь с заездом в ' + mid + '.',
        ['Сумма двух других сторон:', s1 + '+' + s2 + '=' + a + '+' + b + '=' + (a + b), u]];
      if (kind === 'no') sol.push({ t: (a + b) + ' < ' + c + ': двух коротких сторон не хватает, чтобы «дотянуться» друг до друга. Если начертить [' + big + '] и провести циркулем окружности радиусов ' + a + ' и ' + b + ', они не пересекутся — точку ' + mid + ' поставить некуда.', svg });
      else if (kind === 'flat') sol.push({ t: (a + b) + ' = ' + c + ': окружности касаются в одной точке, и она лежит на отрезке [' + big + ']. Точки на одной прямой — получается «сплющенный» треугольник («triangle aplati»).', svg });
      else sol.push({ t: c + ' < ' + (a + b) + ': окружности пересекаются, точка ' + mid + ' находится — треугольник построить можно. Две другие стороны проверять не нужно: каждая из них короче самой длинной, а значит, и подавно короче суммы двух остальных.', svg });
      return { q: L('Peut-on construire un triangle ' + nm.join('') + ' tel que ' + txt(0) + ', ' + txt(1) + ' et ' + txt(2) + ' ?', 'Можно ли построить треугольник ' + nm.join('') + ', у которого ' + txtR(0) + ', ' + txtR(1) + ' и ' + txtR(2) + '?'),
        ans: MQ(r, opts, kind === 'ok' ? 0 : kind === 'no' ? 1 : 2), sol };
    }
    let a = r.ri(3, 12), b = r.ri(3, 12); if (a === b) b += r.ri(1, 4);
    const lo = Math.abs(a - b), hi = a + b;
    if (vi === 1) {
      const good = r.ri(lo + 1, hi - 1);
      const bad = r.sh([lo - 1, lo - 2, hi + 1, hi + 2, hi + 4, 2 * hi].filter(x => x >= 1)).slice(0, 3);
      const opts = [good, ...bad].map(x => L(nf(x) + ' ' + u, nf(x) + ' ' + GEO_U[u]));
      return { q: L('Dans un triangle ' + nm.join('') + ', ' + sides[0] + ' = ' + a + ' ' + u + ' et ' + sides[1] + ' = ' + b + ' ' + u + '. Parmi les propositions suivantes, laquelle peut être la longueur ' + sides[2] + ' ?',
        'В треугольнике ' + nm.join('') + ' стороны ' + sides[0] + ' = ' + a + ' ' + GEO_U[u] + ' и ' + sides[1] + ' = ' + b + ' ' + GEO_U[u] + '. Какой может быть длина ' + sides[2] + '?'), ans: MQ(r, opts, 0),
        sol: ['Каждая сторона треугольника короче суммы двух других.',
          ['Сторона ' + sides[2] + ' короче суммы двух данных:', sides[2] + '<' + a + '+' + b + '=' + hi],
          ['И бо́льшая из данных сторон короче суммы двух других: ' + Math.max(a, b) + ' < ' + Math.min(a, b) + ' + ' + sides[2] + ', значит,', sides[2] + '>' + Math.max(a, b) + '-' + Math.min(a, b) + '=' + lo],
          'Подходит только длина строго между ' + lo + ' и ' + hi + ': это ' + good + ' ' + GEO_U[u] + '. Остальные варианты либо слишком короткие, либо слишком длинные.'] };
    }
    if (vi === 2) {
      const big = r() < 0.5;
      const uR = u === 'm' ? 'в метрах' : 'в сантиметрах';
      return { q: L('Dans un triangle ' + nm.join('') + ', ' + sides[0] + ' = ' + a + ' ' + u + ' et ' + sides[1] + ' = ' + b + ' ' + u + '. Le triangle n’est pas aplati. Quelle est la ' + (big ? 'plus grande' : 'plus petite') + ' valeur entière possible de la longueur ' + sides[2] + ', en ' + u + ' ?',
        'В треугольнике ' + nm.join('') + ' стороны ' + sides[0] + ' = ' + a + ' ' + GEO_U[u] + ' и ' + sides[1] + ' = ' + b + ' ' + GEO_U[u] + '. Треугольник не сплющенный. Какое ' + (big ? 'наибольшее' : 'наименьшее') + ' целое значение может иметь длина ' + sides[2] + ' (' + uR + ')?'),
        ans: N(big ? hi - 1 : lo + 1, { unit: u }),
        sol: big ? [['Сторона ' + sides[2] + ' должна быть короче суммы двух других:', sides[2] + '<' + a + '+' + b + '=' + hi], 'Строго меньше ' + hi + ' (при ' + sides[2] + ' = ' + hi + ' точки легли бы на одну прямую). Наибольшее целое число меньше ' + hi + ' — это ' + (hi - 1) + '.']
          : [['Бо́льшая из данных сторон (' + Math.max(a, b) + ') должна быть короче суммы двух других: ' + Math.max(a, b) + ' < ' + Math.min(a, b) + ' + ' + sides[2] + ', то есть', sides[2] + '>' + Math.max(a, b) + '-' + Math.min(a, b) + '=' + lo], 'Строго больше ' + lo + ' (при ' + sides[2] + ' = ' + lo + ' треугольник сплющенный). Наименьшее целое число больше ' + lo + ' — это ' + (lo + 1) + '.'] };
    }
    /* angles: the sum must be 180° */
    const ok = r() < 0.5; let A, B, C;
    do { A = 5 * r.ri(6, 20); B = 5 * r.ri(6, 20); C = ok ? 180 - A - B : 180 - A - B + r.pick([-20, -10, 10, 20, 30]); } while (C < 20 || C > 130 || A === B);
    const sum = A + B + C, list = A + '°, ' + B + '° et ' + C + '°', listR = A + '°, ' + B + '° и ' + C + '°';
    const acute = Math.max(A, B, C) < 90, srt = [A, B, C].sort((x, y) => x - y), two = srt[0] + srt[1] > srt[2];
    const right = A === 90 || B === 90 || C === 90;
    const dRight = right ? L('On ne peut pas savoir sans les longueurs des côtés', 'Нельзя узнать без длин сторон') : L('Non, car un triangle doit avoir un angle droit', 'Нет, потому что у треугольника должен быть прямой угол');
    const dIneq = two ? L('Oui, car ' + srt[0] + ' + ' + srt[1] + ' > ' + srt[2], 'Да, потому что ' + srt[0] + ' + ' + srt[1] + ' > ' + srt[2]) : L('Non, car ' + srt[0] + ' + ' + srt[1] + ' < ' + srt[2], 'Нет, потому что ' + srt[0] + ' + ' + srt[1] + ' < ' + srt[2]);
    const opts = ok ? [L('Oui, car ' + A + ' + ' + B + ' + ' + C + ' = 180', 'Да, потому что ' + A + ' + ' + B + ' + ' + C + ' = 180'), dRight, L('Non, car les trois angles devraient être égaux', 'Нет, потому что три угла должны быть равны'), two ? L('On ne peut pas savoir sans les longueurs des côtés', 'Нельзя узнать без длин сторон') : dIneq]
      : [L('Non, car ' + A + ' + ' + B + ' + ' + C + ' = ' + sum + ' et ' + sum + ' ≠ 180', 'Нет, потому что ' + A + ' + ' + B + ' + ' + C + ' = ' + sum + ' и ' + sum + ' ≠ 180'), L(acute ? 'Oui, car tous les angles sont aigus' : 'Oui, car chaque angle est plus petit que 180°', acute ? 'Да, потому что все углы острые' : 'Да, потому что каждый угол меньше 180°'), dIneq, dRight];
    return { q: L('Peut-on construire un triangle dont les angles mesurent ' + list + ' ?', 'Можно ли построить треугольник с углами ' + listR + '?'), ans: MQ(r, opts, 0),
      sol: ['В любом треугольнике сумма углов равна 180° — это главное условие для углов (прямой угол вовсе не обязателен).', ['Складываем:', A + '+' + B + '+' + C + '=' + sum],
        ok ? 'Сумма равна 180°, значит, такой треугольник существует (и даже бесконечно много — разного размера). Сравнивать «два угла с третьим» не нужно: это правило для длин сторон, а не для углов.' : 'Сумма ' + sum + '° ≠ 180°, значит, такого треугольника не бывает. Сравнение «два угла с третьим» здесь ни при чём — это правило для длин сторон, а не для углов.'] };
  } });

/* ===================== PYTHAGORE ===================== */
const GEO_TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25], [15, 20, 25], [1.5, 2, 2.5], [0.6, 0.8, 1], [30, 40, 50], [0.3, 0.4, 0.5]];
const geoSq = v => +(v * v).toFixed(6);
/* right triangle: right angle at index ri; legs l1 (towards vertex ri+1) and l2 (towards ri+2); random orientation */
function geoRT(r, ri, l1, l2) {
  const P = []; P[ri] = geoV(0, 0); P[(ri + 1) % 3] = geoV(l1, 0); P[(ri + 2) % 3] = geoV(0, l2);
  return geoTurn(P, r.pick([0, 0, 90, 180, 270, 20, -20, 160, 200]), r() < 0.5);
}
const geoSide = (nm, i, j) => i < j ? nm[i] + nm[j] : nm[j] + nm[i];
/* Pythagore: hypotenuse or leg; data of one random right triangle */
function geoPyData(r, list, keep) {
  const nm = r.pick(GEO_TRI), ri = r.ri(0, 2), [l1, l2, h] = keep || r() < 0.5 ? list : [list[1], list[0], list[2]];
  const v1 = (ri + 1) % 3, v2 = (ri + 2) % 3;
  return { nm, ri, l1, l2, h, s1: geoSide(nm, ri, v1), s2: geoSide(nm, ri, v2), sh: geoSide(nm, v1, v2), P: geoRT(r, ri, l1, l2) };
}
topic({ id: 'ge.pythagore', ch: 'ge', lvl: 1, calc: false, variants: 5,
  ru: 'Теорема Пифагора', fr: 'Théorème de Pythagore',
  hints: [
    'Теорема Пифагора работает только в прямоугольном треугольнике: квадрат гипотенузы равен сумме квадратов катетов. Гипотенуза («hypoténuse») — сторона напротив прямого угла, самая длинная.',
    'Запиши равенство буквами этого треугольника: если прямой угол при вершине A, то $BC^2=AB^2+AC^2$. Потом подставь длины.',
    'Ищешь гипотенузу — складываешь квадраты катетов и извлекаешь корень. Ищешь катет — из квадрата гипотенузы вычитаешь квадрат другого катета, потом корень.'],
  gen(r, vi) {
    const u = r.pick(['cm', 'cm', 'cm', 'm', 'mm']);
    if (vi === 0 || vi === 1) {
      const T = r.pick(GEO_TRIPLES.filter(t => u !== 'mm' || t[0] >= 3));
      const d = geoPyData(r, T), { nm, ri, s1, s2, sh } = d, tri = nm.join('');
      const legAsk = vi === 1, ask = legAsk ? s2 : sh;
      const side = legAsk ? { [s1]: nf(d.l1) + ' ' + u, [sh]: nf(d.h) + ' ' + u, [s2]: '?' } : { [s1]: nf(d.l1) + ' ' + u, [s2]: nf(d.l2) + ' ' + u, [sh]: '?' };
      const fig = geoTri(d.P, nm, { right: nm[ri], side, hl: [ask] });
      const given = legAsk ? [sh, d.h, s1, d.l1] : [s1, d.l1, s2, d.l2];
      const q = L('Le triangle ' + tri + ' est rectangle en ' + nm[ri] + '. On donne ' + given[0] + ' = ' + nf(given[1]) + ' ' + u + ' et ' + given[2] + ' = ' + nf(given[3]) + ' ' + u + '. Calculer la longueur ' + ask + '.',
        'Треугольник ' + tri + ' прямоугольный, прямой угол при вершине ' + nm[ri] + '. Известно: ' + given[0] + ' = ' + nf(given[1]) + ' ' + GEO_U[u] + ' и ' + given[2] + ' = ' + nf(given[3]) + ' ' + GEO_U[u] + '. Найди длину ' + ask + '.');
      const sol = ['Прямой угол при вершине ' + nm[ri] + ', значит, гипотенуза — сторона [' + sh + '] напротив него. По теореме Пифагора квадрат гипотенузы равен сумме квадратов катетов:', ['', sh + '^2=' + s1 + '^2+' + s2 + '^2']];
      if (!legAsk) sol.push(['Подставляем длины:', sh + '^2=' + d.l1 + '^2+' + d.l2 + '^2=' + geoSq(d.l1) + '+' + geoSq(d.l2) + '=' + geoSq(d.h)], ['Длина — положительное число, квадрат которого равен ' + nf(geoSq(d.h)) + ':', sh + '=√' + geoSq(d.h) + '=' + d.h, u]);
      else sol.push(['Квадрат катета — это то, что остаётся от квадрата гипотенузы:', s2 + '^2=' + sh + '^2-' + s1 + '^2=' + d.h + '^2-' + d.l1 + '^2=' + geoSq(d.h) + '-' + geoSq(d.l1) + '=' + geoSq(d.l2)], ['Извлекаем корень:', s2 + '=√' + geoSq(d.l2) + '=' + d.l2, u], 'Проверка: катет получился короче гипотенузы, как и должно быть.');
      return { q, fig, ans: N(legAsk ? d.l2 : d.h, { unit: u }), sol };
    }
    if (vi === 2) {   /* which equality */
      const d = geoPyData(r, [3, 4, 5]), { nm, ri, s1, s2, sh } = d;
      const fig = geoTri(d.P, nm, { right: nm[ri] });
      const opts = [L('$' + sh + '^2=' + s1 + '^2+' + s2 + '^2$', '$' + sh + '^2=' + s1 + '^2+' + s2 + '^2$'), L('$' + s1 + '^2=' + sh + '^2+' + s2 + '^2$', '$' + s1 + '^2=' + sh + '^2+' + s2 + '^2$'),
        L('$' + s2 + '^2=' + s1 + '^2+' + sh + '^2$', '$' + s2 + '^2=' + s1 + '^2+' + sh + '^2$'), L('$' + sh + '=' + s1 + '+' + s2 + '$', '$' + sh + '=' + s1 + '+' + s2 + '$')];
      return { q: L('Le triangle ' + nm.join('') + ' est rectangle en ' + nm[ri] + '. Quelle égalité est vraie ?', 'Треугольник ' + nm.join('') + ' прямоугольный, прямой угол при вершине ' + nm[ri] + '. Какое равенство верно?'), fig, ans: MQ(r, opts, 0),
        sol: ['Гипотенуза лежит напротив прямого угла. Прямой угол при ' + nm[ri] + ', значит, гипотенуза — [' + sh + '], а [' + s1 + '] и [' + s2 + '] — катеты.', 'Теорема Пифагора: квадрат гипотенузы равен сумме квадратов катетов. Слева в равенстве одна гипотенуза.',
          'Вариант без квадратов неверен: для сторон 3, 4 и 5 он дал бы 5 = 3 + 4 = 7. Складывать можно только квадраты — это площади квадратов, построенных на сторонах.'] };
    }
    if (vi === 3) {   /* only for a right triangle */
      const nm = r.pick(GEO_TRI), [A, B, C] = nm;
      if (r() < 0.35) {
        return { q: L('Vrai ou faux : dans n’importe quel triangle ' + A + B + C + ', on a ' + '$' + B + C + '^2=' + A + B + '^2+' + A + C + '^2$.', 'Верно или неверно: в любом треугольнике ' + A + B + C + ' выполняется $' + B + C + '^2=' + A + B + '^2+' + A + C + '^2$.'),
          fig: geoTri([geoV(0, 0), geoV(2, 0), geoV(1, Math.sqrt(3))], nm, { tick: { [A + B]: 1, [B + C]: 1, [A + C]: 1 } }), ans: TF(false),
          sol: ['Неверно. Теорема Пифагора верна только для треугольника с прямым углом при вершине ' + A + '.', 'Контрпример — равносторонний треугольник со стороной 2: $' + B + C + '^2=4$, а $' + A + B + '^2+' + A + C + '^2=4+4=8$.',
            'Чем шире угол ' + A + ', тем длиннее сторона ' + B + C + ': при остром угле $' + B + C + '^2$ меньше суммы, при тупом — больше, и только при прямом угле они равны.'] };
      }
      const T = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15]]), th = r.pick([110, 120, 70, 60, 125, 115, 65]);
      const [a, b] = r() < 0.5 ? [T[0], T[1]] : [T[1], T[0]];
      const real = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(geoRad(th)));
      const name = r.pick(PRENOMS_F.concat(PRENOMS_M));
      const P = geoTurn([geoV(0, 0), geoV(a, 0), geoPol(b, th)], r.pick([0, 10, -10]));
      const fig = geoTri(P, nm, { side: { [A + B]: a + ' cm', [A + C]: b + ' cm', [B + C]: '?' }, ang: { [A]: th + '°' } });
      const opts = [L('Non : le triangle n’est pas rectangle, on ne peut pas utiliser le théorème de Pythagore.', 'Нет: треугольник не прямоугольный, теорему Пифагора применять нельзя.'), L('Oui, car $' + a + '^2+' + b + '^2=' + T[2] + '^2$.', 'Да, ведь $' + a + '^2+' + b + '^2=' + T[2] + '^2$.'),
        L('Non, car ' + B + C + ' = ' + a + ' + ' + b + ' = ' + (a + b) + ' cm.', 'Нет, ведь ' + B + C + ' = ' + a + ' + ' + b + ' = ' + (a + b) + ' см.'), L('Oui, car [' + B + C + '] est le plus grand côté.', 'Да, ведь [' + B + C + '] — самая длинная сторона.')];
      return { q: L('Dans le triangle ' + A + B + C + ' ci-dessous, ' + A + B + ' = ' + a + ' cm, ' + A + C + ' = ' + b + ' cm et ' + geoHat(B + A + C) + ' = ' + th + '°. ' + name + ' affirme : « D’après le théorème de Pythagore, ' + B + C + ' = ' + T[2] + ' cm. » A-t-' + (PRENOMS_F.includes(name) ? 'elle' : 'il') + ' raison ?',
        'В треугольнике ' + A + B + C + ' на рисунке ' + A + B + ' = ' + a + ' см, ' + A + C + ' = ' + b + ' см и ' + geoHat(B + A + C) + ' = ' + th + '°. ' + name + ' утверждает: «По теореме Пифагора ' + B + C + ' = ' + T[2] + ' см». Прав' + (PRENOMS_F.includes(name) ? 'а' : '') + ' ли ' + (PRENOMS_F.includes(name) ? 'она' : 'он') + '?'), fig, ans: MQ(r, opts, 0),
        sol: ['Теорема Пифагора верна только для прямоугольного треугольника: только при прямом угле площадь квадрата на гипотенузе равна сумме площадей квадратов на катетах.',
          'Здесь угол ' + A + ' равен ' + th + '°, а не 90°. ' + (th > 90 ? 'Он тупой: стороны раскрыты шире прямого угла, поэтому ' + B + C + ' длиннее ' + T[2] + ' см' : 'Он острый: стороны сведены уже прямого угла, поэтому ' + B + C + ' короче ' + T[2] + ' см') + ' — на самом деле ' + B + C + ' ≈ ' + nf(geoRound(real, 1)) + ' см.',
          'Вывод: сначала убедись, что треугольник прямоугольный (это дано или доказано), и только потом применяй теорему Пифагора.'] };
    }
    /* exact value with a square root */
    const legs = r.pick([[1, 2], [2, 3], [1, 3], [2, 4], [3, 5], [1, 4], [2, 5], [4, 5], [3, 6], [2, 2], [3, 3], [4, 6], [5, 6], [4, 7]]);
    const d = geoPyData(r, [legs[0], legs[1], Math.sqrt(legs[0] ** 2 + legs[1] ** 2)]), { nm, ri, s1, s2, sh } = d;
    const askLeg = r() < 0.4;
    if (!askLeg) {
      const k = d.l1 * d.l1 + d.l2 * d.l2;
      const fig = geoTri(d.P, nm, { right: nm[ri], side: { [s1]: d.l1 + ' ' + u, [s2]: d.l2 + ' ' + u, [sh]: '?' }, hl: [sh] });
      return { q: L('Le triangle ' + nm.join('') + ' est rectangle en ' + nm[ri] + ', ' + s1 + ' = ' + d.l1 + ' ' + u + ' et ' + s2 + ' = ' + d.l2 + ' ' + u + '. Donner la valeur exacte de ' + sh + '.', 'Треугольник ' + nm.join('') + ' прямоугольный, прямой угол при ' + nm[ri] + ', ' + s1 + ' = ' + d.l1 + ' ' + GEO_U[u] + ' и ' + s2 + ' = ' + d.l2 + ' ' + GEO_U[u] + '. Запиши точное значение ' + sh + '.'), fig,
        ans: N('sqrt(' + k + ')', { forms: ['any'], unit: u, help: GM('', 'Точное значение — с корнем, например <code>√13</code>') }),
        sol: ['Гипотенуза — [' + sh + '], напротив прямого угла. По теореме Пифагора:', ['', sh + '^2=' + d.l1 + '^2+' + d.l2 + '^2=' + (d.l1 * d.l1) + '+' + (d.l2 * d.l2) + '=' + k],
          [k + ' — не квадрат целого числа, поэтому точное значение записывают с корнем:', sh + '=√' + k, u], 'Десятичная запись (≈ ' + nf(geoRound(Math.sqrt(k), 2)) + ') была бы уже округлением, а просят точное значение.'] };
    }
    const hyp = r.pick([3, 4, 5, 6, 7, 8]), leg = r.ri(1, hyp - 1), k = hyp * hyp - leg * leg;
    if (Number.isInteger(Math.sqrt(k))) return this.gen(r, vi);
    const nm2 = r.pick(GEO_TRI), ri2 = r.ri(0, 2), v1 = (ri2 + 1) % 3, v2 = (ri2 + 2) % 3;
    const S1 = geoSide(nm2, ri2, v1), S2 = geoSide(nm2, ri2, v2), SH = geoSide(nm2, v1, v2);
    const fig = geoTri(geoRT(r, ri2, leg, Math.sqrt(k)), nm2, { right: nm2[ri2], side: { [S1]: leg + ' ' + u, [SH]: hyp + ' ' + u, [S2]: '?' }, hl: [S2] });
    return { q: L('Le triangle ' + nm2.join('') + ' est rectangle en ' + nm2[ri2] + ', ' + SH + ' = ' + hyp + ' ' + u + ' et ' + S1 + ' = ' + leg + ' ' + u + '. Donner la valeur exacte de ' + S2 + '.', 'Треугольник ' + nm2.join('') + ' прямоугольный, прямой угол при ' + nm2[ri2] + ', ' + SH + ' = ' + hyp + ' ' + GEO_U[u] + ' и ' + S1 + ' = ' + leg + ' ' + GEO_U[u] + '. Запиши точное значение ' + S2 + '.'), fig,
      ans: N('sqrt(' + k + ')', { forms: ['any'], unit: u, help: GM('', 'Точное значение — с корнем, например <code>√7</code>') }),
      sol: ['Гипотенуза — [' + SH + ']. По теореме Пифагора $' + SH + '^2=' + S1 + '^2+' + S2 + '^2$, значит, квадрат катета — разность:', ['', S2 + '^2=' + hyp + '^2-' + leg + '^2=' + (hyp * hyp) + '-' + (leg * leg) + '=' + k],
        [k + ' — не квадрат целого числа, поэтому точное значение — корень:', S2 + '=√' + k, u]] };
  } });

/* rounding instruction: dp = 0, 1, 2 */
const geoArr = (dp, u) => dp === 1 ? L('Arrondir au dixième.', 'Округли до десятых.') : dp === 2 ? (u === 'm' ? L('Arrondir au centimètre.', 'Округли до сантиметра.') : L('Arrondir au centième.', 'Округли до сотых.')) : (u === '°' ? L('Arrondir au degré.', 'Округли до градуса.') : L('Arrondir à l’unité.', 'Округли до целых.'));
/* a decimal with one digit, avoiding whole numbers */
const geoD1 = (r, lo, hi) => { let v; do v = r.ri(lo * 10, hi * 10) / 10; while (Number.isInteger(v)); return v; };
topic({ id: 'ge.pythagore-calc', ch: 'ge', lvl: 2, calc: true, variants: 3,
  ru: 'Пифагор с калькулятором и в задачах', fr: 'Théorème de Pythagore : calculs et problèmes',
  hints: [
    'Найди прямой угол и гипотенузу напротив него. Запиши теорему Пифагора буквами этого треугольника.',
    'Гипотенуза: $c^2=a^2+b^2$, потом корень. Катет: $b^2=c^2-a^2$, потом корень. Квадраты вычисляй точно, округляй только в самом конце.',
    'В задаче с картинкой из жизни (лестница, экран, поле) сначала найди прямоугольный треугольник: стена и пол, стороны прямоугольника и его диагональ.'],
  gen(r, vi) {
    if (vi < 2) {
      const u = r.pick(['cm', 'm']), dp = r() < 0.75 ? 1 : 2;
      let a, b, c, val;
      do {
        a = geoD1(r, 1.5, 9.5);
        if (vi === 0) { b = geoD1(r, 2, 12); val = Math.sqrt(a * a + b * b); }
        else { c = +(a + geoD1(r, 1.2, 7)).toFixed(1); val = Math.sqrt(c * c - a * a); }
      } while (!geoSafe(val, dp) || (vi === 0 && Math.abs(a - b) < 0.6));
      const key = geoRound(val, dp).toFixed(dp);
      const d = geoPyData(r, vi === 0 ? [a, b, val] : [a, val, c], vi === 1), { nm, ri, s1, s2, sh } = d, tri = nm.join('');
      const leg = vi === 1, ask = leg ? s2 : sh;
      const side = leg ? { [s1]: nf(d.l1) + ' ' + u, [sh]: nf(d.h) + ' ' + u, [s2]: '?' } : { [s1]: nf(d.l1) + ' ' + u, [s2]: nf(d.l2) + ' ' + u, [sh]: '?' };
      const fig = geoTri(d.P, nm, { right: nm[ri], side, hl: [ask] });
      const g = leg ? [sh, d.h, s1, d.l1] : [s1, d.l1, s2, d.l2], ar = geoArr(dp, u);
      const sq = v => fx(v * v);
      const sol = ['Прямой угол при вершине ' + nm[ri] + ', гипотенуза — [' + sh + ']. По теореме Пифагора:', ['', sh + '^2=' + s1 + '^2+' + s2 + '^2']];
      if (!leg) sol.push(['Подставляем:', sh + '^2=' + d.l1 + '^2+' + d.l2 + '^2=' + sq(d.l1) + '+' + sq(d.l2) + '=' + fx(d.l1 * d.l1 + d.l2 * d.l2)], ['Извлекаем корень на калькуляторе и только потом округляем:', sh + '=√' + fx(d.l1 * d.l1 + d.l2 * d.l2) + '≈' + key, u]);
      else sol.push(['Квадрат катета — разность квадратов гипотенузы и другого катета:', s2 + '^2=' + d.h + '^2-' + d.l1 + '^2=' + sq(d.h) + '-' + sq(d.l1) + '=' + fx(d.h * d.h - d.l1 * d.l1)], ['Корень на калькуляторе, потом округление:', s2 + '=√' + fx(d.h * d.h - d.l1 * d.l1) + '≈' + key, u]);
      sol.push('Округляем по следующей цифре: ' + nf(geoRound(val, dp + 2)) + '… → ' + nf(+key) + '.');
      return { q: L('Le triangle ' + tri + ' est rectangle en ' + nm[ri] + ', ' + g[0] + ' = ' + nf(g[1]) + ' ' + u + ' et ' + g[2] + ' = ' + nf(g[3]) + ' ' + u + '. Calculer ' + ask + '. ' + ar.fr,
        'Треугольник ' + tri + ' прямоугольный, прямой угол при ' + nm[ri] + ', ' + g[0] + ' = ' + nf(g[1]) + ' ' + GEO_U[u] + ' и ' + g[2] + ' = ' + nf(g[3]) + ' ' + GEO_U[u] + '. Найди ' + ask + '. ' + ar.ru), fig, ans: N(key, { dp, unit: u }), sol };
    }
    /* problems: ladder, screen, field, ramp */
    const kind = r.pick(['echelle', 'ecran', 'terrain', 'rampe']);
    const S = geoScene();
    if (kind === 'echelle') {
      let Lg, d, h; do { Lg = r.pick([3, 3.5, 4, 4.5, 5, 5.5, 6]); d = geoD1(r, 0.8, 1.9); h = Math.sqrt(Lg * Lg - d * d); } while (!geoSafe(h, 2));
      const k = 150 / h, W = geoV(60, 170), T = geoV(60, 170 - h * k), F = geoV(60 + d * k, 170);
      S.seg(geoV(20, 170), geoV(200, 170), 'fl'); S.seg(geoV(60, 170), geoV(60, 5), 'fl');
      for (let y = 15; y < 170; y += 14) S.seg(geoV(60, y), geoV(52, y + 8), 'fl2');
      for (let x = 24; x < 200; x += 14) S.seg(geoV(x, 170), geoV(x - 8, 178), 'fl2');
      S.seg(T, F, 'fhl'); geoRightMark(S, W, T, F);
      geoSegLab(S, T, F, nf(Lg) + ' m', W); geoSegLab(S, W, F, nf(d) + ' m', T, { gap: 14 }); geoSegLab(S, W, T, '?', F, { gap: 14 });
      S.text(geoV(150, 70), 'mur', { cls: 'ftm', fs: 13 }); S.text(geoV(170, 155), 'sol', { cls: 'ftm', fs: 13 });
      const key = geoRound(h, 2).toFixed(2);
      return { q: L('Une échelle de ' + nf(Lg) + ' m est appuyée contre un mur vertical. Son pied est posé sur le sol horizontal, à ' + nf(d) + ' m du mur. À quelle hauteur le haut de l’échelle touche-t-il le mur ? Arrondir au centimètre.',
        'Лестница длиной ' + nf(Lg) + ' м приставлена к вертикальной стене. Её нижний конец стоит на горизонтальном полу в ' + nf(d) + ' м от стены. На какой высоте верх лестницы касается стены? Округли до сантиметра.'), fig: S.svg('échelle contre un mur'), ans: N(key, { dp: 2, unit: 'm' }),
        sol: ['Стена вертикальная, пол горизонтальный — между ними прямой угол. Лестница — гипотенуза прямоугольного треугольника, высота h и расстояние до стены — катеты.',
          ['По теореме Пифагора:', fx(Lg) + '^2=h^2+' + fx(d) + '^2'], ['Квадрат катета — разность:', 'h^2=' + fx(Lg) + '^2-' + fx(d) + '^2=' + fx(Lg * Lg) + '-' + fx(d * d) + '=' + fx(Lg * Lg - d * d)],
          ['Корень и округление до сотых метра (сантиметров):', 'h=√' + fx(Lg * Lg - d * d) + '≈' + key, 'm']] };
    }
    if (kind === 'ecran' || kind === 'terrain') {
      const scr = kind === 'ecran'; let w, hh, dg, dp = scr ? 0 : 1;
      do { if (scr) { w = r.ri(50, 140); hh = Math.round(w * r.pick([9 / 16, 10 / 16, 3 / 4])); } else { w = r.ri(25, 90); hh = r.ri(12, w - 6); } dg = Math.sqrt(w * w + hh * hh); } while (!geoSafe(dg, dp) || Number.isInteger(dg));
      const k = Math.min(220 / w, 130 / hh), A = geoV(0, 0), B = geoV(w * k, 0), C = geoV(w * k, hh * k), D = geoV(0, hh * k);
      S.poly([A, B, C, D], 'fl'); S.seg(D, B, 'fhl'); geoRightMark(S, C, B, D);
      const u = scr ? 'cm' : 'm', G = geoMid(A, C);
      geoSegLab(S, D, C, w + ' ' + u, G); geoSegLab(S, B, C, hh + ' ' + u, G); geoSegLab(S, D, B, '?', C, { gap: 3 });
      const key = geoRound(dg, dp).toFixed(dp), nmP = r.pick(PRENOMS_F.concat(PRENOMS_M));
      const q = scr ? L('Un écran de télévision rectangulaire mesure ' + w + ' cm de large et ' + hh + ' cm de haut. Calculer la longueur de sa diagonale. Arrondir au centimètre.', 'Прямоугольный экран телевизора имеет ширину ' + w + ' см и высоту ' + hh + ' см. Найди длину его диагонали. Округли до сантиметра.')
        : L('Un terrain rectangulaire mesure ' + w + ' m sur ' + hh + ' m. ' + nmP + ' le traverse en ligne droite d’un coin au coin opposé. Quelle distance parcourt-' + (PRENOMS_F.includes(nmP) ? 'elle' : 'il') + ' ? Arrondir au dixième.', 'Прямоугольное поле имеет размеры ' + w + ' м на ' + hh + ' м. ' + nmP + ' пересекает его по прямой из одного угла в противоположный. Какое расстояние он' + (PRENOMS_F.includes(nmP) ? 'а проходит' : ' проходит') + '? Округли до десятых.');
      return { q, fig: S.svg(scr ? 'écran rectangulaire' : 'terrain rectangulaire'), ans: N(key, { dp, unit: u }),
        sol: ['У прямоугольника все углы прямые, поэтому диагональ делит его на два прямоугольных треугольника; диагональ — их гипотенуза, а стороны прямоугольника — катеты.',
          ['По теореме Пифагора:', 'd^2=' + w + '^2+' + hh + '^2=' + (w * w) + '+' + (hh * hh) + '=' + (w * w + hh * hh)], ['Корень и округление:', 'd=√' + (w * w + hh * hh) + '≈' + key, u]] };
    }
    let Lg, hgt, x; do { Lg = geoD1(r, 2, 6); hgt = r.pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.8]); x = Math.sqrt(Lg * Lg - hgt * hgt); } while (!geoSafe(x, 2));
    const k = 230 / x, P0 = geoV(0, 120), P1 = geoV(x * k, 120), P2 = geoV(x * k, 120 - Math.max(hgt * k, 34));
    S.poly([P0, P1, P2], 'fl'); S.seg(P0, P2, 'fhl'); geoRightMark(S, P1, P0, P2, 8);
    geoSegLab(S, P0, P2, 'rampe : ' + nf(Lg) + ' m', P1); geoSegLab(S, P1, P2, nf(hgt) + ' m', P0); geoSegLab(S, P0, P1, '?', P2);
    const key = geoRound(x, 2).toFixed(2);
    return { q: L('Une rampe d’accès rectiligne mesure ' + nf(Lg) + ' m de long et permet de monter de ' + nf(hgt) + ' m (la figure n’est pas à l’échelle). Quelle est la distance horizontale entre le bas et le haut de la rampe ? Arrondir au centimètre.',
      'Прямой пандус длиной ' + nf(Lg) + ' м поднимается на высоту ' + nf(hgt) + ' м (рисунок не в масштабе). Каково расстояние по горизонтали между началом и концом пандуса? Округли до сантиметра.'), fig: S.svg('rampe d’accès (la figure n’est pas à l’échelle)'), ans: N(key, { dp: 2, unit: 'm' }),
      sol: ['Высота отсчитывается по вертикали, а расстояние — по горизонтали: между ними прямой угол. Пандус — гипотенуза (на рисунке высота преувеличена, чтобы было видно треугольник).',
        ['Катет = корень из разности квадратов гипотенузы и другого катета:', 'x^2=' + fx(Lg) + '^2-' + fx(hgt) + '^2=' + fx(Lg * Lg) + '-' + fx(hgt * hgt) + '=' + fx(Lg * Lg - hgt * hgt)],
        ['Корень и округление до сотых метра:', 'x=√' + fx(Lg * Lg - hgt * hgt) + '≈' + key, 'm'], 'Горизонтальное расстояние чуть меньше длины пандуса — так и должно быть: катет короче гипотенузы.'] };
  } });

/* ===================== RÉCIPROQUE DE PYTHAGORE ===================== */
const GEO_RIGHT_INT = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25], [20, 21, 29]];
const GEO_NOTR_INT = [[6, 7, 9], [4, 5, 7], [5, 6, 8], [6, 8, 11], [5, 12, 14], [8, 15, 16], [7, 8, 10], [9, 12, 16], [10, 11, 15], [4, 7, 8]];
const GEO_RIGHT_DEC = [[2.8, 4.5, 5.3], [3.3, 5.6, 6.5], [1.6, 6.3, 6.5], [2, 2.1, 2.9], [3.6, 7.7, 8.5], [1.2, 3.5, 3.7], [4.8, 6.4, 8], [6.5, 7.2, 9.7]];
const GEO_NOTR_DEC = [[2.5, 6, 6.4], [3, 4.1, 5], [4, 7.5, 8.4], [3.5, 4.5, 5.6], [4.2, 5.6, 7.1], [2.4, 4.5, 5.2]];
/* three lengths on the sides of a random triangle: the longest is opposite vertex ri */
function geoRecData(r, set) {
  const nm = r.pick(GEO_TRI), ri = r.ri(0, 2), v1 = (ri + 1) % 3, v2 = (ri + 2) % 3, sw = r() < 0.5;
  const a = sw ? set[1] : set[0], b = sw ? set[0] : set[1], c = set[2];
  const s1 = geoSide(nm, ri, v1), s2 = geoSide(nm, ri, v2), sh = geoSide(nm, v1, v2);
  const len = { [s1]: a, [s2]: b, [sh]: c };
  /* draw the real triangle: sides from vertex ri are a (to v1) and b (to v2), the angle comes from c */
  const cosA = (a * a + b * b - c * c) / (2 * a * b), P = []; P[ri] = geoV(0, 0); P[v1] = geoV(a, 0); P[v2] = geoPol(b, geoDeg(Math.acos(cosA)));
  const order = r.sh([s1, s2, sh]);
  return { nm, ri, s1, s2, sh, a, b, c, len, order, P: geoTurn(P, r.pick([0, 0, 15, -15, 180, 90]), r() < 0.5), right: Math.abs(a * a + b * b - c * c) < 1e-9 };
}
topic({ id: 'ge.pythagore-reciproque', ch: 'ge', lvl: 2, calc: false, variants: 3,
  ru: 'Прямоугольный ли треугольник (обратная теорема Пифагора)', fr: 'Réciproque du théorème de Pythagore',
  hints: [
    'Если треугольник прямоугольный, гипотенуза — самая длинная сторона. Поэтому сравниваем квадрат самой длинной стороны с суммой квадратов двух других.',
    'Считай отдельно: квадрат самой длинной стороны и сумму квадратов двух других. Равны — треугольник прямоугольный («réciproque du théorème de Pythagore»), прямой угол напротив самой длинной стороны.',
    'Не равны — треугольник не прямоугольный: будь он прямоугольным, по теореме Пифагора равенство обязательно выполнялось бы.'],
  gen(r, vi) {
    const dec = vi === 0 && r() < 0.4, isR = r() < 0.55;
    const set = r.pick(dec ? (isR ? GEO_RIGHT_DEC : GEO_NOTR_DEC) : (isR ? GEO_RIGHT_INT : GEO_NOTR_INT));
    const d = geoRecData(r, set), { nm, ri, s1, s2, sh, a, b, c, len, order } = d, tri = nm.join('');
    const u = 'cm', data = geoList(order.map(s => s + ' = ' + nf(len[s]) + ' ' + u)), dataR = geoList(order.map(s => s + ' = ' + nf(len[s]) + ' см'), true);
    const c2 = fx(c * c), ab2 = fx(a * a + b * b);
    if (vi === 0) {
      const fig = geoTri(d.P, nm, { side: { [s1]: nf(a) + ' cm', [s2]: nf(b) + ' cm', [sh]: nf(c) + ' cm' } });
      const opts = nm.map(v => L('Oui, il est rectangle en ' + v, 'Да, прямой угол при вершине ' + v)).concat([L('Non, il n’est pas rectangle', 'Нет, он не прямоугольный')]);
      return { q: L('Le triangle ' + tri + ' est tel que ' + data + '. Ce triangle est-il rectangle ?', 'В треугольнике ' + tri + ': ' + dataR + '. Прямоугольный ли этот треугольник?'), fig, calc: dec || c > 20, ans: MQF(opts, d.right ? ri : 3),
        sol: ['Если треугольник прямоугольный, гипотенуза — самая длинная сторона. Сравниваем квадрат самой длинной стороны с суммой квадратов двух других.',
          ['Самая длинная сторона — [' + sh + ']:', sh + '^2=' + c + '^2=' + c2], ['Сумма квадратов двух других:', s1 + '^2+' + s2 + '^2=' + a + '^2+' + b + '^2=' + fx(a * a) + '+' + fx(b * b) + '=' + ab2],
          d.right ? 'Числа равны. По обратной теореме Пифагора («réciproque du théorème de Pythagore») треугольник прямоугольный, а прямой угол лежит напротив самой длинной стороны [' + sh + '] — при вершине ' + nm[ri] + '.'
            : nf(+c2) + ' ≠ ' + nf(+ab2) + '. Будь треугольник прямоугольным, по теореме Пифагора эти числа были бы равны. Значит, он не прямоугольный (даже если на глаз угол кажется прямым).'] };
    }
    if (vi === 1) {
      const sq = s => '$' + s + '^2$';
      const opts = [L(sq(sh) + ' et ' + sq(s1 + '^2+' + s2), sq(sh) + ' и ' + sq(s1 + '^2+' + s2)), L(sq(s1) + ' et ' + sq(sh + '^2+' + s2), sq(s1) + ' и ' + sq(sh + '^2+' + s2)), L(sq(s2) + ' et ' + sq(s1 + '^2+' + sh), sq(s2) + ' и ' + sq(s1 + '^2+' + sh)), L('$' + sh + '$ et $' + s1 + '+' + s2 + '$', '$' + sh + '$ и $' + s1 + '+' + s2 + '$')];
      return { q: L('Le triangle ' + tri + ' est tel que ' + data + '. Pour savoir s’il est rectangle, que faut-il comparer ?', 'В треугольнике ' + tri + ': ' + dataR + '. Что нужно сравнить, чтобы узнать, прямоугольный ли он?'), ans: MQ(r, opts, 0),
        fig: geoTri(d.P, nm, { side: { [s1]: nf(a) + ' cm', [s2]: nf(b) + ' cm', [sh]: nf(c) + ' cm' } }),
        sol: ['Если треугольник прямоугольный, его гипотенуза — самая длинная сторона. Поэтому в равенстве Пифагора гипотенузой может быть только [' + sh + '] = ' + nf(c) + ' см.', 'Сравниваем квадрат самой длинной стороны с суммой квадратов двух других. Сравнивать длины без квадратов бессмысленно: в любом треугольнике сторона меньше суммы двух других.'] };
    }
    const s2txt = '$' + sh + '^2=' + c + '^2=' + c2 + '$ et $' + s1 + '^2+' + s2 + '^2=' + a + '^2+' + b + '^2=' + ab2 + '$.';
    const steps = [L('Dans le triangle ' + tri + ', le plus long côté est [' + sh + '].', 'В треугольнике ' + tri + ' самая длинная сторона — [' + sh + '].'),
      L('On compare le carré du plus long côté et la somme des carrés des deux autres côtés.', 'Сравниваем квадрат самой длинной стороны и сумму квадратов двух других сторон.'),
      L(s2txt, s2txt.replace(' et ', ' и ')),
      d.right ? L('Donc $' + sh + '^2=' + s1 + '^2+' + s2 + '^2$. D’après la réciproque du théorème de Pythagore, le triangle ' + tri + ' est rectangle en ' + nm[ri] + '.', 'Значит, $' + sh + '^2=' + s1 + '^2+' + s2 + '^2$. По обратной теореме Пифагора треугольник ' + tri + ' прямоугольный, прямой угол при вершине ' + nm[ri] + '.')
        : L('Donc $' + sh + '^2≠' + s1 + '^2+' + s2 + '^2$ : le triangle ' + tri + ' n’est pas rectangle (sinon, d’après le théorème de Pythagore, il y aurait égalité).', 'Значит, $' + sh + '^2≠' + s1 + '^2+' + s2 + '^2$: треугольник ' + tri + ' не прямоугольный (иначе по теореме Пифагора было бы равенство).')];
    return { q: L('On veut savoir si le triangle ' + tri + ', tel que ' + data + ', est rectangle. Remettre dans l’ordre les étapes de la démonstration.', 'Хотим узнать, прямоугольный ли треугольник ' + tri + ', у которого ' + dataR + '. Расставь шаги доказательства по порядку.'), ans: ORD(r, steps),
      sol: ['Сначала находим самую длинную сторону (только она может быть гипотенузой), потом говорим, что сравниваем, затем вычисляем и в конце делаем вывод со ссылкой на теорему.', d.right ? 'Вывод опирается на обратную теорему Пифагора: из равенства следует, что угол прямой.' : 'Вывод — от противного: если бы угол был прямым, по теореме Пифагора было бы равенство.'] };
  } });

/* ===================== THALÈS ===================== */
/* dimension line («cote») parallel to [ab], on the side away from `away`, at distance off; label outside */
function geoCote(S, a, b, txt, away, off) {
  let n = geoUnit(geoPerp(geoSub(b, a))); if (geoDp(n, geoSub(away, geoMid(a, b))) > 0) n = geoMul(n, -1);
  const a2 = geoAdd(a, geoMul(n, off)), b2 = geoAdd(b, geoMul(n, off)), u = geoUnit(geoSub(b2, a2));
  S.seg(a2, b2, 'fl2');
  [[a2, u], [b2, geoMul(u, -1)]].forEach(([p, d]) => { S.seg(geoAdd(p, geoMul(n, 5)), geoAdd(p, geoMul(n, -5)), 'fl2'); S.poly([geoAdd(geoAdd(p, geoMul(d, 7)), geoMul(n, 3)), p, geoAdd(geoAdd(p, geoMul(d, 7)), geoMul(n, -3))], 'fl2', true); });
  geoSegLab(S, a2, b2, txt, geoSub(geoMid(a2, b2), n), { gap: 3 });
}
/* extent of a label across a segment of direction d (to stack a cote beyond it) */
const geoAcross = (txt, a, b) => { const n = geoUnit(geoPerp(geoSub(b, a))); return Math.abs(n.x) * (geoTW(txt) / 2 + 1) + Math.abs(n.y) * GEO_FS * 0.42; };
/* Thalès figure. M: maths points [O, P1, P3, P2, P4] (P1, P3 on one line through O; P2, P4 on the other; (P1P2) ∥ (P3P4));
   nm: names in the same order; lab: { O1, O3, 13, O2, O4, 24, 12, 34 } → text; pap: butterfly (P4 may also lie on the ray of P2) */
function geoThFig(M, nm, lab, pap, o) {
  o = o || {};
  const f = geoFit(M, o.W || 240, o.H || 160), [O, P1, P3, P2, P4] = M.map(f), S = geoScene();
  const same = pap && geoDp(geoSub(P2, O), geoSub(P4, O)) > 0;
  const far2 = geoDist(O, P2) >= geoDist(O, P4) ? P2 : P4;
  if (pap) { S.seg(P1, P3); if (same) S.seg(O, far2); else S.seg(P2, P4); } else { S.seg(O, P3); S.seg(O, P4); }
  S.seg(P1, P2); S.seg(P3, P4);
  const segOf = { O1: [O, P1], O3: [O, P3], O2: [O, P2], O4: [O, P4], 13: [P1, P3], 24: [P2, P4], 12: [P1, P2], 34: [P3, P4] };
  (o.hl || []).forEach(k => S.seg(segOf[k][0], segOf[k][1], 'fhl'));
  [O, P1, P3, P2, P4].forEach(p => S.dot(p, 2.5));
  /* names first */
  const c2 = geoCen([O, P3, P4]), c1 = geoCen([O, P1, P2]);
  if (pap && !same) { const big = geoDist(P3, P4) > geoDist(P1, P2); geoPtLab(S, O, big ? geoSub(c2, O) : geoSub(c1, O), nm[0], { gap: 6 }); }
  else if (same) { let n = geoUnit(geoPerp(geoSub(P1, P3))); if (geoDp(n, geoSub(P2, O)) > 0) n = geoMul(n, -1); geoPtLab(S, O, n, nm[0], { gap: 6 }); }
  else geoPtLab(S, O, geoSub(O, c2), nm[0], { gap: 6 });
  const along = P => geoUnit(geoSub(P, O)), side = (P, X) => { const n = geoUnit(geoPerp(geoSub(P, O))); return geoDp(n, geoSub(X, P)) > 0 ? geoMul(n, -1) : n; };
  if (pap) {
    [[P1, nm[1]], [P3, nm[2]]].forEach(([P, t]) => geoPtLab(S, P, along(P), t, { gap: 6 }));
    [[P2, nm[3]], [P4, nm[4]]].forEach(([P, t]) => geoPtLab(S, P, same && P !== far2 ? side(P, P1) : along(P), t, { gap: 6 }));
  } else {
    geoPtLab(S, P3, geoSub(P3, c2), nm[2], { gap: 6 }); geoPtLab(S, P4, geoSub(P4, c2), nm[4], { gap: 6 });
    geoPtLab(S, P1, geoAdd(side(P1, P2), geoMul(along(P1), -0.3)), nm[1], { gap: 6 }); geoPtLab(S, P2, geoAdd(side(P2, P1), geoMul(along(P2), -0.3)), nm[3], { gap: 6 });
  }
  /* lengths: along each line through O; a whole side that contains a labelled part gets a dimension line */
  const ray = (Ps, Pb, away, kS, kB, kR, stack) => {
    if (lab[kS]) geoSegLab(S, O, Ps, lab[kS], away, { t: 0.58 });
    if (lab[kR]) geoSegLab(S, Ps, Pb, lab[kR], away);
    if (lab[kB]) {
      if (!stack) { geoSegLab(S, O, Pb, lab[kB], away, { t: 0.58 }); return; }
      const inner = Math.max(lab[kS] ? geoAcross(lab[kS], O, Ps) : 0, lab[kR] ? geoAcross(lab[kR], Ps, Pb) : 0);
      geoCote(S, O, Pb, lab[kB], away, inner ? 5 + 2 * inner + 8 : 10);
    }
  };
  if (pap) {
    ray(P1, P3, P2, 'O1', null, null, false); if (lab.O3) geoSegLab(S, O, P3, lab.O3, P4, { t: 0.58 });
    if (!same) { ray(P2, P4, P1, 'O2', null, null, false); if (lab.O4) geoSegLab(S, O, P4, lab.O4, P3, { t: 0.58 }); }
    else { const near = far2 === P2 ? P4 : P2, kN = far2 === P2 ? 'O4' : 'O2', kF = far2 === P2 ? 'O2' : 'O4'; ray(near, far2, P1, kN, kF, '24', true); }
  } else { ray(P1, P3, P4, 'O1', 'O3', '13', true); ray(P2, P4, P3, 'O2', 'O4', '24', true); }
  if (lab[12]) geoSegLab(S, P1, P2, lab[12], O, { canFlip: true });
  if (lab[34]) geoSegLab(S, P3, P4, lab[34], O, { canFlip: true });
  return S.svg(o.label || 'configuration de Thalès');
}
/* a Thalès configuration: small triangle sides (OP1, OP2, P1P2), ratio p/q (big = small × p/q) */
function geoThData(r, pap) {
  const K = r.pick([[2, 1], [3, 1], [3, 2], [5, 2], [4, 3], [5, 4], [2, 1], [3, 2], [4, 1], [5, 3]]), [p, q] = K;
  let s, ok = false, g = 0;
  while (!ok && g++ < 200) {
    s = [r.ri(1, 6) * q, r.ri(1, 6) * q, r.ri(1, 6) * q];
    const half = r() < 0.25 && q === 1 && p !== 3; if (half) s = s.map(v => v / 2 + (v % 2 ? 0 : 0));
    const [a, b, c] = s;   /* OP1, OP2, P1P2 */
    if (Math.max(a, b, c) * p / q > 24 || Math.min(a, b, c) < 1.5) continue;
    /* angles of the small triangle all at least 25°, the angle at O at most 110° */
    const ang = (x, y, z) => geoDeg(Math.acos((x * x + y * y - z * z) / (2 * x * y)));
    if (a + b <= c || a + c <= b || b + c <= a) continue;
    const A0 = ang(a, b, c), A1 = ang(a, c, b), A2 = 180 - A0 - A1;
    ok = A0 >= 30 && A0 <= 110 && A1 >= 30 && A2 >= 30 && a !== b;
  }
  const k = p / q, big = s.map(v => +(v * k).toFixed(4));
  /* maths points: O at the origin, P1 on the x-axis */
  const [a, b, c] = s, th = Math.acos((a * a + b * b - c * c) / (2 * a * b));
  const P1 = geoV(a, 0), P2 = geoV(b * Math.cos(th), b * Math.sin(th));
  const P3 = pap ? geoMul(P1, -k) : geoMul(P1, k), P4 = pap ? geoMul(P2, -k) : geoMul(P2, k);
  const rot = r.ri(0, 23) * 15, mir = r() < 0.5;
  const M = [geoV(0, 0), P1, P3, P2, P4].map(P => { let Q = mir ? geoV(-P.x, P.y) : P; return geoRot(Q, rot); });
  return { s, big, k, p, q, M };
}
const GEO_TH_TRI = [['A', 'B', 'E', 'C', 'D'], ['A', 'M', 'B', 'N', 'C'], ['O', 'M', 'R', 'N', 'S'], ['K', 'L', 'N', 'M', 'P'], ['R', 'S', 'U', 'T', 'V'], ['E', 'F', 'H', 'G', 'I'], ['S', 'I', 'E', 'J', 'F']];
const GEO_TH_PAP = [['A', 'B', 'D', 'C', 'E'], ['O', 'M', 'R', 'N', 'S'], ['I', 'K', 'M', 'L', 'N'], ['S', 'E', 'F', 'T', 'U'], ['E', 'F', 'H', 'G', 'K'], ['A', 'M', 'B', 'N', 'C']];
/* the three ratios of a configuration, as TeX */
const geoThRatios = (n) => '\\dfrac{' + n[0] + n[1] + '}{' + n[0] + n[2] + '}=\\dfrac{' + n[0] + n[3] + '}{' + n[0] + n[4] + '}=\\dfrac{' + n[1] + n[3] + '}{' + n[2] + n[4] + '}';
function geoThalesQ(r, pap, trap) {
  const nm = r.pick(pap ? GEO_TH_PAP : GEO_TH_TRI), D = geoThData(r, pap), u = 'cm';
  const [O, P1, P3, P2, P4] = nm;
  const names = [[O + P1, O + P3], [O + P2, O + P4], [P1 + P2, P3 + P4]], keys = [['O1', 'O3'], ['O2', 'O4'], ['12', '34']];
  let i, j, askBig;
  if (trap) { i = r.ri(0, 1); j = 1 - i; askBig = r() < 0.5; }
  else { i = r.ri(0, 2); j = r.pick([0, 1, 2].filter(x => x !== i)); askBig = r() < 0.6; }
  const sm = D.s, bg = D.big, val = askBig ? bg[j] : sm[j];
  const lab = {}, data = [], dataR = [];
  const put = (key, nmS, v) => { lab[key] = nf(v) + ' ' + u; data.push(nmS + ' = ' + nf(v) + ' ' + u); dataR.push(nmS + ' = ' + nf(v) + ' см'); };
  put(keys[i][0], names[i][0], sm[i]);
  let rest = null;
  if (trap) { rest = +(bg[i] - sm[i]).toFixed(4); const kR = i === 0 ? '13' : '24', nR = i === 0 ? P1 + P3 : P2 + P4; put(kR, nR, rest); }
  else put(keys[i][1], names[i][1], bg[i]);
  if (askBig) put(keys[j][0], names[j][0], sm[j]); else put(keys[j][1], names[j][1], bg[j]);
  /* in the trap version, sometimes ask the remaining part of the other side */
  let askName = askBig ? names[j][1] : names[j][0], askKey = askBig ? keys[j][1] : keys[j][0], part = false;
  if (trap && askBig && r() < 0.5) { part = true; askName = j === 0 ? P1 + P3 : P2 + P4; askKey = j === 0 ? '13' : '24'; }
  lab[askKey] = '?';
  const fig = geoThFig(D.M, nm, lab, pap, { hl: !pap && (askKey === 'O3' || askKey === 'O4') ? [] : [askKey] });
  const intro = pap ? L('Les droites (' + P1 + P3 + ') et (' + P2 + P4 + ') se coupent en ' + O + '. Les droites (' + P1 + P2 + ') et (' + P3 + P4 + ') sont parallèles.', 'Прямые (' + P1 + P3 + ') и (' + P2 + P4 + ') пересекаются в точке ' + O + '. Прямые (' + P1 + P2 + ') и (' + P3 + P4 + ') параллельны.')
    : L('Dans le triangle ' + O + P3 + P4 + ', le point ' + P1 + ' appartient au segment [' + O + P3 + '] et le point ' + P2 + ' appartient au segment [' + O + P4 + ']. Les droites (' + P1 + P2 + ') et (' + P3 + P4 + ') sont parallèles.', 'В треугольнике ' + O + P3 + P4 + ' точка ' + P1 + ' лежит на отрезке [' + O + P3 + '], а точка ' + P2 + ' — на отрезке [' + O + P4 + ']. Прямые (' + P1 + P2 + ') и (' + P3 + P4 + ') параллельны.');
  const q = L(intro.fr + ' On donne ' + geoList(data) + '. Calculer la longueur ' + askName + '.', intro.ru + ' Известно: ' + geoList(dataR, true) + '. Найди длину ' + askName + '.');
  const sol = [];
  if (trap) sol.push({ t: 'Осторожно: в отношениях Фалеса стоят расстояния от точки ' + O + ' — точки пересечения прямых. Отрезок [' + (i === 0 ? P1 + P3 : P2 + P4) + '] — только часть стороны, поэтому сначала находим всю сторону:', tex: names[i][1] + '=' + names[i][0] + '+' + (i === 0 ? P1 + P3 : P2 + P4) + '=' + geoT(sm[i]) + '+' + geoT(rest) + '=' + geoT(bg[i]) + '\\text{ cm}' });
  sol.push(pap ? { t: 'Прямые (' + P1 + P3 + ') и (' + P2 + P4 + ') пересекаются в ' + O + ', а (' + P1 + P2 + ') ∥ (' + P3 + P4 + '). По теореме Фалеса («théorème de Thalès») треугольник ' + O + P3 + P4 + ' — копия треугольника ' + O + P1 + P2 + ' в другом масштабе (повёрнутая на пол-оборота вокруг ' + O + '), поэтому отношения соответствующих сторон равны:', tex: geoThRatios(nm) }
    : { t: 'Точки ' + O + ', ' + P1 + ', ' + P3 + ' лежат на одной прямой, точки ' + O + ', ' + P2 + ', ' + P4 + ' — на другой, и (' + P1 + P2 + ') ∥ (' + P3 + P4 + '). По теореме Фалеса («théorème de Thalès») треугольник ' + O + P1 + P2 + ' — уменьшенная копия треугольника ' + O + P3 + P4 + ': все его стороны короче в одно и то же число раз. Поэтому:', tex: geoThRatios(nm) });
  const X = part ? (j === 0 ? O + P3 : O + P4) : askName;
  const known = '\\dfrac{' + geoT(sm[i]) + '}{' + geoT(bg[i]) + '}', other = askBig ? '\\dfrac{' + geoT(sm[j]) + '}{' + X + '}' : '\\dfrac{' + X + '}{' + geoT(bg[j]) + '}';
  sol.push({ t: 'Берём два отношения: одно, где обе длины известны, и другое — с искомой длиной:', tex: known + '=' + other });
  const res = askBig ? bg[j] : sm[j];
  sol.push({ t: 'Перекрёстное умножение («produit en croix»):', tex: X + '=' + (askBig ? '\\dfrac{' + geoT(bg[i]) + '\\times ' + geoT(sm[j]) + '}{' + geoT(sm[i]) + '}' : '\\dfrac{' + geoT(sm[i]) + '\\times ' + geoT(bg[j]) + '}{' + geoT(bg[i]) + '}') + '=' + geoT(res) + '\\text{ cm}' });
  let ansV = res;
  if (part) { ansV = +(bg[j] - sm[j]).toFixed(4); sol.push({ t: 'Спрашивают только часть стороны:', tex: askName + '=' + X + '-' + names[j][0] + '=' + geoT(bg[j]) + '-' + geoT(sm[j]) + '=' + geoT(ansV) + '\\text{ cm}' }); }
  const kk = D.q === 1 || Number.isInteger(D.k * 100) ? nf(D.k) : '$' + D.p + '/' + D.q + '$';
  sol.push(askBig ? 'Проверка: ' + X + ' длиннее, чем ' + names[j][0] + ', — стороны большого треугольника в ' + kk + ' раза длиннее сторон маленького.' : 'Проверка: ' + X + ' короче, чем ' + names[j][1] + ', — стороны маленького треугольника в ' + kk + ' раза короче сторон большого.');
  return { q, fig, ans: N(fx(ansV), { unit: u }), sol };
}
topic({ id: 'ge.thales', ch: 'ge', lvl: 2, calc: false, variants: 4,
  ru: 'Теорема Фалеса: найти длину', fr: 'Théorème de Thalès : calculer une longueur',
  hints: [
    'Фалес работает, когда две прямые пересекаются в одной точке, а две другие прямые параллельны. Тогда маленький треугольник — уменьшенная копия большого: все его стороны в одно и то же число раз короче.',
    'Записываем три равных отношения: стороны маленького треугольника — в числителях, соответствующие стороны большого — в знаменателях, например $AM/AB=AN/AC=MN/BC$. Все расстояния — от точки пересечения прямых.',
    'Выбери два отношения: одно, где обе длины известны, и другое — с неизвестной. Получится пропорция; неизвестное находим перекрёстным умножением («produit en croix»).'],
  gen(r, vi) {
    if (vi === 0) return geoThalesQ(r, false, false);
    if (vi === 1) return geoThalesQ(r, true, false);
    if (vi === 3) return geoThalesQ(r, false, true);
    /* which equality is true */
    const pap = r() < 0.4, nm = r.pick(pap ? GEO_TH_PAP : GEO_TH_TRI), D = geoThData(r, pap), [O, P1, P3, P2, P4] = nm;
    const fig = geoThFig(D.M, nm, {}, pap);
    const fr = (a, b) => '\\dfrac{' + a + '}{' + b + '}', T = s => '$$' + s + '$$';
    const good = fr(O + P1, O + P3) + '=' + fr(O + P2, O + P4) + '=' + fr(P1 + P2, P3 + P4);
    const bad1 = pap ? fr(O + P1, P1 + P3) + '=' + fr(O + P2, P2 + P4) + '=' + fr(P1 + P2, P3 + P4) : fr(O + P1, P1 + P3) + '=' + fr(O + P2, P2 + P4) + '=' + fr(P1 + P2, P3 + P4);
    const bad2 = fr(O + P1, O + P3) + '=' + fr(O + P4, O + P2) + '=' + fr(P1 + P2, P3 + P4);
    const bad3 = fr(O + P1, O + P3) + '=' + fr(O + P2, O + P4) + '=' + fr(P1 + P2, P1 + P3);
    const intro = pap ? L('Les droites (' + P1 + P3 + ') et (' + P2 + P4 + ') se coupent en ' + O + ' et les droites (' + P1 + P2 + ') et (' + P3 + P4 + ') sont parallèles.', 'Прямые (' + P1 + P3 + ') и (' + P2 + P4 + ') пересекаются в точке ' + O + ', прямые (' + P1 + P2 + ') и (' + P3 + P4 + ') параллельны.')
      : L('Les points ' + O + ', ' + P1 + ', ' + P3 + ' sont alignés, ainsi que les points ' + O + ', ' + P2 + ', ' + P4 + ', et les droites (' + P1 + P2 + ') et (' + P3 + P4 + ') sont parallèles.', 'Точки ' + O + ', ' + P1 + ', ' + P3 + ' лежат на одной прямой, точки ' + O + ', ' + P2 + ', ' + P4 + ' — на другой, прямые (' + P1 + P2 + ') и (' + P3 + P4 + ') параллельны.');
    return { q: L(intro.fr + ' Quelle égalité est vraie ?', intro.ru + ' Какое равенство верно?'), fig, ans: MQ(r, [L(T(good), T(good)), L(T(bad1), T(bad1)), L(T(bad2), T(bad2)), L(T(bad3), T(bad3))], 0),
      sol: ['Все длины в отношениях Фалеса отсчитываются от точки пересечения ' + O + ': стороны треугольника ' + O + P1 + P2 + ' делим на соответствующие стороны треугольника ' + O + P3 + P4 + '.',
        'В верном равенстве все дроби устроены одинаково: «маленький треугольник / большой треугольник». Типичные ошибки: взять отрезок [' + P1 + P3 + '] вместо [' + O + P3 + '] (это не сторона треугольника), перевернуть одну из дробей или поставить в третью дробь не параллельную сторону.'] };
  } });

/* ===================== RÉCIPROQUE DE THALÈS ===================== */
/* ratio as text: exact decimal or ≈ 3 decimals */
const geoRatio = (a, b) => { const v = a / b, e = Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-9; return { v, exact: e, s: (e ? '' : '≈') + nf(geoRound(v, 3)), m: (e ? '=' : '≈') + fx(geoRound(v, 3)) }; };
function geoRecThData(r, par) {
  let big, rho, sm, g = 0;
  do {
    big = [r.ri(5, 12), r.ri(5, 12)]; rho = r.pick([0.4, 0.5, 0.6, 0.75, 0.8, 0.3, 0.7, 0.25]);
    sm = big.map(v => geoRound(v * rho, 2));
    if (!par) sm[1] = geoRound(sm[1] + r.pick([-0.6, -0.4, -0.3, 0.3, 0.4, 0.6]), 2);
    g++;
  } while (g < 100 && (big[0] === big[1] || sm.some((v, i) => v <= 0.8 || v >= big[i] - 0.8 || !Number.isInteger(v * 10)) || (!par && Math.abs(sm[0] / big[0] - sm[1] / big[1]) < 0.015)));
  return { big, sm, rho };
}
topic({ id: 'ge.thales-reciproque', ch: 'ge', lvl: 3, calc: true, variants: 4,
  ru: 'Параллельны ли прямые (обратная теорема Фалеса)', fr: 'Réciproque du théorème de Thalès',
  hints: [
    'Обратная теорема Фалеса («réciproque du théorème de Thalès») доказывает параллельность. Нужны два условия: точки на двух прямых идут в одном и том же порядке, и отношения $AM/AB$ и $AN/AC$ равны.',
    'Вычисли каждое отношение отдельно (десятичной дробью) — или сравни перекрёстные произведения $AM*AC$ и $AN*AB$.',
    'Если отношения разные, прямые точно не параллельны: иначе по прямой теореме Фалеса отношения были бы равны. Если отношения равны, но порядок точек разный, прямые тоже не параллельны.'],
  gen(r, vi) {
    const u = 'cm';
    if (vi === 0 || vi === 2) {
      const par = vi === 2 || r() < 0.5, nm = r.pick(GEO_TH_TRI), [O, P1, P3, P2, P4] = nm, D = geoRecThData(r, par);
      /* points: O, P3, P4 from a triangle; P1, P2 at the given distances */
      const th = geoRad(r.ri(40, 75)), base = [geoV(D.big[0], 0), geoPol(D.big[1], geoDeg(th))], rot = r.ri(0, 23) * 15;
      const M = [geoV(0, 0), geoMul(base[0], D.sm[0] / D.big[0]), base[0], geoMul(base[1], D.sm[1] / D.big[1]), base[1]].map(P => geoRot(P, rot));
      const lab = { O1: nf(D.sm[0]) + ' cm', O3: nf(D.big[0]) + ' cm', O2: nf(D.sm[1]) + ' cm', O4: nf(D.big[1]) + ' cm' };
      const fig = geoThFig(M, nm, lab, false);
      const r1 = geoRatio(D.sm[0], D.big[0]), r2 = geoRatio(D.sm[1], D.big[1]);
      const q1 = O + P1 + '/' + O + P3, q2 = O + P2 + '/' + O + P4;
      const data = [O + P1 + ' = ' + nf(D.sm[0]) + ' cm', O + P3 + ' = ' + nf(D.big[0]) + ' cm', O + P2 + ' = ' + nf(D.sm[1]) + ' cm', O + P4 + ' = ' + nf(D.big[1]) + ' cm'];
      const intro = L('Le point ' + P1 + ' appartient au segment [' + O + P3 + '] et le point ' + P2 + ' appartient au segment [' + O + P4 + ']. On donne ' + geoList(data) + '.', 'Точка ' + P1 + ' лежит на отрезке [' + O + P3 + '], точка ' + P2 + ' — на отрезке [' + O + P4 + ']. Известно: ' + geoList(data.map(x => x.replace('cm', 'см')), true) + '.');
      if (vi === 2) {
        const st = [L('D’une part $' + q1 + '=' + fx(D.sm[0]) + '/' + D.big[0] + r1.m + '$ ; d’autre part $' + q2 + '=' + fx(D.sm[1]) + '/' + D.big[1] + r2.m + '$.', 'С одной стороны, $' + q1 + '=' + fx(D.sm[0]) + '/' + D.big[0] + r1.m + '$; с другой стороны, $' + q2 + '=' + fx(D.sm[1]) + '/' + D.big[1] + r2.m + '$.'),
          L('Donc $' + q1 + '=' + q2 + '$.', 'Значит, $' + q1 + '=' + q2 + '$.'),
          L('De plus, les points ' + O + ', ' + P1 + ', ' + P3 + ' et ' + O + ', ' + P2 + ', ' + P4 + ' sont alignés dans le même ordre, donc, d’après la réciproque du théorème de Thalès, les droites (' + P1 + P2 + ') et (' + P3 + P4 + ') sont parallèles.', 'Кроме того, точки ' + O + ', ' + P1 + ', ' + P3 + ' и ' + O + ', ' + P2 + ', ' + P4 + ' лежат на прямых в одном порядке, поэтому по обратной теореме Фалеса прямые (' + P1 + P2 + ') и (' + P3 + P4 + ') параллельны.')];
        return { q: L(intro.fr + ' Remettre dans l’ordre les étapes de la démonstration : les droites (' + P1 + P2 + ') et (' + P3 + P4 + ') sont parallèles.', intro.ru + ' Расставь по порядку шаги доказательства того, что прямые (' + P1 + P2 + ') и (' + P3 + P4 + ') параллельны.'), fig, ans: ORD(r, st),
          sol: ['Сначала вычисления (оба отношения), потом вывод из них (отношения равны), и в конце — ссылка на обратную теорему Фалеса вместе с её вторым условием: порядок точек одинаковый.', 'Без условия о порядке точек вывод неполный: равных отношений мало, если одна из точек лежит «с другой стороны».'] };
      }
      const opts = [L('Oui, car $' + q1 + '=' + q2 + '$ et les points sont alignés dans le même ordre', 'Да, потому что $' + q1 + '=' + q2 + '$ и точки идут в одном порядке'), L('Non, car $' + q1 + '≠' + q2 + '$', 'Нет, потому что $' + q1 + '≠' + q2 + '$'),
        L('Oui, car sur la figure les droites (' + P1 + P2 + ') et (' + P3 + P4 + ') ne se coupent pas', 'Да, потому что на рисунке прямые (' + P1 + P2 + ') и (' + P3 + P4 + ') не пересекаются'), L('On ne peut pas savoir sans connaître ' + P1 + P2 + ' et ' + P3 + P4, 'Нельзя узнать, не зная ' + P1 + P2 + ' и ' + P3 + P4)];
      return { q: L(intro.fr + ' Les droites (' + P1 + P2 + ') et (' + P3 + P4 + ') sont-elles parallèles ?', intro.ru + ' Параллельны ли прямые (' + P1 + P2 + ') и (' + P3 + P4 + ')?'), fig, ans: MQ(r, opts, par ? 0 : 1),
        sol: ['Сравниваем отношения длин от общей точки ' + O + ':', ['', q1 + '=' + fx(D.sm[0]) + '/' + D.big[0] + r1.m + ';' + q2 + '=' + fx(D.sm[1]) + '/' + D.big[1] + r2.m],
          par ? 'Отношения равны, и точки ' + O + ', ' + P1 + ', ' + P3 + ' и ' + O + ', ' + P2 + ', ' + P4 + ' идут в одном порядке. По обратной теореме Фалеса (' + P1 + P2 + ') ∥ (' + P3 + P4 + ').'
            : 'Отношения разные. Если бы прямые были параллельны, по теореме Фалеса эти отношения были бы равны, — значит, прямые не параллельны. «На глаз» это не видно: рисунок не доказательство.'] };
    }
    if (vi === 1) {   /* butterfly: the order of the points matters */
      const kind = r.pick(['par', 'ratio', 'order']), nm = r.pick(GEO_TH_PAP), [O, P1, P3, P2, P4] = nm;
      const D = geoRecThData(r, kind !== 'ratio');
      /* P3 on the far side of O from P1; P4 on the far side from P2 (or on the same side for «order») */
      const th = geoRad(r.ri(45, 75)), e1 = geoV(1, 0), e2 = geoPol(1, geoDeg(th));
      const bigOnFirst = r() < 0.5;   /* which pair is drawn as the big one */
      const p1 = geoMul(e1, bigOnFirst ? D.big[0] : D.sm[0]), p2 = geoMul(e2, bigOnFirst ? D.big[1] : D.sm[1]);
      const p3 = geoMul(e1, -(bigOnFirst ? D.sm[0] : D.big[0])), p4 = geoMul(e2, (kind === 'order' ? 1 : -1) * (bigOnFirst ? D.sm[1] : D.big[1]));
      if (kind === 'order' && geoDist(p2, p4) < 1.2) return this.gen(r, vi);
      const rot = r.ri(0, 23) * 15, M = [geoV(0, 0), p1, p3, p2, p4].map(P => geoRot(P, rot));
      const L1 = bigOnFirst ? [D.big[0], D.sm[0]] : [D.sm[0], D.big[0]], L2 = bigOnFirst ? [D.big[1], D.sm[1]] : [D.sm[1], D.big[1]];
      const fig = geoThFig(M, nm, { O1: nf(L1[0]) + ' cm', O3: nf(L1[1]) + ' cm', O2: nf(L2[0]) + ' cm', O4: nf(L2[1]) + ' cm' }, true, { label: 'deux droites sécantes en ' + O });
      const data = [O + P1 + ' = ' + nf(L1[0]) + ' cm', O + P3 + ' = ' + nf(L1[1]) + ' cm', O + P2 + ' = ' + nf(L2[0]) + ' cm', O + P4 + ' = ' + nf(L2[1]) + ' cm'];
      const q1 = O + P3 + '/' + O + P1, q2 = O + P4 + '/' + O + P2;
      const r1 = geoRatio(L1[1], L1[0]), r2 = geoRatio(L2[1], L2[0]);
      const opts = [L('Oui : $' + q1 + '=' + q2 + '$ et les points sont alignés dans le même ordre', 'Да: $' + q1 + '=' + q2 + '$ и точки идут в одном порядке'), L('Non, car $' + q1 + '≠' + q2 + '$', 'Нет, потому что $' + q1 + '≠' + q2 + '$'),
        L('Non : les points ' + P1 + ', ' + O + ', ' + P3 + ' et ' + P2 + ', ' + O + ', ' + P4 + ' ne sont pas alignés dans le même ordre', 'Нет: точки ' + P1 + ', ' + O + ', ' + P3 + ' и ' + P2 + ', ' + O + ', ' + P4 + ' идут не в одном порядке'), L('On ne peut pas savoir sans connaître ' + P1 + P2 + ' et ' + P3 + P4, 'Нельзя узнать, не зная ' + P1 + P2 + ' и ' + P3 + P4)];
      const sol = ['Сравниваем отношения длин от точки пересечения ' + O + ':', ['', q1 + '=' + fx(L1[1]) + '/' + fx(L1[0]) + r1.m + ';' + q2 + '=' + fx(L2[1]) + '/' + fx(L2[0]) + r2.m]];
      if (kind === 'ratio') sol.push('Отношения разные, значит, прямые (' + P1 + P2 + ') и (' + P3 + P4 + ') не параллельны: при параллельных прямых по теореме Фалеса отношения были бы равны.');
      else if (kind === 'order') sol.push('Отношения равны, но посмотри на рисунок: ' + P3 + ' лежит по другую сторону от ' + O + ', чем ' + P1 + ', а ' + P4 + ' — по ту же сторону, что и ' + P2 + '. Порядок точек разный, поэтому обратная теорема Фалеса не применяется, и прямые не параллельны (на рисунке это видно).');
      else sol.push('Отношения равны, и в обеих тройках точка ' + O + ' стоит посередине: ' + P1 + ', ' + O + ', ' + P3 + ' и ' + P2 + ', ' + O + ', ' + P4 + ' — один и тот же порядок. По обратной теореме Фалеса (' + P1 + P2 + ') ∥ (' + P3 + P4 + ').');
      return { q: L('Les droites (' + P1 + P3 + ') et (' + P2 + P4 + ') se coupent en ' + O + ', comme sur la figure. On donne ' + geoList(data) + '. Les droites (' + P1 + P2 + ') et (' + P3 + P4 + ') sont-elles parallèles ?', 'Прямые (' + P1 + P3 + ') и (' + P2 + P4 + ') пересекаются в точке ' + O + ', как на рисунке. Известно: ' + geoList(data.map(x => x.replace('cm', 'см')), true) + '. Параллельны ли прямые (' + P1 + P2 + ') и (' + P3 + P4 + ')?'), fig,
        ans: MQ(r, opts, kind === 'par' ? 0 : kind === 'ratio' ? 1 : 2), sol };
    }
    /* where to put N so that (MN) // (BC) */
    const nm = r.pick(GEO_TH_TRI), [O, P1, P3, P2, P4] = nm, D = geoRecThData(r, true);
    const th = r.ri(40, 75), rot = r.ri(0, 23) * 15, M = [geoV(0, 0), geoV(D.sm[0], 0), geoV(D.big[0], 0), geoPol(D.sm[1], th), geoPol(D.big[1], th)].map(P => geoRot(P, rot));
    const fig = geoThFig(M, nm, { O1: nf(D.sm[0]) + ' cm', O3: nf(D.big[0]) + ' cm', O4: nf(D.big[1]) + ' cm', O2: '?' }, false, { hl: ['O2'] });
    return { q: L('Le point ' + P1 + ' appartient au segment [' + O + P3 + '] et ' + O + P1 + ' = ' + nf(D.sm[0]) + ' cm, ' + O + P3 + ' = ' + nf(D.big[0]) + ' cm, ' + O + P4 + ' = ' + nf(D.big[1]) + ' cm. À quelle distance de ' + O + ' faut-il placer le point ' + P2 + ' sur le segment [' + O + P4 + '] pour que les droites (' + P1 + P2 + ') et (' + P3 + P4 + ') soient parallèles ?',
      'Точка ' + P1 + ' лежит на отрезке [' + O + P3 + '], ' + O + P1 + ' = ' + nf(D.sm[0]) + ' см, ' + O + P3 + ' = ' + nf(D.big[0]) + ' см, ' + O + P4 + ' = ' + nf(D.big[1]) + ' см. На каком расстоянии от ' + O + ' нужно поставить точку ' + P2 + ' на отрезке [' + O + P4 + '], чтобы прямые (' + P1 + P2 + ') и (' + P3 + P4 + ') были параллельны?'), fig,
      ans: N(fx(D.sm[1]), { unit: u }),
      sol: ['Точки ' + O + ', ' + P1 + ', ' + P3 + ' и ' + O + ', ' + P2 + ', ' + P4 + ' будут идти в одном порядке. По обратной теореме Фалеса прямые параллельны, если отношения равны:', { t: '', tex: '\\dfrac{' + O + P2 + '}{' + O + P4 + '}=\\dfrac{' + O + P1 + '}{' + O + P3 + '}=\\dfrac{' + geoT(D.sm[0]) + '}{' + geoT(D.big[0]) + '}' },
        { t: 'Отсюда:', tex: O + P2 + '=' + geoT(D.big[1]) + '\\times\\dfrac{' + geoT(D.sm[0]) + '}{' + geoT(D.big[0]) + '}=' + geoT(D.sm[1]) + '\\text{ cm}' }, 'Наоборот, если бы прямые были параллельны, по прямой теореме Фалеса ' + O + P2 + ' обязательно было бы таким — поэтому место точки ' + P2 + ' единственное.'] };
  } });

/* ===================== TRIGONOMÉTRIE ===================== */
/* a right triangle: right angle at ri, marked acute angle at ai; names of hypotenuse, adjacent and opposite sides */
function geoTrigData(r) {
  const nm = r.pick(GEO_TRI), ri = r.ri(0, 2), ai = (ri + r.ri(1, 2)) % 3, ti = 3 - ri - ai;
  return { nm, ri, ai, ti, hyp: geoSide(nm, ai, ti), adj: geoSide(nm, ai, ri), opp: geoSide(nm, ri, ti), ang: geoA3(nm, ai) };
}
/* points of that triangle with legs a (adjacent) and o (opposite), random orientation */
function geoTrigPts(r, T, a, o) {
  const P = []; P[T.ri] = geoV(0, 0); P[T.ai] = geoV(a, 0); P[T.ti] = geoV(0, o);
  return geoTurn(P, r.pick([0, 0, 90, 180, 270, 25, -25, 155, 205]), r() < 0.5);
}
const GEO_FN = { cos: ['adj', 'hyp'], sin: ['opp', 'hyp'], tan: ['opp', 'adj'] };
const GEO_FN_RU = { cos: 'косинус', sin: 'синус', tan: 'тангенс' };
const GEO_SIDE_RU = { adj: 'прилежащий катет', opp: 'противолежащий катет', hyp: 'гипотенуза' };
const GEO_SIDE_FR = { adj: 'côté adjacent', opp: 'côté opposé', hyp: 'hypoténuse' };
const geoTr = (fn, ang) => '\\' + fn + '\\widehat{' + ang + '}';
topic({ id: 'ge.trigo-choisir', ch: 'ge', lvl: 1, calc: false, variants: 4,
  ru: 'Тригонометрия: какое отношение выбрать', fr: 'Trigonométrie : choisir le bon rapport',
  hints: [
    'В прямоугольном треугольнике для острого угла: гипотенуза («hypoténuse») — напротив прямого угла; противолежащий катет («côté opposé») — напротив выбранного угла; прилежащий катет («côté adjacent») — сторона угла, которая не гипотенуза.',
    'cos = прилежащий / гипотенуза, sin = противолежащий / гипотенуза, tan = противолежащий / прилежащий. Французы запоминают «CAH SOH TOA» (звучит как «casse-toi»): Cosinus = Adjacent / Hypoténuse, Sinus = Opposé / Hypoténuse, Tangente = Opposé / Adjacent.',
    'Чтобы выбрать отношение, отметь две стороны, которые участвуют в задаче (известную и искомую), и посмотри, как они называются относительно угла. Ровно одно из трёх отношений содержит именно их.'],
  gen(r, vi) {
    const T = geoTrigData(r), tri = T.nm.join(''), R = T.nm[T.ri];
    const intro = L('Le triangle ' + tri + ' est rectangle en ' + R + '.', 'Треугольник ' + tri + ' прямоугольный, прямой угол при вершине ' + R + '.');
    if (vi === 0 || vi === 1) {
      const fn = r.pick(['cos', 'sin', 'tan']), [num, den] = GEO_FN[fn];
      const trip = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [6, 8, 10]]), sw = r() < 0.5;
      const len = { adj: sw ? trip[0] : trip[1], opp: sw ? trip[1] : trip[0], hyp: trip[2] };
      const nameOf = k => T[k];
      const show = vi === 0 ? (a, b) => '$' + len[a] + '/' + len[b] + '$' : (a, b) => '$' + nameOf(a) + '/' + nameOf(b) + '$';
      const all = [['adj', 'hyp'], ['opp', 'hyp'], ['opp', 'adj'], ['adj', 'opp'], ['hyp', 'adj'], ['hyp', 'opp']];
      const others = all.filter(p => !(p[0] === num && p[1] === den));
      const inv = others.find(p => p[0] === den && p[1] === num), rest = r.sh(others.filter(p => p !== inv)).slice(0, 2);
      const opts = [[num, den], inv, ...rest].map(p => L(show(p[0], p[1]), show(p[0], p[1])));
      const fig = geoTri(geoTrigPts(r, T, len.adj, len.opp), T.nm, { right: R, ang: { [T.nm[T.ai]]: '' }, side: vi === 0 ? { [T.adj]: len.adj + ' cm', [T.opp]: len.opp + ' cm', [T.hyp]: len.hyp + ' cm' } : null });
      const q = vi === 0 ? L(intro.fr + ' Parmi les propositions suivantes, laquelle est égale à $$' + geoTr(fn, T.ang) + '$$ ?', intro.ru + ' Какое из чисел равно $$' + geoTr(fn, T.ang) + '$$?')
        : L(intro.fr + ' Quel quotient permet de calculer $$' + geoTr(fn, T.ang) + '$$ ?', intro.ru + ' Какое отношение позволяет вычислить $$' + geoTr(fn, T.ang) + '$$?');
      return { q, fig, ans: MQ(r, opts, 0),
        sol: ['Смотрим на стороны относительно угла ' + T.nm[T.ai] + ': гипотенуза — [' + T.hyp + '] (напротив прямого угла), прилежащий катет — [' + T.adj + '] (сторона угла ' + T.nm[T.ai] + '), противолежащий — [' + T.opp + '] (напротив угла ' + T.nm[T.ai] + ').',
          { t: GEO_FN_RU[fn][0].toUpperCase() + GEO_FN_RU[fn].slice(1) + ' — это ' + GEO_SIDE_RU[num] + ', делённый на ' + (den === 'hyp' ? 'гипотенузу' : 'прилежащий катет') + ':', tex: geoTr(fn, T.ang) + '=\\dfrac{' + T[num] + '}{' + T[den] + '}' + (vi === 0 ? '=\\dfrac{' + len[num] + '}{' + len[den] + '}' : '') },
          (fn === 'tan' ? 'Перевёрнутая дробь — частая ошибка: тангенс — противолежащий катет сверху.' : 'Косинус и синус острого угла всегда меньше 1, потому что гипотенуза — самая длинная сторона и стоит в знаменателе. Дроби с гипотенузой в числителе сразу отпадают.')] };
    }
    if (vi === 2) {
      const k = r.pick(['adj', 'opp', 'hyp']);
      const fig = geoTri(geoTrigPts(r, T, r.ri(3, 6), r.ri(2, 5)), T.nm, { right: R, ang: { [T.nm[T.ai]]: '' } });
      const opts = ['adj', 'opp', 'hyp'].map(x => L('[' + T[x] + ']', '[' + T[x] + ']'));
      const qfr = k === 'hyp' ? 'Quelle est l’hypoténuse de ce triangle ?' : 'Quel est le ' + GEO_SIDE_FR[k] + ' à l’angle ' + geoHat(T.ang) + ' ?';
      const qru = k === 'hyp' ? 'Какая сторона — гипотенуза этого треугольника?' : 'Какая сторона — ' + GEO_SIDE_RU[k] + ' для угла ' + geoHat(T.ang) + '?';
      return { q: L(intro.fr + ' ' + qfr, intro.ru + ' ' + qru), fig, ans: MQ(r, opts, ['adj', 'opp', 'hyp'].indexOf(k)),
        sol: ['Гипотенуза («hypoténuse») всегда напротив прямого угла: прямой угол при ' + R + ', значит, гипотенуза — [' + T.hyp + '].',
          'Угол ' + T.nm[T.ai] + ' образован двумя сторонами: [' + T.hyp + '] и [' + T.adj + ']. Та из них, что не гипотенуза, — прилежащий катет («côté adjacent»): [' + T.adj + '].',
          'Оставшаяся сторона [' + T.opp + '] не касается вершины ' + T.nm[T.ai] + ' — она напротив угла: это противолежащий катет («côté opposé»).'] };
    }
    /* which formula gives the length */
    const pairs = [['hyp', 'adj'], ['hyp', 'opp'], ['adj', 'hyp'], ['adj', 'opp'], ['opp', 'hyp'], ['opp', 'adj']], [kn, ask] = r.pick(pairs);
    const al = r.pick([20, 25, 30, 35, 40, 50, 55, 60, 65, 70]), kv = r.ri(3, 12);
    const good = { 'hyp>adj': ['cos', '×'], 'hyp>opp': ['sin', '×'], 'adj>hyp': ['cos', '÷'], 'adj>opp': ['tan', '×'], 'opp>hyp': ['sin', '÷'], 'opp>adj': ['tan', '÷'] }[kn + '>' + ask];
    const fx2 = (fn, op) => '$$' + kv + (op === '×' ? '\\times' : '\\div') + '\\' + fn + '(' + al + '^\\circ)$$';
    const fns = ['cos', 'sin', 'tan'], other = fns.filter(x => x !== good[0]), opOther = good[1] === '×' ? '÷' : '×';
    const cand = [[good[0], opOther], [r.pick(other), good[1]], [r.pick(other), opOther]];
    if (cand[1][0] === cand[2][0]) cand[2][0] = other.find(x => x !== cand[1][0]);
    const opts = [good, ...cand].map(([fn, op]) => L(fx2(fn, op), fx2(fn, op)));
    const adjL = Math.cos(geoRad(al)), oppL = Math.sin(geoRad(al));
    const fig = geoTri(geoTrigPts(r, T, adjL, oppL), T.nm, { right: R, ang: { [T.nm[T.ai]]: al + '°' }, side: { [T[kn]]: kv + ' cm', [T[ask]]: '?' }, hl: [T[ask]] });
    const [num, den] = GEO_FN[good[0]];
    return { q: L(intro.fr + ' On donne ' + T[kn] + ' = ' + kv + ' cm et ' + geoHat(T.ang) + ' = ' + al + '°. Quelle expression permet de calculer la longueur ' + T[ask] + ' ?', intro.ru + ' Известно: ' + T[kn] + ' = ' + kv + ' см и ' + geoHat(T.ang) + ' = ' + al + '°. Каким выражением вычисляется длина ' + T[ask] + '?'), fig, ans: MQ(r, opts, 0),
      sol: ['Относительно угла ' + T.nm[T.ai] + ': [' + T[kn] + '] — ' + GEO_SIDE_RU[kn] + ' (известна), [' + T[ask] + '] — ' + GEO_SIDE_RU[ask] + ' (ищем).',
        { t: 'Эти две стороны связывает ' + GEO_FN_RU[good[0]] + ':', tex: geoTr(good[0], T.ang) + '=\\dfrac{' + T[num] + '}{' + T[den] + '}' },
        good[1] === '×' ? { t: 'Неизвестное в числителе — умножаем обе части на знаменатель:', tex: T[ask] + '=' + kv + '\\times\\' + good[0] + '(' + al + '^\\circ)' } : { t: 'Неизвестное в знаменателе — из пропорции оно получается делением:', tex: T[ask] + '=' + kv + '\\div\\' + good[0] + '(' + al + '^\\circ)' },
        good[0] === 'tan' ? 'Тангенс бывает и больше, и меньше 1, поэтому здесь главное — верно выбрать отношение и увидеть, где стоит неизвестное: в числителе — умножаем, в знаменателе — делим.'
          : good[1] === '×' ? 'Проверка здравым смыслом: катет короче гипотенузы — и правда, умножение на ' + good[0] + ' (число меньше 1) уменьшает длину.' : 'Проверка здравым смыслом: гипотенуза длиннее катета — и правда, деление на ' + good[0] + ' (число меньше 1) увеличивает длину.'] };
  } });

topic({ id: 'ge.trigo-calcul', ch: 'ge', lvl: 2, calc: true, variants: 4,
  ru: 'Тригонометрия: найти длину или угол', fr: 'Trigonométrie : calculer une longueur ou un angle',
  hints: [
    'Определи для данного угла, какие стороны известны и какая нужна: гипотенуза, противолежащий или прилежащий катет. Это подскажет cos, sin или tan («CAH SOH TOA»).',
    'Запиши отношение и подставь числа. Неизвестное в числителе — умножаем, в знаменателе — делим. Калькулятор должен быть в режиме градусов («degrés»).',
    'Угол по двум сторонам находят обратной функцией: клавиши $$\\cos^{-1}$$, $$\\sin^{-1}$$, $$\\tan^{-1}$$ (Arccos, Arcsin, Arctan). Округляй только в самом конце.'],
  gen(r, vi) {
    const T = geoTrigData(r), tri = T.nm.join(''), R = T.nm[T.ri], A = T.nm[T.ai];
    const intro = L('Le triangle ' + tri + ' est rectangle en ' + R + '.', 'Треугольник ' + tri + ' прямоугольный, прямой угол при вершине ' + R + '.');
    const named = k => GEO_SIDE_RU[k];
    if (vi === 0 || vi === 1) {
      /* vi 0: the unknown is in the numerator; vi 1: in the denominator */
      const pairs = vi === 0 ? [['hyp', 'adj'], ['hyp', 'opp'], ['adj', 'opp']] : [['adj', 'hyp'], ['opp', 'hyp'], ['opp', 'adj']];
      let kn, ask, al, kv, val, g = 0;
      do { [kn, ask] = r.pick(pairs); al = r.ri(18, 72); kv = r() < 0.6 ? r.ri(3, 15) : geoD1(r, 2.5, 14); const c = Math.cos(geoRad(al)), s = Math.sin(geoRad(al)), t = Math.tan(geoRad(al));
        val = { 'hyp>adj': kv * c, 'hyp>opp': kv * s, 'adj>opp': kv * t, 'adj>hyp': kv / c, 'opp>hyp': kv / s, 'opp>adj': kv / t }[kn + '>' + ask]; } while ((!geoSafe(val, 1) || val > 60) && g++ < 50);
      const fn = { 'hyp>adj': 'cos', 'hyp>opp': 'sin', 'adj>opp': 'tan', 'adj>hyp': 'cos', 'opp>hyp': 'sin', 'opp>adj': 'tan' }[kn + '>' + ask];
      const [num, den] = GEO_FN[fn], u = r.pick(['cm', 'cm', 'm']), key = geoRound(val, 1).toFixed(1);
      const legA = Math.cos(geoRad(al)), legO = Math.sin(geoRad(al));
      const fig = geoTri(geoTrigPts(r, T, legA, legO), T.nm, { right: R, ang: { [A]: al + '°' }, side: { [T[kn]]: nf(kv) + ' ' + u, [T[ask]]: '?' }, hl: [T[ask]] });
      const eq = geoTr(fn, T.ang) + '=\\dfrac{' + T[num] + '}{' + T[den] + '}', sub = '\\' + fn + '(' + al + '^\\circ)=\\dfrac{' + (num === kn ? geoT(kv) : T[ask]) + '}{' + (den === kn ? geoT(kv) : T[ask]) + '}';
      const res = T[ask] + '=' + (num === ask ? geoT(kv) + '\\times\\' + fn + '(' + al + '^\\circ)' : geoT(kv) + '\\div\\' + fn + '(' + al + '^\\circ)') + '\\approx ' + geoT(key) + '\\text{ ' + u + '}';
      return { q: L(intro.fr + ' On donne ' + T[kn] + ' = ' + nf(kv) + ' ' + u + ' et ' + geoHat(T.ang) + ' = ' + al + '°. Calculer la longueur ' + T[ask] + '. Arrondir au dixième.', intro.ru + ' Известно: ' + T[kn] + ' = ' + nf(kv) + ' ' + GEO_U[u] + ' и ' + geoHat(T.ang) + ' = ' + al + '°. Найди длину ' + T[ask] + '. Округли до десятых.'), fig, ans: N(key, { dp: 1, unit: u }),
        sol: ['Относительно угла ' + A + ': [' + T[kn] + '] — ' + named(kn) + ' (известен), [' + T[ask] + '] — ' + named(ask) + ' (ищем). Их связывает ' + GEO_FN_RU[fn] + ':', { t: '', tex: eq },
          { t: 'Подставляем известное:', tex: sub }, { t: num === ask ? 'Неизвестное в числителе — умножаем обе части на знаменатель:' : 'Неизвестное в знаменателе: умножим обе части на ' + T[ask] + ' (получится ' + T[ask] + ' × ' + fn + ' ' + al + '° = ' + nf(kv) + ') и разделим на ' + fn + ' ' + al + '°:', tex: res },
          'Калькулятор в режиме градусов; округляем только в конце: ' + nf(geoRound(val, 3)) + '… → ' + nf(+key) + '.'] };
    }
    if (vi === 2) {   /* an angle from two sides */
      const fn = r.pick(['cos', 'sin', 'tan']), [num, den] = GEO_FN[fn];
      let a, b, al, dp = r() < 0.5 ? 0 : 1, g = 0;
      do { const x = r.ri(2, 14); let y = r.ri(2, 14); if (y === x) y++; if (fn === 'tan') { a = x; b = y; } else { a = Math.min(x, y); b = Math.max(x, y) + r.ri(1, 4); }
        al = geoDeg(fn === 'cos' ? Math.acos(a / b) : fn === 'sin' ? Math.asin(a / b) : Math.atan(a / b)); } while ((!geoSafe(al, dp) || al < 12 || al > 78) && g++ < 60);
      const len = { [num]: a, [den]: b }, legA = Math.cos(geoRad(al)), legO = Math.sin(geoRad(al));
      const key = geoRound(al, dp).toFixed(dp), u = 'cm';
      const fig = geoTri(geoTrigPts(r, T, legA, legO), T.nm, { right: R, ang: { [A]: '?' }, angHl: [A], side: { [T[num]]: a + ' cm', [T[den]]: b + ' cm' } });
      const ar = geoArr(dp, '°'), arFr = dp === 1 ? 'Arrondir au dixième de degré.' : ar.fr, arRu = dp === 1 ? 'Округли до десятых долей градуса.' : ar.ru;
      return { q: L(intro.fr + ' On donne ' + T[num] + ' = ' + a + ' ' + u + ' et ' + T[den] + ' = ' + b + ' ' + u + '. Calculer la mesure de l’angle ' + geoHat(T.ang) + '. ' + arFr, intro.ru + ' Известно: ' + T[num] + ' = ' + a + ' см и ' + T[den] + ' = ' + b + ' см. Найди угол ' + geoHat(T.ang) + '. ' + arRu), fig, ans: N(key, { dp, unit: '°' }),
        sol: ['Относительно угла ' + A + ': [' + T[num] + '] — ' + named(num) + ', [' + T[den] + '] — ' + named(den) + '. Обе стороны известны, и их связывает ' + GEO_FN_RU[fn] + ':', { t: '', tex: geoTr(fn, T.ang) + '=\\dfrac{' + T[num] + '}{' + T[den] + '}=\\dfrac{' + a + '}{' + b + '}' },
          { t: 'Угол, у которого ' + GEO_FN_RU[fn] + ' равен ' + a + '/' + b + ', даёт обратная функция калькулятора (' + fn + '⁻¹):', tex: '\\widehat{' + T.ang + '}=\\' + fn + '^{-1}\\left(\\dfrac{' + a + '}{' + b + '}\\right)\\approx ' + geoT(key) + '^\\circ' },
          'Точное значение ' + nf(geoRound(al, 3)) + '…° округляем: ' + nf(+key) + '°. Проверка: угол острый, как и должно быть в прямоугольном треугольнике.'] };
    }
    /* problems */
    const kind = r.pick(['echelle', 'arbre', 'rampe', 'cerf']), S = geoScene(), nmP = r.pick(PRENOMS_F.concat(PRENOMS_M)), elle = PRENOMS_F.includes(nmP);
    if (kind === 'echelle') {
      let Lg, al, h; do { Lg = r.pick([3, 3.5, 4, 4.5, 5, 6, 7]); al = r.ri(60, 80); h = Lg * Math.sin(geoRad(al)); } while (!geoSafe(h, 2));
      const k = 150 / h, W = geoV(60, 170), T2 = geoV(60, 170 - h * k), F = geoV(60 + Lg * Math.cos(geoRad(al)) * k, 170);
      S.seg(geoV(20, 170), geoV(210, 170)); S.seg(geoV(60, 170), geoV(60, 5));
      for (let y = 15; y < 170; y += 14) S.seg(geoV(60, y), geoV(52, y + 8), 'fl2');
      S.seg(T2, F, 'fhl'); geoRightMark(S, W, T2, F); geoArc(S, F, T2, geoV(210, 170), { txt: al + '°', r: 22 });
      geoSegLab(S, T2, F, nf(Lg) + ' m', W); geoSegLab(S, W, T2, '?', F, { gap: 14 });
      const key = geoRound(h, 2).toFixed(2);
      return { q: L('Une échelle de ' + nf(Lg) + ' m est appuyée contre un mur vertical. Elle forme avec le sol horizontal un angle de ' + al + '°. À quelle hauteur le haut de l’échelle touche-t-il le mur ? Arrondir au centimètre.', 'Лестница длиной ' + nf(Lg) + ' м приставлена к вертикальной стене и образует с горизонтальным полом угол ' + al + '°. На какой высоте верх лестницы касается стены? Округли до сантиметра.'),
        fig: S.svg('échelle contre un mur'), ans: N(key, { dp: 2, unit: 'm' }),
        sol: ['Стена и пол образуют прямой угол, лестница — гипотенуза. Относительно угла ' + al + '° у основания лестницы высота h — противолежащий катет.', { t: 'Противолежащий катет и гипотенуза — это синус:', tex: '\\sin(' + al + '^\\circ)=\\dfrac{h}{' + geoT(Lg) + '}' },
          { t: 'Неизвестное в числителе — умножаем:', tex: 'h=' + geoT(Lg) + '\\times\\sin(' + al + '^\\circ)\\approx ' + geoT(key) + '\\text{ m}' }] };
    }
    if (kind === 'arbre') {
      let d, al, h; do { d = r.ri(8, 30); al = r.ri(20, 55); h = d * Math.tan(geoRad(al)); } while (!geoSafe(h, 1));
      const k = Math.min(230 / d, 130 / h), B = geoV(30, 160), P = geoV(30 + d * k, 160), Top = geoV(30 + d * k, 160 - h * k);
      S.seg(geoV(10, 160), geoV(P.x + 30, 160)); S.seg(P, Top, 'fl'); S.seg(B, Top, 'fdash'); S.text(geoV(P.x + 24, (P.y + Top.y) / 2 - 12), 'arbre', { cls: 'ftm', fs: 13 });
      geoRightMark(S, P, B, Top); geoArc(S, B, P, Top, { txt: al + '°', r: 26 });
      geoSegLab(S, B, P, d + ' m', Top); geoSegLab(S, P, Top, '?', B);
      const key = geoRound(h, 1).toFixed(1);
      return { q: L('Pour mesurer la hauteur d’un arbre, ' + nmP + ' se place à ' + d + ' m de son pied, sur un sol horizontal. ' + (elle ? 'Elle' : 'Il') + ' vise le sommet de l’arbre : la droite de visée fait un angle de ' + al + '° avec le sol. On néglige la taille de ' + nmP + '. Quelle est la hauteur de l’arbre ? Arrondir au dixième de mètre.',
        'Чтобы измерить высоту дерева, ' + nmP + ' встаёт в ' + d + ' м от его основания на ровной земле и смотрит на верхушку: луч зрения образует с землёй угол ' + al + '°. Рост наблюдателя не учитываем. Какова высота дерева? Округли до десятых метра.'), fig: S.svg('hauteur d’un arbre'), ans: N(key, { dp: 1, unit: 'm' }),
        sol: ['Дерево вертикально, земля горизонтальна — прямой угол у основания дерева. Относительно угла ' + al + '°: расстояние ' + d + ' м — прилежащий катет, высота h — противолежащий катет.', { t: 'Противолежащий и прилежащий катеты связывает тангенс:', tex: '\\tan(' + al + '^\\circ)=\\dfrac{h}{' + d + '}' },
          { t: 'Умножаем на ' + d + ':', tex: 'h=' + d + '\\times\\tan(' + al + '^\\circ)\\approx ' + geoT(key) + '\\text{ m}' }, 'Гипотенуза (луч зрения) здесь не нужна — поэтому ни синус, ни косинус не подходят.'] };
    }
    if (kind === 'rampe') {
      let hg, Lg, al; do { hg = r.pick([0.4, 0.5, 0.6, 0.75, 0.8, 1, 1.2]); Lg = geoD1(r, 3, 12); al = geoDeg(Math.atan(hg / Lg)); } while (!geoSafe(al, 1));
      const P0 = geoV(0, 120), P1 = geoV(230, 120), P2 = geoV(230, 70);
      S.poly([P0, P1, P2], 'fl'); S.seg(P0, P2, 'fhl'); geoRightMark(S, P1, P0, P2, 8); geoArc(S, P0, P1, P2, { txt: '?', r: 40 });
      geoSegLab(S, P0, P1, nf(Lg) + ' m', P2); geoSegLab(S, P1, P2, nf(hg) + ' m', P0);
      const key = geoRound(al, 1).toFixed(1);
      return { q: L('Une rampe rectiligne permet de monter de ' + nf(hg) + ' m sur une distance horizontale de ' + nf(Lg) + ' m (la figure n’est pas à l’échelle). Quel angle fait-elle avec l’horizontale ? Arrondir au dixième de degré.', 'Прямой пандус поднимается на ' + nf(hg) + ' м на горизонтальном расстоянии ' + nf(Lg) + ' м (рисунок не в масштабе). Какой угол он образует с горизонталью? Округли до десятых долей градуса.'),
        fig: S.svg('rampe (la figure n’est pas à l’échelle)'), ans: N(key, { dp: 1, unit: '°' }),
        sol: ['Высота и горизонталь образуют прямой угол. Относительно искомого угла α: высота ' + nf(hg) + ' м — противолежащий катет, горизонтальное расстояние ' + nf(Lg) + ' м — прилежащий (на рисунке подъём преувеличен).', { t: 'Это тангенс:', tex: '\\tan\\alpha=\\dfrac{' + geoT(hg) + '}{' + geoT(Lg) + '}' },
          { t: 'Обратная функция калькулятора:', tex: '\\alpha=\\tan^{-1}\\left(\\dfrac{' + geoT(hg) + '}{' + geoT(Lg) + '}\\right)\\approx ' + geoT(key) + '^\\circ' }] };
    }
    let fil, al, h; do { fil = r.pick([20, 25, 30, 35, 40, 45, 50]); al = r.ri(30, 70); h = fil * Math.sin(geoRad(al)); } while (!geoSafe(h, 1));
    const k = 150 / fil, G = geoV(30, 170), Kt = geoAdd(G, geoMul(geoV(Math.cos(geoRad(al)), -Math.sin(geoRad(al))), fil * k)), Hp = geoV(Kt.x, 170);
    S.seg(geoV(10, 170), geoV(Hp.x + 40, 170)); S.seg(G, Kt, 'fhl'); S.seg(Kt, Hp, 'fdash'); geoRightMark(S, Hp, G, Kt);
    S.poly([geoAdd(Kt, geoV(0, -14)), geoAdd(Kt, geoV(10, 0)), geoAdd(Kt, geoV(0, 14)), geoAdd(Kt, geoV(-10, 0))], 'fl');
    geoArc(S, G, Hp, Kt, { txt: al + '°', r: 26 }); geoSegLab(S, G, Kt, fil + ' m', Hp); geoSegLab(S, Hp, Kt, '?', G);
    const key = geoRound(h, 1).toFixed(1);
    return { q: L(nmP + ' fait voler un cerf-volant. Le fil, bien tendu, mesure ' + fil + ' m et fait un angle de ' + al + '° avec le sol horizontal. On néglige la taille de ' + nmP + '. À quelle hauteur se trouve le cerf-volant ? Arrondir au dixième de mètre.',
      nmP + ' запускает воздушного змея. Натянутая нить длиной ' + fil + ' м образует с горизонтальной землёй угол ' + al + '°. Рост ' + (elle ? 'девочки' : 'мальчика') + ' не учитываем. На какой высоте находится змей? Округли до десятых метра.'), fig: S.svg('cerf-volant'), ans: N(key, { dp: 1, unit: 'm' }),
      sol: ['Высота отсчитывается по вертикали до земли — прямой угол. Нить — гипотенуза, высота h — противолежащий катет для угла ' + al + '°.', { t: 'Это синус:', tex: '\\sin(' + al + '^\\circ)=\\dfrac{h}{' + fil + '}' },
        { t: 'Умножаем:', tex: 'h=' + fil + '\\times\\sin(' + al + '^\\circ)\\approx ' + geoT(key) + '\\text{ m}' }] };
  } });

/* ===================== GRIDS: symmetries, translations, rotations ===================== */
/* a grid of cols × rows cells; P(i, j) → screen point (j counted upwards) */
function geoGrid(cols, rows, c) {
  const S = geoScene();
  for (let i = 0; i <= cols; i++) S.seg(geoV(i * c, 0), geoV(i * c, rows * c), 'fgrid');
  for (let j = 0; j <= rows; j++) S.seg(geoV(0, j * c), geoV(cols * c, j * c), 'fgrid');
  return { S, c, cols, rows, P: (i, j) => geoV(i * c, (rows - j) * c) };
}
/* labelled points on a grid: [[i, j, name], …] — dots first, then the names in a free corner of a cell */
function geoGridPts(G, pts) {
  pts.forEach(([i, j]) => { const p = G.P(i, j); G.S.dot(p, 3); G.S.boxes.push([p.x - 3, p.y - 3, p.x + 3, p.y + 3]); });
  pts.forEach(([i, j, t]) => geoPtLab(G.S, G.P(i, j), geoV(1, -1), t, { gap: 3 }));
}
const GEO_LETTERS = 'ABCDEFGHJKLMNPRSTUVWXYZ'.split('');
const geoPl = (n, a, b, c) => { n = Math.abs(n); const m10 = n % 10, m100 = n % 100; return n + ' ' + (m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c); };
const geoCells = n => geoPl(n, 'клетка', 'клетки', 'клеток');
const geoKey = p => p[0] + ',' + p[1];
/* picks the right point and 3 distractors among candidates: all on the grid, all different, not on `bad` */
function geoPickPts(r, good, cands, G, bad) {
  const inside = p => p[0] >= 1 && p[0] <= G.cols - 1 && p[1] >= 1 && p[1] <= G.rows - 1;
  const seen = new Set(bad.map(geoKey)), out = [good]; seen.add(geoKey(good));
  if (!inside(good)) return null;
  for (const c of cands) { if (out.length === 4) break; if (inside(c) && !seen.has(geoKey(c))) { out.push(c); seen.add(geoKey(c)); } }
  return out.length === 4 ? out : null;
}
/* question «which point is the image of K»: returns { fig, ans } with letters */
function geoImgQ(r, G, K, pts4, extra) {
  const letters = r.sh(GEO_LETTERS).slice(0, 5), nK = letters[4];
  const named = pts4.map((p, i) => [p[0], p[1], letters[i]]);
  geoGridPts(G, [[K[0], K[1], nK]].concat(r.sh(named), extra || []));
  return { nK, names: letters.slice(0, 4), opts: letters.slice(0, 4).map(l => L('Le point ' + l, 'Точка ' + l)) };
}
topic({ id: 'ge.symetries', ch: 'ge', lvl: 1, calc: false, variants: 3,
  ru: 'Осевая и центральная симметрия', fr: 'Symétrie axiale et symétrie centrale',
  hints: [
    'Осевая симметрия («symétrie axiale») — это перегиб листа по прямой (d): точка и её образ лежат на одном перпендикуляре к (d), на равных расстояниях по разные стороны от неё.',
    'Центральная симметрия («symétrie centrale») с центром O — пол-оборота вокруг O: O — середина отрезка между точкой и её образом. На клетках: сколько клеток от K до O вправо и вверх — столько же от O дальше, тоже вправо и вверх.',
    'Ось симметрии фигуры — прямая, при перегибе по которой фигура совпадает сама с собой. Проверяй каждую возможную ось: через вершины, через середины сторон.'],
  gen(r, vi) {
    if (vi === 2) {   /* number of axes of symmetry of a figure */
      const sh = r.pick(['carre', 'rect', 'los', 'equi', 'iso', 'para', 'trap', 'hexa', 'penta', 'cerf', 'quel']);
      const D = { carre: [4, 'ce carré', 'этого квадрата'], rect: [2, 'ce rectangle (qui n’est pas un carré)', 'этого прямоугольника (не квадрата)'], los: [2, 'ce losange (qui n’est pas un carré)', 'этого ромба (не квадрата)'],
        equi: [3, 'ce triangle équilatéral', 'этого равностороннего треугольника'], iso: [1, 'ce triangle isocèle (non équilatéral)', 'этого равнобедренного (не равностороннего) треугольника'], para: [0, 'ce parallélogramme (qui n’est ni un rectangle ni un losange)', 'этого параллелограмма (не прямоугольника и не ромба)'],
        trap: [1, 'ce trapèze isocèle', 'этой равнобедренной трапеции'], hexa: [6, 'cet hexagone régulier', 'этого правильного шестиугольника'], penta: [5, 'ce pentagone régulier', 'этого правильного пятиугольника'],
        cerf: [1, 'ce cerf-volant (quadrilatère avec deux paires de côtés consécutifs égaux)', 'этого «воздушного змея» (четырёхугольника с двумя парами равных соседних сторон)'], quel: [0, 'ce triangle dont les trois côtés sont de longueurs différentes', 'этого треугольника с тремя разными сторонами'] }[sh];
      const S = geoScene(), reg = n => { const ps = []; for (let i = 0; i < n; i++) ps.push(geoPol(1, 90 + 360 * i / n)); return ps; };
      const M = { carre: [geoV(0, 0), geoV(1, 0), geoV(1, 1), geoV(0, 1)], rect: [geoV(0, 0), geoV(1.7, 0), geoV(1.7, 1), geoV(0, 1)], los: [geoV(0, -0.7), geoV(1.1, 0), geoV(0, 0.7), geoV(-1.1, 0)], equi: reg(3), iso: [geoV(-0.6, 0), geoV(0.6, 0), geoV(0, 1.5)],
        para: [geoV(0, 0), geoV(1.6, 0), geoV(2.2, 0.9), geoV(0.6, 0.9)], trap: [geoV(-1, 0), geoV(1, 0), geoV(0.55, 0.9), geoV(-0.55, 0.9)], hexa: reg(6), penta: reg(5), cerf: [geoV(0, 1), geoV(-0.6, 0.45), geoV(0, -1), geoV(0.6, 0.45)], quel: [geoV(0, 0), geoV(2, 0), geoV(0.5, 1.1)] }[sh];
      const Mr = geoTurn(M, r.pick([0, 0, 15, -15])), Q = Mr.map(geoFit(Mr, 170, 120));
      S.poly(Q, 'ffill'); S.poly(Q, 'fl');
      const n = Q.length, ed = i => [Q[i], Q[(i + 1) % n]];
      if (sh === 'carre' || sh === 'los' || sh === 'hexa' || sh === 'penta' || sh === 'equi') for (let i = 0; i < n; i++) geoTicks(S, ...ed(i), 1);
      if (sh === 'rect' || sh === 'para') { geoTicks(S, ...ed(0), 1); geoTicks(S, ...ed(2), 1); geoTicks(S, ...ed(1), 2); geoTicks(S, ...ed(3), 2); }
      if (sh === 'carre' || sh === 'rect') Q.forEach((v, i) => geoRightMark(S, v, Q[(i + 1) % n], Q[(i + n - 1) % n], 9));
      if (sh === 'iso') { geoTicks(S, Q[1], Q[2], 1); geoTicks(S, Q[0], Q[2], 1); }
      if (sh === 'trap') { geoTicks(S, Q[1], Q[2], 1); geoTicks(S, Q[3], Q[0], 1); }
      if (sh === 'cerf') { geoTicks(S, Q[0], Q[1], 1); geoTicks(S, Q[3], Q[0], 1); geoTicks(S, Q[1], Q[2], 2); geoTicks(S, Q[2], Q[3], 2); }
      const k = D[0];
      const why = { carre: 'У квадрата 4 оси: две через середины противоположных сторон и две диагонали.', rect: 'У прямоугольника 2 оси — через середины противоположных сторон. Диагональ — не ось: при перегибе по ней углы не совпадут.', los: 'У ромба 2 оси — его диагонали. Прямая через середины сторон — не ось, если ромб не квадрат.',
        equi: 'У равностороннего треугольника 3 оси — через каждую вершину и середину противоположной стороны.', iso: 'У равнобедренного треугольника одна ось — через вершину между равными сторонами и середину основания.', para: 'У такого параллелограмма нет осей симметрии (у него есть только центр симметрии — точка пересечения диагоналей).',
        trap: 'У равнобедренной трапеции одна ось — через середины двух оснований.', hexa: 'У правильного шестиугольника 6 осей: 3 через противоположные вершины и 3 через середины противоположных сторон.', penta: 'У правильного пятиугольника 5 осей: каждая проходит через вершину и середину противоположной стороны.',
        cerf: 'У «воздушного змея» одна ось — диагональ, соединяющая вершины, где сходятся равные стороны.', quel: 'Все стороны разные, поэтому никакой перегиб не совместит треугольник с собой — осей нет.' }[sh];
      return { q: L('Combien d’axes de symétrie possède ' + D[1] + ' ?', 'Сколько осей симметрии у ' + D[2] + '?'), fig: S.svg('figure'), ans: N(k),
        sol: ['Ось симметрии — прямая, при перегибе по которой фигура совпадает сама с собой.', why] };
    }
    const G = geoGrid(12, 8, 26);
    if (vi === 0) {   /* central symmetry */
      let res = null, O, K;
      while (!res) {
        O = [r.ri(4, 8), r.ri(3, 5)]; const d = [r.nz(-4, 4), r.nz(-3, 3)]; if (Math.abs(d[0]) + Math.abs(d[1]) < 3) continue; K = [O[0] + d[0], O[1] + d[1]];
        const good = [O[0] - d[0], O[1] - d[1]];
        res = geoPickPts(r, good, r.sh([[O[0] - d[0], O[1] + d[1]], [O[0] + d[0], O[1] - d[1]], [O[0] - d[1], O[1] + d[0]], [good[0] + r.sgn(), good[1]], [good[0], good[1] + r.sgn()], [O[0] + d[1], O[1] - d[0]]]), G, [K, O]);
        if (res && (K[0] < 1 || K[0] > 11 || K[1] < 1 || K[1] > 7)) res = null;
      }
      const Q = geoImgQ(r, G, K, res, [[O[0], O[1], 'O']]);
      const dx = O[0] - K[0], dy = O[1] - K[1], st = (n, a, b) => geoCells(n) + ' ' + (n > 0 ? a : b);
      return { q: L('Dans le quadrillage ci-dessous, quel est le symétrique du point ' + Q.nK + ' par la symétrie de centre O ?', 'На клетчатой сетке ниже: какая точка симметрична точке ' + Q.nK + ' относительно центра O?'), fig: G.S.svg('quadrillage'), ans: MQ(r, Q.opts, 0),
        sol: ['При центральной симметрии O — середина отрезка между точкой и её образом: образ лежит на прямой ' + Q.nK + 'O, по другую сторону от O, на том же расстоянии.',
          'От ' + Q.nK + ' до O: ' + st(dx, 'вправо', 'влево') + ' и ' + st(dy, 'вверх', 'вниз') + '. Повторяем тот же путь от O дальше — попадаем в точку ' + Q.names[0] + '.',
          'Точки, где изменилось только одно направление, — это образы при осевой симметрии (перегибе), а не при центральной.'] };
    }
    /* axial symmetry: vertical, horizontal or diagonal axis */
    const kind = r.pick(['v', 'h', 'd', 'd']);
    let res = null, K, ax;
    while (!res) {
      if (kind === 'v') { ax = r.ri(4, 8); K = [ax + r.nz(-4, 4), r.ri(1, 7)]; const g = [2 * ax - K[0], K[1]]; res = geoPickPts(r, g, r.sh([[g[0] + (g[0] > ax ? 1 : -1), g[1]], [g[0], g[1] + r.sgn()], [g[0], 8 - K[1]], [g[0] - (g[0] > ax ? 1 : -1), g[1] + r.sgn()]]), G, [K]); }
      else if (kind === 'h') { ax = r.ri(3, 5); K = [r.ri(1, 11), ax + r.nz(-3, 3)]; const g = [K[0], 2 * ax - K[1]]; res = geoPickPts(r, g, r.sh([[g[0], g[1] + (g[1] > ax ? 1 : -1)], [g[0] + r.sgn(), g[1]], [12 - K[0], g[1]], [g[0] + r.sgn(), g[1] - (g[1] > ax ? 1 : -1)]]), G, [K]); }
      else { ax = r.ri(-3, 3); K = [r.ri(1, 11), r.ri(1, 7)]; if (K[1] === K[0] + ax) continue; const g = [K[1] - ax, K[0] + ax];   /* axis y = x + ax */
        res = geoPickPts(r, g, r.sh([[2 * (K[1] - ax) - K[0], K[1]], [K[0], 2 * (K[0] + ax) - K[1]], [g[0] + r.sgn(), g[1]], [g[0], g[1] + r.sgn()]]), G, [K]);
        if (res && res.some(p => p[1] === p[0] + ax)) res = null; }
      if (res && (K[0] < 1 || K[0] > 11 || K[1] < 1 || K[1] > 7)) res = null;
    }
    let a, b;
    if (kind === 'v') { a = G.P(ax, 0); b = G.P(ax, 8); } else if (kind === 'h') { a = G.P(0, ax); b = G.P(12, ax); }
    else { const x0 = Math.max(0, -ax), x1 = Math.min(12, 8 - ax); a = G.P(x0, x0 + ax); b = G.P(x1, x1 + ax); }
    G.S.seg(a, b, 'fhl');
    const lp = kind === 'h' ? geoAdd(b, geoV(-14, -12)) : geoAdd(b, geoV(kind === 'v' ? 18 : 16, kind === 'v' ? 10 : 10));
    G.S.text(lp, '(d)'); G.S.boxes.push([lp.x - 14, lp.y - 8, lp.x + 14, lp.y + 8]);
    const Q = geoImgQ(r, G, K, res);
    const sol = kind === 'd' ? ['При осевой симметрии точка и её образ лежат на перпендикуляре к оси (d), на равных расстояниях от неё. Ось (d) идёт по диагоналям клеток, перпендикуляр к ней — тоже по диагоналям, но в другую сторону.',
      'Идём от ' + Q.nK + ' по диагоналям клеток перпендикулярно (d), считаем шаги до оси и делаем столько же шагов дальше: попадаем в ' + Q.names[0] + '.', 'Частая ошибка — идти к наклонной оси по горизонтали или по вертикали: так получаются неверные точки.']
      : ['При осевой симметрии точка и её образ лежат на перпендикуляре к оси (d), на равных расстояниях от неё. Ось ' + (kind === 'v' ? 'вертикальная, значит, двигаемся по горизонтали' : 'горизонтальная, значит, двигаемся по вертикали') + '.',
        'От ' + Q.nK + ' до (d) — ' + geoCells(kind === 'v' ? K[0] - ax : K[1] - ax) + '; откладываем столько же по другую сторону — это точка ' + Q.names[0] + '.'];
    return { q: L('Dans le quadrillage ci-dessous, quel est le symétrique du point ' + Q.nK + ' par la symétrie d’axe (d) ?', 'На клетчатой сетке ниже: какая точка симметрична точке ' + Q.nK + ' относительно прямой (d)?'), fig: G.S.svg('quadrillage'), ans: MQ(r, Q.opts, 0), sol };
  } });

/* text of a grid step: «3 клетки вправо и 1 клетка вверх» */
const geoStep = (dx, dy) => [dx ? geoCells(dx) + (dx > 0 ? ' вправо' : ' влево') : '', dy ? geoCells(dy) + (dy > 0 ? ' вверх' : ' вниз') : ''].filter(Boolean).join(' и ');
/* the figure of 16 isosceles right triangles: a square cut into 4 small squares, each cut by its two diagonals */
function geoSixteen(r) {
  const pts = [];
  for (let j = 2; j >= 0; j--) for (let i = 0; i <= 2; i++) pts.push([i, j]);
  for (let j = 1; j >= 0; j--) for (let i = 0; i <= 1; i++) pts.push([i + 0.5, j + 0.5]);
  const names = r.sh(GEO_LETTERS).slice(0, 13), nameAt = {}; pts.forEach((p, k) => { nameAt[geoKey(p)] = names[k]; });
  /* triangle: small square (i, j), side s = 0 bottom, 1 right, 2 top, 3 left → [corner, centre, corner] */
  const tri = (i, j, s) => { const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]]; return [c[s], [i + 0.5, j + 0.5], c[(s + 1) % 4]]; };
  const nameOf = t => t.map(p => nameAt[geoKey(p)]).join('');
  return { pts, nameAt, tri, nameOf };
}
function geoSixteenFig(F, shade) {
  const u = 104, S = geoScene(), P = p => geoV(p[0] * u, (2 - p[1]) * u);
  if (shade) S.poly(shade.map(P), 'ffill');
  S.poly([[0, 0], [2, 0], [2, 2], [0, 2]].map(P), 'fl'); S.seg(P([1, 0]), P([1, 2])); S.seg(P([0, 1]), P([2, 1]));
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { S.seg(P([i, j]), P([i + 1, j + 1])); S.seg(P([i + 1, j]), P([i, j + 1])); }
  F.pts.forEach(p => {
    const q = P(p), n = F.nameAt[geoKey(p)], centre = p[0] % 1 !== 0;
    let dir;
    if (centre) dir = geoV(1, 0);
    else if (p[0] === 1 && p[1] === 1) dir = geoRot(geoV(1, 0), -22.5);
    else dir = geoV(p[0] === 0 ? -1 : p[0] === 2 ? 1 : 0, p[1] === 0 ? 1 : p[1] === 2 ? -1 : 0);
    geoPtLab(S, q, dir, n, { gap: centre ? 7 : 5 });
  });
  return S.svg('figure formée de 16 triangles');
}
const GEO_DIR_FR = { 'sens+': 'dans le sens inverse des aiguilles d’une montre', 'sens-': 'dans le sens des aiguilles d’une montre' };
const GEO_DIR_RU = { 'sens+': 'против часовой стрелки', 'sens-': 'по часовой стрелке' };
topic({ id: 'ge.transformations', ch: 'ge', lvl: 2, calc: false, variants: 5,
  ru: 'Перенос, поворот, какое преобразование', fr: 'Translation, rotation : reconnaître une transformation',
  hints: [
    'Параллельный перенос («translation») сдвигает всю фигуру на один и тот же вектор: на столько же клеток и в ту же сторону, что и от точки A до точки B. Фигура не поворачивается и не переворачивается.',
    'Поворот («rotation») задают центром, углом и направлением. Каждая точка остаётся на том же расстоянии от центра. На клетках поворот на 90° против часовой стрелки превращает шаг «3 вправо, 1 вверх» в «3 вверх, 1 влево».',
    'Как узнать преобразование: фигура только сдвинута — перенос; перевёрнута, как в зеркале, — осевая симметрия; повёрнута на пол-оборота — центральная симметрия; на четверть оборота — поворот на 90°.'],
  gen(r, vi) {
    if (vi === 1) {   /* 16 triangles, translation (reference subject 2027 n°1) */
      const F = geoSixteen(r), vs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
      let v, i, j, s, P0;
      do { v = r.pick(vs); i = r.ri(0, 1); j = r.ri(0, 1); s = r.ri(0, 3); } while (i + v[0] < 0 || i + v[0] > 1 || j + v[1] < 0 || j + v[1] > 1);
      const starts = F.pts.filter(p => F.nameAt[geoKey([p[0] + v[0], p[1] + v[1]])]); P0 = r.pick(starts);
      const P1 = [P0[0] + v[0], P0[1] + v[1]], src = F.tri(i, j, s), img = F.tri(i + v[0], j + v[1], s);
      const cands = [F.tri(i + v[0], j + v[1], (s + 2) % 4), F.tri(i + v[0], j + v[1], (s + 1) % 4), F.tri(i + v[0], j + v[1], (s + 3) % 4)];
      if (i - v[0] >= 0 && i - v[0] <= 1 && j - v[1] >= 0 && j - v[1] <= 1) cands.unshift(F.tri(i - v[0], j - v[1], s));
      const names = [F.nameOf(img), ...cands.slice(0, 3).map(F.nameOf)];
      const fig = geoSixteenFig(F, src), nA = F.nameAt[geoKey(P0)], nB = F.nameAt[geoKey(P1)], nS = F.nameOf(src);
      const step = (v[0] ? (v[0] > 0 ? 'вправо' : 'влево') : '') + (v[0] && v[1] ? ' и ' : '') + (v[1] ? (v[1] > 0 ? 'вверх' : 'вниз') : '');
      return { q: L('La figure ci-dessous est formée de 16 triangles rectangles isocèles identiques. Quelle est l’image du triangle ' + nS + ' par la translation qui transforme ' + nA + ' en ' + nB + ' ?', 'Фигура ниже составлена из 16 одинаковых прямоугольных равнобедренных треугольников. Какой треугольник — образ треугольника ' + nS + ' при параллельном переносе, который переводит ' + nA + ' в ' + nB + '?'), fig,
        ans: MQ(r, names.map(n => L('Le triangle ' + n, 'Треугольник ' + n)), 0),
        sol: ['Перенос сдвигает каждую точку фигуры одинаково: так же, как ' + nA + ' сдвигается в ' + nB + '. Здесь это сдвиг на сторону маленького квадрата ' + step + (v[0] && v[1] ? ' (по диагонали маленького квадрата)' : '') + '.',
          'Сдвигаем каждую вершину треугольника ' + nS + ': ' + src.map((p, k) => F.nameAt[geoKey(p)] + ' → ' + F.nameAt[geoKey(img[k])]).join(', ') + '. Получаем треугольник ' + F.nameOf(img) + '.',
          'Образ при переносе «смотрит» в ту же сторону, что и исходный треугольник. Треугольники того же квадрата, но повёрнутые иначе, получаются не переносом, а поворотом или симметрией.'] };
    }
    if (vi === 3) {   /* rosace: angle of a rotation */
      const n = r.pick([5, 6, 8]), k = r.ri(2, n), S = geoScene(), R0 = 100, C = geoV(0, 0), ph = r.ri(0, 11) * 30;
      const blade = [geoV(0.22, 0), geoV(1, 0), geoV(1, 0.34)];
      const P = q => geoV(q.x * R0, -q.y * R0);
      for (let m = 0; m < n; m++) {
        const th = ph + 360 * m / n, poly = blade.map(b => P(geoRot(b, th)));
        S.poly(poly, m === 0 || m === k - 1 ? 'ffill' : 'fl2'); S.poly(poly, 'fl');
        S.text(P(geoPol(1.22, th + 10)), String(m + 1));
      }
      S.dot(C); geoPtLab(S, C, geoPol(1, -(ph + 180 / n) + 180), 'O', { gap: 5 });
      const ang = 360 * (k - 1) / n;
      return { q: L('La figure ci-dessous est formée de ' + n + ' motifs identiques numérotés de 1 à ' + n + ', disposés autour du point O. Quel est l’angle de la rotation de centre O, dans le sens inverse des aiguilles d’une montre, qui transforme le motif 1 en le motif ' + k + ' ?',
        'Фигура ниже составлена из ' + n + ' одинаковых фигурок, пронумерованных от 1 до ' + n + ' вокруг точки O. На какой угол нужно повернуть фигурку 1 вокруг O против часовой стрелки, чтобы получить фигурку ' + k + '?'), fig: S.svg('rosace'), ans: N(ang, { unit: '°' }),
        sol: ['Фигурки одинаковые и стоят равномерно, поэтому полный оборот 360° делится на ' + n + ' равных частей:', { t: 'угол между соседними фигурками', tex: '360^\\circ\\div ' + n + '=' + geoDg(360 / n) },
          { t: 'От фигурки 1 до фигурки ' + k + ' — ' + (k - 1) + ' ' + (k - 1 === 1 ? 'шаг' : k - 1 < 5 ? 'шага' : 'шагов') + ' против часовой стрелки:', tex: (k - 1) + '\\times ' + geoDg(360 / n) + '=' + geoDg(ang) }] };
    }
    if (vi === 4) {   /* which transformation */
      const kind = r.pick(['tr', 'ax', 'ce', 'ro']);
      const base = [[0, 0], [3, 0], [3, 1], [1, 1], [1, 2], [0, 2]], cellsB = [[0.5, 0.5], [1.5, 0.5], [2.5, 0.5], [0.5, 1.5]];
      let A, B, cA, cB, ok = false, g = 0, desc;
      while (!ok && g++ < 400) {
        const o = r.ri(0, 7), sw = (p) => { let [x, y] = p; for (let t = 0; t < o % 4; t++) [x, y] = [-y, x]; if (o >= 4) x = -x; return [x, y]; };
        let fa = base.map(sw), ca = cellsB.map(sw);
        const mx = Math.min(...fa.map(p => p[0])), my = Math.min(...fa.map(p => p[1])), dx = r.ri(1, 4) - mx, dy = r.ri(1, 4) - my;
        fa = fa.map(p => [p[0] + dx, p[1] + dy]); ca = ca.map(p => [p[0] + dx, p[1] + dy]);
        let T;
        if (kind === 'tr') { const t = [r.ri(3, 7), r.ri(-3, 3)]; T = p => [p[0] + t[0], p[1] + t[1]]; desc = t; }
        else if (kind === 'ax') { if (r() < 0.6) { const a = r.ri(8, 14) / 2; T = p => [2 * a - p[0], p[1]]; desc = 'v'; } else { const b = r.ri(6, 10) / 2; T = p => [p[0], 2 * b - p[1]]; desc = 'h'; } }
        else if (kind === 'ce') { const c = [r.ri(8, 14) / 2, r.ri(6, 10) / 2]; T = p => [2 * c[0] - p[0], 2 * c[1] - p[1]]; }
        else { const c = [r.ri(4, 8), r.ri(2, 5)], sg = r.sgn(); T = p => [c[0] - sg * (p[1] - c[1]), c[1] + sg * (p[0] - c[0])]; desc = sg; }
        const fb = fa.map(T), cb = ca.map(T);
        const inG = f => f.every(p => p[0] >= 0 && p[0] <= 12 && p[1] >= 0 && p[1] <= 8);
        const sep = !cb.some(p => ca.some(q => Math.abs(p[0] - q[0]) < 1.5 && Math.abs(p[1] - q[1]) < 1.5));
        if (inG(fa) && inG(fb) && sep) { A = fa; B = fb; cA = ca; cB = cb; ok = true; }
      }
      const G = geoGrid(12, 8, 26), toS = p => G.P(p[0], p[1]);
      [A, B].forEach(f => { G.S.poly(f.map(toS), 'ffill'); G.S.poly(f.map(toS), 'fl'); });
      G.S.text(toS(cA[0]), '1'); G.S.text(toS(cB[0]), '2');
      const opts = [L('Une translation', 'Параллельный перенос'), L('Une symétrie axiale', 'Осевая симметрия'), L('Une symétrie centrale', 'Центральная симметрия'), L('Une rotation d’angle 90°', 'Поворот на 90°')];
      const c = ['tr', 'ax', 'ce', 'ro'].indexOf(kind);
      const why = { tr: 'Фигура 2 — та же фигура, только сдвинутая: она не повернулась и не перевернулась (сравни, куда смотрят «ножки» буквы L). Это параллельный перенос («translation») на ' + (desc ? geoStep(desc[0], desc[1]) : '') + '.',
        ax: 'Фигура 2 — зеркальное отражение фигуры 1: она перевёрнута, как в зеркале, относительно ' + (desc === 'v' ? 'вертикальной' : 'горизонтальной') + ' прямой посередине между фигурами. Это осевая симметрия («symétrie axiale»). Никаким поворотом её не получить: поворот не переворачивает фигуру.',
        ce: 'Фигура 2 повёрнута на пол-оборота (180°) относительно фигуры 1: то, что было слева, стало справа, а то, что было внизу, — вверху. Это центральная симметрия («symétrie centrale»); её центр — середина отрезка между любой точкой и её образом.',
        ro: 'Фигура 2 повёрнута на четверть оборота (90°) ' + (desc > 0 ? 'против часовой стрелки' : 'по часовой стрелке') + ': горизонтальная «ножка» стала вертикальной. Это поворот («rotation»). При центральной симметрии фигура повернулась бы на 180°, а при осевой — перевернулась бы.' }[kind];
      return { q: L('Quelle transformation permet de passer de la figure 1 à la figure 2 ?', 'Какое преобразование переводит фигуру 1 в фигуру 2?'), fig: G.S.svg('deux figures sur un quadrillage'), ans: MQ(r, opts, c),
        sol: ['Сравниваем, как расположена фигура: сдвинута ли она, перевёрнута или повёрнута.', why] };
    }
    /* points on a grid: translation (vi 0) or rotation by 90° (vi 2) */
    const G = geoGrid(12, 8, 26);
    if (vi === 0) {
      let res = null, K, A, B, v;
      while (!res) {
        A = [r.ri(1, 11), r.ri(1, 7)]; v = [r.nz(-4, 4), r.ri(-3, 3)]; B = [A[0] + v[0], A[1] + v[1]]; K = [r.ri(1, 11), r.ri(1, 7)];
        if (B[0] < 1 || B[0] > 11 || B[1] < 1 || B[1] > 7 || Math.abs(v[0]) + Math.abs(v[1]) < 3 || geoKey(K) === geoKey(A) || geoKey(K) === geoKey(B)) continue;
        const g = [K[0] + v[0], K[1] + v[1]];
        res = geoPickPts(r, g, r.sh([[K[0] - v[0], K[1] - v[1]], [K[0] + v[1], K[1] + v[0]], [g[0] + r.sgn(), g[1]], [g[0], g[1] + r.sgn()], [K[0] + v[0], K[1] - v[1]]]), G, [K, A, B]);
      }
      const letters = r.sh(GEO_LETTERS.filter(x => x !== 'A' && x !== 'B'));
      const nA = 'A', nB = 'B', nK = letters[4], names = letters.slice(0, 4);
      geoGridPts(G, [[A[0], A[1], nA], [B[0], B[1], nB], [K[0], K[1], nK]].concat(r.sh(res.map((p, i) => [p[0], p[1], names[i]]))));
      return { q: L('Dans le quadrillage ci-dessous, quelle est l’image du point ' + nK + ' par la translation qui transforme A en B ?', 'На клетчатой сетке ниже: в какую точку переходит ' + nK + ' при параллельном переносе, который переводит A в B?'), fig: G.S.svg('quadrillage'),
        ans: MQ(r, names.map(l => L('Le point ' + l, 'Точка ' + l)), 0),
        sol: ['Перенос сдвигает все точки одинаково — так же, как A сдвигается в B. Считаем клетки от A до B: ' + geoStep(v[0], v[1]) + '.', 'Делаем тот же сдвиг от точки ' + nK + ' — в ту же сторону: получаем точку ' + names[0] + '.',
          'Если сдвинуть в обратную сторону (от B к A), получится образ при другом переносе — это частая ошибка.'] };
    }
    const dir = r.pick(['sens+', 'sens-']);
    let res = null, O, K, d;
    while (!res) {
      O = [r.ri(4, 8), r.ri(3, 5)]; d = [r.ri(-3, 3), r.ri(-3, 3)]; if (Math.abs(d[0]) + Math.abs(d[1]) < 2 || d[0] === 0 && d[1] === 0) continue;
      K = [O[0] + d[0], O[1] + d[1]]; if (K[0] < 1 || K[0] > 11 || K[1] < 1 || K[1] > 7) continue;
      const ccw = [O[0] - d[1], O[1] + d[0]], cw = [O[0] + d[1], O[1] - d[0]], half = [O[0] - d[0], O[1] - d[1]], mir = [O[0] - d[0], O[1] + d[1]];
      res = geoPickPts(r, dir === 'sens+' ? ccw : cw, [dir === 'sens+' ? cw : ccw, half, mir, [O[0] + d[0], O[1] - d[1]]], G, [K, O]);
    }
    const Q = geoImgQ(r, G, K, res, [[O[0], O[1], 'O']]);
    const nd = dir === 'sens+' ? [-d[1], d[0]] : [d[1], -d[0]];
    return { q: L('Dans le quadrillage ci-dessous, quelle est l’image du point ' + Q.nK + ' par la rotation de centre O, d’angle 90°, ' + GEO_DIR_FR[dir] + ' ?', 'На клетчатой сетке ниже: в какую точку переходит ' + Q.nK + ' при повороте вокруг O на 90° ' + GEO_DIR_RU[dir] + '?'), fig: G.S.svg('quadrillage'), ans: MQ(r, Q.opts, 0),
      sol: ['При повороте точка остаётся на том же расстоянии от центра O, а отрезок O' + Q.nK + ' поворачивается на 90° — на четверть оборота.',
        'От O до ' + Q.nK + ': ' + geoStep(d[0], d[1]) + '. При повороте на четверть оборота ' + GEO_DIR_RU[dir] + ' этот путь поворачивается вместе с отрезком и становится таким: ' + geoStep(nd[0], nd[1]) + '. От O это точка ' + Q.names[0] + '.',
        'Точка «напротив» через O — это поворот на 180° (центральная симметрия), а поворот в другую сторону даёт другую точку — поэтому направление важно.'] };
  } });

/* ===================== HOMOTHÉTIE ===================== */
const geoKt = k => Number.isInteger(k) ? String(k) : (k < 0 ? '-(1/' + Math.round(1 / Math.abs(k)) + ')' : '1/' + Math.round(1 / k));   /* 2, -2, 1/2, -(1/2) in input syntax */
topic({ id: 'ge.homothetie', ch: 'ge', lvl: 3, calc: false, variants: 4,
  ru: 'Гомотетия: коэффициент, длины и площади', fr: 'Homothétie : rapport, longueurs et aires',
  hints: [
    'Гомотетия («homothétie») с центром O и коэффициентом k: точка M переходит в M′ на прямой (OM), причём OM′ = |k| × OM. Если k > 0 — образ по ту же сторону от O, если k < 0 — по другую сторону.',
    'Все длины умножаются на |k|: при |k| > 1 фигура увеличивается, при |k| < 1 — уменьшается, при k = −1 это центральная симметрия. Углы и форма не меняются.',
    'Площади умножаются на k², объёмы — на |k|³: фигура растягивается сразу в двух (или трёх) направлениях.'],
  gen(r, vi) {
    if (vi === 0) {   /* the ratio, read on a grid */
      const k = r.pick([2, -2, 3, -3, 0.5, -0.5, 2, -2]), small = Math.abs(k) < 1, G = geoGrid(14, 9, 23);
      let O, src, img, ok = false, g = 0;
      while (!ok && g++ < 300) {
        O = [r.ri(1, 13), r.ri(1, 8)];
        const m = small ? 2 : 1, sx = r.sgn(), sy = r.sgn();
        const off = [[sx * m * r.ri(1, 2), sy * m * r.ri(0, 1)], [sx * m * r.ri(1, 3), sy * m * r.ri(1, 2)], [sx * m * r.ri(0, 1), sy * m * r.ri(1, 2)]];
        if (new Set(off.map(geoKey)).size < 3 || Math.abs((off[1][0] - off[0][0]) * (off[2][1] - off[0][1]) - (off[1][1] - off[0][1]) * (off[2][0] - off[0][0])) < 1) continue;
        src = off.map(d => [O[0] + d[0], O[1] + d[1]]); img = off.map(d => [O[0] + k * d[0], O[1] + k * d[1]]);
        ok = src.concat(img).every(p => p[0] >= 0.5 && p[0] <= 13.5 && p[1] >= 0.5 && p[1] <= 8.5);
      }
      const toS = p => G.P(p[0], p[1]);
      G.S.poly(src.map(toS), 'ffill'); G.S.poly(src.map(toS), 'fl'); G.S.poly(img.map(toS), 'ffill'); G.S.poly(img.map(toS), 'fl');
      src.concat(img).forEach(p => G.S.seg(toS(O), toS(p), 'fl2'));
      G.S.dot(toS(O)); geoPtLab(G.S, toS(O), geoV(-1, 1), 'O', { gap: 3 });
      const nm = ['A', 'B', 'C'], cen = geoCen(src.map(toS)), ceni = geoCen(img.map(toS));
      src.forEach((p, i) => geoPtLab(G.S, toS(p), geoSub(toS(p), cen), nm[i], { gap: 3 }));
      img.forEach((p, i) => geoPtLab(G.S, toS(p), geoSub(toS(p), ceni), nm[i] + '′', { gap: 3 }));
      const opts = [k, -k, 1 / k, -1 / k].map(v => L('$' + geoKt(v) + '$', '$' + geoKt(v) + '$'));
      const d0 = [src[0][0] - O[0], src[0][1] - O[1]], d1 = [img[0][0] - O[0], img[0][1] - O[1]];
      return { q: L('Le triangle A′B′C′ est l’image du triangle ABC par une homothétie de centre O. Quel est le rapport de cette homothétie ?', 'Треугольник A′B′C′ — образ треугольника ABC при гомотетии с центром O. Чему равен коэффициент этой гомотетии?'), fig: G.S.svg('homothétie sur un quadrillage'), ans: MQ(r, opts, 0),
        sol: ['Сравниваем путь от O до A и от O до A′ по клеткам: до A — ' + geoStep(d0[0], d0[1]) + ', до A′ — ' + geoStep(d1[0], d1[1]) + '.',
          'A′ ' + (Math.abs(k) > 1 ? 'в ' + Math.abs(k) + ' раза дальше' : 'в ' + Math.round(1 / Math.abs(k)) + ' раза ближе') + ' от O, чем A, значит, |k| = ' + nf(Math.abs(k)) + '. ' + (k > 0 ? 'Образ лежит по ту же сторону от O, что и A, поэтому k > 0.' : 'Образ лежит по другую сторону от O, поэтому k < 0.'),
          'Итак, k = ' + nf(k) + '. Проверка на других вершинах: B′ и C′ устроены так же.'] };
    }
    if (vi === 1) {   /* lengths */
      const k = r.pick([2, 3, 4, -2, -3, 0.5, 1.5, 2.5, -0.5, 0.25]), back = r() < 0.35;
      let L0 = r.ri(2, 12); if (Math.abs(k) === 0.25) L0 = 4 * r.ri(1, 5); if (Math.abs(k) === 0.5 || Math.abs(k) === 1.5 || k === 2.5) L0 = 2 * r.ri(1, 7);
      const L1 = +(L0 * Math.abs(k)).toFixed(4);
      if (!back) return { q: L('Un segment mesure ' + nf(L0) + ' cm. Quelle est la longueur de son image par une homothétie de rapport ' + nf(k) + ' ?', 'Отрезок имеет длину ' + nf(L0) + ' см. Какова длина его образа при гомотетии с коэффициентом ' + nf(k) + '?'), ans: N(fx(L1), { unit: 'cm' }),
        sol: ['При гомотетии все длины умножаются на |k| — на модуль коэффициента. Знак k показывает только, по какую сторону от центра окажется образ, а длина не может быть отрицательной.', { t: '', tex: geoT(L0) + '\\times ' + geoT(Math.abs(k)) + '=' + geoT(L1) + '\\text{ cm}' }] };
      return { q: L('Par une homothétie de rapport ' + nf(k) + ', l’image d’un segment mesure ' + nf(L1) + ' cm. Quelle est la longueur du segment de départ ?', 'При гомотетии с коэффициентом ' + nf(k) + ' образ отрезка имеет длину ' + nf(L1) + ' см. Какова длина исходного отрезка?'), ans: N(fx(L0), { unit: 'cm' }),
        sol: ['Длина образа = |k| × длина исходного отрезка. Значит, исходная длина — образ, делённый на |k|.', { t: '', tex: geoT(L1) + '\\div ' + geoT(Math.abs(k)) + '=' + geoT(L0) + '\\text{ cm}' }] };
    }
    if (vi === 2) {   /* areas and volumes */
      const vol = r() < 0.35, k = r.pick(vol ? [2, 3, -2, 0.5] : [2, 3, 4, -2, -3, 0.5, 1.5]);
      const fig = vol ? r.pick([['un cube', 'куба'], ['une pyramide', 'пирамиды'], ['un cône', 'конуса'], ['une boule', 'шара']]) : r.pick([['un triangle', 'треугольника'], ['un rectangle', 'прямоугольника'], ['un disque', 'круга'], ['un losange', 'ромба']]);
      let A0 = r.ri(2, 12); if (Math.abs(k) === 0.5) A0 = (vol ? 8 : 4) * r.ri(1, 5); if (k === 1.5) A0 = 4 * r.ri(1, 4);
      const f = vol ? Math.pow(Math.abs(k), 3) : k * k, A1 = +(A0 * f).toFixed(4), u = vol ? 'cm³' : 'cm²', ur = vol ? 'см³' : 'см²';
      return { q: L((vol ? 'Le volume d’' : 'L’aire d’') + fig[0] + ' est ' + nf(A0) + ' ' + u + '. On applique une homothétie de rapport ' + nf(k) + '. Quel est ' + (vol ? 'le volume' : 'l’aire') + ' de la figure obtenue ?', (vol ? 'Объём ' + fig[1] + ' равен ' : 'Площадь ' + fig[1] + ' равна ') + nf(A0) + ' ' + ur + '. К фигуре применяют гомотетию с коэффициентом ' + nf(k) + '. ' + (vol ? 'Чему равен объём' : 'Чему равна площадь') + ' полученной фигуры?'),
        ans: N(fx(A1), { unit: u }),
        sol: [vol ? 'Объём растягивается сразу в трёх направлениях (длина, ширина, высота), и в каждом — в |k| раз. Поэтому объём умножается на |k|³.' : 'Площадь растягивается сразу в двух направлениях, и в каждом — в |k| раз. Поэтому площадь умножается на k² (знак k на площадь не влияет).',
          { t: '', tex: geoT(A0) + '\\times ' + (vol ? geoT(Math.abs(k)) + '^3' : (k < 0 ? '(' + geoT(k) + ')' : geoT(k)) + '^2') + '=' + geoT(A0) + '\\times ' + geoT(f) + '=' + geoT(A1) + '\\text{ ' + (vol ? 'cm}^3' : 'cm}^2') },
          'Частая ошибка — умножить ' + (vol ? 'объём' : 'площадь') + ' просто на k: получилось бы ' + nf(+(A0 * Math.abs(k)).toFixed(4)) + ', а это неверно.'] };
    }
    /* what does it do to the lengths */
    const k = r.pick([-2, 3, 1.5, -0.5, 0.4, 0.25, -1, -3, 2.5, -0.75]);
    const opts = [L('Elle agrandit les longueurs.', 'Увеличивает длины.'), L('Elle réduit les longueurs.', 'Уменьшает длины.'), L('Elle conserve les longueurs.', 'Сохраняет длины.'), L('Elle change les mesures des angles.', 'Меняет величины углов.')];
    const c = Math.abs(k) > 1 ? 0 : Math.abs(k) < 1 ? 1 : 2;
    return { q: L('Que fait une homothétie de rapport ' + nf(k) + ' ?', 'Что делает гомотетия с коэффициентом ' + nf(k) + '?'), ans: MQF(opts, c),
      sol: ['Длины умножаются на |k| = ' + nf(Math.abs(k)) + '. ' + (c === 0 ? 'Это больше 1 — длины увеличиваются.' : c === 1 ? 'Это меньше 1 — длины уменьшаются.' : 'Это ровно 1 — длины сохраняются: гомотетия с коэффициентом −1 — это центральная симметрия.'),
        (k < 0 ? 'Знак минус не уменьшает фигуру: он только «переворачивает» её на другую сторону от центра. ' : '') + 'Углы гомотетия никогда не меняет — фигура остаётся подобной себе.'] };
  } });

/* ===================== REPÉRAGE ===================== */
/* axes: x from x0 to x1, y from y0 to y1 (in cells), one cell = step units; returns { S, P: (x, y) in units → screen } */
function geoAxes(x0, x1, y0, y1, c, step) {
  const S = geoScene();
  for (let i = x0; i <= x1; i++) S.seg(geoV(i * c, -y1 * c), geoV(i * c, -y0 * c), 'fgrid');
  for (let j = y0; j <= y1; j++) S.seg(geoV(x0 * c, -j * c), geoV(x1 * c, -j * c), 'fgrid');
  S.seg(geoV(x0 * c - 4, 0), geoV(x1 * c + 10, 0), 'fax'); S.seg(geoV(0, -y0 * c + 4), geoV(0, -y1 * c - 10), 'fax');
  S.poly([geoV(x1 * c + 4, -4), geoV(x1 * c + 10, 0), geoV(x1 * c + 4, 4)], 'fax', true); S.poly([geoV(-4, -y1 * c - 4), geoV(0, -y1 * c - 10), geoV(4, -y1 * c - 4)], 'fax', true);
  for (let i = x0; i <= x1; i++) if (i) { S.seg(geoV(i * c, -3), geoV(i * c, 3), 'fax'); if (step === 1 || i % 2 === 0) S.text(geoV(i * c, 13), nf(i * step), { cls: 'ftm', fs: 12 }); }
  for (let j = y0; j <= y1; j++) if (j) { S.seg(geoV(-3, -j * c), geoV(3, -j * c), 'fax'); if (step === 1 || j % 2 === 0) S.text(geoV(-6, -j * c), nf(j * step), { cls: 'ftm', fs: 12, anchor: 'end' }); }
  S.text(geoV(-8, 11), '0', { cls: 'ftm', fs: 12 });
  return { S, P: (x, y) => geoV(x / step * c, -y / step * c) };
}
topic({ id: 'ge.reperage', ch: 'ge', lvl: 1, calc: false, variants: 3,
  ru: 'Координаты точки на плоскости', fr: 'Se repérer dans le plan',
  hints: [
    'Координаты точки пишут в скобках через точку с запятой: сначала абсцисса («abscisse», по горизонтальной оси), потом ордината («ordonnée», по вертикальной): A(3 ; −2).',
    'Чтобы прочитать координату, мысленно опусти из точки перпендикуляр на ось. Сначала посмотри на шаг делений: одна клетка может означать 1, 2 или 0,5.',
    'Знак: правее нуля абсцисса положительная, левее — отрицательная; выше нуля ордината положительная, ниже — отрицательная.'],
  gen(r, vi) {
    const step = vi === 2 ? r.pick([2, 0.5, 5]) : 1, A = geoAxes(-5, 5, -4, 4, 26, step);
    const pick = () => [r.nz(-4, 4) * step, r.nz(-3, 3) * step];
    if (vi === 1) {
      let a, cands;
      do { a = pick(); cands = [a, [a[1], a[0]], [-a[0], a[1]], [a[0], -a[1]]]; } while (Math.abs(a[0]) === Math.abs(a[1]) || cands.some(p => Math.abs(p[0]) > 4 * step || Math.abs(p[1]) > 3 * step));
      const letters = r.sh(GEO_LETTERS.filter(x => x !== 'O')).slice(0, 4);
      cands.forEach((p, i) => { const q = A.P(p[0], p[1]); A.S.dot(q, 3); A.S.boxes.push([q.x - 3, q.y - 3, q.x + 3, q.y + 3]); });
      cands.forEach((p, i) => geoPtLab(A.S, A.P(p[0], p[1]), geoV(1, -1), letters[i], { gap: 3 }));
      const co = p => '(' + nf(p[0]) + ' ; ' + nf(p[1]) + ')';
      return { q: L('Dans le repère ci-dessous, quel point a pour coordonnées ' + co(a) + ' ?', 'В системе координат ниже: у какой точки координаты ' + co(a) + '?'), fig: A.S.svg('repère'), ans: MQ(r, letters.map(l => L('Le point ' + l, 'Точка ' + l)), 0),
        sol: ['Первое число — абсцисса: ' + nf(a[0]) + ', то есть ' + (a[0] > 0 ? 'вправо' : 'влево') + ' от нуля по горизонтальной оси. Второе — ордината: ' + nf(a[1]) + ', то есть ' + (a[1] > 0 ? 'вверх' : 'вниз') + '.', 'Это точка ' + letters[0] + '. Точка ' + letters[1] + ' — с переставленными координатами ' + co(cands[1]) + ': порядок чисел важен.'] };
    }
    let a; do a = pick(); while (vi === 2 && Math.abs(a[0]) === Math.abs(a[1]));
    const q0 = A.P(a[0], a[1]), nm = r.pick(['A', 'B', 'M', 'P', 'K', 'E']);
    A.S.seg(q0, A.P(a[0], 0), 'fdash'); A.S.seg(q0, A.P(0, a[1]), 'fdash');
    A.S.dot(q0, 3.5); geoPtLab(A.S, q0, geoV(a[0] > 0 ? 1 : -1, a[1] > 0 ? -1 : 1), nm, { gap: 3 });
    return { q: L('Dans le repère ci-dessous, quelles sont les coordonnées du point ' + nm + ' ?', 'В системе координат ниже: каковы координаты точки ' + nm + '?'), fig: A.S.svg('repère'),
      ans: multi([L('abscisse de ' + nm + ' :', 'абсцисса ' + nm + ':'), N(fx(a[0]))], [L('ordonnée de ' + nm + ' :', 'ордината ' + nm + ':'), N(fx(a[1]))]),
      sol: [step !== 1 ? 'Сначала шаг делений: одна клетка — это ' + nf(step) + (step < 1 ? ' (две клетки — единица)' : '') + '. Числа у осей это подтверждают.' : 'Одна клетка — одна единица.',
        'Пунктир от ' + nm + ' вниз (или вверх) до горизонтальной оси показывает абсциссу: ' + nf(a[0]) + '. Пунктир до вертикальной оси показывает ординату: ' + nf(a[1]) + '.',
        'Ответ: ' + nm + '(' + nf(a[0]) + ' ; ' + nf(a[1]) + '). Сначала абсцисса, потом ордината.'] };
  } });

/* ===================== SOLIDS: cavalier perspective and round solids ===================== */
/* x to the right, y into the page (drawn at 40°, × 0.5), z up → maths 2D */
const geoCav = p => geoV(p[0] + 0.5 * p[1] * Math.cos(geoRad(40)), p[2] + 0.5 * p[1] * Math.sin(geoRad(40)));
/* pavé ABCDEFGH (ABCD bottom, E above A …): o = { names, lab: { AB: '6 cm' }, sec: [[p3, visible], …] closed polygon, pts: [[p3, name]], W, H, noNames } */
function geoPave(Lx, Ly, Lz, o) {
  o = o || {};
  const nm = (o.names || 'ABCDEFGH').split(''), V3 = [[0, 0, 0], [Lx, 0, 0], [Lx, Ly, 0], [0, Ly, 0], [0, 0, Lz], [Lx, 0, Lz], [Lx, Ly, Lz], [0, Ly, Lz]];
  const extra = (o.sec || []).map(s => s[0]).concat((o.pts || []).map(p => p[0]));
  const f = geoFit(V3.concat(extra).map(geoCav), o.W || 200, o.H || 150), P = p => f(geoCav(p)), Q = V3.map(P), S = geoScene();
  if (o.sec) { const ps = o.sec.map(s => P(s[0])); S.poly(ps, 'ffill'); o.sec.forEach((s, i) => S.seg(ps[i], ps[(i + 1) % ps.length], s[1] ? 'fhl' : 'fdash')); }
  const vis = [[0, 1], [1, 5], [5, 4], [4, 0], [1, 2], [2, 6], [6, 5], [4, 7], [7, 6]], hid = [[0, 3], [3, 2], [3, 7]];
  hid.forEach(([a, b]) => S.seg(Q[a], Q[b], 'fdash')); vis.forEach(([a, b]) => S.seg(Q[a], Q[b], 'fl'));
  const C = geoCen(Q);
  if (!o.noNames) Q.forEach((q, i) => geoPtLab(S, q, geoSub(q, C), nm[i], { gap: 4 }));
  (o.pts || []).forEach(([p, n]) => { const q = P(p); S.dot(q, 2.5); geoPtLab(S, q, geoSub(q, C), n, { gap: 4 }); });
  Object.keys(o.lab || {}).forEach(k => { const a = Q[nm.indexOf(k[0])], b = Q[nm.indexOf(k[1])]; geoSegLab(S, a, b, o.lab[k], C); });
  return S.svg(o.label || 'pavé droit');
}
/* half ellipse path (front: lower half, back: upper half) */
const geoHalf = (c, rx, ry, front) => 'M' + geoC(c.x - rx) + ' ' + geoC(c.y) + 'A' + geoC(rx) + ' ' + geoC(ry) + ' 0 0 ' + (front ? 0 : 1) + ' ' + geoC(c.x + rx) + ' ' + geoC(c.y);
function geoEll(S, c, rx, ry, cls, back) {
  S.path(geoHalf(c, rx, ry, true), cls, [geoV(c.x - rx, c.y), geoV(c.x + rx, c.y + ry)]);
  S.path(geoHalf(c, rx, ry, false), back || cls, [geoV(c.x - rx, c.y - ry), geoV(c.x + rx, c.y)]);
  const ps = []; for (let i = 0; i <= 24; i++) ps.push(geoV(c.x + rx * Math.cos(i * Math.PI / 12), c.y + ry * Math.sin(i * Math.PI / 12))); S.line(ps);
}
/* cylinder: radius R, height H (units), k px per unit; o.sec: 'perp' (height t, 0…1) or 'par' (distance d from the axis) */
function geoCyl(R, H, o) {
  o = o || {}; const k = o.k || Math.min(70 / R, 150 / H), S = geoScene(), rx = R * k, ry = rx * 0.32, B = geoV(0, 0), T = geoV(0, -H * k);
  if (o.sec === 'perp') { const c = geoV(0, -H * k * o.t); S.ellipse(c, rx, ry, 'ffill'); geoEll(S, c, rx, ry, 'fhl', 'fdash'); }
  if (o.sec === 'par') { const w = Math.sqrt(R * R - o.d * o.d) * k, dy = 0.32 * o.d * k; const ps = [geoV(-w, -dy), geoV(w, -dy), geoV(w, -H * k - dy), geoV(-w, -H * k - dy)]; S.poly(ps, 'ffill'); S.poly(ps, 'fhl'); }
  geoEll(S, B, rx, ry, 'fl', 'fdash'); S.ellipse(T, rx, ry, 'fl');
  S.seg(geoV(-rx, 0), geoV(-rx, -H * k)); S.seg(geoV(rx, 0), geoV(rx, -H * k));
  if (o.rlab) { S.dot(T, 2); S.seg(T, geoV(rx, T.y), 'fl2'); S.text(geoV(rx / 2, T.y - 10), o.rlab, { fs: 13 }); }
  if (o.hlab) geoSegLab(S, geoV(rx, 0), geoV(rx, -H * k), o.hlab, B, { gap: 6 });
  return S.svg(o.label || 'cylindre');
}
function geoCone(R, H, o) {
  o = o || {}; const k = o.k || Math.min(70 / R, 150 / H), S = geoScene(), rx = R * k, ry = rx * 0.32, B = geoV(0, 0), A = geoV(0, -H * k);
  if (o.sec) { const t = o.sec, c = geoV(0, -H * k * t), rr = rx * (1 - t); S.ellipse(c, rr, rr * 0.32, 'ffill'); geoEll(S, c, rr, rr * 0.32, 'fhl', 'fdash'); }
  geoEll(S, B, rx, ry, 'fl', 'fdash'); S.seg(A, geoV(-rx, 0)); S.seg(A, geoV(rx, 0));
  if (o.axis) { S.seg(A, B, 'fdash'); S.dot(B, 2); }
  return S.svg(o.label || 'cône');
}
function geoSphereFig(R, o) {
  o = o || {}; const k = 85 / R, S = geoScene(), C = geoV(0, 0), rr = R * k;
  S.circle(C, rr, 'fl'); geoEll(S, C, rr, rr * 0.3, 'fl2', 'fdash');
  if (o.d != null) {
    const yy = -o.d * k, w = Math.sqrt(R * R - o.d * o.d) * k, c2 = geoV(0, yy);
    S.ellipse(c2, w, w * 0.3, 'ffill'); geoEll(S, c2, w, w * 0.3, 'fhl', 'fdash');
    if (o.tri) { const M = geoV(w, yy); S.seg(C, c2, 'fl'); S.seg(c2, M, 'fl'); S.seg(C, M, 'fl'); geoRightMark(S, c2, C, M, 7); S.dot(C, 2.5); S.dot(c2, 2.5); S.dot(M, 2.5);
      geoPtLab(S, C, geoV(-1, 0.4), 'O', { gap: 4 }); geoPtLab(S, c2, geoV(-1, -0.6), 'H', { gap: 4 }); geoPtLab(S, M, geoV(1, -0.3), 'M', { gap: 4 });
      if (o.lab) { geoSegLab(S, C, M, o.lab.OM, c2, { canFlip: true }); geoSegLab(S, C, c2, o.lab.OH, M, { canFlip: true }); geoSegLab(S, c2, M, o.lab.HM, C, { canFlip: true }); } }
  }
  return S.svg(o.label || 'sphère');
}
/* square-based pyramid SABCD in cavalier perspective; o.sec = t (plane parallel to the base at height t·h) */
function geoPyr(a, h, o) {
  o = o || {}; const V3 = [[0, 0, 0], [a, 0, 0], [a, a, 0], [0, a, 0], [a / 2, a / 2, h]], f = geoFit(V3.map(geoCav), 170, 160), Q = V3.map(p => f(geoCav(p))), S = geoScene();
  if (o.sec != null) { const t = o.sec, ps = [0, 1, 2, 3].map(i => f(geoCav(V3[i].map((v, j) => v + (V3[4][j] - v) * t)))); S.poly(ps, 'ffill'); [[0, 1, 1], [1, 2, 1], [2, 3, 0], [3, 0, 0]].forEach(([i, j, v]) => S.seg(ps[i], ps[j], v ? 'fhl' : 'fdash')); }
  [[0, 3], [3, 2], [3, 4]].forEach(([i, j]) => S.seg(Q[i], Q[j], 'fdash')); [[0, 1], [1, 2], [0, 4], [1, 4], [2, 4]].forEach(([i, j]) => S.seg(Q[i], Q[j]));
  if (o.names) { const C = geoCen(Q); Q.forEach((q, i) => geoPtLab(S, q, geoSub(q, C), o.names[i], { gap: 4 })); }
  return S.svg(o.label || 'pyramide');
}
/* right prism with a triangular base (standing on the base) */
function geoPrism(o) {
  o = o || {}; const b = [[0, 0, 0], [3, 0, 0], [1.2, 2.6, 0]], V3 = b.concat(b.map(p => [p[0], p[1], 2.4])), f = geoFit(V3.map(geoCav), 150, 150), Q = V3.map(p => f(geoCav(p))), S = geoScene();
  [[0, 2], [2, 1], [2, 5]].forEach(([i, j]) => S.seg(Q[i], Q[j], 'fdash')); [[0, 1], [3, 4], [4, 5], [5, 3], [0, 3], [1, 4]].forEach(([i, j]) => S.seg(Q[i], Q[j]));
  return S.svg(o.label || 'prisme droit');
}
/* globe seen from the equator plane: parallels and meridians every 30°; pts: [[lat, long, name]] (north and east positive) */
function geoGlobe(pts) {
  const S = geoScene(), R = 105, C = geoV(0, 0), P = (la, lo) => geoV(R * Math.cos(geoRad(la)) * Math.sin(geoRad(lo)), -R * Math.sin(geoRad(la)));
  S.circle(C, R, 'fl');
  [-60, -30, 30, 60].forEach(la => S.seg(P(la, -90), P(la, 90), 'fl2'));
  [-60, -30, 30, 60].forEach(lo => { const rx = R * Math.abs(Math.sin(geoRad(lo))); S.path('M0 ' + (-R) + 'A' + geoC(rx) + ' ' + R + ' 0 0 ' + (lo > 0 ? 1 : 0) + ' 0 ' + R, 'fl2', [geoV(lo > 0 ? rx : -rx, 0)]); const ps = []; for (let i = -90; i <= 90; i += 15) ps.push(P(i, lo)); S.line(ps); });
  S.seg(P(0, -90), P(0, 90), 'fl'); S.seg(geoV(0, -R), geoV(0, R), 'fl');
  S.text(geoV(0, -R - 12), 'N'); S.text(geoV(0, R + 12), 'S'); S.text(geoV(-R - 12, 0), 'O'); S.text(geoV(R + 12, 0), 'E');
  S.text(geoV(R + 6, 17), 'équateur', { cls: 'ftm', fs: 12, anchor: 'start' }); S.text(geoV(0, R + 29), 'méridien de Greenwich', { cls: 'ftm', fs: 12 });
  pts.forEach(([la, lo]) => { const p = P(la, lo); S.dot(p, 3.5); S.boxes.push([p.x - 3, p.y - 3, p.x + 3, p.y + 3]); });
  pts.forEach(([la, lo, n]) => geoPtLab(S, P(la, lo), geoV(1, -1), n, { gap: 3 }));
  return S.svg('globe terrestre');
}
const geoGeo = (la, lo) => '(' + Math.abs(la) + '° ' + (la > 0 ? 'N' : 'S') + ' ; ' + Math.abs(lo) + '° ' + (lo > 0 ? 'E' : 'O') + ')';
topic({ id: 'ge.reperage-espace', ch: 'ge', lvl: 2, calc: false, variants: 3,
  ru: 'Координаты в пространстве и на глобусе', fr: 'Se repérer dans l’espace et sur une sphère',
  hints: [
    'В прямоугольном параллелепипеде («pavé droit») точку задают тремя числами: абсцисса, ордината и высота («altitude»), например G(4 ; 3 ; 2).',
    'Начало координат — вершина A. Из A идём вдоль трёх рёбер: вдоль [AB] считаем абсциссу, вдоль [AD] — ординату, вверх вдоль [AE] — высоту. Если в каком-то направлении идти не нужно, там 0.',
    'На глобусе точку задают широтой («latitude»: на сколько градусов к северу N или к югу S от экватора) и долготой («longitude»: к востоку E или к западу O от гринвичского меридиана).'],
  gen(r, vi) {
    if (vi === 2) {
      const la = r.pick([30, 60]) * r.sgn(), lo = r.pick([30, 60]) * r.sgn(), pts4 = [[la, lo], [-la, lo], [la, -lo], [lo, la]];
      if (Math.abs(la) === Math.abs(lo)) pts4[3] = [-la, -lo];
      const letters = r.sh(['A', 'B', 'C', 'D', 'M', 'P', 'R', 'T']).slice(0, 4);
      const fig = geoGlobe(pts4.map((p, i) => [p[0], p[1], letters[i]]));
      const sol = ['Широта — угол к северу (N) или к югу (S) от экватора: считаем параллели от экватора, каждая через 30°. Долгота — угол к востоку (E, вправо) или к западу (O, влево) от гринвичского меридиана.',
        'Точка ' + letters[0] + ': ' + (la > 0 ? 'выше' : 'ниже') + ' экватора на ' + Math.abs(la) + '° и ' + (lo > 0 ? 'правее' : 'левее') + ' Гринвича на ' + Math.abs(lo) + '°, то есть ' + geoGeo(la, lo) + '. Первой пишут широту, второй — долготу.'];
      if (r() < 0.5) return { q: L('Sur le globe ci-dessous, les parallèles et les méridiens sont tracés tous les 30°. Quel point a pour coordonnées ' + geoGeo(la, lo) + ' ?', 'На глобусе ниже параллели и меридианы проведены через каждые 30°. У какой точки координаты ' + geoGeo(la, lo) + '?'), fig,
        ans: MQ(r, letters.map(l => L('Le point ' + l, 'Точка ' + l)), 0), sol };
      return { q: L('Sur le globe ci-dessous, les parallèles et les méridiens sont tracés tous les 30°. Quelles sont la latitude et la longitude du point ' + letters[0] + ' ?', 'На глобусе ниже параллели и меридианы проведены через каждые 30°. Каковы широта и долгота точки ' + letters[0] + '?'), fig,
        ans: MQ(r, pts4.map(p => L(geoGeo(p[0], p[1]), geoGeo(p[0], p[1]))), 0), sol };
    }
    const Lx = r.ri(3, 8), Ly = r.ri(2, 6), Lz = r.ri(2, 5), V = { A: [0, 0, 0], B: [Lx, 0, 0], C: [Lx, Ly, 0], D: [0, Ly, 0], E: [0, 0, Lz], F: [Lx, 0, Lz], G: [Lx, Ly, Lz], H: [0, Ly, Lz] };
    const co = p => '(' + p.map(v => nf(v)).join(' ; ') + ')';
    const intro = L('Le pavé droit ABCDEFGH est placé dans un repère de l’espace d’origine A. Les points B, D et E ont pour coordonnées B' + co(V.B) + ', D' + co(V.D) + ' et E' + co(V.E) + '.',
      'Прямоугольный параллелепипед ABCDEFGH помещён в систему координат с началом в точке A. Координаты точек: B' + co(V.B) + ', D' + co(V.D) + ' и E' + co(V.E) + '.');
    if (vi === 0) {
      const mids = [['I', 'F', 'G'], ['J', 'E', 'H'], ['K', 'C', 'G'], ['M', 'B', 'C'], ['N', 'H', 'G']];
      let target, name, pts = [], extraFr = '', extraRu = '';
      if (r() < 0.65) { name = r.pick(['C', 'F', 'G', 'H']); target = V[name]; }
      else { const [m, a, b] = r.pick(mids); name = m; target = V[a].map((v, i) => (v + V[b][i]) / 2); pts = [[target, m]]; extraFr = ' Le point ' + m + ' est le milieu de l’arête [' + a + b + '].'; extraRu = ' Точка ' + m + ' — середина ребра [' + a + b + '].'; }
      const fig = geoPave(Lx, Ly, Lz, { pts });
      return { q: L(intro.fr + extraFr + ' Quelles sont les coordonnées du point ' + name + ' ?', intro.ru + extraRu + ' Каковы координаты точки ' + name + '?'), fig,
        ans: multi([L('abscisse :', 'абсцисса:'), N(fx(target[0]))], [L('ordonnée :', 'ордината:'), N(fx(target[1]))], [L('altitude :', 'высота:'), N(fx(target[2]))]),
        sol: ['Из B' + co(V.B) + ' видно: вдоль [AB] абсцисса растёт от 0 до ' + Lx + '. Из D — вдоль [AD] ордината растёт до ' + Ly + '. Из E — вверх вдоль [AE] высота растёт до ' + Lz + '.',
          'Чтобы попасть из A в точку ' + name + ', идём на ' + nf(target[0]) + ' вдоль [AB], на ' + nf(target[1]) + ' вдоль [AD] и на ' + nf(target[2]) + ' вверх.' + (pts.length ? ' Середина ребра — половина пути вдоль этого ребра.' : ''),
          'Ответ: ' + name + co(target) + '.'] };
    }
    const name = r.pick(['C', 'F', 'G', 'H']), t = V[name];
    const others = ['B', 'C', 'D', 'E', 'F', 'G', 'H'].filter(x => x !== name);
    const opts = [name].concat(r.sh(others).slice(0, 3));
    return { q: L(intro.fr + ' Quel sommet a pour coordonnées ' + co(t) + ' ?', intro.ru + ' У какой вершины координаты ' + co(t) + '?'), fig: geoPave(Lx, Ly, Lz),
      ans: MQ(r, opts.map(x => L('Le sommet ' + x, 'Вершина ' + x)), 0),
      sol: ['Читаем координаты по порядку: ' + (t[0] ? 'абсцисса ' + Lx + ' — идём вдоль [AB] до конца' : 'абсцисса 0 — вдоль [AB] не идём') + '; ' + (t[1] ? 'ордината ' + Ly + ' — идём на всю глубину, как до D' : 'ордината 0 — остаёмся на передней грани') + '; ' + (t[2] ? 'высота ' + Lz + ' — поднимаемся наверх' : 'высота 0 — остаёмся на нижней грани') + '.', 'Так попадаем в вершину ' + name + '.'] };
  } });

/* tetrahedron (pyramid with a triangular base) */
function geoTetra() {
  const V3 = [[0, 0, 0], [3, 0, 0], [1.3, 2.6, 0], [1.4, 0.9, 2.6]], f = geoFit(V3.map(geoCav), 150, 150), Q = V3.map(p => f(geoCav(p))), S = geoScene();
  [[0, 2], [2, 1]].forEach(([i, j]) => S.seg(Q[i], Q[j], 'fdash')); [[0, 1], [0, 3], [1, 3], [2, 3]].forEach(([i, j]) => S.seg(Q[i], Q[j]));
  return S.svg('pyramide à base triangulaire');
}
/* nets («patrons») in maths units, fitted into the figure */
function geoNet(kind, o) {
  o = o || {}; const S = geoScene(), polys = [], circles = [];
  const rect = (x, y, w, h) => polys.push([geoV(x, y), geoV(x + w, y), geoV(x + w, y + h), geoV(x, y + h)]);
  if (kind === 'cube') [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]].forEach(([x, y]) => rect(x, y, 1, 1));
  if (kind === 'pave') { const a = 2, b = 1.2, c = 0.8; rect(0, 0, a, b); rect(0, b, a, c); rect(0, b + c, a, b); rect(0, 2 * b + c, a, c); rect(-b, b, b, c); rect(a, b, b, c); }
  if (kind === 'cyl') { const R = 0.6, H = 1.6, W = 2 * Math.PI * R; rect(0, 0, W, H); circles.push([geoV(W / 2, H + R), R], [geoV(W / 2, -R), R]); }
  if (kind === 'cone') { const g = 2, R = 0.75, th = 360 * R / g, ps = [geoV(0, 0)]; for (let i = 0; i <= 24; i++) ps.push(geoPol(g, 90 - th / 2 + th * i / 24)); polys.push(ps); circles.push([geoV(0, g + R), R]); }
  if (kind === 'pyr') { const a = 1.2, h = 1.1; rect(0, 0, a, a); polys.push([geoV(0, 0), geoV(a, 0), geoV(a / 2, -h)], [geoV(a, 0), geoV(a, a), geoV(a + h, a / 2)], [geoV(a, a), geoV(0, a), geoV(a / 2, a + h)], [geoV(0, a), geoV(0, 0), geoV(-h, a / 2)]); }
  if (kind === 'prism') { const s = 1, H = 1.6; rect(0, 0, s, H); rect(s, 0, s, H); rect(2 * s, 0, s, H); polys.push([geoV(s, H), geoV(2 * s, H), geoV(1.5 * s, H + s * 0.866)], [geoV(s, 0), geoV(2 * s, 0), geoV(1.5 * s, -s * 0.866)]); }
  if (kind === 'tetra') { const t = [geoV(0, 0), geoV(2, 0), geoV(1, 1.732)], m = [geoMid(t[0], t[1]), geoMid(t[1], t[2]), geoMid(t[2], t[0])]; polys.push(t, [m[0], m[1], m[2]]); }
  const all = polys.flat().concat(circles.flatMap(([c, r]) => [geoV(c.x - r, c.y - r), geoV(c.x + r, c.y + r)]));
  const f = geoFit(all, o.W || 230, o.H || 170), k = f.k;
  polys.forEach(p => S.poly(p.map(f), 'fl')); circles.forEach(([c, r]) => S.circle(f(c), r * k, 'fl'));
  return S.svg('patron');
}
const GEO_SOL = { pave: ['un pavé droit', 'прямоугольный параллелепипед'], cube: ['un cube', 'куб'], cyl: ['un cylindre', 'цилиндр'], cone: ['un cône', 'конус'], pyr: ['une pyramide à base carrée', 'четырёхугольная пирамида (основание — квадрат)'],
  prism: ['un prisme droit à base triangulaire', 'прямая треугольная призма'], tetra: ['une pyramide à base triangulaire', 'треугольная пирамида'], boule: ['une boule', 'шар'] };
const geoSolidFig = k => k === 'pave' ? geoPave(5, 3, 2.5, { noNames: true }) : k === 'cube' ? geoPave(3, 3, 3, { noNames: true, label: 'cube' }) : k === 'cyl' ? geoCyl(2, 4) : k === 'cone' ? geoCone(2, 3.6) : k === 'pyr' ? geoPyr(3, 3.2) : k === 'prism' ? geoPrism() : k === 'tetra' ? geoTetra() : geoSphereFig(4);
topic({ id: 'ge.solides', ch: 'ge', lvl: 1, calc: false, variants: 5,
  ru: 'Тела в пространстве и их развёртки', fr: 'Solides et patrons',
  hints: [
    'Многогранники: у призмы («prisme droit») два одинаковых параллельных основания и боковые грани-прямоугольники; у пирамиды («pyramide») одно основание и треугольные грани, сходящиеся в вершине. Куб и прямоугольный параллелепипед («pavé droit») — особые призмы.',
    'Тела вращения: цилиндр («cylindre») — два одинаковых круга-основания и боковая поверхность; конус («cône») — один круг и вершина; шар («boule») — все точки на расстоянии не больше радиуса от центра, его поверхность — сфера («sphère»).',
    'Развёртка («patron») — плоская фигура, которую можно сложить в тело без наложений. Считай грани и смотри на их форму: сколько граней и какие — столько же и таких же должно быть в развёртке.'],
  gen(r, vi) {
    if (vi === 0) {
      const k = r.pick(['pave', 'cube', 'cyl', 'cone', 'pyr', 'prism', 'tetra', 'boule']);
      const bad = { pave: ['cube', 'prism'], cube: ['pave', 'prism'], prism: [], pyr: ['tetra'], tetra: ['pyr'] }[k] || [];
      const pool = r.sh(Object.keys(GEO_SOL).filter(x => x !== k && !bad.includes(x))).slice(0, 3);
      const why = { pave: 'Шесть граней-прямоугольников, противоположные грани одинаковые — это прямоугольный параллелепипед.', cube: 'Шесть одинаковых граней-квадратов — это куб.', cyl: 'Два одинаковых круга-основания и изогнутая боковая поверхность — цилиндр.',
        cone: 'Одно круглое основание и вершина, к которой сходится боковая поверхность, — конус.', pyr: 'Основание — квадрат (четырёхугольник), остальные грани — треугольники с общей вершиной: четырёхугольная пирамида.', prism: 'Два одинаковых параллельных треугольника-основания и три боковые грани-прямоугольника — прямая треугольная призма.',
        tetra: 'Основание — треугольник, ещё три треугольные грани сходятся в вершине: треугольная пирамида (все 4 грани — треугольники).', boule: 'Круглая со всех сторон фигура: все её точки на расстоянии не больше радиуса от центра. Это шар.' }[k];
      return { q: L('Quel est le nom du solide représenté ci-dessous ?', 'Как называется изображённое тело?'), fig: geoSolidFig(k), ans: MQ(r, [k].concat(pool).map(x => L(GEO_SOL[x][0][0].toUpperCase() + GEO_SOL[x][0].slice(1), GEO_SOL[x][1][0].toUpperCase() + GEO_SOL[x][1].slice(1))), 0),
        sol: [why, 'Штриховые линии на рисунке — невидимые рёбра (их закрывает само тело).'] };
    }
    if (vi === 1) {
      const k = r.pick(['pave', 'pyr', 'prism', 'tetra']), what = r.pick(['faces', 'aretes', 'sommets']);
      const D = { pave: [6, 12, 8], pyr: [5, 8, 5], prism: [5, 9, 6], tetra: [4, 6, 4] }[k], idx = ['faces', 'aretes', 'sommets'].indexOf(what);
      const W = { faces: ['faces', 'граней'], aretes: ['arêtes', 'рёбер'], sommets: ['sommets', 'вершин'] }[what];
      const nm = { pave: ['ce pavé droit', 'этого прямоугольного параллелепипеда'], pyr: ['cette pyramide à base carrée', 'этой четырёхугольной пирамиды'], prism: ['ce prisme droit à base triangulaire', 'этой треугольной призмы'], tetra: ['cette pyramide à base triangulaire', 'этой треугольной пирамиды'] }[k];
      const how = { pave: ['Граней: 2 основания + 4 боковые = 6.', 'Рёбер: 4 у нижнего основания + 4 у верхнего + 4 вертикальных = 12.', 'Вершин: 4 внизу + 4 вверху = 8.'],
        pyr: ['Граней: квадрат-основание + 4 треугольника = 5.', 'Рёбер: 4 стороны основания + 4 ребра к вершине = 8.', 'Вершин: 4 у основания + 1 вершина пирамиды = 5.'],
        prism: ['Граней: 2 треугольных основания + 3 боковых прямоугольника = 5.', 'Рёбер: 3 у нижнего треугольника + 3 у верхнего + 3 боковых = 9.', 'Вершин: 3 внизу + 3 вверху = 6.'],
        tetra: ['Граней: треугольник-основание + 3 боковых треугольника = 4.', 'Рёбер: 3 стороны основания + 3 ребра к вершине = 6.', 'Вершин: 3 у основания + 1 вершина = 4.'] }[k];
      return { q: L('Combien de ' + W[0] + ' possède ' + nm[0] + ' ?', 'Сколько ' + W[1] + ' у ' + nm[1] + '?'), fig: geoSolidFig(k), ans: N(D[idx]),
        sol: ['Не забываем невидимые (штриховые) рёбра и грани сзади. Считаем по частям:', how[idx], 'Проверка по формуле Эйлера для многогранников: грани + вершины − рёбра = 2. Здесь ' + D[0] + ' + ' + D[2] + ' − ' + D[1] + ' = 2.'] };
    }
    if (vi === 2) {
      const k = r.pick(['cube', 'pave', 'cyl', 'cone', 'pyr', 'prism', 'tetra']);
      const bad = { cube: ['pave'], pave: ['cube'], pyr: ['tetra'], tetra: ['pyr'] }[k] || [];
      const pool = r.sh(['cube', 'pave', 'cyl', 'cone', 'pyr', 'prism', 'tetra'].filter(x => x !== k && !bad.includes(x))).slice(0, 3);
      const why = { cube: 'Шесть одинаковых квадратов — куб.', pave: 'Шесть прямоугольников, попарно одинаковых, — прямоугольный параллелепипед.', cyl: 'Прямоугольник (боковая поверхность) и два одинаковых круга (основания) — цилиндр.',
        cone: 'Круговой сектор (боковая поверхность) и один круг (основание) — конус.', pyr: 'Квадрат и четыре треугольника, которые сходятся в одну вершину, — четырёхугольная пирамида.', prism: 'Три прямоугольника (боковые грани) и два треугольника (основания) — треугольная призма.', tetra: 'Четыре треугольника — треугольная пирамида: средний станет основанием, три других поднимутся к вершине.' }[k];
      return { q: L('Ce patron permet de construire un solide. Lequel ?', 'Из этой развёртки можно сложить тело. Какое?'), fig: geoNet(k), ans: MQ(r, [k].concat(pool).map(x => L(GEO_SOL[x][0][0].toUpperCase() + GEO_SOL[x][0].slice(1), GEO_SOL[x][1][0].toUpperCase() + GEO_SOL[x][1].slice(1))), 0),
        sol: ['Смотрим на форму и количество частей развёртки: каждая часть станет гранью или поверхностью тела.', why] };
    }
    if (vi === 3) {   /* cylinder: length of the rectangle of its net */
      let R, H; do { R = r.ri(2, 7); H = r.ri(3, 12); } while (new Set([2 * R, R, R * R, 2 * H]).size < 4 || H === R);
      const S = geoScene(), sc = Math.min(280 / (2 * Math.PI * R), 190 / (H + 4 * R)), W = 2 * Math.PI * R * sc, h = H * sc, rr = R * sc;
      const rect = [geoV(0, 0), geoV(W, 0), geoV(W, h), geoV(0, h)];
      S.poly(rect, 'fl'); S.circle(geoV(W / 2, -rr), rr, 'fl'); S.circle(geoV(W / 2, h + rr), rr, 'fl');
      S.seg(geoV(W / 2, -rr), geoV(W / 2 + rr, -rr), 'fl2'); S.dot(geoV(W / 2, -rr), 2); S.text(geoV(W / 2 + rr + 6, -rr), 'r = ' + R + ' cm', { fs: 14, anchor: 'start' });
      geoSegLab(S, rect[1], rect[2], H + ' cm', rect[0]);
      { const a = geoV(5, h / 2), b = geoV(W - 5, h / 2); S.seg(a, b, 'fl2'); S.poly([geoV(a.x + 7, a.y - 3), a, geoV(a.x + 7, a.y + 3)], 'fl2', true); S.poly([geoV(b.x - 7, b.y - 3), b, geoV(b.x - 7, b.y + 3)], 'fl2', true); S.text(geoV(W / 2, h / 2 - 11), '?'); }
      const T = v => '$$' + v + '\\pi$$ cm';
      return { q: L('On dessine le patron d’un cylindre de rayon ' + R + ' cm et de hauteur ' + H + ' cm. Ce patron est formé de deux disques et d’un rectangle. Quelle est la longueur du rectangle ?', 'Рисуют развёртку цилиндра с радиусом ' + R + ' см и высотой ' + H + ' см. Она состоит из двух кругов и прямоугольника. Какова длина прямоугольника?'), fig: S.svg('patron d’un cylindre'),
        ans: MQ(r, [2 * R, R, R * R, 2 * H].map(v => L(T(v), T(v).replace('cm', 'см'))), 0),
        sol: ['Прямоугольник — это боковая поверхность: при сворачивании он оборачивается ровно один раз вокруг круга основания. Значит, его длина равна длине окружности основания, а ширина — высоте цилиндра (' + H + ' см).',
          { t: 'Длина окружности радиуса r — это 2πr:', tex: '2\\times\\pi\\times ' + R + '=' + (2 * R) + '\\pi\\text{ cm}\\approx ' + geoT(geoRound(2 * Math.PI * R, 1)) + '\\text{ cm}' }, 'πr² — это площадь круга, а не длина; πr — только половина окружности.'] };
    }
    /* cube net: opposite faces */
    const top = r.ri(0, 3), bot = r.ri(0, 3), cells = [[top, 2], [0, 1], [1, 1], [2, 1], [3, 1], [bot, 0]], nums = r.sh([1, 2, 3, 4, 5, 6]);
    const S = geoScene(), c = 46;
    cells.forEach(([x, y], i) => { const ps = [geoV(x * c, -y * c), geoV(x * c + c, -y * c), geoV(x * c + c, -y * c - c), geoV(x * c, -y * c - c)]; S.poly(ps, 'fl'); S.text(geoV(x * c + c / 2, -y * c - c / 2), String(nums[i]), { fs: 17 }); });
    const opp = { 0: 5, 5: 0, 1: 3, 3: 1, 2: 4, 4: 2 }, ask = r.ri(0, 5), ans = nums[opp[ask]];
    const why = ask === 0 || ask === 5 ? 'Квадраты ' + nums[0] + ' и ' + nums[5] + ' приклеены сверху и снизу к полосе из четырёх: при сгибании один становится крышкой, другой — дном. Они противоположны.'
      : 'Полоса из четырёх квадратов (' + [1, 2, 3, 4].map(i => nums[i]).join(', ') + ') сворачивается в «кольцо» стенок. В кольце из четырёх стенок напротив друг друга стоят квадраты через один: ' + nums[1] + ' и ' + nums[3] + ', ' + nums[2] + ' и ' + nums[4] + '.';
    return { q: L('On plie ce patron pour fabriquer un cube. Quel est le numéro de la face opposée à la face ' + nums[ask] + ' ?', 'Из этой развёртки складывают куб. Какой номер у грани, противоположной грани ' + nums[ask] + '?'), fig: S.svg('patron d’un cube'), ans: N(ans),
      sol: ['Противоположные грани куба не соприкасаются: в развёртке у них нет общей стороны.', why, 'Ответ: напротив грани ' + nums[ask] + ' окажется грань ' + ans + '.'] };
  } });

/* ===================== SECTIONS ===================== */
topic({ id: 'ge.sections', ch: 'ge', lvl: 2, calc: false, variants: 4,
  ru: 'Сечения тел плоскостью, сфера и шар', fr: 'Sections de solides par un plan',
  hints: [
    'Сечение («section») — фигура, которая получается, если разрезать тело плоскостью. Плоскость, параллельная грани параллелепипеда, даёт прямоугольник, равный этой грани (на рисунке в перспективе он выглядит как параллелограмм, но это прямоугольник).',
    'Цилиндр: плоскость, перпендикулярная оси, даёт круг того же радиуса; параллельная оси — прямоугольник. Конус и пирамида: плоскость, параллельная основанию, даёт уменьшенную копию основания, коэффициент — расстояние от вершины, делённое на высоту.',
    'Шар, разрезанный плоскостью, даёт круг («disque»), а сфера — окружность («cercle»). Если плоскость на расстоянии d от центра, радиус сечения r находим по Пифагору: $r^2+d^2=R^2$.'],
  gen(r, vi) {
    if (vi === 0) {
      const k = r.pick(['pave', 'cube', 'cylP', 'cylA', 'cone', 'pyr', 'boule', 'sphere']);
      const F = { pave: [() => geoPave(5, 3, 2.5, { noNames: true, sec: [[[2.6, 0, 0], 1], [[2.6, 0, 2.5], 1], [[2.6, 3, 2.5], 0], [[2.6, 3, 0], 0]] }), 'ce pavé droit par un plan parallèle à une face', 'этот параллелепипед плоскостью, параллельной грани', 'rect'],
        cube: [() => geoPave(3, 3, 3, { noNames: true, sec: [[[0, 0, 1.6], 1], [[3, 0, 1.6], 1], [[3, 3, 1.6], 0], [[0, 3, 1.6], 0]] }), 'ce cube par un plan parallèle à une face', 'этот куб плоскостью, параллельной грани', 'carre'],
        cylP: [() => geoCyl(2, 4, { sec: 'perp', t: 0.55 }), 'ce cylindre par un plan perpendiculaire à son axe', 'этот цилиндр плоскостью, перпендикулярной его оси', 'disque'],
        cylA: [() => geoCyl(2, 4, { sec: 'par', d: -0.9 }), 'ce cylindre par un plan parallèle à son axe', 'этот цилиндр плоскостью, параллельной его оси', 'rect'],
        cone: [() => geoCone(2, 3.6, { sec: 0.45 }), 'ce cône par un plan parallèle à sa base', 'этот конус плоскостью, параллельной основанию', 'disque'],
        pyr: [() => geoPyr(3, 3.2, { sec: 0.45 }), 'cette pyramide à base carrée par un plan parallèle à sa base', 'эту пирамиду с квадратным основанием плоскостью, параллельной основанию', 'carre'],
        boule: [() => geoSphereFig(4, { d: 1.6 }), 'cette boule par un plan', 'этот шар плоскостью', 'disque'], sphere: [() => geoSphereFig(4, { d: 1.6 }), 'cette sphère par un plan', 'эту сферу плоскостью', 'cercle'] }[k];
      const names = { rect: ['un rectangle', 'прямоугольник'], carre: ['un carré', 'квадрат'], disque: ['un disque', 'круг'], cercle: ['un cercle', 'окружность'], para: ['un parallélogramme non rectangle', 'параллелограмм без прямых углов'], ell: ['une ellipse', 'эллипс («овал»)'], tri: ['un triangle', 'треугольник'], trap: ['un trapèze', 'трапеция'] };
      const dis = { rect: ['para', 'tri', 'disque'], carre: ['tri', 'trap', 'disque'], disque: ['ell', 'rect', 'tri'], cercle: ['disque', 'ell', 'carre'] }[F[3]];
      if (k === 'cylA') dis[2] = 'ell';
      const why = { pave: 'Плоскость, параллельная грани, отрезает от параллелепипеда кусок той же формы: сечение — прямоугольник, равный этой грани. На рисунке в перспективе прямые углы выглядят косыми, поэтому прямоугольник похож на параллелограмм.',
        cube: 'Плоскость, параллельная грани куба, даёт сечение, равное грани, — квадрат. В перспективе он нарисован как параллелограмм, но на самом деле все углы прямые и стороны равны.',
        cylP: 'Все точки цилиндра на одной высоте образуют круг того же радиуса, что и основание. На рисунке круги рисуют «овалами», потому что смотрим сбоку, — но сечение — круг.',
        cylA: 'Плоскость, параллельная оси, режет цилиндр по двум отрезкам-образующим и по двум хордам оснований: получается прямоугольник высотой как цилиндр.',
        cone: 'Сечение конуса плоскостью, параллельной основанию, — круг, уменьшенная копия основания (центр гомотетии — вершина конуса).', pyr: 'Сечение пирамиды плоскостью, параллельной основанию, — уменьшенная копия основания: здесь квадрат меньшего размера.',
        boule: 'Шар — тело, «заполненный» внутри, поэтому его сечение — круг («disque»). Окружность («cercle») получилась бы у сферы — поверхности шара.', sphere: 'Сфера — только поверхность шара, «оболочка». Плоскость режет её по линии — окружности («cercle»). Круг («disque») был бы сечением шара.' }[k];
      return { q: L('On coupe ' + F[1] + ', comme sur la figure. Quelle est la nature de la section ?', 'Разрезают ' + F[2] + ', как на рисунке. Какая фигура получается в сечении?'), fig: F[0](),
        ans: MQ(r, [F[3]].concat(dis).map(x => L(names[x][0][0].toUpperCase() + names[x][0].slice(1), names[x][1][0].toUpperCase() + names[x][1].slice(1))), 0), sol: [why] };
    }
    if (vi === 1) {
      const a = r.ri(4, 10), b = r.ri(2, 7), c = r.ri(2, 6), kind = r.pick(['x', 'y', 'z']);
      const sec = kind === 'x' ? [[[a * 0.55, 0, 0], 1], [[a * 0.55, 0, c], 1], [[a * 0.55, b, c], 0], [[a * 0.55, b, 0], 0]] : kind === 'y' ? [[[0, b * 0.5, 0], 0], [[a, b * 0.5, 0], 1], [[a, b * 0.5, c], 1], [[0, b * 0.5, c], 0]] : [[[0, 0, c * 0.5], 1], [[a, 0, c * 0.5], 1], [[a, b, c * 0.5], 0], [[0, b, c * 0.5], 0]];
      const face = { x: ['BCGF', 'AD × AE', b * c, b, c], y: ['ABFE', 'AB × AE', a * c, a, c], z: ['ABCD', 'AB × AD', a * b, a, b] }[kind];
      const fig = geoPave(a, b, c, { sec, W: 210 });
      return { q: L('Le pavé droit ABCDEFGH a pour dimensions AB = ' + a + ' cm, AD = ' + b + ' cm et AE = ' + c + ' cm. On le coupe par un plan parallèle à la face ' + face[0] + '. Quelle est l’aire de la section ?', 'Прямоугольный параллелепипед ABCDEFGH имеет измерения AB = ' + a + ' см, AD = ' + b + ' см и AE = ' + c + ' см. Его разрезают плоскостью, параллельной грани ' + face[0] + '. Какова площадь сечения?'), fig, ans: N(face[2], { unit: 'cm²' }),
        sol: ['Сечение плоскостью, параллельной грани, — прямоугольник, равный этой грани ' + face[0] + ' (где бы ни прошла плоскость).', { t: 'Стороны грани ' + face[0] + ' равны ' + face[3] + ' см и ' + face[4] + ' см, поэтому:', tex: face[3] + '\\times ' + face[4] + '=' + face[2] + '\\text{ cm}^2' }] };
    }
    if (vi === 2) {   /* section of a ball: Pythagoras */
      const [R, d, rr] = r.pick([[5, 3, 4], [5, 4, 3], [10, 6, 8], [10, 8, 6], [13, 5, 12], [13, 12, 5], [15, 9, 12], [15, 12, 9], [17, 8, 15], [25, 7, 24]]);
      const fig = geoSphereFig(R, { d, tri: true, lab: { OM: R + ' cm', OH: d + ' cm', HM: '?' } });
      return { q: L('Une boule de centre O et de rayon ' + R + ' cm est coupée par un plan situé à ' + d + ' cm de O. La section est un disque de centre H. Quel est son rayon HM ?', 'Шар с центром O и радиусом ' + R + ' см разрезают плоскостью на расстоянии ' + d + ' см от O. В сечении — круг с центром H. Чему равен его радиус HM?'), fig, ans: N(rr, { unit: 'cm' }),
        sol: ['Отрезок OH перпендикулярен плоскости сечения, поэтому треугольник OHM прямоугольный, прямой угол при H. Гипотенуза — OM, это радиус шара: M лежит на сфере.',
          ['По теореме Пифагора:', 'HM^2=OM^2-OH^2=' + R + '^2-' + d + '^2=' + (R * R) + '-' + (d * d) + '=' + (rr * rr)], ['', 'HM=√' + (rr * rr) + '=' + rr, 'cm'], 'Чем дальше плоскость от центра, тем меньше круг сечения; через центр (d = 0) проходит самый большой круг — радиуса R.'] };
    }
    /* cone or pyramid cut parallel to the base: a reduction */
    const cone = r() < 0.5, [h, x] = r.pick([[12, 4], [12, 6], [12, 9], [10, 5], [10, 4], [9, 3], [9, 6], [15, 5], [15, 10], [8, 2], [8, 6], [16, 4], [20, 5]]), base = r.pick(cone ? [2, 3, 4, 5, 6, 8] : [4, 6, 8, 9, 10, 12]);
    const val = +(base * x / h).toFixed(4);
    if (!Number.isInteger(val * 2)) return this.gen(r, vi);
    const fig = cone ? geoCone(base, h / 1.6, { sec: 1 - x / h, axis: true }) : geoPyr(base, h * 0.8, { sec: 1 - x / h, names: ['A', 'B', 'C', 'D', 'S'] });
    const q = cone ? L('Un cône a une hauteur de ' + h + ' cm et une base de rayon ' + base + ' cm. On le coupe par un plan parallèle à la base, situé à ' + x + ' cm du sommet. Quel est le rayon de la section ?', 'Конус высотой ' + h + ' см с радиусом основания ' + base + ' см разрезают плоскостью, параллельной основанию, на расстоянии ' + x + ' см от вершины. Каков радиус сечения?')
      : L('Une pyramide SABCD a une hauteur de ' + h + ' cm et pour base un carré de ' + base + ' cm de côté. On la coupe par un plan parallèle à la base, situé à ' + x + ' cm du sommet S. Quelle est la longueur du côté de la section ?', 'Пирамида SABCD высотой ' + h + ' см имеет основание — квадрат со стороной ' + base + ' см. Её разрезают плоскостью, параллельной основанию, на расстоянии ' + x + ' см от вершины S. Какова сторона сечения?');
    return { q, fig, ans: N(fx(val), { unit: 'cm' }),
      sol: ['Сечение, параллельное основанию, — уменьшенная копия основания: это гомотетия с центром в вершине. Коэффициент уменьшения — во сколько раз расстояние от вершины меньше высоты:', { t: '', tex: 'k=\\dfrac{' + x + '}{' + h + '}' + (gcd(x, h) > 1 ? '=\\dfrac{' + x / gcd(x, h) + '}{' + h / gcd(x, h) + '}' : '') },
        { t: 'Все длины основания умножаются на k:', tex: geoT(base) + '\\times\\dfrac{' + x + '}{' + h + '}=' + geoT(val) + '\\text{ cm}' }, 'Расстояние считают от вершины: плоскость на расстоянии ' + x + ' см от вершины находится на высоте ' + (h - x) + ' см от основания.'] };
  } });

/* ===================== QUADRILATÈRES ===================== */
/* a quadrilateral ABCD «à main levée» with its codings: on the sides, or on the diagonals */
function geoQuadFig(r, kind, diag) {
  const M = { carre: [geoV(0, 0), geoV(1, 0), geoV(1, 1), geoV(0, 1)], rect: [geoV(0, 0), geoV(1.6, 0), geoV(1.6, 1), geoV(0, 1)], los: [geoV(0, -0.62), geoV(0.95, 0), geoV(0, 0.62), geoV(-0.95, 0)], para: [geoV(0, 0), geoV(1.5, 0), geoV(1.95, 0.85), geoV(0.45, 0.85)] }[kind];
  const J = geoTurn(M, r.ri(-25, 25)).map(p => geoAdd(p, geoV((r() - 0.5) * 0.06, (r() - 0.5) * 0.06)));
  const Q = J.map(geoFit(J, 180, 130)), S = geoScene(), nm = ['A', 'B', 'C', 'D'];
  S.poly(Q, 'fl');
  if (!diag) {
    if (kind === 'los' || kind === 'carre') for (let i = 0; i < 4; i++) geoTicks(S, Q[i], Q[(i + 1) % 4], 1);
    if (kind === 'para') for (let i = 0; i < 4; i++) geoTicks(S, Q[i], Q[(i + 1) % 4], i % 2 ? 2 : 1);
    if (kind === 'carre') geoRightMark(S, Q[0], Q[1], Q[3], 9);
    if (kind === 'rect') [0, 1, 2].forEach(i => geoRightMark(S, Q[i], Q[(i + 1) % 4], Q[(i + 3) % 4], 9));
  } else {
    S.seg(Q[0], Q[2]); S.seg(Q[1], Q[3]);
    const d1 = geoSub(Q[2], Q[0]), d2 = geoSub(Q[3], Q[1]), t = geoCross(geoSub(Q[1], Q[0]), d2) / geoCross(d1, d2), O = geoAdd(Q[0], geoMul(d1, t));
    const same = kind === 'rect' || kind === 'carre';
    geoTicks(S, Q[0], O, 1); geoTicks(S, O, Q[2], 1); geoTicks(S, Q[1], O, same ? 1 : 2); geoTicks(S, O, Q[3], same ? 1 : 2);
    if (kind === 'los' || kind === 'carre') geoRightMark(S, O, Q[0], Q[1], 8);
    S.dot(O, 2);
  }
  const C = geoCen(Q); Q.forEach((q, i) => geoPtLab(S, q, geoSub(q, C), nm[i], { gap: 5 }));
  return S.svg('quadrilatère ABCD tracé à main levée');
}
const GEO_QTF = [
  [true, 'Un carré est un losange.', 'Квадрат — это ромб.', 'Верно: у квадрата четыре равные стороны, а ромб — это и есть четырёхугольник с четырьмя равными сторонами.'],
  [false, 'Un losange est un carré.', 'Ромб — это квадрат.', 'Неверно: у ромба стороны равны, но углы не обязательно прямые. Квадрат — только особый ромб.'],
  [true, 'Un rectangle est un parallélogramme.', 'Прямоугольник — это параллелограмм.', 'Верно: у прямоугольника противоположные стороны параллельны (обе перпендикулярны одной и той же стороне).'],
  [false, 'Un parallélogramme est un rectangle.', 'Параллелограмм — это прямоугольник.', 'Неверно: у параллелограмма углы могут быть не прямыми.'],
  [false, 'Les diagonales d’un rectangle sont perpendiculaires.', 'Диагонали прямоугольника перпендикулярны.', 'Неверно: диагонали прямоугольника равны и делятся пополам, но перпендикулярны они только у квадрата.'],
  [true, 'Les diagonales d’un losange sont perpendiculaires.', 'Диагонали ромба перпендикулярны.', 'Верно: каждая вершина ромба на равных расстояниях от концов другой диагонали, поэтому диагональ лежит на серединном перпендикуляре к другой.'],
  [true, 'Les diagonales d’un rectangle ont la même longueur.', 'Диагонали прямоугольника равны.', 'Верно: два прямоугольных треугольника с одинаковыми катетами (стороны прямоугольника) имеют одинаковые гипотенузы — это и есть диагонали.'],
  [false, 'Les diagonales d’un parallélogramme ont la même longueur.', 'Диагонали параллелограмма равны.', 'Неверно: равные диагонали только у прямоугольника; у «скошенного» параллелограмма одна диагональ длиннее другой.'],
  [true, 'Les diagonales d’un parallélogramme se coupent en leur milieu.', 'Диагонали параллелограмма точкой пересечения делятся пополам.', 'Верно: это главное свойство параллелограмма (центральная симметрия относительно точки пересечения диагоналей).'],
  [false, 'Un quadrilatère qui a quatre angles droits est un carré.', 'Четырёхугольник с четырьмя прямыми углами — квадрат.', 'Неверно: это прямоугольник; квадратом он будет, только если ещё и стороны равны.'],
  [true, 'Un parallélogramme qui a un angle droit est un rectangle.', 'Параллелограмм с прямым углом — прямоугольник.', 'Верно: у параллелограмма соседние углы в сумме 180°, а противоположные равны, — значит, все углы прямые.'],
  [true, 'Un losange qui a un angle droit est un carré.', 'Ромб с прямым углом — квадрат.', 'Верно: ромб — параллелограмм, с прямым углом все углы прямые, а стороны и так равны.'],
  [false, 'Un quadrilatère dont les diagonales sont perpendiculaires est un losange.', 'Четырёхугольник с перпендикулярными диагоналями — ромб.', 'Неверно: например, у «воздушного змея» диагонали перпендикулярны, но стороны не все равны. Нужно ещё, чтобы диагонали делились пополам.'],
  [true, 'Un parallélogramme dont les diagonales ont la même longueur est un rectangle.', 'Параллелограмм с равными диагоналями — прямоугольник.', 'Верно: это признак прямоугольника.']];
topic({ id: 'ge.quadrilateres', ch: 'ge', lvl: 1, calc: false, variants: 3,
  ru: 'Четырёхугольники: узнать по отметкам', fr: 'Quadrilatères particuliers',
  hints: [
    'Параллелограмм — противоположные стороны параллельны (и равны); его диагонали точкой пересечения делятся пополам.',
    'Ромб («losange») — четыре равные стороны, диагонали перпендикулярны. Прямоугольник («rectangle») — прямые углы, диагонали равны. Квадрат («carré») — и ромб, и прямоугольник сразу.',
    'Рисунок «от руки» («à main levée») может обманывать: верь только отметкам («codages»). Одинаковые чёрточки — равные отрезки, квадратик — прямой угол.'],
  gen(r, vi) {
    if (vi === 2) {
      const [ok, fr, ru, why] = r.pick(GEO_QTF);
      return { q: L('Vrai ou faux : « ' + fr + ' »', 'Верно или неверно: «' + ru + '»'), ans: TF(ok), sol: [why] };
    }
    const kind = r.pick(['los', 'rect', 'carre', 'para']), diag = vi === 1;
    const opts = [L('Un losange', 'Ромб'), L('Un rectangle', 'Прямоугольник'), L('Un carré', 'Квадрат'), L('Seulement un parallélogramme', 'Только параллелограмм')];
    const c = ['los', 'rect', 'carre', 'para'].indexOf(kind);
    const why = diag ? { para: 'Отмечено только, что диагонали делятся пополам (на каждой диагонали две одинаковые половинки). Это признак параллелограмма — и больше ничего сказать нельзя.',
      los: 'Диагонали делятся пополам — это параллелограмм; и они перпендикулярны (квадратик в центре) — значит, это ромб. Равенство диагоналей не отмечено, поэтому про квадрат сказать нельзя.',
      rect: 'Все четыре половинки диагоналей одинаковые: диагонали делятся пополам и равны. Параллелограмм с равными диагоналями — прямоугольник. Перпендикулярность не отмечена.',
      carre: 'Диагонали делятся пополам, равны (все половинки одинаковые) и перпендикулярны. Равные диагонали — прямоугольник, перпендикулярные — ромб; и то и другое сразу — квадрат.' }[kind]
      : { para: 'Отмечено только, что противоположные стороны попарно равны (одна и две чёрточки). Это признак параллелограмма; прямых углов и равенства всех сторон не отмечено.',
        los: 'Все четыре стороны отмечены одинаково — четыре равные стороны: это ромб. Прямой угол не отмечен, поэтому про квадрат сказать нельзя.',
        rect: 'Отмечены три прямых угла. Тогда и четвёртый прямой (сумма углов четырёхугольника 360°), а четырёхугольник с четырьмя прямыми углами — прямоугольник.',
        carre: 'Четыре равные стороны — это ромб, а ромб с прямым углом — квадрат.' }[kind];
    return { q: L('Le quadrilatère ABCD ci-dessous est tracé à main levée. D’après les codages, quelle est sa nature la plus précise ?', 'Четырёхугольник ABCD нарисован от руки. Что точнее всего можно сказать о нём по отметкам на рисунке?'), fig: geoQuadFig(r, kind, diag), ans: MQ(r, opts, c),
      sol: [why, 'Рисунок от руки ничего не доказывает — решают только отметки. Квадрат одновременно и ромб, и прямоугольник, поэтому выбираем самое точное название, которое следует из отметок.'] };
  } });

/* ===================== FICHES ===================== */
fiche({ ch: 'ge', id: 'ge.f-angles', ru: 'Углы, треугольники, четырёхугольники', fr: 'Angles, triangles et quadrilatères', body: [
  'Сумма углов треугольника — 180°. Почему: проведём через вершину прямую, параллельную противоположной стороне; три угла треугольника лягут рядом и составят развёрнутый угол.',
  'Прямоугольный треугольник: два острых угла вместе — 90°. Равнобедренный («isocèle»): углы при основании равны. Равносторонний («équilatéral»): все углы по 60°.',
  'Две параллельные прямые и секущая («sécante»): накрест лежащие («alternes-internes») и соответственные («correspondants») углы равны; и наоборот, если они равны, прямые параллельны. Вертикальные углы («opposés par le sommet») равны всегда, смежные дают в сумме 180°.',
  'Неравенство треугольника («inégalité triangulaire»): каждая сторона меньше суммы двух других. Достаточно проверить самую длинную; если она равна сумме двух других — точки на одной прямой, треугольник «сплющенный» («aplati»).',
  'Четырёхугольники: параллелограмм — диагонали делятся пополам; ромб («losange») — 4 равные стороны, диагонали перпендикулярны; прямоугольник — прямые углы, диагонали равны; квадрат — и ромб, и прямоугольник. На рисунке «à main levée» верь только отметкам («codages»).'],
  ex: [['Третий угол треугольника', '180-48-67=65'], ['Равнобедренный, угол при вершине 40°', '(180-40)/2=70']] });
fiche({ ch: 'ge', id: 'ge.f-pythagore', ru: 'Теорема Пифагора и обратная', fr: 'Théorème de Pythagore et sa réciproque', body: [
  'Если треугольник ABC прямоугольный в A, то $BC^2=AB^2+AC^2$: квадрат гипотенузы («hypoténuse» — сторона напротив прямого угла, самая длинная) равен сумме квадратов катетов. Только для прямоугольного треугольника: при тупом угле $BC^2$ больше суммы, при остром — меньше.',
  'Гипотенуза: сложить квадраты катетов и извлечь корень. Катет: из квадрата гипотенузы вычесть квадрат другого катета и извлечь корень. Точное значение пишут с корнем ($√13$), приближённое — с калькулятором, округляя в самом конце.',
  'Обратная теорема («réciproque»): если квадрат самой длинной стороны равен сумме квадратов двух других, треугольник прямоугольный, и прямой угол — напротив самой длинной стороны. Если не равен — треугольник не прямоугольный (иначе по самой теореме было бы равенство).',
  'На экзамене пишут: «Le triangle ABC est rectangle en A. D’après le théorème de Pythagore, BC² = AB² + AC².» или «… d’après la réciproque du théorème de Pythagore, le triangle est rectangle en A.»'],
  ex: [['Гипотенуза', 'BC^2=6^2+8^2=100;BC=10'], ['Катет', 'AC^2=13^2-5^2=144;AC=12'], ['Проверка прямого угла', '5^2+12^2=169=13^2']] });
fiche({ ch: 'ge', id: 'ge.f-thales', ru: 'Теорема Фалеса и обратная', fr: 'Théorème de Thalès et sa réciproque', body: [
  'Конфигурация: прямые (BM) и (CN) пересекаются в точке A, и (MN) ∥ (BC). Бывает «треугольник» (M на [AB], N на [AC]) и «бабочка» (M и N по другую сторону от A).',
  'Тогда $AM/AB=AN/AC=MN/BC$: треугольник AMN — копия треугольника ABC в другом масштабе. Все длины в отношениях — от точки пересечения A, а третья дробь — параллельные стороны.',
  'Неизвестное находим перекрёстным умножением («produit en croix»): из $AM/AB=AN/AC$ получаем $AN=AM*AC/AB$.',
  'Обратная теорема («réciproque»): если точки A, M, B и A, N, C идут в одном порядке и $AM/AB=AN/AC$, то (MN) ∥ (BC). Если отношения разные — прямые не параллельны (иначе по самой теореме отношения были бы равны).'],
  ex: [['Пропорция', '4/6=5/x'], ['Перекрёстное умножение', 'x=6*5/4=7.5']] });
fiche({ ch: 'ge', id: 'ge.f-trigo', ru: 'Тригонометрия в прямоугольном треугольнике', fr: 'Trigonométrie dans le triangle rectangle', body: [
  'Для острого угла прямоугольного треугольника: гипотенуза — напротив прямого угла; прилежащий катет («côté adjacent») — сторона угла, которая не гипотенуза; противолежащий катет («côté opposé») — напротив угла.',
  '$$\\cos\\widehat{B}=\\dfrac{\\text{adjacent}}{\\text{hypoténuse}}\\qquad \\sin\\widehat{B}=\\dfrac{\\text{opposé}}{\\text{hypoténuse}}\\qquad \\tan\\widehat{B}=\\dfrac{\\text{opposé}}{\\text{adjacent}}$$ Запоминалка: «CAH SOH TOA» (звучит как «casse-toi»).',
  'Почему отношения не зависят от размера треугольника: все прямоугольные треугольники с одним и тем же острым углом — копии друг друга в разном масштабе (как в теореме Фалеса). Все стороны растягиваются в одно и то же число раз, а их отношение не меняется. Поэтому, например, $$\\cos 60^\\circ=0{,}5$$ в любом таком треугольнике.',
  'Найти длину: запиши отношение с известной и искомой сторонами; неизвестное в числителе — умножаем, в знаменателе — делим. Найти угол: обратные функции $$\\cos^{-1}$$, $$\\sin^{-1}$$, $$\\tan^{-1}$$. Калькулятор — в режиме градусов.',
  'Косинус и синус острого угла всегда меньше 1, потому что гипотенуза — самая длинная сторона и стоит в знаменателе. Тангенс может быть и больше 1.'] });
fiche({ ch: 'ge', id: 'ge.f-transformations', ru: 'Преобразования фигур', fr: 'Les transformations', body: [
  'Осевая симметрия («symétrie axiale») — перегиб по прямой (d): точка и её образ на одном перпендикуляре к (d), на равных расстояниях от неё. Фигура переворачивается, как в зеркале.',
  'Центральная симметрия («symétrie centrale») с центром O — пол-оборота вокруг O: O — середина отрезка между точкой и её образом.',
  'Параллельный перенос («translation»), переводящий A в B: каждая точка сдвигается так же, как A в B. Фигура не поворачивается и не переворачивается.',
  'Поворот («rotation»): центр, угол и направление — против часовой стрелки («dans le sens inverse des aiguilles d’une montre») или по часовой. Расстояние до центра не меняется.',
  'Эти четыре преобразования сохраняют длины, углы и площади. Гомотетия («homothétie») с центром O и коэффициентом k умножает длины на |k|, площади на k², объёмы на |k|³; при k < 0 образ по другую сторону от O, при k = −1 это центральная симметрия.'] });
fiche({ ch: 'ge', id: 'ge.f-solides', ru: 'Тела, развёртки, сечения, координаты', fr: 'Solides, patrons, sections et repérage', body: [
  'Призма («prisme droit»): два одинаковых основания и боковые грани-прямоугольники (куб и «pavé droit» — тоже призмы). Пирамида: основание и треугольные грани с общей вершиной. Цилиндр, конус, шар («boule»); поверхность шара — сфера («sphère»).',
  'Развёртка («patron») цилиндра — два круга и прямоугольник: его длина — длина окружности основания $$2\\pi r$$, ширина — высота цилиндра.',
  'Сечения («sections»): параллелепипед плоскостью, параллельной грани, — прямоугольник, равный этой грани; цилиндр перпендикулярно оси — круг, параллельно оси — прямоугольник; конус и пирамида параллельно основанию — уменьшенная копия основания (коэффициент = расстояние от вершины ÷ высота); шар — круг, сфера — окружность.',
  'Шар радиуса R, плоскость на расстоянии d от центра: в сечении круг радиуса r, где $r^2+d^2=R^2$ (по Пифагору).',
  'Координаты в параллелепипеде с началом в вершине A: (абсцисса ; ордината ; высота — «altitude»). На глобусе: (широта ; долгота), например (30° N ; 60° E); N/S — от экватора, E/O — от гринвичского меридиана.'],
  ex: [['Сечение шара: R = 5, d = 3', 'r^2=5^2-3^2=16;r=4']] });

/* ===================== DICTIONARY ===================== */
gloss('l\'hypoténuse', 'гипотенуза', 'сторона напротив прямого угла, самая длинная');
gloss('le côté adjacent', 'прилежащий катет', 'катет, который образует данный острый угол');
gloss('le côté opposé', 'противолежащий катет', 'катет напротив данного острого угла');
gloss('le cosinus', 'косинус', 'прилежащий катет / гипотенуза');
gloss('le sinus', 'синус', 'противолежащий катет / гипотенуза');
gloss('la tangente', 'тангенс', 'противолежащий катет / прилежащий катет');
gloss('rectangle en A', 'прямоугольный, прямой угол при вершине A');
gloss('isocèle', 'равнобедренный', 'две стороны равны');
gloss('équilatéral', 'равносторонний', 'все три стороны равны');
gloss('la réciproque', 'обратная теорема', 'из вывода теоремы получаем её условие');
gloss('les angles alternes-internes', 'накрест лежащие углы');
gloss('les angles correspondants', 'соответственные углы');
gloss('des points alignés', 'точки на одной прямой');
gloss('l\'inégalité triangulaire', 'неравенство треугольника', 'каждая сторона меньше суммы двух других');
gloss('la symétrie axiale', 'осевая симметрия', 'перегиб по прямой');
gloss('la symétrie centrale', 'центральная симметрия', 'пол-оборота вокруг точки');
gloss('la translation', 'параллельный перенос', 'сдвиг всех точек на один вектор');
gloss('la rotation', 'поворот');
gloss('l\'homothétie', 'гомотетия', 'увеличение или уменьшение относительно центра в k раз');
gloss('le patron', 'развёртка', 'плоская фигура, из которой складывают тело');
gloss('la section', 'сечение', 'фигура, полученная при разрезании тела плоскостью');
gloss('le pavé droit', 'прямоугольный параллелепипед');
gloss('la sphère, la boule', 'сфера, шар', 'сфера — поверхность, шар — тело внутри неё');
gloss('le losange', 'ромб', 'четырёхугольник с четырьмя равными сторонами');
gloss('l\'altitude', 'высота (третья координата)', 'в пространстве: (abscisse ; ordonnée ; altitude)');
