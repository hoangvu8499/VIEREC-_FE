import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { COURSE_QUERY_KEYS } from '@/constants/course'
import { courseService } from '@/services/course-service'
import type { ApiError } from '@/types/api'
import type { CourseDetail } from '@/types/course'

/** Id dương từ tham số URL; sai định dạng → `undefined`. */
export function usePositiveIdParam(name: 'courseId' | 'lessonId'): number | undefined {
  const value = Number(useParams()[name])
  return Number.isInteger(value) && value > 0 ? value : undefined
}

/** `GET /courses/{id}` (kèm bài học và `myEnrollmentStatus`), dùng chung trang người dùng và admin. */
export function useCourseDetail(courseId: number | undefined) {
  return useQuery<CourseDetail, ApiError>({
    queryKey: COURSE_QUERY_KEYS.detail(courseId ?? 0),
    queryFn: () => courseService.get(courseId ?? 0),
    enabled: courseId !== undefined,
    // Khoá không tồn tại / đã xoá thì thử lại cũng vô ích.
    retry: (count, error) => error.code !== API_ERROR_CODES.COURSE_NOT_FOUND && count < 1,
  })
}
