/* Topics above the level of the brevet, taken out of the app on the owner's decision (November 2026: no «сверх» level).
   Kept for reference. Files whose name starts with «_» are not built and not tested;
   the helpers these topics use stay in pp-gm.js. */

topic({ id: 'pp.evol-successives', ch: 'pp', lvl: 3, calc: false, variants: 4,
  ru: 'Исходная цена и два изменения подряд', fr: 'Évolutions successives, retrouver une valeur initiale',
  hints: [
    'Работай с коэффициентами: повышение на 20 % — умножение на $1.2$, снижение на 25 % — умножение на $0.75$. Процент всегда берут от той величины, которая была ДО этого изменения.',
    'Исходную цену находят обратным действием: если новая = старая × $1.2$, то старая = новая ÷ $1.2$. Вычитать 20 % из новой цены нельзя: 20 % брали от старой, меньшей цены.',
    'Два изменения подряд — два умножения: на $1.1$, потом на $0.9$, всего на $1.1×0.9=0.99$, то есть −1 %. Поэтому +10 % и −10 % не гасят друг друга: второй процент берут уже от новой цены.'],
  gen(r, vi) {
    if (vi === 0) {   /* the value before the change */
      const [t, Ps] = r.pick([[20, [25, 50, 75, 100, 150, 200, 250, 300, 400, 500]], [25, [40, 80, 120, 160, 200, 240, 400]], [50, [20, 40, 60, 80, 120, 200]], [10, [50, 80, 100, 150, 200, 300, 500]],
        [-20, [25, 50, 75, 100, 150, 200, 250, 300]], [-25, [40, 80, 120, 160, 200]], [-50, [30, 50, 70, 90, 120, 150]], [-10, [50, 80, 100, 150, 200, 300]], [-40, [50, 100, 150, 200, 250]]]);
      const kind = r.pick(['prix', 'prix', 'pop']), up = t > 0, a = Math.abs(t);
      const P = r.pick(Ps) * (kind === 'pop' ? 10 : 1), Nw = P * (100 + t) / 100, c = (100 + t) / 100, d = P * a / 100;
      let T;
      if (kind === 'prix') T = up ? ['Après une augmentation de ' + ppgPc(a) + ', un vélo coûte ' + eur(Nw) + '. Quel était son prix avant l\'augmentation ?', 'После повышения цены на ' + ppgPc(a) + ' велосипед стоит ' + eur(Nw) + '. Сколько он стоил до повышения?']
        : ['Pendant les soldes, un article est vendu ' + eur(Nw) + ' après une remise de ' + ppgPc(a) + '. Quel était son prix avant la remise ?', 'На распродаже товар продаётся за ' + eur(Nw) + ' со скидкой ' + ppgPc(a) + '. Сколько он стоил до скидки?'];
      else T = up ? ['En un an, la population d\'un village a augmenté de ' + ppgPc(a) + ' ; elle est maintenant de ' + nf(Nw) + ' habitants. Combien d\'habitants y avait-il un an plus tôt ?', 'За год население деревни выросло на ' + ppgPc(a) + ' и теперь составляет ' + ppgPl(Nw, 'жителя', 'жителя', 'жителей') + '. Сколько жителей было год назад?']
        : ['En un an, le nombre d\'adhérents d\'un club a baissé de ' + ppgPc(a) + ' ; il est maintenant de ' + nf(Nw) + '. Combien y avait-il d\'adhérents un an plus tôt ?', 'За год число членов клуба уменьшилось на ' + ppgPc(a) + ' и теперь равно ' + nf(Nw) + '. Сколько членов было год назад?'];
      const k = String(c).includes('.') ? Math.pow(10, String(c).split('.')[1].length) : 1;
      const wrong = Nw * (100 - t) / 100;
      return { q: L(T[0], T[1]), ans: kind === 'prix' ? ppgEurAns(P) : N(P), sol: [
        ['Обозначим исходное значение $P$. ' + (up ? 'Повышение' : 'Снижение') + ' на ' + a + ' % — это умножение на $' + fx(c) + '$, и получилось ' + nf(Nw) + ':', 'P*' + fx(c) + '=' + Nw],
        ['Обратное действие к умножению — деление' + (k > 1 ? ' (чтобы делить в уме, умножим оба числа на ' + k + ')' : '') + ':', 'P=' + Nw + '÷' + fx(c) + (k > 1 ? '=' + Nw * k + '÷' + Math.round(c * k) : '') + '=' + P],
        'Проверка: ' + a + ' % от ' + nf(P) + ' — это ' + nf(d) + ', и $' + P + (up ? '+' : '-') + d + '=' + Nw + '$ ✓',
        'Ловушка: ' + (up ? 'вычесть' : 'прибавить') + ' ' + a + ' % от ' + nf(Nw) + ' (получится ' + nf(wrong) + ') — неверно: проценты брали от исходного значения ' + nf(P) + ', а не от ' + nf(Nw) + '.'] };
    }
    const pairs = [[10, -10], [20, -20], [-20, 20], [50, -50], [10, 10], [20, 10], [-10, -10], [25, -20], [-20, 25], [50, -20], [20, -25], [100, -50], [-50, 100], [30, -30]];
    if (vi === 1) {   /* the final price */
      let a, b, P, g = 0;
      do { [a, b] = r.pick(pairs); P = r.pick([100, 200, 400, 500, 1000, 50, 80, 300, 600]); } while ((P * (100 + a) * (100 + b)) % 100 && g++ < 50);
      const c1 = (100 + a) / 100, c2 = (100 + b) / 100, P1 = P * (100 + a) / 100, P2 = P1 * (100 + b) / 100;
      const v1 = ppgVerb(a), v2 = ppgVerb(b, a);
      return { q: L('Un article coûte ' + eur(P) + '. Son prix ' + v1.fr + ', ' + v2.fr + '. Quel est le prix final de l\'article ?', 'Товар стоит ' + eur(P) + '. Его цена ' + v1.ru + ', ' + v2.ru + '. Какой стала цена в итоге?'), ans: ppgEurAns(P2), sol: [
        ['Первое изменение — умножение на $' + fx(c1) + '$:', P + '*' + fx(c1) + '=' + fx(P1), '€'],
        ['Второй процент считают от НОВОЙ цены ' + eur(P1) + ': умножаем на $' + fx(c2) + '$:', fx(P1) + '*' + fx(c2) + '=' + fx(P2), '€'],
        'Вместе цену умножили на $' + fx(c1) + '×' + fx(c2) + '=' + fx(c1 * c2) + '$. ' + (a + b === 0 ? 'Повышение и снижение на один и тот же процент не возвращают к исходной цене: проценты берутся от разных цен.' : 'Проценты не складываются: второй процент берётся от уже изменённой цены.')] };
    }
    if (vi === 2) {   /* the overall change */
      const [a, b] = r.pick(pairs), g0 = Math.round(((100 + a) * (100 + b) - 10000) / 100);
      const cand = [g0, a + b, 0, -g0, a, b, a + b + (a + b >= 0 ? 1 : -1)];
      const vals = []; cand.forEach(v => { if (!vals.includes(v)) vals.push(v); });
      const opts = vals.slice(0, 4).map(ppgEvTxt);
      const v1 = ppgVerb(a), v2 = ppgVerb(b, a);
      return { q: L('Le prix d\'un article ' + v1.fr + ', ' + v2.fr + '. Au final, par rapport au prix de départ, le prix :', 'Цена товара ' + v1.ru + ', ' + v2.ru + '. В итоге, по сравнению с начальной, цена:'), ans: MQ(r, opts, 0), sol: [
        'Возьмём начальную цену 100 € — с ней проценты видны сразу.',
        ['После первого изменения:', '100*' + fx((100 + a) / 100) + '=' + (100 + a), '€'],
        ['Второй процент берут от ' + (100 + a) + ' €, а не от 100 €:', (100 + a) + '*' + fx((100 + b) / 100) + '=' + fx((100 + a) * (100 + b) / 100), '€'],
        (g0 === 0 ? 'Снова 100 €: цена не изменилась.' : 'Было 100 €, стало ' + nf((100 + a) * (100 + b) / 100) + ' €: цена ' + ppgEvTxt(g0).ru + '.') + ' Просто сложить проценты (' + (a > 0 ? '+' : '−') + Math.abs(a) + ' и ' + (b > 0 ? '+' : '−') + Math.abs(b) + ') нельзя: они взяты от разных цен.'] };
    }
    /* vi 3: the percentage that brings the value back */
    const [a, b] = r.pick([[-20, 25], [25, -20], [-50, 100], [100, -50], [-60, 150], [150, -60], [-75, 300], [60, -37.5], [-80, 400], [300, -75]]);
    const up = a > 0, A = Math.abs(a), Bv = Math.abs(b), B = 100 + a;
    const C = r.pick([
      { fr: 'Le prix d\'un article', il: 'il', back: 'son prix de départ', ru: 'Цена товара', vUp: 'выросла', vDn: 'снизилась', pr: 'её', rback: 'исходной цене' },
      { fr: 'Le nombre d\'abonnés d\'une chaîne', il: 'il', back: 'sa valeur de départ', ru: 'Число подписчиков канала', vUp: 'выросло', vDn: 'уменьшилось', pr: 'его', rback: 'исходному значению' },
      { fr: 'La production d\'une usine', il: 'elle', back: 'sa valeur de départ', ru: 'Объём производства завода', vUp: 'вырос', vDn: 'снизился', pr: 'его', rback: 'исходному уровню' }]);
    return { q: L(C.fr + (up ? ' augmente de ' : ' baisse de ') + ppgPc(A) + '. De quel pourcentage doit-' + C.il + ' ensuite ' + (up ? 'baisser' : 'augmenter') + ' pour revenir à ' + C.back + ' ?',
      C.ru + ' ' + (up ? C.vUp : C.vDn) + ' на ' + ppgPc(A) + '. На сколько процентов ' + C.pr + ' теперь нужно ' + (up ? 'снизить' : 'повысить') + ', чтобы вернуться к ' + C.rback + '?'),
      ans: N(fx(Bv), { unit: '%' }), sol: [
        ['Возьмём начальное значение 100 — так проценты видны сразу. После ' + (up ? 'повышения' : 'снижения') + ' на ' + nf(A) + ' %:', '100' + (up ? '+' : '-') + A + '=' + B],
        ['Чтобы вернуться к 100, нужно ' + (up ? 'убрать' : 'добавить') + ' ' + nf(A) + ', но процент теперь считают от ' + B + ', а не от 100:', A + '/' + B + '=' + fx(Bv / 100) + '=' + fx(Bv) + '/100'],
        'Значит, нужно ' + (up ? 'снизить' : 'повысить') + ' на ' + nf(Bv) + ' %. Ответ «' + nf(A) + ' %» неверен: те же ' + nf(A) + ' единиц составляют разную долю от 100 и от ' + B + '.',
        'Через коэффициенты: $' + fx(B / 100) + '×k=1$, значит, $k=1÷' + fx(B / 100) + '=' + fx(1 + b / 100) + '$ — это ' + (up ? 'снижение' : 'повышение') + ' на ' + nf(Bv) + ' %.'] };
  } });

