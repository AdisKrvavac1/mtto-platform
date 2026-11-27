/**
 * F1-01: PostGIS i prostorne kolone.
 * Svaka tabela s koordinatama dobija izračunatu kolonu "geom" (geography, WGS84) i GiST indeks,
 * pa se upiti "u blizini", "unutar općine" i slično rade u bazi.
 * Ako PostGIS nije dostupan, migracija se preskače (ne bilježi se) i aplikacija radi kao i prije;
 * pokušava se ponovo pri svakom pokretanju dok proširenje ne postane dostupno.
 */
const TABLES = ['permits', 'facilities', 'map_locations', 'landslides', 'eco_reports'];

export const m0003_postgis = {
  id: '0003_postgis',
  optional: true,
  up: `
DO $mig$
DECLARE t text;
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS postgis;
  EXCEPTION WHEN others THEN
    -- Preskoči bez bilježenja: migracija se ponovo pokušava pri sljedećem pokretanju.
    RAISE EXCEPTION 'MTTO_SKIP: PostGIS nije dostupan (%)', SQLERRM;
  END;
  FOREACH t IN ARRAY ARRAY[${TABLES.map((t) => `'${t}'`).join(',')}] LOOP
    EXECUTE format(
      'ALTER TABLE %I ADD COLUMN IF NOT EXISTS "geom" geography(Point, 4326) GENERATED ALWAYS AS '
      || '(CASE WHEN "lat" IS NULL OR "lng" IS NULL THEN NULL ELSE ST_SetSRID(ST_MakePoint("lng", "lat"), 4326)::geography END) STORED', t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I USING GIST ("geom")', t || '_geom_gix', t);
  END LOOP;
END
$mig$;
`,
};
