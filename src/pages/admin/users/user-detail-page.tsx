import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ADMIN_ROUTES, adminUserPath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { UserStatusBadge } from '@/pages/admin/users/components/user-badges'
import { UserQueryState } from '@/pages/admin/users/components/user-query-state'
import { UserRolesCard } from '@/pages/admin/users/components/user-roles-card'
import {
  useDeleteUser,
  userActionErrorMessage,
  useUserDetail,
  useUserIdParam,
} from '@/pages/admin/users/use-users'
import {
  canEditRoles,
  canGrantSuperAdmin,
  canManageUser,
} from '@/pages/admin/users/user-permissions'
import { useAuthStore } from '@/stores/auth-store'
import type { FlashState } from '@/types/navigation'
import type { User } from '@/types/user'
import { formatDate } from '@/utils/format-date'
import { formatDateTime } from '@/utils/format-date-time'
import { learnerOrganization } from '@/utils/learner-organization'
import { isAdmin } from '@/utils/user-roles'
import { userFullName } from '@/utils/user-full-name'

import styles from './components/user-detail.module.css'

function displayName(user: User): string {
  return userFullName(user) || user.username
}

export default function UserDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const actor = useAuthStore((state) => state.user)
  const userId = useUserIdParam()
  const user = useUserDetail(userId)
  useDocumentTitle(`${user.data ? displayName(user.data) : 'Tài khoản'} – Quản trị`)

  const [flash] = useState((location.state as FlashState | null)?.flash)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleteUser = useDeleteUser()

  const data = user.data
  const isSelf = data?.id === actor?.id
  const manageable = data ? canManageUser(actor, data) : false

  return (
    <>
      <AdminPageHeader
        back={{ to: ADMIN_ROUTES.USERS, label: 'Danh sách người dùng' }}
        title={data ? displayName(data) : 'Chi tiết tài khoản'}
        action={
          data &&
          manageable && (
            <>
              {!isSelf && (
                <Button
                  variant="ghost"
                  className={styles.deleteButton}
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={18} aria-hidden /> Xoá
                </Button>
              )}
              <ButtonLink to={adminUserPath('USER_EDIT', data.id)} variant="outline">
                <Pencil size={18} aria-hidden /> Sửa thông tin
              </ButtonLink>
            </>
          )
        }
      />

      {flash && (
        <Alert variant="success" className={styles.flash}>
          {flash}
        </Alert>
      )}

      <UserQueryState query={userId ? user : undefined}>
        {(target) => (
          <div className={styles.layout}>
            <section className={styles.card} aria-label="Thông tin tài khoản">
              <div className={styles.profile}>
                <span className={styles.avatar} aria-hidden>
                  {(target.firstName.trim().split(/\s+/).at(-1) || target.username)
                    .charAt(0)
                    .toUpperCase()}
                </span>
                <div className={styles.profileText}>
                  <p className={styles.name}>{displayName(target)}</p>
                  <p className={styles.username}>
                    @{target.username}
                    {target.id === actor?.id && ' · tài khoản của bạn'}
                  </p>
                  <UserStatusBadge status={target.status} />
                </div>
              </div>
              <dl className={styles.info}>
                <div>
                  <dt>Email</dt>
                  <dd>{target.email}</dd>
                </div>
                <div>
                  <dt>Số điện thoại</dt>
                  <dd>{target.phoneNumber}</dd>
                </div>
                <div>
                  <dt>Số CCCD</dt>
                  <dd>{target.cccd}</dd>
                </div>
                <div>
                  <dt>Ngày sinh</dt>
                  <dd>{formatDate(target.dateOfBirth)}</dd>
                </div>
                <div>
                  <dt>Địa chỉ</dt>
                  <dd>{target.address}</dd>
                </div>
                {!isAdmin(target) && (
                  <div>
                    <dt>Đơn vị</dt>
                    <dd>{learnerOrganization(target.businessName)}</dd>
                  </div>
                )}
                <div>
                  <dt>Ngày tạo · Cập nhật</dt>
                  <dd>
                    {formatDateTime(target.createdAt)} · {formatDateTime(target.updatedAt)}
                  </dd>
                </div>
              </dl>
            </section>

            <UserRolesCard
              // Remount khi vai trò trên server đổi (sau khi lưu) để ô tích khớp dữ liệu mới.
              key={target.roles.join(',')}
              user={target}
              editable={canEditRoles(actor, target)}
              readonlyReason={
                target.id === actor?.id
                  ? 'Bạn không thể tự thay đổi vai trò của chính mình.'
                  : 'Chỉ Quản trị cấp cao mới được thay đổi vai trò của tài khoản Quản trị cấp cao.'
              }
              canGrantSuperAdmin={canGrantSuperAdmin(actor)}
            />
          </div>
        )}
      </UserQueryState>

      <ConfirmDialog
        open={confirmDelete}
        title="Xoá tài khoản?"
        description={
          data && (
            <>
              Tài khoản <strong>{displayName(data)}</strong> (@{data.username}) sẽ bị vô hiệu hoá và
              không đăng nhập được nữa.
            </>
          )
        }
        confirmLabel="Xoá tài khoản"
        loading={deleteUser.isPending}
        error={
          deleteUser.isError
            ? userActionErrorMessage(deleteUser.error, 'Không xoá được. Vui lòng thử lại.')
            : undefined
        }
        onConfirm={() => {
          if (!data) return
          const name = displayName(data)
          deleteUser.mutate(data, {
            onSuccess: () =>
              void navigate(ADMIN_ROUTES.USERS, {
                state: { flash: `Đã xoá tài khoản ${name}.` } satisfies FlashState,
              }),
          })
        }}
        onCancel={() => {
          setConfirmDelete(false)
          deleteUser.reset()
        }}
      />
    </>
  )
}
