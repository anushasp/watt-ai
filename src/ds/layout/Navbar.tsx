import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { Button } from '../core/Button';
import { CompanyLogo } from '../brand/CompanyLogo';
import { Icon } from '../icons/Icon';
import styles from './Navbar.module.css';

export interface NavItem {
  readonly to: string;
  readonly label: string;
}

export interface NavbarProps {
  items: readonly NavItem[];
  ctaLabel?: string | undefined;
  ctaTo?: string | undefined;
}

/**
 * A simple five-link bar. The design system's mega menu is deliberately not ported —
 * every destination in this app is a top-level page, so a dropdown adds nothing.
 */
export function Navbar({ items, ctaLabel = 'Analyze My Bill', ctaTo = '/bill-analysis' }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // The drawer is a modal <dialog>, so the browser supplies the focus trap and Escape.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Any navigation closes the drawer. Focus must be moved deliberately: closing a modal
  // <dialog> otherwise drops focus onto <body>, stranding keyboard and screen-reader users.
  useEffect(() => {
    setOpen((wasOpen) => {
      if (wasOpen) toggleRef.current?.focus();
      return false;
    });
  }, [location.pathname]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.brand} aria-label="wattsAI, go to the home page">
        <CompanyLogo />
      </Link>

      <nav className={styles.nav} aria-label="Main">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={() => styles.link} end={item.to === '/'}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.actions}>
        <Button variant="secondary" size="small" onClick={() => void navigate(ctaTo)}>
          {ctaLabel}
        </Button>
      </div>

      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        {/* The icon set has no hamburger glyph, and the design system's own note says the
            closed state is a "Menu" button, since the source only drew the open state. */}
        {open ? <Icon name="Close" size={24} /> : 'Menu'}
      </button>

      <dialog
        ref={dialogRef}
        className={styles.drawer}
        aria-label="Main menu"
        onClose={() => setOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onKeyDown={(event) => {
          // Not every browser fires the dialog's native cancel event on Escape.
          if (event.key === 'Escape') {
            event.preventDefault();
            close();
          }
        }}
      >
        {open ? (
          <>
        <div className={styles.drawerHead}>
          <CompanyLogo />
          <button
            type="button"
            className={styles.toggle}
            style={{ display: 'inline-flex' }}
            aria-label="Close menu"
            onClick={close}
          >
            <Icon name="Close" size={24} />
          </button>
        </div>
        <nav className={styles.drawerNav} aria-label="Menu">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={() => styles.drawerLink}
              end={item.to === '/'}
              onClick={close}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.drawerActions}>
          <Button fullWidth onClick={close}>
            Close menu
          </Button>
        </div>
          </>
        ) : null}
      </dialog>
    </header>
  );
}
