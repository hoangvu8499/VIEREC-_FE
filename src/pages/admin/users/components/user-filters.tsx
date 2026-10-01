import { Search, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/common/button'
import { SelectField } from '@/components/form/select-field'
import { TextField } from '@/components/form/text-field'
import { USER_STATUS_LABELS, USER_STATUSES } from '@/constants/user'
import type { UserStatus } from '@/types/user'

import styles from './user-list.module.css'

const STATUS_OPTIONS = USER_STATUSES.map((status) => ({
  value: status,
  label: USER_STATUS_LABELS[status],
}))

interface UserFiltersProps {
  keyword?: string
  status?: UserStatus
  onChange: (filters: { keyword?: string; status?: UserStatus }) => void
}

/** Tìm (Enter / nút Tìm) + lọc trạng thái (áp dụng ngay). Cha đặt `key` theo URL để đồng bộ khi Back. */
export function UserFilters({ keyword, status, onChange }: UserFiltersProps) {
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
          label="Tìm tài khoản"
          type="search"
          placeholder="Họ, tên, tên đăng nhập hoặc email"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <SelectField
          label="Trạng thái"
          placeholder="Tất cả trạng thái"
          options={STATUS_OPTIONS}
          value={status ?? ''}
          onChange={(event) =>
            onChange({
              keyword,
              status: (event.target.value || undefined) as UserStatus | undefined,
            })
          }
        />
        <div className={styles.filterActions}>
          <Button type="submit">
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
