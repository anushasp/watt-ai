import { useRef, useState } from 'react';
import { Button, Heading, Icon, Text } from '@/ds';
import { Dropzone, SelectedFile } from '@/components/Dropzone';
import { DemoBanner } from '@/components/DemoBanner';
import { SAMPLE_BILL } from '@/mocks/bills';
import { AnalysisProgress } from './AnalysisProgress';
import { useSession } from '@/state/SessionContext';

export interface UploadStepProps {
  onAnalyzed: () => void;
}

export function UploadStep({ onAnalyzed }: UploadStepProps) {
  const { state, dispatch } = useSession();
  const [announcement, setAnnouncement] = useState('');
  const timers = useRef<number[]>([]);

  const announce = (message: string) => setAnnouncement(message);

  const analyze = (usedSample: boolean) => {
    dispatch({ type: 'ANALYZE_START' });
    announce('Analyzing the bill.');
    const id = window.setTimeout(() => {
      dispatch({ type: 'ANALYZE_COMPLETE', bill: SAMPLE_BILL, usedSample });
      announce('Analysis ready. Moving to review.');
      onAnalyzed();
    }, 900);
    timers.current.push(id);
  };

  const onFile = (file: File) => {
    dispatch({ type: 'UPLOAD_START', file: { name: file.name, size: file.size, type: file.type } });
    announce(`${file.name} selected.`);
    const id = window.setTimeout(() => {
      dispatch({ type: 'UPLOAD_COMPLETE' });
      announce(`${file.name} is ready to analyze.`);
    }, 600);
    timers.current.push(id);
  };

  const remove = () => {
    dispatch({ type: 'RESET_ANALYSIS' });
    announce('File removed. The previous analysis and its recommendations no longer apply.');
  };

  const busy = state.uploadStatus === 'uploading' || state.uploadStatus === 'processing';
  const hasFile = state.file !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <Heading level={2} scale="h3" id="step-heading" tabIndex={-1}>
          Upload your bill
        </Heading>
        <Text size="medium" muted>
          Drop a PDF, JPG or PNG here, or choose one from your device. Your file stays in your
          browser.
        </Text>
      </div>

      {state.bill !== null ? (
        <div
          role="status"
          style={{
            display: 'flex',
            gap: 'var(--space-12)',
            padding: 'var(--space-16)',
            borderRadius: 'var(--radius-field)',
            border: '1px solid var(--watercourse)',
            background: 'var(--watercourse-lightest)',
          }}
        >
          <Icon name="Check" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <Text as="span" size="small">
            A bill has been analyzed. Replacing or removing it clears the analysis and every
            recommendation built from it.
          </Text>
        </div>
      ) : null}

      {hasFile ? (
        <SelectedFile
          name={state.file?.name ?? ''}
          size={state.file?.size ?? 0}
          busy={busy}
          analyzing={state.uploadStatus === 'processing'}
          analyzed={state.bill !== null}
          onAnalyze={() => analyze(false)}
          onReplace={remove}
          onRemove={remove}
        />
      ) : (
        <Dropzone
          onFile={onFile}
          onReject={(message) => {
            dispatch({ type: 'UPLOAD_ERROR', message });
            announce(message);
          }}
          disabled={busy}
          error={state.uploadError}
        />
      )}

      {state.uploadError ? (
        <Text size="small" style={{ color: 'var(--feedback-error)', fontWeight: 500 }}>
          {state.uploadError}
        </Text>
      ) : null}

      {/* Shown once there is something to report on, and driven entirely by session state.
          `busy` is part of the test because the sample-bill path analyzes without a file. */}
      {hasFile || busy || state.bill !== null ? (
        <AnalysisProgress status={state.uploadStatus} bill={state.bill} error={state.uploadError} />
      ) : null}

      <div style={{ display: 'flex', gap: 'var(--space-16)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="secondary" onClick={() => analyze(true)} disabled={busy}>
          {busy && state.uploadStatus === 'processing' ? 'Analyzing' : 'Try a Sample Bill'}
        </Button>
        <Text as="span" size="small" muted>
          No file needed. Loads a worked example you can step through.
        </Text>
      </div>

      <DemoBanner>
        Nothing is read from your file and nothing is sent to a server. Choosing a file and using the
        sample both load the same clearly labelled sample analysis.
      </DemoBanner>

      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
