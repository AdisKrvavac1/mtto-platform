import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTenant } from './tenant';

const list = [
  { id: 'mtto', name: 'MTTO', shortName: 'MTTO', domains: ['mtto.gov.ba', 'localhost'], theme: {}, active: true },
  { id: 'mostar', name: 'Grad Mostar', shortName: 'Mostar', domains: ['mostar.ba'], theme: {}, active: true },
];

test('institucija: zaglavlje, pa domena, pa zadana', () => {
  assert.equal(resolveTenant(list, 'mostar', 'mtto.gov.ba'), 'mostar');
  assert.equal(resolveTenant(list, undefined, 'mostar.ba:443'), 'mostar');
  assert.equal(resolveTenant(list, undefined, 'mostar.ba, proxy.internal'), 'mostar');
  assert.equal(resolveTenant(list, 'nepostojeca', 'nepoznato.ba'), 'mtto');
  assert.equal(resolveTenant(list, '*', undefined), 'mtto', "'*' (sistem) se ne smije dobiti iz zaglavlja");
});

/** Izolacija u bazi (RLS). Radi samo uz DATABASE_URL (lokalno i u CI-ju). */
test('RLS: institucija ne vidi i ne mijenja tuđe podatke', { skip: !process.env.DATABASE_URL }, async () => {
  const { Db, withTenant, SYSTEM_TENANT, id } = await import('./db');
  const db = new Db();
  const T = 'test-izolacija';
  try {
    await db.system(() => db.q(`INSERT INTO tenants ("id","name","shortName") VALUES ($1,'Test','Test') ON CONFLICT DO NOTHING`, [T]));
    const pid = id();
    await withTenant(T, () => db.insert('posts', { id: pid, slug: 'ista-adresa', title: 'Tuđa objava', body: 'x', status: 'OBJAVLJENO', type: 'VIJEST', category: 'Opće', publishedAt: new Date() }));

    // ista adresa (slug) dozvoljena u drugoj instituciji
    const mid = id();
    await withTenant('mtto', () => db.insert('posts', { id: mid, slug: 'ista-adresa', title: 'Naša objava', body: 'y', status: 'NACRT', type: 'VIJEST', category: 'Opće' }));

    const seenByMtto = await withTenant('mtto', () => db.q(`SELECT "id" FROM posts WHERE "slug"='ista-adresa'`));
    assert.deepEqual(seenByMtto.map((r) => r.id), [mid], 'mtto vidi samo svoju objavu');
    const seenByT = await withTenant(T, () => db.q(`SELECT "id","tenantId" FROM posts`));
    assert.deepEqual(seenByT.map((r) => r.id), [pid], 'test institucija vidi samo svoju objavu');
    assert.equal(seenByT[0].tenantId, T, 'tenantId se postavlja sam iz sesije');

    // izmjena i brisanje tuđeg reda ne diraju ništa
    const upd = await withTenant('mtto', () => db.q(`UPDATE posts SET "title"='hak' WHERE "id"=$1 RETURNING "id"`, [pid]));
    assert.equal(upd.length, 0);
    const del = await withTenant('mtto', () => db.q(`DELETE FROM posts WHERE "id"=$1 RETURNING "id"`, [pid]));
    assert.equal(del.length, 0);

    // upis u tuđu instituciju odbija baza (WITH CHECK)
    await assert.rejects(withTenant('mtto', () => db.insert('posts', { id: id(), tenantId: T, slug: 'podmetnuto', title: 't', body: 'b', status: 'NACRT', type: 'VIJEST', category: 'Opće' })), /row-level security/);

    // dnevnik: lanac po instituciji ostaje ispravan
    await withTenant(T, () => db.insert('audit_log', { id: id(), userName: 'Test', action: 'Test lanca', target: '' }));
    const chain = await withTenant(T, () => db.q(`SELECT "prevHash" FROM audit_log ORDER BY "seq"`));
    assert.equal(chain[0].prevHash, null, 'prvi zapis nove institucije počinje novi lanac');

    // sistem vidi obje
    const all = await db.system(() => db.q(`SELECT "id" FROM posts WHERE "slug"='ista-adresa'`));
    assert.equal(all.length, 2);
    void SYSTEM_TENANT;
  } finally {
    await db.system(async () => {
      await db.q(`DELETE FROM posts WHERE "tenantId"=$1 OR ("slug"='ista-adresa' AND "tenantId"='mtto')`, [T]);
      await db.q(`ALTER TABLE audit_log DISABLE TRIGGER audit_log_immutable`).catch(() => {});
      await db.q(`DELETE FROM audit_log WHERE "tenantId"=$1`, [T]).catch(() => {});
      await db.q(`ALTER TABLE audit_log ENABLE TRIGGER audit_log_immutable`).catch(() => {});
      await db.q(`DELETE FROM tenants WHERE "id"=$1`, [T]).catch(() => {});
    });
    await db.pool.end();
  }
});
