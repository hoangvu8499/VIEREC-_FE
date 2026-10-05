import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, UserRound } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm, type UseFormRegister } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { PasswordField } from '@/components/form/password-field'
import { TextField } from '@/components/form/text-field'
import { UserInfoFields, type UserInfoValues } from '@/components/shared/user-info-fields'
import { BUSINESS_ROUTES, businessMemberPath } from '@/constants/routes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { AccountPageHeader } from '@/layouts/user/account-page-header'
import { createMemberErrorMessage, useCreateMember } from '@/pages/business/use-my-business'
import { userApiFieldErrors, type RegisterField } from '@/schemas/user-api-errors'
import {
  PASSWORD_MIN_LENGTH,
  REGISTER_DEFAULT_VALUES,
  registerSchema,
  toRegisterPayload,
  type RegisterFormInput,
  type RegisterFormValues,
} from '@/schemas/user-schema'
import type { FlashState } from '@/types/navigation'
import { cn } from '@/utils/cn'

import styles from './business.module.css'

/** Thứ tự ô trên form — lỗi server đầu tiên theo thứ tự này được focus. */
const FIELD_ORDER: RegisterField[] = [
  'lastName',
  'firstName',
  'dateOfBirth',
  'cccd',
  'phoneNumber',
  'email',
  'address',
  'username',
  'password',
]

/** Tạo tài khoản học viên cho nhân viên: cùng thông tin với đăng ký (CCCD, ngày sinh dùng in chứng chỉ). */
export default function MemberCreatePage() {
  useDocumentTitle('Thêm học viên – Góc doanh nghiệp')
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: REGISTER_DEFAULT_VALUES,
  })
  const createMember = useCreateMember()

  const serverFieldErrors = useMemo(
    () => (createMember.error ? userApiFieldErrors(createMember.error) : {}),
    [createMember.error],
  )

  useEffect(() => {
    const fields = FIELD_ORDER.filter((field) => serverFieldErrors[field])
    for (const field of fields) {
      setError(field, { type: 'server', message: serverFieldErrors[field] })
    }
    if (fields[0]) setFocus(fields[0])
  }, [serverFieldErrors, setError, setFocus])

  const onSubmit = handleSubmit((values) => {
    createMember.mutate(toRegisterPayload(values), {
      onSuccess: (member) =>
        void navigate(businessMemberPath(member.id), {
          state: {
            flash: `Đã tạo tài khoản cho ${member.fullName}. Gửi tên đăng nhập @${member.username} và mật khẩu cho học viên.`,
          } satisfies FlashState,
        }),
    })
  })

  const isSubmitting = createMember.isPending

  return (
    <>
      <AccountPageHeader
        title="Thêm học viên"
        description="Tạo tài khoản cho nhân viên. Học viên đăng nhập bằng tên đăng nhập và mật khẩu này, nên đổi mật khẩu sau lần đầu."
      />
      <section className={cn(styles.panel, styles.padded)} aria-label="Thông tin học viên">
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          {createMember.isError && (
            <Alert variant="error" title="Chưa tạo được tài khoản">
              {createMemberErrorMessage(
                createMember.error,
                FIELD_ORDER.flatMap((field) => serverFieldErrors[field] ?? []),
              )}
            </Alert>
          )}

          <Alert variant="info">
            Chứng chỉ in họ tên, ngày sinh và số CCCD của học viên: vui lòng nhập đúng theo giấy tờ.
          </Alert>

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

          <div className={styles.formFooter}>
            <ButtonLink to={BUSINESS_ROUTES.OVERVIEW} variant="ghost">
              Huỷ
            </ButtonLink>
            <Button type="submit" variant="accent" loading={isSubmitting}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </section>
    </>
  )
}
