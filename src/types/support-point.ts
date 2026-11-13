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

/** Điểm hỗ trợ trong trang quản trị, theo `SupportPointDetailResponse` của backend. */
export interface SupportPointDetail {
  id: number
  name: string
  province: string
  district: string
  /** Địa chỉ chi tiết; không có thì backend bỏ field. */
  address?: string
  latitude: number
  longitude: number
  phoneNumber: string
  createdAt: string
  updatedAt: string
}

/**
 * Body `POST /support-points`, `PUT /support-points/{id}`. Bỏ trống cả hai toạ độ thì backend tự tìm
 * từ địa chỉ, quận / huyện, tỉnh / thành phố.
 */
export interface SupportPointPayload {
  name: string
  province: string
  district: string
  address: string | null
  phoneNumber: string
  latitude: number | null
  longitude: number | null
}

export interface SupportPointListParams {
  keyword?: string
  page: number
  size: number
}

export interface SupportPointImportResult {
  importedCount: number
}

/** Một dòng sai trong file Excel import điểm hỗ trợ (đã dịch sang tiếng Việt). */
export interface SupportPointImportRowError {
  /** Số dòng trong Excel (dòng 1 là tiêu đề). */
  row: number
  message: string
}
