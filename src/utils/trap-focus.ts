const FOCUSABLE =
  'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)'

/** Giữ Tab / Shift+Tab chạy vòng trong `container` (hộp thoại). Gọi trong handler `keydown` của phím Tab. */
export function trapFocus(event: KeyboardEvent, container: HTMLElement | null) {
  const focusable = container?.querySelectorAll<HTMLElement>(FOCUSABLE)
  const first = focusable?.[0]
  const last = focusable?.[focusable.length - 1]
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
