/**
 * F2-03: dokumentacijski centar.
 * - metapodaci: izdavač, službeno glasilo, važi od/do, ključne riječi, jezik, pristup (JAVNO/INTERNO), zamijenjen dokumentom
 * - verzije datoteke: zamjena datoteke čuva prethodnu u document_versions (s RLS-om)
 * - rok čuvanja: klasa čuvanja → "retainUntil"; istekli rok se samo označava za pregled, ništa se ne briše
 *   automatski; izlučivanje je ručna radnja uz razlog i upis u dnevnik, a zabrana ("legalHold") ga sprječava
 */
export const m0008_document_center = {
  id: '0008_document_center',
  up: `
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "publisher" text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "gazette" text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "validFrom" date;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "validUntil" date;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "keywords" text[] NOT NULL DEFAULT '{}';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "language" text NOT NULL DEFAULT 'bs';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "accessLevel" text NOT NULL DEFAULT 'JAVNO';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "replacedById" text REFERENCES documents("id") ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 1;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "retentionClass" text NOT NULL DEFAULT 'GODINA_10';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "retainUntil" date;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "legalHold" boolean NOT NULL DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "disposedAt" timestamptz;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "disposalNote" text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz NOT NULL DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='documents_access_check') THEN
    ALTER TABLE documents ADD CONSTRAINT documents_access_check CHECK ("accessLevel" IN ('JAVNO','INTERNO'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='documents_retention_check') THEN
    ALTER TABLE documents ADD CONSTRAINT documents_retention_check CHECK ("retentionClass" IN ('TRAJNO','GODINA_10','GODINA_5','GODINA_2'));
  END IF;
END $$;
-- izlučen dokument nema datoteku; ostaje zapis o njemu
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_has_content;
ALTER TABLE documents ADD CONSTRAINT documents_has_content CHECK ("data" IS NOT NULL OR "storageKey" IS NOT NULL OR "disposedAt" IS NOT NULL);

-- početna klasa čuvanja po vrsti (provjeriti s Ministarstvom prema listi kategorija registraturske građe)
UPDATE documents SET "retentionClass" = CASE "docType"
  WHEN 'ZAKON' THEN 'TRAJNO' WHEN 'PRAVILNIK' THEN 'TRAJNO' WHEN 'ODLUKA' THEN 'TRAJNO'
  WHEN 'IZVJESTAJ' THEN 'GODINA_10' WHEN 'UPUTSTVO' THEN 'GODINA_10' WHEN 'OBRAZAC' THEN 'GODINA_5' ELSE 'GODINA_10' END
WHERE "retainUntil" IS NULL;
UPDATE documents SET "retainUntil" = (COALESCE("validUntil", "issuedAt", "createdAt"::date) + (CASE "retentionClass" WHEN 'GODINA_10' THEN 10 WHEN 'GODINA_5' THEN 5 WHEN 'GODINA_2' THEN 2 END || ' years')::interval)::date
WHERE "retentionClass" <> 'TRAJNO' AND "retainUntil" IS NULL;

CREATE TABLE IF NOT EXISTS document_versions (
  "id" text PRIMARY KEY,
  "tenantId" text NOT NULL DEFAULT mtto_current_tenant() REFERENCES tenants("id"),
  "documentId" text NOT NULL REFERENCES documents("id") ON DELETE CASCADE,
  "version" integer NOT NULL,
  "fileName" text NOT NULL, "mimeType" text NOT NULL, "size" integer NOT NULL,
  "data" bytea, "storageKey" text, "sha256" text, "scanStatus" text,
  "userName" text NOT NULL, "note" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("documentId","version")
);
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON document_versions;
CREATE POLICY tenant_isolation ON document_versions
  USING ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*')
  WITH CHECK ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*');
CREATE INDEX IF NOT EXISTS documents_retain_idx ON documents("tenantId","retainUntil") WHERE "disposedAt" IS NULL AND NOT "legalHold";
`,
};
