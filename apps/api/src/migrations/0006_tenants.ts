/**
 * F1-11: više institucija na istoj platformi (Ministarstvo, Grad Mostar, e-Građanin…).
 * - tabela tenants; svi postojeći podaci pripadaju instituciji 'mtto'
 * - kolona "tenantId" na svim tabelama sa sadržajem, zadana vrijednost iz postavke sesije app.tenant
 * - Row-Level Security (FORCE, važi i za vlasnika tabela): red je vidljiv i upisiv samo kad je
 *   "tenantId" = app.tenant; sistemski poslovi (migracije, kopije) rade s app.tenant = '*'
 * - jedinstvenost (e-mail, slug, broj rješenja, šifra prijave) sada važi unutar institucije
 * - lanac dnevnika aktivnosti vodi se posebno za svaku instituciju
 */
const TABLES = ['users', 'posts', 'documents', 'media', 'permits', 'facilities', 'map_locations', 'landslides', 'eco_reports', 'eco_report_photos', 'audit_log'];

const perTable = TABLES.map((t) => `
ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS "tenantId" text NOT NULL DEFAULT mtto_current_tenant() REFERENCES tenants("id");
CREATE INDEX IF NOT EXISTS ${t}_tenant_idx ON ${t}("tenantId");
ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${t} FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON ${t};
CREATE POLICY tenant_isolation ON ${t}
  USING ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*')
  WITH CHECK ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*');`).join('\n');

export const m0006_tenants = {
  id: '0006_tenants',
  up: `
CREATE TABLE IF NOT EXISTS tenants (
  "id" text PRIMARY KEY CHECK ("id" ~ '^[a-z0-9-]{2,40}$' AND "id" <> '*'),
  "name" text NOT NULL,
  "shortName" text NOT NULL,
  "domains" text[] NOT NULL DEFAULT '{}',
  "theme" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
INSERT INTO tenants ("id","name","shortName","domains","theme") VALUES
  ('mtto', 'Ministarstvo trgovine, turizma i zaštite okoliša HNK', 'MTTO HNK', ARRAY['mtto-platform.onrender.com','mtto.gov.ba','www.mtto.gov.ba','localhost'], '{"portalBrand":"blue","cmsBrand":"purple","logo":"/mtto-logo.svg"}')
ON CONFLICT ("id") DO NOTHING;

-- institucija iz postavke sesije; bez postavke ili za sistemske poslove: 'mtto'
CREATE OR REPLACE FUNCTION mtto_current_tenant() RETURNS text LANGUAGE sql STABLE AS $f$
  SELECT COALESCE(NULLIF(NULLIF(current_setting('app.tenant', true), ''), '*'), 'mtto')
$f$;

${perTable}

-- jedinstvenost unutar institucije
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS users_tenant_email_key ON users("tenantId", "email");
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS posts_tenant_slug_key ON posts("tenantId", "slug");
DROP INDEX IF EXISTS posts_external_id;
CREATE UNIQUE INDEX IF NOT EXISTS posts_tenant_external_id ON posts("tenantId", "externalId") WHERE "externalId" IS NOT NULL;
ALTER TABLE permits DROP CONSTRAINT IF EXISTS "permits_registerNumber_key";
CREATE UNIQUE INDEX IF NOT EXISTS permits_tenant_register_key ON permits("tenantId", "registerNumber");
ALTER TABLE eco_reports DROP CONSTRAINT IF EXISTS eco_reports_code_key;
CREATE UNIQUE INDEX IF NOT EXISTS eco_reports_tenant_code_key ON eco_reports("tenantId", "code");

-- dnevnik: lanac po instituciji
CREATE OR REPLACE FUNCTION mtto_audit_chain() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
  IF NEW."hash" IS NOT NULL THEN RETURN NEW; END IF;
  PERFORM pg_advisory_xact_lock(727003, hashtext(NEW."tenantId"));
  NEW."seq" := nextval(pg_get_serial_sequence('audit_log','seq'));
  SELECT "hash" INTO NEW."prevHash" FROM audit_log WHERE "tenantId" = NEW."tenantId" ORDER BY "seq" DESC LIMIT 1;
  NEW."hash" := mtto_audit_hash(NEW."prevHash", NEW."seq", NEW."userId", NEW."userName", NEW."action", NEW."entity", NEW."entityId", NEW."target", NEW."changes", NEW."createdAt");
  RETURN NEW;
END $f$;
`,
};
