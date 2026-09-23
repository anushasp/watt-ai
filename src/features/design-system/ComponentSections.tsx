import { useMemo, useState } from 'react';
import {
  Button,
  CarouselArrow,
  CarouselDots,
  CheckListItem,
  FeatureCard,
  Heading,
  Icon,
  Input,
  PricingCard,
  SectionTitle,
  StatCard,
  TabLink,
  Tabs,
  Tag,
  Text,
} from '@/ds';
import { DocSection } from '@/features/docs/DocsLayout';
import { Drawer } from '@/components/Drawer';
import { DemoBanner } from '@/components/DemoBanner';
import { Stepper } from '@/components/Stepper';
import { Dropzone, SelectedFile } from '@/components/Dropzone';
import { Sparkline } from '@/components/charts/Sparkline';
import { InsightCard } from '@/features/dashboard/InsightCard';
import { PlanCard } from '@/features/plans/PlanCard';
import { INSIGHTS } from '@/mocks/insights';
import { PLANS } from '@/mocks/plans';
import { SAMPLE_BILL } from '@/mocks/bills';
import { rankPlans } from '@/services/recommendation';
import type { HomeProfile } from '@/types';
import { ComponentPreview, Stage, StateExample, StateGrid } from './components/TokenDisplay';

const DEMO_PROFILE: HomeProfile = {
  hasEv: true,
  hasSolar: false,
  hasBattery: false,
  homeType: 'single-family',
  homeSize: '1000-2000',
  priority: 'lowest-bill',
};

export function ButtonsSection() {
  return (
    <DocSection id="buttons" title="Buttons">
      <ComponentPreview
        name="Button"
        source="@/ds · Button"
        description="The only action control in the system. Three variants, two sizes, and an alternate treatment for dark bands."
        usage="One primary action per decision area. Pair it with a secondary; use the link variant for tertiary actions. Never place two primaries side by side."
        accessibility="Renders a real <button> with type=button. Hover, active and focus are CSS states, so a keyboard focus ring always appears. Disabled uses the disabled attribute rather than pointer-events."
      >
        <StateGrid>
          <StateExample label="Primary">
            <Stage>
              <Button>Analyze My Bill</Button>
            </Stage>
          </StateExample>
          <StateExample label="Secondary">
            <Stage>
              <Button variant="secondary">See How It Works</Button>
            </Stage>
          </StateExample>
          <StateExample label="Link">
            <Stage>
              <Button variant="link">See plans</Button>
            </Stage>
          </StateExample>
        </StateGrid>

        <Heading level={4} scale="h6">
          Sizes
        </Heading>
        <Stage>
          <Button size="default">Default, 44px</Button>
          <Button size="small">Small, 40px</Button>
        </Stage>

        <Heading level={4} scale="h6">
          Icons and width
        </Heading>
        <Stage>
          <Button leadingIcon="Save2">Leading icon</Button>
          <Button trailingIcon="ArrowForward">Trailing icon</Button>
          <Button variant="link" trailingIcon={null}>
            Chevron suppressed
          </Button>
        </Stage>
        <Stage layout="stack">
          <Button fullWidth>Full width</Button>
        </Stage>

        <Heading level={4} scale="h6">
          States
        </Heading>
        <Stage>
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
        </Stage>
        <Text size="small" muted>
          Hover and focus are CSS-only, so they are not screenshotable here — tab to the buttons
          above to see the focus ring. There is no loading variant: surfaces that wait swap the
          label instead, as the upload control does with &ldquo;Analyzing&rdquo;.
        </Text>

        <Heading level={4} scale="h6">
          On a dark band
        </Heading>
        <Stage tone="dark">
          <Button>Primary</Button>
          <Button variant="secondary" alternate>
            Secondary alternate
          </Button>
          <Button variant="link" alternate>
            Link alternate
          </Button>
        </Stage>
      </ComponentPreview>
    </DocSection>
  );
}

