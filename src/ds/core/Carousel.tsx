import type { BaseProps } from '../types';
import { cn } from '../types';
import { Icon } from '../icons/Icon';
import styles from './Carousel.module.css';

export interface CarouselArrowProps extends BaseProps {
  direction?: 'left' | 'right' | undefined;
  onClick?: () => void;
  disabled?: boolean | undefined;
  /** Id of the region the arrow scrolls. */
  controls?: string | undefined;
}

export function CarouselArrow({
  direction = 'right',
  onClick,
  disabled = false,
  controls,
  className,
  style,
}: CarouselArrowProps) {
  return (
    <button
      type="button"
      aria-label={direction === 'left' ? 'Previous slide' : 'Next slide'}
      aria-controls={controls}
      onClick={onClick}
      disabled={disabled}
      className={cn(styles.arrow, className)}
      style={style}
    >
      <Icon name={direction === 'left' ? 'ArrowBack2' : 'ArrowForward'} size={24} />
    </button>
  );
}

export interface CarouselDotsProps extends BaseProps {
  count: number;
  active: number;
  onSelect: (index: number) => void;
  dark?: boolean | undefined;
  /** Used to build each dot's accessible name, e.g. "slide". */
  itemLabel?: string | undefined;
}

export function CarouselDots({
  count,
  active,
  onSelect,
  dark = false,
  itemLabel = 'slide',
  className,
  style,
}: CarouselDotsProps) {
  return (
    <ul className={cn(styles.dots, dark && styles.dark, className)} style={style}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <button
            type="button"
            className={styles.dot}
            aria-current={index === active}
            aria-label={`Go to ${itemLabel} ${index + 1} of ${count}`}
            onClick={() => onSelect(index)}
          />
        </li>
      ))}
    </ul>
  );
}
