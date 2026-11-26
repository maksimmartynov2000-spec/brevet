/* ===================== MATH IN TEXT: $…$ and $$…$$ → KaTeX ===================== */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
/* KaTeX is the slowest part of drawing a screen: the same formula is rendered once and remembered */
const KCACHE = new Map();
function K(tx, display) {
  const key = (display ? 'D' : 'I') + tx; const hit = KCACHE.get(key); if (hit != null) return hit;
  let h; try { h = katex.renderToString(tx, { throwOnError: false, displayMode: !!display, strict: false }); } catch (e) { h = '<code>' + esc(tx) + '</code>'; }
  if (KCACHE.size > 4000) KCACHE.clear();
  KCACHE.set(key, h); return h;
}
const REL = { '≠': '\\ne ', '≤': '\\le ', '≥': '\\ge ', '<': '<', '>': '>', '→': '\\;\\to\\;', '=': '=', '⇔': '\\;\\Leftrightarrow\\;', '≈': '\\approx ', ';': ';\\;' };
/* formula in input syntax (may contain = < ≤ … and ; between several formulas) → TeX */
function mi(s, strict) {
  return String(s).split(/(≠|≤|≥|<|>|→|⇔|≈|=|;)/).map(p => {
    if (REL[p] != null) return REL[p];
    if (!p.trim()) return '';
    try { return tex(parse(p)); } catch (e) { if (strict) throw new Error('formula «' + p + '»: ' + (e.ru || e.message)); return '\\text{' + p.replace(/[{}\\$]/g, '') + '}'; }
  }).join('');
}
const unEsc = x => x.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
/* text with formulas: $$…$$ is TeX, $…$ is input syntax */
function rt(s) {
  return esc(s).replace(/\$\$([^$]+)\$\$|\$([^$]+)\$/g, (m, t, x) => t != null ? K(unEsc(t)) : K(mi(unEsc(x)).replace(/\\dfrac/g, '\\frac')));
}
/* every formula of a text, as TeX — used by the automatic tests */
function texOfText(s) {
  const out = []; String(s).replace(/\$\$([^$]+)\$\$|\$([^$]+)\$/g, (m, t, x) => { out.push(t != null ? t : mi(x, true)); return m; }); return out;
}
