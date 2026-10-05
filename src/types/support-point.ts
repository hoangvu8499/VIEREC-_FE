/** Đơn vị xử lý sự cố, theo `SupportPointResponse` của backend. */
export interface SupportPoint {
  id: number
  name: string
  province: string
  district: string
  /** Địa chỉ chi tiết; không có thì backend bỏ field. */
  address?: string
  latitude: number
  longitude: number
  phoneNumber: string
  /** Khoảng cách đường chim bay tới vị trí tìm (km, 3 chữ số thập phân). */
  distanceKm: number
}

export interface SupportPointSearchOrigin {
  latitude: number
  longitude: number
  /** Tên đầy đủ của nơi tìm được theo địa chỉ; tìm theo toạ độ thì không có. */
  label?: string
}

/** `GET /support-points/nearby`: gần nhất trước. */
export interface NearbySupportPoints {
  origin: SupportPointSearchOrigin
  radiusKm: number
  results: SupportPoint[]
}

/** Tìm theo địa chỉ, hoặc theo toạ độ (vị trí của tôi). */
export type SupportPointSearch =
  { address: string; radiusKm: number } | { latitude: number; longitude: number; radiusKm: number }
