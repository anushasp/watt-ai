import { Tag } from '@/ds';

/**
 * Implementation status of a documented capability.
 *
 * These labels describe what is actually in this repository. A capability is only marked
 * Implemented when it exists in the code today.
 */
export type DocStatus = 'implemented' | 'in-progress' | 'planned';

const LABELS: Readonly<Record<DocStatus, string>> = {
  implemented: 'Implemented',
  'in-progress': 'In Progress',
  planned: 'Planned',
};

export interface StatusTagProps {
  status: DocStatus;
}

/** Built on the design system's Tag so status labels match every other label in the app. */
export function StatusTag({ status }: StatusTagProps) {
  if (status === 'implemented') return <Tag accent>{LABELS.implemented}</Tag>;
  if (status === 'in-progress') {
    return (
      <Tag style={{ border: '1px solid var(--border-default)', background: 'var(--neutral-white)' }}>
        {LABELS['in-progress']}
      </Tag>
    );
  }
  return (
    <Tag
      style={{
        border: '1px dashed var(--ink-35)',
        background: 'transparent',
        color: 'var(--text-muted)',
      }}
    >
      {LABELS.planned}
    </Tag>
  );
}
