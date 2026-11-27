// Every French text a student can see in a generated question or problem — used by the lexicon tests.
// frTexts(item) for a topic question, frTextsProblem(p) for a Partie 2 problem.
const figText = (f) => (typeof f === 'string' ? f.replace(/<style[\s\S]*?<\/style>/g, ' ') : '');
function specTexts(sp, out) {
  if (!sp) return;
  if (sp.k === 'multi') sp.parts.forEach((p) => { if (p.lab && p.lab.fr) out.push(p.lab.fr); specTexts(p.spec, out); });
  if (sp.k === 'mcq') sp.opts.forEach((o) => out.push(o.fr));
  if (sp.k === 'order') sp.items.forEach((o) => out.push(o.fr));
}
function frTexts(it, out = []) {
  if (it.q && it.q.fr) out.push(it.q.fr);
  if (it.fig) out.push(figText(it.fig));
  specTexts(it.ans, out);
  (it.redac || []).forEach((l) => out.push(l));
  return out;
}
function frTextsProblem(p, out = []) {
  if (p.ctx && p.ctx.fr) out.push(p.ctx.fr);
  if (p.fig) out.push(figText(p.fig));
  p.qs.forEach((q) => frTexts(q, out));
  return out;
}
module.exports = { frTexts, frTextsProblem };
