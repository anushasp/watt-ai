import type { ReactNode } from 'react';
import type { BaseProps } from '../types';

export interface TagProps extends BaseProps {
  children: ReactNode;
  /** For dark (Scheme 4) surfaces. */
  alternate?: boolean | undefined;
  /** Draws the tag in the brand accent. Use sparingly, for the recommended plan. */
  accent?: boolean | undefined;
}

export function Tag({ children, alternate = false, accent = false, className, style }: TagProps) {
  const background = accent
    ? 'var(--watercourse)'
    : alternate
      ? 'var(--white-15)'
      : 'var(--ink-5)';
  const color = accent || alternate ? 'var(--neutral-white)' : 'var(--neutral-darkest)';
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px var(--space-8)',
        borderRadius: 'var(--radius-tag)',
        background,
        color,
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-small)',
        fontWeight: 'var(--weight-semibold)',
        lineHeight: 1.4,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
