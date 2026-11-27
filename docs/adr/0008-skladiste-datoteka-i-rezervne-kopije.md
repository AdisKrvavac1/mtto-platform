# ADR 0008: Datoteke u S3 skladištu, antivirus i šifrirane rezervne kopije

Status: prihvaćena (Sprint 4, F1-02 i F1-07)

## Odluka
- Dokumenti, mediji i fotografije eko-prijava idu u S3-kompatibilno skladište (Cloudflare R2, Hetzner ili Backblaze B2, odluka uz P0 podatke od Ministarstva). Baza čuva ključ, sha256 i status skeniranja.
- Bez S3 podešavanja aplikacija i dalje čuva datoteke u bazi (razvoj, demo). Skripta `storage-migrate` prenosi postojeće datoteke uz provjeru sha256.
- Svaki upload prolazi ClamAV (clamd) kada je `CLAMAV_HOST` podešen; zaražena datoteka se odbija. Bez ClamAV-a status je `NIJE_SKENIRANO` i vidljiv u bazi.
- Dnevna logička kopija baze, šifrirana (AES-256-GCM + RSA-OAEP javni ključ), u drugo skladište; mjesečni automatski test vraćanja u GitHub Actions. Detalji u `docs/runbook/rezervne-kopije.md`.

## Razlozi
Baza ostaje mala i brza za kopije; datoteke se serviraju bez opterećenja Postgresa; server ne može dešifrovati vlastite kopije, pa njegovo kompromitovanje ne otkriva arhivu.
