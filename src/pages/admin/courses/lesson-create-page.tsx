import { useState } from 'react'

import { ADMIN_ROUTES, adminCoursePath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { CourseQueryState } from '@/pages/admin/courses/components/course-query-state'
import { LessonCreated } from '@/pages/admin/courses/components/lesson-created'
import { LessonForm } from '@/pages/admin/courses/components/lesson-form'
import {
  nextSortOrder,
  useCourseDetail,
  usePositiveIdParam,
} from '@/pages/admin/courses/use-course-detail'
import type { Lesson } from '@/types/course'

export default function LessonCreatePage() {
  useDocumentTitle('Thêm bài học – Quản trị')
  const courseId = usePositiveIdParam('courseId')
  const course = useCourseDetail(courseId)

  const [created, setCreated] = useState<Lesson>()
  // Tăng mỗi lần "thêm bài tiếp theo" để remount form trống.
  const [formKey, setFormKey] = useState(0)

  return (
    <>
      <AdminPageHeader
        back={
          courseId
            ? { to: adminCoursePath('COURSE_DETAIL', courseId), label: 'Chi tiết khoá học' }
            : { to: ADMIN_ROUTES.COURSES, label: 'Danh sách khoá học' }
        }
        title="Thêm bài học"
        description={
          course.data && (
            <>
              Khoá học: <strong>{course.data.name}</strong>
            </>
          )
        }
      />
      <CourseQueryState query={courseId ? course : undefined}>
        {(data) => (
          <AdminPanel padded aria-label="Thông tin bài học">
            {created ? (
              <LessonCreated
                lesson={created}
                onCreateAnother={() => {
                  setCreated(undefined)
                  setFormKey((key) => key + 1)
                }}
              />
            ) : (
              <LessonForm
                key={formKey}
                courseId={data.id}
                // Chi tiết khoá đã được làm mới sau khi tạo → gợi ý luôn đúng số tiếp theo.
                defaultSortOrder={nextSortOrder(data)}
                cancelTo={adminCoursePath('COURSE_DETAIL', data.id)}
                onSuccess={setCreated}
              />
            )}
          </AdminPanel>
        )}
      </CourseQueryState>
    </>
  )
}
