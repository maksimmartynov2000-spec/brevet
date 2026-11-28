/* ===================== «ЯЗЫК БРЕВЕТА» · La langue du brevet =====================
   Not maths: the language of the exam. What the statement asks for, in which form the answer is expected,
   how a reasoning is written in French. The questions are asked in Russian about a French phrase (allowed in this chapter only).
   The phrase itself has no Russian twin behind «Перевод»: understanding it without a translation is the skill being trained.
   The French wording follows the sujets of the session 2026, the sujet zéro 2026 and the sujets de référence 2027. */
/* French spacing in texts that have no Russian twin (the app does it itself only for bilingual texts): « ? » and « : » never start a line, a unit stays with its number */
const LG_NB = String.fromCharCode(160);          /* the no-break space, spelled out so that no editor can lose it */
const lgT = s => String(s).replace(/ ([:;?!])/g, LG_NB + '$1').replace(/(\d) (?=(?:mm|cm|km|m|kg|g|L|h|min|€|%)[²³]?(?![\wÀ-ÿ]))/g, '$1' + LG_NB);
const lgSay = (fr, ask) => lgT('«' + fr + '» ' + ask);                              /* a French phrase of a sujet, then the question about it */
const lgMQ = (r, opts, c = 0) => mcqSh(r, opts.map(o => (typeof o === 'string' ? lgT(o) : o)), c);          /* multiple choice, shuffled; c — index of the right option */
const lgCap = s => s.charAt(0).toUpperCase() + s.slice(1);
const lgAng = s => '$$\\widehat{' + s + '}$$';
const LG_PTS = ['ABCDE', 'ABCMN', 'IJKLM', 'RSTUV', 'EFGHK', 'MNPRS', 'DEFGH'];
/* random letters, numbers and a first name for the phrases */
function lgCtx(r) {
  const [a, b, c, x, y] = r.pick(LG_PTS).split(''), girl = r() < 0.5;
  return { a, b, c, x, y, t: a + b + c, ab: a + b, ac: a + c, bc: b + c, xy: x + y, f: r.pick(['f', 'g', 'h']), n: r.ri(2, 9), m: r.ri(11, 19),
    d: nf(r.pick([2.4, 3.6, 4.8, 5.5, 6.4, 7.2, 9.6])), ang: r.pick([35, 40, 49, 55, 60, 70]), who: r.pick(girl ? PRENOMS_F : PRENOMS_M), il: girl ? 'elle' : 'il' };
}
const lgNums = c => nf(c.n + 0.25) + ' ; ' + nf(c.n + 0.3) + ' ; ' + nf(c.n + 0.07);

/* ---------- the command words ----------
   w — the command as printed, sh — its short Russian gloss, act — what the student has to do (an answer option),
   why — why the word means this (roots, cognates, traps), conf — the wrong readings offered with it, ph — phrases as in the sujets.
   Entries without w are wrong readings that are not commands (measuring on the figure, pointing at it…): no — why they are wrong. */
const LG_CMD = {
  calc: { w: 'Calculer', sh: 'вычислить: ответ — число', act: 'Вычислить: получить число и записать вычисление, которое к нему привело.', conf: ['just', 'trac', 'enon', 'nat'],
    why: '«Calculer» — одного корня с «calcul» (вычисление) и «калькулятор»: ждут число, полученное вычислением. В Partie 2 само вычисление нужно записать: один результат без него — неполный ответ.',
    ph: [c => 'Calculer la longueur ' + c.bc + '.', c => 'Calculer l’aire du triangle ' + c.t + '.', () => 'Calculer la moyenne de cette série.', c => 'Calculer l’image de ' + c.n + ' par la fonction ' + c.f + '.', () => 'Calculer le volume de ce pavé droit.'] },
  det: { w: 'Déterminer', sh: 'найти значение', act: 'Найти значение — способ выбираешь сам: вычисление, рассуждение или чтение рисунка.', conf: ['enon', 'trac', 'compl', 'conv'],
    why: '«Déterminer» — «определить» в смысле «найти, установить значение». Способ не назван: выбираешь его сам — вычисление, теорема, чтение графика, — а в Partie 2 показываешь его. Ловушка: это не «дать определение». Определение просят словами «Donner la définition» или «Énoncer».',
    ph: [c => 'Déterminer la longueur ' + c.ac + '.', () => 'Déterminer la médiane de cette série.', c => 'Déterminer l’antécédent de ' + c.n + ' par la fonction ' + c.f + '.', () => 'Déterminer l’effectif total d’élèves de ce collège.', c => 'Déterminer l’aire du quadrilatère ' + c.b + c.c + c.x + c.y + '.'] },
  just: { w: 'Justifier', sh: 'обосновать: объяснить, почему верно', act: 'Обосновать: объяснить, почему это верно, — вычислением или ссылкой на свойство.', conf: ['corr', 'mes', 'arr', 'compl'],
    why: '«Justifier» — от «juste» (верный): показать, что сказанное верно и почему. Ответ — не одно число, а рассуждение: вычисление или свойство, на которое опираешься. «Justifier la réponse» — обосновать свой ответ.',
    ph: [c => 'Justifier que les droites (' + c.bc + ') et (' + c.xy + ') sont parallèles.', c => 'Justifier que ' + c.ab + ' = ' + c.d + ' m.', c => 'Le triangle ' + c.t + ' est-il rectangle ? Justifier la réponse.', c => 'Justifier que l’angle ' + lgAng(c.t) + ' mesure ' + c.ang + '°.'] },
  mont: { w: 'Montrer que', sh: 'доказать данное утверждение', act: 'Доказать утверждение, которое уже дано в задании: записать рассуждение, которое к нему приводит.', conf: ['ptr', 'mes', 'enon', 'corr'],
    why: 'После «Montrer que» и «Démontrer que» стоит готовое утверждение: искать ответ не нужно, он уже написан. Нужно рассуждение, которое к нему приводит: данные, свойство или вычисление, вывод. «Montrer» здесь — «показать рассуждением», то есть доказать.',
    ph: [c => 'Montrer que le triangle ' + c.t + ' est rectangle en ' + c.a + '.', c => 'Montrer que ' + c.xy + ' = ' + c.n + ' cm.', c => 'Démontrer que ' + c.bc + ' = ' + c.d + ' cm.', c => 'Montrer que le résultat du programme est $' + c.n + 'x-' + c.m + '$.', c => 'Démontrer que le triangle ' + c.t + ' est un triangle rectangle.'] },
  ded: { w: 'En déduire', sh: 'вывести из предыдущего результата', act: 'Получить ответ из результата предыдущего вопроса, а не искать его заново.', conf: ['red', 'arr', 'mes', 'anew'],
    why: '«En» значит «из этого» — из того, что только что найдено или дано. «Déduire» — сделать вывод (как «дедукция»). Команда подсказывает путь: ответ получается из предыдущего результата за один-два шага.',
    ph: [c => 'En déduire la mesure de l’angle ' + lgAng(c.a + c.x + c.y) + '.', c => 'En déduire la longueur ' + c.ab + '.', () => 'En déduire les valeurs de $x$ pour lesquelles le programme donne 0.', c => 'En déduire la nature du triangle ' + c.t + '.'] },
  ver: { w: 'Vérifier que', sh: 'проверить вычислением', act: 'Выполнить вычисление с данными числами и убедиться, что выходит указанный результат.', conf: ['res', 'expr', 'corr', 'enon'],
    why: '«Vérifier» — проверить (как «верифицировать»). Результат уже назван: нужно выполнить вычисление с данными числами и убедиться, что выходит именно он. Вычисление записывают по шагам.',
    ph: [c => 'Vérifier que, si l’on choisit ' + c.n + ' comme nombre de départ, le programme donne ' + c.m + '.', () => 'Vérifier la réponse par un calcul.', c => 'Vérifier que 3 est une solution de l’équation $' + c.n + 'x-2=' + (3 * c.n - 2) + '$.'] },
  dev: { w: 'Développer et réduire', sh: 'раскрыть скобки и привести подобные', act: 'Раскрыть скобки и привести подобные слагаемые.', conf: ['fact', 'res', 'val'],
    why: '«Développer» — «развернуть»: произведение со скобками превращают в сумму. «Réduire» — сделать запись короче: сложить подобные слагаемые. Ответ — выражение без скобок, в котором больше нечего складывать.',
    ph: [c => 'Développer et réduire l’expression $' + c.n + 'x(' + (c.n + 1) + 'x-1)$.', c => 'Développer et réduire l’expression $(x+' + c.n + ')(x-' + (c.n + 1) + ')$.'] },
  fact: { w: 'Factoriser', sh: 'разложить на множители', act: 'Записать выражение в виде произведения — разложить на множители.', conf: ['dev', 'res', 'val'],
    why: '«Factoriser» — от «facteur» (множитель): сумму превращают в произведение. Это действие, обратное «développer»: там скобки раскрывают, здесь — создают.',
    ph: [(c, r) => 'Factoriser l’expression $' + r.pick([4, 9, 16]) + 'x^2-' + r.pick([25, 49, 81]) + '$.', (c, r) => 'Factoriser l’expression $' + c.n + 'x+' + c.n * r.ri(2, 5) + '$.'] },
  red: { w: 'Réduire', sh: 'привести подобные слагаемые', act: 'Упростить запись: раскрыть скобки, если они есть, и привести подобные слагаемые.', conf: ['res', 'fact', 'val', 'dim'],
    why: '«Réduire une expression» — сделать запись короче: раскрыть скобки, если они есть, и сложить подобные слагаемые. Ловушка: с ценой «réduire» значит «уменьшить» («réduction» — скидка), но значение выражения при этом не меняется — короче становится только запись.',
    ph: [c => 'Réduire l’expression $' + (c.n + 1) + 'a-1-' + c.n + '(2a+3)$.', c => 'Réduire l’expression $' + (c.n + 3) + 'x+' + c.m + '-2x+7$.'] },
  res: { w: 'Résoudre', sh: 'решить уравнение', act: 'Найти все значения неизвестного, при которых равенство верно.', conf: ['dev', 'fact', 'val', 'expr'],
    why: '«Résoudre» — решить; рядом всегда стоит «l’équation» (уравнение). Ответ — значение неизвестного, при котором равенство верно (или несколько значений), а не преобразованное выражение.',
    ph: [c => 'Résoudre l’équation $' + c.n + 'x-' + c.m + '=' + (c.n * 5 - c.m) + '$.', c => 'Résoudre l’équation $(' + c.n + 'x-2)(x+3)=0$.'] },
  trac: { w: 'Tracer', sh: 'начертить', act: 'Начертить фигуру инструментами: линейкой, угольником, циркулем.', conf: ['nat', 'compl', 'calc', 'enon'],
    why: '«Tracer» — провести линию, начертить (сравни: «трасса»). Ответ — чертёж на твоём листе, сделанный инструментами. «En vraie grandeur» — с настоящими размерами.',
    ph: [c => 'Tracer sur la copie le triangle ' + c.t + ' en vraie grandeur.', c => 'Tracer la droite parallèle à la droite (' + c.ab + ') passant par le point ' + c.c + '.', c => 'Tracer le cercle de centre ' + c.a + ' et de rayon ' + c.n + ' cm.'] },
  cons: { w: 'Construire', sh: 'построить', act: 'Построить на чертеже то, что названо в задании: фигуру, точку или график.', conf: ['nat', 'lire', 'expr', 'calc'],
    why: '«Construire» — построить (как «конструкция»): ответ — чертёж, выполненный по условиям задания: график, точка, образ фигуры. Линии построения оставляют.',
    ph: [c => 'Construire la représentation graphique de la fonction ' + c.f + '.', c => 'Construire le symétrique du point ' + c.a + ' par rapport à la droite (' + c.bc + ').', c => 'Construire l’image du triangle ' + c.t + ' par la translation qui transforme ' + c.x + ' en ' + c.y + '.'] },
  plac: { w: 'Placer', sh: 'отметить точку', act: 'Отметить точку в нужном месте чертежа и подписать её.', conf: ['lirec', 'calc', 'nat'],
    why: '«Placer» — «поместить» («place» — место): точку с данной абсциссой или данными координатами отмечают на чертеже и подписывают буквой.',
    ph: [c => 'Placer le point ' + c.a + ' d’abscisse ' + nf(c.n / 2) + ' sur la droite graduée.', c => 'Placer dans le repère le point ' + c.x + ' de coordonnées (' + c.n + ' ; −' + (c.n - 1) + ').'] },
  lire: { w: 'Lire graphiquement', sh: 'прочитать по графику', act: 'Прочитать ответ по графику — вычислять не нужно.', conf: ['calc', 'cons', 'just'],
    why: '«Lire» — читать, «graphiquement» и «par lecture graphique» — по графику: значение берут с рисунка с той точностью, которую он позволяет. Вычислять по формуле не нужно.',
    ph: [c => 'Lire graphiquement l’image de ' + c.n + ' par la fonction ' + c.f + '.', c => 'Par lecture graphique, donner les coordonnées du point ' + c.a + '.', () => 'Lire graphiquement le nombre de voyages à partir duquel le tarif B devient plus avantageux que le tarif A.'] },
  expr: { w: 'Exprimer en fonction de $x$', sh: 'записать выражение с буквой $x$', act: 'Записать буквенное выражение, в которое входит $x$.', conf: ['val', 'res', 'cons'],
    why: '«Exprimer» — выразить, «en fonction de $x$» — «в зависимости от $x$», то есть через $x$. Ответ — выражение с буквой, а не число. Слово «fonction» здесь не про функцию и не про график: это устойчивый оборот.',
    ph: [() => 'Exprimer le résultat de ce programme en fonction de $x$.', () => 'Exprimer le périmètre du rectangle ABCD en fonction de $x$.', () => 'Écrire, en fonction de $x$, le résultat obtenu par le programme.', () => 'Exprimer en fonction de $x$ le prix payé avec le tarif B.'] },
  comp: { w: 'Comparer', sh: 'сравнить: сказать, что больше', act: 'Сказать, что больше (или что они равны), и показать, из чего это видно.', conf: ['assoc', 'enc', 'compl', 'conv'],
    why: '«Comparer» — сравнить. Ответ — вывод: что больше («est supérieur à»), что меньше («est inférieur à») или что они равны, — и числа, из которых это видно.',
    ph: [() => 'Comparer le salaire moyen des hommes et celui des femmes.', c => 'Comparer les prix payés avec les deux tarifs pour ' + c.m + ' voyages.', (c, r) => { const p = r.pick([['3/4', '0,8'], ['2/5', '0,35'], ['7/10', '0,65'], ['1/4', '0,3']]); return 'Comparer les nombres $' + p[0] + '$ et ' + p[1] + '.'; }] },
  enc: { w: 'Encadrer', sh: 'заключить между двумя числами', act: 'Заключить число между двумя другими — записать двойное неравенство.', conf: ['arr', 'cadre', 'comp', 'conv'],
    why: '«Encadrer» — буквально «взять в рамку» («cadre» — рамка): число зажимают между двумя другими. Ответ — двойное неравенство, например $4<√20<5$.',
    ph: [(c, r) => 'Encadrer $√' + r.pick([20, 30, 40, 50, 70, 90]) + '$ par deux nombres entiers consécutifs.', c => 'Encadrer le nombre ' + nf(c.n + c.m / 100) + ' par deux nombres entiers consécutifs.'] },
  arr: { w: 'Arrondir', sh: 'округлить', act: 'Округлить результат до указанного разряда.', conf: ['enc', 'conv', 'exact'],
    why: '«Arrondir» — «сделать круглым» («rond» — круглый), то есть округлить. Рядом сказано, до какого разряда: «au dixième» — до десятых, «à l’unité» — до целых, «au degré» — до целых градусов.',
    ph: [() => 'Arrondir le résultat au dixième.', () => 'Arrondir le résultat à l’unité.', () => 'Donner la valeur arrondie au degré.', () => 'Arrondir le résultat au centième.'] },
  conv: { w: 'Convertir', sh: 'перевести в другие единицы', act: 'Перевести величину в другие единицы измерения.', conf: ['arr', 'comp', 'enc'],
    why: '«Convertir» — перевести из одних единиц в другие (как «конвертировать»). Сама величина не меняется — меняются единица и число при ней.',
    ph: [c => 'Convertir ' + nf(c.n + 0.5) + ' h en minutes.', c => 'Convertir ' + nf(c.n * 100 + 50) + ' cm en mètres.', c => 'Convertir ' + nf(c.n + 0.57) + ' L en cm³.'] },
  compl: { w: 'Recopier et compléter', sh: 'переписать и вписать недостающее', act: 'Переписать на свой лист и вписать то, чего не хватает.', conf: ['just', 'corr', 'comp', 'interp'],
    why: '«Recopier» — переписать («la copie» — лист, который ты сдаёшь), «compléter» — дополнить: на месте точек вписывают то, чего не хватает. Проверяют только твой лист, поэтому сначала переписывают.',
    ph: [c => 'Recopier et compléter l’égalité : ' + nf(c.n + 0.57) + ' L = …… cm³.', () => 'Recopier et compléter le tableau de proportionnalité.', c => 'Recopier sur la copie et compléter les lignes ' + c.n + ' et ' + (c.n + 2) + ' du programme.'] },
  nat: { w: 'Donner la nature', sh: 'назвать вид фигуры', act: 'Назвать вид фигуры: например, равнобедренный треугольник или ромб.', conf: ['trac', 'mes', 'comp', 'calc'],
    why: '«La nature» фигуры — её вид. Ответ — название: «triangle isocèle», «triangle rectangle», «losange», «parallélogramme»… К природе это слово здесь отношения не имеет.',
    ph: [c => 'Quelle est la nature du triangle ' + c.t + ' ?', () => 'Donner la nature du quadrilatère ABCD.', c => 'Préciser la nature du triangle ' + c.t + '.'] },
  clas: { w: 'Classer par ordre croissant', sh: 'расположить по возрастанию', act: 'Расположить числа от меньшего к большему.', conf: ['decr', 'grp', 'arr'],
    why: '«Classer» и «ranger» — расставить по порядку, «croissant» — возрастающий (от «croître» — расти): от меньшего к большему. Ответ — те же числа в новом порядке.',
    ph: [c => 'Classer par ordre croissant les nombres suivants : ' + lgNums(c) + '.', c => 'Ranger les nombres suivants dans l’ordre croissant : ' + lgNums(c) + '.'] },
  assoc: { w: 'Associer', sh: 'сопоставить: что чему соответствует', act: 'Указать, что чему соответствует: составить пары.', conf: ['comp', 'cons', 'lire', 'clas'],
    why: '«Associer» — соединить в пары (как «ассоциация»): каждой функции — её график, каждому тарифу — его формулу. Ответ — пары, например «la fonction $f$ : tarif B».',
    ph: [() => 'Associer à chaque droite la fonction qu’elle représente.', () => 'Associer chaque fonction au tarif correspondant.', () => 'Associer chaque figure au programme correspondant.'] },
  interp: { w: 'Interpréter', sh: 'объяснить, что результат означает в задаче', act: 'Объяснить словами, что найденное число означает в этой задаче.', conf: ['ver', 'arr', 'corr', 'enon'],
    why: '«Interpréter» — истолковать. Число уже найдено; теперь нужна фраза о том, что оно означает в ситуации задачи: о каких людях, предметах или величинах идёт речь.',
    ph: [() => 'Interpréter ce résultat dans le contexte de l’exercice.', () => 'Interpréter la médiane dans le contexte de l’exercice.'] },
  enon: { w: 'Énoncer', sh: 'сформулировать определение или теорему', act: 'Сформулировать определение или теорему словами.', conf: ['trac', 'calc', 'mes'],
    why: '«Énoncer» — сформулировать, «donner la définition» — дать определение. Ответ — фраза словами (определение или теорема); вычислений и чертежа не ждут.',
    ph: [c => 'Énoncer la définition de la hauteur issue de ' + c.a + ' dans le triangle ' + c.t + '.', c => 'Donner la définition d’un antécédent d’un nombre par la fonction ' + c.f + '.', () => 'Énoncer le théorème de Pythagore.'] },
  appl: { w: 'Appliquer le programme', sh: 'выполнить программу для данного числа', act: 'Выполнить шаги программы для данного числа и получить результат.', conf: ['expr', 'res', 'compl'],
    why: '«Appliquer le programme au nombre…» — применить программу к числу: выполнить её шаги по порядку, начав с этого числа. Ответ — число, которое получилось в конце.',
    ph: [c => 'Appliquer le programme A au nombre ' + c.n + '.', c => 'Appliquer ce programme de calcul au nombre −' + c.n + '.'] },
  mes: { act: 'Измерить на рисунке линейкой или транспортиром.', no: 'Измерять на рисунке нельзя: о чертежах в заданиях обычно сказано «la figure n’est pas en vraie grandeur» — размеры на них неточные.' },
  ptr: { act: 'Показать на рисунке: отметить или обвести нужное.', no: '«Montrer» в математике — не «показать на рисунке», а «показать рассуждением».' },
  corr: { act: 'Исправить ошибку: изменить утверждение так, чтобы оно стало верным.', no: 'Исправлять в задании ничего не нужно — ошибки в нём нет.' },
  val: { act: 'Вычислить значение выражения при данном значении буквы.', no: 'Подставлять нечего: значение буквы в задании не дано. Меняется только запись выражения.' },
  lirec: { act: 'Прочитать по рисунку координаты точки.', no: 'Прочитать координаты — это «lire les coordonnées». Здесь наоборот: числа даны, а точку нужно поставить.' },
  cadre: { act: 'Обвести число рамкой.', no: '«Cadre» и правда «рамка», но «рамка» для числа — это два числа, между которыми оно лежит.' },
  decr: { act: 'Расположить числа от большего к меньшему.', no: 'От большего к меньшему — это «ordre décroissant»: приставка «dé-» меняет смысл на обратный.' },
  grp: { act: 'Разбить числа на группы: целые, дробные, отрицательные.', no: '«Classer» на экзамене — не «разбить на классы», а «расставить по порядку».' },
  exact: { act: 'Оставить точное значение, без округления.', no: 'Точное значение — это «valeur exacte»; «arrondir», наоборот, заменяет его приближённым.' },
  anew: { act: 'Решить задачу заново другим способом, чтобы проверить ответ.', no: 'Решать заново не нужно: «en» как раз отсылает к уже полученному результату.' },
  dim: { act: 'Уменьшить значение выражения.', no: 'Значение выражения не уменьшают: «réduire» делает короче запись, а не число.' }
};
const LG_CMD_IDS = Object.keys(LG_CMD).filter(k => LG_CMD[k].w);
/* why the wrong options are wrong: other commands by their name, wrong readings by their own remark */
function lgNot(ids) {
  const cm = ids.filter(i => LG_CMD[i].w), out = [];
  if (cm.length) out.push('Другие варианты описывают другие команды: ' + cm.map(i => '«' + LG_CMD[i].w + '» — ' + LG_CMD[i].sh).join('; ') + '.');
  ids.filter(i => !LG_CMD[i].w).forEach(i => out.push(LG_CMD[i].no));
  return out;
}

