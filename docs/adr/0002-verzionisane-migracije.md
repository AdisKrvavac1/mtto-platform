# 0002: Verzionisane migracije baze

**Datum:** 27. 11. 2026. · **Status:** prihvaćena · **Zadatak:** P0-17

## Kontekst
U MVP-u se shema pravila pri svakom pokretanju (`CREATE TABLE IF NOT EXISTS`). Promjene sheme nisu bile zapisane ni ponovljive, a produkcijska baza već ima podatke.

## Odluka
- Migracije su TypeScript moduli u `apps/api/src/migrations/`, numerisani redom (`0001_baseline`, `0002_mfa`…).
- Pri pokretanju API izvršava samo one koje nisu u tabeli `schema_migrations`, svaku u svojoj transakciji.
- `pg_advisory_lock` sprječava da dvije instance migriraju istovremeno.
- `0001_baseline` je shema MVP-a i idempotentna je, pa je sigurna na postojećoj produkcijskoj bazi.
- **Pravilo:** postojeća migracija se nikad ne mijenja. Svaka promjena je nova datoteka.
- CI provjerava migracije na praznoj bazi i da drugo pokretanje ništa ne mijenja.

## Posljedice
- Svaka promjena baze je u historiji koda i ponovljiva na stagingu i produkciji.
- Kad uvedemo ORM (F1-01, Drizzle ili Kysely), postojeće migracije ostaju, a nove pišemo njegovim alatom.
