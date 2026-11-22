/* Dijelovi stranice članka prema Figma okviru 9:15067 / 20:2693, sa stvarnim podacima. */
import Link from 'next/link';
import type { Doc, PostListItem } from '@/lib/api';
import { fileExt, fileSize, POST_TYPE } from '@/lib/format';
import ShareBar from '@/components/site/ShareBar';

const Icon = ({ n, size = 16, cls = '' }: { n: string; size?: number; cls?: string }) => (
  <span aria-hidden className={`material-symbols-outlined shrink-0 leading-none ${cls}`} style={{ fontSize: size }}>{n}</span>
);

export function ArticleShare({ title }: { title: string }) {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex flex-wrap gap-y-[8px] items-center justify-between p-[8px] rounded-[8px] w-full">
      <div className="flex gap-[4px] items-center">
        <span className="font-space font-bold text-[#737780] text-[12px] tracking-[0.96px] uppercase leading-[16px] pr-[4px]">Podijeli:</span>
        <ShareBar title={title} variant="figma" />
      </div>
      <div className="flex gap-[8px] items-center flex-wrap">
        <div className="bg-[#eff4ff] flex gap-[4px] items-center px-[8px] py-[4px] rounded-[2px]" role="group" aria-label="Veličina teksta">
          <button type="button" data-fontsize="-1" className="px-[6px] py-[2px] rounded-[2px] font-pub font-bold text-[#0b1c30] text-[12px] leading-[16px] hover:bg-white">A-</button>
          <button type="button" data-fontsize="1" className="px-[6px] py-[2px] rounded-[2px] font-pub font-bold text-[#0b1c30] text-[14px] leading-[20px] hover:bg-white">A+</button>
        </div>
        <button type="button" disabled title="Audio sažetak: Faza 2" className="bg-[#dce9ff] flex gap-[8px] items-center px-[12px] py-[6px] rounded-[4px] opacity-70 cursor-not-allowed">
          <Icon n="play_circle" size={18} cls="text-[#062343]" />
          <span className="font-pub font-semibold text-[#062343] text-[14px] tracking-[0.14px] leading-[20px]">Slušaj sažetak</span>
        </button>
      </div>
    </div>
  );
}

export function ArticleFigure({ src, chip, caption }: { src: string | null; chip: string; caption: string }) {
  return (
    <figure className="flex flex-col gap-[4px] items-start w-full">
      <div className="bg-[#e5eeff] h-[240px] md:h-[440px] overflow-clip relative rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] w-full">
        <img alt="" className="absolute inset-0 size-full object-cover" src={src || '/fig/news-placeholder.svg'} />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,35,67,0.8)] via-[rgba(6,35,67,0)] to-[rgba(6,35,67,0)]" />
        <div className="absolute bottom-[16px] left-[16px] right-[16px] flex items-center justify-between flex-wrap gap-2">
          <span className="backdrop-blur-[12px] bg-[rgba(6,35,67,0.8)] flex gap-[6px] items-center px-[12px] py-[4px] rounded-[2px] font-pub text-[13px] text-white leading-[20px]"><Icon n="eco" size={14} cls="text-[#85f8c4]" />{chip}</span>
        </div>
      </div>
      <figcaption className="flex items-center justify-between px-[4px] w-full flex-wrap gap-x-4">
        <span className="font-pub text-[#737780] text-[13px] leading-[20px]">{caption}</span>
        <span className="font-pub font-semibold text-[#43474f] text-[13px] leading-[20px]">Foto: MTTO HNK</span>
      </figcaption>
    </figure>
  );
}

const EXT: Record<string, [string, string]> = {
  PDF: ['picture_as_pdf', 'bg-[#fef2f2] text-[#ba1a1a]'],
  DOC: ['description', 'bg-[#eff4ff] text-[#062343]'],
  DOCX: ['description', 'bg-[#eff4ff] text-[#062343]'],
  XLS: ['table_view', 'bg-[#ecfdf5] text-[#006c4a]'],
  XLSX: ['table_view', 'bg-[#ecfdf5] text-[#006c4a]'],
};

