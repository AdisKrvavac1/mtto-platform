/**
 * Sprint 9 (okoliš, javni pozivi).
 *
 * F2-18: source_cache — zadnji uspješni odgovor svakog vanjskog izvora (FIRMS, Meteoalarm, GloFAS, CAMS),
 *   broj uzastopnih grešaka i kad je poslano upozorenje. Podaci su javni i zajednički za sve institucije,
 *   pa tabela nema tenantId ni RLS (kao schema_migrations).
 * F2-17: air_readings — satne vrijednosti kvaliteta zraka: CAMS model (automatski) i AMS stanice
 *   (uvoz iz CMS-a dok FHMZ ne da pristup, P0-15). Također javni podaci bez tenantId.
 * F2-16: calls (javni pozivi) i call_awards (lista korisnika i iznosa); predmet dobija callId.
 */
const rls = (t: string) => `
ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${t} FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON ${t};
CREATE POLICY tenant_isolation ON ${t}
  USING ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*')
  WITH CHECK ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*');`;
const tenant = `"tenantId" text NOT NULL DEFAULT mtto_current_tenant() REFERENCES tenants("id")`;
const J = (x: unknown) => `$j$${JSON.stringify(x)}$j$::jsonb`;
const OPCINE = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];

const PRIJAVA_FIELDS = [
  { key: 'vrstaPodnosioca', label: 'Vrsta podnosioca', type: 'select', options: ['Privredno društvo', 'Obrt', 'Udruženje', 'Javna ustanova', 'Fizičko lice'], required: true },
  { key: 'idBroj', label: 'Identifikacioni broj (JIB / IDB) pravnog lica ili obrta', type: 'text' },
  { key: 'opcina', label: 'Općina / grad sjedišta', type: 'select', options: OPCINE, required: true },
  { key: 'nazivProjekta', label: 'Naziv projekta', type: 'text', required: true },
  { key: 'opisProjekta', label: 'Kratak opis projekta i očekivanih rezultata', type: 'longtext', required: true },
  { key: 'ukupnaVrijednost', label: 'Ukupna vrijednost projekta (KM)', type: 'number', required: true },
  { key: 'trazeniIznos', label: 'Traženi iznos sufinansiranja (KM)', type: 'number', required: true },
];

