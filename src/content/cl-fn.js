/* ===================== CALCUL LITTÉRAL ET ÉQUATIONS (cl) · FONCTIONS (fn) =====================
   Trainers of the two chapters, fiches and dictionary. Every top-level name of this file starts with clf. */

/* ---------- small helpers ---------- */
const clfSp = ' ';                                                   /* no-break space: 12 cm, 20 % */
const clfVar = r => r.pick(['x', 'x', 'x', 'a', 'y', 't', 'n']);          /* the letter of an expression */
const clfName = r => r.pick(['A', 'B', 'C', 'D', 'E']);                  /* the name of an expression */
const clfDistinct = arr => new Set(arr.map(String)).size === arr.length;
/* Russian plural: clfPl(3, 'раз', 'раза', 'раз') → '3 раза' */
function clfPl(n, one, few, many) { const a = Math.abs(n) % 100, b = a % 10; return n + ' ' + (a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many); }
const clfRaz = n => clfPl(n, 'раз', 'раза', 'раз');
/* value of an expression in input syntax for given letters (the app's own parser) */
function clfVal(s, env) { try { return ev(parse(s), env || {}); } catch (e) { return NaN; } }
/* do two expressions in x take the same values? */
function clfSame(s1, s2, v) {
  v = v || 'x';
  for (const t of [-1.7, 0.3, 2.9, 4.1]) { const a = clfVal(s1, { [v]: t }), b = clfVal(s2, { [v]: t }); if (!isFinite(a) || !isFinite(b) || Math.abs(a - b) > 1e-9) return false; }
  return true;
}
/* a sum of numbers as it is written: 5+(-2)+3 */
const clfAddStr = ks => ks.map((k, i) => (i ? np(k) : String(k))).join('+');
/* a number appended to a sum with its sign: 5 → '+5', -5 → '-5' */
const clfPm = c => (c < 0 ? String(c) : '+' + c);
/* SVG pieces (classes from 20-api.js, no colours) */
const clfT = (x, y, s, a, cls, fs) => '<text x="' + (+x).toFixed(1) + '" y="' + (+y).toFixed(1) + '" class="' + (cls || 'ftx') + '" font-size="' + (fs || 15) + '" text-anchor="' + (a || 'middle') + '">' + s + '</text>';
const clfLn = (x1, y1, x2, y2, cls) => '<line x1="' + (+x1).toFixed(1) + '" y1="' + (+y1).toFixed(1) + '" x2="' + (+x2).toFixed(1) + '" y2="' + (+y2).toFixed(1) + '" class="' + (cls || 'fl') + '"/>';
const clfRect = (x, y, w, h, cls) => '<rect x="' + (+x).toFixed(1) + '" y="' + (+y).toFixed(1) + '" width="' + (+w).toFixed(1) + '" height="' + (+h).toFixed(1) + '" class="' + (cls || 'fl') + '"/>';
const clfPath = (d, cls) => '<path d="' + d + '" class="' + (cls || 'fl') + '"/>';
const clfDot = (x, y, rr) => '<circle cx="' + (+x).toFixed(1) + '" cy="' + (+y).toFixed(1) + '" r="' + (rr || 3.5) + '" class="fpt"/>';
/* a number for an SVG or table label: real minus sign, decimal comma */
const clfLab = v => nf(v);

/* =====================================================================================
   CALCUL LITTÉRAL
   ===================================================================================== */

/* ---------- cl.reduire ---------- */
topic({ id: 'cl.reduire', ch: 'cl', lvl: 1, calc: false, variants: 4,
  ru: 'Приведение подобных слагаемых', fr: 'Réduire une expression',
  hints: [
    'Буква обозначает одно и то же число. $3a$ — это $a+a+a$, а $2a$ — это $a+a$; вместе получается пять раз по $a$: $3a+2a=5a$. Так складываются только подобные слагаемые — с одинаковой буквенной частью («réduire» — приводить подобные).',
    'А $3a+2$ в одно слагаемое не собрать: «три раза по $a$ и ещё 2» — это не «пять раз по $a$». Проверь на числе: при $a=10$ получается $32$, а не $50$. Так же не складываются $x$ и $x^2$: $x^2=x*x$ — совсем другая величина.',
    'Если есть скобки, сначала раскрой их: $-4(2a+3)=-8a-12$ — число перед скобкой умножается на каждое слагаемое, вместе со знаком. Потом собери вместе слагаемые с буквой и отдельно числа и сложи их коэффициенты.'],
  gen(r, vi) {
    const v = clfVar(r), nm = clfName(r);
    if (vi === 0) {   /* like terms and numbers */
      let tx, A, B;
      do {
        const a = r.ri(2, 9), b = r.nz(-9, 9), c = r.nz(-9, 9), d = r.nz(-9, 9), o = r.ri(0, 2);
        tx = o === 0 ? [[a, 1], [c, 0], [b, 1], [d, 0]] : o === 1 ? [[a, 1], [b, 1], [c, 0]] : [[Math.abs(c), 0], [a, 1], [d, 0], [b, 1]];
        A = tx.filter(t => t[1]).reduce((s, t) => s + t[0], 0); B = tx.filter(t => !t[1]).reduce((s, t) => s + t[0], 0);
      } while (A === 0);
      const sx = tx.filter(t => t[1]).map(t => t[0]), sk = tx.filter(t => !t[1]).map(t => t[0]);
      const expr = S(tx.map(([k, p]) => cf(k, p ? v : ''))), res = lin(A, B, v);
      const steps = [
        ['Переставляем слагаемые так, чтобы рядом стояли подобные: с буквой $' + v + '$ и числа. От перестановки сумма не меняется; знак каждого слагаемого переходит вместе с ним.', nm + '=' + S(sx.map(k => cf(k, v)), sk.map(String))],
        ['Складываем коэффициенты при $' + v + '$: $' + clfAddStr(sx) + '=' + A + '$ — столько раз по $' + v + '$ получилось всего. Числа: ' + (sk.length > 1 ? '$' + clfAddStr(sk) + '=' + B + '$.' : 'одно, $' + B + '$.'), nm + '=' + res]];
      steps.push(B ? 'Слагаемые $' + cf(A, v) + '$ и $' + B + '$ не подобные (одно с буквой, другое без), поэтому дальше упростить нельзя.' : 'Числа в сумме дали 0, остаётся только $' + cf(A, v) + '$.');
      return { q: L('Réduire l\'expression ' + nm + '.', 'Упрости выражение ' + nm + ': приведи подобные слагаемые.'), m: nm + '=' + expr, ans: XP(res, { forms: ['expanded'] }), sol: steps };
    }
    if (vi === 1) {   /* QCM: what can be added */
      if (r() < 0.5) {   /* 2n + 3n (national test of 4e) */
        let p, q; do { p = r.ri(2, 7); q = r.ri(2, 7); } while (p === q || p + q === p * q);
        const opts = [cf(p + q, v), cf(p + q, v + '^2'), cf(p * q, v + '^2'), cf(p * q, v)];
        return { q: L('Parmi les propositions suivantes, laquelle est égale à $' + cf(p, v) + '+' + cf(q, v) + '$ ?', 'Какое из выражений равно $' + cf(p, v) + '+' + cf(q, v) + '$?'),
          ans: MQ(r, opts.map(s => '$' + s + '$'), 0), sol: [
            ['$' + cf(p, v) + '$ — это ' + clfRaz(p) + ' по $' + v + '$, а $' + cf(q, v) + '$ — ещё ' + clfRaz(q) + ' по $' + v + '$. Всего $' + p + '+' + q + '=' + (p + q) + '$ раз по $' + v + '$:', cf(p, v) + '+' + cf(q, v) + '=' + opts[0]],
            'Откуда неверные ответы: $' + opts[3] + '$ — коэффициенты перемножили, а при сложении их складывают; $' + opts[2] + '$ — это произведение $' + cf(p, v) + '*' + cf(q, v) + '$, а не сумма; $' + opts[1] + '$ — при сложении буква не умножается сама на себя: сколько раз по $' + v + '$ ни складывай, получится снова «сколько-то раз по $' + v + '$», а не $' + v + '^2$.'] };
      }
      const p = r.ri(2, 8), c = r.ri(2, 9);
      const expr = r() < 0.5 ? S(cf(p, v), c, v) : S(v, c, cf(p, v));
      const opts = [lin(p + 1, c, v), cf(p + 1 + c, v), lin(p, c, v), S(cf(p + 1, v + '^2'), c)];
      return { q: L('Parmi les propositions suivantes, laquelle est la forme réduite de $' + expr + '$ ?', 'Какое из выражений — упрощённая запись $' + expr + '$ (подобные слагаемые приведены)?'),
        ans: MQ(r, opts.map(s => '$' + s + '$'), 0), sol: [
          ['Одиночная буква $' + v + '$ — это $1' + v + '$, один раз по $' + v + '$. Подобные слагаемые здесь $' + cf(p, v) + '$ и $' + v + '$: вместе ' + clfRaz(p + 1) + ' по $' + v + '$. Число ' + c + ' без буквы — оно остаётся отдельным слагаемым.', expr + '=' + opts[0]],
          'Откуда неверные ответы: $' + opts[1] + '$ — к коэффициентам прибавили и число ' + c + ', хотя у него нет буквы; $' + opts[2] + '$ — потеряли одиночное $' + v + '$ (его коэффициент 1, а не 0); $' + opts[3] + '$ — при сложении буква не возводится в квадрат, $' + v + '^2$ получается только при умножении $' + v + '*' + v + '$.'] };
    }
    if (vi === 2) {   /* vrai / faux: an identity or a classic slip */
      const p = r.ri(2, 7), q = r.ri(2, 6), V = s => s.split('#').join(v);
      const pool = [
        [true, V(cf(p, '#') + '+' + cf(q, '#') + '=' + cf(p + q, '#')), 'Верно: это $' + p + '+' + q + '=' + (p + q) + '$ раз по $' + v + '$ — подобные слагаемые складываются, буквенная часть не меняется.'],
        [false, V(cf(p, '#') + '+' + q + '=' + cf(p + q, '#')), 'Неверно: $' + cf(p, v) + '$ и $' + q + '$ — не подобные слагаемые (у числа ' + q + ' нет буквы), сложить их в одно нельзя. При $' + v + '=1$ равенство случайно выполняется, но «при любом» значит при всех значениях.'],
        [false, V(cf(p, '#') + '+' + cf(q, '#') + '=' + cf(p + q, '#^2')), 'Неверно: при сложении подобных слагаемых складываются коэффициенты, а буквенная часть остаётся той же: $' + cf(p + q, v) + '$, а не $' + cf(p + q, v + '^2') + '$.'],
        [true, V(cf(p, '#') + '*' + cf(q, '#') + '=' + cf(p * q, '#^2')), 'Верно: в произведении множители можно переставлять: $' + p + '*' + v + '*' + q + '*' + v + '=' + p + '*' + q + '*' + v + '*' + v + '=' + cf(p * q, v + '^2') + '$.'],
        [false, V(cf(p, '#') + '*' + cf(q, '#') + '=' + cf(p * q, '#')), 'Неверно: $' + v + '*' + v + '=' + v + '^2$, поэтому $' + cf(p, v) + '*' + cf(q, v) + '=' + cf(p * q, v + '^2') + '$, а не $' + cf(p * q, v) + '$.'],
        [true, V(cf(p, '#') + '-#=' + cf(p - 1, '#')), 'Верно: одиночная буква — это $1' + v + '$. Было ' + clfRaz(p) + ' по $' + v + '$, убрали один раз — осталось ' + clfRaz(p - 1) + ' по $' + v + '$.'],
        [false, V(cf(p, '#') + '-#=' + p), 'Неверно: $' + v + '$ — это $1' + v + '$, значит $' + cf(p, v) + '-' + v + '=' + cf(p - 1, v) + '$. Вычитается один раз по $' + v + '$, а не «буква».'],
        [false, V('#+#=#^2'), 'Неверно: $' + v + '+' + v + '=2' + v + '$ (два раза по $' + v + '$), а $' + v + '^2$ — это $' + v + '*' + v + '$.'],
        [true, V('#*#=#^2'), 'Верно: $' + v + '^2$ по определению означает $' + v + '*' + v + '$.'],
        [false, V(cf(p, '#^2') + '+' + cf(q, '#') + '=' + cf(p + q, '#^3')), 'Неверно: $' + cf(p, v + '^2') + '$ и $' + cf(q, v) + '$ не подобные — у них разная буквенная часть ($' + v + '^2$ и $' + v + '$), такую сумму не упростить.'],
        [true, V(cf(p, '#^2') + '+' + cf(q, '#^2') + '=' + cf(p + q, '#^2')), 'Верно: слагаемые подобные (одна и та же буквенная часть $' + v + '^2$) — складываем коэффициенты $' + p + '+' + q + '=' + (p + q) + '$.']];
      const want = r() < 0.5, cand = pool.filter(e => e[0] === want), [ok, eq, why] = r.pick(cand);
      const [lhs, rhs] = eq.split('=');
      let t = 2; while (t < 9 && Math.abs(clfVal(lhs, { [v]: t }) - clfVal(rhs, { [v]: t })) < 1e-9 !== ok) t++;
      const lv = clfVal(lhs, { [v]: t }), rv = clfVal(rhs, { [v]: t });
      return { q: L('Affirmation : « pour tout nombre $' + v + '$, on a l\'égalité ci-dessous ». Cette affirmation est-elle vraie ou fausse ?', 'Утверждение: «при любом числе $' + v + '$ верно равенство ниже». Это утверждение верно или неверно?'),
        m: eq, ans: TF(ok), sol: [why, ok ? 'Проверка на числе: при $' + v + '=' + t + '$ слева $' + fx(lv) + '$ и справа $' + fx(rv) + '$ — совпадает, как и должно быть.'
          : 'Достаточно одного числа, при котором равенство ложно: при $' + v + '=' + t + '$ слева получается $' + fx(lv) + '$, а справа $' + fx(rv) + '$.'] };
    }
    /* vi 3: a minus before a bracket (sujet de référence 2027 n°1, Q6) */
    let p, q, k, m2, n, sg;
    do { p = r.ri(1, 9); q = r.nz(-9, 9); k = r.ri(2, 6); m2 = r.ri(1, 5); n = r.nz(-9, 9); sg = r() < 0.75 ? -1 : 1; } while (p + sg * k * m2 === 0);
    const expr = S(cf(p, v), q) + (sg < 0 ? '-' : '+') + k + '(' + lin(m2, n, v) + ')';
    const A = p + sg * k * m2, B = q + sg * k * n, res = lin(A, B, v);
    return { q: L('Réduire l\'expression ' + nm + '.', 'Упрости выражение ' + nm + '.'), m: nm + '=' + expr, ans: XP(res, { forms: ['expanded'] }), sol: [
      ['Сначала раскрываем скобки: $' + (sg < 0 ? '-' : '') + k + '$ умножаем на каждое слагаемое в скобке.' + (sg < 0 ? ' Минус относится ко всему произведению, поэтому оба слагаемых из скобки меняют знак.' : ''), nm + '=' + S(cf(p, v), q, cf(sg * k * m2, v), sg * k * n)],
      ['Ставим рядом подобные: слагаемые с $' + v + '$ и числа.', nm + '=' + S(cf(p, v), cf(sg * k * m2, v), q, sg * k * n)],
      ['Складываем коэффициенты: $' + S(p, sg * k * m2) + '=' + A + '$; числа: $' + S(q, sg * k * n) + '=' + B + '$.', nm + '=' + res]] };
  } });

/* ---------- cl.substituer ---------- */
topic({ id: 'cl.substituer', ch: 'cl', lvl: 1, calc: false, variants: 4,
  ru: 'Значение буквенного выражения', fr: 'Calculer la valeur d\'une expression littérale',
  hints: [
    'Вместо буквы подставляем число. Помни, что между числом и буквой спрятан знак умножения: $3x$ — это $3*x$. При $x=8$ это $3*8=24$, а не «38».',
    'Отрицательное число подставляем в скобках: при $x=-2$ выражение $x^2$ становится $(-2)^2=4$. Без скобок легко ошибиться: $-2^2$ — это $-(2^2)=-4$.',
    'Дальше считаем по порядку действий: сначала скобки, потом степени, потом умножение и деление, в конце сложение и вычитание (слева направо).'],
  gen(r, vi) {
    const v = vi === 0 ? 'x' : clfVar(r), nm = clfName(r);
    if (vi === 0) {   /* QCM with the classic slips (national test of 4e) */
      let a, b, c, opts;
      do { a = r.ri(1, 9); b = r.ri(2, 9); c = r.ri(2, 9); opts = [a + b * c, (a + b) * c, a + Number('' + b + c), Number('' + (a + b) + c)]; } while (!clfDistinct(opts));
      return { q: L('Quelle est la valeur de l\'expression $' + a + '+' + b + v + '$ pour $' + v + '=' + c + '$ ?', 'Чему равно значение выражения $' + a + '+' + b + v + '$ при $' + v + '=' + c + '$?'),
        ans: MQ(r, opts.map(String), 0), sol: [
          ['$' + b + v + '$ означает $' + b + '*' + v + '$. Подставляем $' + v + '=' + c + '$:', a + '+' + b + '*' + c],
          ['Умножение выполняется раньше сложения:', a + '+' + b + '*' + c + '=' + a + '+' + (b * c) + '=' + opts[0]],
          'Откуда неверные ответы: ' + opts[1] + ' — считали слева направо: $(' + a + '+' + b + ')*' + c + '$; ' + opts[2] + ' — прочитали $' + b + v + '$ как число «' + b + c + '»; ' + opts[3] + ' — сложили $' + a + '+' + b + '=' + (a + b) + '$ и прочитали $' + (a + b) + v + '$ как «' + (a + b) + c + '».'] };
    }
    if (vi === 1 || vi === 2) {   /* short answer; vi 2: the value is negative */
      const neg = vi === 2, t = neg ? -r.ri(2, 6) : r.ri(2, 6), T = neg ? '(' + t + ')' : String(t);
      const tp = r.ri(0, 3); let expr, sub, chain, how, note = ' Между числом и буквой стоит знак умножения — его и пишем.';
      if (tp === 0) { const a = neg ? r.nz(-9, 9) : r.ri(2, 9), b = r.nz(-12, 12); expr = lin(a, b, v); sub = S(a + '*' + T, b); chain = [S(a * t, b), a * t + b]; how = 'сначала умножение, потом сложение'; }
      else if (tp === 1) {
        if (neg) { let a; do a = r.nz(-9, 9); while (Math.abs(a) < 2); expr = S(v + '^2', cf(a, v)); sub = T + '^2' + (a < 0 ? '-' + (-a) : '+' + a) + '*' + T; chain = [S(t * t, a * t), t * t + a * t]; how = 'сначала степень и умножение, потом сложение'; }
        else { const a = r.ri(2, 9); expr = S(v + '^2', cf(-a, v)); sub = t + '^2-' + a + '*' + t; chain = [S(t * t, -a * t), t * t - a * t]; how = 'сначала степень и умножение, потом вычитание'; }
      } else if (tp === 2) {
        const a = r.ri(1, 5), b = r.nz(-9, 9), lead = a === 1 ? '' : a + '*';
        expr = S(cf(a, v + '^2'), b); sub = S(lead + T + '^2', b); chain = (a === 1 ? [] : [S(a + '*' + t * t, b)]).concat([S(a * t * t, b), a * t * t + b]);
        how = a === 1 ? 'сначала степень, потом сложение' : 'сначала степень, потом умножение, потом сложение'; if (a === 1) note = '';
      } else if (neg) { const b = r.ri(1, 20); expr = b + '-' + v + '^2'; sub = b + '-' + T + '^2'; chain = [b + '-' + t * t, b - t * t]; how = 'сначала степень, потом вычитание; минус перед $' + v + '^2$ остаётся на месте'; note = ''; }
      else { const a = r.ri(2, 6), b = r.nz(-9, 9); expr = a + '(' + lin(1, b, v) + ')'; sub = a + '*(' + S(t, b) + ')'; chain = [a + '*' + np(t + b), a * (t + b)]; how = 'сначала скобка, потом умножение'; note = ' Между числом и скобкой стоит знак умножения.'; }
      const steps = [[(neg ? 'Подставляем $' + v + '=' + t + '$ в скобках, чтобы минус относился ко всему числу.' : 'Заменяем $' + v + '$ на $' + t + '$.') + note, nm + '=' + sub],
        ['Считаем по порядку действий: ' + how + '.', sub + '=' + chain.join('=')]];
      if (neg && /\^2/.test(expr)) steps.splice(1, 0, 'Квадрат отрицательного числа положителен: $' + T + '^2=' + T + '*' + T + '=' + t * t + '$ — минус на минус даёт плюс.');
      return { q: L('Calculer la valeur de l\'expression ' + nm + ' pour $' + v + '=' + t + '$.', 'Вычисли значение выражения ' + nm + ' при $' + v + '=' + t + '$.'), m: nm + '=' + expr, ans: N(chain[chain.length - 1]), sol: steps };
    }
    /* vi 3: QCM, the square of a negative number */
    const a = r.ri(2, 4), k = r.ri(3, 5);
    const opts = [a * k * k, -a * k * k, a * k * a * k, -2 * a * k];
    return { q: L('Quelle est la valeur de l\'expression ' + nm + ' pour $' + v + '=-' + k + '$ ?', 'Чему равно значение выражения ' + nm + ' при $' + v + '=-' + k + '$?'), m: nm + '=' + cf(a, v + '^2'),
      ans: MQ(r, opts.map(o => '$' + o + '$'), 0), sol: [
        ['Подставляем $' + v + '=-' + k + '$ в скобках:', nm + '=' + a + '*(-' + k + ')^2'],
        ['Квадрат стоит только над $' + v + '$, и степень считается раньше умножения: $(-' + k + ')^2=(-' + k + ')*(-' + k + ')=' + k * k + '$ — минус на минус даёт плюс. Потом умножаем:', a + '*(-' + k + ')^2=' + a + '*' + k * k + '=' + opts[0]],
        'Откуда неверные ответы: $' + opts[1] + '$ — квадрат посчитали без скобок: $-' + k + '^2=-(' + k + '^2)=-' + k * k + '$; $' + opts[2] + '$ — сначала умножили $' + a + '*(-' + k + ')$ и возвели в квадрат всё произведение, хотя квадрат относится только к $' + v + '$; $' + opts[3] + '$ — прочитали $' + v + '^2$ как $2' + v + '$.'] };
  } });

