'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), { ssr: false, loading: () => <div className="h-[280px] rounded-[8px] bg-[#eff4ff] animate-pulse" /> });

const KINDS: [string, string, string][] = [
  ['POZAR', 'Požar ili dim', 'local_fire_department'], ['DEPONIJA', 'Divlja deponija', 'delete'], ['VODA', 'Zagađenje vode', 'water_drop'],
  ['ZRAK', 'Zrak / neugodni mirisi', 'air'], ['KLIZISTE', 'Klizište / odron', 'landslide'], ['POPLAVA', 'Poplava / bujica', 'flood'],
  ['SJECA', 'Nelegalna sječa', 'forest'], ['OSTALO', 'Ostalo', 'more_horiz'],
];
const MUNICIPALITIES = ['Čapljina', 'Čitluk', 'Jablanica', 'Konjic', 'Mostar', 'Neum', 'Prozor-Rama', 'Ravno', 'Stolac'];
const label = 'font-pub font-semibold text-[#0f172a] text-[14px] tracking-[0.14px] leading-[20px]';
const field = 'bg-white h-[44px] px-[16px] rounded-[4px] border border-[#c3c6d0] font-pub text-[15px] text-[#0f172a] placeholder:text-[#737780] focus:outline-none focus:border-[#00abeb] focus:ring-2 focus:ring-[#00abeb]/25 w-full';

