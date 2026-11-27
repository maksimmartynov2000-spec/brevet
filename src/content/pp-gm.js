/* ===================== PROPORTIONNALITÉ ET POURCENTAGES (pp) · GRANDEURS ET MESURES (gm) =====================
   Trainers of the two chapters, fiches and dictionary. Every top-level name of this file starts with ppg. */

/* ---------- small helpers ---------- */
const ppgSp = ' ';                                                    /* no-break space: 20 %, 12 cm */
const ppgU = (v, u) => nf(v) + ppgSp + u;                                  /* 12,5 cm */
const ppgPc = v => nf(v) + ppgSp + '%';                                    /* 20 % */
const ppgTx = v => nf(v).replace('−', '-').replace(',', '{,}').replace(/[\s\u202f\u00a0]/g, '\\,');   /* a number as TeX: 2{,}5 · 25\,000 */
const ppgRd = (v, dp) => { const p = Math.pow(10, dp); return (Math.round(v * p + (v >= 0 ? 1e-9 : -1e-9)) / p).toFixed(dp); };
/* money answer: 40.5 is shown as 40,50 € */
function ppgEurAns(v) { const s = fx(v); return N(s, { unit: '€', show: Number.isInteger(+s) ? s : (+s).toFixed(2).replace('.', '{,}') }); }
/* durations and clock times in words */
function ppgHM(min, ru) {
  const h = Math.floor(min / 60), m = Math.round(min - 60 * h), H = ru ? 'ч' : 'h', M = ru ? 'мин' : 'min';
  return (h ? h + ppgSp + H : '') + (h && m ? ' ' : '') + (m || !h ? m + ppgSp + M : '');
}
function ppgClock(min, ru) { const h = Math.floor(min / 60) % 24, m = min % 60; return ru ? h + ':' + String(m).padStart(2, '0') : h + ppgSp + 'h' + (m ? ' ' + String(m).padStart(2, '0') : ''); }
/* a duration answer: «… h … min» (two fields) or «… min» */
function ppgDurAns(min) { const h = Math.floor(min / 60), m = min % 60; return h && m ? multi([null, N(h, { unit: 'h' })], [null, N(m, { unit: 'min' })]) : h ? N(h, { unit: 'h' }) : N(m, { unit: 'min' }); }
/* table of values: rows of cells; lab — the first cell of each row is a header; { q: 'a' } — the unknown cell */
function ppgTab(rows, lab) {
  return '<table class="pblk tx nohead">' + rows.map(row => '<tr>' + row.map((c, j) => {
    if (lab && j === 0) return '<th>' + c + '</th>';
    if (c && typeof c === 'object') return '<td class="tdq"><i>' + c.q + '</i></td>';
    return '<td>' + (typeof c === 'number' ? nf(c) : c) + '</td>';
  }).join('') + '</tr>').join('') + '</table>';
}
/* SVG pieces (classes from 20-api.js, no colours) */
const ppgTxt = (x, y, s, a, cls, fs) => '<text x="' + (+x).toFixed(1) + '" y="' + (+y).toFixed(1) + '" class="' + (cls || 'ftx') + '" font-size="' + (fs || 15) + '" text-anchor="' + (a || 'middle') + '">' + s + '</text>';
const ppgLn = (x1, y1, x2, y2, cls) => '<line x1="' + (+x1).toFixed(1) + '" y1="' + (+y1).toFixed(1) + '" x2="' + (+x2).toFixed(1) + '" y2="' + (+y2).toFixed(1) + '" class="' + (cls || 'fl') + '"/>';
const ppgPg = (pts, cls) => '<polygon points="' + pts.map(p => (+p[0]).toFixed(1) + ',' + (+p[1]).toFixed(1)).join(' ') + '" class="' + (cls || 'fl') + '"/>';
const ppgPath = (d, cls) => '<path d="' + d + '" class="' + (cls || 'fl') + '"/>';
const ppgDot = (x, y) => '<circle cx="' + (+x).toFixed(1) + '" cy="' + (+y).toFixed(1) + '" r="3" class="fpt"/>';
/* Russian plural: ppgPl(5, 'минуту', 'минуты', 'минут') → '5 минут' */
function ppgPw(n, one, few, many) { const a = Math.abs(n) % 100, b = a % 10; return !Number.isInteger(n) ? few : a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many; }
const ppgPl = (n, one, few, many) => nf(n) + ppgSp + ppgPw(n, one, few, many);
/* a filled shape with an outline */
const ppgShape = pts => ppgPg(pts, 'ffill') + ppgPg(pts, 'fl');
/* a right-angle mark at corner (x, y), legs along unit vectors u and v */
const ppgRight = (x, y, u, v, s) => { s = s || 9; return ppgPath('M' + (x + u[0] * s).toFixed(1) + ' ' + (y + u[1] * s).toFixed(1) + ' L' + (x + u[0] * s + v[0] * s).toFixed(1) + ' ' + (y + u[1] * s + v[1] * s).toFixed(1) + ' L' + (x + v[0] * s).toFixed(1) + ' ' + (y + v[1] * s).toFixed(1), 'fl2'); };
/* a label of a segment, pushed d units to the left of the direction (x1,y1)→(x2,y2) */
function ppgSegLab(x1, y1, x2, y2, s, d) {
  const L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = (y2 - y1) / L, ny = -(x2 - x1) / L;
  return ppgTxt((x1 + x2) / 2 + nx * d, (y1 + y2) / 2 + ny * d + 5, s);
}

/* ======================================================================================
   CHAPTER pp — Proportionnalité et pourcentages
   ====================================================================================== */


/* ---------- pp.tableau ---------- */
topic({ id: 'pp.tableau', ch: 'pp', lvl: 1, calc: false, variants: 4,
  ru: 'Таблица пропорциональности', fr: 'Tableau de proportionnalité, quatrième proportionnelle',
  hints: [
    'Две величины пропорциональны, если одна получается из другой умножением на одно и то же число — «coefficient de proportionnalité». Поэтому если одна величина выросла в 3 раза, то и другая выросла в 3 раза.',
    'Ищи самое простое: во сколько раз одно известное число больше другого в той же строке — во столько же раз отличаются и парные им числа. Или найди, сколько приходится на одну единицу («passage par l\'unité»), и умножь.',
    'Универсальный способ — «produit en croix». Если в таблице столбцы $6$ над $12$ и $18$ над $a$, то $12/6=a/18$, поэтому $6×a=12×18$ и $a=12×18÷6$: перемножаем числа по диагонали без неизвестного и делим на число, стоящее на одной диагонали с ним.'],
  gen(r, vi) {
    if (vi === 0) {   /* Métropole 2026, Q3: a 2×2 table without headings */
      const k = r.pick([2, 3, 4, 5, 0.5, 1.5, 2.5]), m = r.pick([2, 3, 4, 5]);
      const p = k % 1 ? r.pick([2, 4, 6, 8, 10, 12]) : r.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      const v = [p, p * m, p * k, p * k * m];               /* [top left, top right, bottom left, bottom right] */
      const u = r.pick([3, 3, 3, 0, 1, 2]);
      const cell = i => i === u ? { q: 'a' } : v[i];
      const sol = ['В таблице пропорциональности нижнее число каждого столбца — это верхнее, умноженное на одно и то же число. Поэтому если в одной строке число выросло в несколько раз, то и в другой строке парное ему число выросло во столько же раз («linéarité»).'];
      if (u === 3) sol.push(['В первой строке $' + fx(v[1]) + '=' + fx(v[0]) + '×' + m + '$: число выросло в ' + ppgPl(m, 'раз', 'раза', 'раз') + '. Значит, и во второй строке:', 'a=' + fx(v[2]) + '*' + m + '=' + fx(v[3])]);
      if (u === 2) sol.push(['В первой строке $' + fx(v[1]) + '=' + fx(v[0]) + '×' + m + '$. Во второй строке так же: $' + fx(v[3]) + '=a×' + m + '$. Значит, $a$ в ' + ppgPl(m, 'раз', 'раза', 'раз') + ' меньше:', 'a=' + fx(v[3]) + '÷' + m + '=' + fx(v[2])]);
      if (u === 1) sol.push(['Во второй строке $' + fx(v[3]) + '=' + fx(v[2]) + '×' + m + '$: число выросло в ' + ppgPl(m, 'раз', 'раза', 'раз') + '. Значит, и в первой строке:', 'a=' + fx(v[0]) + '*' + m + '=' + fx(v[1])]);
      if (u === 0) sol.push(['Во второй строке $' + fx(v[3]) + '=' + fx(v[2]) + '×' + m + '$. В первой строке так же: $' + fx(v[1]) + '=a×' + m + '$. Значит:', 'a=' + fx(v[1]) + '÷' + m + '=' + fx(v[0])]);
      sol.push('Проверка через коэффициент: в полном столбце нижнее число равно верхнему, умноженному на $' + fx(k) + '$, и в столбце с $a$ так же: ' + (u < 2 ? '$' + fx(v[u + 2]) + '=' + fx(v[u]) + '×' + fx(k) + '$' : '$' + fx(v[u]) + '=' + fx(v[u - 2]) + '×' + fx(k) + '$') + ' ✓');
      return { q: L('Le tableau ci-dessous est un tableau de proportionnalité. Quelle est la valeur de $a$ ?', 'Это таблица пропорциональности. Чему равно $a$?'),
        fig: ppgTab([[cell(0), cell(1)], [cell(2), cell(3)]]), ans: N(fx(v[u])), sol };
    }
    if (vi === 1) {   /* a story: passage par l'unité */
      const C = r.pick([
        { fr: (a, x) => a + ' cahiers identiques coûtent ' + eur(x) + '.', ru: (a, x) => 'Тетради одинаковые: ' + ppgPl(a, 'тетрадь', 'тетради', 'тетрадей') + ' стоят ' + eur(x) + '.',
          qfr: b => 'Combien coûtent ' + b + ' de ces cahiers ?', qru: b => 'Сколько стоят ' + ppgPl(b, 'тетрадь', 'тетради', 'тетрадей') + '?',
          why: 'Все тетради одинаковые, поэтому цена пропорциональна числу тетрадей.', one: 'Цена одной тетради', u: [0.8, 1.2, 1.5, 2.5, 3.5, 0.9], ns: [2, 3, 4, 5, 6, 8, 10], money: true },
        { fr: (a, x) => a + ' kg de pommes coûtent ' + eur(x) + '.', ru: (a, x) => a + ' кг яблок стоят ' + eur(x) + '.',
          qfr: b => 'Combien coûtent ' + b + ' kg de ces pommes ?', qru: b => 'Сколько стоят ' + b + ' кг таких яблок?',
          why: 'Каждый килограмм стоит одинаково, поэтому цена пропорциональна массе.', one: 'Цена 1 кг', u: [1.5, 2.5, 3, 1.8, 2.2], ns: [2, 3, 4, 5, 6, 10], money: true },
        { fr: (a, x) => 'Pour ' + a + ' personnes, il faut ' + nf(x) + ' g de farine.', ru: (a, x) => 'На ' + ppgPl(a, 'человека', 'человека', 'человек') + ' нужно ' + nf(x) + ' г муки.',
          qfr: b => 'Quelle masse de farine faut-il pour ' + b + ' personnes ?', qru: b => 'Сколько граммов муки нужно на ' + ppgPl(b, 'человека', 'человека', 'человек') + '?',
          why: 'На каждого человека нужно одинаковое количество муки, поэтому масса муки пропорциональна числу человек.', one: 'Муки на одного человека', u: [50, 60, 75, 40, 125], ns: [2, 3, 4, 5, 6, 8, 10], unit: 'g' },
        { fr: (a, x) => 'Une imprimante imprime ' + nf(x) + ' pages en ' + a + ' minutes.', ru: (a, x) => 'Принтер печатает ' + ppgPl(x, 'страницу', 'страницы', 'страниц') + ' за ' + ppgPl(a, 'минуту', 'минуты', 'минут') + '.',
          qfr: b => 'Combien de pages imprime-t-elle en ' + b + ' minutes ?', qru: b => 'Сколько страниц он напечатает за ' + ppgPl(b, 'минуту', 'минуты', 'минут') + '?',
          why: 'Принтер печатает с постоянной скоростью, поэтому число страниц пропорционально времени.', one: 'Страниц за 1 минуту', u: [12, 15, 20, 8, 25], ns: [2, 3, 4, 5, 6, 10] },
        { fr: (a, x) => a + ' L d\'essence coûtent ' + eur(x) + '.', ru: (a, x) => a + ' л бензина стоят ' + eur(x) + '.',
          qfr: b => 'Combien coûtent ' + b + ' L d\'essence ?', qru: b => 'Сколько стоят ' + b + ' л бензина?',
          why: 'Каждый литр стоит одинаково, поэтому цена пропорциональна объёму.', one: 'Цена 1 л', u: [1.75, 1.8, 1.9, 1.85], ns: [4, 10, 20, 2, 5], money: true }]);
      const u = r.pick(C.u); const [a, b] = r.sh(C.ns).slice(0, 2);
      const x = +fx(a * u), y = +fx(b * u);
      const unitTxt = C.money ? '€' : C.unit || '';
      return { q: L(C.fr(a, x) + ' ' + C.qfr(b), C.ru(a, x) + ' ' + C.qru(b)), ans: C.money ? ppgEurAns(y) : N(fx(y), C.unit ? { unit: C.unit } : {}), sol: [
        C.why + ' Значит, удобно сначала найти значение для одной единицы («passage par l\'unité»), а потом умножить.',
        [C.one + ':', fx(x) + '÷' + a + '=' + fx(u), unitTxt],
        ['Нужно ' + b + ' таких единиц — умножаем на ' + b + ':', b + '*' + fx(u) + '=' + fx(y), unitTxt]] };
    }
    if (vi === 2) {   /* table with headings, two unknowns: × k and ÷ k */
      const C = r.pick([
        { a: 'Masse (kg)', b: 'Prix (€)', k: [1.5, 2.5, 3, 3.5, 4], fr: (x, y) => 'Au marché, ' + nf(x) + ' kg de tomates coûtent ' + eur(y) + ' ; le prix est proportionnel à la masse.', ru: (x, y) => 'На рынке ' + nf(x) + ' кг помидоров стоят ' + eur(y) + '; цена пропорциональна массе.' },
        { a: 'Nombre de tickets', b: 'Prix (€)', k: [1.5, 2, 2.5], fr: (x, y) => nf(x) + ' tickets de bus coûtent ' + eur(y) + ' ; le prix est proportionnel au nombre de tickets.', ru: (x, y) => ppgPl(x, 'билет', 'билета', 'билетов') + ' на автобус стоят ' + eur(y) + '; цена пропорциональна числу билетов.' },
        { a: 'Durée (h)', b: 'Distance (km)', k: [12, 15, 18, 20, 25], xs: [1, 2, 3, 4, 5, 6], fr: (x, y) => 'Un cycliste roule à vitesse constante : il parcourt ' + nf(y) + ' km en ' + nf(x) + ' h.', ru: (x, y) => 'Велосипедист едет с постоянной скоростью: за ' + nf(x) + ' ч он проезжает ' + nf(y) + ' км.' },
        { a: 'Volume (L)', b: 'Masse (kg)', k: [0.9], fr: (x, y) => nf(x) + ' L d\'huile ont une masse de ' + nf(y) + ' kg ; la masse est proportionnelle au volume.', ru: (x, y) => nf(x) + ' л растительного масла имеют массу ' + nf(y) + ' кг; масса пропорциональна объёму.' },
        { a: 'Volume (L)', b: 'Masse (kg)', k: [1.4], fr: (x, y) => nf(x) + ' L de miel ont une masse de ' + nf(y) + ' kg ; la masse est proportionnelle au volume.', ru: (x, y) => nf(x) + ' л мёда имеют массу ' + nf(y) + ' кг; масса пропорциональна объёму.' }]);
      const k = r.pick(C.k); const xs = r.sh(C.xs || [2, 3, 4, 5, 6, 8, 10, 12]).slice(0, 3).sort((p, q) => p - q);
      const ys = xs.map(x => +fx(x * k));
      const [i1, i2] = r.sh([1, 2]);                       /* column 0 is complete; i1 hides the top number (x), i2 the bottom one (y) */
      const top = [C.a].concat(xs.map((x, i) => i === i1 ? { q: 'x' } : x)), bot = [C.b].concat(ys.map((y, i) => i === i2 ? { q: 'y' } : y));
      return { q: L(C.fr(xs[0], ys[0]) + ' Compléter le tableau de proportionnalité ci-dessous : calculer $x$ et $y$.', C.ru(xs[0], ys[0]) + ' Дополни таблицу пропорциональности: найди $x$ и $y$.'), fig: ppgTab([top, bot], true),
        ans: multi(['$x$ =', N(fx(xs[i1]))], ['$y$ =', N(fx(ys[i2]))]), sol: [
          ['Полный первый столбец даёт коэффициент пропорциональности — число, на которое умножают верхнее число, чтобы получить нижнее:', fx(ys[0]) + '÷' + xs[0] + '=' + fx(k)],
          ['Нижнее число = верхнее × ' + nf(k) + ':', 'y=' + xs[i2] + '*' + fx(k) + '=' + fx(ys[i2])],
          ['Верхнее число = нижнее ÷ ' + nf(k) + ' (деление отменяет умножение):', 'x=' + fx(ys[i1]) + '÷' + fx(k) + '=' + fx(xs[i1])]] };
    }
    /* vi 3: which calculation gives a — the cross product */
    const k = r.pick([2, 3, 4, 5, 1.5, 2.5]), m = r.pick([2, 3, 4, 5, 6].filter(x => x !== k));
    const p = k % 1 ? r.pick([2, 4, 6, 8]) : r.pick([3, 4, 5, 6, 7, 8, 9]);
    const v = [p, p * m, p * k, p * k * m].map(t => fx(t)); const u = r.pick([3, 3, 0, 1, 2]);
    const o = 3 - u, [s1, s2] = [0, 1, 2, 3].filter(i => i !== u && i !== o);
    const cell = i => i === u ? { q: 'a' } : +v[i];
    const opts = [v[s1] + '*' + v[s2] + '÷' + v[o], v[o] + '*' + v[s1] + '÷' + v[s2], v[o] + '*' + v[s2] + '÷' + v[s1], v[s1] + '+' + v[s2] + '-' + v[o]].map(f => '$' + f + '$');
    return { q: L('Le tableau ci-dessous est un tableau de proportionnalité. Quel calcul donne la valeur de $a$ ?', 'Это таблица пропорциональности. Каким вычислением можно найти $a$?'),
      fig: ppgTab([[cell(0), cell(1)], [cell(2), cell(3)]]), ans: MQ(r, opts, 0), sol: [
        'В таблице пропорциональности отношение «нижнее число : верхнее» одинаково во всех столбцах. Равенство двух таких дробей можно умножить на оба знаменателя — получится равенство произведений «крест-накрест» («produits en croix»): произведения чисел на двух диагоналях равны.',
        ['Диагональ с $a$ и диагональ без него:', v[o] + '*a=' + v[s1] + '*' + v[s2]],
        ['Делим обе части на $' + v[o] + '$:', 'a=' + v[s1] + '*' + v[s2] + '÷' + v[o] + '=' + fx(+v[s1] * +v[s2] / +v[o])],
        'Два других «произведения с делением» перепутали, на что делить: делят на число, стоящее на одной диагонали с $a$. Вариант со сложением и вычитанием неверен: пропорциональность — это умножение на одно и то же число, а не прибавление.'] };
  } });

/* ---------- pp.reconnaitre ---------- */
/* a graph in a frame with axes; kind: 'lin0' (line through O), 'aff' (line not through O), 'dec' (decreasing line), 'cvx' / 'ccv' (curves through O) */
function ppgGraph(kind, r) {
  const ox = 50, oy = 190, W = 270, H = 175; let g = '';
  for (let i = 1; i <= 9; i++) g += ppgLn(ox + 30 * i, oy, ox + 30 * i, oy - H, 'fgrid');
  for (let j = 1; j <= 5; j++) g += ppgLn(ox, oy - 30 * j, ox + W, oy - 30 * j, 'fgrid');
  g += ppgLn(ox, oy, ox + W + 8, oy, 'fax') + ppgLn(ox, oy, ox, oy - H - 8, 'fax');
  g += ppgPath('M' + (ox + W + 2) + ' ' + (oy - 5) + ' L' + (ox + W + 8) + ' ' + oy + ' L' + (ox + W + 2) + ' ' + (oy + 5), 'fax') + ppgPath('M' + (ox - 5) + ' ' + (oy - H - 2) + ' L' + ox + ' ' + (oy - H - 8) + ' L' + (ox + 5) + ' ' + (oy - H - 2), 'fax');
  g += ppgTxt(ox - 10, oy + 16, 'O') + ppgTxt(ox + W + 4, oy + 20, 'x', 'middle', 'ftx', 16) + ppgTxt(ox - 16, oy - H + 2, 'y', 'middle', 'ftx', 16);
  const P = (x, y) => (ox + x).toFixed(1) + ' ' + (oy - y).toFixed(1);
  let d = '';
  if (kind === 'lin0') { const s = r.pick([0.5, 2 / 3, 1, 1.5]); const x1 = Math.min(W - 10, (H - 10) / s); d = 'M' + P(0, 0) + ' L' + P(x1, s * x1); }
  if (kind === 'aff') { const b = r.pick([30, 60]), s = r.pick([0.4, 0.5, 2 / 3]); const x1 = Math.min(W - 10, (H - 10 - b) / s); d = 'M' + P(0, b) + ' L' + P(x1, b + s * x1); }
  if (kind === 'dec') { const b = r.pick([150, 165]), s = r.pick([0.4, 0.5]); d = 'M' + P(0, b) + ' L' + P(240, b - s * 240); }
  if (kind === 'cvx' || kind === 'ccv') { const pts = []; for (let i = 0; i <= 24; i++) { const x = i * 10, t = x / 240; pts.push(P(x, 160 * (kind === 'cvx' ? t * t : Math.sqrt(t)))); } d = 'M' + pts.join(' L'); }
  return svgFig(340, 215, g + ppgPath(d, 'fcurve'), 'graphique');
}
topic({ id: 'pp.reconnaitre', ch: 'pp', lvl: 1, calc: false, variants: 3,
  ru: 'Пропорциональна ли зависимость?', fr: 'Reconnaître une situation de proportionnalité',
  hints: [
    'Величины пропорциональны, если одна всегда получается из другой умножением на одно и то же число $k$: $y=k×x$. Отсюда два признака: отношение $y/x$ всё время одно и то же, а при $x=0$ получается $y=0$.',
    'Таблица: раздели каждое число второй строки на число над ним. Все частные одинаковые — пропорционально; хотя бы одно другое — нет. «Обе строки растут» — не довод: растут и цены с платой за вход.',
    'График пропорциональной зависимости — прямая, которая проходит через начало координат O. Не прямая (кривая) или прямая мимо O — зависимость не пропорциональна.'],
  gen(r, vi) {
    if (vi === 0) {   /* a table: proportional or not */
      const C = r.pick([
        { a: 'Nombre de places', b: 'Prix (€)', k: [6, 8, 9, 12], c: [2, 3, 5] },
        { a: 'Masse (kg)', b: 'Prix (€)', k: [2, 3, 4], c: [1, 2] },
        { a: 'Durée (h)', b: 'Distance (km)', k: [15, 20, 50, 60], c: [10, 20, 30] },
        { a: 'Nombre de tickets', b: 'Prix (€)', k: [2, 3, 5], c: [1, 4] }]);
      const prop = r() < 0.5, k = r.pick(C.k), c = prop ? 0 : r.pick(C.c);
      const x1 = prop ? r.pick([1, 2, 3, 4, 5]) : r.pick([1, 2, 4, 5]);
      const xs = [x1].concat(r.distinct(2, x1 + 1, 10).sort((p, q) => p - q)), ys = xs.map(x => k * x + c);
      const kA = +fx(ys[0] / xs[0]);
      const qt = i => xs[i] === 1 ? String(ys[i]) : ys[i] + '/' + xs[i];      /* y/x, or just y when x = 1 */
      const qv = i => { const v = ys[i] / xs[i]; return Number.isInteger(Math.round(v * 1e6) / 1e4) ? qt(i) + (xs[i] === 1 ? '' : '=' + fx(v)) : qt(i) + '≈' + ppgRd(v, 2); };
      const opts = [
        L('Oui, car on passe de la 1re ligne à la 2e en multipliant toujours par ' + nf(kA) + '.', 'Да: вторая строка всегда получается из первой умножением на ' + nf(kA) + '.'),
        L('Non, car $' + qt(1) + '≠' + qt(0) + '$.', 'Нет, потому что $' + qt(1) + '≠' + qt(0) + '$.'),
        L('Oui, car les nombres des deux lignes augmentent.', 'Да, потому что числа в обеих строках растут.'),
        L('Non, car on n\'ajoute pas toujours le même nombre d\'une colonne à l\'autre.', 'Нет, потому что от столбца к столбцу прибавляют не одно и то же число.')];
      const sol = [['Делим каждое число второй строки на число над ним — получаем, на что умножали в каждом столбце:', xs.map((x, i) => qv(i)).join(';')]];
      if (prop) sol.push('Все частные равны ' + k + ': вторая строка — это первая, умноженная на ' + k + '. Таблица пропорциональна.');
      else sol.push('Первый столбец: $' + ys[0] + '/' + xs[0] + '=' + fx(kA) + '$. Будь таблица пропорциональной, во втором столбце стояло бы $' + xs[1] + '×' + fx(kA) + '=' + fx(xs[1] * kA) + '$, а там ' + ys[1] + '. Частные разные — таблица не пропорциональна. Здесь нижнее число = верхнее × ' + k + ' + ' + c + ': постоянная добавка ' + c + ' и ломает пропорциональность (0 превратился бы в ' + c + ', а не в 0).');
      sol.push('Доводы «обе строки растут» и «прибавляют не одно и то же» не годятся: пропорциональность — это умножение на одно и то же число, рост и прибавление тут ни при чём.');
      return { q: L('Ce tableau est-il un tableau de proportionnalité ? Choisir la réponse correctement justifiée.', 'Это таблица пропорциональности? Выбери ответ с верным обоснованием.'),
        fig: ppgTab([[C.a].concat(xs), [C.b].concat(ys)], true), ans: MQ(r, opts, prop ? 0 : 1), sol };
    }
    if (vi === 1) {   /* a graph */
      const kind = r.pick(['lin0', 'lin0', 'aff', 'dec', 'cvx', 'ccv']);
      const opts = [
        L('Oui, car c\'est une droite qui passe par l\'origine du repère.', 'Да: это прямая, проходящая через начало координат.'),
        L('Non, car c\'est une droite qui ne passe pas par l\'origine du repère.', 'Нет: это прямая, не проходящая через начало координат.'),
        L('Non, car ce n\'est pas une droite.', 'Нет: это не прямая.'),
        L('Oui, car quand $x$ augmente, $y$ augmente aussi.', 'Да: когда $x$ растёт, $y$ тоже растёт.')];
      const c = { lin0: 0, aff: 1, dec: 1, cvx: 2, ccv: 2 }[kind];
      const why = {
        lin0: 'График — прямая через начало координат O. У всех её точек отношение $y/x$ одинаковое (это наклон прямой), то есть $y=k×x$ — зависимость пропорциональна.',
        aff: 'График — прямая, но она пересекает ось $y$ выше точки O: при $x=0$ значение $y$ не равно 0. А при пропорциональности $y=k×x$, и при $x=0$ всегда $y=0$. Значит, не пропорционально (это аффинная функция).',
        dec: 'График — прямая, но она не проходит через O: при $x=0$ значение $y$ не равно 0. При пропорциональности $y=k×x$ даёт $y=0$ при $x=0$. Значит, не пропорционально.',
        cvx: 'График проходит через O, но это кривая, а не прямая: при увеличении $x$ в 2 раза $y$ увеличивается не в 2 раза. График пропорциональной зависимости $y=k×x$ — всегда прямая.',
        ccv: 'График проходит через O, но это кривая, а не прямая: при увеличении $x$ в 2 раза $y$ увеличивается не в 2 раза. График пропорциональной зависимости $y=k×x$ — всегда прямая.' }[kind];
      return { q: L('Le graphique ci-dessous représente une grandeur $y$ en fonction d\'une grandeur $x$. Est-ce une situation de proportionnalité ? Choisir la réponse correctement justifiée.', 'На графике показана зависимость величины $y$ от величины $x$. Это пропорциональная зависимость? Выбери ответ с верным обоснованием.'),
        fig: ppgGraph(kind, r), ans: MQ(r, opts, c), sol: [why,
          'Признак пропорциональности на графике — прямая И проходит через O; нужны оба условия сразу. Довод «$y$ растёт вместе с $x$» ничего не доказывает: растёт и прямая, не проходящая через O.'] };
    }
    /* vi 2: situations */
    const YES = [
      ['Le prix payé et la masse de pommes achetées, à 2,40 € le kilogramme.', 'Цена покупки и масса купленных яблок по 2,40 € за килограмм.', 'цена = 2,40 × масса: всегда умножаем на одно и то же число.'],
      ['Le périmètre d\'un carré et la longueur de son côté.', 'Периметр квадрата и длина его стороны.', 'периметр = 4 × сторона.'],
      ['La distance parcourue par un train qui roule à vitesse constante et la durée du trajet.', 'Расстояние, которое проходит поезд с постоянной скоростью, и время в пути.', 'расстояние = скорость × время, а скорость одна и та же.'],
      ['Le prix payé et le nombre de tickets de bus achetés, à 1,80 € le ticket.', 'Цена и число автобусных билетов по 1,80 € за билет.', 'цена = 1,80 × число билетов.'],
      ['La longueur d\'un cercle et son rayon.', 'Длина окружности и её радиус.', 'длина = $$2\\pi$$ × радиус, коэффициент $$2\\pi$$ один и тот же для всех окружностей.'],
      ['La masse de farine et le nombre de crêpes, en suivant toujours la même recette.', 'Масса муки и число блинов, если всегда печь по одному рецепту.', 'на каждый блин уходит одна и та же масса муки.']];
    const NO = [
      ['L\'aire d\'un carré et la longueur de son côté.', 'Площадь квадрата и длина его стороны.', 'сторона 1 → площадь 1, сторона 2 → площадь 4: сторона выросла в 2 раза, а площадь — в 4.'],
      ['La taille d\'un enfant et son âge.', 'Рост ребёнка и его возраст.', 'в 10 лет ребёнок не в 10 раз выше, чем в 1 год: постоянного коэффициента нет.'],
      ['Le prix d\'une course en taxi et la distance parcourue, avec 4 € de prise en charge puis 1,50 € par kilomètre.', 'Цена поездки на такси и расстояние: 4 € за посадку плюс 1,50 € за километр.', 'за 2 км платят 7 €, а за 4 км — 10 €, не вдвое больше: мешает постоянная плата 4 €.'],
      ['La température extérieure et l\'heure de la journée.', 'Температура на улице и время суток.', 'температура меняется без всякого постоянного коэффициента.'],
      ['Le prix payé et le nombre de places de cinéma, avec un abonnement de 20 € par mois puis 5 € par place.', 'Цена и число билетов в кино при абонементе 20 € в месяц плюс 5 € за билет.', '0 билетов стоят 20 €, а не 0: постоянная часть ломает пропорциональность.'],
      ['Le prix payé et le nombre de cahiers achetés, avec l\'offre «' + ppgSp + '3 cahiers achetés, le 4e offert' + ppgSp + '».', 'Цена и число купленных тетрадей по акции «купи 3 — четвёртая в подарок».', '3 и 4 тетради стоят одинаково.'],
      ['Le volume d\'un cube et la longueur de son arête.', 'Объём куба и длина его ребра.', 'ребро выросло в 2 раза — объём вырос в 8 раз.']];
    const neg = r() < 0.35;
    const right = r.pick(neg ? NO : YES), others = r.sh(neg ? YES : NO).slice(0, 3);
    const opts = [right].concat(others).map(s => L(s[0], s[1]));
    return { q: neg ? L('Parmi les situations suivantes, laquelle n\'est pas une situation de proportionnalité ?', 'Какая из этих ситуаций НЕ является пропорциональной зависимостью?')
      : L('Parmi les situations suivantes, laquelle est une situation de proportionnalité ?', 'Какая из этих ситуаций — пропорциональная зависимость?'), ans: MQ(r, opts, 0), sol: [
        'Проверяем каждую ситуацию: получается ли одна величина из другой умножением на одно и то же число (и даёт ли 0 → 0).',
        'Ответ: «' + right[1] + '» — ' + right[2],
        'Остальные: ' + others.map(s => '«' + s[1] + '» — ' + s[2]).join(' ')] };
  } });

