import type { ReactNode } from 'react';
import type { BaseProps } from '../types';

export type TextSize = 'large' | 'medium' | 'regular' | 'small' | 'tiny';

export interface TextProps extends BaseProps {
  role?: string | undefined;
  'aria-live'?: 'polite' | 'assertive' | 'off' | undefined;
  as?: 'p' | 'span' | 'div' | undefined;
  size?: TextSize | undefined;
  dark?: boolean | undefined;
  muted?: boolean | undefined;
  weight?: 400 | 500 | 600 | undefined;
  children: ReactNode;
}

export function Text({
  as: Tag = 'p',
  size = 'regular',
  dark = false,
  muted = false,
  weight = 400,
  children,
  className,
  style,
  ...rest
}: TextProps) {
  const color = dark
    ? muted
      ? 'var(--text-on-dark-muted)'
      : 'var(--text-on-dark)'
    : muted
      ? 'var(--text-muted)'
      : 'var(--text-primary)';
  return (
    <Tag
      className={className}
      style={{
        margin: 0,
        fontFamily: 'var(--font-body)',
        fontSize: `var(--text-${size})`,
        lineHeight: 'var(--leading-body)',
        fontWeight: weight,
        color,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
