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
  tableur: 'https://maksimmartynov2000-spec.github.io/Knights/',
  tutorTo: 'Максиму Николаевичу'                /* to whom the progress code is sent (dative) */
};
const DBV = 2;                     /* version of the progress format; bump it together with migrate() */
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
    sk: {},            /* topic id → { a: first tries, c: right at the first try, s: right in a row, m: mastered, t: last time, d: from the start test,
                          r: last answers '0110…', md: when mastered, rv: reviews passed, due: next review (0 = none), tm: usual seconds per task } */
    pb: {},            /* problem id → { n: times done, best: 0…1, last: 0…1, t } */
    days: {},          /* 'YYYY-MM-DD' → answers that day */
    log: {},           /* 'YYYY-MM-DD' → { n, ok, tr: tasks where «Перевод» was opened, w: words looked up } */
    old: null,         /* { upto, n, days }: answers before the day `upto` that are not listed in `days` (a code lists only the last weeks day by day) */
    goal: 0, goalH: {}, bs: 0,
    exams: [], cur: null, diag: null,
    badges: {}, bk: { at: 0, n: 0 }, imp: 0,
    vc: {},            /* my words: dictionary form → { n: times looked up, t, s: stage 0…3, due } */
    hw: null, hwh: [], /* homework from the tutor: { id, due, items: [{ k: 't' | 'p' | 'x', id, n, done, ok }], doneAt }; hwh — the last finished ones */
    rd: {},            /* 'YYYY-MM-DD' → readiness that day, % */
    wu: null,          /* today's warm-up (stays on the device) */
    tips: {},          /* one-time hints already shown */
    kbd: false, vib: true, pinAsk: true
  };
}
/* older progress is brought up to the current format here.
   1 → 2: reviews of mastered topics (md, rv, due), my words, homework, readiness by day; «Перевод» is no longer a switch that stays on */
function migrate(db) {
  const from = db.v || 1;
  ['sk', 'pb', 'days', 'log', 'goalH', 'badges', 'vc', 'rd', 'tips'].forEach(k => { if (!isObj(db[k])) db[k] = {}; });
  if (!Array.isArray(db.exams)) db.exams = [];
  if (!Array.isArray(db.hwh)) db.hwh = [];
  if (!isObj(db.bk)) db.bk = { at: 0, n: 0 };
  if (!isObj(db.hw) || !Array.isArray(db.hw.items)) db.hw = null;
  if (!isObj(db.old)) db.old = null;
  if (from < 2) {
    for (const k in db.sk) {
      const s = db.sk[k]; if (!isObj(s)) { delete db.sk[k]; continue; }
      if (s.m && !s.md) { s.md = s.t || Date.now(); s.rv = 0; s.due = plusDays(s.md, 3); }
    }
    if (db.tipTr) db.tips.tr = 1;
    delete db.ru; delete db.tipTr; db.plan = null;
  }
  db.v = DBV;
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
function keepCopy(id, db, why) {
  const list = snaps(id); list.unshift({ at: Date.now(), why, db });
  while (list.length > 3) list.pop();
  if (!LS.set('snap:' + id, list)) trimSnaps(id, 1);
}
function snapshot(why) {
  if (!DB || !DB.saved) return;
  const prev = LS.get('db:' + DB.id, null); if (prev) keepCopy(DB.id, prev, why);
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
  const raw = LS.get('db:' + id, null), old = !!raw && (raw.v || 1) < DBV;
  if (old) keepCopy(id, JSON.parse(JSON.stringify(raw)), 'перед обновлением приложения');      /* the format changes: the progress as it was stays as a copy */
  DB = migrate(raw || newDb((profiles().find(p => p.id === id) || {}).name || 'Ученик'));
  DB.id = id; if (old) DB.snapDay = ymd(new Date());        /* today's copy is the one just made */
  const ps = profiles(); const p = ps.find(x => x.id === id); if (p) { p.at = Date.now(); p.name = DB.name; saveProfiles(ps); }
  LS.set('last', id); SS.set('in', id);
  if (!raw || old) save();
  askPersist();
  return DB;
}
/* id: when a student's progress arrives from another device, the profile keeps that student's id,
   so the codes sent back and forth always find the same student */
async function createProfile(name, pin, id) {
  const db = newDb(normName(name)); if (id && !profOf(id)) db.id = id;
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
