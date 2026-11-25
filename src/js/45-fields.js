/* ===================== QUESTIONS ON SCREEN: statement, answer fields, maths keypad ===================== */
/* statement block: text (FR/RU), big formula, figure */
function qHtml(it, num) {
  let h = '<div class="instr">' + (num ? '<span class="exnum">' + num + '</span>' : '') + bt(it.q) + '</div>';
  if (it.m) h += '<div class="prompt">' + K(mi(it.m), true) + '</div>';
  else if (it.tex) h += '<div class="prompt">' + K(it.tex, true) + '</div>';
  if (it.fig) h += '<div class="figw">' + it.fig + '</div>';
  return h;
}
/* the right answer, as TeX */
function keyTex(spec, it) {
  if (spec.show) return spec.show;
  const f = spec.forms || [];
  if (spec.k === 'mcq') return '\\text{' + String(spec.opts[spec.c].fr).replace(/\$[^$]*\$/g, m => m).replace(/[{}\\$]/g, '') + '}';
  if (spec.k === 'order') return '';
  if (spec.k === 'ratio') return String(spec.key).split(':').join(' : ');
  if (spec.k === 'list') return String(spec.key).split(',').map(x => texNum(x.trim())).join(' ;\\; ');
  if (spec.k === 'dur') return '\\text{' + durStr(+spec.key, spec.u || 'hm') + '}';
  if (spec.k === 'time') return '\\text{' + clock24(+spec.key) + '}';
  if (spec.k === 'num' && (spec.dp != null || spec.sf != null)) return texNum(String(spec.key));
  if (spec.k === 'expr') return mi(spec.key);
  if (spec.k === 'num') { const v = ev(parse(spec.key), {}); if (f.includes('std')) return stdTex(v); return mi(spec.key); }
  if (spec.k === 'sol') return (spec.v || 'x') + '=' + splitList(spec.key).map(x => mi(x)).join(' \\text{ ou } ');
  if (spec.k === 'subj') return mi(spec.v + '=' + spec.key);
  return '';
}
const unitTex = u => u ? '\\;\\text{' + String(u).replace(/%/g, '\\%').replace(/€/g, '€').replace(/²/g, '}^2\\text{').replace(/³/g, '}^3\\text{') + '}' : '';
function answerHtml(spec) {
  if (spec.k === 'multi') return spec.parts.map(p => (p.lab ? bt(p.lab) + ' ' : '') + answerHtml(p.spec)).join('<br>');
  if (spec.k === 'mcq') return '<b>' + 'ABCDEFGH'[spec.c] + '.</b> ' + bt(spec.opts[spec.c]);
  if (spec.k === 'order') return '<ol class="ordok">' + spec.items.map(s => '<li>' + bt(s) + '</li>').join('') + '</ol>';
  return K(keyTex(spec) + unitTex(spec.unit));
}
function solHtml(it) {
  return '<div class="sol">' + (it.sol || []).map(s => {
    let h = '<div class="stp">';
    if (s.ru) h += '<div>' + rt(s.ru) + '</div>';
    if (s.m) h += '<div class="mth">' + K(mi(s.m) + unitTex(s.u)) + '</div>';
    if (s.tex) h += '<div class="mth">' + K(s.tex) + '</div>';
    if (s.svg) h += '<div class="figw">' + s.svg + '</div>';
    return h + '</div>';
  }).join('') + '</div>';
}
/* format hint under a field — Russian, short */
function fmtHelp(spec) {
  const f = spec.forms || [];
  if (spec.k === 'mcq' || spec.k === 'order' || spec.nohelp) return '';
  if (spec.help) return spec.help.ru || '';
  if (spec.k === 'ratio') return 'Отношение через двоеточие, например <code>3:5</code>';
  if (spec.k === 'list') return 'Числа через точку с запятой, например <code>1 ; 2 ; 4</code>';
  if (spec.k === 'dur') return 'Например <code>' + durStr({ hm: 285, min: 85, h: 150, ms: 565, s: 90 }[spec.u || 'hm'], spec.u || 'hm') + '</code>';
  if (spec.dp != null) return 'Округли: ровно ' + spec.dp + ' ' + plural(spec.dp, 'знак', 'знака', 'знаков') + ' после запятой';
  if (spec.sf != null) return 'Ровно ' + spec.sf + ' значащие цифры';
  if (f.includes('std')) return 'Научная запись: <code>4,5×10^-3</code> — клавиши × и ^';
  if (f.includes('frac')) return 'Дробь через /, например <code>7/12</code>; несократимая';
  if (spec.k === 'sol') return 'Число; два решения — через <code>;</code>';
  if (spec.k === 'expr') return 'Буквы — на клавиатуре, степень <code>^</code>, например <code>3x^2-5x</code>';
  return '';
}
function varsFor(it) {
  const s = new Set();
  const add = str => { try { varsOf(parse(str)).forEach(v => s.add(v)); } catch (e) { (String(str).match(/[a-zA-Z]/g) || []).forEach(v => s.add(v)); } };
  if (it.m) String(it.m).split(/[=;<>≤≥]/).forEach(p => p.trim() && add(p.replace(/root\(|sqrt\(|cbrt\(/g, '(')));
  fieldsOf(it.ans).forEach(f => { if (f.spec.k === 'expr' || f.spec.k === 'subj') { add(f.spec.key); if (f.spec.v) s.add(f.spec.v); } });
  if (fieldsOf(it.ans).every(f => f.spec.k !== 'expr' && f.spec.k !== 'subj')) return [];
  const arr = [...s].filter(v => /^[a-zA-Z]$/.test(v));
  if (!arr.length) arr.push('x');
  return arr.slice(0, 4);
}
const fieldsOf = spec => spec.k === 'multi' ? spec.parts.map(p => ({ lab: p.lab, spec: p.spec })) : [{ lab: null, spec }];

/* ---------- one answer field ----------
   st = { mark: 'ok'|'bad', reveal: bool, lock: bool } */
const FIELD_SPEC = {}, FIELD_VARS = {};
let VALS = {};                          /* current values of the fields on screen (practice or test) */
let ON_INPUT = null, ON_ENTER = null;   /* hooks of the screen: what to do on typing and on the ✓ key */
function fieldHtml(f, id, val, st) {
  const sp = f.spec; FIELD_SPEC[id] = sp;
  let h = '';
  if (f.lab) h += '<label class="flab" for="' + id + '">' + bt(f.lab) + '</label>';
  if (sp.k === 'mcq') {
    return h + '<div class="opts" role="radiogroup">' + sp.opts.map((o, k) => {
      let c = 'opt'; if (val !== '' && val != null && +val === k) c += ' on';
      if (st && st.reveal && k === sp.c) c += ' right'; else if (st && st.reveal && val !== '' && val != null && +val === k) c += ' wrong';
      return '<button type="button" class="' + c + '" role="radio" aria-checked="' + (c.includes(' on') ? 'true' : 'false') + '" data-opt="' + k + '" data-for="' + id + '"' + (st && st.lock ? ' disabled' : '') + '><span class="l">' + 'ABCDEFGH'[k] + '</span>' + bt(o) + '</button>';
    }).join('') + '</div>';
  }
  if (sp.k === 'order') {
    const chosen = String(val || '').split(',').filter(x => x !== '').map(Number);
    const lock = st && st.lock;
    h += '<div class="ord" data-ord="' + id + '">';
    h += '<ol class="ordsel">' + chosen.map((k, i) => '<li><button type="button" class="ordit on' + (st && st.reveal ? (k === i ? ' right' : ' wrong') : '') + '" data-ordrm="' + i + '" data-for="' + id + '"' + (lock ? ' disabled' : '') + '><span class="l">' + (i + 1) + '</span>' + bt(sp.items[k]) + '</button></li>').join('') +
      (chosen.length < sp.items.length ? '<li class="ordslot">' + (chosen.length ? 'Дальше — следующий шаг' : 'Нажимай на шаги ниже в нужном порядке') + '</li>' : '') + '</ol>';
    const pool = sp.perm.filter(k => !chosen.includes(k));
    if (pool.length) h += '<div class="ordpool">' + pool.map(k => '<button type="button" class="ordit" data-ordadd="' + k + '" data-for="' + id + '"' + (lock ? ' disabled' : '') + '>' + bt(sp.items[k]) + '</button>').join('') + '</div>';
    return h + '</div>';
  }
  const cls = st && st.mark ? (st.mark === 'ok' ? ' ok' : ' bad') : '';
  h += '<div class="unitrow">' + (sp.pre ? '<span class="unit pre">' + esc(sp.pre) + '</span>' : '') +
    '<input class="inp' + cls + '" id="' + id + '" data-field="' + id + '" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" inputmode="' + (DB && DB.kbd ? 'text' : 'none') + '" value="' + esc(val || '') + '"' + (st && st.lock ? ' readonly' : '') + ' aria-label="ответ">' +
    (sp.unit ? '<span class="unit">' + esc(sp.unit) + '</span>' : '') + '</div>';
  h += '<div class="pv" id="pv-' + id + '"></div>';
  const fh = fmtHelp(sp); if (fh && !(st && st.lock)) h += '<div class="syn">' + fh + '</div>';
  return h;
}
function updatePreview(inp) {
  const id = inp.dataset.field, spec = FIELD_SPEC[id]; const pv = document.getElementById('pv-' + id); if (!pv || !spec) return;
  const v = inp.value.trim(); if (!v || inp.readOnly || /^-?\d+([.,]\d+)?$/.test(v)) { pv.innerHTML = ''; return; }
  try { pv.innerHTML = K(previewTex(spec, v.replace(/(\d),(\d)/g, '$1.$2'))); }
  catch (e) { pv.innerHTML = e && e.merr ? '<span class="err">' + esc(e.ru) + '</span>' : ''; }
}
/* attach behaviour to the fields of a block (each element once); vals = object that receives the values */
const once = el => { if (el.dataset.w) return false; el.dataset.w = '1'; return true; };
function wireFields(root, vals, lockAll) {
  VALS = vals;
  $$('input.inp', root).filter(once).forEach(inp => {
    updatePreview(inp);
    inp.addEventListener('input', () => { vals[inp.dataset.field] = inp.value; updatePreview(inp); if (ON_INPUT) ON_INPUT(inp.dataset.field); });
    inp.addEventListener('focus', () => { if (inp.readOnly) return; ACTIVE = inp; showKb(FIELD_VARS[inp.dataset.field] || [], FIELD_SPEC[inp.dataset.field]); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); enterKey(); } });
  });
  $$('[data-opt]', root).filter(once).forEach(b => b.addEventListener('click', () => {
    if (lockAll || b.disabled) return; const id = b.dataset.for; vals[id] = b.dataset.opt;
    $$('[data-for="' + id + '"][data-opt]', root).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
    vib(8); if (ON_INPUT) ON_INPUT(id);
  }));
  $$('[data-ord]', root).filter(once).forEach(box => box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled || lockAll) return; const id = box.dataset.ord;
    const cur = String(vals[id] || '').split(',').filter(x => x !== '');
    if (b.dataset.ordadd != null) cur.push(b.dataset.ordadd); else if (b.dataset.ordrm != null) cur.splice(+b.dataset.ordrm);
    vals[id] = cur.join(','); vib(8);
    const wrap = document.createElement('div'); wrap.innerHTML = fieldHtml({ lab: null, spec: FIELD_SPEC[id] }, id, vals[id], null);
    box.replaceWith(wrap.firstChild); wireFields(root, vals, lockAll);
    if (ON_INPUT) ON_INPUT(id);
  }));
}

