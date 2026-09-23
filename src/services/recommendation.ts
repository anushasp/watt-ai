/**
 * The deterministic recommendation engine.
 *
 * Pure functions only: same bill + same profile always produce the same numbers.
 * Every page reads its figures from here, so Plans, Dashboard and Copilot cannot
 * disagree with one another.
 *
 * These are ASSUMPTIONS, not measurements. They are surfaced to the user verbatim
 * through ENGINE_ASSUMPTIONS below.
 */
import type { CompleteHomeProfile, HomeProfile, HomeSize, HomeType, Priority } from '@/types';
import type { EnergyPlan, PlanEstimate } from '@/types';
import type { ParsedBill } from '@/types';
import { CURRENT_PLAN_NAME } from '@/mocks/plans';

/** Multiplier applied for floor area. */
export const HOME_SIZE_FACTOR: Readonly<Record<HomeSize, number>> = {
  'under-1000': 0.8,
  '1000-2000': 1.0,
  '2000-3000': 1.25,
  'over-3000': 1.5,
};

/** Multiplier applied for dwelling type. */
export const HOME_TYPE_FACTOR: Readonly<Record<HomeType, number>> = {
  apartment: 0.85,
  townhome: 1.0,
  'single-family': 1.15,
};

/** Added annual consumption for a home that charges an EV. */
export const EV_ANNUAL_KWH = 3840;
/** Share of annual consumption offset by rooftop solar. */
export const SOLAR_OFFSET = 0.3;
/** Share of consumption billed at the off-peak rate. */
export const OFF_PEAK_SHARE_DEFAULT = 0.3;
export const OFF_PEAK_SHARE_EV = 0.55;
/** A battery shifts this much additional consumption into the off-peak window. */
export const BATTERY_OFF_PEAK_BONUS = 0.1;

export const ENGINE_ASSUMPTIONS: readonly { label: string; value: string }[] = [
  {
    label: 'Baseline usage',
    value: 'Your billed kWh multiplied by 12. Your bill already reflects the size and type of your home, so those answers are not applied on top of it',
  },
  {
    label: 'Home size and type',
    value: 'Used only when no bill has been analyzed. Under 1,000 sq ft 0.8x · 1,000 to 2,000 1.0x · 2,000 to 3,000 1.25x · over 3,000 1.5x, and apartment 0.85x · townhome 1.0x · single-family 1.15x',
  },
  { label: 'Electric vehicle', value: 'Adds 3,840 kWh a year, about 320 kWh a month' },
  { label: 'Solar panels', value: 'Offsets 30 percent of annual consumption' },
  { label: 'Off-peak share', value: '30 percent of usage, or 55 percent for an EV household' },
  { label: 'Home battery', value: 'Shifts a further 10 percent of usage into the off-peak window' },
  { label: 'Delivery charge', value: 'Carried over from your bill and held constant across plans' },
  {
    label: 'Your current plan',
    value: 'Priced at the same estimated usage as every candidate, using the rate implied by your bill, so the only difference between the figures is the plan itself',
  },
];

/** Usage-driven inputs the engine needs. Missing bill fields fall back to a stated default. */
export const FALLBACK_MONTHLY_KWH = 1428;
export const FALLBACK_DELIVERY_CHARGE = 41.5;

export function monthlyKwhFrom(bill: ParsedBill | null): number {
  return bill?.usageKwh ?? FALLBACK_MONTHLY_KWH;
}

export function deliveryChargeFrom(bill: ParsedBill | null): number {
  return bill?.deliveryCharge ?? FALLBACK_DELIVERY_CHARGE;
}

/**
 * Estimated annual consumption for this household, in kWh.
 *
 * A billed month is ground truth for the home as it stands, and already reflects its size
 * and construction, so the size and type factors are applied ONLY when no bill is
 * available. Applying them on top of a real bill would double-count the same home.
 *
 * EV, solar and battery are changes to the home rather than descriptions of it, so they
 * adjust the estimate either way. Solar is applied last so it offsets the EV load too.
 */
export function estimateAnnualUsage(bill: ParsedBill | null, profile: HomeProfile): number {
  const measured = bill?.usageKwh != null;
  const base = monthlyKwhFrom(bill) * 12;
  const sizeFactor = measured || !profile.homeSize ? 1 : HOME_SIZE_FACTOR[profile.homeSize];
  const typeFactor = measured || !profile.homeType ? 1 : HOME_TYPE_FACTOR[profile.homeType];
  const withHome = base * sizeFactor * typeFactor;
  const withEv = withHome + (profile.hasEv ? EV_ANNUAL_KWH : 0);
  const withSolar = profile.hasSolar ? withEv * (1 - SOLAR_OFFSET) : withEv;
  return Math.round(withSolar);
}

/** The share of consumption billed at the off-peak rate, given the household's hardware. */
export function offPeakShare(profile: HomeProfile): number {
  const base = profile.hasEv ? OFF_PEAK_SHARE_EV : OFF_PEAK_SHARE_DEFAULT;
  return Math.min(1, base + (profile.hasBattery ? BATTERY_OFF_PEAK_BONUS : 0));
}

/** Blended dollars per kWh for a plan, given how this household uses power. */
export function effectiveRate(plan: EnergyPlan, profile: HomeProfile): number {
  const off = offPeakShare(profile);
  return plan.offPeakRate * off + plan.ratePerKwh * (1 - off);
}

export function estimateMonthlyCost(
  plan: EnergyPlan,
  annualKwh: number,
  profile: HomeProfile,
  deliveryCharge: number,
): number {
  const monthlyKwh = annualKwh / 12;
  return monthlyKwh * effectiveRate(plan, profile) + plan.monthlyFee + deliveryCharge;
}

