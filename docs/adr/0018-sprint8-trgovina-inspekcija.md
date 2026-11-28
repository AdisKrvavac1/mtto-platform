# ADR 0018: Sprint 8 – trgovina, inspekcija i turističke informacije

Status: prihvaćena (F2-11, F2-12, F2-14, F2-15, F2-19, F2-20)

## Odluka
Sprint ne uvodi nove module: sve je izgrađeno na registry builderu (ADR 0016) i e-pisarnici (ADR 0017), da Ministarstvo sadržaj vodi u CMS-u bez programiranja.

- **F2-12 / F2-19 Prijava inspekciji** (`/e-usluge/prijava-inspekciji`): obrazac s novim postavkama.
  - *Anonimna prijava*: ime i kontakt se ne čuvaju ni kad su poslani; praćenje samo brojem i kodom.
  - *Zaštita identiteta*: ime i kontakt se ne šalju u CMS (lista, detalj, pretraga, e-mail referentu). Referent ih otkriva uz razlog (min. 10 znakova); razlog ide u historiju predmeta i dnevnik.
  - *Usmjeravanje*: pravila „polje = vrijednost → sektor + oznaka nadležnosti“; prvo pravilo koje odgovara, `*` za ostale.
  - Novi status *Proslijeđen nadležnom organu* (zatvara predmet, traži poruku podnosiocu, može se ponovo otvoriti).
  - Novi sektor „Inspekcija“.
- **F2-11 Neradna nedjelja i praznici** (`/trgovina/neradni-dani`): nedjelje se računaju (zakon), praznici i posebni dani su registar `neradni-dani`, izuzeci registar `izuzeci-neradne-nedjelje`. Kalendar za 12 mjeseci, `.ics` pretplata (nedjelja kao ponavljajući događaj), rezultati kontrola iz izvještaja nadzora, pitanja.
- **F2-14 Upisnik turističkih zajednica**: registar `turisticke-zajednice`; upisane samo zajednice potvrđene javnim izvorom (TZ HNK, TZ Općine Čitluk, TZ Grada Konjica u osnivanju), s internim poljem izvora.
- **F2-15 Boravišna taksa** (`/turizam-i-bastina/boravisna-taksa`): informacije i upućivanje na prijava.ba i turističke zajednice. MTTO ne gradi prijavu gostiju. Iznosi takse nisu navedeni dok ih Ministarstvo ne potvrdi.
- **F2-20 Plan i izvještaj nadzora** (`/inspekcija`): registri `plan-nadzora` (demo za 2027.) i `izvjestaj-nadzora`; plan i izvršenje po područjima, CSV i JSON.

## Podaci i provjera
- Praznici su upisani kao „provjeriti s Ministarstvom“ dok ih Ministarstvo ne potvrdi u CMS-u.
- Izvještaj sadrži samo objavljene rezultate prvih kontrola neradne nedjelje (novembar 2024: 28 subjekata, 52 prekršajna naloga, 62.000 KM), s izvorom; broj izvršenih nadzora nije objavljen pa nije upisan.
- Nadležnost (kantonalna/gradska inspekcija) i popis izuzetaka potvrđuje Ministarstvo (P0-12).