/* ---------- maths keypad (the phone keyboard stays closed: fields have inputmode=none) ---------- */
let ACTIVE = null;
const KEYS = [
  ['7'], ['8'], ['9'], ['+', 'op'], ['−', 'op', '-'], ['(', 'op'], [')', 'op'], ['^', 'op'], ['⌫', 'op', 'BK'],
  ['4'], ['5'], ['6'], ['×', 'op', '×'], ['/', 'op'], ['√', 'op'], ['x²', 'op', '^2'], [';', 'op', ' ; '], ['=', 'op'],
  ['1'], ['2'], ['3'], ['0'], [',', 'op', ','], ['π', 'op', 'π'], ['%', 'op', '%'], ['←', 'op', 'L'], ['→', 'op', 'R']];
function showKb(vars, spec) {
  const kb = $('#kb');
  /* a computer has its own keyboard: the keypad is for touch screens (or when the student chose the phone keyboard — then none) */
  if ((DB && DB.kbd) || (window.matchMedia && !matchMedia('(pointer: coarse)').matches)) { kb.hidden = true; document.documentElement.style.setProperty('--kb-h', '0px'); return; }
  const vs = (vars || []).slice(0, 4);
  let h = '<div class="in">' + KEYS.map(([l, c, v]) => '<button type="button" class="k ' + (c || '') + '" data-k="' + esc(v || l) + '" aria-label="' + esc(l) + '">' + l + '</button>').join('');
  vs.forEach(v => h += '<button type="button" class="k v" data-k="' + v + '">' + v + '</button>');
  h += '<button type="button" class="k op fn hide" data-k="HIDE" style="grid-column:span ' + (9 - vs.length - 3) + '" aria-label="Скрыть клавиатуру">' + ico('kb') + '<span>скрыть</span></button>';
  h += '<button type="button" class="k go" data-k="ENTER" style="grid-column:span 3">' + (window.KB_GO || 'Проверить') + '</button></div>';
  kb.innerHTML = h; kb.hidden = false; document.documentElement.classList.add('kbon');
  document.documentElement.style.setProperty('--kb-h', kb.offsetHeight + 'px');
  $$('.k', kb).forEach(b => { b.addEventListener('pointerdown', e => e.preventDefault()); b.addEventListener('click', () => keyPress(b.dataset.k)); });
  if (ACTIVE) { const r = ACTIVE.getBoundingClientRect(); const lim = window.innerHeight - kb.offsetHeight - 80; if (r.bottom > lim) window.scrollBy({ top: r.bottom - lim, behavior: 'smooth' }); }
}
function hideKb() { const kb = $('#kb'); if (kb) kb.hidden = true; document.documentElement.classList.remove('kbon'); document.documentElement.style.setProperty('--kb-h', '0px'); if (ACTIVE) ACTIVE.blur(); ACTIVE = null; }
document.addEventListener('pointerdown', e => { if (!ACTIVE) return; if (e.target.closest('#kb') || e.target.closest('input.inp') || e.target.closest('button')) return; hideKb(); });
function keyPress(k) {
  const el = ACTIVE; if (!el) return;
  if (k === 'ENTER') return enterKey();
  if (k === 'HIDE') return hideKb();
  const s = el.selectionStart ?? el.value.length, e = el.selectionEnd ?? s;
  if (k === 'BK') { if (s === e && s > 0) el.setRangeText('', s - 1, s, 'end'); else el.setRangeText('', s, e, 'end'); }
  else if (k === 'L') { const p = Math.max(0, s - 1); el.setSelectionRange(p, p); }
  else if (k === 'R') { const p = Math.min(el.value.length, e + 1); el.setSelectionRange(p, p); }
  else { el.setRangeText(k === '√' ? '√(' : k, s, e, 'end'); if (k === '√') { const p = el.selectionStart; el.setRangeText(')', p, p, 'start'); } }
  el.focus({ preventScroll: true });
  el.dispatchEvent(new Event('input'));
  vib(5);
}
function enterKey() { if (ON_ENTER) ON_ENTER(); else hideKb(); }

/* typed answer → what the checker reads: French decimal comma, π, % sign */
function tidyIn(spec, v) {
  if (v == null) return v;
  let s = String(v);
  if (spec.k === 'expr' || spec.k === 'subj') s = s.replace(/(\d),(\d)/g, '$1.$2');
  /* π is read by the engine itself (6π = 6 × π); a % sign after a number is the unit, not part of the number */
  if (spec.k === 'num' || spec.k === 'sol') s = s.replace(/%\s*$/, '');
  return s;
}
const gradeField = (spec, v) => grade(spec, tidyIn(spec, v));
