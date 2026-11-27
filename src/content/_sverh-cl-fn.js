/* Topics above the level of the brevet, taken out of the app on the owner's decision (November 2026: no «сверх» level).
   Kept for reference. Files whose name starts with «_» are not built and not tested;
   the helpers these topics use stay in cl-fn.js. */

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
