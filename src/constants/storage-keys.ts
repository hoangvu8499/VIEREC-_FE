export const STORAGE_KEYS = {
  /** Phiên đăng nhập (chỉ `user`, token nằm trong cookie) — do `useAuthStore` quản lý. */
  AUTH: 'vierec.auth',
  APP_STORE: 'vierec.app',
  ADMIN_UI: 'vierec.admin-ui',
  /** Tiến độ xem video, tách theo học viên và khoá: `${WATCH_PROGRESS}.<userId>.<courseId>`. */
  WATCH_PROGRESS: 'vierec.watch-progress',
  /** Đáp án đang chọn của lượt thi (giữ khi tải lại trang): `${EXAM_ANSWERS}.<attemptId>`. */
  EXAM_ANSWERS: 'vierec.exam-answers',
} as const
