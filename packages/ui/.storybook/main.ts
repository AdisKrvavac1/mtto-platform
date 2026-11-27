import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx', '../src/**/*.mdx'],
  addons: ['@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  viteFinal: async (c) => {
    c.resolve = { ...c.resolve, alias: { ...(c.resolve?.alias as Record<string, string>), 'next/link': resolve(here, '../test/next-link.tsx') } };
    c.css = { ...c.css, postcss: resolve(here, '..') };
    return c;
  },
};
export default config;
