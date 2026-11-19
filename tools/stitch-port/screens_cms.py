import re
from port import *  # noqa
from cms_outline import cms_main

OUT_SUB = 'cms/'


def dashboard():
    main, secs = cms_main('cms_kontrolna_plo_a_mtto_hn_hnk')
    s = j(secs[0])
    s = sub(s, 'w-full px-space-lg py-space-md space-y-space-lg', 'w-full space-y-space-lg')
    s = re.sub(r'Danas, 10:54 · Server Mostar-Centar', '{props.now} · Render Frankfurt', s)
    s = s.replace('Konzola Glavnog Administratora', 'Konzola administratora')
    s = s.replace('Geoportal HNŽ Sinkroniziran', 'Baza sinkronizirana')
    s = replace_el(s, 'button', 'Sinkroniziraj Geoportal', '<a className="flex items-center gap-space-xs px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-variant text-institutional-navy-deep font-button text-button transition-colors" href="/" target="_blank" rel="noopener"><span className="material-symbols-outlined text-[18px] text-primary-container">open_in_new</span><span>Otvori javni portal</span></a>')
    # izvoz
    s = replace_el(s, 'a', 'Zbirni Dnevni Izveštaj', '<a className="flex items-center gap-2 px-3 py-2 font-body-sm text-body-sm text-text-heading hover:bg-surface-container-low" href="/registri/okolisne-dozvole/izvoz?format=csv"><span className="material-symbols-outlined text-secondary text-[18px]">table_view</span>Registar dozvola (CSV)</a>')
    s = replace_el(s, 'a', 'Baza Registara (XLSX)', '<a className="flex items-center gap-2 px-3 py-2 font-body-sm text-body-sm text-text-heading hover:bg-surface-container-low" href="/registri/okolisne-dozvole/izvoz?format=json"><span className="material-symbols-outlined text-primary-container text-[18px]">data_object</span>Registar dozvola (JSON)</a>')
    s = replace_el(s, 'a', 'GeoJSON Slojevi', '<a className="flex items-center gap-2 px-3 py-2 font-body-sm text-body-sm text-outline" href="/admin/mapa"><span className="material-symbols-outlined text-[18px]">database</span>GeoJSON slojevi · Faza 2</a>')
    for needle, href, label in [('Okolišna dozvola (UPI)', '/admin/registri', None), ('Operater otpada', '/registri/upravljanje-otpadom', ' · Faza 2'), ('MTU rješenje', '/registri/ugostiteljski-objekti', ' · Faza 2'), ('Licencirani turistički vodič', '/turisticki-vodici', ' · Faza 2'), ('Propis / Objava u Glasniku', '/admin/dokumenti', None)]:
        s = replace_el(s, 'a', needle, lambda x, h=href, l=label: x.replace('href="#"', f'href="{h}"').replace('</a>', (f'<span className="ml-auto font-label-badge text-[10px] text-outline uppercase">{l.strip(" ·")}</span>' if l else '') + '</a>'))
    s = replace_el(s, 'div', ['Pozornost resora zaštite okoliša', 'Pregledaj isteke'], '{props.alert}', innermost=True)
    s = re.sub(r'Stanje baze: 26\. veljače 2026\.', 'Stanje baze: {props.date}', s)
    s = s.replace('Ažurirano svakih 5 min', 'Osvježava se svakih 15 s')
    s = replace_el(s, 'div', ['Registar A-1', 'Hitna revizija'], '{props.cardPermits}', innermost=True)
    s = replace_el(s, 'div', ['Katalog HNŽ', 'Sortirnice'], lambda x: x.replace('Operateri otpada</span>', f'Operateri otpada</span> {DEMO}', 1), innermost=True)
    s = replace_el(s, 'div', ['MTU Standard', 'Čeka očev'], '{props.cardFacilities}', innermost=True)
    s = replace_el(s, 'div', ['Reg. Vodiča', 'Strani jezici'], lambda x: x.replace('Turistički vodiči</span>', f'Turistički vodiči</span> {DEMO}', 1), innermost=True)
    s = replace_el(s, 'div', ['Upravni postupak', 'Zakonski rok'], '{props.cardPosts}', innermost=True)
    s = sub(s, 'Hitni radni nalozi & Odobrenja u tijeku', f'Hitni radni nalozi i odobrenja u tijeku {FAZA2}')
    for a, b in [('mr. Emir Kapić', 'referent okoliša'), ('Sanja Perić', 'referent za otpad'), ('Davor Vujica', 'referent turizma'), ('Goran Marić', 'referent turizma'), ('Tarik Spahić (Mostar)', 'Kandidat (primjer)'), ('Grand Hotel Neum d.o.o.', 'Hotel (primjer) d.o.o.'), ('Aluminij Industrija d.o.o.', 'Industrija (primjer) d.o.o.'), ('Eko-Sirovine d.o.o. Konjic', 'Operater otpada (primjer)')]:
        s = s.replace(a, b)
    s = s.replace('Inspekcijski nalazi u veljači', f'Inspekcijski nalazi {DEMO}', 1)
    s = s.replace('Sloj zaštićenih područja prirode', f'Sloj zaštićenih područja prirode {FAZA2}', 1)
    s = s.replace('142 dozvole · GVE pragovi · GIS', '{props.n.permits} dozvola · rješenja · mapa')
    s = s.replace('314 vodiča · 1.280 objekata', '{props.n.facilities} kategoriziranih objekata')
    s = s.replace('24 aktivna službenika · 4 sektora', 'Uloge i prava pristupa · Faza 2')
    s = replace_el(s, 'div', ['Amina Hadžić', 'Cijeli sigurnosni dnevnik'], '{props.audit}', innermost=True)
    s = replace_el(s, 'div', ['Kvaliteta zraka', 'Mjerenje u 10:00h'], lambda x: x.replace('Kvaliteta zraka & Hidrologija', f'Kvaliteta zraka i hidrologija {DEMO}', 1), innermost=True)
    s = re.sub(r'href="#"', 'href="/admin/predmeti"', s)
    for needle, href in [('Registar Zaštite Okoliša', '/admin/registri'), ('Upravljanje Otpadom</span>', '/registri/upravljanje-otpadom'), ('Turizam & MTU Standardi', '/registri/ugostiteljski-objekti'), ('Javni Uvidi & Propisi', '/admin/dokumenti'), ('Korisnici i Permisije', '/admin/korisnici')]:
        s = replace_el(s, 'a', needle, lambda x, h=href: x.replace('href="/admin/predmeti"', f'href="{h}"', 1), innermost=True)
    write(OUT_SUB + 'Dashboard.tsx', [component('DashboardBody', s)])


