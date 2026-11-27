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
