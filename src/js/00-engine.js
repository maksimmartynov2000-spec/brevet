/* ===================== ENGINE: parse, evaluate, TeX, compare ===================== */
function MErr(en, ru) { this.en = en; this.ru = ru; this.merr = true; }

function normInput(s) {
  return String(s)
    .replace(/[−–—]/g, '-').replace(/[×·∙⋅]/g, '*').replace(/÷/g, '÷')
    .replace(/[аеkкмортсуxх]/g, c => ({ 'а': 'a', 'е': 'e', 'к': 'k', 'м': 'm', 'о': 'o', 'р': 'p', 'т': 't', 'с': 'c', 'у': 'y', 'х': 'x' }[c] || c)).replace(/[ХX]/g, c => c === 'Х' ? 'X' : c)
    .replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4').replace(/⁵/g, '^5').replace(/⁶/g, '^6').replace(/⁷/g, '^7').replace(/⁸/g, '^8').replace(/⁹/g, '^9').replace(/⁰/g, '^0').replace(/¹/g, '^1').replace(/⁻/g, '^-')
    .replace(/\*\*/g, '^').replace(/\s+/g, ' ').trim();
}

function tokenize(src) {
  const s = normInput(src); const t = []; let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === ' ') { i++; continue; }
    const rest = s.slice(i); let m;
    if ((m = /^(\d+\.?\d*|\.\d+)/.exec(rest))) { t.push({ k: 'n', v: m[0], p: i }); i += m[0].length; continue; }
    if ((m = /^(sqrt|cbrt|root)/i.exec(rest))) { t.push({ k: 'f', v: m[0].toLowerCase(), p: i }); i += m[0].length; continue; }
    if ((m = /^[a-zA-Z]_[a-zA-Z0-9]+/.exec(rest))) { t.push({ k: 'v', v: m[0], p: i }); i += m[0].length; continue; }
    if (/[a-zA-Zρθλη]/.test(ch) || ch === 'Δ') { t.push({ k: 'v', v: ch, p: i }); i++; continue; }
    if (ch === '√') { t.push({ k: 'pre', v: 'sqrt', p: i }); i++; continue; }
    if (ch === '∛') { t.push({ k: 'pre', v: 'cbrt', p: i }); i++; continue; }
    if ('+-*/÷^()=,±:'.includes(ch)) { t.push({ k: 'o', v: ch === ':' ? '÷' : ch, p: i }); i++; continue; }
    if (ch === '[' || ch === '{') { t.push({ k: 'o', v: '(', p: i }); i++; continue; }
    if (ch === ']' || ch === '}') { t.push({ k: 'o', v: ')', p: i }); i++; continue; }
    throw new MErr('Unknown symbol «' + ch + '».', 'Непонятный символ «' + ch + '».');
  }
  return t;
}

