import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { authService } from '@/services/auth-service'
import { useAuthStore } from '@/stores/auth-store'

export const AUTH_QUERY_KEYS = {
  me: ['auth', 'me'],
} as const

/**
 * Khi tải trang mà localStorage còn `user`: gọi `/auth/me` để xác nhận cookie còn hiệu lực và cập nhật
 * thông tin mới nhất. Cookie hết hạn và refresh thất bại → interceptor `clearSession()`.
 */
export function useSessionSync() {
  const hasUser = useAuthStore((state) => state.user !== null)
  const setUser = useAuthStore((state) => state.setUser)

  const { data } = useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: authService.me,
    enabled: hasUser,
    staleTime: Infinity,
    retry: false,
  })

  useEffect(() => {
    if (data) setUser(data)
  }, [data, setUser])
}
