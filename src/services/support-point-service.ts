import { http } from '@/services/http'
import type { ApiResponse } from '@/types/api'
import type { NearbySupportPoints, SupportPointSearch } from '@/types/support-point'

export const supportPointService = {
  /**
   * Cần đăng nhập. Địa chỉ được backend đổi ra toạ độ (OpenStreetMap):
   * không tìm thấy → 404 `ADDRESS_NOT_FOUND`, dịch vụ bản đồ lỗi → 503 `GEOCODING_UNAVAILABLE`.
   */
  async nearby(params: SupportPointSearch): Promise<NearbySupportPoints> {
    const { data } = await http.get<ApiResponse<NearbySupportPoints>>('/support-points/nearby', {
      params,
    })
    return data.data
  },
}
