import { describe, expect, it } from 'vitest';
import { ENERGY_FLOW, LIVE_FLOW } from '@/mocks/energy';
import { sumKw } from './energy';
import { DEFAULT_EV_KW, deriveEnergyFlow, type EnergyFlowInput } from './energyFlow';

/** A clear midday: panels covering the house, nothing else happening. */
const BASE: EnergyFlowInput = {
  solarGeneration: 3.2,
  homeUsage: 3.2,
  gridPower: 0,
  batteryLevel: 78,
  batteryState: 'idle',
  evConnected: false,
  evCharging: false,
};

const ids = (input: EnergyFlowInput) => deriveEnergyFlow(input).links.map((l) => l.id);

describe('deriveEnergyFlow', () => {
  it('runs solar into the home when the panels cover the load', () => {
    expect(ids(BASE)).toEqual(['solar-home']);
    expect(deriveEnergyFlow(BASE).balanced).toBe(true);
  });

  it('imports from the grid when the home draws more than it makes', () => {
    const model = deriveEnergyFlow({ ...BASE, solarGeneration: 0, gridPower: 2.4 });
    expect(model.links.map((l) => l.id)).toEqual(['grid-home']);
    expect(model.nodes.grid.state).toBe('Importing');
  });

  it('exports to the grid on negative grid power, reversing the same link', () => {
    const model = deriveEnergyFlow({ ...BASE, solarGeneration: 5, gridPower: -1.8 });
    expect(model.links.map((l) => l.id)).toEqual(['solar-home', 'home-grid']);
    expect(model.nodes.grid.state).toBe('Exporting');
  });

  it('charges the battery from a surplus and discharges it into a deficit', () => {
    const charging = deriveEnergyFlow({
      ...BASE,
      solarGeneration: 4.4,
      homeUsage: 2.8,
      batteryState: 'charging',
    });
    expect(charging.links.map((l) => l.id)).toContain('home-battery');
    // The residual is the surplus, so the default battery power makes the picture add up.
    expect(charging.residualKw).toBeCloseTo(1.6);
    expect(charging.balanced).toBe(true);

    const discharging = deriveEnergyFlow({
      ...BASE,
      solarGeneration: 0,
      homeUsage: 0.6,
      batteryState: 'discharging',
    });
    expect(discharging.links.map((l) => l.id)).toEqual(['battery-home']);
    expect(discharging.nodes.battery.state).toBe('Discharging');
  });

  it('holds the battery when it is idle, whatever the residual is', () => {
    const model = deriveEnergyFlow({ ...BASE, solarGeneration: 6, batteryState: 'idle' });
    expect(model.links.map((l) => l.id)).not.toContain('home-battery');
    expect(model.nodes.battery.state).toBe('Holding');
    // Unbalanced is reported rather than hidden: 2.8 kW has nowhere to go.
    expect(model.balanced).toBe(false);
  });

  it('draws a link to the car only while it is actually charging', () => {
    const plugged = deriveEnergyFlow({ ...BASE, evConnected: true, evCharging: false });
    expect(plugged.links.map((l) => l.id)).not.toContain('home-ev');
    expect(plugged.nodes.ev.state).toBe('Plugged in, waiting');

    const charging = deriveEnergyFlow({
      ...BASE,
      gridPower: DEFAULT_EV_KW,
      evConnected: true,
      evCharging: true,
    });
    expect(charging.links.map((l) => l.id)).toContain('home-ev');
    expect(charging.nodes.ev.value).toBe(DEFAULT_EV_KW);
  });

  it('ignores a charging flag while the car is unplugged', () => {
    const model = deriveEnergyFlow({ ...BASE, evConnected: false, evCharging: true });
    expect(model.links.map((l) => l.id)).not.toContain('home-ev');
    expect(model.nodes.ev.state).toBe('Unplugged');
  });

  it('drops links below the noise floor rather than drawing a dead arrow', () => {
    expect(ids({ ...BASE, solarGeneration: 0.01, homeUsage: 0 })).toEqual([]);
  });

  it('clamps the battery level to a percentage', () => {
    expect(deriveEnergyFlow({ ...BASE, batteryLevel: 140 }).nodes.battery.value).toBe(100);
    expect(deriveEnergyFlow({ ...BASE, batteryLevel: -5 }).nodes.battery.value).toBe(0);
  });

  it('never reports a zero peak, so stroke widths cannot divide by zero', () => {
    expect(deriveEnergyFlow({ ...BASE, solarGeneration: 0, homeUsage: 0 }).peakKw).toBe(1);
  });

  it('honours an explicit battery power over the residual', () => {
    const model = deriveEnergyFlow({ ...BASE, batteryState: 'charging', batteryPower: 2.5 });
    expect(model.links.find((l) => l.id === 'home-battery')?.kw).toBe(2.5);
  });
});

describe('the shipped fixture', () => {
  it('balances, so the diagram never draws power arriving from nowhere', () => {
    const model = deriveEnergyFlow(LIVE_FLOW);
    expect(model.balanced).toBe(true);
  });

  it('describes the same instant as the sources-and-loads fixture', () => {
    // LIVE_FLOW splits the car out as its own node; ENERGY_FLOW counts it as a load. The
    // two must still add up to one home, or the dashboard contradicts itself.
    const ev = ENERGY_FLOW.loads.find((l) => l.id === 'ev')?.kw ?? 0;
    const houseWithoutEv = sumKw(ENERGY_FLOW.loads) - ev;
    expect(LIVE_FLOW.homeUsage).toBeCloseTo(houseWithoutEv);
    expect(LIVE_FLOW.evPower).toBeCloseTo(ev);
    expect(LIVE_FLOW.solarGeneration + LIVE_FLOW.gridPower + (LIVE_FLOW.batteryPower ?? 0)).toBeCloseTo(
      sumKw(ENERGY_FLOW.sources),
    );
  });
});