export function FormControlsSection() {
  const [value, setValue] = useState('1428');
  return (
    <DocSection id="form-controls" title="Form Controls">
      <Text>
        The system ships two form components: a text <code>Input</code> and a file{' '}
        <code>Dropzone</code>. Radio groups, checkboxes and selects are currently composed from
        native elements inside feature pages rather than wrapped as components — see the findings at
        the end of this page.
      </Text>

      <ComponentPreview
        name="Input"
        source="@/ds · Input"
        description="A labelled text field with optional hint and error. The label is required by the type signature."
        usage="Always supply a label. Use hideLabel only when an adjacent heading already names the field. Pair with a button for single-field forms."
        accessibility="Label is bound with htmlFor. Hint and error are wired through aria-describedby, and an error sets aria-invalid. The focus ring is a CSS state on the field."
      >
        <StateGrid>
          <StateExample label="Default">
            <Input label="Usage in kWh" placeholder="1428" />
          </StateExample>
          <StateExample label="Populated">
            <Input label="Usage in kWh" value={value} onChange={(e) => setValue(e.target.value)} />
          </StateExample>
          <StateExample label="With hint">
            <Input label="Contract expiration" hint="Leave empty if your bill does not show one." />
          </StateExample>
          <StateExample label="Error">
            <Input label="Bill total" defaultValue="-12" error="Enter an amount greater than zero." />
          </StateExample>
          <StateExample label="Disabled">
            <Input label="Provider" defaultValue="Harbour Electric" disabled />
          </StateExample>
          <StateExample label="Hidden label">
            <Input label="Search plans" hideLabel placeholder="Search plans" />
          </StateExample>
        </StateGrid>
        <Heading level={4} scale="h6">
          On a dark band
        </Heading>
        <Stage tone="dark" layout="stack">
          <Input label="Email address" alternate placeholder="you@example.com" />
        </Stage>
        <Text size="small" muted>
          There is no success state in the component API. Validation currently communicates failure
          only.
        </Text>
      </ComponentPreview>

      <ComponentPreview
        name="Dropzone"
        source="@/components · Dropzone, SelectedFile"
        description="File selection for the bill upload. Accepts PDF, JPG and PNG, with drag-and-drop layered on top."
        usage="Use for document upload. Always state what happens to the file; this one says nothing is uploaded to a server, because nothing is."
        accessibility="The drop area is a real button, so Tab reaches it and Enter or Space opens the picker. It does not rely on a label wrapping a hidden input, which is unreachable in several screen-reader and browser combinations."
      >
        <StateGrid>
          <StateExample label="Empty">
            <Dropzone onFile={() => {}} onReject={() => {}} />
          </StateExample>
          <StateExample label="Rejected">
            <Dropzone onFile={() => {}} onReject={() => {}} error="notes.txt is not a supported file." />
          </StateExample>
        </StateGrid>
        <Heading level={4} scale="h6">
          Selected file
        </Heading>
        <StateGrid>
          <StateExample label="Ready">
            <SelectedFile
              name="march-bill.pdf"
              size={184320}
              busy={false}
              analyzing={false}
              analyzed={false}
              onAnalyze={() => {}}
              onReplace={() => {}}
              onRemove={() => {}}
            />
          </StateExample>
          <StateExample label="Analyzing">
            <SelectedFile
              name="march-bill.pdf"
              size={184320}
              busy
              analyzing
              analyzed={false}
              onAnalyze={() => {}}
              onReplace={() => {}}
              onRemove={() => {}}
            />
          </StateExample>
        </StateGrid>
      </ComponentPreview>
    </DocSection>
  );
}

