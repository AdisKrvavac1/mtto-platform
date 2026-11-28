/**
 * F2-07: pretraga cijelog portala.
 *
 * search_docs je indeks javnog sadržaja (vijesti, dokumenti, registri, pozivi, obrasci, stranice) po instituciji,
 * koji SearchIndexer gradi iz izvornih tabela. mtto_fold() izjednačava pisanje sa i bez dijakritika
 * (č/ć→c, š→s, ž→z, đ i „dj“→d), pa „cevapi“ nađe „ćevapi“, a „Medjugorje“ nađe „Međugorje“.
 * search_queries broji upite po danu (bez IP-a i korisnika), da Ministarstvo vidi šta građani traže i ne nalaze.
 */
const rls = (t: string) => `
ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${t} FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON ${t};
CREATE POLICY tenant_isolation ON ${t}
  USING ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*')
  WITH CHECK ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*');`;

export const m0015_search = {
  id: '0015_search',
  up: `
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION mtto_fold(t text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS $f$
  SELECT replace(public.unaccent('public.unaccent'::regdictionary, lower(t)), 'dj', 'd')
$f$;

CREATE TABLE IF NOT EXISTS search_docs (
  "tenantId" text NOT NULL REFERENCES tenants("id"),
  "key" text NOT NULL,
  "kind" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL DEFAULT '',
  "url" text NOT NULL,
  "meta" text,
  "sector" text,
  "date" timestamptz,
  "isDemo" boolean NOT NULL DEFAULT false,
  "foldTitle" text NOT NULL,
  "tsv" tsvector NOT NULL,
  PRIMARY KEY ("tenantId","key")
);
CREATE INDEX IF NOT EXISTS search_docs_tsv ON search_docs USING gin("tsv");
CREATE INDEX IF NOT EXISTS search_docs_trgm ON search_docs USING gin("foldTitle" gin_trgm_ops);
${rls('search_docs')}

CREATE TABLE IF NOT EXISTS search_state (
  "tenantId" text PRIMARY KEY REFERENCES tenants("id"),
  "signature" text NOT NULL,
  "builtAt" timestamptz NOT NULL DEFAULT now(),
  "docs" integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS search_queries (
  "tenantId" text NOT NULL DEFAULT mtto_current_tenant() REFERENCES tenants("id"),
  "day" date NOT NULL,
  "query" text NOT NULL,
  "count" integer NOT NULL DEFAULT 1,
  "hits" integer NOT NULL DEFAULT 0,
  PRIMARY KEY ("tenantId","day","query")
);
${rls('search_queries')}
`,
};
