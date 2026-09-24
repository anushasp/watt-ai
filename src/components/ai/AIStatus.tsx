import { Text } from '@/ds';
import styles from './AIStatus.module.css';

export type AIStatusValue =
  | 'idle'
  | 'analyzing'
  | 'searching'
  | 'generating'
  | 'success'
  | 'error';

/** The words each state is announced with. Callers override with `label`. */
const DEFAULT_LABELS: Readonly<Record<AIStatusValue, string>> = {
  idle: 'wattsAI is ready',
  analyzing: 'Analyzing',
  searching: 'Searching',
  generating: 'Generating a recommendation',
  success: 'Done',
  error: 'Something went wrong',
};

const SPOKES = 6;
const CENTER = 24;
const INNER = 11;
const OUTER = 21;

/** Six spokes on a hexagon, drawn hub-outward so a pulse can travel either way along them. */
const RAYS = Array.from({ length: SPOKES }, (_, i) => {
  const angle = (i * 2 * Math.PI) / SPOKES - Math.PI / 2;
  return {
    i,
    x1: CENTER + Math.cos(angle) * INNER,
    y1: CENTER + Math.sin(angle) * INNER,
    x2: CENTER + Math.cos(angle) * OUTER,
    y2: CENTER + Math.sin(angle) * OUTER,
  };
});

export interface AIStatusProps {
  status: AIStatusValue;
  /** Overrides the announced and, when shown, visible wording. */
  label?: string | undefined;
  /** Renders the wording beside the mark. Off by default: most callers have their own copy. */
  showLabel?: boolean | undefined;
  size?: number | undefined;
  /**
   * Drops the live region. Pass this when the caller already announces the same change,
   * so a screen reader is not told twice.
   */
  silent?: boolean | undefined;
  className?: string | undefined;
}

/**
 * What wattsAI is doing, as energy rather than as a spinner.
 *
 * Six spokes around a hub: they light in sequence while it analyzes, push outward while it
 * searches, and are drawn back in while it generates. Success collapses the hub into an
 * expanding ring with a check; error is a colour and a settled shape, with nothing moving.
 *
 * The status it shows is whatever it is handed. It runs no timers and waits for nothing, so
 * it can never be the reason a flow appears slower than it is.
 */
export function AIStatus({
  status,
  label,
  showLabel = false,
  size = 40,
  silent = false,
  className,
}: AIStatusProps) {
  const text = label ?? DEFAULT_LABELS[status];
  const busy = status === 'analyzing' || status === 'searching' || status === 'generating';

  return (
    <span
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-status={status}
      {...(silent ? {} : { role: 'status', 'aria-live': 'polite' as const })}
    >
      <svg
        className={styles.mark}
        viewBox="0 0 48 48"
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
      >
        {RAYS.map((ray) => (
          <line
            key={ray.i}
            className={styles.spoke}
            style={{ ['--spoke' as string]: ray.i }}
            x1={ray.x1}
            y1={ray.y1}
            x2={ray.x2}
            y2={ray.y2}
          />
        ))}
        {/* The pulses share the spokes' geometry exactly, so they can only ever travel
            along a spoke rather than beside it. */}
        {busy
          ? RAYS.map((ray) => (
              <line
                key={`pulse-${ray.i}`}
                className={styles.pulse}
                data-ambient=""
                style={{ ['--spoke' as string]: ray.i }}
                x1={ray.x1}
                y1={ray.y1}
                x2={ray.x2}
                y2={ray.y2}
              />
            ))
          : null}

        <circle className={styles.hub} cx={CENTER} cy={CENTER} r={7} />
        <circle className={styles.ring} cx={CENTER} cy={CENTER} r={14} />
        <path
          className={styles.check}
          pathLength={1}
          d="M17.5 24.5 L22 29 L30.5 20"
        />
      </svg>

      {showLabel ? (
        <Text as="span" size="small" muted={status === 'idle'}>
          {text}
        </Text>
      ) : (
        <span className="sr-only">{text}</span>
      )}
    </span>
  );
}