/* ---------- pp.pourcent-appliquer ---------- */
/* a mental way to take t % of n: [text, formula] */
function ppgPcWay(t, n) {
  const p = x => fx(x), res = p(t * n / 100);
  const ten = t / 10;
  if (t === 50) return ['50 % — это половина:', n + '÷2=' + res];
  if (t === 25) return ['25 % — это четверть, половина от половины:', n + '÷4=' + res];
  if (t === 75) return ['75 % = 50 % + 25 % — половина и ещё четверть:', p(n / 2) + '+' + p(n / 4) + '=' + res];
  if (t === 10) return ['10 % — это десятая часть:', n + '÷10=' + res];
  if (t === 1) return ['1 % — это сотая часть:', n + '÷100=' + res];
  if (t === 5) return ['5 % — половина от 10 %: 10 % — это $' + p(n / 10) + '$, значит:', p(n / 10) + '÷2=' + res];
  if (t === 15) return ['15 % = 10 % + 5 %:', p(n / 10) + '+' + p(n / 20) + '=' + res];
  if (t === 35) return ['35 % = 25 % + 10 %:', p(n / 4) + '+' + p(n / 10) + '=' + res];
  if (t === 2 || t === 3) return [t + ' % = ' + t + ' × 1 %, а 1 % — это $' + p(n / 100) + '$:', t + '*' + p(n / 100) + '=' + res];
  if (t === 12) return ['12 % = 10 % + 2 %:', p(n / 10) + '+' + p(n / 50) + '=' + res];
  if (Number.isInteger(ten)) return [t + ' % = ' + ten + ' × 10 %, а 10 % — это $' + p(n / 10) + '$:', ten + '*' + p(n / 10) + '=' + res];
  return [t + ' % — это $' + t + '/100$:', t + '/100*' + n + '=' + res];
}
topic({ id: 'pp.pourcent-appliquer', ch: 'pp', lvl: 1, calc: false, variants: 4,
  ru: 'Процент от количества', fr: 'Appliquer un pourcentage',
  hints: [
    '«Pourcent» — «на сотню»: 25 % значит 25 из каждых 100, то есть $25/100$ всего количества.',
    'Поэтому $t$ % от числа $N$ — это $t/100×N$. Удобные опоры для счёта в уме: 50 % — половина, 25 % — четверть, 10 % — десятая часть, 1 % — сотая часть.',
    'Остальные проценты собирай из опор: 30 % = 3 × 10 %, 5 % — половина от 10 %, 15 % = 10 % + 5 %, 75 % = 50 % + 25 %. Если спрашивают про «остальных», вычти найденное из всего количества.'],
  gen(r, vi) {
    if (vi === 0) {
      let t, n, g = 0;
      do { t = r.pick([10, 20, 25, 50, 75, 5, 30, 40, 15, 60, 1, 2, 12, 35, 80, 90]); n = r.pick([20, 40, 60, 80, 120, 200, 300, 400, 500, 600, 800, 1000, 150, 250, 50, 240, 360, 1200, 30, 70, 90]); } while (t * n % 100 && g++ < 50);
      if (t * n % 100) { t = 25; n = 300; }
      const res = t * n / 100;
      return { q: r() < 0.5 ? L('Calculer ' + ppgPc(t) + ' de ' + nf(n) + '.', 'Вычисли ' + ppgPc(t) + ' от ' + nf(n) + '.') : L('Combien font ' + ppgPc(t) + ' de ' + nf(n) + ' ?', 'Сколько составляют ' + ppgPc(t) + ' от ' + nf(n) + '?'), ans: N(res), sol: [
        ['«' + t + ' %» — это ' + t + ' сотых, то есть $' + t + '/100$ от числа. «От» означает умножение:', t + '/100*' + n + '=' + res],
        ppgPcWay(t, n)] };
    }
    if (vi === 1) {   /* sujet zéro 2026, Q8 */
      const C = r.pick([
        { tot: [200, 300, 400, 500, 600, 800], t: [10, 20, 25, 30, 40, 75], fr: (n, t) => 'Parmi les ' + n + ' élèves d\'un collège, ' + ppgPc(t) + ' se sont inscrits à un concours de calcul mental.', ru: (n, t) => 'Из ' + n + ' учеников коллежа ' + ppgPc(t) + ' записались на конкурс устного счёта.',
          yes: ['Combien d\'élèves se sont inscrits ?', 'Сколько учеников записались?'], no: ['Combien d\'élèves ne se sont pas inscrits ?', 'Сколько учеников не записались?'], wy: 'записавшихся', wn: 'тех, кто не записался' },
        { tot: [20, 25, 30, 40, 50], t: [40, 60, 30, 50, 70], fr: (n, t) => 'Dans une classe de ' + n + ' élèves, ' + ppgPc(t) + ' sont des garçons.', ru: (n, t) => 'В классе ' + n + ' учеников, ' + ppgPc(t) + ' из них — мальчики.',
          yes: ['Combien y a-t-il de garçons dans cette classe ?', 'Сколько в классе мальчиков?'], no: ['Combien y a-t-il de filles dans cette classe ?', 'Сколько в классе девочек?'], wy: 'мальчиков', wn: 'девочек' },
        { tot: [200, 300, 400, 500, 120, 80], t: [15, 25, 10, 20, 35, 5], fr: (n, t) => 'Un sachet de ' + n + ' bonbons contient ' + ppgPc(t) + ' de bonbons au citron.', ru: (n, t) => 'В пакете ' + n + ' конфет, ' + ppgPc(t) + ' из них — лимонные.',
          yes: ['Combien y a-t-il de bonbons au citron ?', 'Сколько в пакете лимонных конфет?'], no: ['Combien de bonbons ne sont pas au citron ?', 'Сколько конфет не лимонные?'], wy: 'лимонных конфет', wn: 'остальных конфет' },
        { tot: [400, 500, 200, 1000, 800], t: [35, 45, 60, 55, 70, 65], fr: (n, t) => 'On a interrogé ' + nf(n) + ' personnes : ' + ppgPc(t) + ' d\'entre elles ont répondu «' + ppgSp + 'oui' + ppgSp + '».', ru: (n, t) => 'Опросили ' + nf(n) + ' человек: ' + ppgPc(t) + ' из них ответили «да».',
          yes: ['Combien de personnes ont répondu «' + ppgSp + 'oui' + ppgSp + '» ?', 'Сколько человек ответили «да»?'], no: ['Combien de personnes n\'ont pas répondu «' + ppgSp + 'oui' + ppgSp + '» ?', 'Сколько человек ответили не «да»?'], wy: 'ответивших «да»', wn: 'остальных' },
        { tot: [800, 600, 1200, 400, 2000], t: [75, 80, 90, 60, 85], fr: (n, t) => 'Une salle de concert de ' + nf(n) + ' places est remplie à ' + ppgPc(t) + '.', ru: (n, t) => 'Концертный зал на ' + nf(n) + ' мест заполнен на ' + ppgPc(t) + '.',
          yes: ['Combien de places sont occupées ?', 'Сколько мест занято?'], no: ['Combien de places sont libres ?', 'Сколько мест свободно?'], wy: 'занятых мест', wn: 'свободных мест' }]);
      let n, t, g = 0; do { n = r.pick(C.tot); t = r.pick(C.t); } while (n * t % 100 && g++ < 50);
      const part = n * t / 100, rest = n - part, no = r() < 0.6;
      const sol = [['Сначала находим ' + t + ' % от ' + nf(n) + ' — это число ' + C.wy + ':', t + '/100*' + n + '=' + part]];
      if (no) {
        sol.push(['Но спрашивают про ' + C.wn + ' — это все остальные:', n + '-' + part + '=' + rest]);
        sol.push('Можно и сразу: остальные составляют $100-' + t + '=' + (100 - t) + '$ %, и $' + (100 - t) + '/100×' + n + '=' + rest + '$. Частая ошибка — ответить ' + nf(part) + ': это число ' + C.wy + ', а вопрос про ' + C.wn + '.');
      } else sol.push(ppgPcWay(t, n));
      return { q: L(C.fr(n, t) + ' ' + (no ? C.no : C.yes)[0], C.ru(n, t) + ' ' + (no ? C.no : C.yes)[1]), ans: N(no ? rest : part), sol };
    }
    if (vi === 2) {   /* which calculation */
      const t = r.pick([15, 20, 35, 5, 12, 8, 30, 45, 3, 25]), n = r.pick([80, 60, 120, 240, 50, 90, 70, 140]);
      const opts = ['$' + fx(t / 100) + '*' + n + '$', '$' + t + '*' + n + '$', '$' + n + '÷' + t + '$', '$' + n + '-' + t + '$'];
      return { q: L('Parmi les calculs suivants, lequel permet d\'obtenir ' + ppgPc(t) + ' de ' + n + ' ?', 'Какое из вычислений даёт ' + ppgPc(t) + ' от ' + n + '?'), ans: MQ(r, opts, 0), sol: [
        ['«' + t + ' %» — это $' + t + '/100=' + fx(t / 100) + '$, а «процент от числа» — это умножение на эту долю:', fx(t / 100) + '*' + n + '=' + fx(t * n / 100)],
        'Ошибки в других вариантах: $' + t + '×' + n + '$ — забыли разделить на 100, ответ получится в 100 раз больше; $' + n + '÷' + t + '$ и $' + n + '-' + t + '$ — проценты так не считают: процент — это доля целого, а не число, которое делят или вычитают.'] };
    }
    /* vi 3: fraction ↔ percentage */
    const [a, b, t] = r.pick([[1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 5, 20], [2, 5, 40], [3, 5, 60], [4, 5, 80], [1, 10, 10], [3, 10, 30], [7, 10, 70], [9, 10, 90], [1, 20, 5], [3, 20, 15], [1, 50, 2], [1, 25, 4]]);
    if (r() < 0.5) return { q: L('Compléter : prendre les $' + a + '/' + b + '$ d\'une quantité, c\'est en prendre … %.', 'Дополни: взять $' + a + '/' + b + '$ количества — значит взять … %.'), ans: N(t, { unit: '%' }), sol: [
      'Процент — это доля со знаменателем 100: «сотые» части. Значит, дробь нужно записать со знаменателем 100.',
      ['Умножаем числитель и знаменатель на ' + (100 / b) + ' — значение дроби не меняется:', a + '/' + b + '=' + t + '/100'],
      '$' + t + '/100$ — это ' + t + ' %.'] };
    const f = F(t, 100);
    return { q: L('Prendre ' + ppgPc(t) + ' d\'une quantité revient à en prendre quelle fraction ? Donner une fraction irréductible.', 'Взять ' + ppgPc(t) + ' количества — значит взять какую часть? Запиши несократимой дробью.'), ans: FRA(f), sol: [
      [t + ' % — это ' + t + ' сотых:', t + '/100'],
      ['Сокращаем: числитель и знаменатель делятся на ' + (t / f.n) + '.', t + '/100=' + Fr.str(f)]] };
  } });

/* ---------- pp.pourcent-evol ---------- */
topic({ id: 'pp.pourcent-evol', ch: 'pp', lvl: 2, calc: false, variants: 4,
  ru: 'Повышение и снижение на x %', fr: 'Augmentation et réduction en pourcentage',
  hints: [
    'Сначала найди само изменение: $t$ % от СТАРОЙ цены. Потом прибавь его («augmentation», «hausse») или вычти («baisse», «réduction», «remise»).',
    'Быстрее одним умножением: после повышения на 20 % цена составляет 100 % + 20 % = 120 % старой, то есть её умножают на $1.2$; после снижения на 15 % остаётся 85 %, то есть умножают на $0.85$.',
    'Коэффициент: при повышении на $t$ % — $1+t/100$, при снижении — $1-t/100$. Проверка здравым смыслом: после повышения цена должна стать больше, после снижения — меньше.'],
  gen(r, vi) {
    if (vi === 0) {
      const up = r() < 0.5; let X, t, g = 0;
      do { X = r.pick([15, 20, 25, 30, 40, 45, 50, 60, 80, 120, 150, 200, 250, 300, 800]); t = r.pick([10, 20, 25, 5, 50, 30, 15, 40]); } while ((X * t) % 50 && g++ < 50);
      if ((X * t) % 50) { X = 15; t = 20; }
      const d = X * t / 100, res = up ? X + d : X - d, c = 1 + (up ? t : -t) / 100;
      const T = up ? r.pick([
        ['Le prix d\'un casque audio est de ' + eur(X) + '. Ce prix augmente de ' + ppgPc(t) + '. Quel est le nouveau prix du casque ?', 'Наушники стоят ' + eur(X) + '. Их цена повышается на ' + ppgPc(t) + '. Какой станет цена наушников?'],
        ['Le prix d\'un abonnement est de ' + eur(X) + ' par mois. Il augmente de ' + ppgPc(t) + '. Quel est le nouveau prix ?', 'Абонемент стоит ' + eur(X) + ' в месяц. Его цена выросла на ' + ppgPc(t) + '. Какова новая цена?'],
        ['Un vélo coûtait ' + eur(X) + '. Son prix a subi une hausse de ' + ppgPc(t) + '. Calculer son nouveau prix.', 'Велосипед стоил ' + eur(X) + '. Его цена выросла на ' + ppgPc(t) + '. Вычисли новую цену.']])
        : r.pick([
        ['Le prix d\'une trottinette affichée à ' + eur(X) + ' baisse de ' + ppgPc(t) + '. Calculer, en euro, son nouveau prix.', 'Самокат стоил ' + eur(X) + ', его цена снизилась на ' + ppgPc(t) + '. Вычисли новую цену в евро.'],
        ['Un magasin accorde une réduction de ' + ppgPc(t) + ' sur un jeu vendu ' + eur(X) + '. Combien paie-t-on ce jeu après la réduction ?', 'Магазин даёт скидку ' + ppgPc(t) + ' на игру, которая стоит ' + eur(X) + '. Сколько стоит игра со скидкой?'],
        ['Pendant les soldes, un manteau à ' + eur(X) + ' bénéficie d\'une remise de ' + ppgPc(t) + '. Quel est son prix soldé ?', 'На распродаже на пальто за ' + eur(X) + ' дают скидку ' + ppgPc(t) + '. Сколько оно стоит со скидкой?']]);
      return { q: L(T[0], T[1]), ans: ppgEurAns(res), sol: [
        ['Само изменение — это ' + t + ' % от старой цены:', t + '/100*' + X + '=' + fx(d), '€'],
        up ? ['Повышение — цена растёт, прибавляем:', X + '+' + fx(d) + '=' + fx(res), '€'] : ['Снижение — цена уменьшается, вычитаем:', X + '-' + fx(d) + '=' + fx(res), '€'],
        'Проверка одним умножением: ' + (up ? 'после повышения на ' + t + ' % цена составляет ' + (100 + t) : 'после снижения на ' + t + ' % остаётся ' + (100 - t)) + ' % старой, то есть её умножают на $' + fx(c) + '$: $' + X + '×' + fx(c) + '=' + fx(res) + '$.'] };
    }
    if (vi === 1) {   /* the multiplier */
      const up = r() < 0.5, t = up ? r.pick([5, 10, 20, 25, 30, 40, 50, 15, 3, 8]) : r.pick([5, 10, 15, 20, 25, 30, 40, 60, 3, 8]);
      const c = 1 + (up ? t : -t) / 100;
      const opts = (up ? [c, t / 100, t >= 10 ? 1 + t / 1000 : 1 + t / 10, 100 + t] : [c, t / 100, 1 + t / 100, 100 - t]).map(v => nf(+fx(v)));
      return { q: up ? L('Augmenter un prix de ' + ppgPc(t) + ' revient à le multiplier par :', 'Повысить цену на ' + ppgPc(t) + ' — то же самое, что умножить её на:')
        : L('Diminuer un prix de ' + ppgPc(t) + ' revient à le multiplier par :', 'Снизить цену на ' + ppgPc(t) + ' — то же самое, что умножить её на:'), ans: MQ(r, opts, 0), sol: [
        up ? 'Новая цена = старая + ' + t + ' % старой = (100 % + ' + t + ' %) старой = ' + (100 + t) + ' % старой.' : 'Новая цена = старая − ' + t + ' % старой = (100 % − ' + t + ' %) старой = ' + (100 - t) + ' % старой.',
        [(up ? 100 + t : 100 - t) + ' % — это:', (up ? 100 + t : 100 - t) + '/100=' + fx(c)],
        'Умножить на $' + fx(t / 100) + '$ — значит найти только само изменение (' + t + ' % цены), а не новую цену. ' + (up ? 'А $' + fx(t >= 10 ? 1 + t / 1000 : 1 + t / 10) + '$ — это повышение на ' + (t >= 10 ? nf(t / 10) : t * 10) + ' %, а не на ' + t + ' %.' : 'А $' + fx(1 + t / 100) + '$ — это повышение на ' + t + ' %, а не снижение.')] };
    }
    if (vi === 2) {   /* Centres étrangers 2026, Q8: which calculation */
      const up = r() < 0.35, X = r.pick([80, 60, 120, 45, 30, 200, 50, 70, 90, 150]), t = r.pick([10, 20, 30, 15, 25, 5, 40]);
      const sg = up ? '+' : '-';
      const opts = [X + sg + t, X + sg + t + '/100', X + sg + t + '/100*' + X, '(' + X + sg + t + '/100)*' + X].map(f => '$' + f + '$');
      const res = X * (100 + (up ? t : -t)) / 100;
      return { q: L('Le prix d\'un article de ' + eur(X) + (up ? ' augmente' : ' baisse') + ' de ' + ppgPc(t) + '. Parmi les calculs suivants, lequel donne le nouveau prix ?', 'Цена товара за ' + eur(X) + (up ? ' повышается' : ' снижается') + ' на ' + ppgPc(t) + '. Какое из вычислений даёт новую цену?'), ans: MQ(r, opts, 2), sol: [
        [(up ? 'Повышение' : 'Снижение') + ' на ' + t + ' % — это ' + t + ' % от цены, то есть $' + t + '/100×' + X + '$ евро. Его ' + (up ? 'прибавляем к цене' : 'вычитаем из цены') + ':', X + sg + t + '/100*' + X + '=' + fx(res), '€'],
        'Ошибки: «$' + X + sg + t + '$» ' + (up ? 'прибавляет' : 'вычитает') + ' ' + t + ' евро, а не ' + t + ' %; «$' + X + sg + t + '/100$» — всего $' + fx(t / 100) + '$ евро; в последнем варианте скобка стоит не там: ' + (up ? 'к ' + X + ' сначала прибавили' : 'из ' + X + ' сначала вычли') + ' $' + fx(t / 100) + '$, а потом умножили на ' + X + ', — получилось огромное число.'] };
    }
    /* vi 3: from the multiplier to the percentage */
    const up = r() < 0.5, c = up ? r.pick([1.35, 1.2, 1.05, 1.5, 1.12, 1.08, 1.25, 1.6, 1.03]) : r.pick([0.92, 0.85, 0.7, 0.6, 0.95, 0.75, 0.8, 0.98, 0.65]);
    const t = Math.round(Math.abs(c - 1) * 100), C100 = Math.round(c * 100);
    const ev = (u, v) => u ? L('une hausse de ' + ppgPc(v), 'повышение на ' + ppgPc(v)) : L('une baisse de ' + ppgPc(v), 'снижение на ' + ppgPc(v));
    const opts = up ? [ev(true, t), ev(true, C100), ev(false, t), ev(true, c)] : [ev(false, t), ev(false, C100), ev(true, t), ev(false, +fx(t / 100))];
    return { q: L('Le prix d\'un article est multiplié par ' + nf(c) + '. Cela correspond à :', 'Цену товара умножили на ' + nf(c) + '. Это означает:'), ans: MQ(r, opts, 0), sol: [
      ['Умножить на ' + nf(c) + ' — значит взять ' + C100 + ' % старой цены:', fx(c) + '=' + C100 + '/100'],
      up ? 'Это больше 100 % на ' + t + ' %: цена выросла на ' + t + ' %.' : 'Это меньше 100 % на ' + t + ' %: цена уменьшилась на ' + t + ' %.',
      'Ошибка «на ' + C100 + ' %»: ' + C100 + ' % — это вся новая цена, а изменение — только разница с 100 %. ' + (up ? 'Коэффициент больше 1 — всегда повышение.' : 'Коэффициент меньше 1 — всегда снижение.')] };
  } });

