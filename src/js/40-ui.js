/* ===================== UI CORE: dom helpers, icons, dates, chrome, router, sheets ===================== */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

const IC = {
  home: '<path d="M3.5 11 12 3.8l8.5 7.2V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
  books: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10v16H5.5A1.5 1.5 0 0 1 4 18.5zM14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14z"/><path d="M10 4h4v16h-4"/>',
  exam: '<rect x="5" y="4.5" width="14" height="17" rx="2.5"/><path d="M9 3h6v3H9zM8.8 13.5l2.2 2.2 4.4-4.4"/>',
  user: '<circle cx="12" cy="8.2" r="3.8"/><path d="M4.5 20.5c.6-4 3.6-6 7.5-6s6.9 2 7.5 6"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  flame: '<path d="M12 21c-4 0-6.5-2.6-6.5-6.2 0-3.4 2.3-5.4 3.6-7.6.3 1.8 1.3 3 2.4 3.4C11.6 7.6 12.7 5 15 3c.2 3.2 3.5 5.6 3.5 10.4C18.5 18.2 16 21 12 21z"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.4 9.3a2.7 2.7 0 1 1 3.9 2.4c-.9.5-1.3 1-1.3 2M12 17.2h.01"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  kb: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M9.3 10h.01M12.6 10h.01M15.9 10h.01M18 10h.01M6.5 14h11"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.4-3.1 8-7.5 9.5-4.4-1.5-7.5-5.1-7.5-9.5V6z"/><path d="M8.8 12.3l2.2 2.2 4.3-4.3"/>',
  save: '<path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5M4.5 16.5v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2"/>',
  load: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 16.5v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2"/>',
  swap: '<path d="M7 7h12l-3.5-3.5M17 17H5l3.5 3.5"/>',
  out: '<path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14M10 16l4-4-4-4M14 12H4"/>',
  book: '<path d="M5 4.5h10.5A2.5 2.5 0 0 1 18 7v13H7.5A2.5 2.5 0 0 1 5 17.5z"/><path d="M5 17.5A2.5 2.5 0 0 1 7.5 15H18M9 8.5h5"/>',
  dico: '<path d="M4 18 8 6l4 12M5.4 14h5.2M14 8h6M17 8c0 4-1.5 7-4 9M15.2 12.5c1.2 2 3 3.6 4.8 4.5"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".9" fill="currentColor"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7h8M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15h.01M8.5 18h.01M12 18h3.5"/>',
  nocalc: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7h8M3 3l18 18"/>',
  grid: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.2h5.2c0-.9.4-1.7 1-2.2A6 6 0 0 0 12 3z"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  redo: '<path d="M19.5 8.5A8 8 0 1 0 20 13M20 4v4.5h-4.5"/>',
  pen: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  trophy: '<path d="M8 4.5h8v5a4 4 0 0 1-8 0zM8 6.5H5.5a2.5 2.5 0 0 0 2.6 3.8M16 6.5h2.5a2.5 2.5 0 0 1-2.6 3.8M12 13.5v3.5M8.5 20.5h7M9.5 17h5"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  share: '<path d="M12 15V3.5M8 7.5l4-4 4 4M6.5 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>'
};
const ico = (k, cls) => '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (IC[k] || '') + '</svg>';

/* ---------- dates (the student's own clock; the exam date is a calendar day) ---------- */
const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WDAY = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const parseYmd = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
function daysTo(s) { return Math.round((parseYmd(s) - today0()) / 864e5); }
function dateRu(s) { const [, m, d] = String(s).split('-').map(Number); return d + ' ' + MON[m - 1]; }
function plural(n, a, b, c) { n = Math.abs(n); const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c; }
const dn = n => n + ' ' + plural(n, 'день', 'дня', 'дней');
const pct = (a, b) => (b ? Math.round(100 * a / b) : 0);
const mmss = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
const n20 = v => String(Math.round(v * 10) / 10).replace('.', ',');   /* 13,5 */

/* ---------- bilingual text: French on screen, Russian in the same place behind «Перевод» ----------
   Both copies are laid out in one grid cell, so the block is always as tall as the longer one:
   switching the language changes nothing on the page except the words. */
