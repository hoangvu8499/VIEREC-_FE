import { ArrowLeft, Award, CircleAlert } from 'lucide-react'
import { useParams } from 'react-router'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { CertificateDetail } from '@/components/shared/certificate-detail'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { LEARNER_ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useMyCertificate } from '@/hooks/use-enrollments'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import { apiErrorMessage } from '@/utils/api-error-message'

import styles from './certificates-page.module.css'

export default function CertificateDetailPage() {
  const { code } = useParams()
  const certificate = useMyCertificate(code)
  useDocumentTitle(certificate.data ? `Chứng chỉ ${certificate.data.code}` : 'Chứng chỉ')

  const back = (
    <ButtonLink to={LEARNER_ROUTES.CERTIFICATES} variant="outline">
      <ArrowLeft size={18} aria-hidden /> Chứng chỉ của tôi
    </ButtonLink>
  )

  if (!code || certificate.error?.code === API_ERROR_CODES.CERTIFICATE_NOT_FOUND) {
    return (
      <section className={styles.panel}>
        <EmptyState
          icon={Award}
          title="Không tìm thấy chứng chỉ"
          description="Chứng chỉ không tồn tại hoặc không thuộc tài khoản của bạn."
          action={back}
        />
      </section>
    )
  }
  if (certificate.isError) {
    return (
      <section className={styles.panel}>
        <EmptyState
          icon={CircleAlert}
          tone="danger"
          title="Không tải được chứng chỉ"
          description={apiErrorMessage(certificate.error, {
            fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
          })}
          action={
            <Button variant="outline" onClick={() => void certificate.refetch()}>
              Thử lại
            </Button>
          }
        />
      </section>
    )
  }
  if (!certificate.data) {
    return (
      <p className={styles.loading} aria-busy>
        Đang tải chứng chỉ…
      </p>
    )
  }

  return (
    <>
      <AccountPageHeader
        title="Thông tin chứng chỉ"
        description={certificate.data.courseName}
        action={back}
      />
      <CertificateDetail certificate={certificate.data} />
    </>
  )
}
