import { Award, BookOpen, CalendarDays, CircleCheck, PlayCircle, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { courseVisual } from '@/components/shared/course-visual'
import { ENROLLMENT_STATUS_LABELS } from '@/constants/course'
import { coursePath, learnPath, LEARNER_ROUTES } from '@/constants/routes'
import { enrollmentErrorMessage, useCancelEnrollment } from '@/hooks/use-enrollments'
import type { Enrollment } from '@/types/course'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format-date'

import styles from './enrollment-item.module.css'

/** Một khoá trong "Khoá học của tôi" kèm thao tác theo trạng thái. */
export function EnrollmentItem({ enrollment }: { enrollment: Enrollment }) {
  const { icon: Icon, tone } = courseVisual(enrollment.courseName)
  const cancel = useCancelEnrollment()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { status } = enrollment
  const canLearn = status === 'ENROLLED' || status === 'COMPLETED'

  return (
    <article className={cn(styles.item, status === 'CANCELLED' && styles.cancelled)}>
      <span className={cn(styles.cover, styles[tone])} aria-hidden>
        <Icon size={28} strokeWidth={1.75} />
      </span>

      <div className={styles.body}>
        <div className={styles.heading}>
          <h2 className={styles.title}>
            <Link to={canLearn ? learnPath(enrollment.courseId) : coursePath(enrollment.courseId)}>
              {enrollment.courseName}
            </Link>
          </h2>
          <span className={cn(styles.badge, styles[status])}>
            {ENROLLMENT_STATUS_LABELS[status]}
          </span>
        </div>
        <ul className={styles.meta}>
          <li>
            <UserRound size={15} aria-hidden />
            <span className="sr-only">Giảng viên: </span>
            {enrollment.instructorName}
          </li>
          <li>
            <BookOpen size={15} aria-hidden /> {enrollment.lessonCount} bài học
          </li>
          <li>
            <CalendarDays size={15} aria-hidden /> Đăng ký {formatDate(enrollment.enrolledAt)}
          </li>
          {enrollment.completedAt && (
            <li>
              <CircleCheck size={15} aria-hidden /> Hoàn thành {formatDate(enrollment.completedAt)}
            </li>
          )}
        </ul>
        {status === 'PENDING' && (
          <p className={styles.pendingNote}>
            Đang chờ quản trị viên đối chiếu chuyển khoản. Khoá học mở ngay sau khi được duyệt.
          </p>
        )}
      </div>

      <div className={styles.actions}>
        {status === 'ENROLLED' && (
          <ButtonLink to={learnPath(enrollment.courseId)} variant="accent" size="sm">
            <PlayCircle size={16} aria-hidden /> Vào học
          </ButtonLink>
        )}
        {status === 'PENDING' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              cancel.reset()
              setConfirmOpen(true)
            }}
          >
            Huỷ yêu cầu
          </Button>
        )}
        {status === 'COMPLETED' && (
          <>
            <ButtonLink to={learnPath(enrollment.courseId)} variant="outline" size="sm">
              Xem lại
            </ButtonLink>
            <ButtonLink to={LEARNER_ROUTES.CERTIFICATES} variant="ghost" size="sm">
              <Award size={16} aria-hidden /> Chứng chỉ
            </ButtonLink>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Huỷ yêu cầu đăng ký?"
        description={
          <>
            Yêu cầu học khoá <strong>{enrollment.courseName}</strong> sẽ bị huỷ. Nếu đã chuyển
            khoản, hãy liên hệ trung tâm để được hỗ trợ.
          </>
        }
        confirmLabel="Huỷ yêu cầu"
        cancelLabel="Giữ lại"
        loading={cancel.isPending}
        error={
          cancel.error
            ? enrollmentErrorMessage(cancel.error, 'Chưa huỷ được. Vui lòng thử lại.')
            : undefined
        }
        onConfirm={() =>
          cancel.mutate(enrollment.courseId, { onSuccess: () => setConfirmOpen(false) })
        }
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  )
}
