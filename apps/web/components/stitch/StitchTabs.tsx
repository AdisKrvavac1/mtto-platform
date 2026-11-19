'use client';
import { useEffect } from 'react';

/** Zamjena za Stitch inline skripte s tabovima: dugmad s data-tab prebacuju vidljivost panela. */
export default function StitchTabs({ buttons, panels, on, off }: { buttons: string; panels: Record<string, string>; on: string[]; off: string[] }) {
  useEffect(() => {
    const btns = Array.from(document.querySelectorAll<HTMLElement>(buttons));
    const handlers = btns.map((b) => {
      const h = () => {
        btns.forEach((x) => { x.classList.remove(...on); x.classList.add(...off); });
        b.classList.remove(...off); b.classList.add(...on);
        Object.entries(panels).forEach(([k, id]) => document.getElementById(id)?.classList.toggle('hidden', k !== b.dataset.tab));
      };
      b.addEventListener('click', h);
      return h;
    });
    return () => btns.forEach((b, i) => b.removeEventListener('click', handlers[i]));
  }, [buttons, panels, on, off]);
  return null;
}