function parse(src) {
  const tk = tokenize(src); let p = 0;
  if (!tk.length) throw new MErr('Empty answer.', 'Пустой ответ.');
  const peek = () => tk[p];
  const isO = v => tk[p] && tk[p].k === 'o' && tk[p].v === v;
  const startsPrimary = x => x && (x.k === 'n' || x.k === 'v' || x.k === 'f' || x.k === 'pre' || (x.k === 'o' && x.v === '('));
  function eq() {
    let a = sum();
    while (isO('=')) { p++; a = { t: '=', a, b: sum() }; }
    return a;
  }
  function sum() {
    let a = term();
    while (isO('+') || isO('-')) { const o = tk[p++].v; a = { t: o, a, b: term() }; }
    return a;
  }
  function term() {
    let a = mul();
    while (isO('÷')) { p++; a = { t: '/', a, b: mul(), div: true }; }
    return a;
  }
  function mul() {
    let a = signed();
    while (isO('*') || isO('/')) {
      const o = tk[p++].v;
      const b = signed();
      a = o === '*' ? { t: '*', a, b } : { t: '/', a, b };
    }
    return a;
  }
  function signed() {
    if (isO('-')) { p++; return { t: 'neg', a: signed() }; }
    if (isO('+')) { p++; return signed(); }
    if (isO('±')) { p++; return { t: 'pm', a: signed() }; }
    return imp();
  }
  function imp() {
    let a = pow();
    while (startsPrimary(peek())) {
      const prev = tk[p - 1], nx = peek();
      if (prev.k === 'v' && nx.k === 'n' && (prev.v === 'x' || prev.v === 'X') && tk[p - 2] && tk[p - 2].k === 'n') throw new MErr('To multiply numbers use the × key (or *), not the letter x: ' + tk[p - 2].v + '×' + nx.v + '.', 'Для умножения используй клавишу × (или *), а не букву x: ' + tk[p - 2].v + '×' + nx.v + '.');
      if (prev.k === 'v' && nx.k === 'n') throw new MErr('After the letter ' + prev.v + ' comes a number. For a power use ^ : ' + prev.v + '^' + nx.v + '.', 'После буквы ' + prev.v + ' стоит число. Степень пишут через ^ : ' + prev.v + '^' + nx.v + '.');
      if (prev.k === 'n' && nx.k === 'n') throw new MErr('Two numbers in a row. Put an operation between them.', 'Два числа подряд. Поставь между ними знак действия.');
      if (prev.k === 'o' && prev.v === ')' && nx.k === 'n') throw new MErr('A number right after «)». Use ^ for a power or * to multiply.', 'Число сразу после «)». Для степени — ^, для умножения — *.');
      a = { t: '*', a, b: pow(), imp: true };
    }
    return a;
  }
  function pow() {
    const base = primary();
    if (isO('^')) {
      p++;
      let e;
      if (isO('-')) { p++; e = { t: 'neg', a: pow() }; }
      else if (isO('+')) { p++; e = pow(); }
      else e = pow();
      return { t: '^', a: base, b: e };
    }
    return base;
  }
  function primary() {
    const x = tk[p++];
    if (!x) throw new MErr('The expression ends too early.', 'Выражение обрывается.');
    if (x.k === 'n') return { t: 'n', v: parseFloat(x.v), s: x.v };
    if (x.k === 'v') return { t: 'v', n: x.v };
    if (x.k === 'pre') {
      const nx = peek();
      if (!nx) throw new MErr('Nothing after √.', 'После √ ничего нет.');
      let a;
      if (nx.k === 'o' && nx.v === '(') { p++; a = sum(); if (!isO(')')) throw new MErr('Missing «)».', 'Не хватает «)».'); p++; }
      else a = primary();
      return { t: 'f', f: x.v, a };
    }
    if (x.k === 'f') {
      if (!isO('(')) throw new MErr(x.v + ' needs brackets: ' + x.v + '(…)', 'После ' + x.v + ' нужны скобки: ' + x.v + '(…)');
      p++; const a = sum(); let n = null;
      if (x.v === 'root') { if (!isO(',')) throw new MErr('root(a,n)', 'root(a,n)'); p++; n = sum(); }
      if (!isO(')')) throw new MErr('Missing «)».', 'Не хватает «)».'); p++;
      return { t: 'f', f: x.v, a, n };
    }
    if (x.k === 'o' && x.v === '(') {
      const a = sum();
      if (!isO(')')) throw new MErr('Check the brackets: every «(» needs a «)».', 'Проверь скобки: каждая «(» должна закрываться «)».');
      p++; return { t: 'p', a };
    }
    if (x.k === 'o' && x.v === ')') throw new MErr('Extra «)».', 'Лишняя «)».');
    throw new MErr('Something is missing before «' + x.v + '».', 'Перед «' + x.v + '» чего-то не хватает.');
  }
  const r = eq();
  if (p < tk.length) {
    const x = tk[p];
    if (x.k === 'o' && x.v === ')') throw new MErr('Extra «)».', 'Лишняя «)».');
    if (x.k === 'o' && x.v === ',') throw new MErr('Unexpected comma. For several answers write them like: 3, -3', 'Неожиданная запятая. Несколько ответов пишут так: 3, -3');
    throw new MErr('Cannot read the expression near «' + x.v + '».', 'Не получается прочитать выражение около «' + x.v + '».');
  }
  return r;
}

/* ---------- numeric evaluation ---------- */
function rpow(b, e) {
  if (b >= 0 || Number.isInteger(e)) return Math.pow(b, e);
  for (let q = 1; q <= 30; q++) {
    const pq = e * q;
    if (Math.abs(pq - Math.round(pq)) < 1e-9) {
      if (q % 2 === 1) { const r = -Math.pow(-b, 1 / q); return Math.pow(r, Math.round(pq)); }
      return NaN;
    }
  }
  return NaN;
}
function ev(n, env) {
  switch (n.t) {
    case 'n': return n.v;
    case 'v': { if (!(n.n in env)) return NaN; return env[n.n]; }
    case '+': return ev(n.a, env) + ev(n.b, env);
    case '-': return ev(n.a, env) - ev(n.b, env);
    case '*': return ev(n.a, env) * ev(n.b, env);
    case '/': { const d = ev(n.b, env); return d === 0 ? NaN : ev(n.a, env) / d; }
    case '^': return rpow(ev(n.a, env), ev(n.b, env));
    case 'neg': return -ev(n.a, env);
    case 'pm': return ev(n.a, env);
    case 'p': return ev(n.a, env);
    case 'f': {
      const a = ev(n.a, env);
      if (n.f === 'sqrt') return a < 0 ? NaN : Math.sqrt(a);
      if (n.f === 'cbrt') return Math.cbrt(a);
      if (n.f === 'root') { const k = ev(n.n, env); return rpow(a, 1 / k); }
    }
    case '=': return NaN;
  }
  return NaN;
}
function varsOf(n, s = new Set()) {
  if (!n) return s;
  if (n.t === 'v') s.add(n.n);
  ['a', 'b', 'n'].forEach(k => { if (n[k] && typeof n[k] === 'object') varsOf(n[k], s); });
  return s;
}
function walk(n, fn) { if (!n || typeof n !== 'object') return; fn(n); ['a', 'b', 'n'].forEach(k => { if (n[k] && typeof n[k] === 'object') walk(n[k], fn); }); }
function strip(n) { while (n && (n.t === 'p')) n = n.a; return n; }