/* ---------- cl.developper-simple ---------- */
topic({ id: 'cl.developper-simple', ch: 'cl', lvl: 1, calc: false, variants: 4,
  ru: 'Раскрытие скобок: k(a + b)', fr: 'Développer avec la simple distributivité',
  hints: [
    '«Développer» — превратить произведение в сумму. Число перед скобкой умножается на каждое слагаемое в скобке: $k(a+b)=ka+kb$. Ведь взять $k$ раз сумму $a+b$ — то же самое, что взять $k$ раз $a$ и $k$ раз $b$.',
    'Следи за знаками каждого произведения: $-3(x-4)=-3x+12$, потому что $(-3)*(-4)=12$. Минус перед скобкой без числа — это умножение на $-1$: $-(x-4)=-x+4$.',
    'Если перед скобкой стоит буква, она тоже умножается на каждое слагаемое: $x*x=x^2$. В конце приведи подобные слагаемые («réduire»): отдельно с $x^2$, с $x$ и числа.'],
  gen(r, vi) {
    const v = clfVar(r), nm = clfName(r);
    if (vi === 0) {   /* k(ax + b) */
      let k, a, b; do { k = r.nz(-9, 9); a = r.ri(1, 9); b = r.nz(-9, 9); } while (Math.abs(k) < 2);
      const res = lin(k * a, k * b, v), sgnNote = k < 0 || b < 0 ? ' Знак произведения: одинаковые знаки дают плюс, разные — минус.' : '';
      return { q: L('Développer l\'expression ' + nm + '.', 'Раскрой скобки в выражении ' + nm + '.'), m: nm + '=' + k + '(' + lin(a, b, v) + ')', ans: XP(res, { forms: ['expanded'] }), sol: [
        ['Множитель $' + k + '$ умножаем на каждое слагаемое в скобке (распределительное свойство, «distributivité»):', nm + '=' + k + '*' + cf(a, v) + '+' + np(k) + '*' + np(b)],
        ['Считаем каждое произведение.' + sgnNote, nm + '=' + res]] };
    }
    if (vi === 1) {   /* a minus before the bracket, then reduce */
      const one = r() < 0.35; let c, d, a, b, k, A;
      do { c = r.ri(2, 9); d = r() < 0.3 ? 0 : r.nz(-9, 9); a = r.ri(1, 9); b = r.nz(-9, 9); k = one ? 1 : r.ri(2, 6); A = c - k * a; } while (A === 0);
      const B = d - k * b, expr = S(cf(c, v), d) + '-' + (one ? '' : k) + '(' + lin(a, b, v) + ')', ex1 = S(cf(c, v), d, cf(-k * a, v), -k * b), res = lin(A, B, v);
      const first = one ? 'Минус перед скобкой означает: вычитаем всю скобку, то есть каждое её слагаемое. Вычесть $' + cf(a, v) + '$ — получаем $' + cf(-a, v) + '$; ' + (b > 0 ? 'вычесть $' + b + '$ — получаем $' + (-b) + '$.' : 'вычесть $' + b + '$ — то же, что прибавить $' + (-b) + '$.')
        : 'Раскрываем скобки: $-' + k + '$ умножаем на каждое слагаемое в скобке. Минус относится ко всему произведению, поэтому знаки слагаемых из скобки меняются.';
      return { q: L('Développer et réduire l\'expression ' + nm + '.', 'Раскрой скобки и приведи подобные в выражении ' + nm + '.'), m: nm + '=' + expr, ans: XP(res, { forms: ['expanded'] }), sol: [
        [first, nm + '=' + ex1],
        ['Приводим подобные: $' + S(cf(c, v), cf(-k * a, v)) + '=' + cf(A, v) + '$' + (d ? ', числа: $' + S(d, -k * b) + '=' + B + '$.' : '.'), nm + '=' + res]] };
    }
    if (vi === 2) {   /* kx(ax + b) — Polynésie 2026, Q6 */
      let k, a, b; do { k = r.nz(-6, 6); a = r.ri(1, 6); b = r.nz(-9, 9); } while (k === -1);
      const pre = cf(k, v), res = S(cf(k * a, v + '^2'), cf(k * b, v));
      return { q: L('Développer et réduire l\'expression ' + nm + '.', 'Раскрой скобки и упрости выражение ' + nm + '.'), m: nm + '=' + pre + '(' + lin(a, b, v) + ')', ans: XP(res, { forms: ['expanded'] }), sol: [
        ['Множитель $' + pre + '$ умножаем на каждое слагаемое в скобке:', nm + '=' + pre + '*' + cf(a, v) + '+' + (k < 0 ? '(' + pre + ')' : pre) + '*' + np(b)],
        ['$' + v + '*' + v + '=' + v + '^2$, поэтому $' + pre + '*' + cf(a, v) + '=' + cf(k * a, v + '^2') + '$; второе произведение: $' + (k < 0 ? '(' + pre + ')' : pre) + '*' + np(b) + '=' + cf(k * b, v) + '$.', nm + '=' + res],
        'Слагаемые $' + cf(k * a, v + '^2') + '$ и $' + cf(k * b, v) + '$ не подобные ($' + v + '^2$ и $' + v + '$ — разные буквенные части), поэтому это окончательный ответ.'] };
    }
    /* vi 3: QCM with the classic slips */
    let k, a, b, opts;
    let pos;
    do { k = r.nz(-7, 9); a = r() < 0.6 ? 1 : r.ri(2, 5); b = r.nz(-9, 9); pos = k > 0 && b > 0; opts = [lin(k * a, k * b, v), lin(k * a, b, v), pos ? lin(a, k * b, v) : lin(k * a, -k * b, v), lin(k * a, k + b, v)]; } while (Math.abs(k) < 2 || !clfDistinct(opts));
    const e = k + '(' + lin(a, b, v) + ')';
    return { q: L('Parmi les propositions suivantes, laquelle est la forme développée de $' + e + '$ ?', 'Какое из выражений получится, если раскрыть скобки в $' + e + '$?'),
      ans: MQ(r, opts.map(s => '$' + s + '$'), 0), sol: [
        ['Множитель $' + k + '$ умножаем на каждое слагаемое в скобке:', e + '=' + k + '*' + cf(a, v) + '+' + np(k) + '*' + np(b) + '=' + opts[0]],
        'Откуда неверные ответы: $' + opts[1] + '$ — на $' + k + '$ умножили только первое слагаемое; $' + opts[2] + (pos ? '$ — на $' + k + '$ умножили только второе слагаемое' : '$ — ошибка в знаке: $' + np(k) + '*' + np(b) + '=' + k * b + '$') + '; $' + opts[3] + '$ — число $' + b + '$ сложили с $' + k + '$, а его нужно умножить.'] };
  } });

/* ---------- cl.developper-double ---------- */
/* the rectangle (x + a) by (x + b) cut into four parts; inside — the areas of the parts */
function clfAreaFig(a, b, inside) {
  const x0 = 60, y0 = 30, wx = 120, hx = 120, wa = 30 + 6 * a, hb = 30 + 6 * b, X = '<tspan font-style="italic">x</tspan>';
  let g = '';
  if (inside) g += clfRect(x0, y0, wx, hx, 'ffill');
  g += clfRect(x0, y0, wx + wa, hx + hb, 'fl') + clfLn(x0 + wx, y0, x0 + wx, y0 + hx + hb, 'fl') + clfLn(x0, y0 + hx, x0 + wx + wa, y0 + hx, 'fl');
  g += clfT(x0 + wx / 2, y0 - 9, X) + clfT(x0 + wx + wa / 2, y0 - 9, a) + clfT(x0 - 10, y0 + hx / 2 + 5, X, 'end') + clfT(x0 - 10, y0 + hx + hb / 2 + 5, b, 'end');
  if (inside) g += clfT(x0 + wx / 2, y0 + hx / 2 + 5, X + '²') + clfT(x0 + wx + wa / 2, y0 + hx / 2 + 5, (a === 1 ? '' : a) + X) + clfT(x0 + wx / 2, y0 + hx + hb / 2 + 5, (b === 1 ? '' : b) + X) + clfT(x0 + wx + wa / 2, y0 + hx + hb / 2 + 5, a * b);
  return svgFig(340, y0 + hx + hb + 14, g, 'rectangle partagé en quatre rectangles');
}
topic({ id: 'cl.developper-double', ch: 'cl', lvl: 2, calc: false, variants: 4,
  ru: 'Раскрытие скобок: (a + b)(c + d)', fr: 'Développer avec la double distributivité',
  hints: [
    'Каждое слагаемое первой скобки умножаем на каждое слагаемое второй: $(a+b)(c+d)=ac+ad+bc+bd$ — получается 4 произведения.',
    'Почему так: $(a+b)(c+d)$ — площадь прямоугольника со сторонами $a+b$ и $c+d$. Разрежь его на 4 прямоугольника: их площади $ac$, $ad$, $bc$, $bd$, а вместе они составляют весь прямоугольник.',
    'Следи за знаком каждого произведения: $(-2)*(-5)=10$, $x*(-5)=-5x$. В конце приведи подобные: два средних слагаемых с $x$ обычно складываются в одно.'],
  gen(r, vi) {
    const v = vi === 3 ? 'x' : clfVar(r), nm = clfName(r);
    const four = (p, a, q, b) => [cf(p, v) + '*' + cf(q, v), cf(p, v) + '*' + np(b), np(a) + '*' + cf(q, v), np(a) + '*' + np(b)].join('+');
    if (vi === 0 || vi === 1) {   /* (x + a)(x + b) with a minus; vi 1: (px + a)(qx + b) */
      let p = 1, q = 1, a, b;
      if (vi === 0) { do { a = r.nz(-9, 9); b = r.nz(-9, 9); } while (a + b === 0 || (a > 0 && b > 0)); }
      else { do { p = r.ri(1, 5); q = r.ri(1, 5); a = r.nz(-9, 9); b = r.nz(-9, 9); } while (p * q === 1 || p * b + q * a === 0); }
      const P1 = [a, p], P2 = [b, q], res = Pl.str(Pl.mul(P1, P2), v), mid = p * b + q * a;
      return { q: L('Développer et réduire l\'expression ' + nm + '.', 'Раскрой скобки и приведи подобные в выражении ' + nm + '.'), m: nm + '=(' + lin(p, a, v) + ')(' + lin(q, b, v) + ')', ans: XP(res, { forms: ['expanded'] }), sol: [
        ['Каждое слагаемое первой скобки умножаем на каждое слагаемое второй — получается 4 произведения:', nm + '=' + four(p, a, q, b)],
        ['Считаем каждое произведение, следя за знаками:', nm + '=' + prodWork(P1, P2, v)],
        ['Приводим подобные: $' + S(cf(p * b, v), cf(q * a, v)) + '=' + cf(mid, v) + '$.', nm + '=' + res]] };
    }
    if (vi === 2) {   /* QCM with the classic slips */
      let a, b, opts;
      do { a = r.nz(-9, 9); b = r.nz(-9, 9); opts = [quad(1, a + b, a * b, v), quad(1, 0, a * b, v), quad(1, -(a + b), a * b, v), quad(1, a + b, -a * b, v)]; } while (a + b === 0 || !clfDistinct(opts));
      const e = '(' + lin(1, a, v) + ')(' + lin(1, b, v) + ')';
      return { q: L('Parmi les propositions suivantes, laquelle est la forme développée et réduite de $' + e + '$ ?', 'Какое из выражений получится, если в $' + e + '$ раскрыть скобки и привести подобные?'),
        ans: MQ(r, opts.map(s => '$' + s + '$'), 0), sol: [
          ['Четыре произведения «каждое на каждое», потом подобные:', e + '=' + prodWork([a, 1], [b, 1], v) + '=' + opts[0]],
          'Откуда неверные ответы: $' + opts[1] + '$ — перемножили только первые и последние слагаемые и потеряли два средних произведения; $' + opts[2] + '$ — ошибка в знаке слагаемого с $' + v + '$: $' + S(cf(b, v), cf(a, v)) + '=' + cf(a + b, v) + '$; $' + opts[3] + '$ — ошибка в знаке произведения чисел: $' + np(a) + '*' + np(b) + '=' + a * b + '$.'] };
    }
    /* vi 3: the area of a rectangle cut into four parts */
    const a = r.ri(1, 9), b = r.ri(1, 9), res = quad(1, a + b, a * b, 'x');
    return { q: L('Le grand rectangle ci-dessous est partagé en quatre rectangles (les longueurs sont en cm). Exprimer son aire en fonction de $x$, sous forme développée et réduite.', 'Большой прямоугольник ниже разрезан на четыре прямоугольника (длины в см). Вырази его площадь через $x$: раскрой скобки и приведи подобные.'),
      fig: clfAreaFig(a, b, false), ans: XP(res, { forms: ['expanded'], unit: 'cm²' }), sol: [
        ['Стороны большого прямоугольника — $x+' + a + '$ и $x+' + b + '$, поэтому его площадь равна произведению:', '(x+' + a + ')(x+' + b + ')'],
        { t: 'С другой стороны, площадь — это сумма площадей четырёх частей: $x*x=x^2$, $x*' + a + '=' + cf(a, 'x') + '$, $' + b + '*x=' + cf(b, 'x') + '$ и $' + a + '*' + b + '=' + a * b + '$. Это и есть четыре произведения «каждое на каждое».', svg: clfAreaFig(a, b, true), m: '(x+' + a + ')(x+' + b + ')=x^2+' + cf(a, 'x') + '+' + cf(b, 'x') + '+' + a * b },
        ['Приводим подобные: $' + cf(a, 'x') + '+' + cf(b, 'x') + '=' + (a + b) + 'x$.', '(x+' + a + ')(x+' + b + ')=' + res]] };
  } });

/* ---------- cl.identites ---------- */
topic({ id: 'cl.identites', ch: 'cl', lvl: 2, calc: false, variants: 4,
  ru: 'Произведение (a + b)(a − b)', fr: 'L\'identité remarquable (a + b)(a − b)',
  hints: [
    'Произведение суммы и разности одних и тех же чисел: $(a+b)(a-b)=a^2-b^2$. Проверь раскрытием: $a^2-ab+ab-b^2$ — два средних слагаемых взаимно уничтожаются.',
    'В квадрат возводится всё слагаемое целиком: $(3x)^2=9x^2$, $(2√3)^2=4*3=12$. Частая ошибка — забыть возвести в квадрат число: $(3x)^2≠3x^2$.',
    'Для счёта в уме: $102*98=(100+2)(100-2)=100^2-2^2=9996$ — ищи пару чисел на одинаковом расстоянии от «круглого» числа.'],
  gen(r, vi) {
    const v = clfVar(r), nm = clfName(r);
    if (vi === 0 || vi === 1) {
      let a, b; do { a = r.ri(vi === 1 ? 2 : 1, 7); b = r.ri(1, 9); } while (vi === 1 && (b < 2 || b === a));
      const sw = r() < 0.5, e = sw ? '(' + lin(a, -b, v) + ')(' + lin(a, b, v) + ')' : '(' + lin(a, b, v) + ')(' + lin(a, -b, v) + ')';
      const A = a === 1 ? v : '(' + cf(a, v) + ')', res = S(cf(a * a, v + '^2'), -b * b);
      if (vi === 0) return { q: L('Développer et réduire l\'expression ' + nm + '.', 'Раскрой скобки и приведи подобные в выражении ' + nm + '.'), m: nm + '=' + e, ans: XP(res, { forms: ['expanded'] }), sol: [
        ['Раскрываем «каждое на каждое»:', nm + '=' + (sw ? prodWork([-b, a], [b, a], v) : prodWork([b, a], [-b, a], v))],
        ['Средние слагаемые взаимно уничтожаются — так бывает всегда, когда перемножают сумму и разность одних и тех же чисел: $(A+B)(A-B)=A^2-B^2$.' + (a > 1 ? ' Здесь $A=' + cf(a, v) + '$, и $(' + cf(a, v) + ')^2=' + cf(a * a, v + '^2') + '$: в квадрат возводится и число.' : ''), nm + '=' + A + '^2-' + b + '^2=' + res]] };
      const opts = [res, S(cf(a, v + '^2'), -b * b), S(cf(a * a, v + '^2'), b * b), S(cf(2 * a, v + '^2'), -2 * b)];
      if (!clfDistinct(opts)) opts[3] = S(cf(2 * a, v), -2 * b);
      return { q: L('Parmi les propositions suivantes, laquelle est une forme développée de l\'expression $' + e + '$ ?', 'Какое из выражений — раскрытая запись выражения $' + e + '$?'),
        ans: MQ(r, opts.map(s => '$' + s + '$'), 0), sol: [
          ['По формуле $(A+B)(A-B)=A^2-B^2$ с $A=' + cf(a, v) + '$ и $B=' + b + '$:', e + '=' + A + '^2-' + b + '^2=' + res],
          'Откуда неверные ответы: $' + opts[1] + '$ — не возвели в квадрат число ' + a + ': $(' + cf(a, v) + ')^2=' + a + '^2*' + v + '^2=' + cf(a * a, v + '^2') + '$; $' + opts[2] + '$ — ошибка в знаке: $' + b + '*(-' + b + ')=-' + b * b + '$; $' + opts[3] + '$ — умножили на 2 вместо того, чтобы возвести в квадрат.'] };
    }
    if (vi === 2) {   /* (5 + 2√3)(5 − 2√3) — sujet de référence 2027 n°1, Q3 */
      if (r() < 0.7) {
        const p = r.ri(2, 9), q = r.ri(1, 3), k = r.pick([2, 3, 5, 6, 7]), qs = (q === 1 ? '' : q) + '√' + k, val = p * p - q * q * k;
        return { q: L('Calculer ' + nm + '.', 'Вычисли ' + nm + '.'), m: nm + '=(' + p + '+' + qs + ')(' + p + '-' + qs + ')', ans: N(val), sol: [
          ['Это произведение вида $(a+b)(a-b)$ с $a=' + p + '$ и $b=' + qs + '$, значит, оно равно $a^2-b^2$ — и корни исчезают.', nm + '=' + p + '^2-(' + qs + ')^2'],
          ['$(√' + k + ')^2=' + k + '$ по определению квадратного корня' + (q > 1 ? ', а в квадрат возводится и множитель ' + q + ': $(' + qs + ')^2=' + q + '^2*(√' + k + ')^2=' + q * q + '*' + k + '=' + q * q * k + '$.' : '.'), nm + '=' + p * p + '-' + q * q * k + '=' + val]] };
      }
      const k = r.pick([5, 6, 7, 8, 10, 11, 12, 13, 15]), p = r.ri(1, 4), val = k - p * p;
      return { q: L('Calculer ' + nm + '.', 'Вычисли ' + nm + '.'), m: nm + '=(√' + k + '+' + p + ')(√' + k + '-' + p + ')', ans: N(val), sol: [
        ['Это произведение вида $(a+b)(a-b)$ с $a=√' + k + '$ и $b=' + p + '$, значит, оно равно $a^2-b^2$.', nm + '=(√' + k + ')^2-' + p + '^2'],
        ['$(√' + k + ')^2=' + k + '$ по определению квадратного корня:', nm + '=' + k + '-' + p * p + '=' + val]] };
    }
    /* vi 3: mental calculation 102 × 98 */
    const B = r.pick([20, 30, 40, 50, 60, 70, 80, 90, 100]), d = r.ri(1, 4);
    return { q: L('Calculer mentalement ' + nm + '.', 'Вычисли в уме ' + nm + '.'), m: nm + '=' + (B + d) + '*' + (B - d), ans: N(B * B - d * d), sol: [
      ['Числа ' + (B + d) + ' и ' + (B - d) + ' стоят на одинаковом расстоянии ' + d + ' от круглого числа ' + B + ':', nm + '=(' + B + '+' + d + ')(' + B + '-' + d + ')'],
      ['По формуле $(a+b)(a-b)=a^2-b^2$:', nm + '=' + B + '^2-' + d + '^2=' + B * B + '-' + d * d + '=' + (B * B - d * d)]] };
  } });

/* ---------- cl.carres ---------- */
topic({ id: 'cl.carres', ch: 'cl', lvl: 3, calc: false, variants: 4,
  ru: 'Квадрат суммы и разности', fr: 'Les identités (a + b)² et (a − b)²',
  hints: [
    '$(a+b)^2$ — это $(a+b)(a+b)$. Раскрой как произведение двух скобок: $a^2+ab+ab+b^2=a^2+2ab+b^2$.',
    'Главная ошибка: $(a+b)^2≠a^2+b^2$. Проверь на числах: $(3+2)^2=25$, а $3^2+2^2=13$. Не хватает двух прямоугольников $ab$ — удвоенного произведения $2ab$.',
    'Так же $(a-b)^2=a^2-2ab+b^2$. Для счёта в уме: $101^2=(100+1)^2=10000+200+1=10201$.'],
  gen(r, vi) {
    const v = clfVar(r), nm = clfName(r);
    if (vi === 0) {   /* (ax ± b)² */
      const a = r.ri(1, 4), b = r.ri(1, 9) * (r() < 0.5 ? -1 : 1), P = [b, a], e = lin(a, b, v), res = Pl.str(Pl.mul(P, P), v);
      return { q: L('Développer et réduire l\'expression ' + nm + '.', 'Раскрой скобки и приведи подобные в выражении ' + nm + '.'), m: nm + '=(' + e + ')^2', ans: XP(res, { forms: ['expanded'] }), sol: [
        ['Квадрат скобки — это скобка, умноженная сама на себя:', nm + '=(' + e + ')(' + e + ')'],
        ['Раскрываем «каждое на каждое»; два средних произведения одинаковые:', nm + '=' + prodWork(P, P, v)],
        ['Приводим подобные. Получилась формула $(A' + (b > 0 ? '+' : '-') + 'B)^2=A^2' + (b > 0 ? '+' : '-') + '2AB+B^2$ с $A=' + cf(a, v) + '$ и $B=' + Math.abs(b) + '$:', nm + '=' + res]] };
    }
    if (vi === 1) {   /* QCM */
      const b = r.ri(2, 9), plus = r() < 0.5, e = '(' + lin(1, plus ? b : -b, v) + ')^2';
      const opts = plus ? [quad(1, 2 * b, b * b, v), quad(1, 0, b * b, v), quad(1, b, b * b, v), lin(2, 2 * b, v)] : [quad(1, -2 * b, b * b, v), quad(1, 0, -b * b, v), quad(1, 0, b * b, v), quad(1, -2 * b, -b * b, v)];
      const why = plus ? '$' + opts[1] + '$ — возвели в квадрат каждое слагаемое и забыли удвоенное произведение $2*' + v + '*' + b + '$; $' + opts[2] + '$ — забыли множитель 2 у среднего слагаемого; $' + opts[3] + '$ — умножили на 2 вместо того, чтобы возвести в квадрат.'
        : '$' + opts[1] + '$ — спутали с формулой $(a+b)(a-b)$; $' + opts[2] + '$ — возвели в квадрат каждое слагаемое и забыли удвоенное произведение; $' + opts[3] + '$ — ошибка в знаке: $(-' + b + ')*(-' + b + ')=' + b * b + '$.';
      return { q: L('Parmi les propositions suivantes, laquelle est égale à $' + e + '$ ?', 'Какое из выражений равно $' + e + '$?'), ans: MQ(r, opts.map(s => '$' + s + '$'), 0), sol: [
        ['$' + e + '=(' + lin(1, plus ? b : -b, v) + ')(' + lin(1, plus ? b : -b, v) + ')$. Раскрываем «каждое на каждое»:', e + '=' + prodWork([plus ? b : -b, 1], [plus ? b : -b, 1], v) + '=' + opts[0]],
        'Откуда неверные ответы: ' + why] };
    }
    if (vi === 2) {   /* 101² mentally */
      const B = r.pick([20, 30, 40, 50, 60, 70, 100]), d = r.ri(1, 3), s = r() < 0.5 ? 1 : -1, n = B + s * d, sg = s > 0 ? '+' : '-';
      return { q: L('Calculer mentalement ' + nm + '.', 'Вычисли в уме ' + nm + '.'), m: nm + '=' + n + '^2', ans: N(n * n), sol: [
        ['Записываем ' + n + ' через круглое число: $' + n + '=' + B + sg + d + '$.', nm + '=(' + B + sg + d + ')^2'],
        ['По формуле $(a' + sg + 'b)^2=a^2' + sg + '2ab+b^2$:', nm + '=' + B + '^2' + sg + '2*' + B + '*' + d + '+' + d + '^2=' + B * B + sg + 2 * B * d + '+' + d * d + '=' + n * n]] };
    }
    /* vi 3: develop, then reduce a difference */
    const a = r.nz(-6, 6), b = r.ri(1, 7), two = r() < 0.5, e = '(' + lin(1, a, v) + ')^2';
    const expr = two ? e + '-(' + lin(1, -b, v) + ')(' + lin(1, b, v) + ')' : e + '-' + v + '^2';
    const res = lin(2 * a, a * a + (two ? b * b : 0), v);
    return { q: L('Développer et réduire l\'expression ' + nm + '.', 'Раскрой скобки и приведи подобные в выражении ' + nm + '.'), m: nm + '=' + expr, ans: XP(res, { forms: ['expanded'] }), sol: [
      two ? ['Сначала ' + (a > 0 ? 'квадрат суммы' : 'квадрат разности') + ': $' + e + '=' + quad(1, 2 * a, a * a, v) + '$, и произведение суммы на разность: $(' + lin(1, -b, v) + ')(' + lin(1, b, v) + ')=' + v + '^2-' + b * b + '$. Вычитаемое берём в скобки, чтобы минус относился к нему целиком.', nm + '=' + quad(1, 2 * a, a * a, v) + '-(' + v + '^2-' + b * b + ')']
        : ['Сначала ' + (a > 0 ? 'квадрат суммы' : 'квадрат разности') + ': $' + e + '=' + quad(1, 2 * a, a * a, v) + '$ (не забываем удвоенное произведение $2*' + v + '*' + np(a) + '$).', nm + '=' + quad(1, 2 * a, a * a, v) + '-' + v + '^2'],
      [(two ? 'Раскрываем скобки со знаком минус (оба знака в скобке меняются) и приводим подобные' : 'Приводим подобные') + ' — $' + v + '^2$ уничтожается:', nm + '=' + (two ? S(v + '^2', cf(2 * a, v), a * a, '-' + v + '^2', b * b) + '=' : '') + res]] };
  } });

