import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Heading, Section, SectionTitle, Text } from '@/ds';
import { Stepper } from '@/components/Stepper';
import { BILL_STEPS, BILL_STEP_LABELS, ROUTES, type BillStep } from '@/app/routes';
import { StepOverview } from './StepOverview';
import { useSession } from '@/state/SessionContext';
import { UploadStep } from './UploadStep';
import { ReviewStep } from './ReviewStep';
import { HomeProfileStep } from './HomeProfileStep';
import styles from './BillAnalysisPage.module.css';

function parseStep(raw: string | null): BillStep {
  return BILL_STEPS.includes(raw as BillStep) ? (raw as BillStep) : 'upload';
}

export function BillAnalysisPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useSession();

  const requested = parseStep(params.get('step'));

  /**
   * Steps 2 and 3 depend on an analyzed bill. Deep-linking past it — or landing there
   * after the bill was removed — falls back to the furthest step that is actually valid.
   */
  const furthestValid: BillStep = state.bill === null ? 'upload' : state.billConfirmed ? 'profile' : 'review';
  const stepOrder = BILL_STEPS.indexOf(requested);
  const allowedOrder = BILL_STEPS.indexOf(furthestValid);
  const step: BillStep = stepOrder > allowedOrder ? furthestValid : requested;

  useEffect(() => {
    if (step !== requested) {
      setParams({ step }, { replace: true });
    }
  }, [step, requested, setParams]);

  const goTo = useCallback(
    (next: BillStep) => {
      setParams({ step: next });
    },
    [setParams],
  );

  // Move focus to the new step's heading so keyboard and screen-reader users follow along.
  // Skipped on first render, so landing on the page leaves focus at the top for the skip link.
  const previousStep = useRef<BillStep | null>(null);
  useEffect(() => {
    if (previousStep.current !== null && previousStep.current !== step) {
      const heading = document.getElementById('step-heading');
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    previousStep.current = step;
  }, [step]);

  const currentIndex = BILL_STEPS.indexOf(step);

  return (
    <>
      <Section scheme={1} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)', maxWidth: 'var(--max-w-lg)' }}>
            <Heading level={1}>Analyze your energy bill</Heading>
            <Text size="medium" muted>
              Upload your bill, review what wattsAI found, then tell it about your home. Three steps,
              one at a time.
            </Text>
          </div>
          <StepOverview currentIndex={currentIndex} />
        </div>
      </Section>

      <Section scheme={2} size="md">
        {/* The tracker sits with the work it is tracking, so moving forward and the rail
            filling are the same event in the same place. One flow container, because
            Section's own 80px rhythm would read as two unrelated blocks. */}
        <div className={styles.stepPanel}>
          <Stepper
            steps={BILL_STEPS.map((s) => ({ id: s, label: BILL_STEP_LABELS[s] }))}
            currentIndex={currentIndex}
          />
          {step === 'upload' ? <UploadStep onAnalyzed={() => goTo('review')} /> : null}
          {step === 'review' ? <ReviewStep onConfirm={() => goTo('profile')} /> : null}
          {step === 'profile' ? (
            <HomeProfileStep onBack={() => goTo('review')} onSubmit={() => void navigate(ROUTES.plans)} />
          ) : null}
        </div>
      </Section>

      <Section scheme={4} size="md">
        <SectionTitle
          tagline="Method"
          heading="Every number here is explained"
          text="wattsAI shows its inputs and assumptions rather than asking you to trust a figure. Open How wattsAI calculated this on the review step to see them."
          dark
          level={2}
          align="left"
        />
      </Section>
    </>
  );
}
