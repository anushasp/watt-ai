import { useId, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { Heading, Icon, Text } from '@/ds';
import { DOC_PAGES, type DocSectionLink } from './docsNav';
import styles from './DocsLayout.module.css';

export interface DocsLayoutProps {
  title: string;
  intro: string;
  /** Sections of the page currently being read, linked from the sidebar. */
  sections: readonly DocSectionLink[];
  children: ReactNode;
}

/**
 * Documentation shell: persistent sidebar on desktop, collapsible navigation on mobile,
 * and a constrained reading measure for the content.
 *
 * It sits inside the app's existing RootLayout, so the product navbar and footer are
 * unchanged — this only governs the area between them.
 */
export function DocsLayout({ title, intro, sections, children }: DocsLayoutProps) {
  const [open, setOpen] = useState(false);
  const navId = useId();
  const { pathname } = useLocation();

  return (
    <div className={styles.shell}>
      <div className={styles.sidebar}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={navId}
          onClick={() => setOpen((v) => !v)}
        >
          On this page
          <Icon name="ChevronRight" size={20} className={styles.chevron} />
        </button>

        <nav
          id={navId}
          className={styles.nav}
          data-collapsed={open ? 'false' : 'true'}
          aria-label="Documentation"
        >
          {DOC_PAGES.map((page) => {
            const current = page.to === pathname;
            return (
              <div key={page.to} className={styles.group}>
                <Link
                  to={page.to}
                  className={styles.pageLink}
                  aria-current={current ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {page.label}
                </Link>
                {current ? (
                  <ul className={styles.list}>
                    {sections.map((section) => (
                      <li key={section.id} className={styles.item}>
                        {/* A plain anchor: the browser handles in-page scrolling, and
                            a11y.css supplies scroll-margin so the navbar never covers it. */}
                        <a href={`#${section.id}`} onClick={() => setOpen(false)}>
                          {section.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Engineering</span>
          <Heading level={1} scale="h2">
            {title}
          </Heading>
          <Text size="medium" muted>
            {intro}
          </Text>
        </header>
        {children}
      </div>
    </div>
  );
}

export interface DocSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

/** One documentation section, with the heading the sidebar links to. */
export function DocSection({ id, title, children }: DocSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`}>
      <Heading level={2} scale="h4" id={`${id}-heading`}>
        {title}
      </Heading>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-24)',
          marginTop: 'var(--space-24)',
        }}
      >
        {children}
      </div>
    </section>
  );
}