/* «a augmenté de 21 %» / «вырос на 21 %» */
const ppgEvTxt = g => g === 0 ? L('n\'a pas changé', 'не изменилась') : g > 0 ? L('a augmenté de ' + ppgPc(g), 'выросла на ' + ppgPc(g)) : L('a baissé de ' + ppgPc(-g), 'снизилась на ' + ppgPc(-g));
/* «augmente de 10 %» · «puis baisse de 20 %» · «puis à nouveau de 10 %» (same direction twice) */
const ppgVerb = (t, prev) => prev != null && prev * t > 0 ? L('puis à nouveau de ' + ppgPc(Math.abs(t)), 'потом ещё на ' + ppgPc(Math.abs(t))) : t > 0 ? L((prev != null ? 'puis ' : '') + 'augmente de ' + ppgPc(t), (prev != null ? 'потом ' : '') + 'растёт на ' + ppgPc(t)) : L((prev != null ? 'puis ' : '') + 'baisse de ' + ppgPc(-t), (prev != null ? 'потом ' : '') + 'снижается на ' + ppgPc(-t));

/* ---------- pp.pourcent-taux ---------- */
/* p out of T as a percentage, explained: [steps] */
function ppgRateSteps(p, T, pc) {
  if (100 % T === 0) return [['Доля: ' + p + ' из ' + T + ', то есть $' + p + '/' + T + '$. Проценты — это сотые, поэтому приводим дробь к знаменателю 100: умножаем числитель и знаменатель на ' + (100 / T) + '.', p + '/' + T + '=' + pc + '/100'], 'А $' + pc + '/100$ — это ' + pc + ' %.'];
  if (T % 100 === 0) return [['Доля: ' + p + ' из ' + T + ', то есть $' + p + '/' + T + '$. Проценты — это сотые, поэтому приводим дробь к знаменателю 100: делим числитель и знаменатель на ' + (T / 100) + '.', p + '/' + T + '=' + pc + '/100'], 'А $' + pc + '/100$ — это ' + pc + ' %.'];
  return [['Доля: ' + p + ' из ' + T + ', то есть $' + p + '/' + T + '$. Чтобы выразить её в процентах (в сотых), умножаем на 100:', p + '/' + T + '*100=' + pc], 'Это ' + pc + ' %.'];
}
topic({ id: 'pp.pourcent-taux', ch: 'pp', lvl: 2, calc: false, variants: 3,
  ru: 'Какой это процент?', fr: 'Calculer un pourcentage',
  hints: [
    'Процент — это доля, записанная в сотых. Сначала составь дробь «часть / целое», потом запиши её со знаменателем 100: $6/25=24/100$, то есть 24 %.',
    'Если знаменатель «неудобный», умножь дробь на 100: часть ÷ целое × 100. Проверка: часть меньше целого — процент меньше 100.',
    'Процент изменения: (новое − старое) ÷ старое × 100. Делят всегда на СТАРОЕ значение — именно от него считают, на сколько выросло или уменьшилось.'],
  gen(r, vi) {
    if (vi === 0) {   /* part / whole */
      const nm = r.pick(PRENOMS_F);
      const C = r.pick([
        { T: [20, 25, 50], pc: [8, 48], fr: (T, p) => 'Dans une classe de ' + T + ' élèves, ' + p + ' portent des lunettes. Quel pourcentage des élèves de cette classe portent des lunettes ?', ru: (T, p) => 'В классе ' + T + ' учеников, ' + p + ' из них носят очки. Какой процент учеников класса носит очки?' },
        { T: [20, 25, 50, 10], pc: [40, 90], fr: (T, p) => 'Lors d\'un match, ' + nm + ' a tenté ' + T + ' lancers francs et en a réussi ' + p + '. Quel pourcentage de ses lancers a-t-elle réussis ?', ru: (T, p) => 'В матче ' + nm + ' выполнила ' + T + ' штрафных бросков и попала ' + ppgPl(p, 'раз', 'раза', 'раз') + '. Какой процент бросков был точным?' },
        { T: [20, 25, 50], pc: [40, 96], fr: (T, p) => 'Un quiz comporte ' + T + ' questions. ' + nm + ' a répondu correctement à ' + p + ' questions. Quel est son pourcentage de bonnes réponses ?', ru: (T, p) => 'В викторине ' + T + ' вопросов. ' + nm + ' правильно ответила на ' + p + '. Какой у неё процент правильных ответов?' },
        { T: [200, 300, 400, 500, 800], pc: [12, 35], fr: (T, p) => 'Un village compte ' + T + ' habitants, dont ' + p + ' ont moins de 18 ans. Quel pourcentage des habitants a moins de 18 ans ?', ru: (T, p) => 'В деревне ' + T + ' жителей, из них ' + p + ' младше 18 лет. Какой процент жителей младше 18 лет?' },
        { T: [20, 25, 50], pc: [8, 60], fr: (T, p) => 'Une boîte contient ' + T + ' crayons, dont ' + p + ' sont rouges. Quel pourcentage des crayons de la boîte sont rouges ?', ru: (T, p) => 'В коробке ' + T + ' карандашей, ' + p + ' из них красные. Какой процент карандашей в коробке красные?' }]);
      const T = r.pick(C.T); let pc, g = 0;
      do pc = r.ri(1, 19) * 5 - (T === 25 || T === 50 || T >= 200 ? r.pick([0, 1, 2, 3, 4]) : 0); while ((T * pc % 100 || pc < C.pc[0] || pc > C.pc[1]) && g++ < 200);
      if (T * pc % 100 || pc < C.pc[0] || pc > C.pc[1]) pc = 40;
      const p = T * pc / 100;
      return { q: L(C.fr(T, p), C.ru(T, p)), ans: N(pc, { unit: '%' }), sol: ppgRateSteps(p, T, pc) };
    }
    if (vi === 1) {   /* percentage of change (Métropole 2026, ex. 1) */
      let old, pc, g = 0; const up = r() < 0.6;
      const C = r.pick([
        { o: [20, 25, 40, 50, 80], fr: (a, b) => 'Le prix d\'un billet de concert passe de ' + eur(a) + ' à ' + eur(b) + '. De quel pourcentage ce prix a-t-il ' + (up ? 'augmenté' : 'baissé') + ' ?', ru: (a, b) => 'Билет на концерт стоил ' + eur(a) + ', а теперь стоит ' + eur(b) + '. На сколько процентов цена ' + (up ? 'выросла' : 'снизилась') + '?' },
        { o: [20, 25, 40, 50], fr: (a, b) => 'Une équipe avait gagné ' + a + ' médailles à une compétition ; l\'année suivante, elle en a gagné ' + b + '. Quel est le pourcentage ' + (up ? 'd\'augmentation' : 'de baisse') + ' du nombre de médailles ?', ru: (a, b) => 'На соревнованиях команда завоевала ' + ppgPl(a, 'медаль', 'медали', 'медалей') + ', а через год — ' + b + '. На сколько процентов ' + (up ? 'выросло' : 'уменьшилось') + ' число медалей?' },
        { o: [200, 250, 400, 500, 800], fr: (a, b) => 'Le nombre d\'abonnés d\'une chaîne passe de ' + a + ' à ' + b + '. De quel pourcentage a-t-il ' + (up ? 'augmenté' : 'baissé') + ' ?', ru: (a, b) => 'Число подписчиков канала изменилось с ' + a + ' до ' + b + '. На сколько процентов оно ' + (up ? 'выросло' : 'уменьшилось') + '?' }]);
      do { old = r.pick(C.o); pc = r.pick([10, 20, 25, 30, 40, 50, 5, 15, 60, 75]); } while ((old * pc % 100 || (!up && pc >= 100)) && g++ < 60);
      if (old * pc % 100) { old = 20; pc = 30; }
      const diff = old * pc / 100, nw = up ? old + diff : old - diff;
      return { q: L(C.fr(old, nw), C.ru(old, nw)), ans: N(pc, { unit: '%' }), sol: [
        ['Само изменение:', (up ? nw + '-' + old : old + '-' + nw) + '=' + diff],
        ['Процент изменения считают от СТАРОГО значения — того, что было до изменения:', diff + '/' + old + '=' + fx(pc / 100) + '=' + pc + '/100'],
        'Значит, ' + (up ? 'рост' : 'снижение') + ' на ' + pc + ' %. Ловушка: делить на новое значение ' + nf(nw) + ' неверно — «на сколько процентов изменилось» всегда сравнивают с тем, что было.'] };
    }
    /* vi 2: «plus de 20 %» — true or false (Métropole 2026, ex. 1) */
    const C = r.pick([
      { T: [60, 80, 120, 124, 140, 160, 200], s: [20, 25, 30, 40], cnt: p => 'Бронзовых медалей ' + p, fr: (T, p, w) => 'Un pays a obtenu ' + T + ' médailles, dont ' + p + ' en bronze. Affirmation : «' + ppgSp + w + ' de ses médailles sont en bronze.' + ppgSp + '»', ru: (T, p, w) => 'Страна завоевала ' + ppgPl(T, 'медаль', 'медали', 'медалей') + ', из них ' + ppgPl(p, 'бронзовая', 'бронзовые', 'бронзовых') + '. Утверждение: «' + w + ' её медалей — бронзовые».' },
      { T: [200, 300, 400, 500, 600, 250, 150, 120], s: [50, 60, 70, 75, 80], cnt: p => 'Обедающих в столовой — ' + p, fr: (T, p, w) => 'Dans un collège de ' + T + ' élèves, ' + p + ' mangent à la cantine. Affirmation : «' + ppgSp + w + ' des élèves mangent à la cantine.' + ppgSp + '»', ru: (T, p, w) => 'В коллеже ' + T + ' учеников, из них ' + p + ' обедают в столовой. Утверждение: «' + w + ' учеников обедают в столовой».' },
      { T: [40, 60, 80, 120, 200, 300], s: [20, 25, 30, 40, 50, 60], cnt: p => 'Ответивших «да» — ' + p, fr: (T, p, w) => 'Sur ' + T + ' personnes interrogées, ' + p + ' ont répondu «' + ppgSp + 'oui' + ppgSp + '». Affirmation : «' + ppgSp + w + ' des personnes interrogées ont répondu oui.' + ppgSp + '»', ru: (T, p, w) => 'Из ' + T + ' опрошенных ' + p + ' ответили «да». Утверждение: «' + w + ' опрошенных ответили да».' }]);
    let T, s, d, g = 0;
    do { T = r.pick(C.T); s = r.pick(C.s); } while (T * s % 100 && g++ < 60);
    if (T * s % 100) { T = 200; s = 20; }
    const X = T * s / 100; do d = r.ri(-4, 4); while (d === 0 || X + d <= 0 || X + d >= T);
    const p = X + d, more = r() < 0.6, truth = more ? p > X : p < X;
    const wF = (more ? 'Plus de ' : 'Moins de ') + ppgPc(s), wR = (more ? 'Больше ' : 'Меньше ') + ppgPc(s);
    return { q: L(C.fr(T, p, wF) + ' Cette affirmation est-elle vraie ?', C.ru(T, p, wR) + ' Это утверждение верно?'), ans: TF(truth), sol: [
      ['Находим, сколько составляют ' + s + ' % от ' + T + ':', s + '/100*' + T + '=' + X],
      C.cnt(p) + ', это ' + (p > X ? 'больше' : 'меньше') + ', чем ' + X + '. Значит, их доля ' + (p > X ? 'больше' : 'меньше') + ' ' + s + ' %, и утверждение «' + wR + '…» ' + (truth ? 'верно' : 'неверно') + '.'] };
  } });

/* ---------- pp.ratio ---------- */
const ppgRatio = a => a.join(ppgSp + ':' + ppgSp);                       /* 2 : 3 */
topic({ id: 'pp.ratio', ch: 'pp', lvl: 2, calc: false, variants: 4,
  ru: 'Отношения (ratio)', fr: 'Ratios et partages',
  hints: [
    'Ratio 2 : 3 значит: на каждые 2 одинаковые доли первого приходятся 3 такие же доли второго. Всего долей $2+3=5$.',
    'Чтобы поделить количество в данном ratio, найди одну долю: всё количество ÷ число долей. Потом умножь одну долю на число долей каждого.',
    'Если известна одна из частей, долю находят через неё: 12 девочек при ratio 3 : 4 — одна доля $12÷3=4$, мальчиков $4×4=16$. Ratio упрощают, как дробь: делят все числа на общий делитель.'],
  gen(r, vi) {
    const [n1, n2, n3] = r.sh(PRENOMS_F.concat(PRENOMS_M)).slice(0, 3);
    if (vi === 0) {   /* share in a ratio a : b */
      const [a, b] = r.pick([[1, 2], [2, 3], [1, 3], [3, 4], [2, 5], [3, 5], [1, 4], [4, 5], [3, 7], [5, 7]]), u = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15]);
      const S = (a + b) * u, second = r() < 0.6, C = r.pick(['eur', 'eur', 'peinture', 'billes']);
      let q;
      if (C === 'eur') q = L(n1 + ' et ' + n2 + ' se partagent ' + eur(S) + ' dans le ratio ' + ppgRatio([a, b]) + '. Combien reçoit ' + (second ? n2 : n1) + ' ?', n1 + ' и ' + n2 + ' делят ' + eur(S) + ' в отношении ' + ppgRatio([a, b]) + '. Сколько получит ' + (second ? n2 : n1) + '?');
      if (C === 'peinture') q = L('Pour obtenir une peinture verte, on mélange de la peinture bleue et de la peinture jaune dans le ratio ' + ppgRatio([a, b]) + '. Quelle quantité de peinture ' + (second ? 'jaune' : 'bleue') + ' faut-il pour obtenir ' + S + ' L de peinture verte ?', 'Чтобы получить зелёную краску, смешивают синюю и жёлтую в отношении ' + ppgRatio([a, b]) + '. Сколько литров ' + (second ? 'жёлтой' : 'синей') + ' краски нужно на ' + S + ' л зелёной?');
      if (C === 'billes') q = L(n1 + ' et ' + n2 + ' se partagent ' + S + ' billes dans le ratio ' + ppgRatio([a, b]) + '. Combien de billes reçoit ' + (second ? n2 : n1) + ' ?', n1 + ' и ' + n2 + ' делят ' + ppgPl(S, 'шарик', 'шарика', 'шариков') + ' в отношении ' + ppgRatio([a, b]) + '. Сколько шариков получит ' + (second ? n2 : n1) + '?');
      const k = second ? b : a, dl = x => ppgPl(x, 'долю', 'доли', 'долей');
      const parts = C === 'peinture' ? 'синей краски ' + ppgPl(a, 'доля', 'доли', 'долей') + ', жёлтой — ' + ppgPl(b, 'доля', 'доли', 'долей') : n1 + ' получает ' + dl(a) + ', ' + n2 + ' — ' + dl(b);
      return { q, ans: C === 'eur' ? ppgEurAns(k * u) : N(k * u, C === 'peinture' ? { unit: 'L' } : {}), sol: [
        ['Ratio ' + ppgRatio([a, b]) + ': всё делят на одинаковые доли, ' + parts + '. Всего долей:', a + '+' + b + '=' + (a + b)],
        ['Одна доля:', S + '÷' + (a + b) + '=' + u],
        ['Нужная часть — ' + ppgPl(k, 'доля', 'доли', 'долей') + ':', k + '*' + u + '=' + k * u],
        'Проверка: вторая часть $' + (second ? a : b) + '×' + u + '=' + (second ? a : b) * u + '$, вместе $' + a * u + '+' + b * u + '=' + S + '$ ✓'] };
    }
    if (vi === 1) {   /* one part is known */
      const [a, b] = r.pick([[2, 3], [3, 4], [3, 5], [2, 5], [4, 5], [5, 3], [3, 2], [5, 2], [4, 3]]), u = r.pick([2, 3, 4, 5, 6, 7, 8, 10, 12]);
      const askTotal = r() < 0.35, C = r.pick(['club', 'recette']);
      let q, unit = null;
      if (C === 'club') q = L('Dans un club de sport, les nombres de filles et de garçons sont dans le ratio ' + ppgRatio([a, b]) + '. Il y a ' + a * u + ' filles. ' + (askTotal ? 'Combien le club compte-t-il de membres au total ?' : 'Combien y a-t-il de garçons ?'), 'В спортивном клубе числа девочек и мальчиков относятся как ' + ppgRatio([a, b]) + '. Девочек ' + a * u + '. ' + (askTotal ? 'Сколько всего членов в клубе?' : 'Сколько мальчиков?'));
      else { const g = u * 25; unit = 'g'; q = L('Une recette utilise de la farine et du sucre dans le ratio ' + ppgRatio([a, b]) + '. On utilise ' + a * g + ' g de farine. ' + (askTotal ? 'Quelle est la masse totale de farine et de sucre ?' : 'Quelle masse de sucre faut-il ?'), 'В рецепте мука и сахар берутся в отношении ' + ppgRatio([a, b]) + '. Муки взяли ' + a * g + ' г. ' + (askTotal ? 'Какова общая масса муки и сахара?' : 'Сколько граммов сахара нужно?')); }
      const one = C === 'club' ? u : u * 25, res = askTotal ? (a + b) * one : b * one;
      return { q, ans: N(res, unit ? { unit } : {}), sol: [
        ['Ratio ' + ppgRatio([a, b]) + ': первой величине соответствуют ' + ppgPl(a, 'одинаковая доля', 'одинаковые доли', 'одинаковых долей') + ', и вместе они составляют ' + a * one + '. Находим одну долю:', a * one + '÷' + a + '=' + one],
        askTotal ? ['Всего долей $' + a + '+' + b + '=' + (a + b) + '$:', (a + b) + '*' + one + '=' + res] : ['Второй величине соответствуют ' + ppgPl(b, 'такая доля', 'такие доли', 'таких долей') + ':', b + '*' + one + '=' + res],
        'Проверка: ' + ppgRatio([a * one, b * one]) + ' — после деления обоих чисел на ' + one + ' получается ' + ppgRatio([a, b]) + ' ✓'] };
    }
    if (vi === 2) {   /* simplify a ratio */
      let [a, b] = r.pick([[3, 2], [2, 3], [3, 5], [4, 5], [5, 3], [2, 5], [5, 4], [7, 3], [3, 4], [5, 6]]); const m = r.pick([2, 3, 4, 5, 6, 10, 15, 20, 25]);
      const C = r.pick([
        { fr: (x, y) => 'Une recette demande ' + x + ' g de farine et ' + y + ' g de sucre.', ru: (x, y) => 'В рецепте ' + x + ' г муки и ' + y + ' г сахара.', w: ['farine : sucre', 'мука : сахар'], mul: 10 },
        { fr: (x, y) => 'Dans un collège, il y a ' + x + ' filles et ' + y + ' garçons en 3e.', ru: (x, y) => 'Среди учеников 3e в коллеже ' + ppgPl(x, 'девочка', 'девочки', 'девочек') + ' и ' + ppgPl(y, 'мальчик', 'мальчика', 'мальчиков') + '.', w: ['filles : garçons', 'девочки : мальчики'], mul: 1 },
        { fr: (x, y) => 'Une boisson est préparée avec ' + x + ' cL de sirop et ' + y + ' cL d\'eau.', ru: (x, y) => 'Напиток готовят из ' + x + ' сл сиропа и ' + y + ' сл воды.', w: ['sirop : eau', 'сироп : вода'], mul: 1, small: true }]);
      if (C.small && a > b) [a, b] = [b, a];
      const mm = C.small ? r.pick([2, 3, 4, 5]) : m, x = a * mm * C.mul, y = b * mm * C.mul;
      return { q: L(C.fr(x, y) + ' Écrire le ratio ' + C.w[0] + ' sous la forme a' + ppgSp + ':' + ppgSp + 'b, avec des nombres entiers les plus petits possible.', C.ru(x, y) + ' Запиши отношение ' + C.w[1] + ' в виде a' + ppgSp + ':' + ppgSp + 'b с наименьшими возможными целыми числами.'),
        ans: RATIO(a + ':' + b), sol: [
          'Ratio не меняется, если оба числа разделить на одно и то же число — как дробь при сокращении.',
          ['Наибольший общий делитель чисел ' + x + ' и ' + y + ' — ' + gcd(x, y) + '. Делим на него оба числа:', x + '÷' + gcd(x, y) + '=' + a + ';' + y + '÷' + gcd(x, y) + '=' + b],
          'Получаем ' + ppgRatio([a, b]) + ': числа ' + a + ' и ' + b + ' больше не имеют общих делителей, кроме 1. Порядок важен: первой идёт величина, названная первой.'] };
    }
    /* vi 3: three parts */
    const [a, b, c] = r.pick([[1, 2, 3], [2, 3, 4], [1, 3, 4], [2, 3, 5], [3, 4, 5], [1, 2, 5], [2, 5, 3], [4, 1, 3]]), u = r.pick([3, 4, 5, 6, 8, 10, 12]);
    const S = (a + b + c) * u, who = r.ri(0, 2), k = [a, b, c][who], nm = [n1, n2, n3][who];
    return { q: L('On partage ' + S + ' bonbons entre ' + n1 + ', ' + n2 + ' et ' + n3 + ' selon le ratio ' + ppgRatio([a, b, c]) + '. Combien de bonbons reçoit ' + nm + ' ?', n1 + ', ' + n2 + ' и ' + n3 + ' делят ' + ppgPl(S, 'конфету', 'конфеты', 'конфет') + ' в отношении ' + ppgRatio([a, b, c]) + '. Сколько конфет получит ' + nm + '?'), ans: N(k * u), sol: [
      ['Всего одинаковых долей:', a + '+' + b + '+' + c + '=' + (a + b + c)],
      ['Одна доля:', S + '÷' + (a + b + c) + '=' + u],
      [nm + ' получает ' + ppgPl(k, 'долю', 'доли', 'долей') + ':', k + '*' + u + '=' + k * u],
      'Проверка: $' + a * u + '+' + b * u + '+' + c * u + '=' + S + '$ ✓'] };
  } });

/* ---------- pp.echelle ---------- */
topic({ id: 'pp.echelle', ch: 'pp', lvl: 2, calc: false, variants: 3,
  ru: 'Масштаб', fr: 'Échelles',
  hints: [
    'Масштаб 1/25 000 значит: 1 см на карте — это 25 000 см на местности. Длины на карте и в реальности пропорциональны, коэффициент — 25 000.',
    'Реальная длина = длина на плане × 25 000 — в ТЕХ ЖЕ единицах (см → см). Потом переводи: 1 м = 100 см, 1 км = 100 000 см. Обратно: длина на плане = реальная ÷ 25 000.',
    'Чтобы найти масштаб, переведи обе длины в одинаковые единицы и раздели длину на плане на реальную: 5 см и 25 м = 2 500 см дают $5/2500=1/500$.'],
  gen(r, vi) {
    if (vi === 0 || vi === 1) {
      const C = r.pick([
        { E: [25000, 50000, 100000, 200000, 20000, 10000], d: [2, 3, 4, 5, 6, 8, 10, 12, 1.5, 2.5, 7], u: 'km', f: 100000, w: ['une carte', 'карте'] },
        { E: [50, 100, 200, 20], d: [3, 4, 5, 6, 8, 10, 12, 15, 2.5, 7.5], u: 'm', f: 100, w: ['un plan', 'плане'] },
        { E: [100, 50, 200], d: [20, 25, 30, 45, 15, 12, 60], u: 'm', f: 100, w: ['une maquette', 'макете'] }]);
      let E, d, g = 0; do { E = r.pick(C.E); d = r.pick(C.d); } while (!Number.isInteger(+fx(d * E / C.f * 100)) && g++ < 40);
      const realCm = d * E, real = +fx(realCm / C.f), cmTo = C.u === 'km' ? 'км' : 'м', sc = '1/' + nf(E).replace(/ /g, ppgSp);
      if (vi === 0) {
        const q = C.w[0] === 'une maquette' ? L('Une maquette de bateau est réalisée à l\'échelle ' + sc + '. Sur la maquette, le bateau mesure ' + nf(d) + ' cm de long. Quelle est la longueur réelle du bateau, en m ?', 'Макет корабля сделан в масштабе ' + sc + '. Длина корабля на макете ' + nf(d) + ' см. Какова настоящая длина корабля в метрах?')
          : C.u === 'km' ? L('Sur une carte à l\'échelle ' + sc + ', deux villages sont séparés de ' + nf(d) + ' cm. Quelle est la distance réelle entre ces villages, en km ?', 'На карте масштаба ' + sc + ' между двумя деревнями ' + nf(d) + ' см. Каково настоящее расстояние между ними в километрах?')
          : L('Sur le plan d\'une maison, à l\'échelle ' + sc + ', la longueur du salon mesure ' + nf(d) + ' cm. Quelle est la longueur réelle du salon, en m ?', 'На плане дома в масштабе ' + sc + ' длина гостиной ' + nf(d) + ' см. Какова настоящая длина гостиной в метрах?');
        return { q, ans: N(fx(real), { unit: C.u }), sol: [
          ['Масштаб ' + sc + ': 1 см на ' + C.w[1] + ' — это ' + nf(E) + ' см в реальности. Значит, реальная длина в ' + nf(E) + ' раз больше (в тех же единицах):', fx(d) + '*' + E + '=' + realCm, 'cm'],
          ['Переводим в ' + cmTo + ': 1 ' + cmTo + ' = ' + nf(C.f) + ' см, поэтому делим на ' + nf(C.f) + ':', realCm + '÷' + C.f + '=' + fx(real), C.u]] };
      }
      return { q: C.u === 'km' ? L('Sur une carte à l\'échelle ' + sc + ', quelle longueur, en cm, représente une distance réelle de ' + nf(real) + ' km ?', 'Какой длины в сантиметрах будет на карте масштаба ' + sc + ' настоящее расстояние ' + nf(real) + ' км?')
        : L('Sur un plan à l\'échelle ' + sc + ', quelle longueur, en cm, représente un mur de ' + nf(real) + ' m ?', 'Какой длины в сантиметрах будет на плане масштаба ' + sc + ' стена длиной ' + nf(real) + ' м?'),
        ans: N(fx(d), { unit: 'cm' }), sol: [
          ['Сначала переводим реальную длину в сантиметры — масштаб сравнивает длины в одинаковых единицах:', fx(real) + '*' + C.f + '=' + realCm, 'cm'],
          ['На плане всё в ' + nf(E) + ' раз меньше:', realCm + '÷' + E + '=' + fx(d), 'cm']] };
    }
    /* vi 2: find the scale */
    const [L1, l, E] = r.pick([[25, 5, 500], [12, 6, 200], [10, 5, 200], [8, 4, 200], [20, 4, 500], [30, 6, 500], [15, 3, 500], [40, 8, 500], [50, 5, 1000], [60, 6, 1000], [80, 8, 1000], [14, 7, 200], [35, 7, 500], [100, 4, 2500]]);
    const C = r.pick([['une piscine de ' + L1 + ' m de long', 'бассейн длиной ' + L1 + ' м'], ['un mur de ' + L1 + ' m', 'стена длиной ' + L1 + ' м'], ['un terrain de ' + L1 + ' m de large', 'участок шириной ' + L1 + ' м']]);
    const opt = e => '$1/' + e + '$';
    const ds = [L1 / l, E * 10, E / 10].map(x => +fx(x)).filter(x => x !== E && x >= 1 && Number.isInteger(x));
    const pool = [E].concat(ds); [E * 100, 5 * E].forEach(x => { if (pool.length < 4 && !pool.includes(x)) pool.push(x); });
    return { q: L('Sur un plan, ' + C[0] + ' est représenté' + (C[0].startsWith('une') ? 'e' : '') + ' par un segment de ' + l + ' cm. Quelle est l\'échelle de ce plan ?', 'На плане ' + C[1] + ' изображ' + (C[1].startsWith('бассейн') ? 'ён' : C[1].startsWith('стена') ? 'ена' : 'ён') + ' отрезком ' + l + ' см. Каков масштаб плана?'),
      ans: MQ(r, pool.slice(0, 4).map(opt), 0), sol: [
        ['Сравнивать длины можно только в одинаковых единицах. Переводим ' + L1 + ' м в сантиметры:', L1 + '*100=' + L1 * 100, 'cm'],
        ['Масштаб — во сколько раз длина на плане меньше реальной:', L1 * 100 + '÷' + l + '=' + E],
        'Значит, 1 см на плане — это ' + nf(E) + ' см в реальности: масштаб $1/' + E + '$. Если забыть перевести метры в сантиметры, получится $1/' + fx(L1 / l) + '$ — знаменатель в 100 раз меньше верного.'] };
  } });

