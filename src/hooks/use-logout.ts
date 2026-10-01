import { useMutation, useQueryClient } from '@tanstack/react-query'

import { authService } from '@/services/auth-service'
import { useAuthStore } from '@/stores/auth-store'
import type { ApiError } from '@/types/api'

/**
 * Đăng xuất: chờ backend xoá cookie, rồi xoá phiên phía FE và cache của tài khoản đó.
 * Lỗi (mất mạng...) vẫn xoá phiên FE — người dùng đã chủ động đăng xuất; lần đăng nhập sau
 * sẽ ghi đè cookie cũ.
 */
export function useLogout({ onSettled }: { onSettled?: () => void } = {}) {
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((state) => state.clearSession)

  return useMutation<void, ApiError>({
    mutationFn: authService.logout,
    onError: (error) => console.warn('Đăng xuất phía server thất bại', error),
    onSettled: () => {
      clearSession()
      queryClient.clear()
      onSettled?.()
    },
  })
}
