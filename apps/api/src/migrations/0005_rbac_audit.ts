/**
 * F1-04: uloge i prava, upravljanje korisnicima, dnevnik aktivnosti koji se ne može mijenjati.
 * - users: aktivan/neaktivan, verzija sesije (odjava svih sesija pri promjeni uloge), pozivnica za aktivaciju.
 * - audit_log: redni broj, ko/šta/koji zapis, izmjene po poljima, lanac sha256 (svaki zapis sadrži hash prethodnog),
 *   zabrana UPDATE/DELETE na nivou baze.
 */
export const m0005_rbac_audit = {
  id: '0005_rbac_audit',
  up: `
ALTER TABLE users ADD COLUMN IF NOT EXISTS "active" boolean NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "sessionVersion" integer NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLoginAt" timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "inviteHash" text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "inviteExpires" timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "createdBy" text;
UPDATE users SET "role"='UREDNIK' WHERE "role" NOT IN ('ADMIN','UREDNIK','REFERENT','PREGLED');
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='users_role_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK ("role" IN ('ADMIN','UREDNIK','REFERENT','PREGLED'));
  END IF;
END $$;

ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS "seq" bigserial;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS "userId" text;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS "entity" text;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS "entityId" text;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS "changes" jsonb;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS "ip" text;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS "requestId" text;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS "prevHash" text;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS "hash" text;

DROP TRIGGER IF EXISTS audit_log_immutable ON audit_log;
DROP TRIGGER IF EXISTS audit_log_chain ON audit_log;

-- postojeći zapisi: redni broj po vremenu nastanka
UPDATE audit_log a SET "seq"=o.n FROM (SELECT "id", row_number() OVER (ORDER BY "createdAt","id") n FROM audit_log) o WHERE a."id"=o."id" AND a."hash" IS NULL;
SELECT setval(pg_get_serial_sequence('audit_log','seq'), GREATEST((SELECT max("seq") FROM audit_log), 1));
CREATE UNIQUE INDEX IF NOT EXISTS audit_log_seq_key ON audit_log("seq");
-- redni broj dodjeljuje okidač (ispod), da ne bi bilo preskakanja brojeva
ALTER TABLE audit_log ALTER COLUMN "seq" DROP DEFAULT;
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log("createdAt" DESC);
CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON audit_log("entity","entityId");

CREATE OR REPLACE FUNCTION mtto_audit_hash(prev text, seq bigint, uid text, uname text, act text, ent text, eid text, tgt text, chg jsonb, at timestamptz)
RETURNS text LANGUAGE sql IMMUTABLE AS $f$
  SELECT encode(sha256(convert_to(
    coalesce(prev,'') || '|' || seq::text || '|' || coalesce(uid,'') || '|' || uname || '|' || act || '|' || coalesce(ent,'') || '|' ||
    coalesce(eid,'') || '|' || tgt || '|' || coalesce(chg::text,'') || '|' || to_char(at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US'),
  'UTF8')), 'hex')
$f$;

-- lanac za postojeće zapise
DO $$ DECLARE r record; p text := NULL; BEGIN
  FOR r IN SELECT * FROM audit_log ORDER BY "seq" LOOP
    IF r."hash" IS NULL THEN
      UPDATE audit_log SET "prevHash"=p, "hash"=mtto_audit_hash(p, r."seq", r."userId", r."userName", r."action", r."entity", r."entityId", r."target", r."changes", r."createdAt") WHERE "id"=r."id"
      RETURNING "hash" INTO p;
    ELSE p := r."hash"; END IF;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION mtto_audit_chain() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
  IF NEW."hash" IS NOT NULL THEN RETURN NEW; END IF;  -- vraćanje iz rezervne kopije zadržava postojeći lanac
  PERFORM pg_advisory_xact_lock(727003);              -- jedan po jedan, da redni broj prati redoslijed lanca
  NEW."seq" := nextval(pg_get_serial_sequence('audit_log','seq'));
  SELECT "hash" INTO NEW."prevHash" FROM audit_log ORDER BY "seq" DESC LIMIT 1;
  NEW."hash" := mtto_audit_hash(NEW."prevHash", NEW."seq", NEW."userId", NEW."userName", NEW."action", NEW."entity", NEW."entityId", NEW."target", NEW."changes", NEW."createdAt");
  RETURN NEW;
END $f$;
CREATE TRIGGER audit_log_chain BEFORE INSERT ON audit_log FOR EACH ROW EXECUTE FUNCTION mtto_audit_chain();

CREATE OR REPLACE FUNCTION mtto_audit_immutable() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN RAISE EXCEPTION 'Dnevnik aktivnosti se ne može mijenjati ni brisati'; END $f$;
CREATE TRIGGER audit_log_immutable BEFORE UPDATE OR DELETE ON audit_log FOR EACH ROW EXECUTE FUNCTION mtto_audit_immutable();
`,
};
