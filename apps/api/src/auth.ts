import { BadRequestException, Body, CanActivate, Controller, ExecutionContext, ForbiddenException, Get, HttpCode, HttpException, HttpStatus, Injectable, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as QRCode from 'qrcode';
import { Db, id } from './db';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_AUTH } from './security';
import { hashRecovery, newRecoveryCodes, newSecret, normalizeRecovery, openSecret, otpauthUri, sealSecret, verifyTotp } from './mfa';

const DUMMY_HASH = bcrypt.hashSync('timing-safe-dummy', 10);
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

/** Kad je MFA_REQUIRED=true, CMS je dostupan samo sesijama potvrđenim drugim faktorom. */
export const mfaRequired = () => String(process.env.MFA_REQUIRED ?? 'false').toLowerCase() === 'true';

type Session = { sub: string; name: string; role: string; mfa?: boolean; purpose?: string };

/**
 * F1-03: sesija CMS-a je u httpOnly kolačiću (JavaScript na stranici je ne može pročitati ni ukrasti).
 * __Host- prefiks: samo HTTPS, samo ovaj domen, cijeli sajt. SameSite=Strict + CSRF zaglavlje za izmjene.
 */
export const SESSION_COOKIE = '__Host-mtto_session';
const SESSION_HOURS = 8;
export const CSRF_HEADER = 'x-mtto-csrf';

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: SESSION_HOURS * 3600_000 });
}
export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' });
}

function readCookie(req: any, name: string): string {
  const raw: string = req.headers?.cookie ?? '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}

async function readSession(jwt: JwtService, req: any): Promise<Session> {
  const h: string = req.headers['authorization'] ?? '';
  const fromHeader = h.startsWith('Bearer ') ? h.slice(7) : '';
  const fromCookie = fromHeader ? '' : readCookie(req, SESSION_COOKIE);
  const token = fromHeader || fromCookie;
  if (!token) throw new UnauthorizedException('Potrebna je prijava');
  // CSRF: izmjene preko kolačića moraju nositi zaglavlje koje druga stranica ne može poslati bez CORS dozvole
  if (fromCookie && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers[CSRF_HEADER] !== '1') {
    throw new ForbiddenException('Zahtjev nije dozvoljen (CSRF zaštita)');
  }
  let s: Session;
  try { s = await jwt.verifyAsync<Session>(token); } catch { throw new UnauthorizedException('Sesija je istekla'); }
  if (s.purpose) throw new UnauthorizedException('Prijava nije završena');
  return s;
}

/** Puni pristup CMS-u. Uz MFA_REQUIRED odbija sesije bez drugog faktora (kod MFA_SETUP_REQUIRED). */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    req.user = await readSession(this.jwt, req);
    if (mfaRequired() && !req.user.mfa) throw new ForbiddenException({ statusCode: 403, code: 'MFA_SETUP_REQUIRED', message: 'Uključite dvofaktorsku prijavu da biste nastavili.' });
    return true;
  }
}

/** Samo za postavljanje MFA: prijavljen korisnik, bez obzira na drugi faktor. */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    req.user = await readSession(this.jwt, req);
    return true;
  }
}

@Controller('auth')
export class AuthController {
  constructor(private db: Db, private jwt: JwtService) {}

  private publicUser(u: any) {
    return { id: u.id, name: u.name, email: u.email, role: u.role, mfaEnabled: !!u.mfaEnabled };
  }
  private session(u: any, mfa: boolean) {
    return this.jwt.signAsync({ sub: u.id, name: u.name, role: u.role, mfa });
  }
  private audit(u: { name: string; email?: string }, action: string) {
    return this.db.insert('audit_log', { id: id(), userName: u.name, action, target: u.email ?? '' });
  }
  private assertNotLocked(u: any) {
    if (u?.lockedUntil && new Date(u.lockedUntil) > new Date()) {
      throw new HttpException(`Nalog je privremeno zaključan zbog više pogrešnih pokušaja. Pokušajte ponovo za ${LOCK_MINUTES} minuta.`, HttpStatus.TOO_MANY_REQUESTS);
    }
  }
  private async failed(u: any, what: string) {
    const n = (u.failedLogins ?? 0) + 1;
    if (n >= MAX_FAILED) {
      await this.db.q(`UPDATE users SET "failedLogins"=0, "lockedUntil"=now() + interval '${LOCK_MINUTES} minutes' WHERE "id"=$1`, [u.id]);
      await this.audit(u, `Nalog zaključan (${what})`);
    } else {
      await this.db.q('UPDATE users SET "failedLogins"=$2 WHERE "id"=$1', [u.id, n]);
    }
  }
  private resetFailed(userId: string) {
    return this.db.q('UPDATE users SET "failedLogins"=0, "lockedUntil"=NULL WHERE "id"=$1', [userId]);
  }

