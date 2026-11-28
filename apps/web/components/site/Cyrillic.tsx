'use client';
// F2-06: srpska ćirilica. Sadržaj portala je latinicom; ovdje se tekst stranice preslovljava u pregledniku
// (i kad se stranica promijeni bez ponovnog učitavanja). Ne dira polja za unos, kod, karte ni elemente s translate="no".
import { useEffect } from 'react';
import { cyr } from '@/lib/i18n';

const SKIP = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'NOSCRIPT', 'SVG']);
const done = new WeakMap<Text, string>();

function skip(el: Element | null): boolean {
  for (let e = el; e; e = e.parentElement) {
    if (SKIP.has(e.tagName) || e.getAttribute('translate') === 'no' || e.classList.contains('maplibregl-map') || e.classList.contains('material-symbols-outlined')) return true;
  }
  return false;
}
function walk(root: Node) {
  const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = it.nextNode() as Text | null; n; n = it.nextNode() as Text | null) {
    const v = n.nodeValue ?? '';
    if (!/[A-Za-zčćšđž]/.test(v) || done.get(n) === v || skip(n.parentElement)) continue;
    const c = cyr(v);
    done.set(n, c);
    if (c !== v) n.nodeValue = c;
  }
  for (const el of (root instanceof Element ? [root, ...root.querySelectorAll('[placeholder],[aria-label],[title]')] : [])) {
    if (skip(el)) continue;
    for (const a of ['placeholder', 'aria-label', 'title']) { const v = el.getAttribute(a); if (v && /[A-Za-z]/.test(v)) { const c = cyr(v); if (c !== v) el.setAttribute(a, c); } }
  }
}

export function Cyrillic() {
  useEffect(() => {
    walk(document.body);
    document.title = cyr(document.title);
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; mo.disconnect(); walk(document.body); mo.observe(document.body, { childList: true, subtree: true, characterData: true }); });
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, []);
  return null;
}
