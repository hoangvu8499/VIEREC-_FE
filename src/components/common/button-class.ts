import { cn } from '@/utils/cn'

import styles from './button.module.css'

export type ButtonVariant =
  'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'light' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonStyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Chiếm toàn bộ chiều ngang. */
  block?: boolean
}

/** Class dùng chung cho `Button` và `ButtonLink`. */
export function buttonClass(
  { variant = 'primary', size = 'md', block = false }: ButtonStyleProps,
  className?: string,
): string {
  return cn(styles.btn, styles[variant], styles[size], block && styles.block, className)
}
