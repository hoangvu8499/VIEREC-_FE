import {
  COURSE_FIELD_MESSAGES,
  courseSchema,
  LESSON_FIELD_MESSAGES,
  lessonSchema,
  lessonUpdateSchema,
} from '@/schemas/course-schema'

function fileOf(name: string, size = 10): File {
  const file = new File(['x'], name)
  Object.defineProperty(file, 'size', { value: size })
  return file
}

const VALID_LESSON = {
  title: '  Bài 1  ',
  instructions: 'Đọc tài liệu',
  sortOrder: ' 3 ',
  documentFile: fileOf('bai-1.PDF'),
  videoFile: fileOf('bai-1.mp4'),
  videoUrl: '',
  removeVideo: false,
}

function lessonErrors(values: Partial<Record<keyof typeof VALID_LESSON, unknown>>) {
  const result = lessonSchema.safeParse({ ...VALID_LESSON, ...values })
  return result.success
    ? {}
    : // Giữ lỗi đầu tiên mỗi field, như form hiển thị.
      Object.fromEntries(result.error.issues.toReversed().map((i) => [i.path[0], i.message]))
}

describe('courseSchema', () => {
  it('requires every field and an instructor', () => {
    const result = courseSchema.safeParse({ name: ' ', description: '', status: 'DRAFT' })
    expect(result.success).toBe(false)
    const messages = result.error?.issues.map((issue) => issue.message)
    expect(messages).toEqual([
      COURSE_FIELD_MESSAGES.name.required,
      COURSE_FIELD_MESSAGES.description.required,
      COURSE_FIELD_MESSAGES.instructorId.required,
    ])
  })

  it('trims text', () => {
    const result = courseSchema.parse({
      name: '  PCCC  ',
      description: ' Mô tả ',
      instructorId: 3,
      status: 'PUBLISHED',
    })
    expect(result).toEqual({
      name: 'PCCC',
      description: 'Mô tả',
      instructorId: 3,
      status: 'PUBLISHED',
    })
  })
})

describe('lessonSchema', () => {
  it('parses a valid lesson (sortOrder → number, text trimmed)', () => {
    const result = lessonSchema.parse(VALID_LESSON)
    expect(result.title).toBe('Bài 1')
    expect(result.sortOrder).toBe(3)
  })

  it.each([
    ['', LESSON_FIELD_MESSAGES.sortOrder.required],
    ['0', LESSON_FIELD_MESSAGES.sortOrder.invalid],
    ['1.5', LESSON_FIELD_MESSAGES.sortOrder.invalid],
    ['-2', LESSON_FIELD_MESSAGES.sortOrder.invalid],
    ['10001', LESSON_FIELD_MESSAGES.sortOrder.invalid],
  ])('sortOrder "%s" → %s', (sortOrder, message) => {
    expect(lessonErrors({ sortOrder }).sortOrder).toBe(message)
  })

  it('requires only the document; the video (file or link) is optional', () => {
    const errors = lessonErrors({ documentFile: undefined, videoFile: undefined })
    expect(errors.documentFile).toBe(LESSON_FIELD_MESSAGES.documentFile.required)
    expect(errors.videoFile).toBeUndefined()
  })

  it('accepts an empty or http(s) video link only', () => {
    expect(lessonErrors({ videoUrl: '  ' }).videoUrl).toBeUndefined()
    expect(lessonErrors({ videoUrl: ' https://youtu.be/abc ' }).videoUrl).toBeUndefined()
    expect(lessonErrors({ videoUrl: 'HTTP://example.com/v' }).videoUrl).toBeUndefined()
    for (const videoUrl of ['youtu.be/abc', 'ftp://x/v.mp4', 'https://x.com/a b']) {
      expect(lessonErrors({ videoUrl }).videoUrl).toBe(LESSON_FIELD_MESSAGES.videoUrl.invalid)
    }
    expect(lessonErrors({ videoUrl: `https://x.com/${'a'.repeat(2048)}` }).videoUrl).toBe(
      LESSON_FIELD_MESSAGES.videoUrl.tooLong,
    )
  })

  it('lets an edit keep both files', () => {
    const result = lessonUpdateSchema.safeParse({
      ...VALID_LESSON,
      documentFile: undefined,
      videoFile: undefined,
    })
    expect(result.success).toBe(true)
  })

  it('checks file type by extension (case-insensitive)', () => {
    expect(lessonErrors({ documentFile: fileOf('setup.exe') }).documentFile).toBe(
      LESSON_FIELD_MESSAGES.documentFile.type,
    )
    expect(lessonErrors({ videoFile: fileOf('bai-1.pdf') }).videoFile).toBe(
      LESSON_FIELD_MESSAGES.videoFile.type,
    )
    expect(lessonErrors({ videoFile: fileOf('CLIP.MOV') }).videoFile).toBeUndefined()
  })

  it('limits the document to 50 MB and the video to 500 MB', () => {
    const MB = 1024 * 1024
    expect(lessonErrors({ documentFile: fileOf('a.pdf', 50 * MB) }).documentFile).toBeUndefined()
    expect(lessonErrors({ documentFile: fileOf('a.pdf', 50 * MB + 1) }).documentFile).toBe(
      LESSON_FIELD_MESSAGES.documentFile.tooLarge,
    )
    expect(lessonErrors({ videoFile: fileOf('a.mp4', 500 * MB + 1) }).videoFile).toBe(
      LESSON_FIELD_MESSAGES.videoFile.tooLarge,
    )
    expect(LESSON_FIELD_MESSAGES.videoFile.tooLarge).toBe('Video tối đa 500 MB')
  })
})
