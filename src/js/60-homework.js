/* ===================== HOMEWORK: set by the tutor, travels in the progress code =====================
   DB.hw = { id, due, doneAt, items: [{ k, id, n, done, ok }] }
     k: 't' — n tasks of a topic, 'p' — a Partie 2 problem, 'x' — a mock exam (id = its mode)
     id of the homework = the minute it was set (so that both devices see the same number after a code)
   The tutor sets it in the student's profile on his own device and sends the code; the student's app shows it first on «Сегодня».
   When everything is done the app offers to send the code back. */
const hwItemN = it => (it.k === 't' ? it.n : 1);
const hwItemDone = it => (it.done || 0) >= hwItemN(it);
const hwItemAlive = it => (it.k === 't' ? !!TP(it.id) : it.k === 'p' ? !!PB(it.id) : !!MODES[it.id]);
const hwOpen = () => !!(DB.hw && !DB.hw.doneAt && DB.hw.items.some(it => hwItemAlive(it) && !hwItemDone(it)));
const hwNextTopic = () => (hwOpen() ? DB.hw.items.find(it => it.k === 't' && TP(it.id) && !hwItemDone(it)) : null);
const inHwDone = id => !!DB.hw && DB.hw.items.some(it => it.id === id && hwItemDone(it));
/* where the next unfinished part is: the topics first, then the problems, then the mock exams */
function hwNextStep() {
  if (!hwOpen()) return null;
  if (hwNextTopic()) return '#/t/hw';
  const p = DB.hw.items.find(it => it.k === 'p' && PB(it.id) && !hwItemDone(it)); if (p) return '#/pb/' + p.id;
  return '#/hw';
}
/* an answer, a finished problem or a finished mock exam counts for the homework wherever it was done */
function hwNote(k, id, ok) {
  const h = DB.hw; if (!h || h.doneAt) return;
  const it = h.items.find(x => x.k === k && x.id === id && !hwItemDone(x)); if (!it) return;
  it.done = (it.done || 0) + 1; if (ok) it.ok = (it.ok || 0) + 1;
  if (h.items.every(x => hwItemDone(x) || !hwItemAlive(x))) {
    h.doneAt = Math.floor(Date.now() / 60000) * 60000; pushHwh(DB, h);
    celebrate({ ic: 'book', title: 'Домашнее задание выполнено!', text: 'Отправь код ' + APP.tutorTo + ' — он увидит, что всё сделано.' });
  }
}
/* how long a homework takes, in minutes: the student's own pace where it is known */
function hwItemMin(it) {
  if (it.k === 't') { const t = TP(it.id), s = DB.sk[it.id] || {}; return it.n * (s.tm || (t && t.calc ? 90 : 60)) / 60; }
  if (it.k === 'p') { const p = PB(it.id); return p ? p.pts * 2.5 : 8; }
  return { p1: 20, p2: 100, blanc: 120, quick: 10 }[it.id] || 20;
}
const hwMinutes = items => Math.max(1, Math.round(items.reduce((s, it) => s + hwItemMin(it), 0)));
function hwItemTitle(it) {
  if (it.k === 't') { const t = TP(it.id); return t ? t.ru : 'тема'; }
  if (it.k === 'p') { const p = PB(it.id); return p ? p.ru : 'задача'; }
  return MODES[it.id] ? MODES[it.id].ru : 'пробник';
}
/* a new homework replaces the current one, which goes to the history as it is */
function hwSet(items, due) {
  let id = Math.floor(Date.now() / 60000) * 60000;
  if (DB.hw) { if (DB.hw.id >= id) id = DB.hw.id + 60000; pushHwh(DB, DB.hw); }
  DB.hw = { id, due: due || null, doneAt: 0, items: items.map(it => ({ k: it.k, id: it.id, n: it.k === 't' ? it.n : 1, done: 0, ok: 0 })) };
  save();
}
/* «до пятницы, 4 декабря» and how soon that is */
function hwDueText(h) {
  if (!h.due) return '';
  const left = daysTo(h.due), d = parseYmd(h.due);
  return 'до ' + WDAY_DO[d.getDay()] + ', ' + dateRu(h.due) + (h.doneAt ? '' : left < 0 ? ' · срок прошёл' : left === 0 ? ' · сегодня' : left === 1 ? ' · завтра' : ' · ещё ' + dn(left));
}
