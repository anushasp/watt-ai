import type { BaseProps } from '../types';

export interface CompanyLogoProps extends BaseProps {
  /** White wordmark, for dark surfaces. */
  alternate?: boolean | undefined;
}

/**
 * The source .fig ships no wattsAI mark — the design system uses Relume's placeholder
 * "Logo" wordmark. This renders the product name in Raleway, the system's display face.
 */
export function CompanyLogo({ alternate = false, className, style }: CompanyLogoProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 22,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        color: alternate ? 'var(--neutral-white)' : 'var(--neutral-darkest)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      watts<span style={{ color: alternate ? 'var(--neutral-white)' : 'var(--watercourse)' }}>AI</span>
    </span>
  );
}
