import { BadgeCheck, SearchX } from 'lucide-react'
import { useState } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import {
  type EnrollmentChange,
  EnrollmentChangeDialog,
} from '@/pages/admin/courses/components/enrollment-change-dialog'
import { EnrollmentRequestTable } from '@/pages/admin/courses/components/enrollment-request-table'
import { KeywordSearch } from '@/pages/admin/courses/components/keyword-search'
import {
  useEnrollmentRequestParams,
  usePendingEnrollments,
} from '@/pages/admin/courses/use-course-enrollments'
import { apiErrorMessage } from '@/utils/api-error-message'

import styles from './components/course-list.module.css'

const numberFormatter = new Intl.NumberFormat('vi-VN')

/** Hàng chờ duyệt: học viên đã bấm "Đã thanh toán", admin đối chiếu sao kê rồi duyệt hoặc từ chối. */
export default function EnrollmentRequestsPage() {
  useDocumentTitle('Duyệt đăng ký – Quản trị')
  const { keyword, page, setKeyword, setPage } = useEnrollmentRequestParams()
  const requests = usePendingEnrollments({ keyword, page })
  const [change, setChange] = useState<EnrollmentChange>()
  const [flash, setFlash] = useState<string>()
  const data = requests.data

  return (
    <>
      <AdminPageHeader
        title="Duyệt đăng ký"
        description="Học viên đã chuyển khoản và bấm “Đã thanh toán”. Đối chiếu sao kê theo nội dung chuyển khoản rồi duyệt để mở khoá học cho học viên."
      />

      {flash && (
        <Alert variant="success" className={styles.flash}>
          {flash}
        </Alert>
      )}

      <AdminPanel aria-label="Yêu cầu chờ duyệt">
        {/* key: ô tìm kiếm cập nhật theo URL khi bấm Back. */}
        <KeywordSearch
          key={keyword ?? ''}
          label="Tìm yêu cầu"
          placeholder="Tên, username, SĐT học viên hoặc tên khoá học"
          keyword={keyword}
          onChange={setKeyword}
        />

        {requests.isPending ? (
          <p className={styles.loading} aria-busy>
            Đang tải yêu cầu…
          </p>
        ) : requests.isError ? (
          <EmptyState
            icon={BadgeCheck}
            tone="danger"
            title="Không tải được yêu cầu đăng ký"
            description={apiErrorMessage(requests.error, {
              fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            })}
            action={
              <Button variant="outline" onClick={() => void requests.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : data && data.content.length > 0 ? (
          <>
            <EnrollmentRequestTable
              enrollments={data.content}
              isFetching={requests.isPlaceholderData}
              onAction={(enrollment, action) => setChange({ enrollment, action })}
            />
            <div className={styles.footer}>
              <p className={styles.summary}>
                {numberFormatter.format(data.totalElements)} yêu cầu chờ duyệt
              </p>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onChange={setPage}
                label="Phân trang yêu cầu"
              />
            </div>
          </>
        ) : keyword ? (
          <EmptyState
            icon={SearchX}
            title={`Không có yêu cầu nào khớp “${keyword}”`}
            action={
              <Button variant="outline" onClick={() => setKeyword(undefined)}>
                Xem tất cả
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={BadgeCheck}
            title="Không có yêu cầu nào chờ duyệt"
            description="Yêu cầu mới hiện ở đây khi học viên chuyển khoản và bấm “Đã thanh toán”."
          />
        )}
      </AdminPanel>

      <EnrollmentChangeDialog
        change={change}
        onClose={() => setChange(undefined)}
        onDone={setFlash}
      />
    </>
  )
}
