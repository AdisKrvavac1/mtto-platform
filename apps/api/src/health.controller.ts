import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { sql } from 'kysely';
import { Db, currentTenant } from './db';
import { FileStore } from './storage';
import { mailConfigured } from './mail';

const STARTED = Date.now();

/** F1-06: provjera rada za Render health check i vanjski uptime monitor. Bez ličnih podataka. */
@Controller('health')
export class HealthController {
  constructor(private db: Db, private files: FileStore) {}

  @Get()
  async health(@Res() res: Response) {
    const t0 = Date.now();
    try {
      const k = await this.db.k();
      const rows = await k.selectFrom('schema_migrations').select('id').orderBy('id').execute();
      await sql`SELECT 1`.execute(k);
      res.setHeader('Cache-Control', 'no-store');
      res.json({
        status: 'ok',
        db: { ok: true, latencyMs: Date.now() - t0 },
        migrations: rows.map((r) => r.id),
        storage: await this.files.check(),
        tenant: currentTenant(),
        mail: { configured: mailConfigured(), ...(await this.db.system(() => this.db.one<{ waiting: number; failed: number }>(`SELECT count(*) FILTER (WHERE "status"='CEKA')::int "waiting", count(*) FILTER (WHERE "status"='NEUSPJELO')::int "failed" FROM mail_outbox`)).catch(() => null)) },
        geo: rows.some((r) => r.id === '0003_postgis'),
        version: (process.env.RENDER_GIT_COMMIT ?? 'local').slice(0, 7),
        uptimeS: Math.round((Date.now() - STARTED) / 1000),
      });
    } catch (e) {
      res.status(503).json({ status: 'error', db: { ok: false }, error: 'Baza nije dostupna' });
    }
  }
}
