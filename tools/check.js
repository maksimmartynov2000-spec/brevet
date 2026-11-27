// Проверка перед коммитом: вид на всех устройствах, все задания на экране, обучение, обмен кодом, домашнее задание,
// экраны репетитора, печать, самообновление и работа без интернета.
// Запуск: node tools/check.js            (нужен Playwright; скриншоты — в .work/check/)
//         node tools/check.js quick      — без прогона всех тем и задач на экране
//         node tools/check.js --html=.work/prev/x.html   — проверить другую сборку (см. tools/build.py --out=)
//
//  1. Вид: телефон 360×640, iPhone 15 (393×852), iPad mini (744×1133), iPad Pro 11 (834×1194 и 1194×834), компьютер (1440×900);
//     светлая и тёмная тема: нет прокрутки вбок, нет ошибок JS, текст заданий не мельче 15 px, остальной — не мельче 12 px.
//  2. Каждая тема и каждая задача Partie 2 на iPhone 15: страница не шире экрана, «Перевод» ничего не сдвигает.
//  3. Вход, PIN, ответ с клавиатуры, «Перевод» на одно задание, пробник с таймером и без перевода, разбор.
//  4. Обучение: освоение, повторение через 3 и 10 дней, ошибка возвращает тему в работу, разминка, секундомер, слова.
//  5. Код прогресса: ученик → репетитор → ученик; домашнее задание уезжает с кодом и возвращается выполненным.
//  6. Репетитор: «Ученики», сводка для родителей, режим урока. Печать: все виды листов, задания без русского текста.
//  7. Прогресс первой версии открывается и сохраняется копией. Самообновление. Работа без интернета.
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WORK = path.join(ROOT, '.work', 'check');
fs.mkdirSync(WORK, { recursive: true });
const QUICK = process.argv.includes('quick');
const HTML = (process.argv.find((a) => a.startsWith('--html=')) || '').slice(7);

const SITE = path.join(ROOT, '.work', 'site');
fs.mkdirSync(SITE, { recursive: true });
const SRC = fs.readFileSync(HTML ? path.resolve(HTML) : path.join(ROOT, 'index.html'), 'utf8');
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
/* name, width, height, touch screen */
const DEV = [['phone360', 360, 640, true], ['iphone15', 393, 852, true], ['ipadmini', 744, 1133, true], ['ipadpro11', 834, 1194, true], ['ipadpro11-land', 1194, 834, true], ['desktop', 1440, 900, false]];
const PHONE = { viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, reducedMotion: 'reduce' };

async function signIn(page, name, pin) {
  await page.evaluate(async ([n, p]) => { await createProfile(n, p); document.documentElement.classList.remove('nologin'); window.__brevet.quiet(); }, [name, pin || null]);
}
/* the right answer to the practice task on screen, typed into the state and checked */
const answerRight = (page) => page.evaluate(() => {
  fieldsOf(P.it.ans).forEach((f, i) => { const sp = f.spec; P.vals['f' + i] = sp.k === 'mcq' ? String(sp.c) : sp.k === 'order' ? sp.items.map((_, k) => k).join(',') : window.__brevet.keyInput(sp); });
  checkPractice(); return { ok: P.ok, ev: P.ev, fb: P.fb ? P.fb.t + ' ' + P.fb.m : '' };
});
const answerWrong = (page) => page.evaluate(() => {
  fieldsOf(P.it.ans).forEach((f, i) => { const sp = f.spec; P.vals['f' + i] = sp.k === 'mcq' ? String((sp.c + 1) % sp.opts.length) : sp.k === 'order' ? sp.items.map((_, k) => k).reverse().join(',') : '987654'; });
  checkPractice(); return { ok: P.ok, ev: P.ev, fb: P.fb ? P.fb.t + ' ' + P.fb.m : '' };
});
/* a student who has worked for a while: mastered topics, reviews due, mistakes, words, a homework, a mock exam */
const seed = (page) => page.evaluate(() => {
  const now = Date.now(), ts = TOPICS.filter((t) => !t.calc && t.ch !== 'lg');
  ts.slice(0, 6).forEach((t, i) => { DB.sk[t.id] = { a: 5, c: 4, s: 3, m: 1, t: now - (6 + i) * 864e5, d: 0, r: '01111', md: now - (6 + i) * 864e5, rv: i % 2, due: now - (i + 1) * 3600e3, tm: 35 + 40 * i }; });
  ts.slice(6, 9).forEach((t) => { DB.sk[t.id] = { a: 7, c: 3, s: 0, m: 0, t: now - 864e5, d: 0, r: '0110100', md: 0, rv: 0, due: 0, tm: 150 }; });
  for (let i = 1; i < 9; i++) { const k = addDaysKey(todayKey(), -i); DB.days[k] = 12 + i; DB.log[k] = { n: 12 + i, ok: 9 + i, tr: 3, w: 4 }; DB.rd[k] = 20 - i; }
  LEXI.filter((e) => e.k === 0).slice(0, 6).forEach((e, i) => { DB.vc[lexLemma(e)] = { n: 1 + i, t: now - i * 864e5, s: i % 4, due: i % 4 === 3 ? 0 : now - 1000 }; });
  DB.exams.push({ mode: 'p1', t0: now - 3 * 864e5, t1: now - 3 * 864e5 + 12e5, p1: 4, p2: 0, note: 4, max: 6, n: 9, ok: 6, weak: ts.slice(6, 8).map((t) => t.id) });
  hwSet(ts.slice(6, 8).map((t) => ({ k: 't', id: t.id, n: 4 })).concat(PROBLEMS[0] ? [{ k: 'p', id: PROBLEMS[0].id, n: 1 }] : [], [{ k: 'x', id: 'quick', n: 1 }]), addDaysKey(todayKey(), 3));
  DB.wu = null; DB.plan = null; save();
});
/* sizes of visible text; task text must be ≥ 15 px, the rest ≥ 12 px */
const textSizes = (page) => page.evaluate(() => {
  const bad = [];
  document.querySelectorAll('body *').forEach((el) => {
    if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return;
    if (el.closest('.katex, svg, #splash, .k, [hidden], .exnum, .opt .l, .ordit .l')) return;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
    const fs = parseFloat(getComputedStyle(el).fontSize); const task = !!el.closest('.instr, .opt, .sol, .hint, .fb, .pctx, .ordit, .prtx, .propt');
    if (fs < (task ? 15 : 12)) bad.push((task ? 'задание ' : '') + el.tagName.toLowerCase() + '.' + el.className + ' ' + fs + 'px «' + el.textContent.trim().slice(0, 20) + '»');
  });
  return bad.slice(0, 5);
});

