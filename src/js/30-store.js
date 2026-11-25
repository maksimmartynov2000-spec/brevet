/* ===================== STORAGE: profiles, progress, copies =====================
   Everything lives on the device (localStorage). Several apps share the site maksimmartynov2000-spec.github.io,
   so every key starts with «brevet:».
     brevet:profiles     — [{ id, name, pin: { s, h } | null, at }]   who studies on this device
     brevet:db:<id>      — the whole progress of one student (saved after every answer)
     brevet:snap:<id>    — up to 3 earlier copies of it: one per day and one before every restore
     brevet:theme        — light / dark / auto for the device
   Nothing is ever deleted silently: a restore or a transfer first keeps the current progress as a copy. */
const APP = {
  id: 'brevet', title: 'Brevet',
  exam: '2027-06-28', examLabel: 'понедельник, 28 июня 2027, 10:00–12:00',
  tableur: 'https://maksimmartynov2000-spec.github.io/Knights/'
};
const DBV = 1;                     /* version of the progress format; bump it together with migrate() */
const LS = {
  get(k, d) { try { const v = localStorage.getItem('brevet:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('brevet:' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem('brevet:' + k); } catch (e) { /* no storage */ } }
};
const SS = {
  get(k) { try { return sessionStorage.getItem('brevet:' + k); } catch (e) { return null; } },
  set(k, v) { try { if (v == null) sessionStorage.removeItem('brevet:' + k); else sessionStorage.setItem('brevet:' + k, v); } catch (e) { /* no storage */ } }
};

let DB = null;                     /* progress of the student who is signed in */
const profiles = () => LS.get('profiles', []);
const saveProfiles = ps => LS.set('profiles', ps);
const newId = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function newDb(name) {
  return {
    v: DBV, id: newId(), name, created: Date.now(), saved: 0,
    sk: {},            /* topic id → { a: first tries, c: right at the first try, s: right in a row, m: mastered, t: last time, d: from the start test } */
    pb: {},            /* problem id → { n: times done, best: 0…1, last: 0…1, t } */
    days: {},          /* 'YYYY-MM-DD' → answers that day */
    log: {},           /* 'YYYY-MM-DD' → { n, ok } */
    goal: 0, goalH: {},
    exams: [], cur: null, diag: null,
    badges: {}, bk: { at: 0, n: 0 },
    ru: false, kbd: false, vib: true, pinAsk: true
  };
}
/* older progress files are brought up to the current format here (nothing yet: version 1 is the first) */
function migrate(db) {
  if (!db.v) db.v = 1;
  ['sk', 'pb', 'days', 'log', 'goalH', 'badges'].forEach(k => { if (!db[k] || typeof db[k] !== 'object' || Array.isArray(db[k])) db[k] = {}; });
  if (!Array.isArray(db.exams)) db.exams = [];
  if (!db.bk) db.bk = { at: 0, n: 0 };
  return db;
}

/* ---------- saving ---------- */
let SAVE_FAIL = false, saveT = 0;
function save() {
  if (!DB) return true;
  clearTimeout(saveT); saveT = 0;
  const day = ymd(new Date());
  if (DB.snapDay !== day) { snapshot('день ' + dateRu(DB.snapDay || day)); DB.snapDay = day; }
  DB.saved = Date.now();
  let ok = LS.set('db:' + DB.id, DB);
  if (!ok) { trimSnaps(DB.id, 1); ok = LS.set('db:' + DB.id, DB); }
  if (!ok) { trimSnaps(DB.id, 0); ok = LS.set('db:' + DB.id, DB); }
  if (ok !== !SAVE_FAIL) { SAVE_FAIL = !ok; if (typeof syncWarn === 'function') syncWarn(); }
  return ok;
}
/* typing in a test: save a moment later, and for sure when the app is hidden */
function saveSoon() { clearTimeout(saveT); saveT = setTimeout(save, 500); }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && saveT) save(); });
window.addEventListener('pagehide', () => { if (saveT) save(); });

/* ---------- copies of the progress kept on the device ---------- */
const snaps = id => LS.get('snap:' + id, []);
function snapshot(why) {
  if (!DB || !DB.saved) return;
  const prev = LS.get('db:' + DB.id, null); if (!prev) return;
  const list = snaps(DB.id); list.unshift({ at: Date.now(), why, db: prev });
  while (list.length > 3) list.pop();
  if (!LS.set('snap:' + DB.id, list)) trimSnaps(DB.id, 1);
}
function trimSnaps(id, keep) { const l = snaps(id).slice(0, keep); if (keep) LS.set('snap:' + id, l); else LS.del('snap:' + id); }

/* ---------- profiles and PIN ---------- */
async function pinHash(pin, salt) {
  const txt = 'brevet|' + salt + '|' + pin;
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) { let h = 2166136261; for (const c of txt) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return 'f' + (h >>> 0).toString(16); }
}
async function pinMake(pin) { const s = Math.random().toString(36).slice(2, 10); return { s, h: await pinHash(pin, s) }; }
async function pinOk(prof, pin) { return !prof.pin || (await pinHash(pin, prof.pin.s)) === prof.pin.h; }
const normName = s => String(s || '').trim().replace(/\s+/g, ' ').slice(0, 30);

