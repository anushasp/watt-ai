import { describe, expect, it } from 'vitest';
import {
  OFF_PEAK_HOUR,
  PLUG_IN_HOUR,
  SESSION_HOURS,
  SESSION_KWH,
  evSavings,
  evSession,
  rateAt,
  sessionCost,
} from './evSchedule';

describe('EV charging schedule', () => {
  it('prices each hour from the time-of-use day', () => {
    expect(rateAt(18)).toBe(0.198); // peak evening
    expect(rateAt(22)).toBe(0.14); // mid-peak shoulder
    expect(rateAt(23)).toBe(0.079); // off-peak begins
    expect(rateAt(2)).toBe(0.079); // still overnight
  });

  it('prices a straddling session window by window, not at a blended rate', () => {
    // 6:00 PM for 3.2 hours: three hours of peak, then 12 minutes of mid-peak.
    const kw = SESSION_KWH / SESSION_HOURS;
    const expected = 3 * kw * 0.198 + 0.2 * kw * 0.14;
    expect(sessionCost(PLUG_IN_HOUR)).toBeCloseTo(Math.round(expected * 100) / 100, 2);
  });

  it('prices an optimized session entirely at the overnight rate', () => {
    expect(sessionCost(OFF_PEAK_HOUR)).toBeCloseTo(SESSION_KWH * 0.079, 2);
  });

  it('delivers exactly the same energy either way, and only moves when it happens', () => {
    const off = evSession(false);
    const on = evSession(true);
    expect(on.kwh).toBe(off.kwh);
    expect(on.endHour - on.startHour).toBeCloseTo(off.endHour - off.startHour);
    expect(on.startHour).toBeGreaterThan(off.startHour);
  });

  it('saves money by waiting, which is the claim the demo makes', () => {
    const saving = evSavings();
    expect(saving).toBeGreaterThan(0);
    expect(saving).toBeCloseTo(evSession(false).cost - evSession(true).cost, 2);
  });

  it('runs an optimized session past midnight without wrapping to yesterday', () => {
    expect(evSession(true).endHour).toBeGreaterThan(24);
    expect(rateAt(evSession(true).endHour)).toBe(0.079);
  });
});
