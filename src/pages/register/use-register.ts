import { useMutation } from '@tanstack/react-query'

import { authService } from '@/services/auth-service'
import type { ApiError } from '@/types/api'
import type { RegisterPayload, User } from '@/types/user'
import { apiErrorMessage } from '@/utils/api-error-message'

export function useRegister() {
  return useMutation<User, ApiError, RegisterPayload>({
    mutationFn: authService.register,
  })
}

/**
 * Thông báo trong Alert đầu form.
 * @param fieldMessages lỗi đã gắn vào từng ô (từ `userApiFieldErrors`).
 */
export function registerErrorMessage(error: ApiError, fieldMessages: string[]): string {
  // 409: chỉ một field trùng — nêu thẳng trong Alert.
  if (error.status === 409 && fieldMessages.length === 1) {
    return `${fieldMessages[0]}. Vui lòng dùng thông tin khác hoặc đăng nhập nếu đã có tài khoản.`
  }
  if (fieldMessages.length > 0) {
    return 'Một số thông tin chưa hợp lệ. Vui lòng kiểm tra lại các ô được đánh dấu bên dưới.'
  }
  return apiErrorMessage(error, {
    fallback: 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.',
  })
}
