import { useId, useRef, type ReactNode } from 'react';
import { Text } from '@/ds';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import styles from './ChartFrame.module.css';

export interface LegendEntry {
  readonly label: string;
  readonly color: string;
}

export interface ChartDatum {
  readonly label: string;
  readonly values: readonly string[];
}

export interface ChartFrameProps {
  title: string;
  /** One sentence describing what the chart shows. Also becomes the SVG <desc>. */
  description: string;
  width: number;
  height: number;
  legend?: readonly LegendEntry[] | undefined;
  /** Column headers for the screen-reader data table. */
  columns?: readonly string[] | undefined;
  data?: readonly ChartDatum[] | undefined;
  children: ReactNode;
}

/**
 * Wraps every chart with an accessible name, a description and a visually hidden data
 * table, so the same information is available without seeing the graphic.
 */
export function ChartFrame({
  title,
  description,
  width,
  height,
  legend,
  columns,
  data,
  children,
}: ChartFrameProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  // Charts draw themselves when the reader reaches them, not when the route mounts.
  const ref = useRef<HTMLElement>(null);
  const seen = useInViewOnce(ref);
  return (
    <figure
      ref={ref}
      className={styles.frame}
      style={{ margin: 0 }}
      data-chart-inview={seen ? 'true' : 'false'}
    >
      <figcaption className={styles.caption}>
        <Text as="span" size="small" weight={600}>
          {title}
        </Text>
        <Text as="span" size="small" muted>
          {description}
        </Text>
      </figcaption>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        {children}
      </svg>
      {legend && legend.length > 0 ? (
        <ul className={styles.legend}>
          {legend.map((entry) => (
            <li key={entry.label} className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: entry.color }} />
              {entry.label}
            </li>
          ))}
        </ul>
      ) : null}
      {columns && data ? (
        // The wrapper carries sr-only, not the table: a <table> treats width as a minimum
        // and ignores overflow, so hiding it directly widens the page on small screens.
        <div className="sr-only">
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">Label</th>
              {columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.values.map((v, i) => (
                  <td key={i}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : null}
    </figure>
  );
}
