// Server-side pozivi prema NestJS API-ju.
const API = process.env.API_INTERNAL_URL || 'http://localhost:4000';

export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: 'no-store', ...init });
  if (res.status === 404) throw Object.assign(new Error('Nije pronađeno'), { status: 404 });
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

export async function apiSafe<T>(path: string, fallback: T): Promise<T> {
  try {
    return await api<T>(path);
  } catch {
    return fallback;
  }
}

export type PostListItem = {
  id: string; slug: string; type: string; category: string; title: string; excerpt: string; coverImage: string | null;
  publishedAt: string; deadline: string | null; views: number; authorName: string; isDemo: boolean; attachmentCount?: number;
};
export type Doc = {
  id: string; title: string; docType: string; sector: string; number: string | null; issuedAt: string | null; status: string;
  description: string; fileName: string; mimeType: string; size: number; downloads: number; isDemo: boolean; createdAt: string;
};
export type Permit = {
  id: string; registerNumber: string; operator: string; facility: string; activity: string; municipality: string; address: string;
  issuedAt: string; validUntil: string; status: string; description: string; lat: number | null; lng: number | null; isDemo: boolean; documents?: Doc[];
};
export type Facility = {
  id: string; name: string; kind: string; stars: number | null; municipality: string; address: string; rooms: number | null; beds: number | null;
  decisionNumber: string | null; decisionDate: string | null; lat: number | null; lng: number | null; isDemo: boolean;
};
export type MapPoint = { id: string; layer: 'TURIZAM' | 'ZASTICENO' | 'DOZVOLA' | 'PROJEKT'; name: string; description: string; lat: number; lng: number; link: string | null };
