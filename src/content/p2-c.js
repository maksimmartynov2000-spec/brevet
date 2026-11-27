/* ===================== PARTIE 2 · problèmes C : sujets de référence 2027, sujet zéro 2026, Métropole 2026 =====================
   Each problem follows a real DNB exercise (src): the same story and the same chain of reasoning, new numbers on every run.
   Top-level names of this file start with pc. Sets of numbers that would make an answer ambiguous are left out when the lists
   are built: a value too close to a rounding boundary, a rounded key that ends with a zero («26,0»), an answer that changes
   when the previous (rounded) answer is used instead of the exact value, two answers of one problem that are the same number. */

/* ---------- numbers ---------- */
const pcRd = (v, k = 0) => { const p = Math.pow(10, k); return Math.round(v * p + (v >= 0 ? 1e-7 : -1e-7)) / p; };   /* round half up (2.45 → 2.5) */
const pcK = (v, k) => pcRd(v, k).toFixed(k);                       /* key of a rounded answer: '8.7' */
const pcS = (v, k) => nf(pcRd(v, k), k);                           /* the same number for a text: '8,7' */
const pcNR = (v, k, unit) => N(pcK(v, k), unit ? { dp: k, unit } : { dp: k });
const pcNE = (v, unit) => N(fx(v), unit ? { unit } : {});
const pcIsD = (v, k) => { const x = v * Math.pow(10, k); return Math.abs(x - Math.round(x)) < 1e-6; };   /* v has at most k decimals */
/* v is too close to a rounding boundary (…5) at k decimals: a slightly different way of calculating could give another answer */
const pcTie = (v, k, eps = 0.06) => { const x = Math.abs(v) * Math.pow(10, k); return Math.abs(x - Math.floor(x) - 0.5) < eps; };
const pcZero = (v, k) => k > 0 && pcK(v, k).endsWith('0');         /* the rounded key would end with a zero: «26,0», «5,20» */
const pcBad = (v, k) => pcTie(v, k) || pcZero(v, k);
/* Russian noun after a number: pcRu(22, 'жетон', 'жетона', 'жетонов') → 'жетона' */
const pcRu = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many);
/* pieces of TeX for $$…$$ */
const pcT = v => { const [i, d] = fx(v).split('.'); return (i.replace('-', '').length > 4 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : i) + (d ? '{,}' + d : ''); };   /* a number: 4{,}5 */
const pcTk = (v, k) => pcK(v, k).replace('.', '{,}');             /* a rounded number with k decimals: 8{,}7 */
const pcDf = (a, b) => '\\dfrac{' + a + '}{' + b + '}';
const pcAng = s => '$$\\widehat{' + s + '}$$';                    /* the angle ABC */
const pcAngEq = (s, v) => '$$\\widehat{' + s + '}=' + v + '$$';   /* «ABC = …» in one formula (no line break inside) */
const pcDg = v => String(v).replace('.', '{,}') + '^{\\circ}';

/* ---------- French typography in plain text (not inside $…$): no line break before « ? ! : ; » and between a number and its unit ---------- */
const PC_UNITS = 'g/cm³|cm³|cm²|cm|mm|m³|m²|m|km|kg|g|€|%|°|min|h|s|г/см³|см³|см²|см|мм|м³|м²|м|км|кг|г|мин|ч|с';
const PC_TYU = new RegExp('(\\d) (?=(?:' + PC_UNITS + ')(?![A-Za-zÀ-ÿА-Яа-яЁё0-9²³/]))', 'g');
function pcTy(s) {
  return String(s).split(/(\$\$[^$]*\$\$|\$[^$]*\$)/).map((p, i) => i % 2 ? p : p.replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« ').replace(PC_TYU, '$1 ').replace(/(\d) (?=\d{3}(?!\d))/g, '$1 ')).join('');
}
const pcTyT = o => (o && typeof o === 'object' && 'fr' in o ? { fr: pcTy(o.fr), ru: pcTy(o.ru) } : typeof o === 'string' ? pcTy(o) : o);
function pcTyA(a) { if (!a) return a; if (a.k === 'mcq') a.opts = a.opts.map(pcTyT); if (a.k === 'order') a.items = a.items.map(pcTyT); if (a.k === 'multi') a.parts.forEach(p => { if (p.lab) p.lab = pcTyT(p.lab); pcTyA(p.spec); }); return a; }
function pcTyS(s) { if (typeof s === 'string') return pcTy(s); if (Array.isArray(s)) return [pcTy(s[0] || '')].concat(s.slice(1)); if (s && s.t != null) return Object.assign({}, s, { t: pcTy(s.t) }); return s; }
/* probleme() with the typography applied to every text the generator returns */
function pcProb(def) {
  const g = def.gen;
  def.gen = function (r) { const p = g.call(this, r); if (p.ctx) p.ctx = pcTyT(p.ctx); p.qs.forEach(q => { q.q = pcTyT(q.q); pcTyA(q.ans); q.sol = (q.sol || []).map(pcTyS); if (q.redac) q.redac = [].concat(q.redac).map(pcTy); }); return p; };
  return probleme(def);
}

/* ---------- drawing ---------- */
const pcC = v => +(+v).toFixed(1);
const pcXY = p => pcC(p[0]) + ',' + pcC(p[1]);
function pcLn(a, b, c) { return '<line x1="' + pcC(a[0]) + '" y1="' + pcC(a[1]) + '" x2="' + pcC(b[0]) + '" y2="' + pcC(b[1]) + '" class="' + (c || 'fl') + '"/>'; }
function pcPl(ps, c, closed) { return '<' + (closed ? 'polygon' : 'polyline') + ' points="' + ps.map(pcXY).join(' ') + '" class="' + (c || 'fl') + '"' + (/ffill|fc\d|fbar/.test(c || '') ? '' : ' fill="none"') + '/>'; }
function pcTx(p, s, c, a) { return '<text x="' + pcC(p[0]) + '" y="' + pcC(p[1]) + '" class="' + (c || 'ftx') + '" text-anchor="' + (a || 'middle') + '">' + s + '</text>'; }
function pcDot(p) { return '<circle cx="' + pcC(p[0]) + '" cy="' + pcC(p[1]) + '" r="2.6" class="fpt"/>'; }
const pcUnit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1; return [dx / n, dy / n]; };
const pcAdd = (p, u, s) => [p[0] + u[0] * s, p[1] + u[1] * s];
const pcMid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const pcDir = (x, y) => { const n = Math.hypot(x, y) || 1; return { dir: [x / n, y / n] }; };
/* label of a point, pushed away from the point ctr (or in the direction ctr.dir) */
function pcLab(p, s, ctr, d) { const u = ctr.dir ? ctr.dir : pcUnit(ctr, p); return pcTx([p[0] + u[0] * (d || 14), p[1] + u[1] * (d || 14) + 5], s); }
/* right-angle mark at p between the directions to a and b */
function pcRA(p, a, b, s) { s = s || 9; const u = pcUnit(p, a), v = pcUnit(p, b), p1 = pcAdd(p, u, s), p3 = pcAdd(p, v, s), p2 = pcAdd(p1, v, s); return '<polyline points="' + [p1, p2, p3].map(pcXY).join(' ') + '" class="fang" fill="none"/>'; }
/* arc marking the angle at p between the directions to a and b */
function pcArc(p, a, b, r) { const u = pcUnit(p, a), v = pcUnit(p, b), s = pcAdd(p, u, r), e = pcAdd(p, v, r), cr = u[0] * v[1] - u[1] * v[0]; return '<path d="M' + pcXY(s) + ' A' + r + ',' + r + ' 0 0 ' + (cr > 0 ? 1 : 0) + ' ' + pcXY(e) + '" class="fang" fill="none"/>'; }
/* n ticks (equal lengths) across the middle of [ab] */
function pcTick(a, b, n) { n = n || 1; const m = pcMid(a, b), u = pcUnit(a, b), v = [-u[1], u[0]]; let o = ''; for (let i = 0; i < n; i++) { const c = pcAdd(m, u, (i - (n - 1) / 2) * 4); o += pcLn(pcAdd(c, v, -5), pcAdd(c, v, 5)); } return o; }
/* a length written next to the middle of [ab], on the side away from ctr */
function pcLen(a, b, s, ctr, d) { const m = pcMid(a, b), u = pcUnit(a, b); let v = [-u[1], u[0]]; if ((m[0] - ctr[0]) * v[0] + (m[1] - ctr[1]) * v[1] < 0) v = [-v[0], -v[1]]; return pcTx([m[0] + v[0] * (d || 14), m[1] + v[1] * (d || 14) + 5], s); }

/* =====================================================================================================
   p2.triangle-hauteur : Pythagore, hauteur et médiatrice dans un triangle équilatéral, Thalès, angles
   ===================================================================================================== */
