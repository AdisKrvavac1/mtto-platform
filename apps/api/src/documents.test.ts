import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { retainUntil } from './documents.controller';

test('rok čuvanja: od prestanka važenja, inače od donošenja; trajno = bez datuma', () => {
  assert.equal(retainUntil('GODINA_5', { validUntil: '2026-03-01', issuedAt: '2020-01-01' }), '2031-03-01');
  assert.equal(retainUntil('GODINA_10', { issuedAt: '2020-06-15' }), '2030-06-15');
  assert.equal(retainUntil('TRAJNO', { issuedAt: '2020-06-15' }), null);
});

/** Dokumentacijski centar nad pravom bazom (DATABASE_URL). */
test('dokumenti: verzije, interni se ne vide javno, izlučivanje samo po isteku i bez zabrane', { skip: !process.env.DATABASE_URL }, async () => {
  const { Db, withTenant } = await import('./db');
  const { AuditService } = await import('./audit');
  const { FileStore } = await import('./storage');
  const { DocumentsController } = await import('./documents.controller');
  const { PublicController } = await import('./public.controller');
  const db = new Db();
  const files = new FileStore();
  const ctl = new DocumentsController(db, files, new AuditService(db));
  const pub = new PublicController(db, files);
  const req = { user: { sub: 'test-adm', name: 'Test Admin', role: 'ADMIN' } };
  const urednik = { user: { sub: 'test-ured', name: 'Test Urednik', role: 'UREDNIK' } };
  const pdf = (txt: string) => ({ buffer: Buffer.from(`%PDF-1.4\n${txt}`), mimetype: 'application/pdf', originalname: `${txt}.pdf`, size: 20 }) as any;
  const ids: string[] = [];
  try {
    await withTenant('mtto', async () => {
      const d = await ctl.upload(pdf('v1'), { title: 'Pravilnik (automatski test)', docType: 'PRAVILNIK', keywords: 'turizam, Taksa ,turizam' }, req);
      ids.push(d.id);
      let full = await ctl.get(d.id);
      assert.equal(full.retentionClass, 'TRAJNO', 'pravilnik se čuva trajno');
      assert.deepEqual(full.keywords, ['turizam', 'taksa']);

      const v2 = await ctl.replaceFile(d.id, pdf('v2'), { note: 'Ispravljena greška u čl. 3' }, req);
      assert.equal(v2.version, 2);
      full = await ctl.get(d.id);
      assert.equal(full.versions.length, 1);
      assert.equal(full.versions[0].note, 'Ispravljena greška u čl. 3');

      const i = await ctl.upload(pdf('int'), { title: 'Interna bilješka (automatski test)', accessLevel: 'INTERNO', docType: 'OSTALO' }, req);
      ids.push(i.id);
      const list = await pub.documents({ q: 'automatski test' });
      assert.ok(list.some((x: any) => x.id === d.id), 'javni dokument je na listi');
      assert.ok(!list.some((x: any) => x.id === i.id), 'interni dokument nije na javnoj listi');
      const res: any = { setHeader() {}, send() {} };
      await assert.rejects(pub.file(i.id, res), /Not Found/);

      // izlučivanje: rok mora isteći, zabrana ga sprječava, treba osnov
      const old = await ctl.upload(pdf('old'), { title: 'Stari obrazac (automatski test)', docType: 'OBRAZAC', issuedAt: '2010-01-01', retentionClass: 'GODINA_2' }, req);
      ids.push(old.id);
      await assert.rejects(ctl.dispose(d.id, { note: 'Zapisnik 1/2026' }, req), /nije istekao/);
      await assert.rejects(ctl.update(old.id, { legalHold: true }, urednik), /administrator/);
      await ctl.update(old.id, { legalHold: true }, req);
      await assert.rejects(ctl.dispose(old.id, { note: 'Zapisnik 1/2026' }, req), /zabrana/);
      await ctl.update(old.id, { legalHold: false }, req);
      await assert.rejects(ctl.dispose(old.id, { note: '' }, req), /osnov/);
      await ctl.dispose(old.id, { note: 'Zapisnik komisije 1/2026' }, req);
      const gone = await ctl.get(old.id);
      assert.equal(gone.status, 'ARHIVIRAN');
      assert.ok(gone.disposedAt);
      await assert.rejects(ctl.update(old.id, { title: 'x' }, req), /izlučen/);
    });
  } finally {
    await withTenant('mtto', () => db.q(`DELETE FROM documents WHERE "id" = ANY($1)`, [ids]));
    await db.pool.end();
  }
});
