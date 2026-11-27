# Arhitektonske odluke (ADR)

Svaka važna tehnička odluka zapisuje se kao kratak dokument: kontekst, odluka, posljedice.
Odluka se ne briše; kad se promijeni, piše se nova koja zamjenjuje staru.

| Broj | Odluka | Status |
| --- | --- | --- |
| [0001](0001-modularni-monolit.md) | Modularni monolit: Next.js + NestJS + PostgreSQL | Prihvaćena |
| [0002](0002-verzionisane-migracije.md) | Verzionisane migracije baze | Prihvaćena |
| [0003](0003-dvofaktorska-prijava.md) | Dvofaktorska prijava (TOTP) za CMS | Prihvaćena |
| [0004](0004-kysely-i-postgis.md) | Kysely za upite i PostGIS za prostorne podatke | Prihvaćena |
| [0005](0005-nadzor-i-logovi.md) | Nadzor grešaka i dostupnosti | Prihvaćena |
| [0006](0006-osnova-cms-a.md) | Osnova CMS-a: vlastiti CMS ili Payload | Prihvaćena |
| [0007](0007-sesije-i-sigurnosna-zaglavlja.md) | Sesije u httpOnly kolačiću, CSP, ograničenje zahtjeva | Prihvaćena |
| [0008](0008-skladiste-datoteka-i-rezervne-kopije.md) | S3 skladište datoteka i šifrirane kopije | Prihvaćena |
| [0009](0009-uloge-i-dnevnik-aktivnosti.md) | Uloge po modulu i dnevnik aktivnosti | Prihvaćena |
| [0010](0010-dizajn-sistem-kao-paket.md) | Dizajn sistem kao paket @mtto/ui (tokeni, Storybook, axe) | Prihvaćena |
| [0011](0011-vise-institucija-rls.md) | Više institucija: tenantId i Row-Level Security | Prihvaćena |
| [0012](0012-urednicki-tok-objava.md) | Urednički tok objava, verzije, automatsko povlačenje | Prihvaćena |
