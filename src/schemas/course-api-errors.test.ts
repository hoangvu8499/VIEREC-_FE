import { courseApiFieldErrors, lessonApiFieldErrors } from '@/schemas/course-api-errors'
import { COURSE_FIELD_MESSAGES, LESSON_FIELD_MESSAGES } from '@/schemas/course-schema'
import type { ApiError } from '@/types/api'

function validationError(errors: ApiError['fieldErrors']): ApiError {
  return { status: 400, code: 'VRC-400-001', message: 'Validation failed', fieldErrors: errors }
}

describe('courseApiFieldErrors', () => {
  it('maps instructor business errors to the instructor field', () => {
    expect(courseApiFieldErrors({ status: 404, code: 'VRC-404-202', message: '' })).toEqual({
      instructorId: COURSE_FIELD_MESSAGES.instructorId.notFound,
    })
    expect(courseApiFieldErrors({ status: 400, code: 'VRC-400-201', message: '' })).toEqual({
      instructorId: COURSE_FIELD_MESSAGES.instructorId.notActive,
    })
  })

  it('translates validation messages and never shows English', () => {
    const errors = courseApiFieldErrors(
      validationError([
        { field: 'name', message: 'Course name must be at most 200 characters' },
        { field: 'description', message: 'Course description is required' },
        // Enum sai — message thật của backend.
        { field: 'status', message: 'Invalid value. Allowed: [DRAFT, PUBLISHED, ARCHIVED]' },
        { field: 'instructorId', message: 'Instructor id must be a positive number' },
        { field: 'unknownField', message: 'Whatever' },
      ]),
    )
    expect(errors).toEqual({
      name: COURSE_FIELD_MESSAGES.name.tooLong,
      description: COURSE_FIELD_MESSAGES.description.required,
      status: COURSE_FIELD_MESSAGES.status.invalid,
      instructorId: COURSE_FIELD_MESSAGES.instructorId.invalid,
    })
  })
})

describe('lessonApiFieldErrors', () => {
  it('maps a duplicate sort order to the sortOrder field', () => {
    expect(lessonApiFieldErrors({ status: 409, code: 'VRC-409-201', message: '' })).toEqual({
      sortOrder: LESSON_FIELD_MESSAGES.sortOrder.taken,
    })
  })

  it('maps every missing multipart field (real backend response)', () => {
    const errors = lessonApiFieldErrors(
      validationError([
        { field: 'videoFile', message: 'Lesson video file is required' },
        { field: 'instructions', message: 'Lesson instructions are required' },
        { field: 'sortOrder', message: 'Sort order is required' },
        { field: 'documentFile', message: 'Lesson document file is required' },
        { field: 'title', rejectedValue: '', message: 'Lesson title is required' },
      ]),
    )
    expect(errors).toEqual({
      title: LESSON_FIELD_MESSAGES.title.required,
      instructions: LESSON_FIELD_MESSAGES.instructions.required,
      sortOrder: LESSON_FIELD_MESSAGES.sortOrder.required,
      documentFile: LESSON_FIELD_MESSAGES.documentFile.required,
      videoFile: LESSON_FIELD_MESSAGES.videoFile.required,
    })
  })

  it('leaves file type / size errors to the form alert', () => {
    expect(lessonApiFieldErrors({ status: 400, code: 'VRC-400-301', message: '' })).toEqual({})
    expect(lessonApiFieldErrors({ status: 413, code: 'VRC-413-301', message: '' })).toEqual({})
  })
})
