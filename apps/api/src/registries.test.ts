import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coerce, keyFromLabel, mapHeader, normalizeFields, parseCsv, parseDate, parseNumber, toCsv, validateEntry } from './registry-core';

const FIELDS = normalizeFields([
  { label: 'Naziv', type: 'text', required: true, public: true, search: true },
  { key: 'broj', label: 'Broj rješenja', type: 'text', unique: true, public: true },
  { label: 'Općina', type: 'select', options: ['Mostar', 'Neum'], filter: true, public: true },
  { label: 'Ležaji', type: 'integer', public: true },
  { label: 'Vrijedi do', type: 'date', public: true },
  { label: 'Interna napomena', type: 'longtext' },
]);

test('registry builder: shema polja', () => {
  assert.equal(keyFromLabel('Broj ležaja u objektu'), 'brojLezajaUObjektu');
  assert.deepEqual(FIELDS.map((f) => f.key), ['naziv', 'broj', 'opcina', 'lezaji', 'vrijediDo', 'internaNapomena']);
  assert.throws(() => normalizeFields([]), /barem jedno polje/);
  assert.throws(() => normalizeFields([{ label: 'A', type: 'select' }]), /opciju/);
  assert.throws(() => normalizeFields([{ label: 'A' }, { label: 'a' }]), /ponavlja/);
  assert.throws(() => normalizeFields([{ key: 'status', label: 'Status' }]), /rezerviran/);
  assert.throws(() => normalizeFields([{ label: 'X', type: 'html' }]), /nepoznata/);
  // filter samo na izboru i da/ne
  assert.equal(normalizeFields([{ label: 'T', type: 'text', filter: true }])[0].filter, undefined);
});

test('registry builder: provjera vrijednosti', () => {
  assert.equal(parseDate('05.03.2026.'), '2026-03-05');
  assert.equal(parseDate('2026-02-30'), null);
  assert.equal(parseNumber('1.234,5'), 1234.5);
  assert.equal(parseNumber('43.343'), 43.343);
  assert.equal(parseNumber('1.234.567'), 1234567);
  assert.deepEqual(coerce(FIELDS[2], 'mostar'), { value: 'Mostar' });
  assert.match(coerce(FIELDS[2], 'Sarajevo').error!, /dozvoljeno/);
  assert.match(coerce(FIELDS[3], '2,5').error!, /cijeli/);
  const r = validateEntry(FIELDS, { naziv: '  Hotel  ', lezaji: '120', vrijediDo: '1.1.2030' });
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.data, { naziv: 'Hotel', lezaji: 120, vrijediDo: '2030-01-01' });
  assert.equal(validateEntry(FIELDS, {}).errors[0].field, 'naziv');
  // izmjena: polja kojih nema ostaju
  assert.deepEqual(validateEntry(FIELDS, { lezaji: '' }, { partial: true, previous: { naziv: 'A', lezaji: 3 } }).data, { naziv: 'A' });
});

test('registry builder: CSV', () => {
  const rows = parseCsv('﻿Naziv;Broj rješenja;OPCINA;lat;lng;Nepoznato\r\n"Hotel ""Most""; Mostar";R-1;Mostar;43,34;17,8;x\r\n\r\n"Dva\nreda";R-2;Neum;;;\n');
  assert.equal(rows.length, 3);
  assert.equal(rows[1][0], 'Hotel "Most"; Mostar');
  assert.equal(rows[2][0], 'Dva\nreda');
  const m = mapHeader(FIELDS, rows[0]);
  assert.deepEqual(m.map, ['naziv', 'broj', 'opcina', 'lat', 'lng', null]);
  assert.deepEqual(m.unknown, ['Nepoznato']);
  assert.deepEqual(parseCsv('a,b\n1,2')[1], ['1', '2']);
  const out = toCsv(FIELDS, [{ data: { naziv: '=HYPERLINK("x")', vrijediDo: '2030-01-01', lezaji: -5 } }]);
  assert.ok(out.startsWith('﻿Naziv;Broj rješenja'));
  assert.ok(out.includes(`"'=HYPERLINK(""x"")"`), 'formula je neutralizirana');
  assert.ok(out.includes(';-5;01.01.2030.;'), 'datum u BiH obliku, negativan broj ostaje broj');
});

