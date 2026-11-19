import Link from 'next/link';
import type { PostListItem, Doc } from '@/lib/api';
import { dateLong, daysUntil, dateShort, fileExt, fileSize, POST_TYPE, DOC_TYPE } from '@/lib/format';

const FALLBACK_IMG = '/placeholder-mtto.svg';

export function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`font-label-kicker text-label-kicker uppercase tracking-wider ${light ? 'text-secondary-fixed' : 'text-secondary'}`}>{children}</span>;
}

export function DemoBadge({ show, className = '' }: { show?: boolean; className?: string }) {
  if (!show) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded bg-herzeg-gold-soft text-[#786000] border border-herzeg-gold font-label-badge text-label-badge uppercase ${className}`} title="Primjer podataka za prezentaciju">
      <span className="material-symbols-outlined text-[13px]">science</span>Demo
    </span>
  );
}

export function PageHero({ kicker, title, lead, crumbs, children }: { kicker: string; title: string; lead?: string; crumbs: { href?: string; label: string }[]; children?: React.ReactNode }) {
  return (
    <section className="relative w-full overflow-hidden bg-institutional-navy-deep text-on-primary">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-fixed-dim/10 blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-xl relative z-10">
        <nav className="flex flex-wrap items-center gap-1 font-body-sm text-body-sm text-surface-variant mb-space-md" aria-label="Putanja">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="material-symbols-outlined text-[16px]">chevron_right</span>}
              {c.href ? <Link href={c.href} className="hover:text-white">{c.label}</Link> : <span className="text-surface-container-high">{c.label}</span>}
            </span>
          ))}
        </nav>
        <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded bg-surface-container-lowest/10 backdrop-blur-sm text-surface-container-high mb-space-sm">
          <span className="material-symbols-outlined text-[16px] text-secondary-fixed">verified_user</span>
          <span className="font-label-kicker text-label-kicker tracking-widest uppercase">{kicker}</span>
        </div>
        <h1 className="font-display text-headline-lg-mobile md:text-display text-on-primary tracking-tight leading-tight max-w-4xl">{title}</h1>
        {lead && <p className="mt-space-sm font-body-lead text-body-lead text-surface-container-high max-w-3xl">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

export function PostCardLarge({ p }: { p: PostListItem }) {
  return (
    <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-md group hover:shadow-lg transition-all">
      <Link href={`/vijesti/${p.slug}`} className="block">
        <div className="relative h-64 md:h-80 w-full overflow-hidden bg-surface-container">
          <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" src={p.coverImage || FALLBACK_IMG} alt="" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-2.5 py-1 rounded bg-secondary text-on-secondary font-label-badge text-label-badge uppercase tracking-wider">{POST_TYPE[p.type] ?? p.type}</span>
            <span className="px-2.5 py-1 rounded bg-institutional-navy-deep text-on-primary font-label-badge text-label-badge uppercase tracking-wider">{p.category}</span>
          </div>
        </div>
        <div className="p-space-md md:p-space-lg space-y-space-sm">
          <div className="flex flex-wrap items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>{dateLong(p.publishedAt)}</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-primary">visibility</span>{p.views.toLocaleString('bs-BA')} pregleda</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-primary group-hover:text-secondary transition-colors leading-snug">{p.title}</h3>
          <p className="font-body-regular text-body-regular text-text-body line-clamp-3">{p.excerpt}</p>
          <span className="inline-flex items-center gap-space-xs font-button text-button text-primary font-bold group-hover:text-secondary transition-colors">
            Pročitaj više<span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

export function PostCard({ p }: { p: PostListItem }) {
  return (
    <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col justify-between group hover:shadow-lg transition-all">
      <Link href={`/vijesti/${p.slug}`} className="space-y-space-xs block">
        <div className="h-44 rounded-lg overflow-hidden mb-space-sm relative bg-surface-container">
          <img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src={p.coverImage || FALLBACK_IMG} alt="" />
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface-container-high text-primary font-label-badge text-label-badge uppercase">{p.category}</span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-[15px]">event</span>{dateLong(p.publishedAt)}
        </div>
        <h4 className="font-title-md text-title-md font-bold text-primary group-hover:text-secondary transition-colors leading-snug">{p.title}</h4>
        <p className="font-body-sm text-body-sm text-text-body line-clamp-3">{p.excerpt}</p>
      </Link>
      <div className="pt-space-md flex items-center justify-between">
        <Link href={`/vijesti/${p.slug}`} className="font-button text-button text-primary font-bold inline-flex items-center gap-1 group-hover:text-secondary">
          Detalji<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
        <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-label-badge text-label-badge">{POST_TYPE[p.type] ?? p.type}</span>
      </div>
    </article>
  );
}

export function DeadlineBadge({ deadline }: { deadline: string | null }) {
  if (!deadline) return null;
  const d = daysUntil(deadline)!;
  const open = d >= 0;
  return (
    <span className={`font-label-badge text-label-badge font-bold flex items-center gap-1 ${open ? (d <= 7 ? 'text-error' : 'text-secondary') : 'text-outline'}`}>
      <span className="material-symbols-outlined text-[14px]">timer</span>
      {open ? `Rok: ${dateShort(deadline)}` : 'Zatvoreno'}
    </span>
  );
}

export function CallItem({ p }: { p: PostListItem }) {
  const open = !p.deadline || daysUntil(p.deadline)! >= 0;
  return (
    <Link href={`/vijesti/${p.slug}`} className="block p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors space-y-space-xs">
      <div className="flex items-center justify-between gap-2">
        <span className={`px-2 py-0.5 rounded font-label-badge text-label-badge uppercase ${open ? 'bg-emerald-light text-secondary' : 'bg-surface-container-high text-outline'}`}>{open ? 'Otvoren poziv' : 'Zatvoren'}</span>
        <DeadlineBadge deadline={p.deadline} />
      </div>
      <h4 className="font-title-md text-title-md font-bold text-primary leading-snug">{p.title}</h4>
      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{p.excerpt}</p>
    </Link>
  );
}

export function DocRow({ d }: { d: Doc }) {
  const ext = fileExt(d.fileName);
  return (
    <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noopener" className="flex items-center gap-space-md p-space-md rounded-lg border border-slate-border bg-surface-container-lowest hover:border-primary hover:shadow-[0_4px_12px_rgba(35,70,150,0.08)] transition-all group">
      <span className={`w-11 h-11 shrink-0 rounded-lg flex items-center justify-center font-label-badge text-label-badge font-bold ${ext === 'PDF' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-primary'}`}>{ext}</span>
      <span className="flex-1 min-w-0">
        <span className="block font-title-md text-title-md font-bold text-primary group-hover:text-secondary leading-snug">{d.title}</span>
        <span className="block font-body-sm text-body-sm text-on-surface-variant">
          {DOC_TYPE[d.docType] ?? d.docType} · {fileSize(d.size)}{d.issuedAt ? ` · ${dateShort(d.issuedAt)}` : ''}
        </span>
      </span>
      <span className="material-symbols-outlined text-primary group-hover:text-secondary">download</span>
    </a>
  );
}

export function EmptyState({ icon = 'search_off', title, text }: { icon?: string; title: string; text?: string }) {
  return (
    <div className="text-center py-space-2xl px-space-md bg-surface-container-lowest rounded-xl border border-dashed border-slate-border">
      <span className="material-symbols-outlined text-[40px] text-outline">{icon}</span>
      <p className="mt-space-sm font-title-md text-title-md font-bold text-primary">{title}</p>
      {text && <p className="font-body-sm text-body-sm text-on-surface-variant">{text}</p>}
    </div>
  );
}
