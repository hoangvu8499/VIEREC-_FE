import { useMutation } from '@tanstack/react-query'

import { authService } from '@/services/auth-service'
import type { ApiError } from '@/types/api'
import type { ForgotPasswordPayload } from '@/types/user'
import { apiErrorMessage } from '@/utils/api-error-message'

export function useForgotPassword() {
  return useMutation<void, ApiError, ForgotPasswordPayload>({
    mutationFn: authService.forgotPassword,
  })
}

export function forgotPasswordErrorMessage(error: ApiError): string {
  return apiErrorMessage(error, {
    fallback: 'Không gửi được yêu cầu. Vui lòng thử lại.',
    byStatus: { 429: 'Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng thử lại sau ít phút.' },
  })
}
