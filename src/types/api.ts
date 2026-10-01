/** Envelope thành công của backend: `{ success: true, code: 'SUCCESS', message, data, timestamp }`. */
export interface ApiResponse<T> {
  success: true
  code: string
  message?: string
  data: T
  timestamp?: string
}

/** Trang dữ liệu (`PageResponse` của backend). `page` bắt đầu từ 0. */
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  empty: boolean
}

/** Lỗi theo từng field (400 Validation failed). Mật khẩu bị backend che thành `******`. */
export interface ApiFieldError {
  field: string
  message: string
  rejectedValue?: unknown
}

/** Body lỗi thô của backend. */
export interface ApiErrorBody {
  success: false
  /** Mã lỗi nghiệp vụ, vd. `VRC-400-001`, `VRC-409-101` — xem `API_ERROR_CODES`. */
  code: string
  message: string
  status: number
  path?: string
  method?: string
  traceId?: string
  errors?: ApiFieldError[]
  timestamp?: string
}

/** Lỗi đã chuẩn hoá bởi interceptor của `http`. `status = 0`: lỗi mạng/timeout. */
export interface ApiError {
  status: number
  message: string
  code?: string
  /** Lỗi theo field (thứ tự không cố định). */
  fieldErrors?: ApiFieldError[]
  traceId?: string
  details?: unknown
}
