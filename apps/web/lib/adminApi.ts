'use client';
// Klijentski pozivi prema /api/admin/* s JWT tokenom iz sessionStorage.
const KEY = 'mtto_cms_token';
const USER = 'mtto_cms_user';

export type CmsUser = { id: string; name: string; email: string; role: string };

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
  if (res.status === 401) {
    clearSession();
    if (typeof window !== 'undefined' && !location.pathname.endsWith('/admin/prijava')) location.href = '/admin/prijava';
  }
  if (!res.ok) {
    let msg = `Greška ${res.status}`;
    try { const j = await res.json(); msg = Array.isArray(j.message) ? j.message.join(', ') : j.message || msg; } catch {}
    const e = new ApiError(msg); e.status = res.status; throw e;
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export async function login(email: string, password: string) {
  const r = await adminFetch<{ token: string; user: CmsUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  setSession(r.token, r.user);
  return r.user;
}
