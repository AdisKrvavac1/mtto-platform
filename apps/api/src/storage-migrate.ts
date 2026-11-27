/**
 * Prenosi datoteke iz baze (kolona "data") u S3 skladište i oslobađa prostor u bazi.
 * Pokretanje (s postavljenim S3_* varijablama): node dist/storage-migrate.js [--dry-run]
 * Svaka datoteka se nakon upisa pročita nazad i uporedi po sha256 prije brisanja iz baze.
 */
import 'reflect-metadata';
import { createHash } from 'crypto';
import { Db } from './db';
import { FileStore, storageDriver } from './storage';

const PREFIX: Record<string, string> = { documents: 'dokumenti', media: 'mediji', eco_report_photos: 'eko-prijave' };

async function main() {
  const dry = process.argv.includes('--dry-run');
  if (storageDriver() !== 's3') { console.error('S3 nije podešen (S3_BUCKET/STORAGE_DRIVER=s3).'); process.exit(1); }
  const db = new Db();
  const files = new FileStore();
  let moved = 0, bytes = 0;
  for (const table of Object.keys(PREFIX)) {
    const rows = await db.q<any>(`SELECT "id","mimeType","data" FROM ${table} WHERE "storageKey" IS NULL AND "data" IS NOT NULL`);
    for (const r of rows) {
      if (dry) { moved++; bytes += r.data.length; continue; }
      const stored = await files.put(PREFIX[table], r.data, r.mimeType);
      const back = await files.read(stored);
      if (createHash('sha256').update(back).digest('hex') !== stored.sha256) throw new Error(`Provjera nije prošla za ${table}/${r.id}`);
      await db.q(`UPDATE ${table} SET "storageKey"=$2, "sha256"=$3, "scanStatus"=$4, "data"=NULL WHERE "id"=$1`, [r.id, stored.storageKey, stored.sha256, stored.scanStatus]);
      moved++; bytes += r.data.length;
    }
    console.log(`${table}: ${rows.length} datoteka`);
  }
  console.log(`${dry ? 'Za prenos' : 'Preneseno'}: ${moved} datoteka, ${(bytes / 1048576).toFixed(1)} MB`);
  await db.pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
