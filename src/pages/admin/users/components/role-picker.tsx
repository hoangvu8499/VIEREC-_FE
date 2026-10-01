import { CircleAlert } from 'lucide-react'
import type { Ref } from 'react'

import { CheckboxField } from '@/components/form/checkbox-field'
import { ROLE_LABELS, ROLE_ORDER, ROLES, type RoleCode } from '@/constants/roles'
import { useRoles } from '@/pages/admin/users/use-users'
import type { Role } from '@/types/user'
import { cn } from '@/utils/cn'

import styles from './user-form.module.css'

interface RolePickerProps {
  value: string[]
  onChange: (roles: string[]) => void
  /** Người thao tác được cấp / gỡ SUPER_ADMIN không. */
  canGrantSuperAdmin: boolean
  error?: string
  disabled?: boolean
  /** Để react-hook-form focus ô đầu tiên khi lỗi. */
  ref?: Ref<HTMLInputElement>
  /** `stack`: một cột (thẻ hẹp); nhãn nhóm chỉ còn cho trình đọc màn hình. */
  layout?: 'grid' | 'stack'
}

function sortRoles(roles: Role[]): Role[] {
  const rank = (code: string) => {
    const index = ROLE_ORDER.indexOf(code as RoleCode)
    return index < 0 ? ROLE_ORDER.length : index
  }
  return [...roles].sort((a, b) => rank(a.code) - rank(b.code))
}

/** Nhóm ô tích vai trò (danh sách lấy từ `GET /roles`). */
export function RolePicker({
  value,
  onChange,
  canGrantSuperAdmin,
  error,
  disabled,
  ref,
  layout = 'grid',
}: RolePickerProps) {
  const roles = useRoles()

  return (
    <fieldset className={styles.rolePicker} aria-invalid={error ? true : undefined}>
      <legend className={layout === 'stack' ? 'sr-only' : styles.roleLegend}>
        Vai trò <span className={styles.required}>*</span>
      </legend>
      {roles.isPending && <p className={styles.note}>Đang tải danh sách vai trò…</p>}
      {roles.isError && (
        <p className={styles.note}>Không tải được danh sách vai trò. Vui lòng tải lại trang.</p>
      )}
      {roles.data && (
        <div className={cn(styles.roleList, layout === 'stack' && styles.roleStack)}>
          {sortRoles(roles.data).map((role, index) => {
            const locked = role.code === ROLES.SUPER_ADMIN && !canGrantSuperAdmin
            const checked = value.includes(role.code)
            const label = ROLE_LABELS[role.code as RoleCode] ?? role.name
            return (
              <CheckboxField
                key={role.code}
                ref={index === 0 ? ref : undefined}
                label={label}
                hint={
                  locked
                    ? 'Chỉ Quản trị cấp cao mới cấp hoặc gỡ được vai trò này.'
                    : role.description === label
                      ? undefined
                      : role.description
                }
                fieldClassName={styles.roleOption}
                checked={checked}
                disabled={disabled || locked}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...value, role.code]
                      : value.filter((code) => code !== role.code),
                  )
                }
              />
            )
          })}
        </div>
      )}
      {error && (
        <p className={styles.error}>
          <CircleAlert size={14} aria-hidden /> {error}
        </p>
      )}
    </fieldset>
  )
}
