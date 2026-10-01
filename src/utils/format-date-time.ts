const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * `2026-09-26T08:30:15.123` → `08:30 26/09/2026`.
 * Backend trả giờ server không kèm múi giờ → đọc như giờ địa phương. Chuỗi hỏng trả nguyên.
 */
export function formatDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime)
  return Number.isNaN(date.getTime()) ? isoDateTime : dateTimeFormatter.format(date)
}
