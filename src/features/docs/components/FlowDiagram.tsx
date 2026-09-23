import { Icon } from '@/ds';
import styles from './FlowDiagram.module.css';

export interface FlowStep {
  readonly label: string;
  readonly detail: string;
}

export interface FlowDiagramProps {
  /** Accessible name for the sequence. */
  label: string;
  steps: readonly FlowStep[];
}

/**
 * A left-to-right sequence that wraps, and stacks on mobile.
 *
 * Rendered as an ordered list so the order is conveyed without seeing the arrows, which
 * are decorative and hidden from assistive technology.
 */
export function FlowDiagram({ label, steps }: FlowDiagramProps) {
  return (
    <ol className={styles.flow} aria-label={label}>
      {steps.map((step) => (
        <li key={step.label} className={styles.step}>
          <div className={styles.card}>
            <span className={styles.label}>{step.label}</span>
            <span className={styles.detail}>{step.detail}</span>
          </div>
          <Icon name="ArrowForward" size={20} className={styles.arrow} />
        </li>
      ))}
    </ol>
  );
}

export interface StackLayer {
  readonly name: string;
  readonly detail: string;
  readonly tone?: 'default' | 'accent' | 'muted';
}

export interface LayerDiagramProps {
  label: string;
  layers: readonly StackLayer[];
}

/** A top-to-bottom layered diagram, for the system architecture stack. */
export function LayerDiagram({ label, layers }: LayerDiagramProps) {
  return (
    <ol className={styles.stack} aria-label={label}>
      {layers.map((layer) => (
        <li key={layer.name} className={styles.layer}>
          <div className={styles.layerCard} data-tone={layer.tone ?? 'default'}>
            <span className={styles.layerName}>{layer.name}</span>
            <span className={styles.layerDetail}>{layer.detail}</span>
          </div>
          <span className={styles.connector} aria-hidden="true" />
        </li>
      ))}
    </ol>
  );
}
