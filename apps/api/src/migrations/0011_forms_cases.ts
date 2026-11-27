/**
 * F2-05: obrasci i predmeti v1.
 * - forms: elektronski obrazac (polja kao u registry builderu), sektor, rok rješavanja
 * - cases: predmet iz podnesenog obrasca (broj, status, rok, dodjela referentu)
 * - case_events: historija predmeta (javni koraci vidljivi podnosiocu pri praćenju statusa)
 * - case_files: prilozi podnosioca i službenika (u skladištu kao ostale datoteke)
 */
const rls = (t: string) => `
ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${t} FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON ${t};
CREATE POLICY tenant_isolation ON ${t}
  USING ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*')
  WITH CHECK ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*');`;
const tenant = `"tenantId" text NOT NULL DEFAULT mtto_current_tenant() REFERENCES tenants("id")`;

const KATEGORIZACIJA = JSON.stringify([
  { key: 'nazivObjekta', label: 'Naziv objekta', type: 'text', required: true },
  { key: 'vrsta', label: 'Vrsta objekta', type: 'select', options: ['Hotel', 'Motel', 'Pansion', 'Apartmani', 'Kamp', 'Kuća za odmor', 'Sobe'], required: true },
  { key: 'trazenaKategorija', label: 'Tražena kategorija (zvjezdice)', type: 'select', options: ['1', '2', '3', '4', '5'], required: true },
  { key: 'opcina', label: 'Općina / grad', type: 'select', options: ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'], required: true },
  { key: 'adresa', label: 'Adresa objekta', type: 'text', required: true },
  { key: 'jedinice', label: 'Broj smještajnih jedinica', type: 'integer', required: true },
  { key: 'lezaji', label: 'Broj ležaja', type: 'integer', required: true },
  { key: 'napomena', label: 'Napomena', type: 'longtext' },
]);
const PITANJE = JSON.stringify([
  { key: 'tema', label: 'Tema', type: 'select', options: ['Turizam i ugostiteljstvo', 'Zaštita okoliša', 'Trgovina', 'Ostalo'], required: true },
  { key: 'pitanje', label: 'Vaše pitanje ili zahtjev', type: 'longtext', required: true },
]);

export const m0011_forms_cases = {
  id: '0011_forms_cases',
  up: `
CREATE TABLE IF NOT EXISTS forms (
  "id" text PRIMARY KEY,
  ${tenant},
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "sector" text,
  "fields" jsonb NOT NULL DEFAULT '[]',
  "slaDays" integer NOT NULL DEFAULT 30 CHECK ("slaDays" BETWEEN 1 AND 365),
  "attachments" text NOT NULL DEFAULT 'OPCIONO' CHECK ("attachments" IN ('NE','OPCIONO','OBAVEZNO')),
  "attachmentHint" text NOT NULL DEFAULT '',
  "legalBasis" text NOT NULL DEFAULT '',
  "active" boolean NOT NULL DEFAULT false,
  "isDemo" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("tenantId","slug")
);
${rls('forms')}

CREATE TABLE IF NOT EXISTS cases (
  "id" text PRIMARY KEY,
  ${tenant},
  "number" text NOT NULL,
  "formId" text NOT NULL REFERENCES forms("id"),
  "sector" text,
  "status" text NOT NULL DEFAULT 'ZAPRIMLJEN' CHECK ("status" IN ('ZAPRIMLJEN','U_OBRADI','DOPUNA','RIJESEN','ODBIJEN')),
  "data" jsonb NOT NULL DEFAULT '{}',
  "applicantName" text NOT NULL,
  "applicantEmail" text,
  "applicantPhone" text,
  "trackingHash" text NOT NULL,
  "assigneeId" text REFERENCES users("id") ON DELETE SET NULL,
  "receivedAt" timestamptz NOT NULL DEFAULT now(),
  "dueAt" timestamptz NOT NULL,
  "closedAt" timestamptz,
  "isDemo" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("tenantId","number")
);
CREATE INDEX IF NOT EXISTS cases_status ON cases("status","dueAt");
${rls('cases')}

CREATE TABLE IF NOT EXISTS case_events (
  "id" text PRIMARY KEY,
  ${tenant},
  "caseId" text NOT NULL REFERENCES cases("id") ON DELETE CASCADE,
  "kind" text NOT NULL,
  "fromStatus" text,
  "toStatus" text,
  "note" text NOT NULL DEFAULT '',
  "public" boolean NOT NULL DEFAULT false,
  "actorId" text,
  "actorName" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS case_events_case ON case_events("caseId","createdAt");
${rls('case_events')}

CREATE TABLE IF NOT EXISTS case_files (
  "id" text PRIMARY KEY,
  ${tenant},
  "caseId" text NOT NULL REFERENCES cases("id") ON DELETE CASCADE,
  "fileName" text NOT NULL,
  "mimeType" text NOT NULL,
  "size" integer NOT NULL,
  "data" bytea,
  "storageKey" text,
  "sha256" text,
  "scanStatus" text NOT NULL DEFAULT 'NIJE_SKENIRANO',
  "source" text NOT NULL DEFAULT 'PODNOSILAC' CHECK ("source" IN ('PODNOSILAC','SLUZBENIK')),
  "uploadedBy" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
${rls('case_files')}

-- brojač predmeta po instituciji i godini (bez praznina i bez sudara pri istovremenim prijemima)
CREATE TABLE IF NOT EXISTS case_counters (
  ${tenant},
  "year" integer NOT NULL,
  "n" integer NOT NULL DEFAULT 0,
  PRIMARY KEY ("tenantId","year")
);
${rls('case_counters')}

INSERT INTO forms ("id","tenantId","slug","title","description","sector","fields","slaDays","attachments","attachmentHint","legalBasis","active","isDemo")
SELECT 'mtto-obrazac-kategorizacija','mtto','zahtjev-za-kategorizaciju','Zahtjev za kategorizaciju smještajnog objekta',
  'Zahtjev za utvrđivanje kategorije hotela, motela, pansiona, kampa ili objekta za iznajmljivanje. Probni obrazac: sadržaj i prilozi usklađuju se s Ministarstvom.',
  'Turizam', $f$${KATEGORIZACIJA}$f$::jsonb, 30, 'OBAVEZNO',
  'Rješenje o registraciji djelatnosti i dokaz o pravu korištenja objekta (PDF ili fotografija).',
  'Zakon o ugostiteljskoj djelatnosti HNK (provjeriti s Ministarstvom)', true, true
WHERE EXISTS (SELECT 1 FROM tenants WHERE "id"='mtto')
ON CONFLICT DO NOTHING;

INSERT INTO forms ("id","tenantId","slug","title","description","sector","fields","slaDays","attachments","legalBasis","active","isDemo")
SELECT 'mtto-obrazac-upit','mtto','upit-ministarstvu','Upit ili zahtjev Ministarstvu',
  'Pitanje, prijedlog ili zahtjev za informaciju iz nadležnosti Ministarstva. Odgovor stiže na e-mail ili ga pratite brojem predmeta.',
  NULL, $f$${PITANJE}$f$::jsonb, 15, 'OPCIONO', 'Zakon o slobodi pristupa informacijama (rok 15 dana)', true, true
WHERE EXISTS (SELECT 1 FROM tenants WHERE "id"='mtto')
ON CONFLICT DO NOTHING;
`,
};
