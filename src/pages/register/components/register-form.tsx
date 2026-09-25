import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, LoaderCircle, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { PasswordField } from '@/components/form/password-field'
import { TextField } from '@/components/form/text-field'
import { ROUTES } from '@/constants/routes'
import { registerErrorMessage, useRegister } from '@/pages/register/use-register'
import {
  CCCD_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_LENGTH,
  REGISTER_DEFAULT_VALUES,
  registerSchema,
  toRegisterPayload,
  type RegisterFormInput,
  type RegisterFormValues,
} from '@/schemas/user-schema'
import type { User } from '@/types/user'

import styles from './register-form.module.css'

interface RegisterFormProps {
  onSuccess: (user: User) => void
}

function todayIso(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: REGISTER_DEFAULT_VALUES,
  })
  const registerMutation = useRegister()

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate(toRegisterPayload(values), { onSuccess })
  })

  const isSubmitting = registerMutation.isPending

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {registerMutation.isError && (
        <Alert variant="error" title="Đăng ký không thành công">
          {registerErrorMessage(registerMutation.error)}
        </Alert>
      )}

      <p className={styles.requiredNote}>
        Các trường có dấu <span>*</span> là bắt buộc.
      </p>

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className={styles.legend}>
          <UserRound size={18} aria-hidden /> Thông tin cá nhân
        </legend>
        <TextField
          label="Họ và tên đệm"
          required
          autoComplete="family-name"
          placeholder="Nguyễn Văn"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
        <TextField
          label="Tên"
          required
          autoComplete="given-name"
          placeholder="An"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <TextField
          label="Ngày sinh"
          type="date"
          required
          autoComplete="bday"
          max={todayIso()}
          error={errors.dateOfBirth?.message}
          {...register('dateOfBirth')}
        />
        <TextField
          label="Số CCCD"
          required
          inputMode="numeric"
          maxLength={CCCD_LENGTH}
          placeholder={`${CCCD_LENGTH} chữ số`}
          hint="Dùng để định danh chứng chỉ của bạn"
          error={errors.cccd?.message}
          {...register('cccd')}
        />
        <TextField
          label="Số điện thoại"
          type="tel"
          required
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={PHONE_LENGTH}
          placeholder="0912345678"
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />
        <TextField
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="email@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Địa chỉ"
          required
          autoComplete="street-address"
          placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố"
          fieldClassName={styles.full}
          error={errors.address?.message}
          {...register('address')}
        />
      </fieldset>

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className={styles.legend}>
          <KeyRound size={18} aria-hidden /> Thông tin tài khoản
        </legend>
        <TextField
          label="Tên đăng nhập"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          fieldClassName={styles.full}
          error={errors.username?.message}
          {...register('username')}
        />
        <PasswordField
          label="Mật khẩu"
          required
          autoComplete="new-password"
          hint={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự, có ít nhất 1 ký tự đặc biệt`}
          error={errors.password?.message}
          {...register('password', {
            // Đổi mật khẩu thì kiểm tra lại ô nhập lại (nếu đã nhập).
            onChange: () => {
              if (getValues('confirmPassword')) void trigger('confirmPassword')
            },
          })}
        />
        <PasswordField
          label="Nhập lại mật khẩu"
          required
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </fieldset>

      <div className={styles.footer}>
        <Button type="submit" variant="accent" size="lg" block disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className={styles.spinner} size={20} aria-hidden />}
          {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </Button>
        <p className={styles.loginLink}>
          Đã có tài khoản? <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
        </p>
      </div>
    </form>
  )
}
