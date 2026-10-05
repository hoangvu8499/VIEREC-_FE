import { Award, Eye } from 'lucide-react'

import { ButtonLink } from '@/components/common/button-link'
import { CertificateActions } from '@/components/shared/certificate-actions'
import { learnerCertificatePath } from '@/constants/routes'
import type { Certificate } from '@/types/course'
import { formatDate } from '@/utils/format-date'

import styles from './certificate-card.module.css'

/** Chứng chỉ của học viên — thông tin là bản chụp lúc cấp, không đổi theo hồ sơ. */
export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <article className={styles.card} aria-labelledby={`certificate-${certificate.id}`}>
      <div className={styles.ribbon} aria-hidden>
        <Award size={30} strokeWidth={1.75} />
      </div>
      <div className={styles.body}>
        <p className={styles.eyebrow}>Chứng chỉ hoàn thành khoá học</p>
        <h2 id={`certificate-${certificate.id}`} className={styles.course}>
          {certificate.courseName}
        </h2>
        <p className={styles.owner}>
          Cấp cho <strong>{certificate.fullName}</strong>
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>Mã chứng chỉ</dt>
            <dd className={styles.code}>{certificate.code}</dd>
          </div>
          <div>
            <dt>Ngày cấp</dt>
            <dd>{formatDate(certificate.issuedAt)}</dd>
          </div>
          <div>
            <dt>Ngày sinh</dt>
            <dd>{certificate.dateOfBirth ? formatDate(certificate.dateOfBirth) : '—'}</dd>
          </div>
          <div>
            <dt>Số CCCD</dt>
            <dd>{certificate.cccd ?? '—'}</dd>
          </div>
        </dl>
        <div className={styles.actions}>
          <ButtonLink
            to={learnerCertificatePath(certificate.code)}
            variant="primary"
            size="sm"
            aria-label={`Xem chứng chỉ ${certificate.courseName}`}
          >
            <Eye size={16} aria-hidden /> Xem chi tiết
          </ButtonLink>
          <CertificateActions certificate={certificate} size="sm" className={styles.inline} />
        </div>
      </div>
    </article>
  )
}
