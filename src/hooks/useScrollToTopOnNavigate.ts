import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

/**
 * Puts a newly opened page at the top.
 *
 * Deliberately NOT react-router's `<ScrollRestoration />`. That component keys off
 * `location.key`, which changes on every navigation — including the `setSearchParams`
 * calls behind the plans filters, the dashboard tabs and the bill-analysis steps. It would
 * throw the reader back to the top of the page every time they ticked a filter, which is
 * the opposite of what those controls are for.
 *
 * Keying on `pathname` instead means:
 *   · choosing a primary nav destination scrolls to the top
 *   · changing a filter, tab or step does not move the page at all
 *   · a same-page anchor (the skip link, the docs sidebar) never reaches this hook,
 *     because the pathname has not changed
 *
 * A destination carrying a hash scrolls to that element rather than to the top, so the
 * footer's `/#how-it-works` style links land where they say they will.
 *
 * The scroll is instant on purpose. Smooth-scrolling a fresh page means watching content
 * you did not ask for slide past, and it races the browser's own paint.
 */
export function useScrollToTopOnNavigate(): void {
  const { pathname, hash } = useLocation();
  // The first render is a page load, not a navigation. The browser has already positioned
  // the document — at a hash, or at a position it restored on reload — and overriding that
  // would undo it.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
}
