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
    assert.equal(await idx.refresh('mtto'), null, 'bez izmjena nema ponovne izgradnje');
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
