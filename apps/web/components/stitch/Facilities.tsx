/* eslint-disable */
// Generisano iz Stitch HTML-a: ../../../stitch/port.py (ne uređivati ručno)

export function FacHero(props: any) {
  return (
<><section className="bg-institutional-navy-deep text-on-primary py-space-xl relative overflow-hidden shadow-md">
<div className="absolute -right-16 -top-24 w-96 h-96 rounded-full bg-secondary opacity-10 blur-3xl pointer-events-none"></div>
<div className="absolute left-1/3 bottom-0 w-80 h-32 bg-primary-container opacity-20 blur-2xl pointer-events-none"></div>
<div className="max-w-7xl mx-auto px-gutter relative z-10 flex flex-col gap-space-md">
<div className="flex items-center gap-space-xs text-primary-fixed-dim font-label-kicker text-label-kicker uppercase tracking-widest">
<span>Službene evidencije</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span>Sektor za turizam i ugostiteljstvo</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-secondary-fixed">Kategorizacija objekata</span>
</div>
<div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-space-lg">
<div className="max-w-3xl flex flex-col gap-space-xs">
<span className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded bg-secondary/20 text-secondary-fixed font-label-badge text-label-badge w-max">
<span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>hotel_class</span>
            JAVNI REGISTAR SMJEŠTAJA HNŽ / HNK
          </span>
<h1 className="font-headline-lg text-headline-lg text-on-primary tracking-tight">
            Registar Kategoriziranih Ugostiteljskih Objekata
          </h1>
<p className="font-body-lead text-body-lead text-primary-fixed-dim">
            Službeni registar hotela, motela, pansiona, kampova i soba za iznajmljivanje s dodijeljenom kategorijom (zvjezdicama) na području svih 9 općina i gradova Hercegovačko-neretvanske županije.
          </p>
</div>
<div className="flex items-center gap-space-sm bg-primary/60 p-2 rounded-lg backdrop-blur">
<button className="px-space-md py-2 rounded bg-surface-container-lowest text-primary font-button text-button hover:bg-surface-container-high transition-all flex items-center gap-space-xs shadow-sm" id="btnExportCsv">
<span className="material-symbols-outlined text-[18px]">table_view</span>
            Preuzmi CSV
          </button>
<button className="px-space-md py-2 rounded bg-surface-container-lowest text-primary font-button text-button hover:bg-surface-container-high transition-all flex items-center gap-space-xs shadow-sm" id="btnExportXls">
<span className="material-symbols-outlined text-[18px]">download_for_offline</span>
            Preuzmi Excel (.xlsx)
          </button>
<button className="p-2 rounded bg-secondary hover:bg-secondary/80 text-on-secondary transition-colors" title="API Sinkronizacija sa TZ HNŽ">
<span className="material-symbols-outlined text-[18px]">sync_alt</span>
</button>
</div>
</div>
</div>
</section></>
  );
}

