import { Award, BadgeCheck, CircleCheck, Undo2, X } from 'lucide-react'

import { Button } from '@/components/common/button'
import { EnrollmentStatusBadge } from '@/pages/admin/courses/components/course-status-badge'
import type { EnrollmentAction } from '@/pages/admin/courses/use-course-enrollments'
import type { Enrollment } from '@/types/course'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/format-date-time'

import styles from './course-list.module.css'

interface EnrollmentTableProps {
  enrollments: Enrollment[]
  isFetching?: boolean
  onAction: (enrollment: Enrollment, action: EnrollmentAction) => void
  onIssue: (enrollment: Enrollment) => void
}

/** Học viên của một khoá; dưới 1280px mỗi dòng thành một thẻ. */
export function EnrollmentTable({
  enrollments,
  isFetching,
  onAction,
  onIssue,
}: EnrollmentTableProps) {
  return (
    <div className={cn(styles.tableWrap, isFetching && styles.fetching)} aria-busy={isFetching}>
      <table className={styles.table}>
        <caption className="sr-only">Học viên đã đăng ký</caption>
        <thead>
          <tr>
            <th scope="col">Học viên</th>
            <th scope="col">Đăng ký</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Hoàn thành</th>
            <th scope="col" className={styles.actionsHead}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((enrollment) => (
            <tr key={enrollment.id}>
              <th scope="row" className={styles.courseCell}>
                <span className={styles.courseName}>{enrollment.fullName}</span>
                <span className={styles.subtle}>@{enrollment.username}</span>
              </th>
              <td data-label="Đăng ký" className={styles.subtle}>
                {formatDateTime(enrollment.enrolledAt)}
              </td>
              <td data-label="Trạng thái">
                <EnrollmentStatusBadge status={enrollment.status} />
              </td>
              <td data-label="Hoàn thành" className={styles.subtle}>
                {enrollment.completedAt ? formatDateTime(enrollment.completedAt) : '—'}
              </td>
              <td className={styles.actionsCell}>
                <div className={styles.actions}>
                  {enrollment.status === 'PENDING' && (
                    <>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => onAction(enrollment, 'approve')}
                        aria-label={`Duyệt ${enrollment.fullName} vào học`}
                      >
                        <BadgeCheck size={16} aria-hidden />
                        <span aria-hidden>Duyệt</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAction(enrollment, 'reject')}
                        aria-label={`Từ chối ${enrollment.fullName}`}
                        title="Từ chối"
                      >
                        <X size={16} aria-hidden />
                      </Button>
                    </>
                  )}
                  {enrollment.status === 'ENROLLED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAction(enrollment, 'complete')}
                      aria-label={`Xác nhận ${enrollment.fullName} hoàn thành`}
                    >
                      <CircleCheck size={16} aria-hidden />
                      <span aria-hidden>Xác nhận hoàn thành</span>
                    </Button>
                  )}
                  {enrollment.status === 'COMPLETED' && (
                    <>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => onIssue(enrollment)}
                        aria-label={`Cấp chứng chỉ cho ${enrollment.fullName}`}
                      >
                        <Award size={16} aria-hidden />
                        <span aria-hidden>Cấp chứng chỉ</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAction(enrollment, 'reopen')}
                        aria-label={`Chuyển ${enrollment.fullName} về đang học`}
                        title="Chuyển về đang học"
                      >
                        <Undo2 size={16} aria-hidden />
                      </Button>
                    </>
                  )}
                  {enrollment.status === 'CANCELLED' && (
                    <span className={styles.subtle}>Học viên đã huỷ</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
