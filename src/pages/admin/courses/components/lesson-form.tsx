import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Film } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { ButtonLink } from '@/components/common/button-link'
import { CheckboxField } from '@/components/form/checkbox-field'
import { FileField } from '@/components/form/file-field'
import { TextField } from '@/components/form/text-field'
import { TextareaField } from '@/components/form/textarea-field'
import { lessonErrorMessage, useSaveLesson } from '@/pages/admin/courses/use-course-mutations'
import { lessonApiFieldErrors } from '@/schemas/course-api-errors'
import {
  LESSON_FILE_ACCEPT,
  LESSON_FILE_HINTS,
  LESSON_TITLE_MAX,
  lessonFormValues,
  lessonSchema,
  lessonUpdateSchema,
  SORT_ORDER_MAX,
  VIDEO_URL_MAX,
  toLessonPayload,
  type LessonField,
  type LessonFormInput,
  type LessonFormValues,
} from '@/schemas/course-schema'
import type { Lesson, LessonFileType } from '@/types/course'
import { formatFileSize } from '@/utils/format-file-size'

import styles from './lesson-form.module.css'

/** Thứ tự ô trên form — lỗi server đầu tiên theo thứ tự này được focus. */
const FIELD_ORDER: LessonField[] = [
  'title',
  'sortOrder',
  'instructions',
  'documentFile',
  'videoFile',
  'videoUrl',
]

interface LessonFormProps {
  courseId: number
  /** Có: sửa bài này (file để trống = giữ file cũ). Không: tạo bài mới. */
  lesson?: Lesson
  /** Tạo mới: thứ tự gợi ý. */
  defaultSortOrder?: number
  /** Link của nút Huỷ. */
  cancelTo: string
  onSuccess: (lesson: Lesson) => void
}

/** Gợi ý dưới ô file khi sửa: file hiện tại sẽ được giữ nếu không chọn file mới. */
function keepFileHint(lesson: Lesson | undefined, type: LessonFileType, rules: string): string {
  const current = lesson?.files.find((file) => file.fileType === type)
  if (!current) return rules
  return `Đang dùng: ${current.originalName} (${formatFileSize(current.sizeBytes)}). Để trống để giữ file này · ${rules}`
}

