export type InsightSeverity = 'info' | 'opportunity' | 'warning';

export type InsightActionKind = 'view-plans' | 'ask-copilot';

export interface AiInsight {
  readonly id: string;
  readonly severity: InsightSeverity;
  readonly icon: string;
  readonly title: string;
  /** What was observed. */
  readonly finding: string;
  /** Longer reasoning, revealed by Explain. */
  readonly explanation: string;
  readonly actionLabel: string;
  readonly actionKind: InsightActionKind;
  /** Seeds the Copilot when actionKind is 'ask-copilot'. */
  readonly actionPrompt?: string | undefined;
}
