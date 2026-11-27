import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';

/** Urednički tok objava (F2-01) nad pravom bazom. Radi uz DATABASE_URL (lokalno i u CI-ju). */
test('objave: saradnik šalje, urednik vraća/objavljuje/povlači, četiri oka, verzije', { skip: !process.env.DATABASE_URL }, async () => {
  const { Db, withTenant, id } = await import('./db');
  const { AuditService } = await import('./audit');
  const { PostsController } = await import('./posts.controller');
  const db = new Db();
  const { JwtService } = await import('@nestjs/jwt');
  const jwt = new JwtService({ secret: 'test-secret-test-secret-test-secret' });
  const ctl = new PostsController(db, new AuditService(db), jwt);
  const autor = { user: { sub: `t-autor-${id()}`, name: 'Test Autor', role: 'SARADNIK' } };
  const urednik = { user: { sub: `t-ured-${id()}`, name: 'Test Urednik', role: 'UREDNIK' } };
  const admin = { user: { sub: `t-adm-${id()}`, name: 'Test Admin', role: 'ADMIN' } };
  const ids: string[] = [];
  try {
    await withTenant('mtto', async () => {
      const p = await ctl.create({ title: 'Test toka (automatski test)', body: 'v1' }, autor);
      ids.push(p.id);
      assert.equal(p.status, 'NACRT');
      await assert.rejects(ctl.workflow(p.id, { action: 'publish' }, autor), /urednik/);
      await assert.rejects(ctl.update(p.id, { status: 'OBJAVLJENO' }, autor), /radnjama/);
      await ctl.update(p.id, { body: 'v2' }, autor);
      assert.equal((await ctl.workflow(p.id, { action: 'submit' }, autor)).status, 'NA_ODOBRENJU');
      await assert.rejects(ctl.update(p.id, { body: 'x' }, autor), /čeka odobrenje/);
      await assert.rejects(ctl.workflow(p.id, { action: 'return' }, urednik), /doraditi/);
      assert.equal((await ctl.workflow(p.id, { action: 'return', note: 'Dodajte rok.' }, urednik)).status, 'VRACENO');
      await ctl.workflow(p.id, { action: 'submit' }, autor);
      const pub = await ctl.workflow(p.id, { action: 'publish' }, urednik);
      assert.equal(pub.status, 'OBJAVLJENO');
      assert.ok(pub.publishedAt);
      await assert.rejects(ctl.workflow(p.id, { action: 'withdraw' }, urednik), /razlog/);
      assert.equal((await ctl.workflow(p.id, { action: 'withdraw', note: 'Greška u iznosu' }, urednik)).status, 'POVUCENO');
      const vs = await ctl.versions(p.id);
      assert.equal(vs[0].status, 'POVUCENO');
      assert.ok(vs.length >= 7, `očekivano ≥7 verzija, ima ${vs.length}`);
      const restored = await ctl.restore(p.id, '1', urednik);
      assert.equal(restored.body, 'v1');

      // četiri oka: urednik ne objavljuje svoju objavu, administrator može
      const prev = await db.one<any>(`SELECT "settings" FROM tenants WHERE "id"='mtto'`);
      await db.q(`UPDATE tenants SET "settings" = "settings" || '{"fourEyes":true}'::jsonb WHERE "id"='mtto'`);
      try {
        const own = await ctl.create({ title: 'Četiri oka (automatski test)' }, urednik);
        ids.push(own.id);
        await assert.rejects(ctl.workflow(own.id, { action: 'publish' }, urednik), /četiri oka/);
        const adminOwn = await ctl.create({ title: 'Admin (automatski test)' }, admin);
        ids.push(adminOwn.id);
        assert.equal((await ctl.workflow(adminOwn.id, { action: 'publish' }, admin)).status, 'OBJAVLJENO');
      } finally {
        await db.q(`UPDATE tenants SET "settings" = $1::jsonb WHERE "id"='mtto'`, [JSON.stringify(prev?.settings ?? {})]);
      }

      // link za pregled: radi za nacrt, ne radi s tuđim ili lažnim tokenom
      const { PreviewController } = await import('./posts.controller');
      const pv = new PreviewController(db, jwt);
      const fakeRes: any = { setHeader() {} };
      const draft = await ctl.create({ title: 'Pregled (automatski test)' }, autor);
      ids.push(draft.id);
      const link = await ctl.previewLink(draft.id, autor);
      const token = link.url.split('/pregled/')[1];
      assert.equal((await pv.preview(token, fakeRes)).title, 'Pregled (automatski test)');
      await assert.rejects(pv.preview(token.slice(0, -2) + 'xx', fakeRes), /nije ispravan/);
      const foreign = await jwt.signAsync({ purpose: 'preview', pid: draft.id, tid: 'drugi' });
      await assert.rejects(pv.preview(foreign, fakeRes), /nije ispravan/);
      const session = await jwt.signAsync({ sub: 'x', name: 'x', role: 'ADMIN' });
      await assert.rejects(pv.preview(session, fakeRes), /nije ispravan/);

      // zakazivanje traži budući datum
      const s = await ctl.create({ title: 'Zakazano (automatski test)' }, urednik);
      ids.push(s.id);
      await assert.rejects(ctl.workflow(s.id, { action: 'schedule', publishedAt: '2020-01-01T00:00:00Z' }, urednik), /budući/);
      const future = new Date(Date.now() + 3600_000).toISOString();
      assert.equal((await ctl.workflow(s.id, { action: 'schedule', publishedAt: future }, urednik)).status, 'ZAKAZANO');
    });
  } finally {
    await withTenant('mtto', () => db.q(`DELETE FROM posts WHERE "id" = ANY($1)`, [ids]));
    await db.pool.end();
  }
});
