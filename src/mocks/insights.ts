import type { AiInsight } from '@/types';

/** Simulated findings shown on the dashboard. */
export const INSIGHTS: readonly AiInsight[] = [
  {
    id: 'peak-shift',
    severity: 'opportunity',
    icon: 'Shift',
    title: 'Your evening usage rose 18 percent this week',
    finding:
      'Between 4 and 7 PM you used 18 percent more than the week before, and that window carries the highest rate.',
    explanation:
      'We compared the last seven days against the seven before, hour by hour. The increase sits almost entirely between 4 and 7 PM, which is billed at the peak rate. Running the dishwasher and the dryer after 9 PM would move roughly 6 kWh a week out of that window.',
    actionLabel: 'Ask wattsAI how to shift it',
    actionKind: 'ask-copilot',
    actionPrompt: 'How do I shift my evening usage to cheaper hours',
  },
  {
    id: 'ev-window',
    severity: 'opportunity',
    icon: 'Charger',
    title: 'Your EV is charging during the expensive window',
    finding:
      'Most charging sessions start around 6 PM. Starting after 11 PM would cost noticeably less on an overnight plan.',
    explanation:
      'Your charging sessions average 3.2 hours and usually begin shortly after 6 PM. On a plan with a lower overnight rate, moving that session past 11 PM changes what the same energy costs. The exact saving depends on the plan you are on, so compare before you decide.',
    actionLabel: 'Compare overnight plans',
    actionKind: 'view-plans',
  },
  {
    id: 'contract-expiry',
    severity: 'warning',
    icon: 'Contract',
    title: 'Your contract expires in four months',
    finding:
      'Your current plan ends on 31 July 2026. Plans usually roll to a higher variable rate unless you act.',
    explanation:
      'Contracts that lapse typically move to the retailer standard rate, which is often higher than any advertised plan. Four months is enough time to compare without paying an early exit fee.',
    actionLabel: 'See your options',
    actionKind: 'view-plans',
  },
  {
    id: 'standby-load',
    severity: 'info',
    icon: 'Minimize',
    title: 'Your always-on load is 0.5 kW',
    finding:
      'Something draws half a kilowatt around the clock, which is about 88 kWh over this billing period.',
    explanation:
      'Always-on load is what your home draws at its quietest, usually after 3 AM. Half a kilowatt is on the high side for a home this size. Common causes are a second fridge, a pool pump on a full-time timer, or networking gear.',
    actionLabel: 'Ask wattsAI what it could be',
    actionKind: 'ask-copilot',
    actionPrompt: 'What could be causing my always-on load',
  },
];