export function LessonForm({
  courseId,
  lesson,
  defaultSortOrder,
  cancelTo,
  onSuccess,
}: LessonFormProps) {
  const isEdit = Boolean(lesson)
  const {
    register,
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<LessonFormInput, unknown, LessonFormValues>({
    resolver: zodResolver(isEdit ? lessonUpdateSchema : lessonSchema),
    mode: 'onTouched',
    defaultValues: lessonFormValues(lesson, defaultSortOrder),
  })
  const { mutation: saveLesson, progress } = useSaveLesson(courseId, lesson?.id)

  const serverFieldErrors = useMemo(
    () => (saveLesson.error ? lessonApiFieldErrors(saveLesson.error) : {}),
    [saveLesson.error],
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
    saveLesson.mutate(toLessonPayload(values), { onSuccess })
  })

  const isSubmitting = saveLesson.isPending
  const currentVideo = lesson?.files.find((file) => file.fileType === 'VIDEO')
  const newVideo = useWatch({ control, name: 'videoFile' })
  const submitLabel = isEdit
    ? { idle: 'Lưu thay đổi', busy: 'Đang lưu...' }
    : { idle: 'Tạo bài học', busy: 'Đang tạo...' }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {saveLesson.isError && (
        <Alert variant="error" title={isEdit ? 'Chưa lưu được bài học' : 'Chưa tạo được bài học'}>
          {lessonErrorMessage(
            saveLesson.error,
            FIELD_ORDER.flatMap((field) => serverFieldErrors[field] ?? []),
          )}
        </Alert>
      )}

      <p className={styles.requiredNote}>
        Các trường có dấu <span>*</span> là bắt buộc.
      </p>

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className={styles.legend}>Nội dung bài học</legend>
        <div className={styles.titleRow}>
          <TextField
            label="Tên bài học"
            required
            maxLength={LESSON_TITLE_MAX}
            placeholder="Vd. Bài 1: Nhận biết nguy cơ cháy nổ"
            error={errors.title?.message}
            {...register('title')}
          />
          <TextField
            label="Thứ tự"
            required
            inputMode="numeric"
            maxLength={String(SORT_ORDER_MAX).length}
            hint="Không trùng bài khác"
            error={errors.sortOrder?.message}
            {...register('sortOrder')}
          />
        </div>
        <TextareaField
          label="Hướng dẫn học"
          required
          rows={5}
          placeholder="Vd. Đọc tài liệu trước, sau đó xem hết video và ghi chú các bước xử lý."
          error={errors.instructions?.message}
          {...register('instructions')}
        />
      </fieldset>

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className={styles.legend}>Tài liệu</legend>
        <Controller
          control={control}
          name="documentFile"
          render={({ field, fieldState }) => (
            <FileField
              ref={field.ref}
              name={field.name}
              label={isEdit ? 'Thay tài liệu' : 'Tài liệu'}
              required={!isEdit}
              icon={FileText}
              accept={LESSON_FILE_ACCEPT.document}
              hint={keepFileHint(lesson, 'DOCUMENT', LESSON_FILE_HINTS.document)}
              value={field.value as File | undefined}
              disabled={isSubmitting}
              error={fieldState.error?.message}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </fieldset>

      <fieldset className={styles.fieldset} disabled={isSubmitting}>
        <legend className={styles.legend}>
          Video bài giảng <span className={styles.optional}>(không bắt buộc)</span>
        </legend>
        <p className={styles.sectionNote}>
          Tải file video lên, dán link video ở hệ thống khác (YouTube, Google Drive…), hoặc cả hai.
        </p>
        <div className={styles.files}>
          <Controller
            control={control}
            name="videoFile"
            render={({ field, fieldState }) => (
              <FileField
                ref={field.ref}
                name={field.name}
                label={isEdit && currentVideo ? 'Thay file video' : 'File video'}
                icon={Film}
                accept={LESSON_FILE_ACCEPT.video}
                hint={keepFileHint(lesson, 'VIDEO', LESSON_FILE_HINTS.video)}
                value={field.value as File | undefined}
                disabled={isSubmitting}
                error={fieldState.error?.message}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <TextField
            label="Link video"
            type="url"
            inputMode="url"
            maxLength={VIDEO_URL_MAX}
            placeholder="https://www.youtube.com/watch?v=…"
            hint={
              lesson?.videoUrl ? 'Xoá trống ô này để bỏ link hiện tại' : 'Để trống nếu không có'
            }
            error={errors.videoUrl?.message}
            {...register('videoUrl')}
          />
        </div>
        {currentVideo && (
          <CheckboxField
            label={`Gỡ file video hiện tại (${currentVideo.originalName})`}
            hint={
              newVideo
                ? 'Không cần: file video mới sẽ thay file hiện tại.'
                : 'Bài học sẽ không còn file video tải lên (link video, nếu có, vẫn giữ).'
            }
            disabled={Boolean(newVideo)}
            {...register('removeVideo')}
          />
        )}
      </fieldset>

      {isSubmitting && (
        <div className={styles.progress}>
          <div className={styles.progressLabel}>
            <span>{progress < 100 ? 'Đang gửi dữ liệu…' : 'Đã gửi xong, máy chủ đang xử lý…'}</span>
            <strong>{progress}%</strong>
          </div>
          <progress
            className={styles.progressBar}
            max={100}
            value={progress}
            aria-label="Tiến độ tải lên"
          />
          <p className={styles.progressNote}>Video lớn có thể mất vài phút. Đừng đóng trang này.</p>
        </div>
      )}

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
