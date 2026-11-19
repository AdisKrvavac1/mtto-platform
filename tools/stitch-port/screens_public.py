"""Javni ekrani: Stitch markup + patchevi za podatke i ispravke."""
import re
from port import load, j, sub, replace_el, remove_el, component, write, DEMO, FAZA2, top_level_children

HOME = 'hibridni_desktop_koncept_s_interaktivnom_kartom'


def main_sections(screen):
    body, kids = load(screen)
    main = [k for k in kids if k.startswith('<main')][0]
    inner = top_level_children(main, 'main')
    if len(inner) == 1 and inner[0].startswith('<div'):
        more = top_level_children(inner[0], 'div')
        if len(more) > 1:
            inner = more
    return body, kids, inner


def shell():
    body, kids = load(HOME)
    hdr = j([k for k in kids if k.startswith('<header')][0])
    ftr = j([k for k in kids if k.startswith('<footer')][0])
    # logo umjesto "M" monograma
    hdr = replace_el(hdr, 'div', ['w-11 h-11 rounded-lg bg-primary', '>M<'], '<a href="/" aria-label="Naslovna"><img src="/mtto-logo.svg" alt="MTTO HNK" className="h-11 w-auto" /></a>')
    hdr = sub(hdr, 'AQI Mostar: 32 • Dobar', 'AQI Mostar: 32 • demo')
    hdr = sub(hdr, '<span>Mostar, 11:30 CET</span>', '<span>Mostar</span>')
    hdr = sub(hdr, 'Vlada Hercegovačko-neretvanske županije / kantona', 'Vlada Hercegovačko-neretvanskog kantona')
    hdr = sub(hdr, '<div className="hidden xl:flex items-center bg-surface-container-low rounded-lg px-space-md py-1.5 w-72">', '<form action="/vijesti" className="hidden xl:flex items-center bg-surface-container-low rounded-lg px-space-md py-1.5 w-72">')
    hdr = sub(hdr, 'placeholder="Pretraga propisa, natječaja..." type="search" /></div>', 'name="q" aria-label="Pretraga" placeholder="Pretraga vijesti i poziva..." type="search" /></form>')
    hdr = sub(hdr, '<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div>',
              '<a href="/admin" title="CMS prijava" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></a>')
    hdr = re.sub(r'className="px-space-md py-1\.5 font-button text-button text-on-surface-variant hover:text-on-surface transition-colors" (data-path="[^"]+") href="([^"]+)"',
                 lambda m: f'className={{navCls("{m.group(2)}")}} {m.group(1)} href="{m.group(2)}"', hdr)
    hdr_mod = """'use client';
import { usePathname, useSearchParams } from 'next/navigation';
""" + f"""
export function SiteHeader() {{
  const path = usePathname();
  const sp = useSearchParams();
  const navCls = (href: string) => {{
    const [base, q] = href.split('#')[0].split('?');
    const on = base === '/' ? path === '/' : path.startsWith(base) && (!q || sp.toString() === q) && !(href.includes('#'));
    return `px-space-md py-1.5 font-button text-button transition-colors ${{on ? 'bg-primary-container text-on-primary font-bold rounded-lg' : 'text-on-surface-variant hover:text-on-surface'}}`;
  }};
  return (
{hdr}
  );
}}
"""
    open('/home/claude/mtto-platform/apps/web/components/stitch/SiteHeader.tsx', 'w').write('/* eslint-disable */\n// Generisano iz Stitch HTML-a (port.py)\n' + hdr_mod)
    print('-> SiteHeader.tsx')
    ftr = replace_el(ftr, 'div', ['w-9 h-9 rounded-lg bg-primary', '>M<'], '<img src="/mtto-logo.svg" alt="MTTO HNK" className="h-10 w-auto" />')
    ftr = re.sub(r'© 2025', '© 2026', ftr)
    write('SiteFooter.tsx', [component('SiteFooter', ftr, '')])


