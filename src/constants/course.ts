import type {
  CourseSearchParams,
  CourseStatus,
  EnrollmentAdminSearchParams,
  EnrollmentSearchParams,
  EnrollmentStatus,
} from '@/types/course'

/** Tạo khoá / bài học xong thì invalidate `COURSE_QUERY_KEYS.all`. */
export const COURSE_QUERY_KEYS = {
  all: ['courses'],
  list: (params: CourseSearchParams) => ['courses', 'list', params],
  detail: (id: number) => ['courses', 'detail', id],
} as const

/** Thứ tự hiển thị trong ô chọn. */
export const COURSE_STATUSES = [
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
] as const satisfies readonly CourseStatus[]

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đã xuất bản',
  ARCHIVED: 'Lưu trữ',
}

/** Backend trả cố định 10 khoá mỗi trang. */
export const COURSE_PAGE_SIZE = 10

/** Đuôi file và dung lượng tối đa backend chấp nhận (`app.upload.*` của BE). */
export const LESSON_FILE_RULES = {
  document: {
    extensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'],
    maxBytes: 50 * 1024 * 1024,
  },
  video: {
    extensions: ['mp4', 'webm', 'mov', 'mkv'],
    maxBytes: 500 * 1024 * 1024,
  },
} as const

/**
 * Ghi danh / huỷ / đổi trạng thái xong thì invalidate cả `ENROLLMENT_QUERY_KEYS.all` và
 * `COURSE_QUERY_KEYS.all` (khoá học có `myEnrollmentStatus`).
 */
export const ENROLLMENT_QUERY_KEYS = {
  all: ['enrollments'],
  mine: (params: EnrollmentSearchParams) => ['enrollments', 'mine', params],
  byCourse: (courseId: number, params: EnrollmentSearchParams) => [
    'enrollments',
    'course',
    courseId,
    params,
  ],
  search: (params: EnrollmentAdminSearchParams) => ['enrollments', 'search', params],
} as const

export const CERTIFICATE_QUERY_KEYS = {
  all: ['certificates'],
  mine: (page: number) => ['certificates', 'mine', page],
  verify: (code: string) => ['certificates', 'verify', code],
} as const

export const ENROLLMENT_STATUSES = [
  'PENDING',
  'ENROLLED',
  'COMPLETED',
  'CANCELLED',
] as const satisfies readonly EnrollmentStatus[]

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  PENDING: 'Chờ duyệt',
  ENROLLED: 'Đang học',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã huỷ',
}

/** File PDF chứng chỉ: backend dùng giới hạn dung lượng của tài liệu. */
export const CERTIFICATE_FILE_RULES = {
  extensions: ['pdf'],
  maxBytes: LESSON_FILE_RULES.document.maxBytes,
} as const

/** Được vào trang học: tải tài liệu, xem video. */
export const LEARNING_STATUSES = [
  'ENROLLED',
  'COMPLETED',
] as const satisfies readonly EnrollmentStatus[]

/** Tỉ lệ thời lượng video phải xem để mở nút "Thi chứng chỉ". */
export const EXAM_WATCH_RATIO = 0.8

/** Số lượt ghi danh / chứng chỉ mỗi trang. */
export const ENROLLMENT_PAGE_SIZE = 10
