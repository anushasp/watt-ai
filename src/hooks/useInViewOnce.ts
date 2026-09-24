import { useEffect, useState, type RefObject } from 'react';

/** How long to wait for the observer before revealing anyway. */
const FALLBACK_MS = 2000;

/**
 * Fires once when the element first enters the viewport, then disconnects.
 *
 * One observer per element, torn down immediately after firing — no scroll listeners and
 * nothing left running. Returns true forever after, so a reveal never replays on scroll-back.
 *
 * Returns true immediately when IntersectionObserver is unavailable, so content is never
 * gated behind a capability check.
 */
export function useInViewOnce(ref: RefObject<Element | null>, rootMargin = '0px 0px -10% 0px'): boolean {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen) return;
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    observer.observe(element);

    /*
     * Safety net. Some embedded browsers and privacy extensions expose
     * IntersectionObserver but never deliver callbacks, which would leave revealed content
     * hidden forever. Visible content is non-negotiable; a missed animation is cosmetic, so
     * after a grace period we reveal regardless.
     */
    const fallback = window.setTimeout(() => setSeen(true), FALLBACK_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [ref, rootMargin, seen]);

  return seen;
}
