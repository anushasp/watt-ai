import { useRef, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/ds';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import styles from './Reveal.module.css';

export interface RevealProps {
  children: ReactNode;
  /** Stagger offset in ms. Capped by the caller, not here. */
  delay?: number | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/**
 * Rises 8px and fades in the first time it enters the viewport, then never again.
 *
 * Content is visible by default; the hidden state is applied only when motion is permitted.
 * Under reduced motion this renders as a plain wrapper with no transition at all.
 */
export function Reveal({ children, delay = 0, className, style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const seen = useInViewOnce(ref);
  const hidden = !reduced && !seen;

  return (
    <div
      ref={ref}
      className={cn(styles.reveal, className)}
      data-reveal={hidden ? 'hidden' : 'shown'}
      style={{ ['--reveal-delay' as string]: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/** Caps a stagger so a long list never turns into a slow cascade. */
export function stagger(index: number, step = 60, max = 180): number {
  return Math.min(index * step, max);
}
