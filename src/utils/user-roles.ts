import { ADMIN_ROLES, ROLE_LABELS, ROLE_ORDER, ROLES } from '@/constants/roles'
import type { User } from '@/types/user'

export function hasAnyRole(user: Pick<User, 'roles'> | null, roles: readonly string[]): boolean {
  return !!user && user.roles.some((role) => roles.includes(role))
}

export function isAdmin(user: Pick<User, 'roles'> | null): boolean {
  return hasAnyRole(user, ADMIN_ROLES)
}

/** Quản lý doanh nghiệp (khớp `@PreAuthorize("hasRole('BUSINESS')")`). */
export function isBusinessManager(user: Pick<User, 'roles'> | null): boolean {
  return hasAnyRole(user, [ROLES.BUSINESS])
}

/** Nhãn tiếng Việt của role cao nhất (SUPER_ADMIN > ADMIN > BUSINESS > TRAINEE). */
export function primaryRoleLabel(user: Pick<User, 'roles'>): string {
  const role = ROLE_ORDER.find((code) => user.roles.includes(code))
  return role ? ROLE_LABELS[role] : (user.roles[0] ?? '')
}
