import { useNavigate } from 'react-router'

import { ADMIN_ROUTES, adminUserPath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { EditUserForm } from '@/pages/admin/users/components/edit-user-form'
import { UserQueryState } from '@/pages/admin/users/components/user-query-state'
import { useUserDetail, useUserIdParam } from '@/pages/admin/users/use-users'
import { useAuthStore } from '@/stores/auth-store'
import type { FlashState } from '@/types/navigation'
import { userFullName } from '@/utils/user-full-name'

export default function UserEditPage() {
  useDocumentTitle('Sửa tài khoản – Quản trị')
  const navigate = useNavigate()
  const actor = useAuthStore((state) => state.user)
  const userId = useUserIdParam()
  const user = useUserDetail(userId)

  return (
    <>
      <AdminPageHeader
        back={
          userId
            ? { to: adminUserPath('USER_DETAIL', userId), label: 'Chi tiết tài khoản' }
            : { to: ADMIN_ROUTES.USERS, label: 'Danh sách người dùng' }
        }
        title="Sửa tài khoản"
        description={user.data && (userFullName(user.data) || user.data.username)}
      />
      <UserQueryState query={userId ? user : undefined}>
        {(data) => (
          <AdminPanel padded aria-label="Thông tin tài khoản">
            <EditUserForm
              user={data}
              isSelf={data.id === actor?.id}
              onSuccess={(saved) =>
                void navigate(adminUserPath('USER_DETAIL', saved.id), {
                  state: { flash: 'Đã lưu thay đổi của tài khoản.' } satisfies FlashState,
                })
              }
            />
          </AdminPanel>
        )}
      </UserQueryState>
    </>
  )
}
