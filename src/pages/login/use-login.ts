import { useMutation, useQueryClient } from '@tanstack/react-query'

import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { CONTACT } from '@/constants/contact'
import { authService } from '@/services/auth-service'
import { useAuthStore } from '@/stores/auth-store'
import type { ApiError } from '@/types/api'
import type { AuthSession, LoginPayload } from '@/types/user'
import { apiErrorMessage } from '@/utils/api-error-message'

/** Đăng nhập — backend set cookie token, FE chỉ lưu `user` vào `useAuthStore`. */
export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()

  return useMutation<AuthSession, ApiError, LoginPayload>({
    mutationFn: authService.login,
    onSuccess: ({ user }) => {
      // Dữ liệu tải lúc còn là khách (vd. `myEnrollmentStatus = null`) không còn đúng.
      // Chỉ xoá query: `clear()` xoá cả mutation đăng nhập đang chạy.
      queryClient.removeQueries()
      setUser(user)
    },
  })
}

const SUPPORT = `Vui lòng liên hệ hotline ${CONTACT.HOTLINE} để được hỗ trợ.`

export function loginErrorMessage(error: ApiError): string {
  switch (error.code) {
    case API_ERROR_CODES.INVALID_CREDENTIALS:
      return 'Tên đăng nhập/email hoặc mật khẩu không đúng.'
    case API_ERROR_CODES.ACCOUNT_DISABLED:
      return `Tài khoản đã bị vô hiệu hoá. ${SUPPORT}`
    // Backend trả mã này khi tài khoản bị khoá.
    case API_ERROR_CODES.UNAUTHENTICATED:
      return `Tài khoản hiện không thể đăng nhập (có thể đã bị khoá). ${SUPPORT}`
    default:
      return apiErrorMessage(error, { fallback: 'Đăng nhập không thành công. Vui lòng thử lại.' })
  }
}

/** Trang cần quay lại sau khi đăng nhập (`state.from` do trang chặn truyền sang). */
export function getRedirectPath(state: unknown, fallback: string): string {
  const from = (state as { from?: unknown } | null)?.from
  // Chỉ nhận đường dẫn nội bộ, tránh chuyển hướng ra ngoài (`//evil.com`).
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
    ? from
    : fallback
}
