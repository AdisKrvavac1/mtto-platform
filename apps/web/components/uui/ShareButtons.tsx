'use client';
import { useState } from 'react';
import { Check, Copy01, Mail01, Share07 } from '@untitledui/icons';

/* Logotipi društvenih mreža (jednobojni, 20 px) */
const P = {
  facebook: 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z',
  x: 'M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z',
  linkedin: 'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z',
  whatsapp: 'M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 1 1 7.99 4.42Zm8.03-17.47A11.3 11.3 0 0 0 2.33 17.66L.73 23.5l5.98-1.57a11.28 11.28 0 0 0 5.34 1.36h.01A11.3 11.3 0 0 0 20.08 4.03Z',
  viber: 'M11.4.5C9.47.53 5.32.85 3 2.97 1.27 4.7.67 7.24.6 10.39c-.06 3.15-.14 9.05 5.55 10.65v2.44s-.04.99.61 1.19c.79.25 1.25-.5 2-1.31.41-.45.98-1.1 1.4-1.6 3.88.33 6.86-.42 7.2-.53.79-.26 5.22-.82 5.94-6.72.75-6.08-.36-9.92-2.36-11.65C20.35 2.4 18.02.43 12.86.5h-1.46Zm.16 1.69c4.4-.06 6.37 1.6 6.86 2.03 1.66 1.42 2.5 4.83 1.89 9.81-.59 4.82-4.12 5.12-4.77 5.33-.28.09-2.87.73-6.14.52 0 0-2.43 2.94-3.19 3.7-.12.12-.26.17-.35.15-.13-.03-.17-.19-.16-.42l.02-4.02c-4.81-1.33-4.53-6.35-4.48-8.98.06-2.63.55-4.78 2.01-6.23 1.97-1.79 5.53-1.88 8.31-1.89Zm.37 2.42a.37.37 0 0 0 0 .74c1.76.01 3.2.58 4.37 1.72 1.17 1.14 1.77 2.68 1.79 4.67a.37.37 0 1 0 .74 0c-.02-2.16-.68-3.92-2-5.2-1.31-1.29-2.96-1.92-4.9-1.93Zm-3.04.9c-.3-.04-.6.04-.86.24l-.01.01c-.52.45-1.08 1.02-.9 1.68.37 1.4 1.29 3.05 2.85 4.6 1.56 1.56 3.26 2.52 4.64 2.88.67.18 1.24-.38 1.69-.9l.01-.01c.38-.46.33-1.12-.13-1.51-.4-.35-.88-.71-1.29-1-.46-.32-1.09-.25-1.45.17l-.37.45c-.18.2-.47.24-.71.12-1.34-.63-2.48-1.77-3.11-3.1-.12-.25-.08-.54.12-.72l.45-.37c.42-.36.49-.99.17-1.45-.29-.41-.65-.89-1-1.29a1.1 1.1 0 0 0-.66-.37Zm3.28.66a.37.37 0 0 0-.02.74c1.13.08 1.97.45 2.56 1.09.59.64.87 1.44.86 2.45a.37.37 0 1 0 .74.01c.01-1.17-.33-2.17-1.06-2.96-.73-.79-1.75-1.23-3.05-1.32h-.03Zm.33 1.67a.37.37 0 0 0-.02.74c.88.05 1.3.45 1.35 1.36a.37.37 0 1 0 .74-.04c-.07-1.25-.8-2-2.05-2.06h-.02Z',
};
const Logo = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden><path d={d} /></svg>;

/** Untitled "Social share" – kopiraj link + mreže, s izvornim dijeljenjem na mobitelu. */
export default function ShareButtons({ url, title, compact = false }: { url: string; title: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  const nets: [string, string, string][] = [
    ['Facebook', P.facebook, `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ['X', P.x, `https://twitter.com/intent/tweet?url=${u}&text=${t}`],
    ['LinkedIn', P.linkedin, `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
    ['WhatsApp', P.whatsapp, `https://wa.me/?text=${t}%20${u}`],
    ['Viber', P.viber, `viber://forward?text=${t}%20${u}`],
  ];
  const btn = 'inline-flex size-10 items-center justify-center rounded-[8px] bg-white text-[#a3a3a3] ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] hover:bg-[#fafafa] hover:text-[#525252] hover:-translate-y-0.5 transition';
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* preglednik ne dozvoljava */ }
  }
  async function native() {
    try { await navigator.share({ title, url }); } catch { /* korisnik odustao */ }
  }
  return (
    <div className="flex flex-wrap items-center gap-3" aria-label="Podijeli objavu">
      <button type="button" onClick={copy} className="inline-flex h-10 items-center gap-1.5 rounded-[8px] bg-white px-[14px] text-[14px] font-semibold text-[#404040] ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] hover:bg-[#fafafa]">
        {copied ? <Check size={20} className="text-[#079455]" /> : <Copy01 size={20} className="text-[#a3a3a3]" />}{copied ? 'Kopirano' : compact ? 'Kopiraj' : 'Kopiraj link'}
      </button>
      {nets.map(([n, d, href]) => <a key={n} href={href} target="_blank" rel="noopener noreferrer" className={btn} title={`Podijeli na ${n}`} aria-label={`Podijeli na ${n}`}><Logo d={d} /></a>)}
      <a href={`mailto:?subject=${t}&body=${u}`} className={btn} title="Pošalji e-mailom" aria-label="Pošalji e-mailom"><Mail01 size={20} /></a>
      <button type="button" onClick={native} className={`${btn} sm:hidden`} title="Više opcija" aria-label="Više opcija dijeljenja"><Share07 size={20} /></button>
    </div>
  );
}
