import { useNavigate } from 'react-router'

import { ADMIN_ROUTES, adminCoursePath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { AdminPanel } from '@/layouts/admin/admin-panel'
import { CourseForm } from '@/pages/admin/courses/components/course-form'
import type { CourseFlashState } from '@/types/course'

export default function CourseCreatePage() {
  useDocumentTitle('Thêm khoá học – Quản trị')
  const navigate = useNavigate()

  return (
    <>
      <AdminPageHeader
        back={{ to: ADMIN_ROUTES.COURSES, label: 'Danh sách khoá học' }}
        title="Thêm khoá học"
        description="Tạo khoá học trước, sau đó thêm từng bài học kèm tài liệu và video."
      />
      <AdminPanel padded aria-label="Thông tin khoá học">
        <CourseForm
          cancelTo={ADMIN_ROUTES.COURSES}
          onSuccess={(course) =>
            void navigate(adminCoursePath('COURSE_DETAIL', course.id), {
              state: {
                flash: `Đã tạo khoá học “${course.name}”. Hãy thêm bài học đầu tiên.`,
              } satisfies CourseFlashState,
            })
          }
        />
      </AdminPanel>
    </>
  )
}