/* EF = a, FG = 2a (K milieu de [FG], EK = KF = KG = EF) : EG = a√3, EH = a√3/2, KL = a√3/3 */
const PC_TRI = (() => {
  const out = [], s3 = Math.sqrt(3);
  for (let a = 3; a <= 20; a++) {
    if (a === 4) continue;                                   /* the side of the original exercise */
    const EG = a * s3, EH = EG / 2, KL = EG / 3;
    if (pcBad(EG, 1) || pcBad(EH, 2) || pcBad(KL, 1)) continue;
    /* KL = EH × 2/3 : the same answer with EH exact, rounded to 0,01 (the previous answer) or to 0,1 */
    if ([pcRd(EH, 2), pcRd(EH, 1)].some(e => pcTie(e * 2 / 3, 1, 0.03) || pcK(e * 2 / 3, 1) !== pcK(KL, 1))) continue;
    const vals = [a, 2 * a, a / 2, 1.5 * a, pcRd(EG, 1), pcRd(EH, 2), pcRd(KL, 1)];
    if (new Set(vals).size === vals.length) out.push(a);
  }
  return out;
})();
const PC_TRI_N = [['E', 'F', 'G', 'K', 'H', 'L'], ['R', 'S', 'T', 'M', 'H', 'N']];   /* right angle, 60° vertex, 30° vertex, midpoint, foot of the height, point on the parallel */
/* drawn to scale, hypotenuse horizontal. stage 0: the figure of the statement (with the equal-length marks); 1: + the height; 2: + the parallel */
function pcTriFig(a, nm, mir, stage) {
  const s3 = Math.sqrt(3), W = 340, k = 136 / a, P = (x, y) => [mir ? W - 34 - x * k : 34 + x * k, 148 - y * k];
  const F = P(0, 0), G = P(2 * a, 0), E = P(a / 2, a * s3 / 2), K = P(a, 0), H = P(a / 2, 0), Lp = P(a, a * s3 / 3), ctr = [(E[0] + F[0] + G[0]) / 3, (E[1] + F[1] + G[1]) / 3];
  let s = pcPl([E, F, G], 'fl', true) + pcLn(E, K) + pcRA(E, F, G);
  if (!stage) s += pcTick(E, F, 2) + pcTick(E, K, 2) + pcTick(F, K, 2) + pcTick(K, G, 2) + pcLen(E, F, nf(a) + ' cm', ctr, 24);
  if (stage) s += pcLn(E, H, 'fdash') + pcRA(H, K, E, 8);
  if (stage > 1) s += pcLn(K, pcAdd(Lp, pcUnit(K, Lp), 16), 'fhl');
  s += [[E, 0], [F, 1], [G, 2], [K, 3]].concat(stage ? [[H, 4]] : []).map(p => pcDot(p[0]) + pcLab(p[0], nm[p[1]], ctr, 15)).join('');
  if (stage > 1) s += pcDot(Lp) + pcLab(Lp, nm[5], pcDir(mir ? -1 : 1, -0.25), 15);
  return svgFig(W, 176, s, 'Triangle ' + nm[0] + nm[1] + nm[2] + ' rectangle en ' + nm[0]);
}
pcProb({ id: 'p2.triangle-hauteur', ch: 'ge', lvl: 2, pts: 4,
  ru: 'Прямоугольный треугольник: высота и параллельная прямая', fr: 'Triangle rectangle, hauteur et droite parallèle',
  src: 'Sujet de référence 2027 n°1 · exercice 3',
  gen(r) {
    const a = r.pick(PC_TRI), nm = r.pick(PC_TRI_N), mir = r() < 0.5, [nE, nF, nG, nK, nH, nL] = nm, s3 = Math.sqrt(3);
    const EGv = a * s3, EHv = EGv / 2, KLv = EGv / 3, HF = a / 2, GH = 1.5 * a;
    const tEFG = nE + nF + nG, tEFK = nE + nF + nK, tEFH = nE + nF + nH, tGKL = nG + nK + nL, sEF = nE + nF, sEG = nE + nG, sFG = nF + nG, sEK = nE + nK, sFK = nF + nK,
      sHF = nH + nF, sGH = nG + nH, sEH = nE + nH, sKL = nK + nL, sGK = nG + nK, sGL = nG + nL, sGE = nG + nE;
    const aF = '\\widehat{' + nE + nF + nG + '}', aG = '\\widehat{' + nE + nG + nF + '}', aL = '\\widehat{' + nG + nL + nK + '}';
    const ctx = L('Sur la figure ci-dessous, ' + tEFG + ' est un triangle rectangle en ' + nE + ' et ' + nK + ' est le milieu du segment [' + sFG + ']. On donne ' + sEF + ' = ' + nf(a) + ' cm. Les segments codés sur la figure ont la même longueur.',
      'На рисунке ' + tEFG + ' — прямоугольный треугольник с прямым углом ' + nE + ', а ' + nK + ' — середина отрезка [' + sFG + ']. Дано: ' + sEF + ' = ' + nf(a) + ' см. Отрезки, отмеченные на рисунке одинаковыми штрихами, равны.');
    return { ctx, fig: pcTriFig(a, nm, mir, 0), qs: [
      { q: L('Calculer la longueur ' + sEG + '. Arrondir au dixième.', 'Вычисли длину ' + sEG + '. Округли до десятых.'), ans: pcNR(EGv, 1, 'cm'),
        sol: [
          'Чтобы применить теорему Пифагора в треугольнике ' + tEFG + ', нужна гипотенуза [' + sFG + ']. ' + nK + ' — середина [' + sFG + '], а по отметкам на рисунке ' + nK + nF + ' = ' + sEF + ' = ' + nf(a) + ' см. Значит, ' + sFG + ' = 2 × ' + nf(a) + ' = ' + nf(2 * a) + ' см.',
          ['Треугольник ' + tEFG + ' прямоугольный с прямым углом ' + nE + ', его гипотенуза — [' + sFG + '] (сторона напротив прямого угла). По теореме Пифагора («théorème de Pythagore») ' + sFG + '² = ' + sEF + '² + ' + sEG + '². Катет находим вычитанием:', sEG + '^2=' + sFG + '^2-' + sEF + '^2=' + (2 * a) + '^2-' + a + '^2=' + (3 * a * a)],
          ['Длина положительна — берём корень и округляем до десятых:', sEG + '=√' + (3 * a * a) + '≈' + pcK(EGv, 1), 'см'],
          'Если квадраты сложить, получится отрезок длиннее гипотенузы, а так не бывает: катет всегда короче гипотенузы.'],
        redac: [nK + ' est le milieu de [' + sFG + '] et, d\'après le codage, ' + nK + nF + ' = ' + sEF + ', donc $' + sFG + '=2*' + a + '=' + (2 * a) + '$.',
          'Dans le triangle ' + tEFG + ' rectangle en ' + nE + ', d\'après le théorème de Pythagore : $' + sFG + '^2=' + sEF + '^2+' + sEG + '^2$.',
          '$' + sEG + '^2=' + sFG + '^2-' + sEF + '^2=' + (2 * a) + '^2-' + a + '^2=' + (3 * a * a) + '$',
          '$' + sEG + '=√' + (3 * a * a) + '≈' + pcK(EGv, 1) + '$',
          'La longueur ' + sEG + ' est d\'environ ' + pcS(EGv, 1) + ' cm.'] },
      { q: L('Parmi les propositions suivantes, laquelle est la définition de la hauteur issue de ' + nE + ' dans le triangle ' + tEFK + ' ?',
          'Какое из утверждений — определение высоты, проведённой из вершины ' + nE + ' в треугольнике ' + tEFK + '?'), red: true,
        ans: MQ(r, [
          L('C\'est la droite qui passe par ' + nE + ' et qui est perpendiculaire à la droite (' + sFK + ').', 'Это прямая, которая проходит через ' + nE + ' и перпендикулярна прямой (' + sFK + ').'),
          L('C\'est la droite qui passe par ' + nE + ' et par le milieu du côté [' + sFK + '].', 'Это прямая, которая проходит через ' + nE + ' и через середину стороны [' + sFK + '].'),
          L('C\'est la droite perpendiculaire au côté [' + sFK + '] qui passe par le milieu de ce côté.', 'Это прямая, перпендикулярная стороне [' + sFK + '] и проходящая через её середину.'),
          L('C\'est la droite qui partage l\'angle ' + pcAng(nF + nE + nK) + ' en deux angles de même mesure.', 'Это прямая, которая делит угол ' + pcAng(nF + nE + nK) + ' на два равных угла.')], 0),
        sol: [
          'Высота («hauteur») — это прямая, которая проходит через вершину и перпендикулярна прямой, содержащей противоположную сторону. Здесь вершина — ' + nE + ', противоположная сторона — [' + sFK + '].',
          'Остальные варианты — определения других прямых. Через вершину и середину противоположной стороны проходит медиана («médiane»). Перпендикуляр к стороне через её середину — серединный перпендикуляр («médiatrice»; слово похоже на «медиану», но это другая прямая). Прямая, которая делит угол пополам, — биссектриса («bissectrice»).',
          'В этом треугольнике все четыре прямые совпадут (это пригодится в следующем вопросе). Но определение высоты — только первое: оно говорит, что именно делает прямую высотой.'],
        redac: ['Dans le triangle ' + tEFK + ', la hauteur issue de ' + nE + ' est la droite qui passe par le sommet ' + nE + ' et qui est perpendiculaire à la droite (' + sFK + ').'] },
      { q: L('On appelle ' + nH + ' le pied de la hauteur issue de ' + nE + ' dans le triangle ' + tEFK + '. Déterminer la longueur ' + sHF + ', puis la longueur ' + sGH + '.',
          'Пусть ' + nH + ' — основание высоты, проведённой из ' + nE + ' в треугольнике ' + tEFK + '. Найди длину ' + sHF + ', затем длину ' + sGH + '.'), fig: pcTriFig(a, nm, mir, 1),
        ans: multi([sHF + ' =', pcNE(HF, 'cm')], [sGH + ' =', pcNE(GH, 'cm')]),
        sol: [
          'По отметкам на рисунке ' + sEF + ' = ' + sEK + ' (и ещё = ' + sFK + ': треугольник ' + tEFK + ' равносторонний).',
          'Раз ' + sEF + ' = ' + sEK + ', точка ' + nE + ' равноудалена от концов отрезка [' + sFK + '] и поэтому лежит на его серединном перпендикуляре («médiatrice»). Этот перпендикуляр проходит через ' + nE + ' и перпендикулярен (' + sFK + ') — значит, он и есть высота из ' + nE + '. А серединный перпендикуляр пересекает отрезок в его середине: ' + nH + ' — середина [' + sFK + '].',
          ['Половина отрезка [' + sFK + ']:', sHF + '=' + sFK + '÷2=' + a + '÷2=' + fx(HF), 'см'],
          ['Точка ' + nH + ' лежит на отрезке [' + sFG + '], поэтому [' + sGH + '] — это весь отрезок [' + sFG + '] без куска [' + sHF + ']:', sGH + '=' + sFG + '-' + sHF + '=' + (2 * a) + '-' + fx(HF) + '=' + fx(GH), 'см']],
        redac: ['D\'après le codage, ' + sEF + ' = ' + sEK + ' : le point ' + nE + ' est équidistant de ' + nF + ' et de ' + nK + ', donc il appartient à la médiatrice du segment [' + sFK + '].',
          'Cette médiatrice passe par ' + nE + ' et elle est perpendiculaire à (' + sFK + ') : c\'est la hauteur issue de ' + nE + '. Elle coupe [' + sFK + '] en son milieu, donc ' + nH + ' est le milieu de [' + sFK + '].',
          '$' + sHF + '=' + sFK + '÷2=' + a + '÷2=' + fx(HF) + '$',
          nH + ' appartient au segment [' + sFG + '], donc $' + sGH + '=' + sFG + '-' + sHF + '=' + (2 * a) + '-' + fx(HF) + '=' + fx(GH) + '$.',
          'Donc ' + sHF + ' = ' + nf(HF) + ' cm et ' + sGH + ' = ' + nf(GH) + ' cm.'] },
      { q: L('Calculer la longueur ' + sEH + '. Arrondir au centième.', 'Вычисли длину ' + sEH + '. Округли до сотых.'), ans: pcNR(EHv, 2, 'cm'),
        sol: [
          '(' + sEH + ') — высота, то есть (' + sEH + ') перпендикулярна (' + sFG + '): треугольник ' + tEFH + ' прямоугольный с прямым углом ' + nH + '. Его гипотенуза — [' + sEF + '], сторона напротив прямого угла.',
          ['По теореме Пифагора ' + sEF + '² = ' + sEH + '² + ' + sHF + '². Ищем катет, поэтому вычитаем:', sEH + '^2=' + sEF + '^2-' + sHF + '^2=' + a + '^2-' + fx(HF) + '^2=' + fx(0.75 * a * a)],
          ['', sEH + '=√' + fx(0.75 * a * a) + '≈' + pcK(EHv, 2), 'см'],
          'Проверка на здравый смысл: катет ' + sEH + ' ≈ ' + pcS(EHv, 2) + ' см короче гипотенузы ' + sEF + ' = ' + nf(a) + ' см.'],
        redac: ['(' + sEH + ') est la hauteur issue de ' + nE + ', donc (' + sEH + ') est perpendiculaire à (' + sFG + ') : le triangle ' + tEFH + ' est rectangle en ' + nH + '.',
          'D\'après le théorème de Pythagore : $' + sEF + '^2=' + sEH + '^2+' + sHF + '^2$.',
          '$' + sEH + '^2=' + sEF + '^2-' + sHF + '^2=' + a + '^2-' + fx(HF) + '^2=' + fx(0.75 * a * a) + '$',
          '$' + sEH + '=√' + fx(0.75 * a * a) + '≈' + pcK(EHv, 2) + '$',
          'La longueur ' + sEH + ' est d\'environ ' + pcS(EHv, 2) + ' cm.'] },
      { q: L('La droite parallèle à (' + sEH + ') passant par ' + nK + ' coupe la droite (' + sEG + ') en ' + nL + '. Calculer la longueur ' + sKL + '. Arrondir au dixième.',
          'Прямая, параллельная (' + sEH + ') и проходящая через ' + nK + ', пересекает прямую (' + sEG + ') в точке ' + nL + '. Вычисли длину ' + sKL + '. Округли до десятых.'), fig: pcTriFig(a, nm, mir, 2),
        ans: pcNR(KLv, 1, 'cm'),
        sol: [
          'Прямые (' + sGH + ') и (' + sGE + ') пересекаются в точке ' + nG + '; ' + nK + ' лежит на [' + sGH + '], ' + nL + ' — на [' + sGE + '], а (' + sKL + ') параллельна (' + sEH + '). Это конфигурация теоремы Фалеса («théorème de Thalès»): маленький треугольник ' + tGKL + ' — уменьшенная копия треугольника ' + nG + nH + nE + ', поэтому их стороны пропорциональны.',
          { t: '', tex: pcDf(sGK, sGH) + '=' + pcDf(sGL, sGE) + '=' + pcDf(sKL, sEH) },
          'Известны ' + sGK + ' = ' + nf(a) + ' см (' + nK + ' — середина [' + sFG + ']), ' + sGH + ' = ' + nf(GH) + ' см и ' + sEH + ' ≈ ' + pcS(EHv, 2) + ' см. Берём первое и третье отношения:',
          ['', sKL + '=' + sEH + '*' + sGK + '÷' + sGH + '≈' + pcK(EHv, 2) + '*' + a + '÷' + fx(GH) + '≈' + pcK(KLv, 1), 'см'],
          'Округление ' + sEH + ' на ответ не влияет: с неокруглённым значением получается ' + sKL + ' ≈ ' + pcS(KLv, 3) + ', то есть те же ' + pcS(KLv, 1) + ' см.'],
        redac: ['Les droites (' + nK + nH + ') et (' + nL + nE + ') sont sécantes en ' + nG + ' et les droites (' + sKL + ') et (' + sEH + ') sont parallèles.',
          'D\'après le théorème de Thalès : $$' + pcDf(sGK, sGH) + '=' + pcDf(sGL, sGE) + '=' + pcDf(sKL, sEH) + '$$.',
          'Donc $$' + pcDf(sKL, sEH) + '=' + pcDf(pcT(a), pcT(GH)) + '$$, soit $$' + sKL + '\\approx' + pcDf(pcT(a) + '\\times ' + pcTk(EHv, 2), pcT(GH)) + '\\approx ' + pcTk(KLv, 1) + '$$.',
          'La longueur ' + sKL + ' est d\'environ ' + pcS(KLv, 1) + ' cm.'] },
      { q: L('On veut démontrer que les angles ' + pcAng(nE + nF + nG) + ' et ' + pcAng(nG + nL + nK) + ' sont égaux. Remettre dans l\'ordre les étapes de la démonstration.',
          'Нужно доказать, что углы ' + pcAng(nE + nF + nG) + ' и ' + pcAng(nG + nL + nK) + ' равны. Расставь шаги доказательства по порядку.'), red: true, fig: pcTriFig(a, nm, mir, 2),
        ans: ORD(r, [
          L('D\'après le codage, ' + sEF + ' = ' + sEK + ' = ' + sFK + ' : le triangle ' + tEFK + ' est équilatéral.', 'По отметкам на рисунке ' + sEF + ' = ' + sEK + ' = ' + sFK + ': треугольник ' + tEFK + ' равносторонний.'),
          L('Ses trois angles mesurent donc 60° ; en particulier, $$' + aF + '=60^{\\circ}$$.', 'Значит, все три его угла равны 60°; в частности, $$' + aF + '=60^{\\circ}$$.'),
          L('Dans le triangle ' + tEFG + ' rectangle en ' + nE + ', les angles aigus sont complémentaires : $$' + aG + '=90^{\\circ}-60^{\\circ}=30^{\\circ}$$.', 'В прямоугольном треугольнике ' + tEFG + ' (прямой угол ' + nE + ') острые углы в сумме дают 90°: $$' + aG + '=90^{\\circ}-60^{\\circ}=30^{\\circ}$$.'),
          L('(' + sKL + ') est parallèle à (' + sEH + ') et (' + sEH + ') est perpendiculaire à (' + sFG + '), donc le triangle ' + tGKL + ' est rectangle en ' + nK + ' : $$' + aL + '=90^{\\circ}-30^{\\circ}=60^{\\circ}$$.', '(' + sKL + ') параллельна (' + sEH + '), а (' + sEH + ') перпендикулярна (' + sFG + '), поэтому треугольник ' + tGKL + ' прямоугольный с прямым углом ' + nK + ': $$' + aL + '=90^{\\circ}-30^{\\circ}=60^{\\circ}$$.'),
          L('Donc $$' + aF + '=' + aL + '$$.', 'Значит, $$' + aF + '=' + aL + '$$.')]),
        sol: [
          'Доказательство идёт от того, что дано, к выводу. Дано — отметки на рисунке: из них получаем равносторонний треугольник и первый угол, 60°.',
          'Затем второй острый угол большого прямоугольного треугольника: 90° − 60° = 30°. Это же угол при вершине ' + nG + ' в маленьком треугольнике ' + tGKL + '.',
          'Чтобы найти угол ' + nG + nL + nK + ', нужно знать, что треугольник ' + tGKL + ' прямоугольный: если две прямые параллельны, то прямая, перпендикулярная одной из них, перпендикулярна и другой. Тогда этот угол равен 90° − 30° = 60°.',
          'Вывод пишут в самом конце: оба угла равны 60°, значит, они равны между собой.'] }] };
  } });

