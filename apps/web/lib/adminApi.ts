'use client';
// Klijentski pozivi prema /api/admin/* s JWT tokenom iz sessionStorage.
const KEY = 'mtto_cms_token';
const USER = 'mtto_cms_user';

export type CmsUser = { id: string; name: string; email: string; role: string; mfaEnabled?: boolean };

export function getToken() {
  if (typeof window === 'undefined') return null;
  try { return sessionStorage.getItem(KEY); } catch { return null; }
}
export function getUser(): CmsUser | null {
  try { return JSON.parse(sessionStorage.getItem(USER) || 'null'); } catch { return null; }
}
export function setSession(token: string, user: CmsUser) {
  try { sessionStorage.setItem(KEY, token); sessionStorage.setItem(USER, JSON.stringify(user)); } catch {}
}
export function clearSession() {
  try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(USER); } catch {}
}

export class ApiError extends Error { status = 0; }

export async function adminFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const t = getToken();
  if (t) headers.set('Authorization', `Bearer ${t}`);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const res = await fetch(`/api${path}`, { ...init, headers, cache: 'no-store' });
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

type LoginResult = { token?: string; user?: CmsUser; mfaRequired?: boolean; mfaToken?: string; mfaSetupRequired?: boolean };

/** Prvi korak prijave. Ako nalog ima MFA, vraća mfaToken za drugi korak. */
export async function login(email: string, password: string): Promise<{ mfaToken?: string; setupRequired?: boolean }> {
  const r = await adminFetch<LoginResult>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (r.mfaRequired && r.mfaToken) return { mfaToken: r.mfaToken };
  setSession(r.token!, r.user!);
  return { setupRequired: !!r.mfaSetupRequired };
}

/** Drugi korak: kod iz aplikacije za autentifikaciju ili rezervni kod. */
export async function verifyMfa(mfaToken: string, code: string) {
  const r = await adminFetch<{ token: string; user: CmsUser }>('/auth/mfa/verify', { method: 'POST', body: JSON.stringify({ mfaToken, code }) });
  setSession(r.token, r.user);
  return r.user;
}

/** Zamjena tokena nakon promjene MFA (npr. uključivanja), korisnik ostaje isti. */
export function replaceToken(token: string, patch: Partial<CmsUser> = {}) {
  const u = getUser();
  if (u) setSession(token, { ...u, ...patch });
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mtto-user'));
}
