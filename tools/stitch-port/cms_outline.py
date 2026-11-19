import sys,re; sys.path.insert(0,'.')
from port import load, text_of
from html2jsx import top_level_children
def cms_main(scr):
    body,kids=load(scr)
    inner=top_level_children(kids[1],'div')
    main=[x for x in inner if x.startswith('<main')][0]
    secs=top_level_children(main,'main')
    while len(secs)==1:
        t=secs[0][1:secs[0].index(' ')] if ' ' in secs[0][:12] else secs[0][1:secs[0].index('>')]
        secs=top_level_children(secs[0],t)
    return main,secs
if __name__=='__main__':
    main,secs=cms_main(sys.argv[1])
    d=int(sys.argv[2]) if len(sys.argv)>2 else 1
    for i,s in enumerate(secs):
        print(f'== S{i+1}', s[:s.index('>')+1][:110], len(s), '::', text_of(re.sub(r'<[^>]+>',' ',s))[:int(sys.argv[3]) if len(sys.argv)>3 else 300])
