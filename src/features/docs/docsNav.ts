import { ROUTES } from '@/app/routes';

export interface DocSectionLink {
  readonly id: string;
  readonly label: string;
}

export interface DocPageNav {
  readonly to: string;
  readonly label: string;
  readonly sections: readonly DocSectionLink[];
}

/** Sections of the documentation landing page, in the order they are rendered. */
export const DOCS_SECTIONS: readonly DocSectionLink[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'product-architecture', label: 'Product Architecture' },
  { id: 'design-to-development', label: 'Design-to-Development Workflow' },
  { id: 'ai-architecture', label: 'AI Architecture' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'testing-strategy', label: 'Testing Strategy' },
  { id: 'engineering-decisions', label: 'Engineering Decisions' },
];

export const ARCHITECTURE_SECTIONS: readonly DocSectionLink[] = [
  { id: 'system-overview', label: 'System Overview' },
  { id: 'frontend-layer', label: 'Frontend Layer' },
  { id: 'ai-layer', label: 'AI Layer' },
  { id: 'data-layer', label: 'Data Layer' },
  { id: 'architecture-principles', label: 'Architecture Principles' },
];

export const DESIGN_SYSTEM_SECTIONS: readonly DocSectionLink[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'radius', label: 'Border Radius' },
  { id: 'elevation', label: 'Elevation & Borders' },
  { id: 'icons', label: 'Icons' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'form-controls', label: 'Form Controls' },
  { id: 'cards', label: 'Cards' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'feedback', label: 'Feedback & Status' },
  { id: 'ai-components', label: 'AI Components' },
  { id: 'usage-guidelines', label: 'Usage Guidelines' },
];

export const DOC_PAGES: readonly DocPageNav[] = [
  { to: ROUTES.docs, label: 'Engineering Documentation', sections: DOCS_SECTIONS },
  { to: ROUTES.docsArchitecture, label: 'Technical Architecture', sections: ARCHITECTURE_SECTIONS },
  { to: ROUTES.designSystem, label: 'Design System', sections: DESIGN_SYSTEM_SECTIONS },
];