/* =====================================================================================================
   p2.jetons-sac : probabilité, événement « ou », événement contraire, composition du sac après un ajout
   ===================================================================================================== */
const PC_COUL = [['vert', 'verts', 'зелёный', 'зелёных'], ['bleu', 'bleus', 'синий', 'синих'], ['blanc', 'blancs', 'белый', 'белых'], ['noir', 'noirs', 'чёрный', 'чёрных'], ['jaune', 'jaunes', 'жёлтый', 'жёлтых'], ['rouge', 'rouges', 'красный', 'красных']];
const pcFrS = (p, q) => p + '/' + q + (F(p, q).d === q ? '' : '=' + Fr.str(F(p, q)));                    /* 10/24=5/12 (input syntax) */
const pcFrT = (p, q) => pcDf(p, q) + (F(p, q).d === q ? '' : '=' + pcDf(F(p, q).n, F(p, q).d));          /* the same in TeX */
pcProb({ id: 'p2.jetons-sac', ch: 'st', lvl: 2, pts: 4,
  ru: 'Жетоны в мешке', fr: 'Des jetons dans un sac',
  src: 'Sujet de référence 2027 n°2 · exercice 1',
  gen(r) {
    /* a, b, c jetons of three colours (n in all); x jetons of a fourth colour are added so that their probability is 1/k: x = n/(k−1) */
    let n = 24, a = 10, b = 9, c = 5, k = 4, x = 8;
    for (let t = 0; t < 300; t++) {
      const n1 = r.pick([12, 15, 16, 18, 20, 24, 28, 30, 36, 40]), a1 = r.ri(3, n1 - 5), b1 = r.ri(2, n1 - a1 - 2), c1 = n1 - a1 - b1;
      const k1 = r.pick([3, 4, 5, 6, 7].filter(q => n1 % (q - 1) === 0)), x1 = n1 / (k1 - 1);
      if (c1 < 2 || new Set([a1, b1, c1]).size < 3 || 2 * a1 === n1 || [a1, b1, c1, b1 + c1].includes(x1) || x1 < 2) continue;   /* p(vert) ≠ p(A); the last answer is a new number */
      if ([a1, b1, c1, x1].some(v => v % 10 === 1 && v !== 11) || a1 * k1 === n1 || (b1 + c1) * k1 === n1 || (n1 === 20 && a1 === 10)) continue;
      n = n1; a = a1; b = b1; c = c1; k = k1; x = x1; break;
    }
    const [c1, c2, c3, c4] = r.sh(PC_COUL), jet = v => pcRu(v, 'жетон', 'жетона', 'жетонов'), pA = F(b + c, n);
    const ctx = L('Un sac opaque contient ' + a + ' jetons ' + c1[1] + ', ' + b + ' jetons ' + c2[1] + ' et ' + c + ' jetons ' + c3[1] + ', indiscernables au toucher. On tire au hasard un jeton du sac, on note sa couleur, puis on le remet dans le sac.',
      'В непрозрачном мешке лежат ' + a + ' ' + c1[3] + ' ' + jet(a) + ', ' + b + ' ' + c2[3] + ' ' + jet(b) + ' и ' + c + ' ' + c3[3] + ' ' + jet(c) + ', неразличимых на ощупь. Из мешка наугад вынимают один жетон, записывают его цвет и кладут жетон обратно.');
    const evA = '« Le jeton tiré est ' + c2[0] + ' ou ' + c3[0] + ' »', g1 = gcd(a, n), g2 = gcd(b + c, n);
    return { ctx, qs: [
      { q: L('Calculer la probabilité que le jeton tiré soit ' + c1[0] + '. Donner le résultat sous forme de fraction irréductible.', 'Вычисли вероятность того, что вынутый жетон — ' + c1[2] + '. Запиши ответ несократимой дробью.'), ans: FRA(F(a, n)),
        sol: [
          'Жетоны неразличимы на ощупь, поэтому у каждого из них одинаковые шансы быть вынутым («équiprobabilité»). В таком случае вероятность события — это число подходящих жетонов, делённое на число всех жетонов.',
          ['Всего жетонов:', a + '+' + b + '+' + c + '=' + n],
          ['Подходящих (' + c1[3] + ') — ' + a + ':', 'p=' + pcFrS(a, n)],
          g1 > 1 ? 'Сократили на ' + g1 + ': числитель и знаменатель разделили на одно и то же число, значение дроби от этого не меняется.' : 'У чисел ' + a + ' и ' + n + ' нет общих делителей, кроме 1, — дробь уже несократимая.'],
        redac: ['Le sac contient $' + a + '+' + b + '+' + c + '=' + n + '$ jetons et chaque jeton a la même probabilité d\'être tiré.',
          'Il y a ' + a + ' jetons ' + c1[1] + ' parmi ces ' + n + ' jetons.',
          'La probabilité que le jeton tiré soit ' + c1[0] + ' est donc $' + pcFrS(a, n) + '$.'] },
      { q: L('On considère l\'événement A : ' + evA + '. Calculer la probabilité de l\'événement A. Donner le résultat sous forme de fraction irréductible.',
          'Рассмотрим событие A: «Вынутый жетон — ' + c2[2] + ' или ' + c3[2] + '». Вычисли вероятность события A. Запиши ответ несократимой дробью.'), ans: FRA(pA),
        sol: [
          'Событие A происходит, если вынут любой из ' + c2[3] + ' или любой из ' + c3[3] + ' жетонов. Считаем, сколько их всего:',
          ['', b + '+' + c + '=' + (b + c)],
          ['Это ' + (b + c) + ' ' + jet(b + c) + ' из ' + n + ':', 'p(A)=' + pcFrS(b + c, n)],
          'Жетон не может быть сразу двух цветов, поэтому можно и сложить вероятности двух цветов: $' + b + '/' + n + '+' + c + '/' + n + '$ — получится то же самое.' + (g2 > 1 ? ' Не забудь сократить дробь (на ' + g2 + ').' : '')],
        redac: ['L\'événement A est réalisé lorsque le jeton tiré est l\'un des ' + b + ' jetons ' + c2[1] + ' ou l\'un des ' + c + ' jetons ' + c3[1] + ' : $' + b + '+' + c + '=' + (b + c) + '$ jetons sur ' + n + '.',
          'La probabilité de l\'événement A est donc $p(A)=' + pcFrS(b + c, n) + '$.'] },
      { q: L('Pour retrouver ce résultat par une autre méthode, on utilise l\'événement contraire de A. Parmi les événements suivants, lequel est l\'événement contraire de A ?',
          'Чтобы получить этот результат другим способом, используют событие, противоположное событию A. Какое из этих событий противоположно событию A?'), red: true,
        ans: MQ(r, [
          L('« Le jeton tiré est ' + c1[0] + ' »', '«Вынутый жетон — ' + c1[2] + '»'),
          L('« Le jeton tiré n\'est pas ' + c2[0] + ' »', '«Вынутый жетон — не ' + c2[2] + '»'),
          L('« Le jeton tiré est ' + c2[0] + ' et ' + c3[0] + ' »', '«Вынутый жетон — ' + c2[2] + ' и ' + c3[2] + '»'),
          L('« Le jeton tiré n\'est pas ' + c1[0] + ' »', '«Вынутый жетон — не ' + c1[2] + '»')], 0),
        sol: [
          'Противоположное событие («événement contraire») — «событие A не произошло». A — «жетон ' + c2[2] + ' или ' + c3[2] + '». Оно не происходит, когда жетон и не ' + c2[2] + ', и не ' + c3[2] + ', то есть когда он ' + c1[2] + '.',
          'Событие и противоположное ему вместе покрывают все случаи и не могут произойти одновременно, поэтому сумма их вероятностей равна 1. Отсюда второй способ: $p(A)=1-' + a + '/' + n + '=' + pcFrS(n - a, n) + '$ — то же, что в предыдущем вопросе.',
          'Откуда берутся ошибки. «Жетон не ' + c2[2] + '» — отрицание только половины условия: ' + c3[2] + ' жетон не ' + c2[2] + ', но при нём событие A происходит. «' + c2[2][0].toUpperCase() + c2[2].slice(1) + ' и ' + c3[2] + '» — путаница «ou» (или) с «et» (и): такого жетона нет вообще, а противоположное событие должно происходить всякий раз, когда не происходит A. «Жетон не ' + c1[2] + '» — это само событие A, только сказанное другими словами.'],
        redac: ['L\'événement contraire de A est « Le jeton tiré est ' + c1[0] + ' ». Sa probabilité est $' + a + '/' + n + '$.',
          'La somme des probabilités d\'un événement et de son événement contraire est égale à 1.',
          'Donc $$p(A)=1-' + pcDf(a, n) + '=' + pcFrT(n - a, n) + '$$.'] },
      { q: L('On ajoute dans le sac des jetons ' + c4[1] + '. Après cet ajout, la probabilité de tirer un jeton ' + c4[0] + ' est égale à $1/' + k + '$. Combien de jetons ' + c4[1] + ' a-t-on ajoutés ?',
          'В мешок добавляют несколько ' + c4[3] + ' жетонов. После этого вероятность вынуть ' + c4[2] + ' жетон равна $1/' + k + '$. Сколько ' + c4[3] + ' жетонов добавили?'), ans: N(x),
        sol: [
          'Пусть добавили $x$ ' + c4[3] + ' жетонов. Тогда всего в мешке стало $' + n + '+x$ жетонов, и ' + c4[3] + ' среди них ровно $x$ (раньше таких не было).',
          ['Вероятность вынуть ' + c4[2] + ' жетон — это доля таких жетонов среди всех:', 'x/(' + n + '+x)=1/' + k],
          ['Умножаем обе части на $' + k + '(' + n + '+x)$, чтобы избавиться от знаменателей, и собираем $x$ в одной части:', k + 'x=' + n + '+x;' + (k - 1) + 'x=' + n + ';x=' + x],
          'Можно рассуждать и без уравнения: новые жетоны составляют $1/' + k + '$ всех, значит, прежние ' + n + ' ' + jet(n) + ' — это $' + (k - 1) + '/' + k + '$ всех. Одна такая доля — $' + n + '÷' + (k - 1) + '=' + x + '$ ' + jet(x) + '.',
          ['Проверка: в мешке стало ' + (n + x) + ' ' + jet(n + x) + ', из них новых — ' + x + ':', x + '/' + (n + x) + '=1/' + k]],
        redac: ['Soit $x$ le nombre de jetons ' + c4[1] + ' ajoutés. Le sac contient alors $' + n + '+x$ jetons, dont $x$ jetons ' + c4[1] + '.',
          'La probabilité de tirer un jeton ' + c4[0] + ' est donc $x/(' + n + '+x)$. On résout l\'équation $x/(' + n + '+x)=1/' + k + '$.',
          '$' + k + 'x=' + n + '+x$, donc $' + (k - 1) + 'x=' + n + '$ et $x=' + x + '$.',
          'On a ajouté ' + x + ' jetons ' + c4[1] + '.'] }] };
  } });

