import { Button, CheckListItem, Heading, Tag, Text } from '@/ds';
import { formatMoney, formatRate } from '@/services/money';
import { PLAN_BADGE_LABELS, type PlanEstimate } from '@/types';
import { termLabel } from './planFilters';
import styles from './PlanCard.module.css';

export interface PlanCardProps {
  estimate: PlanEstimate;
  recommended: boolean;
  currentPlanName: string;
  compareChecked: boolean;
  onCompareChange: (checked: boolean) => void;
  onViewDetails: () => void;
  onAsk: () => void;
  onChoose: () => void;
}

export function PlanCard({
  estimate,
  recommended,
  currentPlanName,
  compareChecked,
  onCompareChange,
  onViewDetails,
  onAsk,
  onChoose,
}: PlanCardProps) {
  const { plan } = estimate;
  const saves = estimate.annualSavingsVsCurrent > 0;
  return (
    <article className={styles.card} data-recommended={recommended ? 'true' : undefined}>
      <div className={styles.tags}>
        {recommended ? <Tag accent>Recommended for you</Tag> : null}
        {plan.badges
          .filter((b) => !(recommended && b === 'ai-recommended'))
          .map((b) => (
            <Tag key={b}>{PLAN_BADGE_LABELS[b]}</Tag>
          ))}
      </div>

      <div className={styles.head}>
        <Heading level={3} scale="h5">
          {plan.name}
        </Heading>
        <Text size="small" muted>
          {plan.retailer}
        </Text>
      </div>

      <div className={styles.price}>
        <span className={styles.priceValue}>{formatMoney(estimate.estimatedMonthly, { cents: false })}</span>
        <Text as="span" size="small" muted>
          estimated a month
        </Text>
      </div>

      <p className={styles.savings} data-positive={saves ? 'true' : undefined}>
        {saves
          ? `${formatMoney(estimate.annualSavingsVsCurrent, { cents: false })} a year less than ${currentPlanName}`
          : `${formatMoney(Math.abs(estimate.annualSavingsVsCurrent), { cents: false })} a year more than ${currentPlanName}`}
        <span className={styles.basis}>Est. savings vs your current plan</span>
      </p>

      <dl className={styles.facts}>
        <div>
          <dt>Rate</dt>
          <dd>{formatRate(plan.ratePerKwh)}</dd>
        </div>
        <div>
          <dt>Overnight</dt>
          <dd>{formatRate(plan.offPeakRate)}</dd>
        </div>
        <div>
          <dt>Contract</dt>
          <dd>{termLabel(plan.contractMonths)}</dd>
        </div>
        <div>
          <dt>Renewable</dt>
          <dd>{plan.renewablePct}%</dd>
        </div>
      </dl>

      <ul className={styles.reasons}>
        {estimate.reasons.slice(0, 3).map((reason) => (
          <CheckListItem key={reason}>{reason}</CheckListItem>
        ))}
      </ul>

      <label className={styles.compare}>
        <input
          type="checkbox"
          checked={compareChecked}
          onChange={(e) => onCompareChange(e.target.checked)}
        />
        <span>Compare this plan</span>
      </label>

      <div className={styles.actions}>
        <Button onClick={onChoose}>Choose This Plan</Button>
        <Button variant="secondary" onClick={onViewDetails}>
          View Details
        </Button>
        <Button variant="link" onClick={onAsk}>
          Ask wattsAI
        </Button>
      </div>
    </article>
  );
}