def home():
    body, kids, secs = main_sections(HOME)
    s1, s2, s3, s4, s5 = [j(x) for x in secs]
    # S1 hero: provjerene brojke
    s1 = sub(s1, '>230k+<', '>222 tis.<')
    s1 = sub(s1, 'Stanovnika kantona', 'Stanovnika (popis 2013.)')
    s1 = sub(s1, '>4</span>\n<p className="font-body-sm text-body-sm text-surface-variant">Rezervata prirode', '>2</span>\n<p className="font-body-sm text-body-sm text-surface-variant">Parka prirode')
    s1 = sub(s1, '<span className="font-bold text-on-primary">Danas, 10:00 h</span>', '<span className="font-bold text-on-primary">{props.updated}</span>')
    s1 = sub(s1, 'href="#eko-monitoring-live"', 'href="#eko-monitoring-live"')
    # S2 brzi servisi
    s2 = sub(s2, 'href="#natjecaji-panel"', 'href="/vijesti?type=JAVNI_POZIV"')
    s2 = sub(s2, '>3 OTVORENA<', '>{props.callsBadge}<')
    s2 = sub(s2, 'href="#registri-resori"', 'href="/propisi?docType=OBRAZAC"', expect=None)
    s2 = s2.replace('href="/propisi?docType=OBRAZAC">\n<div className="w-12 h-12 rounded-lg bg-emerald-light', 'href="/turisticki-vodici">\n<div className="w-12 h-12 rounded-lg bg-emerald-light')
    s2 = sub(s2, 'href="#neradna-nedjelja"', 'href="/propisi?q=nedjelj"')
    # S3 vijesti i pozivi
    s3 = sub(s3, 'href="#">\n<span>Sve vijesti</span>', 'href="/vijesti">\n<span>Sve vijesti</span>')
    s3 = replace_el(s3, 'article', 'PREKRETNICA ZA TURIZAM', '{props.lead}')
    s3 = replace_el(s3, 'div', ['grid grid-cols-1 md:grid-cols-2 gap-space-md', 'Jednaka pravila za sve'], '{props.cards}')
    s3 = replace_el(s3, 'div', 'Plato Rujišta - Bijela', '')
    s3 = replace_el(s3, 'div', 'Vrtaljica', '')
    s3 = replace_el(s3, 'div', ['Plan upravljanja otpadom HNŽ/HNK 2025–2030', 'Otvori nacrt'], '{props.calls}')
    s3 = sub(s3, 'Natječaji i Javni Uvidi', 'Javni pozivi i uvidi')
    s3 = sub(s3, 'href="#">\n            Arhiva svih natječaja i odluka (2018–2025)', 'href="/vijesti?type=JAVNI_POZIV">\n            Arhiva javnih poziva')
    s3 = sub(s3, 'Rad sa strankama u zgradi Vlade HNŽ svakim radnim danom 08:30 – 12:00 h.', 'Rad sa strankama: Braće Fejića bb, 88000 Mostar. Centrala Ministarstva:')
    # S4 eko-monitoring: dizajn ostaje, podaci označeni kao demo
    s4 = sub(s4, 'Automatski Eko-Monitoring Uživo', f'Automatski Eko-Monitoring Uživo {DEMO}')
    s4 = sub(s4, '<h3 className="font-headline-sm text-headline-sm font-bold text-primary">Građanski Eko-Alarm</h3>', f'<h3 className="font-headline-sm text-headline-sm font-bold text-primary">Građanski Eko-Alarm {FAZA2}</h3>')
    s4 = sub(s4, '<form className="space-y-space-sm" id="eko-alarm-form">', '<form className="space-y-space-sm" id="eko-alarm-form" action="/e-usluge/eko-prijava" method="get">')
    # S5 zaštićena područja: ispravke činjenica + prava mapa + dinamični poziv
    s5 = sub(s5, 'planove upravljanja za 4 proglašena zaštićena krajolika.', 'planove upravljanja zaštićenim područjima kantona.')
    s5 = sub(s5, '<span>Sufinanciranje: <strong>80.000 KM</strong></span>', '<span>Kategorija: <strong>Park prirode</strong></span>')
    s5 = sub(s5, '<span>Čuvarska služba: <strong>Aktivna 24/7</strong></span>', '<span>Ramsar lokalitet: <strong>od 2001.</strong></span>')
    s5 = sub(s5, '>UNESCO Baština<', '>UNESCO tentativna lista<')
    s5 = sub(s5, 'upisana na UNESCO popis svjetske prirodne baštine 2024.', 'na UNESCO tentativnoj listi svjetske baštine.')
    s5 = sub(s5, '<span>Zaštitni pojas: <strong>I. Kategorija</strong></span>', '<span>Općina: <strong>Ravno</strong></span>')
    s5 = sub(s5, '<span>Kvaliteta vode: <strong>I. Klasa</strong></span>', '<span>Općina: <strong>Konjic</strong></span>')
    s5 = replace_el(s5, 'div', 'id="gis-eko-karta"', '{props.map}', innermost=False)
    s5 = sub(s5, 'Prijave za ispitni rok Proljeće 2025.', 'Prijave i ispitni rokovi Sektora za turizam.')
    s5 = replace_el(s5, 'div', ['Javni Poziv za Sufinanciranje Projekata Održivog Turizma', 'Kriteriji & Upute (PDF)'], '{props.cta}', innermost=True)
    write('Home.tsx', [component('HomeHero', s1), component('HomeServices', s2), component('HomeNews', s3), component('HomeEko', s4), component('HomeNature', s5)])


