import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { TextField } from '@/components/form/text-field'
import { CCCD_LENGTH, PHONE_LENGTH } from '@/schemas/user-schema'

import styles from './user-info-fields.module.css'

/** Các field thông tin cá nhân chung của form tạo và sửa tài khoản. */
export interface UserInfoValues {
  lastName: string
  firstName: string
  dateOfBirth: string
  cccd: string
  phoneNumber: string
  email: string
  address: string
}

interface UserInfoFieldsProps {
  // Hai form có kiểu khác nhau nhưng cùng các field này.
  register: UseFormRegister<UserInfoValues>
  errors: FieldErrors<UserInfoValues>
  /**
   * Học viên đã có chứng chỉ: họ tên, ngày sinh, CCCD chỉ đọc (backend chặn đổi).
   * Dùng `readOnly` chứ không `disabled` — field disabled bị react-hook-form bỏ khỏi giá trị form.
   */
  identityLocked?: boolean
}

function todayIso(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const LOCKED_HINT = 'Đã in trên chứng chỉ, không tự sửa được'

export function UserInfoFields({ register, errors, identityLocked = false }: UserInfoFieldsProps) {
  const locked = identityLocked
    ? { readOnly: true, hint: LOCKED_HINT, className: styles.locked }
    : undefined

  return (
    <>
      <TextField
        label="Họ và tên đệm"
        required
        autoComplete="off"
        placeholder="Nguyễn Văn"
        error={errors.lastName?.message}
        {...locked}
        {...register('lastName')}
      />
      <TextField
        label="Tên"
        required
        autoComplete="off"
        placeholder="An"
        error={errors.firstName?.message}
        {...locked}
        {...register('firstName')}
      />
      <TextField
        label="Ngày sinh"
        type="date"
        required
        max={todayIso()}
        error={errors.dateOfBirth?.message}
        {...locked}
        {...register('dateOfBirth')}
      />
      <TextField
        label="Số CCCD"
        required
        inputMode="numeric"
        maxLength={CCCD_LENGTH}
        placeholder={`${CCCD_LENGTH} chữ số`}
        error={errors.cccd?.message}
        {...locked}
        {...register('cccd')}
      />
      <TextField
        label="Số điện thoại"
        type="tel"
        required
        inputMode="numeric"
        maxLength={PHONE_LENGTH}
        placeholder="0912345678"
        error={errors.phoneNumber?.message}
        {...register('phoneNumber')}
      />
      <TextField
        label="Email"
        type="email"
        required
        autoComplete="off"
        placeholder="email@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Địa chỉ"
        required
        autoComplete="off"
        placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố"
        fieldClassName={styles.full}
        error={errors.address?.message}
        {...register('address')}
      />
    </>
  )
}
