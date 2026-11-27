'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Badge, btnPrimary, btnSecondary, input } from '@/components/admin/ui';
import { Eye, EyeOff, Image01, LinkExternal01, MarkerPin02, Save01 } from '@untitledui/icons';

const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), { ssr: false, loading: () => <div className="h-[240px] rounded-lg bg-[#f5f5f5] animate-pulse" /> });

export type ReviewReport = { id: string; code: string; lat: number | null; lng: number | null; isPublic: boolean; publicNote: string; photosPublic: boolean; photos: string[] };

/** Fotografija iz CMS-a: dohvaća se s tokenom, pa se prikazuje kao lokalni blob. */
function SecurePhoto({ pid, alt }: { pid: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let u: string | null = null; let off = false;
    fetch(`/api/admin/eco-report-photos/${pid}`, { cache: 'no-store', credentials: 'same-origin' })
      .then((r) => (r.ok ? r.blob() : Promise.reject())).then((b) => { if (off) return; u = URL.createObjectURL(b); setUrl(u); })
      .catch(() => !off && setErr(true));
    return () => { off = true; if (u) URL.revokeObjectURL(u); };
  }, [pid]);
  if (err) return <span className="flex aspect-square items-center justify-center rounded-[8px] bg-[#fafafa] text-[12px] text-[#737373] ring-1 ring-inset ring-[#e5e5e5]">Nedostupno</span>;
  if (!url) return <span className="block aspect-square animate-pulse rounded-[8px] bg-[#f5f5f5]" />;
  return <a href={url} target="_blank" rel="noopener" className="block aspect-square overflow-hidden rounded-[8px] ring-1 ring-inset ring-black/10 hover:opacity-90"><img src={url} alt={alt} className="size-full object-cover" /></a>;
}

export function ReportPhotos({ r }: { r: ReviewReport }) {
  if (!r.photos?.length) return <p className="mt-2 flex items-center gap-1.5 text-[12px] text-[#737373]"><Image01 size={14} />Bez fotografija</p>;
  return <div className="mt-3 grid max-w-[360px] grid-cols-3 gap-2">{r.photos.map((p, i) => <SecurePhoto key={p} pid={p} alt={`Fotografija ${i + 1} uz prijavu ${r.code}`} />)}</div>;
}

/** Inspekcija: lokacija (može se ispraviti), javno obrazloženje, fotografije i objava na karti. */
export function ReportPublish({ r, onSave }: { r: ReviewReport; onSave: (body: Record<string, unknown>) => Promise<void> }) {
  const [pos, setPos] = useState<{ lat: number | null; lng: number | null }>({ lat: r.lat, lng: r.lng });
  const [note, setNote] = useState(r.publicNote ?? '');
  const [photosPublic, setPhotosPublic] = useState(r.photosPublic ?? true);
  const [busy, setBusy] = useState(false);
  const moved = pos.lat !== r.lat || pos.lng !== r.lng;
  const dirty = moved || note.trim() !== (r.publicNote ?? '') || photosPublic !== (r.photosPublic ?? true);
  const canPublish = note.trim().length >= 10 && pos.lat != null;
  async function save(extra: Record<string, unknown> = {}) {
    setBusy(true);
    try { await onSave({ publicNote: note.trim(), photosPublic, ...(moved && pos.lat != null ? { lat: pos.lat, lng: pos.lng } : {}), ...extra }); } finally { setBusy(false); }
  }
  return (
    <div className="mt-4 grid gap-4 rounded-[12px] bg-[#fafafa] p-4 ring-1 ring-inset ring-[#e5e5e5] lg:grid-cols-2">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[14px] font-medium text-[#404040]"><MarkerPin02 size={16} className="text-[#a3a3a3]" />Lokacija incidenta</span>
          {pos.lat != null && <a className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#6941c6] hover:underline" href={`https://www.google.com/maps?q=${pos.lat},${pos.lng}`} target="_blank" rel="noopener">Google karta<LinkExternal01 size={12} /></a>}
        </div>
        <div className="overflow-hidden rounded-[8px] ring-1 ring-inset ring-[#e5e5e5]"><LocationPicker lat={pos.lat} lng={pos.lng} onChange={(lat, lng) => setPos({ lat, lng })} height={240} /></div>
        <p className="text-[12px] text-[#737373]">{pos.lat != null ? `${pos.lat}° N, ${pos.lng}° E${moved ? ' · izmijenjeno, sačuvajte' : ''}` : 'Prijavitelj nije označio lokaciju. Kliknite na kartu da je postavite.'}</p>
      </div>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[14px] font-medium text-[#404040]">Javno obrazloženje <span className="font-normal text-[#737373]">(obavezno za objavu)</span></span>
          <textarea rows={4} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="npr. Inspekcija je izašla na teren 24. 11. Deponija je potvrđena, naložena sanacija u roku od 15 dana." className={`${input} py-2 text-[14px] leading-5`} />
          <span className="text-[12px] text-[#737373]">Prikazuje se uz prijavu na javnoj karti. Lični podaci prijavitelja se nikad ne objavljuju.</span>
        </label>
        <label className={`flex items-center gap-2 text-[14px] ${r.photos?.length ? 'text-[#404040]' : 'text-[#a3a3a3]'}`}>
          <input type="checkbox" checked={photosPublic} disabled={!r.photos?.length} onChange={(e) => setPhotosPublic(e.target.checked)} className="size-4 accent-[#7f56d9]" />
          Prikaži fotografije javno{r.photos?.length ? ` (${r.photos.length})` : ''}
        </label>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {r.isPublic
            ? <><Badge tone="success" dot>Objavljeno na karti</Badge><button type="button" disabled={busy || !dirty} onClick={() => save()} className={btnSecondary}><Save01 />Sačuvaj izmjene</button><button type="button" disabled={busy} onClick={() => save({ isPublic: false })} className={btnSecondary}><EyeOff />Ukloni s karte</button></>
            : <button type="button" disabled={busy || !canPublish} onClick={() => save({ isPublic: true })} className={btnPrimary} title={canPublish ? 'Objavi na javnoj karti' : 'Upišite obrazloženje i označite lokaciju'}><Eye />Objavi na karti</button>}
          {!r.isPublic && dirty && <button type="button" disabled={busy} onClick={() => save()} className={btnSecondary}><Save01 />Sačuvaj nacrt</button>}
        </div>
      </div>
    </div>
  );
}
