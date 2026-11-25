/* ===================== GRADING ===================== */
/* messages of the checker are shown in Russian only (the interface language) */
const GM = (en, ru) => ({ ru });
function numOk(s) { return /^-?\d+(\.\d+)?$/.test(s); }
function cleanAns(s) { return normInput(s).replace(/\s+/g, ' '); }
function stripLhs(s, v) {
  const m = /^\s*([a-zA-Z])\s*=(.*)$/.exec(s);
  if (m && (!v || m[1] === v)) return m[2];
  return s;
}

/* ---- form checks: return null (fine) or message ---- */
const FORMS = {
  // expanded and like terms collected
  expanded(ast, raw, spec) {
    const terms = addTerms(ast);
    for (const t of terms) {
      let bad = false;
      walk(t, x => {
        if (x.t === '*' && (hasSumInside(strip(x.a)) || hasSumInside(strip(x.b)))) bad = true;
        if (x.t === '^' && hasSumInside(x.a)) bad = true;
        if (x.t === 'neg' && hasSumInside(x.a)) bad = true;
        if (x.t === '/' && hasSumInside(x.a) && !spec.fracOk) bad = true;
      });
      if (bad) return GM('Correct value, but the brackets are not fully expanded.', 'Значение верное, но скобки раскрыты не до конца.');
    }
    if (spec.nt) {
      if (terms.length > spec.nt) return GM('Correct, but like terms are not collected. Simplify further.', 'Верно, но подобные слагаемые не приведены. Упрости дальше.');
    } else {
      const P = toPoly(ast);
      if (P && terms.length > P.size) return GM('Correct, but like terms are not collected. Simplify further.', 'Верно, но подобные слагаемые не приведены. Упрости дальше.');
    }
    return null;
  },
  factorised(ast, raw, spec) {
    const top = strip(ast);
    const fs = mulFactors(top);
    const nonc = fs.filter(f => !isConstNode(f));
    if (nonc.length === 0 || (nonc.length === 1 && addTerms(top).length > 1 && (spec.nf || 1) > 1)) return GM('Correct value, but it is not written as a product. Factorise it.', 'Значение верное, но это не произведение. Разложи на множители.');
    if (addTerms(top).length > 1) return GM('Correct value, but it is not written as a product. Factorise it.', 'Значение верное, но это не произведение. Разложи на множители.');
    if (spec.nf && nonc.length < spec.nf) return GM('Not fully factorised: one of the brackets can be factorised further.', 'Разложено не до конца: одну из скобок можно разложить дальше.');
    for (const f of nonc) {
      const P = toPoly(f);
      if (P && P.size > 1 && polyContent(P) > 1) return GM('Not fully factorised: a bracket still has a common factor ' + polyContent(P) + '.', 'Разложено не до конца: в скобке остался общий множитель ' + polyContent(P) + '.');
    }
    return null;
  },
  // simplest surd form: no sqrt(k^2 m), no sqrt of fraction, no surd in denominator
  surd(ast) {
    let msg = null;
    walk(ast, x => {
      if (msg) return;
      if (x.t === 'f' && x.f === 'sqrt' && isConstNode(x.a)) {
        const a = strip(x.a);
        if (a.t === 'n' && Number.isInteger(a.v)) {
          const [k, m] = squareFreeSplit(a.v);
          if (k > 1) msg = GM('Not in simplest surd form: √' + a.v + ' = ' + (m === 1 ? k : k + '√' + m) + '.', 'Не в простейшем виде: √' + a.v + ' = ' + (m === 1 ? k : k + '√' + m) + '.');
        } else if (a.t === '/') msg = GM('Do not leave a fraction under the root.', 'Не оставляй дробь под корнем.');
      }
      if (x.t === '/' && !x.div) { let s = false; walk(x.b, y => { if (y.t === 'f') s = true; }); if (s) msg = GM('Correct value, but rationalise the denominator (no root in the denominator).', 'Значение верное, но избавься от корня в знаменателе.'); }
      if (x.t === '^' && x.a && strip(x.a).t === 'f') msg = GM('Simplify the power of the root.', 'Упрости степень корня.');
    });
    return msg;
  },
  // a + b√k form
  abSurd(ast, raw, spec) {
    const terms = addTerms(ast);
    if (terms.length > 2) return GM('Write it as a + b√' + spec.rk + ' (two terms).', 'Запиши в виде a + b√' + spec.rk + ' (два слагаемых).');
    for (const t of terms) { if (hasSumInside(t)) return GM('Write it as a + b√' + spec.rk + ' (two terms).', 'Запиши в виде a + b√' + spec.rk + '.'); }
    return FORMS.surd(ast);
  },
  // exponent-law simplification: each base once, single coefficient
  powsimp(ast, raw, spec) {
    const cnt = {}; let bad = null;
    walk(ast, x => { if (x.t === 'v') cnt[x.n] = (cnt[x.n] || 0) + 1; });
    const exps = new Set(); walk(ast, x => { if (x.t === '^') walk(x.b, y => { if (y.t === 'v') exps.add(y); }); });
    for (const v in cnt) if (cnt[v] > 1) return GM('Correct value, but ' + v + ' appears more than once. Combine the powers of ' + v + '.', 'Значение верное, но ' + v + ' встречается несколько раз. Объедини степени ' + v + '.');
    walk(ast, x => {
      if (x.t === '^') {
        const b = strip(x.a);
        if (b.t === '*' || b.t === '/' || b.t === '^' || b.t === 'neg') bad = GM('Correct value, but a bracket is still raised to a power. Expand it.', 'Значение верное, но скобка ещё в степени. Раскрой её.');
        if (isConstNode(x.b) && ev(x.b, {}) === 0) bad = GM('Use a⁰ = 1.', 'Используй a⁰ = 1.');
        if (isConstNode(x.b) && ev(x.b, {}) === 1) bad = GM('Write a¹ simply as a.', 'a¹ пишут просто a.');
        if (spec.noNeg && isConstNode(x.b) && ev(x.b, {}) < 0) bad = GM('Correct value, but no negative exponents are allowed in the answer. Use a⁻ⁿ = 1/aⁿ.', 'Значение верное, но в ответе не должно быть отрицательных степеней: a⁻ⁿ = 1/aⁿ.');
        if (isConstNode(x.a) && isConstNode(x.b) && !spec.keepNumPow) bad = GM('Evaluate the numerical power.', 'Вычисли числовую степень.');
      }
    });
    if (bad) return bad;
    // numeric coefficients: at most one in numerator and one in denominator
    { let top = strip(ast); if (top.t === 'neg') top = strip(top.a);
      let N = top, D = null; if (top.t === '/' && !top.div) { N = top.a; D = top.b; }
      const cN = mulFactors(N).filter(isConstNode), cD = D ? mulFactors(D).filter(isConstNode) : [];
      if (cN.length > 1 || cD.length > 1) return GM('Correct value, but multiply the numbers together.', 'Значение верное, но перемножь числа.');
      if (cN.length && cD.length) { const a = ev(cN[0], {}), b = ev(cD[0], {}); if (Number.isInteger(a) && Number.isInteger(b) && gcd(a, b) > 1) return GM('Correct value, but cancel the numbers.', 'Значение верное, но сократи числа.'); }
    }
    if (spec.noNeg) { let negE = false; walk(ast, x => { if (x.t === '^' && strip(x.b).t === 'neg') negE = true; }); if (negE) return GM('No negative exponents in the answer.', 'В ответе не должно быть отрицательных степеней.'); }
    return null;
  },
  // single simplified algebraic fraction with given numerator/denominator degrees
  frac(ast, raw, spec) {
    let n = strip(ast);
    if (n.t === 'neg') n = strip(n.a);
    let N = n, D = null;
    if (n.t === '/' ) { N = n.a; D = n.b; }
    else if (addTerms(n).length > 1) {
      if (spec.dD > 0) return GM('Correct value, but write it as a single fraction.', 'Значение верное, но запиши одной дробью.');
    }
    if (D) {
      const fsN = mulFactors(N);
      for (const f of fsN) if (strip(f).t === '/') return GM('Write it as a single fraction.', 'Запиши одной дробью.');
    }
    const PN = toPoly(N), PD = D ? toPoly(D) : pConst(1);
    if (!PN || !PD) return GM('Write it as one fraction: (polynomial)/(polynomial).', 'Запиши одной дробью: многочлен / многочлен.');
    if (spec.dN != null && (pDeg(PN) > spec.dN || pDeg(PD) > spec.dD)) return GM('Correct value, but the fraction is not fully simplified: cancel common factors.', 'Значение верное, но дробь не сокращена до конца: сократи общие множители.');
    let g = 0, allInt = true;
    [PN, PD].forEach(P => P.forEach(c => { if (Math.abs(c - Math.round(c)) > 1e-9) allInt = false; else g = gcd(g, Math.round(c)); }));
    if (allInt && g > 1 && D) return GM('Correct, but numerator and denominator have a common factor ' + g + '. Cancel it.', 'Верно, но у числителя и знаменателя есть общий множитель ' + g + '. Сократи.');
    if (!allInt && D) return GM('Use whole numbers in the numerator and denominator.', 'Используй целые числа в числителе и знаменателе.');
    return null;
  },
  twoParts(ast) {
    const t = addTerms(ast);
    if (t.length !== 2) return GM('Write it as a sum of two parts.', 'Запиши как сумму двух частей.');
    for (const x of t) { const s = strip(x); if (s.t === '/' && hasSumInside(s.a)) return GM('Each part must be a single term.', 'Каждая часть — одно слагаемое.'); }
    return null;
  },
  noRoot(ast) { let r = false; walk(ast, x => { if (x.t === 'f') r = true; }); return r ? GM('Write it in exponent form (no root signs).', 'Запиши в виде степени (без знака корня).') : null; },
  powOf(ast, raw, spec) {
    const n = strip(ast);
    if (n.t === '^' && strip(n.a).t === 'n' && strip(n.a).v === spec.base && isConstNode(n.b)) return null;
    if (n.t === 'n' && n.v === spec.base) return null;
    return GM('Write it as a single power of ' + spec.base + ': ' + spec.base + '^(…).', 'Запиши как одну степень числа ' + spec.base + ': ' + spec.base + '^(…).');
  },
  primeBases(ast, raw, spec) {
    let bad = null;
    (function go(n, inExp) {
      if (!n || typeof n !== 'object') return;
      if (n.t === 'n' && !inExp && ![2, 3, 5].includes(n.v) && n.v !== 1) bad = GM('Use only powers of 2, 3 and 5 (e.g. 2^(-5)).', 'Используй только степени 2, 3 и 5 (например 2^(-5)).');
      if (n.t === '^') { go(n.a, inExp); go(n.b, true); return; }
      if (n.t === 'f') bad = GM('No root signs.', 'Без корней.');
      ['a', 'b'].forEach(k => go(n[k], inExp));
    })(ast, false);
    if (!bad) { let d = false; walk(ast, x => { if (x.t === '/' && !x.div) d = true; }); if (d) bad = GM('Use negative exponents instead of a fraction.', 'Вместо дроби используй отрицательные степени.'); }
    return bad;
  }
};

