import type { ReactNode } from 'react';
import type { BaseProps, HeadingLevel } from '../types';
import { Heading } from '../primitives/Heading';
import { Text } from '../primitives/Text';
import { CheckListItem } from './CheckListItem';
import { Button } from '../core/Button';

export interface PricingCardProps extends BaseProps {
  title: string;
  subtitle?: string | undefined;
  price: string;
  /** e.g. "estimated a month". Rendered beside the price, never merged into it. */
  priceSuffix?: string | undefined;
  cta?: string | undefined;
  features?: readonly string[] | undefined;
  onCta?: () => void;
  headingLevel?: HeadingLevel | undefined;
  highlighted?: boolean | undefined;
  children?: ReactNode | undefined;
}

export function PricingCard({
  title,
  subtitle,
  price,
  priceSuffix,
  cta = 'Choose This Plan',
  features = [],
  onCta,
  headingLevel = 3,
  highlighted = false,
  children,
  className,
  style,
  id,
}: PricingCardProps) {
  return (
    <div
      id={id}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-24)',
        padding: 'var(--space-32)',
        borderRadius: 'var(--radius-card)',
        border: `1px solid ${highlighted ? 'var(--watercourse)' : 'var(--border-default)'}`,
        background: 'var(--surface-card)',
        height: '100%',
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <Heading level={headingLevel} scale="h5">
          {title}
        </Heading>
        {subtitle ? <Text muted>{subtitle}</Text> : null}
      </div>
      <hr
        style={{ border: 0, borderTop: '1px solid var(--border-default)', margin: 0, width: '100%' }}
      />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--weight-display)',
            fontSize: 'var(--text-h1)',
            lineHeight: 1.1,
            letterSpacing: 'var(--tracking-heading)',
          }}
        >
          {price}
        </span>
        {priceSuffix ? (
          <Text as="span" size="medium" muted>
            {priceSuffix}
          </Text>
        ) : null}
      </div>
      {children}
      {features.length > 0 ? (
        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-12)',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {features.map((f) => (
            <CheckListItem key={f}>{f}</CheckListItem>
          ))}
        </ul>
      ) : null}
      <Button fullWidth onClick={onCta} style={{ marginTop: 'auto' }}>
        {cta}
      </Button>
    </div>
  );
}
