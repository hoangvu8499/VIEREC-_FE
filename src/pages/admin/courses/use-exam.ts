import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { EXAM_QUERY_KEYS, EXAM_RULES } from '@/constants/exam'
import { COURSE_GONE } from '@/pages/admin/courses/use-course-mutations'
import { examService } from '@/services/exam-service'
import type { ApiError } from '@/types/api'
import type {
  Exam,
  ExamImportMode,
  ExamImportResult,
  ExamPayload,
  ExamQuestion,
  ExamQuestionPayload,
} from '@/types/exam'
import { apiErrorMessage } from '@/utils/api-error-message'
import { formatFileSize } from '@/utils/format-file-size'

const INVALID_FIELDS =
  'Một số thông tin chưa hợp lệ. Vui lòng kiểm tra lại các ô được đánh dấu bên dưới.'
const NO_PERMISSION = 'Tài khoản của bạn không có quyền quản lý bài thi.'
export const EXAM_GONE = 'Khoá học chưa có bài thi hoặc bài thi đã bị xoá. Vui lòng tải lại trang.'
const QUESTION_GONE = 'Câu hỏi không còn tồn tại (có thể vừa bị xoá). Vui lòng tải lại trang.'

/** `GET /courses/{id}/exam`. Khoá chưa có bài thi → lỗi `EXAM_NOT_FOUND` (trang hiện form tạo). */
export function useExam(courseId: number | undefined) {
  return useQuery<Exam, ApiError>({
    queryKey: EXAM_QUERY_KEYS.detail(courseId ?? 0),
    queryFn: () => examService.get(courseId ?? 0),
    enabled: courseId !== undefined,
    retry: (count, error) =>
      error.code !== API_ERROR_CODES.EXAM_NOT_FOUND &&
      error.code !== API_ERROR_CODES.COURSE_NOT_FOUND &&
      count < 1,
  })
}

/** Backend trả lại bài thi đầy đủ → ghi thẳng vào cache, không cần tải lại. */
function useSetExam(courseId: number) {
  const queryClient = useQueryClient()
  return (exam: Exam) => queryClient.setQueryData(EXAM_QUERY_KEYS.detail(courseId), exam)
}

function useRefetchExam(courseId: number) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.detail(courseId) })
}

/** Tạo bài thi hoặc đổi cài đặt. */
export function useSaveExam(courseId: number) {
  const setExam = useSetExam(courseId)
  return useMutation<Exam, ApiError, ExamPayload>({
    mutationFn: (payload) => examService.save(courseId, payload),
    onSuccess: setExam,
  })
}

/** Thêm (không có `questionId`) hoặc sửa câu hỏi. */
export function useSaveQuestion(courseId: number, questionId?: number) {
  const refetch = useRefetchExam(courseId)
  return useMutation<ExamQuestion, ApiError, ExamQuestionPayload>({
    mutationFn: (payload) =>
      questionId
        ? examService.updateQuestion(courseId, questionId, payload)
        : examService.addQuestion(courseId, payload),
    onSuccess: refetch,
  })
}

export function useDeleteQuestion(courseId: number) {
  const refetch = useRefetchExam(courseId)
  return useMutation<void, ApiError, ExamQuestion>({
    mutationFn: (question) => examService.removeQuestion(courseId, question.id),
    onSuccess: refetch,
  })
}

export function useImportQuestions(courseId: number) {
  const setExam = useSetExam(courseId)
  return useMutation<ExamImportResult, ApiError, { file: File; mode: ExamImportMode }>({
    mutationFn: ({ file, mode }) => examService.importQuestions(courseId, file, mode),
    onSuccess: (result) => setExam(result.exam),
  })
}

/** Lỗi chung của bài thi / câu hỏi (không theo field). */
function commonMessage(error: ApiError, fallback: string): string {
  switch (error.code) {
    case API_ERROR_CODES.COURSE_NOT_FOUND:
      return COURSE_GONE
    case API_ERROR_CODES.EXAM_NOT_FOUND:
      return EXAM_GONE
    case API_ERROR_CODES.EXAM_QUESTION_NOT_FOUND:
      return QUESTION_GONE
    default:
      return apiErrorMessage(error, { fallback, byStatus: { 403: NO_PERMISSION } })
  }
}

/**
 * Thông báo trong Alert đầu form (cài đặt bài thi / câu hỏi).
 * @param fieldMessages lỗi đã gắn vào từng ô.
 */
export function examFormErrorMessage(
  error: ApiError,
  fieldMessages: string[],
  fallback: string,
): string {
  if (fieldMessages.length === 1) return fieldMessages[0] ?? ''
  if (fieldMessages.length > 1) return INVALID_FIELDS
  return commonMessage(error, fallback)
}

export function deleteQuestionErrorMessage(error: ApiError): string {
  return commonMessage(error, 'Không xoá được câu hỏi. Vui lòng thử lại.')
}

/** Lỗi import không gắn với dòng nào (dòng sai hiện riêng bằng `examImportRowErrors`). */
export function importErrorMessage(error: ApiError): string {
  switch (error.code) {
    case API_ERROR_CODES.EXAM_IMPORT_INVALID_ROWS:
      return 'File có dòng chưa hợp lệ nên chưa câu nào được lưu. Sửa các dòng dưới đây rồi import lại.'
    case API_ERROR_CODES.EXAM_IMPORT_UNREADABLE:
      return 'Không đọc được file. Hãy lưu lại đúng định dạng Excel (.xlsx), không đặt mật khẩu, rồi thử lại.'
    case API_ERROR_CODES.EXAM_IMPORT_EMPTY:
      return 'File chưa có câu hỏi nào. Nhập câu hỏi từ dòng 2 của sheet “Câu hỏi”.'
    case API_ERROR_CODES.EXAM_IMPORT_TOO_MANY_ROWS:
      return `Mỗi file tối đa ${EXAM_RULES.importMaxQuestions} câu. Hãy chia thành nhiều file và chọn “Thêm vào cuối”.`
    case API_ERROR_CODES.FILE_TYPE_NOT_ALLOWED:
      return 'Chỉ nhận file Excel .xlsx hoặc .xls.'
    case API_ERROR_CODES.FILE_TOO_LARGE:
      return `File tối đa ${formatFileSize(EXAM_RULES.importMaxBytes)}.`
    default:
      return commonMessage(error, 'Không import được file. Vui lòng thử lại.')
  }
}
