import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient, types } from 'pg';

// DATE kolone vraćamo kao 'YYYY-MM-DD' (bez pomjeranja vremenske zone)
types.setTypeParser(1082, (v: string) => v);
import { randomUUID } from 'crypto';
import { migrate } from './migrations';

export { SCHEMA } from './schema';

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
  private ready = migrate(this.pool);

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
