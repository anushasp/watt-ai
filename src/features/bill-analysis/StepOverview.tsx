import { Text } from '@/ds';
import { Reveal, stagger } from '@/components/Reveal';
import { BILL_STEPS, BILL_STEP_OVERVIEW } from '@/app/routes';
import styles from './StepOverview.module.css';

export interface StepOverviewProps {
  /** Which step the reader is on, so the overview can mark it without restating progress. */
  currentIndex: number;
}

/**
 * What the three steps are, for the page header.
 *
 * This is the map, not the position marker — the progress tracker beside the step content
 * owns completion and ticks. All this adds is a quiet cue on the step you are currently
 * reading, so the two are not telling different stories.
 *
 * The items rise in one after another the first time they are seen, using the same Reveal
 * and capped stagger as the rest of the product.
 */
export function StepOverview({ currentIndex }: StepOverviewProps) {
  return (
    <ol className={styles.list}>
      {BILL_STEPS.map((step, index) => {
        const { title, summary } = BILL_STEP_OVERVIEW[step];
        return (
          <li key={step} className={styles.item} data-current={index === currentIndex ? 'true' : undefined}>
            <Reveal delay={stagger(index)} className={styles.body}>
              {/* The numeral repeats the list's own ordering, so it is decorative. */}
              <span className={styles.rule} aria-hidden="true" />
              <span className={styles.numeral} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={styles.title}>{title}</span>
              <Text as="span" size="small" muted>
                {summary}
              </Text>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
