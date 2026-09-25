import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/utils/cn'

import styles from './icon-button.module.css'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Nhãn cho trình đọc màn hình (bắt buộc vì nút chỉ có icon). */
  label: string
  children: ReactNode
}

export function IconButton({
  label,
  className,
  type = 'button',
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(styles.iconButton, className)}
      {...props}
    >
      {children}
    </button>
  )
}
