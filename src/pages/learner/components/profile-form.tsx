import { zodResolver } from '@hookform/resolvers/zod'
import { Lock } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm, type UseFormRegister } from 'react-hook-form'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { UserInfoFields, type UserInfoValues } from '@/components/shared/user-info-fields'
import { CONTACT } from '@/constants/contact'
import { profileErrorMessage, useUpdateProfile } from '@/pages/learner/use-profile'
import { userApiFieldErrors, type UserField } from '@/schemas/user-api-errors'
import {
  IDENTITY_FIELDS,
  toUpdateProfilePayload,
  updateProfileFormValues,
  updateProfileSchema,
  type UpdateProfileFormInput,
  type UpdateProfileFormValues,
} from '@/schemas/user-schema'
import type { User } from '@/types/user'

import styles from './learner-form.module.css'

/** Thứ tự các ô trên form (focus ô lỗi đầu tiên). */
const FIELD_ORDER = [
  'lastName',
  'firstName',
  'dateOfBirth',
  'cccd',
  'phoneNumber',
  'email',
  'address',
] as const satisfies readonly UserField[]

interface ProfileFormProps {
  user: User
  /** Đã có chứng chỉ → họ tên, ngày sinh, CCCD chỉ đọc. */
  identityLocked: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function ProfileForm({ user, identityLocked, onSuccess, onCancel }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<UpdateProfileFormInput, unknown, UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onTouched',
    defaultValues: updateProfileFormValues(user),
  })
  const updateProfile = useUpdateProfile()

  const serverFieldErrors = useMemo(
    () => (updateProfile.error ? userApiFieldErrors(updateProfile.error) : {}),
    [updateProfile.error],
  )

  // Sau render (fieldset đã hết disabled) mới setError / focus được.
  useEffect(() => {
    const fields = FIELD_ORDER.filter((field) => serverFieldErrors[field])
    for (const field of fields) {
      setError(field, { type: 'server', message: serverFieldErrors[field] })
    }
    const first = fields.find(
      (field) => !identityLocked || !IDENTITY_FIELDS.some((locked) => locked === field),
    )
    if (first) setFocus(first)
  }, [serverFieldErrors, setError, setFocus, identityLocked])

  const onSubmit = handleSubmit((values) => {
    updateProfile.mutate(toUpdateProfilePayload(values, identityLocked), { onSuccess })
  })

  const isSubmitting = updateProfile.isPending

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-label="Sửa hồ sơ">
      {updateProfile.isError && (
        <Alert variant="error" title="Chưa lưu được hồ sơ">
          {profileErrorMessage(
            updateProfile.error,
            FIELD_ORDER.flatMap((field) => serverFieldErrors[field] ?? []),
          )}
        </Alert>
      )}

      {identityLocked && (
        <p className={styles.note}>
          <Lock size={16} aria-hidden />
          <span>
            Bạn đã được cấp chứng chỉ nên họ tên, ngày sinh và CCCD không tự sửa được. Cần điều
            chỉnh, vui lòng liên hệ hotline{' '}
            <a href={`tel:${CONTACT.HOTLINE.replaceAll(' ', '')}`}>{CONTACT.HOTLINE}</a>.
          </span>
        </p>
      )}

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className="sr-only">Thông tin cá nhân</legend>
        <UserInfoFields
          register={register as unknown as UseFormRegister<UserInfoValues>}
          errors={errors}
          identityLocked={identityLocked}
        />
      </fieldset>

      <div className={styles.footer}>
        <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" variant="accent" loading={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  )
}
