export type PageItem = number | 'gap'

/**
 * Các trang cần hiện (0-based): trang đầu, trang cuối, và 1 trang mỗi bên trang hiện tại.
 * Khoảng bị bỏ qua đúng 1 trang thì hiện luôn trang đó thay cho dấu "…".
 */
export function pageItems(page: number, totalPages: number): PageItem[] {
  const pages = new Set([0, totalPages - 1, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 0 && p < totalPages).sort((a, b) => a - b)

  const items: PageItem[] = []
  let previous = -1
  for (const current of sorted) {
    if (current - previous === 2) items.push(previous + 1)
    else if (current - previous > 2) items.push('gap')
    items.push(current)
    previous = current
  }
  return items
}
