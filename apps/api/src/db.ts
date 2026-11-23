import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient, types } from 'pg';

// DATE kolone vraćamo kao 'YYYY-MM-DD' (bez pomjeranja vremenske zone)
types.setTypeParser(1082, (v: string) => v);
import { randomUUID } from 'crypto';

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  "id" text PRIMARY KEY, "email" text UNIQUE NOT NULL, "name" text NOT NULL, "role" text NOT NULL DEFAULT 'UREDNIK',
  "passwordHash" text NOT NULL, "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS posts (
  "id" text PRIMARY KEY, "slug" text UNIQUE NOT NULL, "type" text NOT NULL DEFAULT 'VIJEST', "category" text NOT NULL DEFAULT 'Opće',
  "title" text NOT NULL, "excerpt" text NOT NULL DEFAULT '', "body" text NOT NULL DEFAULT '', "coverImage" text,
  "status" text NOT NULL DEFAULT 'NACRT', "publishedAt" timestamptz, "deadline" timestamptz, "formUrl" text,
  "authorName" text NOT NULL DEFAULT 'Uredništvo MTTO', "views" int NOT NULL DEFAULT 0, "isDemo" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "externalId" text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "sourceUrl" text;
CREATE UNIQUE INDEX IF NOT EXISTS posts_external_id ON posts("externalId") WHERE "externalId" IS NOT NULL;
CREATE TABLE IF NOT EXISTS permits (
  "id" text PRIMARY KEY, "registerNumber" text UNIQUE NOT NULL, "operator" text NOT NULL, "facility" text NOT NULL,
  "activity" text NOT NULL, "municipality" text NOT NULL, "address" text NOT NULL DEFAULT '', "issuedAt" date NOT NULL,
  "validUntil" date NOT NULL, "status" text NOT NULL DEFAULT 'VAZECA', "description" text NOT NULL DEFAULT '',
  "lat" double precision, "lng" double precision, "isDemo" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS documents (
  "id" text PRIMARY KEY, "title" text NOT NULL, "docType" text NOT NULL, "sector" text NOT NULL DEFAULT 'Opće', "number" text,
  "issuedAt" date, "status" text NOT NULL DEFAULT 'VAZECI', "description" text NOT NULL DEFAULT '', "fileName" text NOT NULL,
  "mimeType" text NOT NULL, "size" int NOT NULL, "data" bytea NOT NULL, "downloads" int NOT NULL DEFAULT 0,
  "isDemo" boolean NOT NULL DEFAULT false,
  "postId" text REFERENCES posts("id") ON DELETE SET NULL, "permitId" text REFERENCES permits("id") ON DELETE SET NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS facilities (
  "id" text PRIMARY KEY, "name" text NOT NULL, "kind" text NOT NULL, "stars" int, "municipality" text NOT NULL,
  "address" text NOT NULL DEFAULT '', "rooms" int, "beds" int, "decisionNumber" text, "decisionDate" date,
  "lat" double precision, "lng" double precision, "isDemo" boolean NOT NULL DEFAULT true, "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS map_locations (
  "id" text PRIMARY KEY, "name" text NOT NULL, "layer" text NOT NULL, "description" text NOT NULL DEFAULT '',
  "lat" double precision NOT NULL, "lng" double precision NOT NULL, "link" text, "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS media (
  "id" text PRIMARY KEY, "fileName" text NOT NULL, "mimeType" text NOT NULL, "size" int NOT NULL, "data" bytea NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_log (
  "id" text PRIMARY KEY, "userName" text NOT NULL, "action" text NOT NULL, "target" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS landslides (
  "id" text PRIMARY KEY, "name" text NOT NULL, "municipality" text NOT NULL, "lat" double precision NOT NULL, "lng" double precision NOT NULL,
  "status" text NOT NULL DEFAULT 'AKTIVNO', "risk" int NOT NULL DEFAULT 2, "description" text NOT NULL DEFAULT '',
  "source" text NOT NULL DEFAULT '', "isDemo" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS eco_reports (
  "id" text PRIMARY KEY, "code" text UNIQUE NOT NULL, "kind" text NOT NULL, "municipality" text NOT NULL, "location" text NOT NULL DEFAULT '',
  "lat" double precision, "lng" double precision, "description" text NOT NULL, "contactName" text, "contactEmail" text,
  "status" text NOT NULL DEFAULT 'NOVO', "isPublic" boolean NOT NULL DEFAULT false, "note" text NOT NULL DEFAULT '',
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE eco_reports ADD COLUMN IF NOT EXISTS "publicNote" text NOT NULL DEFAULT '';
ALTER TABLE eco_reports ADD COLUMN IF NOT EXISTS "photosPublic" boolean NOT NULL DEFAULT true;
CREATE TABLE IF NOT EXISTS eco_report_photos (
  "id" text PRIMARY KEY, "reportId" text NOT NULL REFERENCES eco_reports("id") ON DELETE CASCADE,
  "mimeType" text NOT NULL, "size" integer NOT NULL, "data" bytea NOT NULL, "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS eco_photos_report ON eco_report_photos("reportId");
CREATE INDEX IF NOT EXISTS posts_pub ON posts("status", "publishedAt" DESC);
CREATE INDEX IF NOT EXISTS docs_post ON documents("postId");
CREATE INDEX IF NOT EXISTS docs_permit ON documents("permitId");
`;

export const id = () => randomUUID();

export function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL nije postavljen');
  const local = /localhost|127\.0\.0\.1/.test(url) || url.includes('sslmode=disable');
  return new Pool({ connectionString: url, max: 10, ssl: local ? false : { rejectUnauthorized: false } });
}

@Injectable()
export class Db implements OnModuleDestroy {
  pool = makePool();
  private ready = this.pool.query(SCHEMA);

  async q<T = any>(text: string, params: any[] = []): Promise<T[]> {
    await this.ready;
    const r = await this.pool.query(text, params);
    return r.rows as T[];
  }

  async one<T = any>(text: string, params: any[] = []): Promise<T | null> {
    const rows = await this.q<T>(text, params);
    return rows[0] ?? null;
  }

  async count(text: string, params: any[] = []): Promise<number> {
    const r = await this.one<{ n: string }>(text, params);
    return Number(r?.n ?? 0);
  }

  /** INSERT iz objekta; vraća red. */
  async insert<T = any>(table: string, data: Record<string, any>, returning = '*'): Promise<T> {
    const keys = Object.keys(data).filter((k) => data[k] !== undefined);
    const sql = `INSERT INTO ${table} (${keys.map((k) => `"${k}"`).join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) RETURNING ${returning}`;
    return (await this.q<T>(sql, keys.map((k) => data[k])))[0];
  }

  /** UPDATE po id; vraća red ili null. */
  async update<T = any>(table: string, rowId: string, data: Record<string, any>, touch = false, returning = '*'): Promise<T | null> {
    const keys = Object.keys(data).filter((k) => data[k] !== undefined);
    const sets = keys.map((k, i) => `"${k}"=$${i + 2}`);
    if (touch) sets.push(`"updatedAt"=now()`);
    if (!sets.length) return this.one<T>(`SELECT ${returning} FROM ${table} WHERE "id"=$1`, [rowId]);
    return this.one<T>(`UPDATE ${table} SET ${sets.join(',')} WHERE "id"=$1 RETURNING ${returning}`, [rowId, ...keys.map((k) => data[k])]);
  }

  async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    await this.ready;
    const c = await this.pool.connect();
    try {
      await c.query('BEGIN');
      const r = await fn(c);
      await c.query('COMMIT');
      return r;
    } catch (e) {
      await c.query('ROLLBACK');
      throw e;
    } finally {
      c.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}

/** WHERE gradnja: dodaje uslove i parametre. */
export class Where {
  parts: string[] = [];
  params: any[] = [];
  add(sql: string, ...vals: any[]) {
    let s = sql;
    for (const v of vals) {
      this.params.push(v);
      s = s.replace('?', `$${this.params.length}`);
    }
    this.parts.push(s);
    return this;
  }
  get sql() {
    return this.parts.length ? `WHERE ${this.parts.join(' AND ')}` : '';
  }
  next() {
    return `$${this.params.length + 1}`;
  }
}
