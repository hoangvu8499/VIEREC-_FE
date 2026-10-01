import { type ComponentProps, useId } from 'react'

import { cn } from '@/utils/cn'

import styles from './form-field.module.css'

export interface CheckboxFieldProps extends Omit<ComponentProps<'input'>, 'id' | 'type'> {
  label: string
  /** Dòng giải thích dưới nhãn. */
  hint?: string
  id?: string
  fieldClassName?: string
}

/** Ô tích + nhãn (bấm vào nhãn cũng tích). Dùng trực tiếp với `{...register('name')}`. */
export function CheckboxField({
  label,
  hint,
  id,
  fieldClassName,
  ...inputProps
}: CheckboxFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={cn(styles.checkbox, fieldClassName)}>
      <input
        id={inputId}
        type="checkbox"
        aria-describedby={hint ? `${inputId}-hint` : undefined}
        {...inputProps}
      />
      <div className={styles.checkboxText}>
        <label htmlFor={inputId} className={styles.checkboxLabel}>
          {label}
        </label>
        {hint && (
          <p id={`${inputId}-hint`} className={styles.hint}>
            {hint}
          </p>
        )}
      </div>
    </div>
  )
}
