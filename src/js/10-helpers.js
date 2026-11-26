/* ===================== GENERATOR HELPERS ===================== */
function mkRng(seed) {
  let a = seed >>> 0;
  const f = function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  f.ri = (lo, hi) => lo + Math.floor(f() * (hi - lo + 1));
  f.nz = (lo, hi) => { let v; do v = f.ri(lo, hi); while (v === 0); return v; };
  f.pick = arr => arr[Math.floor(f() * arr.length)];
  f.sgn = () => (f() < 0.5 ? -1 : 1);
  f.sh = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  f.distinct = (n, lo, hi, ex = []) => { const out = []; let g = 0; while (out.length < n && g++ < 500) { const v = f.ri(lo, hi); if (!out.includes(v) && !ex.includes(v)) out.push(v); } return out; };
  return f;
}
/* --- strings in input syntax --- */
// coefficient * variable part
function cf(c, v) {
  if (!v) return String(c);
  if (c === 0) return '0';
  if (c === 1) return v;
  if (c === -1) return '-' + v;
  return c + v;
}
function S(...terms) { // join terms with signs, skipping zeros/empties
  let out = '';
  terms.flat().forEach(t => {
    t = String(t);
    if (t === '' || t === '0' || t === '-0') return;
    if (!out) out = t;
    else out += t[0] === '-' ? t : '+' + t;
  });
  return out || '0';
}
function pw(v, e) { if (e === 0) return '1'; if (e === 1) return v; return v + '^' + (e < 0 ? '(' + e + ')' : e); }
function np(n) { return n < 0 ? '(' + n + ')' : String(n); } // number in parens if negative
function br(s) { return '(' + s + ')'; }
function lin(a, b, v = 'x') { return S(cf(a, v), String(b)); }
function quad(a, b, c, v = 'x') { return S(cf(a, pw(v, 2)), cf(b, v), String(c)); }
/* --- 1-var polynomials: arrays low->high --- */
const Pl = {
  mul(A, B) { const r = new Array(A.length + B.length - 1).fill(0); A.forEach((a, i) => B.forEach((b, j) => r[i + j] += a * b)); return Pl.trim(r); },
  add(A, B, s = 1) { const n = Math.max(A.length, B.length); const r = []; for (let i = 0; i < n; i++) r.push((A[i] || 0) + s * (B[i] || 0)); return Pl.trim(r); },
  sc(A, k) { return A.map(a => a * k); },
  pow(A, n) { let r = [1]; for (let i = 0; i < n; i++) r = Pl.mul(r, A); return r; },
  trim(A) { const r = A.slice(); while (r.length > 1 && r[r.length - 1] === 0) r.pop(); return r; },
  str(A, v = 'x') { const t = []; for (let i = A.length - 1; i >= 0; i--) if (A[i]) t.push(cf(A[i], i === 0 ? '' : pw(v, i))); return S(t); },
  // unsimplified list of pairwise products (for working)
  terms(A) { const t = []; for (let i = A.length - 1; i >= 0; i--) if (A[i]) t.push([A[i], i]); return t; },
  nterms(A) { return A.filter(a => a !== 0).length; }
};
function prodWork(A, B, v = 'x') { // A*B term by term, unsimplified string
  const out = [];
  Pl.terms(A).forEach(([a, i]) => Pl.terms(B).forEach(([b, j]) => out.push(cf(a * b, i + j === 0 ? '' : pw(v, i + j)))));
  return S(out);
}
/* --- fractions --- */
function F(n, d = 1) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return { n: n / g, d: d / g }; }
const Fr = {
  add: (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d), sub: (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d),
  mul: (a, b) => F(a.n * b.n, a.d * b.d), div: (a, b) => F(a.n * b.d, a.d * b.n),
  str: a => a.d === 1 ? String(a.n) : (a.n < 0 ? '-' : '') + Math.abs(a.n) + '/' + a.d,
  val: a => a.n / a.d
};
function fstr(n, d = 1) { return Fr.str(F(n, d)); }
/* term c*x where c is a fraction, as input syntax: 3x/4 */
function fterm(f, v) { if (f.n === 0) return '0'; if (f.d === 1) return cf(f.n, v); return (f.n < 0 ? '-' : '') + cf(Math.abs(f.n), v || '') + '/' + f.d; }
/* surd term c*√k */
function surd(c, k) { if (k === 1) return String(c); if (c === 0) return '0'; return cf(c, '√' + k); }
function fsurd(f, k) { if (k === 1) return Fr.str(f); if (f.n === 0) return '0'; if (f.d === 1) return surd(f.n, k); return (f.n < 0 ? '-' : '') + surd(Math.abs(f.n), k) + '/' + f.d; }
const SQFREE = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23];

function fmtBig(numStr) { // add thin spaces in groups of 3
  let [i, d] = numStr.split('.');
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
  if (d) d = d.replace(/(\d{3})(?=\d)/g, '$1\\,');
  return d ? i + '{,}' + d : i;
}
function stdParts(v) { // number -> {a, e}
  if (v === 0) return { a: 0, e: 0 };
  let e = Math.floor(Math.log10(Math.abs(v)));
  let a = +(v / Math.pow(10, e)).toPrecision(10);
  if (Math.abs(a) >= 10) { a = +(a / 10).toPrecision(10); e++; }
  if (Math.abs(a) < 1) { a = +(a * 10).toPrecision(10); e--; }
  return { a, e };
}
function stdStr(v) { const { a, e } = stdParts(v); return a + '*10^' + (e < 0 ? '(' + e + ')' : e); }
function stdTex(v) { const { a, e } = stdParts(v); return String(a).replace('.', '{,}') + '\\times 10^{' + e + '}'; }
function decStr(v) { // exact decimal string for moderately sized numbers
  let s = (+v.toPrecision(12)).toString();
  if (/e/.test(s)) { const { a, e } = stdParts(v); const digits = String(a).replace('.', '').replace('-', ''); if (e < 0) s = (v < 0 ? '-' : '') + '0.' + '0'.repeat(-e - 1) + digits; else s = (v < 0 ? '-' : '') + digits + '0'.repeat(Math.max(0, e - digits.length + 1)); }
  return s;
}
function mcqSh(r, opts, c = 0) { const idx = r.sh(opts.map((_, i) => i)); return { k: 'mcq', opts: idx.map(i => opts[i]), c: idx.indexOf(c) }; }

