import { useNavigate } from 'react-router'

import { ADMIN_ROUTES, adminBusinessPath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { CreateBusinessForm } from '@/pages/admin/businesses/components/business-forms'
import type { FlashState } from '@/types/navigation'

export default function BusinessCreatePage() {
  useDocumentTitle('Thêm doanh nghiệp – Quản trị')
  const navigate = useNavigate()

  return (
    <>
      <AdminPageHeader
        back={{ to: ADMIN_ROUTES.BUSINESSES, label: 'Danh sách doanh nghiệp' }}
        title="Thêm doanh nghiệp"
        description="Tạo doanh nghiệp và tài khoản quản lý đầu tiên. Gửi tên đăng nhập, mật khẩu cho người phụ trách của doanh nghiệp."
      />
      <AdminPanel padded aria-label="Thông tin doanh nghiệp">
        <CreateBusinessForm
          onSuccess={(business) =>
            void navigate(adminBusinessPath(business.id), {
              state: { flash: `Đã tạo doanh nghiệp ${business.name}.` } satisfies FlashState,
            })
          }
        />
      </AdminPanel>
    </>
  )
}
