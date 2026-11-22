/* Kartice prenesene iz Figma dizajna (MTTO, sekcija 30:13993), parametrizirane za stvarne podatke. */
import Link from 'next/link';
import type { PostListItem } from '@/lib/api';
import { dateLong, POST_TYPE } from '@/lib/format';

const CAT_TAG: Record<string, string> = { 'Zaštita okoliša': 'ZAŠTITA OKOLIŠA', Turizam: 'TURIZAM', Trgovina: 'TRGOVINA', Opće: 'OPĆE' };
const cover = (p: PostListItem) => p.coverImage || '/fig/news-placeholder.svg';
const Icon = ({ n, size = 16, cls = '' }: { n: string; size?: number; cls?: string }) => (
  <span aria-hidden className={`material-symbols-outlined shrink-0 leading-none ${cls}`} style={{ fontSize: size }}>{n}</span>
);

export function DemoTag({ show }: { show?: boolean }) {
  if (!show) return null;
  return <span className="inline-flex items-center px-[8px] py-[2px] rounded-[2px] bg-[#fffde6] border border-[#fadc12] font-robflex font-bold text-[#786000] text-[11px] tracking-[0.44px] uppercase leading-[14px]">Demo</span>;
}

/** Glavna vijest (Figma: "LOKALNA UPRAVA I TURIZAM" kartica, 940 px). */
export function LeadNewsCard({ p }: { p: PostListItem }) {
  return (
    <article className="bg-white flex flex-col isolate items-start overflow-clip relative rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] w-full">
      <Link href={`/vijesti/${p.slug}`} className="flex flex-col h-[220px] md:h-[320px] items-start justify-center overflow-clip relative shrink-0 w-full z-[2] group" tabIndex={-1}>
        <img alt="" className="absolute inset-0 max-w-none object-cover size-full group-hover:scale-[1.02] transition-transform duration-500" src={cover(p)} />
        <div className="absolute flex gap-[8px] items-start left-[16px] top-[16px] flex-wrap">
          <span className="bg-[#006c4a] px-[10px] py-[4px] rounded-[2px] font-rob font-bold text-[11px] text-white tracking-[0.55px] uppercase leading-[14px]">{CAT_TAG[p.category] ?? p.category}</span>
          <span className="bg-[#062343] px-[10px] py-[4px] rounded-[2px] font-rob font-bold text-[11px] text-white tracking-[0.55px] uppercase leading-[14px]">{POST_TYPE[p.type]}</span>
          <DemoTag show={p.isDemo} />
        </div>
      </Link>
      <div className="flex flex-col gap-[8px] items-start p-[20px] md:p-[24px] relative w-full z-[1]">
        <div className="flex gap-x-[16px] gap-y-1 items-start w-full flex-wrap">
          <span className="flex gap-[4px] items-center"><Icon n="calendar_today" cls="text-[#43474f]" /><span className="font-robflex text-[#43474f] text-[13px] leading-[20px]">{dateLong(p.publishedAt)}</span></span>
          <span className="flex gap-[4px] items-center"><Icon n="visibility" size={18} cls="text-[#43474f]" /><span className="font-robflex text-[#43474f] text-[13px] leading-[20px]">{p.views.toLocaleString('bs-BA')} pregleda</span></span>
        </div>
        <h3 className="font-rob font-bold text-[#002042] text-[20px] md:text-[24px] w-full leading-[1.3] uppercase">
          <Link href={`/vijesti/${p.slug}`} className="hover:text-[#006c4a] transition-colors">{p.title}</Link>
        </h3>
        {p.excerpt && <p className="font-rob font-normal text-[#334155] text-[15px] w-full leading-[1.5] pb-[8px]">{p.excerpt}</p>}
        <div className="flex items-center justify-between pt-[4px] w-full flex-wrap gap-2">
          <Link href={`/vijesti/${p.slug}`} className="flex gap-[4px] items-center font-robflex font-bold text-[#002042] text-[14px] tracking-[0.14px] leading-[20px] hover:underline">
            Pročitaj službeno priopćenje <Icon n="chevron_right" size={16} />
          </Link>
          <span className="font-pub text-[#737780] text-[13px] leading-[20px]">{p.authorName || 'MTTO HNK'}</span>
        </div>
      </div>
    </article>
  );
}