/* ---- numeric answer forms ---- */
function parseMixed(s) { const m = /^(-?)(\d+) (\d+)\/(\d+)$/.exec(s.trim()); if (!m) return null; const v = (+m[2] + (+m[3]) / (+m[4])); return m[1] ? -v : v; }
function sigFigs(s) {
  s = s.replace(/^-/, '');
  if (!/^\d*\.?\d+$/.test(s) && !/^\d+\.$/.test(s)) return null;
  if (s.includes('.')) { const d = s.replace('.', '').replace(/^0+/, ''); return d.length; }
  return s.replace(/^0+/, '').replace(/0+$/, '').length || 1;
}
function roundSF(v, n) { if (v === 0) return 0; const k = Math.pow(10, n - 1 - Math.floor(Math.log10(Math.abs(v)))); return Math.round(v * k) / k; }
function parseStd(s) {
  const m = /^(-?)(\d+(?:\.\d+)?)\s*\*\s*10\s*\^\s*\(?\s*(-?\d+)\s*\)?$/.exec(s.replace(/\s+/g, ''));
  if (m) return { a: +m[2] * (m[1] ? -1 : 1), e: +m[3], aStr: m[2] };
  const m2 = /^10\^\(?(-?\d+)\)?$/.exec(s.replace(/\s+/g, ''));
  if (m2) return { a: 1, e: +m2[1], aStr: '1' };
  return null;
}

