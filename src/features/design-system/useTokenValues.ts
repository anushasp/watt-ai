import { useEffect, useState } from 'react';

/**
 * Reads live CSS custom property values off the document root.
 *
 * The design system stays the source of truth: this page never stores a colour, size or
 * radius of its own. If a token changes in `src/styles/tokens/`, this page changes with it.
 *
 * Several tokens are redefined at the 767px breakpoint, so the values are re-read when the
 * viewport crosses it — otherwise the documented value would silently stop matching what
 * the page is actually rendering.
 */
export function useTokenValues(names: readonly string[]): Readonly<Record<string, string>> {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const computed = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const name of names) {
        next[name] = computed.getPropertyValue(name).trim();
      }
      setValues(next);
    };

    read();
    const query = window.matchMedia('(max-width: 767px)');
    query.addEventListener('change', read);
    window.addEventListener('resize', read);
    return () => {
      query.removeEventListener('change', read);
      window.removeEventListener('resize', read);
    };
  }, [names]);

  return values;
}

/** Formats a value for display, falling back when the property is not resolvable. */
export function displayValue(raw: string | undefined): string {
  if (!raw) return '—';
  return raw.length > 64 ? `${raw.slice(0, 61)}…` : raw;
}
