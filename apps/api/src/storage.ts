import { BadRequestException, Injectable } from '@nestjs/common';
import { DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createHash, randomUUID } from 'crypto';
import { connect } from 'net';
import { logJson } from './observability';

/**
 * F1-02: skladište datoteka.
 * - STORAGE_DRIVER=s3 (ili postavljen S3_BUCKET): datoteke idu u S3 kompatibilno skladište
 *   (Cloudflare R2, Backblaze B2, Hetzner, MinIO, domaći provajder), privatno, bez javnih URL-ova.
 * - Inače ostaju u bazi (kao u MVP-u), pa platforma radi i bez skladišta.
 * - Svaka datoteka dobija sha256, a uz CLAMAV_HOST i antivirusnu provjeru prije spremanja.
 */
export type Stored = { storageKey: string | null; data: Buffer | null; sha256: string; scanStatus: string };

export const storageDriver = () => (process.env.STORAGE_DRIVER || (process.env.S3_BUCKET ? 's3' : 'db')) as 's3' | 'db';

let client: S3Client | null = null;
function s3() {
  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: String(process.env.S3_PATH_STYLE ?? 'true') === 'true',
      credentials: process.env.S3_ACCESS_KEY_ID ? { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! } : undefined,
    });
  }
  return client;
}
const bucket = () => process.env.S3_BUCKET || 'mtto-files';

/** Antivirus preko clamd (INSTREAM). Bez CLAMAV_HOST vraća NIJE_SKENIRANO. */
export function scanWithClamd(buf: Buffer, host = process.env.CLAMAV_HOST, port = Number(process.env.CLAMAV_PORT || 3310)): Promise<'CISTO' | 'ZARAZENO' | 'NIJE_SKENIRANO'> {
  if (!host) return Promise.resolve('NIJE_SKENIRANO');
  return new Promise((resolve) => {
    const sock = connect(port, host);
    let reply = '';
    const done = (v: 'CISTO' | 'ZARAZENO' | 'NIJE_SKENIRANO') => { sock.destroy(); resolve(v); };
    sock.setTimeout(15_000, () => { logJson('warn', 'ClamAV ne odgovara'); done('NIJE_SKENIRANO'); });
    sock.on('error', (e) => { logJson('warn', 'ClamAV nedostupan', { error: e.message }); done('NIJE_SKENIRANO'); });
    sock.on('data', (d) => { reply += d.toString(); });
    sock.on('end', () => done(/FOUND/.test(reply) ? 'ZARAZENO' : /OK/.test(reply) ? 'CISTO' : 'NIJE_SKENIRANO'));
    sock.on('connect', () => {
      sock.write('zINSTREAM\0');
      for (let i = 0; i < buf.length; i += 64 * 1024) {
        const chunk = buf.subarray(i, i + 64 * 1024);
        const len = Buffer.alloc(4); len.writeUInt32BE(chunk.length);
        sock.write(len); sock.write(chunk);
      }
      sock.write(Buffer.alloc(4));
    });
  });
}

@Injectable()
export class FileStore {
  /** Za /api/health: je li skladište (i bucket za kopije) dostupno. Bez tajni u odgovoru. */
  async check(): Promise<{ driver: 's3' | 'db'; ok: boolean; backups?: boolean }> {
    if (storageDriver() !== 's3') return { driver: 'db', ok: true };
    const head = (b: string) => s3().send(new HeadBucketCommand({ Bucket: b })).then(() => true, () => false);
    const ok = await head(bucket());
    const bb = process.env.BACKUP_BUCKET;
    return { driver: 's3', ok, ...(bb ? { backups: await head(bb) } : {}) };
  }

  /** Provjerava i sprema datoteku; vraća polja za upis u red tabele. Zaražena datoteka se odbija. */
  async put(prefix: string, buf: Buffer, mimeType: string): Promise<Stored> {
    const sha256 = createHash('sha256').update(buf).digest('hex');
    const scanStatus = await scanWithClamd(buf);
    if (scanStatus === 'ZARAZENO') {
      logJson('warn', 'Odbijena zaražena datoteka', { prefix, sha256 });
      throw new BadRequestException('Datoteka je odbijena jer antivirusna provjera nije prošla.');
    }
    if (storageDriver() === 's3') {
      const storageKey = `${prefix}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}`;
      await s3().send(new PutObjectCommand({ Bucket: bucket(), Key: storageKey, Body: buf, ContentType: mimeType, Metadata: { sha256 } }));
      return { storageKey, data: null, sha256, scanStatus };
    }
    return { storageKey: null, data: buf, sha256, scanStatus };
  }

  /** Čita sadržaj reda: iz skladišta ako ima storageKey, inače iz baze. */
  async read(row: { storageKey?: string | null; data?: Buffer | null }): Promise<Buffer> {
    if (row.storageKey) {
      const r = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: row.storageKey }));
      return Buffer.from(await r.Body!.transformToByteArray());
    }
    if (row.data) return row.data;
    throw new Error('Datoteka nema sadržaja');
  }

  async remove(storageKey?: string | null) {
    if (storageKey) await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: storageKey })).catch((e) => logJson('warn', 'Brisanje iz skladišta nije uspjelo', { error: e.message }));
  }
}