/* ---------- cl.factoriser ---------- */
topic({ id: 'cl.factoriser', ch: 'cl', lvl: 2, calc: false, variants: 5,
  ru: 'Разложение на множители', fr: 'Factoriser une expression',
  hints: [
    '«Factoriser» — записать сумму как произведение. Ищем множитель, который есть в каждом слагаемом: $5x+5=5*x+5*1=5(x+1)$. Это раскрытие скобок, прочитанное справа налево: $ka+kb=k(a+b)$.',
    'Выноси самый большой общий множитель — и общий делитель чисел, и общую букву: $6x^2+9x=3x*2x+3x*3=3x(2x+3)$. Проверка — раскрой скобки, должно получиться исходное выражение.',
    'Разность квадратов раскладывается так: $a^2-b^2=(a-b)(a+b)$. Например, $9x^2-25=(3x)^2-5^2=(3x-5)(3x+5)$.'],
  gen(r, vi) {
    const v = clfVar(r), nm = clfName(r);
    if (vi === 0) {   /* a common number */
      let k, a, b; do { k = r.ri(2, 9); a = r.ri(1, 9); b = r.nz(-12, 12); } while (gcd(a, Math.abs(b)) !== 1);
      const cFirst = b > 0 && r() < 0.3, expr = cFirst ? S(k * b, cf(k * a, v)) : S(cf(k * a, v), k * b), key = k + '(' + (cFirst ? S(b, cf(a, v)) : lin(a, b, v)) + ')';
      const split = cFirst ? k + '*' + b + '+' + k + '*' + cf(a, v) : k + '*' + cf(a, v) + (b < 0 ? '-' : '+') + k + '*' + Math.abs(b);
      return { q: L('Factoriser l\'expression ' + nm + '.', 'Разложи на множители выражение ' + nm + '.'), m: nm + '=' + expr, ans: XP(key, { forms: ['factorised'] }), sol: [
        ['Числа ' + k * a + ' и ' + Math.abs(k * b) + ' делятся на ' + k + ' (это их наибольший общий делитель). Записываем каждое слагаемое как произведение с множителем ' + k + ':', nm + '=' + split],
        ['Выносим общий множитель за скобки — это раскрытие скобок, прочитанное справа налево: $ka+kb=k(a+b)$.', nm + '=' + key],
        'Проверка: раскрой скобки — получится исходное выражение. В скобке общих множителей больше нет, значит, разложение полное.'] };
    }
    if (vi === 1) {   /* a common letter: 3x² + 6x = 3x(x + 2) */
      let k, a, b; do { k = r.ri(1, 6); a = r.ri(1, 6); b = r.nz(-9, 9); } while (gcd(a, Math.abs(b)) !== 1);
      const K = cf(k, v), key = K + '(' + lin(a, b, v) + ')';
      return { q: L('Factoriser l\'expression ' + nm + '.', 'Разложи на множители выражение ' + nm + '.'), m: nm + '=' + S(cf(k * a, v + '^2'), cf(k * b, v)), ans: XP(key, { forms: ['factorised'], nf: 2 }), sol: [
        ['В обоих слагаемых есть множитель $' + v + '$' + (k > 1 ? ' и число ' + k : '') + ' ($' + v + '^2=' + v + '*' + v + '$). Записываем каждое слагаемое как произведение с множителем $' + K + '$:', nm + '=' + K + '*' + cf(a, v) + (b < 0 ? '-' : '+') + K + '*' + Math.abs(b)],
        ['Выносим $' + K + '$ за скобки:', nm + '=' + key],
        'Проверка: $' + K + '*' + cf(a, v) + '=' + cf(k * a, v + '^2') + '$ и $' + K + '*' + np(b) + '=' + cf(k * b, v) + '$ — получилось исходное выражение. В скобке общего множителя больше нет — разложение полное.'] };
    }
    if (vi === 2) {   /* QCM — Centres étrangers 2026, Q7 */
      let k, b, opts; do { k = r.ri(2, 9); b = r() < 0.5 ? 1 : r.ri(2, 5); opts = [k + '(' + lin(1, b, v) + ')', k + '(' + lin(1, k * b, v) + ')', cf(k + k * b, v), cf(k * k * b, v)]; } while (!clfDistinct(opts));
      const e = S(cf(k, v), k * b);
      return { q: L('Parmi les propositions suivantes, laquelle est la forme factorisée de l\'expression $' + e + '$ ?', 'Какое из выражений — разложение на множители выражения $' + e + '$?'), ans: MQ(r, opts.map(s => '$' + s + '$'), 0), sol: [
        [(b === 1 ? 'Число $' + k + '$ — это $' + k + '*1$' : '$' + k * b + '=' + k + '*' + b + '$') + ', поэтому ' + k + ' — общий множитель обоих слагаемых:', e + '=' + k + '*' + v + '+' + k + '*' + b + '=' + opts[0]],
        'Откуда неверные ответы: $' + opts[1] + '$ — вынесли ' + k + ', но не разделили на него второе слагаемое (раскрой скобки: получится $' + S(cf(k, v), k * k * b) + '$); $' + opts[2] + '$ — сложили $' + cf(k, v) + '$ и $' + k * b + '$, хотя это не подобные слагаемые; $' + opts[3] + '$ — перемножили слагаемые вместо того, чтобы их сложить.'] };
    }
    if (vi === 3) {   /* 9x² − 25 — sujet de référence 2027 n°2, Q5 */
      let a, b; do { a = r.ri(1, 7); b = r.ri(1, 9); } while (gcd(a, b) !== 1 || a * b === 1);
      const A = a === 1 ? v : '(' + cf(a, v) + ')', key = '(' + lin(a, -b, v) + ')(' + lin(a, b, v) + ')';
      return { q: L('Factoriser l\'expression ' + nm + '.', 'Разложи на множители выражение ' + nm + '.'), m: nm + '=' + S(cf(a * a, v + '^2'), -b * b), ans: XP(key, { forms: ['factorised'], nf: 2 }), sol: [
        ['Узнаём разность квадратов: ' + (a > 1 ? '$' + cf(a * a, v + '^2') + '=(' + cf(a, v) + ')^2$' : '$' + v + '^2$ — квадрат $' + v + '$') + ' и $' + b * b + '=' + b + '^2$.', nm + '=' + A + '^2-' + b + '^2'],
        ['По формуле $A^2-B^2=(A-B)(A+B)$ с $A=' + cf(a, v) + '$ и $B=' + b + '$:', nm + '=' + key],
        'Проверка раскрытием: $(A-B)(A+B)=A^2+AB-AB-B^2=A^2-B^2$ — средние слагаемые уничтожаются, остаётся исходное выражение.'] };
    }
    /* vi 4: factorise to calculate mentally (national test of 4e) */
    const k = r.ri(11, 49), t = r.ri(0, 2); let m2, n, sum;
    if (t === 0) { m2 = r.ri(2, 8); n = 10 - m2; if (m2 === n) m2 = 3, n = 7; sum = true; }
    else if (t === 1) { m2 = r.ri(11, 89); n = 100 - m2; if (m2 === n) m2 = 45, n = 55; sum = true; }
    else { n = r.ri(1, 9); m2 = n + 10; sum = false; }
    const tot = sum ? m2 + n : m2 - n, op = sum ? '+' : '-';
    return { q: L('Calculer mentalement ' + nm + '.', 'Вычисли в уме ' + nm + '.'), m: nm + '=' + k + '*' + m2 + op + k + '*' + n, ans: N(k * tot), sol: [
      ['В обоих произведениях есть множитель ' + k + '. Выносим его за скобки — распределительное свойство в обратную сторону:', nm + '=' + k + '*(' + m2 + op + n + ')'],
      ['В скобке получается круглое число:', nm + '=' + k + '*' + tot + '=' + k * tot],
      'Частая ошибка — вынести ' + k + ' «дважды»: $(' + k + '+' + k + ')*(' + m2 + op + n + ')=' + 2 * k * tot + '$. Но ' + k + ' — общий множитель, его выносят один раз.'] };
  } });

/* ---------- cl.factoriser-plus ---------- */
topic({ id: 'cl.factoriser-plus', ch: 'cl', lvl: 3, calc: false, variants: 3,
  ru: 'Разность квадратов со скобками', fr: 'Factoriser avec a² − b² (cas avancés)',
  hints: [
    'Ищи вид $A^2-B^2$, где $A$ и $B$ могут быть целыми скобками: $(x+3)^2-16=(x+3)^2-4^2$. Тогда $A=x+3$, $B=4$.',
    'Подставляй в формулу $A^2-B^2=(A-B)(A+B)$ скобки целиком: $(x+3-4)(x+3+4)$. Если $B$ — тоже скобка, перед ней в первом множителе стоит минус, и он меняет все её знаки.',
    'В конце упрости каждую скобку: $(x+3-4)(x+3+4)=(x-1)(x+7)$. Проверить можно раскрытием обеих записей.'],
  gen(r, vi) {
    const v = clfVar(r), nm = clfName(r);
    if (vi === 0 || vi === 2) {   /* (x + a)² − b² */
      let a, b; do { a = r.nz(-6, 6); b = r.ri(2, 7); } while (a - b === 0 || a + b === 0);
      const A = lin(1, a, v), key = '(' + lin(1, a - b, v) + ')(' + lin(1, a + b, v) + ')', expr = '(' + A + ')^2-' + b * b;
      const sol = [
        ['Это разность квадратов: $' + b * b + '=' + b + '^2$, значит $A=' + A + '$ и $B=' + b + '$.', expr + '=(' + A + ')^2-' + b + '^2'],
        ['По формуле $A^2-B^2=(A-B)(A+B)$ — скобку $A$ подставляем целиком:', expr + '=(' + A + '-' + b + ')(' + A + '+' + b + ')'],
        ['Упрощаем каждую скобку:', expr + '=' + key]];
      if (vi === 0) return { q: L('Factoriser l\'expression ' + nm + '.', 'Разложи на множители выражение ' + nm + '.'), m: nm + '=' + expr, ans: XP(key, { forms: ['factorised'], nf: 2 }), sol };
      const opts = [key, '(' + lin(1, a - b * b, v) + ')(' + lin(1, a + b * b, v) + ')', '(' + lin(1, a - b, v) + ')^2', '(' + lin(1, a + b, v) + ')^2'];
      sol.push('Откуда неверные ответы: $' + opts[1] + '$ — взяли $B=' + b * b + '$, а $B$ — число, квадрат которого равен ' + b * b + ', то есть ' + b + '; $' + opts[2] + '$ и $' + opts[3] + '$ — разность квадратов раскладывается в произведение двух разных скобок $(A-B)(A+B)$, а не в квадрат одной.');
      return { q: L('Parmi les propositions suivantes, laquelle est une forme factorisée de $' + expr + '$ ?', 'Какое из выражений — разложение на множители выражения $' + expr + '$?'), ans: MQ(r, opts.map(s => '$' + s + '$'), 0), sol };
    }
    /* vi 1: (ax + b)² − (cx + d)² */
    let a, b, c, d, P1, P2;
    do { a = r.ri(1, 4); b = r.nz(-6, 6); c = r.ri(0, a - 1); d = c ? r.nz(-6, 6) : r.ri(1, 6); P1 = [b - d, a - c]; P2 = [b + d, a + c]; }
    while (gcd(a, Math.abs(b)) !== 1 || c && gcd(c, Math.abs(d)) !== 1 || gcd(Math.abs(P1[0]), Math.abs(P1[1])) !== 1 || gcd(Math.abs(P2[0]), Math.abs(P2[1])) !== 1 || P1[0] === 0 && Math.abs(P1[1]) > 1 || P2[0] === 0 && Math.abs(P2[1]) > 1);
    const A = lin(a, b, v), Bs = c ? lin(c, d, v) : String(d), expr = '(' + A + ')^2-' + (c ? '(' + Bs + ')^2' : d * d), br = P => Pl.nterms(P) > 1 ? '(' + Pl.str(P, v) + ')' : Pl.str(P, v), key = br(P1) + br(P2);
    return { q: L('Factoriser l\'expression ' + nm + '.', 'Разложи на множители выражение ' + nm + '.'), m: nm + '=' + expr, ans: XP(key, { forms: ['factorised'], nf: 2 }), sol: [
      ['Это разность квадратов $A^2-B^2$ с $A=' + A + '$ и $B=' + Bs + '$' + (c ? '' : ' (ведь $' + d * d + '=' + d + '^2$)') + '.', nm + '=(' + A + ')^2-' + (c ? '(' + Bs + ')' : d) + '^2'],
      ['По формуле $A^2-B^2=(A-B)(A+B)$, скобки подставляем целиком' + (c ? '. В первом множителе перед $B$ стоит минус — он меняет оба знака в скобке $B$' : '') + ':', nm + '=(' + A + '-' + (c ? '(' + Bs + ')' : d) + ')(' + A + '+' + (c ? Bs : d) + ')'],
      ['Упрощаем каждую скобку (приводим подобные):', nm + '=' + key]] };
  } });

/* =====================================================================================
   ÉQUATIONS
   ===================================================================================== */
/* a·t + b with t substituted, as written by hand: 3*(-2)+5 */
const clfSubLin = (a, b, t) => S((a === 1 ? '' : a === -1 ? '-' : a + '*') + np(t), b);
/* the steps that solve A·x + B = C (x is the letter v); the answer is (C − B)/A */
function clfSolveSteps(A, B, C, v) {
  const st = [];
  if (B) st.push([B > 0 ? 'Вычитаем ' + nf(B) + ' из обеих частей — равенство сохраняется:' : 'Прибавляем ' + nf(-B) + ' к обеим частям — равенство сохраняется:', cf(A, v) + '=' + fx(C - B)]);
  if (A !== 1) {
    const res = F(Math.round((C - B) * 100), Math.round(A * 100)), q1 = fx(C - B) + '/' + np(A);
    const out = [q1]; if (Fr.str(res) !== q1) out.push(Fr.str(res)); if (res.d !== 1 && clfTerm(res.d)) out.push(fx(Fr.val(res)));
    st.push(['Делим обе части на ' + nf(A) + ' (на ненулевое число делить можно):', v + '=' + out.join('=')]);
  }
  return st;
}
/* does a fraction with this denominator have a finite decimal form (only 2 and 5 in it)? */
function clfTerm(d) { d = Math.abs(d); while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; }

/* ---------- cl.eq-1 ---------- */
topic({ id: 'cl.eq-1', ch: 'cl', lvl: 1, calc: false, variants: 4,
  ru: 'Уравнения ax = c, x + b = c, ax + b = c', fr: 'Résoudre ax = c, x + b = c, ax + b = c',
  hints: [
    'Уравнение — как весы в равновесии. Если с обеими частями сделать одно и то же (прибавить или вычесть одно и то же число, умножить или разделить на одно и то же ненулевое число), равенство сохранится — а значит, и решение не изменится.',
    'Чтобы найти $x$, «отменяем» то, что с ним сделали: в $x+7=12$ к $x$ прибавили 7 — вычитаем 7 из обеих частей: $x=5$. В $3x=12$ $x$ умножили на 3 — делим обе части на 3: $x=4$.',
    'В $ax+b=c$ сначала убираем $b$ (вычитаем его из обеих частей), потом делим на $a$. Проверка: подставь ответ в исходное уравнение.'],
  gen(r, vi) {
    const v = clfVar(r);
    if (vi === 0) {   /* x + b = c */
      const x0 = r.nz(-15, 20), b = r.ri(2, 15), f = r.ri(0, 2), c = f === 1 ? x0 - b : x0 + b;
      const lhs = f === 0 ? v + '+' + b : f === 1 ? v + '-' + b : b + '+' + v, eq = lhs + '=' + c;
      return { q: L('Résoudre l\'équation ci-dessous.', 'Реши уравнение.'), m: eq, ans: SOL(String(x0), { v }), sol: [
        f === 1 ? ['Из $' + v + '$ вычли ' + b + '. Чтобы «освободить» $' + v + '$, прибавляем ' + b + ' к обеим частям: к равным числам прибавили одно и то же — равенство сохраняется.', lhs + '+' + b + '=' + c + '+' + b]
          : ['К $' + v + '$ прибавили ' + b + '. Чтобы «освободить» $' + v + '$, вычитаем ' + b + ' из обеих частей: от равных чисел отняли одно и то же — равенство сохраняется.', lhs + '-' + b + '=' + c + '-' + b],
        ['Слева остаётся только $' + v + '$:', v + '=' + x0],
        'Проверка: $' + (f === 0 ? np(x0) + '+' + b : f === 1 ? np(x0) + '-' + b : b + '+' + np(x0)) + '=' + c + '$ — верно.'] };
    }
    if (vi === 1) {   /* ax = c */
      let a; do a = r.nz(-9, 9); while (Math.abs(a) < 2 && !(a === -1 && r() < 0.5));
      let c; if (r() < 0.8 || Math.abs(a) < 2) c = a * r.nz(-12, 12); else do c = r.nz(-20, 20); while (c % a === 0);
      const res = F(c, a), eq = cf(a, v) + '=' + c;
      const st = [[a === -1 ? '$-' + v + '$ — это $(-1)*' + v + '$. Делим обе части на $-1$ (то есть меняем знаки обеих частей) — равенство сохраняется:' : '$' + cf(a, v) + '$ — это $' + a + '*' + v + '$: $' + v + '$ умножили на ' + nf(a) + '. Делим обе части на ' + nf(a) + ' — на ненулевое число делить можно, равенство сохраняется:', v + '=' + c + '/' + np(a) + '=' + Fr.str(res)]];
      st.push(res.d === 1 ? 'Проверка: $' + (a === -1 ? '-' + np(res.n) : a + '*' + np(res.n)) + '=' + c + '$ — верно.' : 'Деление нацело не получается — ответ записываем несократимой дробью $' + Fr.str(res) + '$: это точное значение, а десятичная запись была бы приближённой.');
      return { q: L('Résoudre l\'équation ci-dessous.', 'Реши уравнение.'), m: eq, ans: SOL(Fr.str(res), { v }), sol: st };
    }
    if (vi === 2) {   /* ax + b = c — sujet de référence 2027 n°1, Q5 */
      const a = r() < 0.8 ? r.ri(2, 9) : -r.ri(2, 9), x0 = r.nz(-10, 10), b = r.nz(-20, 20), c = a * x0 + b, eq = lin(a, b, v) + '=' + c;
      return { q: L('Déterminer la solution de l\'équation ci-dessous.', 'Найди решение уравнения.'), m: eq, ans: SOL(String(x0), { v }), sol: [
        ['Сначала убираем число ' + nf(b) + ' рядом с $' + cf(a, v) + '$: ' + (b > 0 ? 'вычитаем ' + b + ' из обеих частей' : 'прибавляем ' + (-b) + ' к обеим частям') + ' — равенство сохраняется.', cf(a, v) + '=' + c + (b > 0 ? '-' + b : '+' + (-b)) + '=' + (c - b)],
        ['Теперь $' + v + '$ умножен на ' + nf(a) + ' — делим обе части на ' + nf(a) + ':', v + '=' + (c - b) + '/' + np(a) + '=' + x0],
        'Проверка: $' + clfSubLin(a, b, x0) + '=' + c + '$ — верно.'] };
    }
    /* vi 3: QCM — Métropole 2026, Q5 (10x + 16 = −64) */
    let a, x0, b, c, opts;
    do { a = r.pick([2, 4, 5, 10]); x0 = r.nz(-12, 12); b = r.nz(-20, 20); c = a * x0 + b; opts = [x0, -x0, (c + b) / a, c - b - a]; } while (Math.abs(x0) < 2 || !clfDistinct(opts.map(fx)));
    const eq = lin(a, b, 'x') + '=' + c;
    return { q: L('Parmi les propositions suivantes, laquelle est la solution de l\'équation $' + eq + '$ ?', 'Какое из чисел — решение уравнения $' + eq + '$?'), ans: MQ(r, opts.map(o => '$' + fx(o) + '$'), 0), sol: [
      [(b > 0 ? 'Вычитаем ' + b + ' из обеих частей' : 'Прибавляем ' + (-b) + ' к обеим частям') + ', затем делим на ' + a + ':', cf(a, 'x') + '=' + (c - b) + ';x=' + (c - b) + '/' + a + '=' + x0],
      'Можно и не решать, а проверить варианты подстановкой: $' + clfSubLin(a, b, x0) + '=' + c + '$ — подходит только $' + x0 + '$.',
      'Откуда неверные ответы: $' + fx(-x0) + '$ — ошибка в знаке; $' + fx(opts[2]) + '$ — с числом ' + nf(b) + ' сделали не то действие: ' + (b > 0 ? 'прибавили ' + b + ' к обеим частям вместо того, чтобы вычесть' : 'вычли ' + (-b) + ' вместо того, чтобы прибавить') + '; $' + fx(opts[3]) + '$ — вместо деления на ' + a + ' вычли ' + a + '.'] };
  } });

