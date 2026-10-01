import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { PasswordField } from '@/components/form/password-field'
import { TextField } from '@/components/form/text-field'
import { ROUTES } from '@/constants/routes'
import { loginErrorMessage, useLogin } from '@/pages/login/use-login'
import {
  LOGIN_DEFAULT_VALUES,
  loginSchema,
  type LoginFormInput,
  type LoginFormValues,
} from '@/schemas/auth-schema'
import type { AuthSession } from '@/types/user'

import styles from './login-form.module.css'

interface LoginFormProps {
  onSuccess: (session: AuthSession) => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput, unknown, LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: LOGIN_DEFAULT_VALUES,
  })
  const loginMutation = useLogin()

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values, { onSuccess })
  })

  const isSubmitting = loginMutation.isPending

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {loginMutation.isError && (
        <Alert variant="error" title="Đăng nhập không thành công">
          {loginErrorMessage(loginMutation.error)}
        </Alert>
      )}

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className="sr-only">Thông tin đăng nhập</legend>
        <TextField
          label="Tên đăng nhập hoặc email"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          error={errors.username?.message}
          {...register('username')}
        />
        <PasswordField
          label="Mật khẩu"
          required
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Link to={ROUTES.FORGOT_PASSWORD} className={styles.forgot}>
          Quên mật khẩu?
        </Link>
      </fieldset>

      <Button type="submit" variant="accent" size="lg" block loading={isSubmitting}>
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  )
}
