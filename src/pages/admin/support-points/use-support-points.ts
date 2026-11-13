import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { API_ERROR_CODES } from '@/constants/api-error-codes'
import {
  SUPPORT_POINT_PAGE_SIZE,
  SUPPORT_POINT_QUERY_KEYS,
  SUPPORT_POINT_RULES,
} from '@/constants/support-point'
import { adminSupportPointService } from '@/services/support-point-service'
import type { ApiError, PageResponse } from '@/types/api'
import type {
  SupportPointDetail,
  SupportPointImportResult,
  SupportPointListParams,
  SupportPointPayload,
} from '@/types/support-point'
import { apiErrorMessage } from '@/utils/api-error-message'
import { formatFileSize } from '@/utils/format-file-size'

const NO_PERMISSION = 'Bạn không có quyền quản lý điểm hỗ trợ.'
const POINT_GONE = 'Điểm hỗ trợ không còn tồn tại. Vui lòng tải lại trang.'

/** Tìm kiếm và trang trên URL: `?q=...&trang=2` (trang tính từ 1). */
export function useSupportPointListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = searchParams.get('q') ?? undefined
  const page = Math.max(0, Number(searchParams.get('trang') ?? 1) - 1) || 0
  const update = (next: { keyword?: string; page: number }) => {
    const params = new URLSearchParams()
    if (next.keyword) params.set('q', next.keyword)
    if (next.page > 0) params.set('trang', String(next.page + 1))
    setSearchParams(params)
  }
  const params: SupportPointListParams = { keyword, page, size: SUPPORT_POINT_PAGE_SIZE }
  return { params, update }
}

export function useSupportPointList(params: SupportPointListParams) {
  return useQuery<PageResponse<SupportPointDetail>, ApiError>({
    queryKey: SUPPORT_POINT_QUERY_KEYS.list(params),
    queryFn: () => adminSupportPointService.list(params),
    placeholderData: keepPreviousData,
  })
}

/** Có `id`: sửa điểm đó. Không: thêm mới. */
export function useSaveSupportPoint(id: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation<SupportPointDetail, ApiError, SupportPointPayload>({
    mutationFn: (payload) =>
      id === undefined
        ? adminSupportPointService.create(payload)
        : adminSupportPointService.update(id, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: SUPPORT_POINT_QUERY_KEYS.all }),
  })
}

export function useDeleteSupportPoint() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, SupportPointDetail>({
    mutationFn: (point) => adminSupportPointService.remove(point.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: SUPPORT_POINT_QUERY_KEYS.all }),
  })
}

export function useImportSupportPoints() {
  const queryClient = useQueryClient()
  return useMutation<SupportPointImportResult, ApiError, File>({
    mutationFn: (file) => adminSupportPointService.importPoints(file),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: SUPPORT_POINT_QUERY_KEYS.all }),
  })
}

function commonMessage(error: ApiError, fallback: string): string {
  if (error.code === API_ERROR_CODES.SUPPORT_POINT_NOT_FOUND) return POINT_GONE
  return apiErrorMessage(error, { fallback, byStatus: { 403: NO_PERMISSION } })
}

/** Lỗi lưu form không gắn với một ô (lỗi theo ô hiện ngay dưới ô). */
export function saveSupportPointErrorMessage(error: ApiError, fieldMessages: string[]): string {
  switch (error.code) {
    case API_ERROR_CODES.ADDRESS_NOT_FOUND:
      return 'Không tìm được toạ độ từ địa chỉ đã nhập. Hãy kiểm tra lại địa chỉ, hoặc nhập vĩ độ và kinh độ (lấy trên Google Maps).'
    case API_ERROR_CODES.GEOCODING_UNAVAILABLE:
      return 'Dịch vụ bản đồ đang không phản hồi nên chưa tìm được toạ độ. Hãy thử lại sau, hoặc nhập vĩ độ và kinh độ.'
    case API_ERROR_CODES.SUPPORT_POINT_LOCATION_REQUIRED:
      return 'Nhập cả vĩ độ và kinh độ, hoặc bỏ trống cả hai để tự tìm theo địa chỉ.'
  }
  if (fieldMessages.length === 1) return fieldMessages[0] ?? ''
  if (fieldMessages.length > 1) {
    return 'Một số thông tin chưa hợp lệ. Vui lòng kiểm tra các ô được đánh dấu.'
  }
  return commonMessage(error, 'Không lưu được điểm hỗ trợ. Vui lòng thử lại.')
}

export function deleteSupportPointErrorMessage(error: ApiError): string {
  return commonMessage(error, 'Không xoá được điểm hỗ trợ. Vui lòng thử lại.')
}

/** Lỗi import không gắn với dòng nào (dòng sai hiện riêng bằng `supportPointImportRowErrors`). */
export function importSupportPointsErrorMessage(error: ApiError): string {
  switch (error.code) {
    case API_ERROR_CODES.SUPPORT_POINT_IMPORT_INVALID_ROWS:
      return 'File có dòng chưa hợp lệ nên chưa điểm nào được lưu. Sửa các dòng dưới đây rồi import lại.'
    case API_ERROR_CODES.SUPPORT_POINT_IMPORT_UNREADABLE:
      return 'Không đọc được file. Hãy lưu lại đúng định dạng Excel (.xlsx), không đặt mật khẩu, rồi thử lại.'
    case API_ERROR_CODES.SUPPORT_POINT_IMPORT_EMPTY:
      return 'File chưa có điểm hỗ trợ nào. Nhập từ dòng 2 của sheet “Điểm hỗ trợ”.'
    case API_ERROR_CODES.SUPPORT_POINT_IMPORT_TOO_MANY_ROWS:
      return `Mỗi file tối đa ${SUPPORT_POINT_RULES.importMaxRows} điểm. Hãy chia thành nhiều file.`
    case API_ERROR_CODES.FILE_TYPE_NOT_ALLOWED:
      return 'Chỉ nhận file Excel .xlsx hoặc .xls.'
    case API_ERROR_CODES.FILE_TOO_LARGE:
      return `File tối đa ${formatFileSize(SUPPORT_POINT_RULES.importMaxBytes)}.`
    default:
      return commonMessage(error, 'Không import được file. Vui lòng thử lại.')
  }
}