/* ---------- pp.vitesse ---------- */
/* a moving person or vehicle: texts for the three questions d, v, t */
function ppgMover(r) {
  const nm = r.pick(PRENOMS_F.concat(PRENOMS_M)), f = PRENOMS_F.includes(nm);
  return r.pick([
    { v: [12, 15, 16, 18, 20, 24, 30], who: nm, fr: { ride: 'a roulé à vélo pendant', done: 'a parcouru', how: ' à vélo', go: 'roule à vélo', pron: f ? 'elle' : 'il', lui: 'lui faut-il pour parcourir' },
      ru: { ride: (f ? 'ехала' : 'ехал') + ' на велосипеде', done: (f ? 'проехала' : 'проехал') + ' на велосипеде', go: 'едет на велосипеде', pron: f ? 'она' : 'он', past: f ? 'проехала' : 'проехал', need: (f ? 'ей' : 'ему') + ' нужно, чтобы проехать' } },
    { v: [4, 5, 6], who: nm, fr: { ride: 'a marché pendant', done: 'a parcouru', how: ' à pied', go: 'marche', pron: f ? 'elle' : 'il', lui: 'lui faut-il pour parcourir' },
      ru: { ride: (f ? 'шла' : 'шёл') + ' пешком', done: (f ? 'прошла' : 'прошёл') + ' пешком', go: 'идёт пешком', pron: f ? 'она' : 'он', past: f ? 'прошла' : 'прошёл', need: (f ? 'ей' : 'ему') + ' нужно, чтобы пройти' } },
    { v: [50, 60, 80, 90, 100, 120], who: 'Une voiture', fr: { ride: 'a roulé pendant', done: 'a parcouru', how: '', go: 'roule', pron: 'elle', lui: 'met-elle pour parcourir' },
      ru: { who: 'Машина', ride: 'ехала', done: 'проехала', go: 'едет', pron: 'она', past: 'проехала', need: 'ей нужно, чтобы проехать' } },
    { v: [120, 160, 200, 240, 300], who: 'Un train', fr: { ride: 'a roulé pendant', done: 'a parcouru', how: '', go: 'roule', pron: 'il', lui: 'met-il pour parcourir' },
      ru: { who: 'Поезд', ride: 'ехал', done: 'проехал', go: 'едет', pron: 'он', past: 'проехал', need: 'ему нужно, чтобы проехать' } }]);
}
topic({ id: 'pp.vitesse', ch: 'pp', lvl: 2, calc: false, variants: 4,
  ru: 'Скорость, расстояние, время', fr: 'Vitesse moyenne, distance et durée',
  hints: [
    'Средняя скорость 40 км/ч значит: за каждый час проходят 40 км. Расстояние пропорционально времени: $d=v×t$, где время $t$ — в часах.',
    'Минуты переводи в часы долями часа: 30 мин = $1/2$ ч, 15 мин = $1/4$ ч, 45 мин = $3/4$ ч, 20 мин = $1/3$ ч. Не путай: 1 ч 15 мин — это 1,25 ч, а не 1,15 ч.',
    'Из $d=v×t$ следует $v=d÷t$ и $t=d÷v$. Перевод: 1 м/с = 3,6 км/ч, потому что за час (3 600 с) проходят 3 600 м = 3,6 км.'],
  gen(r, vi) {
    if (vi === 3) {   /* km/h ↔ m/s */
      const [kmh, ms] = r.pick([[18, 5], [36, 10], [54, 15], [72, 20], [90, 25], [108, 30], [144, 40], [7.2, 2], [45, 12.5], [126, 35]]);
      const toMs = r() < 0.55;
      const T = toMs ? r.pick([['Convertir ' + nf(kmh) + ' km/h en m/s.', 'Переведи ' + nf(kmh) + ' км/ч в м/с.'], ['Une voiture roule à ' + nf(kmh) + ' km/h. Quelle est sa vitesse en m/s ?', 'Машина едет со скоростью ' + nf(kmh) + ' км/ч. Какова её скорость в м/с?']])
        : r.pick([['Convertir ' + nf(ms) + ' m/s en km/h.', 'Переведи ' + nf(ms) + ' м/с в км/ч.'], ['Un guépard court à ' + nf(ms) + ' m/s. Quelle est sa vitesse en km/h ?', 'Гепард бежит со скоростью ' + nf(ms) + ' м/с. Какова его скорость в км/ч?']]);
      return { q: L(T[0], T[1]), ans: toMs ? N(fx(ms), { unit: 'm/s' }) : N(fx(kmh), { unit: 'km/h' }), sol: [
        ['1 км/ч — это 1 000 м за 3 600 с, то есть за одну секунду:', '1000/3600=1/3.6', 'm'],
        toMs ? ['Поэтому из км/ч в м/с делим на 3,6:', fx(kmh) + '÷3.6=' + fx(ms), 'm/s'] : ['Поэтому из м/с в км/ч умножаем на 3,6 (за час секунд в 3 600 раз больше, а километр в 1 000 раз длиннее метра):', fx(ms) + '*3.6=' + fx(kmh), 'km/h'],
        'Проверка здравым смыслом: число в км/ч всегда больше, чем в м/с (в 3,6 раза).'] };
    }
    const M = ppgMover(r), who = M.who, whoRu = M.ru.who || M.who;
    const ts = [15, 20, 30, 45, 90, 75, 150, 120, 180, 40, 105, 135];
    let v, t, g = 0; do { v = r.pick(M.v); t = r.pick(ts); } while (!Number.isInteger(v * t / 60) && g++ < 80);
    if (!Number.isInteger(v * t / 60)) { v = M.v[0]; t = 60; }
    const d = v * t / 60, th = t / 60, exact = Number.isInteger(th * 100), tf = F(t, 60);
    const thM = exact ? fx(th) : '(' + Fr.str(tf) + ')';
    const hTxt = t % 60 ? 'Время — в часах: ' + ppgHM(t, true) + ' = $' + (t > 60 ? Math.floor(t / 60) + '+' : '') + Fr.str(F(t % 60, 60)) + (t > 60 ? '=' + Fr.str(tf) : '') + '$ ч' + (exact ? ' = ' + nf(th) + ' ч' : '') + '.' : 'Время уже в целых часах: ' + (t / 60) + ' ч.';
    if (vi === 0) return { q: L(who + ' ' + M.fr.ride + ' ' + ppgHM(t) + ' à la vitesse moyenne de ' + v + ' km/h. Quelle distance, en km, a-t-' + M.fr.pron + ' parcourue ?', whoRu + ' ' + M.ru.ride + ' ' + ppgHM(t, true) + ' со средней скоростью ' + v + ' км/ч. Какое расстояние в километрах ' + M.ru.pron + ' ' + M.ru.past + '?'),
      ans: N(fx(d), { unit: 'km' }), sol: [
        'Скорость ' + v + ' км/ч: за каждый час — ' + v + ' км. Расстояние пропорционально времени: $d=v×t$.', hTxt,
        ['Расстояние:', v + '*' + thM + '=' + fx(d), 'km']] };
    if (vi === 1) {
      const gg = gcd(t, 60), dg = +fx(d * gg / t);
      return { q: L(who + ' ' + M.fr.done + ' ' + nf(d) + ' km' + M.fr.how + ' en ' + ppgHM(t) + '. Quelle est sa vitesse moyenne, en km/h ?', whoRu + ' ' + M.ru.done + ' ' + nf(d) + ' км за ' + ppgHM(t, true) + '. Какова средняя скорость в км/ч?'),
        ans: N(v, { unit: 'km/h' }), sol: [
          'Скорость в км/ч — сколько километров проходят за 1 час: $v=d÷t$, время — в часах.', hTxt,
          ['Скорость:', fx(d) + '÷' + thM + '=' + v, 'km/h'],
          t === 60 ? 'Время ровно 1 час — скорость равна расстоянию.' : t > 60 && t % 60 === 0 ? 'В уме: за ' + (t / 60) + ' ч — ' + nf(d) + ' км, значит, за 1 ч — в ' + ppgPl(t / 60, 'раз', 'раза', 'раз') + ' меньше.'
            : 'В уме через пропорциональность: ' + (t === gg ? 'за ' + t + ' мин — ' + nf(d) + ' км' : 'за ' + gg + ' мин — $' + fx(d) + '÷' + (t / gg) + '=' + fx(dg) + '$ км') + ', а за 60 мин — в ' + ppgPl(60 / gg, 'раз', 'раза', 'раз') + ' больше: $' + fx(dg) + '×' + (60 / gg) + '=' + v + '$ км.'] };
    }
    /* vi 2: the duration */
    return { q: L(who + ' ' + M.fr.go + ' à la vitesse moyenne de ' + v + ' km/h. Combien de temps ' + M.fr.lui + ' ' + nf(d) + ' km ?', whoRu + ' ' + M.ru.go + ' со средней скоростью ' + v + ' км/ч. Сколько времени ' + M.ru.need + ' ' + nf(d) + ' км?'),
      ans: ppgDurAns(t), sol: [
        ['Из $d=v×t$: время = расстояние ÷ скорость. Получаем время в часах:', fx(d) + '÷' + v + '=' + (exact ? fx(th) : Fr.str(tf)), 'h'],
        ['Переводим часы в минуты (в часе 60 минут):', (exact ? fx(th) : Fr.str(tf)) + '*60=' + t, 'min'],
        t >= 60 ? t + ' мин = ' + ppgHM(t, true) + '.' + (exact && t % 60 ? ' Внимание: ' + nf(th) + ' h — это не ' + Math.floor(th) + ' ч ' + String(fx(th)).split('.')[1] + ' мин: после запятой — доли часа, а не минуты.' : '') : 'Ответ меньше часа — даём его в минутах.'] };
  } });

/* ======================================================================================
   CHAPTER gm — Grandeurs et mesures
   ====================================================================================== */

/* ---------- units: power of ten of each unit, Russian names ---------- */
const PPG_E = { km: 3, hm: 2, dam: 1, m: 0, dm: -1, cm: -2, mm: -3, t: 6, kg: 3, g: 0, mg: -3, hL: 2, L: 0, dL: -1, cL: -2, mL: -3,
  'km²': 6, ha: 4, 'm²': 0, 'dm²': -2, 'cm²': -4, 'mm²': -6, 'm³': 0, 'dm³': -3, 'cm³': -6, 'mm³': -9 };
const PPG_RU = { km: 'км', hm: 'гм', dam: 'дам', m: 'м', dm: 'дм', cm: 'см', mm: 'мм', t: 'т', kg: 'кг', g: 'г', mg: 'мг', hL: 'гл', L: 'л', dL: 'дл', cL: 'сл', mL: 'мл',
  'km²': 'км²', ha: 'га', 'm²': 'м²', 'dm²': 'дм²', 'cm²': 'см²', 'mm²': 'мм²', 'm³': 'м³', 'dm³': 'дм³', 'cm³': 'см³', 'mm³': 'мм³' };
const ppgRu = u => PPG_RU[u] || u;
/* exact decimal string of n·10^e (n an integer) */
const ppgSh = (n, e) => e >= 0 ? String(n) + '0'.repeat(e) : decT(n, -e);
const ppgP10 = k => '1' + '0'.repeat(k);
const ppgN = v => nf(v).replace(/ /g, ppgSp);                              /* 1 000 000 that does not break */
const ppgUT = u => u ? '\\;\\text{' + u.replace(/²/g, '}^2\\text{').replace(/³/g, '}^3\\text{') + '}' : '';      /* a unit as TeX */
/* «a × b = c unit» as TeX with grouped digits: 6,5 × 1 000 000 = 6 500 000 m² */
const ppgOpT = (a, op, b, c, u) => ppgTx(+a) + (op === '*' ? '\\times ' : op === '÷' ? '\\div ' : op) + ppgTx(+b) + '=' + ppgTx(+c) + ppgUT(u);
/* a converted value as an answer: the key, the unit, and the value shown with grouped digits */
const ppgConvAns = (res, u) => N(res, { unit: u, show: ppgTx(+res) });
/* a value n·10^-d to convert by 10^s, with at most 3 decimals in the result */
function ppgConvVal(r, s) {
  let n, d, g = 0;
  do { n = r.pick([2, 3, 5, 6, 7, 8, 9, 12, 15, 18, 25, 36, 45, 48, 65, 75, 125, 250, 350]); d = r.pick([0, 1, 1, 2]); }
  while ((d - s > 3 || (s - d >= 0 && String(n).length + s - d > 7) || (n % 10 === 0 && d > 0)) && g++ < 100);
  return { v: ppgSh(n, -d), res: ppgSh(n, s - d) };
}
const PPG_CONV = {
  len: [['km', 'm'], ['m', 'km'], ['m', 'cm'], ['cm', 'm'], ['cm', 'mm'], ['mm', 'cm'], ['m', 'mm'], ['mm', 'm'], ['dm', 'cm'], ['m', 'dm'], ['hm', 'm'], ['dam', 'm']],
  mass: [['kg', 'g'], ['g', 'kg'], ['g', 'mg'], ['mg', 'g'], ['t', 'kg'], ['kg', 't']],
  cap: [['L', 'cL'], ['cL', 'L'], ['L', 'mL'], ['mL', 'L'], ['dL', 'L'], ['L', 'dL'], ['hL', 'L'], ['L', 'hL'], ['cL', 'mL'], ['mL', 'cL']] };
const PPG_TABLE = { len: 'km · hm · dam · m · dm · cm · mm', mass: 'kg · hg · dag · g · dg · cg · mg', cap: 'hL · daL · L · dL · cL · mL' };
/* why multiply or divide, and what happens to the digits */
function ppgConvSteps(fam, a, b, v, res) {
  const s = PPG_E[a] - PPG_E[b], k = Math.abs(s), f = ppgP10(k);
  const st = [];
  if (fam && !(a === 't' || b === 't')) st.push('Таблица единиц: ' + PPG_TABLE[fam] + ' — соседние единицы отличаются в 10 раз. От ' + a + ' до ' + b + ' — ' + ppgPl(k, 'шаг', 'шага', 'шагов') + ', то есть в ' + ppgN(+f) + ' раз.');
  if (s > 0) st.push({ t: '1 ' + ppgRu(a) + ' = ' + ppgN(+f) + ' ' + ppgRu(b) + ': ' + ppgRu(b) + ' — более мелкая единица, их нужно больше — умножаем на ' + ppgN(+f) + ':', tex: ppgOpT(v, '*', f, res, b) });
  else st.push({ t: '1 ' + ppgRu(b) + ' = ' + ppgN(+f) + ' ' + ppgRu(a) + ': ' + ppgRu(b) + ' — более крупная единица, их получится меньше — делим на ' + ppgN(+f) + ':', tex: ppgOpT(v, '÷', f, res, b) });
  st.push('При ' + (s > 0 ? 'умножении' : 'делении') + ' на ' + ppgN(+f) + ' каждая цифра переходит в разряд в ' + ppgN(+f) + ' раз ' + (s > 0 ? 'старше' : 'младше') + ', поэтому запятая сдвигается на ' + ppgPl(k, 'знак', 'знака', 'знаков') + ' ' + (s > 0 ? 'вправо' : 'влево') + '.');
  return st;
}

/* ---------- gm.conversions ---------- */
topic({ id: 'gm.conversions', ch: 'gm', lvl: 1, calc: false, variants: 4,
  ru: 'Перевод единиц: длина, масса, вместимость', fr: 'Conversions : longueurs, masses, contenances',
  hints: [
    'В таблице единиц соседние отличаются в 10 раз: km, hm, dam, m, dm, cm, mm. Так же устроены граммы (kg … g … mg) и литры (hL … L … mL). Отдельно: 1 t = 1 000 kg.',
    'Переходишь к более мелкой единице — число становится больше: в 1 m помещается 100 cm, поэтому умножаем на 100. К более крупной — делим.',
    'Сосчитай шаги в таблице: от km до m три шага, значит, в 1 000 раз. Умножить на 1 000 — каждая цифра становится в 1 000 раз «старше», запятая сдвигается на 3 знака вправо.'],
  gen(r, vi) {
    const fam = vi === 3 ? r.pick(['len', 'mass', 'cap']) : ['len', 'mass', 'cap'][vi];
    const [a, b] = r.pick(PPG_CONV[fam]), s = PPG_E[a] - PPG_E[b];
    const { v, res } = ppgConvVal(r, s);
    if (vi < 3) {
      const q = r() < 0.5 ? L('Convertir ' + nf(+v) + ' ' + a + ' en ' + b + '.', 'Переведи ' + nf(+v) + ' ' + ppgRu(a) + ' в ' + ppgRu(b) + '.')
        : L('Compléter : ' + nf(+v) + ' ' + a + ' = … ' + b + '.', 'Дополни: ' + nf(+v) + ' ' + ppgRu(a) + ' = … ' + ppgRu(b) + '.');
      return { q, ans: ppgConvAns(res, b), sol: ppgConvSteps(fam, a, b, v, res) };
    }
    /* vi 3: multiple choice (Polynésie 2026, Q7 style) */
    const k = Math.abs(s), cands = [res, ppgSh(+v.replace('.', ''), s + 1 - (v.split('.')[1] || '').length), ppgSh(+v.replace('.', ''), s - 1 - (v.split('.')[1] || '').length), ppgSh(+v.replace('.', ''), -s - (v.split('.')[1] || '').length)];
    const vals = []; cands.forEach(x => { if (!vals.includes(+x)) vals.push(+x); });
    if (vals.length < 4) vals.push(+ppgSh(+v.replace('.', ''), s + 2 - (v.split('.')[1] || '').length));
    const opts = vals.slice(0, 4).map(x => L(nf(x) + ' ' + b, nf(x) + ' ' + ppgRu(b)));
    return { q: L('Parmi les propositions suivantes, laquelle complète l\'égalité ' + nf(+v) + ' ' + a + ' = … ' + b + ' ?', 'Какой вариант дополняет равенство ' + nf(+v) + ' ' + ppgRu(a) + ' = … ' + ppgRu(b) + '?'), ans: MQ(r, opts, 0),
      sol: ppgConvSteps(fam, a, b, v, res).concat(['Остальные варианты — ошибка на один шаг таблицы (в 10 раз) или в направлении: ' + (s > 0 ? 'единица мельче, значит, число должно стать больше' : 'единица крупнее, значит, число должно стать меньше') + '.']) };
  } });

/* ---------- gm.conversions-aires-volumes ---------- */
const PPG_SIDE = { 'km²': ['км', 1000, 'м'], ha: ['гм (100 м)', 100, 'м'], 'm²': ['м', 10, 'дм'], 'dm²': ['дм', 10, 'см'], 'cm²': ['см', 10, 'мм'], 'mm²': ['мм', 1, 'мм'], 'm³': ['м', 10, 'дм'], 'dm³': ['дм', 10, 'см'], 'cm³': ['см', 10, 'мм'] };
topic({ id: 'gm.conversions-aires-volumes', ch: 'gm', lvl: 2, calc: false, variants: 4,
  ru: 'Перевод единиц площади и объёма, литры', fr: 'Conversions d\'aires et de volumes, 1 L = 1 dm³',
  hints: [
    'Квадратный метр — квадрат 1 m × 1 m. Вдоль стороны 10 dm, поэтому в нём 10 × 10 = 100 квадратиков 1 dm². Соседние единицы площади отличаются в 100 раз, а не в 10.',
    'Кубический метр — куб 1 m × 1 m × 1 m: в нём 10 × 10 × 10 = 1 000 кубиков 1 dm³. Соседние единицы объёма отличаются в 1 000 раз.',
    'Литры связаны с объёмом: 1 L = 1 dm³ (кубик с ребром 10 cm). Отсюда 1 mL = 1 cm³ и 1 m³ = 1 000 L. Гектар — квадрат 100 m × 100 m: 1 ha = 10 000 m².'],
  gen(r, vi) {
    if (vi === 0 || vi === 1) {
      const area = vi === 0;
      const [a, b] = r.pick(area ? [['m²', 'cm²'], ['cm²', 'm²'], ['m²', 'dm²'], ['dm²', 'm²'], ['dm²', 'cm²'], ['cm²', 'dm²'], ['cm²', 'mm²'], ['mm²', 'cm²'], ['km²', 'm²'], ['ha', 'm²'], ['m²', 'ha'], ['km²', 'ha']]
        : [['m³', 'dm³'], ['dm³', 'm³'], ['dm³', 'cm³'], ['cm³', 'dm³'], ['cm³', 'mm³'], ['m³', 'cm³'], ['cm³', 'm³']]);
      const s = PPG_E[a] - PPG_E[b], k = Math.abs(s), f = ppgP10(k), { v, res } = ppgConvVal(r, s);
      const big = s > 0 ? a : b, small = s > 0 ? b : a, sd = PPG_SIDE[big];
      const side = Math.round(Math.pow(10, k / (area ? 2 : 3)));
      const why = big === 'ha' ? '1 га — квадрат 100 м × 100 м, в нём $$100\\times 100=10\\,000$$ квадратов по 1 м².' : big === 'km²' && small === 'ha' ? '1 км² — квадрат 1 000 м × 1 000 м, а 1 га — квадрат 100 м × 100 м: вдоль стороны их помещается 10, всего $10×10=100$ гектаров.'
        : area ? '1 ' + ppgRu(big) + ' — квадрат со стороной 1 ' + sd[0] + ' = ' + ppgN(side) + ' ' + ppgRu(small).replace('²', '') + '. В нём $$' + ppgTx(side) + '\\times ' + ppgTx(side) + '=' + ppgTx(+f) + '$$ квадратиков по 1 ' + ppgRu(small) + '.'
          : '1 ' + ppgRu(big) + ' — куб с ребром 1 ' + sd[0] + ' = ' + ppgN(side) + ' ' + ppgRu(small).replace('³', '') + '. В нём $$' + ppgTx(side) + '\\times ' + ppgTx(side) + '\\times ' + ppgTx(side) + '=' + ppgTx(+f) + '$$ кубиков по 1 ' + ppgRu(small) + '.';
      return { q: r() < 0.5 ? L('Convertir ' + nf(+v) + ' ' + a + ' en ' + b + '.', 'Переведи ' + nf(+v) + ' ' + ppgRu(a) + ' в ' + ppgRu(b) + '.') : L('Compléter : ' + nf(+v) + ' ' + a + ' = … ' + b + '.', 'Дополни: ' + nf(+v) + ' ' + ppgRu(a) + ' = … ' + ppgRu(b) + '.'),
        ans: ppgConvAns(res, b), sol: [why,
          s > 0 ? { t: 'Значит, 1 ' + ppgRu(a) + ' = ' + ppgN(+f) + ' ' + ppgRu(b) + ' — умножаем на ' + ppgN(+f) + ':', tex: ppgOpT(v, '*', f, res, b) } : { t: 'Значит, 1 ' + ppgRu(b) + ' = ' + ppgN(+f) + ' ' + ppgRu(a) + ' — делим на ' + ppgN(+f) + ':', tex: ppgOpT(v, '÷', f, res, b) },
          'Частая ошибка — шагать по таблице в 10 раз, как для длин. У ' + (area ? 'площадей каждый шаг — в 100 раз (длина × длина)' : 'объёмов каждый шаг — в 1 000 раз (длина × длина × длина)') + '.'] };
    }
    if (vi === 2) {   /* litres ↔ cm³ / dm³ / m³ (Polynésie 2026, Q7 style) */
      const [a, b] = r.pick([['L', 'cm³'], ['cm³', 'L'], ['m³', 'L'], ['L', 'm³'], ['dm³', 'L'], ['L', 'dm³'], ['mL', 'cm³'], ['cL', 'cm³']]);
      const toE = { L: -3, mL: -6, cL: -5, 'cm³': -6, 'dm³': -3, 'm³': 0 }, eF = toE[a] - toE[b];
      const n = r.pick([357, 25, 75, 12, 48, 6, 15, 125, 8, 36]), d = r.pick([0, 1, 2]), v = ppgSh(n, -d);
      const exps = eF > 0 ? [eF, eF - 1, eF - 2, eF - 3] : eF < 0 ? [eF, eF + 1, eF + 2, eF + 3] : [0, 1, 2, 3];
      const opts = exps.map(e => { const x = +ppgSh(n, e - d); return L(nf(x) + ' ' + b, nf(x) + ' ' + ppgRu(b)); });
      const link = { mL: ' 1 мл — тысячная часть литра, а 1 см³ — тысячная часть дм³, поэтому 1 мл = 1 см³.', cL: ' 1 сл = 10 мл, а 1 мл = 1 см³, поэтому 1 сл = 10 см³.', 'cm³': ' А 1 дм³ = 1 000 см³ (куб 10 см × 10 см × 10 см), поэтому 1 л = 1 000 см³.', 'm³': ' А 1 м³ = 1 000 дм³, поэтому 1 м³ = 1 000 л.', 'dm³': '' };
      const res = ppgSh(n, eF - d), f = ppgP10(Math.abs(eF));
      return { q: L('Parmi les propositions suivantes, laquelle complète l\'égalité ' + nf(+v) + ' ' + a + ' = … ' + b + ' ?', 'Какой вариант дополняет равенство ' + nf(+v) + ' ' + ppgRu(a) + ' = … ' + ppgRu(b) + '?'), ans: MQ(r, opts, 0), sol: [
        'Главная связь: 1 л — это объём куба с ребром 1 дм, то есть 1 л = 1 дм³.' + (link[a === 'L' ? b : a] || ''),
        eF === 0 ? 'Литр и кубический дециметр — одно и то же, поэтому число не меняется: ' + nf(+v) + ' ' + ppgRu(a) + ' = ' + nf(+v) + ' ' + ppgRu(b) + '.' : eF > 0 ? ['1 ' + ppgRu(a) + ' = ' + nf(+f) + ' ' + ppgRu(b) + ', поэтому умножаем на ' + nf(+f) + ':', v + '*' + f + '=' + res, b] : ['1 ' + ppgRu(b) + ' = ' + nf(+f) + ' ' + ppgRu(a) + ', поэтому делим на ' + nf(+f) + ':', v + '÷' + f + '=' + res, b],
        'Неверные варианты получаются, если считать, что 1 л = 1 см³, или шагать по объёмам в 10 раз вместо 1 000.'] };
    }
    /* vi 3: capacity of a box, in litres */
    const C = r.pick([['Un aquarium', 'Аквариум', 'его'], ['Un réservoir d\'eau', 'Бак для воды', 'его'], ['Une glacière', 'Сумка-холодильник', 'её'], ['Un bac à fleurs', 'Ящик для цветов', 'его']]);
    const [x, y, z] = r.sh([r.pick([20, 30, 40, 50, 60]), r.pick([20, 25, 30, 40]), r.pick([10, 20, 30, 40, 50, 60, 80])]);
    const V = x * y * z, Ldm = V / 1000;
    return { q: L(C[0] + ' a la forme d\'un pavé droit de dimensions ' + x + ' cm, ' + y + ' cm et ' + z + ' cm. Quelle est sa contenance, en litres ?', C[1] + ' имеет форму прямоугольного параллелепипеда размером ' + x + ' см × ' + y + ' см × ' + z + ' см. Какова ' + C[2] + ' вместимость в литрах?'),
      ans: N(fx(Ldm), { unit: 'L' }), sol: [
        'Вместимость — это объём внутри, в литрах. Удобно сразу перейти к дециметрам, потому что 1 дм³ = 1 л: 10 см = 1 дм.',
        ['Размеры в дм: ' + nf(x / 10) + ', ' + nf(y / 10) + ' и ' + nf(z / 10) + '. Объём параллелепипеда = длина × ширина × высота:', fx(x / 10) + '*' + fx(y / 10) + '*' + fx(z / 10) + '=' + fx(Ldm), 'dm³'],
        'А 1 дм³ = 1 л, поэтому вместимость ' + nf(Ldm) + ' л. (Можно и в см³: $' + x + '×' + y + '×' + z + '=' + V + '$ см³, а 1 л = 1 000 см³, и $' + V + '÷1000=' + fx(Ldm) + '$.)'] };
  } });

