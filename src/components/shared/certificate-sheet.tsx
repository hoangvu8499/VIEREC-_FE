import logoMark from '@/assets/images/logo-mark.webp'
import { QrCode } from '@/components/common/qr-code'
import { certificateVerifyPath } from '@/constants/routes'
import type { Certificate } from '@/types/course'
import { formatDate } from '@/utils/format-date'

import styles from './certificate-sheet.module.css'

/** Thông tin chứng chỉ trình bày như giấy chứng nhận (bản chụp lúc cấp, không đổi theo hồ sơ). */
export function CertificateSheet({ certificate }: { certificate: Certificate }) {
  const verifyUrl = new URL(
    certificateVerifyPath(certificate.code),
    window.location.origin,
  ).toString()

  return (
    <article className={styles.sheet} aria-labelledby="certificate-name">
      <header className={styles.brand}>
        <img src={logoMark} alt="" width={56} height={56} />
        <div>
          <p className={styles.brandName}>VIEREC ACADEMY</p>
          <p className={styles.brandSlogan}>An toàn hôm nay – Phát triển bền vững ngày mai</p>
        </div>
      </header>

      <p className={styles.kind}>Chứng chỉ hoàn thành khoá học</p>
      <p className={styles.lead}>Chứng nhận</p>
      <h2 id="certificate-name" className={styles.name}>
        {certificate.fullName}
      </h2>
      <p className={styles.identity}>
        <span>
          Ngày sinh: {certificate.dateOfBirth ? formatDate(certificate.dateOfBirth) : '—'}
        </span>
        <span>Số CCCD: {certificate.cccd ?? '—'}</span>
      </p>
      <p className={styles.lead}>đã hoàn thành khoá học</p>
      <p className={styles.course}>{certificate.courseName}</p>

      <footer className={styles.footer}>
        <dl className={styles.facts}>
          <div>
            <dt>Mã chứng chỉ</dt>
            <dd className={styles.code}>{certificate.code}</dd>
          </div>
          <div>
            <dt>Ngày cấp</dt>
            <dd>{formatDate(certificate.issuedAt)}</dd>
          </div>
        </dl>
        <figure className={styles.qr}>
          <QrCode value={verifyUrl} label={`Mã QR tra cứu chứng chỉ ${certificate.code}`} />
          <figcaption>Quét để tra cứu</figcaption>
        </figure>
      </footer>
    </article>
  )
}
