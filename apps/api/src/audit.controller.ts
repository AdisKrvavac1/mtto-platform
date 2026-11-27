/** F1-04: pregled, izvoz i provjera lanca dnevnika aktivnosti (samo administrator). */
import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Db, Where } from './db';
import { AuthGuard } from './auth';
import { Can } from './rbac';

const COLS = `"seq","id","createdAt","userId","userName","action","entity","entityId","target","changes","ip","requestId"`;

function filters(q: any) {
  const w = new Where();
  if (q.q) w.add(`("action" ILIKE ? OR "target" ILIKE ? OR "userName" ILIKE ?)`, `%${q.q}%`, `%${q.q}%`, `%${q.q}%`);
  if (q.user) w.add(`"userId"=?`, String(q.user));
  if (q.entity) w.add(`"entity"=?`, String(q.entity));
  if (q.entityId) w.add(`"entityId"=?`, String(q.entityId));
  if (q.from) w.add(`"createdAt" >= ?`, new Date(String(q.from)));
  if (q.to) w.add(`"createdAt" < ?::timestamptz + interval '1 day'`, new Date(String(q.to)));
  return w;
}

function csvCell(v: unknown) {
  let s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // zaštita od formula u Excelu
  return `"${s.replace(/"/g, '""')}"`;
}

@Controller('admin/audit')
@UseGuards(AuthGuard)
export class AuditController {
  constructor(private db: Db) {}

  /** Lista s filterima i stranicama (cursor = seq zadnjeg zapisa s prethodne stranice). */
  @Get()
  @Can('dnevnik', 'read')
  async list(@Query() q: any) {
    const w = filters(q);
    if (q.cursor) w.add(`"seq" < ?`, Number(q.cursor));
    const limit = Math.min(Math.max(Number(q.limit) || 50, 1), 200);
    const rows = await this.db.q(`SELECT ${COLS} FROM audit_log ${w.sql} ORDER BY "seq" DESC LIMIT ${limit + 1}`, w.params);
    const more = rows.length > limit;
    const items = rows.slice(0, limit);
    return { items, nextCursor: more ? String(items[items.length - 1].seq) : null };
  }

  @Get('export.csv')
  @Can('dnevnik', 'read')
  async csv(@Query() q: any, @Res() res: Response) {
    const w = filters(q);
    const rows = await this.db.q(`SELECT ${COLS} FROM audit_log ${w.sql} ORDER BY "seq" DESC LIMIT 50000`, w.params);
    const head = ['Redni broj', 'Vrijeme (UTC)', 'Korisnik', 'Radnja', 'Vrsta zapisa', 'ID zapisa', 'Zapis', 'Izmjene', 'Mreža', 'ID zahtjeva'];
    const lines = rows.map((r) => [r.seq, new Date(r.createdAt).toISOString(), r.userName, r.action, r.entity, r.entityId, r.target, r.changes, r.ip, r.requestId].map(csvCell).join(','));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="dnevnik-aktivnosti-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.setHeader('Cache-Control', 'no-store');
    res.send('﻿' + [head.map(csvCell).join(','), ...lines].join('\r\n'));
  }

  /** Provjera lanca: ponovo računa hash svakog zapisa i poredi s upisanim. */
  @Get('verify')
  @Can('dnevnik', 'read')
  async verify() {
    const bad = await this.db.q(`
      WITH c AS (
        SELECT "seq","hash","prevHash", lag("hash") OVER (ORDER BY "seq") AS expected_prev,
               mtto_audit_hash("prevHash","seq","userId","userName","action","entity","entityId","target","changes","createdAt") AS recomputed
        FROM audit_log)
      SELECT "seq" FROM c WHERE "hash" IS DISTINCT FROM recomputed OR "prevHash" IS DISTINCT FROM expected_prev ORDER BY "seq" LIMIT 5`);
    const total = await this.db.count(`SELECT count(*) n FROM audit_log`);
    return { ok: bad.length === 0, total, brokenAt: bad.map((r) => Number(r.seq)) };
  }
}
