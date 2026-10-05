import type {
  BusinessMemberSearchParams,
  BusinessSearchParams,
  BusinessStatus,
} from '@/types/business'

/** Tạo / sửa doanh nghiệp, tài khoản quản lý, học viên xong thì invalidate `BUSINESS_QUERY_KEYS.all`. */
export const BUSINESS_QUERY_KEYS = {
  all: ['businesses'],
  list: (params: BusinessSearchParams) => ['businesses', 'list', params],
  detail: (id: number) => ['businesses', 'detail', id],
  managers: (id: number) => ['businesses', 'managers', id],
  members: (id: number, params: BusinessMemberSearchParams) => [
    'businesses',
    'members',
    id,
    params,
  ],
  member: (id: number, userId: number) => ['businesses', 'member', id, userId],
  /** Doanh nghiệp của người quản lý đang đăng nhập. */
  mine: ['businesses', 'mine'],
  myMembers: (params: BusinessMemberSearchParams) => ['businesses', 'mine', 'members', params],
  myCertificates: (params: BusinessMemberSearchParams) => [
    'businesses',
    'mine',
    'certificates',
    params,
  ],
  myCertificate: (code: string) => ['businesses', 'mine', 'certificate', code],
  myMember: (userId: number) => ['businesses', 'mine', 'member', userId],
} as const

export const BUSINESS_STATUSES = ['ACTIVE', 'INACTIVE'] as const satisfies readonly BusinessStatus[]

export const BUSINESS_STATUS_LABELS: Record<BusinessStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
}

export const BUSINESS_STATUS_HINTS: Record<BusinessStatus, string> = {
  ACTIVE: 'Người quản lý tạo tài khoản, ghi danh và theo dõi học viên.',
  INACTIVE: 'Người quản lý không dùng được chức năng doanh nghiệp; học viên vẫn học bình thường.',
}

export const BUSINESS_PAGE_SIZE = 10
