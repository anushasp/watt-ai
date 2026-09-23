import { Link } from 'react-router';
import { CheckListItem, Icon, Text } from '@/ds';
import { ROUTES } from '@/app/routes';
import { DocsLayout, DocSection } from './DocsLayout';
import { ARCHITECTURE_SECTIONS } from './docsNav';
import { LayerDiagram } from './components/FlowDiagram';
import { StatusTable } from './StatusTable';
import styles from './DocsPage.module.css';

const LAYERS = [
  { name: 'User', detail: 'A browser. No native app, no installed client.' },
  { name: 'React UI', detail: 'Vite, React and TypeScript. Routing by React Router.', tone: 'accent' as const },
  { name: 'Application Layer', detail: 'Reducer, context and hooks. Assembles context and holds validated state.' },
  { name: 'AI / API Layer', detail: 'Where a model or backend call belongs. Today a deterministic local service.' },
  { name: 'External Tools and Services', detail: 'Retailer feeds, OCR, an LLM endpoint. None connected today.', tone: 'muted' as const },
  { name: 'Data Layer', detail: 'Customer profile, usage, plans and recommendation context. Fixtures plus sessionStorage.' },
];

const FRONTEND = [
  { capability: 'Vite', status: 'implemented' as const, note: 'Build tool and dev server. The app is a single-page client application.' },
  { capability: 'React 19', status: 'implemented' as const, note: 'With StrictMode enabled in development.' },
  { capability: 'TypeScript (strict)', status: 'implemented' as const, note: 'strict, noUncheckedIndexedAccess and exactOptionalPropertyTypes are all on.' },
  { capability: 'React Router 7', status: 'implemented' as const, note: 'Browser router. Filters, steps and open drawers live in the URL.' },
  { capability: 'Reusable components', status: 'implemented' as const, note: '17 ported design-system components behind a single barrel import.' },
  { capability: 'Next.js', status: 'planned' as const, note: 'Not used. There is no Next.js in this project.' },
  { capability: 'Client/server boundaries', status: 'planned' as const, note: 'Not applicable today. Everything runs in the browser; there is no server component or server action.' },
  { capability: 'Server-side rendering', status: 'planned' as const, note: 'Would require a framework or a server. Currently client-rendered only.' },
];

const AI_LAYER = [
  { capability: 'Bill analysis workflow', status: 'in-progress' as const, note: 'The upload, review and profile steps exist. The analysis returned is a labelled sample.' },
  { capability: 'Recommendation workflow', status: 'implemented' as const, note: 'A pure engine ranks every plan against one estimated usage figure and a stated priority.' },
  { capability: 'Contextual copilot', status: 'in-progress' as const, note: 'Receives bill, profile and selected plan as context. Answers are deterministic, not generated.' },
  { capability: 'Structured responses', status: 'in-progress' as const, note: 'Answers are typed objects carrying text, calculations and sources. The types are compile-time only.' },
  { capability: 'Schema validation', status: 'planned' as const, note: 'No runtime validation library. Needed before any real model output is trusted.' },
  { capability: 'Model or API calls', status: 'planned' as const, note: 'No network calls exist. An endpoint must be server-side; no key belongs in this codebase.' },
];

const DATA_LAYER = [
  { capability: 'Customer profile', status: 'implemented' as const, note: 'EV, solar, battery, home type, size and priority. Held in the reducer, persisted per session.' },
  { capability: 'Energy usage', status: 'implemented' as const, note: 'Daily usage, tariff windows and end-use breakdown, as fixtures for a sample home.' },
  { capability: 'Plan information', status: 'implemented' as const, note: 'Six invented plans with rates, terms, fees and renewable share.' },
  { capability: 'Recommendation context', status: 'implemented' as const, note: 'Derived on demand from bill and profile; never stored separately, so it cannot drift.' },
  { capability: 'Persistence beyond a session', status: 'planned' as const, note: 'sessionStorage only. Accounts and a database would be required.' },
];

