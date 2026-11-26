// Рисует значки приложения из одного SVG: icon-512.png, icon-192.png, apple-touch-icon.png
// и icon-maskable-512.png (рисунок в «безопасной зоне» — Android обрезает такой значок кругом или скруглённым квадратом).
// Запуск: node tools/icons.js   (нужен Playwright). Значки лежат в репозитории; перерисовывать — только если меняется рисунок.
// Рисунок: тёмно-синий фон, кремовая буква «B» с засечками (шрифт Lora из src/vendor/fonts.css) и янтарная точка.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FONT = fs.readFileSync(path.join(ROOT, 'src', 'vendor', 'fonts.css'), 'utf8');
const svg = (scale) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27457A"/><stop offset="1" stop-color="#1A2D4C"/></linearGradient></defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <text x="236" y="352" text-anchor="middle" font-family="Lora B" font-weight="600" font-size="300" fill="#FBFAF7">B</text>
    <circle cx="372" cy="334" r="30" fill="#E3A94B"/>
    <path d="M150 400H362" stroke="#E3A94B" stroke-width="14" stroke-linecap="round" opacity=".9"/>
  </g>
</svg>`;

(async () => {
  const browser = await chromium.launch();
  for (const [name, size, scale] of [['icon-512.png', 512, 1], ['icon-192.png', 192, 1], ['apple-touch-icon.png', 180, 1], ['icon-maskable-512.png', 512, 0.8]]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`<style>${FONT}html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg(scale)}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(ROOT, name), clip: { x: 0, y: 0, width: size, height: size } });
    await page.close();
    console.log('  ✓ ' + name);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
