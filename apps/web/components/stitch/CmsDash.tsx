/* eslint-disable */
// Automatski generisano iz Stitch HTML-a (html2jsx.py)

export function CmsDashHeader() {
  return (
<header className="fixed top-0 left-72 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg" style={{background: 'linear-gradient(90deg, rgb(35, 70, 150) 0%, rgb(30, 37, 112) 100%)', color: 'rgb(255, 255, 255)'}}><div className="flex items-center gap-space-md"><div className="relative flex items-center w-80"><span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span><input className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low border border-slate-border text-body-sm text-text-heading placeholder:text-outline focus:outline-none focus:border-primary-container" placeholder="Pretraga registra, UPI predmeta, operatera..." type="text" style={{backgroundColor: 'rgba(255, 255, 255, 0.12)', color: 'rgb(255, 255, 255)', borderColor: 'rgba(255, 255, 255, 0.2)'}} /></div><div className="flex items-center gap-space-xs px-2.5 py-1 rounded-lg bg-emerald-light border border-secondary-container/60"><span className="w-2 h-2 rounded-full bg-secondary"></span><span className="font-label-badge text-label-badge uppercase tracking-wider text-on-secondary-container">PRODUKCIJA v2.4.1</span></div></div><div className="flex items-center gap-space-md"><a className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface text-body-sm font-button" data-path="sigurnost-revizija" href="#"><span className="material-symbols-outlined text-[18px]">history_edu</span><span>Audit Log</span></a><button className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"><span className="material-symbols-outlined text-[20px]">notifications</span><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest"></span></button><div className="h-6 w-[1px] bg-slate-border"></div><div className="flex items-center gap-space-sm pl-1"><div className="flex flex-col text-right"><span className="font-button text-button font-bold text-text-heading leading-tight">mr. sc. Asmir K.</span><span className="font-body-sm text-[12px] text-outline leading-tight">Glavni Administrator · Pravni Sektor</span></div><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header>
  );
}

