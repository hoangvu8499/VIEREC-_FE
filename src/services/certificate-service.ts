import { http } from '@/services/http'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { Certificate, CertificateVerification } from '@/types/course'

export const certificateService = {
  /** Chứng chỉ của người đang đăng nhập, mới nhất trước. */
  async listMine(
    params: { page?: number; size?: number } = {},
  ): Promise<PageResponse<Certificate>> {
    const { data } = await http.get<ApiResponse<PageResponse<Certificate>>>(
      '/auth/me/certificates',
      { params },
    )
    return data.data
  },

  /** Công khai. Không có → 404 `CERTIFICATE_NOT_FOUND`. */
  async verify(code: string): Promise<CertificateVerification> {
    const { data } = await http.get<ApiResponse<CertificateVerification>>(
      `/certificates/${encodeURIComponent(code)}`,
    )
    return data.data
  },

  /** SUPER_ADMIN / ADMIN. Cấp chứng chỉ cho lượt ghi danh COMPLETED kèm file PDF. */
  async issue(courseId: number, enrollmentId: number, file: File): Promise<Certificate> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await http.post<ApiResponse<Certificate>>(
      `/courses/${courseId}/enrollments/${enrollmentId}/certificate`,
      form,
      // Instance mặc định JSON → phải ghi đè, trình duyệt tự thêm boundary.
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 0 },
    )
    return data.data
  },
}
