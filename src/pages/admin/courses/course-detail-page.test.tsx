import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router'

import { ADMIN_ROUTES, adminCoursePath } from '@/constants/routes'
import CourseDetailPage from '@/pages/admin/courses/course-detail-page'
import { courseService } from '@/services/course-service'
import { COURSE_DETAIL_FIXTURE } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { CourseFlashState } from '@/types/course'

function ListProbe() {
  const state = useLocation().state as CourseFlashState | null
  return <p>Danh sách: {state?.flash}</p>
}

function renderPage() {
  return renderRoutes(
    [
      { path: ADMIN_ROUTES.COURSE_DETAIL, element: <CourseDetailPage /> },
      { path: ADMIN_ROUTES.COURSES, element: <ListProbe /> },
    ],
    adminCoursePath('COURSE_DETAIL', COURSE_DETAIL_FIXTURE.id),
  )
}

describe('CourseDetailPage', () => {
  beforeEach(() => {
    vi.spyOn(courseService, 'get').mockResolvedValue(COURSE_DETAIL_FIXTURE)
  })

  afterEach(() => vi.restoreAllMocks())

  it('shows the course, its lessons in order and their files', async () => {
    renderPage()

    expect(
      await screen.findByRole('heading', { level: 1, name: COURSE_DETAIL_FIXTURE.name }),
    ).toBeInTheDocument()
    expect(screen.getByText('Đã xuất bản')).toBeInTheDocument()
    expect(screen.getByText('Nguyễn Quản Trị')).toBeInTheDocument()

    const lessons = screen.getAllByRole('heading', { level: 3 })
    expect(lessons.map((heading) => heading.textContent)).toEqual([
      'Bài 1: Nhận biết nguy cơ cháy nổ',
      'Bài 3: Sử dụng bình chữa cháy',
    ])
    expect(
      screen.getAllByRole('link', { name: 'Mở tài liệu bai-1.pdf (tab mới)' })[0],
    ).toHaveAttribute('href', `${window.location.origin}/api/v1/files/1`)
    expect(
      screen.getByRole('link', { name: 'Mở link video trên youtube.com (tab mới)' }),
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=abc123')
    // Chỉ bài có file video mới có trình phát.
    expect(screen.getAllByText('Xem video ngay tại đây')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Sửa khoá học' })).toHaveAttribute(
      'href',
      '/admin/khoa-hoc/7/sua',
    )
    expect(screen.getByRole('link', { name: 'Sửa bài Sử dụng bình chữa cháy' })).toHaveAttribute(
      'href',
      '/admin/khoa-hoc/7/bai-hoc/12/sua',
    )
  })

  it('invites to add the first lesson when there is none', async () => {
    vi.mocked(courseService.get).mockResolvedValue({ ...COURSE_DETAIL_FIXTURE, lessons: [] })
    renderPage()

    expect(await screen.findByText('Khoá học chưa có bài học')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Thêm bài học' })).toHaveAttribute(
      'href',
      '/admin/khoa-hoc/7/bai-hoc/tao-moi',
    )
  })

  it('deletes a lesson and reloads the course', async () => {
    const user = userEvent.setup()
    const removeLesson = vi.spyOn(courseService, 'removeLesson').mockResolvedValue()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Xoá bài Sử dụng bình chữa cháy' }))
    const dialog = screen.getByRole('alertdialog', { name: 'Xoá bài học?' })
    expect(dialog).toHaveTextContent('Thứ tự 3 có thể dùng lại')

    vi.mocked(courseService.get).mockResolvedValue({
      ...COURSE_DETAIL_FIXTURE,
      lessons: COURSE_DETAIL_FIXTURE.lessons.slice(0, 1),
    })
    await user.click(within(dialog).getByRole('button', { name: 'Xoá bài học' }))

    expect(removeLesson).toHaveBeenCalledWith(7, 12)
    expect(await screen.findByText('Đã xoá bài học “Sử dụng bình chữa cháy”.')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /Sử dụng bình chữa cháy/ }),
    ).not.toBeInTheDocument()
  })

  it('deletes the course and goes back to the list', async () => {
    const user = userEvent.setup()
    const remove = vi.spyOn(courseService, 'remove').mockResolvedValue()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Xoá' }))
    await user.click(screen.getByRole('button', { name: 'Xoá khoá học' }))

    expect(remove).toHaveBeenCalledWith(7)
    expect(
      await screen.findByText(`Danh sách: Đã xoá khoá học “${COURSE_DETAIL_FIXTURE.name}”.`),
    ).toBeInTheDocument()
  })

  it('reports a deleted course', async () => {
    vi.mocked(courseService.get).mockRejectedValue({
      status: 404,
      code: 'VRC-404-201',
      message: 'Course not found',
    })
    renderPage()

    expect(await screen.findByText('Khoá học không tồn tại hoặc đã bị xoá.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Xoá' })).not.toBeInTheDocument()
  })
})
