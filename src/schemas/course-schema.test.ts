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
      COURSE_FIELD_MESSAGES.price.required,
    ])
  })

  it('reads the price with or without thousands separators', () => {
    const base = { name: 'PCCC', description: 'Mô tả', instructorId: 3, status: 'DRAFT' }
    expect(courseSchema.parse({ ...base, price: ' 1.500.000 ' }).price).toBe(1_500_000)
    expect(courseSchema.parse({ ...base, price: '100000' }).price).toBe(100_000)
    for (const price of ['', '999', '12,5', 'abc', '1000000001']) {
      const result = courseSchema.safeParse({ ...base, price })
      expect({ price, messages: result.error?.issues.map((issue) => issue.message) }).toEqual({
        price,
        messages: [
          price === '' ? COURSE_FIELD_MESSAGES.price.required : COURSE_FIELD_MESSAGES.price.invalid,
        ],
      })
    }
  })

  it('trims text', () => {
    const result = courseSchema.parse({
      name: '  PCCC  ',
      description: ' Mô tả ',
      instructorId: 3,
      price: '100000',
      status: 'PUBLISHED',
    })
    expect(result).toEqual({
      name: 'PCCC',
      description: 'Mô tả',
      instructorId: 3,
      price: 100000,
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

  it('requires only the document; the video link is optional', () => {
    const errors = lessonErrors({ documentFile: undefined, videoUrl: '' })
    expect(errors.documentFile).toBe(LESSON_FIELD_MESSAGES.documentFile.required)
    expect(errors.videoUrl).toBeUndefined()
  })

  it('accepts an empty or YouTube video link only', () => {
    expect(lessonErrors({ videoUrl: '  ' }).videoUrl).toBeUndefined()
    expect(lessonErrors({ videoUrl: ' https://youtu.be/dQw4w9WgXcQ ' }).videoUrl).toBeUndefined()
    expect(
      lessonErrors({ videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30' }).videoUrl,
    ).toBeUndefined()
    for (const videoUrl of [
      'youtu.be/dQw4w9WgXcQ',
      'https://youtu.be/abc',
      'https://drive.google.com/file/d/xyz/view',
      'https://x.com/a b',
    ]) {
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
    })
    expect(result.success).toBe(true)
  })

  it('checks file type by extension (case-insensitive)', () => {
    expect(lessonErrors({ documentFile: fileOf('setup.exe') }).documentFile).toBe(
      LESSON_FIELD_MESSAGES.documentFile.type,
    )
    expect(lessonErrors({ documentFile: fileOf('BAI-1.DOCX') }).documentFile).toBeUndefined()
  })

  it('limits the document to 50 MB', () => {
    const MB = 1024 * 1024
    expect(lessonErrors({ documentFile: fileOf('a.pdf', 50 * MB) }).documentFile).toBeUndefined()
    expect(lessonErrors({ documentFile: fileOf('a.pdf', 50 * MB + 1) }).documentFile).toBe(
      LESSON_FIELD_MESSAGES.documentFile.tooLarge,
    )
  })
})
