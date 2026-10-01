import type { PaymentMethod, PaymentSearchParams, PaymentStatus } from '@/types/payment'

/** Tài khoản nhận học phí, khớp ảnh QR `assets/images/payment-qr.jpg`. Đổi tài khoản thì đổi cả ảnh. */
export const BANK_ACCOUNT = {
  bankName: 'TPBank',
  accountName: 'TON THAT HOANG VU',
  accountNumber: '08343144141',
} as const

/**
 * Nội dung chuyển khoản để admin đối chiếu sao kê với lượt đăng ký. Chỉ chữ, số và dấu cách: nhiều ngân hàng
 * bỏ dấu tiếng Việt và ký tự đặc biệt.
 */
export function transferContent(username: string, courseId: number): string {
  const account = username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  return `VIEREC ${account} KH${courseId}`
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
