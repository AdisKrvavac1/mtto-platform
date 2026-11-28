/**
 * F2-18: vanjski izvori podataka u produkciji.
 *
 * - Svaki izvor (FIRMS, Meteoalarm, GloFAS, CAMS) ima interval osvježavanja i prag zastarjelosti.
 * - Raspored svake minute (pod advisory lockom 727021) osvježava izvore kojima je istekao interval;
 *   posjetilac portala nikad ne čeka vanjski servis — čita zadnji uspješni odgovor iz baze (source_cache).
 * - Greška ne briše stare podatke: ostaju zadnji uspješni, uz oznaku greške i vremena.
 * - Kad izvor ne odgovara 3 puta zaredom ili su podaci stariji od praga, administratorima ide e-mail
 *   (jednom po prekidu); kad se izvor vrati, ide poruka da ponovo radi.
 *
 * Primaoci: SOURCE_ALERT_TO (zarezom odvojene adrese) ili aktivni administratori institucije mtto.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Db, withTenant } from './db';
import { footer, queueMail } from './mail';
import { logJson } from './observability';

export type SourceDef<T = any> = {
  key: string;
  label: string;
  everyMs: number;
  staleMs: number;
  fetch: () => Promise<T>;
  fallback: T;
};
export type SourceState<T = any> = { key: string; label: string; data: T; okAt: string | null; checkedAt: string | null; error: string | null; failures: number; stale: boolean; alerted: boolean };

const FAILS_BEFORE_ALERT = 3;
const RETRY_AFTER_FAIL_MS = 5 * 60_000;
const MEMO_MS = 10_000;

@Injectable()
export class SourceHub implements OnModuleInit {
  private defs = new Map<string, SourceDef>();
  private memo = new Map<string, { at: number; s: SourceState }>();
  private inflight = new Map<string, Promise<SourceState>>();
  constructor(private db: Db) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test' || process.env.RISK_FIXTURE === '1') return;
    const run = () => this.tick().catch((e) => logJson('error', 'Osvježavanje izvora nije uspjelo', { error: e?.message }));
    setTimeout(run, 5_000).unref();
    setInterval(run, 60_000).unref();
  }

  register<T>(def: SourceDef<T>) { this.defs.set(def.key, def); }
  list() { return [...this.defs.values()]; }

  /** Zadnji poznati podaci izvora. Ako izvor nikad nije učitan, učitava ga odmah (jednom, i za istovremene zahtjeve). */
  async get<T>(key: string): Promise<SourceState<T>> {
    const m = this.memo.get(key);
    if (m && Date.now() - m.at < MEMO_MS) return m.s as SourceState<T>;
    const row = await this.row(key);
    if (!row || !row.okAt && !row.checkedAt) return this.refresh(key) as Promise<SourceState<T>>;
    const s = this.state(key, row);
    this.memo.set(key, { at: Date.now(), s });
    return s as SourceState<T>;
  }

  async all(): Promise<SourceState[]> {
    return Promise.all(this.list().map(async (d) => {
      const row = await this.row(d.key);
      return this.state(d.key, row ?? { data: d.fallback, okAt: null, checkedAt: null, error: null, failures: 0, alertedAt: null });
    }));
  }

  /** Jedno osvježavanje izvora; greška se bilježi, ne baca. */
  refresh(key: string): Promise<SourceState> {
    const running = this.inflight.get(key);
    if (running) return running;
    const p = this.doRefresh(key).finally(() => this.inflight.delete(key));
    this.inflight.set(key, p);
    return p;
  }

  /** Raspored: osvježi izvore kojima je istekao interval (nakon greške ranije, svakih 5 min). */
  async tick(now = Date.now()) {
    let ran = 0;
    await this.db.withLock(727021, async () => {
      for (const d of this.list()) {
        const row = await this.row(d.key);
        const last = row?.checkedAt ? Date.parse(row.checkedAt) : 0;
        const every = row?.failures ? Math.min(d.everyMs, RETRY_AFTER_FAIL_MS) : d.everyMs;
        if (now - last >= every - 5_000) { await this.refresh(d.key); ran++; }
      }
    });
    return ran;
  }

  private async row(key: string) {
    return this.db.one<any>(`SELECT "data","okAt","checkedAt","error","failures","alertedAt" FROM source_cache WHERE "key"=$1`, [key]);
  }

  private state(key: string, r: any): SourceState {
    const d = this.defs.get(key)!;
    const okAt = r.okAt ? new Date(r.okAt).toISOString() : null;
    return {
      key, label: d?.label ?? key, data: r.data ?? d?.fallback, okAt, checkedAt: r.checkedAt ? new Date(r.checkedAt).toISOString() : null,
      error: r.error ?? null, failures: r.failures ?? 0, alerted: !!r.alertedAt,
      stale: !okAt || Date.now() - Date.parse(okAt) > (d?.staleMs ?? Infinity),
    };
  }

  private async doRefresh(key: string): Promise<SourceState> {
    const d = this.defs.get(key);
    if (!d) throw new Error(`Nepoznat izvor ${key}`);
    const before = await this.row(key);
    try {
      const data = await d.fetch();
      await this.db.q(
        `INSERT INTO source_cache ("key","data","okAt","checkedAt","error","failures","alertedAt") VALUES ($1,$2,now(),now(),NULL,0,NULL)
         ON CONFLICT ("key") DO UPDATE SET "data"=EXCLUDED."data","okAt"=now(),"checkedAt"=now(),"error"=NULL,"failures"=0,"alertedAt"=NULL`,
        [key, JSON.stringify(data)],
      );
      if (before?.alertedAt) await this.notify(d, 'ok', null, before);
    } catch (e: any) {
      const error = String(e?.message ?? e).slice(0, 500);
      logJson('warn', 'Izvor podataka ne odgovara', { source: key, error });
      const r = await this.db.one<any>(
        `INSERT INTO source_cache ("key","data","checkedAt","error","failures") VALUES ($1,$2,now(),$3,1)
         ON CONFLICT ("key") DO UPDATE SET "checkedAt"=now(),"error"=EXCLUDED."error","failures"=source_cache."failures"+1
         RETURNING "okAt","failures","alertedAt"`,
        [key, JSON.stringify(d.fallback), error],
      );
      const stale = !r.okAt || Date.now() - Date.parse(r.okAt) > d.staleMs;
      if (!r.alertedAt && (r.failures >= FAILS_BEFORE_ALERT || (stale && r.okAt))) {
        await this.db.q(`UPDATE source_cache SET "alertedAt"=now() WHERE "key"=$1`, [key]);
        await this.notify(d, 'down', error, r);
      }
    }
    this.memo.delete(key);
    const s = this.state(key, await this.row(key));
    return s;
  }

  private async notify(d: SourceDef, kind: 'down' | 'ok', error: string | null, r: any) {
    await withTenant('mtto', async () => {
      const fixed = (process.env.SOURCE_ALERT_TO ?? '').split(',').map((x) => x.trim()).filter(Boolean);
      const to = fixed.length ? fixed : (await this.db.q<{ email: string }>(`SELECT "email" FROM users WHERE "role"='ADMIN' AND "active"`)).map((u) => u.email);
      const last = r?.okAt ? new Date(r.okAt).toLocaleString('bs-BA', { timeZone: 'Europe/Sarajevo' }) : 'nikad';
      for (const addr of to) {
        await queueMail(this.db, kind === 'down'
          ? {
            to: addr, ref: `izvor:${d.key}`, subject: `Izvor podataka ne odgovara: ${d.label}`,
            text: [`Izvor „${d.label}“ ne odgovara (${r?.failures ?? 1} pokušaja zaredom).`, '', `Greška: ${error}`, `Zadnji uspješni podaci: ${last}`, '',
              'Portal i dalje prikazuje zadnje uspješne podatke uz oznaku vremena. Raspored pokušava ponovo svakih 5 minuta.',
              'Kad izvor proradi, dobit ćete novu poruku.', footer()].join('\n'),
          }
          : {
            to: addr, ref: `izvor:${d.key}`, subject: `Izvor podataka ponovo radi: ${d.label}`,
            text: [`Izvor „${d.label}“ ponovo odgovara i podaci na portalu su osvježeni.`, footer()].join('\n'),
          });
      }
    });
  }
}
