#!/usr/bin/env python3
"""Pretvara Stitch HTML u JSX. Upotreba: html2jsx.py <code.html> <izlaz.tsx> <ImeKomponente> [--parts]
Sa --parts svaki top-level element <main>-a (i header/footer) postaje zasebna funkcija."""
import sys, re, html
from html.parser import HTMLParser

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr'}
SVG_CASE = {'viewbox':'viewBox','preserveaspectratio':'preserveAspectRatio','gradientunits':'gradientUnits','gradienttransform':'gradientTransform',
  'patternunits':'patternUnits','markerwidth':'markerWidth','markerheight':'markerHeight','refx':'refX','refy':'refY','stddeviation':'stdDeviation',
  'pathlength':'pathLength','textlength':'textLength','lengthadjust':'lengthAdjust','clippathunits':'clipPathUnits','spreadmethod':'spreadMethod'}
ATTR = {'class':'className','for':'htmlFor','tabindex':'tabIndex','readonly':'readOnly','maxlength':'maxLength','colspan':'colSpan','rowspan':'rowSpan',
  'autocomplete':'autoComplete','autofocus':'autoFocus','crossorigin':'crossOrigin','datetime':'dateTime','enctype':'encType','srcset':'srcSet',
  'frameborder':'frameBorder','allowfullscreen':'allowFullScreen','novalidate':'noValidate','contenteditable':'contentEditable','spellcheck':'spellCheck',
  'inputmode':'inputMode','referrerpolicy':'referrerPolicy','fetchpriority':'fetchPriority','xlink:href':'xlinkHref','xml:space':'xmlSpace'}
DROP = re.compile(r'^on[a-z]+$')
BOOL = {'checked','defaultChecked','disabled','required','readOnly','multiple','hidden','open','autoFocus','allowFullScreen','noValidate','controls','autoplay','loop','muted','playsinline','defer','async','selected','novalidate'}
NUM = {'rows','cols','rowSpan','colSpan','maxLength','tabIndex','span','minLength'}
SVG_TAGS = {'lineargradient':'linearGradient','radialgradient':'radialGradient','clippath':'clipPath','foreignobject':'foreignObject','textpath':'textPath',
  'fegaussianblur':'feGaussianBlur','feoffset':'feOffset','feblend':'feBlend','fecolormatrix':'feColorMatrix','feflood':'feFlood','femerge':'feMerge','femergenode':'feMergeNode','fecomposite':'feComposite','fedropshadow':'feDropShadow','animatetransform':'animateTransform'}

def camel(k):
    if k in ATTR: return ATTR[k]
    if k in SVG_CASE: return SVG_CASE[k]
    if k.startswith('data-') or k.startswith('aria-'): return k
    if '-' in k or ':' in k:
        parts = re.split(r'[-:]', k)
        return parts[0] + ''.join(p.capitalize() for p in parts[1:])
    return k

def style_obj(s):
    out = []
    for decl in s.split(';'):
        if ':' not in decl: continue
        k, v = decl.split(':', 1)
        k = k.strip(); v = v.strip()
        if not k: continue
        if k.startswith('--'): key = repr(k)
        else:
            key = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
            if key.startswith('Webkit') is False and k.startswith('-webkit-'): key = 'Webkit' + key[7:]
        out.append(f"{key}: {repr(v)}")
    return '{{' + ', '.join(out) + '}}'

def esc_text(t):
    return t.replace('{', "{'{'}").replace('}', "{'}'}").replace('<', '&lt;').replace('>', '&gt;')

