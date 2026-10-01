import { useNavigate } from 'react-router'

import { ADMIN_ROUTES, adminCoursePath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import {
  CourseNotFound,
  CourseQueryState,
} from '@/pages/admin/courses/components/course-query-state'
import { LessonForm } from '@/pages/admin/courses/components/lesson-form'
import { useCourseDetail, usePositiveIdParam } from '@/pages/admin/courses/use-course-detail'
import { LESSON_GONE } from '@/pages/admin/courses/use-course-mutations'
import type { CourseFlashState } from '@/types/course'

export default function LessonEditPage() {
  useDocumentTitle('Sửa bài học – Quản trị')
  const navigate = useNavigate()
  const courseId = usePositiveIdParam('courseId')
  const lessonId = usePositiveIdParam('lessonId')
  // Chưa có API xem một bài → lấy bài từ chi tiết khoá.
  const course = useCourseDetail(courseId)
  const lesson = course.data?.lessons.find((item) => item.id === lessonId)

  return (
    <>
      <AdminPageHeader
        back={
          courseId
            ? { to: adminCoursePath('COURSE_DETAIL', courseId), label: 'Chi tiết khoá học' }
            : { to: ADMIN_ROUTES.COURSES, label: 'Danh sách khoá học' }
        }
        title="Sửa bài học"
        description={
          course.data && (
            <>
              Khoá học: <strong>{course.data.name}</strong>
            </>
          )
        }
      />
      <CourseQueryState query={courseId && lessonId ? course : undefined}>
        {(data) =>
          lesson ? (
            <AdminPanel padded aria-label="Thông tin bài học">
              <LessonForm
                courseId={data.id}
                lesson={lesson}
                cancelTo={adminCoursePath('COURSE_DETAIL', data.id)}
                onSuccess={(saved) =>
                  void navigate(adminCoursePath('COURSE_DETAIL', data.id), {
                    state: {
                      flash: `Đã lưu bài học “${saved.title}”.`,
                    } satisfies CourseFlashState,
                  })
                }
              />
            </AdminPanel>
          ) : (
            <CourseNotFound
              title={LESSON_GONE}
              description="Có thể bài học đã bị xoá. Hãy chọn bài khác trong trang khoá học."
            />
          )
        }
      </CourseQueryState>
    </>
  )
}