function openProfile(id) {
  const raw = LS.get('db:' + id, null);
  DB = migrate(raw || newDb((profiles().find(p => p.id === id) || {}).name || 'Ученик'));
  DB.id = id;
  const ps = profiles(); const p = ps.find(x => x.id === id); if (p) { p.at = Date.now(); p.name = DB.name; saveProfiles(ps); }
  LS.set('last', id); SS.set('in', id);
  if (!raw) save();
  askPersist();
  return DB;
}
async function createProfile(name, pin) {
  const db = newDb(normName(name));
  const ps = profiles(); ps.push({ id: db.id, name: db.name, pin: pin ? await pinMake(pin) : null, at: Date.now() }); saveProfiles(ps);
  LS.set('db:' + db.id, db);
  return openProfile(db.id);
}
function signOut() { if (DB) save(); DB = null; SS.set('in', null); }
const profOf = id => profiles().find(p => p.id === id);
async function setPin(pin) {
  const ps = profiles(); const p = ps.find(x => x.id === DB.id); if (!p) return;
  p.pin = pin ? await pinMake(pin) : null; saveProfiles(ps);
}
function renameProfile(name) {
  DB.name = normName(name) || DB.name; save();
  const ps = profiles(); const p = ps.find(x => x.id === DB.id); if (p) { p.name = DB.name; saveProfiles(ps); }
}

