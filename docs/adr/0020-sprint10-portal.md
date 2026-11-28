# ADR 0020: Sprint 10 – pretraga, životne situacije, transparentnost i jezici

Status: prihvaćena (F2-06, F2-07, F2-08, F2-10). F2-09 (analitika) odgođena do tehničkog prijema, bez dodatnih troškova u razvoju; poslije ide Umami kao zaseban servis na Renderu (Frankfurt).

## F2-07 Pretraga (`/pretraga`)
- Indeks `search_docs` po instituciji (RLS) gradi `SearchIndexer` iz javnog sadržaja: stranice, životne situacije, vijesti, dokumenti, registri i njihovi zapisi, okolišne dozvole, javni pozivi i obrasci. Svake minute se uporedi „potpis“ izvora (broj i zadnja izmjena javnih zapisa); kad se promijeni, indeks se gradi ponovo u jednoj transakciji. Kontroleri ne moraju znati za pretragu.
- `mtto_fold()` (unaccent, mala slova, „dj“→d) izjednačava pisanje sa i bez dijakritika. Ćirilica se preslovljava prije upita. Riječi se traže kao prefiks uz lagano skraćivanje padežnih nastavaka.
- Rang: naslov > opis > tekst (tsvector A/B/C), prednost tačnom naslovu, životnim situacijama i uslugama, blago novijem; demo zapisi niže.
- Bez pogotka: slični naslovi (pg_trgm `word_similarity`) i prijedlog „Da li ste mislili“.
- Fasete: vrsta, sektor, godina; broj uz vrijednost računa se uz ostale filtere.
- Polje u zaglavlju daje prijedloge dok se kuca (ARIA combobox).
- `search_queries` broji upite po danu, bez IP-a i korisnika. Na kontrolnoj tabli CMS-a se vidi šta se traži i šta se ne nalazi.

## F2-08 Životne situacije (`/zivotne-situacije`)
- Tabela `life_events`: koraci s linkovima, povezani linkovi, nadležni, riječi za pretragu, publika (građani / privreda).
- Linkovi samo relativni ili `https://`.
- 10 početnih situacija napravljeno je iz postojećeg sadržaja portala. Sve su označene „u pripremi“ dok urednik ne potvrdi sadržaj; potvrdu radi urednik ili administrator.
- Situacije su u pretrazi i u brzim uslugama na naslovnoj.

## F2-10 Transparentnost (`/transparentnost`)
- Zahtjev za pristup informacijama je obrazac u e-pisarnici s rokom od 15 dana (ZOSPI FBiH, Sl. novine FBiH 32/01, 48/11, čl. 11 i 14).
- Statistika zahtjeva po godinama (primljeno, riješeno, u roku, odbijeno) računa se iz predmeta.
- Budžet, javne nabavke i indeks-registar informacija (čl. 20) su registri u registry builderu, s CSV-om i API-jem.
- Iznosi budžeta i nabavke su demo dok ih Ministarstvo ne upiše. Indeks-registar je nacrt koji potvrđuje službenik za informisanje.
- Izvještaji o radu su dokumenti vrste „Izvještaj“.

## F2-06 Jezici
- Jezici: bs (izvornik), hr, en. Srpski i ćirilica su uklonjeni odlukom naručioca 28. 11. 2026. Stare adrese `/sr/…` i `/sr-cyrl/…` trajno se preusmjeravaju na stranicu bez prefiksa.
- Adrese s prefiksom (`/en/…`, `/hr/…`, `/bs/…`) obrađuje middleware: skida prefiks, prenosi jezik u zaglavlju i pamti ga u kolačiću, pa obični linkovi ostaju na izabranom jeziku. `<html lang>` prati jezik.
- Prekidač jezika i aktivna stavka menija rade s putanjom bez prefiksa. Ranija greška: na `/en/vijesti` prekidač je vodio na `/hr/en/vijesti`, što je davalo 404.
- Sučelje (zaglavlje, meni, podnožje) ima rječnik. Za hr su navedene samo riječi koje se razlikuju.
- Sadržaj se piše jednom, na bosanskom. Objave imaju prijevod na engleski (`translations.en`) koji se uređuje u CMS-u prekidačem jezika. Bez prijevoda engleska stranica prikazuje izvornik uz napomenu. Tabela `life_events` ima istu kolonu za kasnije.
- Nije urađeno u ovom sprintu: prijevod teksta pojedinih stranica (osim zaglavlja i podnožja) i `hreflang` oznake po stranici.
