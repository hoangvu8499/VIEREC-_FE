import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

import styles from './alert.module.css'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

const ICONS: Record<AlertVariant, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
}

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  className?: string
}

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const Icon = ICONS[variant]

  return (
    <div
      className={cn(styles.alert, styles[variant], className)}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <Icon className={styles.icon} size={20} aria-hidden />
      <div>
        {title && <p className={styles.title}>{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}