/* ---------- the browser may clean the storage of a site: ask it not to ---------- */
function askPersist() {
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(v => v || navigator.storage.persist()).then(v => LS.set('persist', !!v)).catch(() => {}); } catch (e) { /* not supported */ }
}
const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/* ---------- progress as a file or as a code ---------- */
function backupData() { return { app: APP.id, kind: 'progress', v: DBV, at: Date.now(), db: DB }; }
/* strict check of what comes from outside: only known fields of known shapes */
function sanitizeDb(d) {
  if (!d || typeof d !== 'object') return null;
  const num = (x, lo, hi) => (typeof x === 'number' && isFinite(x) && x >= lo && x <= hi ? x : 0);
  const out = newDb(normName(d.name) || 'Ученик'); out.id = DB ? DB.id : out.id; out.created = num(d.created, 0, 4e12) || Date.now();
  const okId = k => /^[a-z0-9.\-_]{1,60}$/i.test(k);
  const okDay = k => /^\d{4}-\d{2}-\d{2}$/.test(k);
  if (d.sk && typeof d.sk === 'object') for (const k in d.sk) { const s = d.sk[k]; if (okId(k) && s && typeof s === 'object') out.sk[k] = { a: num(s.a, 0, 1e6), c: num(s.c, 0, 1e6), s: num(s.s, 0, 1e6), m: s.m ? 1 : 0, t: num(s.t, 0, 4e12), d: s.d ? 1 : 0 }; }
  if (d.pb && typeof d.pb === 'object') for (const k in d.pb) { const s = d.pb[k]; if (okId(k) && s && typeof s === 'object') out.pb[k] = { n: num(s.n, 0, 1e6), best: num(s.best, 0, 1), last: num(s.last, 0, 1), t: num(s.t, 0, 4e12) }; }
  if (d.days && typeof d.days === 'object') for (const k in d.days) if (okDay(k)) out.days[k] = num(d.days[k], 0, 1e5);
  if (d.log && typeof d.log === 'object') for (const k in d.log) { const s = d.log[k]; if (okDay(k) && s && typeof s === 'object') out.log[k] = { n: num(s.n, 0, 1e5), ok: num(s.ok, 0, 1e5) }; }
  if (d.goalH && typeof d.goalH === 'object') for (const k in d.goalH) if (okDay(k)) out.goalH[k] = num(d.goalH[k], 0, 500);
  if (d.badges && typeof d.badges === 'object') for (const k in d.badges) if (okId(k)) out.badges[k] = num(d.badges[k], 0, 4e12);
  if (Array.isArray(d.exams)) out.exams = d.exams.slice(-30).filter(e => e && typeof e === 'object').map(e => ({ mode: String(e.mode || '').slice(0, 12), t0: num(e.t0, 0, 4e12), t1: num(e.t1, 0, 4e12), p1: num(e.p1, 0, 6), p2: num(e.p2, 0, 12), note: num(e.note, 0, 20), max: num(e.max, 0, 20), n: num(e.n, 0, 500), ok: num(e.ok, 0, 500), weak: Array.isArray(e.weak) ? e.weak.filter(okId).slice(0, 12) : [] }));
  if (d.diag && typeof d.diag === 'object') out.diag = { at: num(d.diag.at, 0, 4e12), n: num(d.diag.n, 0, 100), ok: num(d.diag.ok, 0, 100) };
  out.goal = num(d.goal, 0, 200); out.ru = !!d.ru; out.tipTr = d.tipTr ? 1 : 0; out.kbd = !!d.kbd; out.vib = d.vib !== false; out.pinAsk = d.pinAsk !== false;
  if (d.bk && typeof d.bk === 'object') out.bk = { at: num(d.bk.at, 0, 4e12), n: num(d.bk.n, 0, 1e7) };
  return out;
}
/* two copies of one student's progress → the best of both (nothing done is lost) */
function mergeDb(a, b) {
  const o = JSON.parse(JSON.stringify(a));
  for (const k in b.sk) { const x = o.sk[k], y = b.sk[k]; o.sk[k] = !x ? y : { a: Math.max(x.a, y.a), c: Math.max(x.c, y.c), s: Math.max(x.s, y.s), m: x.m || y.m ? 1 : 0, t: Math.max(x.t, y.t), d: x.d && y.d ? 1 : 0 }; }
  for (const k in b.pb) { const x = o.pb[k], y = b.pb[k]; o.pb[k] = !x ? y : { n: Math.max(x.n, y.n), best: Math.max(x.best, y.best), last: x.t >= y.t ? x.last : y.last, t: Math.max(x.t, y.t) }; }
  for (const k in b.days) o.days[k] = Math.max(o.days[k] || 0, b.days[k]);
  for (const k in b.log) { const x = o.log[k] || { n: 0, ok: 0 }, y = b.log[k]; o.log[k] = { n: Math.max(x.n, y.n), ok: Math.max(x.ok, y.ok) }; }
  for (const k in b.badges) o.badges[k] = o.badges[k] ? Math.min(o.badges[k], b.badges[k]) : b.badges[k];
  const seen = new Set(o.exams.map(e => e.t0 + '|' + e.mode)); b.exams.forEach(e => { if (!seen.has(e.t0 + '|' + e.mode)) o.exams.push(e); });
  o.exams.sort((x, y) => x.t0 - y.t0); o.exams = o.exams.slice(-30);
  if (!o.diag && b.diag) o.diag = b.diag;
  o.bk = { at: Math.max(o.bk.at || 0, b.bk.at || 0), n: Math.max(o.bk.n || 0, b.bk.n || 0) };
  return o;
}
/* what a student has done, in numbers — shown before a restore so nothing is replaced blindly */
function dbSummary(d) {
  const tasks = Object.values(d.days || {}).reduce((s, x) => s + x, 0);
  return { tasks, topics: Object.values(d.sk || {}).filter(s => s.m).length, exams: (d.exams || []).length, probs: Object.keys(d.pb || {}).length, last: d.saved || 0 };
}
function applyIncoming(inc, why) {
  snapshot(why || 'перед загрузкой копии');
  const keep = { id: DB.id, name: DB.name, created: Math.min(DB.created || Date.now(), inc.created || Date.now()) };
  DB = Object.assign(mergeDb(DB, inc), keep, { v: DBV, snapDay: DB.snapDay });
  save();
}
/* progress code: JSON → deflate → base64url, so it fits in a message */
const b64url = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64url = s => { const b = atob(s.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
async function pipeBytes(u8, stream) { const r = new Response(new Blob([u8]).stream().pipeThrough(stream)); return new Uint8Array(await r.arrayBuffer()); }
async function progressCode() {
  const txt = new TextEncoder().encode(JSON.stringify(backupData()));
  if (typeof CompressionStream === 'function') { try { return 'BRV1.' + b64url(await pipeBytes(txt, new CompressionStream('deflate-raw'))); } catch (e) { /* plain below */ } }
  return 'BRV0.' + b64url(txt);
}
async function readCode(code) {
  const m = /BRV([01])\.([A-Za-z0-9_-]+)/.exec(String(code || '').replace(/\s+/g, ''));
  if (!m) throw new Error('Это не код прогресса Brevet');
  let u8 = unb64url(m[2]);
  if (m[1] === '1') { if (typeof DecompressionStream !== 'function') throw new Error('Этот браузер не умеет читать сжатый код. Попробуйте файл.'); u8 = await pipeBytes(u8, new DecompressionStream('deflate-raw')); }
  return JSON.parse(new TextDecoder().decode(u8));
}
function readBackup(obj) {
  if (!obj || obj.app !== APP.id || !obj.db) throw new Error('Это копия от другого приложения');
  const d = sanitizeDb(migrate(obj.db)); if (!d) throw new Error('В копии нет прогресса');
  return d;
}
function exportFile() {
  const blob = new Blob([JSON.stringify(backupData())], { type: 'application/json' });
  const nm = 'brevet-' + (DB.name || 'ученик').replace(/[^\wа-яёА-ЯЁ-]+/g, '_') + '-' + ymd(new Date()) + '.json';
  const done = () => { DB.bk = { at: Date.now(), n: totalTasks() }; save(); };
  let file = null; try { file = new File([blob], nm, { type: 'application/json' }); } catch (e) { /* old browser */ }
  if (file && navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer:coarse)').matches) {
    navigator.share({ files: [file], title: nm }).then(() => { done(); toast('Копия сохранена'); route(); }).catch(err => { if (err && err.name !== 'AbortError') { download(blob, nm); done(); } });
    return;
  }
  download(blob, nm); done(); route();
}
function download(blob, nm) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nm; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); toast('Файл сохранён: ' + nm); }
