import type { ApiError } from '@/types/api'

interface ApiErrorMessageOptions {
  /** Thông báo mặc định (message của backend là tiếng Anh nên không hiện thẳng cho người dùng). */
  fallback: string
  /** Ghi đè thông báo theo mã HTTP (vd. 401 khi đăng nhập sai). */
  byStatus?: Partial<Record<number, string>>
}

/** Thông báo lỗi thân thiện (tiếng Việt) từ `ApiError`. */
export function apiErrorMessage(error: ApiError, { fallback, byStatus }: ApiErrorMessageOptions) {
  const override = byStatus?.[error.status]
  if (override) return override
  if (error.status === 0) return 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.'
  if (error.status === 404) return 'Chức năng này hiện chưa sẵn sàng. Vui lòng thử lại sau.'
  if (error.status >= 500) return 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.'
  return fallback
}
