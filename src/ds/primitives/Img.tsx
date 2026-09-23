import type { BaseProps } from '../types';

export interface ImgProps extends BaseProps {
  src: string;
  /** Required. The design system used CSS background images, which have no alt text. */
  alt: string;
  /** CSS aspect-ratio, e.g. "3 / 2". */
  ratio?: string | undefined;
  height?: number | undefined;
  loading?: 'lazy' | 'eager' | undefined;
}

/** A real <img>, replacing the design system's background-image divs. */
export function Img({ src, alt, ratio, height, loading = 'lazy', className, style, ...rest }: ImgProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: height ?? '100%',
        aspectRatio: ratio,
        objectFit: 'cover',
        borderRadius: 'var(--radius-card)',
        background: 'var(--surface-placeholder)',
        ...style,
      }}
      {...rest}
    />
  );
}