/* ---------- what kind of answer is expected ---------- */
const LG_KIND = {
  num: { o: 'Число с единицей измерения.', conf: ['prf', 'expr', 'yn', 'name'], sign: 'число с единицей ждут после «Calculer» или «Déterminer» и названия величины («la longueur», «l’aire», «le volume», «la durée», «le prix»)' },
  prf: { o: 'Доказательство: утверждение уже дано, нужно рассуждение.', conf: ['num', 'yn', 'fig', 'def'], sign: 'доказательство ждут, когда после «Montrer que», «Démontrer que», «Justifier que» стоит готовое утверждение' },
  expr: { o: 'Буквенное выражение.', conf: ['num', 'sol', 'prf'], sign: 'выражение с буквой ждут после «Exprimer en fonction de $x$», «Développer», «Factoriser», «Réduire»' },
  fig: { o: 'Чертёж, выполненный инструментами.', conf: ['num', 'name', 'def'], sign: 'чертёж ждут после «Tracer», «Construire», «Placer»' },
  yn: { o: 'Ответ «oui» или «non» и его обоснование.', conf: ['num', 'prf', 'name', 'expr'], sign: 'ответ «oui» или «non» ждут на вопрос, где глагол стоит перед подлежащим: «est-il… ?», «peut-on… ?», «a-t-elle raison ?»' },
  sol: { o: 'Значение неизвестного — решение уравнения.', conf: ['expr', 'prf', 'ineq'], sign: 'значение неизвестного ждут после «Résoudre l’équation»' },
  name: { o: 'Название вида фигуры.', conf: ['num', 'fig', 'def'], sign: 'название вида фигуры ждут после «Quelle est la nature de… ?» и «Donner la nature de…»' },
  sent: { o: 'Фраза о том, что результат означает в задаче.', conf: ['num', 'def', 'prf'], sign: 'фразу-истолкование ждут после «Interpréter»' },
  ineq: { o: 'Двойное неравенство.', conf: ['num', 'list', 'sol'], sign: 'двойное неравенство ждут после «Encadrer»' },
  def: { o: 'Определение, записанное словами.', conf: ['fig', 'num', 'prf'], sign: 'формулировку словами ждут после «Énoncer» и «Donner la définition»' },
  list: { o: 'Те же числа, записанные по порядку.', conf: ['ineq', 'num', 'yn'], sign: 'числа, записанные по порядку, ждут после «Classer (ranger) par ordre croissant»' }
};
const LG_ASK = [
  ['num', c => 'Calculer la longueur ' + c.bc + '. Arrondir au dixième.', '«Calculer la longueur» — ждут длину: число с единицей (cm, m…), здесь ещё и округлённое до десятых.'],
  ['num', c => 'Déterminer l’aire du triangle ' + c.t + '.', '«Déterminer l’aire» — найти площадь: ответ — число с единицей площади (cm², m²).'],
  ['num', () => 'Calculer le volume de la boule, arrondi à l’unité.', '«Calculer le volume» — ждут объём: число с единицей объёма (cm³), округлённое до целых.'],
  ['num', c => 'Quel est le prix pour ' + c.m + ' demi-journées avec le tarif B ?', '«Quel est le prix… ?» — «какова цена?»: ответ — число с единицей, здесь в евро.'],
  ['num', () => 'Calculer la durée, en heures et minutes, nécessaire pour effectuer les deux vols.', '«Calculer la durée» — ждут длительность: число с единицами времени, как и сказано, — в часах и минутах.'],
  ['num', c => 'Calculer la mesure de l’angle ' + lgAng(c.t) + '. Donner la valeur arrondie au degré.', '«Calculer la mesure de l’angle» — ждут величину угла: число с единицей — градусом.'],
  ['prf', c => 'Montrer que le triangle ' + c.t + ' est rectangle en ' + c.a + '.', 'После «Montrer que» стоит готовое утверждение («треугольник прямоугольный»). Его не ищут, а доказывают: данные, равенство, вывод.'],
  ['prf', c => 'Démontrer que ' + c.bc + ' = ' + c.d + ' cm.', 'Число здесь есть, но оно уже дано: после «Démontrer que» стоит то, что нужно доказать. Ответ — рассуждение, которое приводит к этому числу.'],
  ['prf', c => 'Justifier que le périmètre du rectangle vaut ' + (c.m * 4) + '.', '«Justifier que…» — «обоснуй, что…»: результат назван в задании, от тебя ждут объяснение (вычисление), которое к нему приводит.'],
  ['prf', c => 'Montrer que le volume de la médaille, arrondi au dixième, est d’environ ' + nf(50 + c.n + c.n / 10) + ' cm³.', 'Объём с единицей здесь уже написан — значит, искать его не нужно. «Montrer que» требует показать вычисление, которое даёт именно это значение.'],
  ['prf', c => 'Justifier que les droites (' + c.bc + ') et (' + c.xy + ') sont parallèles.', '«Justifier que» и готовое утверждение («прямые параллельны»): ждут рассуждение со ссылкой на свойство или теорему.'],
  ['expr', () => 'Exprimer le résultat de ce programme en fonction de $x$.', '«En fonction de $x$» — «через $x$»: ответ — выражение с буквой $x$, а не число.'],
  ['expr', c => 'Développer et réduire l’expression $(x+' + c.n + ')(x-' + (c.n + 1) + ')$.', '«Développer et réduire» — преобразовать выражение: ответ — снова выражение, только без скобок и с приведёнными подобными.'],
  ['expr', c => 'Factoriser l’expression $' + c.n + 'x+' + c.n * 3 + '$.', '«Factoriser» — записать выражение в виде произведения: ответ — выражение со скобками.'],
  ['expr', () => 'Donner une expression littérale du programme A en fonction de $x$.', '«Une expression littérale» — буквенное выражение («littérale» — от «lettre», буква).'],
  ['fig', c => 'Tracer sur la copie le triangle ' + c.t + ' en vraie grandeur.', '«Tracer» — начертить: ответ — чертёж на твоём листе, с настоящими размерами («en vraie grandeur»).'],
  ['fig', c => 'Construire la représentation graphique de la fonction ' + c.f + '.', '«Construire la représentation graphique» — построить график: ответ — линия на чертеже, а не формула.'],
  ['fig', c => 'Placer le point ' + c.x + ' d’abscisse ' + nf(c.n / 2) + ' sur la droite graduée.', '«Placer le point» — отметить точку: ответ — точка на оси, подписанная буквой.'],
  ['yn', c => 'Le triangle ' + c.t + ' est-il rectangle ? Justifier la réponse.', 'Вопрос «est-il rectangle ?» — «прямоугольный ли он?». Заранее не сказано, да или нет: сначала отвечаешь «oui» или «non», потом обосновываешь.'],
  ['yn', c => 'Peut-on constituer ' + c.m + ' sachets ?', '«Peut-on… ?» — «можно ли…?»: ответ начинается с «oui» или «non», а в Partie 2 за ним идёт обоснование.'],
  ['yn', c => c.who + ' affirme que le volume total est supérieur à ' + (c.m * 10) + ' cm³. A-t-' + c.il + ' raison ?', '«A-t-il raison ?», «A-t-elle raison ?» — «прав ли он, права ли она?»: ответ — «oui» или «non» и вычисление, которое это показывает.'],
  ['yn', c => 'Les points ' + c.a + ', ' + c.b + ' et ' + c.x + ' sont-ils alignés ? Justifier la réponse.', '«Sont-ils alignés ?» — «лежат ли на одной прямой?»: ответ не дан, его выбираешь ты — «oui» или «non» — и обосновываешь.'],
  ['yn', c => 'Est-il vrai que plus de ' + (c.n * 10) + ' % des élèves viennent au collège à vélo ?', '«Est-il vrai que… ?» — «верно ли, что…?»: ответ — «oui» или «non» с вычислением.'],
  ['sol', c => 'Résoudre l’équation $' + c.n + 'x-' + c.m + '=' + (c.n * 5 - c.m) + '$.', '«Résoudre l’équation» — решить уравнение: ответ — значение $x$, при котором равенство верно.'],
  ['sol', c => 'Résoudre l’équation $(' + c.n + 'x-2)(x+3)=0$.', '«Résoudre l’équation» — решить уравнение: ответ — значения $x$ (здесь их два), а не раскрытые скобки.'],
  ['name', c => 'Quelle est la nature du triangle ' + c.t + ' ?', '«La nature» фигуры — её вид. Ответ — название: «triangle isocèle», «triangle rectangle», «triangle équilatéral»…'],
  ['name', () => 'Donner la nature du quadrilatère ABCD.', '«Donner la nature» — назвать вид фигуры: «un losange», «un rectangle», «un parallélogramme»…'],
  ['sent', () => 'Interpréter ce résultat dans le contexte de l’exercice.', '«Interpréter» — истолковать: число уже найдено, от тебя ждут фразу о том, что оно означает в ситуации задачи.'],
  ['ineq', (c, r) => 'Encadrer $√' + r.pick([20, 30, 40, 50, 70, 90]) + '$ par deux nombres entiers consécutifs.', '«Encadrer» — заключить между двумя числами: ответ — двойное неравенство вида $4<√20<5$.'],
  ['def', c => 'Énoncer la définition de la hauteur issue de ' + c.a + ' dans le triangle ' + c.t + '.', '«Énoncer la définition» — сформулировать определение: ответ — фраза; вычислений и чертежа не ждут.'],
  ['def', c => 'Donner la définition d’un antécédent d’un nombre par la fonction ' + c.f + '.', '«Donner la définition» — дать определение: ответ — фраза словами.'],
  ['list', c => 'Classer par ordre croissant les nombres suivants : ' + lgNums(c) + '.', '«Classer par ordre croissant» — расположить по возрастанию: ответ — те же числа, записанные от меньшего к большему.']
];

/* ---------- the small print: what is given, what need not be justified, how detailed the answer must be ---------- */
const LG_QUAL = [
  (c, r) => ({ fr: r.pick(['Donner par lecture graphique les coordonnées du point ' + c.a + ' (aucune justification n’est attendue).', 'Associer chaque fonction à l’offre correspondante. Aucune justification n’est attendue.', 'Lire graphiquement le nombre de demi-journées à partir duquel le tarif B devient plus avantageux que le tarif A. Aucune justification n’est demandée.']),
    ask: 'Что значит оговорка про «justification»?', ok: 'Достаточно ответа: объяснять, как он получен, не нужно.',
    bad: ['Ответ засчитают только вместе с обоснованием.', 'Обоснование нужно, но короткое — в одну строку.', 'Это задание не оценивается.'],
    sol: ['«Aucune» — «никакая»: «никакого обоснования не требуется». «Demandée» (требуется) и «attendue» (ожидается) здесь значат одно и то же.', 'В Partie 2 это исключение: по общему правилу там обосновывают каждый ответ, поэтому составители отдельно пишут, где этого делать не нужно.'] }),
  (c, r) => ({ fr: r.pick(['Montrer que les angles ' + lgAng(c.t) + ' et ' + lgAng(c.a + c.x + c.y) + ' sont égaux. Détailler la réponse en précisant la démarche.', 'Déterminer la médiane de cette série. Détailler la réponse en précisant la démarche.', 'Quel format doit-' + c.il + ' choisir pour payer le moins cher possible ? Argumenter la réponse en précisant la démarche.']),
    ask: 'Чего требует последняя фраза?', ok: 'Записать ход решения по шагам: на что опираешься и как приходишь к ответу.',
    bad: ['Дать ответ как можно короче, без пояснений.', 'Переписать условие своими словами.', 'Проверить ответ вторым способом.'],
    sol: ['«Détailler» — расписать подробно (как «детали»), «argumenter» — привести доводы; «la démarche» — ход решения, путь к ответу; «en précisant» — уточняя.', 'За такую запись дают баллы отдельно: в Partie 2 два балла из четырнадцати ставят за ясность рассуждения и изложения.'] }),
  c => ({ fr: 'Montrer que ' + c.xy + ' = ' + c.d + ' cm.', ask: 'Зачем в задании написано число ' + c.d + '?', ok: 'Это готовый ответ: нужно записать рассуждение, которое к нему приводит.',
    bad: ['Это данное условия: им можно пользоваться в этом же вопросе.', 'Это приблизительное значение: нужно найти точное.', 'Это число нужно проверить измерением на рисунке.'],
    sol: ['После «Montrer que» стоит то, что нужно доказать. Пользоваться этим числом в самом доказательстве нельзя — получится круг: «доказано» то, что взято готовым.', 'Зато в следующих вопросах оно уже считается известным — даже если доказать его не получилось. Не бросай задачу из-за одного вопроса.'] }),
  c => ({ fr: 'On admet que l’angle ' + lgAng(c.t) + ' mesure environ ' + c.ang + '°. En déduire la mesure de l’angle ' + lgAng(c.a + c.x + c.y) + '.', ask: 'Что значит «On admet que»?', ok: 'Это принимается без доказательства: фактом можно пользоваться как данным.',
    bad: ['Это нужно доказать, прежде чем использовать.', 'Это предположение, которое может оказаться неверным.', 'Это нужно проверить измерением на рисунке.'],
    sol: ['«Admettre» — принять, допустить: составители дают факт готовым, чтобы на него не тратилось время. Доказывать его не нужно.', '«En déduire» дальше подсказывает: ответ получается именно из этого факта.'] }),
  (c, r) => ({ fr: r.pick(['La figure n’est pas en vraie grandeur.', 'La figure ci-contre n’est pas à l’échelle.', 'La figure ci-contre n’est pas représentée en vraie grandeur.']), ask: 'Что из этого следует?', ok: 'Измерять по рисунку нельзя: длины и углы находят только вычислением.',
    bad: ['Рисунок неверный, пользоваться им нельзя совсем.', 'Рисунок нужно перечертить в натуральную величину.', 'Все длины на рисунке нужно умножить на масштаб.'],
    sol: ['«En vraie grandeur» — «в настоящую величину», «à l’échelle» — «в масштабе». Отрицание «n’est pas» говорит, что рисунок — набросок: расположение точек на нём верное, а размеры — нет.', 'Поэтому «по рисунку видно, что угол прямой» — не довод. Доводы — это данные условия и теоремы.'] }),
  c => ({ fr: 'Avec la précision permise par le graphique, déterminer la durée pendant laquelle la hauteur d’eau a été supérieure à ' + c.n + ' m.', ask: 'Что значит начало фразы?', ok: 'Ответ читают по графику — с той точностью, какую позволяет рисунок.',
    bad: ['Ответ нужно вычислить точно: графика недостаточно.', 'Ответ нужно округлить до десятых.', 'Сначала нужно построить более точный график.'],
    sol: ['«La précision permise par le graphique» — «точность, которую позволяет график». Прочитанное значение приблизительное, и это нормально: принимают любой ответ в разумных пределах.'] }),
  () => ({ fr: 'Pour les questions à choix multiple, une seule réponse est exacte.', ask: 'Что это значит?', ok: 'В каждом вопросе с вариантами верен ровно один.',
    bad: ['Верных вариантов может быть несколько.', 'Ответ нужно дать точно, без округления.', 'Ответить нужно только на один вопрос с вариантами.'],
    sol: ['«Une seule» — «одна-единственная», «exacte» здесь — «верная» (а не «точная, без округления»).', 'Если кажется, что подходят два варианта, в одном из них ошибка в единице, знаке или форме записи: сравни их внимательно.'] }),
  () => ({ fr: 'Recopier sur la copie la lettre de la bonne réponse.', ask: 'Что нужно написать?', ok: 'Только букву верного варианта: A, B, C или D.',
    bad: ['Письмо с объяснением ответа.', 'Букву и подробное решение.', 'Весь текст задания со всеми вариантами.'],
    sol: ['«La lettre» здесь — буква (у слова есть и значение «письмо», но не в математике). «La bonne réponse» — верный ответ, «recopier sur la copie» — переписать на свой лист.', 'Объяснений в первой части не требуют: «Pour cette partie, aucune justification n’est demandée».'] }),
  () => ({ fr: 'Dans cette partie, toutes les réponses doivent être justifiées, sauf si une indication contraire est donnée.', ask: 'Какое правило задаёт эта фраза (она стоит в начале Partie 2)?', ok: 'Обосновывать нужно каждый ответ — кроме тех, где прямо сказано, что не нужно.',
    bad: ['Обосновывать нужно только там, где написано «Justifier».', 'Обосновывать ответы не нужно, если нет особого указания.', 'Обосновывать нужно только те ответы, которые противоречат условию.'],
    sol: ['«Toutes les réponses doivent être justifiées» — «все ответы должны быть обоснованы». «Sauf si» — «кроме случаев, когда»; «une indication contraire» — «обратное указание», например «Aucune justification n’est demandée».', 'Поэтому в Partie 2 даже после «Calculer» или «Déterminer» записывают, на что опираешься и как считаешь.'] }),
  () => ({ fr: 'Si le travail n’est pas terminé, laisser tout de même une trace de la recherche.', ask: 'Что советует эта фраза?', ok: 'Записывать и незаконченное решение: попытки тоже оценивают.',
    bad: ['Зачеркнуть записи, если решение не доведено до конца.', 'Не начинать задачу, если не уверен, что решишь её.', 'Пометить незаконченные задачи, чтобы вернуться к ним позже.'],
    sol: ['«Laisser une trace de la recherche» — «оставить след поиска»; «tout de même» — «всё равно».', 'Дальше в инструкции сказано: попытки, «même non aboutis» (даже не доведённые до конца), «seront pris en compte dans la notation» — будут учтены при оценке. Пустое место не приносит ничего, а начатое решение может принести часть баллов.'] }),
  () => ({ fr: 'Sans justifier, associer chacune de ces fonctions au tarif qu’elle représente.', ask: 'Что значит «Sans justifier»?', ok: 'Обоснование не нужно — достаточно ответа.',
    bad: ['Сначала обоснуй, потом ответь.', 'Обоснуй особенно подробно.', 'Ответ без обоснования не засчитают.'],
    sol: ['«Sans» — «без»: «без обоснования». Противоположное — «en justifiant» («обосновывая») или отдельная фраза «Justifier la réponse».'] }),
  c => ({ fr: 'Tracer sur la copie le triangle ' + c.t + ' en vraie grandeur et en laissant les traits de construction.', ask: 'Что значит конец фразы?', ok: 'Вспомогательные линии построения — например, дуги циркуля — не стирать.',
    bad: ['Стереть все вспомогательные линии.', 'Подписать длины всех сторон.', 'Обвести треугольник цветной ручкой.'],
    sol: ['«Laisser» — оставить, «les traits de construction» — линии построения. По дугам циркуля проверяющий видит, что фигура построена, а не нарисована на глаз.'] }),
  () => ({ fr: 'Dans cet exercice, les parties A et B sont indépendantes.', ask: 'Чем это полезно знать?', ok: 'Часть B можно решать, даже если часть A не получилась.',
    bad: ['Части A и B решаются одним и тем же способом.', 'Нужно выбрать и решить только одну из частей.', 'Результаты части A понадобятся в части B.'],
    sol: ['«Indépendantes» — независимые: результаты одной части в другой не используются. Если часть A не идёт, переходи к B — она от неё не зависит.'] }),
  () => ({ fr: 'Donner une valeur de $x$ telle que le résultat du programme soit un nombre négatif.', ask: 'Сколько значений нужно указать?', ok: 'Одно — любое подходящее.',
    bad: ['Все подходящие значения.', 'Наименьшее подходящее значение.', 'Ровно два значения.'],
    sol: ['«Une valeur» — «какое-нибудь одно значение»; «telle que» — «такое, что». Подходящих значений много: достаточно привести одно и показать, что оно годится.'] }),
  c => ({ fr: 'Donner tous les nombres de départ possibles qui permettent d’obtenir ' + c.n * c.n + ' avec le programme B.', ask: 'Сколько чисел нужно указать?', ok: 'Все подходящие — ни одного не пропустить.',
    bad: ['Одно — любое подходящее.', 'Наибольшее из подходящих.', 'Все числа от 0 до ' + c.n * c.n + '.'],
    sol: ['«Tous les nombres possibles» — «все возможные числа». Если подходят два числа (например, ' + c.n + ' и −' + c.n + '), одного в ответе недостаточно.'] }),
  () => ({ fr: 'Quel(s) nombre(s) doit-on choisir au départ pour trouver 0 comme résultat ?', ask: 'Что подсказывают буквы «(s)» в скобках?', ok: 'Ответов может быть больше одного.',
    bad: ['Ответ — число больше 1.', 'Ответ нужно выбрать из списка.', 'Ответ нужно записать в скобках.'],
    sol: ['«Quel(s) nombre(s)» — «какое число (какие числа)»: буква «s» — знак множественного числа. Составители не говорят заранее, сколько решений, — проверь, нет ли второго.'] }),
  () => ({ fr: 'Présenter la démarche avec un vocabulaire mathématique adapté et des phrases claires et précises.', ask: 'Чего здесь ждут?', ok: 'Ход решения, записанный полными фразами и с математическими терминами.',
    bad: ['Только вычисления, без слов.', 'Список терминов, которые встретились в задаче.', 'Рисунок вместо объяснения.'],
    sol: ['«Présenter la démarche» — изложить ход решения; «un vocabulaire mathématique adapté» — подходящие математические слова; «des phrases claires et précises» — ясные и точные фразы.', 'В ориентирах 2027 года такие вопросы напечатаны жирным: на них отдельно оценивают язык. Пиши короткими фразами: что известно, на что опираешься, что получилось.'] }),
  () => ({ fr: 'L’usage de la calculatrice est interdit pour la partie 1 et autorisé pour la partie 2.', ask: 'Когда можно пользоваться калькулятором?', ok: 'Только во второй части.',
    bad: ['Только в первой части.', 'В обеих частях.', 'Ни в одной из частей.'],
    sol: ['«Interdit» — запрещён, «autorisé» — разрешён (как «авторизация»). Первая часть, «Automatismes», — 20 минут без калькулятора; вторая — 1 час 40 минут с калькулятором.'] }),
  () => ({ fr: 'À l’issue de la partie 1, les copies sont ramassées.', ask: 'Что это значит для тебя?', ok: 'Через 20 минут листы первой части соберут: вернуться к ней будет нельзя.',
    bad: ['Первую часть можно дописать в конце экзамена.', 'После первой части листы раздадут для проверки.', 'После первой части будет перерыв.'],
    sol: ['«À l’issue de» — «по окончании», «les copies» — листы с ответами, «ramasser» — собрать. Первая часть сдаётся отдельно, поэтому сначала отвечай на то, что знаешь, а трудное оставляй на остаток времени.'] })
];
/* ---------- command ↔ meaning, in groups of commands that are easy to mix up ---------- */
const LG_MATCH = [['dev', 'Développer', 'раскрыть скобки', 0], ['fact', 'Factoriser', 'разложить на множители', 0], ['red', 'Réduire', 'привести подобные слагаемые', 0], ['res', 'Résoudre', 'решить уравнение', 0],
  ['trac', 'Tracer', 'начертить линию или фигуру', 1], ['plac', 'Placer', 'отметить точку', 1], ['lire', 'Lire graphiquement', 'прочитать по графику', 1], ['compl', 'Recopier et compléter', 'переписать и вписать недостающее', 1],
  ['just', 'Justifier', 'обосновать: объяснить, почему верно', 2], ['ded', 'En déduire', 'вывести из предыдущего результата', 2], ['ver', 'Vérifier', 'проверить вычислением', 2], ['interp', 'Interpréter', 'объяснить, что результат означает в задаче', 2], ['enon', 'Énoncer', 'сформулировать определение или теорему', 2], ['comp', 'Comparer', 'сравнить: сказать, что больше', 2],
  ['arr', 'Arrondir', 'округлить', 3], ['enc', 'Encadrer', 'заключить между двумя числами', 3], ['conv', 'Convertir', 'перевести в другие единицы', 3], ['clas', 'Classer', 'расположить по порядку', 3], ['expr', 'Exprimer en fonction de $x$', 'записать выражение с буквой $x$', 3]];

topic({ id: 'lg.consignes', ch: 'lg', lvl: 1, calc: false, variants: 4,
  ru: 'Слова-команды: что требуется сделать', fr: 'Les consignes : comprendre ce qui est demandé',
  hints: [
    'Первое слово задания — глагол-команда. От него зависит, что писать в ответе: число, рассуждение, выражение или чертёж. Найди этот глагол и спроси себя: «что я должен сделать?»',
    'Посмотри, дан ли в задании готовый результат. После «Montrer que», «Démontrer que», «Justifier que», «Vérifier que» он уже написан: искать его не нужно, нужно показать, почему он верен. После «Calculer» и «Déterminer» результата нет — его находишь ты.',
    'Многие команды узнаются по знакомому корню: «calculer» — калькулятор, «factoriser» — фактор (множитель), «convertir» — конвертировать, «tracer» — трасса, «construire» — конструкция. Но есть ловушки: «déterminer» — найти (а не дать определение), «réduire» выражение — упростить (а не уменьшить), «la nature» фигуры — её вид.'],
  gen(r, vi) {
    const c = lgCtx(r);
    if (vi === 0) {          /* a phrase of a sujet → what has to be done */
      const cm = LG_CMD[r.pick(LG_CMD_IDS)], bad = r.sh(cm.conf).slice(0, 3);
      return { q: lgSay(r.pick(cm.ph)(c, r), 'Что от тебя требуется?'), ans: lgMQ(r, [cm.act].concat(bad.map(b => LG_CMD[b].act)), 0), sol: [cm.why].concat(lgNot(bad)) };
    }
    if (vi === 1) {          /* … → what kind of answer is expected */
      const [k, ph, why] = r.pick(LG_ASK), bad = r.sh(LG_KIND[k].conf).slice(0, 3);
      return { q: lgSay(ph(c, r), 'Какого вида ответ здесь ждут?'), ans: lgMQ(r, [LG_KIND[k].o].concat(bad.map(b => LG_KIND[b].o)), 0),
        sol: [why, 'Как узнать остальные виды ответа: ' + bad.map(b => LG_KIND[b].sign).join('; ') + '.'] };
    }
    if (vi === 2) {          /* the small print of the statement */
      const it = r.pick(LG_QUAL)(c, r);
      return { q: lgSay(it.fr, it.ask), ans: lgMQ(r, [it.ok].concat(it.bad), 0), sol: it.sol };
    }
    /* command ↔ meaning, both ways */
    const me = r.pick(LG_MATCH), others = r.sh(LG_MATCH.filter(x => x[3] === me[3] && x !== me)).slice(0, 3);
    const rest = 'Остальные команды: ' + others.map(o => '«' + o[1] + '» — ' + o[2]).join('; ') + '.';
    if (r() < 0.5) return { q: 'Что значит команда «' + me[1] + '»?', ans: lgMQ(r, [me].concat(others).map(o => lgCap(o[2]) + '.'), 0), sol: [LG_CMD[me[0]].why, rest] };
    return { q: 'Каким словом на экзамене просят вот что: ' + me[2] + '?', ans: lgMQ(r, [me].concat(others).map(o => o[1]), 0), sol: [LG_CMD[me[0]].why, rest] };
  } });

/* ===================== THE FORM OF THE ANSWER: arrondir, valeur exacte, sous forme de… ===================== */
const LG_PL = [['à l’unité', 'до целых'], ['au dixième', 'до десятых'], ['au centième', 'до сотых']];
const LG_PLB = [null, ['à la dizaine', 'до десятков'], ['à la centaine', 'до сотен'], ['au millier', 'до тысяч']];
/* [phrase, decimals kept, unit, integer part from, to, what the phrase means] */
const LG_RND = [
  ['Arrondir au dixième.', 1, '', 11, 89, '«Au dixième» — до десятых: «un dixième» — одна десятая (0,1), в ответе один знак после запятой.'],
  ['Arrondir au centième.', 2, '', 11, 89, '«Au centième» — до сотых: «un centième» — одна сотая (0,01), в ответе два знака после запятой.'],
  ['Arrondir à l’unité.', 0, '', 11, 89, '«À l’unité» — до единиц, то есть до целого числа: после запятой ничего не остаётся.'],
  ['Donner la valeur arrondie au degré.', 0, '°', 21, 79, '«Au degré» — до градуса, то есть до целого числа градусов.'],
  ['Donner la longueur en cm, arrondie au millimètre.', 1, 'cm', 2, 9, 'Ответ просят в сантиметрах, а точность — до миллиметра. 1 mm = 0,1 cm, значит, в записи в сантиметрах остаётся один знак после запятой.'],
  ['Arrondir le prix au centime.', 2, '€', 5, 60, '«Au centime» — до сантима, сотой части евро: в цене два знака после запятой.'],
  ['Donner une valeur approchée au dixième près.', 1, '', 11, 89, '«Au dixième près» — с точностью до одной десятой: один знак после запятой. «Valeur approchée» — приближённое значение.'],
  ['Donner l’arrondi au centième.', 2, 'm', 2, 30, '«L’arrondi au centième» — число, округлённое до сотых: два знака после запятой.'],
  ['Donner le volume en cm³, arrondi à l’unité.', 0, 'cm³', 40, 300, '«À l’unité» — до единиц, то есть до целого числа кубических сантиметров.'],
  ['Donner l’aire en cm², arrondie au dixième.', 1, 'cm²', 11, 89, '«Au dixième» — до десятых: один знак после запятой. Единица (cm²) названа в задании — её пишут в ответе.']];
const LG_BIG = [
  ['Arrondir à la dizaine.', '«À la dizaine» — до десятков: «une dizaine» — десяток. Не путай с «au dixième» — до десятых: слова похожи, а разряды стоят по разные стороны от запятой.'],
  ['Arrondir à la centaine.', '«À la centaine» — до сотен: «une centaine» — сотня. Не путай с «au centième» — до сотых.'],
  ['Arrondir au millier.', '«Au millier» — до тысяч: «un millier» — тысяча. Не путай с «au millième» — до тысячных.']];
