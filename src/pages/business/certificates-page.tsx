import { Award, Eye, RotateCw, SearchX } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { EmptyState } from '@/components/common/empty-state'
import { Pagination } from '@/components/common/pagination'
import { CertificateActions } from '@/components/shared/certificate-actions'
import { MemberSearch } from '@/components/shared/member-search'
import { BUSINESS_PAGE_SIZE } from '@/constants/business'
import { businessCertificatePath, businessMemberPath, BUSINESS_ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import { useListParams } from '@/pages/business/use-list-params'
import { businessErrorMessage, useMyCertificates } from '@/pages/business/use-my-business'
import type { Certificate } from '@/types/course'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format-date'

import shared from './business.module.css'
import styles from './certificates-page.module.css'

const numberFormatter = new Intl.NumberFormat('vi-VN')

function CertificateRow({ certificate }: { certificate: Certificate }) {
  return (
    <li className={styles.row}>
      <span className={styles.icon} aria-hidden>
        <Award size={22} />
      </span>
      <div className={styles.info}>
        <h2 className={styles.name}>
          <Link to={businessMemberPath(certificate.userId)}>{certificate.fullName}</Link>
        </h2>
        <p className={styles.course}>{certificate.courseName}</p>
        <p className={styles.meta}>
          <span className={styles.code}>{certificate.code}</span>
          <span>Cấp ngày {formatDate(certificate.issuedAt)}</span>
        </p>
      </div>
      <div className={styles.actions}>
        <ButtonLink
          to={businessCertificatePath(certificate.code)}
          variant="primary"
          size="sm"
          aria-label={`Xem chứng chỉ ${certificate.code} của ${certificate.fullName}`}
        >
          <Eye size={16} aria-hidden /> Xem
        </ButtonLink>
        <CertificateActions certificate={certificate} size="sm" withVerifyLink={false} />
      </div>
    </li>
  )
}

/** Chứng chỉ của mọi học viên trong doanh nghiệp: xem, tải, in. */
export default function BusinessCertificatesPage() {
  useDocumentTitle('Chứng chỉ – Góc doanh nghiệp')
  const { keyword, page, update } = useListParams()
  const certificates = useMyCertificates({ keyword, page, size: BUSINESS_PAGE_SIZE })
  const data = certificates.data

  return (
    <>
      <AccountPageHeader
        title="Chứng chỉ"
        description="Chứng chỉ đã cấp cho học viên của doanh nghiệp: xem thông tin, tải về hoặc in bản PDF."
      />
      <section className={cn(shared.panel, shared.padded)} aria-label="Danh sách chứng chỉ">
        <MemberSearch
          key={keyword ?? ''}
          keyword={keyword}
          label="Tìm chứng chỉ"
          placeholder="Mã chứng chỉ, họ tên học viên hoặc tên khoá học"
          onSearch={(next) => update({ keyword: next, page: 0 })}
        />
        {certificates.isPending ? (
          <p className={shared.loading} aria-busy>
            Đang tải chứng chỉ…
          </p>
        ) : certificates.isError ? (
          <EmptyState
            icon={RotateCw}
            tone="danger"
            title="Không tải được chứng chỉ"
            description={businessErrorMessage(
              certificates.error,
              'Đã có lỗi xảy ra. Vui lòng thử lại.',
            )}
            action={
              <Button variant="outline" onClick={() => void certificates.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : data && data.content.length > 0 ? (
          <>
            <ul className={styles.list} aria-busy={certificates.isPlaceholderData}>
              {data.content.map((certificate) => (
                <CertificateRow key={certificate.id} certificate={certificate} />
              ))}
            </ul>
            <div className={shared.footer}>
              <span className={shared.summary}>
                {numberFormatter.format(data.totalElements)} chứng chỉ
              </span>
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onChange={(next) => update({ keyword, page: next })}
                label="Phân trang chứng chỉ"
              />
            </div>
          </>
        ) : keyword ? (
          <EmptyState icon={SearchX} title="Không tìm thấy chứng chỉ phù hợp" />
        ) : (
          <EmptyState
            icon={Award}
            title="Chưa có chứng chỉ nào"
            description="Học viên hoàn thành khoá học và được VIEREC cấp chứng chỉ thì chứng chỉ sẽ hiện ở đây."
            action={
              <ButtonLink to={BUSINESS_ROUTES.ENROLL} variant="accent">
                Đăng ký khoá học
              </ButtonLink>
            }
          />
        )}
      </section>
    </>
  )
}