(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  put('2026-01-01·aaaaaaaa');
  const open = async (opts) => { const c = await browser.newContext(opts || PHONE); const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e))); await p.goto(url); await p.waitForTimeout(300); return [c, p, errs]; };
  const nav = async (page, hash, ms) => { await page.goto(url + hash); await page.waitForTimeout(ms || 220); };

  const info = await (async () => { const [c, p] = await open(); const r = await p.evaluate(() => ({ t: TOPICS.map((t) => [t.id, t.ch]), p: PROBLEMS.map((x) => x.id), ch: CHAPTERS.map((c) => c.id), autos: AUTOS.length, lvl3: TOPICS.filter((t) => t.lvl !== 1 && t.lvl !== 2).length, idx: TOPICS.map((t) => t.id).concat(PROBLEMS.map((x) => x.id)).filter((id) => !IDX.includes(id)) })); await c.close(); return r; })();
  const firstT = info.t[0] && info.t[0][0], firstP = info.p[0];
  console.log('Содержимое: ' + info.t.length + ' тем, ' + info.p.length + ' задач Partie 2');
  ok(!info.lvl3, 'у всех тем уровень «база» или «бревет»');
  ok(!info.idx.length, 'у каждой темы и задачи есть постоянный номер для кода прогресса ' + info.idx.slice(0, 5).join(', '));

  console.log('Вид:');
  for (const [name, w, h, touch] of DEV) {
    for (const scheme of ['light', 'dark']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: 1, hasTouch: touch, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
      await page.goto(url); await page.waitForTimeout(400);
      const screens = [['login', null], ['today', '#/'], ['plan', '#/plan'], ['prog', '#/prog'], ['chapter', '#/ch/' + info.ch[0]], ['practice', '#/t/' + firstT], ['problem', '#/pb/' + firstP], ['fiche', '#/fiche/' + info.ch[0]], ['exams', '#/exam'],
        ['me', '#/me'], ['mots', '#/mots'], ['motsrev', '#/mots/rev'], ['hw', '#/hw'], ['hwnew', '#/hw/new'], ['tutor', '#/tutor'], ['print', '#/pr'], ['sheet', '#/pr/f:' + firstT + ',0,1;' + firstT + ',1,2' + (firstP ? ';' + firstP + ',3' : '')],
        ['data', '#/data'], ['settings', '#/settings'], ['badges', '#/badges'], ['dico', '#/dico']].concat(info.autos ? [['officiel', '#/officiel']] : [], [['eleves', '#/eleves']]);
      let badW = [], small = [];
      for (const [nm, hash] of screens) {
        if (nm === 'today') { await signIn(page, 'Тест'); await seed(page); }
        if (nm === 'eleves') await page.evaluate(async () => { signOut(); await createProfile('Второй', null); signOut(); });
        if (hash) await nav(page, hash);
        if (nm === 'practice') { const wd = await page.$('.instr .w'); if (wd) { await wd.click(); await page.waitForTimeout(80); } }
        const sw = await page.evaluate(() => document.documentElement.scrollWidth);
        if (sw > w) badW.push(nm + ' ' + sw);
        small = small.concat((await textSizes(page)).map((x) => nm + ': ' + x));
        if (name === 'iphone15' || name === 'desktop' || ['today', 'practice', 'problem', 'hwnew', 'sheet'].includes(nm)) await page.screenshot({ path: path.join(WORK, `${name}-${scheme}-${nm}.png`), fullPage: nm !== 'practice' });
      }
      ok(!badW.length, `${name} ${scheme}: нет прокрутки вбок (${screens.length} экранов) ${badW.join(', ')}`);
      ok(!small.length, `${name} ${scheme}: текст не мелкий ${small.slice(0, 3).join('; ')}`);
      ok(errs.length === 0, `${name} ${scheme}: без ошибок JS ${errs.slice(0, 3).join('; ')}`);
      await ctx.close();
    }
  }

  if (!QUICK) {
    console.log('Все темы и задачи на iPhone 15:');
    const [ctx, page, errs] = await open(); await signIn(page, 'Тест');
    const wide = [], jumps = [], small = [];
    const sig = () => page.evaluate(() => [...document.querySelectorAll('#app *')].slice(0, 400).map((e) => { const r = e.getBoundingClientRect(); return Math.round(r.top) + ':' + Math.round(r.height); }).join(','));
    await page.evaluate(() => document.fonts.ready);
    for (const [id] of info.t) {
      for (let k = 0; k < 3; k++) {
        if (k === 0) await nav(page, '#/t/' + id, 80); else { await page.evaluate(() => newQuestion(true)); await page.waitForTimeout(30); }
        const sw = await page.evaluate(() => document.documentElement.scrollWidth); if (sw > 393) wide.push(id + ' ' + sw);
        if (k === 0) { const a = await sig(); await page.evaluate(() => setTr(true)); const b = await sig(); await page.evaluate(() => setTr(false)); if (a !== b) jumps.push(id); small.push(...(await textSizes(page)).map((x) => id + ': ' + x)); }
      }
    }
    for (const id of info.p) {
      await nav(page, '#/pb/' + id, 120);
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
    const [ctx, page, errs] = await open();
    await page.fill('#npName', 'Лея'); await page.fill('#npPin', '2468'); await page.click('#npGo'); await page.waitForTimeout(300);
    await page.evaluate(() => window.__brevet.quiet());
    ok(await page.isVisible('.hello'), 'новый ученик с PIN — открылся экран «Сегодня»');
    await nav(page, '#/t/' + firstT);
    const key = await page.evaluate(() => { const it = P.it; return it.ans.k === 'multi' || it.ans.k === 'mcq' || it.ans.k === 'order' ? null : window.__brevet.keyInput(it.ans); });
    if (key != null) {
      await page.click('#f0'); await page.waitForTimeout(100);
      ok(await page.isVisible('#kb'), 'математическая клавиатура открылась');
      await page.fill('#f0', key.replace(/\./g, ',')); await page.dispatchEvent('#f0', 'input');
      await page.click('#kb [data-k="ENTER"]'); await page.waitForTimeout(200);
      ok(/Верно/.test(await page.textContent('#fb')), 'верный ответ (с десятичной запятой) засчитан: ' + key);
      ok(await page.evaluate(() => Object.values(DB.days)[0] === 1 && DB.rd[todayKey()] != null), 'ответ записан в прогресс, готовность дня тоже');
    }
    await page.evaluate(() => { sessionStorage.clear(); }); await page.reload(); await page.waitForTimeout(300);
    ok(await page.isVisible('[data-prof]'), 'после перезапуска с PIN — экран входа');
    await page.click('[data-prof]'); await page.waitForTimeout(150);
    for (const d of '1111') await page.click('[data-pk="' + d + '"]');
    await page.waitForTimeout(300); ok(await page.isVisible('#sheet'), 'неверный PIN — не пускает');
    for (const d of '2468') await page.click('[data-pk="' + d + '"]');
    await page.waitForTimeout(300); ok(await page.isVisible('.hello'), 'верный PIN — вход');
    await page.evaluate(() => window.__brevet.quiet());
    /* «Перевод» lives for one task */
    await nav(page, '#/t/' + firstT); await page.click('#tTr'); await page.waitForTimeout(80);
    const trOn = await page.evaluate(() => document.documentElement.classList.contains('tr') && dayLog().tr === 1);
    await page.evaluate(() => showSolution()); await page.waitForTimeout(80);
    const trKept = await page.evaluate(() => document.documentElement.classList.contains('tr'));
    await page.evaluate(() => newQuestion()); await page.waitForTimeout(120);
    ok(trOn && trKept && await page.evaluate(() => !document.documentElement.classList.contains('tr') && $('#tTr').getAttribute('aria-pressed') === 'false'), '«Перевод» действует на одно задание (и считается), следующее снова по-французски');
    await page.evaluate(() => { window.__brevet.newExam('blanc'); window.__brevet.go('#/exam/run'); }); await page.waitForTimeout(300);
    ok(/^(19|20):\d\d$/.test(await page.textContent('#tmr')), 'brevet blanc: таймер 20 минут на Partie 1');
    ok(await page.evaluate(() => $('#tTr').hidden && !document.documentElement.classList.contains('tr') && !document.documentElement.classList.contains('words') && !document.querySelector('.w')), 'в пробнике нет ни «Перевода», ни перевода слов — только французский');
    await page.evaluate(() => { DB.cur.parts[0].end = Date.now() + 1500; save(); }); await page.waitForTimeout(2600);
    ok(await page.evaluate(() => DB.cur && DB.cur.part === 1), 'время вышло — Partie 1 собрана, началась Partie 2');
    await page.screenshot({ path: path.join(WORK, 'exam-p2.png') });
    await page.click('#bHand'); await page.waitForTimeout(150); await page.click('#shYes'); await page.waitForTimeout(400);
    ok(await page.evaluate(() => location.hash === '#/exam/res' && DB.exams.length === 1 && DB.exams[0].max === 18), 'пробник завершён, есть результат и разбор');
    ok(await page.evaluate(() => !$('#tTr').hidden && !!document.querySelector('.w')), 'в разборе после пробника перевод и слова снова доступны');
    await page.screenshot({ path: path.join(WORK, 'exam-result.png'), fullPage: true });
    ok(!errs.length, 'без ошибок JS ' + errs.slice(0, 3).join('; '));
    await ctx.close();
  }

  console.log('Обучение: освоение, повторения, разминка, слова:');
  {
    const [ctx, page, errs] = await open(); await signIn(page, 'Мила');
    const tid = await page.evaluate(() => TOPICS.find((t) => !t.calc && t.ch !== 'lg').id);
    await nav(page, '#/t/' + tid);
    ok(await page.isVisible('#swc') && await page.isVisible('.newtip'), 'в задании тихий секундомер и подсказка про перевод слова');
    const openTopic = async (id) => { await page.evaluate((x) => viewPractice(x), id); await page.waitForTimeout(120); };
    let r; for (let i = 0; i < 3; i++) { if (i === 2) await page.waitForTimeout(1200); r = await answerRight(page); if (i < 2) { await page.evaluate(() => newQuestion()); await page.waitForTimeout(60); } }
    const s1 = await page.evaluate((id) => DB.sk[id], tid);
    ok(r.ev === 'new' && s1.m === 1 && Math.round((s1.due - Date.now()) / 864e5) >= 2 && Math.round((s1.due - Date.now()) / 864e5) <= 3, 'три верных подряд — тема освоена, повторение назначено через 3 дня');
    ok(s1.tm > 0, 'время на задание запоминается');
    await page.evaluate((id) => { DB.sk[id].due = Date.now() - 1000; save(); }, tid);
    await openTopic(tid); r = await answerRight(page);
    const s2 = await page.evaluate((id) => DB.sk[id], tid);
    ok(r.ev === 'kept' && s2.rv === 1 && Math.round((s2.due - Date.now()) / 864e5) >= 9 && /через 10 дней/.test(r.fb), 'повторение пройдено — следующее через 10 дней');
    await page.evaluate((id) => { DB.sk[id].due = Date.now() - 1000; save(); }, tid);
    await openTopic(tid); r = await answerWrong(page);
    const s3 = await page.evaluate((id) => DB.sk[id], tid);
    ok(r.ev === 'lost' && !s3.m && /возвращается в работу/.test(r.fb), 'ошибка в повторении — тема снова в работе');
    /* a mistake outside a review does not take the mastery away, but brings the topic into the next warm-up */
    const tid2 = await page.evaluate(() => { const t = TOPICS.filter((x) => !x.calc && x.ch !== 'lg')[1]; DB.sk[t.id] = { a: 3, c: 3, s: 3, m: 1, t: Date.now(), r: '111', md: Date.now(), rv: 1, due: plusDays(Date.now(), 10) }; save(); return t.id; });
    await openTopic(tid2); await answerWrong(page);
    ok(await page.evaluate((id) => DB.sk[id].m === 1 && isDue(id), tid2), 'ошибка в освоенной теме вне повторения: освоение остаётся, тема придёт в разминку');
    await seed(page); await nav(page, '#/');
    ok(/разминка/i.test(await page.textContent('.fplan')), 'на «Сегодня» первым шагом — разминка');
    await page.click('#bGo'); await page.waitForTimeout(350);
    const wu = await page.evaluate(() => ({ hash: location.hash, n: DB.wu.items.length, calc: DB.wu.items.some((x) => TP(x.tid).gen(mkRng(x.seed), x.vi).calc), due: isDue(DB.wu.items[0].tid) }));
    ok(wu.hash === '#/t/wu' && wu.n === 5 && !wu.calc && wu.due, '«Заниматься» открывает разминку: 5 вопросов без калькулятора, первыми — темы, которым пора повториться');
    for (let i = 0; i < wu.n; i++) { await answerRight(page); await page.evaluate(() => newQuestion()); await page.waitForTimeout(80); }
    ok(/Разминка: 5 из 5/.test(await page.textContent('#app')), 'после пяти ответов — итог разминки и шаг дальше');
    /* words */
    await openTopic(tid);
    const w = await page.$('.instr .w');
    if (w) {
      const before = await page.evaluate(() => Object.keys(DB.vc).length);
      await w.tap(); await page.waitForTimeout(120);
      ok(await page.isVisible('#wpop') && await page.evaluate((b) => Object.keys(DB.vc).length >= b && dayLog().w >= 1, before), 'нажатие на слово в условии показывает перевод и считает слово');
      await page.screenshot({ path: path.join(WORK, 'word.png') });
      await page.tap('.qname'); await page.waitForTimeout(80);
      ok(!(await page.$('#wpop')), 'нажатие мимо закрывает перевод слова');
    }
    await nav(page, '#/mots/rev');
    ok(await page.isVisible('#wShow'), '«Мои слова»: есть что повторить');
    await page.click('#wShow'); await page.waitForTimeout(80); const lemma = await page.textContent('.wbig'); await page.click('#wYes'); await page.waitForTimeout(80);
    ok(await page.evaluate((l) => DB.vc[l].s >= 1 && (DB.vc[l].s >= 3 || DB.vc[l].due > Date.now()), lemma), '«Помню» — слово уходит на следующий срок');
    ok(!errs.length, 'без ошибок JS ' + errs.slice(0, 3).join('; '));
    await ctx.close();
  }

  console.log('Код прогресса и домашнее задание: ученик → репетитор → ученик → репетитор:');
  {
    const errs = [];
    const mk = async () => { const [c, p, e] = await open(); p.on('pageerror', (x) => errs.push(String(x))); return [c, p, e]; };
    const [cs, st] = await mk(); await signIn(st, 'Мила', '1357');
    await st.evaluate(() => { for (let i = 0; i < 12; i++) record(TOPICS[i % 3].id, true); });
    await nav(st, '#/');
    ok(await st.isVisible('#bCode'), 'после 10 заданий на «Сегодня» честное напоминание и кнопка «Отправить код»');
    await st.click('#bCode'); await st.waitForTimeout(300);
    const msg1 = await st.inputValue('#sheet textarea');
    ok(/BRV3\.[A-Za-z0-9_-]+$/.test(msg1) && msg1.length < 4096, 'код готов, сообщение ' + msg1.length + ' знаков');
    await st.click('#cCopy'); await st.waitForTimeout(100);
    ok(await st.evaluate(() => DB.bk.at > 0), 'после копирования напоминание сбрасывается');
    const [ct, tu] = await mk(); await signIn(tu, 'Тимур');
    await nav(tu, '#/me'); await tu.click('#bPaste'); await tu.fill('#mvCode', 'Вот мой код:\n' + msg1); await tu.click('#mvGo'); await tu.waitForTimeout(300);
    await tu.click('#shYes'); await tu.waitForTimeout(400);
    ok(await tu.evaluate(() => DB.name === 'Мила' && totalTasks() === 12 && profiles().length === 2), 'у репетитора появилась Мила с её прогрессом, Тимур остался');
    /* a lesson on the tutor's device, then a homework */
    await tu.evaluate(() => { window.__brevet.quiet(); for (let i = 0; i < 5; i++) record(TOPICS[5].id, true); });
    await nav(tu, '#/hw/new');
    await tu.evaluate((ch) => { document.querySelector('details[data-ch="' + ch + '"]').open = true; }, info.t[6][1]);
    await tu.click('[data-t="' + info.t[6][0] + '"][data-n="3"]'); await tu.waitForTimeout(100);
    if (firstP) await tu.evaluate((id) => { HWB.items['p:' + id] = { k: 'p', id, n: 1 }; viewHwNew(); }, firstP);
    await tu.click('#hbGo'); await tu.waitForTimeout(700);
    const msg2 = await tu.inputValue('#sheet textarea');
    ok(/BRV3\./.test(msg2) && await tu.evaluate(() => DB.hw && DB.hw.items.length >= 1 && location.hash === '#/hw'), 'репетитор задал домашнее задание — сразу готов код для ученика');
    await tu.evaluate(() => closeSheet());
    await nav(st, '#/me'); await st.click('#bPaste'); await st.fill('#mvCode', msg2); await st.click('#mvGo'); await st.waitForTimeout(300);
    ok(await st.isVisible('#rsGo') && /новое домашнее задание/.test(await st.textContent('#sheet')), 'у ученика код узнаётся как его собственный; перед загрузкой видно «сейчас / в коде» и что есть новое задание');
    await st.click('#rsGo'); await st.waitForTimeout(300);
    ok(await st.evaluate(() => totalTasks() === 17 && !!skOf(TOPICS[5].id).m && profOf(DB.id).pin), 'урок у репетитора добавился (12 + 5), PIN ученика на месте');
    ok(await st.evaluate(() => snaps(DB.id).length >= 1), 'перед загрузкой сохранилась копия прежнего состояния');
    await nav(st, '#/');
    ok(await st.isVisible('.hwc') && await st.evaluate(() => document.querySelector('#app .card').classList.contains('hwc') || document.querySelector('#app section').classList.contains('hwc')), 'домашнее задание — первой карточкой на «Сегодня»');
    await st.screenshot({ path: path.join(WORK, 'hw-today.png'), fullPage: true });
    await st.evaluate(() => { DB.wu = { day: todayKey(), items: [], i: 0, ok: 0 }; save(); });
    await nav(st, '#/t/hw');
    for (let i = 0; i < 6; i++) { if (!(await st.evaluate(() => !!P && P.mode === 'hw'))) break; await answerRight(st); await st.evaluate(() => newQuestion()); await st.waitForTimeout(80); }
    ok(await st.evaluate(() => DB.hw.items[0].done === 3 && DB.hw.items[0].ok === 3), 'три задания темы из ДЗ сделаны и засчитаны');
    if (firstP) {
      await nav(st, '#/pb/' + firstP);
      await st.evaluate(() => { Q2.p.qs.forEach((q, qi) => { fieldsOf(q.ans).forEach((f, i) => { const sp = f.spec; Q2.st[qi].vals['q' + qi + 'f' + i] = sp.k === 'mcq' ? String(sp.c) : sp.k === 'order' ? sp.items.map((_, k) => k).join(',') : window.__brevet.keyInput(sp); }); checkProblemQ(qi); }); });
      await st.waitForTimeout(150);
    }
    ok(await st.evaluate(() => DB.hw.doneAt > 0 && DB.hwh.length === 1), 'всё задание выполнено — оно отмечено и попало в историю');
    await st.evaluate(() => window.__brevet.quiet()); await nav(st, '#/');
    ok(await st.isVisible('#bHwCode'), 'приложение предлагает отправить код репетитору');
    await st.click('#bHwCode'); await st.waitForTimeout(300); const msg3 = await st.inputValue('#sheet textarea');
    await nav(tu, '#/tutor'); await tu.click('#tPaste'); await tu.fill('#mvCode', msg3); await tu.click('#mvGo'); await tu.waitForTimeout(300); await tu.click('#rsGo'); await tu.waitForTimeout(300);
    ok(await tu.evaluate(() => DB.hw.doneAt > 0 && hwTotals(DB.hw).done === hwTotals(DB.hw).n && totalTasks() === DB.days[todayKey()]), 'репетитор видит: домашнее задание выполнено, счёт заданий сходится');
    await nav(st, '#/t/' + firstT);
    await st.evaluate(() => showSolution()); await st.waitForTimeout(150);
    ok(await st.isVisible('#bReport'), 'в разборе есть «Нашёл ошибку в задании? Сообщить»');
    ok(!errs.length, 'без ошибок JS ' + errs.slice(0, 3).join('; '));

    console.log('Репетитор: ученики, сводка, режим урока:');
    await tu.evaluate(() => { signOut(); go('#/login'); }); await tu.waitForTimeout(250);
    ok(await tu.isVisible('a[href="#/eleves"]'), 'два профиля на устройстве — на экране входа есть «Ученики»');
    await tu.click('a[href="#/eleves"]'); await tu.waitForTimeout(300);
    ok(await tu.evaluate(() => document.querySelectorAll('.stud').length === 2 && /Мила/.test($('#app').textContent) && /готовность/.test($('#app').textContent)), 'обзор показывает обоих учеников');
    await tu.screenshot({ path: path.join(WORK, 'eleves.png'), fullPage: true });
    await tu.evaluate(() => { const b = [...document.querySelectorAll('[data-sum]')].find((x) => /Мила/.test(x.closest('.stud').textContent)); b.click(); }); await tu.waitForTimeout(200);
    const sum = await tu.inputValue('#psText');
    const nMila = await tu.evaluate(() => dbTasks(peekDb(profiles().find((p) => p.name === 'Мила').id)));
    ok(/Мила/.test(sum) && sum.includes('Решено заданий: ' + nMila + ',') && /Домашние задания: 1, выполнено полностью: 1/.test(sum), 'сводка для родителей: имя, задания за неделю (' + nMila + '), домашнее задание');
    await tu.evaluate(() => { closeSheet(); [...document.querySelectorAll('[data-open]')].find((x) => /Мила/.test(x.closest('.stud').textContent) && x.dataset.to === '#/').click(); }); await tu.waitForTimeout(300);
    ok(await tu.evaluate(() => DB && DB.name === 'Мила' && location.hash === '#/'), 'из обзора открывается профиль ученика');
    await nav(tu, '#/tutor'); await tu.click('#tLesson'); await tu.waitForTimeout(150);
    if (firstP) {
      await nav(tu, '#/pb/' + firstP);
      const both = await tu.evaluate(() => { const b = document.querySelector('.pq .bi'); const f = getComputedStyle(b.querySelector('.l-fr')), r = getComputedStyle(b.querySelector('.l-ru')); return f.visibility === 'visible' && r.visibility === 'visible' && $('#tTr').hidden; });
      await tu.evaluate(() => document.querySelector('[data-sol="0"]').click()); await tu.waitForTimeout(150);
      const steps = await tu.evaluate(() => ({ shown: document.querySelectorAll('#pq0 .sol .stp').length, all: Q2.p.qs[0].sol.length, btn: !!document.querySelector('[data-stepq="0"]') }));
      ok(both && steps.shown === 1 && (steps.all === 1 || steps.btn), 'режим урока: французский и русский вместе, решение открывается по шагам');
      await tu.screenshot({ path: path.join(WORK, 'lesson.png'), fullPage: true });
    }
    await tu.evaluate(() => setLesson(false));

    console.log('Печать и PDF:');
    await tu.evaluate(() => { window.print = () => { window.__printed = document.body.className + '|' + document.title; }; });
    for (const [tab, kind] of [['f', 'f'], ['m', 'f'], ['a', 'a'], ['p', 'p'], ['b', 'b']]) {
      if (tab === 'p' && !firstP) continue;
      await tu.evaluate(() => go('#/pr')); await tu.waitForTimeout(200);
      await tu.click('[data-tab="' + tab + '"]'); await tu.waitForTimeout(100);
      if (tab === 'f') await tu.selectOption('#prTopic', firstT);
      if (tab === 'm') await tu.evaluate((ids) => { ids.forEach((id) => { PRB.mix[id] = 1; }); viewPrint(); }, info.t.slice(0, 3).map((x) => x[0]));
      if (tab === 'p') await tu.selectOption('#prPb', firstP);
      await tu.waitForTimeout(100); await tu.click('#prGo'); await tu.waitForTimeout(450);
      const res = await tu.evaluate(() => ({ hash: location.hash, items: document.querySelectorAll('.paper.tasks .pritem').length, keys: document.querySelectorAll('.paper.key .pritem').length, cyr: /[а-яё]/i.test(document.querySelector('.paper.tasks').textContent), wide: document.documentElement.scrollWidth > innerWidth }));
      ok(res.hash.startsWith('#/pr/' + kind + ':') && res.items > 0 && res.items === res.keys && !res.cyr && !res.wide, ({ f: 'лист по теме', m: 'смешанный лист', a: 'вариант Partie 1', p: 'задача Partie 2', b: 'Brevet blanc' })[tab] + ': ' + res.items + ' пунктов, ответов столько же, в заданиях нет русского текста');
      if (tab === 'f' || tab === 'b') {
        await tu.click('#prT'); const t1 = await tu.evaluate(() => window.__printed);
        await tu.emulateMedia({ media: 'print' });
        const vis = await tu.evaluate(() => ({ tasks: getComputedStyle($('.paper.tasks')).display !== 'none', key: getComputedStyle($('.paper.key')).display !== 'none', bar: getComputedStyle($('#appbar')).display !== 'none', tool: getComputedStyle($('.prtool')).display !== 'none' }));
        const pdf = await tu.pdf({ path: path.join(WORK, 'print-' + tab + '-tasks.pdf'), format: 'A4', preferCSSPageSize: true });
        await tu.emulateMedia({ media: 'screen' });
        await tu.click('[data-o="sol:1"]'); await tu.waitForTimeout(150); await tu.click('#prK'); const t2 = await tu.evaluate(() => window.__printed);
        await tu.emulateMedia({ media: 'print' });
        const vis2 = await tu.evaluate(() => ({ tasks: getComputedStyle($('.paper.tasks')).display !== 'none', key: getComputedStyle($('.paper.key')).display !== 'none', sol: !!document.querySelector('.paper.key .prsol') }));
        await tu.pdf({ path: path.join(WORK, 'print-' + tab + '-key.pdf'), format: 'A4', preferCSSPageSize: true });
        await tu.emulateMedia({ media: 'screen' });
        ok(/pr-tasks/.test(t1) && /задания/.test(t1) && vis.tasks && !vis.key && !vis.bar && !vis.tool && pdf.length > 5000, 'печать заданий: на бумаге только лист заданий');
        ok(/pr-key/.test(t2) && /ответы/.test(t2) && !vis2.tasks && vis2.key && vis2.sol, 'печать ответов: отдельный документ, с решениями по выбору');
      }
      if (tab === 'f') {
        const h1 = await tu.evaluate(() => location.hash); const txt1 = await tu.evaluate(() => $('.paper.tasks').textContent);
        await tu.reload(); await tu.waitForTimeout(400);
        ok(await tu.evaluate(([h, t]) => location.hash === h && $('.paper.tasks').textContent === t, [h1, txt1]), 'лист по ссылке открывается снова с теми же числами');
        await tu.evaluate(() => { window.print = () => { window.__printed = document.body.className + '|' + document.title; }; });
      }
    }
    ok(!errs.length, 'без ошибок JS ' + errs.slice(0, 3).join('; '));
    await cs.close(); await ct.close();
  }

  console.log('Прогресс первой версии:');
  {
    const [ctx, page, errs] = await open();
    await page.evaluate(([t0, t1]) => {
      const id = 'pold12345', now = Date.now();
      const db = { v: 1, id, name: 'Старый', created: now - 9e8, saved: now - 1e6, sk: {}, pb: {}, days: {}, log: {}, goal: 0, goalH: {}, exams: [], cur: null, diag: null, badges: {}, bk: { at: 0, n: 0 }, ru: true, tipTr: 1, kbd: false, vib: true, pinAsk: true };
      db.sk[t0] = { a: 4, c: 4, s: 4, m: 1, t: now - 8e8, r: '1111' }; db.sk[t1] = { a: 2, c: 1, s: 0, m: 0, t: now - 8e8, r: '10' };
      db.days['2026-11-20'] = 6; db.log['2026-11-20'] = { n: 6, ok: 5 };
      localStorage.setItem('brevet:profiles', JSON.stringify([{ id, name: 'Старый', pin: null, at: now }]));
      localStorage.setItem('brevet:db:' + id, JSON.stringify(db)); localStorage.setItem('brevet:last', JSON.stringify(id));
    }, [info.t[0][0], info.t[1][0]]);
    await page.reload(); await page.waitForTimeout(400);
    const m = await page.evaluate((t0) => ({ v: DB.v, name: DB.name, due: isDue(t0), tasks: totalTasks(), ru: 'ru' in DB, snaps: snaps(DB.id).map((s) => s.db.v + ':' + s.why), tr: document.documentElement.classList.contains('tr') }), info.t[0][0]);
    ok(m.v === 2 && m.name === 'Старый' && m.tasks === 6 && m.due && !m.ru && !m.tr, 'прогресс первой версии открылся в новой: всё на месте, освоенной теме назначено повторение');
    ok(m.snaps.length === 1 && /^1:перед обновлением/.test(m.snaps[0]), 'прежний прогресс сохранён копией «перед обновлением приложения»');
    ok(!errs.length, 'без ошибок JS ' + errs.slice(0, 3).join('; '));
    await ctx.close();
  }

  console.log('Компьютер:');
  {
    const [ctx, page, errs] = await open({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, hasTouch: false, reducedMotion: 'reduce' });
    await signIn(page, 'Ника'); await nav(page, '#/t/' + firstT);
    const d = await page.evaluate(() => ({ rail: getComputedStyle($('#tabbar')).width, mode: ($('#f0') || {}).inputMode, focus: document.activeElement && document.activeElement.id, kbBtn: $('#tKb').hidden }));
    ok(d.rail === '216px' && d.kbBtn, 'разделы — в боковой колонке, кнопки экранной клавиатуры нет');
    if (d.mode != null) {
      ok(d.mode === 'text' && d.focus === 'f0', 'поле ответа обычное (клавиатура компьютера) и уже с курсором');
      const key = await page.evaluate(() => window.__brevet.keyInput(P.it.ans));
      await page.keyboard.type(String(key)); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
      ok(await page.evaluate(() => P.done && P.ok), 'ответ с клавиатуры и Enter — проверено');
      await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
      ok(await page.evaluate(() => !P.done), 'Enter ещё раз — следующее задание');
    }
    ok(!errs.length, 'без ошибок JS ' + errs.slice(0, 3).join('; '));
    await ctx.close();
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
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.evaluate(() => window.__upd.check());
    await page.waitForFunction(() => window.__upd && window.__upd.build === '2026-01-02·bbbbbbbb', null, { timeout: 6000 }).catch(() => {});
    ok(await page.evaluate(() => window.__upd.build) === '2026-01-02·bbbbbbbb', 'новая сборка, ученик свободен — обновилось само');
    ok(!/[?&]v=/.test(page.url()), 'адрес после обновления чистый');
    ok(await page.evaluate(() => !!(DB && DB.name === 'Ника')), 'после обновления ученик на месте');
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
