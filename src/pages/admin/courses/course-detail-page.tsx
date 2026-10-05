import { ClipboardCheck, Pencil, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ADMIN_ROUTES, adminCoursePath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AdminPageHeader } from '@/layouts/admin/admin-page-header'
import { CourseLessons } from '@/pages/admin/courses/components/course-lessons'
import { CourseQueryState } from '@/pages/admin/courses/components/course-query-state'
import { CourseStatusBadge } from '@/pages/admin/courses/components/course-status-badge'
import { useCourseDetail, usePositiveIdParam } from '@/pages/admin/courses/use-course-detail'
import {
  deleteErrorMessage,
  useDeleteCourse,
  useDeleteLesson,
} from '@/pages/admin/courses/use-course-mutations'
import type { CourseFlashState, Lesson } from '@/types/course'
import { formatVnd } from '@/utils/format-currency'
import { formatDateTime } from '@/utils/format-date-time'

import styles from './components/course-detail.module.css'

export default function CourseDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const courseId = usePositiveIdParam('courseId')
  const course = useCourseDetail(courseId)
  useDocumentTitle(`${course.data?.name ?? 'Chi tiết khoá học'} – Quản trị`)

  const [flash, setFlash] = useState((location.state as CourseFlashState | null)?.flash)
  const [confirmCourse, setConfirmCourse] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState<Lesson>()
  const deleteCourse = useDeleteCourse()
  const deleteLesson = useDeleteLesson(courseId ?? 0)

  const closeLessonDialog = () => {
    setLessonToDelete(undefined)
    deleteLesson.reset()
  }

  return (
    <>
      <AdminPageHeader
        back={{ to: ADMIN_ROUTES.COURSES, label: 'Danh sách khoá học' }}
        title={course.data?.name ?? 'Chi tiết khoá học'}
        action={
          course.data && (
            <>
              <Button
                variant="ghost"
                className={styles.deleteButton}
                onClick={() => setConfirmCourse(true)}
              >
                <Trash2 size={18} aria-hidden /> Xoá
              </Button>
              <ButtonLink
                to={adminCoursePath('COURSE_ENROLLMENTS', course.data.id)}
                variant="outline"
              >
                <Users size={18} aria-hidden /> Học viên
              </ButtonLink>
              <ButtonLink to={adminCoursePath('COURSE_EXAM', course.data.id)} variant="outline">
                <ClipboardCheck size={18} aria-hidden /> Bài thi
              </ButtonLink>
              <ButtonLink to={adminCoursePath('COURSE_EDIT', course.data.id)} variant="outline">
                <Pencil size={18} aria-hidden /> Sửa khoá học
              </ButtonLink>
            </>
          )
        }
      />

      {flash && (
        <Alert variant="success" className={styles.flash}>
          {flash}
        </Alert>
      )}

      <CourseQueryState query={courseId ? course : undefined}>
        {(data) => (
          <div className={styles.layout}>
            <div className={styles.main}>
              <section className={styles.card} aria-labelledby="description-title">
                <h2 id="description-title" className={styles.cardTitle}>
                  Mô tả
                </h2>
                <p className={styles.description}>{data.description}</p>
              </section>
              <CourseLessons course={data} onDelete={setLessonToDelete} />
            </div>

            <aside className={styles.card} aria-labelledby="info-title">
              <h2 id="info-title" className={styles.cardTitle}>
                Thông tin
              </h2>
              <dl className={styles.info}>
                <div>
                  <dt>Trạng thái</dt>
                  <dd>
                    <CourseStatusBadge status={data.status} />
                  </dd>
                </div>
                <div>
                  <dt>Giảng viên</dt>
                  <dd>
                    <strong>{data.instructorName}</strong>
                    <span className={styles.muted}>@{data.instructorUsername}</span>
                  </dd>
                </div>
                <div>
                  <dt>Học phí</dt>
                  <dd>{formatVnd(data.price)}</dd>
                </div>
                <div>
                  <dt>Người tạo</dt>
                  <dd>@{data.createdByUsername}</dd>
                </div>
                <div>
                  <dt>Ngày tạo</dt>
                  <dd>{formatDateTime(data.createdAt)}</dd>
                </div>
                <div>
                  <dt>Cập nhật</dt>
                  <dd>{formatDateTime(data.updatedAt)}</dd>
                </div>
              </dl>
            </aside>
          </div>
        )}
      </CourseQueryState>

      <ConfirmDialog
        open={confirmCourse}
        title="Xoá khoá học?"
        description={
          <>
            Khoá <strong>“{course.data?.name}”</strong> và {course.data?.lessons.length ?? 0} bài
            học sẽ không còn hiển thị với học viên và quản trị viên.
          </>
        }
        confirmLabel="Xoá khoá học"
        loading={deleteCourse.isPending}
        error={deleteCourse.isError ? deleteErrorMessage(deleteCourse.error) : undefined}
        onConfirm={() => {
          if (!course.data) return
          const { name } = course.data
          deleteCourse.mutate(course.data, {
            onSuccess: () =>
              void navigate(ADMIN_ROUTES.COURSES, {
                state: { flash: `Đã xoá khoá học “${name}”.` } satisfies CourseFlashState,
              }),
          })
        }}
        onCancel={() => {
          setConfirmCourse(false)
          deleteCourse.reset()
        }}
      />

      <ConfirmDialog
        open={Boolean(lessonToDelete)}
        title="Xoá bài học?"
        description={
          <>
            Bài <strong>“{lessonToDelete?.title}”</strong> cùng tài liệu và video sẽ bị gỡ khỏi khoá
            học. Thứ tự {lessonToDelete?.sortOrder} có thể dùng lại cho bài khác.
          </>
        }
        confirmLabel="Xoá bài học"
        loading={deleteLesson.isPending}
        error={deleteLesson.isError ? deleteErrorMessage(deleteLesson.error) : undefined}
        onConfirm={() => {
          if (!lessonToDelete) return
          const { title } = lessonToDelete
          deleteLesson.mutate(lessonToDelete, {
            onSuccess: () => {
              setFlash(`Đã xoá bài học “${title}”.`)
              closeLessonDialog()
            },
          })
        }}
        onCancel={closeLessonDialog}
      />
    </>
  )
}
