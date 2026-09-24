import { useId, useRef, useState, type DragEvent } from 'react';
import { Button, Icon, Text, cn } from '@/ds';
import styles from './Dropzone.module.css';

export const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;
export const ACCEPTED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'] as const;
export const MAX_BYTES = 10 * 1024 * 1024;

export interface DropzoneProps {
  /** Called with a validated file. */
  onFile: (file: File) => void;
  onReject: (message: string) => void;
  disabled?: boolean | undefined;
  error?: string | null | undefined;
}

export function validateFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const extensionOk = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const typeOk = (ACCEPTED_TYPES as readonly string[]).includes(file.type);
  if (!extensionOk && !typeOk) {
    return `${file.name} is not a supported file. Upload a PDF, JPG or PNG.`;
  }
  if (file.size > MAX_BYTES) {
    return `${file.name} is larger than 10 MB. Upload a smaller file.`;
  }
  return null;
}

/**
 * Keyboard operability does not rest on a label wrapping a hidden input — that pattern
 * leaves the control unreachable in several screen-reader and browser combinations.
 * The drop area is a real <button> with an accessible name, so Tab reaches it and both
 * Enter and Space open the picker. Drag-and-drop is layered on top as an enhancement.
 */
export function Dropzone({ onFile, onReject, disabled = false, error }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const hintId = useId();

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const accept = (file: File | undefined) => {
    if (!file) return;
    const problem = validateFile(file);
    if (problem) onReject(problem);
    else onFile(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    accept(event.dataTransfer.files[0]);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <button
        type="button"
        className={cn(styles.zone, dragging && styles.dragging, error && styles.invalid)}
        onClick={openPicker}
        disabled={disabled}
        aria-describedby={hintId}
      >
        <Icon name="Save2" size={48} />
        <span style={{ fontSize: 'var(--text-medium)', fontWeight: 'var(--weight-medium)' }}>
          Choose a bill, or drop one here
        </span>
        <Text as="span" size="small" muted id={hintId}>
          PDF, JPG or PNG, up to 10 MB. Nothing is uploaded to a server.
        </Text>
      </button>

      <input
        ref={inputRef}
        type="file"
        className={styles.hiddenInput}
        accept={ACCEPTED_EXTENSIONS.join(',')}
        tabIndex={-1}
        aria-hidden="true"
        data-testid="bill-file-input"
        onChange={(event) => {
          accept(event.target.files?.[0]);
          // Allow re-selecting the same file after a remove.
          event.target.value = '';
        }}
      />
    </div>
  );
}

export interface SelectedFileProps {
  name: string;
  size: number;
  busy: boolean;
  /** True only while the analysis itself is running, not while the file is being read. */
  analyzing: boolean;
  onReplace: () => void;
  onRemove: () => void;
  onAnalyze: () => void;
  analyzed: boolean;
}

export function SelectedFile({
  name,
  size,
  busy,
  analyzing,
  onReplace,
  onRemove,
  onAnalyze,
  analyzed,
}: SelectedFileProps) {
  return (
    <div className={styles.filled}>
      <div className={styles.fileRow}>
        <Icon name="Contract" size={32} />
        <span className={styles.fileMeta}>
          <span className={styles.fileName}>{name}</span>
          <Text as="span" size="small" muted>
            {(size / 1024).toFixed(0)} KB · {busy && !analyzing ? 'reading' : 'ready to analyze'}
          </Text>
        </span>
      </div>
      {busy ? (
        <div
          className={styles.progress}
          data-phase={analyzing ? 'analyzing' : 'reading'}
          role="progressbar"
          aria-label={analyzing ? 'Analyzing the bill' : 'Reading the file'}
        />
      ) : null}
      <div className={styles.actions}>
        <Button onClick={onAnalyze} disabled={busy}>
          {analyzing ? 'Analyzing' : analyzed ? 'Analyze Again' : 'Analyze Bill'}
        </Button>
        <Button variant="secondary" onClick={onReplace} disabled={busy}>
          Replace File
        </Button>
        <Button variant="link" trailingIcon="Close" onClick={onRemove} disabled={busy}>
          Remove File
        </Button>
      </div>
    </div>
  );
}
