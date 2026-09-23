import type { SVGProps } from 'react';
import { ICON_PATHS, type IconName } from './icon-data';

export type { IconName };

export interface IconProps
  extends Omit<SVGProps<SVGSVGElement>, 'dangerouslySetInnerHTML' | 'children'> {
  name: IconName;
  size?: number | string | undefined;
  /**
   * Accessible name. When omitted the icon is decorative and hidden from assistive
   * technology, which is the right default for icons sitting beside visible text.
   */
  title?: string | undefined;
}

export function Icon({ name, size = 24, title, ...rest }: IconProps) {
  const entry = ICON_PATHS[name];
  return (
    <svg
      viewBox={entry.viewBox}
      width={size}
      height={size}
      fill="currentColor"
      focusable="false"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...rest}
      dangerouslySetInnerHTML={{ __html: entry.body }}
    />
  );
}
