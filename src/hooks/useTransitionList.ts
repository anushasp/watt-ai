import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export type ItemPhase = 'entering' | 'present' | 'exiting';

export interface TransitionItem<T> {
  readonly key: string;
  readonly item: T;
  readonly phase: ItemPhase;
}

interface ListState<T> {
  readonly signature: string;
  readonly entries: readonly TransitionItem<T>[];
}

/** A separator that cannot appear in an id, so two different lists cannot collide. */
function signatureOf<T>(items: readonly T[], keyOf: (item: T) => string): string {
  return items.map(keyOf).join('\u0000');
}

/**
 * Keeps removed items rendered long enough to animate out.
 *
 * React unmounts a filtered-out item on the same tick, so there is no frame left in which
 * to fade it. This holds it in the list for `exitMs`, marked `exiting`, then drops it. New
 * items arrive marked `entering` and flip to `present` on the next frame, which is what
 * gives a CSS transition two states to move between.
 *
 * An exiting item keeps the position it had, so the items around it do not reflow
 * underneath it mid-fade: the grid settles once, after the fade, rather than shuffling
 * while the reader is still looking at it.
 *
 * Under reduced motion the exit is skipped outright. Holding a removed item on screen for
 * 200ms is only worth doing if that time is being spent animating it.
 */
export function useTransitionList<T>(
  items: readonly T[],
  keyOf: (item: T) => string,
  exitMs = 200,
): readonly TransitionItem<T>[] {
  const reduced = usePrefersReducedMotion();
  const signature = signatureOf(items, keyOf);

  const [state, setState] = useState<ListState<T>>(() => ({
    signature,
    // Whatever is there on the first render is simply there. Animating the initial list in
    // would mean every plan fading up on arrival, which is not what filtering looks like.
    entries: items.map((item) => ({ key: keyOf(item), item, phase: 'present' as const })),
  }));

  /*
   * Derived during render rather than in an effect. The list has already changed by the
   * time an effect runs, so an effect would paint the new set once without its entering
   * state and then correct itself — a visible flash of the finished layout.
   */
  let entries = state.entries;
  if (state.signature !== signature) {
    const previous = state.entries;
    const nextKeys = new Set(items.map(keyOf));
    const previousByKey = new Map(previous.map((entry) => [entry.key, entry]));

    const next: TransitionItem<T>[] = items.map((item) => {
      const key = keyOf(item);
      const existing = previousByKey.get(key);
      return {
        key,
        item,
        // Something on its way out that has come back is not new. Treating it as new would
        // restart it from the entering state, which reads as a flicker.
        phase: existing && existing.phase !== 'exiting' ? 'present' : ('entering' as const),
      };
    });

    if (!reduced) {
      previous.forEach((entry, index) => {
        if (nextKeys.has(entry.key)) return;
        const exiting = entry.phase === 'exiting' ? entry : { ...entry, phase: 'exiting' as const };
        next.splice(Math.min(index, next.length), 0, exiting);
      });
    }

    entries = next;
    setState({ signature, entries: next });
  } else {
    /*
     * Same keys, but the data behind them may have been recomputed — a plan keeps its id
     * while its estimated price changes. Without this the card would go on showing the
     * figure it was first rendered with.
     *
     * Compared by reference and only replaced when something actually differs, so the
     * array identity stays stable and the effects below do not re-run every render.
     */
    const byKey = new Map(items.map((item) => [keyOf(item), item]));
    let changed = false;
    const refreshed = entries.map((entry) => {
      const latest = byKey.get(entry.key);
      if (latest === undefined || latest === entry.item) return entry;
      changed = true;
      return { ...entry, item: latest };
    });
    if (changed) {
      entries = refreshed;
      setState({ signature, entries: refreshed });
    }
  }

  // Entering -> present on the next frame, so the browser paints the start state first and
  // the transition has somewhere to travel from.
  useEffect(() => {
    if (!entries.some((entry) => entry.phase === 'entering')) return;

    const promote = () => {
      setState((current) => ({
        ...current,
        entries: current.entries.map((entry) =>
          entry.phase === 'entering' ? { ...entry, phase: 'present' } : entry,
        ),
      }));
    };

    const frame = requestAnimationFrame(promote);
    /*
     * A backstop, because an entering item is rendered at opacity 0 and only the promotion
     * brings it back. Browsers stop servicing animation frames in a hidden tab, so without
     * this an item that arrived just as the tab was hidden would still be invisible when
     * the reader came back. Invisible content is not an acceptable failure mode for a
     * missed animation.
     */
    const fallback = window.setTimeout(promote, 80);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
    };
  }, [entries]);

  // One timer for the whole departing batch: they all left on the same filter change, so
  // they all finish together.
  useEffect(() => {
    if (!entries.some((entry) => entry.phase === 'exiting')) return;
    const timer = window.setTimeout(() => {
      setState((current) => ({
        ...current,
        entries: current.entries.filter((entry) => entry.phase !== 'exiting'),
      }));
    }, exitMs);
    return () => window.clearTimeout(timer);
  }, [entries, exitMs]);

  return entries;
}