/* ---------- gm.durees ---------- */
topic({ id: 'gm.durees', ch: 'gm', lvl: 1, calc: false, variants: 4,
  ru: 'Длительности и время на часах', fr: 'Durées et horaires',
  hints: [
    'В часе 60 минут, а не 100: время считают «по 60». Поэтому 135 мин = 120 мин + 15 мин = 2 ч 15 мин, а не 1 ч 35 мин.',
    'Складывай отдельно часы и минуты; если минут набралось 60 или больше, 60 минут превращай в 1 час. При вычитании, если минут не хватает, «займи» 1 час = 60 минут.',
    'Доли часа: $1/2$ ч = 30 мин, $1/4$ ч = 15 мин, $1/10$ ч = 6 мин. Поэтому 0,5 ч = 30 мин, 1,5 ч = 1 ч 30 мин (а не 1 ч 50 мин), 0,2 ч = 12 мин.'],
  gen(r, vi) {
    if (vi === 0) {   /* minutes → hours (sujet zéro 2026, Q2 style) */
      const C = r.pick([['un film', 'фильм', 'La durée d\'un film est de', 'Фильм длится'], ['une randonnée', 'поход', 'Une randonnée a duré', 'Поход длился'], ['un trajet', 'поездка', 'Un trajet en bus a duré', 'Поездка на автобусе длилась']]);
      if (r() < 0.35) {
        const H = r.pick([2, 3, 4, 5, 6]), M = 60 * H;
        return { q: L(C[2] + ' ' + M + ' min. Exprimer cette durée en heures.', C[3] + ' ' + M + ' мин. Вырази это время в часах.'), ans: N(H, { unit: 'h' }), sol: [
          ['В одном часе 60 минут, поэтому часов в ' + M + ' минутах столько, сколько раз 60 помещается в ' + M + ':', M + '÷60=' + H, 'h']] };
      }
      const M = r.pick([75, 85, 90, 100, 110, 125, 135, 150, 165, 195, 200, 250]), q = Math.floor(M / 60), m = M % 60;
      const sol = [['В часе 60 минут. Сколько полных часов помещается в ' + M + ' минутах? Делим на 60 с остатком:', M + '=' + q + '*60+' + m],
        'Значит, ' + M + ' мин = ' + ppgHM(M, true) + '.'];
      if (M >= 100 && M % 100 < 60) sol.push('Ошибка «' + Math.floor(M / 100) + ' ч ' + (M % 100) + ' мин» получается, если считать, что в часе 100 минут.');
      return { q: L(C[2] + ' ' + M + ' min. Exprimer cette durée en heures et minutes.', C[3] + ' ' + M + ' мин. Вырази это время в часах и минутах.'), ans: ppgDurAns(M), sol };
    }
    if (vi === 1) {   /* a clock time: start + duration or end − duration */
      let st, du, g = 0;
      do { st = r.ri(7 * 12, 20 * 12) * 5; du = r.pick([35, 45, 50, 55, 70, 85, 95, 105, 110, 125, 135, 150, 165]); } while ((st % 60 === 0 || (st + du) % 60 === 0 || st + du >= 23 * 60) && g++ < 100);
      const en = st + du, askEnd = r() < 0.6, hs = Math.floor(st / 60), ms = st % 60, hd = Math.floor(du / 60), md = du % 60, he = Math.floor(en / 60), me = en % 60;
      const T = askEnd ? r.pick([
        ['Un film commence à ' + ppgClock(st) + ' et dure ' + ppgHM(du) + '. À quelle heure se termine-t-il ?', 'Фильм начинается в ' + ppgClock(st, true) + ' и длится ' + ppgHM(du, true) + '. Во сколько он закончится?'],
        ['Un train part à ' + ppgClock(st) + ' ; le trajet dure ' + ppgHM(du) + '. À quelle heure arrive-t-il ?', 'Поезд отправляется в ' + ppgClock(st, true) + '; поездка длится ' + ppgHM(du, true) + '. Во сколько он прибудет?']])
        : ['Un match se termine à ' + ppgClock(en) + '. Il a duré ' + ppgHM(du) + '. À quelle heure a-t-il commencé ?', 'Матч закончился в ' + ppgClock(en, true) + '. Он длился ' + ppgHM(du, true) + '. Во сколько он начался?'];
      const ansT = askEnd ? [he, me] : [hs, ms];
      const sol = [];
      if (askEnd) {
        sol.push(['Складываем отдельно часы и минуты:', hs + '+' + hd + '=' + (hs + hd) + ';' + ms + '+' + md + '=' + (ms + md)]);
        if (ms + md >= 60) sol.push('Минут получилось ' + (ms + md) + ' — это больше часа: ' + (ms + md) + ' мин = 1 ч ' + (ms + md - 60) + ' мин. Добавляем этот час к часам: ' + (hs + hd) + ' + 1 = ' + he + '. Ответ: ' + ppgClock(en, true) + '.');
        else sol.push('Ответ: ' + ppgClock(en, true) + '.');
      } else {
        if (me >= md) sol.push(['Вычитаем отдельно часы и минуты:', he + '-' + hd + '=' + (he - hd) + ';' + me + '-' + md + '=' + (me - md)]);
        else sol.push('Минут ' + me + ' меньше, чем ' + md + ', — «занимаем» 1 час = 60 минут: ' + ppgClock(en, true) + ' — это ' + (he - 1) + ' ч ' + (me + 60) + ' мин.', ['Теперь вычитаем отдельно часы и минуты:', (he - 1) + '-' + hd + '=' + (he - 1 - hd) + ';' + (me + 60) + '-' + md + '=' + (me + 60 - md)]);
        sol.push('Ответ: ' + ppgClock(st, true) + '. Проверка: ' + ppgClock(st, true) + ' + ' + ppgHM(du, true) + ' = ' + ppgClock(en, true) + ' ✓');
      }
      return { q: L(T[0], T[1]), ans: multi([null, N(ansT[0], { unit: 'h' })], [null, N(ansT[1], { unit: 'min' })]), sol };
    }
    if (vi === 2) {   /* a duration */
      if (r() < 0.5) {   /* between two clock times */
        let st, du, g = 0;
        do { st = r.ri(6 * 12, 19 * 12) * 5; du = r.pick([35, 50, 55, 70, 85, 95, 105, 125, 135, 155, 170]); } while ((st % 60 === 0 || (st + du) % 60 === 0) && g++ < 100);
        const en = st + du, hs = Math.floor(st / 60), ms = st % 60, nx = (hs + 1) * 60;
        const T = r.pick([['Un train part à ' + ppgClock(st) + ' et arrive à ' + ppgClock(en) + '. Quelle est la durée du trajet ?', 'Поезд отправляется в ' + ppgClock(st, true) + ' и прибывает в ' + ppgClock(en, true) + '. Сколько длится поездка?'],
          ['Un cours de danse commence à ' + ppgClock(st) + ' et se termine à ' + ppgClock(en) + '. Combien de temps dure-t-il ?', 'Урок танцев начинается в ' + ppgClock(st, true) + ' и заканчивается в ' + ppgClock(en, true) + '. Сколько он длится?']]);
        const sol = en > nx ? [['Считаем «через ровный час»: от ' + ppgClock(st, true) + ' до ' + (hs + 1) + ':00 — ' + (60 - ms) + ' мин, от ' + (hs + 1) + ':00 до ' + ppgClock(en, true) + ' — ' + ppgHM(en - nx, true) + '. Складываем:', (60 - ms) + '+' + (en - nx) + '=' + du, 'min'], du + ' мин = ' + ppgHM(du, true) + '.']
          : [['Оба момента внутри одного часа — вычитаем минуты:', (en % 60) + '-' + ms + '=' + du, 'min']];
        return { q: L(T[0], T[1]), ans: ppgDurAns(du), sol };
      }
      /* total minus a stop (Polynésie 2026, ex. 3 style) */
      const Tt = r.ri(9, 23) * 60 + r.pick([5, 10, 15, 20, 25, 35, 40, 45, 50]), W = r.ri(1, 4) * 60 + r.pick([15, 20, 30, 40, 45, 50, 55]);
      const res = Tt - W, ht = Math.floor(Tt / 60), mt = Tt % 60, hw = Math.floor(W / 60), mw = W % 60;
      const sol = mt >= mw ? [['Вычитаем отдельно часы и минуты:', ht + '-' + hw + '=' + (ht - hw) + ';' + mt + '-' + mw + '=' + (mt - mw)]]
        : ['Минут ' + mt + ' меньше, чем ' + mw + ', — «занимаем» 1 час: ' + ppgHM(Tt, true) + ' = ' + (ht - 1) + ' ч ' + (mt + 60) + ' мин.', ['Теперь вычитаем отдельно часы и минуты:', (ht - 1) + '-' + hw + '=' + (ht - 1 - hw) + ';' + (mt + 60) + '-' + mw + '=' + (mt + 60 - mw)]];
      sol.push('Полёты заняли ' + ppgHM(res, true) + '. Проверка: ' + ppgHM(res, true) + ' + ' + ppgHM(W, true) + ' = ' + ppgHM(Tt, true) + ' ✓');
      return { q: L('Un voyage en avion a duré ' + ppgHM(Tt) + ' au total, en comptant une escale de ' + ppgHM(W) + '. Combien de temps ont duré les vols ?', 'Путешествие на самолёте заняло всего ' + ppgHM(Tt, true) + ', включая пересадку ' + ppgHM(W, true) + '. Сколько времени заняли сами полёты?'), ans: ppgDurAns(res), sol };
    }
    /* vi 3: parts of an hour (Antilles 2026, Q6 style) */
    const I = r.pick([
      ['$1/10$ h', '$1/10$ ч', '1/10 h', [6, 10, 0.1, 1], 'Час — это 60 минут, $1/10$ часа — десятая часть: $60÷10=6$ мин.'],
      ['$1/4$ h', '$1/4$ ч', '', [15, 25, 4, 0.25], 'Четверть часа: $60÷4=15$ мин. «25 мин» получится, если читать $1/4=0.25$ как 25 минут.'],
      ['$3/4$ h', '$3/4$ ч', '', [45, 75, 0.75, 30], 'Три четверти часа: $60÷4×3=45$ мин.'],
      ['$1/3$ h', '$1/3$ ч', '', [20, 33, 30, 3], 'Треть часа: $60÷3=20$ мин.'],
      ['0,2 h', '0,2 ч', '', [12, 20, 2, 0.2], '0,2 ч — это две десятых часа: $0.2×60=12$ мин. «20 мин» — ошибка: после запятой стоят доли часа, а не минуты.'],
      ['0,5 h', '0,5 ч', '', [30, 50, 5, 0.5], '0,5 ч — полчаса: $0.5×60=30$ мин.'],
      ['1,5 h', '1,5 ч', '', ['1 h 30 min', '1 h 50 min', '1 h 5 min', '15 min'], '1,5 ч = 1 ч + 0,5 ч, а 0,5 ч = 30 мин. «1 ч 50 мин» — ошибка: 0,5 — это половина часа, а не 50 минут.'],
      ['2,25 h', '2,25 ч', '', ['2 h 15 min', '2 h 25 min', '2 h 2 min', '225 min'], '2,25 ч = 2 ч + 0,25 ч, а 0,25 ч = $0.25×60=15$ мин.'],
      ['1,2 h', '1,2 ч', '', ['1 h 12 min', '1 h 20 min', '1 h 2 min', '120 min'], '1,2 ч = 1 ч + 0,2 ч, а 0,2 ч = $0.2×60=12$ мин.'],
      ['0,75 h', '0,75 ч', '', [45, 75, 7.5, 0.75], '0,75 ч — три четверти часа: $0.75×60=45$ мин.']]);
    const opt = x => typeof x === 'number' ? L(nf(x) + ' min', nf(x) + ' мин') : L(x, x.replace(/h/g, 'ч').replace(/min/g, 'мин'));
    return { q: L('Parmi les durées suivantes, laquelle est égale à ' + I[0] + ' ?', 'Какая из длительностей равна ' + I[1] + '?'), ans: MQ(r, I[3].map(opt), 0), sol: [
      'В часе 60 минут, поэтому часть часа переводят в минуты умножением на 60.', I[4]] };
  } });

/* ---------- drawing kit for plane figures (maths coordinates, y up → screen) ---------- */
/* fit the points into a W×H picture with margins m (left/right) and my (top/bottom, = m by default); returns the map maths → screen */
function ppgFit(pts, W, H, m, my) {
  if (my == null) my = m;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = Math.min((W - 2 * m) / ((x1 - x0) || 1), (H - 2 * my) / ((y1 - y0) || 1));
  const ox = (W - k * (x1 - x0)) / 2 - k * x0, oy = (H + k * (y1 - y0)) / 2 + k * y0;
  const f = p => [ox + k * p[0], oy - k * p[1]]; f.k = k; return f;
}
/* label of the side P→Q of a polygon listed counter-clockwise (maths): placed outside, clear of the line */
function ppgSideLab(P, Q, s, gap) {
  const dx = Q[0] - P[0], dy = Q[1] - P[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, g = gap || 8;
  const a = nx > 0.5 ? 'start' : nx < -0.5 ? 'end' : 'middle';
  return ppgTxt((P[0] + Q[0]) / 2 + nx * g, (P[1] + Q[1]) / 2 + ny * g + (ny > 0.5 ? 12 : ny < -0.5 ? -3 : 5), s, a);
}
/* n small marks across the segment PQ (equal sides) */
function ppgTick(P, Q, n) {
  const dx = Q[0] - P[0], dy = Q[1] - P[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l; let h = '';
  for (let i = 0; i < n; i++) { const t = (i - (n - 1) / 2) * 5, cx = (P[0] + Q[0]) / 2 + ux * t, cy = (P[1] + Q[1]) / 2 + uy * t; h += ppgLn(cx + uy * 6, cy - ux * 6, cx - uy * 6, cy + ux * 6, 'fl'); }
  return h;
}
/* right-angle mark at corner C of the polygon, between the neighbours A and B (screen points) */
function ppgRA(C, A, B) {
  const u = [A[0] - C[0], A[1] - C[1]], v = [B[0] - C[0], B[1] - C[1]], lu = Math.hypot(u[0], u[1]), lv = Math.hypot(v[0], v[1]);
  return ppgRight(C[0], C[1], [u[0] / lu, u[1] / lu], [v[0] / lv, v[1] / lv], 9);
}
const ppgCirc = (c, rad, cls) => '<circle cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" r="' + rad.toFixed(1) + '" class="' + cls + '"/>';
const ppgU2 = (v, u) => nf(v) + ' ' + u;                                         /* a length label on a figure */

/* ---------- gm.perimetres-aires ---------- */
/* a rectangle W×H (or a square) with its marks; labels of the bottom and right sides */
function ppgRectFig(W, H, u, sq) {
  const P = [[0, 0], [W, 0], [W, H], [0, H]], f = ppgFit(P, 340, 200, 56, 34), S = P.map(f);
  let g = ppgShape(S);
  for (let i = 0; i < 4; i++) g += ppgRA(S[i], S[(i + 3) % 4], S[(i + 1) % 4]);
  g += ppgSideLab(S[0], S[1], ppgU2(W, u));
  if (sq) for (let i = 0; i < 4; i++) g += ppgTick(S[i], S[(i + 1) % 4], 1); else g += ppgSideLab(S[1], S[2], ppgU2(H, u));
  return svgFig(340, 200, g, sq ? 'carré' : 'rectangle');
}
/* an L-shaped figure: rectangle W×H with a w×h corner cut off at the top right; lab = which sides are labelled */
function ppgLFig(W, H, w, h, u, lab, cut) {
  const P = [[0, 0], [W, 0], [W, H - h], [W - w, H - h], [W - w, H], [0, H]], f = ppgFit(P, 340, 210, 56, 34), S = P.map(f);
  const len = [W, H - h, w, h, W - w, H];
  let g = ppgShape(S);
  for (let i = 0; i < 6; i++) { if (i !== 3) g += ppgRA(S[i], S[(i + 5) % 6], S[(i + 1) % 6]); if (lab.includes(i)) g += ppgSideLab(S[i], S[(i + 1) % 6], ppgU2(len[i], u)); }
  if (cut) g += ppgLn(f([0, H - h])[0], f([0, H - h])[1], S[3][0], S[3][1], 'fdash');
  return svgFig(340, 210, g, 'figure');
}
topic({ id: 'gm.perimetres-aires', ch: 'gm', lvl: 1, calc: false, variants: 4,
  ru: 'Периметр и площадь', fr: 'Périmètres et aires',
  hints: [
    'Периметр — длина всей границы фигуры (сумма длин сторон); это длина, в mm, cm, m. Площадь — сколько квадратиков 1 × 1 помещается внутри; она в mm², cm², m².',
    'Прямоугольник: $P=2×(L+l)$, $A=L×l$ — $l$ рядов по $L$ квадратиков. Треугольник: $A=b×h÷2$ — половина прямоугольника с той же основой и высотой; высота перпендикулярна основанию.',
    'Круг радиуса $r$: длина окружности $$2\\pi r$$ (или $$\\pi d$$), площадь $$\\pi r^2$$. Без калькулятора ответ оставляют с $$\\pi$$: например, $$9\\pi$$ cm².'],
  gen(r, vi) {
    if (vi === 0) {   /* rectangle or square */
      const sq = r() < 0.3, W = r.ri(3, 12); let H = sq ? W : r.ri(2, 9); if (!sq && H === W) H = W - 1;
      const u = r.pick(['cm', 'cm', 'm']), uR = ppgRu(u), area = r() < 0.6, nm = sq ? ['carré', 'квадрата'] : ['rectangle', 'прямоугольника'];
      const q = area ? L('Calculer l\'aire du ' + nm[0] + ' ci-dessous.', 'Вычисли площадь ' + nm[1] + ' на рисунке.') : L('Calculer le périmètre du ' + nm[0] + ' ci-dessous.', 'Вычисли периметр ' + nm[1] + ' на рисунке.');
      return { q, fig: ppgRectFig(W, H, u, sq), ans: area ? N(W * H, { unit: u + '²' }) : N(2 * (W + H), { unit: u }), sol: area
        ? [sq ? 'У квадрата все стороны равны (отмечены одинаковыми чёрточками).' : 'Противоположные стороны прямоугольника равны.', 'Площадь — сколько квадратиков 1 ' + uR + ' × 1 ' + uR + ' помещается внутри: ' + ppgPl(H, 'ряд', 'ряда', 'рядов') + ' по ' + W + ' квадратиков.', ['Площадь = длина × ширина:', W + '*' + H + '=' + W * H, u + '²']]
        : [sq ? 'У квадрата все 4 стороны равны (отмечены одинаковыми чёрточками).' : 'У прямоугольника две длины и две ширины: противоположные стороны равны.', ['Периметр — длина всей границы:', sq ? '4*' + W + '=' + 4 * W : '2*(' + W + '+' + H + ')=' + 2 * (W + H), u]] };
    }
    if (vi === 1) {   /* perimeter or area, and the unit (Métropole 2026, Q8 style) */
      const u = r.pick(['mm', 'cm']); let W, H, w, h, P, A, Lsh = r() < 0.5, g = 0;
      do { W = r.ri(5, 12); H = r.ri(3, 9); w = r.ri(2, W - 2); h = r.ri(1, H - 2); if (!Lsh) { w = 0; h = 0; } P = 2 * (W + H); A = W * H - w * h; } while ((P === A || W === H) && g++ < 50);
      const askP = r() < 0.6, fig = Lsh ? ppgLFig(W, H, w, h, u, [0, 1, 2, 3, 4, 5]) : ppgRectFig(W, H, u, false);
      const opts = [[P, u], [P, u + '²'], [A, u], [A, u + '²']].map(([v, uu]) => L(v + ' ' + uu, v + ' ' + ppgRu(uu)));
      return { q: askP ? L('Parmi les propositions suivantes, laquelle est le périmètre de la figure ci-dessous ?', 'Какой из вариантов — периметр фигуры на рисунке?') : L('Parmi les propositions suivantes, laquelle est l\'aire de la figure ci-dessous ?', 'Какой из вариантов — площадь фигуры на рисунке?'),
        fig, ans: MQ(r, opts, askP ? 0 : 3), sol: [
          Lsh ? ['Периметр — сумма длин всех шести сторон:', W + '+' + (H - h) + '+' + w + '+' + h + '+' + (W - w) + '+' + H + '=' + P, u] : ['Периметр — длина границы:', '2*(' + W + '+' + H + ')=' + P, u],
          Lsh ? ['Площадь: из прямоугольника ' + W + ' × ' + H + ' вырезан угол ' + w + ' × ' + h + ':', W + '*' + H + '-' + w + '*' + h + '=' + A, u + '²'] : ['Площадь:', W + '*' + H + '=' + A, u + '²'],
          'Периметр — это длина, поэтому он в ' + ppgRu(u) + '; площадь измеряют квадратиками, поэтому она в ' + ppgRu(u) + '². Ответ: ' + (askP ? P + ' ' + ppgRu(u) : A + ' ' + ppgRu(u) + '²') + '.' + (Lsh ? ' Заметь: «ступенька» не меняет периметр — её стороны можно сдвинуть наружу, и получится прямоугольник ' + W + ' × ' + H + ' с тем же периметром.' : '')] };
    }
    if (vi === 2) {   /* triangle with a height */
      const [ah, h, s] = r.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [9, 12, 15], [12, 5, 13], [12, 9, 15]]);
      let hb = r.ri(2, 8); if ((ah + hb) * h % 2) hb++;
      const b = ah + hb, P = [[0, 0], [b, 0], [ah, h]], f = ppgFit(P.concat([[ah, 0]]), 340, 220, 40), S = P.map(f), Hh = f([ah, 0]);
      let g = ppgShape(S) + ppgLn(S[2][0], S[2][1], Hh[0], Hh[1], 'fdash') + ppgRA(Hh, S[2], S[1]);
      const left = ah > hb, yl = Hh[1] + (S[2][1] - Hh[1]) * 0.4 + 5;   /* the height label goes on the wider side of [CH] */
      g += ppgSideLab(S[0], S[1], b + ' cm') + ppgSideLab(S[2], S[0], s + ' cm') + ppgTxt(Hh[0] + (left ? -7 : 7), yl, h + ' cm', left ? 'end' : 'start');
      g += ppgTxt(S[0][0] - 8, S[0][1] + 16, 'A') + ppgTxt(S[1][0] + 8, S[1][1] + 16, 'B') + ppgTxt(S[2][0], S[2][1] - 9, 'C') + ppgTxt(Hh[0] - 9, Hh[1] - 6, 'H');
      return { q: L('Calculer l\'aire, en cm², du triangle ABC ci-dessous. La hauteur issue de C est [CH].', 'Вычисли площадь треугольника ABC в см². Высота из вершины C — отрезок [CH].'),
        fig: svgFig(340, 220, g, 'triangle'), ans: N(b * h / 2, { unit: 'cm²' }), sol: [
          'Площадь треугольника — половина площади прямоугольника с тем же основанием и той же высотой: если достроить треугольник до прямоугольника ' + b + ' × ' + h + ', он займёт ровно половину.',
          ['Основание AB = ' + b + ' см, высота к нему CH = ' + h + ' см (она перпендикулярна AB):', b + '*' + h + '÷2=' + b * h / 2, 'cm²'],
          'Длина AC = ' + s + ' см здесь не нужна: в формулу входит высота — перпендикуляр, а не боковая сторона.'] };
    }
    /* vi 3: circle and π (exact values) */
    const kind = r.pick(['aire', 'cercle', 'patron']);
    const pi = v => '$$' + v + '\\pi$$';
    if (kind === 'aire') {
      const R = r.pick([3, 4, 5, 6, 7, 10]), cm = r.pick(['cm', 'm']), c = [170, 105];
      const g = ppgCirc(c, 85, 'ffill') + ppgCirc(c, 85, 'fl') + ppgDot(c[0], c[1]) + ppgLn(c[0], c[1], c[0] + 85, c[1], 'fl') + ppgTxt(c[0] + 42, c[1] - 8, R + ' ' + cm) + ppgTxt(c[0] - 8, c[1] + 18, 'O');
      const opts = [R * R, 2 * R, 4 * R * R, R].map(v => L(pi(v) + ' ' + cm + '²', pi(v) + ' ' + ppgRu(cm) + '²'));
      return { q: L('Quelle est l\'aire exacte d\'un disque de rayon ' + R + ' ' + cm + ' ?', 'Какова точная площадь круга радиуса ' + R + ' ' + ppgRu(cm) + '?'), fig: svgFig(340, 210, g, 'disque'), ans: MQ(r, opts, 0), sol: [
        { t: 'Площадь круга $$A=\\pi\\times r^2$$ — радиус возводится в квадрат:', tex: '\\pi\\times ' + R + '^2=' + R * R + '\\pi' + ppgUT(cm + '²') },
        '$$' + 2 * R + '\\pi$$ — это длина окружности ($$2\\pi r$$), а не площадь; $$' + 4 * R * R + '\\pi$$ получится, если по ошибке возвести в квадрат диаметр ' + 2 * R + ' вместо радиуса; $$' + R + '\\pi$$ — забыли возвести радиус в квадрат.'] };
    }
    if (kind === 'cercle') {
      const d = r.pick([6, 10, 12, 14, 20]), cm = r.pick(['cm', 'm']), c = [170, 105];
      const g = ppgCirc(c, 85, 'ffill') + ppgCirc(c, 85, 'fl') + ppgDot(c[0], c[1]) + ppgLn(c[0] - 85, c[1], c[0] + 85, c[1], 'fl') + ppgTxt(c[0] + 42, c[1] - 8, d + ' ' + cm) + ppgTxt(c[0], c[1] + 20, 'O');
      const opts = [d, d / 2, 2 * d, d * d / 4].map(v => L(pi(v) + ' ' + cm, pi(v) + ' ' + ppgRu(cm)));
      return { q: L('Quelle est la longueur exacte d\'un cercle de diamètre ' + d + ' ' + cm + ' ?', 'Какова точная длина окружности диаметра ' + d + ' ' + ppgRu(cm) + '?'), fig: svgFig(340, 210, g, 'cercle'), ans: MQ(r, opts, 0), sol: [
        { t: 'Длина окружности $$\\pi\\times d$$ (или $$2\\pi r$$ — то же самое, ведь $$d=2r$$):', tex: '\\pi\\times ' + d + '=' + d + '\\pi' + ppgUT(cm) },
        '$$' + d / 2 + '\\pi$$ — взяли радиус вместо диаметра; $$' + 2 * d + '\\pi$$ — умножили на 2 диаметр, а не радиус; $$' + d * d / 4 + '\\pi$$ — это площадь круга, а не длина окружности.'] };
    }
    /* the net of a cylinder (sujet de référence 2027 n°2, Q7 style) */
    const R = r.pick([3, 4, 5]), Hc = r.pick([5, 6, 7, 8, 10].filter(x => x !== 2 * R && x !== R));
    const Lr = 2 * Math.PI * R, P = [[0, 0], [Lr, 0], [Lr, Hc], [0, Hc]], f = ppgFit([[0, -2 * R], [Lr, Hc + 2 * R]], 340, 230, 22), S = P.map(f), k = f.k;
    let g = ppgShape(S) + ppgCirc(f([Lr / 2, Hc + R]), R * k, 'ffill') + ppgCirc(f([Lr / 2, Hc + R]), R * k, 'fl') + ppgCirc(f([Lr / 2, -R]), R * k, 'ffill') + ppgCirc(f([Lr / 2, -R]), R * k, 'fl');
    const cT = f([Lr / 2, Hc + R]);
    g += ppgDot(cT[0], cT[1]) + ppgLn(cT[0], cT[1], cT[0] + R * k, cT[1], 'fl') + ppgTxt(cT[0] + R * k + 6, cT[1] + 5, R + ' cm', 'start');
    g += ppgSideLab(S[3], S[0], Hc + ' cm');
    const yA = S[0][1] - 14; g += ppgLn(S[0][0] + 4, yA, S[1][0] - 4, yA, 'fl2') + ppgPath('M' + (S[0][0] + 10) + ' ' + (yA - 4) + ' L' + (S[0][0] + 4) + ' ' + yA + ' L' + (S[0][0] + 10) + ' ' + (yA + 4), 'fl2') + ppgPath('M' + (S[1][0] - 10) + ' ' + (yA - 4) + ' L' + (S[1][0] - 4) + ' ' + yA + ' L' + (S[1][0] - 10) + ' ' + (yA + 4), 'fl2') + ppgTxt((S[0][0] + S[1][0]) / 2, yA - 6, '?');
    const opts = [L(pi(2 * R) + ' cm', pi(2 * R) + ' см'), L(pi(R) + ' cm', pi(R) + ' см'), L(pi(R * R) + ' cm', pi(R * R) + ' см'), L(Hc + ' cm', Hc + ' см')];
    return { q: L('Un cylindre a pour rayon ' + R + ' cm et pour hauteur ' + Hc + ' cm. Quelle est la longueur exacte du rectangle de son patron ?', 'Радиус цилиндра ' + R + ' см, высота ' + Hc + ' см. Какова точная длина прямоугольника в его развёртке?'),
      fig: svgFig(340, 230, g, 'patron'), ans: MQ(r, opts, 0), sol: [
        'Прямоугольник развёртки — это боковая поверхность цилиндра. Когда её сворачивают, длина прямоугольника обходит круг основания ровно один раз.',
        { t: 'Значит, длина прямоугольника равна длине окружности основания:', tex: '2\\times\\pi\\times ' + R + '=' + 2 * R + '\\pi' + ppgUT('cm') + '\\approx ' + ppgTx(+ppgRd(2 * Math.PI * R, 1)) + ppgUT('cm') },
        'Высота ' + Hc + ' см — это ширина прямоугольника, а не длина; $$' + R * R + '\\pi$$ — площадь круга основания.'] };
  } });

