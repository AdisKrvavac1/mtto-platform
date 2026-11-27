/**
 * F1-11: koja institucija obrađuje zahtjev.
 * Redoslijed: zaglavlje X-MTTO-Tenant (postavlja ga Next.js server za svoje pozive), zatim domena
 * (X-Forwarded-Host / Host) iz tabele tenants, inače 'mtto'. Zaglavlju se smije vjerovati jer prijava
 * u CMS ionako traži korisnika iz te institucije (RLS + provjera u AuthGuard), a javni sadržaj je javan.
 */
import { Controller, Get } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { DEFAULT_TENANT, Db, currentTenant, tenantContext, withTenant, SYSTEM_TENANT } from './db';
import { logJson } from './observability';

type Tenant = { id: string; name: string; shortName: string; domains: string[]; theme: Record<string, unknown>; active: boolean };
let cache: { at: number; list: Tenant[] } = { at: 0, list: [] };
const TTL = 60_000;

export async function tenants(db: Db): Promise<Tenant[]> {
  if (Date.now() - cache.at < TTL && cache.list.length) return cache.list;
  try {
    const list = await withTenant(SYSTEM_TENANT, () => db.q<Tenant>(`SELECT "id","name","shortName","domains","theme","active" FROM tenants WHERE "active"`));
    cache = { at: Date.now(), list };
  } catch (e: any) {
    logJson('error', 'Lista institucija nije učitana', { error: e?.message });
  }
  return cache.list;
}

export function resolveTenant(list: Tenant[], header: string | undefined, host: string | undefined): string {
  const h = String(header ?? '').trim().toLowerCase();
  if (h && list.some((t) => t.id === h)) return h;
  const name = String(host ?? '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '');
  const byDomain = list.find((t) => t.domains.includes(name));
  return byDomain?.id ?? DEFAULT_TENANT;
}

export function tenantMiddleware(db: Db) {
  return (req: Request, res: Response, next: NextFunction) => {
    tenants(db).then((list) => {
      const t = resolveTenant(list, req.header('x-mtto-tenant'), req.header('x-forwarded-host') ?? req.header('host'));
      (req as any).tenant = t;
      res.setHeader('X-MTTO-Tenant', t);
      tenantContext.run(t, () => next());
    }, next);
  };
}

/** Javni podaci o instituciji za portal (naziv, tema, logo). */
export async function tenantInfo(db: Db, id: string) {
  const t = (await tenants(db)).find((x) => x.id === id);
  return t ? { id: t.id, name: t.name, shortName: t.shortName, theme: t.theme } : { id, name: id, shortName: id, theme: {} };
}

@Controller('tenant')
export class TenantController {
  constructor(private db: Db) {}
  /** GET /api/tenant: institucija za ovu domenu (portal bira naziv, logo i temu). */
  @Get()
  info() { return tenantInfo(this.db, currentTenant()); }
}
