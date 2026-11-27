# 0004: Kysely za upite i PostGIS za prostorne podatke

**Datum:** 27. 11. 2026. · **Status:** prihvaćena · **Zadatak:** F1-01

## Kontekst
MVP piše SQL kao tekst, bez provjere tipova: greška u nazivu kolone vidi se tek na produkciji. Karta, registri i eko-rizik rade s koordinatama, a udaljenosti i „u blizini“ računaju se u aplikaciji.

## Odluka
- **Kysely** (query builder, MIT licenca) za sve nove upite. Tipovi tabela generišu se iz baze (`npm run db:types -w apps/api`) u `src/db-types.ts`; CI provjerava da su ažurni.
- Postojeći upiti u MVP-u ostaju dok se modul ne prepravlja; ne prepisujemo ih odjednom.
- Kysely, a ne Drizzle: radi direktno nad postojećim `pg` poolom i migracijama iz ADR 0002, ne traži novu shemu u kodu i blizak je SQL-u koji tim već piše.
- **PostGIS** (migracija 0003): tabele s koordinatama dobijaju izračunatu kolonu `geom` (geography, WGS84) i GiST indeks.
- Ako PostGIS na serveru nije dostupan, migracija se preskače i ponovo pokušava pri sljedećem pokretanju; prostorni upiti tada računaju udaljenost formulom (haversine), s razlikom ispod 0,1%.
- Prvi prostorni endpoint: `GET /api/map/nearby?lat&lng&km&layer` (lokacije u radijusu, od najbliže).

## Posljedice
- Nove module (registri, predmeti, inspekcija) pišemo u Kysely-u od početka.
- `geom` kolone se ne upisuju ručno; dovoljno je upisati `lat` i `lng`.
