import { z } from 'zod'

import { BUSINESS_STATUSES } from '@/constants/business'
import {
  confirmPasswordRule,
  passwordConfirmation,
  PHONE_LENGTH,
  userFieldRules,
} from '@/schemas/user-schema'
import type { Business, BusinessManagerPayload, BusinessPayload } from '@/types/business'

export const BUSINESS_NAME_MAX = 200

/** 10 số, hoặc 10 số-3 số (chi nhánh) — khớp `BusinessRequest.TAX_CODE_REGEX`. */
const TAX_CODE_REGEX = /^\d{10}(-\d{3})?$/

/** Thông báo lỗi từng field — dùng chung cho validate phía client và dịch lỗi từ backend. */
export const BUSINESS_FIELD_MESSAGES = {
  name: {
    required: 'Vui lòng nhập tên doanh nghiệp',
    tooLong: `Tên doanh nghiệp tối đa ${BUSINESS_NAME_MAX} ký tự`,
  },
  taxCode: {
    required: 'Vui lòng nhập mã số thuế',
    invalid: 'Mã số thuế gồm 10 chữ số, hoặc 10 số-3 số với chi nhánh (vd. 0101234567-001)',
    taken: 'Mã số thuế này đã có doanh nghiệp khác dùng',
  },
  address: { required: 'Vui lòng nhập địa chỉ' },
  phoneNumber: {
    required: 'Vui lòng nhập số điện thoại liên hệ',
    invalid: `Số điện thoại phải gồm đúng ${PHONE_LENGTH} chữ số`,
  },
  email: { required: 'Vui lòng nhập email liên hệ', invalid: 'Email không đúng định dạng' },
  status: { required: 'Vui lòng chọn trạng thái' },
} as const

const B = BUSINESS_FIELD_MESSAGES

const requiredText = (message: string) => z.string().trim().min(1, message)

export const businessSchema = z.object({
  name: requiredText(B.name.required).max(BUSINESS_NAME_MAX, B.name.tooLong),
  taxCode: requiredText(B.taxCode.required).regex(TAX_CODE_REGEX, B.taxCode.invalid),
  address: requiredText(B.address.required),
  phoneNumber: requiredText(B.phoneNumber.required).regex(
    new RegExp(`^\\d{${PHONE_LENGTH}}$`),
    B.phoneNumber.invalid,
  ),
  email: requiredText(B.email.required).pipe(z.email(B.email.invalid)),
  status: z.enum(BUSINESS_STATUSES, B.status.required),
})

export type BusinessFormInput = z.input<typeof businessSchema>
export type BusinessFormValues = z.output<typeof businessSchema>

/** Tài khoản quản lý: không có CCCD, ngày sinh, địa chỉ (khác học viên). */
export const managerSchema = z
  .object({
    lastName: userFieldRules.lastName,
    firstName: userFieldRules.firstName,
    phoneNumber: userFieldRules.phoneNumber,
    email: userFieldRules.email,
    username: userFieldRules.username,
    password: userFieldRules.password,
    confirmPassword: confirmPasswordRule,
  })
  .refine(...passwordConfirmation)

export type ManagerFormInput = z.input<typeof managerSchema>
export type ManagerFormValues = z.output<typeof managerSchema>

export const MANAGER_DEFAULT_VALUES: ManagerFormInput = {
  lastName: '',
  firstName: '',
  phoneNumber: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
}

export const createBusinessSchema = businessSchema.extend({ manager: managerSchema })

export type CreateBusinessFormInput = z.input<typeof createBusinessSchema>
export type CreateBusinessFormValues = z.output<typeof createBusinessSchema>

export function businessFormValues(business?: Business): BusinessFormInput {
  return {
    name: business?.name ?? '',
    taxCode: business?.taxCode ?? '',
    address: business?.address ?? '',
    phoneNumber: business?.phoneNumber ?? '',
    email: business?.email ?? '',
    status: business?.status ?? 'ACTIVE',
  }
}

export function toManagerPayload({
  confirmPassword: _confirmPassword,
  ...manager
}: ManagerFormValues): BusinessManagerPayload {
  return manager
}

export function toBusinessPayload(values: BusinessFormValues): BusinessPayload {
  return values
}
