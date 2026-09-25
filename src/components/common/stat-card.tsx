import type { LucideIcon } from 'lucide-react'

import { cn } from '@/utils/cn'

import styles from './stat-card.module.css'

interface StatCardProps {
  value: string
  label: string
  icon?: LucideIcon
  /** `inline`: không khung (hero); `card`: có khung (dashboard admin). */
  variant?: 'inline' | 'card'
  className?: string
}

export function StatCard({
  value,
  label,
  icon: Icon,
  variant = 'inline',
  className,
}: StatCardProps) {
  return (
    <div className={cn(styles.stat, variant === 'card' && styles.card, className)}>
      {Icon && <Icon className={styles.icon} size={30} aria-hidden />}
      <div>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </div>
    </div>
  )
}