/* ---------- cl.eq-2 ---------- */
topic({ id: 'cl.eq-2', ch: 'cl', lvl: 2, calc: false, variants: 4,
  ru: 'Уравнения ax + b = cx + d, со скобками', fr: 'Résoudre ax + b = cx + d',
  hints: [
    'Цель — собрать все $x$ в одной части, а числа — в другой. Вычитаем одно и то же слагаемое с $x$ из обеих частей: равенство сохраняется, а $x$ остаётся только с одной стороны.',
    'Если есть скобки, сначала раскрой их («développer») и приведи подобные в каждой части отдельно.',
    'Получится уравнение вида $ax=b$: делим обе части на $a$. Ответ может быть дробью — её оставляют несократимой. Проверь ответ подстановкой в обе части.'],
  gen(r, vi) {
    const v = vi === 3 ? 'x' : clfVar(r);
    /* a·v + b = c·v + d → steps */
    const core = (a, b, c, d) => {
      const st = [['Вычитаем $' + cf(c, v) + '$ из обеих частей, чтобы $' + v + '$ остался только слева' + (c < 0 ? ' (вычесть $' + cf(c, v) + '$ — то же, что прибавить $' + cf(-c, v) + '$)' : '') + ':', lin(a - c, b, v) + '=' + d]];
      return st.concat(clfSolveSteps(a - c, b, d, v));
    };
    if (vi === 0 || vi === 2) {   /* vi 2: the solution is a fraction */
      let a, c, b, d;
      if (vi === 0) { let x0; do { a = r.nz(-9, 9); c = r.nz(-9, 9); b = r.nz(-15, 15); x0 = r.nz(-9, 9); d = (a - c) * x0 + b; } while (a === c || d === 0 || Math.abs(d) > 40); }
      else { do { c = r.nz(-6, 9); a = c + r.ri(2, 6); b = r.nz(-15, 15); d = r.nz(-15, 15); } while (a === 0 || (d - b) % (a - c) === 0); }
      const res = F(d - b, a - c), eq = lin(a, b, v) + '=' + lin(c, d, v), st = core(a, b, c, d);
      if (vi === 2) st.push(clfTerm(res.d) ? 'Деление нацело не получается. Ответ можно записать несократимой дробью $' + Fr.str(res) + '$ или десятичной $' + fx(Fr.val(res)) + '$ — это одно и то же число.' : 'Деление нацело не получается, и десятичная запись была бы бесконечной — ответ записываем несократимой дробью $' + Fr.str(res) + '$: это точное значение.');
      else st.push('Проверка: слева $' + clfSubLin(a, b, res.n) + '=' + (a * res.n + b) + '$, справа $' + clfSubLin(c, d, res.n) + '=' + (c * res.n + d) + '$ — равны.');
      return { q: L('Résoudre l\'équation ci-dessous.', 'Реши уравнение.'), m: eq, ans: SOL(Fr.str(res), { v }), sol: st };
    }
    if (vi === 1) {   /* with brackets */
      let k, p, q, c, d, x0;
      do { k = r.nz(-5, 6); p = r() < 0.7 ? 1 : r.ri(2, 3); q = r.nz(-9, 9); c = r.nz(-9, 9); x0 = r.nz(-8, 8); d = (k * p - c) * x0 + k * q; } while (Math.abs(k) < 2 || k * p === c || Math.abs(d) > 40 || d === 0);
      const br = k + '(' + lin(p, q, v) + ')', right = r() < 0.3, eq = right ? lin(c, d, v) + '=' + br : br + '=' + lin(c, d, v);
      const st = [['Сначала раскрываем скобки: $' + k + '$ умножаем на каждое слагаемое в скобке.', right ? lin(c, d, v) + '=' + lin(k * p, k * q, v) : lin(k * p, k * q, v) + '=' + lin(c, d, v)]];
      if (right) st.push(['Поменяем части местами (равенство читается в обе стороны) — так $' + v + '$ удобнее собирать слева:', lin(k * p, k * q, v) + '=' + lin(c, d, v)]);
      return { q: L('Résoudre l\'équation ci-dessous.', 'Реши уравнение.'), m: eq, ans: SOL(String(x0), { v }), sol: st.concat(core(k * p, k * q, c, d)).concat(['Проверка: при $' + v + '=' + x0 + '$ обе части равны $' + (c * x0 + d) + '$.']) };
    }
    /* vi 3: put the steps of a solution in order */
    let a, c, b, x0, d;
    do { c = r.ri(1, 6); a = c + r.ri(2, 5); b = r.nz(-12, 12); x0 = r.nz(-6, 9); d = (a - c) * x0 + b; } while (d === 0 || Math.abs(d) > 40);
    const eq = lin(a, b) + '=' + lin(c, d), A = a - c, L1 = a * x0 + b;
    return { q: L('Remettre dans l\'ordre les étapes de la résolution de l\'équation ci-dessous.', 'Расставь по порядку шаги решения уравнения.'), m: eq, ans: ORD(r, [
      L('On soustrait $' + cf(c, 'x') + '$ aux deux membres : $' + lin(A, b) + '=' + d + '$.', 'Вычитаем $' + cf(c, 'x') + '$ из обеих частей: $' + lin(A, b) + '=' + d + '$.'),
      L((b > 0 ? 'On soustrait $' + b + '$' : 'On ajoute $' + (-b) + '$') + ' aux deux membres : $' + cf(A, 'x') + '=' + (d - b) + '$.', (b > 0 ? 'Вычитаем $' + b + '$ из обеих частей' : 'Прибавляем $' + (-b) + '$ к обеим частям') + ': $' + cf(A, 'x') + '=' + (d - b) + '$.'),
      L('On divise les deux membres par $' + A + '$ : $x=' + x0 + '$.', 'Делим обе части на $' + A + '$: $x=' + x0 + '$.'),
      L('On vérifie : pour $x=' + x0 + '$, chaque membre vaut $' + L1 + '$.', 'Проверяем: при $x=' + x0 + '$ каждая часть равна $' + L1 + '$.')]), sol: [
        'Сначала собираем все $x$ в одной части, потом числа — в другой, затем делим на коэффициент при $x$. Проверка — в самом конце, когда решение уже найдено.',
        'Каждый шаг сохраняет равенство: с обеими частями делаем одно и то же.'] };
  } });

/* ---------- cl.eq-produit ---------- */
topic({ id: 'cl.eq-produit', ch: 'cl', lvl: 3, calc: false, variants: 4,
  ru: 'Уравнение-произведение и x² = a', fr: 'Équation produit et équation x² = a',
  hints: [
    'Произведение равно нулю тогда и только тогда, когда хотя бы один множитель равен нулю: если оба множителя не нули, их произведение тоже не ноль. Поэтому $(x-3)(x+5)=0$ означает: $x-3=0$ или $x+5=0$.',
    'Каждое маленькое уравнение решаем отдельно: $x-3=0$ даёт $x=3$, $x+5=0$ даёт $x=-5$. Ответ — оба числа.',
    'Уравнение $x^2=a$: при $a>0$ два решения, $√a$ и $-√a$ (ведь и $(-3)^2=9$); при $a=0$ одно решение $0$; при $a<0$ решений нет — квадрат не бывает отрицательным.'],
  gen(r, vi) {
    const v = clfVar(r);
    if (vi === 0 || vi === 1) {
      let P, Q;
      if (vi === 0) {
        if (r() < 0.25) { const p = r.nz(-9, 9); P = [0, 1]; Q = [-p, 1]; }
        else { let p, q; do { p = r.nz(-9, 9); q = r.nz(-9, 9); } while (p === -q); P = [-p, 1]; Q = [q, 1]; }
      } else { let a, b, c, d; do { a = r.ri(1, 5); c = r.ri(2, 5); b = r.nz(-9, 9); d = r.nz(-9, 9); } while (b * c === a * d || gcd(a, Math.abs(b)) !== 1 || gcd(c, Math.abs(d)) !== 1); P = [b, a]; Q = [d, c]; }
      const ps = Pl.str(P, v), qs = Pl.str(Q, v), eq = (Pl.nterms(P) > 1 ? '(' + ps + ')' : ps) + '(' + qs + ')=0';
      const r1 = F(-P[0], P[1]), r2 = F(-Q[0], Q[1]);
      const one = (Pq, rr) => Pq[0] === 0 ? '$' + Pl.str(Pq, v) + '=0$ — это уже ответ' : '$' + Pl.str(Pq, v) + '=0$ даёт ' + (Pq[1] === 1 ? '$' + v + '=' + Fr.str(rr) + '$' : '$' + cf(Pq[1], v) + '=' + (-Pq[0]) + '$, то есть $' + v + '=' + Fr.str(rr) + '$');
      return { q: L('Résoudre l\'équation ci-dessous.', 'Реши уравнение.'), m: eq, ans: SOL(Fr.str(r1) + ', ' + Fr.str(r2), { v }), sol: [
        'Слева произведение, справа ноль. Произведение равно нулю, только если хотя бы один множитель равен нулю: если оба множителя не нули, то и произведение не ноль. Поэтому $' + ps + '=0$ или $' + qs + '=0$.',
        'Решаем каждое уравнение: ' + one(P, r1) + '; ' + one(Q, r2) + '.',
        'Ответ — два решения: $' + Fr.str(r1) + '$ и $' + Fr.str(r2) + '$. Проверка: при каждом из них один из множителей обращается в ноль.'] };
    }
    if (vi === 2) {   /* x² = a */
      const f = r.ri(0, 3);
      if (f === 2) {
        const m2 = r.pick([2, 3, 5, 6, 7, 10, 11, 13, 15]);
        return { q: L('Résoudre l\'équation ci-dessous.', 'Реши уравнение.'), m: v + '^2=' + m2, ans: SOL('-√' + m2 + ', √' + m2, { v }), sol: [
          'Ищем числа, квадрат которых равен ' + m2 + '. Положительное такое число — $√' + m2 + '$ (по определению корня), а отрицательное — $-√' + m2 + '$: ведь $(-√' + m2 + ')^2=(√' + m2 + ')^2=' + m2 + '$.',
          [m2 + ' не квадрат целого числа, поэтому ответ оставляем с корнем:', v + '=√' + m2 + ';' + v + '=-√' + m2]] };
      }
      const k = r.ri(2, 12), c = r.ri(1, 30);
      const eq = f === 0 ? v + '^2=' + k * k : f === 1 ? v + '^2-' + k * k + '=0' : v + '^2+' + c + '=' + (k * k + c);
      const first = f === 0 ? null : f === 1 ? ['Можно перенести число: прибавим ' + k * k + ' к обеим частям. (Или разложить: $' + v + '^2-' + k * k + '=(' + v + '-' + k + ')(' + v + '+' + k + ')$ — получится уравнение-произведение с теми же решениями.)', v + '^2=' + k * k] : ['Вычитаем ' + c + ' из обеих частей:', v + '^2=' + k * k];
      const st = first ? [first] : [];
      st.push(['Квадрат равен ' + k * k + ' у двух чисел: $' + k + '^2=' + k * k + '$ и $(-' + k + ')^2=' + k * k + '$ (минус на минус даёт плюс). Поэтому решений два:', v + '=' + k + ';' + v + '=-' + k]);
      st.push('Частая ошибка — забыть отрицательное решение $-' + k + '$.');
      return { q: L('Résoudre l\'équation ci-dessous.', 'Реши уравнение.'), m: eq, ans: SOL('-' + k + ', ' + k, { v }), sol: st };
    }
    /* vi 3: how many solutions */
    const s = r.pick([-25, -16, -9, -4, -1, -3, -7, 0, 0, 4, 9, 16, 25, 36, 49, 5, 7, 10, 3]), c = r() < 0.3 ? r.ri(1, 9) : 0;
    const eq = c ? v + '^2+' + c + '=' + (s + c) : v + '^2=' + s, nSol = s > 0 ? 2 : s === 0 ? 1 : 0;
    const opts = [L('Aucune solution', 'Ни одного решения'), L('Une seule solution', 'Ровно одно решение'), L('Deux solutions', 'Два решения'), L('Une infinité de solutions', 'Бесконечно много решений')];
    const rt2 = Number.isInteger(Math.sqrt(s)) ? String(Math.sqrt(s)) : '√' + s;
    const why = nSol === 2 ? 'Число ' + s + ' положительное — квадрат равен ему у двух чисел: $' + v + '=' + rt2 + '$ и $' + v + '=-' + rt2 + '$ (квадрат отрицательного числа тоже положителен). Решений два.'
      : nSol === 1 ? 'Квадрат равен нулю только у самого нуля: если $' + v + '≠0$, то $' + v + '^2>0$. Решение одно: $' + v + '=0$.'
      : 'Квадрат любого числа не бывает отрицательным: $' + v + '^2≥0$. Значит, $' + v + '^2=' + s + '$ не выполняется ни при каком $' + v + '$ — решений нет.';
    return { q: L('Combien de solutions l\'équation ci-dessous a-t-elle ?', 'Сколько решений у этого уравнения?'), m: eq, ans: MQ(r, opts, nSol === 2 ? 2 : nSol === 1 ? 1 : 0), sol: (c ? [['Сначала вычитаем ' + c + ' из обеих частей:', v + '^2=' + s]] : []).concat([why]) };
  } });

/* ---------- cl.tester ---------- */
topic({ id: 'cl.tester', ch: 'cl', lvl: 1, calc: false, variants: 3,
  ru: 'Является ли число решением', fr: 'Tester si un nombre est solution d\'une équation',
  hints: [
    'Число — решение уравнения, если после подстановки его вместо $x$ левая и правая части дают одно и то же число. Решать уравнение для этого не нужно — достаточно подставить.',
    'Считай каждую часть отдельно и сравни. Отрицательное число подставляй в скобках: при $x=-2$ выражение $x^2+3x$ равно $(-2)^2+3*(-2)=4-6=-2$.'],
  gen(r, vi) {
    const q = t => L('Affirmation : « le nombre $' + t + '$ est une solution de l\'équation ci-dessous ». Cette affirmation est-elle vraie ou fausse ?', 'Утверждение: «число $' + t + '$ — решение уравнения ниже». Это утверждение верно или неверно?');
    const verdict = (ok, t, lv, rv) => ok ? 'Части равны — значит, $' + t + '$ является решением. Утверждение верно.' : 'Части не равны ($' + lv + '≠' + rv + '$) — значит, $' + t + '$ не решение. Утверждение неверно.';
    if (vi === 0) {   /* ax + b = cx + d */
      let a, c, b, x0, d; do { a = r.nz(-6, 9); c = r.nz(-6, 9); b = r.nz(-12, 12); x0 = r.nz(-6, 6); d = (a - c) * x0 + b; } while (a === c || d === 0 || Math.abs(d) > 30);
      const ok = r() < 0.5, t = ok ? x0 : x0 + r.pick([-2, -1, 1, 2]), lv = a * t + b, rv = c * t + d;
      return { q: q(t), m: lin(a, b) + '=' + lin(c, d), ans: TF(ok), sol: [
        ['Подставляем $x=' + t + '$ в левую часть:', clfSubLin(a, b, t) + '=' + lv], ['И в правую часть:', clfSubLin(c, d, t) + '=' + rv], verdict(ok, t, lv, rv)] };
    }
    /* x² + bx = c with integer roots r1, r2 */
    let r1, r2; do { r1 = r.nz(-6, 6); r2 = r.nz(-6, 6); } while (r1 === r2 || r1 + r2 === 0);
    const b = -(r1 + r2), c = -r1 * r2, eq = quad(1, b, 0) + '=' + c;
    const sub = t => np(t) + '^2' + (b === 1 ? '+' : b === -1 ? '-' : (b < 0 ? '-' + (-b) : '+' + b) + '*') + np(t), val = t => t * t + b * t;
    if (vi === 1) {
      const ok = r() < 0.5; let t;
      if (ok) t = r.pick([r1, r2]); else do t = r.pick([-r1, -r2, r1 + 1, r2 - 1, c]); while (t === r1 || t === r2 || t === 0);
      return { q: q(t), m: eq, ans: TF(ok), sol: [
        ['Подставляем $x=' + t + '$ в левую часть' + (t < 0 ? ' (отрицательное число — в скобках)' : '') + ':', sub(t) + '=' + (t * t) + (b * t < 0 ? '' : '+') + (b * t) + '=' + val(t)],
        'Правая часть равна ' + nf(c) + '. ' + verdict(ok, t, val(t), c)] };
    }
    /* vi 2: QCM — which number is a solution */
    const good = r.pick([r1, r2]); const bad = [];
    for (const t of r.sh([-r1, -r2, c, r1 + r2, good + 1, good - 1, 2 * good, -c])) if (t !== r1 && t !== r2 && !bad.includes(t) && bad.length < 3) bad.push(t);
    const opts = [good].concat(bad);
    return { q: L('Parmi les nombres suivants, lequel est une solution de l\'équation ci-dessous ?', 'Какое из чисел — решение уравнения ниже?'), m: eq, ans: MQ(r, opts.map(o => '$' + o + '$'), 0), sol: [
      'Решать уравнение не нужно: подставим каждое число в левую часть и сравним с правой частью ' + nf(c) + '.',
      ['Значения левой части:', opts.map(t => sub(t) + '=' + val(t)).join(';')],
      'Правой части ' + nf(c) + ' равна левая часть только при $x=' + good + '$ — это решение. (У этого уравнения есть и второе решение, но среди вариантов его нет.)'] };
  } });

/* ---------- cl.mise-en-equation ---------- */
/* French elision before a first name: d'Emma, qu'Inès, de Lucas */
const clfDe = n => (/^[AEIOUÉH]/.test(n) ? 'd\'' : 'de ') + n;
const clfQue = n => (/^[AEIOUÉH]/.test(n) ? 'qu\'' : 'que ') + n;
/* situations: text, the right equation, three wrong ones (with why), and the reduced form A·x + B = C */
const clfSituations = [
  r => { const F = r.pick(PRENOMS_F), M = r.pick(PRENOMS_M), k = r.ri(2, 5), x = r.ri(5, 14), T = (k + 1) * x;
    return { fr: F + ' a ' + k + ' fois l\'âge de son frère ' + M + '. À eux deux, ils ont ' + T + ' ans. On note $x$ l\'âge ' + clfDe(M) + ', en années.',
      ru: F + ' в ' + clfRaz(k) + ' старше своего брата ' + M + '. Вместе им ' + clfPl(T, 'год', 'года', 'лет') + '. Обозначим через $x$ возраст ' + M + ' (в годах).',
      ok: 'x+' + k + 'x=' + T, bad: [k + 'x=' + T, 'x+' + k + '=' + T, k + 'x-x=' + T], redTxt: 'Приводим подобные: $x+' + k + 'x=' + (k + 1) + 'x$.',
      why: ['это только возраст ' + F + ', а ' + T + ' — сумма двух возрастов', '«в ' + clfRaz(k) + ' старше» означает умножение на ' + k + ', а не «на ' + k + ' года старше»', 'это разность возрастов, а в условии сумма'],
      setup: 'Возраст ' + M + ' — $x$, тогда возраст ' + F + ' — $' + k + 'x$ (в ' + clfRaz(k) + ' больше). Вместе им ' + T + ':', A: k + 1, B: 0, C: T, x,
      ask: L('Quel est l\'âge ' + clfDe(M) + ' ?', 'Сколько лет ' + M + '?'), unit: 'ans', red: (k + 1) + 'x=' + T }; },
  r => { const e = r.ri(2, 9), w = r.ri(3, 15), P = 4 * w + 2 * e;
    return { fr: 'La longueur d\'un rectangle mesure ' + e + ' cm de plus que sa largeur. Son périmètre est égal à ' + P + ' cm. On note $x$ la largeur du rectangle, en cm.',
      ru: 'Длина прямоугольника на ' + e + ' см больше его ширины. Периметр прямоугольника равен ' + P + ' см. Обозначим через $x$ его ширину (в см).',
      ok: '2(x+x+' + e + ')=' + P, bad: ['x+x+' + e + '=' + P, 'x(x+' + e + ')=' + P, '4x+' + e + '=' + P],
      why: ['это половина периметра: у прямоугольника две длины и две ширины', 'это площадь прямоугольника, а не периметр', 'длина $x+' + e + '$ входит в периметр дважды, значит, и ' + e + ' надо взять дважды'],
      setup: 'Ширина — $x$, длина — $x+' + e + '$. Периметр — две длины и две ширины:', A: 4, B: 2 * e, C: P, x: w,
      ask: L('Quelle est la largeur du rectangle ?', 'Какова ширина прямоугольника?'), unit: 'cm', red: '4x+' + 2 * e + '=' + P }; },
  r => { const F = r.pick(PRENOMS_F), n = r.ri(3, 6), x = r.pick([1.5, 2, 2.5, 3, 3.5, 4, 5]), p = r.ri(7, 15), T = n * x + p;
    return { fr: F + ' achète ' + n + ' cahiers identiques et un livre à ' + eur(p) + '. Elle paie ' + eur(T) + ' en tout. On note $x$ le prix d\'un cahier, en euros.',
      ru: F + ' покупает ' + n + (n < 5 ? ' одинаковые тетради' : ' одинаковых тетрадей') + ' и книгу за ' + eur(p) + '. Всего она платит ' + eur(T) + '. Обозначим через $x$ цену одной тетради (в евро).',
      ok: n + 'x+' + p + '=' + fx(T), bad: [n + '(x+' + p + ')=' + fx(T), p + 'x+' + n + '=' + fx(T), n + 'x=' + fx(T) + '+' + p],
      why: ['так было бы, если бы книгу покупали вместе с каждой тетрадью', 'перепутаны количество и цена: цену тетради $x$ умножают на число тетрадей ' + n, 'цену книги нужно вычесть из общей суммы, а не прибавить к ней'],
      setup: clfPl(n, 'тетрадь', 'тетради', 'тетрадей') + ' по $x$ евро стоят $' + n + 'x$, плюс книга за ' + eur(p) + ':', A: n, B: p, C: T, x,
      ask: L('Quel est le prix d\'un cahier ?', 'Сколько стоит одна тетрадь?'), unit: '€' }; },
  r => { const x = r.ri(10, 40), T = 3 * x + 3;
    return { fr: 'La somme de trois nombres entiers consécutifs est égale à ' + T + '. On note $x$ le plus petit de ces trois nombres.',
      ru: 'Сумма трёх последовательных целых чисел равна ' + T + '. Обозначим через $x$ наименьшее из них.',
      ok: 'x+(x+1)+(x+2)=' + T, bad: ['3x=' + T, 'x+1+2=' + T, 'x(x+1)(x+2)=' + T],
      why: ['так было бы, если бы все три числа были равны $x$', 'потеряли $x$ во втором и третьем числе: следующие числа — $x+1$ и $x+2$', 'в условии сумма, а не произведение'],
      setup: 'Последовательные целые числа идут подряд: $x$, $x+1$, $x+2$. Их сумма:', A: 3, B: 3, C: T, x,
      ask: L('Quel est le plus petit de ces trois nombres ?', 'Чему равно наименьшее из этих трёх чисел?'), unit: '', red: '3x+3=' + T }; },
  r => { const F = r.pick(PRENOMS_F), M = r.pick(PRENOMS_M), x = r.ri(8, 40), d = r.ri(2, 15), T = 2 * x + d;
    return { fr: M + ' et ' + F + ' se partagent ' + eur(T) + '. ' + M + ' reçoit ' + eur(d) + ' de plus ' + clfQue(F) + '. On note $x$ la part ' + clfDe(F) + ', en euros.',
      ru: M + ' и ' + F + ' делят между собой ' + eur(T) + '. ' + M + ' получает на ' + eur(d) + ' больше, чем ' + F + '. Обозначим через $x$ долю ' + F + ' (в евро).',
      ok: 'x+(x+' + d + ')=' + T, bad: ['x+' + d + '=' + T, d + 'x=' + T, '2x=' + T + '+' + d],
      why: ['это только доля ' + M + ', а ' + eur(T) + ' — сумма обеих долей', '«на ' + d + ' больше» — значит прибавить ' + d + ', а не умножить', 'лишние ' + eur(d) + ' надо вычесть из суммы, а не прибавить к ней'],
      setup: 'Доля ' + F + ' — $x$, доля ' + M + ' — $x+' + d + '$. Вместе ' + eur(T) + ':', A: 2, B: d, C: T, x,
      ask: L('Quelle est la part ' + clfDe(F) + ' ?', 'Какова доля ' + F + '?'), unit: '€', red: '2x+' + d + '=' + T }; },
  r => { const b = r.ri(4, 7), c = r.pick([1.5, 2, 2.5, 3]), x = r.ri(4, 20), T = b + c * x;
    return { fr: 'Un taxi facture ' + eur(b) + ' de prise en charge, puis ' + eur(c) + ' par kilomètre parcouru. Une course a coûté ' + eur(T) + '. On note $x$ le nombre de kilomètres parcourus.',
      ru: 'Такси берёт ' + eur(b) + ' за посадку и ' + eur(c) + ' за каждый километр. Поездка стоила ' + eur(T) + '. Обозначим через $x$ число проеханных километров.',
      ok: b + '+' + fx(c) + 'x=' + fx(T), bad: [fx(c) + '(x+' + b + ')=' + fx(T), b + 'x+' + fx(c) + '=' + fx(T), fx(b + c) + 'x=' + fx(T)],
      why: ['за посадку платят один раз, а не за каждый километр', 'перепутаны цены: за километр платят ' + eur(c) + ', а за посадку ' + eur(b), 'сложили обе цены, как будто за посадку платят на каждом километре'],
      setup: 'За $x$ километров платят $' + fx(c) + 'x$, и ещё ' + eur(b) + ' за посадку:', A: c, B: b, C: T, x,
      ask: L('Combien de kilomètres ont été parcourus ?', 'Сколько километров проехали?'), unit: 'km' }; },
  r => { const k = r.ri(2, 3); let x, t; do { x = r.ri(15, 40); t = 180 - (k + 1) * x; } while (t < 10 || t > 110);
    return { fr: 'Dans un triangle, un premier angle mesure $x$ degrés, le deuxième mesure ' + (k === 2 ? 'le double' : 'le triple') + ' du premier et le troisième mesure ' + t + '°.',
      ru: 'В треугольнике первый угол равен $x$ градусов, второй — в ' + (k === 2 ? 'два' : 'три') + ' раза больше первого, а третий равен ' + t + '°.',
      ok: 'x+' + k + 'x+' + t + '=180', bad: ['x+' + k + 'x=' + t, 'x+' + k + '+' + t + '=180', k + 'x+' + t + '=180'],
      why: ['сумма углов треугольника равна 180°, а не третьему углу', '«в ' + clfRaz(k) + ' больше» — это $' + k + 'x$, а не $x+' + k + '$', 'забыли первый угол $x$'],
      setup: 'Сумма углов треугольника равна 180°. Углы — $x$, $' + k + 'x$ и ' + t + '°:', A: k + 1, B: t, C: 180, x,
      ask: L('Combien mesure le premier angle ?', 'Чему равен первый угол?'), unit: '°', red: (k + 1) + 'x+' + t + '=180', redTxt: 'Приводим подобные: $x+' + k + 'x=' + (k + 1) + 'x$.' }; }];
