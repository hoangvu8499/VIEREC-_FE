import { PAYMENT_STATUS_LABELS, transferContent } from '@/constants/payment'
import { useEnrollmentPayments } from '@/pages/admin/courses/use-course-enrollments'
import type { Enrollment } from '@/types/course'
import { formatVnd } from '@/utils/format-currency'
import { formatDateTime } from '@/utils/format-date-time'

import styles from './enrollment-payments.module.css'

/** Thông tin để admin đối chiếu sao kê trước khi duyệt: nội dung chuyển khoản và giao dịch đã ghi nhận. */
export function EnrollmentPayments({ enrollment }: { enrollment: Enrollment }) {
  const payments = useEnrollmentPayments(enrollment.courseId, enrollment.userId)
  const items = payments.data?.content ?? []

  return (
    <div className={styles.box}>
      <p>
        Cần tìm trong sao kê khoản <strong>{formatVnd(enrollment.price)}</strong> với nội dung{' '}
        <strong className={styles.code}>
          {transferContent(enrollment.courseId, enrollment.userId)}
        </strong>
      </p>
      {payments.isPending ? (
        <p className={styles.muted}>Đang tải giao dịch…</p>
      ) : payments.isError ? (
        <p className={styles.muted}>Không tải được giao dịch đã ghi nhận.</p>
      ) : items.length === 0 ? (
        <p className={styles.muted}>Chưa có giao dịch nào được ghi nhận cho khoá này.</p>
      ) : (
        <ul className={styles.list} aria-label="Giao dịch đã ghi nhận">
          {items.map((payment) => (
            <li key={payment.id}>
              <span>{formatDateTime(payment.createdAt)}</span>
              <strong>{formatVnd(Number(payment.amount))}</strong>
              <span>{PAYMENT_STATUS_LABELS[payment.status]}</span>
              {payment.transactionRef && <span>Mã GD {payment.transactionRef}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
