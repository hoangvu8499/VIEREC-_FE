import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { BUSINESS_FIELD_MESSAGES } from '@/schemas/business-schema'
import { userApiFieldErrors } from '@/schemas/user-api-errors'
import type { ApiError } from '@/types/api'
import type { MemberImportRowError } from '@/types/business'

const B = BUSINESS_FIELD_MESSAGES

/** Field của doanh nghiệp (`name`...) và của tài khoản quản lý, viết theo path form: `manager.username`. */
export type BusinessFormPath = keyof typeof BUSINESS_FIELD_MESSAGES | `manager.${string}`

/**
 * Lỗi backend của form doanh nghiệp → tiếng Việt theo path của form.
 * `managerPrefix`: form tạo doanh nghiệp lồng tài khoản quản lý trong `manager.`; form thêm quản lý thì không.
 * Trùng username / email / SĐT (409) luôn là của tài khoản quản lý: doanh nghiệp không có ràng buộc này.
 */
export function businessApiFieldErrors(
  error: ApiError,
  managerPrefix: '' | 'manager.' = 'manager.',
): Partial<Record<string, string>> {
  if (error.code === API_ERROR_CODES.TAX_CODE_ALREADY_EXISTS) {
    return { taxCode: B.taxCode.taken }
  }
  const result: Partial<Record<string, string>> = {}

  // Lỗi của tài khoản quản lý: field `manager.x` (tạo doanh nghiệp) hoặc `x` (thêm quản lý), và 409 trùng.
  const managerErrors = (error.fieldErrors ?? [])
    .filter((fieldError) => managerPrefix === '' || fieldError.field.startsWith('manager.'))
    .map((fieldError) => ({ ...fieldError, field: fieldError.field.replace(/^manager\./, '') }))
  const translatedManager = userApiFieldErrors({ ...error, fieldErrors: managerErrors })
  for (const [field, message] of Object.entries(translatedManager)) {
    result[`${managerPrefix}${field}`] = message
  }
  if (managerPrefix === '') return result

  // Field của doanh nghiệp.
  for (const { field, message } of error.fieldErrors ?? []) {
    if (field.startsWith('manager.') || result[field]) continue
    if (field === 'name') {
      result.name = /size|at most/i.test(message) ? B.name.tooLong : B.name.required
    } else if (field === 'taxCode') {
      result.taxCode = /required/i.test(message) ? B.taxCode.required : B.taxCode.invalid
    } else if (field === 'address' || field === 'phoneNumber' || field === 'email') {
      const translated = userApiFieldErrors({
        status: 400,
        message: '',
        fieldErrors: [{ field, message }],
      })
      result[field] = translated[field] ?? message
    }
  }
  return result
}

/** Tên cột trong file Excel mẫu, theo field backend báo về. Không có cột tên đăng nhập: số CCCD là tên đăng nhập. */
const MEMBER_COLUMN_LABELS: Record<string, string> = {
  lastName: 'Họ',
  firstName: 'Tên',
  cccd: 'Số CCCD',
  dateOfBirth: 'Ngày sinh',
  address: 'Địa chỉ',
  phoneNumber: 'Số điện thoại',
  email: 'Email',
}

const ROW_FIELD = /^rows\[(\d+)\]\.(\w+)$/
const DUPLICATE_IN_FILE = /Already used on row (\d+)/i

/** Lý do một ô sai, viết theo tên cột để người quản lý tìm đúng ô trong file. */
function memberCellProblem(field: string, rejected: unknown, message: string): string {
  const label = MEMBER_COLUMN_LABELS[field] ?? field
  const value = typeof rejected === 'string' ? rejected : ''
  const duplicate = DUPLICATE_IN_FILE.exec(message)
  if (duplicate) return `${label} “${value}” trùng với dòng ${duplicate[1]} trong file`
  if (/as its username/i.test(message)) {
    return `${label} “${value}” đã được dùng làm tên đăng nhập của một tài khoản khác`
  }
  if (/already uses this value/i.test(message)) {
    return `${label} “${value}” đã có tài khoản sử dụng`
  }
  if (value === '') return `${label} đang để trống`
  if (field === 'dateOfBirth' && /must look like/i.test(message)) {
    return `${label} “${value}” không đúng dạng ngày/tháng/năm (ví dụ 08/04/1999)`
  }
  // Luật giống form đăng ký: dùng lại bản dịch của form user nếu có.
  const translated = userApiFieldErrors({
    status: 400,
    message: '',
    fieldErrors: [{ field, message }],
  })[field as keyof ReturnType<typeof userApiFieldErrors>]
  if (translated && translated !== message)
    return `${label} “${value}”: ${translated.toLowerCase()}`
  return `${label} “${value}” không hợp lệ`
}

/**
 * 400 `MEMBER_IMPORT_INVALID_ROWS` → mỗi dòng Excel sai một mục (theo thứ tự dòng),
 * gộp các ô sai của cùng dòng.
 */
export function memberImportRowErrors(error: ApiError): MemberImportRowError[] {
  const problems = new Map<number, string[]>()
  for (const { field, rejectedValue, message } of error.fieldErrors ?? []) {
    const match = ROW_FIELD.exec(field)
    if (!match?.[1] || !match[2]) continue
    const row = Number(match[1])
    problems.set(row, [
      ...(problems.get(row) ?? []),
      memberCellProblem(match[2], rejectedValue, message),
    ])
  }
  return [...problems.entries()]
    .sort(([a], [b]) => a - b)
    .map(([row, messages]) => ({ row, message: messages.join('; ') }))
}
