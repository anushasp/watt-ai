# wattsAI

An AI-native home energy experience: understand an electricity bill, compare energy plans,
estimate savings, and get contextual guidance.

**Journey:** Home → Bill Analysis → Plan Recommendations → Energy Dashboard → AI Copilot

> **Everything in this app is simulated.** No bill is parsed, no AI model is called, no meter is
> connected, and no enrollment is possible. There is no backend and no API key anywhere in this
> codebase. The interface labels simulated output wherever it appears.

---

## Purpose

This is a portfolio project, built to demonstrate what surrounds an AI feature rather than the
feature itself. A chat box in front of a model is easy to build and hard to trust. wattsAI is an
attempt to show the engineering that makes generated output usable: a real design system, a
deterministic calculation layer, validated state, explicit UI states, accessibility as part of the
component contract, and tests that assert the numbers.

Three things it is deliberately trying to prove:

1. **AI output should be structured and validated** before it reaches a component. The frontend
   should never parse free-form prose to find a dollar figure.
2. **One engine, one set of numbers.** Plans, Dashboard and Copilot all read from the same pure
   service, so they cannot contradict each other.
3. **Design-to-development alignment is a workflow**, not a handoff. The design system is vendored
   into the repo and documented from itself, so the docs cannot drift from the code.

## Major features

| Surface | What it does |
|---|---|
| **Home** `/` | Product overview, simulated energy-flow diagram, twelve-month cost comparison |
| **Bill Analysis** `/bill-analysis` | Three focused steps — Upload → Review → Home Profile. Drag-and-drop or picker upload with full state handling, an editable review panel, and a profile questionnaire that genuinely changes the recommendation |
| **Plan Recommendations** `/plans` | Ranked plans from a deterministic engine, URL-bound filters, side-by-side comparison, an accessible detail drawer, and a confirmation state that states plainly no enrollment occurs |
| **Energy Dashboard** `/dashboard` | Metric tiles with sparklines, a balanced energy-flow diagram, four working tabs with real charts, and AI insight cards with Explain / Take Action / Dismiss |
| **AI Copilot** `/copilot` | A contextual workspace seeded with your bill and selected plan. Answers are computed from the same engine and labelled as simulated |

### How the numbers stay consistent

A single pure engine (`src/services/recommendation.ts`) costs every plan against one estimated
usage figure. A single money module (`src/services/money.ts`) formats every figure and models two
comparisons that are never mixed:

- **Est. savings vs your current plan** — switching, measured at the *same* estimated usage
- **vs last month** — bill-to-bill movement on the *same* plan

Power and energy are kept strictly apart: **kW** for instantaneous power, **kWh** for energy over a
period. The energy-flow diagram balances exactly (6.2 kW in, 6.2 kW out) and a test enforces it.

## Tech stack

| Layer | Choice |
|---|---|
| Build | **Vite 7** |
| UI | **React 19** |
| Language | **TypeScript**, strict — plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` |
| Routing | **React Router 7** (browser router; filters, steps and open drawers live in the URL) |
| Styling | **CSS custom properties** + CSS Modules. No Tailwind, no CSS-in-JS |
| Charts | **Hand-built inline SVG.** No charting library |
| Testing | **Vitest** + **React Testing Library**, jsdom |
| Linting | **ESLint** with `typescript-eslint` and `jsx-a11y` |

Runtime dependencies are `react`, `react-dom` and `react-router`. Nothing else.

**There is no Next.js in this project** — it is a client-rendered single-page app. No server
components, no server actions, no SSR.

## Documentation routes

The app documents itself. None of these appear in the customer navigation; they are reachable from
the **For Engineers** section of the site footer.

| Route | Contents |
|---|---|
| **`/docs`** | Engineering documentation: overview, product architecture, the design-to-development workflow, AI architecture, accessibility, testing strategy and engineering decisions. Every capability is marked Implemented, In Progress or Planned based on what is actually in this repository |
| **`/docs/architecture`** | Technical architecture layer by layer — frontend, AI and data — with an architecture principles section |
| **`/design-system`** | The rendered design system: 127 tokens, 17 components and the AI components, all live. Colour swatches are filled with `var(--token)` and values are read from the live stylesheet at runtime, so the page cannot drift from the system |

`/docs` explains architectural reasoning. `/design-system` visually documents foundations and
components. They link to each other and do not duplicate content.

## Local setup

Requires **Node 20.19+** (developed on Node 24).

```bash
git clone git@github.com:<your-username>/watt-ai.git
```

```bash
cd watt-ai && npm install
```

```bash
npm run dev
```

Open http://localhost:5173.

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck, then a production build |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc` under strict settings |
| `npm run lint` | ESLint, including `jsx-a11y` |
| `npm test` | Vitest |
| `npm run check` | Typecheck, lint and test together |

