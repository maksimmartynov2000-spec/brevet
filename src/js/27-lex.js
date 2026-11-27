/* ===================== WORD LEXICON: French word → Russian =====================
   Shared by the app («нажми на слово — увидишь перевод») and by the tests (every word of every statement must be known).
   Entries are declared in src/content/lex.js with lex / lexf / lexn (see 20-api.js). */
const LEX_RE = /[A-Za-zÀ-ÖØ-öø-ÿŒœÆæ]+(?:[-'’][A-Za-zÀ-ÖØ-öø-ÿŒœÆæ]+)*['’]?/g;
const LEX_ELIDED = new Set(['l', 'd', 'j', 'n', 's', 'm', 't', 'c', 'qu', 'jusqu', 'lorsqu', 'puisqu']);
const LEX_KEEP1 = new Set(['a', 'à', 'y', 'ô']);          /* one-letter French words; other single letters are points and variables */

/* text → [{ w: the word as written, i: start, j: end }] ; l'aire → l' + aire, qu'il → qu' + il, aujourd'hui stays whole */
function lexTokens(text) {
  const out = []; let m; LEX_RE.lastIndex = 0;
  const s = String(text);
  while ((m = LEX_RE.exec(s))) {
    let w = m[0], at = m.index;
    for (;;) {
      const a = w.search(/['’]/);
      if (a > 0 && LEX_ELIDED.has(w.slice(0, a).toLowerCase())) { out.push({ w: w.slice(0, a) + "'", i: at, j: at + a + 1 }); w = w.slice(a + 1); at += a + 1; if (!w) break; continue; }
      out.push({ w: w.replace(/’/g, "'").replace(/'$/, ''), i: at, j: at + w.length }); break;
    }
  }
  return out;
}
const lexKey = w => w.replace(/’/g, "'");

let LEXMAP = null, LEXMAX = 1;
function lexBuild() {
  LEXMAP = new Map(); LEXMAX = 1;
  LEXI.forEach((e, idx) => String(e.f).split('|').forEach(form => {
    const toks = lexTokens(form).map(t => t.w); if (!toks.length) return;
    const key = toks.length === 1 ? toks[0] : toks.join(' ').toLowerCase();
    if (!LEXMAP.has(key)) LEXMAP.set(key, idx);
    if (toks.length > LEXMAX) LEXMAX = Math.min(6, toks.length);
  }));
  PRENOMS_F.concat(PRENOMS_M).forEach(n => { if (!LEXMAP.has(n)) LEXMAP.set(n, -1); });
}
function lexWord(w) {
  if (!LEXMAP) lexBuild();
  let idx = LEXMAP.get(w); if (idx == null) idx = LEXMAP.get(w.toLowerCase());
  return idx;
}
/* must this token have an entry? points (A, AB, EDF), variables (x, n) and bare letters need none */
function lexSkip(w) {
  if (w.replace(/'$/, '').length === 1) return !LEX_KEEP1.has(w.toLowerCase()) && !/'$/.test(w);
  return /^[A-ZÀ-ÖØ-Þ]{2,4}$/.test(w);
}
/* the entry for the token number i of toks: the longest known expression around it, else the word itself.
   → { idx, from, to } (token range) or null when the word is unknown */
function lexFind(toks, i) {
  if (!LEXMAP) lexBuild();
  for (let n = Math.min(LEXMAX, toks.length); n >= 2; n--) {
    for (let a = Math.max(0, i - n + 1); a <= i && a + n <= toks.length; a++) {
      const idx = LEXMAP.get(toks.slice(a, a + n).map(t => t.w).join(' ').toLowerCase());
      if (idx != null) return { idx, from: a, to: a + n };
    }
  }
  const w = toks[i].w; let idx = lexWord(w);
  if (idx != null) return { idx, from: i, to: i + 1 };
  if (w.includes('-')) {          /* peut-on, a-t-il, demi-droite: the parts, when the whole is not listed */
    const parts = w.split('-').filter(p => p.length > 1 || LEX_KEEP1.has(p.toLowerCase()));
    const known = parts.map(lexWord);
    if (parts.length && known.every(k => k != null)) return { idx: known[0], from: i, to: i + 1, parts: known };
  }
  return null;
}
const lexEntry = idx => (idx >= 0 ? LEXI[idx] : null);
const lexLemma = e => String(e.f).split('|')[0];
/* every word of a text that has no entry — for the tests */
function lexUnknown(text) {
  const plain = String(text).replace(/\$\$[^$]*\$\$|\$[^$]*\$/g, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&[a-z]+;/g, ' ');
  const toks = lexTokens(plain); const out = [];
  toks.forEach((t, i) => { if (!lexSkip(t.w) && !lexFind(toks, i)) out.push(t.w); });
  return out;
}
