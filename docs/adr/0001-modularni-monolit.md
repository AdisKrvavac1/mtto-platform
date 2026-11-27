# 0001: Modularni monolit (Next.js + NestJS + PostgreSQL)

**Datum:** 27. 11. 2026. · **Status:** prihvaćena

## Kontekst
MVP prikazan ministru 24. 11. 2026. radi na Next.js 15 (portal i CMS), NestJS 11 (API) i PostgreSQL-u. Platformu održava mali tim, a kasnije je treba moći preuzeti drugo ministarstvo ili Grad Mostar.

## Odluka
- Zadržavamo isti stack i gradimo **modularni monolit**: jedan API s jasno odvojenim modulima (sadržaj, dokumenti, registri, obrasci i predmeti, eko-rizik, karta, korisnici, audit).
- Moduli ne dijele tabele; komuniciraju preko servisa unutar API-ja.
- Mikroservis izdvajamo tek kad modul ima drugačiji ritam skaliranja (npr. prijem podataka sa senzora).
- Od Faze 1 svaka tabela dobija `tenant_id` (institucija), uz Row-Level Security (zadatak F1-11).

## Posljedice
- Jedan deploy, jedna baza, jednostavno održavanje i nadzor.
- Granice modula moramo čuvati disciplinom (pregled koda), jer ih okvir ne nameće.
