#!/usr/bin/env python3
"""Stitch -> TSX port s patchevima. Pokretanje: python3 port.py  (piše u apps/web/components/stitch/)"""
import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from html2jsx import convert, top_level_children

SRC = '/home/claude/stitch/src/stitch_ministry_website_redesign_concepts/'
OUT = '/home/claude/mtto-platform/apps/web/components/stitch/'

ROUTES = {
    'naslovna': '/', 'pocetna': '/', 'o-nama': '/o-nama', 'kontakti': '/o-nama#kontakt', 'kontakt': '/o-nama#kontakt', 'info-i-kontakti': '/o-nama#kontakt',
    'kontakt-i-prijava': '/o-nama#kontakt', 'natjecaji-i-javne-nabavke': '/vijesti?type=JAVNI_POZIV', 'natjecaji': '/vijesti?type=JAVNI_POZIV',
    'natjecaji-javne-nabavke': '/vijesti?type=JAVNI_POZIV', 'fond-okolis': '/vijesti?type=JAVNI_POZIV', 'registar-subvencija': '/vijesti?type=JAVNI_POZIV',
    'vijesti-i-obavijesti': '/vijesti', 'vijesti': '/vijesti', 'vijesti-i-uvidi': '/vijesti', 'javni-uvidi': '/vijesti', 'objave-vijesti': '/vijesti',
    'propisi-i-obrasci': '/propisi', 'propisi-obrasci': '/propisi', 'obrasci-zahtjeva': '/propisi?docType=OBRAZAC', 'zakoni': '/propisi?docType=ZAKON',
    'podzakonski-akti': '/propisi?docType=PRAVILNIK', 'odluke': '/propisi?docType=ODLUKA', 'strategije-i-planovi': '/propisi?docType=IZVJESTAJ',
    'propisi-i-dokumenti': '/propisi', 'prakticna-uputstva': '/propisi?docType=UPUTSTVO', 'javni-uvidi-propisi': '/propisi', 'sluzbeni-glasnik': '/propisi',
    'e-usluge-i-obrasci': '/propisi?docType=OBRAZAC',
    'e-usluge-i-registri': '/registri/okolisne-dozvole', 'e-usluge-registri': '/registri/okolisne-dozvole', 'e-usluge': '/e-usluge/eko-prijava',
    'registri-i-baze-podataka': '/registri/okolisne-dozvole', 'registri': '/registri/okolisne-dozvole', 'ekoloska-dozvola': '/registri/okolisne-dozvole',
    'registar-okolisnih-dozvola': '/registri/okolisne-dozvole', 'registar-okolisa': '/registri/okolisne-dozvole',
    'registri-kategoriziranih-ugostiteljskih-objekata': '/registri/ugostiteljski-objekti', 'ugostiteljstvo': '/registri/ugostiteljski-objekti',
    'baze-podataka-iz-oblasti-turizma-i-ugostiteljstva': '/registri/ugostiteljski-objekti',
    'registar-dozvola-za-upravljanje-otpadom': '/registri/upravljanje-otpadom', 'registar-upravljanja-otpadom': '/registri/upravljanje-otpadom', 'upravljanje-otpadom': '/registri/upravljanje-otpadom',
    'turizam-i-bastina': '/turisticki-vodici', 'turizam-bastina': '/turisticki-vodici', 'turizam-i-priroda': '/foto-albumi/hutovo-blato', 'turizam-vodici': '/turisticki-vodici',
    'turisticki-vodici': '/turisticki-vodici', 'resor-turizam': '/vijesti?category=Turizam', 'turizam-i-ugostiteljstvo': '/turisticki-vodici',
    'zastita-okolisa': '/mapa', 'resor-okolis': '/vijesti?category=Za%C5%A1tita%20okoli%C5%A1a', 'resor-trgovina': '/vijesti?category=Trgovina',
    'trgovina-i-unutarnje-trziste': '/vijesti?category=Trgovina', 'trgovina-i-unutrasnje-trziste': '/vijesti?category=Trgovina',
    'eko-alarm': '/e-usluge/eko-prijava', 'ekoloska-prijava-eko-alarm': '/e-usluge/eko-prijava', 'eko-alarm-prijava': '/e-usluge/eko-prijava',
    'inspekcijski-nadzor': '/o-nama#sektori', 'inspekcija': '/o-nama#sektori',
    'pristup-informacijama': '/o-nama#kontakt', 'sloboda-informacijama': '/o-nama#kontakt', 'sloboda-pristupa-informacijama': '/o-nama#kontakt',
    'mapa-weba': '/mapa', 'pravne-napomene': '/o-nama', 'zastita-privatnosti': '/o-nama', 'politika-privatnosti': '/o-nama', 'uvjeti-koristenja': '/o-nama',
    'uvjeti-koristenja-i-privatnost': '/o-nama', 'pristupacnost': '/o-nama',
    # CMS
    'dashboard': '/admin', 'kontrolna-ploca': '/admin', 'objave': '/admin/objave', 'dokumenti-datoteke': '/admin/dokumenti', 'datoteke': '/admin/dokumenti',
    'resorni-odjeli': '/admin/resorni-odjeli', 'korisnici-permisije': '/admin/korisnici', 'e-pisarnica': '/admin/predmeti', 'sigurnost-revizija': '/admin/korisnici',
    'postavke': '/admin/korisnici',
}
CMS_ROUTES = {  # isti data-path u CMS kontekstu vodi u CMS
    'registar-okolisa': '/admin/registri', 'upravljanje-otpadom': '/admin/registri', 'turizam-vodici': '/admin/mapa', 'javni-uvidi-propisi': '/admin/dokumenti',
    'objave-vijesti': '/admin/objave', 'multimedija': '/admin/multimedija',
}