class Conv(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.skip = 0
        self.stack = []
    def handle_starttag(self, tag, attrs):
        if self.skip or tag in ('script', 'style'):
            if tag in ('script', 'style'): self.skip += 1
            return
        parts = []
        for k, v in attrs:
            if DROP.match(k): continue
            nk = camel(k)
            if tag == 'input' and k == 'value': nk = 'defaultValue'
            if tag in ('input',) and k == 'checked': nk = 'defaultChecked'
            if tag == 'option' and k == 'selected': continue
            if tag == 'textarea' and k == 'value': nk = 'defaultValue'
            if k == 'style' and v is not None:
                parts.append(f'style={style_obj(v)}'); continue
            if nk in BOOL:
                if v is None or v == '' or v.lower() in ('true', nk.lower(), k): parts.append(f'{nk}')
                continue
            if v is None:
                parts.append(f'{nk}'); continue
            v = html.unescape(v)
            if nk in NUM and re.fullmatch(r'-?\d+', v.strip()):
                parts.append(f'{nk}={{{v.strip()}}}'); continue
            parts.append(f'{nk}={{{repr(v)}}}' if ('"' in v or '\\' in v) else f'{nk}="{v}"')
        a = (' ' + ' '.join(parts)) if parts else ''
        tag = SVG_TAGS.get(tag, tag)
        if tag in VOID:
            self.out.append(f'<{tag}{a} />')
        else:
            self.out.append(f'<{tag}{a}>')
            self.stack.append(tag)
    def handle_startendtag(self, tag, attrs):
        if self.skip: return
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.out.append(f'</{tag}>'); self.stack.pop()
    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip = max(0, self.skip - 1); return
        if self.skip or tag in VOID: return
        if tag == 'textarea' and self.out and self.out[-1].startswith('<textarea'):
            pass
        tag = SVG_TAGS.get(tag, tag)
        while self.stack:
            t = self.stack.pop()
            self.out.append(f'</{t}>')
            if t == tag: break
    def handle_data(self, data):
        if self.skip: return
        if self.stack and self.stack[-1] == 'textarea':
            if data.strip(): self.out[-1] = self.out[-1][:-1] + f' defaultValue={{{repr(data.strip())}}}>'
            return
        self.out.append(esc_text(data))
    def handle_comment(self, data):
        pass

def convert(fragment):
    c = Conv(); c.feed(fragment); c.close()
    s = ''.join(c.out)
    s = re.sub(r'\n\s*\n', '\n', s)
    return s

def top_level_children(markup, tag):
    """Vraća listu top-level elemenata unutar prvog <tag>...</tag>."""
    m = re.search(rf'<{tag}\b[^>]*>', markup)
    if not m: return []
    i = m.end(); depth = 0; items = []; start = None
    tok = re.compile(r'<(/?)([a-zA-Z0-9]+)\b[^>]*?(/?)>|<!--.*?-->', re.S)
    for t in tok.finditer(markup, i):
        if t.group(0).startswith('<!--'): continue
        closing, name, selfc = t.group(1), t.group(2).lower(), t.group(3)
        if name in VOID or selfc:
            if depth == 0 and not closing: items.append(t.group(0))
            continue
        if not closing:
            if depth == 0: start = t.start()
            depth += 1
        else:
            if depth == 0 and name == tag: break
            depth -= 1
            if depth == 0 and start is not None:
                items.append(markup[start:t.end()]); start = None
    return items

if __name__ == '__main__':
    src, dst, name = sys.argv[1], sys.argv[2], sys.argv[3]
    s = open(src, encoding='utf-8').read()
    body = s[s.index('<body'):]
    if '--parts' in sys.argv:
        pieces = []
        hdr = re.search(r'<header\b.*?</header>', body, re.S)
        ftr = re.search(r'<footer\b.*?</footer>', body, re.S)
        main = re.search(r'<main\b.*?</main>', body, re.S)
        mainm = main.group(0) if main else body
        kids = top_level_children(mainm, 'main')
        if len(kids) == 1 and kids[0].startswith('<div'):
            inner = top_level_children(kids[0], 'div')
            if len(inner) > 1: kids = inner
        out = ['/* eslint-disable */', '// Automatski generisano iz Stitch HTML-a (html2jsx.py)', '']
        if hdr: out.append(f'export function {name}Header() {{\n  return (\n{convert(hdr.group(0))}\n  );\n}}\n')
        for i, k in enumerate(kids, 1):
            out.append(f'export function {name}S{i}() {{\n  return (\n<>{convert(k)}</>\n  );\n}}\n')
        if ftr: out.append(f'export function {name}Footer() {{\n  return (\n{convert(ftr.group(0))}\n  );\n}}\n')
        open(dst, 'w', encoding='utf-8').write('\n'.join(out))
        print(f'{len(kids)} sekcija', 'header' if hdr else '', 'footer' if ftr else '')
    else:
        inner = re.sub(r'^<body[^>]*>|</body>\s*</html>\s*$', '', body.strip(), flags=re.S)
        open(dst, 'w', encoding='utf-8').write(f'/* eslint-disable */\nexport default function {name}() {{\n  return (\n<>{convert(inner)}</>\n  );\n}}\n')
