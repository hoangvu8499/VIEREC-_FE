import { Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'

import { fieldA11y } from '@/components/form/field-a11y'
import { FormField } from '@/components/form/form-field'
import type { TextFieldProps } from '@/components/form/text-field'
import { cn } from '@/utils/cn'

import styles from './form-field.module.css'

type PasswordFieldProps = Omit<TextFieldProps, 'type'>

/** Field mật khẩu có nút bật/tắt hiển thị. */
export function PasswordField({
  label,
  hint,
  error,
  id,
  required,
  fieldClassName,
  className,
  ...inputProps
}: PasswordFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [isVisible, setIsVisible] = useState(false)

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
        <input
          id={inputId}
          type={isVisible ? 'text' : 'password'}
          className={cn(styles.input, styles.withToggle, className)}
          aria-required={required || undefined}
          {...fieldA11y(inputId, { error, hint })}
          {...inputProps}
        />
        <button
          type="button"
          className={styles.toggle}
          aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          aria-pressed={isVisible}
          aria-controls={inputId}
          onClick={() => setIsVisible((visible) => !visible)}
        >
          {isVisible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </div>
    </FormField>
  )
}
