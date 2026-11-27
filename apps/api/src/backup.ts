/**
 * F1-07: šifrirane rezervne kopije baze (pravilo 3-2-1: produkcija, kopija kod Rendera, kopija u drugom skladištu).
 *
 * Format .mttobak:  "MTTOBAK1" | 4 B dužina zaglavlja | JSON zaglavlje | AES-256-GCM(gzip(JSON redovi))
 * - Ključ podataka je nasumičan za svaku kopiju i šifriran JAVNIM RSA ključem (BACKUP_PUBLIC_KEY).
 * - Privatni ključ (BACKUP_PRIVATE_KEY) se ne drži na serveru: čuva ga vlasnik projekta i GitHub (za test vraćanja).
 * - Zaglavlje sadrži broj redova po tabeli, pa test vraćanja može uporediti rezultat.
 *
 * CLI:  node dist/backup.js create [izlaz.mttobak]      (bez izlaza: šalje u S3 pod backups/)
 *       node dist/backup.js restore <ulaz|s3:latest> <DATABASE_URL_cilj>
 */
import 'reflect-metadata';
import { constants, createCipheriv, createDecipheriv, privateDecrypt, publicEncrypt, randomBytes } from 'crypto';
import { gunzipSync, gzipSync } from 'zlib';
import { readFileSync, writeFileSync } from 'fs';
import { Pool } from 'pg';
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { migrate } from './migrations';
import { logJson } from './observability';

const MAGIC = Buffer.from('MTTOBAK1');
const KEEP_DAYS = Number(process.env.BACKUP_KEEP_DAYS || 30);

type Header = { version: 1; createdAt: string; migrations: string[]; counts: Record<string, number>; key: string; iv: string; tag: string };

function s3() {
  return new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: String(process.env.S3_PATH_STYLE ?? 'true') === 'true',
    credentials: process.env.S3_ACCESS_KEY_ID ? { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! } : undefined,
  });
}
const backupBucket = () => process.env.BACKUP_BUCKET || process.env.S3_BUCKET || 'mtto-files';
const pem = (v?: string) => (v ?? '').replace(/\\n/g, '\n');

async function tables(pool: Pool): Promise<string[]> {
  const r = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'
    AND table_name NOT IN ('spatial_ref_sys','schema_migrations') ORDER BY table_name`);
  return r.rows.map((x) => x.table_name);
}

/** Pravi šifriranu kopiju cijele baze. */
export async function createBackup(pool: Pool, publicKeyPem: string): Promise<{ file: Buffer; header: Omit<Header, 'key' | 'iv' | 'tag'> }> {
  const lines: string[] = [];
  const counts: Record<string, number> = {};
  for (const t of await tables(pool)) {
    const cols = (await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND is_generated='NEVER' ORDER BY ordinal_position`, [t])).rows.map((c) => `"${c.column_name}"`);
    const rows = (await pool.query(`SELECT row_to_json(x) j FROM (SELECT ${cols.join(',')} FROM "${t}") x`)).rows;
    counts[t] = rows.length;
    for (const r of rows) lines.push(JSON.stringify({ t, r: r.j }));
  }
  const migrations = (await pool.query(`SELECT "id" FROM schema_migrations ORDER BY "id"`)).rows.map((r) => r.id);
  const dataKey = randomBytes(32), iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', dataKey, iv);
  const body = Buffer.concat([c.update(gzipSync(Buffer.from(lines.join('\n'), 'utf8'))), c.final()]);
  const meta = { version: 1 as const, createdAt: new Date().toISOString(), migrations, counts };
  const header: Header = {
    ...meta,
    key: publicEncrypt({ key: pem(publicKeyPem), padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, dataKey).toString('base64'),
    iv: iv.toString('base64'),
    tag: c.getAuthTag().toString('base64'),
  };
  const h = Buffer.from(JSON.stringify(header), 'utf8');
  const len = Buffer.alloc(4); len.writeUInt32BE(h.length);
  return { file: Buffer.concat([MAGIC, len, h, body]), header: meta };
}

export function readHeader(file: Buffer): Header {
  if (!file.subarray(0, 8).equals(MAGIC)) throw new Error('Nije MTTO rezervna kopija');
  const n = file.readUInt32BE(8);
  return JSON.parse(file.subarray(12, 12 + n).toString('utf8'));
}

