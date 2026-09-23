/** A point in a usage series. `kwh` is energy over the interval; `cost` is dollars. */
export interface UsagePoint {
  readonly label: string;
  readonly kwh: number;
  readonly cost: number;
}

export interface TariffSplitPoint {
  readonly label: string;
  readonly offPeak: number;
  readonly mid: number;
  readonly peak: number;
}

export interface EndUse {
  readonly label: string;
  readonly kwh: number;
}

/**
 * One node of the simulated energy-flow diagram.
 *
 * `kw` is INSTANTANEOUS POWER in kilowatts. It is never a kWh figure. Sources and
 * loads must sum to the same total — `assertFlowBalances` enforces it.
 */
export interface FlowNode {
  readonly id: string;
  readonly label: string;
  readonly kw: number;
  readonly icon: string;
}

export interface EnergyFlow {
  readonly sources: readonly FlowNode[];
  readonly loads: readonly FlowNode[];
  /** Energy consumed so far today, in kWh. Reported separately from the kW figures. */
  readonly todayKwh: number;
}

export interface DashboardSummary {
  readonly todayCost: number;
  readonly todayKwh: number;
  readonly projectedBill: number;
  readonly projectedSavings: number;
  readonly costTrend: readonly number[];
  readonly usageTrend: readonly number[];
  readonly projectionTrend: readonly number[];
  readonly savingsTrend: readonly number[];
}