const lgHalf = d => 'Следующая цифра — ' + d + (d >= 5 ? ': это половина шага или больше, поэтому берём верхнее число' : ': это меньше половины шага, поэтому ближе нижнее число');
/* a calculator display and a rounding instruction → what to write: the right rounding, its neighbour, the roundings to the two other places */
function lgRound(r) {
  if (r() < 0.25) {
    const k = r.ri(1, 3), [fr, why] = LG_BIG[k - 1], dg = [r.ri(1, 9), r.ri(1, 8), r.ri(1, 8), r.ri(1, 8)];
    const N = dg[0] + 10 * dg[1] + 100 * dg[2] + 1000 * dg[3], p = Math.pow(10, k), lo = Math.floor(N / p) * p, up = dg[k - 1] >= 5;
    const R = j => Math.round(N / Math.pow(10, j)) * Math.pow(10, j), oth = [1, 2, 3].filter(j => j !== k);
    return { q: 'Вычисление дало ' + nf(N) + '. В задании сказано: «' + fr + '» Что записать в ответе?', opts: [up ? lo + p : lo, up ? lo : lo + p].concat(oth.map(R)).map(v => nf(v)),
      sol: [why, 'Округлить — значит взять ближайшее «круглое» число. ' + nf(N) + ' лежит между ' + nf(lo) + ' и ' + nf(lo + p) + '. ' + lgHalf(dg[k - 1]) + ', ' + nf(up ? lo + p : lo) + '.',
        'Ещё два варианта — округления того же числа до других разрядов: ' + oth.map(j => nf(R(j)) + ' — ' + LG_PLB[j][1] + ' («' + LG_PLB[j][0] + '»)').join(', ') + '.'] };
  }
  const [fr, k, unit, a, b, why] = r.pick(LG_RND), dg = [r.ri(1, 8), r.ri(1, 8), r.ri(1, 9), r.ri(1, 9)];
  const N = r.ri(a, b) * 10000 + dg[0] * 1000 + dg[1] * 100 + dg[2] * 10 + dg[3];           /* the number × 10 000: no ties, no carries */
  const sh = (v, j) => nf(v / Math.pow(10, j), j) + (unit === '°' ? '°' : unit ? ' ' + unit : '');
  const R = j => Math.round(N / Math.pow(10, 4 - j)), lo = Math.floor(N / Math.pow(10, 4 - k)), up = dg[k] >= 5, oth = [0, 1, 2].filter(j => j !== k);
  const disp = nf(N / 10000, 4) + '…';
  return { q: 'На калькуляторе получилось ' + disp + ' В задании сказано: «' + fr + '» Что записать в ответе?', opts: [sh(up ? lo + 1 : lo, k), sh(up ? lo : lo + 1, k)].concat(oth.map(j => sh(R(j), j))),
    sol: [why, 'Округлить — значит взять ближайшее число с нужным количеством знаков. ' + disp + ' лежит между ' + sh(lo, k) + ' и ' + sh(lo + 1, k) + '. ' + lgHalf(dg[k]) + ', ' + sh(up ? lo + 1 : lo, k) + '.',
      'Ещё два варианта — округления того же числа до других разрядов: ' + oth.map(j => sh(R(j), j) + ' — ' + LG_PL[j][1] + ' («' + LG_PL[j][0] + '»)').join(', ') + '.'] };
}
/* fractions whose decimal expansion never ends; the third decimal is ≥ 5, so cutting the digits off differs from rounding */
const LG_FRAC = [[2, 3], [5, 9], [7, 9], [1, 6], [5, 12], [8, 9], [11, 12], [2, 7], [6, 7], [3, 7], [8, 11], [7, 11]];
/* «valeur exacte» against «arrondir»: the same result written exactly and rounded to three places */
function lgExact(r) {
  const kind = r.ri(0, 3), c = lgCtx(r); let ctx, ex, val, unit, irr;
  for (let g = 0; g < 40; g++) {
    if (kind === 0) { const R = r.ri(2, 7); ctx = 'Calculer l’aire d’un disque de rayon ' + R + ' cm.'; ex = '$' + R * R + 'π$'; val = Math.PI * R * R; unit = ' cm²'; irr = 'у числа π бесконечно много знаков после запятой'; }
    else if (kind === 1) { const R = r.ri(2, 9); ctx = 'Calculer le périmètre d’un cercle de rayon ' + R + ' cm.'; ex = '$' + 2 * R + 'π$'; val = 2 * Math.PI * R; unit = ' cm'; irr = 'у числа π бесконечно много знаков после запятой'; }
    else if (kind === 2) { const k = r.pick([13, 20, 29, 34, 41, 45, 52, 61, 74, 85]); ctx = 'Calculer la longueur ' + c.bc + '.'; ex = '$√' + k + '$'; val = Math.sqrt(k); unit = ' cm'; irr = 'у числа $√' + k + '$ бесконечно много знаков после запятой'; }
    else { const [n, d] = r.pick(LG_FRAC); ctx = 'Calculer la probabilité de tirer une boule rouge.'; ex = '$' + n + '/' + d + '$'; val = n / d; unit = ''; irr = 'дробь $' + n + '/' + d + '$ не записывается конечным числом знаков после запятой'; }
    if (Math.round(val * 100) % 10 && Math.round(val * 10) % 10) break;          /* 28,30 and 28,3 would be the same answer */
  }
  const all = { ex: ex + unit, d1: nf(Math.round(val * 10) / 10, 1) + unit, d2: nf(Math.round(val * 100) / 100, 2) + unit, u: kind === 3 ? nf(Math.floor(val * 100) / 100, 2) : nf(Math.round(val)) + unit };
  const dem = r.pick(kind === 3 ? ['ex', 'ex', 'd1', 'd2'] : ['ex', 'ex', 'ex', 'd1', 'd2', 'u']);
  const ph = { ex: ['Donner la valeur exacte.', 'On donnera la valeur exacte.'], d1: ['Arrondir au dixième.', 'Donner une valeur approchée au dixième près.'], d2: ['Arrondir au centième.', 'Donner une valeur approchée au centième près.'], u: ['Arrondir à l’unité.'] }[dem];
  const sol = dem === 'ex' ? ['«Valeur exacte» — точное значение: его не округляют. А ' + irr + ', поэтому любая десятичная запись — уже приближение. Точный ответ — ' + all.ex + '.',
    'Остальные варианты — приближённые значения («valeurs approchées»). Их дают, когда в задании стоит «arrondir» или «valeur approchée».']
    : [{ d1: '«Au dixième» — до десятых: один знак после запятой.', d2: '«Au centième» — до сотых: два знака после запятой.', u: '«À l’unité» — до целых: знаков после запятой нет.' }[dem] + ' Слова «arrondir» и «valeur approchée» говорят, что нужно десятичное число, а не точная запись: ' + all[dem] + '.',
      'Вариант ' + all.ex + ' — точное значение («valeur exacte»): его просят другими словами.',
      kind === 3 ? 'Вариант ' + all.u + ' — цифры просто отброшены. Так нельзя: смотрят на следующую цифру, и если она не меньше 5, последнюю оставленную увеличивают на 1.' : 'Остальные числа — округления до других разрядов.'];
  return { q: 'В решении получилось ' + ex + ' — на калькуляторе это ' + nf(Math.floor(val * 1e4) / 1e4, 4) + '… В задании сказано: «' + ctx + ' ' + r.pick(ph) + '» Что записать в ответе?',
    opts: [all[dem]].concat(['ex', 'd1', 'd2', 'u'].filter(k => k !== dem).map(k => all[k])), sol };
}
/* fraction irréductible · nombre décimal · pourcentage: the same number in four writings */
const LG_EQ = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [3, 20], [7, 20], [9, 20], [1, 20]];
const lgP10 = n => '10^' + (n < 0 ? '(' + n + ')' : n);
/* «sous forme…»: développée et réduite, factorisée, notation scientifique, puissance de 10, fraction / décimal / pourcentage, en fonction de x */
function lgForm(r) {
  const t = r.pick([0, 1, 2, 3, 4, 4, 5]);
  if (t === 0) {
    const [a, b] = r.sh([1, 2, 3, 4, 5, 6, 7]), e = '(x+' + a + ')(x-' + b + ')';
    return { q: '«Donner la forme développée et réduite de l’expression $' + e + '$.» Какой ответ подходит?',
      opts: ['$' + quad(1, a - b, -a * b) + '$', '$x^2-' + b + 'x+' + a + 'x-' + a * b + '$', '$x(x-' + b + ')+' + a + '(x-' + b + ')$', '$x^2-' + a * b + '$'],
      sol: ['«Forme développée» — «развёрнутый вид»: скобок нет. «Réduite» — подобные слагаемые сложены, запись короче некуда. Раскрываем скобки: $' + e + '=x^2-' + b + 'x+' + a + 'x-' + a * b + '$, затем складываем $-' + b + 'x$ и $' + a + 'x$.',
        'В варианте $x^2-' + b + 'x+' + a + 'x-' + a * b + '$ скобки раскрыты, но подобные не сложены: вид «développée», но ещё не «réduite».',
        'В варианте $x(x-' + b + ')+' + a + '(x-' + b + ')$ скобки остались — это не «forme développée». А в $x^2-' + a * b + '$ потеряны два слагаемых: каждое слагаемое первой скобки умножают на каждое слагаемое второй.'] };
  }
  if (t === 1) {
    const k = r.ri(2, 7), m = r.ri(2, 6), e = k + 'x+' + k * m;
    return { q: '«Donner la forme factorisée de l’expression $' + e + '$.» Какой ответ подходит?', opts: ['$' + k + '(x+' + m + ')$', '$' + k + '(x+' + k * m + ')$', '$' + (k + k * m) + 'x$', '$' + k + '*x+' + k + '*' + m + '$'],
      sol: ['«Forme factorisée» — вид произведения («facteur» — множитель). Оба слагаемых делятся на ' + k + ': выносим ' + k + ' за скобки, $' + e + '=' + k + '(x+' + m + ')$. Проверка: раскрой скобки — получится исходное выражение.',
        'Вариант $' + k + '(x+' + k * m + ')$ — тоже произведение, но другое: из второго слагаемого забыли вынести ' + k + '.',
        '$' + (k + k * m) + 'x$ — ошибка: $' + k + 'x$ и ' + k * m + ' не подобны, складывать их нельзя. А $' + k + '*x+' + k + '*' + m + '$ — всё ещё сумма, а не произведение.'] };
  }
  if (t === 2) {
    const m = r.ri(1, 9) * 100 + r.ri(0, 9) * 10 + r.ri(1, 9), e = r.pick([-5, -4, -3, 4, 5, 6]), num = nf(+(m * Math.pow(10, e - 2)).toPrecision(6));
    const ok = '$' + fx(m / 100) + '*' + lgP10(e) + '$';
    return { q: '«' + r.pick(['Donner la notation scientifique du nombre ' + num + '.', 'Donner l’écriture scientifique du nombre ' + num + '.']) + '» Какой ответ подходит?',
      opts: [ok, '$' + fx(m / 10) + '*' + lgP10(e - 1) + '$', '$' + m + '*' + lgP10(e - 2) + '$', '$' + fx(m / 1000) + '*' + lgP10(e + 1) + '$'],
      sol: ['«Notation scientifique» и «écriture scientifique» — стандартный вид числа: $a*10^n$, где перед запятой у $a$ ровно одна цифра, и не ноль ($1≤a<10$).',
        'Все четыре варианта равны числу ' + num + ' — проверь, сдвигая запятую. Отличается только форма: множители ' + nf(m / 10) + ', ' + m + ' и ' + nf(m / 1000) + ' не лежат между 1 и 10, а ' + nf(m / 100) + ' — лежит. Ответ: ' + ok + '.'] };
  }
  if (t === 3) {
    const n = r.ri(3, 7), num = nf(Math.pow(10, n));
    return { q: '«Écrire le nombre ' + num + ' sous la forme d’une puissance de 10.» Какой ответ подходит?', opts: ['$10^' + n + '$', '$10^' + (n + 1) + '$', '$' + n + '^10$', '$' + n + '*10$'],
      sol: ['«Une puissance de 10» — степень десяти: запись $10^n$. Показатель равен числу нулей: в числе ' + num + ' их ' + n + ', значит, это $10^' + n + '$.',
        '$10^' + (n + 1) + '$ получится, если посчитать все цифры, а не нули. В $' + n + '^10$ основание и показатель переставлены: «puissance de 10» — основание 10. А $' + n + '*10$ — произведение (' + n * 10 + '), а не степень.'] };
  }
  if (t === 4) {
    const [n, d] = r.pick(LG_EQ), k = r.pick([2, 3]), pct = 100 * n / d, dem = r.ri(0, 2);
    const all = ['$' + n + '/' + d + '$', nf(n / d), pct + ' %', '$' + pct + '/100$'];
    const fr = ['Donner le résultat sous forme de fraction irréductible.', 'Donner le résultat sous la forme d’un nombre décimal.', 'Exprimer le résultat en pourcentage.'][dem];
    return { q: 'В решении получилось $' + n * k + '/' + d * k + '$. В задании сказано: «' + fr + '» Что записать в ответе?', opts: [all[dem]].concat(all.filter((_, i) => i !== dem)),
      sol: [['«Fraction irréductible» — несократимая дробь: «réduire» — сокращать, приставка «ir-» — «не». Сокращаем $' + n * k + '/' + d * k + '$ на ' + k + ': получается $' + n + '/' + d + '$, дальше сократить нельзя.',
        '«Nombre décimal» — число в десятичной записи, с запятой: делим числитель на знаменатель, получается ' + nf(n / d) + '.',
        '«En pourcentage» — в процентах: «pour cent» — «на сто». Приводим дробь к знаменателю 100: $' + n + '/' + d + '=' + pct + '/100$, то есть ' + pct + ' %.'][dem],
      'Все четыре варианта равны одному и тому же числу — различается только форма записи. На экзамене за верное число в неверной форме балл могут не дать.',
      dem === 0 ? 'Дробь $' + pct + '/100$ не подходит: её ещё можно сократить.' : dem === 1 ? 'Дроби и запись с «%» — не «nombre décimal».' : 'Дробь $' + pct + '/100$ — это ещё не запись в процентах: нужен знак «%».'] };
  }
  const k = r.ri(3, 9), area = r() < 0.4, x0 = r.ri(4, 9), ok = area ? k + 'x' : '2x+' + 2 * k;
  return { q: '«Un rectangle a pour longueur $x$ cm et pour largeur ' + k + ' cm. Exprimer son ' + (area ? 'aire' : 'périmètre') + ' en fonction de $x$.» Какой ответ подходит?',
    opts: ['$' + ok + '$', (area ? k * x0 + ' cm²' : 2 * x0 + 2 * k + ' cm'), '$x=' + k + '$', '$' + ok + '=0$'],
    sol: ['«En fonction de $x$» — «через $x$»: ответ — выражение, в котором осталась буква $x$. ' + (area ? 'Площадь прямоугольника — длина, умноженная на ширину: $x*' + k + '=' + k + 'x$.' : 'Периметр — сумма всех сторон: $x+' + k + '+x+' + k + '=2x+' + 2 * k + '$.'),
      'Число получилось бы, если бы значение $x$ было известно, — но оно не дано, и подставлять нечего.',
      '$x=' + k + '$ и $' + ok + '=0$ — это равенства (уравнения). Просили выражение: знака «=» в ответе нет.'] };
}
const lgP2 = n => (n < 10 ? '0' : '') + n;
const LG_HM = [[0.25, 15], [0.5, 30], [0.75, 45], [0.2, 12], [0.1, 6], [0.4, 24], [0.6, 36]];
/* «en heures et minutes», «en minutes», «en heures», «en mètres»: the unit the statement asks for */
function lgUnits(r) {
  const t = r.ri(0, 3), h = r.ri(1, 4), [fr, mn] = r.pick(LG_HM);
  if (t === 0) {
    const bad = h + ' h ' + Math.round(fr * 100) + ' min';
    return { q: 'Вычисление дало ' + nf(h + fr) + ' h. В задании сказано: «' + r.pick(['Donner la durée en heures et minutes.', 'Calculer la durée du trajet, en heures et minutes.']) + '» Что записать в ответе?',
      opts: [h + ' h ' + mn + ' min', bad, nf(h + fr) + ' h', 60 * h + mn + ' min'],
      sol: ['«En heures et minutes» — в виде «… h … min». В часе 60 минут, а не 100, поэтому ' + nf(fr) + ' часа — это $' + fx(fr) + '*60=' + mn + '$ минут.',
        'Вариант «' + bad + '» — самая частая ошибка: цифры после запятой — это доля часа, а не готовые минуты.',
        nf(h + fr) + ' h — та же длительность, но не в той форме; ' + (60 * h + mn) + ' min — верное число минут, но просили часы и минуты.'] };
  }
  if (t === 1) {
    const m = r.pick([5, 10, 15, 20, 25, 35, 40, 45, 50]);
    return { q: 'Длительность — ' + h + ' h ' + m + ' min. В задании сказано: «Exprimer cette durée en minutes.» Что записать в ответе?',
      opts: [60 * h + m + ' min', 100 * h + m + ' min', h + m + ' min', h + ',' + lgP2(m) + ' h'],
      sol: ['«En minutes» — только в минутах. 1 h = 60 min, поэтому $' + h + '*60+' + m + '=' + (60 * h + m) + '$ минут.',
        'Вариант ' + (100 * h + m) + ' min — как будто в часе 100 минут. Вариант ' + (h + m) + ' min — часы сложены с минутами без перевода.',
        'Запись ' + h + ',' + lgP2(m) + ' h — не в минутах, да ещё и неверная: ' + m + ' минут — это не 0,' + lgP2(m) + ' часа.'] };
  }
  if (t === 2) {
    const naive = h + ',' + lgP2(mn) + ' h';
    return { q: 'Длительность — ' + h + ' h ' + mn + ' min. В задании сказано: «Exprimer cette durée en heures, sous la forme d’un nombre décimal.» Что записать в ответе?',
      opts: [nf(h + fr) + ' h', naive, 60 * h + mn + ' min', nf((60 * h + mn) / 100) + ' h'],
      sol: ['«En heures, sous la forme d’un nombre décimal» — одним десятичным числом часов. Минуты переводим в долю часа: $' + mn + '/60=' + fx(fr) + '$, всего ' + nf(h + fr) + ' h.',
        'Вариант ' + naive + ' — минуты просто приписаны после запятой. Но после запятой стоят десятые и сотые доли часа, а в часе 60 минут, а не 100.',
        (60 * h + mn) + ' min — верно, но в минутах; ' + nf((60 * h + mn) / 100) + ' h получится, если делить минуты на 100, а не на 60.'] };
  }
  const [u1, u2, f, word, ru] = r.pick([['cm', 'm', 100, 'mètres', 'в метрах'], ['m', 'km', 1000, 'kilomètres', 'в километрах'], ['g', 'kg', 1000, 'kilogrammes', 'в килограммах']]);
  const N = (r.ri(1, 9) * 10 + r.ri(1, 9)) * f / 10;
  return { q: 'Вычисление дало ' + nf(N) + ' ' + u1 + '. В задании сказано: «' + r.pick(['Donner la réponse en ' + word + '.', 'Exprimer le résultat en ' + word + '.']) + '» Что записать в ответе?',
    opts: [nf(N / f) + ' ' + u2, nf(N) + ' ' + u1, nf(N / f * 10) + ' ' + u2, nf(N / f / 10) + ' ' + u2],
    sol: ['«En ' + word + '» — ' + ru + ': единицу ответа выбирает задание. 1 ' + u2 + ' = ' + nf(f) + ' ' + u1 + ', поэтому делим на ' + nf(f) + ': ' + nf(N) + ' ' + u1 + ' = ' + nf(N / f) + ' ' + u2 + '.',
      'Вариант ' + nf(N) + ' ' + u1 + ' — верная величина, но не в той единице, которую просили: за такой ответ балл можно потерять.',
      'В двух других вариантах запятая сдвинута не на столько знаков: проверь по равенству 1 ' + u2 + ' = ' + nf(f) + ' ' + u1 + '.'] };
}
/* a phrase about the form of the answer → what it asks for */
const LG_FORMS = [
  ['Arrondir au dixième.', 'Округлить до десятых: один знак после запятой.', ['Округлить до десятков.', 'Округлить до сотых: два знака после запятой.', 'Разделить на десять.'], '«Un dixième» — одна десятая (0,1). Окончание «-ième» — как русское «-ая» в словах «десятая», «сотая»: это доли, знаки после запятой. Десяток — «une dizaine»: «arrondir à la dizaine» — до десятков.'],
  ['Arrondir à la dizaine.', 'Округлить до десятков.', ['Округлить до десятых: один знак после запятой.', 'Округлить до целых.', 'Округлить до сотен.'], '«Une dizaine» — десяток (как «une douzaine» — дюжина). Десятая часть — «un dixième»: «au dixième» — до десятых. Слова похожи, а разряды стоят по разные стороны от запятой.'],
  ['Arrondir au centième.', 'Округлить до сотых: два знака после запятой.', ['Округлить до сотен.', 'Округлить до десятых: один знак после запятой.', 'Округлить до целого числа сантиметров.'], '«Un centième» — одна сотая (0,01). Сотня — «une centaine»: «à la centaine» — до сотен. К сантиметрам слово отношения не имеет, хотя корень тот же: «cent» — сто.'],
  ['Arrondir à l’unité.', 'Округлить до целого числа.', ['Округлить до десятых: один знак после запятой.', 'Дописать к ответу единицу измерения.', 'Округлить до десятков.'], '«L’unité» здесь — разряд единиц: после округления «à l’unité» знаков после запятой нет. У слова есть и второе значение — «единица измерения» («l’unité de longueur»), но «arrondir à…» говорит о разряде.'],
  ['Donner la valeur exacte.', 'Дать точное значение, без округления: дробь, корень или π остаются.', ['Дать значение, округлённое до целых.', 'Дать приближённое десятичное значение.', 'Проверить значение на калькуляторе.'], '«Exacte» — точная. Точное значение не округляют: $9π$, $√20$, $2/3$ так и остаются в ответе. Противоположное — «valeur approchée», приближённое значение.'],
  ['Donner une valeur approchée au centième près.', 'Дать приближённое значение с двумя знаками после запятой.', ['Дать точное значение.', 'Дать значение, округлённое до сотен.', 'Дать значение в процентах.'], '«Valeur approchée» — приближённое значение («approcher» — приближаться), «au centième près» — с точностью до одной сотой.'],
  ['Donner le résultat sous forme de fraction irréductible.', 'Записать ответ дробью, которую больше нельзя сократить.', ['Записать ответ десятичным числом.', 'Записать ответ любой дробью — сокращать не обязательно.', 'Записать ответ дробью со знаменателем 100.'], '«Irréductible» — несократимая: «réduire» — сокращать, приставка «ir-» — «не». Ответ $6/8$ не подойдёт — нужно $3/4$.'],
  ['Donner le résultat en notation scientifique.', 'Записать число в стандартном виде: $a*10^n$, где $1≤a<10$.', ['Записать число словами.', 'Записать число со всеми нулями.', 'Округлить число до тысяч.'], '«Notation scientifique» (или «écriture scientifique») — «научная запись», в русской школе — стандартный вид числа: одна ненулевая цифра до запятой и степень десяти, например $4.58*10^(-3)$.'],
  ['Donner le résultat sous forme développée et réduite.', 'Записать выражение без скобок и с приведёнными подобными слагаемыми.', ['Записать выражение в виде произведения.', 'Записать выражение короче, оставив скобки.', 'Вычислить значение выражения.'], '«Développée» — «развёрнутая»: скобки раскрыты. «Réduite» — «сокращённая»: подобные слагаемые сложены. Вид произведения называется иначе — «forme factorisée».'],
  ['Donner le résultat sous la forme d’un nombre décimal.', 'Записать ответ в десятичной записи — с запятой, а не дробью.', ['Записать ответ обыкновенной дробью.', 'Записать ответ целым числом.', 'Записать ответ в процентах.'], '«Nombre décimal» — число в десятичной записи: 0,25, а не $1/4$ и не 25 %.'],
  ['Calculer la durée en heures et minutes.', 'Записать длительность в виде «… h … min».', ['Записать длительность десятичным числом часов.', 'Записать длительность только в минутах.', 'Записать время на часах, когда всё закончилось.'], '«En heures et minutes» — «в часах и минутах»: 2,5 h нужно превратить в 2 h 30 min. Половина часа — это 30 минут, а не 50.'],
  ['Donner la valeur arrondie au degré.', 'Округлить величину угла до целого числа градусов.', ['Округлить величину угла до десятых долей градуса.', 'Записать точное значение угла.', 'Записать ответ со значком градуса, не округляя.'], '«Au degré» — до градуса, то есть до целого числа градусов: 48,59° превращается в 49°.'],
  ['Arrondir le prix au centime.', 'Округлить цену до сотых долей евро: два знака после запятой.', ['Округлить цену до целого числа евро.', 'Округлить цену до десятых долей евро.', 'Записать цену в сантиметрах.'], '«Un centime» — сантим, сотая часть евро (а не «centimètre»). В цене остаётся два знака после запятой: 12,35 €.'],
  ['Exprimer le résultat en pourcentage.', 'Записать ответ в процентах.', ['Записать ответ десятичным числом от 0 до 1.', 'Записать ответ несократимой дробью.', 'Записать ответ с точностью до сотых.'], '«En pourcentage» — в процентах: «pour cent» — «на сто». 0,35 — это 35 сотых, то есть 35 %.'],
  ['Écrire le résultat sous la forme d’une puissance de 10.', 'Записать ответ в виде $10^n$.', ['Записать ответ в стандартном виде $a*10^n$.', 'Умножить ответ на 10.', 'Записать ответ числом, которое делится на 10.'], '«Une puissance de 10» — степень десяти: $10^4$, $10^(-2)$. Это не то же, что «notation scientifique»: там перед степенью стоит ещё множитель $a$.'],
  ['Exprimer le résultat en fonction de $x$.', 'Записать ответ выражением, в которое входит буква $x$.', ['Найти значение $x$.', 'Построить график функции.', 'Записать ответ числом, подставив $x=1$.'], '«En fonction de $x$» — «в зависимости от $x$», то есть через $x$: в ответе остаётся буква. Со словом «функция» оборот связан только происхождением: строить ничего не нужно.']];

