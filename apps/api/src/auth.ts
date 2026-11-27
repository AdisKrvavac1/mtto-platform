import { Reflector } from '@nestjs/core';
import { createHash, randomBytes } from 'crypto';
import { BadRequestException, Body, CanActivate, Controller, ExecutionContext, ForbiddenException, Get, HttpCode, HttpException, HttpStatus, Injectable, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as QRCode from 'qrcode';
import { Db, currentTenant, id } from './db';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_AUTH } from './security';
import { AuditService } from './audit';
import { CAN_KEY, ROLE_LABELS, can, permissionsFor, type Action, type Module } from './rbac';
import { hashRecovery, newRecoveryCodes, newSecret, normalizeRecovery, openSecret, otpauthUri, sealSecret, verifyTotp } from './mfa';

const DUMMY_HASH = bcrypt.hashSync('timing-safe-dummy', 10);
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

/** Kad je MFA_REQUIRED=true, CMS je dostupan samo sesijama potvrđenim drugim faktorom. */
export const mfaRequired = () => String(process.env.MFA_REQUIRED ?? 'false').toLowerCase() === 'true';

type Session = { sub: string; name: string; role: string; mfa?: boolean; purpose?: string; sv?: number; tid?: string };

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

/** Učitava korisnika iz baze uz svaki zahtjev: deaktiviran nalog ili promijenjena uloga odmah poništava stare sesije. */
async function loadUser(db: Db, s: Session) {
  // RLS već skriva korisnike drugih institucija; provjera tid čuva od sesije prenesene na tuđu domenu
  const u = await db.one<any>('SELECT "id","name","email","role","active","sessionVersion","tenantId","sectors" FROM users WHERE "id"=$1', [s.sub]);
  if (!u || !u.active || Number(u.sessionVersion) !== Number(s.sv ?? 0) || (s.tid && s.tid !== u.tenantId) || u.tenantId !== currentTenant()) {
    throw new UnauthorizedException('Sesija više ne važi, prijavite se ponovo');
  }
  return { sub: u.id, name: u.name, email: u.email, role: u.role, mfa: !!s.mfa, sv: Number(u.sessionVersion), tenantId: u.tenantId, sectors: (u.sectors ?? []) as string[] };
}

/**
 * Puni pristup CMS-u. Uz MFA_REQUIRED odbija sesije bez drugog faktora (kod MFA_SETUP_REQUIRED).
 * Provjerava i pravo iz @Can(modul, radnja); ruta bez @Can je zabranjena (sigurnije nego zaboravljeno pravo).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private db: Db, private reflector: Reflector) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    req.user = await loadUser(this.db, await readSession(this.jwt, req));
    if (mfaRequired() && !req.user.mfa) throw new ForbiddenException({ statusCode: 403, code: 'MFA_SETUP_REQUIRED', message: 'Uključite dvofaktorsku prijavu da biste nastavili.' });
    const need = this.reflector.getAllAndOverride<{ module: Module; action: Action }>(CAN_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!need || !can(req.user.role, need.module, need.action)) {
      throw new ForbiddenException({ statusCode: 403, code: 'NO_PERMISSION', message: 'Vaša uloga nema pravo na ovu radnju.' });
    }
    return true;
  }
}

/** Samo za postavljanje MFA: prijavljen korisnik, bez obzira na drugi faktor. */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private jwt: JwtService, private db: Db) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    req.user = await loadUser(this.db, await readSession(this.jwt, req));
    return true;
  }
}

/** Lozinka: najmanje 12 znakova, ne smije sadržavati e-mail ni biti česta. */
export function passwordProblem(pw: string, email: string): string | null {
  if (pw.length < 12) return 'Lozinka mora imati najmanje 12 znakova.';
  if (pw.length > 200) return 'Lozinka je predugačka.';
  const low = pw.toLowerCase();
  const local = email.split('@')[0].toLowerCase();
  if (local.length >= 3 && low.includes(local)) return 'Lozinka ne smije sadržavati vaš e-mail.';
  if (/^(.)\1+$/.test(pw) || ['123456789012', 'password1234', 'lozinka12345', 'qwertyuiop12', 'mtto12345678'].some((c) => low.includes(c))) return 'Lozinka je previše jednostavna.';
  return null;
}

export const inviteHash = (token: string) => createHash('sha256').update(token).digest('hex');
export const newInviteToken = () => randomBytes(32).toString('base64url');

@Controller('auth')
export class AuthController {
  constructor(private db: Db, private jwt: JwtService, private auditLog: AuditService) {}

