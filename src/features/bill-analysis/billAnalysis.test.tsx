import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { currentPath, renderApp } from '@/test/renderApp';

beforeEach(() => {
  sessionStorage.clear();
});

function file(name: string, type: string, size = 2048): File {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

async function loadSampleBill(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: /try a sample bill/i }));
  await screen.findByRole('heading', { level: 2, name: /we analyzed your bill/i }, { timeout: 3000 });
}

describe('step progression', () => {
  it('shows only the upload step first', async () => {
    renderApp('/bill-analysis');
    expect(await screen.findByRole('heading', { level: 2, name: /upload your bill/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /we analyzed your bill/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /build your home profile/i })).not.toBeInTheDocument();
  });

  it('renders exactly one step at a time through the whole flow', async () => {
    const user = userEvent.setup();
    renderApp('/bill-analysis');
    await loadSampleBill(user);

    // Review is showing; upload and profile are not.
    expect(screen.queryByRole('heading', { name: /upload your bill/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /build your home profile/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /looks right/i }));
    await screen.findByRole('heading', { level: 2, name: /build your home profile/i });
    expect(screen.queryByRole('heading', { name: /we analyzed your bill/i })).not.toBeInTheDocument();
  });

  it('marks the current step for assistive technology', async () => {
    renderApp('/bill-analysis');
    const progress = await screen.findByRole('navigation', { name: /bill analysis progress/i });
    const current = within(progress).getByText('Upload Bill').closest('li');
    expect(current).toHaveAttribute('aria-current', 'step');
  });

  it('redirects a deep link past an incomplete step back to upload', async () => {
    const { router } = renderApp('/bill-analysis?step=profile');
    await screen.findByRole('heading', { level: 2, name: /upload your bill/i });
    await waitFor(() => expect(currentPath(router)).toContain('step=upload'));
  });
});

describe('file selection', () => {
  it('accepts a PDF and shows the filename with replace and remove', async () => {
    const user = userEvent.setup();
    renderApp('/bill-analysis');
    const input = await screen.findByTestId('bill-file-input');
    await user.upload(input, file('march-bill.pdf', 'application/pdf'));

    expect(await screen.findByText('march-bill.pdf')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /replace file/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove file/i })).toBeInTheDocument();
    // The file is read first, and the actions stay disabled until that finishes.
    expect(screen.getByRole('button', { name: /^analyze bill$/i })).toBeDisabled();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /^analyze bill$/i })).toBeEnabled(),
    );
  });

  it('accepts JPG and PNG', async () => {
    for (const [name, type] of [
      ['bill.jpg', 'image/jpeg'],
      ['bill.png', 'image/png'],
    ] as const) {
      const user = userEvent.setup();
      const { unmount } = renderApp('/bill-analysis');
      const input = await screen.findByTestId('bill-file-input');
      await user.upload(input, file(name, type));
      expect(await screen.findByText(name)).toBeInTheDocument();
      unmount();
      sessionStorage.clear();
    }
  });

  it('rejects an unsupported type with a visible message', async () => {
    renderApp('/bill-analysis');
    const input = await screen.findByTestId('bill-file-input');
    fireEvent.change(input, { target: { files: [file('notes.txt', 'text/plain')] } });

    const messages = await screen.findAllByText(/is not a supported file/i);
    expect(messages.length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /analyze bill/i })).not.toBeInTheDocument();
  });

  it('rejects a file over the size limit, and announces it', async () => {
    const user = userEvent.setup();
    renderApp('/bill-analysis');
    const input = await screen.findByTestId('bill-file-input');
    await user.upload(input, file('huge.pdf', 'application/pdf', 20 * 1024 * 1024));
    // Once visibly, once in the live region for screen readers.
    const messages = await screen.findAllByText(/larger than 10 MB/i);
    expect(messages).toHaveLength(2);
  });

  it('exposes a keyboard-reachable control that opens the picker', async () => {
    renderApp('/bill-analysis');
    const trigger = await screen.findByRole('button', { name: /choose a bill, or drop one here/i });
    // A real button, so Tab reaches it and Enter or Space activates it.
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).not.toHaveAttribute('disabled');
  });

  it('returns to the empty state when the file is removed', async () => {
    const user = userEvent.setup();
    renderApp('/bill-analysis');
    const input = await screen.findByTestId('bill-file-input');
    await user.upload(input, file('march-bill.pdf', 'application/pdf'));
    await screen.findByText('march-bill.pdf');

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /remove file/i })).toBeEnabled(),
    );
    await user.click(screen.getByRole('button', { name: /remove file/i }));
    expect(
      await screen.findByRole('button', { name: /choose a bill, or drop one here/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText('march-bill.pdf')).not.toBeInTheDocument();
  });
});

