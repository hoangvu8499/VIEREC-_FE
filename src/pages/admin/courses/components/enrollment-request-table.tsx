import { BadgeCheck, X } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/common/button'
import { transferContent } from '@/constants/payment'
import { adminCoursePath } from '@/constants/routes'
import type { EnrollmentAction } from '@/pages/admin/courses/use-course-enrollments'
import type { Enrollment } from '@/types/course'
import { cn } from '@/utils/cn'
import { formatVnd } from '@/utils/format-currency'
import { formatDateTime } from '@/utils/format-date-time'
import { learnerOrganization } from '@/utils/learner-organization'

import styles from './course-list.module.css'

interface EnrollmentRequestTableProps {
  enrollments: Enrollment[]
  isFetching?: boolean
  onAction: (
    enrollment: Enrollment,
    action: Extract<EnrollmentAction, 'approve' | 'reject'>,
  ) => void
}

/** Yêu cầu chờ duyệt của mọi khoá; dưới 1280px mỗi dòng thành một thẻ. */
export function EnrollmentRequestTable({
  enrollments,
  isFetching,
  onAction,
}: EnrollmentRequestTableProps) {
  return (
    <div className={cn(styles.tableWrap, isFetching && styles.fetching)} aria-busy={isFetching}>
      <table className={styles.table}>
        <caption className="sr-only">Yêu cầu đăng ký chờ duyệt</caption>
        <thead>
          <tr>
            <th scope="col">Học viên</th>
            <th scope="col">Khoá học</th>
            <th scope="col">Gửi yêu cầu</th>
            <th scope="col" className={styles.numberCell}>
              Số tiền
            </th>
            <th scope="col">Nội dung chuyển khoản</th>
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
                <span className={styles.subtle}>
                  Đơn vị: {learnerOrganization(enrollment.businessName)}
                </span>
              </th>
              <td data-label="Khoá học">
                <Link
                  to={adminCoursePath('COURSE_ENROLLMENTS', enrollment.courseId)}
                  className={styles.courseLink}
                >
                  {enrollment.courseName}
                </Link>
              </td>
              <td data-label="Gửi yêu cầu" className={styles.subtle}>
                {formatDateTime(enrollment.enrolledAt)}
              </td>
              <td data-label="Số tiền" className={styles.numberCell}>
                {formatVnd(enrollment.price)}
              </td>
              <td data-label="Nội dung CK">
                <code className={styles.transfer}>
                  {transferContent(enrollment.courseId, enrollment.userId)}
                </code>
              </td>
              <td className={styles.actionsCell}>
                <div className={styles.actions}>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => onAction(enrollment, 'approve')}
                    aria-label={`Duyệt ${enrollment.fullName} vào học ${enrollment.courseName}`}
                  >
                    <BadgeCheck size={16} aria-hidden />
                    <span aria-hidden>Duyệt</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAction(enrollment, 'reject')}
                    aria-label={`Từ chối ${enrollment.fullName} (${enrollment.courseName})`}
                  >
                    <X size={16} aria-hidden />
                    <span aria-hidden>Từ chối</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