export function CmsDashS1() {
  return (
<><div className="flex flex-col w-full">
<div className="w-full px-space-lg py-space-md space-y-space-lg">
<div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
<div className="flex flex-col min-w-0">
<nav className="flex items-center gap-space-xs text-on-surface-variant font-label-kicker text-label-kicker uppercase tracking-wider mb-1">
<span className="text-primary-container font-semibold">MTTO Sustav za upravljanje (CMS)</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-on-surface font-bold">Kontrolna ploča & Operativni pregled</span>
</nav>
<div className="flex items-center gap-space-sm flex-wrap">
<h1 className="font-headline-md text-headline-md text-institutional-navy-deep tracking-tight" style={{fontFamily: '"Roboto Flex", sans-serif', fontWeight: '700', color: 'rgb(30, 37, 112)'}}>Konzola Glavnog Administratora</h1>
<span className="px-space-xs py-0.5 rounded-lg bg-emerald-light text-secondary font-label-badge text-label-badge uppercase tracking-wider">Geoportal HNŽ Sinkroniziran</span>
<span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-[15px] text-secondary">update</span>
            Danas, 10:54 · Server Mostar-Centar
          </span>
</div>
</div>
<div className="flex items-center gap-space-sm flex-wrap shrink-0">
<button className="flex items-center gap-space-xs px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-variant text-institutional-navy-deep font-button text-button transition-colors" id="geoSyncBtn">
<span className="material-symbols-outlined text-[18px] text-primary-container">sync</span>
<span>Sinkroniziraj Geoportal</span>
</button>
<div className="relative">
<button className="flex items-center gap-space-xs px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-heading font-button text-button transition-colors" id="exportBtn">
<span className="material-symbols-outlined text-[18px]">ios_share</span>
<span>Izvoz izvješća</span>
<span className="material-symbols-outlined text-[16px]">expand_more</span>
</button>
<div className="hidden absolute right-0 mt-1 w-52 bg-surface-container-lowest rounded-xl shadow-md py-1 z-30" id="exportMenu">
<a className="flex items-center gap-2 px-3 py-2 font-body-sm text-body-sm text-text-heading hover:bg-surface-container-low" href="#">
<span className="material-symbols-outlined text-error text-[18px]">picture_as_pdf</span>
              Zbirni Dnevni Izveštaj (PDF)
            </a>
<a className="flex items-center gap-2 px-3 py-2 font-body-sm text-body-sm text-text-heading hover:bg-surface-container-low" href="#">
<span className="material-symbols-outlined text-secondary text-[18px]">table_view</span>
              Baza Registara (XLSX)
            </a>
<a className="flex items-center gap-2 px-3 py-2 font-body-sm text-body-sm text-text-heading hover:bg-surface-container-low" href="#">
<span className="material-symbols-outlined text-primary-container text-[18px]">database</span>
              GeoJSON Slojevi Okoliša
            </a>
</div>
</div>
<div className="relative">
<button className="flex items-center gap-space-xs px-4 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-institutional-navy-deep font-button text-button shadow-sm transition-all duration-150" id="newItemBtn">
<span className="material-symbols-outlined text-[20px]">add_circle</span>
<span>Novi unos u registar</span>
<span className="material-symbols-outlined text-[16px]">expand_more</span>
</button>
<div className="hidden absolute right-0 mt-1 w-64 bg-surface-container-lowest rounded-xl shadow-md py-1.5 z-30" id="newItemMenu">
<div className="px-3 py-1 font-label-kicker text-label-kicker uppercase text-on-surface-variant">Odaberite protokol</div>
<a className="flex items-center gap-2.5 px-3 py-2 font-body-sm text-body-sm text-text-heading hover:bg-surface-container-low" href="#">
<span className="material-symbols-outlined text-secondary text-[18px]">nature_people</span>
              Okolišna dozvola (UPI)
            </a>
<a className="flex items-center gap-2.5 px-3 py-2 font-body-sm text-body-sm text-text-heading hover:bg-surface-container-low" href="#">
<span className="material-symbols-outlined text-primary-container text-[18px]">recycling</span>
              Operater otpada (R/D licenca)
            </a>
<a className="flex items-center gap-2.5 px-3 py-2 font-body-sm text-body-sm text-text-heading hover:bg-surface-container-low" href="#">
<span className="material-symbols-outlined text-on-tertiary-container text-[18px]">hotel</span>
              MTU rješenje & kategorizacija
            </a>
<a className="flex items-center gap-2.5 px-3 py-2 font-body-sm text-body-sm text-text-heading hover:bg-surface-container-low" href="#">
<span className="material-symbols-outlined text-primary-container text-[18px]">badge</span>
              Licencirani turistički vodič
            </a>
<a className="flex items-center gap-2.5 px-3 py-2 font-body-sm text-body-sm text-text-heading hover:bg-surface-container-low" href="#">
<span className="material-symbols-outlined text-text-body text-[18px]">gavel</span>
              Propis / Objava u Glasniku
            </a>
</div>
</div>
</div>
</div>
<div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-light text-on-tertiary-fixed shadow-sm">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-on-tertiary-container text-[22px]">warning</span>
<span className="font-body-regular text-body-regular font-semibold">Pozornost resora zaštite okoliša:</span>
<span className="font-body-regular text-body-regular text-text-body">3 industrijska postrojenja imaju redovni istek okolišne dozvole unutar 60 dana. Potreban inspekcijski nalog.</span>
</div>
<button className="font-button text-button font-bold text-on-tertiary-container hover:text-tertiary-container flex items-center gap-1">
        Pregledaj isteke <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
<section className="space-y-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="font-label-kicker text-label-kicker uppercase tracking-widest text-on-surface-variant">Službeni Registri MTTO</span>
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
<span className="font-body-sm text-body-sm text-outline">Stanje baze: 26. veljače 2026.</span>
</div>
<span className="font-label-badge text-label-badge text-outline uppercase tracking-wider">Ažurirano svakih 5 min</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-space-md">
<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border-t-2 border-[#13693f]">
<div>
<div className="flex items-center justify-between mb-space-sm">
<span className="w-9 h-9 rounded-lg flex items-center justify-center text-[#13693f]" style={{backgroundColor: '#eaf7f0'}}>
<span className="material-symbols-outlined text-[22px]">eco</span>
</span>
<span className="px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-wider uppercase" style={{backgroundColor: '#eaf7f0', color: '#13693f'}}>Registar A-1</span>
</div>
<span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase tracking-wider block">Okolišne dozvole</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="text-[38px] font-bold text-[#1e2570] leading-none" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>142</span>
<span className="font-body-sm text-body-sm font-semibold text-[#13693f]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>+4 ovaj mjesec</span>
</div>
</div>
<div className="mt-space-md pt-space-xs bg-surface-container-low p-2 rounded-lg space-y-1">
<div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
<span>U redovnoj obnovi:</span>
<span className="font-bold text-[#1e2570]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>9 postrojenja</span>
</div>
<div className="flex justify-between font-body-sm text-body-sm text-error">
<span>Hitna revizija:</span>
<span className="font-bold" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>3 predmeta</span>
</div>
</div>
</div>
<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border-t-2 border-[#00abeb]">
<div>
<div className="flex items-center justify-between mb-space-sm">
<span className="w-9 h-9 rounded-lg flex items-center justify-center text-[#0077a8]" style={{backgroundColor: '#e0f7fe'}}>
<span className="material-symbols-outlined text-[22px]">delete_sweep</span>
</span>
<span className="px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-wider uppercase" style={{backgroundColor: '#e0f7fe', color: '#0077a8'}}>Katalog HNŽ</span>
</div>
<span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase tracking-wider block">Operateri otpada</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="text-[38px] font-bold text-[#1e2570] leading-none" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>54</span>
<span className="font-body-sm text-body-sm text-text-body font-normal">Aktivne licence</span>
</div>
</div>
<div className="mt-space-md pt-space-xs bg-surface-container-low p-2 rounded-lg space-y-1">
<div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
<span>Neopasni otpad:</span>
<span className="font-bold text-[#1e2570]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>32</span>
</div>
<div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
<span>Opasni / Toksični:</span>
<span className="font-bold text-[#b45309]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>14</span>
</div>
<div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
<span>Sortirnice / Deponije:</span>
<span className="font-bold text-[#1e2570]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>8</span>
</div>
</div>
</div>
<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border-t-2 border-[#fadc12]">
<div>
<div className="flex items-center justify-between mb-space-sm">
<span className="w-9 h-9 rounded-lg flex items-center justify-center text-[#8d6f00]" style={{backgroundColor: '#fffde6'}}>
<span className="material-symbols-outlined text-[22px]">apartment</span>
</span>
<span className="px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-wider uppercase" style={{backgroundColor: '#fffde6', color: '#8d6f00'}}>MTU Standard</span>
</div>
<span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase tracking-wider block">Ugostiteljski objekti</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="text-[38px] font-bold text-[#1e2570] leading-none" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>1.280</span>
<span className="font-body-sm text-body-sm text-outline">Kategorizirano</span>
</div>
</div>
<div className="mt-space-md pt-space-xs bg-surface-container-low p-2 rounded-lg space-y-1">
<div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
<span>Ukupno ležajeva:</span>
<span className="font-bold text-[#1e2570]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>18.450</span>
</div>
<div className="flex justify-between font-body-sm text-body-sm text-[#8d6f00]">
<span>Čeka očevid / komisiju:</span>
<span className="font-bold" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>14 zahtjeva</span>
</div>
</div>
</div>
<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border-t-2 border-[#fadc12]">
<div>
<div className="flex items-center justify-between mb-space-sm">
<span className="w-9 h-9 rounded-lg flex items-center justify-center text-[#8d6f00]" style={{backgroundColor: '#fffde6'}}>
<span className="material-symbols-outlined text-[22px]">badge</span>
</span>
<span className="px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-wider uppercase" style={{backgroundColor: '#fffde6', color: '#8d6f00'}}>Reg. Vodiča</span>
</div>
<span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase tracking-wider block">Turistički vodiči</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="text-[38px] font-bold text-[#1e2570] leading-none" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>314</span>
<span className="font-body-sm text-body-sm font-semibold text-[#13693f]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>Aktivan status</span>
</div>
</div>
<div className="mt-space-md pt-space-xs bg-surface-container-low p-2 rounded-lg space-y-1">
<div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
<span>Ispitni rok 2026/I:</span>
<span className="font-bold text-[#1e2570]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>38 prijava</span>
</div>
<div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
<span>Strani jezici:</span>
<span className="font-bold text-[#1e2570]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>100% B2/C1</span>
</div>
</div>
</div>
<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border-t-2 border-[#234696]">
<div>
<div className="flex items-center justify-between mb-space-sm">
<span className="w-9 h-9 rounded-lg flex items-center justify-center text-[#234696]" style={{backgroundColor: '#e5eeff'}}>
<span className="material-symbols-outlined text-[22px]">folder_special</span>
</span>
<span className="px-2 py-0.5 rounded-lg text-[11px] font-bold tracking-wider uppercase" style={{backgroundColor: '#e5eeff', color: '#234696'}}>Upravni postupak</span>
</div>
<span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase tracking-wider block">Aktivni UPI Predmeti</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="text-[38px] font-bold text-[#1e2570] leading-none" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>89</span>
<span className="font-body-sm text-body-sm font-medium text-[#13693f]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>-12% zaostaci</span>
</div>
</div>
<div className="mt-space-md pt-space-xs bg-surface-container-low p-2 rounded-lg space-y-1">
<div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
<span>Prosječno rješavanje:</span>
<span className="font-bold text-[#13693f]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>14.2 dana</span>
</div>
<div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
<span>Zakonski rok:</span>
<span className="font-bold text-[#1e2570]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>30 dana max</span>
</div>
</div>
</div></div>
</section>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
<div className="lg:col-span-8 space-y-space-md">
<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
<div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-low">
<div>
<div className="flex items-center gap-space-xs">
<span className="w-2.5 h-2.5 rounded-full bg-error"></span>
<h2 className="font-title-md text-title-md text-institutional-navy-deep" style={{fontFamily: '"Roboto Flex", sans-serif', fontWeight: '700', color: 'rgb(30, 37, 112)'}}>Hitni radni nalozi & Odobrenja u tijeku</h2>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Predmeti koji zahtijevaju potpis, formiranje povjerenstva ili inspekcijski nalog ministra</p>
</div>
<div className="flex items-center gap-space-xs">
<div className="relative">
<input className="h-9 pl-8 pr-3 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-text-heading placeholder:text-outline focus:outline-none" placeholder="Filtriraj po broju UPI..." type="text" />
<span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">filter_list</span>
</div>
<span className="px-2.5 py-1 rounded-lg bg-primary-container text-on-primary font-label-badge text-label-badge">5 prioritetnih</span>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="bg-surface-container text-institutional-navy-deep font-label-kicker text-label-kicker uppercase tracking-wider">
<th className="py-3 px-space-md">Predmet / Broj spisa</th>
<th className="py-3 px-space-md">Podnositelj & Opis</th>
<th className="py-3 px-space-md">Resorni sektor</th>
<th className="py-3 px-space-md">Status & Faza</th>
<th className="py-3 px-space-md text-right">Radnje</th>
</tr>
</thead>
<tbody className="font-body-regular text-body-regular divide-y divide-surface-container-low">
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-md align-top">
<span className="font-bold text-[#1e2570] block text-[15px]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>UPI/05-20-412/23</span>
<span className="text-[12px] text-outline block" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>Podneseno: 18.02.2026.</span>
</td>
<td className="py-3.5 px-space-md align-top max-w-xs">
<span className="text-[14px] text-text-heading font-semibold block">Aluminij Industrija d.o.o.</span>
<span className="text-[13px] text-on-surface-variant line-clamp-2 mt-0.5" style={{fontFamily: "'Roboto', sans-serif"}}>Zahtjev za verifikaciju FTP filtera i produženje okolišne dozvole za ljevaonički pogon.</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider block w-max" style={{backgroundColor: '#eaf7f0', color: '#13693f', border: '1px solid #b9e8cd'}}>Sektor zaštite okoliša</span>
<span className="text-[13px] text-on-surface-variant block mt-1">Ref: mr. Emir Kapić</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider block w-max" style={{backgroundColor: '#fffde6', color: '#8d6f00', border: '1px solid #fceea7'}}>Čeka potpis pomoćnika</span>
<span className="text-[12px] text-outline block mt-1" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>Rok ističe za 2 dana</span>
</td>
<td className="py-3.5 px-space-md align-top text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="p-1.5 rounded-lg text-white transition-colors" style={{backgroundColor: '#13693f'}} title="Potpiši i odobri rješenje">
<span className="material-symbols-outlined text-[18px]">verified</span>
</button>
<button className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-variant text-[#1e2570] transition-colors" title="Vrati na dopunu dokumentacije">
<span className="material-symbols-outlined text-[18px]">replay</span>
</button>
<button className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-variant text-[#1e2570] transition-colors" title="Otvori digitalni spis">
<span className="material-symbols-outlined text-[18px]">open_in_new</span>
</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-md align-top">
<span className="font-bold text-[#1e2570] block text-[15px]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>UPI/05-20-89/19</span>
<span className="text-[12px] text-outline block" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>Podneseno: 20.02.2026.</span>
</td>
<td className="py-3.5 px-space-md align-top max-w-xs">
<span className="text-[14px] text-text-heading font-semibold block">Eko-Sirovine d.o.o. Konjic</span>
<span className="text-[13px] text-on-surface-variant line-clamp-2 mt-0.5" style={{fontFamily: "'Roboto', sans-serif"}}>Godišnji izvještaj o tokovima otpadnog papira i sekundarnih metala za 2025. godinu.</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider block w-max" style={{backgroundColor: '#e0f7fe', color: '#0077a8', border: '1px solid #b3e9fc'}}>Upravljanje otpadom</span>
<span className="text-[13px] text-on-surface-variant block mt-1">Ref: Sanja Perić</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider block w-max" style={{backgroundColor: '#eaf7f0', color: '#13693f', border: '1px solid #b9e8cd'}}>Inspekcijski nalaz OK</span>
<span className="text-[12px] text-outline block mt-1" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>Spremno za arhivu</span>
</td>
<td className="py-3.5 px-space-md align-top text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="p-1.5 rounded-lg text-white transition-colors" style={{backgroundColor: '#13693f'}} title="Odobri i unesi u registar">
<span className="material-symbols-outlined text-[18px]">check</span>
</button>
<button className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-variant text-[#1e2570] transition-colors" title="Otvori digitalni spis">
<span className="material-symbols-outlined text-[18px]">open_in_new</span>
</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-md align-top">
<span className="font-bold text-[#1e2570] block text-[15px]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>ZAHTJEV-MTU-2026-88</span>
<span className="text-[12px] text-outline block" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>Podneseno: 22.02.2026.</span>
</td>
<td className="py-3.5 px-space-md align-top max-w-xs">
<span className="text-[14px] text-text-heading font-semibold block">Grand Hotel Neum d.o.o.</span>
<span className="text-[13px] text-on-surface-variant line-clamp-2 mt-0.5" style={{fontFamily: "'Roboto', sans-serif"}}>Rekategorizacija kongresnog bloka i novog wellness centra na 4★ Superior standard.</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider block w-max" style={{backgroundColor: '#fffde6', color: '#8d6f00', border: '1px solid #fceea7'}}>Sektor za turizam</span>
<span className="text-[13px] text-on-surface-variant block mt-1">Ref: Davor Vujica</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider block w-max" style={{backgroundColor: '#e5eeff', color: '#1e2570', border: '1px solid #c8d8fc'}}>Formirano povjerenstvo</span>
<span className="text-[12px] text-outline block mt-1" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>Uviđaj: 03.03.2026.</span>
</td>
<td className="py-3.5 px-space-md align-top text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="p-1.5 rounded-lg text-white transition-colors" style={{backgroundColor: '#234696'}} title="Zakaži uviđaj i izdaj nalog">
<span className="material-symbols-outlined text-[18px]">calendar_month</span>
</button>
<button className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-variant text-[#1e2570] transition-colors" title="Otvori digitalni spis">
<span className="material-symbols-outlined text-[18px]">open_in_new</span>
</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-md align-top">
<span className="font-bold text-[#1e2570] block text-[15px]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>VODIC-ISPIT-312</span>
<span className="text-[12px] text-outline block" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>Prijava: 23.02.2026.</span>
</td>
<td className="py-3.5 px-space-md align-top max-w-xs">
<span className="text-[14px] text-text-heading font-semibold block">Tarik Spahić (Mostar)</span>
<span className="text-[13px] text-on-surface-variant line-clamp-2 mt-0.5" style={{fontFamily: "'Roboto', sans-serif"}}>Prijava za polaganje stručnog ispita za vodiča. Jezici: Engleski i Talijanski jezik.</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider block w-max" style={{backgroundColor: '#fffde6', color: '#8d6f00', border: '1px solid #fceea7'}}>Sektor za turizam</span>
<span className="text-[13px] text-on-surface-variant block mt-1">Ref: Goran Marić</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider block w-max" style={{backgroundColor: '#fffde6', color: '#8d6f00', border: '1px solid #fceea7'}}>Provjera certifikata</span>
<span className="text-[12px] text-outline block mt-1" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>B2 TOEFL validiran</span>
</td>
<td className="py-3.5 px-space-md align-top text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="p-1.5 rounded-lg text-white transition-colors" style={{backgroundColor: '#13693f'}} title="Prihvati kandidaturu">
<span className="material-symbols-outlined text-[18px]">how_to_reg</span>
</button>
<button className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-variant text-[#1e2570] transition-colors" title="Otvori digitalni spis">
<span className="material-symbols-outlined text-[18px]">open_in_new</span>
</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-md align-top">
<span className="font-bold text-[#1e2570] block text-[15px]" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>JAVNI-UVID-04</span>
<span className="text-[12px] text-outline block" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>Ističe: 05.03.2026.</span>
</td>
<td className="py-3.5 px-space-md align-top max-w-xs">
<span className="text-[14px] text-text-heading font-semibold block">Plan upravljanja otpadom HNŽ</span>
<span className="text-[13px] text-on-surface-variant line-clamp-2 mt-0.5" style={{fontFamily: "'Roboto', sans-serif"}}>Nacrt Plana 2025-2035: pristigle 3 primjedbe građana (Grad Čapljina i Općina Jablanica).</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider block w-max" style={{backgroundColor: '#e5eeff', color: '#1e2570', border: '1px solid #c8d8fc'}}>Kabinet Ministra</span>
<span className="text-[13px] text-on-surface-variant block mt-1">Ref: mr. sc. Asmir K.</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider block w-max" style={{backgroundColor: '#e0f7fe', color: '#0077a8', border: '1px solid #b3e9fc'}}>3 primjedbe na stolu</span>
<span className="text-[12px] text-outline block mt-1" style={{fontFamily: "'Roboto Condensed', sans-serif"}}>Javna rasprava održana</span>
</td>
<td className="py-3.5 px-space-md align-top text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="p-1.5 rounded-lg text-white transition-colors" style={{backgroundColor: '#234696'}} title="Generiraj izvješće o primjedbama">
<span className="material-symbols-outlined text-[18px]">assignment</span>
</button>
<button className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-variant text-[#1e2570] transition-colors" title="Otvori digitalni spis">
<span className="material-symbols-outlined text-[18px]">open_in_new</span>
</button>
</div>
</td>
</tr></tbody>
</table>
</div>
<div className="p-space-md bg-surface-container-low flex items-center justify-between">
<span className="font-body-sm text-body-sm text-on-surface-variant">Prikazano 5 od ukupno 89 aktivnih UPI predmeta</span>
<a className="font-button text-button text-primary-container hover:text-institutional-navy-deep font-bold flex items-center gap-1" href="#">
              Otvori cjelokupnu e-Pisarnicu
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary-container shrink-0">
<span className="material-symbols-outlined text-[26px]">map</span>
</div>
<div className="flex-1 min-w-0">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant">Prostorni GIS HNŽ</span>
<h3 className="font-title-md text-title-md text-institutional-navy-deep leading-snug">Sloj zaštićenih područja prirode</h3>
<p className="font-body-sm text-body-sm text-text-body mt-1">Park prirode Hutovo blato i Blidinje: ažurirani poligoni strogog ornitološkog i florističkog rezervata.</p>
<div className="flex items-center gap-2 mt-space-sm">
<span className="px-2 py-0.5 rounded-lg bg-emerald-light text-secondary font-label-badge text-label-badge">WMS / WFS Aktivan</span>
<span className="font-body-sm text-[12px] text-outline">Sync: prije 22 min</span>
</div>
</div>
</div>
<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm">
<div className="w-12 h-12 rounded-xl bg-emerald-light flex items-center justify-center text-secondary shrink-0">
<span className="material-symbols-outlined text-[26px]">policy</span>
</div>
<div className="flex-1 min-w-0">
<span className="font-label-kicker text-label-kicker uppercase text-on-surface-variant">Inspekcija & Teren</span>
<h3 className="font-title-md text-title-md text-institutional-navy-deep leading-snug">Inspekcijski nalazi u veljači</h3>
<p className="font-body-sm text-body-sm text-text-body mt-1">Provedeno 28 terenskih nadzora (24 uredna nalaza, 3 prekršajna naloga za separacije šljunka, 1 zatvaranje pogona).</p>
<div className="flex items-center gap-2 mt-space-sm">
<span className="px-2 py-0.5 rounded-lg bg-amber-light text-on-tertiary-container font-label-badge text-label-badge">3 prekršaja u tijeku</span>
<span className="font-body-sm text-[12px] text-outline">Mostar / Jablanica</span>
</div>
</div>
</div>
</div>
</div>
<div className="lg:col-span-4 space-y-space-md">
<div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-sm">
<div className="flex items-center justify-between">
<h2 className="font-title-md text-title-md text-institutional-navy-deep" style={{fontFamily: '"Roboto Flex", sans-serif', fontWeight: '700', color: 'rgb(30, 37, 112)'}}>Resorni moduli</h2>
<span className="font-label-badge text-label-badge uppercase tracking-wider text-outline">MTTO CMS</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">Izravni ulaz u administratorska sučelja resornih odjela</p>
<div className="space-y-space-xs pt-1">
<a className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between group" href="#">
<div className="flex items-center gap-space-sm min-w-0">
<div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-[#13693f]" style={{backgroundColor: '#eaf7f0'}}>
<span className="material-symbols-outlined text-[20px]">nature_people</span>
</div>
<div className="truncate">
<span className="font-bold text-[#1e2570] block truncate text-[14px]" style={{fontFamily: "'Roboto Flex', sans-serif"}}>Registar Zaštite Okoliša</span>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate block">142 dozvole · GVE pragovi · GIS</span>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-[#1e2570] group-hover:translate-x-1 transition-all text-[20px]">arrow_forward</span>
</a>
<a className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between group" href="#">
<div className="flex items-center gap-space-sm min-w-0">
<div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-[#0077a8]" style={{backgroundColor: '#e0f7fe'}}>
<span className="material-symbols-outlined text-[20px]">recycling</span>
</div>
<div className="truncate">
<span className="font-bold text-[#1e2570] block truncate text-[14px]" style={{fontFamily: "'Roboto Flex', sans-serif"}}>Upravljanje Otpadom</span>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate block">EU katalog · R/D šifre · Deponije</span>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-[#1e2570] group-hover:translate-x-1 transition-all text-[20px]">arrow_forward</span>
</a>
<a className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between group" href="#">
<div className="flex items-center gap-space-sm min-w-0">
<div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-[#8d6f00]" style={{backgroundColor: '#fffde6'}}>
<span className="material-symbols-outlined text-[20px]">travel_explore</span>
</div>
<div className="truncate">
<span className="font-bold text-[#1e2570] block truncate text-[14px]" style={{fontFamily: "'Roboto Flex', sans-serif"}}>Turizam & MTU Standardi</span>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate block">314 vodiča · 1.280 objekata</span>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-[#1e2570] group-hover:translate-x-1 transition-all text-[20px]">arrow_forward</span>
</a>
<a className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between group" href="#">
<div className="w-10 h-10 rounded-lg bg-surface-container text-[#1e2570] flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]">gavel</span>
</div>
<div className="truncate">
<span className="font-bold text-[#1e2570] block truncate text-[14px]" style={{fontFamily: "'Roboto Flex', sans-serif"}}>Javni Uvidi & Propisi</span>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate block">Službeni glasnik · Obavijesti</span>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-[#1e2570] group-hover:translate-x-1 transition-all text-[20px]">arrow_forward</span>
</a>
<a className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between group" href="#">
<div className="flex items-center gap-space-sm min-w-0">
<div className="w-10 h-10 rounded-lg bg-surface-container text-[#1e2570] flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]">manage_accounts</span>
</div>
<div className="truncate">
<span className="font-bold text-[#1e2570] block truncate text-[14px]" style={{fontFamily: "'Roboto Flex', sans-serif"}}>Korisnici i Permisije</span>
<span className="font-body-sm text-body-sm text-on-surface-variant truncate block">24 aktivna službenika · 4 sektora</span>
</div>
</div>
<span className="material-symbols-outlined text-outline group-hover:text-[#1e2570] group-hover:translate-x-1 transition-all text-[20px]">arrow_forward</span>
</a></div>
</div>
<div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
<h2 className="font-title-md text-title-md text-institutional-navy-deep" style={{fontFamily: "'Roboto Flex', sans-serif", fontWeight: '700', color: '#1e2570'}}>Dnevnik aktivnosti (Live)</h2>
</div>
<span className="font-label-badge text-label-badge uppercase tracking-wider text-outline">Audit Log</span>
</div>
<div className="space-y-space-md relative pl-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container">
<div className="relative pl-3">
<span className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-surface-container-lowest"></span>
<div className="flex items-baseline justify-between">
<span className="font-button text-button font-bold text-text-heading">Amina Hadžić (Inspektor)</span>
<span className="font-label-badge text-label-badge text-outline">10:42</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Unijela kontrolni zapisnik terenskog očevida: <span className="font-semibold text-institutional-navy-deep">INS-05/25-88</span> (Deponija Uborak)</p>
</div>
<div className="relative pl-3">
<span className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary-container ring-4 ring-surface-container-lowest"></span>
<div className="flex items-baseline justify-between">
<span className="font-button text-button font-bold text-text-heading">Goran Marić (Turizam)</span>
<span className="font-label-badge text-label-badge text-outline">10:15</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Izdano rješenje o MTU kategorizaciji 4★ za <span className="font-semibold text-institutional-navy-deep">Pansion Međugorje</span> (24 sobe, restoran)</p>
</div>
<div className="relative pl-3">
<span className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-on-tertiary-container ring-4 ring-surface-container-lowest"></span>
<div className="flex items-baseline justify-between">
<span className="font-button text-button font-bold text-on-tertiary-container">Sustav MTTO (Automatski)</span>
<span className="font-label-badge text-label-badge text-outline">09:30</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Automatsko upozorenje o isteku 3 okolišne dozvole unutar 60 dana poslano operaterima.</p>
</div>
<div className="relative pl-3">
<span className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-text-heading ring-4 ring-surface-container-lowest"></span>
<div className="flex items-baseline justify-between">
<span className="font-button text-button font-bold text-text-heading">mr. sc. Asmir K. (Admin)</span>
<span className="font-label-badge text-label-badge text-outline">08:45</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Uspješna 2FA prijava na konzolu ministarstva. IP: <span className="font-semibold text-institutional-navy-deep">195.222.45.10</span> (Pisarnica Mostar)</p>
</div>
</div>
<div className="pt-2">
<button className="w-full py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-institutional-navy-deep font-button text-button transition-colors flex items-center justify-center gap-1">
<span>Cijeli sigurnosni dnevnik</span>
<span className="material-symbols-outlined text-[16px]">history</span>
</button>
</div>
</div>
<div className="p-space-md rounded-xl bg-institutional-navy-deep text-on-primary shadow-sm space-y-space-sm relative overflow-hidden" style={{background: 'linear-gradient(135deg, rgb(30, 37, 112) 0%, rgb(35, 70, 150) 100%)'}}>
<div className="relative z-10">
<span className="font-label-kicker text-label-kicker uppercase text-surface-variant tracking-wider block">Kvaliteta zraka & Hidrologija</span>
<h3 className="font-headline-sm text-headline-sm mt-0.5">Sliv rijeke Neretve · Mostar & Konjic</h3>
<p className="font-body-sm text-body-sm text-surface-container-highest mt-1">Automatske mjerne stanice MTTO: svi parametri (PM2.5, SO2, otopljeni kisik) su unutar dozvoljenih GVE granica.</p>
<div className="flex items-center gap-3 mt-space-md">
<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/70 text-on-primary">
<span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
<span className="font-label-badge text-label-badge uppercase">Indeks zraka: DOBAR</span>
</div>
<span className="font-body-sm text-body-sm text-surface-variant">Mjerenje u 10:00h</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div></>
  );
}

export function CmsDashS2() {
  return (
<></>
  );
}
