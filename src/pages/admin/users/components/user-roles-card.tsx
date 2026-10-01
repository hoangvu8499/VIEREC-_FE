import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { RolePicker } from '@/pages/admin/users/components/role-picker'
import { RoleBadges } from '@/pages/admin/users/components/user-badges'
import { useAssignRoles, userActionErrorMessage } from '@/pages/admin/users/use-users'
import { USER_FIELD_MESSAGES } from '@/schemas/user-schema'
import type { User } from '@/types/user'

import styles from './user-detail.module.css'

interface UserRolesCardProps {
  user: User
  /** `false` kèm lý do → chỉ xem. */
  editable: boolean
  readonlyReason?: string
  canGrantSuperAdmin: boolean
}

function sameRoles(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((role) => b.includes(role))
}

/** Xem / gán vai trò (`PUT /users/{id}/roles` thay toàn bộ). */
export function UserRolesCard({
  user,
  editable,
  readonlyReason,
  canGrantSuperAdmin,
}: UserRolesCardProps) {
  const [roles, setRoles] = useState(user.roles)
  const [saved, setSaved] = useState(false)
  const assignRoles = useAssignRoles(user.id)
  const changed = !sameRoles(roles, user.roles)
  const empty = roles.length === 0

  return (
    <section className={styles.card} aria-labelledby="roles-title">
      <h2 id="roles-title" className={styles.cardTitle}>
        <ShieldCheck size={20} aria-hidden /> Vai trò
      </h2>

      {editable ? (
        <form
          className={styles.rolesForm}
          onSubmit={(event) => {
            event.preventDefault()
            if (empty || !changed) return
            setSaved(false)
            assignRoles.mutate(roles, { onSuccess: () => setSaved(true) })
          }}
        >
          {assignRoles.isError && (
            <Alert variant="error">
              {userActionErrorMessage(
                assignRoles.error,
                'Không lưu được vai trò. Vui lòng thử lại.',
              )}
            </Alert>
          )}
          {saved && !changed && (
            <Alert variant="success">
              Đã cập nhật vai trò. Có hiệu lực từ lần đăng nhập tiếp theo của người dùng (tối đa 30
              phút).
            </Alert>
          )}
          <RolePicker
            value={roles}
            onChange={(next) => {
              setSaved(false)
              setRoles(next)
            }}
            canGrantSuperAdmin={canGrantSuperAdmin}
            layout="stack"
            disabled={assignRoles.isPending}
            error={empty ? USER_FIELD_MESSAGES.roles.required : undefined}
          />
          <div className={styles.rolesActions}>
            {changed && (
              <Button
                variant="ghost"
                disabled={assignRoles.isPending}
                onClick={() => setRoles(user.roles)}
              >
                Hoàn tác
              </Button>
            )}
            <Button type="submit" loading={assignRoles.isPending} disabled={!changed || empty}>
              Lưu vai trò
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className={styles.rolesView}>
            <RoleBadges roles={user.roles} />
          </div>
          {readonlyReason && <p className={styles.muted}>{readonlyReason}</p>}
        </>
      )}
    </section>
  )
}