topic({ id: 'cl.mise-en-equation', ch: 'cl', lvl: 2, calc: false, variants: 2,
  ru: 'Составить уравнение по условию', fr: 'Mettre un problème en équation',
  hints: [
    'Неизвестное ($x$) уже названо в условии. Вырази через $x$ все остальные величины: «в 3 раза больше» — $3x$, «на 5 больше» — $x+5$, «следующее целое число» — $x+1$.',
    'Найди в тексте одну величину, известную двумя способами (сумма, цена, периметр…): через $x$ и числом. Приравняй — это и есть уравнение.',
    'Реши уравнение и проверь ответ по условию задачи: подставь его в текст и посмотри, всё ли сходится.'],
  gen(r, vi) {
    const s = r.pick(clfSituations)(r);
    if (vi === 0) {
      return { q: L(s.fr + ' Parmi les équations suivantes, laquelle traduit cette situation ?', s.ru + ' Какое из уравнений описывает эту ситуацию?'), ans: MQ(r, [s.ok].concat(s.bad).map(e => '$' + e + '$'), 0), sol: [
        [s.setup, s.ok],
        'Откуда неверные варианты: ' + s.bad.map((e, i) => '$' + e + '$ — ' + s.why[i]).join('; ') + '.'] };
    }
    const st = [[s.setup, s.ok]];
    if (s.red && s.red !== s.ok) st.push([s.redTxt || 'Раскрываем скобки и приводим подобные:', s.red]);
    return { q: L(s.fr + ' ' + s.ask.fr, s.ru + ' ' + s.ask.ru), ans: N(fx(s.x), s.unit ? { unit: s.unit } : {}),
      sol: st.concat(clfSolveSteps(s.A, s.B, s.C, 'x')).concat(['Проверка по условию: при $x=' + fx(s.x) + '$ получаем $' + s.ok.split('=')[0].replace(/x/g, '*' + np(s.x)).replace(/(^|[(+\-])\*/g, '$1') + '=' + fx(s.C) + '$ — всё сходится.']) };
  } });

/* =====================================================================================
   PROGRAMMES DE CALCUL
   an operation: { t: 'add'|'sub'|'mul'|'div'|'mulx'|'addx'|'subx'|'sq'|'subsq', a }
   ===================================================================================== */
const clfMult = k => ({ 1: ['le nombre de départ', 'исходное число'], 2: ['le double du nombre de départ', 'удвоенное исходное число'], 3: ['le triple du nombre de départ', 'утроенное исходное число'], 4: ['le quadruple du nombre de départ', 'учетверённое исходное число'] })[k];
function clfOp(o) {
  switch (o.t) {
    case 'add': return ['Ajouter ' + nf(o.a), 'прибавить ' + nf(o.a)];
    case 'sub': return ['Soustraire ' + nf(o.a), 'вычесть ' + nf(o.a)];
    case 'mul': return ['Multiplier par ' + nf(o.a), 'умножить на ' + nf(o.a)];
    case 'div': return ['Diviser par ' + nf(o.a), 'разделить на ' + nf(o.a)];
    case 'mulx': return ['Multiplier par le nombre de départ', 'умножить на исходное число'];
    case 'addx': return ['Ajouter ' + clfMult(o.a)[0], 'прибавить ' + clfMult(o.a)[1]];
    case 'subx': return ['Soustraire ' + clfMult(o.a)[0], 'вычесть ' + clfMult(o.a)[1]];
    case 'sq': return ['Élever le résultat au carré', 'возвести результат в квадрат'];
    default: return ['Soustraire le carré du nombre de départ', 'вычесть квадрат исходного числа'];
  }
}
/* the value after each step, for the starting number x0 */
function clfRun(ops, x0) {
  let v = x0;
  return ops.map(o => { switch (o.t) { case 'add': v += o.a; break; case 'sub': v -= o.a; break; case 'mul': v *= o.a; break; case 'div': v /= o.a; break; case 'mulx': v *= x0; break; case 'addx': v += o.a * x0; break; case 'subx': v -= o.a * x0; break; case 'sq': v *= v; break; default: v -= x0 * x0; } return v; });
}
/* the result as a polynomial in x (array low → high) */
function clfPoly(ops) {
  let P = [0, 1];
  ops.forEach(o => { switch (o.t) { case 'add': P = Pl.add(P, [o.a]); break; case 'sub': P = Pl.add(P, [-o.a]); break; case 'mul': P = Pl.sc(P, o.a); break; case 'div': P = Pl.sc(P, 1 / o.a); break; case 'mulx': P = Pl.mul(P, [0, 1]); break; case 'addx': P = Pl.add(P, [0, o.a]); break; case 'subx': P = Pl.add(P, [0, -o.a]); break; case 'sq': P = Pl.mul(P, P); break; default: P = Pl.add(P, [0, 0, -1]); } });
  return Pl.trim(P.map(c => Math.round(c * 1e9) / 1e9));
}
/* the result written as a pupil writes it; br = false: the classic slip without brackets */
function clfExpr(ops, br) {
  if (br == null) br = true;
  let e = 'x', sum = false;
  ops.forEach(o => {
    switch (o.t) {
      case 'add': e += '+' + o.a; sum = true; break;
      case 'sub': e += '-' + o.a; sum = true; break;
      case 'mul': e = e === 'x' ? cf(o.a, 'x') : sum && br ? o.a + '(' + e + ')' : e + '*' + np(o.a); sum = false; break;
      case 'div': e = (sum && br ? '(' + e + ')' : e) + '/' + o.a; sum = false; break;
      case 'mulx': e = e === 'x' ? 'x^2' : sum && br ? 'x(' + e + ')' : e + '*x'; sum = false; break;
      case 'addx': e += '+' + cf(o.a, 'x'); sum = true; break;
      case 'subx': e += '-' + cf(o.a, 'x'); sum = true; break;
      case 'sq': e = e === 'x' ? 'x^2' : br ? '(' + e + ')^2' : e + '^2'; sum = false; break;
      default: e += '-x^2'; sum = true;
    }
  });
  return e;
}
/* the program as on the exam (French), and in words for the Russian translation */
const clfProgFig = ops => tbl([['Programme de calcul'], ['Choisir un nombre']].concat(ops.map(o => [clfOp(o)[0]])));
const clfProgRu = ops => 'выбрать число; ' + ops.map(o => clfOp(o)[1]).join('; ');
/* steps of the program for a number */
function clfRunSteps(ops, x0) {
  const vals = clfRun(ops, x0); let prev = x0;
  return ops.map((o, i) => {
    let m;
    switch (o.t) {
      case 'add': m = fx(prev) + '+' + o.a; break;
      case 'sub': m = fx(prev) + '-' + o.a; break;
      case 'mul': m = fx(prev) + '*' + np(o.a); break;
      case 'div': m = fx(prev) + '÷' + o.a; break;
      case 'mulx': m = fx(prev) + '*' + np(x0); break;
      case 'addx': m = fx(prev) + '+' + (o.a === 1 ? np(x0) : o.a + '*' + np(x0)); break;
      case 'subx': m = fx(prev) + '-' + (o.a === 1 ? np(x0) : o.a + '*' + np(x0)); break;
      case 'sq': m = np(prev) + '^2'; break;
      default: m = fx(prev) + '-' + np(x0) + '^2';
    }
    prev = vals[i]; const t = clfOp(o)[1];
    return [t[0].toUpperCase() + t.slice(1) + ':', m + '=' + fx(vals[i])];
  });
}
/* the programs of the brevet level: 0–2 give a linear result, 3–4 a square */
function clfProgram(r, linOnly) {
  const t = r.ri(0, linOnly ? 2 : 4);
  if (t === 0) return [{ t: 'add', a: r.ri(1, 9) }, { t: 'mul', a: r.ri(2, 6) }, { t: 'sub', a: r.ri(1, 12) }];
  if (t === 1) { let k; do k = r.nz(-5, 5); while (Math.abs(k) < 2); return [{ t: 'mul', a: k }, { t: 'add', a: r.ri(1, 9) }, { t: 'mul', a: r.ri(2, 5) }]; }
  if (t === 2) return [{ t: 'sub', a: r.ri(1, 6) }, { t: 'mul', a: r.ri(2, 6) }, { t: 'addx', a: r.ri(1, 3) }];
  if (t === 3) return [{ t: 'add', a: r.ri(1, 6) }, { t: 'mulx' }, { t: 'sub', a: r.ri(1, 9) }];
  return [{ t: 'mul', a: r.ri(2, 3) }, { t: 'add', a: r.ri(1, 5) }, { t: 'sq' }];
}

/* ---------- cl.programme-calcul ---------- */
topic({ id: 'cl.programme-calcul', ch: 'cl', lvl: 2, calc: false, variants: 4,
  ru: 'Программа вычислений', fr: 'Programme de calcul',
  hints: [
    'Выполняй шаги программы строго по порядку, каждый раз с результатом предыдущего шага. Отрицательное число записывай в скобках.',
    'Чтобы записать программу буквами, обозначь исходное число $x$ и повторяй те же шаги. Если нужно умножить результат, в котором есть сумма, бери его в скобки: «прибавить 4, умножить на 3» — это $3(x+4)$, а не $x+4*3$.',
    'Чтобы узнать, какое число выбрать для нужного результата, приравняй выражение программы к этому результату и реши уравнение.'],
  gen(r, vi) {
    const ops = clfProgram(r, vi === 2), P = clfPoly(ops), e = clfExpr(ops), quadr = P.length > 2, prog = clfProgRu(ops), fig = clfProgFig(ops);
    if (vi === 0) {   /* run the program */
      const x0 = quadr ? r.nz(-5, 6) : r.nz(-9, 9), res = clfRun(ops, x0).pop();
      return { q: L('On considère le programme de calcul ci-dessous. On choisit ' + nf(x0) + ' comme nombre de départ. Quel résultat obtient-on ?', 'Дана программа вычислений: ' + prog + '. Выбираем число ' + nf(x0) + '. Какой результат получится?'), fig, ans: N(fx(res)),
        sol: [['Выбираем число ' + nf(x0) + ' и выполняем шаги по порядку, каждый раз с предыдущим результатом.']].concat(clfRunSteps(ops, x0)).concat(['Результат программы: ' + nf(res) + '.']) };
    }
    const chain = ['x'].concat(ops.map((o, i) => clfExpr(ops.slice(0, i + 1)))).join('→');
    if (vi === 1) {   /* the result as an expression */
      return { q: L('On considère le programme de calcul ci-dessous. On note $x$ le nombre choisi au départ. Exprimer le résultat du programme en fonction de $x$.', 'Дана программа вычислений: ' + prog + '. Обозначим исходное число через $x$. Вырази результат программы через $x$.'), fig, ans: XP(Pl.str(P)), sol: [
        ['Повторяем шаги программы с буквой $x$ вместо числа. Когда умножаем результат, в котором есть сумма, берём его в скобки — умножается весь результат, а не последнее слагаемое:', chain],
        ['Можно раскрыть скобки и привести подобные — получится более короткая запись того же выражения (верны обе):', e + '=' + Pl.str(P)]] };
    }
    if (vi === 2) {   /* which starting number gives the result R */
      const x0 = r.nz(-9, 12), R = clfRun(ops, x0).pop();
      return { q: L('On considère le programme de calcul ci-dessous. Quel nombre faut-il choisir au départ pour obtenir ' + nf(R) + ' ?', 'Дана программа вычислений: ' + prog + '. Какое число нужно выбрать, чтобы получить ' + nf(R) + '?'), fig, ans: N(x0), sol: [
        ['Обозначим исходное число $x$ и запишем результат программы:', e + '=' + Pl.str(P)],
        ['Результат должен быть равен ' + nf(R) + ' — получаем уравнение:', Pl.str(P) + '=' + R]].concat(clfSolveSteps(P[1], P[0], R, 'x')).concat(['Проверка: программа с числом ' + nf(x0) + ' даёт ' + clfRun(ops, x0).map(v => nf(v)).join(', затем ') + ' — всё сходится.']) };
    }
    /* vi 3: QCM — which expression gives the result (sujet zéro 2026) */
    let O = ops, opts, ok = false;
    for (let g = 0; g < 30 && !ok; g++) {
      if (g) O = clfProgram(r, false);
      opts = [clfExpr(O), clfExpr(O, false), clfExpr([O[1], O[0], O[2]]), clfExpr([O[0], O[2], O[1]])];
      ok = clfDistinct(opts) && opts.every((a, i) => opts.every((b, j) => i >= j || !clfSame(a, b)));
    }
    return { q: L('On considère le programme de calcul ci-dessous. On note $x$ le nombre choisi au départ. Parmi les expressions suivantes, laquelle donne le résultat du programme ?', 'Дана программа вычислений: ' + clfProgRu(O) + '. Обозначим исходное число через $x$. Какое выражение даёт результат программы?'),
      fig: clfProgFig(O), ans: MQ(r, opts.map(s => '$' + s + '$'), 0), sol: [
        ['Повторяем шаги программы с буквой $x$ по порядку:', ['x'].concat(O.map((o, i) => clfExpr(O.slice(0, i + 1)))).join('→')],
        'Откуда неверные ответы: $' + opts[1] + '$ — потеряны скобки: по приоритету действий умножится (или возведётся в степень) только последнее слагаемое, а программа действует на весь предыдущий результат; $' + opts[2] + '$ и $' + opts[3] + '$ — шаги программы выполнены в другом порядке.'] };
  } });

/* ---------- cl.programme-preuve ---------- */
/* programs whose result is always the same kind of number */
function clfProofProgram(r) {
  const t = r.ri(0, 3);
  if (t === 0) { const a = r.ri(1, 9), k = r.ri(2, 4); return { ops: [{ t: 'add', a }, { t: 'mul', a: k }, { t: 'subx', a: k }], dev: S(cf(k, 'x'), k * a, cf(-k, 'x')) }; }
  if (t === 1) { const a = r.ri(1, 9), k = r.ri(2, 5); return { ops: [{ t: 'mul', a: k }, { t: 'add', a: k * a }, { t: 'div', a: k }, { t: 'sub', a }], dev: 'x+' + a + '-' + a }; }
  if (t === 2) { const a = r.ri(1, 3); return { ops: [{ t: 'add', a }, { t: 'sq' }, { t: 'subsq' }, { t: 'sub', a: a * a }], dev: 'x^2+' + cf(2 * a, 'x') + '+' + a * a + '-x^2-' + a * a }; }
  const a = r.ri(2, 5); return { ops: [{ t: 'add', a }, { t: 'mulx' }, { t: 'subsq' }], dev: 'x^2+' + cf(a, 'x') + '-x^2' };
}
/* «the result is always …» for a result c or m·x or x² */
function clfConcl(P) {
  if (P.length === 1) return L('égal à ' + nf(P[0]), 'равен ' + nf(P[0]));
  if (P.length === 3) return L('égal au carré du nombre de départ', 'равен квадрату исходного числа');
  const m = P[1];
  if (m === 1) return L('égal au nombre de départ', 'равен исходному числу');
  if (m === 2) return L('égal au double du nombre de départ', 'равен удвоенному исходному числу');
  if (m === 3) return L('égal au triple du nombre de départ', 'равен утроенному исходному числу');
  if (m === 4) return L('égal au quadruple du nombre de départ', 'равен учетверённому исходному числу');
  return L('égal à ' + m + ' fois le nombre de départ', 'равен исходному числу, умноженному на ' + m);
}
topic({ id: 'cl.programme-preuve', ch: 'cl', lvl: 3, calc: false, variants: 3,
  ru: 'Программа вычислений: доказать', fr: 'Programme de calcul : démontrer une propriété',
  hints: [
    'Проверка на нескольких числах подсказывает ответ, но не доказывает его: чисел бесконечно много. Доказательство — запись программы для любого числа $x$.',
    'Запиши результат программы буквами, со скобками там, где умножается или возводится в квадрат весь предыдущий результат. Например, «прибавить 3, умножить на 2, вычесть удвоенное исходное число» — это $2(x+3)-2x$.',
    'Раскрой скобки и приведи подобные: $2(x+3)-2x=2x+6-2x=6$. Если $x$ исчезает, результат всегда один и тот же; если остаётся $2x$ — результат всегда вдвое больше исходного числа.'],
  gen(r, vi) {
    const { ops, dev } = clfProofProgram(r), P = clfPoly(ops), e = clfExpr(ops), res = Pl.str(P), c = clfConcl(P), fig = clfProgFig(ops), prog = clfProgRu(ops);
    if (vi === 0) {   /* QCM: the conjecture */
      const pool = [[0], [0, 1], [0, 2], [0, 0, 1], [P.length === 1 ? P[0] + 2 : 6]].filter(Q => Pl.str(Q) !== res).slice(0, 3);
      const opts = [c].concat(pool.map(clfConcl)).map(o => L('Le résultat est toujours ' + o.fr + '.', 'Результат всегда ' + o.ru + '.'));
      return { q: L('On considère le programme de calcul ci-dessous. Quelle affirmation est vraie quel que soit le nombre choisi au départ ?', 'Дана программа вычислений: ' + prog + '. Какое утверждение верно при любом исходном числе?'), fig, ans: MQ(r, opts, 0), sol: [
        'Попробуй сначала пару чисел — это подскажет ответ. Но доказывает его только запись с буквой: она верна сразу для всех чисел.',
        ['Обозначим исходное число $x$ и запишем программу:', e], ['Раскрываем скобки и приводим подобные:', e + '=' + dev + '=' + res],
        'Значит, при любом исходном числе результат ' + c.ru + '.'] };
    }
    if (vi === 1) {   /* the steps of the proof in order */
      return { q: L('On veut démontrer que, quel que soit le nombre choisi au départ, le résultat du programme ci-dessous est toujours ' + c.fr + '. Remettre dans l\'ordre les étapes de la démonstration.', 'Нужно доказать, что при любом исходном числе результат программы (' + prog + ') всегда ' + c.ru + '. Расставь шаги доказательства по порядку.'), fig, ans: ORD(r, [
        L('On note $x$ le nombre choisi au départ.', 'Обозначим исходное число через $x$.'),
        L('Le résultat du programme est $' + e + '$.', 'Результат программы равен $' + e + '$.'),
        L('On développe : $' + e + '=' + dev + '$.', 'Раскрываем скобки: $' + e + '=' + dev + '$.'),
        L('On réduit : on obtient $' + res + '$, donc le résultat est toujours ' + c.fr + '.', 'Приводим подобные: получаем $' + res + '$, значит, результат всегда ' + c.ru + '.')]), sol: [
          'Доказательство идёт от общего числа $x$ к выводу: назвать число, записать программу буквами, раскрыть скобки, привести подобные — и только потом сделать вывод.',
          'Проверка на отдельных числах здесь не нужна: буква $x$ заменяет сразу все числа.'] };
    }
    /* vi 2: the reduced expression */
    return { q: L('On considère le programme de calcul ci-dessous. On note $x$ le nombre choisi au départ. Exprimer le résultat en fonction de $x$, sous forme développée et réduite.', 'Дана программа вычислений: ' + prog + '. Обозначим исходное число через $x$. Вырази результат через $x$: раскрой скобки и приведи подобные.'), fig, ans: XP(res, { forms: ['expanded'] }), sol: [
      ['Записываем программу буквами, по шагам:', ['x'].concat(ops.map((o, i) => clfExpr(ops.slice(0, i + 1)))).join('→')],
      ['Раскрываем скобки и приводим подобные:', e + '=' + dev + '=' + res],
      'Вывод: при любом исходном числе результат ' + c.ru + '.'] };
  } });

/* =====================================================================================
   FONCTIONS
   ===================================================================================== */
const clfFn = r => r.pick(['f', 'f', 'g', 'h']);
/* a function given by a formula: f(x) = …, in input syntax */
const clfDef = (f, e) => f + '(x)=' + e;
/* a table of values (x on the first row); asked — index of the cell with «?» */
const clfTd = s => '<td style="min-width:2.2em">' + s + '</td>';
function clfValTab(f, xs, ys, asked) {
  return '<table class="pblk tx">' + '<tr><th><i>x</i></th>' + xs.map(x => clfTd(clfLab(x))).join('') + '</tr>' +
    '<tr><th><i>' + f + '</i>(<i>x</i>)</th>' + ys.map((y, i) => i === asked ? '<td class="tdq"><b>?</b></td>' : clfTd(y == null ? '' : clfLab(y))).join('') + '</tr></table>';
}
/* a spreadsheet: columns A, B, C…, row 1 — x, row 2 — f(x) (null = empty cell, asked — cell with «?») */
function clfSheet(f, xs, ys, asked) {
  const cols = 'ABCDEFGHIJ'.slice(0, xs.length + 1).split('');
  return '<table class="pblk tx">' + '<tr><th></th>' + cols.map(c => '<th>' + c + '</th>').join('') + '</tr>' +
    '<tr><th>1</th><td><i>x</i></td>' + xs.map(x => clfTd(clfLab(x))).join('') + '</tr>' +
    '<tr><th>2</th><td><i>' + f + '</i>(<i>x</i>)</td>' + ys.map((y, i) => i === asked ? '<td class="tdq"><b>?</b></td>' : clfTd(y == null ? '' : clfLab(y))).join('') + '</tr></table>';
}

/* ---------- fn.vocabulaire ---------- */
topic({ id: 'fn.vocabulaire', ch: 'fn', lvl: 1, calc: false, variants: 3,
  ru: 'Образ и прообраз: слова и запись', fr: 'Image, antécédent, notation f(x)',
  hints: [
    'Функция — правило, которое каждому числу $x$ ставит в соответствие одно число $f(x)$. Запись $f(3)=7$ читается «f от 3 равно 7».',
    'В $f(3)=7$ число $3$ — то, что подставляем: это прообраз («antécédent»); $7$ — то, что получаем: это образ («image»). Образ у числа всегда один, а прообразов у числа может быть несколько или ни одного.',
    'Запись $$f : x \\mapsto 2x+1$$ означает то же, что $f(x)=2x+1$: «$x$ переходит в $2x+1$».'],
  gen(r, vi) {
    const f = clfFn(r); let a, b;
    do { a = r.nz(-9, 12); b = r.nz(-9, 15); } while (a === b || b === 2 * a || a === 2 * b || a === -b);
    const fa = '$' + f + '(' + a + ')=' + b + '$';
    if (vi === 0) {
      const right = r.pick([L('L\'image de $' + a + '$ par la fonction $' + f + '$ est $' + b + '$.', 'Образ числа $' + a + '$ при функции $' + f + '$ равен $' + b + '$.'), L('$' + a + '$ est un antécédent de $' + b + '$ par la fonction $' + f + '$.', '$' + a + '$ — прообраз числа $' + b + '$ при функции $' + f + '$.')]);
      const wrong = r.sh([L('L\'image de $' + b + '$ par la fonction $' + f + '$ est $' + a + '$.', 'Образ числа $' + b + '$ при функции $' + f + '$ равен $' + a + '$.'), L('$' + b + '$ est un antécédent de $' + a + '$ par la fonction $' + f + '$.', '$' + b + '$ — прообраз числа $' + a + '$ при функции $' + f + '$.'),
        L('$' + a + '$ est l\'image de $' + b + '$ par la fonction $' + f + '$.', '$' + a + '$ — образ числа $' + b + '$ при функции $' + f + '$.'), L('$' + f + '(' + b + ')=' + a + '$', '$' + f + '(' + b + ')=' + a + '$')]).slice(0, 3);
      return { q: L('On sait que ' + fa + '. Parmi les affirmations suivantes, laquelle est vraie ?', 'Известно, что ' + fa + '. Какое из утверждений верно?'), ans: MQ(r, [right].concat(wrong), 0), sol: [
        'В записи ' + fa + ' в скобках стоит число, которое подставляют, — прообраз («antécédent»): это $' + a + '$. Справа — результат, образ («image»): это $' + b + '$.',
        'Значит, верно: «образ $' + a + '$ равен $' + b + '$» и «$' + a + '$ — прообраз $' + b + '$». Остальные утверждения путают местами образ и прообраз.'] };
    }
    if (vi === 1) {   /* vrai / faux */
      const S4 = [[true, 'l\'image de $' + a + '$ par $' + f + '$ est $' + b + '$', 'образ числа $' + a + '$ при $' + f + '$ равен $' + b + '$'], [false, 'l\'image de $' + b + '$ par $' + f + '$ est $' + a + '$', 'образ числа $' + b + '$ при $' + f + '$ равен $' + a + '$'],
        [true, '$' + a + '$ est un antécédent de $' + b + '$ par $' + f + '$', '$' + a + '$ — прообраз числа $' + b + '$ при $' + f + '$'], [false, '$' + b + '$ est un antécédent de $' + a + '$ par $' + f + '$', '$' + b + '$ — прообраз числа $' + a + '$ при $' + f + '$'],
        [true, '$' + b + '$ a pour antécédent $' + a + '$ par $' + f + '$', 'у числа $' + b + '$ есть прообраз $' + a + '$ при $' + f + '$'], [false, '$' + b + '$ a pour image $' + a + '$ par $' + f + '$', 'образ числа $' + b + '$ при $' + f + '$ равен $' + a + '$'],
        [false, '$' + f + '(' + b + ')=' + a + '$', '$' + f + '(' + b + ')=' + a + '$']];
      const want = r() < 0.45, [ok, fr, ru] = r.pick(S4.filter(s => s[0] === want));
      return { q: L('On sait que ' + fa + '. Affirmation : « ' + fr + ' ». Cette affirmation est-elle vraie ou fausse ?', 'Известно, что ' + fa + '. Утверждение: «' + ru + '». Это утверждение верно или неверно?'), ans: TF(ok), sol: [
        'Запись ' + fa + ' говорит: подставили $' + a + '$ — получили $' + b + '$. Значит, $' + b + '$ — образ числа $' + a + '$, а $' + a + '$ — прообраз числа $' + b + '$.',
        ok ? 'Утверждение говорит ровно это — оно верно.' : 'Утверждение меняет местами образ и прообраз: из ' + fa + ' не следует, что $' + f + '(' + b + ')=' + a + '$. Утверждение неверно.'] };
    }
    /* vi 2: complete the sentence */
    const img = r() < 0.5;
    const opts = [L('l\'image', 'образ'), L('un antécédent', 'прообраз'), L('l\'opposé', 'противоположное число'), L('le double', 'удвоенное число')];
    return { q: L('On sait que ' + fa + '. Compléter la phrase : « $' + (img ? b : a) + '$ est … de $' + (img ? a : b) + '$ par la fonction $' + f + '$ ».', 'Известно, что ' + fa + '. Дополни фразу: «$' + (img ? b : a) + '$ — … числа $' + (img ? a : b) + '$ при функции $' + f + '$».'),
      ans: MQ(r, opts, img ? 0 : 1), sol: [
        'Подставили $' + a + '$ — получили $' + b + '$. То, что получаем, — образ («image»); то, что подставляем, — прообраз («antécédent»).',
        img ? 'Поэтому $' + b + '$ — образ числа $' + a + '$: «l\'image».' : 'Поэтому $' + a + '$ — прообраз числа $' + b + '$: «un antécédent». Говорят «un», а не «l\'», потому что прообразов у числа может быть несколько.',
        'Варианты «l\'opposé» и «le double» не подходят: $' + (img ? b : a) + '$ не равно ни $' + (img ? -a : -b) + '$, ни $' + (img ? 2 * a : 2 * b) + '$.'] };
  } });

/* ---------- fn.image-formule ---------- */
topic({ id: 'fn.image-formule', ch: 'fn', lvl: 1, calc: false, variants: 4,
  ru: 'Образ и прообраз по формуле', fr: 'Calculer une image ou un antécédent avec une formule',
  hints: [
    'Образ («image») числа $a$ — это $f(a)$: подставляем $a$ вместо $x$ в формулу и считаем. Отрицательное число — в скобках: $f(-2)=3*(-2)-5=-11$.',
    'Прообраз («antécédent») числа $b$ — это такое $x$, что $f(x)=b$. Его находят, решая уравнение: например, $3x-5=7$, откуда $3x=12$ и $x=4$.',
    'Не путай вопросы: «image de 4» — подставить 4 вместо $x$; «antécédent de 4» — решить уравнение $f(x)=4$.'],
  gen(r, vi) {
    const f = clfFn(r);
    if (vi === 0) {   /* QCM — Polynésie 2026, Q8 */
      let a, b, t, c, opts;
      do { a = r.ri(2, 5); b = r.nz(-9, 9); t = r.ri(1, 6); c = a * t + b; opts = [a * c + b, t, a * c, 10 * a + c + b]; } while (c < 2 || c > 9 || !clfDistinct(opts));
      const e = lin(a, b);
      return { q: L('On considère la fonction affine $' + f + '$ définie par $' + clfDef(f, e) + '$. Quelle est l\'image de $' + c + '$ par la fonction $' + f + '$ ?', 'Дана аффинная функция $' + f + '$: $' + clfDef(f, e) + '$. Чему равен образ числа $' + c + '$ при функции $' + f + '$?'),
        ans: MQ(r, opts.map(String), 0), sol: [
          ['Образ числа ' + c + ' — это $' + f + '(' + c + ')$: подставляем ' + c + ' вместо $x$.', f + '(' + c + ')=' + clfSubLin(a, b, c) + '=' + (a * c) + clfPm(b) + '=' + opts[0]],
          'Откуда неверные ответы: ' + t + ' — это прообраз числа ' + c + ' (решили уравнение $' + e + '=' + c + '$), а спрашивали образ; ' + a * c + ' — забыли слагаемое ' + nf(b) + '; ' + opts[3] + ' — прочитали $' + a + 'x$ как число «' + a + c + '».'] };
    }
    if (vi === 1) {   /* the image with a formula that is not affine */
      const x0 = r.nz(-4, 5), tp = r.ri(0, 3); let e, sub, mid, val;
      if (tp === 0) { const b = r.nz(-6, 6), c = r.nz(-9, 9); e = quad(1, b, c); sub = np(x0) + '^2' + (b < 0 ? '-' + (-b === 1 ? '' : -b + '*') : '+' + (b === 1 ? '' : b + '*')) + np(x0) + clfPm(c); mid = x0 * x0 + clfPm(b * x0) + clfPm(c); val = x0 * x0 + b * x0 + c; }
      else if (tp === 1) { const a = r.ri(2, 4), c = r.nz(-9, 9); e = S(cf(a, 'x^2'), c); sub = a + '*' + np(x0) + '^2' + clfPm(c); mid = a + '*' + x0 * x0 + clfPm(c); val = a * x0 * x0 + c; }
      else if (tp === 2) { const p = r.nz(-5, 5), q = r.nz(-5, 5); e = '(' + lin(1, p) + ')(' + lin(1, q) + ')'; sub = '(' + S(x0, p) + ')*(' + S(x0, q) + ')'; mid = np(x0 + p) + '*' + np(x0 + q); val = (x0 + p) * (x0 + q); }
      else { const c = r.ri(5, 20); e = c + '-x^2'; sub = c + '-' + np(x0) + '^2'; mid = c + '-' + x0 * x0; val = c - x0 * x0; }
      if (sub[0] === '+') sub = sub.slice(1);
      return { q: L('On considère la fonction $' + f + '$ définie par $' + clfDef(f, e) + '$. Calculer l\'image de $' + x0 + '$ par la fonction $' + f + '$.', 'Дана функция $' + f + '$: $' + clfDef(f, e) + '$. Вычисли образ числа $' + x0 + '$ при функции $' + f + '$.'), ans: N(val), sol: [
        ['Образ числа ' + nf(x0) + ' — это $' + f + '(' + x0 + ')$: подставляем ' + nf(x0) + ' вместо каждого $x$' + (x0 < 0 ? ' (в скобках)' : '') + ' и считаем по порядку действий.', f + '(' + x0 + ')=' + sub + '=' + mid + '=' + val]].concat(x0 < 0 && /\^2/.test(e) ? ['Квадрат отрицательного числа положителен: $' + np(x0) + '^2=' + x0 * x0 + '$.'] : []) };
    }
    /* vi 2: antecedent, linear · vi 3: antecedent, affine (sujet de référence 2027 n°1) */
    let a, b = 0, t, c;
    if (vi === 2) { do { a = r.nz(-9, 9); t = r.nz(-12, 12); } while (Math.abs(a) < 2); c = a * t; }
    else { const big = r() < 0.4; do { a = big ? r.pick([10, 20, 25]) : r.nz(-9, 9); b = big ? r.pick([30, 40, 50, 60, 80]) : r.nz(-15, 15); t = big ? r.ri(2, 12) : r.nz(-9, 9); c = a * t + b; } while (Math.abs(a) < 2); }
    const e = lin(a, b);
    return { q: L('On considère la fonction $' + f + '$ définie par $' + clfDef(f, e) + '$. Déterminer l\'antécédent de $' + c + '$ par la fonction $' + f + '$.', 'Дана функция $' + f + '$: $' + clfDef(f, e) + '$. Найди прообраз числа $' + c + '$ при функции $' + f + '$.'), ans: N(t), sol: [
      ['Прообраз числа ' + nf(c) + ' — это число $x$, для которого $' + f + '(x)=' + c + '$. Получаем уравнение:', e + '=' + c]].concat(clfSolveSteps(a, b, c, 'x')).concat(['Проверка: $' + f + '(' + t + ')=' + clfSubLin(a, b, t) + '=' + c + '$ — верно.']) };
  } });

/* ---------- fn.lecture-tableau ---------- */
/* a function for a table: affine or a parabola, with its formula (input syntax) and the spreadsheet formula for cell B2 */
function clfTabFn(r, quadOnly) {
  if (!quadOnly && r() < 0.4) { const a = r.nz(-5, 5), b = r.nz(-9, 9); return { e: lin(a, b), v: x => a * x + b, cell: c => (a === 1 ? '' : a === -1 ? '-' : a + '*') + c + (b < 0 ? '-' + (-b) : '+' + b), wrong: c => (a === 1 ? '' : a === -1 ? '-' : a + '*') + c + (b < 0 ? '+' + (-b) : '-' + b) }; }
  const s = r() < 0.75 ? 1 : -1, h = r.ri(-1, 2), k = r.nz(-6, 6), b = -2 * s * h, c = s * h * h + k;
  return { e: quad(s, b, c), v: x => s * x * x + b * x + c, cell: cc => (s < 0 ? '-' : '') + cc + '^2' + (b ? (b < 0 ? '-' : '+') + (Math.abs(b) === 1 ? '' : Math.abs(b) + '*') + cc : '') + (c ? (c < 0 ? '-' : '+') + Math.abs(c) : ''), wrong: cc => cc + '*2' + (b ? (b < 0 ? '-' : '+') + (Math.abs(b) === 1 ? '' : Math.abs(b) + '*') + cc : '') + (c ? (c < 0 ? '-' : '+') + Math.abs(c) : ''), h };
}
topic({ id: 'fn.lecture-tableau', ch: 'fn', lvl: 1, calc: false, variants: 4,
  ru: 'Образ и прообраз по таблице значений', fr: 'Lire une image ou un antécédent dans un tableau',
  hints: [
    'В таблице значений в первой строке стоят числа $x$ (прообразы), во второй — их образы $f(x)$. Образ числа — число под ним; прообраз числа — число над ним.',
    'Прообразов у числа может быть несколько: ищи это число во второй строке везде, где оно встречается.',
    'В электронной таблице («tableur») формула ссылается на ячейку: в B2 пишут =3*B1-2, и при протягивании вправо B1 сама меняется на C1, D1… Если вместо ссылки написать число или букву $x$, формула не сработает.'],
  gen(r, vi) {
    const f = clfFn(r), x0 = r.ri(-4, -1), xs = [0, 1, 2, 3, 4, 5].map(i => x0 + i);
    if (vi === 0 || vi === 1) {
      const F = clfTabFn(r, vi === 1), ys = xs.map(F.v);
      if (vi === 0) {
        const i = r.ri(0, 5);
        return { q: L('Voici un tableau de valeurs de la fonction $' + f + '$. Quelle est l\'image de $' + xs[i] + '$ par la fonction $' + f + '$ ?', 'Вот таблица значений функции $' + f + '$. Чему равен образ числа $' + xs[i] + '$ при функции $' + f + '$?'),
          fig: clfValTab(f, xs, ys), ans: N(ys[i]), sol: [
            'Образ числа $' + xs[i] + '$ стоит во второй строке, прямо под ним: $' + f + '(' + xs[i] + ')=' + ys[i] + '$.',
            'Типичная ошибка — искать $' + xs[i] + '$ во второй строке: так находят прообраз, а не образ.'] };
      }
      const cnt = {}; ys.forEach(y => cnt[y] = (cnt[y] || 0) + 1);
      const vals = Object.keys(cnt).map(Number), two = vals.filter(y => cnt[y] > 1), y = two.length && r() < 0.6 ? r.pick(two) : r.pick(vals), ant = xs.filter((x, i) => ys[i] === y);
      return { q: L('Voici un tableau de valeurs de la fonction $' + f + '$. D\'après ce tableau, donner tous les antécédents de $' + y + '$ par la fonction $' + f + '$.', 'Вот таблица значений функции $' + f + '$. По этой таблице найди все прообразы числа $' + y + '$ при функции $' + f + '$.'),
        fig: clfValTab(f, xs, ys), ans: LIST(ant.join(',')), sol: [
          'Прообраз — это $x$, у которого образ равен $' + y + '$. Ищем $' + y + '$ во второй строке и смотрим, что стоит над ним.',
          ant.length > 1 ? 'Число $' + y + '$ встречается во второй строке дважды — над ним $' + ant[0] + '$ и $' + ant[1] + '$. Оба — прообразы: $' + f + '(' + ant[0] + ')=' + f + '(' + ant[1] + ')=' + y + '$.' : 'Число $' + y + '$ встречается во второй строке один раз — над ним $' + ant[0] + '$: $' + f + '(' + ant[0] + ')=' + y + '$.'] };
    }
    const F = clfTabFn(r), ys = xs.map(F.v);
    if (vi === 2) {   /* QCM: the formula of cell B2 — Métropole sept. 2024 */
      const opts = ['=' + F.cell('B1'), '=' + F.cell('A1'), '=' + F.cell('x'), '=' + F.cell(np(xs[0]))];
      return { q: L('On a utilisé un tableur pour calculer les images de plusieurs nombres par la fonction $' + f + '$ définie par $' + clfDef(f, F.e) + '$. Quelle formule a-t-on saisie dans la cellule B2, avant de l\'étirer vers la droite ?', 'Электронной таблицей вычислили образы нескольких чисел при функции $' + f + '$: $' + clfDef(f, F.e) + '$. Какую формулу ввели в ячейку B2, прежде чем протянуть её вправо?'),
        fig: clfSheet(f, xs, ys), ans: MQ(r, opts, 0), sol: [
          'В B2 должен получиться образ числа из B1. Поэтому в формуле вместо $x$ стоит ссылка на ячейку B1. При протягивании вправо B1 сама превращается в C1, D1… — и каждая ячейка считает образ числа над собой.',
          'Неверные: «' + opts[1] + '» ссылается на A1, где стоит буква $x$, а не число; «' + opts[2] + '» — таблица не знает, что такое $x$, нужна ссылка на ячейку; «' + opts[3] + '» — число вместо ссылки: формула даст правильный ответ только в B2, а при протягивании не изменится.'] };
    }
    /* vi 3: what does the cell show */
    const i = r.ri(2, 5), col = 'BCDEFG'[i], shown = ys.map((y, j) => (j < 2 ? y : null));
    return { q: L('Dans la cellule B2, on a saisi la formule ' + '=' + F.cell('B1') + ', puis on l\'a étirée vers la droite. Quel nombre s\'affiche dans la cellule ' + col + '2 ?', 'В ячейку B2 ввели формулу =' + F.cell('B1') + ' и протянули её вправо. Какое число будет в ячейке ' + col + '2?'),
      fig: clfSheet(f, xs, shown, i), ans: N(ys[i]), sol: [
        'При протягивании вправо ссылка B1 меняется на C1, D1… — в ячейке ' + col + '2 формула считает по числу из ' + col + '1, то есть $x=' + xs[i] + '$.',
        ['Подставляем $' + xs[i] + '$ в формулу $' + clfDef(f, F.e) + '$:', f + '(' + xs[i] + ')=' + ys[i]]] };
  } });

/* ---------- graphs ---------- */
/* a grid with axes: window [x0; x1] × [y0; y1] (values), one square = dx and dy, u px per square */
function clfPlane(o) {
  const dx = o.dx || 1, dy = o.dy || 1, u = o.u || 26, x0 = o.x0, x1 = o.x1, y0 = o.y0, y1 = o.y1;
  const nx = Math.round((x1 - x0) / dx), ny = Math.round((y1 - y0) / dy), Lm = o.lm || 32, Tm = 16;
  const X = x => Lm + (x - x0) / dx * u, Y = y => Tm + (y1 - y) / dy * u;
  const W = Lm + nx * u + 24, H = Tm + ny * u + 26;
  let g = '';
  for (let i = 0; i <= nx; i++) g += clfLn(X(x0 + i * dx), Y(y0), X(x0 + i * dx), Y(y1), 'fgrid');
  for (let j = 0; j <= ny; j++) g += clfLn(X(x0), Y(y0 + j * dy), X(x1), Y(y0 + j * dy), 'fgrid');
  const ya = Math.max(y0, Math.min(0, y1)), xa = Math.max(x0, Math.min(0, x1));
  g += clfLn(X(x0), Y(ya), X(x1) + 12, Y(ya), 'fax') + clfPath('M' + (X(x1) + 6).toFixed(1) + ' ' + (Y(ya) - 4).toFixed(1) + ' L' + (X(x1) + 12).toFixed(1) + ' ' + Y(ya).toFixed(1) + ' L' + (X(x1) + 6).toFixed(1) + ' ' + (Y(ya) + 4).toFixed(1), 'fax');
  g += clfLn(X(xa), Y(y0), X(xa), Y(y1) - 12, 'fax') + clfPath('M' + (X(xa) - 4).toFixed(1) + ' ' + (Y(y1) - 6).toFixed(1) + ' L' + X(xa).toFixed(1) + ' ' + (Y(y1) - 12).toFixed(1) + ' L' + (X(xa) + 4).toFixed(1) + ' ' + (Y(y1) - 6).toFixed(1), 'fax');
  const lx = o.lx || 1, ly = o.ly || 1;
  for (let i = 0; i <= nx; i++) { const v = x0 + i * dx; if (Math.abs(v - xa) < 1e-9 || i % lx) continue; g += clfT(X(v), Y(ya) + 17, clfLab(v), 'middle', 'ftm', 14); }
  for (let j = 0; j <= ny; j++) { const v = y0 + j * dy; if (Math.abs(v - ya) < 1e-9 || j % ly) continue; g += clfT(X(xa) - 5, Y(v) + 5, clfLab(v), 'end', 'ftm', 14); }
  g += clfT(X(xa) - 5, Y(ya) + 17, clfLab(Math.abs(xa) < 1e-9 && Math.abs(ya) < 1e-9 ? 0 : xa), 'end', 'ftm', 14);
  return { X, Y, W, H, g, x0, x1, y0, y1 };
}
const clfSvg = (P, inner, label) => svgFig(Math.round(P.W), Math.round(P.H), P.g + inner, label);
/* a straight line y = a·x + b clipped to the window */
function clfLine(P, a, b, cls) {
  const pts = [];
  [[P.x0, a * P.x0 + b], [P.x1, a * P.x1 + b]].forEach(p => pts.push(p));
  if (a !== 0) [P.y0, P.y1].forEach(y => { const x = (y - b) / a; if (x > P.x0 && x < P.x1) pts.push([x, y]); });
  const ins = pts.filter(([x, y]) => x >= P.x0 - 1e-9 && x <= P.x1 + 1e-9 && y >= P.y0 - 1e-9 && y <= P.y1 + 1e-9).sort((p, q) => p[0] - q[0]);
  if (ins.length < 2) return { svg: '', end: null };
  const s = ins[0], e = ins[ins.length - 1];
  return { svg: clfLn(P.X(s[0]), P.Y(s[1]), P.X(e[0]), P.Y(e[1]), cls || 'fcurve'), end: e, start: s };
}
/* a label beside a drawn line (at 80 % of its length, pushed off the line) */
function clfLineLab(P, ln, txt, side) {
  if (!ln.end) return '';
  const sx = P.X(ln.start[0]), sy = P.Y(ln.start[1]), ex = P.X(ln.end[0]), ey = P.Y(ln.end[1]), qx = sx + 0.8 * (ex - sx), qy = sy + 0.8 * (ey - sy);
  let nx = -(ey - sy), ny = ex - sx; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l; if (ny > 0) { nx = -nx; ny = -ny; } if (side) { nx = -nx; ny = -ny; }
  return clfT(qx + 16 * nx, qy + 16 * ny + 5, txt, 'middle', 'ftx', 15);
}
/* monotone cubic through the nodes (Fritsch–Carlson): no bumps between two nodes */
function clfMono(xs, ys) {
  const n = xs.length, d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return m;
}
function clfCurve(P, xs, ys) {
  const m = clfMono(xs, ys), F = v => v.toFixed(1); let d = 'M' + F(P.X(xs[0])) + ' ' + F(P.Y(ys[0]));
  for (let i = 0; i < xs.length - 1; i++) {
    const h = xs[i + 1] - xs[i];
    d += ' C' + F(P.X(xs[i] + h / 3)) + ' ' + F(P.Y(ys[i] + m[i] * h / 3)) + ' ' + F(P.X(xs[i + 1] - h / 3)) + ' ' + F(P.Y(ys[i + 1] - m[i + 1] * h / 3)) + ' ' + F(P.X(xs[i + 1])) + ' ' + F(P.Y(ys[i + 1]));
  }
  return clfPath(d, 'fcurve') + clfDot(P.X(xs[0]), P.Y(ys[0])) + clfDot(P.X(xs[xs.length - 1]), P.Y(ys[ys.length - 1]));
}
/* a smooth curve through integer nodes, one or two turns; values in grid units */
function clfWave(r) {
  let xs, ys;
  for (;;) {
    const a = r.ri(-4, -2), n = r.ri(7, 9); xs = []; for (let i = 0; i <= n; i++) xs.push(a + i);
    const t1 = r.ri(2, Math.floor(n / 2)), t2 = r() < 0.5 ? r.ri(t1 + 2, n - 1) : n, dir = r() < 0.5 ? 1 : -1; ys = [0];
    /* runs between the turns; inside a run the steps grow and shrink smoothly: 1, 2, 2, 1 */
    [[0, t1, dir], [t1, t2, -dir], [t2, n, dir]].forEach(([s0, s1, d]) => {
      const len = s1 - s0, big = len > 2 && r() < 0.6 ? 2 : 1;
      for (let j = 0; j < len; j++) ys.push(ys[ys.length - 1] + d * (j === 0 || j === len - 1 ? 1 : big));
    });
    const mn = Math.min(...ys), mx = Math.max(...ys); if (mx - mn > 8 || mx - mn < 4) continue;
    const off = r.ri(-3, 1) - mn; ys = ys.map(y => y + off); break;
  }
  return { xs, ys };
}
/* antecedents of the level w (grid units) on the polyline of nodes: exact x when w is a node value and never strictly inside a piece */
function clfLevel(xs, ys, w) {
  let at = 0, cross = 0;
  ys.forEach(y => { if (y === w) at++; });
  for (let i = 0; i < ys.length - 1; i++) if ((ys[i] - w) * (ys[i + 1] - w) < 0) cross++;
  return { at, cross, n: at + cross, xsAt: xs.filter((x, i) => ys[i] === w) };
}

/* ---------- fn.lecture-graphe ---------- */
topic({ id: 'fn.lecture-graphe', ch: 'fn', lvl: 2, calc: false, variants: 3,
  ru: 'Образ и прообраз по графику', fr: 'Lire une image ou un antécédent sur un graphique',
  hints: [
    'Образ числа $a$: находим $a$ на оси абсцисс (горизонтальной), идём по вертикали до кривой и смотрим, на какой высоте точка кривой. Эта высота на оси ординат — $f(a)$.',
    'Прообразы числа $b$: проводим горизонтальную прямую на высоте $b$ и ищем все её точки пересечения с кривой. Их абсциссы — прообразы. Их может быть несколько или ни одного.',
    'Сначала посмотри на масштаб: сколько единиц в одной клетке на каждой оси. И помни, что функция задана только на своём отрезке — за его концами кривой нет.'],
  gen(r, vi) {
    const f = clfFn(r), dy = r() < 0.7 ? 1 : 2, { xs, ys } = clfWave(r), a = xs[0], b = xs[xs.length - 1];
    const P = clfPlane({ x0: a - 1, x1: b + 1, y0: Math.min(0, Math.min(...ys) - 1) * dy, y1: (Math.max(...ys) + 1) * dy, dy });
    const fig = clfSvg(P, clfCurve(P, xs, ys.map(y => y * dy)), 'courbe représentative de la fonction ' + f);
    const intro = L('On a tracé ci-dessous la courbe représentative de la fonction $' + f + '$ définie sur l\'intervalle [' + nf(a) + ' ; ' + nf(b) + '].', 'Ниже построен график функции $' + f + '$, заданной на отрезке [' + nf(a) + ' ; ' + nf(b) + '].');
    const scale = dy === 2 ? ' Внимание к масштабу: по оси ординат одна клетка — 2 единицы.' : '';
    if (vi === 0) {   /* the image */
      const i = r.ri(1, xs.length - 2), x = xs[i], y = ys[i] * dy;
      return { q: L(intro.fr + ' Déterminer graphiquement l\'image de $' + x + '$ par la fonction $' + f + '$.', intro.ru + ' Найди по графику образ числа $' + x + '$ при функции $' + f + '$.'), fig, ans: N(y), sol: [
        'Находим $' + x + '$ на оси абсцисс и идём по вертикали до кривой. Точка кривой с абсциссой $' + x + '$ находится на высоте $' + y + '$.' + scale,
        'Значит, $' + f + '(' + x + ')=' + y + '$. Не путай: образ читают на оси ординат, а $' + x + '$ отложено на оси абсцисс.'] };
    }
    if (vi === 1) {   /* the antecedents of a level read at nodes */
      const ok = [...new Set(ys)].filter(w => { const L2 = clfLevel(xs, ys, w); return L2.cross === 0; });
      const two = ok.filter(w => clfLevel(xs, ys, w).at > 1), w = two.length && r() < 0.7 ? r.pick(two) : r.pick(ok), ant = clfLevel(xs, ys, w).xsAt;
      return { q: L(intro.fr + ' Déterminer graphiquement le ou les antécédents de $' + w * dy + '$ par la fonction $' + f + '$.', intro.ru + ' Найди по графику прообраз или прообразы числа $' + w * dy + '$ при функции $' + f + '$.'), fig, ans: LIST(ant.join(',')), sol: [
        'Проводим горизонтальную прямую на высоте $' + w * dy + '$ (по оси ординат) и ищем её точки пересечения с кривой.' + scale,
        ant.length > 1 ? 'Пересечений ' + ant.length + ': их абсциссы $' + ant.join('$ и $') + '$. Это все прообразы: $' + ant.map(x => f + '(' + x + ')').join('=') + '=' + w * dy + '$.' : 'Пересечение одно, его абсцисса $' + ant[0] + '$: $' + f + '(' + ant[0] + ')=' + w * dy + '$.'] };
    }
    /* vi 2: how many antecedents */
    const mn = Math.min(...ys), mx = Math.max(...ys), cand = [];
    for (let w = mn - 1; w <= mx + 1; w++) {
      if (w * dy < P.y0 || w * dy > P.y1) continue;
      const touch = ys.some((y, i) => y === w && i > 0 && i < ys.length - 1 && (ys[i - 1] - w) * (ys[i + 1] - w) > 0);
      if (!touch) cand.push(w);
    }
    const w = r.pick(cand), n = clfLevel(xs, ys, w).n;
    return { q: L(intro.fr + ' Combien d\'antécédents le nombre $' + w * dy + '$ a-t-il par la fonction $' + f + '$ ?', intro.ru + ' Сколько прообразов у числа $' + w * dy + '$ при функции $' + f + '$?'), fig, ans: N(n), sol: [
      'Проводим горизонтальную прямую на высоте $' + w * dy + '$ и считаем её точки пересечения с кривой (только на отрезке, где задана функция).' + scale,
      n === 0 ? 'Прямая не пересекает кривую: функция не принимает значение $' + w * dy + '$. Прообразов нет — ответ 0.' : 'Точек пересечения ' + n + ' — значит, у числа $' + w * dy + '$ ' + clfPl(n, 'прообраз', 'прообраза', 'прообразов') + '.'] };
  } });

/* ---------- fn.lineaire ---------- */
topic({ id: 'fn.lineaire', ch: 'fn', lvl: 2, calc: false, variants: 4,
  ru: 'Линейная функция f(x) = ax', fr: 'Fonction linéaire',
  hints: [
    'Линейная функция («fonction linéaire») — это $f(x)=ax$: образ пропорционален $x$, а $a$ — коэффициент пропорциональности. (В российских учебниках это «прямая пропорциональность».) Её график — прямая через начало координат, ведь $f(0)=a*0=0$.',
    'Коэффициент находят по одной точке: если $f(4)=10$, то $4a=10$ и $a=10/4=2.5$ — образ делим на прообраз. По графику: возьми точку прямой на узле сетки и раздели её ординату на абсциссу.',
    'Проценты — тоже линейные функции: уменьшить на 20 % — значит умножить на $0.8$ (остаётся 80 %), увеличить на 5 % — умножить на $1.05$.'],
  gen(r, vi) {
    const f = clfFn(r);
    if (vi === 0) {   /* the coefficient from one value */
      const a = r.pick([2, 3, 4, 5, -2, -3, -4, 0.5, 1.5, 2.5, -1.5, -0.5]), p = Number.isInteger(a) ? r.nz(-9, 9) : r.pick([2, 4, 6, 8, -2, -4]), v = a * p;
      return { q: L('On considère une fonction linéaire $' + f + '$ telle que $' + f + '(' + p + ')=' + fx(v) + '$. Déterminer le coefficient de la fonction $' + f + '$.', '$' + f + '$ — линейная функция, и $' + f + '(' + p + ')=' + fx(v) + '$. Найди коэффициент функции $' + f + '$.'), ans: N(fx(a)), sol: [
        ['Линейная функция имеет вид $' + f + '(x)=ax$, значит $' + f + '(' + p + ')=a*' + np(p) + '$. Получаем уравнение:', cf(p, 'a') + '=' + fx(v)],
        ['Делим обе части на ' + nf(p) + ' — образ делим на прообраз:', 'a=' + fx(v) + '/' + np(p) + '=' + fx(a)],
        'Итак, $' + f + '(x)=' + cf(+fx(a), 'x') + '$. Проверка: $' + fx(a) + '*' + np(p) + '=' + fx(v) + '$.'] };
    }
    if (vi === 1) {   /* a percentage as a linear function */
      const up = r() < 0.5, t = r.pick(up ? [2, 3, 5, 10, 15, 20, 25, 30, 50] : [5, 10, 15, 20, 25, 30, 40, 60]), k = up ? 1 + t / 100 : 1 - t / 100;
      const slip = up ? (t < 10 ? 1 + t / 10 : 1 + t / 1000) : 1 + t / 100;
      const opts = [fx(k) + 'x', 'x' + (up ? '+' : '-') + t, fx(t / 100) + 'x', fx(slip) + 'x'].map(e => '$' + f + '(x)=' + e + '$');
      return { q: L('Le prix d\'un article ' + (up ? 'augmente' : 'baisse') + ' de ' + t + clfSp + '%. Parmi les fonctions suivantes, laquelle donne le nouveau prix en fonction de l\'ancien prix $x$ ?', 'Цена товара ' + (up ? 'повышается' : 'снижается') + ' на ' + t + clfSp + '%. Какая функция даёт новую цену в зависимости от старой цены $x$?'), ans: MQ(r, opts, 0), sol: [
        'Старая цена — это 100 %. После ' + (up ? 'повышения' : 'снижения') + ' на ' + t + clfSp + '% новая цена составляет $100' + (up ? '+' : '-') + t + '=' + (up ? 100 + t : 100 - t) + '$ % старой, то есть старая цена умножается на $' + fx(k) + '$.',
        ['Это линейная функция с коэффициентом ' + nf(k) + ':', f + '(x)=' + fx(k) + 'x'],
        'Откуда неверные ответы: $x' + (up ? '+' : '-') + t + '$ — ' + (up ? 'прибавили' : 'отняли') + ' ' + t + ' евро вместо ' + t + ' процентов; $' + fx(t / 100) + 'x$ — это сама ' + (up ? 'надбавка' : 'скидка') + ', а не новая цена; $' + fx(slip) + 'x$ — ' + (up ? 'ошибка в записи десятичной дроби: ' + t + ' % — это $' + fx(t / 100) + '$, а не $' + fx(slip - 1) + '$' : 'это цена после повышения, а цена снижается') + '.'] };
    }
    if (vi === 2) {   /* the coefficient read on a graph */
      let p, q; do { p = r.ri(1, 4); q = r.nz(-6, 6); } while (gcd(p, Math.abs(q)) !== 1 || Math.abs(q / p) > 4 || Math.abs(q / p) < 0.25);
      const a = q / p, P = clfPlane({ x0: -2, x1: 6, y0: a > 0 ? -2 : -6, y1: a > 0 ? 6 : 2, u: 28 });
      const ln = clfLine(P, a, 0), lab = clfLineLab(P, ln, '(<tspan font-style="italic">d</tspan>)');
      const key = Number.isInteger(a) || clfTerm(p) ? fx(a) : Fr.str(F(q, p));
      return { q: L('La droite $(d)$ ci-dessous représente une fonction linéaire $' + f + '$. Déterminer le coefficient de la fonction $' + f + '$.', 'Прямая $(d)$ на рисунке — график линейной функции $' + f + '$. Найди коэффициент функции $' + f + '$.'),
        fig: clfSvg(P, ln.svg + lab, 'droite passant par l\'origine'), ans: N(key), sol: [
          'Прямая проходит через начало координат и через узел сетки (' + p + ' ; ' + nf(q) + ') — найди его на рисунке. Значит, $' + f + '(' + p + ')=' + q + '$.',
          ['Коэффициент линейной функции — образ, делённый на прообраз:', 'a=' + q + '/' + p + (Fr.str(F(q, p)) !== q + '/' + p ? '=' + Fr.str(F(q, p)) : '') + (key !== Fr.str(F(q, p)) ? '=' + key : '')],
          'Значит, $' + f + '(x)=' + (Number.isInteger(a) || clfTerm(p) ? cf(+fx(a), 'x') : fterm(F(q, p), 'x')) + '$. ' + (a > 0 ? 'Коэффициент положительный — прямая идёт вверх.' : 'Коэффициент отрицательный — прямая идёт вниз.')] };
    }
    /* vi 3: which function is linear — sujet zéro 2026, exercice 3 */
    const k = r.nz(-9, 9), names = r.sh(['f', 'g', 'h', 'k']);
    const good = r.pick([cf(Math.abs(k) < 2 ? 3 : k, 'x'), 'x/' + r.ri(2, 5), fx(r.pick([0.5, 1.5, 2.5])) + 'x']);
    const bad = r.sh([lin(r.ri(2, 9), r.nz(-9, 9)), 'x^2', r.ri(2, 9) + '/x', String(r.ri(2, 9)), cf(r.ri(2, 5), 'x^2'), lin(1, r.ri(1, 9))]).slice(0, 3);
    const opts = [good].concat(bad).map((e, i) => '$' + names[i] + '(x)=' + e + '$');
    return { q: L('Parmi les fonctions suivantes, laquelle est une fonction linéaire ?', 'Какая из функций — линейная («fonction linéaire»)?'), ans: MQ(r, opts, 0), sol: [
      'Линейная функция — это умножение $x$ на одно и то же число: $f(x)=ax$. Без прибавления числа, без $x^2$, без деления на $x$.',
      'Подходит $' + names[0] + '(x)=' + good + '$' + (good.includes('/') ? ': делить на ' + good.split('/')[1] + ' — то же, что умножать на $1/' + good.split('/')[1] + '$.' : '.'),
      'Остальные: ' + bad.map((e, i) => '$' + names[i + 1] + '(x)=' + e + '$').join(', ') + ' — не вида $ax$ (есть прибавленное число, квадрат, деление на $x$ или постоянное значение). Проверка: у линейной функции $f(0)=0$ и график — прямая через начало координат.'] };
  } });

/* ---------- fn.affine ---------- */
topic({ id: 'fn.affine', ch: 'fn', lvl: 2, calc: false, variants: 4,
  ru: 'Аффинная функция f(x) = ax + b', fr: 'Fonction affine',
  hints: [
    'Аффинная функция («fonction affine») — это $f(x)=ax+b$. (В российских учебниках её называют линейной.) $b$ — значение при $x=0$: там график пересекает ось ординат («ordonnée à l\'origine»). $a$ — на сколько меняется $f(x)$, когда $x$ увеличивается на 1 («coefficient directeur»).',
    'По графику: $b$ — ордината точки, где прямая пересекает ось ординат. $a$ — от этой точки шагни на 1 клетку вправо и посмотри, на сколько прямая поднялась (или опустилась). Удобнее взять две точки на узлах сетки: $a$ = (изменение $y$) ÷ (изменение $x$).',
    'Точка лежит на графике $f$, если её ордината равна образу её абсциссы: для A(2 ; 7) проверяем, верно ли $f(2)=7$.'],
  gen(r, vi) {
    const f = clfFn(r);
    if (vi === 0) {   /* a and b from the formula */
      const a = r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 0.5, -0.5, 1.5]), b = r() < 0.1 ? 0 : r.nz(-9, 9), swap = b !== 0 && r() < 0.35;
      const e = swap ? S(b, cf(a, 'x')) : lin(a, b);
      return { q: L('On considère la fonction affine $' + f + '$ définie par $' + clfDef(f, e) + '$. Elle s\'écrit sous la forme $' + clfDef(f, 'ax+b') + '$. Donner $a$ et $b$.', 'Дана аффинная функция $' + clfDef(f, e) + '$. Она записывается в виде $' + clfDef(f, 'ax+b') + '$. Найди $a$ и $b$.'),
        ans: multi(['$a$ =', N(fx(a))], ['$b$ =', N(b)]), sol: [
          '$a$ — число, на которое умножается $x$ («coefficient directeur»), $b$ — число без $x$ («ordonnée à l\'origine»).' + (swap ? ' Порядок слагаемых не важен: $' + e + '=' + lin(a, b) + '$.' : '') + (Math.abs(a) === 1 ? ' $' + cf(a, 'x') + '$ — это $' + a + '*x$.' : '') + (b === 0 ? ' Числа без $x$ нет — значит, $b=0$ (это линейная функция).' : ''),
          ['Итак:', 'a=' + fx(a) + ';b=' + b],
          'Смысл: $b=' + f + '(0)$ — значение функции при $x=0$, а $a$ показывает, на сколько меняется $' + f + '(x)$, когда $x$ увеличивается на 1.'] };
    }
    if (vi === 1 || vi === 2) {   /* read on the graph */
      let a, b; do { a = vi === 2 ? r.nz(-3, 3) : r.pick([1, 2, 3, -1, -2, -3, 0.5, -0.5, 1.5, -1.5]); b = r.ri(-3, 4); } while ((vi === 2 && (b === 0 || a === b)) || Math.abs(b + 2 * a) > 5);
      const P = clfPlane({ x0: -4, x1: 5, y0: -5, y1: 6, u: 24 }), ln = clfLine(P, a, b), fig = clfSvg(P, ln.svg + clfLineLab(P, ln, '(<tspan font-style="italic">d</tspan>)'), 'droite');
      const st = Number.isInteger(a) ? 1 : 2;
      const read = [
        'Прямая пересекает ось ординат в точке (0 ; ' + nf(b) + '), значит, $b=' + f + '(0)=' + b + '$ — «ordonnée à l\'origine».',
        ['От этой точки сдвигаемся на ' + st + ' ' + (st === 1 ? 'клетку' : 'клетки') + ' вправо — прямая ' + (a > 0 ? 'поднимается' : 'опускается') + ' на ' + nf(Math.abs(a * st)) + ' и снова проходит через узел сетки (' + st + ' ; ' + nf(b + a * st) + '). Коэффициент — изменение $y$, делённое на изменение $x$:', st > 1 ? 'a=' + fx(a * st) + '/' + st + '=' + fx(a) : 'a=' + fx(a)]];
      if (vi === 1) {
        const what = r.ri(0, 2), intro = L('La droite $(d)$ ci-dessous représente une fonction affine $' + f + '$ définie par $' + clfDef(f, 'ax+b') + '$.', 'Прямая $(d)$ — график аффинной функции $' + clfDef(f, 'ax+b') + '$.');
        const ask = [L(' Lire graphiquement $a$ et $b$.', ' Найди по графику $a$ и $b$.'), L(' Lire graphiquement l\'ordonnée à l\'origine $b$.', ' Найди по графику свободный член $b$ («ordonnée à l\'origine»).'), L(' Lire graphiquement le coefficient directeur $a$.', ' Найди по графику коэффициент $a$ («coefficient directeur»).')][what];
        return { q: L(intro.fr + ask.fr, intro.ru + ask.ru), fig, ans: what === 0 ? multi(['$a$ =', N(fx(a))], ['$b$ =', N(b)]) : what === 1 ? N(b) : N(fx(a)),
          sol: (what === 1 ? read.slice(0, 1) : read).concat(['Итак, $' + clfDef(f, lin(+fx(a), b)) + '$.']) };
      }
      const opts = [lin(a, b), lin(b, a), lin(-a, b), lin(a, -b)];
      return { q: L('Parmi les fonctions suivantes, laquelle est représentée par la droite $(d)$ ci-dessous ?', 'Какая из функций изображена прямой $(d)$?'), fig, ans: MQ(r, opts.map(e => '$' + clfDef(f, e) + '$'), 0), sol: read.concat([
        'Значит, $' + clfDef(f, opts[0]) + '$. Откуда неверные ответы: $' + opts[1] + '$ — перепутаны коэффициент и свободный член; $' + opts[2] + '$ — ошибка в знаке $a$: прямая ' + (a > 0 ? 'идёт вверх, значит $a>0$' : 'идёт вниз, значит $a<0$') + '; $' + opts[3] + '$ — ошибка в знаке $b$: прямая пересекает ось ординат ' + (b > 0 ? 'выше' : 'ниже') + ' нуля.']) };
    }
    /* vi 3: does a point belong to the line */
    const a = r.nz(-5, 5), b = r.nz(-9, 9), p = r.nz(-4, 5), v = a * p + b, ok = r() < 0.5;
    let q = v; if (!ok) q = r() < 0.4 && v !== p && a * v + b !== p ? p : v + r.pick([-2, -1, 1, 2]);
    const pt = ok || q !== p ? 'A(' + nf(p) + ' ; ' + nf(q) + ')' : 'A(' + nf(v) + ' ; ' + nf(p) + ')', px = ok || q !== p ? p : v, py = ok || q !== p ? q : p;
    const fv = a * px + b;
    return { q: L('On considère la fonction $' + f + '$ définie par $' + clfDef(f, lin(a, b)) + '$. Affirmation : « le point ' + pt + ' appartient à la droite qui représente la fonction $' + f + '$ ». Cette affirmation est-elle vraie ou fausse ?', 'Дана функция $' + clfDef(f, lin(a, b)) + '$. Утверждение: «точка ' + pt + ' лежит на прямой — графике функции $' + f + '$». Это утверждение верно или неверно?'),
      ans: TF(fv === py), sol: [
        'Точка лежит на графике, если её ордината равна образу её абсциссы. Абсцисса точки — ' + nf(px) + ', ордината — ' + nf(py) + '.',
        ['Вычисляем образ абсциссы:', f + '(' + px + ')=' + clfSubLin(a, b, px) + '=' + fv],
        fv === py ? 'Получили ' + nf(py) + ' — как ордината точки. Точка лежит на прямой, утверждение верно.' : 'Получили ' + nf(fv) + ', а ордината точки ' + nf(py) + '. Точка не лежит на прямой, утверждение неверно.' + (q === p && !ok ? ' (Здесь легко перепутать координаты: первая — абсцисса $x$, вторая — ордината $y$.)' : '')] };
  } });

