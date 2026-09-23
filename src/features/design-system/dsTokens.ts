/**
 * Token NAMES and their purpose. Values are deliberately absent — they are read at runtime
 * from the live stylesheet by `useTokenValues`, so this file cannot drift from the system.
 */
export interface TokenEntry {
  readonly name: string;
  readonly purpose: string;
}

export interface TokenGroup {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly tokens: readonly TokenEntry[];
}

export const COLOR_GROUPS: readonly TokenGroup[] = [
  {
    id: 'brand',
    title: 'Brand',
    description:
      'One hue, the Watercourse green. The mid value is reserved for primary buttons; the dark values carry the scheme 4 band.',
    tokens: [
      { name: '--watercourse-lightest', purpose: 'Tinted background for positive emphasis' },
      { name: '--watercourse-lighter', purpose: 'Tinted background, heavier' },
      { name: '--watercourse-light', purpose: 'Rarely used mid tint' },
      { name: '--watercourse', purpose: 'Primary action fill. The only place the brand hue appears' },
      { name: '--watercourse-dark', purpose: 'Primary action hover' },
      { name: '--watercourse-darker', purpose: 'Scheme 4 band background' },
      { name: '--watercourse-darkest', purpose: 'Card fill on a scheme 4 band' },
    ],
  },
  {
    id: 'neutrals',
    title: 'Neutrals',
    description: 'The greyscale the interface is mostly built from. Ink is near-black, not pure black.',
    tokens: [
      { name: '--neutral-white', purpose: 'Page and card background' },
      { name: '--neutral-lightest', purpose: 'Scheme 2 band, muted card fill' },
      { name: '--neutral-lighter', purpose: 'Scheme 3 band, image placeholder' },
      { name: '--neutral-light', purpose: 'Disabled and low-emphasis edges' },
      { name: '--neutral', purpose: 'Mid grey' },
      { name: '--neutral-dark', purpose: 'Dark grey' },
      { name: '--neutral-darker', purpose: 'Near-ink grey' },
      { name: '--neutral-darkest', purpose: 'Body text and headings' },
    ],
  },
  {
    id: 'transparent',
    title: 'Transparent inks',
    description:
      'Tints rather than solid greys, so they sit correctly on any band. Used for secondary fills, field backgrounds and hairlines.',
    tokens: [
      { name: '--ink-5', purpose: 'Secondary button and field fill' },
      { name: '--ink-10', purpose: 'Secondary button hover' },
      { name: '--ink-15', purpose: 'Hairline border on light bands' },
      { name: '--ink-20', purpose: 'Inactive carousel dot' },
      { name: '--ink-35', purpose: 'Dashed borders, chart axis emphasis' },
      { name: '--ink-60', purpose: 'Muted text and placeholders' },
      { name: '--white-5', purpose: 'Subtle fill on dark bands' },
      { name: '--white-10', purpose: 'Fill on dark bands' },
      { name: '--white-15', purpose: 'Secondary button and field fill on dark' },
      { name: '--white-20', purpose: 'Hairline border on dark bands' },
      { name: '--white-35', purpose: 'Low-emphasis strokes on dark' },
      { name: '--white-60', purpose: 'Muted text and placeholders on dark' },
    ],
  },
  {
    id: 'surfaces',
    title: 'Surfaces',
    description: 'Semantic aliases used by components, so a component never names a raw colour.',
    tokens: [
      { name: '--surface-page', purpose: 'Page background' },
      { name: '--surface-section-alt', purpose: 'Alternating section band' },
      { name: '--surface-section-muted', purpose: 'Input-heavy section band' },
      { name: '--surface-section-dark', purpose: 'Dark punctuation band' },
      { name: '--surface-card', purpose: 'Default card fill' },
      { name: '--surface-card-muted', purpose: 'Card fill on a white band' },
      { name: '--surface-card-dark', purpose: 'Card fill on a dark band' },
      { name: '--surface-placeholder', purpose: 'Image and media placeholder' },
    ],
  },
  {
    id: 'text',
    title: 'Text',
    description: 'Four text colours, two per background family.',
    tokens: [
      { name: '--text-primary', purpose: 'Default text' },
      { name: '--text-muted', purpose: 'Supporting and secondary text' },
      { name: '--text-on-dark', purpose: 'Default text on a dark band' },
      { name: '--text-on-dark-muted', purpose: 'Supporting text on a dark band' },
    ],
  },
  {
    id: 'borders',
    title: 'Borders',
    description: 'Hairlines only. The system carries no shadows, so the border does the separating.',
    tokens: [
      { name: '--border-default', purpose: '1px hairline on light bands' },
      { name: '--border-on-dark', purpose: '1px hairline on dark bands' },
    ],
  },
  {
    id: 'interactive',
    title: 'Interactive',
    description: 'Action and field colours. Components reference these, never the brand ramp directly.',
    tokens: [
      { name: '--action-primary', purpose: 'Primary button fill' },
      { name: '--action-primary-hover', purpose: 'Primary button hover' },
      { name: '--action-primary-text', purpose: 'Primary button label' },
      { name: '--action-secondary', purpose: 'Secondary button fill' },
      { name: '--action-secondary-hover', purpose: 'Secondary button hover' },
      { name: '--action-secondary-on-dark', purpose: 'Secondary button fill on dark' },
      { name: '--field-bg', purpose: 'Input background' },
      { name: '--field-bg-on-dark', purpose: 'Input background on dark' },
      { name: '--link', purpose: 'Link colour' },
    ],
  },
  {
    id: 'feedback',
    title: 'Feedback',
    description:
      'The system defines error only. There is no success, warning or informational colour: positive states use the brand green, and status is carried by wording rather than hue.',
    tokens: [
      { name: '--feedback-error', purpose: 'Error text and border' },
      { name: '--feedback-error-bg', purpose: 'Error background tint' },
    ],
  },
];

