import type { ReactNode } from 'react';
import type { BaseProps } from '../types';
import { Icon } from '../icons/Icon';
import { Text } from '../primitives/Text';

export interface CheckListItemProps extends BaseProps {
  children: ReactNode;
  /** Close marks a feature the plan does NOT include. */
  icon?: 'Check' | 'Close' | undefined;
  dark?: boolean | undefined;
}

export function CheckListItem({
  children,
  icon = 'Check',
  dark = false,
  className,
  style,
}: CheckListItemProps) {
  const excluded = icon === 'Close';
  return (
    <li
      className={className}
      style={{ display: 'flex', gap: 'var(--space-12)', alignItems: 'flex-start', ...style }}
    >
      <Icon
        name={icon}
        size={24}
        title={excluded ? 'Not included' : 'Included'}
        style={{ flexShrink: 0, opacity: excluded ? 0.45 : 1 }}
      />
      <Text as="span" dark={dark} muted={excluded}>
        {children}
      </Text>
    </li>
  );
}
