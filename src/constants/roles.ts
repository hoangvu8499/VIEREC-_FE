/** Mã role backend (`RoleCode`). */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TRAINEE: 'TRAINEE',
  /** Quản lý doanh nghiệp: tạo tài khoản, ghi danh và theo dõi học viên của doanh nghiệp mình. */
  BUSINESS: 'BUSINESS',
} as const

export type RoleCode = (typeof ROLES)[keyof typeof ROLES]

/** Được vào trang quản trị (khớp `@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")`). */
export const ADMIN_ROLES: readonly RoleCode[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN]

/** Thứ tự hiển thị (quyền cao trước). */
export const ROLE_ORDER: readonly RoleCode[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.BUSINESS,
  ROLES.TRAINEE,
]

export const ROLE_LABELS: Record<RoleCode, string> = {
  SUPER_ADMIN: 'Quản trị cấp cao',
  ADMIN: 'Quản trị viên',
  TRAINEE: 'Học viên',
  BUSINESS: 'Quản lý doanh nghiệp',
}
