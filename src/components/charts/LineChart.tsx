import { ChartFrame, type ChartDatum } from './ChartFrame';
import chartMotion from './chartMotion.module.css';
import {
  CHART_ACCENT,
  CHART_INK,
  areaFromPoints,
  bandScale,
  linearScale,
  niceTicks,
  pathFromPoints,
  type Point,
} from './scales';

const W = 640;
const H = 320;
const PAD = { top: 16, right: 16, bottom: 36, left: 52 };

export interface LineSeries {
  readonly label: string;
  readonly values: readonly number[];
  readonly color?: string | undefined;
  readonly dashed?: boolean | undefined;
  readonly area?: boolean | undefined;
}

export interface LineChartProps {
  title: string;
  description: string;
  labels: readonly string[];
  series: readonly LineSeries[];
  /** Formats a value for the axis and the data table. */
  format: (value: number) => string;
}

export function LineChart({ title, description, labels, series, format }: LineChartProps) {
  const all = series.flatMap((s) => s.values.filter((v) => Number.isFinite(v)));
  const max = Math.max(...all, 0);
  const ticks = niceTicks(0, max, 5);
  const top = ticks[ticks.length - 1] ?? max;
  const y = linearScale([0, top], [H - PAD.bottom, PAD.top]);
  const band = bandScale(labels.length, [PAD.left, W - PAD.right], 0);
  const x = (i: number) => band(i) + band.bandwidth / 2;

  const tableData: ChartDatum[] = labels.map((label, i) => ({
    label,
    values: series.map((s) => {
      const v = s.values[i];
      return v === undefined || !Number.isFinite(v) ? '—' : format(v);
    }),
  }));

  // Show at most 8 x-axis labels so they never collide.
  const labelStep = Math.max(1, Math.ceil(labels.length / 8));

  return (
    <ChartFrame
      title={title}
      description={description}
      width={W}
      height={H}
      legend={
        series.length > 1
          ? series.map((s, i) => ({ label: s.label, color: s.color ?? seriesColor(i) }))
          : undefined
      }
      columns={series.map((s) => s.label)}
      data={tableData}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(t)}
            y2={y(t)}
            stroke={CHART_INK.axis}
            strokeWidth={1}
          />
          <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={CHART_INK.label}>
            {format(t)}
          </text>
        </g>
      ))}

      {labels.map((label, i) =>
        i % labelStep === 0 ? (
          <text
            key={label + String(i)}
            x={x(i)}
            y={H - PAD.bottom + 18}
            textAnchor="middle"
            fontSize={11}
            fill={CHART_INK.label}
          >
            {label}
          </text>
        ) : null,
      )}

      {series.map((s, si) => {
        const points: Point[] = s.values
          .map((v, i) => ({ x: x(i), y: y(v), ok: Number.isFinite(v) }))
          .filter((p): p is Point & { ok: boolean } => p.ok)
          .map(({ x: px, y: py }) => ({ x: px, y: py }));
        const color = s.color ?? seriesColor(si);
        return (
          <g key={s.label}>
            {s.area ? (
              <path
                className={chartMotion.drawArea}
                d={areaFromPoints(points, y(0))}
                fill={color}
                opacity={0.12}
              />
            ) : null}
            <path
              className={chartMotion.drawLine}
              pathLength={1}
              d={pathFromPoints(points)}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={s.dashed ? '6 5' : undefined}
            />
          </g>
        );
      })}
    </ChartFrame>
  );
}

function seriesColor(index: number): string {
  return [CHART_INK.primary, CHART_ACCENT, CHART_INK.tertiary][index % 3] ?? CHART_INK.primary;
}
