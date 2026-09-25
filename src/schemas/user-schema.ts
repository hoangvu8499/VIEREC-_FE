import { z } from 'zod'

import type { RegisterPayload } from '@/types/user'

export const PASSWORD_MIN_LENGTH = 8
export const CCCD_LENGTH = 12
export const PHONE_LENGTH = 10

/** Ký tự đặc biệt: bất kỳ ký tự nào không phải chữ, số hay khoảng trắng. */
const SPECIAL_CHAR_REGEX = /[^\p{L}\p{N}\s]/u

function requiredText(message: string) {
  return z.string().trim().min(1, message)
}

/** `YYYY-MM-DD` hợp lệ và không ở tương lai. */
function isValidPastDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(year, month - 1, day)
  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  return isRealDate && date <= new Date()
}

/** Rule từng field — dùng lại cho form đăng ký và form quản lý học viên ở admin. */
export const userFieldRules = {
  username: requiredText('Vui lòng nhập tên đăng nhập'),
  firstName: requiredText('Vui lòng nhập tên'),
  lastName: requiredText('Vui lòng nhập họ'),
  cccd: requiredText('Vui lòng nhập số CCCD').regex(
    new RegExp(`^\\d{${CCCD_LENGTH}}$`),
    `Số CCCD phải gồm đúng ${CCCD_LENGTH} chữ số`,
  ),
  dateOfBirth: z
    .string()
    .min(1, 'Vui lòng chọn ngày sinh')
    .refine((value) => value === '' || isValidPastDate(value), 'Ngày sinh không hợp lệ'),
  address: requiredText('Vui lòng nhập địa chỉ'),
  phoneNumber: requiredText('Vui lòng nhập số điện thoại').regex(
    new RegExp(`^\\d{${PHONE_LENGTH}}$`),
    `Số điện thoại phải gồm đúng ${PHONE_LENGTH} chữ số`,
  ),
  email: requiredText('Vui lòng nhập email').pipe(z.email('Email không đúng định dạng')),
  // Không trim mật khẩu: khoảng trắng là một phần của mật khẩu.
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(PASSWORD_MIN_LENGTH, `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`)
    .regex(SPECIAL_CHAR_REGEX, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (vd. ! @ # $ %)'),
}

export const registerSchema = z
  .object({
    ...userFieldRules,
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
    // Vẫn so khớp khi các field khác còn lỗi (mặc định zod bỏ qua refine nếu object có lỗi).
    when: ({ value }) => {
      const { password, confirmPassword } = (value ?? {}) as Record<string, unknown>
      return (
        typeof password === 'string' && typeof confirmPassword === 'string' && !!confirmPassword
      )
    },
  })

/** Giá trị form (trước khi parse). */
export type RegisterFormInput = z.input<typeof registerSchema>
/** Giá trị sau khi parse (đã trim). */
export type RegisterFormValues = z.output<typeof registerSchema>

export const REGISTER_DEFAULT_VALUES: RegisterFormInput = {
  username: '',
  firstName: '',
  lastName: '',
  cccd: '',
  dateOfBirth: '',
  address: '',
  phoneNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function toRegisterPayload(values: RegisterFormValues): RegisterPayload {
  return {
    username: values.username,
    password: values.password,
    first_name: values.firstName,
    last_name: values.lastName,
    cccd: values.cccd,
    date_of_birth: values.dateOfBirth,
    address: values.address,
    phone_number: values.phoneNumber,
    email: values.email,
  }
}
