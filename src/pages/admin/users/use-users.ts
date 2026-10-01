import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router'

import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { USER_PAGE_SIZE, USER_QUERY_KEYS, USER_STATUSES } from '@/constants/user'
import { roleService } from '@/services/role-service'
import { userService, type UserSearchParams } from '@/services/user-service'
import type { ApiError, PageResponse } from '@/types/api'
import type { CreateUserPayload, Role, UpdateUserPayload, User, UserStatus } from '@/types/user'
import { apiErrorMessage } from '@/utils/api-error-message'

export const USER_GONE = 'Tài khoản không tồn tại hoặc đã bị xoá.'

/** Tham số trên URL (`?q=an&trang-thai=LOCKED&trang=2`), trang đếm từ 1. */
const PARAM = { PAGE: 'trang', KEYWORD: 'q', STATUS: 'trang-thai' } as const

function isUserStatus(value: string | null): value is UserStatus {
  return USER_STATUSES.some((status) => status === value)
}

export function useUserListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Number(searchParams.get(PARAM.PAGE))
  const statusParam = searchParams.get(PARAM.STATUS)
  const params = {
    page: Number.isInteger(pageParam) && pageParam > 1 ? pageParam - 1 : 0,
    keyword: searchParams.get(PARAM.KEYWORD)?.trim() || undefined,
    status: isUserStatus(statusParam) ? statusParam : undefined,
  }

  const update = (next: Partial<typeof params>) => {
    const merged = { ...params, ...next }
    const search = new URLSearchParams()
    if (merged.keyword) search.set(PARAM.KEYWORD, merged.keyword)
    if (merged.status) search.set(PARAM.STATUS, merged.status)
    if (merged.page) search.set(PARAM.PAGE, String(merged.page + 1))
    setSearchParams(search)
  }

  return {
    params,
    setPage: (page: number) => update({ page }),
    /** Đổi bộ lọc thì về trang đầu. */
    setFilters: (filters: { keyword?: string; status?: UserStatus }) =>
      update({ ...filters, page: 0 }),
  }
}

export function useUserList({ page, keyword, status }: UserSearchParams) {
  // Mới nhất trước (mặc định backend là cũ nhất trước).
  const params: UserSearchParams = {
    page,
    keyword,
    status,
    size: USER_PAGE_SIZE,
    sort: 'createdAt,desc',
  }
  return useQuery<PageResponse<User>, ApiError>({
    queryKey: USER_QUERY_KEYS.list(params),
    queryFn: () => userService.search(params),
    placeholderData: keepPreviousData,
  })
}

/** Id dương từ URL; sai định dạng → `undefined`. */
export function useUserIdParam(): number | undefined {
  const value = Number(useParams().userId)
  return Number.isInteger(value) && value > 0 ? value : undefined
}

export function useUserDetail(userId: number | undefined) {
  return useQuery<User, ApiError>({
    queryKey: USER_QUERY_KEYS.detail(userId ?? 0),
    queryFn: () => userService.get(userId ?? 0),
    enabled: userId !== undefined,
  })
}

/** Danh sách vai trò hiếm khi đổi → giữ lâu. */
export function useRoles() {
  return useQuery<Role[], ApiError>({
    queryKey: USER_QUERY_KEYS.roles,
    queryFn: roleService.list,
    staleTime: 10 * 60_000,
  })
}

function useInvalidateUsers() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all })
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers()
  return useMutation<User, ApiError, CreateUserPayload>({
    mutationFn: (payload) => userService.create(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateUser(userId: number) {
  const invalidate = useInvalidateUsers()
  return useMutation<User, ApiError, UpdateUserPayload>({
    mutationFn: (payload) => userService.update(userId, payload),
    onSuccess: invalidate,
  })
}

export function useAssignRoles(userId: number) {
  const invalidate = useInvalidateUsers()
  return useMutation<User, ApiError, string[]>({
    mutationFn: (roles) => userService.assignRoles(userId, roles),
    onSuccess: invalidate,
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, Pick<User, 'id'>>({
    mutationFn: (user) => userService.remove(user.id),
    onSuccess: (_data, user) => {
      const detailKey = USER_QUERY_KEYS.detail(user.id)
      // Chi tiết user vừa xoá: chỉ đánh dấu cũ (tải lại ngay sẽ 404 trong lúc chuyển trang).
      void queryClient.invalidateQueries({ queryKey: detailKey, refetchType: 'none' })
      return queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.join('|') !== detailKey.join('|'),
      })
    },
  })
}

/** Lỗi nghiệp vụ về vai trò / quyền (403, 404) → câu tiếng Việt. */
export function userActionErrorMessage(error: ApiError, fallback: string): string {
  switch (error.code) {
    case API_ERROR_CODES.SUPER_ADMIN_ROLE_FORBIDDEN:
      return 'Chỉ Quản trị cấp cao mới được cấp, gỡ hoặc thay đổi quyền Quản trị cấp cao.'
    case API_ERROR_CODES.OWN_ROLES_CHANGE_FORBIDDEN:
      return 'Bạn không thể tự thay đổi vai trò của chính mình.'
    case API_ERROR_CODES.ROLE_NOT_FOUND:
      return 'Vai trò không tồn tại. Vui lòng tải lại trang.'
    case API_ERROR_CODES.USER_NOT_FOUND:
      return USER_GONE
    default:
      return apiErrorMessage(error, {
        fallback,
        byStatus: { 403: 'Tài khoản của bạn không có quyền thực hiện thao tác này.' },
      })
  }
}

/**
 * Thông báo trong Alert đầu form tạo / sửa.
 * @param fieldMessages lỗi đã gắn vào từng ô (từ `userApiFieldErrors`).
 */
export function userFormErrorMessage(error: ApiError, fieldMessages: string[]): string {
  if (error.status === 409 && fieldMessages.length === 1) {
    return `${fieldMessages[0]}. Vui lòng dùng thông tin khác.`
  }
  if (fieldMessages.length > 0) {
    return 'Một số thông tin chưa hợp lệ. Vui lòng kiểm tra lại các ô được đánh dấu bên dưới.'
  }
  return userActionErrorMessage(error, 'Không lưu được tài khoản. Vui lòng kiểm tra lại thông tin.')
}