/* ---------- fn.affine-points ---------- */
topic({ id: 'fn.affine-points', ch: 'fn', lvl: 3, calc: false, variants: 3,
  ru: 'Аффинная функция по двум значениям', fr: 'Déterminer une fonction affine à partir de deux valeurs',
  hints: [
    'Коэффициент $a$ — во сколько раз изменение $f(x)$ больше изменения $x$: $a=(f(x_2)-f(x_1))/(x_2-x_1)$. Это работает, потому что у аффинной функции $f(x)$ растёт равномерно: на $a$ при каждом шаге $x$ на 1.',
    'Когда $a$ известно, $b$ находят из одного значения: $f(x_1)=a*x_1+b$ — это уравнение с одной неизвестной $b$.',
    'Если дано $f(0)$, то это сразу $b$. Проверь ответ вторым значением: подставь $x_2$ и убедись, что получилось $f(x_2)$.'],
  gen(r, vi) {
    const f = clfFn(r);
    if (vi === 0 || vi === 1) {
      let a, b, x1, x2;
      if (vi === 0) { do { a = r.nz(-5, 5); b = r.nz(-9, 9); x1 = r.ri(-4, 3); x2 = x1 + r.ri(1, 5); } while (x1 === 0 || x2 === 0); }
      else { const fr2 = r.pick([[1, 2], [-1, 2], [3, 2], [-3, 2], [2, 3], [-2, 3], [1, 3], [-1, 3]]); a = F(fr2[0], fr2[1]); b = r.nz(-6, 6); x1 = fr2[1] * r.ri(-2, 0); x2 = x1 + fr2[1] * r.ri(1, 2); if (x1 === 0) x1 = -fr2[1]; }
      const av = vi === 0 ? a : Fr.val(a), y1 = av * x1 + b, y2 = av * x2 + b, aStr = vi === 0 ? String(a) : Fr.str(a), aKey = vi === 0 ? String(a) : clfTerm(a.d) ? fx(av) : Fr.str(a);
      const giv = vi === 0 ? '$' + f + '(' + x1 + ')=' + y1 + '$ et $' + f + '(' + x2 + ')=' + y2 + '$' : 'les points A(' + nf(x1) + ' ; ' + nf(y1) + ') et B(' + nf(x2) + ' ; ' + nf(y2) + ')';
      const givRu = vi === 0 ? '$' + f + '(' + x1 + ')=' + y1 + '$ и $' + f + '(' + x2 + ')=' + y2 + '$' : 'через точки A(' + nf(x1) + ' ; ' + nf(y1) + ') и B(' + nf(x2) + ' ; ' + nf(y2) + ')';
      return { q: vi === 0 ? L('On considère une fonction affine $' + f + '$ telle que ' + giv + '. On écrit $' + clfDef(f, 'ax+b') + '$. Déterminer $a$ et $b$.', '$' + f + '$ — аффинная функция, причём ' + givRu + '. Запишем $' + clfDef(f, 'ax+b') + '$. Найди $a$ и $b$.')
        : L('La droite représentant la fonction affine $' + f + '$ passe par ' + giv + '. On écrit $' + clfDef(f, 'ax+b') + '$. Déterminer $a$ et $b$.', 'График аффинной функции $' + f + '$ проходит ' + givRu + '. Запишем $' + clfDef(f, 'ax+b') + '$. Найди $a$ и $b$.'),
        ans: multi(['$a$ =', N(aKey)], ['$b$ =', N(b)]), sol: [
          ['Когда $x$ меняется от ' + nf(x1) + ' до ' + nf(x2) + ' (на ' + (x2 - x1) + '), значение меняется от ' + nf(y1) + ' до ' + nf(y2) + ' (на ' + nf(y2 - y1) + '). Коэффициент — отношение этих изменений:', 'a=(' + y2 + '-' + np(y1) + ')/(' + x2 + '-' + np(x1) + ')=' + [x2 - x1 === 1 ? null : (y2 - y1) + '/' + (x2 - x1), aStr, aKey].filter((t, i, arr) => t != null && arr.indexOf(t) === i).join('=')],
          ['Находим $b$ из первого значения: $' + f + '(' + x1 + ')=a*' + np(x1) + '+b$.', y1 + '=' + (vi === 0 ? a : '(' + aStr + ')') + '*' + np(x1) + '+b'],
          ['$' + (vi === 0 ? a : '(' + aStr + ')') + '*' + np(x1) + '=' + (av * x1) + '$, значит:', 'b=' + y1 + '-' + np(av * x1) + '=' + b],
          'Проверка вторым значением: $' + f + '(' + x2 + ')=' + fx(av * x2) + clfPm(b) + '=' + y2 + '$ — верно.'] };
    }
    /* vi 2: QCM, f(0) and f(k) */
    let a, b, k, opts;
    do { a = r.nz(-4, 5); b = r.nz(-6, 9); k = r.ri(2, 4); opts = [lin(a, b), lin(b, a), lin(a * k, b), lin(a, a * k + b)]; } while (!clfDistinct(opts) || opts.slice(1).some(o => clfSame(o, opts[0])));
    const yk = a * k + b;
    return { q: L('On considère une fonction affine $' + f + '$ telle que $' + f + '(0)=' + b + '$ et $' + f + '(' + k + ')=' + yk + '$. Parmi les propositions suivantes, laquelle est l\'expression de $' + f + '(x)$ ?', '$' + f + '$ — аффинная функция, $' + f + '(0)=' + b + '$ и $' + f + '(' + k + ')=' + yk + '$. Какое из выражений задаёт $' + f + '(x)$?'),
      ans: MQ(r, opts.map(e => '$' + clfDef(f, e) + '$'), 0), sol: [
        '$' + f + '(0)=a*0+b=b$, значит $b=' + b + '$.',
        ['Когда $x$ растёт от 0 до ' + k + ', значение меняется от ' + nf(b) + ' до ' + nf(yk) + ', то есть на ' + nf(yk - b) + '. На каждую единицу $x$ — в ' + k + ' раза меньше:', 'a=' + (yk - b) + '/' + k + '=' + a],
        'Откуда неверные ответы: $' + opts[1] + '$ — перепутаны $a$ и $b$; $' + opts[2] + '$ — изменение ' + nf(yk - b) + ' не разделили на изменение $x$ (на ' + k + '); $' + opts[3] + '$ — за $b$ взяли $' + f + '(' + k + ')$, хотя $b$ — это значение при $x=0$.'] };
  } });

