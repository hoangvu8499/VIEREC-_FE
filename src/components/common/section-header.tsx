import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import styles from './section-header.module.css'

interface SectionHeaderProps {
  title: string
  /** Link "Xem tất cả". Bỏ qua nếu dùng `action`. */
  viewAllTo?: string
  viewAllLabel?: string
  /** Slot tuỳ biến bên phải (vd. nút "Thêm mới" ở trang admin). */
  action?: ReactNode
  /** Cấp heading, mặc định h2. */
  as?: 'h2' | 'h3'
  /** Gắn vào heading để section dùng `aria-labelledby`. */
  id?: string
}

export function SectionHeader({
  title,
  viewAllTo,
  viewAllLabel = 'Xem tất cả',
  action,
  as: Heading = 'h2',
  id,
}: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <Heading id={id} className={styles.title}>
        {title}
      </Heading>
      {action ??
        (viewAllTo && (
          <Link to={viewAllTo} className={styles.action}>
            {viewAllLabel} <ArrowRight size={14} aria-hidden />
          </Link>
        ))}
    </div>
  )
}
