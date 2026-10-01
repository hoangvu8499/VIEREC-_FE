import { z } from 'zod'

import { confirmPasswordRule, passwordConfirmation, userFieldRules } from '@/schemas/user-schema'

/**
 * Đăng nhập chỉ kiểm tra bắt buộc — không áp rule độ mạnh mật khẩu
 * (để không chặn tài khoản cũ, backend mới là nơi xác thực).
 */
export const loginSchema = z.object({
  /** Backend nhận username hoặc email. */
  username: z.string().trim().min(1, 'Vui lòng nhập tên đăng nhập hoặc email'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

export type LoginFormInput = z.input<typeof loginSchema>
export type LoginFormValues = z.output<typeof loginSchema>

export const LOGIN_DEFAULT_VALUES: LoginFormInput = { username: '', password: '' }

export const forgotPasswordSchema = z.object({
  email: userFieldRules.email,
})

export type ForgotPasswordFormInput = z.input<typeof forgotPasswordSchema>
export type ForgotPasswordFormValues = z.output<typeof forgotPasswordSchema>

export const FORGOT_PASSWORD_DEFAULT_VALUES: ForgotPasswordFormInput = { email: '' }

/** Mật khẩu mới dùng cùng rule với lúc đăng ký. */
export const resetPasswordSchema = z
  .object({
    password: userFieldRules.password,
    confirmPassword: confirmPasswordRule,
  })
  .refine(...passwordConfirmation)

export type ResetPasswordFormInput = z.input<typeof resetPasswordSchema>
export type ResetPasswordFormValues = z.output<typeof resetPasswordSchema>

export const RESET_PASSWORD_DEFAULT_VALUES: ResetPasswordFormInput = {
  password: '',
  confirmPassword: '',
}
