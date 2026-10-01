import { http } from '@/services/http'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { Payment, PaymentSearchParams } from '@/types/payment'

export const paymentService = {
  /** Giao dịch của người đang đăng nhập, mới nhất trước. */
  async listMine(
    params: Omit<PaymentSearchParams, 'userId' | 'courseId'> = {},
  ): Promise<PageResponse<Payment>> {
    const { data } = await http.get<ApiResponse<PageResponse<Payment>>>('/auth/me/payments', {
      params,
    })
    return data.data
  },

  /** SUPER_ADMIN / ADMIN. Mọi bộ lọc tuỳ chọn, mới nhất trước. */
  async search(params: PaymentSearchParams = {}): Promise<PageResponse<Payment>> {
    const { data } = await http.get<ApiResponse<PageResponse<Payment>>>('/payments', { params })
    return data.data
  },
}
