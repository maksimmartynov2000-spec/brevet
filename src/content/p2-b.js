/* ===================== PARTIE 2 · problèmes B : géométrie (ge), grandeurs et mesures (gm), statistiques et probabilités (st) =====================
   Each problem follows a real DNB exercise (src): the same story and the same chain of reasoning, new numbers on every run.
   Top-level names of this file start with pb. Figures are recomputed from the generated numbers (drawn roughly to scale). */

/* ---------- numbers ---------- */
const pbRd = (v, k = 0) => { const p = Math.pow(10, k); return Math.round(v * p + (v >= 0 ? 1e-7 : -1e-7)) / p; };   /* round half up (2.45 → 2.5) */
const pbK = (v, k) => pbRd(v, k).toFixed(k);                       /* key of a rounded answer, '77.8' */
const pbS = (v, k) => nf(pbRd(v, k), k);                           /* rounded number for a text, '77,8' */
const pbNR = (v, k, unit) => N(pbK(v, k), unit ? { dp: k, unit } : { dp: k });
const pbNE = (v, unit) => N(fx(v), unit ? { unit } : {});
const pbIsD = (v, k) => { const x = v * Math.pow(10, k); return Math.abs(x - Math.round(x)) < 1e-6; };   /* v has at most k decimals */
const pbTie = (v, k) => { const x = v * Math.pow(10, k); return Math.abs(x - Math.floor(x) - 0.5) < 0.02; }; /* too close to a rounding boundary */
const pbDeg = x => x * 180 / Math.PI;
const pbRad = x => x * Math.PI / 180;
const pbAng = s => '$$\\widehat{' + s + '}$$';                    /* the angle ABC as $$\widehat{ABC}$$ */
const pbAngEq = (s, v) => '$$\\widehat{' + s + '}=' + String(v).replace('.', '{,}') + '^{\\circ}$$';   /* «ABC = 74°» kept in one formula (no line break inside) */
const pbDg = v => String(v).replace('.', '{,}') + '^{\\circ}';
const pbFr = (n, d) => { const f = F(n, d); return f.d === 1 ? String(f.n) : f.n + '/' + f.d; };   /* fraction in input syntax, reduced */
const pbPct = v => nf(v) + ' %';
/* Russian noun after a number: pbRu(22, 'песня', 'песни', 'песен') → 'песни' */
const pbRu = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many);
/* French typography in plain text (not inside $…$): no line break before « ? ! : ; », between a number and its unit, around « = » */
const PB_UNITS = 'cm³|cm²|cm|mm³|mm²|mm|m³|m²|m/s|m|km/h|km|dm³|dm|mL|cL|L|kWh|kg|g|€|%|°|min|h|s|см³|см²|см|мм³|мм|м³|м²|м/с|м|км/ч|км|дм³|мл|л|кВт·ч|кг|г|мин|ч|с';
const PB_TY_U = new RegExp('(\\d) (?=(?:' + PB_UNITS + ')(?![A-Za-zА-Яа-яЁё0-9²³]))', 'g');
function pbTy(s) {
  return String(s).split(/(\$\$[^$]*\$\$|\$[^$]*\$)/).map((p, i) => i % 2 ? p : p.replace(/ ([?!:;])/g, '\u00a0$1').replace(PB_TY_U, '$1\u00a0').replace(/ ([=≈<>≤≥]) /g, '\u00a0$1\u00a0').replace(/(\d) (?=\d{3}(?!\d))/g, '$1\u00a0')).join('');
}
const pbTyT = o => (o && typeof o === 'object' && 'fr' in o ? { fr: pbTy(o.fr), ru: pbTy(o.ru) } : typeof o === 'string' ? pbTy(o) : o);
function pbTyA(a) { if (!a) return a; if (a.k === 'mcq') a.opts = a.opts.map(pbTyT); if (a.k === 'order') a.items = a.items.map(pbTyT); if (a.k === 'multi') a.parts.forEach(p => { if (p.lab) p.lab = pbTyT(p.lab); pbTyA(p.spec); }); return a; }
function pbTyS(s) { if (typeof s === 'string') return pbTy(s); if (Array.isArray(s)) return [pbTy(s[0] || '')].concat(s.slice(1)); if (s && s.t != null) return Object.assign({}, s, { t: pbTy(s.t) }); return s; }
/* probleme() with the typography applied to every text the generator returns */
function pbProb(def) {
  const g = def.gen;
  def.gen = function (r) { const p = g.call(this, r); if (p.ctx) p.ctx = pbTyT(p.ctx); p.qs.forEach(q => { q.q = pbTyT(q.q); pbTyA(q.ans); q.sol = (q.sol || []).map(pbTyS); }); return p; };
  return probleme(def);
}
/* Pythagorean triples for right triangles with «nice» sides */
const PB_TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [9, 40, 41], [28, 45, 53], [11, 60, 61], [33, 56, 65], [16, 63, 65], [48, 55, 73], [13, 84, 85], [36, 77, 85], [39, 80, 89], [65, 72, 97]];

/* ---------- drawing ---------- */
const pbC = v => +(+v).toFixed(1);
const pbXY = p => pbC(p[0]) + ',' + pbC(p[1]);
function pbLn(a, b, c) { return '<line x1="' + pbC(a[0]) + '" y1="' + pbC(a[1]) + '" x2="' + pbC(b[0]) + '" y2="' + pbC(b[1]) + '" class="' + (c || 'fl') + '"/>'; }
function pbPl(ps, c, closed) { return '<' + (closed ? 'polygon' : 'polyline') + ' points="' + ps.map(pbXY).join(' ') + '" class="' + (c || 'fl') + '"' + (/ffill|fc\d|fbar/.test(c || '') ? '' : ' fill="none"') + '/>'; }
function pbTx(p, s, c, a) { return '<text x="' + pbC(p[0]) + '" y="' + pbC(p[1]) + '" class="' + (c || 'ftx') + '" text-anchor="' + (a || 'middle') + '">' + s + '</text>'; }
function pbDot(p) { return '<circle cx="' + pbC(p[0]) + '" cy="' + pbC(p[1]) + '" r="2.6" class="fpt"/>'; }
const pbUnit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1; return [dx / n, dy / n]; };
const pbAdd = (p, u, s) => [p[0] + u[0] * s, p[1] + u[1] * s];
const pbMid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
/* label of a point, pushed away from ctr (or in the direction u when ctr is a direction) */
function pbLab(p, s, ctr, d) { const u = ctr.dir ? ctr.dir : pbUnit(ctr, p); return pbTx([p[0] + u[0] * (d || 13), p[1] + u[1] * (d || 13) + 5], s); }
const pbDir = (x, y) => { const n = Math.hypot(x, y) || 1; return { dir: [x / n, y / n] }; };
/* right-angle mark at p between the directions to a and b */
function pbRA(p, a, b, s) { s = s || 9; const u = pbUnit(p, a), v = pbUnit(p, b), p1 = pbAdd(p, u, s), p3 = pbAdd(p, v, s), p2 = pbAdd(p1, v, s); return '<polyline points="' + [p1, p2, p3].map(pbXY).join(' ') + '" class="fang" fill="none"/>'; }
/* arc marking the angle at p between the directions to a and b */
function pbArc(p, a, b, r) { const u = pbUnit(p, a), v = pbUnit(p, b), s = pbAdd(p, u, r), e = pbAdd(p, v, r), cr = u[0] * v[1] - u[1] * v[0]; return '<path d="M' + pbXY(s) + ' A' + r + ',' + r + ' 0 0 ' + (cr > 0 ? 1 : 0) + ' ' + pbXY(e) + '" class="fang" fill="none"/>'; }
/* text inside the angle at p (between the directions to a and b), at distance d */
function pbAngTx(p, a, b, s, d) { const u = pbUnit(p, a), v = pbUnit(p, b), w = pbUnit([0, 0], [u[0] + v[0], u[1] + v[1]]); return pbTx([p[0] + w[0] * d, p[1] + w[1] * d + 5], s, 'ftm'); }
/* n ticks (equal lengths) across the middle of [ab] */
function pbTick(a, b, n) { n = n || 1; const m = pbMid(a, b), u = pbUnit(a, b), v = [-u[1], u[0]]; let o = ''; for (let i = 0; i < n; i++) { const c = pbAdd(m, u, (i - (n - 1) / 2) * 4); o += pbLn(pbAdd(c, v, -5), pbAdd(c, v, 5)); } return o; }
/* a length written next to the middle of [ab], on the side away from ctr */
function pbLen(a, b, s, ctr, d) { const m = pbMid(a, b), u = pbUnit(a, b); let v = [-u[1], u[0]]; if ((m[0] - ctr[0]) * v[0] + (m[1] - ctr[1]) * v[1] < 0) v = [-v[0], -v[1]]; return pbTx([m[0] + v[0] * (d || 12), m[1] + v[1] * (d || 12) + 4], s, 'ftm'); }
/* maps maths coordinates (y up) into a w × h box with a margin: returns p → [x, y] in svg coordinates */
function pbFit(pts, w, h, pad) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = Math.min((w - 2 * pad) / ((x1 - x0) || 1), (h - 2 * pad) / ((y1 - y0) || 1)), ox = (w - k * (x1 - x0)) / 2, oy = (h - k * (y1 - y0)) / 2;
  return p => [ox + (p[0] - x0) * k, h - oy - (p[1] - y0) * k];
}

/* =====================================================================================================
   GÉOMÉTRIE
   ===================================================================================================== */

/* ---------- p2.papillon : réciproque de Pythagore, Thalès « papillon », angles alternes-internes, aire ---------- */
const PB_PAP = (() => {
  const out = [];
  PB_TRIPLES.forEach(([a, b, c]) => { for (let s10 = 1; s10 <= 40; s10++) [[a, b], [b, a]].forEach(([l1, l2]) => {
    const s = s10 / 10, AB = +(l1 * s).toFixed(1), AC = +(l2 * s).toFixed(1), BC = +(c * s).toFixed(1);
    if (AB < 3 || AC < 3 || BC > 12) return;
    [0.5, 0.6, 0.75, 0.8, 1.25, 1.5].forEach(k => {
      const AD = AB * k, AE = AC * k, DE = BC * k;
      if ([AD, AE, DE].every(v => pbIsD(v, 1) && v >= 2 && v <= 13)) out.push({ AB, AC, BC, k, AD: +AD.toFixed(1), AE: +AE.toFixed(1), DE: +DE.toFixed(1) });
    });
  }); });
  return out;
})();
function pbPapFig(d) {
  const al = Math.atan2(d.AC, d.AB), A0 = [0, 0], B0 = [-d.AB * Math.cos(al), d.AB * Math.sin(al)], C0 = [d.AC * Math.sin(al), d.AC * Math.cos(al)];
  const T = pbFit([A0, B0, C0, [-d.k * B0[0], -d.k * B0[1]], [-d.k * C0[0], -d.k * C0[1]]], 340, 230, 26);
  const A = T(A0), B = T(B0), C = T(C0), D = T([-d.k * B0[0], -d.k * B0[1]]), E = T([-d.k * C0[0], -d.k * C0[1]]);
  const w = pbUnit([0, 0], pbAdd(pbUnit(A, C), pbUnit(A, D), 1));
  return svgFig(340, 230, pbLn(B, D) + pbLn(C, E) + pbLn(B, C) + pbLn(D, E) + [B, C, D, E].map(pbDot).join('') + pbDot(A) +
    pbTx([A[0] + w[0] * 15, A[1] + w[1] * 15 + 5], 'A') + pbLab(B, 'B', A) + pbLab(C, 'C', A) + pbLab(D, 'D', A) + pbLab(E, 'E', A), 'Deux triangles ABC et ADE opposés par le sommet A');
}
pbProb({ id: 'p2.papillon', ch: 'ge', lvl: 2, pts: 4,
  ru: 'Две «бабочки»: Пифагор и Фалес', fr: 'Triangles en papillon',
  src: 'Métropole 2026 · exercice 2',
  gen(r) {
    const d = r.pick(PB_PAP), { AB, AC, BC, AD, AE, DE } = d;
    const ab2 = fx(AB * AB), ac2 = fx(AC * AC), bc2 = fx(BC * BC);
    const area = (AB + AD) * (AC + AE) / 2;
    const data = 'AB = ' + nf(AB) + ' cm, AC = ' + nf(AC) + ' cm, AD = ' + nf(AD) + ' cm et BC = ' + nf(BC) + ' cm';
    const ctx = L('Sur la figure ci-dessous, qui n\'est pas en vraie grandeur, les droites (BD) et (CE) sont sécantes en A et les droites (BC) et (DE) sont parallèles. On donne : ' + data + '.',
      'На рисунке (масштаб не соблюдён) прямые (BD) и (CE) пересекаются в точке A, а прямые (BC) и (DE) параллельны. Известно: ' + data.replace(/cm/g, 'см').replace(' et ', ' и ') + '.');
    const calc = '$BC^2 = ' + fx(BC) + '^2 = ' + bc2 + '$';
    const sum = '$AB^2 + AC^2 = ' + ab2 + ' + ' + ac2 + ' = ' + bc2 + '$';
    const sumT = 'AB^2+AC^2=' + AB + '^2+' + AC + '^2=' + ab2 + '+' + ac2 + '=' + bc2;
    return { ctx, fig: pbPapFig(d), qs: [
      { q: L('Parmi les rédactions suivantes, laquelle démontre que le triangle ABC est rectangle en A ?', 'Какое из рассуждений доказывает, что треугольник ABC прямоугольный с прямым углом A?'), red: true,
        ans: MQ(r, [
          L('Dans le triangle ABC, le plus long côté est [BC]. ' + calc + ' et ' + sum + '. Comme $BC^2 = AB^2 + AC^2$, d\'après la réciproque du théorème de Pythagore, le triangle ABC est rectangle en A.',
            'В треугольнике ABC самая длинная сторона — [BC]. ' + calc + ' и ' + sum + '. Так как $BC^2 = AB^2 + AC^2$, по обратной теореме Пифагора треугольник ABC прямоугольный с прямым углом A.'),
          L('Le triangle ABC est rectangle en A, donc, d\'après le théorème de Pythagore, $BC^2 = AB^2 + AC^2$. On calcule : ' + calc + ' et ' + sum + '. Les deux résultats sont égaux, donc ABC est bien rectangle en A.',
            'Треугольник ABC прямоугольный с прямым углом A, значит, по теореме Пифагора $BC^2 = AB^2 + AC^2$. Считаем: ' + calc + ' и ' + sum + '. Результаты равны, значит, ABC действительно прямоугольный с прямым углом A.'),
          L('Dans le triangle ABC, le plus long côté est [BC]. ' + calc + ' et ' + sum + '. Comme $BC^2 = AB^2 + AC^2$, d\'après la réciproque du théorème de Pythagore, le triangle ABC est rectangle en B.',
            'В треугольнике ABC самая длинная сторона — [BC]. ' + calc + ' и ' + sum + '. Так как $BC^2 = AB^2 + AC^2$, по обратной теореме Пифагора треугольник ABC прямоугольный с прямым углом B.'),
          L('Dans le triangle ABC, les droites (BC) et (DE) sont parallèles. Donc, d\'après le théorème de Thalès, $AD/AB = DE/BC$ et le triangle ABC est rectangle en A.',
            'В треугольнике ABC прямые (BC) и (DE) параллельны. Значит, по теореме Фалеса $AD/AB = DE/BC$, и треугольник ABC прямоугольный с прямым углом A.')], 0),
        sol: ['Чтобы доказать, что треугольник прямоугольный, нужна обратная теорема Пифагора («réciproque du théorème de Pythagore»): сравниваем квадрат самой длинной стороны с суммой квадратов двух других.',
          ['Самая длинная сторона — [BC]:', 'BC^2=' + BC + '^2=' + bc2],
          ['Сумма квадратов двух других сторон:', sumT],
          'Получилось равенство, значит, прямой угол лежит напротив самой длинной стороны [BC] — это угол A.',
          'Вариант, который начинается со слов «ABC прямоугольный», берёт как данное то, что нужно доказать: прямая теорема Пифагора («théorème de Pythagore») применяется только к треугольнику, про который уже известно, что он прямоугольный. Это порочный круг, даже если числа посчитаны верно.',
          'Вариант с выводом «прямоугольный с прямым углом B» ошибается в вершине: прямой угол всегда лежит напротив самой длинной стороны, а напротив [BC] — вершина A.',
          'Теорема Фалеса даёт равные отношения сторон, но ничего не говорит о прямых углах — из параллельности (BC) и (DE) прямой угол не следует.'] },
      { q: L('Calculer la longueur DE.', 'Вычисли длину DE.'), ans: pbNE(DE, 'cm'), sol: [
        'Точки B, A, D лежат на одной прямой, точки C, A, E — тоже, и прямые (BC) и (DE) параллельны. Это конфигурация «бабочка» теоремы Фалеса («théorème de Thalès»): треугольник ADE — уменьшенная или увеличенная копия треугольника ABC.',
        ['Поэтому отношения соответствующих сторон равны:', 'AD/AB=AE/AC=DE/BC'],
        ['Подставляем известные длины:', AD + '/' + AB + '=AE/' + AC + '=DE/' + BC],
        ['Из равенства первого и третьего отношений:', 'DE=' + BC + '*' + AD + '/' + AB + '=' + DE, 'см']] },
      { q: L('Calculer la longueur AE.', 'Вычисли длину AE.'), ans: pbNE(AE, 'cm'), sol: [
        'Используем те же равные отношения теоремы Фалеса, но теперь первое и второе.',
        ['', AD + '/' + AB + '=AE/' + AC],
        ['Отсюда', 'AE=' + AC + '*' + AD + '/' + AB + '=' + AE, 'см'],
        'Проверка смыслом: ' + (d.k < 1 ? 'AD меньше AB, значит, треугольник ADE меньше треугольника ABC, и AE должна быть меньше AC.' : 'AD больше AB, значит, треугольник ADE больше треугольника ABC, и AE должна быть больше AC.')] },
      { q: L('On veut montrer que les angles ' + pbAng('ABC') + ' et ' + pbAng('ADE') + ' sont égaux. Remettre dans l\'ordre les étapes de la démonstration.', 'Нужно доказать, что углы ' + pbAng('ABC') + ' и ' + pbAng('ADE') + ' равны. Расставь шаги доказательства по порядку.'), red: true,
        ans: ORD(r, [L('Les droites (BC) et (DE) sont coupées par la sécante (BD).', 'Прямые (BC) и (DE) пересечены секущей (BD).'),
          L('Les angles ' + pbAng('ABC') + ' et ' + pbAng('ADE') + ' sont alternes-internes.', 'Углы ' + pbAng('ABC') + ' и ' + pbAng('ADE') + ' — накрест лежащие.'),
          L('Or les droites (BC) et (DE) sont parallèles, et deux angles alternes-internes formés par deux droites parallèles sont égaux.', 'А прямые (BC) и (DE) параллельны, а накрест лежащие углы при параллельных прямых равны.'),
          L('Donc $$\\widehat{ABC}=\\widehat{ADE}$$.', 'Значит, $$\\widehat{ABC}=\\widehat{ADE}$$.')]),
        sol: ['Сначала описываем конфигурацию: две прямые и секущая (BD), на которой лежат вершины обоих углов.',
          'Потом называем тип углов: они лежат по разные стороны от секущей и между прямыми (BC) и (DE) — это накрест лежащие углы («angles alternes-internes»).',
          'Затем свойство: у параллельных прямых накрест лежащие углы равны. Без условия параллельности вывод был бы неверен — поэтому его обязательно упоминаем.',
          'И только в конце вывод.'] },
      { q: L('Déterminer l\'aire du quadrilatère BCDE.', 'Найди площадь четырёхугольника BCDE.'), ans: pbNE(area, 'cm²'), sol: [
        'Угол BAC прямой (вопрос 1). Углы DAE и BAC вертикальные («opposés par le sommet»), поэтому DAE тоже 90°; углы BAE и CAD дополняют прямой угол до 180°, значит, тоже по 90°. Диагонали [BD] и [CE] четырёхугольника перпендикулярны.',
        'Значит, BCDE состоит из четырёх прямоугольных треугольников с прямым углом в A: ABC, ACD, ADE и AEB. Площадь прямоугольного треугольника — половина произведения катетов.',
        ['Складываем четыре площади:', AB + '*' + AC + '/2+' + AC + '*' + AD + '/2+' + AD + '*' + AE + '/2+' + AE + '*' + AB + '/2=' + [AB * AC, AC * AD, AD * AE, AE * AB].map(v => fx(v / 2)).join('+') + '=' + fx(area), 'см²'],
        ['То же короче: половина произведения диагоналей, BD = ' + nf(AB + AD) + ' см и CE = ' + nf(AC + AE) + ' см.', fx(AB + AD) + '*' + fx(AC + AE) + '/2=' + fx(area), 'см²']] }] };
  } });

