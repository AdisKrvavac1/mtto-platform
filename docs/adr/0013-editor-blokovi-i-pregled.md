# ADR 0013: Editor s blokovima (Tiptap) i link za pregled prije objave

Status: prihvaćena (Sprint 6, F2-02)

## Odluka
- Tekst objave se uređuje u **Tiptap 3** editoru (WYSIWYG) umjesto Markdown polja. Sprema se HTML. Starije objave u Markdownu pretvaraju se pri otvaranju; uvezene vijesti su već HTML. Nema migracije baze.
- Blokovi: podnaslovi (H2/H3), liste, citat, tabela (redovi/kolone), slika iz Multimedije s **obaveznim alternativnim tekstom**, napomena/upozorenje (`<aside data-tone>`), kartica dokumenta iz priloga (`<a data-doc-id>`), linija. Linkovi samo `https`, `mailto`, `tel` ili unutrašnji.
- Portal i dalje čisti sav HTML pri prikazu (`renderBody`, sanitize-html): dozvoljena je samo lista oznaka i atributa, vrijednosti `data-tone` su ograničene, `javascript:` i `on*` se uklanjaju. Provjereno na tipičnim XSS primjerima.
- **Link za pregled**: `POST /admin/posts/:id/preview-link` daje potpisan token (JWT, `purpose=preview`, institucija, 72 h). Stranica `/pregled/[token]` prikazuje trenutni sadržaj bez obzira na status, s trakom „Pregled prije objave”, `noindex` i bez dugmadi za dijeljenje. Token ne vrijedi kao sesija i ne vrijedi na domeni druge institucije. Pravljenje linka ide u dnevnik.
- Članak na portalu je izdvojen u `components/site/ArticleView.tsx`, isti za javni prikaz i pregled.

## Posljedice
- Link za pregled se ne može opozvati prije isteka (72 h); za osjetljiv sadržaj slati ga samo službenim kanalom.
- Višejezičnost (F2-06) će dodati jezičke verzije istog sadržaja; format tijela (HTML) ostaje isti.
