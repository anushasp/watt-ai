export const ROUTES = {
  home: '/',
  billAnalysis: '/bill-analysis',
  plans: '/plans',
  dashboard: '/dashboard',
  copilot: '/copilot',
  docs: '/docs',
  docsArchitecture: '/docs/architecture',
  designSystem: '/design-system',
} as const;

export type BillStep = 'upload' | 'review' | 'profile';

export const BILL_STEPS: readonly BillStep[] = ['upload', 'review', 'profile'];

export const BILL_STEP_LABELS: Readonly<Record<BillStep, string>> = {
  upload: 'Upload Bill',
  review: 'Review Analysis',
  profile: 'Home Profile',
};

export function billStepPath(step: BillStep): string {
  return `${ROUTES.billAnalysis}?step=${step}`;
}

export function copilotPath(opts: { planId?: string; prompt?: string } = {}): string {
  const params = new URLSearchParams();
  if (opts.planId) params.set('plan', opts.planId);
  if (opts.prompt) params.set('q', opts.prompt);
  const qs = params.toString();
  return qs ? `${ROUTES.copilot}?${qs}` : ROUTES.copilot;
}

export const NAV_ITEMS = [
  { to: ROUTES.home, label: 'Home' },
  { to: ROUTES.billAnalysis, label: 'Bill Analysis' },
  { to: ROUTES.plans, label: 'Plans' },
  { to: ROUTES.dashboard, label: 'Dashboard' },
  { to: ROUTES.copilot, label: 'AI Copilot' },
] as const;

export const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Bill Analysis', to: ROUTES.billAnalysis },
      { label: 'Plan Recommendations', to: ROUTES.plans },
      { label: 'Energy Dashboard', to: ROUTES.dashboard },
      { label: 'AI Copilot', to: ROUTES.copilot },
    ],
  },
  {
    title: 'How it works',
    links: [
      { label: 'Three steps to lower bills', to: '/#how-it-works' },
      { label: 'How wattsAI calculates', to: `${ROUTES.billAnalysis}?step=review` },
      { label: 'Compare plans', to: ROUTES.plans },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Home', to: ROUTES.home },
      { label: 'What is simulated', to: '/#about' },
    ],
  },
  {
    title: 'For Engineers',
    links: [
      { label: 'Documentation', to: ROUTES.docs },
      { label: 'Architecture', to: ROUTES.docsArchitecture },
      { label: 'Design System', to: ROUTES.designSystem },
    ],
  },
] as const;
