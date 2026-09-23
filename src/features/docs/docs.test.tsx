import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { currentPath, renderApp } from '@/test/renderApp';
import { ARCHITECTURE_SECTIONS, DOCS_SECTIONS } from './docsNav';

beforeEach(() => {
  sessionStorage.clear();
});

describe('documentation landing page', () => {
  it('renders the title as the only h1', async () => {
    renderApp('/docs');
    expect(
      // The title is spelled exactly as specified: "WattAI", not the product's "wattsAI".
      await screen.findByRole('heading', { level: 1, name: 'WattAI Engineering Documentation' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('renders every documented section with a linkable heading', async () => {
    renderApp('/docs');
    for (const section of DOCS_SECTIONS) {
      const heading = await screen.findByRole('heading', { level: 2, name: section.label });
      expect(heading).toBeInTheDocument();
      // The sidebar anchors point at the section wrapper, which must carry the id.
      expect(document.getElementById(section.id)).toBeInTheDocument();
    }
  });

  it('states plainly that capabilities are labelled by real status', async () => {
    renderApp('/docs');
    expect(await screen.findByText(/based on\s+what is in the repository today/i)).toBeInTheDocument();
  });

  it('marks Playwright as planned rather than implemented', async () => {
    renderApp('/docs');
    const row = (await screen.findByText(/playwright end-to-end/i)).closest('tr');
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText('Planned')).toBeInTheDocument();
  });

  it('marks Vitest and React Testing Library as implemented', async () => {
    renderApp('/docs');
    for (const name of [/^Vitest$/, /React Testing Library/]) {
      const row = (await screen.findByText(name)).closest('tr');
      expect(within(row as HTMLElement).getByText('Implemented')).toBeInTheDocument();
    }
  });
});

describe('architecture page', () => {
  it('renders its own title and sections', async () => {
    renderApp('/docs/architecture');
    expect(
      await screen.findByRole('heading', { level: 1, name: /technical architecture/i }),
    ).toBeInTheDocument();
    for (const section of ARCHITECTURE_SECTIONS) {
      expect(screen.getByRole('heading', { level: 2, name: section.label })).toBeInTheDocument();
    }
  });

  it('does not claim Next.js, which this project does not use', async () => {
    renderApp('/docs/architecture');
    const row = (await screen.findByText(/^Next\.js$/)).closest('tr');
    expect(within(row as HTMLElement).getByText('Planned')).toBeInTheDocument();
    expect(within(row as HTMLElement).getByText(/there is no next\.js in this project/i)).toBeInTheDocument();
  });

  it('describes the build tool actually in use', async () => {
    renderApp('/docs/architecture');
    const row = (await screen.findByText(/^Vite$/)).closest('tr');
    expect(within(row as HTMLElement).getByText('Implemented')).toBeInTheDocument();
  });
});

describe('documentation navigation', () => {
  it('links from the landing page to the architecture page', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/docs');
    const nav = await screen.findByRole('navigation', { name: 'Documentation' });
    await user.click(within(nav).getByRole('link', { name: /technical architecture/i }));
    await waitFor(() => expect(currentPath(router)).toBe('/docs/architecture'));
  });

  it('links back from the architecture page to the landing page', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/docs/architecture');
    const nav = await screen.findByRole('navigation', { name: 'Documentation' });
    await user.click(within(nav).getByRole('link', { name: /engineering documentation/i }));
    await waitFor(() => expect(currentPath(router)).toBe('/docs'));
  });

  it('marks the current page in the sidebar', async () => {
    renderApp('/docs/architecture');
    const nav = await screen.findByRole('navigation', { name: 'Documentation' });
    expect(within(nav).getByRole('link', { name: /technical architecture/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('offers a collapsible control for small screens', async () => {
    const user = userEvent.setup();
    renderApp('/docs');
    const toggle = await screen.findByRole('button', { name: /on this page/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    // It controls the navigation it labels.
    const controls = toggle.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls as string)).toHaveAttribute('aria-label', 'Documentation');
  });
});

describe('entry points', () => {
  it('is reachable from a For Engineers footer section', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/');
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('heading', { name: 'For Engineers' })).toBeInTheDocument();

    await user.click(within(footer).getByRole('link', { name: 'Documentation' }));
    await waitFor(() => expect(currentPath(router)).toBe('/docs'));
  });

  it('is not added to the consumer navigation', async () => {
    renderApp('/');
    const nav = await screen.findByRole('navigation', { name: 'Main' });
    expect(within(nav).queryByRole('link', { name: /documentation/i })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('link', { name: /architecture/i })).not.toBeInTheDocument();
    expect(within(nav).getAllByRole('link')).toHaveLength(5);
  });
});
