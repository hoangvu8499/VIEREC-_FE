import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { type Ref, useId, useState } from 'react'

import { buttonClass } from '@/components/common/button-class'
import { fieldA11y } from '@/components/form/field-a11y'
import { FormField } from '@/components/form/form-field'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { userService } from '@/services/user-service'
import {
  toInstructorOption,
  type InstructorOption,
} from '@/pages/admin/courses/components/instructor-option'

import styles from './course-form.module.css'

/** Số gợi ý tối đa hiện dưới ô tìm. */
const RESULT_SIZE = 6

const HINT = 'Tìm theo họ, tên, tên đăng nhập hoặc email của tài khoản đang hoạt động'

interface InstructorPickerProps {
  /** Người đang chọn (cha giữ để hiện lại sau khi submit lỗi). */
  value: InstructorOption | undefined
  onChange: (instructor: InstructorOption | undefined) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
  ref?: Ref<HTMLInputElement | HTMLButtonElement>
}

/** Chữ cái đầu của tên (từ cuối trong họ tên kiểu Việt). */
function initialOf({ name, username }: InstructorOption): string {
  return (name.trim().split(/\s+/).at(-1) || username).charAt(0).toUpperCase()
}

function InstructorSummary({ instructor }: { instructor: InstructorOption }) {
  return (
    <>
      <span className={styles.avatar} aria-hidden>
        {initialOf(instructor)}
      </span>
      <span className={styles.userText}>
        <strong>{instructor.name || instructor.username}</strong>
        <small>
          @{instructor.username}
          {instructor.email && ` · ${instructor.email}`}
        </small>
      </span>
    </>
  )
}

/**
 * Chọn giảng viên = một tài khoản đang ACTIVE (backend không có role giảng viên riêng).
 * Tìm qua `GET /users` (khớp username, email, họ hoặc tên).
 */
export function InstructorPicker({
  value,
  onChange,
  onBlur,
  error,
  disabled,
  ref,
}: InstructorPickerProps) {
  const inputId = useId()
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebouncedValue(keyword.trim())

  const results = useQuery({
    queryKey: ['users', 'instructor-picker', debouncedKeyword],
    queryFn: () =>
      userService.search({ keyword: debouncedKeyword, status: 'ACTIVE', size: RESULT_SIZE }),
    enabled: !value && debouncedKeyword.length > 0,
    placeholderData: keepPreviousData,
  })

  if (value) {
    return (
      <FormField id={inputId} label="Giảng viên" required error={error}>
        <div className={styles.selected} data-invalid={error ? true : undefined}>
          <InstructorSummary instructor={value} />
          <button
            ref={ref as Ref<HTMLButtonElement>}
            id={inputId}
            type="button"
            className={buttonClass({ variant: 'outline', size: 'sm' })}
            disabled={disabled}
            aria-label={`Đổi giảng viên (đang chọn ${value.name || value.username})`}
            {...fieldA11y(inputId, { error })}
            onClick={() => {
              setKeyword('')
              onChange(undefined)
            }}
          >
            Đổi
          </button>
        </div>
      </FormField>
    )
  }

  const users = results.data?.content ?? []
  const searching = debouncedKeyword.length > 0
  const showResults = searching && !results.isPending

  return (
    <FormField id={inputId} label="Giảng viên" required hint={HINT} error={error}>
      <div className={styles.searchControl}>
        <Search className={styles.searchIcon} size={18} aria-hidden />
        <input
          ref={ref as Ref<HTMLInputElement>}
          id={inputId}
          type="search"
          className={styles.searchInput}
          placeholder="Vd. nguyen, vutth, @vierec.vn"
          autoComplete="off"
          value={keyword}
          disabled={disabled}
          aria-required
          {...fieldA11y(inputId, { error, hint: HINT })}
          onChange={(event) => setKeyword(event.target.value)}
          onBlur={onBlur}
        />
      </div>

      {searching && results.isPending && <p className={styles.resultNote}>Đang tìm…</p>}
      {results.isError && (
        <p className={styles.resultNote}>Không tải được danh sách tài khoản. Vui lòng thử lại.</p>
      )}
      {showResults && !results.isError && users.length === 0 && (
        <p className={styles.resultNote}>Không có tài khoản đang hoạt động nào khớp “{keyword}”.</p>
      )}
      {showResults && users.length > 0 && (
        <ul className={styles.results} aria-label="Kết quả tìm giảng viên">
          {users.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                className={styles.result}
                disabled={disabled}
                onClick={() => onChange(toInstructorOption(user))}
              >
                <InstructorSummary instructor={toInstructorOption(user)} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </FormField>
  )
}
