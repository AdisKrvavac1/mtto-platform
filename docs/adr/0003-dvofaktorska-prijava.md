# 0003: Dvofaktorska prijava (TOTP) za CMS

**Datum:** 27. 11. 2026. · **Status:** prihvaćena · **Zadatak:** P0-02

## Kontekst
CMS objavljuje sadržaj na .gov.ba domeni i obrađuje lične podatke iz prijava građana. Incident iz avgusta 2026. na mtto.gov.ba pokazao je rizik preuzetih naloga. OWASP ASVS 5.0 nivo 2 traži višefaktorsku prijavu.

## Odluka
- TOTP prema RFC 6238 (6 cifara, 30 s), radi sa svim uobičajenim aplikacijama za autentifikaciju. Bez SMS-a.
- Tajna se čuva šifrirana (AES-256-GCM); ključ iz `MFA_KEY` ili `JWT_SECRET`.
- Isti kod se ne može iskoristiti dvaput (pamti se zadnji korak).
- 8 rezervnih kodova, čuvaju se samo kao hash, svaki važi jednom.
- Nakon 5 pogrešnih pokušaja (lozinka ili kod) nalog se zaključava na 15 minuta.
- Prijava ide u dva koraka: lozinka daje kratkotrajni token (5 min) koji važi samo za drugi korak.
- `MFA_REQUIRED=true` čini MFA obaveznim: sesija bez drugog faktora dobija samo pristup postavljanju MFA.
- Svi događaji idu u dnevnik aktivnosti.

## Posljedice
- Na produkciji `MFA_REQUIRED` uključujemo nakon što svi korisnici postave aplikaciju.
- Passkeys (WebAuthn) i prijava preko identity brokera dolaze u F1-03 i F4-14.
