import { Search, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/common/button'
import { TextField } from '@/components/form/text-field'
import { cn } from '@/utils/cn'

import styles from './course-list.module.css'

interface KeywordSearchProps {
  label: string
  placeholder: string
  keyword?: string
  onChange: (keyword: string | undefined) => void
}

/** Ô tìm (Enter / nút Tìm). Cha đặt `key` theo keyword trên URL để ô cập nhật khi bấm Back. */
export function KeywordSearch({ label, placeholder, keyword, onChange }: KeywordSearchProps) {
  const [draft, setDraft] = useState(keyword ?? '')

  return (
    <search className={styles.filters}>
      <form
        className={cn(styles.filterForm, styles.keywordOnly)}
        onSubmit={(event) => {
          event.preventDefault()
          onChange(draft.trim() || undefined)
        }}
      >
        <TextField
          label={label}
          type="search"
          placeholder={placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className={styles.filterActions}>
          <Button type="submit" variant="primary">
            <Search size={18} aria-hidden /> Tìm
          </Button>
          {keyword && (
            <Button
              variant="ghost"
              onClick={() => {
                setDraft('')
                onChange(undefined)
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