export function CardsSection() {
  const estimate = useMemo(() => rankPlans(PLANS, SAMPLE_BILL, DEMO_PROFILE)[0], []);
  const [compare, setCompare] = useState(false);

  return (
    <DocSection id="cards" title="Cards">
      <ComponentPreview
        name="FeatureCard"
        source="@/ds · FeatureCard"
        description="The workhorse card: steps, prompts, methods and explanations. Supports an icon or a full-bleed image."
        usage="Grid them three-up or two-up with a 32px gap. Use muted on white bands and the default white fill on grey bands, so figure and ground never collapse."
        accessibility="headingLevel is separate from headingSize, so a card can look small while sitting correctly in the document outline."
      >
        <Stage layout="stack">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-16)' }}>
            <FeatureCard
              icon="Compare"
              tagline="Compare"
              heading="Compare plans built for your usage"
              text="Plans are costed against your estimated consumption."
              headingSize="h6"
              headingLevel={4}
              actions={<Button variant="link">See plans</Button>}
            />
            <FeatureCard
              muted
              icon="DataExploration"
              heading="Data extraction"
              text="Every charge, fee and rate tier in plain language."
              headingSize="h6"
              headingLevel={4}
            />
          </div>
        </Stage>
      </ComponentPreview>

      <ComponentPreview
        name="StatCard"
        source="@/ds · StatCard"
        description="One headline number in the numeric family, with a caption and an optional comparison line."
        usage="Rows of three on a dark band, or a 2×2 grid on a light one. The detail line should always name the baseline a figure is measured against."
        accessibility="The value is text, not an image. A sparkline passed as a child carries its own accessible label."
      >
        <Stage layout="stack">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-16)' }}>
            <StatCard
              tone="light"
              value="$4.12"
              label="Cost today"
              detail="Partial day, so far"
            >
              <Sparkline values={[8.1, 8.7, 9.4, 8.5, 7.9, 9.0, 4.1]} label="Daily cost over the last seven days" />
            </StatCard>
            <StatCard tone="light" value="28.4" label="Energy used today, kWh" />
          </div>
        </Stage>
        <Heading level={4} scale="h6">
          Dark tone
        </Heading>
        <Stage tone="dark">
          <StatCard value="$540" label="Potential annual savings" detail="Against a typical single-rate plan" />
        </Stage>
      </ComponentPreview>

      <ComponentPreview
        name="PricingCard"
        source="@/ds · PricingCard"
        description="A single plan expressed as a price, a feature list and one full-width action."
        usage="Use for one recommended plan rather than a three-column pricing table. Pair with Tabs above it to switch between plan views."
        accessibility="The feature list is a real list of CheckListItem rows, each with an included or excluded glyph carrying a title."
      >
        <Stage layout="stack">
          <div style={{ maxWidth: 380 }}>
            <PricingCard
              title="Lowest bill"
              subtitle="Cheapest total cost each month"
              price="$143"
              priceSuffix="estimated a month"
              cta="Choose This Plan"
              headingLevel={4}
              highlighted
              features={[
                'No minimum usage penalty',
                'Lower overnight EV rate',
                '12-month fixed term',
              ]}
            />
          </div>
        </Stage>
      </ComponentPreview>

      {estimate ? (
        <ComponentPreview
          name="PlanCard"
          source="@/features/plans · PlanCard"
          description="The full plan result card. Composed from Tag, CheckListItem and Button, and driven by a PlanEstimate from the recommendation engine."
          usage="Used on the plans results grid. The savings line always names the baseline plan, and the recommended badge appears only under the recommended sort."
          accessibility="A real <article>. Compare is a labelled checkbox, and every action is a button rather than a clickable div."
        >
          <Stage layout="stack">
            <div style={{ maxWidth: 400 }}>
              <PlanCard
                estimate={estimate}
                recommended
                currentPlanName="Basic Residential"
                compareChecked={compare}
                onCompareChange={setCompare}
                onViewDetails={() => {}}
                onAsk={() => {}}
                onChoose={() => {}}
              />
            </div>
          </Stage>
        </ComponentPreview>
      ) : null}
    </DocSection>
  );
}

