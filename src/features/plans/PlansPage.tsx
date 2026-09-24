import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Button,
  CheckListItem,
  Grid,
  Heading,
  Icon,
  Section,
  SectionTitle,
  Tabs,
  Text,
} from '@/ds';
import { Drawer } from '@/components/Drawer';
import { DemoBanner } from '@/components/DemoBanner';
import { BarChart } from '@/components/charts/BarChart';
import { ENGINE_ASSUMPTIONS } from '@/services/recommendation';
import { formatMoney, formatRate } from '@/services/money';
import { useSession } from '@/state/SessionContext';
import { copilotPath, ROUTES } from '@/app/routes';
import { TWELVE_MONTH_COST } from '@/mocks/energy';
import { PLAN_BADGE_LABELS } from '@/types';
import { useTransitionList } from '@/hooks/useTransitionList';
import { PlanCard } from './PlanCard';
import { applyFilters, parseFilters, SORT_LABELS, termLabel } from './planFilters';
import styles from './PlansPage.module.css';

const SORT_OPTIONS = (Object.keys(SORT_LABELS) as (keyof typeof SORT_LABELS)[]).map((value) => ({
  value,
  label: SORT_LABELS[value],
}));

const TERM_OPTIONS = [
  { value: 'any', label: 'Any length' },
  { value: '0', label: 'Month to month' },
  { value: '12', label: '12 months or less' },
  { value: '24', label: '24 months or less' },
];

