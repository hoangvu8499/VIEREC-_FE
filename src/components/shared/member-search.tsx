import { Search, X } from 'lucide-react'
import { type FormEvent, useState } from 'react'

import { Button } from '@/components/common/button'
import { TextField } from '@/components/form/text-field'

import styles from './member-search.module.css'

interface MemberSearchProps {
  keyword?: string
  onSearch: (keyword: string | undefined) => void
  label?: string
  placeholder?: string
}

/** Ô tìm học viên của doanh nghiệp (tên, tên đăng nhập, SĐT, email). Đổi `key` khi `keyword` đổi từ ngoài. */
export function MemberSearch({
  keyword = '',
  onSearch,
  label = 'Tìm học viên',
  placeholder = 'Họ tên, tên đăng nhập, SĐT hoặc email',
}: MemberSearchProps) {
  const [value, setValue] = useState(keyword)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(value.trim() || undefined)
  }

  return (
    <search>
      <form className={styles.form} onSubmit={submit}>
        <TextField
          label={label}
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className={styles.actions}>
          <Button type="submit" variant="primary">
            <Search size={18} aria-hidden /> Tìm
          </Button>
          {keyword && (
            <Button
              variant="ghost"
              onClick={() => {
                setValue('')
                onSearch(undefined)
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