/* French typography, so a line never starts with « : » or « € »: no-break spaces before : ; ? ! » and after «,
   and between a number and its unit (formulas in $…$ are left as they are) */
const FR_UNIT = /(\d) (?=(?:mm|cm|dm|km|m|g|kg|mg|t|L|mL|cL|dL|h|min|s|ms|€|%|°|ha|ans?|jours?|élèves|personnes|euros)(?![\wÀ-ÿ]))/g;
function frTypo(s) { return String(s).split(/(\$\$[^$]*\$\$|\$[^$]*\$)/).map((p, i) => i % 2 ? p : p.replace(/ ([:;?!»])/g, ' $1').replace(/« /g, '« ').replace(FR_UNIT, '$1 ')).join(''); }
function bt(o, cls) {
  if (o == null) return '';
  if (typeof o === 'object' && o.fr !== o.ru) o = { fr: frTypo(o.fr), ru: o.ru };
  if (typeof o !== 'object') return '<span' + (cls ? ' class="' + cls + '"' : '') + '>' + rt(o) + '</span>';
  if (o.fr === o.ru) return '<span' + (cls ? ' class="' + cls + '"' : '') + '>' + rt(o.fr) + '</span>';
  return '<span class="bi' + (cls ? ' ' + cls : '') + '"><span class="l-fr" lang="fr">' + rt(o.fr) + '</span><span class="l-ru" lang="ru">' + rt(o.ru) + '</span></span>';
}
function setTr(on) {
  if (DB) { DB.ru = !!on; if (on && !DB.tipTr) { DB.tipTr = 1; const t = $('.newtip'); if (t) t.style.visibility = 'hidden'; } save(); }
  document.documentElement.classList.toggle('tr', !!on);
  const b = $('#tTr'); if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
}

/* ---------- theme (one for the device) ---------- */
const THEMES = ['auto', 'light', 'dark'], THEME_RU = { auto: 'как в телефоне', light: 'светлая', dark: 'тёмная' };
function applyTheme() {
  const t = LS.get('theme', 'auto');
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  const dark = t === 'dark' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  $$('meta[name="theme-color"]').forEach(m => { m.setAttribute('content', dark ? '#12151A' : '#F5F3EE'); m.removeAttribute('media'); });
}
function setTheme(t) { LS.set('theme', t); applyTheme(); }

