import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ADMIN_ROUTES } from '@/constants/routes'
import CoursesPage from '@/pages/admin/courses/courses-page'
import { courseService } from '@/services/course-service'
import { COURSE_FIXTURE, coursePage } from '@/test/fixtures'
import { renderRoutes } from '@/test/render-routes'
import type { Course } from '@/types/course'

function courses(count: number, startId = 1): Course[] {
  return Array.from({ length: count }, (_, index) => ({
    ...COURSE_FIXTURE,
    id: startId + index,
    name: `Khoá học số ${startId + index}`,
  }))
}

function renderPage(entry: Parameters<typeof renderRoutes>[1] = ADMIN_ROUTES.COURSES) {
  return renderRoutes(
    [
      { path: ADMIN_ROUTES.COURSES, element: <CoursesPage /> },
      { path: ADMIN_ROUTES.COURSE_CREATE, element: <p>Trang tạo khoá học</p> },
      { path: ADMIN_ROUTES.LESSON_CREATE, element: <p>Trang tạo bài học</p> },
      { path: ADMIN_ROUTES.COURSE_DETAIL, element: <p>Trang chi tiết khoá học</p> },
      { path: ADMIN_ROUTES.COURSE_EDIT, element: <p>Trang sửa khoá học</p> },
    ],
    entry,
  )
}

