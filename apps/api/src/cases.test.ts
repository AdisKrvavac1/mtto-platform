import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashCode, newTrackingCode, sniffAttachment } from './cases.controller';

test('predmeti: kod za praćenje i prepoznavanje priloga', () => {
  const c = newTrackingCode();
  assert.match(c, /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
  assert.equal(hashCode(c), hashCode(c.toLowerCase().replace('-', ' ')), 'kod se prihvata bez crtice i malim slovima');
  assert.notEqual(hashCode(c), hashCode(newTrackingCode()));
  assert.equal(sniffAttachment(Buffer.from('%PDF-1.7 test')), 'application/pdf');
  assert.equal(sniffAttachment(Buffer.from('MZ\x90\x00 exe')), null);
});

/** Tok predmeta nad pravom bazom: podnošenje, praćenje, dopuna (rok miruje), rješenje, sektori. */
test('predmeti: obrazac, prijem, status, dopuna i rješenje', { skip: !process.env.DATABASE_URL }, async () => {
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
  const tuđi = { user: { sub: `t-ref-${id()}`, name: 'Test Referent Trgovina', role: 'REFERENT', sectors: ['Trgovina'] } };
  let fid = '';
  try {
    await withTenant('mtto', async () => {
      await db.insert('users', { id: admin.user.sub, email: `${admin.user.sub}@test.local`, name: admin.user.name, role: 'ADMIN', passwordHash: 'x' });
      const form = await ctl.createForm({ title: `Test obrazac ${id().slice(0, 6)}`, sector: 'Turizam', slaDays: 10, attachments: 'OPCIONO', active: true,
        fields: [{ label: 'Naziv objekta', type: 'text', required: true }, { label: 'Ležaji', type: 'integer' }] }, admin);
      fid = form.id;
      const pf: any = await pub.form(form.slug);
      assert.equal(pf.fields.length, 2);
      assert.equal(pf.id, undefined, 'javni obrazac ne otkriva interni id');

      await assert.rejects(pub.submit(form.slug, { data: JSON.stringify({ lezaji: 'x' }), applicantName: 'Ana Test', applicantEmail: 'ana@example.org', consent: 'true' }), /Naziv objekta: obavezno/);
      await assert.rejects(pub.submit(form.slug, { data: '{"nazivObjekta":"A"}', applicantName: 'Ana Test', consent: 'true' }), /e-mail ili telefon/);
      await assert.rejects(pub.submit(form.slug, { data: '{"nazivObjekta":"A"}', applicantName: 'Ana Test', applicantEmail: 'ana@example.org' }), /saglasnost/);
      const pdf = { buffer: Buffer.from('%PDF-1.4 test'), originalname: 'rjesenje.pdf', size: 13 } as any;
      const r = await pub.submit(form.slug, { data: JSON.stringify({ nazivObjekta: 'Hotel Test', lezaji: '20' }), applicantName: 'Ana Test', applicantEmail: 'ANA@example.org', consent: 'true' }, [pdf]);
      assert.match(r.number, /^MTTO-\d{4}-\d{5}$/);
      const r2 = await pub.submit(form.slug, { data: '{"nazivObjekta":"B"}', applicantName: 'Bob Test', applicantPhone: '036 000 000', consent: 'true' });
      assert.equal(Number(r2.number.slice(-5)), Number(r.number.slice(-5)) + 1, 'brojevi idu redom');
      await assert.rejects(pub.submit(form.slug, { data: '{}' }, [{ buffer: Buffer.from('MZ'), originalname: 'x.exe' } as any]), /obavezno|PDF/);

      await assert.rejects(pub.status({ number: r.number, code: 'AAAA-AAAA' }), /nije pronađen/);
      let st: any = await pub.status({ number: r.number.toLowerCase(), code: r.code });
      assert.equal(st.status, 'ZAPRIMLJEN');
      assert.equal(st.events.length, 1);

      const list: any = await ctl.cases({ form: fid }, admin);
      const cid = list.items.find((x: any) => x.number === r.number).id;
      const full: any = await ctl.get(cid);
      assert.equal(full.trackingHash, undefined, 'hash koda se ne šalje u CMS');
      assert.equal(full.files.length, 1);
      assert.equal(full.data.lezaji, 20);

      await assert.rejects(ctl.setStatus(cid, { status: 'U_OBRADI' }, tuđi), /svojih sektora/);
      await assert.rejects(ctl.setStatus(cid, { status: 'RIJESEN' }, admin), /obavještenje/);
      const u: any = await ctl.setStatus(cid, { status: 'U_OBRADI' }, admin);
      assert.equal(u.assigneeId, admin.user.sub, 'ko počne obradu, preuzima predmet');
      await ctl.note(cid, { note: 'Interna bilješka za tim' }, admin);
      const dueBefore = new Date(u.dueAt).getTime();
      await ctl.setStatus(cid, { status: 'DOPUNA', message: 'Dostavite dokaz o pravu korištenja objekta.' }, admin);
      await assert.rejects(pub.supplement({ number: r2.number, code: r2.code, note: 'x' }), /ne čeka dopunu/);
      await pub.supplement({ number: r.number, code: r.code, note: 'Šaljem ugovor o zakupu.' }, [pdf]);
      // vrati vrijeme ulaska u dopunu 2 dana unazad: rok se mora produžiti za ~2 dana
      await db.q(`UPDATE case_events SET "createdAt"=now() - interval '2 days' WHERE "caseId"=$1 AND "toStatus"='DOPUNA'`, [cid]);
      const back: any = await ctl.setStatus(cid, { status: 'U_OBRADI' }, admin);
      const days = (new Date(back.dueAt).getTime() - dueBefore) / 86400_000;
      assert.ok(days > 1.9 && days < 2.1, `rok produžen za vrijeme dopune (${days.toFixed(2)} dana)`);
      await assert.rejects(ctl.setStatus(cid, { status: 'ZAPRIMLJEN' }, admin), /ne može preći/);
      const done: any = await ctl.setStatus(cid, { status: 'RIJESEN', message: 'Rješenje o kategorizaciji izdato; preuzmite ga u Ministarstvu.' }, admin);
      assert.ok(done.closedAt);

      st = await pub.status({ number: r.number, code: r.code });
      assert.equal(st.status, 'RIJESEN');
      // e-mail obavještenja podnosiocu: potvrda (s kodom), dopuna, ponovo u obradi, rješenje
      const mails = await db.q<any>(`SELECT "to","subject","text" FROM mail_outbox WHERE "ref"=$1 ORDER BY "createdAt"`, [cid]);
      const toApplicant = mails.filter((m) => m.to === 'ana@example.org');
      assert.equal(toApplicant.length, 5, 'prijem, u obradi, dopuna, ponovo u obradi, riješen');
      assert.ok(mails.some((m) => m.to === `${admin.user.sub}@test.local` && /Dopuna stigla/.test(m.subject)), 'referent dobija obavijest o dopuni');
      assert.ok(mails[0].text.includes(r.code) && mails[0].subject.includes(r.number), 'potvrda sadrži broj i kod');
      assert.ok(mails.some((m) => /dopuna/i.test(m.subject) || /dopuna/i.test(m.text)));
      assert.ok(mails.at(-1).text.includes('Rješenje o kategorizaciji izdato'));
      assert.ok(!mails.some((m) => m.text.includes('Interna bilješka')), 'interne bilješke ne idu podnosiocu');
      assert.ok(!st.events.some((e: any) => /Interna bilješka/.test(e.note)), 'interne bilješke se ne vide javno');
      assert.ok(st.events.some((e: any) => /dokaz o pravu/.test(e.note)));
      assert.ok(st.events.some((e: any) => /ugovor o zakupu/.test(e.note)));
      await assert.rejects(ctl.assign(cid, { assigneeId: tuđi.user.sub }, admin), /referentu|sektoru/);
    });
  } finally {
    await withTenant('mtto', async () => {
      if (fid) { await db.q(`DELETE FROM mail_outbox WHERE "ref" IN (SELECT "id" FROM cases WHERE "formId"=$1)`, [fid]); await db.q(`DELETE FROM cases WHERE "formId"=$1`, [fid]); await db.q(`DELETE FROM forms WHERE "id"=$1`, [fid]); }
      await db.q(`DELETE FROM users WHERE "id"=$1`, [admin.user.sub]);
    });
    await db.onModuleDestroy();
  }
});