/* ---------- p2.terrain-tangente : Pythagore, deux perpendiculaires, Thalès, tangente, aire ---------- */
const PB_TAN = (() => {
  const out = [];
  [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [20, 21, 29], [21, 20, 29]].forEach(([a, b, c]) => {
    for (let s = 1; s <= 20; s++) {
      const AB = a * s, BC = b * s, AC = c * s;
      if (AC < 25 || AC > 80 || BC < 12) continue;
      [1.2, 1.25, 1.4, 1.5, 1.6, 1.75, 2].forEach(k => {
        const AD = AC * k, DE = BC * k, AE = AB * k;
        if ([AD, DE, AE].every(v => pbIsD(v, 1)) && AD <= 120) out.push({ AB, BC, AC, k, AD: +AD.toFixed(1), DE: +DE.toFixed(1), AE: +AE.toFixed(1) });
      });
    }
  });
  return out;
})();
function pbTanFig(d, th, EM) {
  const T = pbFit([[0, 0], [d.AE + EM, 0], [d.AE, d.DE]], 340, 200, 26);
  const A = T([0, 0]), B = T([d.AB, 0]), E = T([d.AE, 0]), M = T([d.AE + EM, 0]), C = T([d.AB, d.BC]), D = T([d.AE, d.DE]);
  return svgFig(340, 200, pbLn(A, M) + pbLn(A, D) + pbLn(B, C) + pbLn(E, D) + pbLn(D, M) + pbRA(B, A, C) + pbRA(E, A, D) + pbArc(M, A, D, 20) + pbAngTx(M, A, D, th + '°', 38) +
    [A, B, E, M, C, D].map(pbDot).join('') + pbLab(A, 'A', pbDir(-1, 0.6)) + pbLab(B, 'B', pbDir(0, 1)) + pbLab(E, 'E', pbDir(0, 1)) + pbLab(M, 'M', pbDir(0.7, 0.7)) + pbLab(C, 'C', pbDir(-0.7, -0.7)) + pbLab(D, 'D', pbDir(0, -1)),
    'Triangles ABC et AED rectangles en B et en E, point M sur la droite (AE)');
}
pbProb({ id: 'p2.terrain-tangente', ch: 'ge', lvl: 2, pts: 5,
  ru: 'Пифагор, Фалес и тангенс в одной фигуре', fr: 'Pythagore, Thalès et tangente',
  src: 'Amérique du Nord 2025 · exercice 2',
  gen(r) {
    let d, th, EM;
    for (let t = 0; t < 40; t++) { d = r.pick(PB_TAN); th = r.pick([35, 40, 50, 55, 60, 65, 70]); EM = d.DE / Math.tan(pbRad(th)); if (!pbTie(EM, 1)) break; }
    const { AB, BC, AC, AD, DE, AE } = d, EMr = pbRd(EM, 1), AM = AE + EMr, area = AM * DE / 2;
    const ctx = L('Sur la figure ci-dessous, qui n\'est pas à l\'échelle : les points A, B, E et M sont alignés ; les points A, C et D sont alignés ; le triangle ADE est rectangle en E ; le triangle ABC est rectangle en B ; AD = ' + nf(AD) + ' m ; BC = ' + nf(BC) + ' m ; AC = ' + nf(AC) + ' m et ' + pbAngEq('DME', th) + '.',
      'На рисунке (масштаб не соблюдён): точки A, B, E и M лежат на одной прямой; точки A, C и D лежат на одной прямой; треугольник ADE прямоугольный с прямым углом E; треугольник ABC прямоугольный с прямым углом B; AD = ' + nf(AD) + ' м; BC = ' + nf(BC) + ' м; AC = ' + nf(AC) + ' м и ' + pbAngEq('DME', th) + '.');
    return { ctx, fig: pbTanFig(d, th, EM), qs: [
      { q: L('Calculer la longueur AB.', 'Вычисли длину AB.'), ans: pbNE(AB, 'm'), sol: [
        'Треугольник ABC прямоугольный с прямым углом B, гипотенуза — сторона напротив прямого угла, [AC]. Значит, работает теорема Пифагора («théorème de Pythagore»).',
        ['', 'AC^2=AB^2+BC^2'],
        ['Отсюда квадрат катета — квадрат гипотенузы минус квадрат другого катета:', 'AB^2=' + AC + '^2-' + BC + '^2=' + (AC * AC) + '-' + (BC * BC) + '=' + (AB * AB)],
        ['Длина положительна, поэтому', 'AB=√' + (AB * AB) + '=' + AB, 'м']] },
      { q: L('Pourquoi les droites (DE) et (BC) sont-elles parallèles ? Choisir la justification correcte.', 'Почему прямые (DE) и (BC) параллельны? Выбери верное обоснование.'), red: true,
        ans: MQ(r, [L('Les droites (DE) et (BC) sont toutes les deux perpendiculaires à la droite (AM). Or, si deux droites sont perpendiculaires à une même droite, alors elles sont parallèles.', 'Прямые (DE) и (BC) обе перпендикулярны прямой (AM). А если две прямые перпендикулярны одной и той же прямой, то они параллельны.'),
          L('Les points A, C, D et les points A, B, E sont alignés dans le même ordre et $AD/AC = DE/BC$. Donc, d\'après la réciproque du théorème de Thalès, les droites (DE) et (BC) sont parallèles.', 'Точки A, C, D и точки A, B, E лежат на прямых в одном порядке и $AD/AC = DE/BC$. Значит, по обратной теореме Фалеса прямые (DE) и (BC) параллельны.'),
          L('Les triangles ABC et ADE sont rectangles. Donc, d\'après le théorème de Pythagore, les droites (DE) et (BC) sont parallèles.', 'Треугольники ABC и ADE прямоугольные. Значит, по теореме Пифагора прямые (DE) и (BC) параллельны.'),
          L('Sur la figure, les droites (DE) et (BC) ne se coupent pas, même si on les prolonge. Donc elles sont parallèles.', 'На рисунке прямые (DE) и (BC) не пересекаются, даже если их продолжить. Значит, они параллельны.')], 0),
        sol: ['Из условия: угол ABC прямой, значит, (BC) ⊥ (AM); угол AED прямой, значит, (DE) ⊥ (AM). Две прямые, перпендикулярные одной и той же прямой, параллельны.',
          'Вариант с обратной теоремой Фалеса не годится: длину DE мы ещё не знаем — её как раз найдём в следующем вопросе с помощью этой параллельности. Получился бы порочный круг.',
          'Теорема Пифагора даёт длины сторон, а не параллельность. А «на рисунке не пересекаются» — не доказательство: рисунок не в масштабе, и «на глаз» нельзя отличить параллельные прямые от почти параллельных.'] },
      { q: L('Calculer la longueur DE.', 'Вычисли длину DE.'), ans: pbNE(DE, 'm'), sol: [
        'Точки A, B, E лежат на одной прямой, точки A, C, D — тоже, и (BC) ∥ (DE). Это теорема Фалеса («théorème de Thalès»): треугольник AED — увеличенный треугольник ABC.',
        ['', 'AB/AE=AC/AD=BC/DE'],
        ['Нужны второе и третье отношения: в них известно всё, кроме DE.', AC + '/' + AD + '=' + BC + '/DE'],
        ['Отсюда', 'DE=' + BC + '*' + AD + '/' + AC + '=' + DE, 'м']] },
      { q: L('Calculer la longueur EM. Arrondir au dixième de mètre.', 'Вычисли длину EM. Округли до десятых метра.'), ans: pbNR(EM, 1, 'm'), sol: [
        'В треугольнике DEM угол E прямой: (DE) ⊥ (AM), а M лежит на прямой (AM). Известны угол M и катет DE, лежащий напротив него; EM — катет, прилежащий к углу M.',
        { t: 'Противолежащий и прилежащий катеты связывает тангенс:', tex: '\\tan\\widehat{DME}=\\dfrac{DE}{EM}' },
        { t: 'Отсюда', tex: 'EM=\\dfrac{DE}{\\tan ' + th + '^\\circ}=\\dfrac{' + texNum(DE) + '}{\\tan ' + th + '^\\circ}\\approx ' + texNum(pbK(EM, 3)) },
        'Округляем до десятых: EM ≈ ' + pbS(EM, 1) + ' м. Калькулятор должен быть в градусах (режим «DEG»).'] },
      { q: L('On prend EM ≈ ' + pbS(EM, 1) + ' m. Calculer l\'aire du triangle AMD.', 'Возьмём EM ≈ ' + pbS(EM, 1) + ' м. Вычисли площадь треугольника AMD.'), ans: pbNE(area, 'm²'), sol: [
        'Основание треугольника AMD — сторона [AM], а высота к ней — [DE], потому что (DE) ⊥ (AM).',
        ['Сначала AE — по той же теореме Фалеса, что и DE:', 'AE=' + AB + '*' + AD + '/' + AC + '=' + AE, 'м'],
        ['Точка E лежит между A и M, поэтому', 'AM=AE+EM=' + AE + '+' + EMr + '=' + fx(AM), 'м'],
        ['Площадь треугольника — половина произведения основания на высоту:', fx(AM) + '*' + DE + '/2=' + fx(area), 'м²']] }] };
  } });

