import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanTranslations, localize } from './i18n';

test('prijevodi: provjera i zamjena polja', () => {
  const F = { title: 140, excerpt: 260, body: 1000 };
  assert.deepEqual(cleanTranslations({ en: { title: ' Hello ', excerpt: '', body: '<p>x</p>', extra: 'y' } }, F), { en: { title: 'Hello', body: '<p>x</p>' } });
  assert.deepEqual(cleanTranslations({ en: { title: '' } }, F), {}, 'prazan prijevod se ne čuva');
  assert.throws(() => cleanTranslations({ de: { title: 'x' } }, F), /Nepodržan jezik/);
  assert.throws(() => cleanTranslations({ en: { title: 'x'.repeat(141) } }, F), /najviše 140/);
  const row = { title: 'Naslov', excerpt: 'Sažetak', translations: { en: { title: 'Title' } } };
  const en = localize(row, 'en', ['title', 'excerpt']);
  assert.equal(en.title, 'Title'); assert.equal(en.excerpt, 'Sažetak', 'bez prijevoda ostaje izvornik'); assert.equal(en.translated, true);
  assert.equal((en as any).translations, undefined, 'prijevodi se ne šalju u cijelosti');
  const bs = localize(row, null, ['title']);
  assert.equal(bs.title, 'Naslov'); assert.equal(bs.translated, false); assert.equal(bs.lang, 'bs');
});
