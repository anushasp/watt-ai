import { Heading, Text } from '@/ds';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart, HorizontalBarChart } from '@/components/charts/BarChart';
import {
  CUMULATIVE_SAVINGS,
  DAILY_USAGE,
  END_USES,
  MONTH_FORECAST,
  MONTH_TO_DATE,
  TARIFF_SPLIT,
} from '@/mocks/energy';
import { formatKwh, formatMoney } from '@/services/money';
import { CHART_ACCENT, CHART_INK } from '@/components/charts/scales';
import styles from './DashboardTabs.module.css';

export type DashboardTab = 'overview' | 'usage' | 'savings' | 'devices';

export const DASHBOARD_TABS = [
  { value: 'overview', label: 'Overview', icon: 'Overview' },
  { value: 'usage', label: 'Usage', icon: 'Pattern' },
  { value: 'savings', label: 'Savings', icon: 'Savings' },
  { value: 'devices', label: 'Devices', icon: 'Devices2' },
] as const;

export function panelId(tab: string): string {
  return `dashboard-panel-${tab}`;
}

export function DashboardPanel({ tab }: { tab: DashboardTab }) {
  return (
    <div
      id={panelId(tab)}
      role="tabpanel"
      aria-labelledby={`${panelId(tab)}-tab`}
      tabIndex={0}
      className={styles.panel}
    >
      {tab === 'overview' ? <OverviewPanel /> : null}
      {tab === 'usage' ? <UsagePanel /> : null}
      {tab === 'savings' ? <SavingsPanel /> : null}
      {tab === 'devices' ? <DevicesPanel /> : null}
    </div>
  );
}

function PanelHead({ title, text }: { title: string; text: string }) {
  return (
    <div className={styles.head}>
      <Heading level={3} scale="h5">
        {title}
      </Heading>
      <Text muted>{text}</Text>
    </div>
  );
}

function OverviewPanel() {
  // Actual month-to-date, then a dashed forecast that continues from the last real point.
  const actual = [...MONTH_TO_DATE, ...MONTH_FORECAST.slice(1).map(() => Number.NaN)];
  const forecast = [
    ...MONTH_TO_DATE.slice(0, -1).map(() => Number.NaN),
    ...MONTH_FORECAST,
  ];
  const labels = actual.map((_, i) => `Day ${i + 1}`);

  return (
    <>
      <PanelHead
        title="The full picture"
        text="Cost and usage across the current billing period, with the rest of the month projected."
      />
      <div className={styles.grid}>
        <LineChart
          title="Daily usage this period"
          description="Energy used each day in kilowatt hours. The dip on the last day is a partial day."
          labels={DAILY_USAGE.map((p) => p.label)}
          series={[{ label: 'Usage', values: DAILY_USAGE.map((p) => p.kwh), area: true }]}
          format={(v) => `${Math.round(v)}`}
        />
        <BarChart
          title="Cost by tariff window, last seven days"
          description="Daily cost split into off-peak, mid-peak and peak windows."
          labels={TARIFF_SPLIT.map((p) => p.label)}
          mode="stacked"
          series={[
            { label: 'Off-peak', values: TARIFF_SPLIT.map((p) => p.offPeak), color: CHART_INK.quaternary },
            { label: 'Mid-peak', values: TARIFF_SPLIT.map((p) => p.mid), color: CHART_INK.tertiary },
            { label: 'Peak', values: TARIFF_SPLIT.map((p) => p.peak), color: CHART_INK.primary },
          ]}
          format={(v) => formatMoney(v, { cents: false })}
        />
      </div>
      <LineChart
        title="Bill to date, with the rest of the period projected"
        description="Solid is billed so far. Dashed is the projection to the end of the period, which lands at $273."
        labels={labels}
        series={[
          { label: 'Billed so far', values: actual },
          { label: 'Projected', values: forecast, dashed: true, color: CHART_ACCENT },
        ]}
        format={(v) => formatMoney(v, { cents: false })}
      />
    </>
  );
}

function UsagePanel() {
  return (
    <>
      <PanelHead
        title="When and where you use power"
        text="The same energy, broken down by day and by what is consuming it."
      />
      <div className={styles.grid}>
        <BarChart
          title="Usage by day"
          description="Kilowatt hours per day. The highest day was 58.1 kWh."
          labels={DAILY_USAGE.map((p) => p.label)}
          series={[{ label: 'Usage', values: DAILY_USAGE.map((p) => p.kwh) }]}
          format={(v) => `${Math.round(v)}`}
          highlightIndex={18}
        />
        <HorizontalBarChart
          title="Usage by end use"
          description="Where this period's energy went, in kilowatt hours."
          items={END_USES.map((e) => ({ label: e.label, value: e.kwh }))}
          format={formatKwh}
          highlight="Heating and cooling"
        />
      </div>
    </>
  );
}

function SavingsPanel() {
  return (
    <>
      <PanelHead
        title="Every dollar wattsAI has found"
        text="Cumulative savings since this account was created, against the plan you were on."
      />
      <div className={styles.grid}>
        <LineChart
          title="Cumulative savings"
          description="Running total of savings found, reaching $174 in March."
          labels={CUMULATIVE_SAVINGS.map((p) => p.label)}
          series={[
            { label: 'Saved', values: CUMULATIVE_SAVINGS.map((p) => p.cost), area: true, color: CHART_ACCENT },
          ]}
          format={(v) => formatMoney(v, { cents: false })}
        />
        <HorizontalBarChart
          title="Where the savings came from"
          description="Contribution of each change to the running total."
          items={[
            { label: 'Shifted evening load', value: 68 },
            { label: 'Thermostat schedule', value: 44 },
            { label: 'Laundry after 9 PM', value: 37 },
            { label: 'Standby load trimmed', value: 25 },
          ]}
          format={(v) => formatMoney(v, { cents: false })}
          highlight="Shifted evening load"
        />
      </div>
    </>
  );
}

function DevicesPanel() {
  return (
    <>
      <PanelHead
        title="EV, solar, battery and appliances"
        text="How the big loads in your home behave across a day."
      />
      <div className={styles.grid}>
        <BarChart
          title="EV charging by start hour"
          description="Charging sessions cluster between 6 and 9 PM, inside the peak window."
          labels={['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p']}
          series={[{ label: 'Sessions', values: [2, 1, 0, 0, 1, 2, 9, 6] }]}
          format={(v) => `${Math.round(v)}`}
          highlightIndex={6}
        />
        <HorizontalBarChart
          title="Share of this period's energy"
          description="Each end use as a share of total consumption."
          items={END_USES.map((e) => ({ label: e.label, value: e.kwh }))}
          format={(v) => `${Math.round((v / END_USES.reduce((s, e) => s + e.kwh, 0)) * 100)}%`}
          highlight="EV charging"
        />
      </div>
    </>
  );
}
