# Как писать и проверять задания для «Brevet»

## Для кого и зачем
PWA для русскоязычных учеников 3e, которые учатся во французском collège и готовятся к бревету по математике (DNB): понедельник, 28 июня 2027.
- Родной язык учеников — русский, французский они ещё учат. Экзамен целиком по-французски: условия нужно понять, а решение Partie 2 — **написать по-французски**.
- Один ученик сильный, у другого пробелы с 5e–4e. Занимаются 2 раза в неделю по часу с репетитором (через его экран в Zoom) и понемногу сами.
- Репетитор читает по-французски математический текст, остальное — с переводом. **Проверить французский в заданиях некому**: что написано в приложении, то ученик и унесёт на экзамен. Поэтому французский должен быть точно таким, как в настоящих вариантах, а русские объяснения — нести всё понимание.

Формат экзамена (с сессии 2026), 2 часа:
- **Partie 1 — Automatismes**: 6 баллов, 20 минут, **без калькулятора**, 9 коротких вопросов; часть — QCM на 4 варианта, остальные — короткий ответ без обоснования.
- **Partie 2 — Raisonnement et résolution de problèmes**: 14 баллов, 1 ч 40, с калькулятором, 3–4 задачи с контекстом; обоснования обязательны, 2 балла — за ясность изложения и язык.

## Языки в задании
| Что | Язык |
|---|---|
| Условие, варианты ответа, шаги для расстановки (`L(fr, ru)`) | по-французски, как на экзамене; русский перевод — по кнопке и на уроке |
| Подсказки, шаги решения (`sol`), шпаргалки (`body`) | по-русски, французские термины в «ёлочках» |
| `redac` — «как записать на экзамене» (вопросы Partie 2) | по-французски: то, что ученик написал бы на copie |
| `frs` в шпаргалке — точные формулировки определений и теорем | по-французски |
| Каждое французское слово условия | есть в словаре `src/content/lex.js` (перевод по нажатию на слово) |

Уровни тем: `lvl: 1` — база (пробелы 5e–4e), `lvl: 2` — уровень бревета. **Сложнее экзамена в приложении ничего нет** (решение владельца): тема остаётся, только если она есть в программе 3e и встречается в настоящих вариантах или в официальном списке автоматизмов.

## Что прочитать перед работой
- `src/js/20-api.js` — API: `topic`, `probleme`, `fiche`, `gloss`, `lex/lexf/lexn`, `automatisme`; ответы `N FRA MIX XP POW SOL LIST RATIO MQ MQF TF multi ORD`; числа `nf eur fx`; рисунки `svgFig tbl`, классы SVG.
- `src/content/00-base.js` — **образец**: тема `nc.frac-addsub`, задача `p2.salaires` (с `redac`), шпаргалка (с `frs`), словарь терминов. Пиши в том же стиле.
- `src/js/05-grade.js` — какие ответы принимает проверка: `forms` (`frac`, `expanded`, `factorised`, `std`, `mixed`, `primeFact`…), округление `dp`/`sf` (ключ — уже округлённое значение строкой с точкой: `'4.7'`), `sol` для уравнений, `list`, `ratio`, `order`.
- `src/js/10-helpers.js` — генератор `r`: `r()`, `r.ri(a,b)`, `r.nz`, `r.pick`, `r.sh`, `r.distinct`; дроби `F(n,d)`, `Fr.add/sub/mul/div/str`; строки выражений `cf S lin quad pw np`; многочлены `Pl`; `stdStr/stdTex`.
- `src/js/00-engine.js` — синтаксис формул в `$…$` и в полях `m`: `3/4`, `x^2`, `√2`, `2*10^3`, `3.5` (показывается «3,5»), `3x`, `÷`, `π`. × и ÷ одного приоритета и идут слева направо; черта дроби `/` связывает сильнее. Несколько формул через `;`, знаки `= < > ≤ ≥ ≠ ≈`.
- Настоящие варианты: ориентиры 2027 (sujets de référence n°1 и n°2), sujet zéro 2026, шесть вариантов сессии 2026 (новый формат), сессии 2018–2025. Лучший образец коротких вопросов — Partie 1 вариантов 2026 года и ориентиров 2027.