## Implemented vs planned

### Implemented

- The full five-page journey with working navigation, a mobile drawer that closes after selecting a
  destination and returns focus, and a skip link
- Bill Analysis as three steps, one visible at a time. Back preserves every answer; removing or
  replacing the bill clears the analysis and every recommendation derived from it
- Upload for PDF / JPG / PNG with empty, uploading, uploaded, processing and error states, type and
  size validation, and a keyboard-operable control that does not rely on a hidden input
- Review with editable fields, `"Not found."` for anything not extracted, and a published
  assumptions disclosure
- A deterministic recommendation engine driven by bill and profile
- Plans with URL-bound filters, empty state, accessible drawer and side-by-side comparison
- Dashboard with four real tabs, hand-built SVG charts and insight cards with working controls
- Copilot with context chips, suggested prompts and engine-computed answers
- Accessibility: semantic HTML, one `<h1>` per page, roving-tabIndex tablists, `:focus-visible`
  rings, `prefers-reduced-motion`, native modal dialogs with focus trap and return, ARIA live regions
- State persisted across refresh via `sessionStorage`; browser Back moves between steps
- No horizontal scrolling at 320 / 375 / 390 / 768 / 1024 / 1280 / 1440
- **142 tests** across unit, workflow and navigation suites

### In progress

- **Bill analysis** — the flow is real and interactive; the analysis shown is a labelled sample
- **Contextual copilot** — context-aware and structured, but answers are keyword routing over the
  engine rather than a model
- **Structured responses** — typed at compile time only
- **Colour contrast** — the palette was chosen with contrast in mind; no formal audit has been run
- **Recommendation consistency checks** — determinism and a like-for-like baseline are tested; a
  cross-surface assertion is not yet written

### Planned

- Bill document extraction (OCR or a retailer feed)
- Runtime schema validation at the AI boundary
- Any real model or API call — which must be server-side; no key belongs in frontend code
- Playwright end-to-end tests
- Runtime accessibility assertions in CI
- Streaming and timeout states
- Observability: request timing, failure rates, output-validation failures
- Persistence beyond a browser session

## What would need a backend

Real bill parsing and storage · a plan database with current rates · an LLM endpoint behind a
server · accounts and authentication · live meter, inverter or battery data · a real switching flow
with retailer handoff, cooling-off period and credit check.

## Project layout

```
src/
  app/               routes, layout, router
  ds/                the design system — the only import surface for feature code
  components/        app-level UI: Drawer, Dropzone, Stepper, charts
  features/          one folder per page, plus docs and design-system
  services/          recommendation engine, money, energy, copilot answers
  state/             session reducer, context, persistence
  mocks/             fixtures — never imported by a component
  styles/tokens/     design tokens as CSS custom properties
  types/             domain types
```

Components call hooks, hooks call services, services read fixtures. That single seam is what a real
API would replace.

## Design system provenance

The visual language comes from a design system generated from a Figma source and vendored into this
repository: tokens in `src/styles/tokens/`, 17 components in `src/ds/`, and a 23-glyph icon set
stored as path data. The upstream design system is treated as read-only; nothing here writes back
to it.

Deliberate departures from the source are documented on `/design-system` and in `/docs`:
a simplified five-link navbar instead of a mega menu, real charts in place of placeholder bitmaps,
semantic headings (the source rendered every heading as a `<span>`), real CSS responsiveness
instead of a boolean prop, and a text wordmark because the source ships no logo.

### Third-party content

The icon set is derived from Material Symbols (Apache 2.0). The four photographs in
`public/images/` and the placeholder component patterns originate from a Relume Figma Community
kit. If you fork or redistribute this repository, check those licenses for your use case.

## License

No license is currently declared. Add one before reuse.
