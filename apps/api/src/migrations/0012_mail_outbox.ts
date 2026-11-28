/**
 * E-mail obavještenja: odlazna pošta ide kroz tabelu (outbox), a raspored je šalje svake minute.
 * Prijem predmeta ne čeka mail server; neuspjelo slanje se ponavlja i ostaje vidljivo.
 */
export const m0012_mail_outbox = {
  id: '0012_mail_outbox',
  up: `
CREATE TABLE IF NOT EXISTS mail_outbox (
  "id" text PRIMARY KEY,
  "tenantId" text NOT NULL DEFAULT mtto_current_tenant() REFERENCES tenants("id"),
  "to" text NOT NULL,
  "subject" text NOT NULL,
  "text" text NOT NULL,
  "replyTo" text,
  "ref" text,
  "status" text NOT NULL DEFAULT 'CEKA' CHECK ("status" IN ('CEKA','POSLANO','NEUSPJELO')),
  "attempts" integer NOT NULL DEFAULT 0,
  "lastError" text,
  "nextAttemptAt" timestamptz NOT NULL DEFAULT now(),
  "sentAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mail_outbox_due ON mail_outbox("status","nextAttemptAt");
ALTER TABLE mail_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_outbox FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON mail_outbox;
CREATE POLICY tenant_isolation ON mail_outbox
  USING ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*')
  WITH CHECK ("tenantId" = current_setting('app.tenant', true) OR current_setting('app.tenant', true) = '*');
`,
};
