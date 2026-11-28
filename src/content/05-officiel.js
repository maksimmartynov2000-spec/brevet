/* ===================== THE MINISTRY'S LIST OF AUTOMATISMES (Partie 1) =====================
   «Liste indicative d'automatismes susceptibles d'être mobilisés lors de l'épreuve écrite de mathématiques»,
   séries générale et professionnelle (éduscol / education.gouv.fr, octobre 2025) — 37 items, in the official wording.
   Each item names the topics of the app that train it: the screen «Автоматизмы» shows the list with the student's progress.
     n — the number in the list; sec — the heading of the list; dom — the chapter of the app the item belongs to;
     topics — ids of the topics (they must exist: tests/content.js checks). */
const OFF_NC = 'Nombres et calculs', OFF_GE = 'Espace et géométrie', OFF_ST = 'Organisation et gestion de données et probabilités',
  OFF_PP = 'Proportionnalité, fonctions', OFF_AL = 'Algorithmique et programmation';

automatisme({ n: 1, sec: OFF_NC, dom: 'nc', topics: ['nc.ecritures-nombre', 'nc.frac-ecritures'],
  fr: 'Entretenir l\'écriture décimale des fractions simples comme 1/2 ; 1/4 ; 3/4 ; 3/2 ; 4/2 ; 5/2 ; 1/10 ; 100/100 ; 7/1.',
  ru: 'Помнить десятичную запись простых дробей: 1/2; 1/4; 3/4; 3/2; 4/2; 5/2; 1/10; 100/100; 7/1.' });
automatisme({ n: 2, sec: OFF_NC, dom: 'nc', topics: ['nc.decimaux', 'nc.relatifs-addsub', 'nc.relatifs-muldiv'],
  fr: 'Comparer des nombres décimaux et calculer avec des nombres décimaux (y compris négatifs).',
  ru: 'Сравнивать десятичные числа и считать с ними, в том числе с отрицательными.' });
automatisme({ n: 3, sec: OFF_NC, dom: 'nc', topics: ['nc.frac-comparer', 'nc.frac-addsub', 'nc.frac-muldiv'],
  fr: 'Simplifier, comparer des fractions, calculer avec des fractions.',
  ru: 'Сокращать и сравнивать дроби, выполнять действия с дробями.' });
automatisme({ n: 4, sec: OFF_NC, dom: 'nc', topics: ['nc.calcul-mental', 'nc.frac-ecritures', 'pp.pourcent-appliquer'],
  fr: 'Prendre une fraction simple d\'un nombre : le tiers de 18 ; le quart de 12. Déterminer a % de c quand a vaut 100, 50, 25, 10, 1.',
  ru: 'Находить простую дробь от числа: треть от 18, четверть от 12. Находить a % от c, когда a равно 100, 50, 25, 10 или 1.' });
automatisme({ n: 5, sec: OFF_NC, dom: 'nc', topics: ['nc.ecritures-nombre', 'nc.frac-ecritures'],
  fr: 'Écrire un même nombre sous de multiples formes, par exemple dire que 1,2 = 12/10 = 6/5 = 1 + 1/5 = 120 % = 120/100.',
  ru: 'Записывать одно и то же число по-разному: например, 1,2 = 12/10 = 6/5 = 1 + 1/5 = 120 % = 120/100.' });
automatisme({ n: 6, sec: OFF_NC, dom: 'nc', topics: ['nc.sci'],
  fr: 'Passer d\'une écriture décimale à la notation scientifique.',
  ru: 'Переходить от десятичной записи числа к научной (стандартному виду).' });
automatisme({ n: 7, sec: OFF_NC, dom: 'nc', topics: ['nc.carres', 'nc.racines'],
  fr: 'Connaitre les carrés des nombres entiers compris entre 1 et 12.',
  ru: 'Знать квадраты целых чисел от 1 до 12.' });
automatisme({ n: 8, sec: OFF_NC, dom: 'nc', topics: ['nc.arith-diviseurs'],
  fr: 'Appliquer les critères de divisibilité par 2, 3, 5, 9.',
  ru: 'Применять признаки делимости на 2, 3, 5 и 9.' });
automatisme({ n: 9, sec: OFF_NC, dom: 'cl', topics: ['cl.programme-calcul', 'cl.mise-en-equation'],
  fr: 'Pour un nombre entier n, exprimer son double, son triple, sa moitié, son prédécesseur, son successeur, son carré.',
  ru: 'Для целого числа n записывать через n его удвоенное и утроенное значение, половину, предыдущее и следующее число, квадрат.' });
automatisme({ n: 10, sec: OFF_NC, dom: 'cl', topics: ['cl.reduire'],
  fr: 'Simplifier des expressions littérales.',
  ru: 'Упрощать буквенные выражения.' });