def build():
    shell()
    home()


def propisi():
    body, kids, secs = main_sections('propisi_zakoni_i_obrasci_zahtjeva_novi_mtto_dizajn_desktop')
    s1, s2, s3, s4, s5 = [j(x) for x in secs[:5]]
    s1 = sub(s1, '14. Travnja 2026.', '{props.updated}')
    for old, key in [('>24</p>', 'zakoni'), ('>68</p>', 'pravilnici'), ('>32</p>', 'obrasci')]:
        s1 = sub(s1, old, f'>{{props.n.{key}}}</p>')
    s2 = replace_el(s2, 'div', ['grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md', 'OBRAZAC 01'], '{props.forms}', innermost=True)
    s3 = replace_el(s3, 'div', 'id="tabContainer"', '{props.tabs}', innermost=False)
    s3 = replace_el(s3, 'input', 'id="propisSearch"', '{props.search}')
    s3 = replace_el(s3, 'tbody', 'law-row', '{props.rows}', innermost=False)
    s4 = sub(s4, 'Broj depozitnog računa HNŽ:', 'Primjer uplate (demo):')
    s4 = re.sub(r'3380002200005953', 'XXXX-XXXX-XXXX', s4)
    s5 = sub(s5, '+387 (0)36 514-700', '+387 36 551 823')
    s5 = s5.replace('protokol@mtto-hnz-k.ba', 'info@mtto.gov.ba').replace('zospi@mtto-hnz-k.ba', 'kabinetministarstva@mtto.gov.ba')
    s5 = sub(s5, 'Pretraga statusa Vašeg podneska', f'Pretraga statusa Vašeg podneska {FAZA2}')
    write('Propisi.tsx', [component('PropisiHero', s1), component('PropisiForms', s2), component('PropisiTable', s3), component('PropisiHowTo', s4), component('PropisiContact', s5)])