topic({ id: 'lg.formes-reponse', ch: 'lg', lvl: 1, calc: false, variants: 5,
  ru: 'В какой форме дать ответ', fr: 'La forme de la réponse : arrondi, valeur exacte, « sous forme de… »',
  hints: [
    'В задании почти всегда сказано, в каком виде нужен ответ: «sous forme de…», «arrondir à…», «en…». Найди эти слова до того, как считать: за верное число в неверной форме балл на экзамене могут не дать.',
    'Разряды: «unité» — единицы, «dixième» — десятая (0,1), «centième» — сотая (0,01), «millième» — тысячная. Окончание «-ième» — это доли, знаки после запятой. «Dizaine», «centaine», «millier» — десяток, сотня, тысяча: разряды до запятой.',
    '«Valeur exacte» — ничего не округлять: π, корень или дробь остаются в ответе. «Valeur approchée» и «arrondir» — наоборот: десятичное число с указанным количеством знаков.'],
  gen(r, vi) {
    if (vi === 4) { const [fr, ok, bad, why] = r.pick(LG_FORMS); return { q: lgSay(fr, 'Что это значит?'), ans: lgMQ(r, [ok].concat(bad), 0), sol: [why] }; }
    const it = [lgRound, lgExact, lgForm, lgUnits][vi](r);
    return { q: lgT(it.q), ans: lgMQ(r, it.opts, 0), sol: it.sol };
  } });

/* ===================== THE SMALL WORDS OF A STATEMENT: au moins, dont, de plus que, fois plus, le double… ===================== */
const lgQue = n => (/^[AEIOUYÉÈÎH]/.test(n) ? 'qu’' : 'que ') + n;
const lgRaz = k => 'в ' + k + (k >= 2 && k <= 4 ? ' раза' : ' раз');
const lgOps = (a, b) => ['$' + a + '+' + b + '$', '$' + a + '-' + b + '$', '$' + a + '*' + b + '$', '$' + a + '÷' + b + '$'];      /* + − × ÷ : indices 0 1 2 3 */
const LG_STRICT = 'Граница входит (≥, ≤): «au moins», «au plus», «à partir de», «jusqu’à», «ou égal», «ne dépasse pas», «au maximum», «minimum». Граница не входит (>, <): «plus de», «moins de», «dépasse», «strictement».';
/* [phrase, what x stands for, relation, n from, n to, why] */
const LG_BORNE = [
  [n => 'Il faut au moins ' + n + ' points pour réussir l’épreuve.', 'число баллов, с которым экзамен сдан', '≥', 8, 20, n => '«Au moins» — «по меньшей мере, не меньше». «Moins» — «меньше», и ' + n + ' здесь наименьшее из подходящих: ' + n + ' годится, и всё, что больше, тоже.'],
  [n => 'Chaque sachet contient au plus ' + n + ' bonbons.', 'число конфет в пакете', '≤', 8, 30, n => '«Au plus» — «самое большее, не больше». «Plus» — «больше», и ' + n + ' здесь наибольшее из возможных: ' + n + ' годится, а больше — нет.'],
  [n => 'Plus de ' + n + ' élèves ont participé à la course.', 'число участников забега', '>', 20, 90, n => '«Plus de ' + n + '» — «больше ' + n + '»: само число ' + n + ' не подходит, знак строгий. Сравни: «au moins ' + n + '» — это ' + n + ' или больше.'],
  [n => 'Le trajet dure moins de ' + n + ' minutes.', 'длительность поездки в минутах', '<', 15, 55, n => '«Moins de ' + n + '» — «меньше ' + n + '»: само число ' + n + ' не подходит, знак строгий. Сравни: «au plus ' + n + '» — это ' + n + ' или меньше.'],
  [n => 'La masse de déchets ne dépasse pas ' + n + ' kg par semaine.', 'массу отходов за неделю в килограммах', '≤', 40, 80, n => '«Dépasser» — превысить; «ne dépasse pas» — «не превышает». ' + n + ' — потолок, и само это значение допускается.'],
  [n => 'La température dépasse ' + n + ' °C.', 'температуру в градусах', '>', 18, 35, n => '«Dépasser» — превысить, оказаться выше: температура строго больше ' + n + '.'],
  [n => 'Le tarif réduit s’applique à partir de ' + n + ' personnes.', 'число людей, при котором действует сниженный тариф', '≥', 5, 20, n => '«À partir de ' + n + '» — «начиная с ' + n + '»: ' + n + ' — первое из подходящих чисел, и оно само входит.'],
  [n => 'Le tarif réduit s’applique jusqu’à ' + n + ' ans.', 'возраст, при котором действует сниженный тариф', '≤', 10, 18, n => '«Jusqu’à ' + n + '» — «до ' + n + ' включительно»: ' + n + ' — последнее из подходящих чисел.'],
  [n => 'Le nombre $x$ est supérieur ou égal à ' + n + '.', '', '≥', 2, 12, n => '«Supérieur» — «больший», «ou égal» — «или равный»: $x$ больше ' + n + ' или равен ему.'],
  [n => 'Le nombre $x$ est strictement inférieur à ' + n + '.', '', '<', 2, 12, n => '«Inférieur» — «меньший», «strictement» — «строго»: равенство не допускается.'],
  [n => 'La salle peut accueillir au maximum ' + n + ' personnes.', 'число людей в зале', '≤', 30, 90, n => '«Au maximum» — «самое большее»: ' + n + ' — наибольшее возможное число, как и в обороте «au plus».'],
  [n => 'L’abonnement dure ' + n + ' mois minimum.', 'число месяцев абонемента', '≥', 6, 24, n => '«Minimum» — «самое меньшее»: ' + n + ' месяцев или дольше. То же значат «au minimum» и «au moins».'],
  [n => 'La note obtenue est inférieure ou égale à ' + n + '.', 'полученную оценку', '≤', 10, 20, n => '«Inférieure» — «меньшая», «ou égale» — «или равная»: оценка меньше ' + n + ' или равна этому числу.'],
  [n => 'Il n’y a pas plus de ' + n + ' élèves par équipe.', 'число учеников в команде', '≤', 3, 8, n => '«Pas plus de» — «не больше»: отрицание «ne… pas» переворачивает «plus de». ' + n + ' допускается, больше — нет.']];
/* le double, la moitié, le tiers, le triple, le quart: [phrase, question, n, k, index of the operation, why] */
const LG_PART = [
  r => { const n = r.ri(3, 12); return ['La longueur d’un rectangle est le double de sa largeur. Sa largeur mesure ' + n + ' cm.', 'Каким вычислением найти длину?', n, 2, 2, '«Le double» — удвоенное, в 2 раза больше: умножаем на 2. Не путай с «la moitié» — половиной.']; },
  r => { const n = 2 * r.ri(3, 12); return ['La largeur d’un rectangle est la moitié de sa longueur. Sa longueur mesure ' + n + ' cm.', 'Каким вычислением найти ширину?', n, 2, 3, '«La moitié» — половина: делим на 2. «Le double» — наоборот, в 2 раза больше.']; },
  r => { const n = 3 * r.ri(10, 40); return ['Le prix d’un casque est le tiers du prix d’un vélo. Le vélo coûte ' + n + ' €.', 'Каким вычислением найти цену шлема?', n, 3, 3, '«Le tiers» — треть (от «trois»): делим на 3. «Le triple» — наоборот, втрое больше.']; },
  r => { const n = r.ri(15, 45); return ['Le prix d’un vélo est le triple du prix d’un casque. Le casque coûte ' + n + ' €.', 'Каким вычислением найти цену велосипеда?', n, 3, 2, '«Le triple» — утроенное, в 3 раза больше: умножаем на 3. «Le tiers» — наоборот, треть.']; },
  r => { const n = 4 * r.ri(3, 15); return ['Lundi, un cycliste a parcouru le quart de la distance parcourue mardi. Mardi, il a parcouru ' + n + ' km.', 'Каким вычислением найти расстояние за понедельник?', n, 4, 3, '«Le quart» — четверть (от «quatre»): делим на 4.']; },
  r => { const n = 2 * r.ri(40, 160); return [r.pick(PRENOMS_F) + ' a lu la moitié des ' + n + ' pages de son livre.', 'Каким вычислением найти число прочитанных страниц?', n, 2, 3, '«La moitié» — половина: делим на 2. «Le double» значило бы, наоборот, вдвое больше.']; },
  r => { const n = 3 * r.ri(7, 10); return ['Un tiers des ' + n + ' élèves de la classe portent des lunettes.', 'Каким вычислением найти число учеников в очках?', n, 3, 3, '«Un tiers» — одна треть: делим на 3.']; },
  r => { const n = r.ri(12, 40); return ['Cette année, un club compte le double du nombre d’adhérents de l’an dernier. L’an dernier, ils étaient ' + n + '.', 'Каким вычислением найти число членов клуба в этом году?', n, 2, 2, '«Le double du nombre» — удвоенное число: умножаем на 2.']; }];
const LG_THINGS = [['billes', 'шариков'], ['timbres', 'марок'], ['livres', 'книг'], ['points', 'очков'], ['cartes', 'карточек']];
/* totals and shares: par, chacun, au total, dont, restant */
const LG_TOT = [
  r => { const P = r.pick([6, 8, 12, 15]), N = r.ri(4, 9); return { fr: 'L’entrée au musée coûte ' + P + ' € par personne. Un groupe compte ' + N + ' personnes.', ask: 'Каким вычислением найти, сколько заплатит вся группа?', opts: lgOps(P, N), c: 2,
    sol: ['«Par personne» — «с человека, за каждого»: цена дана за одного, а платят ' + N + ' человек — умножаем.', 'Слово «par» перед единицей («par personne», «par heure», «par kilogramme») всегда значит «за один, на каждый».'] }; },
  r => { const N = r.ri(3, 8), T = N * r.pick([6, 8, 12, 15]); return { fr: N + ' amis se partagent équitablement une facture de ' + T + ' €. Combien paie chacun ?', ask: 'Какое вычисление отвечает на вопрос?', opts: lgOps(T, N), c: 3,
    sol: ['«Chacun» — «каждый», «se partagent équitablement» — «делят поровну»: общую сумму делим на число друзей.', 'Умножение подошло бы, если бы было сказано наоборот: «chacun paie…», а спрашивали бы общую сумму.'] }; },
  r => { const K = r.pick([8, 12, 15, 20, 25]), N = r.ri(3, 9); return { fr: 'Chaque sachet contient ' + K + ' bonbons. Combien de bonbons y a-t-il au total dans ' + N + ' sachets ?', ask: 'Какое вычисление отвечает на вопрос?', opts: lgOps(K, N), c: 2,
    sol: ['«Chaque sachet» — «каждый пакет», «au total» — «всего»: по ' + K + ' конфет в каждом из ' + N + ' пакетов — умножаем.'] }; },
  r => { const N = r.ri(22, 30), K = r.ri(9, 15); return { fr: 'Une classe compte ' + N + ' élèves, dont ' + K + ' filles. Combien y a-t-il de garçons ?', ask: 'Какое вычисление отвечает на вопрос?', opts: lgOps(N, K), c: 1,
    sol: ['«Dont» — «из них, в том числе»: ' + K + ' девочек уже входят в ' + N + ' учеников. Мальчики — это остальные, поэтому вычитаем.', 'Сложение было бы верным, если бы стояло «et»: «' + N + ' garçons et ' + K + ' filles». «Dont» всегда говорит о части уже названного целого.'] }; },
  r => { const N = r.ri(12, 25), K = r.ri(9, 20); return { fr: 'Un club compte ' + N + ' garçons et ' + K + ' filles. Combien de membres compte-t-il au total ?', ask: 'Какое вычисление отвечает на вопрос?', opts: lgOps(N, K), c: 0,
    sol: ['«Et» — «и»: мальчики и девочки — две разные группы; «au total» — «всего»: складываем.', 'Сравни с «dont»: «' + N + ' membres, dont ' + K + ' filles» значило бы, что девочки уже входят в ' + N + '.'] }; },
  r => { const T = r.pick([20, 30, 50, 80]), D = r.ri(6, 18); return { fr: r.pick(PRENOMS_F) + ' a ' + T + ' €. Elle dépense ' + D + ' €. Quelle est la somme restante ?', ask: 'Какое вычисление отвечает на вопрос?', opts: lgOps(T, D), c: 1,
    sol: ['«Restante» — «оставшаяся» (от «rester» — оставаться), «dépenser» — тратить: из того, что было, вычитаем потраченное.'] }; },
  r => { const N = r.ri(21, 30), P = r.pick([4, 5, 6, 8]); return { fr: 'Les ' + N + ' élèves d’une classe paient chacun ' + P + ' € pour une sortie. Quelle somme est récoltée au total ?', ask: 'Какое вычисление отвечает на вопрос?', opts: lgOps(N, P), c: 2,
    sol: ['«Chacun» — «каждый»: каждый из ' + N + ' учеников платит по ' + P + ' евро. «Au total» — всего: умножаем.', 'Сравни: «' + N + ' amis paient 120 € au total. Combien paie chacun ?» — там общая сумма уже дана, и её делят.'] }; },
  r => { const N = r.ri(3, 8), T = N * r.pick([2, 3, 4]); return { fr: N + ' kg de pommes coûtent ' + T + ' €. Quel est le prix d’un kilogramme ?', ask: 'Какое вычисление отвечает на вопрос?', opts: ['$' + T + '÷' + N + '$', '$' + N + '÷' + T + '$', '$' + T + '*' + N + '$', '$' + T + '-' + N + '$'], c: 0,
    sol: ['«Le prix d’un kilogramme» — цена одного килограмма: стоимость делим на число килограммов.', 'Порядок важен: $' + N + '÷' + T + '$ — это сколько килограммов приходится на один евро, а не цена.'] }; },
  r => { const K = r.pick([12, 15, 25, 40]), N = r.ri(3, 8); return { fr: 'Une machine fabrique ' + K + ' pièces par heure. Combien de pièces fabrique-t-elle en ' + N + ' heures ?', ask: 'Какое вычисление отвечает на вопрос?', opts: lgOps(K, N), c: 2,
    sol: ['«Par heure» — «в час, за каждый час»: за ' + N + ' ч деталей ' + lgRaz(N) + ' больше — умножаем.'] }; },
  r => { const N = 4 * r.ri(5, 20); return { fr: r.pick(PRENOMS_F) + ' a ' + N + ' €. Elle en dépense le quart. Quelle somme lui reste-t-il ?', ask: 'Какое вычисление отвечает на вопрос?', opts: ['$' + N + '-' + N + '÷4$', '$' + N + '÷4$', '$' + N + '-4$', '$' + N + '*4$'], c: 0,
    sol: ['«Le quart» — четверть: потрачено $' + N + '÷4$. Но спрашивают «Quelle somme lui reste-t-il ?» — «сколько у неё осталось?»: из ' + N + ' вычитаем потраченное.', '$' + N + '÷4$ — это потраченное, а не остаток: вопрос нужно дочитать до конца. Слово «en» во фразе «elle en dépense le quart» значит «из них» — из этих ' + N + ' евро.'] }; },
  r => { const K = r.ri(3, 6), N = K * r.ri(4, 8); return { fr: 'On répartit ' + N + ' élèves en équipes de ' + K + '. Combien d’équipes obtient-on ?', ask: 'Какое вычисление отвечает на вопрос?', opts: lgOps(N, K), c: 3,
    sol: ['«Répartir en équipes de ' + K + '» — «распределить по командам по ' + K + ' человек»: узнаём, сколько раз ' + K + ' помещается в ' + N + ', — делим.'] }; }];
/* changes: baisse de 10 %, réduction de 10 €, passe de… à…, multiplié par, les deux tiers de */
const LG_CHG = [
  r => { const P = r.pick([40, 60, 80, 120, 200]), p = r.pick([10, 20, 25, 30]); return { fr: 'Un article coûte ' + P + ' €. Son prix baisse de ' + p + ' %.', ask: 'Каким вычислением найти новую цену?', opts: ['$' + P + '-' + p + '/100*' + P + '$', '$' + P + '-' + p + '$', '$' + P + '-' + p + '/100$', '$' + p + '/100*' + P + '$'],
    sol: ['«Baisse de ' + p + ' %» — «снижается на ' + p + ' %». Процент всегда берут от чего-то — здесь от старой цены: снижение равно $' + p + '/100*' + P + '$. Новая цена — старая минус снижение.', '$' + P + '-' + p + '$ — вычтено ' + p + ' евро, а не ' + p + ' %. $' + P + '-' + p + '/100$ — вычтена дробь, то есть несколько сотых евро. $' + p + '/100*' + P + '$ — само снижение, а не новая цена.'] }; },
  r => { const P = r.pick([40, 60, 80, 120, 200]), p = r.pick([10, 20, 25, 30]); return { fr: 'Un abonnement coûte ' + P + ' € par an. Son prix augmente de ' + p + ' %.', ask: 'Каким вычислением найти новую цену?', opts: ['$' + P + '+' + p + '/100*' + P + '$', '$' + P + '+' + p + '$', '$' + P + '+' + p + '/100$', '$' + p + '/100*' + P + '$'],
    sol: ['«Augmente de ' + p + ' %» — «растёт на ' + p + ' %». Процент берут от старой цены: прибавка равна $' + p + '/100*' + P + '$. Новая цена — старая плюс прибавка.', '$' + P + '+' + p + '$ — прибавлено ' + p + ' евро, а не ' + p + ' %. $' + P + '+' + p + '/100$ — прибавлена дробь, несколько сотых евро. $' + p + '/100*' + P + '$ — сама прибавка, а не новая цена.'] }; },
  r => { const P = r.pick([40, 60, 80, 120, 200]), K = r.pick([5, 10, 15, 20]); return { fr: 'Un article coûte ' + P + ' €. Le vendeur accorde une réduction de ' + K + ' €.', ask: 'Каким вычислением найти новую цену?', opts: ['$' + P + '-' + K + '$', '$' + P + '-' + K + '/100*' + P + '$', '$' + P + '+' + K + '$', '$' + P + '÷' + K + '$'],
    sol: ['«Une réduction de ' + K + ' €» — скидка ' + K + ' евро: после «de» стоит сумма в евро, поэтому её просто вычитают.', 'Вычисление $' + P + '-' + K + '/100*' + P + '$ было бы верным для «une réduction de ' + K + ' %». Смотри на знак после числа: «€» или «%».'] }; },
  r => { const P = r.pick([40, 60, 80, 120, 200]), K = r.pick([5, 10, 15, 20]); return { fr: 'Le prix d’un billet, qui était de ' + P + ' €, augmente de ' + K + ' €.', ask: 'Каким вычислением найти новую цену?', opts: ['$' + P + '+' + K + '$', '$' + P + '+' + K + '/100*' + P + '$', '$' + P + '*' + K + '$', '$' + P + '-' + K + '$'],
    sol: ['«Augmente de ' + K + ' €» — «вырастает на ' + K + ' евро»: после «de» стоит сумма в евро, её прибавляют.', 'Вычисление $' + P + '+' + K + '/100*' + P + '$ было бы верным для «augmente de ' + K + ' %». А «qui était de ' + P + ' €» — «который стоил ' + P + ' евро»: это старая цена.'] }; },
  r => { const N = r.pick([200, 300, 400, 500, 600]), p = r.pick([10, 20, 25, 30]); return { fr: p + ' % des ' + N + ' élèves d’un collège viennent à vélo.', ask: 'Каким вычислением найти число этих учеников?', opts: ['$' + p + '/100*' + N + '$', '$' + N + '-' + p + '$', '$' + N + '÷' + p + '$', '$' + N + '-' + p + '/100*' + N + '$'],
    sol: ['«' + p + ' % des ' + N + ' élèves» — «' + p + ' % от ' + N + ' учеников»: предлог «de» («des») после процента значит «от» — умножаем дробь $' + p + '/100$ на ' + N + '.', '$' + N + '-' + p + '/100*' + N + '$ — это, наоборот, те, кто приезжает не на велосипеде.'] }; },
  r => { const A = r.pick([20, 30, 40, 50]), B = A + r.pick([4, 5, 8, 10]); return { fr: 'Le prix d’un billet passe de ' + A + ' € à ' + B + ' €.', ask: 'Каким вычислением найти, на сколько евро выросла цена?', opts: ['$' + B + '-' + A + '$', '$' + B + '÷' + A + '$', '$' + B + '+' + A + '$', '$' + B + '*' + A + '$'],
    sol: ['«Passe de ' + A + ' € à ' + B + ' €» — «переходит от ' + A + ' к ' + B + '»: после «de» — сколько было, после «à» — сколько стало. «На сколько выросла» — разность нового и старого.', '$' + B + '÷' + A + '$ ответило бы на другой вопрос — «во сколько раз» («par combien le prix a-t-il été multiplié ?»).'] }; },
  r => { const N = r.pick([120, 250, 400, 600]), K = r.ri(2, 4); return { fr: 'En dix ans, le nombre d’habitants d’un village, qui était de ' + N + ', a été multiplié par ' + K + '.', ask: 'Каким вычислением найти число жителей сейчас?', opts: lgOps(N, K), c: 2,
    sol: ['«A été multiplié par ' + K + '» — «было умножено на ' + K + '», то есть выросло в ' + K + ' раза. После «multiplier» и «diviser» предлог «par» значит «на».', 'Сложение подошло бы для «a augmenté de ' + K + '» — «выросло на ' + K + '».'] }; },
  r => { const K = r.ri(2, 4), P = K * r.pick([15, 20, 30]); return { fr: 'Pendant les soldes, le prix d’un manteau, qui était de ' + P + ' €, est divisé par ' + K + '.', ask: 'Каким вычислением найти новую цену?', opts: lgOps(P, K), c: 3,
    sol: ['«Est divisé par ' + K + '» — «разделён на ' + K + '», то есть стал в ' + K + ' раза меньше. После «diviser» предлог «par» значит «на».', 'Вычитание подошло бы для «baisse de ' + K + ' €» — «снижается на ' + K + ' евро».'] }; },
  r => { const P = 2 * r.pick([15, 20, 25, 30, 40]); return { fr: 'Le prix d’un jeu, qui était de ' + P + ' €, diminue de moitié.', ask: 'Каким вычислением найти новую цену?', opts: ['$' + P + '÷2$', '$' + P + '-2$', '$' + P + '*2$', '$' + P + '-0.5$'],
    sol: ['«Diminuer de moitié» — «уменьшиться наполовину»: остаётся половина старой цены, делим на 2.', '$' + P + '-0.5$ и $' + P + '-2$ — вычтены 0,5 евро и 2 евро, а «moitié» — это половина самой цены. $' + P + '*2$ — это «le double».'] }; },
  r => { const N = 3 * r.ri(7, 10); return { fr: 'Les deux tiers des ' + N + ' élèves d’une classe font du sport.', ask: 'Каким вычислением найти число этих учеников?', opts: ['$2/3*' + N + '$', '$' + N + '÷3$', '$' + N + '-2/3$', '$3/2*' + N + '$'],
    sol: ['«Les deux tiers de…» — «две трети от…»: «un tiers» — треть, их две; предлог «de» («des») значит «от» — умножаем $2/3$ на ' + N + '.', '$' + N + '÷3$ — это одна треть, а не две. $3/2*' + N + '$ больше самого класса — так быть не может.'] }; },
  r => { const P = r.pick([40, 60, 80, 120, 200]), p = r.pick([10, 20, 25, 30]); return { fr: 'Un article coûte ' + P + ' €. Son prix baisse de ' + p + ' %. De combien d’euros le prix baisse-t-il ?', ask: 'Какое вычисление отвечает на вопрос?', opts: ['$' + p + '/100*' + P + '$', '$' + P + '-' + p + '/100*' + P + '$', '$' + P + '-' + p + '$', '$' + p + '/100$'],
    sol: ['«De combien d’euros… baisse-t-il ?» — «на сколько евро снижается?»: спрашивают само снижение, а не новую цену. Это ' + p + ' % от ' + P + ': $' + p + '/100*' + P + '$.', '$' + P + '-' + p + '/100*' + P + '$ — новая цена: её спросили бы словами «Quel est le nouveau prix ?».'] }; }];

