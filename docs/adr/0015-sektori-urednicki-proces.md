# ADR 0015: Urednički proces po sektorima

Status: prihvaćena (Sprint 6, F2-22)

## Kontekst
Organizaciona šema Ministarstva još nije dostavljena, a urednici trebaju raditi samo u svojim sektorima.

## Odluka
- Tabela `sectors` (po instituciji, s RLS-om): ključ (= resor objave, `posts.category`) i naziv (= `documents.sector`). Početni sektori su postojeći resori: Turizam i ugostiteljstvo, Zaštita okoliša, Trgovina, Opće. Administrator ih dodaje, preimenuje i deaktivira u CMS-u (Korisnici i dnevnik → Sektori), bez novog razvoja.
- `users.sectors`: sektori korisnika. **Prazno = svi sektori** (dosadašnje ponašanje), pa postojeći nalozi rade kao prije. Administrator uvijek radi nad svim sektorima.
- Pravila na serveru (`assertScope`), uz pravo uloge iz ADR 0009:
  - objave: kreiranje, izmjena, promjena resora, radnje toka (slanje, odobravanje, objava, povlačenje) i brisanje samo u svojim sektorima;
  - dokumenti: učitavanje, metapodaci, nove verzije, izlučivanje i brisanje samo u svojim sektorima;
  - sve ostalo korisnik može čitati.
- Red za odobrenje: `GET /admin/posts?queue=1` i broj na kontrolnoj ploči pokazuju samo objave iz sektora urednika.
- CMS: izbor sektora po korisniku, „Samo moji sektori” na listi objava, objava tuđeg sektora otvara se samo za čitanje s objašnjenjem, resor u editoru i sektor dokumenta nude samo dozvoljene sektore.

## Posljedice
- Kad Ministarstvo dostavi šemu, administrator upiše sektore i rasporedi ljude; kod se ne mijenja.
- Promjena sektora korisnika važi od sljedećeg zahtjeva (uloga i sektori se čitaju iz baze uz svaki zahtjev).
