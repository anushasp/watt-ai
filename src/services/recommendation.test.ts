import { describe, expect, it } from 'vitest';
import { SAMPLE_BILL } from '@/mocks/bills';
import { PLANS } from '@/mocks/plans';
import { EMPTY_PROFILE, type HomeProfile } from '@/types';
import {
  currentAnnualCost,
  deriveCurrentPlan,
  effectiveRate,
  estimateAnnualUsage,
  estimatePlan,
  offPeakShare,
  rankPlans,
} from './recommendation';

const BASE: HomeProfile = {
  hasEv: false,
  hasSolar: false,
  hasBattery: false,
  homeType: 'townhome',
  homeSize: '1000-2000',
  priority: 'lowest-bill',
};

describe('estimateAnnualUsage', () => {
  it('uses twelve times the billed month as the baseline', () => {
    expect(estimateAnnualUsage(SAMPLE_BILL, BASE)).toBe(1428 * 12);
  });

  it('does not re-apply home size on top of a real bill, which already reflects the home', () => {
    const bigger = estimateAnnualUsage(SAMPLE_BILL, { ...BASE, homeSize: '2000-3000' });
    expect(bigger).toBe(estimateAnnualUsage(SAMPLE_BILL, BASE));
  });

  it('uses home size and type when there is no bill to measure', () => {
    const base = estimateAnnualUsage(null, BASE);
    expect(estimateAnnualUsage(null, { ...BASE, homeSize: '2000-3000' })).toBeGreaterThan(base);
    expect(estimateAnnualUsage(null, { ...BASE, homeType: 'apartment' })).toBeLessThan(base);
  });

  it('adds consumption for an EV', () => {
    const withEv = estimateAnnualUsage(SAMPLE_BILL, { ...BASE, hasEv: true });
    expect(withEv - estimateAnnualUsage(SAMPLE_BILL, BASE)).toBe(3840);
  });

  it('reduces consumption for solar, and offsets the EV load too', () => {
    const withSolar = estimateAnnualUsage(SAMPLE_BILL, { ...BASE, hasSolar: true });
    expect(withSolar).toBeLessThan(estimateAnnualUsage(SAMPLE_BILL, BASE));
    const evOnly = estimateAnnualUsage(SAMPLE_BILL, { ...BASE, hasEv: true });
    const evSolar = estimateAnnualUsage(SAMPLE_BILL, { ...BASE, hasEv: true, hasSolar: true });
    expect(evSolar).toBeLessThan(evOnly);
  });

  it('falls back to a stated default when the bill has no usage', () => {
    expect(estimateAnnualUsage(null, EMPTY_PROFILE)).toBe(1428 * 12);
  });
});

describe('off-peak share', () => {
  it('rises for an EV household', () => {
    expect(offPeakShare({ ...BASE, hasEv: true })).toBeGreaterThan(offPeakShare(BASE));
  });

  it('rises further with a battery', () => {
    expect(offPeakShare({ ...BASE, hasEv: true, hasBattery: true })).toBeGreaterThan(
      offPeakShare({ ...BASE, hasEv: true }),
    );
  });

  it('lowers the effective rate on a plan with a cheap overnight rate', () => {
    const plan = PLANS.find((p) => p.id === 'night-charge-flex');
    expect(plan).toBeDefined();
    if (!plan) return;
    expect(effectiveRate(plan, { ...BASE, hasEv: true })).toBeLessThan(effectiveRate(plan, BASE));
  });
});

describe('rankPlans', () => {
  it('is deterministic for the same inputs', () => {
    const a = rankPlans(PLANS, SAMPLE_BILL, BASE).map((e) => e.plan.id);
    const b = rankPlans(PLANS, SAMPLE_BILL, BASE).map((e) => e.plan.id);
    expect(a).toEqual(b);
  });

  it('puts the cheapest first when the priority is the lowest bill', () => {
    const ranked = rankPlans(PLANS, SAMPLE_BILL, BASE);
    const costs = ranked.map((e) => e.estimatedMonthly);
    expect(costs).toEqual([...costs].sort((x, y) => x - y));
  });

  it('puts a fully renewable plan first when the priority is renewable energy', () => {
    const ranked = rankPlans(PLANS, SAMPLE_BILL, { ...BASE, priority: 'renewable' });
    expect(ranked[0]?.plan.renewablePct).toBe(100);
  });

  it('puts the cheapest overnight rate first when the priority is EV charging', () => {
    const ranked = rankPlans(PLANS, SAMPLE_BILL, { ...BASE, priority: 'ev-charging' });
    const rates = ranked.map((e) => e.plan.offPeakRate);
    expect(rates[0]).toBe(Math.min(...rates));
  });

  it('changes the recommendation when the priority changes', () => {
    const cheapest = rankPlans(PLANS, SAMPLE_BILL, BASE)[0]?.plan.id;
    const greenest = rankPlans(PLANS, SAMPLE_BILL, { ...BASE, priority: 'renewable' })[0]?.plan.id;
    expect(cheapest).not.toBe(greenest);
  });

  it('changes the savings figure when the bill usage is edited', () => {
    const before = rankPlans(PLANS, SAMPLE_BILL, BASE)[0]?.annualSavingsVsCurrent;
    const edited = { ...SAMPLE_BILL, usageKwh: 2400 };
    const after = rankPlans(PLANS, edited, BASE)[0]?.annualSavingsVsCurrent;
    expect(after).not.toBe(before);
  });

  it('measures savings against the current plan, not against another candidate', () => {
    const baseline = currentAnnualCost(SAMPLE_BILL, BASE);
    for (const estimate of rankPlans(PLANS, SAMPLE_BILL, BASE)) {
      expect(estimate.annualSavingsVsCurrent).toBeCloseTo(baseline - estimate.estimatedAnnual, 1);
    }
  });
});

describe('the savings baseline is a like-for-like comparison', () => {
  it('prices the current plan at the same usage as the candidates', () => {
    const evProfile: HomeProfile = { ...BASE, hasEv: true };
    const ranked = rankPlans(PLANS, SAMPLE_BILL, evProfile);
    const baseline = currentAnnualCost(SAMPLE_BILL, evProfile);
    const usage = estimateAnnualUsage(SAMPLE_BILL, evProfile);
    // Adding an EV raises the baseline too, rather than leaving it at last month's usage.
    expect(baseline).toBeGreaterThan(currentAnnualCost(SAMPLE_BILL, BASE));
    expect(ranked.every((e) => e.annualKwh === usage)).toBe(true);
  });

  it('finds at least one plan that genuinely saves money for an EV household', () => {
    const ranked = rankPlans(PLANS, SAMPLE_BILL, { ...BASE, hasEv: true, priority: 'ev-charging' });
    expect(ranked[0]?.annualSavingsVsCurrent).toBeGreaterThan(0);
  });

  it('reports no saving against itself', () => {
    const baseline = currentAnnualCost(SAMPLE_BILL, BASE);
    const self = estimatePlan(deriveCurrentPlan(SAMPLE_BILL), SAMPLE_BILL, BASE, baseline);
    expect(self.annualSavingsVsCurrent).toBeCloseTo(0, 1);
  });
});