export const m0014_sprint9 = {
  id: '0014_sprint9',
  up: `
CREATE TABLE IF NOT EXISTS source_cache (
  "key" text PRIMARY KEY,
  "data" jsonb NOT NULL DEFAULT '[]',
  "okAt" timestamptz,
  "checkedAt" timestamptz,
  "error" text,
  "failures" integer NOT NULL DEFAULT 0,
  "alertedAt" timestamptz
);

CREATE TABLE IF NOT EXISTS air_readings (
  "source" text NOT NULL CHECK ("source" IN ('CAMS','AMS')),
  "point" text NOT NULL,
  "ts" timestamptz NOT NULL,
  "aqi" real, "pm25" real, "pm10" real, "o3" real, "no2" real, "so2" real, "co" real,
  "importedBy" text,
  PRIMARY KEY ("source","point","ts")
);
CREATE INDEX IF NOT EXISTS air_readings_ts ON air_readings("ts");

CREATE TABLE IF NOT EXISTS calls (
  "id" text PRIMARY KEY,
  ${tenant},
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "sector" text,
  "summary" text NOT NULL DEFAULT '',
  "body" text NOT NULL DEFAULT '',
  "eligibility" text NOT NULL DEFAULT '',
  "budget" numeric(14,2),
  "maxAmount" numeric(14,2),
  "opensAt" timestamptz NOT NULL,
  "closesAt" timestamptz NOT NULL,
  "formId" text REFERENCES forms("id") ON DELETE SET NULL,
  "documents" jsonb NOT NULL DEFAULT '[]',
  "legalBasis" text NOT NULL DEFAULT '',
  "contact" text NOT NULL DEFAULT '',
  "published" boolean NOT NULL DEFAULT false,
  "resultsPublished" boolean NOT NULL DEFAULT false,
  "resultsNote" text NOT NULL DEFAULT '',
  "isDemo" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("tenantId","slug"),
  CHECK ("closesAt" > "opensAt")
);
${rls('calls')}

CREATE TABLE IF NOT EXISTS call_awards (
  "id" text PRIMARY KEY,
  ${tenant},
  "callId" text NOT NULL REFERENCES calls("id") ON DELETE CASCADE,
  "beneficiary" text NOT NULL,
  "beneficiaryType" text NOT NULL DEFAULT 'PRAVNO' CHECK ("beneficiaryType" IN ('PRAVNO','FIZICKO')),
  "municipality" text,
  "project" text NOT NULL DEFAULT '',
  "amount" numeric(14,2) NOT NULL CHECK ("amount" >= 0),
  "caseId" text REFERENCES cases("id") ON DELETE SET NULL,
  "position" integer NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS call_awards_call ON call_awards("callId","position");
${rls('call_awards')}

ALTER TABLE cases ADD COLUMN IF NOT EXISTS "callId" text REFERENCES calls("id") ON DELETE SET NULL;

-- Demo: obrazac i javni poziv (jasno označeni kao primjer dok Ministarstvo ne objavi stvarni poziv)
INSERT INTO forms ("id","tenantId","slug","title","description","sector","fields","slaDays","attachments","attachmentHint","legalBasis","active","isDemo")
SELECT 'mtto-obrazac-poziv-turizam','mtto','prijava-poziv-turizam-2027',$t$Prijava na javni poziv za sufinansiranje projekata u turizmu (primjer)$t$,
  $t$Primjer prijavnog obrasca. Stvarni uslovi i obrazac objavljuju se uz javni poziv.$t$,'Turizam',${J(PRIJAVA_FIELDS)},60,'OBAVEZNO',
  $t$Potpisan prijavni obrazac, budžet projekta i rješenje o registraciji (PDF)$t$,'',true,true
WHERE EXISTS (SELECT 1 FROM tenants WHERE "id"='mtto') ON CONFLICT DO NOTHING;

INSERT INTO calls ("id","tenantId","slug","title","sector","summary","body","eligibility","budget","maxAmount","opensAt","closesAt","formId","legalBasis","contact","published","isDemo")
SELECT 'mtto-poziv-turizam-2027','mtto','sufinansiranje-projekata-u-turizmu-2027',$t$Sufinansiranje projekata u turizmu 2027. (primjer)$t$,'Turizam',
  $t$Primjer javnog poziva za prikaz modula. Iznosi, rokovi i uslovi nisu stvarni.$t$,
  $t$Ministarstvo poziva subjekte s područja HNK da se prijave za sufinansiranje projekata razvoja turističke ponude: obogaćivanje sadržaja, ruralni i avanturistički turizam, manifestacije i promocija.

Prijava se podnosi elektronski putem portala ili poštom. Nepotpune i neblagovremene prijave neće se razmatrati.$t$,
  $t$Pravo prijave imaju privredna društva, obrti, udruženja i javne ustanove sa sjedištem u HNK koji su izmirili obaveze po ranijim ugovorima s Ministarstvom.$t$,
  100000,10000, now() - interval '3 days', now() + interval '27 days','mtto-obrazac-poziv-turizam','','Sektor za turizam, +387 36 551 823',true,true
WHERE EXISTS (SELECT 1 FROM forms WHERE "id"='mtto-obrazac-poziv-turizam') ON CONFLICT DO NOTHING;

INSERT INTO calls ("id","tenantId","slug","title","sector","summary","body","eligibility","budget","maxAmount","opensAt","closesAt","legalBasis","published","resultsPublished","resultsNote","isDemo")
SELECT 'mtto-poziv-okolis-2026','mtto','sufinansiranje-okolisnih-projekata-2026',$t$Sufinansiranje projekata zaštite okoliša 2026. (primjer)$t$,'Zaštita okoliša',
  $t$Zatvoreni primjer poziva s objavljenom listom korisnika. Nazivi i iznosi su izmišljeni.$t$,
  $t$Primjer zatvorenog javnog poziva za projekte upravljanja otpadom, zaštite voda i edukacije o okolišu.$t$,
  $t$Općine, javna preduzeća i udruženja s područja HNK.$t$,
  60000,15000, now() - interval '200 days', now() - interval '170 days','',true,true,
  $t$Odluka o dodjeli sredstava (primjer). Korisnici su dužni dostaviti izvještaj o utrošku u roku od 30 dana od završetka projekta.$t$,true
WHERE EXISTS (SELECT 1 FROM tenants WHERE "id"='mtto') ON CONFLICT DO NOTHING;

INSERT INTO call_awards ("id","tenantId","callId","beneficiary","beneficiaryType","municipality","project","amount","position")
SELECT v.id,'mtto','mtto-poziv-okolis-2026',v.b,'PRAVNO',v.m,v.p,v.a,v.n FROM (VALUES
  ('mtto-award-1','Udruženje „Zeleni primjer“ (demo)','Mostar','Edukacija o odvajanju otpada u školama',8500.00,1),
  ('mtto-award-2','Javno preduzeće „Primjer“ d.o.o. (demo)','Konjic','Sanacija divlje deponije uz obalu',15000.00,2),
  ('mtto-award-3','Udruženje „Neretva primjer“ (demo)','Čapljina','Čišćenje obala i monitoring kvaliteta vode',6200.00,3)
) AS v(id,b,m,p,a,n)
WHERE EXISTS (SELECT 1 FROM calls WHERE "id"='mtto-poziv-okolis-2026') ON CONFLICT DO NOTHING;
`,
};