/* evaluate a numeric string (allow mixed numbers) */
function numVal(s) {
  const mx = parseMixed(s); if (mx != null) return { v: mx, ast: null, mixed: true };
  const ast = parse(s);
  if (varsOf(ast).size) return { v: NaN, ast, vars: true };
  return { v: ev(ast, {}), ast };
}

/* physics-style numeric answer: tolerant to rounding, catches unit slips */
function gradeApprox(spec, raw, v, K) {
  if (!isFinite(v)) return R_NO();
  const rel = Math.abs(v - K) / Math.max(Math.abs(K), 1e-12);
  if (rel <= (spec.tol || 0.006)) return R_OK();
  if (K !== 0) {
    for (const t of spec.traps || []) if (Math.abs(v - t[0]) <= 0.006 * Math.max(Math.abs(t[0]), 1e-12)) return R_NO(t[1], { near: true });
    const q = v / K;
    for (const [f, en, ru] of [[1000, 'a factor of 1000', 'в 1000 раз'], [0.001, 'a factor of 1000', 'в 1000 раз'], [100, 'a factor of 100', 'в 100 раз'], [0.01, 'a factor of 100', 'в 100 раз'], [1e6, 'a factor of a million', 'в миллион раз'], [1e-6, 'a factor of a million', 'в миллион раз'], [1e4, 'a factor of 10 000', 'в 10 000 раз'], [1e-4, 'a factor of 10 000', 'в 10 000 раз'], [60, 'a factor of 60', 'в 60 раз'], [1 / 60, 'a factor of 60', 'в 60 раз'], [3600, 'a factor of 3600', 'в 3600 раз'], [1 / 3600, 'a factor of 3600', 'в 3600 раз']])
      if (Math.abs(q / f - 1) < 0.006) return R_NO(GM('Your number is off by ' + en + ' — check the units (g → kg, cm → m, km → m, kJ → J, minutes → s…).', 'Ответ отличается ' + ru + ' — проверь единицы (г → кг, см → м, км → м, кДж → Дж, минуты → с…).'), { near: true });
    if (Math.abs(q + 1) < 0.006) return R_NO(GM('Almost: the sign (direction) is wrong.', 'Почти: ошибка в знаке (направлении).'), { near: true });
    if (rel < 0.03) return R_NO(GM('Close — check your rounding or the value of g used.', 'Близко — проверь округление или значение g.'), { near: true });
  }
  return R_NO();
}

/* ---- main grading ---- */
const R_OK = (msg) => ({ ok: true, msg: msg || null });
const R_NO = (msg, extra) => Object.assign({ ok: false, msg: msg || null }, extra || {});

/* In number-only answers, accept common ways of writing: x or х for ×, decimal comma, spaces in thousands, 3.5e4 */
function numCandidates(raw, isList) {
  let a = raw.replace(/\s*[xXхХ]\s*(?=\d)/g, (m, i) => /\d\s*$/.test(raw.slice(0, i)) || /\)\s*$/.test(raw.slice(0, i)) ? '*' : m)
    .replace(/(\d)\s*[eE]\s*([-+]?\d+)\b/g, '$1*10^($2)')
    .replace(/(\d) (?=\d{3}(?!\d))/g, '$1');
  const out = [a];
  if (/\d,\d/.test(a)) {
    if (!isList || !/,\s/.test(a)) out.push(a.replace(/(\d),(\d)/g, '$1.$2'));
    if (!isList && /^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(a)) out.push(a.replace(/,/g, ''));
  }
  return [...new Set(out)];
}
function bestOf(cands, f) { let first = null; for (const c of cands) { let g; try { g = f(c); } catch (e) { if (e && e.merr) g = R_NO(GM(e.en, e.ru), { syntax: true }); else throw e; } if (g.ok) return g; if (!first || (first.syntax && !g.syntax)) first = g; } return first; }
/* forgiving input for plain numbers: "$18", "70%", "28 m²", "- 27" and "7 / 20" mean what they look like */
const reEsc = t => String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function numTidy(spec, input) {
  let s = String(input);
  if (spec.pre) s = s.replace(new RegExp('^\\s*' + reEsc(spec.pre) + '\\s*|\\s*' + reEsc(spec.pre) + '\\s*$', 'g'), '');
  if (spec.unit && !spec.uin) { const u = String(spec.unit); for (const v of [u, u.replace(/²/g, '2').replace(/³/g, '3'), u.replace(/²/g, '^2').replace(/³/g, '^3')]) { const t = s.replace(new RegExp('\\s*' + reEsc(v) + '\\s*$'), ''); if (t !== s && /\d\s*$/.test(t)) { s = t; break; } } }
  return s.replace(/^\s*([-−–])\s+(?=[\d.])/, '$1').replace(/(\d)\s*\/\s*(\d)/g, '$1/$2');
}
function grade(spec, input) {
  if (spec.k === 'num' && input != null) input = numTidy(spec, input);
  const raw = cleanAns(input || '');
  if (spec.k === 'mcq') { if (input == null || input === '') return R_NO(GM('Choose an option.', 'Выбери вариант.'), { empty: true }); return +input === spec.c ? R_OK() : R_NO(); }
  if (spec.k === 'self') return R_NO(null, { self: true });
  if (spec.k === 'order') return gradeOrder(spec, input);
  if (spec.k === 'time') return gradeTime(spec, input);
  if (spec.k === 'dur') return gradeDur(spec, input);
  if (spec.k === 'ratio') return gradeRatio(spec, input);
  if (spec.k === 'list') return gradeList(spec, input);
  if (!raw) return R_NO(GM('Type your answer.', 'Введи ответ.'), { empty: true });
  try {
    if (spec.k === 'expr') return gradeExpr(spec, raw);
    if (spec.k === 'num') return bestOf(numCandidates(raw, false), c => gradeNum(spec, c));
    if (spec.k === 'sol') return bestOf(numCandidates(raw, true), c => gradeSol(spec, c));
    if (spec.k === 'subj') return gradeSubj(spec, raw);
  } catch (e) {
    if (e && e.merr) return R_NO(GM(e.en, e.ru), { syntax: true });
    throw e;
  }
  return R_NO();
}

