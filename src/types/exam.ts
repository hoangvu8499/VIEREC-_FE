/** Đáp án của câu trắc nghiệm (khớp enum `ExamOption` của backend). */
export type ExamOption = 'A' | 'B' | 'C' | 'D'

export interface ExamQuestion {
  id: number
  content: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: ExamOption
  /** Thứ tự trong bài thi; xoá câu thì có thể bị nhảy số → hiển thị theo vị trí trong danh sách. */
  sortOrder: number
}

/** Bài thi lấy chứng chỉ của một khoá (mỗi khoá tối đa 1 bài). Điểm thang 10. */
export interface Exam {
  id: number
  courseId: number
  title: string
  durationMinutes: number
  /** Điểm đạt, thang 10. */
  passScore: number
  questionCount: number
  questions: ExamQuestion[]
  createdAt: string
  updatedAt: string
}

/** `PUT /courses/{id}/exam`: tạo bài thi hoặc đổi cài đặt. */
export interface ExamPayload {
  title: string
  durationMinutes: number
  passScore: number
}

export type ExamQuestionPayload = Omit<ExamQuestion, 'id' | 'sortOrder'>

/** `APPEND`: thêm sau các câu đã có. `REPLACE`: xoá hết câu cũ rồi lấy câu trong file. */
export type ExamImportMode = 'APPEND' | 'REPLACE'

export interface ExamImportResult {
  importedCount: number
  exam: Exam
}

/** Câu hỏi khi học viên làm bài: không có đáp án đúng. */
export type ExamPaperQuestion = Omit<ExamQuestion, 'correctOption' | 'sortOrder'>

interface ExamAttemptBase {
  id: number
  startedAt: string
  deadlineAt: string
  /** Điểm đạt lúc bắt đầu thi, thang 10. */
  passScore: number
}

/** Đang làm bài. */
export interface ExamAttemptInProgress extends ExamAttemptBase {
  status: 'IN_PROGRESS'
  /** Số giây còn lại do server tính lúc trả về — đếm ngược từ đây, không so với giờ máy. */
  remainingSeconds: number
  questions: ExamPaperQuestion[]
}

/** Đã nộp (hoặc hết giờ mà không nộp) và đã chấm. */
export interface ExamAttemptResult extends ExamAttemptBase {
  status: 'SUBMITTED'
  submittedAt: string
  questionCount: number
  correctCount: number
  /** Thang 10, tối đa 2 chữ số thập phân. */
  score: number
  passed: boolean
}

export type ExamAttempt = ExamAttemptInProgress | ExamAttemptResult

/** `GET /courses/{id}/my-exam`: bài thi của khoá với học viên đang đăng nhập. */
export interface MyExam {
  courseId: number
  title: string
  durationMinutes: number
  passScore: number
  questionCount: number
  /** `null`: chưa bắt đầu thi. */
  attempt: ExamAttempt | null
}

/** Đáp án học viên chọn, theo id câu hỏi. */
export type ExamAnswers = Partial<Record<number, ExamOption>>

/** Một ô sai trong file Excel import (đã dịch sang tiếng Việt). */
export interface ExamImportRowError {
  /** Số dòng trong Excel (dòng 1 là tiêu đề). */
  row: number
  message: string
}
