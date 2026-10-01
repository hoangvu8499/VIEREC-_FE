import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { env } from '@/config/env'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { useAuthStore } from '@/stores/auth-store'
import type { ApiError, ApiErrorBody, ApiResponse } from '@/types/api'
import type { AuthSession } from '@/types/user'

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: { 'Content-Type': 'application/json' },
  // Token nằm trong cookie HttpOnly — phải gửi kèm cookie (cả khi API khác origin).
  withCredentials: true,
})

/** Chuẩn hoá lỗi axios thành `ApiError` (body lỗi backend: `ApiErrorBody`). */
export function toApiError(error: AxiosError<Partial<ApiErrorBody>>): ApiError {
  const body = error.response?.data
  return {
    status: error.response?.status ?? 0,
    message: body?.message ?? error.message,
    code: body?.code,
    fieldErrors: Array.isArray(body?.errors) ? body.errors : undefined,
    traceId: body?.traceId,
    details: body,
  }
}

/** 401 ở các endpoint này mang nghĩa riêng (sai mật khẩu, refresh hỏng...) — không thử refresh. */
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  // Sai mật khẩu hiện tại → 401 `INVALID_CREDENTIALS`, phiên vẫn còn hiệu lực.
  '/auth/me/password',
]

type RetriableConfig = InternalAxiosRequestConfig & { retriedAfterRefresh?: boolean }

let refreshing: Promise<void> | null = null

/** Gọi `/auth/refresh` (cookie `refresh_token`) — gộp các request 401 đồng thời thành một lần. */
function refreshSession(): Promise<void> {
  refreshing ??= http
    .post<ApiResponse<AuthSession>>('/auth/refresh')
    .then(({ data }) => useAuthStore.getState().setUser(data.data.user))
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<Partial<ApiErrorBody>>) => {
    const config = error.config as RetriableConfig | undefined
    const canRefresh =
      error.response?.status === 401 &&
      config &&
      !config.retriedAfterRefresh &&
      !NO_REFRESH_PATHS.some((path) => config.url?.startsWith(path))

    // Access token (30 phút) hết hạn → đổi cặp token mới rồi gửi lại request một lần.
    if (canRefresh) {
      config.retriedAfterRefresh = true
      try {
        await refreshSession()
        return await http(config)
      } catch {
        // Refresh hỏng: rơi xuống dưới, trả lỗi 401 gốc.
      }
    }

    const apiError = toApiError(error)
    if (apiError.status === 401 && apiError.code !== API_ERROR_CODES.INVALID_CREDENTIALS) {
      useAuthStore.getState().clearSession()
    }
    return Promise.reject(apiError)
  },
)
