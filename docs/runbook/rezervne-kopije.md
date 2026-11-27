# Rezervne kopije i vraćanje (F1-07)

## Pravilo 3-2-1
| Kopija | Gdje | Učestalost | Čuvanje |
|---|---|---|---|
| 1. Produkcijska baza | Render Postgres (Frankfurt) | uživo | — |
| 2. Render snimci | Render (ugrađeno, point-in-time) | dnevno | po planu baze |
| 3. Šifrirana logička kopija | S3 skladište, drugi dobavljač (`backups/`) | dnevno 02:30 | 30 dana (`BACKUP_KEEP_DAYS`) |

Datoteke (dokumenti, fotografije) su u S3 skladištu s uključenim verzioniranjem bucketa; baza čuva samo ključ i sha256.

## Šifriranje
- Svaka kopija ima nasumičan AES-256-GCM ključ, šifriran **javnim** RSA-3072 ključem (`BACKUP_PUBLIC_KEY` na Renderu).
- **Privatni** ključ nije na serveru. Čuva se: (1) kod vlasnika projekta u upravitelju lozinki, (2) kao GitHub secret `BACKUP_PRIVATE_KEY` za mjesečni test, (3) zapečaćena kopija u Ministarstvu (provjeriti s Ministarstvom).
- Kompromitovan server ne može pročitati stare kopije.

Generisanje para ključeva (jednom, lokalno):
```
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out mtto-backup.key
openssl pkey -in mtto-backup.key -pubout -out mtto-backup.pub
```

## Varijable okruženja (Render)
`BACKUP_PUBLIC_KEY`, `BACKUP_BUCKET` (ili `S3_BUCKET`), `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, opcionalno `BACKUP_KEEP_DAYS`.
Ključ za upis kopija treba imati samo `PutObject`/`ListBucket`/`DeleteObject` na `backups/`; GitHub ključ samo čitanje.

## Mjesečni test vraćanja
GitHub Action **Test vraćanja kopije** (1. u mjesecu): vraća najnoviju kopiju u praznu PostGIS bazu i poredi broj redova po tabeli. Neuspjeh = e-mail vlasniku repozitorija. Rezultat upisati u tracker (F1-07, napomena).

## Vraćanje u stvarnom incidentu
1. Napraviti novu praznu bazu na Renderu (ne brisati staru dok se ne potvrdi vraćanje).
2. `BACKUP_PRIVATE_KEY=... S3_*=... node apps/api/dist/backup.js restore s3:latest <URL nove baze>`
   ili lokalni fajl: `... restore mtto-2026-....mttobak <URL>`
3. Provjeriti ispis „sve tabele se slažu”, zatim prebaciti `DATABASE_URL` servisa na novu bazu i redeploy.
4. Za gubitak manji od dana prvo pokušati Render point-in-time recovery (brže, manji gubitak).

Ciljevi: RPO ≤ 24 h (logička kopija), RTO ≤ 4 h.
