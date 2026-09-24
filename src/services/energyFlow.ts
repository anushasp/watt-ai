/**
 * Which links of the home energy ecosystem are live, and in which direction.
 *
 * Pure: no React, no DOM, no SVG. The diagram draws whatever this returns, so the rules
 * for "is the battery charging" live here and are unit-tested, never inside an animation.
 *
 * Topology is fixed — every link runs through the home:
 *
 *            Solar
 *              |
 *   Grid <-> Home -> EV
 *              |
 *           Battery
 *
 * So "solar charges the battery" is the composite of solar -> home and home -> battery
 * both being live, rather than a separate edge.
 *
 * All power figures are INSTANTANEOUS kW, never kWh. `batteryLevel` is the only percentage.
 */

export type EnergyNodeId = 'solar' | 'grid' | 'home' | 'battery' | 'ev';
export type BatteryState = 'charging' | 'discharging' | 'idle';

/** Below this many kW a link is treated as off, so a rounding crumb never draws an arrow. */
const EPSILON = 0.05;

/** A typical single-phase home charger. Used only when `evPower` is not supplied. */
export const DEFAULT_EV_KW = 7.2;

export interface EnergyFlowInput {
  /** kW produced by the panels right now. */
  readonly solarGeneration: number;
  /** kW drawn by the house itself, excluding the EV. */
  readonly homeUsage: number;
  /** kW at the meter. Positive is importing, negative is exporting. */
  readonly gridPower: number;
  /** State of charge, 0-100. */
  readonly batteryLevel: number;
  readonly batteryState: BatteryState;
  /** kW into or out of the battery. Defaults to the residual, which is what a battery does. */
  readonly batteryPower?: number | undefined;
  readonly evConnected: boolean;
  readonly evCharging: boolean;
  /** kW into the car. Defaults to DEFAULT_EV_KW. */
  readonly evPower?: number | undefined;
  /** Whether wattsAI is managing the schedule. Affects presentation, never the arrows. */
  readonly optimizationEnabled?: boolean | undefined;
}

export interface EnergyLink {
  readonly id: string;
  readonly from: EnergyNodeId;
  readonly to: EnergyNodeId;
  readonly kw: number;
  /** Plain-language direction, used for the non-visual description. */
  readonly label: string;
}

export interface EnergyNodeStatus {
  /** True when power is moving into or out of this node. */
  readonly active: boolean;
  /** kW at this node, or the state of charge for the battery. */
  readonly value: number;
  /** One word for the node's current condition, for the caption and the data table. */
  readonly state: string;
}

export interface EnergyFlowModel {
  readonly links: readonly EnergyLink[];
  readonly nodes: Readonly<Record<EnergyNodeId, EnergyNodeStatus>>;
  /** Largest live link, so the diagram can size strokes relative to it. Never 0. */
  readonly peakKw: number;
  /**
   * True when supply and draw agree. A caller passing independent readings can end up
   * with a picture that does not add up; this says so rather than quietly drawing it.
   */
  readonly balanced: boolean;
  /** Supply minus draw before the battery is considered. Positive is a surplus. */
  readonly residualKw: number;
}

function positive(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function deriveEnergyFlow(input: EnergyFlowInput): EnergyFlowModel {
  const solar = positive(input.solarGeneration);
  const home = positive(input.homeUsage);
  const grid = Number.isFinite(input.gridPower) ? input.gridPower : 0;
  const gridImport = Math.max(0, grid);
  const gridExport = Math.max(0, -grid);
  const evCharging = input.evConnected && input.evCharging;
  const ev = evCharging ? positive(input.evPower ?? DEFAULT_EV_KW) : 0;

  /*
   * What comes in, minus what is spent. A surplus is what there is to charge with and a
   * deficit is what has to be covered, so it is the battery's natural default power.
   * `batteryState` still decides the direction — the caller owns that decision.
   */
  const residualKw = round(solar + gridImport - home - ev - gridExport);
  const idle = input.batteryState === 'idle';
  const batteryKw = idle ? 0 : positive(input.batteryPower ?? Math.abs(residualKw));
  const charging = input.batteryState === 'charging';

  const candidates: readonly EnergyLink[] = [
    { id: 'solar-home', from: 'solar', to: 'home', kw: solar, label: 'Solar to home' },
    { id: 'grid-home', from: 'grid', to: 'home', kw: gridImport, label: 'Grid to home' },
    { id: 'home-grid', from: 'home', to: 'grid', kw: gridExport, label: 'Home to grid' },
    {
      id: 'home-battery',
      from: 'home',
      to: 'battery',
      kw: charging ? batteryKw : 0,
      label: 'Home to battery',
    },
    {
      id: 'battery-home',
      from: 'battery',
      to: 'home',
      kw: !charging && !idle ? batteryKw : 0,
      label: 'Battery to home',
    },
    { id: 'home-ev', from: 'home', to: 'ev', kw: ev, label: 'Home to EV' },
  ];

  const links = candidates.filter((link) => link.kw > EPSILON);
  const peakKw = links.reduce((max, link) => Math.max(max, link.kw), 0) || 1;

  // The battery absorbs a surplus and covers a deficit, so the residual should equal the
  // signed battery power for the picture to add up.
  const signedBattery = charging ? batteryKw : -batteryKw;
  const balanced = Math.abs(residualKw - signedBattery) < EPSILON;

  const level = Math.min(100, Math.max(0, positive(input.batteryLevel)));

  return {
    links,
    peakKw,
    balanced,
    residualKw,
    nodes: {
      solar: {
        active: solar > EPSILON,
        value: round(solar),
        state: solar > EPSILON ? 'Generating' : 'Not generating',
      },
      grid: {
        active: gridImport > EPSILON || gridExport > EPSILON,
        value: round(gridImport > EPSILON ? gridImport : gridExport),
        state: gridImport > EPSILON ? 'Importing' : gridExport > EPSILON ? 'Exporting' : 'Idle',
      },
      home: { active: home > EPSILON, value: round(home), state: 'Using' },
      battery: {
        active: batteryKw > EPSILON,
        value: Math.round(level),
        state: idle || batteryKw <= EPSILON ? 'Holding' : charging ? 'Charging' : 'Discharging',
      },
      ev: {
        active: ev > EPSILON,
        value: round(ev),
        state: !input.evConnected ? 'Unplugged' : evCharging ? 'Charging' : 'Plugged in, waiting',
      },
    },
  };
}
