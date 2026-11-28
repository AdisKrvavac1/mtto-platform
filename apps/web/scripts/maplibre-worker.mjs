// F2-21: MapLibre 6 radnik (web worker) poslužuje se s istog domena (/vendor), jer ga Next bundler ne prepakuje.
// Pokreće se prije dev/build; ime sadrži verziju da keš preglednika ne zadrži stari radnik.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, unlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
const req = createRequire(import.meta.url);
const pkg = req.resolve('maplibre-gl/package.json');
const { version } = JSON.parse(readFileSync(pkg, 'utf8'));
const out = join(dirname(new URL(import.meta.url).pathname), '..', 'public', 'vendor');
mkdirSync(out, { recursive: true });
for (const f of readdirSync(out)) if (f.startsWith('maplibre-gl-worker')) unlinkSync(join(out, f));
copyFileSync(join(dirname(pkg), 'dist', 'maplibre-gl-worker.mjs'), join(out, `maplibre-gl-worker-${version}.mjs`));
console.log(`maplibre-gl-worker-${version}.mjs → public/vendor`);
