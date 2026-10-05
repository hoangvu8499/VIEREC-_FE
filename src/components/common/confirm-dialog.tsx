import { TriangleAlert, type LucideIcon } from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { cn } from '@/utils/cn'
import { trapFocus } from '@/utils/trap-focus'

import styles from './confirm-dialog.module.css'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  /** Đang xử lý: nút xác nhận hiện spinner, không đóng được bằng Esc / lớp phủ. */
  loading?: boolean
  /** Lỗi của lần xác nhận trước (hộp thoại vẫn mở để thử lại). */
  error?: string
  onConfirm: () => void
  onCancel: () => void
  /** `danger` (mặc định): xoá, huỷ... `primary`: thao tác bình thường cần xác nhận. */
  tone?: 'danger' | 'primary'
  icon?: LucideIcon
}

/**
 * Hộp thoại xác nhận thao tác nguy hiểm (xoá...). Mở thì focus nút Huỷ, Esc để đóng,
 * Tab chỉ chạy trong hộp thoại, đóng xong trả focus về chỗ cũ.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Huỷ',
  loading = false,
  error,
  onConfirm,
  onCancel,
  tone = 'danger',
  icon: Icon = TriangleAlert,
}: ConfirmDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    // Không cuộn tới nút: nội dung dài (mã QR) phải hiện từ đầu.
    cancelRef.current?.focus({ preventScroll: true })
    return () => previous?.focus()
  }, [open])

  // Esc để đóng, Tab chỉ chạy trong hộp thoại. Gắn ở document vì hộp thoại không phải phần tử tương tác.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        event.stopPropagation()
        onCancel()
      }
      if (event.key === 'Tab') trapFocus(event, dialogRef.current)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, loading, onCancel])

  if (!open) return null

  const close = () => {
    if (!loading) onCancel()
  }

  return createPortal(
    <div className={styles.backdrop}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <span className={cn(styles.icon, tone === 'primary' && styles.primary)}>
          <Icon size={24} aria-hidden />
        </span>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description && (
          <div id={descriptionId} className={styles.description}>
            {description}
          </div>
        )}
        {error && (
          <Alert variant="error" className={styles.error}>
            {error}
          </Alert>
        )}
        <div className={styles.actions}>
          <Button ref={cancelRef} variant="ghost" disabled={loading} onClick={close}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'primary' ? 'accent' : 'danger'}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
