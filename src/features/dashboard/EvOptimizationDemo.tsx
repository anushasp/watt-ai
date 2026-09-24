import { useState } from 'react';
import { AnimatedNumber, Heading, Text } from '@/ds';
import { EnergyFlow } from '@/components/charts/EnergyFlow';
import { formatMoney } from '@/services/money';
import type { EnergyFlowInput } from '@/services/energyFlow';
import {
  OFF_PEAK_HOUR,
  PLUG_IN_HOUR,
  SESSION_HOURS,
  SESSION_KWH,
  evSavings,
  evSession,
} from './evSchedule';
import styles from './EvOptimizationDemo.module.css';

/** The window the timeline covers: 4 PM to 8 AM, on one unwrapped number line. */
const FROM = 16;
const TO = 32;
const SPAN = TO - FROM;

/** Where an hour sits across the timeline, as a percentage. */
const at = (hour: number) => ((hour - FROM) / SPAN) * 100;

const BANDS = [
  { rate: 'peak', from: 16, to: 21 },
  { rate: 'mid', from: 21, to: 23 },
  { rate: 'off', from: 23, to: 32 },
] as const;

/* Labelled hours, positioned at where they actually fall rather than spread evenly — the
   two are not the same, and an evenly spread label would put 7 PM in the wrong place. */
const TICKS = [
  { hour: 16, label: '4 PM' },
  { hour: 19, label: '7 PM' },
  { hour: 22, label: '10 PM' },
  { hour: 25, label: '1 AM' },
  { hour: 28, label: '4 AM' },
  { hour: 32, label: '8 AM' },
] as const;

/**
 * The home at 6 PM in each mode.
 *
 * Only the car differs. The house load and the battery are identical in both, so the
 * diagram cannot be read as crediting optimization with something it did not do. Both
 * balance, which `deriveEnergyFlow` will confirm.
 */
const AT_SIX_PM = (optimized: boolean): EnergyFlowInput => ({
  solarGeneration: 0,
  homeUsage: 2.1,
  gridPower: optimized ? 1.5 : 6.65,
  batteryLevel: 62,
  batteryState: 'discharging',
  batteryPower: 0.6,
  evConnected: true,
  evCharging: !optimized,
  evPower: SESSION_KWH / SESSION_HOURS,
  optimizationEnabled: optimized,
});

/**
 * What wattsAI does with a car plugged in at 6 PM, shown by letting the reader switch it
 * off and on.
 *
 * The session block carries the same energy in both modes and only moves in time. Every
 * figure comes from `evSchedule`, so the saving on screen is the arithmetic of the tariff
 * windows rather than a number written to suit the animation.
 */
export function EvOptimizationDemo() {
  const [optimized, setOptimized] = useState(true);
  const session = evSession(optimized);
  const saving = evSavings();

  const width = (SESSION_HOURS / SPAN) * 100;
  // A percentage translate resolves against the element's own width, so the block's
  // position is expressed relative to itself. Exact, and a transform rather than `left`.
  const offset = (at(session.startHour) / width) * 100;

  return (
    <div className={styles.demo}>
      <div className={styles.head}>
        <div>
          <Heading level={4} scale="h5">
            Smart charging
          </Heading>
          <Text size="small" muted>
            Your car plugs in at {PLUG_IN_HOUR - 12} PM, in the middle of the peak window.
            wattsAI holds the charge until off-peak pricing starts at {OFF_PEAK_HOUR - 12} PM.
          </Text>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={optimized}
          className={styles.toggle}
          onClick={() => setOptimized((on) => !on)}
        >
          <span className={styles.track} aria-hidden="true">
            <span className={styles.knob} />
          </span>
          AI optimization
        </button>
      </div>

      <div>
        <div className={styles.timeline}>
          {BANDS.map((band) => (
            <span
              key={`${band.rate}-${band.from}`}
              className={styles.band}
              data-rate={band.rate}
              style={{ left: `${at(band.from)}%`, width: `${at(band.to) - at(band.from)}%` }}
            />
          ))}
          <span
            className={styles.session}
            data-optimized={optimized ? 'true' : undefined}
            style={{
              ['--session-width' as string]: `${width}%`,
              ['--offset' as string]: `${offset}%`,
            }}
          >
            {SESSION_KWH} kWh
          </span>
        </div>
        <div className={styles.ticks} aria-hidden="true">
          {TICKS.map((tick, i) => (
            <span
              key={tick.label}
              className={styles.tick}
              style={{
                left: `${at(tick.hour)}%`,
                // The end labels hug the ends instead of overhanging them.
                transform:
                  i === 0
                    ? 'none'
                    : i === TICKS.length - 1
                      ? 'translateX(-100%)'
                      : 'translateX(-50%)',
              }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      {/* The numbers, in text, for anyone who cannot see the block move. */}
      <div className={styles.costs} role="status">
        <div className={styles.cost}>
          <span className={styles.costValue} data-saving={optimized ? 'true' : undefined}>
            <AnimatedNumber to={session.cost} format={(v) => formatMoney(v)} countOnReveal={false} />
          </span>
          <span className={styles.costLabel}>
            This session, starting {optimized ? `${OFF_PEAK_HOUR - 12} PM` : `${PLUG_IN_HOUR - 12} PM`}
          </span>
        </div>
        <div className={styles.cost}>
          <span className={styles.costValue}>{formatMoney(saving)}</span>
          <span className={styles.costLabel}>Saved per session by waiting</span>
        </div>
        <div className={styles.cost}>
          <span className={styles.costValue}>{SESSION_KWH} kWh</span>
          <span className={styles.costLabel}>Delivered either way, in {SESSION_HOURS} hours</span>
        </div>
      </div>

      <EnergyFlow
        {...AT_SIX_PM(optimized)}
        title={`Your home at ${PLUG_IN_HOUR - 12} PM, optimization ${optimized ? 'on' : 'off'}`}
        description={
          optimized
            ? 'The car is plugged in and waiting, so the house draws only what it needs and the battery covers part of the peak.'
            : 'The car starts charging immediately, so the grid has to cover both the house and the car at the peak rate.'
        }
      />
    </div>
  );
}
