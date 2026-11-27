import { Pool } from 'pg';
import { m0001_baseline } from './0001_baseline';
import { m0002_mfa } from './0002_mfa';

/**
 * Verzionisane migracije baze (ADR 0002).
 * Svaka migracija se izvršava jednom, u transakciji, i bilježi u schema_migrations.
 * Nove promjene sheme idu ISKLJUČIVO kao nova datoteka s narednim brojem; postojeće se ne mijenjaju.
 */
export type Migration = { id: string; up: string };

export const MIGRATIONS: Migration[] = [m0001_baseline, m0002_mfa];

const LOCK_KEY = 72_031_001; // pg_advisory_lock: sprječava da dvije instance migriraju istovremeno

export async function migrate(pool: Pool, log: (m: string) => void = (m) => console.log(`[migracije] ${m}`)) {
  const c = await pool.connect();
  try {
    await c.query('SELECT pg_advisory_lock($1)', [LOCK_KEY]);
    await c.query(`CREATE TABLE IF NOT EXISTS schema_migrations ("id" text PRIMARY KEY, "appliedAt" timestamptz NOT NULL DEFAULT now())`);
    const done = new Set((await c.query<{ id: string }>('SELECT "id" FROM schema_migrations')).rows.map((r) => r.id));
    for (const m of MIGRATIONS) {
      if (done.has(m.id)) continue;
      try {
        await c.query('BEGIN');
        await c.query(m.up);
        await c.query('INSERT INTO schema_migrations ("id") VALUES ($1)', [m.id]);
        await c.query('COMMIT');
        log(`primijenjena ${m.id}`);
      } catch (e) {
        await c.query('ROLLBACK');
        throw new Error(`Migracija ${m.id} nije uspjela: ${(e as Error).message}`);
      }
    }
  } finally {
    await c.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]).catch(() => {});
    c.release();
  }
}
