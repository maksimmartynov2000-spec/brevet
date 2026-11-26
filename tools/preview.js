// Снимки заданий «как на телефоне» — чтобы прочитать их глазами. Ничего не меняет в index.html сайта.
//   python3 tools/build.py --out=.work/prev/ge.html --content=ge     (сначала собрать предпросмотр со своим файлом)
//   node tools/preview.js --html=.work/prev/ge.html ge.thales ge.thales@2*3 p2.papillon --sol
// id        — тема: по одному заданию каждого типа; задача Partie 2: один вариант
// id@2      — только тип №2 темы;  id*3 — три варианта с разными числами
// --sol     — с открытым решением (и с «как записать на экзамене»)   --dark — тёмная тема   --w=393 — ширина экрана
// --ru      — с включённым переводом
// Снимки — в .work/preview/ (в git не попадают).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const HTML = path.resolve(opt('html', 'index.html')), W = +opt('w', 393);
const SOL = args.includes('--sol'), DARK = args.includes('--dark'), RU = args.includes('--ru');
const OUT = path.resolve(__dirname, '..', '.work', 'preview');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: 852 }, deviceScaleFactor: 1, hasTouch: true, reducedMotion: 'reduce', colorScheme: DARK ? 'dark' : 'light' });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + HTML); await p.waitForTimeout(300);
  await p.evaluate(async () => { await createProfile('Тест', null); document.documentElement.classList.remove('nologin'); window.__brevet.quiet(); DB.tipTr = 1; });
  for (const a of args.filter((x) => !x.startsWith('--'))) {
    const m = /^([^@*]+)(?:@(\d+))?(?:\*(\d+))?$/.exec(a); if (!m) { console.log('не понял: ' + a); continue; }
    const id = m[1], n = +(m[3] || 1);
    const kind = await p.evaluate((i) => (window.__brevet.PROBLEMS.find((x) => x.id === i) ? 'p' : window.__brevet.TOPICS.find((x) => x.id === i) ? 't' : ''), id);
    if (!kind) { console.log('нет такой темы или задачи: ' + id); continue; }
    const variants = kind === 't' ? await p.evaluate((i) => window.__brevet.TOPICS.find((x) => x.id === i).variants, id) : 1;
    const vis = m[2] != null ? [+m[2]] : [...Array(variants).keys()];
    for (const vi of vis) for (let k = 0; k < n; k++) {
      const seed = 1000 + k * 7919 + vi;
      if (kind === 't') await p.evaluate(([i, v, s]) => window.__brevet.show(i, v, s), [id, vi, seed]);
      else await p.evaluate(([i, s]) => viewProblem(i, s), [id, seed]);
      if (SOL) await p.evaluate((kd) => { if (kd === 't') showSolution(); else { Q2.st.forEach((S) => { S.sol = true; S.done = true; }); renderProblem(); } }, kind);
      if (RU) await p.evaluate(() => setTr(true));
      await p.waitForTimeout(80);
      const f = path.join(OUT, id + (kind === 't' ? '-v' + vi : '') + '-' + seed + (SOL ? '-sol' : '') + (RU ? '-ru' : '') + (DARK ? '-dark' : '') + '.png');
      await p.screenshot({ path: f, fullPage: true });
      console.log(path.relative(process.cwd(), f));
    }
  }
  if (errs.length) console.log('ОШИБКИ JS: ' + [...new Set(errs)].join(' | '));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
