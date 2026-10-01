import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { PasswordField } from '@/components/form/password-field'
import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { useChangePassword } from '@/pages/learner/use-profile'
import {
  CHANGE_PASSWORD_DEFAULT_VALUES,
  CHANGE_PASSWORD_MESSAGES,
  changePasswordSchema,
  PASSWORD_MIN_LENGTH,
  toChangePasswordPayload,
  type ChangePasswordFormValues,
} from '@/schemas/user-schema'
import { apiErrorMessage } from '@/utils/api-error-message'

import styles from './learner-form.module.css'

interface ChangePasswordFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function ChangePasswordForm({ onSuccess, onCancel }: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched',
    defaultValues: CHANGE_PASSWORD_DEFAULT_VALUES,
  })
  const changePassword = useChangePassword()
  const wrongCurrent = changePassword.error?.code === API_ERROR_CODES.INVALID_CREDENTIALS

  useEffect(() => {
    if (!wrongCurrent) return
    setError('currentPassword', { type: 'server', message: CHANGE_PASSWORD_MESSAGES.currentWrong })
    setFocus('currentPassword')
  }, [wrongCurrent, setError, setFocus])

  const onSubmit = handleSubmit((values) => {
    changePassword.mutate(toChangePasswordPayload(values), { onSuccess })
  })

  const isSubmitting = changePassword.isPending

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-label="Đổi mật khẩu">
      {changePassword.isError && !wrongCurrent && (
        <Alert variant="error" title="Chưa đổi được mật khẩu">
          {apiErrorMessage(changePassword.error, {
            fallback: 'Mật khẩu mới chưa hợp lệ. Vui lòng kiểm tra lại.',
          })}
        </Alert>
      )}

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className="sr-only">Đổi mật khẩu</legend>
        <PasswordField
          label="Mật khẩu hiện tại"
          required
          autoComplete="current-password"
          fieldClassName={styles.full}
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <PasswordField
          label="Mật khẩu mới"
          required
          autoComplete="new-password"
          hint={`Ít nhất ${PASSWORD_MIN_LENGTH} ký tự, có ký tự đặc biệt.`}
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <PasswordField
          label="Nhập lại mật khẩu mới"
          required
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </fieldset>

      <div className={styles.footer}>
        <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" variant="accent" loading={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
        </Button>
      </div>
    </form>
  )
}
