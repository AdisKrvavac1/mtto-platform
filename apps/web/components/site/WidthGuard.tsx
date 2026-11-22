'use client';
import { useLayoutEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Standardna širina sadržaja: 1440 px (sadržaj 1376 px), centrirano.
 * Pozadine sekcija ostaju preko cijelog ekrana; povećava se samo unutrašnji razmak
 * prve pune-širine sekcije s paddingom u svakoj grani (header, main, footer).
 */
const CONTENT = 1376;

function apply() {
  document.querySelectorAll<HTMLElement>('[data-fx]').forEach((el) => {
    ['padding-left', 'padding-right', 'margin-left', 'margin-right'].forEach((k) => el.style.removeProperty(k)); el.removeAttribute('data-fx');
  });
  if (window.innerWidth <= CONTENT + 64) return;
  const roots = document.querySelectorAll<HTMLElement>('#sadrzaj, body > header, [data-fx-root]');
  const walk = (el: HTMLElement, rootW: number, depth: number) => {
    for (const c of Array.from(el.children) as HTMLElement[]) {
      const w = c.getBoundingClientRect().width;
      const cs = getComputedStyle(c);
      const ml = parseFloat(cs.marginLeft), mr = parseFloat(cs.marginRight);
      if (w < rootW - 2) {
        // sekcija uvučena marginom (npr. mx-4 md:mx-[32px]) – centriraj marginom
        if (ml >= 12 && Math.abs(w + ml + mr - rootW) < 3 && cs.position !== 'absolute') {
          c.dataset.fx = '1';
          c.style.marginLeft = `max(${ml}px, calc((100% - ${CONTENT}px) / 2))`;
          c.style.marginRight = `max(${mr}px, calc((100% - ${CONTENT}px) / 2))`;
        }
        continue;
      }
      const pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight);
      if (pl >= 12 && cs.position !== 'absolute' && cs.position !== 'fixed') {
        c.dataset.fx = '1';
        c.style.paddingLeft = `max(${pl}px, calc((100% - ${CONTENT}px) / 2))`;
        c.style.paddingRight = `max(${pr}px, calc((100% - ${CONTENT}px) / 2))`;
      } else if (depth < 8) walk(c, rootW, depth + 1);
    }
  };
  roots.forEach((r) => walk(r, r.id === 'sadrzaj' ? r.getBoundingClientRect().width : document.documentElement.clientWidth, 0));
}

export default function WidthGuard() {
  const path = usePathname();
  const sp = useSearchParams();
  useLayoutEffect(() => {
    apply();
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(t); t = setTimeout(apply, 120); };
    window.addEventListener('resize', onResize);
    const mo = new MutationObserver(onResize);
    const main = document.getElementById('sadrzaj');
    if (main) mo.observe(main, { childList: true, subtree: false });
    return () => { window.removeEventListener('resize', onResize); mo.disconnect(); clearTimeout(t); };
  }, [path, sp]);
  return null;
}
