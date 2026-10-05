import { FileText } from 'lucide-react'
import type { ReactNode } from 'react'

import { CertificateActions } from '@/components/shared/certificate-actions'
import { CertificateSheet } from '@/components/shared/certificate-sheet'
import type { Certificate } from '@/types/course'

import styles from './certificate-detail.module.css'

interface CertificateDetailProps {
  certificate: Certificate
  /** Nội dung thêm ở cột bên, vd. link tới hồ sơ học viên (Góc doanh nghiệp). */
  aside?: ReactNode
}

/** Trang chi tiết chứng chỉ: giấy chứng nhận + tải / in bản PDF chính thức. */
export function CertificateDetail({ certificate, aside }: CertificateDetailProps) {
  return (
    <div className={styles.layout}>
      <CertificateSheet certificate={certificate} />
      <aside className={styles.aside} aria-label="Tệp chứng chỉ">
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <FileText size={18} aria-hidden /> Bản PDF chính thức
          </h2>
          <p className={styles.note}>
            Bản có giá trị là file PDF do VIEREC cấp. Tải về để lưu, hoặc in trực tiếp từ đây.
          </p>
          <CertificateActions certificate={certificate} layout="stack" />
        </section>
        {aside}
      </aside>
    </div>
  )
}
