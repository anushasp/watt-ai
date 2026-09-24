import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTransitionList } from './useTransitionList';

interface Item {
  id: string;
}

const item = (id: string): Item => ({ id });
const keyOf = (i: Item) => i.id;
const phases = (entries: readonly { key: string; phase: string }[]) =>
  entries.map((e) => `${e.key}:${e.phase}`);

/** Runs the frame that promotes entering -> present. */
function nextFrame() {
  act(() => {
    vi.advanceTimersByTime(20);
  });
}

describe('useTransitionList', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout'] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the initial list as present, so nothing animates on arrival', () => {
    const { result } = renderHook(() => useTransitionList([item('a'), item('b')], keyOf, 200));
    expect(phases(result.current)).toEqual(['a:present', 'b:present']);
  });

  it('holds a removed item in place, then drops it once the exit is over', () => {
    const { result, rerender } = renderHook(({ items }) => useTransitionList(items, keyOf, 200), {
      initialProps: { items: [item('a'), item('b'), item('c')] },
    });

    rerender({ items: [item('a'), item('c')] });
    // b is still rendered, still in position, and marked on its way out.
    expect(phases(result.current)).toEqual(['a:present', 'b:exiting', 'c:present']);

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(phases(result.current)).toEqual(['a:present', 'c:present']);
  });

  it('marks a new item entering, then promotes it on the next frame', () => {
    const { result, rerender } = renderHook(({ items }) => useTransitionList(items, keyOf, 200), {
      initialProps: { items: [item('a')] },
    });

    rerender({ items: [item('a'), item('b')] });
    expect(phases(result.current)).toEqual(['a:present', 'b:entering']);

    nextFrame();
    expect(phases(result.current)).toEqual(['a:present', 'b:present']);
  });

  it('does not restart an item that leaves and comes straight back', () => {
    const { result, rerender } = renderHook(({ items }) => useTransitionList(items, keyOf, 200), {
      initialProps: { items: [item('a'), item('b')] },
    });

    rerender({ items: [item('a')] });
    expect(phases(result.current)).toEqual(['a:present', 'b:exiting']);

    // Back before the exit finished. It re-enters rather than being stranded exiting.
    rerender({ items: [item('a'), item('b')] });
    expect(phases(result.current)).toEqual(['a:present', 'b:entering']);
    nextFrame();
    expect(phases(result.current)).toEqual(['a:present', 'b:present']);

    // ...and the pending removal must not fire and delete it anyway.
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(phases(result.current)).toEqual(['a:present', 'b:present']);
  });

  it('keeps an emptied list rendered while it fades, then clears it', () => {
    const { result, rerender } = renderHook(({ items }) => useTransitionList(items, keyOf, 200), {
      initialProps: { items: [item('a'), item('b')] },
    });

    rerender({ items: [] as Item[] });
    expect(phases(result.current)).toEqual(['a:exiting', 'b:exiting']);

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toEqual([]);
  });

  it('carries the latest item data for something that is staying', () => {
    interface Priced {
      id: string;
      price: number;
    }
    const { result, rerender } = renderHook(
      ({ items }) => useTransitionList(items, (i: Priced) => i.id, 200),
      { initialProps: { items: [{ id: 'a', price: 1 }] } },
    );
    rerender({ items: [{ id: 'a', price: 2 }] });
    expect(result.current[0]?.item.price).toBe(2);
  });
});

describe('useTransitionList under reduced motion', () => {
  const original = window.matchMedia;
  beforeEach(() => {
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
  });
  afterEach(() => {
    window.matchMedia = original;
  });

  it('drops removed items immediately rather than holding them on screen', () => {
    const { result, rerender } = renderHook(({ items }) => useTransitionList(items, keyOf, 200), {
      initialProps: { items: [item('a'), item('b')] },
    });
    rerender({ items: [item('a')] });
    expect(phases(result.current)).toEqual(['a:present']);
  });
});