def build():
    dashboard()


F2_BANNER = '<div className="flex items-start gap-space-sm p-space-md mb-space-lg rounded-xl bg-surface-container-high border border-slate-border text-primary font-body-sm text-body-sm"><span className="material-symbols-outlined">schedule</span><span><strong>Faza 2 · prototip ekrana.</strong> Prikazan je odobreni dizajn modula s primjerom podataka. Funkcionalnost se razvija u drugoj fazi projekta.</span></div>'


def f2_screen(screen, name, fname, people=(), extra=None):
    main, secs = cms_main(screen)
    from html2jsx import top_level_children
    inner = top_level_children(main, 'main')
    s = j(''.join(inner))
    for a, b in people:
        s = s.replace(a, b)
    s = re.sub(r'src="https://lh3[^"]*"', 'src="/placeholder-mtto.svg"', s)
    s = re.sub(r"url\('https://lh3[^']*'\)", "url('/placeholder-mtto.svg')", s)
    s = clean(s)
    if extra:
        s = extra(s)
    s = '<div className="-mx-space-md lg:-mx-space-lg -mt-space-xl">' + '<div className="px-space-md lg:px-space-lg pt-space-lg">' + F2_BANNER + '</div>' + s + '</div>'
    write(OUT_SUB + fname, [component(name, s)])


PEOPLE = [('dr. sc. Asmir K.', 'Administrator (primjer)'), ('mr. sc. Meliha K.', 'Rukovodilac okoliša (primjer)'), ('dipl. ing. Kemal B.', 'Inspektor (primjer)'), ('dipl. oec. Darko P.', 'Rukovodilac turizma (primjer)'), ('dipl. iur. Ivana B.', 'Referent protokola (primjer)'), ('mr. Senad Dž.', 'Vanjski član (primjer)'), ('mr. iur. Zoran N.', 'Pravnik (primjer)'), ('dr. sc. Emil B.', 'Ministar'), ('mr. sc. Asmir K.', 'Urednik MTTO'), ('mr. Emira Kapića', 'referenta (primjer)'), ('mr. Emir Kapić', 'referent (primjer)'), ('Aluminij Industrija d.o.o.', 'Industrija (primjer) d.o.o.'), ('Grand Hotel Neum', 'Hotel (primjer)')]


def clean(s):
    for a, b in PEOPLE:
        s = s.replace(a, b)
    s = re.sub(r'[a-z.\-]+@mtto-hnz-k\.ba', 'ime.prezime@mtto.gov.ba', s)
    s = s.replace('ISO 27001 / ZOSPI Usklađeno', 'Uloge i prava (RBAC)')
    return s.replace('@mtto-hnz-k.ba', '@mtto.gov.ba')


def phase2():
    f2_screen('cms_upravljanje_multimedijom_i_fotogalerijama_mtto_hn_hnk', 'MediaF2', 'Multimedija.tsx')
    f2_screen('korisnici_i_permisije_rbac_mtto_hn_hnk', 'UsersF2', 'Korisnici.tsx')
    f2_screen('resorni_odjeli_i_radni_tokovi_mtto_hn_hnk', 'DepartmentsF2', 'ResorniOdjeli.tsx')
    body, kids = load('cms_obrada_predmeta_i_e_potpis_aluminij_oko_2026_904')
    m = [k for k in kids if k.startswith('<main')][0]
    from html2jsx import top_level_children
    s = j(''.join(top_level_children(m, 'main')))
    s = re.sub(r'src="https://lh3[^"]*"', 'src="/placeholder-mtto.svg"', s)
    s = clean(s).replace('fixed bottom-0 left-0 right-0 z-40', 'sticky bottom-0 z-30 rounded-xl mt-space-md')
    s = '<div className="max-w-3xl mx-auto">' + F2_BANNER + '<div className="rounded-2xl bg-surface p-space-md shadow-sm">' + s + '</div></div>'
    write(OUT_SUB + 'Predmeti.tsx', [component('CasesF2', s)])


_b = build
def build():
    _b()
    phase2()
