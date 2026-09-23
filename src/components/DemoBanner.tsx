import { Icon, Text } from '@/ds';

export interface DemoBannerProps {
  children: string;
  tone?: 'light' | 'dark' | undefined;
}

/** States plainly that what follows is simulated. Used wherever numbers are shown. */
export function DemoBanner({ children, tone = 'light' }: DemoBannerProps) {
  const dark = tone === 'dark';
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-12)',
        alignItems: 'flex-start',
        padding: 'var(--space-16)',
        borderRadius: 'var(--radius-field)',
        border: `1px solid ${dark ? 'var(--border-on-dark)' : 'var(--border-default)'}`,
        background: dark ? 'var(--white-5)' : 'var(--ink-5)',
      }}
    >
      <Icon name="DataExploration" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
      <Text as="span" size="small" dark={dark} muted={!dark}>
        {children}
      </Text>
    </div>
  );
}
