import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

import styles from './promo-cards.module.css'

export type PromoCardVariant = 'green' | 'blue' | 'light'

interface PromoCardProps {
  variant: PromoCardVariant
  title: string
  subtitle?: string
  description: string
  /** Icon/ảnh nhỏ phía trên tiêu đề. */
  icon?: ReactNode
  /** Ảnh minh hoạ bên phải; chưa có thì hiển thị khối trang trí. */
  image?: string
  action: ReactNode
}

export function PromoCard({
  variant,
  title,
  subtitle,
  description,
  icon,
  image,
  action,
}: PromoCardProps) {
  return (
    <article className={cn(styles.card, styles[variant])}>
      {image && <img className={styles.image} src={image} alt="" />}
      <div className={styles.body}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <p className={styles.description}>{description}</p>
        <div className={styles.action}>{action}</div>
      </div>
    </article>
  )
}
