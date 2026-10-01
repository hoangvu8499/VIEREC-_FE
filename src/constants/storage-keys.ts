export const STORAGE_KEYS = {
  /** Phiên đăng nhập (chỉ `user`, token nằm trong cookie) — do `useAuthStore` quản lý. */
  AUTH: 'vierec.auth',
  APP_STORE: 'vierec.app',
  ADMIN_UI: 'vierec.admin-ui',
  /** Tiến độ xem video, tách theo học viên và khoá: `${WATCH_PROGRESS}.<userId>.<courseId>`. */
  WATCH_PROGRESS: 'vierec.watch-progress',
} as const
