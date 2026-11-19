/* eslint-disable */
// Generisano iz Stitch HTML-a: ../../../stitch/port.py (ne uređivati ručno)

export function PermitsCrumb(props: any) {
  return (
<><section className="w-full bg-surface-container-low py-space-sm px-margin">
<div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-space-sm text-body-sm font-body-sm">
<nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-on-surface-variant flex-wrap">
<a className="hover:text-primary transition-colors flex items-center gap-1" href="#" style={{backgroundColor: '#00abeb', color: '#ffffff', fontFamily: "'Roboto Condensed', sans-serif", fontWeight: '700'}}>
<span className="material-symbols-outlined text-[16px]">home</span>
<span>Naslovna</span>
</a>
<span className="text-outline-variant">/</span>
<a className="hover:text-primary transition-colors" href="#">Službeni registri</a>
<span className="text-outline-variant">/</span>
<span className="text-primary font-bold">Registar okolišnih dozvola</span>
</nav>
<div className="flex items-center gap-space-sm text-outline font-label-badge text-label-badge uppercase tracking-wider">
<span className="inline-flex items-center gap-1 text-secondary">
<span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          Ažurirano: {props.updated}
        </span>
<span className="hidden md:inline text-outline-variant">|</span>
<span className="hidden md:inline">Zakon o zaštiti okoliša HNŽ (SN HNŽ 6/12, 4/21)</span>
</div>
</div>
</section></>
  );
}

export function PermitsHero(props: any) {
  return (
<><section className="w-full bg-surface px-margin py-space-xl">
<div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
<div className="lg:col-span-8 flex flex-col gap-space-sm">
<div className="flex items-center gap-space-xs">
<span className="bg-primary-container text-on-primary font-label-badge text-label-badge uppercase px-space-sm py-0.5 rounded-lg">
              Sektor za zaštitu okoliša i prirode
            </span>
<span className="bg-surface-container-highest text-on-surface-variant font-label-badge text-label-badge uppercase px-space-sm py-0.5 rounded-lg">
              Službena evidencija HNŽ / HNK
            </span>
</div>
<h1 className="font-headline-lg text-headline-lg text-text-heading tracking-tight">
            Službeni Registar Izdatih Okolišnih Dozvola
          </h1>
<p className="font-body-lead text-body-lead text-text-body max-w-3xl">
            Središnja kantonalna baza pogona, postrojenja i infrastrukturnih zahvata koji podliježu obvezi posjedovanja okolišne dozvole sukladno Pravilniku o pogonima za koje je obvezna procjena utjecaja na okoliš. Uvid je otvoren građanima, inspekcijskim tijelima i operaterima.
          </p>
</div>
<div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-label-kicker text-label-kicker text-outline uppercase tracking-wider">Teritorijalni obuhvat</span>
<span className="material-symbols-outlined text-secondary text-[22px]">public</span>
</div>
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-md text-headline-md text-primary font-bold">9</span>
<span className="font-title-md text-title-md text-text-heading">Jedinica lokalne samouprave</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
            Neretvanska dolina, Jadranski sliv i hercegovački krški plato pod direktnim kontinuiranim monitoringom emisija.
          </p>
<div className="h-2 w-full bg-surface-container rounded-full overflow-hidden flex">
<div className="bg-primary h-full" style={{ width: props.pct.Industrija }} title="Industrija (48%)"></div>
<div className="bg-secondary h-full" style={{ width: props.pct.Energetika }} title="Energetika (24%)"></div>
<div className="bg-surface-tint h-full" style={{ width: props.pct.Otpad }} title="Otpad (18%)"></div>
<div className="bg-tertiary-fixed-dim h-full" style={{ width: props.pct.Turizam }} title="Turizam (10%)"></div>
</div>
<div className="flex justify-between text-[10px] text-outline font-label-badge uppercase">
<span>Industrija</span>
<span>Energetika</span>
<span>Otpad</span>
<span>Turizam</span>
</div>
</div>
</div>
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-sm">
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-outline">
<span className="font-label-kicker text-label-kicker uppercase">Aktivne</span>
<span className="material-symbols-outlined text-[18px] text-secondary">verified</span>
</div>
<div className="mt-space-sm">
<span className="font-headline-lg text-headline-lg font-bold text-primary">{props.n.total}</span>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Ukupno dozvola</p>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-outline">
<span className="font-label-kicker text-label-kicker uppercase">Industrija</span>
<span className="material-symbols-outlined text-[18px] text-primary-container">factory</span>
</div>
<div className="mt-space-sm">
<span className="font-headline-lg text-headline-lg font-bold text-text-heading">{props.n.Industrija}</span>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Proizvodni pogoni</p>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-outline">
<span className="font-label-kicker text-label-kicker uppercase">Energetika</span>
<span className="material-symbols-outlined text-[18px] text-secondary">bolt</span>
</div>
<div className="mt-space-sm">
<span className="font-headline-lg text-headline-lg font-bold text-text-heading">{props.n.Energetika}</span>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Hidro & termo objekti</p>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-outline">
<span className="font-label-kicker text-label-kicker uppercase">Otpad</span>
<span className="material-symbols-outlined text-[18px] text-outline">recycling</span>
</div>
<div className="mt-space-sm">
<span className="font-headline-lg text-headline-lg font-bold text-text-heading">{props.n.Otpad}</span>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Obrada i sanacija</p>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-outline">
<span className="font-label-kicker text-label-kicker uppercase">Turizam</span>
<span className="material-symbols-outlined text-[18px] text-surface-tint">holiday_village</span>
</div>
<div className="mt-space-sm">
<span className="font-headline-lg text-headline-lg font-bold text-text-heading">{props.n.Turizam}</span>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Resorti & marina</p>
</div>
</div>
<div className="bg-amber-light p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between text-tertiary-container">
<span className="font-label-kicker text-label-kicker uppercase font-bold">U Reviziji</span>
<span className="material-symbols-outlined text-[18px] text-tertiary">history_toggle_off</span>
</div>
<div className="mt-space-sm">
<span className="font-headline-lg text-headline-lg font-bold text-tertiary">{props.n.renewal}</span>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Postupci obnove</p>
</div>
</div>
</div>
</div>
</section></>
  );
}

