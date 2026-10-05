import { X } from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import { IconButton } from '@/components/common/icon-button'
import { trapFocus } from '@/utils/trap-focus'

import styles from './dialog.module.css'

interface DialogProps {
  open: boolean
  title: string
  description?: ReactNode
  /** Đang xử lý: không đóng được bằng Esc / nút X. */
  busy?: boolean
  onClose: () => void
  /** Nội dung (thường là form kèm nút ở cuối). Phần này cuộn khi dài hơn màn hình. */
  children: ReactNode
}

/**
 * Hộp thoại chứa form (rộng hơn `ConfirmDialog`, căn trái). Mở thì focus ô nhập đầu tiên, Esc để đóng,
 * Tab chỉ chạy trong hộp thoại, đóng xong trả focus về chỗ cũ.
 */
export function Dialog({ open, title, description, busy = false, onClose, children }: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const firstField = bodyRef.current?.querySelector<HTMLElement>('input, textarea, select')
    ;(firstField ?? closeRef.current)?.focus({ preventScroll: true })
    return () => previous?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        event.stopPropagation()
        onClose()
      }
      if (event.key === 'Tab') trapFocus(event, dialogRef.current)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, busy, onClose])

  if (!open) return null

  return createPortal(
    <div className={styles.backdrop}>
      <dialog
        ref={dialogRef}
        open
        className={styles.dialog}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className={styles.header}>
          <div>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description && (
              <div id={descriptionId} className={styles.description}>
                {description}
              </div>
            )}
          </div>
          <IconButton
            ref={closeRef}
            label="Đóng"
            className={styles.close}
            disabled={busy}
            onClick={onClose}
          >
            <X size={20} aria-hidden />
          </IconButton>
        </div>
        <div ref={bodyRef} className={styles.body}>
          {children}
        </div>
      </dialog>
    </div>,
    document.body,
  )
}
