#!/usr/bin/env python3
"""Собирает index.html из исходников в src/.

src/page.html — каркас страницы с метками:
  /*@CSS@*/    — src/vendor/katex.css + src/vendor/fonts.css + src/style.css
  /*@KATEX@*/  — src/vendor/katex.js (отдельным <script>, библиотека формул KaTeX)
  /*@JS@*/     — приложение: src/js/*.js по алфавиту, а между файлами 2x и 3x — весь контент src/content/*.js
                 (так задания объявляются после API и до экранов). Всё в одной общей области.

Метка сборки берётся из прежнего index.html: если содержимое не изменилось,
tools/stamp.py оставит её прежней и приложения у пользователей зря не перезагрузятся.

Запуск: python3 tools/build.py   (потом python3 tools/stamp.py)
        python3 tools/build.py --content=00-base,ge            — только часть заданий (для отладки)
        python3 tools/build.py --out=.work/prev/ge.html …      — собрать в другой файл, index.html не трогать (для tools/preview.js)
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
META = re.compile(r'(<meta name="app-build" content=")([^"]*)(">)')
LIMIT_KB = 3400  # следим за размером: страница целиком скачивается при первом открытии (по сети идёт сжатой, примерно впятеро меньше)


def read(p: Path) -> str:
    return p.read_text(encoding='utf-8').rstrip() + '\n'


def main() -> int:
    page = read(SRC / 'page.html')
    css = read(SRC / 'vendor' / 'katex.css') + read(SRC / 'vendor' / 'fonts.css') + read(SRC / 'style.css')
    katex = read(SRC / 'vendor' / 'katex.js')

    js_files = sorted((SRC / 'js').glob('*.js'))
    content = sorted(p for p in (SRC / 'content').glob('*.js') if not p.name.startswith('_'))
    only = [a.split('=', 1)[1].split(',') for a in sys.argv[1:] if a.startswith('--content=')]
    if only:  # для отладки: собрать только с частью контента, например --content=00-base
        content = [p for p in content if p.name.startswith('00-') or p.name == 'lex.js' or any(w in p.name for w in only[0])]  # главы и словарь — всегда
    early = [p for p in js_files if p.name[:2] < '30']
    late = [p for p in js_files if p.name[:2] >= '30']
    parts = []
    for p in early + content + late:
        parts.append('/* ===== ' + p.relative_to(SRC).as_posix() + ' ===== */\n' + read(p))
    js = '\n'.join(parts)

    for name, text in (('скрипте', js), ('KaTeX', katex)):
        if '</script' in text.lower():
            print(f'В {name} есть «</script» — так страницу собирать нельзя')
            return 2
    for mark in ('/*@CSS@*/', '/*@KATEX@*/', '/*@JS@*/'):
        if page.count(mark) != 1:
            print(f'В src/page.html должна быть ровно одна метка {mark}')
            return 2
    out = page.replace('/*@CSS@*/', css.rstrip()).replace('/*@KATEX@*/', katex.rstrip()).replace('/*@JS@*/', js.rstrip())

    target = ROOT / 'index.html'
    out_arg = [a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--out=')]
    if out_arg:  # предпросмотр: собрать в другой файл, index.html сайта не трогать
        target = Path(out_arg[0]).resolve()
        target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        old = META.search(target.read_text(encoding='utf-8'))
        if old:
            out = META.sub(lambda m: m.group(1) + old.group(2) + m.group(3), out, count=1)
    target.write_text(out, encoding='utf-8')
    kb = len(out.encode('utf-8')) // 1024
    print(f'{target.name}: {kb} КБ (контент: {len(content)} файлов, код: {len(js_files)} файлов)')
    if kb > LIMIT_KB:
        print(f'Больше {LIMIT_KB} КБ — проверьте, что раздуло страницу')
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
