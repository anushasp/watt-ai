import { useRef, useState } from 'react';
import { Button, Heading, Text } from '@/ds';
import {
  HOME_SIZE_LABELS,
  HOME_TYPE_LABELS,
  PRIORITY_LABELS,
  type HomeProfile,
  type HomeSize,
  type HomeType,
  type Priority,
} from '@/types';
import { useSession } from '@/state/SessionContext';
import styles from './HomeProfileStep.module.css';

export interface HomeProfileStepProps {
  onBack: () => void;
  onSubmit: () => void;
}

interface FieldDef {
  readonly key: keyof HomeProfile;
  readonly legend: string;
  readonly hint?: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
}

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
] as const;

const FIELDS: readonly FieldDef[] = [
  { key: 'hasEv', legend: 'Do you charge an electric vehicle at home', options: YES_NO },
  { key: 'hasSolar', legend: 'Do you have solar panels', options: YES_NO },
  { key: 'hasBattery', legend: 'Do you have a home battery', options: YES_NO },
  {
    key: 'homeType',
    legend: 'What kind of home is it',
    options: (Object.keys(HOME_TYPE_LABELS) as HomeType[]).map((v) => ({
      value: v,
      label: HOME_TYPE_LABELS[v],
    })),
  },
  {
    key: 'homeSize',
    legend: 'How large is it',
    options: (Object.keys(HOME_SIZE_LABELS) as HomeSize[]).map((v) => ({
      value: v,
      label: HOME_SIZE_LABELS[v],
    })),
  },
  {
    key: 'priority',
    legend: 'What matters most to you',
    hint: 'This decides how plans are ranked.',
    options: (Object.keys(PRIORITY_LABELS) as Priority[]).map((v) => ({
      value: v,
      label: PRIORITY_LABELS[v],
    })),
  },
];

const BOOLEAN_KEYS = new Set<keyof HomeProfile>(['hasEv', 'hasSolar', 'hasBattery']);

function currentValue(profile: HomeProfile, key: keyof HomeProfile): string | null {
  const raw = profile[key];
  if (raw === null) return null;
  if (typeof raw === 'boolean') return raw ? 'yes' : 'no';
  return raw;
}

export function HomeProfileStep({ onBack, onSubmit }: HomeProfileStepProps) {
  const { state, dispatch } = useSession();
  const [showErrors, setShowErrors] = useState(false);
  const [comparing, setComparing] = useState(false);
  const groupRefs = useRef<Record<string, HTMLFieldSetElement | null>>({});

  const missing = FIELDS.filter((f) => currentValue(state.profile, f.key) === null);

  const select = (key: keyof HomeProfile, raw: string) => {
    const value: HomeProfile[keyof HomeProfile] = BOOLEAN_KEYS.has(key) ? raw === 'yes' : (raw as never);
    dispatch({ type: 'UPDATE_PROFILE', patch: { [key]: value } as Partial<HomeProfile> });
  };

  const submit = () => {
    if (missing.length > 0) {
      setShowErrors(true);
      const first = missing[0];
      if (first) groupRefs.current[first.key]?.querySelector('input')?.focus();
      return;
    }
    setComparing(true);
    dispatch({ type: 'SUBMIT_PROFILE' });
    window.setTimeout(onSubmit, 700);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <Heading level={2} scale="h3" id="step-heading" tabIndex={-1}>
          Build your home profile
        </Heading>
        <Text size="medium" muted>
          Tell wattsAI about your home and what matters most. Every answer changes the estimate and
          the ranking.
        </Text>
      </div>

      {showErrors && missing.length > 0 ? (
        <div role="alert" className={styles.errorSummary}>
          <Text as="span" size="small" weight={600}>
            Answer these before continuing: {missing.map((m) => m.legend).join(', ')}.
          </Text>
        </div>
      ) : null}

      <div className={styles.fields}>
        {FIELDS.map((field) => {
          const value = currentValue(state.profile, field.key);
          const invalid = showErrors && value === null;
          return (
            <fieldset
              key={field.key}
              className={styles.fieldset}
              data-invalid={invalid ? 'true' : undefined}
              ref={(el) => {
                groupRefs.current[field.key] = el;
              }}
            >
              <legend className={styles.legend}>{field.legend}</legend>
              {field.hint ? (
                <Text as="span" size="small" muted>
                  {field.hint}
                </Text>
              ) : null}
              <div className={styles.options}>
                {field.options.map((option) => (
                  <label key={option.value} className={styles.option}>
                    <input
                      type="radio"
                      name={field.key}
                      value={option.value}
                      checked={value === option.value}
                      onChange={() => select(field.key, option.value)}
                      required
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {invalid ? (
                <Text as="span" size="small" style={{ color: 'var(--feedback-error)' }}>
                  Choose one to continue.
                </Text>
              ) : null}
            </fieldset>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-16)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button onClick={submit} disabled={comparing}>
          {comparing ? 'Comparing plans' : 'Find My Best Options'}
        </Button>
        <Button variant="secondary" onClick={onBack} disabled={comparing}>
          Back to review
        </Button>
        <Text as="span" size="small" muted>
          Going back keeps every answer.
        </Text>
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {comparing ? 'Comparing plans against your profile.' : ''}
      </div>
    </div>
  );
}
