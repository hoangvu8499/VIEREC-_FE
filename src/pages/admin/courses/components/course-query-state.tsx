import type { UseQueryResult } from '@tanstack/react-query'
import { CircleAlert, RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { ADMIN_ROUTES } from '@/constants/routes'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { COURSE_GONE } from '@/pages/admin/courses/use-course-mutations'
import type { ApiError } from '@/types/api'
import type { CourseDetail } from '@/types/course'
import { apiErrorMessage } from '@/utils/api-error-message'

import styles from './course-detail.module.css'

const BACK_TO_LIST = (
  <ButtonLink to={ADMIN_ROUTES.COURSES} variant="outline">
    Về danh sách khoá học
  </ButtonLink>
)

/** Khối báo lỗi dạng trang (id sai, khoá/bài không tồn tại...). */
export function CourseNotFound({ title, description }: { title: string; description?: string }) {
  return (
    <AdminPanel>
      <EmptyState
        icon={CircleAlert}
        tone="danger"
        title={title}
        description={description}
        action={BACK_TO_LIST}
      />
    </AdminPanel>
  )
}

interface CourseQueryStateProps {
  /** `undefined` khi id trên URL không hợp lệ. */
  query: UseQueryResult<CourseDetail, ApiError> | undefined
  children: (course: CourseDetail) => ReactNode
}

/** Đang tải / không tồn tại / lỗi của `useCourseDetail`; có dữ liệu thì render `children`. */
export function CourseQueryState({ query, children }: CourseQueryStateProps) {
  if (!query) {
    return (
      <CourseNotFound
        title="Đường dẫn khoá học không hợp lệ"
        description="Hãy chọn khoá học từ danh sách."
      />
    )
  }
  if (query.isPending) {
    return (
      <AdminPanel>
        <p className={styles.loading} aria-busy>
          Đang tải khoá học…
        </p>
      </AdminPanel>
    )
  }
  if (query.isError) {
    if (query.error.code === API_ERROR_CODES.COURSE_NOT_FOUND) {
      return (
        <CourseNotFound
          title={COURSE_GONE}
          description="Có thể khoá học đã bị xoá. Hãy chọn khoá khác trong danh sách."
        />
      )
    }
    return (
      <AdminPanel>
        <EmptyState
          icon={RotateCw}
          tone="danger"
          title="Không tải được khoá học"
          description={apiErrorMessage(query.error, {
            fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
          })}
          action={
            <Button variant="outline" onClick={() => void query.refetch()}>
              Thử lại
            </Button>
          }
        />
      </AdminPanel>
    )
  }
  return children(query.data)
}