export function FacStats(props: any) {
  return (
<><section className="max-w-7xl mx-auto px-gutter w-full -mt-8 relative z-20">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col justify-between group hover:shadow-xl transition-all">
<div className="flex items-center justify-between text-outline">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant">Ukupno Objekata</span>
<span className="material-symbols-outlined text-[20px] text-primary">domain</span>
</div>
<div className="my-space-xs">
<span className="font-headline-lg text-headline-lg text-primary font-extrabold tracking-tight">{props.n.total}</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Aktivnih rješenja MTTO</p>
</div>
<div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full w-full"></div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col justify-between group hover:shadow-xl transition-all">
<div className="flex items-center justify-between text-outline">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant">Ležajni Kapacitet</span>
<span className="material-symbols-outlined text-[20px] text-primary">bed</span>
</div>
<div className="my-space-xs">
<span className="font-headline-lg text-headline-lg text-primary font-extrabold tracking-tight">{props.n.beds}</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Registriranih ležaja</p>
</div>
<div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary-container rounded-full w-4/5"></div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col justify-between group hover:shadow-xl transition-all">
<div className="flex items-center justify-between text-outline">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant">Hoteli 4★ & 5★</span>
<span className="material-symbols-outlined text-[20px] text-on-tertiary-container" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
</div>
<div className="my-space-xs">
<span className="font-headline-lg text-headline-lg text-primary font-extrabold tracking-tight">{props.n.hotels}</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Mostar, Neum, Međugorje</p>
</div>
<div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-on-tertiary-container rounded-full w-2/3"></div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col justify-between group hover:shadow-xl transition-all">
<div className="flex items-center justify-between text-outline">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant">Moteli & Pansioni 3★</span>
<span className="material-symbols-outlined text-[20px] text-surface-tint">night_shelter</span>
</div>
<div className="my-space-xs">
<span className="font-headline-lg text-headline-lg text-primary font-extrabold tracking-tight">{props.n.motels}</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Regionalni prolazni & hodočasnički</p>
</div>
<div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-surface-tint rounded-full w-1/2"></div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col justify-between group hover:shadow-xl transition-all">
<div className="flex items-center justify-between text-outline">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant">Domaćinstva & Apartmani</span>
<span className="material-symbols-outlined text-[20px] text-secondary">cottage</span>
</div>
<div className="my-space-xs">
<span className="font-headline-lg text-headline-lg text-secondary font-extrabold tracking-tight">{props.n.private}</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Ruralni turizam i privatni najam</p>
</div>
<div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-secondary rounded-full w-11/12"></div>
</div>
</div>
</div>
</section></>
  );
}

export function FacFilter(props: any) {
  return (
<><section className="max-w-7xl mx-auto px-gutter w-full mt-space-xl">
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
{props.form}
<div className="flex items-center justify-between text-outline text-body-sm font-body-sm pt-space-xs">
<div className="flex items-center gap-space-xs">
<span>Prikazano: <strong className="text-primary font-bold">{props.shown}</strong> od <strong>{props.total}</strong> rješenja</span>
<span className="text-outline">|</span>
<span className="text-secondary flex items-center gap-1 font-medium"><span className="w-2 h-2 rounded-full bg-secondary inline-block"></span> Podaci ažurirani: {props.updated}</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
<span>Baza usklađena sa Zakonom o ugostiteljskoj djelatnosti HNŽ (SN br. 2/18)</span>
</div>
</div>
</div>
</section></>
  );
}

export function FacTable(props: any) {
  return (
<><section className="max-w-7xl mx-auto px-gutter w-full mt-space-md">
<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left font-body-regular text-body-regular" id="registerTable">
<thead>
<tr className="bg-surface-container-low text-on-surface-variant font-label-kicker text-label-kicker uppercase">
<th className="py-3.5 px-space-md">Naziv Objekta & Reg. Broj</th>
<th className="py-3.5 px-space-md">Jedinica / Adresa</th>
<th className="py-3.5 px-space-md">Kategorija & Vrsta</th>
<th className="py-3.5 px-space-md">Kapacitet</th>
<th className="py-3.5 px-space-md">Službeno Rješenje</th>
<th className="py-3.5 px-space-md">Status & Oznaka</th>
<th className="py-3.5 px-space-md text-right">Službene Radnje</th>
</tr>
</thead>
{props.rows}
</table>
</div>

</div>
</section></>
  );
}

