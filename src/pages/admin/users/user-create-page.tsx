import { useNavigate } from 'react-router'

import { ADMIN_ROUTES, adminUserPath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { CreateUserForm } from '@/pages/admin/users/components/create-user-form'
import type { FlashState } from '@/types/navigation'
import { userFullName } from '@/utils/user-full-name'

export default function UserCreatePage() {
  useDocumentTitle('Thêm tài khoản – Quản trị')
  const navigate = useNavigate()

  return (
    <>
      <AdminPageHeader
        back={{ to: ADMIN_ROUTES.USERS, label: 'Danh sách người dùng' }}
        title="Thêm tài khoản"
        description="Tạo tài khoản học viên hoặc quản trị viên. Người dùng đăng nhập bằng tên đăng nhập và mật khẩu này."
      />
      <AdminPanel padded aria-label="Thông tin tài khoản">
        <CreateUserForm
          onSuccess={(user) =>
            void navigate(adminUserPath('USER_DETAIL', user.id), {
              state: {
                flash: `Đã tạo tài khoản ${userFullName(user) || user.username}.`,
              } satisfies FlashState,
            })
          }
        />
      </AdminPanel>
    </>
  )
}
