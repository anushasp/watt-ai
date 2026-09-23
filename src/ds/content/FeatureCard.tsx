import type { ReactNode } from 'react';
import type { BaseProps, HeadingLevel, TypeScale } from '../types';
import { cn } from '../types';
import { Heading } from '../primitives/Heading';
import { Text } from '../primitives/Text';
import { Img } from '../primitives/Img';
import { Icon, type IconName } from '../icons/Icon';
import styles from './FeatureCard.module.css';

export interface FeatureCardProps extends BaseProps {
  icon?: IconName | undefined;
  image?: { src: string; alt: string } | undefined;
  tagline?: string | undefined;
  heading: string;
  text?: string | undefined;
  headingSize?: TypeScale | undefined;
  headingLevel?: HeadingLevel | undefined;
  actions?: ReactNode | undefined;
  children?: ReactNode | undefined;
  /** Light-grey fill, for use on white sections. */
  muted?: boolean | undefined;
  dark?: boolean | undefined;
  align?: 'left' | 'center' | undefined;
}

/** The workhorse card: prompts, steps, plans and method explanations. */
export function FeatureCard({
  icon,
  image,
  tagline,
  heading,
  text,
  headingSize = 'h4',
  headingLevel = 3,
  actions,
  children,
  muted = false,
  dark = false,
  align = 'left',
  className,
  style,
  id,
}: FeatureCardProps) {
  return (
    <div
      id={id}
      className={cn(styles.card, muted && styles.muted, dark && styles.dark, className)}
      style={{ textAlign: align, alignItems: align === 'center' ? 'center' : undefined, ...style }}
    >
      {image ? (
        <div className={styles.media}>
          <Img src={image.src} alt={image.alt} ratio="3 / 2" />
        </div>
      ) : null}
      {icon ? (
        <Icon name={icon} size={48} style={{ color: dark ? 'var(--text-on-dark)' : undefined }} />
      ) : null}
      <div className={styles.body}>
        {tagline ? (
          <Text as="span" size="small" weight={600} dark={dark} muted={!dark}>
            {tagline}
          </Text>
        ) : null}
        <Heading level={headingLevel} scale={headingSize} dark={dark}>
          {heading}
        </Heading>
        {text ? (
          <Text dark={dark} muted={!dark}>
            {text}
          </Text>
        ) : null}
      </div>
      {children}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}
