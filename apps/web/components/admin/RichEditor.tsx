'use client';
/**
 * F2-02: editor sadržaja s blokovima (Tiptap). Sprema HTML koji portal čisti pri prikazu (lib/markdown.ts → renderBody).
 * Blokovi: podnaslovi, liste, citat, tabela, slika (obavezan alternativni tekst), napomena/upozorenje, dokument iz priloga, linija.
 * Starije objave u Markdownu se pri otvaranju pretvaraju u HTML.
 */
import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { marked } from 'marked';
import {
  AlertTriangle, Bold01, ChevronDown, Dotpoints01, File06, FlipBackward, FlipForward, Heading01, Heading02, Image01, InfoCircle, Italic01,
  Link01, List, MessageTextSquare01, Minus, Plus, Strikethrough01, Table, Trash01, Underline01,
} from '@untitledui/icons';

export type EditorDoc = { id: string; title: string; fileName: string; size: number };

/** Blok „napomena“: <aside data-tone="info|warning|success">…</aside> */
const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() {
    return { tone: { default: 'info', parseHTML: (el) => el.getAttribute('data-tone') ?? 'info', renderHTML: (a) => ({ 'data-tone': a.tone }) } };
  },
  parseHTML() { return [{ tag: 'aside[data-tone]' }]; },
  renderHTML({ HTMLAttributes }) { return ['aside', mergeAttributes(HTMLAttributes), 0]; },
});

/** Blok „dokument“: kartica za preuzimanje priloga objave. */
const DocLink = Node.create({
  name: 'docLink',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      id: { default: null, parseHTML: (el) => el.getAttribute('data-doc-id') },
      title: { default: 'Dokument', parseHTML: (el) => el.textContent ?? 'Dokument' },
    };
  },
  parseHTML() { return [{ tag: 'a[data-doc-id]' }]; },
  renderHTML({ node }) {
    return ['a', { 'data-doc-id': node.attrs.id, href: `/api/documents/${node.attrs.id}/file`, class: 'doc-card' }, node.attrs.title];
  },
});

const isHtml = (s: string) => /^\s*</.test(s);
export function toEditorHtml(body: string) {
  if (!body) return '';
  return isHtml(body) ? body : (marked.parse(body, { async: false, breaks: true }) as string);
}

function safeUrl(u: string) {
  const v = u.trim();
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(v)) return v;
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(v)) return `https://${v}`;
  return null;
}

const btn = 'inline-flex size-8 items-center justify-center rounded-[6px] text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717] disabled:opacity-40 aria-pressed:bg-[#f4ebff] aria-pressed:text-[#6941c6] [&_svg]:size-[18px]';
const sep = <span aria-hidden className="mx-1 h-5 w-px bg-[#e5e5e5]" />;