def permits():
    body, kids, secs = main_sections('detaljni_registar_okoli_nih_dozvola_novi_mtto_dizajn_desktop')
    s1, s2, s3, s4, s5, s6, s7 = [j(x) for x in secs[:7]]
    s1 = re.sub(r'Ažurirano: 14\.10\.2025\. 08:30 CET', 'Ažurirano: {props.updated}', s1)
    for old, key in [('>142</span>', 'total'), ('>68</span>', 'Industrija'), ('>34</span>', 'Energetika'), ('>26</span>', 'Otpad'), ('>14</span>', 'Turizam'), ('>09</span>', 'renewal')]:
        s2 = sub(s2, old, f'>{{props.n.{key}}}</span>')
    for w, key in [('w-[48%]', 'Industrija'), ('w-[24%]', 'Energetika'), ('w-[18%]', 'Otpad'), ('w-[10%]', 'Turizam')]:
        s2 = sub(s2, f'h-full {w}"', f'h-full" style={{{{ width: props.pct.{key} }}}}')
    s3 = replace_el(s3, 'form', 'id="filterForm"', '{props.form}', innermost=False)
    s3 = replace_el(s3, 'div', ['Aktivni filtri:', 'Očisti sve'], '{props.pills}')
    s3 = sub(s3, 'Pretraga po svim pravomoćnim rješenjima od 2018. do 2025.', 'Pretraga po svim rješenjima u evidenciji')
    s4 = sub(s4, 'Prikazano 6 od ukupno 142 pravosnažna rješenja u evidenciji', 'Prikazano {props.shown} od ukupno {props.total} rješenja u evidenciji')
    s4 = replace_el(s4, 'tbody', 'UPI/05-20-412/23', '{props.rows}', innermost=False)
    s4 = sub(s4, '<span>Prikaz zapisa 1 do 6 od 142 ukupno</span>', '<span>Prikaz zapisa 1 do {props.shown} od {props.total} ukupno</span>')
    s4 = replace_el(s4, 'div', ['flex items-center gap-1', 'chevron_left'], '')
    s4 = replace_el(s4, 'button', 'Kartični prikaz', '')
    s7 = s7.replace('Open Data Portal FBiH kompatibilno', 'Otvoreni podaci')
    s7 = replace_el(s7, 'a', 'Registar XLSX', '<a className="bg-surface-container-lowest hover:bg-surface-container p-space-md rounded-xl shadow-sm flex items-center justify-between gap-space-sm transition-all group" href="/registri/okolisne-dozvole/izvoz?format=csv"><div className="flex items-center gap-space-sm"><div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors"><span className="material-symbols-outlined text-[22px]">table_chart</span></div><div className="flex flex-col"><span className="font-title-md text-body-regular font-bold text-text-heading">Registar za Excel</span><span className="text-[12px] text-outline">CSV, otvara se u Excelu</span></div></div><span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">download</span></a>')
    s7 = replace_el(s7, 'a', 'Dataset CSV', lambda x: x.replace('href="#"', 'href="/registri/okolisne-dozvole/izvoz?format=csv"').replace('Strojno čitljivo UTF-8 (850 KB)', 'Strojno čitljivo, UTF-8'))
    s7 = replace_el(s7, 'a', 'WFS / WMS Sloj', lambda x: x.replace('OGC Geoprostorni servis', 'OGC geoprostorni servis · Faza 2'))
    s7 = replace_el(s7, 'a', 'REST API JSON', lambda x: x.replace('href="#"', 'href="/registri/okolisne-dozvole/izvoz?format=json"'))
    s7 = re.sub(r" style=\{\{backgroundColor: '#00abeb', color: '#ffffff', fontFamily: \"'Roboto Condensed', sans-serif\", fontWeight: '700'\}\}", '', s7)
    write('Permits.tsx', [component('PermitsCrumb', s1), component('PermitsHero', s2), component('PermitsFilter', s3), component('PermitsTable', s4), component('PermitsRights', s6), component('PermitsOpenData', s7)])


_old_build = build
def build():
    _old_build()
    propisi()
    permits()


