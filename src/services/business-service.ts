import { http } from '@/services/http'
import type { ApiResponse, PageResponse } from '@/types/api'
import type {
  Business,
  BusinessEnrollPayload,
  BusinessEnrollResult,
  BusinessManagerPayload,
  BusinessMember,
  BusinessMemberDetail,
  BusinessMemberSearchParams,
  BusinessPayload,
  BusinessSearchParams,
  CreateBusinessPayload,
} from '@/types/business'
import type { Certificate } from '@/types/course'
import type { RegisterPayload, User } from '@/types/user'

/** `/businesses` — khách hàng doanh nghiệp, chỉ SUPER_ADMIN / ADMIN. */
export const businessService = {
  async search(params: BusinessSearchParams): Promise<PageResponse<Business>> {
    const { data } = await http.get<ApiResponse<PageResponse<Business>>>('/businesses', { params })
    return data.data
  },

  /** Tạo doanh nghiệp + tài khoản quản lý đầu tiên; trùng mã số thuế → 409 `TAX_CODE_ALREADY_EXISTS`. */
  async create(payload: CreateBusinessPayload): Promise<Business> {
    const { data } = await http.post<ApiResponse<Business>>('/businesses', payload)
    return data.data
  },

  async get(id: number): Promise<Business> {
    const { data } = await http.get<ApiResponse<Business>>(`/businesses/${id}`)
    return data.data
  },

  async update(id: number, payload: BusinessPayload): Promise<Business> {
    const { data } = await http.put<ApiResponse<Business>>(`/businesses/${id}`, payload)
    return data.data
  },

  async managers(id: number): Promise<User[]> {
    const { data } = await http.get<ApiResponse<User[]>>(`/businesses/${id}/managers`)
    return data.data
  },

  async addManager(id: number, payload: BusinessManagerPayload): Promise<User> {
    const { data } = await http.post<ApiResponse<User>>(`/businesses/${id}/managers`, payload)
    return data.data
  },

  async members(
    id: number,
    params: BusinessMemberSearchParams,
  ): Promise<PageResponse<BusinessMember>> {
    const { data } = await http.get<ApiResponse<PageResponse<BusinessMember>>>(
      `/businesses/${id}/members`,
      { params },
    )
    return data.data
  },

  async member(id: number, userId: number): Promise<BusinessMemberDetail> {
    const { data } = await http.get<ApiResponse<BusinessMemberDetail>>(
      `/businesses/${id}/members/${userId}`,
    )
    return data.data
  },
}

/**
 * `/my-business` — doanh nghiệp của người quản lý đang đăng nhập (role BUSINESS).
 * Tài khoản chưa gắn doanh nghiệp → 403 `NOT_A_BUSINESS_MANAGER`; doanh nghiệp ngừng → 403 `BUSINESS_INACTIVE`.
 */
export const myBusinessService = {
  async get(): Promise<Business> {
    const { data } = await http.get<ApiResponse<Business>>('/my-business')
    return data.data
  },

  async members(params: BusinessMemberSearchParams): Promise<PageResponse<BusinessMember>> {
    const { data } = await http.get<ApiResponse<PageResponse<BusinessMember>>>(
      '/my-business/members',
      { params },
    )
    return data.data
  },

  /** Tạo tài khoản học viên trong doanh nghiệp: cùng field và luật với đăng ký. */
  async createMember(payload: RegisterPayload): Promise<BusinessMember> {
    const { data } = await http.post<ApiResponse<BusinessMember>>('/my-business/members', payload)
    return data.data
  },

  async member(userId: number): Promise<BusinessMemberDetail> {
    const { data } = await http.get<ApiResponse<BusinessMemberDetail>>(
      `/my-business/members/${userId}`,
    )
    return data.data
  },

  /** Ghi danh hộ: tạo lượt `PENDING`, bỏ qua người đã chờ duyệt / đang học / đã hoàn thành khoá. */
  /** Chứng chỉ của học viên trong doanh nghiệp, mới cấp trước; keyword: mã, họ tên, tên khoá. */
  async certificates(params: BusinessMemberSearchParams): Promise<PageResponse<Certificate>> {
    const { data } = await http.get<ApiResponse<PageResponse<Certificate>>>(
      '/my-business/certificates',
      { params },
    )
    return data.data
  },

  /** Không thuộc học viên của doanh nghiệp → 404 `CERTIFICATE_NOT_FOUND`. */
  async certificate(code: string): Promise<Certificate> {
    const { data } = await http.get<ApiResponse<Certificate>>(
      `/my-business/certificates/${encodeURIComponent(code)}`,
    )
    return data.data
  },

  async enroll(payload: BusinessEnrollPayload): Promise<BusinessEnrollResult> {
    const { data } = await http.post<ApiResponse<BusinessEnrollResult>>(
      '/my-business/enrollments',
      payload,
    )
    return data.data
  },
}
