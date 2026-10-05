import type { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'

import { PasswordField } from '@/components/form/password-field'
import { SelectField } from '@/components/form/select-field'
import { TextField } from '@/components/form/text-field'
import {
  BUSINESS_STATUS_HINTS,
  BUSINESS_STATUS_LABELS,
  BUSINESS_STATUSES,
} from '@/constants/business'
import type { BusinessFormInput, ManagerFormInput } from '@/schemas/business-schema'
import { PASSWORD_MIN_LENGTH, PHONE_LENGTH } from '@/schemas/user-schema'
import type { BusinessStatus } from '@/types/business'

import styles from './business.module.css'

const STATUS_OPTIONS = BUSINESS_STATUSES.map((status) => ({
  value: status,
  label: BUSINESS_STATUS_LABELS[status],
}))

interface BusinessFieldsProps {
  // Form tạo và form sửa có kiểu khác nhau nhưng cùng các field này.
  register: UseFormRegister<BusinessFormInput>
  errors: FieldErrors<BusinessFormInput>
  /** Trạng thái đang chọn (để hiện giải thích). */
  status: BusinessStatus
}

/** Thông tin doanh nghiệp: tên, mã số thuế, liên hệ, trạng thái. */
export function BusinessFields({ register, errors, status }: BusinessFieldsProps) {
  return (
    <>
      <TextField
        label="Tên doanh nghiệp"
        required
        autoComplete="organization"
        fieldClassName={styles.full}
        placeholder="Công ty TNHH Môi trường Xanh"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="Mã số thuế"
        required
        inputMode="numeric"
        placeholder="0101234567"
        error={errors.taxCode?.message}
        {...register('taxCode')}
      />
      <SelectField
        label="Trạng thái"
        required
        options={STATUS_OPTIONS}
        hint={BUSINESS_STATUS_HINTS[status]}
        error={errors.status?.message}
        {...register('status')}
      />
      <TextField
        label="Địa chỉ"
        required
        autoComplete="street-address"
        fieldClassName={styles.full}
        error={errors.address?.message}
        {...register('address')}
      />
      <TextField
        label="Số điện thoại liên hệ"
        required
        type="tel"
        inputMode="numeric"
        maxLength={PHONE_LENGTH}
        error={errors.phoneNumber?.message}
        {...register('phoneNumber')}
      />
      <TextField
        label="Email liên hệ"
        required
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
    </>
  )
}

interface ManagerFieldsProps {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<ManagerFormInput> | undefined
  /** Form tạo doanh nghiệp lồng các field trong `manager.`. */
  prefix?: '' | 'manager.'
  onPasswordChange?: () => void
}

/** Tài khoản quản lý doanh nghiệp (role BUSINESS): họ tên, liên hệ, đăng nhập. */
export function ManagerFields({
  register,
  errors,
  prefix = '',
  onPasswordChange,
}: ManagerFieldsProps) {
  const name = (field: keyof ManagerFormInput) => `${prefix}${field}`
  return (
    <>
      <TextField
        label="Họ và tên đệm"
        required
        autoComplete="off"
        placeholder="Trần Thị"
        error={errors?.lastName?.message}
        {...register(name('lastName'))}
      />
      <TextField
        label="Tên"
        required
        autoComplete="off"
        placeholder="Bình"
        error={errors?.firstName?.message}
        {...register(name('firstName'))}
      />
      <TextField
        label="Số điện thoại"
        required
        type="tel"
        inputMode="numeric"
        maxLength={PHONE_LENGTH}
        error={errors?.phoneNumber?.message}
        {...register(name('phoneNumber'))}
      />
      <TextField
        label="Email"
        required
        type="email"
        autoComplete="off"
        error={errors?.email?.message}
        {...register(name('email'))}
      />
      <TextField
        label="Tên đăng nhập"
        required
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        fieldClassName={styles.full}
        hint="Không đổi được sau khi tạo"
        error={errors?.username?.message}
        {...register(name('username'))}
      />
      <PasswordField
        label="Mật khẩu"
        required
        autoComplete="new-password"
        hint={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự, có ít nhất 1 ký tự đặc biệt`}
        error={errors?.password?.message}
        {...register(name('password'), { onChange: onPasswordChange })}
      />
      <PasswordField
        label="Nhập lại mật khẩu"
        required
        autoComplete="new-password"
        error={errors?.confirmPassword?.message}
        {...register(name('confirmPassword'))}
      />
    </>
  )
}