export function PermitsFilter(props: any) {
  return (
<><section className="w-full bg-surface-container-low py-space-lg px-margin">
<div className="max-w-7xl mx-auto flex flex-col gap-space-md">
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between flex-wrap gap-space-xs">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">tune</span>
<h2 className="font-title-md text-title-md text-text-heading">Napredna tražilica i kriteriji filtriranja</h2>
</div>
<span className="font-body-sm text-body-sm text-outline">Pretraga po svim rješenjima u evidenciji</span>
</div>
{props.form}
{props.pills}
</div>
</div>
</section></>
  );
}

export function PermitsTable(props: any) {
  return (
<><section className="w-full bg-surface py-space-xl px-margin">
<div className="max-w-7xl mx-auto flex flex-col gap-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
<div>
<h2 className="font-headline-sm text-headline-sm text-text-heading">Izdane okolišne dozvole i monitoring obveze</h2>
<p className="font-body-sm text-body-sm text-outline">Prikazano {props.shown} od ukupno {props.total} rješenja u evidenciji</p>
</div>
<div className="flex items-center gap-space-xs">
<span className="font-body-sm text-body-sm text-outline">Prikaz:</span>
<button className="p-1.5 bg-surface-container-highest text-primary rounded-lg" title="Tablični prikaz">
<span className="material-symbols-outlined text-[18px]">table_rows</span>
</button>

</div>
</div>
<div className="w-full overflow-x-auto bg-surface-container-lowest rounded-xl shadow-sm">
<table className="w-full text-left border-collapse min-w-[1040px]" id="permitsTable">
<thead>
<tr className="bg-surface-container-low text-on-surface font-label-kicker text-label-kicker uppercase tracking-wider">
<th className="py-3.5 px-4">UPI Broj & Datum</th>
<th className="py-3.5 px-4">Operater & Postrojenje</th>
<th className="py-3.5 px-4">Lokacija (Općina)</th>
<th className="py-3.5 px-4">Djelatnost & Prilog</th>
<th className="py-3.5 px-4">Rok Važenja</th>
<th className="py-3.5 px-4">Praćeni Parametri</th>
<th className="py-3.5 px-4 text-center">Status</th>
<th className="py-3.5 px-4 text-right">Spisi & Radnje</th>
</tr>
</thead>
{props.rows}
</table>
</div>
<div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-sm text-body-sm text-on-surface-variant">
<span>Prikaz zapisa 1 do {props.shown} od {props.total} ukupno</span>

</div>
</div>
</section></>
  );
}

