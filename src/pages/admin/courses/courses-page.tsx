import { BookOpen, Plus, RotateCw, SearchX } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { ADMIN_ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { CourseFilters } from '@/pages/admin/courses/components/course-filters'
import { CourseTable } from '@/pages/admin/courses/components/course-table'
import { useCourseList, useCourseListParams } from '@/pages/admin/courses/use-course-list'
import { deleteErrorMessage, useDeleteCourse } from '@/pages/admin/courses/use-course-mutations'
import type { Course, CourseFlashState } from '@/types/course'
import { apiErrorMessage } from '@/utils/api-error-message'

import styles from './components/course-list.module.css'

const numberFormatter = new Intl.NumberFormat('vi-VN')

export default function CoursesPage() {
  useDocumentTitle('Khoá học – Quản trị')
  const location = useLocation()
  const { params, setPage, setFilters } = useCourseListParams()
  const courses = useCourseList(params)
  const deleteCourse = useDeleteCourse()
  const [toDelete, setToDelete] = useState<Course>()
  // Thông báo từ trang khác (vd. xoá ở trang chi tiết) hoặc sau khi xoá tại đây.
  const [flash, setFlash] = useState((location.state as CourseFlashState | null)?.flash)

  const data = courses.data
  const hasFilters = Boolean(params.keyword || params.status)
  const firstIndex = data ? data.page * data.size + 1 : 0
  const lastIndex = data ? firstIndex + data.content.length - 1 : 0

  const closeDialog = () => {
    setToDelete(undefined)
    deleteCourse.reset()
  }

  const confirmDelete = () => {
    if (!toDelete) return
    deleteCourse.mutate(toDelete, {
      onSuccess: () => {
        setFlash(`Đã xoá khoá học “${toDelete.name}”.`)
        closeDialog()
        // Xoá dòng cuối cùng của trang cuối → lùi một trang.
        if (data && data.content.length === 1 && data.page > 0) setPage(data.page - 1)
      },
    })
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý khoá học"
        description="Tạo khoá học, thêm bài học kèm tài liệu và video."
        action={
          <ButtonLink to={ADMIN_ROUTES.COURSE_CREATE} variant="accent">
            <Plus size={18} aria-hidden /> Thêm khoá học
          </ButtonLink>
        }
      />

      {flash && (
        <Alert variant="success" className={styles.flash}>
          {flash}
        </Alert>
      )}

      <AdminPanel aria-label="Danh sách khoá học">
        <CourseFilters
          key={`${params.keyword ?? ''}|${params.status ?? ''}`}
          keyword={params.keyword}
          status={params.status}
          onChange={setFilters}
        />

        {courses.isPending ? (
          <p className={styles.loading} aria-busy>
            Đang tải danh sách khoá học…
          </p>
        ) : courses.isError ? (
          <EmptyState
            icon={RotateCw}
            tone="danger"
            title="Không tải được danh sách khoá học"
            description={apiErrorMessage(courses.error, {
              fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            })}
            action={
              <Button variant="outline" onClick={() => void courses.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : data && data.content.length > 0 ? (
          <>
            <CourseTable
              courses={data.content}
              isFetching={courses.isPlaceholderData}
              onDelete={setToDelete}
            />
            <div className={styles.footer}>
              <p className={styles.summary}>
                Hiển thị {firstIndex}–{lastIndex} trong{' '}
                <strong>{numberFormatter.format(data.totalElements)}</strong> khoá học
              </p>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onChange={setPage}
                label="Phân trang khoá học"
              />
            </div>
          </>
        ) : hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="Không tìm thấy khoá học phù hợp"
            description="Thử từ khoá khác hoặc bỏ bộ lọc trạng thái."
            action={
              <Button
                variant="outline"
                onClick={() => setFilters({ keyword: undefined, status: undefined })}
              >
                Xoá bộ lọc
              </Button>
            }
          />
        ) : data && data.page > 0 ? (
          <EmptyState
            icon={SearchX}
            title="Trang này không có khoá học"
            action={
              <Button variant="outline" onClick={() => setPage(0)}>
                Về trang đầu
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Chưa có khoá học nào"
            description="Tạo khoá học đầu tiên, sau đó thêm bài học kèm tài liệu và video."
            action={
              <ButtonLink to={ADMIN_ROUTES.COURSE_CREATE} variant="accent">
                <Plus size={18} aria-hidden /> Thêm khoá học
              </ButtonLink>
            }
          />
        )}
      </AdminPanel>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Xoá khoá học?"
        description={
          <>
            Khoá <strong>“{toDelete?.name}”</strong> và {toDelete?.lessonCount ?? 0} bài học sẽ
            không còn hiển thị với học viên và quản trị viên.
          </>
        }
        confirmLabel="Xoá khoá học"
        loading={deleteCourse.isPending}
        error={deleteCourse.isError ? deleteErrorMessage(deleteCourse.error) : undefined}
        onConfirm={confirmDelete}
        onCancel={closeDialog}
      />
    </>
  )
}
