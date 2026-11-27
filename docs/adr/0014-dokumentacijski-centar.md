# ADR 0014: Dokumentacijski centar – metapodaci, verzije, rokovi čuvanja

Status: prihvaćena (Sprint 6, F2-03)

## Odluka
- **Metapodaci**: izdavač/donosilac, službeno glasilo, datum donošenja, važi od/do, ključne riječi (pretraga i na portalu), jezik, status (važeći, van snage, zamijenjen, arhiviran) i veza „zamijenjen dokumentom”.
- **Pristup**: JAVNO (portal) ili INTERNO (samo CMS). Interni i izlučeni dokumenti se ne vide na portalu ni preko direktnog linka; CMS ih preuzima preko `/api/admin/documents/:id/file` uz prijavu.
- **Verzije datoteke**: „Nova verzija” premješta trenutnu datoteku u `document_versions` (s RLS-om) i zadržava je za preuzimanje; svaka zamjena ide u dnevnik s otiskom (sha256) stare i nove datoteke.
- **Rok čuvanja**: klasa TRAJNO / 10 / 5 / 2 godine; rok se računa od „važi do”, inače od datuma donošenja, odnosno učitavanja. Početne klase po vrsti: zakoni, pravilnici i odluke trajno; uputstva i izvještaji 10; obrasci 5; ostalo 10 godina. **Provjeriti s Ministarstvom** prema listi kategorija registraturske građe i propisima o arhivskoj građi.
- **Ništa se ne briše automatski.** Istekli rok stavlja dokument na listu „Istekao rok čuvanja”. Izlučivanje je ručna radnja (pravo brisanja) uz obavezan osnov (npr. zapisnik komisije): briše datoteku i sve verzije, zapis o dokumentu ostaje sa statusom ARHIVIRAN, datumom i osnovom.
- **Zabrana izlučivanja** (spor, revizija, zahtjev za pristup informacijama) postavlja samo administrator; dok važi, izlučivanje nije moguće.
- Test `documents.test.ts` nad pravom bazom: računanje roka, verzije, skrivanje internih, pravila izlučivanja i zabrane.