/* ---------- fn.modeliser ---------- */
/* two offers: A — a price per unit, B — a yearly card + a smaller price per unit */
const clfOffers = [
  (p, s, q) => ({ fr: 'Une piscine propose deux tarifs. Tarif A : ' + eur(p) + ' l\'entrée. Tarif B : un abonnement annuel de ' + eur(s) + ', puis ' + eur(q) + ' l\'entrée. On note $x$ le nombre d\'entrées dans l\'année.', ru: 'Бассейн предлагает два тарифа. Тариф A: ' + eur(p) + ' за вход. Тариф B: годовой абонемент за ' + eur(s) + ' и затем ' + eur(q) + ' за вход. Обозначим через $x$ число посещений за год.', u: ['entrées', 'посещений', 'd\'entrées', 'посещения'] }),
  (p, s, q) => ({ fr: 'Un cinéma propose deux tarifs. Tarif A : ' + eur(p) + ' la place. Tarif B : une carte annuelle de ' + eur(s) + ', puis ' + eur(q) + ' la place. On note $x$ le nombre de places achetées dans l\'année.', ru: 'Кинотеатр предлагает два тарифа. Тариф A: ' + eur(p) + ' за билет. Тариф B: годовая карта за ' + eur(s) + ' и затем ' + eur(q) + ' за билет. Обозначим через $x$ число билетов за год.', u: ['places', 'билетов', 'de places', 'билета'] }),
  (p, s, q) => ({ fr: 'Une compagnie maritime propose deux tarifs pour aller d\'une île à la côte. Tarif A : ' + eur(p) + ' le voyage. Tarif B : une carte annuelle de ' + eur(s) + ', puis ' + eur(q) + ' le voyage. On note $x$ le nombre de voyages dans l\'année.', ru: 'Морская компания предлагает два тарифа для поездок с острова на материк. Тариф A: ' + eur(p) + ' за поездку. Тариф B: годовая карта за ' + eur(s) + ' и затем ' + eur(q) + ' за поездку. Обозначим через $x$ число поездок за год.', u: ['voyages', 'поездок', 'de voyages', 'поездки'] }),
  (p, s, q) => ({ fr: 'Une salle d\'escalade propose deux tarifs. Tarif A : ' + eur(p) + ' la séance. Tarif B : une adhésion annuelle de ' + eur(s) + ', puis ' + eur(q) + ' la séance. On note $x$ le nombre de séances dans l\'année.', ru: 'Скалодром предлагает два тарифа. Тариф A: ' + eur(p) + ' за занятие. Тариф B: годовой взнос ' + eur(s) + ' и затем ' + eur(q) + ' за занятие. Обозначим через $x$ число занятий за год.', u: ['séances', 'занятий', 'de séances', 'занятия'] })];
