/** Pure scale and path helpers. No React, no DOM — unit-tested directly. */

export interface LinearScale {
  (value: number): number;
  readonly domain: readonly [number, number];
  readonly range: readonly [number, number];
}

export function linearScale(
  domain: readonly [number, number],
  range: readonly [number, number],
): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  const fn = ((value: number) => {
    if (span === 0) return r0;
    return r0 + ((value - d0) / span) * (r1 - r0);
  }) as { (value: number): number; domain?: unknown; range?: unknown };
  return Object.assign(fn, { domain, range }) as LinearScale;
}

export interface BandScale {
  (index: number): number;
  readonly bandwidth: number;
  readonly step: number;
}

export function bandScale(
  count: number,
  range: readonly [number, number],
  padding = 0.2,
): BandScale {
  const [r0, r1] = range;
  const width = r1 - r0;
  if (count <= 0) {
    return Object.assign(() => r0, { bandwidth: 0, step: 0 }) as BandScale;
  }
  const step = width / count;
  const bandwidth = step * (1 - padding);
  const fn = (index: number) => r0 + index * step + (step - bandwidth) / 2;
  return Object.assign(fn, { bandwidth, step }) as BandScale;
}

/** Rounded tick values covering the domain, at most `count` of them. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const span = max - min;
  const rawStep = span / Math.max(1, count - 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const stepFactor = normalized >= 7.5 ? 10 : normalized >= 3.5 ? 5 : normalized >= 1.5 ? 2 : 1;
  const step = stepFactor * magnitude;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Math.round(v * 1e6) / 1e6);
  }
  return ticks;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** Straight-segment path through the points. */
export function pathFromPoints(points: readonly Point[]): string {
  if (points.length === 0) return '';
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${round(p.x)},${round(p.y)}`)
    .join(' ');
}

/** Closes a line path down to a baseline, for area fills. */
export function areaFromPoints(points: readonly Point[], baseline: number): string {
  if (points.length === 0) return '';
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return '';
  return `${pathFromPoints(points)} L${round(last.x)},${round(baseline)} L${round(first.x)},${round(baseline)} Z`;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** The chart ink ramp. Brand green is reserved for buttons, never for data. */
export const CHART_INK = {
  primary: 'rgba(1,1,2,1)',
  secondary: 'rgba(1,1,2,0.6)',
  tertiary: 'rgba(1,1,2,0.35)',
  quaternary: 'rgba(1,1,2,0.18)',
  axis: 'rgba(1,1,2,0.15)',
  label: 'rgba(1,1,2,0.6)',
} as const;

/** The single accent, reserved for "your plan" / "recommended" / "after". */
export const CHART_ACCENT = 'rgb(1,48,34)';
