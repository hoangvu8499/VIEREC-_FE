import { useMutation } from '@tanstack/react-query'

import { authService } from '@/services/auth-service'
import type { ApiError } from '@/types/api'
import type { ResetPasswordPayload } from '@/types/user'
import { apiErrorMessage } from '@/utils/api-error-message'

export function useResetPassword() {
  return useMutation<void, ApiError, ResetPasswordPayload>({
    mutationFn: authService.resetPassword,
  })
}

/** Token sai/hết hạn — cần yêu cầu gửi lại liên kết. */
export function isInvalidTokenError(error: ApiError): boolean {
  return error.status === 400 || error.status === 404 || error.status === 410
}

export function resetPasswordErrorMessage(error: ApiError): string {
  return apiErrorMessage(error, {
    fallback: 'Đặt lại mật khẩu không thành công. Vui lòng thử lại.',
    byStatus: isInvalidTokenError(error)
      ? { [error.status]: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' }
      : undefined,
  })
}
