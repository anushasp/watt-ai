import { useEffect, useState, type RefObject } from 'react';

/**
 * Tracks whether an element is on screen, and keeps tracking.
 *
 * The sibling hook `useInViewOnce` fires once and disconnects — that is what a reveal
 * wants. This one stays connected, because a continuous animation needs to know when to
 * stop as well as when to start.
 *
 * Returns true when IntersectionObserver is unavailable. A missing capability must never
 * be able to leave an animation permanently paused mid-cycle.
 */
export function useInView(ref: RefObject<Element | null>, rootMargin = '200px'): boolean {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry) setInView(entry.isIntersecting);
      },
      // A generous margin, so the animation is already running by the time it is reached
      // rather than visibly starting up as it scrolls into view.
      { rootMargin },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref, rootMargin]);

  return inView;
}
