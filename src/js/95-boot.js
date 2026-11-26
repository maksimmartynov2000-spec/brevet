/* ===================== SELF-UPDATE (from the pages-template) =====================
   At the top of index.html there is <meta name="app-build">, set by tools/stamp.py.
   On opening, on coming back to the app and every 10 minutes the app downloads the first 4 KB of the fresh
   index.html and compares the marks. A new build: if the student is not busy — reload at once,
   if busy (typing, a test is running, see window.appBusy) — a bar «Обновить». */
const BUILD = (document.querySelector('meta[name="app-build"]') || {}).content || '';
const UPD_ON = !!BUILD && BUILD !== 'dev' && /^https?:$/.test(location.protocol);
const UPD_KEY = 'brevet:upd';
let updNew = null, updAt = 0, updBusy = false, updGoing = false;
window.appBusy = window.appBusy || (() => false);
function isBusy() {
  const a = document.activeElement;
  if (a && (a.matches('input, textarea, select') || a.isContentEditable)) return true;
  if ($('#sheet')) return true;
  try { return !!window.appBusy(); } catch (e) { return false; }
}
const updGet = () => { try { return JSON.parse(sessionStorage.getItem(UPD_KEY) || 'null'); } catch (e) { return null; } };
const updPut = v => { try { if (v) sessionStorage.setItem(UPD_KEY, JSON.stringify(v)); else sessionStorage.removeItem(UPD_KEY); } catch (e) { /* no storage */ } };
async function updCheck(force) {
  if (!UPD_ON || updBusy || updGoing || (!force && Date.now() - updAt < 60000) || navigator.onLine === false) return null;
  updBusy = true; updAt = Date.now();
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const tm = setTimeout(() => ctl && ctl.abort(), 9000);
  let found = null;
  try {
    /* ?upd=time — to get past the caches of the browser, of GitHub Pages and of the offline copy */
    const r = await fetch(location.pathname + '?upd=' + Date.now(), { cache: 'no-store', headers: { Range: 'bytes=0-4095' }, signal: ctl ? ctl.signal : undefined });
    let txt = '';
    if (r.body && r.body.getReader && typeof TextDecoder === 'function') {
      const rd = r.body.getReader(), dec = new TextDecoder();
      while (txt.length < 16384) { const x = await rd.read(); if (x.done) break; txt += dec.decode(x.value, { stream: true }); if (/name="app-build" content="[^"]*"/.test(txt)) break; }
      try { rd.cancel(); } catch (e) { /* closed */ }
    } else txt = (await r.text()).slice(0, 16384);
    const m = (r.ok || r.status === 206) && txt.match(/name="app-build" content="([^"]+)"/);
    if (m && m[1] !== BUILD && m[1] !== 'dev') { found = updNew = m[1]; updTick(); }
  } catch (e) { /* offline — next time */ }
  clearTimeout(tm); updBusy = false;
  return found;
}
function updTick() {
  if (!updNew || updGoing) return;
  const tried = updGet();
  const looping = tried && tried.to === updNew && tried.n >= 2 && Date.now() - tried.at < 600000;
  if (isBusy() || looping) updBar(true); else updGo();
}
function updGo() {
  if (!updNew || updGoing) return;
  updGoing = true; if (DB) save();
  const tried = updGet();
  updPut({ to: updNew, at: Date.now(), n: tried && tried.to === updNew ? (tried.n || 0) + 1 : 1 });
  toast('Обновляю приложение…', 2000);
  setTimeout(() => location.replace(location.pathname + '?v=' + encodeURIComponent(updNew) + location.hash), 600);
}
function updBar(on) {
  let el = document.getElementById('updbar');
  if (!on) { if (el) el.remove(); return; }
  if (el) return;
  el = document.createElement('div'); el.id = 'updbar'; el.setAttribute('role', 'status');
  el.innerHTML = '<span><b>Вышла новая версия</b><small>Ответы сохранены, обновление займёт пару секунд</small></span><button type="button" class="btn primary" data-upd="go">Обновить</button><button type="button" class="x" data-upd="x" aria-label="Позже">✕</button>';
  el.addEventListener('click', e => { const b = e.target.closest('[data-upd]'); if (!b) return; if (b.dataset.upd === 'go') updGo(); else { el.remove(); updNew = null; } });
  document.body.appendChild(el);
}

/* ---------- offline: sw.js keeps a copy of the page ---------- */
function swStart() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  navigator.serviceWorker.register('sw.js').catch(() => { /* works online without it */ });
}

/* ===================== START ===================== */
function autoSignIn() {
  const inId = SS.get('in'); if (inId && profOf(inId)) return openProfile(inId);
  const ps = profiles(); const p = profOf(LS.get('last', '')) || (ps.length === 1 ? ps[0] : null);
  if (!p) return null;
  const ask = p.pin && (LS.get('db:' + p.id, {}) || {}).pinAsk !== false;
  return ask ? null : openProfile(p.id);
}
function boot() {
  applyTheme();
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  $('#abBack').onclick = goBack;
  $('#tTr').onclick = () => { setTr(!(DB && DB.ru)); vib(8); };
  $('#tKb').onclick = () => { if (!DB) return; DB.kbd = !DB.kbd; save(); chrome(VIEW); $$('input.inp[data-field]').forEach(i => { i.inputMode = DB.kbd ? 'text' : 'none'; }); hideKb(); toast(DB.kbd ? 'Обычная клавиатура' : 'Математическая клавиатура'); };
  $('#tabbar').innerHTML = TABS.map(([h, ic, t]) => '<button type="button" class="tab">' + ico(ic) + '<span>' + t + '</span></button>').join('');
  $$('.tab').forEach((t, i) => t.onclick = () => go(TABS[i][0]));
  addEventListener('scroll', () => $('#appbar').classList.toggle('sc', scrollY > 4), { passive: true });
  if (autoSignIn()) setTr(DB.ru);
  route();
  const sp = $('#splash'); if (sp) { sp.classList.add('out'); setTimeout(() => sp.remove(), 400); }
  if (UPD_ON) {
    const was = updGet();
    if (was && was.to === BUILD) { updPut(null); setTimeout(() => toast('Приложение обновлено'), 500); }
    if (/[?&]v=/.test(location.search) && history.replaceState) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { /* fine */ } }
    setTimeout(() => updCheck(true), 1500);
    setInterval(() => { if (document.visibilityState === 'visible') updCheck(); }, 600000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') updCheck(true); });
    addEventListener('pageshow', e => { if (e.persisted) updCheck(true); });
    addEventListener('online', () => updCheck(true));
  }
  swStart();
  window.__t1 = performance.now();
}
boot();

/* for the automatic checks (tools/check.js, tests/) */
window.__upd = { get build() { return BUILD; }, get on() { return UPD_ON; }, get found() { return updNew; }, check: () => updCheck(true), busy: isBusy };
window.__brevet = { TOPICS, PROBLEMS, CHAPTERS, get DB() { return DB; }, go, route, newExam, handIn, record, mkRng, grade, keyInput, gradeField,
  quiet() { QUIET = true; CELE.length = 0; $$('.cele').forEach(e => e.remove()); },
  /* a given question on screen: topic id, type number, seed — for tools/preview.js and for finding a reported task */
  show(id, vi, seed) { const t = TP(id); P = { mode: id, id, n: 0 }; Object.assign(P, { it: t.gen(mkRng(seed), vi % t.variants), vi: vi % t.variants, seed, vals: {}, tries: 0, hint: 0, sol: false, done: false, ok: null, fb: null, rec: false }); renderPractice(true); } };
