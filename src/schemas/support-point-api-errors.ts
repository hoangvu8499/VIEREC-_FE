import { fieldErrors } from '@/schemas/course-api-errors'
import {
  SUPPORT_POINT_FIELD_MESSAGES,
  type SupportPointField,
} from '@/schemas/support-point-schema'
import type { ApiError } from '@/types/api'
import type { SupportPointImportRowError } from '@/types/support-point'

/** Lỗi thêm / sửa điểm hỗ trợ → lỗi theo field của form. */
export function supportPointApiFieldErrors(
  error: ApiError,
): Partial<Record<SupportPointField, string>> {
  return fieldErrors<SupportPointField>(error, SUPPORT_POINT_FIELD_MESSAGES)
}

/** Tên cột trong file Excel mẫu, theo field backend báo về. */
const COLUMN_LABELS: Record<string, string> = {
  name: 'Tên đơn vị',
  province: 'Tỉnh / Thành phố',
  district: 'Quận / Huyện',
  address: 'Địa chỉ chi tiết',
  phoneNumber: 'Số điện thoại',
  latitude: 'Vĩ độ',
  longitude: 'Kinh độ',
}

const ROW_FIELD = /^rows\[(\d+)\]\.(\w+)$/

/** Lý do một ô sai, viết theo tên cột để người quản trị tìm đúng ô trong file. */
function cellProblem(field: string, rejected: unknown, message: string): string {
  const label = COLUMN_LABELS[field] ?? field
  const value = typeof rejected === 'string' || typeof rejected === 'number' ? String(rejected) : ''
  if (value === '' || /\bis required\b/i.test(message)) return `${label} đang để trống`
  if (/must be a number/i.test(message))
    return `${label} “${value}” không phải là số (vd. 15.994224)`
  if (field === 'latitude') return `${label} “${value}” phải từ -90 đến 90`
  if (field === 'longitude') return `${label} “${value}” phải từ -180 đến 180`
  if (/must be at most/i.test(message)) return `${label} quá dài`
  if (field === 'phoneNumber') return `${label} “${value}” không hợp lệ (3–20 chữ số, vd. 114)`
  return `${label} “${value}” không hợp lệ`
}

/**
 * 400 `SUPPORT_POINT_IMPORT_INVALID_ROWS` → mỗi dòng Excel sai một mục (theo thứ tự dòng),
 * gộp các ô sai của cùng dòng.
 */
export function supportPointImportRowErrors(error: ApiError): SupportPointImportRowError[] {
  const problems = new Map<number, string[]>()
  for (const { field, rejectedValue, message } of error.fieldErrors ?? []) {
    const match = ROW_FIELD.exec(field)
    if (!match?.[1] || !match[2]) continue
    const row = Number(match[1])
    problems.set(row, [...(problems.get(row) ?? []), cellProblem(match[2], rejectedValue, message)])
  }
  return [...problems.entries()]
    .sort(([a], [b]) => a - b)
    .map(([row, messages]) => ({ row, message: messages.join('; ') }))
}
