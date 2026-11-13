import { z } from 'zod'

import { SUPPORT_POINT_PHONE_REGEX, SUPPORT_POINT_RULES } from '@/constants/support-point'
import type { SupportPointDetail, SupportPointPayload } from '@/types/support-point'

const R = SUPPORT_POINT_RULES

/** Thông báo lỗi từng field — dùng chung cho validate phía client và dịch lỗi từ backend. */
export const SUPPORT_POINT_FIELD_MESSAGES = {
  name: {
    required: 'Vui lòng nhập tên đơn vị',
    tooLong: `Tên đơn vị tối đa ${R.nameMax} ký tự`,
  },
  province: {
    required: 'Vui lòng nhập tỉnh / thành phố',
    tooLong: `Tỉnh / thành phố tối đa ${R.areaMax} ký tự`,
  },
  district: {
    required: 'Vui lòng nhập quận / huyện',
    tooLong: `Quận / huyện tối đa ${R.areaMax} ký tự`,
  },
  address: {
    required: 'Vui lòng nhập địa chỉ',
    tooLong: `Địa chỉ tối đa ${R.addressMax} ký tự`,
  },
  phoneNumber: {
    required: 'Vui lòng nhập số điện thoại',
    invalid: 'Số điện thoại gồm 3–20 chữ số, có thể có dấu cách, dấu chấm, gạch ngang (vd. 114)',
  },
  latitude: {
    required: 'Nhập cả vĩ độ và kinh độ, hoặc bỏ trống cả hai',
    invalid: 'Vĩ độ là số từ -90 đến 90 (vd. 15.994224)',
  },
  longitude: {
    required: 'Nhập cả vĩ độ và kinh độ, hoặc bỏ trống cả hai',
    invalid: 'Kinh độ là số từ -180 đến 180 (vd. 108.237739)',
  },
} as const

export type SupportPointField = keyof typeof SUPPORT_POINT_FIELD_MESSAGES

const M = SUPPORT_POINT_FIELD_MESSAGES

function requiredText(messages: { required: string; tooLong: string }, max: number) {
  return z.string().trim().min(1, messages.required).max(max, messages.tooLong)
}

/** Ô toạ độ: rỗng → `null`; nhận cả "15,99" và "15.99". */
function coordinate(message: string, limit: number) {
  return z
    .string()
    .trim()
    .transform((value) => value.replace(',', '.'))
    .pipe(z.union([z.literal(''), z.string().regex(/^-?\d{1,3}(\.\d+)?$/, message)]))
    .transform((value) => (value === '' ? null : Number(value)))
    .pipe(z.number().min(-limit, message).max(limit, message).nullable())
}

export const supportPointSchema = z
  .object({
    name: requiredText(M.name, R.nameMax),
    province: requiredText(M.province, R.areaMax),
    district: requiredText(M.district, R.areaMax),
    address: z.string().trim().max(R.addressMax, M.address.tooLong),
    phoneNumber: z
      .string()
      .trim()
      .min(1, { error: M.phoneNumber.required, abort: true })
      .regex(SUPPORT_POINT_PHONE_REGEX, M.phoneNumber.invalid),
    latitude: coordinate(M.latitude.invalid, 90),
    longitude: coordinate(M.longitude.invalid, 180),
  })
  .superRefine((values, context) => {
    // Chỉ một toạ độ: báo ở ô còn trống.
    if (values.latitude === null && values.longitude !== null) {
      context.addIssue({ code: 'custom', path: ['latitude'], message: M.latitude.required })
    }
    if (values.longitude === null && values.latitude !== null) {
      context.addIssue({ code: 'custom', path: ['longitude'], message: M.longitude.required })
    }
  })

export type SupportPointFormInput = z.input<typeof supportPointSchema>
export type SupportPointFormValues = z.output<typeof supportPointSchema>

/** Thêm mới: để trống. Sửa: lấy từ điểm đang sửa (toạ độ hiện dấu chấm). */
export function supportPointFormValues(point?: SupportPointDetail): SupportPointFormInput {
  return {
    name: point?.name ?? '',
    province: point?.province ?? '',
    district: point?.district ?? '',
    address: point?.address ?? '',
    phoneNumber: point?.phoneNumber ?? '',
    latitude: point ? String(point.latitude) : '',
    longitude: point ? String(point.longitude) : '',
  }
}

export function toSupportPointPayload(values: SupportPointFormValues): SupportPointPayload {
  return { ...values, address: values.address || null }
}