function gradeExpr(spec, raw) {
  if (spec.none && /^(none|no|not possible|cannot|impossible|нельзя|-)$/i.test(raw)) return spec.key === 'NONE' ? R_OK() : R_NO(GM('It can be factorised.', 'Это можно разложить.'));
  if (spec.key === 'NONE') { const a = parse(raw); return R_NO(GM('Check by expanding: does it give the original expression?', 'Проверь, раскрыв скобки: получается ли исходное выражение?')); }
  let s = raw;
  if (/=/.test(s)) s = stripLhs(s);
  const A = parse(s), K = parse(spec.key);
  const vA = varsOf(A), vK = varsOf(K);
  const extra = [...vA].filter(v => !vK.has(v) && !(spec.vars || []).includes(v));
  if (extra.length) { if (extra.includes('x') && /\dx\d|\d x \d|\dx \d|\d xd/.test(raw)) return R_NO(GM('The letter x is a variable here. To multiply, use the × key (or *).', 'Буква x здесь — переменная. Для умножения используй клавишу × (или *).'), { near: true }); return R_NO(GM('Your answer contains ' + extra.join(', ') + ', which is not in the question.', 'В ответе есть ' + extra.join(', ') + ', которой нет в задании.')); }
  let same = equiv(A, K);
  if (!same && spec.anySign) same = equiv({ t: 'neg', a: A }, K);
  if (!same) {
    if (equiv({ t: 'neg', a: A }, K)) return R_NO(GM('Almost: the sign is wrong.', 'Почти: ошибка в знаке.'));
    return R_NO();
  }
  for (const f of spec.forms || []) { const m = FORMS[f](A, raw, spec); if (m) return R_NO(m, { near: true }); }
  return R_OK();
}

