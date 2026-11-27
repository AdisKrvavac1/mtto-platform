/** Tokeni preuzeti iz Stitch dizajna (DESIGN.md + tailwind.config svih MVP ekrana). */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
  "colors": {
      "mtto-primary": "rgb(var(--c-mtto-primary) / <alpha-value>)",
      "mtto-navy": "rgb(var(--c-mtto-navy) / <alpha-value>)",
      "mtto-navy-dark": "rgb(var(--c-mtto-navy-dark) / <alpha-value>)",
      "neretva-cyan": "rgb(var(--c-neretva-cyan) / <alpha-value>)",
      "neretva-cyan-light": "rgb(var(--c-neretva-cyan-light) / <alpha-value>)",
      "eko-green": "rgb(var(--c-eko-green) / <alpha-value>)",
      "eko-green-light": "rgb(var(--c-eko-green-light) / <alpha-value>)",
      "eko-green-border": "rgb(var(--c-eko-green-border) / <alpha-value>)",
      "herzeg-gold": "rgb(var(--c-herzeg-gold) / <alpha-value>)",
      "herzeg-gold-bright": "rgb(var(--c-herzeg-gold-bright) / <alpha-value>)",
      "herzeg-gold-soft": "rgb(var(--c-herzeg-gold-soft) / <alpha-value>)",
    "outline-variant": "rgb(var(--c-outline-variant) / <alpha-value>)",
    "primary-fixed-dim": "rgb(var(--c-primary-fixed-dim) / <alpha-value>)",
    "background": "rgb(var(--c-background) / <alpha-value>)",
    "on-primary-container": "rgb(var(--c-on-primary-container) / <alpha-value>)",
    "secondary-fixed": "rgb(var(--c-secondary-fixed) / <alpha-value>)",
    "primary-fixed": "rgb(var(--c-primary-fixed) / <alpha-value>)",
    "surface-bright": "rgb(var(--c-surface-bright) / <alpha-value>)",
    "error": "rgb(var(--c-error) / <alpha-value>)",
    "tertiary": "rgb(var(--c-tertiary) / <alpha-value>)",
    "tertiary-fixed-dim": "rgb(var(--c-tertiary-fixed-dim) / <alpha-value>)",
    "on-primary": "rgb(var(--c-on-primary) / <alpha-value>)",
    "on-secondary-fixed-variant": "rgb(var(--c-on-secondary-fixed-variant) / <alpha-value>)",
    "inverse-on-surface": "rgb(var(--c-inverse-on-surface) / <alpha-value>)",
    "surface": "rgb(var(--c-surface) / <alpha-value>)",
    "tertiary-container": "rgb(var(--c-tertiary-container) / <alpha-value>)",
    "surface-container-high": "rgb(var(--c-surface-container-high) / <alpha-value>)",
    "on-secondary-container": "rgb(var(--c-on-secondary-container) / <alpha-value>)",
    "surface-container": "rgb(var(--c-surface-container) / <alpha-value>)",
    "on-tertiary-container": "rgb(var(--c-on-tertiary-container) / <alpha-value>)",
    "error-container": "rgb(var(--c-error-container) / <alpha-value>)",
    "inverse-surface": "rgb(var(--c-inverse-surface) / <alpha-value>)",
    "primary-container": "rgb(var(--c-primary-container) / <alpha-value>)",
    "on-primary-fixed": "rgb(var(--c-on-primary-fixed) / <alpha-value>)",
    "on-primary-fixed-variant": "rgb(var(--c-on-primary-fixed-variant) / <alpha-value>)",
    "on-background": "rgb(var(--c-on-background) / <alpha-value>)",
    "secondary": "rgb(var(--c-secondary) / <alpha-value>)",
    "slate-surface": "rgb(var(--c-slate-surface) / <alpha-value>)",
    "surface-container-low": "rgb(var(--c-surface-container-low) / <alpha-value>)",
    "surface-dim": "rgb(var(--c-surface-dim) / <alpha-value>)",
    "on-error": "rgb(var(--c-on-error) / <alpha-value>)",
    "on-tertiary": "rgb(var(--c-on-tertiary) / <alpha-value>)",
    "on-error-container": "rgb(var(--c-on-error-container) / <alpha-value>)",
    "tertiary-fixed": "rgb(var(--c-tertiary-fixed) / <alpha-value>)",
    "secondary-container": "rgb(var(--c-secondary-container) / <alpha-value>)",
    "on-surface": "rgb(var(--c-on-surface) / <alpha-value>)",
    "on-tertiary-fixed-variant": "rgb(var(--c-on-tertiary-fixed-variant) / <alpha-value>)",
    "surface-container-highest": "rgb(var(--c-surface-container-highest) / <alpha-value>)",
    "surface-variant": "rgb(var(--c-surface-variant) / <alpha-value>)",
    "institutional-navy-deep": "rgb(var(--c-institutional-navy-deep) / <alpha-value>)",
    "surface-tint": "rgb(var(--c-surface-tint) / <alpha-value>)",
    "emerald-light": "rgb(var(--c-emerald-light) / <alpha-value>)",
    "amber-light": "rgb(var(--c-amber-light) / <alpha-value>)",
    "on-tertiary-fixed": "rgb(var(--c-on-tertiary-fixed) / <alpha-value>)",
    "on-secondary-fixed": "rgb(var(--c-on-secondary-fixed) / <alpha-value>)",
    "slate-border": "rgb(var(--c-slate-border) / <alpha-value>)",
    "outline": "rgb(var(--c-outline) / <alpha-value>)",
    "surface-container-lowest": "rgb(var(--c-surface-container-lowest) / <alpha-value>)",
    "text-heading": "rgb(var(--c-text-heading) / <alpha-value>)",
    "inverse-primary": "rgb(var(--c-inverse-primary) / <alpha-value>)",
    "on-surface-variant": "rgb(var(--c-on-surface-variant) / <alpha-value>)",
    "primary": "rgb(var(--c-primary) / <alpha-value>)",
    "text-body": "rgb(var(--c-text-body) / <alpha-value>)",
    "on-secondary": "rgb(var(--c-on-secondary) / <alpha-value>)",
    "secondary-fixed-dim": "rgb(var(--c-secondary-fixed-dim) / <alpha-value>)"
  },
  "borderRadius": {
    "DEFAULT": "var(--r-sm, 0.125rem)",
    "lg": "var(--r-lg, 0.25rem)",
    "xl": "var(--r-xl, 0.5rem)",
    "full": "var(--r-full, 0.75rem)"
  },
  "spacing": {
    "space-lg": "1.5rem",
    "margin-mobile": "1rem",
    "gutter": "1.5rem",
    "space-sm": "0.5rem",
    "space-md": "1rem",
    "gutter-mobile": "1rem",
    "margin": "2rem",
    "space-xl": "2.5rem",
    "space-xs": "0.25rem",
      "space-2xl": "4rem"
  },
  "fontFamily": {
    "pub": ["Public Sans", "system-ui", "sans-serif"],
    "space": ["Space Grotesk", "system-ui", "sans-serif"],
    "rob": ["Roboto", "system-ui", "sans-serif"],
    "robflex": ["Roboto Flex Variable", "Roboto Flex", "Roboto", "system-ui", "sans-serif"],
    "cond": ["Roboto Condensed", "Roboto", "sans-serif"],
    "rmono": ["Roboto Mono", "monospace"],
    "body-regular": [
      "var(--font-sans)",
      "system-ui",
      "sans-serif"
    ],
    "display": [
      "var(--font-sans)",
      "system-ui",
      "sans-serif"
    ],
    "label-kicker": [
      "var(--font-kicker)",
      "system-ui",
      "sans-serif"
    ],
    "body-sm": [
      "var(--font-sans)",
      "system-ui",
      "sans-serif"
    ],
    "headline-lg": [
      "var(--font-sans)",
      "system-ui",
      "sans-serif"
    ],
    "headline-sm": [
      "var(--font-sans)",
      "system-ui",
      "sans-serif"
    ],
    "button": [
      "var(--font-sans)",
      "system-ui",
      "sans-serif"
    ],
    "label-badge": [
      "var(--font-sans)",
      "system-ui",
      "sans-serif"
    ],
    "display-mobile": [
      "var(--font-sans)",
      "system-ui",
      "sans-serif"
    ],
    "headline-md": [
      "var(--font-sans)",
      "system-ui",
      "sans-serif"
    ],
    "headline-lg-mobile": [
      "var(--font-sans)",
      "system-ui",
      "sans-serif"
    ],
    "body-lead": [
      "var(--font-sans)",
      "system-ui",
      "sans-serif"
    ],
    "title-md": [
      "var(--font-sans)",
      "system-ui",
      "sans-serif"
    ]
  },
  "fontSize": {
    "body-regular": [
      "15px",
      {
        "lineHeight": "24px",
        "fontWeight": "400"
      }
    ],
    "display": [
      "48px",
      {
        "lineHeight": "56px",
        "letterSpacing": "-0.02em",
        "fontWeight": "800"
      }
    ],
    "label-kicker": [
      "12px",
      {
        "lineHeight": "16px",
        "letterSpacing": "0.08em",
        "fontWeight": "700"
      }
    ],
    "body-sm": [
      "13px",
      {
        "lineHeight": "20px",
        "fontWeight": "400"
      }
    ],
    "headline-lg": [
      "36px",
      {
        "lineHeight": "44px",
        "letterSpacing": "-0.015em",
        "fontWeight": "700"
      }
    ],
    "headline-sm": [
      "20px",
      {
        "lineHeight": "28px",
        "fontWeight": "600"
      }
    ],
    "button": [
      "14px",
      {
        "lineHeight": "20px",
        "letterSpacing": "0.01em",
        "fontWeight": "600"
      }
    ],
    "label-badge": [
      "11px",
      {
        "lineHeight": "14px",
        "letterSpacing": "0.04em",
        "fontWeight": "700"
      }
    ],
    "display-mobile": [
      "32px",
      {
        "lineHeight": "40px",
        "letterSpacing": "-0.01em",
        "fontWeight": "800"
      }
    ],
    "headline-md": [
      "24px",
      {
        "lineHeight": "32px",
        "letterSpacing": "-0.01em",
        "fontWeight": "700"
      }
    ],
    "headline-lg-mobile": [
      "26px",
      {
        "lineHeight": "34px",
        "letterSpacing": "-0.01em",
        "fontWeight": "700"
      }
    ],
    "body-lead": [
      "18px",
      {
        "lineHeight": "28px",
        "fontWeight": "400"
      }
    ],
    "title-md": [
      "18px",
      {
        "lineHeight": "26px",
        "fontWeight": "600"
      }
    ]
  }
},
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
};
