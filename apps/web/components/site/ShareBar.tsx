'use client';
import { useEffect, useState } from 'react';

export default function ShareBar({ title }: { title: string }) {
  const [url, setUrl] = useState('');
  const [size, setSize] = useState(16);
  useEffect(() => setUrl(window.location.href), []);
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('.prose-mtto').forEach((el) => (el.style.fontSize = `${size}px`));
  }, [size]);
  const u = encodeURIComponent(url);
  const btn = 'w-8 h-8 rounded bg-surface-container-low hover:bg-primary hover:text-on-primary text-institutional-navy-deep flex items-center justify-center transition-all';
  return (
    <div className="flex flex-wrap items-center justify-between gap-space-sm p-space-sm bg-surface-container-lowest rounded-xl shadow-sm">
      <div className="flex items-center gap-space-xs">
        <span className="font-label-kicker text-label-kicker text-outline uppercase mr-1">Podijeli:</span>
        <a aria-label="Podijeli na Facebook" className={btn} target="_blank" rel="noopener" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`}>
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" /></svg>
        </a>
        <a aria-label="Podijeli na LinkedIn" className={btn} target="_blank" rel="noopener" href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`}>
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.88 0-1.6.72-1.6 1.6 0 .89.72 1.6 1.6 1.6.89 0 1.6-.71 1.6-1.6 0-.88-.71-1.6-1.6-1.6Z" /></svg>
        </a>
        <a aria-label="Pošalji e-mailom" className={btn} href={`mailto:?subject=${encodeURIComponent(title)}&body=${u}`}><span className="material-symbols-outlined text-[18px]">mail</span></a>
        <button className={btn} title="Ispiši" type="button" onClick={() => window.print()}><span className="material-symbols-outlined text-[18px]">print</span></button>
      </div>
      <div className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded">
        <button className="text-xs font-bold px-1.5 py-0.5 rounded hover:bg-surface-container-high" title="Smanji tekst" type="button" onClick={() => setSize((s) => Math.max(14, s - 1))}>A-</button>
        <button className="text-sm font-bold px-1.5 py-0.5 rounded hover:bg-surface-container-high" title="Povećaj tekst" type="button" onClick={() => setSize((s) => Math.min(22, s + 1))}>A+</button>
      </div>
    </div>
  );
}
