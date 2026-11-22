/* Dinamički dijelovi stranice "Zaštita okoliša" (Figma 30:5998). */
import Link from 'next/link';
import type { Permit, PostListItem } from '@/lib/api';
import { dateLong, dateShort, POST_TYPE } from '@/lib/format';

const ST: Record<string, [string, string]> = { VAZECA: ['Važeća', 'bg-[#a3f4be] text-[#00522e]'], U_OBNOVI: ['U obnovi', 'bg-[#dce1ff] text-[#002e7c]'], ISTEKLA: ['Istekla', 'bg-[#ffdad6] text-[#93000a]'] };

export function PermitRows({ rows }: { rows: Permit[] }) {
  if (!rows.length) return <p className="p-[16px] font-rob text-[14px] text-[#444651]">Nema dozvola u registru.</p>;
  return (
    <>
      {rows.map((p) => {
        const [sl, sc] = ST[p.status] ?? ST.VAZECA;
        return (
          <div key={p.id} className="grid grid-cols-2 md:grid-cols-[146px_minmax(0,1.6fr)_161px_minmax(0,1.7fr)_118px_123px_94px] items-center border-b border-[#eaedff] last:border-0 hover:bg-[#f2f3ff] transition-colors">
            <div className="px-[16px] py-[14px] font-rmono font-semibold text-[#002e7c] text-[13px] leading-[18px] break-all"><Link href={`/registri/okolisne-dozvole/${p.id}`} className="hover:underline">{p.registerNumber}</Link></div>
            <div className="px-[16px] py-[12px] font-rob font-medium text-[#131b2e] text-[14px] leading-[20px]">{p.operator}{p.isDemo && <span className="ml-1 align-middle inline-flex px-1.5 rounded bg-[#fffde6] border border-[#fadc12] text-[#786000] text-[10px] font-bold uppercase">Demo</span>}</div>
            <div className="px-[16px] py-[12px] font-rob text-[#131b2e] text-[14px] leading-[20px]">{p.municipality}</div>
            <div className="px-[16px] py-[12px] font-rob text-[#444651] text-[14px] leading-[20px]">{p.activity} · {p.facility}</div>
            <div className="px-[16px] py-[12px] font-rmono font-medium text-[#131b2e] text-[13px] leading-[18px]">{dateShort(p.validUntil)}</div>
            <div className="px-[16px] py-[12px]"><span className={`px-[8px] py-[2px] rounded-[2px] font-rmono font-semibold text-[12px] tracking-[0.3px] leading-[16px] ${sc}`}>{sl}</span></div>
            <div className="px-[16px] py-[12px] md:text-right">
              <Link href={`/registri/okolisne-dozvole/${p.id}#dokumenti`} className="inline-flex gap-[4px] items-center font-rmono font-semibold text-[#002e7c] text-[12px] tracking-[0.3px] leading-[16px] hover:underline"><span aria-hidden className="material-symbols-outlined text-[16px]">download</span>PDF</Link>
            </div>
          </div>
        );
      })}
    </>
  );
}

export function ConsultationItems({ items }: { items: PostListItem[] }) {
  if (!items.length) return <p className="font-rob text-[14px] text-[#444651]">Trenutno nema otvorenih javnih uvida.</p>;
  return (
    <>
      {items.map((p) => {
        const open = p.deadline ? new Date(p.deadline) > new Date() : null;
        const days = p.deadline ? Math.ceil((new Date(p.deadline).getTime() - Date.now()) / 864e5) : null;
        return (
          <article key={p.id} className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-col p-[16px] rounded-[8px] w-full">
            <div className="flex flex-wrap gap-y-[8px] items-center justify-between pb-[8px] w-full">
              <span className="bg-[#c6e7ff] px-[10px] py-[2px] rounded-[2px] font-rmono font-semibold text-[#001e2d] text-[12px] tracking-[0.3px] leading-[16px]">{POST_TYPE[p.type]}</span>
              <span className={`flex gap-[4px] items-center font-rmono font-semibold text-[13px] leading-[18px] ${open === false ? 'text-[#444651]' : 'text-[#ba1a1a]'}`}>
                <span aria-hidden className="material-symbols-outlined text-[15px]">schedule</span>
                {p.deadline ? (open ? `Rok: još ${days} dana (do ${dateShort(p.deadline)})` : `Završeno ${dateShort(p.deadline)}`) : `Objavljeno ${dateLong(p.publishedAt)}`}
              </span>
            </div>
            <h3 className="font-rob font-semibold text-[#131b2e] text-[18px] md:text-[20px] leading-[28px]"><Link href={`/vijesti/${p.slug}`} className="hover:text-[#006c4a]">{p.title}</Link></h3>
            {p.excerpt && <p className="pt-[4px] font-rob text-[#444651] text-[14px] leading-[20px] line-clamp-2">{p.excerpt}</p>}
            <div className="flex flex-wrap gap-y-[8px] items-center justify-between pt-[12px] w-full">
              <Link href={`/vijesti/${p.slug}#dokumenti`} className="flex gap-[6px] items-center font-rmono font-semibold text-[#002e7c] text-[12px] tracking-[0.3px] leading-[16px] hover:underline"><span aria-hidden className="material-symbols-outlined text-[14px]">download</span>{p.attachmentCount ? `Dokumenti (${p.attachmentCount})` : 'Detalji objave'}</Link>
              <Link href={`/vijesti/${p.slug}`} className="bg-[#eaedff] hover:bg-[#dce1ff] px-[12px] py-[6px] rounded-[2px] font-rmono font-semibold text-[#002e7c] text-[12px] tracking-[0.3px] leading-[16px]">Otvori</Link>
            </div>
          </article>
        );
      })}
    </>
  );
}
