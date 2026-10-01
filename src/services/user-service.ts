import { http } from '@/services/http'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { CreateUserPayload, UpdateUserPayload, User, UserStatus } from '@/types/user'

export interface UserSearchParams {
  /** Khớp username, email, họ hoặc tên. */
  keyword?: string
  status?: UserStatus
  /** Bắt đầu từ 0. */
  page?: number
  size?: number
  /** Vd. `createdAt,desc` (mặc định của backend: `createdAt` tăng dần). */
  sort?: string
}

/** `/users` — chỉ SUPER_ADMIN / ADMIN. */
export const userService = {
  async search(params: UserSearchParams = {}): Promise<PageResponse<User>> {
    const { data } = await http.get<ApiResponse<PageResponse<User>>>('/users', { params })
    return data.data
  },

  async get(id: number): Promise<User> {
    const { data } = await http.get<ApiResponse<User>>(`/users/${id}`)
    return data.data
  },

  /** Chỉ SUPER_ADMIN tạo được SUPER_ADMIN (403 `VRC-403-101`). */
  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await http.post<ApiResponse<User>>('/users', payload)
    return data.data
  },

  async update(id: number, payload: UpdateUserPayload): Promise<User> {
    const { data } = await http.put<ApiResponse<User>>(`/users/${id}`, payload)
    return data.data
  },

  /**
   * Thay toàn bộ vai trò. Không tự đổi vai trò của mình (`VRC-403-102`); chỉ SUPER_ADMIN đụng tới
   * SUPER_ADMIN (`VRC-403-101`). Có hiệu lực ở lần đăng nhập / refresh token tiếp theo của user đó.
   */
  async assignRoles(id: number, roles: string[]): Promise<User> {
    const { data } = await http.put<ApiResponse<User>>(`/users/${id}/roles`, { roles })
    return data.data
  },

  /** Xoá mềm (204): user chuyển INACTIVE và không còn trong danh sách. */
  async remove(id: number): Promise<void> {
    await http.delete(`/users/${id}`)
  },
}
