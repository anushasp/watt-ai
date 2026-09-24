import { useId, useRef } from "react";
import { Icon, type IconName } from "@/ds";
import { formatKw } from "@/services/money";
import {
  deriveEnergyFlow,
  type EnergyFlowInput,
  type EnergyLink,
  type EnergyNodeId,
} from "@/services/energyFlow";
import { useInView } from "@/hooks/useInView";
import { ChartFrame, type ChartDatum } from "./ChartFrame";
import flowStyles from "./flow.module.css";
import styles from "./EnergyFlow.module.css";

const W = 680;
const H = 480;

interface NodeBox {
  readonly id: EnergyNodeId;
  readonly label: string;
  readonly icon: IconName;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  /** How the node's value reads. Percentages are the battery's alone. */
  readonly unit: "kw" | "percent";
  /** Reserves a row at the foot of the card for the optimization badge. Home only. */
  readonly hasBadge?: boolean;
}

/**
 * Where each line of text sits inside a card.
 *
 * Worked out from the card's height rather than written per node, so the five cards stay
 * in step. A card with a badge hands the bottom 22px to it and lays its text out in what
 * is left — which is what keeps the badge off the icon at the larger mobile type size.
 */
function rows(h: number, hasBadge: boolean) {
  const body = hasBadge ? h - 22 : h;
  return {
    icon: 12,
    label: body * 0.53,
    value: body * 0.78,
    state: body * 0.95,
    badge: h - 12,
  };
}

/**
 * Fixed positions. The shape of the ecosystem is the same for every home, so the geometry
 * is a constant; only each link's direction, weight and speed respond to state.
 */
const NODES: readonly NodeBox[] = [
  {
    id: "solar",
    label: "Solar",
    icon: "Pattern",
    x: 265,
    y: 6,
    w: 150,
    h: 88,
    unit: "kw",
  },
  {
    id: "grid",
    label: "Grid",
    icon: "SmartOutlet",
    x: 2,
    y: 200,
    w: 148,
    h: 88,
    unit: "kw",
  },
  {
    id: "home",
    label: "Home",
    icon: "HomeMax",
    x: 256,
    y: 184,
    w: 168,
    h: 120,
    unit: "kw",
    // The badge row is reserved whether or not optimization is on, so switching it does
    // not move the rest of the card.
    hasBadge: true,
  },
  {
    id: "ev",
    label: "EV",
    icon: "Charger",
    x: 530,
    y: 200,
    w: 148,
    h: 88,
    unit: "kw",
  },
  {
    id: "battery",
    label: "Battery",
    icon: "BatteryChange",
    x: 265,
    y: 386,
    w: 150,
    h: 88,
    unit: "percent",
  },
];

type Point = readonly [number, number];

/**
 * The gap between two node boxes, always written outward from the home. A link running the
 * other way reuses the same segment reversed, so a reversal is one code path rather than a
 * second set of coordinates that could drift out of step.
 */
const SEGMENTS: Readonly<Record<string, readonly [Point, Point]>> = {
  "solar|home": [
    [340, 100],
    [340, 178],
  ],
  "grid|home": [
    [156, 244],
    [250, 244],
  ],
  "home|ev": [
    [430, 244],
    [524, 244],
  ],
  "home|battery": [
    [340, 310],
    [340, 380],
  ],
};

function segmentFor(
  from: EnergyNodeId,
  to: EnergyNodeId,
): readonly [Point, Point] | null {
  const forward = SEGMENTS[`${from}|${to}`];
  if (forward) return forward;
  const reverse = SEGMENTS[`${to}|${from}`];
  return reverse ? [reverse[1], reverse[0]] : null;
}

/**
 * The meter is the line that matters: power moving between the home's own equipment reads
 * green, and power crossing the meter in either direction reads ink. Every link is one or
 * the other, so the two-colour legend is complete.
 */
function isBehindTheMeter(link: EnergyLink): boolean {
  return link.from !== "grid" && link.to !== "grid";
}

export interface EnergyFlowProps extends EnergyFlowInput {
  title?: string | undefined;
  description?: string | undefined;
}

/**
 * The live picture of a home's energy: what is coming in, where it is going, and how fast.
 *
 * Which links are live is entirely `deriveEnergyFlow`'s decision; this component only draws
 * the model it is handed. Passing different props is the whole state machine.
 */
