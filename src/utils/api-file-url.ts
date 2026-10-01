import { env } from '@/config/env'

/**
 * Link file backend trả (vd. `/api/v1/files/1`) → URL mở được trên trình duyệt.
 * Path tuyệt đối lấy origin của API (dev: cùng origin qua proxy; prod có thể khác origin).
 */
export function apiFileUrl(path: string): string {
  const apiBase = new URL(env.apiBaseUrl, window.location.origin)
  return new URL(path, apiBase).toString()
}
