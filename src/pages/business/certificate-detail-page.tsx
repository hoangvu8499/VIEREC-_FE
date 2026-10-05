import { ArrowLeft, Award, CircleAlert, UserRound } from 'lucide-react'
import { useParams } from 'react-router'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { CertificateDetail } from '@/components/shared/certificate-detail'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { BUSINESS_ROUTES, businessMemberPath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import { businessErrorMessage, useMyCertificate } from '@/pages/business/use-my-business'

import styles from './business.module.css'

/** Chứng chỉ của một học viên trong doanh nghiệp: xem, tải, in. */
export default function BusinessCertificateDetailPage() {
  const { code } = useParams()
  const certificate = useMyCertificate(code)
  useDocumentTitle(
    certificate.data
      ? `Chứng chỉ ${certificate.data.code} – Góc doanh nghiệp`
      : 'Chứng chỉ – Góc doanh nghiệp',
  )

  const back = (
    <ButtonLink to={BUSINESS_ROUTES.CERTIFICATES} variant="outline">
      <ArrowLeft size={18} aria-hidden /> Danh sách chứng chỉ
    </ButtonLink>
  )

  if (!code || certificate.error?.code === API_ERROR_CODES.CERTIFICATE_NOT_FOUND) {
    return (
      <EmptyState
        icon={Award}
        title="Không tìm thấy chứng chỉ"
        description="Chứng chỉ không tồn tại hoặc không thuộc học viên của doanh nghiệp bạn."
        action={back}
      />
    )
  }
  if (certificate.isError) {
    return (
      <EmptyState
        icon={CircleAlert}
        tone="danger"
        title="Không tải được chứng chỉ"
        description={businessErrorMessage(certificate.error, 'Đã có lỗi xảy ra. Vui lòng thử lại.')}
        action={
          <Button variant="outline" onClick={() => void certificate.refetch()}>
            Thử lại
          </Button>
        }
      />
    )
  }
  if (!certificate.data) {
    return (
      <p className={styles.loading} aria-busy>
        Đang tải chứng chỉ…
      </p>
    )
  }

  const data = certificate.data
  return (
    <>
      <AccountPageHeader
        title="Thông tin chứng chỉ"
        description={`${data.fullName} · ${data.courseName}`}
        action={back}
      />
      <CertificateDetail
        certificate={data}
        aside={
          <ButtonLink to={businessMemberPath(data.userId)} variant="ghost">
            <UserRound size={18} aria-hidden /> Tiến độ học tập của {data.fullName}
          </ButtonLink>
        }
      />
    </>
  )
}
