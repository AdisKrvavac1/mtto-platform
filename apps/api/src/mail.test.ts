import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';

/** Red za slanje: neispravne adrese se preskaču, slanje i ponavljanje nakon greške. */
test('e-mail: red, slanje i ponavljanje', { skip: !process.env.DATABASE_URL }, async () => {
  const nodemailer = (await import('nodemailer')).default;
  const { Db, withTenant } = await import('./db');
  const { MailScheduler, queueMail } = await import('./mail');
  const db = new Db();
  const env = { ...process.env };
  Object.assign(process.env, { SMTP_HOST: 'smtp.test', SMTP_USER: 'u', SMTP_PASSWORD: 'p', MAIL_FROM: 'MTTO <e-usluge@mtto.gov.ba>' });
  const ref = `t-mail-${Date.now()}`;
  try {
    await withTenant('mtto', async () => {
      assert.equal(await queueMail(db, { to: 'ne-valja', subject: 'x', text: 'x', ref }), false);
      assert.equal(await queueMail(db, { to: 'a@b.ba\r\nBcc: x@y.z', subject: 'x', text: 'x', ref }), false);
      assert.equal(await queueMail(db, { to: 'Ana@Example.org', subject: 'Prvi\r\nBcc: x@y.z', text: 'Tijelo', ref }), true);
      await queueMail(db, { to: 'b@example.org', subject: 'Drugi', text: 'Tijelo', ref });
    });
    const rows = await db.system(() => db.q<any>(`SELECT * FROM mail_outbox WHERE "ref"=$1 ORDER BY "subject"`, [ref]));
    assert.equal(rows.length, 2);
    assert.equal(rows[1].subject, 'Prvi Bcc: x@y.z', 'novi red u naslovu ne može dodati zaglavlje');
    assert.equal(rows[0].to, 'b@example.org');

    const sch = new MailScheduler(db);
    let fail = true;
    const json = nodemailer.createTransport({ jsonTransport: true });
    sch.useTransport({ sendMail: async (m: any) => { if (fail && m.to === 'b@example.org') throw new Error('421 privremeno'); return json.sendMail(m); } } as any);
    await db.system(() => db.q(`UPDATE mail_outbox SET "nextAttemptAt"=now() - interval '1 second' WHERE "ref"=$1`, [ref]));
    await sch.tick(100);
    let st = await db.system(() => db.q<any>(`SELECT "to","status","attempts","lastError","nextAttemptAt" > now() "later" FROM mail_outbox WHERE "ref"=$1 ORDER BY "to"`, [ref]));
    assert.equal(st.find((x: any) => x.to === 'ana@example.org').status, 'POSLANO');
    const b = st.find((x: any) => x.to === 'b@example.org');
    assert.equal(b.status, 'CEKA'); assert.equal(b.attempts, 1); assert.match(b.lastError, /421/); assert.equal(b.later, true, 'ponovni pokušaj kasnije');
    fail = false;
    await db.system(() => db.q(`UPDATE mail_outbox SET "nextAttemptAt"=now() - interval '1 second' WHERE "ref"=$1`, [ref]));
    await sch.tick(100);
    st = await db.system(() => db.q<any>(`SELECT "status" FROM mail_outbox WHERE "ref"=$1`, [ref]));
    assert.ok(st.every((x: any) => x.status === 'POSLANO'));
  } finally {
    process.env = env;
    await db.system(() => db.q(`DELETE FROM mail_outbox WHERE "ref"=$1`, [ref]));
    await db.onModuleDestroy();
  }
});