describe('CoursesPage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('lists courses with their actions and a link to create one', async () => {
    const list = vi
      .spyOn(courseService, 'list')
      .mockResolvedValue(coursePage([COURSE_FIXTURE], 0, 1))
    renderPage()

    const row = (await screen.findByRole('rowheader', { name: /Phòng cháy chữa cháy cơ bản/ }))
      .parentElement as HTMLElement
    expect(within(row).getByText('Nguyễn Quản Trị')).toBeInTheDocument()
    expect(within(row).getByText('Đã xuất bản')).toBeInTheDocument()
    expect(within(row).getByText('2')).toBeInTheDocument()
    expect(list).toHaveBeenCalledWith({ page: 0, keyword: undefined, status: undefined })

    expect(within(row).getByRole('link', { name: /Xem chi tiết khoá/ })).toHaveAttribute(
      'href',
      '/admin/khoa-hoc/7',
    )
    expect(within(row).getByRole('link', { name: /^Sửa khoá/ })).toHaveAttribute(
      'href',
      '/admin/khoa-hoc/7/sua',
    )
    expect(screen.getAllByRole('link', { name: /Thêm khoá học/ })[0]).toHaveAttribute(
      'href',
      ADMIN_ROUTES.COURSE_CREATE,
    )
  })

  it('opens the lesson form of a course', async () => {
    const user = userEvent.setup()
    vi.spyOn(courseService, 'list').mockResolvedValue(coursePage([COURSE_FIXTURE]))
    renderPage()

    await user.click(
      await screen.findByRole('link', {
        name: 'Thêm bài học cho khoá Phòng cháy chữa cháy cơ bản',
      }),
    )
    expect(screen.getByText('Trang tạo bài học')).toBeInTheDocument()
  })

  it('pages through the list and keeps the page in the URL', async () => {
    const user = userEvent.setup()
    const list = vi
      .spyOn(courseService, 'list')
      .mockImplementation(async ({ page = 0 } = {}) =>
        coursePage(page === 0 ? courses(10) : courses(3, 11), page, 13),
      )
    const { router } = renderPage()

    expect(await screen.findByText('Khoá học số 1')).toBeInTheDocument()
    expect(screen.getByText(/Hiển thị 1–10 trong/)).toHaveTextContent('13 khoá học')

    const pagination = screen.getByRole('navigation', { name: 'Phân trang khoá học' })
    expect(within(pagination).getByRole('button', { name: 'Trang trước' })).toBeDisabled()
    await user.click(within(pagination).getByRole('button', { name: 'Trang 2' }))

    expect(await screen.findByText('Khoá học số 11')).toBeInTheDocument()
    expect(screen.getByText(/Hiển thị 11–13 trong/)).toBeInTheDocument()
    expect(list).toHaveBeenLastCalledWith({ page: 1, keyword: undefined, status: undefined })
    expect(router.state.location.search).toBe('?trang=2')
    expect(within(pagination).getByRole('button', { name: 'Trang 2' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('searches by name and filters by status from the first page', async () => {
    const user = userEvent.setup()
    const list = vi.spyOn(courseService, 'list').mockResolvedValue(coursePage(courses(1)))
    const { router } = renderPage(`${ADMIN_ROUTES.COURSES}?trang=3`)

    await screen.findByText('Khoá học số 1')
    await user.type(screen.getByLabelText('Tìm theo tên khoá học'), '  pccc {Enter}')
    await screen.findByDisplayValue('pccc')
    expect(list).toHaveBeenLastCalledWith({ page: 0, keyword: 'pccc', status: undefined })

    await user.selectOptions(screen.getByLabelText('Trạng thái'), 'Bản nháp')
    expect(list).toHaveBeenLastCalledWith({ page: 0, keyword: 'pccc', status: 'DRAFT' })
    expect(router.state.location.search).toBe('?q=pccc&trang-thai=DRAFT')

    await user.click(screen.getByRole('button', { name: 'Xoá lọc' }))
    expect(list).toHaveBeenLastCalledWith({ page: 0, keyword: undefined, status: undefined })
  })

  it('shows an empty state with a create button when there is no course', async () => {
    vi.spyOn(courseService, 'list').mockResolvedValue(coursePage([]))
    renderPage()

    expect(await screen.findByText('Chưa có khoá học nào')).toBeInTheDocument()
  })

  it('says nothing matched when filters return no course', async () => {
    vi.spyOn(courseService, 'list').mockResolvedValue(coursePage([]))
    renderPage(`${ADMIN_ROUTES.COURSES}?q=abc`)

    expect(await screen.findByText('Không tìm thấy khoá học phù hợp')).toBeInTheDocument()
  })

  it('shows an error with a retry button', async () => {
    const user = userEvent.setup()
    const list = vi
      .spyOn(courseService, 'list')
      .mockRejectedValueOnce({ status: 500, message: 'boom' })
      .mockResolvedValueOnce(coursePage([COURSE_FIXTURE]))
    renderPage()

    expect(
      await screen.findByText('Hệ thống đang gặp sự cố. Vui lòng thử lại sau.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByText('Phòng cháy chữa cháy cơ bản')).toBeInTheDocument()
    expect(list).toHaveBeenCalledTimes(2)
  })

  it('shows a message passed from another page', async () => {
    vi.spyOn(courseService, 'list').mockResolvedValue(coursePage([COURSE_FIXTURE]))
    renderPage({ pathname: ADMIN_ROUTES.COURSES, state: { flash: 'Đã xoá khoá học “A”.' } })

    expect(screen.getByText('Đã xoá khoá học “A”.')).toBeInTheDocument()
  })

  it('deletes a course after confirmation', async () => {
    const user = userEvent.setup()
    const list = vi
      .spyOn(courseService, 'list')
      .mockResolvedValueOnce(coursePage([COURSE_FIXTURE]))
      .mockResolvedValue(coursePage([]))
    const remove = vi.spyOn(courseService, 'remove').mockResolvedValue()
    renderPage()

    await user.click(await screen.findByRole('button', { name: `Xoá khoá ${COURSE_FIXTURE.name}` }))
    const dialog = screen.getByRole('alertdialog', { name: 'Xoá khoá học?' })
    expect(within(dialog).getByRole('button', { name: 'Huỷ' })).toHaveFocus()

    await user.click(within(dialog).getByRole('button', { name: 'Xoá khoá học' }))

    expect(remove).toHaveBeenCalledWith(COURSE_FIXTURE.id)
    expect(await screen.findByText(`Đã xoá khoá học “${COURSE_FIXTURE.name}”.`)).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(await screen.findByText('Chưa có khoá học nào')).toBeInTheDocument()
    expect(list).toHaveBeenCalledTimes(2)
  })

  it('keeps the dialog open with a message when deletion fails, and Esc cancels', async () => {
    const user = userEvent.setup()
    vi.spyOn(courseService, 'list').mockResolvedValue(coursePage([COURSE_FIXTURE]))
    vi.spyOn(courseService, 'remove').mockRejectedValue({
      status: 404,
      code: 'VRC-404-201',
      message: 'Course not found',
    })
    renderPage()

    await user.click(await screen.findByRole('button', { name: `Xoá khoá ${COURSE_FIXTURE.name}` }))
    await user.click(screen.getByRole('button', { name: 'Xoá khoá học' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Khoá học không tồn tại hoặc đã bị xoá.',
    )
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
