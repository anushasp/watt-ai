import { useRef } from 'react';
import { Icon, type IconName } from '@/ds';
import { useCountUp } from '@/hooks/useCountUp';
import { useInView } from '@/hooks/useInView';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { formatKw } from '@/services/money';
import { flowBalance } from '@/services/energy';
import type { EnergyFlow, FlowNode } from '@/types';
import { ChartFrame } from './ChartFrame';
import { CHART_ACCENT, CHART_INK } from './scales';
import flowStyles from './flow.module.css';

const W = 880;
const H = 420;
const HUB_X = W / 2;
const HUB_R = 62;

export interface EnergyFlowDiagramProps {
  flow: EnergyFlow;
}

/**
 * Simulated instantaneous power flow. Every figure is kW — power at this moment —
 * and is never mixed with kWh, which measures energy over a period. Stroke width is
 * proportional to kW, so the picture and the numbers agree.
 */
export function EnergyFlowDiagram({ flow }: EnergyFlowDiagramProps) {
  const hubRef = useRef<SVGCircleElement>(null);
  const linksRef = useRef<SVGGElement>(null);
  const seen = useInViewOnce(hubRef);
  // The travelling pulses hold still while the diagram is off screen.
  const visible = useInView(linksRef);
  const { inKw, outKw, balanced } = flowBalance(flow);
  // The hub total counts up the first time the diagram is seen. The In and Out labels do
  // not move — they are the balance proof and must read identically at all times.
  const hubKw = useCountUp(outKw, { enabled: seen });
  const maxKw = Math.max(...flow.sources.map((n) => n.kw), ...flow.loads.map((n) => n.kw));

  const sourceY = spread(flow.sources.length);
  const loadY = spread(flow.loads.length);

  const description = `Simulated power flow. ${formatKw(inKw)} coming in from ${flow.sources
    .map((s) => `${s.label.toLowerCase()} ${formatKw(s.kw)}`)
    .join(', ')}, and ${formatKw(outKw)} going out to ${flow.loads
    .map((l) => `${l.label.toLowerCase()} ${formatKw(l.kw)}`)
    .join(', ')}.`;

  return (
    <ChartFrame
      title="Simulated energy flow, right now"
      description={description}
      width={W}
      height={H}
      columns={['Power (kW)', 'Direction']}
      data={[
        ...flow.sources.map((n) => ({ label: n.label, values: [formatKw(n.kw), 'Into the home'] })),
        ...flow.loads.map((n) => ({ label: n.label, values: [formatKw(n.kw), 'Out of the home'] })),
        { label: 'Total in', values: [formatKw(inKw), 'Into the home'] },
        { label: 'Total out', values: [formatKw(outKw), 'Out of the home'] },
      ]}
    >
      <g ref={linksRef} data-flow-visible={visible ? 'true' : 'false'}>
        {flow.sources.map((node, i) => (
          <Link
            key={node.id}
            from={{ x: 180, y: sourceY[i] ?? H / 2 }}
            to={{ x: HUB_X - HUB_R, y: H / 2 }}
            kw={node.kw}
            maxKw={maxKw}
            accent
          />
        ))}
        {flow.loads.map((node, i) => (
          <Link
            key={node.id}
            from={{ x: HUB_X + HUB_R, y: H / 2 }}
            to={{ x: W - 180, y: loadY[i] ?? H / 2 }}
            kw={node.kw}
            maxKw={maxKw}
          />
        ))}
      </g>

      <circle
        ref={hubRef}
        cx={HUB_X}
        cy={H / 2}
        r={HUB_R}
        fill="var(--neutral-white)"
        stroke={CHART_INK.primary}
        strokeWidth={1.5}
      />
      <text x={HUB_X} y={H / 2 - 6} textAnchor="middle" fontSize={13} fill={CHART_INK.label}>
        Your home
      </text>
      <text
        x={HUB_X}
        y={H / 2 + 18}
        textAnchor="middle"
        fontSize={20}
        fontWeight={700}
        fill={CHART_INK.primary}
      >
        {formatKw(hubKw)}
      </text>

      {flow.sources.map((node, i) => (
        <NodeLabel key={node.id} node={node} x={180} y={sourceY[i] ?? H / 2} anchor="end" accent />
      ))}
      {flow.loads.map((node, i) => (
        <NodeLabel key={node.id} node={node} x={W - 180} y={loadY[i] ?? H / 2} anchor="start" />
      ))}

      <text x={16} y={24} fontSize={12} fill={CHART_INK.label}>
        In {formatKw(inKw)}
      </text>
      <text x={W - 16} y={24} textAnchor="end" fontSize={12} fill={CHART_INK.label}>
        Out {formatKw(outKw)}
      </text>
      {balanced ? null : (
        <text x={HUB_X} y={H - 8} textAnchor="middle" fontSize={12} fill="var(--feedback-error)">
          Flow does not balance
        </text>
      )}
    </ChartFrame>
  );

  function spread(count: number): number[] {
    const usable = H - 96;
    const step = usable / Math.max(1, count);
    return Array.from({ length: count }, (_, i) => 48 + step * (i + 0.5));
  }
}

function Link({
  from,
  to,
  kw,
  maxKw,
  accent = false,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  kw: number;
  maxKw: number;
  accent?: boolean;
}) {
  const width = 2 + (kw / maxKw) * 14;
  const midX = (from.x + to.x) / 2;
  const d = `M${from.x},${from.y} C${midX},${from.y} ${midX},${to.y} ${to.x},${to.y}`;
  const stroke = accent ? CHART_ACCENT : CHART_INK.secondary;
  // 0.5 at no load, 1.5 at the busiest link — a ~3x spread in travel speed.
  const rate = 0.5 + kw / maxKw;
  return (
    <g>
      <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" opacity={0.45} />
      <path
        className={flowStyles.flowLine}
        data-ambient=""
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={Math.max(1.5, width * 0.34)}
        strokeLinecap="round"
        strokeDasharray="4 22"
        opacity={0.8}
        style={{ ['--flow-rate' as string]: rate.toFixed(2) }}
      />
    </g>
  );
}

function NodeLabel({
  node,
  x,
  y,
  anchor,
  accent = false,
}: {
  node: FlowNode;
  x: number;
  y: number;
  anchor: 'start' | 'end';
  accent?: boolean;
}) {
  const iconX = anchor === 'end' ? x - 28 : x + 4;
  return (
    <g>
      <foreignObject x={iconX} y={y - 12} width={24} height={24}>
        <Icon
          name={node.icon as IconName}
          size={24}
          style={{ color: accent ? CHART_ACCENT : CHART_INK.primary }}
        />
      </foreignObject>
      <text
        x={anchor === 'end' ? x - 36 : x + 36}
        y={y - 2}
        textAnchor={anchor}
        fontSize={13}
        fill={CHART_INK.primary}
      >
        {node.label}
      </text>
      <text
        x={anchor === 'end' ? x - 36 : x + 36}
        y={y + 16}
        textAnchor={anchor}
        fontSize={13}
        fontWeight={700}
        fill={CHART_INK.label}
      >
        {formatKw(node.kw)}
      </text>
    </g>
  );
}
