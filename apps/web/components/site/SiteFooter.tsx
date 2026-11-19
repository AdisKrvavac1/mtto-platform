import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container-low text-on-surface mt-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-lg pb-space-xl">
          <div className="lg:col-span-2 space-y-space-md">
            <img src="/mtto-logo.svg" alt="MTTO HNK" className="h-14 w-auto" />
            <p className="font-body-regular text-body-regular text-on-surface-variant max-w-md">
              Ministarstvo trgovine, turizma i zaštite okoliša Hercegovačko-neretvanskog kantona: unutrašnja trgovina, turizam i ugostiteljstvo, zaštita prirode i okoliša.
            </p>
          </div>
          <div>
            <h4 className="font-title-md text-title-md text-primary mb-space-md font-bold">Resori</h4>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li><Link className="hover:text-on-surface" href="/vijesti?category=Trgovina">Trgovina</Link></li>
              <li><Link className="hover:text-on-surface" href="/vijesti?category=Turizam">Turizam i ugostiteljstvo</Link></li>
              <li><Link className="hover:text-on-surface" href="/vijesti?category=Za%C5%A1tita%20okoli%C5%A1a">Zaštita prirode i okoliša</Link></li>
              <li><Link className="hover:text-on-surface" href="/registri/okolisne-dozvole">Okolišne dozvole</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-title-md text-title-md text-primary mb-space-md font-bold">Brzi pristup</h4>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li><Link className="hover:text-on-surface" href="/vijesti?type=JAVNI_POZIV">Javni pozivi</Link></li>
              <li><Link className="hover:text-on-surface" href="/propisi">Propisi i obrasci</Link></li>
              <li><Link className="hover:text-on-surface" href="/registri/ugostiteljski-objekti">Kategorizirani objekti</Link></li>
              <li><Link className="hover:text-on-surface" href="/mapa">Interaktivna mapa</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-title-md text-title-md text-primary mb-space-md font-bold">Sjedište i kontakt</h4>
            <div className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <p className="flex items-start gap-space-xs"><span className="material-symbols-outlined text-[16px] text-primary mt-0.5">location_on</span><span>Braće Fejića bb,<br />88000 Mostar, BiH</span></p>
              <p className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-[16px] text-primary">call</span><a href="tel:+38736551823">+387 36 551 823</a></p>
              <p className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-[16px] text-primary">print</span><span>+387 36 552 806</span></p>
              <p className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-[16px] text-primary">mail</span><a href="mailto:info@mtto.gov.ba">info@mtto.gov.ba</a></p>
            </div>
          </div>
        </div>
        <div className="pt-space-md border-t border-slate-border flex flex-col md:flex-row items-center justify-between gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
          <p>© {new Date().getFullYear()} Ministarstvo trgovine, turizma i zaštite okoliša HNK</p>
          <p className="font-label-badge text-label-badge uppercase tracking-wider">MTTO Digital Platform 2027 · radni prototip</p>
        </div>
      </div>
    </footer>
  );
}
