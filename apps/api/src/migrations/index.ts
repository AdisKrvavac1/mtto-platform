import { Pool } from 'pg';
import { m0001_baseline } from './0001_baseline';
import { m0002_mfa } from './0002_mfa';
import { m0003_postgis } from './0003_postgis';
import { m0009_sectors } from './0009_sectors';
import { m0008_document_center } from './0008_document_center';
import { m0007_post_workflow } from './0007_post_workflow';
import { m0006_tenants } from './0006_tenants';
import { m0005_rbac_audit } from './0005_rbac_audit';
import { m0004_file_storage } from './0004_file_storage';

/**
 * Verzionisane migracije baze (ADR 0002).
 * Svaka migracija se izvršava jednom, u transakciji, i bilježi u schema_migrations.
 * Nove promjene sheme idu ISKLJUČIVO kao nova datoteka s narednim brojem; postojeće se ne mijenjaju.
 */
/** optional: migracija koja može javiti MTTO_SKIP (npr. nedostaje proširenje baze) — tada se preskače bez greške. */
export type Migration = { id: string; up: string; optional?: boolean };

export const MIGRATIONS: Migration[] = [m0001_baseline, m0002_mfa, m0003_postgis, m0004_file_storage, m0005_rbac_audit, m0006_tenants, m0007_post_workflow, m0008_document_center, m0009_sectors];

const LOCK_KEY = 72_031_001; // pg_advisory_lock: sprječava da dvije instance migriraju istovremeno

export async function migrate(pool: Pool, log: (m: string) => void = (m) => console.log(`[migracije] ${m}`)) {
  const c = await pool.connect();
  try {
    await c.query("SELECT set_config('app.tenant', '*', false)");
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
        const msg = (e as Error).message ?? '';
        if (m.optional && msg.includes('MTTO_SKIP')) { log(`preskočena ${m.id}: ${msg.replace('MTTO_SKIP: ', '')}`); continue; }
        throw new Error(`Migracija ${m.id} nije uspjela: ${(e as Error).message}`);
      }
    }
  } finally {
    await c.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]).catch(() => {});
    await c.query("SELECT set_config('app.tenant', '', false)").catch(() => {});
    c.release();
  }
}
