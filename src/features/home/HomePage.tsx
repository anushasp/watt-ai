import { Link, useNavigate } from 'react-router';
import {
  Button,
  FeatureCard,
  Grid,
  Heading,
  Img,
  Section,
  SectionTitle,
  Split,
  SplitMedia,
  StatCard,
  TabLink,
  Text,
} from '@/ds';
import { Reveal, stagger } from '@/components/Reveal';
import { EnergyFlowDiagram } from '@/components/charts/EnergyFlowDiagram';
import { BarChart } from '@/components/charts/BarChart';
import { DemoBanner } from '@/components/DemoBanner';
import { ENERGY_FLOW, TWELVE_MONTH_COST } from '@/mocks/energy';
import { formatMoney } from '@/services/money';
import { useSession } from '@/state/SessionContext';
import { ROUTES } from '@/app/routes';
import styles from './HomePage.module.css';
import { useState } from 'react';

const PLAN_TABS = [
  {
    id: 'monthly',
    heading: 'Monthly cost',
    text: 'An estimated $143 a month on the recommended plan, against $187 on the plan you are on now.',
  },
  {
    id: 'annual',
    heading: 'Annual savings',
    text: 'About $528 over a year, measured against your current plan at the same estimated usage.',
  },
  {
    id: 'rate',
    heading: 'Rate',
    text: '15.8 cents per kWh peak and 11.2 cents overnight, fixed for a 12-month term.',
  },
] as const;

