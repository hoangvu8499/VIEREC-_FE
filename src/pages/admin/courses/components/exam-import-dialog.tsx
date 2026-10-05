import { Download, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { buttonClass } from '@/components/common/button-class'
import { Dialog } from '@/components/common/dialog'
import { FileField } from '@/components/form/file-field'
import { RadioGroupField } from '@/components/form/radio-group-field'
import { EXAM_IMPORT_MODES, EXAM_RULES, EXAM_TEMPLATE_PATH } from '@/constants/exam'
import { importErrorMessage, useImportQuestions } from '@/pages/admin/courses/use-exam'
import { examImportRowErrors } from '@/schemas/exam-api-errors'
import type { ExamImportMode, ExamImportResult } from '@/types/exam'
import { apiFileUrl } from '@/utils/api-file-url'
import { formatFileSize } from '@/utils/format-file-size'

import styles from './exam.module.css'

const MAX_SIZE_LABEL = formatFileSize(EXAM_RULES.importMaxBytes)
const ACCEPT = EXAM_RULES.importExtensions.map((extension) => `.${extension}`).join(',')

/** Lỗi chọn file (trước khi gửi), `undefined` nếu hợp lệ. */
function fileError(file: File | undefined): string | undefined {
  if (!file) return 'Vui lòng chọn file Excel câu hỏi'
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!EXAM_RULES.importExtensions.some((allowed) => allowed === extension)) {
    return 'Chỉ nhận file Excel .xlsx hoặc .xls'
  }
  if (file.size > EXAM_RULES.importMaxBytes) return `File tối đa ${MAX_SIZE_LABEL}`
  return undefined
}

interface ExamImportDialogProps {
  courseId: number
  open: boolean
  /** Số câu đang có: nhắc khi chọn "Thay toàn bộ". */
  questionCount: number
  onClose: () => void
  onImported: (result: ExamImportResult, mode: ExamImportMode) => void
}

/** Tải file mẫu → điền câu hỏi → chọn file và cách import. Có dòng sai thì không lưu câu nào. */
export function ExamImportDialog({
  courseId,
  open,
  questionCount,
  onClose,
  onImported,
}: ExamImportDialogProps) {
  const [file, setFile] = useState<File>()
  const [error, setError] = useState<string>()
  const [mode, setMode] = useState<ExamImportMode>('APPEND')
  const importQuestions = useImportQuestions(courseId)
  const rowErrors = importQuestions.error ? examImportRowErrors(importQuestions.error) : []

  const close = () => {
    setFile(undefined)
    setError(undefined)
    setMode('APPEND')
    importQuestions.reset()
    onClose()
  }

  const submit = () => {
    const problem = fileError(file)
    setError(problem)
    if (problem || !file) return
    importQuestions.mutate(
      { file, mode },
      {
        onSuccess: (result) => {
          onImported(result, mode)
          close()
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      title="Import câu hỏi từ Excel"
      description="Câu hỏi được thêm theo thứ tự dòng trong file."
      busy={importQuestions.isPending}
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
            Tải file mẫu, điền mỗi dòng một câu: câu hỏi, 4 đáp án A–D và đáp án đúng (A, B, C hoặc
            D). Tối đa {EXAM_RULES.importMaxQuestions} câu mỗi file.
            <a
              className={buttonClass({ variant: 'outline', size: 'sm' }, styles.templateLink)}
              href={apiFileUrl(EXAM_TEMPLATE_PATH)}
              download
            >
              <Download size={16} aria-hidden /> Tải file mẫu (.xlsx)
            </a>
          </li>
          <li>Chọn file đã điền và cách xử lý các câu đang có, rồi bấm Import.</li>
        </ol>

        <fieldset className={styles.fieldset} disabled={importQuestions.isPending}>
          <legend className="sr-only">File và cách import</legend>
          <FileField
            label="File câu hỏi"
            required
            accept={ACCEPT}
            icon={FileSpreadsheet}
            hint={`Excel .xlsx hoặc .xls, tối đa ${MAX_SIZE_LABEL}.`}
            value={file}
            error={error}
            disabled={importQuestions.isPending}
            onChange={(next) => {
              setFile(next)
              setError(next ? fileError(next) : undefined)
              importQuestions.reset()
            }}
          />
          <RadioGroupField
            label="Các câu đang có"
            name="import-mode"
            options={EXAM_IMPORT_MODES}
            value={mode}
            onChange={(event) => setMode(event.target.value as ExamImportMode)}
          />
          {mode === 'REPLACE' && questionCount > 0 && (
            <Alert variant="warning">
              {questionCount} câu đang có sẽ bị xoá và thay bằng các câu trong file.
            </Alert>
          )}
        </fieldset>

        {importQuestions.isError && (
          <Alert variant="error" title="Chưa import được">
            {importErrorMessage(importQuestions.error)}
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
          <Button variant="ghost" disabled={importQuestions.isPending} onClick={close}>
            Huỷ
          </Button>
          <Button type="submit" variant="accent" loading={importQuestions.isPending}>
            Import
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
