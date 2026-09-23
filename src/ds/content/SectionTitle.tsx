import type { BaseProps, HeadingLevel, TypeScale } from '../types';
import { Heading } from '../primitives/Heading';
import { Text } from '../primitives/Text';

export interface SectionTitleProps extends BaseProps {
  tagline?: string | undefined;
  heading: string;
  text?: string | undefined;
  align?: 'left' | 'center' | undefined;
  /** Semantic level, independent of `size`. */
  level?: HeadingLevel | undefined;
  /** Visual type token. */
  size?: TypeScale | undefined;
  dark?: boolean | undefined;
}

/** Tagline + heading + one supporting sentence. Opens nearly every section. */
export function SectionTitle({
  tagline,
  heading,
  text,
  align = 'center',
  level = 2,
  size = 'h2',
  dark = false,
  className,
  style,
  id,
}: SectionTitleProps) {
  return (
    <div
      id={id}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-16)',
        maxWidth: 'var(--max-w-lg)',
        marginInline: align === 'center' ? 'auto' : undefined,
        textAlign: align,
        alignItems: align === 'center' ? 'center' : 'flex-start',
        ...style,
      }}
    >
      {tagline ? (
        <Text as="span" size="regular" weight={600} dark={dark}>
          {tagline}
        </Text>
      ) : null}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-24)',
          alignItems: align === 'center' ? 'center' : 'flex-start',
        }}
      >
        <Heading level={level} scale={size} dark={dark}>
          {heading}
        </Heading>
        {text ? (
          <Text size="medium" dark={dark} muted={!dark}>
            {text}
          </Text>
        ) : null}
      </div>
    </div>
  );
}
