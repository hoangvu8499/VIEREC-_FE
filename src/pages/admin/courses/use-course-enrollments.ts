import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { API_ERROR_CODES } from '@/constants/api-error-codes'
import {
  CERTIFICATE_QUERY_KEYS,
  COURSE_QUERY_KEYS,
  ENROLLMENT_PAGE_SIZE,
  ENROLLMENT_QUERY_KEYS,
  ENROLLMENT_STATUSES,
} from '@/constants/course'
import { PAYMENT_PAGE_SIZE, PAYMENT_QUERY_KEYS } from '@/constants/payment'
import { certificateService } from '@/services/certificate-service'
import { enrollmentService } from '@/services/enrollment-service'
import { paymentService } from '@/services/payment-service'
import type { ApiError, PageResponse } from '@/types/api'
import type { Certificate, Enrollment, EnrollmentStatus } from '@/types/course'
import type { Payment } from '@/types/payment'
import { apiErrorMessage } from '@/utils/api-error-message'

/** Tham số trên URL (`?trang-thai=COMPLETED&trang=2`), trang đếm từ 1. */
const PARAM = { STATUS: 'trang-thai', PAGE: 'trang', KEYWORD: 'q' } as const

function isEnrollmentStatus(value: string | null): value is EnrollmentStatus {
  return ENROLLMENT_STATUSES.some((status) => status === value)
}

export function useEnrollmentListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get(PARAM.STATUS)
  const pageParam = Number(searchParams.get(PARAM.PAGE))
  const status = isEnrollmentStatus(statusParam) ? statusParam : undefined
  const page = Number.isInteger(pageParam) && pageParam > 1 ? pageParam - 1 : 0

  const update = (next: { status?: EnrollmentStatus; page: number }) => {
    const search = new URLSearchParams()
    if (next.status) search.set(PARAM.STATUS, next.status)
    if (next.page) search.set(PARAM.PAGE, String(next.page + 1))
    setSearchParams(search)
  }

  return {
    status,
    page,
    /** Đổi bộ lọc thì về trang đầu. */
    setStatus: (nextStatus: EnrollmentStatus | undefined) =>
      update({ status: nextStatus, page: 0 }),
    setPage: (nextPage: number) => update({ status, page: nextPage }),
  }
}

/** Trang duyệt đăng ký: `?q=nguyen&trang=2`. */
export function useEnrollmentRequestParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Number(searchParams.get(PARAM.PAGE))
  const keyword = searchParams.get(PARAM.KEYWORD)?.trim() || undefined
  const page = Number.isInteger(pageParam) && pageParam > 1 ? pageParam - 1 : 0

  const update = (next: { keyword?: string; page: number }) => {
    const search = new URLSearchParams()
    if (next.keyword) search.set(PARAM.KEYWORD, next.keyword)
    if (next.page) search.set(PARAM.PAGE, String(next.page + 1))
    setSearchParams(search)
  }

  return {
    keyword,
    page,
    setKeyword: (nextKeyword: string | undefined) => update({ keyword: nextKeyword, page: 0 }),
    setPage: (nextPage: number) => update({ keyword, page: nextPage }),
  }
}

/** Thao tác của admin trên một lượt đăng ký và trạng thái đích. */
export const ENROLLMENT_ACTIONS = {
  /** Đã đối chiếu chuyển khoản → cho vào học. */
  approve: 'ENROLLED',
  reject: 'CANCELLED',
  complete: 'COMPLETED',
  /** Hoàn thành → về đang học. */
  reopen: 'ENROLLED',
} as const satisfies Record<string, EnrollmentStatus>

export type EnrollmentAction = keyof typeof ENROLLMENT_ACTIONS

/** Giao dịch của một học viên cho khoá, để đối chiếu trước khi duyệt. */
export function useEnrollmentPayments(courseId: number, userId: number | undefined) {
  const params = { courseId, userId, size: PAYMENT_PAGE_SIZE }
  return useQuery<PageResponse<Payment>, ApiError>({
    queryKey: PAYMENT_QUERY_KEYS.search(params),
    queryFn: () => paymentService.search(params),
    enabled: userId !== undefined,
  })
}

/** Bỏ trống `status`: mọi trạng thái (kể cả đã huỷ). */
export function useCourseEnrollments(
  courseId: number | undefined,
  { status, page }: { status?: EnrollmentStatus; page: number },
) {
  const params = { status, page, size: ENROLLMENT_PAGE_SIZE }
  return useQuery<PageResponse<Enrollment>, ApiError>({
    queryKey: ENROLLMENT_QUERY_KEYS.byCourse(courseId ?? 0, params),
    queryFn: () => enrollmentService.listByCourse(courseId ?? 0, params),
    placeholderData: keepPreviousData,
    enabled: courseId !== undefined,
  })
}

/** Yêu cầu chờ duyệt của mọi khoá. */
export function usePendingEnrollments({ keyword, page }: { keyword?: string; page: number }) {
  const params = { status: 'PENDING' as const, keyword, page, size: ENROLLMENT_PAGE_SIZE }
  return useQuery<PageResponse<Enrollment>, ApiError>({
    queryKey: ENROLLMENT_QUERY_KEYS.search(params),
    queryFn: () => enrollmentService.search(params),
    placeholderData: keepPreviousData,
  })
}

export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient()
  return useMutation<Enrollment, ApiError, { enrollment: Enrollment; status: EnrollmentStatus }>({
    mutationFn: ({ enrollment, status }) =>
      enrollmentService.updateStatus(enrollment.courseId, enrollment.id, status),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ENROLLMENT_QUERY_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all }),
      ]),
  })
}

export function useIssueCertificate(courseId: number) {
  const queryClient = useQueryClient()
  return useMutation<Certificate, ApiError, { enrollmentId: number; file: File }>({
    mutationFn: ({ enrollmentId, file }) => certificateService.issue(courseId, enrollmentId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CERTIFICATE_QUERY_KEYS.all }),
  })
}

/** Lỗi đổi trạng thái / cấp chứng chỉ ở trang admin → câu tiếng Việt. */
export function enrollmentAdminErrorMessage(error: ApiError, fallback: string): string {
  switch (error.code) {
    case API_ERROR_CODES.CERTIFIED_ENROLLMENT_LOCKED:
      return 'Học viên đã được cấp chứng chỉ nên không đổi được trạng thái.'
    case API_ERROR_CODES.CERTIFICATE_ALREADY_ISSUED:
      return 'Học viên này đã được cấp chứng chỉ cho khoá học.'
    case API_ERROR_CODES.ENROLLMENT_NOT_COMPLETED:
      return 'Cần xác nhận học viên đã hoàn thành trước khi cấp chứng chỉ.'
    case API_ERROR_CODES.ENROLLMENT_NOT_FOUND:
      return 'Lượt đăng ký không còn tồn tại. Vui lòng tải lại trang.'
    case API_ERROR_CODES.FILE_TYPE_NOT_ALLOWED:
      return 'Chứng chỉ phải là file PDF.'
    case API_ERROR_CODES.FILE_TOO_LARGE:
      return 'File PDF quá lớn.'
    default:
      return apiErrorMessage(error, {
        fallback,
        byStatus: { 403: 'Tài khoản của bạn không có quyền thực hiện thao tác này.' },
      })
  }
}
