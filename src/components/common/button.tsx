import type { ButtonHTMLAttributes } from 'react'

import { buttonClass, type ButtonStyleProps } from '@/components/common/button-class'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {}

export function Button({
  variant,
  size,
  block,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClass({ variant, size, block }, className)} {...props} />
  )
}
