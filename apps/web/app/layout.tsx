import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import './stitch.css';

export const metadata: Metadata = {
  title: { default: 'MTTO HNK – Ministarstvo trgovine, turizma i zaštite okoliša', template: '%s · MTTO HNK' },
  description: 'Službeni portal Ministarstva trgovine, turizma i zaštite okoliša Hercegovačko-neretvanskog kantona.',
  robots: { index: false, follow: false }, // staging / prototip
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Roboto:wght@400;500;700&family=Roboto+Condensed:wght@400;600;700&family=Roboto+Flex:opsz,wght@8..144,400..900&family=Roboto+Mono:wght@500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />
      </head>
      <body className="bg-background font-body-regular text-body min-h-screen">{children}</body>
    </html>
  );
}
