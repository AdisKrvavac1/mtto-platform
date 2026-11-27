import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { Pool, PoolClient, QueryResult, types } from 'pg';

// DATE kolone vraćamo kao 'YYYY-MM-DD' (bez pomjeranja vremenske zone)
types.setTypeParser(1082, (v: string) => v);
import { randomUUID } from 'crypto';
import { migrate } from './migrations';
import { Kysely, PostgresDialect } from 'kysely';
import type { DB } from './db-types';

export { SCHEMA } from './schema';

export const id = () => randomUUID();

export function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL nije postavljen');
  const local = /localhost|127\.0\.0\.1/.test(url) || url.includes('sslmode=disable');
  return new Pool({ connectionString: url, max: 10, ssl: local ? false : { rejectUnauthorized: false } });
}

/* ───── F1-11: institucija (tenant) uz svaki upit ─────
 * Institucija tekućeg zahtjeva živi u AsyncLocalStorage (postavlja je middleware po domeni).
 * Prije svakog upita konekcija dobija app.tenant, a RLS u bazi propušta samo redove te institucije.
 * Sistemski poslovi (migracije, rezervne kopije, prenos datoteka) rade u Db.system() s app.tenant = '*'. */
export const SYSTEM_TENANT = '*';
export const DEFAULT_TENANT = 'mtto';
export const tenantContext = new AsyncLocalStorage<string>();
export const currentTenant = () => tenantContext.getStore() ?? DEFAULT_TENANT;
/** Pokreće fn u ime institucije (ili '*' za sistemske poslove). */
export const withTenant = <T>(tenant: string, fn: () => Promise<T>) => tenantContext.run(tenant, fn);

/** Omotač oko pg.Pool: svaka konekcija koja izađe iz bazena nosi instituciju tekućeg konteksta. */
export class TenantPool {
  constructor(readonly raw: Pool) {}
  async connect(): Promise<PoolClient> {
    const c = await this.raw.connect();
    try {
      await c.query(`SELECT set_config('app.tenant', $1, false)`, [currentTenant()]);
    } catch (e) {
      c.release(e as Error);
      throw e;
    }
    return c;
  }
  async query(text: string, params: any[] = []): Promise<QueryResult> {
    const c = await this.connect();
    try { return await c.query(text, params); } finally { c.release(); }
  }
  end() { return this.raw.end(); }
  on(event: string, fn: (...a: any[]) => void) { this.raw.on(event as any, fn); return this; }
}

@Injectable()
export class Db implements OnModuleDestroy {
  pool = new TenantPool(makePool());
  private ready = withTenant(SYSTEM_TENANT, () => migrate(this.pool as unknown as Pool));
  private kysely = new Kysely<DB>({ dialect: new PostgresDialect({ pool: this.pool as unknown as Pool }) });

  /** Upiti s provjerom tipova (ADR 0004). Tipovi se generišu iz baze: npm run db:types -w apps/api. */
  async k(): Promise<Kysely<DB>> {
    await this.ready;
    return this.kysely;
  }

  /** Da li je PostGIS aktivan (migracija 0003 primijenjena). */
  async geoEnabled(): Promise<boolean> {
    await this.ready;
    const r = await this.pool.query(`SELECT 1 FROM schema_migrations WHERE "id"='0003_postgis'`);
    return r.rowCount === 1;
  }

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

  /** Sistemski posao preko svih institucija (app.tenant = '*'). */
  system<T>(fn: () => Promise<T>): Promise<T> {
    return withTenant(SYSTEM_TENANT, fn);
  }

  /**
   * Posao pod advisory lockom na JEDNOJ konekciji (lock i unlock moraju biti na istoj sesiji).
   * Vraća false ako drugi proces već radi isti posao.
   */
  async withLock(key: number, fn: () => Promise<void>): Promise<boolean> {
    await this.ready;
    const c = await this.pool.connect();
    try {
      const r = await c.query('SELECT pg_try_advisory_lock($1) ok', [key]);
      if (!r.rows[0].ok) return false;
      try { await fn(); } finally { await c.query('SELECT pg_advisory_unlock($1)', [key]); }
      return true;
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