topic({ id: 'fn.modeliser', ch: 'fn', lvl: 2, calc: false, variants: 4,
  ru: 'Функции в задачах: тарифы', fr: 'Modéliser par une fonction : comparer des tarifs',
  hints: [
    'Запиши цену каждого тарифа как функцию числа $x$: «по 8 € за вход» — это $8x$ (линейная функция), «абонемент 30 € и 5 € за вход» — это $5x+30$ (аффинная функция: постоянная часть плюс часть, пропорциональная $x$).',
    'Чтобы сравнить тарифы для данного $x$, посчитай обе цены. Чтобы найти, когда тарифы равны, реши уравнение $8x=5x+30$.',
    'На графике тариф с абонементом начинается выше (при $x=0$ уже надо заплатить абонемент), но растёт медленнее. Правее точки пересечения прямых дешевле тот тариф, чья прямая ниже.'],
  gen(r, vi) {
    let q, d, xs, p, s;
    do { q = r.pick([2, 3, 4, 5, 6, 8, 10]); d = r.pick([2, 3, 4, 5, 10]); xs = r.ri(4, 12); p = q + d; s = d * xs; } while (s > 120 || p > 20 || s === q || (vi === 3 && xs > 6 && xs % 2));
    const o = r.pick(clfOffers)(p, s, q), [U, Uru, dU, Ug1] = o.u, A = x => p * x, B = x => s + q * x;
    if (vi === 0) {
      const opts = [lin(q, s), lin(s, q), cf(s + q, 'x'), cf(q, 'x')].map(e => '$g(x)=' + e + '$');
      return { q: L(o.fr + ' Parmi les fonctions suivantes, laquelle donne le prix à payer, en euros, avec le tarif B ?', o.ru + ' Какая функция даёт цену (в евро) по тарифу B?'), ans: MQ(r, opts, 0), sol: [
        ['По тарифу B абонемент ' + eur(s) + ' платят один раз, а за каждую единицу — ' + eur(q) + '; за $x$ единиц это $' + cf(q, 'x') + '$. Всего:', 'g(x)=' + lin(q, s)],
        'Откуда неверные ответы: $' + lin(s, q) + '$ — перепутаны абонемент и цена за единицу; $' + cf(s + q, 'x') + '$ — абонемент заплатили бы за каждую единицу, а он платится один раз; $' + cf(q, 'x') + '$ — забыли абонемент. (Тариф A — линейная функция $f(x)=' + cf(p, 'x') + '$.)'] };
    }
    if (vi === 1) {   /* which offer for n units */
      let n; do n = r() < 0.15 ? xs : r.ri(1, 2 * xs); while (n < 1);
      const a = A(n), b = B(n), c = a < b ? 0 : a > b ? 1 : 2;
      const opts = [L('Le tarif A', 'Тариф A'), L('Le tarif B', 'Тариф B'), L('Les deux tarifs coûtent le même prix', 'Оба тарифа стоят одинаково')];
      return { q: L(o.fr + ' Quel est le tarif le plus avantageux pour ' + n + ' ' + U + ' ?', o.ru + ' Какой тариф выгоднее для ' + n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? Ug1 : Uru) + '?'), ans: MQF(opts, c), sol: [
        ['Тариф A:', p + '*' + n + '=' + a],
        ['Тариф B:', s + '+' + q + '*' + n + '=' + s + '+' + q * n + '=' + b],
        c === 2 ? 'Цены равны (' + eur(a) + ') — тарифы одинаково выгодны.' : 'Дешевле тариф ' + (c === 0 ? 'A' : 'B') + ': ' + eur(Math.min(a, b)) + ' против ' + eur(Math.max(a, b)) + '. ' + (c === 0 ? 'При малом числе ' + Uru + ' абонемент не окупается.' : 'При большом числе ' + Uru + ' абонемент окупается: за каждую единицу по тарифу B платят на ' + eur(d) + ' меньше.')] };
    }
    if (vi === 2) {   /* when are the two prices equal */
      return { q: L(o.fr + ' Pour quel nombre ' + dU + ' les deux tarifs coûtent-ils le même prix ?', o.ru + ' При каком числе ' + Uru + ' оба тарифа стоят одинаково?'), ans: N(xs), sol: [
        ['Цена по тарифу A — $' + cf(p, 'x') + '$, по тарифу B — $' + lin(q, s) + '$. Цены равны, когда:', cf(p, 'x') + '=' + lin(q, s)],
        ['Вычитаем $' + cf(q, 'x') + '$ из обеих частей:', cf(d, 'x') + '=' + s],
        ['Делим на ' + d + ':', 'x=' + s + '/' + d + '=' + xs],
        'Проверка: $' + p + '*' + xs + '=' + A(xs) + '$ и $' + s + '+' + q + '*' + xs + '=' + B(xs) + '$ — по ' + eur(A(xs)) + ' в обоих тарифах.'] };
    }
    /* vi 3: read the graph */
    const dx = xs > 6 ? 2 : 1, X1 = 2 * xs, Ymax = p * X1, dy = [5, 10, 20, 25, 50, 100].find(t => Ymax / t <= 10), Y1 = Math.ceil(Ymax / dy) * dy;
    const P = clfPlane({ x0: 0, x1: X1, y0: 0, y1: Y1, dx, dy, u: X1 / dx > 10 ? 22 : 24, lm: 38 });
    const la = clfLine(P, p, 0), lb = clfLine(P, q, s);
    const fig = clfSvg(P, la.svg + lb.svg + clfLineLab(P, la, 'A') + clfLineLab(P, lb, 'B', true) + clfT(P.X(0) + 8, 12, 'Prix (€)', 'start', 'ftm', 13) + clfT(P.X(X1), P.Y(0) - 7, 'Nombre ' + dU, 'end', 'ftm', 13), 'prix selon les deux tarifs');
    return { q: L(o.fr + ' Le graphique ci-dessous donne le prix à payer avec chaque tarif en fonction de $x$. Par lecture graphique, à partir de combien ' + dU + ' le tarif B devient-il plus avantageux que le tarif A ?', o.ru + ' На графике — цена по каждому тарифу в зависимости от $x$. По графику определи, начиная с какого числа ' + Uru + ' тариф B становится выгоднее тарифа A.'), fig, ans: N(xs + 1), sol: [
      'Прямая A проходит через начало координат (нет абонемента), прямая B начинается с ' + eur(s) + ' (абонемент), но поднимается медленнее.',
      'Прямые пересекаются при $x=' + xs + '$: здесь оба тарифа стоят ' + eur(A(xs)) + '. Правее точки пересечения прямая B ниже прямой A — тариф B дешевле.',
      'При $x=' + xs + '$ цены ещё равны, поэтому тариф B становится выгоднее начиная с $x=' + (xs + 1) + '$. Проверка: $' + p + '*' + (xs + 1) + '=' + A(xs + 1) + '$, а $' + s + '+' + q + '*' + (xs + 1) + '=' + B(xs + 1) + '$.'] };
  } });

/* ===================== FICHES ===================== */
fiche({ ch: 'cl', id: 'cl.litteral', ru: 'Подобные слагаемые и раскрытие скобок', fr: 'Réduire et développer', body: [
  'Подобные слагаемые — с одинаковой буквенной частью: $3x$ и $-5x$, $2x^2$ и $x^2$. Их складывают, складывая коэффициенты: $3x+2x=5x$ — это «3 раза по $x$ и ещё 2 раза». Числа складывают с числами. А $3x+2$ или $x+x^2$ упростить нельзя — это разные «единицы счёта».',
  'Раскрыть скобки («développer») — заменить произведение суммой: $k(a+b)=ka+kb$, множитель умножается на каждое слагаемое вместе со знаком. Минус перед скобкой — это умножение на $-1$: $-(x-4)=-x+4$.',
  'Две скобки: $(a+b)(c+d)=ac+ad+bc+bd$ — каждое слагаемое на каждое. Это четыре части прямоугольника со сторонами $a+b$ и $c+d$. Потом приводим подобные («réduire»).',
  'Значение выражения: подставляем число вместо буквы (отрицательное — в скобках) и считаем по порядку действий. $3x^2$ при $x=-2$: $3*(-2)^2=3*4=12$.'],
  ex: [['Подобные', '4x+3-x+5=3x+8'], ['Минус перед скобкой', '5x-3(2x-4)=5x-6x+12=-x+12'], ['Две скобки', '(x+2)(x-5)=x^2-5x+2x-10=x^2-3x-10']] });
fiche({ ch: 'cl', id: 'cl.identites-factorisation', ru: 'Формулы и разложение на множители', fr: 'Identités remarquables et factorisation', body: [
  '$(a+b)(a-b)=a^2-b^2$: средние слагаемые взаимно уничтожаются. Удобно для счёта: $102*98=100^2-2^2=9996$, $(5+2√3)(5-2√3)=25-12=13$.',
  '$(a+b)^2=a^2+2ab+b^2$ и $(a-b)^2=a^2-2ab+b^2$. Запись $(a+b)^2=a^2+b^2$ — ошибка: теряется удвоенное произведение $2ab$. Проверка: $(3+2)^2=25$, а $3^2+2^2=13$.',
  'Разложить на множители («factoriser») — записать сумму как произведение. Общий множитель: $6x^2+9x=3x(2x+3)$ — выноси самый большой. Разность квадратов: $9x^2-25=(3x-5)(3x+5)$. Проверка — раскрыть скобки обратно.'],
  ex: [['Общий множитель', '5x+5=5(x+1)'], ['Разность квадратов', 'x^2-49=(x-7)(x+7)'], ['Квадрат суммы', '(x+3)^2=x^2+6x+9']] });
fiche({ ch: 'cl', id: 'cl.equations', ru: 'Уравнения', fr: 'Les équations', body: [
  'Решение уравнения — число, при подстановке которого левая и правая части равны. Чтобы проверить, решение ли это, решать уравнение не нужно — достаточно подставить.',
  'Решаем, делая одно и то же с обеими частями («les deux membres»): прибавляем или вычитаем одно и то же, умножаем или делим на одно и то же ненулевое число — равенство сохраняется. Цель: все $x$ — в одной части, числа — в другой, потом делим на коэффициент.',
  'Уравнение-произведение: $A*B=0$, только если $A=0$ или $B=0$ (если оба множителя не нули, произведение не ноль). Уравнение $x^2=a$: при $a>0$ два решения, $√a$ и $-√a$; при $a=0$ одно, $0$; при $a<0$ решений нет.',
  'Задача с текстом: назови неизвестное $x$, вырази через него остальные величины, найди величину, записанную двумя способами, — это и есть уравнение. Ответ проверь по условию.'],
  ex: [['ax + b = c', '3x-2=25;3x=27;x=9'], ['ax + b = cx + d', '5x+3=2x+12;3x=9;x=3'], ['Произведение', '(x-3)(x+5)=0;x=3;x=-5']] });
fiche({ ch: 'cl', id: 'cl.programmes', ru: 'Программы вычислений', fr: 'Les programmes de calcul', body: [
  'Шаги выполняем строго по порядку, каждый раз с результатом предыдущего шага. Отрицательное число — в скобках.',
  'Буквами: исходное число — $x$. Если умножается результат, в котором есть сумма, нужны скобки: «прибавить 4, умножить на 3, вычесть 5» — это $3(x+4)-5$, а не $x+4*3-5$.',
  'Какое число выбрать, чтобы получить нужный результат: приравниваем выражение программы к этому результату и решаем уравнение.',
  'Доказать, что результат «всегда …» («quel que soit le nombre choisi»): записать программу с буквой $x$, раскрыть скобки, привести подобные. Проверка на нескольких числах подсказывает ответ, но не доказывает его.'],
  ex: [['Программа', 'x→x+4→3(x+4)→3(x+4)-5'], ['Упрощение', '3(x+4)-5=3x+12-5=3x+7'], ['Доказательство', '2(x+3)-2x=2x+6-2x=6']] });
fiche({ ch: 'fn', id: 'fn.image-antecedent', ru: 'Функции: образ и прообраз', fr: 'Fonctions : image et antécédent', body: [
  'Функция $f$ ставит каждому числу $x$ одно число $f(x)$. В записи $f(3)=7$ число 7 — образ («image») числа 3, а 3 — прообраз («antécédent») числа 7. Запись $$f : x \\mapsto 2x+1$$ означает то же, что $f(x)=2x+1$.',
  'По формуле: образ — подставить число вместо $x$; прообраз — решить уравнение $f(x)=b$.',
  'По таблице значений: образ — число под $x$; прообразы — числа над всеми клетками второй строки с нужным значением. По графику: образ — от оси абсцисс вертикально до кривой и прочитать высоту; прообразы — абсциссы всех точек кривой на нужной высоте.',
  'У каждого числа один образ, а прообразов может быть несколько или ни одного.'],
  ex: [['Образ', 'f(x)=3x-5;f(4)=3*4-5=7'], ['Прообраз числа 7', '3x-5=7;3x=12;x=4']] });
fiche({ ch: 'fn', id: 'fn.lineaire-affine', ru: 'Линейные и аффинные функции', fr: 'Fonctions linéaires et affines', body: [
  'Линейная функция («fonction linéaire») $f(x)=ax$ описывает пропорциональность; её график — прямая через начало координат. Коэффициент по любой точке: $a=f(x)/x$. В российских учебниках это «прямая пропорциональность».',
  'Аффинная функция («fonction affine») $f(x)=ax+b$; её график — прямая. $b=f(0)$ — «ordonnée à l\'origine», там прямая пересекает ось ординат; $a$ — «coefficient directeur»: на сколько растёт $f(x)$, когда $x$ увеличивается на 1. В российских учебниках такую функцию называют линейной.',
  'По двум значениям: $a=(f(x_2)-f(x_1))/(x_2-x_1)$, затем $b$ из равенства $f(x_1)=a*x_1+b$.',
  'Проценты: увеличить на $t$ % — умножить на $1+t/100$, уменьшить — на $1-t/100$. Тариф «абонемент + цена за единицу» — аффинная функция; когда два тарифа стоят одинаково, находят из уравнения или по точке пересечения прямых.'],
  ex: [['Скидка 20 %', 'f(x)=0.8x'], ['Абонемент 60 € + 10 € за раз', 'g(x)=10x+60'], ['Коэффициент по двум точкам', 'a=(11-5)/(3-1)=3']] });

/* ===================== DICTIONARY ===================== */
gloss('réduire une expression', 'привести подобные слагаемые', 'собрать вместе слагаемые с одинаковой буквенной частью: 3x + 2x = 5x');
gloss('développer', 'раскрыть скобки', 'превратить произведение в сумму: 3(x + 2) = 3x + 6');
gloss('factoriser', 'разложить на множители', 'превратить сумму в произведение: 3x + 6 = 3(x + 2)');
gloss('une expression littérale', 'буквенное выражение');
gloss('un facteur commun', 'общий множитель');
gloss('une identité remarquable', 'формула сокращённого умножения', '(a + b)(a − b) = a² − b² и другие');
gloss('une équation', 'уравнение');
gloss('une solution d\'une équation', 'решение (корень) уравнения', 'число, при подстановке которого равенство верно');
gloss('résoudre une équation', 'решить уравнение', 'найти все его решения');
gloss('les membres d\'une équation', 'части уравнения', 'левая и правая части от знака =');
gloss('une équation produit', 'уравнение вида «произведение равно нулю»', 'например (x − 3)(x + 5) = 0');
gloss('un programme de calcul', 'программа вычислений', 'цепочка действий с выбранным числом');
gloss('le nombre de départ', 'исходное (выбранное) число');
gloss('quel que soit', 'при любом, каким бы ни был', 'quel que soit le nombre choisi — какое бы число ни выбрали');
gloss('une fonction', 'функция');
gloss('l\'image d\'un nombre', 'образ числа', 'f(3) = 7: 7 — образ числа 3');
gloss('un antécédent', 'прообраз', 'f(3) = 7: 3 — прообраз числа 7');
gloss('la représentation graphique', 'график функции', 'то же, что la courbe représentative');
gloss('graphiquement', 'по графику', 'déterminer graphiquement — найти по рисунку');
gloss('un tableau de valeurs', 'таблица значений функции');
gloss('une fonction linéaire', 'линейная функция f(x) = ax', 'в российских учебниках — «прямая пропорциональность»');
gloss('une fonction affine', 'аффинная функция f(x) = ax + b', 'в российских учебниках её называют линейной');
gloss('le coefficient directeur', 'угловой коэффициент', 'число a в f(x) = ax + b');
gloss('l\'ordonnée à l\'origine', 'свободный член b', 'ордината точки, где прямая пересекает ось ординат');
