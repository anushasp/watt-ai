import { describe, expect, it } from 'vitest';
import { SAMPLE_BILL } from '@/mocks/bills';
import { PLANS } from '@/mocks/plans';
import { rankPlans } from '@/services/recommendation';
import type { HomeProfile } from '@/types';
import { applyFilters, parseFilters, termLabel } from './planFilters';

const PROFILE: HomeProfile = {
  hasEv: false,
  hasSolar: false,
  hasBattery: false,
  homeType: 'townhome',
  homeSize: '1000-2000',
  priority: 'lowest-bill',
};

const ESTIMATES = rankPlans(PLANS, SAMPLE_BILL, PROFILE);

describe('applyFilters', () => {
  it('keeps only fully renewable plans when asked', () => {
    const out = applyFilters(ESTIMATES, { sort: 'recommended', maxTermMonths: null, renewableOnly: true });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((e) => e.plan.renewablePct === 100)).toBe(true);
  });

  it('caps the contract length', () => {
    const out = applyFilters(ESTIMATES, { sort: 'recommended', maxTermMonths: 12, renewableOnly: false });
    expect(out.every((e) => e.plan.contractMonths <= 12)).toBe(true);
  });

  it('can return nothing, which the page renders as an empty state', () => {
    const out = applyFilters(ESTIMATES, { sort: 'recommended', maxTermMonths: 0, renewableOnly: true });
    expect(out).toHaveLength(0);
  });

  it('sorts by cost', () => {
    const out = applyFilters(ESTIMATES, { sort: 'cheapest', maxTermMonths: null, renewableOnly: false });
    const costs = out.map((e) => e.estimatedMonthly);
    expect(costs).toEqual([...costs].sort((a, b) => a - b));
  });

  it('preserves the engine ranking for the recommended sort', () => {
    const out = applyFilters(ESTIMATES, { sort: 'recommended', maxTermMonths: null, renewableOnly: false });
    expect(out.map((e) => e.plan.id)).toEqual(ESTIMATES.map((e) => e.plan.id));
  });
});

describe('parseFilters', () => {
  it('defaults to the recommended ranking', () => {
    expect(parseFilters(new URLSearchParams())).toEqual({
      sort: 'recommended',
      maxTermMonths: null,
      renewableOnly: false,
    });
  });

  it('reads every filter from the query string', () => {
    const f = parseFilters(new URLSearchParams('sort=cheapest&term=12&green=1'));
    expect(f).toEqual({ sort: 'cheapest', maxTermMonths: 12, renewableOnly: true });
  });

  it('ignores an unknown sort', () => {
    expect(parseFilters(new URLSearchParams('sort=bogus')).sort).toBe('recommended');
  });
});

describe('termLabel', () => {
  it('describes a zero-month contract in words', () => {
    expect(termLabel(0)).toBe('Month to month');
    expect(termLabel(12)).toBe('12 months');
  });
});
