import type { CourseDetail } from '@/types/course'

export { useCourseDetail, usePositiveIdParam } from '@/hooks/use-course-detail'

/** Thứ tự gợi ý cho bài mới: lớn nhất hiện có + 1 (thứ tự của bài đã xoá dùng lại được). */
export function nextSortOrder(course: CourseDetail | undefined): number {
  return Math.max(0, ...(course?.lessons.map((lesson) => lesson.sortOrder) ?? [])) + 1
}
