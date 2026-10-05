import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { API_ERROR_CODES } from '@/constants/api-error-codes'
import {
  CERTIFICATE_QUERY_KEYS,
  COURSE_QUERY_KEYS,
  ENROLLMENT_PAGE_SIZE,
  ENROLLMENT_QUERY_KEYS,
} from '@/constants/course'
import { certificateService } from '@/services/certificate-service'
import { enrollmentService } from '@/services/enrollment-service'
import type { ApiError, PageResponse } from '@/types/api'
import type { Certificate, Enrollment, EnrollmentSearchParams } from '@/types/course'
import { apiErrorMessage } from '@/utils/api-error-message'

/** Khoá của người đang đăng nhập (mặc định ENROLLED + COMPLETED). */
export function useMyEnrollments(
  { status, page = 0, size = ENROLLMENT_PAGE_SIZE }: EnrollmentSearchParams = {},
  { enabled = true }: { enabled?: boolean } = {},
) {
  const params: EnrollmentSearchParams = { status, page, size }
  return useQuery<PageResponse<Enrollment>, ApiError>({
    queryKey: ENROLLMENT_QUERY_KEYS.mine(params),
    queryFn: () => enrollmentService.listMine(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useMyCertificates(page = 0) {
  return useQuery<PageResponse<Certificate>, ApiError>({
    queryKey: CERTIFICATE_QUERY_KEYS.mine(page),
    queryFn: () => certificateService.listMine({ page, size: ENROLLMENT_PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })
}

export function useMyCertificate(code: string | undefined) {
  return useQuery<Certificate, ApiError>({
    queryKey: CERTIFICATE_QUERY_KEYS.myDetail(code ?? ''),
    queryFn: () => certificateService.getMine(code ?? ''),
    enabled: Boolean(code),
    retry: (count, error) => error.code !== API_ERROR_CODES.CERTIFICATE_NOT_FOUND && count < 1,
  })
}

/** Ghi danh / huỷ đổi cả danh sách của tôi lẫn `myEnrollmentStatus` của khoá học. */
function useInvalidateEnrollments() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ENROLLMENT_QUERY_KEYS.all }),
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all }),
    ])
}

export function useEnroll() {
  const invalidate = useInvalidateEnrollments()
  return useMutation<Enrollment, ApiError, number>({
    mutationFn: (courseId) => enrollmentService.enroll(courseId),
    onSettled: invalidate,
  })
}

export function useCancelEnrollment() {
  const invalidate = useInvalidateEnrollments()
  return useMutation<void, ApiError, number>({
    mutationFn: (courseId) => enrollmentService.cancel(courseId),
    onSettled: invalidate,
  })
}

/** Lỗi ghi danh / huỷ ghi danh của học viên → câu tiếng Việt. */
export function enrollmentErrorMessage(error: ApiError, fallback: string): string {
  switch (error.code) {
    case API_ERROR_CODES.ALREADY_ENROLLED:
      return 'Bạn đã đăng ký khoá học này rồi.'
    case API_ERROR_CODES.COURSE_NOT_FOUND:
      return 'Khoá học không tồn tại hoặc đã ngừng mở đăng ký.'
    case API_ERROR_CODES.ENROLLMENT_COMPLETED:
      return 'Bạn đã hoàn thành khoá học này nên không thể huỷ đăng ký.'
    case API_ERROR_CODES.ENROLLMENT_NOT_FOUND:
      return 'Bạn chưa đăng ký khoá học này.'
    default:
      return apiErrorMessage(error, {
        fallback,
        byStatus: { 401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' },
      })
  }
}