def dossier():
    body, kids, secs = main_sections('dossier_okoli_ne_dozvole_aluminij_industrija_d.o.o._desktop')
    s = j(secs[1])
    s = sub(s, '>ID-ENV-2023-412</span>', '>{props.reg}</span>')
    s = re.sub(r'Registar sinkroniziran: Danas u 06:00', 'Ažurirano: {props.updated}', s)
    s = replace_el(s, 'button', 'Ispiši dossier', '')
    s = replace_el(s, 'div', ['VAŽEĆA DOZVOLA', 'Geolokacijski verifikovano'], '{props.badges}')
    s = sub(s, 'Klasa: UPI/05-20-412/23', 'Klasa: {props.reg}')
    s = replace_el(s, 'h1', 'Aluminij Industrija d.o.o.', '<h1 className="font-headline-lg text-headline-lg text-institutional-navy-deep tracking-tight">{props.title}</h1>')
    s = replace_el(s, 'p', 'JIB:', '{props.meta}')
    s = replace_el(s, 'div', ['Preuzmi Rješenje', 'Prijavi nepravilnost'], '{props.actions}')
    s = replace_el(s, 'div', ['Broj Rješenja', 'Nadležno Tijelo'], '{props.stats}')
    # sekcije 01–04: nema izvora podataka → Demo
    s = s.replace('</h2>', f' {DEMO}</h2>')
    s = sub(s, '<div className="lg:col-span-8 space-y-space-xl">', '<div className="lg:col-span-8 space-y-space-xl">{props.intro}')
    s = s.replace('id="monitoringTabs"', 'id="monitoringTabs"')
    # sidebar
    s = replace_el(s, 'div', ['Lokacija i Zaštitni Pojas', 'Otvori na Geoportalu'], '{props.map}')
    s = sub(s, '<span>Ovlašteno Osoblje & Standardi</span>', f'<span>Ovlašteno osoblje i standardi</span> {DEMO}')
    s = sub(s, 'dipl. ing. Emir Kapić', 'Ime i prezime (primjer)')
    s = sub(s, 'kem. tehnologija (Br. licence 04-22)', 'Struka i broj licence')
    s = sub(s, '>EK<', '>EM<') if '>EK<' in s else s.replace('\n              EK\n', '\n              EM\n')
    s = s.replace('ekologija@aluminij.ba', 'ekologija@operater.ba').replace('+387 (0)36 397 500', '+387 36 000 000')
    s = sub(s, '<h3 className="font-title-md text-title-md text-institutional-navy-deep">Aarhuška Konvencija</h3>', f'<h3 className="font-title-md text-title-md text-institutional-navy-deep">Aarhuška konvencija {FAZA2}</h3>')
    s = s.replace('<span>Povezana Rješenja i Suglasnosti</span>', f'<span>Povezana rješenja i suglasnosti</span> {DEMO}')
    for a, b in [('Federalni agromediteranski zavod Mostar & Institut Kemal Kapetanović Zenica', 'akreditirani laboratorij (primjer)'), ('Remondis GmbH / Delta', 'ovlašteni operater (primjer)'), ('Alu-Recycling d.o.o.', 'ovlašteni reciklažer (primjer)')]:
        s = s.replace(a, b)
    s = s.replace('<form className="space-y-space-xs">', '<form className="space-y-space-xs" action="/o-nama#upit">')
    write('Dossier.tsx', [component('DossierBody', s)])


_old_build2 = build
def build():
    _old_build2()
    dossier()


def facilities():
    body, kids, secs = main_sections('registar_kategoriziranih_ugostiteljskih_objekata_desktop')
    s1, s2, s3, s4, s5 = [j(x) for x in secs[:5]]
    for old, key in [('>1.280<', 'total'), ('>18.450<', 'beds'), ('>42<', 'hotels'), ('>86<', 'motels'), ('>1.152<', 'private')]:
        s2 = sub(s2, old, f'>{{props.n.{key}}}<')
    s3 = replace_el(s3, 'div', ['searchInput', 'btnResetFilters'], '{props.form}', innermost=True)
    s3 = replace_el(s3, 'span', ['matchCount', 'Prikazano'], '<span>Prikazano: <strong className="text-primary font-bold">{props.shown}</strong> od <strong>{props.total}</strong> rješenja</span>')
    s3 = re.sub(r'Podaci ažurirani na dan: 04\.03\.2025\.', 'Podaci ažurirani: {props.updated}', s3)
    s4 = replace_el(s4, 'tbody', 'id="tableBody"', '{props.rows}', innermost=False)
    s4 = replace_el(s4, 'div', ['Stranica 1 od 214', 'Sljedeća'], '', innermost=True)
    s5 = re.sub(r'href="#"', 'href="/propisi?docType=PRAVILNIK"', s5)
    write('Facilities.tsx', [component('FacHero', s1), component('FacStats', s2), component('FacFilter', s3), component('FacTable', s4), component('FacGuide', s5)])


