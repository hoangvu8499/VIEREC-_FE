import { z } from 'zod'

import { COURSE_STATUSES, LESSON_FILE_RULES } from '@/constants/course'
import type { CourseDetail, CoursePayload, Lesson, LessonPayload } from '@/types/course'
import { formatVnd } from '@/utils/format-currency'
import { formatFileSize } from '@/utils/format-file-size'
import { youtubeVideoId } from '@/utils/youtube-video-id'

/** Giới hạn độ dài theo `CreateCourseRequest` / `CreateLessonRequest` của backend. */
export const COURSE_NAME_MAX = 200
export const LESSON_TITLE_MAX = 200
export const LONG_TEXT_MAX = 10_000
export const SORT_ORDER_MAX = 10_000
export const VIDEO_URL_MAX = 2048
/** Học phí (VND), khớp `CourseRequest.PRICE_MIN/MAX` của backend. 1.000 ₫ là mức chuyển khoản tối thiểu. */
export const COURSE_PRICE_MIN = 1_000
export const COURSE_PRICE_MAX = 1_000_000_000

const DOC = LESSON_FILE_RULES.document

function extensionList(extensions: readonly string[]): string {
  return extensions.map((extension) => extension.toUpperCase()).join(', ')
}

/** Thông báo lỗi từng field — dùng chung cho validate phía client và dịch lỗi từ backend. */
export const COURSE_FIELD_MESSAGES = {
  name: {
    required: 'Vui lòng nhập tên khoá học',
    tooLong: `Tên khoá học tối đa ${COURSE_NAME_MAX} ký tự`,
  },
  description: {
    required: 'Vui lòng nhập mô tả khoá học',
    tooLong: `Mô tả tối đa ${LONG_TEXT_MAX.toLocaleString('vi-VN')} ký tự`,
  },
  instructorId: {
    required: 'Vui lòng chọn giảng viên',
    invalid: 'Giảng viên không hợp lệ. Vui lòng chọn lại.',
    notFound: 'Không tìm thấy tài khoản giảng viên này. Vui lòng chọn người khác.',
    notActive: 'Tài khoản giảng viên chưa được kích hoạt. Vui lòng chọn người khác.',
  },
  price: {
    required: 'Vui lòng nhập học phí',
    invalid: `Học phí là số tiền từ ${formatVnd(COURSE_PRICE_MIN)} đến ${formatVnd(COURSE_PRICE_MAX)}`,
  },
  status: { required: 'Vui lòng chọn trạng thái', invalid: 'Trạng thái không hợp lệ' },
} as const

export const LESSON_FIELD_MESSAGES = {
  title: {
    required: 'Vui lòng nhập tên bài học',
    tooLong: `Tên bài học tối đa ${LESSON_TITLE_MAX} ký tự`,
  },
  instructions: {
    required: 'Vui lòng nhập hướng dẫn học',
    tooLong: `Hướng dẫn tối đa ${LONG_TEXT_MAX.toLocaleString('vi-VN')} ký tự`,
  },
  sortOrder: {
    required: 'Vui lòng nhập thứ tự bài học',
    invalid: `Thứ tự phải là số nguyên từ 1 đến ${SORT_ORDER_MAX.toLocaleString('vi-VN')}`,
    taken: 'Thứ tự này đã có bài học khác trong khoá. Vui lòng chọn số khác.',
  },
  documentFile: {
    required: 'Vui lòng chọn file tài liệu',
    type: `Tài liệu phải là file ${extensionList(DOC.extensions)}`,
    tooLarge: `Tài liệu tối đa ${formatFileSize(DOC.maxBytes)}`,
  },
  videoUrl: {
    required: 'Vui lòng nhập link video',
    invalid: 'Chỉ nhận link YouTube, vd. https://www.youtube.com/watch?v=… hoặc https://youtu.be/…',
    tooLong: `Link video tối đa ${VIDEO_URL_MAX.toLocaleString('vi-VN')} ký tự`,
  },
  removeVideo: { required: 'Lựa chọn gỡ video không hợp lệ' },
} as const

const C = COURSE_FIELD_MESSAGES
const L = LESSON_FIELD_MESSAGES

function requiredText(message: string, max: number, tooLong: string) {
  return z.string().trim().min(1, message).max(max, tooLong)
}

/** Không dùng `instanceof File`: sai với File tạo ở cửa sổ/iframe khác. */
function isFile(value: unknown): value is File {
  return Object.prototype.toString.call(value) === '[object File]'
}

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  return dot < 0 ? '' : fileName.slice(dot + 1).toLowerCase()
}

/**
 * File đúng đuôi và không quá dung lượng (backend kiểm tra lại).
 * `required = false` (sửa bài học): để trống = giữ file cũ.
 */
