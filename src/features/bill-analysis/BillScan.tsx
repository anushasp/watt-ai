import { Icon } from '@/ds';
import type { UploadStatus } from '@/state/sessionReducer';
import styles from './BillScan.module.css';

export type BillScanPhase = 'idle' | 'reading' | 'extracting' | 'complete' | 'error';

export interface BillScanField {
  readonly label: string;
  /** Undefined until the value is actually known. Never a placeholder standing in for one. */
  readonly value?: string | undefined;
}

/**
 * The phase the real session state is in.
 *
 * Every phase here corresponds to something that has genuinely happened: the file is being
 * read, the analysis is running, or a bill exists. There is deliberately no synthetic
 * "validating" step — the flow has no such stage, and animating one would be a claim the
 * product cannot back up.
 */
export function billScanPhase(status: UploadStatus, hasBill: boolean): BillScanPhase {
  if (status === 'error') return 'error';
  if (status === 'uploading') return 'reading';
  if (status === 'processing') return 'extracting';
  return hasBill ? 'complete' : 'idle';
}

export interface BillScanProps {
  phase: BillScanPhase;
  /** Up to four fields. Each becomes "found" as soon as it has a value. */
  fields: readonly BillScanField[];
}

/**
 * A bill being read, drawn as a document with a line sweeping down it and fields lighting
 * up as they are found.
 *
 * Decorative throughout: it is hidden from assistive technology, because every phase and
 * every value it shows is also carried by the status text beside it and by the review step
 * it hands off to. Nothing here is the only place a fact appears.
 */
export function BillScan({ phase, fields }: BillScanProps) {
  const scanning = phase === 'reading' || phase === 'extracting';

  return (
    <div className={styles.card} data-phase={phase} aria-hidden="true">
      {scanning ? <div className={styles.scan} data-ambient="" /> : null}

      <div className={styles.header}>
        <Icon name="Contract" size={18} />
        <span className={styles.headerBar} />
      </div>

      <div className={styles.lines}>
        <span className={styles.line} style={{ width: '88%' }} />
        <span className={styles.line} style={{ width: '64%' }} />
        <span className={styles.line} style={{ width: '76%' }} />
      </div>

      <dl className={styles.fields}>
        {fields.slice(0, 4).map((field, i) => (
          <div
            key={field.label}
            className={styles.field}
            data-found={field.value ? 'true' : undefined}
            style={{ ['--field' as string]: i }}
          >
            <dt className={styles.fieldLabel}>{field.label}</dt>
            <dd className={styles.fieldValue}>
              {field.value ?? <span className={styles.fieldPending} />}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
