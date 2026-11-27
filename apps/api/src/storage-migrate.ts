/**
 * Prenosi datoteke iz baze (kolona "data") u S3 skladište i oslobađa prostor u bazi.
 * Pokretanje (s postavljenim S3_* varijablama): node dist/storage-migrate.js [--dry-run]
 * Svaka datoteka se nakon upisa pročita nazad i uporedi po sha256 prije brisanja iz baze.
 */
import 'reflect-metadata';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { logJson } from './observability';
import { createHash } from 'crypto';
import { Db } from './db';
import { FileStore, storageDriver } from './storage';

const PREFIX: Record<string, string> = { documents: 'dokumenti', media: 'mediji', eco_report_photos: 'eko-prijave' };

/** Prenosi sve datoteke koje su još u bazi. Idempotentno: dira samo redove bez storageKey. */
export async function migrateFilesToStorage(db: Db, files: FileStore, dry = false, log: (m: string) => void = console.log) {
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
    log(`${table}: ${rows.length} datoteka`);
  }
  log(`${dry ? 'Za prenos' : 'Preneseno'}: ${moved} datoteka, ${(bytes / 1048576).toFixed(1)} MB`);
  return { moved, bytes };
}

async function main() {
  if (storageDriver() !== 's3') { console.error('S3 nije podešen (S3_BUCKET/STORAGE_DRIVER=s3).'); process.exit(1); }
  const db = new Db();
  await db.system(() => migrateFilesToStorage(db, new FileStore(), process.argv.includes('--dry-run')));
  await db.pool.end();
}
if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });

/** Ako je STORAGE_MIGRATE_ON_START=1 i skladište dostupno, pri pokretanju prenese preostale datoteke (jedna instanca, advisory lock). */
@Injectable()
export class StorageMigrator implements OnApplicationBootstrap {
  constructor(private db: Db, private files: FileStore) {}
  onApplicationBootstrap() {
    if (process.env.STORAGE_MIGRATE_ON_START !== '1' || storageDriver() !== 's3') return;
    setTimeout(async () => {
      try {
        if (!(await this.files.check()).ok) { logJson('error', 'Skladište nije dostupno, prenos datoteka preskočen'); return; }
        await this.db.system(() => this.db.withLock(727002, async () => {
          const res = await migrateFilesToStorage(this.db, this.files, false, (m) => logJson('info', `[prenos datoteka] ${m}`));
          logJson('info', 'Prenos datoteka u skladište završen', res);
        }));
      } catch (e: any) { logJson('error', 'Prenos datoteka nije uspio', { error: e?.message }); }
    }, 5000).unref();
  }
}
