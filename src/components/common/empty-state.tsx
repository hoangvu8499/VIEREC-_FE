import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

import styles from './empty-state.module.css'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: ReactNode
  /** Nút / link hành động. */
  action?: ReactNode
  tone?: 'primary' | 'danger'
  className?: string
}

/** Khối trạng thái rỗng / chưa có dữ liệu / không có quyền. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'primary',
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(styles.empty, className)}>
      <span className={cn(styles.icon, styles[tone])}>
        <Icon size={32} aria-hidden />
      </span>
      <p className={styles.title}>{title}</p>
      {description && <div className={styles.description}>{description}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
