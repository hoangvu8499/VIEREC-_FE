import { Check, Copy, QrCode } from 'lucide-react'
import { useState } from 'react'

import paymentQr from '@/assets/images/payment-qr.jpg'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { IconButton } from '@/components/common/icon-button'
import { CONTACT } from '@/constants/contact'
import { BANK_ACCOUNT, transferContent } from '@/constants/payment'
import { enrollmentErrorMessage, useEnroll } from '@/hooks/use-enrollments'
import { useAuthStore } from '@/stores/auth-store'
import type { Course, Enrollment } from '@/types/course'

import styles from './payment-dialog.module.css'

interface PaymentDialogProps {
  course: Pick<Course, 'id' | 'name'>
  open: boolean
  onClose: () => void
  /** Đã báo chuyển khoản xong: `PENDING` (chờ duyệt), hoặc `ENROLLED` nếu backend duyệt luôn. */
  onSubmitted?: (enrollment: Enrollment) => void
}

/** Mã QR chuyển khoản học phí; bấm "Đã thanh toán" thì gửi đăng ký để admin đối chiếu và duyệt. */
export function PaymentDialog({ course, open, onClose, onSubmitted }: PaymentDialogProps) {
  const username = useAuthStore((state) => state.user?.username ?? '')
  const enroll = useEnroll()
  const content = transferContent(username, course.id)

  const close = () => {
    enroll.reset()
    onClose()
  }

  return (
    <ConfirmDialog
      open={open}
      tone="primary"
      icon={QrCode}
      title="Chuyển khoản học phí"
      description={
        <div className={styles.body}>
          <p>
            Khoá <strong>{course.name}</strong>
          </p>
          <img
            className={styles.qr}
            src={paymentQr}
            alt={`Mã QR chuyển khoản ${BANK_ACCOUNT.bankName}, chủ tài khoản ${BANK_ACCOUNT.accountName}`}
            width={560}
            height={778}
          />
          <dl className={styles.details}>
            <div>
              <dt>Ngân hàng</dt>
              <dd>{BANK_ACCOUNT.bankName}</dd>
            </div>
            <div>
              <dt>Chủ tài khoản</dt>
              <dd>{BANK_ACCOUNT.accountName}</dd>
            </div>
            <div>
              <dt>Số tài khoản</dt>
              <dd>
                <CopyValue value={BANK_ACCOUNT.accountNumber} label="Sao chép số tài khoản" />
              </dd>
            </div>
            <div>
              <dt>Nội dung</dt>
              <dd>
                <CopyValue value={content} label="Sao chép nội dung chuyển khoản" />
              </dd>
            </div>
          </dl>
          <p className={styles.note}>
            Ghi đúng nội dung để trung tâm đối chiếu. Chưa rõ học phí, gọi{' '}
            <a href={`tel:${CONTACT.HOTLINE.replace(/\s/g, '')}`}>{CONTACT.HOTLINE}</a>. Chuyển
            khoản xong, bấm <strong>Đã thanh toán</strong>: khoá học mở trong “Khoá học của tôi” sau
            khi quản trị viên duyệt.
          </p>
        </div>
      }
      confirmLabel="Đã thanh toán"
      cancelLabel="Để sau"
      loading={enroll.isPending}
      error={
        enroll.error
          ? enrollmentErrorMessage(enroll.error, 'Chưa gửi được xác nhận. Vui lòng thử lại.')
          : undefined
      }
      onConfirm={() =>
        enroll.mutate(course.id, {
          onSuccess: (enrollment) => {
            close()
            onSubmitted?.(enrollment)
          },
        })
      }
      onCancel={close}
    />
  )
}

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Trình duyệt chặn clipboard: người dùng vẫn tự chọn được chữ.
    }
  }

  return (
    <span className={styles.copy}>
      <span className={styles.value}>{value}</span>
      <IconButton label={copied ? 'Đã sao chép' : label} onClick={() => void copy()}>
        {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
      </IconButton>
    </span>
  )
}
