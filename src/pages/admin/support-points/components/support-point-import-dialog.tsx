import { Download, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { buttonClass } from '@/components/common/button-class'
import { Dialog } from '@/components/common/dialog'
import { FileField } from '@/components/form/file-field'
import { SUPPORT_POINT_RULES, SUPPORT_POINT_TEMPLATE_PATH } from '@/constants/support-point'
import {
  importSupportPointsErrorMessage,
  useImportSupportPoints,
} from '@/pages/admin/support-points/use-support-points'
import { supportPointImportRowErrors } from '@/schemas/support-point-api-errors'
import type { SupportPointImportResult } from '@/types/support-point'
import { apiFileUrl } from '@/utils/api-file-url'
import { formatFileSize } from '@/utils/format-file-size'

import styles from './support-points.module.css'

const MAX_SIZE_LABEL = formatFileSize(SUPPORT_POINT_RULES.importMaxBytes)
const ACCEPT = SUPPORT_POINT_RULES.importExtensions.map((extension) => `.${extension}`).join(',')

/** Lỗi chọn file (trước khi gửi), `undefined` nếu hợp lệ. */
function fileError(file: File | undefined): string | undefined {
  if (!file) return 'Vui lòng chọn file Excel điểm hỗ trợ'
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!SUPPORT_POINT_RULES.importExtensions.some((allowed) => allowed === extension)) {
    return 'Chỉ nhận file Excel .xlsx hoặc .xls'
  }
  if (file.size > SUPPORT_POINT_RULES.importMaxBytes) return `File tối đa ${MAX_SIZE_LABEL}`
  return undefined
}

interface SupportPointImportDialogProps {
  open: boolean
  onClose: () => void
  onImported: (result: SupportPointImportResult) => void
}

/** Tải file mẫu → điền các điểm kèm toạ độ → chọn file. Có dòng sai thì không lưu điểm nào. */
export function SupportPointImportDialog({
  open,
  onClose,
  onImported,
}: SupportPointImportDialogProps) {
  const [file, setFile] = useState<File>()
  const [error, setError] = useState<string>()
  const importPoints = useImportSupportPoints()
  const rowErrors = importPoints.error ? supportPointImportRowErrors(importPoints.error) : []

  const close = () => {
    setFile(undefined)
    setError(undefined)
    importPoints.reset()
    onClose()
  }

  const submit = () => {
    const problem = fileError(file)
    setError(problem)
    if (problem || !file) return
    importPoints.mutate(file, {
      onSuccess: (result) => {
        onImported(result)
        close()
      },
    })
  }

  return (
    <Dialog
      open={open}
      title="Import điểm hỗ trợ từ Excel"
      description="Các điểm trong file được thêm vào danh sách hiện có."
      busy={importPoints.isPending}
      onClose={close}
    >
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <ol className={styles.steps}>
          <li>
            Tải file mẫu, điền mỗi dòng một điểm: tên đơn vị, tỉnh / thành phố, quận / huyện, địa
            chỉ chi tiết (có thể bỏ trống), số điện thoại, vĩ độ, kinh độ. Tối đa{' '}
            {SUPPORT_POINT_RULES.importMaxRows} điểm mỗi file.
            <a
              className={buttonClass({ variant: 'outline', size: 'sm' }, styles.templateLink)}
              href={apiFileUrl(SUPPORT_POINT_TEMPLATE_PATH)}
              download
            >
              <Download size={16} aria-hidden /> Tải file mẫu (.xlsx)
            </a>
          </li>
          <li>
            Mỗi dòng <strong>bắt buộc có vĩ độ và kinh độ</strong>: chuột phải vào vị trí trên
            Google Maps, bấm vào dòng số đầu tiên để sao chép.
          </li>
          <li>Chọn file đã điền rồi bấm Import.</li>
        </ol>

        <fieldset className={styles.fieldset} disabled={importPoints.isPending}>
          <legend className="sr-only">File điểm hỗ trợ</legend>
          <FileField
            label="File điểm hỗ trợ"
            required
            accept={ACCEPT}
            icon={FileSpreadsheet}
            hint={`Excel .xlsx hoặc .xls, tối đa ${MAX_SIZE_LABEL}.`}
            value={file}
            error={error}
            disabled={importPoints.isPending}
            onChange={(next) => {
              setFile(next)
              setError(next ? fileError(next) : undefined)
              importPoints.reset()
            }}
          />
        </fieldset>

        {importPoints.isError && (
          <Alert variant="error" title="Chưa import được">
            {importSupportPointsErrorMessage(importPoints.error)}
            {rowErrors.length > 0 && (
              <ul className={styles.rowErrors} aria-label="Các dòng cần sửa">
                {rowErrors.map(({ row, message }) => (
                  <li key={row}>
                    <strong>Dòng {row}:</strong> {message}
                  </li>
                ))}
              </ul>
            )}
          </Alert>
        )}

        <div className={styles.formActions}>
          <Button variant="ghost" disabled={importPoints.isPending} onClick={close}>
            Huỷ
          </Button>
          <Button type="submit" variant="accent" loading={importPoints.isPending}>
            Import
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
