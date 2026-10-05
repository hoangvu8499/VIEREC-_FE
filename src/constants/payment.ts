import type { PaymentMethod, PaymentSearchParams, PaymentStatus } from '@/types/payment'

/** Tài khoản nhận học phí; mã QR VietQR sinh từ đây (`vietQrPayload`). */
export const BANK_ACCOUNT = {
  bankName: 'TPBank',
  /** Mã ngân hàng NAPAS của TPBank. */
  bankBin: '970423',
  accountName: 'TON THAT HOANG VU',
  accountNumber: '08343144141',
} as const

/**
 * Nội dung chuyển khoản để admin đối chiếu sao kê: mã khoá học (`KH` + id) và mã học viên (`HV` + id user).
 * Chỉ chữ, số và dấu cách: nhiều ngân hàng bỏ dấu tiếng Việt và ký tự đặc biệt.
 */
export function transferContent(courseId: number, userId: number): string {
  return `VIEREC KH${courseId} HV${userId}`
}

/** Nội dung chuyển khoản khi doanh nghiệp ghi danh hộ: mã khoá học và mã doanh nghiệp (`DN` + id). */
export function businessTransferContent(courseId: number, businessId: number): string {
  return `VIEREC KH${courseId} DN${businessId}`
}

export const PAYMENT_QUERY_KEYS = {
  all: ['payments'],
  mine: (params: PaymentSearchParams) => ['payments', 'mine', params],
  search: (params: PaymentSearchParams) => ['payments', 'search', params],
} as const

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Chờ xác nhận',
  PAID: 'Đã thanh toán',
  FAILED: 'Không thành công',
  REFUNDED: 'Đã hoàn tiền',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  CARD: 'Thẻ',
  E_WALLET: 'Ví điện tử',
  OTHER: 'Khác',
}

export const PAYMENT_PAGE_SIZE = 10
