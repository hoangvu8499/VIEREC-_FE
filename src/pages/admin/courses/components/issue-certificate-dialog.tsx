import { Award, FileText } from 'lucide-react'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { FileField } from '@/components/form/file-field'
import { CERTIFICATE_FILE_RULES } from '@/constants/course'
import {
  enrollmentAdminErrorMessage,
  useIssueCertificate,
} from '@/pages/admin/courses/use-course-enrollments'
import type { Enrollment } from '@/types/course'
import { formatFileSize } from '@/utils/format-file-size'

const MAX_SIZE_LABEL = formatFileSize(CERTIFICATE_FILE_RULES.maxBytes)

/** Lỗi chọn file (trước khi gửi), `undefined` nếu hợp lệ. */
function fileError(file: File | undefined): string | undefined {
  if (!file) return 'Vui lòng chọn file PDF chứng chỉ'
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!CERTIFICATE_FILE_RULES.extensions.some((allowed) => allowed === extension)) {
    return 'Chứng chỉ phải là file PDF'
  }
  if (file.size > CERTIFICATE_FILE_RULES.maxBytes) return `File tối đa ${MAX_SIZE_LABEL}`
  return undefined
}

interface IssueCertificateDialogProps {
  courseId: number
  /** Lượt ghi danh đang cấp; `undefined` = đóng. */
  enrollment: Enrollment | undefined
  onClose: () => void
  onIssued: (enrollment: Enrollment, code: string) => void
}

export function IssueCertificateDialog({
  courseId,
  enrollment,
  onClose,
  onIssued,
}: IssueCertificateDialogProps) {
  const [file, setFile] = useState<File>()
  const [error, setError] = useState<string>()
  const issue = useIssueCertificate(courseId)

  const close = () => {
    setFile(undefined)
    setError(undefined)
    issue.reset()
    onClose()
  }

  return (
    <ConfirmDialog
      open={Boolean(enrollment)}
      tone="primary"
      icon={Award}
      title="Cấp chứng chỉ"
      description={
        <>
          <p>
            Cấp chứng chỉ cho <strong>{enrollment?.fullName}</strong> (@{enrollment?.username}). Họ
            tên, ngày sinh và CCCD hiện tại của học viên sẽ được lưu vào chứng chỉ; sau đó học viên
            không tự sửa được các thông tin này.
          </p>
          <FileField
            label="File chứng chỉ (PDF)"
            required
            accept=".pdf,application/pdf"
            icon={FileText}
            hint={`Chỉ nhận PDF, tối đa ${MAX_SIZE_LABEL}.`}
            value={file}
            error={error}
            disabled={issue.isPending}
            onChange={(next) => {
              setFile(next)
              setError(next ? fileError(next) : undefined)
            }}
          />
        </>
      }
      confirmLabel="Cấp chứng chỉ"
      loading={issue.isPending}
      error={
        issue.isError
          ? enrollmentAdminErrorMessage(issue.error, 'Chưa cấp được chứng chỉ. Vui lòng thử lại.')
          : undefined
      }
      onConfirm={() => {
        const problem = fileError(file)
        setError(problem)
        if (problem || !file || !enrollment) return
        issue.mutate(
          { enrollmentId: enrollment.id, file },
          {
            onSuccess: (certificate) => {
              onIssued(enrollment, certificate.code)
              close()
            },
          },
        )
      }}
      onCancel={close}
    />
  )
}
