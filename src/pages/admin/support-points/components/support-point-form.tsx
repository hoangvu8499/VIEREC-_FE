import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { TextField } from '@/components/form/text-field'
import { SUPPORT_POINT_RULES } from '@/constants/support-point'
import {
  saveSupportPointErrorMessage,
  useSaveSupportPoint,
} from '@/pages/admin/support-points/use-support-points'
import { supportPointApiFieldErrors } from '@/schemas/support-point-api-errors'
import {
  supportPointFormValues,
  supportPointSchema,
  toSupportPointPayload,
  type SupportPointField,
  type SupportPointFormInput,
  type SupportPointFormValues,
} from '@/schemas/support-point-schema'
import type { SupportPointDetail } from '@/types/support-point'

import styles from './support-points.module.css'

const FIELD_ORDER: SupportPointField[] = [
  'name',
  'province',
  'district',
  'address',
  'phoneNumber',
  'latitude',
  'longitude',
]

interface SupportPointFormProps {
  /** Có: sửa điểm này. Không: thêm mới. */
  point?: SupportPointDetail
  onSaved: (saved: SupportPointDetail) => void
  onCancel: () => void
  /** Báo hộp thoại chứa form để chặn đóng khi đang lưu. */
  onBusyChange: (busy: boolean) => void
}

/** Tên, khu vực, địa chỉ, số điện thoại và toạ độ (bỏ trống toạ độ: tự tìm theo địa chỉ). */
export function SupportPointForm({
  point,
  onSaved,
  onCancel,
  onBusyChange,
}: SupportPointFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<SupportPointFormInput, unknown, SupportPointFormValues>({
    resolver: zodResolver(supportPointSchema),
    mode: 'onTouched',
    defaultValues: supportPointFormValues(point),
  })
  const save = useSaveSupportPoint(point?.id)

  useEffect(() => onBusyChange(save.isPending), [save.isPending, onBusyChange])

  const serverFieldErrors = useMemo(
    () => (save.error ? supportPointApiFieldErrors(save.error) : {}),
    [save.error],
  )

  useEffect(() => {
    const fields = FIELD_ORDER.filter((field) => serverFieldErrors[field])
    for (const field of fields) {
      setError(field, { type: 'server', message: serverFieldErrors[field] })
    }
    if (fields[0]) setFocus(fields[0])
  }, [serverFieldErrors, setError, setFocus])

  const onSubmit = handleSubmit((values) => {
    save.mutate(toSupportPointPayload(values), { onSuccess: onSaved })
  })

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {save.isError && (
        <Alert variant="error" title="Chưa lưu được điểm hỗ trợ">
          {saveSupportPointErrorMessage(
            save.error,
            FIELD_ORDER.flatMap((field) => serverFieldErrors[field] ?? []),
          )}
        </Alert>
      )}

      <fieldset className={styles.fieldset} disabled={save.isPending}>
        <legend className="sr-only">Thông tin điểm hỗ trợ</legend>
        <TextField
          label="Tên đơn vị"
          required
          maxLength={SUPPORT_POINT_RULES.nameMax}
          error={errors.name?.message}
          {...register('name')}
        />
        <div className={styles.twoColumns}>
          <TextField
            label="Tỉnh / Thành phố"
            required
            maxLength={SUPPORT_POINT_RULES.areaMax}
            error={errors.province?.message}
            {...register('province')}
          />
          <TextField
            label="Quận / Huyện"
            required
            maxLength={SUPPORT_POINT_RULES.areaMax}
            error={errors.district?.message}
            {...register('district')}
          />
        </div>
        <TextField
          label="Địa chỉ chi tiết"
          maxLength={SUPPORT_POINT_RULES.addressMax}
          hint="Số nhà, tên đường. Có thể bỏ trống."
          error={errors.address?.message}
          {...register('address')}
        />
        <TextField
          label="Số điện thoại"
          required
          inputMode="tel"
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />
        <div className={styles.twoColumns}>
          <TextField
            label="Vĩ độ"
            inputMode="decimal"
            placeholder="15.994224"
            error={errors.latitude?.message}
            {...register('latitude')}
          />
          <TextField
            label="Kinh độ"
            inputMode="decimal"
            placeholder="108.237739"
            error={errors.longitude?.message}
            {...register('longitude')}
          />
        </div>
        <p className={styles.hint}>
          Bỏ trống cả vĩ độ và kinh độ để hệ thống tự tìm toạ độ theo địa chỉ, quận / huyện, tỉnh /
          thành phố. Muốn chính xác hơn: chuột phải vào vị trí trên Google Maps, bấm vào dòng số đầu
          tiên để sao chép (số trước dấu phẩy là vĩ độ, số sau là kinh độ).
        </p>
      </fieldset>

      <div className={styles.formActions}>
        <Button variant="ghost" disabled={save.isPending} onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" variant="accent" loading={save.isPending}>
          {point ? 'Lưu thay đổi' : 'Thêm điểm hỗ trợ'}
        </Button>
      </div>
    </form>
  )
}
