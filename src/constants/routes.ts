export const ROUTES = {
  HOME: '/',
  COURSES: '/khoa-hoc',
  /** Tạo link bằng `coursePath(id)`. */
  COURSE_DETAIL: '/khoa-hoc/:courseId',
  INCIDENT_RESPONSE: '/ung-pho-su-co',
  /** Tra cứu đơn vị xử lý / điểm hỗ trợ sự cố (dữ liệu admin quản lý ở "Điểm hỗ trợ sự cố"). */
  FIND_RESPONDERS: '/tim-don-vi-xu-ly-su-co',
  ENTERPRISE: '/doanh-nghiep',
  LIBRARY: '/thu-vien',
  INSTRUCTORS: '/giang-vien',
  ABOUT: '/ve-vierec',
  NEWS: '/tin-tuc',
  CONTACT: '/lien-he',
  PARTNERS: '/doi-tac',
  EMERGENCY_REPORT: '/bao-su-co',
  /** Tra cứu chứng chỉ công khai: `?ma=VRC-2026-...` — tạo link bằng `certificateVerifyPath`. */
  VERIFY_CERTIFICATE: '/tra-cuu-chung-chi',
  SEARCH: '/tim-kiem',
  LOGIN: '/dang-nhap',
  REGISTER: '/dang-ky',
  FORGOT_PASSWORD: '/quen-mat-khau',
  /** Link trong email đặt lại mật khẩu: `?token=...` */
  RESET_PASSWORD: '/dat-lai-mat-khau',
  NOT_FOUND: '*',
} as const

export function coursePath(courseId: number): string {
  return ROUTES.COURSE_DETAIL.replace(':courseId', String(courseId))
}

export function certificateVerifyPath(code: string): string {
  return `${ROUTES.VERIFY_CERTIFICATE}?ma=${encodeURIComponent(code)}`
}

/** Góc học viên — cần đăng nhập (mọi vai trò). */
export const LEARNER_ROUTES = {
  OVERVIEW: '/hoc-vien',
  MY_COURSES: '/hoc-vien/khoa-hoc-cua-toi',
  /** Trang học của khoá đã được duyệt. Tạo link bằng `learnPath(id)`. */
  LEARN: '/hoc-vien/khoa-hoc/:courseId',
  PAYMENTS: '/hoc-vien/thanh-toan',
  ENROLL: '/hoc-vien/dang-ky-khoa-hoc',
  CERTIFICATES: '/hoc-vien/chung-chi',
  PROFILE: '/hoc-vien/ho-so',
} as const

export function learnPath(courseId: number): string {
  return LEARNER_ROUTES.LEARN.replace(':courseId', String(courseId))
}

/** Trang quản trị — chỉ SUPER_ADMIN / ADMIN (xem `ADMIN_ROLES`). */
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  COURSES: '/admin/khoa-hoc',
  COURSE_CREATE: '/admin/khoa-hoc/tao-moi',
  /** Path có tham số: tạo link bằng `adminCoursePath` / `adminLessonEditPath`. */
  COURSE_DETAIL: '/admin/khoa-hoc/:courseId',
  COURSE_EDIT: '/admin/khoa-hoc/:courseId/sua',
  /** Học viên đã ghi danh: xác nhận hoàn thành, cấp chứng chỉ. */
  COURSE_ENROLLMENTS: '/admin/khoa-hoc/:courseId/hoc-vien',
  /** Yêu cầu đăng ký chờ duyệt của mọi khoá. */
  ENROLLMENT_REQUESTS: '/admin/duyet-dang-ky',
  LESSON_CREATE: '/admin/khoa-hoc/:courseId/bai-hoc/tao-moi',
  LESSON_EDIT: '/admin/khoa-hoc/:courseId/bai-hoc/:lessonId/sua',
  SUPPORT_POINTS: '/admin/diem-ho-tro-su-co',
  USERS: '/admin/nguoi-dung',
  USER_CREATE: '/admin/nguoi-dung/tao-moi',
  /** Tạo link bằng `adminUserPath`. */
  USER_DETAIL: '/admin/nguoi-dung/:userId',
  USER_EDIT: '/admin/nguoi-dung/:userId/sua',
  PERMISSIONS: '/admin/phan-quyen',
} as const

type CoursePathKey = 'COURSE_DETAIL' | 'COURSE_EDIT' | 'COURSE_ENROLLMENTS' | 'LESSON_CREATE'

/** Link tới trang của một khoá học, vd. `adminCoursePath('COURSE_EDIT', 7)` → `/admin/khoa-hoc/7/sua`. */
export function adminCoursePath(key: CoursePathKey, courseId: number): string {
  return ADMIN_ROUTES[key].replace(':courseId', String(courseId))
}

export function adminLessonEditPath(courseId: number, lessonId: number): string {
  return ADMIN_ROUTES.LESSON_EDIT.replace(':courseId', String(courseId)).replace(
    ':lessonId',
    String(lessonId),
  )
}

export function adminUserPath(key: 'USER_DETAIL' | 'USER_EDIT', userId: number): string {
  return ADMIN_ROUTES[key].replace(':userId', String(userId))
}
