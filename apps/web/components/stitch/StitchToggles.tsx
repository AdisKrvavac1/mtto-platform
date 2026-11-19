'use client';
import { useEffect } from 'react';

/** Zamjena za Stitch dropdown skripte: klik na #xBtn prikazuje/skriva #xMenu, klik van zatvara sve. */
export default function StitchToggles({ pairs }: { pairs: [string, string][] }) {
  useEffect(() => {
    const els = pairs.map(([b, m]) => [document.getElementById(b), document.getElementById(m)] as const);
    const close = () => els.forEach(([, m]) => m?.classList.add('hidden'));
    const hs = els.map(([b, m]) => {
      const h = (e: Event) => { e.stopPropagation(); const was = m?.classList.contains('hidden'); close(); if (was) m?.classList.remove('hidden'); };
      b?.addEventListener('click', h);
      return h;
    });
    document.addEventListener('click', close);
    return () => { els.forEach(([b], i) => b?.removeEventListener('click', hs[i])); document.removeEventListener('click', close); };
  }, [pairs]);
  return null;
}