export function FacGuide(props: any) {
  return (
<><section className="max-w-7xl mx-auto px-gutter w-full mt-space-xl mb-space-xl">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
<div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center gap-space-xs text-secondary font-label-badge text-label-badge uppercase mb-space-xs">
<span className="material-symbols-outlined text-[16px]">verified</span>
            Vodič za ugostitelje i investitore
          </div>
<h2 className="font-headline-md text-headline-md text-primary tracking-tight mb-space-sm">
            Postupak kategorizacije i Minimalno-tehnički uvjeti (MTU)
          </h2>
<p className="font-body-regular text-body-regular text-on-surface-variant mb-space-md">
            Svi ugostiteljski objekti za smještaj u HNŽ/HNK dužni su prije početka obavljanja djelatnosti pribaviti Rješenje o ispunjavanju MTU uvjeta i dodjeli odgovarajuće kategorije (zvjezdica). Rješenje ima rok važenja od 4 godine.
          </p>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-md">
<div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
<span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-[12px] flex items-center justify-center">1</span>
<strong className="text-primary font-title-md text-[14px]">Podnošenje Zahtjeva</strong>
<p className="text-outline font-body-sm text-[12px]">Ispunjeni službeni obrazac s dokazom o vlasništvu ili zakupu prostora.</p>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
<span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-[12px] flex items-center justify-center">2</span>
<strong className="text-primary font-title-md text-[14px]">Uviđaj Povjerenstva</strong>
<p className="text-outline font-body-sm text-[12px]">Neposredni inspekcijski pregled soba, sanitarija, sigurnosnih i eko mjera.</p>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1">
<span className="w-6 h-6 rounded-full bg-secondary text-on-secondary font-bold text-[12px] flex items-center justify-center">3</span>
<strong className="text-secondary font-title-md text-[14px]">Izdavanje Rješenja</strong>
<p className="text-outline font-body-sm text-[12px]">Upis u Županijski registar i preuzimanje službene metalne ploče sa zvjezdicama.</p>
</div>
</div>
</div>
<div className="pt-space-md flex flex-wrap items-center gap-space-md bg-surface-container-low/50 p-space-md rounded-lg">
<div className="flex items-center gap-space-xs text-primary font-semibold text-body-sm">
<span className="material-symbols-outlined text-secondary">payments</span>
<span>Upravna pristojba: 150 KM - 500 KM (ovisno o kapacitetu)</span>
</div>
<div className="flex items-center gap-space-xs text-outline font-body-sm text-[12px]">
<span className="material-symbols-outlined text-[16px]">schedule</span>
<span>Rok za rješavanje: max. 30 radnih dana od uredne prijave</span>
</div>
</div>
</div>
<div className="lg:col-span-5 flex flex-col gap-space-md">
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm group hover:shadow-md transition-all">
<div className="flex items-start justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded bg-primary-container text-on-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[24px]">description</span>
</div>
<div className="flex flex-col">
<span className="font-title-md text-title-md text-primary">Pravilnik o kategorizaciji</span>
<span className="font-body-sm text-body-sm text-outline">Standardi za vrste i kategorije (PDF • 2.4 MB)</span>
</div>
</div>
<button className="p-2 rounded bg-surface-container hover:bg-surface-container-high text-primary transition-colors">
<span className="material-symbols-outlined text-[20px]">download</span>
</button>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
            Uredba o propisanim minimalnim uvjetima za vrste objekata: hoteli, baštinski hoteli, moteli, kampovi i seoska domaćinstva.
          </p>
</div>
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm group hover:shadow-md transition-all">
<div className="flex items-start justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded bg-secondary text-on-secondary flex items-center justify-center">
<span className="material-symbols-outlined text-[24px]">assignment_add</span>
</div>
<div className="flex flex-col">
<span className="font-title-md text-title-md text-primary">Obrazac Zahtjeva za Rekategorizaciju</span>
<span className="font-body-sm text-body-sm text-outline">Službena prijava Povjerenstvu (DOCX • 340 KB)</span>
</div>
</div>
<button className="p-2 rounded bg-surface-container hover:bg-surface-container-high text-primary transition-colors">
<span className="material-symbols-outlined text-[20px]">download</span>
</button>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
            Standardizirani upitnik s popisom obvezne tehničke dokumentacije, atesta zaštite od požara i sanitarnih uvjeta.
          </p>
</div>
<div className="bg-emerald-light rounded-xl p-space-md shadow-sm flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[28px] text-secondary">eco</span>
<div className="flex flex-col">
<span className="font-title-md text-title-md text-secondary font-bold">Eko-smještaj HNŽ Program</span>
<span className="font-body-sm text-body-sm text-on-secondary-fixed-variant">Subvencije za solarnu energiju i selektivni otpad</span>
</div>
</div>
<button className="px-space-md py-2 rounded bg-secondary text-on-secondary font-button text-button hover:bg-institutional-navy-deep transition-colors whitespace-nowrap">
            Saznajte više
          </button>
</div>
</div>
</div>
</section></>
  );
}