/* ---------- gm.aires-composees ---------- */
topic({ id: 'gm.aires-composees', ch: 'gm', lvl: 2, calc: false, variants: 4,
  ru: 'Площадь составной фигуры', fr: 'Aires de figures composées',
  hints: [
    'Разрежь фигуру на знакомые части (прямоугольники, треугольники, полукруги) или дострой её до большой фигуры и вычти лишнее. Площадь целого = сумма площадей частей, которые не перекрываются.',
    'Недостающие размеры находи по рисунку: противоположные стороны прямоугольника равны, поэтому «ступенька» — это разность двух известных длин.',
    'Полукруг — половина круга: $$\\dfrac{\\pi r^2}{2}$$. Радиус — половина диаметра: не перепутай. С калькулятором считай с кнопкой $$\\pi$$ и округляй только в самом конце.'],
  gen(r, vi) {
    if (vi === 0) {   /* an L shape: two rectangles */
      const u = r.pick(['cm', 'm']), W = r.ri(6, 12), H = r.ri(5, 10), w = r.ri(2, W - 3), h = r.ri(2, H - 2);
      const A = W * H - w * h, A1 = W * (H - h), A2 = (W - w) * h;
      return { q: L('Calculer l\'aire de la figure ci-dessous. Tous ses angles sont droits.', 'Вычисли площадь фигуры на рисунке. Все её углы прямые.'), fig: ppgLFig(W, H, w, h, u, [0, 1, 4, 5]), ans: N(A, { unit: u + '²' }), sol: [
        { t: 'Разрежем фигуру пунктиром на два прямоугольника — нижний и верхний.', svg: ppgLFig(W, H, w, h, u, [0, 1, 4, 5], true) },
        ['Нижний прямоугольник: ' + W + ' на ' + (H - h) + ' (правая сторона):', W + '*' + (H - h) + '=' + A1, u + '²'],
        ['Верхний: ширина ' + (W - w) + ' (верхняя сторона), высота — то, что осталось от ' + H + ': $' + H + '-' + (H - h) + '=' + h + '$:', (W - w) + '*' + h + '=' + A2, u + '²'],
        ['Части не перекрываются — площади складываем:', A1 + '+' + A2 + '=' + A, u + '²'],
        'Другой способ: прямоугольник ' + W + ' × ' + H + ' минус вырезанный угол ' + w + ' × ' + h + ': $' + W * H + '-' + w * h + '=' + A + '$.'] };
    }
    if (vi === 1) {   /* a house: rectangle + triangle */
      const u = r.pick(['m', 'cm']); let W = r.ri(4, 10), H = r.ri(3, 7), t = r.ri(2, 5); if (W * t % 2) W++;
      const P = [[0, 0], [W, 0], [W, H], [W / 2, H + t], [0, H]], f = ppgFit(P.concat([[W * 1.25, 0]]), 340, 220, 52, 34), S = P.map(f), M = f([W / 2, H]);
      let g = ppgShape(S) + ppgLn(S[2][0], S[2][1], S[4][0], S[4][1], 'fdash') + ppgLn(S[3][0], S[3][1], M[0], M[1], 'fdash') + ppgRA(M, S[3], S[2]) + ppgRA(S[0], S[4], S[1]) + ppgRA(S[1], S[0], S[2]);
      const xd = S[2][0] + 22;   /* the height of the roof as a dimension line outside, on the right */
      g += ppgLn(S[3][0] + 4, S[3][1], xd + 5, S[3][1], 'fl2') + ppgLn(S[2][0] + 4, S[2][1], xd + 5, S[2][1], 'fl2') + ppgLn(xd, S[3][1], xd, S[2][1], 'fl');
      g += ppgSideLab(S[0], S[1], ppgU2(W, u)) + ppgSideLab(S[1], S[2], ppgU2(H, u)) + ppgTxt(xd + 7, (S[2][1] + S[3][1]) / 2 + 5, ppgU2(t, u), 'start');
      const Ar = W * H, At = W * t / 2;
      return { q: L('La figure ci-dessous est formée d\'un rectangle et d\'un triangle isocèle. Calculer son aire.', 'Фигура на рисунке состоит из прямоугольника и равнобедренного треугольника. Вычисли её площадь.'), fig: svgFig(340, 220, g, 'maison'), ans: N(Ar + At, { unit: u + '²' }), sol: [
        ['Прямоугольник ' + W + ' × ' + H + ':', W + '*' + H + '=' + Ar, u + '²'],
        ['Треугольник: основание — верхняя сторона прямоугольника (' + W + '), высота — пунктир от вершины до основания, ' + t + ' (размер справа):', W + '*' + t + '÷2=' + At, u + '²'],
        ['Вся фигура:', Ar + '+' + At + '=' + (Ar + At), u + '²']] };
    }
    if (vi === 2) {   /* rectangle + half-disc (calculator) */
      const Wd = r.pick([4, 6, 8, 10, 12]), Lr = r.pick([6, 8, 9, 10, 12, 15].filter(x => x !== Wd)), R = Wd / 2, u = 'cm';
      const P = [[0, 0], [Lr, 0], [Lr + R, R], [Lr, Wd], [0, Wd]], f = ppgFit(P, 340, 200, 56, 34), k = f.k;
      const S = [[0, 0], [Lr, 0], [Lr, Wd], [0, Wd]].map(f);
      const d = 'M' + S[0][0].toFixed(1) + ' ' + S[0][1].toFixed(1) + ' L' + S[1][0].toFixed(1) + ' ' + S[1][1].toFixed(1) + ' A' + (R * k).toFixed(1) + ' ' + (R * k).toFixed(1) + ' 0 0 0 ' + S[2][0].toFixed(1) + ' ' + S[2][1].toFixed(1) + ' L' + S[3][0].toFixed(1) + ' ' + S[3][1].toFixed(1) + ' Z';
      let g = ppgPath(d, 'ffill') + ppgPath(d, 'fl') + ppgLn(S[1][0], S[1][1], S[2][0], S[2][1], 'fdash') + ppgRA(S[0], S[3], S[1]) + ppgRA(S[3], S[2], S[0]);
      g += ppgSideLab(S[0], S[1], ppgU2(Lr, u)) + ppgSideLab(S[3], S[0], ppgU2(Wd, u));
      const Ar = Lr * Wd, Ad = Math.PI * R * R / 2, A = Ar + Ad;
      return { q: L('La figure ci-dessous est formée d\'un rectangle et d\'un demi-disque. Calculer son aire, arrondie au dixième de cm².', 'Фигура на рисунке состоит из прямоугольника и полукруга. Вычисли её площадь, округлив до десятых см².'), fig: svgFig(340, 200, g, 'figure'), calc: true,
        ans: N(ppgRd(A, 1), { dp: 1, unit: 'cm²' }), sol: [
          ['Прямоугольник ' + Lr + ' × ' + Wd + ':', Lr + '*' + Wd + '=' + Ar, 'cm²'],
          { t: 'Полукруг: его диаметр — правая сторона прямоугольника, ' + Wd + ' см, значит, радиус ' + nf(R) + ' см. Площадь — половина площади круга:', tex: '\\dfrac{\\pi\\times ' + ppgTx(R) + '^2}{2}\\approx ' + ppgTx(+ppgRd(Ad, 3)) + ppgUT('cm²') },
          { t: 'Складываем и только в конце округляем до десятых:', tex: ppgTx(Ar) + '+' + ppgTx(+ppgRd(Ad, 3)) + '\\approx ' + ppgTx(+ppgRd(A, 1)) + ppgUT('cm²') },
          'Частая ошибка — взять радиус ' + Wd + ' вместо ' + nf(R) + ': ' + Wd + ' — это диаметр полукруга.'] };
    }
    /* vi 3: a square with a round hole (calculator) */
    const c = r.pick([6, 8, 10, 12, 20]), rad = r.pick([1, 2, 3, 4, 5].filter(x => 2 * x < c - 1)), u = 'cm';
    const f = ppgFit([[0, 0], [c, c]], 340, 210, 34), k = f.k, S = [[0, 0], [c, 0], [c, c], [0, c]].map(f), O = f([c / 2, c / 2]);
    const sq = 'M' + S.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ' Z', ci = 'M' + (O[0] - rad * k).toFixed(1) + ' ' + O[1].toFixed(1) + ' a' + (rad * k).toFixed(1) + ' ' + (rad * k).toFixed(1) + ' 0 1 0 ' + (2 * rad * k).toFixed(1) + ' 0 a' + (rad * k).toFixed(1) + ' ' + (rad * k).toFixed(1) + ' 0 1 0 ' + (-2 * rad * k).toFixed(1) + ' 0 Z';
    let g = '<path d="' + sq + ' ' + ci + '" fill-rule="evenodd" class="ffill"/>' + ppgPath(sq, 'fl') + ppgCirc(O, rad * k, 'fl') + ppgDot(O[0], O[1]) + ppgLn(O[0], O[1], O[0] + rad * k, O[1], 'fl');
    for (let i = 0; i < 4; i++) g += ppgRA(S[i], S[(i + 3) % 4], S[(i + 1) % 4]) + ppgTick(S[i], S[(i + 1) % 4], 1);
    g += ppgSideLab(S[0], S[1], ppgU2(c, u)) + ppgTxt(O[0] + rad * k / 2, O[1] - 7, ppgU2(rad, u));
    const A = c * c - Math.PI * rad * rad;
    return { q: L('Dans une plaque carrée de côté ' + c + ' cm, on découpe un disque de rayon ' + rad + ' cm (voir la figure). Calculer l\'aire de la plaque restante, arrondie au dixième de cm².', 'Из квадратной пластины со стороной ' + c + ' см вырезали круг радиуса ' + rad + ' см (см. рисунок). Вычисли площадь оставшейся части, округлив до десятых см².'),
      fig: svgFig(340, 210, g, 'plaque'), calc: true, ans: N(ppgRd(A, 1), { dp: 1, unit: 'cm²' }), sol: [
        'Осталась часть квадрата без круга: площадь = площадь квадрата − площадь круга.',
        ['Квадрат:', c + '*' + c + '=' + c * c, 'cm²'],
        { t: 'Круг:', tex: '\\pi\\times ' + rad + '^2\\approx ' + ppgTx(+ppgRd(Math.PI * rad * rad, 3)) + ppgUT('cm²') },
        { t: 'Разность, округлённая до десятых:', tex: c * c + '-' + ppgTx(+ppgRd(Math.PI * rad * rad, 3)) + '\\approx ' + ppgTx(+ppgRd(A, 1)) + ppgUT('cm²') }] };
  } });

/* ---------- solids in cavalier perspective: depth z drawn at ~35°, shortened ---------- */
const ppgP3 = (x, y, z) => [x + 0.45 * z, y + 0.32 * z];
/* edges: [[p, q, hidden?], …] in 3D; faces: lists of 3D points to tint; labs: [[p, q, text, outsideSign]] */
function ppgSolid(edges, faces, labs, extra, W, H) {
  const all = []; edges.forEach(e => { all.push(ppgP3(...e[0]), ppgP3(...e[1])); });
  const f = ppgFit(all, W || 340, H || 220, 40), m = p => f(ppgP3(...p));
  let g = faces.map(fc => ppgPg(fc.map(m), 'ffill')).join('');
  edges.forEach(([p, q, hid]) => { const a = m(p), b = m(q); g += ppgLn(a[0], a[1], b[0], b[1], hid ? 'fdash' : 'fl'); });
  labs.forEach(([p, q, s, sg]) => { const a = m(p), b = m(q); g += sg > 0 ? ppgSideLab(a, b, s) : ppgSideLab(b, a, s); });
  return svgFig(W || 340, H || 220, g + (extra ? extra(m, f) : ''), 'solide');
}
function ppgBoxFig(a, b, c, u) {
  const P = (x, y, z) => [x * a, y * c, z * b];
  const E = [[P(0, 0, 0), P(1, 0, 0)], [P(1, 0, 0), P(1, 1, 0)], [P(1, 1, 0), P(0, 1, 0)], [P(0, 1, 0), P(0, 0, 0)], [P(0, 1, 0), P(0, 1, 1)], [P(1, 1, 0), P(1, 1, 1)], [P(0, 1, 1), P(1, 1, 1)],
    [P(1, 0, 0), P(1, 0, 1)], [P(1, 0, 1), P(1, 1, 1)], [P(0, 0, 0), P(0, 0, 1), 1], [P(0, 0, 1), P(1, 0, 1), 1], [P(0, 0, 1), P(0, 1, 1), 1]];
  const F = [[P(0, 0, 0), P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)], [P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)], [P(1, 0, 0), P(1, 0, 1), P(1, 1, 1), P(1, 1, 0)]];
  return ppgSolid(E, F, [[P(0, 0, 0), P(1, 0, 0), ppgU2(a, u), 1], [P(0, 1, 0), P(0, 0, 0), ppgU2(c, u), 1], [P(1, 0, 0), P(1, 0, 1), ppgU2(b, u), 1]]);
}
function ppgPrismFig(a, c, Lp, u) {   /* right triangle (legs a, c) in front, length Lp backwards */
  const E = [[[0, 0, 0], [a, 0, 0]], [[a, 0, 0], [0, c, 0]], [[0, c, 0], [0, 0, 0]], [[0, c, 0], [0, c, Lp]], [[a, 0, 0], [a, 0, Lp]], [[0, c, Lp], [a, 0, Lp]],
    [[0, 0, 0], [0, 0, Lp], 1], [[0, 0, Lp], [a, 0, Lp], 1], [[0, 0, Lp], [0, c, Lp], 1]];
  const F = [[[0, 0, 0], [a, 0, 0], [0, c, 0]], [[a, 0, 0], [a, 0, Lp], [0, c, Lp], [0, c, 0]]];
  return ppgSolid(E, F, [[[0, 0, 0], [a, 0, 0], ppgU2(a, u), 1], [[0, c, 0], [0, 0, 0], ppgU2(c, u), 1], [[a, 0, 0], [a, 0, Lp], ppgU2(Lp, u), 1]],
    m => { const O = m([0, 0, 0]); return ppgRA(O, m([0, c, 0]), m([a, 0, 0])); });
}
function ppgPyrFig(c, h, u) {   /* square base c×c on the ground, apex above the centre */
  const T = [c / 2, h, c / 2], B = [[0, 0, 0], [c, 0, 0], [c, 0, c], [0, 0, c]];
  const E = [[B[0], B[1]], [B[1], B[2]], [B[2], B[3], 1], [B[3], B[0], 1], [T, B[0]], [T, B[1]], [T, B[2]], [T, B[3], 1], [T, [c / 2, 0, c / 2], 1]];
  const F = [[T, B[0], B[1]], [T, B[1], B[2]]];
  return ppgSolid(E, F, [[B[0], B[1], ppgU2(c, u), 1]], m => { const p = m(T), q = m([c / 2, 0, c / 2]); return ppgDot(q[0], q[1]) + ppgTxt(p[0] + 6, p[1] + (q[1] - p[1]) * 0.45 + 5, 'h', 'start', 'ftx', 16); });
}
/* round solids drawn directly on the screen: kind 'cyl' | 'cone' | 'ball'; the picture is as tall as it needs */
function ppgRoundFig(kind, R, H, u) {
  const k = kind === 'ball' ? 80 / R : Math.min(100 / R, 140 / H), rx = R * k, ry = rx * 0.32, cx = 170;
  const half = (y, up, cls) => '<path d="M' + (cx - rx).toFixed(1) + ' ' + y.toFixed(1) + ' A' + rx.toFixed(1) + ' ' + ry.toFixed(1) + ' 0 0 ' + (up ? 1 : 0) + ' ' + (cx + rx).toFixed(1) + ' ' + y.toFixed(1) + '" class="' + cls + '"/>';
  const ell = (y, cls) => '<ellipse cx="' + cx + '" cy="' + y.toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" class="' + cls + '"/>';
  let g = '';
  if (kind === 'ball') {
    const cy = 110, ex = cx + rx * Math.cos(0.6), ey = cy - rx * Math.sin(0.6);   /* the radius goes up to the right, clear of the equator */
    g += ppgCirc([cx, cy], rx, 'ffill') + ppgCirc([cx, cy], rx, 'fl') + half(cy, false, 'fl') + half(cy, true, 'fdash') + ppgDot(cx, cy) + ppgLn(cx, cy, ex, ey, 'fl') + ppgTxt((cx + ex) / 2 - 6, (cy + ey) / 2 - 8, ppgU2(R, u), 'end');
    return svgFig(340, 220, g, 'boule');
  }
  if (kind === 'cyl') {
    const ty = 26 + ry, by = ty + H * k;
    g += '<path d="M' + (cx - rx).toFixed(1) + ' ' + ty.toFixed(1) + ' L' + (cx - rx).toFixed(1) + ' ' + by.toFixed(1) + ' A' + rx.toFixed(1) + ' ' + ry.toFixed(1) + ' 0 0 0 ' + (cx + rx).toFixed(1) + ' ' + by.toFixed(1) + ' L' + (cx + rx).toFixed(1) + ' ' + ty.toFixed(1) + ' Z" class="ffill"/>';
    g += ell(ty, 'ffill') + ell(ty, 'fl') + ppgLn(cx - rx, ty, cx - rx, by, 'fl') + ppgLn(cx + rx, ty, cx + rx, by, 'fl') + half(by, false, 'fl') + half(by, true, 'fdash');
    g += ppgDot(cx, ty) + ppgLn(cx, ty, cx + rx, ty, 'fl') + ppgTxt(cx + rx / 2, ty - ry - 6, ppgU2(R, u)) + ppgTxt(cx + rx + 8, (ty + by) / 2 + 5, ppgU2(H, u), 'start');
    return svgFig(340, Math.round(by + ry + 10), g, 'cylindre');
  }
  const ty = 14, by = ty + H * k;
  g += '<path d="M' + cx + ' ' + ty.toFixed(1) + ' L' + (cx - rx).toFixed(1) + ' ' + by.toFixed(1) + ' A' + rx.toFixed(1) + ' ' + ry.toFixed(1) + ' 0 0 0 ' + (cx + rx).toFixed(1) + ' ' + by.toFixed(1) + ' Z" class="ffill"/>';
  g += ppgLn(cx, ty, cx - rx, by, 'fl') + ppgLn(cx, ty, cx + rx, by, 'fl') + half(by, false, 'fl') + half(by, true, 'fdash') + ppgLn(cx, ty, cx, by, 'fdash') + ppgDot(cx, by);
  g += ppgLn(cx, by, cx + rx, by, 'fl') + ppgTxt(cx + rx / 2, by + ry + 18, ppgU2(R, u)) + ppgTxt(cx + 6, ty + (by - ty) * 0.6 + 5, 'h', 'start', 'ftx', 16);
  return svgFig(340, Math.round(by + ry + 26), g, 'cône');
}

