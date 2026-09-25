const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** `2026-09-20` → `20/09/2026`. Ngày không hợp lệ trả về chuỗi gốc. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return isoDate
  // Tạo theo giờ địa phương để tránh lệch ngày do múi giờ.
  return dateFormatter.format(new Date(year, month - 1, day))
}
