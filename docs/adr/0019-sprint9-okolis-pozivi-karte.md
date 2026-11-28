# ADR 0019: Sprint 9 – vanjski izvori u produkciji, kvalitet zraka, javni pozivi i karte

Status: prihvaćena (F2-16, F2-17, F2-18, F2-21)

## F2-18 Eko-rizik u produkciji
- Vanjski izvori (NASA FIRMS, Meteoalarm, GloFAS, CAMS) više se ne zovu iz zahtjeva posjetioca. `SourceHub` ih osvježava svake minute pod advisory lockom 727021, svaki prema svom intervalu (15 min do 1 h; nakon greške svakih 5 min).
- Zadnji uspješni odgovor čuva se u tabeli `source_cache` (javni podaci, bez tenantId i RLS). Preživljava restart i deploy; više instanci dijeli isti keš.
- Greška ne briše podatke: portal prikazuje zadnje uspješne uz vrijeme i oznaku. „Nedostupno“ se prikazuje tek kad su podaci i zastarjeli (požari i upozorenja 3 h, rijeke i zrak 12 h).
- Kad izvor ne odgovori 3 puta zaredom ili podaci zastare, ide jedan e-mail (`SOURCE_ALERT_TO`, inače aktivni administratori); kad se vrati, ide poruka da ponovo radi.
- CMS: kartica „Izvori podataka“ (stanje, ručno osvježavanje za administratora, upis u dnevnik). `/health` prikazuje stanje izvora.

## F2-17 Kvalitet zraka (`/zastita-okolisa/kvalitet-zraka`)
- Copernicus CAMS (Open-Meteo) za 9 općina, satno: zadnja 3 dana i prognoza za 4 dana. Izmjereni sati čuvaju se trajno u `air_readings` (5 godina), pa CSV ima arhivu duže od izvora.
- Stanice Ministarstva (AMS Mostar – Kampus, AMS Jablanica): dok FHMZ ne omogući automatski pristup (P0-15), satne vrijednosti uvozi referent iz CSV-a (provjera, pa upis). Indeks se računa iz koncentracija. Koordinate stanica su približne (provjeriti s Ministarstvom).
- Pragovi: Pravilnik o načinu vršenja monitoringa kvaliteta zraka (Sl. novine FBiH 1/12, 9/16), prema tabeli iz godišnjeg izvještaja FHMZ za 2024. Upozorenja se računaju za danas i prognozu: PM10 dnevno > 50; NO₂ i SO₂ satna granična vrijednost i prag uzbune (3 sata zaredom); ozon 8 h > 120, satno > 180 (upozorenje) i > 240 (uzbuna); indeks > 80.
- Model je procjena, ne službeno mjerenje, i tako je označen na stranici i u CSV-u.

## F2-16 Javni pozivi (`/javni-pozivi`)
- Tabele `calls` i `call_awards`; predmet dobija `callId`. Faze: nacrt, najavljen, otvoren, zatvoren (u ocjeni), objavljeni rezultati.
- Online prijava koristi postojeće obrasce i e-pisarnicu (ADR 0017). Obrazac vezan za poziv prima prijave samo dok je poziv objavljen i u roku; inače ga server odbija. Obrasci poziva ne pojavljuju se na općoj listi obrazaca.
- Lista korisnika: tabela u CMS-u, CSV ili „na listu“ iz prijave; spremanje je jedna transakcija. Javna je tek kad je urednik objavi. Fizička lica se na portalu i u CSV-u prikazuju kao „Fizičko lice“ (provjeriti sa službenikom za zaštitu podataka).
- Pravo: novi modul `pozivi` (urednik i administrator objavljuju; referent uređuje; pregled čita). Postojeće objave tipa „javni poziv“ ostaju kao obavještenja na istoj stranici.
- Demo: jedan otvoren i jedan završen poziv s izmišljenim korisnicima, oba označena kao primjer.

## F2-21 Karte
- Sve karte (GIS karta, eko-rizik, krizni prikaz, odabir lokacije u CMS-u) koriste MapLibre GL 6. Leaflet i Google Maps su uklonjeni; Google ključ se više ne koristi (odluka naručioca, 28. 11. 2026).
- Podloga: OpenFreeMap vektorske pločice (OpenStreetMap podaci, bez ključa i naplate). Ako stil ne stigne za 8 s ili javi grešku prije prvog prikaza, karta prelazi na rasterske pločice OpenStreetMap-a (tamni prikaz: CARTO). Slojevi se ponovo dodaju na `style.load`, pa prežive promjenu podloge.
- Radnik MapLibre-a poslužuje se s portala (`/vendor/maplibre-gl-worker-<verzija>.mjs`, kopira ga `scripts/maplibre-worker.mjs` prije builda).
- Svaka karta ima prikaz „Tabela“ s istim podacima (pristupačnost, WCAG 1.1.1 i 1.3.1).
- CSP: `connect-src` dozvoljava tiles.openfreemap.org, tile.openstreetmap.org, *.basemaps.cartocdn.com i EFFIS. Google domene su uklonjene.
