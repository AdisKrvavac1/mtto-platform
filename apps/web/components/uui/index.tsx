/* Untitled UI PRO (v8) – biblioteka marketinških sekcija za javni portal MTTO.
   Tokeni: Inter, neutralna siva skala, brand var(--br-600), radijusi 8/10/12/16, kontejner 1280 px + 32 px. */
import Link from 'next/link';
import type { ComponentType, CSSProperties, ReactNode, SVGProps } from 'react';
import { ArrowRight, ArrowUpRight } from '@untitledui/icons';
import CountUp from './CountUp';
export { CountUp };

export type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number; color?: string }>;
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ── Raspored ─────────────────────────────────────────── */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-[1376px] px-4 md:px-8', className)}>{children}</div>;
}
/** Gradijent iz MTTO Figme: tamna plava baza, zeleni sjaj gore lijevo, plavi dolje desno (Untitled Blue + Green). */
export const GRAD = 'bg-[#062343] bg-[radial-gradient(ellipse_at_0%_0%,rgba(9,146,80,0.32)_0%,transparent_45%),radial-gradient(ellipse_at_100%_100%,rgba(21,112,239,0.28)_0%,transparent_55%)]';
export function Section({ children, className = '', id, tone = 'white' }: { children: ReactNode; className?: string; id?: string; tone?: 'white' | 'gray' | 'brand' | 'dark' }) {
  const bg = { white: 'bg-white', gray: 'bg-[#fafafa]', brand: 'bg-[var(--br-800)] text-white', dark: `${GRAD} text-white` }[tone];
  return <section id={id} className={cx('py-16 md:py-24 scroll-mt-24', bg, className)}><Container>{children}</Container></section>;
}
export const Divider = () => <Container><hr className="border-[#e5e5e5]" /></Container>;

