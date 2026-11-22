'use client';
import { useState } from 'react';

const SECTORS = [
  { v: 'info@mtto.gov.ba', l: 'Opći upit (centrala)' },
  { v: 'ministar@mtto.gov.ba', l: 'Kabinet ministra' },
  { v: 'turizam@mtto.gov.ba', l: 'Sektor za turizam i ugostiteljstvo' },
  { v: 'tajnik@mtto.gov.ba', l: 'Tajništvo / pristup informacijama' },
];
const KINDS = ['Opći upit građana ili privrede', 'Zahtjev za slobodan pristup informacijama (ZOSPI)', 'Prijedlog ili primjedba'];

const label = 'font-pub font-semibold text-[#0f172a] text-[14px] tracking-[0.14px] leading-[20px]';
const field = 'bg-white h-[44px] px-[16px] rounded-[4px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border border-transparent font-pub text-[15px] text-[#0f172a] placeholder:text-[#737780] focus:outline-none focus:border-[#00abeb] focus:ring-2 focus:ring-[#00abeb]/25 w-full';

/** Upit se šalje putem korisnikovog e-mail klijenta na službenu adresu sektora (bez pohrane podataka na portalu). */
export default function InquiryForm() {
  const [sent, setSent] = useState(false);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const to = String(f.get('to'));
    const subject = `${f.get('kind')} – ${f.get('name')}`;
    const body = [String(f.get('message')), '', '—', `Ime i prezime: ${f.get('name')}`, f.get('org') ? `Organizacija: ${f.get('org')}` : '', `E-pošta: ${f.get('email')}`, f.get('phone') ? `Telefon: ${f.get('phone')}` : '']
      .filter((l) => l !== '').join('\n');
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }
  return (
    <form onSubmit={submit} className="bg-[#f8f9ff] flex flex-col gap-[16px] p-[20px] md:p-[40px] rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        <label className="flex flex-col gap-[4px]"><span className={label}>Ime i prezime <span className="text-[#ba1a1a]">*</span></span><input required name="name" autoComplete="name" className={field} /></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>Organizacija / pravno lice <span className="font-normal text-[#737780] text-[12px]">(opcionalno)</span></span><input name="org" autoComplete="organization" className={field} /></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>E-pošta <span className="text-[#ba1a1a]">*</span></span><input required type="email" name="email" autoComplete="email" placeholder="primjer@domena.ba" className={field} /></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>Kontakt telefon <span className="font-normal text-[#737780] text-[12px]">(opcionalno)</span></span><input type="tel" name="phone" autoComplete="tel" className={field} /></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>Vrsta podneska <span className="text-[#ba1a1a]">*</span></span><select name="kind" className={field}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>Nadležni sektor <span className="text-[#ba1a1a]">*</span></span><select name="to" className={field}>{SECTORS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}</select></label>
      </div>
      <label className="flex flex-col gap-[4px] pb-[7px]"><span className={label}>Sadržaj upita ili zahtjeva <span className="text-[#ba1a1a]">*</span></span>
        <textarea required name="message" rows={5} placeholder="Opišite predmet upita ili informaciju koju tražite…" className={`${field} h-auto py-[16px] leading-[24px]`} /></label>
      <label className="flex gap-[8px] items-start font-pub text-[#43474f] text-[13px] leading-[20px]">
        <input required type="checkbox" className="mt-[4px] rounded-[2.5px]" />
        <span>Potvrđujem tačnost unesenih podataka i saglasan/na sam da Ministarstvo obrađuje moje lične podatke isključivo radi rješavanja ovog upita, u skladu sa Zakonom o zaštiti ličnih podataka BiH.</span>
      </label>
      <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-[12px] pt-[8px]">
        <p className="flex gap-[8px] items-center font-pub text-[#737780] text-[12px] leading-[18px]" role="status">
          <span aria-hidden className="material-symbols-outlined text-[14px]">{sent ? 'check_circle' : 'mail'}</span>
          {sent ? 'Otvoren je vaš e-mail program s pripremljenom porukom.' : 'Poruka se šalje putem vašeg e-mail programa na službenu adresu.'}
        </p>
        <button className="bg-[#002042] hover:bg-[#062343] text-white flex gap-[8px] items-center justify-center px-[40px] py-[12px] rounded-[4px] font-pub font-semibold text-[14px] tracking-[0.14px] leading-[20px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
          <span aria-hidden className="material-symbols-outlined text-[16px]">send</span>Pripremi poruku
        </button>
      </div>
    </form>
  );
}