export function EnergyFlow({ title, description, ...input }: EnergyFlowProps) {
  const clipId = useId();
  // Wraps every moving part, so scrolling away stops the pulses and the optimization dot
  // together rather than leaving one of them ticking.
  const rootRef = useRef<SVGGElement>(null);
  const visible = useInView(rootRef);
  const model = deriveEnergyFlow(input);
  const active = new Set(model.links.flatMap((l) => [l.from, l.to]));

  const summary =
    model.links.length > 0
      ? `${model.links.map((l) => `${l.label}, ${formatKw(l.kw)}`).join(". ")}.`
      : "Nothing is flowing right now.";

  const rows: readonly ChartDatum[] = NODES.map((node) => {
    const status = model.nodes[node.id];
    return {
      label: node.label,
      values: [
        status.state,
        node.unit === "percent" ? `${status.value}%` : formatKw(status.value),
      ],
    };
  });

  return (
    <ChartFrame
      title={title ?? "Live energy flow"}
      description={description ?? summary}
      width={W}
      height={H}
      legend={[
        { label: "Moving inside your home", color: "var(--watercourse)" },
        { label: "Crossing your meter", color: "var(--neutral-dark)" },
      ]}
      columns={["State", "Reading"]}
      data={rows}
    >
      <g ref={rootRef} data-flow-visible={visible ? "true" : "false"}>
        <defs>
          <clipPath id={clipId}>
            <rect x={265} y={386} width={150} height={88} rx={16} />
          </clipPath>
        </defs>

        {/* The idle topology sits underneath, so the shape of the system is always legible
          and a link switching off reads as "nothing flowing" rather than a missing part. */}
        {Object.values(SEGMENTS).map(([a, b], i) => (
          <path
            key={i}
            className={styles.rail}
            d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`}
          />
        ))}

        {model.links.map((link) => (
          <Link key={link.id} link={link} peakKw={model.peakKw} />
        ))}

        {NODES.map((node) => (
          <Node
            key={node.id}
            node={node}
            status={model.nodes[node.id]}
            active={active.has(node.id)}
            clipId={clipId}
            optimizing={
              node.id === "home" && input.optimizationEnabled === true
            }
          />
        ))}
      </g>
    </ChartFrame>
  );
}

function Link({ link, peakKw }: { link: EnergyLink; peakKw: number }) {
  const segment = segmentFor(link.from, link.to);
  if (!segment) return null;
  const [[x1, y1], [x2, y2]] = segment;
  const tone = isBehindTheMeter(link) ? styles.own : styles.bought;
  const d = `M${x1},${y1} L${x2},${y2}`;

  // Weight is power: the busiest link on screen is the thickest.
  const width = 3 + (link.kw / peakKw) * 5;
  // ...and so is speed. 0.5 at nothing, 1.5 at the peak, so a 7 kW car charge visibly
  // outruns a 0.6 kW battery trickle. The motion is the reading, not an effect.
  const rate = (0.5 + link.kw / peakKw).toFixed(2);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  return (
    <g>
      <path className={`${styles.link} ${tone}`} d={d} strokeWidth={width} />
      {/* Direction, stated. This is what survives reduced motion. */}
      <polygon
        className={`${styles.arrow} ${tone}`}
        points="-5,-5 6,0 -5,5"
        transform={`translate(${(x1 + x2) / 2} ${(y1 + y2) / 2}) rotate(${angle})`}
      />
      {/* ...and direction, felt. The dash travels from source to target because the path
          itself is written that way, so one keyframe serves every link in either direction. */}
      <path
        className={`${flowStyles.flowLine} ${tone}`}
        data-ambient=""
        d={d}
        strokeWidth={Math.max(1.5, width * 0.4)}
        strokeLinecap="round"
        strokeDasharray="4 22"
        opacity={0.9}
        style={{ ["--flow-rate" as string]: rate }}
      />
    </g>
  );
}

interface NodeProps {
  node: NodeBox;
  status: { active: boolean; value: number; state: string };
  active: boolean;
  clipId: string;
  optimizing: boolean;
}

function Node({ node, status, active, clipId, optimizing }: NodeProps) {
  const cx = node.x + node.w / 2;
  const row = rows(node.h, node.hasBadge === true);
  const isBattery = node.id === "battery";
  const flag = active || status.active ? "true" : "false";

  return (
    <g>
      {isBattery ? (
        <g clipPath={`url(#${clipId})`}>
          <rect
            x={node.x}
            y={node.y}
            width={node.w}
            height={node.h}
            fill="var(--neutral-white)"
          />
          {/* State of charge. Clipped to the card, so scaling it cannot round off the corners. */}
          <rect
            className={styles.batteryFill}
            x={node.x}
            y={node.y}
            width={node.w}
            height={node.h}
            style={{ ["--battery-level" as string]: status.value / 100 }}
          />
        </g>
      ) : (
        <rect
          className={styles.nodeGlow}
          data-active={flag}
          x={node.x}
          y={node.y}
          width={node.w}
          height={node.h}
          rx={16}
        />
      )}

      <rect
        className={styles.node}
        data-active={flag}
        data-hollow={isBattery ? "true" : undefined}
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={16}
      />

      {/* `color` cascades into the nested icon svg, which paints with currentColor. */}
      <g className={styles.nodeIcon} data-active={flag}>
        <Icon name={node.icon} size={20} x={cx - 10} y={node.y + row.icon} />
      </g>
      <text
        className={styles.label}
        x={cx}
        y={node.y + row.label}
        textAnchor="middle"
      >
        {node.label}
      </text>
      <text
        className={styles.value}
        x={cx}
        y={node.y + row.value}
        textAnchor="middle"
      >
        {node.unit === "percent" ? `${status.value}%` : formatKw(status.value)}
      </text>
      <text
        className={styles.state}
        x={cx}
        y={node.y + row.state}
        textAnchor="middle"
      >
        {status.state}
      </text>

      {optimizing ? (
        <g>
          <circle
            className={styles.optimizingDot}
            data-ambient=""
            cx={node.x + 16}
            cy={node.y + row.badge - 4}
            r={4}
          />
          <text className={styles.state} x={node.x + 26} y={node.y + row.badge}>
            wattsAI optimizing
          </text>
        </g>
      ) : null}
    </g>
  );
}
