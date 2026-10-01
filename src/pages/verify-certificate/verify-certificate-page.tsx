import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, CircleX, RotateCw, Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'

import { Button } from '@/components/common/button'
import { Container } from '@/components/common/container'
import { EmptyState } from '@/components/common/empty-state'
import { TextField } from '@/components/form/text-field'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { CERTIFICATE_QUERY_KEYS } from '@/constants/course'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { certificateService } from '@/services/certificate-service'
import type { ApiError } from '@/types/api'
import type { CertificateVerification } from '@/types/course'
import { apiErrorMessage } from '@/utils/api-error-message'
import { formatDate } from '@/utils/format-date'

import styles from './verify-certificate-page.module.css'

const CODE_PARAM = 'ma'
/** Giới hạn độ dài mã của backend. */
const CODE_MAX_LENGTH = 30

function VerifiedCertificate({ result }: { result: CertificateVerification }) {
  return (
    <section className={styles.valid} aria-labelledby="verify-result-title">
      <p id="verify-result-title" className={styles.validTitle}>
        <BadgeCheck size={24} aria-hidden /> Chứng chỉ hợp lệ
      </p>
      <p className={styles.validText}>Chứng chỉ do VIEREC Academy cấp, thông tin như sau:</p>
      <dl className={styles.facts}>
        <div>
          <dt>Mã chứng chỉ</dt>
          <dd className={styles.code}>{result.code}</dd>
        </div>
        <div>
          <dt>Học viên</dt>
          <dd>{result.fullName}</dd>
        </div>
        <div>
          <dt>Số CCCD</dt>
          <dd>{result.cccdMasked ?? '—'}</dd>
        </div>
        <div>
          <dt>Khoá học</dt>
          <dd>{result.courseName}</dd>
        </div>
        <div>
          <dt>Ngày cấp</dt>
          <dd>{formatDate(result.issuedAt)}</dd>
        </div>
      </dl>
    </section>
  )
}

export default function VerifyCertificatePage() {
  useDocumentTitle('Tra cứu chứng chỉ')
  const [searchParams, setSearchParams] = useSearchParams()
  const code = searchParams.get(CODE_PARAM)?.trim().toUpperCase() ?? ''
  const [draft, setDraft] = useState(code)

  const verification = useQuery<CertificateVerification, ApiError>({
    queryKey: CERTIFICATE_QUERY_KEYS.verify(code),
    queryFn: () => certificateService.verify(code),
    enabled: code !== '',
    retry: false,
  })

  const notFound =
    verification.isError &&
    (verification.error.code === API_ERROR_CODES.CERTIFICATE_NOT_FOUND ||
      // Mã quá dài → 400 validation: coi như không có.
      verification.error.status === 400)

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="verify-title">
        <Container className={styles.heroInner}>
          <span className={styles.heroIcon} aria-hidden>
            <ShieldCheck size={30} />
          </span>
          <h1 id="verify-title" className={styles.title}>
            Tra cứu chứng chỉ
          </h1>
          <p className={styles.subtitle}>
            Nhập mã in trên chứng chỉ để kiểm tra chứng chỉ do VIEREC Academy cấp.
          </p>
        </Container>
      </section>

      <Container className={styles.content}>
        <search className={styles.search}>
          <form
            className={styles.searchForm}
            onSubmit={(event) => {
              event.preventDefault()
              const next = draft.trim().toUpperCase()
              setDraft(next)
              setSearchParams(next ? { [CODE_PARAM]: next } : {})
            }}
          >
            <TextField
              label="Mã chứng chỉ"
              placeholder="VD: VRC-2026-7K3QX9PA"
              autoComplete="off"
              spellCheck={false}
              maxLength={CODE_MAX_LENGTH}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button type="submit" variant="accent" className={styles.searchButton}>
              <Search size={18} aria-hidden /> Tra cứu
            </Button>
          </form>
        </search>

        <div aria-live="polite">
          {!code ? null : verification.isPending ? (
            <p className={styles.loading} aria-busy>
              Đang tra cứu…
            </p>
          ) : notFound ? (
            <EmptyState
              className={styles.result}
              icon={CircleX}
              tone="danger"
              title="Không tìm thấy chứng chỉ"
              description={
                <>
                  Không có chứng chỉ nào mang mã <strong>{code}</strong>. Vui lòng kiểm tra lại mã
                  (gồm cả dấu gạch ngang).
                </>
              }
            />
          ) : verification.isError ? (
            <EmptyState
              className={styles.result}
              icon={RotateCw}
              tone="danger"
              title="Chưa tra cứu được"
              description={apiErrorMessage(verification.error, {
                fallback: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
              })}
              action={
                <Button variant="outline" onClick={() => void verification.refetch()}>
                  Thử lại
                </Button>
              }
            />
          ) : (
            <VerifiedCertificate result={verification.data} />
          )}
        </div>
      </Container>
    </div>
  )
}