export function ArchitecturePage() {
  return (
    <DocsLayout
      title="Technical Architecture"
      intro="How WattAI is put together today, layer by layer, and which parts are conceptual rather than built. Nothing on this page describes a technology the project does not actually use."
      sections={ARCHITECTURE_SECTIONS}
    >
      <DocSection id="system-overview" title="System Overview">
        <Text>
          Each layer only talks to the one below it. That is what makes the AI layer replaceable
          without touching a component, and what keeps rendering reproducible.
        </Text>
        <LayerDiagram label="System architecture layers" layers={LAYERS} />
        <div className={styles.note}>
          <Text size="small">
            The two lower layers are conceptual. There is no backend, no external service and no
            model behind this application. The AI layer is currently a set of pure local functions
            that occupy the position a real service would take.
          </Text>
        </div>
      </DocSection>

      <DocSection id="frontend-layer" title="Frontend Layer">
        <Text>
          A client-rendered single-page application. State that a user might want to share or return
          to — filters, comparison selections, the open drawer, the current step — lives in the URL,
          so the browser back button behaves the way people expect.
        </Text>
        <StatusTable
          caption="Frontend technologies and their status in this repository."
          itemHeader="Technology"
          rows={FRONTEND}
        />
      </DocSection>

      <DocSection id="ai-layer" title="AI Layer">
        <Text>
          Conceptually this is the boundary between the application and anything generative. It
          exists as a directory of pure services today, which is deliberate: the seam is real even
          though the model is not, so introducing one is a contained change.
        </Text>
        <StatusTable
          caption="AI layer responsibilities and their status in this repository."
          itemHeader="Responsibility"
          rows={AI_LAYER}
        />
      </DocSection>

      <DocSection id="data-layer" title="Data Layer">
        <Text>
          Fixtures are kept out of components entirely. Components call hooks, hooks call services,
          services read data. Replacing fixtures with a real source is a change in one directory.
        </Text>
        <StatusTable
          caption="Data concerns and their status in this repository."
          itemHeader="Concern"
          rows={DATA_LAYER}
        />
      </DocSection>

      <DocSection id="architecture-principles" title="Architecture Principles">
        <ul className={styles.list}>
          <CheckListItem>
            <strong>Separation of concerns</strong> — presentation, application state and data each
            have one home, and the boundaries are import rules rather than conventions.
          </CheckListItem>
          <CheckListItem>
            <strong>Reusable frontend architecture</strong> — features compose design-system
            components; no feature reimplements a button, a card or a band.
          </CheckListItem>
          <CheckListItem>
            <strong>Deterministic rendering</strong> — the same inputs always produce the same
            screen, which is what makes the UI testable at all.
          </CheckListItem>
          <CheckListItem>
            <strong>Validated AI responses</strong> — output is checked before it becomes state.
            Typed at compile time today; runtime validation is still to come.
          </CheckListItem>
          <CheckListItem>
            <strong>Graceful degradation</strong> — missing data renders as &ldquo;Not found.&rdquo;
            rather than a zero, and storage failures leave the app working without persistence.
          </CheckListItem>
          <CheckListItem>
            <strong>Accessibility</strong> — semantics, focus and announcements are part of the
            component contract, not a later pass.
          </CheckListItem>
          <CheckListItem>
            <strong>Testability</strong> — pure services and URL-driven state mean most behaviour
            can be asserted without mounting a browser.
          </CheckListItem>
          <CheckListItem icon="Close">
            <strong>Observability</strong> — no logging, metrics or tracing exists yet. A real AI
            layer would need request timing, failure rates and output-validation failures before it
            could be trusted in production.
          </CheckListItem>
        </ul>
        <Text>
          <Link to={ROUTES.docs} className={styles.nextLink}>
            <Icon name="ArrowBack2" size={20} />
            Back to engineering documentation
          </Link>
        </Text>
      </DocSection>
    </DocsLayout>
  );
}
