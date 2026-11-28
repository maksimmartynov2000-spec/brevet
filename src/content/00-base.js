/* ===================== CHAPTERS of the programme (cycle 4, DNB 2027) =====================
   The order here is the order on the «Программа» screen. Topics and problems refer to a chapter by its id. */
chapter({ id: 'nc', ru: 'Числа и вычисления', fr: 'Nombres et calculs' });
chapter({ id: 'pp', ru: 'Пропорциональность и проценты', fr: 'Proportionnalité et pourcentages' });
chapter({ id: 'cl', ru: 'Буквенные выражения и уравнения', fr: 'Calcul littéral et équations' });
chapter({ id: 'fn', ru: 'Функции', fr: 'Fonctions' });
chapter({ id: 'st', ru: 'Статистика и вероятности', fr: 'Statistiques et probabilités' });
chapter({ id: 'gm', ru: 'Величины и измерения', fr: 'Grandeurs et mesures' });
chapter({ id: 'ge', ru: 'Геометрия', fr: 'Espace et géométrie' });
chapter({ id: 'al', ru: 'Алгоритмы и таблицы', fr: 'Algorithmique et tableur' });
chapter({ id: 'lg', ru: 'Язык бревета', fr: 'La langue du brevet' });   /* command words, connectors, how to write an answer in French */

/* ===================== MODEL TOPIC (the other content files follow the same style) ===================== */
topic({ id: 'nc.frac-addsub', ch: 'nc', lvl: 1, calc: false, variants: 3,
  ru: 'Сложение и вычитание дробей', fr: 'Additionner et soustraire des fractions',
  hints: [
    'Складывать можно только одинаковые доли: $1/3$ и $1/4$ — куски разного размера. Поэтому сначала режем оба куска на одинаковые доли — приводим к общему знаменателю («dénominateur commun»).',
    'Общий знаменатель — число, которое делится на оба знаменателя; удобнее всего наименьшее. Числитель и знаменатель умножаем на одно и то же число: дробь от этого не меняется, меняется только размер долей.',
    'Когда доли одинаковые, складываем или вычитаем числители, а знаменатель оставляем: $2/12+3/12=5/12$ — это 2 куска и ещё 3 куска по $1/12$. В конце проверь, нельзя ли сократить («fraction irréductible»).'],
  gen(r, vi) {
    const q = L('Calculer et donner le résultat sous forme de fraction irréductible.', 'Вычисли и запиши ответ несократимой дробью.');
    if (vi === 0) {   /* same denominator */
      /* a + b = d would give 1: a whole number does not fit «sous forme de fraction irréductible» */
      const d = r.pick([5, 7, 9, 11, 13]); let a, b; do { a = r.ri(1, d - 1); b = r.ri(1, d - 1); } while (a === b || a + b === d);
      const minus = r() < 0.4 && a > b; const n = minus ? a - b : a + b; const res = F(n, d);
      return { q, m: a + '/' + d + (minus ? '-' : '+') + b + '/' + d, ans: FRA(res), sol: [
        ['Доли уже одинаковые (знаменатель ' + d + '), поэтому ' + (minus ? 'вычитаем' : 'складываем') + ' только числители — считаем, сколько долей ' + (minus ? 'осталось' : 'всего') + '.', a + '/' + d + (minus ? '-' : '+') + b + '/' + d + '=' + n + '/' + d],
        res.d === d ? 'Числитель и знаменатель не имеют общих делителей — дробь уже несократимая.' : ['Сокращаем: числитель и знаменатель делятся на ' + (d / res.d) + '.', n + '/' + d + '=' + Fr.str(res)]] };
    }
    const pairs = [[2, 3], [3, 4], [2, 5], [4, 5], [3, 5], [2, 7], [4, 3], [5, 6], [3, 8], [6, 4], [10, 4], [6, 9], [4, 10]];
    const [d1, d2] = r.pick(pairs), m = lcm2(d1, d2), k1 = m / d1, k2 = m / d2, minus = vi === 2;
    /* no whole numbers such as 4/4 in the terms, and no whole result (3/6 + 2/4 = 1, 2/4 − 3/6 = 0) */
    let a, b, n; do { a = r.ri(1, d1 + 2); b = r.ri(1, d2 + 1); if (a % d1 === 0) a++; if (b % d2 === 0) b--; if (!b) b = 1; n = minus ? a * k1 - b * k2 : a * k1 + b * k2; } while (n % m === 0);
    const res = F(n, m);
    const steps = [
      ['Знаменатели ' + d1 + ' и ' + d2 + ' разные — доли разного размера. Наименьшее число, которое делится и на ' + d1 + ', и на ' + d2 + ', — это ' + m + '.'],
      ['Приводим к знаменателю ' + m + ': ' + (k1 > 1 ? 'первую дробь умножаем сверху и снизу на ' + k1 : 'первая дробь уже со знаменателем ' + m) + ', ' + (k2 > 1 ? 'вторую — на ' + k2 : 'вторая уже со знаменателем ' + m) + '. Значение дробей при этом не меняется.', a + '/' + d1 + (minus ? '-' : '+') + b + '/' + d2 + '=' + (a * k1) + '/' + m + (minus ? '-' : '+') + (b * k2) + '/' + m],
      ['Теперь доли одинаковые — ' + (minus ? 'вычитаем' : 'складываем') + ' числители.', (a * k1) + '/' + m + (minus ? '-' : '+') + (b * k2) + '/' + m + '=' + n + '/' + m]];
    if (res.d !== m) steps.push(['Сокращаем на ' + (m / res.d) + '.', n + '/' + m + '=' + Fr.str(res)]);
    if (n < 0) steps.push('Ответ отрицательный: вычли больше, чем было.');
    return { q, m: a + '/' + d1 + (minus ? '-' : '+') + b + '/' + d2, ans: FRA(res), sol: steps };
  } });