topic({ id: 'lg.donnees', ch: 'lg', lvl: 1, calc: false, variants: 4,
  ru: 'Слова, от которых зависит действие', fr: 'Les petits mots de l’énoncé : au moins, dont, de plus que…',
  hints: [
    'В условии есть «маленькие слова», от которых зависит действие: «de plus que», «fois», «dont», «chacun», «au moins»… Сначала найди их и пойми, что они значат, — и только потом берись за числа.',
    'Есть слово «fois» — речь про «в … раз»: умножить или разделить. Нет «fois», но есть «de plus», «de moins» — речь про «на …»: прибавить или вычесть. «Le double», «le triple» — умножить на 2, на 3; «la moitié», «le tiers», «le quart» — разделить на 2, на 3, на 4.',
    'Границы: «au moins» — не меньше (≥), «au plus» — не больше (≤), оба включают само число. «Plus de», «moins de» — строго больше и строго меньше. «Dont» — «из них»: эта часть уже входит в общее число, её не прибавляют.'],
  gen(r, vi) {
    if (vi === 0) {          /* bounds: au moins, au plus, plus de, à partir de, jusqu’à, compris entre, environ */
      const u = r();
      if (u < 0.1) {
        const a = r.ri(2, 9) * 10, b = a + r.pick([2, 5, 10, 20]);
        return { q: lgSay('La masse d’un colis est comprise entre ' + a + ' kg et ' + b + ' kg.', 'Обозначим через $x$ массу посылки в килограммах. Какое условие на $x$ записано в этой фразе?'),
          ans: lgMQ(r, ['$' + a + '≤x≤' + b + '$', '$x≥' + b + '$', '$x≤' + a + '$', '$x=' + b + '-' + a + '$'], 0),
          sol: ['«Compris entre ' + a + ' et ' + b + '» — «заключён между ' + a + ' и ' + b + '»: $x$ не меньше ' + a + ' и не больше ' + b + '. Это двойное неравенство.', '$x=' + b + '-' + a + '$ — разность границ: так находят ширину промежутка, а не само число. $x≥' + b + '$ и $x≤' + a + '$ — числа по другую сторону от границ.'] };
      }
      if (u < 0.18) {
        const n = r.pick([20, 25, 35, 40, 45, 50]);
        return { q: lgSay('Le trajet dure environ ' + n + ' minutes.', 'Что из этой фразы известно о длительности поездки?'),
          ans: lgMQ(r, ['Она близка к ' + n + ' минутам, но может немного отличаться.', 'Она равна ровно ' + n + ' минутам.', 'Она не меньше ' + n + ' минут.', 'Она не больше ' + n + ' минут.'], 0),
          sol: ['«Environ» — «приблизительно, около»: число округлено, настоящее значение может быть чуть больше или чуть меньше.', 'Ответ, полученный из такого числа, тоже приближённый: его записывают со словом «environ» или со знаком ≈.'] };
      }
      const [fr, x, rel, lo, hi, why] = r.pick(LG_BORNE), n = r.ri(lo, hi), rels = ['≥', '≤', '>', '<'];
      return { q: lgSay(fr(n), (x ? 'Обозначим через $x$ ' + x + '. ' : '') + 'Какое условие на $x$ записано в этой фразе?'), ans: lgMQ(r, rels.map(s => '$x' + s + n + '$'), rels.indexOf(rel)), sol: [why(n), LG_STRICT] };
    }
    if (vi === 1) {          /* de plus que, de moins que, fois plus, fois moins; le double, la moitié, le tiers… */
      if (r() < 0.45) {
        const [fr, ask, n, k, c, why] = r.pick(LG_PART)(r);
        return { q: lgSay(fr, ask), ans: lgMQ(r, lgOps(n, k), c), sol: [why, 'Слова-пары: «le double» (×2) — «la moitié» (÷2); «le triple» (×3) — «le tiers» (÷3); «le quart» — четверть (÷4). Прибавлять или вычитать 2, 3 или 4 здесь не нужно: эти слова всегда говорят «во сколько раз».'] };
      }
      const A = r.pick(PRENOMS_F), B = r.pick(PRENOMS_M), k = r.ri(2, 5), n = k * r.ri(3, 9), [th, thRu] = r.pick(LG_THINGS), t = r.ri(0, 3);
      const fr = A + ' a ' + n + ' ' + th + '. ' + B + ' a ' + [k + ' ' + th + ' de plus ', k + ' ' + th + ' de moins ', k + ' fois plus de ' + th + ' ', k + ' fois moins de ' + th + ' '][t] + lgQue(A) + '.';
      const why = ['«' + k + ' ' + th + ' de plus que…» — «на ' + k + ' больше, чем…»: «de plus» после количества — это прибавка, складываем.',
        '«' + k + ' ' + th + ' de moins que…» — «на ' + k + ' меньше, чем…»: «de moins» после количества — вычитаем.',
        '«' + k + ' fois plus de… que…» — «' + lgRaz(k) + ' больше, чем…»: «fois» — «раз», значит, умножаем.',
        '«' + k + ' fois moins de… que…» — «' + lgRaz(k) + ' меньше, чем…»: «fois» — «раз», значит, делим.'][t];
      return { q: lgSay(fr, 'Каким вычислением найти, сколько ' + thRu + ' у ' + B + '?'), ans: lgMQ(r, lgOps(n, k), [0, 1, 2, 3][t]),
        sol: [why, 'Главное слово — «fois». Есть «fois» — «в … раз»: умножаем или делим. Нет «fois» — «на …»: прибавляем или вычитаем. А «plus» и «moins» показывают, в какую сторону.'] };
    }
    const it = r.pick(vi === 2 ? LG_TOT : LG_CHG)(r);
    return { q: lgSay(it.fr, it.ask), ans: lgMQ(r, it.opts, it.c || 0), sol: it.sol };
  } });

/* ===================== THE CONNECTORS OF A REASONING: donc, car, or, comme, d’après… ===================== */
const lgFrac = (a, b) => '\\dfrac{' + a + '}{' + b + '}';
const lgOrdQ = (aim, fr, ru) => L(aim.fr + ' Remettre dans l’ordre les étapes ' + fr + '.', aim.ru + ' Расставь шаги ' + ru + ' по порядку.');
/* a reasoning with a gap → the connector that fits (the wrong ones never fit: no option is «also possible») */
const LG_CLOZE = [
  c => ({ fr: 'Le triangle ' + c.t + ' est rectangle en ' + c.a + ', …… d’après le théorème de Pythagore, $' + c.bc + '^2=' + c.ab + '^2+' + c.ac + '^2$.', ok: 'donc', bad: ['car', 'comme', 'si'],
    sol: ['Сначала причина (треугольник прямоугольный), потом то, что из неё следует (равенство Пифагора). Вывод вводит «donc» — «значит, следовательно».', '«Car» вводит причину, а не вывод. «Comme» ставят в начале фразы, перед причиной. «Si» — «если»: вводит условие, а здесь факт уже известен.'] }),
  c => ({ fr: 'Les droites (' + c.ab + ') et (' + c.xy + ') sont parallèles …… elles sont toutes les deux perpendiculaires à la droite (d).', ok: 'car', bad: ['donc', 'alors', 'd’après'],
    sol: ['После пропуска стоит причина: почему прямые параллельны. Причину после утверждения вводит «car» — «так как, потому что».', '«Donc» и «alors» вводят вывод, а не причину: с ними получилось бы, что перпендикулярность следует из параллельности. «D’après» — «согласно»: после него называют теорему, а не целое предложение.'] }),
  c => ({ fr: '…… le triangle ' + c.t + ' est rectangle en ' + c.a + ', on peut utiliser le théorème de Pythagore.', ok: 'Comme', bad: ['Donc', 'Car', 'Or'],
    sol: ['Фраза начинается с причины (треугольник прямоугольный), а вывод идёт после запятой. Причину в начале фразы вводит «Comme» — «так как».', '«Car» тоже значит «так как», но стоит только в середине, после вывода: «On peut utiliser le théorème de Pythagore, car le triangle est rectangle». «Donc» вводит вывод, «Or» — ещё один известный факт.'] }),
  c => ({ fr: 'On sait que ' + c.ab + ' = ' + c.ac + '. ……, un triangle qui a deux côtés de même longueur est isocèle. Donc le triangle ' + c.t + ' est isocèle en ' + c.a + '.', ok: 'Or', bad: ['Donc', 'Car', 'Ou'],
    sol: ['Рассуждение из трёх шагов: что известно («On sait que…»), общее свойство, вывод («Donc…»). Второй шаг — свойство, которое вместе с первым даёт вывод, — вводит «Or».', '«Or» — не «или»: «или» по-французски «ou». Точного русского слова для «or» нет; ближе всего «а (известно, что)…».'] }),
  (c, r) => ({ fr: r.pick(['…… le théorème de Thalès, on a : $$' + lgFrac(c.ab, c.a + c.x) + '=' + lgFrac(c.ac, c.a + c.y) + '$$.', '…… le théorème de Pythagore, on a : $' + c.bc + '^2=' + c.ab + '^2+' + c.ac + '^2$.', '…… la réciproque du théorème de Pythagore, le triangle ' + c.t + ' est rectangle en ' + c.a + '.']), ok: 'D’après', bad: ['Après', 'Pour', 'Sur'],
    sol: ['«D’après» — «согласно, по»: так ссылаются на теорему или свойство — «d’après le théorème de Thalès», «d’après la propriété…».', 'Русское «по теореме» дословно не переводится: «après» без «d’» значит «после», «pour» — «для», «sur» — «на».'] }),
  (c, r) => { const n = r.ri(5, 12); return { fr: 'On a calculé : $' + c.bc + '^2=' + n * n + '$. …… $' + c.bc + '=' + n + '$ cm.', ok: 'Donc', bad: ['Car', 'Or', 'Comme'],
    sol: ['Сначала найден квадрат длины, потом из него получена сама длина. Вывод вводит «Donc».', '«Car» перевернул бы порядок: получилось бы, что квадрат найден из длины, а её ещё не знали. «Or» вводит новый известный факт, «Comme» — причину в начале фразы.'] }; },
  (c, r) => { const n = r.pick([51, 57, 87, 93, 111, 123]); return { fr: 'Le nombre ' + n + ' n’est pas premier …… il est divisible par 3.', ok: 'car', bad: ['donc', 'alors', 'or'],
    sol: ['После пропуска — причина: число не простое, потому что у него есть делитель 3. Причину после утверждения вводит «car».', '«Donc» и «alors» перевернули бы смысл: из того, что число не простое, не следует, что оно делится именно на 3.'] }; },
  (c, r) => ({ fr: r.pick(['Si les diagonales d’un quadrilatère se coupent en leur milieu, …… c’est un parallélogramme.', 'Si deux droites sont perpendiculaires à une même droite, …… elles sont parallèles.', 'Si un nombre est divisible par 9, …… il est divisible par 3.', 'Si un triangle est rectangle, …… le carré de la longueur de l’hypoténuse est égal à la somme des carrés des longueurs des deux autres côtés.']), ok: 'alors', bad: ['car', 'or', 'comme'],
    sol: ['«Si…, alors…» — «если…, то…»: так формулируют свойства и теоремы. «Alors» вводит то, что следует из условия.', '«Car» и «comme» вводят причину, «or» — новый факт: ни одно из этих слов не составляет пары с «si».'] }),
  () => ({ fr: 'Le polygone est-il régulier, …… a-t-il tous ses côtés de même longueur ?', ok: 'c’est-à-dire', bad: ['donc', 'car', 'or'],
    sol: ['«C’est-à-dire» — «то есть»: вопрос повторён другими словами — объяснено, что значит «régulier». Ничего не выводится и не доказывается.', '«Donc», «car» и «or» связывают утверждения в рассуждении, а здесь рассуждения нет — есть только пояснение слова.'] }),
  (c, r) => { const [k, n, s] = r.pick([[3, 12, '1/4'], [4, 20, '1/5'], [5, 15, '1/3'], [6, 8, '3/4'], [4, 10, '2/5']]); return { fr: 'La probabilité de tirer une boule rouge est égale à $' + k + '/' + n + '$, …… $' + s + '$.', ok: 'c’est-à-dire', bad: ['car', 'or', 'si'],
    sol: ['«C’est-à-dire» — «то есть»: $' + k + '/' + n + '$ и $' + s + '$ — одно и то же число, записанное по-разному.', '«Car» объясняло бы причину, «or» вводило бы новый факт, «si» — условие. Здесь нужно только сказать то же самое иначе.'] }; },
  (c, r) => { const [p, q, h] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]); return { fr: 'D’une part, $' + c.bc + '^2=' + h + '^2=' + h * h + '$. ……, $' + c.ab + '^2+' + c.ac + '^2=' + p + '^2+' + q + '^2=' + h * h + '$.', ok: 'D’autre part', bad: ['Donc', 'Car', 'D’après'],
    sol: ['«D’une part…, d’autre part…» — «с одной стороны…, с другой стороны…»: так записывают два отдельных вычисления, которые потом сравнивают. Пара всегда идёт вместе.', '«Donc» понадобится позже — когда оба числа посчитаны и можно делать вывод. Второе вычисление не следует из первого и не объясняет его.'] }; },
  c => ({ fr: 'Le triangle ' + c.t + ' est rectangle en ' + c.a + ' et l’angle ' + lgAng(c.a + c.b + c.c) + ' mesure ' + c.ang + '°. La somme des mesures des angles d’un triangle est égale à 180°. …… l’angle ' + lgAng(c.a + c.c + c.b) + ' mesure ' + (90 - c.ang) + '°.', ok: 'On en déduit que', bad: ['On sait que', 'Car', 'Comme'],
    sol: ['«On en déduit que» — «отсюда следует, что»: «en» — «из этого», как в команде «En déduire». Так вводят вывод — наравне с «donc».', '«On sait que» — «известно, что»: так вводят данное, а величину третьего угла мы только что получили сами.'] }),
  (c, r) => { const k = r.ri(3, 6), n = k * r.ri(3, 5); return { fr: 'Le sac contient ' + n + ' boules, dont ' + k + ' boules rouges, et toutes les boules ont la même probabilité d’être tirées. …… la probabilité de tirer une boule rouge est égale à $' + k + '/' + n + '$.', ok: 'Donc', bad: ['Car', 'Or', 'Si'],
    sol: ['Сначала названы факты (сколько шаров и что все они равновозможны), затем из них получена вероятность. Вывод вводит «Donc».', '«Car» ввёл бы причину сказанного раньше, «Or» — ещё один известный факт, «Si» — условие. А здесь — результат.'] }; },
  (c, r) => { const d = r.pick([2, 4, 6, 8]), n = r.ri(11, 98) * 10 + d; return { fr: 'Le nombre ' + n + ' est pair …… il se termine par ' + d + '.', ok: 'car', bad: ['donc', 'alors', 'or'],
    sol: ['После пропуска — причина: число чётное, потому что его последняя цифра — ' + d + '. Причину после утверждения вводит «car».', '«Donc» и «alors» перевернули бы смысл: из чётности не следует, что число оканчивается именно на ' + d + '.'] }; },
  (c, r) => { const [u, v] = r.pick([[81, 74], [49, 52], [81, 85], [64, 61]]); return { fr: '…… $' + u + '≠' + v + '$, le triangle ' + c.t + ' n’est pas rectangle.', ok: 'Comme', bad: ['Donc', 'Car', 'Or'],
    sol: ['Фраза начинается с причины (числа не равны), а вывод идёт после запятой. Причину в начале фразы вводит «Comme» — «так как».', 'То же самое можно записать с «car», но в другом порядке: «Le triangle n’est pas rectangle, car $' + u + '≠' + v + '$». В начале фразы «car» не ставят.'] }; }];
/* what each connector introduces: classes of roles (connectors of one class are never offered against each other) */
const LG_ROLE = { C: 'Вывод: то, что следует из сказанного раньше.', R: 'Причину: почему верно то, что сказано.', F: 'Известный факт, из которого потом сделают вывод.', T: 'Теорему или свойство, на которые ссылаются.',
  S: 'Условие («если») и то, что из него следует («то»).', E: 'То же самое, сказанное другими словами.', P: 'Два отдельных вычисления, которые потом сравнят.', X: 'Выбор из двух возможностей: «или».' };
const LG_ROLEQ = { C: 'Каким словом в рассуждении вводят вывод?', R: 'Каким словом в рассуждении вводят причину?', F: 'Каким словом вводят известный факт, из которого потом сделают вывод?', T: 'Каким словом ссылаются на теорему или свойство?',
  S: 'Какими словами записывают «если…, то…»?', E: 'Каким словом вводят то же самое, сказанное иначе?', P: 'Какими словами вводят два вычисления, которые потом сравнят?' };
const LG_ROLEN = { C: ['вывод', 'donc'], R: ['причину', 'car'], F: ['известный факт', 'or'], T: ['ссылку на теорему', 'd’après'], S: ['условие и следствие', 'si…, alors…'], E: ['пояснение другими словами', 'c’est-à-dire'], P: ['два вычисления для сравнения', 'd’une part…, d’autre part…'], X: ['выбор «или»', 'ou'] };
const LG_CONN = [
  ['donc', 'C', 'значит', '«Donc» — «значит, следовательно»: вводит вывод. Пример: «Le triangle est rectangle, donc on peut utiliser le théorème de Pythagore.»'],
  ['car', 'R', 'так как', '«Car» — «так как, потому что»: вводит причину и стоит после того, что объясняет. Пример: «On peut utiliser le théorème de Pythagore, car le triangle est rectangle.»'],
  ['or', 'F', 'а (известно, что)', '«Or» вводит ещё один известный факт, обычно свойство, из которого вместе с предыдущим получается вывод: «On sait que AB = AC. Or, un triangle qui a deux côtés de même longueur est isocèle. Donc…» Это не «или»: «или» по-французски «ou».'],
  ['comme', 'R', 'так как (в начале фразы)', '«Comme» в начале фразы — «так как»: сначала причина, после запятой вывод. Пример: «Comme le triangle est rectangle, on peut utiliser le théorème de Pythagore.»'],
  ['d’après', 'T', 'согласно, по', '«D’après» — «согласно, по»: так ссылаются на теорему или свойство. Пример: «D’après le théorème de Thalès, on a…»'],
  ['on sait que', 'F', 'известно, что', '«On sait que» — «известно, что»: так вводят данные условия или уже доказанное — то, с чего рассуждение начинается.'],
  ['on en déduit que', 'C', 'отсюда следует, что', '«On en déduit que» — «отсюда следует, что»: «en» — «из этого». Вводит вывод, как и «donc».'],
  ['si…, alors…', 'S', 'если…, то…', '«Si…, alors…» — «если…, то…»: так формулируют свойства и теоремы. После «si» — условие, после «alors» — то, что из него следует.'],
  ['c’est-à-dire', 'E', 'то есть', '«C’est-à-dire» — «то есть»: то же самое говорится другими словами, ничего нового не выводится.'],
  ['d’une part…, d’autre part…', 'P', 'с одной стороны…, с другой…', '«D’une part…, d’autre part…» — «с одной стороны…, с другой стороны…»: два отдельных вычисления, которые затем сравнивают, — например, $BC^2$ и $AB^2+AC^2$ в обратной теореме Пифагора.'],
  ['par conséquent', 'C', 'следовательно', '«Par conséquent» — «следовательно» («conséquence» — следствие): вводит вывод, как «donc».']];
/* short reasonings to put in order: what is known — the property — the conclusion */
const LG_ORD3 = 'Порядок подсказывают связки: «On sait que» — то, что дано; «Or» — свойство, которое к этому применяют; «Donc» — вывод. Вывод не может стоять раньше того, из чего он сделан.';
const LG_ORD = [
  c => ({ aim: L('On veut démontrer que le triangle O' + c.a + c.b + ' est isocèle.', 'Нужно доказать, что треугольник O' + c.a + c.b + ' равнобедренный.'),
    steps: [L('On sait que les points ' + c.a + ' et ' + c.b + ' appartiennent au cercle de centre O.', 'Известно, что точки ' + c.a + ' и ' + c.b + ' лежат на окружности с центром O.'),
    L('Or, tous les points d’un cercle sont à la même distance de son centre : O' + c.a + ' = O' + c.b + '.', 'А все точки окружности находятся на одном расстоянии от её центра: O' + c.a + ' = O' + c.b + '.'),
    L('Donc le triangle O' + c.a + c.b + ' est isocèle en O.', 'Значит, треугольник O' + c.a + c.b + ' равнобедренный с вершиной O.')],
    sol: [LG_ORD3, 'Здесь дано, что точки лежат на окружности; свойство — определение окружности; вывод — о треугольнике. «Isocèle en O» — равные стороны выходят из вершины O.'] }),
  c => ({ aim: L('On veut démontrer que les droites (' + c.ab + ') et (' + c.xy + ') sont parallèles.', 'Нужно доказать, что прямые (' + c.ab + ') и (' + c.xy + ') параллельны.'),
    steps: [L('On sait que les droites (' + c.ab + ') et (' + c.xy + ') sont toutes les deux perpendiculaires à la droite (' + c.a + c.x + ').', 'Известно, что прямые (' + c.ab + ') и (' + c.xy + ') обе перпендикулярны прямой (' + c.a + c.x + ').'),
    L('Or, si deux droites sont perpendiculaires à une même droite, alors elles sont parallèles.', 'А если две прямые перпендикулярны одной и той же прямой, то они параллельны.'),
    L('Donc les droites (' + c.ab + ') et (' + c.xy + ') sont parallèles.', 'Значит, прямые (' + c.ab + ') и (' + c.xy + ') параллельны.')],
    sol: [LG_ORD3, 'Свойство записано оборотом «si…, alors…» — «если…, то…»: это общее правило, а «Donc» применяет его к нашим прямым.'] }),
  c => ({ aim: L('On veut calculer la mesure de l’angle ' + lgAng(c.a + c.c + c.b) + '.', 'Нужно найти величину угла ' + lgAng(c.a + c.c + c.b) + '.'),
    steps: [L('On sait que, dans le triangle ' + c.t + ', l’angle ' + lgAng(c.b + c.a + c.c) + ' mesure 90° et l’angle ' + lgAng(c.a + c.b + c.c) + ' mesure ' + c.ang + '°.', 'Известно, что в треугольнике ' + c.t + ' угол ' + lgAng(c.b + c.a + c.c) + ' равен 90°, а угол ' + lgAng(c.a + c.b + c.c) + ' равен ' + c.ang + '°.'),
    L('Or, la somme des mesures des angles d’un triangle est égale à 180°.', 'А сумма углов треугольника равна 180°.'),
    L('Donc l’angle ' + lgAng(c.a + c.c + c.b) + ' mesure 180° − 90° − ' + c.ang + '° = ' + (90 - c.ang) + '°.', 'Значит, угол ' + lgAng(c.a + c.c + c.b) + ' равен 180° − 90° − ' + c.ang + '° = ' + (90 - c.ang) + '°.')],
    sol: [LG_ORD3, 'Здесь даны два угла; свойство — сумма углов треугольника; вывод — третий угол, вместе с вычислением.'] }),
  (c, r) => { const [p, q, h] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]); return {
    aim: L('On veut démontrer que le triangle ' + c.t + ', tel que ' + c.bc + ' = ' + h + ' cm, ' + c.ab + ' = ' + p + ' cm et ' + c.ac + ' = ' + q + ' cm, est rectangle.', 'Нужно доказать, что треугольник ' + c.t + ', в котором ' + c.bc + ' = ' + h + ' см, ' + c.ab + ' = ' + p + ' см и ' + c.ac + ' = ' + q + ' см, прямоугольный.'), steps: [
    L('Dans le triangle ' + c.t + ', le plus long côté est [' + c.bc + '].', 'В треугольнике ' + c.t + ' самая длинная сторона — [' + c.bc + '].'),
    L('D’une part, $' + c.bc + '^2=' + h + '^2=' + h * h + '$.', 'С одной стороны, $' + c.bc + '^2=' + h + '^2=' + h * h + '$.'),
    L('D’autre part, $' + c.ab + '^2+' + c.ac + '^2=' + p + '^2+' + q + '^2=' + h * h + '$.', 'С другой стороны, $' + c.ab + '^2+' + c.ac + '^2=' + p + '^2+' + q + '^2=' + h * h + '$.'),
    L('Donc $' + c.bc + '^2=' + c.ab + '^2+' + c.ac + '^2$ : d’après la réciproque du théorème de Pythagore, le triangle ' + c.t + ' est rectangle en ' + c.a + '.', 'Значит, $' + c.bc + '^2=' + c.ab + '^2+' + c.ac + '^2$: по обратной теореме Пифагора треугольник ' + c.t + ' прямоугольный, прямой угол — ' + c.a + '.')],
    sol: ['Сначала называют самую длинную сторону (только она может быть гипотенузой), затем идут два отдельных вычисления — «D’une part…», «D’autre part…» — и только потом вывод с «Donc» и названием теоремы.', '«D’une part» всегда стоит раньше, чем «d’autre part»: «с одной стороны…, с другой стороны…».'] }; },
  (c, r) => { const k = r.ri(2, 9); return { aim: L('On veut démontrer que la fonction ' + c.f + ' représente une situation de proportionnalité.', 'Нужно доказать, что функция ' + c.f + ' описывает пропорциональную зависимость.'), steps: [
    L('La fonction ' + c.f + ' est définie par $' + c.f + '(x)=' + k + 'x$ : c’est une fonction linéaire.', 'Функция ' + c.f + ' задана формулой $' + c.f + '(x)=' + k + 'x$: это прямая пропорциональность («fonction linéaire»).'),
    L('Or, toute fonction linéaire représente une situation de proportionnalité.', 'А любая такая функция описывает пропорциональную зависимость.'),
    L('Donc la fonction ' + c.f + ' représente une situation de proportionnalité.', 'Значит, функция ' + c.f + ' описывает пропорциональную зависимость.')],
    sol: ['Сначала то, что видно из формулы, затем общее свойство («Or…»), в конце вывод («Donc…»).', 'Напоминание: «fonction linéaire» — это $x→ax$, прямая пропорциональность; русская «линейная функция» $ax+b$ по-французски — «fonction affine».'] }; },
  (c, r) => { const k = r.ri(3, 7), n = k * r.ri(3, 5) + r.ri(1, 2); return { aim: L('On tire au hasard une boule dans un sac. On veut calculer la probabilité de tirer une boule bleue.', 'Из мешка наугад вытаскивают шар. Нужно найти вероятность вытащить синий шар.'), steps: [
    L('Le sac contient ' + n + ' boules, dont ' + k + ' boules bleues.', 'В мешке ' + n + ' шаров, из них ' + k + ' синих.'),
    L('Or, toutes les boules ont la même probabilité d’être tirées.', 'А все шары можно вытащить с одинаковой вероятностью.'),
    L('Donc la probabilité de tirer une boule bleue est égale à $' + k + '/' + n + '$.', 'Значит, вероятность вытащить синий шар равна $' + k + '/' + n + '$.')],
    sol: ['Сначала данные (сколько шаров и сколько из них синих), затем условие, без которого формулу применять нельзя («Or…» — все шары равновозможны), и только потом вывод.', 'Делить «число благоприятных исходов на число всех» можно только тогда, когда исходы равновозможны, — поэтому эта фраза нужна в записи.'] }; },
  (c, r) => { const [n, d] = r.pick([[2025, 9], [1242, 9], [5112, 9], [2028, 3], [4011, 3], [1236, 3]]), dg = String(n).split(''), s = dg.reduce((a, b) => a + +b, 0); return { aim: L('On veut savoir si le nombre ' + n + ' est divisible par ' + d + '.', 'Нужно узнать, делится ли число ' + n + ' на ' + d + '.'), steps: [
    L('La somme des chiffres de ' + n + ' est $' + dg.join('+') + '=' + s + '$.', 'Сумма цифр числа ' + n + ' равна $' + dg.join('+') + '=' + s + '$.'),
    L('Or, un nombre est divisible par ' + d + ' si la somme de ses chiffres est divisible par ' + d + '.', 'А число делится на ' + d + ', если сумма его цифр делится на ' + d + '.'),
    L('Donc ' + n + ' est divisible par ' + d + '.', 'Значит, ' + n + ' делится на ' + d + '.')],
    sol: ['Сначала вычисление (сумма цифр), затем признак делимости («Or…»), в конце вывод («Donc…»).', 'Признак — общее правило для любых чисел; «Donc» применяет его к числу ' + n + ': ' + s + ' делится на ' + d + '.'] }; },
  () => ({ aim: L('On veut démontrer que le quadrilatère ABCD est un parallélogramme.', 'Нужно доказать, что четырёхугольник ABCD — параллелограмм.'),
    steps: [L('On sait que les diagonales [AC] et [BD] du quadrilatère ABCD se coupent en leur milieu.', 'Известно, что диагонали [AC] и [BD] четырёхугольника ABCD пересекаются в своей середине.'),
    L('Or, si les diagonales d’un quadrilatère se coupent en leur milieu, alors c’est un parallélogramme.', 'А если диагонали четырёхугольника пересекаются в своей середине, то это параллелограмм.'),
    L('Donc le quadrilatère ABCD est un parallélogramme.', 'Значит, четырёхугольник ABCD — параллелограмм.')],
    sol: [LG_ORD3, 'Свойство («si…, alors…») — общее правило о любом четырёхугольнике; «Donc» применяет его к ABCD.'] }),
  (c, r) => { const [a, b] = r.sh([1, 2, 3, 4, 5, 6, 7]); return { aim: L('On veut résoudre l’équation $(x-' + a + ')(x+' + b + ')=0$.', 'Нужно решить уравнение $(x-' + a + ')(x+' + b + ')=0$.'), steps: [
    L('On sait que $(x-' + a + ')(x+' + b + ')=0$.', 'Известно, что $(x-' + a + ')(x+' + b + ')=0$.'),
    L('Or, un produit est nul si et seulement si l’un de ses facteurs est nul.', 'А произведение равно нулю тогда и только тогда, когда один из множителей равен нулю.'),
    L('Donc $x-' + a + '=0$ ou $x+' + b + '=0$.', 'Значит, $x-' + a + '=0$ или $x+' + b + '=0$.'),
    L('Les solutions de l’équation sont ' + a + ' et −' + b + '.', 'Решения уравнения: ' + a + ' и −' + b + '.')],
    sol: ['Сначала само уравнение, затем свойство произведения («Or…»), затем то, что из него следует («Donc…»), и в конце ответ.', 'Обрати внимание на «ou» — «или»: в отличие от «or», это настоящее «или». А «nul» — «равный нулю».'] }; }];
