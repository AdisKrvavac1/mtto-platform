# ADR 0017: Elektronski obrasci i predmeti (e-pisarnica v1)

Status: prihvaćena (Sprint 7, F2-05)

## Kontekst
Građani zahtjeve predaju na šalteru ili poštom, a status saznaju telefonom. Potreban je elektronski prijem s brojem predmeta, rokovima i praćenjem, bez naloga za građane.

## Odluka
- `forms`: obrazac s poljima iz registry buildera (ADR 0016), sektorom, rokom za rješavanje (dana), pravilom za priloge (bez, neobavezni, obavezni) i pravnim osnovom. Obrasce uređuje `predmeti:publish` (administrator); polja se slažu istim editorom kao registri.
- Podnošenje na portalu (`/e-usluge/obrasci/[slug]`): bez prijave, ALTCHA, honeypot, ograničenje 5/min, saglasnost za obradu podataka, e-mail ili telefon. Prilozi samo PDF/JPG/PNG/WEBP po potpisu datoteke, do 5 × 5 MB, u skladište kao ostale datoteke.
- Broj predmeta `MTTO-GGGG-NNNNN` iz brojača po instituciji i godini (`case_counters`, upis u istoj transakciji, bez praznina i sudara). Rok = prijem + rok obrasca.
- Kod za praćenje (8 znakova bez 0/O/1/I) vidi se samo na potvrdi; u bazi je samo sha256. Pogrešan broj i pogrešan kod daju isti odgovor.
- Statusi: Zaprimljen → U obradi → Čeka dopunu ↔ U obradi → Riješen / Odbijen; zatvoren predmet se ponovo otvara uz razlog. Dopuna, rješenje i odbijanje traže poruku podnosiocu. Dok se čeka dopuna, rok miruje (rok se produžava za vrijeme čekanja).
- `case_events`: historija; javni koraci (prijem, statusi s porukom, dopuna podnosioca) vide se na `/e-usluge/status`, interne bilješke i dodjele ne. Podnosilac dostavlja dopunu na istoj stranici dok je predmet u statusu „Čeka dopunu“.
- E-pisarnica u CMS-u: novi, u obradi, moji, rok istekao; spis s podacima, prilozima, historijom, dodjelom referentu i promjenom statusa. Novi modul prava `predmeti`: referent RW, urednik i pregled R, administrator sve. Predmet sektora obrađuju referenti tog sektora (ADR 0015). Otvaranje priloga i svaka promjena idu u dnevnik.

## Posljedice
- E-mail obavještenja podnosiocu nisu dio v1 (platforma još nema slanje pošte); status se prati na portalu, a službenik kontaktira podnosioca. Dodati uz SMTP servis Ministarstva.
- Rokovi su kalendarski dani; neradni dani i praznici nisu uračunati.
- Povezivanje s knjigom protokola Ministarstva i izdavanje rješenja iz predmeta (npr. upis u registar smještaja) su sljedeći koraci; dva obrasca su probna i usklađuju se s Ministarstvom.
