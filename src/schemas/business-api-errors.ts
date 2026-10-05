import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { BUSINESS_FIELD_MESSAGES } from '@/schemas/business-schema'
import { userApiFieldErrors } from '@/schemas/user-api-errors'
import type { ApiError } from '@/types/api'

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
