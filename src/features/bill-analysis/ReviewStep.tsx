import { useState } from 'react';
import { Button, Heading, Input, Text } from '@/ds';
import { DemoBanner } from '@/components/DemoBanner';
import { ENGINE_ASSUMPTIONS, estimateAnnualUsage } from '@/services/recommendation';
import { changeVsLastMonth, describeComparison, formatKwh, formatMoney } from '@/services/money';
import { useSession } from '@/state/SessionContext';
import type { ParsedBill } from '@/types';
import styles from './ReviewStep.module.css';

export interface ReviewStepProps {
  onConfirm: () => void;
}

/** "Not found." is shown for any field extraction did not produce. */
const NOT_FOUND = 'Not found.';

function show(value: string | number | null, format?: (v: number) => string): string {
  if (value === null) return NOT_FOUND;
  if (typeof value === 'number') return format ? format(value) : String(value);
  return value;
}

export function ReviewStep({ onConfirm }: ReviewStepProps) {
  const { state, dispatch } = useSession();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ParsedBill | null>(state.bill);
  const bill = state.bill;

  if (!bill) return null;

  const period =
    bill.periodStart && bill.periodEnd ? `${bill.periodStart} to ${bill.periodEnd}` : NOT_FOUND;

  const rows: { label: string; value: string }[] = [
    { label: 'Provider', value: show(bill.provider) },
    { label: 'Plan', value: show(bill.planName) },
    { label: 'Billing period', value: period },
    { label: 'Usage', value: show(bill.usageKwh, formatKwh) },
    { label: 'Energy charge', value: show(bill.energyCharge, (v) => formatMoney(v)) },
    { label: 'Delivery charge', value: show(bill.deliveryCharge, (v) => formatMoney(v)) },
    { label: 'Bill total', value: show(bill.total, (v) => formatMoney(v)) },
    { label: 'Contract expiration', value: show(bill.contractExpiry) },
  ];

  const monthComparison =
    bill.total !== null && bill.previousTotal !== null
      ? changeVsLastMonth(bill.total, bill.previousTotal)
      : null;

  const startEdit = () => {
    setDraft(bill);
    setEditing(true);
  };

  const save = () => {
    if (draft) dispatch({ type: 'EDIT_BILL', bill: draft });
    setEditing(false);
  };

  const patch = (key: keyof ParsedBill, raw: string, numeric: boolean) => {
    setDraft((current) => {
      if (!current) return current;
      const value = numeric ? (raw.trim() === '' ? null : Number(raw)) : raw.trim() === '' ? null : raw;
      if (numeric && value !== null && Number.isNaN(value as number)) return current;
      return { ...current, [key]: value };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <Heading level={2} scale="h3" id="step-heading" tabIndex={-1}>
          We analyzed your bill
        </Heading>
        <Text size="medium" muted>
          Check the figures below. Correcting anything here changes every recommendation that
          follows.
        </Text>
      </div>

      <DemoBanner>
        {state.usedSample
          ? 'This is the built-in sample bill. Nothing was read from a file.'
          : 'This is a sample analysis, not data read from the file you chose. No file is parsed in this demo.'}
      </DemoBanner>

      {editing ? (
        <div className={styles.editGrid}>
          <Input
            label="Provider"
            defaultValue={draft?.provider ?? ''}
            onChange={(e) => patch('provider', e.target.value, false)}
          />
          <Input
            label="Plan"
            defaultValue={draft?.planName ?? ''}
            onChange={(e) => patch('planName', e.target.value, false)}
          />
          <Input
            label="Usage in kWh"
            type="number"
            inputMode="decimal"
            defaultValue={draft?.usageKwh ?? ''}
            onChange={(e) => patch('usageKwh', e.target.value, true)}
          />
          <Input
            label="Energy charge in dollars"
            type="number"
            inputMode="decimal"
            defaultValue={draft?.energyCharge ?? ''}
            onChange={(e) => patch('energyCharge', e.target.value, true)}
          />
          <Input
            label="Delivery charge in dollars"
            type="number"
            inputMode="decimal"
            defaultValue={draft?.deliveryCharge ?? ''}
            onChange={(e) => patch('deliveryCharge', e.target.value, true)}
          />
          <Input
            label="Bill total in dollars"
            type="number"
            inputMode="decimal"
            defaultValue={draft?.total ?? ''}
            onChange={(e) => patch('total', e.target.value, true)}
          />
          <Input
            label="Contract expiration"
            defaultValue={draft?.contractExpiry ?? ''}
            hint="Leave empty if your bill does not show one."
            onChange={(e) => patch('contractExpiry', e.target.value, false)}
          />
          <div className={styles.editActions}>
            <Button onClick={save}>Save Changes</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setDraft(bill);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <dl className={styles.grid}>
          {rows.map((row, index) => (
            <div
              key={row.label}
              className={styles.row}
              style={{ ['--row' as string]: Math.min(index, 5) }}
            >
              <dt className={styles.term}>{row.label}</dt>
              <dd
                className={styles.value}
                data-missing={row.value === NOT_FOUND ? 'true' : undefined}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {monthComparison ? (
        <Text size="small" muted>
          {describeComparison(monthComparison)}. This compares two bills on the same plan, and is a
          different measure from the savings shown on the plans page.
        </Text>
      ) : null}

      <details className={styles.details}>
        <summary className={styles.summary}>How wattsAI calculated this</summary>
        <div className={styles.detailsBody}>
          <Text size="small" muted>
            Estimated annual usage for this household:{' '}
            {formatKwh(estimateAnnualUsage(bill, state.profile))}. These are assumptions, not
            measurements.
          </Text>
          <dl className={styles.assumptions}>
            {ENGINE_ASSUMPTIONS.map((a) => (
              <div key={a.label} className={styles.row}>
                <dt className={styles.term}>{a.label}</dt>
                <dd className={styles.value}>{a.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </details>

      {!editing ? (
        <div style={{ display: 'flex', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
          <Button
            onClick={() => {
              dispatch({ type: 'CONFIRM_BILL' });
              onConfirm();
            }}
          >
            Looks Right
          </Button>
          <Button variant="secondary" onClick={startEdit}>
            Edit Details
          </Button>
        </div>
      ) : null}
    </div>
  );
}
