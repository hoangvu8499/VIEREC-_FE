/**
 * Payload `POST /auth/register` (camelCase, khớp form).
 * Gửi mật khẩu thô qua HTTPS — backend hash BCrypt vào `password_hash`, FE không hash.
 */
export interface RegisterPayload {
  username: string
  password: string
  firstName: string
  lastName: string
  cccd: string
  /** `YYYY-MM-DD` */
  dateOfBirth: string
  address: string
  phoneNumber: string
  email: string
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED'
export type UserRole = 'TRAINEE' | (string & {})

/** User backend trả về (không có mật khẩu). */
export interface User {
  id: number
  username: string
  firstName: string
  lastName: string
  cccd: string
  /** `YYYY-MM-DD` */
  dateOfBirth: string
  address: string
  phoneNumber: string
  email: string
  status: UserStatus
  roles: UserRole[]
  /** ISO 8601, giờ server (không kèm múi giờ). */
  createdAt: string
  updatedAt: string
}

export interface LoginPayload {
  /** Username hoặc email. */
  username: string
  password: string
}

/**
 * Body của `POST /auth/login` và `/auth/refresh`.
 * Token **không** có trong body — backend set cookie HttpOnly `access_token` / `refresh_token`.
 */
export interface AuthSession {
  /** Thời hạn access token (giây), mặc định 1800. */
  expiresIn: number
  /** Thời hạn refresh token (giây), mặc định 2592000. */
  refreshExpiresIn: number
  user: User
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  /** Token lấy từ link trong email (`?token=`). */
  token: string
  password: string
}

/** Một dòng của `GET /roles`. `code` là giá trị gửi trong `roles` của user. */
export interface Role {
  id: number
  code: string
  name: string
  /** Mô tả tiếng Việt, vd. "Quản trị viên". */
  description: string
}

/** Body `POST /users`: như đăng ký (tất cả bắt buộc) + vai trò (≥ 1) + trạng thái (mặc định ACTIVE). */
export interface CreateUserPayload extends RegisterPayload {
  roles: string[]
  status?: UserStatus
}

/**
 * Body `PUT /users/{id}`: cập nhật từng phần, field không gửi thì giữ nguyên.
 * Không đổi được username / mật khẩu; vai trò đổi qua `PUT /users/{id}/roles`.
 */
export type UpdateUserPayload = Partial<Omit<RegisterPayload, 'username' | 'password'>> & {
  status?: UserStatus
}

/** Body `PUT /auth/me`: như `UpdateUserPayload` nhưng không có trạng thái. */
export type UpdateProfilePayload = Partial<Omit<RegisterPayload, 'username' | 'password'>>

/** Body `PUT /auth/me/password`. Sai mật khẩu hiện tại → 401 `INVALID_CREDENTIALS` (phiên vẫn còn). */
export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}
