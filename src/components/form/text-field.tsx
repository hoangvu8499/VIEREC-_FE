import { type ComponentProps, useId } from 'react'

import { fieldA11y } from '@/components/form/field-a11y'
import { FormField } from '@/components/form/form-field'
import { cn } from '@/utils/cn'

import styles from './form-field.module.css'

export interface TextFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string
  hint?: string
  error?: string
  id?: string
  /** Class cho khung field (vd. span 2 cột trong grid). */
  fieldClassName?: string
}

/** Label + input + lỗi. Dùng trực tiếp với `{...register('name')}` của react-hook-form. */
export function TextField({
  label,
  hint,
  error,
  id,
  required,
  fieldClassName,
  className,
  ...inputProps
}: TextFieldProps) {
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
      <input
        id={inputId}
        className={cn(styles.input, className)}
        aria-required={required || undefined}
        {...fieldA11y(inputId, { error, hint })}
        {...inputProps}
      />
    </FormField>
  )
}