function fileRule(
  { extensions, maxBytes }: { extensions: readonly string[]; maxBytes: number },
  messages: { required: string; type: string; tooLarge: string },
  required: boolean,
) {
  // Các refine sau vẫn chạy khi đã lỗi "bắt buộc" → phải tự kiểm tra lại là File.
  return z
    .custom<File | undefined>(
      (value) => isFile(value) || (!required && value === undefined),
      messages.required,
    )
    .refine((file) => !isFile(file) || extensions.includes(extensionOf(file.name)), messages.type)
    .refine((file) => !isFile(file) || file.size <= maxBytes, messages.tooLarge)
}

export const courseSchema = z.object({
  name: requiredText(C.name.required, COURSE_NAME_MAX, C.name.tooLong),
  description: requiredText(C.description.required, LONG_TEXT_MAX, C.description.tooLong),
  instructorId: z.number(C.instructorId.required).int().positive(C.instructorId.required),
  // Ô chữ để nhập được cả "100.000"; bỏ dấu chấm / dấu cách rồi đổi sang số.
  price: z
    .string(C.price.required)
    .transform((value) => value.replace(/[.\s]/g, ''))
    .pipe(
      z.string().min(1, { error: C.price.required, abort: true }).regex(/^\d+$/, C.price.invalid),
    )
    .transform(Number)
    .pipe(z.number().min(COURSE_PRICE_MIN, C.price.invalid).max(COURSE_PRICE_MAX, C.price.invalid)),
  status: z.enum(COURSE_STATUSES, C.status.required),
})

export type CourseFormInput = z.input<typeof courseSchema>
export type CourseFormValues = z.output<typeof courseSchema>
export type CourseField = keyof typeof COURSE_FIELD_MESSAGES

/** Tạo mới: `instructorId` chưa chọn là `undefined`, học phí trống, trạng thái bản nháp. Sửa: lấy từ khoá. */
export function courseFormValues(course?: CourseDetail): Partial<CourseFormInput> {
  return {
    name: course?.name ?? '',
    description: course?.description ?? '',
    instructorId: course?.instructorId,
    price: course ? String(course.price) : '',
    status: course?.status ?? 'DRAFT',
  }
}

export function toCoursePayload(values: CourseFormValues): CoursePayload {
  return values
}

/** Tạo: bắt buộc tài liệu. Sửa: để trống thì giữ tài liệu cũ. Video tuỳ chọn, chỉ là link YouTube (khớp `@YoutubeUrl` BE). */
function lessonSchemaOf(isCreate: boolean) {
  return z.object({
    title: requiredText(L.title.required, LESSON_TITLE_MAX, L.title.tooLong),
    instructions: requiredText(L.instructions.required, LONG_TEXT_MAX, L.instructions.tooLong),
    // Ô số giữ dạng chuỗi (ô rỗng không thành NaN) rồi đổi sang number.
    sortOrder: z
      .string()
      .trim()
      // Ô trống chỉ báo "bắt buộc", không báo thêm "phải là số".
      .min(1, { error: L.sortOrder.required, abort: true })
      .regex(/^\d+$/, L.sortOrder.invalid)
      .transform(Number)
      .pipe(z.number().min(1, L.sortOrder.invalid).max(SORT_ORDER_MAX, L.sortOrder.invalid)),
    documentFile: fileRule(DOC, L.documentFile, isCreate),
    videoUrl: z
      .string()
      .trim()
      .max(VIDEO_URL_MAX, L.videoUrl.tooLong)
      .refine((url) => url === '' || youtubeVideoId(url) !== null, L.videoUrl.invalid),
    removeVideo: z.boolean(),
  })
}

/** Tạo bài học: bắt buộc tài liệu. */
export const lessonSchema = lessonSchemaOf(true)
/** Sửa bài học: file để trống thì giữ file cũ. */
export const lessonUpdateSchema = lessonSchemaOf(false)

export type LessonFormInput = z.input<typeof lessonSchema>
export type LessonFormValues = z.output<typeof lessonSchema>
export type LessonField = keyof typeof LESSON_FIELD_MESSAGES

/** Sửa: lấy từ bài học (file để trống). Tạo mới: thứ tự gợi ý `sortOrder`. */
export function lessonFormValues(lesson?: Lesson, sortOrder = 1): Partial<LessonFormInput> {
  return {
    title: lesson?.title ?? '',
    instructions: lesson?.instructions ?? '',
    sortOrder: String(lesson?.sortOrder ?? sortOrder),
    documentFile: undefined,
    videoUrl: lesson?.videoUrl ?? '',
    removeVideo: false,
  }
}

export function toLessonPayload(values: LessonFormValues): LessonPayload {
  return values
}

/** Chuỗi `accept` cho input file, vd. `.pdf,.docx`. */
export const LESSON_FILE_ACCEPT = {
  document: DOC.extensions.map((extension) => `.${extension}`).join(','),
} as const

export const LESSON_FILE_HINTS = {
  document: `${extensionList(DOC.extensions)} · tối đa ${formatFileSize(DOC.maxBytes)}`,
} as const