GLOBAL_TEXT = [
    # netačne ili izmišljene tvrdnje -> neutralno
    ('ISO 9001:2015 Certificirani sustav uprave', 'Službeni portal Vlade HNK'),
    ('+387 (0)36 550-024', '+387 36 551 823'), ('info@mtto-hnz-k.ba', 'info@mtto.gov.ba'), ('info@mtto-hnz.ba', 'info@mtto.gov.ba'),
    ('mr. sc. Asmir K.', 'Urednik MTTO'),
]


def load(screen):
    s = open(SRC + screen + '/code.html', encoding='utf-8').read()
    body = s[s.index('<body'):]
    kids = [k for k in top_level_children(body, 'body') if not k.startswith('<script')]
    return body, kids


def routes_fix(jsx, cms=False):
    def rep(m):
        path = m.group(1)
        href = (CMS_ROUTES.get(path) if cms else None) or ROUTES.get(path) or '#'
        return f'data-path="{path}" href="{href}"'
    jsx = re.sub(r'data-path="([^"]+)" href="#"', rep, jsx)
    jsx = re.sub(r'href="#" data-path="([^"]+)"', lambda m: rep(m), jsx)
    return jsx


def j(fragment, cms=False):
    out = routes_fix(convert(fragment), cms)
    for a, b in GLOBAL_TEXT:
        out = out.replace(a, b)
    return out


# ---------- rad s elementima u JSX stringu ----------
TAG_RE = re.compile(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)\b((?:[^>"\']|"[^"]*"|\'[^\']*\'|\{[^}]*\})*?)(/?)>')


def elements(jsx, tag):
    """Lista (start, end) za svaki element `tag`."""
    out, stack = [], []
    for m in TAG_RE.finditer(jsx):
        closing, name, selfc = m.group(1), m.group(2), m.group(4)
        if name != tag:
            continue
        if selfc:
            out.append((m.start(), m.end())); continue
        if not closing:
            stack.append(m.start())
        elif stack:
            out.append((stack.pop(), m.end()))
    return sorted(out)


def text_of(s):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s))


def replace_el(jsx, tag, contains, new, expect=1, innermost=True):
    """Zamijeni element `tag` koji sadrži tekst `contains`. innermost=True bira najmanji takav element."""
    needles = contains if isinstance(contains, (list, tuple)) else [contains]
    has = lambda seg: all(n in seg or n in text_of(seg) for n in needles)
    cands = [(a, b) for a, b in elements(jsx, tag) if has(jsx[a:b])]
    attrs = [n for n in needles if '="' in n]
    if attrs:  # atribut mora biti u otvarajućem tagu samog elementa
        cands = [(a, b) for a, b in cands if all(n in jsx[a:jsx.index('>', a) + 1] for n in attrs)]
    if innermost:
        cands = [c for c in cands if not any(o != c and c[0] <= o[0] and o[1] <= c[1] for o in cands)]
    if expect is not None and len(cands) != expect:
        raise SystemExit(f'replace_el {tag!r} {contains!r}: nađeno {len(cands)}, očekivano {expect}')
    for a, b in sorted(cands, reverse=True):
        jsx = jsx[:a] + (new(jsx[a:b]) if callable(new) else new) + jsx[b:]
    return jsx


def remove_el(jsx, tag, contains, expect=1, innermost=True):
    return replace_el(jsx, tag, contains, '', expect, innermost)


def sub(jsx, old, new, expect=1):
    n = jsx.count(old)
    if expect is not None and n != expect:
        raise SystemExit(f'sub {old[:60]!r}: nađeno {n}, očekivano {expect}')
    return jsx.replace(old, new)


def component(name, jsx, props='props: any'):
    return f'export function {name}({props}) {{\n  return (\n<>{jsx}</>\n  );\n}}\n'


def write(fname, parts, imports=''):
    head = "/* eslint-disable */\n// Generisano iz Stitch HTML-a: ../../../stitch/port.py (ne uređivati ručno)\n" + imports + '\n'
    open(OUT + fname, 'w', encoding='utf-8').write(head + '\n'.join(parts))
    print('->', fname)


DEMO = '<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-herzeg-gold-soft text-[#786000] border border-herzeg-gold font-label-badge text-label-badge uppercase align-middle" title="Primjer podataka: izvor podataka se povezuje u Fazi 2"><span className="material-symbols-outlined text-[13px]">science</span>Demo</span>'
FAZA2 = '<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-primary border border-slate-border font-label-badge text-label-badge uppercase align-middle" title="Funkcionalnost iz Faze 2: prikazan dizajn"><span className="material-symbols-outlined text-[13px]">schedule</span>Faza 2</span>'

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    import importlib
    for mod in sys.argv[1:] or ['screens_public', 'screens_cms']:
        importlib.import_module(mod).build()
