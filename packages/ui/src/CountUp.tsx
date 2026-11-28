'use client';
import { useEffect, useRef, useState } from 'react';

/** Broji od 0 do vrijednosti kad element uđe u prozor (jednom). Podržava "4.401 km²", "24 h", "1.250". */
export default function CountUp({ value, duration = 1400 }: { value: string | number; duration?: number }) {
  const str = String(value);
  // samo cijeli broj s tačkama hiljada (ne datum „11.06.2026.“ ni redni broj „3.“)
  const m = str.match(/^(\d{1,3}(?:\.\d{3})+|\d+)(?![\d.])(.*)$/);
  const target = m ? parseInt(m[1].replace(/\./g, ''), 10) : NaN;
  const suffix = m ? m[2] : '';
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || Number.isNaN(target) || target === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    setN(0);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [target, duration]);

  if (Number.isNaN(target)) return <>{str}</>;
  return <span ref={ref} className="tabular-nums">{n === null ? str : `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${suffix}`}</span>;
}
