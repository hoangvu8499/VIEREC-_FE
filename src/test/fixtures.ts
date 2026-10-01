import type { PageResponse } from '@/types/api'
import type { Certificate, Course, CourseDetail, Enrollment, Lesson } from '@/types/course'
import type { User } from '@/types/user'
import type { Payment } from '@/types/payment'

/** User mẫu theo đúng response `POST /auth/register` của backend. */
export const USER_FIXTURE: User = {
  id: 1,
  username: 'nguyenvana',
  firstName: 'Văn A',
  lastName: 'Nguyễn',
  cccd: '001099012345',
  dateOfBirth: '1999-04-08',
  address: '12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  phoneNumber: '0901234567',
  email: 'nguyenvana@vierec.com',
  status: 'ACTIVE',
  roles: ['TRAINEE'],
  createdAt: '2026-09-25T23:54:06.9348554',
  updatedAt: '2026-09-25T23:54:06.9348554',
}

/** Khoá học mẫu theo đúng response `GET /courses` của backend. */
export const COURSE_FIXTURE: Course = {
  id: 7,
  name: 'Phòng cháy chữa cháy cơ bản',
  description: 'Kiến thức PCCC cơ bản cho nhân viên mới.',
  status: 'PUBLISHED',
  instructorId: 3,
  instructorUsername: 'vierec_admin',
  instructorName: 'Nguyễn Quản Trị',
  createdByUsername: 'vierec_admin',
  lessonCount: 2,
  myEnrollmentStatus: null,
  createdAt: '2026-09-26T09:08:13.4466152',
  updatedAt: '2026-09-26T09:08:13.4466152',
}

export function coursePage(
  content: Course[],
  page = 0,
  totalElements = content.length,
): PageResponse<Course> {
  return pageOf(content, page, totalElements)
}

/** Trang dữ liệu 10 dòng theo `PageResponse` của backend. */
export function pageOf<T>(content: T[], page = 0, totalElements = content.length): PageResponse<T> {
  const totalPages = Math.ceil(totalElements / 10)
  return {
    content,
    page,
    size: 10,
    totalElements,
    totalPages,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: content.length === 0,
  }
}

/** Bài học mẫu theo response `POST /courses/{id}/lessons` của backend. */
export const LESSON_FIXTURE: Lesson = {
  id: 11,
  courseId: 7,
  title: 'Nhận biết nguy cơ cháy nổ',
  instructions: 'Đọc tài liệu rồi xem video.',
  sortOrder: 1,
  documentUrl: '/api/v1/files/1',
  videoUrl: null,
  files: [
    {
      fileId: 1,
      fileType: 'DOCUMENT',
      originalName: 'bai-1.pdf',
      contentType: 'application/pdf',
      sizeBytes: 2048,
      url: '/api/v1/files/1',
      sortOrder: 1,
    },
    {
      fileId: 2,
      fileType: 'VIDEO',
      originalName: 'bai-1.mp4',
      contentType: 'video/mp4',
      sizeBytes: 5 * 1024 * 1024,
      url: '/api/v1/files/2',
      sortOrder: 2,
    },
  ],
  createdAt: '2026-09-26T09:08:39',
  updatedAt: '2026-09-26T09:08:39',
}

/** `GET /courses/7`: khoá mẫu với bài 1 và bài 3 (bài 2 đã xoá). */
export const COURSE_DETAIL_FIXTURE: CourseDetail = {
  id: COURSE_FIXTURE.id,
  name: COURSE_FIXTURE.name,
  description: COURSE_FIXTURE.description,
  status: COURSE_FIXTURE.status,
  instructorId: COURSE_FIXTURE.instructorId,
  instructorUsername: COURSE_FIXTURE.instructorUsername,
  instructorName: COURSE_FIXTURE.instructorName,
  createdByUsername: COURSE_FIXTURE.createdByUsername,
  myEnrollmentStatus: null,
  createdAt: COURSE_FIXTURE.createdAt,
  updatedAt: COURSE_FIXTURE.updatedAt,
  lessons: [
    LESSON_FIXTURE,
    // Bài chỉ có tài liệu + link video ngoài (không upload video).
    {
      ...LESSON_FIXTURE,
      id: 12,
      title: 'Sử dụng bình chữa cháy',
      sortOrder: 3,
      videoUrl: 'https://www.youtube.com/watch?v=abc123',
      files: LESSON_FIXTURE.files.filter((file) => file.fileType === 'DOCUMENT'),
    },
  ],
}

/** Lượt ghi danh mẫu theo response `POST /courses/1/enrollments` của backend. */
export const ENROLLMENT_FIXTURE: Enrollment = {
  id: 15,
  courseId: COURSE_FIXTURE.id,
  courseName: COURSE_FIXTURE.name,
  courseDescription: COURSE_FIXTURE.description,
  instructorName: COURSE_FIXTURE.instructorName,
  lessonCount: 3,
  userId: USER_FIXTURE.id,
  username: USER_FIXTURE.username,
  fullName: 'Nguyễn Văn A',
  status: 'ENROLLED',
  enrolledAt: '2026-09-26T13:43:14.862124',
  completedAt: null,
}

/** Chứng chỉ mẫu theo `CertificateResponse` của backend. */
export const CERTIFICATE_FIXTURE: Certificate = {
  id: 3,
  code: 'VRC-2026-7K3QX9PA',
  enrollmentId: ENROLLMENT_FIXTURE.id,
  courseId: COURSE_FIXTURE.id,
  courseName: COURSE_FIXTURE.name,
  fullName: 'Nguyễn Văn A',
  dateOfBirth: USER_FIXTURE.dateOfBirth,
  cccd: USER_FIXTURE.cccd,
  issuedAt: '2026-10-01T09:00:00',
  fileUrl: '/api/v1/files/42',
}

/** Giao dịch mẫu theo `PaymentResponse` của backend. */
export const PAYMENT_FIXTURE: Payment = {
  id: 12,
  userId: USER_FIXTURE.id,
  username: USER_FIXTURE.username,
  payerName: 'Nguyễn Văn A',
  payerEmail: USER_FIXTURE.email,
  payerPhone: USER_FIXTURE.phoneNumber,
  courseId: COURSE_FIXTURE.id,
  courseName: COURSE_FIXTURE.name,
  amount: 1500000,
  method: 'BANK_TRANSFER',
  status: 'PAID',
  transactionRef: 'FT26269123456',
  note: null,
  paidAt: '2026-09-26T10:00:00',
  createdByUsername: 'quantri',
  createdAt: '2026-09-26T09:30:00',
  updatedAt: '2026-09-26T10:00:00',
}