/* ── Dugmad ───────────────────────────────────────────── */
type BtnProps = { href?: string; children: ReactNode; variant?: 'primary' | 'secondary' | 'tertiary' | 'link' | 'secondary-color'; size?: 'sm' | 'md' | 'lg' | 'xl'; icon?: Icon; iconRight?: Icon; className?: string; external?: boolean; type?: 'button' | 'submit'; disabled?: boolean; title?: string };
const SKEU = 'shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),inset_0_0_0_1px_rgba(10,13,18,0.18)]';
export function Button({ href, children, variant = 'primary', size = 'md', icon: I, iconRight: IR, className = '', external, type = 'button', disabled, title }: BtnProps) {
  const sz = { sm: 'h-9 px-3 text-[14px] gap-1', md: 'h-10 px-[14px] text-[14px] gap-1', lg: 'h-11 px-4 text-[16px] gap-1.5', xl: 'h-12 px-[18px] text-[16px] gap-1.5' }[size];
  const v = {
    primary: `bg-[var(--br-600)] text-white hover:bg-[var(--br-700)] border-2 border-white/10 ${SKEU}`,
    secondary: `bg-white text-[#404040] hover:bg-[#fafafa] hover:text-[#262626] ${SKEU}`,
    'secondary-color': 'bg-[var(--br-50)] text-[var(--br-700)] hover:bg-[var(--br-100)] ring-1 ring-inset ring-[var(--br-200)]',
    tertiary: 'text-[#525252] hover:bg-[#fafafa] hover:text-[#404040]',
    link: '!h-auto !px-0 text-[var(--br-700)] hover:text-[var(--br-800)]',
  }[variant];
  const cls = cx('inline-flex items-center justify-center rounded-[8px] font-semibold leading-6 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--br-ring2)] disabled:opacity-50 disabled:pointer-events-none', sz, v, className);
  const inner = (<>{I && <I size={20} className={variant === 'secondary' ? 'text-[#a3a3a3]' : ''} />}<span className="px-0.5">{children}</span>{IR && <IR size={20} />}</>);
  if (href) return external || /^(https?:|mailto:|tel:)/.test(href)
    ? <a href={href} className={cls} title={title} {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noopener' } : {})}>{inner}</a>
    : <Link href={href} className={cls} title={title}>{inner}</Link>;
  return <button type={type} className={cls} disabled={disabled} title={title}>{inner}</button>;
}

/* ── Značke ───────────────────────────────────────────── */
const BADGE = {
  gray: 'bg-[#fafafa] text-[#404040] ring-[#e5e5e5]', brand: 'bg-[var(--br-50)] text-[var(--br-700)] ring-[var(--br-200)]', success: 'bg-[#ecfdf3] text-[#067647] ring-[#abefc6]',
  warning: 'bg-[#fffaeb] text-[#b54708] ring-[#fedf89]', error: 'bg-[#fef3f2] text-[#b42318] ring-[#fecdca]', blue: 'bg-[#eff8ff] text-[#175cd3] ring-[#b2ddff]',
} as const;
const DOT = { gray: 'bg-[#a3a3a3]', brand: 'bg-[var(--br-500)]', success: 'bg-[#17b26a]', warning: 'bg-[#f79009]', error: 'bg-[#f04438]', blue: 'bg-[#2e90fa]' } as const;
export type Tone = keyof typeof BADGE;
export function Badge({ children, tone = 'gray', dot, size = 'sm', className = '' }: { children: ReactNode; tone?: Tone; dot?: boolean; size?: 'sm' | 'md'; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1.5 rounded-full ring-1 ring-inset font-medium whitespace-nowrap', size === 'sm' ? 'px-2 py-0.5 text-[12px] leading-[18px]' : 'px-2.5 py-0.5 text-[14px] leading-5', dot && 'pl-1.5', BADGE[tone], className)}>{dot && <span className={cx('size-1.5 rounded-full', DOT[tone])} />}{children}</span>;
}
/** "Badge group" iz hero sekcije: mala značka + tekst + strelica. */
export function BadgeGroup({ label, children, href, tone = 'brand' }: { label: string; children: ReactNode; href?: string; tone?: Tone }) {
  const body = (
    <span className="inline-flex items-center gap-2 rounded-[10px] bg-white py-1 pl-1 pr-2 ring-1 ring-inset ring-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] text-[14px] leading-5 font-medium text-[#404040] hover:bg-[#fafafa]">
      <span className={cx('inline-flex items-center gap-1.5 rounded-[6px] px-2 py-0.5 ring-1 ring-inset', tone === 'brand' ? 'ring-[#d4d4d4] bg-white' : BADGE[tone])}><span className={cx('size-2 rounded-full ring-[3px]', tone === 'error' ? 'bg-[#f04438] ring-[#fee4e2]' : tone === 'warning' ? 'bg-[#f79009] ring-[#fef0c7]' : 'bg-[#17b26a] ring-[#dcfae6]')} />{label}</span>
      <span className="inline-flex items-center gap-1">{children}<ArrowRight size={16} className="text-[#a3a3a3]" /></span>
    </span>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

/* ── Ikone ────────────────────────────────────────────── */
/** Featured icon – "modern" stil (bijela pločica, obrub, skeuomorfna sjena). */
export function FeaturedIcon({ icon: I, size = 'lg', tone = 'modern', ripple = true }: { icon: Icon; size?: 'md' | 'lg' | 'xl'; tone?: 'modern' | 'brand' | 'error' | 'warning' | 'success'; ripple?: boolean }) {
  const box = { md: 'size-10 rounded-[8px]', lg: 'size-12 rounded-[10px]', xl: 'size-14 rounded-[12px]' }[size];
  const ic = { md: 20, lg: 24, xl: 28 }[size];
  if (tone === 'modern') return <span className={cx('inline-flex items-center justify-center bg-white text-[#404040] shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5', box, SKEU)}><I size={ic} /></span>;
  const t = { brand: 'bg-[var(--br-100)] text-[var(--br-600)] ring-[var(--br-50)]', error: 'bg-[#fee4e2] text-[#d92d20] ring-[#fef3f2]', warning: 'bg-[#fef0c7] text-[#dc6803] ring-[#fffaeb]', success: 'bg-[#dcfae6] text-[#079455] ring-[#ecfdf3]' }[tone];
  // Valovi: unutrašnji krug i ikona miruju, svijetli prstenovi se šire kao valovi na vodi
  const rip = { brand: 'var(--br-200)', error: '#fecdca', warning: '#fedf89', success: '#abefc6' }[tone];
  const dim = size === 'md' ? 'size-10' : size === 'lg' ? 'size-12' : 'size-14';
  return (
    <span className={cx('inline-flex shrink-0 rounded-full', ripple && 'uui-ripple', dim)} style={ripple ? ({ '--rip': rip } as CSSProperties) : undefined}>
      <span className={cx('relative z-[1] inline-flex items-center justify-center rounded-full ring-[6px]', dim, t)}><I size={ic} /></span>
    </span>
  );
}

/* ── Naslovi sekcija ─────────────────────────────────── */
export function SectionHeader({ eyebrow, title, children, align = 'left', actions, className = '' }: { eyebrow?: ReactNode; title: ReactNode; children?: ReactNode; align?: 'left' | 'center'; actions?: ReactNode; className?: string }) {
  return (
    <div className={cx('flex flex-col gap-8 md:flex-row md:items-end md:justify-between', align === 'center' && 'md:!flex-col md:!items-center text-center', className)}>
      <div className={cx('flex flex-col max-w-[768px]', align === 'center' && 'items-center')}>
        {eyebrow && <p className="text-[14px] leading-5 md:text-[16px] md:leading-6 font-semibold text-[var(--br-700)]">{eyebrow}</p>}
        <h2 className={cx('text-[30px] leading-[38px] md:text-[36px] md:leading-[44px] font-semibold tracking-[-0.02em] text-[#171717] text-balance', eyebrow ? 'mt-3' : '')}>{title}</h2>
        {children && <div className="mt-4 md:mt-5 text-[18px] leading-7 md:text-[20px] md:leading-[30px] text-[#525252]">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

/** Zaglavlje podstranice (Untitled "Header section"): eyebrow, display naslov, podnaslov, opcionalni sadržaj ispod. */
export function PageHeader({ eyebrow, title, children, actions, crumbs, align = 'left', after }: { eyebrow?: ReactNode; title: ReactNode; children?: ReactNode; actions?: ReactNode; crumbs?: { label: string; href?: string }[]; align?: 'left' | 'center'; after?: ReactNode }) {
  return (
    <section className="bg-white pt-12 pb-12 md:pt-16 md:pb-16">
      <Container>
        {crumbs && (
          <nav aria-label="Putanja" className="mb-8 flex flex-wrap items-center gap-2 text-[14px] leading-5 font-medium text-[#525252]">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-[#d4d4d4]">/</span>}
                {c.href ? <Link href={c.href} className="hover:text-[#262626]">{c.label}</Link> : <span className="text-[var(--br-700)] font-semibold" aria-current="page">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        <div className={cx('flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between', align === 'center' && 'lg:!flex-col lg:!items-center text-center')}>
          <div className={cx('flex flex-col max-w-[768px]', align === 'center' && 'items-center')}>
            {eyebrow && <p className="text-[14px] leading-5 md:text-[16px] md:leading-6 font-semibold text-[var(--br-700)]">{eyebrow}</p>}
            <h1 className={cx('text-[36px] leading-[44px] md:text-[48px] md:leading-[60px] font-semibold tracking-[-0.02em] text-[#171717] text-balance', !!eyebrow && 'mt-3')}>{title}</h1>
            {children && <div className="mt-4 md:mt-6 text-[18px] leading-7 md:text-[20px] md:leading-[30px] text-[#525252]">{children}</div>}
          </div>
          {actions && <div className="flex flex-wrap gap-3 shrink-0">{actions}</div>}
        </div>
        {after && <div className="mt-10 md:mt-12">{after}</div>}
      </Container>
    </section>
  );
}

/* ── Kartice ─────────────────────────────────────────── */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cx('rounded-[12px] bg-white ring-1 ring-inset ring-[#e5e5e5] shadow-[0_1px_2px_rgba(10,13,18,0.05)]', className)}>{children}</div>;
}
export function Feature({ icon, title, children, href, cta = 'Saznaj više', align = 'left', tone }: { icon: Icon; title: ReactNode; children?: ReactNode; href?: string; cta?: string; align?: 'left' | 'center'; tone?: 'modern' | 'brand' }) {
  return (
    <div className={cx('group flex flex-col', align === 'center' && 'items-center text-center')}>
      <FeaturedIcon icon={icon} tone={tone ?? 'modern'} />
      <h3 className="mt-4 md:mt-5 text-[18px] leading-7 md:text-[20px] md:leading-[30px] font-semibold text-[#171717]">{title}</h3>
      {children && <div className="mt-1 md:mt-2 text-[16px] leading-6 text-[#525252]">{children}</div>}
      {href && <Link href={href} className="mt-4 md:mt-5 inline-flex items-center gap-1.5 text-[16px] leading-6 font-semibold text-[var(--br-700)] hover:text-[var(--br-800)] [&>svg]:transition-transform hover:[&>svg]:translate-x-1">{cta}<ArrowRight size={20} /></Link>}
    </div>
  );
}
export function Metric({ value, label, children }: { value: ReactNode; label: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 text-center md:text-left">
      <p className="text-[48px] leading-[60px] md:text-[60px] md:leading-[72px] font-semibold tracking-[-0.02em] text-[var(--br-600)]">{typeof value === 'string' || typeof value === 'number' ? <CountUp value={value} /> : value}</p>
      <div><p className="text-[18px] leading-7 font-semibold text-[#171717]">{label}</p>{children && <p className="mt-1 text-[16px] leading-6 text-[#525252]">{children}</p>}</div>
    </div>
  );
}

/** Kartica članka (Untitled "Blog post card"). */
export function PostCard({ href, image, category, title, excerpt, meta, badge }: { href: string; image?: string | null; category?: string; title: string; excerpt?: string | null; meta?: ReactNode; badge?: ReactNode }) {
  return (
    <article className="group flex flex-col">
      <Link href={href} className="block overflow-hidden rounded-[16px] bg-[#f5f5f5] ring-1 ring-inset ring-black/5 aspect-[16/10]" tabIndex={-1} aria-hidden>
        {image ? <img src={image} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" /> : <span className="flex size-full items-center justify-center bg-gradient-to-br from-[var(--br-50)] to-[var(--br-100)]"><img src="/mtto-logo.svg" alt="" className="h-16 opacity-60" /></span>}
      </Link>
      <div className="mt-5 flex items-center gap-2">{category && <p className="text-[14px] leading-5 font-semibold text-[var(--br-700)]">{category}</p>}{badge}</div>
      <Link href={href} className="mt-2 flex items-start justify-between gap-4">
        <h3 className="text-[18px] leading-7 font-semibold text-[#171717] group-hover:text-[var(--br-700)] line-clamp-3">{title}</h3>
        <ArrowUpRight size={24} className="mt-0.5 shrink-0 text-[#a3a3a3] group-hover:text-[var(--br-700)]" />
      </Link>
      {excerpt && <p className="mt-2 text-[16px] leading-6 text-[#525252] line-clamp-3">{excerpt}</p>}
      {meta && <div className="mt-5 text-[14px] leading-5 text-[#525252]">{meta}</div>}
    </article>
  );
}

/** CTA sekcija (Untitled "CTA section" – sivi okvir, centrirano). */
export function CtaBox({ title, children, actions, icon }: { title: ReactNode; children?: ReactNode; actions?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-[16px] bg-[#fafafa] px-6 py-10 md:px-8 md:py-12 text-center flex flex-col items-center">
      {icon && <div className="mb-6">{icon}</div>}
      <h3 className="text-[20px] leading-[30px] md:text-[24px] md:leading-8 font-semibold text-[#171717]">{title}</h3>
      {children && <p className="mt-2 text-[16px] leading-6 md:text-[18px] md:leading-7 text-[#525252] max-w-[640px]">{children}</p>}
      {actions && <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}

/** FAQ (Untitled "FAQ section") – nativni <details>, bez JS-a. */
export function Faq({ items }: { items: { q: string; a: ReactNode }[] }) {
  return (
    <div className="mx-auto max-w-[768px] divide-y divide-[#e5e5e5]">
      {items.map((it, i) => (
        <details key={i} className="group py-6 first:pt-0" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[18px] leading-7 font-semibold text-[#171717] [&::-webkit-details-marker]:hidden">
            {it.q}
            <span aria-hidden className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ring-2 ring-[#a3a3a3] text-[#a3a3a3] text-[16px] leading-none"><span className="group-open:hidden">+</span><span className="hidden group-open:inline">−</span></span>
          </summary>
          <div className="mt-2 pr-12 text-[16px] leading-6 text-[#525252]">{it.a}</div>
        </details>
      ))}
    </div>
  );
}

/** Tablica (Untitled "Table"): zaglavlje bg-gray-50, xs medium, redovi 72 px. */
export function TableCard({ title, badge, description, actions, children, footer }: { title?: ReactNode; badge?: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      {(title || actions) && (
        <div className="flex flex-col gap-4 border-b border-[#e5e5e5] px-4 py-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex flex-col gap-1"><div className="flex items-center gap-2"><h2 className="text-[18px] leading-7 font-semibold text-[#171717]">{title}</h2>{badge}</div>{description && <p className="text-[14px] leading-5 text-[#525252]">{description}</p>}</div>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
      {footer && <div className="border-t border-[#e5e5e5] px-4 py-3 md:px-6">{footer}</div>}
    </Card>
  );
}
export const th = 'px-6 py-3 text-left text-[12px] leading-[18px] font-medium text-[#525252] bg-[#fafafa] border-b border-[#e5e5e5] whitespace-nowrap';
export const td = 'px-6 py-4 text-[14px] leading-5 text-[#525252] border-b border-[#e5e5e5] align-middle';

/** Hero "split image" (Untitled "Hero header section" – tekst lijevo, slika desno s plutajućom karticom). */
export function SplitHero({ eyebrow, title, children, actions, image, imageAlt = '', card, crumbs }: { eyebrow?: ReactNode; title: ReactNode; children?: ReactNode; actions?: ReactNode; image: string; imageAlt?: string; card?: ReactNode; crumbs?: { label: string; href?: string }[] }) {
  return (
    <section className="bg-white pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      <Container>
        {crumbs && (
          <nav aria-label="Putanja" className="mb-8 flex flex-wrap items-center gap-2 text-[14px] leading-5 font-medium text-[#525252]">
            {crumbs.map((c, i) => <span key={i} className="flex items-center gap-2">{i > 0 && <span className="text-[#d4d4d4]">/</span>}{c.href ? <Link href={c.href} className="hover:text-[#262626]">{c.label}</Link> : <span className="text-[var(--br-700)] font-semibold" aria-current="page">{c.label}</span>}</span>)}
          </nav>
        )}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            {eyebrow && <p className="text-[14px] leading-5 md:text-[16px] md:leading-6 font-semibold text-[var(--br-700)]">{eyebrow}</p>}
            <h1 className="mt-3 text-[36px] leading-[44px] md:text-[60px] md:leading-[72px] font-semibold tracking-[-0.02em] text-[#171717] text-balance">{title}</h1>
            {children && <div className="mt-4 md:mt-6 text-[18px] leading-7 md:text-[20px] md:leading-[30px] text-[#525252] max-w-[560px]">{children}</div>}
            {actions && <div className="mt-8 md:mt-12 flex flex-col-reverse gap-3 sm:flex-row">{actions}</div>}
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[24px] aspect-[4/3] lg:aspect-[5/6] bg-[#f5f5f5]"><img src={image} alt={imageAlt} className="size-full object-cover" /></div>
            {card && <div className="absolute -bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[320px] rounded-[16px] bg-white/90 p-5 ring-1 ring-black/10 backdrop-blur-md shadow-[0_20px_24px_-4px_rgba(10,13,18,0.08),0_8px_8px_-4px_rgba(10,13,18,0.03)]">{card}</div>}
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Slikovna kartica (Untitled "Image card" s gradijentom i staklenim natpisom). */
export function ImageCard({ href, image, title, text, badge }: { href: string; image: string; title: string; text?: string; badge?: ReactNode }) {
  return (
    <Link href={href} className="group relative flex min-h-[360px] items-end overflow-hidden rounded-[16px]">
      <img src={image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <span className="relative m-4 flex w-full flex-col gap-2 rounded-[12px] bg-white/15 p-5 text-white ring-1 ring-white/30 backdrop-blur-md">
        {badge}
        <span className="flex items-center justify-between gap-2 text-[20px] leading-[30px] font-semibold">{title}<ArrowUpRight size={24} /></span>
        {text && <span className="text-[16px] leading-6 text-white/90">{text}</span>}
      </span>
    </Link>
  );
}

/** Untitled input/select klase (forme filtera na javnim stranicama). */
export const inputCls = 'h-10 w-full rounded-[8px] bg-white px-3 text-[16px] leading-6 text-[#171717] placeholder:text-[#737373] border border-[#d4d4d4] shadow-[0_1px_2px_rgba(10,13,18,0.05)] focus:outline-none focus:border-[var(--br-300)] focus:ring-4 focus:ring-[var(--br-ring)]';
export const labelCls = 'text-[14px] leading-5 font-medium text-[#404040]';

/** Bijeli "filter bar" s pretragom i padajućim izbornicima. */
export function FilterField({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <label className={cx('flex flex-col gap-1.5', className)}><span className={labelCls}>{label}</span>{children}</label>;
}

/** Istaknuta objava: fotografija preko cijele širine sa staklenom (blur) karticom. */
export function FeaturedPost({ href, image, title, excerpt, category, date, badge }: { href: string; image?: string | null; title: string; excerpt?: string | null; category?: string; date?: string; badge?: ReactNode }) {
  return (
    <Link href={href} className="group relative flex min-h-[420px] items-end overflow-hidden rounded-[24px] bg-[var(--br-950)] md:min-h-[560px]">
      <img src={image || '/hero/neretva-m.jpg'} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
      <span className="relative m-3 flex w-full items-center justify-between gap-4 rounded-[16px] bg-white/15 px-4 py-3 text-white ring-1 ring-inset ring-white/30 backdrop-blur-md md:m-5 md:px-6 md:py-4">
        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-2 text-[12px] leading-[18px]">
            <span className="rounded-full bg-[var(--gr-50)] px-2 py-0.5 font-medium text-[var(--gr-700)]">Istaknuto</span>
            {category && <span className="rounded-full bg-white/15 px-2 py-0.5 font-medium ring-1 ring-inset ring-white/30">{category}</span>}
            {badge}
            {date && <span className="text-white/80">{date}</span>}
          </span>
          <span className="line-clamp-2 text-[16px] leading-6 md:text-[20px] md:leading-[30px] font-semibold">{title}</span>
          {excerpt && <span className="hidden text-[14px] leading-5 text-white/85 lg:line-clamp-1">{excerpt}</span>}
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-inset ring-white/30 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"><ArrowUpRight size={20} /></span>
      </span>
    </Link>
  );
}

/** Zaglavlje podstranice po MTTO Figma kosturu: gradijent, oznaka, naslov, uvod, desna kartica i red statistika. */
export type HeroStat = { label: string; value: string | number; sub?: string; icon?: Icon };
export function PageHero({ crumbs, eyebrow, title, children, aside, stats, actions }: { crumbs?: { label: string; href?: string }[]; eyebrow?: string; title: ReactNode; children?: ReactNode; aside?: ReactNode; stats?: HeroStat[]; actions?: ReactNode }) {
  return (
    <section className={cx('relative isolate overflow-hidden text-white', GRAD)}>
      <div aria-hidden className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <Container className="relative pb-12 pt-10 md:pb-16 md:pt-14">
        {crumbs && (
          <nav aria-label="Putanja" className="mb-6 flex flex-wrap items-center gap-2 text-[14px] leading-5 font-medium text-[var(--br-200)]">
            {crumbs.map((c, i) => <span key={i} className="flex items-center gap-2">{i > 0 && <span className="text-white/30">/</span>}{c.href ? <Link href={c.href} className="hover:text-white">{c.label}</Link> : <span className="font-semibold text-white" aria-current="page">{c.label}</span>}</span>)}
          </nav>
        )}
        <div className={cx('grid gap-8', !!aside && 'lg:grid-cols-[1fr_auto] lg:items-start')}>
          <div className="max-w-[820px]">
            {eyebrow && <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--gr-500)]/15 px-2.5 py-0.5 text-[12px] leading-[18px] font-semibold text-[var(--gr-200)] ring-1 ring-inset ring-[var(--gr-500)]/40"><span className="size-1.5 rounded-full bg-[var(--gr-400)]" />{eyebrow}</span>}
            <h1 className="mt-4 text-[36px] leading-[44px] md:text-[48px] md:leading-[60px] font-semibold tracking-[-0.02em] text-white text-balance">{title}</h1>
            {children && <div className="mt-4 max-w-[720px] text-[18px] leading-7 text-[var(--br-100)]">{children}</div>}
            {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>}
          </div>
          {aside}
        </div>
        {stats && stats.length > 0 && (
          <div className={cx('mt-10 grid grid-cols-2 gap-3 md:gap-4', stats.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
            {stats.map((s) => (
              <div key={s.label} className="rounded-[12px] bg-white/10 p-4 ring-1 ring-inset ring-white/15 backdrop-blur-md md:p-5">
                <p className="flex items-center justify-between gap-2 text-[14px] font-medium text-[var(--br-200)]">{s.label}{s.icon && <s.icon size={20} className="shrink-0 text-[var(--gr-300)]" />}</p>
                <p className="mt-2 text-[26px] leading-8 md:text-[30px] md:leading-[38px] font-semibold text-white"><CountUp value={s.value} /></p>
                {s.sub && <p className="mt-1 text-[12px] leading-[18px] font-medium text-[var(--gr-300)]">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

/** Staklena info-kartica za desnu stranu PageHero (npr. "Ažurnost arhiva"). */
export function HeroInfo({ icon: I, label, value, children }: { icon: Icon; label: string; value: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-[16px] bg-white/10 p-5 ring-1 ring-inset ring-white/20 backdrop-blur-md lg:min-w-[300px]">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-[var(--gr-600)] text-white"><I size={24} /></span>
      <div><p className="text-[12px] font-semibold text-[var(--gr-200)]">{label}</p><p className="text-[20px] leading-[30px] font-semibold text-white">{value}</p>{children && <div className="mt-1 text-[14px] text-[var(--br-100)]">{children}</div>}</div>
    </div>
  );
}

/** Zaglavlje sekcije u Figma kosturu (zelena oznaka iznad, naslov, akcija desno). */
export function Head({ k, t, s, dark, action }: { k?: string; t: ReactNode; s?: ReactNode; dark?: boolean; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {k && <p className={cx('text-[14px] leading-5 font-semibold', dark ? 'text-[var(--gr-300)]' : 'text-[var(--br-700)]')}>{k}</p>}
        <h2 className={cx('mt-2 text-[28px] leading-9 md:text-[36px] md:leading-[44px] font-semibold tracking-[-0.02em]', dark ? 'text-white' : 'text-[#171717]')}>{t}</h2>
        {s && <div className={cx('mt-3 max-w-[720px] text-[16px] leading-6 md:text-[18px] md:leading-7', dark ? 'text-[var(--br-200)]' : 'text-[#525252]')}>{s}</div>}
      </div>
      {action}
    </div>
  );
}

/** Gumbi za tamni (GRAD) hero: primarni zeleni i staklasti sekundarni */
export const HB1 = 'inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] border-2 border-white/10 bg-[var(--br-600)] px-4 text-[16px] font-semibold text-white transition-colors hover:bg-[var(--br-700)]';
export const HB2 = 'inline-flex h-11 items-center justify-center gap-1.5 rounded-[8px] bg-white/10 px-4 text-[16px] font-semibold text-white ring-1 ring-inset ring-white/25 backdrop-blur-md transition-colors hover:bg-white/15';

/* ── Untitled UI: Tag, kategorija i ikona tipa datoteke ───────────── */
/** Tag (Untitled "Tags"): bijela podloga, sivi obrub, opcionalna tačka i broj. */
export function Tag({ children, dot, count, href, size = 'md' }: { children: ReactNode; dot?: string; count?: number; href?: string; size?: 'sm' | 'md' }) {
  const body = (
    <span className={cx('inline-flex items-center gap-1.5 rounded-[6px] bg-white font-medium text-[#414651] ring-1 ring-inset ring-[#d5d7da] whitespace-nowrap', size === 'sm' ? 'px-2 py-0.5 text-[12px] leading-[18px]' : 'px-2.5 py-1 text-[14px] leading-5', href && 'hover:bg-[#fafafa]')}>
      {dot && <span className="size-1.5 rounded-full" style={{ background: dot }} />}
      {children}
      {count != null && <span className="rounded-[3px] bg-[#f5f5f5] px-1 text-[12px] leading-[18px] text-[#414651] ring-1 ring-inset ring-[#e9eaeb]">{count}</span>}
    </span>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

/** Boje rubrika (Untitled badge paleta) – ista boja za istu rubriku na cijelom portalu. */
export const CATEGORY_TONE: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  'Turizam': { bg: '#eff8ff', text: '#175cd3', ring: '#b2ddff', dot: '#2e90fa' },
  'Zaštita okoliša': { bg: '#ecfdf3', text: '#067647', ring: '#abefc6', dot: '#17b26a' },
  'Trgovina': { bg: '#fef6ee', text: '#b93815', ring: '#f9dbaf', dot: '#ef6820' },
  'Javni poziv': { bg: '#f4f3ff', text: '#5925dc', ring: '#d9d6fe', dot: '#7a5af8' },
  'Saopćenje': { bg: '#fdf2fa', text: '#c11574', ring: '#fcceee', dot: '#ee46bc' },
  'Vijest': { bg: '#eef4ff', text: '#3538cd', ring: '#c7d7fe', dot: '#6172f3' },
  'Opće': { bg: '#fafafa', text: '#414651', ring: '#e9eaeb', dot: '#a4a7ae' },
};
export function CategoryBadge({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const t = CATEGORY_TONE[name] ?? CATEGORY_TONE['Opće'];
  return <span className={cx('inline-flex items-center rounded-full font-medium whitespace-nowrap ring-1 ring-inset', size === 'sm' ? 'px-2 py-0.5 text-[12px] leading-[18px]' : 'px-2.5 py-0.5 text-[14px] leading-5')} style={{ background: t.bg, color: t.text, boxShadow: `inset 0 0 0 1px ${t.ring}` }}>{name}</span>;
}
/** "Badge group" iz Untitled blog kartice: [● Rubrika] + tekst. */
export function MetaGroup({ label, children }: { label: string; children?: ReactNode }) {
  const t = CATEGORY_TONE[label] ?? CATEGORY_TONE['Opće'];
  return (
    <span className="inline-flex items-center gap-2 rounded-[10px] bg-white py-1 pl-1 pr-2.5 text-[14px] leading-5 font-medium text-[#414651] ring-1 ring-inset ring-[#d5d7da]">
      <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-white px-2 py-0.5 ring-1 ring-inset ring-[#d5d7da] shadow-[0_1px_2px_rgba(10,13,18,0.05)]"><span className="size-2 rounded-full" style={{ background: t.dot }} />{label}</span>
      {children}
    </span>
  );
}

const FILE_COLOR: Record<string, string> = { PDF: '#d92d20', DOC: '#155eef', DOCX: '#155eef', XLS: '#079455', XLSX: '#079455', CSV: '#079455', PPT: '#e62e05', PPTX: '#e62e05', ZIP: '#344054', JPG: '#7a5af8', JPEG: '#7a5af8', PNG: '#7a5af8', TXT: '#535862', KML: '#0e9384', GEOJSON: '#0e9384' };
/** Ikona tipa datoteke (Untitled "File type icon", default stil): list s preklopljenim uglom i obojenom oznakom. */
export function FileTypeIcon({ ext, size = 40 }: { ext: string; size?: number }) {
  const e = (ext || 'FILE').toUpperCase().slice(0, 4);
  const c = FILE_COLOR[e] ?? '#535862';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label={`Datoteka ${e}`} role="img" className="shrink-0">
      <path d="M8.75 4A3.25 3.25 0 0 1 12 .75h12.69L35.25 11.31V36A3.25 3.25 0 0 1 32 39.25H12A3.25 3.25 0 0 1 8.75 36V4Z" fill="#fff" stroke="#d5d7da" strokeWidth="1.5" />
      <path d="M24.5 .5V8A3.5 3.5 0 0 0 28 11.5h7.5" stroke="#d5d7da" strokeWidth="1.5" />
      <rect x="2" y="18" width={e.length > 3 ? 30 : 26} height="16" rx="2" fill={c} />
      <text x={e.length > 3 ? 17 : 15} y="29.5" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="9" fontWeight="700" fill="#fff">{e}</text>
    </svg>
  );
}

/* ── Untitled "Blog post card" i istaknuta objava s prekrivenim tekstom ───────────── */
type PostLike = { slug: string; title: string; excerpt?: string | null; coverImage?: string | null; category?: string | null; authorName?: string | null; publishedAt: string; type?: string };
const fmtDate = (iso: string) => new Intl.DateTimeFormat('bs-BA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Sarajevo' }).format(new Date(iso));
function Cover({ logo = 'h-14' }: { logo?: string }) {
  return <span className="flex size-full items-center justify-center bg-gradient-to-br from-[var(--br-50)] to-[var(--br-100)]"><img src="/mtto-logo.svg" alt="" className={`${logo} opacity-60`} /></span>;
}
export function AuthorRow({ name, date, dark }: { name?: string | null; date: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={cx('flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-inset', dark ? 'bg-white/90 ring-white/40' : 'bg-white ring-black/10')}><img src="/mtto-grb.svg" alt="" className="h-6" /></span>
      <span className="min-w-0"><b className={cx('block truncate text-[14px] leading-5 font-semibold', dark ? 'text-white' : 'text-[#181d27]')}>{name || 'MTTO HNK'}</b><span className={cx('text-[14px] leading-5', dark ? 'text-white/80' : 'text-[#535862]')}>{fmtDate(date)}</span></span>
    </div>
  );
}
/** Kartica objave (Untitled blog): slika, rubrika, naslov sa strelicom, sažetak, autor i datum. */
export function NewsCard({ p, label, badges }: { p: PostLike; label?: string; badges?: ReactNode }) {
  return (
    <article className="group flex flex-col">
      <Link href={`/vijesti/${p.slug}`} className="block overflow-hidden rounded-[12px] bg-[#f5f5f5] aspect-[3/2]" tabIndex={-1} aria-hidden>
        {p.coverImage ? <img src={p.coverImage} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <Cover />}
      </Link>
      <div className="mt-5 flex flex-wrap items-center gap-2"><p className="text-[14px] leading-5 font-semibold text-[var(--br-700)]">{label || p.category}</p>{badges}</div>
      <Link href={`/vijesti/${p.slug}`} className="mt-2 flex items-start justify-between gap-4">
        <h3 className="text-[18px] leading-7 font-semibold text-[#181d27] group-hover:text-[var(--br-700)] line-clamp-2">{p.title}</h3>
        <ArrowUpRight size={24} className="mt-0.5 shrink-0 text-[#a4a7ae] group-hover:text-[var(--br-700)]" />
      </Link>
      {p.excerpt && <p className="mt-2 text-[16px] leading-6 text-[#535862] line-clamp-2">{p.excerpt}</p>}
      <div className="mt-6"><AuthorRow name={p.authorName} date={p.publishedAt} /></div>
    </article>
  );
}
/** Istaknuta objava s tekstom preko slike (Untitled "Blog section – featured"). */
export function FeaturedOverlay({ p, tags = [], badges, compact }: { p: PostLike; tags?: string[]; badges?: ReactNode; compact?: boolean }) {
  return (
    <article className={cx('group relative isolate overflow-hidden rounded-[16px] bg-[#0a0d12]', compact ? 'aspect-[4/3] sm:aspect-[16/9]' : 'aspect-square sm:aspect-[16/9] lg:aspect-[2.2/1]')}>
      {p.coverImage ? <img src={p.coverImage} alt="" className="absolute inset-0 -z-10 size-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]" /> : <span className="absolute inset-0 -z-10"><Cover logo="h-24" /></span>}
      <span aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-black/85 via-black/45 to-transparent sm:h-full sm:from-black/75 sm:via-black/25" />
      <div className={cx('absolute inset-x-0 bottom-0 text-white', compact ? 'p-4 md:p-6' : 'p-4 sm:p-5 md:p-8')}>
        {badges && <div className="mb-2 flex flex-wrap gap-2">{badges}</div>}
        <Link href={`/vijesti/${p.slug}`} className="flex items-start justify-between gap-3">
          <h2 className={cx('font-semibold line-clamp-3 sm:line-clamp-none', compact ? 'text-[16px] leading-6 md:text-[24px] md:leading-8' : 'text-[17px] leading-6 sm:text-[24px] sm:leading-8 md:text-[30px] md:leading-[38px]')}>{p.title}</h2>
          <ArrowUpRight size={20} className="mt-0.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
        {p.excerpt && <p className={cx('mt-2 hidden max-w-[880px] text-white/85 line-clamp-2 sm:block', compact ? 'text-[14px] leading-5 md:text-[16px] md:leading-6' : 'text-[16px] leading-6')}>{p.excerpt}</p>}
        <div className="mt-3 flex items-center gap-2 overflow-hidden whitespace-nowrap sm:mt-5">
          <time dateTime={p.publishedAt} className="shrink-0 text-[13px] font-medium text-white/80 sm:text-[14px]">{fmtDate(p.publishedAt)}</time>
          {tags.map((t) => <span key={t} className="shrink-0 rounded-full px-2 py-0.5 text-[12px] font-medium text-white ring-1 ring-inset ring-white/50 backdrop-blur-md sm:px-2.5 sm:text-[14px]">{t}</span>)}
        </div>
      </div>
    </article>
  );
}
