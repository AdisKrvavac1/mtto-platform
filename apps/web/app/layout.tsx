import type { Metadata } from 'next';
import '@fontsource/public-sans/400.css';
import '@fontsource/public-sans/500.css';
import '@fontsource/public-sans/600.css';
import '@fontsource/public-sans/700.css';
import '@fontsource/public-sans/800.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto-condensed/400.css';
import '@fontsource/roboto-condensed/600.css';
import '@fontsource/roboto-condensed/700.css';
import '@fontsource-variable/roboto-flex/index.css';
import '@fontsource/roboto-mono/500.css';
import 'material-symbols/outlined.css';
import 'leaflet/dist/leaflet.css';
import './tokens.css';
import './globals.css';
import './cms-theme.css';
import '@fontsource-variable/inter';
import './stitch.css';

export const metadata: Metadata = {
  title: { default: 'MTTO HNK – Ministarstvo trgovine, turizma i zaštite okoliša', template: '%s · MTTO HNK' },
  description: 'Službeni portal Ministarstva trgovine, turizma i zaštite okoliša Hercegovačko-neretvanskog kantona.',
  metadataBase: new URL('https://mtto-platform.onrender.com'),
  openGraph: {
    type: 'website', siteName: 'MTTO HNK', locale: 'bs_BA', url: '/',
    title: 'MTTO HNK – Trgovina, turizam i okoliš Hercegovine',
    description: 'Vijesti, javni pozivi, registri i e-usluge Ministarstva trgovine, turizma i zaštite okoliša HNK na jednom mjestu.',
    images: [{ url: '/og/mtto-og.jpg', width: 1200, height: 630, alt: 'MTTO HNK – Ministarstvo trgovine, turizma i zaštite okoliša' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og/mtto-og.jpg'] },
  robots: { index: false, follow: false }, // staging / prototip
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs">
      <body className="bg-background font-body-regular text-body min-h-screen">{children}</body>
    </html>
  );
}