function buildReasons(plan: EnergyPlan, profile: HomeProfile, annualKwh: number): string[] {
  const reasons: string[] = [];
  if (profile.hasEv && plan.offPeakRate < plan.ratePerKwh) {
    reasons.push(
      `Overnight rate of ${(plan.offPeakRate * 100).toFixed(1)} cents suits your EV charging`,
    );
  }
  if (profile.hasSolar && plan.renewablePct >= 50) {
    reasons.push('Renewable supply pairs with your rooftop solar');
  }
  if (profile.hasBattery && plan.supportsBattery) {
    reasons.push('Supports battery export, so stored power earns credit');
  }
  if (plan.contractMonths === 0) {
    reasons.push('Month to month, so you can leave without a fee');
  } else {
    reasons.push(`Rate is fixed for ${plan.contractMonths} months`);
  }
  if (plan.renewablePct === 100) {
    reasons.push('100 percent renewable energy');
  }
  reasons.push(`Priced against your estimated ${Math.round(annualKwh).toLocaleString('en-US')} kWh a year`);
  return reasons;
}

/** Cost one plan for this household. */
export function estimatePlan(
  plan: EnergyPlan,
  bill: ParsedBill | null,
  profile: HomeProfile,
  currentAnnualCost: number,
): PlanEstimate {
  const annualKwh = estimateAnnualUsage(bill, profile);
  const delivery = deliveryChargeFrom(bill);
  const monthly = estimateMonthlyCost(plan, annualKwh, profile, delivery);
  const annual = monthly * 12;
  return {
    plan,
    annualKwh,
    estimatedMonthly: round2(monthly),
    estimatedAnnual: round2(annual),
    annualSavingsVsCurrent: round2(currentAnnualCost - annual),
    monthlySavingsVsCurrent: round2(currentAnnualCost / 12 - monthly),
    effectiveRate: effectiveRate(plan, profile),
    reasons: buildReasons(plan, profile, annualKwh),
  };
}

export const FALLBACK_RATE = 0.162;

/**
 * The plan the household is on now, expressed as an EnergyPlan so it can be costed by
 * exactly the same function as every candidate. The rate is the one implied by the bill.
 * It is single-rate, so it gains nothing from a favourable off-peak share.
 */
export function deriveCurrentPlan(bill: ParsedBill | null): EnergyPlan {
  const rate =
    bill?.energyCharge != null && bill.usageKwh != null && bill.usageKwh > 0
      ? bill.energyCharge / bill.usageKwh
      : FALLBACK_RATE;
  return {
    id: 'current-plan',
    retailer: bill?.provider ?? 'Your current retailer',
    name: bill?.planName ?? CURRENT_PLAN_NAME,
    ratePerKwh: rate,
    offPeakRate: rate,
    monthlyFee: 0,
    contractMonths: 0,
    renewablePct: 12,
    supportsBattery: false,
    earlyExitFee: 0,
    badges: [],
    summary: 'The plan your most recent bill was charged on.',
  };
}

/**
 * The household's current annual cost, and the baseline for every savings figure.
 *
 * Critically, this is priced at the SAME estimated usage as the candidate plans. Costing
 * the baseline at last month's billed usage while costing candidates at an EV-adjusted
 * estimate would compare two different households and make every plan look expensive.
 */
export function currentAnnualCost(bill: ParsedBill | null, profile: HomeProfile): number {
  const annualKwh = estimateAnnualUsage(bill, profile);
  const monthly = estimateMonthlyCost(
    deriveCurrentPlan(bill),
    annualKwh,
    profile,
    deliveryChargeFrom(bill),
  );
  return round2(monthly * 12);
}

const PRIORITY_SORT: Readonly<Record<Priority, (a: PlanEstimate, b: PlanEstimate) => number>> = {
  'lowest-bill': (a, b) => a.estimatedMonthly - b.estimatedMonthly,
  'predictable-cost': (a, b) =>
    termRank(b.plan.contractMonths) - termRank(a.plan.contractMonths) ||
    a.estimatedMonthly - b.estimatedMonthly,
  renewable: (a, b) => b.plan.renewablePct - a.plan.renewablePct || a.estimatedMonthly - b.estimatedMonthly,
  'ev-charging': (a, b) => a.plan.offPeakRate - b.plan.offPeakRate || a.estimatedMonthly - b.estimatedMonthly,
  'backup-power': (a, b) =>
    Number(b.plan.supportsBattery) - Number(a.plan.supportsBattery) ||
    a.estimatedMonthly - b.estimatedMonthly,
};

/** A longer fixed term is more predictable; month-to-month is least. */
function termRank(months: number): number {
  return months === 0 ? 0 : months;
}

/**
 * Rank every plan for this household. Order is driven by the profile's stated priority,
 * so changing the priority answer visibly changes the recommendation.
 */
export function rankPlans(
  plans: readonly EnergyPlan[],
  bill: ParsedBill | null,
  profile: HomeProfile,
): PlanEstimate[] {
  const baseline = currentAnnualCost(bill, profile);
  const estimates = plans.map((p) => estimatePlan(p, bill, profile, baseline));
  const comparator = profile.priority
    ? PRIORITY_SORT[profile.priority]
    : PRIORITY_SORT['lowest-bill'];
  // Tie-break on id so the order is stable and reproducible.
  return [...estimates].sort((a, b) => comparator(a, b) || a.plan.id.localeCompare(b.plan.id));
}

export function isProfileComplete(p: HomeProfile): p is CompleteHomeProfile {
  return (
    p.hasEv !== null &&
    p.hasSolar !== null &&
    p.hasBattery !== null &&
    p.homeType !== null &&
    p.homeSize !== null &&
    p.priority !== null
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