export function NavigationSection() {
  const [tab, setTab] = useState('overview');
  const [row, setRow] = useState(0);
  const [slide, setSlide] = useState(0);

  const ROWS = [
    { heading: 'Monthly cost', text: 'An estimated $143 a month on the recommended plan.' },
    { heading: 'Annual savings', text: 'About $528 over a year against your current plan.' },
    { heading: 'Rate', text: '15.8 cents per kWh peak, 11.2 cents overnight.' },
  ];

  return (
    <DocSection id="navigation" title="Navigation">
      <Text>
        The top navigation and footer are page-level and already rendered around this page, so they
        are described rather than duplicated here — rendering a second <code>Navbar</code> would put
        two &ldquo;Main&rdquo; landmarks on one page.
      </Text>

      <ComponentPreview
        name="Tabs"
        source="@/ds · Tabs"
        description="A segmented control that swaps the content below it."
        usage="Two to four options. Pass panelId to bind each tab to its panel; the dashboard uses this to swap whole views."
        accessibility="A real tablist with roving tabIndex. Arrow keys, Home and End move between tabs, and aria-controls binds each tab to its panel."
      >
        <Stage layout="stack">
          <Tabs
            label="Design system tabs example"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'overview', label: 'Overview', icon: 'Overview' },
              { value: 'usage', label: 'Usage', icon: 'Pattern' },
              { value: 'savings', label: 'Savings', icon: 'Savings' },
            ]}
          />
          <Text size="small" muted>
            Selected: <code>{tab}</code>
          </Text>
        </Stage>
      </ComponentPreview>

      <ComponentPreview
        name="TabLink"
        source="@/ds · TabLink"
        description="Stacked selectable rows, used beside an image or a chart."
        usage="Three to five rows. Inactive rows sit at reduced opacity only when the row is interactive."
        accessibility="Renders a <button> with role=tab when onSelect is passed, and a plain div when it is static — never a clickable div."
      >
        <Stage layout="stack">
          <div role="tablist" aria-label="Plan details example" style={{ display: 'flex', flexDirection: 'column' }}>
            {ROWS.map((item, index) => (
              <TabLink
                key={item.heading}
                heading={item.heading}
                text={row === index ? item.text : undefined}
                active={row === index}
                headingLevel={4}
                onSelect={() => setRow(index)}
              />
            ))}
          </div>
        </Stage>
      </ComponentPreview>

      <ComponentPreview
        name="CarouselArrow, CarouselDots"
        source="@/ds · Carousel"
        description="Slider controls. Arrows are labelled by direction; dots announce their position."
        usage="Arrows left, dots right, with the pair sitting below the slider."
        accessibility="Both are real buttons. Dots are a list with aria-current on the active item and an accessible name giving the position."
      >
        <Stage>
          <CarouselArrow direction="left" onClick={() => setSlide((s) => Math.max(0, s - 1))} disabled={slide === 0} />
          <CarouselArrow direction="right" onClick={() => setSlide((s) => Math.min(4, s + 1))} disabled={slide === 4} />
          <CarouselDots count={5} active={slide} onSelect={setSlide} />
        </Stage>
      </ComponentPreview>

      <ComponentPreview
        name="SectionTitle"
        source="@/ds · SectionTitle"
        description="Tagline, heading and one supporting sentence. Opens nearly every section in the product."
        usage="One short tagline, a sentence-case headline with no terminal punctuation, and at most one supporting sentence."
        accessibility="level sets the semantic heading independently of size, so visual hierarchy never distorts the outline."
      >
        <Stage layout="stack">
          <SectionTitle
            tagline="How It Works"
            heading="Three steps to lower bills"
            text="No spreadsheets. No confusing rate tables. Just clear answers."
            align="left"
            level={4}
            size="h5"
          />
        </Stage>
      </ComponentPreview>
    </DocSection>
  );
}

