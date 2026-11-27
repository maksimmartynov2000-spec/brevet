/* Topics above the level of the brevet, taken out of the app on the owner's decision (November 2026: no «сверх» level).
   Kept for reference. Files whose name starts with «_» are not built and not tested;
   the helpers these topics use stay in nc.js. */

/* ===================== SIMPLIFYING SQUARE ROOTS (above the brevet) ===================== */
topic({ id: 'nc.racines-simpl', ch: 'nc', lvl: 3, calc: false, variants: 4,
  ru: 'Упрощение корней', fr: 'Simplifier des racines carrées',
  hints: [
    'Для положительных $a$ и $b$: $√(a*b)=√a*√b$. Почему: $(√a*√b)^2=a*b$, и $√a*√b$ положительно — значит, это и есть $√(a*b)$. Так же $√(a/b)=√a/√b$.',
    'Чтобы упростить $√50$, найди в 50 наибольший множитель — полный квадрат: $50=25*2$, значит, $√50=√25*√2=5√2$.',
    'Складывать можно только одинаковые корни, как подобные слагаемые: $3√2+5√2=8√2$ (как $3x+5x=8x$), а $√2+√3$ не упрощается. Сначала упрости каждый корень, потом приводи подобные.'],
  gen(r, vi) {
    const SQ = [2, 3, 5, 6, 7, 10, 11];
    if (vi === 0) {   /* √(k²·m) = k√m */
      let k, m; do { k = r.ri(2, 7); m = r.pick(SQ); } while (k * k * m > 300);
      const n = k * k * m;
      return { q: L('Écrire $√' + n + '$ sous la forme $a√b$, où $a$ et $b$ sont des nombres entiers et $b$ est le plus petit possible.', 'Запиши $√' + n + '$ в виде $a√b$, где $a$ и $b$ — целые числа, а $b$ как можно меньше.'),
        ans: XP(surd(k, m), { forms: ['surd'] }), sol: [
          'Ищем в ' + n + ' наибольший множитель — полный квадрат: ' + n + ' = ' + k * k + ' × ' + m + ', и ' + k * k + ' = ' + k + '².',
          ['Корень из произведения — произведение корней:', '√' + n + '=√' + k * k + '*√' + m + '=' + surd(k, m)],
          'В ' + m + ' нет множителей — полных квадратов (кроме 1), поэтому дальше не упрощается.'] };
    }
    if (vi === 1) {   /* √a × √b with a·b a perfect square */
      let m, s, t; do { m = r.pick([2, 3, 5, 6, 7]); s = r.ri(1, 4); t = r.ri(1, 4); } while (s === t || m * Math.max(s, t) ** 2 > 200);
      const a = m * s * s, b = m * t * t, p = a * b, mm = '√' + a + '*√' + b;
      return { q: L('Calculer :', 'Вычисли:'), m: mm, ans: N(m * s * t), sol: [
        ['Произведение корней — корень из произведения:', mm + '=√(' + a + '*' + b + ')=√' + p],
        [p + ' = ' + (m * s * t) + '², поэтому', '√' + p + '=' + (m * s * t)]] };
    }
    if (vi === 2) {   /* sums of roots */
      let m, s, t, p, q2, minus, co; do { m = r.pick([2, 3, 5]); s = r.ri(1, 5); t = r.ri(1, 5); p = r.ri(1, 3); q2 = r.ri(1, 3); minus = r() < 0.4; co = minus ? p * s - q2 * t : p * s + q2 * t; } while (co <= 0 || (s === 1 && t === 1) || s === t || m * Math.max(s, t) ** 2 > 200);
      const A = m * s * s, B = m * t * t, t1 = cf(p, '√' + A), t2 = cf(q2, '√' + B), mm = t1 + (minus ? '-' : '+') + t2;
      const simp = (c, k) => (k === 1 ? cf(c, '√' + m) : cf(c, '√' + (m * k * k)) + '=' + cf(c, '√' + k * k + '*√' + m) + '=' + cf(c * k, '√' + m));
      return { q: L('Écrire sous la forme $a√b$, où $a$ et $b$ sont des nombres entiers et $b$ est le plus petit possible.', 'Запиши в виде $a√b$, где $a$ и $b$ — целые числа, а $b$ как можно меньше.'), m: mm,
        ans: XP(surd(co, m), { forms: ['surd'] }), sol: [
          'Сначала упрощаем каждый корень — выделяем множитель, полный квадрат:',
          ['', simp(p, s) + ';' + simp(q2, t)],
          ['Теперь корни одинаковые — это подобные слагаемые, как $' + (p * s) + 'x' + (minus ? '-' : '+') + (q2 * t) + 'x$:', cf(p * s, '√' + m) + (minus ? '-' : '+') + cf(q2 * t, '√' + m) + '=' + surd(co, m)]] };
    }
    /* vi === 3: quotients */
    if (r() < 0.5) { let b, k; do { b = r.pick([2, 3, 5, 6, 7]); k = r.ri(2, 8); } while (b * k * k > 300); const a = b * k * k, mm = '√' + a + '/√' + b;
      return { q: L('Calculer :', 'Вычисли:'), m: mm, ans: N(k), sol: [['Частное корней — корень из частного:', mm + '=√(' + a + '/' + b + ')=√' + k * k + '=' + k]] }; }
    let p, s; do { p = r.ri(1, 9); s = r.ri(2, 12); } while (gcd(p, s) !== 1 || p === s);
    const mm = '√(' + p * p + '/' + s * s + ')';
    return { q: L('Écrire sous la forme d\'une fraction :', 'Запиши в виде дроби:'), m: mm, ans: FRA(F(p, s)), sol: [
      ['Корень из дроби — корень из числителя, делённый на корень из знаменателя:', mm + '=√' + p * p + '/√' + s * s + '=' + p + '/' + s],
      'Проверка: $$\\left(\\frac{' + p + '}{' + s + '}\\right)^2=\\frac{' + p * p + '}{' + s * s + '}$$.'] };
  } });
