import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Container } from '@/components/common/container'
import { cn } from '@/utils/cn'

import styles from './home-section.module.css'

interface HomeSectionProps {
  /** Id của tiêu đề, section dùng `aria-labelledby`. */
  id: string
  eyebrow?: string
  title: string
  description?: string
  viewAll?: { to: string; label: string }
  /** Nền trắng để tách khối liền kề (mặc định nền xám nhạt của trang). */
  white?: boolean
  children: ReactNode
}

/** Khung chung của các khối trang chủ: cùng khoảng cách, cùng kiểu tiêu đề. */
export function HomeSection({
  id,
  eyebrow,
  title,
  description,
  viewAll,
  white,
  children,
}: HomeSectionProps) {
  return (
    <section className={cn(styles.section, white && styles.white)} aria-labelledby={id}>
      <Container>
        <div className={styles.header}>
          <div>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h2 id={id} className={styles.title}>
              {title}
            </h2>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {viewAll && (
            <Link to={viewAll.to} className={styles.viewAll}>
              {viewAll.label} <ArrowRight size={16} aria-hidden />
            </Link>
          )}
        </div>
        {children}
      </Container>
    </section>
  )
}
