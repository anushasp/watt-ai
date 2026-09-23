import type { ReactNode } from 'react';
import type { BaseProps } from '../types';
import { Text } from '../primitives/Text';

export interface StatCardProps extends BaseProps {
  value: string;
  label: string;
  /** dark = on the green Scheme 4 band · light = white card on a light band. */
  tone?: 'dark' | 'light' | undefined;
  /** Optional comparison line. Always name the baseline in the caller. */
  detail?: string | undefined;
  children?: ReactNode | undefined;
}

/** One headline number in Roboto Bold — the only Roboto usage in the system. */
export function StatCard({
  value,
  label,
  tone = 'dark',
  detail,
  children,
  className,
  style,
  id,
}: StatCardProps) {
  const isDark = tone === 'dark';
  return (
    <div
      id={id}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-8)',
        padding: 'var(--space-32)',
        borderRadius: 'var(--radius-card)',
        border: `1px solid ${isDark ? 'var(--border-on-dark)' : 'var(--border-default)'}`,
        background: isDark ? 'var(--surface-card-dark)' : 'var(--surface-card)',
        height: '100%',
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-numeric)',
          fontWeight: 'var(--weight-bold)',
          fontSize: 'var(--text-stat)',
          lineHeight: 1.1,
          color: isDark ? 'var(--text-on-dark)' : 'var(--text-primary)',
        }}
      >
        {value}
      </span>
      <Text as="span" size="medium" weight={500} dark={isDark}>
        {label}
      </Text>
      {detail ? (
        <Text as="span" size="small" dark={isDark} muted>
          {detail}
        </Text>
      ) : null}
      {children}
    </div>
  );
}
