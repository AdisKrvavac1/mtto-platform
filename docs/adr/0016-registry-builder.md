# ADR 0016: Registry builder i registar smještaja

Status: prihvaćena (Sprint 7, F2-04 i F2-13)

## Kontekst
Ministarstvo vodi više javnih evidencija (smještaj, turistički vodiči, agencije, operateri otpada...). Za svaku zasebna tabela, stranica i izvoz znače novi razvoj po registru.

## Odluka
- Jedan alat: `registries` (definicija: polja kao JSON shema, sektor, javnost, lokacija, pravni osnov) i `registry_entries` (vrijednosti u `jsonb`, koordinate, status AKTIVAN/ARHIVIRAN). Obje tabele imaju `tenantId` i RLS kao ostali sadržaj.
- Vrste polja: kratki i duži tekst, broj, cijeli broj, datum, izbor s liste, da/ne, web adresa, e-mail. Za svako polje: obavezno, javno, u tabeli, pretraga, filter (izbor, da/ne), jedinstveno (npr. broj rješenja). Ključ polja se ne mijenja nakon spremanja; uklonjeno polje ostaje u podacima i internom izvozu.
- Server provjerava svaki zapis prema shemi (`registry-core.ts`), uključujući jedinstvenost i koordinate. Greške se vraćaju po polju.
- Prava: shemu i objavu mijenja `registri:publish` (administrator), zapise `registri:write` (referent), brisanje `registri:delete`. Registar vezan za sektor mijenjaju samo korisnici tog sektora (ADR 0015). Sve ide u dnevnik.
- CSV uvoz u dva koraka: provjera (izvještaj po redu i polju, bez upisa), pa upis u jednoj transakciji. Načini: samo novi ili „dodaj i ažuriraj“ po jedinstvenom polju ili koloni `id`. Prepoznaje `;` / `,` / tab, BOM, datume `DD.MM.GGGG.`, brojeve `1.234,5`. Izvoz za Excel (BOM, `;`) neutralizira formule (`=`, `+`, `-`, `@`).
- Javni API bez prijave (CORS `*`, 120 zahtjeva/min): `GET /registries`, `/registries/:slug`, `/registries/:slug/entries?q&f.polje&page&limit`, `/registries/:slug/entries/:id`, `/registries/:slug/export.csv`. Vraća samo javna polja i aktivne zapise objavljenog registra.
- Portal: `/registri` (popis), `/registri/[slug]` (pretraga, filteri iz stvarnih vrijednosti, tabela, karta, CSV, otvoreni podaci), `/registri/[slug]/[id]` (dosje).
- F2-13: registar kategoriziranih smještajnih objekata je prvi registar napravljen alatom (migracija 0010 prenosi redove iz `facilities`). Postojeća stranica `/registri/ugostiteljski-objekti`, karta i statistika čitaju registar; dodani su rok važenja i status kategorije te dosje objekta. Tabela `facilities` ostaje samo kao arhiva.

## Posljedice
- Novi registar je postavka u CMS-u, bez programiranja. Okolišne dozvole ostaju namjenski registar (dokumenti, rokovi obnove).
- Pretraga je `LIKE` nad poljima označenim za pretragu; za desetine hiljada zapisa dodati trigram indeks.
- Polja, klase i pravni osnov registra smještaja provjeriti s Ministarstvom; stvarni podaci se uvoze iz Excela Sektora za turizam.
