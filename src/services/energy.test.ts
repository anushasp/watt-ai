import { describe, expect, it } from 'vitest';
import { ENERGY_FLOW } from '@/mocks/energy';
import { assertFlowBalances, flowBalance, sumKw } from './energy';

describe('energy flow', () => {
  it('balances: everything flowing in flows back out', () => {
    const { inKw, outKw, balanced } = flowBalance(ENERGY_FLOW);
    expect(inKw).toBe(6.2);
    expect(outKw).toBe(6.2);
    expect(balanced).toBe(true);
  });

  it('does not throw for the shipped fixture', () => {
    expect(() => assertFlowBalances(ENERGY_FLOW)).not.toThrow();
  });

  it('throws when a fixture does not balance', () => {
    const broken = { ...ENERGY_FLOW, loads: ENERGY_FLOW.loads.slice(1) };
    expect(() => assertFlowBalances(broken)).toThrow(/does not balance/);
  });

  it('reports energy for the day separately from instantaneous power', () => {
    // 28.4 kWh is energy over the day; it must not equal the kW total.
    expect(ENERGY_FLOW.todayKwh).not.toBe(sumKw(ENERGY_FLOW.loads));
  });
});
