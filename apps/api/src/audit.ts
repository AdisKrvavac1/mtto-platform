/**
 * F1-04: dnevnik aktivnosti. Ko je, kada, šta i nad kojim zapisom uradio, s izmjenama po poljima.
 * Baza ne dozvoljava izmjenu ni brisanje zapisa, a svaki zapis nosi sha256 prethodnog (lanac), pa se naknadna
 * izmjena direktno u bazi otkriva provjerom lanca (GET /admin/audit/verify).
 */
import { Injectable } from '@nestjs/common';
import { Db, id } from './db';
import { clientIp } from './security';

/** Polja koja se nikad ne upisuju u dnevnik (tajne, binarni sadržaj, tehnička polja). */
const HIDDEN = new Set(['passwordHash', 'mfaSecret', 'mfaPendingSecret', 'mfaRecovery', 'mfaLastStep', 'inviteHash', 'data', 'geom', 'updatedAt', 'createdAt', 'views', 'downloads', 'sessionVersion', 'failedLogins', 'lockedUntil', 'lastLoginAt']);
const MAX_VAL = 300;

function norm(v: unknown): unknown {
  if (v instanceof Date) return v.toISOString();
  if (Buffer.isBuffer(v)) return undefined;
  if (typeof v === 'string' && v.length > MAX_VAL) return `${v.slice(0, MAX_VAL)}… (${v.length} znakova)`;
  if (v !== null && typeof v === 'object') { const s = JSON.stringify(v); return s.length > MAX_VAL ? `${s.slice(0, MAX_VAL)}…` : v; }
  return v ?? null;
}

/** Razlika između dva stanja zapisa: { polje: [staro, novo] }. Za novi zapis before=null, za obrisani after=null. */
export function diff(before: Record<string, any> | null, after: Record<string, any> | null): Record<string, [unknown, unknown]> | null {
  const out: Record<string, [unknown, unknown]> = {};
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  for (const k of keys) {
    if (HIDDEN.has(k)) continue;
    const a = norm(before?.[k]), b = norm(after?.[k]);
    if (a === undefined && b === undefined) continue;
    if (JSON.stringify(a) !== JSON.stringify(b)) out[k] = [a ?? null, b ?? null];
  }
  return Object.keys(out).length ? out : null;
}

/** IP adresa skraćena na mrežu (/24 za IPv4, /48 za IPv6): dovoljno za istragu, manje ličnih podataka (GDPR). */
export function ipPrefix(ip: string): string {
  if (!ip) return '';
  const v4 = ip.replace(/^::ffff:/, '');
  if (/^\d+\.\d+\.\d+\.\d+$/.test(v4)) return v4.split('.').slice(0, 3).join('.') + '.0/24';
  if (ip.includes(':')) return ip.split(':').slice(0, 3).join(':') + '::/48';
  return '';
}

export type AuditEntry = {
  action: string;
  entity?: string;
  entityId?: string | null;
  target?: string;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
};

@Injectable()
export class AuditService {
  constructor(private db: Db) {}

  /** Upis u dnevnik. `actor` je prijavljeni korisnik (req.user) ili { name } za radnje prije prijave. */
  async log(req: any, e: AuditEntry, actor?: { sub?: string; id?: string; name: string }) {
    const u = actor ?? req?.user;
    const changes = e.before !== undefined || e.after !== undefined ? diff(e.before ?? null, e.after ?? null) : null;
    await this.db.insert('audit_log', {
      id: id(),
      userId: u?.sub ?? u?.id ?? null,
      userName: u?.name ?? 'Nepoznat',
      action: e.action,
      entity: e.entity ?? null,
      entityId: e.entityId ?? null,
      target: String(e.target ?? '').slice(0, 200),
      changes: changes ? JSON.stringify(changes) : null,
      ip: req ? ipPrefix(clientIp(req)) : null,
      requestId: req?.requestId ?? req?.headers?.['x-request-id'] ?? null,
    }, `"id"`);
  }
}