/** Manja vijest (Figma: "TRŽIŠNA INSPEKCIJA" kartica). */
export function NewsCard({ p, className = '' }: { p: PostListItem; className?: string }) {
  return (
    <article className={`bg-white drop-shadow-[0px_4px_3px_rgba(0,0,0,0.1)] flex flex-col gap-[8px] items-start p-[16px] relative rounded-[8px] w-full ${className}`}>
      <div className="flex flex-[1_0_0] flex-col gap-[8px] items-start w-full">
        <Link href={`/vijesti/${p.slug}`} className="block h-[176px] overflow-clip relative rounded-[4px] w-full group" tabIndex={-1}>
          <img alt="" className="absolute inset-0 size-full object-cover group-hover:scale-[1.03] transition-transform duration-500" src={cover(p)} />
          <span className="absolute bg-[#dce9ff] left-[8px] px-[10px] py-[4px] rounded-[2px] top-[8px] font-rob font-bold text-[#002042] text-[11px] tracking-[0.44px] uppercase leading-[14px]">{CAT_TAG[p.category] ?? p.category}</span>
        </Link>
        <div className="flex gap-[8px] items-center pt-[4px] w-full"><Icon n="event" size={15} cls="text-[#43474f]" /><span className="font-robflex text-[#43474f] text-[13px] leading-[20px]">{dateLong(p.publishedAt)}</span><DemoTag show={p.isDemo} /></div>
        <h3 className="font-rob font-bold text-[#002042] text-[18px] md:text-[20px] w-full leading-[1.4]"><Link href={`/vijesti/${p.slug}`} className="hover:text-[#006c4a] transition-colors">{p.title}</Link></h3>
        {p.excerpt && <p className="font-rob font-normal text-[#334155] text-[13px] w-full leading-[1.45] line-clamp-3">{p.excerpt}</p>}
      </div>
      <div className="flex items-center justify-between pt-[12px] w-full">
        <Link href={`/vijesti/${p.slug}`} className="flex gap-[4px] items-center font-pub font-bold text-[#002042] text-[14px] tracking-[0.14px] leading-[20px] hover:underline">Detalji <Icon n="arrow_forward" size={16} /></Link>
        <span className="bg-[#ecfdf5] px-[8px] py-[2px] rounded-[2px] font-pub font-bold text-[#006c4a] text-[11px] tracking-[0.44px] leading-[14px]">{POST_TYPE[p.type]}</span>
      </div>
    </article>
  );
}

/** Stavka u bočnoj listi "Natječaji i javni uvidi". */
export function CallCard({ p }: { p: PostListItem }) {
  const open = p.deadline ? new Date(p.deadline) > new Date() : true;
  return (
    <div className="bg-[#eff4ff] flex flex-col gap-[8px] items-start p-[16px] rounded-[4px] w-full">
      <div className="flex items-center justify-between w-full flex-wrap gap-2">
        <span className={`px-[8px] py-[2px] rounded-[2px] font-robflex font-bold text-[11px] tracking-[0.44px] uppercase leading-[14px] ${open ? 'bg-[#85f8c4] text-[#13693f]' : 'bg-[#dce9ff] text-[#002042]'}`}>{open ? 'otvoreni poziv' : 'zatvoren'}</span>
        {p.deadline && <span className="flex gap-[4px] items-center"><Icon n="timer" size={15} cls="text-[#ba1a1a]" /><span className="font-robflex font-bold text-[#ba1a1a] text-[11px] tracking-[0.44px] leading-[14px]">Rok: {new Date(p.deadline).toLocaleDateString('bs-BA', { timeZone: 'Europe/Sarajevo' })}</span></span>}
      </div>
      <h4 className="font-rob font-bold text-[#002042] text-[18px] w-full leading-[1.4]"><Link href={`/vijesti/${p.slug}`} className="hover:text-[#006c4a]">{p.title}</Link></h4>
      {p.excerpt && <p className="font-rob font-normal text-[#43474f] text-[13px] w-full leading-[1.4] line-clamp-3">{p.excerpt}</p>}
      <div className="flex items-center justify-between pt-[4px] w-full">
        <span className="flex gap-[4px] items-center"><Icon n="attach_file" size={16} cls="text-[#ba1a1a]" /><span className="font-rob text-[#43474f] text-[13px] leading-[20px]">{p.attachmentCount ? `${p.attachmentCount} prilog(a)` : 'Detalji poziva'}</span></span>
        <Link href={`/vijesti/${p.slug}`} className="font-rob font-bold text-[#002042] text-[14px] tracking-[0.14px] leading-[20px] hover:underline">Otvori</Link>
      </div>
    </div>
  );
}
