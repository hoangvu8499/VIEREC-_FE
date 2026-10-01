import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { PasswordField } from '@/components/form/password-field'
import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AuthShell } from '@/layouts/user/auth-shell'
import {
  isInvalidTokenError,
  resetPasswordErrorMessage,
  useResetPassword,
} from '@/pages/reset-password/use-reset-password'
import {
  RESET_PASSWORD_DEFAULT_VALUES,
  resetPasswordSchema,
  type ResetPasswordFormInput,
  type ResetPasswordFormValues,
} from '@/schemas/auth-schema'
import { PASSWORD_MIN_LENGTH } from '@/schemas/user-schema'

import styles from './reset-password-page.module.css'

export default function ResetPasswordPage() {
  useDocumentTitle('Đặt lại mật khẩu')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<ResetPasswordFormInput, unknown, ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: RESET_PASSWORD_DEFAULT_VALUES,
  })
  const resetMutation = useResetPassword()
  const isSubmitting = resetMutation.isPending

  const onSubmit = handleSubmit(({ password }) => resetMutation.mutate({ token, password }))

  const requestNewLink = (
    <ButtonLink to={ROUTES.FORGOT_PASSWORD} variant="accent" size="lg" block>
      Yêu cầu liên kết mới
    </ButtonLink>
  )

  function renderContent() {
    if (!token) {
      return (
        <div className={styles.stack}>
          <Alert variant="error" title="Liên kết không hợp lệ">
            Liên kết đặt lại mật khẩu bị thiếu hoặc sai. Vui lòng mở lại liên kết trong email, hoặc
            yêu cầu gửi liên kết mới.
          </Alert>
          {requestNewLink}
        </div>
      )
    }

    if (resetMutation.isSuccess) {
      return (
        <div className={styles.stack}>
          <Alert variant="success" title="Đặt lại mật khẩu thành công!">
            Bạn có thể đăng nhập bằng mật khẩu mới.
          </Alert>
          <ButtonLink to={ROUTES.LOGIN} variant="accent" size="lg" block>
            Đăng nhập ngay
          </ButtonLink>
        </div>
      )
    }

    return (
      <form className={styles.stack} onSubmit={onSubmit} noValidate>
        {resetMutation.isError && (
          <Alert variant="error" title="Không đặt lại được mật khẩu">
            {resetPasswordErrorMessage(resetMutation.error)}
            {isInvalidTokenError(resetMutation.error) && (
              <>
                {' '}
                <Link to={ROUTES.FORGOT_PASSWORD}>Yêu cầu liên kết mới</Link>
              </>
            )}
          </Alert>
        )}
        <fieldset className={styles.fieldset} disabled={isSubmitting}>
          <legend className="sr-only">Mật khẩu mới</legend>
          <PasswordField
            label="Mật khẩu mới"
            required
            autoComplete="new-password"
            hint={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự, có ít nhất 1 ký tự đặc biệt`}
            error={errors.password?.message}
            {...register('password', {
              onChange: () => {
                if (getValues('confirmPassword')) void trigger('confirmPassword')
              },
            })}
          />
          <PasswordField
            label="Nhập lại mật khẩu mới"
            required
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </fieldset>
        <Button type="submit" variant="accent" size="lg" block loading={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
        </Button>
      </form>
    )
  }

  return (
    <AuthShell
      titleId="reset-password-title"
      title="Đặt lại mật khẩu"
      subtitle="Tạo mật khẩu mới cho tài khoản của bạn."
      footer={
        <>
          Nhớ mật khẩu rồi? <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
        </>
      }
    >
      {renderContent()}
    </AuthShell>
  )
}
