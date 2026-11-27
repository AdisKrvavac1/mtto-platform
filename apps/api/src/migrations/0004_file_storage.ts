/**
 * F1-02: datoteke izvan baze. Svaka tabela s datotekama dobija "storageKey" (ključ u S3 skladištu),
 * "sha256" (provjera integriteta) i "scanStatus" (rezultat antivirusne provjere).
 * "data" postaje neobavezan: stare datoteke ostaju u bazi dok ih skripta ne prenese u skladište.
 */
const TABLES = ['documents', 'media', 'eco_report_photos'];

export const m0004_file_storage = {
  id: '0004_file_storage',
  up: TABLES.map((t) => `
ALTER TABLE ${t} ALTER COLUMN "data" DROP NOT NULL;
ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS "storageKey" text;
ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS "sha256" text;
ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS "scanStatus" text NOT NULL DEFAULT 'NIJE_SKENIRANO';
ALTER TABLE ${t} DROP CONSTRAINT IF EXISTS ${t}_has_content;
ALTER TABLE ${t} ADD CONSTRAINT ${t}_has_content CHECK ("data" IS NOT NULL OR "storageKey" IS NOT NULL);`).join('\n'),
};