automatisme({ n: 11, sec: OFF_NC, dom: 'cl', topics: ['cl.substituer'],
  fr: 'Calculer la valeur d\'une expression algébrique y compris avec des puissances, sans technicité excessive.',
  ru: 'Находить значение алгебраического выражения, в том числе со степенями, без громоздких вычислений.' });
automatisme({ n: 12, sec: OFF_NC, dom: 'cl', topics: ['cl.developper-simple', 'cl.factoriser', 'cl.developper-double'],
  fr: 'Développer et factoriser une expression simple.',
  ru: 'Раскрывать скобки и раскладывать на множители простое выражение.' });
automatisme({ n: 13, sec: OFF_NC, dom: 'cl', topics: ['cl.eq-1'],
  fr: 'Résoudre des équations du type ax = c, x + b = c, ax + b = c.',
  ru: 'Решать уравнения вида ax = c, x + b = c, ax + b = c.' });
automatisme({ n: 14, sec: OFF_NC, dom: 'nc', topics: ['nc.droite-graduee', 'nc.frac-ecritures'],
  fr: 'Sur une droite graduée, lire l\'abscisse d\'un point et placer un point d\'abscisse donnée.',
  ru: 'На числовой прямой читать координату точки и отмечать точку с данной координатой.' });

automatisme({ n: 15, sec: OFF_GE, dom: 'ge', topics: ['ge.reperage'],
  fr: 'Dans le plan muni d\'un repère orthogonal, lire les coordonnées d\'un point, placer un point de coordonnées données.',
  ru: 'На плоскости с прямоугольной системой координат читать координаты точки и отмечать точку по её координатам.' });
automatisme({ n: 16, sec: OFF_GE, dom: 'ge', topics: ['ge.codage', 'ge.quadrilateres'],
  fr: 'Exploiter le codage d\'une figure pour identifier des triangles, des quadrilatères particuliers, une médiatrice.',
  ru: 'По отметкам на чертеже узнавать особые треугольники и четырёхугольники, серединный перпендикуляр.' });
automatisme({ n: 17, sec: OFF_GE, dom: 'ge', topics: ['ge.angles-vocabulaire'],
  fr: 'Reconnaître et citer des angles sur une configuration géométrique. Connaitre angle plat, nul ; angles opposés par le sommet, adjacents, supplémentaires, aigus, obtus. Savoir qu\'un angle droit mesure 90°, qu\'un angle plat mesure 180°.',
  ru: 'Узнавать и называть углы на чертеже. Знать развёрнутый и нулевой угол; вертикальные, прилежащие и дополнительные до 180° углы; острые и тупые углы. Знать, что прямой угол равен 90°, а развёрнутый — 180°.' });
automatisme({ n: 18, sec: OFF_GE, dom: 'ge', topics: ['ge.angles'],
  fr: 'Connaître la somme des mesures des angles d\'un triangle, calculer la mesure du troisième angle d\'un triangle connaissant les mesures des deux autres.',
  ru: 'Знать сумму углов треугольника и находить третий угол по двум известным.' });
automatisme({ n: 19, sec: OFF_GE, dom: 'gm', topics: ['gm.conversions', 'gm.conversions-aires-volumes', 'gm.durees'],
  fr: 'Connaitre les procédures de conversion d\'unités : mm, cm, m, km ; mm², cm², m², km² ; cm³, dm³, m³ ; g, kg ; mL, cL, dL, L et les correspondances : s, min, h, jour ; dm³, L ; m³, L.',
  ru: 'Уметь переводить единицы: мм, см, м, км; мм², см², м², км²; см³, дм³, м³; г, кг; мл, сл, дл, л — и знать соответствия: с, мин, ч, сутки; дм³ и л; м³ и л.' });
automatisme({ n: 20, sec: OFF_GE, dom: 'ge', topics: ['ge.solides'],
  fr: 'Reconnaître des solides (cube, pavé droit, prisme droit, cylindre, pyramide, cône).',
  ru: 'Узнавать тела: куб, прямоугольный параллелепипед, прямую призму, цилиндр, пирамиду, конус.' });
automatisme({ n: 21, sec: OFF_GE, dom: 'gm', topics: ['gm.perimetres-aires'],
  fr: 'Déterminer le périmètre d\'un polygone, d\'un disque.',
  ru: 'Находить периметр многоугольника и длину окружности (периметр круга).' });
automatisme({ n: 22, sec: OFF_GE, dom: 'gm', topics: ['gm.perimetres-aires', 'gm.aires-composees'],
  fr: 'Connaître et utiliser les formules d\'aire d\'un triangle, d\'un rectangle, d\'un disque.',
  ru: 'Знать и применять формулы площади треугольника, прямоугольника и круга.' });
automatisme({ n: 23, sec: OFF_GE, dom: 'gm', topics: ['gm.volumes'],
  fr: 'Connaître et utiliser les formules du volume d\'un cube, d\'un pavé droit, d\'un prisme droit, d\'un cylindre.',
  ru: 'Знать и применять формулы объёма куба, прямоугольного параллелепипеда, прямой призмы и цилиндра.' });
