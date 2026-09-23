/**
 * The single source of money formatting and comparison in the app.
 *
 * Two comparisons exist and they are NEVER interchangeable:
 *
 *   savingsVsCurrentPlan — a recommended plan's cost against the CURRENT PLAN's cost,
 *                          at the same estimated usage. Answers "should I switch?"
 *
 *   changeVsLastMonth    — this bill's total against the PREVIOUS BILL's total, on the
 *                          same plan. Answers "why is my bill different?"
 *
 * Every money figure rendered in the app goes through one of these helpers, so the
 * numbers cannot drift between Plans, Dashboard and Copilot.
 */

export type ComparisonBasis = 'vs-current-plan' | 'vs-last-month';

export interface Comparison {
  readonly basis: ComparisonBasis;
  /** Positive is favourable to the user (money saved / bill down). */
  readonly amount: number;
  readonly label: string;
  readonly baselineLabel: string;
}

export function formatMoney(value: number, opts: { cents?: boolean } = {}): string {
  const cents = opts.cents ?? !Number.isInteger(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(value);
}

/** Formats a signed delta, e.g. "+$44" saved or "-$12". */
export function formatDelta(value: number, opts: { cents?: boolean } = {}): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${formatMoney(Math.abs(value), opts)}`;
}

export function formatKwh(value: number): string {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)} kWh`;
}

/** Rates are quoted in cents per kWh throughout the UI. */
export function formatRate(dollarsPerKwh: number): string {
  return `${(dollarsPerKwh * 100).toFixed(1)} cents per kWh`;
}

export function formatKw(value: number): string {
  return `${value.toFixed(1)} kW`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Savings from switching plans. Baseline is always the current plan, never last month.
 */
export function savingsVsCurrentPlan(
  currentAnnualCost: number,
  candidateAnnualCost: number,
  currentPlanName: string,
): Comparison {
  return {
    basis: 'vs-current-plan',
    amount: currentAnnualCost - candidateAnnualCost,
    label: 'Est. savings vs your current plan',
    baselineLabel: currentPlanName,
  };
}

/**
 * Bill-to-bill movement on the same plan. Baseline is always the previous bill.
 * A bill that went DOWN is favourable, so the sign is inverted relative to the totals.
 */
export function changeVsLastMonth(thisTotal: number, previousTotal: number): Comparison {
  return {
    basis: 'vs-last-month',
    amount: previousTotal - thisTotal,
    label: 'vs last month',
    baselineLabel: 'your previous bill',
  };
}

/** Renders a comparison as the sentence the UI shows, always naming its baseline. */
export function describeComparison(c: Comparison): string {
  const magnitude = formatMoney(Math.abs(c.amount));
  if (c.amount === 0) return c.basis === 'vs-current-plan'
    ? `No change against ${c.baselineLabel}`
    : `Unchanged from ${c.baselineLabel}`;
  if (c.basis === 'vs-current-plan') {
    return c.amount > 0
      ? `${magnitude} a year less than ${c.baselineLabel}`
      : `${magnitude} a year more than ${c.baselineLabel}`;
  }
  return c.amount > 0
    ? `${magnitude} lower than ${c.baselineLabel}`
    : `${magnitude} higher than ${c.baselineLabel}`;
}