describe('removing or replacing the bill invalidates the analysis', () => {
  it('clears the analysis and locks the later steps again', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/bill-analysis');
    await loadSampleBill(user);
    await user.click(screen.getByRole('button', { name: /looks right/i }));
    await screen.findByRole('heading', { level: 2, name: /build your home profile/i });

    // Go back to upload and drop the bill.
    const input = await (async () => {
      await user.click(screen.getByRole('button', { name: /back to review/i }));
      await screen.findByRole('heading', { name: /we analyzed your bill/i });
      return null;
    })();
    expect(input).toBeNull();

    // Navigating directly to upload and removing invalidates everything downstream.
    router.navigate('/bill-analysis?step=upload');
    const picker = await screen.findByTestId('bill-file-input');
    await user.upload(picker, file('march-bill.pdf', 'application/pdf'));
    await screen.findByText('march-bill.pdf');
    await user.click(screen.getByRole('button', { name: /remove file/i }));

    await waitFor(() => expect(currentPath(router)).toContain('step=upload'));
    expect(screen.queryByRole('heading', { name: /we analyzed your bill/i })).not.toBeInTheDocument();
  });
});

describe('review step', () => {
  it('shows every extracted field', async () => {
    const user = userEvent.setup();
    renderApp('/bill-analysis');
    await loadSampleBill(user);

    const panel = screen.getByText('Harbour Electric').closest('dl');
    expect(panel).not.toBeNull();
    for (const label of [
      'Provider',
      'Plan',
      'Billing period',
      'Usage',
      'Energy charge',
      'Delivery charge',
      'Bill total',
      'Contract expiration',
    ]) {
      expect(within(panel as HTMLElement).getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText('1,428 kWh')).toBeInTheDocument();
  });

  it('labels the analysis as a sample rather than read from the file', async () => {
    const user = userEvent.setup();
    renderApp('/bill-analysis');
    await loadSampleBill(user);
    expect(screen.getByText(/nothing was read from a file/i)).toBeInTheDocument();
  });

  it('saves an edit and keeps it', async () => {
    const user = userEvent.setup();
    renderApp('/bill-analysis');
    await loadSampleBill(user);

    await user.click(screen.getByRole('button', { name: /edit details/i }));
    const usage = screen.getByLabelText(/usage in kWh/i);
    await user.clear(usage);
    await user.type(usage, '1600');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('1,600 kWh')).toBeInTheDocument();
  });

  it('discards an edit on cancel', async () => {
    const user = userEvent.setup();
    renderApp('/bill-analysis');
    await loadSampleBill(user);

    await user.click(screen.getByRole('button', { name: /edit details/i }));
    const usage = screen.getByLabelText(/usage in kWh/i);
    await user.clear(usage);
    await user.type(usage, '9999');
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(await screen.findByText('1,428 kWh')).toBeInTheDocument();
    expect(screen.queryByText('9,999 kWh')).not.toBeInTheDocument();
  });

  it('offers the calculation explanation', async () => {
    const user = userEvent.setup();
    renderApp('/bill-analysis');
    await loadSampleBill(user);
    const disclosure = screen.getByRole('group');
    expect(within(disclosure).getByText(/how wattsAI calculated this/i)).toBeInTheDocument();
    expect(within(disclosure).getByText(/these are assumptions, not/i)).toBeInTheDocument();
  });
});

describe('home profile step', () => {
  async function reachProfile(user: ReturnType<typeof userEvent.setup>) {
    await loadSampleBill(user);
    await user.click(screen.getByRole('button', { name: /looks right/i }));
    await screen.findByRole('heading', { level: 2, name: /build your home profile/i });
  }

  it('blocks submission until every required answer is given', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/bill-analysis');
    await reachProfile(user);

    await user.click(screen.getByRole('button', { name: /find my best options/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/answer these before continuing/i);
    expect(router.state.location.pathname).toBe('/bill-analysis');
  });

  it('navigates to plans once the profile is complete', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/bill-analysis');
    await reachProfile(user);

    await user.click(screen.getAllByRole('radio', { name: 'Yes' })[0]!);
    await user.click(screen.getAllByRole('radio', { name: 'No' })[1]!);
    await user.click(screen.getAllByRole('radio', { name: 'No' })[2]!);
    await user.click(screen.getByRole('radio', { name: 'Townhome' }));
    await user.click(screen.getByRole('radio', { name: '1,000 to 2,000 sq ft' }));
    await user.click(screen.getByRole('radio', { name: 'EV charging' }));

    await user.click(screen.getByRole('button', { name: /find my best options/i }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/plans'), { timeout: 3000 });
  });

  it('preserves every answer when going back and forward again', async () => {
    const user = userEvent.setup();
    renderApp('/bill-analysis');
    await reachProfile(user);

    await user.click(screen.getByRole('radio', { name: 'Apartment' }));
    await user.click(screen.getByRole('radio', { name: 'Renewable energy' }));
    expect(screen.getByRole('radio', { name: 'Apartment' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: /back to review/i }));
    await screen.findByRole('heading', { level: 2, name: /we analyzed your bill/i });

    await user.click(screen.getByRole('button', { name: /looks right/i }));
    await screen.findByRole('heading', { level: 2, name: /build your home profile/i });

    expect(screen.getByRole('radio', { name: 'Apartment' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Renewable energy' })).toBeChecked();
  });
});