/* =====================================================================================================
   p2.cercle-mediatrice : triangle isocèle, médiatrice et bissectrice, cosinus, Pythagore, aire
   ===================================================================================================== */
/* rayon R, angle au centre 2θ : OH = R cos θ, HB = R sin θ, AB = 2 HB, aire = AB × OH ÷ 2 */
const PC_CER = (() => {
  const out = [];
  for (let R = 3; R <= 12; R++) for (let th = 20; th <= 70; th++) {
    if ([30, 45, 60].includes(th) || (R === 5 && th === 35)) continue;       /* equilateral or right-angled triangle, exact values; the numbers of the original exercise */
    const t = th * Math.PI / 180, OH = R * Math.cos(t), HB = R * Math.sin(t), AB = 2 * HB, ar = R * R * Math.sin(2 * t) / 2;
    if (pcBad(OH, 1) || pcBad(HB, 1) || pcBad(AB, 1) || pcTie(ar, 0, 0.12)) continue;
    const OHr = pcRd(OH, 1), HBr = pcRd(HB, 1), ABr = pcRd(AB, 1), HB2 = Math.sqrt(R * R - OHr * OHr);
    if (pcTie(HB2, 1, 0.03) || pcRd(HB2, 1) !== HBr) continue;                /* Pythagore with the rounded OH gives the same HB */
    if (pcRd(2 * HBr, 1) !== ABr) continue;                                   /* doubling the rounded HB gives the same AB */
    const ar2 = ABr * OHr / 2; if (pcTie(ar2, 0, 0.12) || pcRd(ar2) !== pcRd(ar)) continue;   /* the area from the rounded lengths is the same */
    const vals = [R, th, 2 * th, OHr, HBr, ABr, pcRd(ar)];
    if (new Set(vals).size === vals.length) out.push({ R, th });
  }
  return out;
})();
const PC_CER_N = [['E', 'F', 'K'], ['M', 'P', 'I'], ['S', 'T', 'J']];   /* two points of the circle and the midpoint of the chord */
function pcCerFig(d, nm) {
  const cx = 168, cy = 128, rp = 92, be = 35 * Math.PI / 180, t = d.th * Math.PI / 180, P = (ang, rad) => [cx + rad * Math.cos(ang), cy - rad * Math.sin(ang)];
  const O = [cx, cy], A = P(be - t, rp), B = P(be + t, rp), H = pcMid(A, B), u = pcUnit(O, H);
  let s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + rp + '" class="fl" fill="none"/>';
  s += pcLn(pcAdd(O, u, -24), pcAdd(O, u, rp + 26), 'fdash') + pcLn(O, A) + pcLn(O, B) + pcLn(A, B) + pcRA(H, B, O, 8) + pcTick(A, H) + pcTick(H, B) + pcArc(O, A, B, 20);
  s += [O, A, B, H].map(pcDot).join('') + pcLab(O, 'O', pcDir(-0.985, -0.174), 15) + pcLab(A, nm[0], O, 15) + pcLab(B, nm[1], O, 15);
  s += pcLab(H, nm[2], pcDir(Math.cos(be - 50 * Math.PI / 180), -Math.sin(be - 50 * Math.PI / 180)), 17) + pcLen(O, A, nf(d.R) + ' cm', H, 15);
  return svgFig(340, 238, s, 'Cercle de centre O, corde [' + nm[0] + nm[1] + '] et sa médiatrice');
}
pcProb({ id: 'p2.cercle-mediatrice', ch: 'ge', lvl: 2, pts: 4,
  ru: 'Окружность, хорда и её серединный перпендикуляр', fr: 'Un cercle, une corde et sa médiatrice',
  src: 'Sujet de référence 2027 n°2 · exercice 2',
  gen(r) {
    const d = r.pick(PC_CER), nm = r.pick(PC_CER_N), [nA, nB, nH] = nm, R = d.R, th = d.th, t = th * Math.PI / 180;
    const OH = R * Math.cos(t), HB = R * Math.sin(t), AB = 2 * HB, ar = R * R * Math.sin(2 * t) / 2, OHr = pcRd(OH, 1), ABr = pcRd(AB, 1), q2 = fx(R * R - OHr * OHr);
    const tri = nA + 'O' + nB, sAB = nA + nB, sHB = nH + nB, sOA = 'O' + nA, sOB = 'O' + nB, sOH = 'O' + nH, tOHB = 'O' + nH + nB, aHOB = '\\widehat{' + nH + 'O' + nB + '}';
    const ctx = L('Soit O et ' + nA + ' deux points tels que ' + sOA + ' = ' + R + ' cm. On trace le cercle de centre O qui passe par ' + nA + ', puis on place sur ce cercle un point ' + nB + ' tel que l\'angle ' + pcAng(tri) + ' mesure ' + (2 * th) + '°. La médiatrice du segment [' + sAB + '] coupe ce segment en ' + nH + '.',
      'Пусть O и ' + nA + ' — две точки, такие что ' + sOA + ' = ' + R + ' см. Проведена окружность с центром O, проходящая через ' + nA + ', и на ней отмечена точка ' + nB + ' так, что угол ' + pcAng(tri) + ' равен ' + (2 * th) + '°. Серединный перпендикуляр к отрезку [' + sAB + '] пересекает этот отрезок в точке ' + nH + '.');
    return { ctx, fig: pcCerFig(d, nm), qs: [
      { q: L('Quelle est la nature du triangle ' + tri + ' ? Choisir la réponse correctement justifiée.', 'Какой вид у треугольника ' + tri + '? Выбери ответ с верным обоснованием.'), red: true,
        ans: MQ(r, [
          L('Il est isocèle en O, car ' + nA + ' et ' + nB + ' appartiennent au cercle de centre O : ' + sOA + ' = ' + sOB + '.', 'Он равнобедренный с вершиной O: точки ' + nA + ' и ' + nB + ' лежат на окружности с центром O, поэтому ' + sOA + ' = ' + sOB + '.'),
          L('Il est équilatéral, car ' + sOA + ' = ' + sOB + ' = ' + sAB + '.', 'Он равносторонний, так как ' + sOA + ' = ' + sOB + ' = ' + sAB + '.'),
          L('Il est rectangle en O, car [' + sOA + '] et [' + sOB + '] sont deux rayons du cercle.', 'Он прямоугольный с прямым углом O, так как [' + sOA + '] и [' + sOB + '] — два радиуса окружности.'),
          L('Il est isocèle en ' + nA + ', car ' + nA + ' appartient au cercle : ' + nA + 'O = ' + sAB + '.', 'Он равнобедренный с вершиной ' + nA + ', так как ' + nA + ' лежит на окружности: ' + nA + 'O = ' + sAB + '.')], 0),
        sol: [
          'Окружность — это все точки, которые находятся на одном и том же расстоянии от центра (на расстоянии радиуса). Точки ' + nA + ' и ' + nB + ' лежат на окружности с центром O, значит, ' + sOA + ' = ' + sOB + ' = ' + R + ' см.',
          'Треугольник с двумя равными сторонами — равнобедренный («isocèle»). В ответе называют вершину, из которой выходят равные стороны: «isocèle en O».',
          'Равносторонним он был бы только при угле 60° при вершине O, а прямоугольным в O — при угле 90°; здесь угол ' + (2 * th) + '°. Про длину [' + sAB + '] пока ничего не известно, так что равенству с ' + sAB + ' взяться неоткуда.'],
        redac: ['Les points ' + nA + ' et ' + nB + ' appartiennent au cercle de centre O, donc ' + sOA + ' = ' + sOB + '.',
          'Le triangle ' + tri + ' a deux côtés de même longueur : il est isocèle en O.'] },
      { q: L('Remettre dans l\'ordre les étapes qui justifient que la médiatrice du segment [' + sAB + '] passe par le point O et que l\'angle ' + pcAng(nH + 'O' + nB) + ' mesure ' + th + '°.',
          'Расставь по порядку шаги, которые обосновывают, что серединный перпендикуляр к отрезку [' + sAB + '] проходит через точку O и что угол ' + pcAng(nH + 'O' + nB) + ' равен ' + th + '°.'), red: true,
        ans: ORD(r, [
          L('Les points ' + nA + ' et ' + nB + ' appartiennent au cercle de centre O, donc ' + sOA + ' = ' + sOB + '.', 'Точки ' + nA + ' и ' + nB + ' лежат на окружности с центром O, поэтому ' + sOA + ' = ' + sOB + '.'),
          L('Or, si un point est équidistant des extrémités d\'un segment, alors il appartient à la médiatrice de ce segment : le point O appartient donc à la médiatrice de [' + sAB + '].', 'А если точка равноудалена от концов отрезка, то она лежит на его серединном перпендикуляре: значит, точка O лежит на серединном перпендикуляре к [' + sAB + '].'),
          L('Dans le triangle ' + tri + ' isocèle en O, cette médiatrice (' + sOH + ') est aussi la bissectrice de l\'angle ' + pcAng(tri) + '.', 'В треугольнике ' + tri + ', равнобедренном с вершиной O, этот серединный перпендикуляр (' + sOH + ') является ещё и биссектрисой угла ' + pcAng(tri) + '.'),
          L('Donc $$' + aHOB + '=' + (2 * th) + '^{\\circ}\\div 2=' + th + '^{\\circ}$$.', 'Значит, $$' + aHOB + '=' + (2 * th) + '^{\\circ}\\div 2=' + th + '^{\\circ}$$.')]),
        sol: [
          'Начинаем с того, что дано: обе точки лежат на окружности, поэтому расстояния от O до них равны.',
          'Затем — свойство серединного перпендикуляра («médiatrice»): на нём лежат все точки, равноудалённые от концов отрезка. Точка O равноудалена от ' + nA + ' и ' + nB + ' — значит, она на нём лежит.',
          'Теперь известно, что (' + sOH + ') — серединный перпендикуляр к основанию равнобедренного треугольника. Это его ось симметрии: если перегнуть рисунок по ней, точки ' + nA + ' и ' + nB + ' совпадут. Поэтому угол при вершине O делится пополам — ось является ещё и биссектрисой («bissectrice»).',
          'В конце — вычисление: ' + (2 * th) + '° ÷ 2 = ' + th + '°.'] },
      { q: L('Calculer la longueur ' + sOH + '. Arrondir au dixième.', 'Вычисли длину ' + sOH + '. Округли до десятых.'), ans: pcNR(OH, 1, 'cm'),
        sol: [
          '(' + sOH + ') — серединный перпендикуляр к [' + sAB + '], поэтому (' + sOH + ') перпендикулярна (' + sAB + '): треугольник ' + tOHB + ' прямоугольный с прямым углом ' + nH + '.',
          'В нём известны острый угол ' + nH + 'O' + nB + ' = ' + th + '° и гипотенуза ' + sOB + ' = ' + R + ' см (это радиус). Нужен катет [' + sOH + '] — он прилежит к известному углу. Прилежащий катет и гипотенузу связывает косинус.',
          { t: 'По определению косинуса в прямоугольном треугольнике:', tex: '\\cos' + aHOB + '=' + pcDf(sOH, sOB) },
          { t: 'Отсюда длина в сантиметрах (калькулятор должен считать в градусах):', tex: sOH + '=' + R + '\\times\\cos ' + th + '^{\\circ}\\approx ' + pcTk(OH, 1) }],
        redac: ['La médiatrice (' + sOH + ') est perpendiculaire à (' + sAB + '), donc le triangle ' + tOHB + ' est rectangle en ' + nH + '.',
          'Dans ce triangle : $$\\cos' + aHOB + '=' + pcDf(sOH, sOB) + '$$, soit $$\\cos ' + th + '^{\\circ}=' + pcDf(sOH, R) + '$$.',
          '$$' + sOH + '=' + R + '\\times\\cos ' + th + '^{\\circ}\\approx ' + pcTk(OH, 1) + '$$',
          'La longueur ' + sOH + ' est d\'environ ' + pcS(OH, 1) + ' cm.'] },
      { q: L('Calculer la longueur ' + sHB + '. Arrondir au dixième.', 'Вычисли длину ' + sHB + '. Округли до десятых.'), ans: pcNR(HB, 1, 'cm'),
        sol: [
          'В том же прямоугольном треугольнике ' + tOHB + ' теперь известны гипотенуза ' + sOB + ' = ' + R + ' см и катет ' + sOH + ' ≈ ' + pcS(OH, 1) + ' см. Второй катет находим по теореме Пифагора: ' + sOB + '² = ' + sOH + '² + ' + sHB + '².',
          ['Ищем катет, поэтому из квадрата гипотенузы вычитаем квадрат известного катета:', sHB + '^2=' + sOB + '^2-' + sOH + '^2≈' + R + '^2-' + pcK(OH, 1) + '^2=' + q2],
          ['', sHB + '≈√' + q2 + '≈' + pcK(HB, 1), 'см'],
          'Можно и через синус: ' + sHB + ' = ' + R + ' × sin ' + th + '° ≈ ' + pcS(HB, 3) + ' — после округления до десятых получаются те же ' + pcS(HB, 1) + ' см.'],
        redac: ['Dans le triangle ' + tOHB + ' rectangle en ' + nH + ', d\'après le théorème de Pythagore : $' + sOB + '^2=' + sOH + '^2+' + sHB + '^2$.',
          '$' + sHB + '^2=' + sOB + '^2-' + sOH + '^2≈' + R + '^2-' + pcK(OH, 1) + '^2$, soit $' + sHB + '^2≈' + q2 + '$.',
          '$' + sHB + '≈√' + q2 + '≈' + pcK(HB, 1) + '$',
          'La longueur ' + sHB + ' est d\'environ ' + pcS(HB, 1) + ' cm.'] },
      { q: L('En déduire la longueur ' + sAB + '. Arrondir au dixième.', 'Выведи отсюда длину ' + sAB + '. Округли до десятых.'), ans: pcNR(AB, 1, 'cm'),
        sol: [
          nH + ' — точка, в которой серединный перпендикуляр пересекает отрезок [' + sAB + '], то есть середина этого отрезка. Значит, ' + sAB + ' вдвое длиннее, чем ' + sHB + '.',
          ['', sAB + '=2*' + sHB + '≈2*' + pcK(HB, 1) + '=' + pcK(AB, 1), 'см'],
          'С более точным значением ' + sHB + ' ≈ ' + pcS(HB, 3) + ' получается ' + pcS(AB, 3) + ' — после округления до десятых те же ' + pcS(AB, 1) + ' см.'],
        redac: ['La médiatrice d\'un segment coupe ce segment en son milieu, donc ' + nH + ' est le milieu de [' + sAB + '].',
          '$' + sAB + '=2*' + sHB + '≈2*' + pcK(HB, 1) + '$, soit $' + sAB + '≈' + pcK(AB, 1) + '$.',
          'La longueur ' + sAB + ' est d\'environ ' + pcS(AB, 1) + ' cm.'] },
      { q: L('Calculer l\'aire du triangle ' + tri + '. Arrondir à l\'unité.', 'Вычисли площадь треугольника ' + tri + '. Округли до целых.'), ans: pcNR(ar, 0, 'cm²'),
        sol: [
          'Площадь треугольника — половина произведения стороны на проведённую к ней высоту. Берём сторону [' + sAB + ']: высота к ней — [' + sOH + '], потому что (' + sOH + ') перпендикулярна (' + sAB + ').',
          ['', pcK(AB, 1) + '*' + pcK(OH, 1) + '÷2=' + fx(ABr * OHr / 2)],
          'Округляем до целых: ' + pcK(ar, 0) + ' см². Сторону ' + sOB + ' = ' + R + ' см брать вместо высоты нельзя: она не перпендикулярна [' + sAB + '].'],
        redac: ['Dans le triangle ' + tri + ', [' + sOH + '] est la hauteur relative au côté [' + sAB + '], car (' + sOH + ') est perpendiculaire à (' + sAB + ').',
          '$$\\mathcal{A}=' + pcDf(sAB + '\\times ' + sOH, 2) + '\\approx' + pcDf(pcTk(AB, 1) + '\\times ' + pcTk(OH, 1), 2) + '\\approx ' + pcK(ar, 0) + '$$',
          'L\'aire du triangle ' + tri + ' est d\'environ ' + pcK(ar, 0) + ' cm².'] }] };
  } });

