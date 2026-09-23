import '@testing-library/jest-dom/vitest';

// jsdom does not implement these; several components rely on them.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// jsdom has no <dialog> implementation.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
}
if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};

/**
 * jsdom installs its own AbortSignal, but the global Request comes from undici, which
 * rejects a signal from a different realm. React Router builds a Request for every
 * navigation, so without this every route change throws. The signal is only dropped
 * when construction actually fails, so real behaviour is untouched.
 */
const NativeRequest = globalThis.Request;
globalThis.Request = new Proxy(NativeRequest, {
  construct(target, args: [unknown, Record<string, unknown> | undefined]) {
    const [input, init] = args;
    try {
      return Reflect.construct(target, [input, init]);
    } catch (error) {
      if (init && typeof init === 'object' && 'signal' in init) {
        const { signal: _dropped, ...rest } = init;
        return Reflect.construct(target, [input, rest]);
      }
      throw error;
    }
  },
});
