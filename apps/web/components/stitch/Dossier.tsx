/* eslint-disable */
// Generisano iz Stitch HTML-a: ../../../stitch/port.py (ne uređivati ručno)

export function DossierBody(props: any) {
  return (
<><div className="flex flex-col w-full">
<div className="bg-surface-container-low px-gutter py-space-sm shadow-sm">
<div className="max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-sm font-body-sm text-body-sm">
<div className="flex items-center gap-space-xs text-on-surface-variant flex-wrap">
<a className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-button transition-colors" data-path="registri" href="/registri/okolisne-dozvole">
<span className="material-symbols-outlined text-[18px]">arrow_back</span>
<span>Natrag na Registar okolišnih dozvola</span>
</a>
<span className="text-outline-variant">|</span>
<span className="text-on-surface-variant">Službeni Registar HNŽ/HNK:</span>
<span className="font-label-kicker text-label-kicker text-institutional-navy-deep px-space-xs py-0.5 bg-surface-container-high rounded">{props.reg}</span>
</div>
<div className="flex items-center gap-space-md">
<span className="inline-flex items-center gap-1 font-label-badge text-label-badge text-secondary uppercase tracking-wider">
<span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
          Ažurirano: {props.updated}
        </span>

</div>
</div>
</div>
<div className="max-w-[1280px] mx-auto px-gutter py-space-xl w-full">
<div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg md:p-space-xl relative overflow-hidden mb-space-lg">
<div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none"></div>
<div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
<div className="relative z-10 flex flex-col gap-space-md">
{props.badges}
<div className="space-y-space-xs">
<div className="flex items-center gap-space-xs text-on-surface-variant font-label-kicker text-label-kicker uppercase tracking-widest">
<span>Dossier Okolišne Dozvole</span>
<span>•</span>
<span className="text-primary font-bold">Klasa: {props.reg}</span>
</div>
<h1 className="font-headline-lg text-headline-lg text-institutional-navy-deep tracking-tight">{props.title}</h1>
{props.meta}
</div>
{props.actions}
</div>
</div>
{props.stats}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
<div className="lg:col-span-8 space-y-space-xl">{props.intro}
<section className="bg-surface-container-lowest p-space-lg md:p-space-xl rounded-xl shadow-sm space-y-space-md">
<div className="flex items-center justify-between pb-space-xs">
<div className="flex items-center gap-space-xs">
<span className="w-8 h-8 rounded bg-primary-container text-on-primary flex items-center justify-center font-bold text-[14px]">01</span>
<div>
<span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase tracking-wider block">Tehnološki Parametri</span>
<h2 className="font-headline-md text-headline-md text-institutional-navy-deep">Opis postrojenja i tehnološkog procesa <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-herzeg-gold-soft text-[#786000] border border-herzeg-gold font-label-badge text-label-badge uppercase align-middle" title="Primjer podataka: izvor podataka se povezuje u Fazi 2"><span className="material-symbols-outlined text-[13px]">science</span>Demo</span></h2>
</div>
</div>
<span className="hidden sm:inline-flex items-center gap-1 px-space-sm py-0.5 bg-surface-container text-primary font-label-badge text-label-badge rounded">
<span className="material-symbols-outlined text-[14px]">tune</span>BAT Standardi
            </span>
</div>
<p className="font-body-regular text-body-regular text-text-body leading-relaxed">
            Industrijsko postrojenje za taljenje i livenje primarnog i sekundarnog aluminija smješteno je u industrijskoj zoni Baćevići na južnom izlazu iz Mostara. Kompleks obuhvaća radne cjeline ljevaonice (lijevanje trupaca, blokova i žice), postrojenje za pripremu i pečenje anoda te autonomne sisteme za obradu procesnih dimnih plinova.
          </p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
<div className="p-space-md bg-surface rounded-xl space-y-space-xs">
<div className="flex items-center gap-space-xs text-primary font-title-md text-title-md">
<span className="material-symbols-outlined text-secondary">mode_heat</span>
<span>Talioničke i Homogenizacijske Peći</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
                Plinske peći s regenerativnim plamenicima niske NOx emisije (Low-NOx). Kapacitet taljenja: do 25 t/h s automatskom kontrolom temperature i procesnog ubrizgavanja flukseva radi minimizacije nastanka troske.
              </p>
</div>
<div className="p-space-md bg-surface rounded-xl space-y-space-xs">
<div className="flex items-center gap-space-xs text-primary font-title-md text-title-md">
<span className="material-symbols-outlined text-secondary">air</span>
<span>Sustav Obrade Dimnih Plinova (FTP)</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
                Suhi postupak pročišćavanja primjenom ubrizgavanja aluminij-oksida (glinice) u turbulentni tok dimnih plinova za adsorpciju fluorida i policikličkih aromatskih ugljikovodika uz PTFE vrećaste filtere.
              </p>
</div>
<div className="p-space-md bg-surface rounded-xl space-y-space-xs">
<div className="flex items-center gap-space-xs text-primary font-title-md text-title-md">
<span className="material-symbols-outlined text-secondary">water_drop</span>
<span>Zatvoreni Rashladni Vodeni Krug</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
                Recirkulacijski sustav industrijske vode s rashladnim tornjevima i automatskim doziranjem inhibitora korozije. Tehnološke vode ne ispuštaju se izravno u površinske vodotoke bez prethodnog taloženja i filtracije.
              </p>
</div>
<div className="p-space-md bg-surface rounded-xl space-y-space-xs">
<div className="flex items-center gap-space-xs text-primary font-title-md text-title-md">
<span className="material-symbols-outlined text-secondary">electric_bolt</span>
<span>Energetska Efikasnost</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
                Iskorištavanje otpadne topline dimnih plinova za predgrijavanje zraka za izgaranje u pećima ljevaonice, s instaliranom rekuperacijom toplinske energije efikasnosti veće od 68%.
              </p>
</div>
</div>
<div className="pt-space-xs">
<div className="relative rounded-xl overflow-hidden shadow-sm h-64 bg-surface-container">
<img className="w-full h-full object-cover" data-alt="A clean, industrial metallurgical facility interior featuring high-precision aluminum casting bays with warm molten glow, enclosed ventilation hoods, modern safety railings, and clean floorways under soft daylighting matching Canton blue and emerald accents" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYvoqyBYH4S638b3CUCzm11nyBzQyl5DqN9Mf-vnEYLjsy3Cr09QWZU1HV5_DcdAoLq86tGZE3QNq7Aui4TN3vWaMhcIAsH6ZYdCR8SFTV9LiTCpKRggbE3m4OYzokvu2kPrbn3MerOtdHUHP1LRXyEfEMyxSqxsS0LzFKXuNuIqv5J6RS_ZmNhtY_XZxemnGqD3HAiUve0R8jzSYiw7F0cryp_cil4uGUt3KpdoA" />
<div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-institutional-navy-deep/90 via-institutional-navy-deep/50 to-transparent p-space-md text-on-primary">
<p className="font-label-badge text-label-badge uppercase tracking-wider text-secondary-fixed">Verificirano postrojenje</p>
<p className="font-body-sm text-body-sm">Ljevaonica aluminijskih trupaca i sustav kontinuiranog usisa dimnih plinova (Objekt B-2)</p>
</div>
</div>
</div>
</section>
<section className="bg-surface-container-lowest p-space-lg md:p-space-xl rounded-xl shadow-sm space-y-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-xs">
<div className="flex items-center gap-space-xs">
<span className="w-8 h-8 rounded bg-primary-container text-on-primary flex items-center justify-center font-bold text-[14px]">02</span>
<div>
<span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase tracking-wider block">Inspekcijski Podaci & Analize</span>
<h2 className="font-headline-md text-headline-md text-institutional-navy-deep">Granične Vrijednosti Emisija (GVE) i Monitoring <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-herzeg-gold-soft text-[#786000] border border-herzeg-gold font-label-badge text-label-badge uppercase align-middle" title="Primjer podataka: izvor podataka se povezuje u Fazi 2"><span className="material-symbols-outlined text-[13px]">science</span>Demo</span></h2>
</div>
</div>
<div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
<span className="material-symbols-outlined text-[16px] text-secondary">update</span>
<span>Zadnji kvartal: <strong>Q4 / 2025</strong></span>
</div>
</div>
<p className="font-body-regular text-body-regular text-text-body">
            U skladu s Pravilnikom o graničnim vrijednostima emisija u zrak (Sl. novine FBiH 12/05) i Zakonom o zaštiti okoliša HNŽ/HNK, operater je obvezan provoditi kontinuirani i periodični monitoring putem akreditiranog laboratorija.
          </p>
<div className="flex items-center gap-space-xs p-1 bg-surface-container rounded-lg overflow-x-auto" id="monitoringTabs">
<button className="px-space-md py-1.5 rounded bg-surface-container-lowest text-primary font-button text-button shadow-sm transition-all" data-tab="air" type="button">
              Emisije u Zrak (Dimnjaci D1 & D2)
            </button>
<button className="px-space-md py-1.5 rounded text-on-surface-variant hover:text-primary font-button text-button transition-all" data-tab="water" type="button">
              Tehnološke Otpadne Vode
            </button>
<button className="px-space-md py-1.5 rounded text-on-surface-variant hover:text-primary font-button text-button transition-all" data-tab="noise" type="button">
              Imisija Buke na Međi
            </button>
</div>
<div className="space-y-space-md" id="tab-air">
<div className="overflow-x-auto rounded-lg">
<table className="w-full text-left font-body-sm text-body-sm">
<thead>
<tr className="bg-surface-container-high text-institutional-navy-deep uppercase font-label-badge text-label-badge tracking-wider">
<th className="py-3 px-space-md">Parametar / Polutant</th>
<th className="py-3 px-space-md">Propisana GVE</th>
<th className="py-3 px-space-md">Zadnje Mjerenje</th>
<th className="py-3 px-space-md text-center">Trend (3 god.)</th>
<th className="py-3 px-space-md text-right">Status Sukladnosti</th>
</tr>
</thead>
<tbody className="divide-y-0 text-text-body">
<tr className="bg-surface hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-space-md font-semibold text-text-heading">
                      Fluoridi izraženi kao HF
                      <span className="block text-[11px] font-normal text-on-surface-variant">Mjerno mjesto: Emiter D-1 Peć</span>
</td>
<td className="py-3.5 px-space-md font-mono text-[13px]">5.0 mg/Nm³</td>
<td className="py-3.5 px-space-md font-mono font-bold text-secondary text-[14px]">1.12 mg/Nm³</td>
<td className="py-3.5 px-space-md text-center">
<span className="inline-flex items-center text-secondary font-label-badge text-label-badge">
<span className="material-symbols-outlined text-[14px]">trending_down</span> -18%
                      </span>
</td>
<td className="py-3.5 px-space-md text-right">
<span className="inline-flex items-center gap-1 px-space-sm py-0.5 bg-emerald-light text-secondary font-label-badge text-label-badge rounded">
<span className="material-symbols-outlined text-[14px]">check</span> USKLAĐENO
                      </span>
</td>
</tr>
<tr className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-space-md font-semibold text-text-heading">
                      Ukupna prašina (PM10 / PM2.5)
                      <span className="block text-[11px] font-normal text-on-surface-variant">Mjerno mjesto: Filter jedinica F-3</span>
</td>
<td className="py-3.5 px-space-md font-mono text-[13px]">20.0 mg/Nm³</td>
<td className="py-3.5 px-space-md font-mono font-bold text-secondary text-[14px]">4.80 mg/Nm³</td>
<td className="py-3.5 px-space-md text-center">
<span className="inline-flex items-center text-secondary font-label-badge text-label-badge">
<span className="material-symbols-outlined text-[14px]">trending_flat</span> Stabilno
                      </span>
</td>
<td className="py-3.5 px-space-md text-right">
<span className="inline-flex items-center gap-1 px-space-sm py-0.5 bg-emerald-light text-secondary font-label-badge text-label-badge rounded">
<span className="material-symbols-outlined text-[14px]">check</span> USKLAĐENO
                      </span>
</td>
</tr>
<tr className="bg-surface hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-space-md font-semibold text-text-heading">
                      Dušikovi oksidi (NOx kao NO2)
                      <span className="block text-[11px] font-normal text-on-surface-variant">Mjerno mjesto: Glavni dimnjak ljevaonice</span>
</td>
<td className="py-3.5 px-space-md font-mono text-[13px]">350.0 mg/Nm³</td>
<td className="py-3.5 px-space-md font-mono font-bold text-secondary text-[14px]">142.3 mg/Nm³</td>
<td className="py-3.5 px-space-md text-center">
<span className="inline-flex items-center text-secondary font-label-badge text-label-badge">
<span className="material-symbols-outlined text-[14px]">trending_down</span> -6%
                      </span>
</td>
<td className="py-3.5 px-space-md text-right">
<span className="inline-flex items-center gap-1 px-space-sm py-0.5 bg-emerald-light text-secondary font-label-badge text-label-badge rounded">
<span className="material-symbols-outlined text-[14px]">check</span> USKLAĐENO
                      </span>
</td>
</tr>
<tr className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-space-md font-semibold text-text-heading">
                      Sumporov dioksid (SO2)
                      <span className="block text-[11px] font-normal text-on-surface-variant">Mjerno mjesto: Ispust energane</span>
</td>
<td className="py-3.5 px-space-md font-mono text-[13px]">200.0 mg/Nm³</td>
<td className="py-3.5 px-space-md font-mono font-bold text-secondary text-[14px]">18.4 mg/Nm³</td>
<td className="py-3.5 px-space-md text-center">
<span className="inline-flex items-center text-secondary font-label-badge text-label-badge">
<span className="material-symbols-outlined text-[14px]">trending_down</span> -30%
                      </span>
</td>
<td className="py-3.5 px-space-md text-right">
<span className="inline-flex items-center gap-1 px-space-sm py-0.5 bg-emerald-light text-secondary font-label-badge text-label-badge rounded">
<span className="material-symbols-outlined text-[14px]">check</span> USKLAĐENO
                      </span>
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
<div className="space-y-0.5">
<span className="font-label-kicker text-label-kicker text-institutional-navy-deep uppercase">Emisijski Kvocijent Postrojenja</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">Sve izmjerene vrijednosti kreću se ispod 35% zakonski dopuštenih graničnih kvota.</p>
</div>
<div className="flex items-center gap-space-sm">
<div className="flex items-center gap-2">
<svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
<path className="text-surface-container-highest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
<path className="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="29, 100" strokeLinecap="round" strokeWidth="3.5"></path>
</svg>
<div>
<span className="font-headline-sm text-headline-sm text-secondary font-bold block leading-none">29%</span>
<span className="font-label-badge text-label-badge text-on-surface-variant uppercase">Iskorištenost GVE</span>
</div>
</div>
</div>
</div>
</div>
<div className="space-y-space-md hidden" id="tab-water">
<div className="p-space-md bg-surface rounded-xl space-y-space-sm">
<div className="flex items-center justify-between">
<span className="font-title-md text-title-md text-institutional-navy-deep">Mjerna točka: Neutralizacijska stanica (K-1)</span>
<span className="font-label-badge text-label-badge px-2 py-0.5 bg-emerald-light text-secondary rounded">Režim: Kontinuirano</span>
</div>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
<div className="p-space-xs bg-surface-container-lowest rounded">
<span className="font-label-badge text-label-badge text-on-surface-variant uppercase block">pH vrijednost</span>
<span className="font-headline-sm text-headline-sm text-secondary font-bold">7.42</span>
<span className="text-[11px] text-outline block">Granica: 6.5 - 8.5</span>
</div>
<div className="p-space-xs bg-surface-container-lowest rounded">
<span className="font-label-badge text-label-badge text-on-surface-variant uppercase block">Suspendirane tvari</span>
<span className="font-headline-sm text-headline-sm text-secondary font-bold">11.8 mg/l</span>
<span className="text-[11px] text-outline block">Granica: 35 mg/l</span>
</div>
<div className="p-space-xs bg-surface-container-lowest rounded">
<span className="font-label-badge text-label-badge text-on-surface-variant uppercase block">Mineralna ulja</span>
<span className="font-headline-sm text-headline-sm text-secondary font-bold">0.4 mg/l</span>
<span className="text-[11px] text-outline block">Granica: 5.0 mg/l</span>
</div>
<div className="p-space-xs bg-surface-container-lowest rounded">
<span className="font-label-badge text-label-badge text-on-surface-variant uppercase block">Aluminij (Al)</span>
<span className="font-headline-sm text-headline-sm text-secondary font-bold">0.82 mg/l</span>
<span className="text-[11px] text-outline block">Granica: 3.0 mg/l</span>
</div>
</div>
</div>
</div>
<div className="space-y-space-md hidden" id="tab-noise">
<div className="p-space-md bg-surface rounded-xl space-y-space-sm">
<span className="font-title-md text-title-md text-institutional-navy-deep block">Akustični monitoring na granici industrijskog kruga</span>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
<div className="p-space-md bg-surface-container-lowest rounded-xl">
<div className="flex justify-between items-center mb-1">
<span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase">Dnevni period (06:00 - 22:00)</span>
<span className="px-2 py-0.5 bg-emerald-light text-secondary text-label-badge font-label-badge rounded">Usklađeno</span>
</div>
<div className="flex items-baseline gap-2">
<span className="font-display text-display text-text-heading">54.2</span>
<span className="font-body-regular text-body-regular text-outline">dBA / dopušteno max 65 dBA</span>
</div>
</div>
<div className="p-space-md bg-surface-container-lowest rounded-xl">
<div className="flex justify-between items-center mb-1">
<span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase">Noćni period (22:00 - 06:00)</span>
<span className="px-2 py-0.5 bg-emerald-light text-secondary text-label-badge font-label-badge rounded">Usklađeno</span>
</div>
<div className="flex items-baseline gap-2">
<span className="font-display text-display text-text-heading">44.8</span>
<span className="font-body-regular text-body-regular text-outline">dBA / dopušteno max 50 dBA</span>
</div>
</div>
</div>
</div>
</div>
<div className="text-right">
<span className="font-body-sm text-body-sm text-on-surface-variant">Ovlašteni ispitni institut: <strong>akreditirani laboratorij (primjer)</strong></span>
</div>
</section>
<section className="bg-surface-container-lowest p-space-lg md:p-space-xl rounded-xl shadow-sm space-y-space-md">
<div className="flex items-center gap-space-xs pb-space-xs">
<span className="w-8 h-8 rounded bg-primary-container text-on-primary flex items-center justify-center font-bold text-[14px]">03</span>
<div>
<span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase tracking-wider block">Kružna Ekonomija i Nusproizvodi</span>
<h2 className="font-headline-md text-headline-md text-institutional-navy-deep">Plan upravljanja otpadom i nusproizvodima <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-herzeg-gold-soft text-[#786000] border border-herzeg-gold font-label-badge text-label-badge uppercase align-middle" title="Primjer podataka: izvor podataka se povezuje u Fazi 2"><span className="material-symbols-outlined text-[13px]">science</span>Demo</span></h2>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
<div className="bg-surface p-space-md rounded-xl flex flex-col justify-between space-y-space-sm">
<div className="space-y-space-xs">
<div className="flex items-center justify-between">
<span className="font-label-badge text-label-badge px-2 py-0.5 bg-surface-container text-primary rounded">KOD 10 03 15*</span>
<span className="material-symbols-outlined text-secondary text-[20px]">recycling</span>
</div>
<h3 className="font-title-md text-title-md text-institutional-navy-deep">Aluminijska troska (Dross)</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Otpad s visokim udjelom slobodnog aluminija. Obrađuje se separatorima troske unutar kruga postrojenja, a ostatak se predaje licenciranim oporabiteljima.
                </p>
</div>
<div className="pt-space-xs border-t border-slate-border text-on-surface-variant text-[12px]">
                Ugovor: <strong>ovlašteni reciklažer (primjer)</strong>
</div>
</div>
<div className="bg-surface p-space-md rounded-xl flex flex-col justify-between space-y-space-sm">
<div className="space-y-space-xs">
<div className="flex items-center justify-between">
<span className="font-label-badge text-label-badge px-2 py-0.5 bg-amber-light text-tertiary-container rounded">KOD 16 11 01*</span>
<span className="material-symbols-outlined text-tertiary-container text-[20px]">warning</span>
</div>
<h3 className="font-title-md text-title-md text-institutional-navy-deep">Istrošene obloge peći (SPL)</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Opasni otpad s prisutnošću cijanida i fluorida. Privremeno natkriveno skladištenje na nepropusnom platou uz izvoz putem Basel konvencije.
                </p>
</div>
<div className="pt-space-xs border-t border-slate-border text-on-surface-variant text-[12px]">
                Operater: <strong>ovlašteni operater (primjer)</strong>
</div>
</div>
<div className="bg-surface p-space-md rounded-xl flex flex-col justify-between space-y-space-sm">
<div className="space-y-space-xs">
<div className="flex items-center justify-between">
<span className="font-label-badge text-label-badge px-2 py-0.5 bg-surface-container text-primary rounded">KOD 17 04 02</span>
<span className="material-symbols-outlined text-secondary text-[20px]">autorenew</span>
</div>
<h3 className="font-title-md text-title-md text-institutional-navy-deep">Reciklirani metalni otpad</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Interni optjecaj čistih odrezaka i neispravnih odljevaka koji se 100% vraćaju u ponovni postupak taljenja bez nastanka trajnog otpada.
                </p>
</div>
<div className="pt-space-xs border-t border-slate-border text-on-surface-variant text-[12px]">
                Interno: <strong>Zatvoreni ciklus</strong>
</div>
</div>
</div>
</section>
<section className="bg-surface-container-lowest p-space-lg md:p-space-xl rounded-xl shadow-sm space-y-space-md">
<div className="flex items-center justify-between pb-space-xs">
<div className="flex items-center gap-space-xs">
<span className="w-8 h-8 rounded bg-primary-container text-on-primary flex items-center justify-center font-bold text-[14px]">04</span>
<div>
<span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase tracking-wider block">Inspekcijski Dnevnik</span>
<h2 className="font-headline-md text-headline-md text-institutional-navy-deep">Kronologija i Povijest Nadzora <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-herzeg-gold-soft text-[#786000] border border-herzeg-gold font-label-badge text-label-badge uppercase align-middle" title="Primjer podataka: izvor podataka se povezuje u Fazi 2"><span className="material-symbols-outlined text-[13px]">science</span>Demo</span></h2>
</div>
</div>
<span className="font-label-badge text-label-badge text-on-surface-variant uppercase">Kantonalna inspekcija</span>
</div>
<div className="relative pl-6 space-y-space-lg before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
<div className="relative space-y-1">
<div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-secondary ring-4 ring-emerald-light"></div>
<div className="flex flex-wrap items-center gap-space-xs">
<span className="font-title-md text-title-md text-text-heading font-bold">12. studenoga 2025.</span>
<span className="px-2 py-0.5 bg-emerald-light text-secondary font-label-badge text-label-badge rounded uppercase">Redoviti Nadzor</span>
<span className="text-on-surface-variant font-mono text-[12px]">Zapisnik: INS-05/25-88</span>
</div>
<p className="font-body-regular text-body-regular text-text-body">
                Izvršen sveobuhvatni terenski pregled rada vrećastih filtera na dimnjacima D-1 i D-2. Utvrđeno je uredno vođenje dnevnika rada pročišćivača, kontinuiranih analizatora i propisanog skladištenja otpada. Nema naloženih upravnih mjera.
              </p>
</div>
<div className="relative space-y-1">
<div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-primary-container ring-4 ring-surface-container"></div>
<div className="flex flex-wrap items-center gap-space-xs">
<span className="font-title-md text-title-md text-text-heading font-bold">14. svibnja 2024.</span>
<span className="px-2 py-0.5 bg-surface-container text-primary font-label-badge text-label-badge rounded uppercase">Kontrolni Pregled</span>
<span className="text-on-surface-variant font-mono text-[12px]">Zapisnik: INS-05/24-34</span>
</div>
<p className="font-body-regular text-body-regular text-text-body">
                Verifikacija planirane zamjene vrećastih filtera visoke otpornosti na jedinici FTP-1. Konstatirana ugradnja certificiranih elemenata uz prisutnost kantonalnog inspektora za zaštitu okoliša.
              </p>
</div>
<div className="relative space-y-1">
<div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-primary-fixed"></div>
<div className="flex flex-wrap items-center gap-space-xs">
<span className="font-title-md text-title-md text-text-heading font-bold">15. travnja 2023.</span>
<span className="px-2 py-0.5 bg-surface-container-high text-institutional-navy-deep font-label-badge text-label-badge rounded uppercase">Izdavanje Rješenja</span>
<span className="text-on-surface-variant font-mono text-[12px]">Rješenje: UPI/05-20-412/23</span>
</div>
<p className="font-body-regular text-body-regular text-text-body">
                Donošenje novog petogodišnjeg rješenja o okolišnoj dozvoli nakon održane javne rasprave u Gradskoj vijećnici Grada Mostara i pribavljenih pozitivnih stručnih ocjena komisije MTTO HNŽ/HNK.
              </p>
</div>
</div>
</section>
</div>
<div className="lg:col-span-4 space-y-space-lg">
{props.map}
<div className="bg-surface-container-lowest p-space-md md:p-space-lg rounded-xl shadow-sm space-y-space-md">
<h3 className="font-title-md text-title-md text-institutional-navy-deep flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">shield_person</span>
<span>Ovlašteno osoblje i standardi</span> <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-herzeg-gold-soft text-[#786000] border border-herzeg-gold font-label-badge text-label-badge uppercase align-middle" title="Primjer podataka: izvor podataka se povezuje u Fazi 2"><span className="material-symbols-outlined text-[13px]">science</span>Demo</span>
</h3>
<div className="p-space-md bg-surface rounded-xl flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-[18px] shrink-0">
              EM
            </div>
<div className="min-w-0">
<span className="font-label-kicker text-label-kicker text-on-surface-variant uppercase block">Ekološki menadžer subjekta</span>
<span className="font-title-md text-title-md text-text-heading font-semibold block truncate">Ime i prezime (primjer)</span>
<span className="font-body-sm text-body-sm text-on-surface-variant block">Struka i broj licence</span>
</div>
</div>
<div className="space-y-space-xs font-body-sm text-body-sm">
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-[18px] text-primary">mail</span>
<span>ekologija@operater.ba</span>
</div>
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-[18px] text-primary">phone</span>
<span>+387 36 000 000</span>
</div>
</div>
<div className="pt-space-xs flex flex-wrap gap-2">
<span className="inline-flex items-center gap-1 px-space-sm py-1 bg-surface-container-low text-primary rounded font-label-badge text-label-badge">
<span className="material-symbols-outlined text-[14px]">verified</span> Certifikati operatera (primjer)
            </span>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md md:p-space-lg rounded-xl shadow-sm space-y-space-md relative overflow-hidden">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">public</span>
</div>
<div>
<h3 className="font-title-md text-title-md text-institutional-navy-deep">Aarhuška konvencija <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-primary border border-slate-border font-label-badge text-label-badge uppercase align-middle" title="Funkcionalnost iz Faze 2: prikazan dizajn"><span className="material-symbols-outlined text-[13px]">schedule</span>Faza 2</span></h3>
<span className="font-label-badge text-label-badge text-secondary uppercase">Javno pravo na uvid</span>
</div>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Svaki građanin i ekološka organizacija ima zakonsko pravo uvida u mjesečna izvješća kontinuiranog monitoringa i rezultate analiza vode i zraka ovog operatera.
          </p>
<form className="space-y-space-xs" action="/o-nama#upit">
<div>
<input className="w-full h-10 px-3 rounded bg-surface text-text-heading font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary shadow-inner" placeholder="Ime i prezime / Naziv NVO" required type="text" />
</div>
<div>
<input className="w-full h-10 px-3 rounded bg-surface text-text-heading font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary shadow-inner" placeholder="Kontakt e-mail adresa" required type="email" />
</div>
<button className="w-full inline-flex items-center justify-center gap-1 py-2 px-space-md bg-secondary text-on-secondary rounded font-button text-button hover:bg-on-secondary-container transition-colors shadow-sm" type="submit">
<span className="material-symbols-outlined text-[16px]">send</span>
<span>Zatraži dostavu izvještaja</span>
</button>
</form>
<span className="text-[11px] text-outline block text-center">Rok za odgovor ministarstva: 15 dana</span>
</div>
<div className="bg-surface-container-lowest p-space-md md:p-space-lg rounded-xl shadow-sm space-y-space-md">
<h3 className="font-title-md text-title-md text-institutional-navy-deep flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">link</span>
<span>Povezana rješenja i suglasnosti</span> <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-herzeg-gold-soft text-[#786000] border border-herzeg-gold font-label-badge text-label-badge uppercase align-middle" title="Primjer podataka: izvor podataka se povezuje u Fazi 2"><span className="material-symbols-outlined text-[13px]">science</span>Demo</span>
</h3>
<ul className="space-y-space-xs font-body-sm text-body-sm">
<li className="p-space-xs bg-surface rounded hover:bg-surface-container-low transition-colors">
<a className="block" href="#">
<span className="font-label-badge text-label-badge text-primary uppercase block">Vodna Dozvola</span>
<span className="font-semibold text-text-heading">Br. VD-44/22 • Agencija za vodno područje Jadranskog mora</span>
<span className="text-[11px] text-outline block">Vrijedi do 10.09.2027.</span>
</a>
</li>
<li className="p-space-xs bg-surface rounded hover:bg-surface-container-low transition-colors">
<a className="block" href="#">
<span className="font-label-badge text-label-badge text-primary uppercase block">Dozvola za Otpad</span>
<span className="font-semibold text-text-heading">UPI/05-20-118/22 • MTTO HNŽ/HNK</span>
<span className="text-[11px] text-outline block">Privremeno skladište opasnog otpada</span>
</a>
</li>
<li className="p-space-xs bg-surface rounded hover:bg-surface-container-low transition-colors">
<a className="block" href="#">
<span className="font-label-badge text-label-badge text-primary uppercase block">Urbanistička Suglasnost</span>
<span className="font-semibold text-text-heading">Odjel za urbanizam Grada Mostara (Br. 07/3-25-99)</span>
<span className="text-[11px] text-outline block">Trajna lokacijska dozvola</span>
</a>
</li>
</ul>
</div>
</div>
</div>
</div>
</div></>
  );
}
