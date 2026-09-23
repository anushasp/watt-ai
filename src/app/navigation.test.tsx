import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { currentPath, renderApp } from '@/test/renderApp';

beforeEach(() => {
  sessionStorage.clear();
});

describe('navigation', () => {
  it('renders the home page at the root', async () => {
    renderApp('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: /smarter energy starts with your bill/i }),
    ).toBeInTheDocument();
  });

  it('gives every page exactly one h1', async () => {
    for (const path of ['/', '/bill-analysis', '/plans', '/dashboard', '/copilot']) {
      const { unmount } = renderApp(path);
      await waitFor(() => expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1));
      unmount();
    }
  });

  it('moves to each page from the main nav', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/');
    const nav = screen.getByRole('navigation', { name: 'Main' });

    for (const [label, path] of [
      ['Bill Analysis', '/bill-analysis'],
      ['Plans', '/plans'],
      ['Dashboard', '/dashboard'],
      ['AI Copilot', '/copilot'],
    ] as const) {
      await user.click(within(nav).getByRole('link', { name: label }));
      await waitFor(() => expect(currentPath(router)).toContain(path));
    }
  });

  it('returns home from the logo', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/plans');
    await user.click(screen.getByRole('link', { name: /wattsAI, go to the home page/i }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });

  it('marks the current page for assistive technology', async () => {
    renderApp('/dashboard');
    const nav = screen.getByRole('navigation', { name: 'Main' });
    await waitFor(() =>
      expect(within(nav).getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
        'aria-current',
        'page',
      ),
    );
  });

  it('scrolls to the how-it-works section rather than navigating away', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/');
    await user.click(screen.getAllByRole('button', { name: /see how it works/i })[0]!);
    expect(router.state.location.pathname).toBe('/');
    expect(document.getElementById('how-it-works')).toBeInTheDocument();
  });

  it('shows a not-found page for an unknown route', async () => {
    renderApp('/nowhere');
    expect(
      await screen.findByRole('heading', { level: 1, name: /could not find that page/i }),
    ).toBeInTheDocument();
  });

  it('offers a skip link to the main content', async () => {
    renderApp('/');
    const skip = screen.getByRole('link', { name: /skip to main content/i });
    expect(skip).toHaveAttribute('href', '#main');
    expect(document.getElementById('main')).toBeInTheDocument();
  });
});

describe('mobile menu', () => {
  it('opens, navigates and closes again', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/');
    const toggle = screen.getByRole('button', { name: /open menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'true'));

    const drawer = screen.getByRole('dialog', { name: 'Main menu' });
    await user.click(within(drawer).getByRole('link', { name: 'Plans' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/plans'));
    // Selecting a destination must close the menu.
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'false'));
    // And must not strand focus on <body> when the dialog closes.
    await waitFor(() => expect(toggle).toHaveFocus());
  });

  it('closes on Escape and returns focus to the toggle', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const toggle = screen.getByRole('button', { name: /open menu/i });
    await user.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'true'));

    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Main menu' }), { key: 'Escape' });
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(toggle).toHaveFocus());
  });
});

describe('ask wattsAI hand-off', () => {
  it('carries the selected plan into the copilot as context', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/plans');
    const asks = await screen.findAllByRole('button', { name: /^ask wattsAI$/i });
    await user.click(asks[0]!);

    await waitFor(() => expect(router.state.location.pathname).toBe('/copilot'));
    expect(router.state.location.search).toMatch(/plan=/);
    expect(await screen.findByRole('complementary', { name: /conversation context/i })).toBeInTheDocument();
  });
});