def about():
    body, kids, secs = main_sections('o_nama_i_kontakti_desktop')
    s1, s2, s3, s4, s5, s6, s7 = [j(x) for x in secs[:7]]
    s1 = replace_el(s1, 'span', 'ID Institucije', '') if 'ID Institucije' in s1 else s1
    # Kabinet: bez AI portreta i izmišljenog citata stvarne osobe
    s3 = replace_el(s3, 'img', 'Minister Emil Balavac', '<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-institutional-navy-deep"><img src="/mtto-logo.svg" alt="" className="w-24 h-24 opacity-90" /></div>')
    s3 = sub(s3, 'Mandat 2023–2027', 'Fotografija iz CMS-a')
    s3 = replace_el(s3, 'p', '„Naša je temeljna dužnost', '<p className="font-body-regular text-body-regular text-text-body pt-space-xs">Ministar rukovodi radom Ministarstva i odgovoran je Vladi Hercegovačko-neretvanskog kantona. Izjava ministra i fotografija unose se kroz CMS.</p>')
    s3 = s3.replace('mailto:kabinet@mtto-hnz-k.ba', 'mailto:ministar@mtto.gov.ba').replace('kabinet@mtto-hnz-k.ba', 'ministar@mtto.gov.ba')
    s3 = sub(s3, '+387 36 551 823 (lok. 101)', '+387 36 551 823')
    s3 = sub(s3, '<h4 className="font-title-md text-title-md text-text-heading">Šef Kabineta</h4>', '<h4 className="font-title-md text-title-md text-text-heading">Vesna Krešić, tajnica Ministarstva</h4>')
    s3 = sub(s3, 'Koordinacija resora i protokolarne aktivnosti', 'tajnik@mtto.gov.ba')
    s3 = sub(s3, '+387 36 552 922', '+387 36 552 807')
    s3 = replace_el(s3, 'div', ['Termini za prijem:', 'Četvrtak'], '', innermost=True)
    s3 = sub(s3, 'Strateški stupovi mandata</span>', f'Strateški stupovi mandata</span> {DEMO}')
    # sektori: stvarni rukovodioci i e-mail adrese
    for old, new in [('trgovina@mtto-hnz-k.ba', 'trgovina@mtto.gov.ba'), ('turizam@mtto-hnz-k.ba', 'turizam@mtto.gov.ba'), ('okolis@mtto-hnz-k.ba', 'okolis@mtto.gov.ba'), ('pravna@mtto-hnz-k.ba', 'tajnik@mtto.gov.ba')]:
        s4 = s4.replace(old, new)
    s4 = s4.replace('Pomoćnik ministra:', 'Rukovodilac / kontakt:')
    for old, new in [('Odjel za trgovinu<', 'Nazif Nezirić · 036 551 823<'), ('Odjel za turizam i promociju<', 'Edina Jogunović · 036 552 498<'), ('Odjel za zaštitu okoliša<', 'dr. sc. Zejnil Trešnjo · 036 551 324<'), ('Odjel za pravne i opće poslove<', 'Tajništvo · 036 552 807<')]:
        s4 = sub(s4, '>' + old, '>' + new)
    s5 = sub(s5, '+387 36 550 024', '+387 36 552 103')
    s5 = sub(s5, 'Hitne prijave zagađenja okoliša', 'Inspekcija · Božana Babić')
    s5 = sub(s5, 'Eko-prijave i inspekcijski nadzor', 'Inspekcijski nadzor')
    s5 = replace_el(s5, 'div', 'Pauza za radnike', '', innermost=True) if 'Pauza za radnike' in s5 else s5
    s5 = replace_el(s5, 'div', 'Gradski autobus', '', innermost=True)
    s5 = replace_el(s5, 'div', 'Javni parking', '', innermost=True)
    s5 = re.sub(r'href="https://(www\.)?google[^"]*"', 'href="https://www.google.com/maps/search/?api=1&query=Bra%C4%87e+Fej%C4%87a+bb+Mostar"', s5)
    s6 = s6.replace('<section ', '<section id="upit" ', 1)
    s6 = sub(s6, 'Izravni upit ili Zahtjev za pristup informacijama', f'Izravni upit ili zahtjev za pristup informacijama {FAZA2}')
    s6 = replace_el(s6, 'div', 'form-success-banner', '')
    s6 = re.sub(r'<button([^>]*)type="submit"', r'<button\1type="button" disabled title="Online podnošenje dolazi u Fazi 2. Do tada: info@mtto.gov.ba"', s6)
    s6 = re.sub(r' onSubmit=\{[^}]*\}', '', s6)
    write('About.tsx', [component('AboutCrumb', s1), component('AboutProfile', s2), component('AboutCabinet', s3), component('AboutSectors', s4), component('AboutOffice', s5), component('AboutContact', s6), component('AboutLinks', s7)])


