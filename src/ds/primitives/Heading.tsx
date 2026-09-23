import type { ReactNode } from 'react';
import type { BaseProps, HeadingLevel, TypeScale } from '../types';
import { cn } from '../types';

export interface HeadingProps extends BaseProps {
  /** Set to -1 to make the heading a programmatic focus target after a step change. */
  tabIndex?: number | undefined;
  /** Semantic outline position. Required, and never inferred from `scale`. */
  level: HeadingLevel;
  /** Visual type token. Defaults to the token matching `level`. */
  scale?: TypeScale | undefined;
  dark?: boolean | undefined;
  children: ReactNode;
}

const DEFAULT_SCALE: Record<HeadingLevel, TypeScale> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6',
};

/** Leading tightens as type gets larger, matching the design system's rules. */
function leadingFor(scale: TypeScale): string {
  if (scale === 'h6') return 'var(--leading-h6)';
  if (scale === 'h5' || scale === 'h4') return 'var(--leading-subheading)';
  return 'var(--leading-heading)';
}

/**
 * The design system renders every heading as a <span>, leaving pages with no document
 * outline. This primitive separates semantics (`level`) from appearance (`scale`) so the
 * type scale is preserved while the outline becomes correct.
 */
export function Heading({ level, scale, dark = false, children, className, style, ...rest }: HeadingProps) {
  const token = scale ?? DEFAULT_SCALE[level];
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return (
    <Tag
      className={cn('ds-heading', className)}
      style={{
        margin: 0,
        fontFamily: 'var(--font-display)',
        fontWeight: 'var(--weight-display)',
        fontSize: `var(--text-${token})`,
        lineHeight: leadingFor(token),
        letterSpacing: 'var(--tracking-heading)',
        color: dark ? 'var(--text-on-dark)' : 'var(--text-primary)',
        textWrap: 'balance',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
