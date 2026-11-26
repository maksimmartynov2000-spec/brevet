/* ===================== LEXICON: every French word of the statements → Russian =====================
   Behind «нажми на слово — увидишь перевод» and «Мои слова».
     lex('forme1|forme2|…', 'перевод')  — the first form is the dictionary form (infinitive, singular); the others are the forms
                                          that occur in the texts. An expression of several words wins over its words.
     lexf(…)                            — function words, numerals, units: translated on tap, never saved to «Мои слова».
     lexn('Paris|Lyon')                 — proper nouns.
   `node tests/words.js` lists the words of the generated texts that have no entry yet. Keep the file sorted by blocks. */

/* ---------- articles, prepositions, pronouns, conjunctions ---------- */
lexf("le|la|les|l'", 'артикль (определённый): этот, тот самый');
lexf('un|une', 'артикль (неопределённый): один, какой-то; также «один, одна»');
lexf("de|d'|du|des", 'предлог: из, от, о; принадлежность («чей?»); du = de + le, des = de + les');
