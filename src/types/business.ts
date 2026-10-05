import type { Enrollment, EnrollmentStatus } from '@/types/course'
import type { UserStatus } from '@/types/user'

/** `INACTIVE`: người quản lý không dùng được chức năng doanh nghiệp, học viên vẫn học bình thường. */
export type BusinessStatus = 'ACTIVE' | 'INACTIVE'

/** Khách hàng doanh nghiệp. */
export interface Business {
  id: number
  name: string
  /** Mã số thuế: 10 số, hoặc 10 số-3 số (chi nhánh). */
  taxCode: string
  address: string
  phoneNumber: string
  email: string
  status: BusinessStatus
  /** Số tài khoản quản lý (role BUSINESS). */
  managerCount: number
  /** Số học viên của doanh nghiệp. */
  memberCount: number
  createdAt: string
  updatedAt: string
}

/** Body `PUT /businesses/{id}`. */
export interface BusinessPayload {
  name: string
  taxCode: string
  address: string
  phoneNumber: string
  email: string
  status?: BusinessStatus
}

/** Tài khoản quản lý doanh nghiệp: như đăng ký nhưng không có CCCD, ngày sinh, địa chỉ. */
export interface BusinessManagerPayload {
  username: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
}

/** Body `POST /businesses`: doanh nghiệp + tài khoản quản lý đầu tiên, tạo cùng lúc. */
export interface CreateBusinessPayload extends BusinessPayload {
  manager: BusinessManagerPayload
}

/** Học viên của doanh nghiệp, kèm số khoá theo trạng thái. */
export interface BusinessMember {
  id: number
  username: string
  firstName: string
  lastName: string
  fullName: string
  cccd: string
  dateOfBirth: string
  phoneNumber: string
  email: string
  status: UserStatus
  createdAt: string
  pendingCount: number
  learningCount: number
  completedCount: number
  certificateCount: number
}

/** Tiến độ xem video của học viên trong một khoá (server tính như trang học). */
export interface CourseProgress {
  /** Số video theo dõi được (YouTube nhúng, video upload). */
  videoCount: number
  /** Số video chưa mở lần nào (chưa biết thời lượng). */
  unopenedCount: number
  totalSeconds: number
  watchedSeconds: number
  /** 0–100, làm tròn xuống; `null` khi khoá không có video. */
  percent: number | null
  /** Đủ điều kiện thi: mở hết video và xem ≥ 80% tổng thời lượng (hoặc khoá không có video). */
  examReady: boolean
}

export interface MemberExamResult {
  /** `false`: đang làm bài. */
  submitted: boolean
  startedAt: string
  submittedAt: string | null
  questionCount: number | null
  correctCount: number | null
  score: number | null
  passScore: number
  passed: boolean | null
}

/** Một khoá của học viên doanh nghiệp: đăng ký, tiến độ, bài thi, chứng chỉ. */
export interface MemberCourse {
  enrollmentId: number
  courseId: number
  courseName: string
  status: EnrollmentStatus
  price: number
  enrolledAt: string
  approvedAt: string | null
  completedAt: string | null
  /** Chỉ có khi đang học / đã hoàn thành. */
  progress?: CourseProgress
  exam: MemberExamResult | null
  certificate: { code: string; issuedAt: string } | null
}

export interface BusinessMemberDetail {
  member: BusinessMember
  /** Mọi lượt đăng ký (kể cả đã huỷ), mới nhất trước. */
  courses: MemberCourse[]
}

/** Body `POST /my-business/enrollments`. */
export interface BusinessEnrollPayload {
  courseId: number
  userIds: number[]
}

export interface BusinessEnrollResult {
  courseId: number
  courseName: string
  /** Lượt đăng ký `PENDING` vừa tạo — admin duyệt sau khi nhận chuyển khoản. */
  enrolled: Enrollment[]
  /** Học viên đã chờ duyệt / đang học / đã hoàn thành khoá này: bỏ qua. */
  skipped: { userId: number; fullName: string; status: EnrollmentStatus }[]
  /** Tổng tiền cần chuyển cho các lượt mới (VND). */
  totalAmount: number
}

export interface BusinessSearchParams {
  keyword?: string
  status?: BusinessStatus
  page: number
  size: number
}

export interface BusinessMemberSearchParams {
  keyword?: string
  page: number
  size: number
}
