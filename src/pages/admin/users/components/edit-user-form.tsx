import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch, type UseFormRegister } from 'react-hook-form'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { SelectField } from '@/components/form/select-field'
import { adminUserPath } from '@/constants/routes'
import { USER_STATUS_HINTS, USER_STATUS_LABELS, USER_STATUSES } from '@/constants/user'
import { UserInfoFields, type UserInfoValues } from '@/components/shared/user-info-fields'
import { userFormErrorMessage, useUpdateUser } from '@/pages/admin/users/use-users'
import { userApiFieldErrors, type UserField } from '@/schemas/user-api-errors'
import {
  toUpdateUserPayload,
  updateUserFormValues,
  updateUserSchema,
  type UpdateUserFormInput,
  type UpdateUserFormValues,
} from '@/schemas/user-schema'
import type { User } from '@/types/user'
import { cn } from '@/utils/cn'

import styles from './user-form.module.css'

const FIELD_ORDER: Exclude<UserField, 'username' | 'password' | 'roles'>[] = [
  'lastName',
  'firstName',
  'dateOfBirth',
  'cccd',
  'phoneNumber',
  'email',
  'address',
  'status',
]

const STATUS_OPTIONS = USER_STATUSES.map((status) => ({
  value: status,
  label: USER_STATUS_LABELS[status],
}))

interface EditUserFormProps {
  user: User
  /** Đang sửa chính mình: không tự khoá tài khoản. */
  isSelf: boolean
  onSuccess: (user: User) => void
}

export function EditUserForm({ user, isSelf, onSuccess }: EditUserFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<UpdateUserFormInput, unknown, UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    mode: 'onTouched',
    defaultValues: updateUserFormValues(user),
  })
  const updateUser = useUpdateUser(user.id)

  const serverFieldErrors = useMemo(
    () => (updateUser.error ? userApiFieldErrors(updateUser.error) : {}),
    [updateUser.error],
  )

  useEffect(() => {
    const fields = FIELD_ORDER.filter((field) => serverFieldErrors[field])
    for (const field of fields) {
      setError(field, { type: 'server', message: serverFieldErrors[field] })
    }
    if (fields[0]) setFocus(fields[0])
  }, [serverFieldErrors, setError, setFocus])

  const onSubmit = handleSubmit((values) => {
    updateUser.mutate(toUpdateUserPayload(values), { onSuccess })
  })

  const isSubmitting = updateUser.isPending
  const status = useWatch({ control, name: 'status' })

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {updateUser.isError && (
        <Alert variant="error" title="Chưa lưu được tài khoản">
          {userFormErrorMessage(
            updateUser.error,
            FIELD_ORDER.flatMap((field) => serverFieldErrors[field] ?? []),
          )}
        </Alert>
      )}

      <p className={styles.readonly}>
        Tên đăng nhập: <strong>@{user.username}</strong> (không đổi được). Vai trò đổi ở trang chi
        tiết tài khoản.
      </p>

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className={styles.legend}>
          <UserRound size={18} aria-hidden /> Thông tin cá nhân
        </legend>
        <UserInfoFields
          register={register as unknown as UseFormRegister<UserInfoValues>}
          errors={errors}
        />
      </fieldset>

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className={styles.legend}>
          <ShieldCheck size={18} aria-hidden /> Trạng thái tài khoản
        </legend>
        {isSelf ? (
          // Không render ô chọn: giá trị hiện tại vẫn được gửi (từ defaultValues).
          <p className={cn(styles.readonly, styles.full)}>
            Trạng thái: <strong>{USER_STATUS_LABELS[user.status]}</strong>. Bạn không thể tự đổi
            trạng thái tài khoản của mình.
          </p>
        ) : (
          <SelectField
            label="Trạng thái"
            required
            options={STATUS_OPTIONS}
            hint={USER_STATUS_HINTS[status]}
            error={errors.status?.message}
            {...register('status')}
          />
        )}
      </fieldset>

      <div className={styles.footer}>
        <ButtonLink to={adminUserPath('USER_DETAIL', user.id)} variant="ghost">
          Huỷ
        </ButtonLink>
        <Button type="submit" variant="accent" loading={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  )
}