/* ---------- graphs on a grid ---------- */
/* the parts of the curve y = f(x), a ≤ x ≤ b, that lie inside y0 ≤ y ≤ y1 (cut exactly where the curve leaves the frame) */
function pcCurve(f, a, b, y0, y1, n) {
  const segs = [], ins = v => v >= y0 - 1e-9 && v <= y1 + 1e-9, cut = (x1, v1, x2, v2) => { const yb = v1 > y1 || v2 > y1 ? y1 : y0; return [x1 + (yb - v1) / (v2 - v1) * (x2 - x1), yb]; };
  let px = a, py = f(a), cur = ins(py) ? [[px, py]] : null;
  for (let i = 1; i <= n; i++) {
    const x = a + (b - a) * i / n, y = f(x);
    if (ins(py) && ins(y)) cur.push([x, y]);
    else if (ins(py)) { cur.push(cut(px, py, x, y)); segs.push(cur); cur = null; }
    else if (ins(y)) cur = [cut(px, py, x, y), [x, y]];
    px = x; py = y;
  }
  if (cur) segs.push(cur);
  return segs;
}
/* o = { x0, x1, y0, y1 — the window; xs, ys — grid steps; xb, yb — steps of the stronger lines (optional); xm, ym — steps of the numbers;
         ph — height of the plot; top — room above the plot; xn, yn — names of the axes; curves: [{ f, cls, a, b, n }]; extra(X, Y, T0) — svg drawn on top; label } */
