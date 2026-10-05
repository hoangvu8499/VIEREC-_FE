import { Award, RotateCw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { LEARNER_ROUTES, ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useMyCertificates } from '@/hooks/use-enrollments'
import { CertificateCard } from '@/pages/learner/components/certificate-card'
import { CertificateIdentity } from '@/pages/learner/components/certificate-identity'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import { useAuthStore } from '@/stores/auth-store'
import { apiErrorMessage } from '@/utils/api-error-message'

import styles from './certificates-page.module.css'

export default function CertificatesPage() {
  useDocumentTitle('Chứng chỉ')
  const user = useAuthStore((state) => state.user)
  const [page, setPage] = useState(0)
  const certificates = useMyCertificates(page)
  const data = certificates.data

  return (
    <>
      <AccountPageHeader
        title="Chứng chỉ"
        description="Chứng chỉ được cấp sau khi bạn hoàn thành khoá học."
        action={
          <ButtonLink to={ROUTES.VERIFY_CERTIFICATE} variant="outline">
            <ShieldCheck size={18} aria-hidden /> Tra cứu chứng chỉ
          </ButtonLink>
        }
      />

      {certificates.isPending ? (
        <p className={styles.loading} aria-busy>
          Đang tải chứng chỉ…
        </p>
      ) : certificates.isError ? (
        <section className={styles.panel}>
          <EmptyState
            icon={RotateCw}
            tone="danger"
            title="Không tải được chứng chỉ"
            description={apiErrorMessage(certificates.error, {
              fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            })}
            action={
              <Button variant="outline" onClick={() => void certificates.refetch()}>
                Thử lại
              </Button>
            }
          />
        </section>
      ) : data && data.content.length > 0 ? (
        <>
          <ul
            className={styles.list}
            aria-label="Chứng chỉ của tôi"
            aria-busy={certificates.isPlaceholderData}
          >
            {data.content.map((certificate) => (
              <li key={certificate.id}>
                <CertificateCard certificate={certificate} />
              </li>
            ))}
          </ul>
          <Pagination
            className={styles.pagination}
            page={data.page}
            totalPages={data.totalPages}
            onChange={setPage}
            label="Phân trang chứng chỉ"
          />
        </>
      ) : (
        <section className={styles.panel}>
          <EmptyState
            icon={Award}
            title="Bạn chưa có chứng chỉ nào"
            description="Khi bạn hoàn thành khoá học và được xác nhận, chứng chỉ sẽ hiện ở đây để xem và tải về."
            action={
              <ButtonLink to={LEARNER_ROUTES.MY_COURSES} variant="accent">
                Xem khoá học của tôi
              </ButtonLink>
            }
          />
        </section>
      )}

      {user && <CertificateIdentity user={user} />}
    </>
  )
}
