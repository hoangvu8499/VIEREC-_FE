import { useQuery } from '@tanstack/react-query'

import { ENROLLMENT_QUERY_KEYS } from '@/constants/course'
import { enrollmentService } from '@/services/enrollment-service'
import { userService } from '@/services/user-service'

/** Chỉ cần `totalElements` → xin trang 1 phần tử. */
const COUNT_ONLY = { page: 0, size: 1 } as const

export const DASHBOARD_QUERY_KEYS = {
  userCount: ['admin', 'dashboard', 'users', 'total'],
  activeUserCount: ['admin', 'dashboard', 'users', 'active'],
} as const

export function useDashboardStats() {
  const totalUsers = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.userCount,
    queryFn: () => userService.search(COUNT_ONLY),
    select: (page) => page.totalElements,
  })
  const activeUsers = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.activeUserCount,
    queryFn: () => userService.search({ ...COUNT_ONLY, status: 'ACTIVE' }),
    select: (page) => page.totalElements,
  })

  // Cùng tiền tố ENROLLMENT_QUERY_KEYS.all → duyệt xong là số liệu tự cập nhật.
  const pendingEnrollments = useQuery({
    queryKey: ENROLLMENT_QUERY_KEYS.search({ ...COUNT_ONLY, status: 'PENDING' }),
    queryFn: () => enrollmentService.search({ ...COUNT_ONLY, status: 'PENDING' }),
    select: (page) => page.totalElements,
  })

  return { totalUsers, activeUsers, pendingEnrollments }
}
