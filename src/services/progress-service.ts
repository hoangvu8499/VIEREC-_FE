import { http } from '@/services/http'
import type { ApiResponse } from '@/types/api'
import type { CourseProgress } from '@/types/business'

/** Tiến độ một video trên server: `videoKey` là `youtube-<mã>` hoặc `file-<id file>`. */
export interface VideoProgress {
  lessonId: number
  videoKey: string
  durationSeconds: number
  watchedSeconds: number
}

export interface MyCourseProgress extends CourseProgress {
  videos: VideoProgress[]
}

/**
 * Tiến độ xem video của học viên đang đăng nhập (chỉ khoá đã được duyệt, khác → 403 `PROGRESS_NOT_ALLOWED`).
 * Server chỉ tăng, không giảm: gửi số nhỏ hơn đã lưu thì bị bỏ qua.
 */
export const progressService = {
  async get(courseId: number): Promise<MyCourseProgress> {
    const { data } = await http.get<ApiResponse<MyCourseProgress>>(
      `/courses/${courseId}/my-progress`,
    )
    return data.data
  },

  async save(courseId: number, videos: VideoProgress[]): Promise<MyCourseProgress> {
    const { data } = await http.put<ApiResponse<MyCourseProgress>>(
      `/courses/${courseId}/my-progress`,
      { videos },
    )
    return data.data
  },
}
