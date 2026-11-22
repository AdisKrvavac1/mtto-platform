/** Tokeni preuzeti iz Stitch dizajna (DESIGN.md + tailwind.config svih MVP ekrana). */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
  "colors": {
      "mtto-primary": "#234696",
      "mtto-navy": "#2e318f",
      "mtto-navy-dark": "#1a1e5c",
      "neretva-cyan": "#00abeb",
      "neretva-cyan-light": "#e0f6ff",
      "eko-green": "#13693f",
      "eko-green-light": "#eaf7f0",
      "eko-green-border": "#9ad1b4",
      "herzeg-gold": "#fadc12",
      "herzeg-gold-bright": "#fcec02",
      "herzeg-gold-soft": "#fffde6",
    "outline-variant": "#c3c6d0",
    "primary-fixed-dim": "#a6c8fe",
    "background": "#f8f9ff",
    "on-primary-container": "#7ea0d3",
    "secondary-fixed": "#85f8c4",
    "primary-fixed": "#d4e3ff",
    "surface-bright": "#f8f9ff",
    "error": "#ba1a1a",
    "tertiary": "#361900",
    "tertiary-fixed-dim": "#ffb77d",
    "on-primary": "#ffffff",
    "on-secondary-fixed-variant": "#005137",
    "inverse-on-surface": "#eaf1ff",
    "surface": "#f8f9ff",
    "tertiary-container": "#552b00",
    "surface-container-high": "#dce9ff",
    "on-secondary-container": "#00714e",
    "surface-container": "#e5eeff",
    "on-tertiary-container": "#eb851c",
    "error-container": "#ffdad6",
    "inverse-surface": "#213145",
    "primary-container": "#0a3663",
    "on-primary-fixed": "#001c3a",
    "on-primary-fixed-variant": "#224876",
    "on-background": "#0b1c30",
    "secondary": "#006c4a",
    "slate-surface": "#F8FAFC",
    "surface-container-low": "#eff4ff",
    "surface-dim": "#cbdbf5",
    "on-error": "#ffffff",
    "on-tertiary": "#ffffff",
    "on-error-container": "#93000a",
    "tertiary-fixed": "#ffdcc3",
    "secondary-container": "#82f5c1",
    "on-surface": "#0b1c30",
    "on-tertiary-fixed-variant": "#6e3900",
    "surface-container-highest": "#d3e4fe",
    "surface-variant": "#d3e4fe",
    "institutional-navy-deep": "#062343",
    "surface-tint": "#3d608f",
    "emerald-light": "#ECFDF5",
    "amber-light": "#FFFBEB",
    "on-tertiary-fixed": "#2f1500",
    "on-secondary-fixed": "#002114",
    "slate-border": "#E2E8F0",
    "outline": "#737780",
    "surface-container-lowest": "#ffffff",
    "text-heading": "#0F172A",
    "inverse-primary": "#a6c8fe",
    "on-surface-variant": "#43474f",
    "primary": "#002042",
    "text-body": "#334155",
    "on-secondary": "#ffffff",
    "secondary-fixed-dim": "#68dba9"
  },
  "borderRadius": {
    "DEFAULT": "0.125rem",
    "lg": "0.25rem",
    "xl": "0.5rem",
    "full": "0.75rem"
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
