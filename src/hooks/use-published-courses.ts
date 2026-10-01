import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { COURSE_QUERY_KEYS } from '@/constants/course'
import { courseService } from '@/services/course-service'
import type { ApiError, PageResponse } from '@/types/api'
import type { Course, CourseSearchParams } from '@/types/course'

/**
 * Khoá đã xuất bản. Luôn gửi `status=PUBLISHED`: admin xem trang người dùng cũng chỉ thấy khoá công khai
 * (backend trả mọi trạng thái cho admin nếu không lọc).
 */
export function usePublishedCourses({
  page = 0,
  keyword,
}: Pick<CourseSearchParams, 'page' | 'keyword'>) {
  const params: CourseSearchParams = { page, keyword, status: 'PUBLISHED' }
  return useQuery<PageResponse<Course>, ApiError>({
    queryKey: COURSE_QUERY_KEYS.list(params),
    queryFn: () => courseService.list(params),
    placeholderData: keepPreviousData,
  })
}
