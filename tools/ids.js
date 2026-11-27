// Keeps src/content/00-ids.js: the permanent numbers of the topics and problems, used by the progress code (BRV3).
// A number must mean the same topic for every version of the app, so new ids are only ever appended:
// nothing is removed or reordered, even when a topic leaves the app.
//   node tools/ids.js          — append the new ids
//   node tools/ids.js --check  — only say whether something is missing (exit code 1)
const fs = require('fs');
const path = require('path');
const A = require('../tests/load')();

const file = path.resolve(__dirname, '..', 'src', 'content', '00-ids.js');
const cur = A.IDX.slice();
const all = A.TOPICS.map((t) => t.id).concat(A.PROBLEMS.map((p) => p.id));
const add = all.filter((id) => !cur.includes(id));
const dup = cur.filter((id, i) => cur.indexOf(id) !== i);
if (dup.length) { console.log('Повторы в 00-ids.js: ' + dup.join(', ')); process.exit(2); }
if (process.argv.includes('--check')) {
  if (add.length) { console.log('Нет номеров для: ' + add.join(', ') + '\nЗапустите node tools/ids.js'); process.exit(1); }
  console.log('Номера тем и задач: ' + cur.length + ', все на месте'); process.exit(0);
}
if (!add.length) { console.log('Номера тем и задач: ' + cur.length + ', новых нет'); process.exit(0); }
const list = cur.concat(add);
const head = '/* Permanent numbers of the topics and problems for the progress code (BRV3): the position in this list.\n' +
  '   Written by tools/ids.js. Only ever append — a number must mean the same topic for every version of the app. */\n';
fs.writeFileSync(file, head + 'const IDX = [\n' + list.map((id) => "  '" + id + "'").join(',\n') + '\n];\n');
console.log('Номера тем и задач: было ' + cur.length + ', добавлено ' + add.length + ' (' + add.join(', ') + ')');
