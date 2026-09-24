/**
 * What an EV charging session costs, depending on when it runs.
 *
 * Pure: no React, no DOM. The demo animates whatever this returns, so the claim "wattsAI
 * saves you $1.90 a session" is arithmetic that can be checked, not a number chosen to
 * make an animation look good.
 *
 * Hours run from midnight and may exceed 24 — a session starting at 23:00 ends at 26.2,
 * which is 02:12 the next morning. Keeping one number line avoids wrapping logic.
 */

export interface TariffWindow {
  readonly label: string;
  readonly from: number;
  readonly to: number;
  readonly rate: number;
}

/**
 * A conventional time-of-use day, and the one the rest of the product already describes:
 * the peak window is the 4-to-9 PM block the insight points at, and off-peak starts at
 * 11 PM, which is the hour the EV insight and the home page both name.
 */
export const TARIFF_DAY: readonly TariffWindow[] = [
  { label: 'Off-peak', from: 0, to: 7, rate: 0.079 },
  { label: 'Mid-peak', from: 7, to: 16, rate: 0.14 },
  { label: 'Peak', from: 16, to: 21, rate: 0.198 },
  { label: 'Mid-peak', from: 21, to: 23, rate: 0.14 },
  { label: 'Off-peak', from: 23, to: 31, rate: 0.079 },
];

/** The hour off-peak pricing begins, which is when an optimized session is moved to. */
export const OFF_PEAK_HOUR = 23;

/** The hour sessions actually start today, from the dashboard's own charging histogram. */
export const PLUG_IN_HOUR = 18;

/** Session shape, from the EV insight: 3.2 hours, around 16.5 kWh. */
export const SESSION_HOURS = 3.2;
export const SESSION_KWH = 16.5;
const CHARGER_KW = SESSION_KWH / SESSION_HOURS;

export interface ChargeSession {
  readonly startHour: number;
  readonly endHour: number;
  readonly kwh: number;
  readonly cost: number;
}

/** The rate in force at a given hour. Falls back to the last window for hours past the end. */
export function rateAt(hour: number): number {
  const window = TARIFF_DAY.find((w) => hour >= w.from && hour < w.to);
  return window?.rate ?? TARIFF_DAY[TARIFF_DAY.length - 1]!.rate;
}

/**
 * Cost of charging from `startHour` for `SESSION_HOURS`, priced window by window rather
 * than at a single blended rate — a session that straddles 9 PM really is billed at two
 * rates, and blending would hide exactly the effect this demo exists to show.
 */
export function sessionCost(startHour: number): number {
  const end = startHour + SESSION_HOURS;
  let total = 0;
  for (const window of TARIFF_DAY) {
    const overlap = Math.min(end, window.to) - Math.max(startHour, window.from);
    if (overlap > 0) total += overlap * CHARGER_KW * window.rate;
  }
  return Math.round(total * 100) / 100;
}

/**
 * The session wattsAI would run, with optimization on or off.
 *
 * Off, the car charges the moment it is plugged in. On, the start is held until off-peak
 * pricing begins. The energy delivered is identical either way — only the price changes,
 * which is the entire point.
 */
export function evSession(optimized: boolean): ChargeSession {
  const startHour = optimized ? OFF_PEAK_HOUR : PLUG_IN_HOUR;
  return {
    startHour,
    endHour: startHour + SESSION_HOURS,
    kwh: SESSION_KWH,
    cost: sessionCost(startHour),
  };
}

/** What optimization is worth per session. Positive means the delay saves money. */
export function evSavings(): number {
  return Math.round((sessionCost(PLUG_IN_HOUR) - sessionCost(OFF_PEAK_HOUR)) * 100) / 100;
}
