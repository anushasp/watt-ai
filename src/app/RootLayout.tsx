import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Footer, Navbar } from '@/ds';
import { useScrollToTopOnNavigate } from '@/hooks/useScrollToTopOnNavigate';
import { FOOTER_COLUMNS, NAV_ITEMS } from './routes';
import styles from './RootLayout.module.css';

const TITLES: Record<string, string> = {
  '/': 'wattsAI — Understand your energy bill',
  '/bill-analysis': 'Bill Analysis — wattsAI',
  '/plans': 'Plan Recommendations — wattsAI',
  '/dashboard': 'Energy Dashboard — wattsAI',
  '/copilot': 'AI Copilot — wattsAI',
  '/docs': 'Engineering Documentation — wattsAI',
  '/docs/architecture': 'Technical Architecture — wattsAI',
  '/design-system': 'Design System — wattsAI',
};

export function RootLayout() {
  const location = useLocation();
  const announcerRef = useRef<HTMLDivElement>(null);

  // A new page opens at its top, whatever the reader had scrolled past on the last one.
  useScrollToTopOnNavigate();

  useEffect(() => {
    const title = TITLES[location.pathname] ?? 'Page not found — wattsAI';
    document.title = title;
    if (announcerRef.current) announcerRef.current.textContent = title;
  }, [location.pathname]);

  return (
    <>
      <a className={styles.skipLink} href="#main">
        Skip to main content
      </a>
      <Navbar items={NAV_ITEMS} />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer columns={FOOTER_COLUMNS} />
      <div ref={announcerRef} role="status" aria-live="polite" className="sr-only" />
    </>
  );
}
