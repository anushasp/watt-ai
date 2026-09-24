import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Heading, Icon, Tag, Text, type IconName } from '@/ds';
import { copilotPath, ROUTES } from '@/app/routes';
import type { AiInsight } from '@/types';
import styles from './InsightCard.module.css';

const SEVERITY_LABEL = {
  info: 'Observation',
  opportunity: 'Opportunity',
  warning: 'Worth acting on',
} as const;

export interface InsightCardProps {
  insight: AiInsight;
  onDismiss: () => void;
}

export function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const takeAction = () => {
    if (insight.actionKind === 'view-plans') void navigate(ROUTES.plans);
    else void navigate(copilotPath(insight.actionPrompt ? { prompt: insight.actionPrompt } : {}));
  };

  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <Icon name={insight.icon as IconName} size={32} />
        <div className={styles.headEnd}>
          <Tag>{SEVERITY_LABEL[insight.severity]}</Tag>
          {/* Sits in the header row rather than floating over the card, so it can never
              land on top of the title however narrow the card gets. */}
          <button
            type="button"
            className={styles.dismiss}
            onClick={onDismiss}
            aria-label={`Dismiss insight: ${insight.title}`}
          >
            <Icon name="Close" size={16} />
          </button>
        </div>
      </div>
      <Heading level={4} scale="h6">
        {insight.title}
      </Heading>
      <Text size="small" muted>
        {insight.finding}
      </Text>

      <div
        className={styles.explanationWrap}
        data-expanded={expanded ? 'true' : 'false'}
        id={`${insight.id}-explanation`}
      >
        <div className={styles.explanation}>
          <Text size="small">{insight.explanation}</Text>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={`${insight.id}-explanation`}
        >
          {expanded ? 'Hide explanation' : 'Explain'}
        </Button>
        <Button size="small" onClick={takeAction}>
          {insight.actionLabel}
        </Button>
      </div>
    </article>
  );
}
