import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { TextField } from '@/components/form/text-field'
import { EXAM_MAX_SCORE, EXAM_RULES } from '@/constants/exam'
import { examFormErrorMessage, useSaveExam } from '@/pages/admin/courses/use-exam'
import { examApiFieldErrors } from '@/schemas/exam-api-errors'
import {
  examFormValues,
  examSchema,
  toExamPayload,
  type ExamField,
  type ExamFormInput,
  type ExamFormValues,
} from '@/schemas/exam-schema'
import type { Exam } from '@/types/exam'

import styles from './exam.module.css'

/** Thứ tự ô trên form — lỗi server đầu tiên theo thứ tự này được focus. */
const FIELD_ORDER: ExamField[] = ['title', 'durationMinutes', 'passScore']

interface ExamSettingsFormProps {
  courseId: number
  courseName: string
  /** Có: đổi cài đặt bài thi này. Không: tạo bài thi. */
  exam?: Exam
  onSaved: (exam: Exam) => void
  /** Có thì hiện nút Huỷ. */
  onCancel?: () => void
  /** Form nằm trong hộp thoại: báo để chặn đóng khi đang lưu. */
  onBusyChange?: (busy: boolean) => void
}

/** Tên bài thi, thời gian làm bài, điểm đạt (thang 10). */
export function ExamSettingsForm({
  courseId,
  courseName,
  exam,
  onSaved,
  onCancel,
  onBusyChange,
}: ExamSettingsFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<ExamFormInput, unknown, ExamFormValues>({
    resolver: zodResolver(examSchema),
    mode: 'onTouched',
    defaultValues: examFormValues(exam, courseName),
  })
  const save = useSaveExam(courseId)

  useEffect(() => onBusyChange?.(save.isPending), [save.isPending, onBusyChange])

  const serverFieldErrors = useMemo(
    () => (save.error ? examApiFieldErrors(save.error) : {}),
    [save.error],
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
    save.mutate(toExamPayload(values), { onSuccess: onSaved })
  })

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {save.isError && (
        <Alert variant="error" title={exam ? 'Chưa lưu được cài đặt' : 'Chưa tạo được bài thi'}>
          {examFormErrorMessage(
            save.error,
            FIELD_ORDER.flatMap((field) => serverFieldErrors[field] ?? []),
            'Không lưu được bài thi. Vui lòng thử lại.',
          )}
        </Alert>
      )}

      <fieldset className={styles.fieldset} disabled={save.isPending}>
        <legend className="sr-only">Cài đặt bài thi</legend>
        <TextField
          label="Tên bài thi"
          required
          maxLength={EXAM_RULES.titleMax}
          error={errors.title?.message}
          {...register('title')}
        />
        <div className={styles.settingsRow}>
          <TextField
            label="Thời gian làm bài (phút)"
            required
            inputMode="numeric"
            maxLength={String(EXAM_RULES.durationMax).length}
            hint={`Từ ${EXAM_RULES.durationMin} đến ${EXAM_RULES.durationMax} phút`}
            error={errors.durationMinutes?.message}
            {...register('durationMinutes')}
          />
          <TextField
            label={`Điểm đạt (thang ${EXAM_MAX_SCORE})`}
            required
            inputMode="decimal"
            maxLength={5}
            hint="Vd. 5 hoặc 7,5"
            error={errors.passScore?.message}
            {...register('passScore')}
          />
        </div>
      </fieldset>

      <div className={styles.formActions}>
        {onCancel && (
          <Button variant="ghost" disabled={save.isPending} onClick={onCancel}>
            Huỷ
          </Button>
        )}
        <Button type="submit" variant="accent" loading={save.isPending}>
          {exam ? 'Lưu cài đặt' : 'Tạo bài thi'}
        </Button>
      </div>
    </form>
  )
}
