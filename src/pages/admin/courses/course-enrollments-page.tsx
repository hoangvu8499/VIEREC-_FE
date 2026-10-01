import { Users } from 'lucide-react'
import { useState } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { SelectField } from '@/components/form/select-field'
import { ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUSES } from '@/constants/course'
import { adminCoursePath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { CourseQueryState } from '@/pages/admin/courses/components/course-query-state'
import {
  type EnrollmentChange,
  EnrollmentChangeDialog,
} from '@/pages/admin/courses/components/enrollment-change-dialog'
import { EnrollmentTable } from '@/pages/admin/courses/components/enrollment-table'
import { IssueCertificateDialog } from '@/pages/admin/courses/components/issue-certificate-dialog'
import { useCourseDetail, usePositiveIdParam } from '@/pages/admin/courses/use-course-detail'
import {
  useCourseEnrollments,
  useEnrollmentListParams,
} from '@/pages/admin/courses/use-course-enrollments'
import type { Enrollment, EnrollmentStatus } from '@/types/course'
import { apiErrorMessage } from '@/utils/api-error-message'

import styles from './components/course-list.module.css'

const STATUS_OPTIONS = ENROLLMENT_STATUSES.map((status) => ({
  value: status,
  label: ENROLLMENT_STATUS_LABELS[status],
}))

const numberFormatter = new Intl.NumberFormat('vi-VN')

export default function CourseEnrollmentsPage() {
  const courseId = usePositiveIdParam('courseId')
  const course = useCourseDetail(courseId)
  useDocumentTitle(`Học viên – ${course.data?.name ?? 'Khoá học'} – Quản trị`)

  const { status, page, setStatus, setPage } = useEnrollmentListParams()
  const enrollments = useCourseEnrollments(courseId, { status, page })
  const [change, setChange] = useState<EnrollmentChange>()
  const [issuing, setIssuing] = useState<Enrollment>()
  const [flash, setFlash] = useState<string>()

  const data = enrollments.data

  return (
    <>
      <AdminPageHeader
        back={
          courseId
            ? { to: adminCoursePath('COURSE_DETAIL', courseId), label: 'Chi tiết khoá học' }
            : undefined
        }
        title="Học viên của khoá"
        description={course.data?.name}
      />

      {flash && (
        <Alert variant="success" className={styles.flash}>
          {flash}
        </Alert>
      )}

      <CourseQueryState query={courseId ? course : undefined}>
        {() => (
          <AdminPanel aria-label="Học viên đã đăng ký">
            <div className={styles.filters}>
              <SelectField
                label="Trạng thái"
                placeholder="Tất cả trạng thái"
                options={STATUS_OPTIONS}
                value={status ?? ''}
                onChange={(event) =>
                  setStatus((event.target.value || undefined) as EnrollmentStatus | undefined)
                }
              />
            </div>

            {enrollments.isPending ? (
              <p className={styles.loading} aria-busy>
                Đang tải học viên…
              </p>
            ) : enrollments.isError ? (
              <EmptyState
                icon={Users}
                tone="danger"
                title="Không tải được danh sách học viên"
                description={apiErrorMessage(enrollments.error, {
                  fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
                })}
                action={
                  <Button variant="outline" onClick={() => void enrollments.refetch()}>
                    Thử lại
                  </Button>
                }
              />
            ) : data && data.content.length > 0 ? (
              <>
                <EnrollmentTable
                  enrollments={data.content}
                  isFetching={enrollments.isPlaceholderData}
                  onAction={(enrollment, action) => setChange({ enrollment, action })}
                  onIssue={setIssuing}
                />
                <div className={styles.footer}>
                  <p className={styles.summary}>
                    {numberFormatter.format(data.totalElements)} lượt đăng ký
                  </p>
                  <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onChange={setPage}
                    label="Phân trang học viên"
                  />
                </div>
              </>
            ) : (
              <EmptyState
                icon={Users}
                title={
                  status
                    ? `Không có học viên nào ở trạng thái “${ENROLLMENT_STATUS_LABELS[status]}”`
                    : 'Chưa có học viên nào đăng ký khoá này'
                }
                description={
                  status ? undefined : 'Học viên đăng ký ở trang khoá học hoặc Góc học viên.'
                }
              />
            )}
          </AdminPanel>
        )}
      </CourseQueryState>

      <EnrollmentChangeDialog
        change={change}
        onClose={() => setChange(undefined)}
        onDone={setFlash}
      />

      <IssueCertificateDialog
        courseId={courseId ?? 0}
        enrollment={issuing}
        onClose={() => setIssuing(undefined)}
        onIssued={(enrollment, code) =>
          setFlash(`Đã cấp chứng chỉ ${code} cho ${enrollment.fullName}.`)
        }
      />
    </>
  )
}