/* ---------- gm.volumes ---------- */
topic({ id: 'gm.volumes', ch: 'gm', lvl: 2, calc: false, variants: 5,
  ru: 'Объёмы тел', fr: 'Volumes des solides',
  hints: [
    '«Прямые» тела — куб, прямоугольный параллелепипед («pavé droit»), призма, цилиндр: объём = площадь основания × высота. Тело — это стопка одинаковых слоёв толщиной 1, и в каждом слое столько кубиков 1×1×1, какова площадь основания.',
    'Пирамида и конус занимают ровно треть «своей» призмы или цилиндра с тем же основанием и той же высотой: $$V=\\dfrac{B\\times h}{3}$$. Шар: $$V=\\dfrac{4}{3}\\pi R^3$$. Эти формулы на экзамене обычно напоминают в условии.',
    'Все длины — в одних единицах; ответ — в кубических: cm × cm × cm = cm³. С $$\\pi$$ считай на калькуляторе и округляй только в конце.'],
  gen(r, vi) {
    if (vi === 0) {   /* a box or a cube, multiple choice (Asie 2026, Q3 style) */
      if (r() < 0.3) {
        const a = r.pick([3, 4, 5, 10]), opts = [a * a * a, a * a, 6 * a * a, 12 * a].map(v => L(nf(v) + ' cm³', nf(v) + ' см³'));
        return { q: L('Quel est le volume d\'un cube d\'arête ' + a + ' cm ?', 'Каков объём куба с ребром ' + a + ' см?'), fig: ppgBoxFig(a, a, a, 'cm'), ans: MQ(r, opts, 0), sol: [
          ['Куб — параллелепипед, у которого все рёбра равны: в нём ' + a + ' слоя(ёв) по $' + a + '×' + a + '$ кубиков 1 см³:', a + '*' + a + '*' + a + '=' + a * a * a, 'cm³'],
          a * a + ' см² — площадь одной грани, ' + 6 * a * a + ' см² — площадь всей поверхности (6 граней), ' + 12 * a + ' см — сумма длин 12 рёбер. Это не объём.'] };
      }
      let A, B, C, g = 0, vals;
      do { A = r.pick([4.5, 2.5, 3, 5, 6, 8, 1.5, 7]); B = r.pick([4, 2, 6, 3]); C = r.pick([10, 4, 5, 2, 3]); vals = [A * B * C, A + B + C, 2 * (A * B + B * C + A * C), A * B].map(v => +fx(v)); } while (new Set(vals).size < 4 && g++ < 50);
      return { q: L('Quel est le volume d\'un pavé droit de longueur ' + nf(A) + ' cm, de largeur ' + B + ' cm et de hauteur ' + C + ' cm ?', 'Каков объём прямоугольного параллелепипеда длиной ' + nf(A) + ' см, шириной ' + B + ' см и высотой ' + C + ' см?'),
        fig: ppgBoxFig(A, B, C, 'cm'), ans: MQ(r, vals.map(v => L(nf(v) + ' cm³', nf(v) + ' см³')), 0), sol: [
          ['Объём параллелепипеда = длина × ширина × высота (площадь основания × высота):', fx(A) + '*' + B + '*' + C + '=' + fx(vals[0]), 'cm³'],
          nf(vals[1]) + ' см — сумма трёх измерений, ' + nf(vals[2]) + ' см² — площадь всей поверхности, ' + nf(vals[3]) + ' см² — площадь основания. Это не объём: объём — произведение трёх измерений, в см³.'] };
    }
    if (vi === 1) {   /* a triangular prism */
      let a = r.pick([3, 4, 5, 6, 8]), c = r.pick([2, 3, 4, 5, 6]); const Lp = r.pick([5, 6, 8, 10, 12, 15]); if (a * c % 2) c++;
      const B = a * c / 2;
      return { q: L('Calculer le volume du prisme droit ci-dessous, dont la base est un triangle rectangle.', 'Вычисли объём прямой призмы на рисунке; её основание — прямоугольный треугольник.'), fig: ppgPrismFig(a, c, Lp, 'cm'), ans: N(B * Lp, { unit: 'cm³' }), sol: [
        'Объём призмы = площадь основания × высота: призма — это стопка одинаковых треугольных слоёв. Основание — треугольник спереди, высота призмы — ребро ' + Lp + ' см, перпендикулярное основанию.',
        ['Площадь основания — половина прямоугольника ' + a + ' × ' + c + ':', a + '*' + c + '÷2=' + B, 'cm²'],
        ['Объём:', B + '*' + Lp + '=' + B * Lp, 'cm³']] };
    }
    if (vi === 2) {   /* cylinder, calculator */
      const R = r.pick([2, 3, 4, 5, 1.5, 2.5]), H = r.pick([4, 5, 6, 8, 10, 12]), V = Math.PI * R * R * H;
      return { q: L('Calculer le volume d\'un cylindre de rayon ' + nf(R) + ' cm et de hauteur ' + H + ' cm. Arrondir au cm³. On rappelle : $$V=\\pi\\times R^2\\times h$$.', 'Вычисли объём цилиндра радиуса ' + nf(R) + ' см и высоты ' + H + ' см. Округли до 1 см³. Напоминание: $$V=\\pi\\times R^2\\times h$$.'),
        fig: ppgRoundFig('cyl', R, H, 'cm'), calc: true, ans: N(ppgRd(V, 0), { dp: 0, unit: 'cm³' }), sol: [
          'Цилиндр — тоже «прямое» тело: площадь круга-основания × высота.',
          { t: 'Площадь основания:', tex: '\\pi\\times ' + ppgTx(R) + '^2=' + ppgTx(R * R) + '\\pi' + ppgUT('cm²') },
          { t: 'Объём; округляем до целых только в конце:', tex: ppgTx(R * R) + '\\pi\\times ' + H + '=' + ppgTx(R * R * H) + '\\pi\\approx ' + ppgTx(+ppgRd(V, 0)) + ppgUT('cm³') },
          'Частая ошибка — не возвести радиус в квадрат или подставить диаметр вместо радиуса.'] };
    }
    if (vi === 3) {   /* pyramid (mental) or cone (calculator) */
      if (r() < 0.55) {
        let c, h, g = 0; do { c = r.pick([3, 4, 5, 6, 9, 10, 12]); h = r.pick([3, 5, 6, 9, 10, 12, 4]); } while ((c * c * h) % 3 && g++ < 50);
        const B = c * c, V = B * h / 3;
        return { q: L('Une pyramide a pour base un carré de côté ' + c + ' cm et pour hauteur ' + h + ' cm. Calculer son volume. On rappelle : $$V=\\dfrac{B\\times h}{3}$$, où $B$ est l\'aire de la base.', 'Основание пирамиды — квадрат со стороной ' + c + ' см, высота пирамиды ' + h + ' см. Вычисли её объём. Напоминание: $$V=\\dfrac{B\\times h}{3}$$, где $B$ — площадь основания.'),
          fig: ppgPyrFig(c, h, 'cm'), ans: N(V, { unit: 'cm³' }), sol: [
            ['Площадь основания — квадрат:', c + '*' + c + '=' + B, 'cm²'],
            ['Объём пирамиды — треть объёма призмы с тем же основанием и той же высотой:', B + '*' + h + '÷3=' + V, 'cm³'],
            'Почему треть: куб можно разрезать на 3 одинаковые пирамиды с вершиной в одном углу куба — у каждой основание и высота такие же, как у куба.'] };
      }
      const R = r.pick([2, 3, 4, 5, 6]), H = r.pick([4, 5, 6, 8, 9, 10, 12]), V = Math.PI * R * R * H / 3;
      return { q: L('Calculer le volume d\'un cône de révolution de rayon ' + R + ' cm et de hauteur ' + H + ' cm. Arrondir au cm³. On rappelle : $$V=\\dfrac{\\pi\\times R^2\\times h}{3}$$.', 'Вычисли объём конуса радиуса ' + R + ' см и высоты ' + H + ' см. Округли до 1 см³. Напоминание: $$V=\\dfrac{\\pi\\times R^2\\times h}{3}$$.'),
        fig: ppgRoundFig('cone', R, H, 'cm'), calc: true, ans: N(ppgRd(V, 0), { dp: 0, unit: 'cm³' }), sol: [
          'Конус — треть цилиндра с тем же основанием и той же высотой.',
          { t: 'Подставляем в формулу:', tex: '\\dfrac{\\pi\\times ' + R + '^2\\times ' + H + '}{3}=' + ppgTx(R * R * H / 3) + '\\pi\\approx ' + ppgTx(+ppgRd(V, 0)) + ppgUT('cm³') },
          'Не забудь разделить на 3: без деления получится объём цилиндра, а не конуса.'] };
    }
    /* vi 4: a ball (Métropole 2026, ex. 3 style) */
    const R = r.pick([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 10, 12]), V = 4 / 3 * Math.PI * Math.pow(R, 3);
    return { q: L('Calculer le volume d\'une boule de rayon ' + nf(R) + ' cm, arrondi au cm³. On rappelle : $$V=\\dfrac{4}{3}\\times\\pi\\times R^3$$.', 'Вычисли объём шара радиуса ' + nf(R) + ' см, округлив до 1 см³. Напоминание: $$V=\\dfrac{4}{3}\\times\\pi\\times R^3$$.'),
      fig: ppgRoundFig('ball', R, 0, 'cm'), calc: true, ans: N(ppgRd(V, 0), { dp: 0, unit: 'cm³' }), sol: [
        { t: 'Радиус возводим в куб:', tex: ppgTx(R) + '^3=' + ppgTx(+fx(Math.pow(R, 3))) },
        { t: 'Подставляем в формулу и округляем в конце:', tex: '\\dfrac{4}{3}\\times\\pi\\times ' + ppgTx(+fx(Math.pow(R, 3))) + '\\approx ' + ppgTx(+ppgRd(V, 0)) + ppgUT('cm³') },
        'Частая ошибка — $$R^3$$ считать как $$3\\times R$$ или забыть множитель $$\\dfrac{4}{3}$$.'] };
  } });

/* ---------- why areas ×k² and volumes ×k³: pictures for the solutions ---------- */
function ppgWhySq(k) {   /* a unit square and the k×k square made of k² unit squares */
  const s = 30, H = s * k + 40, y0 = H - 22; let g = '';
  g += ppgShape([[40, y0], [40 + s, y0], [40 + s, y0 - s], [40, y0 - s]]) + ppgTxt(40 + s / 2, y0 + 17, '1');
  const x0 = 170; g += ppgShape([[x0, y0], [x0 + s * k, y0], [x0 + s * k, y0 - s * k], [x0, y0 - s * k]]);
  for (let i = 1; i < k; i++) g += ppgLn(x0 + s * i, y0, x0 + s * i, y0 - s * k, 'fl2') + ppgLn(x0, y0 - s * i, x0 + s * k, y0 - s * i, 'fl2');
  g += ppgTxt(x0 + s * k / 2, y0 + 17, String(k)) + ppgLn(85, y0 - s / 2, 150, y0 - s / 2, 'fl2') + ppgPath('M143 ' + (y0 - s / 2 - 5) + ' L150 ' + (y0 - s / 2) + ' L143 ' + (y0 - s / 2 + 5), 'fl2') + ppgTxt(117, y0 - s / 2 - 8, '× ' + k);
  return svgFig(340, H, g, 'carreaux');
}
function ppgWhyCube(k) {   /* a unit cube and the k×k×k cube made of k³ unit cubes */
  const s = k > 2 ? 26 : 34, H = Math.round(s * k * 1.32 + 40), M = (ox, oy) => (x, y, z) => [ox + s * (x + 0.45 * z), oy - s * (y + 0.32 * z)];
  const cube = (m, n, grid) => {
    const P = (x, y, z) => m(x * n, y * n, z * n);
    let g = ppgPg([P(0, 0, 0), P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)], 'ffill') + ppgPg([P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)], 'ffill') + ppgPg([P(1, 0, 0), P(1, 0, 1), P(1, 1, 1), P(1, 1, 0)], 'ffill');
    if (grid) for (let i = 1; i < n; i++) {
      const L2 = (a, b) => ppgLn(m(...a)[0], m(...a)[1], m(...b)[0], m(...b)[1], 'fl2');
      g += L2([i, 0, 0], [i, n, 0]) + L2([0, i, 0], [n, i, 0]) + L2([i, n, 0], [i, n, n]) + L2([0, n, i], [n, n, i]) + L2([n, i, 0], [n, i, n]) + L2([n, 0, i], [n, n, i]);
    }
    [[[0, 0, 0], [1, 0, 0]], [[1, 0, 0], [1, 1, 0]], [[1, 1, 0], [0, 1, 0]], [[0, 1, 0], [0, 0, 0]], [[0, 1, 0], [0, 1, 1]], [[1, 1, 0], [1, 1, 1]], [[0, 1, 1], [1, 1, 1]], [[1, 0, 0], [1, 0, 1]], [[1, 0, 1], [1, 1, 1]]]
      .forEach(([a, b]) => { const p = P(...a), q = P(...b); g += ppgLn(p[0], p[1], q[0], q[1], 'fl'); });
    return g;
  };
  const y0 = H - 22; let g = cube(M(40, y0), 1, false) + ppgTxt(40 + s / 2, y0 + 17, '1') + cube(M(165, y0), k, true) + ppgTxt(165 + s * k / 2, y0 + 17, String(k));
  g += ppgLn(40 + s * 1.6, y0 - s / 2, 150, y0 - s / 2, 'fl2') + ppgPath('M143 ' + (y0 - s / 2 - 5) + ' L150 ' + (y0 - s / 2) + ' L143 ' + (y0 - s / 2 + 5), 'fl2') + ppgTxt((40 + s * 1.6 + 150) / 2, y0 - s / 2 - 8, '× ' + k);
  return svgFig(340, H, g, 'cubes');
}
const ppgKtx = f => f.d === 1 ? String(f.n) : '(' + Fr.str(f) + ')';   /* k in input syntax: 3 or (1/2) */
const ppgKfr = f => f.d === 1 ? String(f.n) : '$' + Fr.str(f) + '$';   /* k in a text */
/* why the areas (p = 2) or volumes (p = 3) are multiplied by k^p: a sentence and, for small k, a picture */
function ppgWhyK(kf, p) {
  const up = kf.n > kf.d, n = up ? kf.n / kf.d : kf.d / kf.n, kp = F(Math.pow(kf.n, p), Math.pow(kf.d, p)), w = p === 2 ? ['квадратик со стороной 1', 'квадрат со стороной', 'квадратиков'] : ['кубик с ребром 1', 'куб с ребром', 'кубиков'];
  let t;
  if (up && Number.isInteger(n)) t = 'Все длины умножаются на ' + n + '. ' + w[0][0].toUpperCase() + w[0].slice(1) + ' превращается в ' + w[1] + ' ' + n + ', а в нём $' + Array(p).fill(n).join('×') + '=' + Math.pow(n, p) + '$ ' + w[2] + (n <= (p === 2 ? 4 : 3) ? ' (см. рисунок)' : '') + '. Поэтому ' + (p === 2 ? 'площадь' : 'объём') + ' умножается на $k^' + p + '$.';
  else if (up) t = 'Все длины умножаются на ' + ppgKfr(kf) + '. ' + w[0][0].toUpperCase() + w[0].slice(1) + ' превращается в ' + w[1] + ' ' + ppgKfr(kf) + ', ' + (p === 2 ? 'его площадь' : 'его объём') + ' $' + ppgKtx(kf) + '^' + p + '=' + Fr.str(kp) + '$. Поэтому ' + (p === 2 ? 'площадь' : 'объём') + ' умножается на $k^' + p + '$.';
  else t = 'Все длины умножаются на ' + ppgKfr(kf) + ', то есть уменьшаются в ' + ppgPl(n, 'раз', 'раза', 'раз') + '. Это рисунок «наоборот», справа налево: ' + w[1] + ' ' + n + ', в котором ' + Math.pow(n, p) + ' ' + w[2] + ', превращается в один ' + w[0] + '. Поэтому ' + (p === 2 ? 'площадь' : 'объём') + ' уменьшается в ' + Math.pow(n, p) + ' раз — умножается на $k^' + p + '=' + Fr.str(kp) + '$.';
  const o = { t }; if (Number.isInteger(n) && n <= (p === 2 ? 4 : 3)) o.svg = p === 2 ? ppgWhySq(n) : ppgWhyCube(n);
  return o;
}

/* ---------- gm.agrandissement ---------- */
topic({ id: 'gm.agrandissement', ch: 'gm', lvl: 2, calc: false, variants: 3,
  ru: 'Увеличение и уменьшение: длины, площади, объёмы', fr: 'Agrandissement et réduction',
  hints: [
    'При увеличении или уменьшении с коэффициентом $k$ («agrandissement ou réduction de rapport $k$») все длины умножаются на $k$, а углы не меняются. $k>1$ — увеличение, $k<1$ — уменьшение.',
    'Площади умножаются на $k^2$: квадратик со стороной 1 превращается в квадрат со стороной $k$, в котором помещается $k×k$ таких квадратиков. При $k=3$ площадь растёт в 9 раз, а не в 3.',
    'Объёмы умножаются на $k^3$: кубик с ребром 1 превращается в куб с ребром $k$ — это $k×k×k$ кубиков. При уменьшении с $k=1/2$ площадь умножается на $1/4$, объём — на $1/8$.'],
  gen(r, vi) {
    const word = up => up ? ['subit un agrandissement de rapport', 'увеличили с коэффициентом'] : ['subit une réduction de rapport', 'уменьшили с коэффициентом'];
    if (vi === 0) {   /* lengths and areas */
      const kf = r.pick([F(2), F(3), F(4), F(1, 2), F(1, 3), F(3, 2), F(5)]), up = kf.n > kf.d, kv = kf.n / kf.d, w = word(up);
      const sh = r.pick([['Un rectangle', 'Прямоугольник', 'du rectangle obtenu', 'полученного прямоугольника'], ['Un triangle', 'Треугольник', 'du triangle obtenu', 'полученного треугольника'], ['Un logo', 'Логотип', 'du logo obtenu', 'полученного логотипа']]);
      if (r() < 0.7) {
        const A0 = kf.d * kf.d * r.pick([2, 3, 4, 5, 6, 8, 10, 12]), k2 = F(kf.n * kf.n, kf.d * kf.d), A1 = A0 * kv * kv;
        return { q: L(sh[0] + ' d\'aire ' + A0 + ' cm² ' + w[0] + ' ' + ppgKfr(kf) + '. Quelle est l\'aire ' + sh[2] + ' ?', sh[1] + ' площадью ' + A0 + ' см² ' + w[1] + ' ' + ppgKfr(kf) + '. Какова площадь ' + sh[3] + '?'), ans: N(fx(A1), { unit: 'cm²' }), sol: [
          ppgWhyK(kf, 2),
          ['Коэффициент для площадей:', ppgKtx(kf) + '^2=' + Fr.str(k2)],
          ['Новая площадь:', A0 + '*' + ppgKtx(k2) + '=' + fx(A1), 'cm²'],
          'Ошибка — умножить площадь просто на ' + ppgKfr(kf) + ': на $k$ умножаются только длины.'] };
      }
      const l0 = kf.d * r.pick([2, 3, 4, 5, 6, 7, 8, 9]), l1 = l0 * kv;
      return { q: L(sh[0] + ' ' + w[0] + ' ' + ppgKfr(kf) + '. Une longueur de la figure de départ mesure ' + l0 + ' cm. Combien mesure la longueur correspondante sur la figure obtenue ?', sh[1] + ' ' + w[1] + ' ' + ppgKfr(kf) + '. Один из отрезков исходной фигуры равен ' + l0 + ' см. Чему равен соответствующий отрезок новой фигуры?'),
        ans: N(fx(l1), { unit: 'cm' }), sol: [['Все длины умножаются на коэффициент ' + ppgKfr(kf) + ':', l0 + '*' + ppgKtx(kf) + '=' + fx(l1), 'cm'], up ? 'Коэффициент больше 1 — фигура увеличилась, отрезок стал длиннее.' : 'Коэффициент меньше 1 — фигура уменьшилась, отрезок стал короче.'] };
    }
    if (vi === 1) {   /* volumes */
      const kf = r.pick([F(2), F(3), F(1, 2), F(1, 3), F(3, 2)]), up = kf.n > kf.d, w = word(up), k3 = F(Math.pow(kf.n, 3), Math.pow(kf.d, 3));
      const sd = r.pick([['Une pyramide', 'Пирамиду', 'de la pyramide obtenue', 'полученной пирамиды'], ['Un cône', 'Конус', 'du cône obtenu', 'полученного конуса'], ['Une boîte en forme de pavé droit', 'Коробку в форме параллелепипеда', 'de la boîte obtenue', 'полученной коробки']]);
      const V0 = Math.pow(kf.d, 3) * r.pick([1, 2, 3, 4, 5, 6, 10]), V1 = V0 * k3.n / k3.d;
      return { q: L(sd[0] + ' de volume ' + V0 + ' cm³ ' + w[0] + ' ' + ppgKfr(kf) + '. Quel est le volume ' + sd[2] + ' ?', sd[1] + ' объёмом ' + V0 + ' см³ ' + w[1] + ' ' + ppgKfr(kf) + '. Каков объём ' + sd[3] + '?'), ans: N(fx(V1), { unit: 'cm³' }), sol: [
        ppgWhyK(kf, 3),
        ['Коэффициент для объёмов:', ppgKtx(kf) + '^3=' + Fr.str(k3)],
        ['Новый объём:', V0 + '*' + ppgKtx(k3) + '=' + fx(V1), 'cm³'],
        'Ошибка — умножить объём на ' + ppgKfr(kf) + ' или на $k^2$: объём меняется во всех трёх направлениях сразу.'] };
    }
    /* vi 2: by how much are areas / volumes multiplied */
    const vol = r() < 0.5;
    if (r() < 0.3) {   /* a reduction */
      const n = r.pick([2, 3]), kf = F(1, n), m = vol ? n * n * n : n * n;
      const opts = (vol ? [n * n * n, n * n, n, 3 * n] : [n * n, n, 2 * n, n * n * n]).filter((v, i, a) => a.indexOf(v) === i).map(v => '$1/' + v + '$');
      return { q: L('Lors d\'une réduction de rapport $1/' + n + '$, ' + (vol ? 'les volumes sont multipliés' : 'les aires sont multipliées') + ' par :', 'При уменьшении с коэффициентом $1/' + n + '$ ' + (vol ? 'объёмы' : 'площади') + ' умножаются на:'), ans: MQ(r, opts, 0), sol: [
        ppgWhyK(kf, vol ? 3 : 2),
        [(vol ? 'Объёмы умножаются на $k^3$' : 'Площади умножаются на $k^2$') + ':', '(1/' + n + ')^' + (vol ? 3 : 2) + '=1/' + m]] };
    }
    const n = vol ? r.pick([2, 4, 5, 10]) : r.pick([3, 4, 5, 10]), opts = (vol ? [n * n * n, n * n, n, 3 * n] : [n * n, n, 2 * n, n * n * n]).map(String);
    return { q: L('Lors d\'un agrandissement de rapport ' + n + ', ' + (vol ? 'les volumes sont multipliés' : 'les aires sont multipliées') + ' par :', 'При увеличении с коэффициентом ' + n + ' ' + (vol ? 'объёмы' : 'площади') + ' умножаются на:'), ans: MQ(r, opts, 0), sol: [
      ppgWhyK(F(n), vol ? 3 : 2),
      'Умножить на ' + n + ' — это только для длин; ' + (vol ? n * n + ' — для площадей.' : n * n * n + ' — для объёмов.')] };
  } });

