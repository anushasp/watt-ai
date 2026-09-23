import type { EnergyFlow } from '@/types';

export function sumKw(nodes: readonly { kw: number }[]): number {
  return Math.round(nodes.reduce((total, n) => total + n.kw, 0) * 10) / 10;
}

export interface FlowBalance {
  readonly inKw: number;
  readonly outKw: number;
  readonly balanced: boolean;
}

export function flowBalance(flow: EnergyFlow): FlowBalance {
  const inKw = sumKw(flow.sources);
  const outKw = sumKw(flow.loads);
  return { inKw, outKw, balanced: Math.abs(inKw - outKw) < 0.05 };
}

/**
 * A diagram whose arrows do not add up is worse than no diagram. This throws in
 * development and in tests so an unbalanced fixture cannot reach the page.
 */
export function assertFlowBalances(flow: EnergyFlow): void {
  const { inKw, outKw, balanced } = flowBalance(flow);
  if (!balanced) {
    throw new Error(
      `Energy flow does not balance: ${inKw} kW in against ${outKw} kW out. ` +
        'Sources and loads must sum to the same instantaneous power.',
    );
  }
}
