export type ChatRole = 'user' | 'assistant';

export interface ChatCalculation {
  readonly label: string;
  readonly value: string;
}

export interface ChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly text: string;
  readonly calculations?: readonly ChatCalculation[] | undefined;
  readonly sources?: readonly string[] | undefined;
  /** Assistant turns are always simulated in this demo. */
  readonly simulated: boolean;
}

export interface ContextChip {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly removable: boolean;
}

export interface CopilotSeed {
  readonly planId?: string | undefined;
  readonly prompt?: string | undefined;
}