/* ===================== MODEL PROBLEM (Partie 2) ===================== */
probleme({ id: 'p2.salaires', ch: 'st', lvl: 2, pts: 4,
  ru: 'Зарплаты мужчин и женщин', fr: 'Salaires des femmes et des hommes',
  src: 'Sujet de référence 2027 n°1 · exercice 1',
  gen(r) {
    /* ten women's salaries, sorted; the men are described by summary statistics */
    const base = r.pick([1400, 1450, 1500, 1550]);
    const w = [0, 30, 50, 100, 150, 200, 300, 500, 1500, 2000].map((d, i) => base + d + (i > 0 && i < 9 ? r.pick([0, 0, 10, 20]) : 0)).sort((a, b) => a - b);
    const sumW = w.reduce((a, b) => a + b, 0), meanW = sumW / 10;
    const meanH = Math.round(meanW / 10) * 10 + r.pick([60, 80, 120, 150]);
    const etH = r.pick([2200, 2400, 2500]), medH = r.pick([2100, 2200, 2300]);
    const lowH = w[0] + r.pick([-40, -20, 20, 30]), topH = lowH + etH;   /* the lowest salary of the men */
    const ctx = L('On souhaite comparer les salaires mensuels des femmes et des hommes dans une entreprise. Salaires des 10 femmes : ' + w.map(eur).join(' ; ') + '. Salaires des 20 hommes : moyenne ' + eur(meanH) + ', étendue ' + eur(etH) + ', médiane ' + eur(medH) + '. Les salaires des hommes sont tous différents.',
      'Хотят сравнить месячные зарплаты женщин и мужчин в одной компании. Зарплаты 10 женщин: ' + w.map(eur).join(' ; ') + '. Зарплаты 20 мужчин: среднее ' + eur(meanH) + ', размах ' + eur(etH) + ', медиана ' + eur(medH) + '. Все зарплаты мужчин разные.');
    return { ctx, qs: [
      { q: L('Calculer le salaire moyen des femmes.', 'Вычисли среднюю зарплату женщин.'), ans: N(fx(meanW), { unit: '€' }), sol: [
        'Средняя зарплата («moyenne») — сумма всех зарплат, делённая на их количество.',
        ['Сумма десяти зарплат:', w.join('+') + '=' + sumW],
        ['Делим на 10:', sumW + '/10=' + fx(meanW), '€']],
        redac: ['On additionne les 10 salaires des femmes : $' + w.join('+') + '=' + sumW + '$.', 'On divise par l\'effectif : $' + sumW + '÷10=' + fx(meanW) + '$.', 'Le salaire moyen des femmes est de ' + eur(meanW) + '.'] },
      { q: L('Le salaire moyen des hommes est-il supérieur à celui des femmes ?', 'Средняя зарплата мужчин больше, чем у женщин?'), red: true,
        ans: MQ(r, [L('Oui, car ' + eur(meanH) + ' > ' + eur(meanW) + '.', 'Да, потому что ' + eur(meanH) + ' > ' + eur(meanW) + '.'),
          L('Non, car la médiane des hommes est ' + eur(medH) + '.', 'Нет, потому что медиана у мужчин ' + eur(medH) + '.'),
          L('On ne peut pas savoir sans connaître tous les salaires des hommes.', 'Нельзя узнать, не зная всех зарплат мужчин.')], 0),
        sol: ['Средние сравнивают напрямую: среднее у мужчин дано в условии, у женщин мы его вычислили.', 'Медиана — другая характеристика, она не отвечает на вопрос о среднем. А все зарплаты знать не нужно: среднее уже посчитано.'] },
      { q: L('Le plus bas salaire des hommes est ' + eur(lowH) + '. Quel est le salaire le plus élevé des hommes ?', 'Самая низкая зарплата у мужчин — ' + eur(lowH) + '. Какая самая высокая зарплата у мужчин?'), ans: N(topH, { unit: '€' }), sol: [
        'Размах («étendue») — разница между самым большим и самым маленьким значением.',
        ['Значит, самая большая зарплата = самая маленькая + размах:', lowH + '+' + etH + '=' + topH, '€']],
        redac: ['L\'étendue est la différence entre la plus grande et la plus petite valeur de la série.', '$' + lowH + '+' + etH + '=' + topH + '$', 'Le salaire le plus élevé des hommes est de ' + eur(topH) + '.'] },
      { q: L('Combien d\'hommes gagnent plus de ' + eur(medH) + ' ?', 'Сколько мужчин получают больше ' + eur(medH) + '?'), ans: N(10), sol: [
        'Медиана («médiane») делит упорядоченный ряд пополам: половина значений не больше её, половина — не меньше.',
        'Мужчин 20, все зарплаты разные, и медиана ' + eur(medH) + ' лежит между 10-й и 11-й зарплатой. Значит, ровно 10 мужчин получают больше.'],
        redac: ['La médiane partage la série en deux groupes de même effectif : au moins la moitié des salaires sont supérieurs ou égaux à ' + eur(medH) + '.', 'Il y a 20 hommes et tous les salaires sont différents, donc 10 hommes gagnent plus de ' + eur(medH) + '.'] },
      { q: L('Remettre dans l\'ordre les étapes de la justification.', 'Расставь шаги обоснования по порядку.'), red: true,
        ans: ORD(r, [L('Il y a 20 hommes et tous les salaires sont différents.', 'Мужчин 20, и все зарплаты разные.'),
          L('La médiane partage la série rangée en deux groupes de même effectif.', 'Медиана делит упорядоченный ряд на две группы с одинаковым числом значений.'),
          L('Donc 10 hommes gagnent plus de ' + eur(medH) + '.', 'Значит, 10 мужчин получают больше ' + eur(medH) + '.')]),
        sol: ['Сначала то, что дано, потом свойство медианы, в конце вывод.'] }] };
  } });

