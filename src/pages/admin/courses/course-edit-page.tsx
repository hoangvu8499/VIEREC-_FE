import { useNavigate } from 'react-router'

import { adminCoursePath, ADMIN_ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { CourseForm } from '@/pages/admin/courses/components/course-form'
import { CourseQueryState } from '@/pages/admin/courses/components/course-query-state'
import { useCourseDetail, usePositiveIdParam } from '@/pages/admin/courses/use-course-detail'
import type { CourseFlashState } from '@/types/course'

export default function CourseEditPage() {
  useDocumentTitle('Sửa khoá học – Quản trị')
  const navigate = useNavigate()
  const courseId = usePositiveIdParam('courseId')
  const course = useCourseDetail(courseId)

  return (
    <>
      <AdminPageHeader
        back={
          courseId
            ? { to: adminCoursePath('COURSE_DETAIL', courseId), label: 'Chi tiết khoá học' }
            : { to: ADMIN_ROUTES.COURSES, label: 'Danh sách khoá học' }
        }
        title="Sửa khoá học"
        description={course.data?.name}
      />
      <CourseQueryState query={courseId ? course : undefined}>
        {(data) => (
          <AdminPanel padded aria-label="Thông tin khoá học">
            <CourseForm
              course={data}
              cancelTo={adminCoursePath('COURSE_DETAIL', data.id)}
              onSuccess={(saved) =>
                void navigate(adminCoursePath('COURSE_DETAIL', saved.id), {
                  state: { flash: 'Đã lưu thay đổi của khoá học.' } satisfies CourseFlashState,
                })
              }
            />
          </AdminPanel>
        )}
      </CourseQueryState>
    </>
  )
}
