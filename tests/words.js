// Какие французские слова из заданий ещё не имеют перевода в словаре (src/content/lex.js).
// node tests/words.js                — все файлы заданий; код выхода 1, если есть слова без перевода
// node tests/words.js ge p2-a        — только файлы, в имени которых есть одно из слов
// node tests/words.js --seeds=120    — больше случайных вариантов каждого задания (по умолчанию 60)
// node tests/words.js --all          — напечатать вообще все слова с частотой (для составления словаря)
// node tests/words.js --tsv          — без оформления: слово, сколько раз, пример (для обработки скриптом)
const load = require('./load');
const { frTexts, frTextsProblem } = require('./frtexts');

const args = process.argv.slice(2);
const SEEDS = +((args.find((a) => a.startsWith('--seeds=')) || '').split('=')[1] || 60);
const ALL = args.includes('--all'), TSV = args.includes('--tsv');
const A = load(args.filter((a) => !a.startsWith('--')));

const seen = new Map();          // word → { n, ctx, where }
function scan(text, where) {
  const plain = String(text).replace(/\$\$[^$]*\$\$|\$[^$]*\$/g, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&[a-z]+;/g, ' ');
  const toks = A.lexTokens(plain);
  toks.forEach((t, i) => {
    if (A.lexSkip(t.w)) return;
    const known = !!A.lexFind(toks, i);
    if (known && !ALL) return;
    const key = /^[A-ZÀ-Ý][a-zà-ÿ]/.test(t.w) && i > 0 && !/[.!?:»]\s*$/.test(plain.slice(0, t.i)) ? t.w : t.w.toLowerCase();   // keep the capital of a word inside a sentence (a name?)
    const e = seen.get(key) || { n: 0, known, ctx: plain.slice(Math.max(0, t.i - 40), t.j + 40).replace(/\s+/g, ' ').trim(), where };
    e.n++; seen.set(key, e);
  });
}
let texts = 0;
for (const tp of A.TOPICS) {
  scan(tp.fr, tp.id + ' (название)');
  for (let vi = 0; vi < tp.variants; vi++) for (let s = 1; s <= SEEDS; s++) {
    let it; try { it = tp.gen(A.mkRng(s * 7919 + vi), vi); } catch (e) { continue; }
    frTexts(it).forEach((t) => { scan(t, tp.id); texts++; });
  }
}
for (const pb of A.PROBLEMS) {
  scan(pb.fr, pb.id + ' (название)');
  for (let s = 1; s <= Math.max(10, SEEDS / 2); s++) {
    let p; try { p = pb.gen(A.mkRng(s * 104729)); } catch (e) { continue; }
    frTextsProblem(p).forEach((t) => { scan(t, pb.id); texts++; });
  }
}
A.FICHES.forEach((f) => (f.frs || []).forEach((t) => scan(t, 'fiche ' + (f.id || f.ch))));
A.CHAPTERS.forEach((c) => scan(c.fr, 'chapter ' + c.id));
A.AUTOS.forEach((a) => scan(a.fr, 'automatisme ' + a.n));

const list = [...seen.entries()].sort((a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0]));
const unknown = list.filter(([, e]) => !e.known);
if (TSV) list.forEach(([w, e]) => console.log([w, e.n, e.known ? 'ok' : 'NEW', e.where, e.ctx].join('\t')));
else {
  (ALL ? list : unknown).slice(0, ALL ? 1e9 : 400).forEach(([w, e]) => console.log((e.known ? '   ' : ' ✗ ') + w.padEnd(22) + String(e.n).padStart(6) + '  ' + e.where.padEnd(26) + ' …' + e.ctx + '…'));
  console.log('\nТекстов просмотрено: ' + texts + ' · статей в словаре: ' + A.LEXI.length + ' · слов без перевода: ' + unknown.length + (unknown.length > 400 && !ALL ? ' (показаны первые 400)' : ''));
}
process.exit(unknown.length ? 1 : 0);
