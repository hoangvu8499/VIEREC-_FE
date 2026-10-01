export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

/**
 * `PENDING`: đã báo chuyển khoản, chờ admin duyệt (chưa được học). Admin duyệt → `ENROLLED`, từ chối → `CANCELLED`.
 * Huỷ ghi danh không xoá dòng mà chuyển `CANCELLED`; đăng ký lại thì về `PENDING`.
 */
export type EnrollmentStatus = 'PENDING' | 'ENROLLED' | 'COMPLETED' | 'CANCELLED'

/** Một dòng của `GET /courses` (phẳng, khớp bảng). */
export interface Course {
  id: number
  name: string
  description: string
  status: CourseStatus
  instructorId: number
  instructorUsername: string
  /** Họ + tên, backend ghép sẵn. */
  instructorName: string
  createdByUsername: string
  lessonCount: number
  /** Trạng thái ghi danh của người đang xem; `null` khi chưa ghi danh hoặc chưa đăng nhập. */
  myEnrollmentStatus: EnrollmentStatus | null
  /** ISO 8601, giờ server (không kèm múi giờ). */
  createdAt: string
  updatedAt: string
}

export interface CourseSearchParams {
  /** Bắt đầu từ 0. Backend cố định 10 khoá/trang, mới nhất trước. */
  page?: number
  /** Một phần tên khoá học. */
  keyword?: string
  /** Chỉ admin lọc được; người khác luôn chỉ thấy PUBLISHED. */
  status?: CourseStatus
}

/** Body `POST /courses` và `PUT /courses/{id}` — tất cả bắt buộc. */
export interface CoursePayload {
  name: string
  description: string
  /** Id của một user đang ACTIVE (backend không có role giảng viên riêng). */
  instructorId: number
  status: CourseStatus
}

/**
 * Form multipart của bài học. Tạo (`POST /courses/{courseId}/lessons`): bắt buộc tài liệu; video tuỳ chọn
 * (file, link, cả hai hoặc không). Sửa (`PUT .../lessons/{lessonId}`): file không gửi thì giữ file cũ.
 */
export interface LessonPayload {
  title: string
  instructions: string
  /** ≥ 1, không trùng với bài khác trong khoá (bài đang sửa giữ số của mình được). */
  sortOrder: number
  documentFile?: File
  videoFile?: File
  /** Link video ở hệ thống khác (http/https). Khi sửa: rỗng = xoá link → luôn gửi giá trị hiện tại. */
  videoUrl?: string
  /** Chỉ khi sửa: gỡ video đã upload (bỏ qua nếu có `videoFile` mới). */
  removeVideo?: boolean
}

export type LessonFileType = 'DOCUMENT' | 'VIDEO'

export interface LessonFile {
  fileId: number
  fileType: LessonFileType
  originalName: string
  contentType: string
  sizeBytes: number
  /** Đường dẫn API (vd. `/api/v1/files/1`) — mở bằng `apiFileUrl()`, cần cookie đăng nhập. */
  url: string
  sortOrder: number
}

export interface Lesson {
  id: number
  courseId: number
  title: string
  instructions: string
  sortOrder: number
  documentUrl: string
  /** Link video ở hệ thống khác (YouTube, Drive...), `null` nếu không có. */
  videoUrl: string | null
  /** Tài liệu luôn có; video upload có thể không có. */
  files: LessonFile[]
  createdAt: string
  updatedAt: string
}

/** `GET /courses/{id}`: khoá học + bài học (đã xếp theo `sortOrder`, bỏ bài đã xoá). */
export interface CourseDetail extends Omit<Course, 'lessonCount'> {
  lessons: Lesson[]
}

export type { FlashState as CourseFlashState } from '@/types/navigation'

/** Một lượt ghi danh (`GET /auth/me/enrollments`, `GET /courses/{id}/enrollments`). */
export interface Enrollment {
  id: number
  courseId: number
  courseName: string
  courseDescription: string
  instructorName: string
  lessonCount: number
  /** Học viên. */
  userId: number
  username: string
  /** Họ + tên học viên, backend ghép sẵn. */
  fullName: string
  status: EnrollmentStatus
  /** Ghi danh lại sau khi huỷ thì tính lại từ lúc đó. */
  enrolledAt: string
  completedAt: string | null
}

export interface EnrollmentSearchParams {
  /** Bỏ trống: PENDING + ENROLLED + COMPLETED (CANCELLED chỉ trả khi lọc riêng). Riêng trang admin: mọi trạng thái. */
  status?: EnrollmentStatus
  page?: number
  size?: number
}

/** `GET /enrollments` (admin, mọi khoá). */
export interface EnrollmentAdminSearchParams extends EnrollmentSearchParams {
  /** Khớp username, họ tên, SĐT hoặc tên khoá. */
  keyword?: string
}

/** Chứng chỉ; họ tên / ngày sinh / CCCD / tên khoá là bản chụp lúc cấp. */
export interface Certificate {
  id: number
  /** Mã tra cứu công khai, vd. `VRC-2026-7K3QX9PA`. */
  code: string
  enrollmentId: number
  courseId: number
  courseName: string
  fullName: string
  /** `YYYY-MM-DD`, có thể thiếu nếu lúc cấp chưa có. */
  dateOfBirth: string | null
  cccd: string | null
  issuedAt: string
  /** PDF — chỉ chủ chứng chỉ và admin tải được. */
  fileUrl: string
}

/** `GET /certificates/{code}` — công khai, không có ngày sinh / file, CCCD bị che. */
export interface CertificateVerification {
  code: string
  courseName: string
  fullName: string
  issuedAt: string
  /** 4 số đầu + 2 số cuối, vd. `0990******01`; `null` nếu lúc cấp không có CCCD. */
  cccdMasked: string | null
}
