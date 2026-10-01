import { http } from '@/services/http'
import type { ApiResponse } from '@/types/api'
import type {
  AuthSession,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  User,
} from '@/types/user'

export const authService = {
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await http.post<ApiResponse<User>>('/auth/register', payload)
    return data.data
  },

  /** Backend set cookie HttpOnly; body chỉ có thời hạn token + user. */
  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data } = await http.post<ApiResponse<AuthSession>>('/auth/login', payload)
    return data.data
  },

  /** User của cookie hiện tại. 401 → interceptor tự refresh một lần. */
  async me(): Promise<User> {
    const { data } = await http.get<ApiResponse<User>>('/auth/me')
    return data.data
  },

  /** Tự sửa hồ sơ. Đã có chứng chỉ thì đổi họ tên / ngày sinh / CCCD → 409 `IDENTITY_LOCKED`. */
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await http.put<ApiResponse<User>>('/auth/me', payload)
    return data.data
  },

  /** 204. Token hiện tại vẫn dùng được tới khi hết hạn. */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await http.put('/auth/me/password', payload)
  },

  /**
   * Backend xoá 2 cookie token (`Max-Age=0`) — cookie HttpOnly JS không tự xoá được.
   * Endpoint public: vẫn đăng xuất được khi access token đã hết hạn.
   * Lưu ý: token không bị thu hồi phía server, chỉ bị xoá khỏi trình duyệt.
   */
  async logout(): Promise<void> {
    await http.post('/auth/logout')
  },

  // ⏳ Chưa có ở backend — endpoint giả định.
  /** Backend gửi email chứa link `ROUTES.RESET_PASSWORD?token=...`. */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await http.post('/auth/forgot-password', payload)
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await http.post('/auth/reset-password', payload)
  },
}
