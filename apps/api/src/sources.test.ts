import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';

/** F2-18: izvor koji padne zadržava stare podatke, upozorava jednom i javlja kad se vrati. */
test('izvori: trajni keš, upozorenje kad izvor padne i kad se vrati', { skip: !process.env.DATABASE_URL }, async () => {
  const { Db } = await import('./db');
  const { SourceHub } = await import('./sources');
  const db = new Db();
  const key = `t-izvor-${Date.now()}`;
  const prev = process.env.SOURCE_ALERT_TO;
  process.env.SOURCE_ALERT_TO = 'dezurni@example.org';
  try {
    const hub = new SourceHub(db);
    let fail = false; let calls = 0;
    hub.register({ key, label: 'Testni izvor', everyMs: 60_000, staleMs: 3600_000, fallback: [], fetch: async () => { calls++; if (fail) throw new Error('503 Service Unavailable'); return [{ v: calls }]; } });

    const first = await hub.get<any[]>(key);
    assert.deepEqual(first.data, [{ v: 1 }], 'prvi zahtjev učitava izvor');
    assert.equal(first.error, null);
    await hub.get(key);
    assert.equal(calls, 1, 'drugi zahtjev čita iz keša, ne zove izvor');

    fail = true;
    for (let i = 0; i < 4; i++) await hub.refresh(key);
    const down = await hub.get<any[]>(key);
    assert.deepEqual(down.data, [{ v: 1 }], 'greška ne briše zadnje uspješne podatke');
    assert.equal(down.failures, 4); assert.match(down.error!, /503/); assert.equal(down.alerted, true);
    let mails = await db.system(() => db.q<any>(`SELECT "subject" FROM mail_outbox WHERE "ref"=$1`, [`izvor:${key}`]));
    assert.equal(mails.length, 1, 'jedno upozorenje po prekidu');
    assert.match(mails[0].subject, /ne odgovara: Testni izvor/);

    fail = false;
    const back = await hub.refresh(key);
    assert.equal(back.error, null); assert.equal(back.failures, 0); assert.equal(back.alerted, false);
    mails = await db.system(() => db.q<any>(`SELECT "subject" FROM mail_outbox WHERE "ref"=$1 ORDER BY "createdAt"`, [`izvor:${key}`]));
    assert.equal(mails.length, 2); assert.match(mails[1].subject, /ponovo radi/);

    // raspored: izvor osvježen upravo sada se ne poziva ponovo
    const before = calls;
    await hub.tick();
    assert.equal(calls, before);
    await hub.tick(Date.now() + 120_000);
    assert.equal(calls, before + 1, 'nakon intervala raspored osvježava');
  } finally {
    process.env.SOURCE_ALERT_TO = prev;
    await db.system(() => db.q(`DELETE FROM mail_outbox WHERE "ref"=$1`, [`izvor:${key}`]));
    await db.q(`DELETE FROM source_cache WHERE "key"=$1`, [key]);
    await db.onModuleDestroy();
  }
});

test('zrak: EAQI, pragovi i upozorenja, uvoz stanica', async () => {
  const { eaqi, summarize, parseStationCsv, parseLocalTs, band } = await import('./air');
  assert.equal(eaqi({ pm10: 20 }), 20);
  assert.equal(eaqi({ pm10: 45, no2: 30 }), 50, 'indeks je najgori pojedinačni');
  assert.equal(band(85)!.label, 'Vrlo loš');

  const base = Date.parse('2026-01-15T00:00:00Z');
  const hours = Array.from({ length: 48 }, (_, k) => ({
    ts: new Date(base + k * 3600_000).toISOString(), aqi: k < 24 ? 30 : 90, pm10: k < 24 ? 30 : 70, pm25: 10, o3: k === 30 ? 200 : 60, no2: 20, so2: 5, co: 0.3,
  }));
  const s = summarize('mostar', 'Mostar', hours, base + 20 * 3600_000);
  const day2 = s.alerts.filter((a) => a.date === '2026-01-16');
  assert.ok(day2.some((a) => a.pol === 'pm10' && a.level === 'granicna'), 'PM10 iznad 50 µg/m³ dnevno');
  assert.ok(day2.some((a) => a.pol === 'o3' && a.level === 'upozorenje'), 'ozon iznad praga upozorenja');
  assert.ok(day2.every((a) => a.forecast), 'budući dan je prognoza');
  assert.equal(s.now!.ts, hours[20].ts, 'trenutna vrijednost je zadnji protekli sat');

  // ljeto (CEST): 13:00 lokalno = 11:00 UTC; zima (CET): 12:00 UTC
  assert.equal(parseLocalTs('2026-07-01 13:00')!.toISOString(), '2026-07-01T11:00:00.000Z');
  assert.equal(parseLocalTs('15.01.2026 13:00')!.toISOString(), '2026-01-15T12:00:00.000Z');

  const r = parseStationCsv('stanica;vrijeme;pm10;pm2.5;no2\nams-mostar-kampus;2026-01-15 13:00;42,5;20;31\nAMS Jablanica;15.01.2026 14:00;-;12;\nnepoznata;2026-01-15 13:00;1;1;1\nams-jablanica;sutra;1;1;1\nams-jablanica;2026-01-15 15:00;abc;1;1');
  assert.equal(r.rows.length, 2);
  assert.equal(r.rows[0][0], 'ams-mostar-kampus'); assert.equal(r.rows[0][4], 42.5); assert.equal(r.rows[1][4], null, 'crtica znači da nema mjerenja');
  assert.equal(r.errors.length, 3);
});
