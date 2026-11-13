import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { BUSINESS_QUERY_KEYS, MEMBER_IMPORT_RULES } from '@/constants/business'
import { CONTACT } from '@/constants/contact'
import { COURSE_QUERY_KEYS, ENROLLMENT_QUERY_KEYS } from '@/constants/course'
import { myBusinessService } from '@/services/business-service'
import type { ApiError, PageResponse } from '@/types/api'
import type {
  Business,
  BusinessEnrollPayload,
  BusinessEnrollResult,
  BusinessMember,
  BusinessMemberDetail,
  BusinessMemberImportResult,
  BusinessMemberSearchParams,
} from '@/types/business'
import type { Certificate } from '@/types/course'
import type { RegisterPayload } from '@/types/user'
import { apiErrorMessage } from '@/utils/api-error-message'
import { formatFileSize } from '@/utils/format-file-size'

/** Lỗi không thử lại: tài khoản chưa gắn doanh nghiệp, doanh nghiệp ngừng, học viên không thuộc doanh nghiệp. */
const FINAL_ERRORS: readonly string[] = [
  API_ERROR_CODES.NOT_A_BUSINESS_MANAGER,
  API_ERROR_CODES.BUSINESS_INACTIVE,
  API_ERROR_CODES.BUSINESS_MEMBER_NOT_FOUND,
  API_ERROR_CODES.CERTIFICATE_NOT_FOUND,
]

const retry = (count: number, error: ApiError) =>
  !FINAL_ERRORS.includes(error.code ?? '') && error.status !== 403 && count < 1

export function useMyBusiness() {
  return useQuery<Business, ApiError>({
    queryKey: BUSINESS_QUERY_KEYS.mine,
    queryFn: () => myBusinessService.get(),
    retry,
  })
}

export function useMyMembers(params: BusinessMemberSearchParams) {
  return useQuery<PageResponse<BusinessMember>, ApiError>({
    queryKey: BUSINESS_QUERY_KEYS.myMembers(params),
    queryFn: () => myBusinessService.members(params),
    placeholderData: keepPreviousData,
    retry,
  })
}

export function useMyMember(userId: number | undefined) {
  return useQuery<BusinessMemberDetail, ApiError>({
    queryKey: BUSINESS_QUERY_KEYS.myMember(userId ?? 0),
    queryFn: () => myBusinessService.member(userId ?? 0),
    enabled: userId !== undefined,
    retry,
  })
}

export function useMyCertificates(params: BusinessMemberSearchParams) {
  return useQuery<PageResponse<Certificate>, ApiError>({
    queryKey: BUSINESS_QUERY_KEYS.myCertificates(params),
    queryFn: () => myBusinessService.certificates(params),
    placeholderData: keepPreviousData,
    retry,
  })
}

export function useMyCertificate(code: string | undefined) {
  return useQuery<Certificate, ApiError>({
    queryKey: BUSINESS_QUERY_KEYS.myCertificate(code ?? ''),
    queryFn: () => myBusinessService.certificate(code ?? ''),
    enabled: Boolean(code),
    retry,
  })
}

export function useCreateMember() {
  const queryClient = useQueryClient()
  return useMutation<BusinessMember, ApiError, RegisterPayload>({
    mutationFn: (payload) => myBusinessService.createMember(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEYS.all }),
  })
}

export function useImportMembers() {
  const queryClient = useQueryClient()
  return useMutation<BusinessMemberImportResult, ApiError, { file: File; defaultPassword: string }>(
    {
      mutationFn: ({ file, defaultPassword }) =>
        myBusinessService.importMembers(file, defaultPassword),
      onSuccess: () => void queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEYS.all }),
    },
  )
}

export function useBusinessEnroll() {
  const queryClient = useQueryClient()
  return useMutation<BusinessEnrollResult, ApiError, BusinessEnrollPayload>({
    mutationFn: (payload) => myBusinessService.enroll(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEYS.all })
      void queryClient.invalidateQueries({ queryKey: ENROLLMENT_QUERY_KEYS.all })
      void queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all })
    },
  })
}

