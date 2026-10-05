import { create } from 'qrcode'
import { useMemo } from 'react'

interface QrCodeProps {
  value: string
  /** Mô tả cho trình đọc màn hình. */
  label: string
  className?: string
}

/** Viền trắng 4 ô theo chuẩn QR, để app quét nhận được trên nền màu. */
const QUIET_ZONE = 4

/** Mã QR (ảnh SVG), vẽ ngay trên trình duyệt (không gọi dịch vụ ngoài). */
export function QrCode({ value, label, className }: QrCodeProps) {
  const src = useMemo(() => {
    const { modules } = create(value, { errorCorrectionLevel: 'M' })
    const size = modules.size + QUIET_ZONE * 2
    let path = ''
    for (let row = 0; row < modules.size; row++) {
      for (let col = 0; col < modules.size; col++) {
        if (modules.get(row, col)) path += `M${col + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`
      }
    }
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">` +
      `<rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  }, [value])

  return <img className={className} src={src} alt={label} width={240} height={240} />
}