/* ---------- p2.alignement : triangle isocèle, somme des angles, réciproque de Pythagore, cosinus, points alignés ---------- */
const PB_ALI = (() => {
  const out = [];
  [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [20, 21, 29], [21, 20, 29]].forEach(([a, b, c]) => [0.2, 0.25, 0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5, 2].forEach(s => {
    const AB = +(a * s).toFixed(2), BC = +(b * s).toFixed(2), AC = +(c * s).toFixed(2);
    if ([AB, BC, AC, BC / 2].every(v => pbIsD(v, 1)) && AB >= 2 && BC >= 3 && AB <= 9 && AC <= 11) out.push({ AB, BC, AC, BG: +(BC / 2).toFixed(1) });
  }));
  return out;
})();
function pbAliFig(d, al) {
  const be = 180 - 2 * al, A0 = [-d.AB, 0], B0 = [0, 0], C0 = [0, d.BC], F0 = [d.BC * Math.sin(pbRad(be)), d.BC * Math.cos(pbRad(be))], G0 = [d.BG * Math.sin(pbRad(be + 60)), d.BG * Math.cos(pbRad(be + 60))];
  const T = pbFit([A0, B0, C0, F0, G0], 340, 220, 28), A = T(A0), B = T(B0), C = T(C0), Fp = T(F0), G = T(G0);
  return svgFig(340, 220, pbLn(A, B) + pbLn(B, C) + pbLn(C, A) + pbLn(C, Fp) + pbLn(B, Fp) + pbLn(B, G) + pbLn(G, Fp) + pbRA(G, B, Fp, 8) + pbTick(B, C) + pbTick(B, Fp) +
    pbArc(C, B, Fp, 22) + pbAngTx(C, B, Fp, al + '°', 42) + [A, B, C, Fp, G].map(pbDot).join('') +
    pbLab(A, 'A', pbDir(-1, 0.4)) + pbLab(B, 'B', pbDir(-0.3, 1)) + pbLab(C, 'C', pbDir(-0.6, -0.8)) + pbLab(Fp, 'F', pbDir(0.6, -0.8)) + pbLab(G, 'G', pbDir(0.8, 0.6)),
    'Triangles ABC, CBF et BGF autour du point B');
}
pbProb({ id: 'p2.alignement', ch: 'ge', lvl: 2, pts: 4,
  ru: 'Лежат ли точки на одной прямой?', fr: 'Des points alignés ?',
  src: 'Polynésie 2026 · exercice 2',
  gen(r) {
    const d = r.pick(PB_ALI), al = r.pick([72, 73, 74, 75, 75, 75, 76, 77, 78]), be = 180 - 2 * al, tot = 90 + be + 60, ok = tot === 180;
    const { AB, BC, AC, BG } = d;
    const ctx = L('On donne la figure ci-dessous, qui n\'est pas en vraie grandeur. Le triangle BGF est rectangle en G et BF = BC. On sait que : AC = ' + nf(AC) + ' cm ; BC = ' + nf(BC) + ' cm ; AB = ' + nf(AB) + ' cm ; BG = ' + nf(BG) + ' cm et ' + pbAngEq('BCF', al) + '. Le but de l\'exercice est de déterminer si les points A, B et G sont alignés ou non.',
      'Дан рисунок (масштаб не соблюдён). Треугольник BGF прямоугольный с прямым углом G, и BF = BC. Известно: AC = ' + nf(AC) + ' см; BC = ' + nf(BC) + ' см; AB = ' + nf(AB) + ' см; BG = ' + nf(BG) + ' см и ' + pbAngEq('BCF', al) + '. Цель задачи — выяснить, лежат ли точки A, B и G на одной прямой.');
    const sumEq = '$$\\widehat{ABC}+\\widehat{CBF}+\\widehat{FBG}=' + [90, be, 60].map(pbDg).join('+') + '=' + pbDg(tot) + '$$';
    const wrongFig = L('Oui, car sur la figure les points A, B et G semblent alignés.', 'Да, потому что на рисунке точки A, B и G выглядят лежащими на одной прямой.');
    const wrongRect = L('Non, car le triangle BGF est rectangle en G, donc la droite (BG) ne peut pas prolonger la droite (AB).', 'Нет, потому что треугольник BGF прямоугольный с прямым углом G, значит, прямая (BG) не может продолжать прямую (AB).');
    const q5 = ok ? [
      L('Oui : ' + sumEq + '. L\'angle ' + pbAng('ABG') + ' est donc un angle plat : les points A, B et G sont alignés.', 'Да: ' + sumEq + '. Значит, угол ' + pbAng('ABG') + ' развёрнутый: точки A, B и G лежат на одной прямой.'),
      L('On ne peut pas conclure : la figure n\'est pas en vraie grandeur, il faudrait mesurer sur un dessin précis.', 'Сделать вывод нельзя: рисунок не в масштабе, нужно измерить на точном чертеже.'), wrongFig, wrongRect]
      : [L('Non : ' + sumEq + '. Cette somme n\'est pas égale à 180°, donc l\'angle ' + pbAng('ABG') + ' n\'est pas plat : les points A, B et G ne sont pas alignés.', 'Нет: ' + sumEq + '. Сумма не равна 180°, значит, угол ' + pbAng('ABG') + ' не развёрнутый: точки A, B и G не лежат на одной прямой.'),
        L('Oui : ' + sumEq + ', c\'est presque 180°, donc les points A, B et G sont alignés.', 'Да: ' + sumEq + ', это почти 180°, значит, точки A, B и G лежат на одной прямой.'), wrongFig, wrongRect];
    return { ctx, fig: pbAliFig(d, al), qs: [
      { q: L('Dans le triangle CBF, pourquoi l\'angle ' + pbAng('CFB') + ' mesure-t-il ' + al + '° ? Choisir la justification correcte.', 'Почему в треугольнике CBF угол ' + pbAng('CFB') + ' равен ' + al + '°? Выбери верное обоснование.'), red: true,
        ans: MQ(r, [L('Le triangle CBF est isocèle en B, car BC = BF. Or, dans un triangle isocèle, les angles à la base sont égaux. Donc ' + pbAngEq('CFB', al).replace('}=', '}=\\widehat{BCF}=') + '.', 'Треугольник CBF равнобедренный с вершиной B, так как BC = BF. А в равнобедренном треугольнике углы при основании равны. Значит, ' + pbAngEq('CFB', al).replace('}=', '}=\\widehat{BCF}=') + '.'),
          L('La somme des angles d\'un triangle est égale à 180°. Donc ' + pbAngEq('CFB', al) + '.', 'Сумма углов треугольника равна 180°. Значит, ' + pbAngEq('CFB', al) + '.'),
          L('Le triangle CBF est équilatéral, donc ses trois angles sont égaux. Donc ' + pbAngEq('CFB', al) + '.', 'Треугольник CBF равносторонний, значит, все его углы равны. Значит, ' + pbAngEq('CFB', al) + '.'),
          L('Sur la figure, les angles ' + pbAng('BCF') + ' et ' + pbAng('CFB') + ' ont la même ouverture. Donc ' + pbAngEq('CFB', al) + '.', 'На рисунке углы ' + pbAng('BCF') + ' и ' + pbAng('CFB') + ' одинаково раскрыты. Значит, ' + pbAngEq('CFB', al) + '.')], 0),
        sol: ['В условии BF = BC, значит, треугольник CBF равнобедренный с вершиной B («triangle isocèle en B»), а [CF] — его основание. Углы при основании равнобедренного треугольника равны, поэтому угол CFB равен углу BCF.',
          'Сумма углов (180°) сама по себе не даёт величину угла: для этого нужно знать два других угла, а мы знаем только один.',
          'Равносторонним треугольник не является: известно лишь BC = BF; к тому же у равностороннего треугольника все углы по 60°, а не по ' + al + '°.',
          '«На рисунке одинаковые» — не доказательство: рисунок не в масштабе.'] },
      { q: L('Calculer la mesure de l\'angle ' + pbAng('CBF') + '.', 'Вычисли величину угла ' + pbAng('CBF') + '.'), ans: N(be, { unit: '°' }), sol: [
        'Сумма углов треугольника равна 180°, а два угла треугольника CBF мы уже знаем: по ' + al + '°.',
        ['', '180-' + al + '-' + al + '=' + be, '°']] },
      { q: L('On veut démontrer que le triangle ABC est rectangle. Remettre dans l\'ordre les étapes de la démonstration.', 'Нужно доказать, что треугольник ABC прямоугольный. Расставь шаги доказательства по порядку.'), red: true,
        ans: ORD(r, [L('Dans le triangle ABC, le plus long côté est [AC].', 'В треугольнике ABC самая длинная сторона — [AC].'),
          L('D\'une part $AC^2 = ' + fx(AC) + '^2 = ' + fx(AC * AC) + '$ ; d\'autre part $AB^2 + BC^2 = ' + fx(AB * AB) + ' + ' + fx(BC * BC) + ' = ' + fx(AC * AC) + '$.', 'С одной стороны, $AC^2 = ' + fx(AC) + '^2 = ' + fx(AC * AC) + '$; с другой стороны, $AB^2 + BC^2 = ' + fx(AB * AB) + ' + ' + fx(BC * BC) + ' = ' + fx(AC * AC) + '$.'),
          L('Donc $AC^2 = AB^2 + BC^2$.', 'Значит, $AC^2 = AB^2 + BC^2$.'),
          L('D\'après la réciproque du théorème de Pythagore, le triangle ABC est rectangle en B.', 'По обратной теореме Пифагора треугольник ABC прямоугольный с прямым углом B.')]),
        sol: ['Сначала находим самую длинную сторону — только её квадрат сравнивают с суммой квадратов двух других.',
          'Потом считаем обе части по отдельности и не пишем знак «=» между ними, пока не убедились, что числа совпали.',
          'Только после совпадения пишем вывод и называем теорему: обратная теорема Пифагора («réciproque du théorème de Pythagore»). Прямой угол — напротив самой длинной стороны [AC], то есть угол B.'] },
      { q: L('Dans le triangle rectangle BGF, calculer la mesure de l\'angle ' + pbAng('FBG') + '.', 'В прямоугольном треугольнике BGF вычисли величину угла ' + pbAng('FBG') + '.'), ans: N(60, { unit: '°' }), sol: [
        'В треугольнике BGF прямой угол G, значит, гипотенуза — [BF], и BF = BC = ' + nf(BC) + ' см. Катет [BG] прилежит к углу FBG.',
        { t: 'Прилежащий катет и гипотенуза — это косинус:', tex: '\\cos\\widehat{FBG}=\\dfrac{BG}{BF}=\\dfrac{' + texNum(BG) + '}{' + texNum(BC) + '}=0{,}5' },
        'Угол, косинус которого равен 0,5, — это 60° (на калькуляторе: arccos 0,5 = 60).'] },
      { q: L('Les points A, B et G sont-ils alignés ? Choisir la réponse correctement justifiée.', 'Лежат ли точки A, B и G на одной прямой? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, q5, 0),
        sol: ['Точки A, B и G лежат на одной прямой ровно тогда, когда угол ABG развёрнутый, то есть равен 180°.',
          'Лучи [BC) и [BF) идут внутри этого угла, поэтому он складывается из трёх углов: ABC = 90° (вопрос 3), CBF = ' + be + '° (вопрос 2), FBG = 60° (вопрос 4).',
          ['', '90+' + be + '+60=' + tot, '°'],
          ok ? 'Ровно 180°: угол ABG развёрнутый, точки лежат на одной прямой. Мерить по рисунку не нужно и нельзя — он не в масштабе, а вычисление и есть доказательство.'
            : tot + '° ≠ 180°: угол не развёрнутый, точки не лежат на одной прямой. «Почти 180°» не считается: даже при разнице в 1° точки не на одной прямой, просто на рисунке этого не видно.',
          'Прямой угол G в треугольнике BGF ничего не говорит о положении точки A — этот довод не по делу.'] }] };
  } });

/* ---------- p2.panneaux : Pythagore, pourcentage, tangente, Thalès ---------- */
function pbPanFig(d) {
  const T = pbFit([[0, 0], [d.PS, 0], [0, d.HP]], 340, 210, 36);
  const P = T([0, 0]), S = T([d.PS, 0]), H = T([0, d.HP]), Tt = T([d.PS - d.ST, 0]), U = T([d.PS - d.ST, d.UT]);
  return svgFig(340, 210, pbLn(H, P) + pbLn(P, S) + pbLn(S, H, 'fhl') + pbLn(U, Tt) + pbRA(P, H, S) + pbRA(Tt, U, S) +
    pbTx([P[0] - 8, (H[1] + P[1]) / 2 + 5], d.HP + ' cm', 'ftm', 'end') + pbTx([(P[0] + S[0]) / 2, P[1] + 34], d.PS + ' cm', 'ftm') + pbTx([U[0] - 6, (U[1] + Tt[1]) / 2 + 5], d.UT + ' cm', 'ftm', 'end') +
    [H, P, S, U, Tt].map(pbDot).join('') + pbLab(H, 'H', pbDir(-0.6, -0.8)) + pbLab(P, 'P', pbDir(-0.7, 0.7)) + pbLab(S, 'S', pbDir(0.7, 0.7)) + pbLab(U, 'U', pbDir(0.5, -0.9)) + pbLab(Tt, 'T', pbDir(0, 1)),
    'Équerre HPS rectangle en P avec une barre de renfort UT');
}
pbProb({ id: 'p2.panneaux', ch: 'ge', lvl: 2, pts: 5,
  ru: 'Опора для солнечных панелей', fr: 'Support de panneaux solaires',
  src: 'Polynésie 2023 · exercice 2',
  gen(r) {
    let HP, PS, UT, Lp, HS, ang, ST;
    for (let t = 0; t < 80; t++) {
      HP = r.pick([80, 85, 90, 95, 100]); PS = r.pick([125, 130, 135, 140, 145, 150, 155]); UT = r.pick([40, 45, 50, 55, 60]); Lp = r.pick([1600, 1650, 1700, 1750, 1800]);
      HS = Math.hypot(HP, PS); ang = pbDeg(Math.atan(HP / PS)); ST = PS * UT / HP;
      if (UT <= HP - 25 && !pbTie(HS, 1) && !pbTie(ang, 1) && !pbTie(ST, 1) && Math.abs(HS - 0.95 * Lp / 10) > 0.8) break;
    }
    const nm = r.pick(PRENOMS_F), LpT = String(Lp).replace(/\B(?=(\d{3})+(?!\d))/g, ' '), Lc = Lp / 10, lim = 0.95 * Lc, conf = HS >= lim, opt = ang >= 30 && ang <= 35, HSs = pbS(HS, 1), HSk = pbK(HS, 1);
    const ctx = L(nm + ' veut installer des panneaux photovoltaïques sur le sol plat de son jardin. Un panneau mesure ' + LpT + ' mm de long ; il fonctionne de façon optimale si son inclinaison par rapport à l\'horizontale est comprise entre 30° et 35°. ' + nm + ' fabrique un support formé d\'équerres identiques ; le panneau est posé sur le côté [HS]. Sur le plan d\'une équerre ci-dessous, le triangle HPS est rectangle en P, HP = ' + HP + ' cm et PS = ' + PS + ' cm. Une barre de renfort [UT] de ' + UT + ' cm, perpendiculaire à [PS], relie le point U du segment [HS] et le point T du segment [PS].',
      nm + ' хочет поставить солнечные панели на ровной земле в саду. Длина панели — ' + LpT + ' мм; панель работает оптимально, если её наклон к горизонту от 30° до 35°. ' + nm + ' делает опору из одинаковых угольников; панель лежит на стороне [HS]. На чертеже угольника треугольник HPS прямоугольный с прямым углом P, HP = ' + HP + ' см и PS = ' + PS + ' см. Распорка [UT] длиной ' + UT + ' см, перпендикулярная [PS], соединяет точку U отрезка [HS] и точку T отрезка [PS].');
    const p95 = '$0.95*' + Lc + ' = ' + fx(lim) + '$', wrongBase = pbS(0.95 * pbRd(HS, 1), 1), cmp = conf ? '≥' : '<';
    const good = L((conf ? 'Oui' : 'Non') + ' : 95 % de ' + Lc + ' cm, c\'est ' + p95 + ' cm, et HS ≈ ' + HSs + ' cm, donc $' + HSk + ' ' + cmp + ' ' + fx(lim) + '$.',
      (conf ? 'Да' : 'Нет') + ': 95 % от ' + Lc + ' см — это ' + p95 + ' см, а HS ≈ ' + HSs + ' см, и $' + HSk + ' ' + cmp + ' ' + fx(lim) + '$.');
    const vs95 = L('Oui : HS ≈ ' + HSs + ' cm et $' + HSk + ' > 95$.', 'Да: HS ≈ ' + HSs + ' см, и $' + HSk + ' > 95$.');
    const ofHS = 0.95 * HS < Lc ? L('Non : 95 % de ' + HSs + ' cm, c\'est environ ' + wrongBase + ' cm, ce qui est moins que ' + Lc + ' cm.', 'Нет: 95 % от ' + HSs + ' см — это примерно ' + wrongBase + ' см, а это меньше ' + Lc + ' см.')
      : L('Non : le support est conforme seulement si HS mesure exactement 95 % de ' + Lc + ' cm, c\'est-à-dire ' + nf(lim) + ' cm.', 'Нет: опора подходит, только если HS равна ровно 95 % от ' + Lc + ' см, то есть ' + nf(lim) + ' см.');
    const last = HS < Lc ? L('Non : HS ≈ ' + HSs + ' cm est plus petit que la longueur du panneau, ' + Lc + ' cm.', 'Нет: HS ≈ ' + HSs + ' см меньше длины панели, ' + Lc + ' см.')
      : L('Non : 95 % de ' + Lc + ' cm, c\'est ' + p95 + ' cm, et HS ≈ ' + HSs + ' cm dépasse cette longueur, donc le support ne convient pas.', 'Нет: 95 % от ' + Lc + ' см — это ' + p95 + ' см, а HS ≈ ' + HSs + ' см больше, значит, опора не подходит.');
    const q2 = [good, vs95, ofHS, last];
    return { ctx, fig: pbPanFig({ HP, PS, UT, ST }), qs: [
      { q: L('Calculer la longueur HS. Arrondir au millimètre.', 'Вычисли длину HS. Округли до миллиметра.'), ans: pbNR(HS, 1, 'cm'), sol: [
        'Треугольник HPS прямоугольный с прямым углом P, гипотенуза — [HS]. По теореме Пифагора («théorème de Pythagore»):',
        ['', 'HS^2=HP^2+PS^2=' + HP + '^2+' + PS + '^2=' + (HP * HP) + '+' + (PS * PS) + '=' + (HP * HP + PS * PS)],
        ['', 'HS=√' + (HP * HP + PS * PS) + '≈' + pbK(HS, 3), 'см'],
        'До миллиметра — значит, до десятых сантиметра (1 мм = 0,1 см): HS ≈ ' + HSs + ' см.'] },
      { q: L('Le fabricant conseille que la longueur HS mesure au moins 95 % de la longueur du panneau. Ce support est-il conforme à ce conseil ? Choisir la réponse correctement justifiée.', 'Производитель советует, чтобы HS была не меньше 95 % длины панели. Соответствует ли опора совету? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, q2, 0),
        sol: ['Сначала переводим длину панели в сантиметры: ' + LpT + ' мм = ' + Lc + ' см. Потом считаем 95 % именно от длины панели — так сказано в совете.',
          ['', '0.95*' + Lc + '=' + fx(lim), 'см'],
          'HS ≈ ' + HSs + ' см ' + (conf ? 'не меньше' : 'меньше') + ' ' + nf(lim) + ' см, поэтому опора ' + (conf ? 'соответствует совету.' : 'совету не соответствует.'),
          'Сравнивать HS со всей длиной панели неверно: совет допускает HS короче панели, лишь бы не меньше 95 %. Сравнивать с числом 95 бессмысленно: 95 — это проценты, а не сантиметры. И 95 % нужно брать от длины панели, а не от HS.'] },
      { q: L('Dans le triangle HPS rectangle en P, quelle égalité permet de calculer la mesure de l\'angle ' + pbAng('HSP') + ' à partir des longueurs HP et PS ?', 'Какое равенство позволяет найти угол ' + pbAng('HSP') + ' прямоугольного треугольника HPS (прямой угол P) по длинам HP и PS?'), red: true,
        ans: MQ(r, ['$$\\tan\\widehat{HSP}=\\dfrac{HP}{PS}$$', '$$\\tan\\widehat{HSP}=\\dfrac{PS}{HP}$$', '$$\\sin\\widehat{HSP}=\\dfrac{HP}{PS}$$', '$$\\cos\\widehat{HSP}=\\dfrac{HP}{PS}$$'], 0),
        sol: ['Для угла S: катет [HP] лежит напротив него (противолежащий), катет [PS] — рядом с ним (прилежащий), [HS] — гипотенуза.',
          'Тангенс — отношение противолежащего катета к прилежащему: tan HSP = HP / PS. Обе длины даны точно — удобно.',
          'Синус и косинус — это отношения к гипотенузе: sin = HP / HS, cos = PS / HS; делить на PS в них нельзя. А PS / HP — тангенс другого острого угла, H.'] },
      { q: L('Calculer la mesure de l\'angle ' + pbAng('HSP') + ', arrondie au dixième de degré.', 'Вычисли величину угла ' + pbAng('HSP') + ', округлив до десятых градуса.'), ans: pbNR(ang, 1, '°'), sol: [
        { t: 'По предыдущему вопросу:', tex: '\\tan\\widehat{HSP}=\\dfrac{HP}{PS}=\\dfrac{' + HP + '}{' + PS + '}' },
        'На калькуляторе (в режиме градусов): arctan(' + HP + ' ÷ ' + PS + ') ≈ ' + pbS(ang, 3) + '°, то есть ≈ ' + pbS(ang, 1) + '°.',
        opt ? 'Угол между 30° и 35° — панели будут работать оптимально.' : 'Угол не попадает в промежуток от 30° до 35° — оптимальной работы не будет.'] },
      { q: L('Calculer la longueur ST. Arrondir au millimètre.', 'Вычисли длину ST. Округли до миллиметра.'), ans: pbNR(ST, 1, 'cm'), sol: [
        'Прямые (UT) и (HP) обе перпендикулярны (PS), значит, они параллельны.',
        'В треугольнике SHP точка U лежит на [SH], точка T — на [SP], и (UT) ∥ (HP). По теореме Фалеса («théorème de Thalès»):',
        ['', 'ST/SP=SU/SH=UT/PH'],
        ['Берём первое и последнее отношения:', 'ST=' + PS + '*' + UT + '/' + HP + '≈' + pbK(ST, 3), 'см'],
        'Округляем до миллиметра: ST ≈ ' + pbS(ST, 1) + ' см. (Можно и через тангенс: tan HSP = UT / ST — получится то же самое.)'] }] };
  } });

/* ---------- p2.reciproque-thales : longueur sur un segment, Pythagore, trigonométrie, réciproque de Thalès, homothétie ---------- */
const PB_RTH = (() => {
  const out = [];
  PB_TRIPLES.forEach(([a, b, c]) => [0.1, 0.2, 0.25, 0.5, 1].forEach(s => [[a, b], [b, a]].forEach(([l1, l2]) => {
    const AB = +(l1 * s).toFixed(2), AM = +(l2 * s).toFixed(2), MB = +(c * s).toFixed(2);
    if (![AB, AM, MB].every(v => pbIsD(v, 1)) || AB < 2.5 || AM < 2.5 || AB > 9 || AM > 9 || Math.max(AB, AM) / Math.min(AB, AM) > 2.5) return;
    [0.25, 0.4, 0.5, 0.8].forEach(k => {
      const AT = AM * k, AE = AB * k;
      if (pbIsD(AT, 2) && pbIsD(AE, 2) && AT >= 1 && AE >= 1) out.push({ AB, AM, MB, k, AT: +AT.toFixed(2), AE: +AE.toFixed(2), MT: +(AT + AM).toFixed(2) });
    });
  })));
  return out;
})();
function pbRthFig(d) {
  const P0 = [[0, 0], [d.AM, 0], [0, -d.AB], [-d.AT, 0], [0, d.AE]], T = pbFit(P0, 340, 230, 26), [A, M, B, Tp, E] = P0.map(T);
  return svgFig(340, 230, pbLn(Tp, M) + pbLn(E, B) + pbLn(Tp, E) + pbLn(B, M) + pbRA(A, M, B) + [A, M, B, Tp, E].map(pbDot).join('') +
    pbLab(A, 'A', pbDir(0.75, -0.65)) + pbLab(M, 'M', pbDir(1, 0)) + pbLab(B, 'B', pbDir(0, 1)) + pbLab(Tp, 'T', pbDir(-1, 0)) + pbLab(E, 'E', pbDir(0, -1)),
    'Triangles AET et ABM opposés par le sommet A');
}
pbProb({ id: 'p2.reciproque-thales', ch: 'ge', lvl: 2, pts: 4,
  ru: 'Обратная теорема Фалеса и гомотетия', fr: 'Réciproque de Thalès et homothétie',
  src: 'Antilles-Guyane 2026 · exercice 1',
  gen(r) {
    let d, ang;
    for (let t = 0; t < 40; t++) { d = r.pick(PB_RTH); ang = pbDeg(Math.atan(d.AM / d.AB)); if (!pbTie(ang, 0)) break; }
    const { AB, AM, MB, AT, AE, MT, k } = d, rk = AM / AT;
    const ctx = L('Sur la figure ci-dessous, qui n\'est pas représentée en vraie grandeur : les droites (BE) et (TM) se coupent en A ; le point A appartient aux segments [TM] et [BE] ; le triangle ABM est rectangle en A ; AT = ' + nf(AT) + ' m ; MT = ' + nf(MT) + ' m ; AE = ' + nf(AE) + ' m et MB = ' + nf(MB) + ' m.',
      'На рисунке (масштаб не соблюдён): прямые (BE) и (TM) пересекаются в точке A; точка A лежит на отрезках [TM] и [BE]; треугольник ABM прямоугольный с прямым углом A; AT = ' + nf(AT) + ' м; MT = ' + nf(MT) + ' м; AE = ' + nf(AE) + ' м и MB = ' + nf(MB) + ' м.');
    const rat = [-rk, rk, -k, k].map(v => L(nf(v), nf(v)));
    return { ctx, fig: pbRthFig(d), qs: [
      { q: L('Calculer la longueur AM.', 'Вычисли длину AM.'), ans: pbNE(AM, 'm'), sol: [
        'Точка A лежит на отрезке [TM], значит, отрезок [TM] складывается из [TA] и [AM]: TM = TA + AM.',
        ['Отсюда', 'AM=MT-AT=' + MT + '-' + AT + '=' + AM, 'м']] },
      { q: L('Calculer la longueur AB.', 'Вычисли длину AB.'), ans: pbNE(AB, 'm'), sol: [
        'Треугольник ABM прямоугольный с прямым углом A, гипотенуза — [MB]. По теореме Пифагора («théorème de Pythagore») MB² = AB² + AM².',
        ['', 'AB^2=MB^2-AM^2=' + MB + '^2-' + AM + '^2=' + fx(MB * MB) + '-' + fx(AM * AM) + '=' + fx(AB * AB)],
        ['', 'AB=√' + fx(AB * AB) + '=' + AB, 'м']] },
      { q: L('Calculer la mesure de l\'angle ' + pbAng('ABM') + '. Arrondir au degré.', 'Вычисли величину угла ' + pbAng('ABM') + '. Округли до градуса.'), ans: pbNR(ang, 0, '°'), sol: [
        'В прямоугольном треугольнике ABM для угла B: катет [AM] противолежащий, катет [AB] прилежащий. Обе длины известны точно — берём тангенс.',
        { t: '', tex: '\\tan\\widehat{ABM}=\\dfrac{AM}{AB}=\\dfrac{' + texNum(AM) + '}{' + texNum(AB) + '}' },
        'arctan(' + nf(AM) + ' ÷ ' + nf(AB) + ') ≈ ' + pbS(ang, 2) + '°, округляем до градуса: ' + pbRd(ang, 0) + '°. (Через косинус cos B = AB / MB получится то же самое.)'] },
      { q: L('On veut démontrer que les droites (TE) et (BM) sont parallèles. Remettre dans l\'ordre les étapes de la démonstration.', 'Нужно доказать, что прямые (TE) и (BM) параллельны. Расставь шаги доказательства по порядку.'), red: true,
        ans: ORD(r, [L('Les points T, A, M d\'une part, et les points E, A, B d\'autre part, sont alignés dans le même ordre.', 'Точки T, A, M и точки E, A, B лежат на двух прямых в одном и том же порядке.'),
          L('$AT/AM = ' + fx(AT) + '/' + fx(AM) + ' = ' + fx(k) + '$ et $AE/AB = ' + fx(AE) + '/' + fx(AB) + ' = ' + fx(k) + '$.', '$AT/AM = ' + fx(AT) + '/' + fx(AM) + ' = ' + fx(k) + '$ и $AE/AB = ' + fx(AE) + '/' + fx(AB) + ' = ' + fx(k) + '$.'),
          L('Donc $AT/AM = AE/AB$.', 'Значит, $AT/AM = AE/AB$.'),
          L('D\'après la réciproque du théorème de Thalès, les droites (TE) et (BM) sont parallèles.', 'По обратной теореме Фалеса прямые (TE) и (BM) параллельны.')]),
        sol: ['Обратная теорема Фалеса («réciproque du théorème de Thalès») требует двух условий: точки лежат на двух прямых в одном и том же порядке и отношения равны. Поэтому сначала — расположение точек.',
          'Потом каждое отношение считаем отдельно: заранее писать «=» между ними нельзя, ведь их равенство мы и проверяем.',
          'Когда отношения совпали, записываем равенство и только в конце называем теорему и делаем вывод.'] },
      { q: L('Le triangle ABM est l\'image du triangle AET par une homothétie de centre A. Quel est le rapport de cette homothétie ?', 'Треугольник ABM — образ треугольника AET при гомотетии с центром A. Чему равен коэффициент этой гомотетии?'),
        ans: MQ(r, rat, 0), sol: [
        'Гомотетия с центром A переводит T в M и E в B. Модуль коэффициента — во сколько раз образ больше исходной фигуры:',
        ['', 'AM/AT=' + AM + '/' + AT + '=' + fx(rk)],
        'Знак: точка и её образ (T и M) лежат по разные стороны от центра A, поэтому коэффициент отрицательный: ' + nf(-rk) + '.',
        nf(-k) + ' — коэффициент обратной гомотетии (из ABM в AET), а положительные числа подошли бы, только если бы T и M лежали по одну сторону от A.'] }] };
  } });

/* =====================================================================================================
   GRANDEURS ET MESURES
   ===================================================================================================== */

/* ---------- p2.gobelet : Pythagore, Thalès, volume d'un cône, réduction (k³), tronc de cône ---------- */
const PB_GOB = (() => {
  const out = [];
  [[9, 40, 41], [5, 12, 13], [7, 24, 25], [8, 15, 17], [12, 35, 37], [13, 84, 85], [16, 63, 65], [3, 4, 5]].forEach(([a, b, c]) => [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 1].forEach(s => {
    const AD = +(a * s).toFixed(2), OA = +(b * s).toFixed(2), OD = +(c * s).toFixed(2);
    if (![AD, OA, OD].every(v => pbIsD(v, 1)) || AD < 1.2 || AD > 3 || OA < 4 || OA > 10) return;
    [2, 2.5, 3].forEach(m => {
      const BC = AD * m, OB = OA * m, Vb = Math.PI * BC * BC * OB / 3, Vs = Math.PI * AD * AD * OA / 3;
      if (!pbIsD(BC, 1) || !pbIsD(OB, 1) || OB - OA < 5 || OB - OA > 14 || BC > 6) return;
      if (pbTie(Vb, 0) || pbTie(Vs, 0) || pbTie(Vb - Vs, 0) || pbRd(Vb) - pbRd(Vs) !== pbRd(Vb - Vs)) return;
      out.push({ AD, OA, OD, m, BC: +BC.toFixed(1), OB: +OB.toFixed(1), Vb, Vs });
    });
  }));
  return out;
})();
function pbGobFig(d) {
  const T = pbFit([[-d.BC, 0], [d.BC, d.OB]], 300, 240, 30), sh = p => [p[0] + 20, p[1] + 6];
  const O = sh(T([0, 0])), A = sh(T([0, d.OA])), B = sh(T([0, d.OB])), D = sh(T([d.AD, d.OA])), C = sh(T([d.BC, d.OB])), D2 = sh(T([-d.AD, d.OA])), C2 = sh(T([-d.BC, d.OB]));
  const el = (c, rx, cls) => '<ellipse cx="' + pbC(c[0]) + '" cy="' + pbC(c[1]) + '" rx="' + pbC(rx) + '" ry="' + pbC(rx * 0.16) + '" class="' + cls + '" fill="none"/>';
  return svgFig(340, 252, pbPl([D2, D, C, C2], 'ffill', true) + el(B, C[0] - B[0], 'fl') + el(A, D[0] - A[0], 'fl2') + pbLn(O, D, 'fdash') + pbLn(O, D2, 'fdash') + pbLn(D, C) + pbLn(D2, C2) + pbLn(O, B, 'fdash') +
    pbLn(A, D) + pbLn(B, C) + pbRA(A, D, O, 7) + pbRA(B, C, O, 8) + [O, A, B, C, D].map(pbDot).join('') +
    pbLab(O, 'O', pbDir(0, 1)) + pbLab(A, 'A', pbDir(-1, 0.3)) + pbLab(B, 'B', pbDir(-1, -0.25), 15) + pbLab(C, 'C', pbDir(1, -0.2)) + pbLab(D, 'D', pbDir(1, 0.1)),
    'Coupe d\'un cône de sommet O ; le gobelet est la partie entre les disques de rayons AD et BC');
}
pbProb({ id: 'p2.gobelet', ch: 'gm', lvl: 2, pts: 5,
  ru: 'Стаканчик — усечённый конус', fr: 'Un gobelet en tronc de cône',
  src: 'Asie 2026 · exercice 2',
  gen(r) {
    const d = r.pick(PB_GOB), { AD, OA, OD, m, BC, OB, Vb, Vs } = d, Vg = Vb - Vs;
    const kT = m === 3 ? '1/3' : fx(1 / m), k3T = m === 3 ? '1/27' : fx(Math.pow(1 / m, 3)), mT = fx(m);
    const ctx = L('Une entreprise fabrique des gobelets en forme de tronc de cône, c\'est-à-dire un cône coupé par un plan parallèle à sa base. La figure ci-dessous, qui n\'est pas à l\'échelle, représente un grand cône de sommet O ; le gobelet est la partie grisée. Les points O, A et B sont alignés ; les points O, D et C sont alignés ; les angles ' + pbAng('OAD') + ' et ' + pbAng('OBC') + ' sont droits. OD = ' + nf(OD) + ' cm ; AD = ' + nf(AD) + ' cm ; BC = ' + nf(BC) + ' cm. Rappel : le volume d\'un cône de rayon R et de hauteur H est $$V=\\dfrac{\\pi\\times R^2\\times H}{3}$$.',
      'Компания делает стаканчики в форме усечённого конуса — это конус, срезанный плоскостью, параллельной основанию. На рисунке (масштаб не соблюдён) — большой конус с вершиной O; стаканчик — закрашенная часть. Точки O, A и B лежат на одной прямой; точки O, D и C — тоже; углы ' + pbAng('OAD') + ' и ' + pbAng('OBC') + ' прямые. OD = ' + nf(OD) + ' см; AD = ' + nf(AD) + ' см; BC = ' + nf(BC) + ' см. Напоминание: объём конуса с радиусом основания R и высотой H равен $$V=\\dfrac{\\pi\\times R^2\\times H}{3}$$.');
    const opt = (k, f, v) => L('$k = ' + k + '$ et $V_1 = ' + f + '*V_2$', '$k = ' + k + '$ и $V_1 = ' + f + '*V_2$');
    return { ctx, fig: pbGobFig(d), qs: [
      { q: L('Calculer la longueur OA.', 'Вычисли длину OA.'), ans: pbNE(OA, 'cm'), sol: [
        'Угол OAD прямой, значит, треугольник OAD прямоугольный с гипотенузой [OD]. По теореме Пифагора («théorème de Pythagore») OD² = OA² + AD².',
        ['', 'OA^2=OD^2-AD^2=' + OD + '^2-' + AD + '^2=' + fx(OD * OD) + '-' + fx(AD * AD) + '=' + fx(OA * OA)],
        ['', 'OA=√' + fx(OA * OA) + '=' + OA, 'см']] },
      { q: L('Pourquoi les droites (BC) et (AD) sont-elles parallèles ? Choisir la justification correcte.', 'Почему прямые (BC) и (AD) параллельны? Выбери верное обоснование.'), red: true,
        ans: MQ(r, [L('Les droites (AD) et (BC) sont toutes les deux perpendiculaires à la droite (OB). Or, si deux droites sont perpendiculaires à une même droite, alors elles sont parallèles.', 'Прямые (AD) и (BC) обе перпендикулярны прямой (OB). А если две прямые перпендикулярны одной и той же прямой, то они параллельны.'),
          L('Les points O, A, B et O, D, C sont alignés. Donc, d\'après le théorème de Thalès, les droites (BC) et (AD) sont parallèles.', 'Точки O, A, B и O, D, C лежат на прямых. Значит, по теореме Фалеса прямые (BC) и (AD) параллельны.'),
          L('Les points O, A, B et O, D, C sont alignés dans le même ordre et $OA/OB = AD/BC$. Donc, d\'après la réciproque du théorème de Thalès, les droites sont parallèles.', 'Точки O, A, B и O, D, C лежат в одном порядке и $OA/OB = AD/BC$. Значит, по обратной теореме Фалеса прямые параллельны.'),
          L('Sur la figure, les droites (BC) et (AD) ne se coupent pas. Donc elles sont parallèles.', 'На рисунке прямые (BC) и (AD) не пересекаются. Значит, они параллельны.')], 0),
        sol: ['Углы OAD и OBC прямые: обе прямые (AD) и (BC) перпендикулярны оси (OB). Две прямые, перпендикулярные одной прямой, параллельны.',
          'Теорема Фалеса («théorème de Thalès») параллельность не доказывает — наоборот, она её требует в условии. Обратную теорему здесь применить нельзя: длину OB мы ещё не знаем, её найдём только в следующем вопросе.',
          'Рисунок не в масштабе и доказательством не является.'] },
      { q: L('Calculer la longueur OB.', 'Вычисли длину OB.'), ans: pbNE(OB, 'cm'), sol: [
        'Точки O, A, B лежат на одной прямой, точки O, D, C — тоже, и (AD) ∥ (BC). По теореме Фалеса:',
        ['', 'OA/OB=OD/OC=AD/BC'],
        ['Берём первое и третье отношения: в них неизвестно только OB.', OA + '/OB=' + AD + '/' + BC],
        ['', 'OB=' + OA + '*' + BC + '/' + AD + '=' + OB, 'см']] },
      { q: L('Calculer le volume du grand cône de hauteur OB, en cm³, arrondi à l\'unité.', 'Вычисли объём большого конуса высотой OB в см³, округлив до единиц.'), ans: pbNR(Vb, 0, 'cm³'), sol: [
        'Радиус основания большого конуса — BC = ' + nf(BC) + ' см, высота — OB = ' + nf(OB) + ' см.',
        { t: '', tex: 'V_2=\\dfrac{\\pi\\times ' + texNum(BC) + '^2\\times ' + texNum(OB) + '}{3}\\approx ' + texNum(pbK(Vb, 2)) + '\\text{ см}^3' },
        'Округляем до единиц: ≈ ' + pbRd(Vb) + ' см³.'] },
      { q: L('Le petit cône, de sommet O et de hauteur OA, est une réduction du grand cône de coefficient k. On note $V_1$ le volume du petit cône et $V_2$ celui du grand cône. Quelle proposition est correcte ?', 'Маленький конус с вершиной O и высотой OA — уменьшенная копия большого конуса с коэффициентом k. Обозначим $V_1$ объём маленького конуса, $V_2$ — большого. Какое утверждение верно?'), red: true,
        ans: MQ(r, [opt(kT, '(' + kT + ')^3'), opt(kT, kT), opt(kT, '(' + kT + ')^2'), opt(mT, mT + '^3')], 0),
        sol: ['Коэффициент уменьшения — отношение длины в маленьком конусе к соответствующей длине в большом: k = OA / OB = ' + nf(OA) + ' / ' + nf(OB) + (m === 3 ? ' = 1/3.' : ' = ' + nf(1 / m) + '.') + ' Он меньше 1, потому что это уменьшение; ' + nf(m) + ' — коэффициент обратного перехода, увеличения.',
          'При уменьшении с коэффициентом k все длины умножаются на k, площади — на k² (два измерения), объёмы — на k³ (три измерения: в формуле объёма радиус стоит дважды и ещё высота).',
          ['Поэтому', 'V_1=(' + kT + ')^3*V_2=' + k3T + '*V_2'],
          'Ошибка «объём умножается на k» — частая: кажется, что раз фигура в ' + nf(m) + ' раза меньше, то и объём в ' + nf(m) + ' раза меньше. Но уменьшается каждое из трёх измерений.'] },
      { q: L('En déduire le volume du gobelet, en cm³, arrondi à l\'unité.', 'Найди объём стаканчика в см³, округлив до единиц.'), ans: pbNR(Vg, 0, 'cm³'), sol: [
        'Стаканчик — это большой конус без маленького: V = V₂ − V₁.',
        { t: 'Объём маленького конуса (радиус AD, высота OA):', tex: 'V_1=\\dfrac{\\pi\\times ' + texNum(AD) + '^2\\times ' + texNum(OA) + '}{3}\\approx ' + texNum(pbK(Vs, 2)) + '\\text{ см}^3' },
        'То же получится через коэффициент: V₁ = ' + (m === 3 ? '(1/3)³' : nf(1 / m) + '³') + ' × V₂ ≈ ' + pbS(Vs, 2) + ' см³.',
        ['', fx(pbRd(Vb, 2)) + '-' + fx(pbRd(Vs, 2)) + '≈' + fx(pbRd(Vg, 2)), 'см³'],
        'Округляем: ≈ ' + pbRd(Vg) + ' см³. Удобно не округлять промежуточные объёмы, а округлить только ответ.'] }] };
  } });

/* ---------- p2.bonbons : cylindre + boule, conversion L → mm³, ordre de grandeur ---------- */
const PB_BON = (() => {
  const out = [];
  [2, 2.5, 3, 3.5].forEach(R => [12, 13, 14, 15, 16, 17, 18, 20].forEach(Lt => {
    const h = Lt - 2 * R, Vc = Math.PI * R * R * h, Vb = 4 / 3 * Math.PI * R * R * R, Vt = Vc + Vb;
    if (h < 6 || h > 13 || pbTie(Vc, 0) || pbTie(Vb, 0) || pbTie(Vt, 0) || pbRd(Vc) + pbRd(Vb) !== pbRd(Vt)) return;
    out.push({ R, Lt, h, Vc, Vb, Vt });
  }));
  return out;
})();
function pbBonFig(d) {
  const W = 240, k = W / d.Lt, r = d.R * k, x0 = (340 - W) / 2, x1 = x0 + W, cy = 36 + r, top = cy - r, bot = cy + r, xa = x0 + r, xb = x1 - r;
  const out = '<path d="M' + pbXY([xa, top]) + ' L' + pbXY([xb, top]) + ' A' + pbC(r) + ',' + pbC(r) + ' 0 0 1 ' + pbXY([xb, bot]) + ' L' + pbXY([xa, bot]) + ' A' + pbC(r) + ',' + pbC(r) + ' 0 0 1 ' + pbXY([xa, top]) + ' Z" class="fl" fill="none"/>';
  const dim = (y, a, b, s) => pbLn([a, y], [b, y], 'fl2') + pbLn([a, y - 5], [a, y + 5], 'fl2') + pbLn([b, y - 5], [b, y + 5], 'fl2') + pbTx([(a + b) / 2, y - 6], s, 'ftm');
  const rp = [xb + r * Math.cos(pbRad(35)), cy - r * Math.sin(pbRad(35))];
  return svgFig(340, bot + 44, out + pbLn([xa, top], [xa, bot], 'fdash') + pbLn([xb, top], [xb, bot], 'fdash') + dim(top - 14, x0, x1, nf(d.Lt) + ' mm') +
    pbLn([xb, cy], rp) + pbDot([xb, cy]) + pbTx([xb + r * 0.42, cy - r * 0.32 - 4], 'R', 'ftx') + dim(bot + 26, xa, xb, 'h'),
    'Bonbon en forme de gélule : un cylindre et deux demi-boules');
}
pbProb({ id: 'p2.bonbons', ch: 'gm', lvl: 2, pts: 4,
  ru: 'Конфеты-капсулы', fr: 'Des bonbons en forme de gélule',
  src: 'Centres étrangers 2026 · exercice 2',
  gen(r) {
    let d, Vd, n;
    for (let t = 0; t < 30; t++) { d = r.pick(PB_BON); Vd = r.pick([50, 60, 75, 80, 83, 90, 100, 120]); n = Vd * 1e6 / d.Vt; const f = n / 1000 - Math.floor(n / 1000); if (Math.abs(f - 0.5) > 0.06) break; }
    const { R, Lt, h, Vc, Vb, Vt } = d, nk = Math.round(n / 1000) * 1000;
    const ctx = L('Une confiserie fabrique des bonbons au goût réglisse. Chaque bonbon a la forme d\'une gélule de longueur totale ' + nf(Lt) + ' mm, formée d\'un cylindre de hauteur h et de deux demi-boules identiques de rayon R = ' + nf(R) + ' mm (voir le schéma). Rappels : volume d\'un cylindre $$V=\\pi\\times R^2\\times h$$ ; volume d\'une boule $$V=\\dfrac{4}{3}\\times\\pi\\times R^3$$ ; 1 L = 1 dm³.',
      'Кондитерская фабрика делает лакричные конфеты. Каждая конфета — капсула общей длиной ' + nf(Lt) + ' мм: цилиндр высотой h и две одинаковые полусферы радиусом R = ' + nf(R) + ' мм (см. схему). Напоминание: объём цилиндра $$V=\\pi\\times R^2\\times h$$; объём шара $$V=\\dfrac{4}{3}\\times\\pi\\times R^3$$; 1 л = 1 дм³.');
    const Vs = nf(Vd), big = v => nf(v);
    return { ctx, fig: pbBonFig(d), qs: [
      { q: L('Calculer la hauteur h du cylindre.', 'Вычисли высоту h цилиндра.'), ans: pbNE(h, 'mm'), sol: [
        'Вдоль всей длины капсулы идут: полусфера (её «длина» — радиус R), цилиндр (h) и ещё одна полусфера (ещё R). Значит, общая длина = h + 2R.',
        ['', 'h=' + Lt + '-2*' + R + '=' + h, 'мм']] },
      { q: L('Calculer le volume de la partie cylindrique d\'un bonbon, arrondi au mm³.', 'Вычисли объём цилиндрической части конфеты, округлив до мм³.'), ans: pbNR(Vc, 0, 'mm³'), sol: [
        'Радиус основания цилиндра тот же, что у полусфер: R = ' + nf(R) + ' мм, высота h = ' + nf(h) + ' мм.',
        { t: '', tex: 'V=\\pi\\times ' + texNum(R) + '^2\\times ' + texNum(h) + '\\approx ' + texNum(pbK(Vc, 2)) + '\\text{ мм}^3' },
        'Округляем до единиц: ≈ ' + pbRd(Vc) + ' мм³.'] },
      { q: L('Calculer le volume total d\'un bonbon, arrondi au mm³.', 'Вычисли полный объём одной конфеты, округлив до мм³.'), ans: pbNR(Vt, 0, 'mm³'), sol: [
        'Две одинаковые полусферы вместе составляют один целый шар радиуса R — это удобнее, чем считать половинки.',
        { t: 'Объём шара:', tex: '\\dfrac{4}{3}\\times\\pi\\times ' + texNum(R) + '^3\\approx ' + texNum(pbK(Vb, 2)) + '\\text{ мм}^3' },
        ['Складываем с цилиндром:', fx(pbRd(Vc, 2)) + '+' + fx(pbRd(Vb, 2)) + '≈' + fx(pbRd(Vt, 2)), 'мм³'],
        'Округляем: ≈ ' + pbRd(Vt) + ' мм³.'] },
      { q: L('La confiserie fabrique chaque jour ' + Vs + ' L de mélange. Quelle conversion est correcte ?', 'Фабрика каждый день готовит ' + Vs + ' л смеси. Какой перевод единиц верный?'), red: true,
        ans: MQ(r, [L(Vs + ' L = ' + big(Vd * 1e6) + ' mm³, car 1 L = 1 dm³ et 1 dm³ = 100 × 100 × 100 mm³.', Vs + ' л = ' + big(Vd * 1e6) + ' мм³, потому что 1 л = 1 дм³ и 1 дм³ = 100 × 100 × 100 мм³.'),
          L(Vs + ' L = ' + big(Vd * 1e3) + ' mm³, car 1 L = 1 000 mm³.', Vs + ' л = ' + big(Vd * 1e3) + ' мм³, потому что 1 л = 1 000 мм³.'),
          L(Vs + ' L = ' + big(Vd * 100) + ' mm³, car 1 dm = 100 mm.', Vs + ' л = ' + big(Vd * 100) + ' мм³, потому что 1 дм = 100 мм.'),
          L(Vs + ' L = ' + big(Vd * 1e9) + ' mm³, car 1 L = 1 m³.', Vs + ' л = ' + big(Vd * 1e9) + ' мм³, потому что 1 л = 1 м³.')], 0),
        sol: ['1 л = 1 дм³ — это куб с ребром 1 дм. В 1 дм 100 мм, поэтому такой куб складывается из 100 × 100 × 100 = 1 000 000 кубиков по 1 мм³.',
          'Значит, ' + Vs + ' л = ' + Vs + ' × 1 000 000 мм³ = ' + big(Vd * 1e6) + ' мм³.',
          'Частые ошибки: 1 л = 1 000 см³ (а не мм³); множитель 100 годится для длин, а для объёмов его надо взять трижды; 1 м³ — это 1 000 л, а не 1 л.'] },
      { q: L('Combien de bonbons la confiserie peut-elle produire par jour avec ce mélange ? Arrondir au millier.', 'Сколько конфет фабрика может сделать за день из этой смеси? Округли до тысяч.'),
        ans: N(nk, { forms: ['approx'], tol: 0.006 }), sol: [
        'Число конфет — во сколько раз объём смеси больше объёма одной конфеты. Объёмы должны быть в одних единицах — в мм³ (предыдущий вопрос).',
        { t: '', tex: '\\dfrac{' + fmtBig(String(Vd * 1e6)) + '}{' + texNum(pbK(Vt, 2)) + '}\\approx ' + fmtBig(String(Math.floor(n))) },
        'Округляем до тысяч: примерно ' + big(nk) + ' конфет в день. (Если делить на объём, округлённый до ' + pbRd(Vt) + ' мм³, ответ почти такой же.)'] }] };
  } });

/* ---------- p2.potager : dénombrement, budget, volume d'un pavé, conversion cm³ → L ---------- */
const pbM = cm => (cm % 100 ? nf(cm / 100, 2) : nf(cm / 100));   /* 120 → «1,20», 100 → «1» (metres) */
function pbPotFig(c, t) {
  const S = 200, k = S / (c + t), T = 22, x0 = (340 - S) / 2, y0 = 18, tt = 9;   /* thickness drawn bigger than in reality */
  const L0 = S - tt;
  const pl = (x, y, w, h) => pbPl([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 'fl', true);
  const inner = [x0 + tt, y0 + tt], innerS = L0 - tt;
  return svgFig(340, S + 64, pl(x0, y0 + S - tt, L0, tt) + pl(x0 + L0, y0 + tt, tt, L0) + pl(x0 + tt, y0, L0, tt) + pl(x0, y0, tt, L0) +
    pbPl([inner, [inner[0] + innerS, inner[1]], [inner[0] + innerS, inner[1] + innerS], [inner[0], inner[1] + innerS]], 'ffill', true) +
    pbLn([x0, y0 + S + 16], [x0 + L0, y0 + S + 16], 'fl2') + pbLn([x0, y0 + S + 11], [x0, y0 + S + 21], 'fl2') + pbLn([x0 + L0, y0 + S + 11], [x0 + L0, y0 + S + 21], 'fl2') + pbTx([x0 + L0 / 2, y0 + S + 34], pbM(c) + ' m', 'ftm') +
    pbTx([x0 + S + 6, y0 + tt / 2 + 5], nf(t) + ' cm', 'ftm', 'start') + pbTx([170, y0 + S / 2 - 14], 'terre', 'ftm') + pbLn([inner[0], y0 + S / 2], [inner[0] + innerS, y0 + S / 2], 'fdash') + pbTx([170, y0 + S / 2 + 18], nf(c - t) + ' cm', 'ftm') + pbTx([170, y0 + S + 56], 'Vue de dessus', 'ftm'),
    'Vue de dessus du carré potager : quatre planches et la terre au centre');
}
pbProb({ id: 'p2.potager', ch: 'gm', lvl: 1, pts: 4,
  ru: 'Грядка-короб', fr: 'Un carré potager',
  src: 'Amérique du Sud 2022 · exercice 5',
  gen(r) {
    const nm = r.pick(PRENOMS_F.concat(PRENOMS_M)), c = r.pick([100, 110, 120, 125]), H = r.pick([30, 30, 45]), fr = r.pick([[2, 3], [3, 4]]), Ls = r.pick([40, 40, 50]);
    const p1 = r.pick([5.6, 6.2, 6.9, 7.5]), p2 = r.pick([2.9, 3.2, 3.5]), p3 = r.pick([5.7, 6.4]), vis = H === 30 ? 8 : 12;
    const nH = H / 15, pieces = 4 * nH, planks = Math.ceil(pieces / 2), budget = planks * p1 + 4 * p2 + p3;
    const ci = c - 2, hmin = H * fr[0] / fr[1], V = ci * ci * hmin, VL = V / 1000, sacs = Math.ceil(VL / Ls - 1e-9);
    const frT = fr[0] + '/' + fr[1], frW = fr[0] === 2 ? 'aux deux tiers' : 'aux trois quarts', frR = fr[0] === 2 ? 'до двух третей' : 'до трёх четвертей';
    const ctx = L(nm + ' veut construire un carré potager sans fond, en forme de pavé droit à base carrée, de hauteur ' + H + ' cm. Chaque côté est formé de ' + nH + ' planches de ' + pbM(c) + ' m de long et de 15 cm de large, posées les unes au-dessus des autres. Au magasin, les planches mesurent 2,50 m de long et 2 cm d\'épaisseur ; on les découpe. Dans chacun des 4 angles, on fixe une équerre avec ' + vis + ' vis. On remplit ensuite le carré de terre au minimum ' + frW + ' de sa hauteur : la terre forme un pavé droit dont la base est un carré de ' + ci + ' cm de côté. Rappel : 1 L = 1 dm³.',
      nm + ' хочет сделать грядку-короб без дна в форме прямоугольного параллелепипеда с квадратным основанием, высотой ' + H + ' см. Каждая сторона — ' + nH + ' доски длиной ' + pbM(c) + ' м и шириной 15 см, положенные одна на другую. В магазине доски длиной 2,50 м и толщиной 2 см; их распиливают. В каждом из 4 углов крепят уголок на ' + vis + ' шурупов. Потом короб засыпают землёй минимум ' + frR + ' высоты: земля образует прямоугольный параллелепипед с квадратным основанием со стороной ' + ci + ' см. Напоминание: 1 л = 1 дм³.');
    const fig = tbl([['Article', 'Prix'], ['Planche 250 cm × 15 cm × 2 cm', eur(p1) + ' la pièce'], ['Équerre', eur(p2) + ' la pièce'], ['Vis (lot de 100)', eur(p3) + ' le lot'], ['Sac de terre de ' + Ls + ' L', eur(r.pick([6.9, 7.5])) + ' le sac']]) + pbPotFig(c, 2);
    const vt = (a, h) => a + '\\times ' + a + '\\times ' + texNum(fx(h)) + '=' + fmtBig(fx(a * a * h));
    const vol = (a, h, div) => L('$$' + vt(a, h) + '$$ cm³, soit $$' + fmtBig(fx(a * a * h / div)) + '$$ L', '$$' + vt(a, h) + '$$ см³, то есть $$' + fmtBig(fx(a * a * h / div)) + '$$ л');
    return { ctx, fig, qs: [
      { q: L('Combien de planches de 2,50 m faut-il acheter ?', 'Сколько досок по 2,50 м нужно купить?'), ans: N(planks), sol: [
        'Нужно ' + nH + ' куска на сторону, сторон 4: всего ' + pieces + ' кусков по ' + pbM(c) + ' м.',
        'Из одной доски 2,50 м выходит 2 куска: 2 × ' + pbM(c) + ' = ' + pbM(2 * c) + ' м ≤ 2,50 м, а на третий кусок длины уже не хватит (3 × ' + pbM(c) + ' = ' + pbM(3 * c) + ' м > 2,50 м).',
        ['', pieces + '/2=' + planks],
        'Нужно купить ' + planks + ' ' + pbRu(planks, 'доску', 'доски', 'досок') + '.'] },
      { q: L('Déterminer le budget nécessaire pour réaliser ce carré potager, sans compter la terre.', 'Найди, сколько денег нужно на короб без учёта земли.'), ans: pbNE(budget, '€'), sol: [
        ['Доски:', planks + '*' + fx(p1) + '=' + fx(planks * p1), '€'],
        ['Уголки — по одному в каждом из 4 углов:', '4*' + fx(p2) + '=' + fx(4 * p2), '€'],
        'Шурупы: 4 × ' + vis + ' = ' + (4 * vis) + ' ' + pbRu(4 * vis, 'штука', 'штуки', 'штук') + ' — хватает одного набора из 100, это ' + eur(p3) + '.',
        ['Итого:', fx(planks * p1) + '+' + fx(4 * p2) + '+' + fx(p3) + '=' + fx(budget), '€']] },
      { q: L('Quel calcul donne le volume minimal de terre à prévoir ?', 'Какое вычисление даёт минимальный объём земли?'), red: true,
        ans: MQ(r, [vol(ci, hmin, 1000), vol(ci, H, 1000), vol(c, hmin, 1000), vol(ci, hmin, 100)], 0),
        sol: ['Земля — прямоугольный параллелепипед: сторона основания ' + ci + ' см (внутренний размер, его дали в условии), высота — минимум ' + frT + ' от ' + H + ' см:',
          ['', frT + '*' + H + '=' + fx(hmin), 'см'],
          { t: 'Объём:', tex: vt(ci, hmin) + '\\text{ см}^3' },
          '1 л = 1 дм³ = 10 × 10 × 10 = 1 000 см³, поэтому делим на 1 000: ' + nf(VL) + ' л.',
          'Типичные ошибки: взять всю высоту ' + H + ' см (а нужно лишь ' + frT + '), взять длину доски ' + c + ' см вместо внутренней стороны ' + ci + ' см, делить на 100 вместо 1 000.'] },
      { q: L('Combien de sacs de terre de ' + Ls + ' L faut-il acheter au minimum ?', 'Сколько мешков земли по ' + Ls + ' л нужно купить как минимум?'), ans: N(sacs), sol: [
        ['Делим нужный объём на объём одного мешка:', fx(VL) + '/' + Ls + '≈' + pbK(VL / Ls, 2)],
        'Мешки покупают целыми, и земли должно хватить, поэтому округляем вверх: ' + (sacs - 1) + ' ' + pbRu(sacs - 1, 'мешок', 'мешка', 'мешков') + ' — это только ' + ((sacs - 1) * Ls) + ' л < ' + nf(VL) + ' л.',
        'Нужно ' + sacs + ' ' + pbRu(sacs, 'мешок', 'мешка', 'мешков') + ' (' + (sacs * Ls) + ' л).'] }] };
  } });

/* ---------- p2.piscine-vidange : volume d'un cylindre, débit, heures et minutes, fonction affine ---------- */
function pbPisFig(R, h) {
  const cx = 170, rx = 118, ry = 24, top = 46, bot = 150;
  const body = '<path d="M' + pbXY([cx - rx, top]) + ' L' + pbXY([cx - rx, bot]) + ' A' + rx + ',' + ry + ' 0 0 0 ' + pbXY([cx + rx, bot]) + ' L' + pbXY([cx + rx, top]) + ' A' + rx + ',' + ry + ' 0 0 1 ' + pbXY([cx - rx, top]) + ' Z" class="ffill"/>';
  return svgFig(340, 200, body + '<ellipse cx="' + cx + '" cy="' + top + '" rx="' + rx + '" ry="' + ry + '" class="fl" fill="none"/>' + pbLn([cx - rx, top], [cx - rx, bot]) + pbLn([cx + rx, top], [cx + rx, bot]) +
    '<path d="M' + pbXY([cx - rx, bot]) + ' A' + rx + ',' + ry + ' 0 0 0 ' + pbXY([cx + rx, bot]) + '" class="fl" fill="none"/>' + '<path d="M' + pbXY([cx - rx, bot]) + ' A' + rx + ',' + ry + ' 0 0 1 ' + pbXY([cx + rx, bot]) + '" class="fdash" fill="none"/>' +
    pbLn([cx, top], [cx + rx, top]) + pbDot([cx, top]) + pbTx([cx + rx / 2, top - 6], nf(R) + ' m', 'ftm') +
    pbLn([cx + rx + 12, top], [cx + rx + 12, bot], 'fl2') + pbTx([cx + rx + 16, (top + bot) / 2 + 5], nf(h) + ' m', 'ftm', 'start'),
    'Bassin cylindrique de rayon ' + nf(R) + ' m et de hauteur ' + nf(h) + ' m');
}
pbProb({ id: 'p2.piscine-vidange', ch: 'gm', lvl: 2, pts: 4,
  ru: 'Слить воду из бассейна', fr: 'Vider une piscine',
  src: 'Polynésie septembre 2024 · exercice 5',
  gen(r) {
    let R, h, D, V, Vr, dm, Th, V1, t1, t0;
    for (let t = 0; t < 60; t++) {
      R = r.pick([3, 3.2, 3.5, 3.6, 4]); h = r.pick([1.2, 1.3, 1.5]); D = r.pick([9, 10.8, 12, 13.2, 14.1, 15]); Th = r.pick([1, 2]); V1 = r.pick([10, 20, 30]);
      V = Math.PI * R * R * h; Vr = pbRd(V, 1); dm = D / 60; t1 = (Vr - V1) / dm; t0 = Vr / dm;
      if (!pbTie(V, 1) && !pbTie(t1, 0) && !pbTie(t0, 0) && Vr - D * Th >= 5 && V1 < Vr - D * Th) break;
    }
    const left = Vr - D * Th, t0r = pbRd(t0), hh = Math.floor(t0r / 60), mm = t0r % 60, VrT = fx(Vr), dmT = fx(dm);
    const ctx = L('La piscine d\'un camping est un bassin en forme de cylindre de rayon ' + nf(R) + ' m et de hauteur ' + nf(h) + ' m. En fin de saison, on vide le bassin plein avec une pompe dont le débit est de ' + nf(D) + ' m³ par heure. Rappel : le volume d\'un cylindre de rayon R et de hauteur h est $$V=\\pi\\times R^2\\times h$$.',
      'Бассейн кемпинга имеет форму цилиндра радиусом ' + nf(R) + ' м и высотой ' + nf(h) + ' м. В конце сезона полный бассейн откачивают насосом, который выкачивает ' + nf(D) + ' м³ в час. Напоминание: объём цилиндра радиусом R и высотой h равен $$V=\\pi\\times R^2\\times h$$.');
    return { ctx, fig: pbPisFig(R, h), qs: [
      { q: L('Calculer le volume du bassin, en m³, arrondi au dixième.', 'Вычисли объём бассейна в м³, округлив до десятых.'), ans: pbNR(V, 1, 'm³'), sol: [
        { t: '', tex: 'V=\\pi\\times ' + texNum(R) + '^2\\times ' + texNum(h) + '\\approx ' + texNum(pbK(V, 3)) + '\\text{ м}^3' },
        'Округляем до десятых: ≈ ' + nf(Vr) + ' м³. Дальше в задаче берём это значение.'] },
      { q: L('Le bassin est plein et on met la pompe en marche. Quel volume d\'eau reste-t-il à vider au bout de ' + Th + ' h ? Utiliser le volume arrondi de la question précédente.', 'Бассейн полный, насос включили. Какой объём воды останется через ' + Th + ' ч? Используй округлённый объём из предыдущего вопроса.'), ans: pbNE(left, 'm³'), sol: [
        ['За ' + Th + ' ч насос откачает', fx(D) + '*' + Th + '=' + fx(D * Th), 'м³'],
        ['Остаётся', VrT + '-' + fx(D * Th) + '=' + fx(left), 'м³']] },
      { q: L('On note t la durée de fonctionnement de la pompe, en minutes. Quelle expression donne le volume d\'eau V(t), en m³, qui reste dans le bassin ?', 'Пусть t — время работы насоса в минутах. Какое выражение даёт объём воды V(t) в м³, который остаётся в бассейне?'), red: true,
        ans: MQ(r, [[VrT, '-', dmT], [VrT, '-', fx(D)], [VrT, '-', fx(D * 60)], [dmT, 't-', VrT]].map(([a, o, b]) => '$$V(t)=' + texNum(a) + o + texNum(b) + (o === '-' ? 't' : '') + '$$'), 0),
        sol: ['Время t в минутах, а насос задан в м³ в час. Сначала переводим расход в минуты: за 1 мин насос откачивает в 60 раз меньше, чем за час.',
          ['', fx(D) + '/60=' + dmT, 'м³ в минуту'],
          'За t минут уходит ' + nf(dm) + 't м³, а остаётся начальный объём минус откачанное: V(t) = ' + nf(Vr) + ' − ' + nf(dm) + 't.',
          'С ' + nf(D) + 't единицы не согласованы (так было бы, если t в часах); ' + nf(D * 60) + ' получилось бы, если умножить на 60 вместо деления. А в выражении ' + nf(dm) + 't − ' + nf(Vr) + ' объём был бы отрицательным в начале.'] },
      { q: L('Au bout de combien de minutes restera-t-il ' + V1 + ' m³ d\'eau dans le bassin ? Arrondir à la minute.', 'Через сколько минут в бассейне останется ' + V1 + ' м³ воды? Округли до минуты.'), ans: pbNR(t1, 0, 'min'), sol: [
        'Ищем t, при котором V(t) = ' + V1 + ' — решаем уравнение.',
        ['', VrT + '-' + dmT + 't=' + V1],
        ['Переносим: откачать нужно ' + nf(pbRd(Vr - V1, 2)) + ' м³.', dmT + 't=' + fx(Vr - V1)],
        ['', 't=' + fx(Vr - V1) + '/' + dmT + '≈' + pbK(t1, 2), 'мин'],
        'Округляем до минуты: ' + pbRd(t1) + ' мин.'] },
      { q: L('Combien de temps faut-il pour vider entièrement le bassin ? Donner le résultat en heures et minutes, arrondi à la minute.', 'Сколько времени нужно, чтобы полностью слить бассейн? Дай ответ в часах и минутах, округлив до минуты.'),
        ans: multi([null, N(hh, { unit: 'h' })], [null, N(mm, { unit: 'min' })]), sol: [
        'Бассейн пуст, когда V(t) = 0, то есть когда откачан весь объём.',
        ['', 't=' + VrT + '/' + dmT + '≈' + pbK(t0, 2), 'мин'],
        'Округляем: ' + t0r + ' мин. В часе 60 минут: ' + t0r + ' = ' + hh + ' × 60 + ' + mm + ', то есть ' + hh + ' ч ' + mm + ' мин.'] }] };
  } });

/* =====================================================================================================
   STATISTIQUES ET PROBABILITÉS
   ===================================================================================================== */
const PB_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
const pbList = (a, et) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' ' + et + ' ' + a[a.length - 1];

/* ---------- p2.playlist : effectifs, durée moyenne en min et s, probabilités, nombres premiers ---------- */
pbProb({ id: 'p2.playlist', ch: 'st', lvl: 1, pts: 4,
  ru: 'Песни для малыша', fr: 'Une liste de chansons',
  src: 'Métropole septembre 2025 · exercice 1',
  gen(r) {
    const n = r.pick([18, 20, 22, 24, 25, 26, 28, 30]), c = r.ri(3, Math.floor(n / 3)), b = r.ri(3, Math.floor(n / 3)), a = n - b - c;
    const step = 60 / gcd(n, 60), durs = []; for (let v = step * Math.ceil(130 / step); v <= 230; v += step) if (v % 60) durs.push(v);
    const ms = r.pick(durs), T = n * ms / 60, mm = Math.floor(ms / 60), ss = ms % 60;
    const nm = r.pick(PRENOMS_F), thr = r.pick([[1, 3], [1, 3], [2, 5], [3, 10]]), thrT = thr[0] + '/' + thr[1];
    const pr = PB_PRIMES.filter(p => p <= n), kp = pr.length;
    const ctx = L('Pour faire écouter de la musique à son enfant, ' + nm + ' a sélectionné ' + n + ' chansons : ' + a + ' chants de Noël, ' + b + ' comptines et des berceuses. Le temps d\'écoute total des chansons de la liste est de ' + T + ' minutes. ' + nm + ' utilise la fonction aléatoire de son lecteur : la chanson écoutée est choisie au hasard parmi toutes les chansons de la liste. Les chansons sont numérotées de 1 à ' + n + '.',
      'Чтобы включать музыку ребёнку, ' + nm + ' выбрала ' + n + ' ' + pbRu(n, 'песню', 'песни', 'песен') + ': ' + a + ' ' + pbRu(a, 'рождественскую песню', 'рождественские песни', 'рождественских песен') + ', ' + b + ' ' + pbRu(b, 'детскую песенку', 'детские песенки', 'детских песенок') + ' и колыбельные. Все песни списка вместе звучат ' + T + ' минут. ' + nm + ' включает случайный порядок: песня выбирается случайно среди всех песен списка. Песни пронумерованы от 1 до ' + n + '.');
    /* the three ways to count the primes, and the verdict each one gives */
    const cmpTx = (k, fr) => { const x = k * thr[1], y = n * thr[0], f = pbFr(k, n);
      const frac = k + '/' + n + (f !== k + '/' + n ? ' = ' + f : '');
      if (x === y) return fr ? ['Non', '$' + frac + '$ : elle est égale à $' + thrT + '$, pas supérieure'] : ['Нет', '$' + frac + '$: она равна $' + thrT + '$, а не больше'];
      const val = '$' + frac + ' ≈ ' + pbK(k / n, 2) + '$', tv = '$' + thrT + ' ≈ ' + pbK(thr[0] / thr[1], 2) + '$';
      return fr ? [x > y ? 'Oui' : 'Non', val + ' et ' + tv + ', donc elle est ' + (x > y ? 'supérieure' : 'inférieure') + ' à $' + thrT + '$']
        : [x > y ? 'Да' : 'Нет', val + ', а ' + tv + ', значит, она ' + (x > y ? 'больше' : 'меньше') + ' $' + thrT + '$']; };
    const optP = (list) => { const k = list.length, f = cmpTx(k, true), g = cmpTx(k, false);
      return L(f[0] + ' : entre 1 et ' + n + ', les nombres premiers sont ' + pbList(list, 'et') + ', soit ' + k + ' nombres. La probabilité est ' + f[1] + '.',
        g[0] + ': от 1 до ' + n + ' простые числа — ' + pbList(list, 'и') + ', всего ' + k + '. Вероятность равна ' + g[1] + '.'); };
    return { ctx, qs: [
      { q: L('Calculer le nombre de berceuses de la liste.', 'Вычисли, сколько в списке колыбельных.'), ans: N(c), sol: [
        'Все песни, кроме рождественских и детских, — колыбельные.',
        ['', n + '-' + a + '-' + b + '=' + c]] },
      { q: L('Calculer la durée moyenne d\'une chanson de cette liste. Donner le résultat en minutes et secondes.', 'Вычисли среднюю длительность одной песни. Дай ответ в минутах и секундах.'),
        ans: multi([null, N(mm, { unit: 'min' })], [null, N(ss, { unit: 's' })]), sol: [
        'Средняя длительность («durée moyenne») — общее время, делённое на число песен. Удобнее сразу перевести минуты в секунды, чтобы не возиться с дробной частью минуты.',
        ['', T + '*60=' + (T * 60), 'с'],
        ['', (T * 60) + '/' + n + '=' + ms, 'с'],
        ms + ' с = ' + mm + ' × 60 с + ' + ss + ' с, то есть ' + mm + ' мин ' + ss + ' с.',
        (() => { const q = T / n, dg = pbIsD(q, 2) ? String(+q.toFixed(2)).split('.')[1] : null, w = dg ? +dg.padEnd(2, '0') : 99;
          return w < 60 && w !== ss ? 'Частая ошибка: ' + T + ' ÷ ' + n + ' = ' + nf(q) + ' мин, и кажется, что это ' + mm + ' мин ' + w + ' с. Но цифры после запятой — доли минуты, а не секунды: ' + nf(q - mm) + ' мин = ' + nf(q - mm) + ' × 60 с = ' + ss + ' с.'
            : 'Если делить минуты, получится ' + nf(pbRd(q, 3)) + ' мин; дробная часть минуты — это доли от 60 секунд, её нужно умножить на 60, а не читать как секунды.'; })()] },
      { q: L('Quelle est la probabilité que la chanson écoutée soit une comptine ? Donner le résultat sous forme de fraction irréductible.', 'Какова вероятность, что прозвучит детская песенка? Запиши ответ несократимой дробью.'), ans: FRA(F(b, n)), sol: [
        'Все песни (их ' + n + ') выбираются с одинаковой вероятностью, поэтому вероятность — число благоприятных исходов, делённое на число всех исходов.',
        ['', b + '/' + n + (pbFr(b, n) !== b + '/' + n ? '=' + pbFr(b, n) : '')]] },
      { q: L('Quelle est la probabilité que la chanson écoutée ne soit pas une berceuse ? Donner le résultat sous forme de fraction irréductible.', 'Какова вероятность, что прозвучит не колыбельная? Запиши ответ несократимой дробью.'), ans: FRA(F(n - c, n)), sol: [
        ['Способ 1 — посчитать подходящие песни: не колыбельные — это рождественские и детские, их ' + a + ' + ' + b + ' = ' + (a + b) + '.', (a + b) + '/' + n + (pbFr(a + b, n) !== (a + b) + '/' + n ? '=' + pbFr(a + b, n) : '')],
        ['Способ 2 — через противоположное событие («événement contraire»): вероятности события и его противоположного в сумме дают 1.', '1-' + c + '/' + n + '=' + pbFr(n - c, n)]] },
      { q: L('On considère l\'événement « Le numéro de la chanson écoutée est un nombre premier ». Sa probabilité est-elle supérieure à $' + thrT + '$ ? Choisir la réponse correctement justifiée.', 'Рассмотрим событие «номер прозвучавшей песни — простое число». Больше ли его вероятность, чем $' + thrT + '$? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [optP(pr), optP([1].concat(pr)), optP(pr.slice(1)),
          L('On ne peut pas savoir : la chanson est choisie au hasard, donc tout peut arriver.', 'Нельзя узнать: песня выбирается случайно, значит, может выпасть что угодно.')], 0),
        sol: ['Простое число («nombre premier») имеет ровно два делителя: 1 и само себя. Поэтому 1 — не простое (у него один делитель), а 2 — простое (единственное чётное простое).',
          'От 1 до ' + n + ' простые: ' + pbList(pr, 'и') + ' — всего ' + kp + '. Вероятность — ' + kp + '/' + n + '.',
          'Сравниваем две дроби через десятичные приближения (или приводя к общему знаменателю): ' + nf(pbRd(kp / n, 3)) + ' и ' + nf(pbRd(thr[0] / thr[1], 3)) + '.',
          'Случайность не мешает посчитать вероятность: вероятность как раз и измеряет шансы случайного события.'] }] };
  } });

/* ---------- p2.briques-jus : tableau d'effectifs, médiane, étendue, probabilité, pourcentage ---------- */
pbProb({ id: 'p2.briques-jus', ch: 'st', lvl: 2, pts: 4,
  ru: 'Контроль пакетов сока', fr: 'Contrôle de briques de jus',
  src: 'Polynésie 2022 · exercice 3',
  gen(r) {
    let Nt, vals, cnt, ser, med, mode, mean;
    for (let t = 0; t < 50; t++) {
      Nt = r.pick([20, 25]);
      const lows = r.pick([[344], [343, 344], [342, 344]]), highs = r.pick([[356], [356, 357], [357, 358]]);
      const mid = [350].concat(r.sh([346, 347, 348, 349, 351, 352, 353, 354]).slice(0, 6)).sort((x, y) => x - y);
      vals = lows.concat(mid, highs); cnt = vals.map(() => 1);
      const midIdx = mid.map(v => vals.indexOf(v));
      for (let k = vals.length; k < Nt; k++) { const i = r.pick(midIdx), j = r.pick(midIdx); cnt[Math.abs(vals[i] - 350) <= Math.abs(vals[j] - 350) ? i : j]++; }
      ser = []; vals.forEach((v, i) => { for (let k = 0; k < cnt[i]; k++) ser.push(v); });
      med = Nt % 2 ? ser[(Nt - 1) / 2] : (ser[Nt / 2 - 1] + ser[Nt / 2]) / 2;
      const mx = Math.max(...cnt); mode = vals.filter((v, i) => cnt[i] === mx);
      mean = ser.reduce((s, v) => s + v, 0) / Nt;
      if (!mode.includes(med) && Math.abs(mean - med) > 0.05 && cnt[vals.indexOf(350)] * 2 !== Nt) break;
    }
    const lo = 345, hi = 355, okN = ser.filter(v => v >= lo && v <= hi).length, pct = okN * 100 / Nt, c350 = cnt[vals.indexOf(350)], et = vals[vals.length - 1] - vals[0];
    const half = Math.ceil(vals.length / 2), row = (a, b) => tbl([['Volume (mL)'].concat(vals.slice(a, b)), ['Effectif'].concat(cnt.slice(a, b))], 'side');
    const ctx = L('Une entreprise produit des briques de jus de pomme qui doivent contenir 350 mL. Lors d\'un contrôle, ' + Nt + ' briques sont prélevées au hasard. Le tableau ci-dessous donne le volume de jus, en mL, contenu dans ces briques.',
      'Компания выпускает пакеты яблочного сока, в каждом должно быть 350 мл. При проверке случайно отобрали ' + Nt + ' пакетов. В таблице — объём сока в этих пакетах (в мл) и сколько пакетов с таким объёмом.');
    /* cumulative counts, to find the middle values */
    let cum = 0; const cums = vals.map((v, i) => (cum += cnt[i]));
    const pos = Nt % 2 ? [(Nt + 1) / 2] : [Nt / 2, Nt / 2 + 1], at = k => vals[cums.findIndex(c => c >= k)];
    const medT = fx(med), modeT = mode.map(v => v + ' mL').join(' ou ');
    return { ctx, fig: row(0, half) + row(half, vals.length), qs: [
      { q: L('Déterminer la médiane des volumes de cette série.', 'Найди медиану объёмов этого ряда.'), ans: N(medT, { unit: 'mL' }), sol: [
        'Медиана («médiane») — значение посередине ряда, упорядоченного по возрастанию. Таблица уже упорядочена.',
        'Пакетов ' + Nt + (Nt % 2 ? ', это нечётное число: посередине стоит ' + pos[0] + '-е значение (до него и после него по ' + ((Nt - 1) / 2) + ' значений).' : ', это чётное число: посередине стоят ' + pos[0] + '-е и ' + pos[1] + '-е значения (по ' + (Nt / 2) + ' значений с каждой стороны).'),
        'Считаем накопленные количества: ' + vals.map((v, i) => 'до ' + v + ' мл — ' + cums[i]).slice(0, cums.findIndex(c => c >= pos[pos.length - 1]) + 1).join(', ') + '.',
        Nt % 2 ? 'Значит, ' + pos[0] + '-е значение — ' + at(pos[0]) + ' мл, медиана ' + medT.replace('.', ',') + ' мл.'
          : 'Значит, ' + pos[0] + '-е значение — ' + at(pos[0]) + ' мл, ' + pos[1] + '-е — ' + at(pos[1]) + ' мл' + (at(pos[0]) === at(pos[1]) ? ', и медиана ' + at(pos[0]) + ' мл.' : '; медиана — их среднее: (' + at(pos[0]) + ' + ' + at(pos[1]) + ') ÷ 2 = ' + nf(med) + ' мл.')] },
      { q: L('Quelle phrase interprète correctement cette médiane ?', 'Какая фраза верно объясняет смысл этой медианы?'), red: true,
        ans: MQ(r, [L('Au moins la moitié des briques contrôlées contiennent ' + nf(med) + ' mL ou moins, et au moins la moitié en contiennent ' + nf(med) + ' mL ou plus.', 'Не меньше половины проверенных пакетов содержат ' + nf(med) + ' мл или меньше, и не меньше половины — ' + nf(med) + ' мл или больше.'),
          L('En moyenne, une brique contrôlée contient ' + nf(med) + ' mL.', 'В среднем в проверенном пакете ' + nf(med) + ' мл.'),
          L(nf(med) + ' mL est le volume le plus fréquent parmi les briques contrôlées.', nf(med) + ' мл — самый частый объём среди проверенных пакетов.'),
          L('La moitié des briques contrôlées contiennent exactement ' + nf(med) + ' mL.', 'Ровно в половине проверенных пакетов ' + nf(med) + ' мл.')], 0),
        sol: ['Медиана делит упорядоченный ряд на две половины: значения не больше медианы и значения не меньше её.',
          'Это не среднее: среднее здесь ≈ ' + nf(pbRd(mean, 2)) + ' мл (сумма всех объёмов, делённая на ' + Nt + '). И не самое частое значение: чаще всего встречается ' + modeT.replace(/mL/g, 'мл').replace(' ou ', ' или ') + '.',
          'И медиана не говорит, сколько пакетов содержат ровно ' + nf(med) + ' мл' + (Number.isInteger(med) ? '' : ' — пакетов с таким объёмом нет вовсе') + '.'] },
      { q: L('Calculer l\'étendue de cette série.', 'Вычисли размах этого ряда.'), ans: N(et, { unit: 'mL' }), sol: [
        'Размах («étendue») — наибольшее значение минус наименьшее.',
        ['', vals[vals.length - 1] + '-' + vals[0] + '=' + et, 'мл']] },
      { q: L('On prélève au hasard une brique parmi celles contrôlées. Quelle est la probabilité qu\'elle contienne exactement 350 mL ? Donner le résultat sous forme de fraction irréductible.', 'Случайно берут один из проверенных пакетов. Какова вероятность, что в нём ровно 350 мл? Запиши ответ несократимой дробью.'), ans: FRA(F(c350, Nt)), sol: [
        'Все ' + Nt + ' пакетов имеют одинаковые шансы. Ровно 350 мл — в ' + c350 + ' из них (смотрим в таблицу).',
        ['', c350 + '/' + Nt + (pbFr(c350, Nt) !== c350 + '/' + Nt ? '=' + pbFr(c350, Nt) : '')]] },
      { q: L('Une brique peut être vendue si son volume est compris entre 345 mL et 355 mL (bornes incluses). Quel pourcentage des briques contrôlées peut être vendu ?', 'Пакет можно продавать, если в нём от 345 до 355 мл (включительно). Какой процент проверенных пакетов можно продавать?'), ans: N(fx(pct), { unit: '%' }), sol: [
        'Не годятся пакеты вне промежутка: ' + vals.filter(v => v < lo || v > hi).map(v => v + ' мл (' + cnt[vals.indexOf(v)] + ' шт.)').join(', ') + '. Годятся остальные пакеты — их ' + okN + '.',
        ['Процент — доля, умноженная на 100:', okN + '/' + Nt + '*100=' + fx(pct), '%']] }] };
  } });

/* ---------- p2.deux-jeux : probabilités simples, comparaison, ajout de boules, expérience à deux épreuves ---------- */
function pbJeuFig(balls, s) {
  let o = '<path d="M30,52 C18,60 14,120 26,146 C38,168 136,168 148,146 C160,120 156,60 144,52 Z" class="fl" fill="none"/>' + pbLn([40, 44], [134, 44]) + pbLn([30, 52], [40, 44]) + pbLn([144, 52], [134, 44]);
  const per = 4, rr = 13;
  balls.forEach((b, i) => { const row = Math.floor(i / per), col = i % per, inRow = Math.min(per, balls.length - row * per), x = 87 + (col - (inRow - 1) / 2) * 30, y = 138 - row * 30;
    o += '<circle cx="' + pbC(x) + '" cy="' + pbC(y) + '" r="' + rr + '" class="fl" fill="none"/>' + pbTx([x, y + 5], b); });
  const cx = 254, cy = 96, R = 62;
  o += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" class="fl" fill="none"/>';
  for (let i = 0; i < s; i++) { const a = pbRad(90 - (i - 0.5) * 360 / s), m = pbRad(90 - i * 360 / s); o += pbLn([cx, cy], [cx + R * Math.cos(a), cy - R * Math.sin(a)], 'fl2') + pbTx([cx + 44 * Math.cos(m), cy - 44 * Math.sin(m) + 5], String(i + 1), s > 8 ? 'ftm' : 'ftx'); }
  o += pbPl([[cx, cy - R + 10], [cx - 7, cy - R - 6], [cx + 7, cy - R - 6]], 'fl', true) + pbDot([cx, cy]);
  return svgFig(340, 196, o + pbTx([87, 188], 'Jeu 1', 'ftx') + pbTx([cx, 188], 'Jeu 2', 'ftx'), 'Jeu 1 : un sac de boules marquées de lettres ; jeu 2 : une roue à secteurs numérotés');
}
pbProb({ id: 'p2.deux-jeux', ch: 'st', lvl: 2, pts: 4,
  ru: 'Две игры: мешок и колесо', fr: 'Deux jeux de hasard',
  src: 'Polynésie 2023 · exercice 3',
  gen(r) {
    let g, nN, p, T, s, kp, P1, P2, q, T2;
    for (let t = 0; t < 60; t++) {
      g = r.ri(1, 4); nN = r.ri(1, 3); p = r.ri(1, 4); T = g + nN + p; s = r.pick([6, 8, 10, 12]); kp = PB_PRIMES.filter(x => x <= s).length;
      P1 = g / T; P2 = kp / s; q = r.pick([3, 4, 5, 6]); T2 = g * q;
      if (T >= 5 && T <= 9 && Math.abs(P1 - P2) > 1e-9 && T2 > T && T2 - T <= 12 && g / T !== 1 / q) break;
    }
    const balls = r.sh([].concat(Array(g).fill('G'), Array(nN).fill('N'), Array(p).fill('P'))), add = T2 - T;
    const f1 = pbFr(g, T), f2 = pbFr(kp, s), fp = pbFr(g * kp, T * s), lst = PB_PRIMES.filter(x => x <= s);
    const ctx = L('Dans cet exercice, on étudie deux jeux. Jeu 1 : un sac contient ' + T + ' boules indiscernables au toucher : ' + g + ' portant la lettre G, ' + nN + ' portant la lettre N et ' + p + ' portant la lettre P. On pioche une boule au hasard ; on gagne si elle porte la lettre G. Jeu 2 : une roue est partagée en ' + s + ' secteurs identiques numérotés de 1 à ' + s + '. On fait tourner la roue ; on gagne si la flèche s\'arrête sur un nombre premier.',
      'В задаче две игры. Игра 1: в мешке ' + T + ' неразличимых на ощупь шаров: ' + g + ' с буквой G, ' + nN + ' с буквой N и ' + p + ' с буквой P. Наугад вытягивают шар; выигрыш — если на нём буква G. Игра 2: колесо разделено на ' + s + ' одинаковых секторов с номерами от 1 до ' + s + '. Колесо крутят; выигрыш — если стрелка остановится на простом числе.');
    return { ctx, fig: pbJeuFig(balls, s), qs: [
      { q: L('Calculer la probabilité de gagner au jeu 1. Donner le résultat sous forme de fraction irréductible.', 'Вычисли вероятность выигрыша в игре 1. Запиши ответ несократимой дробью.'), ans: FRA(F(g, T)), sol: [
        'Все ' + T + ' шаров вытягиваются с одинаковой вероятностью; благоприятных исходов — столько, сколько шаров с буквой G.',
        ['', g + '/' + T + (f1 !== g + '/' + T ? '=' + f1 : '')]] },
      { q: L('Calculer la probabilité de gagner au jeu 2. Donner le résultat sous forme de fraction irréductible.', 'Вычисли вероятность выигрыша в игре 2. Запиши ответ несократимой дробью.'), ans: FRA(F(kp, s)), sol: [
        'Простые числа от 1 до ' + s + ': ' + pbList(lst, 'и') + ' — их ' + kp + '. Число 1 не простое: у него только один делитель.',
        ['Секторы одинаковые, значит, все ' + s + ' номеров равновероятны:', kp + '/' + s + (f2 !== kp + '/' + s ? '=' + f2 : '')]] },
      { q: L('Quel jeu présente la plus faible probabilité de gagner ?', 'В какой игре вероятность выигрыша меньше?'), ans: MQF([L('Le jeu 1', 'Игра 1'), L('Le jeu 2', 'Игра 2'), L('Les deux jeux ont la même probabilité de gagner', 'В обеих играх вероятность одинаковая')], P1 < P2 ? 0 : 1), sol: [
        'Сравниваем ' + f1 + ' и ' + f2 + ', например в десятичных дробях: ' + nf(pbRd(P1, 3)) + ' и ' + nf(pbRd(P2, 3)) + '.',
        'Меньше вероятность в игре ' + (P1 < P2 ? '1' : '2') + '.'] },
      { q: L('On ajoute dans le sac du jeu 1 des boules qui ne portent pas la lettre G. Combien de boules faut-il ajouter pour que la probabilité de gagner au jeu 1 soit égale à $1/' + q + '$ ?', 'В мешок игры 1 добавляют шары без буквы G. Сколько шаров нужно добавить, чтобы вероятность выигрыша в игре 1 стала равна $1/' + q + '$?'), ans: N(add), sol: [
        'Шаров с буквой G по-прежнему ' + g + '. Вероятность 1/' + q + ' означает, что шары G составляют одну ' + (q === 3 ? 'треть' : q === 4 ? 'четверть' : q === 5 ? 'пятую часть' : 'шестую часть') + ' всех шаров.',
        ['Значит, всего шаров должно быть', g + '*' + q + '=' + T2],
        ['Сейчас их ' + T + ', поэтому добавить нужно', T2 + '-' + T + '=' + add],
        ['Проверка:', g + '/' + T2 + '=1/' + q]] },
      { q: L('On combine les deux jeux : le joueur pioche une boule dans le sac du jeu 1 (sans les boules ajoutées), puis fait tourner la roue du jeu 2. Il gagne s\'il obtient la lettre G puis un nombre premier. Quel raisonnement donne la probabilité de gagner ?', 'Игры объединяют: игрок вытягивает шар из мешка игры 1 (без добавленных шаров), потом крутит колесо игры 2. Он выигрывает, если выпадет буква G, а потом простое число. Какое рассуждение даёт вероятность выигрыша?'), red: true,
        ans: MQ(r, [L('On multiplie les probabilités le long du chemin « G, puis nombre premier » de l\'arbre : $(' + f1 + ')*(' + f2 + ') = ' + fp + '$.', 'Перемножаем вероятности вдоль ветки дерева «G, потом простое число»: $(' + f1 + ')*(' + f2 + ') = ' + fp + '$.'),
          L('On additionne les probabilités des deux jeux : $' + f1 + ' + ' + f2 + ' = ' + pbFr(g * s + kp * T, T * s) + '$.', 'Складываем вероятности двух игр: $' + f1 + ' + ' + f2 + ' = ' + pbFr(g * s + kp * T, T * s) + '$.'),
          L('Il y a $' + T + '*' + s + ' = ' + (T * s) + '$ issues, dont $' + g + ' + ' + kp + ' = ' + (g + kp) + '$ gagnantes : la probabilité est $' + pbFr(g + kp, T * s) + '$.', 'Всего $' + T + '*' + s + ' = ' + (T * s) + '$ исходов, из них $' + g + ' + ' + kp + ' = ' + (g + kp) + '$ выигрышных: вероятность $' + pbFr(g + kp, T * s) + '$.'),
          L('On garde la plus petite des deux probabilités, car il faut gagner aux deux jeux : ' + (P1 < P2 ? '$' + f1 + '$' : '$' + f2 + '$') + '.', 'Берём меньшую из двух вероятностей, ведь нужно выиграть в обеих играх: ' + (P1 < P2 ? '$' + f1 + '$' : '$' + f2 + '$') + '.')], 0),
        sol: ['Опыт из двух этапов удобно изобразить деревом: сначала шар (G или нет), потом колесо (простое или нет). Выигрыш — одна ветка: «G», затем «простое».',
          ['Вероятность ветки — произведение вероятностей на ней:', '(' + f1 + ')*(' + f2 + ')=' + fp],
          'Проверка подсчётом: исходов (шар; сектор) всего ' + T + ' × ' + s + ' = ' + (T * s) + ', выигрышных — ' + g + ' × ' + kp + ' = ' + (g * kp) + ' (каждый шар G с каждым простым номером), ' + (g * kp) + '/' + (T * s) + ' = ' + fp + '. Складывать ' + g + ' + ' + kp + ' нельзя: пары образуются умножением.',
          'Сумма вероятностей отвечала бы на вопрос «выиграть хотя бы где-то» (и то не точно), а меньшая из вероятностей — вообще не вероятность этого события: выиграть в обеих играх труднее, чем в каждой по отдельности.'] }] };
  } });

/* ---------- p2.festival : diagramme en barres, pourcentage d'évolution, moyenne et médiane, valeur manquante ---------- */
function pbFesFig(years, P, R) {
  const mx = Math.ceil(Math.max(...R) / 100) * 100, x0 = 50, W = 236, k = W / mx, top = 40, rowH = 38;
  let o = '<rect x="50" y="8" width="12" height="12" class="fc1"/>' + pbTx([66, 19], 'Coût prévisionnel', 'ftm', 'start') + '<rect x="190" y="8" width="12" height="12" class="fc2"/>' + pbTx([206, 19], 'Coût réel', 'ftm', 'start');
  years.forEach((y, i) => { const yy = top + i * rowH;
    o += pbTx([x0 - 6, yy + 17], String(y), 'ftx', 'end') +
      '<rect x="' + x0 + '" y="' + yy + '" width="' + pbC(P[i] * k) + '" height="12" class="fc1"/>' + pbTx([x0 + P[i] * k + 4, yy + 10], String(P[i]), 'ftm', 'start') +
      '<rect x="' + x0 + '" y="' + (yy + 14) + '" width="' + pbC(R[i] * k) + '" height="12" class="fc2"/>' + pbTx([x0 + R[i] * k + 4, yy + 24], String(R[i]), 'ftm', 'start'); });
  const H = top + years.length * rowH;
  o += pbLn([x0, top - 4], [x0, H - 6], 'fax') + pbTx([170, H + 12], 'en milliers d\'euros', 'ftm');
  return svgFig(340, H + 20, o, 'Coût prévisionnel et coût réel de chaque édition, en milliers d\'euros');
}
pbProb({ id: 'p2.festival', ch: 'st', lvl: 2, pts: 4,
  ru: 'Сколько стоил фестиваль', fr: 'Le coût d\'un festival',
  src: 'Polynésie 2024 · exercice 2',
  gen(r) {
    let P, R, mean, above, thr, nThr;
    const y0 = r.pick([2017, 2018, 2019]), years = [0, 1, 2, 3, 4, 5].map(i => y0 + i);
    for (let t = 0; t < 80; t++) {
      P = years.map(() => r.ri(12, 30) * 10);
      const big = r.ri(1, 5);
      R = P.map((v, i) => Math.round(v * (i === big ? r.pick([2.2, 2.5, 2.8]) : 1 + r.ri(1, 6) / 10) / 10) * 10);
      mean = R.reduce((s, v) => s + v, 0) / 6; above = R.filter(v => v > mean).length;
      thr = r.pick([250, 300, 350, 400]); nThr = R.filter(v => v >= thr).length;
      if (above < 3 && nThr >= 1 && nThr <= 5 && R.every((v, i) => v > P[i])) break;
    }
    let e; for (let t = 0; t < 20; t++) { e = r.ri(0, 5); if (!pbTie((R[e] - P[e]) / P[e] * 100, 0)) break; }
    const inc = (R[e] - P[e]) / P[e] * 100, sumP = P.reduce((s, v) => s + v, 0);
    const xs = []; for (let x = 150; x <= 350; x += 10) if ((sumP + x) % 70 === 0) xs.push(x);
    const xNew = r.pick(xs), mNew = (sumP + xNew) / 7, yNew = y0 + 6;
    const meanEx = pbIsD(mean, 1), meanAns = meanEx ? pbNE(mean, 'k€') : pbNR(mean, 1, 'k€'), meanT = meanEx ? nf(mean) : pbS(mean, 1);
    const sorted = R.slice().sort((a, b) => a - b), med = (sorted[2] + sorted[3]) / 2, bigY = years[R.indexOf(Math.max(...R))];
    const ctx = L('Un festival de musique a lieu chaque année. Le graphique ci-dessous compare, pour les éditions de ' + years[0] + ' à ' + years[5] + ', le coût prévisionnel (les dépenses prévues avant le festival) et le coût réel (les dépenses réellement nécessaires), en milliers d\'euros (k€).',
      'Музыкальный фестиваль проходит каждый год. На диаграмме для фестивалей с ' + years[0] + ' по ' + years[5] + ' год сравниваются плановая стоимость (расходы, запланированные до фестиваля) и реальная стоимость (сколько потратили на самом деле), в тысячах евро (k€).');
    return { ctx, fig: pbFesFig(years, P, R), qs: [
      { q: L('Combien d\'éditions ont eu un coût réel supérieur ou égal à ' + thr + ' k€ ?', 'У скольких фестивалей реальная стоимость была не меньше ' + thr + ' k€?'), ans: N(nThr), sol: [
        'Смотрим на вторые (реальные) столбцы и подписи к ним: ' + R.join(', ') + '.',
        '«Supérieur ou égal» — больше или равно, поэтому значение, равное ' + thr + ', тоже считаем. Подходят: ' + R.filter(v => v >= thr).join(', ') + ' — всего ' + nThr + '.'] },
      { q: L('Calculer le pourcentage d\'augmentation entre le coût prévisionnel et le coût réel de l\'édition ' + years[e] + '. Arrondir à l\'unité.', 'Вычисли, на сколько процентов реальная стоимость фестиваля ' + years[e] + ' года больше плановой. Округли до целых.'), ans: pbNR(inc, 0, '%'), sol: [
        'Процент увеличения считают от начального (планового) значения: (новое − старое) ÷ старое × 100.',
        ['', '(' + R[e] + '-' + P[e] + ')/' + P[e] + '*100≈' + pbK(inc, 2), '%'],
        'Округляем до целых: ≈ ' + pbRd(inc) + ' %. (Делить на реальную стоимость ' + R[e] + ' — частая ошибка: тогда получится уменьшение от реальной к плановой, другое число.)'] },
      { q: L('Calculer le coût réel moyen de ces six éditions, en k€. Arrondir au dixième si nécessaire.', 'Вычисли среднюю реальную стоимость этих шести фестивалей в k€. Если нужно, округли до десятых.'), ans: meanAns, sol: [
        'Среднее («moyenne») — сумма всех значений, делённая на их количество.',
        ['', '(' + R.join('+') + ')/6=' + (R.reduce((s, v) => s + v, 0)) + '/6' + (meanEx ? '=' + fx(mean) : '≈' + pbK(mean, 2))],
        meanEx ? 'Средняя реальная стоимость — ' + nf(mean) + ' k€.' : 'Округляем до десятых: ≈ ' + pbS(mean, 1) + ' k€.'] },
      { q: L('Un journaliste affirme : « Le coût réel moyen est d\'environ ' + meanT + ' k€, donc la moitié des éditions ont coûté plus de ' + meanT + ' k€. » Que penser de cette affirmation ?', 'Журналист говорит: «Средняя реальная стоимость — около ' + meanT + ' k€, значит, половина фестивалей стоила больше ' + meanT + ' k€». Что скажешь об этом утверждении?'), red: true,
        ans: MQ(r, [L('Elle est fausse : seulement ' + above + ' édition' + (above > 1 ? 's' : '') + ' sur 6 ' + (above > 1 ? 'ont' : 'a') + ' coûté plus de ' + meanT + ' k€. C\'est la médiane, et non la moyenne, qui partage la série en deux groupes de même effectif.', 'Неверно: только ' + above + ' из 6 фестивалей ' + (above === 1 ? 'стоил' : 'стоили') + ' больше ' + meanT + ' k€. Ряд пополам делит медиана, а не среднее.'),
          L('Elle est vraie : la moyenne partage toujours une série en deux groupes de même effectif.', 'Верно: среднее всегда делит ряд на две равные по количеству части.'),
          L('Elle est vraie, car la moyenne d\'une série est toujours égale à sa médiane.', 'Верно, потому что среднее ряда всегда равно его медиане.'),
          L('On ne peut pas savoir sans connaître le coût prévisionnel moyen.', 'Нельзя узнать, не зная средней плановой стоимости.')], 0),
        sol: ['Проверяем прямо по данным: больше ' + meanT + ' k€ стоили ' + R.filter(v => v > mean).join(', ') + ' — это ' + above + ' из 6, а не половина.',
          'Причина — один очень дорогой фестиваль (' + bigY + ', ' + Math.max(...R) + ' k€): он «тянет» среднее вверх, и большинство значений оказываются ниже среднего.',
          'Половину ряда отделяет медиана («médiane»): здесь (' + sorted[2] + ' + ' + sorted[3] + ') ÷ 2 = ' + nf(med) + ' k€. Среднее и медиана совпадают только в особых случаях. Плановая стоимость к вопросу не относится.'] },
      { q: L('Le coût prévisionnel moyen des sept éditions de ' + years[0] + ' à ' + yNew + ' est de ' + nf(mNew) + ' k€. Quel est le coût prévisionnel de l\'édition ' + yNew + ' ?', 'Средняя плановая стоимость семи фестивалей с ' + years[0] + ' по ' + yNew + ' год — ' + nf(mNew) + ' k€. Какова плановая стоимость фестиваля ' + yNew + ' года?'), ans: N(xNew, { unit: 'k€' }), sol: [
        'Если среднее семи значений равно ' + nf(mNew) + ', то их сумма равна 7 × ' + nf(mNew) + ' — так определяется среднее.',
        ['', '7*' + mNew + '=' + (7 * mNew)],
        ['Сумма шести известных плановых стоимостей:', P.join('+') + '=' + sumP],
        ['Недостающее значение — разность:', (7 * mNew) + '-' + sumP + '=' + xNew, 'k€']] }] };
  } });

/* ---------- p2.agrandissement : Pythagore, Thalès, cosinus, homothétie, aires multipliées par k² ---------- */
const PB_AGR = (() => {
  const out = [];
  [[5, 12, 13], [3, 4, 5], [4, 3, 5], [8, 15, 17], [12, 5, 13], [20, 21, 29], [7, 24, 25]].forEach(([a, b, c]) => [0.2, 0.25, 0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5, 2].forEach(s => {
    const MH = +(a * s).toFixed(2), HS = +(b * s).toFixed(2), MS = +(c * s).toFixed(2);
    if (![MH, HS, MS].every(v => pbIsD(v, 1)) || MH < 2.5 || HS < 2.5 || MS > 14 || Math.max(MH, HS) / Math.min(MH, HS) > 3) return;
    [1.2, 1.4, 1.5, 1.6, 1.8, 2.5].forEach(k => {
      const MT = MH * k, AT = HS * k, ang = pbDeg(Math.acos(MH / MS));
      if (pbIsD(MT, 1) && pbIsD(AT, 1) && MT <= 12 && !pbTie(ang, 0)) out.push({ MH, HS, MS, k, MT: +MT.toFixed(1), AT: +AT.toFixed(2), ang });
    });
  }));
  return out;
})();
function pbAgrFig(d) {
  const P0 = [[0, 0], [0, d.MH], [d.HS, d.MH], [0, -d.MT], [-d.AT, -d.MT]], T = pbFit(P0, 340, 240, 26), [M, H, S, Tp, A] = P0.map(T);
  return svgFig(340, 240, pbLn(H, Tp) + pbLn(S, A) + pbLn(H, S) + pbLn(Tp, A) + pbRA(H, M, S) + pbRA(Tp, M, A) + [M, H, S, Tp, A].map(pbDot).join('') +
    pbLab(M, 'M', pbDir(1, 0.25)) + pbLab(H, 'H', pbDir(-0.6, -0.8)) + pbLab(S, 'S', pbDir(0.8, -0.6)) + pbLab(Tp, 'T', pbDir(0.6, 0.8)) + pbLab(A, 'A', pbDir(-0.8, 0.6)),
    'Triangles MHS et MAT opposés par le sommet M');
}
pbProb({ id: 'p2.agrandissement', ch: 'gm', lvl: 2, pts: 5,
  ru: 'Увеличение: длины и площади', fr: 'Agrandissement et aires',
  src: 'Amérique du Nord 2022 · exercice 1',
  gen(r) {
    const d = r.pick(PB_AGR), { MH, HS, MS, k, MT, AT, ang } = d, k2 = k * k, A1 = MH * HS / 2, A2 = A1 * k2;
    const ctx = L('Sur la figure ci-dessous, qui n\'est pas à l\'échelle : les points S, M et A sont alignés ; les points H, M et T sont alignés ; les angles ' + pbAng('MHS') + ' et ' + pbAng('MTA') + ' sont droits ; MH = ' + nf(MH) + ' cm ; MS = ' + nf(MS) + ' cm et MT = ' + nf(MT) + ' cm.',
      'На рисунке (масштаб не соблюдён): точки S, M и A лежат на одной прямой; точки H, M и T лежат на одной прямой; углы ' + pbAng('MHS') + ' и ' + pbAng('MTA') + ' прямые; MH = ' + nf(MH) + ' см; MS = ' + nf(MS) + ' см и MT = ' + nf(MT) + ' см.');
    const kT = nf(k), k2T = nf(k2), opt = (fr, ru) => L(fr, ru);
    return { ctx, fig: pbAgrFig(d), qs: [
      { q: L('Calculer la longueur HS.', 'Вычисли длину HS.'), ans: pbNE(HS, 'cm'), sol: [
        'Треугольник MHS прямоугольный с прямым углом H, гипотенуза — [MS]. По теореме Пифагора («théorème de Pythagore») MS² = MH² + HS².',
        ['', 'HS^2=' + MS + '^2-' + MH + '^2=' + fx(MS * MS) + '-' + fx(MH * MH) + '=' + fx(HS * HS)],
        ['', 'HS=√' + fx(HS * HS) + '=' + HS, 'см']] },
      { q: L('Calculer la longueur AT.', 'Вычисли длину AT.'), ans: pbNE(AT, 'cm'), sol: [
        'Прямые (HS) и (TA) обе перпендикулярны прямой (HT), значит, они параллельны.',
        'Точки S, M, A и H, M, T лежат на двух прямых, пересекающихся в M, и (HS) ∥ (AT) — это «бабочка» теоремы Фалеса («théorème de Thalès»):',
        ['', 'MT/MH=MA/MS=AT/HS'],
        ['', 'AT=' + HS + '*' + MT + '/' + MH + '=' + fx(AT), 'см']] },
      { q: L('Calculer la mesure de l\'angle ' + pbAng('HMS') + '. Arrondir au degré.', 'Вычисли угол ' + pbAng('HMS') + '. Округли до градуса.'), ans: pbNR(ang, 0, '°'), sol: [
        'В прямоугольном треугольнике MHS для угла M известны прилежащий катет MH и гипотенуза MS — это косинус.',
        { t: '', tex: '\\cos\\widehat{HMS}=\\dfrac{MH}{MS}=\\dfrac{' + texNum(MH) + '}{' + texNum(MS) + '}' },
        'arccos(' + nf(MH) + ' ÷ ' + nf(MS) + ') ≈ ' + pbS(ang, 2) + '°, то есть ≈ ' + pbRd(ang) + '°.'] },
      { q: L('Quelle transformation permet d\'obtenir le triangle MAT à partir du triangle MHS ?', 'Какое преобразование переводит треугольник MHS в треугольник MAT?'),
        ans: MQ(r, [L('L\'homothétie de centre M et de rapport ' + nf(-k), 'Гомотетия с центром M и коэффициентом ' + nf(-k)), L('L\'homothétie de centre M et de rapport ' + kT, 'Гомотетия с центром M и коэффициентом ' + kT),
          L('La symétrie centrale de centre M', 'Центральная симметрия с центром M'), L('Une translation', 'Параллельный перенос')], 0), sol: [
        'Треугольник MAT больше треугольника MHS в MT / MH = ' + nf(MT) + ' / ' + nf(MH) + ' = ' + kT + ' раза, а симметрия и перенос размеров не меняют. Значит, это гомотетия с центром M.',
        'H и его образ T лежат по разные стороны от центра M, поэтому коэффициент отрицательный: ' + nf(-k) + '.'] },
      { q: L('MT est ' + kT + ' fois plus grande que MH. Un élève affirme : « L\'aire du triangle MAT est ' + kT + ' fois plus grande que l\'aire du triangle MHS. » Choisir la réponse correctement justifiée.', 'MT в ' + kT + ' раза больше MH. Ученик утверждает: «Площадь треугольника MAT в ' + kT + ' раза больше площади треугольника MHS». Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [opt('Faux : dans un agrandissement de rapport ' + kT + ', les longueurs sont multipliées par ' + kT + ' et les aires par $' + fx(k) + '^2 = ' + fx(k2) + '$.', 'Неверно: при увеличении с коэффициентом ' + kT + ' длины умножаются на ' + kT + ', а площади — на $' + fx(k) + '^2 = ' + fx(k2) + '$.'),
          opt('Vrai : toutes les longueurs sont multipliées par ' + kT + ', donc l\'aire aussi.', 'Верно: все длины умножаются на ' + kT + ', значит, и площадь тоже.'),
          opt('Faux : un triangle a deux dimensions, donc l\'aire est multipliée par $2*' + fx(k) + ' = ' + fx(2 * k) + '$.', 'Неверно: у треугольника два измерения, значит, площадь умножается на $2*' + fx(k) + ' = ' + fx(2 * k) + '$.'),
          opt('Faux : l\'aire est multipliée par $' + fx(k) + '^3 = ' + fx(pbRd(k * k * k, 3)) + '$.', 'Неверно: площадь умножается на $' + fx(k) + '^3 = ' + fx(pbRd(k * k * k, 3)) + '$.')], 0),
        sol: ['Площадь треугольника — основание × высота ÷ 2. При увеличении и основание, и высота умножаются на ' + kT + ', поэтому площадь умножается на ' + kT + ' × ' + kT + ' = ' + k2T + '.',
          'Проверка числами: площадь MHS = ' + nf(MH) + ' × ' + nf(HS) + ' ÷ 2 = ' + nf(A1) + ' см², площадь MAT = ' + nf(MT) + ' × ' + nf(AT) + ' ÷ 2 = ' + nf(pbRd(A2, 4)) + ' см² — это в ' + k2T + ' раза больше, а не в ' + kT + '.',
          'Умножать на 2k — путать «квадрат» с «удвоением»; k³ — это множитель для объёмов, а не для площадей.'] },
      { q: L('Calculer l\'aire du triangle MAT.', 'Вычисли площадь треугольника MAT.'), ans: pbNE(pbRd(A2, 4), 'cm²'), sol: [
        ['Площадь прямоугольного треугольника MHS — половина произведения катетов:', MH + '*' + HS + '/2=' + fx(A1), 'см²'],
        ['Площадь MAT больше в k² раз:', fx(A1) + '*' + fx(k) + '^2=' + fx(pbRd(A2, 4)), 'см²'],
        ['Или напрямую по катетам MT и AT:', MT + '*' + fx(AT) + '/2=' + fx(pbRd(A2, 4)), 'см²']] }] };
  } });

/* ===================== DICTIONARY (words met in these problems) ===================== */
gloss('un tronc de cône', 'усечённый конус', 'конус, у которого срезали верхушку плоскостью, параллельной основанию');
gloss('un angle plat', 'развёрнутый угол', 'угол 180°: его стороны лежат на одной прямой');
gloss('une gélule', 'капсула', 'цилиндр с полусферами на концах');
gloss('une barre de renfort', 'распорка', 'деталь, которая делает конструкцию прочнее');
gloss('le coût prévisionnel', 'плановая стоимость', 'расходы, которые ожидали заранее');
gloss('le coût réel', 'реальная стоимость', 'сколько на самом деле потратили');
gloss('prélever au hasard', 'отобрать наугад', 'например, взять для проверки случайные изделия');
gloss('bornes incluses', 'включая границы', '«entre 345 et 355, bornes incluses» — от 345 до 355, оба числа подходят');
gloss('une comptine', 'детская песенка, считалка');
gloss('une berceuse', 'колыбельная');
