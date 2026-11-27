/** Tailwind za Storybook i testove paketa. Aplikacija (apps/web) skenira src/ ovog paketa kroz svoj config. */
module.exports = { content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'], theme: { extend: {} }, plugins: [] };
