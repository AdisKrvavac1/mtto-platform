# ADR 0009: Uloge po modulu i dnevnik aktivnosti koji se ne može mijenjati

Status: prihvaćena (Sprint 5, F1-04)

## Odluka
- **Četiri uloge**: Administrator, Urednik, Referent registra, Samo pregled. Prava su matrica *modul × radnja* (čitanje, izmjena, brisanje, objava) u `apps/api/src/rbac.ts`.
- Svaka admin ruta nosi `@Can(modul, radnja)`. Ruta bez oznake je zabranjena, a test `rbac.test.ts` ruši CI ako se doda ruta bez prava.
- Uloga se čita iz baze uz svaki zahtjev (ne iz tokena). Promjena uloge ili deaktivacija povećava `sessionVersion` i odmah poništava sve sesije korisnika.
- **Novi korisnik** dobija jednokratan link za aktivaciju (72 h, token u `#` dijelu adrese, u bazi samo sha256). Korisnik sam postavlja lozinku (najmanje 12 znakova), zatim mora uključiti MFA. Administrator ne zna i ne vidi lozinke.
- **Dnevnik aktivnosti**: ko, kada, šta, nad kojim zapisom, izmjene po poljima (prije/poslije, bez tajni i binarnog sadržaja), mreža (/24) i ID zahtjeva.
  - Baza odbija UPDATE i DELETE nad dnevnikom (okidač).
  - Svaki zapis nosi sha256 prethodnog (lanac); `GET /admin/audit/verify` otkriva naknadnu izmjenu i pokazuje tačan zapis.
  - Filtri, stranice i izvoz u CSV (zaštićen od Excel formula).
- Prava po sektoru (ABAC, npr. urednik samo za turizam) čekaju organizacionu šemu Ministarstva (provjeriti s Ministarstvom).

## Razlozi
Zakonska odgovornost za objavljeni sadržaj i odluke u registrima traži dokaz ko je šta promijenio. Lanac hash vrijednosti daje dokaz bez vanjskog servisa; uz dnevne šifrirane kopije (ADR 0008) zapis se ne može tiho izbrisati.
