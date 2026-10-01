import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { SelectField } from '@/components/form/select-field'
import { TextField } from '@/components/form/text-field'
import { TextareaField } from '@/components/form/textarea-field'
import { COURSE_STATUS_LABELS, COURSE_STATUSES } from '@/constants/course'
import {
  courseInstructor,
  type InstructorOption,
} from '@/pages/admin/courses/components/instructor-option'
import { InstructorPicker } from '@/pages/admin/courses/components/instructor-picker'
import { courseErrorMessage, useSaveCourse } from '@/pages/admin/courses/use-course-mutations'
import { courseApiFieldErrors } from '@/schemas/course-api-errors'
import {
  COURSE_NAME_MAX,
  courseFormValues,
  courseSchema,
  toCoursePayload,
  type CourseField,
  type CourseFormInput,
  type CourseFormValues,
} from '@/schemas/course-schema'
import type { Course, CourseDetail } from '@/types/course'

import styles from './course-form.module.css'

/** Thứ tự ô trên form — lỗi server đầu tiên theo thứ tự này được focus. */
const FIELD_ORDER: CourseField[] = ['name', 'description', 'instructorId', 'status']

const STATUS_OPTIONS = COURSE_STATUSES.map((status) => ({
  value: status,
  label: COURSE_STATUS_LABELS[status],
}))

const STATUS_HINTS = {
  DRAFT: 'Chỉ quản trị viên thấy, học viên chưa thấy khoá này.',
  PUBLISHED: 'Hiện công khai cho mọi người.',
  ARCHIVED: 'Ẩn khỏi học viên, giữ lại để tra cứu.',
} as const

interface CourseFormProps {
  /** Có: sửa khoá này. Không: tạo khoá mới. */
  course?: CourseDetail
  /** Link của nút Huỷ. */
  cancelTo: string
  onSuccess: (course: Course) => void
}

export function CourseForm({ course, cancelTo, onSuccess }: CourseFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<CourseFormInput, unknown, CourseFormValues>({
    resolver: zodResolver(courseSchema),
    mode: 'onTouched',
    defaultValues: courseFormValues(course),
  })
  const saveCourse = useSaveCourse(course?.id)
  // Form chỉ lưu `instructorId`; giữ cả tên để hiện người đã chọn.
  const [instructor, setInstructor] = useState<InstructorOption | undefined>(
    course ? courseInstructor(course) : undefined,
  )

  const serverFieldErrors = useMemo(
    () => (saveCourse.error ? courseApiFieldErrors(saveCourse.error) : {}),
    [saveCourse.error],
  )

  // Gắn lỗi backend vào đúng ô; chạy sau render để fieldset đã hết `disabled`.
  useEffect(() => {
    const fields = FIELD_ORDER.filter((field) => serverFieldErrors[field])
    for (const field of fields) {
      setError(field, { type: 'server', message: serverFieldErrors[field] })
    }
    if (fields[0]) setFocus(fields[0])
  }, [serverFieldErrors, setError, setFocus])

  const onSubmit = handleSubmit((values) => {
    saveCourse.mutate(toCoursePayload(values), { onSuccess })
  })

  const isSubmitting = saveCourse.isPending
  const status = useWatch({ control, name: 'status' })
  const isEdit = Boolean(course)
  const submitLabel = isEdit
    ? { idle: 'Lưu thay đổi', busy: 'Đang lưu...' }
    : { idle: 'Tạo khoá học', busy: 'Đang tạo...' }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {saveCourse.isError && (
        <Alert variant="error" title={isEdit ? 'Chưa lưu được khoá học' : 'Chưa tạo được khoá học'}>
          {courseErrorMessage(
            saveCourse.error,
            FIELD_ORDER.flatMap((field) => serverFieldErrors[field] ?? []),
          )}
        </Alert>
      )}

      <p className={styles.requiredNote}>
        Các trường có dấu <span>*</span> là bắt buộc.
      </p>

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className="sr-only">Thông tin khoá học</legend>
        <TextField
          label="Tên khoá học"
          required
          maxLength={COURSE_NAME_MAX}
          placeholder="Vd. Phòng cháy chữa cháy cơ bản"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextareaField
          label="Mô tả"
          required
          rows={6}
          placeholder="Mục tiêu, đối tượng học viên, nội dung chính của khoá học…"
          error={errors.description?.message}
          {...register('description')}
        />
        <Controller
          control={control}
          name="instructorId"
          render={({ field, fieldState }) => (
            <InstructorPicker
              ref={field.ref}
              value={instructor}
              disabled={isSubmitting}
              error={fieldState.error?.message}
              onBlur={field.onBlur}
              onChange={(option) => {
                setInstructor(option)
                field.onChange(option?.id)
              }}
            />
          )}
        />
        <SelectField
          label="Trạng thái"
          required
          options={STATUS_OPTIONS}
          hint={status ? STATUS_HINTS[status] : undefined}
          error={errors.status?.message}
          fieldClassName={styles.statusField}
          {...register('status')}
        />
      </fieldset>

      <div className={styles.footer}>
        <ButtonLink to={cancelTo} variant="ghost">
          Huỷ
        </ButtonLink>
        <Button type="submit" variant="accent" loading={isSubmitting}>
          {isSubmitting ? submitLabel.busy : submitLabel.idle}
        </Button>
      </div>
    </form>
  )
}
