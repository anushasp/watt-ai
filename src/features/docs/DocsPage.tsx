import { Link } from 'react-router';
import { CheckListItem, Heading, Icon, Text } from '@/ds';
import { ROUTES } from '@/app/routes';
import { DocsLayout, DocSection } from './DocsLayout';
import { DOCS_SECTIONS } from './docsNav';
import { FlowDiagram } from './components/FlowDiagram';
import { StatusTable } from './StatusTable';
import styles from './DocsPage.module.css';

const WORKFLOW = [
  { label: 'Figma', detail: 'Source of truth for layout, type, spacing and colour.' },
  { label: 'Product Design', detail: 'Screens and states designed before any code is written.' },
  { label: 'Figma MCP', detail: 'Exposes frames and variables to tooling, so tokens are read rather than guessed.' },
  { label: 'AI Coding Agent', detail: 'Drafts components and pages against the design system.' },
  { label: 'React Implementation', detail: 'Typed components composed from the existing library.' },
  { label: 'Engineering Review', detail: 'A person reads the diff and checks it against the design.' },
  { label: 'Automated Testing', detail: 'Typecheck, lint and tests run before anything merges.' },
  { label: 'Production', detail: 'Shipped, then verified again in a real browser.' },
] as const;

const AI_FLOW = [
  { label: 'User Action', detail: 'A question, an upload, a filter change.' },
  { label: 'React UI', detail: 'Captures intent and renders state. Holds no AI logic.' },
  { label: 'Application Layer', detail: 'Assembles context: the bill, the profile, the selected plan.' },
  { label: 'AI / API Layer', detail: 'Where a model call belongs. Today this is a deterministic local service.' },
  { label: 'Structured Response', detail: 'A typed object, not a paragraph to be parsed.' },
  { label: 'Schema Validation', detail: 'Rejects malformed output before it reaches state.' },
  { label: 'Application State', detail: 'Validated data enters the reducer.' },
  { label: 'UI Rendering', detail: 'Components render state, never raw model output.' },
] as const;

const CAPABILITIES = [
  {
    capability: 'Electricity bill analysis',
    status: 'in-progress' as const,
    note: 'The three-step review experience exists and is fully interactive. It displays a clearly labelled sample analysis; no document is parsed.',
  },
  {
    capability: 'Bill document extraction',
    status: 'planned' as const,
    note: 'No OCR or parsing. Files are validated and never read or uploaded.',
  },
  {
    capability: 'Household energy profiling',
    status: 'implemented' as const,
    note: 'EV, solar, battery, home type, size and priority feed the estimate and the ranking.',
  },
  {
    capability: 'Plan recommendations',
    status: 'implemented' as const,
    note: 'A pure ranking engine costs every plan against one estimated usage figure.',
  },
  {
    capability: 'Energy usage insights',
    status: 'implemented' as const,
    note: 'Dashboard insights with Explain, Take Action and Dismiss, over simulated readings.',
  },
  {
    capability: 'Contextual AI copilot',
    status: 'in-progress' as const,
    note: 'Context-aware and structured, but answers come from keyword routing over the same engine. There is no model and no network call.',
  },
];

const ACCESSIBILITY = [
  {
    capability: 'Semantic HTML',
    status: 'implemented' as const,
    note: 'Landmarks, one h1 per page, real lists and tables, buttons for actions and links for navigation.',
  },
  {
    capability: 'Keyboard navigation',
    status: 'implemented' as const,
    note: 'Skip link, roving tabIndex with arrow keys on tablists, no keyboard traps.',
  },
  {
    capability: 'Visible focus states',
    status: 'implemented' as const,
    note: 'A single :focus-visible rule in the token layer, with a light variant for dark bands.',
  },
  {
    capability: 'Accessible forms',
    status: 'implemented' as const,
    note: 'Every field is labelled; radio groups use fieldset and legend; errors use aria-invalid and an announced summary.',
  },
  {
    capability: 'Colour contrast',
    status: 'in-progress' as const,
    note: 'The palette is inherited from the design system and chosen with contrast in mind. No formal audit has been run.',
  },
  {
    capability: 'Reduced-motion support',
    status: 'implemented' as const,
    note: 'prefers-reduced-motion is honoured globally and in the drawer.',
  },
  {
    capability: 'Accessible dialogs',
    status: 'implemented' as const,
    note: 'Native modal dialog, Escape to close, focus trapped and returned to the trigger.',
  },
  {
    capability: 'ARIA live regions',
    status: 'implemented' as const,
    note: 'Upload progress, route changes, filter counts and the latest assistant turn are announced politely.',
  },
  {
    capability: 'Screen-reader AI status messages',
    status: 'in-progress' as const,
    note: 'Assistant turns announce and are labelled simulated. A fuller vocabulary waits on streaming and timeout states.',
  },
  {
    capability: 'Automated accessibility checks in CI',
    status: 'planned' as const,
    note: 'eslint-plugin-jsx-a11y runs on every lint. Runtime axe assertions are not wired up.',
  },
];

