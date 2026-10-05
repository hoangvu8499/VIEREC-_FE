import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams } from 'react-router'

import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { supportPointService } from '@/services/support-point-service'
import type { ApiError } from '@/types/api'
import type { NearbySupportPoints, SupportPointSearch } from '@/types/support-point'
import { apiErrorMessage } from '@/utils/api-error-message'

/** Tham số trên URL: `?dia-chi=...&ban-kinh=5` hoặc `?lat=...&lng=...` (vị trí của tôi). */
const PARAM = { ADDRESS: 'dia-chi', LAT: 'lat', LNG: 'lng', RADIUS: 'ban-kinh' } as const

/** Bán kính chọn được (km); backend nhận 1–50. */
export const RADIUS_OPTIONS = [3, 5, 10, 20] as const
export const DEFAULT_RADIUS_KM = 3

/** Giới hạn độ dài địa chỉ của backend. */
export const ADDRESS_MAX_LENGTH = 255

export const SUPPORT_POINT_QUERY_KEYS = {
  nearby: (search: SupportPointSearch) => ['support-points', 'nearby', search],
} as const

function toNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === '') return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

/** Toạ độ làm tròn 6 chữ số (~10 cm): đủ chính xác, URL gọn. */
function roundCoordinate(value: number): number {
  return Math.round(value * 1e6) / 1e6
}

export function useResponderSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const address = searchParams.get(PARAM.ADDRESS)?.trim() || undefined
  const latitude = toNumber(searchParams.get(PARAM.LAT))
  const longitude = toNumber(searchParams.get(PARAM.LNG))
  const radiusParam = toNumber(searchParams.get(PARAM.RADIUS))
  const radiusKm = RADIUS_OPTIONS.find((option) => option === radiusParam) ?? DEFAULT_RADIUS_KM

  const search: SupportPointSearch | undefined = address
    ? { address, radiusKm }
    : latitude !== undefined && longitude !== undefined
      ? { latitude, longitude, radiusKm }
      : undefined

  const withRadius = (params: Record<string, string>, radius: number) =>
    radius === DEFAULT_RADIUS_KM ? params : { ...params, [PARAM.RADIUS]: String(radius) }

  return {
    search,
    address,
    radiusKm,
    searchAddress: (nextAddress: string) =>
      setSearchParams(withRadius({ [PARAM.ADDRESS]: nextAddress }, radiusKm)),
    searchCoordinates: (lat: number, lng: number) =>
      setSearchParams(
        withRadius(
          {
            [PARAM.LAT]: String(roundCoordinate(lat)),
            [PARAM.LNG]: String(roundCoordinate(lng)),
          },
          radiusKm,
        ),
      ),
    /** Đổi bán kính giữ nguyên vị trí đang tìm. */
    setRadius: (nextRadius: number) => {
      const next = new URLSearchParams(searchParams)
      if (nextRadius === DEFAULT_RADIUS_KM) next.delete(PARAM.RADIUS)
      else next.set(PARAM.RADIUS, String(nextRadius))
      setSearchParams(next)
    },
  }
}

export function useNearbySupportPoints(search: SupportPointSearch | undefined) {
  return useQuery<NearbySupportPoints, ApiError>({
    queryKey: SUPPORT_POINT_QUERY_KEYS.nearby(search ?? { address: '', radiusKm: 0 }),
    queryFn: () => supportPointService.nearby(search as SupportPointSearch),
    enabled: search !== undefined,
    // Danh sách đơn vị ít đổi; tránh gọi lại dịch vụ bản đồ khi quay lại trang.
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function nearbyErrorMessage(error: ApiError): string {
  switch (error.code) {
    case API_ERROR_CODES.ADDRESS_NOT_FOUND:
      return 'Không tìm thấy địa chỉ này trên bản đồ. Thử ghi rõ hơn, vd. “Ngũ Hành Sơn, Đà Nẵng”.'
    case API_ERROR_CODES.GEOCODING_UNAVAILABLE:
      return 'Dịch vụ bản đồ đang bận. Vui lòng thử lại sau ít phút hoặc dùng vị trí của bạn.'
    default:
      return apiErrorMessage(error, { fallback: 'Không tìm được đơn vị xử lý. Vui lòng thử lại.' })
  }
}

type GeolocationState = { status: 'idle' | 'locating' } | { status: 'error'; message: string }

/** Lấy vị trí hiện tại từ trình duyệt (cần người dùng cho phép). */
export function useCurrentPosition(onFound: (latitude: number, longitude: number) => void) {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' })
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  const locate = () => {
    if (!supported) return
    setState({ status: 'locating' })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({ status: 'idle' })
        onFound(position.coords.latitude, position.coords.longitude)
      },
      (error) =>
        setState({
          status: 'error',
          message:
            error.code === error.PERMISSION_DENIED
              ? 'Bạn chưa cho phép trang web xem vị trí. Hãy bật quyền vị trí trong trình duyệt hoặc nhập địa chỉ.'
              : 'Không xác định được vị trí của bạn. Vui lòng nhập địa chỉ.',
        }),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    )
  }

  return { supported, state, locate }
}
