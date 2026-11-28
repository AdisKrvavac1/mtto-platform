import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { route } from './cases.controller';

test('prijava inspekciji: pravila usmjeravanja', () => {
  const rules = [
    { field: 'vrsta', equals: 'Zaštita okoliša', sector: 'Zaštita okoliša', label: 'Okolišna inspekcija' },
    { field: 'vrsta', equals: '*', sector: 'Inspekcija', label: 'Tržišna inspekcija' },
  ];
  assert.equal(route(rules, { vrsta: 'Zaštita okoliša' })?.label, 'Okolišna inspekcija');
  assert.equal(route(rules, { vrsta: 'Radno vrijeme' })?.label, 'Tržišna inspekcija');
  assert.equal(route([], { vrsta: 'x' }), null);
});

/** F2-12 / F2-19 nad bazom: anonimna prijava, zaštita identiteta, usmjeravanje, prosljeđivanje. */
test('prijava inspekciji: anonimno, zaštićen identitet, usmjeravanje i prosljeđivanje', { skip: !process.env.DATABASE_URL }, async () => {
  process.env.ALTCHA_ENABLED = 'false';
  const { Db, withTenant, id } = await import('./db');
  const { AuditService } = await import('./audit');
  const { FileStore } = await import('./storage');
  const { CasesController, PublicCasesController } = await import('./cases.controller');
  const db = new Db();
  const files = new FileStore();
  const pub = new PublicCasesController(db, files);
  const ctl = new CasesController(db, files, new AuditService(db));
  const admin = { user: { sub: `t-adm-${id()}`, name: 'Test Admin', role: 'ADMIN', sectors: [] } };
  const trgovina = { user: { sub: `t-ref-${id()}`, name: 'Test Referent Trgovina', role: 'REFERENT', sectors: ['Trgovina'] } };
  const ids: string[] = [];
  try {
    await withTenant('mtto', async () => {
      const f: any = await pub.form('prijava-inspekciji');
      assert.equal(f.allowAnonymous, true);
      assert.equal(f.protectIdentity, true);
      const data = (vrsta: string) => JSON.stringify({ vrsta, opcina: 'Mostar', subjekt: 'Test market (demo)', adresa: 'Ulica 1', datum: '2026-11-22', opis: 'Radi u nedjelju.' });

      // anonimno: bez imena i kontakta, i kad ih pošalje, ne čuvaju se
      const a = await pub.submit('prijava-inspekciji', { data: data('Rad nedjeljom ili praznikom'), anonymous: 'true', applicantName: 'Neko Ime', applicantEmail: 'x@example.org' });
      assert.equal(a.anonymous, true);
      assert.equal(a.emailQueued, false);
      const ka = await db.one<any>(`SELECT * FROM cases WHERE "number"=$1`, [a.number]);
      ids.push(ka.id);
      assert.equal(ka.applicantName, null);
      assert.equal(ka.applicantEmail, null);
      assert.equal(ka.sector, 'Inspekcija');
      assert.equal(ka.routedTo, 'Tržišna inspekcija');
      await assert.rejects(ctl.reveal(ka.id, { reason: 'Provjera navoda prijave' }, admin), /anonimna/);

      // s imenom: identitet skriven u CMS-u, otkriva se uz razlog i ostaje u dnevniku
      const n = await pub.submit('prijava-inspekciji', { data: data('Zaštita okoliša'), applicantName: 'Ana Prijaviteljica', applicantEmail: 'ana@example.org', consent: 'true' });
      const kn = await db.one<any>(`SELECT * FROM cases WHERE "number"=$1`, [n.number]);
      ids.push(kn.id);
      assert.equal(kn.sector, 'Zaštita okoliša', 'okolišna prijava ide sektoru okoliša');
      const view: any = await ctl.get(kn.id);
      assert.equal(view.identityMasked, true);
      assert.equal(view.applicantName, null);
      assert.equal(view.applicantEmail, null);
      const list: any = await ctl.cases({ status: 'SVI', q: 'Prijaviteljica' }, admin);
      assert.ok(!list.items.some((x: any) => x.id === kn.id), 'pretraga po imenu ne otkriva zaštićenog podnosioca');
      const list2: any = await ctl.cases({ status: 'SVI', q: n.number }, admin);
      assert.equal(list2.items[0].applicantName, 'Zaštićen identitet');
      await assert.rejects(ctl.reveal(kn.id, { reason: 'kratko' }, admin), /razlog/);
      await assert.rejects(ctl.reveal(kn.id, { reason: 'Potrebna izjava svjedoka' }, trgovina), /svojih sektora/);
      const who = await ctl.reveal(kn.id, { reason: 'Potrebna izjava svjedoka' }, admin);
      assert.equal(who.applicantName, 'Ana Prijaviteljica');
      const ev = await db.q<any>(`SELECT "kind","note" FROM case_events WHERE "caseId"=$1`, [kn.id]);
      assert.ok(ev.some((e) => e.kind === 'IDENTITET' && /svjedoka/.test(e.note)));

      // prosljeđivanje nadležnom organu zatvara predmet uz poruku
      await assert.rejects(ctl.setStatus(ka.id, { status: 'PROSLIJEDJEN' }, admin), /obavještenje/);
      const fw: any = await ctl.setStatus(ka.id, { status: 'PROSLIJEDJEN', message: 'Proslijeđeno Gradskoj inspekciji Mostar (provjera nadležnosti).' }, admin);
      assert.equal(fw.status, 'PROSLIJEDJEN');
      assert.ok(fw.closedAt);
      const st: any = await pub.status({ number: a.number, code: a.code });
      assert.equal(st.statusLabel, 'Proslijeđen nadležnom organu');
      assert.ok(st.events.some((e: any) => /Gradskoj inspekciji/.test(e.note)));
      const closed: any = await ctl.cases({ status: 'ZATVORENI', q: a.number }, admin);
      assert.equal(closed.total, 1);
    });
  } finally {
    await withTenant('mtto', async () => {
      if (ids.length) { await db.q(`DELETE FROM mail_outbox WHERE "ref" = ANY($1)`, [ids]); await db.q(`DELETE FROM cases WHERE "id" = ANY($1)`, [ids]); }
    });
    await db.onModuleDestroy();
  }
});
