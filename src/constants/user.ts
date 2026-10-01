import type { UserSearchParams } from '@/services/user-service'
import type { UserStatus } from '@/types/user'

/** Tạo / sửa / xoá / gán vai trò xong thì invalidate `USER_QUERY_KEYS.all`. */
export const USER_QUERY_KEYS = {
  all: ['users'],
  list: (params: UserSearchParams) => ['users', 'list', params],
  detail: (id: number) => ['users', 'detail', id],
  roles: ['roles'],
} as const

export const USER_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'LOCKED',
] as const satisfies readonly UserStatus[]

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngưng hoạt động',
  LOCKED: 'Bị khoá',
}

export const USER_STATUS_HINTS: Record<UserStatus, string> = {
  ACTIVE: 'Đăng nhập và học bình thường.',
  INACTIVE: 'Tạm ngưng, không đăng nhập được.',
  LOCKED: 'Bị khoá (vd. vi phạm), không đăng nhập được.',
}

export const USER_PAGE_SIZE = 10
