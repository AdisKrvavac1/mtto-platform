// Generiše src/tokens/tokens.css i src/tokens/index.ts iz src/tokens/tokens.json.
// CI provjerava da su generisani fajlovi ažurni (npm run tokens && git diff --exit-code).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../src/tokens');
const t = JSON.parse(readFileSync(join(dir, 'tokens.json'), 'utf8'));
const strip = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('$')));
const HEAD = '/* GENERISANO iz tokens.json (npm run tokens -w packages/ui). Ne mijenjati ručno. */\n';

const root = [];
for (const [scale, vals] of Object.entries(strip(t.color))) for (const [k, v] of Object.entries(strip(vals))) root.push(`--mtto-${scale}-${k}: ${v};`);
for (const [k, v] of Object.entries(t.radius)) root.push(`--mtto-radius-${k}: ${v};`);
for (const [k, v] of Object.entries(t.shadow)) root.push(`--mtto-shadow-${k}: ${v};`);
for (const [k, v] of Object.entries(t.font)) root.push(`--mtto-font-${k}: ${v};`);
for (const [k, [size, lh]] of Object.entries(strip(t.text))) root.push(`--mtto-text-${k}: ${size};`, `--mtto-leading-${k}: ${lh};`);
for (const [k, v] of Object.entries(t.layout)) root.push(`--mtto-${k}: ${v};`);
for (const [k, v] of Object.entries(t.motion)) root.push(`--mtto-motion-${k}: ${v};`);

const brand = (theme) => {
  const scale = t.color[t.brand[theme]];
  return [...Object.entries(scale).map(([k, v]) => `--br-${k}: ${v};`), `--br-ring: ${t.brand.ring[theme]};`, `--br-ring2: ${t.brand.ring2[theme]};`];
};
const green = Object.entries(t.color.green).map(([k, v]) => `--gr-${k}: ${v};`);
const block = (sel, lines) => `${sel} {\n${lines.map((l) => `  ${l}`).join('\n')}\n}\n`;

const css = HEAD + block(':root', root) + '\n/* Brand skala: CMS = ljubičasta, javni portal = plava */\n' + block('.cms-theme', brand('cms')) + block('.uui-theme', brand('portal')) + block('.cms-theme, .uui-theme', green);
writeFileSync(join(dir, 'tokens.css'), css);

const ts = `${HEAD}export const tokens = ${JSON.stringify({ color: Object.fromEntries(Object.entries(strip(t.color)).map(([k, v]) => [k, strip(v)])), radius: t.radius, shadow: t.shadow, font: t.font, text: strip(t.text), layout: t.layout, motion: t.motion }, null, 2)} as const;\n\nexport type ColorScale = keyof typeof tokens.color;\n/** CSS varijabla za token, npr. cssVar('gray', 600) → var(--mtto-gray-600) */\nexport const cssVar = (scale: ColorScale, step: string | number) => \`var(--mtto-\${scale}-\${step})\`;\n`;
writeFileSync(join(dir, 'index.ts'), ts);
console.log(`tokeni: ${root.length} varijabli + brand teme`);