function gradeNum(spec, raw) {
  const K = numVal(spec.key).v;
  const forms = spec.forms || [];
  if (forms.includes('std')) {
    const st = parseStd(raw);
    let val; try { val = numVal(raw).v; } catch (e) { val = NaN; }
    if (!st) {
      if (isFinite(val) && close(val, K, 1e-9)) return R_NO(GM('Correct value, but write it in standard form: a × 10^n with 1 ≤ a < 10.', 'Значение верное, но запиши в стандартном виде: a × 10^n, где 1 ≤ a < 10.'), { near: true });
      return R_NO(GM('Use the form a × 10^n (type 3.5*10^4).', 'Форма a × 10^n (набери 3.5*10^4).'));
    }
    const v = st.a * Math.pow(10, st.e);
    if (!close(v, K, 1e-9)) return R_NO();
    if (Math.abs(st.a) < 1 || Math.abs(st.a) >= 10) return R_NO(GM('Correct value, but in standard form 1 ≤ a < 10.', 'Значение верное, но в стандартном виде 1 ≤ a < 10.'), { near: true });
    return R_OK();
  }
  const nv = numVal(raw);
  if (nv.vars) return R_NO(GM('The answer should be a number.', 'Ответ должен быть числом.'));
  const v = nv.v;
  if (spec.dp != null || spec.sf != null) return gradeRound(spec, raw, v);
  if (forms.includes('approx')) return gradeApprox(spec, raw, v, K);
  const SF = forms.includes('sf3') || forms.includes('sf2'); const NSF = forms.includes('sf2') ? 2 : 3;
  if (SF || forms.includes('dp3')) {
    const target = SF ? roundSF(K, NSF) : Math.round(K * 1000) / 1000;
    if (!numOk(raw)) { if (isFinite(v) && close(v, K, 1e-6)) return R_NO(GM('Give a decimal rounded ' + (SF ? 'to ' + NSF + ' significant figures.' : 'to 3 decimal places.'), 'Дай десятичное число, округлённое ' + (SF ? 'до 3 значащих цифр.' : 'до 3 знаков после запятой.')), { near: true }); return R_NO(); }
    if (close(v, target, 1e-9)) {
      if (SF) { const sf = sigFigs(raw); if (sf != null && sf !== NSF && !(sf < NSF && close(target, v, 1e-12) && Number.isInteger(v))) return R_NO(GM('Correct, but give exactly ' + NSF + ' significant figures.', 'Верно, но дай ровно ' + NSF + ' значащие цифры.'), { near: true }); }
      if (forms.includes('dp3')) { const dp = (raw.split('.')[1] || '').length; if (dp !== 3) return R_NO(GM('Correct, but give exactly 3 decimal places.', 'Верно, но дай ровно 3 знака после запятой.'), { near: true }); }
      return R_OK();
    }
    if (Math.abs(v - K) < Math.abs(K) * 0.01) return R_NO(GM('Close — check your rounding.', 'Близко — проверь округление.'), { near: true });
    return R_NO();
  }
  if (!isFinite(v)) return R_NO();
  if (!close(v, K, 1e-9)) {
    if (Math.abs(v - K) < 1e-3 * Math.max(1, Math.abs(K))) return R_NO(GM('Close, but give the exact value (a fraction, not a rounded decimal).', 'Близко, но нужно точное значение (дробь, а не округлённая десятичная).'), { near: true });
    if (close(v, -K, 1e-9)) return R_NO(GM('Almost: the sign is wrong.', 'Почти: ошибка в знаке.'));
    return R_NO();
  }
  // value correct — check form
  const isPlain = numOk(raw) || /^-?\d+\/\d+$/.test(raw) || nv.mixed || /^-?\(?\d+\)?\/\(?-?\d+\)?$/.test(raw);
  if (!isPlain && !forms.includes('any')) return R_NO(GM('Correct value, but finish the calculation: give a single number.', 'Значение верное, но доведи вычисление до конца: дай одно число.'), { near: true });
  if (spec.noMixed && nv.mixed) return R_NO(GM('Right value, but write it as one fraction a/b, not as a mixed number.', 'Значение верное, но запиши одной дробью a/b, а не смешанным числом.'), { near: true });
  if (spec.dec && /\//.test(raw)) return R_NO(GM('Right value, but write it as a decimal.', 'Значение верное, но запиши десятичной дробью.'), { near: true });
  if (forms.includes('frac') && raw.includes('.')) return R_NO(GM('Correct value, but give it as a fraction, not a decimal.', 'Значение верное, но дай ответ дробью, а не десятичной.'), { near: true });
  const fm = /^(-?)(\d+)\/(\d+)$/.exec(raw.replace(/ /g, '')) || (nv.mixed ? /(\d+)\/(\d+)$/.exec(raw) && [0, '', /(\d+)\/(\d+)$/.exec(raw)[1], /(\d+)\/(\d+)$/.exec(raw)[2]] : null);
  if (fm && gcd(+fm[2], +fm[3]) > 1) return R_NO(GM('Correct, but simplify the fraction.', 'Верно, но сократи дробь.'), { near: true });
  if (fm && +fm[3] === 1) return R_NO(GM('Write it as a whole number.', 'Запиши целым числом.'), { near: true });
  if (forms.includes('mixed') && !nv.mixed && Math.abs(K) > 1 && !Number.isInteger(K)) return R_NO(GM('Correct, but write it as a mixed number, e.g. 2 1/8 (with a space).', 'Верно, но запиши смешанным числом, например 2 1/8 (через пробел).'), { near: true });
  return R_OK();
}

function splitList(raw) {
  return raw.split(/\s*(?:,|;|\bor\b|\band\b|\bou\b|\bet\b|\bили\b|\bи\b)\s*/i).map(s => s.trim()).filter(Boolean);
}
function solValues(str, v) {
  const out = [];
  for (let item of splitList(str)) {
    item = stripLhs(item, null);
    if (item.includes('±')) { [item.replace('±', ''), '-(' + item.replace('±', '') + ')'].forEach(x => out.push({ s: item.replace('±', ''), v: ev(parse(x), {}), ast: parse(item.replace('±', '')) })); }
    else { const a = parse(item); if (varsOf(a).size) throw new MErr('Each solution should be a number (like x = 5).', 'Каждое решение должно быть числом (например x = 5).'); out.push({ s: item, v: ev(a, {}), ast: a }); }
  }
  return out;
}
function gradeSol(spec, raw) {
  const S = solValues(raw), K = solValues(spec.key);
  const forms = spec.forms || [];
  const usedS = new Array(S.length).fill(false);
  let matched = 0;
  const sf = forms.includes('sf3');
  for (const k of K) {
    const tgt = sf ? roundSF(k.v, 3) : k.v;
    const i = S.findIndex((s, j) => !usedS[j] && close(s.v, tgt, sf ? 1e-9 : 1e-9));
    if (i >= 0) { usedS[i] = true; matched++; }
  }
  const extra = usedS.filter(u => !u).length;
  if (matched === K.length && extra === 0) {
    for (const s of S) {
      if (sf) { if (!numOk(s.s)) return R_NO(GM('Give decimals rounded to 3 significant figures.', 'Дай десятичные числа с 3 значащими цифрами.'), { near: true }); const n = sigFigs(s.s); if (n != null && n !== 3) return R_NO(GM('Correct, but give exactly 3 significant figures.', 'Верно, но дай ровно 3 значащие цифры.'), { near: true }); }
      for (const f of forms) if (FORMS[f]) { const m = FORMS[f](s.ast, s.s, spec); if (m) return R_NO(m, { near: true }); }
      if (!sf && s.s.includes('.') && !Number.isInteger(s.v) && forms.includes('frac')) return R_NO(GM('Give the exact value as a fraction.', 'Дай точное значение дробью.'), { near: true });
    }
    return R_OK();
  }
  if (matched === K.length - 1 && K.length === 2 && extra === 0 && S.length === 1) return R_NO(GM('One solution is correct, but there is another one. (x² = a has two solutions: ±√a.)', 'Одно решение верно, но есть ещё одно. (x² = a имеет два решения: ±√a.)'), { near: true });
  if (matched === K.length && extra > 0) return R_NO(GM('Too many solutions: some of yours do not satisfy the equation.', 'Лишние решения: некоторые не удовлетворяют уравнению.'));
  // close but not exact
  if (!sf && S.length === K.length && S.every((s, i) => K.some(k => Math.abs(k.v - s.v) < 2e-3 * Math.max(1, Math.abs(k.v))))) return R_NO(GM('Close, but give the exact value (fraction or surd).', 'Близко, но нужно точное значение (дробь или корень).'), { near: true });
  if (sf && S.length === K.length && S.every(s => K.some(k => Math.abs(k.v - s.v) < 0.01 * Math.max(1, Math.abs(k.v))))) return R_NO(GM('Close — check your rounding (3 s.f.).', 'Близко — проверь округление (3 знач. цифры).'), { near: true });
  if (spec.eqn && S.length) {
    // substitute
    return R_NO(GM('Substitute your value into the equation — the two sides are not equal.', 'Подставь твоё значение в уравнение — левая и правая части не равны.'));
  }
  return R_NO();
}

function gradeSubj(spec, raw) {
  let s = raw;
  const m = /^\s*([a-zA-Z])\s*=(.*)$/.exec(s);
  if (m) { if (m[1] !== spec.v) return R_NO(GM('The answer should start with ' + spec.v + ' = …', 'Ответ должен начинаться с ' + spec.v + ' = …')); s = m[2]; }
  const A = parse(s), K = parse(spec.key);
  if (varsOf(A).has(spec.v)) return R_NO(GM(spec.v + ' must appear only on the left side.', spec.v + ' должна быть только слева.'));
  const extra = [...varsOf(A)].filter(v => !varsOf(K).has(v));
  if (extra.length) return R_NO(GM('Your answer contains ' + extra.join(', ') + ', which is not in the formula.', 'В ответе есть ' + extra.join(', ') + ', которой нет в формуле.'));
  if (equiv(A, K)) return R_OK();
  if (equiv({ t: 'neg', a: A }, K)) return R_NO(GM('Almost: the sign is wrong.', 'Почти: ошибка в знаке.'));
  return R_NO();
}

/* preview of what the student typed */
function previewTex(spec, input) {
  if (/^(time|dur|ratio|list)$/.test(spec.k)) return '';
  const raw = cleanAns(input || '');
  if (!raw) return '';
  if (spec.k === 'sol') { return splitList(raw).map(x => { try { return tex(parse(x)); } catch (e) { return '\\text{?}'; } }).join(',\\; '); }
  const mx = parseMixed(raw); if (mx != null) { const m = /^(-?)(\d+) (\d+)\/(\d+)$/.exec(raw); return m[1] + m[2] + '\\tfrac{' + m[3] + '}{' + m[4] + '}'; }
  if (spec.none && /^(none|no|not possible|cannot|impossible)$/i.test(raw)) return '\\text{not possible}';
  return tex(parse(raw));
}

/* ===================== Grade 8 answer kinds: rounding, time of day, duration, ratio, list ===================== */
/* rounding: key is the rounded value written correctly ('4.65', '0.084', '20.1'); dp / sf fix how it must be written */
function gradeRound(spec, raw, v) {
  const K = +spec.key;
  if (!numOk(raw)) return R_NO(GM('Give a decimal number.', 'Дай десятичное число.'), { near: isFinite(v) && close(v, K, 1e-9) });
  if (!close(v, K, 1e-12)) {
    const step = spec.dp != null ? Math.pow(10, -spec.dp) : Math.pow(10, Math.floor(Math.log10(Math.abs(K) || 1)) - spec.sf + 1);
    if (Math.abs(v - K) <= step * 1.0001) return R_NO(GM('Close — look at the next digit: 5 or more rounds up, 4 or less rounds down.', 'Близко — посмотри на следующую цифру: 5 и больше — округляем вверх, 4 и меньше — вниз.'), { near: true });
    return R_NO();
  }
  if (spec.dp != null) { const d = (raw.split('.')[1] || '').length; if (d !== spec.dp) return R_NO(GM('Right value, but write exactly ' + spec.dp + ' decimal place(s) — keep a final zero if there is one.', 'Значение верное, но запиши ровно ' + spec.dp + ' ' + (spec.dp === 1 ? 'знак' : 'знака') + ' после точки — конечный ноль тоже пишем.'), { near: true }); }
  if (spec.sf != null) { const s = sigFigs(raw); if (s != null && s !== spec.sf && !(s < spec.sf && Number.isInteger(v))) return R_NO(GM('Right value, but write exactly ' + spec.sf + ' significant figures.', 'Значение верное, но запиши ровно ' + spec.sf + ' значащие цифры.'), { near: true }); }
  return R_OK();
}
/* --- time of day: key = minutes after midnight; fmt '12' (with am/pm), '24', or 'any' --- */
function clock12(min) { min = ((min % 1440) + 1440) % 1440; const h = Math.floor(min / 60), m = min % 60; return ((h + 11) % 12 + 1) + ':' + String(m).padStart(2, '0') + (h < 12 ? ' am' : ' pm'); }
function clock24(min) { min = ((min % 1440) + 1440) % 1440; return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0'); }
function clockParse(str) {
  let s = String(str || '').trim().toLowerCase().replace(/[рам]/g, c => ({ 'р': 'p', 'а': 'a', 'м': 'm' })[c]).replace(/\s+/g, ' ').replace(/([ap])\.? ?m\.?$/, '$1m');
  if (/^(12 )?(noon|midday)$/.test(s)) return { min: 720, ap: 'pm', h: 12 };
  if (/^(12 )?midnight$/.test(s)) return { min: 0, ap: 'am', h: 12 };
  let m = /^(\d{1,2})(?: ?[:.] ?(\d{2}))? ?(am|pm)?$/.exec(s);
  if (!m) { const m4 = /^(\d{2})(\d{2})$/.exec(s); if (m4) m = [0, m4[1], m4[2], undefined]; }
  if (!m) return null;
  const h = +m[1], mi = m[2] == null ? 0 : +m[2], ap = m[3] || null;
  if (mi > 59) return null;
  if (ap) { if (h < 1 || h > 12) return { err: 'ap' }; return { min: (h % 12 + (ap === 'pm' ? 12 : 0)) * 60 + mi, ap, h }; }
  if (h > 23) return null;
  return { min: h * 60 + mi, ap: null, h, bare: m[2] == null };
}
function gradeTime(spec, input) {
  const raw = String(input || '').trim(); if (!raw) return R_NO(GM('Type the time.', 'Введи время.'), { empty: true });
  const f = spec.fmt || '12', K = +spec.key, ex = f === '24' ? '17:25' : '5:25 pm';
  const c = clockParse(raw);
  if (!c || c.bare) return R_NO(GM('Write the time like ' + ex + '.', 'Запиши время так: ' + ex + '.'), { syntax: true });
  if (c.err) return R_NO(GM('With am or pm the hour goes from 1 to 12.', 'С am и pm часы идут от 1 до 12.'), { syntax: true });
  if (c.ap) {
    if (c.min === K) return f === '24' ? R_NO(GM('Right time, but write it in 24-hour time, like 17:25 (no am or pm).', 'Время верное, но запиши в 24-часовом формате, например 17:25 (без am и pm).'), { near: true }) : R_OK();
    if ((c.min + 720) % 1440 === K) return R_NO(GM('The numbers are right, but check am or pm.', 'Цифры верные, но проверь am или pm.'), { near: true });
    return R_NO();
  }
  if (f === '12') {
    if (c.min % 720 === K % 720) return R_NO(c.h > 12 || c.h === 0 ? GM('Right time, but write it in 12-hour time with am or pm.', 'Время верное, но запиши в 12-часовом формате с am или pm.') : GM('Add am or pm.', 'Добавь am или pm.'), { near: true });
    return R_NO();
  }
  if (c.min === K) return R_OK();
  if (c.min % 720 === K % 720) return R_NO(f === '24' ? GM('In 24-hour time the afternoon hours are 13 to 23, and midnight is 00.', 'В 24-часовом формате после полудня идут часы 13–23, а полночь — это 00.') : GM('Add am or pm.', 'Добавь am или pm.'), { near: true });
  return R_NO();
}
/* --- duration: key in minutes (seconds when u is 's' or 'ms'); u = 'hm' | 'min' | 'h' | 'ms' | 's' --- */
function durStr(v, u) {
  if (u === 's') return v + ' s';
  if (u === 'ms') { const a = Math.floor(v / 60), b = v % 60; return (a ? a + ' min' : '') + (a && b ? ' ' : '') + (b || !a ? b + ' s' : ''); }
  if (u === 'min') return v + ' min';
  if (u === 'h') return +(v / 60).toFixed(4) + ' h';
  const h = Math.floor(v / 60), m = v % 60; return (h ? h + ' h' : '') + (h && m ? ' ' : '') + (m || !h ? m + ' min' : '');
}
function durParse(str, u) {
  let s = String(str || '').trim().toLowerCase().replace(/,/g, '.').replace(/\s+/g, ' ');
  if (!s) return null;
  const hm = /^(\d+) ?: ?(\d{2})$/.exec(s);
  if (hm) { if (+hm[2] > 59) return null; return u === 'ms' || u === 's' ? { sec: +hm[1] * 60 + +hm[2], m: +hm[1], s: +hm[2], hasM: true, hasS: true } : { sec: (+hm[1] * 60 + +hm[2]) * 60, h: +hm[1], m: +hm[2], hasH: true, hasM: true }; }
  if (/^\d+(\.\d+)?$/.test(s)) { const v = +s; if (u === 'min') return { sec: v * 60, m: v, hasM: true, bare: true }; if (u === 'h') return { sec: v * 3600, h: v, hasH: true, bare: true }; if (u === 's') return { sec: v, s: v, hasS: true, bare: true }; return { bare: true, need: true }; }
  const re = /(\d+(?:\.\d+)?) ?(hours?|hrs?|h|час[а-я]*|ч|minutes?|mins?|min|m|мин[а-я]*|м|seconds?|secs?|sec|s|сек[а-я]*|с)(?![a-zа-я])/g;
  const out = { sec: 0 }; let rest = s, mt; let any = false;
  while ((mt = re.exec(s))) { any = true; const v = +mt[1], w = mt[2]; if (/^(h|ч)/.test(w)) { out.sec += v * 3600; out.h = v; out.hasH = true; } else if (/^(s|с)/.test(w) && !/^(м)/.test(w)) { out.sec += v; out.s = v; out.hasS = true; } else { out.sec += v * 60; out.m = v; out.hasM = true; } rest = rest.replace(mt[0], ' '); }
  if (!any || rest.replace(/[ .]|and|и/g, '') !== '') return null;
  return out;
}
function gradeDur(spec, input) {
  const raw = String(input || '').trim(); if (!raw) return R_NO(GM('Type your answer.', 'Введи ответ.'), { empty: true });
  const u = spec.u || 'hm'; const inSec = u === 's' || u === 'ms'; const K = +spec.key * (inSec ? 1 : 60);
  const ex = durStr(u === 'ms' ? 565 : u === 's' ? 90 : u === 'min' ? 85 : u === 'h' ? 150 : 285, u);
  const d = durParse(raw, u);
  if (!d || d.need) return R_NO(GM('Write the time with its units, like ' + ex + '.', 'Запиши время с единицами, например ' + ex + '.'), { syntax: true });
  if (Math.abs(d.sec - K) > 0.5) { if (Math.abs(d.sec - K) === 3600 || Math.abs(d.sec - K) === 43200) return R_NO(GM('Close — check the hours once more.', 'Близко — ещё раз проверь часы.'), { near: true }); return R_NO(); }
  if (u === 'hm' && ((d.m || 0) >= 60 || (d.h != null && !Number.isInteger(d.h)) || d.hasS)) return R_NO(GM('Right amount of time, but write it in hours and minutes (minutes less than 60).', 'Время верное, но запиши в часах и минутах (минут меньше 60).'), { near: true });
  if (u === 'min' && d.hasH) return R_NO(GM('Right amount of time, but give it in minutes only.', 'Время верное, но дай ответ только в минутах.'), { near: true });
  if (u === 's' && (d.hasM || d.hasH)) return R_NO(GM('Right amount of time, but give it in seconds only.', 'Время верное, но дай ответ только в секундах.'), { near: true });
  if (u === 'h' && !d.hasH) return R_NO(GM('Right amount of time, but give it in hours.', 'Время верное, но дай ответ в часах.'), { near: true });
  if (u === 'ms' && ((d.s || 0) >= 60 || d.hasH)) return R_NO(GM('Right amount of time, but write it in minutes and seconds (seconds less than 60).', 'Время верное, но запиши в минутах и секундах (секунд меньше 60).'), { near: true });
  return R_OK();
}
/* --- ratio: key 'a:b' or 'a:b:c' in lowest terms; exact = the very numbers asked for --- */
function ratioParse(str) {
  const s = String(str || '').trim().replace(/[∶：]/g, ':').replace(/\bto\b/gi, ':').replace(/,(?=\d)/g, '.');
  const ps = s.split(':').map(x => x.trim()); if (ps.length < 2 || ps.some(x => !x)) return null;
  const vs = []; for (const p of ps) { let v; try { v = numVal(cleanAns(p)).v; } catch (e) { v = NaN; } if (!isFinite(v) || v <= 0) return null; vs.push(v); }
  return vs;
}
function gradeRatio(spec, input) {
  const raw = String(input || '').trim(); if (!raw) return R_NO(GM('Type your answer.', 'Введи ответ.'), { empty: true });
  const A = ratioParse(raw), K = ratioParse(spec.key);
  if (!A) return R_NO(GM('Write a ratio with a colon, like 3:5.', 'Запиши отношение через двоеточие, например 3:5.'), { syntax: true });
  if (A.length !== K.length) return R_NO(GM('This ratio should have ' + K.length + ' parts.', 'В этом отношении должно быть ' + K.length + ' ' + (K.length < 5 ? 'части' : 'частей') + '.'), { near: true });
  const prop = (a, b) => a.every((x, i) => close(x * b[0], b[i] * a[0], 1e-9));
  if (!prop(A, K)) { if (prop(A.slice().reverse(), K)) return R_NO(GM('Right numbers, but check the order: the first quantity named goes first.', 'Числа верные, но проверь порядок: первой идёт та величина, которая названа первой.'), { near: true }); return R_NO(); }
  if (spec.exact) return A.every((x, i) => close(x, K[i], 1e-9)) ? R_OK() : R_NO(GM('This ratio is equal to the right one, but do exactly what the question asks.', 'Это отношение равно нужному, но сделай ровно то, что просят в задании.'), { near: true });
  if (A.some(v => !Number.isInteger(v))) return R_NO(GM('Correct ratio, but write it with whole numbers only.', 'Отношение верное, но запиши его только целыми числами.'), { near: true });
  const gg = A.reduce((a, b) => gcd(a, b)); if (gg > 1) return R_NO(GM('Correct ratio, but not in lowest terms: every part can still be divided by ' + gg + '.', 'Отношение верное, но не в простейшем виде: все части ещё делятся на ' + gg + '.'), { near: true });
  return R_OK();
}
/* --- list of numbers in any order: key '1,2,11,22' --- */
function gradeList(spec, input) {
  const raw = cleanAns(input || ''); if (!raw) return R_NO(GM('Type your answer.', 'Введи ответ.'), { empty: true });
  const parts = raw.split(/\s*(?:,|;|\band\b|\bи\b| )\s*/i).filter(Boolean); const vs = [];
  for (const p of parts) { let v; try { v = numVal(p).v; } catch (e) { v = NaN; } if (!isFinite(v)) return R_NO(GM('Write the numbers separated by commas, like 1, 2, 4.', 'Запиши числа через запятую, например 1, 2, 4.'), { syntax: true }); vs.push(v); }
  const K = String(spec.key).split(',').map(Number);
  const extra = vs.filter(v => !K.some(k => close(k, v))), miss = K.filter(k => !vs.some(v => close(k, v)));
  if (!extra.length && !miss.length) return new Set(vs).size === vs.length ? R_OK() : R_NO(GM('Right numbers, but write each one only once.', 'Числа верные, но каждое нужно записать один раз.'), { near: true });
  if (!extra.length) return R_NO(GM('Everything in your list is right, but ' + miss.length + ' more number(s) are missing.', 'Всё в твоём списке верно, но не хватает ещё ' + miss.length + ' ' + (miss.length === 1 ? 'числа' : 'чисел') + '.'), { near: true });
  if (!miss.length) return R_NO(GM(extra.join(', ') + ' should not be in the list.', extra.join(', ') + ' — в этом списке лишнее.'), { near: true });
  return R_NO();
}
/* prime factored form: only prime bases, each prime written once, no fractions */
FORMS.primeFact = function (ast) {
  let bad = null; const seen = {};
  const isPrime = n => { if (n < 2 || !Number.isInteger(n)) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  (function go(n, inExp) {
    if (!n || typeof n !== 'object') return;
    /* on the brevet 2 × 2 × 3 × 7 and 2² × 3 × 7 are both accepted: repeated primes are fine */
    if (n.t === 'n' && !inExp) { if (!isPrime(n.v)) bad = bad || GM(n.v + ' is not a prime number — break it down further.', n.v + ' — не простое число, разложи его дальше.'); else seen[n.v] = 1; }
    if (n.t === '^') { go(n.a, inExp); go(n.b, true); return; }
    if (n.t === '/' || n.t === '+' || n.t === '-' || n.t === 'f') bad = bad || GM('Write it as a product of prime powers, like 2^3 × 3^2 × 5.', 'Запиши как произведение степеней простых чисел, например 2^3 × 3^2 × 5.');
    ['a', 'b'].forEach(k => go(n[k], inExp));
  })(ast, false);
  return bad;
};
/* --- steps of a solution put in order: input is the list of step numbers in the chosen order, '2,0,1' --- */
function gradeOrder(spec, input) {
  const a = String(input || '').split(',').filter(x => x !== '').map(Number), n = spec.items.length;
  if (a.length < n) return R_NO(GM('', 'Расставь все шаги по порядку.'), { empty: true });
  if (a.every((v, i) => v === i)) return R_OK();
  const wrong = a.filter((v, i) => v !== i).length;
  if (wrong === 2) return R_NO(GM('', 'Почти: два шага стоят не на своих местах.'), { near: true });
  if (a[0] !== 0) return R_NO(GM('', 'Подумай, с чего рассуждение должно начинаться: с того, что дано.'));
  return R_NO();
}
/* a correct way to type the key of any spec (used by the automatic tests) */
function keyInput(spec) {
  if (spec.k === 'mcq') return String(spec.c);
  if (spec.k === 'order') return spec.items.map((_, i) => i).join(',');
  if (spec.k === 'time') return (spec.fmt === '24' ? clock24 : clock12)(+spec.key);
  if (spec.k === 'dur') return durStr(+spec.key, spec.u || 'hm');
  return String(spec.key);
}

