/**
 * F2-22: urednički proces po sektorima.
 * - sectors: sektori institucije (uređuje administrator); "key" odgovara posts.category, "name" documents.sector
 * - users.sectors: ključevi sektora korisnika; prazno = svi sektori (dosadašnje ponašanje)
 * Početni sektori odgovaraju postojećim resorima; Ministarstvo ih kasnije uskladi s organizacionom šemom.
 */
export const m0009_sectors = {
  id: '0009_sectors',
  up: `
CREATE TABLE IF NOT EXISTS sectors (
  "id" text PRIMARY KEY,
  "tenantId" text NOT NULL DEFAULT mtto_current_tenant() REFERENCES tenants("id"),
  "key" text NOT NULL,
  "name" text NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "sort" integer NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("tenantId","key")
);
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON sectors;
CREATE POLICY tenant_isolation ON sectors
  USING ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*')
  WITH CHECK ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*');

INSERT INTO sectors ("id","tenantId","key","name","sort") VALUES
  ('mtto-turizam','mtto','Turizam','Turizam i ugostiteljstvo',1),
  ('mtto-okolis','mtto','Zaštita okoliša','Zaštita okoliša',2),
  ('mtto-trgovina','mtto','Trgovina','Trgovina',3),
  ('mtto-opce','mtto','Opće','Opće',4)
ON CONFLICT DO NOTHING;

ALTER TABLE users ADD COLUMN IF NOT EXISTS "sectors" text[] NOT NULL DEFAULT '{}';
`,
};