/* a cause and its consequence (the converse is false): which sentence has them the right way round */
const LG_CE = [
  (c, r) => { const n = r.pick([12, 18, 24, 30, 42]); return { C: ['le nombre ' + n + ' est divisible par 6', 'il est divisible par 6'], E: ['le nombre ' + n + ' est divisible par 3', 'il est divisible par 3'],
    note: 'Из делимости на 6 следует делимость на 3 (ведь 6 = 2 × 3), а обратное неверно: 9 делится на 3, но не на 6. Значит, причина — «делится на 6», вывод — «делится на 3».' }; },
  () => ({ C: ['le quadrilatère ABCD est un rectangle', 'c’est un rectangle'], E: ['les diagonales du quadrilatère ABCD ont la même longueur', 'ses diagonales ont la même longueur'],
    note: 'У прямоугольника диагонали равны, но равные диагонали бывают и у четырёхугольника, который не прямоугольник. Значит, причина — «это прямоугольник», вывод — «диагонали равны».' }),
  c => ({ C: ['les droites (' + c.ab + ') et (' + c.xy + ') sont perpendiculaires à la droite (d)', 'elles sont perpendiculaires à la droite (d)'], E: ['les droites (' + c.ab + ') et (' + c.xy + ') sont parallèles', 'elles sont parallèles'],
    note: 'Две прямые, перпендикулярные третьей, параллельны. Но параллельные прямые не обязаны быть перпендикулярны именно прямой (d). Значит, причина — перпендикулярность, вывод — параллельность.' }),
  (c, r) => { const k = r.ri(2, 9); return { C: ['$x=' + k + '$', '$x=' + k + '$'], E: ['$x^2=' + k * k + '$', '$x^2=' + k * k + '$'],
    note: 'Из $x=' + k + '$ следует $x^2=' + k * k + '$, но не наоборот: квадрат ' + k * k + ' даёт и число −' + k + '. Значит, причина — $x=' + k + '$, вывод — $x^2=' + k * k + '$.' }; },
  c => ({ C: ['le triangle ' + c.t + ' est équilatéral', 'il est équilatéral'], E: ['le triangle ' + c.t + ' est isocèle', 'il est isocèle'],
    note: 'У равностороннего треугольника равны все три стороны, значит, две — тем более: он равнобедренный. А равнобедренный треугольник не обязан быть равносторонним. Причина — «équilatéral», вывод — «isocèle».' }),
  c => ({ C: ['le point O est le milieu du segment [' + c.ab + ']', 'O est le milieu du segment [' + c.ab + ']'], E: ['O' + c.a + ' = O' + c.b, 'O' + c.a + ' = O' + c.b],
    note: 'Середина отрезка равноудалена от его концов. Но равноудалена от концов любая точка серединного перпендикуляра («médiatrice»), а не только середина. Причина — «O — середина», вывод — равенство расстояний.' }),
  (c, r) => { const n = r.pick([30, 50, 70, 130, 210]); return { C: ['le nombre ' + n + ' est un multiple de 10', 'c’est un multiple de 10'], E: ['le nombre ' + n + ' est pair', 'il est pair'],
    note: 'Число, кратное 10, оканчивается на 0 и потому чётное. Но чётное число не обязано быть кратным 10: например, 12. Причина — «кратно 10», вывод — «чётное».' }; },
  () => ({ C: ['le quadrilatère ABCD est un losange', 'c’est un losange'], E: ['les diagonales du quadrilatère ABCD sont perpendiculaires', 'ses diagonales sont perpendiculaires'],
    note: 'У ромба диагонали перпендикулярны. Но перпендикулярные диагонали бывают и у четырёхугольника, который не ромб. Причина — «это ромб», вывод — «диагонали перпендикулярны».' })];

topic({ id: 'lg.connecteurs', ch: 'lg', lvl: 1, calc: false, variants: 4,
  ru: 'Связки рассуждения: «donc», «car», «or»', fr: 'Les connecteurs du raisonnement : donc, car, or…',
  hints: [
    'Связки показывают, как части рассуждения связаны между собой: что дано, что из чего следует и почему. Про каждую часть спроси себя: это причина или вывод?',
    '«Donc» — «значит»: после него идёт вывод. «Car» — «так как»: после него идёт причина. Проверка: подставь по-русски «значит» и «потому что» и посмотри, не перевернулся ли смысл.',
    'Образец из трёх шагов: «On sait que…» (что дано) — «Or…» (свойство или теорема) — «Donc…» (вывод). «Or» — не «или»: «или» по-французски «ou». Причину в начале фразы вводит «Comme», а на теорему ссылаются словом «D’après».'],
  gen(r, vi) {
    const c = lgCtx(r);
    if (vi === 0) { const it = r.pick(LG_CLOZE)(c, r); return { q: lgSay(it.fr, 'Какое слово нужно на месте пропуска?'), ans: lgMQ(r, [it.ok].concat(it.bad), 0), sol: it.sol }; }
    if (vi === 1) {          /* connector ↔ what it introduces */
      const me = r.pick(LG_CONN), ks = r.sh(Object.keys(LG_ROLEQ).filter(k => k !== me[1])).slice(0, 3);
      if (r() < 0.5) {
        if (me[0] === 'or') ks[2] = 'X';          /* the false friend: «or» is not «или» */
        return { q: 'Что вводит в рассуждении «' + me[0] + '»?', ans: lgMQ(r, [LG_ROLE[me[1]]].concat(ks.map(k => LG_ROLE[k])), 0),
          sol: [me[3], 'Остальное вводят так: ' + ks.map(k => LG_ROLEN[k][0] + ' — «' + LG_ROLEN[k][1] + '»').join('; ') + '.'] };
      }
      const oth = ks.map(k => r.pick(LG_CONN.filter(x => x[1] === k)));
      if (me[1] === 'F') oth[2] = ['ou', 'X', 'или'];
      return { q: LG_ROLEQ[me[1]], ans: lgMQ(r, [me].concat(oth).map(o => o[0]), 0), sol: [me[3], 'Остальные слова: ' + oth.map(o => '«' + o[0] + '» — ' + o[2]).join('; ') + '.'] };
    }
    if (vi === 2) { const it = r.pick(LG_ORD)(c, r); return { q: lgOrdQ(it.aim, 'du raisonnement', 'рассуждения'), ans: ORD(r, it.steps), sol: it.sol }; }
    const p = r.pick(LG_CE)(c, r), C = p.C, E = p.E, g = r.ri(0, 2);
    const good = [lgCap(C[0]) + ', donc ' + E[1] + '.', lgCap(E[0]) + ', car ' + C[1] + '.', 'Comme ' + C[0] + ', ' + E[1] + '.'][g];
    return { q: 'В какой фразе причина и вывод стоят на своих местах?', ans: lgMQ(r, [good, lgCap(E[0]) + ', donc ' + C[1] + '.', lgCap(C[0]) + ', car ' + E[1] + '.', 'Comme ' + E[0] + ', ' + C[1] + '.'], 0),
      sol: [p.note, 'Перед выводом ставят «donc»; перед причиной — «car» (в середине фразы) или «Comme» (в начале). Верная фраза: «' + good + '»', 'В трёх остальных фразах причина и вывод переставлены: из следствия «выводится» то, из чего на самом деле всё следует.'] };
  } });

/* ===================== WRITING THE ANSWER: the usual phrases of a «rédaction» ===================== */
const LG_TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];
const LG_NOTR = [[5, 7, 9, 74, 81], [4, 6, 7, 52, 49], [6, 7, 9, 85, 81], [5, 6, 8, 61, 64]];          /* p, q, h, p² + q², h²: not a right triangle */
/* a write-up with a gap → the missing piece */
const LG_RED = [
  c => ({ fr: 'Dans le triangle ' + c.t + ' …… en ' + c.a + ', d’après le théorème de Pythagore, on a : $' + c.bc + '^2=' + c.ab + '^2+' + c.ac + '^2$.', ok: 'rectangle', bad: ['rectangulaire', 'droit', 'isocèle'],
    sol: ['Прямоугольный треугольник — «triangle rectangle», а вершину прямого угла называют через «en»: «rectangle en ' + c.a + '». Это условие теоремы Пифагора: без этих слов применять её нельзя.', '«Rectangulaire» — «прямоугольной формы» (о столе, о поле); о треугольнике так не говорят. «Droit» — «прямой»: бывает «angle droit», но не «triangle droit». «Isocèle» — равнобедренный.'] }),
  c => ({ fr: 'Les droites (' + c.b + c.x + ') et (' + c.c + c.y + ') sont sécantes en ' + c.a + ' et les droites (' + c.bc + ') et (' + c.xy + ') sont parallèles. D’après ……, on a : $$' + lgFrac(c.ab, c.a + c.x) + '=' + lgFrac(c.ac, c.a + c.y) + '=' + lgFrac(c.bc, c.xy) + '$$.', ok: 'le théorème de Thalès', bad: ['le théorème de Pythagore', 'la réciproque du théorème de Thalès', 'la réciproque du théorème de Pythagore'],
    sol: ['Две прямые пересекаются в точке ' + c.a + ', и их пересекают две параллельные прямые — это условие теоремы Фалеса («le théorème de Thalès»). Она даёт равенство отношений длин.', '«La réciproque du théorème de Thalès» — обратная теорема: ею, наоборот, доказывают параллельность прямых, когда отношения уже известны. Теорема Пифагора — про прямоугольный треугольник и квадраты сторон.'] }),
  (c, r) => { const [p, q, h] = r.pick(LG_TRIPLES); return { fr: 'D’une part, $' + c.bc + '^2=' + h + '^2=' + h * h + '$. D’autre part, $' + c.ab + '^2+' + c.ac + '^2=' + p + '^2+' + q + '^2=' + h * h + '$. Donc, d’après ……, le triangle ' + c.t + ' est rectangle en ' + c.a + '.', ok: 'la réciproque du théorème de Pythagore', bad: ['le théorème de Pythagore', 'le théorème de Thalès', 'la définition du triangle rectangle'],
    sol: ['Здесь из равенства квадратов делают вывод, что треугольник прямоугольный. Так работает обратная теорема — «la réciproque du théorème de Pythagore».', 'Сама теорема Пифагора идёт в другую сторону: треугольник прямоугольный — значит, равенство верно. Назвать не ту из двух — частая потеря балла.'] }; },
  (c, r) => { const [p, q, h, s, hh] = r.pick(LG_NOTR); return { fr: 'Dans le triangle ' + c.t + ', le plus long côté est [' + c.bc + ']. $' + c.bc + '^2=' + h + '^2=' + hh + '$ et $' + c.ab + '^2+' + c.ac + '^2=' + p + '^2+' + q + '^2=' + s + '$. Comme $' + hh + '≠' + s + '$, le triangle ' + c.t + ' …… .', ok: 'n’est pas rectangle', bad: ['est rectangle en ' + c.a, 'n’est pas isocèle', 'est rectangle en ' + c.b],
    sol: ['Числа не равны (знак «≠» читают «est différent de»). Будь треугольник прямоугольным, по теореме Пифагора они были бы равны. Значит, он не прямоугольный: «n’est pas rectangle».', 'Отрицание во французском состоит из двух частей вокруг глагола: «ne… pas» — «n’est pas». О равнобедренности («isocèle») это вычисление ничего не говорит.'] }; },
  (c, r) => { const k = r.ri(3, 7), n = k * r.ri(2, 4) + r.ri(1, 2); return { fr: 'Le sac contient ' + n + ' boules, dont ' + k + ' boules rouges. Toutes les boules ont la même probabilité d’être tirées. La …… de tirer une boule rouge est égale à $' + k + '/' + n + '$.', ok: 'probabilité', bad: ['possibilité', 'fréquence', 'proportionnalité'],
    sol: ['Вероятность — «la probabilité»: число от 0 до 1. Фраза-ответ строится так: «La probabilité de… est égale à…».', '«Possibilité» — «возможность», это не число. «Fréquence» — частота: доля в уже проведённых опытах или в данных. «Proportionnalité» — пропорциональность.'] }; },
  (c, r) => { const n = r.ri(5, 15); return { fr: 'Donc la longueur ' + c.bc + ' est égale …… ' + n + ' cm.', ok: 'à', bad: ['de', 'que', 'avec'],
    sol: ['По-русски «равна ' + n + ' см», а по-французски после «égal» нужен предлог «à»: «est égale à ' + n + ' cm». Слово «longueur» женского рода, поэтому «égale» с буквой «e» на конце.', 'То же самое можно сказать без «égale»: «La longueur ' + c.bc + ' est de ' + n + ' cm» или «' + c.bc + ' mesure ' + n + ' cm». Но после «égale» — только «à».'] }; },
  (c, r) => { const n = r.ri(2, 9), m = r.ri(11, 40); return r() < 0.5 ? { fr: 'On a $' + c.f + '(' + n + ')=' + m + '$. Donc ' + m + ' est …… de ' + n + ' par la fonction ' + c.f + '.', ok: 'l’image', bad: ['l’antécédent', 'la solution', 'l’abscisse'],
    sol: ['Запись $' + c.f + '(' + n + ')=' + m + '$ читают «l’image de ' + n + ' par la fonction ' + c.f + ' est ' + m + '»: «image» — то, что получается, значение функции.', '«Antécédent» — наоборот, число, с которого начинают: ' + n + ' — «un antécédent de ' + m + '».'] }
    : { fr: 'On a $' + c.f + '(' + n + ')=' + m + '$. Donc ' + n + ' est …… de ' + m + ' par la fonction ' + c.f + '.', ok: 'un antécédent', bad: ['l’image', 'la solution', 'le résultat'],
      sol: ['«Un antécédent de ' + m + '» — число, которое функция переводит в ' + m + ': это ' + n + '. Говорят «un antécédent», а не «l’antécédent», потому что таких чисел может быть несколько.', '«L’image» — наоборот, то, что получается: ' + m + ' — образ числа ' + n + '.'] }; },
  (c, r) => { const a = r.ri(3, 9), b = r.ri(2, 6), h = r.ri(2, 5), t = r.ri(0, 2);
    const fr = ['Un rectangle mesure ' + a + ' cm sur ' + b + ' cm. $2*(' + a + '+' + b + ')=' + 2 * (a + b) + '$. Son périmètre est de ' + 2 * (a + b) + ' …… .', 'Un rectangle mesure ' + a + ' cm sur ' + b + ' cm. $' + a + '*' + b + '=' + a * b + '$. Son aire est de ' + a * b + ' …… .', 'Un pavé droit mesure ' + a + ' cm, ' + b + ' cm et ' + h + ' cm. $' + a + '*' + b + '*' + h + '=' + a * b * h + '$. Son volume est de ' + a * b * h + ' …… .'][t];
    return { fr, ok: ['cm', 'cm²', 'cm³'][t], bad: ['cm', 'cm²', 'cm³', '°'].filter((u, i) => i !== t),
      sol: [['Периметр («le périmètre») — длина границы: сантиметры складывают с сантиметрами, единица — cm.', 'Площадь («l’aire») измеряют в квадратных единицах: сантиметры умножают на сантиметры, получаются cm².', 'Объём («le volume») измеряют в кубических единицах: перемножают три длины в сантиметрах, получаются cm³.'][t],
        'Запомнить помогает показатель: длина — cm, площадь — cm² (две длины перемножены), объём — cm³ (три длины). Градус «°» — единица углов. Ответ без единицы или с чужой единицей может стоить балла.'] }; },
  c => ({ fr: 'Les droites (' + c.b + c.x + ') et (' + c.c + c.y + ') sont sécantes en ' + c.a + ' et les droites (' + c.bc + ') et (' + c.xy + ') sont ……, donc, d’après le théorème de Thalès : $$' + lgFrac(c.ab, c.a + c.x) + '=' + lgFrac(c.ac, c.a + c.y) + '$$.', ok: 'parallèles', bad: ['perpendiculaires', 'sécantes', 'égales'],
    sol: ['Условие теоремы Фалеса — параллельность двух прямых: «les droites (…) et (…) sont parallèles». Без этой фразы равенство отношений писать нельзя.', '«Sécantes» — пересекающиеся, «perpendiculaires» — перпендикулярные. А «égales» о прямых не говорят: равными бывают длины и углы.'] }),
  c => ({ fr: 'Dans le triangle ' + c.t + ' rectangle en ' + c.a + ', le cosinus de l’angle ' + lgAng(c.a + c.b + c.c) + ' est égal au quotient de la longueur du côté …… à cet angle par la longueur de l’hypoténuse.', ok: 'adjacent', bad: ['opposé', 'parallèle', 'droit'],
    sol: ['«Côté adjacent» — прилежащий катет: тот, что «прилегает» к углу и не является гипотенузой. Косинус — прилежащий катет, делённый на гипотенузу.', '«Côté opposé» — противолежащий катет: он нужен для синуса и тангенса. «Parallèle» и «droit» к катетам не относятся.'] }),
  (c, r) => { const v = r.sh([7, 9, 12, 15, 18, 23, 25]).slice(0, 5).sort((x, y) => x - y); return { fr: 'On range les valeurs de la série dans l’ordre …… : ' + v.join(' ; ') + '. La médiane est la 3e valeur : ' + v[2] + '.', ok: 'croissant', bad: ['décroissant', 'alphabétique', 'du tableau'],
    sol: ['«L’ordre croissant» — по возрастанию («croître» — расти): числа записаны от меньшего к большему. Перед поиском медианы ряд обязательно упорядочивают и пишут об этом.', '«Décroissant» — по убыванию: здесь числа идут в другую сторону.'] }; },
  (c, r) => { const a = r.ri(2, 5), b = r.ri(1, 9), x = r.ri(2, 9); return { fr: 'On résout l’équation : $' + a + 'x-' + b + '=' + (a * x - b) + '$, donc $' + a + 'x=' + a * x + '$ et $x=' + x + '$. La …… de l’équation est ' + x + '.', ok: 'solution', bad: ['résolution', 'réponse', 'inconnue'],
    sol: ['По-русски «решение» — и сам процесс, и ответ. По-французски это два слова: «la résolution» — процесс (как решают), «la solution» — число, которое получилось.', '«L’inconnue» — неизвестное, то есть буква $x$, а не её найденное значение. «La réponse de l’équation» не говорят.'] }; },
  () => ({ fr: 'Pour calculer la moyenne, on additionne toutes les notes, puis on divise la somme par …… .', ok: 'l’effectif total', bad: ['l’étendue', 'la médiane', 'la plus grande note'],
    sol: ['«L’effectif total» — общее число значений: сколько всего оценок. Среднее — сумма, делённая на это число.', '«L’étendue» — размах (наибольшее минус наименьшее), «la médiane» — значение посередине упорядоченного ряда.'] })];
