import { Link } from 'react-router';
import { CompanyLogo } from '../brand/CompanyLogo';
import { Text } from '../primitives/Text';
import styles from './Footer.module.css';

export interface FooterColumn {
  readonly title: string;
  readonly links: readonly { readonly label: string; readonly to: string }[];
}

export interface FooterProps {
  columns: readonly FooterColumn[];
  note?: string | undefined;
}

/** Fully prop-driven — the design system hardcoded every link. */
export function Footer({ columns, note }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <h2 className="sr-only">Site footer</h2>
        <div className={styles.columns}>
          {columns.map((column) => (
            <div key={column.title} className={styles.column}>
              <h3 className={styles.columnTitle}>{column.title}</h3>
              <ul className={styles.list}>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} style={{ fontSize: 'var(--text-small)' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.bottom}>
          <CompanyLogo />
          <Text as="span" size="small" muted>
            {note ?? 'A demonstration project. Every figure shown is simulated.'}
          </Text>
        </div>
      </div>
    </footer>
  );
}
