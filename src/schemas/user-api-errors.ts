import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { USER_FIELD_MESSAGES } from '@/schemas/user-schema'
import type { ApiError, ApiFieldError } from '@/types/api'

export type UserField = keyof typeof USER_FIELD_MESSAGES
/** Field của form đăng ký (không có vai trò / trạng thái). */
export type RegisterField = Exclude<UserField, 'roles' | 'status'>

const M = USER_FIELD_MESSAGES

/** 409 — mỗi loại trùng có mã riêng. */
const CONFLICTS: Partial<Record<string, [UserField, string]>> = {
  [API_ERROR_CODES.USERNAME_TAKEN]: ['username', M.username.taken],
  [API_ERROR_CODES.EMAIL_TAKEN]: ['email', M.email.taken],
  [API_ERROR_CODES.PHONE_TAKEN]: ['phoneNumber', M.phoneNumber.taken],
  [API_ERROR_CODES.CCCD_TAKEN]: ['cccd', M.cccd.taken],
}

/** Message tiếng Anh backend đã biết (400 Validation failed) → tiếng Việt. */
const KNOWN_MESSAGES: Partial<Record<string, string>> = {
  'Phone number must be exactly 10 digits': M.phoneNumber.invalid,
  'Email format is invalid (expected name@domain.com)': M.email.invalid,
  'CCCD must be exactly 12 digits': M.cccd.invalid,
  'Password must contain at least one special character': M.password.noSpecialChar,
  'Date of birth must be in the past': M.dateOfBirth.invalid,
}

function isUserField(field: string): field is UserField {
  return Object.hasOwn(USER_FIELD_MESSAGES, field)
}

function translate({ field, message }: ApiFieldError & { field: UserField }): string {
  if (/\bis required$/i.test(message)) return M[field].required
  // Enum sai (vd. status): "Invalid value. Allowed: [...]".
  if (field === 'status' && /^Invalid value/i.test(message)) return M.status.invalid
  // Message lạ: giữ nguyên của backend còn hơn đoán sai.
  return KNOWN_MESSAGES[message] ?? message
}

/**
 * Lỗi backend → lỗi tiếng Việt theo field của form user (để `setError` hiện dưới đúng ô).
 * Trả object rỗng nếu lỗi không gắn với field nào.
 */
export function userApiFieldErrors(error: ApiError): Partial<Record<UserField, string>> {
  const conflict = error.code ? CONFLICTS[error.code] : undefined
  if (conflict) {
    const [field, message] = conflict
    return { [field]: message }
  }

  const result: Partial<Record<UserField, string>> = {}
  for (const fieldError of error.fieldErrors ?? []) {
    const { field } = fieldError
    // Một field có thể có nhiều lỗi — giữ lỗi đầu tiên như validate phía client.
    if (isUserField(field) && !result[field]) {
      result[field] = translate({ ...fieldError, field })
    }
  }
  return result
}