function pcPlot(o) {
  const L0 = 36, T0 = o.top || (o.yn ? 26 : 12), PW = 290, PH = o.ph || 230, H = T0 + PH + (o.xn ? 42 : 24);
  const X = x => L0 + (x - o.x0) / (o.x1 - o.x0) * PW, Y = y => T0 + PH - (y - o.y0) / (o.y1 - o.y0) * PH;
  const ln = (x1, y1, x2, y2, c) => '<line class="' + c + '" x1="' + pcC(x1) + '" y1="' + pcC(y1) + '" x2="' + pcC(x2) + '" y2="' + pcC(y2) + '"/>';
  const steps = (a, b, st) => { const out = []; for (let i = Math.ceil(a / st - 1e-9); i * st <= b + 1e-9; i++) out.push(+(i * st).toFixed(6)); return out; };
  const isM = (v, m) => m && Math.abs(v / m - Math.round(v / m)) < 1e-6;
  let s = '';
  steps(o.x0, o.x1, o.xs).forEach(x => { s += ln(X(x), T0, X(x), T0 + PH, isM(x, o.xb) ? 'fl2' : 'fgrid'); });
  steps(o.y0, o.y1, o.ys).forEach(y => { s += ln(L0, Y(y), L0 + PW, Y(y), isM(y, o.yb) ? 'fl2' : 'fgrid'); });
  if (o.y0 <= 0 && o.y1 >= 0) s += ln(L0, Y(0), L0 + PW + 5, Y(0), 'fax');
  if (o.x0 <= 0 && o.x1 >= 0) s += ln(X(0), T0 + PH, X(0), T0 - 5, 'fax');
  steps(o.x0, o.x1, o.xm).forEach(x => { s += '<text class="ftm" x="' + pcC(X(x)) + '" y="' + (T0 + PH + 16) + '" text-anchor="middle">' + nf(x) + '</text>'; });
  steps(o.y0, o.y1, o.ym).forEach(y => { s += '<text class="ftm" x="' + (L0 - 5) + '" y="' + pcC(Y(y) + 4.5) + '" text-anchor="end">' + nf(y) + '</text>'; });
  if (o.xn) s += '<text class="ftx" x="' + (L0 + PW) + '" y="' + (H - 6) + '" text-anchor="end">' + o.xn + '</text>';
  if (o.yn) s += '<text class="ftx" x="2" y="15">' + o.yn + '</text>';
  (o.curves || []).forEach(c => pcCurve(c.f, c.a == null ? o.x0 : c.a, c.b == null ? o.x1 : c.b, o.y0, o.y1, c.n || 120).forEach(seg => { s += '<polyline class="' + (c.cls || 'fcurve') + '" fill="none" points="' + seg.map(p => pcC(X(p[0])) + ',' + pcC(Y(p[1]))).join(' ') + '"/>'; }));
  if (o.extra) s += o.extra(X, Y, T0);
  return svgFig(340, H, s, o.label);
}
/* a programme de calcul as a column of boxes joined by arrows */
function pcFlow(steps, label) {
  const BH = 30, GAP = 16, cx = 170; let y = 2, s = '';
  steps.forEach((t, i) => {
    const w = Math.min(332, t.length * 7.6 + 28), x0 = pcC(cx - w / 2);
    if (i) s += pcLn([cx, y - GAP], [cx, y - 5]) + '<polygon class="fpt" points="' + cx + ',' + (y - 1) + ' ' + (cx - 4.5) + ',' + (y - 8) + ' ' + (cx + 4.5) + ',' + (y - 8) + '"/>';
    s += '<rect class="ffill" x="' + x0 + '" y="' + y + '" width="' + pcC(w) + '" height="' + BH + '" rx="6"/><rect class="fl" x="' + x0 + '" y="' + y + '" width="' + pcC(w) + '" height="' + BH + '" rx="6"/>' + pcTx([cx, y + 20], t);
    y += BH + GAP;
  });
  return svgFig(340, y - GAP + 3, s, label);
}

/* =====================================================================================================
   p2.prog-produit : programme de calcul, expression littérale, développement, équation produit nul,
                     signe d'un produit, antécédents (définition, lecture graphique et calcul)
   ===================================================================================================== */
