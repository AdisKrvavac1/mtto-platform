/** P0-02: dvofaktorska prijava (TOTP), rezervni kodovi i zaključavanje naloga nakon pogrešnih pokušaja. */
export const m0002_mfa = {
  id: '0002_mfa',
  up: `
ALTER TABLE users ADD COLUMN IF NOT EXISTS "mfaEnabled" boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "mfaSecret" text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "mfaPendingSecret" text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "mfaLastStep" bigint NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "mfaRecovery" jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "failedLogins" integer NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lockedUntil" timestamptz;
`,
};
