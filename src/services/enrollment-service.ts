import { http } from '@/services/http'
import type { ApiResponse, PageResponse } from '@/types/api'
import type {
  Enrollment,
  EnrollmentAdminSearchParams,
  EnrollmentSearchParams,
  EnrollmentStatus,
  MonthlyRevenue,
  MonthlyRevenueParams,
  RevenueSummary,
} from '@/types/course'

export const enrollmentService = {
  /** Ghi danh khoá PUBLISHED: 201 (mới) hoặc 200 (ghi danh lại lượt đã huỷ). */
  async enroll(courseId: number): Promise<Enrollment> {
    const { data } = await http.post<ApiResponse<Enrollment>>(`/courses/${courseId}/enrollments`)
    return data.data
  },

  /** Huỷ ghi danh (chuyển CANCELLED). Khoá đã hoàn thành → 409 `ENROLLMENT_COMPLETED`. */
  async cancel(courseId: number): Promise<void> {
    await http.delete(`/courses/${courseId}/enrollments/me`)
  },

  /** Khoá của người đang đăng nhập, ghi danh mới nhất trước. */
  async listMine(params: EnrollmentSearchParams = {}): Promise<PageResponse<Enrollment>> {
    const { data } = await http.get<ApiResponse<PageResponse<Enrollment>>>('/auth/me/enrollments', {
      params,
    })
    return data.data
  },

  /** SUPER_ADMIN / ADMIN. Học viên của một khoá, mới nhất trước. */
  async listByCourse(
    courseId: number,
    params: EnrollmentSearchParams = {},
  ): Promise<PageResponse<Enrollment>> {
    const { data } = await http.get<ApiResponse<PageResponse<Enrollment>>>(
      `/courses/${courseId}/enrollments`,
      { params },
    )
    return data.data
  },

  /** SUPER_ADMIN / ADMIN. Lượt đăng ký của mọi khoá, vd. `status: 'PENDING'` cho hàng chờ duyệt. */
  async search(params: EnrollmentAdminSearchParams = {}): Promise<PageResponse<Enrollment>> {
    const { data } = await http.get<ApiResponse<PageResponse<Enrollment>>>('/enrollments', {
      params,
    })
    return data.data
  },

  /** SUPER_ADMIN / ADMIN. Tổng học phí các lượt đã duyệt trong tuần (từ thứ Hai), tháng, năm hiện tại. */
  async revenue(): Promise<RevenueSummary> {
    const { data } = await http.get<ApiResponse<RevenueSummary>>('/enrollments/revenue')
    return data.data
  },

  /** SUPER_ADMIN / ADMIN. Doanh thu một tháng: tổng, theo khoá và từng khoản thu (ai trả, bao nhiêu). */
  async monthlyRevenue(params: MonthlyRevenueParams = {}): Promise<MonthlyRevenue> {
    const { data } = await http.get<ApiResponse<MonthlyRevenue>>('/enrollments/revenue/monthly', {
      params,
    })
    return data.data
  },

  /** SUPER_ADMIN / ADMIN, vd. xác nhận hoàn thành. Đã cấp chứng chỉ → 409 `CERTIFIED_ENROLLMENT_LOCKED`. */
  async updateStatus(
    courseId: number,
    enrollmentId: number,
    status: EnrollmentStatus,
  ): Promise<Enrollment> {
    const { data } = await http.put<ApiResponse<Enrollment>>(
      `/courses/${courseId}/enrollments/${enrollmentId}`,
      { status },
    )
    return data.data
  },
}
