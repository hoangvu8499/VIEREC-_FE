import type { ExamImportMode, ExamOption } from '@/types/exam'

/** Thứ tự đáp án trên giao diện và trong file Excel. */
export const EXAM_OPTIONS = ['A', 'B', 'C', 'D'] as const satisfies readonly ExamOption[]

/** Field của câu hỏi chứa nội dung từng đáp án. */
export const EXAM_OPTION_FIELDS = {
  A: 'optionA',
  B: 'optionB',
  C: 'optionC',
  D: 'optionD',
} as const satisfies Record<ExamOption, string>

/** Sửa câu hỏi / import xong thì invalidate `EXAM_QUERY_KEYS.detail`. */
export const EXAM_QUERY_KEYS = {
  detail: (courseId: number) => ['exams', courseId],
  /** Bài thi của học viên đang đăng nhập (không kèm đáp án) — khác tiền tố với `detail` của admin. */
  mine: (courseId: number) => ['my-exam', courseId],
} as const

/** Thang điểm của bài thi. */
export const EXAM_MAX_SCORE = 10

/** Giới hạn khớp `ExamRequest`, `ExamQuestionRequest`, `ExamQuestionWorkbook` của backend. */
export const EXAM_RULES = {
  titleMax: 200,
  durationMin: 1,
  durationMax: 300,
  contentMax: 5000,
  optionMax: 1000,
  importMaxQuestions: 500,
  importMaxBytes: 5 * 1024 * 1024,
  importExtensions: ['xlsx', 'xls'],
} as const

export const EXAM_IMPORT_MODES = [
  {
    value: 'APPEND',
    label: 'Thêm vào cuối',
    hint: 'Giữ các câu đang có, thêm câu trong file vào sau.',
  },
  {
    value: 'REPLACE',
    label: 'Thay toàn bộ',
    hint: 'Xoá hết câu đang có, bài thi chỉ còn các câu trong file.',
  },
] as const satisfies readonly { value: ExamImportMode; label: string; hint: string }[]

/** File Excel mẫu (backend sinh, cần đăng nhập admin). */
export const EXAM_TEMPLATE_PATH = '/api/v1/exams/question-template'
