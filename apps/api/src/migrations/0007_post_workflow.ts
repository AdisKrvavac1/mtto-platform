/**
 * F2-01: urednički tok objava, verzije, zakazano objavljivanje i povlačenje.
 * Statusi: NACRT → NA_ODOBRENJU → (VRACENO) → ZAKAZANO / OBJAVLJENO → POVUCENO.
 * Nova uloga SARADNIK: piše i šalje na odobrenje, ne objavljuje.
 * tenants.settings.fourEyes: autor ne smije sam odobriti svoju objavu (osim administratora).
 */
export const m0007_post_workflow = {
  id: '0007_post_workflow',
  up: `
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS "settings" jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK ("role" IN ('ADMIN','UREDNIK','SARADNIK','REFERENT','PREGLED'));

ALTER TABLE posts ADD COLUMN IF NOT EXISTS "unpublishAt" timestamptz;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "withdrawnReason" text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "reviewNote" text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "createdBy" text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "submittedBy" text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "submittedAt" timestamptz;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "approvedBy" text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "approvedAt" timestamptz;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 1;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='posts_status_check') THEN
    ALTER TABLE posts ADD CONSTRAINT posts_status_check CHECK ("status" IN ('NACRT','NA_ODOBRENJU','VRACENO','ZAKAZANO','OBJAVLJENO','POVUCENO'));
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts("tenantId","status");

CREATE TABLE IF NOT EXISTS post_versions (
  "id" text PRIMARY KEY,
  "tenantId" text NOT NULL DEFAULT mtto_current_tenant() REFERENCES tenants("id"),
  "postId" text NOT NULL REFERENCES posts("id") ON DELETE CASCADE,
  "version" integer NOT NULL,
  "status" text NOT NULL,
  "snapshot" jsonb NOT NULL,
  "userId" text,
  "userName" text NOT NULL,
  "note" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("postId","version")
);
CREATE INDEX IF NOT EXISTS post_versions_post_idx ON post_versions("postId","version" DESC);
ALTER TABLE post_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_versions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON post_versions;
CREATE POLICY tenant_isolation ON post_versions
  USING ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*')
  WITH CHECK ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*');

-- početna verzija za postojeće objave
INSERT INTO post_versions ("id","tenantId","postId","version","status","snapshot","userName","note","createdAt")
SELECT gen_random_uuid()::text, p."tenantId", p."id", 1, p."status",
  jsonb_build_object('type',p."type",'category',p."category",'title',p."title",'excerpt',p."excerpt",'body',p."body",'coverImage',p."coverImage",
    'publishedAt',p."publishedAt",'deadline',p."deadline",'formUrl',p."formUrl",'unpublishAt',p."unpublishAt"),
  p."authorName", 'Početno stanje', p."updatedAt"
FROM posts p WHERE NOT EXISTS (SELECT 1 FROM post_versions v WHERE v."postId"=p."id");
`,
};