/* (x − r1)(x − r2) = x² + s·x − c with r1 < 0 < r2 : «ajouter s (or soustraire −s), multiplier par le nombre de départ, soustraire c» */
const PC_PRG = (() => {
  const out = [];
  for (let r1 = -6; r1 <= -1; r1++) for (let r2 = 1; r2 <= 6; r2++) {
    const s = -(r1 + r2), c = -r1 * r2;
    if (!s || c % 2 || c < 4 || -c - s * s / 4 < -17 || (r1 === -5 && r2 === 1)) continue;   /* −c is read on a grid line (step 2); the curve fits the frame; not the original */
    const mid = []; for (let v = r1 + 1; v < r2; v++) if (v && v !== -s) mid.push(v);     /* give a negative result; 0 and −s are kept for the last question */
    if (mid.length) out.push({ r1, r2, s, c, mid });
  }
  return out;
})();
pcProb({ id: 'p2.prog-produit', ch: 'cl', lvl: 2, pts: 4,
  ru: 'Программа вычислений, произведение и функция', fr: 'Programme de calcul, produit et fonction',
  src: 'Sujet de référence 2027 n°2 · exercice 3',
  gen(r) {
    const d = r.pick(PC_PRG), { r1, r2, s, c } = d, as = Math.abs(s), sg = s > 0 ? '+' : '-';
    const inner = lin(1, s), prog = 'x(' + inner + ')-' + c, dev = quad(1, s, -c), fA = lin(1, -r1), fB = lin(1, -r2), fac = '(' + fA + ')(' + fB + ')';
    const brut = S('x^2', cf(-r2, 'x'), cf(-r1, 'x'), String(r1 * r2));
    const run = t => { const e1 = t + s, e2 = e1 * t; return t + sg + as + '=' + e1 + ';' + np(e1) + '*' + np(t) + '=' + e2 + ';' + e2 + '-' + c + '=' + (e2 - c); };
    const fv = v => 'f(' + v + ')=' + np(v) + '^2' + sg + (as === 1 ? '' : as + '*') + np(v) + '-' + c + '=' + (v * v + s * v - c);
    const x0 = r.pick(d.mid), wl = r1 - r.ri(1, 2), wr = r2 + r.ri(1, 2), wz = r.pick([r1, r2]), val = v => (v - r1) * (v - r2), fm = v => '$' + v + '$';
    const vy = -c - s * s / 4, Y0 = 2 * Math.floor((vy - 0.5) / 2), Y1 = 8;
    const graph = pcPlot({ x0: r1 - 2, x1: r2 + 2, y0: Y0, y1: Y1, xs: 1, xm: 1, ys: 2, ym: Y1 - Y0 > 20 ? 4 : 2, ph: 232, curves: [{ f: x => x * x + s * x - c, n: 160 }], label: 'Courbe représentative de la fonction f' });
    const fig = tbl([['Programme de calcul'], ['Choisir un nombre.'], [(s > 0 ? 'Ajouter ' : 'Soustraire ') + as + ' à ce nombre.'], ['Multiplier le résultat par le nombre choisi au départ.'], ['Soustraire ' + c + ' au produit obtenu.']]);
    const ctx = L('On considère le programme de calcul suivant.',
      'Дана программа вычислений: выбрать число; ' + (s > 0 ? 'прибавить к нему ' : 'вычесть из него ') + as + '; умножить результат на исходное число; вычесть ' + c + ' из полученного произведения.');
    const a0 = -s, ant = [0, a0].sort((p, q) => p - q);
    return { ctx, fig, qs: [
      { q: L('On appelle $x$ le nombre choisi au départ. Exprimer le résultat du programme en fonction de $x$.', 'Обозначим исходное число $x$. Вырази результат программы через $x$.'), ans: XP(dev),
        sol: [
          ['Сначала проследим программу на числе, например на 10:', run(10)],
          'Теперь то же самое с буквой $x$. После второго шага получается $' + inner + '$. Этот результат нужно умножить на исходное число $x$: получаем $x(' + inner + ')$ — скобки обязательны, потому что умножается вся ' + (s > 0 ? 'сумма' : 'разность') + '. В конце вычитаем ' + c + '.',
          ['Умножаем $x$ на каждое слагаемое в скобках:', prog + '=' + dev],
          'Обе записи верны; раскрытая понадобится в следующих вопросах.'],
        redac: ['On ' + (s > 0 ? 'ajoute ' : 'soustrait ') + as + ' au nombre $x$ : on obtient $' + inner + '$.',
          'On multiplie ce résultat par le nombre de départ : on obtient $x(' + inner + ')$.',
          'On soustrait ' + c + ' : le résultat du programme est $' + prog + '$, c\'est-à-dire $' + dev + '$.'] },
      { q: L('On veut montrer que le résultat du programme peut s\'écrire $' + fac + '$. Remettre dans l\'ordre les étapes de la démonstration.', 'Нужно показать, что результат программы можно записать в виде $' + fac + '$. Расставь шаги доказательства по порядку.'), red: true,
        ans: ORD(r, [
          L('D\'une part, le résultat du programme est $' + prog + '=' + dev + '$.', 'С одной стороны, результат программы равен $' + prog + '=' + dev + '$.'),
          L('D\'autre part, on développe : $' + fac + '=' + brut + '$.', 'С другой стороны, раскрываем скобки: $' + fac + '=' + brut + '$.'),
          L('On réduit : $' + fac + '=' + dev + '$.', 'Приводим подобные слагаемые: $' + fac + '=' + dev + '$.'),
          L('Les deux expressions sont égales, donc le résultat du programme peut s\'écrire $' + fac + '$.', 'Оба выражения равны, значит, результат программы можно записать в виде $' + fac + '$.')]),
        sol: [
          'Чтобы показать, что два выражения равны при любом $x$, оба приводят к одному и тому же виду — здесь к раскрытому.',
          '«D\'une part… D\'autre part…» («с одной стороны… с другой стороны…») — так по-французски оформляют сравнение двух выражений: сначала одно, потом другое.',
          'Произведение сначала раскрывают — каждое слагаемое первой скобки умножают на каждое слагаемое второй, — и только потом приводят подобные: $' + cf(-r2, 'x') + '$ и $' + cf(-r1, 'x') + '$ дают $' + cf(s, 'x') + '$. Вывод пишут в конце.'] },
      { q: L('Quel(s) nombre(s) doit-on choisir au départ pour obtenir 0 comme résultat ?', 'Какое число (или какие числа) нужно выбрать, чтобы в результате получился 0?'), ans: SOL(r1 + ', ' + r2),
        sol: [
          'Результат программы равен $' + fac + '$ (предыдущий вопрос), поэтому решаем уравнение $' + fac + '=0$.',
          'Произведение равно нулю тогда и только тогда, когда хотя бы один из множителей равен нулю: если оба множителя не нули, то и произведение не ноль. Получаем два простых уравнения:',
          ['', fA + '=0;x=' + r1],
          ['', fB + '=0;x=' + r2],
          ['Проверка программой для числа ' + r2 + ':', run(r2)]],
        redac: ['On cherche les nombres $x$ tels que $' + fac + '=0$.',
          'Un produit est nul si et seulement si l\'un de ses facteurs est nul.',
          '$' + fA + '=0$ ou $' + fB + '=0$, donc $x=' + r1 + '$ ou $x=' + r2 + '$.',
          'Pour obtenir 0, il faut choisir $' + r1 + '$ ou ' + r2 + ' comme nombre de départ.'] },
      { q: L('Parmi les nombres suivants, lequel peut-on choisir au départ pour que le résultat du programme soit un nombre négatif ?', 'Какое из этих чисел можно выбрать исходным, чтобы результат программы был отрицательным числом?'),
        ans: MQ(r, [x0, wl, wr, wz].map(fm), 0),
        sol: [
          'Результат программы — произведение $' + fac + '$. Произведение двух чисел отрицательно, когда множители разных знаков.',
          'Для $x=' + x0 + '$ первый множитель равен ' + nf(x0 - r1) + ', второй равен ' + nf(x0 - r2) + ': знаки разные, произведение ' + nf(val(x0)) + ' отрицательно.',
          'Для ' + nf(wl) + ' оба множителя отрицательны (' + nf(wl - r1) + ' и ' + nf(wl - r2) + '), для ' + nf(wr) + ' оба положительны (' + nf(wr - r1) + ' и ' + nf(wr - r2) + '): в обоих случаях произведение положительно. Для ' + nf(wz) + ' один из множителей равен нулю, результат 0, а ноль не является отрицательным числом.',
          'Вообще результат отрицателен для всех чисел строго между ' + nf(r1) + ' и ' + nf(r2) + '.'],
        redac: ['Le résultat du programme est le produit $' + fac + '$.',
          'Pour $x=' + x0 + '$ : $' + x0 + '+' + (-r1) + '=' + (x0 - r1) + '$ et $' + x0 + '-' + r2 + '=' + (x0 - r2) + '$.',
          'Les deux facteurs sont de signes contraires, donc leur produit est négatif : $' + np(x0 - r1) + '*' + np(x0 - r2) + '=' + val(x0) + '$.',
          'En choisissant $' + x0 + '$, on obtient un résultat négatif.'] },
      { q: L('On appelle $f$ la fonction qui, au nombre $x$ choisi au départ, associe le résultat du programme : $f(x)=' + dev + '$. Parmi les propositions suivantes, laquelle est la définition d\'un antécédent d\'un nombre $a$ par la fonction $f$ ?',
          'Пусть $f$ — функция, которая исходному числу $x$ ставит в соответствие результат программы: $f(x)=' + dev + '$. Какое из утверждений — определение прообраза («antécédent») числа $a$ при функции $f$?'), red: true,
        ans: MQ(r, [
          L('Un antécédent de $a$ par $f$ est un nombre $x$ tel que $f(x)=a$.', 'Прообраз числа $a$ при функции $f$ — это такое число $x$, что $f(x)=a$.'),
          L('Un antécédent de $a$ par $f$ est le nombre $f(a)$.', 'Прообраз числа $a$ при функции $f$ — это число $f(a)$.'),
          L('Un antécédent de $a$ par $f$ est un nombre $x$ tel que $f(x)=0$.', 'Прообраз числа $a$ при функции $f$ — это такое число $x$, что $f(x)=0$.'),
          L('Un antécédent de $a$ par $f$ est l\'ordonnée du point de la courbe d\'abscisse $a$.', 'Прообраз числа $a$ при функции $f$ — это ордината точки графика с абсциссой $a$.')], 0),
        sol: [
          '«Antécédent» числа $a$ — это то, что нужно подставить в функцию, чтобы получить $a$: такое число $x$, что $f(x)=a$. По-русски это прообраз, то есть значение аргумента.',
          '$f(a)$ и «ордината точки графика с абсциссой $a$» — это одно и то же: образ («image») числа $a$, то есть результат, а не исходное число. Образ у числа всегда один, а прообразов может быть несколько или не быть вовсе.',
          'Условие $f(x)=0$ описывает только прообразы нуля — частный случай, когда $a=0$.'] },
      { q: L('La courbe ci-dessous représente la fonction $f$. Déterminer les antécédents de $' + (-c) + '$ par la fonction $f$.', 'На рисунке — график функции $f$. Найди прообразы числа $' + (-c) + '$ при функции $f$.'), fig: graph, ans: SOL(ant.join(', ')),
        sol: [
          'Прообразы числа ' + nf(-c) + ' — это такие числа $x$, для которых $f(x)=' + (-c) + '$. На графике: ведём горизонталь на высоте ' + nf(-c) + ' и смотрим, где она встречает кривую, — в точках с абсциссами ' + nf(ant[0]) + ' и ' + nf(ant[1]) + '.',
          ['То же самое вычислением — решаем уравнение $f(x)=' + (-c) + '$:', dev + '=' + (-c) + ';' + S('x^2', cf(s, 'x')) + '=0;x(' + inner + ')=0'],
          'Произведение равно нулю, когда один из множителей равен нулю: $x=0$ или $x=' + a0 + '$. По смыслу программы: если после умножения на исходное число получился 0, то после вычитания ' + c + ' выйдет ' + nf(-c) + '.'],
        redac: ['Un antécédent de $' + (-c) + '$ par $f$ est un nombre $x$ tel que $f(x)=' + (-c) + '$.',
          'Graphiquement, les points de la courbe d\'ordonnée $' + (-c) + '$ ont pour abscisses $' + ant[0] + '$ et $' + ant[1] + '$.',
          'Vérification : $' + fv(a0) + '$ et $f(0)=' + (-c) + '$.',
          'Les antécédents de $' + (-c) + '$ par la fonction $f$ sont $' + ant[0] + '$ et $' + ant[1] + '$.'] }] };
  } });

