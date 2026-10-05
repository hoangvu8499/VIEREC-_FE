import { z } from 'zod'

import { EXAM_MAX_SCORE, EXAM_OPTIONS, EXAM_RULES } from '@/constants/exam'
import type { Exam, ExamPayload, ExamQuestion, ExamQuestionPayload } from '@/types/exam'

const R = EXAM_RULES
const number = (value: number) => value.toLocaleString('vi-VN')

/** Thông báo lỗi từng field — dùng chung cho validate phía client và dịch lỗi từ backend. */
export const EXAM_FIELD_MESSAGES = {
  title: {
    required: 'Vui lòng nhập tên bài thi',
    tooLong: `Tên bài thi tối đa ${R.titleMax} ký tự`,
  },
  durationMinutes: {
    required: 'Vui lòng nhập thời gian làm bài',
    invalid: `Thời gian làm bài là số phút từ ${R.durationMin} đến ${R.durationMax}`,
  },
  passScore: {
    required: 'Vui lòng nhập điểm đạt',
    invalid: `Điểm đạt lớn hơn 0, tối đa ${EXAM_MAX_SCORE}, nhiều nhất 2 chữ số sau dấu phẩy`,
  },
} as const

const optionMessages = (option: string) => ({
  required: `Vui lòng nhập đáp án ${option}`,
  tooLong: `Đáp án tối đa ${number(R.optionMax)} ký tự`,
})

export const EXAM_QUESTION_FIELD_MESSAGES = {
  content: {
    required: 'Vui lòng nhập câu hỏi',
    tooLong: `Câu hỏi tối đa ${number(R.contentMax)} ký tự`,
  },
  optionA: optionMessages('A'),
  optionB: optionMessages('B'),
  optionC: optionMessages('C'),
  optionD: optionMessages('D'),
  correctOption: {
    required: 'Vui lòng chọn đáp án đúng',
    invalid: 'Đáp án đúng phải là A, B, C hoặc D',
  },
} as const

export type ExamField = keyof typeof EXAM_FIELD_MESSAGES
export type ExamQuestionField = keyof typeof EXAM_QUESTION_FIELD_MESSAGES

const E = EXAM_FIELD_MESSAGES
const Q = EXAM_QUESTION_FIELD_MESSAGES

function requiredText(messages: { required: string; tooLong: string }, max: number) {
  return z.string().trim().min(1, messages.required).max(max, messages.tooLong)
}

export const examSchema = z.object({
  title: requiredText(E.title, R.titleMax),
  // Ô số giữ dạng chuỗi (ô rỗng không thành NaN) rồi đổi sang number.
  durationMinutes: z
    .string()
    .trim()
    .min(1, { error: E.durationMinutes.required, abort: true })
    .regex(/^\d+$/, E.durationMinutes.invalid)
    .transform(Number)
    .pipe(
      z
        .number()
        .min(R.durationMin, E.durationMinutes.invalid)
        .max(R.durationMax, E.durationMinutes.invalid),
    ),
  // Nhận cả "7,5" và "7.5".
  passScore: z
    .string()
    .trim()
    .min(1, { error: E.passScore.required, abort: true })
    .transform((value) => value.replace(',', '.'))
    .pipe(z.string().regex(/^\d{1,2}(\.\d{1,2})?$/, E.passScore.invalid))
    .transform(Number)
    .pipe(z.number().gt(0, E.passScore.invalid).max(EXAM_MAX_SCORE, E.passScore.invalid)),
})

export type ExamFormInput = z.input<typeof examSchema>
export type ExamFormValues = z.output<typeof examSchema>

/** Tạo mới: tên gợi ý theo khoá, 30 phút, đạt 5/10. Sửa: lấy từ bài thi. */
export function examFormValues(exam: Exam | undefined, courseName: string): ExamFormInput {
  return {
    title: exam?.title ?? `Bài thi chứng chỉ – ${courseName}`.slice(0, R.titleMax),
    durationMinutes: String(exam?.durationMinutes ?? 30),
    passScore: (exam?.passScore ?? 5).toLocaleString('vi-VN', { maximumFractionDigits: 2 }),
  }
}

export function toExamPayload(values: ExamFormValues): ExamPayload {
  return values
}

export const examQuestionSchema = z.object({
  content: requiredText(Q.content, R.contentMax),
  optionA: requiredText(Q.optionA, R.optionMax),
  optionB: requiredText(Q.optionB, R.optionMax),
  optionC: requiredText(Q.optionC, R.optionMax),
  optionD: requiredText(Q.optionD, R.optionMax),
  correctOption: z.enum(EXAM_OPTIONS, Q.correctOption.required),
})

export type ExamQuestionFormInput = z.input<typeof examQuestionSchema>
export type ExamQuestionFormValues = z.output<typeof examQuestionSchema>

/** Thêm mới: để trống, chưa chọn đáp án đúng. Sửa: lấy từ câu hỏi. */
export function examQuestionFormValues(question?: ExamQuestion): Partial<ExamQuestionFormInput> {
  return {
    content: question?.content ?? '',
    optionA: question?.optionA ?? '',
    optionB: question?.optionB ?? '',
    optionC: question?.optionC ?? '',
    optionD: question?.optionD ?? '',
    correctOption: question?.correctOption,
  }
}

export function toExamQuestionPayload(values: ExamQuestionFormValues): ExamQuestionPayload {
  return values
}
