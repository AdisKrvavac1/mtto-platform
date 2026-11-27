/**
 * F1-08: svaka priča iz Storybooka se renderuje i provjerava axe-core pravilima (WCAG 2.1 A/AA).
 * Kontrast boja jsdom ne može izračunati (nema CSS-a), pa se provjerava u Storybooku (addon a11y) u pregledniku.
 */
import { composeStories } from '@storybook/react-vite';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import * as tokens from '../src/Tokens.stories';
import * as portal from '../src/portal.stories';
import * as cms from '../src/cms.stories';

const files = { tokens, portal, cms } as Record<string, any>;

describe.each(Object.entries(files))('%s', (_name, mod) => {
  const stories = composeStories(mod) as Record<string, any>;
  it.each(Object.entries(stories))('%s nema axe prekršaja', async (_s, Story) => {
    const { container } = render(<main lang="bs"><Story /></main>);
    const r = await axe.run(container, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, rules: { 'color-contrast': { enabled: false } } });
    const msg = r.violations.map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.html.slice(0, 140)).join('\n  ')}`).join('\n');
    expect(r.violations, msg).toHaveLength(0);
  });
});

it('kontrola: axe hvata dugme bez naziva i sliku bez alt teksta', async () => {
  const { container } = render(<main lang="bs"><button type="button" /><img src="x.png" /></main>);
  const r = await axe.run(container, { runOnly: { type: 'tag', values: ['wcag2a'] } });
  expect(r.violations.map((v) => v.id).sort()).toEqual(['button-name', 'image-alt']);
});
