# 0005: Nadzor grešaka i dostupnosti

**Datum:** 27. 11. 2026. · **Status:** prihvaćena · **Zadatak:** F1-06

## Kontekst
BiH nema operativni državni CERT, pa platforma mora sama primijetiti greške i napade. Do sada su greške bile samo u nestrukturiranim logovima.

## Odluka
- `GET /api/health`: stanje baze, primijenjene migracije, verzija i vrijeme rada. Koristi ga Render health check (`healthCheckPath`) i vanjski uptime monitor.
- Svaki zahtjev dobija `X-Request-Id`; isti ID je u odgovoru o grešci i u logu, pa se prijava korisnika lako poveže s logom.
- Greške 5xx i odbijeni zahtjevi (403, 429) logiraju se kao JSON redovi, bez tijela zahtjeva, kolačića, tokena i IP adresa.
- **Sentry** je opcion: uključuje se postavljanjem `SENTRY_DSN`. Preporuka je EU region (de.sentry.io) zbog Zakona o zaštiti ličnih podataka BiH; prije slanja se uklanjaju podaci o korisniku i zaglavlja s tokenima.
- Uptime monitor (npr. Better Stack ili UptimeRobot, region EU) provjerava `/api/health` svake minute i šalje upozorenje e-mailom.

## Posljedice
- Za Sentry i uptime monitor treba otvoriti naloge; to radi vlasnik projekta, a ključeve upisuje u Render, ne u kod.
- Logovi se na Renderu čuvaju ograničeno; za čuvanje 12 mjeseci (preporuka za ASVS L2) treba log drain (Faza 4).
