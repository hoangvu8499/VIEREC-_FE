const UNITS = ['B', 'KB', 'MB', 'GB'] as const

const numberFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 })

/** `1536` → `1,5 KB`. Dùng hệ 1024 như giới hạn upload của backend. */
export function formatFileSize(bytes: number): string {
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${numberFormatter.format(value)} ${UNITS[unit]}`
}