function Toolbar({ editor, docs, onUpload, onError }: { editor: Editor; docs: EditorDoc[]; onUpload: (f: File) => Promise<string | null>; onError: (m: string) => void }) {
  const [menu, setMenu] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'), italic: e.isActive('italic'), underline: e.isActive('underline'), strike: e.isActive('strike'),
      h2: e.isActive('heading', { level: 2 }), h3: e.isActive('heading', { level: 3 }), ul: e.isActive('bulletList'), ol: e.isActive('orderedList'),
      quote: e.isActive('blockquote'), link: e.isActive('link'), table: e.isActive('table'), undo: e.can().undo(), redo: e.can().redo(),
    }),
  });
  const c = () => editor.chain().focus();
  const T = ({ label, on, pressed, children, disabled }: { label: string; on: () => void; pressed?: boolean; children: React.ReactNode; disabled?: boolean }) => (
    <button type="button" className={btn} title={label} aria-label={label} aria-pressed={pressed} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={on}>{children}</button>
  );

  function setLink() {
    const prev = editor.getAttributes('link').href ?? '';
    const v = window.prompt('Adresa linka (https://…, mailto: ili /stranica). Prazno uklanja link.', prev);
    if (v === null) return;
    if (!v.trim()) { c().extendMarkRange('link').unsetLink().run(); return; }
    const url = safeUrl(v);
    if (!url) { onError('Link mora počinjati s https://, mailto:, tel: ili /'); return; }
    c().extendMarkRange('link').setLink({ href: url }).run();
  }
  async function addImage(f: File) {
    const alt = window.prompt('Opis slike za slijepe i slabovide osobe (alternativni tekst):', '')?.trim();
    if (!alt) { onError('Slika mora imati opis (alternativni tekst).'); return; }
    const url = await onUpload(f);
    if (url) c().setImage({ src: url, alt }).run();
  }
  const blocks: [string, typeof InfoCircle, () => void, boolean?][] = [
    ['Napomena', InfoCircle, () => c().insertContent({ type: 'callout', attrs: { tone: 'info' }, content: [{ type: 'paragraph' }] }).run()],
    ['Upozorenje', AlertTriangle, () => c().insertContent({ type: 'callout', attrs: { tone: 'warning' }, content: [{ type: 'paragraph' }] }).run()],
    ['Tabela', Table, () => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()],
    ['Slika', Image01, () => fileRef.current?.click()],
    ['Linija', Minus, () => c().setHorizontalRule().run()],
  ];

  return (
    <div role="toolbar" aria-label="Oblikovanje teksta" className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-[#e5e5e5] bg-white px-2 py-1.5">
      <T label="Poništi" on={() => c().undo().run()} disabled={!s.undo}><FlipBackward /></T>
      <T label="Ponovi" on={() => c().redo().run()} disabled={!s.redo}><FlipForward /></T>
      {sep}
      <T label="Podnaslov" pressed={s.h2} on={() => c().toggleHeading({ level: 2 }).run()}><Heading01 /></T>
      <T label="Manji podnaslov" pressed={s.h3} on={() => c().toggleHeading({ level: 3 }).run()}><Heading02 /></T>
      {sep}
      <T label="Podebljano" pressed={s.bold} on={() => c().toggleBold().run()}><Bold01 /></T>
      <T label="Kurziv" pressed={s.italic} on={() => c().toggleItalic().run()}><Italic01 /></T>
      <T label="Podvučeno" pressed={s.underline} on={() => c().toggleUnderline().run()}><Underline01 /></T>
      <T label="Precrtano" pressed={s.strike} on={() => c().toggleStrike().run()}><Strikethrough01 /></T>
      <T label="Link" pressed={s.link} on={setLink}><Link01 /></T>
      {sep}
      <T label="Lista s tačkama" pressed={s.ul} on={() => c().toggleBulletList().run()}><Dotpoints01 /></T>
      <T label="Numerisana lista" pressed={s.ol} on={() => c().toggleOrderedList().run()}><List /></T>
      <T label="Citat" pressed={s.quote} on={() => c().toggleBlockquote().run()}><MessageTextSquare01 /></T>
      {sep}
      <div className="relative">
        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-[6px] px-2 text-[14px] font-semibold text-[#404040] hover:bg-[#f5f5f5]" aria-haspopup="menu" aria-expanded={menu} onMouseDown={(e) => e.preventDefault()} onClick={() => setMenu(!menu)}>
          <Plus size={18} />Blok<ChevronDown size={16} />
        </button>
        {menu && (
          <div role="menu" className="absolute left-0 top-9 z-20 w-64 rounded-[8px] bg-white py-1 shadow-[0_12px_16px_-4px_rgba(10,13,18,0.08),0_4px_6px_-2px_rgba(10,13,18,0.03)] ring-1 ring-[#e5e5e5]" onMouseLeave={() => setMenu(false)}>
            {blocks.map(([label, I, run]) => (
              <button key={label} type="button" role="menuitem" className="flex w-full items-center gap-3 px-3 py-2 text-left text-[14px] text-[#404040] hover:bg-[#fafafa]" onMouseDown={(e) => e.preventDefault()} onClick={() => { setMenu(false); run(); }}><I size={18} className="text-[#737373]" />{label}</button>
            ))}
            <div className="my-1 border-t border-[#e5e5e5]" />
            <p className="px-3 pb-1 pt-1.5 text-[12px] font-semibold text-[#525252]">Dokument iz priloga</p>
            {docs.length === 0 && <p className="px-3 pb-2 text-[13px] text-[#525252]">Prvo dodajte prilog u kartici Prilozi.</p>}
            {docs.map((d) => (
              <button key={d.id} type="button" role="menuitem" className="flex w-full items-center gap-3 px-3 py-2 text-left text-[14px] text-[#404040] hover:bg-[#fafafa]" onMouseDown={(e) => e.preventDefault()} onClick={() => { setMenu(false); c().insertContent({ type: 'docLink', attrs: { id: d.id, title: d.title } }).run(); }}><File06 size={18} className="shrink-0 text-[#737373]" /><span className="truncate">{d.title}</span></button>
            ))}
          </div>
        )}
      </div>
      {s.table && (
        <>
          {sep}
          <span className="text-[12px] font-semibold text-[#525252]">Tabela:</span>
          <button type="button" className={`${btn} !w-auto px-2 text-[13px]`} onMouseDown={(e) => e.preventDefault()} onClick={() => c().addRowAfter().run()}>+ red</button>
          <button type="button" className={`${btn} !w-auto px-2 text-[13px]`} onMouseDown={(e) => e.preventDefault()} onClick={() => c().addColumnAfter().run()}>+ kolona</button>
          <button type="button" className={`${btn} !w-auto px-2 text-[13px]`} onMouseDown={(e) => e.preventDefault()} onClick={() => c().deleteRow().run()}>− red</button>
          <button type="button" className={`${btn} !w-auto px-2 text-[13px]`} onMouseDown={(e) => e.preventDefault()} onClick={() => c().deleteColumn().run()}>− kolona</button>
          <T label="Obriši tabelu" on={() => c().deleteTable().run()}><Trash01 /></T>
        </>
      )}
      <input ref={fileRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) addImage(f); e.target.value = ''; }} />
    </div>
  );
}

