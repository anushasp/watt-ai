import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface CountUpOptions {
  /** Start counting only once this is true, e.g. when the element enters the viewport. */
  enabled?: boolean;
  /** How long the first count-up takes. Later changes use their own, shorter timing. */
  durationMs?: number;
  /**
   * Whether the first value counts up from zero. Turn it off for a figure that is one of
   * many on screen, where a grid of numbers all counting at once would be noise — those
   * still transition when they later change.
   */
  animateFirst?: boolean;
}

/**
 * A change to a number already on screen is a correction, not an arrival, so it moves at
 * UI speed rather than taking the full reveal duration again.
 */
const CHANGE_MS = 320;

/** Decelerating curve, matching --ease-enter. No overshoot. */
function easeOut(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Animates toward `target`.
 *
 * The first time, it counts up from zero, and only once `enabled` is true — so a figure
 * below the fold counts up when it is reached rather than having already finished. After
 * that, any change tweens from whatever is currently on screen to the new value, including
 * from mid-flight, so a number that updates twice in quick succession never jumps back to
 * zero or snaps.
 *
 * Returns `target` immediately when the user prefers reduced motion. The global CSS rule in
 * `tokens/a11y.css` cannot reach a value computed in JS, so this is the guard for it.
 */
export function useCountUp(
  target: number,
  { enabled = true, durationMs = 500, animateFirst = true }: CountUpOptions = {},
): number {
  const reduced = usePrefersReducedMotion();
  // Starts at zero whenever a count-up will happen, so the final value is never painted
  // first and then reset — that reads as a flicker.
  const skipReveal = reduced || !animateFirst;
  const [value, setValue] = useState(() => (skipReveal ? target : 0));
  // What is actually on screen. A new target animates from here, wherever the last one
  // got to, rather than restarting.
  const current = useRef(value);
  // Seeded true when the reveal is skipped, so the very first change is treated as a
  // change — at change speed — rather than as an arrival.
  const hasRun = useRef(!animateFirst);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (reduced) {
      current.current = target;
      setValue(target);
      return;
    }
    // Not on screen yet, and never has been. Hold at zero rather than painting the final
    // value, which would then have to be undone the moment the count-up starts.
    if (!enabled && !hasRun.current) return;

    const from = current.current;
    if (from === target) return;

    // hasRun is only ever set on COMPLETION. StrictMode mounts effects twice, and setting
    // it upfront would let the first run's cleanup cancel the frame and the second run
    // treat the reveal as already done.
    const duration = hasRun.current ? CHANGE_MS : durationMs;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const next = progress < 1 ? from + (target - from) * easeOut(progress) : target;
      current.current = next;
      setValue(next);
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        hasRun.current = true;
      }
    };
    frame.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame.current);
    };
  }, [target, enabled, durationMs, reduced]);

  return value;
}
