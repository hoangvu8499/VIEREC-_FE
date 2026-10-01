import { z } from 'zod'

import { USER_STATUSES } from '@/constants/user'
import type {
  ChangePasswordPayload,
  CreateUserPayload,
  RegisterPayload,
  UpdateProfilePayload,
  UpdateUserPayload,
  User,
} from '@/types/user'

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

/** Thông báo lỗi từng field — dùng chung cho validate phía client và dịch lỗi từ backend. */
export const USER_FIELD_MESSAGES = {
  username: { required: 'Vui lòng nhập tên đăng nhập', taken: 'Tên đăng nhập đã được sử dụng' },
  firstName: { required: 'Vui lòng nhập tên' },
  lastName: { required: 'Vui lòng nhập họ' },
  cccd: {
    required: 'Vui lòng nhập số CCCD',
    invalid: `Số CCCD phải gồm đúng ${CCCD_LENGTH} chữ số`,
    taken: 'Số CCCD này đã được đăng ký',
  },
  dateOfBirth: { required: 'Vui lòng chọn ngày sinh', invalid: 'Ngày sinh không hợp lệ' },
  address: { required: 'Vui lòng nhập địa chỉ' },
  phoneNumber: {
    required: 'Vui lòng nhập số điện thoại',
    invalid: `Số điện thoại phải gồm đúng ${PHONE_LENGTH} chữ số`,
    taken: 'Số điện thoại này đã được đăng ký',
  },
  email: {
    required: 'Vui lòng nhập email',
    invalid: 'Email không đúng định dạng',
    taken: 'Email này đã được đăng ký',
  },
  password: {
    required: 'Vui lòng nhập mật khẩu',
    tooShort: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`,
    noSpecialChar: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (vd. ! @ # $ %)',
  },
  roles: { required: 'Chọn ít nhất một vai trò' },
  status: { required: 'Vui lòng chọn trạng thái', invalid: 'Trạng thái không hợp lệ' },
} as const

const M = USER_FIELD_MESSAGES

/** Rule từng field — dùng lại cho form đăng ký và form quản lý học viên ở admin. */
export const userFieldRules = {
  username: requiredText(M.username.required),
  firstName: requiredText(M.firstName.required),
  lastName: requiredText(M.lastName.required),
  cccd: requiredText(M.cccd.required).regex(new RegExp(`^\\d{${CCCD_LENGTH}}$`), M.cccd.invalid),
  dateOfBirth: z
    .string()
    .min(1, M.dateOfBirth.required)
    .refine((value) => value === '' || isValidPastDate(value), M.dateOfBirth.invalid),
  address: requiredText(M.address.required),
  phoneNumber: requiredText(M.phoneNumber.required).regex(
    new RegExp(`^\\d{${PHONE_LENGTH}}$`),
    M.phoneNumber.invalid,
  ),
  email: requiredText(M.email.required).pipe(z.email(M.email.invalid)),
  // Không trim mật khẩu: khoảng trắng là một phần của mật khẩu.
  password: z
    .string()
    .min(1, M.password.required)
    .min(PASSWORD_MIN_LENGTH, M.password.tooShort)
    .regex(SPECIAL_CHAR_REGEX, M.password.noSpecialChar),
}

export const confirmPasswordRule = z.string().min(1, 'Vui lòng nhập lại mật khẩu')

/**
 * Tham số `.refine()` so khớp `password` với `confirmPassword` — dùng cho mọi form đặt mật khẩu.
 * Vd: `z.object({ password, confirmPassword }).refine(...passwordConfirmation)`.
 */
export const passwordConfirmation = [
  (values: { password: string; confirmPassword: string }) =>
    values.password === values.confirmPassword,
  {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'] as PropertyKey[],
    // Vẫn so khớp khi các field khác còn lỗi (mặc định zod bỏ qua refine nếu object có lỗi).
    when: ({ value }: { value: unknown }) => {
      const { password, confirmPassword } = (value ?? {}) as Record<string, unknown>
      return (
        typeof password === 'string' && typeof confirmPassword === 'string' && !!confirmPassword
      )
    },
  },
] as const

export const registerSchema = z
  .object({
    ...userFieldRules,
    confirmPassword: confirmPasswordRule,
  })
  .refine(...passwordConfirmation)

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

/** Bỏ `confirmPassword` — backend nhận đúng tên field của form (camelCase). */
export function toRegisterPayload({
  confirmPassword: _confirmPassword,
  ...payload
}: RegisterFormValues): RegisterPayload {
  return payload
}

// ---------- Quản trị: tạo / sửa tài khoản ----------

const rolesRule = z.array(z.string()).min(1, M.roles.required)
const statusRule = z.enum(USER_STATUSES, M.status.required)

/** Tạo tài khoản ở trang quản trị: như đăng ký + vai trò + trạng thái. */
export const createUserSchema = z
  .object({
    ...userFieldRules,
    confirmPassword: confirmPasswordRule,
    roles: rolesRule,
    status: statusRule,
  })
  .refine(...passwordConfirmation)

export type CreateUserFormInput = z.input<typeof createUserSchema>
export type CreateUserFormValues = z.output<typeof createUserSchema>

export const CREATE_USER_DEFAULT_VALUES: CreateUserFormInput = {
  ...REGISTER_DEFAULT_VALUES,
  roles: ['TRAINEE'],
  status: 'ACTIVE',
}

export function toCreateUserPayload({
  confirmPassword: _confirmPassword,
  ...payload
}: CreateUserFormValues): CreateUserPayload {
  return payload
}

/** Sửa tài khoản: không đổi username / mật khẩu (backend không cho), vai trò đổi riêng. */
export const updateUserSchema = z.object({
  firstName: userFieldRules.firstName,
  lastName: userFieldRules.lastName,
  cccd: userFieldRules.cccd,
  dateOfBirth: userFieldRules.dateOfBirth,
  address: userFieldRules.address,
  phoneNumber: userFieldRules.phoneNumber,
  email: userFieldRules.email,
  status: statusRule,
})

export type UpdateUserFormInput = z.input<typeof updateUserSchema>
export type UpdateUserFormValues = z.output<typeof updateUserSchema>

export function updateUserFormValues(user: User): UpdateUserFormInput {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    cccd: user.cccd,
    dateOfBirth: user.dateOfBirth,
    address: user.address,
    phoneNumber: user.phoneNumber,
    email: user.email,
    status: user.status,
  }
}

/** Gửi đủ các field (backend bỏ qua field không đổi). */
export function toUpdateUserPayload(values: UpdateUserFormValues): UpdateUserPayload {
  return values
}

// ---------- Học viên: tự sửa hồ sơ / đổi mật khẩu ----------

/** Như sửa tài khoản ở admin nhưng không có trạng thái. */
export const updateProfileSchema = updateUserSchema.omit({ status: true })

export type UpdateProfileFormInput = z.input<typeof updateProfileSchema>
export type UpdateProfileFormValues = z.output<typeof updateProfileSchema>

export function updateProfileFormValues(user: User): UpdateProfileFormInput {
  const { status: _status, ...values } = updateUserFormValues(user)
  return values
}

/** Họ tên, ngày sinh, CCCD in trên chứng chỉ — bị khoá khi đã có chứng chỉ. */
export const IDENTITY_FIELDS = ['lastName', 'firstName', 'dateOfBirth', 'cccd'] as const

/** Đã khoá định danh thì không gửi các field đó (backend chỉ báo lỗi khi giá trị đổi). */
export function toUpdateProfilePayload(
  values: UpdateProfileFormValues,
  identityLocked: boolean,
): UpdateProfilePayload {
  if (!identityLocked) return values
  const { lastName: _l, firstName: _f, dateOfBirth: _d, cccd: _c, ...contact } = values
  return contact
}

export const CHANGE_PASSWORD_MESSAGES = {
  currentRequired: 'Vui lòng nhập mật khẩu hiện tại',
  currentWrong: 'Mật khẩu hiện tại không đúng',
  sameAsCurrent: 'Mật khẩu mới phải khác mật khẩu hiện tại',
} as const

type PasswordValues = { currentPassword: string; newPassword: string; confirmPassword: string }

/** Chỉ so khớp khi cả hai ô đã có giá trị (zod bỏ qua refine cấp object nếu còn lỗi field). */
function bothFilled(a: keyof PasswordValues, b: keyof PasswordValues) {
  return ({ value }: { value: unknown }) => {
    const values = (value ?? {}) as Partial<Record<keyof PasswordValues, unknown>>
    return (
      typeof values[a] === 'string' && typeof values[b] === 'string' && !!values[a] && !!values[b]
    )
  }
}

/** Tên field khớp backend (`currentPassword`, `newPassword`). Mật khẩu không trim. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, CHANGE_PASSWORD_MESSAGES.currentRequired),
    newPassword: userFieldRules.password,
    confirmPassword: confirmPasswordRule,
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
    when: bothFilled('newPassword', 'confirmPassword'),
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: CHANGE_PASSWORD_MESSAGES.sameAsCurrent,
    path: ['newPassword'],
    when: bothFilled('currentPassword', 'newPassword'),
  })

export type ChangePasswordFormValues = z.output<typeof changePasswordSchema>

export const CHANGE_PASSWORD_DEFAULT_VALUES: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export function toChangePasswordPayload({
  confirmPassword: _confirmPassword,
  ...payload
}: ChangePasswordFormValues): ChangePasswordPayload {
  return payload
}
