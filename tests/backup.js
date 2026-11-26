// Код прогресса: помещается ли в одно сообщение Telegram (< 4096 знаков) после целого года занятий,
// и возвращает ли он тот же прогресс. node tests/backup.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');
const load = require('./load');
const A = load();
const ctx = A.ctx;
ctx.document = { addEventListener() {} }; ctx.window = { addEventListener() {} };
vm.runInContext(fs.readFileSync(path.resolve(__dirname, '..', 'src', 'js', '30-store.js'), 'utf8'), ctx, { filename: '30-store.js' });
vm.runInContext('this.__S = { newDb, packDb, unpackDb, sanitizeDb, mergeDb, dbSummary };', ctx);
const S = ctx.__S;

let fails = 0;
const ok = (c, what) => { console.log((c ? '  ✓ ' : '  ✗ ') + what); if (!c) fails++; };

/* a whole school year, generously: every topic tried, 230 days of work, 30 tests, all problems, all badges */
function yearDb() {
  const d = S.newDb('Алана'); let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const day0 = Date.UTC(2026, 10, 25);
  A.TOPICS.forEach((t) => { d.sk[t.id] = { a: 5 + Math.floor(rnd() * 60), c: Math.floor(rnd() * 50), s: Math.floor(rnd() * 6), m: rnd() < 0.8 ? 1 : 0, t: day0 + Math.floor(rnd() * 210) * 864e5 + 3600e3 * 15, d: rnd() < 0.1 ? 1 : 0, r: [...Array(8)].map(() => (rnd() < 0.7 ? '1' : '0')).join('') }; });
  A.PROBLEMS.forEach((p) => { d.pb[p.id] = { n: 1 + Math.floor(rnd() * 5), best: Math.round(rnd() * 100) / 100, last: Math.round(rnd() * 100) / 100, t: day0 + Math.floor(rnd() * 210) * 864e5 }; });
  for (let i = 0; i < 230; i++) { if (rnd() < 0.15) continue; const k = new Date(day0 + i * 864e5).toISOString().slice(0, 10); const n = 10 + Math.floor(rnd() * 40); d.days[k] = n; d.log[k] = { n, ok: Math.floor(n * (0.5 + rnd() / 2)) }; }
  for (let i = 0; i < 30; i++) { const t0 = day0 + i * 7 * 864e5 + 36e6; d.exams.push({ mode: ['p1', 'p2', 'blanc', 'quick'][i % 4], t0, t1: t0 + 3600e3, p1: Math.round(rnd() * 60) / 10, p2: Math.round(rnd() * 120) / 10, note: 0, max: 18, n: 30, ok: 20, weak: A.TOPICS.slice(i, i + 8).map((x) => x.id) }); }
  ['first', 't100', 't500', 't1500', 's3', 's7', 's30', 'diag', 'ch', 'pb10', 'blanc', 'b14', 'b17', 'all'].forEach((b, i) => { d.badges[b] = day0 + i * 864e5 * 9; });
  d.diag = { at: day0 + 864e5, n: 16, ok: 11 };
  return d;
}
const db = yearDb();
const packed = JSON.stringify(S.packDb(db));
const code = 'BRV2.' + zlib.deflateRawSync(Buffer.from(packed)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const msg = 'Brevet · Алана · 25 июня\n' + code;
console.log('Год занятий: ' + A.TOPICS.length + ' тем, ' + Object.keys(db.days).length + ' дней, ' + db.exams.length + ' пробников → код ' + code.length + ' знаков, сообщение ' + msg.length);
ok(msg.length < 4096, 'сообщение с кодом короче 4096 знаков (лимит Telegram)');

const back = S.sanitizeDb(S.unpackDb(JSON.parse(packed)));
const a = S.dbSummary(db), b = S.dbSummary(back);
ok(a.tasks === b.tasks && a.topics === b.topics && a.exams === b.exams && a.probs === b.probs, 'после кода те же числа: ' + JSON.stringify(b));
ok(back.src === db.id && back.name === 'Алана', 'код знает, чей это прогресс (id и имя)');
const t0 = A.TOPICS[0].id;
ok(back.sk[t0].r === db.sk[t0].r && back.sk[t0].m === db.sk[t0].m && back.sk[t0].a === db.sk[t0].a, 'по темам: попытки, освоение, последние ответы на месте');
ok(Object.keys(back.days).every((k) => back.days[k] === db.days[k]) && Object.keys(back.days).length === Object.keys(db.days).length, 'задания по дням на месте');
ok(back.exams.length === 30 && Math.abs(back.exams[29].p1 - db.exams[29].p1) < 1e-9 && back.exams[29].weak.length === 8 && Math.abs(back.exams[29].t0 - db.exams[29].t0) < 60000, 'пробники и «что повторить» последнего на месте');

/* tutor ↔ student: both did work, the merge keeps the best of both and loses nothing */
const tutor = JSON.parse(JSON.stringify(back)); const k0 = Object.keys(tutor.days).sort().pop();
const next = new Date(Date.parse(k0) + 864e5).toISOString().slice(0, 10);
tutor.days[next] = 25; tutor.log[next] = { n: 25, ok: 20 }; tutor.sk[t0].a += 5; tutor.sk[t0].t += 864e5 * 400;
const merged = S.mergeDb(db, tutor);
ok(merged.days[next] === 25 && merged.sk[t0].a === db.sk[t0].a + 5, 'урок на устройстве репетитора добавился к прогрессу ученика');
ok(S.dbSummary(merged).tasks === a.tasks + 25, 'ничего не потерялось и не задвоилось');

console.log(fails ? '\nНе прошло: ' + fails : '\nВсё прошло');
process.exit(fails ? 1 : 0);
