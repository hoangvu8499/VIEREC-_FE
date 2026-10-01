import { type ComponentProps, useId } from 'react'

import { fieldA11y } from '@/components/form/field-a11y'
import { FormField } from '@/components/form/form-field'
import { cn } from '@/utils/cn'

import styles from './form-field.module.css'

export interface TextareaFieldProps extends Omit<ComponentProps<'textarea'>, 'id'> {
  label: string
  hint?: string
  error?: string
  id?: string
  fieldClassName?: string
}

/** Label + textarea + lỗi. Dùng trực tiếp với `{...register('name')}`. */
export function TextareaField({
  label,
  hint,
  error,
  id,
  required,
  fieldClassName,
  className,
  rows = 5,
  ...textareaProps
}: TextareaFieldProps) {
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
      <textarea
        id={inputId}
        rows={rows}
        className={cn(styles.input, styles.textarea, className)}
        aria-required={required || undefined}
        {...fieldA11y(inputId, { error, hint })}
        {...textareaProps}
      />
    </FormField>
  )
}