export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="flex gap-[8px] items-center font-pub font-bold text-[#062343] text-[20px] md:text-[24px] tracking-[-0.24px] leading-[1.3] scroll-mt-24">
      <span aria-hidden className="bg-[#006c4a] rounded-[12px] shrink-0 size-[10px]" />{children}
    </h2>
  );
}

export function ArticleDocs({ docs }: { docs: Doc[] }) {
  if (!docs.length) return null;
  return (
    <section id="dokumenti" className="flex flex-col gap-[8px] items-start pt-[8px] w-full scroll-mt-24">
      <div className="flex items-center justify-between w-full flex-wrap gap-2">
        <H2>Preuzimanje službene dokumentacije i obrazaca</H2>
        <span className="font-pub font-bold text-[#737780] text-[11px] tracking-[0.44px] uppercase leading-[14px]">{docs.length} {docs.length === 1 ? 'dokument' : 'dokumenata'}</span>
      </div>
      <p className="font-pub text-[#43474f] text-[13px] leading-[20px]">Dokumenti se preuzimaju u izvornom obliku. Prijavitelji su dužni koristiti priložene obrasce.</p>
      <div className="flex flex-col gap-[8px] pt-[4px] w-full">
        {docs.map((d, i) => {
          const ext = fileExt(d.fileName);
          const [ic, cls] = EXT[ext] ?? ['draft', 'bg-[#eff4ff] text-[#062343]'];
          return (
            <div key={d.id} className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-between gap-[12px] p-[16px] rounded-[8px] w-full flex-wrap">
              <div className="flex gap-[8px] items-start min-w-0 flex-1">
                <div className={`flex items-center justify-center rounded-[4px] shrink-0 size-[48px] ${cls}`}><Icon n={ic} size={28} /></div>
                <div className="flex flex-col min-w-0">
                  <span className="font-pub font-semibold text-[#062343] text-[16px] md:text-[18px] leading-[26px]">{d.title}</span>
                  <span className="flex flex-wrap gap-[8px] items-center font-pub text-[#43474f] text-[13px] leading-[20px]">
                    <span>{i === 0 ? 'Službeni dokument' : 'Prilog'}</span><span aria-hidden>•</span><span>{ext}, {fileSize(d.size)}</span>
                    {d.downloads > 0 && <><span aria-hidden>•</span><span>{d.downloads} preuzimanja</span></>}
                  </span>
                </div>
              </div>
              <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className={`flex gap-[8px] items-center justify-center px-[16px] py-[10px] rounded-[2px] shrink-0 font-pub font-semibold text-[14px] tracking-[0.14px] leading-[20px] ${i === 0 ? 'bg-[#002042] text-white hover:bg-[#062343]' : 'bg-[#eff4ff] text-[#062343] hover:bg-[#dce9ff]'}`}>
                <Icon n="download" size={16} />Preuzmi {ext}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function RelatedList({ items }: { items: PostListItem[] }) {
  if (!items.length) return <p className="font-pub text-[13px] text-[#737780]">Trenutno nema drugih poziva.</p>;
  return (
    <div className="flex flex-col gap-[8px] w-full">
      {items.map((p) => {
        const open = p.deadline ? new Date(p.deadline) > new Date() : null;
        return (
          <Link key={p.id} href={`/vijesti/${p.slug}`} className="bg-[#eff4ff] flex flex-col gap-[4px] items-start p-[8px] rounded-[4px] w-full hover:bg-[#dce9ff] transition-colors">
            <span className="flex items-center justify-between w-full">
              <span className={`font-pub font-bold text-[11px] tracking-[0.44px] leading-[14px] uppercase ${open === false ? 'text-[#737780]' : 'text-[#006c4a]'}`}>
                {p.deadline ? (open ? `Otvoren do ${new Date(p.deadline).toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Sarajevo' })}` : 'Zatvoren') : POST_TYPE[p.type]}
              </span>
              <span className="font-pub text-[#737780] text-[13px] leading-[20px]">{p.category}</span>
            </span>
            <span className="font-pub font-semibold text-[#062343] text-[15px] leading-[24px]">{p.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
