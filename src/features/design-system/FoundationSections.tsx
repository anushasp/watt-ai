import { CheckListItem, Heading, Icon, Text } from '@/ds';
import { ICON_PATHS, type IconName } from '@/ds/icons/icon-data';
import { DocSection } from '@/features/docs/DocsLayout';
import {
  COLOR_GROUPS,
  FONT_TOKENS,
  LAYOUT_TOKENS,
  LEADING_TOKENS,
  RADIUS_TOKENS,
  SCHEMES,
  SCHEME_NAMES,
  SCHEME_PARTS,
  SPACE_TOKENS,
  TYPE_SCALE,
  WEIGHT_TOKENS,
} from './dsTokens';
import { displayValue } from './useTokenValues';
import {
  ColorGrid,
  RadiusScale,
  SpacingScale,
  TokenTable,
  TypographySample,
} from './components/TokenDisplay';
import styles from './components/DesignSystemParts.module.css';

interface Props {
  values: Readonly<Record<string, string>>;
}

const HEADING_SAMPLES: Readonly<Record<string, string>> = {
  '--text-h1': 'Smarter energy starts with your bill',
  '--text-h2': 'The numbers that matter most',
  '--text-h3': 'A better plan is waiting for you',
  '--text-h4': 'Understand your bill',
  '--text-h5': 'Night Charge Flex',
  '--text-h6': 'Plan details',
};

const BODY_SAMPLES: Readonly<Record<string, string>> = {
  '--text-large': 'Upload your electricity bill to understand usage and discover savings.',
  '--text-medium': 'wattsAI reads the fine print so you do not have to.',
  '--text-regular': 'Plans are costed against your bill and home profile, not an average household.',
  '--text-small': 'Est. savings vs your current plan',
  '--text-tiny': 'Based on your analyzed bill · Your home profile',
};

export function OverviewSection() {
  return (
    <DocSection id="overview" title="Overview">
      <Text>
        The WattAI design system is the single source of the product&rsquo;s foundations and
        reusable components. Everything on this page is rendered from that system: colour swatches
        are filled with <code>var(--token)</code>, the values beside them are read from the live
        stylesheet at runtime, and every component example is the real component, imported from{' '}
        <code>@/ds</code>.
      </Text>
      <Text>
        Nothing here is a copy. If a token changes in <code>src/styles/tokens/</code>, this page
        changes with it, which is what keeps documentation from quietly going stale.
      </Text>
      <Heading level={3} scale="h6">
        Principles
      </Heading>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <CheckListItem>
          <strong>Consistency</strong> — one brand hue, one type scale, one spacing scale. Components
          reference semantic tokens rather than raw values.
        </CheckListItem>
        <CheckListItem>
          <strong>Accessibility</strong> — semantics, focus and announcement behaviour are part of a
          component&rsquo;s contract, not something applied afterwards.
        </CheckListItem>
        <CheckListItem>
          <strong>Composability</strong> — small primitives compose into cards and sections; no
          feature reimplements a button or a band.
        </CheckListItem>
        <CheckListItem>
          <strong>Responsive behaviour</strong> — tokens flip at a single 767px breakpoint and grids
          reflow intrinsically, so components adapt without per-screen variants.
        </CheckListItem>
        <CheckListItem>
          <strong>Predictable APIs</strong> — variants are string unions, booleans are opt-in, and
          every component accepts the same base props.
        </CheckListItem>
        <CheckListItem>
          <strong>Clear UI states</strong> — default, hover, focus, disabled, error and empty are
          designed rather than inherited.
        </CheckListItem>
        <CheckListItem>
          <strong>Support for AI experiences</strong> — components exist to label simulated output,
          announce it politely, and show the working behind a recommendation.
        </CheckListItem>
      </ul>
    </DocSection>
  );
}

