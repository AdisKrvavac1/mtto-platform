const API = process.env.API_INTERNAL_URL || 'http://localhost:4000';
const PROD = process.env.NODE_ENV === 'production';

/*
 * F1-10: sigurnosna zaglavlja.
 * - Odmah se primjenjuje dio CSP-a koji ne može pokvariti stranicu: zabrana ugradnje u tuđe stranice,
 *   <object>/<embed>, promjene <base> i slanja obrazaca na druge domene.
 * - Puna politika (skripte, stilovi, slike, konekcije) ide prvo kao Report-Only: preglednik ne blokira ništa,
 *   samo javlja kršenja na /api/csp-report. Kad izvještaji budu čisti, prelazi u obaveznu.
 */
const GOOGLE = 'https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com https://*.gstatic.com';
const CSP_ENFORCED = ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", ...(PROD ? ['upgrade-insecure-requests'] : [])].join('; ');
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${GOOGLE}${PROD ? '' : " 'unsafe-eval'"}`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' ${GOOGLE} https://maps.effis.emergency.copernicus.eu${PROD ? '' : ' ws: http://localhost:*'}`,
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'report-uri /api/csp-report',
].join('; ');

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  async rewrites() {
    // Preglednik uvijek razgovara s istim domenom; Next prosljeđuje /api/* na NestJS.
    return [{ source: '/api/:path*', destination: `${API}/:path*` }];
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Content-Security-Policy', value: CSP_ENFORCED },
      { key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self), interest-cohort=()' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      ...(PROD ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
    ] }];
  },
};
