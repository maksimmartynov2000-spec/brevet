/* ===================== DATES AND SMALL TEXT HELPERS (no DOM: shared with the tests) =====================
   The student's own clock decides what «today» is; the exam date is a calendar day. */
const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WDAY = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const WDAY_DO = ['воскресенья', 'понедельника', 'вторника', 'среды', 'четверга', 'пятницы', 'субботы'];
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const parseYmd = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const dayStart = ms => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
const addDaysKey = (k, n) => { const d = parseYmd(k); d.setDate(d.getDate() + n); return ymd(d); };
function daysTo(s) { return Math.round((parseYmd(s) - today0()) / 864e5); }
function dateRu(s) { const [, m, d] = String(s).split('-').map(Number); return d + ' ' + MON[m - 1]; }
function plural(n, a, b, c) { n = Math.abs(n); const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c; }
const dn = n => n + ' ' + plural(n, 'день', 'дня', 'дней');
const pct = (a, b) => (b ? Math.round(100 * a / b) : 0);
const mmss = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
const n20 = v => String(Math.round(v * 10) / 10).replace('.', ',');   /* 13,5 */
