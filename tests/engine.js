// Проверка ядра: как приложение читает ответы ученика (французская запись чисел, дроби, уравнения, порядок шагов).
// node tests/engine.js
const load = require('./load');
const A = load(['00-base']);
const ctx = A.ctx;
const vm = require('vm');
let fails = 0;
const ok = (c, what) => { if (!c) { fails++; console.log('  ✗ ' + what); } else console.log('  ✓ ' + what); };
const g = (spec, input) => A.grade(spec, input);

console.log('Числа:');
ok(g({ k: 'num', key: '3.5' }, '3,5').ok, '3,5 — десятичная запятая');
ok(g({ k: 'num', key: '3.5' }, '3.5').ok, '3.5 — точка тоже можно');
ok(g({ k: 'num', key: '45000' }, '45 000').ok, '45 000 — пробел в тысячах');
ok(g({ k: 'num', key: '-1.2' }, '−1,2').ok, '−1,2 — настоящий минус');
ok(!g({ k: 'num', key: '7/12', forms: ['frac'] }, '14/24').ok && g({ k: 'num', key: '7/12', forms: ['frac'] }, '14/24').near, '14/24 вместо 7/12 — «почти», сократи');
ok(g({ k: 'num', key: '7/12', forms: ['frac'] }, '7/12').ok, '7/12 — дробь');
ok(!g({ k: 'num', key: '0.75', forms: ['frac'] }, '0.75').ok, 'просили дробь — десятичная не засчитана');
ok(g({ k: 'num', key: '4.7', dp: 1 }, '4,7').ok, 'округление до десятых, с запятой');
ok(!g({ k: 'num', key: '4.7', dp: 1 }, '4,72').ok, 'округление: лишний знак — не засчитано');
ok(g({ k: 'num', key: '4.58*10^(-3)', forms: ['std'] }, '4.58*10^-3').ok, 'научная запись');
ok(!g({ k: 'num', key: '4.58*10^(-3)', forms: ['std'] }, '45.8*10^-4').ok, 'научная запись: 45,8×10⁻⁴ не засчитана');

console.log('Уравнения и списки:');
ok(g({ k: 'sol', key: '-2, 5', v: 'x', eqn: true }, '5 ; -2').ok, 'два решения через ; в любом порядке');
ok(g({ k: 'sol', key: '-2, 5', v: 'x', eqn: true }, 'x = 5 ou x = -2').ok, '«x = 5 ou x = −2»');
ok(g({ k: 'sol', key: '2.5', v: 'x', eqn: true }, '2,5').ok, 'решение с десятичной запятой');
ok(g({ k: 'list', key: '1,2,4' }, '1 ; 2 ; 4').ok, 'список через ;');

console.log('Выражения:');
const tidy = (spec, v) => vm.runInContext('(s, v) => tidyIn(s, v)', ctx);
ok(g({ k: 'expr', key: 'x^2+5x+6', forms: ['expanded'] }, 'x^2+5x+6').ok, 'раскрытые скобки');
ok(g({ k: 'expr', key: 'x^2+5x+6', forms: ['expanded'] }, '(x+2)(x+3)').near, 'нераскрытые скобки — «почти»');

console.log('Выбор и порядок:');
ok(g({ k: 'mcq', c: 2, opts: [1, 2, 3] }, '2').ok && !g({ k: 'mcq', c: 2, opts: [1, 2, 3] }, '1').ok, 'выбор варианта');
const ord = { k: 'order', items: ['a', 'b', 'c', 'd'] };
ok(g(ord, '0,1,2,3').ok, 'шаги по порядку');
ok(g(ord, '0,2,1,3').near, 'два шага переставлены — «почти»');
ok(g(ord, '0,1').empty, 'не все шаги — просит расставить все');

console.log('Формулы на экране:');
ok(A.mi('3.5+x') === '3{,}5+x', '3.5 показывается как 3,5');
ok(/\\dfrac\{3\}\{4\}/.test(A.mi('3/4')), 'дробь');
ok(A.texOfText('Calculer $3/4+1/2$ puis $$\\sqrt{2}$$').length === 2, 'формулы в тексте: $…$ и $$…$$');

console.log(fails ? `\nНе прошло: ${fails}` : '\nВсё прошло');
process.exit(fails ? 1 : 0);
