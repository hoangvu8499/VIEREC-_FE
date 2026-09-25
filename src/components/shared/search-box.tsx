import { Search } from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'

import styles from './search-box.module.css'

interface SearchBoxProps {
  placeholder?: string
  /** Gọi khi submit với từ khoá đã trim (bỏ qua nếu rỗng). */
  onSearch?: (keyword: string) => void
  className?: string
}

export function SearchBox({ placeholder = 'Tìm kiếm...', onSearch, className }: SearchBoxProps) {
  const inputId = useId()
  const [keyword, setKeyword] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = keyword.trim()
    if (value) onSearch?.(value)
  }

  return (
    <search className={className}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="sr-only">
          {placeholder}
        </label>
        <Search className={styles.icon} size={18} aria-hidden />
        <input
          id={inputId}
          type="search"
          className={styles.input}
          placeholder={placeholder}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </form>
    </search>
  )
}
