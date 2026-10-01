import { SearchX } from 'lucide-react'

import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { ADMIN_ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'

export default function AdminNotFoundPage() {
  useDocumentTitle('Không tìm thấy trang – Quản trị')

  return (
    <EmptyState
      icon={SearchX}
      title="Không tìm thấy trang"
      description="Trang quản trị bạn tìm không tồn tại hoặc đã được chuyển đi."
      action={
        <ButtonLink to={ADMIN_ROUTES.DASHBOARD} variant="primary">
          Về trang tổng quan
        </ButtonLink>
      }
    />
  )
}
