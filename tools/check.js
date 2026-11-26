// Проверка перед коммитом: вид, все задания на экране, самообновление и работа без интернета.
// Запуск: node tools/check.js         (нужен Playwright; скриншоты — в .work/check/)
//         node tools/check.js quick   — без прогона всех тем и задач на экране
//
// 1. Вид: iPhone 15 (393×852), iPad mini (744×1133), iPad Pro 11 (834×1194 и 1194×834), светлая и тёмная тема:
//    нет прокрутки вбок, нет ошибок JS, текст заданий не мельче 15 px, остальной текст не мельче 12 px.
// 2. Каждая тема и каждая задача Partie 2 на iPhone 15: страница не шире экрана, «Перевод» ничего не сдвигает.
// 3. Вход, PIN, ответ с клавиатуры, пробник с таймером, разбор.
// 4. Самообновление: свободен — обновилось само; печатает или идёт пробник — плашка; прогресс на месте.
// 5. Без интернета: после первого открытия приложение открывается из копии (sw.js).
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WORK = path.join(ROOT, '.work', 'check');
fs.mkdirSync(WORK, { recursive: true });
const QUICK = process.argv.includes('quick');

const SITE = path.join(ROOT, '.work', 'site');
fs.mkdirSync(SITE, { recursive: true });
const SRC = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const f of ['sw.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png']) fs.copyFileSync(path.join(ROOT, f), path.join(SITE, f));
const put = (build) => fs.writeFileSync(path.join(SITE, 'index.html'), SRC.replace(/(name="app-build" content=")[^"]*/, '$1' + build));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(SITE, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!p.startsWith(SITE) || !fs.existsSync(p)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(fs.readFileSync(p));
});

let fails = 0;
const ok = (cond, what) => { console.log((cond ? '  ✓ ' : '  ✗ ') + what); if (!cond) fails++; };
const DEV = [['iphone15', 393, 852], ['ipadmini', 744, 1133], ['ipadpro11', 834, 1194], ['ipadpro11-land', 1194, 834]];

async function signIn(page, name, pin) {
  await page.evaluate(async ([n, p]) => { await createProfile(n, p); document.documentElement.classList.remove('nologin'); window.__brevet.quiet(); }, [name, pin || null]);
}
/* sizes of visible text; task text must be ≥ 15 px, the rest ≥ 12 px */
const textSizes = (page) => page.evaluate(() => {
  const bad = [];
  document.querySelectorAll('body *').forEach((el) => {
    if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return;
    if (el.closest('.katex, svg, #splash, .k, [hidden], .exnum, .opt .l, .ordit .l')) return;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
    const fs = parseFloat(getComputedStyle(el).fontSize); const task = !!el.closest('.instr, .opt, .sol, .hint, .fb, .pctx, .ordit');
    if (fs < (task ? 15 : 12)) bad.push((task ? 'задание ' : '') + el.tagName.toLowerCase() + '.' + el.className + ' ' + fs + 'px «' + el.textContent.trim().slice(0, 20) + '»');
  });
  return bad.slice(0, 5);
});

