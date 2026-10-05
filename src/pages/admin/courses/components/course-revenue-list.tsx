import { Link } from 'react-router'

import { adminCoursePath } from '@/constants/routes'
import type { CourseRevenue } from '@/types/course'
import { formatVnd } from '@/utils/format-currency'

import styles from './revenue.module.css'

const numberFormatter = new Intl.NumberFormat('vi-VN')
const percentFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 })

interface CourseRevenueListProps {
  courses: CourseRevenue[]
  /** Tổng cả tháng, để tính tỉ trọng. */
  total: number
}

/** Doanh thu từng khoá trong tháng, thu nhiều nhất trước, kèm thanh tỉ trọng. */
export function CourseRevenueList({ courses, total }: CourseRevenueListProps) {
  return (
    <ul className={styles.courses}>
      {courses.map((course) => {
        const share = total > 0 ? (course.amount / total) * 100 : 0
        return (
          <li key={course.courseId} className={styles.course}>
            <div className={styles.courseHead}>
              <Link
                to={adminCoursePath('COURSE_ENROLLMENTS', course.courseId)}
                className={styles.courseName}
              >
                {course.courseName}
              </Link>
              <strong className={styles.courseAmount}>{formatVnd(course.amount)}</strong>
            </div>
            <div className={styles.bar} aria-hidden>
              <span style={{ width: `${share}%` }} />
            </div>
            <p className={styles.courseMeta}>
              {numberFormatter.format(course.enrollments)} lượt · {percentFormatter.format(share)}%
              tổng thu
            </p>
          </li>
        )
      })}
    </ul>
  )
}
