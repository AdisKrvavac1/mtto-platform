// Zamjena za next/link u Storybooku i testovima (izvan Next.js-a): običan <a>.
import type { AnchorHTMLAttributes } from 'react';
export default function Link({ href, prefetch: _p, replace: _r, scroll: _s, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean; replace?: boolean; scroll?: boolean }) {
  return <a href={href} {...rest} />;
}