let _eqRng = 12345;
function _r() { _eqRng = (_eqRng * 1103515245 + 12345) % 2147483648; return _eqRng / 2147483648; }
function close(a, b, rel = 1e-8) { return Math.abs(a - b) <= rel * Math.max(1, Math.abs(a), Math.abs(b)); }
function equiv(A, B, vars) {
  vars = vars || [...new Set([...varsOf(A), ...varsOf(B)])];
  let good = 0;
  for (let k = 0; k < 40 && good < 7; k++) {
    const env = {};
    vars.forEach(v => env[v] = 0.55 + _r() * 3.1);
    const a = ev(A, env), b = ev(B, env);
    if (!isFinite(a) || !isFinite(b)) { if (isFinite(a) !== isFinite(b) && k > 30) return false; continue; }
    if (!close(a, b, 1e-7)) return false;
    good++;
  }
  return good >= 3;
}

/* ---------- TeX ---------- */
const GREEK = { 'ρ': '\\rho ', 'θ': '\\theta ', 'λ': '\\lambda ', 'η': '\\eta ', 'Δ': '\\Delta ' };
/* French and Russian write decimals with a comma: 3,5 */
function texNum(s) { return String(s).replace('.', '{,}'); }
function tex(n) {
  switch (n.t) {
    case 'n': return texNum(n.s != null ? n.s : n.v);
    case 'v': return GREEK[n.n] || (n.n.includes('_') ? n.n.replace(/_(.+)$/, '_{$1}') : n.n);
    case '+': return tex(n.a) + '+' + tex(n.b);
    case '-': return tex(n.a) + '-' + tex(n.b);
    case '*': {
      const a = tex(n.a), b = tex(n.b);
      if (n.imp) {
        const bl = firstLeaf(n.b);
        if (bl && bl.t === 'n' && lastIsNumLike(n.a)) return a + '\\cdot ' + b;
        return a + (/\\[a-zA-Z]+$/.test(a) && /^[a-zA-Z]/.test(b) ? ' ' : '') + b;
      }
      return a + '\\times ' + b;
    }
    case '/': return n.div ? tex(n.a) + '\\div ' + tex(n.b) : '\\dfrac{' + tex(strip(n.a)) + '}{' + tex(strip(n.b)) + '}';
    case '^': {
      let a = tex(n.a);
      const A = n.a;
      if (A.t === '/' && !A.div || A.t === 'f' || A.t === 'neg') a = '\\left(' + a + '\\right)';
      return '{' + a + '}^{' + tex(strip(n.b)) + '}';
    }
    case 'neg': return '-' + tex(n.a);
    case 'pm': return '\\pm ' + tex(n.a);
    case 'p': if (n.a.t === '/' && !n.a.div && n.a.a.t === 'n' && n.a.b.t === 'n') return '\\tfrac{' + tex(n.a.a) + '}{' + tex(n.a.b) + '}'; return '\\left(' + tex(n.a) + '\\right)';
    case 'f': {
      const a = tex(strip(n.a));
      if (n.f === 'sqrt') return '\\sqrt{' + a + '}';
      if (n.f === 'cbrt') return '\\sqrt[3]{' + a + '}';
      return '\\sqrt[' + tex(n.n) + ']{' + a + '}';
    }
    case '=': return tex(n.a) + '=' + tex(n.b);
  }
  return '?';
}
function firstLeaf(n) { while (n && (n.t === '*' || n.t === '^' || n.t === '/' && !n.div)) n = n.a; return n; }
function lastIsNumLike(n) { while (n && (n.t === '*' || n.t === '/')) n = n.b; return n && (n.t === 'n' || n.t === '^'); }
/* math in my syntax -> TeX (safe) */
function M(s) {
  try { return tex(parse(s)); } catch (e) { return '\\text{' + String(s).replace(/[{}\\]/g, '') + '}'; }
}

