import { Search, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/common/button'
import { SelectField } from '@/components/form/select-field'
import { TextField } from '@/components/form/text-field'
import { COURSE_STATUS_LABELS, COURSE_STATUSES } from '@/constants/course'
import type { CourseSearchParams, CourseStatus } from '@/types/course'

import styles from './course-list.module.css'

const STATUS_OPTIONS = COURSE_STATUSES.map((status) => ({
  value: status,
  label: COURSE_STATUS_LABELS[status],
}))

interface CourseFiltersProps {
  keyword?: string
  status?: CourseStatus
  onChange: (filters: Pick<CourseSearchParams, 'keyword' | 'status'>) => void
}

/**
 * Tìm theo tên (Enter / nút Tìm) + lọc trạng thái (áp dụng ngay).
 * Cha đặt `key` theo keyword trên URL để ô tìm kiếm cập nhật khi bấm Back.
 */
export function CourseFilters({ keyword, status, onChange }: CourseFiltersProps) {
  const [draft, setDraft] = useState(keyword ?? '')
  const hasFilters = Boolean(keyword || status)

  return (
    <search className={styles.filters}>
      <form
        className={styles.filterForm}
        onSubmit={(event) => {
          event.preventDefault()
          onChange({ keyword: draft.trim() || undefined, status })
        }}
      >
        <TextField
          label="Tìm theo tên khoá học"
          type="search"
          placeholder="Vd. Phòng cháy chữa cháy"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          fieldClassName={styles.keyword}
        />
        <SelectField
          label="Trạng thái"
          placeholder="Tất cả trạng thái"
          options={STATUS_OPTIONS}
          value={status ?? ''}
          onChange={(event) =>
            onChange({
              keyword,
              status: (event.target.value || undefined) as CourseStatus | undefined,
            })
          }
          fieldClassName={styles.status}
        />
        <div className={styles.filterActions}>
          <Button type="submit" variant="primary">
            <Search size={18} aria-hidden /> Tìm
          </Button>
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={() => {
                setDraft('')
                onChange({ keyword: undefined, status: undefined })
              }}
            >
              <X size={18} aria-hidden /> Xoá lọc
            </Button>
          )}
        </div>
      </form>
    </search>
  )
}
