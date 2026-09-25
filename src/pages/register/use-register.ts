import { useMutation } from '@tanstack/react-query'

import { authService } from '@/services/auth-service'
import type { ApiError } from '@/types/api'
import type { RegisterPayload, User } from '@/types/user'

export function useRegister() {
  return useMutation<User, ApiError, RegisterPayload>({
    mutationFn: authService.register,
  })
}

/** Thông báo lỗi thân thiện từ `ApiError`. */
export function registerErrorMessage(error: ApiError): string {
  if (error.status === 0) return 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.'
  if (error.status >= 500) return 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.'
  return error.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.'
}