export default function RichEditor({ value, onChange, docs, onUpload, onError, disabled }: {
  value: string; onChange: (html: string) => void; docs: EditorDoc[]; onUpload: (f: File) => Promise<string | null>; onError: (m: string) => void; disabled?: boolean;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true, protocols: ['mailto', 'tel'], HTMLAttributes: { rel: 'noopener', target: '_blank' } } }),
      TableKit.configure({ table: { resizable: false } }),
      Image.configure({ inline: false }),
      Callout,
      DocLink,
      Placeholder.configure({ placeholder: 'Tekst objave. Blokove (tabela, slika, napomena, dokument) dodajte preko „Blok“.' }),
      CharacterCount,
    ],
    content: toEditorHtml(value),
    editorProps: { attributes: { class: 'prose-uui min-h-[380px] px-6 py-5 focus:outline-none', 'aria-label': 'Tekst objave', 'aria-multiline': 'true', role: 'textbox' } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  });

  useEffect(() => { editor?.setEditable(!disabled); }, [editor, disabled]);
  // vanjska promjena (npr. vraćanje verzije) – osvježi sadržaj editora
  useEffect(() => {
    if (!editor) return;
    const next = toEditorHtml(value);
    if (next !== editor.getHTML() && !(editor.isEmpty && !next)) editor.commands.setContent(next, { emitUpdate: false });
  }, [value, editor]);

  const words = editor?.storage.characterCount?.words?.() ?? 0;
  return (
    <div className="rich-editor">
      {editor && !disabled && <Toolbar editor={editor} docs={docs} onUpload={onUpload} onError={onError} />}
      <EditorContent editor={editor} />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e5e5e5] bg-[#fafafa] px-6 py-3 text-[14px] text-[#525252]">
        <span>{words} riječi · {Math.max(1, Math.round(words / 200))} min čitanja</span>
        <span>Portal čisti sadržaj pri prikazu; skripte i stilovi se ne prenose.</span>
      </div>
    </div>
  );
}