export function HomePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const { estimates, currentAnnual, currentPlanName } = useSession();
  const recommended = estimates[0];

  return (
    <>
      <Section scheme={1} size="md">
        <Split>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
            <Reveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
                <Heading level={1}>Smarter energy starts with your bill</Heading>
                <Text size="medium" muted>
                  Upload your electricity bill to understand usage, discover savings, and find better
                  energy options. wattsAI reads the fine print so you do not have to.
                </Text>
              </div>
            </Reveal>
            <Reveal delay={stagger(1)}>
              <div style={{ display: 'flex', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
                <Button onClick={() => void navigate(ROUTES.billAnalysis)}>Analyze My Bill</Button>
                <Button variant="secondary" onClick={() => scrollToHowItWorks()}>
                  See How It Works
                </Button>
              </div>
            </Reveal>
          </div>
          <SplitMedia>
            <Reveal delay={stagger(2)}>
              <Img
                src="/images/hero-bill.jpg"
                alt="A person at a kitchen table reading a paper electricity bill beside a laptop"
                ratio="4 / 3"
                loading="eager"
              />
            </Reveal>
          </SplitMedia>
        </Split>
      </Section>

      <Section scheme={4} size="md">
        <SectionTitle
          heading="Your energy bill hides real money. wattsAI finds it."
          size="h3"
          level={2}
          dark
          align="left"
        />
        <Grid min={240}>
          <Reveal delay={stagger(0)} className={styles.fill}>
            <StatCard
              value="$540"
              countTo={540}
              formatValue={(v) => formatMoney(v, { cents: false })}
              label="Potential annual savings"
              detail="Against a typical single-rate plan"
            />
          </Reveal>
          <Reveal delay={stagger(1)} className={styles.fill}>
            <StatCard
              value="23%"
              countTo={23}
              formatValue={(v) => `${Math.round(v)}%`}
              label="Peak-hour usage"
              detail="Share of energy billed at the highest rate"
            />
          </Reveal>
          <Reveal delay={stagger(2)} className={styles.fill}>
            <StatCard
              value="$41"
              countTo={41}
              formatValue={(v) => formatMoney(v, { cents: false })}
              label="Monthly EV charging cost"
              detail="At an overnight rate of 11.2 cents"
            />
          </Reveal>
        </Grid>
        <DemoBanner tone="dark">
          These headline figures are illustrative. Analyze a bill to see numbers built from your own
          usage.
        </DemoBanner>
      </Section>

      <Section scheme={2} id="how-it-works">
        <SectionTitle
          tagline="How It Works"
          heading="Three steps to lower bills"
          text="No spreadsheets. No confusing rate tables. Just clear answers."
          level={2}
        />
        <Grid min={300}>
          <Reveal delay={stagger(0)} className={styles.fill}>
            <FeatureCard
              icon="DataExploration"
              tagline="Understand"
              heading="Understand your bill"
              text="Upload your bill and wattsAI breaks down every charge, fee and rate tier in plain language."
              headingSize="h5"
              actions={
                <Link to={ROUTES.billAnalysis}>
                  <Button variant="link">Analyze a bill</Button>
                </Link>
              }
            />
          </Reveal>
          <Reveal delay={stagger(1)} className={styles.fill}>
            <FeatureCard
              icon="Compare"
              tagline="Compare"
              heading="Compare plans built for your actual usage"
              text="Plans are costed against your estimated consumption, not an average household."
              headingSize="h5"
              actions={
                <Link to={ROUTES.plans}>
                  <Button variant="link">See plans</Button>
                </Link>
              }
            />
          </Reveal>
          <Reveal delay={stagger(2)} className={styles.fill}>
            <FeatureCard
              icon="HomeMax"
              tagline="Optimize"
              heading="Optimize continuously as your home changes"
              text="Add an EV, panels or a battery and the recommendation moves with you."
              headingSize="h5"
              actions={
                <Link to={ROUTES.dashboard}>
                  <Button variant="link">Open the dashboard</Button>
                </Link>
              }
            />
          </Reveal>
        </Grid>
      </Section>

      <Section scheme={1}>
        <Split>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
            <SectionTitle
              tagline="AI Advisor"
              heading="Advice that pays for itself"
              align="left"
              size="h3"
              level={2}
            />
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', margin: 0, paddingLeft: '1.1rem' }}>
              <li>
                <Text as="span">
                  Charging your EV after 11 PM instead of 6 PM could save about $18 a week.
                </Text>
              </li>
              <li>
                <Text as="span">Personalized to your rate plan and charging habits.</Text>
              </li>
              <li>
                <Text as="span">Updated as prices and usage shift.</Text>
              </li>
            </ul>
            <div>
              <Link to={ROUTES.copilot}>
                <Button variant="secondary">Ask wattsAI</Button>
              </Link>
            </div>
          </div>
          <SplitMedia>
            <Img
              src="/images/advisor-group.jpg"
              alt="Three people looking together at a laptop screen in a bright living room"
              ratio="1 / 1"
            />
          </SplitMedia>
        </Split>
      </Section>

      <Section scheme={2}>
        <SectionTitle
          tagline="Energy flow"
          heading="See where your power actually goes"
          text="Solar produces 3.2 kW while your home draws 6.2 kW. The rest comes from the grid and the battery."
          level={2}
        />
        <EnergyFlowDiagram flow={ENERGY_FLOW} />
        <DemoBanner>
          Simulated readings for a sample home. wattsAI is not connected to a meter or to any device.
        </DemoBanner>
      </Section>

      <Section scheme={3}>
        <Split>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
            <SectionTitle
              tagline="Recommended Plan"
              heading="A better plan is waiting for you"
              align="left"
              size="h3"
              level={2}
            />
            <div role="tablist" aria-label="Recommended plan details" style={{ display: 'flex', flexDirection: 'column' }}>
              {PLAN_TABS.map((item, index) => (
                <TabLink
                  key={item.id}
                  heading={item.heading}
                  text={tab === index ? item.text : undefined}
                  active={tab === index}
                  onSelect={() => setTab(index)}
                />
              ))}
            </div>
            <div>
              <Link to={ROUTES.plans}>
                <Button>Find My Best Options</Button>
              </Link>
            </div>
          </div>
          <SplitMedia>
            <BarChart
              title="Twelve months of cost, current plan against recommended"
              description={`Monthly cost on ${currentPlanName} compared with ${recommended?.plan.name ?? 'the recommended plan'}, at the same estimated usage.`}
              labels={TWELVE_MONTH_COST.map((p) => p.label)}
              series={[
                { label: currentPlanName, values: TWELVE_MONTH_COST.map((p) => p.cost) },
                {
                  label: recommended?.plan.name ?? 'Recommended',
                  values: TWELVE_MONTH_COST.map(() => (recommended?.estimatedMonthly ?? 143)),
                },
              ]}
              format={(v) => formatMoney(v, { cents: false })}
            />
          </SplitMedia>
        </Split>
      </Section>

      <Section scheme={1}>
        <Split reverse>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
            <SectionTitle
              tagline="Copilot"
              heading="Ask wattsAI anything about your energy"
              align="left"
              size="h3"
              level={2}
            />
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', margin: 0, paddingLeft: '1.1rem' }}>
              <li>
                <Text as="span">Why is my bill higher this month</Text>
              </li>
              <li>
                <Text as="span">How can I save $30 fast</Text>
              </li>
              <li>
                <Text as="span">Would solar actually help me</Text>
              </li>
            </ul>
            <div>
              <Link to={ROUTES.copilot}>
                <Button variant="secondary">Open the Copilot</Button>
              </Link>
            </div>
          </div>
          <SplitMedia>
            <Img
              src="/images/copilot-laptop.jpg"
              alt="A laptop open on a desk showing an energy dashboard"
              ratio="1 / 1"
            />
          </SplitMedia>
        </Split>
      </Section>

      <Section scheme={4} id="about">
        <SectionTitle
          tagline="About"
          heading="Built to give you back control"
          text="wattsAI exists because energy bills should not require a decoder ring. It reads the fine print, analyzes your usage and finds real savings without selling your data."
          dark
          level={2}
        />
        <DemoBanner tone="dark">
          This is a demonstration. Bill parsing, assistant answers and meter readings are all
          simulated, and no file you choose ever leaves your browser.
        </DemoBanner>
      </Section>

      <Section scheme={1} size="md">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-24)',
            alignItems: 'center',
            textAlign: 'center',
            padding: 'var(--space-48)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <Heading level={2} scale="h3">
            See what your energy bill is really telling you
          </Heading>
          <Text size="medium" muted>
            Upload your bill and find the savings hiding in plain sight. Estimated savings are always
            measured against {currentPlanName}, currently {formatMoney(currentAnnual, { cents: false })} a year.
          </Text>
          <div style={{ display: 'flex', gap: 'var(--space-16)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button onClick={() => void navigate(ROUTES.billAnalysis)}>Analyze My Bill</Button>
            <Button variant="secondary" onClick={() => scrollToHowItWorks()}>
              See How It Works
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}

function scrollToHowItWorks() {
  const target = document.getElementById('how-it-works');
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Move focus so keyboard users land where sighted users are looking.
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}
