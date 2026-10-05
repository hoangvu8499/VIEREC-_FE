import type { PageResponse } from '@/types/api'

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
  /** Học phí (VND). Khoá tạo trước khi có giá: 100.000. */
  price: number
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
  /** Bỏ các khoá người đang đăng nhập đã được duyệt / đã hoàn thành (khoá chờ duyệt vẫn hiện). */
  excludeLearning?: boolean
}

/** Body `POST /courses` và `PUT /courses/{id}` — tất cả bắt buộc. */
export interface CoursePayload {
  name: string
  description: string
  /** Id của một user đang ACTIVE (backend không có role giảng viên riêng). */
  instructorId: number
  /** VND, từ 1.000 đến 1.000.000.000. */
  price: number
  status: CourseStatus
}

/**
 * Form multipart của bài học. Tạo (`POST /courses/{courseId}/lessons`): bắt buộc tài liệu; video là link YouTube
 * tuỳ chọn. Sửa (`PUT .../lessons/{lessonId}`): không gửi tài liệu thì giữ tài liệu cũ.
 */
export interface LessonPayload {
  title: string
  instructions: string
  /** ≥ 1, không trùng với bài khác trong khoá (bài đang sửa giữ số của mình được). */
  sortOrder: number
  documentFile?: File
  /** Link YouTube. Khi sửa: rỗng = xoá link → luôn gửi giá trị hiện tại. */
  videoUrl?: string
  /** Chỉ khi sửa: gỡ file video upload từ trước khi chuyển sang chỉ dùng YouTube. */
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
  /** Doanh nghiệp của học viên (doanh nghiệp ghi danh hộ); thiếu = học viên tự do. */
  businessName?: string
  status: EnrollmentStatus
  /** Số tiền học viên phải chuyển (VND): giá khoá lúc gửi yêu cầu, đổi giá khoá sau đó không ảnh hưởng. */
  price: number
  /** Ghi danh lại sau khi huỷ thì tính lại từ lúc đó. */
  enrolledAt: string
  /** Lúc admin duyệt vào học; `null` khi đang chờ duyệt hoặc đã huỷ. Doanh thu tính theo ngày này. */
  approvedAt: string | null
  completedAt: string | null
}

/** Một kỳ của `GET /enrollments/revenue`: từ `from` (`YYYY-MM-DD`) đến hôm nay. */
export interface RevenuePeriod {
  from: string
  /** Tổng học phí (VND) của các lượt đã duyệt (đang học / hoàn thành). */
  amount: number
  enrollments: number
}

/** Tuần tính từ thứ Hai. */
export interface RevenueSummary {
  week: RevenuePeriod
  month: RevenuePeriod
  year: RevenuePeriod
}

/** Doanh thu một khoá trong tháng. */
export interface CourseRevenue {
  courseId: number
  courseName: string
  amount: number
  enrollments: number
}

/** `GET /enrollments/revenue/monthly`: chỉ lượt ENROLLED / COMPLETED, theo ngày duyệt. */
export interface MonthlyRevenue {
  /** Ngày đầu tháng, `2026-10-01`. */
  from: string
  /** Ngày cuối tháng. */
  to: string
  /** Tổng cả tháng, không theo từ khoá. */
  amount: number
  enrollments: number
  /** Cả tháng, khoá thu nhiều nhất trước. */
  courses: CourseRevenue[]
  /** Tổng các khoản khớp từ khoá (bằng `amount` khi không lọc). */
  matchedAmount: number
  /** Khoản thu khớp từ khoá, duyệt gần nhất trước. */
  items: PageResponse<Enrollment>
}

export interface MonthlyRevenueParams {
  /** `yyyy-MM`; bỏ trống là tháng hiện tại. */
  month?: string
  /** Khớp username, họ tên, SĐT học viên hoặc tên khoá. */
  keyword?: string
  page?: number
  size?: number
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
  /** Học viên sở hữu chứng chỉ. */
  userId: number
  fullName: string
  /** `YYYY-MM-DD`, có thể thiếu nếu lúc cấp chưa có. */
  dateOfBirth: string | null
  cccd: string | null
  issuedAt: string
  /** PDF — chủ chứng chỉ, người quản lý doanh nghiệp của họ và admin tải được. */
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
