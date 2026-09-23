import { describe, expect, it } from 'vitest';
import {
  changeVsLastMonth,
  describeComparison,
  formatDelta,
  formatKw,
  formatKwh,
  formatMoney,
  formatRate,
  savingsVsCurrentPlan,
} from './money';

describe('formatting', () => {
  it('formats whole dollars without cents', () => {
    expect(formatMoney(143, { cents: false })).toBe('$143');
  });

  it('formats cents when the value is not whole', () => {
    expect(formatMoney(272.84)).toBe('$272.84');
  });

  it('signs deltas', () => {
    expect(formatDelta(44, { cents: false })).toBe('+$44');
    expect(formatDelta(-12, { cents: false })).toBe('-$12');
  });

  it('keeps power and energy units distinct', () => {
    expect(formatKw(6.2)).toBe('6.2 kW');
    expect(formatKwh(28.4)).toBe('28.4 kWh');
    expect(formatKw(6.2)).not.toContain('kWh');
  });

  it('quotes rates in cents per kWh', () => {
    expect(formatRate(0.141)).toBe('14.1 cents per kWh');
  });
});

describe('the two comparisons are distinct measures', () => {
  it('savings vs current plan uses the plan baseline', () => {
    const c = savingsVsCurrentPlan(3274, 2746, 'Basic Residential');
    expect(c.basis).toBe('vs-current-plan');
    expect(c.amount).toBe(528);
    expect(c.baselineLabel).toBe('Basic Residential');
    expect(c.label).toBe('Est. savings vs your current plan');
  });

  it('change vs last month uses the previous bill as the baseline', () => {
    const c = changeVsLastMonth(272.84, 254.12);
    expect(c.basis).toBe('vs-last-month');
    expect(c.baselineLabel).toBe('your previous bill');
    // The bill went up, so the favourable amount is negative.
    expect(c.amount).toBeCloseTo(-18.72, 2);
  });

  it('never produces the same labels for the two bases', () => {
    const a = savingsVsCurrentPlan(3274, 2746, 'Basic Residential');
    const b = changeVsLastMonth(272.84, 254.12);
    expect(a.label).not.toBe(b.label);
    expect(a.baselineLabel).not.toBe(b.baselineLabel);
  });

  it('always names its baseline in the sentence', () => {
    expect(describeComparison(savingsVsCurrentPlan(3274, 2746, 'Basic Residential'))).toContain(
      'Basic Residential',
    );
    expect(describeComparison(changeVsLastMonth(272.84, 254.12))).toContain('your previous bill');
  });
});
