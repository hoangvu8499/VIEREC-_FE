import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, KeyRound } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import {
  useForm,
  useWatch,
  type FieldValues,
  type Path,
  type UseFormRegister,
} from 'react-hook-form'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { ADMIN_ROUTES } from '@/constants/routes'
import { BusinessFields, ManagerFields } from '@/pages/admin/businesses/components/business-fields'
import {
  businessFormErrorMessage,
  useAddManager,
  useCreateBusiness,
  useUpdateBusiness,
} from '@/pages/admin/businesses/use-businesses'
import { businessApiFieldErrors } from '@/schemas/business-api-errors'
import {
  businessFormValues,
  businessSchema,
  createBusinessSchema,
  MANAGER_DEFAULT_VALUES,
  managerSchema,
  toBusinessPayload,
  toManagerPayload,
  type BusinessFormInput,
  type BusinessFormValues,
  type CreateBusinessFormInput,
  type CreateBusinessFormValues,
  type ManagerFormInput,
  type ManagerFormValues,
} from '@/schemas/business-schema'
import type { ApiError } from '@/types/api'
import type { Business } from '@/types/business'
import type { User } from '@/types/user'
import { cn } from '@/utils/cn'

import styles from './business.module.css'

const BUSINESS_ORDER = ['name', 'taxCode', 'status', 'address', 'phoneNumber', 'email'] as const
const MANAGER_ORDER = [
  'lastName',
  'firstName',
  'phoneNumber',
  'email',
  'username',
  'password',
] as const

/**
 * Lỗi server theo path của form → `setError` lần lượt, focus ô đầu tiên theo thứ tự trên form.
 * Trả các message để Alert phía trên form nêu lại.
 */
function useServerErrors<T extends FieldValues>(
  error: ApiError | null,
  order: readonly string[],
  managerPrefix: '' | 'manager.',
  setError: (name: Path<T>, error: { type: string; message?: string }) => void,
  setFocus: (name: Path<T>) => void,
): string[] {
  const fieldErrors = useMemo(
    () => (error ? businessApiFieldErrors(error, managerPrefix) : {}),
    [error, managerPrefix],
  )
  useEffect(() => {
    const fields = order.filter((field) => fieldErrors[field])
    for (const field of fields) {
      setError(field as Path<T>, { type: 'server', message: fieldErrors[field] })
    }
    if (fields[0]) setFocus(fields[0] as Path<T>)
  }, [fieldErrors, order, setError, setFocus])
  return order.flatMap((field) => fieldErrors[field] ?? [])
}

const CREATE_ORDER = [
  ...BUSINESS_ORDER,
  ...MANAGER_ORDER.map((field) => `manager.${field}`),
] as const

/** Tạo doanh nghiệp cùng tài khoản quản lý đầu tiên. */
export function CreateBusinessForm({ onSuccess }: { onSuccess: (business: Business) => void }) {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    trigger,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<CreateBusinessFormInput, unknown, CreateBusinessFormValues>({
    resolver: zodResolver(createBusinessSchema),
    mode: 'onTouched',
    defaultValues: { ...businessFormValues(), manager: MANAGER_DEFAULT_VALUES },
  })
  const create = useCreateBusiness()
  const fieldMessages = useServerErrors<CreateBusinessFormInput>(
    create.error,
    CREATE_ORDER,
    'manager.',
    setError,
    setFocus,
  )
  const status = useWatch({ control, name: 'status' })
  const isSubmitting = create.isPending

  const onSubmit = handleSubmit(({ manager, ...business }) => {
    create.mutate(
      { ...toBusinessPayload(business), manager: toManagerPayload(manager) },
      { onSuccess },
    )
  })

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {create.isError && (
        <Alert variant="error" title="Chưa tạo được doanh nghiệp">
          {businessFormErrorMessage(create.error, fieldMessages)}
        </Alert>
      )}
      <p className={styles.requiredNote}>
        Các trường có dấu <span>*</span> là bắt buộc.
      </p>

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className={styles.legend}>
          <Building2 size={18} aria-hidden /> Thông tin doanh nghiệp
        </legend>
        <BusinessFields
          register={register as unknown as UseFormRegister<BusinessFormInput>}
          errors={errors}
          status={status}
        />
      </fieldset>

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className={styles.legend}>
          <KeyRound size={18} aria-hidden /> Tài khoản quản lý
        </legend>
        <p className={cn(styles.requiredNote, styles.full)}>
          Người phụ trách đào tạo của doanh nghiệp đăng nhập bằng tài khoản này để tạo tài khoản và
          đăng ký khoá học cho nhân viên.
        </p>
        <ManagerFields
          register={register as unknown as UseFormRegister<FieldValues>}
          errors={errors.manager}
          prefix="manager."
          onPasswordChange={() => {
            if (getValues('manager.confirmPassword')) void trigger('manager.confirmPassword')
          }}
        />
      </fieldset>

      <div className={styles.footer}>
        <ButtonLink to={ADMIN_ROUTES.BUSINESSES} variant="ghost">
          Huỷ
        </ButtonLink>
        <Button type="submit" variant="accent" loading={isSubmitting}>
          {isSubmitting ? 'Đang tạo...' : 'Tạo doanh nghiệp'}
        </Button>
      </div>
    </form>
  )
}

