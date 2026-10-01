import { COURSE_STATUS_LABELS, ENROLLMENT_STATUS_LABELS } from '@/constants/course'
import type { CourseStatus, EnrollmentStatus } from '@/types/course'
import { cn } from '@/utils/cn'

import styles from './course-status-badge.module.css'

export function CourseStatusBadge({ status }: { status: CourseStatus }) {
  return <span className={cn(styles.badge, styles[status])}>{COURSE_STATUS_LABELS[status]}</span>
}

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  return (
    <span className={cn(styles.badge, styles[status])}>{ENROLLMENT_STATUS_LABELS[status]}</span>
  )
}
