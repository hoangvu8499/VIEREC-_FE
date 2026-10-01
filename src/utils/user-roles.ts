import { ADMIN_ROLES, ROLE_LABELS, type RoleCode } from '@/constants/roles'
import type { User } from '@/types/user'

export function hasAnyRole(user: Pick<User, 'roles'> | null, roles: readonly string[]): boolean {
  return !!user && user.roles.some((role) => roles.includes(role))
}

export function isAdmin(user: Pick<User, 'roles'> | null): boolean {
  return hasAnyRole(user, ADMIN_ROLES)
}

/** Nhãn tiếng Việt của role cao nhất (SUPER_ADMIN > ADMIN > TRAINEE). */
export function primaryRoleLabel(user: Pick<User, 'roles'>): string {
  const order: RoleCode[] = ['SUPER_ADMIN', 'ADMIN', 'TRAINEE']
  const role = order.find((code) => user.roles.includes(code))
  return role ? ROLE_LABELS[role] : (user.roles[0] ?? '')
}
