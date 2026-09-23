import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { cn } from '../types';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'link';
export type ButtonSize = 'default' | 'small';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  /** For dark (Scheme 4) surfaces. */
  alternate?: boolean | undefined;
  /** Links default to a trailing chevron. Pass null to hide it. */
  trailingIcon?: IconName | null | undefined;
  leadingIcon?: IconName | undefined;
  fullWidth?: boolean | undefined;
  children?: ReactNode | undefined;
}

export function Button({
  variant = 'primary',
  size = 'default',
  alternate = false,
  trailingIcon,
  leadingIcon,
  fullWidth = false,
  type = 'button',
  children,
  className,
  ...rest
}: ButtonProps) {
  const isLink = variant === 'link';
  const trailing: IconName | null =
    trailingIcon === undefined ? (isLink ? 'ChevronRight' : null) : trailingIcon;
  return (
    <button
      type={type}
      className={cn(
        styles.button,
        styles[variant],
        !isLink && (size === 'small' ? styles.sizeSmall : styles.sizeDefault),
        alternate && styles.alternate,
        fullWidth && styles.fullWidth,
        className,
      )}
      {...rest}
    >
      {leadingIcon ? <Icon name={leadingIcon} size={isLink ? 24 : 20} /> : null}
      <span>{children}</span>
      {trailing ? <Icon name={trailing} size={isLink ? 24 : 20} /> : null}
    </button>
  );
}