  @Post('login')
  @Throttle(THROTTLE_AUTH)
  async login(@Body() body: { email?: string; password?: string }, @Res({ passthrough: true }) res: Response) {
    const email = String(body?.email ?? '').trim().toLowerCase();
    const user = await this.db.one<any>('SELECT * FROM users WHERE "email"=$1', [email]);
    this.assertNotLocked(user);
    const ok = user ? await bcrypt.compare(String(body?.password ?? ''), user.passwordHash) : await bcrypt.compare('x', DUMMY_HASH);
    if (!user || !ok) {
      if (user) await this.failed(user, 'lozinka');
      throw new UnauthorizedException('Pogrešan e-mail ili lozinka');
    }
    if (user.mfaEnabled) {
      const mfaToken = await this.jwt.signAsync({ sub: user.id, purpose: 'mfa' }, { expiresIn: '5m' });
      return { mfaRequired: true, mfaToken };
    }
    await this.resetFailed(user.id);
    await this.audit(user, 'Prijava u CMS');
    setSessionCookie(res, await this.session(user, false));
    return { user: this.publicUser(user), mfaSetupRequired: mfaRequired() };
  }

  /** Drugi korak prijave: kod iz aplikacije ili rezervni kod. */
  @Post('mfa/verify')
  @Throttle(THROTTLE_AUTH)
  async verify(@Body() body: { mfaToken?: string; code?: string }, @Res({ passthrough: true }) res: Response) {
    let p: { sub: string; purpose?: string };
    try { p = await this.jwt.verifyAsync(String(body?.mfaToken ?? '')); } catch { throw new UnauthorizedException('Prijava je istekla, unesite lozinku ponovo'); }
    if (p.purpose !== 'mfa') throw new UnauthorizedException('Neispravan zahtjev');
    const user = await this.db.one<any>('SELECT * FROM users WHERE "id"=$1', [p.sub]);
    if (!user?.mfaEnabled) throw new UnauthorizedException('Neispravan zahtjev');
    this.assertNotLocked(user);
    const code = String(body?.code ?? '').trim();
    let how = '';
    if (/^\d{6}$/.test(code.replace(/\s+/g, ''))) {
      const step = verifyTotp(openSecret(user.mfaSecret), code, Number(user.mfaLastStep ?? 0));
      if (step) { await this.db.q('UPDATE users SET "mfaLastStep"=$2 WHERE "id"=$1', [user.id, step]); how = 'aplikacija'; }
    } else if (normalizeRecovery(code).length === 8) {
      const h = hashRecovery(code);
      const left: string[] = (user.mfaRecovery ?? []).filter((x: string) => x !== h);
      if (left.length < (user.mfaRecovery ?? []).length) { await this.db.q('UPDATE users SET "mfaRecovery"=$2 WHERE "id"=$1', [user.id, JSON.stringify(left)]); how = 'rezervni kod'; }
    }
    if (!how) {
      await this.failed(user, 'drugi faktor');
      throw new UnauthorizedException('Kod nije ispravan ili je istekao');
    }
    await this.resetFailed(user.id);
    await this.audit(user, `Prijava u CMS (MFA: ${how})`);
    setSessionCookie(res, await this.session(user, true));
    return { user: this.publicUser(user) };
  }

  @Get('me')
  @UseGuards(SessionGuard)
  async me(@Req() req: any) {
    const u = await this.db.one<any>('SELECT * FROM users WHERE "id"=$1', [req.user.sub]);
    if (!u) throw new UnauthorizedException('Korisnik ne postoji');
    return { ...this.publicUser(u), sessionMfa: !!req.user.mfa, mfaRequired: mfaRequired(), recoveryLeft: (u.mfaRecovery ?? []).length };
  }

