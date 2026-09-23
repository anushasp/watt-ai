import type { ReactNode } from 'react';
import { Heading, Text } from '@/ds';
import { displayValue } from '../useTokenValues';
import type { TokenEntry } from '../dsTokens';
import styles from './DesignSystemParts.module.css';

interface WithValues {
  /** Live values keyed by token name, read from the stylesheet at runtime. */
  values: Readonly<Record<string, string>>;
}

/** A colour swatch. The fill is `var(--token)`, never a copied hex. */
export function ColorSwatch({ token, values }: { token: TokenEntry } & WithValues) {
  return (
    <div className={styles.swatch}>
      <div className={styles.chip}>
        <div className={styles.chipFill} style={{ background: `var(${token.name})` }} />
      </div>
      <div className={styles.swatchBody}>
        <code className={styles.tokenName}>{token.name}</code>
        <span className={styles.tokenValue}>{displayValue(values[token.name])}</span>
        <span className={styles.tokenPurpose}>{token.purpose}</span>
      </div>
    </div>
  );
}

export function ColorGrid({ tokens, values }: { tokens: readonly TokenEntry[] } & WithValues) {
  return (
    <div className={styles.swatchGrid}>
      {tokens.map((token) => (
        <ColorSwatch key={token.name} token={token} values={values} />
      ))}
    </div>
  );
}

/** Name / live value / purpose, for tokens that are not colours. */
export function TokenTable({
  caption,
  tokens,
  values,
}: { caption: string; tokens: readonly TokenEntry[] } & WithValues) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.tokenTable}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Value</th>
            <th scope="col">Purpose</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.name}>
              <th scope="row">{token.name}</th>
              <td className={styles.mono}>{displayValue(values[token.name])}</td>
              <td>
                <Text as="span" size="small" muted>
                  {token.purpose}
                </Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A live type specimen rendered with the real token, beside its measured values. */
export function TypographySample({
  token,
  sample,
  values,
  fontToken = '--font-display',
  weightToken = '--weight-display',
  leading,
  tracking,
}: {
  token: TokenEntry;
  sample: string;
  fontToken?: string;
  weightToken?: string;
  leading?: string;
  tracking?: string;
} & WithValues) {
  return (
    <div className={styles.specimen}>
      <span
        style={{
          fontFamily: `var(${fontToken})`,
          fontWeight: `var(${weightToken})`,
          fontSize: `var(${token.name})`,
          lineHeight: leading ? `var(${leading})` : undefined,
          letterSpacing: tracking ? `var(${tracking})` : undefined,
          color: 'var(--text-primary)',
          display: 'block',
          overflowWrap: 'anywhere',
        }}
      >
        {sample}
      </span>
      <div className={styles.specimenMeta}>
        <code className={styles.tokenName}>{token.name}</code>
        <span className={styles.mono}>{displayValue(values[token.name])}</span>
        <span className={styles.mono}>weight {displayValue(values[weightToken])}</span>
        {leading ? <span className={styles.mono}>leading {displayValue(values[leading])}</span> : null}
        {tracking ? (
          <span className={styles.mono}>tracking {displayValue(values[tracking])}</span>
        ) : null}
        <span className={styles.tokenPurpose}>{token.purpose}</span>
      </div>
    </div>
  );
}

/** Each spacing step drawn at its real width. */
export function SpacingScale({ tokens, values }: { tokens: readonly TokenEntry[] } & WithValues) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {tokens.map((token) => (
        <li key={token.name} className={styles.spacingRow}>
          <span className={styles.spacingLabel}>
            <code className={styles.tokenName}>{token.name}</code>
            <span className={styles.mono}>{displayValue(values[token.name])}</span>
          </span>
          <span
            className={styles.spacingBar}
            style={{ width: `var(${token.name})` }}
            aria-hidden="true"
          />
          <span className={styles.tokenPurpose}>{token.purpose}</span>
        </li>
      ))}
    </ul>
  );
}

/** Each radius drawn on a real box. */
export function RadiusScale({ tokens, values }: { tokens: readonly TokenEntry[] } & WithValues) {
  return (
    <div className={styles.radiusGrid}>
      {tokens.map((token) => (
        <div key={token.name} className={styles.radiusBox}>
          <div className={styles.radiusSample} style={{ borderRadius: `var(${token.name})` }} />
          <code className={styles.tokenName}>{token.name}</code>
          <span className={styles.mono}>{displayValue(values[token.name])}</span>
          <span className={styles.tokenPurpose}>{token.purpose}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * The consistent documentation frame every component on this page uses:
 * name, purpose, live preview, then variants, states, usage and accessibility notes.
 */
export function ComponentPreview({
  name,
  source,
  description,
  children,
  usage,
  accessibility,
  headingLevel = 3,
}: {
  name: string;
  source: string;
  description: string;
  children: ReactNode;
  usage: string;
  accessibility: string;
  headingLevel?: 3 | 4;
}) {
  return (
    <article className={styles.preview}>
      <div className={styles.previewHead}>
        <Heading level={headingLevel} scale="h6">
          {name}
        </Heading>
        <code className={styles.previewSource}>{source}</code>
      </div>
      <Text size="small" muted>
        {description}
      </Text>
      {children}
      <div className={styles.notes}>
        <div className={styles.noteRow}>
          <span className={styles.noteKey}>Usage</span>
          <Text as="span" size="small" muted>
            {usage}
          </Text>
        </div>
        <div className={styles.noteRow}>
          <span className={styles.noteKey}>A11y</span>
          <Text as="span" size="small" muted>
            {accessibility}
          </Text>
        </div>
      </div>
    </article>
  );
}

/** A preview stage. `tone="dark"` checks a component's alternate treatment. */
export function Stage({
  children,
  tone = 'light',
  layout = 'row',
  label,
}: {
  children: ReactNode;
  tone?: 'light' | 'dark';
  layout?: 'row' | 'stack';
  label?: string;
}) {
  return (
    <div className={styles.stage} data-tone={tone} data-layout={layout} aria-label={label}>
      {children}
    </div>
  );
}

/** A labelled state within a preview. */
export function StateExample({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.state}>
      <span className={styles.stateLabel}>{label}</span>
      {children}
    </div>
  );
}

export function StateGrid({ children }: { children: ReactNode }) {
  return <div className={styles.stateGrid}>{children}</div>;
}
