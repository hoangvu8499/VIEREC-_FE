import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { BUSINESS_PAGE_SIZE, BUSINESS_QUERY_KEYS, BUSINESS_STATUSES } from '@/constants/business'
import { businessService } from '@/services/business-service'
import type { ApiError, PageResponse } from '@/types/api'
import type {
  Business,
  BusinessManagerPayload,
  BusinessMember,
  BusinessMemberDetail,
  BusinessMemberSearchParams,
  BusinessPayload,
  BusinessSearchParams,
  BusinessStatus,
  CreateBusinessPayload,
} from '@/types/business'
import type { User } from '@/types/user'
import { apiErrorMessage } from '@/utils/api-error-message'

const retry = (count: number, error: ApiError) =>
  error.code !== API_ERROR_CODES.BUSINESS_NOT_FOUND &&
  error.code !== API_ERROR_CODES.BUSINESS_MEMBER_NOT_FOUND &&
  count < 1

/** Lọc trên URL: `?q=...&trangThai=ACTIVE&trang=2` (trang tính từ 1). */
export function useBusinessListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('trangThai')
  const params: BusinessSearchParams = {
    keyword: searchParams.get('q') ?? undefined,
    status: BUSINESS_STATUSES.includes(status as BusinessStatus)
      ? (status as BusinessStatus)
      : undefined,
    page: Math.max(0, Number(searchParams.get('trang') ?? 1) - 1) || 0,
    size: BUSINESS_PAGE_SIZE,
  }
  const update = (next: Partial<BusinessSearchParams>) => {
    const merged = { ...params, page: 0, ...next }
    const query = new URLSearchParams()
    if (merged.keyword) query.set('q', merged.keyword)
    if (merged.status) query.set('trangThai', merged.status)
    if (merged.page > 0) query.set('trang', String(merged.page + 1))
    setSearchParams(query)
  }
  return { params, update }
}

export function useBusinessList(params: BusinessSearchParams) {
  return useQuery<PageResponse<Business>, ApiError>({
    queryKey: BUSINESS_QUERY_KEYS.list(params),
    queryFn: () => businessService.search(params),
    placeholderData: keepPreviousData,
  })
}

export function useBusiness(id: number | undefined) {
  return useQuery<Business, ApiError>({
    queryKey: BUSINESS_QUERY_KEYS.detail(id ?? 0),
    queryFn: () => businessService.get(id ?? 0),
    enabled: id !== undefined,
    retry,
  })
}

export function useBusinessManagers(id: number) {
  return useQuery<User[], ApiError>({
    queryKey: BUSINESS_QUERY_KEYS.managers(id),
    queryFn: () => businessService.managers(id),
  })
}

export function useBusinessMembers(id: number, params: BusinessMemberSearchParams) {
  return useQuery<PageResponse<BusinessMember>, ApiError>({
    queryKey: BUSINESS_QUERY_KEYS.members(id, params),
    queryFn: () => businessService.members(id, params),
    placeholderData: keepPreviousData,
  })
}

export function useBusinessMember(id: number | undefined, userId: number | undefined) {
  return useQuery<BusinessMemberDetail, ApiError>({
    queryKey: BUSINESS_QUERY_KEYS.member(id ?? 0, userId ?? 0),
    queryFn: () => businessService.member(id ?? 0, userId ?? 0),
    enabled: id !== undefined && userId !== undefined,
    retry,
  })
}

function useInvalidateBusinesses() {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEYS.all })
}

export function useCreateBusiness() {
  const invalidate = useInvalidateBusinesses()
  return useMutation<Business, ApiError, CreateBusinessPayload>({
    mutationFn: (payload) => businessService.create(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateBusiness(id: number) {
  const invalidate = useInvalidateBusinesses()
  return useMutation<Business, ApiError, BusinessPayload>({
    mutationFn: (payload) => businessService.update(id, payload),
    onSuccess: invalidate,
  })
}

export function useAddManager(id: number) {
  const invalidate = useInvalidateBusinesses()
  return useMutation<User, ApiError, BusinessManagerPayload>({
    mutationFn: (payload) => businessService.addManager(id, payload),
    onSuccess: invalidate,
  })
}

/** Alert phía trên form: chỉ một ô sai thì nêu thẳng, nhiều ô thì nhắc xem các ô được đánh dấu. */
export function businessFormErrorMessage(error: ApiError, fieldMessages: string[]): string {
  if (fieldMessages.length === 1 && error.status === 409) return `${fieldMessages[0]}.`
  if (fieldMessages.length > 0) {
    return 'Một số thông tin chưa hợp lệ. Vui lòng kiểm tra lại các ô được đánh dấu bên dưới.'
  }
  if (error.code === API_ERROR_CODES.BUSINESS_NOT_FOUND) {
    return 'Doanh nghiệp không còn tồn tại. Vui lòng tải lại trang.'
  }
  return apiErrorMessage(error, {
    fallback: 'Chưa lưu được. Vui lòng thử lại.',
    byStatus: { 403: 'Tài khoản của bạn không có quyền quản lý doanh nghiệp.' },
  })
}
