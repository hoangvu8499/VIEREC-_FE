import { Download, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { buttonClass } from '@/components/common/button-class'
import { Dialog } from '@/components/common/dialog'
import { FileField } from '@/components/form/file-field'
import { PasswordField } from '@/components/form/password-field'
import { MEMBER_IMPORT_RULES, MEMBER_IMPORT_TEMPLATE_PATH } from '@/constants/business'
import { memberImportErrorMessage, useImportMembers } from '@/pages/business/use-my-business'
import { memberImportRowErrors } from '@/schemas/business-api-errors'
import { PASSWORD_MIN_LENGTH, userFieldRules } from '@/schemas/user-schema'
import type { BusinessMemberImportResult } from '@/types/business'
import { apiFileUrl } from '@/utils/api-file-url'
import { formatFileSize } from '@/utils/format-file-size'

import styles from './member-import-dialog.module.css'

const MAX_SIZE_LABEL = formatFileSize(MEMBER_IMPORT_RULES.maxBytes)
const ACCEPT = MEMBER_IMPORT_RULES.extensions.map((extension) => `.${extension}`).join(',')

/** Lỗi chọn file (trước khi gửi), `undefined` nếu hợp lệ. */
function fileError(file: File | undefined): string | undefined {
  if (!file) return 'Vui lòng chọn file Excel học viên'
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!MEMBER_IMPORT_RULES.extensions.some((allowed) => allowed === extension)) {
    return 'Chỉ nhận file Excel .xlsx hoặc .xls'
  }
  if (file.size > MEMBER_IMPORT_RULES.maxBytes) return `File tối đa ${MAX_SIZE_LABEL}`
  return undefined
}

/** Cùng luật với mật khẩu khi đăng ký; `undefined` nếu hợp lệ. */
function passwordError(password: string): string | undefined {
  const result = userFieldRules.password.safeParse(password)
  return result.success ? undefined : result.error.issues[0]?.message
}

interface MemberImportDialogProps {
  open: boolean
  onClose: () => void
  onImported: (result: BusinessMemberImportResult) => void
}

/**
 * Tải file mẫu → điền học viên → chọn file và nhập mật khẩu mặc định. Có dòng sai thì không tạo tài khoản nào
 * và hiện đúng số dòng cần sửa.
 */
export function MemberImportDialog({ open, onClose, onImported }: MemberImportDialogProps) {
  const [file, setFile] = useState<File>()
  const [password, setPassword] = useState('')
  const [fileProblem, setFileProblem] = useState<string>()
  const [passwordProblem, setPasswordProblem] = useState<string>()
  const importMembers = useImportMembers()
  const rowErrors = importMembers.error ? memberImportRowErrors(importMembers.error) : []

  const close = () => {
    setFile(undefined)
    setPassword('')
    setFileProblem(undefined)
    setPasswordProblem(undefined)
    importMembers.reset()
    onClose()
  }

  const submit = () => {
    const nextFileProblem = fileError(file)
    const nextPasswordProblem = passwordError(password)
    setFileProblem(nextFileProblem)
    setPasswordProblem(nextPasswordProblem)
    if (nextFileProblem || nextPasswordProblem || !file) return
    importMembers.mutate(
      { file, defaultPassword: password },
      {
        onSuccess: (result) => {
          onImported(result)
          close()
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      title="Import học viên từ Excel"
      description="Mỗi dòng trong file là một tài khoản học viên của doanh nghiệp."
      busy={importMembers.isPending}
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
            Tải file mẫu, điền mỗi dòng một học viên: họ, tên, số CCCD, ngày sinh, địa chỉ, số điện
            thoại, email. Tối đa {MEMBER_IMPORT_RULES.maxRows} học viên mỗi file.
            <a
              className={buttonClass({ variant: 'outline', size: 'sm' }, styles.templateLink)}
              href={apiFileUrl(MEMBER_IMPORT_TEMPLATE_PATH)}
              download
            >
              <Download size={16} aria-hidden /> Tải file mẫu (.xlsx)
            </a>
          </li>
          <li>
            Không cần tên đăng nhập: <strong>số CCCD chính là tên đăng nhập</strong> của học viên.
            Mỗi số CCCD chỉ tạo được một tài khoản.
          </li>
          <li>
            Chọn file đã điền và đặt mật khẩu mặc định cho cả file. Học viên đăng nhập bằng số CCCD
            và mật khẩu này, rồi tự đổi mật khẩu.
          </li>
        </ol>

        <fieldset className={styles.fieldset} disabled={importMembers.isPending}>
          <legend className="sr-only">File và mật khẩu mặc định</legend>
          <FileField
            label="File học viên"
            required
            accept={ACCEPT}
            icon={FileSpreadsheet}
            hint={`Excel .xlsx hoặc .xls, tối đa ${MAX_SIZE_LABEL}.`}
            value={file}
            error={fileProblem}
            disabled={importMembers.isPending}
            onChange={(next) => {
              setFile(next)
              setFileProblem(next ? fileError(next) : undefined)
              importMembers.reset()
            }}
          />
          <PasswordField
            label="Mật khẩu mặc định"
            required
            autoComplete="new-password"
            hint={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự, có ít nhất 1 ký tự đặc biệt. Dùng chung cho mọi học viên trong file.`}
            value={password}
            error={passwordProblem}
            onChange={(event) => {
              setPassword(event.target.value)
              if (passwordProblem) setPasswordProblem(passwordError(event.target.value))
            }}
          />
        </fieldset>

        {importMembers.isError && (
          <Alert variant="error" title="Chưa import được">
            {memberImportErrorMessage(importMembers.error)}
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
          <Button variant="ghost" disabled={importMembers.isPending} onClick={close}>
            Huỷ
          </Button>
          <Button type="submit" variant="accent" loading={importMembers.isPending}>
            Import
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
