import { Text } from '@/ds';
import { StatusTag, type DocStatus } from './components/StatusTag';
import styles from './DocsPage.module.css';

export interface StatusRow {
  readonly capability: string;
  readonly status: DocStatus;
  readonly note: string;
}

export interface StatusTableProps {
  caption: string;
  /** Column header for the first column, e.g. "Capability". */
  itemHeader: string;
  rows: readonly StatusRow[];
}

/** A real table, so the status of each capability is readable without seeing the badges. */
export function StatusTable({ caption, itemHeader, rows }: StatusTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.statusTable}>
        <caption className={styles.tableCaption}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{itemHeader}</th>
            <th scope="col">Status</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.capability}>
              <th scope="row">{row.capability}</th>
              <td className={styles.statusCell}>
                <StatusTag status={row.status} />
              </td>
              <td>
                <Text as="span" size="small" muted>
                  {row.note}
                </Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
