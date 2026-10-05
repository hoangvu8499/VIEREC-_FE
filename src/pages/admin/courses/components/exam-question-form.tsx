import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { RadioGroupField } from '@/components/form/radio-group-field'
import { TextareaField } from '@/components/form/textarea-field'
import { EXAM_OPTION_FIELDS, EXAM_OPTIONS, EXAM_RULES } from '@/constants/exam'
import { examFormErrorMessage, useSaveQuestion } from '@/pages/admin/courses/use-exam'
import { examQuestionApiFieldErrors } from '@/schemas/exam-api-errors'
import {
  examQuestionFormValues,
  examQuestionSchema,
  toExamQuestionPayload,
  type ExamQuestionField,
  type ExamQuestionFormInput,
  type ExamQuestionFormValues,
} from '@/schemas/exam-schema'
import type { ExamQuestion } from '@/types/exam'

import styles from './exam.module.css'

const FIELD_ORDER: ExamQuestionField[] = [
  'content',
  'optionA',
  'optionB',
  'optionC',
  'optionD',
  'correctOption',
]

const CORRECT_OPTIONS = EXAM_OPTIONS.map((option) => ({ value: option, label: option }))

interface ExamQuestionFormProps {
  courseId: number
  /** Có: sửa câu này. Không: thêm câu vào cuối bài thi. */
  question?: ExamQuestion
  onSaved: () => void
  onCancel: () => void
  /** Báo hộp thoại chứa form để chặn đóng khi đang lưu. */
  onBusyChange: (busy: boolean) => void
}

/** Câu hỏi, 4 đáp án A–D và đáp án đúng (đúng 1). */
export function ExamQuestionForm({
  courseId,
  question,
  onSaved,
  onCancel,
  onBusyChange,
}: ExamQuestionFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<ExamQuestionFormInput, unknown, ExamQuestionFormValues>({
    resolver: zodResolver(examQuestionSchema),
    mode: 'onTouched',
    defaultValues: examQuestionFormValues(question),
  })
  const save = useSaveQuestion(courseId, question?.id)

  useEffect(() => onBusyChange(save.isPending), [save.isPending, onBusyChange])

  const serverFieldErrors = useMemo(
    () => (save.error ? examQuestionApiFieldErrors(save.error) : {}),
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
    save.mutate(toExamQuestionPayload(values), { onSuccess: onSaved })
  })

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {save.isError && (
        <Alert variant="error" title="Chưa lưu được câu hỏi">
          {examFormErrorMessage(
            save.error,
            FIELD_ORDER.flatMap((field) => serverFieldErrors[field] ?? []),
            'Không lưu được câu hỏi. Vui lòng thử lại.',
          )}
        </Alert>
      )}

      <fieldset className={styles.fieldset} disabled={save.isPending}>
        <legend className="sr-only">Nội dung câu hỏi</legend>
        <TextareaField
          label="Câu hỏi"
          required
          rows={3}
          maxLength={EXAM_RULES.contentMax}
          error={errors.content?.message}
          {...register('content')}
        />
        {EXAM_OPTIONS.map((option) => {
          const field = EXAM_OPTION_FIELDS[option]
          return (
            <TextareaField
              key={option}
              label={`Đáp án ${option}`}
              required
              rows={1}
              className={styles.optionInput}
              maxLength={EXAM_RULES.optionMax}
              error={errors[field]?.message}
              {...register(field)}
            />
          )
        })}
        <RadioGroupField
          label="Đáp án đúng"
          required
          inline
          options={CORRECT_OPTIONS}
          error={errors.correctOption?.message}
          {...register('correctOption')}
        />
      </fieldset>

      <div className={styles.formActions}>
        <Button variant="ghost" disabled={save.isPending} onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" variant="accent" loading={save.isPending}>
          {question ? 'Lưu câu hỏi' : 'Thêm câu hỏi'}
        </Button>
      </div>
    </form>
  )
}
