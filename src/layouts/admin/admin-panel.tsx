import type { ComponentProps } from 'react'

import { cn } from '@/utils/cn'

import styles from './admin-panel.module.css'

interface AdminPanelProps extends ComponentProps<'section'> {
  /** Có khoảng đệm trong (form); bảng tràn sát mép thì để `false`. */
  padded?: boolean
}

/** Khung trắng bo góc chứa nội dung chính của trang quản trị (bảng, form). */
export function AdminPanel({ padded = false, className, ...props }: AdminPanelProps) {
  return <section className={cn(styles.panel, padded && styles.padded, className)} {...props} />
}
