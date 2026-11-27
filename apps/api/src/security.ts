import { BadRequestException, Body, Controller, Get, HttpCode, Injectable, Post, Req } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { createHash } from 'crypto';
import { CappedMap, createChallenge, randomInt, verifySolution } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { logJson } from './observability';

/**
 * IP klijenta iza Render load balancera i Next.js proxyja.
 * Klijent može sam poslati X-Forwarded-For, pa uzimamo ZADNJU javnu adresu u lancu (onu koju je dodao Render),
 * a ne prvu, koju napadač može izmisliti.
 */
const PRIVATE = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|::1$|fc|fd|fe80:|::ffff:127\.|::ffff:10\.|::ffff:192\.168\.)/i;
export function clientIp(req: any): string {
  const chain = String(req.headers?.['x-forwarded-for'] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  for (let i = chain.length - 1; i >= 0; i--) if (!PRIVATE.test(chain[i])) return chain[i];
  return chain[0] || req.ip || req.socket?.remoteAddress || 'nepoznato';
}

/** Ograničenje broja zahtjeva po IP-u (F1-10). Globalno 300/min; osjetljive rute imaju strože granice (@Throttle). */
@Injectable()
export class IpThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return clientIp(req);
  }
  protected async throwThrottlingException(ctx: ExecutionContext): Promise<void> {
    const req = ctx.switchToHttp().getRequest();
    logJson('warn', 'Previše zahtjeva', { requestId: req.id, path: req.route?.path ?? req.path, ipHash: createHash('sha256').update(clientIp(req)).digest('hex').slice(0, 12) });
    await super.throwThrottlingException(ctx, undefined as any);
  }
}

export const THROTTLE_AUTH = { default: { limit: 10, ttl: 60_000 } };
export const THROTTLE_PUBLIC_FORM = { default: { limit: 5, ttl: 60_000 } };

/* ALTCHA: zaštita javnih obrazaca bez kolačića i bez slanja podataka trećoj strani (umjesto reCAPTCHA). */
const SECRET = () => createHash('sha256').update(`mtto-altcha:${process.env.ALTCHA_SECRET || process.env.JWT_SECRET || 'dev-only-secret-dev-only-secret-0000'}`).digest('hex');
const KEY_SECRET = () => createHash('sha256').update(`mtto-altcha-key:${process.env.ALTCHA_SECRET || process.env.JWT_SECRET || 'dev-only-secret-dev-only-secret-0000'}`).digest('hex');
const used = new CappedMap<string, number>({ maxSize: 50_000 });
export const altchaEnabled = () => String(process.env.ALTCHA_ENABLED ?? 'true').toLowerCase() !== 'false';

export async function newAltchaChallenge() {
  return createChallenge({
    algorithm: 'PBKDF2/SHA-256',
    cost: 2_000,
    counter: randomInt(2_000, 6_000),
    deriveKey,
    expiresAt: new Date(Date.now() + 10 * 60_000),
    hmacSignatureSecret: SECRET(),
    hmacKeySignatureSecret: KEY_SECRET(),
  });
}

/** Provjerava ALTCHA rješenje iz obrasca (base64 JSON). Svako rješenje važi jednom. */
export async function verifyAltcha(payload: unknown): Promise<boolean> {
  if (!altchaEnabled()) return true;
  try {
    const p = JSON.parse(Buffer.from(String(payload ?? ''), 'base64').toString('utf8'));
    const key = String(p?.challenge?.signature ?? '');
    if (!key || used.get(key)) return false;
    const r = await verifySolution({ challenge: p.challenge, solution: p.solution, deriveKey, hmacSignatureSecret: SECRET(), hmacKeySignatureSecret: KEY_SECRET() });
    if (r.verified) used.set(key, Date.now());
    return r.verified;
  } catch {
    return false;
  }
}

@Controller()
export class SecurityController {
  @Get('altcha/challenge')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async challenge() {
    return newAltchaChallenge();
  }

  /** Izvještaji o kršenju Content-Security-Policy (report-only faza). Logira se samo šta je blokirano i gdje. */
  @Post('csp-report')
  @HttpCode(204)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  csp(@Body() body: any, @Req() req: any) {
    const items = Array.isArray(body) ? body.map((x) => x?.body ?? x) : [body?.['csp-report'] ?? body];
    for (const r of items.slice(0, 5)) {
      if (!r || typeof r !== 'object') throw new BadRequestException();
      logJson('warn', 'CSP', {
        requestId: req.id,
        directive: String(r['violated-directive'] ?? r.effectiveDirective ?? r['effective-directive'] ?? '').slice(0, 80),
        blocked: String(r['blocked-uri'] ?? r.blockedURL ?? '').slice(0, 200),
        page: String(r['document-uri'] ?? r.documentURL ?? '').replace(/\?.*$/, '').slice(0, 200),
      });
    }
  }
}
