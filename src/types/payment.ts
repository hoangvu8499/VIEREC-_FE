export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'E_WALLET' | 'OTHER'

/** Một giao dịch (`GET /auth/me/payments`, `GET /payments`). Lịch sử, không bao giờ bị xoá. */
export interface Payment {
  id: number
  userId: number
  username: string
  /** Họ + tên người trả, backend ghép sẵn. */
  payerName: string
  payerEmail: string | null
  payerPhone: string | null
  courseId: number
  /** Tên khoá lúc ghi nhận (giữ nguyên nếu khoá đổi tên). */
  courseName: string
  /** VND, backend trả dạng số thập phân (vd. `1500000.00`). */
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  /** Mã giao dịch ngân hàng / ví. */
  transactionRef: string | null
  note: string | null
  /** Chỉ có khi PAID / REFUNDED. */
  paidAt: string | null
  /** Admin ghi nhận; `null` khi học viên tự báo đã chuyển khoản. */
  createdByUsername: string | null
  createdAt: string
  updatedAt: string
}

export interface PaymentSearchParams {
  userId?: number
  courseId?: number
  status?: PaymentStatus
  page?: number
  size?: number
}
