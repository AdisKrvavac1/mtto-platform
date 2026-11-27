# ADR 0010: Dizajn sistem kao paket @mtto/ui

Status: prihvaćena (Sprint 5, F1-08)

## Odluka
- Komponente portala i CMS-a prelaze u workspace paket `packages/ui` (`@mtto/ui`). Aplikacija ga koristi kroz `transpilePackages`, bez zasebnog builda; stari importi (`@/components/uui`, `@/components/admin/ui`) ostaju kao tanki re-exporti dok se ne zamijene.
- `src/tokens/tokens.json` je jedini izvor tokena (boje, brand skale po temi, radijusi, sjene, fontovi, tipografska skala, razmaci, animacije). Skripta generiše `tokens.css` (`--mtto-*`, `--br-*`, `--gr-*`) i TypeScript; CI ruši build ako generisani fajlovi nisu ažurni.
- Storybook 10 (React + Vite) s pričama za tokene, portal i CMS; tema (CMS ljubičasta / portal plava) bira se po priči ili iz trake.
- Pristupačnost u CI-ju, dva sloja:
  1. Vitest + jsdom + axe-core nad svakom pričom (struktura, nazivi, ARIA), plus kontrolni test da axe zaista hvata greške.
  2. axe u Chromiumu nad izgrađenim Storybookom, uključuje kontrast boja.
  Prvi prolaz je našao i ispravio dvije greške kontrasta (oznaka trenda i inicijali u avataru).
- Izgrađeni Storybook je CI artefakt (14 dana) za pregled bez lokalne instalacije.

## Posljedice
- Nova komponenta mora imati priču, a time i axe provjeru.
- Za proširenje na druge institucije (Mostar, e-Građanin) mijenja se tema (brand skala i grb), ne komponente.
- Preostalo: postepeno zamijeniti stare `stitch`/`figma` komponente portala komponentama iz paketa i ukloniti stari `tokens.css` sa `--c-*` varijablama.
