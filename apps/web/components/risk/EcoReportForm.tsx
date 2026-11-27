'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AlertCircle, Camera01, CheckCircle, ImagePlus, PhoneCall01, Send01, Target04, XClose } from '@untitledui/icons';
import { KINDS } from '@/lib/reportKinds';
import type { FC, SVGProps } from 'react';

const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), { ssr: false, loading: () => <div className="h-[280px] rounded-[8px] bg-[#f5f5f5] animate-pulse" /> });

const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const label = 'text-[14px] leading-5 font-medium text-[#404040]';
const field = 'bg-white h-11 px-[14px] rounded-[8px] border border-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] text-[16px] leading-6 text-[#171717] placeholder:text-[#737373] focus:outline-none focus:border-[var(--br-300)] focus:ring-4 focus:ring-[var(--br-ring)] w-full';
const card = 'bg-white rounded-[12px] ring-1 ring-inset ring-[#e5e5e5] shadow-[0_1px_2px_rgba(10,13,18,0.05)]';
const btn = 'inline-flex items-center justify-center gap-1.5 rounded-[8px] font-semibold border-2 border-white/10 shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)]';
const btnP = `${btn} bg-[var(--br-600)] hover:bg-[var(--br-700)] text-white`;
const btnS = 'inline-flex items-center justify-center gap-1.5 rounded-[8px] font-semibold bg-white text-[#404040] hover:bg-[#fafafa] ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)]';

const MAX_PHOTOS = 3;
type Photo = { blob: Blob; url: string; name: string };

/** Smanjuje fotografiju na najviše 1600 px i sprema kao JPEG (uklanja EXIF, uključujući GPS iz fotografije). */
async function shrink(file: File): Promise<Blob> {
  let bmp: ImageBitmap;
  try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as any); }
  catch { throw new Error(`Format datoteke „${file.name}” nije podržan. Koristite JPG ili PNG fotografiju.`); }
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  return new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error('Fotografiju nije moguće obraditi.'))), 'image/jpeg', 0.82));
}

function PhotoField({ photos, setPhotos, setErr }: { photos: Photo[]; setPhotos: (f: (p: Photo[]) => Photo[]) => void; setErr: (e: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const left = MAX_PHOTOS - photos.length;
  async function add(list: FileList | File[] | null) {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name));
    if (!files.length) return;
    if (files.length > left) setErr(`Možete priložiti najviše ${MAX_PHOTOS} fotografije.`);
    setBusy(true);
    try {
      const out: Photo[] = [];
      for (const f of files.slice(0, left)) { const blob = await shrink(f); out.push({ blob, url: URL.createObjectURL(blob), name: f.name }); }
      setPhotos((p) => [...p, ...out].slice(0, MAX_PHOTOS));
    } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  }
  const pick = `${btnS} relative h-10 px-3.5 text-[14px] cursor-pointer has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[var(--br-ring)]`;
  return (
    <div className="flex flex-col gap-[8px]">
      <span className={label}>Fotografije <span className="font-normal text-[#737373]">(do {MAX_PHOTOS}, preporučeno)</span></span>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        className={`flex flex-col gap-4 rounded-[12px] border border-dashed p-4 transition-colors ${drag ? 'border-[var(--br-600)] bg-[var(--br-50)]' : 'border-[#d4d4d4] bg-[#fafafa]'}`}
      >
        {photos.length > 0 && (
          <ul className="grid max-w-[480px] grid-cols-3 gap-3">
            {photos.map((p, i) => (
              <li key={p.url} className="relative aspect-square overflow-hidden rounded-[8px] ring-1 ring-inset ring-black/10">
                <img src={p.url} alt={`Fotografija ${i + 1}`} className="size-full object-cover" />
                <button type="button" aria-label={`Ukloni fotografiju ${i + 1}`} onClick={() => setPhotos((ps) => { URL.revokeObjectURL(p.url); return ps.filter((x) => x !== p); })} className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"><XClose size={16} /></button>
              </li>
            ))}
          </ul>
        )}
        {left > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <label className={`${pick} md:hidden`}><Camera01 size={18} />Uslikaj
              <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ''; }} /></label>
            <label className={pick}><ImagePlus size={18} /><span className="md:hidden">Iz galerije</span><span className="hidden md:inline">Odaberi fotografije</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ''; }} /></label>
            <span className="hidden text-[14px] text-[#737373] md:inline">ili ih prevucite ovdje</span>
            {busy && <span className="text-[14px] text-[#737373]">Obrađujem…</span>}
          </div>
        )}
        <p className="text-[12px] leading-[18px] text-[#737373]">JPG, PNG ili WEBP. Fotografije se smanjuju prije slanja, a podaci o lokaciji iz same fotografije se uklanjaju. Fotografiju vidi inspekcija; javno se prikazuje samo ako je Ministarstvo odobri.</p>
      </div>
    </div>
  );
}

