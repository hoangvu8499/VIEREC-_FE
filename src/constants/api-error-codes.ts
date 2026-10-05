/** Mã lỗi nghiệp vụ backend trả trong field `code`. */
export const API_ERROR_CODES = {
  VALIDATION_FAILED: 'VRC-400-001',
  /** Chưa đăng nhập / cookie hết hạn. Khi login: tài khoản bị khoá cũng rơi vào mã này. */
  UNAUTHENTICATED: 'VRC-401-001',
  /** Sai username/email hoặc mật khẩu (kể cả tài khoản không tồn tại). */
  INVALID_CREDENTIALS: 'VRC-401-002',
  TOKEN_EXPIRED: 'VRC-401-003',
  /** Refresh token thiếu/sai. */
  TOKEN_INVALID: 'VRC-401-004',
  ACCOUNT_DISABLED: 'VRC-403-001',
  ACCESS_DENIED: 'VRC-403-002',
  /** Chỉ SUPER_ADMIN được cấp / gỡ / đổi vai trò SUPER_ADMIN. */
  SUPER_ADMIN_ROLE_FORBIDDEN: 'VRC-403-101',
  OWN_ROLES_CHANGE_FORBIDDEN: 'VRC-403-102',
  USER_NOT_FOUND: 'VRC-404-101',
  ROLE_NOT_FOUND: 'VRC-404-102',
  USERNAME_TAKEN: 'VRC-409-101',
  /** So khớp không phân biệt hoa thường. */
  EMAIL_TAKEN: 'VRC-409-102',
  PHONE_TAKEN: 'VRC-409-103',
  CCCD_TAKEN: 'VRC-409-104',
  /** Đã có chứng chỉ → không đổi được họ tên, ngày sinh, CCCD. */
  IDENTITY_LOCKED: 'VRC-409-105',
  INSTRUCTOR_NOT_ACTIVE: 'VRC-400-201',
  COURSE_NOT_FOUND: 'VRC-404-201',
  INSTRUCTOR_NOT_FOUND: 'VRC-404-202',
  /** Không có bài học, hoặc bài không thuộc khoá này. */
  LESSON_NOT_FOUND: 'VRC-404-203',
  LESSON_SORT_ORDER_TAKEN: 'VRC-409-201',
  /** Khoá không tồn tại / chưa xuất bản dùng chung `COURSE_NOT_FOUND`. */
  ALREADY_ENROLLED: 'VRC-409-202',
  ENROLLMENT_COMPLETED: 'VRC-409-203',
  ENROLLMENT_NOT_FOUND: 'VRC-404-204',
  CERTIFICATE_NOT_FOUND: 'VRC-404-401',
  ENROLLMENT_NOT_COMPLETED: 'VRC-400-401',
  CERTIFICATE_ALREADY_ISSUED: 'VRC-409-401',
  /** Lượt ghi danh đã có chứng chỉ → không đổi trạng thái được. */
  CERTIFIED_ENROLLMENT_LOCKED: 'VRC-409-402',
  /** Không cho biết file nào (message tiếng Anh có tên file). */
  FILE_TYPE_NOT_ALLOWED: 'VRC-400-301',
  FILE_NOT_FOUND: 'VRC-404-301',
  FILE_TOO_LARGE: 'VRC-413-301',
  /** Tìm đơn vị xử lý sự cố: không có địa chỉ lẫn toạ độ. */
  SUPPORT_POINT_LOCATION_REQUIRED: 'VRC-400-601',
  /** Không tìm ra toạ độ của địa chỉ đã nhập. */
  ADDRESS_NOT_FOUND: 'VRC-404-601',
  /** Dịch vụ đổi địa chỉ ra toạ độ (OpenStreetMap) không phản hồi. */
  GEOCODING_UNAVAILABLE: 'VRC-503-601',
  /** Khoá học chưa có bài thi chứng chỉ. */
  EXAM_NOT_FOUND: 'VRC-404-701',
  EXAM_QUESTION_NOT_FOUND: 'VRC-404-702',
  /** File import có dòng sai (không lưu câu nào); `errors` dạng `rows[<dòng Excel>].<field>`. */
  EXAM_IMPORT_INVALID_ROWS: 'VRC-400-701',
  /** Không đọc được file Excel (hỏng, có mật khẩu, không phải Excel). */
  EXAM_IMPORT_UNREADABLE: 'VRC-400-702',
  EXAM_IMPORT_EMPTY: 'VRC-400-703',
  EXAM_IMPORT_TOO_MANY_ROWS: 'VRC-400-704',
  /** Chỉ học viên đã được duyệt (ENROLLED / COMPLETED) của khoá mới được thi. */
  EXAM_NOT_ALLOWED: 'VRC-403-701',
  /** Nộp bài khi chưa bắt đầu thi. */
  EXAM_ATTEMPT_NOT_FOUND: 'VRC-404-703',
  EXAM_HAS_NO_QUESTIONS: 'VRC-409-701',
  /** Mỗi học viên chỉ thi 1 lần: đã nộp rồi. */
  EXAM_ALREADY_TAKEN: 'VRC-409-702',
  /** Chưa xem đủ 80% thời lượng video (server kiểm tra lúc bắt đầu thi). */
  EXAM_PROGRESS_NOT_ENOUGH: 'VRC-409-703',
  /** Lưu tiến độ video khi chưa được duyệt vào khoá. */
  PROGRESS_NOT_ALLOWED: 'VRC-403-201',
  BUSINESS_NOT_FOUND: 'VRC-404-801',
  /** Học viên không thuộc doanh nghiệp (hoặc là người quản lý). */
  BUSINESS_MEMBER_NOT_FOUND: 'VRC-404-802',
  TAX_CODE_ALREADY_EXISTS: 'VRC-409-801',
  /** Tài khoản có role BUSINESS nhưng chưa gắn doanh nghiệp. */
  NOT_A_BUSINESS_MANAGER: 'VRC-403-801',
  /** Doanh nghiệp đã ngừng hoạt động (admin chuyển INACTIVE). */
  BUSINESS_INACTIVE: 'VRC-403-802',
  /** Ghi danh có người không phải học viên của doanh nghiệp. */
  BUSINESS_ENROLL_NOT_MEMBERS: 'VRC-400-801',
} as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]
