import type { CSSProperties } from 'react';

/** Color scheme band. 1 white · 2 #F2F2F2 · 3 #D8D8D9 · 4 dark green. */
export type Scheme = 1 | 2 | 3 | 4;

/** Visual type token. Independent of semantic heading level. */
export type TypeScale = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/** Semantic outline position. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface BaseProps {
  className?: string | undefined;
  style?: CSSProperties | undefined;
  id?: string | undefined;
}

/** Sections on scheme 4 carry this class so the focus ring flips to white. */
export const ON_DARK_CLASS = 'on-dark';

export function schemeVar(scheme: Scheme, part: 'bg' | 'fg' | 'text' | 'border' | 'accent'): string {
  return `var(--scheme-${scheme}-${part})`;
}

export function isDarkScheme(scheme: Scheme): boolean {
  return scheme === 4;
}

export function cn(...parts: (string | false | null | undefined)[]): string | undefined {
  const joined = parts.filter(Boolean).join(' ');
  return joined.length > 0 ? joined : undefined;
}
