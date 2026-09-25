import { http } from '@/services/http'
import type { ApiResponse } from '@/types/api'
import type { RegisterPayload, User } from '@/types/user'

// TODO: xác nhận endpoint và format response với backend.
export const authService = {
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await http.post<ApiResponse<User>>('/auth/register', payload)
    return data.data
  },
}