automatisme({ n: 24, sec: OFF_GE, dom: 'ge', topics: ['ge.pythagore', 'ge.pythagore-reciproque'],
  fr: 'Reconnaître une situation d\'application du théorème de Pythagore, mettre en place l\'automatisme sur l\'égalité de Pythagore, développer un regard critique sur les conditions d\'utilisation et les résultats obtenus.',
  ru: 'Узнавать ситуацию, где работает теорема Пифагора, без раздумий записывать равенство Пифагора, критически проверять условия применения и полученный результат.' });
automatisme({ n: 25, sec: OFF_GE, dom: 'ge', topics: ['ge.thales'],
  fr: 'Reconnaître une situation d\'application du théorème de Thalès dans la configuration des triangles emboîtés, mettre en place l\'automatisme sur l\'égalité des rapports de longueur.',
  ru: 'Узнавать ситуацию, где работает теорема Фалеса (один треугольник внутри другого), и без раздумий записывать равенство отношений длин.' });
automatisme({ n: 26, sec: OFF_GE, dom: 'ge', topics: ['ge.trigo-choisir'],
  fr: 'Reconnaître une situation d\'application de la ligne trigonométrique cosinus, mettre en place l\'automatisme sur l\'égalité des rapports de longueur.',
  ru: 'Узнавать ситуацию, где нужен косинус угла, и без раздумий записывать его как отношение длин.' });
automatisme({ n: 27, sec: OFF_GE, dom: 'ge', topics: ['ge.symetries', 'ge.transformations'],
  fr: 'Mobiliser les propriétés de la symétrie axiale, de la symétrie centrale, de la translation.',
  ru: 'Применять свойства осевой симметрии, центральной симметрии и параллельного переноса.' });

automatisme({ n: 28, sec: OFF_ST, dom: 'st', topics: ['st.proba-simple'],
  fr: 'Attribuer des probabilités dans des cas simples (équiprobabilité).',
  ru: 'Находить вероятности в простых случаях, когда все исходы равновозможны.' });
automatisme({ n: 29, sec: OFF_ST, dom: 'st', topics: ['st.effectifs-frequences'],
  fr: 'Exprimer une fréquence simple.',
  ru: 'Записывать простую частоту.' });
automatisme({ n: 30, sec: OFF_ST, dom: 'st', topics: ['st.moyenne'],
  fr: 'Exprimer une moyenne.',
  ru: 'Находить среднее значение.' });
automatisme({ n: 31, sec: OFF_ST, dom: 'st', topics: ['st.mediane'],
  fr: 'Déterminer une médiane pour une série comportant un petit nombre de valeurs.',
  ru: 'Находить медиану ряда из небольшого числа значений.' });
automatisme({ n: 32, sec: OFF_ST, dom: 'st', topics: ['st.diagrammes', 'st.diagramme-circulaire'],
  fr: 'Lire et interpréter des informations présentées sous forme de tableaux, de diagrammes et de graphiques.',
  ru: 'Читать и понимать сведения из таблиц, диаграмм и графиков.' });

automatisme({ n: 33, sec: OFF_PP, dom: 'pp', topics: ['pp.reconnaitre'],
  fr: 'Reconnaître si une situation donnée entre dans le cadre de la proportionnalité ou non.',
  ru: 'Определять, является ли данная зависимость пропорциональной.' });
automatisme({ n: 34, sec: OFF_PP, dom: 'pp', topics: ['pp.tableau'],
  fr: 'Dans des situations simples, mobiliser une procédure adaptée (propriété de linéarité pour la multiplication ou l\'addition, retour à l\'unité) pour résoudre un problème lié à la proportionnalité.',
  ru: 'В простых задачах на пропорциональность выбирать подходящий приём: умножить или сложить столбцы (линейность) либо перейти к единице.' });
automatisme({ n: 35, sec: OFF_PP, dom: 'pp', topics: ['pp.pourcent-evol'],
  fr: 'Appliquer une augmentation ou une diminution exprimée en pourcentage.',
  ru: 'Увеличивать или уменьшать величину на заданное число процентов.' });
automatisme({ n: 36, sec: OFF_PP, dom: 'fn', topics: ['fn.lecture-graphe', 'fn.modeliser'],
  fr: 'Exploiter un graphique représentant la dépendance de deux grandeurs pour lire et interpréter différentes valeurs sur l\'axe des abscisses ou l\'axe des ordonnées.',
  ru: 'По графику зависимости двух величин читать и объяснять значения на оси абсцисс и на оси ординат.' });

automatisme({ n: 37, sec: OFF_AL, dom: 'al', topics: ['cl.programme-calcul', 'al.scratch-lire', 'al.scratch-boucle'],
  fr: 'Interpréter une suite d\'instructions : programme de calcul, déplacement, construction géométrique.',
  ru: 'Понимать последовательность команд: программу вычислений, перемещение, геометрическое построение.' });