  private publicUser(u: any) {
    return { id: u.id, name: u.name, email: u.email, role: u.role, roleLabel: ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] ?? u.role, permissions: permissionsFor(u.role), sectors: u.sectors ?? [], mfaEnabled: !!u.mfaEnabled };
  }
  private session(u: any, mfa: boolean) {
    return this.jwt.signAsync({ sub: u.id, name: u.name, role: u.role, mfa, sv: Number(u.sessionVersion ?? 0), tid: u.tenantId });
  }
  private audit(u: { id?: string; name: string; email?: string }, action: string, req?: any) {
    return this.auditLog.log(req, { action, entity: 'korisnik', entityId: u.id ?? null, target: u.email ?? '' }, { id: u.id, name: u.name });
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
    return this.db.q('UPDATE users SET "failedLogins"=0, "lockedUntil"=NULL, "lastLoginAt"=now() WHERE "id"=$1', [userId]);
  }

  @Post('login')
  @Throttle(THROTTLE_AUTH)
  async login(@Body() body: { email?: string; password?: string }, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    const email = String(body?.email ?? '').trim().toLowerCase();
    const user = await this.db.one<any>('SELECT * FROM users WHERE "email"=$1', [email]);
    this.assertNotLocked(user);
    const ok = user ? await bcrypt.compare(String(body?.password ?? ''), user.passwordHash) : await bcrypt.compare('x', DUMMY_HASH);
    if (!user || !ok) {
      if (user) await this.failed(user, 'lozinka');
      throw new UnauthorizedException('Pogrešan e-mail ili lozinka');
    }
    if (!user.active) throw new UnauthorizedException('Nalog nije aktivan. Obratite se administratoru.');
    if (user.mfaEnabled) {
      const mfaToken = await this.jwt.signAsync({ sub: user.id, purpose: 'mfa' }, { expiresIn: '5m' });
      return { mfaRequired: true, mfaToken };
    }
    await this.resetFailed(user.id);
    await this.audit(user, 'Prijava u CMS', req);
    setSessionCookie(res, await this.session(user, false));
    return { user: this.publicUser(user), mfaSetupRequired: mfaRequired() };
  }

  /** Drugi korak prijave: kod iz aplikacije ili rezervni kod. */
  @Post('mfa/verify')
  @Throttle(THROTTLE_AUTH)
  async verify(@Body() body: { mfaToken?: string; code?: string }, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    let p: { sub: string; purpose?: string };
    try { p = await this.jwt.verifyAsync(String(body?.mfaToken ?? '')); } catch { throw new UnauthorizedException('Prijava je istekla, unesite lozinku ponovo'); }
    if (p.purpose !== 'mfa') throw new UnauthorizedException('Neispravan zahtjev');
    const user = await this.db.one<any>('SELECT * FROM users WHERE "id"=$1', [p.sub]);
    if (!user?.mfaEnabled || !user.active) throw new UnauthorizedException('Neispravan zahtjev');
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
    await this.audit(user, `Prijava u CMS (MFA: ${how})`, req);
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
    await this.audit(u, 'Uključena dvofaktorska prijava', req);
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
    await this.audit(u, 'Novi rezervni kodovi za MFA', req);
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
    await this.audit(u, 'Isključena dvofaktorska prijava', req);
    setSessionCookie(res, await this.session(u, false));
    return { ok: true };
  }

  /** Aktivacija naloga iz pozivnice: korisnik sam postavlja lozinku. Link važi 72 sata i radi jednom. */
  @Post('activate')
  @Throttle(THROTTLE_AUTH)
  async activate(@Body() body: { token?: string; password?: string }, @Req() req: any) {
    const token = String(body?.token ?? '');
    const u = token.length > 20 ? await this.db.one<any>('SELECT * FROM users WHERE "inviteHash"=$1 AND "inviteExpires" > now()', [inviteHash(token)]) : null;
    if (!u) throw new BadRequestException('Link za aktivaciju nije ispravan ili je istekao. Zatražite novi od administratora.');
    const pw = String(body?.password ?? '');
    const problem = passwordProblem(pw, u.email);
    if (problem) throw new BadRequestException(problem);
    await this.db.q(`UPDATE users SET "passwordHash"=$2, "inviteHash"=NULL, "inviteExpires"=NULL, "active"=true, "failedLogins"=0, "lockedUntil"=NULL,
      "sessionVersion"="sessionVersion"+1 WHERE "id"=$1`, [u.id, await bcrypt.hash(pw, 12)]);
    await this.audit(u, 'Aktivirao/la nalog i postavio/la lozinku', req);
    return { ok: true, email: u.email };
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    clearSessionCookie(res);
  }
}