/** Vraća kopiju u PRAZNU bazu: primijeni migracije, zatim upiši redove. Vraća broj redova po tabeli. */
export async function restoreBackup(file: Buffer, privateKeyPem: string, target: Pool): Promise<{ counts: Record<string, number>; expected: Record<string, number> }> {
  const header = readHeader(file);
  const body = file.subarray(12 + file.readUInt32BE(8));
  const dataKey = privateDecrypt({ key: pem(privateKeyPem), padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(header.key, 'base64'));
  const d = createDecipheriv('aes-256-gcm', dataKey, Buffer.from(header.iv, 'base64'));
  d.setAuthTag(Buffer.from(header.tag, 'base64'));
  const lines = gunzipSync(Buffer.concat([d.update(body), d.final()])).toString('utf8').split('\n').filter(Boolean);

  await migrate(target, () => {});
  const c = await target.connect();
  const counts: Record<string, number> = {};
  try {
    await c.query('BEGIN');
    const ts = Object.keys(header.counts);
    if (ts.length) await c.query(`TRUNCATE ${ts.map((t) => `"${t}"`).join(',')} CASCADE`);
    // redoslijed: roditeljske tabele prije onih koje ih referenciraju
    const order = ['users', 'posts', 'permits', 'facilities', 'documents', 'eco_reports', ...ts];
    const byTable = new Map<string, any[]>();
    for (const l of lines) { const { t, r } = JSON.parse(l); (byTable.get(t) ?? byTable.set(t, []).get(t)!).push(r); }
    for (const t of [...new Set(order)].filter((x) => byTable.has(x))) {
      const cols = (await c.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND is_generated='NEVER'`, [t])).rows.map((x) => `"${x.column_name}"`);
      for (const r of byTable.get(t)!) {
        await c.query(`INSERT INTO "${t}" (${cols.join(',')}) SELECT ${cols.join(',')} FROM json_populate_record(NULL::"${t}", $1)`, [JSON.stringify(r)]);
      }
      counts[t] = byTable.get(t)!.length;
    }
    await c.query('COMMIT');
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    c.release();
  }
  return { counts, expected: header.counts };
}

/** Dnevna kopija u S3 + brisanje kopija starijih od BACKUP_KEEP_DAYS. */
export async function runScheduledBackup(pool: Pool) {
  const key = process.env.BACKUP_PUBLIC_KEY;
  if (!key || !(process.env.BACKUP_BUCKET || process.env.S3_BUCKET)) return;
  const t0 = Date.now();
  const { file, header } = await createBackup(pool, key);
  const name = `backups/${header.createdAt.slice(0, 10)}/mtto-${header.createdAt.replace(/[:.]/g, '-')}.mttobak`;
  const client = s3();
  await client.send(new PutObjectCommand({ Bucket: backupBucket(), Key: name, Body: file, ContentType: 'application/octet-stream' }));
  const cutoff = new Date(Date.now() - KEEP_DAYS * 86400_000).toISOString().slice(0, 10);
  const list = await client.send(new ListObjectsV2Command({ Bucket: backupBucket(), Prefix: 'backups/' }));
  for (const o of list.Contents ?? []) if (o.Key && o.Key.slice(8, 18) < cutoff) await client.send(new DeleteObjectCommand({ Bucket: backupBucket(), Key: o.Key }));
  logJson('info', 'Rezervna kopija napravljena', { key: name, bytes: file.length, tables: Object.keys(header.counts).length, ms: Date.now() - t0 });
}

/** Najnovija kopija iz S3. */
export async function latestBackup(): Promise<Buffer> {
  const client = s3();
  const list = await client.send(new ListObjectsV2Command({ Bucket: backupBucket(), Prefix: 'backups/' }));
  const last = (list.Contents ?? []).map((o) => o.Key!).sort().pop();
  if (!last) throw new Error('Nema rezervnih kopija u skladištu');
  const r = await client.send(new GetObjectCommand({ Bucket: backupBucket(), Key: last }));
  return Buffer.from(await r.Body!.transformToByteArray());
}

async function cli() {
  const [cmd, a, b] = process.argv.slice(2);
  if (cmd === 'create') {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    if (a) { const { file, header } = await createBackup(pool, process.env.BACKUP_PUBLIC_KEY!); writeFileSync(a, file); console.log(JSON.stringify(header.counts)); }
    else await runScheduledBackup(pool);
    await pool.end();
  } else if (cmd === 'restore') {
    const file = a === 's3:latest' ? await latestBackup() : readFileSync(a);
    const pool = new Pool({ connectionString: b });
    const r = await restoreBackup(file, process.env.BACKUP_PRIVATE_KEY!, pool);
    await pool.end();
    const bad = Object.entries(r.expected).filter(([t, n]) => (r.counts[t] ?? 0) !== n);
    console.log(`Vraćeno iz kopije od ${readHeader(file).createdAt}:`, JSON.stringify(r.counts));
    if (bad.length) { console.error('Broj redova se ne slaže:', bad); process.exit(2); }
    console.log('Test vraćanja: sve tabele se slažu.');
  } else {
    console.log('Upotreba: backup.js create [fajl] | restore <fajl|s3:latest> <DATABASE_URL>');
  }
}
if (require.main === module) cli().catch((e) => { console.error(e.message); process.exit(1); });

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Db } from './db';

/** Pokreće dnevnu kopiju u 02:30 (po vremenu servera) dok aplikacija radi. Isključeno bez BACKUP_PUBLIC_KEY. */
@Injectable()
export class BackupScheduler implements OnModuleInit {
  constructor(private db: Db) {}
  onModuleInit() {
    if (!process.env.BACKUP_PUBLIC_KEY) return;
    const schedule = () => {
      const now = new Date(), next = new Date(now);
      next.setUTCHours(1, 30, 0, 0); // 02:30 CET
      if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
      setTimeout(async () => {
        try {
          // advisory lock: samo jedna instanca pravi kopiju
          const r = await this.db.pool.query(`SELECT pg_try_advisory_lock(727001) ok`);
          if (r.rows[0].ok) { try { await runScheduledBackup(this.db.pool); } finally { await this.db.pool.query(`SELECT pg_advisory_unlock(727001)`); } }
        } catch (e: any) { logJson('error', 'Rezervna kopija nije uspjela', { error: e?.message }); }
        schedule();
      }, next.getTime() - now.getTime()).unref();
    };
    schedule();
  }
}
