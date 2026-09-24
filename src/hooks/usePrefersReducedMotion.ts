import { useCallback, useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * True when the user has asked for reduced motion.
 *
 * The global CSS rule in `tokens/a11y.css` already disables CSS animation. This hook exists
 * for the cases CSS cannot reach — chiefly the count-up, which must render its final value
 * immediately rather than animating to it.
 *
 * Uses useSyncExternalStore rather than useEffect so it is tear-free under concurrent
 * rendering and has no post-mount flash, matching the pattern used elsewhere in the app.
 */
export function usePrefersReducedMotion(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const query = window.matchMedia(QUERY);
    query.addEventListener('change', onChange);
    return () => {
      query.removeEventListener('change', onChange);
    };
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    // Server/test default: assume reduced motion, so nothing animates where it cannot be observed.
    () => true,
  );
}
