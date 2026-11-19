import sys,re; sys.path.insert(0,'.')
from screens_public import main_sections
from port import j, text_of
from html2jsx import top_level_children
scr=sys.argv[1]; depth=int(sys.argv[2]) if len(sys.argv)>2 else 2
body,kids,secs=main_sections(scr)
def show(frag,d,ind):
    for k in top_level_children('<x>'+frag+'</x>','x'):
        m=re.match(r'<(\w+)([^>]*)>',k); tag=m.group(1); cls=re.search(r'class="([^"]*)"',m.group(2)); idm=re.search(r'id="([^"]*)"',m.group(2))
        t=text_of(re.sub(r'<[^>]+>',' ',k)).strip()
        print(f'{ind}<{tag}{" #"+idm.group(1) if idm else ""}> {len(k)}b :: {t[:110]}')
        if d>1:
            inner=re.sub(r'^<[^>]+>|</\w+>\s*$','',k.strip(),flags=re.S)
            show(inner,d-1,ind+'   ')
for i,s in enumerate(secs,1):
    print(f'== S{i}'); show(s,depth,'  ')
