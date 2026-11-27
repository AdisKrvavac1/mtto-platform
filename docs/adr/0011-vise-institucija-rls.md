# ADR 0011: Više institucija na jednoj platformi (tenantId + Row-Level Security)

Status: prihvaćena (Sprint 5, F1-11)

## Kontekst
Platforma treba moći poslužiti i druge institucije (Grad Mostar, e-Građanin, druga ministarstva HNK) bez kopiranja koda i baze, a da podaci jedne institucije nikad ne budu vidljivi drugoj.

## Odluka
- Tabela `tenants` (id, naziv, domene, tema). Svi postojeći podaci pripadaju instituciji `mtto`.
- Kolona `tenantId` na svim tabelama sa sadržajem (korisnici, objave, dokumenti, mediji, registri, klizišta, eko-prijave, dnevnik). Zadana vrijednost dolazi iz postavke sesije, pa postojeći kod ne mora navoditi instituciju pri upisu.
- **Row-Level Security u PostgreSQL-u** (`FORCE`, važi i za vlasnika tabela): red je vidljiv i upisiv samo kad je `tenantId = app.tenant`. Zaboravljen `WHERE` u kodu ne može otkriti tuđe podatke; pokušaj upisa u tuđu instituciju baza odbija.
- Institucija zahtjeva: zaglavlje `X-MTTO-Tenant` → domena (`X-Forwarded-Host`/`Host`) iz `tenants.domains` → `mtto`. Middleware je stavlja u `AsyncLocalStorage`, a `TenantPool` je postavlja na konekciju prije svakog upita (i za Kysely).
- Sistemski poslovi (migracije, rezervne kopije, prenos datoteka) rade s `app.tenant = '*'` kroz `db.system()`. Kopija baze obuhvata sve institucije.
- Sesija CMS-a nosi `tid`; korisnik iz jedne institucije ne može koristiti sesiju na domeni druge.
- Jedinstvenost (e-mail, slug, broj rješenja, šifra prijave) važi unutar institucije; dnevnik aktivnosti ima poseban sha256 lanac po instituciji.
- Advisory lockovi (kopija, prenos datoteka) sada drže lock i unlock na istoj konekciji (`db.withLock`).
- CI koristi korisnika baze bez superuser prava (kao Render), jer superuser preskače RLS; test `tenant.test.ts` dokazuje izolaciju (čitanje, izmjena, brisanje, upis, lanac dnevnika).

## Nova institucija (postupak)
1. `INSERT INTO tenants ("id","name","shortName","domains","theme") VALUES ('mostar','Grad Mostar','Mostar', ARRAY['portal.mostar.ba'], '{"portalBrand":"blue"}');` (kao sistem, `app.tenant='*'`).
2. Domena na Renderu (Custom Domain) i DNS.
3. Prvi administrator: `INSERT` u `users` s `tenantId='mostar'` i ulogom ADMIN, zatim link za aktivaciju iz CMS-a te institucije.

## Posljedice
- Svaki upit ima jedan dodatni kratki poziv (`set_config`) na konekciji; zanemarivo pri ovom opterećenju.
- Portal još ne mijenja izgled po instituciji (naziv, grb, brand boje iz `tenants.theme`); to je sljedeći korak kad stigne prva druga institucija. `GET /api/tenant` već vraća te podatke.
- Upiti direktno u bazu (psql, Render konzola) bez `SET app.tenant` vraćaju prazne rezultate; za održavanje: `SELECT set_config('app.tenant','*',false);`.
