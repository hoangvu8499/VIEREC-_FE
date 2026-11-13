import type { SupportPointListParams } from '@/types/support-point'

/** Thêm / sửa / xoá / import điểm hỗ trợ xong thì invalidate `SUPPORT_POINT_QUERY_KEYS.all`. */
export const SUPPORT_POINT_QUERY_KEYS = {
  all: ['support-points'],
  list: (params: SupportPointListParams) => ['support-points', 'list', params],
} as const

export const SUPPORT_POINT_PAGE_SIZE = 10

/** Giới hạn khớp `SupportPointRequest`, `SupportPointWorkbook` của backend. */
export const SUPPORT_POINT_RULES = {
  nameMax: 255,
  areaMax: 100,
  addressMax: 500,
  importMaxRows: 500,
  importMaxBytes: 5 * 1024 * 1024,
  importExtensions: ['xlsx', 'xls'],
} as const

/** Số điện thoại 3–20 ký tự: chữ số, có thể có dấu + đầu, dấu cách / chấm / gạch giữa (vd. 114). */
export const SUPPORT_POINT_PHONE_REGEX = /^\+?[0-9](?:[0-9 .-]{0,18}[0-9])?$/

/** File Excel mẫu (backend sinh, cần đăng nhập quản trị). */
export const SUPPORT_POINT_TEMPLATE_PATH = '/api/v1/support-points/import-template'
