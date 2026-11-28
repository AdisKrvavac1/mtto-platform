import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fold, latin, snippet, stem, stripHtml, terms } from './search';

test('pretraga: dijakritike, ćirilica, nastavci, isječak', () => {
  assert.equal(fold('Ćevapi i ŠTRUDLA, Međugorje'), 'cevapi i strudla, medugorje');
  assert.equal(fold('Medjugorje'), fold('Međugorje'), '„dj“ i „đ“ su isto');
  assert.equal(latin('Радно вријеме трговина'), 'Radno vrijeme trgovina');
  assert.equal(latin('Џеп Љубушки Њива'), 'Džep Ljubuški Njiva');
  assert.deepEqual(terms('Zaštita   okoliša, a'), ['zastita', 'okolisa'], 'jednoslovne riječi se ignorišu');
  assert.equal(stem('turisticka'), 'turistick');
  assert.equal(stem('otpad'), 'otpad', 'kratke riječi ostaju');
  assert.equal(stripHtml('<p>Rok&nbsp;je <b>15</b> dana.</p><script>x()</script>'), 'Rok je 15 dana.');
  const s = snippet('Upisnik turističkih zajednica kantona', ['turistick']);
  assert.equal(s.text.slice(s.marks[0][0], s.marks[0][1]), 'turističk', 'isticanje radi i s kvačicama');
});

test('pretraga: indeks i upiti', { skip: !process.env.DATABASE_URL }, async () => {
  const { Db, withTenant } = await import('./db');
  const { SearchIndexer, SearchController } = await import('./search');
  const db = new Db();
  try {
    const idx = new SearchIndexer(db);
    const n = await idx.refresh('mtto', true);
    assert.ok((n ?? 0) > 10, 'indeks izgrađen');
    await withTenant('mtto', async () => {
      const c = new SearchController(db);
      const a: any = await c.search({ q: 'zastita okolisa' });
      assert.ok(a.items.some((i: any) => i.url === '/zastita-okolisa'), 'bez kvačica nađe „Zaštita okoliša“');
      const b: any = await c.search({ q: 'радно вријеме трговина' });
      assert.ok(b.items.some((i: any) => i.url === '/trgovina/neradni-dani'), 'ćirilica');
      const k: any = await c.search({ q: 'zraka', vrsta: 'STRANICA' });
      assert.ok(k.items.every((i: any) => i.kind === 'STRANICA'));
      assert.ok(k.facets.kind.length >= 1, 'fasete uključuju sve vrste i uz filter');
      const f: any = await c.search({ q: 'kvalitet zraak' });
      assert.ok(f.total > 0 && f.fuzzy, 'tipfeler daje slične naslove');
      assert.equal(f.suggestion, 'kvalitet zraka');
      const none: any = await c.search({ q: 'qqqxxxzzz' });
      assert.equal(none.total, 0);
      const sug: any = await c.suggestions('boravi');
      assert.equal(sug[0].url, '/turizam-i-bastina/boravisna-taksa');
      const logged = await db.one<any>(`SELECT "hits" FROM search_queries WHERE "query"='qqqxxxzzz' ORDER BY "day" DESC LIMIT 1`);
      assert.equal(logged.hits, 0, 'upit bez rezultata se bilježi');
      await db.q(`DELETE FROM search_queries WHERE "query" IN ('qqqxxxzzz','kvalitet zraak','zraka','zastita okolisa','radno vrijeme trgovina')`);
    });
  } finally { await db.onModuleDestroy(); }
});

test('životne situacije: koraci, linkovi, provjera i pretraga', { skip: !process.env.DATABASE_URL }, async () => {
  const { Db, withTenant, id } = await import('./db');
  const { AuditService } = await import('./audit');
  const { LifeEventsController, PublicLifeEventsController, cleanSteps } = await import('./life-events.controller');
  const { SearchIndexer, SearchController } = await import('./search');
  assert.throws(() => cleanSteps([{ title: '' }]), /naslov je obavezan/);
  assert.throws(() => cleanSteps([{ title: 'A', links: [{ label: 'x', url: 'javascript:alert(1)' }] }]), /počinje s \/ ili https/);
  const db = new Db();
  const admin = { user: { sub: `t-${id()}`, role: 'ADMIN', name: 'T' } }, ref = { user: { sub: `t-${id()}`, role: 'REFERENT', name: 'R' } };
  let eid = '';
  try {
    await withTenant('mtto', async () => {
      const ctl = new LifeEventsController(db, new AuditService(db));
      const pub = new PublicLifeEventsController(db);
      const seeded: any[] = await pub.list();
      assert.ok(seeded.length >= 10 && seeded.every((e) => !e.verified), 'početne situacije su „u pripremi“');
      const e: any = await ctl.create({ title: 'Test situacija zlatoperka' }, admin);
      eid = e.id;
      await ctl.update(eid, { steps: [{ title: 'Prvi korak', text: 'Opis', links: [{ label: 'Status', url: '/e-usluge/status' }] }], published: true, keywords: 'zlatoperka' }, admin);
      const d: any = await pub.one(e.slug);
      assert.equal(d.steps[0].links[0].url, '/e-usluge/status');
      assert.equal(d.keywords, undefined, 'interna polja se ne objavljuju');
      await assert.rejects(ctl.update(eid, { verified: true }, ref), /urednik ili administrator/);
      await new SearchIndexer(db).refresh('mtto', true);
      const r: any = await new SearchController(db).search({ q: 'zlatoperka' });
      assert.equal(r.items[0]?.url, `/zivotne-situacije/${e.slug}`, 'nova situacija je u pretrazi');
      await db.q(`DELETE FROM search_queries WHERE "query"='zlatoperka'`);
    });
  } finally {
    if (eid) await withTenant('mtto', () => db.q(`DELETE FROM life_events WHERE "id"=$1`, [eid]));
    await db.onModuleDestroy();
  }
});
