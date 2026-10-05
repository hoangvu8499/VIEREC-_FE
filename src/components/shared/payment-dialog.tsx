import { Check, Copy, QrCode as QrIcon } from 'lucide-react'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { IconButton } from '@/components/common/icon-button'
import { QrCode } from '@/components/common/qr-code'
import { CONTACT } from '@/constants/contact'
import { BANK_ACCOUNT, transferContent } from '@/constants/payment'
import { enrollmentErrorMessage, useEnroll } from '@/hooks/use-enrollments'
import { useAuthStore } from '@/stores/auth-store'
import type { Course, Enrollment } from '@/types/course'
import { formatVnd } from '@/utils/format-currency'
import { vietQrPayload } from '@/utils/viet-qr'

import styles from './payment-dialog.module.css'

interface PaymentDialogProps {
  course: Pick<Course, 'id' | 'name' | 'price'>
  open: boolean
  onClose: () => void
  /** Đã báo chuyển khoản xong: `PENDING` (chờ duyệt), hoặc `ENROLLED` nếu backend duyệt luôn. */
  onSubmitted?: (enrollment: Enrollment) => void
}

/**
 * Mã QR chuyển khoản học phí: app ngân hàng quét ra sẵn số tiền (giá khoá) và nội dung (mã khoá + mã học viên).
 * Bấm "Đã thanh toán" thì gửi đăng ký để admin đối chiếu và duyệt.
 */
export function PaymentDialog({ course, open, onClose, onSubmitted }: PaymentDialogProps) {
  const userId = useAuthStore((state) => state.user?.id ?? 0)
  const enroll = useEnroll()
  const content = transferContent(course.id, userId)
  const qr = vietQrPayload({ ...BANK_ACCOUNT, amount: course.price, content })

  const close = () => {
    enroll.reset()
    onClose()
  }

  return (
    <ConfirmDialog
      open={open}
      tone="primary"
      icon={QrIcon}
      title="Chuyển khoản học phí"
      description={
        <div className={styles.body}>
          <p>
            Khoá <strong>{course.name}</strong>
          </p>
          <QrCode
            className={styles.qr}
            value={qr}
            label={`Mã QR chuyển khoản ${formatVnd(course.price)} vào tài khoản ${BANK_ACCOUNT.bankName} của ${BANK_ACCOUNT.accountName}`}
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
              <dt>Số tiền</dt>
              <dd>
                <CopyValue
                  value={String(course.price)}
                  display={formatVnd(course.price)}
                  label="Sao chép số tiền"
                />
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
            Quét mã bằng app ngân hàng: số tiền và nội dung đã điền sẵn, giữ nguyên để trung tâm đối
            chiếu. Chuyển khoản xong, bấm <strong>Đã thanh toán</strong>: khoá học mở trong “Khoá
            học của tôi” sau khi quản trị viên duyệt. Cần hỗ trợ, gọi{' '}
            <a href={`tel:${CONTACT.HOTLINE.replace(/\s/g, '')}`}>{CONTACT.HOTLINE}</a>.
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

function CopyValue({
  value,
  display = value,
  label,
}: {
  value: string
  /** Chữ hiện ra, khi khác giá trị sao chép (vd. `100.000 ₫` → sao chép `100000`). */
  display?: string
  label: string
}) {
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
      <span className={styles.value}>{display}</span>
      <IconButton label={copied ? 'Đã sao chép' : label} onClick={() => void copy()}>
        {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
      </IconButton>
    </span>
  )
}
