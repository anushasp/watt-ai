import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { currentPath, renderApp } from '@/test/renderApp';

beforeEach(() => {
  sessionStorage.clear();
});

describe('filters', () => {
  it('narrows the results and reports the count', async () => {
    const user = userEvent.setup();
    renderApp('/plans');
    const status = await screen.findByText(/showing \d+ of \d+ plans/i);
    expect(status).toHaveTextContent(/showing 6 of 6 plans/i);

    await user.click(screen.getByRole('checkbox', { name: /100 percent renewable only/i }));
    await waitFor(() => expect(screen.getByText(/showing \d+ of \d+ plans/i)).toHaveTextContent(/showing 2 of 6/i));
  });

  it('keeps the filter in the address bar so a link reproduces the view', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/plans');
    await user.click(await screen.findByRole('checkbox', { name: /100 percent renewable only/i }));
    await waitFor(() => expect(currentPath(router)).toContain('green=1'));
  });

  it('shows an empty state when nothing matches, with a way out', async () => {
    const user = userEvent.setup();
    renderApp('/plans?green=1&term=0');
    expect(await screen.findByText(/no plans match those filters/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /clear all filters/i }));
    await waitFor(() => expect(screen.queryByText(/no plans match those filters/i)).not.toBeInTheDocument());
  });

  it('names the savings baseline next to the result count', async () => {
    renderApp('/plans');
    expect(await screen.findByText(/savings are measured against/i)).toBeInTheDocument();
  });
});

describe('detail drawer', () => {
  it('opens from View Details and reflects the plan in the URL', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/plans');
    const buttons = await screen.findAllByRole('button', { name: /view details/i });
    await user.click(buttons[0]!);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    await waitFor(() => expect(currentPath(router)).toMatch(/plan=/));
  });

  it('closes on Escape even when the browser does not fire the dialog cancel event', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/plans');
    await user.click((await screen.findAllByRole('button', { name: /view details/i }))[0]!);
    const dialog = await screen.findByRole('dialog');

    // Dispatch only the keydown, deliberately not the native cancel event.
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(currentPath(router)).not.toMatch(/plan=/));
  });

  it('closes from the close button', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/plans');
    await user.click((await screen.findAllByRole('button', { name: /view details/i }))[0]!);
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /^close$/i }));
    await waitFor(() => expect(currentPath(router)).not.toMatch(/plan=/));
  });

  it('states plainly that choosing a plan does not enroll anyone', async () => {
    const user = userEvent.setup();
    renderApp('/plans');
    await user.click((await screen.findAllByRole('button', { name: /choose this plan/i }))[0]!);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('alert')).toHaveTextContent(/no enrollment happens here/i);
  });
});

describe('compare', () => {
  it('builds a side-by-side table from the selected plans', async () => {
    const user = userEvent.setup();
    renderApp('/plans');
    const checkboxes = await screen.findAllByRole('checkbox', { name: /compare this plan/i });
    await user.click(checkboxes[0]!);
    await user.click(checkboxes[1]!);

    // Charts also render hidden data tables, so select the comparison one by its caption.
    const table = await screen.findByRole('table', { name: /current plan compared with/i });
    expect(within(table).getByRole('row', { name: /estimated monthly cost/i })).toBeInTheDocument();
    // Current plan plus the two selected.
    expect(within(table).getAllByRole('columnheader')).toHaveLength(4);
  });
});
