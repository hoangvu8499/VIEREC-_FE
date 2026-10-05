import { CircleAlert } from 'lucide-react'
import { type ComponentProps, useId } from 'react'

import { cn } from '@/utils/cn'

import styles from './form-field.module.css'

export interface RadioOption {
  value: string
  label: string
  /** Dòng giải thích dưới nhãn của lựa chọn. */
  hint?: string
}

export interface RadioGroupFieldProps extends Omit<
  ComponentProps<'input'>,
  'id' | 'type' | 'value' | 'checked' | 'defaultValue'
> {
  label: string
  options: readonly RadioOption[]
  /** Có: controlled. Không: dùng với `{...register('name')}`. */
  value?: string
  hint?: string
  error?: string
  /** Các lựa chọn nằm cùng hàng (lựa chọn ngắn, vd. A B C D). */
  inline?: boolean
  fieldClassName?: string
}

/** Nhóm radio có tiêu đề (`fieldset` + `legend`) và lỗi chung cho cả nhóm. */
export function RadioGroupField({
  label,
  options,
  value,
  hint,
  error,
  inline = false,
  required,
  fieldClassName,
  ...inputProps
}: RadioGroupFieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <fieldset
      className={cn(styles.field, styles.radioGroup, fieldClassName)}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
    >
      <legend className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden>
            *
          </span>
        )}
      </legend>
      <div className={cn(styles.radioOptions, inline && styles.radioInline)}>
        {options.map((option) => (
          <label key={option.value} className={styles.radio}>
            <input
              type="radio"
              value={option.value}
              checked={value === undefined ? undefined : value === option.value}
              {...inputProps}
            />
            <span className={styles.radioText}>
              <span className={styles.radioLabel}>{option.label}</span>
              {option.hint && <span className={styles.hint}>{option.hint}</span>}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          <CircleAlert size={14} aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </fieldset>
  )
}
