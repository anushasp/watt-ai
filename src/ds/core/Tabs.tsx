import { useRef, type KeyboardEvent } from 'react';
import type { BaseProps } from '../types';
import { cn } from '../types';
import { Icon, type IconName } from '../icons/Icon';
import styles from './Tabs.module.css';

export interface TabOption {
  readonly value: string;
  readonly label: string;
  readonly icon?: IconName | undefined;
}

export interface TabsProps extends BaseProps {
  options: readonly TabOption[];
  value: string;
  onChange: (value: string) => void;
  /** Accessible name for the tablist. */
  label: string;
  /** Maps a tab value to the id of the panel it controls. */
  panelId?: (value: string) => string;
  alternate?: boolean | undefined;
}

/**
 * A real tablist: roving tabIndex, arrow/Home/End keys and aria-controls.
 * The design system's version announced as a tablist but did not behave like one.
 */
export function Tabs({
  options,
  value,
  onChange,
  label,
  panelId,
  alternate = false,
  className,
  style,
}: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (index: number) => {
    const next = options[index];
    if (!next) return;
    onChange(next.value);
    refs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = options.length - 1;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusTab(index === last ? 0 : index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusTab(index === 0 ? last : index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTab(0);
        break;
      case 'End':
        event.preventDefault();
        focusTab(last);
        break;
      default:
        break;
    }
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(styles.tablist, alternate && styles.alternate, className)}
      style={style}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={panelId ? `${panelId(option.value)}-tab` : undefined}
            aria-selected={selected}
            aria-controls={panelId ? panelId(option.value) : undefined}
            tabIndex={selected ? 0 : -1}
            className={styles.tab}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {option.icon ? <Icon name={option.icon} size={20} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
