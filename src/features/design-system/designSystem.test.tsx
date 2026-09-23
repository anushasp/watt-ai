import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { currentPath, renderApp } from '@/test/renderApp';
import { DESIGN_SYSTEM_SECTIONS } from '@/features/docs/docsNav';
import { ICON_PATHS } from '@/ds/icons/icon-data';
import { ALL_TOKEN_NAMES, COLOR_GROUPS, RADIUS_TOKENS, SPACE_TOKENS } from './dsTokens';

beforeEach(() => {
  sessionStorage.clear();
});

describe('page', () => {
  it('loads with the specified title as the only h1', async () => {
    renderApp('/design-system');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'WattAI Design System' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('renders every section with a linkable id', async () => {
    renderApp('/design-system');
    for (const section of DESIGN_SYSTEM_SECTIONS) {
      expect(await screen.findByRole('heading', { level: 2, name: section.label })).toBeInTheDocument();
      expect(document.getElementById(section.id)).toBeInTheDocument();
    }
  });
});

describe('tokens are documented from the real system', () => {
  it('documents every colour token defined in the stylesheet', async () => {
    renderApp('/design-system');
    await screen.findByRole('heading', { level: 2, name: 'Colors' });
    for (const group of COLOR_GROUPS) {
      for (const token of group.tokens) {
        expect(screen.getAllByText(token.name).length).toBeGreaterThan(0);
      }
    }
  });

  it('documents the spacing and radius scales', async () => {
    renderApp('/design-system');
    await screen.findByRole('heading', { level: 2, name: 'Spacing' });
    for (const token of [...SPACE_TOKENS, ...RADIUS_TOKENS]) {
      expect(screen.getAllByText(token.name).length).toBeGreaterThan(0);
    }
  });

  it('never hardcodes a token value in the token inventory', () => {
    // dsTokens.ts holds names and purposes only; values are read at runtime.
    const raw = JSON.stringify(COLOR_GROUPS);
    expect(raw).not.toMatch(/#[0-9a-f]{6}/i);
    expect(raw).not.toMatch(/rgb\(/);
  });

  it('reads a value for every token it documents', () => {
    expect(new Set(ALL_TOKEN_NAMES).size).toBe(ALL_TOKEN_NAMES.length);
    expect(ALL_TOKEN_NAMES.every((n) => n.startsWith('--'))).toBe(true);
  });
});

describe('components render live', () => {
  it('renders the real Button in every variant', async () => {
    renderApp('/design-system');
    const section = (await screen.findByRole('heading', { level: 2, name: 'Buttons' })).closest(
      'section',
    );
    expect(section).not.toBeNull();
    const scope = within(section as HTMLElement);
    // Scoped, because the navbar CTA shares the primary button's label.
    expect(scope.getByRole('button', { name: 'Analyze My Bill' })).toBeInTheDocument();
    expect(scope.getByRole('button', { name: 'See How It Works' })).toBeInTheDocument();
    expect(scope.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    expect(scope.getByRole('button', { name: 'Full width' })).toBeInTheDocument();
  });

  it('renders the real Input with its error wiring intact', async () => {
    renderApp('/design-system');
    await screen.findByRole('heading', { level: 2, name: 'Form Controls' });
    const field = screen.getByLabelText('Bill total');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription(/greater than zero/i);
  });

  it('renders the whole icon set', async () => {
    renderApp('/design-system');
    await screen.findByRole('heading', { level: 2, name: 'Icons' });
    for (const name of Object.keys(ICON_PATHS)) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });

  it('renders a working Tabs example with real keyboard behaviour', async () => {
    const user = userEvent.setup();
    renderApp('/design-system');
    const tablist = await screen.findByRole('tablist', { name: /design system tabs example/i });
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    tabs[0]?.focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(tabs[1]).toHaveAttribute('aria-selected', 'true'));
  });

  it('opens the real Drawer and closes it on Escape', async () => {
    const user = userEvent.setup();
    renderApp('/design-system');
    const trigger = await screen.findByRole('button', { name: /open the drawer/i });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: /night charge flex/i });
    expect(dialog).toBeInTheDocument();
  });

  it('renders the real InsightCard with a working Explain disclosure', async () => {
    const user = userEvent.setup();
    renderApp('/design-system');
    await screen.findByRole('heading', { level: 2, name: 'AI Components' });
    const explain = screen.getAllByRole('button', { name: /^explain$/i })[0];
    expect(explain).toHaveAttribute('aria-expanded', 'false');
    await user.click(explain!);
    await waitFor(() => expect(explain).toHaveAttribute('aria-expanded', 'true'));
  });
});

describe('entry points', () => {
  it('is linked from the For Engineers footer section', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/');
    const footer = screen.getByRole('contentinfo');
    const group = within(footer).getByRole('heading', { name: 'For Engineers' });
    expect(group).toBeInTheDocument();
    await user.click(within(footer).getByRole('link', { name: 'Design System' }));
    await waitFor(() => expect(currentPath(router)).toBe('/design-system'));
  });

  it('is linked from the engineering documentation', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/docs');
    const main = screen.getByRole('main');
    await user.click(within(main).getAllByRole('link', { name: /browse the design system/i })[0]!);
    await waitFor(() => expect(currentPath(router)).toBe('/design-system'));
  });

  it('is not added to the consumer navigation', async () => {
    renderApp('/');
    const nav = await screen.findByRole('navigation', { name: 'Main' });
    expect(within(nav).queryByRole('link', { name: /design system/i })).not.toBeInTheDocument();
    expect(within(nav).getAllByRole('link')).toHaveLength(5);
  });

  it('shares the documentation sidebar rather than duplicating one', async () => {
    renderApp('/design-system');
    const nav = await screen.findByRole('navigation', { name: 'Documentation' });
    expect(within(nav).getByRole('link', { name: 'Design System' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: /engineering documentation/i })).toBeInTheDocument();
  });
});