export function FeedbackSection() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <DocSection id="feedback" title="Feedback & Status">
      <ComponentPreview
        name="Tag"
        source="@/ds · Tag"
        description="A short metadata label. Accent marks the single most important label in a group."
        usage="Group tags in a row with an 8px gap. Use accent once per card at most."
        accessibility="Text, not colour alone. A tag never carries meaning that is unavailable in its label."
      >
        <Stage>
          <Tag>Fixed rate</Tag>
          <Tag>EV friendly</Tag>
          <Tag accent>Recommended for you</Tag>
        </Stage>
        <Stage tone="dark">
          <Tag alternate>On a dark band</Tag>
        </Stage>
      </ComponentPreview>

      <ComponentPreview
        name="DemoBanner"
        source="@/components · DemoBanner"
        description="States plainly that the figures nearby are simulated. Used on every surface that shows generated numbers."
        usage="Place it once per section that renders simulated output. Say what is simulated, not just that something is."
        accessibility="Ordinary text in the reading order, so it is encountered before the figures it qualifies."
      >
        <Stage layout="stack">
          <DemoBanner>
            Every reading on this page is simulated for a sample home. wattsAI is not connected to a
            meter, an inverter or any device.
          </DemoBanner>
        </Stage>
        <Stage tone="dark" layout="stack">
          <DemoBanner tone="dark">These headline figures are illustrative.</DemoBanner>
        </Stage>
      </ComponentPreview>

      <ComponentPreview
        name="Stepper"
        source="@/components · Stepper"
        description="Progress through a multi-step flow. Completed steps carry a check."
        usage="Use when a flow has three or more ordered steps and the user can move between them."
        accessibility="An ordered list inside a labelled nav. The active step carries aria-current=step, and each item has visually hidden text naming its state."
      >
        <Stage layout="stack">
          <Stepper
            steps={[
              { id: 'upload', label: 'Upload Bill' },
              { id: 'review', label: 'Review Analysis' },
              { id: 'profile', label: 'Home Profile' },
            ]}
            currentIndex={1}
            label="Design system stepper example"
          />
        </Stage>
      </ComponentPreview>

      <ComponentPreview
        name="Drawer"
        source="@/components · Drawer"
        description="A modal side panel built on the native dialog element."
        usage="Use for detail that would otherwise be a separate page. Bind it to a URL parameter so browser Back closes it."
        accessibility="Focus is trapped by the browser and returned to the trigger on close. Escape is handled explicitly as well as through the dialog cancel event, because some browsers deliver the keydown but never fire cancel."
      >
        <Stage>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            Open the drawer
          </Button>
        </Stage>
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Night Charge Flex">
          <Text size="small" muted>
            A live Drawer, rendered from the same component the plans page uses. Press Escape, or use
            the close button, and focus returns to the trigger.
          </Text>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <CheckListItem>Overnight rate of 7.9 cents suits EV charging</CheckListItem>
            <CheckListItem>Month to month, so you can leave without a fee</CheckListItem>
          </ul>
        </Drawer>
      </ComponentPreview>

      <ComponentPreview
        name="Empty and error patterns"
        source="Composed inline, not yet extracted"
        description="Empty results and inline errors are currently composed from Icon, Text and Button inside feature pages rather than provided as components."
        usage="Give an empty state a reason and a way out. The plans page offers Clear all filters rather than leaving a blank grid."
        accessibility="Result counts and validation summaries are announced through role=status and role=alert regions."
      >
        <Stage layout="stack">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-16)', padding: 'var(--space-48)', border: '1px dashed var(--ink-35)', borderRadius: 'var(--radius-card)', textAlign: 'center' }}>
            <Icon name="Compare" size={48} />
            <Text size="medium">Nothing matches those filters yet.</Text>
            <Button variant="secondary">Clear all filters</Button>
          </div>
          <div role="alert" style={{ padding: 'var(--space-16)', border: '1px solid var(--feedback-error)', borderRadius: 'var(--radius-field)', background: 'var(--feedback-error-bg)' }}>
            <Text as="span" size="small" weight={600}>
              Answer these before continuing: What kind of home is it.
            </Text>
          </div>
        </Stage>
      </ComponentPreview>
    </DocSection>
  );
}

