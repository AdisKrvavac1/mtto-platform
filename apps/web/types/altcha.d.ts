import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'altcha-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        challenge?: string; auto?: string; language?: string; name?: string; type?: string; display?: string; workers?: string; configuration?: string;
      };
    }
  }
}
