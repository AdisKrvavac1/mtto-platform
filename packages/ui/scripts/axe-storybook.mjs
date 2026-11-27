// F1-08: axe u pravom pregledniku nad svakom pričom iz izgrađenog Storybooka (uključuje kontrast boja,
// koji jsdom test ne može provjeriti). Pokretanje: npm run build-storybook && npm run test:browser
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '../storybook-static');
const axeSrc = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

const server = createServer((req, res) => {
  const p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const f = existsSync(p) && !p.endsWith('/') ? p : join(p, 'index.html');
  if (!f.startsWith(root) || !existsSync(f)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[extname(f)] ?? 'application/octet-stream' }).end(readFileSync(f));
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const ids = Object.values(JSON.parse(readFileSync(join(root, 'index.json'), 'utf8')).entries).filter((e) => e.type === 'story').map((e) => e.id);
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
let failed = 0;
for (const id of ids) {
  await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`);
  await page.waitForSelector('#storybook-root > *', { timeout: 15000 });
  await page.waitForTimeout(400);
  await page.addScriptTag({ content: axeSrc });
  const v = await page.evaluate(() => window.axe.run(document.querySelector('#storybook-root'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
    .then((r) => r.violations.map((x) => `${x.id}: ${x.nodes.slice(0, 3).map((n) => `${n.target.join(' ')} – ${n.any[0]?.message ?? n.failureSummary}`).join('; ')}`)));
  if (v.length) { failed++; console.log(`✗ ${id}\n  ${v.join('\n  ')}`); } else console.log(`✓ ${id}`);
}
await browser.close();
server.close();
console.log(`\n${ids.length - failed}/${ids.length} priča bez axe prekršaja (WCAG 2.1 AA, uključujući kontrast).`);
process.exit(failed ? 1 : 0);
