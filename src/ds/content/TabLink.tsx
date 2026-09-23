import type { BaseProps, HeadingLevel } from '../types';
import { cn } from '../types';
import { Heading } from '../primitives/Heading';
import { Text } from '../primitives/Text';
import styles from './TabLink.module.css';

export interface TabLinkProps extends BaseProps {
  heading: string;
  text?: string | undefined;
  active?: boolean | undefined;
  onSelect?: () => void;
  headingLevel?: HeadingLevel | undefined;
  /** Id of the panel this row controls, when used inside a tablist. */
  controls?: string | undefined;
}

/**
 * A stacked selectable row. Renders a real <button> when interactive — the design
 * system used a bare clickable <div>.
 */
export function TabLink({
  heading,
  text,
  active = false,
  onSelect,
  headingLevel = 3,
  controls,
  className,
  style,
  id,
}: TabLinkProps) {
  const content = (
    <>
      <Heading level={headingLevel} scale="h4">
        {heading}
      </Heading>
      {text ? <Text style={{ marginTop: 'var(--space-12)' }}>{text}</Text> : null}
    </>
  );

  if (!onSelect) {
    return (
      <div id={id} className={cn(styles.item, styles.static, className)} style={style}>
        {content}
      </div>
    );
  }

  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      className={cn(styles.item, className)}
      style={style}
    >
      {content}
    </button>
  );
}
