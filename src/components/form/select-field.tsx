import { ChevronDown } from 'lucide-react'
import { type ComponentProps, useId } from 'react'

import { fieldA11y } from '@/components/form/field-a11y'
import { FormField } from '@/components/form/form-field'
import { cn } from '@/utils/cn'

import styles from './form-field.module.css'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectFieldProps extends Omit<ComponentProps<'select'>, 'id' | 'children'> {
  label: string
  options: readonly SelectOption[]
  /** Dòng đầu không có giá trị, vd. "Tất cả trạng thái". */
  placeholder?: string
  hint?: string
  error?: string
  id?: string
  fieldClassName?: string
}

/** Label + select + lỗi. Dùng với `{...register('name')}` hoặc controlled `value`/`onChange`. */
export function SelectField({
  label,
  options,
  placeholder,
  hint,
  error,
  id,
  required,
  fieldClassName,
  className,
  ...selectProps
}: SelectFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <FormField
      id={inputId}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={fieldClassName}
    >
      <div className={styles.control}>
        <select
          id={inputId}
          className={cn(styles.input, styles.select, className)}
          aria-required={required || undefined}
          {...fieldA11y(inputId, { error, hint })}
          {...selectProps}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.selectIcon} size={18} aria-hidden />
      </div>
    </FormField>
  )
}