export function AiComponentsSection() {
  const insight = INSIGHTS[0];
  const [dismissed, setDismissed] = useState(false);

  return (
    <DocSection id="ai-components" title="AI Components">
      <Text>
        The components that carry generated output. Their shared job is to make a recommendation
        inspectable: label it as simulated, show the figures behind it, and let the user act on it or
        dismiss it.
      </Text>
      <DemoBanner>
        This product has no model and makes no network calls. These components today render
        deterministic output from the recommendation engine, which is exactly the shape a real model
        response would have to be validated into.
      </DemoBanner>

      {insight ? (
        <ComponentPreview
          name="InsightCard"
          source="@/features/dashboard · InsightCard"
          description="A single AI finding, with its reasoning behind an Explain disclosure and an action that routes somewhere useful."
          usage="Use when the system has something specific to say about the user's data. Every insight needs a finding, an explanation and exactly one action. Never show an insight the user cannot act on or dismiss."
          accessibility="Explain is a button with aria-expanded bound to the panel it reveals. Dismiss removes the card and the page offers an undo, so the action is reversible."
        >
          <StateGrid>
            <StateExample label="Default">
              <InsightCard insight={insight} onDismiss={() => {}} />
            </StateExample>
            <StateExample label="After dismiss">
              {dismissed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', padding: 'var(--space-16)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-field)' }}>
                  <Text as="span" size="small">
                    Insight dismissed.
                  </Text>
                  <Button variant="link" size="small" trailingIcon={null} onClick={() => setDismissed(false)}>
                    Undo
                  </Button>
                </div>
              ) : (
                <InsightCard insight={insight} onDismiss={() => setDismissed(true)} />
              )}
            </StateExample>
          </StateGrid>
          <Text size="small" muted>
            Explain is a real disclosure — open it on the card above. There is no loading or error
            state in this component today, because insights are computed synchronously.
          </Text>
        </ComponentPreview>
      ) : null}

      <ComponentPreview
        name="Simulated response label"
        source="@/ds · Tag, used by the copilot transcript"
        description="Every assistant turn carries a Tag marking it as simulated, so generated text is never mistaken for a measurement."
        usage="Attach to every AI-authored message. Remove it only when the output is genuinely from a verified source."
        accessibility="A text label inside the message, read before the message body rather than conveyed by styling."
      >
        <Stage layout="stack">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', maxWidth: 520, padding: 'var(--space-16)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', background: 'var(--surface-card)' }}>
            <Tag>Simulated response</Tag>
            <Text size="small">
              Smart Home 12 from Clear Energy Co. is the strongest match at $279 a month. Against
              Basic Residential that is $543 a year less.
            </Text>
            <Text as="span" size="tiny" muted>
              Based on: Your analyzed bill · Your home profile · Plan database
            </Text>
          </div>
        </Stage>
      </ComponentPreview>

      <ComponentPreview
        name="AI status announcements"
        source="Composed inline · role=status with aria-live"
        description="Loading, completion and validation messages are announced politely so a screen-reader user learns that an answer arrived."
        usage="Announce the transition, not the content. 'Analyzing the bill' then 'Analysis ready' is enough; the answer itself is read from the transcript."
        accessibility="Live regions are polite, never assertive, so they do not interrupt. The latest assistant turn is the live region rather than the whole transcript."
      >
        <Stage layout="stack">
          <StateGrid>
            <StateExample label="Idle">
              <Text size="small" muted>
                No message. The region exists but is empty.
              </Text>
            </StateExample>
            <StateExample label="Loading">
              <Text size="small" muted>
                Working through the numbers
              </Text>
            </StateExample>
            <StateExample label="Complete">
              <Text size="small" muted>
                Analysis ready. Moving to review.
              </Text>
            </StateExample>
            <StateExample label="Error">
              <Text size="small" style={{ color: 'var(--feedback-error)' }}>
                huge.pdf is larger than 10 MB. Upload a smaller file.
              </Text>
            </StateExample>
          </StateGrid>
        </Stage>
        <Text size="small" muted>
          Streaming and timeout states are not implemented; both need a real model call to be
          meaningful.
        </Text>
      </ComponentPreview>

      <ComponentPreview
        name="Suggested prompts and context chips"
        source="Composed inline in CopilotPage · not yet extracted"
        description="Prompt buttons and removable context chips that show the copilot what it is reasoning over."
        usage="Show the user exactly which context is attached, and let them remove any of it. Context the user cannot see is context they cannot correct."
        accessibility="Prompts are buttons in a list. Each chip's remove control has an accessible name naming the chip it removes."
      >
        <Stage layout="stack">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
            <Tag>Your bill · Harbour Electric, $272.84</Tag>
            <Tag>Home profile</Tag>
            <Tag>Smart Home 12 · $279 a month</Tag>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
            <Button variant="secondary" size="small">
              Why is my bill higher this month
            </Button>
            <Button variant="secondary" size="small">
              How can I save $30
            </Button>
          </div>
        </Stage>
        <Text size="small" muted>
          These are page-local markup in the copilot today rather than exported components, so the
          preview above is an approximation built from Tag and Button. Extracting them is listed in
          the findings.
        </Text>
      </ComponentPreview>
    </DocSection>
  );
}

