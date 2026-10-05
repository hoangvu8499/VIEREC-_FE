import { EXAM_RULES } from '@/constants/exam'
import { fieldErrors } from '@/schemas/course-api-errors'
import {
  EXAM_FIELD_MESSAGES,
  EXAM_QUESTION_FIELD_MESSAGES,
  type ExamField,
  type ExamQuestionField,
} from '@/schemas/exam-schema'
import type { ApiError } from '@/types/api'
import type { ExamImportRowError } from '@/types/exam'

/** Lỗi `PUT /courses/{id}/exam` → lỗi theo field của form cài đặt bài thi. */
export function examApiFieldErrors(error: ApiError): Partial<Record<ExamField, string>> {
  return fieldErrors<ExamField>(error, EXAM_FIELD_MESSAGES)
}

/** Lỗi thêm / sửa câu hỏi → lỗi theo field của form câu hỏi. */
export function examQuestionApiFieldErrors(
  error: ApiError,
): Partial<Record<ExamQuestionField, string>> {
  return fieldErrors<ExamQuestionField>(error, EXAM_QUESTION_FIELD_MESSAGES)
}

const COLUMN_LABELS: Record<string, string> = {
  content: 'Câu hỏi',
  optionA: 'Đáp án A',
  optionB: 'Đáp án B',
  optionC: 'Đáp án C',
  optionD: 'Đáp án D',
  correctOption: 'Đáp án đúng',
}

const ROW_FIELD = /^rows\[(\d+)\]\.(\w+)$/

/** Lý do một ô sai, suy từ giá trị bị từ chối (backend chỉ có 2 luật: bắt buộc và độ dài / A–D). */
function cellProblem(field: string, rejected: unknown): string {
  const label = COLUMN_LABELS[field] ?? field
  const value = typeof rejected === 'string' ? rejected : ''
  if (value === '') return `${label} đang để trống`
  if (field === 'correctOption') return `${label} “${value}” không hợp lệ (chỉ nhận A, B, C, D)`
  const max = field === 'content' ? EXAM_RULES.contentMax : EXAM_RULES.optionMax
  return `${label} dài quá ${max.toLocaleString('vi-VN')} ký tự`
}

/**
 * 400 `EXAM_IMPORT_INVALID_ROWS` → mỗi dòng Excel sai một mục (theo thứ tự dòng),
 * gộp các ô sai của cùng dòng.
 */
export function examImportRowErrors(error: ApiError): ExamImportRowError[] {
  const problems = new Map<number, string[]>()
  for (const { field, rejectedValue } of error.fieldErrors ?? []) {
    const match = ROW_FIELD.exec(field)
    if (!match?.[1] || !match[2]) continue
    const row = Number(match[1])
    problems.set(row, [...(problems.get(row) ?? []), cellProblem(match[2], rejectedValue)])
  }
  return [...problems.entries()]
    .sort(([a], [b]) => a - b)
    .map(([row, messages]) => ({ row, message: messages.join('; ') }))
}
