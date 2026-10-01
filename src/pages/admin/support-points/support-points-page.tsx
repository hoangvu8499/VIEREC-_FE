import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminComingSoon } from '@/layouts/admin/admin-coming-soon'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'

export default function SupportPointsPage() {
  useDocumentTitle('Điểm hỗ trợ sự cố – Quản trị')

  return (
    <>
      <AdminPageHeader
        title="Điểm hỗ trợ sự cố"
        description="Mạng lưới điểm hỗ trợ và đơn vị xử lý sự cố môi trường trên toàn quốc."
      />
      <AdminComingSoon
        features={[
          'Thêm, sửa điểm hỗ trợ kèm địa chỉ và toạ độ',
          'Xem các điểm trên bản đồ',
          'Thông tin liên hệ và năng lực xử lý của từng đơn vị',
          'Tìm điểm hỗ trợ gần vị trí sự cố',
        ]}
      />
    </>
  )
}
