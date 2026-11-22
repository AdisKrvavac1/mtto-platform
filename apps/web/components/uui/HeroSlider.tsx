'use client';
import { useEffect, useState } from 'react';

export type Slide = { src: string; alt: string; place: string };

/** Pozadinski slider za hero: blagi crossfade (2 s) i spori zoom, izmjena svakih 10 s.
 *  Pauzira kad kartica nije vidljiva; bez automatske izmjene uz "smanji animacije". */
export default function HeroSlider({ slides, interval = 10000 }: { slides: Slide[]; interval?: number }) {
  const [i, setI] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  useEffect(() => {
    if (reduced || slides.length < 2) return;
    const t = setInterval(() => { if (!document.hidden) setI((x) => (x + 1) % slides.length); }, interval);
    return () => clearInterval(t);
  }, [reduced, slides.length, interval]);

  return (
    <>
      <div className="absolute inset-0" aria-hidden>
        {slides.map((s, k) => (
          <img key={s.src} src={s.src} alt="" loading={k === 0 ? 'eager' : 'lazy'} fetchPriority={k === 0 ? 'high' : 'low'}
            className={`absolute inset-0 size-full object-cover transition-[opacity,transform] ease-out ${k === i ? 'opacity-100 scale-[1.06] duration-[2000ms,12000ms]' : 'opacity-0 scale-100 duration-[2000ms,0ms]'}`}
            style={{ transitionDuration: k === i ? '2000ms, 12000ms' : '2000ms, 2000ms' }} />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-3" role="group" aria-label="Fotografije u pozadini">
        <span className="text-[14px] font-medium text-white/80" aria-live="polite">{slides[i]?.place}</span>
        <span className="flex gap-2">
          {slides.map((s, k) => (
            <button key={s.src} type="button" onClick={() => setI(k)} aria-label={`Prikaži: ${s.place}`} aria-current={k === i}
              className={`h-1.5 rounded-full transition-all duration-500 ${k === i ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`} />
          ))}
        </span>
      </div>
    </>
  );
}
