import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { 'next/link': fileURLToPath(new URL('./test/next-link.tsx', import.meta.url)) } },
  css: { postcss: { plugins: [] } },
  test: { environment: 'jsdom', include: ['test/**/*.test.tsx'], setupFiles: ['test/setup.ts'] },
});