/* ===================== FICHE and DICTIONARY (model) ===================== */
fiche({ ch: 'nc', id: 'nc.fractions', ru: 'Дроби', fr: 'Les fractions', body: [
  'Дробь $a/b$ — это $a$ долей по $1/b$. Числитель — «numérateur», знаменатель — «dénominateur».',
  'Умножить или разделить числитель и знаменатель на одно и то же число — значение не меняется: $3/4=6/8$. Так сокращают дроби и приводят к общему знаменателю.',
  'Складывают и вычитают только дроби с одинаковым знаменателем. Умножают — числитель на числитель, знаменатель на знаменатель. Делят — умножают на обратную дробь.'],
  ex: [['Сложение', '1/3+1/4=4/12+3/12=7/12'], ['Умножение', '2/3*9/4=18/12=3/2'], ['Деление', '3/5÷9/10=3/5*10/9=2/3']],
  frs: [
    'Pour additionner ou soustraire deux fractions, on les réduit au même dénominateur, puis on additionne ou on soustrait les numérateurs.',
    'Pour multiplier deux fractions, on multiplie les numérateurs entre eux et les dénominateurs entre eux.',
    'Diviser par une fraction revient à multiplier par son inverse.',
    'Une fraction est irréductible lorsque son numérateur et son dénominateur n\'ont pas d\'autre diviseur commun que 1.'] });
gloss('une fraction irréductible', 'несократимая дробь', 'числитель и знаменатель не имеют общих делителей, кроме 1');
gloss('le numérateur', 'числитель');
gloss('le dénominateur', 'знаменатель');
gloss('la moyenne', 'среднее значение', 'сумма значений, делённая на их количество');
gloss('la médiane', 'медиана', 'значение посередине упорядоченного ряда');
gloss('l\'étendue', 'размах', 'наибольшее значение минус наименьшее');
