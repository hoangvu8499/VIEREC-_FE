import { ROLES } from '@/constants/roles'
import type { User } from '@/types/user'
import { hasAnyRole } from '@/utils/user-roles'

type Actor = Pick<User, 'id' | 'roles'> | null

function isSuperAdmin(user: Pick<User, 'roles'> | null): boolean {
  return hasAnyRole(user, [ROLES.SUPER_ADMIN])
}

/**
 * Lớp giao diện, phản chiếu luật backend về vai trò: chỉ SUPER_ADMIN đụng tới tài khoản SUPER_ADMIN.
 * (Backend chỉ chặn ở API gán vai trò; sửa / xoá SUPER_ADMIN bởi ADMIN FE cũng ẩn đi cho nhất quán.)
 */
export function canManageUser(actor: Actor, target: Pick<User, 'roles'>): boolean {
  return isSuperAdmin(actor) || !isSuperAdmin(target)
}

/** Không ai tự đổi vai trò của mình (`VRC-403-102`). */
export function canEditRoles(actor: Actor, target: Pick<User, 'id' | 'roles'>): boolean {
  return actor?.id !== target.id && canManageUser(actor, target)
}

/** Chỉ SUPER_ADMIN cấp / gỡ được vai trò SUPER_ADMIN (`VRC-403-101`). */
export function canGrantSuperAdmin(actor: Actor): boolean {
  return isSuperAdmin(actor)
}
