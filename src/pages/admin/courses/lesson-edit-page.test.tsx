import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router'

import { ADMIN_ROUTES, adminLessonEditPath } from '@/constants/routes'
import LessonEditPage from '@/pages/admin/courses/lesson-edit-page'
import { LESSON_FIELD_MESSAGES } from '@/schemas/course-schema'
import { courseService } from '@/services/course-service'
import { COURSE_DETAIL_FIXTURE, LESSON_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { CourseFlashState } from '@/types/course'

function DetailProbe() {
  const state = useLocation().state as CourseFlashState | null
  return <p>Chi tiết: {state?.flash}</p>
}

function renderPage(lessonId = LESSON_FIXTURE.id) {
  return renderRoutes(
    [
      { path: ADMIN_ROUTES.LESSON_EDIT, element: <LessonEditPage /> },
      { path: ADMIN_ROUTES.COURSE_DETAIL, element: <DetailProbe /> },
    ],
    adminLessonEditPath(COURSE_DETAIL_FIXTURE.id, lessonId),
  )
}

describe('LessonEditPage', () => {
  beforeEach(() => {
    vi.spyOn(courseService, 'get').mockResolvedValue(COURSE_DETAIL_FIXTURE)
  })

  afterEach(() => vi.restoreAllMocks())

  it('fills the form and keeps the current files when none is chosen', async () => {
    const user = userEvent.setup()
    const updateLesson = vi
      .spyOn(courseService, 'updateLesson')
      .mockResolvedValue({ ...LESSON_FIXTURE, title: 'Bài mới' })
    renderPage()

    const title = await screen.findByLabelText(/^Tên bài học\s*\*?$/)
    expect(title).toHaveValue(LESSON_FIXTURE.title)
    expect(screen.getByLabelText(/^Thứ tự\s*\*?$/)).toHaveValue('1')
    // File không bắt buộc khi sửa, có ghi file đang dùng.
    expect(screen.getByLabelText('Thay tài liệu')).not.toBeRequired()
    expect(screen.getByText(/Đang dùng: bai-1\.pdf \(2 KB\)/)).toBeInTheDocument()

    await user.clear(title)
    await user.type(title, 'Bài mới')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(updateLesson).toHaveBeenCalledWith(
      7,
      11,
      {
        title: 'Bài mới',
        instructions: LESSON_FIXTURE.instructions,
        sortOrder: 1,
        documentFile: undefined,
        videoUrl: '',
        removeVideo: false,
      },
      expect.any(Function),
    )
    expect(await screen.findByText('Chi tiết: Đã lưu bài học “Bài mới”.')).toBeInTheDocument()
  })

  it('sends the replaced document', async () => {
    const user = userEvent.setup()
    const updateLesson = vi.spyOn(courseService, 'updateLesson').mockResolvedValue(LESSON_FIXTURE)
    const document = new File(['d'], 'moi.pdf', { type: 'application/pdf' })
    renderPage()

    await user.upload(await screen.findByLabelText('Thay tài liệu'), document)
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(updateLesson.mock.calls[0]?.[2]).toMatchObject({ documentFile: document })
    expect(screen.queryByLabelText(/File video/)).not.toBeInTheDocument()
  })

  it('removes the uploaded video when asked', async () => {
    const user = userEvent.setup()
    const updateLesson = vi.spyOn(courseService, 'updateLesson').mockResolvedValue(LESSON_FIXTURE)
    renderPage()

    await user.click(await screen.findByLabelText('Gỡ file video tải lên trước đây (bai-1.mp4)'))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
    expect(updateLesson.mock.calls[0]?.[2]).toMatchObject({ removeVideo: true })
  })

  it('keeps the current video link unless it is cleared', async () => {
    const user = userEvent.setup()
    const updateLesson = vi.spyOn(courseService, 'updateLesson').mockResolvedValue(LESSON_FIXTURE)
    // Bài 12 chỉ có link video, không có file video → không có ô "gỡ video".
    renderPage(12)

    const link = await screen.findByLabelText('Link YouTube')
    expect(link).toHaveValue('https://www.youtube.com/watch?v=abc123')
    expect(screen.queryByLabelText(/^Gỡ file video/)).not.toBeInTheDocument()

    // Link cũ không phải video YouTube hợp lệ → phải thay trước khi lưu.
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
    expect(await screen.findByText(LESSON_FIELD_MESSAGES.videoUrl.invalid)).toBeInTheDocument()
    expect(updateLesson).not.toHaveBeenCalled()

    await user.clear(link)
    await user.type(link, 'https://youtu.be/dQw4w9WgXcQ')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
    expect(updateLesson.mock.calls[0]?.[2]).toMatchObject({
      videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
    })
  })

  it('sends an empty link when the link is cleared', async () => {
    const user = userEvent.setup()
    const updateLesson = vi.spyOn(courseService, 'updateLesson').mockResolvedValue(LESSON_FIXTURE)
    renderPage(12)

    await user.clear(await screen.findByLabelText('Link YouTube'))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
    expect(updateLesson.mock.calls[0]?.[2]).toMatchObject({ videoUrl: '' })
  })

  it('still validates a replaced file type', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderPage()

    await user.upload(await screen.findByLabelText('Thay tài liệu'), new File(['x'], 'virus.exe'))
    expect(await screen.findByText(LESSON_FIELD_MESSAGES.documentFile.type)).toBeInTheDocument()
  })

  it('reports a lesson that is not in the course', async () => {
    renderPage(999)

    expect(await screen.findByText('Bài học không tồn tại hoặc đã bị xoá.')).toBeInTheDocument()
  })
})
