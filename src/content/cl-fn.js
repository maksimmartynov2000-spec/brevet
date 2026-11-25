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
        [true, V(cf(p, '#') + '-#=' + cf(p - 1, '#')), 'Верно: одиночная буква — это $1' + v + '$. Было ' + clfRaz(p) + ' по $' + v + '$, убрали один раз — осталось ' + (p - 1) + '.'],
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
