import { Eye, FilePlus2, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { ButtonLink } from '@/components/common/button-link'
import { IconButton } from '@/components/common/icon-button'
import { adminCoursePath } from '@/constants/routes'
import { CourseStatusBadge } from '@/pages/admin/courses/components/course-status-badge'
import type { Course } from '@/types/course'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/format-date-time'

import styles from './course-list.module.css'

interface CourseTableProps {
  courses: Course[]
  /** Đang tải trang khác (vẫn hiện dữ liệu cũ, làm mờ). */
  isFetching?: boolean
  onDelete: (course: Course) => void
}

/** Bảng khoá học; dưới 1280px mỗi dòng thành một thẻ. */
export function CourseTable({ courses, isFetching, onDelete }: CourseTableProps) {
  return (
    <div className={cn(styles.tableWrap, isFetching && styles.fetching)} aria-busy={isFetching}>
      <table className={styles.table}>
        <caption className="sr-only">Danh sách khoá học</caption>
        <thead>
          <tr>
            <th scope="col">Khoá học</th>
            <th scope="col">Giảng viên</th>
            <th scope="col" className={styles.numberCell}>
              Bài học
            </th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Cập nhật</th>
            <th scope="col" className={styles.actionsHead}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <th scope="row" className={styles.courseCell}>
                <Link
                  to={adminCoursePath('COURSE_DETAIL', course.id)}
                  className={styles.courseName}
                >
                  {course.name}
                </Link>
                <span className={styles.courseDescription}>{course.description}</span>
              </th>
              <td data-label="Giảng viên" className={styles.instructorCell}>
                <span className={styles.instructor}>{course.instructorName}</span>
                <span className={styles.subtle}>@{course.instructorUsername}</span>
              </td>
              <td data-label="Bài học" className={styles.numberCell}>
                {course.lessonCount}
              </td>
              <td data-label="Trạng thái">
                <CourseStatusBadge status={course.status} />
              </td>
              <td data-label="Cập nhật" className={styles.subtle}>
                {formatDateTime(course.updatedAt)}
              </td>
              <td className={styles.actionsCell}>
                <div className={styles.actions}>
                  <ButtonLink
                    to={adminCoursePath('LESSON_CREATE', course.id)}
                    variant="outline"
                    size="sm"
                    aria-label={`Thêm bài học cho khoá ${course.name}`}
                  >
                    <FilePlus2 size={16} aria-hidden />
                    <span aria-hidden>Thêm bài học</span>
                  </ButtonLink>
                  <Link
                    to={adminCoursePath('COURSE_DETAIL', course.id)}
                    className={styles.actionButton}
                    aria-label={`Xem chi tiết khoá ${course.name}`}
                    title="Xem chi tiết"
                  >
                    <Eye size={18} aria-hidden />
                  </Link>
                  <Link
                    to={adminCoursePath('COURSE_EDIT', course.id)}
                    className={styles.actionButton}
                    aria-label={`Sửa khoá ${course.name}`}
                    title="Sửa"
                  >
                    <Pencil size={18} aria-hidden />
                  </Link>
                  <IconButton
                    className={cn(styles.actionButton, styles.danger)}
                    label={`Xoá khoá ${course.name}`}
                    title="Xoá"
                    onClick={() => onDelete(course)}
                  >
                    <Trash2 size={18} aria-hidden />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
