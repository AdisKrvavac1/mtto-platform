/**
 * E-mail obavještenja (SMTP Ministarstva, npr. e-usluge@mtto.gov.ba na Globalhostu).
 *
 * queue() samo upisuje poruku u mail_outbox (u kontekstu institucije); MailScheduler je šalje svake minute.
 * Bez SMTP postavki poruke čekaju u tabeli i šalju se kad se postavke dodaju.
 * Neuspjelo slanje se ponavlja s odgodom (1, 5, 15, 60 min), nakon 5 pokušaja status je NEUSPJELO.
 *
 * Varijable: SMTP_HOST, SMTP_PORT (465 = TLS, 587 = STARTTLS), SMTP_USER, SMTP_PASSWORD,
 * MAIL_FROM (npr. "Ministarstvo trgovine, turizma i zaštite okoliša HNK <e-usluge@mtto.gov.ba>"), MAIL_REPLY_TO.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { Db, id } from './db';
import { logJson } from './observability';

const RETRY_MIN = [1, 5, 15, 60];
const MAX_ATTEMPTS = 5;
const EMAIL_RE = /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/;

export const mailConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.MAIL_FROM);

export type Mail = { to: string; subject: string; text: string; replyTo?: string | null; ref?: string | null };

/** Upis u red za slanje. Neispravna adresa se preskače (vraća false), ne ruši posao koji je pozvao slanje. */
export async function queueMail(db: Db, m: Mail): Promise<boolean> {
  const to = String(m.to ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(to) || to.length > 200) return false;
  const subject = m.subject.replace(/[\r\n]+/g, ' ').slice(0, 200);
  await db.insert('mail_outbox', { id: id(), to, subject, text: m.text.slice(0, 20_000), replyTo: m.replyTo ?? process.env.MAIL_REPLY_TO ?? null, ref: m.ref ?? null }, `"id"`);
  return true;
}

/** Potpis i napomena na dnu svake poruke. */
export function footer() {
  return [
    '',
    '—',
    'Ministarstvo trgovine, turizma i zaštite okoliša HNK',
    'Braće Fejića bb, 88000 Mostar · +387 36 551 823',
    '',
    'Ova poruka je poslana automatski s portala Ministarstva.',
  ].join('\n');
}

@Injectable()
export class MailScheduler implements OnModuleInit {
  private transport: Transporter | null = null;
  private warned = false;
  constructor(private db: Db) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test') return;
    setInterval(() => this.tick().catch((e) => logJson('error', 'Slanje pošte nije uspjelo', { error: e?.message })), 60_000).unref();
  }

  /** Samo za testove: zamjenski transport. */
  useTransport(t: Transporter) { this.transport = t; }

  private getTransport() {
    if (!this.transport) {
      const port = Number(process.env.SMTP_PORT || 465);
      this.transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST, port, secure: port === 465, requireTLS: port !== 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
        connectionTimeout: 15_000, greetingTimeout: 15_000, socketTimeout: 30_000,
        tls: { minVersion: 'TLSv1.2' },
      });
    }
    return this.transport;
  }

  /** Provjera veze i prijave na SMTP (za health i ručnu provjeru). */
  async verify(): Promise<{ ok: boolean; error?: string }> {
    if (!mailConfigured()) return { ok: false, error: 'SMTP nije podešen' };
    try { await this.getTransport().verify(); return { ok: true }; } catch (e: any) { return { ok: false, error: String(e?.message ?? e).slice(0, 200) }; }
  }

  async tick(max = 20) {
    if (!mailConfigured()) {
      if (!this.warned) { logJson('warn', 'SMTP nije podešen: e-mail obavještenja čekaju u redu', {}); this.warned = true; }
      return { sent: 0, failed: 0 };
    }
    let sent = 0, failed = 0;
    await this.db.system(() => this.db.withLock(727011, async () => {
      const due = await this.db.q<{ id: string; to: string; subject: string; text: string; replyTo: string | null; attempts: number }>(
        `SELECT "id","to","subject","text","replyTo","attempts" FROM mail_outbox WHERE "status"='CEKA' AND "nextAttemptAt" <= now() ORDER BY "createdAt" LIMIT ${max}`,
      );
      for (const m of due) {
        try {
          await this.getTransport().sendMail({ from: process.env.MAIL_FROM, to: m.to, subject: m.subject, text: m.text, replyTo: m.replyTo || undefined });
          await this.db.q(`UPDATE mail_outbox SET "status"='POSLANO', "sentAt"=now(), "attempts"="attempts"+1, "lastError"=NULL WHERE "id"=$1`, [m.id]);
          sent++;
        } catch (e: any) {
          const attempts = m.attempts + 1;
          const final = attempts >= MAX_ATTEMPTS;
          await this.db.q(
            `UPDATE mail_outbox SET "attempts"=$2, "lastError"=$3, "status"=$4, "nextAttemptAt"=now() + ($5 || ' minutes')::interval WHERE "id"=$1`,
            [m.id, attempts, String(e?.message ?? e).slice(0, 500), final ? 'NEUSPJELO' : 'CEKA', String(RETRY_MIN[Math.min(attempts - 1, RETRY_MIN.length - 1)])],
          );
          failed++;
          logJson(final ? 'error' : 'warn', 'E-mail nije poslan', { id: m.id, attempts, error: String(e?.message ?? e).slice(0, 200) });
        }
      }
    }));
    return { sent, failed };
  }
}
