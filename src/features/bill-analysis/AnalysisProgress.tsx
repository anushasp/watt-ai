import { Text } from '@/ds';
import { AIStatus, type AIStatusValue } from '@/components/ai/AIStatus';
import { AgentProgress, type AgentStep, type AgentStepState } from '@/components/ai/AgentProgress';
import { formatKwh, formatRate } from '@/services/money';
import type { UploadStatus } from '@/state/sessionReducer';
import type { ParsedBill } from '@/types';
import { BillScan, billScanPhase } from './BillScan';
import styles from './AnalysisProgress.module.css';

export interface AnalysisProgressProps {
  status: UploadStatus;
  bill: ParsedBill | null;
  error: string | null;
}

/** The wording beside the mark. One line, always true of the current state. */
function headline(status: UploadStatus, hasBill: boolean): { text: string; ai: AIStatusValue } {
  if (status === 'error') return { text: 'The file could not be read.', ai: 'error' };
  if (status === 'uploading') return { text: 'Reading your file.', ai: 'analyzing' };
  if (status === 'processing') return { text: 'Extracting the details.', ai: 'generating' };
  if (hasBill) return { text: 'Analysis complete.', ai: 'success' };
  return { text: 'Ready when you are.', ai: 'idle' };
}

/**
 * Turns the real session state into the agent's checklist.
 *
 * Three steps because the flow has three: the file is read, the bill is analyzed, and the
 * result is ready. No step advances on its own, so the list can never be further along
 * than the work actually is.
 */
function steps(status: UploadStatus, hasBill: boolean): readonly AgentStep[] {
  const failed = status === 'error';
  const reading = status === 'uploading';
  // Everything past uploading means the file has been read.
  const readDone = !failed && !reading;

  const extracting = status === 'processing';
  const read: AgentStepState = failed ? 'error' : reading ? 'active' : readDone ? 'complete' : 'pending';
  const extract: AgentStepState = extracting ? 'active' : hasBill ? 'complete' : 'pending';

  return [
    { id: 'read', label: 'Reading the bill', state: read },
    { id: 'extract', label: 'Extracting provider, usage, rate and contract', state: extract },
    { id: 'ready', label: 'Ready to review', state: hasBill ? 'complete' : 'pending' },
  ];
}

/** The four headline fields, shown as found. `undefined` until the value genuinely exists. */
function fields(bill: ParsedBill | null) {
  const rate =
    bill?.energyCharge != null && bill.usageKwh ? bill.energyCharge / bill.usageKwh : null;
  return [
    { label: 'Provider', value: bill?.provider ?? undefined },
    { label: 'Usage', value: bill?.usageKwh != null ? formatKwh(bill.usageKwh) : undefined },
    { label: 'Rate', value: rate != null ? formatRate(rate) : undefined },
    { label: 'Contract', value: bill?.contractExpiry ?? undefined },
  ];
}

/**
 * Upload, reading, extracting, complete — shown as a checklist beside a bill being scanned.
 *
 * Both halves read from the same session state, and the checklist carries every fact in
 * text. The scan card is decorative and hidden from assistive technology.
 */
export function AnalysisProgress({ status, bill, error }: AnalysisProgressProps) {
  const hasBill = bill !== null;
  const { text, ai } = headline(status, hasBill);

  return (
    <div className={styles.panel}>
      <div className={styles.status}>
        <div className={styles.head}>
          {/* Silent: UploadStep already announces each change through its own live region. */}
          <AIStatus status={ai} size={36} silent label={text} />
          <Text as="span" size="medium" weight={500}>
            {status === 'error' && error ? error : text}
          </Text>
        </div>
        <AgentProgress steps={steps(status, hasBill)} label="Bill analysis progress" />
      </div>
      <BillScan phase={billScanPhase(status, hasBill)} fields={fields(bill)} />
    </div>
  );
}