/** The four alternating section bands. Each is a five-token set. */
export const SCHEMES = [1, 2, 3, 4] as const;
export const SCHEME_PARTS = ['bg', 'fg', 'text', 'border', 'accent'] as const;

export const SCHEME_NAMES: Readonly<Record<number, string>> = {
  1: 'Scheme 1 · White',
  2: 'Scheme 2 · Light grey',
  3: 'Scheme 3 · Mid grey',
  4: 'Scheme 4 · Dark green',
};

export const TYPE_SCALE: readonly TokenEntry[] = [
  { name: '--text-h1', purpose: 'Page title' },
  { name: '--text-h2', purpose: 'Section heading' },
  { name: '--text-h3', purpose: 'Sub-section heading' },
  { name: '--text-h4', purpose: 'Card and block heading' },
  { name: '--text-h5', purpose: 'Small heading' },
  { name: '--text-h6', purpose: 'Smallest heading' },
  { name: '--text-large', purpose: 'Lead paragraph' },
  { name: '--text-medium', purpose: 'Supporting paragraph' },
  { name: '--text-regular', purpose: 'Body text' },
  { name: '--text-small', purpose: 'Labels and captions' },
  { name: '--text-tiny', purpose: 'Fine print' },
  { name: '--text-stat', purpose: 'Headline statistic numerals' },
];

export const FONT_TOKENS: readonly TokenEntry[] = [
  { name: '--font-display', purpose: 'All headings' },
  { name: '--font-body', purpose: 'Body, labels and buttons' },
  { name: '--font-numeric', purpose: 'Large statistic numerals only' },
];

export const WEIGHT_TOKENS: readonly TokenEntry[] = [
  { name: '--weight-display', purpose: 'Heading weight' },
  { name: '--weight-regular', purpose: 'Body' },
  { name: '--weight-medium', purpose: 'Buttons and emphasis' },
  { name: '--weight-semibold', purpose: 'Taglines and labels' },
  { name: '--weight-bold', purpose: 'Statistic numerals' },
];

export const LEADING_TOKENS: readonly TokenEntry[] = [
  { name: '--leading-heading', purpose: 'h1 to h3' },
  { name: '--leading-subheading', purpose: 'h4 and h5' },
  { name: '--leading-h6', purpose: 'h6' },
  { name: '--leading-body', purpose: 'Body copy' },
  { name: '--tracking-heading', purpose: 'Heading letter spacing' },
];

export const SPACE_TOKENS: readonly TokenEntry[] = [
  { name: '--space-4', purpose: 'Tightest gap' },
  { name: '--space-8', purpose: 'Within a control' },
  { name: '--space-12', purpose: 'List rows' },
  { name: '--space-16', purpose: 'Between buttons' },
  { name: '--space-24', purpose: 'Within a block of copy' },
  { name: '--space-32', purpose: 'Between cards' },
  { name: '--space-48', purpose: 'Between related blocks' },
  { name: '--space-80', purpose: 'Between major blocks' },
];

export const LAYOUT_TOKENS: readonly TokenEntry[] = [
  { name: '--page-padding', purpose: 'Page gutter. Narrows below 767px' },
  { name: '--section-lg', purpose: 'Default section rhythm' },
  { name: '--section-md', purpose: 'Compact section rhythm' },
  { name: '--section-sm', purpose: 'Tight section rhythm' },
  { name: '--container-lg', purpose: 'Content well' },
  { name: '--container-md', purpose: 'Narrower well' },
  { name: '--container-sm', purpose: 'Narrowest well' },
  { name: '--max-w-lg', purpose: 'Section title measure' },
  { name: '--navbar-height', purpose: 'Sticky header height' },
];

export const RADIUS_TOKENS: readonly TokenEntry[] = [
  { name: '--radius-card', purpose: 'Cards, images, media' },
  { name: '--radius-button', purpose: 'Buttons' },
  { name: '--radius-field', purpose: 'Inputs and notices' },
  { name: '--radius-tabs', purpose: 'Segmented control container' },
  { name: '--radius-tab', purpose: 'Individual tab' },
  { name: '--radius-arrow', purpose: 'Carousel arrow' },
  { name: '--radius-tag', purpose: 'Tags and small labels' },
];

/** Every token name this page reads, so one hook call covers the whole document. */
export const ALL_TOKEN_NAMES: readonly string[] = [
  ...COLOR_GROUPS.flatMap((g) => g.tokens.map((t) => t.name)),
  ...SCHEMES.flatMap((s) => SCHEME_PARTS.map((p) => `--scheme-${s}-${p}`)),
  ...TYPE_SCALE.map((t) => t.name),
  ...FONT_TOKENS.map((t) => t.name),
  ...WEIGHT_TOKENS.map((t) => t.name),
  ...LEADING_TOKENS.map((t) => t.name),
  ...SPACE_TOKENS.map((t) => t.name),
  ...LAYOUT_TOKENS.map((t) => t.name),
  ...RADIUS_TOKENS.map((t) => t.name),
  '--border-width',
];