/* ---------- gm.agrandissement-rapport (lvl 3) ---------- */
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
topic({ id: 'gm.agrandissement-rapport', ch: 'gm', lvl: 2, calc: false, variants: 4,
  ru: 'Увеличение и уменьшение: найти коэффициент', fr: 'Agrandissement et réduction : retrouver le rapport',
  hints: [
    'Если известны площади до и после, то их отношение равно $k^2$, и $k$ — число, квадрат которого равен этому отношению. Для объёмов отношение равно $k^3$.',
    'Площади и объёмы связаны через $k$: площадь умножилась на 25 → $k=5$ → объём умножился на $5^3=125$.',
    'Сечение пирамиды или конуса плоскостью, параллельной основанию, отрезает маленькую пирамиду (конус) — уменьшенную копию большой с коэффициентом $k$ = (высота маленькой) ÷ (высота большой). Её объём = объём большой × $k^3$.'],
  gen(r, vi) {
    if (vi === 0) {   /* the ratio from two areas or two volumes */
      const vol = r() < 0.4, down = !vol && r() < 0.35, n = vol ? r.pick([2, 3, 4, 5]) : r.pick([2, 3, 4, 5, 10]), m = r.pick([2, 3, 4, 5, 6, 7, 8]);
      const p = vol ? 3 : 2, f = Math.pow(n, p), a = down ? f * m : m, b = down ? m : f * m, u = vol ? 'cm³' : 'cm²', w = vol ? ['un volume', 'объём'] : ['une aire', 'площадь'];
      const kf = down ? F(1, n) : F(n);
      return { q: L('Une figure' + (vol ? ' en 3D' : '') + ' a ' + w[0] + ' de ' + a + ' ' + u + '. Après ' + (down ? 'une réduction' : 'un agrandissement') + ', la figure obtenue a ' + w[0] + ' de ' + b + ' ' + u + '. Quel est le rapport de ' + (down ? 'cette réduction' : 'cet agrandissement') + ' ?',
        (vol ? 'Объёмная фигура' : 'Фигура') + ' имеет ' + w[1] + ' ' + a + ' ' + ppgRu(u) + '. После ' + (down ? 'уменьшения' : 'увеличения') + ' её ' + w[1] + ' стал' + (vol ? '' : 'а') + ' ' + b + ' ' + ppgRu(u) + '. Каков коэффициент ' + (down ? 'уменьшения' : 'увеличения') + '?'),
        ans: N(Fr.str(kf), { show: tF(kf) }), sol: [
          [(vol ? 'Объём умножился' : 'Площадь умножилась') + ' на $k^' + p + '$ — находим, во сколько раз ' + (vol ? 'он изменился' : 'она изменилась') + ':', b + '÷' + a + '=' + Fr.str(F(b, a))],
          ['Ищем $k$: число, ' + (vol ? 'куб' : 'квадрат') + ' которого равен $' + Fr.str(F(b, a)) + '$:', ppgKtx(kf) + '^' + p + '=' + Fr.str(F(b, a))],
          'Значит, $k=' + Fr.str(kf) + '$. Ошибка — ответить $' + Fr.str(F(b, a)) + '$: это коэффициент для ' + (vol ? 'объёмов' : 'площадей') + ', а не для длин.'] };
    }
    if (vi === 1) {   /* from the area ratio to the volume ratio and back */
      const kf = r.pick([F(2), F(3), F(4), F(5), F(10), F(1, 2), F(1, 3)]), k2 = F(kf.n * kf.n, kf.d * kf.d), k3 = F(Math.pow(kf.n, 3), Math.pow(kf.d, 3)), fromA = r() < 0.6;
      const ks = f => f.d === 1 ? String(f.n) : '$' + Fr.str(f) + '$';
      return { q: fromA ? L('Lors d\'un agrandissement ou d\'une réduction, les aires sont multipliées par ' + ks(k2) + '. Par combien les volumes sont-ils multipliés ?', 'При увеличении или уменьшении площади умножились на ' + ks(k2) + '. На сколько умножились объёмы?')
        : L('Lors d\'un agrandissement ou d\'une réduction, les volumes sont multipliés par ' + ks(k3) + '. Par combien les aires sont-elles multipliées ?', 'При увеличении или уменьшении объёмы умножились на ' + ks(k3) + '. На сколько умножились площади?'),
        ans: N(Fr.str(fromA ? k3 : k2), { show: tF(fromA ? k3 : k2) }), sol: [
          fromA ? ['Площади умножаются на $k^2$. Находим длины — коэффициент $k$:', ppgKtx(kf) + '^2=' + Fr.str(k2)] : ['Объёмы умножаются на $k^3$. Находим коэффициент $k$ для длин:', ppgKtx(kf) + '^3=' + Fr.str(k3)],
          fromA ? ['Значит, $k=' + Fr.str(kf) + '$, а объёмы умножаются на $k^3$:', ppgKtx(kf) + '^3=' + Fr.str(k3)] : ['Значит, $k=' + Fr.str(kf) + '$, а площади умножаются на $k^2$:', ppgKtx(kf) + '^2=' + Fr.str(k2)],
          'Нельзя просто умножить или поделить на ' + ks(fromA ? k2 : k3) + ': всё идёт через коэффициент длин $k$.'] };
    }
    if (vi === 2) {   /* a section of a pyramid or a cone (Asie 2026, ex. 2 style) */
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
    /* vi 3: a photo enlarged: the ratio from one length, then the area */
    const kf = r.pick([F(2), F(3), F(4), F(3, 2), F(1, 2), F(5, 2)]), [a, b] = r.pick(kf.d === 2 ? [[10, 12], [8, 10], [20, 30], [12, 18], [16, 20], [10, 14]] : [[10, 15], [9, 13], [10, 12], [13, 18], [8, 10], [20, 30], [15, 20]]);
    const b2 = b * kf.n / kf.d, A = a * b, A2 = A * kf.n * kf.n / (kf.d * kf.d), up = kf.n > kf.d;
    return { q: L('Une photo rectangulaire de ' + a + ' cm sur ' + b + ' cm est ' + (up ? 'agrandie' : 'réduite') + ' : sa longueur passe de ' + b + ' cm à ' + nf(b2) + ' cm. Quelle est l\'aire de la photo ' + (up ? 'agrandie' : 'réduite') + ' ?', 'Прямоугольную фотографию ' + a + ' см на ' + b + ' см ' + (up ? 'увеличили' : 'уменьшили') + ': её длина стала ' + nf(b2) + ' см вместо ' + b + ' см. Какова площадь новой фотографии?'),
      ans: N(fx(A2), { unit: 'cm²' }), sol: [
        ['Коэффициент — во сколько раз изменилась длина:', fx(b2) + '/' + b + '=' + Fr.str(kf)],
        ['Площадь исходной фотографии:', a + '*' + b + '=' + A, 'cm²'],
        ['Площади умножаются на $k^2=' + Fr.str(F(kf.n * kf.n, kf.d * kf.d)) + '$:', A + '*' + ppgKtx(F(kf.n * kf.n, kf.d * kf.d)) + '=' + fx(A2), 'cm²'],
        'Проверка: ширина тоже умножается на ' + ppgKfr(kf) + ' и становится ' + nf(a * kf.n / kf.d) + ' см; $' + fx(a * kf.n / kf.d) + '×' + fx(b2) + '=' + fx(A2) + '$ ✓'] };
  } });

/* ---------- gm.grandeurs-composees ---------- */
topic({ id: 'gm.grandeurs-composees', ch: 'gm', lvl: 2, calc: false, variants: 5,
  ru: 'Составные величины: плотность, расход, мощность', fr: 'Grandeurs composées',
  hints: [
    'Составная величина — «сколько на одну единицу»: 10,5 g/cm³ — граммов в каждом см³, 12 L/min — литров за каждую минуту, 6 L / 100 km — литров на каждые 100 км, 400 hab/km² — жителей на каждый км².',
    'Поэтому это задача на пропорциональность: умножаем «сколько на единицу» на число единиц ($m=ρ×V$, объём = расход × время) или делим, если ищем число единиц.',
    'Энергия: мощность × время, в kW × h = kWh. Ватты сначала переведи в киловатты: 2 000 W = 2 kW.'],
  gen(r, vi) {
    if (vi === 0) {   /* density: mass = ρ × V (calculator; Métropole and Polynésie 2026) */
      const C = r.pick([
        { fr: 'Une médaille en argent', ru: 'Серебряная медаль', rho: 10.5, mat: ['l\'argent', 'серебра'], V: [46.8, 50.3, 55.4, 60.8] },
        { fr: 'Une boule en plastique', ru: 'Пластиковый шар', rho: 0.9, mat: ['ce plastique', 'этого пластика'], V: [14.1, 33.5, 113.1, 268.1] },
        { fr: 'Un lingot d\'or', ru: 'Золотой слиток', rho: 19.3, mat: ['l\'or', 'золота'], V: [51.8, 25.9, 12.4] },
        { fr: 'Une planche de bois', ru: 'Деревянная доска', rho: 0.7, mat: ['ce bois', 'этого дерева'], V: [1250, 2400, 3600] }]);
      const V = r.pick(C.V), m = C.rho * V, rev = r() < 0.3;
      if (rev) {
        const mm = Math.round(m), V2 = mm / C.rho;
        return { q: L(C.fr + ' a une masse de ' + nf(mm) + ' g. La masse volumique de ' + C.mat[0] + ' est ' + nf(C.rho) + ' g/cm³. Calculer son volume, arrondi au cm³.', C.ru + ' имеет массу ' + nf(mm) + ' г. Плотность ' + C.mat[1] + ' — ' + nf(C.rho) + ' г/см³. Вычисли объём, округлив до 1 см³.'), calc: true,
          ans: N(ppgRd(V2, 0), { dp: 0, unit: 'cm³' }), sol: [
            'Плотность ' + nf(C.rho) + ' г/см³: каждый см³ весит ' + nf(C.rho) + ' г. Масса пропорциональна объёму: $m=ρ×V$, значит, $V=m÷ρ$ — сколько раз по ' + nf(C.rho) + ' г помещается в массе.',
            { t: 'Объём:', tex: ppgTx(mm) + '\\div ' + ppgTx(C.rho) + '\\approx ' + ppgTx(+ppgRd(V2, 0)) + ppgUT('cm³') }] };
      }
      return { q: L(C.fr + ' a un volume de ' + nf(V) + ' cm³. La masse volumique de ' + C.mat[0] + ' est ' + nf(C.rho) + ' g/cm³. Calculer sa masse, arrondie au gramme.', C.ru + ' имеет объём ' + nf(V) + ' см³. Плотность ' + C.mat[1] + ' — ' + nf(C.rho) + ' г/см³. Вычисли массу, округлив до грамма.'), calc: true,
        ans: N(ppgRd(m, 0), { dp: 0, unit: 'g' }), sol: [
          'Плотность («masse volumique») ' + nf(C.rho) + ' г/см³: каждый см³ весит ' + nf(C.rho) + ' г. Масса пропорциональна объёму: $m=ρ×V$.',
          { t: 'Масса:', tex: ppgTx(C.rho) + '\\times ' + ppgTx(V) + '=' + ppgTx(+fx(m)) + (Number.isInteger(+fx(m)) ? '' : '\\approx ' + ppgTx(+ppgRd(m, 0))) + ppgUT('g') },
          'Единицы: (г/см³) × см³ = г — см³ «сокращаются». Если ответ просят в кг, делим на 1 000.'] };
    }
    if (vi === 1) {   /* flow */
      const kind = r.pick(['remplir', 'fuite', 'piscine']);
      if (kind === 'remplir') {
        const d = r.pick([8, 10, 12, 15, 20]), t = r.pick([6, 8, 9, 10, 12, 15]), V = d * t;
        return { q: L('Un robinet a un débit de ' + d + ' L par minute. Combien de temps faut-il pour remplir une baignoire de ' + V + ' L ?', 'Из крана вытекает ' + d + ' л в минуту. Сколько времени нужно, чтобы наполнить ванну на ' + V + ' л?'), ans: N(t, { unit: 'min' }), sol: [
          'Расход ' + d + ' л/мин: за каждую минуту — ' + d + ' л. Объём пропорционален времени, поэтому время = объём ÷ расход.',
          [ 'Время:', V + '÷' + d + '=' + t, 'min']] };
      }
      if (kind === 'fuite') {
        const d = r.pick([2, 3, 4, 5]), days = r.pick([7, 30, 10]), V = d * 24 * days;
        return { q: L('Une fuite d\'eau a un débit de ' + d + ' L par heure. Quel volume d\'eau perd-on en ' + days + ' jours ?', 'Через протечку уходит ' + d + ' л воды в час. Сколько воды утечёт за ' + days + ' ' + ppgPw(days, 'день', 'дня', 'дней') + '?'), ans: N(V, { unit: 'L' }), sol: [
          ['Сначала часы: в сутках 24 ч.', days + '*24=' + days * 24, 'h'],
          ['Объём = расход × время:', d + '*' + days * 24 + '=' + V, 'L']] };
      }
      const d = r.pick([10, 12, 15, 20, 25]), t = r.pick([3, 4, 5, 6, 8]), V = d * t;
      return { q: L('Une pompe vide une piscine de ' + V + ' m³ avec un débit de ' + d + ' m³ par heure. Combien d\'heures faut-il pour vider la piscine ?', 'Насос откачивает воду из бассейна объёмом ' + V + ' м³ со скоростью ' + d + ' м³ в час. Сколько часов нужно, чтобы опустошить бассейн?'), ans: N(t, { unit: 'h' }), sol: [
        'Расход ' + d + ' м³/ч: каждый час — ' + d + ' м³. Время = объём ÷ расход.',
        ['Время:', V + '÷' + d + '=' + t, 'h']] };
    }
    if (vi === 2) {   /* fuel consumption */
      const c = r.pick([4, 5, 6, 7, 8]), rev = r() < 0.35;
      if (rev) {
        const L0 = c * r.pick([2, 3, 4, 5, 6, 8]), d = L0 / c * 100;
        return { q: L('Une voiture consomme en moyenne ' + c + ' L d\'essence pour 100 km. Quelle distance peut-elle parcourir avec ' + L0 + ' L ?', 'Машина в среднем расходует ' + c + ' л бензина на 100 км. Какое расстояние она проедет на ' + L0 + ' л?'), ans: N(d, { unit: 'km' }), sol: [
          ['Расход ' + c + ' л на 100 км. Сколько раз по ' + c + ' л помещается в ' + L0 + ' л — столько раз по 100 км:', L0 + '÷' + c + '=' + L0 / c],
          ['Расстояние:', L0 / c + '*100=' + d, 'km']] };
      }
      const d = r.pick([50, 150, 200, 250, 300, 350, 400, 450, 500, 600]), cons = c * d / 100;
      return { q: L('Une voiture consomme en moyenne ' + c + ' L d\'essence pour 100 km. Quelle quantité d\'essence consomme-t-elle pour un trajet de ' + d + ' km ?', 'Машина в среднем расходует ' + c + ' л бензина на 100 км. Сколько бензина она израсходует на ' + d + ' км?'), ans: N(fx(cons), { unit: 'L' }), sol: [
        ['Расход пропорционален расстоянию. В ' + d + ' км помещается столько «сотен километров»:', d + '÷100=' + fx(d / 100)],
        ['На каждые 100 км — ' + c + ' л:', fx(d / 100) + '*' + c + '=' + fx(cons), 'L']] };
    }
    if (vi === 3) {   /* population density */
      const S = r.pick([4, 5, 8, 10, 12, 15, 20, 25]), dens = r.pick([50, 80, 120, 150, 200, 250, 400, 600, 1000]), P = S * dens, rev = r() < 0.35;
      if (rev) return { q: L('Une île de ' + S + ' km² a une densité de population de ' + dens + ' habitants par km². Combien d\'habitants compte-t-elle ?', 'Площадь острова ' + S + ' км², плотность населения ' + dens + ' жителей на км². Сколько жителей на острове?'), ans: N(P, { unit: 'habitants' }), sol: [
        'Плотность ' + dens + ' жителей/км²: на каждом км² в среднем ' + dens + ' жителей.',
        ['Число жителей = плотность × площадь:', dens + '*' + S + '=' + P]] };
      return { q: L('Une commune de ' + S + ' km² compte ' + nf(P) + ' habitants. Quelle est sa densité de population, en habitants par km² ?', 'В коммуне площадью ' + S + ' км² живут ' + nf(P) + ' человек. Какова плотность населения (жителей на км²)?'), ans: N(dens, { unit: 'hab/km²' }), sol: [
        'Плотность населения — сколько жителей приходится в среднем на 1 км²: делим число жителей на площадь.',
        ['Плотность:', P + '÷' + S + '=' + dens, 'hab/km²']] };
    }
    /* vi 4: electric energy */
    const dev = r.pick([['Un radiateur', 'Обогреватель', [1000, 1500, 2000, 2500]], ['Un four', 'Духовка', [2000, 2500, 3000]], ['Une ampoule', 'Лампочка', [10, 20, 50]]]);
    const P = r.pick(dev[2]), t = P < 100 ? r.pick([20, 50, 100, 200]) : r.pick([2, 3, 4, 5, 6]), E = P * t / 1000, cost = r() < 0.35, price = 0.2;
    const q = L(dev[0] + ' de puissance ' + nf(P) + ' W fonctionne pendant ' + t + ' h. ' + (cost ? 'Le kWh coûte ' + eur(price) + '. Combien coûte cette utilisation ?' : 'Quelle énergie consomme-t-' + (dev[0].startsWith('Une') ? 'elle' : 'il') + ', en kWh ?'), dev[1] + ' мощностью ' + nf(P) + ' Вт работает ' + t + ' ч. ' + (cost ? '1 кВт·ч стоит ' + eur(price) + '. Сколько стоит это электричество?' : 'Сколько энергии (в кВт·ч) ' + (dev[1] === 'Духовка' || dev[1] === 'Лампочка' ? 'она расходует' : 'он расходует') + '?'));
    return { q, ans: cost ? ppgEurAns(E * price) : N(fx(E), { unit: 'kWh' }), sol: [
      ['Мощность переводим в киловатты (1 кВт = 1 000 Вт):', P + '÷1000=' + fx(P / 1000), 'kW'],
      ['Энергия = мощность × время; киловатты × часы = киловатт-часы (kWh):', fx(P / 1000) + '*' + t + '=' + fx(E), 'kWh']].concat(cost ? [['Цена = энергия × цена одного кВт·ч:', fx(E) + '*' + fx(price) + '=' + fx(E * price), '€']] : []) };
  } });

/* ===================== FICHES ===================== */
fiche({ ch: 'pp', id: 'pp.proportionnalite', ru: 'Пропорциональность', fr: 'La proportionnalité', body: [
  'Две величины пропорциональны, если одна получается из другой умножением на одно и то же число $k$ — «coefficient de proportionnalité»: $y=k×x$. Удвоили одну — удвоилась и другая; 0 переходит в 0.',
  'Таблица пропорциональна, если все частные «нижнее ÷ верхнее» одинаковы. График пропорциональной зависимости — прямая, проходящая через начало координат. «Обе величины растут» — ещё не пропорциональность.',
  'Четвёртое пропорциональное («quatrième proportionnelle») находят через коэффициент, через «passage par l\'unité» (сначала значение для одной единицы) или «produit en croix»: если $a/b=c/d$, то $a×d=b×c$.',
  'Ratio 2 : 3 — делим на 2 + 3 = 5 одинаковых долей. Масштаб 1/25 000 — 1 см на карте соответствует 25 000 см в реальности (длины пропорциональны).'],
  ex: [['Четвёртое пропорциональное', 'a=18*12÷6=36'], ['Цена одной штуки', '7.5÷5=1.5'], ['Ratio 2 : 3 от 45 €', '45÷5*3=27'], ['Масштаб 1/25 000, 8 см', '8*25000=200000']] });
fiche({ ch: 'pp', id: 'pp.pourcentages', ru: 'Проценты', fr: 'Les pourcentages', body: [
  '$t$ % — это $t/100$. Найти $t$ % от числа $N$ — умножить: $t/100×N$. Опоры для счёта в уме: 50 % — половина, 25 % — четверть, 10 % — десятая часть, 1 % — сотая.',
  'Повышение на $t$ % — умножение на $1+t/100$ (+20 % → ×1,2), снижение — на $1-t/100$ (−15 % → ×0,85). Процент берут от величины ДО изменения.',
  'Какой это процент: часть ÷ целое × 100. Процент изменения: (новое − старое) ÷ старое × 100 — делим на СТАРОЕ значение.',
  'Исходную цену находят делением на коэффициент: после +20 % цена 36 € — значит, было $36÷1.2=30$ €. Два изменения подряд — перемножаем коэффициенты: +10 %, потом −10 % → ×0,99, то есть −1 %, а не 0.'],
  ex: [['20 % от 300', '0.2*300=60'], ['15 € после +20 %', '15*1.2=18'], ['80 € после −10 %', '80*0.9=72'], ['Рост с 20 до 26', '6/20=0.3=30/100']] });
fiche({ ch: 'pp', id: 'pp.vitesses', ru: 'Скорость, расстояние, время', fr: 'Vitesse moyenne', body: [
  'Средняя скорость — расстояние за единицу времени: $v=d/t$. Отсюда $d=v×t$ и $t=d/v$. При постоянной скорости расстояние пропорционально времени.',
  'Время подставляй в часах: 30 мин = 0,5 ч, 15 мин = 0,25 ч, 45 мин = 0,75 ч, 20 мин = $1/3$ ч. 1 ч 15 мин = 1,25 ч, а не 1,15 ч: после запятой — доли часа.',
  '1 м/с = 3,6 км/ч (за 3 600 с проходят 3 600 м = 3,6 км). Из км/ч в м/с — делим на 3,6, из м/с в км/ч — умножаем на 3,6.'],
  ex: [['Расстояние', 'd=80*2.5=200'], ['Скорость: 9 км за 45 мин', 'v=9÷0.75=12'], ['Перевод 72 км/ч', '72÷3.6=20']] });
fiche({ ch: 'gm', id: 'gm.unites', ru: 'Единицы и перевод', fr: 'Unités et conversions', body: [
  'Длина: km, hm, dam, m, dm, cm, mm — соседние единицы отличаются в 10 раз. Так же масса (kg, hg, dag, g, dg, cg, mg; 1 t = 1 000 kg) и вместимость (hL, daL, L, dL, cL, mL). К более мелкой единице — умножаем, к более крупной — делим.',
  'Площадь: соседние единицы отличаются в 100 раз (1 m² = 100 dm² = 10 000 cm², ведь это квадрат 100 cm × 100 cm); 1 ha = 10 000 m². Объём: в 1 000 раз (1 m³ = 1 000 dm³).',
  '1 L = 1 dm³, 1 mL = 1 cm³, 1 m³ = 1 000 L.',
  'Время: 1 h = 60 min, 1 min = 60 s. 135 min = 2 h 15 min (делим на 60 с остатком). Часы и минуты складывают отдельно; 60 минут превращают в 1 час.'],
  ex: [['3,5 km в m', '3.5*1000=3500'], ['2,5 m² в cm²', '2.5*10000=25000'], ['3,57 L в cm³', '3.57*1000=3570'], ['135 min', '135=2*60+15']] });
fiche({ ch: 'gm', id: 'gm.aires-volumes', ru: 'Площади и объёмы: формулы', fr: 'Aires et volumes', body: [
  'Прямоугольник: $A=L×l$, $P=2×(L+l)$. Квадрат: $A=c^2$, $P=4×c$. Треугольник: $A=b×h÷2$ (высота перпендикулярна основанию).',
  'Окружность и круг: длина $$2\\pi r=\\pi d$$, площадь $$\\pi r^2$$. Без калькулятора ответ оставляют с $$\\pi$$, с калькулятором — округляют в самом конце.',
  'Параллелепипед: $V=L×l×h$; куб: $V=a^3$. Призма и цилиндр: $V=B×h$ — площадь основания × высота; цилиндр: $$V=\\pi r^2 h$$.',
  'Пирамида и конус — треть «своей» призмы или цилиндра: $$V=\\dfrac{B\\times h}{3}$$. Шар: $$V=\\dfrac{4}{3}\\pi r^3$$ (формулы пирамиды, конуса и шара обычно даны в условии).',
  'Составные величины: масса = плотность × объём ($$m=\\rho\\times V$$, g/cm³ × cm³ = g); энергия (kWh) = мощность (kW) × время (h); расход 6 L / 100 km — литров на каждые 100 км.'],
  ex: [['Треугольник', '8*5÷2=20'], ['Пирамида: основание 6 × 6, h = 5', '36*5÷3=60'], ['Параллелепипед 4,5 × 4 × 10', '4.5*4*10=180']] });
fiche({ ch: 'gm', id: 'gm.agrandir', ru: 'Увеличение и уменьшение', fr: 'Agrandissement et réduction', body: [
  'При увеличении или уменьшении с коэффициентом $k$ длины умножаются на $k$, площади — на $k^2$, объёмы — на $k^3$; углы не меняются.',
  'Почему: квадратик со стороной 1 становится квадратом со стороной $k$, а в нём $k×k$ таких квадратиков; кубик с ребром 1 — кубом, в котором $k×k×k$ кубиков.',
  '$k>1$ — увеличение, $0<k<1$ — уменьшение. $k=3$: площади ×9, объёмы ×27. $k=1/2$: площади умножаются на $1/4$, объёмы — на $1/8$.',
  'Сечение пирамиды или конуса плоскостью, параллельной основанию, отрезает уменьшенную копию с коэффициентом $k$ = (малая высота) ÷ (большая высота).'],
  ex: [['Площадь 12 см², k = 3', '12*9=108'], ['Объём 40 см³, k = 1/2', '40*(1/8)=5'], ['k по площадям 5 → 45', '45÷5=9=3^2']] });

/* ===================== DICTIONARY ===================== */
gloss('la proportionnalité', 'пропорциональность', 'одна величина получается из другой умножением на одно и то же число');
gloss('le coefficient de proportionnalité', 'коэффициент пропорциональности', 'число, на которое умножают одну величину, чтобы получить другую');
gloss('un tableau de proportionnalité', 'таблица пропорциональности', 'все частные «нижнее ÷ верхнее» одинаковы');
gloss('la quatrième proportionnelle', 'четвёртое пропорциональное', 'неизвестное число в таблице пропорциональности 2 × 2');
gloss('le produit en croix', 'произведение «крест-накрест»', 'если a/b = c/d, то a × d = b × c');
gloss('le passage par l\'unité', 'переход через единицу', 'сначала находят значение для одной единицы, потом умножают');
gloss('un pourcentage', 'процент', 't % = t/100');
gloss('une augmentation, une hausse', 'повышение, рост');
gloss('une baisse, une diminution', 'снижение, уменьшение');
gloss('le coefficient multiplicateur', 'множитель изменения', '+20 % → × 1,2 ; −15 % → × 0,85');
gloss('un ratio', 'отношение (ratio)', 'ratio 2 : 3 — на 2 доли первого приходятся 3 доли второго');
gloss('une échelle', 'масштаб', 'échelle 1/100 : 1 см на плане — 100 см в реальности');
gloss('la vitesse moyenne', 'средняя скорость', 'расстояние ÷ время, например 40 km/h');
gloss('une durée', 'длительность, продолжительность');
gloss('un horaire', 'время по часам; расписание');
gloss('la contenance', 'вместимость', 'сколько жидкости помещается: в L, cL, mL');
gloss('le périmètre', 'периметр', 'длина границы фигуры');
gloss('l\'aire', 'площадь', 'измеряется в mm², cm², m²…');
gloss('un agrandissement, une réduction de rapport k', 'увеличение, уменьшение с коэффициентом k', 'длины × k, площади × k², объёмы × k³; в задачах о ценах «réduction» — скидка');
gloss('la masse volumique', 'плотность (вещества)', 'масса 1 см³ вещества, например 10,5 g/cm³ у серебра');
gloss('la consommation', 'расход (бензина, энергии)', 'например 6 L pour 100 km');
gloss('la densité de population', 'плотность населения', 'число жителей на 1 км²');
gloss('un kilowattheure (kWh)', 'киловатт-час', 'энергия: мощность 1 kW в течение 1 h');
