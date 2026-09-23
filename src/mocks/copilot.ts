/** Suggested prompts offered on the Copilot page. */
export const SUGGESTED_PROMPTS: readonly string[] = [
  'Why is my bill higher this month',
  'How can I save $30',
  'Should I switch plans',
  'What would an EV cost me',
  'Would solar actually help',
];

export type CopilotIntent =
  | 'bill-change'
  | 'savings'
  | 'switch-plan'
  | 'ev'
  | 'solar'
  | 'standby'
  | 'shift-usage'
  | 'fallback';

/** Keyword routing for the simulated assistant. First match wins. */
export const INTENT_KEYWORDS: readonly { intent: CopilotIntent; keywords: readonly string[] }[] = [
  { intent: 'bill-change', keywords: ['higher', 'lower', 'why is my bill', 'last month', 'went up'] },
  { intent: 'ev', keywords: ['ev', 'electric vehicle', 'charge', 'charging', 'car'] },
  { intent: 'solar', keywords: ['solar', 'panels', 'rooftop', 'export'] },
  { intent: 'switch-plan', keywords: ['switch', 'compare', 'better plan', 'plans', 'change plan'] },
  { intent: 'standby', keywords: ['always on', 'always-on', 'standby', 'baseline', 'phantom'] },
  { intent: 'shift-usage', keywords: ['shift', 'peak', 'off-peak', 'evening', 'cheaper hours'] },
  { intent: 'savings', keywords: ['save', 'saving', 'cheaper', 'reduce', 'cut'] },
];
