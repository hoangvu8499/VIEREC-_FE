import { ArrowRight, BookOpen, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { courseVisual } from '@/components/shared/course-visual'
import { ENROLLMENT_STATUS_LABELS } from '@/constants/course'
import { coursePath } from '@/constants/routes'
import type { Course } from '@/types/course'
import { cn } from '@/utils/cn'
import { formatVnd } from '@/utils/format-currency'

import styles from './course-card.module.css'

interface CourseCardProps {
  course: Course
  /** Cấp heading của tên khoá (trong section h2 → h3). */
  headingLevel?: 'h2' | 'h3'
  /** Nút thao tác cuối thẻ (vd. đăng ký học) — nổi trên link phủ cả thẻ. */
  action?: ReactNode
}

/** Thẻ khoá học cho trang người dùng: ảnh bìa theo lĩnh vực, mô tả ngắn, giảng viên, số bài, học phí. */
export function CourseCard({ course, headingLevel: Heading = 'h3', action }: CourseCardProps) {
  const { icon: Icon, tone, label } = courseVisual(course.name)
  const enrollment = course.myEnrollmentStatus

  return (
    <article className={styles.card}>
      <div className={cn(styles.cover, styles[tone])} aria-hidden>
        <Icon className={styles.coverIcon} size={56} strokeWidth={1.5} />
        <span className={styles.field}>{label}</span>
      </div>
      {/* Ngoài khối aria-hidden để trình đọc màn hình vẫn đọc được. */}
      {enrollment && enrollment !== 'CANCELLED' && (
        <span
          className={cn(
            styles.enrollment,
            enrollment === 'COMPLETED' && styles.done,
            enrollment === 'PENDING' && styles.pending,
          )}
        >
          {ENROLLMENT_STATUS_LABELS[enrollment]}
        </span>
      )}
      <div className={styles.body}>
        <Heading className={styles.title}>
          {/* Link phủ cả thẻ (xem CSS ::after) — một điểm bấm, một tên đọc cho trình đọc màn hình. */}
          <Link to={coursePath(course.id)} className={styles.link}>
            {course.name}
          </Link>
        </Heading>
        <p className={styles.description}>{course.description}</p>
        <ul className={styles.meta}>
          <li>
            <UserRound size={16} aria-hidden />
            <span className="sr-only">Giảng viên: </span>
            {course.instructorName}
          </li>
          <li>
            <BookOpen size={16} aria-hidden />
            {course.lessonCount > 0 ? `${course.lessonCount} bài học` : 'Đang cập nhật bài học'}
          </li>
        </ul>
        <div className={styles.footer}>
          <p className={styles.price}>
            <span className="sr-only">Học phí: </span>
            {formatVnd(course.price)}
          </p>
          <span className={styles.more} aria-hidden>
            Tìm hiểu <ArrowRight size={16} />
          </span>
        </div>
        {action}
      </div>
    </article>
  )
}
