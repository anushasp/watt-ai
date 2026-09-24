import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Button, Grid, Heading, Icon, Section, SectionTitle, StatCard, Tabs, Text } from '@/ds';
import { DemoBanner } from '@/components/DemoBanner';
import { Reveal, stagger } from '@/components/Reveal';
import { Sparkline } from '@/components/charts/Sparkline';
import { EnergyFlowDiagram } from '@/components/charts/EnergyFlowDiagram';
import { EnergyFlow } from '@/components/charts/EnergyFlow';
import { ENERGY_FLOW, LIVE_FLOW } from '@/mocks/energy';
import { INSIGHTS } from '@/mocks/insights';
import { flowBalance } from '@/services/energy';
import { changeVsLastMonth, describeComparison, formatKwh, formatMoney, formatRate } from '@/services/money';
import { useSession } from '@/state/SessionContext';
import { ROUTES } from '@/app/routes';
import { termLabel } from '@/features/plans/planFilters';
import { InsightCard } from './InsightCard';
import { DASHBOARD_TABS, DashboardPanel, panelId, type DashboardTab } from './DashboardTabs';
import styles from './DashboardPage.module.css';

const TAB_VALUES = DASHBOARD_TABS.map((t) => t.value) as readonly string[];

export function DashboardPage() {
  const [params, setParams] = useSearchParams();
  const { state, dispatch, estimates, currentPlanName, currentAnnual } = useSession();
  const [undoId, setUndoId] = useState<string | null>(null);

  const raw = params.get('tab');
  const tab = (TAB_VALUES.includes(raw ?? '') ? raw : 'overview') as DashboardTab;

  const bill = state.bill;
  const recommended = estimates[0];
  const monthly = currentAnnual / 12;
  const flow = flowBalance(ENERGY_FLOW);

  const monthComparison =
    bill?.total != null && bill.previousTotal != null
      ? changeVsLastMonth(bill.total, bill.previousTotal)
      : null;

  const visibleInsights = INSIGHTS.filter((i) => !state.dismissedInsights.includes(i.id));

  return (
    <>
      <Section scheme={1} size="md">
        <div className={styles.hero}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', maxWidth: 'var(--max-w-lg)' }}>
            <Heading level={1}>Your energy dashboard</Heading>
            <Text size="medium" muted>
              A snapshot of your home energy performance. What you use, what it costs, and where the
              savings are.
            </Text>
          </div>
          <DemoBanner>
            Every reading on this page is simulated for a sample home. wattsAI is not connected to a
            meter, an inverter or any device.
          </DemoBanner>
        </div>
      </Section>

      <Section scheme={2} size="md">
        <SectionTitle
          tagline="Overview"
          heading="The numbers that matter most"
          text="Costs in dollars, energy in kilowatt hours, and a projection for the period you are in."
          level={2}
          align="left"
        />
        <Grid min={240}>
          <StatCard
            tone="light"
            value="$4.12"
            countTo={4.12}
            formatValue={(v) => formatMoney(v)}
            label="Cost today"
            detail="Partial day, so far"
          >
            <Sparkline values={[8.1, 8.7, 9.4, 8.5, 7.9, 9.0, 4.1]} label="Daily cost over the last seven days" />
          </StatCard>
          <StatCard
            tone="light"
            value={formatMoney(bill?.total ?? monthly, { cents: false })}
            countTo={bill?.total ?? monthly}
            formatValue={(v) => formatMoney(v, { cents: false })}
            label="Projected bill"
            detail={monthComparison ? describeComparison(monthComparison) : 'For the current period'}
          >
            <Sparkline values={[232, 218, 242, 281, 289, 268, 273]} label="Bill totals over recent periods" />
          </StatCard>
          <StatCard
            tone="light"
            value="28.4"
            countTo={ENERGY_FLOW.todayKwh}
            formatValue={(v) => v.toFixed(1)}
            label="Energy used today, kWh"
            detail="Measured over the day so far"
          >
            <Sparkline values={[44, 48, 51, 46, 43, 49, 28]} label="Daily energy over the last seven days" />
          </StatCard>
          <StatCard
            tone="light"
            value={formatMoney(Math.max(0, recommended?.annualSavingsVsCurrent ?? 0) / 12, { cents: false })}
            countTo={Math.max(0, recommended?.annualSavingsVsCurrent ?? 0) / 12}
            formatValue={(v) => formatMoney(v, { cents: false })}
            label="Projected monthly saving"
            detail={`If you moved to ${recommended?.plan.name ?? 'the recommended plan'}`}
          >
            <Sparkline values={[12, 22, 27, 37, 41, 35]} label="Savings found each month" />
          </StatCard>
        </Grid>
        <Text size="small" muted>
          Projected saving is measured against {currentPlanName}. That is a different figure from the
          bill comparison above, which measures this period against the last one on the same plan.
        </Text>
      </Section>

      <Section scheme={3}>
        <SectionTitle
          tagline="Energy flow"
          heading="Where your power is going right now"
          text={`Simulated instantaneous power. ${flow.inKw} kW flows in and the same ${flow.outKw} kW flows out, because power into a home has to go somewhere.`}
          level={2}
        />
        <EnergyFlow
          {...LIVE_FLOW}
          title="Your home right now"
          description="Solar and the grid are feeding the house while the battery covers the rest and the car charges. The house itself draws 4.3 kW and the car another 1.9 kW. Arrows show direction; thicker and faster means more power."
        />
        <EnergyFlowDiagram flow={ENERGY_FLOW} />
        <Text size="small" muted>
          The second diagram breaks the same moment down by every source and every load. Figures in
          both are kilowatts, a rate of flow at this moment. Energy over a period is measured in
          kilowatt hours, and today that is {formatKwh(ENERGY_FLOW.todayKwh)}.
        </Text>
      </Section>

      <Section scheme={1}>
        <SectionTitle
          tagline="Explore"
          heading="Every angle of your home energy"
          text="Four views over the same period. Arrow keys move between them."
          level={2}
        />
        <Tabs
          label="Dashboard views"
          options={DASHBOARD_TABS.map((t) => ({ value: t.value, label: t.label, icon: t.icon }))}
          value={tab}
          onChange={(value) => {
            const next = new URLSearchParams(params);
            next.set('tab', value);
            setParams(next);
          }}
          panelId={panelId}
        />
        <DashboardPanel tab={tab} />
      </Section>

      <Section scheme={2}>
        <SectionTitle
          tagline="AI insight"
          heading="Your home has something to tell you"
          text="Simulated findings from this period's usage. Each one can be explained, acted on or dismissed."
          level={2}
        />
        {visibleInsights.length > 0 ? (
          <Grid min={300}>
            {visibleInsights.map((insight, i) => (
              <Reveal key={insight.id} delay={stagger(i)} className={styles.fill}>
                <InsightCard
                  insight={insight}
                  onDismiss={() => {
                    dispatch({ type: 'DISMISS_INSIGHT', id: insight.id });
                    setUndoId(insight.id);
                  }}
                />
              </Reveal>
            ))}
          </Grid>
        ) : (
          <div className={styles.empty}>
            <Icon name="Check" size={48} />
            <Text size="medium">You have dismissed every insight.</Text>
            <Button
              variant="secondary"
              onClick={() => {
                for (const id of state.dismissedInsights) dispatch({ type: 'RESTORE_INSIGHT', id });
                setUndoId(null);
              }}
            >
              Bring them all back
            </Button>
          </div>
        )}
        <div role="status" aria-live="polite">
          {undoId ? (
            <div className={styles.undo}>
              <Text as="span" size="small">
                Insight dismissed.
              </Text>
              <Button
                variant="link"
                size="small"
                trailingIcon={null}
                onClick={() => {
                  dispatch({ type: 'RESTORE_INSIGHT', id: undoId });
                  setUndoId(null);
                }}
              >
                Undo
              </Button>
            </div>
          ) : null}
        </div>
      </Section>

      <Section scheme={4}>
        <SectionTitle
          tagline="Plan"
          heading="The plan you are on now"
          text="Everything on this page is priced against this plan, so switching changes every figure."
          dark
          level={2}
          align="left"
        />
        <div className={styles.planRows}>
          <div className={styles.planRow}>
            <Icon name="SmartOutlet" size={24} />
            <Text as="span" dark>
              {currentPlanName} at {formatRate(0.162)}
            </Text>
          </div>
          <div className={styles.planRow}>
            <Icon name="Contract" size={24} />
            <Text as="span" dark>
              {bill?.contractExpiry ? `Contract expires ${bill.contractExpiry}` : 'Month to month, no fixed term'}
            </Text>
          </div>
          <div className={styles.planRow}>
            <Icon name="Minimize" size={24} />
            <Text as="span" dark>
              Currently {formatMoney(currentAnnual, { cents: false })} a year, or{' '}
              {formatMoney(monthly, { cents: false })} a month
            </Text>
          </div>
          {recommended ? (
            <div className={styles.planRow}>
              <Icon name="Compare" size={24} />
              <Text as="span" dark>
                {recommended.plan.name} would be{' '}
                {formatMoney(Math.abs(recommended.annualSavingsVsCurrent), { cents: false })} a year{' '}
                {recommended.annualSavingsVsCurrent >= 0 ? 'less' : 'more'} on a{' '}
                {termLabel(recommended.plan.contractMonths).toLowerCase()} term
              </Text>
            </div>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
          <Link to={ROUTES.plans}>
            <Button alternate variant="secondary">
              See your plan options
            </Button>
          </Link>
          <Link to={ROUTES.copilot}>
            <Button alternate variant="link">
              Ask wattsAI about this
            </Button>
          </Link>
        </div>
      </Section>
    </>
  );
}
