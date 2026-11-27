# @mtto/ui – dizajn sistem MTTO platforme

Tokeni i komponente koje dijele javni portal i CMS (i buduće aplikacije: Mostar, e-Građanin).

| Ulaz | Sadržaj |
|---|---|
| `@mtto/ui/tokens.json` → `src/tokens/tokens.json` | **jedini izvor** boja, radijusa, sjena, fontova, tipografije, razmaka |
| `@mtto/ui/tokens.css` | CSS varijable `--mtto-*` i brand skale `--br-*` (`.cms-theme` ljubičasta, `.uui-theme` plava) |
| `@mtto/ui/tokens` | isti tokeni u TypeScriptu (`tokens`, `cssVar()`) |
| `@mtto/ui/styles.css` | mikro animacije (`uui-ripple`, `uui-lift`), poštuju `prefers-reduced-motion` |
| `@mtto/ui/portal` | komponente javnog portala (Button, Badge, PageHeader, TableCard, NewsCard…) |
| `@mtto/ui/cms` | komponente CMS-a (PageTitle, Card, MetricCard, Tabs, Field, StatusChip, Toast…) |

## Rad
```
npm run tokens -w packages/ui           # nakon izmjene tokens.json (generiše tokens.css i src/tokens/index.ts)
npm run storybook -w packages/ui        # http://localhost:6006
npm test -w packages/ui                 # axe (WCAG 2.1 AA) nad svakom pričom u jsdom-u
npm run build-storybook -w packages/ui && npm run test:browser -w packages/ui   # axe u Chromiumu, uključuje kontrast
```

## Pravila
- Nova komponenta = nova priča u `src/*.stories.tsx`. CI pokreće axe nad svakom pričom; prekršaj ruši build.
- Boje i radijuse uzimati iz tokena, ne izmišljati nove vrijednosti. Novi token ide u `tokens.json`.
- Aplikacija koristi paket kroz `transpilePackages` (Next.js), bez posebnog builda paketa.