const TESTING = [
  { capability: 'Vitest', status: 'implemented' as const, note: '10 test files, 112 tests, run by npm run check.' },
  { capability: 'React Testing Library', status: 'implemented' as const, note: 'Navigation and the bill-analysis workflow are driven through the real route tree.' },
  { capability: 'Playwright end-to-end', status: 'planned' as const, note: 'Not in the repository. Cross-browser journeys are verified manually today.' },
  { capability: 'Structured output validation', status: 'planned' as const, note: 'No schema library. Responses are typed at compile time only.' },
  { capability: 'Known-input test cases', status: 'implemented' as const, note: 'The engine is asserted against fixed bills and profiles, including determinism for repeated inputs.' },
  { capability: 'Recommendation consistency checks', status: 'in-progress' as const, note: 'Determinism and a like-for-like savings baseline are tested. A cross-surface assertion is not yet written.' },
];

export function DocsPage() {
  return (
    <DocsLayout
      title="WattAI Engineering Documentation"
      intro="WattAI is an AI-native home energy experience designed to demonstrate how product design, frontend engineering, and agentic AI workflows can work together in a production-minded application."
      sections={DOCS_SECTIONS}
    >
      <DocSection id="overview" title="Overview">
        <Text className={styles.lead}>WattAI helps customers:</Text>
        <ul className={styles.list}>
          <CheckListItem>Understand electricity usage</CheckListItem>
          <CheckListItem>Analyze electricity bills</CheckListItem>
          <CheckListItem>Compare energy plans</CheckListItem>
          <CheckListItem>Receive AI-powered recommendations</CheckListItem>
          <CheckListItem>Interact with a contextual energy copilot</CheckListItem>
        </ul>
        <Text>
          The project is intended to demonstrate more than a basic chatbot. A chat box in front of a
          model is easy to build and hard to trust. WattAI is instead an attempt to show what the
          surrounding engineering looks like: frontend architecture, AI workflows, structured
          responses, reusable UI, accessibility, testing, and production-minded decisions about
          where model output is allowed to reach.
        </Text>
        <div className={styles.note}>
          <Text size="small">
            Every figure in the product is simulated. Bill parsing, assistant answers and meter
            readings are all generated locally, and the interface says so wherever they appear.
            This documentation marks each capability as Implemented, In Progress or Planned based on
            what is in the repository today.
          </Text>
        </div>
      </DocSection>

      <DocSection id="product-architecture" title="Product Architecture">
        <Text>
          The product is five surfaces over one journey: Home, Bill Analysis, Plan Recommendations,
          Energy Dashboard and AI Copilot. Drawers, tabs and workflow steps are states within those
          pages rather than additional routes.
        </Text>
        <Text>
          The codebase is layered so that data has exactly one path to the screen. Components call
          hooks, hooks call services, and services read fixtures. That single seam is what a real
          API would replace.
        </Text>
        <ul className={styles.list}>
          <CheckListItem>
            <strong>Design system</strong> — ported components and tokens, the only import surface
            for feature code. <Link to={ROUTES.designSystem}>Browse the design system</Link> for the
            rendered foundations and component library.
          </CheckListItem>
          <CheckListItem>
            <strong>Features</strong> — one folder per page, composing design-system components.
          </CheckListItem>
          <CheckListItem>
            <strong>Services</strong> — the recommendation engine, money formatting, energy
            calculations and copilot answers. Pure functions, no React.
          </CheckListItem>
          <CheckListItem>
            <strong>State</strong> — a reducer and context, persisted to sessionStorage.
          </CheckListItem>
          <CheckListItem>
            <strong>Mocks</strong> — fixtures, never imported by a component.
          </CheckListItem>
        </ul>
        <Text>
          <Link to={ROUTES.docsArchitecture} className={styles.nextLink}>
            Read the full technical architecture
            <Icon name="ChevronRight" size={20} />
          </Link>
        </Text>
        <Text>
          <Link to={ROUTES.designSystem} className={styles.nextLink}>
            Browse the design system
            <Icon name="ChevronRight" size={20} />
          </Link>
        </Text>
      </DocSection>

      <DocSection id="design-to-development" title="Design-to-Development Workflow">
        <Text>
          Design leads, tooling accelerates, and people stay accountable for what ships.
        </Text>
        <FlowDiagram label="Design to development workflow" steps={WORKFLOW} />
        <Text>
          AI accelerates implementation. It does not replace the parts of the workflow that catch
          mistakes. Design review still decides whether a screen is right, code review still reads
          the diff, and accessibility and testing still gate the merge. In this project that was not
          a formality: the browser pass caught a closed dialog covering the whole page, a savings
          calculation comparing two different households, and focus being dropped after navigation —
          none of which the test suite noticed.
        </Text>
      </DocSection>

      <DocSection id="ai-architecture" title="AI Architecture">
        <Text>
          The conceptual flow from a user action to rendered output. The shape matters more than the
          model: each stage narrows what the next one is allowed to receive.
        </Text>
        <FlowDiagram label="AI request flow" steps={AI_FLOW} />

        <Heading level={3} scale="h6">
          Principles
        </Heading>
        <ul className={styles.list}>
          <CheckListItem>AI responses should be structured whenever possible.</CheckListItem>
          <CheckListItem>
            The frontend should not depend on parsing unpredictable natural-language output.
          </CheckListItem>
          <CheckListItem>AI-generated data should be validated before rendering.</CheckListItem>
          <CheckListItem>
            Loading, streaming, success, empty, timeout and error states should be handled
            explicitly.
          </CheckListItem>
          <CheckListItem>
            AI should provide contextual recommendations rather than behave like a generic chatbot.
          </CheckListItem>
          <CheckListItem>Hidden reasoning should not be exposed to the user.</CheckListItem>
        </ul>

        <Heading level={3} scale="h6">
          Capabilities
        </Heading>
        <StatusTable
          caption="AI capabilities and their status in this repository."
          itemHeader="Capability"
          rows={CAPABILITIES}
        />
      </DocSection>

      <DocSection id="accessibility" title="Accessibility">
        <Text>
          Accessibility is treated as part of the definition of done rather than a later pass. The
          table separates what the repository does today from what is still open.
        </Text>
        <StatusTable
          caption="Accessibility features and their status in this repository."
          itemHeader="Feature"
          rows={ACCESSIBILITY}
        />
        <Heading level={3} scale="h6">
          Planned improvements
        </Heading>
        <ul className={styles.list}>
          <CheckListItem icon="Close">A formal colour-contrast audit across all four schemes.</CheckListItem>
          <CheckListItem icon="Close">Runtime accessibility assertions in the test suite.</CheckListItem>
          <CheckListItem icon="Close">
            Focus and announcement handling for streaming responses, once streaming exists.
          </CheckListItem>
        </ul>
      </DocSection>

      <DocSection id="testing-strategy" title="Testing Strategy">
        <Text>
          Three layers, only some of which exist today. Nothing below is described as done unless it
          runs in this repository.
        </Text>
        <StatusTable
          caption="Testing layers and their status in this repository."
          itemHeader="Layer"
          rows={TESTING}
        />
        <Text size="small" muted>
          The suite runs with <code>npm run check</code>, which typechecks under strict TypeScript,
          lints with jsx-a11y, and executes the tests.
        </Text>
      </DocSection>

      <DocSection id="engineering-decisions" title="Engineering Decisions">
        <div className={styles.decision}>
          <Heading level={3} scale="h6">
            Structured AI responses
          </Heading>
          <Text size="small">
            Free-form text forces the frontend to guess. A regex that extracts a dollar figure from
            a sentence breaks the first time the model rephrases it, and the failure is silent.
            Asking for a typed object moves the failure to a place that can be checked, and lets the
            UI render fields rather than paragraphs.
          </Text>
        </div>
        <div className={styles.decision}>
          <Heading level={3} scale="h6">
            AI as a service layer
          </Heading>
          <Text size="small">
            AI logic lives beside the other services, not inside components. A component that calls
            a model directly cannot be tested without one, and cannot be reused on a screen that
            needs the same data from elsewhere. Keeping the boundary means swapping the deterministic
            service for a real model is a change in one directory.
          </Text>
        </div>
        <div className={styles.decision}>
          <Heading level={3} scale="h6">
            Deterministic UI rendering
          </Heading>
          <Text size="small">
            Components render validated application state, never raw model output. This is what
            makes the interface reproducible: the same bill and profile always produce the same
            screen, which is also what makes it testable.
          </Text>
        </div>
        <div className={styles.decision}>
          <Heading level={3} scale="h6">
            Explicit AI states
          </Heading>
          <Text size="small">
            An AI surface has more states than success. Each one needs a deliberate design, because
            the default for an unhandled state is a frozen screen with no explanation.
          </Text>
          <ul className={styles.list}>
            <CheckListItem>
              <strong>Implemented today:</strong> idle, loading, complete and empty in the copilot;
              empty, uploading, uploaded, processing and error in the upload flow.
            </CheckListItem>
            <CheckListItem icon="Close">
              <strong>Planned:</strong> streaming and timeout, which require a real model call to be
              meaningful.
            </CheckListItem>
          </ul>
        </div>
        <div className={styles.decision}>
          <Heading level={3} scale="h6">
            Human control
          </Heading>
          <Text size="small">
            A recommendation the user cannot interrogate is a recommendation they cannot safely act
            on. Every figure names its baseline, every ranking lists the reasons behind it, and the
            assumptions are published rather than buried. Users can edit the inputs, dismiss
            insights, and reject a recommendation without leaving the page.
          </Text>
        </div>
      </DocSection>
    </DocsLayout>
  );
}
