import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { TextField } from '@/components/form/text-field'
import { ROUTES } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AuthShell } from '@/layouts/user/auth-shell'
import {
  forgotPasswordErrorMessage,
  useForgotPassword,
} from '@/pages/forgot-password/use-forgot-password'
import {
  FORGOT_PASSWORD_DEFAULT_VALUES,
  forgotPasswordSchema,
  type ForgotPasswordFormInput,
  type ForgotPasswordFormValues,
} from '@/schemas/auth-schema'

import styles from './forgot-password-page.module.css'

export default function ForgotPasswordPage() {
  useDocumentTitle('Quên mật khẩu')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInput, unknown, ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: FORGOT_PASSWORD_DEFAULT_VALUES,
  })
  const forgotMutation = useForgotPassword()
  const isSubmitting = forgotMutation.isPending

  const onSubmit = handleSubmit((values) => forgotMutation.mutate(values))

  return (
    <AuthShell
      titleId="forgot-password-title"
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết để bạn đặt lại mật khẩu."
      footer={
        <>
          Chưa có tài khoản? <Link to={ROUTES.REGISTER}>Đăng ký ngay</Link>
        </>
      }
    >
      {forgotMutation.isSuccess ? (
        <div className={styles.stack}>
          {/* Không xác nhận email có tồn tại hay không — tránh lộ thông tin tài khoản. */}
          <Alert variant="success" title="Đã gửi yêu cầu">
            Nếu <strong>{forgotMutation.variables.email}</strong> là email đã đăng ký, bạn sẽ nhận
            được liên kết đặt lại mật khẩu trong vài phút. Vui lòng kiểm tra cả hộp thư rác.
          </Alert>
          <ButtonLink to={ROUTES.LOGIN} variant="accent" size="lg" block>
            Quay lại đăng nhập
          </ButtonLink>
          <Button variant="ghost" onClick={() => forgotMutation.reset()}>
            Chưa nhận được email? Gửi lại
          </Button>
        </div>
      ) : (
        <form className={styles.stack} onSubmit={onSubmit} noValidate>
          {forgotMutation.isError && (
            <Alert variant="error" title="Gửi yêu cầu không thành công">
              {forgotPasswordErrorMessage(forgotMutation.error)}
            </Alert>
          )}
          <fieldset className={styles.fieldset} disabled={isSubmitting}>
            <legend className="sr-only">Email khôi phục</legend>
            <TextField
              label="Email"
              type="email"
              required
              autoComplete="email"
              placeholder="email@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </fieldset>
          <Button type="submit" variant="accent" size="lg" block loading={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
          </Button>
          <Link to={ROUTES.LOGIN} className={styles.back}>
            <ArrowLeft size={16} aria-hidden /> Quay lại đăng nhập
          </Link>
        </form>
      )}
    </AuthShell>
  )
}
