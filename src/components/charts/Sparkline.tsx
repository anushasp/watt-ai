import { CHART_INK, linearScale, pathFromPoints, type Point } from './scales';

export interface SparklineProps {
  values: readonly number[];
  /** Describes the trend for assistive technology. */
  label: string;
  dark?: boolean | undefined;
}

const W = 120;
const H = 28;

/** A bare trend line inside a stat card. Purely supporting, never the only source. */
export function Sparkline({ values, label, dark = false }: SparklineProps) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const y = linearScale([min, max], [H - 2, 2]);
  const step = W / (values.length - 1);
  const points: Point[] = values.map((v, i) => ({ x: i * step, y: y(v) }));
  const stroke = dark ? 'rgba(255,255,255,0.6)' : CHART_INK.secondary;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label}>
      <path d={pathFromPoints(points)} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}
