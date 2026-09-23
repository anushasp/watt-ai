import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Heading, Icon } from '@/ds';
import styles from './Drawer.module.css';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Built on a native modal <dialog>, so the browser provides the focus trap and the
 * inert background.
 *
 * Escape is handled explicitly rather than relying on the dialog's `cancel` event: some
 * embedded and older browsers deliver the keydown but never fire `cancel`, which leaves
 * the drawer stuck open. Both paths are wired, and closing is idempotent.
 */
export function Drawer({ open, onClose, title, children }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnTo.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => {
    onClose();
    // Return focus to whatever opened the drawer.
    returnTo.current?.focus?.();
  };

  return (
    // A modal <dialog> IS the interactive element here: these handlers implement
    // Escape-to-close and backdrop dismissal, which the rule does not model.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className={styles.drawer}
      aria-labelledby={titleId}
      onClose={handleClose}
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          handleClose();
        }
      }}
      onMouseDown={(event) => {
        // A click on the backdrop lands on the dialog element itself.
        if (event.target === ref.current) handleClose();
      }}
    >
      {open ? (
        <>
          <div className={styles.head}>
            <Heading level={2} scale="h5" id={titleId}>
              {title}
            </Heading>
            <button type="button" className={styles.close} onClick={handleClose} aria-label="Close">
              <Icon name="Close" size={20} />
            </button>
          </div>
          <div className={styles.body}>{children}</div>
        </>
      ) : null}
    </dialog>
  );
}