/* ---------- polynomials (multivariate, float coeffs) ---------- */
function pKey(mono) { return Object.keys(mono).filter(k => mono[k]).sort().map(k => k + (mono[k] > 1 ? '^' + mono[k] : '')).join('*'); }
function pParse(key) { const m = {}; if (!key) return m; key.split('*').forEach(t => { const [v, e] = t.split('^'); m[v] = e ? +e : 1; }); return m; }
function pConst(c) { const P = new Map(); if (Math.abs(c) > 1e-12) P.set('', c); return P; }
function pAdd(A, B, s = 1) { const P = new Map(A); B.forEach((c, k) => { const v = (P.get(k) || 0) + s * c; if (Math.abs(v) < 1e-9) P.delete(k); else P.set(k, v); }); return P; }
function pMul(A, B) {
  let P = new Map();
  A.forEach((ca, ka) => B.forEach((cb, kb) => {
    const m = pParse(ka), mb = pParse(kb); Object.keys(mb).forEach(v => m[v] = (m[v] || 0) + mb[v]);
    const k = pKey(m); const v = (P.get(k) || 0) + ca * cb;
    if (Math.abs(v) < 1e-9) P.delete(k); else P.set(k, v);
  }));
  return P;
}
function pDeg(P) { let d = 0; P.forEach((c, k) => { const m = pParse(k); d = Math.max(d, Object.values(m).reduce((s, x) => s + x, 0)); }); return d; }
function isConstNode(n) { return varsOf(n).size === 0; }
function toPoly(n) {
  switch (n.t) {
    case 'n': return pConst(n.v);
    case 'v': return new Map([[n.n, 1]]);
    case 'p': case 'pm': return toPoly(n.a);
    case 'neg': { const a = toPoly(n.a); return a && pAdd(new Map(), a, -1); }
    case '+': case '-': { const a = toPoly(n.a), b = toPoly(n.b); return a && b && pAdd(a, b, n.t === '+' ? 1 : -1); }
    case '*': { const a = toPoly(n.a), b = toPoly(n.b); return a && b && pMul(a, b); }
    case '/': { if (!isConstNode(n.b)) return null; const d = ev(n.b, {}); const a = toPoly(n.a); if (!a || !d) return null; return pMul(a, pConst(1 / d)); }
    case '^': {
      if (!isConstNode(n.b)) return null;
      const e = ev(n.b, {});
      if (isConstNode(n.a)) return pConst(rpow(ev(n.a, {}), e));
      if (!(Number.isInteger(e) && e >= 0 && e <= 12)) return null;
      const a = toPoly(n.a); if (!a) return null;
      let P = pConst(1); for (let i = 0; i < e; i++) P = pMul(P, a); return P;
    }
    case 'f': return isConstNode(n) ? pConst(ev(n, {})) : null;
  }
  return null;
}
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
function polyContent(P) {
  let g = 0, allInt = true;
  P.forEach(c => { if (Math.abs(c - Math.round(c)) > 1e-9) allInt = false; else g = gcd(g, Math.round(c)); });
  return allInt ? g : 1;
}

/* top-level additive terms */
function addTerms(n, out = [], sign = 1) {
  n = strip(n);
  if (n.t === '+') { addTerms(n.a, out, sign); addTerms(n.b, out, sign); }
  else if (n.t === '-') { addTerms(n.a, out, sign); addTerms(n.b, out, -sign); }
  else out.push(n);
  return out;
}
/* multiplicative factors (with multiplicity) */
function mulFactors(n, out = []) {
  n = strip(n);
  if (n.t === 'neg') return mulFactors(n.a, out);
  if (n.t === '*') { mulFactors(n.a, out); mulFactors(n.b, out); return out; }
  if (n.t === '^' && !isConstNode(n.a) && isConstNode(n.b)) {
    const e = ev(n.b, {});
    if (Number.isInteger(e) && e > 0 && e < 10) { for (let i = 0; i < e; i++) mulFactors(n.a, out); return out; }
  }
  out.push(n); return out;
}
function hasSumInside(n) { let r = false; walk(n, x => { if (x.t === '+' || x.t === '-') r = true; }); return r; }

/* ---------- integer helpers ---------- */
function squareFreeSplit(n) { // n = k^2 * m
  let k = 1, m = n;
  for (let d = 2; d * d <= m; d++) while (m % (d * d) === 0) { m /= d * d; k *= d; }
  return [k, m];
}
function isIntStr(s) { return /^-?\d+$/.test(s); }

