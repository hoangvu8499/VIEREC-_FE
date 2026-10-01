import { ReceiptText, RotateCw, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/constants/payment'
import { coursePath, LEARNER_ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useMyPayments } from '@/hooks/use-payments'
import { LearnerPageHeader } from '@/pages/learner/components/learner-page-header'
import type { Payment } from '@/types/payment'
import { apiErrorMessage } from '@/utils/api-error-message'
import { cn } from '@/utils/cn'
import { formatVnd } from '@/utils/format-currency'
import { formatDateTime } from '@/utils/format-date-time'

import styles from './payments-page.module.css'

export default function PaymentsPage() {
  useDocumentTitle('Lịch sử thanh toán')
  const [page, setPage] = useState(0)
  const payments = useMyPayments(page)
  const data = payments.data

  return (
    <>
      <LearnerPageHeader
        title="Lịch sử thanh toán"
        description="Học phí bạn đã chuyển và trạng thái xác nhận của trung tâm."
      />

      <section className={styles.panel} aria-label="Giao dịch của tôi">
        {payments.isPending ? (
          <p className={styles.loading} aria-busy>
            Đang tải giao dịch…
          </p>
        ) : payments.isError ? (
          <EmptyState
            icon={RotateCw}
            tone="danger"
            title="Không tải được lịch sử thanh toán"
            description={apiErrorMessage(payments.error, {
              fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            })}
            action={
              <Button variant="outline" onClick={() => void payments.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : data && data.content.length > 0 ? (
          <>
            <ul className={styles.list} aria-busy={payments.isPlaceholderData}>
              {data.content.map((payment) => (
                <li key={payment.id}>
                  <PaymentItem payment={payment} />
                </li>
              ))}
            </ul>
            <Pagination
              className={styles.pagination}
              page={data.page}
              totalPages={data.totalPages}
              onChange={setPage}
              label="Phân trang lịch sử thanh toán"
            />
          </>
        ) : (
          <EmptyState
            icon={ReceiptText}
            title="Chưa có giao dịch nào"
            description="Khi bạn chuyển khoản học phí và báo đã thanh toán, giao dịch sẽ hiện ở đây."
            action={
              <ButtonLink to={LEARNER_ROUTES.ENROLL} variant="accent">
                <Search size={18} aria-hidden /> Tìm khoá học
              </ButtonLink>
            }
          />
        )}
      </section>
    </>
  )
}

function PaymentItem({ payment }: { payment: Payment }) {
  return (
    <article className={styles.item}>
      <div className={styles.main}>
        <h2 className={styles.course}>
          <Link to={coursePath(payment.courseId)}>{payment.courseName}</Link>
        </h2>
        <dl className={styles.meta}>
          <div>
            <dt>Ngày tạo</dt>
            <dd>{formatDateTime(payment.createdAt)}</dd>
          </div>
          <div>
            <dt>Hình thức</dt>
            <dd>{PAYMENT_METHOD_LABELS[payment.method]}</dd>
          </div>
          {payment.transactionRef && (
            <div>
              <dt>Mã giao dịch</dt>
              <dd>{payment.transactionRef}</dd>
            </div>
          )}
          {payment.paidAt && (
            <div>
              <dt>Xác nhận nhận tiền</dt>
              <dd>{formatDateTime(payment.paidAt)}</dd>
            </div>
          )}
        </dl>
        {payment.note && <p className={styles.note}>{payment.note}</p>}
      </div>
      <div className={styles.side}>
        <p className={styles.amount}>{formatVnd(Number(payment.amount))}</p>
        <span className={cn(styles.badge, styles[payment.status])}>
          {PAYMENT_STATUS_LABELS[payment.status]}
        </span>
      </div>
    </article>
  )
}
