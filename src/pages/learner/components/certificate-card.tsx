import { Award, Check, Copy, Download } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/common/button'
import { buttonClass } from '@/components/common/button-class'
import { certificateVerifyPath } from '@/constants/routes'
import type { Certificate } from '@/types/course'
import { apiFileUrl } from '@/utils/api-file-url'
import { formatDate } from '@/utils/format-date'

import styles from './certificate-card.module.css'

/** Chứng chỉ của học viên — thông tin là bản chụp lúc cấp, không đổi theo hồ sơ. */
export function CertificateCard({ certificate }: { certificate: Certificate }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copyVerifyLink = async () => {
    const url = new URL(certificateVerifyPath(certificate.code), window.location.origin).toString()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Trình duyệt chặn clipboard (http, iframe...) → mở trang tra cứu để người dùng tự sao chép.
      window.open(url, '_blank', 'noopener')
    }
  }

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
          <a
            href={apiFileUrl(certificate.fileUrl)}
            target="_blank"
            rel="noreferrer"
            className={buttonClass({ variant: 'accent', size: 'sm' })}
            aria-label={`Tải chứng chỉ ${certificate.courseName} (PDF, tab mới)`}
          >
            <Download size={16} aria-hidden /> Tải chứng chỉ (PDF)
          </a>
          <Button variant="outline" size="sm" onClick={() => void copyVerifyLink()}>
            {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
            {copied ? 'Đã sao chép' : 'Sao chép link tra cứu'}
          </Button>
          <span className="sr-only" aria-live="polite">
            {copied ? 'Đã sao chép link tra cứu chứng chỉ' : ''}
          </span>
        </div>
      </div>
    </article>
  )
}
