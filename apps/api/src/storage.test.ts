import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'net';
import { scanWithClamd } from './storage';

/** Lažni clamd: odgovara "FOUND" ako sadržaj ima EICAR potpis, inače "OK". */
function fakeClamd(): Promise<{ port: number; close: () => void }> {
  return new Promise((resolve) => {
    const srv = createServer((sock) => {
      let buf = Buffer.alloc(0);
      sock.on('data', (d) => {
        buf = Buffer.concat([buf, d]);
        if (buf.subarray(-4).equals(Buffer.alloc(4))) {
          sock.end(buf.includes('EICAR-STANDARD-ANTIVIRUS-TEST-FILE') ? 'stream: Eicar-Test-Signature FOUND\0' : 'stream: OK\0');
        }
      });
    });
    srv.listen(0, '127.0.0.1', () => resolve({ port: (srv.address() as any).port, close: () => srv.close() }));
  });
}

test('antivirus: čista datoteka prolazi, EICAR se otkriva, bez servera nema skeniranja', async () => {
  const c = await fakeClamd();
  assert.equal(await scanWithClamd(Buffer.from('obican PDF sadrzaj'), '127.0.0.1', c.port), 'CISTO');
  const eicar = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$' + 'EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
  assert.equal(await scanWithClamd(Buffer.from(eicar), '127.0.0.1', c.port), 'ZARAZENO');
  c.close();
  assert.equal(await scanWithClamd(Buffer.from('x'), undefined), 'NIJE_SKENIRANO');
  assert.equal(await scanWithClamd(Buffer.from('x'), '127.0.0.1', 1), 'NIJE_SKENIRANO');
});

/** Vraćanje kopije: roditeljske tabele prije podređenih, i za tabele dodane poslije (obrasci, predmeti, registri). */
test('kopija: redoslijed vraćanja prati strane ključeve', { skip: !process.env.DATABASE_URL }, async () => {
  const { Pool } = await import('pg');
  const { parentsFirst } = await import('./backup');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const ts = (await pool.query(`SELECT table_name t FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' AND table_name NOT IN ('spatial_ref_sys','schema_migrations')`)).rows.map((r: any) => r.t);
    const order = await parentsFirst(pool, ts);
    assert.equal(order.length, ts.length);
    const at = (t: string) => order.indexOf(t);
    for (const [parent, child] of [['tenants', 'users'], ['forms', 'cases'], ['cases', 'case_events'], ['cases', 'case_files'], ['users', 'cases'], ['registries', 'registry_entries'], ['posts', 'post_versions'], ['documents', 'document_versions']]) {
      if (at(parent) >= 0 && at(child) >= 0) assert.ok(at(parent) < at(child), `${parent} prije ${child}`);
    }
  } finally { await pool.end(); }
});
