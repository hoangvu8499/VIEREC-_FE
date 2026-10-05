import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ADMIN_ROUTES, adminCoursePath } from '@/constants/routes'
import LessonCreatePage from '@/pages/admin/courses/lesson-create-page'
import { LESSON_FIELD_MESSAGES } from '@/schemas/course-schema'
import { courseService } from '@/services/course-service'
import { COURSE_DETAIL_FIXTURE, LESSON_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'

const DOC = new File(['%PDF'], 'bai-4.pdf', { type: 'application/pdf' })

function renderPage(path = adminCoursePath('LESSON_CREATE', COURSE_DETAIL_FIXTURE.id)) {
  return renderRoutes([{ path: ADMIN_ROUTES.LESSON_CREATE, element: <LessonCreatePage /> }], path)
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText(/^Tên bài học\s*\*?$/), 'Thoát nạn')
  await user.type(screen.getByLabelText(/^Hướng dẫn học\s*\*?$/), 'Đọc tài liệu rồi xem video.')
  await user.upload(screen.getByLabelText(/^Tài liệu\s*\*?$/), DOC)
}

describe('LessonCreatePage', () => {
  beforeEach(() => {
    vi.spyOn(courseService, 'get').mockResolvedValue(COURSE_DETAIL_FIXTURE)
  })

  afterEach(() => vi.restoreAllMocks())

  it('shows the course and suggests the order after the highest one', async () => {
    renderPage()

    expect(await screen.findByText(COURSE_DETAIL_FIXTURE.name)).toBeInTheDocument()
    // Bài hiện có: 1 và 3 → gợi ý 4.
    expect(screen.getByLabelText(/^Thứ tự\s*\*?$/)).toHaveValue('4')
  })

  it('reports a course that does not exist', async () => {
    vi.mocked(courseService.get).mockRejectedValue({
      status: 404,
      code: 'VRC-404-201',
      message: 'Course not found',
    })
    renderPage()

    expect(await screen.findByText('Khoá học không tồn tại hoặc đã bị xoá.')).toBeInTheDocument()
    expect(screen.queryByLabelText(/^Tên bài học/)).not.toBeInTheDocument()
  })

  it('rejects an invalid course id without calling the API', () => {
    renderPage('/admin/khoa-hoc/abc/bai-hoc/tao-moi')

    expect(screen.getByText('Đường dẫn khoá học không hợp lệ')).toBeInTheDocument()
    expect(courseService.get).not.toHaveBeenCalled()
  })

  it('requires the document only and rejects wrong file types before uploading', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const createLesson = vi.spyOn(courseService, 'createLesson')
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Tạo bài học' }))
    expect(await screen.findByText(LESSON_FIELD_MESSAGES.documentFile.required)).toBeInTheDocument()
    expect(screen.queryByText(LESSON_FIELD_MESSAGES.videoUrl.required)).not.toBeInTheDocument()

    await user.upload(screen.getByLabelText(/^Tài liệu\s*\*?$/), new File(['x'], 'bai-giang.exe'))
    expect(await screen.findByText(LESSON_FIELD_MESSAGES.documentFile.type)).toBeInTheDocument()
    expect(createLesson).not.toHaveBeenCalled()
  })

  it('creates a lesson with a YouTube link and refuses other video links', async () => {
    const user = userEvent.setup()
    const createLesson = vi.spyOn(courseService, 'createLesson').mockResolvedValue({
      ...LESSON_FIXTURE,
      videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
      files: LESSON_FIXTURE.files.filter((file) => file.fileType === 'DOCUMENT'),
    })
    renderPage()

    await user.type(await screen.findByLabelText(/^Tên bài học\s*\*?$/), 'Thoát nạn')
    await user.type(screen.getByLabelText(/^Hướng dẫn học\s*\*?$/), 'Xem video.')
    await user.upload(screen.getByLabelText(/^Tài liệu\s*\*?$/), DOC)
    const link = screen.getByLabelText('Link YouTube')
    await user.type(link, 'https://drive.google.com/file/d/xyz/view')
    await user.click(screen.getByRole('button', { name: 'Tạo bài học' }))
    expect(await screen.findByText(LESSON_FIELD_MESSAGES.videoUrl.invalid)).toBeInTheDocument()

    await user.clear(link)
    await user.type(link, 'https://youtu.be/dQw4w9WgXcQ')
    await user.click(screen.getByRole('button', { name: 'Tạo bài học' }))

    expect(createLesson.mock.calls[0]?.[1]).toMatchObject({
      videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
    })
    expect(await screen.findByRole('link', { name: 'Mở link video (tab mới)' })).toHaveAttribute(
      'href',
      'https://youtu.be/dQw4w9WgXcQ',
    )
  })

  it('uploads the lesson, shows the stored files and starts the next one', async () => {
    const user = userEvent.setup()
    const created = { ...LESSON_FIXTURE, id: 13, title: 'Thoát nạn', sortOrder: 4 }
    const createLesson = vi
      .spyOn(courseService, 'createLesson')
      .mockImplementation(async (_courseId, _payload, onProgress) => {
        onProgress?.(100)
        return created
      })
    renderPage()

    await fillForm(user)
    expect(screen.getByText('bai-4.pdf')).toBeInTheDocument()
    // Sau khi tạo, chi tiết khoá được tải lại và có thêm bài 4.
    vi.mocked(courseService.get).mockResolvedValue({
      ...COURSE_DETAIL_FIXTURE,
      lessons: [...COURSE_DETAIL_FIXTURE.lessons, created],
    })
    await user.click(screen.getByRole('button', { name: 'Tạo bài học' }))

    expect(createLesson).toHaveBeenCalledWith(
      7,
      {
        title: 'Thoát nạn',
        instructions: 'Đọc tài liệu rồi xem video.',
        sortOrder: 4,
        documentFile: DOC,
        videoUrl: '',
        removeVideo: false,
      },
      expect.any(Function),
    )
    expect(await screen.findByRole('heading', { name: 'Đã tạo bài học' })).toHaveFocus()
    expect(screen.getByRole('link', { name: 'Mở bai-1.mp4 (tab mới)' })).toHaveAttribute(
      'href',
      `${window.location.origin}/api/v1/files/2`,
    )
    expect(screen.getByRole('link', { name: 'Về trang khoá học' })).toHaveAttribute(
      'href',
      '/admin/khoa-hoc/7',
    )

    await user.click(screen.getByRole('button', { name: 'Thêm bài học tiếp theo' }))
    expect(screen.getByLabelText(/^Tên bài học\s*\*?$/)).toHaveValue('')
    expect(screen.getByLabelText(/^Thứ tự\s*\*?$/)).toHaveValue('5')
  })

  it('marks a duplicate sort order on its field', async () => {
    const user = userEvent.setup()
    vi.spyOn(courseService, 'createLesson').mockRejectedValue({
      status: 409,
      code: 'VRC-409-201',
      message: 'Another lesson of this course already uses this sort order',
    })
    renderPage()

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Tạo bài học' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      LESSON_FIELD_MESSAGES.sortOrder.taken,
    )
    expect(screen.getByLabelText(/^Thứ tự\s*\*?$/)).toHaveFocus()
  })

  it('explains a file type rejected by the server', async () => {
    const user = userEvent.setup()
    vi.spyOn(courseService, 'createLesson').mockRejectedValue({
      status: 400,
      code: 'VRC-400-301',
      message: "File 'x' is not an allowed document type",
    })
    renderPage()

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Tạo bài học' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('File không đúng định dạng.')
  })
})