interface EditBusinessFormProps {
  business: Business
  onCancel: () => void
  onSuccess: (business: Business) => void
  onBusyChange: (busy: boolean) => void
}

/** Sửa thông tin / trạng thái doanh nghiệp (trong hộp thoại). */
export function EditBusinessForm({
  business,
  onCancel,
  onSuccess,
  onBusyChange,
}: EditBusinessFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<BusinessFormInput, unknown, BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    mode: 'onTouched',
    defaultValues: businessFormValues(business),
  })
  const update = useUpdateBusiness(business.id)
  const fieldMessages = useServerErrors<BusinessFormInput>(
    update.error,
    BUSINESS_ORDER,
    'manager.',
    setError,
    setFocus,
  )
  const status = useWatch({ control, name: 'status' })
  const isSubmitting = update.isPending

  useEffect(() => onBusyChange(isSubmitting), [isSubmitting, onBusyChange])

  const onSubmit = handleSubmit((values) => {
    update.mutate(toBusinessPayload(values), { onSuccess })
  })

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {update.isError && (
        <Alert variant="error">{businessFormErrorMessage(update.error, fieldMessages)}</Alert>
      )}
      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className="sr-only">Thông tin doanh nghiệp</legend>
        <BusinessFields register={register} errors={errors} status={status} />
      </fieldset>
      <div className={styles.footer}>
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Huỷ
        </Button>
        <Button type="submit" variant="accent" loading={isSubmitting}>
          Lưu thay đổi
        </Button>
      </div>
    </form>
  )
}

interface ManagerFormProps {
  businessId: number
  onCancel: () => void
  onSuccess: (manager: User) => void
  onBusyChange: (busy: boolean) => void
}

/** Thêm tài khoản quản lý cho doanh nghiệp (trong hộp thoại). */
export function ManagerForm({ businessId, onCancel, onSuccess, onBusyChange }: ManagerFormProps) {
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<ManagerFormInput, unknown, ManagerFormValues>({
    resolver: zodResolver(managerSchema),
    mode: 'onTouched',
    defaultValues: MANAGER_DEFAULT_VALUES,
  })
  const addManager = useAddManager(businessId)
  const fieldMessages = useServerErrors<ManagerFormInput>(
    addManager.error,
    MANAGER_ORDER,
    '',
    setError,
    setFocus,
  )
  const isSubmitting = addManager.isPending

  useEffect(() => onBusyChange(isSubmitting), [isSubmitting, onBusyChange])

  const onSubmit = handleSubmit((values) => {
    addManager.mutate(toManagerPayload(values), { onSuccess })
  })

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {addManager.isError && (
        <Alert variant="error">{businessFormErrorMessage(addManager.error, fieldMessages)}</Alert>
      )}
      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className="sr-only">Tài khoản quản lý</legend>
        <ManagerFields
          register={register as unknown as UseFormRegister<FieldValues>}
          errors={errors}
          onPasswordChange={() => {
            if (getValues('confirmPassword')) void trigger('confirmPassword')
          }}
        />
      </fieldset>
      <div className={styles.footer}>
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Huỷ
        </Button>
        <Button type="submit" variant="accent" loading={isSubmitting}>
          Tạo tài khoản
        </Button>
      </div>
    </form>
  )
}