/* a write-up to put in order: what we rely on → the calculation → the answer sentence with its unit */
const LG_REDSOL = 'Запись решения идёт так: на что опираемся (условие, название теоремы или формула) → вычисление → фраза-ответ с единицей. Фраза-ответ всегда последняя: она отвечает на вопрос задания.';
const LG_REDORD = [
  (c, r) => { const [p, q, h] = r.pick(LG_TRIPLES); return {
    aim: L('Le triangle ' + c.t + ' est rectangle en ' + c.a + ', avec ' + c.ab + ' = ' + p + ' cm et ' + c.ac + ' = ' + q + ' cm. On veut calculer la longueur ' + c.bc + '.', 'Треугольник ' + c.t + ' прямоугольный, прямой угол — ' + c.a + '; ' + c.ab + ' = ' + p + ' см и ' + c.ac + ' = ' + q + ' см. Нужно найти длину ' + c.bc + '.'),
    steps: [L('Le triangle ' + c.t + ' est rectangle en ' + c.a + '.', 'Треугольник ' + c.t + ' прямоугольный, прямой угол — ' + c.a + '.'),
      L('D’après le théorème de Pythagore, on a : $' + c.bc + '^2=' + c.ab + '^2+' + c.ac + '^2$.', 'По теореме Пифагора: $' + c.bc + '^2=' + c.ab + '^2+' + c.ac + '^2$.'),
      L('$' + c.bc + '^2=' + p + '^2+' + q + '^2=' + h * h + '$', '$' + c.bc + '^2=' + p + '^2+' + q + '^2=' + h * h + '$'),
      L('Donc $' + c.bc + '=√' + h * h + '=' + h + '$.', 'Значит, $' + c.bc + '=√' + h * h + '=' + h + '$.'),
      L('La longueur ' + c.bc + ' est égale à ' + h + ' cm.', 'Длина ' + c.bc + ' равна ' + h + ' см.')],
    sol: [LG_REDSOL, 'Условие теоремы («est rectangle en…») стоит раньше её названия, равенство с буквами — раньше, чем с числами.'] }; },
  (c, r) => { const p = r.ri(2, 5), k = r.ri(2, 3), q = r.ri(3, 7), l1 = '(' + c.b + c.x + ')', l2 = '(' + c.c + c.y + ')', ax = c.a + c.x;
    const th = '$$' + lgFrac(c.ab, ax) + '=' + lgFrac(c.ac, c.a + c.y) + '=' + lgFrac(c.bc, c.xy) + '$$', nb = '$$' + lgFrac(p, k * p) + '=' + lgFrac(q, c.xy) + '$$', calc = '$' + c.xy + '=' + q + '*' + k * p + '÷' + p + '=' + k * q + '$'; return {
      aim: L('Les droites ' + l1 + ' et ' + l2 + ' sont sécantes en ' + c.a + ', les droites (' + c.bc + ') et (' + c.xy + ') sont parallèles, ' + c.ab + ' = ' + p + ' cm, ' + ax + ' = ' + k * p + ' cm et ' + c.bc + ' = ' + q + ' cm. On veut calculer la longueur ' + c.xy + '.',
        'Прямые ' + l1 + ' и ' + l2 + ' пересекаются в точке ' + c.a + ', прямые (' + c.bc + ') и (' + c.xy + ') параллельны, ' + c.ab + ' = ' + p + ' см, ' + ax + ' = ' + k * p + ' см и ' + c.bc + ' = ' + q + ' см. Нужно найти длину ' + c.xy + '.'),
      steps: [L('Les droites ' + l1 + ' et ' + l2 + ' sont sécantes en ' + c.a + ' et les droites (' + c.bc + ') et (' + c.xy + ') sont parallèles.', 'Прямые ' + l1 + ' и ' + l2 + ' пересекаются в точке ' + c.a + ', а прямые (' + c.bc + ') и (' + c.xy + ') параллельны.'),
        L('D’après le théorème de Thalès, on a : ' + th + '.', 'По теореме Фалеса: ' + th + '.'),
        L('On remplace par les longueurs connues : ' + nb + '.', 'Подставляем известные длины: ' + nb + '.'),
        L('Donc ' + calc + '.', 'Значит, ' + calc + '.'),
        L('La longueur ' + c.xy + ' est égale à ' + k * q + ' cm.', 'Длина ' + c.xy + ' равна ' + k * q + ' см.')],
      sol: [LG_REDSOL, 'Условие теоремы Фалеса (пересекающиеся прямые и параллельные прямые) стоит раньше её названия; равенство с буквами — раньше, чем с числами.'] }; },
  (c, r) => { let v; do v = [r.ri(6, 17), r.ri(6, 17), r.ri(6, 17), r.ri(6, 17)]; while ((v[0] + v[1] + v[2] + v[3]) % 4); const s = v[0] + v[1] + v[2] + v[3]; return {
    aim: L('Voici les notes d’un élève : ' + v.join(' ; ') + '. On veut calculer sa moyenne.', 'Оценки ученика: ' + v.join(' ; ') + '. Нужно найти среднее.'),
    steps: [L('On additionne les notes : $' + v.join('+') + '=' + s + '$.', 'Складываем оценки: $' + v.join('+') + '=' + s + '$.'),
      L('On divise la somme par l’effectif total : $' + s + '÷4=' + s / 4 + '$.', 'Делим сумму на общее число оценок: $' + s + '÷4=' + s / 4 + '$.'),
      L('La moyenne de l’élève est ' + s / 4 + '.', 'Среднее ученика — ' + s / 4 + '.')],
    sol: ['Сначала сумма, потом деление на число оценок («l’effectif total»), в конце — фраза-ответ со словами вопроса: «La moyenne… est…».', 'Слова «on additionne» (складываем) и «on divise» (делим) объясняют, что делается: голые вычисления без слов оцениваются ниже.'] }; },
  (c, r) => { const a = r.ri(2, 5), b = r.ri(1, 9), x = r.ri(2, 9), e = a + 'x-' + b + '=' + (a * x - b); return {
    aim: L('On veut résoudre l’équation $' + e + '$.', 'Нужно решить уравнение $' + e + '$.'),
    steps: [L('$' + e + '$', '$' + e + '$'),
      L('On ajoute ' + b + ' aux deux membres : $' + a + 'x=' + a * x + '$.', 'Прибавляем ' + b + ' к обеим частям: $' + a + 'x=' + a * x + '$.'),
      L('On divise les deux membres par ' + a + ' : $x=' + x + '$.', 'Делим обе части на ' + a + ': $x=' + x + '$.'),
      L('La solution de l’équation est ' + x + '.', 'Решение уравнения — ' + x + '.')],
    sol: ['Сначала само уравнение, затем по одному действию над обеими частями («les deux membres»), в конце — фраза-ответ: «La solution de l’équation est…».', 'Сначала избавляются от слагаемого без $x$ (прибавляют ' + b + '), и только потом делят на коэффициент при $x$: иначе пришлось бы делить каждое слагаемое.'] }; },
  (c, r) => { const P = r.pick([40, 60, 80, 120, 200]), p = r.pick([10, 20, 25, 30]), d = P * p / 100; return {
    aim: L('Un article coûte ' + P + ' €. Son prix baisse de ' + p + ' %. On veut calculer le nouveau prix.', 'Товар стоит ' + P + ' €. Цена снижается на ' + p + ' %. Нужно найти новую цену.'),
    steps: [L('On calcule la réduction : $' + p + '/100*' + P + '=' + d + '$.', 'Находим скидку: $' + p + '/100*' + P + '=' + d + '$.'),
      L('On soustrait la réduction du prix de départ : $' + P + '-' + d + '=' + (P - d) + '$.', 'Вычитаем скидку из начальной цены: $' + P + '-' + d + '=' + (P - d) + '$.'),
      L('Le nouveau prix de l’article est de ' + (P - d) + ' €.', 'Новая цена товара — ' + (P - d) + ' €.')],
    sol: ['Сначала находят саму скидку («la réduction»), потом вычитают её из цены, и в конце — фраза-ответ с единицей (€).', 'Каждая строка начинается со слов о том, что делается: «On calcule…», «On soustrait…». Так проверяющий видит ход решения.'] }; },
  (c, r) => { const [p, q, h, s, hh] = r.pick(LG_NOTR); return {
    aim: L('On veut savoir si le triangle ' + c.t + ', tel que ' + c.bc + ' = ' + h + ' cm, ' + c.ab + ' = ' + p + ' cm et ' + c.ac + ' = ' + q + ' cm, est rectangle.', 'Нужно узнать, прямоугольный ли треугольник ' + c.t + ', в котором ' + c.bc + ' = ' + h + ' см, ' + c.ab + ' = ' + p + ' см и ' + c.ac + ' = ' + q + ' см.'),
    steps: [L('Dans le triangle ' + c.t + ', le plus long côté est [' + c.bc + '].', 'В треугольнике ' + c.t + ' самая длинная сторона — [' + c.bc + '].'),
      L('D’une part, $' + c.bc + '^2=' + h + '^2=' + hh + '$.', 'С одной стороны, $' + c.bc + '^2=' + h + '^2=' + hh + '$.'),
      L('D’autre part, $' + c.ab + '^2+' + c.ac + '^2=' + p + '^2+' + q + '^2=' + s + '$.', 'С другой стороны, $' + c.ab + '^2+' + c.ac + '^2=' + p + '^2+' + q + '^2=' + s + '$.'),
      L('Comme $' + hh + '≠' + s + '$, le triangle ' + c.t + ' n’est pas rectangle.', 'Так как $' + hh + '≠' + s + '$, треугольник ' + c.t + ' не прямоугольный.')],
    sol: ['Сначала называют самую длинную сторону (только она могла бы быть гипотенузой), затем два отдельных вычисления — «D’une part…», «D’autre part…» — и в конце вывод.', 'Вывод начинается с причины: «Comme … ≠ …» — «так как числа не равны». Будь треугольник прямоугольным, по теореме Пифагора они были бы равны.'] }; },
  (c, r) => { const t = r.ri(2, 4), v = r.pick([12, 15, 18, 20, 24]); return {
    aim: L('Un cycliste parcourt ' + v * t + ' km en ' + t + ' heures. On veut calculer sa vitesse moyenne.', 'Велосипедист проезжает ' + v * t + ' км за ' + t + ' ч. Нужно найти его среднюю скорость.'),
    steps: [L('La vitesse moyenne est le quotient de la distance parcourue par la durée du trajet.', 'Средняя скорость — частное от деления пройденного расстояния на время в пути.'),
      L('$' + v * t + '÷' + t + '=' + v + '$', '$' + v * t + '÷' + t + '=' + v + '$'),
      L('La vitesse moyenne du cycliste est de ' + v + ' km/h.', 'Средняя скорость велосипедиста — ' + v + ' км/ч.')],
    sol: [LG_REDSOL, 'Единица скорости получается из вычисления: километры делят на часы — km/h.'] }; },
  (c, r) => { const a = r.ri(2, 6), b = r.ri(3, 8), h = r.pick([5, 10]); return {
    aim: L('On veut calculer le volume d’un pavé droit de dimensions ' + a + ' cm, ' + b + ' cm et ' + h + ' cm.', 'Нужно найти объём прямоугольного параллелепипеда с измерениями ' + a + ' см, ' + b + ' см и ' + h + ' см.'),
    steps: [L('Le volume d’un pavé droit est le produit de ses trois dimensions.', 'Объём прямоугольного параллелепипеда — произведение трёх его измерений.'),
      L('$' + a + '*' + b + '*' + h + '=' + a * b * h + '$', '$' + a + '*' + b + '*' + h + '=' + a * b * h + '$'),
      L('Le volume du pavé droit est de ' + a * b * h + ' cm³.', 'Объём параллелепипеда — ' + a * b * h + ' см³.')],
    sol: [LG_REDSOL, 'Три длины в сантиметрах перемножены — единица ответа cm³.'] }; },
  (c, r) => { const n = r.pick([5, 7]), v = r.sh([3, 5, 7, 8, 9, 11, 12, 14, 16, 19, 21, 23, 25]).slice(0, n), s = v.slice().sort((x, y) => x - y), k = (n + 1) / 2; return {
    aim: L('Voici une série de nombres : ' + v.join(' ; ') + '. On veut déterminer sa médiane.', 'Дан ряд чисел: ' + v.join(' ; ') + '. Нужно найти его медиану.'),
    steps: [L('On range les valeurs dans l’ordre croissant : ' + s.join(' ; ') + '.', 'Располагаем значения по возрастанию: ' + s.join(' ; ') + '.'),
      L('La série compte ' + n + ' valeurs : la médiane est la ' + k + 'e valeur.', 'В ряду ' + n + ' значений: медиана — ' + k + '-е значение.'),
      L('La médiane de la série est ' + s[k - 1] + '.', 'Медиана ряда — ' + s[k - 1] + '.')],
    sol: ['Сначала ряд упорядочивают («on range… dans l’ordre croissant»), затем находят место медианы, и в конце — фраза-ответ.', 'Без упорядочивания медиану искать нельзя: «значение посередине» имеет смысл только в упорядоченном ряду.'] }; }];
/* a write-up with one element left out (or complete): what is missing */
function lgMissing(c, r) {
  const kind = r.ri(0, 3), none = 'Ничего: запись полная.'; let parts, lab, why, order;
  if (kind === 0) {          /* Pythagore: a length */
    const [p, q, h] = r.pick(LG_TRIPLES), eq = '$' + c.bc + '^2=' + c.ab + '^2+' + c.ac + '^2$', num = '$' + c.bc + '^2=' + p + '^2+' + q + '^2=' + h * h + '$';
    const cond = 'Le triangle ' + c.t + ' est rectangle en ' + c.a + '.', thm = 'D’après le théorème de Pythagore, on a : ' + eq + '.', calc = num + ', donc $' + c.bc + '=' + h + '$.', end = 'La longueur ' + c.bc + ' est égale à ' + h + ' cm.';
    parts = { none: [cond, thm, calc, end], cond: [thm, calc, end], thm: ['Le triangle ' + c.t + ' est rectangle en ' + c.a + ', donc ' + eq + '.', calc, end], calc: [cond, thm, end], unit: [cond, thm, calc, 'La longueur ' + c.bc + ' est égale à ' + h + '.'], concl: [cond, thm, num + '.'] };
    lab = { cond: 'Не сказано, что треугольник прямоугольный: это условие теоремы.', thm: 'Не названа теорема, на которую опирается равенство.', calc: 'Нет вычисления: ответ появляется без чисел.', unit: 'Во фразе-ответе нет единицы измерения.', concl: 'Нет вывода: длина так и не названа.' };
    why = { cond: 'Теорема Пифагора верна только в прямоугольном треугольнике. Поэтому запись начинают с условия: «Le triangle … est rectangle en …» или «Dans le triangle … rectangle en …».',
      thm: 'Равенство ' + eq + ' само по себе ничем не подтверждено: нужно сказать, откуда оно, — «d’après le théorème de Pythagore». Без названия теоремы обоснование неполное.',
      calc: 'Между равенством с буквами и ответом должно стоять вычисление с числами: по нему видно, как получен результат.',
      unit: 'Длина — величина с единицей. «Est égale à ' + h + '» — неполный ответ: ' + h + ' чего? Нужно «' + h + ' cm».',
      concl: 'Вычисление оборвано на квадрате длины: сама длина не найдена, на вопрос не отвечено. Нужны корень и фраза-ответ: «La longueur ' + c.bc + ' est égale à ' + h + ' cm».',
      none: 'В записи есть всё: условие («est rectangle en…»), название теоремы, равенство, вычисление и фраза-ответ с единицей. Так и пишут на экзамене.' };
    order = 'Полная запись: условие → название теоремы → равенство → вычисление → фраза-ответ с единицей.';
  } else if (kind === 1) {          /* Thalès: a length */
    const p = r.ri(2, 5), k = r.ri(2, 3), q = r.ri(3, 7), sec = 'Les droites (' + c.b + c.x + ') et (' + c.c + c.y + ') sont sécantes en ' + c.a, par = 'les droites (' + c.bc + ') et (' + c.xy + ') sont parallèles';
    const eq = '$$' + lgFrac(c.ab, c.a + c.x) + '=' + lgFrac(c.bc, c.xy) + '$$', num = '$$' + lgFrac(p, k * p) + '=' + lgFrac(q, c.xy) + '$$', thm = 'D’après le théorème de Thalès, on a : ' + eq + '.', calc = 'Donc ' + num + ' et $' + c.xy + '=' + q + '*' + k * p + '÷' + p + '=' + k * q + '$.', end = 'La longueur ' + c.xy + ' est égale à ' + k * q + ' cm.';
    parts = { none: [sec + ' et ' + par + '.', thm, calc, end], cond: [sec + '.', thm, calc, end], thm: [sec + ' et ' + par + ', donc ' + eq + '.', calc, end], calc: [sec + ' et ' + par + '.', thm, end], unit: [sec + ' et ' + par + '.', thm, calc, 'La longueur ' + c.xy + ' est égale à ' + k * q + '.'], concl: [sec + ' et ' + par + '.', thm, 'Donc ' + num + '.'] };
    lab = { cond: 'Не сказано, что прямые параллельны: это условие теоремы.', thm: 'Не названа теорема, на которую опирается равенство.', calc: 'Нет вычисления: ответ появляется без чисел.', unit: 'Во фразе-ответе нет единицы измерения.', concl: 'Нет вывода: длина так и не названа.' };
    why = { cond: 'Теорема Фалеса работает только при параллельных прямых. Поэтому в условии пишут: «…et les droites (' + c.bc + ') et (' + c.xy + ') sont parallèles».',
      thm: 'Равенство отношений нужно обосновать: «d’après le théorème de Thalès». Без названия теоремы обоснование неполное.',
      calc: 'Между равенством с буквами и ответом должны стоять числа и вычисление: по ним видно, как получен результат.',
      unit: 'Длина — величина с единицей. «Est égale à ' + k * q + '» — неполный ответ: нужно «' + k * q + ' cm».',
      concl: 'Запись оборвана на равенстве с числами: длина ' + c.xy + ' не найдена, на вопрос не отвечено.',
      none: 'В записи есть всё: условие (пересекающиеся и параллельные прямые), название теоремы, равенство, вычисление и фраза-ответ с единицей.' };
    order = 'Полная запись: условие → название теоремы → равенство → вычисление → фраза-ответ с единицей.';
  } else if (kind === 2) {          /* the converse of Pythagoras */
    const [p, q, h] = r.pick(LG_TRIPLES), eq = '$' + c.bc + '^2=' + c.ab + '^2+' + c.ac + '^2$', lng = 'Dans le triangle ' + c.t + ', le plus long côté est [' + c.bc + '].';
    const calc = 'D’une part, $' + c.bc + '^2=' + h + '^2=' + h * h + '$. D’autre part, $' + c.ab + '^2+' + c.ac + '^2=' + p + '^2+' + q + '^2=' + h * h + '$.', end = 'D’après la réciproque du théorème de Pythagore, le triangle ' + c.t + ' est rectangle en ' + c.a + '.';
    parts = { none: [lng, calc, 'Donc ' + eq + '.', end], cond: [calc, 'Donc ' + eq + '.', end], thm: [lng, calc, 'Donc ' + eq + ' : le triangle ' + c.t + ' est rectangle en ' + c.a + '.'], calc: [lng, 'On a ' + eq + '.', end], concl: [lng, calc, 'Donc ' + eq + '.'] };
    lab = { cond: 'Не сказано, какая сторона самая длинная.', thm: 'Не названа теорема, по которой сделан вывод.', calc: 'Нет вычислений: равенство не проверено числами.', concl: 'Нет вывода о треугольнике.' };
    why = { cond: 'Гипотенузой может быть только самая длинная сторона, поэтому сначала её называют: именно её квадрат сравнивают с суммой квадратов двух других.',
      thm: 'Из равенства квадратов вывод «треугольник прямоугольный» делают по обратной теореме Пифагора — её нужно назвать: «d’après la réciproque du théorème de Pythagore».',
      calc: 'Равенство ' + eq + ' нужно проверить числами: отдельно посчитать квадрат самой длинной стороны и сумму квадратов двух других («D’une part…, d’autre part…»).',
      concl: 'Запись оборвана на равенстве: не сказано, что из него следует. Нужен вывод: «le triangle ' + c.t + ' est rectangle en ' + c.a + '».',
      none: 'В записи есть всё: самая длинная сторона, два вычисления, равенство, название теоремы и вывод с вершиной прямого угла.' };
    order = 'Полная запись: самая длинная сторона → два вычисления → равенство → название теоремы и вывод.';
  } else {          /* a probability */
    const k = r.ri(3, 7), n = k * r.ri(2, 4) + r.ri(1, 2), data = 'Le sac contient ' + n + ' boules, dont ' + k + ' boules rouges.', equi = 'Toutes les boules ont la même probabilité d’être tirées.', end = 'Donc la probabilité de tirer une boule rouge est égale à $' + k + '/' + n + '$.';
    parts = { none: [data, equi, end], cond: [data, end], calc: [equi, end], concl: [data, equi] };
    lab = { cond: 'Не сказано, что все шары вытаскивают с одинаковой вероятностью.', calc: 'Не сказано, сколько шаров в мешке и сколько из них красных.', concl: 'Нет вывода: вероятность так и не названа.' };
    why = { cond: 'Делить число благоприятных исходов на число всех можно только тогда, когда исходы равновозможны. Поэтому в обосновании пишут: «Toutes les boules ont la même probabilité d’être tirées».',
      calc: 'Дробь появилась без объяснения: сначала нужно назвать, сколько всего шаров и сколько из них красных.',
      concl: 'Данные названы, а на вопрос не отвечено: нужна фраза «La probabilité de tirer une boule rouge est égale à…».',
      none: 'В записи есть всё: данные, условие равновозможности и фраза-ответ.' };
    order = 'Полная запись: данные → условие равновозможности → фраза-ответ.';
  }
  const ks = Object.keys(lab), miss = r() < 0.15 ? 'none' : r.pick(ks), oth = r.sh(ks.filter(k => k !== miss && !(miss === 'concl' && k === 'unit'))).slice(0, miss === 'none' ? 3 : 2);          /* no answer sentence at all: «no unit in it» would be true as well */
  return { q: lgT('Ученик записал: «' + parts[miss].join(' ') + '» Чего не хватает в этой записи?'), ans: lgMQ(r, [miss === 'none' ? none : lab[miss]].concat(oth.map(k => lab[k]), miss === 'none' ? [] : [none]), 0), sol: [why[miss], order] };
}
/* the question of the statement and the result of the calculation → the right answer sentence */
const LG_ANS = [
  (c, r) => { const [T, v] = r.pick([[1000, 65], [500, 48], [750, 34], [1200, 70], [900, 52]]), k = Math.floor(T / v); return { fr: 'Combien de boules peut-on fabriquer au maximum ?', got: 'Вычисление: $' + T + '÷' + v + '≈' + fx(T / v, 2) + '$.',
    ok: 'On peut fabriquer au maximum ' + k + ' boules.', bad: ['On peut fabriquer au maximum ' + (k + 1) + ' boules.', 'On peut fabriquer au maximum ' + nf(T / v, 2) + ' boules.', 'On peut fabriquer au minimum ' + k + ' boules.'],
    sol: ['«Au maximum» — «самое большее». Шаров — целое число, и на ' + (k + 1) + '-й материала уже не хватит: округляем вниз, до ' + k + '.', 'Дробного числа шаров не бывает. А «au minimum» — «самое меньшее» — меняет смысл на обратный.'] }; },
  (c, r) => { const b = 2 * r.ri(2, 6), h = r.ri(3, 9), s = b * h / 2; return { fr: 'Calculer l’aire du triangle ' + c.t + '.', got: 'Вычисление: $' + b + '*' + h + '÷2=' + s + '$ (длины даны в сантиметрах).',
    ok: 'L’aire du triangle ' + c.t + ' est égale à ' + s + ' cm².', bad: ['L’aire du triangle ' + c.t + ' est égale à ' + s + ' cm.', 'Le périmètre du triangle ' + c.t + ' est égal à ' + s + ' cm².', 'L’aire du triangle ' + c.t + ' est égale à ' + s + '.'],
    sol: ['Фраза-ответ повторяет слова вопроса («l’aire du triangle…») и заканчивается числом с единицей. Площадь измеряют в квадратных единицах: cm².', 'В остальных вариантах стоит единица длины вместо единицы площади, названа другая величина («le périmètre») или единицы нет совсем.'] }; },
  (c, r) => { const [d, v, h, dec, mn] = r.pick([[45, 20, 2, 25, 15], [30, 12, 2, 5, 30], [63, 36, 1, 75, 45], [50, 40, 1, 25, 15], [54, 12, 4, 5, 30]]); return { fr: 'Quelle est la durée du trajet ?', got: 'Вычисление: $' + d + '÷' + v + '=' + h + '.' + dec + '$ — это часы.',
    ok: 'Le trajet dure ' + h + ' h ' + mn + ' min.', bad: ['Le trajet dure ' + h + ' h ' + (dec === 5 ? 50 : dec) + ' min.', 'Le trajet dure ' + h + ',' + dec + ' km.', 'La vitesse moyenne est de ' + h + ',' + dec + ' km/h.'],
    sol: ['Спрашивают «la durée» — длительность: ответ в единицах времени. ' + h + ',' + dec + ' часа — это ' + h + ' ч и ' + mn + ' мин: доля часа после запятой — не готовые минуты, её умножают на 60.', 'В двух других вариантах число верное, но названа не та величина: километры — это расстояние, km/h — скорость.'] }; },
  (c, r) => { const P = r.pick([40, 60, 80, 120, 200]), p = r.pick([10, 20, 25, 30]), d = P * p / 100; return { fr: 'Quel est le prix de l’article après la réduction ?', got: 'Вычисления: скидка $' + p + '/100*' + P + '=' + d + '$, затем $' + P + '-' + d + '=' + (P - d) + '$.',
    ok: 'Après la réduction, l’article coûte ' + (P - d) + ' €.', bad: ['Après la réduction, l’article coûte ' + d + ' €.', 'La réduction est de ' + (P - d) + ' €.', 'Après la réduction, l’article coûte ' + (P - d) + ' %.'],
    sol: ['Спрашивают цену после скидки («après la réduction») — это ' + (P - d) + ' €. А ' + d + ' € — сама скидка, а не новая цена.', 'Цена измеряется в евро: знак «%» после неё — ошибка. Проценты были только в условии.'] }; },
  (c, r) => { const n = r.ri(8, 15), a = n * r.ri(5, 7), b = a - r.ri(4, 12); return { fr: 'Le tarif B est-il plus avantageux que le tarif A pour ' + n + ' voyages ?', got: 'Вычисления: по тарифу A — ' + a + ' €, по тарифу B — ' + b + ' €.',
    ok: 'Oui, car $' + b + '<' + a + '$ : le tarif B coûte moins cher.', bad: ['Non, car $' + b + '<' + a + '$ : le tarif B coûte moins cher.', 'Oui, car $' + a + '>' + b + '$ : le tarif A coûte moins cher.', 'Le tarif B coûte ' + b + ' €.'],
    sol: ['«Plus avantageux» — «выгоднее», то есть дешевле. На вопрос с «est-il… ?» отвечают «oui» или «non» и после «car» приводят довод — сравнение двух цен.', 'Фраза «Le tarif B coûte ' + b + ' €» верна, но на вопрос не отвечает: в ней нет ни «oui», ни «non», ни сравнения. В двух других вариантах слово в начале противоречит доводу после него.'] }; },
  (c, r) => { const [k, n, s] = r.pick([[4, 20, '1/5'], [3, 12, '1/4'], [5, 15, '1/3'], [6, 16, '3/8'], [4, 10, '2/5']]); return { fr: 'Quelle est la probabilité de tirer une boule bleue ?', got: 'В мешке ' + n + ' шаров, из них ' + k + ' синих; вытащить можно любой с одинаковой вероятностью.',
    ok: 'La probabilité de tirer une boule bleue est égale à $' + k + '/' + n + '$, c’est-à-dire $' + s + '$.', bad: ['La probabilité de tirer une boule bleue est égale à ' + k + '.', 'La probabilité de tirer une boule bleue est égale à $' + n + '/' + k + '$.', 'Il y a ' + k + ' boules bleues sur ' + n + ' boules.'],
    sol: ['Вероятность — число от 0 до 1: число благоприятных исходов делят на число всех. Единицы у неё нет, а дробь сокращают: $' + k + '/' + n + '=' + s + '$.', 'Число ' + k + ' — это количество синих шаров, а не вероятность; $' + n + '/' + k + '$ больше 1 — такой вероятности не бывает. Фраза «Il y a…» верна, но на вопрос о вероятности не отвечает.'] }; },
  (c, r) => { const [v, a] = r.pick([[48.59, 49], [36.87, 37], [53.13, 53], [22.62, 23], [67.38, 67]]), ang = lgAng(c.a + c.b + c.c); return { fr: 'Calculer la mesure de l’angle ' + ang + '. Arrondir au degré.', got: 'На калькуляторе: ' + nf(v, 2) + '…',
    ok: 'L’angle ' + ang + ' mesure environ ' + a + '°.', bad: ['L’angle ' + ang + ' mesure environ ' + nf(v, 1) + '°.', 'L’angle ' + ang + ' mesure environ ' + a + ' cm.', 'L’angle ' + ang + ' mesure exactement ' + a + '°.'],
    sol: ['«Arrondir au degré» — до целого числа градусов: ' + a + '°. Значение приближённое, поэтому во фразе стоит «environ» — «приблизительно».', '«Exactement» — «точно» — здесь неправда: ' + a + '° получилось после округления. Угол измеряют в градусах, а не в сантиметрах.'] }; },
  (c, r) => { const [N, s] = r.pick([[130, 48], [95, 30], [170, 52], [140, 55]]), k = Math.ceil(N / s); return { fr: 'Combien de bus faut-il réserver au minimum pour transporter les ' + N + ' élèves ?', got: 'Мест в одном автобусе: ' + s + '. Вычисление: $' + N + '÷' + s + '≈' + fx(N / s, 2) + '$.',
    ok: 'Il faut réserver au minimum ' + k + ' bus.', bad: ['Il faut réserver au minimum ' + (k - 1) + ' bus.', 'Il faut réserver au minimum ' + nf(N / s, 2) + ' bus.', 'Il faut réserver au maximum ' + k + ' bus.'],
    sol: ['Автобусов — целое число, и ' + (k - 1) + ' не хватит: в них поместится только ' + (k - 1) * s + ' человек. Округляем вверх: ' + k + '.', 'Сравни с вопросом «Combien… peut-on fabriquer au maximum ?» — там округляют вниз. Слова «au minimum» и «au maximum» подсказывают, в какую сторону.'] }; },
  (c, r) => { const A = r.pick([20, 40, 50, 80]), p = r.pick([10, 20, 30]), d = A * p / 100; return { fr: 'Quel est le pourcentage d’augmentation du prix ?', got: 'Цена выросла с ' + A + ' € до ' + (A + d) + ' €. Вычисление: $' + d + '÷' + A + '=' + fx(p / 100) + '$.',
    ok: 'Le prix a augmenté de ' + p + ' %.', bad: ['Le prix a augmenté de ' + nf(p / 100) + ' %.', 'Le prix a augmenté de ' + d + ' %.', 'Le prix a augmenté de ' + p + ' €.'],
    sol: ['Спрашивают «le pourcentage» — процент: ' + nf(p / 100) + ' — это ' + p + ' сотых, то есть ' + p + ' %.', 'Число ' + d + ' — рост в евро, а не в процентах. В двух других вариантах верные цифры стоят с неверным знаком.'] }; },
  (c, r) => { const t = r.ri(2, 4), v = r.pick([12, 15, 18, 20, 24]); return { fr: 'Quelle est la vitesse moyenne du cycliste ?', got: 'Он проехал ' + v * t + ' км за ' + t + ' ч. Вычисление: $' + v * t + '÷' + t + '=' + v + '$.',
    ok: 'La vitesse moyenne du cycliste est de ' + v + ' km/h.', bad: ['La vitesse moyenne du cycliste est de ' + v + ' km.', 'La vitesse moyenne du cycliste est de ' + v + ' h.', 'La durée du trajet est de ' + v + ' km/h.'],
    sol: ['Скорость — расстояние, делённое на время: километры делят на часы, единица — km/h («kilomètres par heure»).', '«km» — единица расстояния, «h» — времени. А «la durée» — длительность: её в km/h не измеряют.'] }; }];

