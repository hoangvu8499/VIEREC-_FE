import { FileUp, X, type LucideIcon } from 'lucide-react'
import { type Ref, useEffect, useId, useRef } from 'react'

import { fieldA11y } from '@/components/form/field-a11y'
import { FormField } from '@/components/form/form-field'
import { cn } from '@/utils/cn'
import { formatFileSize } from '@/utils/format-file-size'

import styles from './form-field.module.css'

export interface FileFieldProps {
  label: string
  value: File | undefined
  onChange: (file: File | undefined) => void
  onBlur?: () => void
  /** Thuộc tính `accept` của input, vd. `.pdf,.docx`. */
  accept?: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  icon?: LucideIcon
  id?: string
  name?: string
  fieldClassName?: string
  /** Để react-hook-form focus được ô lỗi. */
  ref?: Ref<HTMLInputElement>
}

/**
 * Chọn một file (bấm hoặc kéo thả vào khung). Controlled: dùng với `Controller` của react-hook-form.
 * Kiểm tra đuôi/dung lượng đặt ở schema, không ở đây.
 */
export function FileField({
  label,
  value,
  onChange,
  onBlur,
  accept,
  hint,
  error,
  required,
  disabled,
  icon: Icon = FileUp,
  id,
  name,
  fieldClassName,
  ref,
}: FileFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Form reset (value → undefined) thì xoá cả file trong input, để chọn lại đúng file đó vẫn nhận.
  useEffect(() => {
    if (!value && inputRef.current) inputRef.current.value = ''
  }, [value])

  const clear = () => {
    onChange(undefined)
    inputRef.current?.focus()
  }

  return (
    <FormField
      id={inputId}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={fieldClassName}
    >
      <div
        className={cn(styles.dropzone, value && styles.dropzoneFilled, disabled && styles.disabled)}
        data-invalid={error ? true : undefined}
      >
        <Icon className={styles.dropzoneIcon} size={28} aria-hidden />
        <div className={styles.dropzoneText}>
          {value ? (
            <>
              <strong className={styles.fileName}>{value.name}</strong>
              <span>{formatFileSize(value.size)}</span>
            </>
          ) : (
            <>
              <strong>Bấm để chọn file</strong>
              <span>hoặc kéo thả file vào đây</span>
            </>
          )}
        </div>
        {/* Input phủ kín khung (trong suốt) để nhận cả bấm lẫn kéo thả. */}
        <input
          ref={(element) => {
            inputRef.current = element
            if (typeof ref === 'function') ref(element)
            else if (ref) ref.current = element
          }}
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          disabled={disabled}
          className={styles.fileInput}
          aria-required={required || undefined}
          {...fieldA11y(inputId, { error, hint })}
          onChange={(event) => onChange(event.target.files?.[0])}
          onBlur={onBlur}
        />
        {value && !disabled && (
          <button
            type="button"
            className={styles.fileClear}
            aria-label={`Bỏ chọn file ${value.name}`}
            onClick={clear}
          >
            <X size={18} aria-hidden />
          </button>
        )}
      </div>
    </FormField>
  )
}