_old_build3 = build
def build():
    _old_build3()
    facilities()
    about()


PUB_F2 = '<div className="max-w-7xl mx-auto px-margin-mobile md:px-margin pt-space-md"><div className="flex items-start gap-space-sm p-space-md rounded-xl bg-herzeg-gold-soft border border-herzeg-gold text-[#786000] font-body-sm text-body-sm"><span className="material-symbols-outlined">science</span><span><strong>Prototip ekrana (Faza 2).</strong> Prikazani su dizajn i primjer podataka. Modul se povezuje sa stvarnom evidencijom u drugoj fazi projekta.</span></div></div>'


def pub_f2(screen, name, fname, wrap=None):
    from html2jsx import top_level_children
    body, kids = load(screen)
    m = [k for k in kids if k.startswith('<main')][0]
    s = j(''.join(top_level_children(m, 'main')))
    s = re.sub(r'[a-z.\-]+@mtto-hnz-k\.ba', 'info@mtto.gov.ba', s)
    s = re.sub(r'\+387 \(0\)36 [0-9 \-]{6,9}', '+387 36 551 823', s)
    s = re.sub(r'\b\d{3} \d{3} \d{3} \d{3} \d{4}\b', 'XXX XXX XXX XXX XXXX (primjer)', s)
    s = s.replace('UniCredit Bank d.d. Mostar', 'Banka (primjer)').replace('Uplata 150 KM administrativne', 'Uplata propisane administrativne')
    s = re.sub(r'<button([^>]*)type="submit"', r'<button\1type="button" disabled title="Online podnošenje: Faza 2"', s)
    s = PUB_F2 + (wrap(s) if wrap else s)
    write(fname, [component(name, s)])


def phase2_public():
    pub_f2('registar_dozvola_za_upravljanje_otpadom_desktop', 'WasteF2', 'WasteRegistry.tsx')
    pub_f2('turisti_ki_vodi_i_i_ugostiteljstvo_desktop', 'GuidesF2', 'Guides.tsx')
    pub_f2('javni_prikaz_foto_albuma_park_prirode_hutovo_blato_mtto_hn', 'AlbumF2', 'Album.tsx')
    pub_f2('e_usluge_eko_prijava_i_arobnjak_zahtjeva_mobile', 'EcoReportF2', 'EcoReport.tsx', lambda s: '<div className="max-w-xl mx-auto py-space-lg px-margin-mobile"><div className="rounded-2xl bg-surface shadow-md p-space-md">' + s.replace('fixed bottom-0 left-0 right-0', 'sticky bottom-0 rounded-xl') + '</div></div>')


_old_build4 = build
def build():
    _old_build4()
    phase2_public()
