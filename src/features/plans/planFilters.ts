import type { PlanEstimate, PlanFilters, PlanSort } from '@/types';

export const SORT_LABELS: Readonly<Record<PlanSort, string>> = {
  recommended: 'Recommended for you',
  cheapest: 'Lowest monthly cost',
  greenest: 'Most renewable',
  'shortest-term': 'Shortest contract',
};

/** Pure filter + sort. `recommended` preserves the engine's ranking. */
export function applyFilters(
  estimates: readonly PlanEstimate[],
  filters: PlanFilters,
): PlanEstimate[] {
  const filtered = estimates.filter((e) => {
    if (filters.renewableOnly && e.plan.renewablePct < 100) return false;
    if (filters.maxTermMonths !== null && e.plan.contractMonths > filters.maxTermMonths) return false;
    return true;
  });

  switch (filters.sort) {
    case 'cheapest':
      return [...filtered].sort((a, b) => a.estimatedMonthly - b.estimatedMonthly);
    case 'greenest':
      return [...filtered].sort(
        (a, b) => b.plan.renewablePct - a.plan.renewablePct || a.estimatedMonthly - b.estimatedMonthly,
      );
    case 'shortest-term':
      return [...filtered].sort(
        (a, b) => a.plan.contractMonths - b.plan.contractMonths || a.estimatedMonthly - b.estimatedMonthly,
      );
    case 'recommended':
    default:
      return filtered;
  }
}

export function parseFilters(params: URLSearchParams): PlanFilters {
  const sortRaw = params.get('sort');
  const sort: PlanSort =
    sortRaw === 'cheapest' || sortRaw === 'greenest' || sortRaw === 'shortest-term'
      ? sortRaw
      : 'recommended';
  const termRaw = params.get('term');
  const maxTermMonths = termRaw === null || termRaw === 'any' ? null : Number(termRaw);
  return {
    sort,
    maxTermMonths: Number.isFinite(maxTermMonths) ? maxTermMonths : null,
    renewableOnly: params.get('green') === '1',
  };
}

export function termLabel(months: number): string {
  return months === 0 ? 'Month to month' : `${months} months`;
}
