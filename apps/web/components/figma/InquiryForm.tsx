'use client';
import { useState } from 'react';
import { CheckCircle, Mail01, Send01 } from '@untitledui/icons';

const SECTORS = [
  { v: 'info@mtto.gov.ba', l: 'Opći upit (centrala)' },
  { v: 'ministar@mtto.gov.ba', l: 'Kabinet ministra' },
  { v: 'turizam@mtto.gov.ba', l: 'Sektor za turizam i ugostiteljstvo' },
  { v: 'tajnik@mtto.gov.ba', l: 'Tajništvo / pristup informacijama' },
];
const KINDS = ['Opći upit građana ili privrede', 'Zahtjev za slobodan pristup informacijama (ZOSPI)', 'Prijedlog ili primjedba'];

const label = 'text-[14px] leading-5 font-medium text-[#404040]';
const field = 'bg-white h-11 px-[14px] rounded-[8px] border border-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] text-[16px] leading-6 text-[#171717] placeholder:text-[#737373] focus:outline-none focus:border-[#d6bbfb] focus:ring-4 focus:ring-[#9e77ed]/25 w-full';

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
    <form onSubmit={submit} className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        <label className="flex flex-col gap-[4px]"><span className={label}>Ime i prezime <span className="text-[#7f56d9]">*</span></span><input required name="name" autoComplete="name" className={field} /></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>Organizacija / pravno lice <span className="font-normal text-[#737373] text-[12px]">(opcionalno)</span></span><input name="org" autoComplete="organization" className={field} /></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>E-pošta <span className="text-[#7f56d9]">*</span></span><input required type="email" name="email" autoComplete="email" placeholder="primjer@domena.ba" className={field} /></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>Kontakt telefon <span className="font-normal text-[#737373] text-[12px]">(opcionalno)</span></span><input type="tel" name="phone" autoComplete="tel" className={field} /></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>Vrsta podneska <span className="text-[#7f56d9]">*</span></span><select name="kind" className={field}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></label>
        <label className="flex flex-col gap-[4px]"><span className={label}>Nadležni sektor <span className="text-[#7f56d9]">*</span></span><select name="to" className={field}>{SECTORS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}</select></label>
      </div>
      <label className="flex flex-col gap-[4px] pb-[7px]"><span className={label}>Sadržaj upita ili zahtjeva <span className="text-[#7f56d9]">*</span></span>
        <textarea required name="message" rows={5} placeholder="Opišite predmet upita ili informaciju koju tražite…" className={`${field} h-auto py-[16px] leading-[24px]`} /></label>
      <label className="flex gap-[8px] items-start text-[16px] leading-6 text-[#525252]">
        <input required type="checkbox" className="mt-1 size-4 rounded-[4px] border-[#d4d4d4] text-[#7f56d9] focus:ring-[#9e77ed]" />
        <span>Potvrđujem tačnost unesenih podataka i saglasan/na sam da Ministarstvo obrađuje moje lične podatke isključivo radi rješavanja ovog upita, u skladu sa Zakonom o zaštiti ličnih podataka BiH.</span>
      </label>
      <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-[12px] pt-[8px]">
        <p className="flex gap-2 items-center text-[14px] leading-5 text-[#525252]" role="status">
          {sent ? <CheckCircle size={16} className="text-[#079455]" /> : <Mail01 size={16} className="text-[#a3a3a3]" />}
          {sent ? 'Otvoren je vaš e-mail program s pripremljenom porukom.' : 'Poruka se šalje putem vašeg e-mail programa na službenu adresu.'}
        </p>
        <button className="h-12 bg-[#7f56d9] hover:bg-[#6941c6] text-white flex gap-2 items-center justify-center px-[18px] rounded-[8px] text-[16px] font-semibold border-2 border-white/10 shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)]">
          <Send01 size={20} />Pripremi poruku
        </button>
      </div>
    </form>
  );
}
