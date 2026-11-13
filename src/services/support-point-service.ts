import { http } from '@/services/http'
import type { ApiResponse, PageResponse } from '@/types/api'
import type {
  NearbySupportPoints,
  SupportPointDetail,
  SupportPointImportResult,
  SupportPointListParams,
  SupportPointPayload,
  SupportPointSearch,
} from '@/types/support-point'

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

/** `/support-points` — quản lý điểm hỗ trợ, chỉ SUPER_ADMIN / ADMIN. */
export const adminSupportPointService = {
  /** Sắp theo tỉnh, quận / huyện, tên; keyword khớp tên, khu vực, địa chỉ, số điện thoại. */
  async list(params: SupportPointListParams): Promise<PageResponse<SupportPointDetail>> {
    const { data } = await http.get<ApiResponse<PageResponse<SupportPointDetail>>>(
      '/support-points',
      { params },
    )
    return data.data
  },

  /**
   * Bỏ trống toạ độ: backend tìm từ địa chỉ — không thấy → 404 `ADDRESS_NOT_FOUND`,
   * dịch vụ bản đồ lỗi → 503 `GEOCODING_UNAVAILABLE`.
   */
  async create(payload: SupportPointPayload): Promise<SupportPointDetail> {
    const { data } = await http.post<ApiResponse<SupportPointDetail>>('/support-points', payload)
    return data.data
  },

  async update(id: number, payload: SupportPointPayload): Promise<SupportPointDetail> {
    const { data } = await http.put<ApiResponse<SupportPointDetail>>(
      `/support-points/${id}`,
      payload,
    )
    return data.data
  },

  /** Xoá mềm: điểm biến mất khỏi danh sách và khỏi tìm đơn vị gần nhất. */
  async remove(id: number): Promise<void> {
    await http.delete(`/support-points/${id}`)
  },

  /**
   * Thêm điểm hỗ trợ từ file Excel (mỗi dòng phải có toạ độ). Một dòng sai là không lưu điểm nào:
   * 400 `SUPPORT_POINT_IMPORT_INVALID_ROWS`, `fieldErrors` dạng `rows[<dòng Excel>].<field>`.
   */
  async importPoints(file: File): Promise<SupportPointImportResult> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await http.post<ApiResponse<SupportPointImportResult>>(
      '/support-points/import',
      form,
      // Instance mặc định là JSON — axios sẽ đổi FormData thành JSON nếu không ghi đè.
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 0 },
    )
    return data.data
  },
}