(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  put('2026-01-01·aaaaaaaa');

  console.log('Вид:');
  const info = await (async () => { const c = await browser.newContext(); const p = await c.newPage(); await p.goto(url); await p.waitForTimeout(300); const r = await p.evaluate(() => ({ t: window.__brevet.TOPICS.map((t) => [t.id, t.ch]), p: window.__brevet.PROBLEMS.map((x) => x.id), ch: window.__brevet.CHAPTERS.map((c) => c.id) })); await c.close(); return r; })();
  const firstT = info.t[0] && info.t[0][0], firstP = info.p[0];
  for (const [name, w, h] of DEV) {
    for (const scheme of ['light', 'dark']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: 1, hasTouch: true });
      const page = await ctx.newPage();
      const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
      await page.goto(url); await page.waitForTimeout(400);
      const shots = [['login', null]];
      const screens = [['today', '#/'], ['prog', '#/prog'], ['chapter', '#/ch/' + info.ch[0]], ['practice', '#/t/' + firstT], ['problem', '#/pb/' + firstP], ['exams', '#/exam'], ['me', '#/me'], ['data', '#/data'], ['dico', '#/dico']];
      let badW = [], small = [];
      for (const [nm, hash] of shots.concat(screens)) {
        if (hash) { if (nm === 'today' && !(await page.evaluate(() => !!window.__brevet.DB))) await signIn(page, 'Тест'); await page.goto(url + hash); await page.waitForTimeout(250); }
        const sw = await page.evaluate(() => document.documentElement.scrollWidth);
        if (sw > w) badW.push(nm + ' ' + sw);
        small = small.concat((await textSizes(page)).map((x) => nm + ': ' + x));
        if (name === 'iphone15' || ['today', 'practice', 'problem'].includes(nm)) await page.screenshot({ path: path.join(WORK, `${name}-${scheme}-${nm}.png`), fullPage: true });
      }
      ok(!badW.length, `${name} ${scheme}: нет прокрутки вбок ${badW.join(', ')}`);
      ok(!small.length, `${name} ${scheme}: текст не мелкий ${small.slice(0, 3).join('; ')}`);
      ok(errs.length === 0, `${name} ${scheme}: без ошибок JS ${errs.join('; ')}`);
      await ctx.close();
    }
  }

  if (!QUICK) {
    console.log('Все темы и задачи на iPhone 15:');
    /* reducedMotion: the short slide-in of a new screen must not be taken for a jump */
    const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, hasTouch: true, reducedMotion: 'reduce' });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
    await page.goto(url); await page.waitForTimeout(300); await signIn(page, 'Тест');
    const wide = [], jumps = [], small = [];
    const sig = () => page.evaluate(() => [...document.querySelectorAll('#app *')].slice(0, 400).map((e) => { const r = e.getBoundingClientRect(); return Math.round(r.top) + ':' + Math.round(r.height); }).join(','));
    await page.evaluate(() => document.fonts.ready);
    for (const [id] of info.t) {
      for (let k = 0; k < 3; k++) {
        if (k === 0) { await page.goto(url + '#/t/' + id); await page.waitForTimeout(80); } else { await page.evaluate(() => newQuestion(true)); await page.waitForTimeout(30); }
        const sw = await page.evaluate(() => document.documentElement.scrollWidth); if (sw > 393) wide.push(id + ' ' + sw);
        if (k === 0) { const a = await sig(); await page.evaluate(() => setTr(true)); const b = await sig(); await page.evaluate(() => setTr(false)); if (a !== b) jumps.push(id); small.push(...(await textSizes(page)).map((x) => id + ': ' + x)); }
      }
    }
    for (const id of info.p) {
      await page.goto(url + '#/pb/' + id); await page.waitForTimeout(120);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth); if (sw > 393) wide.push(id + ' ' + sw);
      const a = await sig(); await page.evaluate(() => setTr(true)); const b = await sig(); await page.evaluate(() => setTr(false)); if (a !== b) jumps.push(id);
    }
    ok(!wide.length, `темы и задачи не шире экрана (${info.t.length} тем × 3, ${info.p.length} задач) ${wide.slice(0, 6).join('; ')}`);
    ok(!jumps.length, `«Перевод» ничего не сдвигает ${jumps.slice(0, 6).join(', ')}`);
    ok(!small.length, `текст заданий не мельче 15 px ${small.slice(0, 3).join('; ')}`);
    ok(!errs.length, `без ошибок JS ${errs.slice(0, 3).join('; ')}`);
    await ctx.close();
  }

  console.log('Вход, ответы, пробник:');
  {
    const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, hasTouch: true });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
    await page.goto(url); await page.waitForTimeout(300);
    await page.fill('#npName', 'Лея'); await page.fill('#npPin', '2468'); await page.click('#npGo'); await page.waitForTimeout(300);
    await page.evaluate(() => window.__brevet.quiet());
    ok(await page.isVisible('.hello'), 'новый ученик с PIN — открылся экран «Сегодня»');
    await page.goto(url + '#/t/' + firstT); await page.waitForTimeout(200);
    const key = await page.evaluate(() => { const it = P.it; return it.ans.k === 'multi' || it.ans.k === 'mcq' || it.ans.k === 'order' ? null : window.__brevet.keyInput(it.ans); });
    if (key != null) {
      await page.click('#f0'); await page.waitForTimeout(100);
      ok(await page.isVisible('#kb'), 'математическая клавиатура открылась');
      await page.fill('#f0', key.replace(/\./g, ',')); await page.dispatchEvent('#f0', 'input');
      await page.click('#kb [data-k="ENTER"]'); await page.waitForTimeout(200);
      ok(/Верно/.test(await page.textContent('#fb')), 'верный ответ (с десятичной запятой) засчитан: ' + key);
      ok(await page.evaluate(() => Object.values(window.__brevet.DB.days)[0] === 1), 'ответ записан в прогресс');
    }
    await page.evaluate(() => { sessionStorage.clear(); }); await page.reload(); await page.waitForTimeout(300);
    ok(await page.isVisible('[data-prof]'), 'после перезапуска с PIN — экран входа');
    await page.click('[data-prof]'); await page.waitForTimeout(150);
    for (const d of '1111') await page.click('[data-pk="' + d + '"]');
    await page.waitForTimeout(300); ok(await page.isVisible('#sheet'), 'неверный PIN — не пускает');
    for (const d of '2468') await page.click('[data-pk="' + d + '"]');
    await page.waitForTimeout(300); ok(await page.isVisible('.hello'), 'верный PIN — вход');
    await page.evaluate(() => window.__brevet.quiet());
    await page.evaluate(() => setTr(true));
    await page.evaluate(() => { window.__brevet.newExam('blanc'); window.__brevet.go('#/exam/run'); }); await page.waitForTimeout(300);
    ok(/^(19|20):\d\d$/.test(await page.textContent('#tmr')), 'brevet blanc: таймер 20 минут на Partie 1');
    ok(await page.evaluate(() => $('#tTr').hidden && !document.documentElement.classList.contains('tr')), 'в пробнике нет «Перевода», условия по-французски (хотя в тренировке перевод был включён)');
    await page.evaluate(() => { DB.cur.parts[0].end = Date.now() + 1500; save(); }); await page.waitForTimeout(2600);
    ok(await page.evaluate(() => DB.cur && DB.cur.part === 1), 'время вышло — Partie 1 собрана, началась Partie 2');
    await page.screenshot({ path: path.join(WORK, 'exam-p2.png') });
    await page.click('#bHand'); await page.waitForTimeout(150); await page.click('#shYes'); await page.waitForTimeout(400);
    ok(await page.evaluate(() => location.hash === '#/exam/res' && DB.exams.length === 1 && DB.exams[0].max === 18), 'пробник завершён, есть результат и разбор');
    await page.screenshot({ path: path.join(WORK, 'exam-result.png'), fullPage: true });
    ok(!errs.length, 'без ошибок JS ' + errs.slice(0, 3).join('; '));
    await ctx.close();
  }

  console.log('Код прогресса: ученик → репетитор → ученик:');
  {
    const mk = async () => { const c = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, hasTouch: true }); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(String(e))); await p.goto(url); await p.waitForTimeout(300); return [c, p]; };
    const errs = [];
    const [cs, st] = await mk(); await signIn(st, 'Мила', '1357');
    await st.evaluate(() => { for (let i = 0; i < 12; i++) window.__brevet.record(window.__brevet.TOPICS[i % 3].id, true); });
    await st.goto(url + '#/'); await st.waitForTimeout(200);
    ok(await st.isVisible('#bCode'), 'после 10 заданий на «Сегодня» честное напоминание и кнопка «Отправить код»');
    await st.click('#bCode'); await st.waitForTimeout(300);
    const msg1 = await st.inputValue('#sheet textarea');
    ok(/BRV2\./.test(msg1) && msg1.length < 4096, 'код готов, сообщение ' + msg1.length + ' знаков');
    await st.click('#cCopy'); await st.waitForTimeout(100);
    ok(await st.evaluate(() => DB.bk.at > 0), 'после копирования напоминание сбрасывается');
    const [ct, tu] = await mk(); await signIn(tu, 'Тимур');
    await tu.goto(url + '#/me'); await tu.waitForTimeout(200); await tu.click('#bPaste'); await tu.fill('#mvCode', 'Вот мой код:\n' + msg1); await tu.click('#mvGo'); await tu.waitForTimeout(300);
    await tu.click('#shYes'); await tu.waitForTimeout(400);
    ok(await tu.evaluate(() => DB.name === 'Мила' && Object.values(DB.days).reduce((a, b) => a + b, 0) === 12 && profiles().length === 2), 'у репетитора появилась Мила с её прогрессом, Тимур остался');
    await tu.evaluate(() => { window.__brevet.quiet(); for (let i = 0; i < 5; i++) window.__brevet.record(window.__brevet.TOPICS[5].id, true); });
    const msg2 = await tu.evaluate(async () => 'Brevet · ' + DB.name + '\n' + await progressCode());
    await st.goto(url + '#/me'); await st.waitForTimeout(200); await st.click('#bPaste'); await st.fill('#mvCode', msg2); await st.click('#mvGo'); await st.waitForTimeout(300);
    ok(await st.isVisible('#rsGo'), 'у ученика код от репетитора узнаётся как его собственный, перед загрузкой — «сейчас / в коде»');
    await st.click('#rsGo'); await st.waitForTimeout(300);
    ok(await st.evaluate(() => Object.values(DB.days).reduce((a, b) => a + b, 0) === 17 && !!skOf(window.__brevet.TOPICS[5].id).m && profOf(DB.id).pin), 'урок у репетитора добавился (12 + 5), PIN ученика на месте');
    ok(await st.evaluate(() => snaps(DB.id).length >= 1), 'перед загрузкой сохранилась копия прежнего состояния');
    await st.goto(url + '#/t/' + firstT); await st.waitForTimeout(200);
    await st.evaluate(() => showSolution()); await st.waitForTimeout(150);
    ok(await st.isVisible('#bReport'), 'в разборе есть «Нашёл ошибку в задании? Сообщить»');
    ok(!errs.length, 'без ошибок JS ' + errs.slice(0, 3).join('; '));
    await cs.close(); await ct.close();
  }

  console.log('Самообновление:');
  {
    const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    put('2026-01-01·aaaaaaaa');
    await page.goto(url); await page.waitForTimeout(300); await signIn(page, 'Ника');
    await page.goto(url + '#/t/' + firstT); await page.waitForTimeout(2200);
    ok(await page.evaluate(() => window.__upd.on && window.__upd.found === null), 'та же сборка — ничего не происходит');
    put('2026-01-02·bbbbbbbb');
    await page.evaluate(() => window.__upd.check());
    await page.waitForFunction(() => window.__upd && window.__upd.build === '2026-01-02·bbbbbbbb', null, { timeout: 6000 }).catch(() => {});
    ok(await page.evaluate(() => window.__upd.build) === '2026-01-02·bbbbbbbb', 'новая сборка, ученик свободен — обновилось само');
    ok(!/[?&]v=/.test(page.url()), 'адрес после обновления чистый');
    ok(await page.evaluate(() => !!(window.__brevet.DB && window.__brevet.DB.name === 'Ника')), 'после обновления ученик на месте');
    await page.goto(url + '#/t/' + firstT); await page.waitForTimeout(300);
    const inp = await page.$('#f0');
    if (inp) { await page.click('#f0'); await page.fill('#f0', '7'); }
    put('2026-01-03·cccccccc');
    await page.evaluate(() => window.__upd.check()); await page.waitForTimeout(600);
    ok(await page.evaluate(() => window.__upd.build) === '2026-01-02·bbbbbbbb', 'ученик отвечает — не перезагрузилось');
    ok(await page.isVisible('#updbar'), 'показана плашка «Обновить»');
    await page.screenshot({ path: path.join(WORK, 'updbar.png') });
    await page.click('#updbar [data-upd="go"]');
    await page.waitForFunction(() => window.__upd && window.__upd.build === '2026-01-03·cccccccc', null, { timeout: 6000 }).catch(() => {});
    ok(await page.evaluate(() => window.__upd.build) === '2026-01-03·cccccccc', 'кнопка «Обновить» — обновилось');
    await page.evaluate(() => { window.__brevet.newExam('p1'); window.__brevet.go('#/exam/run'); }); await page.waitForTimeout(300);
    put('2026-01-04·dddddddd');
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.evaluate(() => window.__upd.check()); await page.waitForTimeout(600);
    ok(await page.evaluate(() => window.__upd.build) === '2026-01-03·cccccccc' && await page.isVisible('#updbar'), 'идёт пробник — не перезагрузилось, плашка');
    await ctx.close();
  }

  console.log('Без интернета:');
  {
    const ctx = await browser.newContext({ viewport: { width: 393, height: 852 } });
    const page = await ctx.newPage();
    put('2026-01-05·eeeeeeee');
    await page.goto(url); await page.waitForTimeout(300);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload(); await page.waitForTimeout(500);
    ok(await page.evaluate(() => !!navigator.serviceWorker.controller), 'sw.js установлен');
    await ctx.setOffline(true);
    await page.reload(); await page.waitForTimeout(600);
    ok(await page.evaluate(() => !!window.__brevet && document.querySelector('#app').children.length > 0), 'без сети приложение открывается');
    await ctx.close();
  }

  await browser.close();
  server.close();
  console.log(fails ? `\nНе прошло: ${fails}` : '\nВсё прошло. Скриншоты — в .work/check/');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
