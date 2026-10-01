import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { COURSE_QUERY_KEYS, COURSE_STATUSES } from '@/constants/course'
import { courseService } from '@/services/course-service'
import type { ApiError, PageResponse } from '@/types/api'
import type { Course, CourseSearchParams, CourseStatus } from '@/types/course'

/** Tên tham số trên URL (`?trang=2&q=pccc&trang-thai=DRAFT`) — trang đếm từ 1 cho dễ đọc. */
const PARAM = { PAGE: 'trang', KEYWORD: 'q', STATUS: 'trang-thai' } as const

function isCourseStatus(value: string | null): value is CourseStatus {
  return COURSE_STATUSES.some((status) => status === value)
}

/** Bộ lọc + trang lưu trên URL: F5, bấm Back hay gửi link vẫn giữ nguyên. */
export function useCourseListParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const pageParam = Number(searchParams.get(PARAM.PAGE))
  const statusParam = searchParams.get(PARAM.STATUS)
  const params: CourseSearchParams = {
    page: Number.isInteger(pageParam) && pageParam > 1 ? pageParam - 1 : 0,
    keyword: searchParams.get(PARAM.KEYWORD)?.trim() || undefined,
    status: isCourseStatus(statusParam) ? statusParam : undefined,
  }

  const update = (next: CourseSearchParams) => {
    const merged = { ...params, ...next }
    const search = new URLSearchParams()
    if (merged.keyword) search.set(PARAM.KEYWORD, merged.keyword)
    if (merged.status) search.set(PARAM.STATUS, merged.status)
    if (merged.page) search.set(PARAM.PAGE, String(merged.page + 1))
    setSearchParams(search)
  }

  return {
    params,
    setPage: (page: number) => update({ page }),
    /** Đổi bộ lọc thì quay về trang đầu. */
    setFilters: (filters: Pick<CourseSearchParams, 'keyword' | 'status'>) =>
      update({ ...filters, page: 0 }),
  }
}

export function useCourseList(params: CourseSearchParams) {
  return useQuery<PageResponse<Course>, ApiError>({
    queryKey: COURSE_QUERY_KEYS.list(params),
    queryFn: () => courseService.list(params),
    // Giữ bảng cũ trong lúc tải trang mới, tránh nháy trắng.
    placeholderData: keepPreviousData,
  })
}
