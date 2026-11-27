import type { Preview } from '@storybook/react-vite';
import '@fontsource-variable/inter';
import '../src/tokens/tokens.css';
import '../src/styles.css';
import './storybook.css';

/** Svaka priča se prikazuje u temi u kojoj živi: CMS (ljubičasta) ili javni portal (plava). */
const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    a11y: { test: 'error' },
    options: { storySort: { order: ['Uvod', 'Tokeni', 'Portal', 'CMS'] } },
  },
  globalTypes: {
    theme: { description: 'Tema', toolbar: { title: 'Tema', items: [{ value: 'auto', title: 'Po priči' }, { value: 'cms', title: 'CMS' }, { value: 'portal', title: 'Portal' }] } },
  },
  initialGlobals: { theme: 'auto' },
  decorators: [
    (Story, ctx) => {
      const theme = ctx.globals.theme === 'auto' ? (ctx.parameters.theme ?? 'portal') : ctx.globals.theme;
      return <div lang="bs" className={theme === 'cms' ? 'cms-theme' : 'uui-theme'} style={{ fontFamily: 'var(--mtto-font-sans)', color: 'var(--mtto-gray-900)' }}><Story /></div>;
    },
  ],
};
export default preview;