export default function EcoReportForm() {
  const [kind, setKind] = useState('');
  const [pos, setPos] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [pickKey, setPickKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<string | null>(null);

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
    setBusy(true);
    try {
      const r = await fetch('/api/eco-reports', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, municipality: f.get('municipality'), location: f.get('location'), description: f.get('description'), contactName: f.get('contactName'), contactEmail: f.get('contactEmail'), website: f.get('website'), lat: pos.lat, lng: pos.lng }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(Array.isArray(j.message) ? j.message[0] : j.message || 'Prijava nije poslana.');
      setDone(j.code);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  }

  if (done) return (
    <div className="bg-white rounded-[8px] p-[32px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-[12px] items-start" role="status">
      <span className="flex items-center justify-center size-[56px] rounded-[8px] bg-[#ecfdf5] text-[#006c4a]"><span aria-hidden className="material-symbols-outlined text-[32px]">task_alt</span></span>
      <h2 className="font-pub font-bold text-[#002042] text-[24px] leading-[32px]">Prijava je zaprimljena</h2>
      <p className="font-pub text-[15px] leading-[24px] text-[#334155]">Broj vaše prijave je <b className="font-rmono">{done}</b>. Službenik Ministarstva će je provjeriti. Nakon provjere prijava se može prikazati na karti Eko-rizik, bez vaših ličnih podataka.</p>
      <p className="font-pub text-[14px] text-[#ba1a1a]">Ako je u toku požar ili je ugrožen život, odmah pozovite 123 (vatrogasci) ili 121 (civilna zaštita).</p>
      <div className="flex flex-wrap gap-[8px] pt-[8px]">
        <Link href="/eko-rizik" className="bg-[#002042] text-white px-[16px] py-[10px] rounded-[4px] font-pub font-semibold text-[14px]">Otvori kartu rizika</Link>
        <button type="button" onClick={() => { setDone(null); setKind(''); setPos({ lat: null, lng: null }); }} className="bg-[#eff4ff] text-[#002042] px-[16px] py-[10px] rounded-[4px] font-pub font-semibold text-[14px]">Nova prijava</button>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className="bg-white rounded-[8px] p-[20px] md:p-[32px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-[20px]" noValidate>
      <fieldset className="flex flex-col gap-[8px]">
        <legend className={`${label} mb-[8px]`}>Šta prijavljujete? <span className="text-[#ba1a1a]">*</span></legend>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[8px]">
          {KINDS.map(([k, l, i]) => (
            <label key={k} className={`cursor-pointer rounded-[8px] border p-[12px] flex flex-col gap-[6px] items-start transition-colors ${kind === k ? 'border-[#002042] bg-[#eff4ff] ring-2 ring-[#002042]/20' : 'border-[#c3c6d0] hover:bg-[#f8f9ff]'}`}>
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
              <span aria-hidden className={`material-symbols-outlined text-[22px] ${k === 'POZAR' ? 'text-[#ba1a1a]' : 'text-[#002042]'}`}>{i}</span>
              <span className="font-pub font-semibold text-[13px] leading-[18px] text-[#002042]">{l}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {kind === 'POZAR' && <p className="flex gap-[8px] items-start p-[12px] rounded-[4px] bg-[#ffdad6] text-[#93000a] font-pub text-[14px]"><span aria-hidden className="material-symbols-outlined">call</span>Požar u toku? Prvo pozovite vatrogasce na <a href="tel:123" className="font-bold underline">123</a>, a zatim pošaljite prijavu.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        <label className="flex flex-col gap-[4px]"><span className={label}>Općina / grad <span className="text-[#ba1a1a]">*</span></span>
          <select required name="municipality" defaultValue="" className={field}><option value="" disabled>Odaberite…</option>{MUNICIPALITIES.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>Mjesto / opis lokacije</span><input name="location" maxLength={200} placeholder="npr. obala Neretve kod mosta u Bijelom Polju" className={field} /></label>
      </div>
      <div className="flex flex-col gap-[8px]">
        <div className="flex flex-wrap items-center justify-between gap-[8px]">
          <span className={label}>Lokacija na karti <span className="font-normal text-[#737780] text-[12px]">(preporučeno)</span></span>
          <button type="button" onClick={locate} className="bg-[#eff4ff] hover:bg-[#dce9ff] text-[#002042] px-[12px] py-[6px] rounded-[4px] font-pub font-semibold text-[13px] flex items-center gap-[6px]"><span aria-hidden className="material-symbols-outlined text-[16px]">my_location</span>Koristi moju lokaciju</button>
        </div>
        <LocationPicker key={pickKey} lat={pos.lat} lng={pos.lng} onChange={(lat, lng) => setPos({ lat, lng })} height={280} />
        <p className="font-rob text-[12px] text-[#737780]">{pos.lat != null ? `Odabrano: ${pos.lat}° N, ${pos.lng}° E` : ''}</p>
      </div>
      <label className="flex flex-col gap-[4px]"><span className={label}>Opis <span className="text-[#ba1a1a]">*</span></span>
        <textarea required name="description" rows={5} minLength={15} maxLength={2000} placeholder="Šta ste uočili, kada i koliko je izraženo…" className={`${field} h-auto py-[12px] leading-[24px]`} /></label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        <label className="flex flex-col gap-[4px]"><span className={label}>Ime i prezime <span className="font-normal text-[#737780] text-[12px]">(opcionalno)</span></span><input name="contactName" autoComplete="name" className={field} /></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>E-pošta za povratnu informaciju <span className="font-normal text-[#737780] text-[12px]">(opcionalno)</span></span><input type="email" name="contactEmail" autoComplete="email" className={field} /></label>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <p className="font-pub text-[12px] leading-[18px] text-[#737780]">Prijava može biti anonimna. Lični podaci se koriste samo za povratnu informaciju i ne objavljuju se.</p>
      {err && <p role="alert" className="p-[12px] rounded-[4px] bg-[#ffdad6] text-[#93000a] font-pub text-[14px]">{err}</p>}
      <button disabled={busy} className="self-start bg-[#006c4a] hover:bg-[#005339] disabled:opacity-60 text-white flex gap-[8px] items-center px-[32px] py-[12px] rounded-[4px] font-pub font-semibold text-[15px]">
        <span aria-hidden className="material-symbols-outlined text-[18px]">send</span>{busy ? 'Šaljem…' : 'Pošalji prijavu'}
      </button>
    </form>
  );
}
