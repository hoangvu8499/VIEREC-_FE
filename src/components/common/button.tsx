import { LoaderCircle } from 'lucide-react'
import type { ComponentProps } from 'react'

import { buttonClass, type ButtonStyleProps } from '@/components/common/button-class'

import styles from './button.module.css'

interface ButtonProps extends ComponentProps<'button'>, ButtonStyleProps {
  /** Hiện spinner và vô hiệu hoá nút (vd. khi đang submit form). */
  loading?: boolean
}

export function Button({
  variant,
  size,
  block,
  loading = false,
  disabled,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, block }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle className={styles.spinner} size={20} aria-hidden />}
      {children}
    </button>
  )
}
