import { Icon } from '@/ds';
import { cn } from '@/ds';
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

export function Stepper({ steps, currentIndex, label = 'Bill analysis progress' }: StepperProps) {
  return (
    <nav aria-label={label}>
      <ol className={styles.list}>
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;
          return (
            <li
              key={step.id}
              className={cn(styles.item, current && styles.current, done && styles.done)}
              aria-current={current ? 'step' : undefined}
            >
              <span className={styles.index} aria-hidden="true">
                {done ? <Icon name="Check" size={14} /> : index + 1}
              </span>
              <span>
                <span className="sr-only">{done ? 'Completed step: ' : current ? 'Current step: ' : 'Upcoming step: '}</span>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
