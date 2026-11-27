/* ===================== PROGRESS AS A CODE OR A FILE =====================
   The progress lives on the device only. The code carries it between the student and the tutor:
   the tutor pastes the student's code, they work at the lesson, the tutor's code goes back.
   A code or a file never wipes anything: it is merged into what is already there. */
function backupData() { return { app: APP.id, kind: 'progress', v: DBV, at: Date.now(), db: DB }; }
const okId = k => /^[a-z0-9.\-_]{1,60}$/i.test(k);
const okDay = k => /^\d{4}-\d{2}-\d{2}$/.test(k);
const EX_MODES = ['p1', 'p2', 'blanc', 'quick', 'diag'];
const HW_KINDS = ['t', 'p', 'x'];
/* badges in a fixed order: the progress code refers to them by number — append only */
const BADGE_IDS = ['first', 't100', 't500', 't1500', 's3', 's7', 's30', 'diag', 'ch', 'pb10', 'blanc', 'b14', 'b17', 'all', 'hw5', 'w20', 'rev30'];

/* strict check of what comes from outside: only known fields of known shapes; src = the id of the student on the other device */
function sanitizeDb(d) {
  if (!isObj(d)) return null;
  const num = (x, lo, hi) => (typeof x === 'number' && isFinite(x) && x >= lo && x <= hi ? x : 0);
  const T = x => num(x, 0, 4e12);
  const out = newDb(normName(d.name) || 'Ученик');
  out.src = typeof d.id === 'string' && /^p[a-z0-9]{4,30}$/.test(d.id) ? d.id : null;
  out.created = T(d.created) || Date.now();
  if (isObj(d.sk)) for (const k in d.sk) { const s = d.sk[k]; if (okId(k) && isObj(s)) out.sk[k] = { a: num(s.a, 0, 1e6), c: num(s.c, 0, 1e6), s: num(s.s, 0, 1e6), m: s.m ? 1 : 0, t: T(s.t), d: s.d ? 1 : 0, r: typeof s.r === 'string' ? s.r.replace(/[^01]/g, '').slice(-8) : '', md: T(s.md), rv: num(s.rv, 0, 50), due: T(s.due), tm: num(s.tm, 0, 3600) }; }
  if (isObj(d.pb)) for (const k in d.pb) { const s = d.pb[k]; if (okId(k) && isObj(s)) out.pb[k] = { n: num(s.n, 0, 1e6), best: num(s.best, 0, 1), last: num(s.last, 0, 1), t: T(s.t) }; }
  if (isObj(d.days)) for (const k in d.days) if (okDay(k)) out.days[k] = num(d.days[k], 0, 1e5);
  if (isObj(d.log)) for (const k in d.log) { const s = d.log[k]; if (okDay(k) && isObj(s)) out.log[k] = { n: num(s.n, 0, 1e5), ok: num(s.ok, 0, 1e5), tr: num(s.tr, 0, 1e5), w: num(s.w, 0, 1e5) }; }
  if (isObj(d.old)) out.old = { n: num(d.old.n, 0, 1e7), days: num(d.old.days, 0, 1e5), upto: okDay(d.old.upto) ? d.old.upto : '2026-01-01' };
  if (isObj(d.goalH)) for (const k in d.goalH) if (okDay(k)) out.goalH[k] = num(d.goalH[k], 0, 500);
  if (isObj(d.badges)) for (const k in d.badges) if (okId(k)) out.badges[k] = T(d.badges[k]);
  if (Array.isArray(d.exams)) out.exams = d.exams.slice(-30).filter(isObj).map(e => ({ mode: EX_MODES.includes(e.mode) ? e.mode : 'quick', t0: T(e.t0), t1: T(e.t1), p1: num(e.p1, 0, 6), p2: num(e.p2, 0, 12), note: num(e.note, 0, 20), max: num(e.max, 0, 20), n: num(e.n, 0, 500), ok: num(e.ok, 0, 500), weak: Array.isArray(e.weak) ? e.weak.filter(okId).slice(0, 12) : [] }));
  if (isObj(d.diag)) out.diag = { at: T(d.diag.at), n: num(d.diag.n, 0, 100), ok: num(d.diag.ok, 0, 100) };
  out.goal = num(d.goal, 0, 200); out.bs = num(d.bs, 0, 1000); out.kbd = !!d.kbd; out.vib = d.vib !== false; out.pinAsk = d.pinAsk !== false;
  if (isObj(d.tips)) for (const k in d.tips) if (okId(k)) out.tips[k] = 1;
  if (isObj(d.bk)) out.bk = { at: T(d.bk.at), n: num(d.bk.n, 0, 1e7) };
  out.imp = T(d.imp);
  if (isObj(d.vc)) Object.keys(d.vc).slice(0, 3000).forEach(k => { const v = d.vc[k]; if (k.length <= 60 && !/[<>&"]/.test(k) && isObj(v)) out.vc[k] = { n: num(v.n, 0, 1e5), t: T(v.t), s: num(v.s, 0, 3), due: T(v.due) }; });
  const hwOk = h => isObj(h) && T(h.id) ? { id: T(h.id), due: okDay(h.due) ? h.due : null, doneAt: T(h.doneAt),
    items: (Array.isArray(h.items) ? h.items : []).filter(it => isObj(it) && HW_KINDS.includes(it.k) && (it.k === 'x' ? EX_MODES.includes(it.id) : okId(it.id))).slice(0, 20).map(it => ({ k: it.k, id: it.id, n: num(it.n, 1, 60) || 1, done: num(it.done, 0, 500), ok: num(it.ok, 0, 500) })) } : null;
  out.hw = hwOk(d.hw);
  if (Array.isArray(d.hwh)) out.hwh = d.hwh.filter(h => isObj(h) && T(h.id)).slice(-10).map(h => ({ id: T(h.id), due: okDay(h.due) ? h.due : null, n: num(h.n, 0, 2000), done: num(h.done, 0, 2000), ok: num(h.ok, 0, 2000), doneAt: T(h.doneAt) }));
  if (isObj(d.rd)) Object.keys(d.rd).filter(okDay).sort().slice(-120).forEach(k => { out.rd[k] = num(d.rd[k], 0, 100); });
  return out;
}

/* answers before the day `cut`: the days listed one by one plus the total kept for the days that are not listed */
function olderTotals(d, cut) {
  let n = d.old ? d.old.n : 0, days = d.old ? d.old.days : 0;
  for (const k in d.days) if (k < cut && d.days[k]) { n += d.days[k]; days++; }
  return { n, days };
}
/* two copies of one student's progress → one. For each topic the more recent answer decides its state;
   counts never go down, so nothing that was done is lost. */
function mergeDb(a, b) {
  const o = JSON.parse(JSON.stringify(a));
  for (const k in b.sk) {
    const x = o.sk[k], y = b.sk[k]; if (!x) { o.sk[k] = y; continue; }
    const nw = (y.t || 0) > (x.t || 0) ? y : x;
    o.sk[k] = { a: Math.max(x.a || 0, y.a || 0), c: Math.max(x.c || 0, y.c || 0), s: nw.s || 0, m: nw.m ? 1 : 0, t: nw.t || 0, d: x.d && y.d ? 1 : 0, r: nw.r || '', md: nw.md || 0, rv: nw.rv || 0, due: nw.due || 0, tm: nw.tm || x.tm || y.tm || 0 };
  }
  for (const k in b.pb) { const x = o.pb[k], y = b.pb[k]; o.pb[k] = !x ? y : { n: Math.max(x.n, y.n), best: Math.max(x.best, y.best), last: (x.t || 0) >= (y.t || 0) ? x.last : y.last, t: Math.max(x.t || 0, y.t || 0) }; }
  /* days: the totals before the common cut must not be counted twice */
  const cut = [a.old && a.old.upto, b.old && b.old.upto].filter(Boolean).sort().pop();
  for (const k in b.days) o.days[k] = Math.max(o.days[k] || 0, b.days[k]);
  for (const k in b.log) { const x = o.log[k] || { n: 0, ok: 0, tr: 0, w: 0 }, y = b.log[k]; o.log[k] = { n: Math.max(x.n || 0, y.n || 0), ok: Math.max(x.ok || 0, y.ok || 0), tr: Math.max(x.tr || 0, y.tr || 0), w: Math.max(x.w || 0, y.w || 0) }; }
  for (const k in b.goalH) if (!o.goalH[k]) o.goalH[k] = b.goalH[k];
  if (cut) {
    const ta = olderTotals(a, cut), tb = olderTotals(b, cut); let n = 0, days = 0;
    for (const k in o.days) if (k < cut && o.days[k]) { n += o.days[k]; days++; }
    o.old = { upto: cut, n: Math.max(0, Math.max(ta.n, tb.n) - n), days: Math.max(0, Math.max(ta.days, tb.days) - days) };
  }
  for (const k in b.badges) o.badges[k] = o.badges[k] ? Math.min(o.badges[k], b.badges[k]) : b.badges[k];
  const seen = new Set(o.exams.map(e => Math.floor(e.t0 / 60000) + '|' + e.mode)); b.exams.forEach(e => { if (!seen.has(Math.floor(e.t0 / 60000) + '|' + e.mode)) o.exams.push(e); });
  o.exams.sort((x, y) => x.t0 - y.t0); o.exams = o.exams.slice(-30);
  if (!o.diag && b.diag) o.diag = b.diag;
  o.bs = Math.max(o.bs || 0, b.bs || 0);
  o.bk = { at: Math.max((o.bk || {}).at || 0, (b.bk || {}).at || 0), n: Math.max((o.bk || {}).n || 0, (b.bk || {}).n || 0) };
  o.imp = Math.max(o.imp || 0, b.imp || 0);
  o.vc = o.vc || {};
  for (const k in b.vc || {}) { const x = o.vc[k], y = b.vc[k]; if (!x) { o.vc[k] = y; continue; } const nw = (y.t || 0) > (x.t || 0) ? y : x; o.vc[k] = { n: Math.max(x.n || 0, y.n || 0), t: nw.t || 0, s: nw.s || 0, due: nw.due || 0 }; }
  /* homework: the newer assignment is the current one; the same assignment keeps the larger counts */
  const ha = o.hw, hb = b.hw;
  if (hb && (!ha || hb.id > ha.id)) { if (ha) pushHwh(o, ha); o.hw = JSON.parse(JSON.stringify(hb)); }
  else if (ha && hb && ha.id === hb.id) { ha.doneAt = ha.doneAt && hb.doneAt ? Math.min(ha.doneAt, hb.doneAt) : ha.doneAt || hb.doneAt || 0; ha.items.forEach((it, i) => { const y = hb.items[i]; if (y && y.k === it.k && y.id === it.id) { it.done = Math.max(it.done || 0, y.done || 0); it.ok = Math.max(it.ok || 0, y.ok || 0); } }); }
  else if (ha && hb && hb.id < ha.id) pushHwh(o, hb);
  (b.hwh || []).forEach(h => pushHwh(o, h));
  o.rd = o.rd || {}; for (const k in b.rd || {}) o.rd[k] = Math.max(o.rd[k] || 0, b.rd[k]);
  return o;
}
/* a homework that is over goes to the short history (the last 10) */
function hwTotals(h) { const its = h.items || []; return { n: its.reduce((s, it) => s + (it.k === 't' ? it.n : 1), 0), done: its.reduce((s, it) => s + Math.min(it.k === 't' ? it.n : 1, it.done || 0), 0), ok: its.reduce((s, it) => s + (it.ok || 0), 0) }; }
function pushHwh(db, h) {
  db.hwh = db.hwh || [];
  const rec = h.items ? Object.assign({ id: h.id, due: h.due || null, doneAt: h.doneAt || 0 }, hwTotals(h)) : h;
  const i = db.hwh.findIndex(x => x.id === rec.id);
  if (i >= 0) db.hwh[i] = { id: rec.id, due: rec.due, n: Math.max(db.hwh[i].n, rec.n), done: Math.max(db.hwh[i].done, rec.done), ok: Math.max(db.hwh[i].ok, rec.ok), doneAt: db.hwh[i].doneAt || rec.doneAt }; else db.hwh.push(rec);
  db.hwh.sort((x, y) => x.id - y.id); db.hwh = db.hwh.slice(-10);
}
const dbTasks = d => Object.values(d.days || {}).reduce((s, x) => s + x, 0) + (d.old ? d.old.n : 0);
/* what a student has done, in numbers — shown before a merge so nothing is changed blindly */
function dbSummary(d) {
  return { tasks: dbTasks(d), topics: Object.keys(d.sk || {}).filter(k => d.sk[k].m && TOPICS.some(t => t.id === k)).length, exams: (d.exams || []).length, probs: Object.keys(d.pb || {}).length, words: Object.keys(d.vc || {}).length, last: d.saved || 0 };
}
function applyIncoming(inc, why) {
  snapshot(why || 'перед загрузкой копии');
  const keep = { id: DB.id, name: DB.name, created: Math.min(DB.created || Date.now(), inc.created || Date.now()), kbd: DB.kbd, vib: DB.vib, pinAsk: DB.pinAsk, tips: DB.tips, cur: DB.cur, last: DB.last, plan: null, wu: DB.wu, goal: DB.goal || inc.goal || 0 };
  DB = Object.assign(mergeDb(DB, inc), keep, { v: DBV, snapDay: DB.snapDay, imp: Date.now() });
  save();
}

/* ===================== THE CODE =====================
   BRV3.<base64url>: a compact binary record, so that a whole school year still fits in one Telegram message (< 4096 characters).
   Topics and problems are written by their permanent numbers (src/content/ids.js), times to the minute, days as numbers. */
const MIN0 = Date.UTC(2026, 0, 1) / 60000, DAY0 = Date.UTC(2026, 0, 1) / 864e5;
const DAYS_WIN = 35, VC_MAX = 30, EX_MAX = 12;
const t2m = t => (t ? Math.max(1, Math.floor(t / 60000 - MIN0)) : 0);
const m2t = m => (m ? (m + MIN0) * 60000 : 0);
const k2d = k => Math.round(Date.UTC(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10)) / 864e5 - DAY0);
const d2k = n => { const d = new Date((n + DAY0) * 864e5); return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'); };
const t2day = t => (t ? Math.max(0, k2d(ymd(new Date(t)))) : 0);          /* a moment → the number of the student's calendar day */
const day2t = n => parseYmd(d2k(n)).getTime();
const rBits = r => (r ? parseInt('1' + String(r).replace(/[^01]/g, '').slice(-8), 2) : 0);
const bitsR = n => (n > 1 ? (+n).toString(2).slice(1) : '');
function fnv32(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
let IDMAP = null;
const idMap = () => IDMAP || (IDMAP = new Map(IDX.map((id, i) => [id, i])));
const b64url = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64url = s => { const b = atob(s.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
function BW() {
  const a = [];
  const w = { a,
    u8(v) { a.push(Math.max(0, Math.min(255, Math.round(v) || 0))); },
    vu(v) { v = Math.max(0, Math.round(v) || 0); while (v > 127) { a.push((v % 128) | 128); v = Math.floor(v / 128); } a.push(v); },
    str(s) { const u = new TextEncoder().encode(String(s)); w.vu(u.length); for (const b of u) a.push(b); },
    u32(v) { a.push(v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255); } };
  return w;
}
function BR(u8) {
  let i = 0;
  const need = n => { if (i + n > u8.length) throw new Error('short'); };
  const r = {
    u8() { need(1); return u8[i++]; },
    vu() { let v = 0, m = 1, b; do { need(1); b = u8[i++]; v += (b & 127) * m; m *= 128; } while (b & 128); return v; },
    str() { const n = r.vu(); need(n); const s = new TextDecoder().decode(u8.subarray(i, i + n)); i += n; return s; },
    u32() { need(4); const v = (u8[i] | (u8[i + 1] << 8) | (u8[i + 2] << 16) | (u8[i + 3] << 24)) >>> 0; i += 4; return v; } };
  return r;
}
function packV3(d) {
  const w = BW(), idx = idMap();
  w.u8(3); w.str(d.id || ''); w.str(d.name || ''); w.vu(t2m(d.created)); w.vu(d.goal || 0); w.vu(d.bs || 0); w.vu(t2m((d.bk || {}).at));
  const sk = Object.keys(d.sk || {}).filter(k => idx.has(k) && (d.sk[k].a || d.sk[k].m));
  w.vu(sk.length);
  sk.forEach(k => {
    const s = d.sk[k], td = t2day(s.t);
    w.vu(idx.get(k)); w.vu(s.a || 0);
    w.u8((s.m ? 1 : 0) | (s.d ? 2 : 0) | (Math.min(7, s.rv || 0) << 2) | (s.due ? 32 : 0) | (s.md ? 64 : 0));
    w.vu(t2m(s.t)); w.vu(rBits(s.r));
    if (s.due) w.vu(Math.max(0, t2day(s.due) - td));
    if (s.md) w.vu(Math.max(0, td - t2day(s.md)));
    w.u8(Math.min(255, Math.round((s.tm || 0) / 2)));
  });
  const pb = Object.keys(d.pb || {}).filter(k => idx.has(k));
  w.vu(pb.length);
  pb.forEach(k => { const s = d.pb[k]; w.vu(idx.get(k)); w.vu(s.n || 0); w.u8(100 * (s.best || 0)); w.u8(100 * (s.last || 0)); w.vu(t2m(s.t)); });
  /* days: the last five weeks one by one, everything before as a total */
  const keys = Object.keys(d.days || {}).filter(k => okDay(k) && d.days[k]).sort();
  /* never earlier than the day before which this copy itself knows only a total */
  const base = Math.max(0, (keys.length ? k2d(keys[keys.length - 1]) : 0) - (DAYS_WIN - 1), d.old && okDay(d.old.upto) ? k2d(d.old.upto) : 0), cut = d2k(base);
  const older = olderTotals(d, cut);
  const act = keys.filter(k => k >= cut);
  w.vu(base); w.vu(older.n); w.vu(older.days); w.vu(act.length);
  let prev = base;
  act.forEach(k => { const di = k2d(k), lg = (d.log || {})[k] || {}; w.vu(di - prev); prev = di; w.vu(d.days[k]); w.vu(Math.min(d.days[k], lg.ok || 0)); w.vu(lg.tr || 0); w.vu(lg.w || 0); w.u8((d.goalH || {})[k] || 0); });
  const ex = (d.exams || []).slice(-EX_MAX);
  w.vu(ex.length);
  ex.forEach(e => { w.u8(Math.max(0, EX_MODES.indexOf(e.mode))); w.vu(t2m(e.t0)); w.u8((e.p1 || 0) * 10); w.u8((e.p2 || 0) * 10); w.u8(e.max || 0); w.vu(e.n || 0); w.vu(e.ok || 0); w.vu(Math.max(0, ((e.t1 || e.t0) - e.t0) / 60000)); });
  const weak = ex.length ? (ex[ex.length - 1].weak || []).filter(k => idx.has(k)).slice(0, 10) : [];
  w.vu(weak.length); weak.forEach(k => w.vu(idx.get(k)));
  const bd = Object.keys(d.badges || {}).filter(k => BADGE_IDS.includes(k));
  w.vu(bd.length); bd.forEach(k => { w.u8(BADGE_IDS.indexOf(k)); w.vu(t2day(d.badges[k])); });
  w.u8(d.diag ? 1 : 0); if (d.diag) { w.vu(t2day(d.diag.at)); w.u8(d.diag.n); w.u8(d.diag.ok); }
  /* my words: the ones still being learned first, the most recent first */
  const vc = Object.keys(d.vc || {}).map(k => [k, d.vc[k]]).sort((x, y) => (x[1].s >= 3) - (y[1].s >= 3) || (y[1].t || 0) - (x[1].t || 0)).slice(0, VC_MAX);
  w.vu(vc.length); vc.forEach(([k, v]) => { w.u32(fnv32(k)); w.u8((v.s & 3) | (Math.min(63, v.n || 1) << 2)); w.vu(t2day(v.t)); w.vu(v.due ? Math.max(0, t2day(v.due) - t2day(v.t)) + 1 : 0); });
  const hwItems = h => (h.items || []).filter(it => (it.k === 'x' ? EX_MODES.includes(it.id) : idx.has(it.id))).slice(0, 20);
  w.u8(d.hw ? 1 : 0);
  if (d.hw) { const its = hwItems(d.hw); w.vu(t2m(d.hw.id)); w.vu(d.hw.due ? k2d(d.hw.due) + 1 : 0); w.vu(t2m(d.hw.doneAt)); w.vu(its.length); its.forEach(it => { w.u8(HW_KINDS.indexOf(it.k)); w.vu(it.k === 'x' ? EX_MODES.indexOf(it.id) : idx.get(it.id)); w.u8(it.n || 1); w.u8(it.done || 0); w.u8(it.ok || 0); }); }
  const hh = (d.hwh || []).slice(-3);
  w.vu(hh.length); hh.forEach(h => { w.vu(t2m(h.id)); w.vu(h.due ? k2d(h.due) + 1 : 0); w.vu(h.n || 0); w.vu(h.done || 0); w.vu(h.ok || 0); w.vu(t2m(h.doneAt)); });
  /* readiness: now, a week ago, a month ago — enough to show how it changes */
  const rk = Object.keys(d.rd || {}).filter(okDay).sort(), pick = [];
  if (rk.length) { const lastK = rk[rk.length - 1]; pick.push(lastK); [7, 30].forEach(n => { const lim = addDaysKey(lastK, -n); const k = rk.filter(x => x <= lim).pop(); if (k && !pick.includes(k)) pick.push(k); }); }
  w.vu(pick.length); pick.forEach(k => { w.vu(Math.max(0, k2d(k))); w.u8(d.rd[k]); });
  let sum = 0; for (const b of w.a) sum = (sum + b) % 251;
  w.a.push(sum);
  return Uint8Array.from(w.a);
}
let LEMMAS = null;      /* hash → the dictionary form of a word */
function lemmaByHash(h) {
  if (!LEMMAS) { LEMMAS = new Map(); LEXI.forEach(e => { if (e.k === 0) { const l = lexLemma(e); LEMMAS.set(fnv32(l), l); } }); }
  return LEMMAS.get(h);
}
function unpackV3(u8) {
  const BAD = 'Код повреждён или скопирован не до конца';
  if (u8.length < 8 || u8[0] !== 3) throw new Error(BAD);
  let sum = 0; for (let i = 0; i < u8.length - 1; i++) sum = (sum + u8[i]) % 251;
  if (sum !== u8[u8.length - 1]) throw new Error(BAD);
  const r = BR(u8.subarray(0, u8.length - 1)), d = { sk: {}, pb: {}, days: {}, log: {}, goalH: {}, badges: {}, exams: [], vc: {}, hwh: [], rd: {} };
  try {
    r.u8(); d.id = r.str(); d.name = r.str(); d.created = m2t(r.vu()); d.goal = r.vu(); d.bs = r.vu(); d.bk = { at: m2t(r.vu()), n: 0 };
    for (let n = r.vu(); n > 0; n--) {
      const id = IDX[r.vu()], a = r.vu(), fl = r.u8(), t = m2t(r.vu()), rr = bitsR(r.vu()), td = t2day(t);
      const due = fl & 32 ? day2t(td + r.vu()) : 0, md = fl & 64 ? day2t(Math.max(0, td - r.vu())) : 0, tm = r.u8() * 2;
      const s = (/1*$/.exec(rr) || [''])[0].length;
      if (id) d.sk[id] = { a, c: 0, s, m: fl & 1, t, d: fl & 2 ? 1 : 0, r: rr, md, rv: (fl >> 2) & 7, due, tm };
    }
    for (let n = r.vu(); n > 0; n--) { const id = IDX[r.vu()], cnt = r.vu(), best = r.u8() / 100, last = r.u8() / 100, t = m2t(r.vu()); if (id) d.pb[id] = { n: cnt, best, last, t }; }
    const base = r.vu(), on = r.vu(), od = r.vu();
    d.old = { upto: d2k(base), n: on, days: od };
    let prev = base;
    for (let n = r.vu(); n > 0; n--) { prev += r.vu(); const k = d2k(prev), cnt = r.vu(), ok = r.vu(), tr = r.vu(), ww = r.vu(), g = r.u8(); d.days[k] = cnt; d.log[k] = { n: cnt, ok, tr, w: ww }; if (g) d.goalH[k] = g; }
    for (let n = r.vu(); n > 0; n--) { const mode = EX_MODES[r.u8()] || 'quick', t0 = m2t(r.vu()), p1 = r.u8() / 10, p2 = r.u8() / 10, max = r.u8(), cnt = r.vu(), ok = r.vu(), dur = r.vu(); d.exams.push({ mode, t0, t1: t0 + dur * 60000, p1, p2, note: Math.round((p1 + p2) * 10) / 10, max, n: cnt, ok, weak: [] }); }
    const weak = []; for (let n = r.vu(); n > 0; n--) { const id = IDX[r.vu()]; if (id) weak.push(id); }
    if (d.exams.length) d.exams[d.exams.length - 1].weak = weak;
    for (let n = r.vu(); n > 0; n--) { const id = BADGE_IDS[r.u8()], day = r.vu(); if (id) d.badges[id] = day2t(day); }
    if (r.u8()) d.diag = { at: day2t(r.vu()), n: r.u8(), ok: r.u8() };
    for (let n = r.vu(); n > 0; n--) { const lemma = lemmaByHash(r.u32()), b = r.u8(), day = r.vu(), dd = r.vu(); if (lemma) d.vc[lemma] = { n: b >> 2, t: day2t(day), s: b & 3, due: dd ? day2t(day + dd - 1) : 0 }; }
    const item = () => { const k = HW_KINDS[r.u8()], v = r.vu(), n = r.u8(), done = r.u8(), ok = r.u8(); const id = k === 'x' ? EX_MODES[v] : IDX[v]; return k && id ? { k, id, n, done, ok } : null; };
    if (r.u8()) { const id = m2t(r.vu()), due = r.vu(), doneAt = m2t(r.vu()), items = []; for (let n = r.vu(); n > 0; n--) { const it = item(); if (it) items.push(it); } d.hw = { id, due: due ? d2k(due - 1) : null, doneAt, items }; }
    for (let n = r.vu(); n > 0; n--) { const id = m2t(r.vu()), due = r.vu(), nn = r.vu(), done = r.vu(), ok = r.vu(), doneAt = m2t(r.vu()); d.hwh.push({ id, due: due ? d2k(due - 1) : null, n: nn, done, ok, doneAt }); }
    for (let n = r.vu(); n > 0; n--) { const k = d2k(r.vu()); d.rd[k] = r.u8(); }
  } catch (e) { throw new Error(BAD); }
  return d;
}
function progressCode(db) { return 'BRV3.' + b64url(packV3(db || DB)); }

/* ---------- the first codes (BRV2: JSON, deflated) are still read ---------- */
function unpackV2(p) {
  if (!p || p.a !== APP.id || p.v !== 2) throw new Error('Это не код прогресса Brevet');
  const arr = x => (Array.isArray(x) ? x : []), DM = DAY0 * 1440;
  const d2t = n => (n < 0 ? 0 : (n + DAY0) * 864e5);
  const d = { id: p.id, name: p.n, created: d2t(p.c), sk: {}, pb: {}, days: {}, log: {}, badges: {}, exams: [], goal: p.g };
  for (const ch in p.sk || {}) for (const rest in p.sk[ch] || {}) { const s = arr(p.sk[ch][rest]); d.sk[ch ? ch + '.' + rest : rest] = { a: +s[0], c: +s[1], s: +s[2], m: s[3] & 1 ? 1 : 0, t: d2t(+s[4]), d: s[3] & 2 ? 1 : 0, r: bitsR(s[5]) }; }
  for (const k in p.pb || {}) { const s = arr(p.pb[k]); d.pb['p2.' + k] = { n: +s[0], best: s[1] / 100, last: s[2] / 100, t: d2t(+s[3]) }; }
  arr(p.dn).forEach((n, i) => { if (n) { const k = d2k(p.d0 + i); d.days[k] = +n; d.log[k] = { n: +n, ok: 0 }; } });
  d.exams = arr(p.ex).map(e => { const t0 = (e[1] + DM) * 60000; return { mode: e[0], t0, t1: t0, p1: e[2] / 10, p2: e[3] / 10, note: Math.round(e[2] + e[3]) / 10, max: e[4], n: e[5], ok: e[6], weak: String(e[7] || '').split(' ').filter(Boolean) }; });
  for (const k in p.bd || {}) d.badges[k] = d2t(p.bd[k]);
  if (Array.isArray(p.dg)) d.diag = { at: d2t(p.dg[0]), n: p.dg[1], ok: p.dg[2] };
  return migrate(d);
}
async function pipeBytes(u8, stream) { const r = new Response(new Blob([u8]).stream().pipeThrough(stream)); return new Uint8Array(await r.arrayBuffer()); }
/* the code may come inside a message with other words around it */
async function readCode(code) {
  const m = /BRV([0123])\.([A-Za-z0-9_-]+)/.exec(String(code || '').replace(/\s+/g, ''));
  if (!m) throw new Error('Не нашёл код. Вставь сообщение с кодом целиком — он начинается с BRV');
  let u8; try { u8 = unb64url(m[2]); } catch (e) { throw new Error('Код повреждён — скопируй его ещё раз целиком'); }
  if (m[1] === '3') return sanitizeDb(unpackV3(u8));
  if (m[1] !== '0') { if (typeof DecompressionStream !== 'function') throw new Error('Этот браузер не умеет читать старый код. Попроси прислать новый.'); try { u8 = await pipeBytes(u8, new DecompressionStream('deflate-raw')); } catch (e) { throw new Error('Код повреждён или скопирован не до конца'); } }
  let obj; try { obj = JSON.parse(new TextDecoder().decode(u8)); } catch (e) { throw new Error('Код повреждён или скопирован не до конца'); }
  return readBackup(obj);
}
/* a progress file (or an old code) → a clean copy of the progress */
function readBackup(obj) {
  if (obj && obj.a === APP.id && obj.v === 2) return sanitizeDb(unpackV2(obj));
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
