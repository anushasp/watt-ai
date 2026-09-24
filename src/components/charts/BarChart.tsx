import { ChartFrame, type ChartDatum, type LegendEntry } from './ChartFrame';
import { CHART_ACCENT, CHART_INK, bandScale, linearScale, niceTicks } from './scales';
import chartMotion from './chartMotion.module.css';

const W = 640;
const H = 320;
const PAD = { top: 16, right: 16, bottom: 36, left: 52 };

export interface BarSeries {
  readonly label: string;
  readonly values: readonly number[];
  readonly color?: string | undefined;
}

export interface BarChartProps {
  title: string;
  description: string;
  labels: readonly string[];
  series: readonly BarSeries[];
  format: (value: number) => string;
  /** stacked sums series per label; grouped places them side by side. */
  mode?: 'stacked' | 'grouped' | undefined;
  /** Index of the label to emphasise at full ink. */
  highlightIndex?: number | undefined;
}

export function BarChart({
  title,
  description,
  labels,
  series,
  format,
  mode = 'grouped',
  highlightIndex,
}: BarChartProps) {
  const totals = labels.map((_, i) =>
    mode === 'stacked'
      ? series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0)
      : Math.max(...series.map((s) => s.values[i] ?? 0)),
  );
  const max = Math.max(...totals, 0);
  const ticks = niceTicks(0, max, 5);
  const top = ticks[ticks.length - 1] ?? max;
  const y = linearScale([0, top], [H - PAD.bottom, PAD.top]);
  const band = bandScale(labels.length, [PAD.left, W - PAD.right], 0.25);
  const innerWidth = mode === 'grouped' ? band.bandwidth / series.length : band.bandwidth;

  const legend: LegendEntry[] | undefined =
    series.length > 1
      ? series.map((s, i) => ({ label: s.label, color: s.color ?? seriesColor(i) }))
      : undefined;

  const tableData: ChartDatum[] = labels.map((label, i) => ({
    label,
    values: series.map((s) => format(s.values[i] ?? 0)),
  }));

  const labelStep = Math.max(1, Math.ceil(labels.length / 10));

  return (
    <ChartFrame
      title={title}
      description={description}
      width={W}
      height={H}
      legend={legend}
      columns={series.map((s) => s.label)}
      data={tableData}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={CHART_INK.axis} />
          <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={CHART_INK.label}>
            {format(t)}
          </text>
        </g>
      ))}

      {labels.map((label, i) => {
        let stackTop = y(0);
        return (
          <g key={label + String(i)}>
            {series.map((s, si) => {
              const value = s.values[i] ?? 0;
              const height = y(0) - y(value);
              const color = s.color ?? seriesColor(si);
              const dimmed = highlightIndex !== undefined && highlightIndex !== i;
              const rectX =
                mode === 'grouped' ? band(i) + si * innerWidth : band(i);
              const rectY = mode === 'grouped' ? y(value) : stackTop - height;
              if (mode === 'stacked') stackTop -= height;
              return (
                <rect
                  key={s.label}
                  className={chartMotion.growBar}
                  style={{ ['--bar' as string]: i }}
                  x={rectX}
                  y={rectY}
                  width={Math.max(0, innerWidth - (mode === 'grouped' ? 2 : 0))}
                  height={Math.max(0, height)}
                  fill={color}
                  opacity={dimmed ? 0.35 : 1}
                  rx={2}
                />
              );
            })}
            {i % labelStep === 0 ? (
              <text
                x={band(i) + band.bandwidth / 2}
                y={H - PAD.bottom + 18}
                textAnchor="middle"
                fontSize={11}
                fill={CHART_INK.label}
              >
                {label}
              </text>
            ) : null}
          </g>
        );
      })}
    </ChartFrame>
  );
}

export interface HorizontalBarChartProps {
  title: string;
  description: string;
  items: readonly { readonly label: string; readonly value: number }[];
  format: (value: number) => string;
  /** Label of the item to draw in the accent colour. */
  highlight?: string | undefined;
}

export function HorizontalBarChart({
  title,
  description,
  items,
  format,
  highlight,
}: HorizontalBarChartProps) {
  const height = Math.max(180, items.length * 44 + 24);
  const left = 150;
  const max = Math.max(...items.map((i) => i.value), 0);
  const x = linearScale([0, max], [left, W - 80]);
  const band = bandScale(items.length, [12, height - 12], 0.35);

  return (
    <ChartFrame
      title={title}
      description={description}
      width={W}
      height={height}
      columns={['Value']}
      data={items.map((i) => ({ label: i.label, values: [format(i.value)] }))}
    >
      {items.map((item, i) => {
        const barWidth = x(item.value) - left;
        return (
          <g key={item.label}>
            <text
              x={left - 12}
              y={band(i) + band.bandwidth / 2 + 4}
              textAnchor="end"
              fontSize={12}
              fill={CHART_INK.label}
            >
              {item.label}
            </text>
            <rect
              className={chartMotion.growBarH}
              style={{ ['--bar' as string]: i }}
              x={left}
              y={band(i)}
              width={Math.max(0, barWidth)}
              height={band.bandwidth}
              fill={highlight === item.label ? CHART_ACCENT : CHART_INK.secondary}
              rx={3}
            />
            <text
              x={left + barWidth + 8}
              y={band(i) + band.bandwidth / 2 + 4}
              fontSize={12}
              fill={CHART_INK.primary}
            >
              {format(item.value)}
            </text>
          </g>
        );
      })}
    </ChartFrame>
  );
}

function seriesColor(index: number): string {
  return (
    [CHART_INK.primary, CHART_ACCENT, CHART_INK.tertiary, CHART_INK.quaternary][index % 4] ??
    CHART_INK.primary
  );
}
