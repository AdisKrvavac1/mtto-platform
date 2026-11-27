# ADR 0007: Sesije u httpOnly kolačiću, CSRF zaglavlje, CSP i ograničenje zahtjeva

Status: prihvaćena (Sprint 4, F1-03 i F1-10)

## Odluka
- Sesija CMS-a je u kolačiću `__Host-mtto_session` (httpOnly, Secure, SameSite=Strict, 8 h). Token više nije dostupan JavaScriptu.
- Svaka izmjena preko kolačića traži zaglavlje `X-MTTO-CSRF: 1` (drugi sloj uz SameSite=Strict). Bearer zaglavlje ostaje za skripte i integracije.
- MFA (TOTP) obavezan na produkciji; prijava i MFA ograničeni na 10 pokušaja/min po IP-u, javni obrasci na 5/min, sve ostalo 300/min.
- Javni obrasci zaštićeni ALTCHA dokazom rada (bez kolačića i praćenja, za razliku od reCAPTCHA), s zaštitom od ponovne upotrebe.
- CSP: osnovna pravila (frame-ancestors, object-src, base-uri, form-action) se provode odmah; puna politika radi u Report-Only načinu i šalje izvještaje na `/api/csp-report`. Prelazak na provođenje nakon 2 sedmice bez prijava na produkciji.
- HSTS (2 godine, preload), COOP, Permissions-Policy, X-Frame-Options DENY.

## Razlozi
XSS ne može ukrasti sesiju; ALTCHA je usklađen s GDPR-om bez banera za kolačiće; Report-Only sprječava da CSP slomi Google Maps i ugrađene sadržaje prije nego što vidimo stvarne prijave.
