/**
 * F1-04: upravljanje korisnicima (samo administrator).
 * Novi korisnik dobija link za aktivaciju (72 h, jednokratan); administrator ga prosljeđuje službenim kanalom.
 * Promjena uloge ili deaktivacija odmah poništava sve sesije tog korisnika.
 */
import { BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { Db, currentTenant, id } from './db';
import { AuthGuard, inviteHash, newInviteToken } from './auth';
import { AuditService } from './audit';
import { Can, ROLES, ROLE_LABELS, type Role } from './rbac';

const COLS = `"id","email","name","role","active","mfaEnabled","lastLoginAt","createdAt","inviteExpires",("inviteHash" IS NOT NULL) "invitePending","sectors"`;
const INVITE_HOURS = 72;

function publicBase() {
  return (process.env.PUBLIC_URL || 'https://mtto-platform.onrender.com').replace(/\/$/, '');
}

@Controller('admin/users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private db: Db, private audit: AuditService) {}

  private async invite(userId: string) {
    const token = newInviteToken();
    await this.db.q(`UPDATE users SET "inviteHash"=$2, "inviteExpires"=now() + interval '${INVITE_HOURS} hours' WHERE "id"=$1`, [userId, inviteHash(token)]);
    // token u # dijelu adrese: ne šalje se serveru u zahtjevu za stranicu, ne ostaje u logovima ni u Refereru
    return { link: `${publicBase()}/admin/aktivacija#t=${token}`, expiresInHours: INVITE_HOURS };
  }

  private async assertNotLastAdmin(userId: string) {
    const n = await this.db.count(`SELECT count(*) n FROM users WHERE "role"='ADMIN' AND "active" AND "id"<>$1`, [userId]);
    if (n === 0) throw new BadRequestException('Mora ostati barem jedan aktivan administrator.');
  }

  @Get()
  @Can('korisnici', 'read')
  async list() {
    const users = await this.db.q(`SELECT ${COLS} FROM users ORDER BY "active" DESC, "name"`);
    return { users, roles: ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] })) };
  }

  @Post()
  @Can('korisnici', 'write')
  async create(@Body() b: any, @Req() req: any) {
    const email = String(b?.email ?? '').trim().toLowerCase();
    const name = String(b?.name ?? '').trim();
    const role = String(b?.role ?? 'UREDNIK') as Role;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('Unesite ispravan e-mail.');
    if (name.length < 3) throw new BadRequestException('Unesite ime i prezime.');
    if (!ROLES.includes(role)) throw new BadRequestException('Nepoznata uloga.');
    if (await this.db.one(`SELECT 1 FROM users WHERE "email"=$1`, [email])) throw new BadRequestException('Korisnik s tim e-mailom već postoji.');
    // lozinka koju niko ne zna, dok korisnik ne postavi svoju preko linka
    const passwordHash = await bcrypt.hash(randomBytes(32).toString('base64'), 10);
    const u = await this.db.insert('users', { id: id(), email, name, role, passwordHash, active: true, createdBy: req.user.sub }, COLS);
    await this.audit.log(req, { action: `Kreirao/la korisnika (${ROLE_LABELS[role]})`, entity: 'korisnik', entityId: u.id, target: email, after: { email, name, role } });
    return { user: u, ...(await this.invite(u.id)) };
  }

  @Patch(':id')
  @Can('korisnici', 'write')
  async update(@Param('id') userId: string, @Body() b: any, @Req() req: any) {
    const before = await this.db.one<any>(`SELECT ${COLS} FROM users WHERE "id"=$1`, [userId]);
    if (!before) throw new NotFoundException();
    const d: any = {};
    if (b.name !== undefined) { const n = String(b.name).trim(); if (n.length < 3) throw new BadRequestException('Unesite ime i prezime.'); d.name = n; }
    if (b.role !== undefined) { if (!ROLES.includes(b.role)) throw new BadRequestException('Nepoznata uloga.'); d.role = b.role; }
    if (b.active !== undefined) d.active = !!b.active;
    if (b.sectors !== undefined) {
      const keys = (await this.db.q<{ key: string }>(`SELECT "key" FROM sectors WHERE "active"`)).map((x) => x.key);
      const arr = (Array.isArray(b.sectors) ? b.sectors : []).map(String);
      const bad = arr.filter((k: string) => !keys.includes(k));
      if (bad.length) throw new BadRequestException(`Nepoznat sektor: ${bad.join(', ')}`);
      d.sectors = [...new Set(arr)];
    }
    const self = userId === req.user.sub;
    if (self && (d.active === false || (d.role && d.role !== before.role))) throw new ForbiddenException('Ne možete promijeniti vlastitu ulogu ni deaktivirati sebe.');
    if (before.role === 'ADMIN' && before.active && ((d.role && d.role !== 'ADMIN') || d.active === false)) await this.assertNotLastAdmin(userId);
    if (!Object.keys(d).length) return before;
    const sets = Object.keys(d).map((k, i) => `"${k}"=$${i + 2}`);
    const revoke = (d.role && d.role !== before.role) || d.active === false;
    if (revoke) sets.push(`"sessionVersion"="sessionVersion"+1`);
    const u = await this.db.one(`UPDATE users SET ${sets.join(',')} WHERE "id"=$1 RETURNING ${COLS}`, [userId, ...Object.values(d)]);
    const action = d.sectors !== undefined && Object.keys(d).length === 1 ? 'Promijenio/la sektore korisnika' : d.active === false ? 'Deaktivirao/la korisnika' : d.active === true && !before.active ? 'Ponovo aktivirao/la korisnika' : d.role && d.role !== before.role ? `Promijenio/la ulogu u ${ROLE_LABELS[d.role as Role]}` : 'Uredio/la korisnika';
    await this.audit.log(req, { action, entity: 'korisnik', entityId: userId, target: before.email, before, after: u });
    return u;
  }

  /** Novi link za aktivaciju. Uz resetMfa=true briše i drugi faktor (izgubljen telefon). Odjavljuje sve sesije korisnika. */
  @Post(':id/invite')
  @Can('korisnici', 'write')
  async reinvite(@Param('id') userId: string, @Body() b: any, @Req() req: any) {
    const u = await this.db.one<any>(`SELECT "id","email","active" FROM users WHERE "id"=$1`, [userId]);
    if (!u) throw new NotFoundException();
    if (userId === req.user.sub) throw new ForbiddenException('Vlastitu lozinku i drugi faktor mijenjate na stranici Sigurnost.');
    const resetMfa = b?.resetMfa !== false;
    const passwordHash = await bcrypt.hash(randomBytes(32).toString('base64'), 10);
    await this.db.q(`UPDATE users SET "passwordHash"=$2, "sessionVersion"="sessionVersion"+1, "active"=true
      ${resetMfa ? `, "mfaEnabled"=false, "mfaSecret"=NULL, "mfaPendingSecret"=NULL, "mfaRecovery"='[]'::jsonb` : ''} WHERE "id"=$1`, [userId, passwordHash]);
    await this.audit.log(req, { action: resetMfa ? 'Poslao/la novi link za aktivaciju i poništio/la drugi faktor' : 'Poslao/la novi link za aktivaciju', entity: 'korisnik', entityId: userId, target: u.email });
    return this.invite(userId);
  }

  /** Pravila institucije (npr. četiri oka za objave). */
  @Get('/settings/current')
  @Can('korisnici', 'read')
  async settings() {
    const t = await this.db.one<any>(`SELECT "settings" FROM tenants WHERE "id"=$1`, [currentTenant()]);
    return { fourEyes: !!t?.settings?.fourEyes };
  }

  @Patch('/settings/current')
  @Can('korisnici', 'write')
  async updateSettings(@Body() b: any, @Req() req: any) {
    const before = await this.settings();
    const next = { fourEyes: !!b?.fourEyes };
    await this.db.q(`UPDATE tenants SET "settings" = "settings" || $2::jsonb WHERE "id"=$1`, [currentTenant(), JSON.stringify(next)]);
    await this.audit.log(req, { action: next.fourEyes ? 'Uključio/la pravilo četiri oka za objave' : 'Isključio/la pravilo četiri oka za objave', entity: 'postavke', target: 'Pravila objave', before, after: next });
    return next;
  }
}
