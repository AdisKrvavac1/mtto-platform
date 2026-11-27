/**
 * F2-04: registry builder – jedan alat za sve javne registre.
 * - registries: definicija registra (polja kao JSON shema, sektor, javnost, karta)
 * - registry_entries: zapisi (podaci u jsonb prema shemi, koordinate, status)
 * F2-13: registar kategoriziranih smještajnih objekata je prvi registar napravljen alatom;
 * postojeći (demo) redovi iz tabele facilities prenose se u njega.
 */
const rls = (t: string) => `
ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${t} FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON ${t};
CREATE POLICY tenant_isolation ON ${t}
  USING ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*')
  WITH CHECK ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*');`;

const SMJESTAJ_FIELDS = JSON.stringify([
  { key: 'naziv', label: 'Naziv objekta', type: 'text', required: true, public: true, search: true, list: true },
  { key: 'vrsta', label: 'Vrsta objekta', type: 'select', options: ['Hotel', 'Motel', 'Pansion', 'Apartmani', 'Kamp', 'Kuća za odmor', 'Sobe'], required: true, public: true, filter: true, list: true },
  { key: 'kategorija', label: 'Kategorija (zvjezdice)', type: 'select', options: ['1', '2', '3', '4', '5'], public: true, filter: true, list: true },
  { key: 'opcina', label: 'Općina / grad', type: 'select', options: ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'], required: true, public: true, filter: true, list: true },
  { key: 'adresa', label: 'Adresa', type: 'text', public: true, search: true },
  { key: 'jedinice', label: 'Smještajne jedinice', type: 'integer', public: true },
  { key: 'lezaji', label: 'Ležaji', type: 'integer', public: true, list: true },
  { key: 'rjesenje', label: 'Broj rješenja', type: 'text', public: true, unique: true, search: true },
  { key: 'datumRjesenja', label: 'Datum rješenja', type: 'date', public: true },
  { key: 'vrijediDo', label: 'Kategorija vrijedi do', type: 'date', public: true },
  { key: 'status', label: 'Status kategorije', type: 'select', options: ['Važeća', 'Istekla', 'Ukinuta'], required: true, public: true, filter: true, list: true },
  { key: 'napomena', label: 'Interna napomena', type: 'longtext', public: false },
]);

export const m0010_registries = {
  id: '0010_registries',
  up: `
CREATE TABLE IF NOT EXISTS registries (
  "id" text PRIMARY KEY,
  "tenantId" text NOT NULL DEFAULT mtto_current_tenant() REFERENCES tenants("id"),
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "sector" text,
  "fields" jsonb NOT NULL DEFAULT '[]',
  "titleField" text,
  "geo" boolean NOT NULL DEFAULT false,
  "public" boolean NOT NULL DEFAULT false,
  "legalBasis" text NOT NULL DEFAULT '',
  "isDemo" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("tenantId","slug")
);
${rls('registries')}

CREATE TABLE IF NOT EXISTS registry_entries (
  "id" text PRIMARY KEY,
  "tenantId" text NOT NULL DEFAULT mtto_current_tenant() REFERENCES tenants("id"),
  "registryId" text NOT NULL REFERENCES registries("id") ON DELETE CASCADE,
  "data" jsonb NOT NULL DEFAULT '{}',
  "searchText" text NOT NULL DEFAULT '',
  "lat" double precision,
  "lng" double precision,
  "status" text NOT NULL DEFAULT 'AKTIVAN' CHECK ("status" IN ('AKTIVAN','ARHIVIRAN')),
  "isDemo" boolean NOT NULL DEFAULT false,
  "createdBy" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS registry_entries_reg ON registry_entries("registryId","status");
CREATE INDEX IF NOT EXISTS registry_entries_data ON registry_entries USING gin ("data" jsonb_path_ops);
${rls('registry_entries')}

INSERT INTO registries ("id","tenantId","slug","name","description","sector","fields","titleField","geo","public","legalBasis","isDemo")
SELECT 'mtto-smjestaj','mtto','ugostiteljski-objekti','Kategorizirani smještajni objekti',
  'Hoteli, moteli, pansioni, kampovi i objekti za iznajmljivanje s dodijeljenom kategorijom na području kantona.',
  'Turizam', $f$${SMJESTAJ_FIELDS}$f$::jsonb, 'naziv', true, true,
  'Zakon o ugostiteljskoj djelatnosti i pravilnici o kategorizaciji (provjeriti s Ministarstvom)', true
WHERE EXISTS (SELECT 1 FROM tenants WHERE "id"='mtto')
ON CONFLICT DO NOTHING;

INSERT INTO registry_entries ("id","tenantId","registryId","data","searchText","lat","lng","isDemo","createdAt")
SELECT 'smj-' || f."id", f."tenantId", 'mtto-smjestaj',
  jsonb_strip_nulls(jsonb_build_object(
    'naziv', f."name", 'vrsta', f."kind", 'kategorija', f."stars"::text, 'opcina', CASE WHEN f."municipality" = 'Blagaj' THEN 'Mostar' ELSE f."municipality" END,
    'adresa', NULLIF(f."address", ''), 'jedinice', f."rooms", 'lezaji', f."beds", 'rjesenje', f."decisionNumber",
    'datumRjesenja', to_char(f."decisionDate", 'YYYY-MM-DD'),
    'vrijediDo', to_char(f."decisionDate" + interval '4 years', 'YYYY-MM-DD'),
    'status', 'Važeća')),
  lower(concat_ws(' ', f."name", f."address", f."decisionNumber", f."municipality")),
  f."lat", f."lng", f."isDemo", f."createdAt"
FROM facilities f
WHERE f."tenantId"='mtto' AND EXISTS (SELECT 1 FROM registries WHERE "id"='mtto-smjestaj')
ON CONFLICT DO NOTHING;
`,
};
