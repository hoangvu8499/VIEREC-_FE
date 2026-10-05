import { Link } from 'react-router'

import { ENROLLMENT_STATUS_LABELS } from '@/constants/course'
import { transferContent } from '@/constants/payment'
import { adminCoursePath, adminUserPath } from '@/constants/routes'
import type { Enrollment } from '@/types/course'
import { cn } from '@/utils/cn'
import { formatVnd } from '@/utils/format-currency'
import { formatDateTime } from '@/utils/format-date-time'

import styles from './course-list.module.css'
import revenueStyles from './revenue.module.css'

interface RevenueTableProps {
  enrollments: Enrollment[]
  isFetching?: boolean
}

/** Từng khoản thu: ai trả, cho khoá nào, bao nhiêu; dưới 1280px mỗi dòng thành một thẻ. */
export function RevenueTable({ enrollments, isFetching }: RevenueTableProps) {
  return (
    <div className={cn(styles.tableWrap, isFetching && styles.fetching)} aria-busy={isFetching}>
      <table className={styles.table}>
        <caption className="sr-only">Chi tiết khoản thu</caption>
        <thead>
          <tr>
            <th scope="col">Học viên</th>
            <th scope="col">Khoá học</th>
            <th scope="col">Ngày duyệt</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Nội dung chuyển khoản</th>
            <th scope="col" className={revenueStyles.amountHead}>
              Số tiền
            </th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((enrollment) => (
            <tr key={enrollment.id}>
              <th scope="row" className={styles.courseCell}>
                <Link
                  to={adminUserPath('USER_DETAIL', enrollment.userId)}
                  className={styles.courseName}
                >
                  {enrollment.fullName}
                </Link>
                <span className={styles.subtle}>@{enrollment.username}</span>
              </th>
              <td data-label="Khoá học">
                <Link
                  to={adminCoursePath('COURSE_ENROLLMENTS', enrollment.courseId)}
                  className={styles.courseLink}
                >
                  {enrollment.courseName}
                </Link>
              </td>
              <td data-label="Ngày duyệt" className={styles.subtle}>
                {enrollment.approvedAt ? formatDateTime(enrollment.approvedAt) : '—'}
              </td>
              <td data-label="Trạng thái">{ENROLLMENT_STATUS_LABELS[enrollment.status]}</td>
              <td data-label="Nội dung CK">
                <code className={styles.transfer}>
                  {transferContent(enrollment.courseId, enrollment.userId)}
                </code>
              </td>
              <td data-label="Số tiền" className={revenueStyles.amountCell}>
                {formatVnd(enrollment.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
