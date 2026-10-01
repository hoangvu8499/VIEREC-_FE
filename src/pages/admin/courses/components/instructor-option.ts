import type { CourseDetail } from '@/types/course'
import type { User } from '@/types/user'
import { userFullName } from '@/utils/user-full-name'

/** Giảng viên đang chọn — từ kết quả tìm (`User`) hoặc từ khoá đang sửa (chỉ có id/tên/username). */
export interface InstructorOption {
  id: number
  name: string
  username: string
  email?: string
}

export function toInstructorOption(user: User): InstructorOption {
  return { id: user.id, name: userFullName(user), username: user.username, email: user.email }
}

/** Giảng viên hiện tại của khoá đang sửa. */
export function courseInstructor(course: CourseDetail): InstructorOption {
  return {
    id: course.instructorId,
    name: course.instructorName,
    username: course.instructorUsername,
  }
}
