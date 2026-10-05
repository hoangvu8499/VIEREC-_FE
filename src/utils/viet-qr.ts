/**
 * Chuỗi VietQR (chuẩn EMVCo của NAPAS) để app ngân hàng quét ra sẵn tài khoản, số tiền và nội dung.
 * Các trường cố định lấy theo mã QR tĩnh mà TPBank cấp cho tài khoản nhận học phí.
 */
export interface VietQrInput {
  /** Mã ngân hàng NAPAS, vd. `970423` (TPBank). */
  bankBin: string
  accountNumber: string
  /** Tên chủ tài khoản không dấu, như trên QR ngân hàng cấp. */
  accountName: string
  /** VND, số nguyên dương. */
  amount: number
  /** Nội dung chuyển khoản: chỉ chữ không dấu, số và dấu cách. */
  content: string
}

/** Một trường ID + độ dài 2 chữ số + giá trị. */
function field(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, '0')}${value}`
}

/** CRC-16/CCITT-FALSE, 4 ký tự hex in hoa. */
export function crc16(text: string): string {
  let crc = 0xffff
  for (const byte of new TextEncoder().encode(text)) {
    crc ^= byte << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export function vietQrPayload({
  bankBin,
  accountNumber,
  accountName,
  amount,
  content,
}: VietQrInput): string {
  const beneficiary = field('00', bankBin) + field('01', accountNumber)
  const merchant = field('00', 'A000000727') + field('01', beneficiary) + field('02', 'QRIBFTTA')
  const body =
    field('00', '01') +
    // 12: QR động (có số tiền), dùng một lần cho một giao dịch.
    field('01', '12') +
    field('38', merchant) +
    field('52', '5137') +
    field('53', '704') +
    field('54', String(Math.round(amount))) +
    field('58', 'VN') +
    field('59', accountName) +
    field('60', 'Ha Noi') +
    field('62', field('08', content)) +
    '6304'
  return body + crc16(body)
}