/* =====================================================================================================
   p2.prog-carre : programme de calcul (schéma), carré d'un nombre négatif, expression littérale, a² − b²
   ===================================================================================================== */
pcProb({ id: 'p2.prog-carre', ch: 'cl', lvl: 2, pts: 3,
  ru: 'Программа вычислений и разность квадратов', fr: 'Programme de calcul et différence de deux carrés',
  src: 'Sujet zéro 2026 · exercice 2',
  gen(r) {
    /* multiply by a, square, subtract b² : (ax)² − b² = (ax − b)(ax + b); t and −t2 are the numbers tried */
    let a, b, t, t2;
    do { a = r.ri(2, 5); b = r.ri(1, 9); t = r.ri(2, 6); t2 = r.ri(1, 5); } while ((a === 2 && b === 3) || gcd(a, b) > 1 || t === t2 || a * t <= b || a * t2 === b || a * t > 20);
    const b2 = b * b, R1 = a * a * t * t - b2, R2 = a * a * t2 * t2 - b2, ax = a + 'x', sq = '(' + ax + ')^2', prog = sq + '-' + b2, dev = (a * a) + 'x^2-' + b2;
    const fM = '(' + lin(a, -b) + ')', fP = '(' + lin(a, b) + ')', fac = fM + fP;
    const run = v => { const m = a * v, q = m * m; return [np(v) + '*' + a + '=' + m, np(m) + '^2=' + q, q + '-' + b2 + '=' + (q - b2)]; };
    const eqs = v => run(v).map(e => '$' + e + '$').join(' ; ');
    const fig = pcFlow(['Choisir un nombre', 'Multiplier ce nombre par ' + a, 'Élever le résultat au carré', 'Soustraire ' + b2, 'Afficher le résultat'], 'Programme de calcul');
    const ctx = L('On donne le programme de calcul ci-dessous.', 'Дана программа вычислений: выбрать число; умножить это число на ' + a + '; возвести результат в квадрат; вычесть ' + b2 + '; вывести результат.');
    return { ctx, fig, qs: [
      { q: L('Quel nombre le programme affiche-t-il lorsque le nombre choisi est ' + t + ' ?', 'Какое число выведет программа, если выбрать число ' + t + '?'), ans: N(R1),
        sol: [
          ['Выполняем шаги по порядку; каждый следующий шаг применяется к результату предыдущего:', run(t).join(';')],
          'В квадрат возводится результат умножения (' + (a * t) + '), а не исходное число.'],
        redac: [eqs(t) + '.', 'Lorsque le nombre choisi est ' + t + ', le programme affiche ' + nf(R1) + '.'] },
      { q: L('Quel nombre le programme affiche-t-il lorsque le nombre choisi est $-' + t2 + '$ ?', 'Какое число выведет программа, если выбрать число $-' + t2 + '$?'), ans: N(R2),
        sol: [
          ['', run(-t2).join(';')],
          'Квадрат отрицательного числа положителен: $(-' + (a * t2) + ')^2=(-' + (a * t2) + ')*(-' + (a * t2) + ')=' + (a * a * t2 * t2) + '$. Скобки обязательны: запись $-' + (a * t2) + '^2$ означает другое число, $-' + (a * a * t2 * t2) + '$.'],
        redac: [eqs(-t2) + '.', 'Lorsque le nombre choisi est $-' + t2 + '$, le programme affiche ' + (R2 < 0 ? '$' + R2 + '$' : nf(R2)) + '.'] },
      { q: L('On appelle $x$ le nombre choisi au départ. Écrire, en fonction de $x$, le résultat affiché par le programme.', 'Обозначим исходное число $x$. Запиши через $x$ результат, который выводит программа.'), ans: XP(prog),
        sol: [
          'Повторяем те же шаги с буквой вместо числа. Умножаем $x$ на ' + a + ' — получаем $' + ax + '$. Возводим результат в квадрат — в квадрат возводится всё произведение, поэтому нужны скобки: $' + sq + '$. Вычитаем ' + b2 + '.',
          ['', prog],
          ['Можно упростить: квадрат произведения — это произведение квадратов, $' + sq + '=' + a + '^2*x^2$:', prog + '=' + dev],
          'Типичная ошибка — написать $' + a + 'x^2-' + b2 + '$: тогда в квадрат возведён только $x$, а программа возводит в квадрат уже умноженное на ' + a + ' число.'],
        redac: ['On multiplie $x$ par ' + a + ' : on obtient $' + ax + '$.',
          'On élève ce résultat au carré : on obtient $' + sq + '$.',
          'On soustrait ' + b2 + ' : le programme affiche $' + prog + '$, c\'est-à-dire $' + dev + '$.'] },
      { q: L('Parmi les quatre expressions suivantes, laquelle est égale au résultat du programme, quel que soit le nombre $x$ choisi ?', 'Какое из четырёх выражений равно результату программы при любом выбранном числе $x$?'),
        ans: MQ(r, ['$' + R1 + '$', '$' + fP + '^2$', '$' + fac + '$', '$' + fM + '^2$'], 2),
        sol: [
          ['Результат программы — $' + prog + '$. Раскроем скобки в произведении: каждое слагаемое первой скобки умножаем на каждое слагаемое второй:', fac + '=' + dev],
          'Слагаемые $-' + (a * b) + 'x$ и $+' + (a * b) + 'x$ взаимно уничтожаются, остаётся $' + dev + '$ — ровно результат программы.',
          'В квадратах суммы и разности удвоенное произведение не исчезает: $' + fP + '^2=' + (a * a) + 'x^2+' + (2 * a * b) + 'x+' + b2 + '$, $' + fM + '^2=' + (a * a) + 'x^2-' + (2 * a * b) + 'x+' + b2 + '$. А число ' + nf(R1) + ' получается только при $x=' + t + '$ (и при $x=-' + t + '$), а не при любом $x$.'],
        redac: ['Le résultat du programme est $' + prog + '=' + dev + '$.',
          'On développe : $' + fac + '=' + (a * a) + 'x^2+' + (a * b) + 'x-' + (a * b) + 'x-' + b2 + '$, donc $' + fac + '=' + dev + '$.',
          'L\'expression égale au résultat du programme pour tout nombre $x$ est $' + fac + '$.'] },
      { q: L('On veut retrouver ce résultat à l\'aide d\'une identité remarquable. Remettre dans l\'ordre les étapes du raisonnement.', 'Нужно получить этот результат с помощью формулы сокращённого умножения («identité remarquable»). Расставь шаги рассуждения по порядку.'), red: true,
        ans: ORD(r, [
          L('Le programme affiche $' + prog + '$.', 'Программа выводит $' + prog + '$.'),
          L('Or $' + b2 + '=' + b + '^2$ : cette expression est une différence de deux carrés, $' + sq + '-' + b + '^2$.', 'Но $' + b2 + '=' + b + '^2$: это выражение — разность двух квадратов, $' + sq + '-' + b + '^2$.'),
          L('On applique l\'identité remarquable $a^2-b^2=(a-b)(a+b)$ avec $a=' + ax + '$ et $b=' + b + '$.', 'Применяем формулу $a^2-b^2=(a-b)(a+b)$ при $a=' + ax + '$ и $b=' + b + '$.'),
          L('Donc le programme affiche $' + fac + '$.', 'Значит, программа выводит $' + fac + '$.')]),
        sol: [
          'Сначала записываем, что именно выводит программа. Затем замечаем, что вычитаемое ' + b2 + ' — это квадрат числа ' + b + ': перед нами разность двух квадратов.',
          'После этого называем формулу $a^2-b^2=(a-b)(a+b)$ и говорим, что в ней играет роль $a$ и $b$: без этого нельзя понять, как формула применена.',
          'Результат — произведение разности и суммы — записываем в конце.'] }] };
  } });

/* ===== fin p2-c ===== */