export function PlansPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, estimates, currentPlanName, currentAnnual } = useSession();
  const [chosenPlanId, setChosenPlanId] = useState<string | null>(null);

  const filters = parseFilters(params);
  const results = useMemo(() => applyFilters(estimates, filters), [estimates, filters]);
  // Plans that no longer match stay mounted for one short fade rather than vanishing on
  // the same tick the checkbox was ticked.
  const cards = useTransitionList(results, (e) => e.plan.id, 200);
  const recommendedId = estimates[0]?.plan.id ?? null;

  const compareIds = (params.get('compare') ?? '').split(',').filter(Boolean);
  const openPlanId = params.get('plan');
  const openPlan = estimates.find((e) => e.plan.id === openPlanId) ?? null;
  const compared = estimates.filter((e) => compareIds.includes(e.plan.id));
  const chosen = estimates.find((e) => e.plan.id === chosenPlanId) ?? null;

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    setParams(next);
  };

  const toggleCompare = (id: string, checked: boolean) => {
    const set = new Set(compareIds);
    if (checked) set.add(id);
    else set.delete(id);
    update({ compare: set.size > 0 ? [...set].join(',') : null });
  };

  return (
    <>
      <Section scheme={1} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', maxWidth: 'var(--max-w-lg)' }}>
          <Heading level={1}>Find your plan</Heading>
          <Text size="medium" muted>
            Plans are costed against your bill and home profile. No guesswork. Just the numbers that
            matter.
          </Text>
          {state.bill === null ? (
            <div className={styles.notice} role="status">
              <Icon name="DataExploration" size={20} />
              <Text as="span" size="small">
                These figures use a sample baseline.{' '}
                <a href={ROUTES.billAnalysis}>Analyze a bill</a> to price plans against your own
                usage.
              </Text>
            </div>
          ) : null}
        </div>
      </Section>

      {/* Filters and results share one section on purpose: a filter and the list it
          changes belong together, and two sections put roughly 300px of padding between
          the checkbox and the first card it affects. */}
      <Section scheme={2} size="md">
        <SectionTitle
          tagline="Plans"
          heading="Refine plans"
          text="Narrow the list, then compare what is left. Filters are kept in the address bar, so a link shares exactly what you see."
          level={2}
          align="left"
        />

        {/* One flow container, so the section's 80px rhythm does not apply between the
            controls, the count and the cards. */}
        <div className={styles.browse}>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel} id="sort-label">
                Sort by
              </span>
              <Tabs
                label="Sort plans"
                options={SORT_OPTIONS}
                value={filters.sort}
                onChange={(v) => update({ sort: v })}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="term-select">
                Contract length
              </label>
              <select
                id="term-select"
                className={styles.select}
                value={filters.maxTermMonths === null ? 'any' : String(filters.maxTermMonths)}
                onChange={(e) => update({ term: e.target.value === 'any' ? null : e.target.value })}
              >
                {TERM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={filters.renewableOnly}
                onChange={(e) => update({ green: e.target.checked ? '1' : null })}
              />
              <span>100 percent renewable only</span>
            </label>
          </div>

          <div className={styles.resultsBar}>
            {/* The count is the live region: it is the one line that changes when a filter
                does, and it sits directly between the controls and the cards. */}
            <Text as="p" size="small" weight={600} role="status" className={styles.count}>
              Showing {results.length} of {estimates.length} plans
            </Text>
            <Text as="p" size="small" muted>
              Every price is an estimate built from your usage and home profile. Savings are
              measured against {currentPlanName} at {formatMoney(currentAnnual, { cents: false })} a
              year.
            </Text>
          </div>

          {cards.length > 0 ? (
            <Grid min={320}>
              {cards.map(({ key, item: estimate, phase }) => (
                <div
                  key={key}
                  className={styles.cardSlot}
                  data-phase={phase}
                  // A card on its way out is a picture of a plan that no longer matches.
                  // It must not be reachable by tab or read out while it fades.
                  aria-hidden={phase === 'exiting' ? true : undefined}
                  inert={phase === 'exiting'}
                >
                  <PlanCard
                    estimate={estimate}
                    recommended={estimate.plan.id === recommendedId && filters.sort === 'recommended'}
                    currentPlanName={currentPlanName}
                    compareChecked={compareIds.includes(estimate.plan.id)}
                    onCompareChange={(checked) => toggleCompare(estimate.plan.id, checked)}
                    onViewDetails={() => update({ plan: estimate.plan.id })}
                    onAsk={() => void navigate(copilotPath({ planId: estimate.plan.id }))}
                    onChoose={() => setChosenPlanId(estimate.plan.id)}
                  />
                </div>
              ))}
            </Grid>
          ) : (
            <div className={styles.empty}>
              <Icon name="Compare" size={48} />
              <Heading level={3} scale="h5">
                No plans match those filters
              </Heading>
              <Text size="medium">
                Widen the contract length or turn off the renewable filter to see more.
              </Text>
              <Button variant="secondary" onClick={() => setParams(new URLSearchParams())}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </Section>

      <Section scheme={1}>
        <SectionTitle
          tagline="Compare"
          heading="Current plan against your selection"
          text={
            compared.length > 0
              ? 'Every column is priced at the same estimated usage, so the difference is the plan and nothing else.'
              : 'Tick Compare this plan on any card above to build a side-by-side view.'
          }
          level={2}
        />
        {compared.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="sr-only">
                Current plan compared with {compared.length} selected plans
              </caption>
              <thead>
                <tr>
                  <th scope="col">Measure</th>
                  <th scope="col">{currentPlanName} (current)</th>
                  {compared.map((e) => (
                    <th key={e.plan.id} scope="col">
                      {e.plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Estimated monthly cost</th>
                  <td>{formatMoney(currentAnnual / 12, { cents: false })}</td>
                  {compared.map((e) => (
                    <td key={e.plan.id}>{formatMoney(e.estimatedMonthly, { cents: false })}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Est. savings vs your current plan, a year</th>
                  <td>—</td>
                  {compared.map((e) => (
                    <td key={e.plan.id}>
                      {formatMoney(e.annualSavingsVsCurrent, { cents: false })}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Rate</th>
                  <td>{formatRate(0.162)}</td>
                  {compared.map((e) => (
                    <td key={e.plan.id}>{formatRate(e.plan.ratePerKwh)}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Overnight rate</th>
                  <td>{formatRate(0.162)}</td>
                  {compared.map((e) => (
                    <td key={e.plan.id}>{formatRate(e.plan.offPeakRate)}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Contract</th>
                  <td>Month to month</td>
                  {compared.map((e) => (
                    <td key={e.plan.id}>{termLabel(e.plan.contractMonths)}</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Renewable</th>
                  <td>12%</td>
                  {compared.map((e) => (
                    <td key={e.plan.id}>{e.plan.renewablePct}%</td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Early exit fee</th>
                  <td>{formatMoney(0, { cents: false })}</td>
                  {compared.map((e) => (
                    <td key={e.plan.id}>{formatMoney(e.plan.earlyExitFee, { cents: false })}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </Section>

      <Section scheme={2}>
        <SectionTitle
          tagline="Assumptions"
          heading="How these numbers were produced"
          text="wattsAI does not measure your home. It applies these stated assumptions to the bill and profile you gave it."
          level={2}
        />
        <div className={styles.assumptions}>
          <ul className={styles.assumptionList}>
            {ENGINE_ASSUMPTIONS.map((a) => (
              <CheckListItem key={a.label}>
                <strong>{a.label}:</strong> {a.value}
              </CheckListItem>
            ))}
          </ul>
          <BarChart
            title="Twelve months on your current plan"
            description={`Billed cost each month on ${currentPlanName}, the baseline every savings figure is measured against.`}
            labels={TWELVE_MONTH_COST.map((p) => p.label)}
            series={[{ label: currentPlanName, values: TWELVE_MONTH_COST.map((p) => p.cost) }]}
            format={(v) => formatMoney(v, { cents: false })}
            highlightIndex={TWELVE_MONTH_COST.length - 1}
          />
        </div>
        <DemoBanner>
          Plans, retailers and rates on this page are invented for the demo. Nothing here is a real
          energy product and no enrollment is possible.
        </DemoBanner>
      </Section>

      <Drawer
        open={openPlan !== null}
        onClose={() => update({ plan: null })}
        title={openPlan?.plan.name ?? 'Plan details'}
      >
        {openPlan ? (
          <>
            <Text muted>{openPlan.plan.summary}</Text>
            <dl className={styles.drawerFacts}>
              <div>
                <dt>Retailer</dt>
                <dd>{openPlan.plan.retailer}</dd>
              </div>
              <div>
                <dt>Estimated monthly cost</dt>
                <dd>{formatMoney(openPlan.estimatedMonthly, { cents: false })}</dd>
              </div>
              <div>
                <dt>Est. savings vs your current plan</dt>
                <dd>{formatMoney(openPlan.annualSavingsVsCurrent, { cents: false })} a year</dd>
              </div>
              <div>
                <dt>Peak rate</dt>
                <dd>{formatRate(openPlan.plan.ratePerKwh)}</dd>
              </div>
              <div>
                <dt>Overnight rate</dt>
                <dd>{formatRate(openPlan.plan.offPeakRate)}</dd>
              </div>
              <div>
                <dt>Monthly fee</dt>
                <dd>{formatMoney(openPlan.plan.monthlyFee, { cents: false })}</dd>
              </div>
              <div>
                <dt>Contract</dt>
                <dd>{termLabel(openPlan.plan.contractMonths)}</dd>
              </div>
              <div>
                <dt>Early exit fee</dt>
                <dd>{formatMoney(openPlan.plan.earlyExitFee, { cents: false })}</dd>
              </div>
              <div>
                <dt>Renewable share</dt>
                <dd>{openPlan.plan.renewablePct}%</dd>
              </div>
              <div>
                <dt>Badges</dt>
                <dd>{openPlan.plan.badges.map((b) => PLAN_BADGE_LABELS[b]).join(', ')}</dd>
              </div>
            </dl>
            <Heading level={3} scale="h6">
              Why it was ranked here
            </Heading>
            <ul className={styles.assumptionList}>
              {openPlan.reasons.map((r) => (
                <CheckListItem key={r}>{r}</CheckListItem>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
              <Button
                onClick={() => {
                  update({ plan: null });
                  setChosenPlanId(openPlan.plan.id);
                }}
              >
                Choose This Plan
              </Button>
              <Button
                variant="secondary"
                onClick={() => void navigate(copilotPath({ planId: openPlan.plan.id }))}
              >
                Ask wattsAI
              </Button>
            </div>
          </>
        ) : null}
      </Drawer>

      <Drawer open={chosen !== null} onClose={() => setChosenPlanId(null)} title="Confirm your choice">
        {chosen ? (
          <>
            <div className={styles.confirmNotice} role="alert">
              <Icon name="Contract" size={24} />
              <Text as="span" size="small" weight={600}>
                No enrollment happens here. This is a demonstration, and wattsAI cannot switch your
                energy plan.
              </Text>
            </div>
            <Text>
              You selected <strong>{chosen.plan.name}</strong> from {chosen.plan.retailer}, estimated
              at {formatMoney(chosen.estimatedMonthly, { cents: false })} a month. Against{' '}
              {currentPlanName} that is{' '}
              {formatMoney(Math.abs(chosen.annualSavingsVsCurrent), { cents: false })} a year{' '}
              {chosen.annualSavingsVsCurrent >= 0 ? 'less' : 'more'}.
            </Text>
            <Text size="small" muted>
              In a live product this is where you would be handed to the retailer to complete a real
              switch, with a cooling-off period and a credit check.
            </Text>
            <div style={{ display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
              <Button variant="secondary" onClick={() => setChosenPlanId(null)}>
                Back to plans
              </Button>
              <Button
                variant="link"
                onClick={() => void navigate(copilotPath({ planId: chosen.plan.id }))}
              >
                Ask wattsAI about this plan
              </Button>
            </div>
          </>
        ) : null}
      </Drawer>
    </>
  );
}
