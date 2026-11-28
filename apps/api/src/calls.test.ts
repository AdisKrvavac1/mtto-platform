import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phase, publicAward } from './calls.controller';

test('pozivi: faze poziva i javni prikaz korisnika', () => {
  const now = Date.parse('2027-03-10T12:00:00Z');
  const c = { published: true, resultsPublished: false, opensAt: new Date('2027-03-01'), closesAt: new Date('2027-03-31') };
  assert.equal(phase({ ...c, published: false }, now), 'NACRT');
  assert.equal(phase(c, now), 'OTVOREN');
  assert.equal(phase(c, Date.parse('2027-02-01')), 'NAJAVLJEN');
  assert.equal(phase(c, Date.parse('2027-04-02')), 'ZATVOREN');
  assert.equal(phase({ ...c, resultsPublished: true }, now), 'REZULTATI');
  const a = { id: 'x', callId: 'c', beneficiary: 'Ana Anić', beneficiaryType: 'FIZICKO' as const, municipality: 'Mostar', project: 'P', amount: '1500.00', caseId: null, position: 1 };
  assert.equal(publicAward(a).beneficiary, 'Fizičko lice', 'ime fizičkog lica se ne objavljuje');
  assert.equal(publicAward({ ...a, beneficiaryType: 'PRAVNO', beneficiary: 'Firma d.o.o.' }).beneficiary, 'Firma d.o.o.');
  assert.equal(publicAward(a).amount, 1500);
});

/** Prijava kroz obrazac samo dok je poziv otvoren; lista korisnika vidljiva tek nakon objave. */
test('pozivi: rok prijave, prijava kao predmet, lista korisnika', { skip: !process.env.DATABASE_URL }, async () => {
  process.env.ALTCHA_ENABLED = 'false';
  const { Db, withTenant, id } = await import('./db');
  const { AuditService } = await import('./audit');
  const { FileStore } = await import('./storage');
  const { CasesController, PublicCasesController } = await import('./cases.controller');
  const { CallsController, PublicCallsController } = await import('./calls.controller');
  const db = new Db();
  const audit = new AuditService(db);
  const cases = new CasesController(db, new FileStore(), audit);
  const pubCases = new PublicCasesController(db, new FileStore());
  const ctl = new CallsController(db, audit);
  const pub = new PublicCallsController(db);
  const admin = { user: { sub: `t-adm-${id()}`, name: 'Test Admin', role: 'ADMIN', sectors: [] } };
  const referent = { user: { sub: `t-ref-${id()}`, name: 'Test Referent', role: 'REFERENT', sectors: ['Turizam'] } };
  let fid = '', cid = '';
  try {
    await withTenant('mtto', async () => {
      await db.insert('users', { id: admin.user.sub, email: `${admin.user.sub}@test.local`, name: admin.user.name, role: 'ADMIN', passwordHash: 'x' });
      const form = await cases.createForm({ title: `Prijava poziv ${id().slice(0, 6)}`, sector: 'Turizam', slaDays: 30, attachments: 'NE', active: true,
        fields: [{ key: 'nazivProjekta', label: 'Naziv projekta', type: 'text', required: true }, { key: 'trazeniIznos', label: 'Traženi iznos', type: 'number' }] }, admin);
      fid = form.id;
      const future = Date.now() + 86400_000;
      const call: any = await ctl.create({ title: `Test poziv ${id().slice(0, 6)}`, sector: 'Turizam', opensAt: new Date(future).toISOString(), closesAt: new Date(future + 10 * 86400_000).toISOString(), budget: '20.000,00', formId: fid }, admin);
      cid = call.id;
      assert.equal(Number(call.budget), 20000, 'iznos u domaćem formatu');
      await assert.rejects(ctl.create({ title: 'x', opensAt: '2027-02-01', closesAt: '2027-01-01' }, admin), /poslije početka/);
      await assert.rejects(ctl.create({ title: 'y', opensAt: '2027-01-01', closesAt: '2027-02-01', formId: fid }, admin), /već vezan/);

      const body = { data: JSON.stringify({ nazivProjekta: 'Biciklistička staza', trazeniIznos: '5000' }), applicantName: 'Udruženje Test', applicantEmail: 'test@example.org', consent: 'true' };
      await assert.rejects(pubCases.submit(form.slug, body), /još nije otvoren/, 'neobjavljen poziv');
      await assert.rejects(ctl.update(cid, { published: true }, referent), /urednik ili administrator/, 'referent ne objavljuje');
      await ctl.update(cid, { published: true }, admin);
      await assert.rejects(pubCases.submit(form.slug, body), /još nije otvoren/, 'prije početka roka');
      await ctl.update(cid, { opensAt: new Date(Date.now() - 3600_000).toISOString() }, admin);
      const r = await pubCases.submit(form.slug, body);
      assert.match(r.number, /^MTTO-/);
      const det: any = await ctl.one(cid, admin);
      assert.equal(det.applications.length, 1);
      assert.equal(det.applications[0].project, 'Biciklistička staza');

      let p: any = await pub.one(call.slug);
      assert.equal(p.phase, 'OTVOREN'); assert.equal(p.form.slug, form.slug); assert.equal(p.awards.length, 0); assert.equal(p.applications, 1);

      await ctl.update(cid, { closesAt: new Date(Date.now() - 60_000).toISOString() }, admin);
      await assert.rejects(pubCases.submit(form.slug, body), /istekao/);

      const parsed: any = await ctl.parse(cid, { csv: 'Korisnik;Općina;Projekat;Iznos;Vrsta\nUdruženje Test;Mostar;Biciklistička staza;4.500,00;pravno lice\nMarko Marić;Konjic;Etno kuća;2500;fizičko lice\n;Mostar;x;1' });
      assert.equal(parsed.awards.length, 3); assert.equal(parsed.errors.length, 1);
      assert.equal(parsed.awards[0].amount, 4500); assert.equal(parsed.awards[1].beneficiaryType, 'FIZICKO');
      const saved: any = await ctl.awards(cid, { awards: parsed.awards.slice(0, 2) }, admin);
      assert.equal(saved.count, 2); assert.equal(saved.total, 7000); assert.equal(saved.overBudget, false);

      p = await pub.one(call.slug);
      assert.equal(p.awards.length, 0, 'lista nije javna prije objave');
      await ctl.update(cid, { resultsPublished: true }, admin);
      p = await pub.one(call.slug);
      assert.equal(p.phase, 'REZULTATI'); assert.equal(p.awards.length, 2); assert.equal(p.awarded, 7000);
      assert.equal(p.awards[1].beneficiary, 'Fizičko lice');
      const list: any = await pub.list('zatvoreni');
      assert.ok(list.some((x: any) => x.slug === call.slug && x.awards === 2));
      await assert.rejects(ctl.remove(cid, admin), /ima prijave/);
    });
  } finally {
    await withTenant('mtto', async () => {
      if (fid) { await db.q(`DELETE FROM mail_outbox WHERE "ref" IN (SELECT "id" FROM cases WHERE "formId"=$1)`, [fid]); await db.q(`DELETE FROM cases WHERE "formId"=$1`, [fid]); }
      if (cid) await db.q(`DELETE FROM calls WHERE "id"=$1`, [cid]);
      if (fid) await db.q(`DELETE FROM forms WHERE "id"=$1`, [fid]);
      await db.q(`DELETE FROM users WHERE "id"=$1`, [admin.user.sub]);
    });
    await db.onModuleDestroy();
  }
});