## Правила
1. **Свой файл.** Задания одной главы — в своём файле `src/content/<глава>.js`. Все файлы склеиваются в одну область видимости: у всех имён верхнего уровня — приставка файла (`geoTri`, `stBar`). id тем — с приставкой главы (`ge.pythagore`), задач — `p2.<имя>`. Главы объявлены только в `00-base.js`.
2. **Объяснения — с причинами, а не рецептами.** Никаких «просто запомни», «просто допиши ноль», «перенеси с другим знаком» без объяснения почему. Подсказки (1–3) идут от идеи к почти готовому решению. Шаги решения объясняют, почему шаг верен. В QCM неверные варианты — типичные ошибки; в решении сказано, откуда каждая берётся.
3. **Французский — как в бревете.** «Calculer…», «Donner…», «Justifier.», «Arrondir au dixième.», «Parmi les propositions suivantes, laquelle…». Сверяй обороты с настоящими вариантами, не придумывай свои. Типографика: пробел перед `: ; ? !`, десятичная запятая, `12,50 €` (`eur()`, `nf()`). Дословно условия настоящих вариантов не копировать — только «по мотивам»: тот же сюжет и ход рассуждения, другие числа и свои слова.
4. **Русский перевод** — естественный, на «ты»: «Вычисли», «Найди», «Обоснуй». Перевод передаёт смысл условия полностью: всё, что есть во французском тексте, в том числе в таблицах и подписях, должно быть понятно из русского.
5. **Partie 1** (`calc: false`): числа такие, чтобы считалось в уме за 1–2 минуты. С калькулятором (`calc: true`) — можно реалистичные числа и округление; если калькулятор нужен только части типов задания, ставь `calc: true` у самого вопроса.
6. **Форма ответа задана в условии** («sous forme de fraction irréductible», «arrondir au dixième»), проверка строгая, как на экзамене; подсказок о форме под полем нет. Где на экзамене короткий ответ — вводимый ответ (`N`, `FRA`, `XP`, `SOL`); где QCM — `MQ` с 4 вариантами. Единицы: `N(12, { unit: 'cm²' })` — единица показывается после поля.
7. У темы 2–5 типов заданий (`variants`); каждый тип на 40 случайных наборах даёт не меньше 6 разных вопросов. Генератор быстрый (< 5 мс).
8. **Рисунки** — inline SVG через `svgFig(w, h, inner, label)` и классы из `20-api.js`; цвета не задавай вручную (кроме блоков Scratch). viewBox шириной около 340, текст 14–16 единиц. Если вопрос требует чтения рисунка (график, сетка, диаграмма), рисунок точный. Надписи — буквы, числа, французские слова.
9. Имена людей — только из `PRENOMS_F` / `PRENOMS_M`. Реальных учеников не упоминать. Валюта — евро.
10. **`redac` в каждом вопросе Partie 2**: что написать на экзамене, по-французски, 1–5 коротких строк, формулы в `$…$`. Обычный порядок: на что опираемся («Dans le triangle ABC rectangle en A, d'après le théorème de Pythagore…»), вычисление, фраза-ответ с единицей («La longueur BC est de 10 cm.»). Длинные формулы разбивай на строки. Для `ORD` и для `MQ` с `red: true` `redac` берётся из ответа сам.
11. **Шпаргалки** (`fiche`): объяснение по-русски (`body`), примеры (`ex`) и `frs` — точные французские формулировки определений и теорем главы, которые нужно уметь написать (как в учебнике 3e).
12. **Словарь терминов** (`gloss`) — термины с пояснением; без повторов с другими файлами. **Словарь слов** (`lex.js`) ведёт один автор: в свой файл его не копируй. `node tests/words.js <файл>` покажет, каких слов из твоих текстов в словаре ещё нет, — это не ошибка твоего файла.

## Что отличается от русской школы (ученики думают по-русски)
Называй эти различия прямо в подсказках и шпаргалках там, где они мешают.
- «fonction linéaire» — это прямая пропорциональность $y=ax$; русская «линейная функция» $y=ax+b$ — это «fonction affine».
- «médiatrice» — серединный перпендикуляр; «médiane» в треугольнике — медиана, а в статистике — тоже «médiane», но это значение посередине ряда.
- «effectif» — сколько раз встретилось значение (абсолютная частота); «fréquence» — доля от общего числа (дробь, десятичная или %).
- «nombre relatif» — число со знаком; «nombre décimal» — число с конечной десятичной записью.
- «écriture (notation) scientifique» — стандартный вид числа; «PGCD» и «PPCM» — НОД и НОК.
- «développer», «factoriser», «réduire» — раскрыть скобки, разложить на множители, привести подобные.
- «tan» — тангенс (не «tg»); углы пишут с «крышкой»: $$\widehat{ABC}$$.
- Обозначения: [AB] — отрезок, (AB) — прямая, [AB) — луч, AB — длина.
- «pavé droit» — прямоугольный параллелепипед; «boule» — шар, «sphère» — сфера; «cône de révolution» — конус.
- «arrondi au dixième / au centième / à l'unité» — до десятых / до сотых / до целых; «valeur exacte» — точное значение (с корнем, дробью или π), «valeur approchée» — приближённое.
- «image» и «antécédent» — значение функции и значение аргумента, при котором оно получается.

## Проверка заданий (и вычитка чужих)
Не доверяй тексту на слово — пересчитывай.
1. **Математика.** Ответ верен при любых числах генератора: пересчитай ответы независимым способом (перебором, другим путём) на сотнях вариантов. Нет вырожденных случаев (деление на ноль, «треугольник» из трёх точек на прямой, совпадающие варианты QCM, ответ 0 или 1 там, где это подсказка).
2. **Однозначность.** У вопроса один верный ответ; форма ответа названа в условии; единица измерения ясна; округление указано («Arrondir au dixième») всегда, когда ответ не точный.
3. **Французский.** Обороты как в настоящих вариантах; согласование рода и числа; артикли; пробелы перед `: ; ? !`. Ничего «переведённого с русского».
4. **Перевод и объяснения.** Перевод полный и естественный. Подсказки не выдают ответ с первой же. Решение объясняет «почему», а не только «как»; ошибки-ловушки названы.
5. **Рисунки.** Посмотри глазами на телефоне (393 px), в светлой и тёмной теме: подписи не налезают, ничего не обрезано, по чертежу нельзя «угадать» то, что нужно вычислить, а то, что нужно прочитать (график, сетка), читается точно.
6. **Уровень.** Тема есть в программе 3e и встречается в настоящих вариантах или в официальном списке автоматизмов (ниже).

Команды:
```
node tests/content.js <часть-имени-файла>              # должно закончиться «Ошибок нет ✓»
node tests/content.js <файл> --show=<id>               # напечатать вопросы темы или задачи — прочитать глазами
node tests/content.js <файл> --seeds=200               # перед сдачей
node tests/words.js <файл>                             # какие французские слова из текстов ещё не в словаре
python3 tools/build.py --out=.work/prev/<файл>.html --content=<файл>     # собрать предпросмотр (index.html сайта не трогает)
node tools/preview.js --html=.work/prev/<файл>.html <id> <id>@2*3 --sol  # снимки как на телефоне → .work/preview/
```

## Официальный список автоматизмов (министерство, октябрь 2025)
«Liste indicative d'automatismes susceptibles d'être mobilisés lors de l'épreuve écrite de mathématiques», séries générale et professionnelle. Каждый пункт должен тренироваться хотя бы одной темой без калькулятора; связь пунктов с темами — в `src/content/05-officiel.js`.

**Nombres et calculs**
1. Entretenir l'écriture décimale des fractions simples comme 1/2 ; 1/4 ; 3/4 ; 3/2 ; 4/2 ; 5/2 ; 1/10 ; 100/100 ; 7/1.
2. Comparer des nombres décimaux et calculer avec des nombres décimaux (y compris négatifs).
3. Simplifier, comparer des fractions, calculer avec des fractions.
4. Prendre une fraction simple d'un nombre : le tiers de 18 ; le quart de 12. Déterminer a % de c quand a vaut 100, 50, 25, 10, 1.
5. Écrire un même nombre sous de multiples formes, par exemple dire que 1,2 = 12/10 = 6/5 = 1 + 1/5 = 120 % = 120/100.
6. Passer d'une écriture décimale à la notation scientifique.
7. Connaitre les carrés des nombres entiers compris entre 1 et 12.
8. Appliquer les critères de divisibilité par 2, 3, 5, 9.
9. Pour un nombre entier n, exprimer son double, son triple, sa moitié, son prédécesseur, son successeur, son carré.
10. Simplifier des expressions littérales.
11. Calculer la valeur d'une expression algébrique y compris avec des puissances, sans technicité excessive.
12. Développer et factoriser une expression simple.
13. Résoudre des équations du type ax = c, x + b = c, ax + b = c.
14. Sur une droite graduée, lire l'abscisse d'un point et placer un point d'abscisse donnée.

**Espace et géométrie**
15. Dans le plan muni d'un repère orthogonal, lire les coordonnées d'un point, placer un point de coordonnées données.
16. Exploiter le codage d'une figure pour identifier des triangles, des quadrilatères particuliers, une médiatrice.
17. Reconnaître et citer des angles sur une configuration géométrique. Connaitre angle plat, nul ; angles opposés par le sommet, adjacents, supplémentaires, aigus, obtus. Savoir qu'un angle droit mesure 90°, qu'un angle plat mesure 180°.
18. Connaître la somme des mesures des angles d'un triangle, calculer la mesure du troisième angle d'un triangle connaissant les mesures des deux autres.
19. Connaitre les procédures de conversion d'unités : mm, cm, m, km ; mm², cm², m², km² ; cm³, dm³, m³ ; g, kg ; mL, cL, dL, L et les correspondances : s, min, h, jour ; dm³, L ; m³, L.
20. Reconnaître des solides (cube, pavé droit, prisme droit, cylindre, pyramide, cône).
21. Déterminer le périmètre d'un polygone, d'un disque.
22. Connaître et utiliser les formules d'aire d'un triangle, d'un rectangle, d'un disque.
23. Connaître et utiliser les formules du volume d'un cube, d'un pavé droit, d'un prisme droit, d'un cylindre.
24. Reconnaître une situation d'application du théorème de Pythagore, mettre en place l'automatisme sur l'égalité de Pythagore, développer un regard critique sur les conditions d'utilisation et les résultats obtenus.
25. Reconnaître une situation d'application du théorème de Thalès dans la configuration des triangles emboîtés, mettre en place l'automatisme sur l'égalité des rapports de longueur.
26. Reconnaître une situation d'application de la ligne trigonométrique cosinus, mettre en place l'automatisme sur l'égalité des rapports de longueur.
27. Mobiliser les propriétés de la symétrie axiale, de la symétrie centrale, de la translation.

**Organisation et gestion de données et probabilités**
28. Attribuer des probabilités dans des cas simples (équiprobabilité).
29. Exprimer une fréquence simple.
30. Exprimer une moyenne.
31. Déterminer une médiane pour une série comportant un petit nombre de valeurs.
32. Lire et interpréter des informations présentées sous forme de tableaux, de diagrammes et de graphiques.

**Proportionnalité, fonctions**
33. Reconnaître si une situation donnée entre dans le cadre de la proportionnalité ou non.
34. Dans des situations simples, mobiliser une procédure adaptée (propriété de linéarité pour la multiplication ou l'addition, retour à l'unité) pour résoudre un problème lié à la proportionnalité.
35. Appliquer une augmentation ou une diminution exprimée en pourcentage.
36. Exploiter un graphique représentant la dépendance de deux grandeurs pour lire et interpréter différentes valeurs sur l'axe des abscisses ou l'axe des ordonnées.

**Algorithmique et programmation**
37. Interpréter une suite d'instructions : programme de calcul, déplacement, construction géométrique.

Источник: [education.gouv.fr, PDF](https://www.education.gouv.fr/sites/default/files/2025-10/dnb-2026-liste-indicative-d-automatismes-susceptibles-d-tre-mobilis-s-lors-de-l-preuve-crite-de-math-matiques-s-ries-g-n-rale-et-professionnelle--442401.pdf).

## Где что лежит
| Файл | Что |
|---|---|
| `00-base.js` | список глав, образцы |
| `05-officiel.js` | 37 пунктов официального списка и темы, которые их тренируют |
| `nc.js` | Nombres et calculs |
| `pp-gm.js` | Proportionnalité et pourcentages, Grandeurs et mesures |
| `cl-fn.js` | Calcul littéral et équations, Fonctions |
| `st-al.js` | Statistiques et probabilités, Algorithmique et tableur |
| `ge.js` | Espace et géométrie |
| `lg.js` | «Язык бревета»: слова-команды, связки, запись решения по-французски |
| `p2-a.js` … `p2-d.js` | задачи Partie 2 |
| `lex.js` | словарь слов для перевода по нажатию |
| `_*.js` | убрано из приложения (сложнее экзамена), в сборку и тесты не входит |