/** Lỗi chung của mọi API `/my-business`. */
export function businessErrorMessage(error: ApiError, fallback: string): string {
  if (error.code === API_ERROR_CODES.NOT_A_BUSINESS_MANAGER) {
    return `Tài khoản của bạn chưa được gắn với doanh nghiệp nào. Vui lòng gọi ${CONTACT.HOTLINE}.`
  }
  if (error.code === API_ERROR_CODES.BUSINESS_INACTIVE) {
    return `Doanh nghiệp đang tạm ngừng trên hệ thống. Vui lòng gọi ${CONTACT.HOTLINE} để được hỗ trợ.`
  }
  if (error.code === API_ERROR_CODES.BUSINESS_MEMBER_NOT_FOUND) {
    return 'Học viên không thuộc doanh nghiệp của bạn.'
  }
  return apiErrorMessage(error, { fallback })
}

export function createMemberErrorMessage(error: ApiError, fieldMessages: string[]): string {
  // 409: chỉ một field trùng — nêu thẳng trong Alert.
  if (error.status === 409 && fieldMessages.length === 1) {
    return `${fieldMessages[0]}. Người này có thể đã có tài khoản VIEREC: vui lòng liên hệ VIEREC để gắn vào doanh nghiệp.`
  }
  if (fieldMessages.length > 0) {
    return 'Một số thông tin chưa hợp lệ. Vui lòng kiểm tra lại các ô được đánh dấu bên dưới.'
  }
  return businessErrorMessage(error, 'Chưa tạo được tài khoản. Vui lòng thử lại.')
}

/** Lỗi import không gắn với dòng nào (dòng sai hiện riêng bằng `memberImportRowErrors`). */
export function memberImportErrorMessage(error: ApiError): string {
  switch (error.code) {
    case API_ERROR_CODES.MEMBER_IMPORT_INVALID_ROWS:
      return 'File có dòng chưa hợp lệ nên chưa tạo tài khoản nào. Sửa các dòng dưới đây rồi import lại.'
    case API_ERROR_CODES.MEMBER_IMPORT_UNREADABLE:
      return 'Không đọc được file. Hãy lưu lại đúng định dạng Excel (.xlsx), không đặt mật khẩu, rồi thử lại.'
    case API_ERROR_CODES.MEMBER_IMPORT_EMPTY:
      return 'File chưa có học viên nào. Nhập học viên từ dòng 2 của sheet “Học viên”.'
    case API_ERROR_CODES.MEMBER_IMPORT_TOO_MANY_ROWS:
      return `Mỗi file tối đa ${MEMBER_IMPORT_RULES.maxRows} học viên. Hãy chia thành nhiều file.`
    case API_ERROR_CODES.FILE_TYPE_NOT_ALLOWED:
      return 'Chỉ nhận file Excel .xlsx hoặc .xls.'
    case API_ERROR_CODES.FILE_TOO_LARGE:
      return `File tối đa ${formatFileSize(MEMBER_IMPORT_RULES.maxBytes)}.`
    default:
      if (error.fieldErrors?.some(({ field }) => field === 'defaultPassword')) {
        return 'Mật khẩu mặc định chưa hợp lệ: tối thiểu 8 ký tự và có ít nhất 1 ký tự đặc biệt.'
      }
      return businessErrorMessage(error, 'Không import được file. Vui lòng thử lại.')
  }
}

export function enrollErrorMessage(error: ApiError): string {
  if (error.code === API_ERROR_CODES.COURSE_NOT_FOUND) {
    return 'Khoá học không còn mở đăng ký. Vui lòng chọn khoá khác.'
  }
  if (error.code === API_ERROR_CODES.BUSINESS_ENROLL_NOT_MEMBERS) {
    return 'Có học viên không còn thuộc doanh nghiệp. Vui lòng tải lại trang.'
  }
  return businessErrorMessage(error, 'Chưa đăng ký được. Vui lòng thử lại.')
}
