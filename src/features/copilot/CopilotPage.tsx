import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button, FeatureCard, Grid, Heading, Icon, Section, SectionTitle, Tag, Text } from '@/ds';
import { AIStatus } from '@/components/ai/AIStatus';
import { DemoBanner } from '@/components/DemoBanner';
import { SUGGESTED_PROMPTS } from '@/mocks/copilot';
import { buildAnswer, makeMessage } from '@/services/copilotAnswers';
import { formatMoney } from '@/services/money';
import { useSession } from '@/state/SessionContext';
import type { ChatMessage, ContextChip } from '@/types';
import styles from './CopilotPage.module.css';

export function CopilotPage() {
  const [params, setParams] = useSearchParams();
  const { state, estimates, currentPlanName, currentAnnual } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [removedChips, setRemovedChips] = useState<string[]>([]);
  const seeded = useRef(false);
  const transcriptEnd = useRef<HTMLDivElement>(null);

  const planId = params.get('plan');
  const focusPlan = estimates.find((e) => e.plan.id === planId) ?? null;

  const chips: ContextChip[] = [
    ...(state.bill
      ? [
          {
            id: 'bill',
            label: 'Your bill',
            detail: `${state.bill.provider ?? 'Unknown provider'}, ${formatMoney(state.bill.total ?? 0)}`,
            removable: true,
          },
        ]
      : []),
    ...(state.profile.priority
      ? [{ id: 'profile', label: 'Home profile', detail: 'Used to rank plans', removable: true }]
      : []),
    ...(focusPlan
      ? [
          {
            id: 'plan',
            label: focusPlan.plan.name,
            detail: `${formatMoney(focusPlan.estimatedMonthly, { cents: false })} a month`,
            removable: true,
          },
        ]
      : []),
  ].filter((c) => !removedChips.includes(c.id));

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (trimmed.length === 0 || thinking) return;
    setMessages((prev) => [...prev, makeMessage('user', trimmed)]);
    setDraft('');
    setThinking(true);
    window.setTimeout(() => {
      const answer = buildAnswer(trimmed, {
        bill: state.bill,
        estimates,
        currentPlanName,
        currentAnnual,
        focusPlan,
      });
      setMessages((prev) => [
        ...prev,
        makeMessage('assistant', answer.text, {
          calculations: answer.calculations,
          sources: answer.sources,
        }),
      ]);
      setThinking(false);
    }, 500);
  };

  // Seed from a plan or a prompt handed over by another page, once.
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    const prompt = params.get('q');
    if (prompt) {
      ask(prompt);
      const next = new URLSearchParams(params);
      next.delete('q');
      setParams(next, { replace: true });
    } else if (focusPlan) {
      ask(`Should I switch to ${focusPlan.plan.name}`);
    }
  }, []); // Seeds once on mount; re-running would replay the seeded question.

  useEffect(() => {
    transcriptEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length, thinking]);

  return (
    <>
      <Section scheme={1} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', maxWidth: 'var(--max-w-lg)' }}>
          <Heading level={1}>Ask wattsAI anything about your energy</Heading>
          <Text size="medium" muted>
            A workspace built on your bill, your home profile and your usage. Clear answers with real
            numbers, not vague advice.
          </Text>
        </div>
        <DemoBanner>
          Every reply is generated locally from fixed rules and your own figures. There is no AI
          model behind this demo, nothing is sent to a server, and no API key exists in this app.
        </DemoBanner>
      </Section>

      <Section scheme={2} size="md">
        <div className={styles.workspace}>
          <div className={styles.main}>
            <Heading level={2} scale="h5">
              Conversation
            </Heading>

            {messages.length === 0 && !thinking ? (
              <div className={styles.empty}>
                <Icon name="DataExploration" size={48} />
                <Text size="medium">Ask a question to get started.</Text>
                <Text size="small" muted>
                  Every answer shows the figures behind it and where they came from.
                </Text>
              </div>
            ) : (
              <ol className={styles.transcript}>
                {messages.map((message, index) => (
                  <li
                    key={message.id}
                    className={styles.turn}
                    data-role={message.role}
                    aria-live={
                      message.role === 'assistant' && index === messages.length - 1
                        ? 'polite'
                        : undefined
                    }
                  >
                    <div className={styles.bubble} data-role={message.role}>
                      {message.role === 'assistant' ? (
                        <Tag>Simulated response</Tag>
                      ) : (
                        <span className="sr-only">You asked</span>
                      )}
                      {/* The user bubble is near-black, so its text must be light. */}
                      <Text size="small" dark={message.role === 'user'}>
                        {message.text}
                      </Text>

                      {message.calculations && message.calculations.length > 0 ? (
                        <dl className={styles.calcs}>
                          {message.calculations.map((c, row) => (
                            <div key={c.label} style={{ ['--row' as string]: Math.min(row, 5) }}>
                              <dt>{c.label}</dt>
                              <dd>{c.value}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}

                      {message.sources && message.sources.length > 0 ? (
                        <Text as="span" size="tiny" muted>
                          Based on: {message.sources.join(' · ')}
                        </Text>
                      ) : null}
                    </div>
                  </li>
                ))}
                {thinking ? (
                  <li className={styles.turn} data-role="assistant">
                    <div className={styles.bubble} data-role="assistant">
                      <span className={styles.thinking}>
                        {/* Silent: the transcript below is already a live region, so the
                            answer is announced once rather than twice. */}
                        <AIStatus status="generating" size={28} silent label="Working through the numbers" />
                        <Text as="span" size="small" muted>
                          Working through the numbers
                        </Text>
                      </span>
                    </div>
                  </li>
                ) : null}
              </ol>
            )}
            <div ref={transcriptEnd} />

            <form
              className={styles.composer}
              onSubmit={(event) => {
                event.preventDefault();
                ask(draft);
              }}
            >
              <label htmlFor="copilot-input" className="sr-only">
                Ask wattsAI a question
              </label>
              <textarea
                id="copilot-input"
                className={styles.textarea}
                rows={2}
                value={draft}
                placeholder="Why is my bill higher this month"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    ask(draft);
                  }
                }}
              />
              <div className={styles.composerActions}>
                <Text as="span" size="tiny" muted>
                  Enter sends. Shift and Enter adds a line.
                </Text>
                <Button type="submit" disabled={thinking || draft.trim().length === 0}>
                  Ask
                </Button>
              </div>
            </form>
          </div>

          <aside className={styles.rail} aria-label="Conversation context">
            <div className={styles.railBlock}>
              <Heading level={2} scale="h6">
                Context
              </Heading>
              {chips.length > 0 ? (
                <ul className={styles.chips}>
                  {chips.map((chip) => (
                    <li key={chip.id} className={styles.chip}>
                      <span className={styles.chipBody}>
                        <strong>{chip.label}</strong>
                        <span>{chip.detail}</span>
                      </span>
                      <button
                        type="button"
                        className={styles.chipRemove}
                        aria-label={`Remove ${chip.label} from context`}
                        onClick={() => setRemovedChips((prev) => [...prev, chip.id])}
                      >
                        <Icon name="Close" size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <Text size="small" muted>
                  No context attached. Analyze a bill or open a plan and it will appear here.
                </Text>
              )}
            </div>

            <div className={styles.railBlock}>
              <Heading level={2} scale="h6">
                Suggested prompts
              </Heading>
              <ul className={styles.prompts}>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <li key={prompt}>
                    <button type="button" className={styles.prompt} onClick={() => ask(prompt)}>
                      {prompt}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      <Section scheme={3}>
        <SectionTitle
          tagline="Actions"
          heading="See the work"
          text="Every answer carries the figures it used and the source of each one."
          level={2}
        />
        <Grid min={300}>
          <FeatureCard
            muted
            icon="Calculate"
            heading="Show calculation"
            text="Each reply lists the inputs and the arithmetic, so you can check it rather than trust it."
            headingSize="h6"
          />
          <FeatureCard
            muted
            icon="Compare"
            heading="Compare plans"
            text="Plan answers use the same ranking as the plans page, so the two never disagree."
            headingSize="h6"
          />
          <FeatureCard
            muted
            icon="DataUsage"
            heading="Trace the source"
            text="Answers name what they drew on, whether that is your bill, your profile or simulated readings."
            headingSize="h6"
          />
        </Grid>
      </Section>

      <Section scheme={4}>
        <SectionTitle
          tagline="Sources"
          heading="Every answer comes from your data"
          text="wattsAI does not guess. It reads the bill you analyzed, checks your home profile, applies its stated assumptions and searches the plan list. You see the source for every claim."
          dark
          level={2}
        />
        <DemoBanner tone="dark">
          This demo has no language model and no network calls. Replies are produced by fixed rules
          over your figures, and are labelled simulated wherever they appear.
        </DemoBanner>
      </Section>
    </>
  );
}