export function ColorsSection({ values }: Props) {
  return (
    <DocSection id="colors" title="Colors">
      <Text>
        Near-black ink on white and grey, with a single brand hue. Every swatch below is filled with
        the token itself, so what you see is what the product uses.
      </Text>

      {COLOR_GROUPS.map((group) => (
        <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <Heading level={3} scale="h6">
            {group.title}
          </Heading>
          <Text size="small" muted>
            {group.description}
          </Text>
          <ColorGrid tokens={group.tokens} values={values} />
        </div>
      ))}

      <Heading level={3} scale="h6">
        Color schemes
      </Heading>
      <Text size="small" muted>
        Sections alternate through four bands. Each scheme is a five-token set, so a component can
        be placed on any band without knowing which one it is.
      </Text>
      <div className={styles.tableWrap}>
        <table className={styles.tokenTable}>
          <caption className="sr-only">The four color schemes and their five tokens each</caption>
          <thead>
            <tr>
              <th scope="col">Scheme</th>
              {SCHEME_PARTS.map((part) => (
                <th key={part} scope="col">
                  {part}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCHEMES.map((scheme) => (
              <tr key={scheme}>
                <th scope="row">{SCHEME_NAMES[scheme]}</th>
                {SCHEME_PARTS.map((part) => {
                  const token = `--scheme-${scheme}-${part}`;
                  return (
                    <td key={part}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                        <span
                          aria-hidden="true"
                          style={{
                            width: 18,
                            height: 18,
                            flexShrink: 0,
                            borderRadius: 4,
                            border: '1px solid var(--border-default)',
                            background: `var(${token})`,
                          }}
                        />
                        <span className={styles.mono}>{displayValue(values[token])}</span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DocSection>
  );
}

export function TypographySection({ values }: Props) {
  return (
    <DocSection id="typography" title="Typography">
      <Text>
        Three families with strictly separated jobs, and one scale that steps down at 767px. Resize
        the window and the measured values below update, because they are read from the stylesheet
        rather than written here.
      </Text>

      <Heading level={3} scale="h6">
        Families
      </Heading>
      <TokenTable caption="Font family tokens" tokens={FONT_TOKENS} values={values} />

      <Heading level={3} scale="h6">
        Headings
      </Heading>
      <div>
        {TYPE_SCALE.filter((t) => t.name in HEADING_SAMPLES).map((token) => (
          <TypographySample
            key={token.name}
            token={token}
            sample={HEADING_SAMPLES[token.name] ?? ''}
            values={values}
            fontToken="--font-display"
            weightToken="--weight-display"
            leading={token.name === '--text-h6' ? '--leading-h6' : '--leading-heading'}
            tracking="--tracking-heading"
          />
        ))}
      </div>

      <Heading level={3} scale="h6">
        Body, labels and captions
      </Heading>
      <div>
        {TYPE_SCALE.filter((t) => t.name in BODY_SAMPLES).map((token) => (
          <TypographySample
            key={token.name}
            token={token}
            sample={BODY_SAMPLES[token.name] ?? ''}
            values={values}
            fontToken="--font-body"
            weightToken="--weight-regular"
            leading="--leading-body"
          />
        ))}
      </div>

      <Heading level={3} scale="h6">
        Statistic numerals
      </Heading>
      <TypographySample
        token={{ name: '--text-stat', purpose: 'Headline statistic. The only use of the numeric family' }}
        sample="$540"
        values={values}
        fontToken="--font-numeric"
        weightToken="--weight-bold"
      />

      <Heading level={3} scale="h6">
        Weights and leading
      </Heading>
      <TokenTable caption="Weight tokens" tokens={WEIGHT_TOKENS} values={values} />
      <TokenTable caption="Leading and tracking tokens" tokens={LEADING_TOKENS} values={values} />
    </DocSection>
  );
}

export function SpacingSection({ values }: Props) {
  return (
    <DocSection id="spacing" title="Spacing">
      <Text>
        An eight-step scale. Each bar below is drawn at the token&rsquo;s real width, so the steps
        are compared rather than described.
      </Text>
      <SpacingScale tokens={SPACE_TOKENS} values={values} />

      <Heading level={3} scale="h6">
        Layout tokens
      </Heading>
      <Text size="small" muted>
        Page rhythm and content measure. The gutter, section rhythm and navbar height all narrow
        below 767px.
      </Text>
      <TokenTable caption="Layout tokens" tokens={LAYOUT_TOKENS} values={values} />
    </DocSection>
  );
}

export function RadiusSection({ values }: Props) {
  return (
    <DocSection id="radius" title="Border Radius">
      <Text>
        Seven radii, each tied to an element type. Everything is rounded and nothing is
        pill-shaped, which is a deliberate constraint of the system.
      </Text>
      <RadiusScale tokens={RADIUS_TOKENS} values={values} />
    </DocSection>
  );
}

export function ElevationSection({ values }: Props) {
  return (
    <DocSection id="elevation" title="Elevation & Borders">
      <Text>
        <strong>This system defines no shadows.</strong> There is no elevation scale and no
        <code> box-shadow</code> anywhere outside focus rings. Separation is carried entirely by a
        1px hairline and a change of background.
      </Text>
      <Text size="small" muted>
        Documented here rather than omitted, because the absence is a decision. Adding a shadow to a
        component would put it outside the system.
      </Text>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-16)' }}>
        <div style={{ padding: 'var(--space-24)', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)' }}>
          <Text size="small" weight={600}>
            White card on a light band
          </Text>
          <Text size="tiny" muted>
            --surface-card with --border-default
          </Text>
        </div>
        <div style={{ padding: 'var(--space-24)', background: 'var(--surface-card-muted)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)' }}>
          <Text size="small" weight={600}>
            Muted card
          </Text>
          <Text size="tiny" muted>
            --surface-card-muted with --border-default
          </Text>
        </div>
        <div className="on-dark" style={{ padding: 'var(--space-24)', background: 'var(--surface-card-dark)', border: '1px solid var(--border-on-dark)', borderRadius: 'var(--radius-card)' }}>
          <Text size="small" weight={600} dark>
            Card on a dark band
          </Text>
          <Text size="tiny" dark muted>
            --surface-card-dark with --border-on-dark
          </Text>
        </div>
      </div>
      <TokenTable
        caption="Border tokens"
        tokens={[
          { name: '--border-width', purpose: 'Hairline width used across the system' },
          { name: '--border-default', purpose: 'Hairline on light bands' },
          { name: '--border-on-dark', purpose: 'Hairline on dark bands' },
        ]}
        values={values}
      />
    </DocSection>
  );
}

const ICON_NAMES = Object.keys(ICON_PATHS) as IconName[];

export function IconsSection() {
  return (
    <DocSection id="icons" title="Icons">
      <Text>
        {ICON_NAMES.length} glyphs on a 24px grid, vendored from the source file as path data and
        rendered in <code>currentColor</code>. There is no icon font and no second icon library.
      </Text>
      <Text size="small" muted>
        Sanctioned sizes: 48px for feature icons, 32px for tab icons, 24px inline. An icon with no{' '}
        <code>title</code> is decorative and hidden from assistive technology; passing one makes it
        an image with an accessible name.
      </Text>
      <div className={styles.iconGrid}>
        {ICON_NAMES.map((name) => (
          <div key={name} className={styles.iconCell}>
            <Icon name={name} size={24} />
            <code className={styles.iconName}>{name}</code>
          </div>
        ))}
      </div>
      <Heading level={3} scale="h6">
        Sizes
      </Heading>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-24)', flexWrap: 'wrap' }}>
        {[24, 32, 48].map((size) => (
          <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-8)' }}>
            <Icon name="Savings" size={size} />
            <span className={styles.mono}>{size}px</span>
          </div>
        ))}
      </div>
    </DocSection>
  );
}
