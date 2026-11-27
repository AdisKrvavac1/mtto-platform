# 0006: Osnova CMS-a — vlastiti CMS ili Payload

**Datum:** 27. 11. 2026. · **Status:** predložena, čeka odluku vlasnika projekta · **Zadatak:** F1-09

## Kontekst
Faza 2 traži urednički tok s odobravanjem, verzije, zakazanu objavu, četiri jezika i prava po sektorima (F2-01, F2-02, F2-22). Pitanje je da li to gradimo sami u postojećem CMS-u ili uvodimo Payload CMS (MIT licenca, TypeScript, Next.js, PostgreSQL).

## Šta je probni sprint provjerio
Payload 3.94.2 instaliran je u odvojenom projektu s PostgreSQL-om, s kolekcijom „Vijesti“ po pravilima ministarstva (konfiguracija i test su u `docs/spike/`). Svih 9 provjera je prošlo:

| Provjera | Rezultat |
| --- | --- |
| Objava bez odobrenja je blokirana | prošlo |
| Urednik ne može sam označiti vijest kao odobrenu | prošlo |
| Objava nakon odobrenja odobravatelja | prošlo |
| Urednik okoliša ne vidi vijesti turizma | prošlo |
| Javnost vidi samo objavljeno | prošlo |
| Prevod na engleski; srpski bez prevoda pada na bosanski | prošlo |
| Verzije se čuvaju (6 za jednu vijest) | prošlo |
| Zaključavanje nakon 5 pogrešnih lozinki | prošlo |

Sve to je oko 70 redova konfiguracije, što je glavna prednost Payloada.

## Nedostaci za MTTO
- **Verzija Next.js-a:** Payload 3.94 radi s Next.js 15.4 ili 16.4+. Portal je na 15.5, pa bi trebalo prijeći na Next.js 16.
- **Dva sistema korisnika:** Payload ima svoje korisnike i nema TOTP. Našu dvofaktorsku prijavu (ADR 0003) trebalo bi povezati kao vlastitu strategiju prijave.
- **Dva sistema migracija:** Payload upravlja svojim tabelama, odvojeno od naših migracija (ADR 0002).
- **Ranjivosti:** `npm audit` prijavljuje 3 visoke (happy-dom preko Lexical editora) i 5 srednjih. Naš projekt danas ima 0.
- **Veličina:** 389 paketa i 714 MB zavisnosti samo za Payload.
- **Izgled:** admin nije u Untitled UI stilu koji je ministar vidio; može se prilagoditi, ali uz dodatni rad. Postoje hrvatski i srpski (latinica) prevod, bosanski ne.

## Prijedlog
Zadržati **vlastiti CMS** i u njemu, u Fazi 2, preuzeti Payloadove provjerene obrasce: tabelu verzija, status nacrt/objavljeno, zakazanu objavu, lokalizaciju po polju i prava po polju. Domenski moduli (registri, predmeti, inspekcija, eko-rizik) ionako ostaju u NestJS-u i Kysely-u.

Razlozi: jedan sistem korisnika s MFA, jedan sistem migracija, nema novih ranjivosti, isti izgled CMS-a, i nema prisilnog prelaska na Next.js 16 usred izrade.

**Rezervna opcija:** ako se Faza 2 pokaže preobimnom, Payload se može uvesti samo za urednički sadržaj (vijesti, stranice, mediji), u zasebnoj PostgreSQL shemi, nakon prelaska na Next.js 16 i uz našu prijavu kao strategiju. Tehnička specifikacija za nabavku ne smije imenovati proizvod, nego funkcije, pa je ova odluka interna.

## Posljedice
- F2-01 i F2-02 (Sprint 6) procjenjujemo na 2 sedmice, s Payloadom kao uzorom.
- Prelazak na Next.js 16 planirati zasebno, kad 15.x izađe iz podrške.
