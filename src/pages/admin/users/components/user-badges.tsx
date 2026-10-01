import { ROLE_LABELS, ROLE_ORDER, type RoleCode } from '@/constants/roles'
import { USER_STATUS_LABELS } from '@/constants/user'
import type { UserStatus } from '@/types/user'
import { cn } from '@/utils/cn'

import styles from './user-badges.module.css'

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <span className={cn(styles.badge, styles[status])}>{USER_STATUS_LABELS[status]}</span>
}

function roleLabel(code: string): string {
  return ROLE_LABELS[code as RoleCode] ?? code
}

/** Vai trò xếp theo quyền (cao trước). */
export function RoleBadges({ roles }: { roles: string[] }) {
  const sorted = [...roles].sort(
    (a, b) => ROLE_ORDER.indexOf(a as RoleCode) - ROLE_ORDER.indexOf(b as RoleCode),
  )
  return (
    <span className={styles.roles}>
      {sorted.map((role) => (
        <span key={role} className={cn(styles.role, styles[`role${role}`])}>
          {roleLabel(role)}
        </span>
      ))}
    </span>
  )
}