export function UsageGuidelinesSection() {
  return (
    <DocSection id="usage-guidelines" title="Usage Guidelines">
      <Heading level={3} scale="h6">
        Composition rules
      </Heading>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <CheckListItem>
          Sections alternate scheme 1 → 2 → 3, with scheme 4 as punctuation that restarts the run.
          Never place two identical schemes next to each other.
        </CheckListItem>
        <CheckListItem>
          The brand green appears on primary buttons only. Charts use an ink ramp plus a single dark
          green accent, so data never competes with actions.
        </CheckListItem>
        <CheckListItem>
          Card gaps are 32px, copy gaps 24px, button gaps 16px, major block gaps 80px. Use the scale
          rather than arbitrary values.
        </CheckListItem>
        <CheckListItem>
          One primary action per decision area, paired with at most one secondary.
        </CheckListItem>
        <CheckListItem icon="Close">
          No shadows, no gradients, nothing pill-shaped. These are constraints, not omissions.
        </CheckListItem>
        <CheckListItem icon="Close">
          Never hardcode a colour, size or radius in a component. If a value is missing from the
          scale, add a token rather than a literal.
        </CheckListItem>
      </ul>

      <Heading level={3} scale="h6">
        Content rules
      </Heading>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <CheckListItem>
          Headlines are sentence case with no terminal punctuation. Primary CTAs are Title Case.
        </CheckListItem>
        <CheckListItem>
          Use specific numbers. &ldquo;$543 a year less than Basic Residential&rdquo;, not
          &ldquo;significant savings&rdquo;.
        </CheckListItem>
        <CheckListItem>Every money figure names the baseline it is measured against.</CheckListItem>
        <CheckListItem icon="Close">No emoji, no exclamation marks.</CheckListItem>
      </ul>

      <Heading level={3} scale="h6">
        Accessibility rules
      </Heading>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <CheckListItem>
          If it navigates it is a link; if it acts it is a button. No clickable divs.
        </CheckListItem>
        <CheckListItem>
          Semantic heading level is set independently of visual size, on every component that renders
          a heading.
        </CheckListItem>
        <CheckListItem>
          Icons are decorative by default and hidden from assistive technology. Passing a title makes
          an icon an image with a name.
        </CheckListItem>
        <CheckListItem>
          Never remove a focus ring. One <code>:focus-visible</code> rule serves the whole system,
          with a light variant on dark bands.
        </CheckListItem>
      </ul>
    </DocSection>
  );
}
