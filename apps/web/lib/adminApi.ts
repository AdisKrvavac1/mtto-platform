'use client';
import { useEffect, useState } from 'react';
// Klijentski pozivi prema /api/admin/*. Sesija je u httpOnly kolačiću (F1-03): JavaScript je ne vidi.
// U sessionStorage je samo ime i uloga korisnika za prikaz, bez ikakvog tajnog podatka.
const USER = 'mtto_cms_user';

export type Module = 'kontrolna' | 'objave' | 'dokumenti' | 'mediji' | 'registri' | 'eko' | 'uvoz' | 'korisnici' | 'dnevnik';
export type Action = 'read' | 'write' | 'delete' | 'publish';
export type CmsUser = { id: string; name: string; email: string; role: string; roleLabel?: string; permissions?: Partial<Record<Module, Action[]>>; sectors?: string[]; mfaEnabled?: boolean };
export type Sector = { id: string; key: string; name: string; active: boolean; sort: number };

/** F2-22: sme li korisnik mijenjati sadržaj sektora (ključ = kategorija objave). */
export function inMySectors(u: CmsUser | null, key: string | null | undefined) {
  if (!u || u.role === 'ADMIN' || !u.sectors?.length) return true;
  return !!key && u.sectors.includes(key);
}

let sectorCache: Promise<Sector[]> | null = null;
/** Sektori institucije (keš za trajanje stranice). */
export function useSectors() {
  const [list, setList] = useState<Sector[]>([]);
  useEffect(() => {
    sectorCache ??= adminFetch<Sector[]>('/admin/sectors').catch(() => { sectorCache = null; return []; });
    sectorCache.then(setList);
  }, []);
  return list;
}
export const resetSectors = () => { sectorCache = null; };

/** Prikaz u sučelju (meni, dugmad). Server svejedno provjerava svako pravo. */
export function can(u: CmsUser | null, module: Module, action: Action = 'read') {
  return !!u?.permissions?.[module]?.includes(action);
}

/** Da li je korisnik prijavljen (prema podacima za prikaz; server svejedno provjerava kolačić). */
export function isSignedIn() {
  if (typeof window === 'undefined') return false;
  try { return !!sessionStorage.getItem(USER); } catch { return false; }
}
export function getUser(): CmsUser | null {
  try { return JSON.parse(sessionStorage.getItem(USER) || 'null'); } catch { return null; }
}
export function setSession(user: CmsUser) {
  try { sessionStorage.setItem(USER, JSON.stringify(user)); sessionStorage.removeItem('mtto_cms_token'); } catch {}
}
export function clearSession() {
  try { sessionStorage.removeItem(USER); sessionStorage.removeItem('mtto_cms_token'); } catch {}
}
export async function logout() {
  clearSession();
  try { await fetch('/api/auth/logout', { method: 'POST', headers: { 'X-MTTO-CSRF': '1' }, credentials: 'same-origin' }); } catch {}
}

export class ApiError extends Error { status = 0; }

export async function adminFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('X-MTTO-CSRF', '1');
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const res = await fetch(`/api${path}`, { ...init, headers, cache: 'no-store', credentials: 'same-origin' });
  if (res.status === 401 && !path.startsWith('/auth/')) {
    clearSession();
    if (typeof window !== 'undefined' && !location.pathname.endsWith('/admin/prijava')) location.href = '/admin/prijava';
  }
  if (!res.ok) {
    let msg = `Greška ${res.status}`;
    let code = '';
    try { const j = await res.json(); code = j.code || ''; msg = Array.isArray(j.message) ? j.message.join(', ') : j.message || msg; } catch {}
    // Obavezna dvofaktorska prijava: korisnik bez MFA ide na postavljanje
    if (code === 'MFA_SETUP_REQUIRED' && typeof window !== 'undefined' && !location.pathname.endsWith('/admin/sigurnost')) location.href = '/admin/sigurnost?obavezno=1';
    const e = new ApiError(msg); e.status = res.status; throw e;
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

type LoginResult = { user?: CmsUser; mfaRequired?: boolean; mfaToken?: string; mfaSetupRequired?: boolean };

/** Prvi korak prijave. Ako nalog ima MFA, vraća mfaToken za drugi korak. */
export async function login(email: string, password: string): Promise<{ mfaToken?: string; setupRequired?: boolean }> {
  const r = await adminFetch<LoginResult>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (r.mfaRequired && r.mfaToken) return { mfaToken: r.mfaToken };
  setSession(r.user!);
  return { setupRequired: !!r.mfaSetupRequired };
}

/** Drugi korak: kod iz aplikacije za autentifikaciju ili rezervni kod. */
export async function verifyMfa(mfaToken: string, code: string) {
  const r = await adminFetch<{ user: CmsUser }>('/auth/mfa/verify', { method: 'POST', body: JSON.stringify({ mfaToken, code }) });
  setSession(r.user);
  return r.user;
}

/** Osvježava podatke za prikaz nakon promjene (npr. uključivanja MFA); server je već postavio novi kolačić. */
/** Svježa uloga i prava sa servera (npr. nakon što administrator promijeni ulogu). */
export async function refreshUser() {
  const me = await adminFetch<CmsUser>('/auth/me');
  updateUser({ id: me.id, name: me.name, email: me.email, role: me.role, roleLabel: me.roleLabel, permissions: me.permissions, sectors: me.sectors, mfaEnabled: me.mfaEnabled });
  return getUser();
}

export function updateUser(patch: Partial<CmsUser> = {}) {
  const u = getUser();
  if (u) setSession({ ...u, ...patch });
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mtto-user'));
}

/** Da li prijavljeni korisnik ima pravo (za skrivanje dugmadi). Do učitavanja prava vraća true, server svejedno provjerava. */
export function useCan(module: Module, action: Action = 'write') {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const f = () => { const u = getUser(); setOk(!u?.permissions || can(u, module, action)); };
    f();
    window.addEventListener('mtto-user', f);
    return () => window.removeEventListener('mtto-user', f);
  }, [module, action]);
  return ok;
}
