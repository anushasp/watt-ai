import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '../types';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Always provide one. The design system relied on placeholders, which fails WCAG. */
  label: string;
  /** Hide the label visually while keeping it for assistive technology. */
  hideLabel?: boolean | undefined;
  hint?: string | undefined;
  error?: string | undefined;
  /** For dark (Scheme 4) surfaces. */
  alternate?: boolean | undefined;
}

export function Input({
  label,
  hideLabel = false,
  hint,
  error,
  alternate = false,
  className,
  ...rest
}: InputProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');
  return (
    <div className={cn(styles.field, alternate && styles.alternate, className)}>
      <label className={cn(styles.label, hideLabel && 'sr-only')} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy.length > 0 ? describedBy : undefined}
        {...rest}
      />
      {hint ? (
        <span className={styles.hint} id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className={styles.error} id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
