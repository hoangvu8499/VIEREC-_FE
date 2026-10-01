import { useMutation, useQueryClient } from '@tanstack/react-query'

import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { CONTACT } from '@/constants/contact'
import { AUTH_QUERY_KEYS } from '@/hooks/use-session-sync'
import { authService } from '@/services/auth-service'
import { useAuthStore } from '@/stores/auth-store'
import type { ApiError } from '@/types/api'
import type { ChangePasswordPayload, UpdateProfilePayload, User } from '@/types/user'
import { apiErrorMessage } from '@/utils/api-error-message'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  return useMutation<User, ApiError, UpdateProfilePayload>({
    mutationFn: authService.updateProfile,
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, user)
    },
  })
}

export function useChangePassword() {
  return useMutation<void, ApiError, ChangePasswordPayload>({
    mutationFn: authService.changePassword,
  })
}

/**
 * Thông báo trong Alert đầu form hồ sơ.
 * @param fieldMessages lỗi đã gắn vào từng ô (từ `userApiFieldErrors`).
 */
export function profileErrorMessage(error: ApiError, fieldMessages: string[]): string {
  if (error.code === API_ERROR_CODES.IDENTITY_LOCKED) {
    return `Bạn đã được cấp chứng chỉ nên không thể tự đổi họ tên, ngày sinh, CCCD. Vui lòng liên hệ hotline ${CONTACT.HOTLINE}.`
  }
  if (error.status === 409 && fieldMessages.length === 1) {
    return `${fieldMessages[0]}. Vui lòng dùng thông tin khác.`
  }
  if (fieldMessages.length > 0) {
    return 'Một số thông tin chưa hợp lệ. Vui lòng kiểm tra lại các ô được đánh dấu bên dưới.'
  }
  return apiErrorMessage(error, {
    fallback: 'Không lưu được hồ sơ. Vui lòng kiểm tra lại thông tin.',
    byStatus: { 401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' },
  })
}
