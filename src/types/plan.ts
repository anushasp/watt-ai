export type PlanBadge = 'ai-recommended' | 'fixed-rate' | 'ev-friendly' | 'renewable' | 'no-lock-in';

export interface EnergyPlan {
  readonly id: string;
  readonly retailer: string;
  readonly name: string;
  /** Peak / anytime rate, in dollars per kWh. */
  readonly ratePerKwh: number;
  /** Overnight rate, in dollars per kWh. Equal to ratePerKwh on single-rate plans. */
  readonly offPeakRate: number;
  readonly monthlyFee: number;
  /** 0 means month-to-month. */
  readonly contractMonths: number;
  readonly renewablePct: number;
  readonly supportsBattery: boolean;
  readonly earlyExitFee: number;
  readonly badges: readonly PlanBadge[];
  readonly summary: string;
}

/** A plan costed against one household's estimated usage. */
export interface PlanEstimate {
  readonly plan: EnergyPlan;
  readonly annualKwh: number;
  readonly estimatedMonthly: number;
  readonly estimatedAnnual: number;
  /** Positive means cheaper than the current plan. Always measured against the current plan. */
  readonly annualSavingsVsCurrent: number;
  readonly monthlySavingsVsCurrent: number;
  readonly effectiveRate: number;
  readonly reasons: readonly string[];
}

export type PlanSort = 'recommended' | 'cheapest' | 'greenest' | 'shortest-term';

export interface PlanFilters {
  readonly sort: PlanSort;
  /** null means any contract length. */
  readonly maxTermMonths: number | null;
  readonly renewableOnly: boolean;
}

export const DEFAULT_FILTERS: PlanFilters = {
  sort: 'recommended',
  maxTermMonths: null,
  renewableOnly: false,
};

export const PLAN_BADGE_LABELS: Readonly<Record<PlanBadge, string>> = {
  'ai-recommended': 'AI recommended',
  'fixed-rate': 'Fixed rate',
  'ev-friendly': 'EV friendly',
  renewable: 'Renewable',
  'no-lock-in': 'No lock-in',
};
