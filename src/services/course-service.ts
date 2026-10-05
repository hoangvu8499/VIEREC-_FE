import { http } from '@/services/http'
import type { ApiResponse, PageResponse } from '@/types/api'
import type {
  Course,
  CourseDetail,
  CoursePayload,
  CourseSearchParams,
  Lesson,
  LessonPayload,
} from '@/types/course'

/** `onProgress` nhận 0–100. */
type UploadProgress = (percent: number) => void

function lessonFormData(payload: LessonPayload): FormData {
  const form = new FormData()
  form.append('title', payload.title)
  form.append('instructions', payload.instructions)
  form.append('sortOrder', String(payload.sortOrder))
  // Sửa bài: không gửi tài liệu thì backend giữ tài liệu cũ.
  if (payload.documentFile) form.append('documentFile', payload.documentFile)
  // Luôn gửi: khi sửa, thiếu `videoUrl` nghĩa là xoá link.
  form.append('videoUrl', payload.videoUrl ?? '')
  if (payload.removeVideo) form.append('removeVideo', 'true')
  return form
}

function uploadConfig(onProgress?: UploadProgress) {
  return {
    // Instance mặc định là JSON — axios sẽ đổi FormData thành JSON nếu không ghi đè.
    // Với multipart, trình duyệt tự thêm boundary.
    headers: { 'Content-Type': 'multipart/form-data' },
    // Video tới 500MB nên không đặt timeout.
    timeout: 0,
    onUploadProgress: (event: { loaded: number; total?: number }) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100))
    },
  }
}

export const courseService = {
  /** Công khai; admin thấy mọi trạng thái, người khác chỉ thấy PUBLISHED. */
  async list(params: CourseSearchParams = {}): Promise<PageResponse<Course>> {
    const { data } = await http.get<ApiResponse<PageResponse<Course>>>('/courses', { params })
    return data.data
  },

  /** Công khai; người không phải admin xem khoá chưa PUBLISHED → 404. */
  async get(id: number): Promise<CourseDetail> {
    const { data } = await http.get<ApiResponse<CourseDetail>>(`/courses/${id}`)
    return data.data
  },

  /** SUPER_ADMIN / ADMIN. */
  async create(payload: CoursePayload): Promise<Course> {
    const { data } = await http.post<ApiResponse<Course>>('/courses', payload)
    return data.data
  },

  /** SUPER_ADMIN / ADMIN. Tất cả field bắt buộc như lúc tạo. */
  async update(id: number, payload: CoursePayload): Promise<Course> {
    const { data } = await http.put<ApiResponse<Course>>(`/courses/${id}`, payload)
    return data.data
  },

  /** SUPER_ADMIN / ADMIN. Xoá mềm (204) — sau đó mọi thao tác với khoá trả 404. */
  async remove(id: number): Promise<void> {
    await http.delete(`/courses/${id}`)
  },

  /** SUPER_ADMIN / ADMIN. Bắt buộc tài liệu; video (file / link) tuỳ chọn. */
  async createLesson(
    courseId: number,
    payload: LessonPayload,
    onProgress?: UploadProgress,
  ): Promise<Lesson> {
    const { data } = await http.post<ApiResponse<Lesson>>(
      `/courses/${courseId}/lessons`,
      lessonFormData(payload),
      uploadConfig(onProgress),
    )
    return data.data
  },

  /** SUPER_ADMIN / ADMIN. File không gửi thì giữ file cũ; `videoUrl` luôn ghi đè. */
  async updateLesson(
    courseId: number,
    lessonId: number,
    payload: LessonPayload,
    onProgress?: UploadProgress,
  ): Promise<Lesson> {
    const { data } = await http.put<ApiResponse<Lesson>>(
      `/courses/${courseId}/lessons/${lessonId}`,
      lessonFormData(payload),
      uploadConfig(onProgress),
    )
    return data.data
  },

  /** SUPER_ADMIN / ADMIN. Xoá mềm (204); thứ tự của bài đã xoá dùng lại được. */
  async removeLesson(courseId: number, lessonId: number): Promise<void> {
    await http.delete(`/courses/${courseId}/lessons/${lessonId}`)
  },
}
