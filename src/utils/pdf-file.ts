import { apiFileUrl } from '@/utils/api-file-url'

/** Link tải file về máy (BE trả `Content-Disposition: attachment`), không mở trong trình duyệt. */
export function fileDownloadUrl(path: string): string {
  const url = new URL(apiFileUrl(path))
  url.searchParams.set('download', 'true')
  return url.toString()
}

/** Thời gian giữ iframe in: hộp thoại in của trình duyệt chặn trang, gỡ sớm thì bản in trống. */
const PRINT_FRAME_LIFETIME_MS = 60_000

/**
 * In file PDF bằng hộp thoại in của trình duyệt (nạp vào iframe ẩn rồi gọi `print()`).
 * API khác origin thì trình duyệt chặn truy cập iframe → mở PDF ở tab mới để người dùng tự in.
 */
export function printPdf(path: string): Promise<void> {
  const url = apiFileUrl(path)
  return new Promise((resolve) => {
    const frame = document.createElement('iframe')
    frame.title = 'In chứng chỉ'
    frame.setAttribute('aria-hidden', 'true')
    Object.assign(frame.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '0',
      height: '0',
      border: '0',
    })
    frame.addEventListener('load', () => {
      try {
        frame.contentWindow?.focus()
        frame.contentWindow?.print()
      } catch {
        window.open(url, '_blank', 'noopener')
      }
      window.setTimeout(() => frame.remove(), PRINT_FRAME_LIFETIME_MS)
      resolve()
    })
    frame.src = url
    document.body.append(frame)
  })
}
