import { useRef, type CSSProperties } from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import { useInViewOnce } from '@/hooks/useInViewOnce';

export interface AnimatedNumberProps {
  /** The real value. Always what assistive technology reads. */
  to: number;
  /** Formats the in-flight number. Use the shared formatters in services/money. */
  format: (value: number) => string;
  durationMs?: number | undefined;
  /**
   * Whether to count up the first time this is seen. Turn it off where the number is one
   * of many on screen; it will still transition smoothly when the value changes.
   */
  countOnReveal?: boolean | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/**
 * Counts up to a number the first time it enters the viewport.
 *
 * The animating text is hidden from assistive technology and the final value is exposed in
 * a visually hidden span, so a screen reader reads the real figure once rather than a
 * stream of intermediate numbers. Under reduced motion the count-up is skipped entirely
 * by `useCountUp` and the final value renders immediately.
 */
export function AnimatedNumber({
  to,
  format,
  durationMs,
  countOnReveal = true,
  className,
  style,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInViewOnce(ref);
  const current = useCountUp(to, {
    enabled: seen,
    animateFirst: countOnReveal,
    ...(durationMs ? { durationMs } : {}),
  });

  return (
    <span ref={ref} className={className} style={style}>
      <span aria-hidden="true">{format(current)}</span>
      <span className="sr-only">{format(to)}</span>
    </span>
  );
}
