import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

import styles from './form-field.module.css'

export interface FormFieldProps {
  /** id của input bên trong — dùng cho `htmlFor` và id của hint/error. */
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  className?: string
  children: ReactNode
}

/** Khung field: label + control + hint/lỗi. Input bên trong dùng `fieldA11y(id, ...)` để nối aria. */
export function FormField({
  id,
  label,
  required,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
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
    </div>
  )
}
