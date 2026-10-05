import { Award, CircleCheck, Hourglass, LogIn, PlayCircle, SquarePen } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PaymentDialog } from '@/components/shared/payment-dialog'
import { learnPath, LEARNER_ROUTES, ROUTES } from '@/constants/routes'
import { enrollmentErrorMessage, useCancelEnrollment } from '@/hooks/use-enrollments'
import { useAuthStore } from '@/stores/auth-store'
import type { Course } from '@/types/course'
import { cn } from '@/utils/cn'

import styles from './enroll-action.module.css'

interface EnrollActionProps {
  course: Pick<Course, 'id' | 'name' | 'price' | 'myEnrollmentStatus'>
  /** `detail`: trang chi tiết khoá (nút to, có giải thích). `card`: thẻ khoá học (gọn). */
  variant?: 'detail' | 'card'
}

/**
 * Thao tác theo `myEnrollmentStatus` của người đang xem: đăng ký (mở mã QR chuyển khoản), chờ duyệt (huỷ yêu cầu
 * được), đã duyệt (vào học).
 */
export function EnrollAction({ course, variant = 'detail' }: EnrollActionProps) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const isCard = variant === 'card'
  const size = isCard ? 'sm' : 'md'
  const status = course.myEnrollmentStatus

  if (!user) {
    return (
      <ButtonLink
        to={ROUTES.LOGIN}
        state={{ from: location.pathname }}
        variant="accent"
        block
        size={size}
      >
        <LogIn size={18} aria-hidden /> Đăng nhập để đăng ký
      </ButtonLink>
    )
  }

  if (status === 'COMPLETED') {
    return (
      <div className={cn(styles.action, isCard && styles.card)}>
        <p className={cn(styles.status, styles.completed)}>
          <CircleCheck size={18} aria-hidden /> Bạn đã hoàn thành khoá học
        </p>
        {!isCard && (
          <>
            <ButtonLink to={learnPath(course.id)} variant="outline" block>
              <PlayCircle size={18} aria-hidden /> Xem lại bài học
            </ButtonLink>
            <ButtonLink to={LEARNER_ROUTES.CERTIFICATES} variant="ghost" block>
              <Award size={18} aria-hidden /> Xem chứng chỉ
            </ButtonLink>
          </>
        )}
      </div>
    )
  }

  if (status === 'ENROLLED') {
    return (
      <div className={cn(styles.action, isCard && styles.card)}>
        {!isCard && (
          <p className={styles.status}>
            <PlayCircle size={18} aria-hidden /> Bạn đang học khoá này
          </p>
        )}
        <ButtonLink
          to={learnPath(course.id)}
          variant="accent"
          size={size}
          block
          aria-label={isCard ? `Vào học ${course.name}` : undefined}
        >
          <PlayCircle size={18} aria-hidden /> Vào học
        </ButtonLink>
      </div>
    )
  }

  if (status === 'PENDING') {
    return <PendingApproval course={course} isCard={isCard} />
  }

  return (
    <div className={cn(styles.action, isCard && styles.card)}>
      <Button
        variant="accent"
        block
        size={size}
        onClick={() => setPaymentOpen(true)}
        // Thẻ: nhiều nút cùng tên trên một trang → kèm tên khoá cho trình đọc màn hình.
        aria-label={isCard ? `Đăng ký khoá học ${course.name}` : undefined}
      >
        <SquarePen size={18} aria-hidden /> Đăng ký khoá học
      </Button>
      <PaymentDialog course={course} open={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </div>
  )
}

function PendingApproval({
  course,
  isCard,
}: {
  course: Pick<Course, 'id' | 'name'>
  isCard: boolean
}) {
  const cancel = useCancelEnrollment()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className={cn(styles.action, isCard && styles.card)}>
      <p className={cn(styles.status, styles.pending)}>
        <Hourglass size={18} aria-hidden /> Đang chờ duyệt thanh toán
      </p>
      {!isCard && (
        <>
          <p className={styles.hint}>
            Quản trị viên sẽ đối chiếu khoản chuyển và mở khoá học trong “Khoá học của tôi”.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className={styles.cancel}
            onClick={() => {
              cancel.reset()
              setConfirmOpen(true)
            }}
          >
            Huỷ yêu cầu đăng ký
          </Button>
          <ConfirmDialog
            open={confirmOpen}
            title="Huỷ yêu cầu đăng ký?"
            description={
              <>
                Yêu cầu học khoá <strong>{course.name}</strong> sẽ bị huỷ. Nếu đã chuyển khoản, hãy
                liên hệ trung tâm để được hỗ trợ.
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
            onConfirm={() => cancel.mutate(course.id, { onSuccess: () => setConfirmOpen(false) })}
            onCancel={() => setConfirmOpen(false)}
          />
        </>
      )}
    </div>
  )
}
