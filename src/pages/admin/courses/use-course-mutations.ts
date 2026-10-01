import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { API_ERROR_CODES } from '@/constants/api-error-codes'
import { COURSE_QUERY_KEYS } from '@/constants/course'
import { LESSON_FIELD_MESSAGES } from '@/schemas/course-schema'
import { courseService } from '@/services/course-service'
import type { ApiError } from '@/types/api'
import type { Course, CoursePayload, Lesson, LessonPayload } from '@/types/course'
import { apiErrorMessage } from '@/utils/api-error-message'

const INVALID_FIELDS =
  'Một số thông tin chưa hợp lệ. Vui lòng kiểm tra lại các ô được đánh dấu bên dưới.'
export const COURSE_GONE = 'Khoá học không tồn tại hoặc đã bị xoá.'
export const LESSON_GONE = 'Bài học không tồn tại hoặc đã bị xoá.'

/** Mọi thay đổi đều ảnh hưởng danh sách (số bài, tên...) và chi tiết → làm mới toàn bộ. */
function useInvalidateCourses() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all })
}

/** Tạo (không có `courseId`) hoặc sửa khoá học. */
export function useSaveCourse(courseId?: number) {
  const invalidate = useInvalidateCourses()
  return useMutation<Course, ApiError, CoursePayload>({
    mutationFn: (payload) =>
      courseId ? courseService.update(courseId, payload) : courseService.create(payload),
    onSuccess: invalidate,
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, Pick<Course, 'id' | 'name'>>({
    mutationFn: (course) => courseService.remove(course.id),
    onSuccess: (_data, course) => {
      const detailKey = COURSE_QUERY_KEYS.detail(course.id)
      // Chi tiết khoá vừa xoá: chỉ đánh dấu cũ, không tải lại ngay (sẽ 404 trong lúc chuyển trang).
      void queryClient.invalidateQueries({ queryKey: detailKey, refetchType: 'none' })
      return queryClient.invalidateQueries({
        queryKey: COURSE_QUERY_KEYS.all,
        predicate: (query) => query.queryKey.join('|') !== detailKey.join('|'),
      })
    },
  })
}

/** Tạo (không có `lessonId`) hoặc sửa bài học; kèm % đã tải file lên. */
export function useSaveLesson(courseId: number, lessonId?: number) {
  const invalidate = useInvalidateCourses()
  const [progress, setProgress] = useState(0)

  const mutation = useMutation<Lesson, ApiError, LessonPayload>({
    mutationFn: (payload) => {
      setProgress(0)
      return lessonId
        ? courseService.updateLesson(courseId, lessonId, payload, setProgress)
        : courseService.createLesson(courseId, payload, setProgress)
    },
    onSuccess: invalidate,
  })

  return { mutation, progress }
}

export function useDeleteLesson(courseId: number) {
  const invalidate = useInvalidateCourses()
  return useMutation<void, ApiError, Lesson>({
    mutationFn: (lesson) => courseService.removeLesson(courseId, lesson.id),
    onSuccess: invalidate,
  })
}

/**
 * Thông báo trong Alert đầu form khoá học.
 * @param fieldMessages lỗi đã gắn vào từng ô (từ `courseApiFieldErrors`).
 */
export function courseErrorMessage(error: ApiError, fieldMessages: string[]): string {
  if (fieldMessages.length === 1) return fieldMessages[0] ?? ''
  if (fieldMessages.length > 1) return INVALID_FIELDS
  if (error.code === API_ERROR_CODES.COURSE_NOT_FOUND) return COURSE_GONE
  return apiErrorMessage(error, {
    fallback: 'Không lưu được khoá học. Vui lòng kiểm tra lại thông tin.',
    byStatus: { 403: 'Tài khoản của bạn không có quyền quản lý khoá học.' },
  })
}

/**
 * Thông báo trong Alert đầu form bài học.
 * @param fieldMessages lỗi đã gắn vào từng ô (từ `lessonApiFieldErrors`).
 */
export function lessonErrorMessage(error: ApiError, fieldMessages: string[]): string {
  if (fieldMessages.length === 1) return fieldMessages[0] ?? ''
  if (fieldMessages.length > 1) return INVALID_FIELDS
  switch (error.code) {
    case API_ERROR_CODES.COURSE_NOT_FOUND:
      return COURSE_GONE
    case API_ERROR_CODES.LESSON_NOT_FOUND:
      return LESSON_GONE
    // Backend không nói file nào sai → nhắc cả hai quy định.
    case API_ERROR_CODES.FILE_TYPE_NOT_ALLOWED:
      return `File không đúng định dạng. ${LESSON_FIELD_MESSAGES.documentFile.type}; ${LESSON_FIELD_MESSAGES.videoFile.type}.`
    case API_ERROR_CODES.FILE_TOO_LARGE:
      return fileTooLargeMessage()
    default:
      return apiErrorMessage(error, {
        fallback: 'Không lưu được bài học. Vui lòng kiểm tra lại thông tin.',
        byStatus: {
          403: 'Tài khoản của bạn không có quyền quản lý bài học.',
          // 413 cũng có thể do proxy chặn trước khi tới backend (không có `code`).
          413: fileTooLargeMessage(),
        },
      })
  }
}

/** Lỗi khi xoá khoá học / bài học (hiện trong hộp thoại xác nhận). */
export function deleteErrorMessage(error: ApiError): string {
  if (error.code === API_ERROR_CODES.COURSE_NOT_FOUND) return COURSE_GONE
  if (error.code === API_ERROR_CODES.LESSON_NOT_FOUND) return LESSON_GONE
  return apiErrorMessage(error, {
    fallback: 'Không xoá được. Vui lòng thử lại.',
    byStatus: { 403: 'Tài khoản của bạn không có quyền xoá.' },
  })
}

function fileTooLargeMessage(): string {
  return `File quá dung lượng cho phép. ${LESSON_FIELD_MESSAGES.documentFile.tooLarge}; ${LESSON_FIELD_MESSAGES.videoFile.tooLarge}.`
}