/** Registar nad pravom bazom: shema, zapisi, jedinstvenost, sektor, uvoz, javni API. */
test('registry builder: registar, zapisi, uvoz CSV-a i javni API', { skip: !process.env.DATABASE_URL }, async () => {
  const { Db, withTenant, id } = await import('./db');
  const { AuditService } = await import('./audit');
  const { RegistriesController, PublicRegistriesController } = await import('./registries.controller');
  const db = new Db();
  const ctl = new RegistriesController(db, new AuditService(db));
  const pub = new PublicRegistriesController(db);
  const admin = { user: { sub: `t-adm-${id()}`, name: 'Test Admin', role: 'ADMIN', sectors: [] } };
  const referent = { user: { sub: `t-ref-${id()}`, name: 'Test Referent', role: 'REFERENT', sectors: ['Trgovina'] } };
  let rid = '';
  try {
    await withTenant('mtto', async () => {
      const reg = await ctl.create({ name: `Test registar ${id().slice(0, 6)}`, sector: 'Turizam', public: true, geo: true, fields: FIELDS }, admin);
      rid = reg.id;
      assert.equal(reg.titleField, 'naziv');
      const e = await ctl.createEntry(rid, { data: { naziv: 'Hotel A', broj: 'R-1', opcina: 'Mostar', internaNapomena: 'tajno' }, lat: 43.3, lng: 17.8 }, admin);
      await assert.rejects(ctl.createEntry(rid, { data: { naziv: 'Hotel B', broj: 'r-1' } }, admin), /već postoji/);
      await assert.rejects(ctl.createEntry(rid, { data: { naziv: 'Hotel C' } }, referent), /svojih sektora/);
      await assert.rejects(ctl.createEntry(rid, { data: { naziv: 'Hotel D' }, lat: 99, lng: 1 }, admin), /Koordinate/);

      const csv = 'Naziv;Broj rješenja;Općina;Ležaji;lat;lng\nHotel A novi;R-1;Neum;50;;\nHotel E;R-2;Mostar;12;43,1;17,5\nLoš;R-3;Zagreb;x;;\nHotel E dupli;R-2;Mostar;;;\n';
      const dry = await ctl.import(rid, undefined as any, { csv, mode: 'upsert' }, admin);
      assert.equal(dry.committed, false);
      assert.equal(dry.total, 4);
      assert.equal(dry.toUpdate, 1);
      assert.equal(dry.toCreate, 1);
      assert.equal(dry.invalid, 2);
      assert.ok(dry.errors.some((x: any) => x.row === 4 && x.field === 'opcina'));
      assert.ok(dry.errors.some((x: any) => x.row === 5 && /ponavlja/.test(x.message)));
      await assert.rejects(ctl.import(rid, undefined as any, { csv, mode: 'upsert', commit: '1' }, admin), /greške/);
      const done = await ctl.import(rid, undefined as any, { csv, mode: 'upsert', commit: '1', skipInvalid: '1' }, admin);
      assert.equal(done.committed, true);
      const a = await db.one<any>(`SELECT * FROM registry_entries WHERE "id"=$1`, [e.id]);
      assert.equal(a.data.naziv, 'Hotel A novi');
      assert.equal(a.data.internaNapomena, 'tajno', 'uvoz ne briše polja koja nisu u datoteci');
      assert.equal(a.lat, 43.3, 'prazne koordinate ne brišu postojeće');

      // javni API: samo javna polja, filter, pretraga, arhivirani se ne vide
      const meta: any = await pub.meta(reg.slug);
      assert.equal(meta.count, 2);
      assert.ok(!meta.fields.some((f: any) => f.key === 'internaNapomena'));
      assert.deepEqual(meta.facets.opcina.map((x: any) => x.value), ['Mostar', 'Neum']);
      const list: any = await pub.entries(reg.slug, { 'f.opcina': 'Neum' });
      assert.equal(list.total, 1);
      assert.equal(list.items[0].data.internaNapomena, undefined);
      assert.equal((await pub.entries(reg.slug, { q: 'r-2' })).total, 1);
      await ctl.updateEntry(rid, e.id, { status: 'ARHIVIRAN' }, admin);
      assert.equal((await pub.entries(reg.slug, {})).total, 1);
      await assert.rejects(pub.entry(reg.slug, e.id), /nije pronađen/);
      await ctl.update(rid, { public: false }, admin);
      await assert.rejects(pub.meta(reg.slug), /nije pronađen/);
      await assert.rejects(ctl.remove(rid, admin), /zapisa/);

      // F2-13: registar smještaja iz migracije
      const smj = await db.one<any>(`SELECT * FROM registries WHERE "slug"='ugostiteljski-objekti'`);
      assert.ok(smj, 'registar smještaja postoji');
      assert.ok(smj.fields.some((f: any) => f.key === 'rjesenje' && f.unique));
    });
  } finally {
    await withTenant('mtto', async () => {
      if (rid) await db.q(`DELETE FROM registries WHERE "id"=$1`, [rid]);
    });
    await db.onModuleDestroy();
  }
});