export function PermitsRights(props: any) {
  return (
<><section className="w-full bg-surface-container-low py-space-xl px-margin">
<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
<div className="lg:col-span-7 flex flex-col gap-space-sm">
<div className="flex items-center gap-space-xs text-secondary font-label-badge text-label-badge uppercase tracking-wider">
<span className="material-symbols-outlined text-[18px]">gavel</span>
<span>Prava građana i transparentnost postupka</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-text-heading">
          Javni Uvid, Aarhuska Konvencija i Sudjelovanje Javnosti
        </h2>
<p className="font-body-regular text-body-regular text-text-body">
          Sukladno odredbama Zakona o zaštiti okoliša i Konvencije o pristupu informacijama, sudjelovanju javnosti u odlučivanju i pristupu pravosuđu u pitanjima okoliša (Aarhuska konvencija), svaki građanin i nevladina organizacija imaju pravo na slobodan uvid u prateće studije o utjecaju na okoliš, elaborate i monitoring izvještaje.
        </p>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-xs">
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-1">
<span className="font-title-md text-body-regular font-bold text-primary">Zahtjev za uvid u spis</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Elektronički zahtjev po Zakonu o slobodi pristupa informacijama (rok rješavanja: 15 dana).</p>
<a className="mt-2 text-primary font-button text-body-sm flex items-center gap-1 hover:text-secondary" href="#" style={{backgroundColor: '#00abeb', color: '#ffffff', fontFamily: "'Roboto Condensed', sans-serif", fontWeight: '700'}}>
              Podnesi zahtjev online <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-1">
<span className="font-title-md text-body-regular font-bold text-error">Eko-prijava nepravilnosti</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Direktna prijava kršenja propisanih mjera Kantonalnoj inspekciji za zaštitu okoliša HNŽ.</p>
<a className="mt-2 text-error font-button text-body-sm flex items-center gap-1 hover:underline" href="#" style={{backgroundColor: '#00abeb', color: '#ffffff', fontFamily: "'Roboto Condensed', sans-serif", fontWeight: '700'}}>
              Prijavi incident 24/7 <span className="material-symbols-outlined text-[16px]">priority_high</span>
</a>
</div>
</div>
</div>
<div className="lg:col-span-5 bg-primary text-on-primary rounded-xl p-space-lg shadow-xl flex flex-col justify-between gap-space-md relative overflow-hidden">
<div className="flex flex-col gap-space-xs z-10">
<span className="font-label-kicker text-label-kicker text-secondary-fixed uppercase">Interaktivni GIS Monitoring</span>
<h3 className="font-headline-sm text-headline-sm text-on-primary">
            Sloj okolišnih dozvola u Prostornom informacijskom sustavu HNŽ
          </h3>
<p className="font-body-sm text-body-sm text-on-primary-fixed-dim">
            Pregledajte točne geografske poligone postrojenja, zaštitne zone izvorišta i slivno područje rijeke Neretve u službenom kantonalnom GIS pregledniku.
          </p>
</div>
<div className="relative w-full h-44 rounded-lg overflow-hidden z-10 shadow-inner">
<div className="w-full h-full bg-cover bg-center" data-location="Neretva River, Mostar, Bosnia and Herzegovina" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuABiXJApE3mmOQyqSOl7OusfCi6RHxLUowGYxR3RfFhqE_B49Ls6Cc8zsqn8gFDClwPMW1D22cEk-FTCXiFdha0MEV3qmQxIeMTLYip_9RJkUzIhwEJvzBKHetDvHkuYH7yBby-7EXgQwSPJERVUCyFMf1k8hrQUOPjOegg_xWSTsb-NtwXDWB38iHjq7z0A-jcKmbHCMR4dDkMqPqWybc_CfbUas2RcmRPgqTG4k8')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-institutional-navy-deep/80 via-transparent to-transparent flex items-end p-space-sm">
<span className="text-[11px] font-label-badge text-on-primary uppercase bg-primary/80 px-2 py-0.5 rounded">
              WGS84 • HNŽ GIS geoportal v3.2
            </span>
</div>
</div>
<a className="z-10 bg-secondary hover:bg-on-secondary-container text-on-secondary font-button text-button py-2.5 px-space-md rounded-lg flex items-center justify-center gap-space-xs transition-colors" href="#" style={{backgroundColor: '#00abeb', color: '#ffffff', fontFamily: "'Roboto Condensed', sans-serif", fontWeight: '700'}}>
<span className="material-symbols-outlined text-[18px]">map</span>
<span>Pokreni GIS Kartografski Preglednik</span>
</a>
</div>
</div>
</section></>
  );
}

