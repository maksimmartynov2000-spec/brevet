// Код прогресса (BRV3): помещается ли в одно сообщение Telegram (< 4096 знаков) после целого года занятий,
// возвращает ли тот же прогресс, как объединяются копии ученика и репетитора, читаются ли старые коды и файлы.
// node tests/backup.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');
const load = require('./load');
const A = load();
const ctx = A.ctx;
const mem = {};
Object.assign(ctx, {
  document: { addEventListener() {} }, window: { addEventListener() {} },
  localStorage: { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } },
  sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  TextEncoder, TextDecoder, btoa, atob, Blob, Response, DecompressionStream, CompressionStream, setTimeout, clearTimeout
});
for (const f of ['30-store.js', '32-code.js']) vm.runInContext(fs.readFileSync(path.resolve(__dirname, '..', 'src', 'js', f), 'utf8'), ctx, { filename: f });
vm.runInContext('this.__S = { IDX, BADGE_IDS, newDb, migrate, packV3, unpackV3, progressCode, readCode, readBackup, sanitizeDb, mergeDb, dbSummary, dbTasks, plusDays, fnv32, lexLemma, hwTotals, openProfile, snaps, LS, get DB() { return DB; }, DBV };', ctx);
const S = ctx.__S;

let fails = 0;
const ok = (c, what) => { console.log((c ? '  ✓ ' : '  ✗ ') + what); if (!c) fails++; };
const MINUTE = 60000, DAY = 864e5;
const day0 = new Date(2026, 10, 25, 15, 0, 0).getTime();
const ymd = (ms) => { const d = new Date(ms); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

/* room for growth: the size is measured for 120 topics and 55 problems, more than the app has */
const TOPIC_IDS = A.TOPICS.map((t) => t.id), PROB_IDS = A.PROBLEMS.map((p) => p.id);
while (TOPIC_IDS.length < 120) { const id = 'zz.reserve-topic-' + TOPIC_IDS.length; TOPIC_IDS.push(id); S.IDX.push(id); }
while (PROB_IDS.length < 55) { const id = 'p2.reserve-probleme-' + PROB_IDS.length; PROB_IDS.push(id); S.IDX.push(id); }
const LEMMAS = A.LEXI.filter((e) => e.k === 0).map((e) => S.lexLemma(e));

/* a whole school year, generously: every topic tried and reviewed, 230 days of work, 30 tests, all problems,
   all badges, 60 words looked up, a homework of 20 items and three earlier ones, readiness for 200 days */
function yearDb() {
  const d = S.newDb('Мила'); let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  TOPIC_IDS.forEach((id) => {
    const t = day0 + Math.floor(rnd() * 210) * DAY + Math.floor(rnd() * 300) * MINUTE, m = rnd() < 0.8 ? 1 : 0;
    const r = [...Array(8)].map(() => (rnd() < 0.7 ? '1' : '0')).join('');
    d.sk[id] = { a: 5 + Math.floor(rnd() * 160), c: Math.floor(rnd() * 50), s: (/1*$/.exec(r) || [''])[0].length, m, t, d: rnd() < 0.1 ? 1 : 0, r,
      md: m ? S.plusDays(t, -Math.floor(rnd() * 150)) : 0, rv: m ? Math.floor(rnd() * 5) : 0, due: m ? S.plusDays(t, 3 + Math.floor(rnd() * 28)) : 0, tm: 20 + 2 * Math.floor(rnd() * 100) };
  });
  PROB_IDS.forEach((id) => { d.pb[id] = { n: 1 + Math.floor(rnd() * 5), best: Math.round(rnd() * 100) / 100, last: Math.round(rnd() * 100) / 100, t: day0 + Math.floor(rnd() * 210) * DAY }; });
  for (let i = 0; i < 230; i++) {
    if (rnd() < 0.15) continue;
    const k = ymd(day0 + i * DAY), n = 10 + Math.floor(rnd() * 40);
    d.days[k] = n; d.log[k] = { n, ok: Math.floor(n * (0.5 + rnd() / 2)), tr: Math.floor(rnd() * 12), w: Math.floor(rnd() * 20) }; d.goalH[k] = 15; d.rd[k] = Math.min(100, Math.floor(i / 2.5));
  }
  for (let i = 0; i < 30; i++) { const t0 = day0 + i * 7 * DAY + 600 * MINUTE; d.exams.push({ mode: ['p1', 'p2', 'blanc', 'quick'][i % 4], t0, t1: t0 + 100 * MINUTE, p1: Math.round(rnd() * 60) / 10, p2: Math.round(rnd() * 120) / 10, note: 0, max: 18, n: 30, ok: 20, weak: TOPIC_IDS.slice(i, i + 10) }); }
  d.exams.forEach((e) => { e.note = Math.round((e.p1 + e.p2) * 10) / 10; });
  S.BADGE_IDS.forEach((b, i) => { d.badges[b] = S.plusDays(day0, i * 9); });
  d.diag = { at: S.plusDays(day0, 1), n: 16, ok: 11 };
  LEMMAS.slice(0, 60).forEach((l, i) => { const t = S.plusDays(day0, 100 + i); d.vc[l] = { n: 1 + (i % 5), t, s: i % 4, due: i % 4 === 3 ? 0 : S.plusDays(t, [1, 4, 14][i % 3]) }; });
  const hwId = Math.floor((day0 + 200 * DAY) / MINUTE) * MINUTE;
  d.hw = { id: hwId, due: ymd(hwId + 5 * DAY), doneAt: 0, items: TOPIC_IDS.slice(0, 16).map((id) => ({ k: 't', id, n: 5, done: 3, ok: 2 })).concat(PROB_IDS.slice(0, 3).map((id) => ({ k: 'p', id, n: 1, done: 1, ok: 1 })), [{ k: 'x', id: 'blanc', n: 1, done: 0, ok: 0 }]) };
  d.hwh = [1, 2, 3].map((i) => ({ id: hwId - i * 7 * DAY, due: ymd(hwId - i * 7 * DAY + 5 * DAY), n: 40, done: 38, ok: 30, doneAt: hwId - i * 7 * DAY + 3 * DAY }));
  d.goal = 15; d.bs = 41; d.bk = { at: day0 + 190 * DAY, n: 5000 };
  return d;
}

(async () => {
  const db = yearDb();
  const code = S.progressCode(db);
  const msg = 'Brevet · Мила · 25 июня\n' + code;
  console.log('Год занятий: ' + TOPIC_IDS.length + ' тем, ' + PROB_IDS.length + ' задач, ' + Object.keys(db.days).length + ' дней, ' + db.exams.length + ' пробников, слов ' + Object.keys(db.vc).length + ' → код ' + code.length + ' знаков, сообщение ' + msg.length);
  ok(msg.length < 4096, 'сообщение с кодом короче 4096 знаков (лимит Telegram)');
  ok(/^BRV3\.[A-Za-z0-9_-]+$/.test(code), 'в коде только буквы, цифры, «-» и «_»: мессенджер его не испортит');

  const back = await S.readCode('Привет! Вот мой код:\n' + msg + '\nСпасибо');
  const a = S.dbSummary(db), b = S.dbSummary(back);
  ok(a.tasks === b.tasks && a.topics === b.topics && a.probs === b.probs, 'после кода те же числа: заданий ' + b.tasks + ', тем освоено ' + b.topics + ', задач ' + b.probs);
  ok(back.src === db.id && back.name === 'Мила', 'код знает, чей это прогресс (id и имя)');
  const sameSk = TOPIC_IDS.every((id) => { const x = db.sk[id], y = back.sk[id]; return y && x.a === y.a && x.m === y.m && x.r === y.r && x.s === y.s && x.d === y.d && x.rv === y.rv && x.due === y.due && x.md === y.md && x.tm === y.tm && Math.abs(x.t - y.t) < MINUTE; });
  ok(sameSk, 'по каждой теме на месте: попытки, освоение, последние ответы, повторения (когда следующее), время на задание');
  ok(PROB_IDS.every((id) => { const x = db.pb[id], y = back.pb[id]; return y && x.n === y.n && Math.abs(x.best - y.best) < 0.006 && Math.abs(x.last - y.last) < 0.006; }), 'задачи Partie 2 на месте');
  const lastDays = Object.keys(db.days).sort().slice(-20);
  ok(lastDays.every((k) => back.days[k] === db.days[k] && back.log[k].ok === db.log[k].ok && back.log[k].tr === db.log[k].tr && back.log[k].w === db.log[k].w && back.goalH[k] === 15), 'последние недели — по дням: задания, верные, переводы, слова, цель дня');
  ok(back.old && back.old.n + Object.values(back.days).reduce((s, x) => s + x, 0) === a.tasks && back.old.days + Object.keys(back.days).length === Object.keys(db.days).length, 'более ранние дни — одной суммой, без потерь');
  ok(back.exams.length === 12 && Math.abs(back.exams[11].p1 - db.exams[29].p1) < 1e-9 && back.exams[11].note === db.exams[29].note && back.exams[11].weak.length === 10 && Math.abs(back.exams[11].t0 - db.exams[29].t0) < MINUTE, 'последние 12 пробников и «что повторить» последнего на месте');
  ok(S.BADGE_IDS.every((k) => back.badges[k] === db.badges[k]) && back.diag.ok === 11 && back.bs === 41 && back.goal === 15, 'значки, стартовая проверка, лучшая серия, цель дня на месте');
  const vb = Object.keys(back.vc);
  ok(vb.length === 30 && vb.every((k) => db.vc[k] && db.vc[k].s === back.vc[k].s && db.vc[k].due === back.vc[k].due && db.vc[k].n === back.vc[k].n) && vb.filter((k) => back.vc[k].s < 3).length === 30, '«Мои слова»: 30 слов, которые ещё учатся, со стадией и датой повторения');
  ok(JSON.stringify(back.hw) === JSON.stringify(db.hw) && JSON.stringify(back.hwh) === JSON.stringify(db.hwh), 'домашнее задание и три прошлых на месте');
  const rk = Object.keys(db.rd).sort(), rl = rk[rk.length - 1];
  ok(Object.keys(back.rd).length === 3 && back.rd[rl] === db.rd[rl], 'готовность: сейчас, неделю и месяц назад');

  /* the same code again from the copy that came out of a code: nothing drifts */
  const again = await S.readCode(S.progressCode(Object.assign(JSON.parse(JSON.stringify(back)), { id: back.src })));
  ok(S.dbTasks(again) === a.tasks && again.old.upto === back.old.upto && TOPIC_IDS.every((id) => again.sk[id].due === back.sk[id].due && again.sk[id].t === back.sk[id].t), 'код из копии, пришедшей кодом, даёт то же самое');

  /* tutor ↔ student */
  console.log('Ученик ↔ репетитор');
  const t0 = TOPIC_IDS[0], t1 = TOPIC_IDS[1];
  const tutor = JSON.parse(JSON.stringify(back)); tutor.id = back.src;
  const lastK = Object.keys(db.days).sort().pop(), next = ymd(S.plusDays(new Date(+lastK.slice(0, 4), +lastK.slice(5, 7) - 1, +lastK.slice(8, 10)).getTime(), 1));
  const lesson = S.plusDays(day0, 400) + 17 * 60 * MINUTE;
  tutor.days[next] = 25; tutor.log[next] = { n: 25, ok: 20, tr: 2, w: 3 };
  tutor.sk[t0] = Object.assign({}, tutor.sk[t0], { a: tutor.sk[t0].a + 5, m: 1, r: '11111111', s: 8, t: lesson, md: lesson, rv: 0, due: S.plusDays(lesson, 3) });
  const hw2 = { id: Math.floor(lesson / MINUTE) * MINUTE, due: null, doneAt: 0, items: [{ k: 't', id: t1, n: 6, done: 0, ok: 0 }, { k: 'p', id: PROB_IDS[0], n: 1, done: 0, ok: 0 }] };
  tutor.hwh.push(Object.assign({ id: tutor.hw.id, due: tutor.hw.due, doneAt: 0 }, S.hwTotals(tutor.hw))); tutor.hw = hw2;
  const fromTutor = await S.readCode(S.progressCode(tutor));
  const merged = S.mergeDb(db, fromTutor);
  ok(merged.days[next] === 25 && merged.sk[t0].a === db.sk[t0].a + 5 && merged.sk[t0].m === 1 && merged.sk[t0].r === '11111111' && merged.sk[t0].due === S.plusDays(lesson, 3), 'урок на устройстве репетитора добавился к прогрессу ученика (тема освоена, повторение через 3 дня)');
  ok(S.dbTasks(merged) === a.tasks + 25, 'ничего не потерялось и не задвоилось: ' + S.dbTasks(merged) + ' заданий');
  ok(merged.sk[t1].c === db.sk[t1].c && merged.sk[t1].r === db.sk[t1].r, 'темы, которых на уроке не касались, остались как были');
  ok(merged.hw && merged.hw.id === hw2.id && merged.hw.items.length === 2 && merged.hwh.some((h) => h.id === db.hw.id), 'новое домашнее задание пришло с кодом, прежнее ушло в историю');
  /* the student does the homework; the code goes back to the tutor */
  merged.hw.items[0].done = 6; merged.hw.items[0].ok = 5; merged.hw.items[1].done = 1; merged.hw.items[1].ok = 1; merged.hw.doneAt = hw2.id + 2 * DAY;
  const backToTutor = S.mergeDb(tutor, await S.readCode(S.progressCode(merged)));
  ok(backToTutor.hw.id === hw2.id && backToTutor.hw.items[0].done === 6 && backToTutor.hw.items[0].ok === 5 && backToTutor.hw.doneAt === hw2.id + 2 * DAY, 'репетитор видит, что домашнее задание сделано');
  ok(S.dbTasks(backToTutor) === a.tasks + 25, 'у репетитора то же число заданий, что у ученика');
  /* an older state never overrides a newer one */
  const stale = JSON.parse(JSON.stringify(fromTutor)); stale.sk[t0] = Object.assign({}, db.sk[t0], { t: db.sk[t0].t - DAY, m: 0, r: '000' });
  ok(S.mergeDb(merged, stale).sk[t0].m === 1, 'старая копия не отменяет то, что сделано позже');

  /* damaged codes */
  console.log('Повреждённые и старые коды');
  const bad = async (c) => { try { await S.readCode(c); return false; } catch (e) { return /повреждён|не до конца|Не нашёл/.test(e.message); } };
  ok(await bad(code.slice(0, code.length - 40)), 'обрезанный код не читается, а объясняет, что не так');
  ok(await bad(code.slice(0, 200) + (code[200] === 'A' ? 'B' : 'A') + code.slice(201)), 'код с испорченным знаком не читается');
  ok(await bad('просто текст без кода'), 'текст без кода — понятное сообщение');

  /* the codes of the first version (BRV2: JSON, deflated) are still read */
  const DAY0 = Date.UTC(2026, 0, 1) / DAY, t2d = (t) => (t ? Math.max(0, Math.round(t / DAY - DAY0)) : -1);
  const v1 = { v: 1, id: 'pabc12345', name: 'Тимур', created: day0, sk: {}, pb: {}, days: {}, log: {}, goalH: {}, badges: { first: day0 }, exams: [], bk: { at: 0, n: 0 }, ru: true, tipTr: 1 };
  A.TOPICS.slice(0, 20).forEach((t, i) => { v1.sk[t.id] = { a: 6 + i, c: 4, s: i % 4, m: i % 2, t: day0 + i * DAY, d: 0, r: '0111' }; });
  A.PROBLEMS.slice(0, 5).forEach((p) => { v1.pb[p.id] = { n: 2, best: 0.75, last: 0.5, t: day0 + DAY }; });
  for (let i = 0; i < 10; i++) { const k = ymd(day0 + i * DAY); v1.days[k] = 12; v1.log[k] = { n: 12, ok: 9 }; }
  const sk2 = {}; for (const k in v1.sk) { const s = v1.sk[k], i = k.indexOf('.'); (sk2[k.slice(0, i)] = sk2[k.slice(0, i)] || {})[k.slice(i + 1)] = [s.a, s.c, s.s, s.m, t2d(s.t), parseInt('1' + s.r, 2)]; }
  const pb2 = {}; for (const k in v1.pb) pb2[k.replace(/^p2\./, '')] = [2, 75, 50, t2d(v1.pb[k].t)];
  const ks = Object.keys(v1.days).sort(), k2d = (k) => Math.round(Date.UTC(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10)) / DAY - DAY0);
  const p2 = { a: 'brevet', v: 2, id: v1.id, n: v1.name, c: t2d(v1.created), sk: sk2, pb: pb2, d0: k2d(ks[0]), dn: ks.map((k) => v1.days[k]), ex: [], bd: { first: t2d(day0) }, dg: 0, g: 0 };
  const old = await S.readCode('BRV2.' + zlib.deflateRawSync(Buffer.from(JSON.stringify(p2))).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''));
  ok(old.name === 'Тимур' && S.dbTasks(old) === 120 && Object.keys(old.sk).length === 20 && Object.keys(old.pb).length === 5, 'код первой версии (BRV2) читается: 120 заданий, 20 тем, 5 задач');
  const m0 = A.TOPICS[1].id;
  ok(old.sk[m0].m === 1 && old.sk[m0].due > 0 && old.sk[m0].md > 0 && old.sk[A.TOPICS[0].id].due === 0, 'освоенным темам из старого кода назначено повторение');

  /* a progress file of the first version, and the same progress opened on the device */
  const file = S.readBackup({ app: 'brevet', kind: 'progress', v: 1, at: day0, db: JSON.parse(JSON.stringify(v1)) });
  ok(file.src === v1.id && S.dbTasks(file) === 120 && file.sk[m0].due > 0 && file.tips.tr === 1 && !('ru' in file), 'файл копии первой версии читается и переводится в новый формат');
  mem['brevet:profiles'] = JSON.stringify([{ id: v1.id, name: v1.name, pin: null, at: 1 }]);
  mem['brevet:db:' + v1.id] = JSON.stringify(Object.assign({ saved: day0 }, v1));
  ctx.navigator = {};
  S.openProfile(v1.id);
  const sn = S.snaps(v1.id);
  ok(S.DB.v === S.DBV && S.DB.sk[m0].due > 0 && sn.length === 1 && sn[0].db.v === 1 && /обновлением/.test(sn[0].why), 'при первом открытии после обновления прогресс переведён в новый формат, прежний сохранён копией');
  ok(JSON.parse(mem['brevet:db:' + v1.id]).v === S.DBV, 'и сразу записан в новом формате');

  /* the registry of numbers and the hashes of the words */
  console.log('Номера тем и слова');
  const idx = S.IDX.filter((id) => !/reserve/.test(id));
  ok(new Set(idx).size === idx.length, 'в 00-ids.js нет повторов');
  const miss = A.TOPICS.map((t) => t.id).concat(A.PROBLEMS.map((p) => p.id)).filter((id) => !idx.includes(id));
  ok(!miss.length, 'у каждой темы и задачи есть постоянный номер' + (miss.length ? ' — нет у: ' + miss.join(', ') + ' (запустите node tools/ids.js)' : ''));
  const hs = new Map(), clash = [];
  LEMMAS.forEach((l) => { const h = S.fnv32(l); if (hs.has(h) && hs.get(h) !== l) clash.push(l + ' / ' + hs.get(h)); hs.set(h, l); });
  ok(!clash.length, 'слова словаря различимы в коде (' + LEMMAS.length + ' слов)' + (clash.length ? ': совпали ' + clash.join('; ') : ''));

  console.log(fails ? '\nНе прошло: ' + fails : '\nВсё прошло');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
