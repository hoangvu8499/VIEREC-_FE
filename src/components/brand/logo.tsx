import { Link } from 'react-router'

import logoImage from '@/assets/images/logo-mark.webp'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

import styles from './logo.module.css'

interface LogoProps {
  /** `full`: biểu tượng + tên + slogan; `compact`: chỉ biểu tượng (sidebar admin, mobile). */
  variant?: 'full' | 'compact'
  title?: string
  subtitle?: string
  to?: string
  className?: string
}

export function Logo({
  variant = 'full',
  title = 'VIEREC ACADEMY',
  subtitle = 'AN TOÀN HÔM NAY – PHÁT TRIỂN BỀN VỮNG NGÀY MAI',
  to = ROUTES.HOME,
  className,
}: LogoProps) {
  const isCompact = variant === 'compact'

  return (
    <Link
      to={to}
      className={cn(styles.logo, isCompact && styles.compact, className)}
      aria-label={isCompact ? title : undefined}
    >
      <span className={styles.mark}>
        <img src={logoImage} alt="" width={204} height={204} />
      </span>
      {!isCompact && (
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </span>
      )}
    </Link>
  )
}
