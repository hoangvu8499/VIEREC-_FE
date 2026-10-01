import { API_ERROR_CODES } from '@/constants/api-error-codes'
import {
  COURSE_FIELD_MESSAGES,
  LESSON_FIELD_MESSAGES,
  type CourseField,
  type LessonField,
} from '@/schemas/course-schema'
import type { ApiError } from '@/types/api'

type FieldMessages = Record<string, { required: string; tooLong?: string; invalid?: string }>

/**
 * 400 theo field → tiếng Việt, theo mẫu message của `ValidationMessages.properties` backend
 * ("... is required", "... must be at most ...", "... must be at least ...").
 */
function fieldErrors<F extends string>(
  error: ApiError,
  messages: FieldMessages,
): Partial<Record<F, string>> {
  const result: Partial<Record<string, string>> = {}
  for (const { field, message } of error.fieldErrors ?? []) {
    const fieldMessages = messages[field]
    // Một field có thể có nhiều lỗi — giữ lỗi đầu tiên như validate phía client.
    if (!fieldMessages || result[field]) continue
    if (/\bis required\b|\bare required\b/i.test(message)) result[field] = fieldMessages.required
    else if (/must be at most/i.test(message) && fieldMessages.tooLong)
      result[field] = fieldMessages.tooLong
    // Không hiện message tiếng Anh của backend.
    else result[field] = fieldMessages.invalid ?? fieldMessages.required
  }
  return result as Partial<Record<F, string>>
}

/** Lỗi `POST /courses` → lỗi theo field của form khoá học. */
export function courseApiFieldErrors(error: ApiError): Partial<Record<CourseField, string>> {
  if (error.code === API_ERROR_CODES.INSTRUCTOR_NOT_FOUND) {
    return { instructorId: COURSE_FIELD_MESSAGES.instructorId.notFound }
  }
  if (error.code === API_ERROR_CODES.INSTRUCTOR_NOT_ACTIVE) {
    return { instructorId: COURSE_FIELD_MESSAGES.instructorId.notActive }
  }
  return fieldErrors<CourseField>(error, COURSE_FIELD_MESSAGES)
}

/**
 * Lỗi `POST /courses/{id}/lessons` → lỗi theo field của form bài học.
 * Lỗi file (`VRC-400-301`, `VRC-413-301`) không cho biết file nào → hiện ở Alert đầu form.
 */
export function lessonApiFieldErrors(error: ApiError): Partial<Record<LessonField, string>> {
  if (error.code === API_ERROR_CODES.LESSON_SORT_ORDER_TAKEN) {
    return { sortOrder: LESSON_FIELD_MESSAGES.sortOrder.taken }
  }
  return fieldErrors<LessonField>(error, LESSON_FIELD_MESSAGES)
}
