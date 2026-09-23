import type { EndUse, EnergyFlow, TariffSplitPoint, UsagePoint } from '@/types';

/**
 * Simulated instantaneous power, in kW. Sources and loads balance exactly:
 *   in  2.4 + 3.2 + 0.6 = 6.2 kW
 *   out 2.1 + 1.9 + 0.9 + 0.8 + 0.5 = 6.2 kW
 * `assertFlowBalances` in the energy service enforces this at runtime and in tests.
 */
export const ENERGY_FLOW: EnergyFlow = {
  sources: [
    { id: 'grid', label: 'Grid', kw: 2.4, icon: 'SmartOutlet' },
    { id: 'solar', label: 'Solar', kw: 3.2, icon: 'Pattern' },
    { id: 'battery', label: 'Battery discharge', kw: 0.6, icon: 'BatteryChange' },
  ],
  loads: [
    { id: 'hvac', label: 'Heating and cooling', kw: 2.1, icon: 'HomeMax' },
    { id: 'ev', label: 'EV charging', kw: 1.9, icon: 'Charger' },
    { id: 'water', label: 'Water heating', kw: 0.9, icon: 'Minimize' },
    { id: 'appliances', label: 'Appliances', kw: 0.8, icon: 'Devices2' },
    { id: 'always-on', label: 'Always on', kw: 0.5, icon: 'DataUsage' },
  ],
  todayKwh: 28.4,
};

/** Daily usage and cost for the current billing period. */
export const DAILY_USAGE: readonly UsagePoint[] = [
  { label: 'Mar 1', kwh: 44.2, cost: 8.12 },
  { label: 'Mar 2', kwh: 47.8, cost: 8.74 },
  { label: 'Mar 3', kwh: 51.4, cost: 9.36 },
  { label: 'Mar 4', kwh: 46.1, cost: 8.45 },
  { label: 'Mar 5', kwh: 42.7, cost: 7.88 },
  { label: 'Mar 6', kwh: 49.3, cost: 9.01 },
  { label: 'Mar 7', kwh: 55.6, cost: 10.08 },
  { label: 'Mar 8', kwh: 53.2, cost: 9.67 },
  { label: 'Mar 9', kwh: 45.9, cost: 8.41 },
  { label: 'Mar 10', kwh: 43.5, cost: 8.02 },
  { label: 'Mar 11', kwh: 48.8, cost: 8.93 },
  { label: 'Mar 12', kwh: 52.1, cost: 9.48 },
  { label: 'Mar 13', kwh: 57.3, cost: 10.37 },
  { label: 'Mar 14', kwh: 54.9, cost: 9.95 },
  { label: 'Mar 15', kwh: 46.7, cost: 8.55 },
  { label: 'Mar 16', kwh: 44.8, cost: 8.24 },
  { label: 'Mar 17', kwh: 50.2, cost: 9.16 },
  { label: 'Mar 18', kwh: 53.8, cost: 9.77 },
  { label: 'Mar 19', kwh: 58.1, cost: 10.51 },
  { label: 'Mar 20', kwh: 55.4, cost: 10.04 },
  { label: 'Mar 21', kwh: 47.2, cost: 8.63 },
  { label: 'Mar 22', kwh: 28.4, cost: 4.12 },
];

/** Cost split by tariff window, for the last seven days. */
export const TARIFF_SPLIT: readonly TariffSplitPoint[] = [
  { label: 'Mon', offPeak: 2.14, mid: 3.02, peak: 3.41 },
  { label: 'Tue', offPeak: 2.31, mid: 2.88, peak: 3.77 },
  { label: 'Wed', offPeak: 2.08, mid: 3.19, peak: 4.12 },
  { label: 'Thu', offPeak: 2.46, mid: 3.04, peak: 3.88 },
  { label: 'Fri', offPeak: 2.22, mid: 3.31, peak: 4.44 },
  { label: 'Sat', offPeak: 2.67, mid: 2.74, peak: 3.21 },
  { label: 'Sun', offPeak: 2.53, mid: 2.61, peak: 2.98 },
];

/** Month-to-date cost, with the remainder of the period forecast. */
export const MONTH_TO_DATE: readonly number[] = [
  8.12, 16.86, 26.22, 34.67, 42.55, 51.56, 61.64, 71.31, 79.72, 87.74, 96.67, 106.15, 116.52,
  126.47, 135.02, 143.26, 152.42, 162.19, 172.7, 182.74, 191.37, 195.49,
];
export const MONTH_FORECAST: readonly number[] = [195.49, 213.2, 231.6, 250.9, 262.4, 272.84];

/** Consumption by end use for the current period, in kWh. */
export const END_USES: readonly EndUse[] = [
  { label: 'Heating and cooling', kwh: 512 },
  { label: 'EV charging', kwh: 348 },
  { label: 'Water heating', kwh: 218 },
  { label: 'Appliances', kwh: 164 },
  { label: 'Lighting', kwh: 98 },
  { label: 'Always on', kwh: 88 },
];

/** Cumulative savings found since the account was created, in dollars. */
export const CUMULATIVE_SAVINGS: readonly UsagePoint[] = [
  { label: 'Oct', kwh: 0, cost: 12 },
  { label: 'Nov', kwh: 0, cost: 34 },
  { label: 'Dec', kwh: 0, cost: 61 },
  { label: 'Jan', kwh: 0, cost: 98 },
  { label: 'Feb', kwh: 0, cost: 139 },
  { label: 'Mar', kwh: 0, cost: 174 },
];

/** Twelve months of billed cost on the current plan. */
export const TWELVE_MONTH_COST: readonly UsagePoint[] = [
  { label: 'Apr', kwh: 1180, cost: 232.1 },
  { label: 'May', kwh: 1094, cost: 218.4 },
  { label: 'Jun', kwh: 1236, cost: 241.9 },
  { label: 'Jul', kwh: 1482, cost: 281.3 },
  { label: 'Aug', kwh: 1531, cost: 289.2 },
  { label: 'Sep', kwh: 1398, cost: 267.8 },
  { label: 'Oct', kwh: 1211, cost: 238.1 },
  { label: 'Nov', kwh: 1268, cost: 247.2 },
  { label: 'Dec', kwh: 1394, cost: 267.1 },
  { label: 'Jan', kwh: 1467, cost: 278.9 },
  { label: 'Feb', kwh: 1316, cost: 254.12 },
  { label: 'Mar', kwh: 1428, cost: 272.84 },
];
