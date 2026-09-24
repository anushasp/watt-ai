import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCountUp } from './useCountUp';

/** Drives the animation frames and the clock together, as a real browser would. */
function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('useCountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts up from zero the first time, and lands exactly on the target', () => {
    const { result } = renderHook(() => useCountUp(100, { durationMs: 500 }));
    expect(result.current).toBe(0);

    advance(250);
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(100);

    advance(300);
    expect(result.current).toBe(100);
  });

  it('holds at zero until it is enabled, so a figure below the fold has not already run', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useCountUp(50, { enabled, durationMs: 500 }),
      { initialProps: { enabled: false } },
    );
    advance(1000);
    expect(result.current).toBe(0);

    rerender({ enabled: true });
    advance(600);
    expect(result.current).toBe(50);
  });

  it('transitions from the old value to the new one, never back through zero', () => {
    const { result, rerender } = renderHook(({ to }) => useCountUp(to, { durationMs: 500 }), {
      initialProps: { to: 100 },
    });
    advance(600);
    expect(result.current).toBe(100);

    rerender({ to: 200 });
    advance(80);
    // Mid-flight it is between the two values — it did not restart from zero.
    expect(result.current).toBeGreaterThan(100);
    expect(result.current).toBeLessThan(200);

    advance(400);
    expect(result.current).toBe(200);
  });

  it('picks up from wherever it is when the target changes mid-flight', () => {
    const { result, rerender } = renderHook(({ to }) => useCountUp(to, { durationMs: 500 }), {
      initialProps: { to: 100 },
    });
    advance(100);
    const partway = result.current;
    expect(partway).toBeGreaterThan(0);
    expect(partway).toBeLessThan(100);

    rerender({ to: 10 });
    // The next frame continues down from where it was rather than snapping.
    advance(16);
    expect(result.current).toBeLessThan(partway);
    advance(500);
    expect(result.current).toBe(10);
  });

  it('counts down as readily as up', () => {
    const { result, rerender } = renderHook(({ to }) => useCountUp(to, { durationMs: 500 }), {
      initialProps: { to: 80 },
    });
    advance(600);
    rerender({ to: 20 });
    advance(400);
    expect(result.current).toBe(20);
  });

  it('renders the real figure immediately under reduced motion, and never counts', () => {
    // The global CSS rule cannot reach a value computed in JS, so this hook is the only
    // thing standing between a reduced-motion user and a number ticking up at them.
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    try {
      const { result, rerender } = renderHook(({ to }) => useCountUp(to, { durationMs: 500 }), {
        initialProps: { to: 528 },
      });
      expect(result.current).toBe(528);

      // A later change lands on the new figure at once rather than travelling to it.
      rerender({ to: 96 });
      expect(result.current).toBe(96);
      advance(16);
      expect(result.current).toBe(96);
    } finally {
      window.matchMedia = original;
    }
  });

  it('skips the reveal when asked, but still transitions later changes', () => {
    const { result, rerender } = renderHook(
      ({ to }) => useCountUp(to, { animateFirst: false, durationMs: 500 }),
      { initialProps: { to: 143 } },
    );
    // No count-up: the real figure is there from the first paint.
    expect(result.current).toBe(143);

    rerender({ to: 96 });
    advance(80);
    expect(result.current).toBeLessThan(143);
    expect(result.current).toBeGreaterThan(96);
    advance(400);
    expect(result.current).toBe(96);
  });
});
