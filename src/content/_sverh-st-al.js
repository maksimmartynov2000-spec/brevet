/* Topics above the level of the brevet, taken out of the app on the owner's decision (November 2026: no «сверх» level).
   Kept for reference. Files whose name starts with «_» are not built and not tested;
   the helpers these topics use stay in st-al.js. */

topic({ id: 'st.moyenne-objectif', ch: 'st', lvl: 3, calc: false, variants: 4,
  ru: 'Среднее: найти недостающее значение', fr: 'Moyenne : retrouver une valeur',
  hints: [
    'Главный ключ: сумма = среднее × количество. Он прямо следует из определения среднего (среднее = сумма ÷ количество).',
    'Посчитай, какой должна быть сумма всех значений, чтобы получилось нужное среднее, и сравни с суммой, которая уже есть. Разница — недостающее значение.',
    'Если среднее изменилось после добавления значения, сравни суммы «до» и «после»: их разница и есть добавленное значение.'],
  gen(r, vi) {
    const w = staWho(r), il = staG(w, 'il', 'elle');
    if (vi === 0) {   /* the mark needed for a target mean */
      let a = [12, 9, 14], m = 12, x = 13, k = 3;
      for (let g = 0; g < 400; g++) {
        const kk = r.pick([3, 4]), aa = []; for (let i = 0; i < kk; i++) aa.push(r.ri(6, 17));
        const mm = r.ri(10, 15), xx = (kk + 1) * mm - staSum(aa);
        if (xx >= 6 && xx <= 20 && xx !== mm) { a = aa; m = mm; x = xx; k = kk; break; }
      }
      const S = staSum(a), T = (k + 1) * m;
      return { q: staL(`${w.n} a obtenu ${staEt(a)} à ses ${STA_NUM_FR[k]} premiers contrôles de mathématiques. Quelle note doit-${il} obtenir au contrôle suivant pour avoir exactement ${m} de moyenne sur ces ${STA_NUM_FR[k + 1]} contrôles ?`,
        `${w.n} ${staG(w, 'получил', 'получила')} ${staI(a)} за первые ${STA_NUM_RU[k]} контрольные по математике. Какую оценку нужно получить за следующую контрольную, чтобы среднее по ${k === 3 ? 'четырём' : 'пяти'} контрольным было ровно ${m}?`),
        ans: N(x), sol: [
          ['Среднее = сумма ÷ количество, значит, сумма = среднее × количество. Чтобы среднее по ' + (k + 1) + ' контрольным было ' + m + ', сумма всех оценок должна быть:', (k + 1) + '*' + m + '=' + T],
          ['Сумма уже полученных оценок:', staPlus(a) + '=' + S],
          ['Не хватает:', T + '-' + S + '=' + x],
          ['Проверка:', '(' + staPlus(a.concat([x])) + ')/' + (k + 1) + '=' + m]] };
    }
    if (vi === 1) {   /* the next test has coefficient 2 */
      let a = [11, 8, 13], m = 12, d = 28;
      for (let g = 0; g < 400; g++) {
        const aa = [r.ri(6, 17), r.ri(6, 17), r.ri(6, 17)], mm = r.ri(10, 14), dd = 5 * mm - staSum(aa);
        if (dd % 2 === 0 && dd / 2 >= 6 && dd / 2 <= 20) { a = aa; m = mm; d = dd; break; }
      }
      const S = staSum(a), x = d / 2;
      return { q: staL(`${w.n} a obtenu ${staEt(a)} à trois contrôles de coefficient 1. Le prochain contrôle compte coefficient 2. Quelle note doit-${il} obtenir à ce contrôle pour avoir exactement ${m} de moyenne ?`,
        `${w.n} ${staG(w, 'получил', 'получила')} ${staI(a)} за три контрольные с коэффициентом 1. Следующая контрольная идёт с коэффициентом 2. Какую оценку нужно за неё получить, чтобы среднее стало ровно ${m}?`),
        ans: N(x), sol: [
          'Коэффициент 2 значит, что новая оценка считается два раза. Всего «оценок» будет 3 + 2 = 5.',
          ['Чтобы среднее было ' + m + ', сумма с учётом коэффициентов должна быть:', '5*' + m + '=' + 5 * m],
          ['Три оценки уже дают:', staPlus(a) + '=' + S],
          ['На новую оценку, взятую дважды, приходится:', 5 * m + '-' + S + '=' + d],
          ['Значит, сама оценка:', d + '/2=' + x],
          ['Проверка:', '(' + staPlus(a) + '+2*' + x + ')/5=' + m]] };
    }
    if (vi === 2) {   /* a value is added and the mean changes */
      const C = r.pick(['buts', 'nombres', 'taille']);
      let n, m1, m2, x;
      if (C === 'buts') {
        n = 4; m1 = 2; x = 7; m2 = 3;
        for (let g = 0; g < 400; g++) {
          const nn = r.pick([4, 5, 9]), aa = r.pick([1.5, 2, 2.5, 3]), xx = r.ri(0, 8), bb = (nn * aa + xx) / (nn + 1);
          if (Number.isInteger(nn * aa) && Math.abs(bb * 10 - Math.round(bb * 10)) < 1e-9 && bb !== aa && bb >= 1.5) { n = nn; m1 = aa; x = xx; m2 = bb; break; }
        }
      } else if (C === 'nombres') {
        n = r.pick([4, 5, 6, 9]); m1 = r.ri(8, 15); m2 = m1 + r.pick([-1, 1, 2, 3]); x = (n + 1) * m2 - n * m1;
        if (x < 0) { m2 = m1 + 1; x = (n + 1) * m2 - n * m1; }
      } else { n = r.pick([9, 11, 14]); m1 = r.ri(178, 186); m2 = m1 + r.pick([1, -1]); x = (n + 1) * m2 - n * m1; }
      const u = C === 'taille' ? 'cm' : '';
      const Q = {
        buts: [`Après ${n} matchs, une équipe de football a marqué en moyenne ${nf(m1)} buts par match. Après le match suivant, sa moyenne passe à ${nf(m2)} buts par match. Combien de buts l'équipe a-t-elle marqués lors de ce dernier match ?`, `После ${n} матчей среднее число голов футбольной команды за матч было ${nf(m1)}. После следующего матча оно стало ${nf(m2)}. Сколько голов команда забила в этом последнем матче?`],
        nombres: [`La moyenne de ${n} nombres est ${m1}. On ajoute un nombre à cette série ; la nouvelle moyenne est ${m2}. Quel est le nombre ajouté ?`, `Среднее ${n} чисел равно ${m1}. К ним добавили ещё одно число, и среднее стало ${m2}. Какое число добавили?`],
        taille: [`Dans une équipe de basket, la taille moyenne des ${n} joueurs est ${m1} cm. Un nouveau joueur arrive : la taille moyenne passe à ${m2} cm. Combien mesure le nouveau joueur ?`, `В баскетбольной команде средний рост ${n} игроков — ${m1} см. Пришёл новый игрок, и средний рост стал ${m2} см. Какой рост у нового игрока?`]
      }[C];
      return { q: staL(Q[0], Q[1]), ans: N(fx(x), u ? { unit: u } : {}), sol: [
        ['Сумма = среднее × количество. До добавления сумма ' + n + ' значений была:', n + '*' + fx(m1) + '=' + fx(n * m1), u],
        ['После добавления — сумма ' + (n + 1) + ' значений:', (n + 1) + '*' + fx(m2) + '=' + fx((n + 1) * m2), u],
        ['Добавленное значение — разница этих сумм:', fx((n + 1) * m2) + '-' + fx(n * m1) + '=' + fx(x), u],
        'Заметь: среднее изменилось всего на ' + nf(Math.abs(m2 - m1)) + ', а новое значение отличается от старого среднего на ' + nf(Math.abs(x - m1)) + ' — его «влияние» делится на все ' + (n + 1) + ' значений.'] };
    }
    /* what happens to the mean when the values change */
    const n = r.pick([4, 5, 8, 10]), m = r.ri(18, 28) / 2;
    if (r() < 0.5) {
      const c = r.pick([1, 2, 3]);
      return { q: staL(`Les ${n} notes d'un élève ont pour moyenne ${nf(m)}. Le professeur ajoute ${c} point${c > 1 ? 's' : ''} à chacune de ces notes. Quelle est la nouvelle moyenne ?`,
        `Среднее ${n} оценок ученика равно ${nf(m)}. Учитель добавил к каждой оценке ${c} ${staPl(c, 'балл', 'балла', 'баллов')}. Каким стало среднее?`),
        ans: N(fx(m + c)), sol: [
          'Каждая из ' + n + ' оценок выросла на ' + c + ', значит, сумма выросла на ' + n + ' × ' + c + ' = ' + n * c + '.',
          'Количество оценок то же, поэтому среднее выросло на ' + n * c + ' ÷ ' + n + ' = ' + c + '. Прибавить одно и то же число ко всем значениям — значит прибавить его к среднему.',
          ['Новое среднее:', fx(m) + '+' + c + '=' + fx(m + c)]] };
    }
    const c = r.pick([2, 3, 4]);
    return { q: staL(`La moyenne de ${n} notes est ${nf(m)}. En corrigeant une erreur, le professeur augmente une seule de ces notes de ${c} points. De combien la moyenne augmente-t-elle ?`,
      `Среднее ${n} оценок равно ${nf(m)}. Исправляя ошибку, учитель повысил только одну оценку на ${c} балла. На сколько выросло среднее?`),
      ans: N(fx(c / n)), sol: [
        'Сумма оценок выросла на ' + c + ', а количество оценок не изменилось (' + n + ').',
        ['Среднее = сумма ÷ количество, поэтому оно выросло на', c + '/' + n + '=' + fx(c / n)],
        'Ошибка — ответить ' + c + ': так было бы, если бы на ' + c + ' выросли все оценки, а выросла одна.'] };
  } });