/** ALTCHA: provjera da niste robot, bez kolačića i bez slanja podataka trećoj strani (F1-10). */
function HumanCheck() {
  useEffect(() => { import('altcha').then(() => import('altcha/i18n/bs')).catch(() => {}); }, []);
  return (
    <div className="max-w-[320px]">
      <altcha-widget challenge="/api/altcha/challenge" auto="onload" language="bs" name="altcha" />
    </div>
  );
}

export default function EcoReportForm() {
  const [kind, setKind] = useState('');
  useEffect(() => { const v = new URLSearchParams(window.location.search).get('vrsta'); if (v && KINDS.some(([k]) => k === v)) setKind(v); }, []);
  const [pos, setPos] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [pickKey, setPickKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  function locate() {
    if (!navigator.geolocation) return setErr('Vaš preglednik ne podržava određivanje lokacije.');
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos({ lat: Math.round(p.coords.latitude * 1e5) / 1e5, lng: Math.round(p.coords.longitude * 1e5) / 1e5 }); setPickKey((k) => k + 1); setErr(''); },
      () => setErr('Lokaciju nije moguće odrediti. Označite mjesto klikom na kartu.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr('');
    const f = new FormData(e.currentTarget);
    if (!kind) return setErr('Odaberite vrstu incidenta.');
    if (!f.get('altcha')) return setErr('Pričekajte trenutak da se završi provjera da niste robot, pa pošaljite ponovo.');
    setBusy(true);
    try {
      const body = new FormData();
      const fields: Record<string, unknown> = { kind, municipality: f.get('municipality'), location: f.get('location'), description: f.get('description'), contactName: f.get('contactName'), contactEmail: f.get('contactEmail'), website: f.get('website'), altcha: f.get('altcha'), lat: pos.lat, lng: pos.lng };
      for (const [k, v] of Object.entries(fields)) if (v != null && v !== '') body.append(k, String(v));
      photos.forEach((p, i) => body.append('photos', p.blob, `foto-${i + 1}.jpg`));
      const r = await fetch('/api/eco-reports', { method: 'POST', body });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(Array.isArray(j.message) ? j.message[0] : j.message || 'Prijava nije poslana.');
      setDone(j.code);
      photos.forEach((p) => URL.revokeObjectURL(p.url)); setPhotos([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  }

  if (done) return (
    <div className={`${card} p-6 md:p-8 flex flex-col gap-3 items-start`} role="status">
      <span className="flex items-center justify-center size-12 rounded-full bg-[#dcfae6] text-[#079455] ring-8 ring-[#ecfdf3]"><CheckCircle size={24} /></span>
      <h2 className="mt-2 text-[24px] leading-8 font-semibold text-[#171717]">Prijava je zaprimljena</h2>
      <p className="text-[16px] leading-6 text-[#525252]">Broj vaše prijave je <b className="font-semibold text-[var(--br-700)]">{done}</b>. Službenik Ministarstva će je provjeriti. Nakon provjere prijava se može prikazati na karti Eko-rizik, bez vaših ličnih podataka.</p>
      <p className="text-[14px] text-[#d92d20]">Ako je u toku požar ili je ugrožen život, odmah pozovite 123 (vatrogasci) ili 121 (civilna zaštita).</p>
      <div className="flex flex-wrap gap-3 pt-3">
        <Link href="/eko-rizik" className={`${btnP} h-10 px-[14px] text-[14px]`}>Otvori kartu rizika</Link>
        <button type="button" onClick={() => { setDone(null); setKind(''); setPos({ lat: null, lng: null }); }} className={`${btnS} h-10 px-[14px] text-[14px]`}>Nova prijava</button>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className={`${card} p-5 md:p-8 flex flex-col gap-6`} noValidate>
      <fieldset className="flex flex-col gap-[8px]">
        <legend className={`${label} mb-[8px]`}>Šta prijavljujete? <span className="text-[var(--br-600)]">*</span></legend>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {KINDS.map(([k, l, I]) => (
            <label key={k} className={`cursor-pointer rounded-[12px] p-4 flex flex-col gap-3 items-start transition-colors ring-inset has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[var(--br-ring)] ${kind === k ? 'ring-2 ring-[var(--br-600)] bg-[var(--br-50)]' : 'ring-1 ring-[#e5e5e5] hover:bg-[#fafafa]'}`}>
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
              <span className={`flex size-8 items-center justify-center rounded-[8px] ring-1 ring-inset ${kind === k ? 'bg-[var(--br-100)] text-[var(--br-600)] ring-[var(--br-200)]' : 'bg-white text-[#525252] ring-[#d4d4d4]'}`}><I size={16} aria-hidden /></span>
              <span className={`text-[14px] leading-5 font-medium ${kind === k ? 'text-[var(--br-800)]' : 'text-[#404040]'}`}>{l}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {kind === 'POZAR' && <p className="flex gap-3 items-start p-4 rounded-[12px] bg-[#fef3f2] ring-1 ring-inset ring-[#fecdca] text-[#b42318] text-[14px] leading-5"><PhoneCall01 size={20} className="shrink-0" />Požar u toku? Prvo pozovite vatrogasce na <a href="tel:123" className="font-bold underline">123</a>, a zatim pošaljite prijavu.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        <label className="flex flex-col gap-[4px]"><span className={label}>Općina / grad <span className="text-[var(--br-600)]">*</span></span>
          <select required name="municipality" defaultValue="" className={field}><option value="" disabled>Odaberite…</option>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>Mjesto / opis lokacije</span><input name="location" maxLength={200} placeholder="npr. obala Neretve kod mosta u Bijelom Polju" className={field} /></label>
      </div>
      <div className="flex flex-col gap-[8px]">
        <div className="flex flex-wrap items-center justify-between gap-[8px]">
          <span className={label}>Lokacija na karti <span className="font-normal text-[#737373]">(preporučeno)</span></span>
          <button type="button" onClick={locate} className={`${btnS} h-9 px-3 text-[14px]`}><Target04 size={16} />Koristi moju lokaciju</button>
        </div>
        <LocationPicker key={pickKey} lat={pos.lat} lng={pos.lng} onChange={(lat, lng) => setPos({ lat, lng })} height={280} />
        <p className="text-[14px] text-[#737373]">{pos.lat != null ? `Odabrano: ${pos.lat}° N, ${pos.lng}° E` : ''}</p>
      </div>
      <label className="flex flex-col gap-[4px]"><span className={label}>Opis <span className="text-[var(--br-600)]">*</span></span>
        <textarea required name="description" rows={5} minLength={15} maxLength={2000} placeholder="Šta ste uočili, kada i koliko je izraženo…" className={`${field} h-auto py-[12px] leading-[24px]`} /></label>
      <PhotoField photos={photos} setPhotos={setPhotos} setErr={setErr} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        <label className="flex flex-col gap-[4px]"><span className={label}>Ime i prezime <span className="font-normal text-[#737373]">(opcionalno)</span></span><input name="contactName" autoComplete="name" className={field} /></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>E-pošta za povratnu informaciju <span className="font-normal text-[#737373]">(opcionalno)</span></span><input type="email" name="contactEmail" autoComplete="email" className={field} /></label>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <p className="text-[14px] leading-5 text-[#525252]">Prijava može biti anonimna. Lični podaci se koriste samo za povratnu informaciju i ne objavljuju se.</p>
      <HumanCheck />
      {err && <p role="alert" className="flex gap-3 items-start p-4 rounded-[12px] bg-[#fef3f2] ring-1 ring-inset ring-[#fecdca] text-[#b42318] text-[14px]"><AlertCircle size={20} className="shrink-0" />{err}</p>}
      <button disabled={busy} className={`${btnP} self-start h-12 px-5 text-[16px] disabled:opacity-60`}>
        <Send01 size={20} />{busy ? 'Šaljem…' : 'Pošalji prijavu'}
      </button>
    </form>
  );
}
