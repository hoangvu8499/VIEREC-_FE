import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import styles from './admin-page-header.module.css'

interface AdminPageHeaderProps {
  title: string
  description?: ReactNode
  /** Nút bên phải, vd. "Thêm khoá học". */
  action?: ReactNode
  /** Link quay lại phía trên tiêu đề (trang con, vd. form tạo mới). */
  back?: { to: string; label: string }
}

/** Tiêu đề (h1) của mỗi trang quản trị. */
export function AdminPageHeader({ title, description, action, back }: AdminPageHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        {back && (
          <Link to={back.to} className={styles.back}>
            <ArrowLeft size={16} aria-hidden /> {back.label}
          </Link>
        )}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
