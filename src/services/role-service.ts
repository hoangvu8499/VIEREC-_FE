import { http } from '@/services/http'
import type { ApiResponse } from '@/types/api'
import type { Role } from '@/types/user'

/** `/roles` — chỉ SUPER_ADMIN / ADMIN. */
export const roleService = {
  async list(): Promise<Role[]> {
    const { data } = await http.get<ApiResponse<Role[]>>('/roles')
    return data.data
  },
}
