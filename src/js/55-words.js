/* ===================== WORDS: tap a French word — see it in Russian; «Мои слова» =====================
   The statements stay in French, as on the exam. A word the student does not know is one tap away:
   the translation appears next to it, and the word goes to «Мои слова» to be repeated after 1, 4 and 14 days.
   Inside the answer buttons a tap chooses the answer, so there the word is shown on a long press (or a right click).
   The mock exams have neither: chrome({ words: true }) switches the words on for a screen. */

/* every French word of the screen becomes its own element (formulas and figures are left alone);
   words of one piece of text share a run number, so an expression is never glued across a formula */
let WRUN = 0;
function wrapWords(root) {
  $$('[lang="fr"]', root || $('#app')).forEach(el => {
    if (el.dataset.ww) return; el.dataset.ww = '1';
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentElement.closest('.katex, .w, svg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const nodes = []; while (tw.nextNode()) nodes.push(tw.currentNode);
    nodes.forEach(n => {
      const text = n.nodeValue, toks = lexTokens(text).filter(t => !lexSkip(t.w)); if (!toks.length) return;
      const frag = document.createDocumentFragment(); let at = 0; WRUN++;
      toks.forEach(t => {
        if (t.i > at) frag.appendChild(document.createTextNode(text.slice(at, t.i)));
        const sp = document.createElement('span'); sp.className = 'w'; sp.textContent = text.slice(t.i, t.j); sp._w = t.w; sp._r = WRUN;
        frag.appendChild(sp); at = t.j;
      });
      if (at < text.length) frag.appendChild(document.createTextNode(text.slice(at)));
      n.parentNode.replaceChild(frag, n);
    });
  });
}
let LEXLEM = null;
function lexByLemma(l) { if (!LEXLEM) { LEXLEM = new Map(); LEXI.forEach(e => { if (e.k === 0) LEXLEM.set(lexLemma(e), e); }); } return LEXLEM.get(l); }

/* what the lexicon says about the word in the element el → { els: the elements of the word or expression, fr, ru, save: lemma | null } */
function wordInfo(el) {
  const box = el.closest('[lang="fr"]'); if (!box) return null;
  const run = $$('.w', box).filter(x => x._r === el._r), i = run.indexOf(el); if (i < 0) return null;
  const f = lexFind(run.map(x => ({ w: x._w })), i);
  if (!f) return { els: [el], fr: el._w, ru: null, save: null };
  const els = run.slice(f.from, f.to);
  if (f.parts) {            /* peut-on, a-t-il: the parts one by one */
    const es = [...new Set(f.parts)].map(lexEntry).filter(Boolean);
    return { els, fr: el._w, ru: es.map(e => lexLemma(e) + ' — ' + e.ru).join('; ') || 'имя или название', save: null };
  }
  const e = lexEntry(f.idx);
  if (!e || e.k === 2) return { els, fr: els.map(x => x.textContent).join(' '), ru: 'имя или название — не переводится', save: null, name: true };
  return { els, fr: lexLemma(e), ru: e.ru, save: e.k === 0 ? lexLemma(e) : null };
}
let WLAST = { l: '', t: 0 };
function vcAdd(lemma) {
  const now = Date.now(), v = DB.vc[lemma], again = WLAST.l === lemma && now - WLAST.t < 90000;
  WLAST = { l: lemma, t: now };
  if (again && v) return false;                           /* the same word looked at twice in a row is one look */
  DB.vc[lemma] = { n: (v ? v.n : 0) + 1, t: now, s: 0, due: plusDays(now, 1) };
  dayLog().w++; saveSoon();
  return !v;
}
function closeWord() { const p = document.getElementById('wpop'); if (p) p.remove(); $$('.w.on').forEach(x => x.classList.remove('on')); }
function showWord(el) {
  closeWord();
  const info = wordInfo(el); if (!info) return;
  info.els.forEach(x => x.classList.add('on'));
  const isNew = info.save && DB ? vcAdd(info.save) : false;
  if (DB) tipOff('tr');
  const p = document.createElement('div'); p.id = 'wpop'; p.setAttribute('role', 'status');
  p.innerHTML = info.ru == null
    ? '<b lang="fr">' + esc(info.fr) + '</b><span>Этого слова пока нет в словаре. Весь текст по-русски — кнопка «Перевод» вверху.</span>'
    : (info.name ? '' : '<b lang="fr">' + esc(info.fr) + '</b>') + '<span>' + esc(info.ru) + '</span>' + (isNew ? '<small>добавлено в «Мои слова»</small>' : '');
  document.body.appendChild(p);
  /* above the word when there is room, else below; never off the screen */
  const a = info.els[0].getBoundingClientRect(), b = info.els[info.els.length - 1].getBoundingClientRect();
  const top = Math.min(a.top, b.top), bottom = Math.max(a.bottom, b.bottom), cx = a.top === b.top ? (a.left + b.right) / 2 : (a.left + a.right) / 2;
  const w = p.offsetWidth, h = p.offsetHeight, vw = document.documentElement.clientWidth;
  const left = Math.max(8, Math.min(vw - w - 8, cx - w / 2));
  const above = top - h - 8 > ($('#appbar') ? $('#appbar').offsetHeight : 0) + 4;
  p.style.left = Math.round(left + window.scrollX) + 'px';
  p.style.top = Math.round((above ? top - h - 8 : bottom + 8) + window.scrollY) + 'px';
  p.classList.add(above ? 'up' : 'down');
  vib(6);
}
/* a tap on a word of the text; inside a button the tap belongs to the button */
document.addEventListener('click', e => {
  if (e.target.closest && e.target.closest('#wpop')) return;
  const w = VIEW.words && e.target.closest ? e.target.closest('.w') : null;
  if (!w || w.closest('button, a, summary, label')) return closeWord();
  if (w.classList.contains('on')) return closeWord();
  showWord(w);
});
/* a long press (or a right click) on a word inside an answer button */
let LP = { t: 0, x: 0, y: 0, w: null, done: false };
const lpStop = () => { clearTimeout(LP.t); LP.t = 0; };
document.addEventListener('pointerdown', e => {
  lpStop(); LP.done = false;
  const w = VIEW.words && e.target.closest ? e.target.closest('button .w') : null; if (!w) return;
  LP = { x: e.clientX, y: e.clientY, w, done: false, t: setTimeout(() => { LP.done = true; LP.t = 0; showWord(w); }, 480) };
});
document.addEventListener('pointermove', e => { if (LP.t && Math.hypot(e.clientX - LP.x, e.clientY - LP.y) > 10) lpStop(); });
['pointerup', 'pointercancel', 'scroll'].forEach(ev => document.addEventListener(ev, lpStop, true));
/* the click that ends a long press must not choose the answer */
document.addEventListener('click', e => { if (LP.done) { LP.done = false; e.stopPropagation(); e.preventDefault(); } }, true);
document.addEventListener('contextmenu', e => {
  const w = VIEW.words && e.target.closest ? e.target.closest('button .w') : null;
  if (w) { e.preventDefault(); if (!LP.done) showWord(w); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeWord(); });
window.addEventListener('resize', closeWord);

/* ---------- «Мои слова» ---------- */
const VC_STEP = [1, 4, 14];            /* days until the next repetition after «Помню» */
const vcList = () => Object.keys(DB.vc || {}).filter(k => lexByLemma(k)).sort((a, b) => (DB.vc[b].t || 0) - (DB.vc[a].t || 0));
const vcDue = () => vcList().filter(k => { const v = DB.vc[k]; return v.s < 3 && v.due && v.due <= Date.now(); });
function vcAnswer(lemma, ok) {
  const v = DB.vc[lemma]; if (!v) return;
  if (ok) { v.s = Math.min(3, (v.s || 0) + 1); v.due = v.s >= 3 ? 0 : plusDays(Date.now(), VC_STEP[v.s]); }
  else { v.s = 0; v.due = plusDays(Date.now(), VC_STEP[0]); }
  v.t = Date.now(); save(); checkBadges();
}
const vcStage = v => (v.s >= 3 ? '<span class="pill g">выучено</span>' : '<span class="wst">' + [0, 1, 2].map(i => '<i class="' + (i < v.s ? 'on' : '') + '"></i>').join('') + '</span>');
function viewMots() {
  chrome({ title: 'Мои слова', back: '#/me', tab: 3 });
  const list = vcList(), due = vcDue(), learned = list.filter(k => DB.vc[k].s >= 3).length;
  let h = '<section class="card"><p class="muted" style="margin:0">Сюда попадают французские слова, на которые ты нажимаешь в заданиях. Приложение предложит повторить их через 1, 4 и 14 дней — после трёх «Помню» слово считается выученным.</p>' +
    (list.length ? '<div class="pstats" style="margin:14px 0 0"><div><b>' + list.length + '</b><span>' + plural(list.length, 'слово', 'слова', 'слов') + '</span></div><div><b>' + due.length + '</b><span>пора повторить</span></div><div><b>' + learned + '</b><span>выучено</span></div></div>' : '') +
    (due.length ? '<div class="row" style="margin-top:12px"><a class="btn primary" href="#/mots/rev">' + ico('play') + 'Повторить: ' + due.length + '</a></div>' : '') + '</section>';
  if (!list.length) h += '<section class="card"><b>Пока пусто</b><p class="muted">Открой любое задание и нажми на незнакомое слово в условии — рядом появится перевод, а слово окажется здесь.</p><a class="btn" href="#/prog">К заданиям</a></section>';
  else h += '<div class="card dico">' + list.map(k => { const e = lexByLemma(k), v = DB.vc[k]; return '<button type="button" class="dw wrow" data-w="' + esc(k) + '"><b lang="fr">' + esc(k) + '</b><span>' + esc(e.ru) + '</span>' + vcStage(v) + '</button>'; }).join('') + '</div>';
  shell(h);
  $$('[data-w]').forEach(b => b.onclick = () => {
    const k = b.dataset.w, e = lexByLemma(k), v = DB.vc[k];
    const sh = openSheet('<h3 lang="fr">' + esc(k) + '</h3><p>' + esc(e.ru) + '</p><p class="muted">Смотрел(а) перевод: ' + v.n + ' ' + plural(v.n, 'раз', 'раза', 'раз') + (v.s >= 3 ? ' · выучено' : v.due ? ' · повторение ' + (v.due <= Date.now() ? 'сегодня' : dateRu(ymd(new Date(v.due)))) : '') + '</p><div class="row">' +
      (v.s >= 3 ? '<button class="btn primary" data-a="again">Учить заново</button>' : '<button class="btn primary" data-a="know">Знаю это слово</button>') + '<button class="btn danger" data-a="del">Убрать из списка</button></div>');
    $$('[data-a]', sh).forEach(x => x.onclick = () => {
      if (x.dataset.a === 'know') { v.s = 3; v.due = 0; } else if (x.dataset.a === 'again') { v.s = 0; v.due = plusDays(Date.now(), 1); } else delete DB.vc[k];
      save(); closeSheet(); checkBadges(); viewMots();
    });
  });
}
/* repetition: the word → remember the meaning → look → «Помню» or «Не помню» */
let WREV = null;
function viewMotsRev() {
  chrome({ title: 'Повторение слов', back: '#/mots', tab: 3 });
  if (!WREV) WREV = { q: vcDue().slice(0, 20), i: 0, ok: 0, open: false };
  const R = WREV;
  if (R.i >= R.q.length) {
    WREV = null;
    return shell('<section class="nextbox hot"><b class="t">' + ico('check') + (R.q.length ? ' Слова повторены: помню ' + R.ok + ' из ' + R.q.length : ' Сейчас повторять нечего') + '</b><span class="muted">Слова возвращаются через 1, 4 и 14 дней после прошлого раза. Те, что не вспомнились, — уже завтра.</span><div class="row"><a class="btn primary" href="#/">На главную</a><a class="btn" href="#/mots">Мои слова</a></div></section>');
  }
  const k = R.q[R.i], e = lexByLemma(k);
  shell('<section class="card wcard"><span class="meta">слово ' + (R.i + 1) + ' из ' + R.q.length + '</span><div class="wbig" lang="fr">' + esc(k) + '</div>' +
    (R.open ? '<div class="wru">' + esc(e.ru) + '</div><div class="row"><button class="btn primary big" id="wYes">' + ico('check') + 'Помню</button><button class="btn big" id="wNo">Не помню</button></div>'
      : '<p class="muted">Вспомни, что это значит, — и проверь себя.</p><div class="row"><button class="btn primary big" id="wShow">' + ico('eye') + 'Показать перевод</button></div>') + '</section>');
  if ($('#wShow')) $('#wShow').onclick = () => { R.open = true; viewMotsRev(); };
  const ans = ok => { vcAnswer(k, ok); if (ok) R.ok++; R.i++; R.open = false; viewMotsRev(); };
  if ($('#wYes')) $('#wYes').onclick = () => ans(true);
  if ($('#wNo')) $('#wNo').onclick = () => ans(false);
}
ROUTES.push([/^#\/mots$/, () => { WREV = null; viewMots(); }], [/^#\/mots\/rev$/, () => viewMotsRev()]);
