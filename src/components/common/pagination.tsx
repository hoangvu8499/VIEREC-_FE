import { ChevronLeft, ChevronRight } from 'lucide-react'

import { pageItems } from '@/components/common/page-items'
import { cn } from '@/utils/cn'

import styles from './pagination.module.css'

interface PaginationProps {
  /** Trang hiện tại, bắt đầu từ 0 (như `PageResponse.page`). */
  page: number
  totalPages: number
  onChange: (page: number) => void
  /** Nhãn cho trình đọc màn hình. */
  label?: string
  className?: string
}

export function Pagination({
  page,
  totalPages,
  onChange,
  label = 'Phân trang',
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const isFirst = page <= 0
  const isLast = page >= totalPages - 1

  return (
    <nav className={cn(styles.pagination, className)} aria-label={label}>
      <button
        type="button"
        className={styles.item}
        disabled={isFirst}
        aria-label="Trang trước"
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={18} aria-hidden />
      </button>
      {pageItems(page, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${index}`} className={styles.gap} aria-hidden>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={cn(styles.item, item === page && styles.current)}
            aria-label={`Trang ${item + 1}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onChange(item)}
          >
            {item + 1}
          </button>
        ),
      )}
      <button
        type="button"
        className={styles.item}
        disabled={isLast}
        aria-label="Trang sau"
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight size={18} aria-hidden />
      </button>
    </nav>
  )
}