/* ---------- two types taken out of gm.agrandissement-rapport (November 2026) ----------
   The topic stays in the app with its id and its exam-level types (the ratio k from two areas or volumes, from «les aires sont
   multipliées par 25», from two lengths). Above the brevet, removed: going from the area factor to the volume factor through k
   (two inverse steps, not in the sujets 2018–2027), and a pyramid or a cone cut by a plane parallel to the base, whose volume is
   found as V × k³ (in the sujets the frustum is computed from two cones, each with its formula: Asie 2026, ex. 2).
   The figure helper moved here with them (nothing else used it). */
/* a pyramid or a cone cut by a plane parallel to the base at the fraction t of the height from the apex */
function ppgSectionFig(kind, t) {
  if (kind === 'cone') {
    const cx = 170, rx = 95, ry = 30, ty = 14, by = 190, ys = ty + t * (by - ty), rs = t * rx, qs = t * ry;
    const half = (y, a, b, up, cls) => '<path d="M' + (cx - a).toFixed(1) + ' ' + y.toFixed(1) + ' A' + a.toFixed(1) + ' ' + b.toFixed(1) + ' 0 0 ' + (up ? 1 : 0) + ' ' + (cx + a).toFixed(1) + ' ' + y.toFixed(1) + '" class="' + cls + '"/>';
    let g = '<path d="M' + cx + ' ' + ty + ' L' + (cx - rx) + ' ' + by + ' A' + rx + ' ' + ry + ' 0 0 0 ' + (cx + rx) + ' ' + by + ' Z" class="ffill"/>';
    g += '<path d="M' + cx + ' ' + ty + ' L' + (cx - rs).toFixed(1) + ' ' + ys.toFixed(1) + ' A' + rs.toFixed(1) + ' ' + qs.toFixed(1) + ' 0 0 0 ' + (cx + rs).toFixed(1) + ' ' + ys.toFixed(1) + ' Z" class="ffill"/>';
    g += ppgLn(cx, ty, cx - rx, by, 'fl') + ppgLn(cx, ty, cx + rx, by, 'fl') + half(by, rx, ry, false, 'fl') + half(by, rx, ry, true, 'fdash') + half(ys, rs, qs, false, 'fl') + half(ys, rs, qs, true, 'fdash') + ppgLn(cx, ty, cx, by, 'fdash') + ppgDot(cx, by) + ppgDot(cx, ys);
    return svgFig(340, 230, g, 'cône coupé');
  }
  const c = 10, Hp = 9, T = [c / 2, Hp, c / 2], B = [[0, 0, 0], [c, 0, 0], [c, 0, c], [0, 0, c]], S = B.map(p => [T[0] + t * (p[0] - T[0]), T[1] + t * (p[1] - T[1]), T[2] + t * (p[2] - T[2])]);
  const E = [[B[0], B[1]], [B[1], B[2]], [B[2], B[3], 1], [B[3], B[0], 1], [T, B[0]], [T, B[1]], [T, B[2]], [T, B[3], 1], [S[0], S[1]], [S[1], S[2]], [S[2], S[3], 1], [S[3], S[0], 1], [T, [c / 2, 0, c / 2], 1]];
  return ppgSolid(E, [[T, B[0], B[1]], [T, B[1], B[2]], [T, S[0], S[1]], [T, S[1], S[2]]], [], m => { const q = m([c / 2, 0, c / 2]); return ppgDot(q[0], q[1]); });
}
topic({ id: 'gm.agrandissement-sections', ch: 'gm', lvl: 3, calc: false, variants: 2,
  ru: 'Увеличение и уменьшение: от площадей к объёмам, сечение пирамиды и конуса', fr: 'Agrandissement et réduction : des aires aux volumes, sections',
  hints: [
    'Площади и объёмы связаны через $k$: площадь умножилась на 25 → $k=5$ → объём умножился на $5^3=125$.',
    'Сечение пирамиды или конуса плоскостью, параллельной основанию, отрезает маленькую пирамиду (конус) — уменьшенную копию большой с коэффициентом $k$ = (высота маленькой) ÷ (высота большой). Её объём = объём большой × $k^3$.'],
  gen(r, vi) {
    if (vi === 0) {   /* from the area ratio to the volume ratio and back (type 1 of the former gm.agrandissement-rapport) */
      const kf = r.pick([F(2), F(3), F(4), F(5), F(10), F(1, 2), F(1, 3)]), k2 = F(kf.n * kf.n, kf.d * kf.d), k3 = F(Math.pow(kf.n, 3), Math.pow(kf.d, 3)), fromA = r() < 0.6;
      const ks = f => f.d === 1 ? String(f.n) : '$' + Fr.str(f) + '$';
      return { q: fromA ? L('Lors d\'un agrandissement ou d\'une réduction, les aires sont multipliées par ' + ks(k2) + '. Par combien les volumes sont-ils multipliés ?', 'При увеличении или уменьшении площади умножились на ' + ks(k2) + '. На сколько умножились объёмы?')
        : L('Lors d\'un agrandissement ou d\'une réduction, les volumes sont multipliés par ' + ks(k3) + '. Par combien les aires sont-elles multipliées ?', 'При увеличении или уменьшении объёмы умножились на ' + ks(k3) + '. На сколько умножились площади?'),
        ans: N(Fr.str(fromA ? k3 : k2), { show: tF(fromA ? k3 : k2) }), sol: [
          fromA ? ['Площади умножаются на $k^2$. Находим длины — коэффициент $k$:', ppgKtx(kf) + '^2=' + Fr.str(k2)] : ['Объёмы умножаются на $k^3$. Находим коэффициент $k$ для длин:', ppgKtx(kf) + '^3=' + Fr.str(k3)],
          fromA ? ['Значит, $k=' + Fr.str(kf) + '$, а объёмы умножаются на $k^3$:', ppgKtx(kf) + '^3=' + Fr.str(k3)] : ['Значит, $k=' + Fr.str(kf) + '$, а площади умножаются на $k^2$:', ppgKtx(kf) + '^2=' + Fr.str(k2)],
          'Нельзя просто умножить или поделить на ' + ks(fromA ? k2 : k3) + ': всё идёт через коэффициент длин $k$.'] };
    }
    /* vi 1: a section of a pyramid or a cone (type 2 of the former gm.agrandissement-rapport) */
    {
      const kind = r.pick(['pyr', 'cone']), [kn, kd] = r.pick([[1, 2], [1, 3], [1, 4], [2, 3], [3, 4]]), Ht = kd * r.pick([2, 3, 4, 5, 6]), h = Ht * kn / kd;
      const V = Math.pow(kd, 3) * r.pick([1, 2, 3, 4, 5, 10]), v = V * Math.pow(kn, 3) / Math.pow(kd, 3), tronc = r() < 0.3, k = F(kn, kd), k3 = F(Math.pow(kn, 3), Math.pow(kd, 3));
      const w = kind === 'pyr' ? ['Une pyramide', 'la petite pyramide', 'Пирамида', 'маленькой пирамиды', 'большой пирамиды', 'усечённой пирамиды', 'de la grande', 'de la petite pyramide', 'Её'] : ['Un cône', 'le petit cône', 'Конус', 'маленького конуса', 'большого конуса', 'усечённого конуса', 'du grand', 'du petit cône', 'Его'];
      return { q: L(w[0] + ' de hauteur ' + Ht + ' cm a un volume de ' + V + ' cm³. On ' + (kind === 'pyr' ? 'la' : 'le') + ' coupe par un plan parallèle à sa base, à ' + h + ' cm du sommet : ' + w[1] + ' obtenu' + (kind === 'pyr' ? 'e' : '') + ' est une réduction ' + w[6] + '. ' + (tronc ? 'Quel est le volume de la partie restante, du côté de la base ?' : 'Quel est le volume ' + w[7] + ' ?'),
        w[2] + ' высотой ' + Ht + ' см имеет объём ' + V + ' см³. ' + w[8] + ' разрезали плоскостью, параллельной основанию, на расстоянии ' + h + ' см от вершины; верхняя часть — уменьшенная копия ' + w[4] + '. ' + (tronc ? 'Каков объём оставшейся нижней части (' + w[5] + ')?' : 'Каков объём ' + w[3] + '?')),
        fig: ppgSectionFig(kind === 'pyr' ? 'pyr' : 'cone', kn / kd), ans: N(fx(tronc ? V - v : v), { unit: 'cm³' }), sol: [
          ['Верхняя часть — уменьшение с коэффициентом $k$ = отношение высот:', h + '/' + Ht + '=' + Fr.str(k)],
          ['Объёмы умножаются на $k^3$:', ppgKtx(k) + '^3=' + Fr.str(k3)],
          ['Объём верхней части:', V + '*' + ppgKtx(k3) + '=' + fx(v), 'cm³'],
          tronc ? ['Нижняя часть — большой объём минус верхний:', V + '-' + fx(v) + '=' + fx(V - v), 'cm³'] : 'Ошибка — умножить объём на $k$: объём уменьшается во всех трёх направлениях, то есть в $' + kd + '^3$ раз' + (kn > 1 ? ' и умножается на $' + kn + '^3$' : '') + '.'] };
    }
  } });