/* ---------- feedback ---------- */
let toastT = 0;
function toast(m, ms) { const t = $('#toast'); if (!t) return; t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms || 2600); }
function vib(p) { if (DB && DB.vib === false) return; try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* not supported */ } }
function ring(v, max, size, label) {
  const r = 15.5, c = 2 * Math.PI * r, f = Math.min(1, max ? v / max : 0);
  return '<svg class="ring" viewBox="0 0 36 36" width="' + size + '" height="' + size + '" aria-hidden="true"><circle cx="18" cy="18" r="' + r + '" class="rb"/>' + (f > 0 ? '<circle cx="18" cy="18" r="' + r + '" class="rf' + (f >= 1 ? ' full' : '') + '" stroke-dasharray="' + (c * f).toFixed(2) + ' ' + c.toFixed(2) + '" transform="rotate(-90 18 18)"/>' : '') + (label != null ? '<text x="18" y="18" class="rt">' + label + '</text>' : '') + '</svg>';
}
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas'); cv.className = 'confetti'; document.body.appendChild(cv);
  const W = cv.width = innerWidth * devicePixelRatio, H = cv.height = innerHeight * devicePixelRatio; const x = cv.getContext('2d');
  const col = ['#1F3558', '#E3A94B', '#2F7D57', '#8FB0E8', '#B4443C', '#F5D58A'];
  const ps = Array.from({ length: 120 }, () => ({ x: W / 2 + (Math.random() - .5) * W * .2, y: H * .55, vx: (Math.random() - .5) * W * .022, vy: -(Math.random() * .028 + .018) * H, r: (Math.random() * 6 + 4) * devicePixelRatio, a: Math.random() * 6, va: (Math.random() - .5) * .3, c: col[Math.floor(Math.random() * col.length)] }));
  const t0 = performance.now();
  (function fr(t) {
    const k = (t - t0) / 1000; x.clearRect(0, 0, W, H);
    ps.forEach(p => { p.vy += H * .0011; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = Math.max(0, 1 - k / 2.2); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); });
    if (k < 2.2) requestAnimationFrame(fr); else cv.remove();
  })(t0);
}
/* calm full-screen note when something big is done; several in a row are shown one after another */
const CELE = [];
let QUIET = false;            /* automatic checks switch the celebrations off */
function celebrate(c) { if (QUIET) return; CELE.push(c); if (CELE.length === 1) showCele(); }
function showCele() {
  const c = CELE[0]; if (!c) return;
  const el = document.createElement('div'); el.className = 'cele'; el.setAttribute('role', 'dialog');
  el.innerHTML = '<div class="celec"><span class="celei">' + ico(c.ic || 'star') + '</span><b>' + esc(c.title) + '</b><span>' + esc(c.text || '') + '</span><button class="btn primary wide" type="button">Отлично</button></div>';
  document.body.appendChild(el); confetti(); vib([30, 40, 30]);
  const close = () => { el.classList.add('out'); setTimeout(() => { el.remove(); CELE.shift(); showCele(); }, 250); };
  el.querySelector('button').onclick = close; el.onclick = e => { if (e.target === el) close(); };
}
/* bottom sheet: openSheet(html) → the sheet element; closeSheet() */
function openSheet(html, cls) {
  closeSheet();
  const bg = document.createElement('div'); bg.className = 'sheetbg up'; bg.id = 'sheet';
  bg.innerHTML = '<div class="sheet' + (cls ? ' ' + cls : '') + '" role="dialog" aria-modal="true">' + html + '</div>';
  bg.addEventListener('click', e => { if (e.target === bg) closeSheet(); });
  document.body.appendChild(bg); hideKb();
  return bg.firstChild;
}
function closeSheet() { const s = $('#sheet'); if (s) s.remove(); }
function confirmSheet(title, text, yes, onYes, danger) {
  const sh = openSheet('<h3>' + esc(title) + '</h3><p class="muted">' + text + '</p><div class="row"><button class="btn ' + (danger ? 'danger' : 'primary') + '" id="shYes">' + esc(yes) + '</button><button class="btn ghost" id="shNo">Отмена</button></div>');
  $('#shYes', sh).onclick = () => { closeSheet(); onYes(); };
  $('#shNo', sh).onclick = closeSheet;
}

/* ---------- app bar, tab bar ---------- */
const TABS = [['#/', 'home', 'Сегодня'], ['#/prog', 'books', 'Программа'], ['#/exam', 'exam', 'Пробники'], ['#/me', 'user', 'Я']];
let VIEW = { title: '', back: null, tab: 0, tr: false, kb: false };
function chrome(o) {
  VIEW = Object.assign({ title: '', back: null, tab: -1, tr: false, kb: false }, o);
  const root = !VIEW.back;
  document.documentElement.classList.toggle('isroot', root);
  $('#abTitle').textContent = VIEW.title;
  $('#abBack').hidden = root;
  $('#tTr').hidden = !VIEW.tr; $('#tKb').hidden = !VIEW.kb;
  $('#tTr').setAttribute('aria-pressed', DB && DB.ru ? 'true' : 'false');
  $('#tKb').setAttribute('aria-pressed', DB && DB.kbd ? 'true' : 'false');
  $$('.tab').forEach((t, i) => t.classList.toggle('on', i === VIEW.tab));
  document.title = (VIEW.title && VIEW.title !== 'Сегодня' ? VIEW.title + ' · ' : '') + 'Brevet';
}
function shell(html, cls) {
  const a = $('#app'); a.className = 'vin' + (cls ? ' ' + cls : ''); a.innerHTML = html;
  hideKb(); window.scrollTo(0, 0);
}

/* ---------- router ---------- */
const ROUTES = [];   /* [regexp, view(match)] — filled by the screens */
const go = h => { if (location.hash === h) route(); else location.hash = h; };
function route() {
  closeSheet(); stopTimer();
  const h = location.hash || '#/';
  if (!DB && !/^#\/(login|install)/.test(h)) return viewLogin();
  for (const [re, fn] of ROUTES) { const m = re.exec(h); if (m) return fn(m); }
  return go('#/');
}
window.addEventListener('hashchange', route);
function goBack() { if (VIEW.back) go(VIEW.back); }