topic({ id: 'lg.redaction', ch: 'lg', lvl: 1, calc: false, variants: 4,
  ru: 'Запись решения по-французски', fr: 'Rédiger une réponse : les phrases types',
  hints: [
    'Запись решения в Partie 2 строится по одной схеме: на что опираемся — вычисление — фраза-ответ. Нужна каждая часть: без названия теоремы, без вычисления или без ответа с единицей решение неполное.',
    'У теоремы есть условие, и его пишут первым: «Le triangle ABC est rectangle en A» — для Пифагора, «Les droites (BC) et (DE) sont parallèles» — для Фалеса. Затем — «D’après le théorème de…, on a : …».',
    'Фраза-ответ повторяет слова вопроса и заканчивается числом с единицей: «La longueur BC est égale à 10 cm.» Если спросили «est-il… ?», ответ начинается с «Oui» или «Non», а за ним идёт «car…».'],
  gen(r, vi) {
    const c = lgCtx(r);
    if (vi === 0) { const it = r.pick(LG_RED)(c, r); return { q: lgSay(it.fr, 'Что нужно на месте пропуска?'), ans: lgMQ(r, [it.ok].concat(it.bad), 0), sol: it.sol }; }
    if (vi === 1) { const it = r.pick(LG_REDORD)(c, r); return { q: lgOrdQ(it.aim, 'de la rédaction', 'записи решения'), ans: ORD(r, it.steps), sol: it.sol }; }
    if (vi === 2) return lgMissing(c, r);
    const it = r.pick(LG_ANS)(c, r);
    return { q: lgT('Вопрос задания: «' + it.fr + '» ' + it.got + ' Какая фраза-ответ верна?'), ans: lgMQ(r, [lgT(it.ok)].concat(it.bad.map(lgT)), 0), sol: it.sol };
  } });

/* ===================== THE QUESTIONS: combien, de combien, par combien, quel, lequel, est-il… ? ===================== */
/* [family (1 — the «combien» family, 0 — the others), what is asked and what the answer will be, why, phrases] */
const LG_QW = [
  [1, 'Сколько? Ответ — количество.', '«Combien de…» — «сколько…»: после «de» названо то, что считают. Ответ — количество.',
    [() => 'Combien d’élèves ne participent pas à cette sortie ?', () => 'Combien de boules bleues ont été ajoutées dans le sac ?', c => 'Combien de personnes gagnent plus de ' + nf(c.m * 100) + ' € ?']],
  [1, 'На сколько? Ответ — разность двух значений.', '«De combien…» — «на сколько…»: предлог «de» перед «combien» спрашивает разницу — на сколько одно значение больше или меньше другого.',
    [() => 'De combien d’euros le prix a-t-il augmenté ?', () => 'De combien de degrés la température a-t-elle baissé ?', () => 'De combien de points la moyenne de la classe a-t-elle augmenté ?']],
  [1, 'На какое число? Ответ — множитель или делитель.', '«Par combien…», «par quel nombre…» — «на какое число…»: после «multiplier» и «diviser» предлог «par» значит «на». Ответ — множитель или делитель.',
    [() => 'Par combien le prix a-t-il été multiplié ?', c => 'Par quel nombre faut-il multiplier ' + c.n + ' pour obtenir ' + c.n * c.m + ' ?', () => 'Par combien faut-il diviser la longueur pour obtenir la largeur ?']],
  [1, 'Сколько времени это занимает? Ответ — длительность.', '«En combien de temps», «pendant combien de temps», «combien de temps» — «за какое время», «как долго»: ответ — длительность, например 2 h 30 min.',
    [c => 'En combien de temps le cycliste parcourt-il ' + c.m + ' km ?', () => 'Combien de temps dure le trajet ?', c => 'Pendant combien de temps la hauteur d’eau a-t-elle été supérieure à ' + c.n + ' m ?']],
  [1, 'В котором часу? Ответ — время на часах.', '«À quelle heure…» — «в котором часу…»: ответ — время на часах, например 16 h 40. Это не длительность: о ней спрашивают словами «combien de temps».',
    [() => 'À quelle heure le train arrive-t-il ?', () => 'À quelle heure la hauteur d’eau est-elle maximale ?', c => 'À quelle heure ' + c.who + ' doit-' + c.il + ' partir pour arriver à 8 h ?']],
  [1, 'Начиная со скольких? Ответ — наименьшее подходящее число.', '«À partir de combien de…» — «начиная со скольких…»: спрашивают границу — наименьшее число, начиная с которого условие выполняется.',
    [() => 'À partir de combien de voyages le tarif B devient-il plus avantageux que le tarif A ?', () => 'À partir de combien de demi-journées le tarif C devient-il plus avantageux que le tarif B ?', () => 'À partir de combien de mois l’offre A devient-elle plus intéressante que l’offre B ?']],
  [1, 'Через сколько? Ответ — сколько пройдёт до этого момента.', '«Au bout de combien de…» — «через сколько…» («le bout» — конец): сколько времени пройдёт, прежде чем это случится.',
    [() => 'Au bout de combien de mois paie-t-on le même prix avec les deux offres ?', () => 'Au bout de combien de minutes les deux coureurs se rejoignent-ils ?', c => 'Au bout de combien de jours la plante mesure-t-elle ' + c.m + ' cm ?']],
  [0, 'Каков, какова? Ответ — значение названной величины.', '«Quel est…», «Quelle est…» — «каков…, какова…»: спрашивают значение величины, названной сразу после (цена, длина, сумма).',
    [c => 'Quel est le prix pour ' + c.m + ' demi-journées avec le tarif B ?', () => 'Quelle est la longueur du rectangle ?', () => 'Quel est le montant du salaire le plus élevé ?']],
  [0, 'Который из них? Ответ — один из названных вариантов.', '«Lequel», «laquelle» — «который, которая из…»: нужно выбрать один из названных вариантов и указать его. В Partie 2 выбор обосновывают.',
    [c => 'Parmi les deux représentations graphiques, laquelle représente la fonction ' + c.f + ' ?', c => 'Au bout de ' + c.m + ' mois, laquelle des deux offres est la plus intéressante ?', () => 'Lequel de ces nombres est divisible par 9 ?']],
  [0, 'Так ли это? Ответ — «oui» или «non» с обоснованием.', 'Глагол стоит перед подлежащим («peut-on», «est-il», «sont-ils», «a-t-elle»): на такой вопрос отвечают «oui» или «non». В Partie 2 сразу после этого пишут обоснование — «car…».',
    [c => 'Peut-on constituer ' + c.m + ' sachets ?', c => 'Est-il vrai que plus de ' + c.n * 10 + ' % des élèves viennent au collège à vélo ?', c => c.who + ' affirme que le triangle ' + c.t + ' est rectangle. A-t-' + c.il + ' raison ?', c => 'Les points ' + c.a + ', ' + c.b + ' et ' + c.x + ' sont-ils alignés ?', () => 'La droite (d) représente-t-elle une situation de proportionnalité ?']],
  [0, 'Почему? Ответ — объяснение: на что опирается утверждение.', '«Pourquoi…» — «почему…»: само утверждение уже дано и сомнению не подлежит, спрашивают причину. Оборот «peut-on affirmer que» здесь не вопрос «можно ли»: главное слово — «pourquoi».',
    [c => 'Pourquoi peut-on affirmer que les droites (' + c.bc + ') et (' + c.xy + ') sont parallèles ?', c => 'Pourquoi le triangle ' + c.t + ' est-il isocèle ?']]];
const LG_QWK = ['«combien de…»', '«de combien…»', '«par combien…»', '«en combien de temps…»', '«à quelle heure…»', '«à partir de combien de…»', '«au bout de combien de…»', '«quel est…»', '«lequel…», «laquelle…»', '«est-il… ?», «peut-on… ?»', '«pourquoi…»'];          /* the key words of LG_QW, in the same order */
const lgLow = s => s.charAt(0).toLowerCase() + s.slice(1);
/* the same data, four different questions: each answer option answers one of them */
function lgSameData(r) {
  const t = r.ri(0, 2); let ctx, qa;
  if (t === 0) {
    const [A, p] = r.pick([[20, 10], [20, 20], [20, 25], [20, 50], [40, 10], [40, 20], [40, 25], [40, 50], [50, 10], [50, 20], [50, 50], [80, 10], [80, 20], [80, 25], [80, 50]]), d = A * p / 100;
    ctx = 'Le prix d’un article passe de ' + A + ' € à ' + (A + d) + ' €.';
    qa = [['De combien d’euros le prix a-t-il augmenté ?', d + ' €', '«De combien d’euros… ?» — «на сколько евро?»: спрашивают разность новой и старой цены.'],
      ['Par combien le prix a-t-il été multiplié ?', nf(1 + p / 100), '«Par combien… a-t-il été multiplié ?» — «на какое число умножили?»: новую цену делят на старую.'],
      ['De quel pourcentage le prix a-t-il augmenté ?', p + ' %', '«De quel pourcentage… ?» — «на сколько процентов?»: рост делят на старую цену и выражают в процентах.'],
      ['Quel est le nouveau prix ?', A + d + ' €', '«Quel est le nouveau prix ?» — «какова новая цена?»: она названа в условии после «à» («passe de… à…» — «переходит от… к…»).']];
  } else if (t === 1) {
    const [h1, m1, h2, m2, dist, v, dur] = r.pick([[14, 10, 16, 40, 300, 120, '2 h 30 min'], [9, 15, 11, 45, 200, 80, '2 h 30 min'], [7, 30, 9, 30, 180, 90, '2 h'], [13, 20, 16, 20, 270, 90, '3 h'], [8, 5, 10, 35, 150, 60, '2 h 30 min']]);
    const dep = h1 + ' h ' + lgP2(m1), arr = h2 + ' h ' + lgP2(m2);
    ctx = 'Un train part à ' + dep + ', arrive à ' + arr + ' et parcourt ' + dist + ' km.';
    qa = r.sh([['Combien de temps dure le trajet ?', dur, '«Combien de temps… ?» — «сколько времени?»: спрашивают длительность — от отправления до прибытия.'],
      ['À quelle heure le train arrive-t-il ?', arr, '«À quelle heure… arrive-t-il ?» — «в котором часу прибывает?»: ответ — время на часах, оно стоит в условии после «arrive à».'],
      ['À quelle heure le train part-il ?', dep, '«À quelle heure… part-il ?» — «в котором часу отправляется?»: «partir» — уезжать, отправляться.'],
      ['Quelle distance le train parcourt-il ?', dist + ' km', '«Quelle distance… ?» — «какое расстояние?»: «parcourir» — проезжать.'],
      ['Quelle est la vitesse moyenne du train ?', v + ' km/h', '«Quelle est la vitesse moyenne ?» — «какова средняя скорость?»: расстояние делят на длительность.']]).slice(0, 4);
  } else {
    const [N, K] = r.pick([[20, 5], [25, 10], [30, 12], [20, 8], [24, 6], [25, 5], [30, 6]]);
    ctx = 'Dans une classe de ' + N + ' élèves, ' + K + ' élèves viennent au collège à vélo.';
    qa = [['Combien d’élèves ne viennent pas au collège à vélo ?', String(N - K), '«Combien d’élèves ne viennent pas… ?» — «сколько учеников не приезжают?»: отрицание «ne… pas» меняет вопрос — из всех учеников вычитают велосипедистов.'],
      ['Combien d’élèves viennent au collège à vélo ?', String(K), '«Combien d’élèves viennent… ?» — «сколько учеников приезжают?»: это число прямо дано в условии.'],
      ['Quel pourcentage des élèves viennent au collège à vélo ?', 100 * K / N + ' %', '«Quel pourcentage… ?» — «какой процент?»: долю велосипедистов выражают в процентах.'],
      ['Quelle est la fréquence des élèves qui viennent à vélo ? Donner une fraction irréductible.', '$' + Fr.str(F(K, N)) + '$', '«La fréquence» — частота, доля: число велосипедистов делят на число всех учеников; «fraction irréductible» — несократимая дробь.']];
  }
  const k = r.ri(0, 3), rest = qa.filter((_, i) => i !== k);
  return { q: lgSay(ctx + ' ' + qa[k][0], 'Какой ответ подходит к этому вопросу?'), opts: [qa[k][1]].concat(rest.map(x => x[1])),
    sol: [qa[k][2], lgT('Остальные варианты — ответы на другие вопросы о тех же данных: ' + rest.map(x => x[1] + ' — «' + x[0] + '»').join('; ') + '.')] };
}
/* yes/no questions: «Oui» or «Non», then «car» and a reason that is true and supports that very word */
const LG_OUI = 'На вопрос с перестановкой глагола («peut-on… ?», «a-t-il raison ?», «est-il vrai que… ?») отвечают «Oui» или «Non», а после «car» дают довод. Довод должен быть верным и подтверждать именно это слово.';
const LG_YN = [
  (c, r) => { const n = r.pick([6, 8, 12, 16]), yes = r() < 0.5, A = n * r.ri(5, 9), B = n * r.ri(4, 9) + (yes ? 0 : n / 2);
    const both = A + ' et ' + B + ' sont tous les deux divisibles par ' + n + '.', notB = B + ' n’est pas divisible par ' + n + '.';
    return { fr: 'Peut-on constituer ' + n + ' sachets identiques avec ' + A + ' bonbons à la fraise et ' + B + ' bonbons au caramel ?', got: 'Вычисления: $' + A + '÷' + n + '=' + A / n + '$ и $' + B + '÷' + n + '=' + fx(B / n) + '$.',
      ok: yes ? 'Oui, car ' + both : 'Non, car ' + notB,
      bad: yes ? ['Non, car ' + both, 'Oui, car ' + n + ' est divisible par ' + A + ' et par ' + B + '.', 'Non, car ' + notB] : ['Oui, car ' + A + ' est divisible par ' + n + '.', 'Oui, car ' + notB, 'Non, car ' + A + ' n’est pas divisible par ' + n + '.'],
      sol: [LG_OUI, yes ? 'Пакеты одинаковые, значит, на ' + n + ' должны делиться и клубничные, и карамельные конфеты. Оба деления дают целое число — ответ «Oui». Во фразе «' + n + ' est divisible par ' + A + '» делимое и делитель переставлены: «' + A + ' est divisible par ' + n + '» значит «' + A + ' делится на ' + n + '».'
        : 'Карамельные конфеты на ' + n + ' пакетов поровну не делятся: ' + nf(B / n) + ' — не целое число. Этого достаточно для ответа «Non». Вариант «Oui, car ' + A + ' est divisible par ' + n + '» проверяет только одно из двух условий.'] }; },
  (c, r) => { const yes = r() < 0.5, [p, q, h, s, hh] = yes ? r.pick(LG_TRIPLES).concat([0, 0]) : r.pick(LG_NOTR), S = yes ? h * h : s, H = yes ? h * h : hh;
    const eq = '$' + c.bc + '^2=' + c.ab + '^2+' + c.ac + '^2$', ne = '$' + c.bc + '^2≠' + c.ab + '^2+' + c.ac + '^2$', o = 'Oui, ' + c.il + ' a raison, car ', n = 'Non, ' + c.il + ' n’a pas raison, car ';
    return { fr: c.who + ' affirme que le triangle ' + c.t + ' est rectangle en ' + c.a + '. A-t-' + c.il + ' raison ?', got: 'Вычисления: $' + c.bc + '^2=' + H + '$ и $' + c.ab + '^2+' + c.ac + '^2=' + S + '$.',
      ok: (yes ? o + eq : n + ne) + '.', bad: (yes ? [n + eq, o + ne, n + ne] : [o + ne, n + eq, o + eq]).map(x => x + '.'),
      sol: [LG_OUI, '«A-t-' + c.il + ' raison ?» — «прав' + (c.il === 'il' ? ' ли он' : 'а ли она') + '?» («avoir raison» — быть правым). Числа ' + (yes ? 'равны — по обратной теореме Пифагора треугольник прямоугольный' : 'не равны — треугольник не прямоугольный') + '. Ответ строят так: «Oui, ' + c.il + ' a raison, car…» или «Non, ' + c.il + ' n’a pas raison, car…».'] }; },
  (c, r) => { const k = r.ri(2, 9), b = r.ri(1, 9), lin = r() < 0.5;
    return { fr: 'La fonction ' + c.f + ' représente-t-elle une situation de proportionnalité ?', got: 'Дано: $' + c.f + '(x)=' + k + 'x' + (lin ? '' : '+' + b) + '$.',
      ok: lin ? 'Oui, car c’est une fonction linéaire.' : 'Non, car elle n’est pas linéaire.',
      bad: lin ? ['Non, car c’est une fonction linéaire.', 'Oui, car c’est une fonction affine.', 'Non, car elle n’est pas linéaire.'] : ['Oui, car elle n’est pas linéaire.', 'Non, car c’est une fonction linéaire.', 'Oui, car c’est une fonction affine.'],
      sol: [LG_OUI, 'Пропорциональность описывают только функции вида $' + k + 'x$ — «fonctions linéaires». ' + (lin ? 'Здесь именно такая. ' : 'Здесь есть слагаемое ' + b + ', поэтому функция не «linéaire». ') + 'Довод «c’est une fonction affine» не годится: «affine» — любая функция вида $ax+b$, а из них пропорциональность дают только те, где $b=0$.'] }; },
  (c, r) => { const p = r.pick([20, 30, 40]), d = r.ri(3, 9), yes = r() < 0.5, q = yes ? p + d : p - d, sup = q + ' % est supérieur à ' + p + ' %.', inf = q + ' % est inférieur à ' + p + ' %.';
    return { fr: 'Est-il vrai que plus de ' + p + ' % des élèves viennent au collège à vélo ?', got: 'Вычисление: на велосипеде приезжают ' + q + ' % учеников.',
      ok: yes ? 'Oui, c’est vrai, car ' + sup : 'Non, c’est faux, car ' + inf,
      bad: yes ? ['Non, c’est faux, car ' + sup, 'Oui, c’est vrai, car ' + inf, 'Non, c’est faux, car ' + inf] : ['Oui, c’est vrai, car ' + inf, 'Non, c’est faux, car ' + sup, 'Oui, c’est vrai, car ' + sup],
      sol: [LG_OUI, '«Plus de ' + p + ' %» — «больше ' + p + ' %». Получилось ' + q + ' % — это ' + (yes ? 'больше' : 'меньше') + ', поэтому утверждение ' + (yes ? 'верно: «c’est vrai»' : 'неверно: «c’est faux»') + '. «Supérieur à» — «больше, чем», «inférieur à» — «меньше, чем».'] }; },
  (c, r) => { const [N, s, yes] = r.pick([[2025, 9, 1], [2026, 10, 0], [1242, 9, 1], [1243, 10, 0], [5112, 9, 1], [4321, 10, 0], [3456, 18, 1], [3457, 19, 0]]), is = 'la somme de ses chiffres, ' + s + ', est divisible par 9.', isnt = 'la somme de ses chiffres, ' + s + ', n’est pas divisible par 9.';
    return { fr: 'Le nombre ' + N + ' est-il divisible par 9 ?', got: 'Сумма цифр числа: ' + s + '.',
      ok: yes ? 'Oui, car ' + is : 'Non, car ' + isnt,
      bad: yes ? ['Non, car ' + is, 'Oui, car ' + isnt, 'Oui, car ' + N + ' est supérieur à 9.'] : ['Oui, car ' + isnt, 'Non, car ' + is, 'Non, car ' + N + ' ne se termine pas par 9.'],
      sol: [LG_OUI, 'Признак делимости на 9: число делится на 9, если сумма его цифр делится на 9. Сумма равна ' + s + ' — ' + (yes ? 'делится' : 'не делится') + '. Последняя цифра и величина числа о делимости на 9 ничего не говорят: такой довод, даже если он верен сам по себе, ответа не обосновывает.'] }; }];

topic({ id: 'lg.questions', ch: 'lg', lvl: 1, calc: false, variants: 3,
  ru: 'Вопросы: о чём спрашивают', fr: 'Les questions : combien, quel, lequel, est-il… ?',
  hints: [
    'Вопросительное слово говорит, каким будет ответ. Найди его: «combien», «quel», «lequel», «pourquoi» — или перестановку глагола и подлежащего («est-il», «peut-on»), которая означает вопрос «да или нет?».',
    'Семья «combien»: «combien de…» — сколько; «de combien…» — на сколько; «par combien…» — на какое число; «en combien de temps…» — за какое время; «au bout de combien de…» — через сколько; «à partir de combien de…» — начиная со скольких. Смысл меняет маленький предлог перед «combien».',
    '«À quelle heure… ?» — время на часах (16 h 40); «combien de temps… ?» — длительность (2 h 30 min). На вопросы «est-il… ?», «peut-on… ?», «a-t-elle raison ?» ответ начинается с «Oui» или «Non», а потом идёт «car…».'],
  gen(r, vi) {
    const c = lgCtx(r);
    if (vi === 0) {          /* the question word → what is asked and what the answer will be */
      const me = r.pick(LG_QW), same = LG_QW.filter(x => x !== me && x[0] === me[0]), other = LG_QW.filter(x => x !== me && x[0] !== me[0]);
      const bad = me[0] ? r.sh(same).slice(0, 3) : r.sh(same).slice(0, 2).concat(r.sh(other).slice(0, 1));
      return { q: lgSay(r.pick(me[3])(c, r), 'О чём этот вопрос и каким будет ответ?'), ans: lgMQ(r, [me[1]].concat(bad.map(x => x[1])), 0), sol: [me[2], 'Не путай с похожими вопросами: ' + bad.map(x => LG_QWK[LG_QW.indexOf(x)] + ' — ' + lgLow(x[1].split('?')[0])).join('; ') + '.'] };
    }
    if (vi === 1) { const it = lgSameData(r); return { q: it.q, ans: lgMQ(r, it.opts, 0), sol: it.sol }; }
    const it = r.pick(LG_YN)(c, r);
    return { q: lgT('Вопрос задания: «' + it.fr + '» ' + it.got + ' Какой ответ записан верно?'), ans: lgMQ(r, [it.ok].concat(it.bad), 0), sol: it.sol };
  } });

/* ===================== FICHE ===================== */
fiche({ ch: 'lg', id: 'lg.mots', ru: 'Слова-команды и формы ответа', fr: 'Les consignes et la forme des réponses', body: [
  'Первое слово задания — команда. «Calculer» — вычислить. «Déterminer» — найти, любым способом (это не «дать определение»). «Justifier» — обосновать. «Montrer que…», «Démontrer que…» — доказать то, что уже написано в задании. «En déduire» — вывести из предыдущего результата. «Vérifier que…» — проверить вычислением.',
  'Выражения: «Développer» — раскрыть скобки, «Factoriser» — разложить на множители, «Réduire» — привести подобные, «Résoudre l’équation» — решить уравнение, «Exprimer en fonction de $x$» — записать выражение с буквой $x$.',
  'Чертёж и график: «Tracer» — начертить, «Construire» — построить, «Placer» — отметить точку, «Lire graphiquement» — прочитать по графику. «La figure n’est pas en vraie grandeur» — измерять по рисунку нельзя.',
  'Форма ответа: «valeur exacte» — точное значение ($9π$, $√20$, $2/3$); «arrondir au dixième» — один знак после запятой, «au centième» — два, «à l’unité» — до целых, «à la dizaine» — до десятков. «Fraction irréductible» — несократимая дробь, «notation scientifique» — стандартный вид, «forme développée et réduite» — без скобок, подобные приведены.',
  'В Partie 2 обосновывают каждый ответ, если не сказано «Aucune justification n’est demandée». Схема записи: что известно («On sait que…») — свойство или теорема («Or…», «D’après…») — вывод («Donc…») — фраза-ответ с единицей.',
  'Связки: «donc» — значит (вводит вывод); «car» — так как (вводит причину, стоит после вывода); «comme» — так как (в начале фразы); «or» — «а известно, что…» (это не «или»: «или» — «ou»); «d’après» — согласно; «c’est-à-dire» — то есть.',
  'Маленькие слова: «au moins» — не меньше (≥), «au plus» — не больше (≤), «dont» — из них, «chacun» — каждый, «par» — на каждый, «de plus que» — на столько-то больше, «fois plus» — во столько-то раз больше; «le double» — в 2 раза больше, «la moitié» — половина, «le tiers» — треть, «le quart» — четверть.',
  'Вопросы: «combien de…» — сколько, «de combien…» — на сколько, «par combien…» — на какое число, «en combien de temps…» — за какое время, «à quelle heure…» — в котором часу. На «est-il… ?», «peut-on… ?», «a-t-elle raison ?» отвечают «Oui» или «Non» и продолжают: «car…».'],
  ex: [['Точное значение и его округление до десятых', '9π≈28.3'], ['Стандартный вид', '0.00458=4.58*10^(-3)'], ['Несократимая дробь', '6/8=3/4'], ['Развёрнутый и приведённый вид', '(x+3)(x-2)=x^2+x-6']],
  frs: [
    'Dans le triangle ABC rectangle en A, d’après le théorème de Pythagore, on a : $BC^2=AB^2+AC^2$.',
    'D’une part, $BC^2=100$. D’autre part, $AB^2+AC^2=100$. Donc $BC^2=AB^2+AC^2$ : d’après la réciproque du théorème de Pythagore, le triangle ABC est rectangle en A.',
    'Comme $BC^2≠AB^2+AC^2$, le triangle ABC n’est pas rectangle.',
    'Les droites (BD) et (CE) sont sécantes en A et les droites (BC) et (DE) sont parallèles. D’après le théorème de Thalès, on a : $$\\dfrac{AB}{AD}=\\dfrac{AC}{AE}=\\dfrac{BC}{DE}$$.',
    'On sait que les droites (AB) et (CD) sont perpendiculaires à la droite (d). Or, si deux droites sont perpendiculaires à une même droite, alors elles sont parallèles. Donc les droites (AB) et (CD) sont parallèles.',
    'Toutes les boules ont la même probabilité d’être tirées. Donc la probabilité de tirer une boule rouge est égale à $3/8$.',
    'La longueur BC est égale à 10 cm.',
    'La solution de l’équation est 9.',
    'Oui, car 57 est inférieur à 66. Non, car 140 n’est pas divisible par 16.'] });

/* ===== END lg ===== */
