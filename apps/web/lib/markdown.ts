import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

/** Dozvoljeni HTML za tekst objave (editor F2-02, uvezene vijesti i stari Markdown). Sve ostalo se uklanja. */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['h2', 'h3', 'h4', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ul', 'ol', 'li', 'a', 'blockquote', 'hr', 'code', 'pre',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col', 'img', 'figure', 'figcaption', 'aside'],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'data-doc-id', 'class'],
    img: ['src', 'alt', 'width', 'height'],
    th: ['colspan', 'rowspan'], td: ['colspan', 'rowspan'],
    aside: [{ name: 'data-tone', values: ['info', 'warning', 'success'], multiple: false }],
    ol: ['start'],
  },
  allowedClasses: { a: ['doc-card'] },
  allowedSchemes: ['https', 'http', 'mailto', 'tel'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  transformTags: {
    a: (tag, attribs) => {
      const internal = (attribs.href ?? '').startsWith('/');
      return { tagName: 'a', attribs: internal ? attribs : { ...attribs, rel: 'noopener', target: '_blank' } };
    },
  },
};

/** Tekst objave u siguran HTML: novi sadržaj je HTML iz editora, stariji je Markdown. */
export function renderBody(body: string): string {
  const src = body || '';
  const raw = /^\s*</.test(src) ? src : (marked.parse(src, { async: false, breaks: true }) as string);
  return sanitizeHtml(raw, OPTIONS);
}

/** @deprecated koristiti renderBody */
export const renderMarkdown = renderBody;

/** Broj riječi bez HTML oznaka (vrijeme čitanja). */
export const wordCount = (body: string) => (body || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
