// Loads the app's engine, checker and content into a Node sandbox (no browser needed).
// const A = require('./load')(['nc']) — only content files whose name contains one of the words (all by default).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.resolve(__dirname, '..', 'src');
const CORE = ['00-engine.js', '05-grade.js', '10-helpers.js', '20-api.js', '25-render.js', '27-lex.js', '28-dates.js'];

module.exports = function load(only) {
  const mod = { exports: {} };
  const ctx = vm.createContext({ console, module: mod, exports: mod.exports, Math, Date, JSON });
  vm.runInContext(fs.readFileSync(path.join(SRC, 'vendor', 'katex.js'), 'utf8'), ctx, { filename: 'katex.js' });
  ctx.katex = mod.exports;
  for (const f of CORE) vm.runInContext(fs.readFileSync(path.join(SRC, 'js', f), 'utf8'), ctx, { filename: f });
  const files = fs.readdirSync(path.join(SRC, 'content')).filter((f) => f.endsWith('.js')).sort()
    .filter((f) => !f.startsWith('_'))                                                                  /* _*.js are kept in the repository but are not part of the app */
    .filter((f) => !only || !only.length || f.startsWith('00-') || f === 'lex.js' || only.some((w) => f.includes(w)));   /* chapters and the lexicon always */
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(SRC, 'content', f), 'utf8'), ctx, { filename: 'content/' + f });
  // top-level const/let are not properties of the context: expose what the tests need
  vm.runInContext('this.__A = { IDX: typeof IDX === "undefined" ? [] : IDX, CHAPTERS, TOPICS, PROBLEMS, FICHES, GLOSS, LEXI, AUTOS, mkRng, grade, keyInput, parse, tex, ev, varsOf, katex, L, bi, mi, rt, texOfText, lexTokens, lexFind, lexUnknown, lexSkip, lexBuild };', ctx);
  return Object.assign(ctx.__A, { files, ctx });
};
