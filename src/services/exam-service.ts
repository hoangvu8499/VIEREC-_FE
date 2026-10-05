import { http } from '@/services/http'
import type { ApiResponse } from '@/types/api'
import type {
  Exam,
  ExamAnswers,
  ExamImportMode,
  ExamImportResult,
  ExamPayload,
  ExamQuestion,
  ExamQuestionPayload,
  MyExam,
} from '@/types/exam'

/** Bài thi lấy chứng chỉ của khoá học — chỉ SUPER_ADMIN / ADMIN (kèm đáp án đúng). */
export const examService = {
  /** Khoá chưa có bài thi → 404 `EXAM_NOT_FOUND`. */
  async get(courseId: number): Promise<Exam> {
    const { data } = await http.get<ApiResponse<Exam>>(`/courses/${courseId}/exam`)
    return data.data
  },

  /** Tạo bài thi (chưa có) hoặc đổi cài đặt. */
  async save(courseId: number, payload: ExamPayload): Promise<Exam> {
    const { data } = await http.put<ApiResponse<Exam>>(`/courses/${courseId}/exam`, payload)
    return data.data
  },

  /** Thêm câu vào cuối bài thi. */
  async addQuestion(courseId: number, payload: ExamQuestionPayload): Promise<ExamQuestion> {
    const { data } = await http.post<ApiResponse<ExamQuestion>>(
      `/courses/${courseId}/exam/questions`,
      payload,
    )
    return data.data
  },

  async updateQuestion(
    courseId: number,
    questionId: number,
    payload: ExamQuestionPayload,
  ): Promise<ExamQuestion> {
    const { data } = await http.put<ApiResponse<ExamQuestion>>(
      `/courses/${courseId}/exam/questions/${questionId}`,
      payload,
    )
    return data.data
  },

  async removeQuestion(courseId: number, questionId: number): Promise<void> {
    await http.delete(`/courses/${courseId}/exam/questions/${questionId}`)
  },

  /**
   * Import từ Excel, được cả hoặc không gì cả: có dòng sai → 400 `EXAM_IMPORT_INVALID_ROWS`,
   * `fieldErrors` dạng `rows[<dòng Excel>].<field>`.
   */
  async importQuestions(
    courseId: number,
    file: File,
    mode: ExamImportMode,
  ): Promise<ExamImportResult> {
    const form = new FormData()
    form.append('file', file)
    form.append('mode', mode)
    const { data } = await http.post<ApiResponse<ExamImportResult>>(
      `/courses/${courseId}/exam/questions/import`,
      form,
      // Instance mặc định là JSON — axios sẽ đổi FormData thành JSON nếu không ghi đè.
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data.data
  },
}

/**
 * Học viên làm bài thi của khoá (chỉ học viên đã được duyệt, thi 1 lần). Không bao giờ có đáp án đúng:
 * server chấm khi nộp.
 */
export const myExamService = {
  /** Khoá chưa có bài thi → 404 `EXAM_NOT_FOUND`; chưa được duyệt → 403 `EXAM_NOT_ALLOWED`. */
  async get(courseId: number): Promise<MyExam> {
    const { data } = await http.get<ApiResponse<MyExam>>(`/courses/${courseId}/my-exam`)
    return data.data
  },

  /** Bắt đầu tính giờ. Đã bắt đầu rồi thì trả lượt thi hiện tại (không tính lại giờ). */
  async start(courseId: number): Promise<MyExam> {
    const { data } = await http.post<ApiResponse<MyExam>>(`/courses/${courseId}/my-exam/start`)
    return data.data
  },

  /** Nộp bài: chỉ gửi câu đã trả lời. Nộp trễ quá 1 phút sau hạn thì không câu nào được tính. */
  async submit(courseId: number, answers: ExamAnswers): Promise<MyExam> {
    const { data } = await http.post<ApiResponse<MyExam>>(`/courses/${courseId}/my-exam/submit`, {
      answers: Object.entries(answers).flatMap(([questionId, selectedOption]) =>
        selectedOption ? [{ questionId: Number(questionId), selectedOption }] : [],
      ),
    })
    return data.data
  },
}