export function PermitsOpenData(props: any) {
  return (
<><section className="w-full bg-surface py-space-xl px-margin">
<div className="max-w-7xl mx-auto flex flex-col gap-space-md">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
<div>
<span className="font-label-kicker text-label-kicker text-outline uppercase tracking-wider">Otvorena uprava & interoperabilnost</span>
<h2 className="font-headline-sm text-headline-sm text-text-heading mt-0.5">Izvoz otvorenih podataka i programski pristup (API)</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Svi podaci iz registra dostupni su pod Creative Commons licencom (CC BY 4.0) za istraživače, novinare i programske integracije.</p>
</div>
<div className="flex items-center gap-space-xs text-body-sm text-secondary font-semibold">
<span className="material-symbols-outlined text-[18px]">verified_user</span>
          Otvoreni podaci
        </div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
<a className="bg-surface-container-lowest hover:bg-surface-container p-space-md rounded-xl shadow-sm flex items-center justify-between gap-space-sm transition-all group" href="/registri/okolisne-dozvole/izvoz?format=csv"><div className="flex items-center gap-space-sm"><div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-[22px]">table_chart</span></div><div className="flex flex-col"><span className="font-title-md text-body-regular font-bold text-text-heading">Registar za Excel</span><span className="text-[12px] text-outline">CSV, otvara se u Excelu</span></div></div><span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">download</span></a>
<a className="bg-surface-container-lowest hover:bg-surface-container p-space-md rounded-xl shadow-sm flex items-center justify-between gap-space-sm transition-all group" href="/registri/okolisne-dozvole/izvoz?format=csv">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
<span className="material-symbols-outlined text-[22px]">data_table</span>
</div>
<div className="flex flex-col">
<span className="font-title-md text-body-regular font-bold text-text-heading">Dataset CSV</span>
<span className="text-[12px] text-outline">Strojno čitljivo, UTF-8</span>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">download</span>
</a>
<a className="bg-surface-container-lowest hover:bg-surface-container p-space-md rounded-xl shadow-sm flex items-center justify-between gap-space-sm transition-all group" href="#">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
<span className="material-symbols-outlined text-[22px]">layers</span>
</div>
<div className="flex flex-col">
<span className="font-title-md text-body-regular font-bold text-text-heading">WFS / WMS Sloj</span>
<span className="text-[12px] text-outline">OGC geoprostorni servis · Faza 2</span>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors text-[20px]">open_in_new</span>
</a>
<a className="bg-surface-container-lowest hover:bg-surface-container p-space-md rounded-xl shadow-sm flex items-center justify-between gap-space-sm transition-all group" href="/registri/okolisne-dozvole/izvoz?format=json">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-surface-tint group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
<span className="material-symbols-outlined text-[22px]">api</span>
</div>
<div className="flex flex-col">
<span className="font-title-md text-body-regular font-bold text-text-heading">REST API JSON</span>
<span className="text-[12px] text-outline">v1/okolisne-dozvole</span>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">code</span>
</a>
</div>
</div>
</section></>
  );
}
