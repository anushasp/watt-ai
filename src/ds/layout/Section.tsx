import type { ReactNode } from 'react';
import type { BaseProps, Scheme } from '../types';
import { cn, isDarkScheme, ON_DARK_CLASS, schemeVar } from '../types';
import styles from './Section.module.css';

export interface SectionProps extends BaseProps {
  scheme?: Scheme | undefined;
  size?: 'lg' | 'md' | 'sm' | undefined;
  children: ReactNode;
  /** Accessible name, when the section is a landmark worth naming. */
  'aria-labelledby'?: string;
}

/** A full-width colour band with the system's vertical rhythm and 1280px content well. */
export function Section({
  scheme = 1,
  size = 'lg',
  children,
  className,
  style,
  id,
  ...rest
}: SectionProps) {
  const dark = isDarkScheme(scheme);
  return (
    <section
      id={id}
      className={cn(
        styles.section,
        size === 'md' && styles.md,
        size === 'sm' && styles.sm,
        dark && ON_DARK_CLASS,
        className,
      )}
      style={{
        background: schemeVar(scheme, 'bg'),
        color: schemeVar(scheme, 'text'),
        ...style,
      }}
      {...rest}
    >
      <div className={styles.inner}>{children}</div>
    </section>
  );
}

export interface GridProps extends BaseProps {
  children: ReactNode;
  /** Minimum column width before the grid reflows. */
  min?: number | undefined;
}

/** Intrinsic card grid — replaces the design system's mobile/desktop column ternaries. */
export function Grid({ children, min = 280, className, style }: GridProps) {
  return (
    <div
      className={cn(styles.grid, className)}
      style={{ ['--grid-min' as string]: `${min}px`, ...style }}
    >
      {children}
    </div>
  );
}

export interface SplitProps extends BaseProps {
  children: ReactNode;
  reverse?: boolean | undefined;
}

/** Two-column copy/media layout that stacks below 900px. */
export function Split({ children, reverse = false, className, style }: SplitProps) {
  return (
    <div className={cn(styles.split, reverse && styles.splitReverse, className)} style={style}>
      {children}
    </div>
  );
}

export function SplitMedia({ children, className, style }: { children: ReactNode } & BaseProps) {
  return (
    <div className={cn(styles.splitMedia, className)} style={style}>
      {children}
    </div>
  );
}