  /** Korak 1 uključivanja: nova tajna, QR kod za aplikaciju. */
  @Post('mfa/setup')
  @UseGuards(SessionGuard)
  async setup(@Req() req: any) {
    const u = await this.db.one<any>('SELECT * FROM users WHERE "id"=$1', [req.user.sub]);
    if (!u) throw new UnauthorizedException();
    if (u.mfaEnabled) throw new BadRequestException('Dvofaktorska prijava je već uključena');
    const secret = newSecret();
    await this.db.q('UPDATE users SET "mfaPendingSecret"=$2 WHERE "id"=$1', [u.id, sealSecret(secret)]);
    const uri = otpauthUri(secret, u.email);
    const qr = await QRCode.toDataURL(uri, { margin: 1, width: 220, errorCorrectionLevel: 'M' });
    return { qr, secret: secret.replace(/(.{4})/g, '$1 ').trim(), uri };
  }

  /** Korak 2: potvrda prvim kodom; vraća rezervne kodove (prikazuju se samo jednom). */
  @Post('mfa/enable')
  @UseGuards(SessionGuard)
  async enable(@Req() req: any, @Body() body: { code?: string }, @Res({ passthrough: true }) res: Response) {
    const u = await this.db.one<any>('SELECT * FROM users WHERE "id"=$1', [req.user.sub]);
    if (!u?.mfaPendingSecret) throw new BadRequestException('Prvo pokrenite postavljanje');
    const secret = openSecret(u.mfaPendingSecret);
    const step = verifyTotp(secret, String(body?.code ?? ''));
    if (!step) throw new BadRequestException('Kod nije ispravan. Provjerite da je vrijeme na telefonu tačno.');
    const codes = newRecoveryCodes();
    await this.db.q(
      'UPDATE users SET "mfaEnabled"=true, "mfaSecret"=$2, "mfaPendingSecret"=NULL, "mfaLastStep"=$3, "mfaRecovery"=$4 WHERE "id"=$1',
      [u.id, sealSecret(secret), step, JSON.stringify(codes.map(hashRecovery))],
    );
    await this.audit(u, 'Uključena dvofaktorska prijava');
    setSessionCookie(res, await this.session(u, true));
    return { recoveryCodes: codes };
  }

  /** Novi rezervni kodovi (stari prestaju važiti); traži važeći kod iz aplikacije. */
  @Post('mfa/recovery')
  @UseGuards(SessionGuard)
  async recovery(@Req() req: any, @Body() body: { code?: string }) {
    const u = await this.db.one<any>('SELECT * FROM users WHERE "id"=$1', [req.user.sub]);
    if (!u?.mfaEnabled) throw new BadRequestException('Dvofaktorska prijava nije uključena');
    const step = verifyTotp(openSecret(u.mfaSecret), String(body?.code ?? ''), Number(u.mfaLastStep ?? 0));
    if (!step) throw new BadRequestException('Kod nije ispravan');
    const codes = newRecoveryCodes();
    await this.db.q('UPDATE users SET "mfaLastStep"=$2, "mfaRecovery"=$3 WHERE "id"=$1', [u.id, step, JSON.stringify(codes.map(hashRecovery))]);
    await this.audit(u, 'Novi rezervni kodovi za MFA');
    return { recoveryCodes: codes };
  }

  /** Isključivanje: lozinka + kod. Nije dozvoljeno kad je MFA obavezan. */
  @Post('mfa/disable')
  @UseGuards(SessionGuard)
  async disable(@Req() req: any, @Body() body: { password?: string; code?: string }, @Res({ passthrough: true }) res: Response) {
    if (mfaRequired()) throw new ForbiddenException('Dvofaktorska prijava je obavezna za sve korisnike CMS-a');
    const u = await this.db.one<any>('SELECT * FROM users WHERE "id"=$1', [req.user.sub]);
    if (!u?.mfaEnabled) throw new BadRequestException('Dvofaktorska prijava nije uključena');
    const pass = await bcrypt.compare(String(body?.password ?? ''), u.passwordHash);
    const step = verifyTotp(openSecret(u.mfaSecret), String(body?.code ?? ''), Number(u.mfaLastStep ?? 0));
    if (!pass || !step) throw new BadRequestException('Lozinka ili kod nisu ispravni');
    await this.db.q(`UPDATE users SET "mfaEnabled"=false, "mfaSecret"=NULL, "mfaRecovery"='[]'::jsonb WHERE "id"=$1`, [u.id]);
    await this.audit(u, 'Isključena dvofaktorska prijava');
    setSessionCookie(res, await this.session(u, false));
    return { ok: true };
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    clearSessionCookie(res);
  }
}
