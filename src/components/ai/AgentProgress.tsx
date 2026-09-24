import { Icon } from '@/ds';
import styles from './AgentProgress.module.css';

export type AgentStepState = 'pending' | 'active' | 'complete' | 'error';

export interface AgentStep {
  readonly id: string;
  readonly label: string;
  readonly state: AgentStepState;
}

/** What a screen reader hears in place of the marker. */
const SPOKEN: Readonly<Record<AgentStepState, string>> = {
  pending: 'Not started:',
  active: 'In progress:',
  complete: 'Done:',
  error: 'Failed:',
};

export interface AgentProgressProps {
  steps: readonly AgentStep[];
  label?: string | undefined;
  /**
   * Announces the active step as it changes. Off by default, because a caller that already
   * has a live region would otherwise announce the same thing twice.
   */
  announce?: boolean | undefined;
  className?: string | undefined;
}

/**
 * The agent's working checklist.
 *
 * States come from the caller's real progress. Nothing here advances on a timer, so the
 * list cannot claim work that has not happened.
 *
 * The marker's state is carried by colour and by the tick as well as by movement, so the
 * list is fully readable with every animation switched off.
 */
export function AgentProgress({
  steps,
  label = 'Progress',
  announce = false,
  className,
}: AgentProgressProps) {
  const active = steps.find((s) => s.state === 'active');

  return (
    <div className={className}>
      <ol className={styles.list} aria-label={label}>
        {steps.map((step) => (
          <li key={step.id} className={styles.step} data-state={step.state}>
            <span className={styles.marker} data-state={step.state} aria-hidden="true">
              <span className={styles.dot} />
              <span className={styles.tick}>
                <Icon name={step.state === 'error' ? 'Close' : 'Check'} size={12} />
              </span>
            </span>
            <span className="sr-only">{SPOKEN[step.state]}</span>
            <span className={styles.label}>{step.label}</span>
            {step.state === 'active' ? <span className={styles.rail} data-ambient="" /> : null}
          </li>
        ))}
      </ol>
      {announce ? (
        <div role="status" aria-live="polite" className="sr-only">
          {active ? active.label : ''}
        </div>
      ) : null}
    </div>
  );
}
