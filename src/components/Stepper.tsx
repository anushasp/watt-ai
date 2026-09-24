import { Icon } from '@/ds';
import styles from './Stepper.module.css';

export interface StepperStep {
  readonly id: string;
  readonly label: string;
}

export interface StepperProps {
  steps: readonly StepperStep[];
  currentIndex: number;
  label?: string | undefined;
}

type StepState = 'complete' | 'current' | 'upcoming';

/** What a screen reader hears in place of the marker. */
const SPOKEN: Readonly<Record<StepState, string>> = {
  complete: 'Completed step: ',
  current: 'Current step: ',
  upcoming: 'Upcoming step: ',
};

/**
 * Progress through the bill-analysis flow, drawn as a track rather than a row of boxes.
 *
 * The rail behind the markers fills to the step you are on, so moving forward is a single
 * continuous movement across the whole control instead of one box changing colour. That is
 * the part worth animating: it is the only thing on screen that shows how far through you
 * are and how much is left.
 *
 * Each marker keeps its number and its tick mounted together and cross-fades between them,
 * so completing a step is a transition on one element rather than a swap.
 */
export function Stepper({ steps, currentIndex, label = 'Bill analysis progress' }: StepperProps) {
  // The rail runs between the FIRST and LAST marker centres, not edge to edge, so the
  // fraction is over the gaps between steps rather than over the steps themselves.
  const gaps = Math.max(1, steps.length - 1);
  const progress = Math.min(1, Math.max(0, currentIndex / gaps));

  return (
    <nav aria-label={label}>
      <ol
        className={styles.list}
        style={{
          ['--steps' as string]: steps.length,
          ['--progress' as string]: progress,
        }}
      >
        {/* Decorative: the state of every step is already spelled out in each item. */}
        <span className={styles.rail} aria-hidden="true">
          <span className={styles.railFill} />
        </span>

        {steps.map((step, index) => {
          const state: StepState =
            index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming';
          return (
            <li
              key={step.id}
              className={styles.item}
              data-state={state}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className={styles.marker} aria-hidden="true">
                {/* A slow ping that marks where you are. Purely locative — the number, the
                    fill and the label all say the same thing without it. */}
                {state === 'current' ? <span className={styles.ping} data-ambient="" /> : null}
                <span className={styles.number}>{index + 1}</span>
                <span className={styles.tick}>
                  <Icon name="Check" size={14} />
                </span>
              </span>
              <span className={styles.label}>
                <span className="sr-only">{SPOKEN[state]}</span>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
