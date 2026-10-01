import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch, type UseFormRegister } from 'react-hook-form'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { PasswordField } from '@/components/form/password-field'
import { SelectField } from '@/components/form/select-field'
import { TextField } from '@/components/form/text-field'
import { ADMIN_ROUTES } from '@/constants/routes'
import { USER_STATUS_HINTS, USER_STATUS_LABELS, USER_STATUSES } from '@/constants/user'
import { RolePicker } from '@/pages/admin/users/components/role-picker'
import { UserInfoFields, type UserInfoValues } from '@/components/shared/user-info-fields'
import { useCreateUser, userFormErrorMessage } from '@/pages/admin/users/use-users'
import { canGrantSuperAdmin } from '@/pages/admin/users/user-permissions'
import { userApiFieldErrors, type UserField } from '@/schemas/user-api-errors'
import {
  CREATE_USER_DEFAULT_VALUES,
  createUserSchema,
  PASSWORD_MIN_LENGTH,
  toCreateUserPayload,
  type CreateUserFormInput,
  type CreateUserFormValues,
} from '@/schemas/user-schema'
import { useAuthStore } from '@/stores/auth-store'
import type { User } from '@/types/user'

import styles from './user-form.module.css'

/** Thứ tự ô trên form — lỗi server đầu tiên theo thứ tự này được focus. */
const FIELD_ORDER: Exclude<UserField, 'status'>[] = [
  'lastName',
  'firstName',
  'dateOfBirth',
  'cccd',
  'phoneNumber',
  'email',
  'address',
  'username',
  'password',
  'roles',
]

const STATUS_OPTIONS = USER_STATUSES.map((status) => ({
  value: status,
  label: USER_STATUS_LABELS[status],
}))

export function CreateUserForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const actor = useAuthStore((state) => state.user)
  const {
    register,
    control,
    handleSubmit,
    getValues,
    trigger,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<CreateUserFormInput, unknown, CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    mode: 'onTouched',
    defaultValues: CREATE_USER_DEFAULT_VALUES,
  })
  const createUser = useCreateUser()

  const serverFieldErrors = useMemo(
    () => (createUser.error ? userApiFieldErrors(createUser.error) : {}),
    [createUser.error],
  )

  useEffect(() => {
    const fields = FIELD_ORDER.filter((field) => serverFieldErrors[field])
    for (const field of fields) {
      setError(field, { type: 'server', message: serverFieldErrors[field] })
    }
    if (fields[0]) setFocus(fields[0])
  }, [serverFieldErrors, setError, setFocus])

  const onSubmit = handleSubmit((values) => {
    createUser.mutate(toCreateUserPayload(values), { onSuccess })
  })

  const isSubmitting = createUser.isPending
  const status = useWatch({ control, name: 'status' })

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {createUser.isError && (
        <Alert variant="error" title="Chưa tạo được tài khoản">
          {userFormErrorMessage(
            createUser.error,
            FIELD_ORDER.flatMap((field) => serverFieldErrors[field] ?? []),
          )}
        </Alert>
      )}

      <p className={styles.requiredNote}>
        Các trường có dấu <span>*</span> là bắt buộc.
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
          <KeyRound size={18} aria-hidden /> Thông tin đăng nhập
        </legend>
        <TextField
          label="Tên đăng nhập"
          required
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          fieldClassName={styles.full}
          hint="Không đổi được sau khi tạo"
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

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className={styles.legend}>
          <ShieldCheck size={18} aria-hidden /> Quyền và trạng thái
        </legend>
        <div className={styles.full}>
          <Controller
            control={control}
            name="roles"
            render={({ field, fieldState }) => (
              <RolePicker
                ref={field.ref}
                value={field.value}
                onChange={field.onChange}
                canGrantSuperAdmin={canGrantSuperAdmin(actor)}
                error={fieldState.error?.message}
                disabled={isSubmitting}
              />
            )}
          />
        </div>
        <SelectField
          label="Trạng thái"
          required
          options={STATUS_OPTIONS}
          hint={USER_STATUS_HINTS[status]}
          error={errors.status?.message}
          {...register('status')}
        />
      </fieldset>

      <div className={styles.footer}>
        <ButtonLink to={ADMIN_ROUTES.USERS} variant="ghost">
          Huỷ
        </ButtonLink>
        <Button type="submit" variant="accent" loading={isSubmitting}>
          {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
        </Button>
      </div>
    </form>
  )
}
